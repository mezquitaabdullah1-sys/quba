// v1.0.142 — توقيت كوبا: التوقيت الصيفي (UTC−4) مفروض دائمًا، بمعايرة ذاتية.
//
// المشكلة قبل هذه النسخة: التطبيق كان يضيف 60 دقيقة «عمياء» كان مصدر
// المواقيت يعطي -5. لكن الواقع أن كل مصدر يعطي توقيتًا مختلفًا:
//   • Aladhan يعيد ظهر هافانا 13:13 يوم 2026-11-07 = UTC−4 (صيفي صحيح).
//   • محرك الحساب المحلي (PrayerCalc) يتبع منطقة الجهاز: الأجهزة التي لم
//     تُحدَّث فيها قاعدة المناطق الزمنية تُرجع -5 بعد 2026-11-01 → متأخر ساعة.
// فكانت بعض الشاشات ساعة متقدمة (تُضاف الساعة لبيانات صحيحة أصلًا) وبعضها
// ساعة متأخرة (محلي بلا أي تصحيح). وهذا هو سبب اختلاف المواعيد بين
// الرئيسية وصفحة الصلاة.
//
// الحل: لا نفترض شيئًا عن المنطقة التي في البيانات — نقيسها.
// الظهيرة الشمسية الحقيقية (UTC) تُحسب فلكيًا لخط الطول والتاريخ، ونقارنها
// بمنتصف (الشروق + المغرب) الوارد في المواقيت: هذا المنتصف يساوي الظهيرة
// الشمسية ولا يتأثر بتصحيحات الظهر أو الارتفاع. الفرق مقرّبًا لأقرب نصف
// ساعة يحدد المنطقة الفعلية للبيانات (-4 أو -5 أو غيرها)، ثم نُزحزح بمقدار
// الفرق بينها وبين UTC−4 فقط. العملية متكرّرة بلا ضرر (idempotent): تمرير
// المواقيت مرتين لا يضيف ساعة ثانية.

