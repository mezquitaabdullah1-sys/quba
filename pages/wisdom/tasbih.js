// 📿 Tasbih digital — v60
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
  _defaults: { dailyGoal: 100, vibration: 'light', autoResetCycle: false, keepCounter: true, mode: 'tap' },

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

  recordDailyCount(n) {
    const log = this.getLog();
    const k = this._dayKey();
    log[k] = (log[k] || 0) + n;
    const keys = Object.keys(log).sort();
    while (keys.length > 45) { delete log[keys.shift()]; }
    Storage.set('tasbih_log', log);
  },

  todayCount() {
    return this.getLog()[this._dayKey()] || 0;
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
    this.targetCount = this.DHIKRS[this.currentDhikr].target;
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
              <span class="dhikr-chip-target">×${d.target}</span>
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
              <div class="tasbih-count" id="tasbih-count-val">${this.count}</div>
              <div class="tasbih-target">/ ${this.targetCount}</div>
              <div class="tasbih-hint">${isComplete ? '<i class="fas fa-circle-check"></i> ' + (t('completed') || '¡Completo!') : '<i class="fas fa-hand-point-up"></i> ' + (t('tapToCount') || 'Toca para contar')}</div>
            </div>
          </div>
        `}

        ${this.mode === 'beads' ? `<div class="tasbih-hint-line"><i class="fas fa-hand-pointer"></i> ${t('dragBeadsHint') || 'Arrastra una cuenta hacia el borde para contar'}</div>` : ''}

        <!-- Botones de acción -->
        <div class="tasbih-buttons">
          <button class="btn-ghost tasbih-btn-secondary" onclick="TasbihPage.toggleMode()">
            <i class="fas fa-${this.mode === 'beads' ? 'hand-pointer' : 'circle-nodes'}"></i>
            ${this.mode === 'beads' ? (t('tapMode') || 'Modo táctil') : (t('beadsMode') || 'Modo misbaha')}
          </button>
          <button class="btn-ghost tasbih-btn-secondary" onclick="TasbihPage.reset()">
            <i class="fas fa-redo"></i> ${t('resetCounter') || 'Reiniciar'}
          </button>
          <!-- v62: زر «مسح الكل» أُزيل من هنا — موجود أصلًا في لوحة الإعدادات -->
        </div>

        <!-- Mini tarjeta de estadísticas hoy / semana -->
        <div class="tasbih-daily-card" id="tasbih-daily-card" onclick="TasbihPage.toggleStatsPanel()" role="button" tabindex="0" aria-expanded="false">
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
    if (this.mode === 'beads') {
      this._bindBeads();
      requestAnimationFrame(() => this._layoutBeads());
      if (!this._resizeBound) {
        this._resizeBound = true;
        window.addEventListener('resize', () => { if (this.mode === 'beads') this._layoutBeads(); });
      }
    }
  },

  // ============ v60: MISBAHA REAL (cuentas arrastrables) ============
  _beadsHtml() {
    const n = Math.min(this.targetCount, 33); // la misbaha física muestra hasta 33 cuentas
    const round = Math.floor(this.count / n) + 1;
    return `
      <div class="misbaha-wrap ${this.count >= this.targetCount ? 'complete' : ''}">
        ${this.targetCount > n ? `<div class="misbaha-round" id="misbaha-round">${t('round') || 'Ronda'} ${round}</div>` : `<div class="misbaha-round" id="misbaha-round"></div>`}
        <div class="misbaha-big-count" id="tasbih-count-val">${this.count}</div>
        <div class="misbaha-target-line"><i class="fas fa-pen"></i> / ${this.targetCount}</div>
        <div class="misbaha-stage" id="misbaha-stage">
          <div class="misbaha-string"></div>
          ${Array.from({ length: n }, (_, i) => `<div class="misbaha-bead misbaha-bead-${i % 6}" data-bead="${i}"></div>`).join('')}
        </div>
      </div>
    `;
  },

  _layoutBeads() {
    const stage = document.getElementById('misbaha-stage');
    if (!stage) return;
    const W = stage.clientWidth;
    if (!W) { requestAnimationFrame(() => this._layoutBeads()); return; }
    const H = stage.clientHeight || 132;
    const n = Math.min(this.targetCount, 33);
    // v62: فراغ ثابت في منتصف السبحة — الكرات المعدودة تتراكم في الطرف
    // الأيسر والمتبقية في الطرف الأيمن، والعدّ بسحب كرة من اليمين إلى اليسار.
    // v64: خرزات أكبر + فراغ ثابت تمامًا في منتصف السبحة (بعرض خرزة واحدة
    // دائمًا) — الكرات المعدودة تتكدس بجوار الفراغ من يساره والمتبقية من يمينه.
    const size = Math.max(24, Math.min(46, Math.floor(W / (n + 4))));
    const gapW = size; // الفراغ ثابت في المنتصف: عرض خرزة واحدة بالضبط
    const beadSpan = (W - gapW) / n; // عرض خانة الخرزة الواحدة على الطرفين
    const pullDir = -1; // v62: السحب دائمًا من الطرف الأيمن إلى الطرف الأيسر
    let c = this.count % n;
    if (this.count > 0 && c === 0 && this.count >= this.targetCount) c = n; // ciclo justo completado
    this._beadGeom = { size, spacing: beadSpan, startX: 0, pullDir, n, c };
    stage.querySelectorAll('.misbaha-bead').forEach(b => {
      const i = +b.dataset.bead;
      let x;
      const gapL = (W - gapW) / 2, gapR = (W + gapW) / 2; // حافتا الفراغ الثابت في المنتصف
      if (i < c) {
        // كرات معدودة — تتكدس بجوار الفراغ من يساره (الأحدث أقرب للفراغ)
        x = Math.max(beadSpan / 2, gapL - (c - 1 - i) * beadSpan - beadSpan / 2);
      } else {
        // كرات متبقية — بجوار الفراغ من يمينه، والكرة التالية (i === c) الأقرب له
        const j = i - c;
        x = Math.min(W - beadSpan / 2, gapR + j * beadSpan + beadSpan / 2);
      }
      b.style.width = b.style.height = size + 'px';
      b.style.left = (x - size / 2) + 'px';
      b.style.top = ((H - size) / 2) + 'px';
      b.classList.toggle('pulled', i < c);
      b.classList.toggle('front', i === c && this.count < this.targetCount);
    });
  },

  _bindBeads() {
    const stage = document.getElementById('misbaha-stage');
    if (!stage) return;
    stage.style.touchAction = 'none';

    stage.addEventListener('pointerdown', (e) => {
      const bead = e.target.closest('.misbaha-bead');
      if (!bead || !this._beadGeom) return;
      const i = +bead.dataset.bead;
      const c = this._beadGeom.c;
      // v62: العدّ بالسحب فقط — الكرة الأمامية (الأقرب للفراغ من جهة اليمين)
      // تُسحب يسارًا لتحسب تسبيحة، وآخر كرة محسوبة تُسحب يمينًا لإنقاص العدد.
      if (i !== c && i !== c - 1) return;
      this._drag = { i, bead, x0: e.clientX, base: parseFloat(bead.style.left) || 0, pulled: i < c };
      bead.classList.add('dragging');
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });

    stage.addEventListener('pointermove', (e) => {
      const d = this._drag, g = this._beadGeom;
      if (!d || !g) return;
      const towardPull = (e.clientX - d.x0) * g.pullDir;
      const max = g.spacing * 2.4;
      const offset = d.pulled
        ? Math.max(-max, Math.min(0, towardPull))   // devolver: solo hacia atrás
        : Math.max(0, Math.min(max, towardPull));   // contar: solo hacia el borde
      d.bead.style.left = (d.base + offset * g.pullDir) + 'px';
    });

    const finish = (e) => {
      const d = this._drag, g = this._beadGeom;
      if (d && g) {
        const towardPull = (e.clientX - d.x0) * g.pullDir;
        d.bead.classList.remove('dragging');
        const th = g.spacing * 0.8;
        this._drag = null;
        if (!d.pulled && towardPull > th) { this.increment(); return; }  // سحب يسارًا = تسبيحة
        if (d.pulled && towardPull < -th) { this.decrement(); return; }  // إرجاع يمينًا = إنقاص
        this._layoutBeads(); // volver a su sitio
      }
    };
    stage.addEventListener('pointerup', finish);
    stage.addEventListener('pointercancel', () => {
      if (this._drag) { this._drag.bead.classList.remove('dragging'); this._drag = null; this._layoutBeads(); }
    });
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
      this._layoutBeads();
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
    this.targetCount = this.DHIKRS[this.currentDhikr].target;
    this.saveState();
    this.renderUI(document.getElementById('main-content'));
  },

  selectDhikr(idx) {
    if (idx === this.currentDhikr) return;
    this.currentDhikr = idx;
    this.count = 0;
    this.targetCount = this.DHIKRS[idx].target;
    this.saveState();
    this.renderUI(document.getElementById('main-content'));
  },

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.saveState();
    showToast(this.soundEnabled ? ''+ (t('soundOn') || 'Sonido activado') : ''+ (t('soundOff') || 'Sonido desactivado'), 1500);
    this.renderUI(document.getElementById('main-content'));
  },

  reset() {
    if (confirm(t('confirmReset') || '¿Reiniciar el contador actual?')) {
      this.count = 0;
      this.saveState();
      this.renderUI(document.getElementById('main-content'));
    }
  },

  resetAll() {
    if (confirm(t('confirmResetAll') || '¿Limpiar contador y total de sesión? (El histórico se conserva)')) {
      this.count = 0;
      this.totalCount = 0;
      Storage.set('tasbih_log', {});
      this.saveState();
      this.renderUI(document.getElementById('main-content'));
    }
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
    // v60: «حفظ العدّاد عند الخروج» — si está desactivado, el contador de la
    // ronda actual se pierde al salir de la página (el histórico se conserva).
    if (!this._settings().keepCounter && this.count > 0) {
      this.count = 0;
      try { this.saveState(); } catch (e) {}
    }
  },
};
