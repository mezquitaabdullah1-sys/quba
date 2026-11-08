/**
 * 🎥 VideoBgCatalog — كتالوج خلفيات الفيديو وتنزيلها عند الطلب (v1.0.167)
 *
 * المبدأ: لا مقطع فيديو مضمَّن في التطبيق. الكتالوج (JSON صغير) يأتي مع البناء،
 * والمستخدم ينزّل المقطع الذي يريده فقط، فيُخزَّن في IndexedDB ويُعاد استخدامه
 * بلا إنترنت. المقاطع هنا مُلك عام / CC0 → لا ترخيص ولا ذكر إلزامي.
 */

const VideoBgCatalog = {
  URL: 'assets/video-bg/catalog.json',
  PREFIX: 'vbg_',
  _cat: null,
  _urls: new Map(),   // id -> objectURL (blob من IndexedDB)
  _busy: new Map(),

  async load() {
    if (this._cat) return this._cat;
    try {
      const r = await fetch(this.URL, { cache: 'no-cache' });
      this._cat = await r.json();
    } catch (e) {
      console.warn('VideoBgCatalog: no catalogue', e);
      this._cat = { clips: [] };
    }
    return this._cat;
  },

  async clips() {
    const c = await this.load();
    return (c.clips || []).filter(x => x && x.url);
  },

  title(clip, locale) {
    const t = clip && clip.title ? clip.title : {};
    return t[locale] || t.es || t.en || t.ar || (clip && clip.id) || '';
  },

  _key(id) { return this.PREFIX + id; },

  /** هل المقطع محفوظ محليًا؟ */
  async isCached(id) {
    try {
      const v = await CacheDB.get(this._key(id));
      return !!(v && v.size > 1024);
    } catch (e) { return false; }
  },

  /** نسبة التحميل الحالية أو null. */
  progress(id) {
    const b = this._busy.get(id);
    return b ? b.pct : null;
  },

  /** يرجّع object URL للمقطع، وينزّله أولًا إن لزم. onProgress(0..1). */
  async ensure(id, onProgress, signal) {
    if (this._urls.has(id)) return this._urls.get(id);

    if (this._busy.has(id)) {
      // انتظار التحميل الجاري بدل بدء ثانٍ
      return this._busy.get(id).promise;
    }

    const task = { pct: 0, promise: null };
    task.promise = (async () => {
      let blob = null;
      try { blob = await CacheDB.get(this._key(id)); } catch (e) {}
      if (!blob || !blob.size) {
        const list = await this.clips();
        const clip = list.find(c => c.id === id);
        if (!clip) throw new Error('clip_not_found');
        blob = await this._download(clip, (p) => {
          task.pct = p;
          if (onProgress) onProgress(p);
        }, signal);
        try { await CacheDB.setBlob(this._key(id), blob); } catch (e) { console.warn('cache store failed', e); }
      }
      const url = URL.createObjectURL(blob);
      this._urls.set(id, url);
      return url;
    })();

    this._busy.set(id, task);
    try {
      return await task.promise;
    } finally {
      this._busy.delete(id);
    }
  },

  _download(clip, onProgress, signal) {
    return new Promise(async (resolve, reject) => {
      try {
        const r = await fetch(clip.url, { mode: 'cors', credentials: 'omit' });
        if (!r.ok) return reject(new Error('HTTP ' + r.status));
        const total = Number(r.headers.get('content-length') || clip.bytes || 0);
        if (!r.body || !r.body.getReader) {
          const b = await r.blob();
          onProgress && onProgress(1);
          return resolve(b);
        }
        const reader = r.body.getReader();
        const parts = [];
        let got = 0;
        for (;;) {
          if (signal && signal.aborted) { try { reader.cancel(); } catch (e) {} return reject(new Error('aborted')); }
          const { done, value } = await reader.read();
          if (done) break;
          parts.push(value);
          got += value.length;
          if (total && onProgress) onProgress(Math.min(0.99, got / total));
        }
        const blob = new Blob(parts, { type: clip.mime || 'video/mp4' });
        onProgress && onProgress(1);
        resolve(blob);
      } catch (e) { reject(e); }
    });
  },

  /** يحذف مقاطع محفوظة لتحرير المساحة. */
  async clearCache() {
    const list = await this.clips();
    for (const c of list) {
      try { await CacheDB.remove(this._key(c.id)); } catch (e) {}
      const u = this._urls.get(c.id);
      if (u) { URL.revokeObjectURL(u); this._urls.delete(c.id); }
    }
  },

  /** الحجم الكلي المحفوظ بالميجابايت. */
  async cachedSize() {
    const list = await this.clips();
    let n = 0;
    for (const c of list) {
      try { const v = await CacheDB.get(this._key(c.id)); if (v && v.size) n += v.size; } catch (e) {}
    }
    return n / 1048576;
  },

  /** صورة مصغّرة من أول ثانية (لمعاينة الاختيار) — تُحفظ في الذاكرة. */
  _thumbs: new Map(),

  /**
   * مصغّرة من المخزّن فقط — لا تُنزّل المقطع إن لم يكن محفوظًا.
   * (v1.0.168: كان thumb() ينزّل كل المقاطع لمجرد فتح تبويب «مقاطع طبيعة».)
   */
  async cachedThumb(clip, w = 150, h = 266) {
    if (this._thumbs.has(clip.id)) return this._thumbs.get(clip.id);
    let blob = null;
    try { blob = await CacheDB.get(this._key(clip.id)); } catch (e) {}
    if (!blob || !blob.size) return null;
    return this._thumbFromBlob(clip, blob, w, h);
  },

  /** مصغّرة مع ضمان التنزيل (تُستخدم بعد اختيار المستخدم للمقطع). */
  async thumb(clip, w = 150, h = 266) {
    if (this._thumbs.has(clip.id)) return this._thumbs.get(clip.id);
    try {
      const url = await this.ensure(clip.id);
      const blob = await (await fetch(url)).blob();
      return await this._thumbFromBlob(clip, blob, w, h);
    } catch (e) { return null; }
  },

  async _thumbFromBlob(clip, blob, w = 150, h = 266) {
    if (this._thumbs.has(clip.id)) return this._thumbs.get(clip.id);
    return new Promise(async (resolve) => {
      let vid = null, objUrl = null;
      try {
        objUrl = URL.createObjectURL(blob);
        vid = document.createElement('video');
        vid.src = objUrl;
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = 'auto';
        await new Promise((res, rej) => {
          const to = setTimeout(() => rej(new Error('timeout')), 12000);
          vid.onloadeddata = () => { clearTimeout(to); res(); };
          vid.onerror = () => { clearTimeout(to); rej(new Error('media_error')); };
        });
        try { vid.currentTime = 0.8; await new Promise(r => { vid.onseeked = r; setTimeout(r, 1200); }); } catch (e) {}
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#0E4B3C';
        cx.fillRect(0, 0, w, h);
        drawCover(cx, vid, w, h);
        const out = cv.toDataURL('image/jpeg', 0.7);
        this._thumbs.set(clip.id, out);
        resolve(out);
      } catch (e) {
        resolve(null);
      } finally {
        if (vid) { try { vid.removeAttribute('src'); vid.load(); } catch (e) {} }
        if (objUrl) { try { URL.revokeObjectURL(objUrl); } catch (e) {} }
      }
    });
  },
};

/** يرسم مصدر فيديو/صورة بتغطية كاملة (cover) داخل مستطيل. */
function drawCover(cx, media, W, H, rect) {
  const mw = media.videoWidth || media.naturalWidth || media.width || 1;
  const mh = media.videoHeight || media.naturalHeight || media.height || 1;
  const r = rect || { x: 0, y: 0, w: W, h: H };
  const s = Math.max(r.w / mw, r.h / mh);
  const dw = mw * s, dh = mh * s;
  cx.drawImage(media, r.x + (r.w - dw) / 2, r.y + (r.h - dh) / 2, dw, dh);
}

if (typeof window !== 'undefined') window.VideoBgCatalog = VideoBgCatalog;
