// v1.0.128 — توقيت كوبا الصيفي الدائم (قرار الحكومة: لا تغيير للتوقيت حتى ٧ نوفمبر ٢٠٢٧)
// كوبا كانت تعود إلى التوقيت الشتوي (UTC-5) في أول أحد من نوفمبر. القرار الرسمي
// جعل التوقيت الصيفي (UTC-4) ساريًا طوال الفترة حتى 2027-11-07، لكن قواعد
// المناطق الزمنية في الأجهزة/الخدمات ما زالت تُرجع -5 — فتصبح كل المواقيت
// متأخرة ساعة. هذا الملف يضيف الساعة المفقودة داخل نافذة القرار فقط.
const CubaTime = {
  // من لحظة كان يجب فيها التحوّل للشتوي (2026-11-01 01:00 -04) حتى نهاية القرار
  FROM: Date.UTC(2026, 10, 1, 5, 0, 0),
  UNTIL: Date.UTC(2027, 10, 7, 5, 0, 0), // 2027-11-07 01:00 -04

  inWindow(d) {
    const t = (d || new Date()).getTime();
    return t >= this.FROM && t <= this.UNTIL;
  },

  // فرق هافانا الحقيقي حسب قاعدة البيانات الزمنية للجهاز بالساعات (-5 شتوي / -4 صيفي)
  havanaOffset(d) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Havana', hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }).formatToParts(d || new Date()).reduce((o, p) => { o[p.type] = p.value; return o; }, {});
      const wall = Date.UTC(+parts.year, +parts.month - 1, +parts.day, (+parts.hour) % 24, +parts.minute);
      return Math.round((wall - (d || new Date()).getTime()) / 900000) / 4; // مضاعفات 15 دقيقة
    } catch (e) { return -4; }
  },

  // هل نحن داخل نافذة القرار والجهاز/الخدمة ما زالت على التوقيت الشتوي؟
  needsShift(d) {
    return this.inWindow(d) && this.havanaOffset(d) === -5;
  },

  isCubaLocation() {
    try {
      const loc = (typeof AppState !== 'undefined' && AppState.location) || null;
      if (loc) {
        const c = String(loc.country || loc.countryEn || loc.countryAr || '');
        if (/cuba|كوبا/i.test(c)) return true;
        const la = Number(loc.latitude), lo = Number(loc.longitude);
        if (isFinite(la) && isFinite(lo) && la > 19.7 && la < 23.4 && lo > -85.1 && lo < -73.9) return true;
      }
      const last = (typeof Storage !== 'undefined' && Storage.get('last_location')) || null;
      if (last) {
        const c2 = String(last.country || last.countryEn || last.countryAr || '');
        if (/cuba|كوبا/i.test(c2)) return true;
      }
    } catch (e) { /* صامت */ }
    return false;
  },

  applies(d) { return this.isCubaLocation() && this.needsShift(d); },

  appliesToCity(city) {
    if (!city) return false;
    const id = String(city.id || '');
    const c = String(city.country || city.countryEn || city.countryAr || '');
    return ['havana', 'santiago_de_cuba', 'holguin'].includes(id) || /cuba|كوبا/i.test(c);
  },

  shiftTimings(t, minutes) {
    if (!t || typeof t !== 'object') return t;
    const delta = minutes || 60;
    const out = Object.assign({}, t);
    Object.keys(out).forEach(k => {
      const v = out[k];
      if (typeof v !== 'string' || !/^\d{1,2}:\d{2}/.test(v)) return;
      const [hm, ...rest] = v.split(' ');
      const [h, m] = hm.split(':').map(Number);
      const total = ((h * 60 + m + delta) % 1440 + 1440) % 1440;
      out[k] = String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0')
        + (rest.length ? ' ' + rest.join(' ') : '');
    });
    return out;
  },
};

if (typeof window !== 'undefined') window.CubaTime = CubaTime;
