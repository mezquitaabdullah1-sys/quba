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

  // v1.0.125 — جسر HTTP أصلي داخل تطبيق أندرويد: يُنفَّذ الطلب في Kotlin
  // (HttpURLConnection) فلا تنطبق سياسة CORS إطلاقًا — هذه هي الطريقة التي
  // تجعل api.turath.io (بلا Access-Control-Allow-Origin) يعمل داخل التطبيق.
  _seq: 0,
  _httpPool: null,
  _nativeGet(url) {
    return new Promise((resolve, reject) => {
      const nat = (typeof window !== 'undefined') && window.QubaNative;
      const And = (typeof window !== 'undefined') && window.Android;
      if (!nat || !And || typeof And.httpGet !== 'function' || typeof nat.addEventListener !== 'function') {
        reject(new Error('no-native')); return;
      }
      const id = 'h' + Date.now() + '_' + (++this._seq);
      let settled = false;
      const done = (fn, v) => { if (settled) return; settled = true; try { nat.removeEventListener('message', onMsg); } catch (e) {} clearTimeout(timer); fn(v); };
      const onMsg = (ev) => {
        try {
          const d = JSON.parse(ev && ev.data);
          if (!d || d.t !== 'http' || d.id !== id) return;
          if (d.e) done(reject, new Error(d.e));
          else if (d.s >= 200 && d.s < 300) done(resolve, d.b);
          else done(reject, new Error('HTTP ' + d.s));
        } catch (e) { /* رسالة أخرى */ }
      };
      const timer = setTimeout(() => done(reject, new Error('native-timeout')), 30000);
      try { nat.addEventListener('message', onMsg); } catch (e) { done(reject, new Error('no-native')); return; }
      try { And.httpGet(id, url); } catch (e) { done(reject, e); }
    });
  },

  async _fetchJson(url) {
    const proxy = this._proxy();
    const attempts = [];
    attempts.push({ kind: 'native', url: url });
    if (proxy) attempts.push({ kind: 'proxy', url: proxy.replace(/\/$/, '') + '/lib?u=' + encodeURIComponent(url) });
    attempts.push({ kind: 'direct', url: url });
    let lastErr = null;
    for (const a of attempts) {
      try {
        let txt;
        if (a.kind === 'native') {
          txt = await this._nativeGet(a.url);
          return typeof txt === 'string' ? JSON.parse(txt) : txt;
        }
        const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const t = ctrl ? setTimeout(() => ctrl.abort(), 12000) : null;
        const r = await fetch(a.url, { headers: { 'Accept': 'application/json' }, signal: ctrl ? ctrl.signal : undefined });
        if (t) clearTimeout(t);
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
  // v1.0.125 — تنزيل نطاق صفحات [start..end] بتصحيح جوهري:
  //  • الصفحة الفاشلة لا تُحسب منجزة (كانت done++ تُحسب مع الفشل).
  //  • إعادة محاولة ٣ مرات بتراجع أُسّي؛ بعدها تُسجَّل في failed فقط.
  //  • توقّف «نهاية الكتاب» لا يحدث إلا بصفحات فارغة متتالية بلا أي خطأ.
  //  • يعيد failed/complete ليُكتبا على الرفّ بدل علامة ✅ كاذبة.
  async downloadRange(id, start, end, onProgress, shouldStop) {
    const total = Math.max(1, end - start + 1);
    let done = 0;
    const failed = [];
    const CONC = 3;
    let cursor = start;
    let emptyRun = 0;
    let lastProgressAt = Date.now();
    while (cursor <= end) {
      if (shouldStop && shouldStop()) return { done, total, failed, stopped: true, complete: false };
      const batch = [];
      for (let i = 0; i < CONC && cursor <= end; i++, cursor++) batch.push(cursor);
      const results = await Promise.all(batch.map(n => this._pageWithRetry(id, n)));
      for (const r of results) {
        if (r.ok) {
          done++;
          if (r.empty) emptyRun++; else emptyRun = 0;
        } else {
          failed.push(r.n);
          emptyRun = 0; // خطأ شبكة ليس نهاية كتاب
        }
      }
      if (onProgress) onProgress(done, total);
      if (emptyRun >= 8) break; // نهاية الكتاب فعلًا
      lastProgressAt = Date.now();
    }
    const complete = failed.length === 0 && done >= total;
    return { done, total, failed, complete, reachedEnd: emptyRun >= 8 };
  },

  async _pageWithRetry(id, n) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const p = await this.page(id, n, attempt > 0);
        const txt = p && p.text ? String(p.text).trim() : '';
        return { ok: true, n: n, empty: !txt };
      } catch (e) {
        if (attempt < 2) await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt)));
      }
    }
    return { ok: false, n: n };
  },

  // استكمال التنزيل من آخر نقطة بدل البدء من جديد
  dlState(id) {
    try { return Storage.get('lib_dl_' + id) || null; } catch (e) { return null; }
  },
  _setDlState(id, st) { try { Storage.set('lib_dl_' + id, st); } catch (e) { /* تجاهل */ } },

  // تنزيل الكتاب كاملًا (حتى maxPage، بحدّ أقصى آمن) مع استكمال
  async downloadBook(id, info, onProgress, shouldStop) {
    if (this._inflight[id]) return this._inflight[id];
    const cap = 1200;
    const maxPage = (info && info.maxPage) || (await this.bookInfo(id).catch(() => ({}))).maxPage;
    const end = Math.min(maxPage || cap, cap);
    const prev = this.dlState(id);
    const start = (prev && !prev.complete && prev.next && prev.next > 1 && prev.next <= end) ? prev.next : 1;
    this._inflight[id] = this.downloadRange(id, start, end, (d, t) => {
      this._setDlState(id, { next: start + d, done: d, total: t, complete: false, at: Date.now() });
      if (onProgress) onProgress(d, t);
    }, shouldStop);
    try {
      const res = await this._inflight[id];
      const complete = !!(res && res.complete) && !res.stopped;
      this._setDlState(id, { next: complete ? end + 1 : (start + ((res && res.done) || 0)), done: (res && res.done) || 0, total: (res && res.total) || 0, complete, failed: ((res && res.failed) || []).length, at: Date.now() });
      await this.addToShelf(Object.assign({}, info || (await this.bookInfo(id)), {
        maxPage, complete, pages: (res && res.done) || 0, failedCount: ((res && res.failed) || []).length,
      }), { maxPage, complete, pages: (res && res.done) || 0 });
      return res;
    } finally {
      delete this._inflight[id];
    }
  },

  // جلب مسبق للصفحة التالية (تقليب فوري بلا انتظار الشبكة)
  async prefetch(id, n) {
    if (!n || n < 1) return;
    try { await this.page(id, n); } catch (e) { /* تجاهل */ }
  },

  // يطلب من النظام عدم مسح IndexedDB تحت ضغط التخزين
  async requestPersist() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        if (await navigator.storage.persisted()) return true;
        return await navigator.storage.persist();
      }
    } catch (e) { /* تجاهل */ }
    return false;
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
  // v1.0.86 — يجلب الـPDF ويخزّنه في IndexedDB فقط (بلا حفظ في الجهاز) — يُستعمل لفتح الكتاب داخل التطبيق
  async cachePdf(url, key, onProgress) {
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
    return blob;
  },
  // يُنزّل الـPDF مع تقرير التقدّم، يخزّنه في IndexedDB، ثم يحفظه في جهاز المستخدم
  async downloadPdf(url, key, filename, onProgress) {
    const blob = await this.cachePdf(url, key, onProgress);
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
