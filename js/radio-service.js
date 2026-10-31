// 🎧 RadioService — محرّك تشغيل عالمي واحد (بث مباشر + قرّاء + تلاوة مترجمة + مؤقّت نوم)
// v56 — عنصر <audio> وحيد يعيش على مستوى window: التلاوة تستمر عند التنقل.
// v1.0.74 — إعادة بناء:
//   • طبقة إخراج قابلة للاستبدال (_load/_resume/_pause/_seek/_posMs/_durMs/_stopOut):
//     في المتصفح تعمل على عنصر <audio>، وفي تطبيق Android يستبدلها native-bridge.js
//     بأوامر ExoPlayer — المنطق (التقدم/التكرار/المزامنة) واحد في الحالتين.
//   • الترجمة الحية: في وضع «آية/آية» (everyayah) تتبع الآية الجارية مباشرة، وفي وضع
//     «السورة الكاملة» تُحسب الآية الحالية من موضع التشغيل عبر توقيتات MP3Quran
//     (ayat_timing) أو تقدير تناسبي عند غيابها — فتظهر الترجمة متزامنة مع التلاوة.
//   • تكرار صريح: off | one | all | random ضمن السور المتوفرة للقارئ.
//   • البث المباشر: روابط بديلة تُجرَّب تلقائياً عند الفشل.
const RadioService = {
  audio: null,
  state: 'idle',        // idle | loading | playing | paused | error
  mode: null,           // 'stream' | 'quran'
  station: null,
  quran: null,          // { rid, reciterName, img, lang, surah, ayah, total, tr, whole, folder, server, read, tm, tmExact, list, sleep, playlist, plIdx }
  sleep: { endAt: 0, minutes: 0, timeoutId: null, tickId: null },
  _vol: 1,
  repeatMode: 'off',    // off | one | all | random
  amb: { ctx: null, gain: null, nodes: [], type: null, on: false, vol: 0.15 },
  _bar: null,
  _barBuilt: false,
  _trAudio: null,
  _cands: [],           // روابط بديلة للبث الحالي
  _candIdx: 0,
  _lastTickEmit: 0,

  // ---------- تهيئة ----------
  ensureAudio() {
    if (this.audio) return;
    try {
      const saved = localStorage.getItem('quba_radio_repeat');
      if (saved && ['off', 'one', 'all', 'random'].indexOf(saved) >= 0) this.repeatMode = saved;
    } catch (e) {}
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.addEventListener('playing', () => { this.state = 'playing'; this._emit(); });
    this.audio.addEventListener('pause', () => { if (this.state !== 'idle') { this.state = 'paused'; this._emit(); } });
    this.audio.addEventListener('waiting', () => { this.state = 'loading'; this._emit(); });
    this.audio.addEventListener('timeupdate', () => this._onTick());
    this.audio.addEventListener('error', () => {
      if (!this.audio.getAttribute('src')) return;
      this._onError();
    });
    this.audio.addEventListener('ended', () => this._onEnded());
  },

  // ================= طبقة الإخراج (يستبدلها native-bridge.js في Android) =================
  _load(url, meta) {
    this.ensureAudio();
    this.audio.src = typeof url === 'string' ? url : (url && url.url) || '';
    this.audio.volume = this._vol;
    if (meta && meta.startMs) {
      const st = meta.startMs / 1000;
      const once = () => { try { this.audio.currentTime = st; } catch (e) {} this.audio.removeEventListener('loadedmetadata', once); };
      this.audio.addEventListener('loadedmetadata', once);
    }
    this.audio.play().catch(() => {});
    this._mediaSession(meta && meta.title, meta && meta.artist, meta && meta.art);
  },
  _resume() { this.ensureAudio(); if (this.audio.getAttribute('src')) this.audio.play().catch(() => {}); },
  _pause() { if (this.audio) this.audio.pause(); },
  _seek(ms) { if (this.audio) { try { this.audio.currentTime = Math.max(0, ms / 1000); } catch (e) {} } },
  _posMs() { return this.audio ? Math.round((this.audio.currentTime || 0) * 1000) : 0; },
  _durMs() { const d = this.audio && this.audio.duration; return (d && isFinite(d)) ? Math.round(d * 1000) : 0; },
  _stopOut() {
    if (this.audio) { try { this.audio.pause(); } catch (e) {} this.audio.removeAttribute('src'); try { this.audio.load(); } catch (e) {} }
  },

  // ================= البث المباشر =================
  playStream(station) {
    this.ensureAudio();
    this._stopTrAudio();
    this.mode = 'stream';
    this.station = station;
    this.quran = null;
    this.state = 'loading';
    this._cands = RadioData.streamCands(station);
    this._candIdx = 0;
    this._loadCand();
    this._emit();
  },

  _streamMeta() {
    const st = this.station;
    return { title: st ? RadioData.name(st) : 'Quba', artist: RadioData.L('live') + ' — Quba', art: st ? RadioData.imgUrl(st.img) : null, live: true };
  },

  _loadCand() {
    const c = this._cands[this._candIdx];
    if (!c) { this._failed(); return; }
    this._load(c, this._streamMeta());
  },

  // ================= التلاوة (قرّاء + مترجم + نوم) =================
  // cfg: { rid, surah, lang?, sleep?, playlist?, prefer? ('ayah'|'whole') }
  async playQuran(cfg) {
    this.ensureAudio();
    this._stopTrAudio();
    const r = RadioData.reciter(cfg.rid) || RadioData.reciter('dosari');
    const list = RadioData.surahsFor(r);
    let surah = Number(cfg.surah) || list[0] || 1;
    if (!RadioData.hasSurah(r, surah)) {
      if (typeof showToast === 'function') showToast('ℹ️ ' + RadioData.L('surahUnavailable'), 2200);
      return;
    }
    // آية/آية (everyayah) عند الترجمة الحية إن توفر مجلد للقارئ — أدق مزامنة؛ وإلا سورة كاملة
    const ayahMode = cfg.prefer === 'ayah' ? !!r.ea : (cfg.prefer === 'whole' ? false : (!!cfg.lang && !!r.ea));
    this.mode = 'quran';
    this.station = null;
    this.quran = {
      rid: r.id, reciterName: RadioData.name(r), img: r.img || '',
      lang: cfg.lang || null,
      surah, ayah: 1, total: RadioData.surahInfo(surah).ayahs, tr: null,
      whole: !ayahMode, folder: r.ea || null, server: r.server || null, read: r.read || null,
      tm: null, tmExact: false, list,
      sleep: !!cfg.sleep, playlist: cfg.playlist || null, plIdx: 0,
    };
    this._startSurah(surah);
  },

  // يبدأ سورة n للقارئ الحالي (يُستدعى أيضاً عند التكرار/التالي)
  async _startSurah(n) {
    const q = this.quran;
    if (!q) return;
    this._stopTrAudio();
    q.surah = n;
    q.total = RadioData.surahInfo(n).ayahs;
    q.ayah = 1;
    q.tr = null;
    q.tm = null;
    q.tmExact = false;
    q._trSpoken = null;
    this.state = 'loading';
    this._emit();
    const token = q._tok = (q._tok || 0) + 1;
    const jobs = [];
    if (q.lang) {
      jobs.push(RadioData.getTranslation(n, q.lang).then(map => {
        if (this.quran === q && q.surah === n) { q.tr = map; this._emit(); }
      }).catch(() => {}));
    }
    if (q.whole && q.read && q.lang) {
      jobs.push(RadioData.getTimings(q.read, n).then(tm => {
        if (this.quran === q && q.surah === n && tm) { q.tm = tm; q.tmExact = true; this._onTick(true); }
      }).catch(() => {}));
    }
    // لا ننتظر أكثر من ٢.٥ ث قبل بدء الصوت (تظهر الترجمة فور وصولها)
    if (jobs.length) await Promise.race([Promise.all(jobs), new Promise(res => setTimeout(res, 2500))]);
    if (this.quran !== q || q._tok !== token) return;
    if (q.whole) {
      this._load(RadioData.surahFileUrl(RadioData.reciter(q.rid), n), this._quranMeta());
    } else {
      this._playAyah(1);
    }
    this._emit();
  },

  _quranMeta() {
    const q = this.quran;
    if (!q) return {};
    const t = q.whole ? RadioData.surahName(q.surah) : `${RadioData.surahName(q.surah)} • ${RadioData.L('ayah')} ${q.ayah}`;
    return { title: t, artist: q.reciterName, art: q.img || RadioData.IMG.quran };
  },

  _playAyah(i) {
    const q = this.quran;
    if (!q) return;
    this._stopTrAudio();
    i = Math.max(1, Math.min(i, q.total));
    if (q.whole) { this.seekAyah(i); return; }
    q.ayah = i;
    q._trSpoken = null;
    this.state = 'loading';
    this._load(RadioData.ayahUrl(q.folder, q.surah, i), this._quranMeta());
    this._emit();
  },

  // تقديم ملف السورة الكاملة إلى بداية الآية i (حسب التوقيت)
  seekAyah(i) {
    const q = this.quran;
    if (!q || !q.whole) return;
    const tm = this._tmFor(q);
    i = Math.max(1, Math.min(i, q.total));
    const st = tm ? RadioData.ayahStart(tm, i) : null;
    if (st === null) return;
    q.ayah = i;
    this._seek(st);
    this._resume();
    this._emit();
  },

  _tmFor(q) {
    if (q.tm) return q.tm;
    const d = this._durMs();
    if (d > 0) {
      q.tm = RadioData.estimateTimings(q.surah, d);
      q.tmExact = false;
    }
    return q.tm;
  },

  // نبضة الموضع: تحديث رقم الآية في وضع السورة الكاملة → الترجمة الحية
  _onTick(force) {
    const q = this.quran;
    if (this.mode !== 'quran' || !q || !q.whole) return;
    const tm = this._tmFor(q);
    if (!tm) return;
    const a = RadioData.ayahAt(tm, this._posMs());
    if (a && (a !== q.ayah || force)) {
      q.ayah = Math.min(a, q.total);
      this._emit();
    }
  },

  nextAyah() {
    const q = this.quran;
    if (this.mode !== 'quran' || !q) return;
    if (!q.lang) { this.nextSurah(); return; }
    if (q.ayah >= q.total) { this._surahEnded(true); return; }
    this._playAyah(q.ayah + 1);
  },
  prevAyah() {
    const q = this.quran;
    if (this.mode !== 'quran' || !q) return;
    if (!q.lang) { this.prevSurah(); return; }
    this._playAyah(Math.max(1, q.ayah - 1));
  },
  nextSurah() {
    const q = this.quran;
    if (!q) return;
    const L = q.list || [];
    const i = L.indexOf(q.surah);
    this._startSurah(L[(i + 1) % L.length] || q.surah);
  },
  prevSurah() {
    const q = this.quran;
    if (!q) return;
    const L = q.list || [];
    const i = L.indexOf(q.surah);
    this._startSurah(L[(i - 1 + L.length) % L.length] || q.surah);
  },
  replayAyah() {
    const q = this.quran;
    if (this.mode !== 'quran' || !q) return;
    if (q.whole) {
      const tm = this._tmFor(q);
      const st = tm ? RadioData.ayahStart(tm, q.ayah) : 0;
      this._seek(st || 0);
      this._resume();
    } else {
      this._playAyah(q.ayah);
    }
  },

  setRepeat(m) {
    if (['off', 'one', 'all', 'random'].indexOf(m) < 0) return;
    this.repeatMode = m;
    try { localStorage.setItem('quba_radio_repeat', m); } catch (e) {}
    if (typeof showToast === 'function') showToast('🔁 ' + RadioData.L('rep_' + m), 1500);
    this._emit();
  },
  cycleRepeat() {
    const order = ['off', 'one', 'all', 'random'];
    this.setRepeat(order[(order.indexOf(this.repeatMode) + 1) % order.length]);
  },

  // ---------- نهاية المقطع ----------
  _onEnded() {
    if (this.mode === 'stream') { // انقطع البث: أعد الاتصال بالرابط نفسه/البديل
      this._candIdx = (this._candIdx + 1) % Math.max(1, this._cands.length);
      this._loadCand();
      return;
    }
    const q = this.quran;
    if (this.mode !== 'quran' || !q) return;
    if (this._speakCurrentTranslation()) return;
    if (!q.whole && q.ayah < q.total) { this._playAyah(q.ayah + 1); return; }
    this._surahEnded(false);
  },

  _surahEnded(manual) {
    const q = this.quran;
    if (!q) return;
    if (q.playlist) {
      if (q.plIdx < q.playlist.length - 1) { q.plIdx++; this._startSurah(q.playlist[q.plIdx]); return; }
      this.stopAll();
      return;
    }
    const L = q.list && q.list.length ? q.list : [q.surah];
    const m = manual && this.repeatMode === 'off' ? 'all' : this.repeatMode;
    if (m === 'one') { this._startSurah(q.surah); return; }
    if (m === 'all') { const i = L.indexOf(q.surah); this._startSurah(L[(i + 1) % L.length]); return; }
    if (m === 'random') {
      let n = L[Math.floor(Math.random() * L.length)];
      if (L.length > 1 && n === q.surah) n = L[(L.indexOf(n) + 1) % L.length];
      this._startSurah(n);
      return;
    }
    // off: توقف عند نهاية السورة مع إبقاء البطاقة (يمكن إعادة التشغيل)
    this.state = 'paused';
    q._ended = true;
    this._emit();
  },

  _onError() {
    if (this.mode === 'stream' && this._candIdx < this._cands.length - 1) {
      this._candIdx++;
      this._loadCand();
      return;
    }
    this._failed();
  },

  _failed() {
    this.state = 'error';
    this._emit();
    if (typeof showToast === 'function') showToast('📻 ' + RadioData.L('playError'), 3000);
  },

  // ---------- تشغيل / إيقاف مؤقت / إيقاف كامل ----------
  toggle() {
    this.ensureAudio();
    const q = this.quran;
    if (this.state === 'playing' || this.state === 'loading') { this._stopTrAudio(); this._pause(); this.state = 'paused'; this._emit(); return; }
    if (this.mode === 'quran' && q && q._ended) { q._ended = false; this._startSurah(q.surah); return; }
    if (this.state === 'error') {
      if (this.mode === 'stream' && this.station) { this.playStream(this.station); return; }
      if (this.mode === 'quran' && q) { this._startSurah(q.surah); return; }
    }
    this._resume();
  },

  stopAll() {
    this._stopOut();
    this.state = 'idle';
    this.mode = null;
    this.station = null;
    this.quran = null;
    this._cands = [];
    this._stopTrAudio();
    this.clearSleep();
    this.stopAmbience(false);
    if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = null; } catch (e) {} }
    this._emit();
  },

  // ---------- Media Session (المتصفح؛ في Android يتولاها ExoPlayer) ----------
  _mediaSession(title, artist, img) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || 'Quba', artist: artist || 'Quba', album: 'Quba — ' + RadioData.L('radioTitle'),
        artwork: img ? [{ src: img, sizes: '512x512' }] : [],
      });
      navigator.mediaSession.setActionHandler('play', () => this.toggle());
      navigator.mediaSession.setActionHandler('pause', () => this.toggle());
      if (this.mode === 'quran') {
        navigator.mediaSession.setActionHandler('previoustrack', () => this.prevAyah());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextAyah());
      } else {
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
    if (!this.sleep || !this.sleep.endAt) return -1;
    return Math.max(0, Math.round((this.sleep.endAt - Date.now()) / 1000));
  },

  _fadeStop() {
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

  // ---------- v64: الترجمة الصوتية (آية بالعربي ثم قراءة الترجمة صوتيًا) ----------
  // المصدر: speechSynthesis المدمج في الجهاز (يعمل أوفلاين وبلا خوادم).
  // عند انتهاء قراءة الترجمة نعيد إطلاق حدث ended ليتابع التدفق الطبيعي
  // (الآية التالية / الإعادة / التوقف) كأن التلاوة انتهت للتو.
  _trVoiceEnabled() {
    try { return !!(typeof AppState !== 'undefined' && AppState.settings && AppState.settings.quranVoiceTranslation); }
    catch (e) { return false; }
  },

  _stopTrAudio() {
    try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch (e) {}
    const a = this._trAudio;
    if (a && a._to) { try { clearTimeout(a._to); } catch (e) {} }
    this._trAudio = null;
  },

  _speakCurrentTranslation() {
    const q = this.quran;
    if (!q || !q.lang || q.whole || !this._trVoiceEnabled()) return false;
    if (typeof speechSynthesis === 'undefined' || !window.SpeechSynthesisUtterance) return false;
    if (q._trSpoken === q.ayah) return false; // نطقناها للتو — لا حلقة لا نهائية
    const text = (q.tr && q.tr[q.ayah]) || '';
    if (!text) return false;
    q._trSpoken = q.ayah;
    const u = new SpeechSynthesisUtterance(String(text).slice(0, 600));
    u.lang = q.lang === 'en' ? 'en-US' : 'es-ES';
    u.rate = 1;
    const a = { utt: u, _to: null };
    this._trAudio = a;
    const done = () => {
      if (this._trAudio !== a) return; // أُلغيت (إيقاف/انتقال يدوي)
      this._trAudio = null;
      try { this._onEnded(); } catch (e) {}
    };
    u.onend = done;
    u.onerror = done;
    a._to = setTimeout(done, 40000); // مهلة أمان: بعض المتصفحات لا تُطلق onend
    try { speechSynthesis.cancel(); speechSynthesis.speak(u); }
    catch (e) { this._trAudio = null; return false; }
    return true;
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
    const active = (this.state === 'playing' || this.state === 'paused' || this.state === 'loading') && !!this.mode;
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
    const q = this.quran;
    const title = this.mode === 'quran' && q
      ? `${RadioData.surahName(q.surah)} • ${q.lang ? RadioData.L('ayah') + ' ' + q.ayah + '/' + q.total : q.reciterName}`
      : (this.station ? RadioData.name(this.station) : '');
    const icon = this.state === 'playing' ? 'fa-pause' : 'fa-play';
    const esc = typeof escapeHtml === 'function' ? escapeHtml : (x) => x;
    const html = `
      <button class="rfb-body" onclick="Router.go('radio')" aria-label="${RadioData.L('radioTitle')}">
        <span class="rfb-eq ${this.state === 'playing' ? 'on' : ''}"><i></i><i></i><i></i></span>
        <span class="rfb-title">${esc(title)}</span>
      </button>
      <button class="rfb-btn" onclick="RadioService.toggle()" aria-label="play/pause"><i class="fas ${icon}"></i></button>
      <button class="rfb-btn" onclick="RadioService.stopAll()" aria-label="stop"><i class="fas fa-xmark"></i></button>
    `;
    if (this._bar._html !== html) { this._bar.innerHTML = html; this._bar._html = html; }
  },
};

if (typeof window !== 'undefined') window.RadioService = RadioService;
