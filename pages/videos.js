// 🎬 ClipsPage — مقتطفات دينية: شبكة فيديوهات يوتيوب + مشغّل داخلي + قوائم تشغيل
// v57: المشاهدة تتم داخل التطبيق عبر مشغّل يوتيوب المدمج (iframe رسمي) —
// يدعم ملء الشاشة، الترجمة (CC)، وجودة العرض من داخل المشغّل نفسه.
const ClipsPage = {
  _tab: 'videos',

  render(container, params = {}) {
    this._tab = (params && params.tab === 'albums') ? 'albums' : 'videos';
    this._renderList(container);
  },

  // ============ عرض القائمة ============
  _renderList(container) {
    const L = (k) => ClipsData.L(k);
    const isAr = document.documentElement.dir === 'rtl';
    const backIcon = isAr ? 'fa-arrow-right' : 'fa-arrow-left';

    const videosHtml = ClipsData.VIDEOS.map(v => `
      <button class="clip-card" onclick="ClipsPage.openVideo('${v.id}')" aria-label="${escapeAttr(v.title)}">
        <span class="clip-thumb">
          <img src="${ClipsData.thumb(v.id)}" alt="" loading="lazy" draggable="false"
               onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg';">
          <span class="clip-play"><i class="fas fa-play"></i></span>
        </span>
        <span class="clip-info">
          <span class="clip-title">${escapeHtml(v.title)}</span>
          <span class="clip-channel"><i class="fab fa-youtube"></i> ${escapeHtml(v.channel)}</span>
          <span class="clip-watch"><i class="fas fa-circle-play"></i> ${L('clipsWatch')}</span>
        </span>
      </button>
    `).join('');

    const albumsHtml = ClipsData.PLAYLISTS.map(p => `
      <button class="clip-card clip-album" onclick="ClipsPage.openPlaylist('${p.id}')" aria-label="${escapeAttr(p.title)}">
        <span class="clip-thumb clip-album-thumb">
          <span class="clip-album-icon"><i class="fas fa-list-video"></i></span>
          <span class="clip-play"><i class="fas fa-play"></i></span>
        </span>
        <span class="clip-info">
          <span class="clip-title">${escapeHtml(p.title)}</span>
          <span class="clip-channel"><i class="fab fa-youtube"></i> YouTube</span>
          <span class="clip-watch"><i class="fas fa-circle-play"></i> ${L('clipsWatch')}</span>
        </span>
      </button>
    `).join('');

    container.innerHTML = `
      <div class="clips-page">
        <div class="clips-header">
          <button class="clips-back" onclick="Router.back()" aria-label="${L('clipsBack')}">
            <i class="fas ${backIcon}"></i>
          </button>
          <div class="clips-header-text">
            <div class="clips-title">${L('clipsTitle')}</div>
            <div class="clips-subtitle">${L('clipsSubtitle')}</div>
          </div>
          <i class="fab fa-youtube clips-yt-badge"></i>
        </div>

        <div class="clips-tabs">
          <button class="clips-tab ${this._tab === 'videos' ? 'active' : ''}" onclick="ClipsPage.switchTab('videos')">
            <i class="fas fa-film"></i> ${L('clipsVideosTab')} · ${ClipsData.VIDEOS.length}
          </button>
          <button class="clips-tab ${this._tab === 'albums' ? 'active' : ''}" onclick="ClipsPage.switchTab('albums')">
            <i class="fas fa-list-video"></i> ${L('clipsAlbumsTab')} · ${ClipsData.PLAYLISTS.length}
          </button>
        </div>

        <div class="clips-grid">
          ${this._tab === 'videos' ? videosHtml : albumsHtml}
        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this._tab = tab;
    const container = document.getElementById('main-content');
    if (container) this._renderList(container);
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
          <div class="clip-player-title">${escapeHtml(cfg.title)}</div>
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
