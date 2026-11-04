// 📅 Hijri — festividades y virtudes (multi-idioma)
// v14: virtues localized (es/ar/en), day name from JS Date (always matches),
// mapped by JS getDay() (0=Sun ... 6=Sat).

const ISLAMIC_HOLIDAYS = [
  { month: 1,  day: 1,  name_es: 'Año Nuevo Islámico',         name_ar: 'رأس السنة الهجرية',       name_en: 'Islamic New Year' },
  { month: 1,  day: 9,  name_es: 'Día de Tasu\'a',             name_ar: 'يوم تاسوعاء',             name_en: 'Day of Tasu\'a' },
  { month: 1,  day: 10, name_es: 'Día de Ashura',              name_ar: 'يوم عاشوراء',              name_en: 'Day of Ashura' },
  { month: 3,  day: 12, name_es: 'Mawlid an-Nabi ﷺ',            name_ar: 'المولد النبوي الشريف',     name_en: 'Mawlid an-Nabi ﷺ' },
  { month: 7,  day: 27, name_es: 'Isra y Miʿraj',              name_ar: 'الإسراء والمعراج',         name_en: 'Isra & Miʿraj' },
  { month: 8,  day: 15, name_es: 'Laylat al-Baraʾah',          name_ar: 'ليلة النصف من شعبان',      name_en: 'Laylat al-Baraʾah' },
  { month: 9,  day: 1,  name_es: 'Inicio de Ramadán',          name_ar: 'أول رمضان المبارك',        name_en: 'Start of Ramadan' },
  { month: 9,  day: 27, name_es: 'Laylat al-Qadr (probable)',  name_ar: 'ليلة القدر (المرجحة)',     name_en: 'Laylat al-Qadr (likely)' },
  { month: 10, day: 1,  name_es: 'Eid al-Fitr',                name_ar: 'عيد الفطر',                name_en: 'Eid al-Fitr' },
  { month: 10, day: 6,  name_es: 'Ayuno de los seis de Shawwal', name_ar: 'صيام ست من شوال',        name_en: 'Six days of Shawwal' },
  { month: 12, day: 1,  name_es: 'Inicio de los Diez de Dhul-Hijjah', name_ar: 'أول عشر ذي الحجة',  name_en: 'First of the Ten of Dhul-Hijjah' },
  { month: 12, day: 9,  name_es: 'Día de Arafa',               name_ar: 'يوم عرفة',                 name_en: 'Day of Arafah' },
  { month: 12, day: 10, name_es: 'Eid al-Adha',                name_ar: 'عيد الأضحى',               name_en: 'Eid al-Adha' },
  { month: 12, day: 11, name_es: 'Días de Tashreeq',           name_ar: 'أيام التشريق',             name_en: 'Days of Tashreeq' },
  { month: 12, day: 12, name_es: 'Días de Tashreeq',           name_ar: 'أيام التشريق',             name_en: 'Days of Tashreeq' },
  { month: 12, day: 13, name_es: 'Días de Tashreeq',           name_ar: 'أيام التشريق',             name_en: 'Days of Tashreeq' },
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

// ─────────────────────────────────────────────────────────────────────────────
// v1.0.77: فضل الأيام والمناسبات الهجرية — على نفس نمط الفضائل السابق
// (عنوان + شرح + آية أو حديث صحيح + المرجع) باللغات الثلاث.
// المفتاح «شهر-يوم» بالهجري. تُعرض في بطاقة «فضل اليوم» أسفل التقويم،
// وتعمل لكل السنوات (لا تتوقف على خريطة 2026 الرسمية).
// ─────────────────────────────────────────────────────────────────────────────
const OCCASION_VIRTUES = {
  '1-1': {
    ar: { title: 'رأس السنة الهجرية', text: 'بداية عام هجري جديد: فرصة للمحاسبة والتخطيط لعام أقرب إلى الله، مع الاجتهاد في الطاعات.', verse: '{إِنَّ عِدَّةَ الشُّهُورِ عِنْدَ اللَّهِ اثْنَا عَشَرَ شَهْرًا فِي كِتَابِ اللَّهِ يَوْمَ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ مِنْهَا أَرْبَعَةٌ حُرُمٌ}', source: 'التوبة ٣٦' },
    es: { title: 'Año Nuevo Islámico', text: 'Comienzo de un nuevo año hijri: momento para hacer balance y planificar un año más cercano a Allah.', verse: '"El número de meses ante Allah es doce... de los cuales cuatro son sagrados." (Q 9:36)', source: 'At-Tawbah 9:36' },
    en: { title: 'Islamic New Year', text: 'The start of a new Hijri year: a time for self-reckoning and planning a year closer to Allah.', verse: '"Indeed, the number of months with Allah is twelve... of which four are sacred." (Q 9:36)', source: 'At-Tawbah 9:36' },
  },
  '1-9': {
    ar: { title: 'يوم تاسوعاء', text: 'صيام التاسع من محرم، وكان النبي ﷺ عزم على صيامه مخالفةً لأهل الكتاب.', verse: 'قال ﷺ: «فإذا كان العام المقبل إن شاء الله صمنا اليوم التاسع»', source: 'صحيح مسلم ١١٣٤' },
    es: { title: 'Día de Tasu\'a', text: 'Ayuno del 9 de Muharram; el Profeta ﷺ se propuso ayunarlo para diferenciarse de la gente del Libro.', verse: '"Si vivo hasta el año próximo, ayunaré el noveno día."', source: 'Sahih Muslim 1134' },
    en: { title: 'Day of Tasu\'a', text: 'Fasting the 9th of Muharram; the Prophet ﷺ intended to fast it to differ from the People of the Book.', verse: '"If I live until next year, I will fast the ninth day."', source: 'Sahih Muslim 1134' },
  },
  '1-10': {
    ar: { title: 'يوم عاشوراء', text: 'صيام اليوم العاشر من محرم يكفّر سنةً كاملة، وكان موسى ﷺ يصومه شكرًا لله.', verse: 'قال ﷺ: «صيام يوم عاشوراء أحتسب على الله أن يكفّر السنة التي قبله»', source: 'صحيح مسلم ١١٦٢' },
    es: { title: 'Día de Ashura', text: 'Ayunar el 10 de Muharram expía el año anterior; Moisés ﷺ lo ayunaba en agradecimiento a Allah.', verse: '"El ayuno del día de Ashura expía el año anterior."', source: 'Sahih Muslim 1162' },
    en: { title: 'Day of Ashura', text: 'Fasting the 10th of Muharram expiates the previous year; Musa ﷺ fasted it in gratitude to Allah.', verse: '"Fasting the day of Ashura expiates the year before it."', source: 'Sahih Muslim 1162' },
  },
  '3-12': {
    ar: { title: 'المولد النبوي الشريف', text: 'ذكرى ميلاد سيد الخلق محمد ﷺ: مناسبة لتدارس سيرته والتأسي بأخلاقه والصلاة عليه.', verse: '{لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ لِمَنْ كَانَ يَرْجُو اللَّهَ وَالْيَوْمَ الْآخِرَ}', source: 'الأحزاب ٢١' },
    es: { title: 'Mawlid an-Nabi ﷺ', text: 'Aniversario del nacimiento del Profeta Muhammad ﷺ: ocasión para estudiar su biografía e imitar su carácter.', verse: '"Ciertamente tenéis en el Mensajero de Allah un excelente ejemplo." (Q 33:21)', source: 'Al-Ahzab 33:21' },
    en: { title: 'Mawlid an-Nabi ﷺ', text: 'The birthday of the Prophet Muhammad ﷺ: a time to study his Sira and follow his character.', verse: '"Indeed, you have in the Messenger of Allah an excellent example." (Q 33:21)', source: 'Al-Ahzab 33:21' },
  },
  '7-27': {
    ar: { title: 'ليلة الإسراء والمعراج', text: 'ذكرى الإسراء من المسجد الحرام إلى المسجد الأقصى ثم العروج إلى السماوات، وفيها فُرضت الصلوات الخمس. مناسبة لتثبيت الصلاة وتعظيم المسجد الأقصى.', verse: '{سُبْحَانَ الَّذِي أَسْرَى بِعَبْدِهِ لَيْلًا مِنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى الَّذِي بَارَكْنَا حَوْلَهُ}', source: 'الإسراء ١' },
    es: { title: 'Laylat al-Isra wa al-Miʿraj', text: 'La noche del viaje nocturno de La Meca a Al-Quds y la ascensión a los cielos, en la que se prescribieron las cinco oraciones. Ocasión para afianzar la oración y honrar la Mezquita de Al-Aqsa.', verse: '"Glorificado sea Quien hizo viajar de noche a Su siervo desde la Mezquita Sagrada hasta la Mezquita de Al-Aqsa." (Q 17:1)', source: 'Al-Isra 17:1' },
    en: { title: 'Laylat al-Isra wa al-Miʿraj', text: 'The night journey from Makkah to Al-Aqsa and the ascension through the heavens, during which the five prayers were prescribed.', verse: '"Exalted is He who took His Servant by night from al-Masjid al-Haram to al-Masjid al-Aqsa." (Q 17:1)', source: 'Al-Isra 17:1' },
  },
  '8-15': {
    ar: { title: 'ليلة النصف من شعبان', text: 'ليلة مباركة يُستحب فيها القيام والدعاء والاستغفار، وشعبان شهر يغفل الناس عنه بين رجب ورمضان، وكان النبي ﷺ يكثر صيامه.', verse: 'قال ﷺ: «ذلك شهر يغفل الناس عنه بين رجب ورمضان، وهو شهر تُرفع فيه الأعمال إلى رب العالمين، فأحب أن يُرفع عملي وأنا صائم»', source: 'سنن النسائي ٢٣٥٧ (حسن)' },
    es: { title: 'Laylat al-Baraʾah (15 de Sha\'ban)', text: 'Noche bendecida para la oración y el perdón; Sha\'ban es el mes que la gente descuida entre Rajab y Ramadán, y el Profeta ﷺ ayunaba mucho en él.', verse: '"Es un mes que la gente descuida entre Rajab y Ramadán; en él se elevan las obras, y me gusta que mis obras se eleven mientras ayuno."', source: 'Sunan an-Nasaʾi 2357 (hasan)' },
    en: { title: 'Laylat al-Baraʾah (15th of Sha\'ban)', text: 'A blessed night for prayer and seeking forgiveness; Sha\'ban is the month people neglect between Rajab and Ramadan, and the Prophet ﷺ fasted much of it.', verse: '"It is a month people neglect between Rajab and Ramadan; deeds are raised in it, and I love my deeds to be raised while fasting."', source: 'Sunan an-Nasaʾi 2357 (hasan)' },
  },
  '9-1': {
    ar: { title: 'أول رمضان — الشهر المبارك', text: 'بداية شهر الصيام والقرآن: شهر تُفتح فيه أبواب الجنة وتُصفَّد الشياطين، وفيه ليلة القدر.', verse: '{شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ هُدًى لِلنَّاسِ وَبَيِّنَاتٍ مِنَ الْهُدَى وَالْفُرْقَانِ}', source: 'البقرة ١٨٥' },
    es: { title: 'Inicio de Ramadán', text: 'Comienza el mes del ayuno y del Corán: se abren las puertas del Paraíso y se encadenan los demonios; en él está Laylat al-Qadr.', verse: '"El mes de Ramadán en el que se hizo descender el Corán, guía para los hombres." (Q 2:185)', source: 'Al-Baqarah 2:185' },
    en: { title: 'Ramadan begins', text: 'The month of fasting and the Qur\'an begins: the gates of Paradise are opened and the devils are chained; it contains Laylat al-Qadr.', verse: '"The month of Ramadan in which was revealed the Qur\'an, a guidance for mankind." (Q 2:185)', source: 'Al-Baqarah 2:185' },
  },
  '9-27': {
    ar: { title: 'ليلة القدر (المرجحة)', text: 'أرجى ليالي العشر الأواخر؛ ليلة خير من ألف شهر، تُكتب فيها المقادير وتتنزل الملائكة. اجتهد فيها بالقيام والدعاء.', verse: '{إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ ۞ لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ}', source: 'القدر ١-٣ · «تحرَّوا ليلة القدر في العشر الأواخر» — صحيح البخاري ٢٠٢٠' },
    es: { title: 'Laylat al-Qadr (la más probable)', text: 'La noche más esperada de las últimas diez: mejor que mil meses, en ella se decreta el destino y descienden los ángeles.', verse: '"La noche del Destino es mejor que mil meses." (Q 97:3)', source: 'Al-Qadr 97:3 · "Buscad Laylat al-Qadr en las últimas diez." — Sahih al-Bukhari 2020' },
    en: { title: 'Laylat al-Qadr (most likely)', text: 'The most hopeful night of the last ten: better than a thousand months, in which the decree is set and the angels descend.', verse: '"The Night of Decree is better than a thousand months." (Q 97:3)', source: 'Al-Qadr 97:3 · "Seek Laylat al-Qadr in the last ten." — Sahih al-Bukhari 2020' },
  },
  '10-1': {
    ar: { title: 'عيد الفطر', text: 'فرحة الصائمين بإتمام الصيام: يوم أكل وشرب وذكر وتكبير وصلة أرحام، وفيه صدقة الفطر.', verse: 'قال ﷺ: «للصائم فرحتان: فرحة عند فطره، وفرحة عند لقاء ربه»', source: 'صحيح مسلم ١١٥١' },
    es: { title: 'Eid al-Fitr', text: 'La alegría del ayunante tras completar el ayuno: día de comer, recordar a Allah, takbir y mantener los lazos familiares; en él se da el Zakat al-Fitr.', verse: '"El ayunante tiene dos alegrías: al romper su ayuno y al encontrarse con su Señor."', source: 'Sahih Muslim 1151' },
    en: { title: 'Eid al-Fitr', text: 'The joy of the fasting person after completing the fast: a day of eating, dhikr, takbir and family ties; Zakat al-Fitr is given.', verse: '"The fasting person has two joys: when he breaks his fast and when he meets his Lord."', source: 'Sahih Muslim 1151' },
  },
  '10-6': {
    ar: { title: 'صيام ست من شوال', text: 'من صام رمضان ثم أتبعه ستة أيام من شوال كان كصيام الدهر كله.', verse: 'قال ﷺ: «من صام رمضان ثم أتبعه ستًّا من شوال كان كصيام الدهر»', source: 'صحيح مسلم ١١٦٤' },
    es: { title: 'Ayuno de los seis de Shawwal', text: 'Quien ayuna Ramadán y luego seis días de Shawwal es como si ayunara toda la vida.', verse: '"Quien ayuna Ramadán y luego seis días de Shawwal, es como si ayunara el tiempo entero."', source: 'Sahih Muslim 1164' },
    en: { title: 'Fasting the six of Shawwal', text: 'Whoever fasts Ramadan then six days of Shawwal is as if he fasted the whole year.', verse: '"Whoever fasts Ramadan then follows it with six days of Shawwal, it is as if he fasted the whole time."', source: 'Sahih Muslim 1164' },
  },
  '12-9': {
    ar: { title: 'يوم عرفة', text: 'أفضل أيام السنة؛ صيامه لغير الحاج يكفّر سنتين، وفيه نزلت آية إكمال الدين، وهو يوم مغفرة وعتق من النار.', verse: 'قال ﷺ: «صيام يوم عرفة أحتسب على الله أن يكفّر السنة التي قبله والسنة التي بعده»', source: 'صحيح مسلم ١١٦٢' },
    es: { title: 'Día de Arafah', text: 'El mejor día del año: su ayuno (para quien no es peregrino) expía dos años; en él se reveló la aleya de la perfección de la religión.', verse: '"El ayuno del día de Arafah expía el año anterior y el siguiente."', source: 'Sahih Muslim 1162' },
    en: { title: 'Day of Arafah', text: 'The best day of the year: fasting it (for non-pilgrims) expiates two years; on it the verse of the perfection of religion was revealed.', verse: '"Fasting the day of Arafah expiates the year before it and the year after it."', source: 'Sahih Muslim 1162' },
  },
  '12-10': {
    ar: { title: 'عيد الأضحى', text: 'يوم النحر وأعظم أيام الحج: يُشرع فيه الأضحية والتكبير وصلاة العيد وصلة الأرحام.', verse: '{فَصَلِّ لِرَبِّكَ وَانْحَرْ}', source: 'الكوثر ٢' },
    es: { title: 'Eid al-Adha', text: 'Día del sacrificio y el más grande de la peregrinación: se ofrece el sacrificio, el takbir, la oración del Eid y se mantienen los lazos familiares.', verse: '"Así pues, reza a tu Señor y sacrifica." (Q 108:2)', source: 'Al-Kawthar 108:2' },
    en: { title: 'Eid al-Adha', text: 'The day of sacrifice and the greatest day of Hajj: the udhiyah, takbir, Eid prayer and family ties.', verse: '"So pray to your Lord and sacrifice." (Q 108:2)', source: 'Al-Kawthar 108:2' },
  },
};

// فضائل النطاقات (أيام متتالية): العشر الأواخر · عموم رمضان · عشر ذي الحجة · التشريق
const RANGE_VIRTUES = {
  last10: {
    ar: { title: 'العشر الأواخر من رمضان', text: 'أعظم ليالي العام: فيها ليلة القدر، وكان النبي ﷺ يجتهد فيها ما لا يجتهد في غيرها.', verse: 'كان النبي ﷺ «إذا دخل العشر شدّ مئزره وأحيا ليله وأيقظ أهله»', source: 'صحيح البخاري ٢٠٢٤ · صحيح مسلم ١١٧٤' },
    es: { title: 'Las últimas diez de Ramadán', text: 'Las mejores noches del año: contienen Laylat al-Qadr; el Profeta ﷺ se esforzaba en ellas como en ningún otro momento.', verse: '"Cuando entraban las diez, ceñía su cinturón, vivificaba su noche y despertaba a su familia."', source: 'Sahih al-Bukhari 2024 · Sahih Muslim 1174' },
    en: { title: 'The last ten of Ramadan', text: 'The greatest nights of the year: they contain Laylat al-Qadr; the Prophet ﷺ strove in them as at no other time.', verse: '"When the ten entered, he would tighten his waist belt, revive his night, and wake his family."', source: 'Sahih al-Bukhari 2024 · Sahih Muslim 1174' },
  },
  ramadan: {
    ar: { title: 'رمضان — شهر الصيام والقرآن', text: 'شهر الصيام والقيام وتلاوة القرآن والصدقة؛ تُفتح فيه أبواب الجنة وتُصفَّد الشياطين.', verse: '{يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ}', source: 'البقرة ١٨٣' },
    es: { title: 'Ramadán — mes del ayuno y el Corán', text: 'Mes del ayuno, la oración nocturna, la recitación del Corán y la caridad; se abren las puertas del Paraíso.', verse: '"¡Creyentes! Se os ha prescrito el ayuno, al igual que se prescribió a quienes os precedieron." (Q 2:183)', source: 'Al-Baqarah 2:183' },
    en: { title: 'Ramadan — month of fasting and the Qur\'an', text: 'The month of fasting, night prayer, reciting the Qur\'an and charity; the gates of Paradise are opened.', verse: '"O you who believe! Fasting is prescribed for you as it was for those before you." (Q 2:183)', source: 'Al-Baqarah 2:183' },
  },
  tendh: {
    ar: { title: 'عشر ذي الحجة — أفضل أيام العمل الصالح', text: 'أفضل أيام السنة للعمل الصالح: الصيام والذكر والتكبير والصدقة، وفيها يوم عرفة وعيد الأضحى.', verse: 'قال ﷺ: «ما من أيام العمل الصالح فيها أحبّ إلى الله من هذه الأيام العشر»', source: 'صحيح البخاري ٩٦٩' },
    es: { title: 'Los diez de Dhul-Hijjah', text: 'Los mejores días del año para las buenas obras: ayuno, dhikr, takbir y caridad; incluyen Arafah y Eid al-Adha.', verse: '"No hay días en los que las buenas obras sean más amadas por Allah que estos diez días."', source: 'Sahih al-Bukhari 969' },
    en: { title: 'The ten days of Dhul-Hijjah', text: 'The best days of the year for good deeds: fasting, dhikr, takbir and charity; they include Arafah and Eid al-Adha.', verse: '"There are no days in which good deeds are more beloved to Allah than these ten days."', source: 'Sahih al-Bukhari 969' },
  },
  tashreeq: {
    ar: { title: 'أيام التشريق', text: 'أيام أكل وشرب وذكر لله، ويُكبَّر فيها عقب الصلوات، ويُحرم صيامها.', verse: 'قال ﷺ: «أيام التشريق أيام أكل وشرب وذكر لله»', source: 'صحيح مسلم ١١٤١' },
    es: { title: 'Días de Tashreeq', text: 'Días de comer, beber y recordar a Allah; se hace takbir tras las oraciones y está prohibido ayunar en ellos.', verse: '"Los días de Tashreeq son días de comer, beber y recordar a Allah."', source: 'Sahih Muslim 1141' },
    en: { title: 'Days of Tashreeq', text: 'Days of eating, drinking and remembering Allah; takbir is said after prayers and fasting is prohibited in them.', verse: '"The days of Tashreeq are days of eating, drinking and remembering Allah."', source: 'Sahih Muslim 1141' },
  },
};

// v1.0.80: فضائل عامة متنوعة — تُختار بحسب تاريخ اليوم فلا يتكرّر «يوم مبارك»
// نفسه كل يوم. كل فضل بشرحه وآيته أو حديثه الصحيح ومرجعه، بثلاث لغات.
const GENERAL_POOL = [
  { ar: { title: 'فضل الصلاة على وقتها', text: 'أحبّ الأعمال إلى الله أداؤها في وقتها.', verse: 'قال ﷺ: «الصلاة على وقتها»', source: 'صحيح البخاري ٥٢٧' },
    es: { title: 'La oración en su hora', text: 'La obra más amada por Allah: la oración en su tiempo.', verse: '"La oración en su hora."', source: 'Sahih al-Bukhari 527' },
    en: { title: 'Prayer at its time', text: 'The deed most beloved to Allah: prayer at its proper time.', verse: '"Prayer at its time."', source: 'Sahih al-Bukhari 527' } },
  { ar: { title: 'فضل الذكر', text: 'الذاكرون الله كثيرًا سبقوا الناس أجمعين.', verse: 'قال ﷺ: «سبق المفردون: الذاكرون الله كثيرًا والذاكرات»', source: 'صحيح مسلم ٢٦٧٦' },
    es: { title: 'El valor del dhikr', text: 'Quienes recuerdan mucho a Allah se adelantan a todos.', verse: '"Los que recuerdan mucho a Allah y a las que recuerdan."', source: 'Sahih Muslim 2676' },
    en: { title: 'The value of dhikr', text: 'Those who remember Allah much outstrip all others.', verse: '"The men and women who remember Allah much."', source: 'Sahih Muslim 2676' } },
  { ar: { title: 'فضل الصدقة', text: 'الصدقة لا تنقص المال، بل تباركه وتفتح أبواب الخير.', verse: 'قال ﷺ: «ما نقصت صدقة من مال»', source: 'صحيح مسلم ٢٥٨٨' },
    es: { title: 'El valor de la caridad', text: 'La caridad no disminuye la riqueza, la bendice.', verse: '"La caridad no disminuye la riqueza."', source: 'Sahih Muslim 2588' },
    en: { title: 'The value of charity', text: 'Charity does not decrease wealth; it blesses it.', verse: '"Charity does not decrease wealth."', source: 'Sahih Muslim 2588' } },
  { ar: { title: 'فضل تلاوة القرآن', text: 'القرآن يشفع لصاحبه يوم القيامة ويُرفع به الدرجات.', verse: 'قال ﷺ: «اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعًا لأصحابه»', source: 'صحيح مسلم ٨٠٤' },
    es: { title: 'La recitación del Corán', text: 'El Corán intercede por quien lo recita.', verse: '"Recitad el Corán, pues vendrá a interceder por sus compañeros."', source: 'Sahih Muslim 804' },
    en: { title: 'Reciting the Qur\'an', text: 'The Qur\'an will intercede for the one who recites it.', verse: '"Recite the Qur\'an, for it will come interceding for its companions."', source: 'Sahih Muslim 804' } },
  { ar: { title: 'فضل بر الوالدين', text: 'برّ الوالدين من أعظم أبواب الجنة ورضا الله.', verse: 'قال ﷺ: «رضا الرب في رضا الوالد»', source: 'سنن الترمذي ١٨٩٩ (صحيح)' },
    es: { title: 'La bondad con los padres', text: 'Honrar a los padres es una de las mayores puertas del Paraíso.', verse: '"La satisfacción del Señor está en la del padre."', source: 'Sunan at-Tirmidhi 1899 (sahih)' },
    en: { title: 'Kindness to parents', text: 'Honouring parents is among the greatest gates to Paradise.', verse: '"The Lord\'s pleasure is in the parent\'s pleasure."', source: 'Sunan at-Tirmidhi 1899 (sahih)' } },
  { ar: { title: 'فضل صلة الرحم', text: 'صلة الرحم تزيد الرزق وتُطيل العمر وتُعمّر البيوت.', verse: 'قال ﷺ: «من أحب أن يُبسط له في رزقه فليصل رحمه»', source: 'صحيح البخاري ٥٩٨٦' },
    es: { title: 'Mantener los lazos familiares', text: 'Los lazos familiares amplían el sustento y prolongan la vida.', verse: '"Quien quiera que se amplíe su sustento, que mantenga sus lazos."', source: 'Sahih al-Bukhari 5986' },
    en: { title: 'Keeping family ties', text: 'Family ties expand provision and extend life.', verse: '"Whoever wishes his provision expanded, let him keep his ties."', source: 'Sahih al-Bukhari 5986' } },
  { ar: { title: 'فضل الصدق', text: 'الصدق يهدي إلى البر، والبر يهدي إلى الجنة.', verse: 'قال ﷺ: «عليكم بالصدق فإن الصدق يهدي إلى البر»', source: 'صحيح مسلم ٢٦٠٧' },
    es: { title: 'La veracidad', text: 'La veracidad guía a la rectitud y la rectitud al Paraíso.', verse: '"Sed veraces, pues la veracidad guía a la rectitud."', source: 'Sahih Muslim 2607' },
    en: { title: 'Truthfulness', text: 'Truthfulness guides to righteousness and righteousness to Paradise.', verse: '"Be truthful, for truthfulness guides to righteousness."', source: 'Sahih Muslim 2607' } },
  { ar: { title: 'فضل الصبر', text: 'أجر الصابرين بغير حساب، ومع الصبر يأتي النصر والفرج.', verse: '{إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُمْ بِغَيْرِ حِسَابٍ}', source: 'الزمر ١٠' },
    es: { title: 'La paciencia', text: 'Los pacientes reciben su recompensa sin medida.', verse: '"Los pacientes recibirán su recompensa sin medida." (Q 39:10)', source: 'Az-Zumar 39:10' },
    en: { title: 'Patience', text: 'The patient will be given their reward without measure.', verse: '"The patient will be given their reward without measure." (Q 39:10)', source: 'Az-Zumar 39:10' } },
  { ar: { title: 'فضل الاستغفار', text: 'الاستغفار مفتاح الفرج والرزق ومحو الذنوب.', verse: 'قال ﷺ: «من لزم الاستغفار جعل الله له من كل ضيق مخرجًا»', source: 'سنن أبي داود ١٥١٨ (صحيح)' },
    es: { title: 'El istighfar', text: 'Pedir perdón abre salidas a toda angustia y trae sustento.', verse: '"Quien persevere en el istighfar, Allah le dará salida de toda angustia."', source: 'Sunan Abu Dawud 1518 (sahih)' },
    en: { title: 'Seeking forgiveness', text: 'Istighfar opens a way out of every difficulty and brings provision.', verse: '"Whoever persists in istighfar, Allah will give him a way out of every difficulty."', source: 'Sunan Abu Dawud 1518 (sahih)' } },
  { ar: { title: 'فضل الدعاء', text: 'الدعاء عبادة، والله يحبّ من يسأله ويلحّ في الدعاء.', verse: 'قال ﷺ: «الدعاء هو العبادة»', source: 'سنن الترمذي ٣٣٧٢ (صحيح)' },
    es: { title: 'La súplica', text: 'La súplica es adoración; Allah ama a quien Le pide.', verse: '"La súplica es la adoración."', source: 'Sunan at-Tirmidhi 3372 (sahih)' },
    en: { title: 'Supplication', text: 'Du\'a is worship; Allah loves those who ask Him.', verse: '"Supplication is worship."', source: 'Sunan at-Tirmidhi 3372 (sahih)' } },
  { ar: { title: 'فضل حسن الخلق', text: 'حسن الخلق أثقل ما يوضع في الميزان، وهو أقرب الناس مجلسًا من النبي ﷺ.', verse: 'قال ﷺ: «ما من شيء أثقل في الميزان من حسن الخلق»', source: 'سنن أبي داود ٤٧٩٩ (صحيح)' },
    es: { title: 'El buen carácter', text: 'El buen carácter es lo más pesado en la balanza.', verse: '"No hay nada más pesado en la balanza que el buen carácter."', source: 'Sunan Abu Dawud 4799 (sahih)' },
    en: { title: 'Good character', text: 'Good character is the heaviest thing on the scales.', verse: '"Nothing is heavier on the scales than good character."', source: 'Sunan Abu Dawud 4799 (sahih)' } },
  { ar: { title: 'فضل طلب العلم', text: 'طالب العلم في طريق الجنة ما دام في طلبه، والملائكة تضع أجنحتها له.', verse: 'قال ﷺ: «من سلك طريقًا يطلب فيه علمًا سلك الله به طريقًا من طرق الجنة»', source: 'صحيح مسلم ٢٦٩٩' },
    es: { title: 'Buscar el conocimiento', text: 'Quien busca conocimiento, Allah le facilita un camino al Paraíso.', verse: '"Quien recorre un camino buscando conocimiento, Allah le allana un camino al Paraíso."', source: 'Sahih Muslim 2699' },
    en: { title: 'Seeking knowledge', text: 'Whoever seeks knowledge, Allah eases for him a path to Paradise.', verse: '"Whoever treads a path seeking knowledge, Allah eases for him a path to Paradise."', source: 'Sahih Muslim 2699' } },
  { ar: { title: 'فضل النية الصالحة', text: 'الأعمال تُوزَن بالنيّات؛ فاجعل نيّتك لله في كل عمل صغير وكبير.', verse: 'قال ﷺ: «إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى»', source: 'صحيح البخاري ١' },
    es: { title: 'La intención', text: 'Las obras se miden por las intenciones; haz que la tuya sea para Allah.', verse: '"Las obras son según las intenciones."', source: 'Sahih al-Bukhari 1' },
    en: { title: 'Intention', text: 'Deeds are judged by intentions; make yours for Allah.', verse: '"Actions are but by intentions."', source: 'Sahih al-Bukhari 1' } },
];

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
/** v1.0.80: فضائل إضافية لهذا اليوم (جمعة/اثنين/خميس · أيام بيض · عشر أخير ·
 *  عشر ذي الحجة · تشريق) — تُعرض تحت الفضل الأساسي فلا يُخفي أحدهما الآخر.
 *  primaryTitle: عنوان الفضل الأساسي لتفادي تكراره. */
function getDayExtras(hijriMonth, hijriDay, dayOfWeek, lang, primaryTitle) {
  const l = _pickLang(lang);
  const out = [];
  const push = (obj) => {
    if (!obj || !obj[l]) return;
    if (primaryTitle && obj[l].title === primaryTitle) return;
    if (out.some(x => x.title === obj[l].title)) return;
    out.push({ title: obj[l].title, text: obj[l].text || '', verse: obj[l].verse || '', source: obj[l].source || '' });
  };
  if (dayOfWeek === 5) push(VIRTUES.friday);
  else if (dayOfWeek === 1) push(VIRTUES.monday);
  else if (dayOfWeek === 4) push(VIRTUES.thursday);
  if (WHITE_DAYS.includes(hijriDay)) push(VIRTUES.whiteDay);
  if (hijriMonth === 9) { push(RANGE_VIRTUES.ramadan); if (hijriDay >= 21) push(RANGE_VIRTUES.last10); }
  if (hijriMonth === 12) {
    if (hijriDay >= 1 && hijriDay <= 8) push(RANGE_VIRTUES.tendh);
    if (hijriDay >= 11 && hijriDay <= 13) push(RANGE_VIRTUES.tashreeq);
  }
  if (hijriMonth === 10 && hijriDay >= 2 && hijriDay <= 7 && OCCASION_VIRTUES['10-6']) push(OCCASION_VIRTUES['10-6']);
  return out;
}

function getDailyVirtue(hijriMonth, hijriDay, dayOfWeek, lang) {
  const l = _pickLang(lang);

  // 1) مناسبة هجرية محددة (شهر-يوم) — على نفس نمط الفضائل السابق
  const exact = OCCASION_VIRTUES[hijriMonth + '-' + hijriDay];
  if (exact && exact[l]) return exact[l];

  // 2) النطاقات: العشر الأواخر · عموم رمضان · عشر ذي الحجة · التشريق
  if (hijriMonth === 9) {
    if (hijriDay >= 21) return RANGE_VIRTUES.last10[l];
    if (hijriDay > 1) {
      const v = RANGE_VIRTUES.ramadan[l];
      const dayLabel = { es: 'Día', ar: 'اليوم', en: 'Day' }[l];
      return { ...v, title: `${v.title} — ${dayLabel} ${hijriDay}` };
    }
  }
  if (hijriMonth === 12) {
    if (hijriDay >= 1 && hijriDay <= 8) return RANGE_VIRTUES.tendh[l];
    if (hijriDay >= 11 && hijriDay <= 13) return RANGE_VIRTUES.tashreeq[l];
  }

  // 3) فضائل أيام الأسبوع (كما كانت)
  if (dayOfWeek === 5) return VIRTUES.friday[l];
  if (dayOfWeek === 1) return VIRTUES.monday[l];
  if (dayOfWeek === 4) return VIRTUES.thursday[l];

  // 4) الأيام البيض
  if (WHITE_DAYS.includes(hijriDay)) return VIRTUES.whiteDay[l];

  // 5) يوم عادي: فضل متنوّع بحسب تاريخ اليوم (لا رسالة «يوم مبارك» مكرّرة)
  const pool = GENERAL_POOL;
  if (pool.length) {
    const idx = ((hijriMonth * 31 + hijriDay * 17) % pool.length + pool.length) % pool.length;
    return pool[idx][l];
  }

  // 6) احتياطي: مناسبة بلا فضل مخصّص → رسالة عامة
  const holidayName = getHolidayName(hijriMonth, hijriDay, l);
  if (holidayName) {
    return {
      title: holidayName,
      text: { es: 'Día bendecido. Aumenta tus oraciones, du\'as y caridad hoy.', ar: 'يومٌ مبارك. أكثر من الصلاة والدعاء والصدقة اليوم.', en: 'A blessed day. Increase your prayers, du\'as and charity today.' }[l],
      verse: { es: 'Las obras más amadas por Allah son las constantes, aunque sean pocas.', ar: '«أحب الأعمال إلى الله أدومها وإن قلّ»', en: 'The deeds most beloved to Allah are those done consistently, even if few.' }[l],
      source: 'Sahih al-Bukhari 6464',
    };
  }

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
