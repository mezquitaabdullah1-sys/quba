// 🎬 ClipsPage — مقتطفات دينية: فيديوهات مصنّفة حسب اللغة (إسبانية/عربية/إنجليزية)
// v59: فئات اللغة + فتح فيديو مباشرة من الرئيسية (params.play)
// v72: شريط تصنيفات (مختارات/أطفال/قرآن/بودكاست/أسئلة) تحت شريط اللغة، صفوف أفقية حسب التصنيف
//      على طريقة يوتيوب في عرض «الكل»، وبحث في الأعلى. أزرار التقسيم بلا أيقونات وقابلة للتمرير.
// v93: الشريط الأخضر يجمع: مبدّل لغة مصغّر (اختصار + علم + قائمة) + زر «ثلاث شحطات» يفتح كل التصنيفات
//      (الأساسية + القديمة المُزالة + قوائم التشغيل). شريط واحد فقط للتصنيفات الأساسية فوق الفيديوهات.
// v91: ٣ تصنيفات فقط (محاضرات/بودكاست/تلاوات قرآنية — والتلاوات تشمل القرآن المترجم) + تنبيه الإعلانات
// v85: نبذة أسفل كل فيديو + زر «افتح في يوتيوب» أصغر + مفضلة (قلب أسفل الفيديو)
//      محفوظة محليًا ويُعاد إليها من أيقونة القلب في الشريط العلوي.
const ClipsPage = {
  _tab: 'es',        // es | ar | en | albums
  _lang: 'es',       // اللغة الحالية (تبقى محفوظة أثناء عرض قوائم التشغيل)
  _topic: 'all',     // all | lectures | podcast | recitation | featured | quran | questions | kids | lang
  _search: false,    // شريط البحث مفتوح؟
  _fav: false,       // عرض المفضلة؟
  _q: '',            // نص البحث الحالي

  FAV_KEY: 'clips_favorites',

  render(container, params = {}) {
    this._tab = (params && ['es', 'ar', 'en', 'albums'].includes(params.tab)) ? params.tab : 'es';
    if (ClipsData.LANGS.indexOf(this._tab) !== -1) this._lang = this._tab;
    const _pt = params && params.topic;
    this._topic = (_pt === 'all' || (_pt && ClipsData.ALL_TOPICS.indexOf(_pt) !== -1)) ? _pt : 'all';
    this._search = false;
    this._fav = false;
    this._q = '';
    this._renderList(container);
    // v59: الضغط على فيديو في الرئيسية يفتح مشغّله مباشرة داخل الصفحة
    if (params && params.play) this.openVideo(params.play);
  },

  // ============ المفضلة (محفوظة محليًا) ============
  favIds() {
    let ids = [];
    try {
      const v = (typeof Storage !== 'undefined') ? Storage.get(this.FAV_KEY) : null;
      if (Array.isArray(v)) ids = v.slice();
      else if (typeof v === 'string' && v) ids = JSON.parse(v) || [];
    } catch (e) { ids = []; }
    return ids.filter(id => ClipsData.VIDEOS.some(x => x.id === id));
  },
  _saveFav(ids) {
    try { if (typeof Storage !== 'undefined') Storage.set(this.FAV_KEY, ids); } catch (e) { /* تجاهل */ }
  },
  isFav(id) { return this.favIds().indexOf(id) !== -1; },
  favVideos() { return this.favIds().map(id => ClipsData.VIDEOS.find(v => v.id === id)).filter(Boolean); },

  toggleFav(id, el) {
    const ids = this.favIds();
    const i = ids.indexOf(id);
    const nowFav = i === -1;
    if (nowFav) ids.push(id); else ids.splice(i, 1);
    this._saveFav(ids);
    if (el) {
      el.classList.toggle('is-fav', nowFav);
      el.setAttribute('aria-label', ClipsData.L(nowFav ? 'clipsFavRemove' : 'clipsFavAdd'));
      el.classList.remove('pop');
      void el.offsetWidth;   // إعادة تشغيل الأنيميشن
      el.classList.add('pop');
    }
    this._updateFavBadge();
    if (typeof showToast === 'function') showToast(ClipsData.L(nowFav ? 'clipsFavAdded' : 'clipsFavRemoved'));
    if (this._fav) this._refreshBody();   // في وضع المفضلة: إزالة البطاقة فورًا
  },

  _updateFavBadge() {
    const n = document.getElementById('clips-fav-n');
    if (!n) return;
    const c = this.favIds().length;
    n.textContent = c;
    n.hidden = !c;
  },

  _syncFavBtn() {
    const btn = document.getElementById('clips-fav-btn');
    if (btn) btn.classList.toggle('active', this._fav);
    this._updateFavBadge();
  },

  // ============ بطاقات ============
  _videoCard(v, extraClass) {
    const L = (k) => ClipsData.L(k);
    const fav = this.isFav(v.id);
    const d = ClipsData.desc(v);
    const du = ClipsData.fmtDur(ClipsData.durOf(v.id));
    return `
      <div class="clip-card ${extraClass || ''}" role="button" tabindex="0"
           onclick="ClipsPage.openVideo('${v.id}')" aria-label="${escapeAttr(v.title)}">
        <span class="clip-thumb">
          <img src="${ClipsData.thumb(v.id, true)}" alt="" loading="lazy" draggable="false"
               onerror="this.onerror=()=>{this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg';};this.src='https://i.ytimg.com/vi/${v.id}/hqdefault.jpg';">
          <span class="clip-play"><i class="fas fa-play"></i></span>
          ${du ? `<span class="clip-dur">${du}</span>` : ''}
        </span>
        <span class="clip-info">
          <span class="clip-title" dir="auto">${escapeHtml(v.title)}</span>
          <span class="clip-channel"><i class="fab fa-youtube"></i> ${escapeHtml(v.channel)}</span>
          ${d ? `<span class="clip-desc" dir="auto">${escapeHtml(d)}</span>` : ''}
          <span class="clip-foot">
            <span class="clip-watch"><i class="fas fa-circle-play"></i> ${L('clipsWatch')}</span>
            <button type="button" class="clip-fav ${fav ? 'is-fav' : ''}"
                    onclick="event.stopPropagation();ClipsPage.toggleFav('${v.id}', this)"
                    aria-label="${escapeAttr(L(fav ? 'clipsFavRemove' : 'clipsFavAdd'))}"
                    title="${escapeAttr(L(fav ? 'clipsFavRemove' : 'clipsFavAdd'))}">
              <i class="fas fa-heart"></i>
            </button>
          </span>
        </span>
      </div>`;
  },

  _albumCard(p, extraClass) {
    const L = (k) => ClipsData.L(k);
    const d = ClipsData.desc(p);
    return `
      <button class="clip-card clip-album ${extraClass || ''}" onclick="ClipsPage.openPlaylist('${p.id}')" aria-label="${escapeAttr(p.title)}">
        <span class="clip-thumb clip-album-thumb">
          <span class="clip-album-icon"><i class="fas fa-list-video"></i></span>
          <span class="clip-play"><i class="fas fa-play"></i></span>
        </span>
        <span class="clip-info">
          <span class="clip-title" dir="auto">${escapeHtml(p.title)}</span>
          <span class="clip-channel"><i class="fab fa-youtube"></i> YouTube</span>
          ${d ? `<span class="clip-desc" dir="auto">${escapeHtml(d)}</span>` : ''}
          <span class="clip-watch"><i class="fas fa-circle-play"></i> ${L('clipsWatch')}</span>
        </span>
      </button>`;
  },

  // v90: تنبيه الإعلانات (أسفل القائمة وأسفل المشغّل)
  _adsNote() {
    if (this._tab === 'albums' && !this._fav && !this._search) return '';
    return `<div class="clips-ads-note"><i class="fas fa-circle-info"></i> ${ClipsData.L('clipsAdsNote')}</div>`;
  },

  // ============ محتوى الصفحة حسب الحالة ============
  _bodyHtml() {
    const L = (k) => ClipsData.L(k);

    // 1) بحث: نتائج في كل الفيديوهات (كل اللغات) + قوائم التشغيل
    if (this._search) {
      const q = this._q.trim();
      if (!q) return '';
      const vids = ClipsData.search(q);
      const lists = ClipsData.searchPlaylists(q);
      if (!vids.length && !lists.length) {
        return `<div class="clips-empty"><i class="fas fa-magnifying-glass"></i><div>${L('clipsNoResults')}</div></div>`;
      }
      return `<div class="clips-grid">${vids.map(v => this._videoCard(v)).join('')}${lists.map(p => this._albumCard(p)).join('')}</div>`;
    }

    // 2) v85: المفضلة (كل اللغات)
    if (this._fav) {
      const list = this.favVideos();
      if (!list.length) {
        return `<div class="clips-empty"><i class="fas fa-heart"></i><div>${L('clipsFavEmpty')}</div></div>`;
      }
      return `<div class="clips-grid">${list.map(v => this._videoCard(v)).join('')}</div>`;
    }

    // 3) قوائم التشغيل
    if (this._tab === 'albums') {
      const pls = ClipsData.playlistsFor(this._lang);
      if (!pls.length) return `<div class="clips-empty"><i class="fas fa-list-video"></i><div>${L('clipsEmptyTopic')}</div></div>`;
      return `<div class="clips-grid">${pls.map(p => this._albumCard(p)).join('')}</div>`;
    }

    // 4) تصنيف محدد → شبكة فيديوهاته
    if (this._topic !== 'all') {
      const list = ClipsData.topicList(this._lang, this._topic);
      // v91: «تلاوات قرآنية» (وتشمل القرآن المترجم) يبدأ بقوائم التشغيل ثم المقاطع
      // v99: قوائم القرآن المترجم تسبق التلاوات — بلغة العرض الحالية فقط (بلا سلاسل)
      const albums = (!ClipsData.isLegacyTopic(this._topic) && this._topic === 'recitation')
        ? ClipsData.playlistsFor(this._lang).filter(p => p.kind !== 'series').map(p => this._albumCard(p)).join('') : '';
      if (!list.length && !albums) {
        return `<div class="clips-empty"><i class="fas fa-film"></i><div>${L('clipsEmptyTopic')}</div></div>`;
      }
      return `<div class="clips-grid">${albums}${list.map(v => this._videoCard(v)).join('')}</div>`;
    }

    // 5) «الكل» → صفوف أفقية لكل تصنيف (على طريقة يوتيوب)
    const rows = ClipsData.CORE_TOPICS.map(t => {
      const list = ClipsData.byLangTopic(this._lang, t);
      if (!list.length) return '';
      return `
        <section class="clips-row-sec">
          <div class="clips-row-head">
            <h3 class="clips-row-title">${L(ClipsData.topicKey(t))}</h3>
            <button class="clips-row-all" onclick="ClipsPage.switchTopic('${t}')">${L('clipsSeeAll')}
              <i class="fas fa-chevron-${document.documentElement.dir === 'rtl' ? 'left' : 'right'}"></i></button>
          </div>
          <div class="clips-row">${list.map(v => this._videoCard(v, 'clip-card--row')).join('')}</div>
        </section>`;
    }).join('');
    return rows || `<div class="clips-empty"><i class="fas fa-film"></i><div>${L('clipsEmptyTopic')}</div></div>`;
  },

  // ============ عرض القائمة ============
  _renderList(container) {
    const L = (k) => ClipsData.L(k);
    const isAr = document.documentElement.dir === 'rtl';
    const backIcon = isAr ? 'fa-arrow-right' : 'fa-arrow-left';
    const favCount = this.favIds().length;
    const topicBtns = this._chipsHtml();

    container.innerHTML = `
      <div class="clips-page ${this._search ? 'is-searching' : ''} ${this._fav ? 'is-fav' : ''}" id="clips-page">
        <div class="clips-header">
          <button class="clips-back" onclick="Router.back()" aria-label="${L('clipsBack')}">
            <i class="fas ${backIcon}"></i>
          </button>
          <div class="clips-header-text">
            <div class="clips-title">${this._fav ? L('clipsFavorites') : L('clipsTitle')}</div>
            <div class="clips-subtitle">${L('clipsSubtitle')}</div>
          </div>
          ${this._langPillHtml()}
          <button class="clips-back clips-fav-btn ${this._fav ? 'active' : ''}" id="clips-fav-btn"
                  onclick="ClipsPage.toggleFavView()"
                  aria-label="${L(this._fav ? 'clipsFavClose' : 'clipsFavorites')}" title="${L('clipsFavorites')}">
            <i class="fas fa-heart"></i>
            <span class="clips-fav-n" id="clips-fav-n" ${favCount ? '' : 'hidden'}>${favCount}</span>
          </button>
          <button class="clips-back clips-search-btn" id="clips-search-btn" onclick="ClipsPage.toggleSearch()"
                  aria-label="${L(this._search ? 'clipsSearchClose' : 'clipsSearch')}">
            <i class="fas ${this._search ? 'fa-xmark' : 'fa-magnifying-glass'}"></i>
          </button>
          <button class="clips-back clips-all-btn" id="clips-all-btn" onclick="ClipsPage.openSheet()"
                  aria-label="${escapeAttr(L('clipsAllTopics'))}" title="${escapeAttr(L('clipsAllTopics'))}">
            <i class="fas fa-bars"></i>
          </button>
        </div>

        <div class="clips-searchbar" id="clips-searchbar" ${this._search ? '' : 'hidden'}>
          <i class="fas fa-magnifying-glass"></i>
          <input type="search" id="clips-search-input" value="${escapeAttr(this._q)}" dir="auto"
                 placeholder="${escapeAttr(L('clipsSearchPlaceholder'))}" autocomplete="off" enterkeyhint="search"
                 oninput="ClipsPage.onSearch(this.value)">
        </div>

        <div class="clips-chips" id="clips-chips" ${(this._tab === 'albums' || this._fav) ? 'hidden' : ''}>${topicBtns}</div>

        <div class="clips-body" id="clips-body">${this._bodyHtml() + this._adsNote()}</div>
        ${this._sheetHtml()}
      </div>
    `;
    if (this._search) {
      const inp = document.getElementById('clips-search-input');
      if (inp && !this._q) inp.focus();
    }
    this._revealActive();
  },

  // يُبقي الزر النشط ظاهرًا داخل شريط التصنيفات
  _revealActive() {
    const bar = document.getElementById('clips-chips');
    const act = bar && bar.querySelector('.active');
    if (!act || bar.scrollWidth <= bar.clientWidth) return;
    const ar = act.getBoundingClientRect(), br = bar.getBoundingClientRect();
    // يعمل في الاتجاهين (RTL/LTR) لأن الإزاحة تُحسب من المواضع الفعلية
    bar.scrollLeft += (ar.left + ar.width / 2) - (br.left + br.width / 2);
  },

  _refreshBody() {
    const body = document.getElementById('clips-body');
    if (body) body.innerHTML = this._bodyHtml() + this._adsNote();
  },

  // v93: حبّات الشريط الواحد — «الكل» + الأقسام الأساسية فقط
  _chipsHtml() {
    const L = (k) => ClipsData.L(k);
    const lang = ClipsData.LANGS.indexOf(this._lang) !== -1 ? this._lang : 'es';
    const avail = ClipsData.topicsFor(lang);
    return ['all'].concat(avail).map(t => `
      <button class="clips-chip ${this._topic === t ? 'active' : ''}" data-topic="${t}" onclick="ClipsPage.switchTopic('${t}')">
        ${t === 'all' ? L('clipsTopicAll') : L(ClipsData.topicKey(t))}
      </button>`).join('');
  },

  _rebuildChips() {
    const chips = document.getElementById('clips-chips');
    if (!chips) return;
    const lang = ClipsData.LANGS.indexOf(this._lang) !== -1 ? this._lang : 'es';
    if (this._topic !== 'all' && ClipsData.topicCount(lang, this._topic) === 0) this._topic = 'all';
    chips.innerHTML = this._chipsHtml();
  },

  // ============ v93: مبدّل اللغة المصغّر في الشريط الأخضر ============
  _langPillHtml() {
    const L = (k) => ClipsData.L(k);
    const cur = ClipsData.LANGS.indexOf(this._lang) !== -1 ? this._lang : 'es';
    const items = ClipsData.LANGS.map(c => `
      <button class="clips-lang-item ${cur === c ? 'active' : ''}" data-lang="${c}" onclick="ClipsPage.setLang('${c}')">
        <span class="clips-lang-flag">${ClipsData.langFlag(c)}</span>
        <span class="clips-lang-nm">${L('clipsLang' + c.charAt(0).toUpperCase() + c.slice(1))}</span>
        <span class="clips-lang-ct">${ClipsData.byCat(c).length}</span>
        ${cur === c ? '<i class="fas fa-check"></i>' : ''}
      </button>`).join('');
    return `
      <div class="clips-lang" id="clips-lang">
        <button class="clips-lang-btn" id="clips-lang-btn"
                onclick="event.stopPropagation();ClipsPage.toggleLangMenu()"
                aria-label="${escapeAttr(L('clipsLangSwitch'))}" title="${escapeAttr(L('clipsLangSwitch'))}">
          <span class="clips-lang-flag">${ClipsData.langFlag(cur)}</span>
          <span class="clips-lang-code">${ClipsData.langCode(cur)}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="clips-lang-menu" id="clips-lang-menu" role="menu" hidden>${items}</div>
      </div>`;
  },

  toggleLangMenu() {
    const m = document.getElementById('clips-lang-menu');
    if (m) m.hidden = !m.hidden;
  },

  closeLangMenu() {
    const m = document.getElementById('clips-lang-menu');
    if (m) m.hidden = true;
  },

  setLang(lang) {
    if (ClipsData.LANGS.indexOf(lang) === -1) return;
    this._lang = lang;
    this._tab = lang;
    this._fav = false;
    this._search = false;
    this._q = '';
    if (this._topic !== 'all' && ClipsData.topicCount(lang, this._topic) === 0) this._topic = 'all';
    const c = document.getElementById('main-content');
    if (!c) return;
    this._renderList(c);   // إعادة بناء كاملة: الوسم + اللغة + القائمة
    if (typeof showToast === 'function') {
      showToast(ClipsData.L('clipsLang' + lang.charAt(0).toUpperCase() + lang.slice(1)));
    }
  },

  // ============ v93: قائمة «جميع التصنيفات» (ثلاث شحطات) ============
  openSheet() {
    const s = document.getElementById('clips-sheet');
    if (!s) return;
    s.hidden = false;
    if (s.classList) s.classList.add('is-open');
  },

  closeSheet() {
    const s = document.getElementById('clips-sheet');
    if (!s) return;
    if (s.classList) s.classList.remove('is-open');
    s.hidden = true;
  },

  sheetPick(key) {
    this.closeSheet();
    if (key === 'albums') { this.switchTab('albums'); return; }
    this.switchTopic(key);
  },

  _sheetHtml() {
    const L = (k) => ClipsData.L(k);
    const lang = ClipsData.LANGS.indexOf(this._lang) !== -1 ? this._lang : 'es';
    const row = (key, label, count, isActive) => `
      <button class="clips-sheet-item ${isActive ? 'active' : ''}" data-topic="${key}"
              onclick="ClipsPage.sheetPick('${key}')">
        <span class="clips-sheet-nm">${label}</span>
        <span class="clips-sheet-ct">${count}</span>
        ${isActive ? '<i class="fas fa-check"></i>' : ''}
      </button>`;
    const coreRows = row('all', L('clipsTopicAll'), ClipsData.byCat(lang).length, this._topic === 'all')
      + ClipsData.CORE_TOPICS.filter(t => ClipsData.topicCount(lang, t) > 0)
          .map(t => row(t, L(ClipsData.topicKey(t)), ClipsData.topicCount(lang, t), this._topic === t)).join('');
    const plsN = ClipsData.playlistsFor(lang).length;   // v99: القوائم تظهر مع لغتها فقط
    const legacyRows = ClipsData.legacyTopicsFor(lang)
      .map(t => row(t, L(ClipsData.topicKey(t)), ClipsData.topicCount(lang, t), this._topic === t)).join('')
      + (plsN ? row('albums', L('clipsAlbumsTab'), plsN, this._tab === 'albums') : '');
    return `
      <div class="clips-sheet" id="clips-sheet" hidden>
        <div class="clips-sheet-bg" onclick="ClipsPage.closeSheet()"></div>
        <div class="clips-sheet-card" role="dialog" aria-modal="true">
          <div class="clips-sheet-head">
            <span class="clips-sheet-title">${L('clipsAllTopics')}</span>
            <button class="clips-sheet-x" onclick="ClipsPage.closeSheet()"
                    aria-label="${escapeAttr(L('clipsClose'))}"><i class="fas fa-xmark"></i></button>
          </div>
          <div class="clips-sheet-body">
            <div class="clips-sheet-sec">${L('clipsSecCore')}</div>
            ${coreRows}
            ${legacyRows ? `<div class="clips-sheet-sec">${L('clipsSecMore')}</div>${legacyRows}` : ''}
          </div>
        </div>
      </div>`;
  },

  switchTab(tab) {
    if (tab === 'albums') {
      if (!ClipsData.playlistsFor(this._lang).length) return;   // v99: لا قوائم لهذه اللغة
      this._tab = 'albums';
      this._fav = false;
      const c = document.getElementById('main-content');
      if (c) this._renderList(c);
      return;
    }
    this.setLang(ClipsData.LANGS.indexOf(tab) !== -1 ? tab : 'es');
  },

  switchTopic(topic) {
    this._topic = (topic === 'all' || ClipsData.ALL_TOPICS.indexOf(topic) !== -1) ? topic : 'all';
    this._fav = false;
    const page = document.getElementById('clips-page');
    if (page) page.classList.remove('is-fav');
    this._syncFavBtn();
    const bar = document.getElementById('clips-chips');
    if (!bar) { const c = document.getElementById('main-content'); if (c) this._renderList(c); return; }
    bar.hidden = (this._tab === 'albums');
    this._rebuildChips();
    bar.querySelectorAll('.clips-chip').forEach(b => b.classList.toggle('active', b.dataset.topic === this._topic));
    const sheet = document.getElementById('clips-sheet');
    if (sheet) sheet.outerHTML = this._sheetHtml();
    this._refreshBody();
    this._revealActive();
    if (page && page.scrollIntoView) page.scrollIntoView({ block: 'start' });
  },

  // ============ البحث ============
  toggleSearch() {
    this._search = !this._search;
    if (!this._search) this._q = '';
    if (this._search) this._fav = false;
    const page = document.getElementById('clips-page');
    const bar = document.getElementById('clips-searchbar');
    const btn = document.getElementById('clips-search-btn');
    if (!page || !bar || !btn) { const c = document.getElementById('main-content'); if (c) this._renderList(c); return; }
    const L = (k) => ClipsData.L(k);
    page.classList.toggle('is-searching', this._search);
    page.classList.remove('is-fav');
    bar.hidden = !this._search;
    btn.setAttribute('aria-label', L(this._search ? 'clipsSearchClose' : 'clipsSearch'));
    btn.innerHTML = `<i class="fas ${this._search ? 'fa-xmark' : 'fa-magnifying-glass'}"></i>`;
    const chips = document.getElementById('clips-chips');
    if (chips && !this._search) chips.hidden = (this._tab === 'albums');
    this._syncFavBtn();
    const inp = document.getElementById('clips-search-input');
    if (inp) { inp.value = this._q; if (this._search) inp.focus(); }
    this._refreshBody();
    this._revealActive();
  },

  onSearch(value) {
    this._q = String(value || '');
    this._refreshBody();
  },

  // ============ v85: عرض المفضلة ============
  toggleFavView() {
    this._fav = !this._fav;
    if (this._fav) { this._search = false; this._q = ''; }
    const page = document.getElementById('clips-page');
    const bar = document.getElementById('clips-searchbar');
    const sbtn = document.getElementById('clips-search-btn');
    const container = document.getElementById('main-content');
    if (!page || !bar || !sbtn) { if (container) this._renderList(container); return; }
    const L = (k) => ClipsData.L(k);
    page.classList.toggle('is-fav', this._fav);
    page.classList.remove('is-searching');
    bar.hidden = true;
    sbtn.setAttribute('aria-label', L('clipsSearch'));
    sbtn.innerHTML = `<i class="fas fa-magnifying-glass"></i>`;
    const chips = document.getElementById('clips-chips');
    if (chips) chips.hidden = (this._fav || this._tab === 'albums');
    const title = page.querySelector('.clips-header-text .clips-title');
    if (title) title.textContent = this._fav ? L('clipsFavorites') : L('clipsTitle');
    this._syncFavBtn();
    this._refreshBody();
    if (page.scrollIntoView) page.scrollIntoView({ block: 'start' });
  },

  // ============ المشغّل الداخلي ============
  openVideo(id) {
    const v = ClipsData.VIDEOS.find(x => x.id === id);
    if (!v) return;
    this._renderPlayer({
      id: v.id,
      embedSrc: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`,
      title: v.title,
      channel: v.channel,
      desc: ClipsData.desc(v),
      externalUrl: ClipsData.watchUrl(v.id),
    });
  },

  openPlaylist(id) {
    const p = ClipsData.PLAYLISTS.find(x => x.id === id);
    if (!p) return;
    this._renderPlayer({
      embedSrc: `https://www.youtube-nocookie.com/embed/videoseries?list=${p.id}&autoplay=1&rel=0`,
      title: p.title,
      channel: ClipsData.L(p.kind === 'written' ? 'clipsAlbumWritten' : (p.kind === 'oral' ? 'clipsAlbumOral' : 'clipsAlbumSeries')),
      externalUrl: ClipsData.playlistUrl(p.id),
    });
  },

  _renderPlayer(cfg) {
    const L = (k) => ClipsData.L(k);
    const isAr = document.documentElement.dir === 'rtl';
    const backIcon = isAr ? 'fa-arrow-right' : 'fa-arrow-left';
    const container = document.getElementById('main-content');
    if (!container) return;
    container.scrollTop = 0;
    const fav = cfg.id ? this.isFav(cfg.id) : false;

    container.innerHTML = `
      <div class="clips-page clips-player-page">
        <div class="clips-header">
          <button class="clips-back" onclick="ClipsPage.closePlayer()" aria-label="${L('clipsBack')}">
            <i class="fas ${backIcon}"></i>
          </button>
          <div class="clips-header-text">
            <div class="clips-title">${L('clipsTitle')}</div>
            <div class="clips-subtitle">${escapeHtml(cfg.channel)}</div>
          </div>
          <i class="fab fa-youtube clips-yt-badge"></i>
        </div>

        <div class="clip-player-frame">
          <iframe src="${cfg.embedSrc}"
                  title="${escapeAttr(cfg.title)}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>

        <div class="clip-player-info">
          <div class="clip-player-title" dir="auto">${escapeHtml(cfg.title)}</div>
          <div class="clip-player-channel"><i class="fab fa-youtube"></i> ${escapeHtml(cfg.channel)}</div>
          ${cfg.desc ? `<div class="clip-player-desc" dir="auto">${escapeHtml(cfg.desc)}</div>` : ''}
          <div class="clip-player-actions">
            <a class="clip-yt-link" href="${escapeAttr(cfg.externalUrl)}" target="_blank" rel="noopener noreferrer">
              <i class="fas fa-arrow-up-right-from-square"></i> ${L('clipsOpenYoutube')}
            </a>
            ${cfg.id ? `
            <button type="button" class="clip-fav clip-fav--lg ${fav ? 'is-fav' : ''}"
                    onclick="ClipsPage.toggleFav('${cfg.id}', this)"
                    aria-label="${escapeAttr(L(fav ? 'clipsFavRemove' : 'clipsFavAdd'))}"
                    title="${escapeAttr(L(fav ? 'clipsFavRemove' : 'clipsFavAdd'))}">
              <i class="fas fa-heart"></i>
            </button>` : ''}
          </div>
          <div class="clip-ads-note clip-ads-note--player"><i class="fas fa-circle-info"></i> <span>${L('clipsAdsNote')}</span></div>
        </div>
      </div>
    `;
  },

  closePlayer() {
    const container = document.getElementById('main-content');
    if (container) this._renderList(container);
  },

  cleanup() { /* iframe يُزال مع استبدال المحتوى تلقائيًا */ },
};

if (typeof module !== 'undefined') module.exports = ClipsPage;
