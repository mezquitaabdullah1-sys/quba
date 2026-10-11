// 🌍 LibrarySources — مصادر المكتبة متعددة اللغات (v1.0.77)
// ١) HadeethEnc  — موسوعة الأحاديث المترجمة (ar/es/en)، واجهة تدعم CORS فتُقرأ داخل التطبيق.
// ٢) IslamHouse  — مكتبة كتب وقفية بلغات كثيرة (es/en/ar)؛ تُفتح كتبها من موقعها.
// ملاحظة: كتب «المكتبة الشاملة» العلمية تُجلب من turath.io (انظر library-service.js).
const LibrarySources = {

  HADEETH: 'https://hadeethenc.com/api/v1/',
  ISLAMHOUSE: 'https://islamhouse.com/',

  _get(url) {
    return fetch(url, { headers: { 'Accept': 'application/json' } }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  },

  // ===== HadeethEnc =====
  async hadithCategories(lang) {
    const d = await this._get(this.HADEETH + 'categories/list/?language=' + encodeURIComponent(lang));
    const arr = Array.isArray(d) ? d : [];
    // v1.0.83 — الأبواب الأصلية فقط (parent_id = null)
    const top = arr.filter(c => c.parent_id === null || c.parent_id === undefined || c.parent_id === '');
    return (top.length ? top : arr).map(c => ({ id: String(c.id), title: c.title, count: c.hadeeths_count }));
  },
  // v1.0.83 — الواجهة ترفض الطلب بلا category_id (404)، لذا نُرسل قسمًا دائمًا مع per_page.
  async hadithList(lang, catId, page) {
    const u = this.HADEETH + 'hadeeths/list/?language=' + encodeURIComponent(lang) +
      '&category_id=' + encodeURIComponent(catId || '1') + '&per_page=20&page=' + (page || 1);
    const d = await this._get(u);
    const arr = (d && d.data) || [];
    return arr.map(h => ({
      id: String(h.id),
      title: h.title || '',
      body: h.hadeeth || h.translation || h.text || '',
      expl: h.explanation || '',
      ref: h.reference || h.references || '',
    }));
  },
  hadithUrl(lang, id) { return 'https://hadeethenc.com/' + lang + '/browse/' + id; },
  // الشرح الكامل عند الحاجة (يُتجاهل بأمان إن لم تتوفّر الواجهة)
  async hadithOne(lang, id) {
    try {
      const d = await this._get(this.HADEETH + 'hadeeths/one/?language=' + encodeURIComponent(lang) + '&id=' + encodeURIComponent(id));
      return (d && (d.id || d.hadeeth || d.title)) ? { id: String(d.id || id), title: d.title || '', body: d.hadeeth || d.translation || d.text || '', expl: d.explanation || '', ref: d.reference || '' } : null;
    } catch (e) { return null; }
  },

  // ===== IslamHouse =====
  itemUrl(lang, id) { return this.ISLAMHOUSE + lang + '/books/' + id + '/'; },
};

if (typeof module !== 'undefined') module.exports = LibrarySources;
