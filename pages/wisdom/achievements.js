// 🏅 الأوسمة والمستويات — Quba v1.0.152
// شاشة واحدة تجمع: رتبتك الحالية، سلم المستويات العشرة، ومعرض الأوسمة الواحد والعشرين
// (المفتوحة والمقفلة مع شريط تقدّم لكل وسام). كانت الأوسمة تُعرض كصفّ من ٦ بطاقات
// فقط داخل صفحة الدورات، والمقفلة لا تظهر أبدًا، فبدا النظام كأنه لا يعمل.

const AchievementsPage = {
  _tab: 'badges',

  _L(ar, es, en) {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    return l === 'ar' ? ar : (l === 'en' ? en : es);
  },

  _name(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    return obj[l] || obj.es || obj.en || obj.ar || '';
  },

  render(container) {
    const stats = Gamification.getStats();
    const info = Gamification.getLevelInfo(stats.xp);
    const state = Gamification.getState();
    const unlocked = stats.achievements.length;

    container.innerHTML = `
      <div class="ach-screen" dir="${document.documentElement.dir || 'ltr'}">
        <div class="ach-topbar">
          <button class="ach-back" onclick="Router.go('wisdom')" aria-label="${this._L('رجوع', 'Volver', 'Back')}">
            <i class="fas fa-arrow-${document.documentElement.dir === 'rtl' ? 'right' : 'left'}"></i>
          </button>
          <div class="ach-topbar-title">${this._L('الأوسمة والمستويات', 'Medallas y niveles', 'Badges & levels')}</div>
          <div class="ach-topbar-count">${unlocked}/${Gamification.TOTAL_BADGES}</div>
        </div>

        <div class="ach-hero">
          <div class="ach-hero-glow"></div>
          <div class="ach-ring" style="--pct:${Math.round(info.progress * 100)}; --ring:${info.color}">
            <div class="ach-ring-inner">
              <div class="ach-ring-icon">${info.icon}</div>
              <div class="ach-ring-level">${stats.level}</div>
            </div>
          </div>
          <div class="ach-hero-name">${this._name(info.name)}</div>
          <div class="ach-hero-xp">${stats.xp.toLocaleString()} XP</div>
          <div class="ach-hero-bar"><span style="width:${Math.round(info.progress * 100)}%"></span></div>
          <div class="ach-hero-next">
            ${info.next
              ? this._L(
                  `باقي ${info.xpRemaining} نقطة إلى «${this._name(info.next.name)}»`,
                  `Faltan ${info.xpRemaining} XP para «${this._name(info.next.name)}»`,
                  `${info.xpRemaining} XP to “${this._name(info.next.name)}”`)
              : this._L('وصلت أعلى مستوى 🌙', 'Nivel máximo alcanzado 🌙', 'Top level reached 🌙')}
          </div>
          <div class="ach-hero-chips">
            <div class="ach-chip"><i class="fas fa-fire"></i><b>${stats.streak}</b><span>${this._L('يوم متتالٍ', 'racha', 'streak')}</span></div>
            <div class="ach-chip"><i class="fas fa-medal"></i><b>${unlocked}</b><span>${this._L('وسام', 'medallas', 'badges')}</span></div>
            <div class="ach-chip"><i class="fas fa-bolt"></i><b>+${stats.todayXp || 0}</b><span>${this._L('اليوم', 'hoy', 'today')}</span></div>
          </div>
        </div>

        <div class="ach-tabs" role="tablist">
          <button class="ach-tab ${this._tab === 'badges' ? 'active' : ''}" onclick="AchievementsPage.switchTab('badges')">
            <i class="fas fa-medal"></i> ${this._L('الأوسمة', 'Medallas', 'Badges')}
          </button>
          <button class="ach-tab ${this._tab === 'levels' ? 'active' : ''}" onclick="AchievementsPage.switchTab('levels')">
            <i class="fas fa-layer-group"></i> ${this._L('المستويات', 'Niveles', 'Levels')}
          </button>
        </div>

        <div id="ach-panel">${this._tab === 'badges' ? this._badges(state) : this._levels(state)}</div>
      </div>
    `;
  },

  switchTab(tab) {
    this._tab = tab;
    const panel = document.getElementById('ach-panel');
    const state = Gamification.getState();
    if (panel) panel.innerHTML = tab === 'badges' ? this._badges(state) : this._levels(state);
    document.querySelectorAll('.ach-tab').forEach((b, i) => {
      b.classList.toggle('active', (i === 0 && tab === 'badges') || (i === 1 && tab === 'levels'));
    });
  },

  _badges(state) {
    const list = Gamification.ACHIEVEMENTS.map(a => {
      const p = Gamification.getAchievementProgress(a.id);
      return `
        <div class="ach-card ${p.unlocked ? 'is-on' : 'is-off'}">
          <div class="ach-medal">
            <div class="ach-medal-ring"></div>
            <div class="ach-medal-ic">${p.unlocked ? a.icon : '<i class="fas fa-lock"></i>'}</div>
          </div>
          <div class="ach-card-body">
            <div class="ach-card-name">${this._name(a.name)}</div>
            <div class="ach-card-desc">${this._name(a.desc)}</div>
            <div class="ach-mini-bar"><span style="width:${p.pct}%"></span></div>
            <div class="ach-card-progress ${p.unlocked ? 'done' : ''}">
              ${p.unlocked
                ? `<i class="fas fa-circle-check"></i> ${this._L('مفتوح', 'Conseguido', 'Earned')}`
                : `${p.have} / ${p.need}`}
            </div>
          </div>
        </div>`;
    }).join('');

    const done = state.achievements.length;
    return `
      <div class="ach-panel-head">
        <div class="ach-panel-title">${this._L('معرض الأوسمة', 'Galería de medallas', 'Badge gallery')}</div>
        <div class="ach-panel-sub">${done} / ${Gamification.TOTAL_BADGES} ${this._L('مفتوح', 'conseguidas', 'earned')}</div>
      </div>
      <div class="ach-grid">${list}</div>
      <div class="ach-note">
        <i class="fas fa-circle-info"></i>
        ${this._L(
          'كل وسام يُفتح تلقائيًا عند بلوغ شرطه، وتظهر لك بطاقة تهنئة فور فتحه.',
          'Cada medalla se abre sola al cumplir su condición, con una tarjeta de felicitación al instante.',
          'Each badge unlocks automatically and shows a congratulation card right away.')}
      </div>`;
  },

  _levels(state) {
    const levels = Gamification.getLevelsWithState();
    const current = Gamification.getLevelInfo(state.xp).level;
    const rows = levels.map(l => `
      <div class="ach-lvl ${l.unlocked ? 'is-on' : 'is-off'} ${l.isCurrent ? 'is-now' : ''}">
        <div class="ach-lvl-mark" style="--c:${l.color}">
          ${l.unlocked ? l.icon : '<i class="fas fa-lock"></i>'}
        </div>
        <div class="ach-lvl-body">
          <div class="ach-lvl-top">
            <span class="ach-lvl-name">${this._name(l.name)}</span>
            <span class="ach-lvl-xp">${l.xp.toLocaleString()} XP</span>
          </div>
          <div class="ach-lvl-sub">
            ${l.isCurrent
              ? this._L('مستواك الحالي', 'Tu nivel actual', 'Your current level')
              : (l.unlocked
                ? this._L('مفتوح', 'Superado', 'Passed')
                : this._L(`باقي ${l.xpMissing} نقطة`, `Faltan ${l.xpMissing} XP`, `${l.xpMissing} XP left`))}
          </div>
        </div>
        <div class="ach-lvl-num">${l.level}</div>
      </div>`).join('');

    const nextInfo = Gamification.getLevelInfo(state.xp);
    return `
      <div class="ach-panel-head">
        <div class="ach-panel-title">${this._L('سلم المستويات', 'Escalera de niveles', 'Level ladder')}</div>
        <div class="ach-panel-sub">${this._L('المستوى', 'Nivel', 'Level')} ${current} / 10</div>
      </div>
      <div class="ach-ladder">${rows}</div>
      <div class="ach-note">
        <i class="fas fa-circle-info"></i>
        ${nextInfo.next
          ? this._L(
              `تحتاج ${nextInfo.xpRemaining} نقطة للوصول إلى «${this._name(nextInfo.next.name)}».`,
              `Necesitas ${nextInfo.xpRemaining} XP para llegar a «${this._name(nextInfo.next.name)}».`,
              `You need ${nextInfo.xpRemaining} XP to reach “${this._name(nextInfo.next.name)}”.`)
          : this._L('بلغت القمة — بارك الله فيك.', 'Has llegado a la cima — que Allah te bendiga.', 'You reached the top — may Allah bless you.')}
      </div>`;
  },

  cleanup() {},
};

