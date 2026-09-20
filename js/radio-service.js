// 🎧 RadioService — محرّك تشغيل عالمي واحد (بث مباشر + تلاوة مترجمة + مؤقّت نوم)
// v56 — عنصر <audio> وحيد يعيش على مستوى window: التلاوة تستمر عند التنقل
// بين الصفحات وعند إطفاء الشاشة (Media Session API تُظهر أزرار التحكم على
// شاشة القفل). لا نستخدم WakeLock هنا عمدًا — الهدف هو الاستماع والشاشة مطفأة.
const RadioService = {
  audio: null,
  state: 'idle',        // idle | loading | playing | paused | error
  mode: null,           // 'stream' | 'quran'
  station: null,        // المحطة الحالية (وضع stream)
  quran: null,          // { folder, reciterName, lang, surah, ayah, total, tr } (وضع quran)
  sleep: { endAt: 0, minutes: 0, timeoutId: null, tickId: null },
  _vol: 1,
  repeatMode: 'one',    // v59: زر الإعادة — 'one' إعادة السورة | 'all' تشغيل متواصل (الكل) | 'random' عشوائي
  amb: { ctx: null, gain: null, nodes: [], type: null, on: false, vol: 0.15 }, // v58: أصوات خلفية
  _bar: null,
  _barBuilt: false,

  // ---------- تهيئة ----------
  ensureAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.addEventListener('playing', () => {
      this.state = 'playing';
      this._emit();
      // v57: في وضع التلاوة المترجمة نعيد البث بعد لحظة قصيرة — إن وصلت الترجمة
      // متأخرة (شبكة بطيئة) تظهر للمستخدم فوراً دون انتظار الآية التالية.
      if (this.mode === 'quran') setTimeout(() => { if (this.mode === 'quran') this._emit(); }, 700);
    });
    this.audio.addEventListener('pause', () => { if (this.state !== 'idle') { this.state = 'paused'; this._emit(); } });
    this.audio.addEventListener('waiting', () => { this.state = 'loading'; this._emit(); });
    this.audio.addEventListener('error', () => {
      if (!this.audio.src) return;
      this.state = 'error';
      this._emit();
      if (typeof showToast === 'function') showToast('📻 ' + RadioData.L('playError'), 3000);
    });
    this.audio.addEventListener('ended', () => {
      if (this.mode === 'quran' && this.quran) {
        const q = this.quran;
        // v59: قرّاء الملف الكامل (MP3Quran) — ملف واحد لكل سورة
        if (q.whole) {
          if (this.repeatMode === 'one') { this.audio.currentTime = 0; this.audio.play().catch(() => {}); return; }
          let ns = 0;
          if (this.repeatMode === 'random') ns = 1 + Math.floor(Math.random() * 114);
          else if (this.repeatMode === 'all') ns = (q.surah % 114) + 1;
          if (ns && ns !== q.surah) {
            q.surah = ns;
            q.total = RadioData.surahInfo(ns).ayahs;
            q.tr = null;
            if (q.lang) {
              const lg = q.lang;
              RadioData.getTranslation(ns, lg).then(map => {
                if (this.quran === q && !q.tr) { q.tr = map; this._emit(); }
              }).catch(() => {});
            }
          }
          q.ayah = 0;
          this._playWhole();
          return;
        }
        if (q.ayah < q.total) { this._playAyah(q.ayah + 1); return; }
        // v58: قائمة قرآن النوم — عند نهاية السورة تنتقل تلقائياً للسورة التالية
        if (q.playlist && q.plIdx < q.playlist.length - 1) {
          q.plIdx++;
          const ns = q.playlist[q.plIdx];
          q.surah = ns;
          q.total = RadioData.surahInfo(ns).ayahs;
          q.ayah = 0;
          this._playAyah(1);
          return;
        }
        // v59: أوضاع الإعادة عند نهاية السورة (لا تنطبق على قائمة النوم)
        if (!q.sleep) {
          if (this.repeatMode === 'one') { this._playAyah(1); return; }
          const pick = this.repeatMode === 'random' ? (1 + Math.floor(Math.random() * 114))
                     : this.repeatMode === 'all' ? (q.surah % 114) + 1 : 0;
          if (pick) {
            q.surah = pick;
            q.total = RadioData.surahInfo(pick).ayahs;
            q.surahTotal = null;
            q.tr = null;
            if (q.lang) {
              const lg = q.lang;
              RadioData.getTranslation(pick, lg).then(map => {
                if (this.quran === q && !q.tr) { q.tr = map; this._emit(); }
              }).catch(() => {});
            }
            this._playAyah(1);
            return;
          }
        }
        this.stopAll(); // نهاية السورة / القائمة
      }
    });
  },

  // ---------- بث مباشر ----------
  playStream(station) {
    this.ensureAudio();
    this.mode = 'stream';
    this.station = station;
    this.quran = null;
    this.state = 'loading';
    this.audio.src = station.url;
    this.audio.volume = this._vol;
    this.audio.play().catch(() => { this.state = 'error'; this._emit(); });
    this._mediaSession(RadioData.name(station), RadioData.L('live') + ' — Quba', RadioData.IMG[station.img] || null);
    this._emit();
  },

  // ---------- تلاوة مترجمة (آية/آية) ----------
  async playQuran(cfg) {
    // cfg: { folder, reciterName, lang, surah, sleep?, playlist? }
    this.ensureAudio();
    this.mode = 'quran';
    this.station = null;
    const info = RadioData.surahInfo(cfg.surah);
    this.quran = {
      folder: cfg.folder, reciterName: cfg.reciterName, lang: cfg.lang || null,
      surah: cfg.surah, ayah: 0, total: info.ayahs, tr: null,
      sleep: !!cfg.sleep, playlist: cfg.playlist || null, plIdx: 0,
      // v59: folder يبدأ بـ http = خادم MP3Quran (سورة كاملة في ملف واحد)
      whole: /^https?:\/\//.test(cfg.folder),
      surahTotal: cfg.surahTotal || null,
    };
    this.state = 'loading';
    this._emit();
    // v57: نجلب الترجمة أولاً ونملأ quran.tr قبل بدء الصوت، حتى تظهر الترجمة
    // منذ الآية الأولى. عند الفشل تبدأ التلاوة دون انتظار.
    // v58: وضع النوم (lang = null) لا يجلب أي ترجمة.
    if (cfg.lang) {
      try {
        this.quran.tr = await RadioData.getTranslation(cfg.surah, cfg.lang);
        this._emit();
      } catch (e) { /* نكمل بلا ترجمة */ }
      if (!this.quran || this.quran.surah !== cfg.surah) return; // غيّر المستخدم السورة أثناء الجلب
    }
    if (this.quran.whole) { this._playWhole(); return; }
    this._playAyah(1);
  },

  // v59: تشغيل سورة كاملة (ملف واحد SSS.mp3) من خوادم MP3Quran
  _playWhole() {
    const q = this.quran;
    if (!q) return;
    q.ayah = 1;
    this.state = 'loading';
    this.audio.src = q.folder + String(q.surah).padStart(3, '0') + '.mp3';
    this.audio.volume = this._vol;
    this.audio.play().catch(() => { this.state = 'error'; this._emit(); });
    this._mediaSession(RadioData.surahName(q.surah), q.reciterName, RadioData.IMG.quran);
    this._emit();
  },

  // v59: زر الإعادة الفعّال — يتنقل عند كل ضغطة:
  // إعادة السورة ← إعادة الكل (تشغيل متواصل) ← اختيار عشوائي
  cycleRepeat() {
    const order = ['one', 'all', 'random'];
    this.repeatMode = order[(order.indexOf(this.repeatMode) + 1) % order.length];
    if (typeof showToast === 'function') showToast('🔁 ' + RadioData.L('rep_' + this.repeatMode), 1600);
    this._emit();
  },

  _playAyah(i) {
    const q = this.quran;
    if (!q) return;
    i = Math.max(1, Math.min(i, q.total));
    q.ayah = i;
    this.state = 'loading';
    this.audio.src = RadioData.ayahUrl(q.folder, q.surah, i);
    this.audio.volume = this._vol;
    this.audio.play().catch(() => { this.state = 'error'; this._emit(); });
    const sName = RadioData.surahName(q.surah);
    this._mediaSession(`${sName} • ${RadioData.L('ayah')} ${i}`, q.reciterName, RadioData.IMG.quran);
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('previoustrack', () => this.prevAyah());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextAyah());
      } catch (e) {}
    }
    this._emit();
  },

  nextAyah() { if (this.mode === 'quran' && this.quran && !this.quran.whole) this._playAyah(this.quran.ayah + 1); },
  prevAyah() { if (this.mode === 'quran' && this.quran && !this.quran.whole) this._playAyah(Math.max(1, this.quran.ayah - 1)); },
  replayAyah() {
    if (this.mode === 'quran' && this.quran && this.quran.ayah > 0) {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    }
  },

  // ---------- تشغيل / إيقاف مؤقت / إيقاف كامل ----------
  toggle() {
    this.ensureAudio();
    if (this.state === 'playing') { this.audio.pause(); }
    else if (this.audio.src) { this.audio.play().catch(() => {}); }
  },

  stopAll() {
    if (this.audio) { try { this.audio.pause(); } catch (e) {} this.audio.removeAttribute('src'); this.audio.load(); }
    this.state = 'idle';
    this.mode = null;
    this.station = null;
    this.quran = null;
    this.clearSleep();
    this.stopAmbience(false);
    if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = null; } catch (e) {} }
    this._emit();
  },

  // ---------- Media Session (تحكم شاشة القفل / سماعات) ----------
  _mediaSession(title, artist, img) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title, artist: artist || 'Quba', album: 'Quba — ' + RadioData.L('radioTitle'),
        artwork: img ? [{ src: img, sizes: '512x512', type: 'image/jpeg' }] : [],
      });
      navigator.mediaSession.setActionHandler('play', () => this.toggle());
      navigator.mediaSession.setActionHandler('pause', () => this.toggle());
      if (this.mode !== 'quran') {
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    } catch (e) {}
  },

  // ---------- مؤقّت النوم 🌙 ----------
  setSleep(minutes) {
    this.clearSleep(false);
    if (!minutes || minutes <= 0) {
      this._emit();
      if (typeof showToast === 'function') showToast('🌙 ' + RadioData.L('sleepCancelToast'), 1800);
      return;
    }
    this.sleep.minutes = minutes;
    this.sleep.endAt = Date.now() + minutes * 60000;
    this.sleep.timeoutId = setTimeout(() => this._fadeStop(), minutes * 60000);
    // نبضة كل ثانية لتحديث العد التنازلي في الواجهة
    this.sleep.tickId = setInterval(() => this._emit(), 5000);
    if (typeof showToast === 'function') showToast('🌙 ' + RadioData.L('sleepSetToast') + ' — ' + minutes + ' ' + RadioData.L('sleepMin'), 2500);
    this._emit();
  },

  clearSleep(emit = true) {
    if (this.sleep.timeoutId) clearTimeout(this.sleep.timeoutId);
    if (this.sleep.tickId) clearInterval(this.sleep.tickId);
    this.sleep = { endAt: 0, minutes: 0, timeoutId: null, tickId: null };
    if (emit) this._emit();
  },

  sleepLeftSec() {
    if (!this.sleep.endAt) return -1;
    return Math.max(0, Math.round((this.sleep.endAt - Date.now()) / 1000));
  },

  _fadeStop() {
    // خفض تدريجي للصوت خلال ٥ ثوانٍ ثم إيقاف كامل
    const steps = 10;
    let i = 0;
    const startVol = this._vol;
    const iv = setInterval(() => {
      i++;
      if (this.audio) this.audio.volume = Math.max(0, startVol * (1 - i / steps));
      if (i >= steps) {
        clearInterval(iv);
        if (this.audio) this.audio.volume = startVol;
        this.stopAll();
      }
    }, 500);
  },

  // ---------- v58: أصوات خلفية لطيفة (مطر/أمواج/رياح/ضوضاء بيضاء) ----------
  // مولّدة محلياً عبر WebAudio — تعمل أوفلاين وبلا ملفات خارجية، وتُمزج
  // بمستوى خفيف خلف التلاوة مثل تطبيق Quranify.
  toggleAmbience(type) {
    if (this.amb.on && this.amb.type === type) this.stopAmbience();
    else this.startAmbience(type);
  },

  startAmbience(type) {
    this.stopAmbience(false);
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.amb.ctx = this.amb.ctx || new Ctx();
      const ctx = this.amb.ctx;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const len = 4 * ctx.sampleRate;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02; // ضوضاء بنّية للأمواج والرياح
        d[i] = (type === 'rain' || type === 'white') ? w * 0.6 : last * 3.2;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = (type === 'rain') ? 'bandpass' : 'lowpass';
      filter.frequency.value = { rain: 1800, white: 2200, wind: 400, waves: 500 }[type] || 800;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(this.amb.vol, ctx.currentTime + 2); // دخول ناعم
      src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      let lfo = null;
      if (type === 'waves' || type === 'wind') {
        lfo = ctx.createOscillator();
        lfo.frequency.value = type === 'waves' ? 0.08 : 0.05; // مدّ وجزر بطيء
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = this.amb.vol * 0.5;
        lfo.connect(lfoGain); lfoGain.connect(gain.gain); lfo.start();
      }
      src.start();
      this.amb.nodes = [src, lfo];
      this.amb.gain = gain;
      this.amb.type = type;
      this.amb.on = true;
    } catch (e) { /* الصوت إضافة اختيارية */ }
    this._emit();
  },

  stopAmbience(emit = true) {
    try { (this.amb.nodes || []).forEach(n => { try { n && n.stop && n.stop(); } catch (e) {} }); } catch (e) {}
    this.amb.nodes = [];
    this.amb.on = false;
    this.amb.type = null;
    if (emit) this._emit();
  },

  setAmbienceVolume(v) {
    this.amb.vol = Math.max(0, Math.min(1, Number(v) || 0));
    if (this.amb.gain) { try { this.amb.gain.gain.value = this.amb.vol; } catch (e) {} }
  },

  // ---------- مشاركة ----------
  share() {
    let what = '';
    if (this.mode === 'stream' && this.station) what = RadioData.name(this.station);
    else if (this.mode === 'quran' && this.quran) what = `${RadioData.surahName(this.quran.surah)} — ${this.quran.reciterName}`;
    else return;
    const text = `📻 ${RadioData.L('shareMsg')} «${what}» ${RadioData.L('viaApp')}`;
    if (navigator.share) {
      navigator.share({ title: 'Quba', text, url: location.origin + location.pathname }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + ' ' + location.href)
        .then(() => { if (typeof showToast === 'function') showToast('🔗✔', 1500); })
        .catch(() => {});
    }
  },

  // ---------- شريط التشغيل العائم (يظهر في كل الصفحات ما عدا صفحة الراديو) ----------
  _emit() {
    this._updateBar();
    if (typeof RadioPage !== 'undefined' && RadioPage.onPlayerUpdate &&
        typeof Router !== 'undefined' && Router.current && Router.current.name === 'radio') {
      try { RadioPage.onPlayerUpdate(); } catch (e) {}
    }
  },

  _updateBar() {
    if (typeof document === 'undefined') return;
    const onRadioPage = (typeof Router !== 'undefined' && Router.current && Router.current.name === 'radio');
    const active = (this.state === 'playing' || this.state === 'paused' || this.state === 'loading');
    if (!active || onRadioPage) {
      if (this._bar) { this._bar.remove(); this._bar = null; this._barBuilt = false; }
      return;
    }
    if (!this._barBuilt) {
      this._bar = document.createElement('div');
      this._bar.className = 'radio-floatbar';
      document.body.appendChild(this._bar);
      this._barBuilt = true;
    }
    const title = this.mode === 'quran' && this.quran
      ? `${RadioData.surahName(this.quran.surah)} • ${RadioData.L('ayah')} ${this.quran.ayah}/${this.quran.total}`
      : (this.station ? RadioData.name(this.station) : '');
    const icon = this.state === 'playing' ? 'fa-pause' : 'fa-play';
    this._bar.innerHTML = `
      <button class="rfb-body" onclick="Router.go('radio')" aria-label="${RadioData.L('radioTitle')}">
        <span class="rfb-eq ${this.state === 'playing' ? 'on' : ''}"><i></i><i></i><i></i></span>
        <span class="rfb-title">${typeof escapeHtml === 'function' ? escapeHtml(title) : title}</span>
      </button>
      <button class="rfb-btn" onclick="RadioService.toggle()" aria-label="play/pause"><i class="fas ${icon}"></i></button>
      <button class="rfb-btn" onclick="RadioService.stopAll()" aria-label="stop"><i class="fas fa-xmark"></i></button>
    `;
  },
};
