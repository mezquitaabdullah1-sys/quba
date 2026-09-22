// 📻 RadioPage — الراديو الإسلامي: بث مباشر، قرّاء، قراءات، قرآن مترجم بنص حي، أذكار/رقية/تكبيرات
// v56 — الصوت لا يتوقف عند مغادرة الصفحة (محرّك RadioService مستقل)، مع مؤقّت نوم 🌙
const RadioPage = {
  tab: 'main',
  tl: { folder: 'Dussary_128kbps', reciterName: null, lang: 'es', search: '' }, // v61: الدوسري بدل العفاسي
  _sleepModal: null,

  TABS: [
    { id: 'main', key: 'tabMain', icon: 'fa-tower-broadcast' },
    { id: 'reciters', key: 'tabReciters', icon: 'fa-microphone-lines' },
    { id: 'translated', key: 'tabTranslated', icon: 'fa-language' },
    { id: 'extra', key: 'tabExtra', icon: 'fa-moon' },
    { id: 'sleep', key: 'tabSleep', icon: 'fa-bed' },
  ],

  async render(container, params = {}) {
    this.tab = params.tab || 'main';
    if (!this.tl.reciterName) {
      const r0 = RadioData.AV_RECITERS[0];
      this.tl.folder = r0.folder;
      this.tl.reciterName = RadioData.name(r0);
    }
    container.innerHTML = `
      <div class="top-bar">
        <button class="top-bar-btn" onclick="Router.back()" aria-label="back">
          <i class="fas fa-chevron-${currentLocale === 'ar' ? 'right' : 'left'}"></i>
        </button>
        <div class="top-bar-title"><i class="fas fa-radio"></i> ${RadioData.L('radioTitle')}</div>
        <div style="width:30px;"></div>
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
    // إخفاء الشريط العائم داخل صفحة الراديو
    RadioService._updateBar();
  },

  switchTab(tab) {
    this.tab = tab;
    document.querySelectorAll('.radio-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    // v58: شاشة التحكم تتبع التبويب الجديد ما لم يكن هناك تشغيل فعلي
    if (!RadioService.mode || RadioService.state === 'idle' || RadioService.state === 'error') {
      this._renderHero();
    }
    this._renderBody();
  },

  // ---------- البطاقة الرئيسية (Hero) ----------
  _heroState() {
    const S = RadioService;
    if (S.mode === 'quran' && S.quran) {
      const q = S.quran;
      return {
        kind: 'quran',
        img: q.lang ? null : RadioData.IMG.quran,
        chip: q.sleep ? RadioData.L('tabSleep') : RadioData.L('tabTranslated'),
        title: RadioData.surahName(q.surah),
        sub: q.whole
          ? `${q.reciterName} • ${q.surahTotal || q.total} ${RadioData.L('ayah')}`
          : `${q.reciterName} • ${RadioData.L('ayah')} ${q.ayah || 1} ${RadioData.L('of')} ${q.total}`,
        liveTL: !!q.lang,
      };
    }
    if (S.mode === 'stream' && S.station) {
      return {
        kind: 'stream',
        img: RadioData.IMG[S.station.img] || RadioData.IMG.kaaba,
        chip: RadioData.L('live'),
        title: RadioData.name(S.station),
        sub: RadioData.L('nowPlaying'),
        liveTL: false,
      };
    }
    // v58: الحالة الافتراضية تتبع التبويب المفتوح — شاشة التحكم تعكس القسم
    // الحالي (القرّاء/الأذكار/المترجم/النوم) بدل البقاء على إذاعة القاهرة.
    if (this.tab === 'translated' || this.tab === 'sleep') {
      const isSleep = this.tab === 'sleep';
      return {
        kind: 'idle',
        img: RadioData.IMG.quran2,
        chip: RadioData.L(isSleep ? 'tabSleep' : 'tabTranslated'),
        title: RadioData.surahName(isSleep ? RadioData.SLEEP_SURAHS[0] : 1),
        sub: RadioData.L('tapToListen'),
        liveTL: false,
      };
    }
    const st = this.tab === 'reciters' ? RadioData.RECITERS[0]
             : this.tab === 'extra' ? RadioData.EXTRA[0] : RadioData.MAIN[0];
    const chipKey = { main: 'tabMain', reciters: 'tabReciters', extra: 'tabExtra' }[this.tab] || 'tabMain';
    return {
      kind: 'idle',
      img: RadioData.IMG[st.img],
      chip: RadioData.L(chipKey),
      title: RadioData.name(st),
      sub: RadioData.L('tapToListen'),
      liveTL: false,
    };
  },

  _renderHero() {
    const slot = document.getElementById('radio-hero-slot');
    if (!slot) return;
    const S = RadioService;
    const h = this._heroState();
    const playing = S.state === 'playing';
    const loading = S.state === 'loading';
    const isQuran = S.mode === 'quran' && S.quran;
    const sleepLeft = S.sleepLeftSec();

    slot.innerHTML = `
      <div class="radio-hero ${h.liveTL ? 'tl-mode' : ''}" ${h.img ? `style="background-image:url('${h.img}')"` : ''}>
        <div class="radio-hero-overlay"></div>
        <div class="radio-hero-content">
          <div class="radio-wave ${playing ? 'on' : ''}" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="radio-hero-chip">${h.chip}</div>
          <div class="radio-hero-title">${escapeHtml(h.title)}</div>
          <div class="radio-hero-sub">${loading ? RadioData.L('loading') : escapeHtml(h.sub)}</div>

          ${h.liveTL ? `
            <div class="radio-live-tl" id="radio-live-tl">
              ${this._liveTlHtml()}
            </div>
          ` : ''}

          <div class="radio-controls">
            <button class="radio-ctl side" onclick="RadioService.share()" title="${RadioData.L('share')}" aria-label="${RadioData.L('share')}">
              <i class="fas fa-share-nodes"></i>
            </button>
            ${isQuran && !S.quran.whole ? `
              <button class="radio-ctl side" onclick="RadioService.prevAyah()" title="${RadioData.L('prevAyah')}" aria-label="${RadioData.L('prevAyah')}">
                <i class="fas fa-backward-step"></i>
              </button>` : ''}
            <button class="radio-ctl main ${loading ? 'loading' : ''}" onclick="RadioPage._mainAction()" aria-label="play/pause">
              <i class="fas ${loading ? 'fa-circle-notch fa-spin' : (playing ? 'fa-pause' : 'fa-play')}"></i>
            </button>
            ${isQuran ? `
              <button class="radio-ctl side" onclick="RadioService.replayAyah()" title="${RadioData.L('replayAyah')}" aria-label="${RadioData.L('replayAyah')}">
                <i class="fas fa-rotate-right"></i>
              </button>` : ''}
            ${isQuran ? `
              <button class="radio-ctl side rep-${S.repeatMode}" onclick="RadioService.cycleRepeat()" title="${RadioData.L('repeatMode')}: ${RadioData.L('rep_' + S.repeatMode)}" aria-label="${RadioData.L('repeatMode')}">
                <i class="fas ${S.repeatMode === 'random' ? 'fa-shuffle' : 'fa-repeat'}"></i>
                ${S.repeatMode === 'one' ? '<span class="rep-badge">1</span>' : ''}
              </button>` : ''}
            ${isQuran && S.quran.lang ? `
              <button class="radio-ctl side ${S._trVoiceEnabled() ? 'sleep-on' : ''}" onclick="RadioPage.toggleVoiceTr()" title="${RadioData.L('voiceTr')}" aria-label="${RadioData.L('voiceTr')}">
                <i class="fas ${S._trVoiceEnabled() ? 'fa-volume-high' : 'fa-volume-xmark'}"></i>
              </button>` : ''}
            <button class="radio-ctl side ${sleepLeft > 0 ? 'sleep-on' : ''}" onclick="RadioPage.openSleepModal()" title="${RadioData.L('sleepTimer')}" aria-label="${RadioData.L('sleepTimer')}">
              <i class="fas fa-moon"></i>
            </button>
          </div>

          ${sleepLeft > 0 ? `
            <div class="radio-sleep-chip" id="radio-sleep-chip">
              <i class="fas fa-moon"></i> ${RadioData.L('sleepActive')}: <b>${this._fmtSec(sleepLeft)}</b>
            </div>` : ''}

          <div class="radio-bg-note"><i class="fas fa-headphones"></i> ${RadioData.L('continueBg')}</div>
        </div>
      </div>
    `;
  },

  _liveTlHtml() {
    const q = RadioService.quran;
    if (!q) return '';
    const ar = RadioData.arabicAyah(q.surah, q.ayah);
    const tr = q.tr && q.tr[q.ayah] ? q.tr[q.ayah] : '…';
    // v57 FIX: الترجمة قد تصل بعد أول رسم للبطاقة — نطلبها هنا أيضاً ونحدّث
    // الواجهة فور وصولها، ليظهر النص العربي وتحته الترجمة دائماً للمستخدم.
    if (!q.tr) {
      RadioData.getTranslation(q.surah, q.lang).then(map => {
        if (map && RadioService.quran === q && !q.tr) { q.tr = map; RadioService._emit(); }
      }).catch(() => {});
    }
    return `
      <div class="tl-label"><i class="fas fa-language"></i> ${RadioData.L('liveTranslation')}</div>
      <div class="tl-ar">${escapeHtml(ar)}</div>
      <div class="tl-tr">${escapeHtml(tr)}</div>
    `;
  },

  _mainAction() {
    const S = RadioService;
    if (S.state === 'idle' || S.state === 'error') {
      if (this.tab === 'sleep') { this.playSleep(null); return; }
      if (this.tab === 'translated') { this.playTranslated(1); return; }
      const st = this.tab === 'reciters' ? RadioData.RECITERS[0]
               : this.tab === 'extra' ? RadioData.EXTRA[0] : RadioData.MAIN[0];
      this.playStation(st);
    } else {
      S.toggle();
    }
  },

  onPlayerUpdate() {
    this._renderHero();
    // تحديث مؤشر «يُبث الآن» في القوائم دون إعادة رسم كاملة
    document.querySelectorAll('.station-card').forEach(card => {
      const id = card.dataset.stationId;
      const cur = RadioService.station && RadioService.station.id === id && RadioService.state !== 'idle';
      card.classList.toggle('active', !!cur);
    });
    document.querySelectorAll('.surah-row').forEach(row => {
      const n = parseInt(row.dataset.surah, 10);
      const cur = RadioService.mode === 'quran' && RadioService.quran && RadioService.quran.surah === n;
      row.classList.toggle('active', !!cur);
    });
    // v57: تحديث نص الترجمة الحيّة عند كل نبضة (وصول الترجمة متأخرة / تغير الآية)
    const tlBox = document.getElementById('radio-live-tl');
    if (tlBox && RadioService.mode === 'quran') tlBox.innerHTML = this._liveTlHtml();
  },

  // ---------- جسم الصفحة حسب التبويب ----------
  _renderBody() {
    const body = document.getElementById('radio-body');
    if (!body) return;
    if (this.tab === 'translated') { this._renderTranslated(body); return; }
    if (this.tab === 'sleep') { this._renderSleep(body); return; }

    let list = [];
    if (this.tab === 'main') list = RadioData.MAIN;
    else if (this.tab === 'reciters') list = RadioData.RECITERS;
    else if (this.tab === 'extra') list = RadioData.EXTRA;

    body.innerHTML = list.map(st => {
      const cur = RadioService.station && RadioService.station.id === st.id && RadioService.state !== 'idle';
      return `
        <div class="station-card ${cur ? 'active' : ''}" data-station-id="${st.id}" style="background-image:url('${RadioData.IMG[st.img] || RadioData.IMG.kaaba}')" onclick="RadioPage.playStation(RadioData.${this._listName()}['${st.id}'] ? undefined : undefined, '${st.id}')">
          <div class="station-overlay"></div>
          <div class="station-info">
            <div class="station-name">${st.badge ? st.badge + ' ' : ''}${escapeHtml(RadioData.name(st))}</div>
            ${st.descKey ? `<div class="station-desc">${RadioData.L(st.descKey)}</div>` : `<div class="station-desc">${cur ? RadioData.L('nowPlaying') : RadioData.L('tapToListen')}</div>`}
          </div>
          <div class="station-eq ${cur && RadioService.state === 'playing' ? 'on' : ''}"><i></i><i></i><i></i></div>
        </div>
      `;
    }).join('');
  },

  _listName() {
    return { main: 'MAIN', reciters: 'RECITERS', extra: 'EXTRA' }[this.tab] || 'MAIN';
  },

  playStation(_unused, id) {
    const lists = { main: RadioData.MAIN, reciters: RadioData.RECITERS, extra: RadioData.EXTRA };
    let st = null;
    if (id) {
      for (const k in lists) { st = lists[k].find(s => s.id === id); if (st) break; }
    } else if (_unused && _unused.id) {
      st = _unused;
    }
    if (!st) return;
    // لو نفس المحطة تعمل: إيقاف مؤقت/استئناف
    if (RadioService.station && RadioService.station.id === st.id && RadioService.mode === 'stream') {
      RadioService.toggle();
      return;
    }
    RadioService.playStream(st);
  },

  // ---------- تبويب القرآن المترجم ----------
  _renderTranslated(body) {
    // v59: القارئ المختار حالياً — عدد السور المتوفرة لديه + قائمة السور الخاصة إن وُجدت
    const tlR = RadioData.AV_RECITERS.concat(RadioData.EXTRA_RECITERS || []).find(x => x.folder === this.tl.folder);
    const tlTotal = (tlR && tlR.surahTotal) || null;
    const q = RadioData.SURAHS.filter(s => {
      if (!this.tl.search) return true;
      const qx = this.tl.search.toLowerCase();
      return String(s[0]) === qx || s[1].includes(this.tl.search) || s[2].toLowerCase().includes(qx) || s[3].toLowerCase().includes(qx);
    });

    body.innerHTML = `
      <div class="tl-note"><i class="fas fa-circle-info"></i> ${RadioData.L('translationNote')}</div>

      <div class="tl-group-label">${RadioData.L('chooseReciter')}</div>
      <div class="tl-chips">
        ${RadioData.AV_RECITERS.concat(RadioData.EXTRA_RECITERS || []).map(r => `
          <button class="tl-chip ${this.tl.folder === r.folder ? 'active' : ''}" onclick="RadioPage.setTlReciter('${r.folder}')">
            <i class="fas fa-user"></i> ${escapeHtml(RadioData.name(r))}
          </button>`).join('')}
      </div>
      ${(tlR && tlR.surahList) ? `<div class="tl-note" style="margin-top:6px;"><i class="fas fa-list-check"></i> ${RadioData.L('availableSurahs')}: ${tlR.surahList}</div>` : ''}

      <div class="tl-group-label">${RadioData.L('chooseLang')}</div>
      <div class="tl-chips">
        <button class="tl-chip ${this.tl.lang === 'es' ? 'active' : ''}" onclick="RadioPage.setTlLang('es')"><i class="fas fa-language"></i> ${RadioData.L('spanish')}</button>
        <button class="tl-chip ${this.tl.lang === 'en' ? 'active' : ''}" onclick="RadioPage.setTlLang('en')"><i class="fas fa-language"></i> ${RadioData.L('english')}</button>
      </div>

      <div class="tl-group-label">${RadioData.L('chooseSurah')}</div>
      <div class="tl-search">
        <i class="fas fa-search"></i>
        <input type="search" id="tl-search-input" placeholder="${RadioData.L('searchSurah')}" value="${escapeHtml(this.tl.search)}" oninput="RadioPage.tlSearch(this.value)">
      </div>

      <div class="surah-list">
        ${q.map(s => {
          const cur = RadioService.mode === 'quran' && RadioService.quran && RadioService.quran.surah === s[0];
          const nm = (typeof currentLocale !== 'undefined' && currentLocale === 'ar') ? s[1] : (currentLocale === 'en' ? s[3] : s[2]);
          return `
            <div class="surah-row ${cur ? 'active' : ''}" data-surah="${s[0]}" onclick="RadioPage.playTranslated(${s[0]})">
              <span class="surah-num">${s[0]}</span>
              <div class="surah-names">
                <div class="surah-name">${escapeHtml(nm)}</div>
                <div class="surah-meta">${s[1]} • ${tlTotal || s[4]} ${RadioData.L('ayah')}</div>
              </div>
              <i class="fas ${cur ? 'fa-volume-high' : 'fa-play'} surah-play-ic"></i>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  setTlReciter(folder) {
    this.tl.folder = folder;
    const r = RadioData.AV_RECITERS.concat(RadioData.EXTRA_RECITERS || []).find(x => x.folder === folder);
    this.tl.reciterName = r ? RadioData.name(r) : '';
    this._renderBody();
  },

  setTlLang(lang) {
    this.tl.lang = lang;
    this._renderBody();
  },

  tlSearch(v) {
    this.tl.search = v || '';
    // إعادة رسم القائمة فقط مع الحفاظ على التركيز في حقل البحث
    this._renderBody();
    const inp = document.getElementById('tl-search-input');
    if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  },

  playTranslated(surah) {
    // لو نفس السورة تعمل: توقف/استئناف
    if (RadioService.mode === 'quran' && RadioService.quran && RadioService.quran.surah === surah &&
        RadioService.quran.folder === this.tl.folder && RadioService.quran.lang === this.tl.lang) {
      RadioService.toggle();
      return;
    }
    // v59: قرّاء MP3Quran لهم خادم مباشر (سورة كاملة) — نمرّره بدل اسم المجلد
    const r = RadioData.AV_RECITERS.concat(RadioData.EXTRA_RECITERS || []).find(x => x.folder === this.tl.folder);
    RadioService.playQuran({
      folder: (r && r.server) || this.tl.folder,
      reciterName: this.tl.reciterName,
      lang: this.tl.lang,
      surah,
      surahTotal: (r && r.surahTotal) || null,
    });
  },

  // ---------- v58: تبويب قرآن قبل النوم (مع أصوات خلفية لطيفة) ----------
  _renderSleep(body) {
    const S = RadioService;
    const AMBIENTS = [
      { id: 'rain',  icon: 'fa-cloud-rain' },
      { id: 'waves', icon: 'fa-water' },
      { id: 'wind',  icon: 'fa-wind' },
      { id: 'white', icon: 'fa-fan' },
    ];
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
          const nm = (typeof currentLocale !== 'undefined' && currentLocale === 'ar') ? info.ar : (currentLocale === 'en' ? info.en : info.es);
          return `
            <div class="surah-row ${cur ? 'active' : ''}" data-surah="${n}" onclick="RadioPage.playSleep(${n})">
              <span class="surah-num">${n}</span>
              <div class="surah-names">
                <div class="surah-name">${escapeHtml(nm)}</div>
                <div class="surah-meta">${info.ar} • ${info.ayahs} ${RadioData.L('ayah')}</div>
              </div>
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
    const r0 = RadioData.AV_RECITERS[0];
    // نفس السورة تعمل: إيقاف مؤقت/استئناف
    if (surah && RadioService.mode === 'quran' && RadioService.quran &&
        RadioService.quran.sleep && RadioService.quran.surah === surah) {
      RadioService.toggle();
      return;
    }
    const idx = Math.max(0, surah ? list.indexOf(surah) : 0);
    RadioService.playQuran({
      folder: r0.folder,
      reciterName: RadioData.name(r0),
      lang: null,
      surah: list[idx],
      playlist: list.slice(idx),
      sleep: true,
    });
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

  _fmtSec(s) {
    const m = Math.floor(s / 60), ss = s % 60;
    return `${m}:${String(ss).padStart(2, '0')}`;
  },

  cleanup() {
    // ⚠️ لا نوقف الصوت هنا — الاستماع يستمر بعد مغادرة الصفحة (مطلوب)
    this.closeSleepModal();
    RadioService._updateBar();
  },
};
