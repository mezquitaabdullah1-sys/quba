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
  _bar: null,
  _barBuilt: false,

  // ---------- تهيئة ----------
  ensureAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.addEventListener('playing', () => { this.state = 'playing'; this._emit(); });
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
        if (this.quran.ayah < this.quran.total) this._playAyah(this.quran.ayah + 1);
        else this.stopAll(); // نهاية السورة
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
    // cfg: { folder, reciterName, lang, surah }
    this.ensureAudio();
    this.mode = 'quran';
    this.station = null;
    const info = RadioData.surahInfo(cfg.surah);
    this.quran = {
      folder: cfg.folder, reciterName: cfg.reciterName, lang: cfg.lang,
      surah: cfg.surah, ayah: 0, total: info.ayahs, tr: null,
    };
    this.state = 'loading';
    this._emit();
    // الترجمة تُجلب بالتوازي مع بدء الصوت — التلاوة لا تنتظرها
    RadioData.getTranslation(cfg.surah, cfg.lang).then(tr => {
      if (this.quran && this.quran.surah === cfg.surah) { this.quran.tr = tr; this._emit(); }
    });
    this._playAyah(1);
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

  nextAyah() { if (this.mode === 'quran' && this.quran) this._playAyah(this.quran.ayah + 1); },
  prevAyah() { if (this.mode === 'quran' && this.quran) this._playAyah(Math.max(1, this.quran.ayah - 1)); },
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
