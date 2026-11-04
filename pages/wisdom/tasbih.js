// 📿 Tasbih digital — v65 (misbaha rediseñada)
// Rediseño completo: modo TÁCTIL (anillo de progreso) y modo MISBAHA REAL
// (cuentas que se arrastran con el dedo), conmutables entre sí. Panel de
// ajustes: meta diaria, vibración, sonido, reinicio por ciclo, conservar
// contador al salir y borrado total de datos.
const TasbihPage = {
  count: 0,
  totalCount: 0,
  targetCount: 33,
  currentDhikr: 0,
  soundEnabled: true,
  mode: 'tap',               // 'tap' | 'beads'
  _drag: null,
  _tapCandidate: null,
  _beadGeom: null,
  _beadEls: null,
  _t: 0,                     // v65: موضع المسبحة المتصل (العدّ + كسر أثناء السحب)
  _raf: null,
  _resizeBound: false,

  DHIKRS: [
    {
      ar: 'سُبْحَانَ اللَّهِ', tr: 'Subhanallah',
      es: 'Glorificado sea Allah', en: 'Glory be to Allah',
      target: 33,
    },
    {
      ar: 'الْحَمْدُ لِلَّهِ', tr: 'Alhamdulillah',
      es: 'Alabado sea Allah', en: 'All praise is for Allah',
      target: 33,
    },
    {
      ar: 'اللَّهُ أَكْبَرُ', tr: 'Allahu Akbar',
      es: 'Allah es el más Grande', en: 'Allah is the Greatest',
      target: 34,
    },
    {
      ar: 'لَا إِلَهَ إِلَّا اللَّهُ', tr: "La ilaha illa-Allah",
      es: 'No hay divinidad sino Allah', en: 'There is no god but Allah',
      target: 100,
    },
    {
      ar: 'أَسْتَغْفِرُ اللَّهَ', tr: 'Astaghfirullah',
      es: 'Pido perdón a Allah', en: 'I seek Allah\'s forgiveness',
      target: 100,
    },
    {
      ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', tr: 'Subhanallahi wa bihamdihi',
      es: 'Glorificado y alabado sea Allah', en: 'Glory and praise be to Allah',
      target: 100,
    },
    {
      ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', tr: 'La hawla wa la quwwata illa billah',
      es: 'No hay fuerza ni poder sino con Allah', en: 'There is no power nor might except with Allah',
      target: 100,
    },
    {
      ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', tr: 'Allahumma salli ala Muhammad',
      es: 'Oh Allah, bendice a Muhammad ﷺ', en: 'O Allah, send blessings upon Muhammad ﷺ',
      target: 100,
    },
  ],

  // ============ v60: ajustes del tasbih (persistentes) ============
  _defaults: { dailyGoal: 100, vibration: 'light', autoResetCycle: false, keepCounter: true, mode: 'tap', targets: {}, beadShape: 'round', beadDesign: 'black' },

  // v1.0.80: أشكال الخرزات — يُبدَّل بينها من أسفل الصفحة في وضع السحب
  BEAD_SHAPES: [
    { id: 'round',   ar: 'دائري',  es: 'Redonda',  en: 'Round' },
    { id: 'pearl',   ar: 'لؤلؤة',  es: 'Perla',    en: 'Pearl' },
    { id: 'oval',    ar: 'بيضاوي', es: 'Ovalada',  en: 'Oval' },
    { id: 'diamond', ar: 'معيّن',  es: 'Rombo',    en: 'Diamond' },
    { id: 'hex',     ar: 'سداسي',  es: 'Hexágono', en: 'Hexagon' },
    { id: 'square',  ar: 'مربّع',  es: 'Cuadrada', en: 'Square' },
    { id: 'ring',    ar: 'حلقة',   es: 'Anillo',   en: 'Ring' },
    { id: 'star',    ar: 'نجمة',   es: 'Estrella', en: 'Star' },
    { id: 'octagon', ar: 'ثماني',  es: 'Octógono', en: 'Octagon' },
  ],

  // v131: 18 خامة حقيقية — المعاينة تُرسم بنفس طبقات الخرزة (beads-v131.css)
  BEAD_DESIGNS: [
    { id: 'black',      ar: 'أسود لامع',   es: 'Negro pulido',    en: 'Polished black' },
    { id: 'onyx',       ar: 'أونيكس مطفي', es: 'Ónix mate',       en: 'Matte onyx' },
    { id: 'marble',     ar: 'رخام',        es: 'Mármol',          en: 'Marble' },
    { id: 'wood',       ar: 'خشب كوكا',    es: 'Madera de kuka',  en: 'Kuka wood' },
    { id: 'sandalwood', ar: 'صندل',        es: 'Sándalo',         en: 'Sandalwood' },
    { id: 'striped',    ar: 'خشب مخطّط',   es: 'Madera rayada',   en: 'Striped wood' },
    { id: 'banded',     ar: 'عقيق مخطّط',  es: 'Ágata bandeada',  en: 'Banded agate' },
    { id: 'turquoise',  ar: 'فيروز',       es: 'Turquesa',        en: 'Turquoise' },
    { id: 'lapis',      ar: 'لازورد',      es: 'Lapislázuli',     en: 'Lapis lazuli' },
    { id: 'carnelian',  ar: 'عقيق أحمر',   es: 'Cornalina',       en: 'Carnelian' },
    { id: 'emerald',    ar: 'زمرد',        es: 'Esmeralda',       en: 'Emerald' },
    { id: 'amber',      ar: 'عنبر',        es: 'Ámbar',           en: 'Amber' },
    { id: 'crystal',    ar: 'زجاج بلوري',  es: 'Cristal claro',   en: 'Clear crystal' },
    { id: 'pearl',      ar: 'لؤلؤ',        es: 'Perla',           en: 'Pearl' },
    { id: 'gold',       ar: 'ذهب',         es: 'Oro',             en: 'Gold' },
    { id: 'silver',     ar: 'فضة',         es: 'Plata',           en: 'Silver' },
    { id: 'speckled',   ar: 'حجر مرقّط',   es: 'Jaspe moteado',   en: 'Speckled jasper' },
    { id: 'carbon',     ar: 'ألياف كربون', es: 'Fibra de carbono',en: 'Carbon fiber' },
    { id: 'iron',       ar: 'حديد مطروق',  es: 'Hierro forjado',  en: 'Wrought iron' },
    { id: 'olivewood',  ar: 'خشب زيتون',   es: 'Olivo',           en: 'Olive wood' },
  ],

  /** نص بثلاث لغات بلا الاعتماد على مفاتيح i18n */
  _l(ar, es, en) {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
    return l === 'es' ? es : (l === 'en' ? en : ar);
  },

  _beadDesign() {
    const d = this._settings().beadDesign;
    return this.BEAD_DESIGNS.some(x => x.id === d) ? d : 'black';
  },

  /** v131 (TD5): التسميات من i18n أولًا ثم من الكائن المحلي كاحتياط */
  _i18nOr(key, fallback) {
    try {
      if (typeof t === 'function') {
        const v = t(key);
        if (v && v !== key) return v;
      }
    } catch (e) {}
    return fallback;
  },

  _designLabel(id) {
    const d = this.BEAD_DESIGNS.find(x => x.id === id);
    if (!d) return id;
    const l = (typeof currentLocale !== 'undefined') ? currentLocale : 'ar';
    const fb = l === 'es' ? d.es : (l === 'en' ? d.en : d.ar);
    return this._i18nOr('bead' + id.charAt(0).toUpperCase() + id.slice(1), fb);
  },

  setBeadDesign(id, opts) {
    if (!this.BEAD_DESIGNS.some(x => x.id === id)) return;
    const same = this._beadDesign() === id;
    this._saveSettings({ beadDesign: id });
    const wrap = document.getElementById('misbaha-wrap');
    if (wrap) wrap.setAttribute('data-design', id);
    // الخرزات ترث المتغيّرات من .misbaha-wrap → تبديل اللون بلا أي إعادة بناء
    const label = document.getElementById('misbaha-design-name');
    if (label) label.textContent = this._designLabel(id) + ' · ' + this._shapeLabel(this._beadShape());
    const prev = document.querySelector('.misbaha-custom-btn .mcb-prev');
    if (prev) prev.setAttribute('data-design', id);
    this._refreshSheet();
    // v131 (T1): احترام إعداد الاهتزاز — كان ينادي navigator.vibrate مباشرة
    if (!same) this._vibrate(12);
  },

  /* ============ v131: ورقة واحدة للتخصيص والتأكيد (TD3) ============ */
  _lockScroll(on) {
    const b = document.body;
    if (on) {
      this._scrollY = window.scrollY || 0;
      b.style.top = '-' + this._scrollY + 'px';
      b.classList.add('qs-lock');
    } else {
      b.classList.remove('qs-lock');
      b.style.top = '';
      try { window.scrollTo(0, this._scrollY || 0); } catch (e) {}
    }
  },

  _modal(html, opts) {
    const o = Object.assign({ center: false }, opts || {});
    this.closeDesignPicker();
    const el = document.createElement('div');
    el.className = 'qs-overlay' + (o.center ? ' qs-center' : '');
    el.innerHTML = html;
    document.body.appendChild(el);
    this._lockScroll(true);
    el._close = (cb) => this._closeModal(el, cb);
    el.addEventListener('click', (ev) => { if (ev.target === el) el._close(); });
    el.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', (ev) => {
      ev.stopPropagation(); el._close();
    }));
    el._onKey = (ev) => {
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); el._close(); return; }
      if (ev.key !== 'Tab') return;
      const f = Array.from(el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(x => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', el._onKey);
    requestAnimationFrame(() => {
      el.classList.add('in');
      const b = el.querySelector('.qs-close') || el.querySelector('.qs-cancel');
      if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} }
    });
    return el;
  },

  _closeModal(el, cb) {
    if (!el || el._closed) return;
    el._closed = true;
    if (el._onKey) document.removeEventListener('keydown', el._onKey);
    this._lockScroll(false);
    if (this._sheetEl === el) this._sheetEl = null;
    el.classList.remove('in');
    el.classList.add('out');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (typeof cb === 'function') { try { cb(); } catch (e) {} }
    }, 190);
  },

  /** يغلق أي ورقة مفتوحة (يُستدعى أيضًا عند مغادرة الصفحة) */
  closeDesignPicker() {
    const el = document.querySelector('.qs-overlay');
    if (el && el._close) el._close();
    this._sheetEl = null;
  },

  /** v131 (TD2): الشكل والخامة في ورقة واحدة → صفحة أقصر واختيار أسرع */
  openCustomize() {
    if (document.querySelector('.qs-overlay')) return;
    const target = document.getElementById('misbaha-wrap');
    if (!target) return;                     // v131 (T2): لا نافذة شاردة على صفحة أخرى
    this._sheetEl = this._modal(this._customizeHtml(), {});
    this._sheetEl.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-design]');
      if (t) { ev.stopPropagation(); this.setBeadDesign(t.dataset.design); return; }
      const sh = ev.target.closest('[data-shape]');
      if (sh) { ev.stopPropagation(); this.setBeadShape(sh.dataset.shape); }
    });
  },

  // توافق مع الاستدعاءات القديمة
  openDesignPicker() { this.openCustomize(); },

  _customizeHtml() {
    const cur = this._beadDesign();
    const shape = this._beadShape();
    return `
      <div class="qs-card" role="dialog" aria-modal="true" aria-labelledby="qs-title">
        <div class="qs-head">
          <div class="qs-title" id="qs-title"><i class="fas fa-palette" style="color:#D4AF37"></i> ${this._i18nOr('beadDesignTitle', this._l('تخصيص المسبحة', 'Personalizar', 'Customize'))}</div>
          <button class="qs-close" type="button" data-close aria-label="${this._l('إغلاق', 'Cerrar', 'Close')}">×</button>
        </div>
        <div class="qs-sub">${this._i18nOr('beadDesignSub', this._l('اختر الشكل والخامة — يُطبَّق فورًا', 'Forma y material — al instante', 'Shape and material — instantly'))}</div>
        <div class="qs-preview">
          <span class="qs-prev-big bead-skin shape-${shape}" data-design="${cur}" id="qs-prev-big"></span>
          <span class="qs-preview-t">
            <b id="qs-prev-name">${this._designLabel(cur)}</b>
            <span id="qs-prev-shape">${this._shapeLabel(shape)}</span>
          </span>
        </div>
        <div class="qs-sec"><i class="fas fa-shapes"></i> ${this._i18nOr('beadDesignShape', this._l('الشكل', 'Forma', 'Shape'))}</div>
        <div class="qs-shapes">
          ${this.BEAD_SHAPES.map(sh => `
            <button class="qs-shape ${shape === sh.id ? 'active' : ''}" type="button" data-shape="${sh.id}"
                    aria-pressed="${shape === sh.id}" aria-label="${escapeAttr(this._shapeLabel(sh.id))}"
                    title="${escapeAttr(this._shapeLabel(sh.id))}">
              <span class="shape-preview bead-skin shape-${sh.id}" data-design="${cur}"></span>
            </button>`).join('')}
        </div>
        <div class="qs-sec"><i class="fas fa-gem"></i> ${this._i18nOr('beadDesignMaterial', this._l('الخامة', 'Material', 'Material'))}</div>
        <div class="qs-grid" id="qs-grid">
          ${this.BEAD_DESIGNS.map(d => `
            <button class="qs-tile ${cur === d.id ? 'active' : ''}" type="button" data-design="${d.id}" aria-pressed="${cur === d.id}">
              <span class="bd-prev bead-skin shape-${shape}" data-design="${d.id}"></span>
              <span class="qs-nm">${this._designLabel(d.id)}</span>
            </button>`).join('')}
        </div>
      </div>`;
  },

  _refreshSheet() {
    const el = this._sheetEl;
    if (!el) return;
    const cur = this._beadDesign(), shape = this._beadShape();
    const big = el.querySelector('#qs-prev-big');
    if (big) { big.className = 'qs-prev-big bead-skin shape-' + shape; big.setAttribute('data-design', cur); }
    const nm = el.querySelector('#qs-prev-name'); if (nm) nm.textContent = this._designLabel(cur);
    const sh = el.querySelector('#qs-prev-shape'); if (sh) sh.textContent = this._shapeLabel(shape);
    el.querySelectorAll('.qs-tile').forEach(x => {
      const on = x.dataset.design === cur;
      x.classList.toggle('active', on);
      x.setAttribute('aria-pressed', String(on));
      const pr = x.querySelector('.bd-prev');
      if (pr) { pr.className = 'bd-prev bead-skin shape-' + shape; pr.setAttribute('data-design', x.dataset.design); }
    });
    el.querySelectorAll('.qs-shape').forEach(x => {
      const on = x.dataset.shape === shape;
      x.classList.toggle('active', on);
      x.setAttribute('aria-pressed', String(on));
      const sp = x.querySelector('.shape-preview');
      if (sp) { sp.className = 'shape-preview bead-skin shape-' + x.dataset.shape; sp.setAttribute('data-design', cur); }
    });
  },

  _beadShape() {
    const s = this._settings().beadShape;
    return this.BEAD_SHAPES.some(x => x.id === s) ? s : 'round';
  },

  _shapeLabel(shape) {
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    const s = this.BEAD_SHAPES.find(x => x.id === shape);
    if (!s) return shape;
    const fb = (loc === 'ar' ? s.ar : (loc === 'en' ? s.en : s.es));
    return this._i18nOr('beadShape' + shape.charAt(0).toUpperCase() + shape.slice(1), fb);
  },

  /** أبعاد الخرزة حسب الشكل المختار (البيضاوي أعرض وأقصر). */
  _beadDims(g) {
    const s = this._beadShape();
    if (s === 'oval') return { w: g.size * 1.14, h: g.size * 0.72 };
    return { w: g.size, h: g.size };
  },

  /** يبدّل شكل الخرزات ويحفظه — بلا سباق ولا نافذة مؤجّلة (T2) */
  setBeadShape(id) {
    if (!this.BEAD_SHAPES.some(x => x.id === id)) return;
    const same = this._beadShape() === id;
    this._saveSettings({ beadShape: id });
    const wrap = document.getElementById('misbaha-wrap');
    if (wrap) wrap.setAttribute('data-shape', id);
    const host = document.getElementById('misbaha-beads');
    if (host) {
      host.innerHTML = '';
      this._beadEls = new Map();
      this._beadGeom = null;
      this._layoutBeads();
    }
    const label = document.getElementById('misbaha-design-name');
    if (label) label.textContent = this._designLabel(this._beadDesign()) + ' · ' + this._shapeLabel(id);
    this._refreshSheet();
    if (!same) this._vibrate(8);
  },

  _settings() {
    let s = null;
    try { s = Storage.get('tasbih_settings'); } catch (e) {}
    if (!s || typeof s !== 'object') s = {};
    return Object.assign({}, this._defaults, s);
  },

  _saveSettings(patch) {
    try { Storage.set('tasbih_settings', Object.assign(this._settings(), patch)); } catch (e) {}
  },

  dailyGoal() { return this._settings().dailyGoal || 100; },

  // v1.0.78: هدف الذكر الحالي — الافتراضي أو ما اختاره المستخدم بزر القلم
  _targetFor(idx) {
    const t = (this._settings().targets || {})[idx];
    const n = parseInt(t, 10);
    return (n > 0) ? n : this.DHIKRS[idx].target;
  },

  // v1.0.78: زر القلم — تغيير عدد هدف التسبيح (33 · 50 · 100 · 200)
  pickTarget() {
    const cur = this._targetFor(this.currentDhikr);
    const opts = [33, 50, 100, 200];
    const items = opts.map(n => ({
      id: String(n),
      label: `<b>${n}</b> <span style="opacity:.65;font-size:12px;">${t('tasbihTarget') || ''}</span>`,
    }));
    showModal(t('tasbihTargetTitle') || (t('tasbihTitle') || 'Tasbih'), items, String(cur), (id) => {
      const n = parseInt(id, 10);
      if (!(n > 0)) return;
      const targets = Object.assign({}, this._settings().targets || {});
      targets[this.currentDhikr] = n;
      this._saveSettings({ targets });
      this.targetCount = n;
      this.count = 0;
      this.saveState();
      this.renderUI(document.getElementById('main-content'));
      showToast('🎯 ' + n, 1500);
    });
  },

  // ============ registro diario para estadísticas hoy / semana ============
  _dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  getLog() {
    let log = Storage.get('tasbih_log');
    if (!log || typeof log !== 'object') log = {};
    return log;
  },

  // v131 (T4): تجميع الكتابات — كان كل نقرة تكتب localStorage مرة كاملة
  _pendingDaily: 0,
  recordDailyCount(n) {
    this._pendingDaily = (this._pendingDaily || 0) + n;
    if (this._logTimer) clearTimeout(this._logTimer);
    this._logTimer = setTimeout(() => this.flushDaily(), 700);
  },

  flushDaily() {
    if (this._logTimer) { clearTimeout(this._logTimer); this._logTimer = null; }
    const n = this._pendingDaily || 0;
    this._pendingDaily = 0;
    if (!n) return;
    const log = this.getLog();
    const k = this._dayKey();
    log[k] = (log[k] || 0) + n;
    const keys = Object.keys(log).sort();
    while (keys.length > 45) { delete log[keys.shift()]; }
    try { Storage.set('tasbih_log', log); } catch (e) {}
  },

  todayCount() {
    return (this.getLog()[this._dayKey()] || 0) + (this._pendingDaily || 0);
  },

  weekCount() {
    const log = this.getLog();
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      sum += log[this._dayKey(d)] || 0;
    }
    return sum;
  },

  render(container) {
    const saved = Storage.get('tasbih') || { count: 0, totalCount: 0, currentDhikr: 0, soundEnabled: true };
    this.count = saved.count || 0;
    this.totalCount = saved.totalCount || 0;
    this.currentDhikr = saved.currentDhikr || 0;
    this.soundEnabled = saved.soundEnabled !== false;
    this.targetCount = this._targetFor(this.currentDhikr);
    this.mode = this._settings().mode === 'beads' ? 'beads' : 'tap';
    this.renderUI(container);
  },

  renderUI(container) {
    const dhikr = this.DHIKRS[this.currentDhikr];
    const progress = Math.min(this.count / this.targetCount, 1);
    const isComplete = this.count >= this.targetCount;
    const lang = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    const today = this.todayCount();
    const week = this.weekCount();
    const goal = this.dailyGoal();
    const life = (typeof Gamification !== 'undefined' && Gamification.getState)
      ? (Gamification.getState().stats.tasbihCount || 0) : 0;
    const xpPer100 = (typeof Gamification !== 'undefined' && Gamification.XP_PER_TASBIH_100) || 20;
    const xp = Math.floor(this.totalCount / 100) * xpPer100;
    const R = 98, CIRC = 2 * Math.PI * R;

    container.innerHTML = `
      <div class="top-bar">
        <button class="top-bar-btn" onclick="Router.go('wisdom')">
          <i class="fas fa-chevron-${currentLocale === 'ar' ? 'right' : 'left'}"></i>
        </button>
        <div class="top-bar-title"><i class="fas fa-circle-nodes"></i> ${t('tasbihTitle') || 'Tasbih'}</div>
        <div style="display:flex; gap:4px;">
          <button class="top-bar-btn" onclick="TasbihPage.openSettings()" title="${t('tasbihSettings') || 'Ajustes'}">
            <i class="fas fa-gear"></i>
          </button>
          <button class="top-bar-btn" id="tasbih-sound-btn" onclick="TasbihPage.toggleSound()" title="${t('sound') || 'Sound'}">
            <i class="fas fa-${this.soundEnabled ? 'volume-up' : 'volume-mute'}"></i>
          </button>
        </div>
      </div>

      <div class="tasbih-container">
        <!-- Strip deslizable de adhkar (chips compactos) -->
        <div class="dhikr-strip" id="dhikr-strip">
          ${this.DHIKRS.map((d, idx) => `
            <button class="dhikr-chip ${idx === this.currentDhikr ? 'active' : ''}" data-dhikr-idx="${idx}" onclick="TasbihPage.selectDhikr(${idx})">
              <span class="dhikr-chip-ar">${d.ar}</span>
              <span class="dhikr-chip-target">×${this._targetFor(idx)}</span>
            </button>
          `).join('')}
        </div>

        <!-- Dhikr text display -->
        <div class="dhikr-display" id="dhikr-display">
          <div class="dhikr-arabic">${dhikr.ar}</div>
          ${lang !== 'ar' ? `
            <div class="dhikr-trans">${dhikr.tr}</div>
            <div class="dhikr-es">${dhikr[lang] || dhikr.es}</div>
          ` : ''}
        </div>

        <!-- v60: الهدف اليومي + مجموع اليوم -->
        <div class="tasbih-goal-line">
          <span><i class="fas fa-bullseye"></i> ${t('dailyGoal') || 'Meta diaria'}: <b>${goal}</b></span>
          <span class="tasbih-goal-today-wrap">${t('todayTasbih') || 'Hoy'}: <b id="tasbih-goal-today">${today}</b>/${goal}</span>
        </div>

        <!-- v1.0.129: أزرار الوضع والإعادة في صف أسفل الهدف اليومي (لا خلف الخرز) -->
        <div class="tasbih-rail-row" role="toolbar" aria-label="${t('tasbihTitle') || 'Tasbih'}">
          <button class="t-rail-pill" onclick="TasbihPage.toggleMode()"
                  title="${this.mode === 'beads' ? (t('tapMode') || 'Modo táctil') : (t('beadsMode') || 'Modo misbaha')}"
                  aria-label="${this.mode === 'beads' ? (t('tapMode') || 'Modo táctil') : (t('beadsMode') || 'Modo misbaha')}">
            <i class="fas fa-${this.mode === 'beads' ? 'hand-pointer' : 'circle-nodes'}"></i>
            <span>${this.mode === 'beads' ? (t('tapMode') || 'Modo táctil') : (t('beadsMode') || 'Modo misbaha')}</span>
          </button>
          <button class="t-rail-pill" onclick="TasbihPage.reset()"
                  title="${t('resetCounter') || 'Reiniciar'}" aria-label="${t('resetCounter') || 'Reiniciar'}">
            <i class="fas fa-rotate-left"></i>
            <span>${t('resetCounter') || 'Reiniciar'}</span>
          </button>
        </div>

        <div class="tasbih-stagewrap">
        ${this.mode === 'beads' ? this._beadsHtml() : `
          <!-- Modo táctil: anillo de progreso -->
          <div class="tasbih-counter ${isComplete ? 'complete' : ''}" id="tasbih-counter" onclick="TasbihPage.increment()">
            <svg class="tasbih-ring" width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="${R}" fill="none" stroke="rgba(212,175,55,0.15)" stroke-width="9"/>
              <circle cx="110" cy="110" r="${R}" fill="none" stroke="url(#tasbih-gradient)" stroke-width="9"
                      stroke-linecap="round"
                      stroke-dasharray="${CIRC}"
                      stroke-dashoffset="${CIRC * (1 - progress)}"
                      transform="rotate(-90 110 110)"
                      style="transition: stroke-dashoffset 0.4s cubic-bezier(0.4,0,0.2,1);"/>
              <defs>
                <linearGradient id="tasbih-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#0F4C3A"/>
                  <stop offset="100%" stop-color="#D4AF37"/>
                </linearGradient>
              </defs>
            </svg>
            <div class="tasbih-center">
              <div class="tasbih-count" id="tasbih-count-val" aria-live="polite" aria-atomic="true">${this.count}</div>
              <div class="tasbih-target" onclick="event.stopPropagation()"><button class="tasbih-target-edit" type="button" title="${t('tasbihTargetTitle') || 'Target'}" aria-label="${t('tasbihTargetTitle') || 'Target'}" onclick="event.stopPropagation(); TasbihPage.pickTarget()"><i class="fas fa-pen"></i></button> / ${this.targetCount}</div>
              <div class="tasbih-hint">${isComplete ? '<i class="fas fa-circle-check"></i> ' + (t('completed') || '¡Completo!') : '<i class="fas fa-hand-point-up"></i> ' + (t('tapToCount') || 'Toca para contar')}</div>
            </div>
          </div>
        `}

        ${this.mode === 'beads' ? `<div class="tasbih-hint-line"><i class="fas fa-hand-pointer"></i> ${t('dragBeadsHint') || 'Arrastra una cuenta hacia el borde para contar'}</div>` : ''}

        </div>
        </div>

        <!-- Mini tarjeta de estadísticas hoy / semana -->
        <div class="tasbih-daily-card" id="tasbih-daily-card" onclick="TasbihPage.toggleStatsPanel()" role="button" tabindex="0" aria-expanded="false" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();TasbihPage.toggleStatsPanel();}">
          <div class="tasbih-daily-item">
            <div class="tasbih-daily-value" id="tasbih-today-val">${today}</div>
            <div class="tasbih-daily-label"><i class="fas fa-sun"></i> ${t('todayTasbih') || 'Hoy'}</div>
          </div>
          <div class="tasbih-daily-sep"></div>
          <div class="tasbih-daily-item">
            <div class="tasbih-daily-value" id="tasbih-week-val">${week}</div>
            <div class="tasbih-daily-label"><i class="fas fa-calendar-week"></i> ${t('weekTasbih') || 'Semana'}</div>
          </div>
          <i class="fas fa-chevron-down tasbih-daily-caret" id="tasbih-daily-caret"></i>
        </div>

        <!-- Panel de estadísticas con pestaña día / semana -->
        <div class="tasbih-stats-panel hidden" id="tasbih-stats-panel">
          <div class="tasbih-stats-toggle" role="tablist">
            <button class="tasbih-stats-tab active" id="tasbih-tab-day" onclick="event.stopPropagation(); TasbihPage.setStatsTab('day')">${t('todayTasbih') || 'Hoy'}</button>
            <button class="tasbih-stats-tab" id="tasbih-tab-week" onclick="event.stopPropagation(); TasbihPage.setStatsTab('week')">${t('weekTasbih') || 'Semana'}</button>
          </div>
          <div class="tasbih-stats">
            <div class="tasbih-stat">
              <div class="tasbih-stat-value" id="tasbih-session">${this.totalCount}</div>
              <div class="tasbih-stat-label">${t('sessionTotal') || 'Sesión'}</div>
            </div>
            <div class="tasbih-stat">
              <div class="tasbih-stat-value" id="tasbih-panel-main">${today}</div>
              <div class="tasbih-stat-label" id="tasbih-panel-main-label">${t('todayTasbih') || 'Hoy'}</div>
            </div>
            <div class="tasbih-stat">
              <div class="tasbih-stat-value">${life}</div>
              <div class="tasbih-stat-label">${t('lifetimeTotal') || 'Histórico'}</div>
            </div>
            <div class="tasbih-stat">
              <div class="tasbih-stat-value">+${xp}</div>
              <div class="tasbih-stat-label">XP</div>
            </div>
          </div>
        </div>
      </div>

      <!-- v60: hoja de ajustes del tasbih -->
      <div class="tasbih-sheet-overlay hidden" id="tasbih-sheet" onclick="TasbihPage.closeSettings()">
        <div class="tasbih-sheet" onclick="event.stopPropagation()">
          <div class="tasbih-sheet-handle"></div>
          <div class="tasbih-sheet-title"><i class="fas fa-gear"></i> ${t('tasbihSettings') || 'Ajustes del tasbih'}</div>
          ${this._sheetBodyHtml()}
        </div>
      </div>
    `;
    this._bindDhikrSwipe();
    this._scrollActiveChip();
    this._cancelAnim();
    this._drag = null;
    this._beadGeom = null;
    this._beadEls = new Map();
    this._t = this.count;
    if (this.mode === 'beads') {
      this._bindBeads();
      requestAnimationFrame(() => this._layoutBeads());
      if (!this._onResize) {
        // v131 (T5): مرجع محفوظ حتى يُزال في cleanup — كان يبقى بعد مغادرة الصفحة
        this._onResize = () => {
          if (this.mode === 'beads' && document.getElementById('misbaha-wrap')) this._layoutBeads();
        };
        window.addEventListener('resize', this._onResize, { passive: true });
      }
    }
  },

  // ============ v65: MISBAHA — إعادة تصميم ============
  // مسبحة لا نهائية (كحلقة حقيقية) تُرسم على مسار مائل منحنٍ قليلًا، مع فراغ
  // واسع في المنتصف. لا تُعرض كل الخرزات: ما يخرج عن الشاشة يُقصّ. السحب متاح
  // في كامل المنطقة (وليس على الخرزة فقط): اليمين→اليسار يزيد العدّ (تختفي خرزة
  // من اليسار وتأتي أخرى من اليمين) والعكس يُنقص. الحركة متصلة (t كسري) فتنزلق
  // الخرزات مع الإصبع، وتعبر الخرزة الأمامية الفراغ من اليمين إلى اليسار.
  _beadsHtml() {
    const n = Math.min(this.targetCount, 33);
    const round = Math.floor(this.count / n) + 1;
    return `
      <div class="misbaha-wrap ${this.count >= this.targetCount ? 'complete' : ''}" id="misbaha-wrap" data-design="${this._beadDesign()}">
        ${this.targetCount > n ? `<div class="misbaha-round" id="misbaha-round">${t('round') || 'Ronda'} ${round}</div>` : `<div class="misbaha-round" id="misbaha-round"></div>`}
        <div class="misbaha-big-count" id="tasbih-count-val" aria-live="polite" aria-atomic="true">${this.count}</div>
        <div class="misbaha-target-line"><button class="misbaha-target-edit" type="button" title="${t('tasbihTargetTitle') || 'Target'}" aria-label="${t('tasbihTargetTitle') || 'Target'}" onclick="event.stopPropagation(); TasbihPage.pickTarget()"><i class="fas fa-pen"></i></button> / ${this.targetCount}</div>
        <div class="misbaha-stage" id="misbaha-stage">
          <svg class="misbaha-svg" id="misbaha-svg" aria-hidden="true"><path class="misbaha-string-path" id="misbaha-string" d=""/></svg>
          <div class="misbaha-beads" id="misbaha-beads"></div>
        </div>
        <button class="misbaha-custom-btn" type="button" id="misbaha-custom-btn"
                onclick="event.stopPropagation(); TasbihPage.openCustomize()">
          <span class="mcb-prev bead-skin shape-${this._beadShape()}" data-design="${this._beadDesign()}"></span>
          <span class="mcb-txt">
            <b>${this._i18nOr('beadCustomize', this._l('تخصيص المسبحة', 'Personalizar', 'Customize'))}</b>
            <span id="misbaha-design-name">${this._designLabel(this._beadDesign())} · ${this._shapeLabel(this._beadShape())}</span>
          </span>
          <i class="fas fa-chevron-${currentLocale === 'ar' ? 'left' : 'right'}"></i>
        </button>
      </div>
    `;
  },

  // هندسة المسبحة: أحجام نسبية لعرض الشاشة (مع سقف للشاشات العريضة)
  _layoutBeads() {
    const stage = document.getElementById('misbaha-stage');
    if (!stage) return;
    const W = stage.clientWidth;
    if (!W) { requestAnimationFrame(() => this._layoutBeads()); return; }
    const H = stage.clientHeight || 210;
    const S = Math.min(W, 520);
    const size = Math.round(S * 0.115);            // حجم الخرزة (أكبر من قبل)
    const spacing = size * 1.08;                   // مسافة بين المراكز → خرزات منفصلة تمامًا
    const gap = S * 0.30;                          // الفراغ في المنتصف (أوسع من قبل)
    const g = {
      W, H, S, size, spacing, gap, shape: this._beadShape(),
      cx: W / 2,
      cy: H / 2 - 0.028 * S,                       // توسيط المنحنى رأسيًا
      tilt: -0.115 * S,                            // ميل المسار: اليسار أخفض واليمين أعلى
      curve: 0.1123 * S,                           // انحناء خفيف
      unit: spacing * 1.7,                         // مسافة سحب الإصبع لعدّ تسبيحة واحدة
    };
    const prev = this._beadGeom;
    const resized = !prev || prev.size !== size || prev.W !== W || prev.H !== H || prev.shape !== this._beadShape();
    this._beadGeom = g;
    if (resized) {
      const host = document.getElementById('misbaha-beads');
      if (host) host.innerHTML = '';
      this._beadEls = new Map();
    }
    // خيط المسبحة على امتداد المسار (يظهر بوضوح في الفراغ الأوسط)
    const path = document.getElementById('misbaha-string');
    const svg = document.getElementById('misbaha-svg');
    if (path && svg) {
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);
      const pts = [];
      const steps = 28;
      for (let k = 0; k <= steps; k++) {
        const x = -10 + (W + 20) * k / steps;
        pts.push((k ? 'L' : 'M') + x.toFixed(1) + ' ' + this._beadY(x, g).toFixed(1));
      }
      path.setAttribute('d', pts.join(' '));
    }
    if (!this._drag) this._t = this.count;
    this._renderBeads();
  },

  // ارتفاع المسار عند الإحداثي الأفقي x
  _beadY(x, g) {
    const u = (x - g.cx) / g.S;
    return g.cy + g.tilt * u + g.curve * u * u;
  },

  // موضع مركز الخرزة أفقيًا؛ d = رقم الخرزة − t
  //  d ≥ 0  : خرزات متبقية على يمين الفراغ     d ≤ −1 : خرزات معدودة على يساره
  //  −1<d<0 : الخرزة العابرة للفراغ (تنتقل من اليمين إلى اليسار)
  _beadX(d, g) {
    // v1.0.80: محور معكوس — الخرزات تتبع الإصبع. السحب من اليسار إلى اليمين
    // يزيد العدّ فتنزلق الخرزات نحو اليمين (والمعدودة على اليمين)، والعكس
    // ينقص فتنزلق نحو اليسار. (قبل ذلك كانت تنزلق بعكس اتجاه الإصبع.)
    const L1 = g.cx - g.gap / 2 - g.size / 2;
    const R1 = g.cx + g.gap / 2 + g.size / 2;
    if (d >= 0) return L1 - d * g.spacing;             // غير المعدودة: على اليسار
    if (d <= -1) return R1 - (d + 1) * g.spacing;      // المعدودة: على اليمين
    return R1 - (d + 1) * (R1 - L1);                   // الخرزة العابرة: من اليسار إلى اليمين
  },

  _renderBeads() {
    const g = this._beadGeom;
    const host = document.getElementById('misbaha-beads');
    if (!g || !host) return;
    const map = this._beadEls || (this._beadEls = new Map());
    const t = this._t;
    const slots = Math.ceil((Math.max(g.cx, g.W - g.cx) - g.gap / 2) / g.spacing) + 3;
    const dims = this._beadDims(g);
    const shape = g.shape || this._beadShape();
    const design = this._beadDesign();
    const base = Math.floor(t);
    const lo = base - slots, hi = base + slots;
    for (const [i, el] of map) {
      if (i < lo || i > hi) { el.remove(); map.delete(i); }
    }
    for (let i = lo; i <= hi; i++) {
      const x = this._beadX(i - t, g);
      let el = map.get(i);
      if (x < -g.size || x > g.W + g.size) {
        if (el) { el.remove(); map.delete(i); }
        continue;
      }
      if (!el) {
        el = document.createElement('div');
        el.className = 'misbaha-bead bead-skin shape-' + shape;
        el.setAttribute('data-design', design);
        el.style.width = dims.w + 'px';
        el.style.height = dims.h + 'px';
        host.appendChild(el);
        map.set(i, el);
      }
      const y = this._beadY(x, g);
      // v131 (T3): لا نكتب نمطًا إذا لم يتغيّر الموضع — نصف عمليات DOM السابقة
      const tf = 'translate3d(' + (x - dims.w / 2).toFixed(1) + 'px,' + (y - dims.h / 2).toFixed(1) + 'px,0)';
      if (el._tf !== tf) { el.style.transform = tf; el._tf = tf; }
    }
  },

  _cancelAnim() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  },

  _animateTo(target, animate) {
    this._cancelAnim();
    const from = this._t;
    if (!animate || Math.abs(target - from) < 0.001 || Math.abs(target - from) > 1.5) {
      this._t = target;
      this._renderBeads();
      return;
    }
    const dur = 120 + 140 * Math.min(1, Math.abs(target - from));
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      this._t = from + (target - from) * e;
      this._renderBeads();
      this._raf = k < 1 ? requestAnimationFrame(step) : null;
    };
    this._raf = requestAnimationFrame(step);
  },

  // مزامنة موضع الخرزات مع العدّاد (تُستدعى من updateUI)
  _syncBeads(animate) {
    if (!this._beadGeom) return;
    if (this._drag) {
      this._t = this.count + this._drag.p;
      this._renderBeads();
      return;
    }
    this._animateTo(this.count, animate);
  },

  _bindBeads() {
    const area = document.getElementById('misbaha-wrap');
    if (!area) return;
    area.style.touchAction = 'pan-y';   // السحب الأفقي لنا، والتمرير الرأسي للصفحة

    area.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!this._beadGeom) return;
      this._cancelAnim();
      this._drag = { id: e.pointerId, x0: e.clientX, lastX: e.clientX, lastT: performance.now(), v: 0, p: 0 };
      this._t = this.count;
      try { area.setPointerCapture(e.pointerId); } catch (err) {}
      area.classList.add('dragging');
    });

    area.addEventListener('pointermove', (e) => {
      const d = this._drag, g = this._beadGeom;
      if (!d || !g || e.pointerId !== d.id) return;
      d.lastX = e.clientX; d.lastT = performance.now();

      // v1.0.78: «سحب حبة حبة» — خرزة واحدة كحدّ أقصى لكل إيماءة (لا عدّ
      // متسارع ولا خرزات تتوالى بسرعة): المسافة تُترجم إلى إزاحة واحدة فقط.
      let p = (e.clientX - d.x0) / g.unit;          // + = سحب نحو اليمين (يزيد)
      p = Math.max(-1, Math.min(1, p));
      if (this.count <= 0 && p < 0) p *= 0.22;      // مقاومة عند الصفر
      d.p = p;
      this._t = this.count + p;
      this._renderBeads();
    });

    const end = (e, cancelled) => {
      const d = this._drag;
      if (!d || e.pointerId !== d.id) return;
      this._drag = null;
      area.classList.remove('dragging');
      const p = d.p;
      // v1.0.78: عتبة واحدة واضحة (نصف مسافة الخرزة) — تُسحب خرزة واحدة
      // وتُعدّ واحدة، ثم ترتدّ المسبحة بسلاسة إلى موضعها.
      if (!cancelled && p >= 0.5) { this._t = this.count + 1; this.increment(); return; }
      if (!cancelled && p <= -0.5 && this.count > 0) { this._t = this.count - 1; this.decrement(); return; }
      this._animateTo(this.count, true);
    };
    area.addEventListener('pointerup', (e) => end(e, false));
    area.addEventListener('pointercancel', (e) => end(e, true));
  },

  // ============ v60: hoja de ajustes ============
  _sheetBodyHtml() {
    const s = this._settings();
    const goals = [33, 100, 500, 1000];
    const vibs = [
      ['off', t('vibOff') || 'Apagada'],
      ['light', t('vibLight') || 'Suave'],
      ['strong', t('vibStrong') || 'Fuerte'],
    ];
    const row = (label, on, handler, icon) => `
      <div class="tsheet-row">
        <span class="tsheet-row-label"><i class="fas ${icon}"></i> ${label}</span>
        <button class="tswitch ${on ? 'on' : ''}" onclick="${handler}" role="switch" aria-checked="${on}"><span class="tswitch-knob"></span></button>
      </div>`;
    return `
      <div class="tsheet-section">${t('dailyGoal') || 'Meta diaria'}</div>
      <div class="tsheet-chips">
        ${goals.map(g => `<button class="tsheet-chip ${s.dailyGoal === g ? 'active' : ''}" onclick="TasbihPage.setDailyGoal(${g})">${g}</button>`).join('')}
      </div>
      <div class="tsheet-section">${t('vibration') || 'Vibración'}</div>
      <div class="tsheet-chips">
        ${vibs.map(([k, l]) => `<button class="tsheet-chip ${s.vibration === k ? 'active' : ''}" onclick="TasbihPage.setVibration('${k}')">${l}</button>`).join('')}
      </div>
      <div class="tsheet-rows">
        ${row(t('tapSound') || 'Sonido del conteo', this.soundEnabled, 'TasbihPage.toggleSheetSound()', 'fa-volume-high')}
        ${row(t('autoResetCycle') || 'Reinicio automático al completar', s.autoResetCycle, 'TasbihPage.toggleAutoReset()', 'fa-rotate')}
        ${row(t('keepCounter') || 'Guardar contador al salir', s.keepCounter, 'TasbihPage.toggleKeepCounter()', 'fa-bookmark')}
      </div>
      <button class="tsheet-danger" onclick="TasbihPage.resetAll()">
        <i class="fas fa-trash-can"></i> ${t('deleteTasbihData') || 'Borrar todos los datos del tasbih'}
      </button>
    `;
  },

  openSettings() {
    const sh = document.getElementById('tasbih-sheet');
    if (sh) sh.classList.remove('hidden');
  },

  closeSettings() {
    const sh = document.getElementById('tasbih-sheet');
    if (sh) sh.classList.add('hidden');
  },

  _refreshWithSheet() {
    this.renderUI(document.getElementById('main-content'));
    this.openSettings();
  },

  setDailyGoal(g) {
    this._saveSettings({ dailyGoal: g });
    this._refreshWithSheet();
  },

  setVibration(v) {
    this._saveSettings({ vibration: v });
    if (navigator.vibrate && v !== 'off') navigator.vibrate(v === 'strong' ? 90 : 25);
    this._refreshWithSheet();
  },

  toggleSheetSound() {
    this.soundEnabled = !this.soundEnabled;
    this.saveState();
    this._refreshWithSheet();
  },

  toggleAutoReset() {
    this._saveSettings({ autoResetCycle: !this._settings().autoResetCycle });
    this._refreshWithSheet();
  },

  toggleKeepCounter() {
    this._saveSettings({ keepCounter: !this._settings().keepCounter });
    this._refreshWithSheet();
  },

  toggleMode() {
    this.mode = this.mode === 'beads' ? 'tap' : 'beads';
    this._saveSettings({ mode: this.mode });
    this.renderUI(document.getElementById('main-content'));
  },

  // ============ panel hoy / semana ============
  toggleStatsPanel() {
    const panel = document.getElementById('tasbih-stats-panel');
    if (!panel) return;
    const open = panel.classList.toggle('hidden') === false;
    const caret = document.getElementById('tasbih-daily-caret');
    if (caret) caret.style.transform = open ? 'rotate(180deg)' : '';
    const card = document.getElementById('tasbih-daily-card');
    if (card) card.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) this.setStatsTab('day');
  },

  setStatsTab(mode) {
    const dayBtn = document.getElementById('tasbih-tab-day');
    const weekBtn = document.getElementById('tasbih-tab-week');
    if (!dayBtn || !weekBtn) return;
    dayBtn.classList.toggle('active', mode === 'day');
    weekBtn.classList.toggle('active', mode === 'week');
    const val = document.getElementById('tasbih-panel-main');
    const lbl = document.getElementById('tasbih-panel-main-label');
    if (val) val.textContent = mode === 'day' ? this.todayCount() : this.weekCount();
    if (lbl) lbl.textContent = mode === 'day' ? (t('todayTasbih') || 'Hoy') : (t('weekTasbih') || 'Semana');
  },

  // swipe horizontal sobre el texto del dhikr para cambiar de dhikr
  _bindDhikrSwipe() {
    const el = document.getElementById('dhikr-display');
    if (!el || el._swipeBound) return;
    el._swipeBound = true;
    let x0 = null;
    el.style.touchAction = 'pan-y';
    el.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    el.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) < 40) return;
      const dir = (currentLocale === 'ar' ? -1 : 1) * (dx < 0 ? 1 : -1);
      this.changeDhikr(dir);
    });
  },

  _scrollActiveChip() {
    const strip = document.getElementById('dhikr-strip');
    if (!strip) return;
    const active = strip.querySelector('.dhikr-chip.active');
    if (active && active.scrollIntoView) {
      try { active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); } catch (e) {}
    }
  },

  _vibrate(pattern) {
    const v = this._settings().vibration;
    if (v === 'off' || !navigator.vibrate) return;
    if (Array.isArray(pattern)) { navigator.vibrate(pattern); return; }
    navigator.vibrate(v === 'strong' ? Math.round(pattern * 3) : pattern);
  },

  increment() {
    this.count++;
    this.totalCount++;
    this.recordDailyCount(1);

    this._vibrate(this.count === this.targetCount ? [80, 40, 80, 40, 160] : 20);
    if (this.soundEnabled) this.playTick();

    if (this.totalCount > 0 && this.totalCount % 100 === 0) {
      Gamification.addXP(Gamification.XP_PER_TASBIH_100);
      showToast(`+${Gamification.XP_PER_TASBIH_100} XP (${this.totalCount} dhikrs)`, 2000);
    }

    if (this.count === this.targetCount) {
      this._vibrate([120, 60, 120, 60, 240]);
      setTimeout(() => {
        if (this._settings().autoResetCycle) {
          // v60: تصفير تلقائي للدورة — نفس الذكر يبدأ من جديد
          showToast(`${this.DHIKRS[this.currentDhikr].tr} ✓`, 2000);
          this.count = 0;
          this.saveState();
          this.updateUI();
        } else if (this.currentDhikr < this.DHIKRS.length - 1) {
          showToast(`${this.DHIKRS[this.currentDhikr].tr} ${t('completed') || 'completo'}`, 2000);
          this.changeDhikr(1, true);
        } else {
          showToast(`${t('allDhikrsDone') || '¡Todos los dhikrs completos!'}`, 3000);
        }
      }, 600);
    }

    Gamification.recordTasbihCount(1);
    this.saveState();
    this.updateUI();
  },

  // v60: devolver una cuenta (misbaha) resta 1 al contador
  decrement() {
    if (this.count <= 0) return;
    this.count--;
    this.totalCount = Math.max(0, this.totalCount - 1);
    this._vibrate(10);
    this.saveState();
    this.updateUI();
  },

  updateUI() {
    const countEl = document.getElementById('tasbih-count-val');
    if (!countEl) return;
    countEl.textContent = this.count;

    const sessionEl = document.getElementById('tasbih-session');
    if (sessionEl) sessionEl.textContent = this.totalCount;

    const todayEl = document.getElementById('tasbih-today-val');
    if (todayEl) todayEl.textContent = this.todayCount();
    const weekEl = document.getElementById('tasbih-week-val');
    if (weekEl) weekEl.textContent = this.weekCount();
    const goalEl = document.getElementById('tasbih-goal-today');
    if (goalEl) goalEl.textContent = this.todayCount();
    const panel = document.getElementById('tasbih-stats-panel');
    const panelVal = document.getElementById('tasbih-panel-main');
    if (panel && panelVal && !panel.classList.contains('hidden')) {
      const weekActive = document.getElementById('tasbih-tab-week')?.classList.contains('active');
      panelVal.textContent = weekActive ? this.weekCount() : this.todayCount();
    }

    const ring = document.querySelector('.tasbih-ring circle:last-of-type');
    if (ring) {
      const progress = Math.min(this.count / this.targetCount, 1);
      const circ = 2 * Math.PI * 98;
      ring.setAttribute('stroke-dashoffset', circ * (1 - progress));
    }

    const counter = document.getElementById('tasbih-counter');
    if (counter) counter.classList.toggle('complete', this.count >= this.targetCount);

    // v60: misbaha — reordenar cuentas y actualizar la ronda
    if (this.mode === 'beads') {
      const n = Math.min(this.targetCount, 33);
      const roundEl = document.getElementById('misbaha-round');
      if (roundEl) {
        roundEl.textContent = this.targetCount > n
          ? `${t('round') || 'Ronda'} ${Math.floor(this.count / n) + 1}`
          : '';
      }
      const wrap = document.querySelector('.misbaha-wrap');
      if (wrap) wrap.classList.toggle('complete', this.count >= this.targetCount);
      this._syncBeads(true);
    }
  },

  playTick() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
      setTimeout(() => ctx.close && ctx.close(), 150);
    } catch (e) {}
  },

  changeDhikr(delta, autoReset = false) {
    const newIdx = this.currentDhikr + delta;
    if (newIdx < 0 || newIdx >= this.DHIKRS.length) return;
    this.currentDhikr = newIdx;
    if (autoReset) this.count = 0;
    this.targetCount = this._targetFor(this.currentDhikr);
    this.saveState();
    this.renderUI(document.getElementById('main-content'));
  },

  selectDhikr(idx) {
    if (idx === this.currentDhikr) return;
    this.currentDhikr = idx;
    this.count = 0;
    this.targetCount = this._targetFor(idx);
    this.saveState();
    this.renderUI(document.getElementById('main-content'));
  },

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.saveState();
    showToast(this.soundEnabled ? ''+ (t('soundOn') || 'Sonido activado') : ''+ (t('soundOff') || 'Sonido desactivado'), 1500);
    this.renderUI(document.getElementById('main-content'));
  },

  // v1.0.80: نافذة تأكيد بنمط التطبيق (بدل confirm النظام) — أيقونة الخرزات،
  // وشرح واضح لما يحدث وما لا يحدث، وزرّان «تأكيد»/«تراجع».
  _confirmReset(opts) {
    const o = Object.assign({ confirmLabel: 'OK', cancelLabel: '', danger: false }, opts || {});
    const el = this._modal(`
      <div class="qs-card qs-dialog ${o.danger ? 'is-danger' : ''}" role="dialog" aria-modal="true" aria-labelledby="qs-dtitle">
        <div class="qs-ic"><i class="fas ${o.icon || 'fa-circle-question'}"></i></div>
        <div class="qs-dtitle" id="qs-dtitle">${o.title || ''}</div>
        <div class="qs-dmsg">${o.message || ''}</div>
        ${o.note ? `<div class="qs-note"><i class="fas fa-circle-info"></i><span>${o.note}</span></div>` : ''}
        <div class="qs-actions">
          <button class="qs-btn qs-cancel" type="button" data-close>${o.cancelLabel || this._l('تراجع', 'Cancelar', 'Cancel')}</button>
          <button class="qs-btn qs-ok" type="button">${o.confirmLabel}</button>
        </div>
      </div>`, { center: true });
    el.querySelector('.qs-ok').addEventListener('click', (ev) => {
      ev.stopPropagation();
      el._close(() => { try { if (typeof o.onConfirm === 'function') o.onConfirm(); } catch (e) {} });
    });
  },

  reset() {
    this._confirmReset({
      title: t('resetCounter') || 'Reiniciar',
      icon: 'fa-rotate-left',
      message: t('resetConfirmMsg') || '¿Reiniciar el contador del dhikr actual?',
      note: this._i18nOr('beadResetNote', this._l(
        'العدّاد يعود إلى 0 — مجموع الجلسة (' + this.totalCount + ') والسجل اليومي (' + this.todayCount() + ') لا يُحذفان.',
        'El contador vuelve a 0 — el total de la sesión (' + this.totalCount + ') y el registro diario (' + this.todayCount() + ') no se borran.',
        'The counter returns to 0 — the session total (' + this.totalCount + ') and the daily log (' + this.todayCount() + ') are kept.')),
      confirmLabel: t('resetConfirmBtn') || 'Reiniciar',
      cancelLabel: t('cancelAction') || 'Cancelar',
      onConfirm: () => {
        this.count = 0;
        this.saveState();
        this.renderUI(document.getElementById('main-content'));
      },
    });
  },

  resetAll() {
    this._confirmReset({
      title: t('resetAll') || t('clearAll') || 'Borrar todo',
      icon: 'fa-trash-can',
      danger: true,
      message: t('resetAllConfirmMsg') || '¿Borrar el contador y el total de la sesión?',
      note: t('resetAllConfirmNote') || 'También se borra el registro diario del tasbih. Esta acción no se puede deshacer.',
      confirmLabel: t('resetConfirmBtn') || 'Borrar',
      cancelLabel: t('cancelAction') || 'Cancelar',
      onConfirm: () => {
        this.count = 0;
        this.totalCount = 0;
        Storage.set('tasbih_log', {});
        this.saveState();
        this.renderUI(document.getElementById('main-content'));
      },
    });
  },

  saveState() {
    Storage.set('tasbih', {
      count: this.count,
      totalCount: this.totalCount,
      currentDhikr: this.currentDhikr,
      soundEnabled: this.soundEnabled,
    });
  },

  cleanup() {
    this._cancelAnim();
    this._drag = null;
    // v131: إزالة أي أثر يبقى بعد مغادرة الصفحة
    try { this.flushDaily(); } catch (e) {}
    try { this.closeDesignPicker(); } catch (e) {}
    if (this._onResize) { window.removeEventListener('resize', this._onResize); this._onResize = null; }
    if (this._logTimer) { clearTimeout(this._logTimer); this._logTimer = null; }
    this._sheetEl = null;
    // v60: «حفظ العدّاد عند الخروج» — si está desactivado, el contador de la
    // ronda actual se pierde al salir de la página (el histórico se conserva).
    if (!this._settings().keepCounter && this.count > 0) {
      this.count = 0;
      try { this.saveState(); } catch (e) {}
    }
  },
};
