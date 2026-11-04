// 📖 المصحف — صفحة مصحف حقيقية (٦٠٤ صفحات، ١٥ سطرًا لكل صفحة)
// البيانات: data/quran_lines.js (من mushaf-layout المفتوح المصدر) — أسطر مطابقة لمصحف المدينة.
// التفاعل: سحب الصفحة بالإصبع، ضغطة لإخفاء الأشرطة، ضغط مطوّل على آية لقائمة التفسير/الحفظ/التلاوة.
const QuranMushafPage = {
  TOTAL_PAGES: 604,
  page: 1,
  _animating: false,
  _dragging: false,
  _sel: null,
  _audioRef: null,
  _ls: null,

  /* ---------------- بيانات ---------------- */
  _all() { return (typeof window !== 'undefined' && window.QURAN_LINES) ? window.QURAN_LINES.pages : null; },
  _lines(p) { const a = this._all(); return a ? a[p - 1] : null; },
  _divs() { return (typeof window !== 'undefined' && window.MUSHAF_DIVISIONS) || { juzs: [] }; },

  arDigits(n) { return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]); },

  _surahName(num) {
    try {
      if (typeof QuranOfflineService !== 'undefined' && QuranOfflineService.getSurahMeta) {
        const m = QuranOfflineService.getSurahMeta(num);
        if (m && m.name) return m.name.replace(/^سُورَةُ\s*/, '').replace(/^سورة\s*/, '');
      }
    } catch (e) {}
    try {
      const a = window.SURAH_NAMES;
      if (a && a[num - 1]) return a[num - 1];
    } catch (e) {}
    return String(num);
  },

  _juzOf(p) {
    const js = this._divs().juzs || [];
    let j = 1;
    for (const x of js) {
      const start = x.page || x.startPage || x.start;
      if (start && p >= start) j = x.n || x.juz || x.number || j;
    }
    return j;
  },

  _surahAtPage(p) {
    const ls = this._lines(p) || [];
    for (const l of ls) {
      if (l[0] === 't' && l[2] && l[2].length) return l[2][0][0];
    }
    return 1;
  },

  /* ---------------- إعدادات ---------------- */
  loadSettings() {
    this.fontSize = Storage.get('mushaf_font') || 'medium';
    const ms = Storage.get('mushaf_settings') || {};
    this.paper = ms.paper || 'auto';
    this.lineHeight = ms.lineHeight || 'normal';
    this.tajweed = !!Storage.get('mushaf_tajweed');
  },
  saveSettings() {
    Storage.set('mushaf_font', this.fontSize);
    Storage.set('mushaf_settings', { paper: this.paper, lineHeight: this.lineHeight });
    Storage.set('mushaf_tajweed', !!this.tajweed);
  },

  /* ---------------- صفحة ---------------- */
  render(container, params = {}) {
    // v1.0.134: وضع الورد — يُفتح من بطاقة «ورد اليوم»
    this._ward = !!(params && params.ward);
    if (this._ward && !(params && params.page)) {
      try {
        const k = KhatmaStore.active();
        const w = k && KhatmaStore.wardToday(k);
        if (w && w.pages > 0) params.page = (k.dir === -1 ? w.to : w.from);
      } catch (e) {}
    }
    this._tIn = Date.now();
    this._tracked = 0;
    this.loadSettings();
    let p = parseInt(params.page, 10);
    if (!(p >= 1 && p <= this.TOTAL_PAGES)) p = parseInt(Storage.get('mushaf_last_page'), 10) || 1;
    this.showPage(container || document.getElementById('main-content'), p, 0);
  },

  _lineHTML(l) {
    if (l[0] === 'h') {
      return `<div class="msh-ln msh-ln-h"><span class="msh-surah-band"><span class="msh-sb-orn">۞</span><span class="msh-sb-name">${l[1]}</span><span class="msh-sb-orn">۞</span></span></div>`;
    }
    if (l[0] === 'b') {
      return `<div class="msh-ln msh-ln-b"><span class="msh-basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span></div>`;
    }
    const txt = l[1] || '';
    const segs = l[2] || [];
    let html = '';
    let cur = 0;
    for (const [s, a, start, len] of segs) {
      if (start > cur) html += this._esc(txt.slice(cur, start));
      const chunk = txt.slice(start, start + len);
      html += `<span class="msh-ay" data-s="${s}" data-a="${a}">${this._esc(chunk)}</span>`;
      cur = start + len;
    }
    if (cur < txt.length) html += this._esc(txt.slice(cur));
    return `<div class="msh-ln"><span class="msh-ln-t">${html}</span></div>`;
  },

  _esc(s) {
    if (typeof Validate !== 'undefined' && Validate.escapeHTML) return Validate.escapeHTML(s);
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  _pageBodyHTML(p) {
    const ls = this._lines(p);
    if (!ls) return '<div class="msh-empty">—</div>';
    return ls.map(l => this._lineHTML(l)).join('');
  },

  _frameHTML(p, body) {
    return `
      <div class="msh-sheet msh-paper-${this.paper || 'auto'} font-${this.fontSize || 'medium'} lh-${this.lineHeight || 'normal'}">
        <div class="msh-frame">
          <div class="msh-lines" data-page="${p}">${body}</div>
          <div class="msh-folio"><span>${this.arDigits(p)}</span></div>
        </div>
      </div>`;
  },

  showPage(container, p, dir = 0) {
    // التتبّع الحقيقي: الصفحة تُحتسب إذا مكثت ≥ ١٢ ثانية قبل تقليبها
    if (this._ward && this.page && p !== this.page && (Date.now() - (this._tIn || 0)) >= 12000) {
      try { KhatmaStore.markPage(this.page, 'mushaf'); } catch (e) {}
    }
    this._tIn = Date.now();
    p = Math.min(this.TOTAL_PAGES, Math.max(1, p));
    const prev = this.page;
    this.page = p;
    Storage.set('mushaf_last_page', p);

    const root = container || document.getElementById('main-content');
    if (!root) return;
    const shell = root.querySelector('.msh-wrap');

    if (!shell) {
      root.innerHTML = this._shellHTML(p);
      this._afterRender();
      if (dir !== 0) this._fadeIn();
      return;
    }

    if (dir !== 0 && p !== prev) this._turn(root, p, dir);
    else {
      const box = root.querySelector('.msh-lines');
      if (box) { box.innerHTML = this._pageBodyHTML(p); box.dataset.page = p; }
      this._syncBars();
    }
  },

  _shellHTML(p) {
    const first = this._surahAtPage(p);
    return `
      <div class="msh-wrap" dir="rtl">
        <div class="msh-topbar">
          <button class="msh-ic" onclick="${this._ward ? "Router.go('quran/khatma')" : "Router.go('quran')"}" aria-label="${t('backToWisdom')}"><i class="fas fa-chevron-right"></i></button>
          <div class="msh-ttl">
            <b>${t('mushafTitle')}</b>
            <em id="msh-sub">${t('mushafJuz')} ${this.arDigits(this._juzOf(p))} · ${this._esc(this._surahName(first))}</em>
          </div>
          <button class="msh-ic" onclick="QuranMushafPage.switchToTranslation()" title="${t('quranTranslation') || 'الترجمة'}" aria-label="translation"><i class="fas fa-right-left"></i></button>
          <button class="msh-ic" onclick="QuranMushafPage.openPicker()" aria-label="${t('mushafIndex')}"><i class="fas fa-bars"></i></button>
          <button class="msh-ic" onclick="QuranMushafPage.openSettings(event)" aria-label="${t('settings_reader') || 'Ajustes'}"><i class="fas fa-sliders-h"></i></button>
        </div>

        ${this._ward ? this._wardBarHTML() : ""}
        <div class="msh-vp" id="msh-vp">
          <div class="msh-layer" id="msh-lay-a">${this._frameHTML(p, this._pageBodyHTML(p))}</div>
          <div class="msh-layer msh-layer-off" id="msh-lay-b"></div>
        </div>

        <div class="msh-bar" id="msh-bar">
          <button class="msh-nav" onclick="QuranMushafPage.prevPage()" ${p <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
          <button class="msh-pg" onclick="QuranMushafPage.openPagePicker()">${this.arDigits(p)} / ${this.arDigits(this.TOTAL_PAGES)}</button>
          <button class="msh-nav" onclick="QuranMushafPage.nextPage()" ${p >= this.TOTAL_PAGES ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
        </div>

        <div class="msh-prog"><i id="msh-prog-i" style="width:${(p / this.TOTAL_PAGES) * 100}%"></i></div>

        <div class="msh-audio" id="msh-audio" hidden>
          <button class="msh-a-btn" onclick="QuranMushafPage.audioToggle()" id="msh-a-play"><i class="fas fa-play"></i></button>
          <div class="msh-a-info">
            <b id="msh-a-ref">—</b>
            <em id="msh-a-rec">—</em>
          </div>
          <button class="msh-a-btn" onclick="QuranMushafPage.audioRestart()" title="${t('repeatAudio') || 'إعادة'}"><i class="fas fa-rotate-left"></i></button>
          <button class="msh-a-btn" onclick="QuranMushafPage.audioNextReciter()" title="${t('reciter') || 'القارئ'}"><i class="fas fa-user-pen"></i></button>
          <button class="msh-a-btn msh-a-stop" onclick="QuranMushafPage.audioStop()" title="${t('stop') || 'إيقاف'}"><i class="fas fa-xmark"></i></button>
        </div>

        <div class="msh-sheetmenu" id="msh-menu" hidden>
          <div class="msh-menu-card">
            <div class="msh-menu-head">
              <span id="msh-menu-ttl">—</span>
              <button onclick="QuranMushafPage.closeMenu()"><i class="fas fa-xmark"></i></button>
            </div>
            <div class="msh-menu-txt" id="msh-menu-txt"></div>
            <div class="msh-menu-grid">
              <button onclick="QuranMushafPage.menuTafsir()"><i class="fas fa-book-open"></i><span>${t('tafsir')}</span></button>
              <button onclick="QuranMushafPage.menuBookmark()"><i class="fas fa-bookmark"></i><span>${t('bookmark')}</span></button>
              <button onclick="QuranMushafPage.menuPlay()"><i class="fas fa-play"></i><span>${t('play') || 'تلاوة'}</span></button>
              <button onclick="QuranMushafPage.menuCopy()"><i class="fas fa-copy"></i><span>${t('copy')}</span></button>
              <button onclick="QuranMushafPage.menuShare()"><i class="fas fa-share-nodes"></i><span>${t('share')}</span></button>
              <button onclick="QuranMushafPage.menuOpenSurah()"><i class="fas fa-list"></i><span>${t('surah') || 'السورة'}</span></button>
            </div>
          </div>
        </div>
      </div>`;
  },

  _syncBars() {
    setTimeout(() => { try { this._syncWardBar && this._syncWardBar(); } catch (e) {} }, 0);
    const p = this.page;
    const sub = document.getElementById('msh-sub');
    if (sub) sub.textContent = `${t('mushafJuz')} ${this.arDigits(this._juzOf(p))} · ${this._surahName(this._surahAtPage(p))}`;
    const pg = document.querySelector('.msh-pg');
    if (pg) pg.textContent = `${this.arDigits(p)} / ${this.arDigits(this.TOTAL_PAGES)}`;
    const pr = document.getElementById('msh-prog-i');
    if (pr) pr.style.width = ((p / this.TOTAL_PAGES) * 100) + '%';
    const pb = document.querySelectorAll('.msh-nav');
    if (pb[0]) pb[0].disabled = p <= 1;
    if (pb[1]) pb[1].disabled = p >= this.TOTAL_PAGES;
  },

  _afterRender() {
    const root = document.getElementById('main-content');
    if (root) root.scrollTop = 0;
    this._bindGestures();
    this._fit();
    this._syncBars();
  },

  _fadeIn() {
    const vp = document.getElementById('msh-vp');
    if (!vp) return;
    vp.classList.add('msh-in');
    setTimeout(() => vp.classList.remove('msh-in'), 320);
  },

  /* ---------- ملاءمة حجم الخط: لا قصّ ولا التفاف ---------- */
  _fit() {
    const vp = document.getElementById('msh-vp');
    const lines = vp && vp.querySelector('.msh-lines');
    if (!vp || !lines) return;

    let m = document.getElementById('msh-measure');
    if (!m) {
      m = document.createElement('div');
      m.id = 'msh-measure';
      m.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:0;';
      document.body.appendChild(m);
    }
    const cs = getComputedStyle(lines);
    m.style.fontFamily = cs.fontFamily;
    m.style.fontWeight = cs.fontWeight;

    const texts = Array.from(lines.querySelectorAll('.msh-ln')).map(ln => ln.textContent);
    const availW = lines.clientWidth - 4;
    const availH = lines.clientHeight - 2;

    const levels = { small: .9, medium: 1, large: 1.08, xlarge: 1.16 };
    const scale = levels[this.fontSize] || 1;

    let best = 9;
    for (let fs = 27; fs >= 8.5; fs -= 0.25) {
      const test = fs * scale;
      // ١٥ سطرًا يجب أن تدخل في الارتفاع المتاح
      if (texts.length * test * 1.55 > availH + 4) continue;
      m.style.fontSize = test + 'px';
      let ok = true;
      for (const t of texts) {
        m.textContent = t;
        if (m.scrollWidth > availW) { ok = false; break; }
      }
      if (ok) { best = test; break; }
    }
    lines.style.fontSize = best.toFixed(2) + 'px';
  },

  /* ---------------- حركة التقليب ---------------- */
  _turn(root, p, dir) {
    if (this._animating) return;
    const vp = document.getElementById('msh-vp');
    const a = document.getElementById('msh-lay-a');
    const b = document.getElementById('msh-lay-b');
    if (!vp || !a || !b) { this.showPage(root, p, 0); return; }
    this._animating = true;
    const w = vp.clientWidth;

    b.innerHTML = this._frameHTML(p, this._pageBodyHTML(p));
    b.classList.remove('msh-layer-off');
    a.style.transition = 'transform .3s cubic-bezier(.22,.75,.25,1)';
    b.style.transition = 'transform .3s cubic-bezier(.22,.75,.25,1)';

    if (dir > 0) { b.style.transform = `translateX(${-w}px)`; void b.offsetWidth; }
    else { b.style.transform = `translateX(${w}px)`; void b.offsetWidth; }

    requestAnimationFrame(() => {
      a.style.transform = `translateX(${dir > 0 ? w : -w}px)`;
      b.style.transform = 'translateX(0px)';
    });

    const done = () => {
      a.innerHTML = b.innerHTML;
      a.style.transition = 'none'; b.style.transition = 'none';
      a.style.transform = 'translateX(0)'; b.style.transform = 'translateX(0)';
      b.classList.add('msh-layer-off'); b.innerHTML = '';
      this._animating = false;
      this._fit(); this._syncBars();
    };
    setTimeout(done, 330);
  },

  /* ---------------- اللمس والسحب ---------------- */
  _bindGestures() {
    const vp = document.getElementById('msh-vp');
    if (!vp || vp._bound) return;
    vp._bound = true;

    let sx = 0, sy = 0, dx = 0, dragging = false, lpT = null, lpTarget = null, moved = false, t0 = 0;
    const a = () => document.getElementById('msh-lay-a');

    const clearLp = () => { if (lpT) { clearTimeout(lpT); lpT = null; } lpTarget = null; };

    vp.addEventListener('touchstart', e => {
      if (this._animating) return;
      const t0p = e.touches[0];
      sx = t0p.clientX; sy = t0p.clientY; dx = 0; dragging = false; moved = false; t0 = Date.now();
      const ay = e.target.closest('.msh-ay');
      if (ay) {
        lpTarget = ay;
        lpT = setTimeout(() => {
          lpT = null;
          if (!moved) { this.openMenu(ay); if (navigator.vibrate) navigator.vibrate(12); }
        }, 480);
      }
    }, { passive: true });

    vp.addEventListener('touchmove', e => {
      if (this._animating) return;
      const p0 = e.touches[0];
      dx = p0.clientX - sx;
      const dy = p0.clientY - sy;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) moved = true;
      if (Math.abs(dx) > 10) clearLp();
      if (Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 12) {
        if (!dragging) {
          dragging = true; this._dragging = true;
          const b = document.getElementById('msh-lay-b');
          const target = dx > 0 ? this.page + 1 : this.page - 1;
          if (target >= 1 && target <= this.TOTAL_PAGES && b) {
            b.innerHTML = this._frameHTML(target, this._pageBodyHTML(target));
            b.classList.remove('msh-layer-off');
            b.style.transition = 'none';
            a().style.transition = 'none';
            b.style.transform = `translateX(${dx > 0 ? -vp.clientWidth : vp.clientWidth}px)`;
          }
        }
        const b = document.getElementById('msh-lay-b');
        if (b && !b.classList.contains('msh-layer-off')) {
          a().style.transform = `translateX(${dx}px)`;
          const base = dx > 0 ? -vp.clientWidth : vp.clientWidth;
          b.style.transform = `translateX(${base + dx}px)`;
        }
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });

    vp.addEventListener('touchend', e => {
      clearLp();
      const b = document.getElementById('msh-lay-b');
      const w = vp.clientWidth;
      const dt = Date.now() - t0;
      if (dragging) {
        this._dragging = false;
        const fast = Math.abs(dx) > 40 && dt < 320;
        const far = Math.abs(dx) > w * 0.28;
        const dir = dx > 0 ? 1 : -1;
        const target = this.page + dir;
        const can = target >= 1 && target <= this.TOTAL_PAGES;
        if ((far || fast) && can) {
          a().style.transition = 'transform .26s ease-out';
          b.style.transition = 'transform .26s ease-out';
          a().style.transform = `translateX(${dir > 0 ? w : -w}px)`;
          b.style.transform = 'translateX(0px)';
          this.page = target;
          Storage.set('mushaf_last_page', target);
          this._animating = true;
          setTimeout(() => {
            a().innerHTML = b.innerHTML;
            a().style.transition = 'none'; b.style.transition = 'none';
            a().style.transform = 'translateX(0)'; b.style.transform = 'translateX(0)';
            b.classList.add('msh-layer-off'); b.innerHTML = '';
            this._animating = false;
            this._fit(); this._syncBars();
          }, 270);
        } else {
          a().style.transition = 'transform .2s ease';
          b.style.transition = 'transform .2s ease';
          a().style.transform = 'translateX(0)';
          b.style.transform = `translateX(${dir > 0 ? -w : w}px)`;
          setTimeout(() => {
            b.classList.add('msh-layer-off'); b.innerHTML = '';
            b.style.transition = 'none'; a().style.transition = 'none';
          }, 210);
        }
        return;
      }
      if (!moved && dt < 320) {
        // ضغطة واحدة: إخفاء/إظهار الأشرطة + إغلاق القائمة
        this.closeMenu();
        if (!document.querySelector('.msh-menu:not([hidden])')) document.body.classList.toggle('msh-immersive');
      }
    }, { passive: true });

    vp.addEventListener('touchcancel', clearLp, { passive: true });
  },

  nextPage() { if (this.page < this.TOTAL_PAGES && !this._animating) this.showPage(null, this.page + 1, 1); },
  prevPage() { if (this.page > 1 && !this._animating) this.showPage(null, this.page - 1, -1); },

  /* ---------------- قائمة الآية ---------------- */
  openMenu(el) {
    const s = parseInt(el.dataset.s, 10), a = parseInt(el.dataset.a, 10);
    this._sel = { s, a, text: el.textContent.trim() };
    document.querySelectorAll('.msh-ay.sel').forEach(x => x.classList.remove('sel'));
    el.classList.add('sel');
    const menu = document.getElementById('msh-menu');
    if (!menu) return;
    document.getElementById('msh-menu-ttl').textContent = `سورة ${this._surahName(s)} · ${this.arDigits(a)}`;
    document.getElementById('msh-menu-txt').textContent = this._sel.text.slice(0, 160);
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('on'));
  },

  closeMenu() {
    const menu = document.getElementById('msh-menu');
    if (!menu || menu.hidden) return;
    menu.classList.remove('on');
    setTimeout(() => { menu.hidden = true; }, 200);
    document.querySelectorAll('.msh-ay.sel').forEach(x => x.classList.remove('sel'));
    this._sel = null;
  },

  menuTafsir() {
    if (!this._sel) return;
    const { s, a } = this._sel; this.closeMenu();
    try { QuranPage.openTafsir(s, a); } catch (e) {}
  },

  menuBookmark() {
    if (!this._sel) return;
    const { s, a } = this._sel; this.closeMenu();
    try { QuranPage.toggleBookmark(s, a); } catch (e) {}
  },

  menuCopy() {
    if (!this._sel) return;
    const s = this._sel.s, a = this._sel.a, txt = this._sel.text;
    this.closeMenu();
    try {
      navigator.clipboard.writeText(`${txt}\n﴿سورة ${this._surahName(s)} · ${a}﴾`).then(
        () => showToast(t('copied') || 'تم النسخ', 1600),
        () => showToast(t('copy') || 'نسخ', 1600)
      );
    } catch (e) {}
  },

  menuShare() {
    if (!this._sel) return;
    const s = this._sel.s, a = this._sel.a, txt = this._sel.text;
    this.closeMenu();
    const body = `${txt}\n﴿سورة ${this._surahName(s)} · ${a}﴾`;
    try {
      if (navigator.share) navigator.share({ text: body });
      else if (window.Android && Android.shareText) Android.shareText(body);
      else showToast(t('share') || 'مشاركة', 1600);
    } catch (e) {}
  },

  menuOpenSurah() {
    if (!this._sel) return;
    const s = this._sel.s; this.closeMenu();
    try { QuranPage.quickOpen(s, 1); } catch (e) { Router.go('quran/read'); }
  },

  menuPlay() {
    if (!this._sel) return;
    const { s, a } = this._sel; this.closeMenu();
    this.playAyah(s, a);
  },

  /* ---------------- الصوت ---------------- */
  _reciters() { return (typeof CONFIG !== 'undefined' && CONFIG.RECITERS) ? CONFIG.RECITERS : []; },

  _reciter() {
    const list = this._reciters();
    const id = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.reciter) || 'ar.husary';
    return list.find(r => r.id === id) || list[0] || { id: 'ar.husary', nameAr: 'محمود خليل الحصري' };
  },

  _globalAyah(s, a) {
    const off = (window.QURAN_LINES && window.QURAN_LINES.offsets) || [];
    const base = off[s - 1] || 0;
    return base + a;
  },

  _audioEl() {
    if (!this._au) {
      const el = new Audio();
      el.preload = 'none';
      el.addEventListener('ended', () => this.audioEnded());
      el.addEventListener('error', () => { showToast(t('error') || 'تعذّر التشغيل', 2000); });
      this._au = el;
    }
    return this._au;
  },

  playAyah(s, a) {
    const rec = this._reciter();
    this._audioRef = { s, a };
    const el = this._audioEl();
    const g = this._globalAyah(s, a);
    el.src = `https://cdn.islamic.network/quran/audio/128/${rec.id}/${g}.mp3`;
    el.play().catch(() => showToast(t('error') || 'تعذّر تشغيل التلاوة', 2200));
    this._audioUI(true);
    document.querySelectorAll('.msh-ay.playing').forEach(x => x.classList.remove('playing'));
    document.querySelectorAll(`.msh-ay[data-s="${s}"][data-a="${a}"]`).forEach(x => x.classList.add('playing'));
    if (typeof WakeLockService !== 'undefined') { try { WakeLockService.request(); } catch (e) {} }
  },

  audioToggle() {
    const el = this._au;
    if (!el || !this._audioRef) return;
    if (el.paused) { el.play().catch(() => {}); this._audioUI(true); }
    else { el.pause(); this._audioUI(false); }
  },

  audioRestart() {
    if (!this._au || !this._audioRef) return;
    this._au.currentTime = 0;
    this._au.play().catch(() => {});
    this._audioUI(true);
  },

  audioStop() {
    if (this._au) { this._au.pause(); this._au.removeAttribute('src'); this._au.load(); }
    this._audioRef = null;
    this._audioUI(false);
    document.querySelectorAll('.msh-ay.playing').forEach(x => x.classList.remove('playing'));
    if (typeof WakeLockService !== 'undefined') { try { WakeLockService.release(); } catch (e) {} }
  },

  audioNextReciter() {
    const list = this._reciters();
    if (!list.length) return;
    const cur = this._reciter();
    const i = list.findIndex(r => r.id === cur.id);
    const next = list[(i + 1) % list.length];
    try {
      AppState.settings.reciter = next.id;
      Storage.set('settings', AppState.settings);
    } catch (e) {}
    showToast(next.nameAr || next.name, 1500);
    if (this._audioRef) this.playAyah(this._audioRef.s, this._audioRef.a);
  },

  audioEnded() {
    if (!this._audioRef) return;
    const { s, a } = this._audioRef;
    const next = this._nextAyahRef(s, a);
    if (next) this.playAyah(next[0], next[1]);
    else this._audioUI(false);
  },

  _nextAyahRef(s, a) {
    const off = (window.QURAN_LINES && window.QURAN_LINES.offsets) || [];
    const counts = (window.QURAN_LINES && window.QURAN_LINES.counts) || [];
    const total = counts[s - 1] || 0;
    if (a < total) return [s, a + 1];
    return null;
  },

  _audioUI(playing) {
    const bar = document.getElementById('msh-audio');
    if (!bar) return;
    bar.hidden = false;
    bar.classList.add('on');
    const rec = this._reciter();
    const el = document.getElementById('msh-a-ref');
    if (el && this._audioRef) el.textContent = `سورة ${this._surahName(this._audioRef.s)} · ${this.arDigits(this._audioRef.a)}`;
    const rn = document.getElementById('msh-a-rec');
    if (rn) rn.textContent = rec.nameAr || rec.name || '';
    const pb = document.getElementById('msh-a-play');
    if (pb) pb.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    if (!this._audioRef) { bar.hidden = true; bar.classList.remove('on'); }
  },

  /* ---------------- تبديل العرض المترجم ---------------- */
  switchToTranslation() {
    const s = this._audioRef ? this._audioRef.s : this._surahAtPage(this.page);
    const a = this._audioRef ? this._audioRef.a : 1;
    try {
      if (typeof QuranPage !== 'undefined' && QuranPage.quickOpen) { QuranPage.quickOpen(s, a); return; }
    } catch (e) {}
    Router.go('quran/read');
  },

  /* ---------------- الإعدادات ---------------- */
  openSettings(ev) {
    if (ev) ev.stopPropagation();
    let sh = document.getElementById('msh-set-sheet');
    if (sh) return;
    sh = document.createElement('div');
    sh.id = 'msh-set-sheet';
    sh.className = 'msh-set-scrim';
    sh.innerHTML = `
      <div class="msh-set-card">
        <div class="msh-set-h"><b>${t('settings_reader') || 'إعدادات القراءة'}</b><button onclick="QuranMushafPage.closeSettings()"><i class="fas fa-xmark"></i></button></div>
        <div class="msh-set-lbl">${t('fontSize') || 'حجم الخط'}</div>
        <div class="msh-set-row">
          ${['small', 'medium', 'large', 'xlarge'].map(k => `<button class="msh-chip ${this.fontSize === k ? 'on' : ''}" onclick="QuranMushafPage.setOpt('size','${k}')">${({ small: 'ص', medium: 'م', large: 'ك', xlarge: 'ك+' })[k]}</button>`).join('')}
        </div>
        <div class="msh-set-lbl">${t('lineSpacing') || 'تباعد الأسطر'}</div>
        <div class="msh-set-row">
          <button class="msh-chip ${this.lineHeight === 'tight' ? 'on' : ''}" onclick="QuranMushafPage.setOpt('lh','tight')">مضغوط</button>
          <button class="msh-chip ${this.lineHeight === 'normal' ? 'on' : ''}" onclick="QuranMushafPage.setOpt('lh','normal')">عادي</button>
          <button class="msh-chip ${this.lineHeight === 'wide' ? 'on' : ''}" onclick="QuranMushafPage.setOpt('lh','wide')">واسع</button>
        </div>
        <div class="msh-set-lbl">${t('paper') || 'ورق الصفحة'}</div>
        <div class="msh-set-row">
          ${['auto', 'sepia', 'white', 'dark'].map(k => `<button class="msh-chip ${this.paper === k ? 'on' : ''}" onclick="QuranMushafPage.setOpt('paper','${k}')">${({ auto: 'تلقائي', sepia: 'عاجي', white: 'أبيض', dark: 'ليلي' })[k]}</button>`).join('')}
        </div>
        <button class="msh-set-close" onclick="QuranMushafPage.closeSettings()">${t('done') || 'تم'}</button>
      </div>`;
    sh.addEventListener('click', e => { if (e.target === sh) this.closeSettings(); });
    document.body.appendChild(sh);
  },

  closeSettings() { const s = document.getElementById('msh-set-sheet'); if (s) s.remove(); },

  setOpt(grp, val) {
    if (grp === 'size') this.fontSize = val;
    if (grp === 'lh') this.lineHeight = val;
    if (grp === 'paper') this.paper = val;
    this.saveSettings();
    const lines = document.querySelector('.msh-lines');
    if (lines) {
      const sheet = lines.closest('.msh-sheet');
      sheet.className = sheet.className.replace(/msh-paper-\w+|font-\w+|lh-\w+/g, '').trim();
      sheet.classList.add('msh-paper-' + this.paper, 'font-' + this.fontSize, 'lh-' + this.lineHeight);
    }
    this._fit();
    this.closeSettings();
    this.openSettings();
  },

  /* ---------------- الفهرس / الانتقال ---------------- */
  openPicker() {
    try { if (typeof QuranPage !== 'undefined' && QuranPage.openMushafPicker) { QuranPage.openMushafPicker(); return; } } catch (e) {}
    Router.go('quran/read');
  },
  openPagePicker() { this.openPicker(); },

  goToAyah(s, a) {
    const pages = this._all();
    if (!pages) return;
    for (let i = 0; i < pages.length; i++) {
      for (const l of pages[i]) {
        if (l[0] !== 't' || !l[2]) continue;
        if (l[2].some(x => x[0] === s && x[1] === a)) {
          this.showPage(null, i + 1, 0);
          setTimeout(() => {
            document.querySelectorAll(`.msh-ay[data-s="${s}"][data-a="${a}"]`).forEach(el => el.classList.add('sel'));
          }, 120);
          return;
        }
      }
    }
  },

  // ===== v1.0.134: شريط الورد داخل المصحف =====
  _wardBarHTML() {
    try {
      const k = KhatmaStore.active(); const w = KhatmaStore.wardToday(k);
      if (!k || !w || w.pages <= 0) return '';
      const wp = KhatmaStore.wardProgress(k);
      return `<div class="msh-ward" id="msh-ward">
        <i class="fas fa-bookmark"></i>
        <span>${t('wardToday') || 'ورد اليوم'} ${this.arDigits(w.i)}/${this.arDigits(KhatmaStore.plan(k).length)}</span>
        <span class="msh-ward-bar"><i id="msh-ward-i" style="width:${wp.pct}%"></i></span>
        <span id="msh-ward-n">${this.arDigits(wp.done)}/${this.arDigits(wp.total)}</span>
      </div>`;
    } catch (e) { return ''; }
  },
  _syncWardBar() {
    if (!this._ward) return;
    const k = KhatmaStore.active(); const wp = KhatmaStore.wardProgress(k);
    const bar = document.getElementById('msh-ward-i'); if (bar) bar.style.width = wp.pct + '%';
    const n = document.getElementById('msh-ward-n'); if (n) n.textContent = this.arDigits(wp.done) + '/' + this.arDigits(wp.total);
    const host = document.querySelector('.msh-lines');
    if (host && wp.ward && wp.ward.pages > 0) {
      const isEnd = this.page === wp.ward.to;
      let el = document.getElementById('msh-ward-end');
      if (isEnd && !el) {
        el = document.createElement('div'); el.id = 'msh-ward-end'; el.className = 'msh-ward-end';
        el.textContent = (t('wardEnd') || 'نهاية ورد اليوم') + ' · ' + (t('wardTapToRecord') || 'اضغط للاحتساب');
        el.onclick = () => { try { KhatmaStore.markPage(this.page, 'mushaf'); this._syncWardBar(); showToast(t('wardRecorded') || 'تم الاحتساب', 1400); } catch (e) {} };
        host.parentNode.insertBefore(el, host);
      } else if (!isEnd && el) el.remove();
    }
  },

  cleanup() {
    this.closeMenu();
    this.closeSettings();
    this.audioStop();
    this._animating = false;
    this._dragging = false;
    document.body.classList.remove('msh-immersive');
  }
};
