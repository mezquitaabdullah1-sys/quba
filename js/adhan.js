// 🕌 Adhan Service — كتالوج أصوات الأذان (ملفات محلية مضمّنة في التطبيق)
//
// • أذان عادي: يُشغَّل لصلوات الظهر والعصر والمغرب والعشاء (اختيار أذان).
// • أذان الفجر: يُشغَّل لصلاة الفجر فقط (اختيار أذان الفجر).
// • دائمًا أذان كامل — أُزيل خيار «أول تكبيرتين فقط» نهائيًا.
//
// الملفات موجودة في res/raw داخل مشروع Android، والتشغيل الفعلي (وقت الصلاة
// والمعاينة) يتم عبر الجسر الأصلي window.Android. خارج التطبيق لا توجد ملفات
// صوتية للتشغيل، فتفشل المعاينة بإشعار واضح بدل صمت.
//
// ⚠️ حقل `id` هنا يجب أن يطابق مفتاح AdhanSounds.kt حرفيًا.
const AdhanService = {
  // v1.0.71: «محمد جازي» هو الأذان الافتراضي للصلوات العادية وللفجر معًا
  DEFAULT_VOICE: 'mohammed_jazy',      // الأذان الأساسي الافتراضي: محمد جازي
  DEFAULT_FAJR_VOICE: 'fajr_mohammed_jazy',

  // type: 'regular' (باقي الصلوات) | 'fajr' (الفجر فقط)
  VOICES: [
    // ---------- الأذان العادي ----------
    { id: 'aqsa',          type: 'regular', flag: '🇵🇸', name: 'Mezquita de Al-Aqsa (suave)',   nameAr: 'المسجد الأقصى (هادئ)',      nameEn: 'Al-Aqsa Mosque (calm)',     country: 'Palestina',       countryAr: 'فلسطين',      countryEn: 'Palestine' },
    { id: 'makkah',        type: 'regular', flag: '🇸🇦', name: 'Masjid al-Haram',                nameAr: 'الحرم المكي',               nameEn: 'Al-Haram Mosque',           country: 'La Meca',         countryAr: 'مكة المكرمة', countryEn: 'Makkah' },
    { id: 'riyadh',        type: 'regular', flag: '🇸🇦', name: 'Riad',                           nameAr: 'الرياض',                    nameEn: 'Riyadh',                    country: 'Arabia Saudita',  countryAr: 'السعودية',    countryEn: 'Saudi Arabia' },
    { id: 'cairo',         type: 'regular', flag: '🇪🇬', name: 'El Cairo (1)',                   nameAr: 'القاهرة (١)',               nameEn: 'Cairo (1)',                 country: 'Egipto',          countryAr: 'مصر',         countryEn: 'Egypt' },
    { id: 'cairo2',        type: 'regular', flag: '🇪🇬', name: 'El Cairo (2)',                   nameAr: 'القاهرة (٢)',               nameEn: 'Cairo (2)',                 country: 'Egipto',          countryAr: 'مصر',         countryEn: 'Egypt' },
    { id: 'manshawy',      type: 'regular', flag: '🕌',  name: 'Al-Minshawi',                    nameAr: 'المنشاوي',                  nameEn: 'Al-Minshawi',               country: '', countryAr: '', countryEn: '' },
    { id: 'mohammed_jazy', type: 'regular', flag: '🕌',  name: 'Mohammed Jazy',                  nameAr: 'محمد جازي',                 nameEn: 'Mohammed Jazy',             country: '', countryAr: '', countryEn: '' },
    { id: 'adham_sharqawy',type: 'regular', flag: '🕌',  name: 'Adham Al-Sharqawi',              nameAr: 'أدهم الشرقاوي',             nameEn: 'Adham Al-Sharqawi',         country: '', countryAr: '', countryEn: '' },
    { id: 'amman',         type: 'regular', flag: '🇯🇴', name: 'Amán',                           nameAr: 'عمّان',                     nameEn: 'Amman',                     country: 'Jordania',        countryAr: 'الأردن',      countryEn: 'Jordan' },
    { id: 'turkey',        type: 'regular', flag: '🇹🇷', name: 'Turquía',                        nameAr: 'تركيا',                     nameEn: 'Turkey',                    country: 'Turquía',         countryAr: 'تركيا',       countryEn: 'Türkiye' },
    { id: 'short',         type: 'regular', flag: '🕌',  name: 'Adhan abreviado',                nameAr: 'الأذان المختصر',            nameEn: 'Short adhan',               country: '', countryAr: '', countryEn: '' },
    // v1.0.72: ملف صوتي من ملفات الجهاز (audio/*) — ملف واحد لكل نوع
    { id: 'custom',        type: 'regular', flag: '📁',  name: 'Desde mis archivos',              nameAr: 'من ملفاتي (مخصص)',          nameEn: 'From my files',             country: '', countryAr: '', countryEn: '' },

    // ---------- أذان الفجر (مع التثويب) ----------
    { id: 'fajr_makkah',        type: 'fajr', flag: '🇸🇦', name: 'Fajr — La Meca',          nameAr: 'فجر — مكة المكرمة',  nameEn: 'Fajr — Makkah',          country: '', countryAr: '', countryEn: '' },
    { id: 'fajr_madinah',       type: 'fajr', flag: '🇸🇦', name: 'Fajr — Medina',           nameAr: 'فجر — المدينة المنورة', nameEn: 'Fajr — Madinah',      country: '', countryAr: '', countryEn: '' },
    { id: 'fajr_cairo',         type: 'fajr', flag: '🇪🇬', name: 'Fajr — El Cairo',         nameAr: 'فجر — القاهرة',      nameEn: 'Fajr — Cairo',           country: '', countryAr: '', countryEn: '' },
    { id: 'fajr_mohammed_jazy', type: 'fajr', flag: '🕌',  name: 'Fajr — Mohammed Jazy',    nameAr: 'فجر — محمد جازي',    nameEn: 'Fajr — Mohammed Jazy',   country: '', countryAr: '', countryEn: '' },
    { id: 'fajr_calm',          type: 'fajr', flag: '🌅',  name: 'Fajr — suave',            nameAr: 'فجر — هادئ',         nameEn: 'Fajr — calm',            country: '', countryAr: '', countryEn: '' },
    { id: 'custom',             type: 'fajr', flag: '📁',  name: 'Desde mis archivos',      nameAr: 'من ملفاتي (مخصص)',   nameEn: 'From my files',          country: '', countryAr: '', countryEn: '' },
  ],

  _loc() {
    return (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
  },

  // ===================== v1.0.72: الأذان المخصص (ملف من الجهاز) =====================

  /** حالة الأذان المخصص: { items:[{id,name,type}], regular, fajr } */
  customState() {
    try {
      if (typeof window !== 'undefined' && window.Android && window.Android.getCustomAdhan) {
        return JSON.parse(window.Android.getCustomAdhan() || '{}') || {};
      }
    } catch (e) {}
    return {};
  },

  /** v1.0.81: «ملفاتي» — كل الأذانات المخصصة المحفوظة (بلا حد لعددها). */
  customItems() {
    const st = this.customState();
    return Array.isArray(st.items) ? st.items.filter(i => i && i.id) : [];
  },

  customItemsOf(type) {
    const t = type === 'fajr' ? 'fajr' : 'regular';
    return this.customItems().filter(i => (i.type || 'regular') === t);
  },

  customById(id) { return this.customItems().find(i => i.id === id) || null; },

  /** اسم ملف الأذان المخصص القديم (ملف واحد لكل نوع) أو null. */
  customFileName(isFajr) {
    const st = this.customState();
    return (isFajr ? st.fajr : st.regular) || null;
  },

  hasCustom(isFajr) {
    return this.customItemsOf(isFajr ? 'fajr' : 'regular').length > 0 || !!this.customFileName(isFajr);
  },

  /** v1.0.81: إعدادات إقامة الصلاة (دقائق بين الأذان والإقامة لكل صلاة). */
  iqamaSettings() {
    const def = { Fajr: 20, Dhuhr: 15, Asr: 15, Maghrib: 5, Isha: 15 };
    const s = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.iqama) || null;
    const out = s
      ? { enabled: s.enabled !== false, minutes: Object.assign({}, def, s.minutes || {}) }
      : { enabled: true, minutes: Object.assign({}, def) };
    // مزامنة مواقيت الإقامة المعروضة في صفحة الصلاة
    try { if (typeof IQAMAH_OFFSETS !== 'undefined') Object.assign(IQAMAH_OFFSETS, out.minutes); } catch (e) {}
    return out;
  },

  /** يفتح منتقي النظام (ملفات صوتية فقط) لإضافة أذان مخصص جديد إلى «ملفاتي». */
  pickCustom(isFajr) {
    if (typeof window === 'undefined' || !window.Android || !window.Android.pickCustomAdhan) {
      if (typeof showToast === 'function') showToast('⚠️ ' + (t('adhanCustomUnsupported') || 'غير مدعوم'), 2500);
      return;
    }
    try { window.Android.pickCustomAdhan(isFajr ? 'fajr' : 'regular'); } catch (e) {}
  },

  /** يحذف أذانًا مخصصًا: بمعرّفه (my_…) أو بالنوع القديم (regular/fajr). */
  deleteCustom(idOrType) {
    if (typeof window === 'undefined' || !window.Android || !window.Android.deleteCustomAdhan) return;
    try { window.Android.deleteCustomAdhan(String(idOrType || '')); } catch (e) {}
  },

  voiceName(voice) {
    if (!voice) return '';
    if (voice.custom) return voice.name || '';
    if (voice.id === 'custom') {
      const f = this.customFileName(voice.type === 'fajr');
      if (f) return f;
    }
    const loc = this._loc();
    if (loc === 'ar') return voice.nameAr || voice.name;
    if (loc === 'en') return voice.nameEn || voice.name;
    return voice.name;
  },

  voiceCountry(voice) {
    if (!voice) return '';
    const loc = this._loc();
    if (loc === 'ar') return voice.countryAr || voice.country || '';
    if (loc === 'en') return voice.countryEn || voice.country || '';
    return voice.country || '';
  },

  /** نص العرض في قائمة الاختيار: علم + اسم + (بلد). */
  voiceLabel(voice) {
    if (!voice) return '';
    const c = this.voiceCountry(voice);
    return `${voice.flag || '🕌'} ${this.voiceName(voice)}${c ? ' — ' + c : ''}`;
  },

  /** أصوات نوع معيّن: 'regular' أو 'fajr' — المضمّنة + أذانات «ملفاتي» المحفوظة. */
  voicesOf(type) {
    const t = type === 'fajr' ? 'fajr' : 'regular';
    const base = this.VOICES.filter(v => v.type === t && v.id !== 'custom');
    const mine = this.customItemsOf(t).map(i => ({
      id: i.id, type: t, custom: true, flag: '📁',
      name: i.name || i.id, nameAr: i.name || i.id, nameEn: i.name || i.id,
      country: '', countryAr: '', countryEn: '',
    }));
    const addNew = this.VOICES.find(v => v.id === 'custom' && v.type === t);
    return addNew ? base.concat(mine, [addNew]) : base.concat(mine);
  },

  _isValid(id, isFajr) {
    const t = isFajr ? 'fajr' : 'regular';
    if (this.customById(id)) return true;
    return this.VOICES.some(v => v.id === id && v.type === t);
  },

  /** يعيد الصوت المطلوب، أو الافتراضي المناسب إن كان المعرّف قديمًا/مجهولًا. */
  _resolveVoice(id, isFajr) {
    const t = isFajr ? 'fajr' : 'regular';
    const mine = this.customById(id);
    if (mine) {
      return {
        id: mine.id, type: t, custom: true, flag: '📁',
        name: mine.name || mine.id, nameAr: mine.name || mine.id, nameEn: mine.name || mine.id,
        country: '', countryAr: '', countryEn: '',
      };
    }
    const v = this.VOICES.find(x => x.id === id && x.type === t);
    if (v) return v;
    const fallbackId = isFajr ? this.DEFAULT_FAJR_VOICE : this.DEFAULT_VOICE;
    return this.VOICES.find(x => x.id === fallbackId);
  },

  previewAudio: null,   // معاينة المتصفح (غير مستخدمة عمليًا — لا توجد ملفات ويب)
  _previewId: null,     // معرّف الصوت الذي تجري معاينته حاليًا عبر Native
  _syncTimer: null,

  /**
   * يضبط AppState.settings.adhan على المخطط الجديد ويحذف الخيارات القديمة:
   *   { voice, fajrVoice, volume, muted }
   * القيم القديمة voice1 / voice2 / mode / takbeerDuration تُحذف، والمعرّفات
   * القديمة ('default' و'fajr_default' وغيرها) تتحول إلى الافتراضي الجديد
   * (الأقصى للعادي، مكة للفجر).
   */
  normalizeSettings() {
    if (typeof AppState === 'undefined' || !AppState.settings) return null;
    let a = AppState.settings.adhan;
    if (!a || typeof a !== 'object') { a = AppState.settings.adhan = {}; }
    let changed = false;

    // v1.0.71: ترحيل لمرة واحدة — الأذان الافتراضي صار «محمد جازي» (عادي وفجر).
    // يُطبَّق فقط على من بقي على الافتراضي القديم (الأقصى / فجر مكة)؛ من اختار
    // صوتًا آخر بنفسه يبقى على اختياره.
    if (!a._v170VoiceMigrated) {
      a._v170VoiceMigrated = true;
      changed = true;
      if (a.voice === 'aqsa') a.voice = this.DEFAULT_VOICE;
      if (a.fajrVoice === 'fajr_makkah') a.fajrVoice = this.DEFAULT_FAJR_VOICE;
    }
    if (!this._isValid(a.voice, false)) { a.voice = this.DEFAULT_VOICE; changed = true; }
    if (!this._isValid(a.fajrVoice, true)) { a.fajrVoice = this.DEFAULT_FAJR_VOICE; changed = true; }
    // v1.0.81: ترحيل «custom» القديم (ملف واحد لكل نوع) إلى أول ملف في «ملفاتي»
    const mig = (val, type, def) => {
      if (val !== 'custom') return val;
      const first = this.customItemsOf(type)[0];
      return first ? first.id : def;
    };
    const mv = mig(a.voice, 'regular', this.DEFAULT_VOICE);
    if (mv !== a.voice) { a.voice = mv; changed = true; }
    const mf = mig(a.fajrVoice, 'fajr', this.DEFAULT_FAJR_VOICE);
    if (mf !== a.fajrVoice) { a.fajrVoice = mf; changed = true; }
    if (typeof a.volume !== 'number' || !isFinite(a.volume)) { a.volume = 0.8; changed = true; }
    a.volume = Math.max(0, Math.min(1, a.volume));
    if (typeof a.muted !== 'boolean') { a.muted = !!a.muted; changed = true; }
    if (typeof a.duaAfterAdhan !== 'boolean') { a.duaAfterAdhan = true; changed = true; }

    ['voice1', 'voice2', 'mode', 'takbeerDuration'].forEach(k => {
      if (k in a) { delete a[k]; changed = true; }
    });

    if (changed && typeof Storage !== 'undefined' && Storage.saveSettings) {
      try { Storage.saveSettings(); } catch (e) { /* التخزين غير جاهز بعد */ }
    }
    return a;
  },

  /** قيمة مفتاح من NotifCenter (مفعّل افتراضيًا إن لم يكن متاحًا). */
  _nc(key) {
    try {
      if (typeof NotifCenter !== 'undefined' && NotifCenter.getSettings) return NotifCenter.getSettings()[key] !== false;
    } catch (e) {}
    return true;
  },

  /** نسخة نظيفة من الإعدادات (voice, fajrVoice, volume, muted + خيارات الإيقاف الثلاثة). */
  getSettings() {
    const a = this.normalizeSettings() || {};
    return {
      voice: this._isValid(a.voice, false) ? a.voice : this.DEFAULT_VOICE,
      fajrVoice: this._isValid(a.fajrVoice, true) ? a.fajrVoice : this.DEFAULT_FAJR_VOICE,
      volume: typeof a.volume === 'number' ? a.volume : 0.8,
      muted: !!a.muted,
      // v1.0.81: دعاء ما بعد الأذان (مقطع ١٩ ثانية) — يُشغَّل بعد كل أذان
      duaAfterAdhan: a.duaAfterAdhan !== false,
      // v1.0.76: خيارات «إيقاف الأذان» — قلب الهاتف / زر التشغيل (القفل).
      // أُزيل «أزرار الصوت» لأن WebView/الخدمة لا تستقبل مفتاح الصوت أصلًا فلن يعمل.
      stopOnFlip: this._nc('flipToStop'),
      stopOnVolume: false,
      stopOnLock: this._nc('powerToStop'),
    };
  },

  /**
   * يرسل الإعدادات الحالية لـ Native فورًا (بدون إعادة جدولة المنبّهات)
   * ليستخدمها الأذان القادم. تُستدعى بعد كل تغيير: صوت / فجر / كتم / مستوى.
   * مؤجَّلة 150ms لدمج تغييرات شريط الصوت المتتابعة.
   */
  syncNative() {
    if (typeof window === 'undefined' || !window.Android || !window.Android.updateAdhanSettings) return;
    if (this._syncTimer) clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => {
      this._syncTimer = null;
      try { window.Android.updateAdhanSettings(JSON.stringify(this.getSettings())); }
      catch (e) { console.warn('Adhan: تعذّر مزامنة الإعدادات مع Native', e); }
    }, 150);
  },

  /**
   * معاينة صوت محدد (بدون إشعار). الضغط مرة ثانية على نفس الصوت يوقفه.
   * المعاينة تتجاهل «كتم الأذان» عمدًا لأنها فعل صريح من المستخدم.
   */
  preview(voiceId) {
    // v1.0.81: يقبل الأصوات المضمّنة وأذانات «ملفاتي» المخصصة
    const voice = this.VOICES.find(v => v.id === voiceId)
      || this.customItems().map(i => ({ id: i.id, type: i.type || 'regular', custom: true, name: i.name }))
        .find(v => v.id === voiceId);
    if (!voice) return;

    if (this._previewId === voice.id) { this.stopPreview(); return; }
    this.stopPreview();

    if (typeof window !== 'undefined' && window.Android && window.Android.previewAdhan) {
      this._previewId = voice.id;
      try {
        window.Android.previewAdhan(voice.id, this.getSettings().volume, voice.type);
      } catch (e) {
        this._previewId = null;
        console.warn('Adhan preview failed:', e);
        if (typeof showToast === 'function') showToast('⚠️ ' + (t('adhanPlayError') || 'No se pudo reproducir'), 3000);
        return;
      }
      if (typeof showToast === 'function') showToast('🔊 ' + this.voiceName(voice), 1500);
      return;
    }

    // خارج تطبيق Android: لا توجد ملفات صوتية للتشغيل.
    console.warn('Adhan: المعاينة تتطلب تطبيق Android (الملفات داخل res/raw)');
    if (typeof showToast === 'function') showToast('⚠️ ' + (t('adhanPlayError') || 'No se pudo reproducir'), 3000);
  },

  stopPreview() {
    this._previewId = null;
    if (typeof window !== 'undefined' && window.Android && window.Android.stopAdhanPreview) {
      try { window.Android.stopAdhanPreview(); } catch (e) {}
    }
    if (this.previewAudio) {
      try { this.previewAudio.pause(); } catch (e) {}
      this.previewAudio = null;
    }
  },

  setVolume(v) {
    if (this.previewAudio) this.previewAudio.volume = v;
  },

  /**
   * تشغيل الأذان وقت الصلاة. في تطبيق Android تُستبدل هذه الدالة بالكامل في
   * native-bridge.js (Android.playAdhan) — الأذان كامل دائمًا، والفجر بصوت
   * أذان الفجر المختار، وباقي الصلوات بالأذان العادي المختار.
   * خارج التطبيق لا توجد ملفات صوتية، فلا تشغيل.
   */
  async playFullAdhan(onEnded, prayerKey) {
    if (typeof onEnded === 'string') { prayerKey = onEnded; onEnded = null; }
    console.warn('Adhan: لا تشغيل خارج تطبيق Android (الملفات داخل res/raw)', prayerKey || '');
    if (onEnded) onEnded();
    return false;
  },

  stop() {
    this.stopPreview();
  },
};

if (typeof window !== 'undefined') {
  window.AdhanService = AdhanService;
  // يستدعيها Native عند انتهاء المعاينة من تلقاء نفسها
  window.__onAdhanPreviewEnded = function () { AdhanService._previewId = null; };
}
