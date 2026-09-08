// ⚙️ Configuración global (v20: variables de entorno)
//
// REGLA DE ORO: este archivo se sirve al navegador → SOLO valores PÚBLICOS.
//   • Variables de cliente: prefijo QUBA_PUBLIC_*, generadas en js/env.public.js
//     por `npm run env` (build/inject-env.js) a partir de .env / process.env.
//   • Secretos de servidor (DB passwords, API keys privadas, JWT secrets, REDIS_URL):
//     viven SOLO en el backend (Worker secrets / Redis / process.env del servidor)
//     y NUNCA deben aparecer aquí ni en ningún bundle del frontend.
//     build/check-secrets.js falla el build si detecta alguno.

const ENV = (typeof window !== 'undefined' && window.QUBA_ENV) || {};
const env = (key, fallback) =>
  ENV[key] !== undefined && ENV[key] !== '' ? ENV[key] : fallback;

const CONFIG = {
  KAABA: { lat: 21.4225, lng: 39.8262 },

  // v35: métodos de cálculo trilingües {es, ar, en} — el nombre se resuelve
  // con CONFIG.methodName(id), que elige según el idioma activo de la app.
  CALCULATION_METHODS: {
    2:  { es: 'ISNA (Norteamérica)',            ar: 'ISNA (أمريكا الشمالية)',      en: 'ISNA (North America)' },
    3:  { es: 'Liga Mundial Musulmana',         ar: 'رابطة العالم الإسلامي',       en: 'Muslim World League' },
    4:  { es: 'Umm Al-Qura (La Meca)',          ar: 'أم القرى (مكة المكرمة)',      en: 'Umm Al-Qura (Makkah)' },
    5:  { es: 'Autoridad General de Egipto',    ar: 'الهيئة المصرية العامة للمساحة', en: 'Egyptian General Authority' },
    8:  { es: 'Región del Golfo',               ar: 'منطقة الخليج',                en: 'Gulf Region' },
    12: { es: 'UOIF (Europa)',                  ar: 'UOIF (أوروبا)',               en: 'UOIF (Europe)' },
    13: { es: 'Diyanet (Turquía)',              ar: 'الشؤون الدينية (تركيا)',      en: 'Diyanet (Türkiye)' },
    14: { es: 'Espiritualidad Islámica España', ar: 'الروحانية الإسلامية (إسبانيا)', en: 'Islamic Spirituality Spain' },
  },

  /** Nombre del método de cálculo según el idioma activo (fallback ES). */
  methodName(id) {
    const m = this.CALCULATION_METHODS[id];
    if (!m) return '—';
    if (typeof m === 'string') return m; // compat. con versiones anteriores
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    return m[loc] || m.es || m.en || '';
  },

  // Recitadores disponibles (Mishary Alafasy removido completamente)
  // v35: nombres/países trilingües — nameAr/countryAr (árabe),
  // nameEn/countryEn (inglés); name/country quedan como español (default).
  RECITERS: [
    { id: 'ar.abdurrahmaansudais', name: 'Abdurrahman As-Sudais', nameAr: 'عبد الرحمن السديس', nameEn: 'Abdul Rahman Al-Sudais', country: 'Arabia Saudí', countryAr: 'السعودية', countryEn: 'Saudi Arabia' },
    { id: 'ar.mahermuaiqly',       name: 'Maher Al-Muaiqly',      nameAr: 'ماهر المعيقلي',     nameEn: 'Maher Al-Muaiqly',        country: 'Arabia Saudí', countryAr: 'السعودية', countryEn: 'Saudi Arabia' },
    { id: 'ar.husary',             name: 'Mahmoud Khalil Al-Husary', nameAr: 'محمود خليل الحصري', nameEn: 'Mahmoud Khalil Al-Husary', country: 'Egipto', countryAr: 'مصر', countryEn: 'Egypt' },
    { id: 'ar.saadalghamdi',       name: 'Saad Al-Ghamdi',        nameAr: 'سعد الغامدي',       nameEn: 'Saad Al-Ghamdi',          country: 'Arabia Saudí', countryAr: 'السعودية', countryEn: 'Saudi Arabia' },
    { id: 'ar.minshawi',           name: 'Mohamed Siddiq El-Minshawi', nameAr: 'محمد صديق المنشاوي', nameEn: 'Mohamed Siddiq El-Minshawi', country: 'Egipto', countryAr: 'مصر', countryEn: 'Egypt' },
    { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', nameAr: 'عبد الباسط عبد الصمد (مرتل)', nameEn: 'Abdul Basit (Murattal)', country: 'Egipto', countryAr: 'مصر', countryEn: 'Egypt' },
    { id: 'ar.hudhaify',           name: 'Ali Al-Hudhaify',       nameAr: 'علي الحذيفي',       nameEn: 'Ali Al-Hudhaify',         country: 'Arabia Saudí', countryAr: 'السعودية', countryEn: 'Saudi Arabia' },
  ],

  /** Nombre del recitador según el idioma activo (árabe → nameAr, etc.). */
  reciterName(reciter) {
    if (!reciter) return '';
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    if (loc === 'ar') return reciter.nameAr || reciter.name;
    if (loc === 'en') return reciter.nameEn || reciter.name;
    return reciter.name;
  },

  /** País del recitador según el idioma activo. */
  reciterCountry(reciter) {
    if (!reciter) return '';
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    if (loc === 'ar') return reciter.countryAr || reciter.country || '';
    if (loc === 'en') return reciter.countryEn || reciter.country || '';
    return reciter.country || '';
  },

  TRANSLATIONS: {
    'es.garcia_pdf': 'Isa García (Español) · predeterminada',
    'es.cortes': 'Julio Cortés (Español)',
    'en.sahih': 'Sahih International (English)',
    'en.pickthall': 'Pickthall (English)',
  },

  API: {
    // Endpoints públicos (no son secretos; se pueden sobreescribir por entorno)
    ALADHAN: env('QUBA_PUBLIC_API_ALADHAN', 'https://api.aladhan.com/v1'),
    QURAN: env('QUBA_PUBLIC_API_QURAN', 'https://api.alquran.cloud/v1'),
    UMMAH: env('QUBA_PUBLIC_API_UMMAH', 'https://ummahapi.com/api'),
    // ☁️ Proxy backend (Cloudflare Worker). Si está configurado, se usa como
    // primera opción para /translate, /duas y /geocode (evita rate limits).
    PROXY: env('QUBA_PUBLIC_API_PROXY', ''),
  },

  // Preferir dataset local vetado para du'as (recomendado en producción)
  USE_LOCAL_DUAS: env('QUBA_PUBLIC_USE_LOCAL_DUAS', 'true') !== 'false',

  CACHE_TTL: Number(env('QUBA_PUBLIC_CACHE_TTL_MS', String(24 * 60 * 60 * 1000))), // 24h
};

const AppState = {
  location: null,
  timings: null,
  hijri: null,
  settings: {
    locale: 'es',
    theme: 'auto',
    calculationMethod: 3,
    // v26: ajuste de horario — 'auto' (el sistema aplica DST automáticamente),
    //      'summer' (+1h) o 'winter' (-1h) a petición manual del usuario
    timeShift: 'auto',
    // Default reciter: Maher Al-Muaiqly (selección automática en el primer uso)
    reciter: 'ar.mahermuaiqly',
    // v29: traducción ES predeterminada = Isa García (del PDF autorizado,
    // 100% local/offline). 'es.cortes' sigue disponible como alternativa.
    translation: 'es.garcia_pdf',
    userName: '',  // v15: nombre para certificados
  },
};
