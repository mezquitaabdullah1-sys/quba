// 🎬 ClipsPage — مقتطفات دينية: فيديوهات مصنّفة حسب اللغة (إسبانية/عربية/إنجليزية)
// v59: فئات اللغة + فتح فيديو مباشرة من الرئيسية (params.play)
// v72: شريط تصنيفات (مختارات/أطفال/قرآن/بودكاست/أسئلة) تحت شريط اللغة، صفوف أفقية حسب التصنيف
//      على طريقة يوتيوب في عرض «الكل»، وبحث في الأعلى. أزرار التقسيم بلا أيقونات وقابلة للتمرير.
const ClipsPage = {
  _tab: 'es',        // es | ar | en | albums
  _topic: 'all',     // all | featured | kids | quran | podcast | questions
  _search: false,    // شريط البحث مفتوح؟
  _q: '',            // نص البحث الحالي

  render(container, params = {}) {
    this._tab = (params && ['es', 'ar', 'en', 'albums'].includes(params.tab)) ? params.tab : 'es';
    this._topic = (params && ClipsData.TOPICS.includes(params.topic)) ? params.topic : 'all';
    this._search = false;
    this._q = '';
    this._renderList(container);
    // v59: الضغط على فيديو في الرئيسية يفتح مشغّله مباشرة داخل الصفحة
    if (params && params.play) this.openVideo(params.play);
  },

  // ============ بطاقات ============
  _videoCard(v, extraClass) {
    const L = (k) => ClipsData.L(k);
    return `
      <button class="clip-card ${extraClass || ''}" onclick="ClipsPage.openVideo('${v.id}')" aria-label="${escapeAttr(v.title)}">
        <span class="clip-thumb">
          <img src="${ClipsData.thumb(v.id)}" alt="" loading="lazy" draggable="false"
               onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg';">
          <span class="clip-play"><i class="fas fa-play"></i></span>
        </span>
        <span class="clip-info">
          <span class="clip-title" dir="auto">${escapeHtml(v.title)}</span>
          <span class="clip-channel"><i class="fab fa-youtube"></i> ${escapeHtml(v.channel)}</span>
          <span class="clip-watch"><i class="fas fa-circle-play"></i> ${L('clipsWatch')}</span>
        </span>
      </button>`;
  },

  _albumCard(p, extraClass) {
    const L = (k) => ClipsData.L(k);
    return `
      <button class="clip-card clip-album ${extraClass || ''}" onclick="ClipsPage.openPlaylist('${p.id}')" aria-label="${escapeAttr(p.title)}">
        <span class="clip-thumb clip-album-thumb">
          <span class="clip-album-icon"><i class="fas fa-list-video"></i></span>
          <span class="clip-play"><i class="fas fa-play"></i></span>
        </span>
        <span class="clip-info">
          <span class="clip-title" dir="auto">${escapeHtml(p.title)}</span>
          <span class="clip-channel"><i class="fab fa-youtube"></i> YouTube</span>
          <span class="clip-watch"><i class="fas fa-circle-play"></i> ${L('clipsWatch')}</span>
        </span>
      </button>`;
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

    // 2) قوائم التشغيل
    if (this._tab === 'albums') {
      return `<div class="clips-grid">${ClipsData.PLAYLISTS.map(p => this._albumCard(p)).join('')}</div>`;
    }

    // 3) تصنيف محدد → شبكة فيديوهاته
    if (this._topic !== 'all') {
      const list = ClipsData.byLangTopic(this._tab, this._topic);
      if (!list.length) {
        return `<div class="clips-empty"><i class="fas fa-film"></i><div>${L('clipsEmptyTopic')}</div></div>`;
      }
      return `<div class="clips-grid">${list.map(v => this._videoCard(v)).join('')}</div>`;
    }

    // 4) «الكل» → صفوف أفقية لكل تصنيف (على طريقة يوتيوب)
    const rows = ClipsData.TOPICS.map(t => {
      const list = ClipsData.byLangTopic(this._tab, t);
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
    const langKey = (c) => 'clipsLang' + c.charAt(0).toUpperCase() + c.slice(1);

    const langBtns = ['es', 'ar', 'en'].map(c => `
      <button class="clips-tab ${this._tab === c ? 'active' : ''}" data-tab="${c}" onclick="ClipsPage.switchTab('${c}')">
        ${L(langKey(c))}<span class="clips-tab-n">${ClipsData.byCat(c).length}</span>
      </button>`).join('') + `
      <button class="clips-tab ${this._tab === 'albums' ? 'active' : ''}" data-tab="albums" onclick="ClipsPage.switchTab('albums')">
        ${L('clipsAlbumsTab')}<span class="clips-tab-n">${ClipsData.PLAYLISTS.length}</span>
      </button>`;

    const topicBtns = ['all'].concat(ClipsData.TOPICS).map(t => `
      <button class="clips-chip ${this._topic === t ? 'active' : ''}" data-topic="${t}" onclick="ClipsPage.switchTopic('${t}')">
        ${t === 'all' ? L('clipsTopicAll') : L(ClipsData.topicKey(t))}
      </button>`).join('');

    container.innerHTML = `
      <div class="clips-page ${this._search ? 'is-searching' : ''}" id="clips-page">
        <div class="clips-header">
          <button class="clips-back" onclick="Router.back()" aria-label="${L('clipsBack')}">
            <i class="fas ${backIcon}"></i>
          </button>
          <div class="clips-header-text">
            <div class="clips-title">${L('clipsTitle')}</div>
            <div class="clips-subtitle">${L('clipsSubtitle')}</div>
          </div>
          <button class="clips-back clips-search-btn" id="clips-search-btn" onclick="ClipsPage.toggleSearch()"
                  aria-label="${L(this._search ? 'clipsSearchClose' : 'clipsSearch')}">
            <i class="fas ${this._search ? 'fa-xmark' : 'fa-magnifying-glass'}"></i>
          </button>
        </div>

        <div class="clips-searchbar" id="clips-searchbar" ${this._search ? '' : 'hidden'}>
          <i class="fas fa-magnifying-glass"></i>
          <input type="search" id="clips-search-input" value="${escapeAttr(this._q)}" dir="auto"
                 placeholder="${escapeAttr(L('clipsSearchPlaceholder'))}" autocomplete="off" enterkeyhint="search"
                 oninput="ClipsPage.onSearch(this.value)">
        </div>

        <div class="clips-tabs" id="clips-tabs" role="tablist">${langBtns}</div>
        <div class="clips-chips" id="clips-chips" ${this._tab === 'albums' ? 'hidden' : ''}>${topicBtns}</div>

        <div class="clips-body" id="clips-body">${this._bodyHtml()}</div>
      </div>
    `;
    if (this._search) {
      const inp = document.getElementById('clips-search-input');
      if (inp && !this._q) inp.focus();
    }
    this._revealActive();
  },

  // يُبقي الزر النشط ظاهرًا داخل الشريط القابل للتمرير
  _revealActive() {
    ['clips-tabs', 'clips-chips'].forEach(id => {
      const bar = document.getElementById(id);
      const act = bar && bar.querySelector('.active');
      if (!act || bar.scrollWidth <= bar.clientWidth) return;
      const ar = act.getBoundingClientRect(), br = bar.getBoundingClientRect();
      // يعمل في الاتجاهين (RTL/LTR) لأن الإزاحة تُحسب من المواضع الفعلية
      bar.scrollLeft += (ar.left + ar.width / 2) - (br.left + br.width / 2);
    });
  },

  _refreshBody() {
    const body = document.getElementById('clips-body');
    if (body) body.innerHTML = this._bodyHtml();
  },

  switchTab(tab) {
    this._tab = tab;
    const bar = document.getElementById('clips-tabs');
    if (!bar) { const c = document.getElementById('main-content'); if (c) this._renderList(c); return; }
    bar.querySelectorAll('.clips-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const chips = document.getElementById('clips-chips');
    if (chips) chips.hidden = (tab === 'albums');
    this._refreshBody();
    this._revealActive();
  },

  switchTopic(topic) {
    this._topic = (topic === 'all' || ClipsData.TOPICS.includes(topic)) ? topic : 'all';
    const bar = document.getElementById('clips-chips');
    if (!bar) { const c = document.getElementById('main-content'); if (c) this._renderList(c); return; }
    bar.querySelectorAll('.clips-chip').forEach(b => b.classList.toggle('active', b.dataset.topic === this._topic));
    this._refreshBody();
    this._revealActive();
    const page = document.getElementById('clips-page');
    if (page && page.scrollIntoView) page.scrollIntoView({ block: 'start' });
  },

  // ============ البحث ============
  toggleSearch() {
    this._search = !this._search;
    if (!this._search) this._q = '';
    const page = document.getElementById('clips-page');
    const bar = document.getElementById('clips-searchbar');
    const btn = document.getElementById('clips-search-btn');
    if (!page || !bar || !btn) { const c = document.getElementById('main-content'); if (c) this._renderList(c); return; }
    const L = (k) => ClipsData.L(k);
    page.classList.toggle('is-searching', this._search);
    bar.hidden = !this._search;
    btn.setAttribute('aria-label', L(this._search ? 'clipsSearchClose' : 'clipsSearch'));
    btn.innerHTML = `<i class="fas ${this._search ? 'fa-xmark' : 'fa-magnifying-glass'}"></i>`;
    const inp = document.getElementById('clips-search-input');
    if (inp) { inp.value = this._q; if (this._search) inp.focus(); }
    this._refreshBody();
    this._revealActive();
  },

  onSearch(value) {
    this._q = String(value || '');
    this._refreshBody();
  },

// ============ المشغّل الداخلي ============
  openVideo(id) {
    const v = ClipsData.VIDEOS.find(x => x.id === id);
    if (!v) return;
    this._renderPlayer({
      embedSrc: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`,
      title: v.title,
      channel: v.channel,
      externalUrl: ClipsData.watchUrl(v.id),
    });
  },

  openPlaylist(id) {
    const p = ClipsData.PLAYLISTS.find(x => x.id === id);
    if (!p) return;
    this._renderPlayer({
      embedSrc: `https://www.youtube-nocookie.com/embed/videoseries?list=${p.id}&autoplay=1&rel=0`,
      title: p.title,
      channel: ClipsData.L(p.kind === 'written' ? 'clipsAlbumWritten' : 'clipsAlbumOral'),
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
          <a class="clip-yt-link" href="${escapeAttr(cfg.externalUrl)}" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-arrow-up-right-from-square"></i> ${L('clipsOpenYoutube')}
          </a>
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
