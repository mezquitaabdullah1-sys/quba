// 📖 Pantalla del Corán - v4 (Tafsir mobile fix + audio repeat + Mishary removed)
const QuranPage = {
  surahs: [],
  playingAyah: null,
  currentSurah: null,
  readerSettings: null,
  repeatMode: 'off', // 'off' | 'ayah' | 'surah'
  repeatConfig: null, // v51: {ayah, surah, from, to} — 0 = بلا نهاية ∞
  _repeatCount: 0,
  _audioFallbackFor: null, // v28: aleya con reintento de audio en curso (evita bucles)

  loadReaderSettings() {
    this.readerSettings = Storage.get('reader_settings') || {
      showTransliteration: true,
      showTranslation: true,
      fontSize: 'medium',
      tajweedColors: false, // v51: ألوان التجويد — تُفعَّل/تُطفأ من إعدادات صفحة القرآن
      tafsir: 'local.garcia', // v29: comentarios de Isa García (ES, offline) — predeterminado
    };
    // v30: la traducción se SINCRONIZA con el idioma en cada carga (no solo
    // en la migración inicial). Así, al cambiar a inglés/árabe y volver, la
    // app nunca queda atascada en español ni muestra traducción en modo árabe.
    const resolved = API.resolveTranslationForLocale(AppState.settings.translation);
    if (AppState.settings.translation !== resolved) {
      AppState.settings.translation = resolved;
      Storage.saveSettings();
    }
    // v30: el tafsir predeterminado se ajusta al idioma (García solo aplica
    // al español; en inglés/árabe se usa la edición remota de ese idioma).
    const autoTafsir = { ar: 'local.ar', en: 'local.en', es: 'local.garcia' }[currentLocale] || 'local.garcia';
    // v32: en vez de mantener a mano una lista de IDs "solo-español" (que en
    // v31 incluía 'local.en' por error y por eso el tafsir se quedaba
    // atascado en inglés al volver al español, mostrando el Mokhtasar/García
    // en el idioma equivocado o sin contenido), se comprueba directamente
    // contra las ediciones válidas para el idioma actual. Si el tafsir
    // guardado no es una de ellas (viene de otro idioma) se reajusta.
    const validTafsirIds = (typeof TafsirService !== 'undefined')
      ? TafsirService.getAvailableTafsirs(currentLocale).map(tf => tf.id)
      : [autoTafsir];
    if (this.readerSettings.tafsir === 'local.auto'
        || !validTafsirIds.includes(this.readerSettings.tafsir)) {
      this.readerSettings.tafsir = autoTafsir;
      this.saveReaderSettings();
    }
    // Migration: if user had Mishary saved, switch to the default reciter (Al-Husary)
    if (AppState.settings.reciter === 'ar.alafasy') {
      AppState.settings.reciter = 'ar.husary';
      Storage.saveSettings();
    }
    return this.readerSettings;
  },

  saveReaderSettings() {
    Storage.set('reader_settings', this.readerSettings);
  },

  loadRepeatMode() {
    this.repeatMode = Storage.get('quran_repeat') || 'off';
    this.repeatConfig = Storage.get('quran_repeat_cfg') || { ayah: 0, surah: 0, from: 1, to: 1 };
    this._repeatCount = 0;
  },

  saveRepeatMode() {
    Storage.set('quran_repeat', this.repeatMode);
    if (this.repeatConfig) Storage.set('quran_repeat_cfg', this.repeatConfig);
  },

  // ============ SURAH LIST ============
  async render(container, params = {}, navToken = null) {
    this._clearReaderChrome();
    // v32: mismo guard de token que usa HomePage — si el usuario cambia de
    // idioma o navega a otra pestaña mientras esta carga sigue en curso, una
    // respuesta tardía ya no debe pisar la pantalla actual.
    const isStale = () => navToken !== null && typeof Router !== 'undefined' && !Router.isCurrent(navToken);

    this.loadReaderSettings();
    this.loadRepeatMode();

    // v36: فلتر العرض في قائمة القرآن الرئيسية: سور | أجزاء | أحزاب | أرباع
    this.listFilter = Storage.get('quran_list_filter') || 'surah';

    container.innerHTML = `
      <div class="quran-list-header qrh">
        <div class="qrh-top">
          <button class="qrh-ic" onclick="Router.go('quran')" aria-label="${t('backToWisdom')}">
            <i class="fas fa-chevron-right"></i>
          </button>
          <div class="qrh-title">
            <b>${t('tabQuran')}</b>
            <em>114 ${t('surahs').toLowerCase()}</em>
          </div>
          <button class="qrh-ic" onclick="QuranPage.openAudioManager()" title="${t('audioDownloadsTitle')}" aria-label="${t('audioDownloadsTitle')}">
            <i class="fas fa-cloud-arrow-down"></i>
          </button>
          <button class="qrh-ic" onclick="QuranPage.openReaderSettings()" title="${t('settings_reader') || 'Ajustes'}" aria-label="${t('settings_reader') || 'Ajustes'}">
            <i class="fas fa-sliders-h"></i>
          </button>
        </div>
        <div class="search-box quran-unified-search">
          <i class="fas fa-search"></i>
          <input type="text" id="quran-unified-search" placeholder="${t('mushafSearchGo')}" autocomplete="off">
          <button class="qus-clear-btn hidden" id="qus-clear" onclick="QuranPage.clearUnifiedSearch()" aria-label="×"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="quran-unified-results hidden" id="quran-unified-results"></div>
        <button class="qrh-fullpage" onclick="QuranPage.openMushaf()">
          <i class="fas fa-book-open"></i>
          <span>${t('mushafOpenBtn')}</span>
          <i class="fas fa-chevron-left qrh-fp-arw"></i>
        </button>
      </div>
            <div id="bookmarks-entry"></div>
      <div class="quran-list-filter-bar">
        <div class="quran-list-filter-label" id="quran-list-filter-label"></div>
        <!-- v50: شريط وصول سريع بجانب زر الفلتر — سور وآيات كثيرة القراءة -->
        <div class="quran-quick-bar" id="quran-quick-bar">
          ${this.QUICK_ACCESS.map(q => `
            <button class="quran-quick-chip" onclick="event.stopPropagation(); QuranPage.quickOpen(${q.s}, ${q.a})">
              <i class="fas ${q.icon}"></i><span>${t(q.key) || q.key}</span>
            </button>
          `).join('')}
        </div>
        <button class="quran-list-filter-btn" onclick="QuranPage.openListFilter(event)" title="${t('mushafIndex')}" aria-label="${t('mushafIndex')}">
          <i class="fas fa-filter"></i>
        </button>
      </div>
      <div id="surah-list" style="padding: var(--sp-md);">
        ${Skeleton.quranList()}
      </div>
    `;

    try {
      this.surahs = await API.getSurahList();
      if (isStale()) return;
      this._downloadedNumbers = [];
      if (typeof QuranOfflineService !== 'undefined') {
        const tr = AppState.settings.translation;
        const rc = AppState.settings.reciter;
        this._downloadedNumbers = await QuranOfflineService.getDownloadedNumbers(tr, rc);
      }
      if (isStale()) return;
      this.renderFilteredList();
      this.autoDownloadOffline();
      this.renderBookmarksEntry();
      this._attachAudioEvents();
      this.updateAudioDownloadBadge();
      this.maybeShowAudioPermission();

      // v36: بحث موحّد — رقم صفحة أو رقم سورة أو اسم سورة أو نص آية
      const search = document.getElementById('quran-unified-search');
      if (search) {
        search.addEventListener('input', e => {
          const q = e.target.value;
          document.getElementById('qus-clear')?.classList.toggle('hidden', !q);
          clearTimeout(this._unifiedSearchTimer);
          this._unifiedSearchTimer = setTimeout(() => this._runUnifiedSearch(q.trim()), 180);
        });
        document.addEventListener('click', this._unifiedOutsideHandler = (ev) => {
          const box = document.getElementById('quran-unified-results');
          const inp = document.getElementById('quran-unified-search');
          if (!box || !inp) return;
          if (box.contains(ev.target) || inp.contains(ev.target)) return;
          box.classList.add('hidden');
        });
      }
    } catch (e) {
      if (isStale()) return;
      document.getElementById('surah-list').innerHTML =
        UIState.error("QuranPage.render(document.getElementById('main-content'))");
    }
  },

  // v21: banner de "descargar Corán para uso sin conexión" (TEXTO solamente,
  // es ligero y automático). v27: el audio ya no forma parte del banner — se
  // gestiona con permiso desde el icono de descarga (esquina) por sura.
  // v1.0.131: أُزيلت بطاقة «تحميل القرآن» — التنزيل يبدأ تلقائيًا وبصمت عند فتح
  // الصفحة (النص فقط، بلا صوت)، ويُتابَع في الخلفية إن انقطع الاتصال.
  async autoDownloadOffline() {
    if (typeof QuranOfflineService === 'undefined') return;
    const translation = AppState.settings.translation;
    const reciter = AppState.settings.reciter;
    try {
      if (QuranOfflineService._downloading) return;
      if (!navigator.onLine) return;
      const status = await QuranOfflineService.getDownloadStatus(translation, reciter);
      if (status.downloaded >= status.total) return;
      if (!this._offlineListenerAttached) {
        this._offlineListenerAttached = true;
        QuranOfflineService.onProgress(async () => {
          this._downloadedNumbers = await QuranOfflineService.getDownloadedNumbers(translation, reciter);
          this._refreshOfflineBadges();
        });
      }
      QuranOfflineService.downloadAll(translation, reciter);
    } catch (e) {}
  },

  renderOfflineBanner() {},

  startOfflineDownload() {
    if (typeof QuranOfflineService === 'undefined') return;
    const translation = AppState.settings.translation;
    const reciter = AppState.settings.reciter;

    if (!this._offlineListenerAttached) {
      this._offlineListenerAttached = true;
      QuranOfflineService.onProgress(async (evt) => {
        this._downloadedNumbers = await QuranOfflineService.getDownloadedNumbers(translation, reciter);
        this.autoDownloadOffline();
        // Actualiza discretamente las insignias visibles sin recargar toda la lista
        this._refreshOfflineBadges();
        if (evt.type === 'complete') showToast('✅ ' + t('quranDownloaded'));
      });
    }
    QuranOfflineService.downloadAll(translation, reciter);
    this.renderOfflineBanner();
  },

  _refreshOfflineBadges() {
    document.querySelectorAll('.surah-card').forEach(card => {
      const num = Number(card.dataset.surah);
      const has = card.querySelector('.surah-offline-badge');
      const isDown = (this._downloadedNumbers || []).includes(num);
      if (isDown && !has) {
        card.insertAdjacentHTML('beforeend', '<div class="surah-offline-badge"><i class="fas fa-circle-check"></i></div>');
      }
    });
  },

  // v36: تحويل الأرقام الغربية إلى عربية-مشرقية للعرض
  _arDigits(n) {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  },

  // v51: رقم محلي للعرض — عربي مشرقي (١٢٣) في واجهة العربية، أجنبي (123) عند الترجمة
  _num(n) {
    return (typeof currentLocale !== 'undefined' && currentLocale === 'ar')
      ? String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])
      : String(n);
  },

  // v36: تحويل الأرقام العربية-المشرقية إلى غربية (لتحليل مدخل البحث)
  _toWesternDigits(str) {
    return String(str || '').replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  },

  clearUnifiedSearch() {
    const inp = document.getElementById('quran-unified-search');
    if (inp) { inp.value = ''; inp.focus(); }
    document.getElementById('qus-clear')?.classList.add('hidden');
    const box = document.getElementById('quran-unified-results');
    if (box) { box.classList.add('hidden'); box.innerHTML = ''; }
  },

  // v36: البحث الموحّد — رقم صفحة (١-٦٠٤)، رقم/اسم سورة، سورة:آية، أو نص آية
  // النتائج تظهر في قائمة منسدلة منفصلة، دون التأثير على قائمة السور الثابتة
  _runUnifiedSearch(q) {
    const box = document.getElementById('quran-unified-results');
    if (!box) return;
    if (!q) { box.classList.add('hidden'); box.innerHTML = ''; return; }

    const qw = this._toWesternDigits(q);
    const parts = [];
    const TOTAL_PAGES = 604;

    // 1) رقم صفحة
    if (/^\d+$/.test(qw)) {
      const n = parseInt(qw, 10);
      if (n >= 1 && n <= TOTAL_PAGES) {
        parts.push(`
          <div class="qus-section">${t('mushafPage')}</div>
          <div class="picker-item qus-item" onclick="QuranPage.jumpToPage(${n})">
            <div class="picker-num">${n}</div>
            <div class="picker-info">
              <div class="picker-name">${t('mushafPage')} ${n} / ${TOTAL_PAGES}</div>
              <div class="picker-meta">${t('mushafOpenBtn')} · ${this._pageMeta(n)}</div>
            </div>
            <i class="fas fa-book-open" style="color:var(--primary);"></i>
          </div>
        `);
      }
      // 2) رقم سورة
      if (n >= 1 && n <= 114) {
        const surah = (this.surahs || []).find(x => x.number === n);
        if (surah) {
          parts.push(`
            <div class="qus-section">${t('surahs')}</div>
            <div class="picker-item qus-item" onclick="QuranPage.pickSurah(${surah.number})">
              <div class="picker-num">${surah.number}</div>
              <div class="picker-info">
                <div class="picker-name">${Validate.escapeHTML(QuranHelpers.surahDisplayName(surah))}</div>
                <div class="picker-meta">${surah.numberOfAyahs} ${t('ayah').toLowerCase()}s</div>
              </div>
              <div class="picker-arabic">${Validate.escapeHTML(QuranHelpers.removeTashkeel(surah.name))}</div>
            </div>
          `);
        }
      }
    }

    // 3) مرجع آية (سورة:آية)
    const m = qw.match(/^(\d+)\s*[:：]\s*(\d+)$/);
    if (m) {
      const sn = parseInt(m[1], 10);
      const an = parseInt(m[2], 10);
      const surah = (this.surahs || []).find(x => x.number === sn);
      if (surah && an >= 1 && an <= surah.numberOfAyahs) {
        parts.push(`
          <div class="qus-section">${t('ayah')}</div>
          <div class="picker-item qus-item" onclick="QuranPage.goToSearchResult(${sn}, ${an})">
            <div class="picker-num">${sn}:${an}</div>
            <div class="picker-info">
              <div class="picker-name">${Validate.escapeHTML(QuranHelpers.surahDisplayName(surah))} · ${t('ayah')} ${an}</div>
            </div>
          </div>
        `);
      }
    }

    // 4) سور مطابقة بالاسم
    if (!/^\d+$/.test(qw) || qw.length <= 3) {
      const matches = (this.surahs || []).filter(s => QuranHelpers.surahMatches(s, q)).slice(0, 8);
      if (matches.length) {
        parts.push(`<div class="qus-section">${t('surahs')}</div>`);
        parts.push(matches.map(s => `
          <div class="picker-item qus-item" onclick="QuranPage.pickSurah(${s.number})">
            <div class="picker-num">${s.number}</div>
            <div class="picker-info">
              <div class="picker-name">${Validate.escapeHTML(QuranHelpers.surahDisplayName(s))}</div>
              <div class="picker-meta">${s.numberOfAyahs} ${t('ayah').toLowerCase()}s</div>
            </div>
            <div class="picker-arabic">${Validate.escapeHTML(QuranHelpers.removeTashkeel(s.name))}</div>
          </div>
        `).join(''));
      }
    }

    // 5) بحث في نصوص الآيات
    if (q.length >= 2 && !/^\d+$/.test(qw) && typeof QuranSearch !== 'undefined') {
      const hits = QuranSearch.search(q, 20);
      if (hits.length) {
        parts.push(`<div class="qus-section">${t('mushafAyahMatches') || t('quranSearchResults')}</div>`);
        parts.push(hits.map(r => {
          const meta = (typeof QuranOfflineService !== 'undefined') ? QuranOfflineService.getSurahMeta(r.s) : null;
          const surahName = meta ? QuranHelpers.surahDisplayName(meta) : String(r.s);
          return `
            <div class="picker-item qus-item qus-ayah-hit" onclick="QuranPage.goToSearchResult(${r.s}, ${r.a})">
              <div class="picker-info">
                <div class="picker-name"><i class="fas fa-book-open"></i> ${r.s}. ${Validate.escapeHTML(surahName)} · ${t('ayah')} ${r.a}</div>
                <div class="qus-ayah-text" dir="rtl">${QuranSearch.highlight(r.text, q)}</div>
              </div>
            </div>
          `;
        }).join(''));
      }
    }

    const head = `
      <div class="qus-sheet-head">
        <span class="qus-sheet-title"><i class="fas fa-hashtag"></i> ${Validate.escapeHTML(q)}</span>
        <button class="qus-sheet-close" onclick="QuranPage.clearUnifiedSearch()" aria-label="×"><i class="fas fa-xmark"></i></button>
      </div>`;
    if (!parts.length) {
      box.innerHTML = head + `<div class="qus-empty">🔎 ${Validate.escapeHTML((t('quranSearchEmpty') || 'No results: %s').replace('%s', q))}</div>`;
    } else {
      box.innerHTML = head + parts.join('');
    }
    box.classList.remove('hidden');
    // v37: الورقة تغطي أغلب الشاشة بنفسها (صفحة شبه كاملة) — تُغلق بزر × أو باختيار نتيجة
  },

  // v37: اسم السورة/الآية لأول آية في صفحة المصحف (يظهر في نتيجة البحث عن رقم صفحة)
  _pageMeta(pageNum) {
    const all = (typeof window !== 'undefined') && window.QURAN_FULL_AR;
    const pg = all && all.pages ? all.pages.find(x => x.n === pageNum) : null;
    const first = pg && pg.ayahs && pg.ayahs[0];
    if (!first) return '';
    return `${Validate.escapeHTML(this._surahNameByNumber(first[0]))} · ${t('ayah')} ${first[1]}`;
  },

  jumpToPage(pageNum) {
    this.clearUnifiedSearch();
    Router.push('mushaf', { page: pageNum });
  },

  // v36: قائمة الفلتر المنسدلة (سور / أجزاء / أحزاب / أرباع)
  // v50: accesos rápidos — surahs y ayat de consulta frecuente
  QUICK_ACCESS: [
    { s: 18, a: 1,   key: 'qkKahf',      icon: 'fa-book-open' },
    { s: 2,  a: 255, key: 'qkAyatKursi', icon: 'fa-star' },
    { s: 36, a: 1,   key: 'qkYasin',     icon: 'fa-heart' },
    { s: 55, a: 1,   key: 'qkRahman',    icon: 'fa-rose' },
    { s: 56, a: 1,   key: 'qkWaqiah',    icon: 'fa-gem' },
    { s: 67, a: 1,   key: 'qkMuluk',     icon: 'fa-moon' },
  ],

  quickOpen(s, a) {
    this.goToSearchResult(s, a);
  },

  openListFilter(ev) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    const existing = document.getElementById('quran-list-filter-menu');
    if (existing) { existing.remove(); return; }
    const modes = [
      { id: 'surah', label: t('mushafTabSurahs'), icon: 'fa-book' },
      { id: 'juz',   label: t('mushafTabJuz'),    icon: 'fa-layer-group' },
      { id: 'hizb',  label: t('mushafTabHizb'),   icon: 'fa-bookmark' },
      { id: 'rub',   label: t('mushafTabRub'),    icon: 'fa-star-half-alt' },
    ];
    const menu = document.createElement('div');
    menu.id = 'quran-list-filter-menu';
    menu.className = 'quran-list-filter-menu';
    menu.innerHTML = modes.map(m => `
      <button class="qlf-item ${this.listFilter === m.id ? 'active' : ''}" onclick="QuranPage.setListFilter('${m.id}')">
        <i class="fas ${m.icon}"></i>
        <span>${m.label}</span>
        ${this.listFilter === m.id ? '<i class="fas fa-check qlf-check"></i>' : ''}
      </button>`).join('');
    const bar = document.querySelector('.quran-list-filter-bar');
    if (bar) bar.appendChild(menu);
    setTimeout(() => {
      document.addEventListener('click', this._filterOutside = (e) => {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', this._filterOutside);
        }
      });
    }, 20);
  },

  setListFilter(mode) {
    this.listFilter = mode;
    Storage.set('quran_list_filter', mode);
    const menu = document.getElementById('quran-list-filter-menu');
    if (menu) menu.remove();
    this.renderFilteredList();
  },

  renderFilteredList() {
    const label = document.getElementById('quran-list-filter-label');
    const map = {
      surah: t('mushafTabSurahs'),
      juz:   t('mushafTabJuz'),
      hizb:  t('mushafTabHizb'),
      rub:   t('mushafTabRub'),
    };
    if (label) label.textContent = map[this.listFilter] || map.surah;

    if (this.listFilter === 'juz')   return this.renderJuzList();
    if (this.listFilter === 'hizb')  return this.renderHizbList();
    if (this.listFilter === 'rub')   return this.renderRubList();
    return this.renderList(this.surahs);
  },

  _divs() {
    return ((typeof window !== 'undefined') && window.MUSHAF_DIVISIONS) || { juzs: [], rubs: [] };
  },

  _surahNameByNumber(num) {
    const s = (this.surahs || []).find(x => x.number === num);
    if (s) return QuranHelpers.surahDisplayName(s);
    if (typeof QuranOfflineService !== 'undefined') {
      const m = QuranOfflineService.getSurahMeta(num);
      if (m) return QuranHelpers.removeTashkeel(m.name);
    }
    return String(num);
  },

  renderJuzList() {
    const container = document.getElementById('surah-list');
    if (!container) return;
    const juzs = this._divs().juzs || [];
    if (!juzs.length) return this.renderList(this.surahs);
    container.innerHTML = juzs.map(j => `
      <div class="surah-card" onclick="QuranPage.goToSearchResult(${j.s}, ${j.a})">
        <div class="surah-number"><span>${j.juz}</span></div>
        <div class="surah-info">
          <div class="surah-name">${t('mushafJuz')} ${j.juz}</div>
          <div class="surah-meta">${Validate.escapeHTML(this._surahNameByNumber(j.s))} · ${t('ayah')} ${j.a} · ${t('mushafPage')} ${j.page}</div>
        </div>
        <div class="surah-arabic-name">جزء ${this._num(j.juz)}</div>
      </div>
    `).join('');
  },

  renderHizbList() {
    const container = document.getElementById('surah-list');
    if (!container) return;
    const rubs = this._divs().rubs || [];
    const hizbs = rubs.filter(r => ((r.q - 1) % 4) === 0);
    if (!hizbs.length) return this.renderList(this.surahs);
    container.innerHTML = hizbs.map(r => `
      <div class="surah-card" onclick="QuranPage.goToSearchResult(${r.s}, ${r.a})">
        <div class="surah-number"><span>${r.hizb}</span></div>
        <div class="surah-info">
          <div class="surah-name">${t('mushafHizb')} ${r.hizb}</div>
          <div class="surah-meta">${t('mushafJuz')} ${r.juz} · ${Validate.escapeHTML(this._surahNameByNumber(r.s))} · ${t('mushafPage')} ${r.page}</div>
        </div>
        <div class="surah-arabic-name">حزب ${this._num(r.hizb)}</div>
      </div>
    `).join('');
  },

  renderRubList() {
    const container = document.getElementById('surah-list');
    if (!container) return;
    const rubs = this._divs().rubs || [];
    if (!rubs.length) return this.renderList(this.surahs);
    const names = [t('mushafRub1'), t('mushafRub2'), t('mushafRub3'), t('mushafRub4')];
    container.innerHTML = rubs.map(r => {
      const nm = names[(r.q - 1) % 4] || '';
      return `
        <div class="surah-card" onclick="QuranPage.goToSearchResult(${r.s}, ${r.a})">
          <div class="surah-number"><span>${r.id}</span></div>
          <div class="surah-info">
            <div class="surah-name">${nm} — ${t('mushafHizb')} ${r.hizb}</div>
            <div class="surah-meta">${t('mushafJuz')} ${r.juz} · ${Validate.escapeHTML(this._surahNameByNumber(r.s))} · ${t('mushafPage')} ${r.page}</div>
          </div>
          <div class="surah-arabic-name">ربع ${this._num(r.id)}</div>
        </div>
      `;
    }).join('');
  },

  renderList(surahs) {
    const container = document.getElementById('surah-list');
    if (!container) return;
    if (surahs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">${t('error')}</div>
        </div>
      `;
      return;
    }
    const downloaded = this._downloadedNumbers || [];
    container.innerHTML = surahs.map(s => {
      const cleanArName = QuranHelpers.cleanArabicSurahName(s.name);
      const isDown = downloaded.includes(s.number);
      return `
        <div class="surah-card" data-surah="${s.number}" onclick="QuranPage.openSurah(${s.number})">
          <div class="surah-number"><span>${s.number}</span></div>
          <div class="surah-info">
            <div class="surah-name">${Validate.escapeHTML(QuranHelpers.surahDisplayName(s))}</div>
            <div class="surah-meta">${Validate.escapeHTML(QuranHelpers.surahMeaning(s))} • ${s.numberOfAyahs} ${t('ayah').toLowerCase()}s • ${s.revelationType === 'Meccan' ? t('meccan') : t('medinan')} • ${t('surahRevelationOrder')} ${this._revelationOrder(s.number) || '—'}</div>
          </div>
          ${currentLocale !== 'ar' ? `<div class="surah-arabic-name">${cleanArName}</div>` : ''}
          ${isDown ? '<div class="surah-offline-badge"><i class="fas fa-circle-check"></i></div>' : ''}
        </div>
      `;
    }).join('');
  },

  async openSurah(number) {
    Router.push('surah', { surahNumber: number });
  },

  // ============ SURAH DETAIL ============
  async renderDetail(container, params, navToken = null) {
    // v32: si el usuario cambia de idioma (o navega a otra sura) mientras
    // getSurahWithTranslation sigue esperando la red, la promesa vieja podía
    // resolverse DESPUÉS y sobreescribir la lectura ya renderizada con datos
    // obtenidos bajo el idioma/traducción anterior — esa es la causa de que
    // la traducción "desaparezca" (o se vea en el idioma equivocado) al
    // cambiar de idioma. Mismo guard de token que ya usa HomePage.
    const isStale = () => navToken !== null && typeof Router !== 'undefined' && !Router.isCurrent(navToken);

    this.loadReaderSettings();
    this.loadRepeatMode();
    const surahNumber = parseInt(params.surahNumber, 10);
    const targetAyah = params.ayah ? parseInt(params.ayah, 10) : null;
    // v1.0.145: سياق الختمة — هوية الختمة (kid) ووجهة الرجوع الصريحة (back)
    this._kid = (params && params.kid) ? String(params.kid) : null;
    this._kBack = (params && params.back) ? String(params.back) : null;
    this._ward = !!(params && params.ward) || !!this._kid;

    container.innerHTML = `
      <div class="top-bar reader-top-bar">
        <button class="top-bar-btn" onclick="QuranPage.backToList()">
          <i class="fas fa-chevron-${currentLocale === 'ar' ? 'right' : 'left'}"></i>
        </button>
        <div class="top-bar-title">${t('loading')}...</div>
        <div style="width: 30px;"></div>
      </div>
      <div style="padding: var(--sp-md);">
        ${Skeleton.quranReader()}
      </div>
    `;

    try {
      // Make sure reciter isn't Mishary
      if (AppState.settings.reciter === 'ar.alafasy') {
        AppState.settings.reciter = 'ar.husary';
        Storage.saveSettings();
      }

      const surah = await API.getSurahWithTranslation(
        surahNumber,
        AppState.settings.translation,
        AppState.settings.reciter
      );
      if (isStale()) return;
      this.currentSurah = surah;

      // v30: resolver de nuevo aquí — renderDetail puede llamarse con un
      // AppState que aún tenía el valor anterior al cambio de idioma.
      AppState.settings.translation = API.resolveTranslationForLocale(AppState.settings.translation);

      // Strip Bismillah from first ayah on all surahs except Al-Fatihah (1) & At-Tawbah (9)
      const garciaActive = AppState.settings.translation === 'es.garcia_pdf';
      if (QuranHelpers.shouldShowBismillah(surah.number) && surah.ayahs[0]) {
        const a0 = surah.ayahs[0];
        a0.arabicDisplay = QuranHelpers.stripBismillahFromFirstAyah(a0.arabic);
        // Also strip from translation if it starts with Bismillah-equivalent
        // (NO con la edición García: la Basmala traducida se muestra aparte,
        //  y eliminarla aquí dejaría huérfano el inicio de la aleya)
        if (a0.translation && !garciaActive) {
          a0.translation = a0.translation
            .replace(/^\s*[¡¿]?\s*(En\s+el\s+nombre|In\s+the\s+name)\s+de(l)?\s+(Dios|Allā?h|Allah)[\s,\.\-—]+(el\s+)?(Compasivo|Clémente|Misericordioso|Merciful|Most\s+Gracious|the\s+Entirely\s+Merciful)[^\n]{0,80}/i, '')
            .trim();
        }
        // Strip from transliteration
        if (a0.transliteration) {
          a0.transliteration = a0.transliteration
            .replace(/^\s*Bismi(?:\s+All?[aā]h[iua]?|ll?[aā]h[iua]?)\s+\S*[hḥ]m[aā]n[i]?\s+\S*[hḥ][iī]m[i]?\.?\s*/i, '')
            .trim();
        }
      }
      surah.ayahs.forEach(a => {
        if (a.arabicDisplay === undefined) a.arabicDisplay = a.arabic;
      });

      this.renderReader(container, surah);
      this._afterReaderRender();
      // v45: historial de navegación — guarda la aleya de entrada y activa
      // el rastreo de la aleya visible durante la lectura.
      this._saveLastRead(surah.number, targetAyah || 1);
      this._trackLastRead(surah);
      this._kStart(surah);
      if (targetAyah) {
        setTimeout(() => this.scrollToAyah(targetAyah, true), 200);
      }
    } catch (e) {
      if (isStale()) return;
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">${t('error')}: ${escapeHtml(e.message || '')}</div>
          <button class="btn-primary empty-state-btn" onclick="QuranPage.backToList()">${t('backToWisdom')}</button>
        </div>
      `;
    }
  },

  // v36: agrupar آيات السورة حسب رقم الصفحة (مصحف المدينة)، مع الاحتفاظ
  // بجميع الخصائص (تلاوة، ترجمة، ترنسليتريشن، تفسير، مفضلة). يستخدم بيانات
  // window.QURAN_FULL_AR (نفس مصدر صفحة المصحف الكامل).
  _computeAyahPages(surahNum) {
    const all = (typeof window !== 'undefined') && window.QURAN_FULL_AR;
    if (!all || !all.pages) return null;
    const map = new Map(); // ayahNumber -> pageNumber
    for (const pg of all.pages) {
      for (const row of pg.ayahs) {
        if (row[0] === surahNum) map.set(row[1], pg.n);
      }
    }
    return map;
  },

  // v36: ترجع قائمة صفحات مرتبة، كل صفحة = { page, ayahs: [...] }
  _groupAyahsByPage(surah) {
    const pageMap = this._computeAyahPages(surah.number);
    if (!pageMap || !pageMap.size) return null;
    const groups = new Map();
    for (const a of surah.ayahs) {
      const p = pageMap.get(a.number);
      if (!p) continue;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(a);
    }
    // بعض الآيات النادرة قد لا تُطابق مباشرة (اختلاف بسيط) — نضعها في آخر صفحة
    const missing = surah.ayahs.filter(a => !pageMap.has(a.number));
    if (missing.length && groups.size) {
      const lastP = Math.max(...groups.keys());
      groups.get(lastP).push(...missing);
    }
    return Array.from(groups.keys()).sort((a, b) => a - b).map(p => ({ page: p, ayahs: groups.get(p) }));
  },

  renderReader(container, surah) {
    const cleanArName = QuranHelpers.cleanArabicSurahName(surah.name);
    const showBismillah = QuranHelpers.shouldShowBismillah(surah.number);
    const s = this.readerSettings;
    // v35: nombre de la sura según el idioma activo (árabe/español/inglés)
    const displayName = QuranHelpers.surahDisplayName(surah);
    const displayMeaning = QuranHelpers.surahMeaning(surah);

    const repeatIcon = this.repeatMode === 'off' ? 'fa-repeat' :
                       this.repeatMode === 'ayah' ? 'fa-redo' : 'fa-sync-alt';
    const repeatLabel = this.repeatMode === 'off' ? t('repeatOff') :
                       this.repeatMode === 'ayah' ? t('repeatAyah') : t('repeatSurah');
    const bookmarkCount = this.getBookmarks().length;

    // v36: تجميع الآيات حسب رقم الصفحة (مصحف المدينة ٦٠٤)
    const pageGroups = this._groupAyahsByPage(surah);

    container.innerHTML = `
      <div class="top-bar reader-top-bar">
        <button class="top-bar-btn" onclick="QuranPage.backToList()">
          <i class="fas fa-chevron-${currentLocale === 'ar' ? 'right' : 'left'}"></i>
        </button>
        <div class="top-bar-title-container">
          <div class="top-bar-title">${Validate.escapeHTML(displayName)}</div>
          <div class="top-bar-subtitle">${Validate.escapeHTML(displayMeaning)} · ${surah.numberOfAyahs} ${t('ayah').toLowerCase()}s</div>
        </div>
        <button class="top-bar-btn" onclick="QuranPage.openReaderSettings()" title="${t('settings_reader')}">
          <i class="fas fa-sliders-h"></i>
        </button>
      </div>

      <div class="reader-toolbar">
        <button class="toolbar-btn" onclick="QuranPage.openSurahPicker()">
          <i class="fas fa-list-ul"></i> <span>${surah.number}. ${Validate.escapeHTML(displayName)}</span>
        </button>
        <button class="toolbar-btn" onclick="QuranPage.openAyahPicker()" title="${t('jumpToAyah')}">
          <i class="fas fa-hashtag"></i> <span>${t('ayah')} 1</span>
        </button>
        <button class="toolbar-btn" onclick="QuranPage.openMushaf()" title="${t('mushafOpenBtn')}" aria-label="${t('mushafOpenBtn')}">
          <i class="fas fa-book-open"></i>
        </button>
        <button class="toolbar-btn" onclick="QuranPage.openQuranSearch()" title="${t('quranSearchTitle')}" aria-label="${t('quranSearchTitle')}">
          <i class="fas fa-search"></i>
        </button>
        <button class="toolbar-btn ${this.repeatMode !== 'off' ? 'active' : ''}" onclick="QuranPage.openRepeatOptions()" title="${repeatLabel}">
          <i class="fas ${repeatIcon}"></i>
        </button>
        <button class="toolbar-btn bookmark-list-btn" onclick="QuranPage.openBookmarks()" title="${t('bookmarksTitle')}">
          <i class="fas fa-bookmark"></i>${bookmarkCount ? `<span class="bm-badge">${bookmarkCount}</span>` : ''}
        </button>
        <button class="toolbar-btn" onclick="QuranPage.openReadingDuas()" title="${t('readingDuasTitle')}">
          <i class="fas fa-hands-praying"></i>
        </button>
      </div>

      <div id="qr-khatma-strip" class="qr-kstrip" hidden></div>

      <div class="mushaf-page font-${s.fontSize}" id="mushaf-page">
        <div class="surah-banner">
          <div class="surah-banner-decoration">۞</div>
          <div class="surah-banner-content">
            <div class="surah-banner-arabic">${cleanArName}</div>
            <div class="surah-banner-en">${Validate.escapeHTML(QuranHelpers.surahDisplayName(surah))} · ${Validate.escapeHTML(QuranHelpers.surahMeaning(surah))}</div>
            <div class="surah-banner-meta">
              <span><i class="fas fa-${surah.revelationType === 'Meccan' ? 'kaaba' : 'mosque'}"></i> ${surah.revelationType === 'Meccan' ? t('meccan') : t('medinan')}</span>
              <span class="dot-sep">•</span>
              <span>${surah.numberOfAyahs} ${t('ayah').toLowerCase()}s</span>
              <span class="dot-sep">•</span>
              <span><i class="fas fa-arrow-down-wide-short"></i> ${t('surahRevelationOrder')} ${this._revelationOrder(surah.number) || '—'}</span>
            </div>
          </div>
          <div class="surah-banner-decoration">۞</div>
        </div>

        ${showBismillah ? `
          <div class="bismillah-row">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
          ${(AppState.settings.translation === 'es.garcia_pdf' && typeof GarciaData !== 'undefined') ? `
            <div class="bismillah-translation">${GarciaData.BASMALA}</div>
          ` : ''}
        ` : ''}

        <div class="ayahs-container reader-paged" id="ayahs-container">
          ${pageGroups
            ? pageGroups.map(g => `
                <div class="reader-page-section" data-page="${g.page}" id="reader-page-${g.page}">
                  <div class="reader-page-header" onclick="QuranPage.openReaderPagePicker()" title="${t('mushafPage')}">
                    <span class="reader-page-orn">۞</span>
                    <span class="reader-page-label">${t('mushafPage')} <span class="reader-page-num">${this._num(g.page)}</span> / ${this._num(604)}</span>
                    <span class="reader-page-orn">۞</span>
                  </div>
                  ${g.ayahs.map((a, idx) => this.renderAyah(a, idx, surah)).join('')}
                </div>
              `).join('')
            : surah.ayahs.map((a, idx) => this.renderAyah(a, idx, surah)).join('')
          }
        </div>

        <div class="surah-nav-footer">
          ${surah.number > 1 ? `
            <button class="nav-btn prev" onclick="QuranPage.goToSurah(${surah.number - 1})">
              <i class="fas fa-chevron-${currentLocale === 'ar' ? 'right' : 'left'}"></i>
              <div class="nav-btn-text">
                <div class="nav-btn-label">${t('previousSurah')}</div>
                <div class="nav-btn-name">${surah.number - 1}. ${this.getSurahNameByNumber(surah.number - 1)}</div>
              </div>
            </button>
          ` : '<div></div>'}
          ${surah.number < 114 ? `
            <button class="nav-btn next" onclick="QuranPage.goToSurah(${surah.number + 1})">
              <div class="nav-btn-text">
                <div class="nav-btn-label">${t('nextSurah')}</div>
                <div class="nav-btn-name">${surah.number + 1}. ${this.getSurahNameByNumber(surah.number + 1)}</div>
              </div>
              <i class="fas fa-chevron-${currentLocale === 'ar' ? 'left' : 'right'}"></i>
            </button>
          ` : '<div></div>'}
        </div>
      </div>

    `;

    // v36: تفعيل السحب الأفقي للتنقل بين السور مثل صفحة المصحف الكامل
    this._bindReaderSwipe(surah);

    // v1.0.141: العودة من المصحف الكامل تهبط على نفس الصفحة داخل الترجمة
    try {
      const tp = parseInt(Storage.get('quran_target_page'), 10);
      if (tp) {
        Storage.remove('quran_target_page');
        setTimeout(() => {
          const el = document.getElementById('reader-page-' + tp);
          if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }, 260);
      }
    } catch (e) {}
  },

  // v36: يفتح المصحف الكامل على الصفحة المحددة
  openMushafPage(pageNum) {
    Router.push('mushaf', { page: pageNum });
  },

  // v58: اختيار رقم الصفحة داخل القرآن المترجم — التنقل بين مقاطع الصفحات
  // داخل القارئ نفسه (لا يفتح المصحف العربي). إن كانت الصفحة خارج السورة
  // الحالية يفتح السورة التي تبدأ بها تلك الصفحة عند أول آية فيها.
  openReaderPagePicker() {
    const surah = this.currentSurah;
    if (!surah) return;
    const groups = this._groupAyahsByPage(surah) || [];
    const html = `
      <div class="modal-header">
        <div class="modal-title">${t('mushafPage')} (1–604)</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="picker-search">
        <i class="fas fa-hashtag"></i>
        <input type="number" id="reader-page-input" min="1" max="604" placeholder="${t('mushafPage')} #" autocomplete="off">
        <button class="btn-primary" style="padding: 8px 16px;" onclick="QuranPage.jumpToReaderPageInput()">${t('mushafGo')}</button>
      </div>
      ${groups.length ? `
        <div class="settings-label" style="padding:12px 4px 6px;">${Validate.escapeHTML(QuranHelpers.surahDisplayName(surah))}</div>
        <div class="ayah-number-grid">
          ${groups.map(g => `<button class="ayah-num-btn" onclick="QuranPage.jumpToReaderPage(${g.page})">${this._num(g.page)}</button>`).join('')}
        </div>
      ` : ''}
    `;
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(() => document.getElementById('reader-page-input')?.focus(), 100);
    document.getElementById('reader-page-input')?.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.jumpToReaderPageInput();
    });
  },

  jumpToReaderPageInput() {
    const input = document.getElementById('reader-page-input');
    if (!input) return;
    const n = parseInt(input.value, 10);
    if (n >= 1 && n <= 604) this.jumpToReaderPage(n);
  },

  jumpToReaderPage(pageNum) {
    closeModal();
    const el = document.getElementById('reader-page-' + pageNum);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('highlight');
      setTimeout(() => el.classList.remove('highlight'), 1500);
      return;
    }
    // الصفحة ليست ضمن السورة الحالية — انتقل للسورة التي تحتوي بدايتها
    const all = (typeof window !== 'undefined') && window.QURAN_FULL_AR;
    const pg = all && all.pages ? all.pages.find(x => x.n === pageNum) : null;
    const first = pg && pg.ayahs && pg.ayahs[0];
    if (first) Router.push('surah', { surahNumber: first[0], ayah: first[1] });
  },

  // v36: السحب الأفقي في القرآن المترجم — للتنقل بين السور (كامل السورة
  // في اتجاه، والسابقة/التالية في الاتجاه المعاكس)، متوافق مع اتجاه RTL
  _bindReaderSwipe(surah) {
    const mc = document.getElementById('main-content');
    if (!mc) return;
    // نظّف المعالجات السابقة إن وُجدت
    if (this._readerSwipeHandlers) {
      const h = this._readerSwipeHandlers;
      try { mc.removeEventListener('touchstart', h.ts); } catch (e) {}
      try { mc.removeEventListener('touchend', h.te); } catch (e) {}
      this._readerSwipeHandlers = null;
    }
    let x = null, y = null;
    const ts = e => {
      const tt = e.touches[0];
      x = tt.clientX; y = tt.clientY;
    };
    const te = e => {
      if (x === null) return;
      // v43: لا تعمل إلا ونحن فعلاً داخل قارئ السور — حماية إضافية لو بقي
      // المعالج لسبب ما بعد الانتقال لصفحة أخرى.
      if (typeof Router !== 'undefined' && Router.current
          && !['quran', 'surah'].includes(Router.current.name)) { x = null; return; }
      const tt = e.changedTouches[0];
      const dx = tt.clientX - x;
      const dy = tt.clientY - y;
      x = null;
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        // اتجاه القرآن (RTL): السحب لليمين ⇐ التالية، لليسار ⇐ السابقة
        if (dx > 0 && surah.number < 114) this.goToSurah(surah.number + 1);
        else if (dx < 0 && surah.number > 1) this.goToSurah(surah.number - 1);
      }
    };
    mc.addEventListener('touchstart', ts, { passive: true });
    mc.addEventListener('touchend', te, { passive: true });
    this._readerSwipeHandlers = { ts, te };
  },

  renderAyah(a, idx, surah) {
    const s = this.readerSettings;
    const showTranslit = s.showTransliteration && currentLocale !== 'ar' && a.transliteration;
    const showTrans = s.showTranslation;
    const bm = this.getBookmarkFor(surah.number, a.number);

    return `
      <div class="ayah-block ${bm ? `bookmarked bm-${bm.c}` : ''}" id="ayah-${a.number}" data-ayah="${a.number}">
        <div class="ayah-arabic-line" dir="rtl">
          <span class="ayah-arabic-text">${s.tajweedColors && typeof TajweedColors !== 'undefined' ? TajweedColors.colorize(a.arabicDisplay || a.arabic) : Validate.escapeHTML(a.arabicDisplay || a.arabic)}</span>
          <span class="ayah-end-marker ayah-end-marker-lg" title="${t('ayah')} ${a.number}">﴿<span class="ayah-end-num">${this._num(a.number)}</span>﴾</span>
        </div>

        ${showTranslit ? `
          <div class="ayah-transliteration">
            <span class="translit-label">📢</span>
            ${Validate.escapeHTML(a.transliteration)}
          </div>
        ` : ''}

        ${showTrans && a.translation ? `
          <div class="ayah-translation">${Validate.escapeHTML(this._num(a.translation))}</div>
        ` : ''}

        <div class="ayah-actions">
          <button class="ayah-action-btn" onclick="QuranPage.playAyah(${a.number}, '${Validate.safeUrl(a.audio)}')" id="play-btn-${a.number}" title="${t('play')}">
            <i class="fas fa-play"></i>
          </button>
          <button class="ayah-action-btn repeat-btn ${this.repeatMode === 'ayah' ? 'active' : ''}" onclick="QuranPage.openRepeatOptions(${a.number})" id="repeat-btn-${a.number}" title="${t('repeatAudio')}">
            <i class="fas fa-redo"></i>
          </button>
          <button class="ayah-action-btn tafsir-btn" onclick="QuranPage.openTafsir(${surah.number}, ${a.number})" title="${t('tafsir')}">
            <i class="fas fa-book"></i> <span>${t('tafsir')}</span>
          </button>
          <button class="ayah-action-btn" onclick="QuranPage.copyAyah(${surah.number}, ${a.number})" title="${t('copy')}">
            <i class="fas fa-copy"></i>
          </button>
          <button class="ayah-action-btn" onclick="QuranPage.shareAyah(${surah.number}, ${a.number})" title="${t('share')}">
            <i class="fas fa-share-alt"></i>
          </button>
          <button class="ayah-action-btn" onclick="QuranPage.toggleBookmark(${surah.number}, ${a.number})" id="bookmark-${a.number}" title="${t('bookmark')}">
            ${bm ? `<i class="fas fa-bookmark" style="color:${this.BOOKMARK_COLORS[bm.c]};"></i>` : '<i class="far fa-bookmark"></i>'}
          </button>
        </div>
      </div>
    `;
  },

  // ============ AD'IYAS DE LECTURA DEL CORÁN (أدعية قراءة القرآن) ============
  // Icono de manos unidas 🤲: abre las du'as de antes de leer, al terminar
  // la lectura y al completar el Corán (Jatm). Datos en data/duas/quran_reading_duas.js
  openReadingDuas() {
    const DUAS = (typeof QURAN_READING_DUAS !== 'undefined') ? QURAN_READING_DUAS : [];
    const cards = DUAS.map(d => {
      const title = d[`title_${currentLocale}`] || d.title_en;
      const tr = d[`translation_${currentLocale}`] || '';
      return `
        <div class="qd-card">
          <div class="qd-card-head">
            <span class="qd-card-icon">${d.icon}</span>
            <div class="qd-card-title">${Validate.escapeHTML(title)}</div>
          </div>
          ${d.preamble ? `<div class="qd-arabic qd-preamble" dir="rtl">${Validate.escapeHTML(d.preamble)}</div>` : ''}
          <div class="qd-arabic" dir="rtl">${Validate.escapeHTML(d.arabic)}</div>
          <div class="qd-translit">${Validate.escapeHTML(d.transliteration)}</div>
          ${tr ? `<div class="qd-translation">${Validate.escapeHTML(tr)}</div>` : ''}
          <div class="qd-source"><i class="fas fa-book-open"></i> ${Validate.escapeHTML(d.source)}</div>
        </div>`;
    }).join('');

    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">🤲 ${t('readingDuasTitle')}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="qd-body">${cards}</div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  // ============ SMART QURAN SEARCH (بحث ذكي بدون تشكيل) ============
  // Buscador global de aleyas: normaliza la entrada (sin tashkeel, sin
  // distinción alef/hamza, ي/ى, ة/ه) y busca en TODO el Corán de forma local
  // e instantánea. Al pulsar un resultado se abre la sura en esa aleya.
  openQuranSearch() {
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">🔍 ${t('quranSearchTitle')}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="picker-search qs-search-row">
        <i class="fas fa-search"></i>
        <input type="text" id="qs-input" placeholder="${t('quranSearchPlaceholder')}" autocomplete="off" dir="auto">
        <button class="qs-clear-btn hidden" id="qs-clear" onclick="QuranPage.clearQuranSearch()" aria-label="×"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="qs-hint" id="qs-hint"><i class="fas fa-circle-info"></i> ${t('quranSearchHint')}</div>
      <div class="qs-results-meta" id="qs-meta"></div>
      <div class="picker-list qs-results" id="qs-results"></div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');

    const input = document.getElementById('qs-input');
    setTimeout(() => input?.focus(), 120);

    input.addEventListener('input', e => {
      const q = e.target.value;
      document.getElementById('qs-clear')?.classList.toggle('hidden', !q);
      clearTimeout(this._qsTimer);
      this._qsTimer = setTimeout(() => this._runQuranSearch(q.trim()), 200);
    });
  },

  clearQuranSearch() {
    const input = document.getElementById('qs-input');
    if (input) { input.value = ''; input.focus(); }
    document.getElementById('qs-clear')?.classList.add('hidden');
    const meta = document.getElementById('qs-meta');
    if (meta) meta.textContent = '';
    const res = document.getElementById('qs-results');
    if (res) res.innerHTML = '';
    const hint = document.getElementById('qs-hint');
    if (hint) hint.style.display = '';
  },

  _runQuranSearch(q) {
    const resEl = document.getElementById('qs-results');
    const metaEl = document.getElementById('qs-meta');
    const hintEl = document.getElementById('qs-hint');
    if (!resEl || typeof QuranSearch === 'undefined') return;

    if (!q || q.length < 2) {
      resEl.innerHTML = q && q.length === 1
        ? `<div class="empty-state-mini">${t('quranSearchMinChars')}</div>`
        : '';
      if (metaEl) metaEl.textContent = '';
      if (hintEl) hintEl.style.display = '';
      return;
    }

    if (hintEl) hintEl.style.display = 'none';
    const results = QuranSearch.search(q, 100);

    if (!results.length) {
      if (metaEl) metaEl.textContent = '';
      resEl.innerHTML = `
        <div class="empty-state-mini qs-empty">
          <div class="empty-state-icon">🔎</div>
          ${Validate.escapeHTML(t('quranSearchEmpty').replace('%s', q))}
        </div>`;
      return;
    }

    const more = results.length >= 100 ? '+' : '';
    if (metaEl) metaEl.textContent = `${results.length}${more} ${t('quranSearchResults')}`;

    resEl.innerHTML = results.map(r => {
      const meta = (typeof QuranOfflineService !== 'undefined') ? QuranOfflineService.getSurahMeta(r.s) : null;
      const surahName = meta ? QuranHelpers.surahDisplayName(meta) : String(r.s);
      const arName = meta ? QuranHelpers.removeTashkeel(meta.name) : '';
      return `
        <div class="picker-item qs-result-item" onclick="QuranPage.goToSearchResult(${r.s}, ${r.a})">
          <div class="qs-result-head">
            <span class="qs-result-ref"><i class="fas fa-book-open"></i> ${r.s}. ${Validate.escapeHTML(surahName)} · ${t('ayah')} ${r.a}</span>
            <span class="qs-result-ar-name">${Validate.escapeHTML(arName)}</span>
          </div>
          <div class="qs-result-text" dir="rtl">${QuranSearch.highlight(r.text, q)}</div>
        </div>
      `;
    }).join('');
  },

  goToSearchResult(surahNum, ayahNum) {
    closeModal();
    // v36: إغلاق قائمة البحث الموحد المنسدلة إن كانت مفتوحة
    if (typeof this.clearUnifiedSearch === 'function') {
      try { this.clearUnifiedSearch(); } catch (e) {}
    }
    // v45 FIX: no basta con que `currentSurah` coincida en memoria (sobrevive
    // al salir de la sura); hay que comprobar que la aleya existe en el DOM.
    if (this.currentSurah && this.currentSurah.number === surahNum
        && document.getElementById(`ayah-${ayahNum}`)) {
      this.scrollToAyah(ayahNum, true);
    } else {
      Router.push('surah', { surahNumber: surahNum, ayah: ayahNum });
    }
  },

  // ============ المصحف — صفحة كاملة (الفاتحة → الناس، أوفلاين) ============
  // v1.0.141: يفتح المصحف على الصفحة التي يقرأها المستخدم الآن (كان يفتح آخر صفحة محفوظة)
  currentPage() {
    const secs = Array.from(document.querySelectorAll('.reader-page-section'));
    if (!secs.length) return null;
    const mc = document.getElementById('main-content');
    const top = (mc ? mc.getBoundingClientRect().top : 0) + 24;
    let cur = secs[0];
    for (const s of secs) { if (s.getBoundingClientRect().top <= top) cur = s; }
    return parseInt(cur.dataset.page, 10) || null;
  },

  openMushaf() {
    let pg = null;
    try { pg = this.currentPage(); } catch (e) {}
    if (!pg) pg = this._kPage || parseInt(Storage.get('mushaf_last_page'), 10) || 1;
    // v1.0.145: يُمرَّر سياق الختمة فيبقى الورد وشريطه في المصحف
    Router.push('mushaf', { page: pg, kid: this._kid || undefined, ward: this._kid ? 1 : undefined });
  },

  // ============ NAVIGATION ============
  backToList() {
    // v1.0.145: العودة إلى من فتح القارئ (الختمة) بدل قائمة القرآن دائمًا
    const back = this._kBack;
    this.cleanup();
    if (back && Router.routes[back]) { Router.go(back, {}, { replace: true }); return; }
    Router.go('quran/read');
  },

  goToSurah(num) {
    if (num < 1 || num > 114) return;
    this.cleanup();
    Router.push('surah', { surahNumber: num });
  },

  scrollToAyah(ayahNumber, highlight = false) {
    const el = document.getElementById(`ayah-${ayahNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (highlight) {
        el.classList.add('highlight');
        setTimeout(() => el.classList.remove('highlight'), 2000);
      }
      // v45: cualquier salto explícito a una aleya cuenta como lectura
      if (this.currentSurah) this._saveLastRead(this.currentSurah.number, ayahNumber);
    }
  },

  getSurahNameByNumber(num) {
    const s = this.surahs.find(x => x.number === num);
    return s ? QuranHelpers.surahDisplayName(s) : '';
  },

  // ============ PICKERS ============
  openSurahPicker() {
    const current = this.currentSurah?.number;
    const html = `
      <div class="modal-header">
        <div class="modal-title">${t('surahs')}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="picker-search">
        <i class="fas fa-search"></i>
        <input type="text" id="picker-search-input" placeholder="${t('searchSurah')}" autocomplete="off">
      </div>
      <div class="picker-list" id="picker-list">
        ${this.renderPickerList(this.surahs, current)}
      </div>
    `;
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');

    document.getElementById('picker-search-input')?.addEventListener('input', e => {
      const q = e.target.value.trim();
      const filtered = q ? this.surahs.filter(s => QuranHelpers.surahMatches(s, q)) : this.surahs;
      document.getElementById('picker-list').innerHTML = this.renderPickerList(filtered, current);
    });

    setTimeout(() => {
      const el = document.querySelector('.picker-item.current');
      if (el) el.scrollIntoView({ block: 'center' });
    }, 100);
  },

  renderPickerList(surahs, current) {
    if (!surahs.length) return `<div class="empty-state-mini">${t('noResults') || 'No'}</div>`;
    return surahs.map(s => {
      const cleanName = QuranHelpers.removeTashkeel(s.name);
      const isCurrent = s.number === current;
      return `
        <div class="picker-item ${isCurrent ? 'current' : ''}" onclick="QuranPage.pickSurah(${s.number})">
          <div class="picker-num">${s.number}</div>
          <div class="picker-info">
            <div class="picker-name">${Validate.escapeHTML(QuranHelpers.surahDisplayName(s))}</div>
            <div class="picker-meta">${Validate.escapeHTML(QuranHelpers.surahMeaning(s))} · ${s.numberOfAyahs} ${t('ayah').toLowerCase()}s</div>
          </div>
          <div class="picker-arabic">${cleanName}</div>
        </div>
      `;
    }).join('');
  },

  pickSurah(num) {
    closeModal();
    // v36: إغلاق قائمة البحث المنسدلة إن كانت مفتوحة
    if (typeof this.clearUnifiedSearch === 'function') {
      try { this.clearUnifiedSearch(); } catch (e) {}
    }
    this.goToSurah(num);
  },

  openAyahPicker() {
    if (!this.currentSurah) return;
    const total = this.currentSurah.numberOfAyahs;
    const grid = [];
    for (let i = 1; i <= total; i++) grid.push(i);

    const html = `
      <div class="modal-header">
        <div class="modal-title">${t('jumpToAyah')} (${this._num(1)}-${this._num(total)})</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="picker-search">
        <i class="fas fa-hashtag"></i>
        <input type="number" id="ayah-input" min="1" max="${total}" placeholder="${t('ayah')} #" autocomplete="off">
        <button class="btn-primary" style="padding: 8px 16px;" onclick="QuranPage.jumpToInputAyah()">${t('jumpToAyah')}</button>
      </div>
      <div class="ayah-number-grid">
        ${grid.map(n => `<button class="ayah-num-btn" onclick="QuranPage.jumpToAyahInPage(${n})">${n}</button>`).join('')}
      </div>
    `;
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(() => document.getElementById('ayah-input')?.focus(), 100);
    document.getElementById('ayah-input')?.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.jumpToInputAyah();
    });
  },

  jumpToInputAyah() {
    const input = document.getElementById('ayah-input');
    if (!input) return;
    const n = parseInt(input.value, 10);
    if (n && n >= 1 && n <= this.currentSurah.numberOfAyahs) {
      this.jumpToAyahInPage(n);
    }
  },

  jumpToAyahInPage(ayahNumber) {
    closeModal();
    this.scrollToAyah(ayahNumber, true);
  },

  // ============ READER SETTINGS ============
  openReaderSettings() {
    const s = this.readerSettings;
    const localeKey = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    const html = `
      <div class="modal-header">
        <div class="modal-title">${t('settings_reader')}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>

      <div class="settings-group">
        <div class="settings-label">${t('fontSize')}</div>
        <div class="font-size-options">
          ${['small', 'medium', 'large', 'xlarge'].map(size => `
            <button class="font-opt ${s.fontSize === size ? 'active' : ''}" onclick="QuranPage.setFontSize('${size}', this)">
              <span class="font-opt-letter font-${size}-preview">أ</span>
              <span class="font-opt-label">${size === 'small' ? 'A' : size === 'medium' ? 'AA' : size === 'large' ? 'AAA' : 'AAAA'}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="settings-group">
        <label class="settings-toggle">
          <span>${t('transliteration')}</span>
          <input type="checkbox" ${s.showTransliteration ? 'checked' : ''} onchange="QuranPage.toggleSetting('showTransliteration', this.checked)">
          <span class="toggle-slider"></span>
        </label>
        <label class="settings-toggle">
          <span>${t('translation')}</span>
          <input type="checkbox" ${s.showTranslation ? 'checked' : ''} onchange="QuranPage.toggleSetting('showTranslation', this.checked)">
          <span class="toggle-slider"></span>
        </label>
        <label class="settings-toggle">
          <span>🎨 ${t('tajweedColors')}</span>
          <input type="checkbox" ${s.tajweedColors ? 'checked' : ''} onchange="QuranPage.toggleSetting('tajweedColors', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-group">
        <div class="settings-label">🎤 ${t('reciter') || 'Recitador'}</div>
        ${(CONFIG.RECITERS || []).map(r => `
          <div class="tafsir-option ${AppState.settings.reciter === r.id ? 'active' : ''}" onclick="QuranPage.setReciter('${r.id}', this)">
            <div class="tafsir-opt-info">
              <div class="tafsir-opt-name">${CONFIG.reciterName ? CONFIG.reciterName(r) : r.name}</div>
              <div class="tafsir-opt-desc">${(CONFIG.reciterCountry ? CONFIG.reciterCountry(r) : r.country) || ''}</div>
            </div>
            ${AppState.settings.reciter === r.id ? '<i class="fas fa-check-circle"></i>' : ''}
          </div>
        `).join('')}
      </div>

      <div class="settings-group">
        <div class="settings-label">${t('selectTafsir')}</div>
        ${TafsirService.getAvailableTafsirs(localeKey).map(tf => `
          <div class="tafsir-option ${s.tafsir === tf.id ? 'active' : ''}" onclick="QuranPage.setTafsir('${tf.id}', this)">
            <div class="tafsir-opt-info">
              <div class="tafsir-opt-name">${tf.name}</div>
              <div class="tafsir-opt-desc">${tf.desc}</div>
            </div>
            ${s.tafsir === tf.id ? '<i class="fas fa-check-circle"></i>' : ''}
          </div>
        `).join('')}
      </div>
    `;
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  setReciter(reciterId, el) {
    AppState.settings.reciter = reciterId;
    Storage.saveSettings();
    // Update UI: mark selected
    if (el && el.parentElement) {
      el.parentElement.querySelectorAll('.tafsir-option').forEach(o => o.classList.remove('active'));
      el.classList.add('active');
    }
    // Invalidate cached surah audio
    if (this.currentSurah && this.currentSurah.number) {
      const num = this.currentSurah.number;
      // Re-fetch surah with new reciter next time (clear cache key)
      // v31: la clave real lleva el sufijo de versión — antes no coincidía
      // y la sura quedaba sirviéndose con el recitador/traducción anterior.
      try {
        const ver = (typeof API !== 'undefined' && API.SURAH_CACHE_VER) || 'v4';
        localStorage.removeItem(`quba_surah_${num}_${AppState.settings.translation}_${AppState.settings.reciter}_${ver}`);
      } catch (e) {}
    }
    const recMeta = CONFIG.RECITERS.find(r => r.id === reciterId);
    showToast('✅ ' + (recMeta && CONFIG.reciterName ? CONFIG.reciterName(recMeta) : (recMeta?.name || '')), 1500);
    // v27: el audio ya no se descarga solo al cambiar de recitador — el
    // usuario elige qué suras descargar desde el gestor (icono de descarga).
  },

  setFontSize(size, btn) {
    this.readerSettings.fontSize = size;
    this.saveReaderSettings();
    // v1.0.141: حجم الخط مشترك مع المصحف الكامل
    try { Storage.set('mushaf_font', size); if (typeof QuranMushafPage !== 'undefined') QuranMushafPage.fontSize = size; } catch (e) {}
    const page = document.getElementById('mushaf-page');
    if (page) {
      page.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
      page.classList.add(`font-${size}`);
    }
    if (btn) {
      btn.parentElement.querySelectorAll('.font-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  },

  toggleSetting(key, value) {
    this.readerSettings[key] = value;
    this.saveReaderSettings();
    // v51: إعادة عرض القارئ كاملاً — تحافظ على تجميع الصفحات وتطبّق ألوان التجويد فوراً
    if (this.currentSurah) {
      this.renderReader(document.getElementById('main-content'), this.currentSurah);
      this._afterReaderRender();
    }
  },

  setTafsir(tafsirId, btn) {
    this.readerSettings.tafsir = tafsirId;
    this.saveReaderSettings();
    if (btn) {
      btn.parentElement.querySelectorAll('.tafsir-option').forEach(o => o.classList.remove('active'));
      btn.classList.add('active');
    }
    showToast('✓');
  },

  // ============ TAFSIR (Fixed mobile tabs + better translation) ============
  async openTafsir(surahNum, ayahNum) {
    const localeKey = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    const targetLangLabel = { es: 'Español', en: 'English', ar: 'العربية' }[currentLocale] || 'Español';

    // v32: token propio — si el usuario cierra este tafsir y abre otro (u
    // otra aleya) antes de que termine la descarga, la respuesta vieja ya no
    // debe pisar el modal nuevo (mismo problema de fondo que en renderDetail:
    // "el tafsir no aparece al cambiarlo" cuando la respuesta tardía gana).
    this._tafsirToken = (this._tafsirToken || 0) + 1;
    const myTafsirToken = this._tafsirToken;

    // Prefetch local tafsir so it shows instantly (works 100% offline)
    TafsirService.getTafsir(surahNum, ayahNum, this.readerSettings.tafsir, localeKey).catch(() => {});

    const html = `
      <div class="modal-header">
        <div class="modal-title">${t('tafsirOf')} ${surahNum}:${ayahNum}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="tafsir-content" id="tafsir-content">
        ${Skeleton.tafsir()}
      </div>
    `;
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');

    try {
      const tafsir = await TafsirService.getTafsir(
        surahNum, ayahNum,
        this.readerSettings.tafsir,
        localeKey
      );
      if (myTafsirToken !== this._tafsirToken) return;

      const ayah = this.currentSurah?.ayahs.find(a => a.number === ayahNum);
      const content = document.getElementById('tafsir-content');
      if (!content) return;

      // Default tab is translated (unless in arabic locale)
      // Consider translation "useful" only if it's not nearly empty
      const hasTranslation = tafsir.translated
        && tafsir.translated.trim().length > 20
        && currentLocale !== 'ar';
      const translationFailed = currentLocale !== 'ar' && (!tafsir.translated || tafsir.translated.trim().length <= 20);

      content.innerHTML = `
        ${ayah ? `
          <div class="tafsir-ayah-preview">
            <div class="tafsir-ayah-arabic" dir="rtl">${ayah.arabic}</div>
            ${ayah.translation && currentLocale !== 'ar' ? `<div class="tafsir-ayah-trans">"${Validate.escapeHTML(ayah.translation)}"</div>` : ''}
          </div>
        ` : ''}

        <div class="tafsir-source-line">
          <i class="fas fa-book"></i>
          ${t('tafsirSource')}: <strong>${tafsir.source}</strong> ${tafsir.sourceAr && currentLocale !== 'ar' ? `(${tafsir.sourceAr})` : ''}
        </div>
        ${(typeof MufradatService !== 'undefined') ? MufradatService.panelHtml(surahNum, ayahNum) : ''}

        ${hasTranslation ? `
          <div class="tafsir-tabs" role="tablist">
            <button class="tafsir-tab active" data-tab="translated" onclick="QuranPage.switchTafsirTab(event, 'translated')" type="button">
              <i class="fas fa-language"></i> ${targetLangLabel}
            </button>
            <button class="tafsir-tab" data-tab="arabic" onclick="QuranPage.switchTafsirTab(event, 'arabic')" type="button">
              ﺍ ${t('arabicOriginal')}
            </button>
          </div>

          <div class="tafsir-body tafsir-body-translated" id="tafsir-translated">
            ${this.escapeHtml(tafsir.translated)}
            <div class="tafsir-disclaimer">
              <i class="fas fa-check-circle"></i> ${t('tafsirOffline')}.
            </div>
          </div>

          <div class="tafsir-body tafsir-body-arabic" id="tafsir-arabic" style="display: none;" dir="rtl">
            ${this.escapeHtml(tafsir.arabic)}
          </div>
        ` : `
          ${translationFailed ? `
            <div class="tafsir-translation-error">
              <i class="fas fa-exclamation-triangle"></i>
              <span>${t('translationUnavailable') || 'Traducción automática no disponible. Mostrando texto original en árabe.'}</span>
              <button class="btn-ghost btn-small" onclick="QuranPage.retryTafsirTranslation(${surahNum}, ${ayahNum})">
                <i class="fas fa-redo"></i> ${t('retry') || 'Reintentar'}
              </button>
            </div>
          ` : ''}
          <div class="tafsir-body tafsir-body-arabic" dir="rtl">
            ${this.escapeHtml(tafsir.arabic)}
          </div>
        `}
      `;
    } catch (e) {
      if (myTafsirToken !== this._tafsirToken) return;
      const content = document.getElementById('tafsir-content');
      if (content) {
        const esc = (typeof escapeHtml === 'function') ? escapeHtml : this.escapeHtml.bind(this);
        content.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <div class="empty-state-text">${t('error')}: ${esc(String(e.message || ''))}</div>
          </div>
        `;
      }
    }
  },

  escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  // Force re-fetch of tafsir, bypassing cache (for failed translations)
  async retryTafsirTranslation(surahNum, ayahNum) {
    // Clear ALL tafsir cache entries (memory + localStorage) — the old code removed a
    // key that never matched the real cache key, so retry never actually re-fetched.
    if (typeof TafsirService !== 'undefined') {
      if (TafsirService.clearCache) TafsirService.clearCache();
      if (TafsirService.clearGarciaCache) TafsirService.clearGarciaCache(); // v30: las notas de García también se guardaban permanentes
    }
    this.openTafsir(surahNum, ayahNum);
  },

  switchTafsirTab(event, tab) {
    event.preventDefault();
    event.stopPropagation();
    // Toggle tab buttons
    document.querySelectorAll('.tafsir-tab').forEach(b => b.classList.remove('active'));
    const targetBtn = event.currentTarget || event.target.closest('.tafsir-tab');
    if (targetBtn) targetBtn.classList.add('active');

    const tr = document.getElementById('tafsir-translated');
    const ar = document.getElementById('tafsir-arabic');
    if (tab === 'translated') {
      if (tr) tr.style.display = 'block';
      if (ar) ar.style.display = 'none';
    } else {
      if (tr) tr.style.display = 'none';
      if (ar) ar.style.display = 'block';
    }
  },

  // ============ GESTOR DE DESCARGAS DE AUDIO (v27) ============
  // El audio de recitación (pesado) ya no se descarga automáticamente: se
  // pide permiso una vez y el usuario elige recitador + sura. Cada descarga
  // muestra su tamaño, puede borrarse, y puede guardarse en el dispositivo
  // como MP3 para escucharla sin abrir la app.

  _attachAudioEvents() {
    if (this._audioEventsAttached || typeof QuranOfflineService === 'undefined') return;
    this._audioEventsAttached = true;
    QuranOfflineService.onProgress(evt => {
      if (!evt || typeof evt.type !== 'string' || !evt.type.startsWith('audio')) return;
      this.updateAudioDownloadBadge();
      // Si el gestor está abierto, refrescar su contenido en vivo
      if (document.getElementById('audio-manager-body')) {
        if (evt.type === 'audio-progress') this._updateAudioManagerProgress();
        else if (evt.type === 'audio-complete') {
          showToast('✅ ' + t('audioDownloaded'));
          this._renderAudioManagerBody();
        } else if (evt.type === 'audio-deleted' || evt.type === 'audio-paused' || evt.type === 'audio-error') {
          this._renderAudioManagerBody();
        }
      }
    });
  },

  updateAudioDownloadBadge() {
    const btn = document.getElementById('quran-audio-dl-btn');
    if (!btn || typeof QuranOfflineService === 'undefined') return;
    const count = QuranOfflineService.getAudioDownloadCount();
    const active = QuranOfflineService._audioDownloading;
    btn.classList.toggle('downloading', !!active);
    btn.innerHTML = `<i class="fas fa-${active ? 'spinner fa-spin' : 'cloud-arrow-down'}"></i>${count ? `<span class="quran-dl-badge">${count}</span>` : ''}`;
  },

  // Ventana de permiso: se muestra una sola vez (o al pulsar el icono de
  // descarga si nunca se respondió). El texto y el tafsir siguen siendo
  // automáticos; solo el audio necesita permiso por su tamaño.
  maybeShowAudioPermission(force = false) {
    if (typeof QuranOfflineService === 'undefined' || !QuranOfflineService._audioCacheSupported()) return;
    const decision = Storage.get('audio_download_permission');
    if (!force && decision) return; // ya respondió (granted/declined)
    if (!force && document.getElementById('offline-download-banner')?.innerHTML) {
      // Dejar respirar al usuario si el banner de texto está en pantalla
      setTimeout(() => this.maybeShowAudioPermission(), 4000);
      return;
    }
    const estTotal = QuranOfflineService.formatBytes(QuranOfflineService.estimateTotalAudioBytes());
    const _recMeta = CONFIG.RECITERS.find(r => r.id === AppState.settings.reciter);
    const reciterName = (_recMeta && CONFIG.reciterName ? CONFIG.reciterName(_recMeta) : (_recMeta?.name)) || '';
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">🎧 ${t('audioPermissionTitle')}</div>
        <button class="modal-close" onclick="QuranPage.dismissAudioPermission()">×</button>
      </div>
      <div class="audio-permission-body">
        <div class="audio-permission-icon"><i class="fas fa-headphones"></i></div>
        <p>${t('audioPermissionBody')}</p>
        <div class="audio-permission-meta">
          <span><i class="fas fa-microphone"></i> ${reciterName}</span>
          <span><i class="fas fa-database"></i> ~${estTotal}</span>
        </div>
        <div class="audio-permission-note"><i class="fas fa-circle-info"></i> ${t('audioPermissionNote')}</div>
        <div class="audio-permission-actions">
          <button class="btn-primary" onclick="QuranPage.grantAudioPermission()">
            <i class="fas fa-check"></i> ${t('audioPermissionAllow')}
          </button>
          <button class="btn-ghost" onclick="QuranPage.dismissAudioPermission()">${t('audioPermissionLater')}</button>
        </div>
      </div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  grantAudioPermission() {
    Storage.set('audio_download_permission', 'granted');
    this.openAudioManager();
  },

  dismissAudioPermission() {
    // No insistir en esta sesión de arranque; el icono sigue disponible
    Storage.set('audio_download_permission', 'declined');
    closeModal();
  },

  // Ventana de descarga: recitador + sura, con tamaño, borrado y exportación.
  openAudioManager() {
    this._attachAudioEvents();
    if (typeof QuranOfflineService === 'undefined' || !QuranOfflineService._audioCacheSupported()) {
      showToast('⚠️');
      return;
    }
    if (!this._amReciter) this._amReciter = AppState.settings.reciter;
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">⬇️ ${t('audioDownloadsTitle')}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div id="audio-manager-body"></div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
    this._renderAudioManagerBody();
  },

  _renderAudioManagerBody() {
    const body = document.getElementById('audio-manager-body');
    if (!body || typeof QuranOfflineService === 'undefined') return;
    const svc = QuranOfflineService;
    const reciter = this._amReciter || AppState.settings.reciter;
    const reciterMeta = CONFIG.RECITERS.find(r => r.id === reciter) || CONFIG.RECITERS[0];
    const reciterLabel = CONFIG.reciterName ? CONFIG.reciterName(reciterMeta) : reciterMeta.name;
    const surahNum = Math.min(114, Math.max(1, parseInt(this._amSurah || this.currentSurah?.number || 1, 10)));
    const surahMeta = svc.getSurahMeta(surahNum);
    const surahName = surahMeta ? QuranHelpers.surahDisplayName(surahMeta) : String(surahNum);
    const downloaded = svc.isSurahAudioDownloaded(reciter, surahNum);
    const rec = svc.getAudioDownloads().find(d => d.reciter === reciter && d.surah === surahNum);
    const sizeLabel = svc.formatBytes(rec?.bytes || svc.estimateSurahBytes(surahNum));
    const dl = svc._audioDl;
    const isThis = dl && dl.reciter === reciter && dl.surah === surahNum;
    // v60: estado de pausa reanudable para esta sura/recitador
    const paused = !isThis && !svc._audioDownloading && svc._pausedAt && svc._pausedAt.reciter === reciter && svc._pausedAt.surah === surahNum;
    const all = svc.getAudioDownloads();
    const totalBytes = all.reduce((s, d) => s + (d.bytes || 0), 0);

    body.innerHTML = `
      <div class="audio-manager">
        <div class="am-selectors">
          <div class="am-field">
            <div class="am-label"><i class="fas fa-microphone"></i> ${t('reciter')}</div>
            <button class="am-select" onclick="QuranPage.openAudioReciterPicker()">
              <span>${reciterLabel}</span><i class="fas fa-chevron-down"></i>
            </button>
          </div>
          <div class="am-field">
            <div class="am-label"><i class="fas fa-book-open"></i> ${t('surah')}</div>
            <button class="am-select" onclick="QuranPage.openAudioSurahPicker()">
              <span>${surahNum}. ${Validate.escapeHTML(surahName)}</span><i class="fas fa-chevron-down"></i>
            </button>
          </div>
        </div>

        <div class="am-all-row">
          <button class="btn-ghost am-all-btn" ${svc._audioDownloading || this._dlAllActive ? 'disabled' : ''} onclick="QuranPage.downloadAllReciterAudio()">
            <i class="fas fa-cloud-arrow-down"></i> ${t('audioDownloadAll') || 'تحميل كل السور لهذا القارئ'}
          </button>
          ${this._dlAllActive ? `<button class="btn-ghost am-danger" onclick="QuranPage.cancelDownloadAll()"><i class="fas fa-stop"></i> ${t('audioCancel')}</button>` : ''}
        </div>

        ${this._dlAllActive ? `
          <div class="am-overall" id="am-overall">
            <div class="am-overall-text" id="am-overall-text">${t('audioOverall')}: ${this._dlAllDone || 0}/${this._dlAllTotal || 114}</div>
            <div class="am-progress-track"><div class="am-progress-fill" id="am-overall-fill" style="width:${Math.round(((this._dlAllDone || 0) / (this._dlAllTotal || 114)) * 100)}%"></div></div>
          </div>` : ''}

        <div class="am-target-card">
          <div class="am-target-info">
            <div class="am-target-name">${surahNum}. ${Validate.escapeHTML(surahName)}</div>
            <div class="am-target-meta">
              <span><i class="fas fa-microphone"></i> ${reciterLabel}</span>
              <span><i class="fas fa-database"></i> ${rec ? '' : '~'}${sizeLabel}</span>
              <span><i class="fas fa-list-ol"></i> ${surahMeta?.numberOfAyahs || ''} ${t('ayah').toLowerCase()}s</span>
            </div>
          </div>
          ${isThis ? `
            <div class="am-progress">
              <div class="am-progress-track"><div class="am-progress-fill" id="am-progress-fill" style="width:${Math.round((dl.done / dl.total) * 100)}%"></div></div>
              <div class="am-progress-text" id="am-progress-text">${dl.done}/${dl.total} · ${svc.formatBytes(dl.bytes)}</div>
              <div class="am-progress-btns">
                <button class="btn-ghost btn-small" onclick="QuranPage.pauseAudioDownload()"><i class="fas fa-pause"></i> ${t('audioPause')}</button>
                <button class="btn-ghost btn-small" onclick="QuranOfflineService.cancelDownload(); QuranPage._renderAudioManagerBody();"><i class="fas fa-stop"></i> ${t('audioCancel')}</button>
              </div>
            </div>
          ` : paused ? `
            <div class="am-progress">
              <div class="am-status warn"><i class="fas fa-pause-circle"></i> ${t('audioPaused')} · ${svc._pausedAt.done}/${svc._pausedAt.total}</div>
              <div class="am-progress-track"><div class="am-progress-fill" style="width:${Math.round((svc._pausedAt.done / svc._pausedAt.total) * 100)}%"></div></div>
              <div class="am-actions">
                <button class="btn-primary" onclick="QuranPage.resumeAudioDownload()"><i class="fas fa-play"></i> ${t('audioResume')}</button>
                <button class="btn-ghost am-danger" onclick="QuranPage.discardPausedDownload()"><i class="fas fa-trash-alt"></i> ${t('audioDelete')}</button>
              </div>
            </div>
          ` : downloaded ? `
            <div class="am-status ok"><i class="fas fa-circle-check"></i> ${t('audioSavedOffline')} · ${sizeLabel}</div>
            <div class="am-actions">
              <button class="btn-primary" onclick="QuranPage.exportSurahAudio()"><i class="fas fa-file-arrow-down"></i> ${t('audioSaveToDevice')}</button>
              <button class="btn-ghost am-danger" onclick="QuranPage.deleteSurahAudio()"><i class="fas fa-trash-alt"></i> ${t('audioDelete')}</button>
            </div>
          ` : `
            <div class="am-actions">
              <button class="btn-primary" ${svc._audioDownloading ? 'disabled' : ''} onclick="QuranPage.downloadSurahAudio()">
                <i class="fas fa-cloud-arrow-down"></i> ${t('audioDownload')} (~${sizeLabel})
              </button>
              <button class="btn-ghost" onclick="QuranPage.exportSurahAudio()"><i class="fas fa-file-arrow-down"></i> ${t('audioSaveToDevice')}</button>
            </div>
          `}
        </div>

        ${all.length ? `
          <div class="am-downloaded-head">
            <span><i class="fas fa-hard-drive"></i> ${t('audioDownloadedList')} · ${svc.formatBytes(totalBytes)}</span>
            <button class="btn-ghost btn-small am-danger" onclick="QuranPage.deleteAllAudio()"><i class="fas fa-trash-alt"></i> ${t('audioDeleteAll')}</button>
          </div>
          <div class="am-downloaded-list">
            ${all.sort((a, b) => a.surah - b.surah).map(d => {
              const m = svc.getSurahMeta(d.surah);
              const rMeta = CONFIG.RECITERS.find(r => r.id === d.reciter);
              const rName = (rMeta && CONFIG.reciterName ? CONFIG.reciterName(rMeta) : rMeta?.name) || d.reciter;
              return `
                <div class="am-downloaded-item">
                  <div class="am-downloaded-info">
                    <div class="am-downloaded-name">${d.surah}. ${Validate.escapeHTML(m ? QuranHelpers.surahDisplayName(m) : String(d.surah))}</div>
                    <div class="am-downloaded-meta">${rName} · ${svc.formatBytes(d.bytes)}</div>
                  </div>
                  <button class="am-mini-btn" title="${t('audioSaveToDevice')}" onclick="QuranPage.exportSurahAudioFor('${d.reciter}', ${d.surah})"><i class="fas fa-file-arrow-down"></i></button>
                  <button class="am-mini-btn am-danger" title="${t('audioDelete')}" onclick="QuranPage.deleteSurahAudioFor('${d.reciter}', ${d.surah})"><i class="fas fa-trash-alt"></i></button>
                </div>
              `;
            }).join('')}
          </div>
        ` : `<div class="empty-state-mini">🎧 ${t('audioNoDownloads')}</div>`}

        <div class="audio-permission-note"><i class="fas fa-wifi"></i> ${t('audioManagerNote')}</div>
      </div>
    `;
  },

  _updateAudioManagerProgress() {
    const svc = QuranOfflineService;
    const dl = svc._audioDl;
    if (!dl) return;
    const fill = document.getElementById('am-progress-fill');
    const text = document.getElementById('am-progress-text');
    if (fill) fill.style.width = Math.round((dl.done / dl.total) * 100) + '%';
    if (text) text.textContent = `${dl.done}/${dl.total} · ${svc.formatBytes(dl.bytes)}`;
    // v60: progreso global de «descargar todo» (sura X de 114 + aleyas)
    const oTxt = document.getElementById('am-overall-text');
    if (oTxt) oTxt.textContent = `${t('audioOverall')}: ${this._dlAllDone || 0}/${this._dlAllTotal || 114} · ${t('surah')} ${this._dlAllCurrent || dl.surah} — ${dl.done}/${dl.total}`;
    const oFill = document.getElementById('am-overall-fill');
    if (oFill) oFill.style.width = Math.round(((this._dlAllDone || 0) / (this._dlAllTotal || 114)) * 100) + '%';
  },

  openAudioReciterPicker() {
    const current = this._amReciter;
    document.getElementById('audio-manager-body').innerHTML = `
      <div class="am-picker-head">
        <button class="btn-ghost btn-small" onclick="QuranPage._renderAudioManagerBody()"><i class="fas fa-chevron-left"></i> ${t('backToWisdom')}</button>
        <div class="am-label">${t('reciter')}</div>
      </div>
      <div class="picker-list">
        ${(CONFIG.RECITERS || []).map(r => `
          <div class="picker-item ${r.id === current ? 'current' : ''}" onclick="QuranPage.pickAudioReciter('${r.id}')">
            <div class="picker-info">
              <div class="picker-name">${CONFIG.reciterName ? CONFIG.reciterName(r) : r.name}</div>
              <div class="picker-meta">${(CONFIG.reciterCountry ? CONFIG.reciterCountry(r) : r.country) || ''}</div>
            </div>
            ${r.id === current ? '<i class="fas fa-check-circle"></i>' : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  pickAudioReciter(id) {
    this._amReciter = id;
    this._renderAudioManagerBody();
  },

  openAudioSurahPicker() {
    const svc = QuranOfflineService;
    const current = Math.min(114, Math.max(1, parseInt(this._amSurah || this.currentSurah?.number || 1, 10)));
    document.getElementById('audio-manager-body').innerHTML = `
      <div class="am-picker-head">
        <button class="btn-ghost btn-small" onclick="QuranPage._renderAudioManagerBody()"><i class="fas fa-chevron-left"></i> ${t('backToWisdom')}</button>
        <div class="am-label">${t('surah')}</div>
      </div>
      <div class="picker-search">
        <i class="fas fa-search"></i>
        <input type="text" id="am-surah-search" placeholder="${t('searchSurah')}" autocomplete="off">
      </div>
      <div class="picker-list" id="am-surah-list">${this._renderAudioSurahList(this.surahs.length ? this.surahs : svc.getSurahList(), current)}</div>
    `;
    document.getElementById('am-surah-search')?.addEventListener('input', e => {
      const q = e.target.value.trim();
      const src = this.surahs.length ? this.surahs : svc.getSurahList();
      const filtered = q ? src.filter(s => QuranHelpers.surahMatches(s, q)) : src;
      document.getElementById('am-surah-list').innerHTML = this._renderAudioSurahList(filtered, current);
    });
  },

  _renderAudioSurahList(surahs, current) {
    const svc = QuranOfflineService;
    return surahs.map(s => {
      const isDown = svc.isSurahAudioDownloaded(this._amReciter, s.number);
      return `
        <div class="picker-item ${s.number === current ? 'current' : ''}" onclick="QuranPage.pickAudioSurah(${s.number})">
          <div class="picker-num">${s.number}</div>
          <div class="picker-info">
            <div class="picker-name">${Validate.escapeHTML(QuranHelpers.surahDisplayName(s))}</div>
            <div class="picker-meta">${svc.formatBytes(svc.estimateSurahBytes(s.number))}${isDown ? ' · ✔' : ''}</div>
          </div>
          ${isDown ? '<i class="fas fa-circle-check" style="color:var(--success)"></i>' : ''}
        </div>
      `;
    }).join('');
  },

  pickAudioSurah(num) {
    this._amSurah = num;
    this._renderAudioManagerBody();
  },

  async downloadSurahAudio() {
    const svc = QuranOfflineService;
    const reciter = this._amReciter || AppState.settings.reciter;
    const surahNum = Math.min(114, Math.max(1, parseInt(this._amSurah || 1, 10)));
    if (!navigator.onLine) { showToast('📴 ' + t('quranDownloadPaused')); return; }
    this._renderAudioManagerBody();
    const ok = await svc.downloadSurahAudio(reciter, surahNum);
    this.updateAudioDownloadBadge();
    if (ok) showToast('✅ ' + t('audioDownloaded'));
    this._renderAudioManagerBody();
  },

  // v58: تحميل كل السور دفعة واحدة للقارئ المختار (مع إمكانية الإيقاف)
  async downloadAllReciterAudio() {
    const svc = QuranOfflineService;
    if (this._dlAllActive) return;
    const reciter = this._amReciter || AppState.settings.reciter;
    if (!navigator.onLine) { showToast('📴 ' + t('quranDownloadPaused')); return; }
    const list = svc.getSurahList ? svc.getSurahList() : [];
    if (!list.length) return;
    this._dlAllActive = true;
    this._dlAllStop = false;
    this._dlAllTotal = list.length;
    this._dlAllDone = 0;
    this._dlAllCurrent = '';
    this._renderAudioManagerBody();
    let doneCount = 0;
    for (const s of list) {
      if (this._dlAllStop || svc._cancelRequested) break;
      if (svc.isSurahAudioDownloaded(reciter, s.number)) { doneCount++; this._dlAllDone = doneCount; continue; }
      if (!navigator.onLine) { showToast('📴 ' + t('quranDownloadPaused')); break; }
      this._dlAllCurrent = s.number;
      const ok = await svc.downloadSurahAudio(reciter, s.number);
      if (ok) doneCount++;
      this._dlAllDone = doneCount;
      this.updateAudioDownloadBadge();
      if (svc._cancelRequested || this._dlAllStop) break;
    }
    this._dlAllActive = false;
    showToast(doneCount >= list.length ? ('✅ ' + t('audioDownloaded')) : ('⏸️ ' + doneCount + '/' + list.length), 2500);
    this._renderAudioManagerBody();
  },

  cancelDownloadAll() {
    this._dlAllStop = true;
    QuranOfflineService.cancelDownload();
  },

  // v60: pausar la descarga en curso (conserva el progreso para reanudar)
  pauseAudioDownload() {
    QuranOfflineService.pauseDownload();
    // El evento 'audio-paused' redibuja el gestor con el botón «Reanudar»
  },

  // v60: reanudar desde el punto de pausa
  resumeAudioDownload() {
    if (!navigator.onLine) { showToast('📴 ' + t('quranDownloadPaused')); return; }
    QuranOfflineService.resumeSurahAudio();
    this._renderAudioManagerBody();
  },

  // v60: descartar la pausa (el usuario no quiere seguir con esa descarga)
  discardPausedDownload() {
    QuranOfflineService._pausedAt = null;
    this._renderAudioManagerBody();
  },

  async deleteSurahAudio() {
    const svc = QuranOfflineService;
    await svc.deleteSurahAudio(this._amReciter || AppState.settings.reciter, Math.min(114, Math.max(1, parseInt(this._amSurah || 1, 10))));
    this.updateAudioDownloadBadge();
    showToast('🗑️ ' + t('audioDeleted'));
    this._renderAudioManagerBody();
  },

  async deleteSurahAudioFor(reciter, surah) {
    await QuranOfflineService.deleteSurahAudio(reciter, surah);
    this.updateAudioDownloadBadge();
    showToast('🗑️ ' + t('audioDeleted'));
    this._renderAudioManagerBody();
  },

  async deleteAllAudio() {
    await QuranOfflineService.deleteAllAudio();
    this.updateAudioDownloadBadge();
    showToast('🗑️ ' + t('audioDeleted'));
    this._renderAudioManagerBody();
  },

  async exportSurahAudio() {
    await this.exportSurahAudioFor(this._amReciter || AppState.settings.reciter, Math.min(114, Math.max(1, parseInt(this._amSurah || 1, 10))));
  },

  async exportSurahAudioFor(reciter, surah) {
    showToast('⏳ ' + t('audioPreparingFile'), 1500);
    const res = await QuranOfflineService.exportSurahAudio(reciter, surah);
    if (res.ok) {
      showToast(`💾 ${res.name} (${QuranOfflineService.formatBytes(res.bytes)})`, 3500);
    } else if (!navigator.onLine) {
      showToast('📴 ' + t('audioExportOfflineFail'), 3500);
    } else {
      showToast('⚠️ ' + t('error'), 2500);
    }
  },

  // ============ خيارات تكرار التلاوة (v51) ============
  // زر التكرار (في الشريط العلوي أو تحت الآية) يفتح صفحة صغيرة فيها:
  // وضع التكرار + عدد التكرارات (للسورة/للآية) + نطاق من آية إلى آية.
  openRepeatOptions(ayahNum) {
    if (!this.currentSurah) return;
    this._repeatSheetAyah = ayahNum ?? null; // v52: تذكّر الآية صاحبة الزر عند إعادة رسم النافذة
    const cfg = this.repeatConfig || { ayah: 0, surah: 0, from: 1, to: this.currentSurah.numberOfAyahs };
    const total = this.currentSurah.numberOfAyahs;
    const chips = [1, 2, 3, 5, 10, 0];
    const modes = [
      ['off', t('repeatOff')],
      ['ayah', t('repeatAyah')],
      ['surah', t('repeatSurah')],
    ];
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fas fa-repeat"></i> ${t('repeatAudio')}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="rp-sheet">
        <div class="settings-group">
          <div class="rp-modes">
            ${modes.map(([m, label]) => `
              <button class="rp-mode ${this.repeatMode === m ? 'active' : ''}" onclick="QuranPage.setRepeatMode('${m}', this)">${label}</button>
            `).join('')}
          </div>
        </div>
        ${this.repeatMode === 'ayah' ? `
        <div class="settings-group">
          <div class="settings-label">${t('repeatCountAyah')}</div>
          <div class="rp-chips">
            ${chips.map(c => `<button class="rp-chip ${cfg.ayah === c ? 'active' : ''}" onclick="QuranPage.setRepeatCount('ayah', ${c}, this)">${c === 0 ? '∞' : this._num(c)}</button>`).join('')}
          </div>
        </div>
        <div class="settings-group">
          <div class="settings-label">${t('repeatRange')}</div>
          <div class="rp-range-row">
            <label>${t('repeatFromAyah')} <input type="number" id="rp-from" class="rp-num-input" min="1" max="${total}" value="${Math.min(cfg.from, total)}"></label>
            <label>${t('repeatToAyah')} <input type="number" id="rp-to" class="rp-num-input" min="1" max="${total}" value="${Math.min(cfg.to, total)}"></label>
          </div>
        </div>
        ` : ''}
        ${this.repeatMode === 'surah' ? `
        <div class="settings-group">
          <div class="settings-label">${t('repeatCountSurah')}</div>
          <div class="rp-chips">
            ${chips.map(c => `<button class="rp-chip ${cfg.surah === c ? 'active' : ''}" onclick="QuranPage.setRepeatCount('surah', ${c}, this)">${c === 0 ? '∞' : this._num(c)}</button>`).join('')}
          </div>
        </div>
        ` : ''}
        <button class="btn-primary rp-apply" onclick="QuranPage.applyRepeatOptions(${ayahNum ?? 'null'})">
          <i class="fas fa-check"></i> ${t('repeatAudio')}
        </button>
      </div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  setRepeatMode(mode, btn) {
    this.repeatMode = mode;
    this._repeatCount = 0;
    this.saveRepeatMode();
    if (btn) {
      btn.parentElement.querySelectorAll('.rp-mode').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    // v52: أعد رسم النافذة لإظهار إعدادات الوضع المختار فقط
    // (تكرار آية ⇐ عدد تكرار الآية + النطاق | تكرار سورة ⇐ عدد تكرار السورة)
    if (mode !== 'off') this.openRepeatOptions(this._repeatSheetAyah);
  },

  setRepeatCount(kind, val, btn) {
    this.repeatConfig[kind] = val;
    this.saveRepeatMode();
    if (btn) {
      btn.parentElement.querySelectorAll('.rp-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  },

  applyRepeatOptions(ayahNum) {
    const total = this.currentSurah?.numberOfAyahs || 1;
    // حقول النطاق تظهر فقط في وضع تكرار الآية — بدونها يبقى النطاق كاملاً
    const fromEl = document.getElementById('rp-from');
    const toEl = document.getElementById('rp-to');
    let from = fromEl ? (parseInt(fromEl.value, 10) || 1) : 1;
    let to = toEl ? (parseInt(toEl.value, 10) || total) : total;
    from = Math.min(Math.max(1, from), total);
    to = Math.min(Math.max(1, to), total);
    if (to < from) { const tmp = from; from = to; to = tmp; }
    this.repeatConfig.from = from;
    this.repeatConfig.to = to;
    this._repeatCount = 0;
    // زر التكرار تحت آية: يبدأ النطاق من تلك الآية نفسها
    // (إن لم يحدّد المستخدم «إلى آية» يبقى حتى نهاية السورة)
    if (this.repeatMode === 'ayah' && ayahNum) {
      this.repeatConfig.from = ayahNum;
      if (!toEl) this.repeatConfig.to = total;
    }
    this.saveRepeatMode();
    closeModal();
    const labels = { off: t('repeatOff'), ayah: t('repeatAyah'), surah: t('repeatSurah') };
    showToast(labels[this.repeatMode]);
    if (this.currentSurah) {
      this.renderReader(document.getElementById('main-content'), this.currentSurah);
    }
    // بدء التشغيل من نقطة التكرار المحددة
    if (this.repeatMode !== 'off') {
      const startNum = (this.repeatMode === 'ayah' && ayahNum) ? ayahNum : this.repeatConfig.from;
      const a = this.currentSurah?.ayahs.find(x => x.number === startNum) || this.currentSurah?.ayahs[0];
      if (a) this.playAyah(a.number, a.audio);
    }
  },


  // ======================================================================
  // v1.0.143 — وضع القراءة الصافي + شريط التلاوة العائم
  // ======================================================================
  _qrbStrings() {
    const L = {
      ar: { now: 'قيد التلاوة', pause: 'إيقاف مؤقت', resume: 'متابعة', stop: 'إيقاف', repeat: 'تكرار', reciter: 'القارئ', ayah: 'آية', hint: 'اضغط مرة أخرى لإظهار الأدوات' },
      es: { now: 'Recitando', pause: 'Pausar', resume: 'Seguir', stop: 'Detener', repeat: 'Repetir', reciter: 'Recitador', ayah: 'Aleya', hint: 'Toca otra vez para mostrar las herramientas' },
      en: { now: 'Playing', pause: 'Pause', resume: 'Resume', stop: 'Stop', repeat: 'Repeat', reciter: 'Reciter', ayah: 'Ayah', hint: 'Tap again to show the tools' }
    };
    return L[currentLocale] || L.es;
  },

  _ensureRecBar() {
    let bar = document.getElementById('qr-audio-bar');
    if (bar) return bar;
    const L = this._qrbStrings();
    bar = document.createElement('div');
    bar.id = 'qr-audio-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', L.now);
    bar.innerHTML = `
      <div class="qrab-top">
        <span class="qrab-dot" aria-hidden="true"></span>
        <div class="qrab-meta">
          <div class="qrab-title" id="qrab-title"></div>
          <div class="qrab-sub" id="qrab-sub"></div>
        </div>
        <button class="qrab-close" onclick="QuranPage.stopRecitation()" aria-label="${L.stop}"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="qrab-btns">
        <button class="qrab-btn" id="qrab-toggle" onclick="QuranPage.toggleRecitation()"><i class="fas fa-pause"></i><span></span></button>
        <button class="qrab-btn" onclick="QuranPage.stopRecitation()"><i class="fas fa-stop"></i><span>${L.stop}</span></button>
        <button class="qrab-btn" id="qrab-repeat" onclick="QuranPage.openRepeatOptions()"><i class="fas fa-redo"></i><span>${L.repeat}</span></button>
        <button class="qrab-btn" onclick="QuranPage.openReciterPicker()"><i class="fas fa-user-tie"></i><span>${L.reciter}</span></button>
      </div>`;
    document.body.appendChild(bar);
    return bar;
  },

  _showRecBar(num) {
    this._ensureRecBar();
    this._syncRecBar(num);
    const bar = document.getElementById('qr-audio-bar');
    requestAnimationFrame(() => {
      bar.classList.add('on');
      document.body.classList.add('qrab-open');
    });
  },

  _hideRecBar() {
    const bar = document.getElementById('qr-audio-bar');
    if (bar) bar.classList.remove('on');
    document.body.classList.remove('qrab-open');
  },

  _syncRecBar(num) {
    const bar = document.getElementById('qr-audio-bar');
    if (!bar) return;
    const L = this._qrbStrings();
    const n = (num != null) ? num : (this.playingAyah || this._recPausedNum);
    const titleEl = document.getElementById('qrab-title');
    const subEl = document.getElementById('qrab-sub');
    if (titleEl) titleEl.textContent = L.now;
    if (subEl) {
      const sname = this.currentSurah ? QuranHelpers.surahDisplayName(this.currentSurah) : '';
      subEl.textContent = (sname ? sname : '') + (n ? (sname ? ' · ' : '') + L.ayah + ' ' + this._num(n) : '');
    }
    const tg = document.getElementById('qrab-toggle');
    if (tg) {
      const paused = !this.playingAyah && !!this._recPausedNum;
      tg.innerHTML = paused
        ? `<i class="fas fa-play"></i><span>${L.resume}</span>`
        : `<i class="fas fa-pause"></i><span>${L.pause}</span>`;
    }
    const rp = document.getElementById('qrab-repeat');
    if (rp) {
      const m = this.repeatMode || 'off';
      rp.classList.toggle('active', m !== 'off');
      const icons = { off: 'fa-redo', ayah: 'fa-redo', surah: 'fa-sync-alt' };
      rp.innerHTML = `<i class="fas ${icons[m] || 'fa-redo'}"></i><span>${L.repeat}</span>`;
    }
    bar.setAttribute('aria-label', L.now);
  },

  toggleRecitation() {
    const player = document.getElementById('audio-player');
    if (!player) return;
    if (this.playingAyah) {
      const num = this.playingAyah;
      this._stopAyahTr();
      player.pause();
      this.playingAyah = null;
      this._recPausedNum = num;
      document.getElementById(`ayah-${num}`)?.classList.remove('playing');
      if (typeof WakeLockService !== 'undefined') WakeLockService.release();
      this._syncRecBar(num);
    } else if (this._recPausedNum) {
      const num = this._recPausedNum;
      player.play().catch(() => {});
      this.playingAyah = num;
      document.getElementById(`ayah-${num}`)?.classList.add('playing');
      if (typeof WakeLockService !== 'undefined') WakeLockService.acquire('recitation');
      this._syncRecBar(num);
    }
  },

  stopRecitation() {
    // v1.0.143: إيقاف تام — يُلغي أي متابعة تلقائية معلّقة عبر رمز جيل
    this._recToken = (this._recToken || 0) + 1;
    const player = document.getElementById('audio-player');
    this._stopAyahTr();
    if (player) {
      try { player.pause(); player.onended = null; player.removeAttribute('src'); player.load(); } catch (e) {}
    }
    document.querySelectorAll('.ayah-block.playing').forEach(b => b.classList.remove('playing'));
    document.querySelectorAll('[id^="play-btn-"]').forEach(b => { b.innerHTML = '<i class="fas fa-play"></i>'; });
    this.playingAyah = null;
    this._recPausedNum = null;
    this._repeatCount = 0;
    if (typeof WakeLockService !== 'undefined') WakeLockService.release();
    this._hideRecBar();
    const mc = document.getElementById('main-content');
    if (mc) { mc.classList.remove('reader-immersive'); }
  },

  openReciterPicker() {
    const L = this._qrbStrings();
    const recs = (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.RECITERS)) ? CONFIG.RECITERS : [];
    const cur = AppState.settings.reciter;
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">🎤 ${L.reciter}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="rp-sheet">
        <div class="settings-group">
          ${recs.map(r => `
            <div class="tafsir-option ${cur === r.id ? 'active' : ''}" onclick="QuranPage.changeReciter('${r.id}', this)">
              <div class="tafsir-opt-info">
                <div class="tafsir-opt-name">${CONFIG.reciterName ? CONFIG.reciterName(r) : r.name}</div>
                <div class="tafsir-opt-desc">${(CONFIG.reciterCountry ? CONFIG.reciterCountry(r) : r.country) || ''}</div>
              </div>
              ${cur === r.id ? '<i class="fas fa-check-circle"></i>' : ''}
            </div>`).join('')}
        </div>
      </div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  async changeReciter(reciterId, el) {
    const surahNum = this.currentSurah && this.currentSurah.number;
    const resumeAt = this.playingAyah || this._recPausedNum;
    const host = document.getElementById('main-content');
    const keepScroll = host ? host.scrollTop : 0;
    this.setReciter(reciterId, el);
    try { closeModal(); } catch (e) {}
    this.stopRecitation();
    if (!surahNum) return;
    try {
      const surah = await API.getSurahWithTranslation(surahNum, AppState.settings.translation, AppState.settings.reciter);
      if (!surah) return;
      surah.ayahs.forEach(a => { if (a.arabicDisplay === undefined) a.arabicDisplay = a.arabic; });
      this.currentSurah = surah;
      this.renderReader(host || document.getElementById('main-content'), surah);
      this._afterReaderRender();
      if (host) host.scrollTop = keepScroll;
      if (resumeAt) {
        const a = surah.ayahs.find(x => x.number === resumeAt);
        if (a) setTimeout(() => this.playAyah(a.number, a.audio), 250);
      }
    } catch (e) { /* يبقى القارئ كما هو */ }
  },

  // --- لمسة واحدة: إخفاء/إظهار أدوات الصفحة ---
  _afterReaderRender() {
    const mc = document.getElementById('mushaf-page');
    if (!mc) return;
    this._detachImmersiveTap();
    const onTap = (ev) => {
      if (ev.target && ev.target.closest &&
          ev.target.closest('button, a, input, textarea, select, audio, .ayah-actions, .modal-overlay, .modal-content, #qr-audio-bar')) return;
      this.toggleReaderChrome();
    };
    this._immersiveTap = onTap;
    mc.addEventListener('click', onTap);
    if (this.playingAyah || this._recPausedNum) {
      const n = this.playingAyah || this._recPausedNum;
      if (this.playingAyah) {
        document.getElementById('ayah-' + n)?.classList.add('playing');
        const b = document.getElementById('play-btn-' + n);
        if (b) b.innerHTML = '<i class="fas fa-pause"></i>';
      }
      this._showRecBar(n);
    }
  },

  _detachImmersiveTap() {
    const mc = document.getElementById('mushaf-page');
    if (mc && this._immersiveTap) mc.removeEventListener('click', this._immersiveTap);
    this._immersiveTap = null;
  },

  toggleReaderChrome(force) {
    const host = document.getElementById('main-content');
    if (!host) return;
    const hide = (force === 'hide') ? true : (force === 'show') ? false : !host.classList.contains('reader-immersive');
    host.classList.toggle('reader-immersive', hide);
    if (host.scrollTop < 60) {
      // أعلى الصفحة: الأعلى لا يتحرك — يكفي التحريك البصري
    }
    if (hide) this._showImmersiveHint();
  },

  _showImmersiveHint() {
    try {
      if (Storage.get('qr_immersive_hint_seen')) return;
      Storage.set('qr_immersive_hint_seen', true);
      if (typeof showToast === 'function') showToast('👆 ' + this._qrbStrings().hint, 2400);
    } catch (e) {}
  },

  _clearReaderChrome() {
    const host = document.getElementById('main-content');
    if (host) host.classList.remove('reader-immersive');
    this._detachImmersiveTap();
    this._recPausedNum = null;
    this._recToken = (this._recToken || 0) + 1;
    this._hideRecBar();
  },

  // v27: si la aleya está descargada en la caché, se sirve como Blob local
  // (funciona sin conexión). La pausa/reanudación se maneja antes de la
  // resolución async para que el botón responda al instante.
  async playAyah(num, audioUrl) {
    const player = document.getElementById('audio-player');
    if (!player || !audioUrl || audioUrl === 'null' || audioUrl === '') return;
    const _tok = this._recToken || 0;
    this._recPausedNum = null;

    if (this.playingAyah === num) {
      this._stopAyahTr(); // v64: إسكات ترجمة قيد النطق عند الإيقاف المؤقت
      player.pause();
      this.playingAyah = null;
      document.getElementById(`ayah-${num}`)?.classList.remove('playing');
      // 🔦 Liberar WakeLock cuando se pausa
      if (typeof WakeLockService !== 'undefined') WakeLockService.release();
      this._recPausedNum = num;
      this._syncRecBar(num);
      return;
    }

    if (this.playingAyah !== null) {
      const prevBtn = document.getElementById('play-btn-' + this.playingAyah);
      if (prevBtn) prevBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    // Resolver desde la caché offline (si existe) → Blob local
    try {
      if (typeof QuranOfflineService !== 'undefined') {
        const ayah = this.currentSurah?.ayahs?.find(a => a.number === num);
        audioUrl = await QuranOfflineService.getPlayableUrl(audioUrl, ayah?.numberGlobal, AppState.settings.reciter);
      }
    } catch (e) {}

    if (this._lastBlobUrl && this._lastBlobUrl !== audioUrl) {
      try { URL.revokeObjectURL(this._lastBlobUrl); } catch (e) {}
    }
    this._lastBlobUrl = audioUrl.startsWith('blob:') ? audioUrl : null;
    if (_tok !== (this._recToken || 0)) return; // أُوقفت التلاوة أثناء انتظار الملف

    player.src = audioUrl;
    player.play().catch(e => console.warn('Audio:', e));
    this.playingAyah = num;
    this._showRecBar(num);
    this._trSpokenFor = null; // v64: آية جديدة — يُسمح بقراءة ترجمتها صوتيًا

    // v28 FIX: si el CDN bloquea la URL directa (403 a 128 kbps para varios
    // recitadores: Sudais, Ghamdi, Abdul Basit), el audio fallaba en SILENCIO.
    // Ahora se reintenta con la cadena de respaldo (caché → 64k → everyayah)
    // y la aleya suena desde un Blob local.
    player.onerror = async () => {
      if (this._audioFallbackFor === num) { player.onerror = null; return; } // ya reintentado
      this._audioFallbackFor = num;
      try {
        const ayah = this.currentSurah?.ayahs?.find(a => a.number === num);
        if (typeof QuranOfflineService !== 'undefined' && ayah && ayah.numberGlobal) {
          const blob = await QuranOfflineService._fetchAyahAudioBlob(
            ayah.numberGlobal,
            AppState.settings.reciter,
            (this.currentSurah && this.currentSurah.number) || null,
            num
          );
          if (blob) {
            const fbUrl = URL.createObjectURL(blob);
            if (this._lastBlobUrl && this._lastBlobUrl !== fbUrl) {
              try { URL.revokeObjectURL(this._lastBlobUrl); } catch (e) {}
            }
            this._lastBlobUrl = fbUrl;
            player.onerror = null;
            player.src = fbUrl;
            player.play().catch(() => {});
            return;
          }
        }
      } catch (e) { /* sin más fuentes */ }
      player.onerror = null;
      if (typeof showToast === 'function') showToast('⚠️ ' + (t('error') || 'Error'), 2000);
    };

    // 🔦 Adquirir WakeLock durante la recitación
    if (typeof WakeLockService !== 'undefined') WakeLockService.acquire('recitation');

    const btn = document.getElementById('play-btn-' + num);
    if (btn) btn.innerHTML = '<i class="fas fa-pause"></i>';

    document.querySelectorAll('.ayah-block').forEach(b => b.classList.remove('playing'));
    document.getElementById(`ayah-${num}`)?.classList.add('playing');

    player.onended = () => {
      if (_tok !== (this._recToken || 0)) return; // تلاوة أُوقفت — لا تابع
      setTimeout(() => { if (!this.playingAyah && !this._recPausedNum) this._hideRecBar(); }, 1200);
      // v64: بعد انتهاء التلاوة العربية تُقرأ الترجمة صوتيًا (إن فُعّلت الخاصية
      // من الإعدادات) — آية بالعربي ثم ترجمتها، مثل فيديوهات القرآن المترجم.
      if (this._speakTranslationAfter(num)) return;
      const b = document.getElementById('play-btn-' + num);
      if (b) b.innerHTML = '<i class="fas fa-play"></i>';
      document.getElementById(`ayah-${num}`)?.classList.remove('playing');
      this.playingAyah = null;

      // v51: منطق التكرار مع عدد المرات (∞ افتراضياً) ونطاق من آية إلى آية
      const cfg = this.repeatConfig || { ayah: 0, surah: 0, from: 1, to: this.currentSurah?.numberOfAyahs || 1 };
      const totalAyahs = this.currentSurah?.numberOfAyahs || 1;
      const rangeTo = Math.min(cfg.to || totalAyahs, totalAyahs);
      const rangeFrom = Math.max(1, Math.min(cfg.from || 1, rangeTo));
      const limit = this.repeatMode === 'ayah' ? (cfg.ayah ?? 0) : this.repeatMode === 'surah' ? (cfg.surah ?? 0) : 0;
      const keepRepeating = limit === 0 || (this._repeatCount + 1) < limit;
      const next = this.currentSurah?.ayahs.find(a => a.number === num + 1);

      if (this.repeatMode === 'ayah') {
        // v52: كل آية تُكرَّر cfg.ayah مرّة قبل الانتقال للتي بعدها،
        // وعند بلوغ نهاية النطاق يُعاد من أول آية فيه (∞ إن كان العدد 0).
        if (keepRepeating) {
          this._repeatCount++;
          setTimeout(() => { if (_tok === (this._recToken || 0)) this.playAyah(num, audioUrl); }, 300);
          return;
        }
        // استُنفد عدد تكرارات هذه الآية: انتقل للآية التالية داخل النطاق
        this._repeatCount = 0;
        if (num < rangeTo && next) {
          this.scrollToAyah(num + 1);
          this.playAyah(num + 1, next.audio);
          return;
        }
        // بلغنا نهاية النطاق: عُد لأول آية فيه (نطاق متعدد الآيات فقط)
        if (rangeFrom < rangeTo) {
          const firstR = this.currentSurah?.ayahs.find(a => a.number === rangeFrom);
          if (firstR) { this.scrollToAyah(rangeFrom); this.playAyah(rangeFrom, firstR.audio); return; }
        }
        if (typeof WakeLockService !== 'undefined') WakeLockService.release();
        return;
      }

      if (this.repeatMode === 'surah') {
        if (num < rangeTo && next) {
          this.scrollToAyah(num + 1);
          this.playAyah(num + 1, next.audio);
          return;
        }
        if (keepRepeating) {
          this._repeatCount++;
          const first = this.currentSurah?.ayahs.find(a => a.number === rangeFrom) || this.currentSurah?.ayahs[0];
          if (first) { this.scrollToAyah(first.number); this.playAyah(first.number, first.audio); return; }
        }
        this._repeatCount = 0;
        if (typeof WakeLockService !== 'undefined') WakeLockService.release();
        return;
      }

      // repeatMode off: تقدّم تلقائي عادي حتى نهاية السورة
      if (next) {
        this.scrollToAyah(num + 1);
        this.playAyah(num + 1, next.audio);
      } else {
        if (typeof WakeLockService !== 'undefined') WakeLockService.release();
      }
    };
  },

  // ============ v64: قراءة الترجمة صوتيًا (تُفعَّل/تُلغى من الإعدادات) ============
  // تعتمد على speechSynthesis المدمج في الجهاز — تعمل أوفلاين وبلا خوادم،
  // ولغة النطق تتبع الترجمة المعروضة في القارئ (García/أخرى).
  _ayahTrEnabled() {
    try { return !!(typeof AppState !== 'undefined' && AppState.settings && AppState.settings.quranVoiceTranslation); }
    catch (e) { return false; }
  },

  _ayahTrLang() {
    const tr = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.translation) || '';
    if (/^en[.\-_]/i.test(tr)) return 'en-US';
    if (/^es[.\-_]/i.test(tr)) return 'es-ES';
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    return l === 'en' ? 'en-US' : 'es-ES';
  },

  _stopAyahTr() {
    try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch (e) {}
    const p = this._ayahTrPending;
    if (p && p._to) { try { clearTimeout(p._to); } catch (e) {} }
    this._ayahTrPending = null;
  },

  // يقرأ ترجمة الآية num صوتيًا بعد تلاوتها، ثم يستأنف التدفق الطبيعي
  // (الآية التالية / التكرار) بإعادة استدعاء onended. يرجع true إن بدأ النطق.
  _speakTranslationAfter(num) {
    if (!this._ayahTrEnabled()) return false;
    if (this._trSpokenFor === num) return false; // نطقناها للتو — لا حلقة لا نهائية
    if (typeof speechSynthesis === 'undefined' || !window.SpeechSynthesisUtterance) return false;
    const a = this.currentSurah && this.currentSurah.ayahs ? this.currentSurah.ayahs.find(x => x.number === num) : null;
    const text = a && a.translation ? String(a.translation).trim() : '';
    if (!text) return false;
    const player = document.getElementById('audio-player');
    if (!player) return false;
    this._trSpokenFor = num;
    const u = new SpeechSynthesisUtterance(text.slice(0, 600));
    u.lang = this._ayahTrLang();
    u.rate = 1;
    const token = { _to: null };
    this._ayahTrPending = token;
    const done = () => {
      if (this._ayahTrPending !== token) return; // أُلغي بالإيقاف أو الانتقال
      this._ayahTrPending = null;
      try { if (player.onended) player.onended(); } catch (e) {}
    };
    u.onend = done;
    u.onerror = done;
    token._to = setTimeout(done, 40000); // مهلة أمان: بعض المتصفحات لا تُطلق onend
    try { speechSynthesis.cancel(); speechSynthesis.speak(u); }
    catch (e) { this._ayahTrPending = null; return false; }
    return true;
  },

  // ============ AYAH BOOKMARKS (max 5, cada una con su color) ============
  BOOKMARK_COLORS: ['#D4AF37', '#2E8B57', '#3B82F6', '#8B5CF6', '#E11D48'],
  MAX_BOOKMARKS: 5,

  getBookmarks() {
    let bm = Storage.get('quran_bookmarks_v2');
    if (!Array.isArray(bm)) {
      // Migración: antiguos marcadores en formato "s:a"
      const old = Storage.get('bookmarks');
      bm = (Array.isArray(old) ? old : []).slice(0, this.MAX_BOOKMARKS).map((key, i) => {
        const [s, a] = String(key).split(':').map(n => parseInt(n, 10));
        return { s, a, c: i, t: Date.now() };
      }).filter(b => b.s >= 1 && b.s <= 114 && b.a >= 1);
      Storage.set('quran_bookmarks_v2', bm);
      Storage.remove('bookmarks');
    }
    return bm;
  },

  saveBookmarks(bm) {
    Storage.set('quran_bookmarks_v2', bm);
  },

  getBookmarkFor(surahNum, ayahNum) {
    return this.getBookmarks().find(b => b.s === surahNum && b.a === ayahNum) || null;
  },

  toggleBookmark(surahNum, ayahNum) {
    const bookmarks = this.getBookmarks();
    const idx = bookmarks.findIndex(b => b.s === surahNum && b.a === ayahNum);
    if (idx >= 0) {
      // Ya guardada: quitar
      bookmarks.splice(idx, 1);
      this.saveBookmarks(bookmarks);
      this._refreshAyahBookmarkUI(surahNum, ayahNum);
      showToast('🔖 ' + t('bookmarkRemoved'));
      return;
    }
    if (bookmarks.length >= this.MAX_BOOKMARKS) {
      showToast('⚠️ ' + t('bookmarkLimit'));
      this.openBookmarks();
      return;
    }
    // Primer color libre
    const usedColors = bookmarks.map(b => b.c);
    let colorIdx = 0;
    while (usedColors.includes(colorIdx)) colorIdx++;
    bookmarks.push({ s: surahNum, a: ayahNum, c: colorIdx, t: Date.now() });
    this.saveBookmarks(bookmarks);
    this._refreshAyahBookmarkUI(surahNum, ayahNum);
    showToast('🔖 ' + t('bookmarkSaved'));
  },

  _refreshAyahBookmarkUI(surahNum, ayahNum) {
    const bm = this.getBookmarkFor(surahNum, ayahNum);
    const btn = document.getElementById(`bookmark-${ayahNum}`);
    const block = document.getElementById(`ayah-${ayahNum}`);
    if (btn) btn.innerHTML = bm
      ? `<i class="fas fa-bookmark" style="color:${this.BOOKMARK_COLORS[bm.c]};"></i>`
      : '<i class="far fa-bookmark"></i>';
    if (block) {
      block.classList.remove('bookmarked', 'bm-0', 'bm-1', 'bm-2', 'bm-3', 'bm-4');
      if (bm) block.classList.add('bookmarked', `bm-${bm.c}`);
    }
    this._updateBookmarkBadge();
  },

  _updateBookmarkBadge() {
    const count = this.getBookmarks().length;
    const btn = document.querySelector('.bookmark-list-btn');
    if (btn) {
      btn.innerHTML = `<i class="fas fa-bookmark"></i>${count ? `<span class="bm-badge">${count}</span>` : ''}`;
    }
  },

  // v45: número de revelación (orden de descenso) de la sura, 1-114
  _revelationOrder(num) {
    const o = (typeof window !== 'undefined') && window.SURAH_REVELATION_ORDER;
    return (o && o[num]) || null;
  },

  // ============ ÚLTIMA ALEYA LEÍDA (historial de navegación, v45) ============
  getLastRead() {
    const l = Storage.get('quran_last_read');
    return (l && l.s >= 1 && l.s <= 114 && l.a >= 1) ? l : null;
  },

  _saveLastRead(surahNum, ayahNum) {
    Storage.set('quran_last_read', { s: surahNum, a: ayahNum, t: Date.now() });
  },

  // Rastrea la aleya visible mientras el usuario se desplaza leyendo y la
  // guarda como "última aleya leída" (con espera para no escribir en cada píxel).
  _trackLastRead(surah) {
    this._clearLastReadTracker();
    const mc = document.getElementById('main-content');
    const handler = () => {
      if (this._lrTick) return;
      this._lrTick = true;
      setTimeout(() => {
        this._lrTick = false;
        const blocks = document.querySelectorAll('#ayahs-container .ayah-block');
        let current = null;
        const limit = window.innerHeight * 0.45;
        for (const b of blocks) {
          if (b.getBoundingClientRect().top < limit) current = b;
          else break;
        }
        if (current) this._saveLastRead(surah.number, parseInt(current.dataset.ayah, 10) || 1);
      }, 400);
    };
    window.addEventListener('scroll', handler, { passive: true });
    if (mc) mc.addEventListener('scroll', handler, { passive: true });
    this._lrHandler = handler;
  },

  _clearLastReadTracker() {
    if (!this._lrHandler) return;
    const mc = document.getElementById('main-content');
    try { window.removeEventListener('scroll', this._lrHandler); } catch (e) {}
    if (mc) { try { mc.removeEventListener('scroll', this._lrHandler); } catch (e) {} }
    this._lrHandler = null;
  },

  renderBookmarksEntry() {
    const el = document.getElementById('bookmarks-entry');
    if (!el) return;
    const bookmarks = this.getBookmarks();
    // v45: junto a «Guardadas», tarjeta de historial con la última aleya
    // leída; al pulsarla navega a esa aleya dentro del Corán traducido.
    const last = this.getLastRead();
    const lastName = last ? this._surahNameByNumber(last.s) : '';
    const chevron = `fa-chevron-${currentLocale === 'ar' ? 'left' : 'right'}`;
    el.innerHTML = `
      <div class="quran-quick-entries">
        <button class="bookmarks-entry-card" onclick="QuranPage.openBookmarks()">
          <span class="bookmarks-entry-icon"><i class="fas fa-bookmark"></i></span>
          <span class="bookmarks-entry-text">
            <span class="bookmarks-entry-title">${t('bookmarksTitle')}</span>
            <span class="bookmarks-entry-sub">${bookmarks.length}/${this.MAX_BOOKMARKS}</span>
          </span>
          ${bookmarks.length ? `<span class="bookmarks-entry-dots">${bookmarks.map(b => `<span class="bookmark-color-dot" style="background:${this.BOOKMARK_COLORS[b.c]};"></span>`).join('')}</span>` : ''}
          <i class="fas ${chevron}"></i>
        </button>
        <button class="bookmarks-entry-card last-read-card" ${last ? `onclick="QuranPage.goToBookmark(${last.s}, ${last.a})"` : 'disabled'}>
          <span class="bookmarks-entry-icon"><i class="fas fa-clock-rotate-left"></i></span>
          <span class="bookmarks-entry-text">
            <span class="bookmarks-entry-title">${t('lastReadTitle')}</span>
            <span class="bookmarks-entry-sub">${last ? `${last.s}. ${Validate.escapeHTML(lastName)} · ${t('ayah')} ${last.a}` : t('lastReadEmpty')}</span>
          </span>
          <i class="fas ${chevron}"></i>
        </button>
      </div>
    `;
  },

  async openBookmarks() {
    if (!this.surahs.length) {
      try { this.surahs = await API.getSurahList(); } catch (e) {}
    }
    const bookmarks = this.getBookmarks();
    const locale = typeof currentLocale !== 'undefined' ? currentLocale : 'en';
    const listHtml = bookmarks.length ? bookmarks.map(b => {
      const surahName = this.getSurahNameByNumber(b.s);
      const color = this.BOOKMARK_COLORS[b.c];
      const date = b.t ? new Date(b.t).toLocaleDateString(locale) : '';
      return `
        <div class="bookmark-item" onclick="QuranPage.goToBookmark(${b.s}, ${b.a})">
          <span class="bookmark-color-dot" style="background:${color};"></span>
          <div class="bookmark-item-info">
            <div class="bookmark-item-title">${b.s}. ${Validate.escapeHTML(surahName || String(b.s))}</div>
            <div class="bookmark-item-meta">${t('ayah')} ${b.a}${date ? ' · ' + date : ''}</div>
          </div>
          <span class="bookmark-item-go">${t('bookmarkGo')} <i class="fas fa-chevron-${locale === 'ar' ? 'left' : 'right'}"></i></span>
          <button class="bookmark-item-del" onclick="QuranPage.removeBookmark(${b.s}, ${b.a}, event)" aria-label="Delete">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
    }).join('') : `<div class="empty-state-mini">🔖 ${t('noBookmarks')}</div>`;

    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">🔖 ${t('bookmarksTitle')} (${bookmarks.length}/${this.MAX_BOOKMARKS})</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="bookmarks-list">${listHtml}</div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  goToBookmark(surahNum, ayahNum) {
    closeModal();
    // v45 FIX: antes bastaba con que `currentSurah` coincidiera EN MEMORIA —
    // pero ese valor sobrevive al volver a la lista, así que al pulsar un
    // marcador guardado desde la pantalla principal del Corán se llamaba a
    // scrollToAyah sobre un DOM que ya no existe y NO pasaba nada (el fallo
    // reportado). Ahora solo se hace scroll directo si la aleya está de
    // verdad renderizada; en caso contrario se navega a la sura con la aleya.
    if (this.currentSurah && this.currentSurah.number === surahNum
        && document.getElementById(`ayah-${ayahNum}`)) {
      // Misma sura ya abierta Y visible: scroll directo con resaltado
      this.scrollToAyah(ayahNum, true);
    } else {
      Router.push('surah', { surahNumber: surahNum, ayah: ayahNum });
    }
  },

  removeBookmark(surahNum, ayahNum, event) {
    if (event) event.stopPropagation();
    this.saveBookmarks(this.getBookmarks().filter(b => !(b.s === surahNum && b.a === ayahNum)));
    if (this.currentSurah && this.currentSurah.number === surahNum) {
      this._refreshAyahBookmarkUI(surahNum, ayahNum);
    }
    this.renderBookmarksEntry();
    this.openBookmarks();
  },

  async copyAyah(surahNum, ayahNum) {
    const ayah = this.currentSurah?.ayahs.find(a => a.number === ayahNum);
    if (!ayah) return;
    const text = `${ayah.arabic}\n\n"${ayah.translation || ''}"\n\n— ${this.currentSurah.englishName} ${surahNum}:${ayahNum}\n\nQuba 🕌`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para contextos sin Clipboard API (HTTP, WebViews antiguos)
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(t('copied') || '📋', 1500);
    } catch (e) {
      showToast(t('error') || 'Error', 1500);
    }
  },

  async shareAyah(surahNum, ayahNum) {
    const ayah = this.currentSurah?.ayahs.find(a => a.number === ayahNum);
    if (!ayah) return;
    const text = `${ayah.arabic}\n\n"${ayah.translation}"\n\n— ${this.currentSurah.englishName} ${surahNum}:${ayahNum}\n\nQuba 🕌`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast('📋');
      } catch (e) {}
    }
  },

  /* ================= v1.0.145: ربط القارئ بالختمة ================= */
  _khatma() {
    try {
      if (typeof KhatmaStore === 'undefined') return null;
      if (this._kid) { const k = KhatmaStore.get(this._kid); if (k && !k.archived) return k; }
      return KhatmaStore.active();
    } catch (e) { return null; }
  },

  // الصفحة الظاهرة الآن: من مقاطع الصفحات، وإلا من الآية المرئية
  _kCurrentPage(surah) {
    try {
      const secs = Array.from(document.querySelectorAll('#ayahs-container .reader-page-section'));
      const mc = document.getElementById('main-content');
      const base = mc ? mc.getBoundingClientRect().top : 0;
      const h = mc ? mc.clientHeight : window.innerHeight;
      if (secs.length) {
        const lim = base + Math.max(80, h * 0.22);
        let cur = secs[0];
        for (const sc of secs) { if (sc.getBoundingClientRect().top <= lim) cur = sc; else break; }
        return parseInt(cur.dataset.page, 10) || null;
      }
      const blocks = Array.from(document.querySelectorAll('#ayahs-container .ayah-block'));
      if (!blocks.length || !surah) return null;
      const lim2 = base + h * 0.5;
      let last = null;
      for (const b of blocks) { if (b.getBoundingClientRect().top < lim2) last = b; else break; }
      if (!last) return null;
      const ay = parseInt(last.dataset.ayah, 10);
      return ay ? (KhatmaStore.pageOfAyah(surah.number, ay) || null) : null;
    } catch (e) { return null; }
  },

  _kStart(surah) {
    this._kStop();
    this._kSurah = surah || null;
    this._kCollapsed = false;
    const k = this._khatma();
    const el = document.getElementById('qr-khatma-strip');
    if (!k) { if (el) el.hidden = true; return; }
    this._kPage = this._kCurrentPage(this._kSurah) || null;
    this._kTIn = Date.now();
    this._kPaint();
    this._kIv = setInterval(() => this._kTick(), 1500);
    const mc = document.getElementById('main-content');
    if (mc) {
      this._kScroll = () => {
        if (this._kRaf) return;
        this._kRaf = requestAnimationFrame(() => {
          this._kRaf = 0;
          const np = this._kCurrentPage(this._kSurah);
          if (np && np !== this._kPage) {
            const prev = this._kPage;
            if (prev) this._kMarkIfDue(prev);   // قبل تصفير المؤقّت
            this._kPage = np; this._kTIn = Date.now(); this._kPaint();
          } else if (!np) { this._kPaint(); }
        });
      };
      mc.addEventListener('scroll', this._kScroll, { passive: true });
    }
    // في وضع الورد: الهبوط على مطلع ورد اليوم داخل السورة المفتوحة
    if (this._ward) {
      try {
        const info = KhatmaStore.wardInfo(k);
        if (info && info.st === 'open') {
          // v1.0.163: الهبوط على أول صفحة غير مقروءة من الورد لا على أوله
          let resumePage = k.dir === -1 ? info.to : info.from;
          try {
            const set = KhatmaStore.readSet(k);
            const rev = (k.dir === -1);
            const lo = Math.min(info.from, info.to), hi = Math.max(info.from, info.to);
            for (let pg = rev ? hi : lo; rev ? pg >= lo : pg <= hi; pg += rev ? -1 : 1) {
              if (!set.has(pg)) { resumePage = pg; break; }
            }
          } catch (e) {}
          const first = KhatmaStore.pageRef(resumePage);
          if (first && surah && surah.number === first.s) setTimeout(() => this.scrollToAyah(first.a), 280);
        }
      } catch (e) {}
    }
  },

  _kStop() {
    if (this._kIv) { clearInterval(this._kIv); this._kIv = null; }
    if (this._kScroll) {
      const mc = document.getElementById('main-content');
      if (mc) { try { mc.removeEventListener('scroll', this._kScroll); } catch (e) {} }
      this._kScroll = null;
    }
    if (this._kPage) { try { this._kMarkIfDue(this._kPage); } catch (e) {} }
    this._kPage = null;
    this._kSurah = null;
  },

  _kTick() {
    if (document.hidden) return;
    const p = this._kCurrentPage(this._kSurah);
    if (!p) return;
    if (p !== this._kPage) {
      const prev = this._kPage;
      if (prev) this._kMarkIfDue(prev);
      this._kPage = p; this._kTIn = Date.now(); this._kPaint();
    } else {
      this._kMarkIfDue(p);
    }
  },

  _kMarkIfDue(p) {
    if (!p) return false;
    const min = (typeof KhatmaStore !== 'undefined' && KhatmaStore.MIN_SEC) || 12;
    if ((Date.now() - (this._kTIn || 0)) < min * 1000) return false;
    const k = this._khatma(); if (!k) return false;
    try {
      if (KhatmaStore.readSet(k).has(p)) return false;
      const r = KhatmaStore.markPage(p, 'reader', k.id);
      if (!r || !r.added) return false;
      try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
      try {
        const msg = (typeof KhatmaPage !== 'undefined' && KhatmaPage.L)
          ? KhatmaPage.L('احتُسبت صفحة ' + p + ' في ختمتك', 'Página ' + p + ' registrada', 'Page ' + p + ' recorded')
          : '✓';
        showToast(msg, 1200);
      } catch (e) {}
      this._kPaint();
      return true;
    } catch (e) { return false; }
  },

  _kToggle() { this._kCollapsed = !this._kCollapsed; this._kPaint(); },

  /* v1.0.171: يبدأ جلسة ورد اليوم — يُحتسب التقدّم والصفحات فورًا وأثناء
     القراءة من أي مدخل للقرآن، لا عند فتح صفحة الورد فقط. */
  startWard() {
    const L = (a, e, en) => { try { return KhatmaPage.L(a, e, en); } catch (err) { return a; } };
    const k = this._khatma();
    if (!k) return;
    let info = null;
    try { KhatmaStore.startWard(k); info = KhatmaStore.wardInfo(k); } catch (e) {}
    try { this._kPaint(); } catch (e) {}
    try {
      const msg = (info && info.total)
        ? L('بدأ ورد اليوم — تُحتسب الصفحات التي تقرؤها الآن (' + info.total + ' صفحة)',
            'Wird de hoy iniciado — se cuentan las páginas que leas',
            "Today's ward started — the pages you read now are counted")
        : L('بدأ ورد اليوم', 'Wird de hoy iniciado', "Today's ward started");
      if (typeof showToast === 'function') showToast(msg, 2800);
    } catch (e) {}
  },

  /* v1.0.163: زر «أكمل الورد» في القارئ المترجم — يفتح المصحف على أول صفحة
     غير مقروءة من ورد اليوم بدل أول الورد. */
  openWardResume() {
    let page = null;
    try {
      const k = this._khatma();
      const info = k && KhatmaStore.wardInfo(k);
      if (info && info.st === 'open') {
        const set = KhatmaStore.readSet(k);
        const rev = (k.dir === -1);
        const lo = Math.min(info.from, info.to), hi = Math.max(info.from, info.to);
        for (let pg = rev ? hi : lo; rev ? pg >= lo : pg <= hi; pg += rev ? -1 : 1) {
          if (!set.has(pg)) { page = pg; break; }
        }
      }
    } catch (e) {}
    if (page) Router.push('mushaf', { page: page, kid: this._kid || undefined, ward: 1, back: 'quran/read' });
    else this.openMushaf();
  },

  _kPaint() {
    const el = document.getElementById('qr-khatma-strip');
    if (!el) return;
    const k = this._khatma();
    if (!k) { el.hidden = true; return; }
    const L = (a, e, en) => { try { return KhatmaPage.L(a, e, en); } catch (err) { return a; } };
    const kp = KhatmaStore.progress(k);
    let info = null;
    try { info = KhatmaStore.wardInfo(k); } catch (e) {}
    const cur = this._kPage || 0;
    let sub = '', note = '', barPct = kp.pct;
    if (info && info.st === 'open') {
      barPct = info.pct;
      sub = L('ورد اليوم', 'Wird de hoy', "Today's ward") + ' ' + KhatmaStore.rangeLabel(k, info.w)
        + ' · ' + info.done + '/' + info.total;
      if (cur) {
        note = (cur >= info.from && cur <= info.to)
          ? `<span class="qr-ks-note is-in">${L('داخل الورد', 'Dentro', 'In ward')}</span>`
          : `<span class="qr-ks-note is-out">${L('خارج الورد', 'Fuera', 'Out')} ${info.from}–${info.to}</span>`;
      }
    } else if (info) {
      sub = info.st === 'rest' ? L('يوم راحة — لا ورد اليوم', 'Descanso', 'Rest day')
        : info.st === 'before' ? L('تبدأ ختمتك ', 'Empieza el ', 'Starts ') + (info.w.date || '')
        : L('انتهت أيام الختمة', 'Jatma terminada', 'Khatma finished');
    }
    el.hidden = false;
    el.className = 'qr-kstrip'
      + (info && info.st === 'open' ? ' is-ward' : '')
      + (this._kCollapsed ? ' is-collapsed' : '');
    el.innerHTML = `
      <div class="qr-ks-top" onclick="QuranPage._kToggle()">
        <i class="fas fa-bookmark"></i>
        <span class="qr-ks-name">${Validate.escapeHTML(k.name || '')}</span>
        <span class="qr-ks-pill">${cur ? L('ص', 'p.', 'p.') + ' ' + cur + ' · ' : ''}${kp.pct}%</span>
      </div>
      <div class="qr-ks-bar"><i style="width:${barPct}%"></i></div>
      <div class="qr-ks-sub"><span>${Validate.escapeHTML(sub)}</span>${note}
        ${(info && info.st === 'open') ? (info.running
          ? `<button class="qr-ks-go qr-ks-start is-run" onclick="event.stopPropagation();QuranPage.openWardResume()"><i class="fas fa-book-open-reader"></i>${L('جارٍ الورد', 'Wird en curso', 'Ward running')} ${info.done}/${info.total}</button>`
          : `<button class="qr-ks-go qr-ks-start" onclick="event.stopPropagation();QuranPage.startWard()"><i class="fas fa-play"></i>${L('ابدأ الورد', 'Empezar wird', 'Start ward')}</button>`) : ''}
        <button class="qr-ks-more" onclick="event.stopPropagation();QuranPage.openMushaf()"><i class="fas fa-book-quran"></i></button>
      </div>`;
    try { el.classList.toggle('is-stuck', !!this._kStuck); } catch (e) {}
  },


  cleanup() {
    // v1.0.145: احتساب الصفحة الأخيرة + إيقاف مؤقّت تتبّع الختمة
    try { this._kStop(); } catch (e) {}
    this._hideRecBar();
    this._stopAyahTr(); // v64: إسكات الترجمة الصوتية عند مغادرة القارئ
    const player = document.getElementById('audio-player');
    if (player) { player.pause(); player.src = ''; }
    this.playingAyah = null;
    // v45: soltar el rastreador de "última aleya leída" al salir del Corán
    this._clearLastReadTracker();
    // v43: إزالة سحب التنقل بين السور عند مغادرة صفحة القرآن — قبل ذلك كان
    // المعالج يبقى معلّقاً على #main-content، فأي سحب في الصفحات الأخرى كان
    // يفتح القرآن ويقلب السور. الآن يعمل فقط والقرآن مفتوح.
    if (this._readerSwipeHandlers) {
      const mc = document.getElementById('main-content');
      if (mc) {
        try { mc.removeEventListener('touchstart', this._readerSwipeHandlers.ts); } catch (e) {}
        try { mc.removeEventListener('touchend', this._readerSwipeHandlers.te); } catch (e) {}
      }
      this._readerSwipeHandlers = null;
    }
  },
};
