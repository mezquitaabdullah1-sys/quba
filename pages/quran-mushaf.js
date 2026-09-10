// 📖 المصحف — القرآن الكريم بالعربية، صفحة كاملة (مصحف المدينة ٦٠٤ صفحات)
// متواصل من الفاتحة إلى الناس — التقليب: السحب إلى اليمين للتقدّم (الصفحات القادمة جهة اليسار)
// الانتقال بين الصفحات بحركة انزلاق سلسة — يعمل أوفلاين ١٠٠٪
// البيانات: window.QURAN_FULL_AR (data/quran_full_ar.js) — محفوظة داخل ملفات التطبيق.
// التجزئة: window.MUSHAF_DIVISIONS (data/mushaf_divisions.js) — أجزاء/أحزاب/أرباع مع صفحاتها.
const QuranMushafPage = {
  TOTAL_PAGES: 604,
  page: 1,
  fontSize: 'medium',
  _touchX: null,
  _touchY: null,
  _animating: false,
  _pickerMode: 'surah',

  // أرقام عربية مشرقية للعرض (١٢٣)
  arDigits(n) {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  },

  // تحويل الأرقام العربية المشرقية إلى غربية (لتحليل مدخلات البحث)
  toWesternDigits(str) {
    return String(str || '').replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  },

  _pageData(p) {
    const all = (typeof window !== 'undefined') && window.QURAN_FULL_AR;
    if (!all || !all.pages) return null;
    return all.pages[p - 1] || null;
  },

  _divs() {
    return ((typeof window !== 'undefined') && window.MUSHAF_DIVISIONS) || { juzs: [], rubs: [] };
  },

  _surahName(num) {
    if (typeof QuranOfflineService !== 'undefined') {
      const m = QuranOfflineService.getSurahMeta(num);
      if (m) return QuranHelpers.removeTashkeel ? m.name.replace(/^سُورَةُ\s*/, '') : m.name;
    }
    return String(num);
  },

  // أسماء أرباع الحزب (القيم المخزنة ١-٤)
  _quarterName(q) {
    const names = [t('mushafRub1'), t('mushafRub2'), t('mushafRub3'), t('mushafRub4')];
    return names[(q - 1) % 4];
  },

  render(container, params = {}, navToken = null) {
    this.fontSize = Storage.get('mushaf_font') || 'medium';
    let p = parseInt(params.page, 10);
    if (!(p >= 1 && p <= this.TOTAL_PAGES)) {
      // استئناف آخر صفحة مقروءة
      p = parseInt(Storage.get('mushaf_last_page'), 10) || 1;
    }
    this.showPage(container, p, 0);
  },

  showPage(container, p, dir = 0) {
    p = Math.min(this.TOTAL_PAGES, Math.max(1, p));
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

    const oldPage = root.querySelector('#msh-page');
    this.page = p;
    Storage.set('mushaf_last_page', p);
    // مزامنة الرابط دون إغراق سجل التصفح
    try { history.replaceState({ name: 'mushaf', params: { page: p } }, '', '#/mushaf?page=' + p); } catch (e) {}

    const html = this._buildHTML(p, data);

    // انتقال سلس عند التقليب، وعرض مباشر عند الدخول الأول
    if (dir !== 0 && oldPage && root.contains(oldPage) && !this._animating) {
      this._animateTurn(root, oldPage, html, dir);
    } else {
      root.innerHTML = html;
      this._afterRender();
    }
  },

  _buildHTML(p, data) {
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

    return `
      <div class="msh-wrap" dir="rtl">
        <div class="top-bar msh-top-bar">
          <button class="top-bar-btn" onclick="Router.go('quran')" aria-label="${t('backToWisdom')}">
            <i class="fas fa-chevron-right"></i>
          </button>
          <div class="top-bar-title-container">
            <div class="top-bar-title msh-title">📖 ${t('mushafTitle')}</div>
            <div class="top-bar-subtitle">${t('mushafJuz')} ${this.arDigits(data.juz)} · سُورَة ${Validate.escapeHTML(this._surahName(firstSurah))}${firstSurah !== lastSurah ? ' - ' + Validate.escapeHTML(this._surahName(lastSurah)) : ''}</div>
          </div>
          <button class="top-bar-btn" onclick="QuranMushafPage.openPicker()" title="${t('mushafIndex')}" aria-label="${t('mushafIndex')}">
            <i class="fas fa-bars"></i>
          </button>
          <button class="top-bar-btn" onclick="QuranMushafPage.cycleFont()" title="${t('fontSize')}">
            <i class="fas fa-text-height"></i>
          </button>
        </div>

        <div class="msh-pager-bar">
          <button class="msh-nav-btn" onclick="QuranMushafPage.prevPage()" ${p <= 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i> ${t('mushafPrev')}
          </button>
          <button class="msh-page-indicator" onclick="QuranMushafPage.openPicker()" title="${t('mushafGo')}">
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
  },

  _afterRender() {
    const mc = document.getElementById('main-content');
    if (mc) mc.scrollTop = 0;
  },

  // حركة التقليب السلسة: الصفحات القادمة جهة اليسار
  // dir = +1 (التالية): الجديدة تنزلق من اليسار — dir = -1 (السابقة): من اليمين
  _animateTurn(root, oldPage, newHtml, dir) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      root.innerHTML = newHtml;
      this._afterRender();
      return;
    }

    const tmp = document.createElement('div');
    tmp.innerHTML = newHtml;
    const newPage = tmp.querySelector('#msh-page');
    if (!newPage) {
      root.innerHTML = newHtml;
      this._afterRender();
      return;
    }

    this._animating = true;
    const w = oldPage.offsetWidth;

    const ghost = oldPage.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.classList.add('msh-page-static');
    ghost.style.width = w + 'px';

    newPage.removeAttribute('id');
    newPage.classList.add('msh-page-static');
    newPage.style.width = w + 'px';

    const track = document.createElement('div');
    track.className = 'msh-track';
    track.dir = 'ltr'; // ترتيب فيزيائي ثابت بغضّ النظر عن اتجاه الواجهة
    track.style.width = (w * 2) + 'px';

    if (dir > 0) {
      // التالية: [جديدة | قديمة] ثم يتحرك المسار نحو اليمين فتدخل الجديدة من اليسار
      track.appendChild(newPage);
      track.appendChild(ghost);
      track.style.transform = `translateX(${-w}px)`;
    } else {
      // السابقة: [قديمة | جديدة] ثم يتحرك المسار نحو اليسار فتدخل الجديدة من اليمين
      track.appendChild(ghost);
      track.appendChild(newPage);
      track.style.transform = 'translateX(0px)';
    }

    const clip = document.createElement('div');
    clip.className = 'msh-clip';
    clip.appendChild(track);

    oldPage.replaceWith(clip);

    // إجبار إعادة التدفق ثم بدء الحركة
    track.getBoundingClientRect();
    track.style.transition = 'transform .32s cubic-bezier(.25,.8,.25,1)';
    track.style.transform = dir > 0 ? 'translateX(0px)' : `translateX(${-w}px)`;

    const done = () => {
      if (!this._animating) return;
      this._animating = false;
      if (root.contains(clip)) {
        root.innerHTML = newHtml;
        this._afterRender();
      }
    };
    track.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 450); // ضمان في حال لم يُطلَق حدث نهاية الانتقال
  },

  // التقليب بالسحب (معكوس الاتجاه): اليمين = الصفحة التالية، اليسار = السابقة
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
      if (this._touchX === null || !document.getElementById('msh-page') || this._animating) return;
      const tt = e.changedTouches[0];
      const dx = tt.clientX - this._touchX;
      const dy = tt.clientY - this._touchY;
      this._touchX = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx > 0) this.nextPage();   // سحب لليمين ← الصفحة التالية
        else this.prevPage();          // سحب لليسار ← الصفحة السابقة
      }
    }, { passive: true });

    // أسهم لوحة المفاتيح (للحاسوب) — نفس اتجاه السحب
    document.addEventListener('keydown', this._keyHandler = (e) => {
      if (!document.getElementById('msh-page') || this._animating) return;
      if (e.key === 'ArrowRight') this.nextPage();
      else if (e.key === 'ArrowLeft') this.prevPage();
    });
  },

  nextPage() {
    if (this.page >= this.TOTAL_PAGES || this._animating) return;
    this.showPage(null, this.page + 1, 1);
  },

  prevPage() {
    if (this.page <= 1 || this._animating) return;
    this.showPage(null, this.page - 1, -1);
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

  // ☰ فهرس المصحف: السور / الأجزاء / الأحزاب / الأرباع + بحث موحّد
  openPicker(mode) {
    this._pickerMode = mode || 'surah';
    const tabs = [
      ['surah', t('mushafTabSurahs')],
      ['juz', t('mushafTabJuz')],
      ['hizb', t('mushafTabHizb')],
      ['rub', t('mushafTabRub')],
    ];
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">☰ ${t('mushafIndex')}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="picker-search">
        <i class="fas fa-search"></i>
        <input type="text" id="msh-picker-input" placeholder="${t('mushafSearchGo')}" autocomplete="off"
               oninput="QuranMushafPage._renderPickerList(this.value)">
        <button class="btn-primary" style="padding: 8px 16px;" onclick="QuranMushafPage.jumpToQuery()">${t('mushafGo')}</button>
      </div>
      <div class="msh-picker-tabs" id="msh-picker-tabs">
        ${tabs.map(([m, label]) => `
          <button class="msh-tab ${this._pickerMode === m ? 'active' : ''}" data-mode="${m}"
                  onclick="QuranMushafPage.setPickerMode('${m}')">${label}</button>`).join('')}
      </div>
      <div class="picker-list" id="msh-picker-list"></div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
    this._renderPickerList('');
    setTimeout(() => document.getElementById('msh-picker-input')?.focus(), 100);
    document.getElementById('msh-picker-input')?.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.jumpToQuery();
    });
  },

  // اسم قديم محفوظ للتوافق
  openPagePicker() { this.openPicker(); },

  setPickerMode(mode) {
    this._pickerMode = mode;
    document.querySelectorAll('#msh-picker-tabs .msh-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    const q = document.getElementById('msh-picker-input')?.value || '';
    this._renderPickerList(q);
  },

  _renderPickerList(query) {
    const list = document.getElementById('msh-picker-list');
    if (!list) return;
    const raw = (query || '').trim();
    const qw = this.toWesternDigits(raw);
    const nq = (typeof QuranHelpers !== 'undefined') ? QuranHelpers.normalizeForSearch(raw) : raw;
    const parts = [];

    // نتائج الآيات المطابقة نصيًا — تظهر أعلى القائمة
    if (raw.length >= 2 && !/^\d+$/.test(qw) && typeof QuranSearch !== 'undefined') {
      const hits = QuranSearch.search(raw, 5);
      if (hits.length) {
        parts.push(`<div class="msh-picker-section">${t('mushafAyahMatches')}</div>`);
        parts.push(hits.map(h => `
          <div class="picker-item" onclick="QuranMushafPage.goToAyah(${h.s}, ${h.a})">
            <div class="picker-num">${this.arDigits(h.a)}</div>
            <div class="picker-info">
              <div class="picker-name">${Validate.escapeHTML(this._surahName(h.s))} · ﴿${this.arDigits(h.a)}﴾</div>
              <div class="picker-meta">${Validate.escapeHTML((h.text || '').slice(0, 90))}</div>
            </div>
          </div>`).join(''));
      }
    }

    if (this._pickerMode === 'surah') {
      const surahs = (typeof QuranOfflineService !== 'undefined') ? QuranOfflineService.getSurahList() : [];
      const filtered = surahs.filter(s => QuranHelpers.surahMatches(s, raw));
      parts.push(filtered.map(s => `
        <div class="picker-item" onclick="QuranMushafPage.goToSurah(${s.number})">
          <div class="picker-num">${s.number}</div>
          <div class="picker-info">
            <div class="picker-name">${Validate.escapeHTML(QuranHelpers.surahDisplayName(s))}</div>
          </div>
          <div class="picker-arabic">${Validate.escapeHTML(s.name)}</div>
        </div>`).join(''));
    } else if (this._pickerMode === 'juz') {
      const filtered = this._divs().juzs.filter(j =>
        !raw || String(j.juz).startsWith(qw) || QuranHelpers.normalizeForSearch(this._surahName(j.s)).includes(nq));
      parts.push(filtered.map(j => `
        <div class="picker-item" onclick="QuranMushafPage.goToJuz(${j.juz})">
          <div class="picker-num">${this.arDigits(j.juz)}</div>
          <div class="picker-info">
            <div class="picker-name">${t('mushafJuz')} ${this.arDigits(j.juz)}</div>
            <div class="picker-meta">${Validate.escapeHTML(this._surahName(j.s))} · ${t('mushafPage')} ${this.arDigits(j.page)}</div>
          </div>
          <div class="picker-arabic">${this.arDigits(j.page)}</div>
        </div>`).join(''));
    } else if (this._pickerMode === 'hizb') {
      // الحزب يبدأ بأول ربع فيه (موضع الربع داخل الحزب = ١)
      const hizbs = this._divs().rubs.filter(r => ((r.q - 1) % 4) === 0);
      const filtered = hizbs.filter(r =>
        !raw || String(r.hizb).startsWith(qw) || QuranHelpers.normalizeForSearch(this._surahName(r.s)).includes(nq));
      parts.push(filtered.map(r => `
        <div class="picker-item" onclick="QuranMushafPage.goToHizb(${r.hizb})">
          <div class="picker-num">${this.arDigits(r.hizb)}</div>
          <div class="picker-info">
            <div class="picker-name">${t('mushafHizb')} ${this.arDigits(r.hizb)}</div>
            <div class="picker-meta">${t('mushafJuz')} ${this.arDigits(r.juz)} · ${Validate.escapeHTML(this._surahName(r.s))}</div>
          </div>
          <div class="picker-arabic">${this.arDigits(r.page)}</div>
        </div>`).join(''));
    } else { // rub — الأرباع ٢٤٠
      const filtered = this._divs().rubs.filter(r =>
        !raw || String(r.id).startsWith(qw) || String(r.hizb).startsWith(qw)
        || QuranHelpers.normalizeForSearch(this._surahName(r.s)).includes(nq));
      parts.push(filtered.map(r => `
        <div class="picker-item" onclick="QuranMushafPage.goToRub(${r.id})">
          <div class="picker-num">${this.arDigits(r.id)}</div>
          <div class="picker-info">
            <div class="picker-name">${this._quarterName(r.q)} — ${t('mushafHizb')} ${this.arDigits(r.hizb)}</div>
            <div class="picker-meta">${t('mushafJuz')} ${this.arDigits(r.juz)} · ${Validate.escapeHTML(this._surahName(r.s))}</div>
          </div>
          <div class="picker-arabic">${this.arDigits(r.page)}</div>
        </div>`).join(''));
    }

    list.innerHTML = parts.join('');
  },

  // الانتقال الذكي: رقم صفحة (١-٦٠٤) أو مرجع آية (سورة:آية) أو اسم سورة
  jumpToQuery() {
    const input = document.getElementById('msh-picker-input');
    if (!input) return;
    const raw = input.value.trim();
    const qw = this.toWesternDigits(raw);
    let target = null;
    let m;

    if (/^\d+$/.test(qw)) {
      const n = parseInt(qw, 10);
      if (n >= 1 && n <= this.TOTAL_PAGES) target = n;
    } else if ((m = qw.match(/^(\d+)\s*[:：]\s*(\d+)$/))) {
      target = this._pageOfAyah(parseInt(m[1], 10), parseInt(m[2], 10));
    } else if (raw) {
      // اسم سورة: انتقل لأول سورة مطابقة
      const surahs = (typeof QuranOfflineService !== 'undefined') ? QuranOfflineService.getSurahList() : [];
      const s = surahs.find(x => QuranHelpers.surahMatches(x, raw));
      if (s) { closeModal(); this.goToSurah(s.number); return; }
    }

    if (target) {
      closeModal();
      this.showPage(null, target, target > this.page ? 1 : -1);
    } else if (typeof showToast === 'function') {
      showToast('⚠️ ' + t('mushafGoInvalid'), 1800);
    }
  },

  jumpToInputPage() { this.jumpToQuery(); },

  // صفحة آية محددة (أول صفحة تحتويها أو تتجاوزها)
  _pageOfAyah(s, a) {
    const all = window.QURAN_FULL_AR;
    if (!all) return null;
    for (const pg of all.pages) {
      for (const row of pg.ayahs) {
        if (row[0] === s && row[1] === a) return pg.n;
        if (row[0] > s || (row[0] === s && row[1] > a)) return pg.n;
      }
    }
    return null;
  },

  goToAyah(s, a) {
    const p = this._pageOfAyah(s, a);
    if (p) {
      closeModal();
      this.showPage(null, p, p > this.page ? 1 : -1);
    }
  },

  goToJuz(j) {
    const jz = this._divs().juzs.find(x => x.juz === j);
    if (jz) {
      closeModal();
      this.showPage(null, jz.page, jz.page > this.page ? 1 : -1);
    }
  },

  goToHizb(h) {
    const r = this._divs().rubs.find(x => x.hizb === h && ((x.q - 1) % 4) === 0);
    if (r) {
      closeModal();
      this.showPage(null, r.page, r.page > this.page ? 1 : -1);
    }
  },

  goToRub(id) {
    const r = this._divs().rubs.find(x => x.id === id);
    if (r) {
      closeModal();
      this.showPage(null, r.page, r.page > this.page ? 1 : -1);
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
          this.showPage(null, pg.n, pg.n > this.page ? 1 : -1);
          return;
        }
      }
    }
  },

  cleanup() {
    this._touchX = null;
    this._animating = false;
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
      this._swipeBound = false;
    }
  },
};
