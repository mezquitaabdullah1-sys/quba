// 📖 Traducción comentada del Corán — Lic. M. Isa García (Bogotá, 2013)
//
// Fuente autorizada por el usuario: PDF "El Corán — Traducción comentada"
// (48416Updated_At_1775150572.pdf). Contiene las 114 suras extraídas del PDF:
//   • data/garcia/{n}.json        → traducción de las aleyas  [{ayah, text}]
//   • data/garcia_notes/{n}.json  → comentarios del traductor [{ayah, text}]
//     (las notas al pie de cada página, asignadas a su aleya)
//
// Es la TRADUCCIÓN ESPAÑOLA PREDETERMINADA de la app (100% offline, sin API):
//   • La sustituye a 'es.cortes' como default en AppState.settings.translation.
//   • El texto de las aleyas se inyecta en la sura descargada (árabe + audio
//     siguen viniendo de la API, solo se reemplaza la traducción ES).
//   • La Basmala traducida por García se muestra bajo la Basmala árabe:
//       "En el nombre de Dios, el Compasivo, el Misericordioso"
//     (en Al-Fátihah es la aleya 1 completa de esta edición).
//
// El Tafsir en español usa por defecto estos comentarios de García; en los
// ajustes del lector puede volverse al tafsir anterior (Mokhtasar, CDN).
//
// Cache: IndexedDB (permanente) vía CacheDB + memoria. Cada sura se pide una
// sola vez (fetch del JSON local ~10 KB) y queda disponible offline.

const GarciaData = {
  // Basmala de esta edición (encabezado de cada sura, salvo At-Tawbah)
  BASMALA: 'En el nombre de Dios, el Compasivo, el Misericordioso',

  _mem: { tr: {}, nt: {} },

  _idbKey(kind, surah) { return `garcia_${kind}_v1_${surah}`; },

  async _idbGet(key) {
    if (typeof CacheDB === 'undefined') return null;
    try { return await CacheDB.get(key); } catch (e) { return null; }
  },

  async _idbSet(key, val) {
    if (typeof CacheDB === 'undefined') return;
    try { await CacheDB.set(key, val, null); } catch (e) { /* silencioso */ }
  },

  // base URL relativa a index.html (los JSON van incluidos en el bundle)
  async _load(kind, surahNum) {
    const n = Number(surahNum);
    if (!n || n < 1 || n > 114) return null;
    if (this._mem[kind][n]) return this._mem[kind][n];

    const cached = await this._idbGet(this._idbKey(kind, n));
    if (Array.isArray(cached) && cached.length) {
      this._mem[kind][n] = cached;
      return cached;
    }

    const dir = kind === 'tr' ? 'garcia' : 'garcia_notes';
    try {
      const res = await fetch(`data/${dir}/${n}.json`, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const list = await res.json();
      if (!Array.isArray(list) || !list.length) throw new Error('empty');
      this._idbSet(this._idbKey(kind, n), list);
      this._mem[kind][n] = list;
      return list;
    } catch (e) {
      return null; // offline antes de la 1ª lectura: el llamador hace fallback
    }
  },

  /** Traducción de una sura completa → mapa {ayah: texto}. */
  async getSurahTranslation(surahNum) {
    const list = await this._load('tr', surahNum);
    if (!list) return null;
    const map = {};
    list.forEach(e => { map[Number(e.ayah)] = e.text; });
    return map;
  },

  /** Traducción de una aleya concreta ('' si no existe). */
  async getAyah(surahNum, ayahNum) {
    const map = await this.getSurahTranslation(surahNum);
    return (map && map[Number(ayahNum)]) || '';
  },

  /** Comentarios de García asociados a una aleya ('' si no hay). */
  async getNote(surahNum, ayahNum) {
    const list = await this._load('nt', surahNum);
    if (!list) return '';
    const entry = list.find(e => Number(e.ayah) === Number(ayahNum));
    return entry ? entry.text : '';
  },
};

if (typeof window !== 'undefined') {
  window.GarciaData = GarciaData;
}
