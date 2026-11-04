// ============================================================================
// native-bridge.js — يُحمَّل بعد app.js. كل شيء هنا محروس بـ if (window.Android)
// فيبقى سلوك المتصفح العادي (خارج تطبيق Android) كما هو بلا أي تغيير.
//
// إثبات ترتيب التحميل الآمن: initApp() في app.js تُستدعى فقط عبر
// document.addEventListener('DOMContentLoaded', initApp) (app.js هو آخر
// سكربت في index.html، و readyState ما زال 'loading' حين يُنفَّذ)، أي أن
// initApp — وبالتالي PrayerNotifications.scheduleDay/NotifCenter.init —
// لا تُستدعى إلا بعد أن ينفّذ هذا الملف بالكامل. لا حاجة لنقله قبل app.js.
// ============================================================================

(function () {
  if (typeof window === 'undefined' || !window.Android) return;

  const Android = window.Android;
  const log = (...a) => console.log('[native-bridge]', ...a);
  const warn = (...a) => console.warn('[native-bridge]', ...a);

  // ==========================================================================
  // 1) الصوت — اعتراض RadioService بالكامل (وليس #audio-player ولا arabic-audio.js)
  // ==========================================================================
  if (typeof RadioService !== 'undefined') {
    const R = RadioService;
    // v1.0.74: نستبدل «طبقة الإخراج» فقط (_load/_resume/_pause/_seek/_posMs/_durMs/_stopOut)
    // بأوامر ExoPlayer الأصلية — كل المنطق (البدائل، التكرار، الآية الحالية من
    // الموضع، الترجمة الحية) يبقى في radio-service.js بلا ازدواج.
    // this.audio يبقى عنصراً حقيقياً بلا src (لا يلمس الشبكة أبداً).
    R._nPos = 0; R._nDur = 0; R._nAt = 0; R._nPlaying = false;
    // v1.0.126: الملفات المنزَّلة (blob:/data:) تُشغَّل بعنصر <audio> في WebView —
    // ExoPlayer يرفض أي رابط غير https، والتشغيل المحلي لا يحتاج خدمة أمامية.
    const base = {
      load: R._load.bind(R), resume: R._resume.bind(R), pause: R._pause.bind(R),
      seek: R._seek.bind(R), pos: R._posMs.bind(R), dur: R._durMs.bind(R), stop: R._stopOut.bind(R),
    };
    R._load = function (url, meta) {
      this.ensureAudio();
      const u = typeof url === 'string' ? url : (url && url.url) || '';
      if (this._localPlay || /^(blob:|data:|file:)/i.test(u)) { this._nPos = 0; this._nDur = 0; return base.load(url, meta); }
      const resolve = !!(url && typeof url === 'object' && url.resolve);
      this._nPos = (meta && meta.startMs) || 0; this._nDur = 0; this._nAt = Date.now(); this._nPlaying = false;
      Android.playStream(JSON.stringify({
        url: u, resolve, startMs: (meta && meta.startMs) || 0,
        title: (meta && meta.title) || 'Quba', artist: (meta && meta.artist) || 'Quba', live: !!(meta && meta.live),
      }));
    };
    R._resume = function () { if (this._localPlay) return base.resume(); Android.togglePlayback('play'); };
    R._pause = function () { if (this._localPlay) return base.pause(); Android.togglePlayback('pause'); };
    R._seek = function (ms) { if (this._localPlay) return base.seek(ms); this._nPos = ms; this._nAt = Date.now(); Android.restartCurrentTrack(Math.max(0, Math.round(ms))); };
    R._posMs = function () { if (this._localPlay) return base.pos(); return this._nPlaying ? this._nPos + (Date.now() - this._nAt) : this._nPos; };
    R._durMs = function () { if (this._localPlay) return base.dur(); return this._nDur > 0 ? this._nDur : 0; };
    R._stopOut = function () { if (this._localPlay) { this._localPlay = false; return base.stop(); } Android.stopPlayback(); this._nPlaying = false; };

    // togglePlayback('play'|'pause') صريح (لا تبديل أعمى)؛ restartCurrentTrack(ms) = تقديم.

    // تُستدعى من Kotlin بعد كل تغيّر حالة + نبضة كل ثانية أثناء التشغيل
    window.__onNativeAudioState = function (json) {
      try {
        const s = typeof json === 'string' ? JSON.parse(json) : json;
        if (typeof s.position === 'number') { R._nPos = Math.max(0, s.position); R._nAt = Date.now(); }
        if (typeof s.duration === 'number' && s.duration > 0) R._nDur = s.duration;
        R._nPlaying = s.state === 'playing';
        if (!R.mode) return; // أُوقف من الواجهة
        // v1.0.82: إيقاف من شريط التحكّم في الإشعار — نُصفّر الواجهة هنا فقط
        // (بلا استدعاء أوامر أصلية، فلا خطر حلقة أو إعادة تشغيل الخدمة).
        if (s.stopped) {
          R.state = 'idle'; R.mode = null; R.station = null; R.quran = null;
          R._nPlaying = false; R._nPos = 0; R._nDur = 0;
          try { R._emit(); } catch (e) { warn('emit after native stop failed', e); }
          return;
        }
        if (s.error) { warn('native audio error:', s.error); R._onError(); return; }
        if (s.ended) { R._onEnded(); return; }
        const prev = R.state;
        if (s.state === 'playing' || s.state === 'loading') R.state = s.state;
        else if (s.state === 'paused' && R.state !== 'error') R.state = 'paused';
        if (s.tick) { R._onTick(); if (prev === R.state) return; }
        R._emit();
      } catch (e) { warn('__onNativeAudioState parse error', e); }
    };

    R.setSleep = function (minutes) {
      this.clearSleep(false);
      if (!minutes || minutes <= 0) { this._emit(); return; }
      this.sleep = { endAt: Date.now() + minutes * 60000, minutes, timeoutId: null, tickId: setInterval(() => this._emit(), 5000) };
      this.sleep.timeoutId = setTimeout(() => this.stopAll(), minutes * 60000 + 1500);
      Android.setSleepTimer(minutes);
      if (typeof showToast === 'function') showToast('🌙 ' + RadioData.L('sleepSetToast') + ' — ' + minutes + ' ' + RadioData.L('sleepMin'), 2500);
      this._emit();
    };
    const origClear = R.clearSleep.bind(R);
    R.clearSleep = function (emit = true) {
      const had = !!(this.sleep && this.sleep.endAt);
      origClear(emit);
      if (had) Android.setSleepTimer(0);
    };

    log('RadioService bridged (output layer → ExoPlayer)');
  } else {
    warn('RadioService غير موجود عند تحميل الجسر');
  }

  // ==========================================================================
  // 2) الأذان — AdhanService + جدولة PrayerNotifications
  // ==========================================================================
  if (typeof AdhanService !== 'undefined') {
    // وقت الصلاة (أو استدعاء داخل التطبيق): Native يقرأ آخر إعدادات محفوظة
    // ويشغّل أذان الفجر المختار للفجر فقط، والأذان العادي المختار لغيره.
    // الأذان كامل دائمًا.
    AdhanService.playFullAdhan = function (_unused, tag) {
      AdhanService.syncNative && AdhanService.syncNative();
      Android.playAdhan(tag || 'dhuhr');
    };
    AdhanService.stop = function () {
      try { Android.stopAdhanPreview(); } catch (_) {}
      Android.stopAdhan();
    };
    AdhanService.setVolume = function (v) { Android.setAdhanVolume(v); };
    // preview()/stopPreview()/syncNative() معرَّفة في adhan.js وتعمل عبر
    // Android.previewAdhan / stopAdhanPreview / updateAdhanSettings.
    // مزامنة أولية: يحفظ Native آخر اختيار حتى لو لم تُفتح الإعدادات.
    try { AdhanService.syncNative(); } catch (_) {}
    log('AdhanService bridged (playFullAdhan/stop/setVolume) + preview/sync native');

    // v1.0.81: الأذان فوق كل شيء — Native يُبلغنا ببدء/انتهاء الأذان فنوقف ما
    // تشغّله الواجهة من صوت (القرآن/الراديو/التلاوة). الاستئناف بعد الأذان يتولاه
    // ExoPlayer تلقائيًا عبر فقدان تركيز الصوت (AudioFocus) ثم عودته.
    window.__onAdhanStart = function () {
      try { document.querySelectorAll('audio,video').forEach(el => { try { el.pause(); } catch (_) {} }); } catch (_) {}
      try { if (typeof ArabicAudio !== 'undefined' && ArabicAudio.stop) ArabicAudio.stop(); } catch (_) {}
      try { if (typeof window.__qubaPauseForAdhan === 'function') window.__qubaPauseForAdhan(); } catch (_) {}
    };
    window.__onAdhanEnd = function () {
      try { if (typeof window.__qubaResumeAfterAdhan === 'function') window.__qubaResumeAfterAdhan(); } catch (_) {}
    };
  }

  // v1.0.89: الأذان فوق كل شيء — إيقاف مؤقّت لما يشغّله التطبيق (راديو/تلاوة/
  // قرّاء) قبل الأذان ثم استئنافه بعده. كان الأذان لا يُسمع إن كان مشغّل داخلي
  // يعمل (يحتكر مسار الصوت). القيمة محفوظة لنعرف هل نُعيد التشغيل بعد الأذان.
  let __qubaWasPlayingBeforeAdhan = false;
  window.__qubaPauseForAdhan = function () {
    try {
      if (typeof RadioService === 'undefined') return;
      __qubaWasPlayingBeforeAdhan = (RadioService.state === 'playing' || RadioService.state === 'loading');
      if (__qubaWasPlayingBeforeAdhan && typeof RadioService._pause === 'function') RadioService._pause();
    } catch (e) { warn('__qubaPauseForAdhan فشل', e); }
  };
  window.__qubaResumeAfterAdhan = function () {
    try {
      if (!__qubaWasPlayingBeforeAdhan) return;
      __qubaWasPlayingBeforeAdhan = false;
      if (typeof RadioService !== 'undefined' && typeof RadioService._resume === 'function') RadioService._resume();
    } catch (e) { warn('__qubaResumeAfterAdhan فشل', e); }
  };

  // لغة التطبيق المختارة → Native: كل نصوص الإشعارات والأذان تُعرض بلغة التطبيق
  // (ar / es / en) وليس بلغة النظام. تُرسل عند كل تحميل وعند كل تغيير للغة.
  function pushLocale() {
    try {
      Android.setLocale((typeof currentLocale !== 'undefined' && currentLocale) || 'ar');
    } catch (_) {}
  }
  pushLocale();
  if (typeof window.setLocale === 'function') {
    const origSetLocale = window.setLocale;
    window.setLocale = function () {
      const r = origSetLocale.apply(this, arguments);
      pushLocale();
      try { scheduleNative(); } catch (_) {}
      return r;
    };
  }

  // بناء JSON الجدولة الكامل من AppState + استدعاء API.getPrayerTimesMonth
  // الموجودة أصلًا (لا كود شبكي جديد) لتغطية 30 يومًا بنفس مصدر اليوم الحالي.
  async function buildScheduleJson() {
    const s = AppState.settings || {};
    // LocationService يخزّن {latitude, longitude} — القراءة القديمة (lat/lng) كانت ترجع
    // undefined فيفشل جلب الأيام 2–30 ويُجدول أذان اليوم فقط (لا أذان من الغد).
    const loc = (AppState.location && AppState.location.latitude != null ? AppState.location : null)
      || s.lastLocation
      || (typeof Storage !== 'undefined' ? Storage.get('last_location') : null);
    if (!loc || !AppState.timings) {
      warn('لا إحداثيات أو مواقيت اليوم — تعذّر بناء الجدولة');
      return null;
    }
    const lat = loc.latitude != null ? loc.latitude : loc.lat;
    const lon = loc.longitude != null ? loc.longitude : (loc.lng != null ? loc.lng : loc.lon);
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      warn('إحداثيات غير صالحة — تعذّر بناء الجدولة');
      return null;
    }
    const method = s.calculationMethod != null ? s.calculationMethod : 3;
    const today = new Date();

    // اليوم الحالي = AppState.timings كما وصل فعليًا للواجهة (أيًا كان مصدره)
    const days = [{
      date: _ymd(today),
      timings: AppState.timings,
      source: 'appstate_today',
    }];

    // الأيام 2–30: نفس مصدر اليوم عبر API.getPrayerTimesMonth (Aladhan شهري
    // + دمج تلقائي لأي يوم MuslimPro مخزَّن + PrayerCalc fallback عند فشل
    // الشبكة بالكامل — كل هذا منطق موجود أصلًا في api.js، لا نضيف شيئًا).
    try {
      const months = new Set();
      for (let i = 1; i < 30; i++) {
        const d = new Date(today); d.setDate(d.getDate() + i);
        months.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
      }
      const monthCache = {};
      for (const key of months) {
        const [y, m] = key.split('-').map(Number);
        monthCache[key] = await API.getPrayerTimesMonth(lat, lon, m, y, method);
      }
      for (let i = 1; i < 30; i++) {
        const d = new Date(today); d.setDate(d.getDate() + i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const monthData = monthCache[key] || [];
        const row = monthData.find(r => {
          const g = r && r.date && r.date.gregorian && r.date.gregorian.date; // DD-MM-YYYY
          if (!g) return false;
          const [dd, mm, yy] = g.split('-').map(Number);
          return dd === d.getDate() && mm === (d.getMonth() + 1) && yy === d.getFullYear();
        });
        if (row && row.timings) {
          days.push({ date: _ymd(d), timings: row.timings, source: row._source || 'aladhan_month' });
        } else {
          warn('يوم بلا بيانات من getPrayerTimesMonth، سيُهمَل:', _ymd(d));
        }
      }
    } catch (e) {
      warn('فشل جلب تقويم الشهر — الأيام 2–30 ستعتمد على PrayerCalc فقط عبر fallback الداخلي في getPrayerTimesMonth نفسها:', e.message);
    }

    // المفتاح الرئيسي prayer_notif_enabled يوقف كل الصلوات دفعة واحدة (زر
    // "تعطيل الإشعارات" في الإعدادات) — إن كان معطلاً نُرسل قائمة فارغة
    // فيُلغي Native كل المنبّهات المجدولة دون حذف بقية بيانات الجدولة.
    const masterEnabled = !(typeof PrayerNotifications !== 'undefined' && PrayerNotifications.isEnabled && !PrayerNotifications.isEnabled());
    const enabledPrayers = masterEnabled
      ? ((s.prayer_notif_prayers) || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'])
      : [];

    // تذكيرات لا تحتاج صوت أذان (الصلاة على النبي + أدعية الصباح/المساء) —
    // مضمومة بناءً على قرار صريح: لا يجوز أن تعمل فقط والتطبيق مفتوح بينما
    // الأذان يعمل مقفلاً، هذا سلوك غير متسق.
    const notifCenterCfg = (typeof Storage !== 'undefined' ? Storage.get('notif_center') : null) || {};
    const reminders = [];

    // 🌹 الصلاة على النبي ﷺ: الفترة من الإعدادات (كل نصف ساعة/ساعة/ساعتين/
    // 3 ساعات/إيقاف) ضمن 9 صباحًا → 9 مساءً. 'off' أو 0 = بلا تذكير.
    // times: قائمة مواعيد "HH:MM" دقيقة — يجدولها AdhanScheduler مباشرة.
    const salawatFreq = Number(notifCenterCfg.salawatFrequency != null ? notifCenterCfg.salawatFrequency : 180);
    if (notifCenterCfg.salawat !== false && salawatFreq > 0) {
      const times = [];
      for (let min = 9 * 60; min <= 21 * 60; min += salawatFreq) {
        times.push(String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0'));
      }
      reminders.push({ type: 'reminder', id: 'salawat', label: 'salawat', times, sound: 'salawat' });
    }
    if (notifCenterCfg.duaMorning !== false) {
      reminders.push({ type: 'reminder', id: 'dua_morning', label: 'dua_morning', hours: [7], sound: 'short' });
    }
    if (notifCenterCfg.duaEvening !== false) {
      reminders.push({ type: 'reminder', id: 'dua_evening', label: 'dua_evening', hours: [19], sound: 'short' });
    }
    // أذكار الصباح/المساء/النوم والاستغفار بمفتاحها المستقل (تعطيل دعاء المساء لا يعطّلها)
    if (notifCenterCfg.adhkar !== false) {
      reminders.push({ type: 'reminder', id: 'adhkar_morning', label: 'adhkar_morning', hours: [6], sound: 'system' });
      reminders.push({ type: 'reminder', id: 'adhkar_evening', label: 'adhkar_evening', hours: [18], sound: 'system' });
      reminders.push({ type: 'reminder', id: 'adhkar_sleep', label: 'adhkar_sleep', hours: [22], sound: 'system' });
      reminders.push({ type: 'reminder', id: 'istighfar', label: 'istighfar', hours: [15], sound: 'system' });
    }

    const persistent = !!(typeof NotifCenter !== 'undefined' && NotifCenter.isOn && NotifCenter.isOn('persistent')
      && typeof NotifPerm !== 'undefined' && NotifPerm.isGranted());

    return {
      generatedAt: Date.now(),
      persistent,
      locale: (typeof currentLocale !== 'undefined' && currentLocale) || s.locale || 'ar',
      enabledPrayers,
      adhan: (typeof AdhanService !== 'undefined' && AdhanService.getSettings)
        ? AdhanService.getSettings()   // { voice, fajrVoice, volume, muted } — مخطط نظيف دائمًا
        : (s.adhan || {}),
      prayerOffsets: s.prayerOffsets || {},
      // v1.0.81: إقامة الصلاة — إشعار مستقل + الوقت المتبقي في الإشعار الثابت
      iqama: (typeof AdhanService !== 'undefined' && AdhanService.iqamaSettings)
        ? AdhanService.iqamaSettings()
        : (s.iqama || { enabled: false, minutes: {} }),
      reminderEnabled: !!(typeof PrayerNotifications !== 'undefined' && PrayerNotifications.isReminderEnabled && PrayerNotifications.isReminderEnabled()),
      reminders,
      days,
    };
  }

  function _ymd(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  async function scheduleNative() {
    try {
      const json = await buildScheduleJson();
      if (!json) return;
      Android.schedulePrayerAlarms(JSON.stringify(json));
      log('schedulePrayerAlarms أُرسلت،', json.days.length, 'يومًا');
    } catch (e) {
      warn('فشل بناء/إرسال الجدولة:', e);
    }
  }

  if (typeof PrayerNotifications !== 'undefined') {
    // تصبح no-op للجدولة الزمنية فقط — تحديث الواجهة (شارات الحالة، إلخ)
    // إن وُجد في الدالة الأصلية لا نمسّه لأننا نستبدل الدالة كليًا؛ الواجهة
    // الحالية لا تعرض شيئًا مرتبطًا بـ scheduleDay نفسها بخلاف الجدولة.
    PrayerNotifications.scheduleDay = function (/* timings, locale */) {
      scheduleNative();
    };
    if (PrayerNotifications._refreshForNewDay) {
      PrayerNotifications._refreshForNewDay = function (/* locale */) {
        scheduleNative();
      };
    }
    // كل تغيير في المفاتيح يجب أن يصل للمنبّهات الأصلية (حتى عند إيقاف الكل — وإلا بقيت المنبّهات القديمة)
    ['disable', 'disableReminder', 'setPrayerOn'].forEach(function (fn) {
      if (typeof PrayerNotifications[fn] !== 'function') return;
      const orig = PrayerNotifications[fn].bind(PrayerNotifications);
      PrayerNotifications[fn] = function () {
        const r = orig.apply(null, arguments);
        scheduleNative();
        return r;
      };
    });
    log('PrayerNotifications.scheduleDay → schedulePrayerAlarms (no-op محليًا)');
  }

  // ==========================================================================
  // 3) الإشعار الثابت المتجدد وبطاقة تنبيه الأذان (NotifCenter)
  // ==========================================================================
  if (typeof NotifCenter !== 'undefined') {
    // الجدولة الأصلية (AlarmManager) تتولى الصلاة على النبي والأذكار — نعطّل مؤقّتات
    // الويب كي لا تتكرر النغمة/التوست أثناء فتح التطبيق.
    NotifCenter.scheduleDailyExtras = function () { /* Native */ };
    NotifCenter.startPersistent = function () { /* Native يتولاها الآن */ };
    NotifCenter._updatePersistent = function () { /* no-op — Native يحدّثها عند تغيّر الدقيقة/الحالة فقط */ };
    NotifCenter.showAdhanAlert = function (tag, title) {
      // نص الإشعار: آية/حديث صحيح مناسب للصلاة (من جدول NotifCenter نفسه)
      // مع عنوان «حان الآن موعد صلاة X» وزرَّي إيقاف الأذان/تذكير ١٠ دقائق.
      let hadith = '';
      try {
        const row = (NotifCenter.PRAYER_HADITHS || {})[tag];
        if (row) hadith = row[NotifCenter._loc()] || row.ar || '';
      } catch (e) {}
      Android.showNotification(JSON.stringify({
        title: title || '',
        body: hadith,
        tag: 'quba-adhan-' + tag,
        actions: [
          { id: 'stop', label: (typeof t === 'function' ? t('stopAdhan') : 'إيقاف الأذان') },
          { id: 'snooze', label: (typeof t === 'function' ? (t('remind10') || '⏰ تذكير بعد 10 دقائق') : '⏰ تذكير بعد 10 دقائق') },
        ],
      }));
    };
    // استقبال ضغطة الزر من Native
    window.__onNativeNotificationAction = function (tag, action) {
      const pk = String(tag || '').replace('quba-adhan-', '');
      if (action === 'stop') NotifCenter.stopAdhan('tray');
      else if (action === 'snooze') NotifCenter.snoozePrayer(pk);
    };
    if (typeof NotifCenter.set === 'function') {
      const origSet = NotifCenter.set.bind(NotifCenter);
      NotifCenter.set = function (k, v) {
        origSet(k, v);
        // خيارات إيقاف الأذان (قلب/صوت/قفل) تصل Native فورًا دون انتظار إعادة الجدولة
        try { if (typeof AdhanService !== 'undefined') AdhanService.syncNative(); } catch (_) {}
        scheduleNative();
      };
    }
    log('NotifCenter.startPersistent/_updatePersistent/showAdhanAlert bridged');
  }

  // ==========================================================================
  // 4) الملفات: تنزيل (blob:/data: عبر <a download>) والمشاركة
  // ==========================================================================
  const CHUNK_SIZE = 512 * 1024; // 512KB لكل شريحة base64 قبل الترميز

  async function sendBlobChunked(blob, name, mime, mode /* 'save' | 'share' */, extra) {
    const transferId = 'tx_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const total = blob.size;
    let offset = 0;
    try {
      while (offset < total) {
        const slice = blob.slice(offset, offset + CHUNK_SIZE);
        const b64 = await blobToBase64(slice);
        const isLast = offset + CHUNK_SIZE >= total;
        if (mode === 'share') {
          Android.shareFileChunk(transferId, b64, offset === 0, isLast, name, mime, extra && extra.text || '', extra && extra.title || '');
        } else {
          Android.saveFileChunk(transferId, b64, offset === 0, isLast, name, mime);
        }
        offset += CHUNK_SIZE;
      }
    } catch (e) {
      warn('فشل نقل الملف، إلغاء:', e);
      try { Android.cancelTransfer(transferId); } catch (_) {}
    }
  }

  // يتيح لـ MainActivity (DownloadListener) تمرير أي blob لا يمر عبر
  // <a download> لنفس مسار الحفظ المقسّم — بدونه تُبتلع بعض التنزيلات صامتًا.
  window.__qubaSendBlobToNative = sendBlobChunked;

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  // ------------------------------------------------------------------
  // سبب «التحميل لا يعمل» كان من شيئين:
  //  1) سياسة CSP لم تسمح بـ fetch(blob:) فكان قراءة الـ Blob تفشل بصمت.
  //  2) jsPDF/FileSaver يضغطان رابطًا غير مُلحق بالصفحة (detached) فلا يصل
  //     حدث click إلى document ولا يُلتقط أبدًا.
  // الحل: (أ) تسجيل كل Blob عند URL.createObjectURL وقراءته مباشرة بلا fetch،
  // (ب) اعتراض HTMLAnchorElement.click و dispatchEvent للروابط ذات download.
  // ------------------------------------------------------------------
  const blobRegistry = new Map(); // blobUrl -> Blob
  try {
    const origCreate = URL.createObjectURL.bind(URL);
    const origRevoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = function (obj) {
      const u = origCreate(obj);
      try {
        if (typeof Blob !== 'undefined' && obj instanceof Blob) {
          blobRegistry.set(u, obj);
          if (blobRegistry.size > 24) blobRegistry.delete(blobRegistry.keys().next().value);
        }
      } catch (_) {}
      return u;
    };
    URL.revokeObjectURL = function (u) {
      // تأخير الحذف: التطبيقات تلغي الرابط مباشرة بعد click بينما النقل ما زال جاريًا
      setTimeout(function () { blobRegistry.delete(u); }, 60000);
      return origRevoke(u);
    };
  } catch (e) { warn('تعذّر تسجيل Blob:', e); }

  function dataUrlToBlob(href) {
    const comma = href.indexOf(',');
    if (comma < 0) return null;
    const meta = href.slice(5, comma);
    const mime = meta.split(';')[0] || 'application/octet-stream';
    const body = href.slice(comma + 1);
    if (/;base64/i.test(meta)) {
      const bin = atob(body);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: mime });
    }
    return new Blob([decodeURIComponent(body)], { type: mime });
  }

  async function resolveBlob(href) {
    if (blobRegistry.has(href)) return blobRegistry.get(href);
    if (/^data:/i.test(href)) return dataUrlToBlob(href);
    const r = await fetch(href); // احتياط (يتطلب blob: في connect-src)
    return await r.blob();
  }

  function defaultName(blob) {
    const ext = ({ 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp',
      'application/pdf': '.pdf', 'application/json': '.json', 'text/plain': '.txt' })[blob.type] || '';
    return 'quba-file-' + Date.now() + ext;
  }

  async function downloadHref(href, name) {
    try {
      const blob = await resolveBlob(href);
      if (!blob) throw new Error('no blob');
      sendBlobChunked(blob, name || defaultName(blob), blob.type || 'application/octet-stream', 'save');
    } catch (err) {
      warn('تعذّر قراءة الملف للتنزيل:', err);
      if (typeof showToast === 'function') showToast('⚠️ ' + (_nbMsg('تعذّر حفظ الملف', 'No se pudo guardar el archivo', 'Could not save the file')), 3000);
    }
  }

  // يستدعيها MainActivity (DownloadListener) لأي تنزيل blob: لم نعترضه
  window.__qubaDownloadUrl = function (url, mime) {
    downloadHref(url, null);
  };

  function isDownloadAnchor(a) {
    try {
      if (!a || a.tagName !== 'A' || !a.hasAttribute('download')) return false;
      return /^(blob:|data:)/i.test(a.getAttribute('href') || a.href || '');
    } catch (_) { return false; }
  }

  function handleDownloadAnchor(a) {
    downloadHref(a.getAttribute('href') || a.href, a.getAttribute('download') || '');
  }

  try {
    const origAClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (isDownloadAnchor(this)) { handleDownloadAnchor(this); return; }
      return origAClick.apply(this, arguments);
    };
    const origDispatch = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.dispatchEvent = function (ev) {
      if (ev && ev.type === 'click' && isDownloadAnchor(this)) { handleDownloadAnchor(this); return true; }
      return origDispatch.apply(this, arguments);
    };
  } catch (e) { warn('تعذّر اعتراض الروابط:', e); }

  // نقرة حقيقية من المستخدم على <a download> (مُلحق بالصفحة)
  document.addEventListener('click', function (e) {
    const a = e.target && e.target.closest && e.target.closest('a[download]');
    if (!a || !isDownloadAnchor(a)) return;
    e.preventDefault();
    handleDownloadAnchor(a);
  }, true);

  function _nbMsg(ar, es, en) {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
    return l === 'ar' ? ar : (l === 'en' ? en : es);
  }

  // نتيجة الحفظ من Kotlin: رسالة واضحة للمستخدم (كان الحفظ صامتًا فيظنه لا يعمل)
  window.__onNativeFileResult = function (r) {
    if (!r || typeof showToast !== 'function') return;
    if (r.op === 'share') { if (!r.ok) showToast('⚠️ ' + _nbMsg('تعذّرت المشاركة', 'No se pudo compartir', 'Could not share'), 3000); return; }
    if (r.ok) {
      const where = (r.folder && /Pictures/.test(r.folder))
        ? _nbMsg('المعرض (Pictures/Quba)', 'la galería (Pictures/Quba)', 'the gallery (Pictures/Quba)')
        : _nbMsg('التنزيلات (Download)', 'Descargas (Download)', 'Downloads');
      showToast('✅ ' + _nbMsg('تم الحفظ في ', 'Guardado en ', 'Saved to ') + where + ' — ' + (r.name || ''), 4200);
    } else if (r.error === 'storage_permission_requested') {
      showToast('🔒 ' + _nbMsg('اسمح بالتخزين ثم أعد المحاولة', 'Permite el almacenamiento y vuelve a intentarlo', 'Allow storage, then try again'), 4200);
    } else {
      showToast('⚠️ ' + _nbMsg('تعذّر حفظ الملف', 'No se pudo guardar el archivo', 'Could not save the file'), 3500);
    }
  };

  // navigator.share / canShare
  try {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: function (data) {
        data = data || {};
        return new Promise((resolve, reject) => {
          if (data.files && data.files.length) {
            const f = data.files[0];
            sendBlobChunked(f, f.name || 'share', f.type || 'application/octet-stream', 'share', { text: data.text || '', title: data.title || '' })
              .then(resolve).catch(reject);
          } else {
            Android.shareText(data.text || data.url || '');
            resolve();
          }
        });
      },
    });
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: function () { return true; },
    });
    log('navigator.share/canShare bridged');
  } catch (e) {
    warn('تعذّر استبدال navigator.share:', e);
  }

  log('native-bridge.js جاهز');
})();
