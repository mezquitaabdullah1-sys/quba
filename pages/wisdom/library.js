// 📚 LibraryPage — المكتبة الإسلامية (v1.0.82)
// التصميم: المكتبة العامة = شريط لغة + أبواب حسب اللغة + رفّي (رؤية الكل) + تحديث الرف.
// كل باب يعرض كتب اللغة المختارة فقط، وله قسمان: للكبار وللأطفال.
// أزرار: مفضّلة + إضافة إلى الرفّ + تنزيل/قراءة. وكل شيء يعمل بلا اعتماد على ترتيب السكربتات.
const LibraryPage = {
  _view: 'home', _from: 'home', _lang: 'ar', _topic: null, _split: 'adults', _kidsTab: 'kids',
  _book: null, _info: null, _results: null, _catId: null, _q: '', _pdfFrom: 'topic',
  _loading: false, _timer: null, _dlStop: null, _fs: null, _token: 0,
  _rpage: 1, _hcats: null, _hlist: null, _hcat: null,

  _dlState: {},
  L(k, v) { return LibraryData.L(k, v); },
  _el() { return document.getElementById('main-content'); },
  _rtl() { return document.documentElement.dir === 'rtl'; },
  _backIcon() { return this._rtl() ? 'fa-arrow-right' : 'fa-arrow-left'; },
  _chev() { return this._rtl() ? 'left' : 'right'; },

  render(container, params = {}) {
    this._fs = (Storage.get('library_fontsize')) || 20;
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
    const saved = (typeof Storage !== 'undefined' && Storage.get('library_lang')) || null;
    this._lang = (params && params.lang) || saved || (['ar', 'es', 'en'].indexOf(loc) !== -1 ? loc : 'ar');
    if (['ar', 'es', 'en'].indexOf(this._lang) === -1) this._lang = 'ar';
    if (params && params.hadith) { this._openHadith(); return; }
    if (params && params.book) { this._openBook(Number(params.book)); return; }
    if (params && params.ihbook) { this._openPdfById(Number(params.ihbook), 'shelf'); return; }
    if (params && params.shelf) { this._openShelfAll(); return; }
    if (params && params.favs) { this._openFavs(); return; }
    if (params && params.kids) { this._openKids(); return; }
    if (params && params.newmuslims) { this._openNewMuslims(); return; }
    if (params && params.topic) { this._openTopic(String(params.topic)); return; }
    if (params && (params.browse || params.q)) { this._openTopic(null, params.q || ''); return; }
    this._home();
  },

  // ============================================================
  // ================ عناصر مشتركة ==============================
  // ============================================================
  _setLang(l) {
    if (!l || l === this._lang) return;
    this._lang = l;
    if (typeof Storage !== 'undefined') Storage.set('library_lang', l);
    const v = this._view;
    if (v === 'jami') { this._openJami(); return; }
    if (v === 'topic') this._openTopic(this._topic, this._q);
    else if (v === 'kids') this._openKids();
    else if (v === 'newmuslims') this._openNewMuslims();
    else if (v === 'shelf') this._openShelfAll();
    else if (v === 'favs') this._openFavs();
    else if (v === 'hadith') { this._hcats = null; this._hlist = null; this._openHadith(); }
    else this._home();
  },

  _langBar() {
    return `<div class="lib-langbar">${LibraryData.LANGS.map(x =>
      `<button class="lib-lang ${x.id === this._lang ? 'on' : ''}" onclick="LibraryPage._setLang('${x.id}')">${esc(this.L(x.key))}</button>`
    ).join('')}</div>`;
  },

  _header(title, subtitle, backFn, extraHtml) {
    return `<div class="lib-header">
      <button class="lib-back" onclick="${backFn}" aria-label="${escapeAttr(this.L('libBack'))}"><i class="fas ${this._backIcon()}"></i></button>
      <div class="lib-header-text">
        <div class="lib-title">${esc(title || '')}</div>
        <div class="lib-subtitle">${esc(subtitle || '')}</div>
      </div>
      ${extraHtml || ''}
    </div>`;
  },

  _attribution() {
    return `<div class="lib-info-card"><i class="fas fa-circle-info"></i><div>${esc(this.L('libAttribution'))}</div></div>`;
  },

  // ============================================================
  // ================ المكتبة العامة ============================
  // ============================================================
  _home() {
    this._view = 'home'; this._topic = null;
    const el = this._el(); if (!el) return;
    const shelf = LibraryService.shelf();
    const n = shelf.length;
    const shelfRow = n
      ? `<div class="lib-shelf-row">${shelf.slice(0, 12).map(b => this._shelfBook(b)).join('')}</div>`
      : `<div class="lib-empty"><i class="fas fa-book-open-reader"></i>
           <div class="lib-empty-title">${esc(this.L('libEmptyTitle'))}</div>
           <div class="lib-empty-desc">${esc(this.L('libEmptyDesc'))}</div></div>`;

    el.innerHTML = `
      <div class="lib-page">
        ${this._header(this.L('libTitle'), this.L('libSubtitle'), 'LibraryPage._backHome()')}

        <div class="lib-banner">
          <div class="lib-banner-cover"><span></span><span></span><span></span></div>
          <div class="lib-banner-body">
            <div class="lib-banner-title">${esc(this.L('libAddTitle'))}</div>
            <div class="lib-banner-desc">${esc(this.L('libBannerOpenDesc'))}</div>
            <button class="lib-banner-btn" onclick="LibraryPage._openJami()"><i class="fas fa-book-open"></i> ${esc(this.L('libBrowseAdd'))}</button>
          </div>
        </div>

        ${this._duo()}
        ${this._favEntry()}

        <div class="lib-section-title"><span>${esc(this.L('libTopic'))}</span></div>
        <div class="lib-section-title" style="padding-top:0;font-size:12px;font-weight:600;color:var(--text-secondary);"><span>${esc(this.L('libTopicSub'))}</span></div>
        ${this._topicsGrid(false)}

        ${this._hadithEntry()}

        <div class="lib-section-title">
          <span>${esc(this.L('libMyShelf'))} <span style="font-size:11px;color:var(--text-secondary);font-weight:600;">· ${esc(this.L('libShelfCount', { n: n }))}</span></span>
          <button class="lib-see-all" onclick="LibraryPage._openShelfAll()">${esc(this.L('libSeeAll'))} <i class="fas fa-chevron-${this._chev()}"></i></button>
        </div>
        <div class="lib-shelf-wrap">${shelfRow}</div>

        <button class="lib-refresh" onclick="LibraryPage._refreshShelf(this)"><i class="fas fa-rotate"></i> ${esc(this.L('libRefreshShelf'))}</button>
        <div class="lib-refresh-note">${esc(this.L('libRefreshShelfNote'))}</div>
        <button class="lib-src-btn" onclick="LibraryPage._srcSettings()"><i class="fas fa-plug"></i> ${esc(this.L('libSourceSettings'))}</button>
        ${this._attribution()}
      </div>`;
  },

  _bannerSub() { return this._lang === 'es' ? this.L('libEsLibrary') : (this._lang === 'en' ? this.L('libEnLibrary') : this.L('libSubtitle')); },

  _topicsGrid(compact) {
    const ts = LibraryData.topicsFor(this._lang);
    const cols = ts.length <= 4 ? '' : (compact ? '' : '');
    return `<div class="lib-topics">${ts.map(t => {
      const label = t.key ? this.L(t.key) : t.label;
      const n = this._lang === 'ar' ? this._arGroupItems(t.group).length : LibraryData.ihGroupBooks(this._lang, t.group).length;
      const sub = t.key ? this.L('libPartOfLib') : this.L('libBooksCount', { n: n });
      return `<button class="lib-topic" onclick="LibraryPage._openTopic('${t.id}')">
        <span class="lib-topic-ic" style="--tc:${t.color}"><i class="fas ${t.icon}"></i></span>
        <span class="lib-topic-b"><span class="lib-topic-t">${esc(label)}</span><span class="lib-topic-n">${esc(sub)}</span></span>
      </button>`;
    }).join('')}${cols}</div>`;
  },

  _duo() {
    return `
      <div class="lib-duo">
        <button class="lib-duo-card du-nm" onclick="LibraryPage._openNewMuslims()">
          <i class="fas fa-seedling"></i>
          <span class="lib-duo-t">${esc(this.L('libCardNewMuslims'))}</span>
          <span class="lib-duo-d">${esc(this.L('libCardNewMuslimsDesc'))}</span>
        </button>
        <button class="lib-duo-card du-kids" onclick="LibraryPage._openKids()">
          <i class="fas fa-child-reaching"></i>
          <span class="lib-duo-t">${esc(this.L('libCardKids'))}</span>
          <span class="lib-duo-d">${esc(this.L('libCardKidsDesc'))}</span>
        </button>
      </div>`;
  },

  _hadithEntry() {
    return `<div class="lib-hadith-entry" onclick="LibraryPage._openHadith()">
      <i class="fas fa-quote-right"></i>
      <div><div class="lib-he-t">${esc(this.L('libHadithTitle'))}</div><div class="lib-he-d">${esc(this.L('libHadithDesc'))} · ${esc(this.L('libSourceHadeeth'))}</div></div>
      <i class="fas fa-chevron-${this._chev()}"></i>
    </div>`;
  },

  // ============================================================
  // ================ باب (تصنيف) + كبار/أطفال ==================
  // ============================================================
  _topicDef(id) { return LibraryData.topicsFor(this._lang).find(t => t.id === id) || null; },
  _topicAction(topicId) { const t = LibraryData.TILES.find(x => x.id === topicId); return t ? (t.action || {}) : {}; },

  // v1.0.83 — لغة الباب: مفاتيح اللغة التي فيها كتبٌ فعلًا داخل هذا الباب
  _topicLangs(topic) {
    if (!topic) return ['ar'];
    if (this._arGroupOf(topic)) return ['ar'];
    const out = [];
    ['es', 'en'].forEach(l => { if (LibraryData.ihGroupBooks(l, topic).length) out.push(l); });
    return out.length ? out : ['ar'];
  },
  _topicLangBar() {
    const ls = this._topicLangs(this._topic);
    if (ls.length < 2) return '';
    return `<div class="lib-langbar">${LibraryData.LANGS.filter(x => ls.indexOf(x.id) !== -1).map(x =>
      `<button class="lib-lang ${x.id === this._lang ? 'on' : ''}" onclick="LibraryPage._setTopicLang('${x.id}')">${esc(this.L(x.key))}</button>`
    ).join('')}</div>`;
  },
  _setTopicLang(l) {
    if (!l || l === this._lang) return;
    if (this._topicLangs(this._topic).indexOf(l) === -1) return;
    this._lang = l;
    if (typeof Storage !== 'undefined') Storage.set('library_lang', l);
    this._q = ''; this._results = null; this._split = 'adults';
    this._openTopic(this._topic, '');
  },

  // v1.0.83 — الجامع: كل الأبواب + تصنيف اللغة العام (من زر «استكشاف وأضف»)
  _openJami() {
    this._view = 'jami'; this._topic = null; this._q = ''; this._results = null;
    this._jcat = null; this._jlimit = 240; this._loading = false;
    const el = this._el(); if (!el) return;
    el.innerHTML = `
      <div class="lib-page lib-jami">
        ${this._header(this.L('libBrowseTitle'), this.L('libJamiDesc'), 'LibraryPage._home()')}
        ${this._langBar()}
        <div class="lib-cats" id="lib-cats">${this._jamiChips()}</div>
        <div id="lib-books">${this._jamiHtml()}</div>
        <div class="lib-jami-more" id="lib-jami-more"><button class="lib-btn ghost" onclick="LibraryPage._moreJami()"><i class="fas fa-plus"></i> ${esc(this.L('libMore'))}</button></div>
        ${this._attribution()}
      </div>`;
  },
  _jamiGrid() { return this._jamiHtml(); },
  _openTopic(topicId, q) {
    this._view = 'topic';
    if (topicId !== undefined && topicId !== null && topicId !== '') { this._topic = topicId; this._q = ''; }
    else if (topicId === null || topicId === '') { this._topic = null; if (q === '' || q === undefined) this._q = ''; }
    if (q !== undefined && q !== null) this._q = String(q);
    if (this._topic && !this._topicDef(this._topic) && LibraryData.TOPIC_DEFS[this._topic]) this._lang = 'ar';
    if (this._topic && !this._topicDef(this._topic) && LibraryData.ESEN_TOPICS.indexOf(this._topic) !== -1 && this._lang === 'ar') this._lang = 'es';
    if (this._topic && !this._topicDef(this._topic)) this._topic = null;
    const _tl = this._topicLangs(this._topic);
    if (_tl.length && _tl.indexOf(this._lang) === -1) this._lang = _tl[0];
    const t = this._topic ? this._topicDef(this._topic) : null;
    this._results = null; this._loading = false;
    this._split = (t && (t.topic === 'kids' || t.topic === 'family') && this._topicKids().length) ? 'kids' : 'adults';
    this._paintTopic();
  },

  _setSplit(s) { if (s === this._split) return; this._split = s; this._paintTopicList(); },

  _splitBar() {
    return `<div class="lib-split">
      <button class="lib-split-btn ${this._split === 'adults' ? 'on' : ''}" onclick="LibraryPage._setSplit('adults')"><i class="fas fa-user"></i> ${esc(this.L('libKidsAdults'))}</button>
      <button class="lib-split-btn kids ${this._split === 'kids' ? 'on' : ''}" onclick="LibraryPage._setSplit('kids')"><i class="fas fa-child-reaching"></i> ${esc(this.L('libForKids'))}</button>
    </div>`;
  },

  _paintTopic() {
    const el = this._el(); if (!el) return;
    const t = this._topic ? this._topicDef(this._topic) : null;
    const title = t ? (t.key ? this.L(t.key) : t.label) : this.L('libBrowseTitle');
    const sub = t ? this.L('libTopicSub') : this.L('libBrowseSubtitle');
    el.innerHTML = `
      <div class="lib-page">
        ${this._header(title, sub, 'LibraryPage._home()')}
        ${this._topicLangBar()}
        ${this._topicKids().length ? this._splitBar() : ''}
        <div id="lib-books">${this._topicListHtml()}</div>
        ${this._attribution()}
      </div>`;
  },

  _paintTopicList() { const box = document.getElementById('lib-books'); if (box) box.innerHTML = this._topicListHtml(); },

  _topicListHtml() {
    if (this._loading) return `<div class="lib-empty-list">${esc(this.L('libLoading'))}</div>`;
    if (this._split === 'kids') return this._kidsBlock();
    if (this._lang !== 'ar') return this._ihBlock();
    const items = this._arGroupItems(this._arGroupOf(this._topic));
    if (!items.length) return `<div class="lib-empty-list">${esc(this.L('libNoCatBooks'))}</div>`;
    return this._gridHtml(items.map(b => ({ b: b, kind: b.pdf ? 'ih' : 't', g: b.group || '' })));
  },
  _ihBlock() {
    const t = this._topic ? this._topicDef(this._topic) : null;
    if (t) {
      const g = LibraryData.ESEN_MAP[t.topic] || t.group || '';
      const seen = {}, merged = [];
      LibraryData.ihTopicBooks(this._lang, t.topic).concat(LibraryData.ihGroupBooks(this._lang, g)).forEach(b => {
        const id = Number(b.id); if (!id || seen[id]) return; seen[id] = 1; merged.push(b);
      });
      if (!merged.length) return `<div class="lib-empty-list">${esc(this.L('libNoCatBooks'))}</div>`;
      return `<div class="lib-books">${merged.map(b => this._externalCard(b, b.group || g)).join('')}</div>`;
    }
    let html = '';
    LibraryData.ESEN_TOPICS.forEach(gid => {
      const books = LibraryData.ihGroupBooks(this._lang, gid);
      if (!books.length) return;
      html += `<div class="lib-sub-head"><span class="lib-sub-t"><i class="fas ${LibraryData.ihGroupIcon(gid)}" style="color:${LibraryData.ihGroupColor(gid)}"></i> ${esc(LibraryData.ihLabel(gid))}</span><span class="lib-sub-d">${esc(this.L('libBooksCount', { n: books.length }))}</span></div><div class="lib-books">${books.map(b => this._externalCard(b, gid)).join('')}</div>`;
    });
    return html || `<div class="lib-empty-list">${esc(this.L('libNoCatBooks'))}</div>`;
  },
  _kidsBlock() {
    const books = this._topicKids() || [];
    const note = this.L('libKidsNote');
    if (!books.length) {
      return `<div class="lib-note-inline"><i class="fas fa-child-reaching"></i><div>${esc(note)}</div></div>
        <div class="lib-empty-list">${esc(this.L('libNoKidsTopic'))}</div>
        <button class="lib-btn ghost" onclick="LibraryPage._openKids()"><i class="fas fa-child-reaching"></i> ${esc(this.L('libCardKids'))}</button>`;
    }
    const cards = books.map(b => (this._lang === 'ar' ? this._bookCard(b) : this._externalCard(b, 'kids'))).join('');
    return `<div class="lib-note-inline"><i class="fas fa-child-reaching"></i><div>${esc(note)}</div></div>
      <div class="lib-books">${cards}</div>
      ${this._lang === 'ar' ? `<div class="lib-fallback-note">${esc(this.L('libKidsBookletSoon'))}</div>` : ''}`;
  },
  _fallbackBlock() {
    const t = this._topic ? this._topicDef(this._topic) : null;
    const def = t ? LibraryData.TOPIC_DEFS[t.topic] : null;
    let list = (def && t) ? (LibraryData.CURATED[t.topic] || []).map(b => ({ id: b.id, name: b.name, author: b.author || '', catId: def.cat, volumes: b.volumes || 0 })) : [];
    if (!list.length) list = LibraryData.FEATURED.slice(0, 12);
    return `<div class="lib-fallback-note">${esc(this.L('libCatMore'))}</div>
      <div class="lib-books">${list.map(b => this._bookCard(b)).join('')}</div>`;
  },

  async _loadTopic() {
    const token = ++this._token;
    const t = this._topic ? this._topicDef(this._topic) : null;
    const def = t ? LibraryData.TOPIC_DEFS[t.topic] : null;
    if (this._lang !== 'ar') { this._loading = false; this._paintTopicList(); return; }
    this._loading = true;
    this._paintTopicList();
    let list = [];
    const push = (b, cat) => {
      const id = Number(b && b.id); if (!id) return;
      if (list.some(x => Number(x.id) === id)) return;
      list.push({ id: id, name: b.name || '', author: b.author || '', catId: cat != null ? cat : (b.catId != null ? b.catId : null), volumes: b.volumes || 0 });
    };
    const curated = (def && t) ? (LibraryData.CURATED[t.topic] || []) : [];
    try {
      if (def) {
        curated.forEach(b => push(b, def.cat));
        for (const term of (def.q || [])) {
          try {
            const r = await LibraryService.search(term, def.cat);
            (r.books || []).forEach(b => { if (Number(b.catId) === def.cat) push(b, def.cat); });
          } catch (e) { /* تجاهل */ }
          if (token !== this._token) return;
          if (list.length >= 45) break;
        }
      } else {
        const r = await LibraryService.search('كتاب', null);
        (r.books || []).forEach(b => push(b, b.catId));
      }
    } catch (e) { /* تجاهل */ }
    if (!list.length) {
      if (def) curated.forEach(b => push(b, def.cat));
      else LibraryData.FEATURED.slice(0, 14).forEach(b => push(b, null));
    }
    if (token !== this._token) return;
    this._results = list.slice(0, 60);
    this._loading = false;
    this._paintTopicList();
  },

  // ============================================================
  // ================ الرفّ: رؤية الكل + تحديث الرف ==============
  // ============================================================
  _openShelfAll() {
    this._view = 'shelf';
    const el = this._el(); if (!el) return;
    const list = LibraryService.shelf();
    const body = list.length
      ? `<div class="lib-shelf-items">${list.map(b => this._shelfRow(b)).join('')}</div>`
      : `<div class="lib-empty"><i class="fas fa-book-open-reader"></i>
           <div class="lib-empty-title">${esc(this.L('libEmptyTitle'))}</div>
           <div class="lib-empty-desc">${esc(this.L('libEmptyDesc'))}</div></div>`;
    el.innerHTML = `
      <div class="lib-page lib-shelf-all">
        ${this._header(this.L('libShelfAllTitle'), this.L('libShelfAllSub') + ' · ' + this.L('libBooksCount', { n: list.length }), 'LibraryPage._home()')}
        ${body}
        <button class="lib-refresh" onclick="LibraryPage._refreshShelf(this)"><i class="fas fa-rotate"></i> ${esc(this.L('libRefreshShelf'))}</button>
        <div class="lib-refresh-note">${esc(this.L('libRefreshShelfNote'))}</div>
        ${this._attribution()}
      </div>`;
  },

  _shelfBook(b) {
    const k = b.kind || 't';
    const open = k === 'ih'
      ? (b.pdf ? `LibraryPage._openPdfById(${b.id},'shelf')` : `window.open('${LibrarySources.itemUrl(b.lang || this._lang, b.id)}','_blank')`)
      : `LibraryPage._openBook(${b.id})`;
    return `<div class="lib-shelf-book" onclick="${open}">
      ${this._cover(b, '', k)}
      <div class="lib-shelf-title">${esc(b.name || this.L('libBook'))}</div>
      <div class="lib-shelf-author">${esc(b.author || '')}</div></div>`;
  },

  _shelfRow(b) {
    const k = b.kind || 't';
    const name = b.name || this.L('libBook');
    const url = LibrarySources.itemUrl(b.lang || this._lang, b.id);
    const openFn = k === 'ih' ? (b.pdf ? `LibraryPage._openPdfById(${b.id},'shelf')` : `window.open('${url}','_blank')`) : `LibraryPage._openBook(${b.id})`;
    const dl = k === 'ih'
      ? (b.pdf
          ? `<button class="lib-mini dl" title="${escapeAttr(this.L('libDownloadPdf'))}" onclick="LibraryPage._dlPdfById(${b.id},this)"><i class="fas fa-download"></i></button>`
          : `<button class="lib-mini ext" title="${escapeAttr(this.L('libOpenWeb'))}" onclick="window.open('${url}','_blank')"><i class="fas fa-up-right-from-square"></i></button>`)
      : `<button class="lib-mini dl" title="${escapeAttr(this.L('libDownload'))}" onclick="LibraryPage._quickDownload(${b.id}, this)"><i class="fas fa-download"></i></button>`;
    return `<div class="lib-shelf-item">
      ${this._cover(b, '', k)}
      <div class="lib-bc-info" onclick="${openFn}">
        <div class="lib-bc-title">${esc(name)}</div>
        ${b.author ? `<div class="lib-bc-meta">${esc(b.author)}</div>` : ''}
        <div class="lib-bc-src"><i class="fas fa-check"></i> ${esc(this.L('libDownloaded'))}${k === 'ih' ? ' · ' + esc(this.L('libSourceIslamhouse')) : ''}</div>
      </div>
      <div class="lib-actions-col">
        <button class="lib-mini ext" title="${escapeAttr(this.L('libOpenBook'))}" onclick="${openFn}"><i class="fas fa-book-open"></i></button>
        ${dl}
        <button class="lib-mini fav" title="${escapeAttr(this.L('libRemove'))}" onclick="LibraryPage._removeShelf(${b.id},'${k}',event)"><i class="fas fa-trash"></i></button>
      </div></div>`;
  },

  _removeShelf(id, kind, ev) {
    if (ev) ev.stopPropagation();
    if (!window.confirm(this.L('libRemoveConfirm'))) return;
    const done = () => { if (typeof showToast === 'function') showToast('🗑️ ' + this.L('libRemoved')); this._openShelfAll(); };
    if (kind === 'ih') {
      Promise.resolve(LibraryService.removePdf(LibraryService.pdfKey(this._lang, id)))
        .then(() => LibraryService.remove(id)).then(done).catch(done);
    } else LibraryService.remove(id).then(done).catch(done);
  },

  // تحديث الرف: يعيد قراءة الرفّ، ويتحقّق من الكتب المحفوظة في الجهاز ويعيد ما لم يظهر.
  async _refreshShelf(btn) {
    if (btn) btn.classList.add('spin');
    let added = 0;
    try {
      const list = LibraryService.shelf();
      const have = {};
      list.forEach(b => { have[(b.kind || 't') + ':' + b.id] = 1; });
      const keys = await CacheDB.keys();
      for (const k of keys) {
        const ks = String(k);
        if (ks.indexOf('lib_info_') === 0) {
          const id = Number(ks.slice(9));
          if (!id || have['t:' + id]) continue;
          let info = null;
          try { info = await CacheDB.get(ks); } catch (e) { info = null; }
          if (info && info.id) {
            list.push({ id: id, name: info.name || '', author: info.author || '', catId: info.catId || null, volumes: info.volumes || 0, maxPage: info.maxPage || null, addedAt: Date.now(), downloaded: true, kind: 't' });
            have['t:' + id] = 1; added++;
          }
        } else if (ks.indexOf('lib_pdf_') === 0) {
          const parts = ks.slice('lib_pdf_'.length).split('_');
          if (parts[0] !== 'ih') continue;
          const lang = parts[1], id = Number(parts[2]);
          if (!id || have['ih:' + id]) continue;
          let name = '', author = '';
          try {
            const bk = LibraryData.ihGroups(lang).reduce((a, g) => a.concat(g.books), []).find(x => Number(x.id) === id);
            if (bk) { name = bk.name || ''; author = bk.author || ''; }
          } catch (e) { /* تجاهل */ }
          list.push({ id: id, name: name, author: author, catId: null, addedAt: Date.now(), downloaded: true, kind: 'ih', lang: lang });
          have['ih:' + id] = 1; added++;
        }
      }
      if (added) LibraryService._saveShelf(list);
    } catch (e) { /* تجاهل */ }
    if (btn) btn.classList.remove('spin');
    if (typeof showToast === 'function') {
      showToast(added ? ('🔄 ' + this.L('libShelfRepaired', { n: added })) : ('✅ ' + this.L('libShelfRefreshed')));
    }
    if (this._view === 'shelf') this._openShelfAll(); else this._home();
  },

  // ============================================================
  // ================ مسلمون جدد ================================
  // ============================================================
  _openNewMuslims() {
    this._view = 'newmuslims';
    const el = this._el(); if (!el) return;
    let inner;
    if (this._lang === 'ar') {
      inner = `<div class="lib-note-inline"><i class="fas fa-seedling"></i><div>${esc(this.L('libNewMuslimsIntro'))}</div></div>` +
        LibraryData.NEW_MUSLIM_GROUPS.map(g => {
          const list = LibraryData.NEW_MUSLIMS.filter(b => b.cat === g.cat);
          if (!list.length) return '';
          return `<div class="lib-sub-head"><span class="lib-sub-t">${esc(this.L(g.key))}</span><span class="lib-sub-d">${esc(this.L('libBooksCount', { n: list.length }))}</span></div><div class="lib-books">${list.map(b => this._bookCard(b)).join('')}</div>`;
        }).join('');
    } else {
      const groups = LibraryData.ESEN_TOPICS.filter(g => g === 'nm');
      inner = `<div class="lib-note-inline"><i class="fas fa-seedling"></i><div>${esc(this.L('libNewMuslimsIntro'))}</div></div>` +
        groups.map(g => {
          const list = LibraryData.ihGroupBooks(this._lang, g);
          if (!list.length) return '';
          return `<div class="lib-sub-head"><span class="lib-sub-t"><i class="fas ${LibraryData.ihGroupIcon(g)}" style="color:${LibraryData.ihGroupColor(g)}"></i> ${esc(LibraryData.ihLabel(g))}</span><span class="lib-sub-d">${esc(this.L('libBooksCount', { n: list.length }))}</span></div><div class="lib-books">${list.map(b => this._externalCard(b, g)).join('')}</div>`;
        }).join('');
      if (!groups.some(g => LibraryData.ihGroupBooks(this._lang, g).length)) inner += `<div class="lib-empty-list">${esc(this.L('libNoCatBooks'))}</div>`;
    }
    el.innerHTML = `<div class="lib-page">
      ${this._header(this.L('libCardNewMuslims'), this.L('libNewMuslimsSubtitle'), 'LibraryPage._home()')}
      ${this._sectionLangBar('newmuslims')}${inner}
      ${this._attribution()}</div>`;
  },
  _openKids() {
    this._view = 'kids';
    const el = this._el(); if (!el) return;
    const tab = this._kidsTab || 'kids';
    let inner;
    if (this._lang === 'ar') {
      if (tab === 'parents') {
        inner = `<div class="lib-note-inline"><i class="fas fa-people-roof"></i><div>${esc(this.L('libParentsNote'))}</div></div>
          <div class="lib-books">${LibraryData.KIDS_PARENTS_AR.map(b => this._bookCard(b)).join('')}</div>`;
      } else {
        inner = `<div class="lib-note-inline"><i class="fas fa-child-reaching"></i><div>${esc(this.L('libKidsNote'))}</div></div>
          <div class="lib-books">${LibraryData.KIDS_CHILDREN_AR.map(b => this._bookCard(b)).join('')}</div>
          <div class="lib-fallback-note">${esc(this.L('libKidsBookletSoon'))}</div>`;
      }
    } else {
      const g = tab === 'parents' ? 'family' : 'kids';
      const list = LibraryData.ihGroupBooks(this._lang, g);
      inner = `<div class="lib-note-inline"><i class="fas ${tab === 'parents' ? 'fa-people-roof' : 'fa-child-reaching'}"></i><div>${esc(tab === 'parents' ? this.L('libParentsNote') : this.L('libKidsNote'))}</div></div>
        ${list.length ? `<div class="lib-books">${list.map(b => this._externalCard(b, g)).join('')}</div>` : `<div class="lib-empty-list">${esc(this.L('libNoCatBooks'))}</div>`}`;
    }
    el.innerHTML = `<div class="lib-page">
      ${this._header(this.L('libCardKids'), this.L('libKidsSubtitle'), 'LibraryPage._home()')}
      ${this._sectionLangBar('kids')}
      <div class="lib-split">
        <button class="lib-split-btn kids ${tab === 'kids' ? 'on' : ''}" onclick="LibraryPage._setKidsTab('kids')"><i class="fas fa-child-reaching"></i> ${esc(this.L('libForKids'))}</button>
        <button class="lib-split-btn parents ${tab === 'parents' ? 'on' : ''}" onclick="LibraryPage._setKidsTab('parents')"><i class="fas fa-people-roof"></i> ${esc(this.L('libForParents'))}</button>
      </div>
      ${inner}
      ${this._attribution()}</div>`;
  },
  _setKidsTab(t) { if (t === this._kidsTab) return; this._kidsTab = t; this._openKids(); },

  // ============================================================
  // ============ المفضّلة ======================================
  // ============================================================
  _favKeyFor(kind, id) { return kind === 'ih' ? ('ih_' + this._lang + '_' + id) : ('t_' + id); },
  _favMeta(kind, id) {
    const bid = Number(id);
    if (kind === 'ih') {
      for (const g of LibraryData.ihGroups(this._lang)) {
        const b = g.books.find(x => Number(x.id) === bid);
        if (b) return { kind: 'ih', lang: this._lang, id: bid, name: b.name, author: b.author || '', pdf: b.pdf || '', group: g.id };
      }
      return { kind: 'ih', lang: this._lang, id: bid };
    }
    const f = LibraryData.featuredById(bid);
    if (f) return { kind: 't', id: bid, name: f.name, author: f.author || '', cat: f.cat || '' };
    const s = LibraryService.shelf().find(b => Number(b.id) === bid);
    return { kind: 't', id: bid, name: (s && s.name) || '', author: (s && s.author) || '', cat: '' };
  },
  _toggleFav(ev, key, kind, id) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    let meta = this._favMeta(kind, id);
    if (ev && ev.target && (!meta.name)) {
      const btn = ev.target.closest('button');
      if (btn && btn.dataset && btn.dataset.nm) {
        meta = Object.assign({ kind: kind, id: Number(id), name: btn.dataset.nm, author: btn.dataset.au || '' }, kind === 'ih' ? { lang: this._lang } : {});
      }
    }
    const on = LibraryService.toggleFav(key, meta);
    document.querySelectorAll('[data-fk="' + key + '"]').forEach(b => {
      b.classList.toggle('on', on);
      const i = b.querySelector('i'); if (i) i.className = 'fa' + (on ? 's' : 'r') + ' fa-heart';
      b.setAttribute('title', this.L(on ? 'libFavRemove' : 'libFavAdd'));
    });
    const c = document.querySelector('.lib-fav-n'); if (c) c.textContent = String(LibraryService.favCount());
    if (typeof showToast === 'function') showToast((on ? '\u2764\ufe0f ' : '\U0001f90d ') + this.L(on ? 'libFavAdded' : 'libFavRemoved'));
  },
  _unfav(ev, key) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    LibraryService.toggleFav(key);
    if (typeof showToast === 'function') showToast('\U0001f90d ' + this.L('libFavRemoved'));
    this._openFavs();
  },
  _favEntry() {
    const n = LibraryService.favCount();
    return `<button class="lib-fav-entry" onclick="LibraryPage._openFavs()">
      <span class="lib-fav-heart"><i class="fas fa-heart"></i></span>
      <span class="lib-fav-t">${esc(this.L('libFav'))}</span>
      <span class="lib-fav-n">${n}</span>
      <i class="fas fa-chevron-${this._chev()}"></i>
    </button>`;
  },
  _openFavs() {
    this._view = 'favs';
    const el = this._el(); if (!el) return;
    const list = LibraryService.favs();
    const body = list.length
      ? `<div class="lib-books">${list.map(f => this._favCard(f)).join('')}</div>`
      : `<div class="lib-empty"><i class="fas fa-heart"></i><div class="lib-empty-title">${esc(this.L('libFavEmpty'))}</div><div class="lib-empty-desc">${esc(this.L('libFavEmptyDesc'))}</div></div>`;
    el.innerHTML = `<div class="lib-page">
      ${this._header(this.L('libFav'), this.L('libBooksCount', { n: list.length }), 'LibraryPage._home()')}
      ${body}
      ${this._attribution()}</div>`;
  },
  _favCard(f) {
    if (f.kind === 't' && f.id) {
      const local = LibraryData.featuredById(f.id);
      if (local) return this._bookCard(local);
      return this._bookCard({ id: f.id, name: f.name || '', author: f.author || '' });
    }
    const lg = f.lang || this._lang;
    const ihb = LibraryData.ihGroups(lg).reduce((a, g) => a.concat(g.books), []).find(x => Number(x.id) === Number(f.id));
    if (ihb) return this._externalCard(ihb, f.group || 'nm');
    const has = !!f.pdf;
    return `<div class="lib-book-card">
      ${this._cover({ name: f.name, author: f.author }, '', 'ih')}
      <div class="lib-bc-info" onclick="${has ? 'LibraryPage._openPdfById(' + f.id + ')' : "window.open('" + LibrarySources.itemUrl(lg, f.id) + "','_blank')"}">
        <div class="lib-bc-title">${esc(f.name || '')}</div>
        ${f.author ? `<div class="lib-bc-meta">${esc(f.author)}</div>` : ''}
        <div class="lib-bc-src"><i class="fas fa-heart"></i> ${esc(f.group ? LibraryData.ihLabel(f.group) : this.L('libFav'))}</div>
      </div>
      <div class="lib-actions-col">
        <button class="lib-mini fav on" data-fk="${f.key}" title="${escapeAttr(this.L('libFavRemove'))}" onclick="LibraryPage._unfav(event,'${f.key}')"><i class="fas fa-heart"></i></button>
      </div></div>`;
  },

  // ============================================================
  // ============ قارئ PDF داخل التطبيق + التنزيل على الهاتف ====
  // ============================================================
  _findIhAny(id) {
    const n = Number(id); if (!n) return null;
    const order = [this._lang || 'ar', 'ar', 'es', 'en'];
    const seen = {};
    for (const lg of order) {
      if (seen[lg]) continue; seen[lg] = 1;
      for (const g of (LibraryData.ihGroups(lg) || [])) {
        const hit = (g.books || []).find(x => Number(x.id) === n);
        if (hit) return hit;
      }
    }
    return null;
  },
  _findIh(id) { const _ihAny = this._findIhAny(id); if (_ihAny) return _ihAny;
    const bid = Number(id);
    for (const g of LibraryData.ihGroups(this._lang)) { const b = g.books.find(x => Number(x.id) === bid); if (b) return b; }
    for (const l of ['ar', 'es', 'en']) {
      const g2 = LibraryData.ihGroups(l).reduce((a, g) => a.concat(g.books), []).find(x => Number(x.id) === bid);
      if (g2) return g2;
    }
    const f = LibraryService.favs().find(x => Number(x.id) === bid && x.kind === 'ih');
    if (f) return { id: f.id, name: f.name, author: f.author, pdf: f.pdf };
    const s = LibraryService.shelf().find(x => Number(x.id) === bid && (x.kind || 't') === 'ih');
    if (s) {
      const lg = s.lang || this._lang;
      const bk = LibraryData.ihGroups(lg).reduce((a, g) => a.concat(g.books), []).find(x => Number(x.id) === bid);
      return { id: bid, name: (bk && bk.name) || s.name || '', author: (bk && bk.author) || s.author || '', pdf: (bk && bk.pdf) || s.pdf || '', lang: lg };
    }
    return null;
  },
  // v1.0.86 — يُفتح الكتاب دائمًا داخل التطبيق: يُجلب الملف ويُخزَّن محليًا ثم يُعرض من نسخة
  // محلية (blob:) فلا يُحجب داخل iframe، ويُقرأ بعدها بلا إنترنت كأي كتاب منزَّل.
  async _openPdf(b, from) {
    if (!b || !b.pdf) { if (typeof showToast === 'function') showToast('\u26a0\ufe0f ' + this.L('libPdfFail')); return; }
    if (from && ['shelf', 'favs', 'jami', 'topic', 'kids', 'newmuslims', 'hadith', 'home'].indexOf(from) !== -1) this._from = from;
    else this._setOrigin();
    this._view = 'pdf';
    const el = this._el(); if (!el) return;
    const lang = b.lang || this._lang;
    const key = LibraryService.pdfKey(lang, b.id);
    const name = b.name || '';
    let blobUrl = await LibraryService.pdfObjectUrl(key);
    el.innerHTML = `<div class="lib-page lib-pdf-page">
      ${this._header(name, blobUrl ? this.L('libPdfOffline') : this.L('libPdfViewer'), 'LibraryPage._backFromPdf()')}
      <div class="lib-pdf-bar">
        <button class="lib-mini dl" title="${escapeAttr(this.L('libPdfSave'))}" onclick="LibraryPage._dlPdfById(${b.id},this,${JSON.stringify(lang)})"><i class="fas fa-download"></i></button>
        <span class="lib-pdf-note" id="lib-pdf-note">${esc(blobUrl ? this.L('libPdfOffline') : this.L('libPdfDownloading'))}</span>
        <button class="lib-mini ext" title="${escapeAttr(this.L('libOpenWeb'))}" onclick="window.open('${escapeAttr(b.pdf)}','_blank')"><i class="fas fa-up-right-from-square"></i></button>
      </div>
      <div id="lib-pdf-slot"></div></div>`;
    const slot = document.getElementById('lib-pdf-slot');
    if (!slot) return;
    const frame = (src) => `<iframe class="lib-pdf-frame" src="${escapeAttr(src)}" title="${escapeAttr(name)}"></iframe>`;
    if (blobUrl) { slot.innerHTML = frame(blobUrl); return; }
    slot.innerHTML = `<div class="lib-pdf-loading"><i class="fas fa-spinner fa-spin"></i><span>${esc(this.L('libPdfDownloading'))}</span></div>`;
    try {
      await LibraryService.cachePdf(b.pdf, key, null);
      blobUrl = await LibraryService.pdfObjectUrl(key);
      const note = document.getElementById('lib-pdf-note');
      if (note && blobUrl) note.textContent = this.L('libPdfOffline');
      const s2 = document.getElementById('lib-pdf-slot');
      if (s2) s2.innerHTML = frame(blobUrl || b.pdf);
    } catch (e) {
      const s2 = document.getElementById('lib-pdf-slot');
      if (s2) s2.innerHTML = frame(b.pdf); // احتياط: عرض مباشر من الرابط
    }
  },
  _openPdfById(id, from) { const b = this._findIh(id); if (b) this._openPdf(b, from); },
  // v1.0.86 — الرجوع يعود إلى الصفحة التي جاء منها القارئ (الجامع/الباب/الرفّ…) لا إلى صفحة عامة.
  _setOrigin() { const v = this._view; if (v && v !== 'pdf' && v !== 'reader') this._from = v; },
  _reopen(from) {
    switch (from) {
      case 'jami': this._openJami(); return;
      case 'shelf': this._openShelfAll(); return;
      case 'favs': this._openFavs(); return;
      case 'kids': this._openKids(); return;
      case 'newmuslims': this._openNewMuslims(); return;
      case 'hadith': this._openHadith(); return;
      case 'home': this._home(); return;
      default: this._openTopic(this._topic === undefined ? null : this._topic);
    }
  },
  _backFromPdf() { this._reopen(this._from || 'topic'); },
  _dlPdfById(id, btn, lang) { const b = this._findIh(id) || {}; if (lang) b.lang = lang; this._dlPdf(b, btn); },
  async _dlPdf(b, btn) {
    if (!b || !b.pdf) { if (typeof showToast === 'function') showToast('⚠️ ' + this.L('libPdfFail')); return; }
    const lang = b.lang || this._lang; const nid = Number(b.id); const key = this._dlKey('ih', nid);
    const st = this._dlState[key];
    if (st && st.state === 'run') return;
    const safe = String(b.name || 'book').replace(/[^A-Za-z0-9\u0600-\u06FF\u00C0-\u024F ]+/g, '_').slice(0, 60) + '.pdf';
    this._setDl(key, 0, 'run');
    if (btn) { const i = btn.querySelector('i'); if (i) i.className = 'fas fa-sync'; }
    try {
      await LibraryService.downloadPdf(b.pdf, LibraryService.pdfKey(lang, nid), safe, (got, total) => { this._setDl(key, total ? got / total * 100 : 50, 'run'); });
      this._setDl(key, 100, 'done');
      this._markShelfUi('ih', nid);
      if (typeof showToast === 'function') showToast('✅ ' + this.L('libPdfDone'));
    } catch (e) {
      this._setDl(key, 0, 'err');
      if (typeof showToast === 'function') showToast('⚠️ ' + this.L('libPdfFail'));
    }
    if (btn) { const i = btn.querySelector('i'); if (i) i.className = 'fas fa-download'; }
  },
  _cover(b, cls, kind) {
    b = b || {};
    const cat = (b.catId != null ? LibraryData.cat(Number(b.catId)) : null) || (b.cat ? LibraryData.catById(b.cat) : null);
    const pal = LibraryData.coverPalette(cat ? cat.id : null, b.name || '');
    const author = String(b.author || '').trim();
    const vol = Number(b.volumes) > 1 ? String(b.volumes) : '';
    const lg = this._lang || (typeof currentLocale !== 'undefined' ? currentLocale : 'ar');
    const imp = kind === 'ih' ? 'IslamHouse' : (lg === 'ar' ? 'المكتبة الشاملة' : (lg === 'es' ? 'Biblioteca Shamela' : 'Shamela Library'));
    return `<span class="lib-cover ${cls || ''}" style="--cov-a:${pal[0]};--cov-b:${pal[1]}">
        <span class="lib-cov-top"><span></span><i class="fas fa-bookmark"></i><span></span></span>
        <span class="lib-cov-mid">
          <span class="lib-cover-title">${esc(b.name || '')}</span>
          <span class="lib-cov-rule"><i></i>✦<i></i></span>
          ${author ? `<span class="lib-cover-author">${esc(author)}</span>` : ''}
        </span>
        <span class="lib-cov-bot">${vol ? `<span class="lib-cov-vol">${esc(vol)}</span>` : ''}<span class="lib-cov-imp">${esc(imp)}</span></span>
      </span>`;
  },

  // ============================================================
  // ============ بطاقات الكتب =================================
  // ============================================================
  // كتب المكتبة الشاملة (turath): مفضّلة + إضافة إلى الرفّ + تنزيل/قراءة
  _bookCard(b) {
    const bid = Number(b.id);
    const onShelf = LibraryService.isOnShelfKind(bid, 't');
    const key = this._favKeyFor('t', bid);
    const on = LibraryService.isFav(key);
    const nm = escapeAttr(b.name || ''), au = escapeAttr(b.author || '');
    const prog = LibraryService.progress(bid);
    const dlk = this._dlKey('t', bid);
    return `<div class="lib-book-card">
      ${this._cover(b)}
      <div class="lib-bc-info" onclick="LibraryPage._openBook(${bid})">
        <div class="lib-bc-title">${esc(b.name || '')}</div>
        <div class="lib-bc-meta">${esc(b.author || '')}</div>
        <div class="lib-bc-src"><i class="fas fa-certificate"></i> ${esc(this.L('libSource'))}</div>
        <div class="lib-card-slot" data-dlb="${dlk}">${this._dlBar(dlk)}</div>
      </div>
      <div class="lib-actions-col">
        <button class="lib-mini fav ${on ? 'on' : ''}" data-fk="${key}" data-nm="${nm}" data-au="${au}" title="${escapeAttr(this.L(on ? 'libFavRemove' : 'libFavAdd'))}" onclick="LibraryPage._toggleFav(event,'${key}','t',${bid})"><i class="fa${on ? 's' : 'r'} fa-heart"></i></button>
        <button class="lib-mini add ${onShelf ? 'on' : ''}" data-ak="t_${bid}" title="${escapeAttr(this.L(onShelf ? 'libOnShelfShort' : 'libAddToShelf'))}" onclick="LibraryPage._addToShelf(event,'t',${bid})"><i class="fas ${onShelf ? 'fa-check' : 'fa-plus'}"></i></button>
        <button class="lib-mini read" title="${escapeAttr(this.L('libReadInside'))}" onclick="LibraryPage._openReader(${bid},${(prog && prog.page) || 1})"><i class="fas fa-book-open-reader"></i></button>
        <button class="lib-mini dl" title="${escapeAttr(this.L('libDownload'))}" onclick="LibraryPage._quickDownload(${bid},this)"><i class="fas fa-download"></i></button>
      </div></div>`;
  },
  _externalCard(b, gid) {
    const nid = Number(b.id);
    const key = this._favKeyFor('ih', nid);
    const on = LibraryService.isFav(key);
    const onShelf = LibraryService.isOnShelfKind(nid, 'ih');
    const nm = escapeAttr(b.name || ''), au = escapeAttr(b.author || '');
    const dlk = this._dlKey('ih', nid);
    const readFn = `LibraryPage._openPdfById(${nid})`;
    return `<div class="lib-book-card">
      ${this._cover(b, '', 'ih')}
      <div class="lib-bc-info" onclick="${readFn}">
        <div class="lib-bc-title">${esc(b.name || '')}</div>
        ${b.author ? `<div class="lib-bc-meta">${esc(b.author)}</div>` : ''}
        <div class="lib-bc-src"><i class="fas fa-certificate"></i> ${esc(this.L('libSourceIslamhouse'))}</div>
        <div class="lib-card-slot" data-dlb="${dlk}">${this._dlBar(dlk)}</div>
      </div>
      <div class="lib-actions-col">
        <button class="lib-mini fav ${on ? 'on' : ''}" data-fk="${key}" data-nm="${nm}" data-au="${au}" title="${escapeAttr(this.L(on ? 'libFavRemove' : 'libFavAdd'))}" onclick="LibraryPage._toggleFav(event,'${key}','ih',${nid})"><i class="fa${on ? 's' : 'r'} fa-heart"></i></button>
        <button class="lib-mini add ${onShelf ? 'on' : ''}" data-ak="ih_${nid}" title="${escapeAttr(this.L(onShelf ? 'libOnShelfShort' : 'libAddToShelf'))}" onclick="LibraryPage._addToShelf(event,'ih',${nid},'${escapeAttr(gid || '')}')"><i class="fas ${onShelf ? 'fa-check' : 'fa-plus'}"></i></button>
        <button class="lib-mini read" title="${escapeAttr(this.L('libReadInside'))}" onclick="${readFn}"><i class="fas fa-book-open-reader"></i></button>
        <button class="lib-mini dl" title="${escapeAttr(this.L('libPdfSave'))}" onclick="LibraryPage._dlPdfById(${nid},this)"><i class="fas fa-download"></i></button>
      </div></div>`;
  },
  _addToShelf(ev, kind, id, gid) {
    if (ev) { ev.stopPropagation(); ev.preventDefault(); }
    const bid = Number(id);
    if (LibraryService.isOnShelfKind(bid, kind)) { if (kind === 'ih') this._openPdfById(bid); else this._openReader(bid, 1); return; }
    try {
      if (kind === 'ih') {
        const meta = this._favMeta('ih', bid) || {};
        LibraryService.saveStub({ id: bid, name: meta.name || '', author: meta.author || '', catId: null, kind: 'ih', lang: this._lang, pdf: meta.pdf || '', group: gid || meta.group || '' });
      } else {
        const c = this._curatedById(bid) || {};
        const found = (this._results || []).find(x => Number(x.id) === bid) || {};
        const def = c.topic ? LibraryData.TOPIC_DEFS[c.topic] : null;
        LibraryService.saveStub({ id: bid, name: c.name || found.name || '', author: c.author || found.author || '', catId: (def && def.cat) || found.catId || null, kind: 't', volumes: c.volumes || 0 });
      }
    } catch (e) { /* تجاهل */ }
    this._markShelfUi(kind, bid);
    if (typeof showToast === 'function') showToast('✅ ' + this.L('libAddedShelf'));
  },
  _openHadith() {
    this._view = 'hadith';
    this._hcat = null; this._hlist = null;
    this._paintHadith();
    if (!this._hcats) {
      LibrarySources.hadithCategories(this._lang).then(c => { if (c && c.length) this._hcats = c; this._paintHadith(); this._loadHadith(); }).catch(() => { /* تجاهل */ });
    }
    this._loadHadith();
  },
  _paintHadith() {
    const el = this._el(); if (!el) return;
    const cats = (this._hcats && this._hcats.length) ? this._hcats : LibraryData.HADEETH_GROUPS.map(g => ({ id: g.id, title: this.L(g.key) }));
    const eff = this._hcat || (cats[0] && cats[0].id);
    const chips = cats.map(c => `<button class="lib-chip ${String(eff) === String(c.id) ? 'active' : ''}" onclick="LibraryPage._pickHadithCat('${c.id}')">${esc(c.title)}</button>`).join('');
    el.innerHTML = `<div class="lib-page">
      ${this._header(this.L('libHadithTitle'), this.L('libHadithDesc'), 'LibraryPage._home()')}
      <div class="lib-chips">${chips}</div>
      <div class="lib-books" id="lib-hadiths">${this._hadithHtml()}</div>
      ${this._attribution()}</div>`;
  },
  async _loadHadith() {
    const token = ++this._token;
    const cats = (this._hcats && this._hcats.length) ? this._hcats : LibraryData.HADEETH_GROUPS;
    const cat = this._hcat || (cats[0] && cats[0].id) || '1';
    this._hcat = cat;
    try {
      const list = await LibrarySources.hadithList(this._lang, cat, 1);
      if (token !== this._token) return;
      this._hlist = list;
    } catch (e) { if (token === this._token) this._hlist = []; }
    const box = document.getElementById('lib-hadiths'); if (box) box.innerHTML = this._hadithHtml();
  },
  _pickHadithCat(id) { this._hcat = id; this._hlist = null; this._paintHadith(); this._loadHadith(); },
  _openHadithItem(id) {
    const h = (this._hlist || []).find(x => String(x.id) === String(id)); if (!h) return;
    const url = LibrarySources.hadithUrl(this._lang, id);
    const overlay = document.createElement('div');
    overlay.className = 'lib-sheet-overlay';
    overlay.innerHTML = `<div class="lib-sheet">
      <div class="lib-sheet-title">${esc(h.title || '')}</div>
      ${h.body && h.body !== h.title ? `<div class="lib-hadith-body">${esc(h.body)}</div>` : ''}
      ${h.expl ? `<div class="lib-hadith-expl">${esc(h.expl)}</div>` : ''}
      <div class="lib-actions">
        <button class="lib-btn ghost" onclick="this.closest('.lib-sheet-overlay').remove()">${esc(this.L('libBack'))}</button>
        <button class="lib-btn primary" onclick="window.open('${url}','_blank')"><i class="fas fa-up-right-from-square"></i> ${esc(this.L('libOpenWeb'))}</button>
      </div></div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  },

  // ============================================================
  // ============ تفاصيل الكتاب وقارئه (كتب الشاملة)  ==========
  // ============================================================
  async _openBook(id) {
    this._setOrigin();
    this._view = 'detail';
    const bid = Number(id);
    this._book = { id: bid }; this._info = null;
    const el = this._el(); if (!el) return;
    const featured = LibraryData.featuredById(bid);
    const shelfItem = LibraryService.shelf().find(b => Number(b.id) === bid);
    const remote = (this._results || []).find(b => Number(b.id) === bid);
    const name = (featured && featured.name) || (shelfItem && shelfItem.name) || (remote && remote.name) || '';
    const author = (featured && featured.author) || (shelfItem && shelfItem.author) || (remote && remote.author) || '';
    el.innerHTML = `<div class="lib-page">
      ${this._header(name || this.L('libTitle'), author, 'LibraryPage._backFromDetail()')}
      <div class="lib-detail">
        <div class="lib-detail-cover">${this._cover({ name: name, author: author, catId: (shelfItem && shelfItem.catId) || null, cat: (featured && featured.cat) || '', volumes: (featured && featured.volumes) || 0 }, 'lg')}</div>
        <div class="lib-detail-title">${esc(name)}</div>
        <div class="lib-detail-author">${esc(author)}</div>
        <div id="lib-detail-body"><div class="lib-empty-list">${esc(this.L('libPreparing'))}</div></div>
      </div></div>`;
    try { const info = await LibraryService.bookInfo(bid); this._info = info; this._paintDetail(); }
    catch (e) {
      const body = document.getElementById('lib-detail-body');
      if (body) body.innerHTML = `<div class="lib-info-card"><i class="fas fa-triangle-exclamation"></i><div>${esc(this.L('libDownloadFail'))}</div></div>
        <div class="lib-actions"><button class="lib-btn primary" onclick="LibraryPage._openReader(${bid},1)">${esc(this.L('libOpenBook'))}</button></div>`;
    }
  },
  _paintDetail() {
    const info = this._info || {}; const id = Number(this._book.id);
    const onShelf = LibraryService.isOnShelfKind(id, 't');
    const prog = LibraryService.progress(id);
    const total = info.maxPage || (prog && prog.total) || null;
    const body = document.getElementById('lib-detail-body'); if (!body) return;
    const resume = (prog && prog.page) ? `<div class="lib-resume" onclick="LibraryPage._openReader(${id},${prog.page})">
      <i class="fas fa-book-open big"></i><div class="lib-resume-b">
      <div class="lib-resume-t">${esc(this.L('libContinue'))}</div>
      <div class="lib-resume-d">${esc(this.L('libContinueFrom', { a: Math.max(1, prog.page - 1), b: Math.min(total || prog.page, prog.page + 18), p: prog.page, t: total || '—' }))}</div></div>
      <i class="fas fa-chevron-${this._chev()}"></i></div>` : '';
    const actions = onShelf
      ? `<div class="lib-actions"><button class="lib-btn primary" onclick="LibraryPage._openReader(${id},${(prog && prog.page) || 1})"><i class="fas fa-book-open"></i> ${esc(this.L('libRead'))}</button>
         <button class="lib-btn danger" onclick="LibraryPage._confirmRemove(${id})"><i class="fas fa-trash"></i> ${esc(this.L('libRemove'))}</button></div>`
      : `<div class="lib-actions"><button class="lib-btn primary" id="lib-dlbtn" onclick="LibraryPage._downloadFromDetail(${id}, this)"><i class="fas fa-download"></i> ${esc(this.L('libDownload'))}</button>
         <button class="lib-btn ghost" onclick="LibraryPage._addToShelf(event,'t',${id})"><i class="fas fa-plus"></i> ${esc(this.L('libAddToShelf'))}</button>
         <button class="lib-btn ghost" onclick="LibraryPage._openReader(${id},1)"><i class="fas fa-book-open"></i> ${esc(this.L('libRead'))}</button></div>`;
    const meta = [];
    if (info.author) meta.push(esc(info.author));
    if (info.volumes) meta.push(String(info.volumes) + ' ' + esc(this._lang === 'ar' ? 'أجزاء' : (this._lang === 'en' ? 'vols' : 'tomos')));
    if (total) meta.push(String(total) + ' ' + esc(this.L('libPage')));
    const heads = (info.headings || []).slice(0, 120);
    const indexHtml = heads.length ? `<div class="lib-index">
      <div class="lib-index-title">${esc(this.L('libIndex'))} <span style="font-size:11px;color:var(--text-secondary);font-weight:600;">· ${(info.headings || []).length} ${esc(this.L('libChapters'))}</span></div>
      ${heads.map(h => `<div class="lib-index-item" onclick="LibraryPage._openReader(${id},${h.page || 1})">
        <span class="lib-index-num">${h.page || ''}</span><span class="lib-index-txt">${esc(h.title || '')}</span>
        <i class="fas fa-chevron-${this._chev()} lib-index-go"></i></div>`).join('')}</div>` : '';
    body.innerHTML = `
      <div style="text-align:center;font-size:12px;color:var(--text-secondary);margin:6px 0 2px;">${meta.join(' • ')}</div>
      ${resume}${actions}
      ${info.info && info.info.length ? `<div class="lib-info-card" style="margin-inline:0;"><i class="fas fa-quote-left"></i><div>${info.info.slice(0, 6).map(esc).join('<br>')}</div></div>` : ''}
      ${indexHtml}`;
  },
  _confirmRemove(id) {
    if (!window.confirm(this.L('libRemoveConfirm'))) return;
    LibraryService.remove(id).then(() => { if (typeof showToast === 'function') showToast('🗑️ ' + this.L('libRemoved')); this._home(); });
  },

  async _openReader(id, page) {
    this._view = 'reader'; this._book = { id: Number(id) }; this._rpage = Math.max(1, Number(page) || 1);
    await this._paintReader();
  },
  async _paintReader() {
    const el = this._el(); if (!el) return;
    const id = Number(this._book.id);
    const info = this._info && Number(this._info.id) === id ? this._info : (LibraryData.featuredById(id) || {});
    const name = info.name || (LibraryService.shelf().find(b => Number(b.id) === id) || {}).name || this.L('libTitle');
    const rtl = this._rtl(); const total = info.maxPage || null;
    el.innerHTML = `<div class="lib-page lib-reader">
      ${this._header(name, this.L('libIndex'), 'LibraryPage._backFromReader()', `onclick="LibraryPage._scrollIndex()"`)}
      <div class="lib-progress-line"><div id="lib-pline" style="width:${total ? Math.min(100, Math.round(this._rpage / total * 100)) : 0}%"></div></div>
      <div class="lib-reader-text" id="lib-rtext" style="--lib-fs:${this._fs}px;">${esc(this.L('libLoading'))}</div></div>
      <div class="lib-reader-foot">
        <button class="lib-rf-btn" ${this._rpage <= 1 ? 'disabled' : ''} onclick="LibraryPage._readerGo(-1)"><i class="fas fa-chevron-${rtl ? 'right' : 'left'}"></i></button>
        <div class="lib-rf-mid"><div id="lib-pageinfo">${esc(this.L('libPage'))} ${this._rpage}${total ? ' / ' + total : ''}</div>
        <input type="range" min="16" max="34" step="1" value="${this._fs}" oninput="LibraryPage._setFont(this.value)"></div>
        <button class="lib-rf-btn" onclick="LibraryPage._readerGo(1)"><i class="fas fa-chevron-${rtl ? 'left' : 'right'}"></i></button></div>`;
    try {
      const p = await LibraryService.page(id, this._rpage);
      const t = document.getElementById('lib-rtext'); if (!t) return;
      t.innerHTML = (p.text && p.text.trim()) ? this._sanitize(p.text) : `<div style="text-align:center;color:var(--text-secondary);padding:30px 0;">— ${esc(this.L('libPage'))} ${this._rpage} —</div>`;
      LibraryService.setProgress(id, this._rpage, total);
      const pl = document.getElementById('lib-pline'); if (pl && total) pl.style.width = Math.min(100, Math.round(this._rpage / total * 100)) + '%';
      const pi = document.getElementById('lib-pageinfo'); if (pi) pi.textContent = this.L('libPage') + ' ' + this._rpage + (total ? ' / ' + total : '');
    } catch (e) {
      const t = document.getElementById('lib-rtext');
      if (t) t.innerHTML = `<div style="text-align:center;color:var(--text-secondary);padding:26px 14px;line-height:1.7;">${esc(this.L('libReaderNoNet'))}</div>
        <div style="text-align:center;padding:6px 14px 20px;"><button class="lib-btn ghost" onclick="LibraryPage._srcSettings()"><i class="fas fa-plug"></i> ${esc(this.L('libSourceSettings'))}</button></div>`;
    }
  },
  _sanitize(text) {
    let t = String(text || '');
    t = t.replace(/<span[^>]*data-type=["']?title["']?[^>]*>/gi, '\u0001').replace(/<\/span>/gi, '\u0002');
    t = t.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|h[1-6])>/gi, '\n').replace(/<[^>]*>/g, '');
    t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    t = t.replace(/\u0001/g, '<span class="lib-h">').replace(/\u0002/g, '</span>');
    t = t.replace(/﴿([^﴾]{0,400})﴾/g, '<em>﴿$1﴾</em>');
    return t.split(/\n{2,}/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
  },
  _readerGo(d) { const n = this._rpage + d; if (n < 1) return; this._rpage = n; this._paintReader(); const el = this._el(); if (el) el.scrollTop = 0; },
  _setFont(v) { this._fs = Number(v) || 20; Storage.set('library_fontsize', this._fs); const t = document.getElementById('lib-rtext'); if (t) t.style.setProperty('--lib-fs', this._fs + 'px'); },
  _scrollIndex() { this._openBook(Number(this._book.id)); },
  _backHome() { Router.go('wisdom'); },
  _backFromDetail() { this._reopen(this._from || 'topic'); },
  _backFromReader() { this._openBook(Number(this._book.id)); },

  // ============ التنزيل ============
  async _quickDownload(id, btn) {
    const bid = Number(id); const key = this._dlKey('t', bid);
    const st = this._dlState[key];
    if (st && st.state === 'run') return;
    this._setDl(key, 0, 'run');
    const c = this._curatedById(bid) || {};
    const found = (this._results || []).find(x => Number(x.id) === bid) || {};
    if (btn) { const i = btn.querySelector('i'); if (i) i.className = 'fas fa-sync'; }
    try {
      const info = await LibraryService.bookInfo(bid);
      if (!info.name) info.name = c.name || found.name || '';
      if (!info.author) info.author = c.author || found.author || '';
      await LibraryService.downloadBook(bid, info, (done, total) => { this._setDl(key, done / Math.max(1, total) * 100, 'run'); });
      this._setDl(key, 100, 'done');
      this._markShelfUi('t', bid);
      if (typeof showToast === 'function') showToast('✅ ' + this.L('libAddedToast'));
    } catch (e) {
      this._setDl(key, 0, 'err');
      if (typeof showToast === 'function') showToast('⚠️ ' + this.L('libDownloadFail') + ' — ' + this.L('libProxyHint'));
    }
    if (btn) { const i = btn.querySelector('i'); if (i) i.className = 'fas fa-download'; }
  },
  async _downloadFromDetail(id, btn) {
    await this._quickDownload(id, btn);
    try { this._info = await LibraryService.bookInfo(Number(id)); } catch (e) { /* تجاهل */ }
    this._paintDetail();
  },
  _runDownload() { return Promise.resolve(null); },
  cleanup() {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    document.querySelectorAll('.lib-sheet-overlay').forEach(o => { try { o.remove(); } catch (e) { /* تجاهل */ } });
  },

  // ============================================================
  // v1.0.84 — لغة الأقسام (تشمل الإنجليزية عند وجود كتب)
  // ============================================================
  _sectionLangs(section) {
    const out = [];
    if (section === 'kids') { if ((LibraryData.KIDS_CHILDREN_AR || []).length || (LibraryData.KIDS_PARENTS_AR || []).length) out.push('ar'); }
    else if (section === 'newmuslims') { if ((LibraryData.NEW_MUSLIMS || []).length) out.push('ar'); }
    else out.push('ar');
    const gs = section === 'kids' ? ['kids', 'family'] : (section === 'newmuslims' ? ['nm'] : LibraryData.ESEN_TOPICS);
    ['es', 'en'].forEach(l => { if (gs.some(g => LibraryData.ihGroupBooks(l, g).length)) out.push(l); });
    return out.length ? out : ['ar'];
  },
  _sectionLangBar(section) {
    const ls = this._sectionLangs(section);
    if (ls.length < 2) return '';
    return `<div class="lib-langbar">${LibraryData.LANGS.filter(x => ls.indexOf(x.id) !== -1).map(x =>
      `<button class="lib-lang ${x.id === this._lang ? 'on' : ''}" onclick="LibraryPage._setSectionLang('${section}','${x.id}')">${esc(this.L(x.key))}</button>`).join('')}</div>`;
  },
  _setSectionLang(section, l) {
    if (!l || l === this._lang) return;
    this._lang = l;
    if (typeof Storage !== 'undefined') Storage.set('library_lang', l);
    if (section === 'kids') this._openKids(); else this._openNewMuslims();
  },

  // ============================================================
  // v1.0.84 — كتب الأطفال لكل باب على حدة (لا تتكرّر نفس القائمة)
  // ============================================================
  _topicKids() {
    const t = this._topic ? this._topicDef(this._topic) : null;
    if (!t) return [];
    if (this._lang !== 'ar') {
      const gid = LibraryData.ESEN_MAP[t.topic] || t.group || t.topic;   // v1.0.89: كان يقرأ topic غير موجود => تبويب الأطفال فارغ
      return LibraryData.ihAllBooks(this._lang).filter(b => b.group === gid && b.kids);
    }
    const gid = this._arGroupOf(this._topic);
    const g = LibraryData.ihGroups('ar').find(x => x.id === gid);
    const keys = [];
    if (LibraryData.KIDS_TOPIC[t.topic]) keys.push(t.topic);
    ((g && g.tKeys) || []).forEach(k => { if (keys.indexOf(k) === -1) keys.push(k); });
    const out = [];
    keys.forEach(k => {
      const def = LibraryData.TOPIC_DEFS[k];
      (LibraryData.KIDS_TOPIC[k] || []).forEach(b => out.push({ id: b.id, name: b.name, author: b.author || '', catId: def ? def.cat : null, volumes: b.volumes || 0 }));
    });
    return out;
  },
  _curatedById(id) {
    const bid = Number(id);
    const maps = [LibraryData.CAT_BOOKS || {}, LibraryData.KIDS_TOPIC || {}];
    for (const m of maps) {
      for (const k of Object.keys(m)) {
        const b = (m[k] || []).find(x => Number(x.id) === bid);
        if (b) return { id: b.id, name: b.name, author: b.author || '', volumes: b.volumes || 0, topic: k };
      }
    }
    const f = LibraryData.featuredById(bid);
    return f ? { id: f.id, name: f.name, author: f.author || '', volumes: f.volumes || 0, topic: f.cat } : null;
  },

  // ============================================================
  // v1.0.84 — تنزيل غير حاجب: الشريط داخل بطاقة الكتاب
  // ============================================================
  _dlKey(kind, id) { return kind + ':' + Number(id); },
  _dlBar(key) {
    const st = this._dlState && this._dlState[key];
    if (!st) return '';
    if (st.state === 'done') return `<div class="lib-card-bar done"><i class="fas fa-check"></i></div>`;
    if (st.state === 'err') return `<div class="lib-card-bar err"><i class="fas fa-triangle-exclamation"></i></div>`;
    return `<div class="lib-card-bar"><i style="width:${st.pct}%"></i><b>${st.pct}%</b></div>`;
  },
  _paintDl(key) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('[data-dlb="' + key + '"]').forEach(el => { el.innerHTML = this._dlBar(key); });
  },
  _setDl(key, pct, state) {
    this._dlState[key] = { pct: Math.max(0, Math.min(100, Math.round(pct || 0))), state: state || 'run' };
    this._paintDl(key);
  },
  _markShelfUi(kind, id) {
    document.querySelectorAll('[data-ak="' + kind + '_' + Number(id) + '"]').forEach(b => {
      b.classList.add('on'); const i = b.querySelector('i'); if (i) i.className = 'fas fa-check'; b.setAttribute('title', this.L('libOnShelfShort'));
    });
  },

  // ============================================================
  // v1.0.84 — إعداد مصدر البحث (وسيط) ليعمل البحث والتنزيل داخل التطبيق
  // ============================================================
  _srcSettings() {
    let cur = '';
    try { cur = (Storage.get('library_proxy') || ''); } catch (e) { cur = ''; }
    const v = window.prompt(this.L('libProxyPrompt'), cur || 'https://quba-proxy.<account>.workers.dev');
    if (v === null) return;
    const val = String(v).trim();
    if (!val || val.indexOf('workers.dev') === -1 && val.indexOf('http') !== 0) { try { Storage.remove('library_proxy'); } catch (e) { /* تجاهل */ } }
    else { try { Storage.set('library_proxy', val); } catch (e) { /* تجاهل */ } }
    if (typeof showToast === 'function') showToast('✅ ' + this.L('libProxySaved'));
    if (this._view === 'home') this._home();
  },

  // ============================================================
  // v1.0.84 — الجامع: كل الكتب في شبكة + شريط تصنيفات رفيع
  // ============================================================
  _jamiChips() {
    const ts = LibraryData.topicsFor(this._lang);
    const all = `<button class="lib-cat-chip ${!this._jcat ? 'on' : ''}" onclick="LibraryPage._setJcat(null)"><i class="fas fa-layer-group"></i> ${esc(this.L('libAll'))}</button>`;
    return all + ts.map(t => `<button class="lib-cat-chip ${this._jcat === t.id ? 'on' : ''}" onclick="LibraryPage._setJcat('${t.id}')"><i class="fas ${t.icon}"></i> ${esc(t.key ? this.L(t.key) : t.label)}</button>`).join('');
  },
  _paintJami() {
    const c = document.getElementById('lib-cats'); if (c) c.innerHTML = this._jamiChips();
    const b = document.getElementById('lib-books'); if (b) b.innerHTML = this._jamiHtml();
    const m = document.getElementById('lib-jami-more');
    if (m) m.hidden = this._jamiBooks().length <= (this._jlimit || 240);   // لا زر «المزيد» إن كانت كل الكتب ظاهرة
  },
  _setJcat(id) {
    this._jcat = id; this._results = null; this._jlimit = 240;
    this._paintJami();
  },
  _moreJami() { this._jlimit += 120; this._paintJami(); },
  _jamiHtml() {
    if (this._loading) return `<div class="lib-empty-list">${esc(this.L('libLoading'))}</div>`;
    const list = this._jamiBooks();
    if (!list.length) return `<div class="lib-empty-list">${esc(this.L('libNoCatBooks'))}</div>`;
    return this._gridHtml(list.slice(0, (this._jlimit || 240)).map(b => ({ b: b, kind: b.pdf ? 'ih' : 't', g: b.group || '' })));
  },
  // v1.0.89 — كتب المكتبة الشاملة التابعة لباب ما (أو لكلها)
  _turathBooksFor(keys) {
    const out = [];
    (keys || []).forEach(k => {
      const def = LibraryData.TOPIC_DEFS[k];
      (LibraryData.CAT_BOOKS[k] || []).forEach(b => out.push({ id: b.id, name: b.name, author: b.author || '', catId: def ? def.cat : null, volumes: b.volumes || 0 }));
    });
    return out;
  },
  _arGroupOf(id) {
    if (!id) return null;
    if (LibraryData.ihGroups('ar').some(g => g.id === id)) return id;
    return LibraryData.IH_AR_MAP[id] || null;
  },
  _arGroupItems(gid) {
    if (!gid) return [];
    const g = LibraryData.ihGroups('ar').find(x => x.id === gid) || {};
    const ih = (g.books || []).slice();
    const tt = this._turathBooksFor(g.tKeys || []);
    return ih.concat(tt);
  },
  _jamiBooks() {
    const cat = this._jcat;
    if (this._lang === 'ar') {
      if (!cat) return LibraryData.ihAllBooks('ar').slice().concat(this._turathBooksFor(Object.keys(LibraryData.CAT_BOOKS)));
      return this._arGroupItems(this._arGroupOf(cat));
    }
    if (!cat) return LibraryData.ihAllBooks(this._lang);
    const g = LibraryData.ESEN_MAP[cat] || cat;
    const seen = {}, out = [];
    LibraryData.ihTopicBooks(this._lang, cat).concat(LibraryData.ihGroupBooks(this._lang, g)).forEach(b => {
      const id = Number(b.id); if (!id || seen[id]) return; seen[id] = 1; out.push(b);
    });
    return out;
  },
  _gridHtml(items) {
    return `<div class="lib-grid">${items.map(it => this._gridCard(it.b, it.g || '')).join('')}</div>`;
  },
  _gridCard(b, gid) {
    const kind = b.pdf ? 'ih' : 't';
    const nid = Number(b.id);
    const key = this._favKeyFor(kind, nid);
    const dlk = this._dlKey(kind, nid);
    const on = LibraryService.isFav(key);
    const onShelf = LibraryService.isOnShelfKind(nid, kind);
    const nm = escapeAttr(b.name || ''), au = escapeAttr(b.author || '');
    const readFn = kind === 'ih' ? `LibraryPage._openPdfById(${nid})` : `LibraryPage._openBook(${nid})`;
    const dlFn = kind === 'ih' ? `LibraryPage._dlPdfById(${nid},this)` : `LibraryPage._quickDownload(${nid},this)`;
    return `<div class="lib-gcard">
      <button class="lib-gcard-cover" onclick="${readFn}" aria-label="${escapeAttr(b.name || '')}">${this._cover(b, '', kind)}</button>
      <div class="lib-gcard-t" onclick="${readFn}">${esc(b.name || '')}</div>
      <div class="lib-gcard-a">${esc(b.author || '')}</div>
      <div class="lib-gcard-acts">
        <button class="lib-mini fav ${on ? 'on' : ''}" data-fk="${key}" data-nm="${nm}" data-au="${au}" title="${escapeAttr(this.L(on ? 'libFavRemove' : 'libFavAdd'))}" onclick="LibraryPage._toggleFav(event,'${key}','${kind}',${nid})"><i class="fa${on ? 's' : 'r'} fa-heart"></i></button>
        <button class="lib-mini add ${onShelf ? 'on' : ''}" data-ak="${kind}_${nid}" title="${escapeAttr(this.L(onShelf ? 'libOnShelfShort' : 'libAddToShelf'))}" onclick="LibraryPage._addToShelf(event,'${kind}',${nid},'${escapeAttr(gid || '')}')"><i class="fas ${onShelf ? 'fa-check' : 'fa-plus'}"></i></button>
        <button class="lib-mini read" title="${escapeAttr(this.L('libReadInside'))}" onclick="${readFn}"><i class="fas fa-book-open-reader"></i></button>
        <button class="lib-mini dl" title="${escapeAttr(this.L(kind === 'ih' ? 'libDownloadPdf' : 'libDownload'))}" onclick="${dlFn}"><i class="fas fa-download"></i></button>
      </div>
      <div class="lib-card-slot" data-dlb="${dlk}">${this._dlBar(dlk)}</div>
    </div>`;
  },
};
// ضمان الوصول من معالِجات onclick المُضمَّنة في القوالب
if (typeof window !== 'undefined') { window.LibraryPage = LibraryPage; }
if (typeof module !== 'undefined') module.exports = LibraryPage;
