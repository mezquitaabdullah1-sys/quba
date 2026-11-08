/**
 * 🎬 استوديو الفيديو القرآني — v1.0.168
 *
 * المستخدم يختار: السورة والآيات، القارئ، الترجمة، الخلفية (صورة متحرّكة أو مقطع
 * طبيعة يُنزَّل عند الطلب)، حجم خط المصحف والترجمة، لون النص، النسبة — ثم يُنشئ
 * فيديو MP4 (H.264/AAC) ويحمّله أو يشاركه.
 *
 * v1.0.168:
 *   • تظليل الكلمة المقروءة أثناء التلاوة (توقيت كل آية من ملفها الصوتي).
 *   • التلاوة تُجلب من everyayah أولًا لأنه المصدر الوحيد الذي يرسل CORS،
 *     وcdn.islamic.network لا يرسله فلا يصلح للتحليل داخل WebView.
 *   • كاش للترجمة والنص — لا طلب شبكة لكل إطار.
 *   • قصّ الصوت عند ١٢٠ ثانية بدل ترك مسار صوتي أطول من الفيديو.
 */

const VideoStudioPage = {
  st: {
    surah: 1, from: 1, to: 1,
    reciter: 'ar.husary',
    tr: '',
    arScale: 4, trScale: 3,
    ratio: 'portrait',         // portrait | square | landscape
    bgMode: 'image',           // image | clip
    bgIndex: 0,
    clipId: null,
    tint: 0.45,
    fontColor: '#ffffff',
    accent: '#D4AF37',
    fps: 30,
    res: 720,
    highlight: true,
  },

  MAX_SECONDS: 120,
  MAX_AYAHS: 20,
  LEAD: 0.6,
  TAIL: 1.6,
  GAP_AYAH: 0.2,
  BG_COUNT: 9,
  BG_DIR: 'assets/share-bg/',

  _ayahIndex: null,
  _img: null,
  _bgImgIdx: -1,
  _logoImg: undefined,
  _vid: null,
  _raf: 0,
  _t0: 0,
  _playing: false,
  _media: { key: null, val: null },
  _gen: { running: false, ctrl: null },
  _last: null,
  _lastUrl: null,
  _trCache: new Map(),

  L(ar, es, en) {
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    return loc === 'ar' ? ar : (loc === 'en' ? en : es);
  },

  /* ================= فهرس الآيات ================= */
  index() {
    if (this._ayahIndex) return this._ayahIndex;
    const map = new Map();
    const totals = [];
    let running = 0;
    const src = window.QURAN_FULL_AR;
    if (src && src.pages) {
      for (const pg of src.pages) {
        for (const a of pg.ayahs) {
          const [s, n, text] = a;
          if (!map.has(s)) map.set(s, []);
          map.get(s).push({ n, text });
        }
      }
    }
    for (const s of [...map.keys()].sort((a, b) => a - b)) {
      totals.push({ s, count: map.get(s).length, start: running });
      running += map.get(s).length;
    }
    this._ayahIndex = { map, totals };
    return this._ayahIndex;
  },

  ayahCount(surah) {
    const row = this.index().totals.find(x => x.s === surah);
    return row ? row.count : 0;
  },

  globalAyah(surah, ayah) {
    const row = this.index().totals.find(x => x.s === surah);
    return row ? row.start + ayah : 1;
  },

  surahName(surah) {
    const n = window.SURAH_NAMES;
    if (Array.isArray(n) && n[surah - 1]) return n[surah - 1];
    return this.L('سورة ', 'Sura ', 'Surah ') + surah;
  },

  toArabicNum(n) {
    return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  },

  /** الآيات المختارة كنصوص مستقلة — نحتاجها للتظليل وللتوقيت. */
  rangeAyahs(surah, from, to) {
    const list = this.index().map.get(surah) || [];
    const out = [];
    for (let n = from; n <= to; n++) {
      const a = list.find(x => x.n === n);
      if (a) out.push({ n, text: a.text, marker: this.toArabicNum(n) });
    }
    return out;
  },

  /* ================= الترجمة (مع كاش) ================= */
  async fetchTranslation(surah, from, to) {
    const st = this.st;
    if (!st.tr) return '';
    const key = st.tr + ':' + surah;
    if (this._trCache.has(key)) return this._trSlice(this._trCache.get(key), from, to);
    const r = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/${st.tr}`);
    if (!r.ok) throw new Error('tr_http_' + r.status);
    const j = await r.json();
    const arr = (j.data && j.data.ayahs) || [];
    this._trCache.set(key, arr);
    return this._trSlice(arr, from, to);
  },

  _trSlice(arr, from, to) {
    const parts = [];
    for (let n = from; n <= to; n++) {
      const a = arr.find(x => x.numberInSurah === n);
      if (a && a.text) parts.push(a.text);
    }
    return parts.join(' ');
  },

  /* ================= المصادر الصوتية ================= */
  /**
   * everyayah أولًا: يرسل Access-Control-Allow-Origin: * فيصلح لـfetch/decode.
   * cdn.islamic.network لا يرسل ترويسة CORS ⇒ يُترك كخيار أخير فقط.
   */
  audioUrls(surah, ayah, reciter) {
    const urls = [];
    let folder = null;
    try { folder = (window.QuranOffline && QuranOffline.EVERYAYAH_FOLDERS) ? QuranOffline.EVERYAYAH_FOLDERS[reciter] : null; } catch (e) {}
    const s3 = String(surah).padStart(3, '0');
    const a3 = String(ayah).padStart(3, '0');
    if (folder) urls.push(`https://everyayah.com/data/${folder}/${s3}${a3}.mp3`);
    const g = this.globalAyah(surah, ayah);
    urls.push(`https://cdn.islamic.network/quran/audio/64/${reciter}/${g}.mp3`);
    urls.push(`https://cdn.islamic.network/quran/audio/128/${reciter}/${g}.mp3`);
    return urls;
  },

  /* ================= التوقيت ================= */
  _timelineFromBuffers(bufs, gap, lead) {
    const out = [];
    let t = lead;
    bufs.forEach((b, i) => {
      out.push({ start: t, dur: b.duration });
      t += b.duration + (i < bufs.length - 1 ? gap : 0);
    });
    return out;
  },

  _timelineEstimated(ayahs, total) {
    const w = ayahs.map(a => Math.max(12, a.text.length));
    const sum = w.reduce((x, y) => x + y, 0) || 1;
    let t = 0;
    return w.map(x => {
      const d = total * x / sum;
      const r = { start: t, dur: d };
      t += d;
      return r;
    });
  },

  /* ================= الخلفيات ================= */
  async loadBgImage() {
    if (this._img && this._bgImgIdx === this.st.bgIndex) return this._img;
    const path = this.BG_DIR + 'bg' + (this.st.bgIndex + 1) + '.jpg';
    this._img = await new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('bg_image'));
      im.src = path;
    });
    this._bgImgIdx = this.st.bgIndex;
    return this._img;
  },

  async logo() {
    if (this._logoImg !== undefined) return this._logoImg;
    this._logoImg = await new Promise((res) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = 'assets/logo.png';
    });
    return this._logoImg;
  },

  /* ================= لوحة الرسم ================= */
  outSize() {
    const st = this.st, r = Number(st.res) || 720;
    if (st.ratio === 'square') return [r, r];
    if (st.ratio === 'landscape') return [Math.round(r * 16 / 9), r];
    return [r, Math.round(r * 16 / 9)];
  },

  async drawFrameTo(cx, W, H, t, dur, media) {
    const st = this.st;
    const sc = W / 1080;

    // ١) الخلفية
    if (st.bgMode === 'clip' && media.video && media.video.readyState >= 2) {
      drawCover(cx, media.video, W, H);
    } else if (media.img) {
      const rect = VideoLayout.kenBurnsRect(t, dur, st.bgIndex % 4,
        media.img.naturalWidth || media.img.width,
        media.img.naturalHeight || media.img.height, W, H);
      cx.fillStyle = '#08301F';
      cx.fillRect(0, 0, W, H);
      cx.drawImage(media.img, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, W, H);
      const g = cx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, 'rgba(14,75,60,0.10)');
      g.addColorStop(1, 'rgba(8,48,31,0.24)');
      cx.fillStyle = g;
      cx.fillRect(0, 0, W, H);
    } else {
      cx.fillStyle = '#08301F';
      cx.fillRect(0, 0, W, H);
    }

    // ٢) طبقة التعتيم + تظليل دائري
    const tint = Math.max(0, Math.min(0.9, st.tint));
    if (tint > 0) {
      cx.fillStyle = `rgba(0,0,0,${tint})`;
      cx.fillRect(0, 0, W, H);
    }
    const grad = cx.createRadialGradient(W / 2, H / 2, H * 0.12, W / 2, H / 2, H * 0.78);
    grad.addColorStop(0, 'rgba(0,0,0,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0.52)');
    cx.fillStyle = grad;
    cx.fillRect(0, 0, W, H);

    // ٣) النص (مع تظليل الكلمة المقروءة إن توفر توقيت)
    const common = {
      W, H, scale: sc,
      fontColor: st.fontColor,
      accentColor: st.accent,
      arScale: st.arScale,
      trScale: st.trScale,
      fontStyle: 'naskh',
      centerY: H / 2,
      maxWidthRatio: 0.86,
    };
    if (media.timings && media.ayahs && media.ayahs.length) {
      VideoLayout.drawVerseTimed(cx, Object.assign({}, common, {
        ayahs: media.ayahs,
        timings: media.timings,
        t: t,
      translation: media.translation,
      translations: media.translations || [],
      single: true,               // v1.0.180: آية واحدة في كل مرة
      dur: dur,
      source: media.source,
      highlight: st.highlight,
    }));
    } else {
      VideoLayout.drawVerse(cx, Object.assign({}, common, {
        arabic: media.arabic,
        translation: media.translation,
        source: media.source,
      }));
    }

    // ٤) ختم التطبيق
    VideoLayout.drawWatermark(cx, {
      W, H, scale: sc, fontColor: st.fontColor,
      logo: media.logo || null,
      tagline: this.L('رفيقك إلى الجنة', 'Tu compañero hacia el Paraíso', 'Your companion to Paradise'),
    });
  },

  /* ================= الواجهة ================= */
  // v1.0.177: معاينة التلاوة كاملة (نطاق الآيات) قبل إنشاء الفيديو
  _listen: null,
  listen() {
    const st = this.st;
    const ic = () => document.getElementById('vs-listen-ic');
    const tx = () => document.getElementById('vs-listen-tx');
    const btn = () => document.getElementById('vs-listen');
    const L = (a, b, c) => this.L(a, b, c);
    const DEF = () => L('اسمع التلاوة قبل الإنشاء', 'Escucha antes de crear', 'Listen before creating');
    if (this._listen) { this.stopListen(); return; }
    const setState = (on) => {
      const b = btn(), i = ic();
      if (b) b.classList.toggle('playing', on);
      if (i) i.className = on ? 'fas fa-stop' : 'fas fa-play';
    };
    const setLabel = (t) => { const e = tx(); if (e) e.textContent = t; };
    const a = new Audio();
    a.crossOrigin = 'anonymous';
    a.preload = 'auto';
    this._listen = a;
    setState(true);

    const fail = () => {
      this.stopListen();
      if (typeof showToast === 'function')
        showToast(L('تعذّر جلب التلاوة — تحقّق من الاتصال بهذا القارئ',
                   'No se pudo cargar la recitación: comprueba la conexión',
                   'Could not load recitation — check the connection'), 3200);
    };

    // القارئ الذي لا يوفّر ملفًا لكل آية: تلاوة السورة كاملة
    if (this._needsSurahAudio(st.reciter)) {
      const su = this.surahAudioUrl(st.reciter, st.surah);
      if (!su) { fail(); return; }
      a.onended = () => this.stopListen();
      a.onerror = fail;
      setLabel(L('تلاوة السورة كاملة — اضغط للإيقاف', 'Sura completa — pulsa para detener', 'Full surah — tap to stop'));
      a.src = su;
      a.play().catch(() => fail());
      return;
    }

    // تشغيل آية بعد آية بالتتابع مع تجاوز المصدر الفاشل
    let n = st.from;
    const playAyah = () => {
      if (n > st.to) { this.stopListen(); return; }
      const cur = n++;
      const urls = this.audioUrls(st.surah, cur, st.reciter) || [];
      let k = 0;
      const tryUrl = () => {
        if (k >= urls.length) { playAyah(); return; }
        a.src = urls[k++];
        a.play().catch(() => {});
      };
      a.onerror = tryUrl;
      a.onended = playAyah;
      setLabel(L('تلاوة الآية ' + cur + ' من ' + st.to,
                 'Recitando ' + cur + ' de ' + st.to,
                 'Ayah ' + cur + ' of ' + st.to));
      tryUrl();
    };
    if (!(this.audioUrls(st.surah, st.from, st.reciter) || []).length) { fail(); return; }
    playAyah();
  },

  stopListen() {
    try { if (this._listen) { this._listen.onended = null; this._listen.onerror = null; this._listen.pause(); this._listen.removeAttribute('src'); } } catch (e) {}
    this._listen = null;
    const b = document.getElementById('vs-listen');
    if (b) b.classList.remove('playing');
    const i = document.getElementById('vs-listen-ic');
    if (i) i.className = 'fas fa-play';
    const t = document.getElementById('vs-listen-tx');
    if (t) t.textContent = this.L('اسمع التلاوة قبل الإنشاء', 'Escucha antes de crear', 'Listen before creating');
  },

  reciters() {
    // v1.0.176 — الجذر: config.js يعرّف `const CONFIG` لا `window.CONFIG`
    let list = [];
    try {
      if (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.RECITERS) && CONFIG.RECITERS.length) list = CONFIG.RECITERS.slice();
      else if (window.CONFIG && Array.isArray(window.CONFIG.RECITERS)) list = window.CONFIG.RECITERS.slice();
    } catch (e) {}
    if (!list.length) {
      list = [
        { id: 'ar.husary',             nameAr: 'محمود خليل الحصري', name: 'Mahmoud Khalil Al-Husary' },
        { id: 'ar.abdurrahmaansudais', nameAr: 'عبد الرحمن السديس', name: 'Abdurrahman As-Sudais' },
        { id: 'ar.mahermuaiqly',       nameAr: 'ماهر المعيقلي',     name: 'Maher Al-Muaiqly' },
        { id: 'ar.saadalghamdi',       nameAr: 'سعد الغامدي',       name: 'Saad Al-Ghamdi' },
        { id: 'ar.minshawi',           nameAr: 'محمد صديق المنشاوي', name: 'Mohamed Siddiq El-Minshawi' },
        { id: 'ar.abdulbasitmurattal', nameAr: 'عبد الباسط عبد الصمد (مرتل)', name: 'Abdul Basit (Murattal)' },
        { id: 'ar.hudhaify',           nameAr: 'علي الحذيفي',       name: 'Ali Al-Hudhaify' },
      ];
    }
    // v1.0.177: محمد اللحيدان — تلاوة السورة كاملة من mp3quran (مُتحقَّق منها)
    if (!list.some(r => r.id === 'ar.muhammadalluhaidan')) {
      list.push({ id: 'ar.muhammadalluhaidan', nameAr: 'محمد اللحيدان', name: 'Muhammad Al-Luhaidan', surahOnly: true });
    }
    return list;
  },

  /* ================= المصادر الصوتية ================= */
  /**
   * v1.0.177 — الجذر الحقيقي لانعدام الصوت:
   * الكود كان يقرأ `window.QuranOffline.EVERYAYAH_FOLDERS`، والوحدة تُسمّى
   * في المشروع `QuranOfflineService` (const لا تُضاف إلى window) ⇒ الخريطة
   * لم تُقرأ أبدًا، فلم يبقَ إلا cdn.islamic.network وهو **لا يرسل
   * access-control-allow-origin** ⇒ fetch يفشل ⇒ فيديو بلا صوت.
   * everyayah يرسل ACAO: * (مُتحقَّق) لذا هو المصدر الأول دائمًا.
   */
  _folderMap() {
    const pick = (o) => (o && o.EVERYAYAH_FOLDERS) || null;
    try { if (typeof QuranOfflineService !== 'undefined') { const m = pick(QuranOfflineService); if (m) return m; } } catch (e) {}
    try { if (typeof QuranOffline !== 'undefined') { const m = pick(QuranOffline); if (m) return m; } } catch (e) {}
    try { if (window.QuranOfflineService) { const m = pick(window.QuranOfflineService); if (m) return m; } } catch (e) {}
    // احتياط مضمّن — كل مجلد مُختبَر بتنزيل فعلي
    return {
      'ar.husary':             'Husary_128kbps',
      'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
      'ar.mahermuaiqly':       'MaherAlMuaiqly128kbps',
      'ar.saadalghamdi':       'Ghamadi_40kbps',
      'ar.minshawi':           'Minshawy_Murattal_128kbps',
      'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
      'ar.hudhaify':           'Hudhaify_128kbps',
    };
  },

  _needsSurahAudio(reciter) { return reciter === 'ar.muhammadalluhaidan'; },

  surahAudioUrl(reciter, surah) {
    const s3 = String(surah).padStart(3, '0');
    if (reciter === 'ar.muhammadalluhaidan') return 'https://cdn.mp3quran.net/audio/muhammad-luhaidan/r1/' + s3 + '.mp3';
    return '';
  },

  /**
   * قائمة روابط الآية بالترتيب: everyayah (CORS *) ثم islamic.network (بلا CORS،
   * للتشغيل المباشر فقط). fetchAudioBuffer يتجاوز الفاشل تلقائيًا.
   */
  audioUrls(surah, ayah, reciter) {
    const urls = [];
    const map = this._folderMap() || {};
    const folder = map[reciter];
    const s3 = String(surah).padStart(3, '0');
    const a3 = String(ayah).padStart(3, '0');
    if (folder) urls.push('https://everyayah.com/data/' + folder + '/' + s3 + a3 + '.mp3');
    const g = this.globalAyah(surah, ayah);
    if (g) {
      urls.push('https://cdn.islamic.network/quran/audio/64/' + reciter + '/' + g + '.mp3');
      urls.push('https://cdn.islamic.network/quran/audio/128/' + reciter + '/' + g + '.mp3');
    }
    return urls;
  },

  /**
   * تقطيع تلاوة السورة إلى مقاطع آيات بكشف الصمت (طاقة RMS كل 20ms).
   * يُختار أقرب فاصل صامت (≥120ms) إلى الموضع النسبي المتوقّع لكل آية،
   * وإذا لم تكفِ الفواصل نعود إلى التقسيم النسبي. (مُختبَر على تلاوة اللحيدان)
   */
  _splitBySilence(buf, n) {
    try {
      if (!buf || !n || n < 2) return [buf];
      const sr = buf.sampleRate, ch = buf.numberOfChannels;
      const d0 = buf.getChannelData(0);
      const d1 = ch > 1 ? buf.getChannelData(1) : null;
      const frame = Math.max(1, Math.round(sr * 0.02));
      const frames = Math.floor(d0.length / frame);
      if (frames < n * 4) return null;
      const rms = new Float32Array(frames);
      let peak = 0;
      for (let f = 0; f < frames; f++) {
        let sum = 0; const st = f * frame, en = st + frame;
        for (let i = st; i < en; i++) { const v = d1 ? (d0[i] + d1[i]) * 0.5 : d0[i]; sum += v * v; }
        const r = Math.sqrt(sum / frame);
        rms[f] = r; if (r > peak) peak = r;
      }
      if (!(peak > 0)) return null;
      const thr = peak * 0.06, minRun = Math.round(0.12 / 0.02);
      const bnds = [];
      let run = 0;
      for (let f = 0; f < frames; f++) {
        if (rms[f] < thr) { run++; }
        else { if (run >= minRun) bnds.push((f - run / 2) * 0.02); run = 0; }
      }
      if (run >= minRun) bnds.push((frames - run / 2) * 0.02);

      const dur = buf.duration;
      const cuts = [];
      for (let k = 1; k < n; k++) {
        const expect = dur * k / n;
        let best = null, bd = 1e9;
        for (let bi = 0; bi < bnds.length; bi++) {
          const b = bnds[bi];
          if (cuts.some(c => Math.abs(c - b) < 0.35)) continue;
          const d = Math.abs(b - expect);
          if (d < bd) { bd = d; best = b; }
        }
        cuts.push(best === null ? expect : best);
      }
      cuts.sort((x, y) => x - y);
      const edges = [0].concat(cuts, [dur]);

      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = window.__vsSplitAC || (window.__vsSplitAC = new AC());
      const out = [];
      for (let k = 0; k < n; k++) {
        const s0 = Math.max(0, Math.floor(edges[k] * sr));
        const e0 = Math.min(buf.length, Math.floor(edges[k + 1] * sr));
        const len = Math.max(1, e0 - s0);
        const nb = ctx.createBuffer(ch, len, sr);
        for (let c = 0; c < ch; c++) nb.getChannelData(c).set(buf.getChannelData(c).subarray(s0, e0));
        const fd = Math.min(Math.round(sr * 0.012), Math.floor(len / 4));
        for (let c = 0; c < ch; c++) {
          const dd = nb.getChannelData(c);
          for (let i = 0; i < fd; i++) { const g = i / fd; dd[i] *= g; dd[len - 1 - i] *= g; }
        }
        out.push(nb);
      }
      return out;
    } catch (e) { console.warn('splitBySilence failed', e && e.message); return null; }
  },

  async render(container) {
    const st = this.st;
    const maxAyah = this.ayahCount(st.surah) || 7;
    const reciters = this.reciters();

    container.innerHTML = `
      <div class="vs-wrap">
        <div class="vs-head">
          <button class="vs-back" onclick="Router.go('home')" aria-label="back"><i class="fas fa-arrow-left"></i></button>
          <div>
            <h1 class="vs-title">${this.L('استوديو الفيديو القرآني', 'Estudio de vídeo coránico', 'Quran video studio')}</h1>
            <p class="vs-sub">${this.L('اختر الآيات والقارئ والخلفية ثم أنشئ فيديو جاهزًا للمشاركة', 'Elige versículos, recitador y fondo, y genera un vídeo listo para compartir', 'Pick verses, reciter and background, then export a shareable video')}</p>
          </div>
        </div>

        <div class="vs-stage" id="vs-stage">
          <canvas id="vs-canvas" class="vs-canvas"></canvas>
          <button class="vs-playbtn" id="vs-play" aria-label="play"><i class="fas fa-play"></i></button>
          <div class="vs-badge" id="vs-badge">9:16</div>
        </div>

        <div class="vs-card">
          <div class="vs-row">
            <label class="vs-lbl">${this.L('السورة', 'Sura', 'Surah')}</label>
            <select class="vs-sel" id="vs-surah">
              ${Array.from({ length: 114 }, (_, i) => i + 1)
                .filter(s => this.ayahCount(s) > 0)
                .map(s => `<option value="${s}" ${s === st.surah ? 'selected' : ''}>${s}. ${escapeHtml(this.surahName(s))}</option>`).join('')}
            </select>
          </div>
          <div class="vs-row vs-row-2">
            <div>
              <label class="vs-lbl">${this.L('من الآية', 'Desde', 'From')}</label>
              <input type="number" class="vs-num" id="vs-from" min="1" max="${maxAyah}" value="${st.from}" inputmode="numeric">
            </div>
            <div>
              <label class="vs-lbl">${this.L('إلى الآية', 'Hasta', 'To')}</label>
              <input type="number" class="vs-num" id="vs-to" min="1" max="${maxAyah}" value="${st.to}" inputmode="numeric">
            </div>
          </div>
          <div class="vs-row">
            <label class="vs-lbl">${this.L('القارئ', 'Recitador', 'Reciter')}</label>
            <select class="vs-sel" id="vs-reciter">
              ${reciters.map(r => `<option value="${r.id}" ${r.id === st.reciter ? 'selected' : ''}>${escapeHtml(r.nameAr || (typeof CONFIG !== 'undefined' && CONFIG.reciterName ? CONFIG.reciterName(r) : '') || r.name || r.id)}</option>`).join('')}
            </select>
          </div>
          <div class="vs-row">
            <button class="vs-listen" id="vs-listen" type="button" onclick="VideoStudioPage.listen()">
              <i class="fas fa-play" id="vs-listen-ic"></i>
              <span id="vs-listen-tx">${this.L('اسمع التلاوة قبل الإنشاء', 'Escucha antes de crear', 'Listen before creating')}</span>
            </button>
          </div>
          <div class="vs-row">
            <label class="vs-lbl">${this.L('الترجمة', 'Traducción', 'Translation')}</label>
            <select class="vs-sel" id="vs-tr">
              <option value="" ${st.tr === '' ? 'selected' : ''}>${this.L('بلا ترجمة', 'Sin traducción', 'No translation')}</option>
              <option value="es.cortes" ${st.tr === 'es.cortes' ? 'selected' : ''}>Español (Cortés)</option>
              <option value="es.garcia" ${st.tr === 'es.garcia' ? 'selected' : ''}>Español (García)</option>
              <option value="en.sahih" ${st.tr === 'en.sahih' ? 'selected' : ''}>English (Sahih)</option>
              <option value="fr.hamidullah" ${st.tr === 'fr.hamidullah' ? 'selected' : ''}>Français (Hamidullah)</option>
            </select>
          </div>
        </div>

        <div class="vs-card">
          <div class="vs-seg" id="vs-bgmode">
            <button class="vs-segbtn ${st.bgMode === 'image' ? 'on' : ''}" data-m="image">${this.L('صور متحرّكة', 'Fotos en movimiento', 'Animated photos')}</button>
            <button class="vs-segbtn ${st.bgMode === 'clip' ? 'on' : ''}" data-m="clip">${this.L('مقاطع طبيعة', 'Clips de naturaleza', 'Nature clips')}</button>
          </div>
          <div class="vs-grid" id="vs-bggrid"></div>
          <p class="vs-hint" id="vs-bghint"></p>
        </div>

        <div class="vs-card">
          <div class="vs-row">
            <label class="vs-lbl">${this.L('حجم خط المصحف', 'Tamaño del texto coránico', 'Quran text size')}</label>
            <input type="range" class="vs-range" id="vs-arscale" min="1" max="6" step="0.5" value="${st.arScale}">
          </div>
          <div class="vs-row">
            <label class="vs-lbl">${this.L('حجم خط الترجمة', 'Tamaño de traducción', 'Translation size')}</label>
            <input type="range" class="vs-range" id="vs-trscale" min="0" max="6" step="0.5" value="${st.trScale}">
          </div>
          <div class="vs-row">
            <label class="vs-lbl">${this.L('شفافية الطبقة', 'Opacidad de la capa', 'Overlay opacity')}</label>
            <input type="range" class="vs-range" id="vs-tint" min="0" max="80" step="5" value="${Math.round(st.tint * 100)}">
          </div>
          <div class="vs-row">
            <label class="vs-lbl">${this.L('لون النص', 'Color del texto', 'Text color')}</label>
            <div class="vs-swatches" id="vs-colors">
              ${['#ffffff', '#FFF7E0', '#E4CE8E', '#D4AF37', '#BFE8D9', '#FFD9D9'].map(c =>
                `<button class="vs-sw ${st.fontColor.toLowerCase() === c.toLowerCase() ? 'on' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
            </div>
          </div>
          <div class="vs-row vs-row-sw">
            <label class="vs-lbl">${this.L('تظليل الكلمة المقروءة', 'Resaltar la palabra recitada', 'Highlight the recited word')}</label>
            <label class="vs-switch"><input type="checkbox" id="vs-hl" ${st.highlight ? 'checked' : ''}><span></span></label>
          </div>
          <div class="vs-row">
            <label class="vs-lbl">${this.L('النسبة', 'Formato', 'Aspect')}</label>
            <div class="vs-seg" id="vs-ratio">
              <button class="vs-segbtn ${st.ratio === 'portrait' ? 'on' : ''}" data-r="portrait">9:16</button>
              <button class="vs-segbtn ${st.ratio === 'square' ? 'on' : ''}" data-r="square">1:1</button>
              <button class="vs-segbtn ${st.ratio === 'landscape' ? 'on' : ''}" data-r="landscape">16:9</button>
            </div>
          </div>
          <div class="vs-row">
            <label class="vs-lbl">${this.L('الجودة', 'Calidad', 'Quality')}</label>
            <div class="vs-seg" id="vs-res">
              <button class="vs-segbtn ${st.res === 720 ? 'on' : ''}" data-q="720">720p</button>
              <button class="vs-segbtn ${st.res === 1080 ? 'on' : ''}" data-q="1080">1080p</button>
            </div>
          </div>
        </div>

        <div class="vs-actions">
          <button class="vs-main" id="vs-gen"><i class="fas fa-wand-magic-sparkles"></i> ${this.L('إنشاء الفيديو', 'Generar vídeo', 'Generate video')}</button>
          <div class="vs-prog" id="vs-prog"><div class="vs-progbar" id="vs-progbar"></div><span class="vs-progtxt" id="vs-progtxt"></span></div>
          <p class="vs-hint" id="vs-mode"></p>
        </div>

        <div class="vs-result" id="vs-result" style="display:none">
          <video id="vs-out" class="vs-out" controls playsinline></video>
          <div class="vs-actions">
            <button class="vs-btn" id="vs-dl"><i class="fas fa-download"></i> ${this.L('تنزيل', 'Descargar', 'Download')}</button>
            <button class="vs-btn vs-btn-gold" id="vs-share"><i class="fas fa-share-nodes"></i> ${this.L('مشاركة', 'Compartir', 'Share')}</button>
          </div>
        </div>
      </div>`;

    this._bind(container);
    await this._refreshBgGrid(container);
    await this._startPreview();
    this._updateModeLabel();
  },

  _bind(container) {
    const st = this.st;
    const $ = (id) => container.querySelector('#' + id);

    $('vs-surah').onchange = (e) => {
      st.surah = Number(e.target.value);
      const mx = this.ayahCount(st.surah);
      st.from = 1; st.to = 1;
      $('vs-from').max = mx; $('vs-to').max = mx;
      $('vs-from').value = 1; $('vs-to').value = 1;
      this._invalidate();
    };

    const clampInputs = () => {
      const mx = this.ayahCount(st.surah);
      let f = Math.max(1, Math.min(mx, Number($('vs-from').value) || 1));
      let t = Math.max(f, Math.min(mx, Number($('vs-to').value) || f));
      if (t - f + 1 > this.MAX_AYAHS) t = f + this.MAX_AYAHS - 1;
      $('vs-from').value = f; $('vs-to').value = t;
      st.from = f; st.to = t;
      this._invalidate();
    };
    $('vs-from').onchange = clampInputs;
    $('vs-to').onchange = clampInputs;

    $('vs-reciter').onchange = (e) => { st.reciter = e.target.value; this._invalidate(); };
    $('vs-tr').onchange = (e) => { st.tr = e.target.value; this._invalidate(); };

    container.querySelectorAll('#vs-bgmode .vs-segbtn').forEach(b => {
      b.onclick = async () => {
        st.bgMode = b.dataset.m;
        container.querySelectorAll('#vs-bgmode .vs-segbtn').forEach(x => x.classList.toggle('on', x === b));
        await this._refreshBgGrid(container);
        this._invalidate();
      };
    });

    container.querySelectorAll('#vs-ratio .vs-segbtn').forEach(b => {
      b.onclick = () => {
        st.ratio = b.dataset.r;
        container.querySelectorAll('#vs-ratio .vs-segbtn').forEach(x => x.classList.toggle('on', x === b));
        this._resizePreview();
      };
    });

    container.querySelectorAll('#vs-res .vs-segbtn').forEach(b => {
      b.onclick = () => {
        st.res = Number(b.dataset.q);
        container.querySelectorAll('#vs-res .vs-segbtn').forEach(x => x.classList.toggle('on', x === b));
      };
    });

    $('vs-arscale').oninput = (e) => { st.arScale = Number(e.target.value); };
    $('vs-trscale').oninput = (e) => { st.trScale = Number(e.target.value); };
    $('vs-tint').oninput = (e) => { st.tint = Number(e.target.value) / 100; };
    $('vs-hl').onchange = (e) => { st.highlight = !!e.target.checked; };

    container.querySelectorAll('#vs-colors .vs-sw').forEach(b => {
      b.onclick = () => {
        st.fontColor = b.dataset.c;
        container.querySelectorAll('#vs-colors .vs-sw').forEach(x => x.classList.toggle('on', x === b));
      };
    });

    $('vs-play').onclick = () => {
      this._playing = !this._playing;
      this._t0 = performance.now();
      $('vs-play').innerHTML = this._playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    };
    $('vs-gen').onclick = () => this._generate(container);
    $('vs-dl').onclick = () => this.download();
    $('vs-share').onclick = () => this.share();
  },

  async _refreshBgGrid(container) {
    const grid = container.querySelector('#vs-bggrid');
    const hint = container.querySelector('#vs-bghint');
    const st = this.st;
    grid.innerHTML = '';

    if (st.bgMode === 'image') {
      hint.textContent = this.L(
        'حركة تلقائية (تكبير/إزاحة) على الصور المضمّنة في التطبيق — تعمل بلا إنترنت.',
        'Movimiento automático (zoom/desplazamiento) sobre las fotos incluidas en la app — funciona sin internet.',
        'Automatic motion (zoom/pan) on the photos bundled with the app — works offline.');
      for (let i = 0; i < this.BG_COUNT; i++) {
        const b = document.createElement('button');
        b.className = 'vs-bgcell' + (st.bgIndex === i && !st.clipId ? ' on' : '');
        b.style.backgroundImage = `url(${this.BG_DIR}bg${i + 1}.jpg)`;
        b.onclick = () => {
          st.bgIndex = i; st.clipId = null;
          grid.querySelectorAll('.vs-bgcell').forEach(x => x.classList.remove('on'));
          b.classList.add('on');
          this._invalidate();
        };
        grid.appendChild(b);
      }
      return;
    }

    hint.textContent = this.L(
      'تُنزَّل مرة واحدة عند اختيارها ثم تبقى محفوظة في الجهاز. مصادرها ملك عام (CC0) — بلا ترخيص ولا ذكر إلزامي.',
      'Se descargan una vez al elegirlas y quedan guardadas en el dispositivo. Dominio público (CC0): sin licencia ni atribución obligatoria.',
      'Downloaded once when picked, then kept on the device. Public domain (CC0): no licence or attribution required.');

    const clips = await VideoBgCatalog.clips();
    if (!clips.length) {
      grid.innerHTML = `<p class="vs-hint">${this.L('تعذّر تحميل كتالوج المقاطع.', 'No se pudo cargar el catálogo.', 'Could not load the clip catalogue.')}</p>`;
      return;
    }
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    for (const clip of clips) {
      const cell = document.createElement('button');
      cell.className = 'vs-bgcell vs-bgclip' + (st.clipId === clip.id ? ' on' : '');
      cell.innerHTML = `<span class="vs-clipname">${escapeHtml(VideoBgCatalog.title(clip, loc))}</span>
        <span class="vs-clipstate"><i class="fas fa-cloud-arrow-down"></i></span>`;
      cell.onclick = () => this._pickClip(clip, cell, grid);
      grid.appendChild(cell);
      // المصغّرة تُبنى فقط من المخزّن — لا تنزيل تلقائي لمجرد فتح التبويب
      VideoBgCatalog.cachedThumb(clip).then((src) => {
        if (src) {
          cell.style.backgroundImage = `url(${src})`;
          cell.classList.add('has-thumb');
        }
      });
      VideoBgCatalog.isCached(clip.id).then((ok) => {
        if (ok) cell.querySelector('.vs-clipstate').innerHTML = '<i class="fas fa-circle-check"></i>';
      });
    }
  },

  async _pickClip(clip, cell, grid) {
    const st = this.st;
    st.clipId = clip.id;
    grid.querySelectorAll('.vs-bgcell').forEach(x => x.classList.remove('on'));
    cell.classList.add('on');
    const state = cell.querySelector('.vs-clipstate');
    const cached = await VideoBgCatalog.isCached(clip.id);
    if (!cached) {
      state.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 0%';
      try {
        await VideoBgCatalog.ensure(clip.id, (p) => {
          state.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${Math.round(p * 100)}%`;
        });
      } catch (e) {
        state.innerHTML = '<i class="fas fa-triangle-exclamation"></i>';
        if (typeof showToast === 'function') {
          showToast(this.L('تعذّر تنزيل المقطع', 'No se pudo descargar el clip', 'Could not download the clip'));
        }
        return;
      }
    }
    state.innerHTML = '<i class="fas fa-circle-check"></i>';
    const thumb = await VideoBgCatalog.cachedThumb(clip);
    if (thumb) { cell.style.backgroundImage = `url(${thumb})`; cell.classList.add('has-thumb'); }
    this._invalidate(true);
  },

  /* ================= المعاينة ================= */
  _resizePreview() {
    const cv = document.getElementById('vs-canvas');
    if (!cv) return;
    const [W, H] = this.outSize();
    const scale = Math.min(1, 760 / W);
    cv.width = Math.round(W * scale);
    cv.height = Math.round(H * scale);
    const badge = document.getElementById('vs-badge');
    if (badge) badge.textContent = this.st.ratio === 'square' ? '1:1' : (this.st.ratio === 'landscape' ? '16:9' : '9:16');
  },

  _invalidate(resize) {
    this._media = { key: null, val: null };
    if (resize) this._resizePreview();
  },

  async _startPreview() {
    const cv = document.getElementById('vs-canvas');
    if (!cv) return;
    this._resizePreview();
    this._playing = true;
    const btn = document.getElementById('vs-play');
    if (btn) btn.innerHTML = '<i class="fas fa-pause"></i>';
    this._t0 = performance.now();
    cancelAnimationFrame(this._raf);
    const loop = async () => {
      if (!cv.isConnected) { cancelAnimationFrame(this._raf); return; }
      if (this._playing) {
        const dur = 9;
        const t = ((performance.now() - this._t0) / 1000) % dur;
        try {
          const media = await this._previewMedia();
          await this.drawFrameTo(cv.getContext('2d'), cv.width, cv.height, t, dur, media);
        } catch (e) { /* إطار مفقود لا يوقف المعاينة */ }
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  },

  async _previewMedia() {
    const st = this.st;
    const key = [st.surah, st.from, st.to, st.tr, st.bgMode, st.clipId, st.bgIndex].join('|');
    if (this._media.key === key && this._media.val) return this._media.val;

    let img = null, video = null;
    if (st.bgMode === 'image') {
      try { img = await this.loadBgImage(); } catch (e) {}
    } else if (st.clipId) {
      const url = VideoBgCatalog._urls.get(st.clipId);
      if (url) {
        if (!this._vid || this._vid.dataset.clip !== st.clipId) {
          if (this._vid) { try { this._vid.pause(); } catch (e) {} }
          const v = document.createElement('video');
          v.src = url; v.muted = true; v.playsInline = true; v.loop = true; v.preload = 'auto';
          v.dataset.clip = st.clipId;
          this._vid = v;
          v.play().catch(() => {});
        }
        video = this._vid;
      }
    }

    const ayahs = this.rangeAyahs(st.surah, st.from, st.to);
    let translation = '', translations = [];
    if (st.tr) {
      try {
        translation = await this.fetchTranslation(st.surah, st.from, st.to);
        // v1.0.180: ترجمة كل آية على حدة — تُعرض مع آيتها وحدها
        for (let n = st.from; n <= st.to; n++) translations.push(await this.fetchTranslation(st.surah, n, n));
      } catch (e) { translation = ''; translations = []; }
    }
    const val = {
      img, video, ayahs,
      arabic: ayahs.map(a => a.text + ' \u06DD' + a.marker).join(' '),
      translation,
      source: `${this.surahName(st.surah)} ${st.surah}:${st.from}${st.to !== st.from ? '-' + st.to : ''}`,
      timings: this._timelineEstimated(ayahs, 9),   // معاينة فقط
      logo: await this.logo(),
    };
    this._media = { key, val };
    return val;
  },

  async _updateModeLabel() {
    const el = document.getElementById('vs-mode');
    if (!el) return;
    const m = await VideoEncode.modeLabel();
    const txt = m === 'fast'
      ? this.L('ترميز سريع MP4 على الجهاز', 'Codificación rápida MP4 en el dispositivo', 'Fast on-device MP4 encoding')
      : m === 'compat-mp4'
        ? this.L('ترميز متوافق MP4', 'Codificación compatible MP4', 'Compatible MP4 encoding')
        : m === 'compat-webm'
          ? this.L('جهازك يرمّز بصيغة WebM فقط — قد لا تُقبل في بعض التطبيقات', 'Tu dispositivo solo codifica WebM: puede no aceptarse en algunas apps', 'Your device only encodes WebM — some apps may reject it')
          : this.L('لا يوجد مرمّز فيديو على هذا الجهاز', 'Este dispositivo no tiene codificador de vídeo', 'No video encoder available on this device');
    el.textContent = txt;
    el.dataset.mode = m;
  },

  /* ================= التوليد ================= */
  async _generate(container) {
    if (this._gen.running) return;
    const st = this.st;
    const btn = container.querySelector('#vs-gen');
    const prog = container.querySelector('#vs-prog');
    const bar = container.querySelector('#vs-progbar');
    const txt = container.querySelector('#vs-progtxt');
    const resBox = container.querySelector('#vs-result');

    this._gen.running = true;
    this._gen.ctrl = new AbortController();
    btn.disabled = true;
    prog.style.display = 'block';
    bar.style.width = '0%';
    txt.textContent = this.L('جاري التحضير…', 'Preparando…', 'Preparing…');
    resBox.style.display = 'none';

    const setP = (p, label) => {
      bar.style.width = Math.round(Math.max(0, Math.min(1, p)) * 100) + '%';
      if (label) txt.textContent = label;
    };

    try {
      // ١) النص
      setP(0.02, this.L('قراءة النص…', 'Leyendo el texto…', 'Reading the text…'));
      const media = await this._previewMedia();
      if (!media.ayahs.length) throw new Error('no_text');
      // v1.0.180: الحد الأعلى ٢٠ آية لكل فيديو
      if (media.ayahs.length > this.MAX_AYAHS) {
        media.ayahs = media.ayahs.slice(0, this.MAX_AYAHS);
        if (media.translations) media.translations = media.translations.slice(0, this.MAX_AYAHS);
      }

      // ٢) التلاوة — everyayah لكل آية (CORS *) واللحيدان من ملف السورة بتقطيع بالصمت
      let audio = null, bufs = [];
      setP(0.05, this.L('جلب التلاوة…', 'Descargando la recitación…', 'Fetching recitation…'));
      try {
        const total = st.to - st.from + 1;
        if (this._needsSurahAudio(st.reciter)) {
          const su = this.surahAudioUrl(st.reciter, st.surah);
          const full = await VideoEncode.fetchAudioBuffer([su], (p) => {
            setP(0.05 + 0.25 * p, this.L('جلب التلاوة…', 'Descargando la recitación…', 'Fetching recitation…'));
          });
          const all = this.ayahCount(st.surah) || total;
          const segs = (total === all) ? this._splitBySilence(full, all) : null;
          if (segs && segs.length >= all) bufs = segs.slice(st.from - 1, st.to);
          if (!bufs.length) {
            // نطاق جزئي: نحتفظ بالسورة كاملة ونسقط النص على التوقيت الكامل
            bufs = [full];
            this._surahWhole = true;
          }
        } else {
          for (let n = st.from; n <= st.to; n++) {
            const urls = this.audioUrls(st.surah, n, st.reciter);
            const buf = await VideoEncode.fetchAudioBuffer(urls, (p) => {
              setP(0.05 + 0.25 * ((n - st.from + p) / total),
                this.L('جلب التلاوة…', 'Descargando la recitación…', 'Fetching recitation…'));
            });
            bufs.push(buf);
          }
        }
        audio = VideoEncode.concatBuffers(bufs, this.GAP_AYAH);
        audio = this._padAudio(audio, this.LEAD, this.TAIL);
        if (audio.duration > this.MAX_SECONDS) audio = this._trimAudio(audio, this.MAX_SECONDS);
      } catch (e) {
        console.warn('recitation unavailable', e && e.message);
        audio = null; bufs = [];
        if (typeof showToast === 'function') {
          showToast(this.L('تعذّر جلب التلاوة — سيُنشأ الفيديو بلا صوت',
            'No se pudo obtener la recitación: vídeo sin audio',
            'Recitation unavailable — video will have no audio'), 3200);
        }
      }
      this._surahWhole = false;

      const dur = audio ? audio.duration : 10;
      const timings = audio && bufs.length
        ? this._timelineFromBuffers(bufs, this.GAP_AYAH, this.LEAD)
        : this._timelineEstimated(media.ayahs, dur);

      // ٣) لوحة الإخراج + خلفية الفيديو
      const [W, H] = this.outSize();
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const cx = cv.getContext('2d');

      let bgVideo = null;
      if (st.bgMode === 'clip' && st.clipId) {
        try {
          const url = await VideoBgCatalog.ensure(st.clipId);
          bgVideo = await this._prepareVideo(url);
          bgVideo.currentTime = 0;
          await bgVideo.play();
        } catch (e) { console.warn('bg clip unavailable', e && e.message); }
      }

      const drawMedia = Object.assign({}, media, {
        video: bgVideo,
        timings: st.highlight ? timings : null,
      });

      setP(0.32, this.L('ترميز الإطارات…', 'Codificando fotogramas…', 'Encoding frames…'));
      const out = await VideoEncode.encode({
        canvas: cv, width: W, height: H,
        fps: st.fps, duration: dur,
        audioBuffer: audio,
        signal: this._gen.ctrl.signal,
        drawFrame: (t) => this.drawFrameTo(cx, W, H, t, dur, drawMedia),
        onProgress: (p) => setP(0.32 + 0.66 * p,
          this.L('ترميز الإطارات… ', 'Codificando fotogramas… ', 'Encoding frames… ') + Math.round(p * 100) + '%'),
      });

      if (bgVideo) { try { bgVideo.pause(); } catch (e) {} }

      this._last = out;
      if (this._lastUrl) URL.revokeObjectURL(this._lastUrl);
      this._lastUrl = URL.createObjectURL(out.blob);
      const vout = container.querySelector('#vs-out');
      if (vout) vout.src = this._lastUrl;
      resBox.style.display = 'block';
      setP(1, this.L('تم ✓', 'Listo ✓', 'Done ✓'));
      try { resBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
    } catch (e) {
      console.warn('generate failed', e);
      const m = (e && e.message) || 'error';
      setP(0, this.L('فشل التوليد', 'Error al generar', 'Generation failed'));
      const msg = m === 'aborted' ? this.L('أُلغي', 'Cancelado', 'Cancelled')
        : m === 'no_encoder' ? this.L('هذا الجهاز لا يدعم ترميز الفيديو', 'Este dispositivo no soporta codificación de vídeo', 'This device cannot encode video')
          : this.L('تعذّر إنشاء الفيديو', 'No se pudo crear el vídeo', 'Could not create the video');
      if (typeof showToast === 'function') showToast(msg + (m !== 'aborted' ? ' — ' + m : ''), 3600);
    } finally {
      this._gen.running = false;
      btn.disabled = false;
    }
  },

  _padAudio(buf, lead, tail) {
    if (!buf) return null;
    const sr = buf.sampleRate, ch = buf.numberOfChannels;
    const nl = Math.round(lead * sr), nt = Math.round(tail * sr);
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const out = ctx.createBuffer(ch, buf.length + nl + nt, sr);
    for (let c = 0; c < ch; c++) out.getChannelData(c).set(buf.getChannelData(c), nl);
    try { ctx.close(); } catch (e) {}
    return out;
  },

  _trimAudio(buf, seconds) {
    const sr = buf.sampleRate, ch = buf.numberOfChannels;
    const n = Math.min(buf.length, Math.round(seconds * sr));
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const out = ctx.createBuffer(ch, n, sr);
    for (let c = 0; c < ch; c++) out.getChannelData(c).set(buf.getChannelData(c).subarray(0, n));
    try { ctx.close(); } catch (e) {}
    return out;
  },

  _prepareVideo(url) {
    return new Promise((resolve, reject) => {
      const v = document.createElement('video');
      v.src = url; v.muted = true; v.playsInline = true; v.loop = true; v.preload = 'auto';
      const to = setTimeout(() => reject(new Error('bg_timeout')), 15000);
      v.onloadeddata = () => { clearTimeout(to); resolve(v); };
      v.onerror = () => { clearTimeout(to); reject(new Error('bg_error')); };
    });
  },

  /* ================= التنزيل والمشاركة ================= */
  filename() {
    const d = new Date().toISOString().slice(0, 10);
    const ext = this._last && this._last.container === 'webm' ? 'webm' : 'mp4';
    return `quba-${this.st.surah}-${this.st.from}-${d}.${ext}`;
  },

  _mime() {
    return (this._last && this._last.container === 'webm') ? 'video/webm' : 'video/mp4';
  },

  download() {
    if (!this._last) return;
    const name = this.filename();
    if (typeof window.__qubaSendBlobToNative === 'function') {
      try { window.__qubaSendBlobToNative(this._last.blob, name, this._mime(), 'save'); return; } catch (e) {}
    }
    const a = document.createElement('a');
    a.href = this._lastUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  async share() {
    if (!this._last) return;
    const name = this.filename();
    const file = new File([this._last.blob], name, { type: this._mime() });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Quba' }); return; } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    if (typeof window.__qubaSendBlobToNative === 'function') {
      try { window.__qubaSendBlobToNative(this._last.blob, name, this._mime(), 'share'); return; } catch (e) {}
    }
    this.download();
  },

  cleanup() {
    cancelAnimationFrame(this._raf);
    this._playing = false;
    this._media = { key: null, val: null };
    if (this._vid) { try { this._vid.pause(); this._vid.removeAttribute('src'); this._vid.load(); } catch (e) {} this._vid = null; }
    if (this._gen.ctrl) { try { this._gen.ctrl.abort(); } catch (e) {} }
  },
};

if (typeof window !== 'undefined') window.VideoStudioPage = VideoStudioPage;
