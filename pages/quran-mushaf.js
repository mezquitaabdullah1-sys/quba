// 📖 المصحف — القرآن الكريم بالعربية، صفحة كاملة (مصحف المدينة ٦٠٤ صفحات)
// متواصل من الفاتحة إلى الناس — التقليب إلى اليسار للتقدّم — يعمل أوفلاين ١٠٠٪
// البيانات: window.QURAN_FULL_AR (data/quran_full_ar.js) — محفوظة داخل ملفات التطبيق.
const QuranMushafPage = {
  TOTAL_PAGES: 604,
  page: 1,
  fontSize: 'medium',
  _touchX: null,
  _touchY: null,

  // أرقام عربية مشرقية للعرض (١٢٣)
  arDigits(n) {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  },

  _pageData(p) {
    const all = (typeof window !== 'undefined') && window.QURAN_FULL_AR;
    if (!all || !all.pages) return null;
    return all.pages[p - 1] || null;
  },

  _surahName(num) {
    if (typeof QuranOfflineService !== 'undefined') {
      const m = QuranOfflineService.getSurahMeta(num);
      if (m) return QuranHelpers.removeTashkeel ? m.name.replace(/^سُورَةُ\s*/, '') : m.name;
    }
    return String(num);
  },

  render(container, params = {}, navToken = null) {
    this.fontSize = Storage.get('mushaf_font') || 'medium';
    let p = parseInt(params.page, 10);
    if (!(p >= 1 && p <= this.TOTAL_PAGES)) {
      // استئناف آخر صفحة مقروءة
      p = parseInt(Storage.get('mushaf_last_page'), 10) || 1;
    }
    this.showPage(container, p);
  },

  showPage(container, p) {
    p = Math.min(this.TOTAL_PAGES, Math.max(1, p));
    this.page = p;
    Storage.set('mushaf_last_page', p);
    // مزامنة الرابط دون إغراق سجل التصفح
    try { history.replaceState({ name: 'mushaf', params: { page: p } }, '', '#/mushaf?page=' + p); } catch (e) {}

    const data = this._pageData(p);
    const root = container || document.getElementById('main-content');
    if (!root) return;

    if (!data) {
      root.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">${t('error')}</div>
          <button class="btn-primary empty-state-btn" onclick="Router.go('quran')">${t('backToWisdom')}</button>
        </div>`;
      return;
    }

    const parts = [];
    let firstSurah = data.ayahs[0][0];
    let lastSurah = data.ayahs[data.ayahs.length - 1][0];

    for (const row of data.ayahs) {
      const s = row[0], a = row[1], txt = row[2], isStart = row[3] === 1;
      if (isStart) {
        // ترويسة السورة + البسملة (ما عدا براءة)
        parts.push(`
          <div class="msh-surah-header">
            <span class="msh-surah-orn">۞</span>
            <span class="msh-surah-name">سُورَةُ ${Validate.escapeHTML(this._surahName(s))}</span>
            <span class="msh-surah-orn">۞</span>
          </div>`);
        if (s !== 9 && s !== 1) {
          parts.push('<div class="msh-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>');
        }
      }
      parts.push(`<span class="msh-ayah" data-surah="${s}" data-ayah="${a}">${Validate.escapeHTML(txt)}<span class="msh-ayah-end">﴿${this.arDigits(a)}﴾</span></span>`);
    }

    root.innerHTML = `
      <div class="msh-wrap" dir="rtl">
        <div class="top-bar msh-top-bar">
          <button class="top-bar-btn" onclick="Router.go('quran')" aria-label="${t('backToWisdom')}">
            <i class="fas fa-chevron-right"></i>
          </button>
          <div class="top-bar-title-container">
            <div class="top-bar-title msh-title">📖 ${t('mushafTitle')}</div>
            <div class="top-bar-subtitle">${t('mushafJuz')} ${this.arDigits(data.juz)} · سُورَة ${Validate.escapeHTML(this._surahName(firstSurah))}${firstSurah !== lastSurah ? ' - ' + Validate.escapeHTML(this._surahName(lastSurah)) : ''}</div>
          </div>
          <button class="top-bar-btn" onclick="QuranMushafPage.cycleFont()" title="${t('fontSize')}">
            <i class="fas fa-text-height"></i>
          </button>
        </div>

        <div class="msh-pager-bar">
          <button class="msh-nav-btn" onclick="QuranMushafPage.prevPage()" ${p <= 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i> ${t('mushafPrev')}
          </button>
          <button class="msh-page-indicator" onclick="QuranMushafPage.openPagePicker()" title="${t('mushafGo')}">
            ${t('mushafPage')} ${this.arDigits(p)} / ${this.arDigits(this.TOTAL_PAGES)}
          </button>
          <button class="msh-nav-btn" onclick="QuranMushafPage.nextPage()" ${p >= this.TOTAL_PAGES ? 'disabled' : ''}>
            ${t('mushafNext')} <i class="fas fa-chevron-left"></i>
          </button>
        </div>

        <div class="msh-page font-${this.fontSize}" id="msh-page">
          <div class="msh-flow">${parts.join('')}</div>
          <div class="msh-page-footer">❁ ${this.arDigits(p)} ❁</div>
        </div>
      </div>
    `;

    this._bindSwipe();
    const mc = document.getElementById('main-content');
    if (mc) mc.scrollTop = 0;
  },

  // التقليب بالسحب: اليسار = الصفحة التالية (متابعة القراءة)، اليمين = السابقة
  _bindSwipe() {
    const mc = document.getElementById('main-content');
    if (!mc) return;
    if (this._swipeBound) return;
    this._swipeBound = true;

    mc.addEventListener('touchstart', e => {
      if (!document.getElementById('msh-page')) return;
      const tt = e.touches[0];
      this._touchX = tt.clientX;
      this._touchY = tt.clientY;
    }, { passive: true });

    mc.addEventListener('touchend', e => {
      if (this._touchX === null || !document.getElementById('msh-page')) return;
      const tt = e.changedTouches[0];
      const dx = tt.clientX - this._touchX;
      const dy = tt.clientY - this._touchY;
      this._touchX = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) this.nextPage();   // سحب لليسار ← تقدّم
        else this.prevPage();          // سحب لليمين ← رجوع
      }
    }, { passive: true });

    // أسهم لوحة المفاتيح (للحاسوب)
    document.addEventListener('keydown', this._keyHandler = (e) => {
      if (!document.getElementById('msh-page')) return;
      if (e.key === 'ArrowLeft') this.nextPage();
      else if (e.key === 'ArrowRight') this.prevPage();
    });
  },

  nextPage() {
    if (this.page >= this.TOTAL_PAGES) return;
    this.showPage(null, this.page + 1);
  },

  prevPage() {
    if (this.page <= 1) return;
    this.showPage(null, this.page - 1);
  },

  cycleFont() {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const idx = sizes.indexOf(this.fontSize);
    this.fontSize = sizes[(idx + 1) % sizes.length];
    Storage.set('mushaf_font', this.fontSize);
    const el = document.getElementById('msh-page');
    if (el) {
      el.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
      el.classList.add('font-' + this.fontSize);
    }
    showToast('🔠 ' + this.fontSize, 1000);
  },

  // الانتقال إلى صفحة / جزء / سورة
  openPagePicker() {
    const surahs = (typeof QuranOfflineService !== 'undefined') ? QuranOfflineService.getSurahList() : [];
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">📖 ${t('mushafGo')}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="picker-search">
        <i class="fas fa-hashtag"></i>
        <input type="number" id="msh-page-input" min="1" max="${this.TOTAL_PAGES}" placeholder="${t('mushafPage')} (1-${this.TOTAL_PAGES})" autocomplete="off">
        <button class="btn-primary" style="padding: 8px 16px;" onclick="QuranMushafPage.jumpToInputPage()">${t('mushafGo')}</button>
      </div>
      <div class="picker-list">
        ${surahs.map(s => `
          <div class="picker-item" onclick="QuranMushafPage.goToSurah(${s.number})">
            <div class="picker-num">${s.number}</div>
            <div class="picker-info">
              <div class="picker-name">${Validate.escapeHTML(QuranHelpers.surahDisplayName(s))}</div>
            </div>
            <div class="picker-arabic">${Validate.escapeHTML(s.name)}</div>
          </div>
        `).join('')}
      </div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(() => document.getElementById('msh-page-input')?.focus(), 100);
    document.getElementById('msh-page-input')?.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.jumpToInputPage();
    });
  },

  jumpToInputPage() {
    const input = document.getElementById('msh-page-input');
    if (!input) return;
    const n = parseInt(input.value, 10);
    if (n >= 1 && n <= this.TOTAL_PAGES) {
      closeModal();
      this.showPage(null, n);
    }
  },

  // صفحة بداية السورة = أول ظهور لها في البيانات
  goToSurah(num) {
    const all = window.QURAN_FULL_AR;
    if (!all) return;
    for (const pg of all.pages) {
      for (const row of pg.ayahs) {
        if (row[0] === num && row[1] === 1) {
          closeModal();
          this.showPage(null, pg.n);
          return;
        }
      }
    }
  },

  cleanup() {
    this._touchX = null;
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
      this._swipeBound = false;
    }
  },
};
