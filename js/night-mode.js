// 🌙 NightMode (v1.0.73) — وضع ليلي تلقائي حسب الموقع والوقت.
//
// المنطق: «الليل» = من مغرب اليوم (الغروب) حتى شروق اليوم نفسه. فيصير المظهر
// داكنًا بعد المغرب ويعود فاتحًا عند الشروق — بحسب موقع المستخدم فعلًا، لا
// بحسب ساعة ثابتة في الجهاز.
//
// مصدر الأوقات (بالترتيب):
//   1) AppState.timings — أوقات الصلاة المحسوبة للتطبيق (تحترم طريقة الحساب
//      والتعديلات الإقليمية وتعديلات المستخدم اليدوية لكل صلاة).
//   2) PrayerCalc.getTimings() — حسبة فلكية محلية بلا شبكة إن لم تكن الأوقات جاهزة.
//   3) تقدير احتياطي بالساعة (19:00 / 06:00) إن لم يُعرف الموقع بعد.
//
// بلا شبكة وبلا أي طلب خارجي: فحص خفيف كل ٣٠ ثانية + عند كل عودة إلى التطبيق.
const NightMode = {
  THEME_ID: 'nightAuto',
  NIGHT_KEY: 'Maghrib',   // بداية الليل (الغروب)
  DAY_KEY: 'Sunrise',     // نهاية الليل (الشروق)
  TICK_MS: 30000,
  FALLBACK_NIGHT: 19 * 60, // 19:00
  FALLBACK_DAY: 6 * 60,    // 06:00

  _timer: null,
  _lastNight: null,

  /** هل الوضع الليلي التلقائي هو المظهر المختار حاليًا؟ */
  enabled() {
    return !!(typeof AppState !== 'undefined' && AppState.settings &&
              AppState.settings.theme === this.THEME_ID);
  },

  /** "HH:MM" أو "HH:MM (UTC+2)" → دقائق من منتصف الليل، أو null. */
  _hm(v) {
    if (!v) return null;
    const m = String(v).match(/(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const h = parseInt(m[1], 10), mi = parseInt(m[2], 10);
    if (!isFinite(h) || !isFinite(mi)) return null;
    return h * 60 + mi;
  },

  _fromTimings(tm) {
    if (!tm) return null;
    const s = this._hm(tm[this.DAY_KEY]), g = this._hm(tm[this.NIGHT_KEY]);
    if (s === null || g === null) return null;
    return { sunrise: s, maghrib: g, source: 'timings' };
  },

  _fromCalc(date) {
    try {
      const loc = (typeof AppState !== 'undefined') ? AppState.location : null;
      if (!loc || !isFinite(loc.lat) || !isFinite(loc.lng)) return null;
      if (typeof PrayerCalc === 'undefined' || typeof PrayerCalc.getTimings !== 'function') return null;
      const tm = PrayerCalc.getTimings(
        loc.lat, loc.lng, date,
        (AppState.settings && AppState.settings.calculationMethod) || 3,
        loc.country || '', loc.elevation || 0
      );
      const s = this._hm(tm && tm[this.DAY_KEY]), g = this._hm(tm && tm[this.NIGHT_KEY]);
      if (s === null || g === null) return null;
      return { sunrise: s, maghrib: g, source: 'calc' };
    } catch (e) { return null; }
  },

  /** {sunrise, maghrib, source} بالدقائق لليوم الحالي — بلا شبكة. */
  times(date = new Date()) {
    return this._fromTimings(typeof AppState !== 'undefined' ? AppState.timings : null)
        || this._fromCalc(date)
        || { sunrise: this.FALLBACK_DAY, maghrib: this.FALLBACK_NIGHT, source: 'fallback' };
  },

  /** هل نحن في الليل الآن؟ (بعد الغروب أو قبل الشروق) */
  isNight(date = new Date()) {
    const tm = this.times(date);
    const mins = date.getHours() * 60 + date.getMinutes();
    if (tm.maghrib === tm.sunrise) return mins >= tm.maghrib; // حالة قطبية نادرة
    return mins >= tm.maghrib || mins < tm.sunrise;
  },

  /** المظهر الذي يفرضه الوضع التلقائي: داكن ليلًا وفاتح نهارًا. */
  resolvedTheme(date = new Date()) {
    return this.isNight(date) ? 'dark' : 'light';
  },

  /** وقت بصيغة ١٢ ساعة حسب لغة الواجهة (٦:٣١ ص / 6:31 AM). */
  _fmt(mins) {
    const h = Math.floor(mins / 60), m = mins % 60;
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    const mm = String(m).padStart(2, '0');
    const loc = (typeof currentLocale !== 'undefined') ? currentLocale : 'es';
    const ap = loc === 'ar' ? (h < 12 ? 'ص' : 'م') : (h < 12 ? 'AM' : 'PM');
    return h12 + ':' + mm + ' ' + ap;
  },

  /** نص حالة مختصر يُعرض في صفّ المظهر: «ليلي الآن — حتى ٦:٣١ ص». */
  statusText(date = new Date()) {
    if (!this.enabled()) return '';
    const tm = this.times(date);
    const night = this.isNight(date);
    const label = t(night ? 'nightAutoNight' : 'nightAutoDay');
    if (tm.source === 'fallback') return label;
    const prep = t(night ? 'nightAutoUntil' : 'nightAutoFrom');
    return label + ' — ' + prep + ' ' + this._fmt(night ? tm.sunrise : tm.maghrib);
  },

  /** يُطبّق المظهر (applyTheme يقرأ resolvedTheme ويضبط مؤشّر data-night-auto). */
  apply() {
    if (typeof applyTheme === 'function') applyTheme();
  },

  /** إعادة تقييم فورية بلا إعلان (عند تغيير المظهر أو تحديث الأوقات). */
  refresh() {
    this._tick(false);
  },

  /** الفحص الدوري: يبدّل المظهر عند الغروب/الشروق ويُعلن بلطف مرة واحدة. */
  _tick(announce) {
    if (!this.enabled()) {
      this._lastNight = null;
      return;
    }
    const night = this.isNight();
    const changed = (this._lastNight !== null && this._lastNight !== night);
    this._lastNight = night;
    this.apply();
    if (changed && announce) {
      try {
        if (typeof showToast === 'function') {
          showToast((night ? '🌙 ' : '☀️ ') + t(night ? 'nightAutoOn' : 'nightAutoOff'), 3200);
        }
      } catch (e) { /* صامت */ }
    }
  },

  /** التشغيل مرة واحدة عند إقلاع التطبيق. */
  start() {
    if (this._timer) return;
    this._tick(false); // المظهر يُطبَّق فورًا وبلا إعلان عند الإقلاع
    this._timer = setInterval(() => this._tick(true), this.TICK_MS);
    // العودة إلى التطبيق بعد غياب طويل (قد يكون مضى غروب أو شروق)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this._tick(true);
    });
    window.addEventListener('focus', () => this._tick(true));
    // عند تحديث أوقات الصلاة (مدينة جديدة، يوم جديد، طريقة حساب) يُعاد التقييم
    window.addEventListener('quba-timings-updated', () => this._tick(false));
  },
};
