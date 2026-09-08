// 🕋➕ Horario dual — Franja compacta de oraciones de una ciudad secundaria
// debajo de la tabla de horarios principal en la pantalla de inicio.
//
// • El horario PRINCIPAL sigue siendo el de siempre (ubicación del usuario).
// • El SECUNDARIO es opcional: sin ciudad configurada muestra un botón «+»
//   que abre el selector con buscador (Cities.openPicker).
// • Con ciudad: muestra los 6 horarios en miniatura, el nombre de la ciudad,
//   y botones para cambiar (✎) o quitar (×). Toca la franja para cambiar.
// • Ajustes en el perfil (sección «Horario secundario»): cambiar / quitar.
//
// Cálculo (v35): MISMA cadena de fuentes que el horario principal —
//   1) Muslim Pro (espejo exacto, minuto a minuto, como la tabla principal),
//   2) Aladhan (con el método de cálculo elegido por el usuario),
//   3) PrayerCalc (motor astronómico offline) solo como respaldo sin red.
// Con Muslim Pro/Aladhan la hora ya viene en el huso de la ciudad (sus APIs
// la resuelven por coordenadas). Solo el respaldo offline se compensa con la
// diferencia real entre el huso de la ciudad secundaria y el del dispositivo,
// de modo que la franja muestra siempre la HORA LOCAL de la ciudad elegida.
const DualTiming = {
  /** Ciudad secundaria configurada (o null) */
  getCity() {
    try {
      const id = AppState.settings && AppState.settings.secondaryCityId;
      if (!id || typeof Cities === 'undefined') return null;
      return Cities.byId(id);
    } catch (e) { return null; }
  },

  setCity(city) {
    AppState.settings.secondaryCityId = city ? city.id : null;
    Storage.saveSettings();
  },

  /** Abre el selector de ciudad con buscador y guarda la elección */
  openPicker() {
    Cities.openPicker({
      title: t('secondaryTiming') || 'Horario secundario',
      currentId: AppState.settings.secondaryCityId,
      onSelect: (city) => {
        this.setCity(city);
        showToast(Cities.label(city), 2000);
        HomePage.render(document.getElementById('main-content'));
      },
    });
  },

  remove() {
    this.setCity(null);
    showToast(t('secondaryRemoved') || 'Horario secundario eliminado', 1800);
    HomePage.render(document.getElementById('main-content'));
  },

  /** Cachea la respuesta (misma clave `prayer_*` que API) para uso offline. */
  _cache(city, date, method, data) {
    try {
      if (typeof Storage === 'undefined' || typeof CONFIG === 'undefined') return;
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const key = `prayer_${city.lat.toFixed(2)}_${city.lon.toFixed(2)}_${dd}-${mm}-${date.getFullYear()}_${method}`;
      if (!Storage.get(key)) Storage.set(key, data, CONFIG.CACHE_TTL * 14);
    } catch (e) { /* silencioso */ }
  },

  /**
   * Desplazamiento en milisegundos entre el huso de la ciudad y el del
   * dispositivo. Usa Intl para obtener el instante "de pared" en cada huso
   * (incluye DST vigente en ambos) y resta.
   */
  _tzOffsetMs(tz, date) {
    try {
      const wall = (zone) => {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: zone, hour12: false,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        }).formatToParts(date).reduce((o, p) => { o[p.type] = p.value; return o; }, {});
        return Date.UTC(+parts.year, +parts.month - 1, +parts.day,
                        +parts.hour % 24, +parts.minute, +parts.second);
      };
      return wall(tz) - wall(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (e) {
      // Fallback aproximado por longitud si la zona IANA no existe
      return 0;
    }
  },

  /** Desplaza una cadena "HH:MM" en `deltaMin` minutos (sin mutar nada) */
  _shiftTimeStr(s, deltaMin) {
    if (!s || !s.includes(':') || !deltaMin) return s;
    const [hh, mm] = s.split(' ')[0].split(':').map(Number);
    if (isNaN(hh) || isNaN(mm)) return s;
    const total = ((hh * 60 + mm + deltaMin) % 1440 + 1440) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  },

  /**
   * Horarios OFFLINE en la HORA LOCAL de la ciudad secundaria (respaldo).
   * 1) Se pide a PrayerCalc el día "de pared" de la ciudad (now + offset),
   *    lo que fija la fecha correcta para el cálculo solar.
   * 2) Como PrayerCalc devuelve horas en el huso del DISPOSITIVO, el
   *    resultado se desplaza en la diferencia real (ciudad − dispositivo),
   *    con lo que la franja muestra siempre la hora local de la ciudad.
   */
  _getOfflineTimings(city) {
    if (!city || typeof PrayerCalc === 'undefined') return null;
    const tz = this._tzFor(city);
    const now = new Date();
    const offset = tz ? this._tzOffsetMs(tz, now) : 0;
    const shifted = new Date(now.getTime() + offset);
    const method = AppState.settings.calculationMethod || 3;
    const raw = PrayerCalc.getTimings(city.lat, city.lon, shifted, method);
    const deltaMin = Math.round(offset / 60000);
    const out = {};
    for (const key of Object.keys(raw)) out[key] = this._shiftTimeStr(raw[key], deltaMin);
    out._estimated = true;
    return out;
  },

  /**
   * v35: horarios de la ciudad secundaria con la MISMA precisión que el
   * horario principal:
   *   1) caché `prayer_*` compartida con API (también la rellena
   *      MuslimProSync con su semana de 7 días),
   *   2) Muslim Pro (espejo exacto) — su API devuelve la hora local de la
   *      ciudad; se normaliza a 24h y se guarda en caché,
   *   3) Aladhan por coordenadas con el método elegido (hora local),
   *   4) respaldo offline PrayerCalc (compensado al huso de la ciudad).
   */
  async getTimings(city) {
    if (!city) return null;
    const method = AppState.settings.calculationMethod || 3;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const cacheKey = `prayer_${city.lat.toFixed(2)}_${city.lon.toFixed(2)}_${dd}-${mm}-${yyyy}_${method}`;

    // 1) Caché compartida con el horario principal
    try {
      const cached = (typeof Storage !== 'undefined') && Storage.get(cacheKey);
      if (cached && cached.timings && cached.timings.Fajr) {
        const out = {};
        for (const n of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
          out[n] = String(cached.timings[n] || '').split(' ')[0];
        }
        return out;
      }
    } catch (e) { /* sigue */ }

    if (navigator.onLine) {
      // 2) Muslim Pro (idéntico al sistema del horario principal)
      if (typeof MuslimProSync !== 'undefined') {
        try {
          const mp = await MuslimProSync.getTimings(city.lat, city.lon, now, method);
          if (mp && mp.timings && mp.timings.Fajr) {
            this._cache(city, now, method, mp);
            const out = {};
            for (const n of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
              out[n] = String(mp.timings[n] || '').split(' ')[0];
            }
            return out;
          }
        } catch (e) { /* sigue con Aladhan */ }
      }
      // 3) Aladhan por coordenadas (hora local de la ciudad, método elegido)
      if (typeof API !== 'undefined' && API._fetchWithTimeout) {
        try {
          const url = `${CONFIG.API.ALADHAN}/timings/${dd}-${mm}-${yyyy}?latitude=${city.lat}&longitude=${city.lon}&method=${method}`;
          const res = await API._fetchWithTimeout(url, 8000);
          if (res.ok) {
            const json = await res.json();
            if (json.code === 200 && json.data && json.data.timings) {
              this._cache(city, now, method, json.data);
              const out = {};
              for (const n of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
                out[n] = String(json.data.timings[n] || '').split(' ')[0];
              }
              return out;
            }
          }
        } catch (e) { /* respaldo offline */ }
      }
    }

    // 4) Respaldo 100% offline (compensado al huso de la ciudad)
    return this._getOfflineTimings(city);
  },

  /** Zona horaria IANA aproximada según la longitud (suficiente para la franja) */
  _tzFor(city) {
    // Mapa de ciudades con DST/zonas no triviales; el resto se deduce por país
    const TZ = {
      // América Latina
      havana: 'America/Havana', mexico_city: 'America/Mexico_City',
      guadalajara: 'America/Mexico_City', monterrey: 'America/Monterrey',
      bogota: 'America/Bogota', medellin: 'America/Bogota', cali: 'America/Bogota',
      buenos_aires: 'America/Argentina/Buenos_Aires', cordoba_ar: 'America/Argentina/Cordoba',
      santiago: 'America/Santiago', lima: 'America/Lima',
      sao_paulo: 'America/Sao_Paulo', rio: 'America/Sao_Paulo', brasilia: 'America/Sao_Paulo',
      caracas: 'America/Caracas', quito: 'America/Guayaquil', guayaquil: 'America/Guayaquil',
      la_paz: 'America/La_Paz', asuncion: 'America/Asuncion', montevideo: 'America/Montevideo',
      panama: 'America/Panama', san_jose_cr: 'America/Costa_Rica',
      san_salvador: 'America/El_Salvador', guatemala: 'America/Guatemala',
      tegucigalpa: 'America/Tegucigalpa', managua: 'America/Managua',
      santo_domingo: 'America/Santo_Domingo', san_juan: 'America/Puerto_Rico',
      kingston: 'America/Jamaica', port_au_prince: 'America/Port-au-Prince',
      // Europa
      madrid: 'Europe/Madrid', barcelona: 'Europe/Madrid', paris: 'Europe/Paris',
      marseille: 'Europe/Paris', london: 'Europe/London', birmingham: 'Europe/London',
      berlin: 'Europe/Berlin', frankfurt: 'Europe/Berlin', rome: 'Europe/Rome',
      milan: 'Europe/Rome', amsterdam: 'Europe/Amsterdam', brussels: 'Europe/Brussels',
      stockholm: 'Europe/Stockholm', oslo: 'Europe/Oslo', copenhagen: 'Europe/Copenhagen',
      vienna: 'Europe/Vienna', zurich: 'Europe/Zurich', geneva: 'Europe/Zurich',
      lisbon: 'Europe/Lisbon', athens: 'Europe/Athens', warsaw: 'Europe/Warsaw',
      dublin: 'Europe/Dublin', istanbul: 'Europe/Istanbul', ankara: 'Europe/Istanbul',
      moscow: 'Europe/Moscow', sarajevo: 'Europe/Sarajevo',
      // EE. UU. / Canadá
      new_york: 'America/New_York', los_angeles: 'America/Los_Angeles',
      chicago: 'America/Chicago', houston: 'America/Chicago', miami: 'America/New_York',
      washington: 'America/New_York', detroit: 'America/Detroit', boston: 'America/New_York',
      san_francisco: 'America/Los_Angeles', atlanta: 'America/New_York',
      toronto: 'America/Toronto', montreal: 'America/Toronto',
      // Jordania / Palestina / Golfo
      amman: 'Asia/Amman', irbid: 'Asia/Amman', zarqa: 'Asia/Amman', aqaba: 'Asia/Amman',
      jerusalem: 'Asia/Jerusalem', gaza: 'Asia/Gaza', ramallah: 'Asia/Hebron',
      nablus: 'Asia/Hebron', hebron: 'Asia/Hebron', jaffa: 'Asia/Jerusalem', haifa: 'Asia/Jerusalem',
      mecca: 'Asia/Riyadh', medina: 'Asia/Riyadh', riyadh: 'Asia/Riyadh',
      jeddah: 'Asia/Riyadh', dammam: 'Asia/Riyadh', doha: 'Asia/Qatar',
      abu_dhabi: 'Asia/Dubai', dubai: 'Asia/Dubai', sharjah: 'Asia/Dubai',
      kuwait: 'Asia/Kuwait', manama: 'Asia/Bahrain', muscat: 'Asia/Muscat',
      cairo: 'Africa/Cairo',
    };
    return TZ[city.id] || null;
  },

  /**
   * HTML de la franja. Se inserta justo debajo de la tabla principal.
   * Sin ciudad → botón «+». Con ciudad → horarios + acciones.
   */
  render() {
    const city = this.getCity();

    if (!city) {
      return `
        <button class="dual-strip dual-strip-empty" onclick="DualTiming.openPicker()"
                aria-label="${escapeAttr(t('addSecondaryTiming') || 'Añadir horario de otra ciudad')}">
          <span class="dual-strip-plus"><i class="fas fa-plus"></i></span>
          <span class="dual-strip-hint">${t('addSecondaryTiming') || 'Añadir horario de otra ciudad'}</span>
        </button>
      `;
    }

    // v35: pintado instantáneo con el motor offline; en cuanto llegan los
    // horarios EXACTOS (Muslim Pro / Aladhan — mismo sistema que el horario
    // principal) se reemplazan las celdas. Sin red queda el cálculo local.
    const local = this._getOfflineTimings(city);
    const html = this._stripHtml(city, local, !!(local && local._estimated));

    if (navigator.onLine) {
      this.getTimings(city).then(remote => {
        if (!remote) return;
        let changed = !local;
        if (local) {
          for (const n of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
            if (String(local[n] || '') !== String(remote[n] || '')) { changed = true; break; }
          }
        }
        if (changed) {
          const strip = document.querySelector('.dual-strip');
          if (strip && strip.parentNode) strip.outerHTML = this._stripHtml(city, remote, false);
        }
      }).catch(() => {});
    }
    return html;
  },

  /** HTML de la franja con ciudad configurada. */
  _stripHtml(city, timings, estimated) {
    const names = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const cells = timings ? names.map(n => `
      <div class="dual-cell">
        <div class="dual-cell-name">${t('prayers.' + n)}</div>
        <div class="dual-cell-time">${formatTime12h((timings[n] || '--:--').split(' ')[0])}</div>
      </div>`).join('') : '';

    return `
      <div class="dual-strip" role="group" aria-label="${escapeAttr(t('secondaryTiming') || 'Horario secundario')}">
        <div class="dual-strip-head">
          <div class="dual-strip-city" onclick="DualTiming.openPicker()" title="${escapeAttr(t('changeCity') || 'Cambiar ciudad')}">
            <i class="fas fa-location-dot"></i>
            <span>${escapeHtml(Cities.plainName(city))}</span>
            <span class="dual-strip-country">${escapeHtml(Cities.plainCountry(city))}</span>
            ${estimated ? `<span class="dual-strip-est" title="${escapeAttr(t('estimatedTimes') || '')}"><i class="fas fa-wifi-slash"></i></span>` : ''}
          </div>
          <div class="dual-strip-actions">
            <button class="dual-action-btn" onclick="DualTiming.openPicker()" aria-label="${escapeAttr(t('changeCity') || 'Cambiar ciudad')}">
              <i class="fas fa-pen"></i>
            </button>
            <button class="dual-action-btn dual-action-remove" onclick="DualTiming.remove()" aria-label="${escapeAttr(t('removeSecondary') || 'Quitar')}">
              <i class="fas fa-xmark"></i>
            </button>
          </div>
        </div>
        <div class="dual-strip-times">${cells}</div>
      </div>
    `;
  },
};

if (typeof window !== 'undefined') {
  window.DualTiming = DualTiming;
}
