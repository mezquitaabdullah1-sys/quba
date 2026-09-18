// 📿 Tasbih digital con feedback háptico - self-contained, multilenguaje
// v50: diseño de UNA sola pantalla (sin scroll en móvil), strip deslizable
// de adhkar en chips compactos y mini tarjeta de estadísticas hoy/semana.
const TasbihPage = {
  count: 0,
  totalCount: 0,
  targetCount: 33,
  currentDhikr: 0,
  soundEnabled: true,

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

  // ============ v50: registro diario para estadísticas hoy / semana ============
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
    // conservar solo los últimos 45 días
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
    this.renderUI(container);
  },

  renderUI(container) {
    const dhikr = this.DHIKRS[this.currentDhikr];
    const progress = Math.min(this.count / this.targetCount, 1);
    const isComplete = this.count >= this.targetCount;
    const lang = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    const today = this.todayCount();
    const week = this.weekCount();
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
        <button class="top-bar-btn" onclick="TasbihPage.toggleSound()" title="${t('sound') || 'Sound'}">
          <i class="fas fa-${this.soundEnabled ? 'volume-up' : 'volume-mute'}"></i>
        </button>
      </div>

      <div class="tasbih-container">
        <!-- v50: شريط صغير قابل للسحب للتنقل بين أذكار المسبحة (chips) -->
        <div class="dhikr-strip" id="dhikr-strip">
          ${this.DHIKRS.map((d, idx) => `
            <button class="dhikr-chip ${idx === this.currentDhikr ? 'active' : ''}" data-dhikr-idx="${idx}" onclick="TasbihPage.selectDhikr(${idx})">
              <span class="dhikr-chip-ar">${d.ar}</span>
              <span class="dhikr-chip-target">×${d.target}</span>
            </button>
          `).join('')}
        </div>

        <!-- Dhikr text display (compacto, con swipe izquierda/derecha) -->
        <div class="dhikr-display" id="dhikr-display">
          <div class="dhikr-arabic">${dhikr.ar}</div>
          <div class="dhikr-trans">${dhikr.tr}</div>
          <div class="dhikr-es">${dhikr[lang] || dhikr.es}</div>
        </div>

        <!-- Counter circle (220px — cabe en una pantalla sin scroll) -->
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

        <!-- v50: بطاقة صغيرة — إحصائيات اليوم والأسبوع (تُفتح بالضغط) -->
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

        <!-- Action buttons (compactos) -->
        <div class="tasbih-buttons">
          <button class="btn-ghost tasbih-btn-secondary" onclick="TasbihPage.reset()">
            <i class="fas fa-redo"></i> ${t('resetCounter') || 'Reiniciar'}
          </button>
          <button class="btn-ghost tasbih-btn-secondary" onclick="TasbihPage.resetAll()">
            <i class="fas fa-trash"></i> ${t('clearAll') || 'Limpiar todo'}
          </button>
        </div>
      </div>
    `;
    this._bindDhikrSwipe();
    this._scrollActiveChip();
  },

  // ============ v50: panel hoy / semana ============
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

  // v50: swipe horizontal sobre el texto del dhikr para cambiar de dhikr
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

  // v50: centrar el chip activo dentro del strip
  _scrollActiveChip() {
    const strip = document.getElementById('dhikr-strip');
    if (!strip) return;
    const active = strip.querySelector('.dhikr-chip.active');
    if (active && active.scrollIntoView) {
      try { active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); } catch (e) {}
    }
  },

  increment() {
    this.count++;
    this.totalCount++;
    this.recordDailyCount(1); // v50: estadísticas hoy / semana

    if (navigator.vibrate) {
      navigator.vibrate(this.count === this.targetCount ? [50, 30, 50, 30, 100] : 20);
    }
    if (this.soundEnabled) this.playTick();

    if (this.totalCount > 0 && this.totalCount % 100 === 0) {
      Gamification.addXP(Gamification.XP_PER_TASBIH_100);
      showToast(`+${Gamification.XP_PER_TASBIH_100} XP (${this.totalCount} dhikrs)`, 2000);
    }

    if (this.count === this.targetCount) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
      setTimeout(() => {
        if (this.currentDhikr < this.DHIKRS.length - 1) {
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

  updateUI() {
    const countEl = document.getElementById('tasbih-count-val');
    if (!countEl) return;
    countEl.textContent = this.count;

    const sessionEl = document.getElementById('tasbih-session');
    if (sessionEl) sessionEl.textContent = this.totalCount;

    // v50: actualizar la mini tarjeta hoy / semana en cada toque
    const todayEl = document.getElementById('tasbih-today-val');
    if (todayEl) todayEl.textContent = this.todayCount();
    const weekEl = document.getElementById('tasbih-week-val');
    if (weekEl) weekEl.textContent = this.weekCount();
    const panel = document.getElementById('tasbih-stats-panel');
    const panelVal = document.getElementById('tasbih-panel-main');
    if (panel && panelVal && !panel.classList.contains('hidden')) {
      const weekActive = document.getElementById('tasbih-tab-week')?.classList.contains('active');
      panelVal.textContent = weekActive ? this.weekCount() : this.todayCount();
    }

    const ring = document.querySelector('.tasbih-ring circle:last-of-type');
    if (ring) {
      const progress = Math.min(this.count / this.targetCount, 1);
      const circ = 2 * Math.PI * 98; // v50: radio del nuevo anillo de 220px
      ring.setAttribute('stroke-dashoffset', circ * (1 - progress));
    }

    const counter = document.getElementById('tasbih-counter');
    if (this.count >= this.targetCount && counter) {
      counter.classList.add('complete');
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
      // v52: «تنظيف الكل» يمسح أيضاً إحصائيات اليوم والأسبوع (سجل tasbih_log)
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

  cleanup() {},
};
