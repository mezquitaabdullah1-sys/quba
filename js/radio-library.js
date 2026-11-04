// 📥 RadioLib — تنزيلات القراءات + المفضلة (v1.0.126)
// • التنزيل: الملف الصوتي يُخزَّن في IndexedDB (CacheDB) بلا انتهاء صلاحية →
//   يعمل دون شبكة، ويُشغَّل من blob: داخل WebView (لا يمرّ بالشبكة إطلاقًا).
// • المفضلة: فهرس صغير في localStorage (لا صوت) يشير إلى الإذاعة/القارئ/السورة.
const RadioLib = {
  FAV_KEY: 'quba_radio_favs',
  DL_KEY: 'quba_radio_dl',
  _favs: null,
  _dls: null,
  _urls: {},

  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const v = JSON.parse(raw);
        if (Array.isArray(v)) return v;
      }
    } catch (e) {}
    return fallback;
  },
  _write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  },

  // ================= المفضلة =================
  // شكل العنصر: {t:'station', stId} | {t:'live', rid, liveIdx} |
  //             {t:'reciter', rid} | {t:'quran', rid, surah}
  favs() {
    if (!this._favs) this._favs = this._read(this.FAV_KEY, []);
    return this._favs;
  },
  key(it) {
    if (!it) return '';
    if (it.t === 'station') return 's:' + it.stId;
    if (it.t === 'live') return 'l:' + it.rid + ':' + (it.liveIdx || 0);
    if (it.t === 'reciter') return 'r:' + it.rid;
    return 'q:' + it.rid + ':' + (it.surah || 0);
  },
  isFav(it) {
    const k = this.key(it);
    return !!k && this.favs().some(x => x.k === k);
  },
  toggleFav(it) {
    const k = this.key(it);
    if (!k) return false;
    const list = this.favs();
    const i = list.findIndex(x => x.k === k);
    if (i >= 0) {
      list.splice(i, 1);
      this._write(this.FAV_KEY, list);
      return false;
    }
    list.unshift(Object.assign({}, it, { k, at: Date.now() }));
    this._write(this.FAV_KEY, list);
    return true;
  },
  removeFav(k) {
    const list = this.favs();
    const i = list.findIndex(x => x.k === k);
    if (i >= 0) { list.splice(i, 1); this._write(this.FAV_KEY, list); }
  },

  // ================= التنزيلات =================
  list() {
    if (!this._dls) this._dls = this._read(this.DL_KEY, []);
    return this._dls;
  },
  has(rid, surah) {
    return this.list().some(d => d.rid === rid && d.surah === Number(surah));
  },
  totalBytes() {
    return this.list().reduce((s, d) => s + (d.bytes || 0), 0);
  },
  size(b) {
    if (!b || b <= 0) return '0 KB';
    if (b < 1024 * 1024) return Math.round(b / 1024) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  },
  _dk(rid, n) { return 'radiodl:' + rid + ':' + Number(n); },

  // v1.0.130: تنزيل موثوق — يتحقق من وجود الصوت فعليًا (لا من الفهرس فقط)،
  // ويستخدم fetch ثم XHR كبديل (fetch يفشل في بعض إصدارات WebView مع
  // إعادة توجيه CDN)، ويحفظ بانتظار اكتمال الكتابة في IndexedDB.
  // يُرجع الحجم بالبايت عند النجاح، أو 0 عند الفشل.
  async save(rid, surah, onProgress) {
    if (typeof RadioData === 'undefined' || typeof CacheDB === 'undefined') return 0;
    const n = Number(surah);
    const key = this._dk(rid, n);
    if (this.has(rid, n)) {
      const present = await this._blobOf(key);
      if (present && present.size) return 0;
      this._dropRecord(rid, n);            // فهرس يقول «محمّل» بلا صوت → نعيد التنزيل
    }
    const reciter = RadioData.reciter(rid);
    const url = RadioData.surahFileUrl(reciter, n);
    if (!url) return 0;
    try {
      const buf = await this._fetchAudio(url, onProgress);
      if (!buf || !buf.byteLength) throw new Error('empty');
      const blob = new Blob([buf], { type: 'audio/mpeg' });
      const stored = (typeof CacheDB.setBlob === 'function')
        ? await CacheDB.setBlob(key, blob)
        : await CacheDB.set(key, blob, null);
      if (!stored) throw new Error('store');
      const rec = this.list().filter(d => !(d.rid === rid && d.surah === n));
      rec.unshift({ rid, surah: n, bytes: blob.size, at: Date.now() });
      this._dls = rec;
      this._write(this.DL_KEY, rec);
      return blob.size;
    } catch (e) {
      try { console.warn('RadioLib.save:', e && e.message); } catch (_) {}
      return 0;
    }
  },

  async _blobOf(key) {
    try { return await CacheDB.get(key); } catch (e) { return null; }
  },

  _dropRecord(rid, surah) {
    const rec = this.list().filter(d => !(d.rid === rid && d.surah === Number(surah)));
    this._dls = rec;
    this._write(this.DL_KEY, rec);
  },

  // يجلب ملف MP3: fetch أولًا، ثم XHR (يمرّ في WebView حيث يفشل fetch)
  _fetchAudio(url, onProgress) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const done = (v) => { if (!settled) { settled = true; resolve(v); } };
      const fail = (e) => { if (!settled) { settled = true; reject(e); } };

      const viaXhr = () => {
        try {
          const x = new XMLHttpRequest();
          x.open('GET', url, true);
          x.responseType = 'arraybuffer';
          x.timeout = 180000;
          if (typeof onProgress === 'function') {
            x.onprogress = (ev) => { if (ev.lengthComputable) onProgress(ev.loaded, ev.total); };
          }
          x.onload = () => {
            if (x.status >= 200 && x.status < 300 && x.response && x.response.byteLength) done(x.response);
            else fail(new Error('xhr ' + x.status));
          };
          x.onerror = () => fail(new Error('xhr net'));
          x.ontimeout = () => fail(new Error('xhr timeout'));
          x.send();
        } catch (e) { fail(e); }
      };

      let started = false;
      if (typeof fetch === 'function') {
        fetch(url, { cache: 'no-store' })
          .then(res => {
            if (!res || !res.ok) throw new Error('http ' + (res && res.status));
            return res.arrayBuffer();
          })
          .then(buf => { if (buf && buf.byteLength) done(buf); else throw new Error('empty'); })
          .catch(() => { if (!started) { started = true; viaXhr(); } });
      } else { started = true; viaXhr(); }
    });
  },

  /** v1.0.130: نسخ تلاوة منزَّلة إلى ملف على الجهاز (تنزيل حقيقي). */
  async saveToDevice(rid, surah) {
    const n = Number(surah);
    const blob = await this._blobOf(this._dk(rid, n));
    if (!blob || !blob.size) return false;
    const reciter = (typeof RadioData !== 'undefined') ? RadioData.reciter(rid) : null;
    const base = (reciter && (reciter.id || reciter.name)) ? String(reciter.id || '') : String(rid);
    const name = 'Quba-' + base + '-' + String(n).padStart(3, '0') + '.mp3';
    try {
      if (typeof window !== 'undefined' && window.__qubaSendBlobToNative && typeof Android !== 'undefined') {
        await window.__qubaSendBlobToNative(blob, name, 'audio/mpeg', 'save');
        return true;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => { try { URL.revokeObjectURL(url); } catch (e) {} }, 5000);
      return true;
    } catch (e) {
      return false;
    }
  },

  async blobUrl(rid, surah) {
    const k = this._dk(rid, surah);
    if (this._urls[k]) return this._urls[k];
    try {
      const blob = await CacheDB.get(k);
      if (!blob) return null;
      const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob], { type: 'audio/mpeg' }));
      this._urls[k] = url;
      return url;
    } catch (e) {
      return null;
    }
  },

  async remove(rid, surah) {
    const k = this._dk(rid, surah);
    try {
      if (this._urls[k]) { URL.revokeObjectURL(this._urls[k]); delete this._urls[k]; }
    } catch (e) {}
    try {
      if (typeof CacheDB !== 'undefined') {
        if (CacheDB.remove) await CacheDB.remove(k);
        else await CacheDB.set(k, null, null);
      }
    } catch (e) {}
    const rec = this.list().filter(d => !(d.rid === rid && d.surah === Number(surah)));
    this._dls = rec;
    this._write(this.DL_KEY, rec);
  },
};

if (typeof window !== 'undefined') window.RadioLib = RadioLib;