const CubaTime = {
  /** التوقيت المطلوب لكوبا: صيفي دائم (UTC−4) */
  OFFSET_H: -4,

  /** قرار الحكومة الكوبية بإبقاء التوقيت الصيفي (مرجع فقط، لا يقيّد التطبيق) */
  DECISION_UNTIL: '2027-11-07',

  /** حدود كوبا التقريبية */
  LAT_MIN: 19.7, LAT_MAX: 23.4,
  LON_MIN: -85.1, LON_MAX: -73.9,

  /** هل الموقع الحالي في كوبا؟ (AppState ← آخر موقع محفوظ ← الإحداثيات) */
  isCubaLocation() {
    try {
      const loc = (typeof AppState !== 'undefined' && AppState.location) || null;
      if (loc && this._inBox(loc.latitude, loc.longitude)) return true;
      if (loc) {
        const c = String(loc.country || loc.countryEn || loc.countryAr || '');
        if (/cuba|كوبا/i.test(c)) return true;
      }
      const last = (typeof Storage !== 'undefined' && Storage.get('last_location')) || null;
      if (last) {
        if (this._inBox(last.latitude, last.longitude)) return true;
        const c2 = String(last.country || last.countryEn || last.countryAr || '');
        if (/cuba|كوبا/i.test(c2)) return true;
      }
    } catch (e) { /* صامت */ }
    return false;
  },

  _inBox(lat, lon) {
    const la = Number(lat), lo = Number(lon);
    return isFinite(la) && isFinite(lo) &&
      la >= this.LAT_MIN && la <= this.LAT_MAX &&
      lo >= this.LON_MIN && lo <= this.LON_MAX;
  },

  /** هل هذه المدينة كوبية؟ (لاستخدامها مع المدينة الثانوية) */
  appliesToCity(city) {
    if (!city) return false;
    const id = String(city.id || '');
    if (['havana', 'santiago_de_cuba', 'holguin'].includes(id)) return true;
    if (/^America\/Havana$/i.test(String(city.tz || ''))) return true;
    const c = String(city.country || city.countryEn || city.countryAr || '');
    if (/cuba|كوبا/i.test(c)) return true;
    return this._inBox(city.lat != null ? city.lat : city.latitude,
                       city.lon != null ? city.lon : city.longitude);
  },

  /** توافق خلفي: كوبا تُطبَّق دائمًا (بلا نافذة زمنية) */
  applies() { return this.isCubaLocation(); },
  needsShift() { return this.isCubaLocation(); },
  inWindow() { return true; },

  /** رقم اليوم في السنة (1..366) */
  _dayOfYear(d) {
    const start = Date.UTC(d.getFullYear(), 0, 1);
    const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor((today - start) / 86400000) + 1;
  },

  /**
   * الظهيرة الشمسية بالدقائق منذ منتصف ليل UTC.
   * 720 − 4·خطالطول − معادلة الزمن (دقائق). دقة ≈ ±1 دقيقة.
   */
  solarNoonUtcMinutes(date, lon) {
    const n = this._dayOfYear(date || new Date());
    const B = 2 * Math.PI * (n - 81) / 364;
    const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
    return 720 - 4 * Number(lon) - eot;
  },

  _toMin(s) {
    const m = /^(\d{1,2}):(\d{2})/.exec(String(s || ''));
    if (!m) return null;
    const h = Number(m[1]), mi = Number(m[2]);
    if (!isFinite(h) || !isFinite(mi)) return null;
    return (h % 24) * 60 + mi;
  },

  /**
   * المنطقة الفعلية (بالساعات) التي تمثّلها هذه المواقيت.
   * تُقاس من منتصف (الشروق+المغرب) مقابل الظهيرة الشمسية، ثم تُقرّب لأقرب
   * نصف ساعة. ترجع null إذا تعذّر القياس.
   */
  detectOffset(timings, lon, date) {
    if (!timings || !isFinite(Number(lon))) return null;
    const rise = this._toMin(timings.Sunrise || timings.Shuruq || timings.Fajr);
    const set = this._toMin(timings.Maghrib || timings.Sunset || timings.Isha);
    let wall = null;
    if (rise != null && set != null) {
      let mid = ((rise + set) / 2) % 1440;
      if (set < rise) mid = ((rise + set + 1440) / 2) % 1440; // شروق/غروب عبر منتصف الليل
      wall = mid;
    } else if (this._toMin(timings.Dhuhr) != null) {
      wall = this._toMin(timings.Dhuhr);
    }
    if (wall == null) return null;
    const noon = this.solarNoonUtcMinutes(date || new Date(), lon);
    let diff = wall - noon;
    diff = ((diff + 720) % 1440 + 1440) % 1440 - 720; // إلى [-720, 720)
    return Math.round(diff / 30) / 2;
  },

  /**
   * يوحّد المواقيت إلى توقيت كوبا الصيفي (UTC−4).
   * @param {object} timings  كائن {Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha}
   * @param {number} lat, lon إحداثيات المدينة (lon لازمة للقياس)
   * @param {Date}   date     تاريخ المواقيت
   * @param {boolean} force   true = المدينة كوبية معروفة (المدينة الثانوية)
   */
  normalize(timings, lat, lon, date, force) {
    if (!timings || typeof timings !== 'object') return timings;
    if (timings._cubaNorm) return timings;
    const isCuba = (force === undefined) ? this.isCubaLocation() : !!force;
    if (!isCuba) return timings;

    let lo = (lon != null) ? Number(lon) : null;
    if (!isFinite(lo)) {
      try {
        const loc = (typeof AppState !== 'undefined' && AppState.location) ||
          (typeof Storage !== 'undefined' && Storage.get('last_location')) || null;
        if (loc) lo = Number(loc.longitude);
      } catch (e) { /* صامت */ }
    }
    const d = date instanceof Date ? date : new Date();
    const off = this.detectOffset(timings, lo, d);
    if (off === null) return timings;

    const delta = Math.round((this.OFFSET_H - off) * 60);
    const out = delta ? this.shiftTimings(timings, delta) : Object.assign({}, timings);
    try {
      out._cubaNorm = true;
      out._cubaDelta = delta;
      out._cubaFrom = off;
    } catch (e) { /* صامت */ }
    return out;
  },

  /** يحوّل كائن مواقيت نسبيًا بالساعات (توافق خلفي) */
  shiftTimings(t, minutes) {
    if (!t || typeof t !== 'object') return t;
    const delta = minutes || 60;
    const out = Object.assign({}, t);
    // لا نُزحزح إلا الحقول الزمنية النصية (نبقى على _estimated وأمثالها)
    Object.keys(out).forEach(k => {
      const v = out[k];
      if (typeof v !== 'string' || !/^\d{1,2}:\d{2}/.test(v)) return;
      const [hm, ...rest] = v.split(' ');
      const [h, m] = hm.split(':').map(Number);
      if (!isFinite(h) || !isFinite(m)) return;
      const total = ((h * 60 + m + delta) % 1440 + 1440) % 1440;
      out[k] = String(Math.floor(total / 60)).padStart(2, '0') + ':' +
        String(total % 60).padStart(2, '0') + (rest.length ? ' ' + rest.join(' ') : '');
    });
    return out;
  },
};

if (typeof window !== 'undefined') window.CubaTime = CubaTime;
