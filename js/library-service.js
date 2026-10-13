// 🗄️ LibraryService — تنزيل كتب المكتبة وتخزينها للقراءة بلا إنترنت (v73)
// المصدر: واجهة مفتوحة (turath.io) تجمع كتب المكتبة الشاملة ومكتبات محقّقة.
// التنزيل يُخزَّن في IndexedDB (CacheDB) صفحةً صفحة، فيبقى الكتاب على «الرفّ»
// ويُقرأ بعدها دون اتصال. البروكسي (CONFIG.API.PROXY) اختياري لتجاوز CORS.
const LibraryService = {
  API: 'https://api.turath.io/',
  _inflight: {}, // منع التنزيل المزدوج

  _url(path) {
    const base = (typeof CONFIG !== 'undefined' && CONFIG.API && CONFIG.API.LIBRARY) || this.API;
    return base.replace(/\/$/, '') + '/' + String(path).replace(/^\//, '');
  },

  async _fetchJson(url) {
    const proxy = this._proxy();
    const attempts = [];
    if (proxy) attempts.push(proxy.replace(/\/$/, '') + '/lib?u=' + encodeURIComponent(url));
    attempts.push(url);
    let lastErr = null;
    for (const u of attempts) {
      try {
        const r = await fetch(u, { headers: { 'Accept': 'application/json' } });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return await r.json();
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('fetch failed');
  },

  // v1.0.84 — الوسيط من إعداد المستخدم أولًا، ثم من متغيّر البيئة.
  _proxy() {
    try { if (typeof Storage !== 'undefined') { const v = Storage.get('library_proxy'); if (v) return String(v); } } catch (e) { /* تجاهل */ }
    return (typeof CONFIG !== 'undefined' && CONFIG.API && CONFIG.API.PROXY) || '';
  },

  // ============ بيانات الكتاب والفهرس ============
  async bookInfo(id) {
    const cached = await CacheDB.get('lib_info_' + id);
    if (cached && cached.headings && cached.headings.length) return cached;
    const d = await this._fetchJson(this._url('book') + '?id=' + id + '&include=indexes&ver=3');
    const meta = d.meta || {};
    const ix = d.indexes || {};
    const headings = (ix.headings || []).map(h => ({ title: h.title, level: h.level || 1, page: h.page || 1 }));
    const maxPage = headings.reduce((m, h) => Math.max(m, h.page || 0), 0);
    const info = (meta.info || '').split('\n').filter(Boolean);
    const author = (info.find(l => l.indexOf('المؤلف') === 0 || l.indexOf('المؤلف:') === 0) || '').replace(/^.*?[:：]\s*/, '') || (meta.author_name || '');
    const volumes = (ix.volumes && ix.volumes.length) || 0;
    const out = {
      id: Number(id),
      name: meta.name || '',
      author: author.trim(),
      catId: meta.cat_id || null,
      volumes,
      maxPage: maxPage || null,
      info,
      headings,
    };
    await CacheDB.set('lib_info_' + id, out);
    return out;
  },

  async page(id, n) {
    const key = 'lib_p_' + id + '_' + n;
    const cached = await CacheDB.get(key);
    if (cached !== null && cached !== undefined) return cached;
    const d = await this._fetchJson(this._url('page') + '?book_id=' + id + '&pg=' + n + '&ver=3');
    let meta = {};
    try { meta = typeof d.meta === 'string' ? JSON.parse(d.meta) : (d.meta || {}); } catch (e) { meta = {}; }
    const out = { text: d.text || '', meta };
    await CacheDB.set(key, out); // تخزين تلقائي أثناء القراءة (أوفلاين تدريجي)
    return out;
  },

  isPageCached(id, n) { return CacheDB.get('lib_p_' + id + '_' + n).then(v => v !== null && v !== undefined); },

  // ============ البحث (الجامع) ============
  async search(q, catId) {
    let path = 'search?q=' + encodeURIComponent(q || '') + '&ver=3';
    if (catId) path += '&cat_id=' + catId;
    const d = await this._fetchJson(this._url(path));
    const seen = {};
    const books = [];
    (d.data || []).forEach(r => {
      const bid = r.book_id;
      if (!bid || seen[bid]) return;
      seen[bid] = 1;
      let meta = {};
      try { meta = typeof r.meta === 'string' ? JSON.parse(r.meta) : (r.meta || {}); } catch (e) { meta = {}; }
      books.push({
        id: bid,
        name: meta.book_name || '',
        author: meta.author_name || '',
        catId: r.cat_id || null,
        snippet: String(r.snip || r.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90),
      });
    });
    return { count: d.count || 0, books };
  },

  // كتب قسم معيّن (تُستخدم لملء «الجامع» عند اختيار تصنيف)
  async byCategory(catId, limit) {
    // بحث بكلمة شائعة داخل القسم (البحث الفارغ لا يُرجع نتائج في هذا المصدر)
    const r = await this.search('الله', catId);
    return r.books.slice(0, limit || 60);
  },

  // ============ الرفّ (الكتب المنزّلة) ============
  shelf() { return (typeof Storage !== 'undefined' && Storage.get('library_shelf')) || []; },
  _saveShelf(list) { Storage.set('library_shelf', list); },
  isOnShelf(id) { return this.shelf().some(b => Number(b.id) === Number(id)); },
  isOnShelfKind(id, kind) {
    const k = kind || 't';
    return this.shelf().some(b => Number(b.id) === Number(id) && (b.kind || 't') === k);
  },

  async addToShelf(info, extra) {
    const list = this.shelf();
    if (list.some(b => Number(b.id) === Number(info.id))) return;
    list.unshift({
      id: Number(info.id),
      name: info.name || '',
      author: info.author || '',
      catId: info.catId || null,
      volumes: info.volumes || 0,
      maxPage: info.maxPage || null,
      addedAt: Date.now(),
      downloaded: true,
      ...(extra || {}),
    });
    this._saveShelf(list);
  },

  // حفظ معلومات أساسية دون تنزيل (عند فشل كامل التنزيل)
  async saveStub(book) {
    const list = this.shelf();
    if (list.some(b => Number(b.id) === Number(book.id))) return;
    list.unshift({ id: Number(book.id), name: book.name || '', author: book.author || '', catId: book.catId || null, addedAt: Date.now(), downloaded: false });
    this._saveShelf(list);
  },

  async remove(id) {
    const list = this.shelf().filter(b => Number(b.id) !== Number(id));
    this._saveShelf(list);
    // حذف الصفحات المخزّنة
    try {
      const keys = await CacheDB.keys();
      const pre = 'lib_p_' + id + '_';
      for (const k of keys) { if (String(k).indexOf(pre) === 0) await CacheDB.remove(k); }
      await CacheDB.remove('lib_info_' + id);
    } catch (e) { /* تجاهل */ }
    if (typeof Storage !== 'undefined') Storage.remove('lib_prog_' + id);
  },

  // ============ تقدم القراءة ============
  progress(id) { return (typeof Storage !== 'undefined' && Storage.get('lib_prog_' + id)) || null; },
  setProgress(id, page, total) {
    const prev = this.progress(id) || {};
    Storage.set('lib_prog_' + id, { page: page, total: total || prev.total || null, updatedAt: Date.now() });
  },

  // ============ التنزيل ============
  // تنزيل نطاق صفحات [start..end] مع تقرير التقدّم. يُخزَّن كل شيء في IndexedDB.
  async downloadRange(id, start, end, onProgress, shouldStop) {
    const total = Math.max(1, end - start + 1);
    let done = 0;
    const CONC = 4;
    let cursor = start;
    let emptyRun = 0;
    while (cursor <= end) {
      const batch = [];
      for (let i = 0; i < CONC && cursor <= end; i++, cursor++) batch.push(cursor);
      const results = await Promise.all(batch.map(async (n) => {
        if (shouldStop && shouldStop()) return { n, skipped: true };
        try { const p = await this.page(id, n); return { n, text: p.text }; }
        catch (e) { return { n, err: true }; }
      }));
      for (const r of results) {
        if (r.skipped) return { done, total, stopped: true };
        done++;
        if (r.text) emptyRun = 0; else emptyRun++;
        if (onProgress) onProgress(done, total);
      }
      if (emptyRun >= CONC * 3) break; // نهاية الكتاب (صفحات فارغة متتالية)
    }
    return { done, total, reachedEnd: emptyRun >= CONC * 3 };
  },

  // تنزيل الكتاب كاملًا (حتى maxPage، بحدّ أقصى آمن)
  async downloadBook(id, info, onProgress, shouldStop) {
    if (this._inflight[id]) return this._inflight[id];
    const maxPage = (info && info.maxPage) || (await this.bookInfo(id).catch(() => ({}))).maxPage;
    const cap = 1200;
    const end = Math.min(maxPage || cap, cap);
    this._inflight[id] = this.downloadRange(id, 1, end, onProgress, shouldStop);
    try {
      const res = await this._inflight[id];
      await this.addToShelf(info || (await this.bookInfo(id)), { maxPage });
      return res;
    } finally {
      delete this._inflight[id];
    }
  },

  // ============ المفضّلة (v1.0.80) ============
  FAV_KEY: 'library_favs',
  favs() { return (typeof Storage !== 'undefined' && Storage.get('library_favs')) || []; },
  isFav(key) { return this.favs().some(f => String(f.key) === String(key)); },
  toggleFav(key, meta) {
    const list = this.favs();
    const i = list.findIndex(f => String(f.key) === String(key));
    if (i >= 0) { list.splice(i, 1); this._saveShelfKey(list); return false; }
    list.unshift(Object.assign({ key: String(key), addedAt: Date.now() }, meta || {}));
    this._saveShelfKey(list); return true;
  },
  _saveShelfKey(list) { Storage.set('library_favs', list); },
  favCount() { return this.favs().length; },

  // ============ كتب PDF الخارجية (IslamHouse) ============
  pdfKey(lang, id) { return 'ih_' + String(lang) + '_' + String(id); },
  async getPdfBlob(key) { try { return await CacheDB.get('lib_pdf_' + key); } catch (e) { return null; } },
  async hasPdf(key) { const b = await this.getPdfBlob(key); return !!b; },
  async removePdf(key) { try { await CacheDB.remove('lib_pdf_' + key); } catch (e) {} },
  // يُنزّل الـPDF مع تقرير التقدّم، يخزّنه في IndexedDB للقراءة بلا إنترنت، ثم يحفظه في جهاز المستخدم
  async downloadPdf(url, key, filename, onProgress) {
    const r = await fetch(url, { mode: 'cors' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const total = Number(r.headers.get('content-length')) || 0;
    let blob;
    const reader = (r.body && r.body.getReader) ? r.body.getReader() : null;
    if (reader) {
      const chunks = []; let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); got += value.length;
        if (onProgress) onProgress(got, total);
      }
      blob = new Blob(chunks, { type: 'application/pdf' });
    } else {
      blob = await r.blob();
      if (onProgress) onProgress(blob.size, blob.size);
    }
    try { await CacheDB.set('lib_pdf_' + key, blob); } catch (e) { /* كاش فشل — نكمل */ }
    this.saveBlobToDevice(blob, filename);
    return blob;
  },
  saveBlobToDevice(blob, filename) {
    try {
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = filename || 'book.pdf'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 90000);
      return true;
    } catch (e) { return false; }
  },
  async pdfObjectUrl(key) {
    const b = await this.getPdfBlob(key);
    if (!b) return null;
    try { return URL.createObjectURL(b); } catch (e) { return null; }
  },

  // حجم الكتاب التقريبي بالميغابايت (تقديري: ~9KB للصفحة)
  estimateSizeMb(maxPage) { return Math.max(0.2, ((maxPage || 200) * 9000) / 1048576); },

  async usedStorage() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        return est.usage || 0;
      }
    } catch (e) { /* تجاهل */ }
    return 0;
  },
};

if (typeof module !== 'undefined') module.exports = LibraryService;