// ============ احتفال المستوى الجديد ============
// v1.0.152: كان الانتقال بين المستويات يُعلَن برسالة نصّية قصيرة. الآن بطاقة
// احتفال كاملة: التاج، اسم المستوى، النقاط، وما ينتظرك في المستوى التالي.
function LevelUpShow(newLevel, oldLevel) {
  const lvl = Gamification.LEVELS[newLevel - 1];
  if (!lvl) return;
  const info = Gamification.getLevelInfo(Gamification.getState().xp);
  const L3 = (ar, es, en) => AchievementsPage._L(ar, es, en);
  const name = AchievementsPage._name(lvl.name);
  const nextName = info.next ? AchievementsPage._name(info.next.name) : '';

  let host = document.getElementById('levelup-modal');
  if (!host) {
    host = document.createElement('div');
    host.id = 'levelup-modal';
    host.className = 'lv-modal';
    document.body.appendChild(host);
  }
  const dots = Array.from({ length: 14 }).map((_, i) =>
    `<span class="lv-dot" style="--i:${i}; --x:${(Math.random() * 2 - 1).toFixed(2)}; --d:${(0.9 + Math.random() * 1.1).toFixed(2)}s"></span>`).join('');
  host.innerHTML = `
    <div class="lv-backdrop" onclick="document.getElementById('levelup-modal').classList.remove('open')"></div>
    <div class="lv-card" dir="${document.documentElement.dir || 'ltr'}">
      <div class="lv-confetti">${dots}</div>
      <div class="lv-eyebrow">${L3('مستوى جديد', 'Nuevo nivel', 'New level')}</div>
      <div class="lv-seal" style="--c:${lvl.color}">
        <div class="lv-seal-ring"></div>
        <div class="lv-seal-ic">${lvl.icon}</div>
        <div class="lv-seal-num">${newLevel}</div>
      </div>
      <div class="lv-title">${name}</div>
      <div class="lv-sub">${L3(
        `ارتفعت من المستوى ${oldLevel} إلى ${newLevel}`,
        `Subiste del nivel ${oldLevel} al ${newLevel}`,
        `You rose from level ${oldLevel} to ${newLevel}`)}</div>
      <div class="lv-xp"><i class="fas fa-bolt"></i> ${Gamification.getState().xp.toLocaleString()} XP</div>
      ${info.next ? `<div class="lv-next">${L3('التالي', 'Siguiente', 'Next')}: <b>${nextName}</b> · ${L3(`باقي ${info.xpRemaining} نقطة`, `faltan ${info.xpRemaining} XP`, `${info.xpRemaining} XP left`)}</div>` : ''}
      <div class="lv-actions">
        <button class="lv-btn ghost" onclick="document.getElementById('levelup-modal').classList.remove('open')">
          ${L3('متابعة', 'Continuar', 'Continue')}
        </button>
        <button class="lv-btn gold" onclick="document.getElementById('levelup-modal').classList.remove('open'); Router.go('wisdom/achievements')">
          <i class="fas fa-medal"></i> ${L3('الأوسمة', 'Ver medallas', 'See badges')}
        </button>
      </div>
    </div>`;
  requestAnimationFrame(() => host.classList.add('open'));
  try { if (navigator.vibrate) navigator.vibrate([40, 40, 80]); } catch (e) {}
}

// ============ بطاقة فتح وسام ============
function AchievementPopup(ach) {
  if (!ach) return;
  const L3 = (ar, es, en) => AchievementsPage._L(ar, es, en);
  let host = document.getElementById('ach-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'ach-toast-host';
    host.className = 'ach-toast-host';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = 'ach-toast';
  el.innerHTML = `
    <div class="ach-toast-medal">${ach.icon}</div>
    <div class="ach-toast-txt">
      <div class="ach-toast-eyebrow">${L3('وسام جديد', 'Nueva medalla', 'New badge')}</div>
      <div class="ach-toast-name">${AchievementsPage._name(ach.name)}</div>
      <div class="ach-toast-desc">${AchievementsPage._name(ach.desc)}</div>
    </div>
    <button class="ach-toast-go" aria-label="${L3('عرض', 'Ver', 'View')}" onclick="Router.go('wisdom/achievements')">
      <i class="fas fa-chevron-${document.documentElement.dir === 'rtl' ? 'left' : 'right'}"></i>
    </button>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => {
    el.classList.remove('in');
    setTimeout(() => el.remove(), 400);
  }, 4500);
  try { if (navigator.vibrate) navigator.vibrate([25, 30, 25]); } catch (e) {}
}
