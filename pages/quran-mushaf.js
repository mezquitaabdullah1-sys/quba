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
    // v1.0.141: حجم خط موحّد بين المصحف والقارئ المترجم
    let fs = Storage.get('mushaf_font');
    if (!fs) { try { fs = (Storage.get('reader_settings') || {}).fontSize; } catch (e) {} }
    this.fontSize = fs || 'medium';
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
    // v1.0.145: جلسة الورد تُثبّت ختمتها بالمعرّف (kid) — التبديل بين الختمات
    // أثناء القراءة لم يعد يسرق الورد إلى ختمة أخرى، ووجهة الرجوع صريحة.
    this._kid = (params && params.kid) ? String(params.kid) : null;
    this._backTo = (params && params.back) ? String(params.back) : null;
    // v1.0.134: وضع الورد — يُفتح من بطاقة «ورد اليوم»
    this._ward = !!(params && params.ward) || !!this._kid;
    let _wc = false;
    try { _wc = !!Storage.get('msh_ward_collapsed'); } catch (e) {}
    this._wc = _wc;
    if (this._ward && !(params && params.page)) {
      try {
        const k = this._khatma();
        const w = k && KhatmaStore.wardToday(k);
        if (w && w.pages > 0) params.page = this._wardResumePage() || (k.dir === -1 ? w.to : w.from);
      } catch (e) {}
    }
    this._tIn = Date.now();
    this._tracked = 0;
    this._wardStop();
    this.loadSettings();
    let p = parseInt(params.page, 10);
    if (!(p >= 1 && p <= this.TOTAL_PAGES)) p = parseInt(Storage.get('mushaf_last_page'), 10) || 1;
    this.showPage(container || document.getElementById('main-content'), p, 0);
    this._trackStart();
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
    // v1.0.144: الاحتساب لم يعد حصرًا على وضع الورد — أي ختمة نشطة تتابع
    // القراءة من المصحف الكامل. الصفحة تُحتسب بعد مكوث ≥ ١٢ ثانية.
    if (this.page && p !== this.page) this._markPageIfDue(this.page);
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
          <button class="msh-ic" onclick="QuranMushafPage.goBack()" aria-label="${t('backToWisdom')}"><i class="fas fa-chevron-right"></i></button>
          <div class="msh-ttl">
            <b>${t('mushafTitle')}</b>
            <em id="msh-sub">${t('mushafJuz')} ${this.arDigits(this._juzOf(p))} · ${this._esc(this._surahName(first))}</em>
          </div>
          <button class="msh-ic" onclick="QuranMushafPage.switchToTranslation()" title="${t('quranTranslation') || 'الترجمة'}" aria-label="translation"><i class="fas fa-right-left"></i></button>
          <button class="msh-ic" onclick="QuranMushafPage.openPicker()" aria-label="${t('mushafIndex')}"><i class="fas fa-bars"></i></button>
          <button class="msh-ic" onclick="QuranMushafPage.openSettings(event)" aria-label="${t('settings_reader') || 'Ajustes'}"><i class="fas fa-sliders-h"></i></button>
        </div>

        ${this._wardBarHTML()}
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
          <div class="msh-a-row">
            <button class="msh-a-btn" onclick="QuranMushafPage.audioPrev()" title="السابق"><i class="fas fa-backward-step"></i></button>
            <button class="msh-a-btn" onclick="QuranMushafPage.audioToggle()" id="msh-a-play"><i class="fas fa-play"></i></button>
            <button class="msh-a-btn" onclick="QuranMushafPage.audioNextAyah()" title="التالي"><i class="fas fa-forward-step"></i></button>
            <div class="msh-a-info">
              <b id="msh-a-ref">—</b>
              <em id="msh-a-rec">—</em>
            </div>
            <button class="msh-a-btn" onclick="QuranMushafPage.audioNextReciter()" title="${t('reciter') || 'القارئ'}"><i class="fas fa-user-pen"></i></button>
            <button class="msh-a-btn msh-a-stop" onclick="QuranMushafPage.audioStop()" title="${t('stop') || 'إيقاف'}"><i class="fas fa-xmark"></i></button>
          </div>
          <div class="msh-a-row msh-a-row2">
            <span class="msh-a-time" id="msh-a-now">0:00</span>
            <input type="range" class="msh-a-seek" id="msh-a-seek" min="0" max="1000" value="0" step="1" oninput="QuranMushafPage.seekInput(this.value)">
            <span class="msh-a-time" id="msh-a-dur">0:00</span>
            <button class="msh-a-vol-btn" id="msh-a-volb" onclick="QuranMushafPage.toggleMute()"><i class="fas fa-volume-high"></i></button>
            <input type="range" class="msh-a-vol" id="msh-a-vol" min="0" max="100" value="100" step="1" oninput="QuranMushafPage.volInput(this.value)">
          </div>
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

  /* ---------- v1.0.179: قياس حقيقي — الحجم يقود، والقصّ ممنوع ---------- */
  _fit() {
    const vp = document.getElementById('msh-vp');
    if (!vp) return;
    const lines = vp.querySelector('.msh-lines');
    if (!lines) return;
    const rowsEls = Array.from(lines.querySelectorAll('.msh-ln'));
    if (!rowsEls.length) return;

    const rows = rowsEls.length;
    const lhMap = { tight: 1.30, normal: 1.55, wide: 1.88 };
    const lh = lhMap[this.lineHeight] || 1.55;
    const multMap = { small: 0.84, medium: 1.0, large: 1.16, xlarge: 1.34 };
    const mult = multMap[this.fontSize] || 1;

    // في وضع التمرير يقيس العميل عرض المحتوى لا المسرح ⇒ نستخدم آخر قياس حقيقي
    let availW, availH;
    if (this._pan && this._availW) { availW = this._availW; availH = this._availH; }
    else {
      availW = Math.max(100, lines.clientWidth || 100);
      availH = Math.max(100, lines.clientHeight || 100);
      this._availW = availW; this._availH = availH;
    }

    // أعرض سطر عند حجم مرجعي 20px بنفس الخط الفعلي
    let m = document.getElementById('msh-measure');
    if (!m) {
      m = document.createElement('div');
      m.id = 'msh-measure';
      m.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-99999px;top:0;';
      document.body.appendChild(m);
    }
    const cs = getComputedStyle(lines);
    m.style.fontFamily = cs.fontFamily;
    m.style.fontWeight = cs.fontWeight;
    m.style.fontSize = '20px';
    let widest = 1;
    rowsEls.forEach(el => {
      const t = el.querySelector('.msh-ln-t') || el;
      m.textContent = t.textContent || '';
      if (m.scrollWidth > widest) widest = m.scrollWidth;
    });

    const fitW = (20 * availW / widest) * 0.985;   // هامش أمان ١.٥٪
    const fitH = availH / (rows * lh);
    const base = Math.max(8, Math.min(fitW, fitH));
    const size = Math.max(8, Math.min(base * mult, 96));

    lines.style.setProperty('--msh-fs', size.toFixed(2) + 'px');
    lines.style.setProperty('--msh-lh', String(lh));
    lines.style.fontSize = size.toFixed(2) + 'px';
    this._fs = size.toFixed(2) + 'px';
    this._mirrorFit(this._fs);

    // يتجاوز العرض أو الارتفاع؟ ⇒ تمرير بدل قصّ
    const needW = (widest * size / 20) > availW + 1;
    const needH = rows * size * lh > availH + 1;
    const pan = needW || needH;
    vp.classList.toggle('msh-pan', pan);
    this._pan = pan;
    if (pan && !this._panHintShown) { this._panHintShown = true; this._showPanHint(); }
  },

  _showPanHint() {
    const vp = document.getElementById('msh-vp');
    if (!vp) return;
    const old = vp.querySelector('.msh-panhint');
    if (old) old.remove();
    const d = document.createElement('div');
    d.className = 'msh-panhint';
    d.innerHTML = '<span>اسحب أفقيًا لرؤية بقية السطر</span>';
    vp.appendChild(d);
    setTimeout(() => { try { d.remove(); } catch (e) {} }, 5200);
  },

  /* v1.0.141: الطبقة الاحتياطية تُرسم بنفس حجم الطبقة الظاهرة حتى لا «تقفز» */
  _mirrorFit(fs) {
    document.querySelectorAll('#msh-lay-b .msh-lines').forEach(el => {
      if (fs) {
        el.style.fontSize = fs;
        el.style.setProperty('--msh-fs', fs);
        const lhMap = { tight: 1.30, normal: 1.55, wide: 1.88 };
        el.style.setProperty('--msh-lh', String(lhMap[this.lineHeight] || 1.55));
      }
    });
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
    this._mirrorFit(a.querySelector('.msh-lines') && a.querySelector('.msh-lines').style.fontSize);
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
    }, { passive: false });

    // v1.0.179: في وضع التمرير يمرّر السحب المحتوى بدل تقليب الصفحة
    const panning = () => vp.classList.contains('msh-pan');

    vp.addEventListener('touchmove', e => {
      if (this._animating) return;
      if (panning()) return;
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
            this._mirrorFit(a().querySelector('.msh-lines') && a().querySelector('.msh-lines').style.fontSize);
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
      if (panning()) { this._dragging = false; return; }
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
        // v1.0.144: ضغطة على حافة الصفحة = تقليب (المصحف RTL: اليسار = التالي)
        const tt = e.changedTouches && e.changedTouches[0];
        const rc = vp.getBoundingClientRect();
        const frac = (tt && rc.width) ? (tt.clientX - rc.left) / rc.width : 0.5;
        const onAyah = e.target && e.target.closest && e.target.closest('.msh-ay');
        if (!onAyah && frac < 0.26) { this._zoneHint('l'); this.nextPage(); return; }
        if (!onAyah && frac > 0.74) { this._zoneHint('r'); this.prevPage(); return; }
        this.closeMenu();
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
      el.volume = this.volume();
      el.addEventListener('ended', () => this.audioEnded());
      el.addEventListener('timeupdate', () => this._audioProgress());
      el.addEventListener('loadedmetadata', () => this._audioProgress(true));
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
    el.volume = this.volume();
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

  /* ---------- مستوى الصوت والتقدّم (v1.0.141) ---------- */
  volume() {
    const v = parseFloat(Storage.get('mushaf_volume'));
    return isNaN(v) ? 1 : Math.max(0, Math.min(1, v));
  },
  _paintVol() {
    const v = this._au ? this._au.volume : this.volume();
    const sl = document.getElementById('msh-a-vol');
    if (sl) sl.value = Math.round(v * 100);
    const b = document.getElementById('msh-a-volb');
    if (b) b.innerHTML = v === 0 ? '<i class="fas fa-volume-xmark"></i>' : (v < .5 ? '<i class="fas fa-volume-low"></i>' : '<i class="fas fa-volume-high"></i>');
  },
  volInput(val) {
    const v = Math.max(0, Math.min(100, parseInt(val, 10) || 0)) / 100;
    Storage.set('mushaf_volume', v);
    if (this._au) this._au.volume = v;
    this._paintVol();
  },
  toggleMute() {
    const cur = this._au ? this._au.volume : this.volume();
    if (cur > 0) { this._prevVol = cur; this.volInput(0); }
    else this.volInput(Math.round((this._prevVol || 0.8) * 100));
  },
  _fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const m = Math.floor(sec / 60), ss = sec % 60;
    return m + ':' + (ss < 10 ? '0' + ss : ss);
  },
  _audioProgress(force) {
    const el = this._au;
    if (!el || !this._audioRef) return;
    const dur = el.duration || 0;
    const now = el.currentTime || 0;
    const dn = document.getElementById('msh-a-dur');
    const nn = document.getElementById('msh-a-now');
    if (dn) dn.textContent = this._fmt(dur);
    if (nn) nn.textContent = this._fmt(now);
    const sk = document.getElementById('msh-a-seek');
    if (sk && (force || !this._seekLock) && dur > 0) sk.value = Math.round((now / dur) * 1000);
  },
  seekInput(val) {
    const el = this._au;
    if (!el || !el.duration) return;
    this._seekLock = true;
    el.currentTime = (parseInt(val, 10) / 1000) * el.duration;
    const nn = document.getElementById('msh-a-now');
    if (nn) nn.textContent = this._fmt(el.currentTime);
    clearTimeout(this._seekT);
    this._seekT = setTimeout(() => { this._seekLock = false; }, 500);
  },
  _prevAyahRef(s, a) {
    const counts = (window.QURAN_LINES && window.QURAN_LINES.counts) || [];
    if (a > 1) return [s, a - 1];
    const prev = s - 1;
    const tot = counts[prev - 1] || 0;
    return tot ? [prev, tot] : null;
  },
  audioPrev() {
    if (!this._audioRef) return;
    const r = this._prevAyahRef(this._audioRef.s, this._audioRef.a);
    if (r) this.playAyah(r[0], r[1]);
  },
  audioNextAyah() {
    if (!this._audioRef) return;
    const r = this._nextAyahRef(this._audioRef.s, this._audioRef.a);
    if (r) this.playAyah(r[0], r[1]); else this.audioStop();
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
    this._paintVol();
    this._audioProgress(true);
    if (!this._audioRef) { bar.hidden = true; bar.classList.remove('on'); }
  },

  /* ---------------- تبديل العرض المترجم ---------------- */
  /* v1.0.141: أول آية في الصفحة — نقطة الارتساء الصحيحة عند التحويل للترجمة */
  _pageFirstAyah(p) {
    try {
      const all = (typeof window !== 'undefined') && window.QURAN_FULL_AR;
      if (all && all.pages) {
        const pg = all.pages.find(x => x.n === p);
        const a = pg && pg.ayahs && pg.ayahs[0];
        if (a) return [a[0], a[1]];
      }
    } catch (e) {}
    const ls = this._lines(p) || [];
    for (const l of ls) if (l[0] === 't' && l[2] && l[2].length) return [l[2][0][0], l[2][0][1]];
    return [this._surahAtPage(p), 1];
  },

  // نفس الصفحة + نفس الإعدادات + نفس حجم الخط (كان ينتقل لأول السورة بحجم مختلف)
  switchToTranslation() {
    const first = this._pageFirstAyah(this.page);
    try {
      if (typeof QuranPage !== 'undefined' && QuranPage.readerSettings) {
        QuranPage.readerSettings.fontSize = this.fontSize;
        if (QuranPage.saveReaderSettings) QuranPage.saveReaderSettings();
      }
      Storage.set('mushaf_font', this.fontSize);
      Storage.set('quran_target_page', this.page);
    } catch (e) {}
    Router.push('surah', { surahNumber: first[0], ayah: first[1], kid: this._kid || undefined, ward: this._kid ? 1 : undefined, back: this._backTo || undefined });
  },

  /* ---------------- الإعدادات ---------------- */
  openSettings(ev) {
    if (ev) { ev.stopPropagation(); if (ev.preventDefault) ev.preventDefault(); }
    let sh = document.getElementById('msh-set-sheet');
    if (sh) return;
    const chip = (grp, val, cur, label) =>
      `<button class="msh-chip ${cur === val ? 'on' : ''}" data-g="${grp}" data-v="${val}" onclick="QuranMushafPage.setOpt('${grp}','${val}')">${label}</button>`;
    sh = document.createElement('div');
    sh.id = 'msh-set-sheet';
    sh.className = 'msh-set-scrim';
    sh.innerHTML = `
      <div class="msh-set-card">
        <div class="msh-set-h"><b>${t('settings_reader') || 'إعدادات القراءة'}</b><button onclick="QuranMushafPage.closeSettings()"><i class="fas fa-xmark"></i></button></div>
        <div class="msh-set-lbl">${t('fontSize') || 'حجم الخط'}</div>
        <div class="msh-set-row">
          ${chip('size', 'small', this.fontSize, 'ص')}
          ${chip('size', 'medium', this.fontSize, 'م')}
          ${chip('size', 'large', this.fontSize, 'ك')}
          ${chip('size', 'xlarge', this.fontSize, 'ك+')}
        </div>
        <div class="msh-set-lbl">${t('lineSpacing') || 'تباعد الأسطر'}</div>
        <div class="msh-set-row">
          ${chip('lh', 'tight', this.lineHeight, 'مضغوط')}
          ${chip('lh', 'normal', this.lineHeight, 'عادي')}
          ${chip('lh', 'wide', this.lineHeight, 'واسع')}
        </div>
        <div class="msh-set-lbl">${t('paper') || 'ورق الصفحة'}</div>
        <div class="msh-set-row">
          ${chip('paper', 'auto', this.paper, 'تلقائي')}
          ${chip('paper', 'sepia', this.paper, 'عاجي')}
          ${chip('paper', 'white', this.paper, 'أبيض')}
          ${chip('paper', 'dark', this.paper, 'ليلي')}
        </div>
        <button class="msh-set-close" onclick="QuranMushafPage.closeSettings()">${t('done') || 'تم'}</button>
      </div>`;
    // v1.0.179: كانت اللمسة تُشترط أن تقع على الاطار نفسه بالضبط، وأي لمسة
    // داخل فراغ البطاقة لا تُغلق شيئًا. الآن أي لمسة خارج البطاقة تُغلقه فورًا.
    const onScrim = (e) => {
      const card = sh.querySelector('.msh-set-card');
      if (card && card.contains(e.target)) return;
      this.closeSettings();
    };
    sh.addEventListener('pointerdown', onScrim, { passive: true });
    sh.addEventListener('touchstart', onScrim, { passive: true });
    document.body.appendChild(sh);
  },

  closeSettings() { const s = document.getElementById('msh-set-sheet'); if (s) s.remove(); },

  // v1.0.141: يُطبّق التغيير فورًا ويُبقي الورقة مفتوحة (كانت تُغلق وتُعاد فتُربك المستخدم)
  setOpt(grp, val) {
    if (grp === 'size') this.fontSize = val;
    else if (grp === 'lh') this.lineHeight = val;
    else if (grp === 'paper') this.paper = val;
    else return;
    this.saveSettings();
    document.querySelectorAll('.msh-sheet').forEach(sheet => {
      sheet.classList.remove('msh-paper-auto', 'msh-paper-sepia', 'msh-paper-white', 'msh-paper-dark',
                             'font-small', 'font-medium', 'font-large', 'font-xlarge',
                             'lh-tight', 'lh-normal', 'lh-wide');
      sheet.classList.add('msh-paper-' + this.paper, 'font-' + this.fontSize, 'lh-' + this.lineHeight);
    });
    this._fit();
    const sh = document.getElementById('msh-set-sheet');
    if (sh) {
      sh.querySelectorAll('.msh-chip').forEach(b => {
        b.classList.toggle('on', b.dataset.g === grp && b.dataset.v === val);
      });
    }
  },

  /* ---------------- الفهرس / الانتقال ---------------- */
  // v1.0.144: الفهرس كان يستدعي دالة غير موجودة (QuranPage.openMushafPicker)
  // ثم «يتدارك» بالانتقال إلى قائمة السور — أي أن زر الفهرس ورقم الصفحة
  // كانا يُخرجان القارئ من المصحف. الآن ورقة فهرس داخلية: صفحة/جزء/سورة.
  openPicker() {
    this._ensurePickerSheet();
    const sh = document.getElementById('msh-pick-sheet');
    if (!sh) return;
    sh.hidden = false;
    requestAnimationFrame(() => sh.classList.add('on'));
    const inp = document.getElementById('msh-pick-inp');
    if (inp) inp.value = this.page;
    this._pickTab = this._pickTab || 'juz';
    this._renderPickBody();
  },
  openPagePicker() { this.openPicker(); },

  closePicker() {
    const sh = document.getElementById('msh-pick-sheet');
    if (!sh) return;
    sh.classList.remove('on');
    setTimeout(() => { if (sh) sh.hidden = true; }, 240);
  },

  _pickTabSet(t) { this._pickTab = t; this._renderPickBody(); },

  _ensurePickerSheet() {
    if (document.getElementById('msh-pick-sheet')) return;
    const sh = document.createElement('div');
    sh.id = 'msh-pick-sheet';
    sh.className = 'msh-pick-scrim';
    sh.hidden = true;
    sh.innerHTML = `
      <div class="msh-pick-card">
        <div class="msh-pick-h">
          <b>${t('mushafIndex') || 'الفهرس'}</b>
          <button onclick="QuranMushafPage.closePicker()" aria-label="×"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="msh-pick-search">
          <input type="number" class="msh-pick-inp" id="msh-pick-inp" min="1" max="604" inputmode="numeric" placeholder="1 – 604"
                 onkeydown="if(event.key==='Enter')QuranMushafPage.jumpInput()">
          <button class="msh-pick-go" onclick="QuranMushafPage.jumpInput()">${t('go') || 'انتقال'}</button>
        </div>
        <div class="msh-pick-tabs">
          <button class="msh-pick-tab" id="msh-ptab-juz" onclick="QuranMushafPage._pickTabSet('juz')">${t('mushafJuz') || 'الأجزاء'}</button>
          <button class="msh-pick-tab" id="msh-ptab-surah" onclick="QuranMushafPage._pickTabSet('surah')">${t('surahs') || 'السور'}</button>
        </div>
        <div class="msh-pick-body" id="msh-pick-body"></div>
      </div>`;
    sh.addEventListener('click', e => { if (e.target === sh) this.closePicker(); });
    document.body.appendChild(sh);
  },

  _renderPickBody() {
    const body = document.getElementById('msh-pick-body');
    if (!body) return;
    const tab = this._pickTab || 'juz';
    const bj = document.getElementById('msh-ptab-juz');
    const bs = document.getElementById('msh-ptab-surah');
    if (bj) bj.classList.toggle('on', tab === 'juz');
    if (bs) bs.classList.toggle('on', tab === 'surah');
    if (tab === 'juz') {
      const jz = this._divs().juzs || [];
      body.innerHTML = `<div class="msh-pick-grid">` + jz.map(x => {
        const n = x.juz || x.n || x.number;
        const pg = x.page || x.startPage || x.start || 1;
        return `<button class="msh-pick-cell ${this._juzOf(this.page) === n ? 'cur' : ''}" onclick="QuranMushafPage.goToPage(${pg})">${this.arDigits(n)}</button>`;
      }).join('') + `</div>`;
      return;
    }
    let rows = '';
    for (let s = 1; s <= 114; s++) {
      let pg = 1;
      try { pg = (typeof KhatmaStore !== 'undefined' && KhatmaStore.surahStart) ? KhatmaStore.surahStart(s) : 1; } catch (e) {}
      const nm = this._surahName(s);
      rows += `<button class="msh-pick-row ${this._surahAtPage(this.page) === s ? 'cur' : ''}" onclick="QuranMushafPage.goToPage(${pg})">
        <span class="msh-pick-cell" style="width:26px;flex:0 0 26px;padding:3px 0;background:transparent;border:none;">${this.arDigits(s)}</span>
        <b>${this._esc(nm)}</b><em>${t('mushafPage') || 'ص'} ${this.arDigits(pg)}</em>
      </button>`;
    }
    body.innerHTML = `<div class="msh-pick-list">${rows}</div>`;
  },

  jumpInput() {
    const inp = document.getElementById('msh-pick-inp');
    if (!inp) return;
    const n = parseInt(String(inp.value).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))), 10);
    if (!(n >= 1 && n <= this.TOTAL_PAGES)) { showToast(t('error') || 'رقم غير صالح', 1400); return; }
    this.goToPage(n);
  },

  goToPage(n) {
    n = Math.min(this.TOTAL_PAGES, Math.max(1, parseInt(n, 10) || 1));
    this.closePicker();
    if (this._animating) this._animating = false;
    this.showPage(null, n, n > this.page ? 1 : -1);
  },

  _zoneHint(side) {
    try {
      let h = document.getElementById('msh-zhint');
      if (!h) {
        h = document.createElement('div');
        h.id = 'msh-zhint';
        document.body.appendChild(h);
      }
      h.className = 'msh-zone-hint ' + (side === 'l' ? 'zl' : 'zr') + ' on';
      h.innerHTML = `<i class="fas fa-chevron-${side === 'l' ? 'left' : 'right'}"></i>`;
      clearTimeout(this._zhTo);
      this._zhTo = setTimeout(() => { h.classList.remove('on'); }, 260);
    } catch (e) {}
  },

  /* ---------------- v1.0.144: ربط ختمة اليوم ---------------- */
  _markPageIfDue(p) {
    if (!p) return false;
    if ((Date.now() - (this._tIn || 0)) < (this._kMinSec() * 1000)) return false;
    try {
      if (typeof KhatmaStore === 'undefined') return false;
      // v1.0.145: الاحتساب على ختمة الجلسة المثبَّتة (أو النشطة) لا على أي ختمة
      const k = this._khatma();
      if (!k) return false;
      const set = KhatmaStore.readSet(k);
      if (set.has(p)) return false;
      const r = KhatmaStore.markPage(p, 'mushaf', k.id);
      if (!r || !r.added) return false;
      // ملاحظة راجعة دائمًا — كانت لا تظهر إلا في وضع الورد فيبدو التتبّع معطلًا
      try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) {}
      try { showToast(this._wl('احتُسبت صفحة ' + this.arDigits(p) + ' في ختمتك', 'Página ' + this.arDigits(p) + ' registrada', 'Page ' + this.arDigits(p) + ' recorded'), 1200); } catch (e) {}
      try { this._syncWardBar(); } catch (e) {}
      return true;
    } catch (e) { return false; }
  },

  _kMinSec() {
    try { return (typeof KhatmaStore !== 'undefined' && KhatmaStore.MIN_SEC) || 12; } catch (e) { return 12; }
  },

  _trackStart() {
    this._trackStop();
    this._trackIv = setInterval(() => {
      if (document.hidden) return;
      this._markPageIfDue(this.page);
    }, 1500);
    try { this._syncWardBar(); } catch (e) {}
  },

  _trackStop() {
    if (this._trackIv) { clearInterval(this._trackIv); this._trackIv = null; }
  },

  goBack() {
    // v1.0.145: وجهة رجوع صريحة تُمرَّر من الفاتح (الختمة/القارئ). كان
    // history.back() يهبط على صفحة أخرى (أو نسخة مصحف قديمة) بدل الختمة.
    const to = this._backTo || ((this._ward || this._kid) ? 'quran/khatma' : null);
    if (to && Router.routes[to]) { Router.go(to, {}, { replace: true }); return; }
    try { if (window.history && history.length > 1) { history.back(); return; } } catch (e) {}
    Router.go('quran');
  },

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

  // ===== v1.0.137: وضع الورد — حدود واضحة + شريط تقدّم حيّ + احتساب أثناء القراءة =====
  _wl(a, e, en) {
    try { if (window.KhatmaPage && KhatmaPage.L) return KhatmaPage.L(a, e, en); } catch (err) {}
    return a;
  },
  /* ---------------- v1.0.145: شريط الختمة والورد (يعمل بلا وضع ورد) ---------------- */
  _khatma() {
    try {
      if (typeof KhatmaStore === 'undefined') return null;
      if (this._kid) { const k = KhatmaStore.get(this._kid); if (k && !k.archived) return k; }
      return KhatmaStore.active();
    } catch (e) { return null; }
  },

  _wardCtx() {
    try {
      const k = this._khatma(); if (!k) return null;
      const info = KhatmaStore.wardInfo(k);
      if (!info) return null;
      return { k: k, w: info.w, st: info.st, from: info.from, to: info.to, i: info.i, n: info.n };
    } catch (e) { return null; }
  },

  _wardStart() { this._trackStart(); },
  // v1.0.161: كانت تُوقف مؤقّتًا لا وجود له (‎_wardIv‎) بينما المؤقّت الحقيقي
  // هو ‎_trackIv‎ من _trackStart، فكان أي نداء لها لا يوقف الاحتساب.
  _wardStop() { this._trackStop(); },

  /* v1.0.163: أول صفحة غير مقروءة في ورد اليوم — المتابعة تكمل من حيث توقّف
     القارئ بدل إعادته إلى أول الورد في كل مرة. */
  _wardResumePage() {
    try {
      const c = this._wardCtx();
      if (!c || c.st !== 'open' || typeof KhatmaStore === 'undefined') return null;
      const set = KhatmaStore.readSet(c.k);
      const rev = (c.k.dir === -1);
      const lo = Math.min(c.from, c.to), hi = Math.max(c.from, c.to);
      for (let pg = rev ? hi : lo; rev ? pg >= lo : pg <= hi; pg += rev ? -1 : 1) {
        if (!set.has(pg)) return pg;
      }
      return null;
    } catch (e) { return null; }
  },

  continueWard() {
    const c = this._wardCtx();
    if (!c) { showToast(this._wl('لا توجد ختمة نشطة', 'Sin jatma activa', 'No active khatma'), 1600); return; }
    if (c.st !== 'open') { showToast(this._wardLine(c), 1800); return; }
    const p = this._wardResumePage();
    if (p === null) {
      showToast(this._wl('أكملت ورد اليوم — بارك الله فيك', 'Wird de hoy completado', "Today's ward complete"), 1800);
      this.goToPage(c.to);
      return;
    }
    this.goToPage(p);
    showToast(this._wl('متابعة الورد من صفحة ' + this.arDigits(p), 'Wird desde la pág. ' + this.arDigits(p), 'Ward from page ' + this.arDigits(p)), 1400);
  },

  toggleWard() {
    const box = document.getElementById('msh-ward');
    if (!box) return;
    this._wc = box.classList.toggle('is-collapsed');
    try { Storage.set('msh_ward_collapsed', this._wc); } catch (e) {}
    try { this._fit(); } catch (e) {}
  },

  _wardLine(c) {
    const L = (a, e, en) => this._wl(a, e, en);
    if (!c) return '';
    if (c.st === 'rest') return L('يوم راحة — لا ورد اليوم', 'Día de descanso', 'Rest day');
    if (c.st === 'before') return L('ختمتك تبدأ في ', 'Tu jatma empieza el ', 'Your khatma starts ') + (c.w.date || '');
    if (c.st === 'after') return L('انتهت أيام الختمة — بارك الله فيك', 'Días de la jatma terminados', 'Khatma days finished');
    return L('لا ورد محدَّد', 'Sin wird', 'No ward');
  },

  _wardBarHTML() {
    try {
      const c = this._wardCtx();
      if (!c) return '';
      const kp = KhatmaStore.progress(c.k);
      const nm = this._esc(c.k.name || '');
      const coll = this._wc ? ' is-collapsed' : '';
      if (c.st !== 'open') {
        return `<div class="msh-ward is-idle${coll}" id="msh-ward">
          <div class="msh-ward-top" onclick="QuranMushafPage.toggleWard()">
            <i class="fas fa-bookmark"></i>
            <span class="msh-ward-ttl">${nm}</span>
            <span class="msh-ward-n">${this.arDigits(kp.pct)}%</span>
          </div>
          <div class="msh-ward-bar"><i style="width:${kp.pct}%"></i></div>
          <div class="msh-ward-sub">${this._esc(this._wardLine(c))} · ${this.arDigits(kp.read)}/${this.arDigits(kp.total)}</div>
        </div>`;
      }
      const wp = KhatmaStore.wardProgress(c.k);
      const rl = KhatmaStore.rangeLabel(c.k, c.w);
      const rp = this._wardResumePage();
      const goLbl = (rp === null)
        ? this._wl('أكملت ورد اليوم', 'Wird de hoy completo', "Today's ward done")
        : this._wl('أكمل قراءة الورد', 'Continuar el wird', 'Continue ward') + ' · ' + this._wl('ص', 'p.', 'p.') + ' ' + this.arDigits(rp);
      return `<div class="msh-ward${coll}" id="msh-ward">
        <div class="msh-ward-top" onclick="QuranMushafPage.toggleWard()">
          <i class="fas fa-bookmark"></i>
          <span class="msh-ward-ttl">${this._wl('ورد اليوم', 'Wird de hoy', "Today's ward")} · ${nm}</span>
          <span class="msh-ward-rng" id="msh-ward-rng">${this._wl('ص', 'pág.', 'p.')} ${this.arDigits(c.from)}–${this.arDigits(c.to)}</span>
          <span class="msh-ward-n" id="msh-ward-n">${this.arDigits(wp.done)}/${this.arDigits(wp.total)}</span>
        </div>
        <div class="msh-ward-bar"><i id="msh-ward-i" style="width:${wp.pct}%"></i></div>
        <div class="msh-ward-sub" id="msh-ward-sub">${this._esc(rl)} · ${this._wl('الختمة', 'Jatma', 'Khatma')} ${this.arDigits(kp.pct)}% · ${this._wl('اليوم', 'Día', 'Day')} ${this.arDigits(c.i)}/${this.arDigits(c.n)}</div>
        <button class="msh-ward-go" onclick="QuranMushafPage.continueWard()">
          <i class="fas fa-${rp === null ? 'circle-check' : 'play'}"></i><span>${goLbl}</span>
        </button>
      </div>`;
    } catch (e) { return ''; }
  },

  _syncWardBar() {
    const c = this._wardCtx();
    const box = document.getElementById('msh-ward');
    if (!c) { if (box) box.remove(); return; }
    if (!box) {
      const top = document.querySelector('.msh-topbar');
      if (top && top.parentNode) top.insertAdjacentHTML('afterend', this._wardBarHTML());
      return;
    }
    const kp = KhatmaStore.progress(c.k);
    if (c.st !== 'open') {
      const bb = box.querySelector('.msh-ward-bar i'); if (bb) bb.style.width = kp.pct + '%';
      const nn = box.querySelector('.msh-ward-n'); if (nn) nn.textContent = this.arDigits(kp.pct) + '%';
      const ss = box.querySelector('.msh-ward-sub');
      if (ss) ss.textContent = this._wardLine(c) + ' · ' + this.arDigits(kp.read) + '/' + this.arDigits(kp.total);
      const eb = document.getElementById('msh-ward-edges'); if (eb) eb.remove();
      return;
    }
    const wp = KhatmaStore.wardProgress(c.k);
    const bar = document.getElementById('msh-ward-i'); if (bar) bar.style.width = wp.pct + '%';
    const n = document.getElementById('msh-ward-n'); if (n) n.textContent = this.arDigits(wp.done) + '/' + this.arDigits(wp.total);
    const rng = document.getElementById('msh-ward-rng');
    if (rng) rng.textContent = this._wl('ص', 'pág.', 'p.') + ' ' + this.arDigits(c.from) + '–' + this.arDigits(c.to);
    const sub = document.getElementById('msh-ward-sub');
    if (sub) sub.textContent = KhatmaStore.rangeLabel(c.k, c.w) + ' · ' + this._wl('الختمة', 'Jatma', 'Khatma') + ' ' + this.arDigits(kp.pct) + '% · ' + this._wl('اليوم', 'Día', 'Day') + ' ' + this.arDigits(c.i) + '/' + this.arDigits(c.n);

    // حدود الورد: تُعرض فقط عند صفحة البداية/النهاية أو خارج النطاق
    const frame = document.querySelector('.msh-frame');
    if (!frame) return;
    let ebox = document.getElementById('msh-ward-edges');
    const p = this.page;
    const out = p < c.from || p > c.to;
    const isStart = p === c.from;
    const isEnd = p === c.to;
    if (!out && !isStart && !isEnd) { if (ebox) ebox.remove(); return; }
    if (!ebox) { ebox = document.createElement('div'); ebox.id = 'msh-ward-edges'; ebox.className = 'msh-ward-edges'; frame.insertBefore(ebox, frame.firstChild); }
    const L = (a, e, en) => this._wl(a, e, en);
    const refF = KhatmaStore.pageRef(c.from), refT = KhatmaStore.pageRef(c.to);
    ebox.innerHTML = `
      ${isStart ? `<div class="msh-ward-note is-start"><i class="fas fa-flag"></i><b>${L('بداية الورد', 'Inicio del wird', 'Ward start')}</b><span>${L('صفحة', 'pág.', 'page')} ${this.arDigits(c.from)} · ${this._esc(KhatmaStore.surahName(refF.s) + ' ' + this.arDigits(refF.a))}</span></div>` : ''}
      ${isEnd ? `<div class="msh-ward-note is-end"><i class="fas fa-flag-checkered"></i><b>${L('نهاية الورد', 'Fin del wird', 'Ward end')}</b><span>${L('صفحة', 'pág.', 'page')} ${this.arDigits(c.to)} · ${this._esc(KhatmaStore.surahName(refT.sEnd || refT.s) + ' ' + this.arDigits(refT.aEnd || refT.a))}</span></div>` : ''}
      ${out ? `<div class="msh-ward-note is-out"><i class="fas fa-circle-info"></i><span>${L('خارج ورد اليوم — من', 'Fuera del wird — de la pág.', "Outside today's ward — pages")} ${this.arDigits(c.from)} ${L('إلى', 'a', 'to')} ${this.arDigits(c.to)}</span></div>` : ''}`;
  },

  cleanup() {
    // v1.0.137: احتساب الصفحة الأخيرة قبل مغادرة وضع الورد
    try { this._markPageIfDue(this.page); } catch (e) {}
    this._trackStop();
    this._wardStop();
    this.closePicker();
    this.closeMenu();
    this.closeSettings();
    this.audioStop();
    this._animating = false;
    this._dragging = false;
    document.body.classList.remove('msh-immersive');
  }
};
