// 📅 Hijri — festividades y virtudes (multi-idioma)
// v14: virtues localized (es/ar/en), day name from JS Date (always matches),
// mapped by JS getDay() (0=Sun ... 6=Sat).

const ISLAMIC_HOLIDAYS = [
  { month: 1,  day: 1,  name_es: 'Año Nuevo Islámico',         name_ar: 'رأس السنة الهجرية',       name_en: 'Islamic New Year' },
  { month: 1,  day: 10, name_es: 'Día de Ashura',              name_ar: 'يوم عاشوراء',              name_en: 'Day of Ashura' },
  { month: 3,  day: 12, name_es: 'Mawlid an-Nabi ﷺ',            name_ar: 'المولد النبوي الشريف',     name_en: 'Mawlid an-Nabi ﷺ' },
  { month: 7,  day: 27, name_es: 'Isra y Miʿraj',              name_ar: 'الإسراء والمعراج',         name_en: 'Isra & Miʿraj' },
  { month: 8,  day: 15, name_es: 'Laylat al-Baraʾah',          name_ar: 'ليلة البراءة',             name_en: 'Laylat al-Baraʾah' },
  { month: 9,  day: 1,  name_es: 'Inicio de Ramadán',          name_ar: 'أول رمضان المبارك',        name_en: 'Start of Ramadan' },
  { month: 9,  day: 27, name_es: 'Laylat al-Qadr (probable)',  name_ar: 'ليلة القدر (المرجحة)',     name_en: 'Laylat al-Qadr (likely)' },
  { month: 10, day: 1,  name_es: 'Eid al-Fitr',                name_ar: 'عيد الفطر',                name_en: 'Eid al-Fitr' },
  { month: 12, day: 9,  name_es: 'Día de Arafa',               name_ar: 'يوم عرفة',                 name_en: 'Day of Arafah' },
  { month: 12, day: 10, name_es: 'Eid al-Adha',                name_ar: 'عيد الأضحى',               name_en: 'Eid al-Adha' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🌙 HijriCalc — motor ÚNICO de fecha hijri (v1.0.58)
//
// Fuente de verdad: calendario Umm al-Qura (el mismo que usa el calendario
// oficial de la mezquita en data/calendar2026.js — verificado día por día,
// 0 discrepancias en los 365 días de 2026).
//
// Orden de resolución (todo local, instantáneo y sin red):
//   1) Intl «islamic-umalqura» del dispositivo (verificado al arrancar: si el
//      navegador lo ignora en silencio y devuelve gregoriano, se descarta).
//   2) TABLE incrustada (inicio de año + longitud de cada mes, 1446-1460 AH).
//   3) Aritmético civil (API._gregorianToHijriTabular) — ±1-2 días, marcado
//      como `exact: false` para que la UI lo indique como estimado.
//
// Antes, el contador «Próximas ocasiones» usaba un ancla de 1 Muharram 1447 =
// 2025-06-25 (real: 2025-06-26) + meses lunares PROMEDIO (29.53 d) → las
// ocasiones salían 1-2 días ANTES de lo real. Y el respaldo offline aritmético
// difería de Umm al-Qura en ~53 % de los días.
// ─────────────────────────────────────────────────────────────────────────────
const HijriCalc = {
  // año → [fecha gregoriana de 1 Muharram, 12 dígitos: 1 = mes de 30 días, 0 = 29]
  // Generado desde Umm al-Qura (ICU) y validado contra el calendario oficial.
  TABLE: {
    1446: ['2024-07-07', '011101100100'],
    1447: ['2025-06-26', '101110101010'],
    1448: ['2026-06-16', '010110110101'],
    1449: ['2027-06-06', '001010110110'],
    1450: ['2028-05-25', '101001010110'],
    1451: ['2029-05-14', '111001001101'],
    1452: ['2030-05-04', '101100100101'],
    1453: ['2031-04-23', '101101010010'],
    1454: ['2032-04-11', '101101101010'],
    1455: ['2033-04-01', '010110101101'],
    1456: ['2034-03-22', '001010101110'],
    1457: ['2035-03-11', '100100101111'],
    1458: ['2036-02-29', '010010010111'],
    1459: ['2037-02-17', '011001001011'],
    1460: ['2038-02-06', '011010100101'],
  },

  _fmt: undefined, // undefined = sin sondear · null = no soportado · objeto = formateador válido

  _parts(f, y, m, d) {
    // Mediodía UTC + timeZone UTC → la fecha civil (y/m/d) se convierte tal cual,
    // sin desfases por zona horaria ni horario de verano.
    const o = {};
    f.formatToParts(new Date(Date.UTC(y, m - 1, d, 12))).forEach(p => { o[p.type] = p.value; });
    const day = parseInt(o.day, 10);
    const month = parseInt(o.month, 10);
    const year = parseInt(String(o.year).replace(/\D/g, ''), 10);
    return (day && month && year) ? { day, month, year } : null;
  },

  _intl() {
    if (this._fmt !== undefined) return this._fmt;
    this._fmt = null;
    try {
      const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',
        { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' });
      const a = this._parts(f, 2026, 2, 18);  // 1 Ramadán 1447
      const b = this._parts(f, 2027, 2, 8);   // 1 Ramadán 1448
      if (a && b && a.year === 1447 && a.month === 9 && a.day === 1
                 && b.year === 1448 && b.month === 9 && b.day === 1) this._fmt = f;
    } catch (_) { /* Intl sin soporte → tabla */ }
    return this._fmt;
  },

  _fromTable(y, m, d) {
    const day = Date.UTC(y, m - 1, d) / 86400000;
    let hy = null, start = 0;
    for (const k of Object.keys(this.TABLE)) {          // claves numéricas → orden ascendente
      const s = Date.parse(this.TABLE[k][0] + 'T00:00:00Z') / 86400000;
      if (s <= day) { hy = +k; start = s; } else break;
    }
    if (hy === null) return null;
    let rem = day - start;
    const lens = this.TABLE[hy][1];
    for (let i = 0; i < 12; i++) {
      const len = lens[i] === '1' ? 30 : 29;
      if (rem < len) return { year: hy, month: i + 1, day: rem + 1 };
      rem -= len;
    }
    return null; // posterior al último año de la tabla
  },

  /** Gregoriano (y, m 1-12, d) → { day, month, year, exact, source } */
  fromGregorian(y, m, d) {
    const f = (y >= 1900 && y <= 2100) ? this._intl() : null;
    if (f) {
      const p = this._parts(f, y, m, d);
      if (p) return { ...p, exact: true, source: 'umalqura' };
    }
    const t = this._fromTable(y, m, d);
    if (t) return { ...t, exact: true, source: 'table' };
    if (typeof API !== 'undefined' && typeof API._gregorianToHijriTabular === 'function') {
      return { ...API._gregorianToHijriTabular(new Date(y, m - 1, d)), exact: false, source: 'tabular' };
    }
    return { day: 1, month: 1, year: 1, exact: false, source: 'none' };
  },

  fromDate(date) {
    return this.fromGregorian(date.getFullYear(), date.getMonth() + 1, date.getDate());
  },

  /** Hijri (año, mes, día) → Date local (12:00) o null. Busca ±6 días sobre una estimación. */
  toGregorian(hy, hm, hd) {
    // Ancla real: 1 Muharram 1448 = 2026-06-16. La estimación media se corrige
    // consultando el motor exacto, así que el error del promedio no importa.
    const est = Date.UTC(2026, 5, 16)
      + Math.round((hy - 1448) * 354.367 + (hm - 1) * 29.5306 + (hd - 1)) * 86400000;
    for (let off = 0; off <= 6; off++) {
      for (const sgn of (off === 0 ? [1] : [-1, 1])) {
        const dt = new Date(est + sgn * off * 86400000);
        const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
        const h = this.fromGregorian(y, m, d);
        if (h.year === hy && h.month === hm && h.day === hd) return new Date(y, m - 1, d, 12);
      }
    }
    return null;
  },

  /** Próxima ocurrencia (hoy incluido) de un día hijri → { date, hijriYear, daysLeft } */
  nextOccurrence(hm, hd, from) {
    const now = from || new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const cur = this.fromDate(now).year;
    for (let hy = cur; hy <= cur + 2; hy++) {
      const g = this.toGregorian(hy, hm, hd);
      if (!g) continue;
      const days = Math.round((Date.UTC(g.getFullYear(), g.getMonth(), g.getDate()) - todayUTC) / 86400000);
      if (days >= 0) return { date: g, hijriYear: hy, daysLeft: days };
    }
    return null;
  },
};

const WHITE_DAYS = [13, 14, 15];

// JS getDay() → 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
// Monday=1, Thursday=4 → recommended for voluntary fasting
const FASTING_WEEKDAYS = [1, 4];

// Localized weekday names (JS getDay() index)
const WEEKDAY_NAMES = {
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

function getWeekdayName(dayOfWeek, lang) {
  const l = (lang && ['es','ar','en'].includes(lang)) ? lang : 'es';
  return (WEEKDAY_NAMES[l] || WEEKDAY_NAMES.es)[dayOfWeek] || '';
}

function getHoliday(hijriMonth, hijriDay) {
  return ISLAMIC_HOLIDAYS.find(h => h.month === hijriMonth && h.day === hijriDay);
}

function getHolidayName(hijriMonth, hijriDay, lang) {
  const h = getHoliday(hijriMonth, hijriDay);
  if (!h) return null;
  const l = (lang && ['es','ar','en'].includes(lang)) ? lang : 'es';
  return h[`name_${l}`] || h.name_es;
}

function isFastingDay(hijriDay, dayOfWeek) {
  if (FASTING_WEEKDAYS.includes(dayOfWeek)) return 'weekday';
  if (WHITE_DAYS.includes(hijriDay)) return 'white';
  return false;
}

// Multi-language virtue database, keyed by JS getDay() and special hijri conditions.
// title/verse/source per language.
const VIRTUES = {
  monday: {
    es: { title: 'Lunes — Día recomendado para ayunar', verse: 'El Profeta ﷺ dijo: «Las obras son presentadas los lunes y jueves, y me gusta que mis obras sean presentadas mientras estoy ayunando».', source: 'Sunan at-Tirmidhi 747 (hasan)' },
    ar: { title: 'الاثنين — يوم مستحب للصيام',           verse: 'قال النبي ﷺ: «تُعرض الأعمال يوم الاثنين والخميس، فأحبّ أن يُعرض عملي وأنا صائم».', source: 'سنن الترمذي ٧٤٧ (حسن)' },
    en: { title: 'Monday — Recommended day of fasting',   verse: 'The Prophet ﷺ said: "Deeds are presented on Mondays and Thursdays, so I love that my deeds be presented while I am fasting."', source: 'Sunan at-Tirmidhi 747 (hasan)' },
  },
  thursday: {
    es: { title: 'Jueves — Día recomendado para ayunar', verse: 'Las obras son presentadas ante Allah los lunes y jueves; el Profeta ﷺ ayunaba estos días.', source: 'Sunan at-Tirmidhi 747' },
    ar: { title: 'الخميس — يوم مستحب للصيام',            verse: 'تُعرض الأعمال على الله يوم الاثنين والخميس، وكان النبي ﷺ يصوم هذين اليومين.', source: 'سنن الترمذي ٧٤٧' },
    en: { title: 'Thursday — Recommended day of fasting', verse: 'Deeds are presented to Allah on Mondays and Thursdays; the Prophet ﷺ used to fast on these days.', source: 'Sunan at-Tirmidhi 747' },
  },
  friday: {
    es: { title: 'Viernes — El mejor día de la semana',   verse: '«El mejor día en que sale el sol es el viernes: en él fue creado Adán, en él entró al Paraíso y en él fue expulsado».', source: 'Sahih Muslim 854' },
    ar: { title: 'الجمعة — سيّد أيام الأسبوع',           verse: 'قال ﷺ: «خير يوم طلعت عليه الشمس يوم الجمعة، فيه خُلق آدم، وفيه أُدخل الجنة، وفيه أُخرج منها».', source: 'صحيح مسلم ٨٥٤' },
    en: { title: 'Friday — The best day of the week',     verse: '"The best day the sun rises upon is Friday: on it Adam was created, on it he entered Paradise, and on it he was expelled."', source: 'Sahih Muslim 854' },
  },
  whiteDay: {
    es: { title: 'Día blanco — Ayuno recomendado',        verse: 'El Profeta ﷺ ordenó ayunar los días blancos: el 13, 14 y 15 de cada mes lunar.', source: 'Sunan an-Nasaʾi 2422 (sahih)' },
    ar: { title: 'الأيام البيض — صيامها مستحب',          verse: 'كان النبي ﷺ يأمر بصيام الأيام البيض: الثالث عشر والرابع عشر والخامس عشر من كل شهر.', source: 'سنن النسائي ٢٤٢٢ (صحيح)' },
    en: { title: 'White Day — Recommended fast',          verse: 'The Prophet ﷺ ordered fasting the white days: the 13th, 14th and 15th of every lunar month.', source: 'Sunan an-Nasaʾi 2422 (sahih)' },
  },
  ramadan: {
    es: { title: 'Ramadán — mes bendecido',               verse: '«¡Creyentes! Se os ha prescrito el ayuno, al igual que se prescribió a los que os precedieron; quizás así seáis piadosos». (Q 2:183)', source: 'Al-Baqarah 2:183' },
    ar: { title: 'رمضان — الشهر المبارك',                 verse: '{يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ}', source: 'البقرة ١٨٣' },
    en: { title: 'Ramadan — the blessed month',           verse: '"O you who believe! Fasting is prescribed for you as it was prescribed for those before you, that you may attain piety." (Q 2:183)', source: 'Al-Baqarah 2:183' },
  },
  default: {
    es: { title: 'Día bendecido',                          verse: '«Quien recuerda a su Señor y quien no lo recuerda son como el vivo y el muerto».', source: 'Sahih al-Bukhari 6407' },
    ar: { title: 'يوم مبارك',                              verse: 'قال ﷺ: «مثل الذي يذكر ربه والذي لا يذكر ربه مثل الحي والميت».', source: 'صحيح البخاري ٦٤٠٧' },
    en: { title: 'A blessed day',                          verse: '"The example of one who remembers his Lord and one who does not is like the living and the dead."', source: 'Sahih al-Bukhari 6407' },
  },
};

function _pickLang(lang) {
  return ['es','ar','en'].includes(lang) ? lang : 'es';
}

/**
 * Multi-language daily virtue.
 * @param {number} hijriMonth 1-12
 * @param {number} hijriDay 1-30
 * @param {number} dayOfWeek JS getDay(): 0=Sun ... 6=Sat
 * @param {string} lang 'es' | 'ar' | 'en'
 * @returns {{title,verse,source}}
 */
function getDailyVirtue(hijriMonth, hijriDay, dayOfWeek, lang) {
  const l = _pickLang(lang);
  const holidayName = getHolidayName(hijriMonth, hijriDay, l);
  if (holidayName) {
    const blessed = {
      es: 'Día bendecido. Aumenta tus oraciones, du\'as y caridad hoy.',
      ar: 'يومٌ مبارك. أكثر من الصلاة والدعاء والصدقة اليوم.',
      en: 'A blessed day. Increase your prayers, du\'as and charity today.',
    };
    // v50: si la UI está en árabe se muestra la frase en árabe (antes caía al español por defecto)
    const blessedLang = (typeof currentLocale !== 'undefined' && currentLocale === 'ar') ? 'ar' : l;
    return { title: holidayName, verse: blessed[blessedLang], source: 'Sunnah' };
  }

  // Weekday-specific virtues take priority
  if (dayOfWeek === 1) return VIRTUES.monday[l];
  if (dayOfWeek === 4) return VIRTUES.thursday[l];
  if (dayOfWeek === 5) return VIRTUES.friday[l];

  // Ramadan month
  if (hijriMonth === 9) {
    const v = VIRTUES.ramadan[l];
    // Prefix with day number
    const dayLabel = { es: 'Día', ar: 'اليوم', en: 'Day' }[l];
    return { ...v, title: `${v.title} — ${dayLabel} ${hijriDay}` };
  }

  // White days (any month)
  if (WHITE_DAYS.includes(hijriDay)) return VIRTUES.whiteDay[l];

  return VIRTUES.default[l];
}

if (typeof window !== 'undefined') {
  window.HijriCalc = HijriCalc;
  window.getDailyVirtue = getDailyVirtue;
  window.getWeekdayName = getWeekdayName;
  window.getHolidayName = getHolidayName;
  window.getHoliday = getHoliday;
  window.isFastingDay = isFastingDay;
}
