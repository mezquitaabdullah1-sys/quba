// 🔔 مركز الإشعارات المتكامل — NotifCenter (v55)
//
// نظام إشعارات مع صوت يشمل:
//   1) تنبيه الأذان: بطاقة «حان وقت أذان صلاة X» مع حديث/آية مناسبة للصلاة
//      + زر «إيقاف الأذان» + زر «تذكير بعد 15 دقيقة» (يعيد إشعار «هل صليت؟»)
//      + إيقاف الأذان عند قلب الهاتف / زر الصوت / زر التشغيل (إطفاء الشاشة)
//   2) الصلاة على النبي ﷺ كل 3 ساعات من 9 صباحاً إلى 9 مساءً مع صوت
//   3) دعاء الصباح ودعاء المساء مع صوت
//   4) «اقتربت الصلاة» (قبل 15 دقيقة) الآن مع صوت تنبيه — انظر notifications.js
//   5) إشعار ثابت بالصلاة القادمة والوقت المتبقي (يُحدَّث كل دقيقة)
//   كل عنصر له مفتاح تفعيل/إيقاف مستقل في إعدادات «الأذان والإشعارات».
const NotifCenter = {
  storageKey: 'notif_center',

  // الإعدادات الافتراضية — كلها مفعّلة ما عدا ما يعطّله المستخدم
  defaults: {
    adhanAlert: true,    // بطاقة الأذان مع حديث + أزرار
    snooze: true,        // تذكير «هل صليت؟» بعد 15 دقيقة
    salawat: true,       // الصلاة على النبي كل 3 ساعات (9ص–9م)
    salawatVoice: true,  // نطق الصلاة على النبي صوتياً (TTS عربي) + نغمة
    duaMorning: true,    // دعاء الصباح 07:00
    duaEvening: true,    // دعاء المساء 19:00
    persistent: true,    // إشعار ثابت بالصلاة القادمة والوقت المتبقي
    flipToStop: true,    // إيقاف الأذان عند قلب الهاتف (وجهه للأسفل)
    volumeToStop: true,  // إيقاف الأذان بأزرار الصوت
    powerToStop: true,   // إيقاف الأذان بزر التشغيل (إطفاء الشاشة)
  },

  timers: [],
  _persistTimer: null,
  _audioCtx: null,
  _flipCount: 0,
  _sensorsAttached: false,

  getSettings() {
    const saved = (typeof Storage !== 'undefined' && Storage.get(this.storageKey)) || {};
    return Object.assign({}, this.defaults, saved);
  },

  isOn(key) { return this.getSettings()[key] === true; },

  set(key, value) {
    const s = this.getSettings();
    s[key] = !!value;
    Storage.set(this.storageKey, s);
    this.init(); // إعادة الجدولة فوراً بالإعداد الجديد
  },

  _loc() {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    return ['ar', 'es', 'en'].includes(l) ? l : 'es';
  },

  // ============ نصوص ثلاثية اللغة ============
  STR: {
    adhanTitle:   { ar: 'حان وقت أذان صلاة {p}', es: 'Es la hora del adhan de {p}', en: 'It is time for {p} prayer' },
    stopAdhan:    { ar: 'إيقاف الأذان', es: 'Apagar el adhan', en: 'Stop adhan' },
    snooze15:     { ar: '⏰ تذكير بعد ١٥ دقيقة', es: '⏰ Recordar en 15 minutos', en: '⏰ Remind me in 15 minutes' },
    close:        { ar: 'إغلاق', es: 'Cerrar', en: 'Close' },
    didYouPray:   { ar: 'هل صليت صلاة {p}؟ 🤲', es: '¿Ya rezaste {p}? 🤲', en: 'Did you pray {p}? 🤲' },
    didYouPrayB:  { ar: 'لا تنسَ صلاتك — «إن الصلاة كانت على المؤمنين كتاباً موقوتاً»', es: 'No olvides tu oración — «La oración es un precepto en momentos determinados» (4:103)', en: "Don't forget your prayer — 'Prayer is decreed at specified times' (4:103)" },
    salawatTitle: { ar: '🌹 الصلاة على النبي ﷺ', es: '🌹 Salawat sobre el Profeta ﷺ', en: '🌹 Salawat upon the Prophet ﷺ' },
    salawatBody:  { ar: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ — «مَنْ صَلَّى عَلَيَّ صَلَاةً وَاحِدَةً صَلَّى اللهُ عَلَيْهِ بِهَا عَشْرًا» (رواه مسلم)', es: 'Oh Allah, envía Tu paz y bendiciones sobre nuestro Profeta Muhammad ﷺ — «Quien me envía una salawat, Allah le envía diez» (Muslim)', en: 'O Allah, send peace and blessings upon our Prophet Muhammad ﷺ — "Whoever sends one salawat upon me, Allah sends ten upon him" (Muslim)' },
    duaMorTitle:  { ar: '☀️ أذكار الصباح', es: '☀️ Du\'a de la mañana', en: '☀️ Morning dua' },
    duaMorBody:   { ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', es: 'Oh Allah, por Ti amanecemos y por Ti atardecemos, por Ti vivimos y por Ti morimos, y a Ti es la resurrección.', en: 'O Allah, by You we enter the morning and by You the evening; by You we live and die, and to You is the resurrection.' },
    duaEveTitle:  { ar: '🌙 أذكار المساء', es: '🌙 Du\'a de la tarde', en: '🌙 Evening dua' },
    duaEveBody:   { ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', es: 'Oh Allah, por Ti atardecemos y por Ti amanecemos, por Ti vivimos y por Ti morimos, y a Ti es el destino final.', en: 'O Allah, by You we enter the evening and by You the morning; by You we live and die, and to You is the final return.' },
    nextPrayer:   { ar: 'الصلاة القادمة', es: 'Próxima oración', en: 'Next prayer' },
    remaining:    { ar: 'المتبقي', es: 'restante', en: 'remaining' },
    adhanStopped: { ar: '🔇 تم إيقاف الأذان', es: '🔇 Adhan apagado', en: '🔇 Adhan stopped' },
  },

  // حديث/آية مناسبة لكل صلاة
  PRAYER_HADITHS: {
    Fajr: {
      ar: '«مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ» — متفق عليه (البخاري 574، مسلم 635)',
      es: '«Quien rece las dos oraciones del frescor (Fajr y Asr) entrará en el Paraíso» — Bujari y Muslim',
      en: '"Whoever prays the two cool-of-day prayers (Fajr & Asr) will enter Paradise" — Bukhari & Muslim',
    },
    Dhuhr: {
      ar: '«أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ» — رواه مسلم',
      es: '«Lo más cerca que está el siervo de su Señor es estando postrado; suplicad, pues, mucho» — Muslim',
      en: '"The closest a servant is to his Lord is while prostrating, so supplicate abundantly" — Muslim',
    },
    Asr: {
      ar: '﴿حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ﴾ — سورة البقرة 238',
      es: '﴾Guardad las oraciones, y especialmente la oración del medio (Al-Asr)﴿ — Corán 2:238',
      en: '"Guard strictly the prayers, especially the middle prayer (Asr)" — Quran 2:238',
    },
    Maghrib: {
      ar: '﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾ — سورة النساء 103',
      es: '﴾Ciertamente, la oración es para los creyentes un precepto en momentos determinados﴿ — Corán 4:103',
      en: '"Indeed, prayer has been decreed upon the believers at specified times" — Quran 4:103',
    },
    Isha: {
      ar: '«مَنْ صَلَّى الْعِشَاءَ فِي جَمَاعَةٍ فَكَأَنَّمَا قَامَ نِصْفَ اللَّيْلِ» — رواه مسلم',
      es: '«Quien rece Al-Isha en congregación es como si hubiera rezado media noche» — Muslim',
      en: '"Whoever prays Isha in congregation, it is as if he prayed half the night" — Muslim',
    },
  },

  _t(key, prayerName) {
    const row = this.STR[key] || {};
    let s = row[this._loc()] || row.es || row.ar || '';
    if (prayerName) s = s.replace('{p}', prayerName);
    return s;
  },

  prayerNameAr(key) {
    return { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' }[key] || key;
  },

  // ============ الأصوات (WebAudio — تعمل دون إنترنت) ============
  _chime(notes) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this._audioCtx = this._audioCtx || new Ctx();
      const ctx = this._audioCtx;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const t0 = ctx.currentTime + 0.02;
      notes.forEach(([freq, offset, dur]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t0 + offset);
        gain.gain.exponentialRampToValueAtTime(0.25, t0 + offset + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + offset);
        osc.stop(t0 + offset + dur + 0.05);
      });
    } catch (e) { /* صامت: الصوت إضافة وليس أساساً */ }
  },

  chimeReminder() { this._chime([[660, 0, 0.5], [880, 0.35, 0.6]]); },        // اقتربت الصلاة
  chimeSalawat()  { this._chime([[523, 0, 0.6], [659, 0.4, 0.6], [784, 0.8, 0.9]]); }, // الصلاة على النبي
  chimeDua()      { this._chime([[784, 0, 0.6], [988, 0.45, 0.8]]); },        // أدعية
  chimeSnooze()   { this._chime([[880, 0, 0.4], [880, 0.5, 0.4]]); },         // هل صليت؟

  // نطق الصلاة على النبي (أوفلاين عبر أصوات الجهاز العربية إن وُجدت)
  _speakSalawat() {
    try {
      if (!('speechSynthesis' in window)) return;
      if (!this.isOn('salawatVoice')) return;
      const u = new SpeechSynthesisUtterance('اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ');
      u.lang = 'ar-SA';
      u.rate = 0.9;
      const arVoice = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('ar'));
      if (arVoice) u.voice = arVoice;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (e) { /* صامت */ }
  },

  // ============ إذن الإشعارات ============
  async ensurePermission() {
    if (typeof PrayerNotifications !== 'undefined') return PrayerNotifications.requestPermission();
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
  },

  _notify(title, body, tag, silent = false) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'assets/icon.png', tag, silent });
      }
    } catch (e) { /* بعض المنصات تشترط Service Worker — الإشعار داخل التطبيق يكفي */ }
    if (typeof showToast === 'function') showToast(title, 5000);
  },

  // ============ 1) بطاقة تنبيه الأذان ============
  // تُستدعى من PrayerNotifications.notify عند دخول وقت الصلاة
  showAdhanAlert(prayerKey, fallbackName) {
    const name = this._loc() === 'ar' ? this.prayerNameAr(prayerKey) : (fallbackName || prayerKey);
    const title = this._t('adhanTitle', name);
    const hadithRow = this.PRAYER_HADITHS[prayerKey] || this.PRAYER_HADITHS.Dhuhr;
    const hadith = hadithRow[this._loc()] || hadithRow.ar;

    if (this.isOn('adhanAlert')) {
      this._notify('🕌 ' + title, hadith, 'quba-adhan-' + prayerKey);
      this._renderOverlay(prayerKey, title, hadith);
    } else {
      // التنبيه مقفل من الإعدادات — إشعار بسيط فقط (سلوك ما قبل v55)
      this._notify('🕌 ' + title, hadith, 'quba-adhan-' + prayerKey);
    }
  },

  _renderOverlay(prayerKey, title, hadith) {
    this._removeOverlay();
    const loc = this._loc();
    const overlay = document.createElement('div');
    overlay.id = 'adhan-alert-overlay';
    overlay.className = 'adhan-alert-overlay';
    overlay.setAttribute('dir', loc === 'ar' ? 'rtl' : 'ltr');
    overlay.innerHTML = `
      <div class="adhan-alert-card">
        <button class="adhan-alert-close" aria-label="${this._t('close')}">×</button>
        <div class="adhan-alert-icon">🕌</div>
        <div class="adhan-alert-title">${title}</div>
        <div class="adhan-alert-hadith">${hadith}</div>
        <div class="adhan-alert-actions">
          <button class="adhan-alert-btn stop"><i class="fas fa-volume-xmark"></i> ${this._t('stopAdhan')}</button>
          ${this.isOn('snooze') ? `<button class="adhan-alert-btn snooze">${this._t('snooze15')}</button>` : ''}
        </div>
        <div class="adhan-alert-hint">${loc === 'ar' ? 'يمكنك أيضاً إيقاف الأذان بقلب الهاتف أو بأزرار الصوت' : (loc === 'en' ? 'You can also stop the adhan by flipping the phone or pressing volume keys' : 'También puedes apagar el adhan volteando el teléfono o con los botones de volumen')}</div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    overlay.querySelector('.adhan-alert-close').addEventListener('click', () => this.stopAdhan());
    overlay.querySelector('.adhan-alert-btn.stop').addEventListener('click', () => this.stopAdhan());
    const snoozeBtn = overlay.querySelector('.adhan-alert-btn.snooze');
    if (snoozeBtn) snoozeBtn.addEventListener('click', () => this.snoozePrayer(prayerKey));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this.stopAdhan(); });

    // إخفاء تلقائي بعد 4 دقائق إن لم يتفاعل المستخدم
    this._overlayAutoHide = setTimeout(() => this._removeOverlay(), 4 * 60 * 1000);
  },

  _removeOverlay() {
    if (this._overlayAutoHide) { clearTimeout(this._overlayAutoHide); this._overlayAutoHide = null; }
    const o = document.getElementById('adhan-alert-overlay');
    if (o) o.remove();
  },

  // إيقاف الأذان (زر / قلب الهاتف / زر الصوت / زر التشغيل)
  stopAdhan(reason) {
    if (typeof AdhanService !== 'undefined') AdhanService.stop();
    this._removeOverlay();
    if (reason && typeof showToast === 'function') showToast(this._t('adhanStopped'), 2000);
  },

  // ============ زر «تذكير بعد ١٥ دقيقة» → إشعار «هل صليت؟» ============
  snoozePrayer(prayerKey) {
    if (typeof AdhanService !== 'undefined') AdhanService.stop();
    this._removeOverlay();
    if (!this.isOn('snooze')) return;
    const name = this._loc() === 'ar' ? this.prayerNameAr(prayerKey) : prayerKey;
    const t = setTimeout(() => {
      this.chimeSnooze();
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      this._notify('⏰ ' + this._t('didYouPray', name), this._t('didYouPrayB'), 'quba-snooze-' + prayerKey);
    }, 15 * 60 * 1000);
    this.timers.push(t);
    if (typeof showToast === 'function') {
      showToast(this._loc() === 'ar' ? '⏰ سنذكّرك بعد ١٥ دقيقة' : (this._loc() === 'en' ? '⏰ We will remind you in 15 minutes' : '⏰ Te recordaremos en 15 minutos'), 2500);
    }
  },

  // ============ 2+3) جدولة الصلاة على النبي وأدعية الصباح/المساء ============
  scheduleDailyExtras() {
    this.timers.forEach(id => clearTimeout(id));
    this.timers = [];
    const DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const at = (h, m, fn) => {
      const target = new Date();
      target.setHours(h, m, 0, 0);
      let delay = target.getTime() - now;
      if (delay < 0) delay += DAY;
      if (delay > DAY) return;
      this.timers.push(setTimeout(() => {
        fn();
        this.timers.push(setTimeout(fn, DAY)); // تكرار يومي
      }, delay));
    };

    // 🌹 الصلاة على النبي: 9:00، 12:00، 15:00، 18:00، 21:00 (كل 3 ساعات 9ص–9م)
    if (this.isOn('salawat')) {
      [9, 12, 15, 18, 21].forEach(h => at(h, 0, () => this.fireSalawat()));
    }
    // ☀️ دعاء الصباح 07:00 — 🌙 دعاء المساء 19:00
    if (this.isOn('duaMorning')) at(7, 0, () => this.fireDua('morning'));
    if (this.isOn('duaEvening')) at(19, 0, () => this.fireDua('evening'));
  },

  fireSalawat() {
    if (!this.isOn('salawat')) return;
    this.chimeSalawat();
    setTimeout(() => this._speakSalawat(), 1200); // النغمة أولاً ثم النطق
    if ('vibrate' in navigator) navigator.vibrate([150, 80, 150]);
    this._notify(this._t('salawatTitle'), this._t('salawatBody'), 'quba-salawat');
  },

  fireDua(period) {
    if (period === 'morning' && !this.isOn('duaMorning')) return;
    if (period === 'evening' && !this.isOn('duaEvening')) return;
    this.chimeDua();
    if ('vibrate' in navigator) navigator.vibrate([150, 80, 150]);
    const title = this._t(period === 'morning' ? 'duaMorTitle' : 'duaEveTitle');
    const body = this._t(period === 'morning' ? 'duaMorBody' : 'duaEveBody');
    this._notify(title, body, 'quba-dua-' + period);
  },

  // ============ 5) الإشعار الثابت بالصلاة القادمة ============
  startPersistent() {
    if (this._persistTimer) { clearInterval(this._persistTimer); this._persistTimer = null; }
    if (!this.isOn('persistent')) return;
    this._updatePersistent(); // فوراً
    this._persistTimer = setInterval(() => this._updatePersistent(), 60 * 1000);
  },

  async _updatePersistent() {
    try {
      if (!this.isOn('persistent')) return;
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      if (typeof AppState === 'undefined' || !AppState.timings) return;
      if (typeof getNextPrayer !== 'function') return;
      const np = getNextPrayer(AppState.timings);
      if (!np) return;
      const loc = this._loc();
      const name = loc === 'ar' ? this.prayerNameAr(np.name) : (t('prayers.' + np.name) || np.name);
      const left = typeof formatCountdown === 'function' ? formatCountdown(np.diffMs) : '';
      // v57: تصميم جديد للإشعار الثابت — اسم الصلاة + موعدها الفعلي + الوقت المتبقي
      const atTime = (np.time && typeof formatTime12h === 'function') ? formatTime12h(np.time) : '';
      const atLabel = { ar: 'الموعد', es: 'Hora', en: 'At' }[loc] || 'Hora';
      const title = '🕌 ' + name + (atTime ? ' • ' + atTime : '');
      const body = (atTime ? '🕐 ' + atLabel + ': ' + atTime + '  •  ' : '') + '⏳ ' + this._t('remaining') + ': ' + left;
      // عبر Service Worker ليبقى ثابتاً في مركز الإشعارات
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) {
          reg.showNotification(title, {
            body, tag: 'quba-next-prayer', icon: 'assets/icon.png',
            silent: true, requireInteraction: true, renotify: false,
          });
          return;
        }
      }
      // بديل بدون Service Worker
      new Notification(title, { body, tag: 'quba-next-prayer', icon: 'assets/icon.png', silent: true });
    } catch (e) { /* صامت */ }
  },

  // تُستدعى من PrayerNotifications.scheduleDay عند توفر مواقيت جديدة
  onDayScheduled() { this._updatePersistent(); },

  // ============ حساسات إيقاف الأذان ============
  _adhanPlaying() {
    return typeof AdhanService !== 'undefined' && AdhanService.audio && !AdhanService.audio.paused;
  },

  attachStopSensors() {
    if (this._sensorsAttached) return;
    this._sensorsAttached = true;

    // 📱 قلب الهاتف (وجه الشاشة للأسفل) — جاذبية z ≈ -9.8
    window.addEventListener('devicemotion', (e) => {
      try {
        if (!this.isOn('flipToStop') || !this._adhanPlaying()) { this._flipCount = 0; return; }
        const g = e.accelerationIncludingGravity;
        if (g && typeof g.z === 'number' && g.z < -9) {
          this._flipCount++;
          if (this._flipCount >= 2) { this._flipCount = 0; this.stopAdhan('flip'); }
        } else {
          this._flipCount = 0;
        }
      } catch (err) {}
    }, true);

    // 🔊 أزرار الصوت (Android WebView/TWA تُرسل مفاتيح AudioVolume*)
    window.addEventListener('keydown', (e) => {
      try {
        if (!this.isOn('volumeToStop') || !this._adhanPlaying()) return;
        const k = e.key || '';
        if (['AudioVolumeUp', 'AudioVolumeDown', 'AudioVolumeMute', 'VolumeUp', 'VolumeDown'].includes(k)) {
          this.stopAdhan('volume');
        }
      } catch (err) {}
    }, true);

    // 🔌 زر التشغيل: إطفاء الشاشة يخفي الصفحة → إيقاف الأذان
    document.addEventListener('visibilitychange', () => {
      try {
        if (!this.isOn('powerToStop')) return;
        if (document.hidden && this._adhanPlaying()) this.stopAdhan('power');
      } catch (err) {}
    });
  },

  // ============ نقطة الدخول ============
  init() {
    this.scheduleDailyExtras();
    this.startPersistent();
    this.attachStopSensors();
  },
};

if (typeof window !== 'undefined') {
  window.NotifCenter = NotifCenter;
}
