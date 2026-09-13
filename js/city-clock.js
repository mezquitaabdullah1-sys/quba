// 🌍⏰ CityClock (v43) — توقيت المدينة المختارة يدوياً
//
// الفكرة: مواقيت الصلاة التي تجلبها الـ APIs (Muslim Pro / Aladhan) تأتي
// أصلاً بالتوقيت المحلي للمدينة صاحبة الإحداثيات. المشكلة كانت أن التطبيق
// كان يفترض أن هذه المواقيت بتوقيت الجهاز، فيظهر «الوقت المتبقي للصلاة
// القادمة» خطأً عندما يختار المستخدم مدينة في بلد آخر.
//
// هنا نبني خريطة (إحداثيات → فرق التوقيت بالمللي ثانية):
//   • إذا كانت المدينة من قائمة Cities ولها منطقة IANA معروفة
//     (DualTiming._tzFor) → فرق دقيق يشمل التوقيت الصيفي للمدينة.
//   • وإلا (GPS أو مدينة بلا منطقة معروفة) → فرق = 0، أي يبقى توقيت الجهاز
//     كما طلب المستخدم: «إذا كنت فعلاً في هذه البلد واخترت الموقع من الـGPS
//     فإنه يظهر توقيتك العادي الخاص بالجهاز».
//
// ثم يستطيع أي كود تحويل وقت «المدينة» إلى لحظة حقيقية:
//   CityClock.toDate('19:42', delta) → Date بلحظة حدوث الصلاة فعلاً.
const CityClock = {
  /**
   * فرق التوقيت بالمللي ثانية: (توقيت المدينة) − (توقيت الجهاز).
   * يعيد 0 للمواقع عبر GPS أو غير المعروفة (لا تغيير عن السلوك السابق).
   */
  deltaMsFor(lat, lon, date = new Date()) {
    try {
      if (typeof Cities === 'undefined' || typeof DualTiming === 'undefined') return 0;
      const city = this._findCity(lat, lon);
      if (!city) return 0;
      const tz = DualTiming._tzFor(city);
      if (!tz) return 0;
      return DualTiming._tzOffsetMs(tz, date);
    } catch (e) { return 0; }
  },

  /** يبحث عن أقرب مدينة في القائمة ضمن ~15 كم من الإحداثيات */
  _findCity(lat, lon) {
    try {
      if (typeof Cities === 'undefined' || typeof Cities.match !== 'function') return null;
      // Cities.match يعيد أقرب مدينة ضمن ±0.15° (≈15 كم) أو null
      return Cities.match(lat, lon);
    } catch (e) { return null; }
  },

  /**
   * يحوّل وقت صلاة "HH:MM" (بتوقيت المدينة) إلى كائن Date بلحظة حدوثها
   * الفعلية على خط الزمن الحقيقي (أي بتوقيت الجهاز بعد تعويض الفرق).
   * @param {string} time24  مثل "19:42" أو "19:42 (+03)"
   * @param {number} deltaMs  ناتج deltaMsFor
   * @param {Date}   baseDate اليوم المرجعي (بتوقيت الجهاز)
   */
  toDate(time24, deltaMs, baseDate = new Date()) {
    const clean = String(time24 || '').split(' ')[0];
    const [h, m] = clean.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    // نبني التاريخ على «يوم المدينة» (اليوم المحلي للجهاز منزاحاً بفرق
    // التوقيت) ثم نطرح فرق المنطقتين: النتيجة لحظة حقيقية على خط الزمن.
    const cityNow = new Date(baseDate.getTime() + deltaMs);
    const cityMidnightUtc = Date.UTC(
      cityNow.getUTCFullYear(), cityNow.getUTCMonth(), cityNow.getUTCDate()
    ) - deltaMs;
    const deviceOffsetMs = -baseDate.getTimezoneOffset() * 60000;
    return new Date(cityMidnightUtc + (h * 60 + m) * 60000 - deviceOffsetMs);
  },
};

if (typeof window !== 'undefined') {
  window.CityClock = CityClock;
}
