// 🕌 MuslimProSync — Horarios de oración EXACTOS de Muslim Pro (v27)
//
// Objetivo: que Quba muestre los MISMOS horarios que Muslim Pro, minuto a
// minuto, sin diferencia de ni un minuto, en cualquier país.
//
// Cómo se logra (verificado empíricamente 2026-09-05 en 7 países):
//   • Muslim Pro NO expone una API pública; su web incrusta los horarios
//     PRE-CALCULADOS de cada ciudad en el HTML de la página
//     (campo "prayer_times" del payload de la página), con su convención por
//     defecto (MWL en la mayoría de países; EGYPTBIS p. ej. en Jordania).
//   • Este módulo obtiene esos mismos números: son idénticos por construcción,
//     no por aproximación de método de cálculo.
//
// Cadena de obtención (en orden):
//   1) Proxy backend Cloudflare Worker  GET {PROXY}/prayer-times?lat&lng&date
//      → sin problemas de CORS, con caché KV compartida (6 h por día, 30 días
//      el slug de ciudad). Es la vía principal en navegador.
//   2) Acceso directo a muslimpro.com (entornos sin CORS estricto: WebView,
//      Capacitor, extensiones): resuelve la ciudad vía Nominatim + búsqueda
//      DuckDuckGo del slug oficial y parsea la página.
//   Si ambas fallan → devuelve null y API.getPrayerTimes sigue con Aladhan
//   (comportamiento anterior intacto) y luego con el cálculo offline local.
//
// Bonus offline: cada página de Muslim Pro trae 7 días; se cachean todos con
// las mismas claves `prayer_*` que usa API, así la app sigue mostrando los
// horarios EXACTOS de Muslim Pro aunque el usuario pierda conexión.

const MuslimProSync = {
  MP_BASE: 'https://www.muslimpro.com',
  NAMES: ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
  SLUG_TTL: 30 * 24 * 60 * 60 * 1000, // 30 días

  /**
   * Devuelve objeto con la misma forma que la respuesta de Aladhan
   * ({ timings, date, meta, ... }) o null si Muslim Pro no está disponible.
   */
  async getTimings(lat, lng, date = new Date(), method = 3) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const iso = `${yyyy}-${mm}-${dd}`;

    // ── 1) Proxy backend (recomendado: evita CORS y rate limits) ──
    const proxy = (typeof CONFIG !== 'undefined' && CONFIG.API && CONFIG.API.PROXY) || '';
    if (proxy) {
      try {
        const res = await fetch(
          `${proxy}/prayer-times?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&date=${dd}-${mm}-${yyyy}`
        );
        if (res.ok) {
          const j = await res.json();
          if (j && j.timings && j.timings.Fajr) {
            return this._toData(j.timings, j.date || iso);
          }
        }
      } catch (_) { /* sigue con la vía directa */ }
    }

    // ── 2) Acceso directo a muslimpro.com ──
    try {
      const slug = await this._resolveSlug(lat, lng);
      if (!slug) return null;
      const res = await fetch(`${this.MP_BASE}/${slug}`);
      if (!res.ok) return null;
      const html = await res.text();
      const days = this._parsePage(html);

      // Cachear la semana completa publicada → offline idéntico a Muslim Pro
      if (typeof Storage !== 'undefined' && typeof CONFIG !== 'undefined') {
        for (const [d, t] of Object.entries(days)) {
          const [y2, m2, d2] = d.split('-');
          const key = `prayer_${lat.toFixed(2)}_${lng.toFixed(2)}_${d2}-${m2}-${y2}_${method}`;
          if (!Storage.get(key)) {
            Storage.set(key, this._toData(t, d), CONFIG.CACHE_TTL * 14);
          }
        }
      }

      const t = days[iso];
      return t ? this._toData(t, iso) : null;
    } catch (_) {
      return null;
    }
  },

  /**
   * Parsea el HTML de una página de ciudad de Muslim Pro y devuelve
   * { 'YYYY-MM-DD': { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha }, ... }
   * NOTA: esta regex es INTENCIONADAMENTE idéntica a la del Worker
   * (backend/cloudflare-worker.js → parseMpPage). Mantenerlas en sincronía.
   */
  _parsePage(html) {
    const days = {};
    const re = /\{\\"date\\":\\"(\d{4}-\d{2}-\d{2})\\",\\"times\\":\[(.*?)\]/g;
    let m;
    while ((m = re.exec(html))) {
      const parts = m[2].match(/\\"([^\\"]*)\\"/g) || [];
      const t = parts.map((p) => p.replace(/\\"/g, ''));
      if (t.length >= 6) {
        const o = {};
        this.NAMES.forEach((n, i) => { o[n] = this._to24h(t[i]); });
        days[m[1]] = o;
      }
    }
    return days;
  },

  _to24h(t) {
    const [h, m] = String(t).trim().split(':');
    return `${String(parseInt(h, 10)).padStart(2, '0')}:${String(parseInt(m || '0', 10)).padStart(2, '0')}`;
  },

  /**
   * Resuelve el slug oficial de Muslim Pro para unas coordenadas:
   *   coords → (Nominatim) → ciudad/país → (DuckDuckGo) → URL oficial MP.
   * El slug se cachea 30 días (no cambia para una misma ciudad).
   */
  async _resolveSlug(lat, lng) {
    const ck = `mpslug_${lat.toFixed(2)}_${lng.toFixed(2)}`;
    if (typeof Storage !== 'undefined') {
      const cached = Storage.get(ck);
      if (cached) return cached;
    }
    const g = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
    );
    if (!g.ok) return null;
    const a = (await g.json()).address || {};
    const city = a.city || a.town || a.village || a.county || '';
    if (!city) return null;

    const q = encodeURIComponent(`muslimpro prayer times ${city} ${a.country || ''}`);
    const r = await fetch(`https://html.duckduckgo.com/html/?q=${q}`);
    if (!r.ok) return null;
    let html = await r.text();
    try { html = decodeURIComponent(html); } catch (_) { /* usar html crudo */ }
    const m = html.match(
      /muslimpro\.com\/((?:[a-z]{2}\/prayer-times\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/\d+)|(?:Prayer-times-[A-Za-z0-9-]+-\d+))/i
    );
    const slug = m ? m[1] : null;
    if (slug && typeof Storage !== 'undefined') Storage.set(ck, slug, this.SLUG_TTL);
    return slug;
  },

  /** Da al resultado la misma forma que una respuesta de Aladhan. */
  _toData(timings, iso) {
    const [yyyy, mm, dd] = iso.split('-');
    return {
      timings,
      date: {
        readable: `${dd}-${mm}-${yyyy}`,
        gregorian: { date: `${dd}-${mm}-${yyyy}`, day: dd },
      },
      meta: { method: 'Muslim Pro (espejo exacto)' },
      _source: 'muslimpro',
    };
  },
};

if (typeof window !== 'undefined') {
  window.MuslimProSync = MuslimProSync;
}
