// 📻 RadioPage — الراديو الإسلامي: بث مباشر، قرّاء، قرآن مترجم بنص حي، أذكار/رقية/تكبيرات، قرآن النوم
// v56 — الصوت لا يتوقف عند مغادرة الصفحة (محرّك RadioService مستقل)، مع مؤقّت نوم 🌙
// v1.0.74 — تبويب القرّاء: صورة كل قارئ، والضغط عليه يُظهر «بث مباشر» و«اختيار سورة»
//           (قائمة السور + بحث). تبويب المترجم: بند واحد «اختيار القارئ» وتحته السور،
//           والترجمة تظهر في البطاقة متزامنة مع التلاوة. خيارات تكرار في بطاقة التشغيل.
const RadioPage = {
  tab: 'main',
  open: null,          // القارئ الموسَّع في تبويب القرّاء
  openMode: null,      // null | 'surah'
  rcSearch: '',
  tl: { rid: 'dosari', lang: null, search: '', picker: false },
  _sleepModal: null,

  TABS: [
    { id: 'main', key: 'tabMain', icon: 'fa-tower-broadcast' },
    { id: 'reciters', key: 'tabReciters', icon: 'fa-microphone-lines' },
    { id: 'translated', key: 'tabTranslated', icon: 'fa-language' },
    { id: 'extra', key: 'tabExtra', icon: 'fa-moon' },
    { id: 'sleep', key: 'tabSleep', icon: 'fa-bed' },
  ],

  _loc() { return (typeof currentLocale !== 'undefined' && currentLocale) || 'es'; },

  async render(container, params = {}) {
    this.tab = params.tab || 'main';
    if (!this.tl.lang) this.tl.lang = this._loc() === 'en' ? 'en' : 'es';
    container.innerHTML = `
      <div class="top-bar">
        <button class="top-bar-btn" onclick="Router.back()" aria-label="back">
          <i class="fas fa-chevron-${this._loc() === 'ar' ? 'right' : 'left'}"></i>
        </button>
        <div class="top-bar-title"><i class="fas fa-radio"></i> ${RadioData.L('radioTitle')}</div>
        <div class="radio-top-actions">
          <button class="top-bar-btn radio-top-btn" onclick="RadioPage.openFavSheet()" aria-label="${RadioData.L('favTitle')}">
            <i class="fas fa-heart"></i><span class="rtb-badge" id="rtb-fav-b" style="display:none">0</span>
          </button>
          <button class="top-bar-btn radio-top-btn" onclick="RadioPage.openDlSheet()" aria-label="${RadioData.L('dlTitle')}">
            <i class="fas fa-circle-down"></i><span class="rtb-badge" id="rtb-dl-b" style="display:none">0</span>
          </button>
        </div>
      </div>

      <div class="radio-tabs" id="radio-tabs">
        ${this.TABS.map(tb => `
          <button class="radio-tab ${this.tab === tb.id ? 'active' : ''}" data-tab="${tb.id}" onclick="RadioPage.switchTab('${tb.id}')">
            <i class="fas ${tb.icon}"></i> ${RadioData.L(tb.key)}
          </button>`).join('')}
      </div>

      <div id="radio-hero-slot"></div>
      <div id="radio-body" style="padding: var(--sp-md);"></div>
    `;
    this._renderHero();
    this._renderBody();
    RadioService._updateBar();
    this._updateTopBadges();
  },

  switchTab(tab) {
    this.tab = tab;
    document.querySelectorAll('.radio-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    if (!RadioService.mode || RadioService.state === 'idle' || RadioService.state === 'error') this._renderHero();
    this._renderBody();
  },

  // ---------- البطاقة الرئيسية (Hero) ----------
  _heroState() {
    const S = RadioService;
    if (S.mode === 'quran' && S.quran) {
      const q = S.quran;
      const chip = q.sleep ? RadioData.L('tabSleep') : (q.lang ? RadioData.L('tabTranslated') : RadioData.L('tabReciters'));
      return {
        kind: 'quran', img: q.lang ? null : RadioData.IMG.quran, chip,
        title: RadioData.surahName(q.surah),
        sub: q.lang ? `${q.reciterName} • ${RadioData.L('ayah')} ${q.ayah || 1} ${RadioData.L('of')} ${q.total}`
                    : `${q.reciterName} • ${q.total} ${RadioData.L('ayah')}`,
        liveTL: !!q.lang, avatar: RadioData.reciter(q.rid),
      };
    }
    if (S.mode === 'stream' && S.station) {
      const st = S.station;
      return {
        kind: 'stream', img: RadioData.imgUrl(st.img) || RadioData.IMG.kaaba,
        chip: st.rid ? RadioData.L(st.k || 'liveStream') : RadioData.L('live'),
        title: RadioData.name(st), sub: RadioData.L('nowPlaying'), liveTL: false,
        avatar: st.rid ? RadioData.reciter(st.rid) : null,
      };
    }
    if (this.tab === 'translated' || this.tab === 'sleep') {
      const isSleep = this.tab === 'sleep';
      return {
        kind: 'idle', img: RadioData.IMG.quran2, chip: RadioData.L(isSleep ? 'tabSleep' : 'tabTranslated'),
        title: RadioData.surahName(isSleep ? RadioData.SLEEP_SURAHS[0] : 1),
        sub: isSleep ? RadioData.L('tapToListen') : RadioData.name(RadioData.reciter(this.tl.rid) || RadioData.RECITERS[0]),
        liveTL: false, avatar: isSleep ? null : RadioData.reciter(this.tl.rid),
      };
    }
    if (this.tab === 'reciters') {
      const r = RadioData.reciter(this.open) || RadioData.RECITERS[0];
      return { kind: 'idle', img: RadioData.IMG.kaaba2, chip: RadioData.L('tabReciters'), title: RadioData.name(r), sub: RadioData.L('tapToListen'), liveTL: false, avatar: r };
    }
    const st = this.tab === 'extra' ? RadioData.EXTRA[0] : RadioData.MAIN[0];
    const chipKey = { main: 'tabMain', extra: 'tabExtra' }[this.tab] || 'tabMain';
    return { kind: 'idle', img: RadioData.imgUrl(st.img), chip: RadioData.L(chipKey), title: RadioData.name(st), sub: RadioData.L('tapToListen'), liveTL: false };
  },

  _renderHero() {
    const slot = document.getElementById('radio-hero-slot');
    if (!slot) return;
    const S = RadioService;
    const h = this._heroState();
    const playing = S.state === 'playing';
    const loading = S.state === 'loading';
    const q = S.mode === 'quran' ? S.quran : null;
    const sleepLeft = S.sleepLeftSec();
    const REP = [['off', 'fa-ban'], ['one', 'fa-repeat'], ['all', 'fa-infinity'], ['random', 'fa-shuffle']];

    slot.innerHTML = `
      <div class="radio-hero ${h.liveTL ? 'tl-mode' : ''}" ${h.img ? `style="background-image:${RadioData.bgImage(h.img)}"` : ''}>
        <div class="radio-hero-overlay"></div>
        <div class="radio-hero-content">
          ${h.avatar ? `<div class="radio-hero-av">${RadioData.avatarHtml(h.avatar, 'rh-av')}</div>` : `
          <div class="radio-wave ${playing ? 'on' : ''}" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>`}
          <div class="radio-hero-chip">${h.chip}</div>
          <div class="radio-hero-title">${escapeHtml(h.title)}</div>
          <div class="radio-hero-sub">${loading ? RadioData.L('loading') : escapeHtml(h.sub)}</div>

          ${h.liveTL ? `<div class="radio-live-tl" id="radio-live-tl">${this._liveTlHtml()}</div>` : ''}

          <div class="radio-controls">
            <button class="radio-ctl side" onclick="RadioService.share()" title="${RadioData.L('share')}" aria-label="${RadioData.L('share')}">
              <i class="fas fa-share-nodes"></i>
            </button>
            ${q ? `
              <button class="radio-ctl side" onclick="RadioService.prevAyah()" title="${RadioData.L('prevAyah')}" aria-label="${RadioData.L('prevAyah')}">
                <i class="fas fa-backward-step"></i>
              </button>` : ''}
            <button class="radio-ctl main ${loading ? 'loading' : ''}" onclick="RadioPage._mainAction()" aria-label="play/pause">
              <i class="fas ${loading ? 'fa-circle-notch fa-spin' : (playing ? 'fa-pause' : 'fa-play')}"></i>
            </button>
            ${q ? `
              <button class="radio-ctl side" onclick="RadioService.nextAyah()" title="${RadioData.L('nextAyah')}" aria-label="${RadioData.L('nextAyah')}">
                <i class="fas fa-forward-step"></i>
              </button>` : ''}
            ${q && q.lang ? `
              <button class="radio-ctl side" onclick="RadioService.replayAyah()" title="${RadioData.L('replayAyah')}" aria-label="${RadioData.L('replayAyah')}">
                <i class="fas fa-rotate-right"></i>
              </button>` : ''}
            ${q && q.lang && !q.whole ? `
              <button class="radio-ctl side ${S._trVoiceEnabled() ? 'sleep-on' : ''}" onclick="RadioPage.toggleVoiceTr()" title="${RadioData.L('voiceTr')}" aria-label="${RadioData.L('voiceTr')}">
                <i class="fas ${S._trVoiceEnabled() ? 'fa-volume-high' : 'fa-volume-xmark'}"></i>
              </button>` : ''}
            <button class="radio-ctl side ${sleepLeft > 0 ? 'sleep-on' : ''}" onclick="RadioPage.openSleepModal()" title="${RadioData.L('sleepTimer')}" aria-label="${RadioData.L('sleepTimer')}">
              <i class="fas fa-moon"></i>
            </button>
          </div>

          ${q && !q.sleep ? `
            <div class="radio-rep-row" role="group" aria-label="${RadioData.L('repeatMode')}">
              <span class="rr-label"><i class="fas fa-repeat"></i> ${RadioData.L('repeatMode')}</span>
              ${REP.map(([m, ic]) => `
                <button class="rr-chip ${S.repeatMode === m ? 'on' : ''}" onclick="RadioService.setRepeat('${m}')" aria-pressed="${S.repeatMode === m}">
                  <i class="fas ${ic}"></i> ${RadioData.L('rep_' + m + '_s')}
                </button>`).join('')}
              <button class="rr-chip rr-dl" onclick="RadioPage.downloadCurrent()" title="${RadioData.L('download')}"><i class="fas fa-download"></i></button>
            </div>` : ''}

          ${sleepLeft > 0 ? `
            <div class="radio-sleep-chip" id="radio-sleep-chip">
              <i class="fas fa-moon"></i> ${RadioData.L('sleepActive')}: <b>${this._fmtSec(sleepLeft)}</b>
            </div>` : ''}

          <div class="radio-bg-note"><i class="fas fa-headphones"></i> ${RadioData.L('continueBg')}</div>
        </div>
      </div>
    `;
    this._heroSig = this._sig();
  },

  // توقيع الحالة: لإعادة رسم البطاقة فقط عند تغيّر فعلي (لا مع كل نبضة)
  _sig() {
    const S = RadioService, q = S.quran;
    return [S.state, S.mode, S.station && S.station.id, q && q.rid, q && q.surah, q && q.lang, q && q.whole,
            S.repeatMode, S.sleepLeftSec() > 0 ? Math.floor(S.sleepLeftSec() / 5) : -1, this.tab,
            S._trVoiceEnabled && S._trVoiceEnabled()].join('|');
  },

  _liveTlHtml() {
    const q = RadioService.quran;
    if (!q) return '';
    const n = q.ayah || 1;
    const ar = RadioData.arabicAyah(q.surah, n);
    const tr = q.tr && q.tr[n] ? q.tr[n] : '…';
    const syncKey = !q.whole || q.tmExact ? 'syncExact' : 'syncApprox';
    return `
      <div class="tl-label"><i class="fas fa-language"></i> ${RadioData.L('liveTranslation')} • ${RadioData.L('ayah')} ${n}/${q.total}</div>
      <div class="tl-ar" dir="rtl">${escapeHtml(ar)}</div>
      <div class="tl-tr" dir="ltr">${escapeHtml(tr)}</div>
      <div class="tl-sync ${syncKey === 'syncApprox' ? 'approx' : ''}"><i class="fas ${syncKey === 'syncApprox' ? 'fa-wave-square' : 'fa-check'}"></i> ${RadioData.L(syncKey)}</div>
    `;
  },

  _mainAction() {
    const S = RadioService;
    if (!S.mode || S.state === 'idle') {
      if (this.tab === 'sleep') { this.playSleep(null); return; }
      if (this.tab === 'translated') { this.playTranslated(RadioData.surahsFor(RadioData.reciter(this.tl.rid))[0] || 1); return; }
      if (this.tab === 'reciters') {
        const r = RadioData.reciter(this.open) || RadioData.RECITERS[0];
        if (r.live && r.live.length) this.playLive(r.id, 0); else this.playReciterSurah(r.id, RadioData.surahsFor(r)[0]);
        return;
      }
      this.playStation(this.tab === 'extra' ? RadioData.EXTRA[0].id : RadioData.MAIN[0].id);
      return;
    }
    S.toggle();
  },

  onPlayerUpdate() {
    if (this._sig() !== this._heroSig) this._renderHero();
    else {
      const tlBox = document.getElementById('radio-live-tl');
      if (tlBox && RadioService.mode === 'quran') {
        const q = RadioService.quran;
        const k = q ? q.surah + ':' + q.ayah + ':' + (q.tr ? 1 : 0) + ':' + (q.tmExact ? 1 : 0) : '';
        if (tlBox._k !== k) { tlBox.innerHTML = this._liveTlHtml(); tlBox._k = k; }
      }
      const sub = document.querySelector('.radio-hero-sub');
      const h = this._heroState();
      if (sub && RadioService.state !== 'loading') sub.textContent = h.sub;
    }
    const S = RadioService;
    document.querySelectorAll('.station-card').forEach(card => {
      const cur = S.station && S.station.id === card.dataset.stationId && S.state !== 'idle';
      card.classList.toggle('active', !!cur);
    });
    document.querySelectorAll('.surah-row').forEach(row => {
      const n = parseInt(row.dataset.surah, 10);
      const rid = row.dataset.rid;
      const cur = S.mode === 'quran' && S.quran && S.quran.surah === n && (!rid || S.quran.rid === rid);
      row.classList.toggle('active', !!cur);
      const ic = row.querySelector('.surah-play-ic');
      if (ic) ic.className = 'fas ' + (cur ? 'fa-volume-high' : 'fa-play') + ' surah-play-ic';
    });
    document.querySelectorAll('.rc-card').forEach(c => {
      const id = c.dataset.rid;
      const cur = (S.mode === 'quran' && S.quran && S.quran.rid === id) || (S.mode === 'stream' && S.station && S.station.rid === id);
      c.classList.toggle('playing', !!cur && S.state !== 'idle');
    });
  },

  // ---------- جسم الصفحة حسب التبويب ----------
  _renderBody() {
    const body = document.getElementById('radio-body');
    if (!body) return;
    if (this.tab === 'translated') { this._renderTranslated(body); return; }
    if (this.tab === 'sleep') { this._renderSleep(body); return; }
    if (this.tab === 'reciters') { this._renderReciters(body); return; }
    const list = this.tab === 'extra' ? RadioData.EXTRA : RadioData.MAIN;
    body.innerHTML = list.map(st => {
      const cur = RadioService.station && RadioService.station.id === st.id && RadioService.state !== 'idle';
      return `
        <div class="station-card ${cur ? 'active' : ''}" data-station-id="${st.id}" style="background-image:${RadioData.bgImage(RadioData.imgUrl(st.img) || RadioData.IMG.kaaba)}" onclick="RadioPage.playStation('${st.id}')">
          <div class="station-overlay"></div>
          <button class="st-fav ${RadioLib.isFav({ t: 'station', stId: st.id }) ? 'on' : ''}" onclick="event.stopPropagation();RadioPage.favStation('${st.id}')" aria-label="${RadioData.L('favAdd')}"><i class="fas fa-heart"></i></button>
          <div class="station-info">
            <div class="station-name">${st.badge ? st.badge + ' ' : ''}${escapeHtml(RadioData.name(st))}</div>
            <div class="station-desc">${st.descKey ? RadioData.L(st.descKey) : (cur ? RadioData.L('nowPlaying') : RadioData.L('tapToListen'))}</div>
          </div>
          <div class="station-eq ${cur && RadioService.state === 'playing' ? 'on' : ''}"><i></i><i></i><i></i></div>
        </div>`;
    }).join('');
  },

  playStation(id) {
    const st = RadioData.MAIN.concat(RadioData.EXTRA).find(s => s.id === id);
    if (!st) return;
    if (RadioService.station && RadioService.station.id === st.id && RadioService.mode === 'stream' && RadioService.state !== 'error') {
      RadioService.toggle();
      return;
    }
    RadioService.playStream(st);
  },

  // ---------- تبويب القرّاء ----------
  _renderReciters(body) {
    const S = RadioService;
    body.innerHTML = `<div class="rc-list">${RadioData.RECITERS.map(r => {
      const isOpen = this.open === r.id;
      const cur = (S.mode === 'quran' && S.quran && S.quran.rid === r.id) || (S.mode === 'stream' && S.station && S.station.rid === r.id);
      const n = RadioData.surahsFor(r).length;
      return `
        <div class="rc-card ${isOpen ? 'open' : ''} ${cur && S.state !== 'idle' ? 'playing' : ''}" data-rid="${r.id}">
          <button class="rc-head" onclick="RadioPage.toggleReciter('${r.id}')" aria-expanded="${isOpen}">
            ${RadioData.avatarHtml(r)}
            <span class="rc-names">
              <span class="rc-name">${escapeHtml(RadioData.name(r))}</span>
              <span class="rc-meta">${n} ${RadioData.L('surahsCount')}${r.live && r.live.length ? ' • <i class="fas fa-tower-broadcast"></i> ' + RadioData.L('live') : ''}</span>
            </span>
            <span class="rc-fav ${RadioLib.isFav({ t: 'reciter', rid: r.id }) ? 'on' : ''}" role="button" tabindex="0" onclick="event.stopPropagation();RadioPage.favReciter('${r.id}')" aria-label="${RadioData.L('favAdd')}"><i class="fas fa-heart"></i></span>
            <span class="station-eq rc-eq ${cur && S.state === 'playing' ? 'on' : ''}"><i></i><i></i><i></i></span>
            <i class="fas fa-chevron-down rc-chev"></i>
          </button>
          ${isOpen ? this._reciterOptions(r) : ''}
        </div>`;
    }).join('')}</div>`;
  },

  _reciterOptions(r) {
    const lives = (r.live || []).map((lv, i) => `
      <button class="rc-opt ${RadioService.station && RadioService.station.id === r.id + '_live' + i && RadioService.mode === 'stream' ? 'on' : ''}" onclick="RadioPage.playLive('${r.id}', ${i})">
        <i class="fas fa-tower-broadcast"></i> ${RadioData.L(lv.k || 'liveStream')}
      </button>`).join('');
    return `
      <div class="rc-opts">
        ${lives || `<div class="rc-nolive"><i class="fas fa-circle-info"></i> ${RadioData.L('noLive')}</div>`}
        <button class="rc-opt ${this.openMode === 'surah' ? 'on' : ''}" onclick="RadioPage.toggleSurahPicker('${r.id}')">
          <i class="fas fa-list-ol"></i> ${RadioData.L('pickSurah')}
        </button>
        <button class="rc-opt rc-dlall" onclick="RadioPage.dlAll('${r.id}')">
          <i class="fas fa-cloud-arrow-down"></i> ${RadioData.L('dlAllSurahs')} • ${RadioData.surahsFor(r).filter(n => !RadioLib.has(r.id, n)).length}
        </button>
      </div>
      <div class="rc-dlbox" id="rc-dlbox">${this._dlAllHtml(r.id)}</div>
      ${this.openMode === 'surah' ? `
        <div class="rc-surahs">
          <div class="tl-search">
            <i class="fas fa-search"></i>
            <input type="search" id="rc-search-input" placeholder="${RadioData.L('searchSurah')}" value="${escapeHtml(this.rcSearch)}" oninput="RadioPage.rcSearchInput(this.value)">
          </div>
          <div class="surah-list" id="rc-surah-list">${this._surahRows(r, this.rcSearch, `RadioPage.playReciterSurah('${r.id}', %N%)`)}</div>
        </div>` : ''}
    `;
  },

  _matchSurah(s, qx) {
    if (!qx) return true;
    const l = qx.toLowerCase().trim();
    const norm = (t) => String(t).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
    return String(s[0]) === l || norm(s[1]).includes(norm(qx.trim())) || s[2].toLowerCase().includes(l) || s[3].toLowerCase().includes(l);
  },

  _surahRows(r, search, onclickTpl) {
    const S = RadioService;
    const avail = RadioData.surahsFor(r);
    const rows = RadioData.SURAHS.filter(s => avail.indexOf(s[0]) >= 0 && this._matchSurah(s, search));
    const loc = this._loc();
    return rows.map(s => {
      const cur = S.mode === 'quran' && S.quran && S.quran.surah === s[0] && S.quran.rid === r.id;
      const nm = loc === 'ar' ? s[1] : (loc === 'en' ? s[3] : s[2]);
      return `
        <div class="surah-row ${cur ? 'active' : ''}" data-surah="${s[0]}" data-rid="${r.id}" onclick="${onclickTpl.replace('%N%', s[0])}">
          <span class="surah-num">${s[0]}</span>
          <div class="surah-names">
            <div class="surah-name">${escapeHtml(nm)}</div>
            <div class="surah-meta">${s[1]} • ${s[4]} ${RadioData.L('ayah')}</div>
          </div>
          ${this._surahActions(r.id, s[0])}
          <i class="fas ${cur ? 'fa-volume-high' : 'fa-play'} surah-play-ic"></i>
        </div>`;
    }).join('') || `<div class="tl-note">—</div>`;
  },

  toggleReciter(id) {
    if (this.open === id) { this.open = null; this.openMode = null; }
    else { this.open = id; this.openMode = null; this.rcSearch = ''; }
    this._renderBody();
    if (!RadioService.mode || RadioService.state === 'idle') this._renderHero();
    const el = document.querySelector(`.rc-card[data-rid="${id}"]`);
    if (el && this.open) setTimeout(() => el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30);
  },

  toggleSurahPicker(id) {
    this.open = id;
    this.openMode = this.openMode === 'surah' ? null : 'surah';
    this._renderBody();
  },

  rcSearchInput(v) {
    this.rcSearch = v || '';
    const r = RadioData.reciter(this.open);
    const box = document.getElementById('rc-surah-list');
    if (box && r) box.innerHTML = this._surahRows(r, this.rcSearch, `RadioPage.playReciterSurah('${r.id}', %N%)`);
  },

  playLive(rid, i) {
    const r = RadioData.reciter(rid);
    const st = RadioData.liveStation(r, i);
    if (!st) return;
    if (RadioService.mode === 'stream' && RadioService.station && RadioService.station.id === st.id && RadioService.state !== 'error') {
      RadioService.toggle();
    } else {
      RadioService.playStream(st);
    }
    this._renderBody();
  },

  playReciterSurah(rid, n) {
    const S = RadioService;
    if (S.mode === 'quran' && S.quran && S.quran.rid === rid && S.quran.surah === n && !S.quran.lang && !S.quran.sleep) { S.toggle(); return; }
    S.playQuran({ rid, surah: n, lang: null, prefer: 'whole' });
  },

  // ---------- تبويب القرآن المترجم ----------
  _renderTranslated(body) {
    const r = RadioData.reciter(this.tl.rid) || RadioData.RECITERS[0];
    const exact = !!(r.ea || r.read);
    body.innerHTML = `
      <div class="tl-note"><i class="fas fa-circle-info"></i> ${RadioData.L('translationNote')}</div>

      <div class="tl-group-label">${RadioData.L('chooseReciter')}</div>
      <button class="tl-reciter-sel ${this.tl.picker ? 'open' : ''}" onclick="RadioPage.toggleTlPicker()" aria-expanded="${this.tl.picker}">
        ${RadioData.avatarHtml(r)}
        <span class="rc-names">
          <span class="rc-name">${escapeHtml(RadioData.name(r))}</span>
          <span class="rc-meta">${RadioData.surahsFor(r).length} ${RadioData.L('surahsCount')} • ${RadioData.L(exact ? 'syncExact' : 'syncApprox')}</span>
        </span>
        <i class="fas fa-chevron-down rc-chev"></i>
      </button>
      ${this.tl.picker ? `
        <div class="tl-reciter-grid">
          ${RadioData.RECITERS.map(x => `
            <button class="tl-rg-item ${x.id === r.id ? 'on' : ''}" onclick="RadioPage.setTlReciter('${x.id}')">
              ${RadioData.avatarHtml(x, 'rc-av sm')}
              <span>${escapeHtml(RadioData.name(x))}</span>
            </button>`).join('')}
        </div>` : ''}

      <div class="tl-group-label">${RadioData.L('chooseLang')}</div>
      <div class="tl-chips">
        <button class="tl-chip ${this.tl.lang === 'es' ? 'active' : ''}" onclick="RadioPage.setTlLang('es')"><i class="fas fa-language"></i> ${RadioData.L('spanish')}</button>
        <button class="tl-chip ${this.tl.lang === 'en' ? 'active' : ''}" onclick="RadioPage.setTlLang('en')"><i class="fas fa-language"></i> ${RadioData.L('english')}</button>
      </div>

      <div class="tl-group-label">${RadioData.L('reciterSurahs')} — ${escapeHtml(RadioData.name(r))}</div>
      <div class="tl-search">
        <i class="fas fa-search"></i>
        <input type="search" id="tl-search-input" placeholder="${RadioData.L('searchSurah')}" value="${escapeHtml(this.tl.search)}" oninput="RadioPage.tlSearch(this.value)">
      </div>
      <div class="surah-list" id="tl-surah-list">${this._tlRows(r)}</div>
    `;
  },

  _tlRows(r) {
    const S = RadioService;
    const avail = RadioData.surahsFor(r);
    const loc = this._loc();
    return RadioData.SURAHS.filter(s => avail.indexOf(s[0]) >= 0 && this._matchSurah(s, this.tl.search)).map(s => {
      const cur = S.mode === 'quran' && S.quran && S.quran.lang && S.quran.surah === s[0] && S.quran.rid === r.id;
      const nm = loc === 'ar' ? s[1] : (loc === 'en' ? s[3] : s[2]);
      return `
        <div class="surah-row ${cur ? 'active' : ''}" data-surah="${s[0]}" data-rid="${r.id}" onclick="RadioPage.playTranslated(${s[0]})">
          <span class="surah-num">${s[0]}</span>
          <div class="surah-names">
            <div class="surah-name">${escapeHtml(nm)}</div>
            <div class="surah-meta">${s[1]} • ${s[4]} ${RadioData.L('ayah')}</div>
          </div>
          ${this._surahActions(r.id, s[0])}
          <i class="fas ${cur ? 'fa-volume-high' : 'fa-play'} surah-play-ic"></i>
        </div>`;
    }).join('') || `<div class="tl-note">—</div>`;
  },

  toggleTlPicker() { this.tl.picker = !this.tl.picker; this._renderBody(); },

  setTlReciter(rid) {
    this.tl.rid = rid;
    this.tl.picker = false;
    this._renderBody();
    if (!RadioService.mode || RadioService.state === 'idle') this._renderHero();
  },

  setTlLang(lang) {
    this.tl.lang = lang;
    const q = RadioService.quran;
    // تغيير اللغة أثناء التشغيل: تُبدَّل الترجمة فوراً دون إيقاف التلاوة
    if (RadioService.mode === 'quran' && q && q.lang && q.lang !== lang) {
      q.lang = lang; q.tr = null;
      RadioData.getTranslation(q.surah, lang).then(map => { if (RadioService.quran === q) { q.tr = map; RadioService._emit(); } }).catch(() => {});
    }
    this._renderBody();
  },

  tlSearch(v) {
    this.tl.search = v || '';
    const r = RadioData.reciter(this.tl.rid) || RadioData.RECITERS[0];
    const box = document.getElementById('tl-surah-list');
    if (box) box.innerHTML = this._tlRows(r);
  },

  playTranslated(surah) {
    const S = RadioService;
    if (S.mode === 'quran' && S.quran && S.quran.lang && S.quran.surah === surah && S.quran.rid === this.tl.rid) {
      if (S.quran.lang !== this.tl.lang) this.setTlLang(this.tl.lang);
      S.toggle();
      return;
    }
    S.playQuran({ rid: this.tl.rid, surah, lang: this.tl.lang });
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  },

  // ---------- تحميل ملف السورة الجارية ----------
  async downloadCurrent() {
    const q = RadioService.quran;
    if (!q) return;
    const r = RadioData.reciter(q.rid);
    const url = RadioData.surahFileUrl(r, q.surah);
    if (!url) return;
    if (typeof showToast === 'function') showToast('⏳ ' + RadioData.L('downloadingAudio'), 2500);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('http ' + res.status);
      const blob = await res.blob();
      const info = RadioData.surahInfo(q.surah);
      const name = `${String(q.surah).padStart(3, '0')}_${info.en.replace(/[^A-Za-z0-9-]+/g, '_')}_${r.id}.mp3`;
      if (typeof QuranOfflineService !== 'undefined' && QuranOfflineService._triggerBlobDownload) QuranOfflineService._triggerBlobDownload(blob, name);
      if (typeof showToast === 'function') showToast('💾 ' + RadioData.L('downloadDone'), 2500);
    } catch (e) {
      if (typeof showToast === 'function') showToast('⚠️ ' + RadioData.L('downloadFail'), 2500);
    }
  },

  // ---------- تبويب قرآن قبل النوم (مع أصوات خلفية لطيفة) ----------
  _renderSleep(body) {
    const S = RadioService;
    const AMBIENTS = [
      { id: 'rain',  icon: 'fa-cloud-rain' },
      { id: 'waves', icon: 'fa-water' },
      { id: 'wind',  icon: 'fa-wind' },
      { id: 'white', icon: 'fa-fan' },
    ];
    const loc = this._loc();
    body.innerHTML = `
      <div class="tl-note"><i class="fas fa-bed"></i> ${RadioData.L('sleepHint')}</div>
      <button class="btn-primary sleep-play-all" onclick="RadioPage.playSleep(null)">
        <i class="fas fa-play"></i> ${RadioData.L('sleepPlayAll')}
      </button>
      <div class="tl-group-label">${RadioData.L('chooseSurah')}</div>
      <div class="surah-list">
        ${RadioData.SLEEP_SURAHS.map(n => {
          const info = RadioData.surahInfo(n);
          const cur = S.mode === 'quran' && S.quran && S.quran.sleep && S.quran.surah === n;
          const nm = loc === 'ar' ? info.ar : (loc === 'en' ? info.en : info.es);
          return `
            <div class="surah-row ${cur ? 'active' : ''}" data-surah="${n}" onclick="RadioPage.playSleep(${n})">
              <span class="surah-num">${n}</span>
              <div class="surah-names">
                <div class="surah-name">${escapeHtml(nm)}</div>
                <div class="surah-meta">${info.ar} • ${info.ayahs} ${RadioData.L('ayah')}</div>
              </div>
              ${this._surahActions(RadioData.SLEEP_RECITER, n)}
              <i class="fas ${cur ? 'fa-volume-high' : 'fa-play'} surah-play-ic"></i>
            </div>`;
        }).join('')}
      </div>
      <div class="tl-group-label">${RadioData.L('ambTitle')}</div>
      <div class="tl-chips">
        ${AMBIENTS.map(a => `
          <button class="tl-chip ${S.amb.on && S.amb.type === a.id ? 'active' : ''}" onclick="RadioPage.toggleAmb('${a.id}')">
            <i class="fas ${a.icon}"></i> ${RadioData.L('amb_' + a.id)}
          </button>`).join('')}
        ${S.amb.on ? `<button class="tl-chip" onclick="RadioPage.stopAmb()"><i class="fas fa-xmark"></i> ${RadioData.L('ambOff')}</button>` : ''}
      </div>
      ${S.amb.on ? `
        <div class="amb-vol-row">
          <i class="fas fa-volume-low"></i>
          <input type="range" min="0" max="60" value="${Math.round(S.amb.vol * 100)}" oninput="RadioService.setAmbienceVolume(this.value / 100)">
          <i class="fas fa-volume-high"></i>
        </div>` : ''}
      <div class="tl-note" style="margin-top:10px;"><i class="fas fa-moon"></i> ${RadioData.L('sleepTimer')}: ${RadioData.L('stopsAtEnd')}</div>
    `;
  },

  playSleep(surah) {
    const list = RadioData.SLEEP_SURAHS;
    const S = RadioService;
    if (surah && S.mode === 'quran' && S.quran && S.quran.sleep && S.quran.surah === surah) { S.toggle(); return; }
    const idx = Math.max(0, surah ? list.indexOf(surah) : 0);
    S.playQuran({ rid: RadioData.SLEEP_RECITER, surah: list[idx], lang: null, playlist: list.slice(idx), sleep: true, prefer: 'whole' });
  },

  toggleAmb(type) {
    RadioService.toggleAmbience(type);
    this._renderBody();
  },

  stopAmb() {
    RadioService.stopAmbience();
    this._renderBody();
  },

  // ---------- مؤقّت النوم ----------
  openSleepModal() {
    const OPTIONS = [0, 5, 10, 20, 30, 40, 60];
    const left = RadioService.sleepLeftSec();
    const overlay = document.createElement('div');
    overlay.className = 'sleep-modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) this.closeSleepModal(); };
    overlay.innerHTML = `
      <div class="sleep-modal">
        <div class="sleep-modal-head">
          <i class="fas fa-moon"></i> ${RadioData.L('sleepTimer')}
          <button class="sleep-close" onclick="RadioPage.closeSleepModal()">×</button>
        </div>
        <div class="sleep-modal-sub">${RadioData.L('stopsAtEnd')}</div>
        <div class="sleep-options">
          ${OPTIONS.map(m => `
            <button class="sleep-opt ${(m === 0 && left < 0) || (m > 0 && RadioService.sleep.minutes === m) ? 'active' : ''}" onclick="RadioPage.applySleep(${m})">
              ${m === 0 ? RadioData.L('sleepOff') : m + ' ' + RadioData.L('sleepMin')}
            </button>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._sleepModal = overlay;
  },

  applySleep(min) {
    RadioService.setSleep(min);
    this.closeSleepModal();
  },

  closeSleepModal() {
    if (this._sleepModal) { this._sleepModal.remove(); this._sleepModal = null; }
  },

  // v64: زر الترجمة الصوتية في بطاقة «قرآن مترجم» — يبدّل الإعداد العام
  toggleVoiceTr() {
    try {
      if (typeof AppState === 'undefined') return;
      AppState.settings.quranVoiceTranslation = !AppState.settings.quranVoiceTranslation;
      if (typeof Storage !== 'undefined' && Storage.saveSettings) Storage.saveSettings();
      if (!AppState.settings.quranVoiceTranslation && RadioService._stopTrAudio) RadioService._stopTrAudio();
      if (typeof showToast === 'function') showToast('🔊 ' + RadioData.L(AppState.settings.quranVoiceTranslation ? 'voiceTrOn' : 'voiceTrOff'), 2200);
    } catch (e) {}
    this._renderHero();
  },

  // ================= v1.0.126: التنزيلات + المفضلة =================
  _surahActions(rid, n) {
    const fav = RadioLib.isFav({ t: 'quran', rid, surah: n });
    const has = RadioLib.has(rid, n);
    return `<span class="srx-wrap">
            <button class="srx ${fav ? 'on' : ''}" onclick="event.stopPropagation();RadioPage.favSurah('${rid}',${n})" aria-label="${RadioData.L(fav ? 'favRemove' : 'favAdd')}"><i class="fas fa-heart"></i></button>
            <button class="srx ${has ? 'done' : ''}" onclick="event.stopPropagation();RadioPage.dlSurah('${rid}',${n})" aria-label="${RadioData.L('download')}"><i class="fas fa-${has ? 'circle-check' : 'arrow-down'}"></i></button>
          </span>`;
  },

  _toastFav(added) {
    if (typeof showToast === 'function') showToast((added ? '❤️ ' : '🤍 ') + RadioData.L(added ? 'favAdded' : 'favRemoved'), 1600);
  },

  favSurah(rid, n) {
    this._toastFav(RadioLib.toggleFav({ t: 'quran', rid, surah: Number(n) }));
    this._renderBody(); this._updateTopBadges();
  },
  favReciter(rid) {
    this._toastFav(RadioLib.toggleFav({ t: 'reciter', rid }));
    this._renderBody(); this._updateTopBadges();
  },
  favStation(stId) {
    const inExtra = RadioData.EXTRA.some(x => x.id === stId);
    this._toastFav(RadioLib.toggleFav({ t: 'station', stId, tab: inExtra ? 'extra' : 'main' }));
    this._renderBody(); this._updateTopBadges();
  },

  async dlSurah(rid, n) {
    if (RadioLib.has(rid, n)) {
      if (typeof showToast === 'function') showToast('✔ ' + RadioData.L('dlAlready'), 1600);
      return;
    }
    if (typeof showToast === 'function') showToast('⏳ ' + RadioData.L('downloadingAudio'), 2500);
    const bytes = await RadioLib.save(rid, n);
    if (typeof showToast === 'function') showToast(bytes ? '💾 ' + RadioData.L('downloadDone') : '⚠️ ' + RadioData.L('downloadFail'), 2500);
    this._renderBody(); this._updateTopBadges();
  },

  _dlAllHtml(rid) {
    const d = this._dlAll;
    if (!d || d.rid !== rid) return '';
    const pct = Math.min(100, Math.round((d.i / Math.max(1, d.total)) * 100));
    if (!d.running) {
      return `<div class="rc-dlbar"><span style="width:100%"></span></div>
        <div class="rc-dlmeta"><span>${d.total} / ${d.total}</span><span class="rc-dldone"><i class="fas fa-check"></i> ${RadioData.L('dlAllDone')}</span></div>`;
    }
    return `<div class="rc-dlbar"><span style="width:${pct}%"></span></div>
      <div class="rc-dlmeta"><span>${d.i} / ${d.total} • ${RadioLib.size(d.bytes)}</span>
      <button class="rc-dlcancel" onclick="RadioPage.dlAllCancel()">${RadioData.L('dlCancel')}</button></div>`;
  },

  _dlAllPaint(rid) {
    const box = document.getElementById('rc-dlbox');
    if (box && this._dlAll && this._dlAll.rid === rid) box.innerHTML = this._dlAllHtml(rid);
  },

  async dlAll(rid) {
    const r = RadioData.reciter(rid);
    if (!r) return;
    if (this._dlAll && this._dlAll.running) return;
    const list = RadioData.surahsFor(r).filter(n => !RadioLib.has(rid, n));
    if (!list.length) {
      if (typeof showToast === 'function') showToast('✔ ' + RadioData.L('dlAllDone'), 2000);
      return;
    }
    this._dlAll = { rid, i: 0, total: list.length, bytes: 0, running: true, cancel: false };
    this._dlAllPaint(rid);
    let done = 0, failed = 0;
    for (let i = 0; i < list.length; i++) {
      if (this._dlAll.cancel) break;
      const bytes = await RadioLib.save(rid, list[i]);
      if (bytes) { this._dlAll.bytes += bytes; done++; } else failed++;
      this._dlAll.i = i + 1;
      this._dlAllPaint(rid);
      if (i % 5 === 0) this._updateTopBadges();
    }
    const stopped = this._dlAll.cancel;
    this._dlAll.running = false;
    this._dlAll.i = done;
    this._dlAll.total = done;
    this._dlAllPaint(rid);
    if (typeof showToast === 'function') {
      let msg = stopped ? '⏹ ' + RadioData.L('dlStopped')
        : '✔ ' + RadioData.L('dlAllDone') + ' • ' + RadioLib.size(this._dlAll.bytes);
      if (failed) msg += ' • ⚠️ ' + String(RadioData.L('dlFailed') || '').replace('{n}', failed);
      showToast(msg, 3000);
    }
    this._updateTopBadges();
  },

  dlAllCancel() { if (this._dlAll) this._dlAll.cancel = true; },

  // ---------- أوراق التنزيلات والمفضلة ----------
  openDlSheet() { this._sheet('dl'); },
  openFavSheet() { this._sheet('fav'); },

  closeSheet() {
    const o = document.getElementById('rl-sheet-ov');
    if (o) o.remove();
    this._sheetKind = null;
  },

  _sheet(kind) {
    this._sheetKind = kind;
    const isDl = kind === 'dl';
    const items = isDl ? RadioLib.list() : RadioLib.favs();
    if (!isDl) this._favList = items;
    const old = document.getElementById('rl-sheet-ov');
    if (old) old.remove();
    const rows = items.map((it, i) => this._sheetRow(it, isDl, i)).join('');
    const ov = document.createElement('div');
    ov.id = 'rl-sheet-ov';
    ov.className = 'rl-overlay';
    ov.onclick = (e) => { if (e.target === ov) this.closeSheet(); };
    ov.innerHTML = `<div class="rl-sheet">
      <div class="rl-head"><i class="fas ${isDl ? 'fa-circle-down' : 'fa-heart'}"></i>
        <span>${RadioData.L(isDl ? 'dlTitle' : 'favTitle')}</span>
        ${isDl && items.length ? `<span class="rl-total">${items.length} • ${RadioLib.size(RadioLib.totalBytes())}</span>` : ''}
        ${isDl && items.length ? `<button class="rl-head-act" onclick="RadioPage.dlAllToDevice()" title="${RadioData.L('saveAllDevice')}" aria-label="${RadioData.L('saveAllDevice')}"><i class="fas fa-mobile-screen-button"></i></button>` : ''}
        <button class="rl-x" onclick="RadioPage.closeSheet()" aria-label="close">×</button>
      </div>
      <div class="rl-list">${rows || `<div class="rl-empty"><i class="fas ${isDl ? 'fa-box-open' : 'fa-heart-crack'}"></i><div>${RadioData.L(isDl ? 'dlEmpty' : 'favEmpty')}</div></div>`}</div>
    </div>`;
    document.body.appendChild(ov);
  },

  _favMeta(it) {
    if (it.t === 'station') {
      const st = RadioData.MAIN.concat(RadioData.EXTRA).find(x => x.id === it.stId);
      return { ic: '<i class="fas fa-tower-broadcast"></i>', title: st ? RadioData.name(st) : it.stId, sub: RadioData.L('live') };
    }
    if (it.t === 'live') {
      const r = RadioData.reciter(it.rid);
      return { ic: r ? RadioData.avatarHtml(r, 'rl-av') : '<i class="fas fa-tower-broadcast"></i>', title: r ? RadioData.name(r) : it.rid, sub: RadioData.L('liveStream') };
    }
    if (it.t === 'reciter') {
      const r = RadioData.reciter(it.rid);
      return { ic: r ? RadioData.avatarHtml(r, 'rl-av') : '<i class="fas fa-user"></i>', title: r ? RadioData.name(r) : it.rid, sub: RadioData.L('favReciter') };
    }
    const r = RadioData.reciter(it.rid);
    return { ic: '<i class="fas fa-book-quran"></i>', title: RadioData.surahName(it.surah), sub: (r ? RadioData.name(r) : '') };
  },

  _sheetRow(it, isDl, i) {
    if (isDl) {
      const r = RadioData.reciter(it.rid);
      return `<div class="rl-row">
        <span class="rl-ic"><i class="fas fa-file-audio"></i></span>
        <span class="rl-txt"><b>${escapeHtml(RadioData.surahName(it.surah))}</b><small>${escapeHtml(r ? RadioData.name(r) : it.rid)} • ${RadioLib.size(it.bytes)}</small></span>
        <button class="rl-btn play" onclick="RadioPage.playDl('${it.rid}',${it.surah})" aria-label="${RadioData.L('playNow')}"><i class="fas fa-play"></i></button>
        <button class="rl-btn save" onclick="RadioPage.dlToDevice('${it.rid}',${it.surah})" title="${RadioData.L('saveToDevice')}" aria-label="${RadioData.L('saveToDevice')}"><i class="fas fa-mobile-screen-button"></i></button>
        <button class="rl-btn del" onclick="RadioPage.delDl('${it.rid}',${it.surah})" aria-label="delete"><i class="fas fa-trash"></i></button>
      </div>`;
    }
    const m = this._favMeta(it);
    return `<div class="rl-row">
      <span class="rl-ic">${m.ic}</span>
      <span class="rl-txt"><b>${escapeHtml(m.title)}</b><small>${escapeHtml(m.sub)}</small></span>
      <button class="rl-btn play" onclick="RadioPage.favPlayAt(${i})" aria-label="${RadioData.L('playNow')}"><i class="fas fa-play"></i></button>
      <button class="rl-btn del" onclick="RadioPage.delFavAt(${i})" aria-label="delete"><i class="fas fa-trash"></i></button>
    </div>`;
  },

  // v1.0.130: نسخ صوت منزَّل إلى ملف على الجهاز
  async dlToDevice(rid, n) {
    const ok = await RadioLib.saveToDevice(rid, n);
    if (typeof showToast === 'function') {
      showToast(ok ? '📱 ' + RadioData.L('deviceSaved') : '⚠️ ' + RadioData.L('deviceFailed'), 2600);
    }
    return ok;
  },

  async dlAllToDevice() {
    const list = RadioLib.list();
    if (!list.length) {
      if (typeof showToast === 'function') showToast('⚠️ ' + RadioData.L('noAudioYet'), 2200);
      return;
    }
    if (this._savingAll) return;
    this._savingAll = true;
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      const done = await RadioLib.saveToDevice(list[i].rid, list[i].surah);
      if (done) ok++;
      await new Promise(r => setTimeout(r, 320));   // مهلة بين الملفات لتفادي الازدحام
    }
    this._savingAll = false;
    if (typeof showToast === 'function') {
      showToast(ok ? '📱 ' + RadioData.L('deviceSaved') + ' • ' + ok + '/' + list.length
                   : '⚠️ ' + RadioData.L('deviceFailed'), 2800);
    }
  },

  async playDl(rid, n) {
    this.closeSheet();
    await RadioService.playLocal(rid, n);
    this._renderHero();
  },

  async delDl(rid, n) {
    await RadioLib.remove(rid, n);
    if (RadioService.quran && RadioService.quran.local && RadioService.quran.rid === rid && RadioService.quran.surah === Number(n)) RadioService.stopAll();
    this._sheet('dl'); this._renderBody(); this._updateTopBadges();
  },

  delFavAt(i) {
    const it = (this._favList || [])[i];
    if (!it) return;
    RadioLib.removeFav(it.k);
    this._toastFav(false);
    this._sheet('fav'); this._renderBody(); this._updateTopBadges();
  },

  favPlayAt(i) {
    const it = (this._favList || [])[i];
    if (!it) return;
    this.closeSheet();
    const onRadio = typeof Router !== 'undefined' && Router.current && Router.current.name === 'radio';
    if (it.t === 'station') {
      if (onRadio) { this.tab = it.tab || 'main'; this._renderHero(); this._renderBody(); this.playStation(it.stId); }
      else { Router.go('radio', { tab: it.tab || 'main' }); setTimeout(() => this.playStation(it.stId), 140); }
      return;
    }
    if (it.t === 'live') {
      if (onRadio) { this.tab = 'reciters'; this._renderHero(); this._renderBody(); this.playLive(it.rid, it.liveIdx || 0); }
      else { Router.go('radio', { tab: 'reciters' }); setTimeout(() => this.playLive(it.rid, it.liveIdx || 0), 140); }
      return;
    }
    const r = RadioData.reciter(it.rid);
    const n = it.surah || (r ? RadioData.surahsFor(r)[0] : 1);
    RadioService.playQuran({ rid: it.rid, surah: n, lang: null, prefer: 'whole' });
    if (onRadio) { this.tab = 'reciters'; this.open = it.rid; this.openMode = 'surah'; this._renderHero(); this._renderBody(); }
    else Router.go('radio', { tab: 'reciters' });
  },

  _updateTopBadges() {
    try {
      const f = RadioLib.favs().length, d = RadioLib.list().length;
      const fb = document.getElementById('rtb-fav-b');
      if (fb) { fb.textContent = f; fb.style.display = f ? 'block' : 'none'; }
      const db = document.getElementById('rtb-dl-b');
      if (db) { db.textContent = d; db.style.display = d ? 'block' : 'none'; }
    } catch (e) {}
  },

  _fmtSec(s) {
    const m = Math.floor(s / 60), ss = s % 60;
    return `${m}:${String(ss).padStart(2, '0')}`;
  },

  cleanup() {
    // ⚠️ لا نوقف الصوت هنا — الاستماع يستمر بعد مغادرة الصفحة (مطلوب)
    this.closeSleepModal();
    this.closeSheet();
    RadioService._updateBar();
  },
};
