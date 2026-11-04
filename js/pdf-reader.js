// 📄 PdfReader — عارض PDF محلي داخل التطبيق يعتمد pdf.js (v1.0.125)
// لا يستعمل <iframe>: WebView في أندرويد لا يملك عارض PDF مدمجًا، فيظهر إطار أسود.
// يرسم الصفحات على <canvas> مباشرة من Bytes الملف (IndexedDB) فيعمل بلا إنترنت.
const PdfReader = {
  _doc: null, _obs: null, _slot: null, _zoom: 1, _name: '', _worker: '',

  // v1.0.125 — مسار العامل يُشتق من موضع السكربت نفسه (لا يفشل إن تغيّر الجذر)
  _workerUrl() {
    try {
      const sc = document.querySelector('script[src*="pdf.min.js"]');
      if (sc && sc.src) return sc.src.replace(/pdf(\.min)?\.js(\?.*)?$/, 'pdf.worker.min.js');
    } catch (e) { /* تجاهل */ }
    return 'assets/vendor/pdfjs/pdf.worker.min.js';
  },

  _lib() {
    if (typeof pdfjsLib !== 'undefined' && pdfjsLib && pdfjsLib.getDocument) return pdfjsLib;
    if (typeof window !== 'undefined' && window.pdfjsLib && window.pdfjsLib.getDocument) return window.pdfjsLib;
    return null;
  },

  close() {
    try { if (this._obs) this._obs.disconnect(); } catch (e) { /* تجاهل */ }
    this._obs = null;
    try { if (this._doc) this._doc.destroy(); } catch (e) { /* تجاهل */ }
    this._doc = null; this._slot = null; this._zoom = 1;
  },

  // data: ArrayBuffer | Uint8Array
  async show(slot, data, opts) {
    const lib = this._lib();
    if (!slot) return false;
    if (!lib) { this._fail(slot, opts); return false; }
    this.close();
    this._slot = slot;
    this._name = (opts && opts.name) || '';
    this._zoom = 1;
    try { this._worker = this._workerUrl(); lib.GlobalWorkerOptions.workerSrc = this._worker; } catch (e) { /* تجاهل */ }

    slot.innerHTML = `<div class="lpdf-wrap">
      <div class="lpdf-tools">
        <button class="lpdf-btn" id="lpdf-prev" title="السابق"><i class="fas fa-chevron-up"></i></button>
        <span class="lpdf-info" id="lpdf-info">…</span>
        <button class="lpdf-btn" id="lpdf-next" title="التالي"><i class="fas fa-chevron-down"></i></button>
        <button class="lpdf-btn" id="lpdf-zoom" title="تكبير"><i class="fas fa-magnifying-glass-plus"></i></button>
      </div>
      <div class="lpdf-viewport" id="lpdf-vp"><div class="lpdf-pages" id="lpdf-pages">
        <div class="lpdf-loading"><i class="fas fa-spinner fa-spin"></i> جارٍ فتح الكتاب…</div>
      </div></div></div>`;

    let task;
    try {
      const bytes = (data instanceof Uint8Array) ? data : new Uint8Array(data);
      task = lib.getDocument({ data: bytes, isEvalSupported: false, useSystemFonts: true });
      this._doc = await task.promise;
    } catch (e) {
      try { console.error('PdfReader:', e && e.message); } catch (_) {}
      this._fail(slot, opts, e && e.message);
      return false;
    }
    if (this._slot !== slot) return true; // غادر المستخدم الصفحة

    const pages = document.getElementById('lpdf-pages');
    if (!pages) return true;
    pages.innerHTML = '';
    const n = this._doc.numPages;
    for (let i = 1; i <= n; i++) {
      const d = document.createElement('div');
      d.className = 'lpdf-page'; d.dataset.p = String(i);
      d.style.minHeight = '220px';
      pages.appendChild(d);
    }
    this._wire(n);
    this._observe();
    this._render(1);
    return true;
  },

  _wire(n) {
    const vp = document.getElementById('lpdf-vp');
    const info = document.getElementById('lpdf-info');
    const pages = document.getElementById('lpdf-pages');
    const upd = () => {
      if (!info || !pages) return;
      const first = pages.querySelector('.lpdf-page');
      const vpTop = vp ? vp.scrollTop : 0;
      let cur = 1;
      pages.querySelectorAll('.lpdf-page').forEach(p => {
        if (p.offsetTop - vpTop <= 120) cur = Number(p.dataset.p) || 1;
      });
      info.textContent = cur + ' / ' + n + (this._zoom !== 1 ? ' · ' + Math.round(this._zoom * 100) + '%' : '');
      const a = document.getElementById('lpdf-prev'), b = document.getElementById('lpdf-next');
      if (a) a.disabled = cur <= 1;
      if (b) b.disabled = cur >= n;
    };
    this._upd = upd;
    if (vp) vp.addEventListener('scroll', () => { upd(); this._observe(); }, { passive: true });
    const prev = document.getElementById('lpdf-prev');
    const next = document.getElementById('lpdf-next');
    const zoom = document.getElementById('lpdf-zoom');
    if (prev) prev.onclick = () => this._jump(-1);
    if (next) next.onclick = () => this._jump(1);
    if (zoom) zoom.onclick = () => {
      this._zoom = this._zoom >= 2 ? 1 : Math.min(2, this._zoom + 0.35);
      zoom.classList.toggle('on', this._zoom !== 1);
      document.querySelectorAll('.lpdf-page').forEach(d => {
        delete d.dataset.done;
        d.style.minHeight = '220px';
        d.innerHTML = '';
      });
      this._render(1); upd();
    };
    upd();
  },

  _jump(d) {
    const pages = document.getElementById('lpdf-pages');
    const vp = document.getElementById('lpdf-vp');
    if (!pages || !vp) return;
    const list = Array.from(pages.querySelectorAll('.lpdf-page'));
    const vpTop = vp.scrollTop;
    let idx = 0;
    list.forEach((p, i) => { if (p.offsetTop - vpTop <= 120) idx = i; });
    const t = list[Math.max(0, Math.min(list.length - 1, idx + d))];
    if (t) vp.scrollTo({ top: t.offsetTop - 8, behavior: 'smooth' });
  },

  _observe() {
    const list = document.querySelectorAll('.lpdf-page');
    if (!list.length || typeof IntersectionObserver === 'undefined') return;
    if (!this._obs) {
      this._obs = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) this._render(Number(e.target.dataset.p)); });
      }, { root: document.getElementById('lpdf-vp'), rootMargin: '900px 0px' });
    }
    list.forEach(p => { if (!p.dataset.seen) { p.dataset.seen = '1'; this._obs.observe(p); } });
    this._render(1);
  },

  async _render(num) {
    const el = this._slot && this._slot.querySelector('.lpdf-page[data-p="' + num + '"]');
    if (!el || el.dataset.done || !this._doc) return;
    el.dataset.done = '1';
    try {
      const page = await this._doc.getPage(num);
      const vpW = (document.getElementById('lpdf-vp') || {}).clientWidth || 360;
      const base = page.getViewport({ scale: 1 });
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const fit = Math.min(3, Math.max(0.4, ((vpW - 16) / base.width) * this._zoom));
      const vp = page.getViewport({ scale: fit });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = Math.floor(vp.width) + 'px';
      canvas.style.height = Math.floor(vp.height) + 'px';
      el.style.minHeight = '0';
      const ctx = canvas.getContext('2d');
      const task = page.render({ canvasContext: ctx, viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
      // v1.0.125: pdf.js 3 يعيد وعدًا لا Promise كاملًا
      if (task && task.promise) { await task.promise; } else if (task && typeof task.then === 'function') { await task; }
      el.innerHTML = ''; el.appendChild(canvas);
      if (this._upd) this._upd();
    } catch (e) {
      el.dataset.done = '';
      el.innerHTML = '<div class="lpdf-ph" style="min-height:180px">—</div>';
    }
  },

  _fail(slot, opts, why) {
    const onSave = (opts && opts.onSave) ? 'window.__lpdfSave()' : '';
    slot.innerHTML = `<div class="lpdf-err">
      <i class="fas fa-file-circle-exclamation"></i>
      تعذّر عرض الملف داخل التطبيق.${why ? '<div style="font-size:10px;color:#8A93A0;margin-top:4px">' + String(why).slice(0,160) + '</div>' : ''}
      <div class="lpdf-fallback">
        ${onSave ? '<button class="lib-btn primary" onclick="window.__lpdfSave()"><i class="fas fa-download"></i> حفظ في الجهاز</button>' : ''}
        ${(opts && opts.url) ? `<button class="lib-btn ghost" onclick="window.open('${String(opts.url).replace(/'/g, '%27')}','_blank')"><i class="fas fa-up-right-from-square"></i> فتح خارجيًا</button>` : ''}
      </div></div>`;
  },
};
if (typeof window !== 'undefined') window.PdfReader = PdfReader;
if (typeof module !== 'undefined') module.exports = PdfReader;
