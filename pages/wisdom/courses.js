// 📚 Cursos Interactivos — v2
// Motor reescrito: mascota guía, gamificación real (XP solo si es correcto,
// reintentos, cola de errores), progreso que nunca supera el 100%, certificados
// con nivel, y soporte para el nuevo curso de árabe (unidades/estaciones ricas)
// además de los cursos "clásicos" (lista plana de estaciones).
//
// Los tipos de lección específicos del árabe (video, infographic, sound_grid,
// vocab, phrase, roots, shape_families, arabic_letter, journey_map, match_pairs,
// word_builder, word_order) se añaden en js/courses-lessons.js mediante
// Object.assign(CoursesPage, {...}) — este archivo define el "esqueleto":
// navegación, progreso, el motor de preguntas (qrun) y los tipos genéricos
// (card, quiz, scenario, fill_blank, flashcards, drag_drop, prayer_step,
// wudu_step) que ya usan otros cursos.
const CoursesPage = {
  state: null,       // { courseId, stationId, course, station, lessonIdx, doneIdx, correctAnswers, wrongAnswers, startTime }
  qrun: null,         // sesión de preguntas en curso (ver runQuestions)
  _reviewReturn: null,

  // ============ IDIOMA / TEXTO ============
  lang() { return (typeof currentLocale !== 'undefined' && currentLocale === 'ar') ? 'ar' : (currentLocale === 'en' ? 'en' : 'es'); },

  // Resuelve {es,ar,en} u objeto con _es/_ar/_en, o string plano.
  _loc(val, lang) {
    lang = lang || this.lang();
    if (val == null) return '';
    if (typeof val !== 'object') return String(val);
    return val[lang] || val.es || val.en || Object.values(val)[0] || '';
  },
  L(val) { return this._loc(val); },

  // Convierte **negrita** → <strong>. Para texto corto (títulos, botones, feedback).
  bold(s) { return String(s == null ? '' : s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); },
  X(val) { return this.bold(this.L(val)); },

  // Contenido largo: si YA trae HTML de bloque (how_to_pray usa <p>/<ol>/<li>),
  // solo aplica negrita y lo deja intacto. Si es texto plano con \n, separa
  // en párrafos (arreglo del bug: los ** se mostraban literalmente).
  fmtContent(val) {
    const s = this.L(val);
    if (!s) return '';
    if (/<(p|ol|ul|li|div|table|h[1-6])[\s>]/i.test(s)) return this.bold(s);
    return s.split('\n').map(l => l.trim()).filter(Boolean).map(l => `<p>${this.bold(escapeHtml(l).replace(/&amp;lt;br&amp;gt;/g, '<br>'))}</p>`).join('');
  },

  // ============ REGISTRO DE CURSOS ============
  getAllCourses() {
    const courses = [];
    if (typeof COURSE_ARABIC_LANGUAGE !== 'undefined') courses.push(COURSE_ARABIC_LANGUAGE);
    if (typeof COURSE_HOW_TO_PRAY !== 'undefined') courses.push(this._adaptHowToPray(COURSE_HOW_TO_PRAY));
    if (typeof COURSE_JOURNEY !== 'undefined') courses.push(COURSE_JOURNEY);
    if (typeof COURSE_SALAH_COMPLETE !== 'undefined') courses.push(COURSE_SALAH_COMPLETE);
    if (typeof COURSE_WUDU_COMPLETE !== 'undefined') courses.push(COURSE_WUDU_COMPLETE);
    if (typeof COURSE_QURAN_BASICS !== 'undefined') courses.push(COURSE_QURAN_BASICS);
    if (typeof COURSE_PILLARS !== 'undefined') courses.push(COURSE_PILLARS);
    if (typeof COURSE_NAMES !== 'undefined') courses.push(COURSE_NAMES);
    if (typeof COURSE_KIDS !== 'undefined') courses.push(COURSE_KIDS);
    return courses;
  },

  // FIX: how_to_pray.js nunca se registraba (estructura {lessons} en vez de
  // {stations}), así que jamás aparecía en el índice. Aquí se adapta, sin
  // tocar el archivo de datos original, a una única estación con lecciones
  // tipo "card" (su `content` ya trae HTML propio con <strong>/<ol>/<li>).
  _adaptHowToPray(src) {
    if (this.__htpCache && this.__htpCache._src === src) return this.__htpCache;
    const lessons = (src.lessons || []).map(l => ({ type: 'card', title: l.title, content: l.content, tip: l.tip }));
    const adapted = {
      id: src.id, slug: src.id, icon: src.icon, color: src.color, accent: src.color,
      mascotPose: 'welcome', ageGroup: 'all', durationMin: parseInt(src.duration) || 15, dailyGoalMin: 5,
      difficulty: 'beginner', title: src.title, description: src.description,
      stations: [{ id: 'main', icon: src.icon, title: src.title, mascotIntro: src.description, lessons }],
    };
    adapted._src = src;
    this.__htpCache = adapted;
    return adapted;
  },

  countLessons(course) { return course.stations.reduce((sum, s) => sum + s.lessons.length, 0); },
  difficultyIcon(d) { return d === 'easy' ? '●○○' : d === 'intermediate' ? '●●○' : d === 'beginner' ? '●○○' : '●●●'; },

  // ============ PROGRESO (Gamification.stats.coursesProgress) ============
  _gs() { return Gamification.getState(); },
  _prog(gs, courseId) {
    if (!gs.stats.coursesProgress) gs.stats.coursesProgress = {};
    if (!gs.stats.coursesProgress[courseId]) {
      gs.stats.coursesProgress[courseId] = { completedLessons: 0, completedStations: [], lastStation: null, stationProgress: {} };
    }
    const p = gs.stats.coursesProgress[courseId];
    if (!p.stationProgress) p.stationProgress = {};
    return p;
  },
  userProgress() { return this._gs().stats.coursesProgress || {}; },

  // ============ HUB ============
  renderHub(container, params) {
    if (params && (params.review === '1' || params.review === 1 || params.review === true) && typeof CoursesSRS !== 'undefined' && CoursesSRS.hasEnough()) {
      this.startReview();
      return;
    }
    const courses = this.getAllCourses();
    const lang = this.lang();
    const gameState = this._gs();
    const userProgress = gameState.stats?.coursesProgress || {};
    const completedCourses = gameState.stats?.coursesCompleted || [];
    const totalXp = gameState.xp || 0;
    const streak = gameState.streak || 0;

    container.innerHTML = `
      <div class="top-bar courses-top-bar">
        <button class="top-bar-btn" onclick="Router.go('wisdom')">
          <i class="fas fa-chevron-${lang === 'ar' ? 'right' : 'left'}"></i>
        </button>
        <div class="top-bar-title"><i class="fas fa-book-open"></i> ${t('coursesTitle') || 'Cursos'}</div>
        <div style="width: 30px;"></div>
      </div>

      <div class="courses-hero">
        ${Mascot.renderWithSpeech('welcome', t('coursesWelcome') || '¡Hola! Empieza tu viaje <i class="fas fa-moon"></i>', 'large')}
        <div class="courses-progress-row">
          <div class="cp-stat"><span class="cp-emoji"><i class="fas fa-star"></i></span><span class="cp-val">${totalXp}</span><span class="cp-lbl">XP</span></div>
          <div class="cp-stat"><span class="cp-emoji"><i class="fas fa-fire"></i></span><span class="cp-val">${streak}</span><span class="cp-lbl">${t('streak') || 'racha'}</span></div>
          <div class="cp-stat"><span class="cp-emoji"><i class="fas fa-trophy"></i></span><span class="cp-val">${completedCourses.length}</span><span class="cp-lbl">${t('completed') || 'completos'}</span></div>
        </div>
      </div>

      <div style="padding: 0 var(--sp-md) var(--sp-md);">
        ${this.renderReviewCard()}
        ${this.renderFeatured(courses, userProgress, lang)}

        <h2 class="section-title"><i class="fas fa-book-open"></i> ${t('allCourses') || 'Todos los cursos'}</h2>
        <div class="courses-grid">
          ${courses.map(c => this.renderCourseCard(c, userProgress, completedCourses, lang)).join('')}
        </div>

        ${this.renderAchievements(gameState)}
      </div>
    `;
  },

  // Tarjeta de "Repaso diario" (SRS) — solo si hay algo aprendido
  renderReviewCard() {
    if (typeof CoursesSRS === 'undefined' || !CoursesSRS.hasEnough()) return '';
    const due = CoursesSRS.dueCount();
    const doneToday = CoursesSRS.reviewDoneToday();
    const label = doneToday ? (t('cxReviewDoneToday') || '¡Repaso de hoy completado!') : (t('cxReviewTitle') || 'Repaso diario');
    const sub = doneToday
      ? (t('cxGoalDone') || '')
      : `${due > 0 ? (t('cxReviewDue') || '{n} pendientes').replace('{n}', due) : (t('cxReviewNone') || 'Repaso ligero de hoy')}`;
    return `
      <div class="cx-review-card ${doneToday ? 'done' : ''}" onclick="${doneToday ? '' : "CoursesPage.startReview()"}">
        <div class="cx-review-icon"><i class="fas fa-rotate"></i></div>
        <div class="cx-review-text"><div class="cx-review-title">${label}</div><div class="cx-review-sub">${sub}</div></div>
        ${doneToday ? '<i class="fas fa-circle-check cx-review-check"></i>' : '<i class="fas fa-chevron-right"></i>'}
      </div>
      ${this.renderReminderRow()}`;
  },

  // Fila compacta para activar/desactivar el recordatorio tras una oración.
  renderReminderRow() {
    if (typeof CoursesSRS === 'undefined') return '';
    const cfg = CoursesSRS.reminderConfig();
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const label = { Fajr: t('cxPrayerFajr'), Dhuhr: t('cxPrayerDhuhr'), Asr: t('cxPrayerAsr'), Maghrib: t('cxPrayerMaghrib'), Isha: t('cxPrayerIsha') };
    return `
      <div class="cx-reminder-row">
        <button class="cx-reminder-toggle ${cfg.on ? 'on' : ''}" onclick="CoursesPage.toggleReminder()">
          <i class="fas fa-bell${cfg.on ? '' : '-slash'}"></i> ${t('cxRemindAfter') || 'Recordarme después de la oración'}
        </button>
        ${cfg.on ? `
          <select class="cx-reminder-select" onchange="CoursesPage.setReminderPrayer(this.value)">
            ${prayers.map(p => `<option value="${p}" ${cfg.prayer === p ? 'selected' : ''}>${label[p]}</option>`).join('')}
          </select>` : ''}
      </div>`;
  },

  toggleReminder() {
    if (typeof CoursesSRS === 'undefined') return;
    const cfg = CoursesSRS.reminderConfig();
    const turningOn = !cfg.on;
    if (turningOn && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(() => this._applyReminder(turningOn, cfg.prayer));
    } else {
      this._applyReminder(turningOn, cfg.prayer);
    }
  },
  setReminderPrayer(prayer) { this._applyReminder(true, prayer); },
  _applyReminder(on, prayer) {
    CoursesSRS.setReminder(on, prayer);
    showToast(on ? ('🔔 ' + (t('cxRemindOn') || 'Recordatorio activado')) : (t('cxRemindOff') || 'Recordatorio desactivado'), 1600);
    this.renderHub(document.getElementById('main-content'));
  },

  renderFeatured(courses, userProgress, lang) {
    let featured = null;
    for (const c of courses) {
      const prog = userProgress[c.id];
      if (prog && prog.completedLessons > 0 && !this._gs().stats.coursesCompleted.includes(c.id)) { featured = c; break; }
    }
    if (!featured) return '';
    const prog = userProgress[featured.id] || {};
    const total = this.countLessons(featured);
    const pct = total > 0 ? Math.min(100, Math.round((prog.completedLessons / total) * 100)) : 0;
    return `
      <div class="featured-course-card" onclick="CoursesPage.openCourse('${featured.id}')" style="--course-color: ${featured.color};">
        <div class="featured-badge">${t('continueLearning') || '▶ Continuar'}</div>
        <div class="featured-icon">${featured.icon}</div>
        <div class="featured-info">
          <div class="featured-title">${this.X(featured.title)}</div>
          <div class="featured-progress-bar"><div class="featured-progress-fill" style="width:${pct}%; background:${featured.color};"></div></div>
          <div class="featured-progress-text">${prog.completedLessons || 0} / ${total} · ${pct}%</div>
        </div>
        <i class="fas fa-chevron-${lang === 'ar' ? 'left' : 'right'} featured-arrow"></i>
      </div>`;
  },

  renderCourseCard(course, userProgress, completedCourses, lang) {
    const prog = userProgress[course.id] || { completedLessons: 0 };
    const total = this.countLessons(course);
    const pct = total > 0 ? Math.min(100, Math.round((prog.completedLessons / total) * 100)) : 0;
    const isDone = completedCourses.includes(course.id);
    const tier = prog.tier;
    const tierBadge = tier ? `<span class="cx-tier-chip cx-tier-${tier}">${this._tierIcon(tier)}</span>` : '';
    return `
      <div class="course-card" onclick="CoursesPage.openCourse('${course.id}')" style="--course-color: ${course.color};">
        <div class="course-card-header" style="background: linear-gradient(135deg, ${course.color}, ${course.accent || course.color}dd);">
          <div class="course-card-icon">${course.icon}</div>
          ${isDone ? `<div class="course-done-badge">${tierBadge || '<i class="fas fa-check"></i>'}</div>` : ''}
          <div class="course-card-meta">
            <span><i class="fas fa-clock"></i> ${course.durationMin}m</span>
            <span><i class="fas fa-signal"></i> ${this.difficultyIcon(course.difficulty)}</span>
          </div>
        </div>
        <div class="course-card-body">
          <div class="course-card-title">${this.X(course.title)}</div>
          <div class="course-card-desc">${this.X(course.description).replace(/<[^>]+>/g, '').slice(0, 80)}...</div>
          <div class="course-card-progress">
            <div class="ccp-bar"><div class="ccp-fill" style="width:${pct}%; background:${course.color};"></div></div>
            <div class="ccp-text">${pct}%</div>
          </div>
        </div>
      </div>`;
  },

  renderAchievements(gameState) {
    const achievements = gameState.achievements || [];
    if (!achievements.length) return '';
    return `
      <h2 class="section-title"><i class="fas fa-trophy"></i> ${t('achievements') || 'Logros'}</h2>
      <div class="achievements-row">
        ${achievements.slice(0, 6).map(id => {
          const a = (Gamification.ACHIEVEMENTS || []).find(x => x.id === id);
          return `<div class="achievement-badge"><div class="ab-icon">${a ? a.icon : '<i class="fas fa-medal"></i>'}</div><div class="ab-name">${a ? this.X(a.name) : id}</div></div>`;
        }).join('')}
      </div>`;
  },

  _tierIcon(tier) { return tier === 'gold' ? '🥇' : tier === 'silver' ? '🥈' : '🥉'; },
  _tierLabel(tier) {
    const map = {
      bronze: T_('Bronce', 'برونزي', 'Bronze'), silver: T_('Plata', 'فضّي', 'Silver'), gold: T_('Oro', 'ذهبي', 'Gold'),
    };
    return this.L(map[tier] || {});
  },

  // ============ NAVEGACIÓN DE CURSO ============
  openCourse(courseId, opts) {
    const container = document.getElementById('main-content');
    const course = this.getAllCourses().find(c => c.id === courseId);
    if (!course) { this.renderHub(container); return; }
    this._migrateLegacyProgress(course);
    if (course.units && course.units.length) this.renderCourseOverviewV2(container, course, opts);
    else this.renderCourseOverviewV1(container, course);
    container.scrollTop = 0; // v66: que la pantalla se abra desde arriba, no a media altura
  },

  // Si el curso trae `legacyStationMap` (ids de estaciones de una versión
  // anterior → ids nuevos), traduce el progreso ya guardado una sola vez para
  // que una reestructuración del curso no le "borre" el avance a nadie.
  _migrateLegacyProgress(course) {
    if (!course.legacyStationMap) return;
    const gs = this._gs();
    const prog = this._prog(gs, course.id);
    if (prog.migratedV2) return;
    let changed = false;
    Object.keys(course.legacyStationMap).forEach(oldId => {
      const idx = prog.completedStations.indexOf(oldId);
      if (idx === -1) return;
      prog.completedStations.splice(idx, 1);
      course.legacyStationMap[oldId].forEach(newId => {
        if (!prog.completedStations.includes(newId)) prog.completedStations.push(newId);
      });
      changed = true;
    });
    prog.migratedV2 = true;
    // El contador de lecciones no se recalcula con exactitud (la reestructuración
    // cambió cuántas hay por estación); lo importante es que las estaciones ya
    // superadas sigan desbloqueando las siguientes y no se pierdan logros.
    if (changed) prog.completedLessons = Math.max(prog.completedLessons || 0,
      course.stations.filter(s => prog.completedStations.includes(s.id)).reduce((sum, s) => sum + s.lessons.length, 0));
    Gamification.saveState(gs);
  },

  showLocked() { Mascot.showTip(t('lockedStation') || '<i class="fas fa-lock"></i> Completa la estación anterior primero', 'thinking', 2500); },

  // ----- Vista clásica (lista plana) para cursos sin `units` -----
  renderCourseOverviewV1(container, course) {
    const lang = this.lang();
    const gs = this._gs();
    const prog = this._prog(gs, course.id);
    const total = this.countLessons(course);
    const pct = total > 0 ? Math.min(100, Math.round((prog.completedLessons / total) * 100)) : 0;

    container.innerHTML = `
      <div class="top-bar" style="background: linear-gradient(135deg, ${course.color}, ${(course.accent || course.color)}dd);">
        <button class="top-bar-btn" onclick="Router.go('wisdom/courses')" style="color:#fff;">
          <i class="fas fa-chevron-${lang === 'ar' ? 'right' : 'left'}"></i>
        </button>
        <div class="top-bar-title" style="color:#fff;">${course.icon} ${this.X(course.title)}</div>
        <div style="width: 30px;"></div>
      </div>
      <div class="course-overview" style="--course-color: ${course.color};">
        <div class="overview-hero" style="background: linear-gradient(135deg, ${course.color}, ${(course.accent || course.color)}dd);">
          ${Mascot.render(course.mascotPose || 'welcome', 'large', 'mascot-pop-in')}
          <div class="overview-title">${this.X(course.title)}</div>
          <div class="overview-desc">${this.X(course.description)}</div>
          <div class="overview-meta">
            <span><i class="fas fa-clock"></i> ${course.durationMin} min</span>
            <span><i class="fas fa-map-marker-alt"></i> ${course.stations.length} ${t('stations') || 'estaciones'}</span>
            <span><i class="fas fa-list"></i> ${total} ${t('lessons') || 'lecciones'}</span>
          </div>
          <div class="overview-progress">
            <div class="overview-progress-bar"><div class="overview-progress-fill" style="width:${pct}%;"></div></div>
            <div class="overview-progress-text">${prog.completedLessons || 0} / ${total} · ${pct}%</div>
          </div>
        </div>
        <div class="stations-list">
          <h3><i class="fas fa-map"></i> ${t('stations') || 'Estaciones'}</h3>
          ${course.stations.map((s, idx) => this._stationRowV1(course, s, idx, prog, lang)).join('')}
        </div>
      </div>`;
  },

  _stationRowV1(course, s, idx, prog, lang) {
    const isDone = prog.completedStations.includes(s.id);
    const isLocked = idx > 0 && !prog.completedStations.includes(course.stations[idx - 1].id);
    const onClick = isLocked ? `CoursesPage.showLocked()` : `CoursesPage.startStation('${course.id}', '${s.id}')`;
    const resume = prog.stationProgress && prog.stationProgress[s.id];
    const inProgress = !isDone && resume && resume.lessonIdx > 0;
    return `
      <div class="station-row ${isDone ? 'done' : ''} ${isLocked ? 'locked' : ''}" onclick="${onClick}">
        <div class="station-num" style="background:${isDone ? '#4CAF50' : (isLocked ? '#999' : course.color)};">
          ${isDone ? '<i class="fas fa-check"></i>' : (isLocked ? '<i class="fas fa-lock"></i>' : (idx + 1))}
        </div>
        <div class="station-info">
          <div class="station-title">${s.icon || ''} ${this.X(s.title)}</div>
          <div class="station-meta">${inProgress ? `<i class="fas fa-circle-play"></i> ${resume.lessonIdx}/${s.lessons.length}` : `${s.lessons.length} ${t('lessons') || 'lecciones'}`}</div>
        </div>
        <i class="fas fa-chevron-${lang === 'ar' ? 'left' : 'right'}"></i>
      </div>`;
  },

  // ----- Vista v2: unidades plegables + mapa en zigzag -----
  renderCourseOverviewV2(container, course, opts) {
    opts = opts || {};
    const lang = this.lang();
    const gs = this._gs();
    const prog = this._prog(gs, course.id);
    const total = this.countLessons(course);
    const pct = total > 0 ? Math.min(100, Math.round((prog.completedLessons / total) * 100)) : 0;
    const isCourseDone = gs.stats.coursesCompleted.includes(course.id);
    const openUnit = opts.openUnit != null ? opts.openUnit : this._firstIncompleteUnit(course, prog);

    container.innerHTML = `
      <div class="top-bar" style="background: linear-gradient(135deg, ${course.color}, ${course.accent}dd);">
        <button class="top-bar-btn" onclick="Router.go('wisdom/courses')" style="color:#fff;">
          <i class="fas fa-chevron-${lang === 'ar' ? 'right' : 'left'}"></i>
        </button>
        <div class="top-bar-title" style="color:#fff;">${course.icon} ${this.X(course.title)}</div>
        <div style="width: 30px;"></div>
      </div>
      <div class="course-overview cx-overview-v2" style="--course-color: ${course.color}; --course-accent: ${course.accent || course.color};">
        <div class="overview-hero" style="background: linear-gradient(135deg, ${course.color}, ${course.accent}dd);">
          ${Mascot.render(course.mascotPose || 'welcome', 'large', 'mascot-pop-in')}
          <div class="overview-title">${this.X(course.title)}</div>
          <div class="overview-desc">${this.X(course.description)}</div>
          <div class="overview-meta">
            <span><i class="fas fa-clock"></i> ${course.durationMin} min</span>
            <span><i class="fas fa-layer-group"></i> ${course.units.length} ${t('cxUnits') || 'unidades'}</span>
            <span><i class="fas fa-list"></i> ${total} ${t('lessons') || 'lecciones'}</span>
          </div>
          <div class="overview-progress">
            <div class="overview-progress-bar"><div class="overview-progress-fill" style="width:${pct}%;"></div></div>
            <div class="overview-progress-text">${prog.completedLessons || 0} / ${total} · ${pct}%</div>
          </div>
          ${isCourseDone ? `<button class="btn-ghost cx-view-cert-btn" onclick="CoursesPage.viewCertificate('${course.id}')"><i class="fas fa-award"></i> ${t('cxViewCertificate') || 'Ver certificado'}</button>` : ''}
        </div>

        <div class="cx-units">
          ${course.units.map((u, ui) => this._renderUnit(course, u, ui, prog, lang, ui === openUnit)).join('')}
        </div>
      </div>`;
    if (opts.scrollToStation) {
      setTimeout(() => {
        const el = document.getElementById('st-' + opts.scrollToStation);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    }
  },

  _firstIncompleteUnit(course, prog) {
    for (let i = 0; i < course.units.length; i++) {
      if (course.units[i].stations.some(s => !prog.completedStations.includes(s.id))) return i;
    }
    return course.units.length - 1;
  },

  _renderUnit(course, unit, ui, prog, lang, open) {
    const doneCount = unit.stations.filter(s => prog.completedStations.includes(s.id)).length;
    const allDone = doneCount === unit.stations.length;
    return `
      <div class="cx-unit ${open ? 'open' : ''} ${allDone ? 'unit-done' : ''}">
        <button class="cx-unit-head" onclick="CoursesPage.toggleUnit(${ui})">
          <span class="cx-unit-icon">${unit.icon || ''}</span>
          <span class="cx-unit-title">${this.X(unit.title)}</span>
          <span class="cx-unit-count">${doneCount}/${unit.stations.length}</span>
          <i class="fas fa-chevron-down cx-unit-caret"></i>
        </button>
        <div class="cx-unit-body">
          <div class="cx-zigzag">
            ${unit.stations.map((s, si) => this._renderZigzagStation(course, s, this._globalStationIndex(course, s.id), prog, lang, si)).join('')}
          </div>
        </div>
      </div>`;
  },

  _globalStationIndex(course, stationId) { return course.stations.findIndex(s => s.id === stationId); },

  toggleUnit(ui) {
    const units = document.querySelectorAll('.cx-unit');
    const el = units[ui];
    if (el) el.classList.toggle('open');
  },

  _renderZigzagStation(course, s, idx, prog, lang, si) {
    const isDone = prog.completedStations.includes(s.id);
    const isLocked = idx > 0 && !prog.completedStations.includes(course.stations[idx - 1].id);
    const resume = prog.stationProgress && prog.stationProgress[s.id];
    const inProgress = !isDone && resume && resume.lessonIdx > 0;
    const side = si % 2 === 0 ? 'l' : 'r';
    const tone = (s.cover && s.cover.tone != null) ? s.cover.tone : idx;
    const onClick = isLocked ? `CoursesPage.showLocked()` : `CoursesPage.startStation('${course.id}', '${s.id}')`;
    const canSkip = isLocked && this._canSkipTest(course, s, idx, prog);
    return `
      <div class="cx-zz-node zz-${side}" id="st-${s.id}">
        <button class="cx-zz-btn ${isDone ? 'done' : ''} ${isLocked ? 'locked' : ''} ${inProgress ? 'in-progress' : ''}" data-tone="${tone % 8}" onclick="${onClick}">
          ${isDone ? '<i class="fas fa-check"></i>' : (isLocked ? '<i class="fas fa-lock"></i>' : (s.icon || `<span class="cx-zz-num">${idx + 1}</span>`))}
          ${inProgress ? '<span class="cx-zz-dot"></span>' : ''}
        </button>
        <div class="cx-zz-label">${this.X(s.title)}</div>
        ${canSkip ? `<button class="cx-zz-skip" onclick="event.stopPropagation();CoursesPage.offerSkipTest('${course.id}','${s.id}')">${t('cxSkipStation') || 'Saltar con prueba'}</button>` : ''}
      </div>`;
  },

  // Puede intentar "saltar" una estación bloqueada si ya completó al menos
  // la mitad de las estaciones de letras anteriores (evita abusar del salto
  // en la primera estación del curso).
  _canSkipTest(course, s, idx, prog) { return idx > 1 && s.kind !== 'exam' && s.kind !== 'intro'; },

  offerSkipTest(courseId, stationId) {
    const course = this.getAllCourses().find(c => c.id === courseId);
    const station = course.stations.find(s => s.id === stationId);
    if (!course || !station) return;
    const prevIdx = this._globalStationIndex(course, stationId) - 1;
    const prevStation = course.stations[prevIdx];
    const gs = this._gs();
    const prog = this._prog(gs, courseId);
    if (!prog.completedStations.includes(prevStation.id)) { this.showLocked(); return; }
    // Construye un mini-examen (5 preguntas) sobre la estación ANTERIOR: si
    // aprueba, se desbloquea esta sin repetir toda la anterior.
    const items = (prevStation.items && prevStation.items.length) ? prevStation.items
      : (typeof ArabicItems !== 'undefined' ? ArabicItems.lettersUpTo(99).slice(0, 6).map(l => 'letter:' + l.id) : []);
    const qs = (typeof ArabicItems !== 'undefined') ? ArabicItems.session(items.length ? items : ['letter:ba'], 5, {}) : [];
    if (!qs.length) { this.showLocked(); return; }
    this.state = { courseId, stationId: prevStation.id, course, station: prevStation, lessonIdx: 0, doneIdx: [], correctAnswers: 0, wrongAnswers: 0, startTime: Date.now(), skipTestFor: stationId };
    const container = document.getElementById('main-content');
    container.innerHTML = this._lessonShell(course, '', 0, 1);
    this.runQuestions(qs, { onDone: (res) => this._afterSkipTest(res, courseId, prevStation.id, stationId) });
  },

  _afterSkipTest(res, courseId, prevStationId, unlockStationId) {
    const pass = res.accuracy >= 0.8;
    if (pass) {
      const gs = this._gs();
      const prog = this._prog(gs, courseId);
      if (!prog.completedStations.includes(prevStationId)) prog.completedStations.push(prevStationId);
      Gamification.saveState(gs);
      showToast('✅ ' + (t('cxSkipPassed') || '¡Superado! Estación desbloqueada.'), 2200);
    } else {
      showToast('📖 ' + (t('cxSkipFailed') || 'Aún no. Repasa esa estación primero.'), 2600);
    }
    this.state = null;
    this.openCourse(courseId);
  },

  viewCertificate(courseId) {
    const course = this.getAllCourses().find(c => c.id === courseId);
    if (!course) return;
    const lang = this.lang();
    const gs = this._gs();
    const prog = this._prog(gs, courseId);
    const container = document.getElementById('main-content');
    container.innerHTML = `
      <div class="top-bar" style="background: linear-gradient(135deg, ${course.color}, ${course.accent}dd);">
        <button class="top-bar-btn" onclick="CoursesPage.openCourse('${course.id}')" style="color:#fff;">
          <i class="fas fa-chevron-${lang === 'ar' ? 'right' : 'left'}"></i>
        </button>
        <div class="top-bar-title" style="color:#fff;">${t('cxViewCertificate') || 'Certificado'}</div>
        <div style="width: 30px;"></div>
      </div>
      <div class="station-complete" style="--course-color: ${course.color};">
        ${this.renderCertificate(course, lang, prog.tier)}
        <div class="sc-actions"><button class="btn-ghost" onclick="CoursesPage.openCourse('${course.id}')">${t('backToCourses') || 'Volver'}</button></div>
      </div>`;
    container.scrollTop = 0;
  },

  // ============ REPASO (SRS) ============
  startReview() {
    if (typeof CoursesSRS === 'undefined') return;
    const { ids } = CoursesSRS.sessionIds();
    if (!ids.length) { showToast(t('cxReviewLocked') || 'Nada que repasar todavía', 1800); return; }
    const questions = (typeof ArabicItems !== 'undefined') ? ArabicItems.session(ids, ids.length, {}) : [];
    if (!questions.length) return;
    this._reviewReturn = true;
    this.state = {
      courseId: 'arabic_language', stationId: '__review__', isReview: true,
      course: (typeof COURSE_ARABIC_LANGUAGE !== 'undefined') ? COURSE_ARABIC_LANGUAGE : { color: '#174430', accent: '#D4A537' },
      station: { title: T_('Repaso diario', 'المراجعة اليومية', 'Daily review'), lessons: [] },
      lessonIdx: 0, doneIdx: [], correctAnswers: 0, wrongAnswers: 0, startTime: Date.now(),
    };
    const container = document.getElementById('main-content');
    container.innerHTML = this._lessonShell(this.state.course, this.L(this.state.station.title), 0, 1);
    this.runQuestions(questions, { isReview: true, onDone: (res) => this._afterReview(res) });
  },

  _afterReview(res) {
    CoursesSRS.markReviewDone();
    Gamification.updateStreak();
    const streak = Gamification.getState().streak || 0;
    const container = document.getElementById('main-content');
    const course = this.state.course;
    container.innerHTML = `
      <div class="station-complete" style="--course-color: ${course.color || '#174430'};">
        <div class="celebration-overlay">
          ${Mascot.renderWithSpeech('success', t('cxReviewComplete') || '¡Repaso completado!', 'xl')}
        </div>
        <h2 class="sc-title"><i class="fas fa-rotate"></i> ${t('cxReviewTitle') || 'Repaso diario'}</h2>
        <div class="sc-stats">
          <div class="sc-stat"><div class="scs-icon"><i class="fas fa-circle-check"></i></div><div class="scs-val">${res.firstTryCorrect}/${res.total}</div><div class="scs-lbl">${t('correct') || 'correctas'}</div></div>
          <div class="sc-stat"><div class="scs-icon"><i class="fas fa-fire"></i></div><div class="scs-val">${streak}</div><div class="scs-lbl">${t('streak') || 'racha'}</div></div>
        </div>
        <div class="sc-actions"><button class="btn-primary" onclick="Router.go('wisdom/courses')" style="background:${course.color || '#174420'};">${t('backToCourses') || 'Volver'}</button></div>
      </div>`;
    container.scrollTop = 0;
    this.state = null;
  },

  // ============ ARRANCAR ESTACIÓN ============
  startStation(courseId, stationId) {
    const course = this.getAllCourses().find(c => c.id === courseId);
    if (!course) return;
    const station = course.stations.find(s => s.id === stationId);
    if (!station) return;
    const gs = this._gs();
    const prog = this._prog(gs, courseId);
    const resume = prog.stationProgress[stationId];
    const startAt = (resume && resume.lessonIdx > 0 && resume.lessonIdx < station.lessons.length) ? resume : null;

    this.state = {
      courseId, stationId, course, station,
      lessonIdx: startAt ? startAt.lessonIdx : 0,
      doneIdx: startAt ? (startAt.doneIdx || []).slice() : [],
      correctAnswers: 0, wrongAnswers: 0, startTime: Date.now(),
    };
    const container = document.getElementById('main-content');
    this.renderStationIntro(container, !!startAt);
    container.scrollTop = 0; // v66: abrir la tarjeta de la estación desde arriba
  },

  renderStationIntro(container, hasResume) {
    const { course, station } = this.state;
    const lang = this.lang();
    container.innerHTML = `
      <div class="lesson-screen" style="--course-color: ${course.color};">
        <div class="lesson-topbar">
          <button class="lesson-close" onclick="CoursesPage.exitLesson()"><i class="fas fa-times"></i></button>
          <div class="lesson-progress-track"><div class="lesson-progress-fill" style="width:0%; background:${course.color};"></div></div>
        </div>
        <div class="station-intro-content">
          ${Mascot.renderWithSpeech(course.mascotPose || 'welcome', this.X(station.mascotIntro) || '', 'xl')}
          <h2 class="station-intro-title">${station.icon || ''} ${this.X(station.title)}</h2>
          <div class="station-intro-meta">${station.lessons.length} ${t('lessons') || 'lecciones'}</div>
          ${hasResume ? `<div class="cx-resume-note"><i class="fas fa-circle-play"></i> ${(t('cxContinueFrom') || 'Continuar (lección {n})').replace('{n}', this.state.lessonIdx + 1)}</div>` : ''}
          <button class="btn-primary station-start-btn" onclick="CoursesPage.nextLesson()" style="background:${course.color};">
            ${hasResume ? (t('cxContinue') || 'Continuar') : (t('start') || 'Empezar')} →
          </button>
          ${hasResume ? `<button class="btn-ghost cx-restart-btn" onclick="CoursesPage.restartStation()">${t('cxRestart') || 'Empezar de nuevo'}</button>` : ''}
        </div>
      </div>`;
  },

  restartStation() { this.state.lessonIdx = 0; this.state.doneIdx = []; this.nextLesson(); },

  _lessonShell(course, title, idx, totalLen) {
    const pct = totalLen ? Math.round(((idx + 1) / totalLen) * 100) : 0;
    return `
      <div class="lesson-screen" style="--course-color: ${course.color};">
        <div class="lesson-topbar">
          <button class="lesson-close" onclick="CoursesPage.exitLesson()"><i class="fas fa-times"></i></button>
          <div class="lesson-progress-track"><div class="lesson-progress-fill" style="width:${pct}%; background:${course.color};"></div></div>
          <div class="lesson-counter">${idx + 1}/${totalLen}</div>
        </div>
        <div class="lesson-content" id="lesson-content"></div>
      </div>`;
  },

  // ============ REPRODUCCIÓN DE LECCIONES ============
  nextLesson() {
    const st = this.state;
    const container = document.getElementById('main-content');
    if (st.lessonIdx >= st.station.lessons.length) { this.completeStation(container); container.scrollTop = 0; return; }

    const lesson = st.station.lessons[st.lessonIdx];
    container.innerHTML = this._lessonShell(st.course, this.X(st.station.title), st.lessonIdx, st.station.lessons.length);
    this.renderLesson(lesson);
    container.scrollTop = 0; // v66: cada tarjeta nueva empieza desde arriba, no a media pantalla
  },

  // Punto único de despacho por tipo. Los tipos "ricos" del árabe se registran
  // en js/courses-lessons.js vía `this.render_<type>`.
  renderLesson(lesson) {
    const fn = this['render_' + lesson.type];
    const box = document.getElementById('lesson-content');
    if (typeof fn === 'function') {
      const html = fn.call(this, lesson);
      // Los tipos basados en runQuestions (quiz/scenario/fill_blank/gen_quiz/
      // checkpoint/final_exam/listen_choose) ya escriben su HTML directamente
      // vía _renderQ() y devuelven '' — si sobrescribiéramos aquí con ''
      // borraríamos justo lo que acaban de pintar. Solo tocamos el DOM si la
      // función realmente devolvió contenido.
      if (html) box.innerHTML = html;
      this._afterRenderLesson(lesson);
      return;
    }
    box.innerHTML = `<div class="lesson-card"><p>${t('unknownLessonType') || 'Tipo de lección desconocido'}: ${lesson.type}</p>
      <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button></div>`;
  },

  _afterRenderLesson(lesson) {
    if (lesson.type === 'drag_drop') setTimeout(() => this.initDragDrop(), 100);
  },

  // ---- Avance de una lección "de contenido" (sin corrección) ----
  // Cuenta como completada UNA sola vez por estación (evita que repasar
  // una estación ya hecha vuelva a sumar progreso o XP).
  advanceContent(lesson) {
    lesson = lesson || this.state.station.lessons[this.state.lessonIdx];
    this._markLessonDone(this.state.lessonIdx, Gamification.XP_PER_LESSON || 25);
    const learns = (typeof ArabicItems !== 'undefined') ? ArabicItems.learnsFor(lesson) : (lesson && lesson.learns) || [];
    if (learns.length && typeof CoursesSRS !== 'undefined') CoursesSRS.learn(learns);
    this.state.lessonIdx++;
    this.nextLesson();
  },

  _markLessonDone(idx, xp) {
    const st = this.state;
    const isReview = st.isReview || st.skipTestFor;
    if (isReview) return; // el repaso y las pruebas de salto no tocan el progreso del curso
    if (!st.doneIdx.includes(idx)) {
      st.doneIdx.push(idx);
      const gs = this._gs();
      const prog = this._prog(gs, st.courseId);
      const cap = this.countLessons(st.course);
      prog.completedLessons = Math.min(cap, (prog.completedLessons || 0) + 1);
      prog.lastStation = st.stationId;
      Gamification.saveState(gs);
      if (xp) Gamification.addXP(xp);
    }
  },

  // ============ MOTOR DE PREGUNTAS (qrun) ============
  // Formato unificado de pregunta (el mismo que generan ArabicItems.mcq/session/exam):
  //   { prompt(string ya resuelto), glyph?, emoji?, img?, imgAlt?, say?(id-ref|{key,text}),
  //     autoplay?, options:[{t, rtl?, big?}], correct(idx), feedback(string), ids?:[srs ids], chrome? }
  // Los adaptadores de lecciones "autoría directa" (quiz/scenario/fill_blank) resuelven sus
  // campos {es,ar,en} a texto plano ANTES de entrar aquí (ver _mkOptsFromStrings/X).
  // opts: { onDone(res), isReview, awardXp:true }
  runQuestions(questions, opts) {
    opts = opts || {};
    this.qrun = {
      queue: questions.slice(), pos: 0, total: questions.length,
      firstTryCorrect: 0, mistakes: 0, doneIds: new Set(), opts,
    };
    this._renderQ();
  },

  _renderQ() {
    const r = this.qrun;
    const box = document.getElementById('lesson-content');
    if (!box) return;
    if (r.pos >= r.queue.length) { this._finishQ(); return; }
    const q = r.queue[r.pos];
    const chrome = q.chrome || 'default';
    const promptHtml = this.bold(q.prompt || '');
    const glyph = q.glyph ? `<div class="cx-q-big" dir="rtl">${q.glyph}</div>` : '';
    const audioBtn = q.say ? `<button class="cx-audio-btn" onclick="CoursesPage.playQSay()"><i class="fas fa-volume-high"></i></button>` : '';
    const pic = (q.emoji || q.img) && typeof ArabicItems !== 'undefined' ? ArabicItems.pic(q.emoji, q.img, q.imgAlt || '', 'cx-q-pic') : '';
    const scenarioHead = chrome === 'scenario' && q.emoji && !q.img ? `<div class="cx-scenario-emoji">${q.emoji}</div>` : '';

    box.innerHTML = `
      <div class="lesson-quiz cx-qrun ${chrome === 'scenario' ? 'cx-scenario' : ''}">
        ${Mascot.render(chrome === 'scenario' ? 'idle' : 'thinking', 'medium', 'lesson-mascot')}
        ${scenarioHead}
        <h2 class="lesson-quiz-q">${promptHtml}</h2>
        ${glyph}${chrome === 'scenario' ? '' : pic}${audioBtn}
        <div class="lesson-quiz-options" id="lesson-quiz-options">
          ${q.options.map((opt, i) => `
            <button class="lq-option ${opt.big ? 'lq-big' : ''}" data-idx="${i}" onclick="CoursesPage.answerQ(${i})">
              <span class="lq-letter">${String.fromCharCode(65 + i)}</span>
              <span class="lq-text" dir="${opt.rtl ? 'rtl' : 'auto'}">${typeof opt.t === 'string' ? opt.t : this.X(opt.t)}</span>
            </button>`).join('')}
        </div>
      </div>`;
    const scroller = document.getElementById('main-content');
    if (scroller) scroller.scrollTop = 0; // v66: cada pregunta nueva empieza desde arriba
    if (q.autoplay && q.say) setTimeout(() => this.playQSay(), 350);
  },

  playQSay() {
    const r = this.qrun; if (!r) return;
    const q = r.queue[r.pos];
    if (q && q.say && typeof ArabicAudio !== 'undefined') ArabicAudio.play(q.say);
  },

  answerQ(idx) {
    const r = this.qrun; if (!r) return;
    const q = r.queue[r.pos];
    const ok = idx === q.correct;
    const firstTry = !q._attempts;
    q._attempts = (q._attempts || 0) + 1;

    document.querySelectorAll('.lq-option').forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correct) btn.classList.add('correct');
      else if (i === idx && !ok) btn.classList.add('wrong');
    });

    if (ok) {
      if (firstTry) r.firstTryCorrect++;
      if (!r.doneIds.has(q)) {
        r.doneIds.add(q);
        if (!r.opts.isReview) Gamification.addXP(Gamification.XP_CORRECT_ANSWER || 10);
        if (q.ids && typeof CoursesSRS !== 'undefined') q.ids.forEach(id => CoursesSRS.grade(id, true, r.opts.isReview));
      }
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      r.mistakes++;
      if (q.ids && typeof CoursesSRS !== 'undefined') q.ids.forEach(id => CoursesSRS.grade(id, false, r.opts.isReview));
      if (q._attempts < 3) r.queue.push(q); // cola de errores: vuelve al final
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    const box = document.getElementById('lesson-content');
    const banner = document.createElement('div');
    banner.className = `quiz-feedback ${ok ? 'correct' : 'wrong'}`;
    const feedback = q.feedback ? this.bold(q.feedback) : (ok ? '' : (t('tryAgain') || 'Inténtalo de nuevo'));
    banner.innerHTML = `
      <div class="qf-row">
        ${Mascot.render(ok ? 'celebrate' : 'shy', 'small')}
        <div class="qf-text">
          <div class="qf-status">${ok ? '<i class="fas fa-circle-check"></i> ' + (t('correct') || '¡Correcto!') : '<i class="fas fa-lightbulb"></i> ' + (t('learn') || 'Aprendamos')}</div>
          <div class="qf-explanation">${feedback}</div>
        </div>
      </div>
      <button class="btn-primary" onclick="CoursesPage.advanceQ()">${ok ? (t('continue') || 'Continuar') : (t('cxNextStep') || 'Siguiente')} →</button>`;
    box.appendChild(banner);
    banner.scrollIntoView({ behavior: 'smooth', block: 'end' });
  },

  advanceQ() { this.qrun.pos++; this._renderQ(); },

  _finishQ() {
    const r = this.qrun;
    const res = { total: r.total, firstTryCorrect: r.firstTryCorrect, mistakes: r.mistakes, accuracy: r.total ? r.firstTryCorrect / r.total : 1 };
    this.qrun = null;
    if (r.opts.onDone) { r.opts.onDone(res); return; }
    // Lección simple (quiz/scenario/fill_blank de 1 pregunta): sigue el flujo normal.
    if (!r.opts.isReview && r.mistakes === 0 && r.total > 1) Gamification.addXP(Gamification.XP_BONUS_NO_MISTAKES || 50);
    this.advanceContent();
  },

  // ============ FIN DE ESTACIÓN ============
  completeStation(container) {
    const { course, station, correctAnswers } = this.state;
    const lang = this.lang();
    const gs = this._gs();
    const prog = this._prog(gs, course.id);
    if (!prog.completedStations.includes(station.id)) prog.completedStations.push(station.id);
    delete prog.stationProgress[station.id]; // ya no hay nada que reanudar

    const allDone = course.stations.every(s => prog.completedStations.includes(s.id));
    let courseJustCompleted = false;
    if (allDone && !gs.stats.coursesCompleted.includes(course.id)) {
      // FIX: antes se empujaba a mano al array y nunca se llamaba a
      // recordCourseCompleted(), así que los logros "primera dorura"/"todos
      // los cursos" jamás se desbloqueaban.
      Gamification.addXP(100);
      Gamification.recordCourseCompleted(course.id);
      courseJustCompleted = true;
    }
    Gamification.saveState(gs);
    Gamification.updateStreak();

    container.innerHTML = `
      <div class="station-complete" style="--course-color: ${course.color};">
        <div class="celebration-overlay">
          ${Mascot.renderWithSpeech('success', t('stationComplete') || '¡Estación completada!', 'xl')}
          <div class="confetti-container">${Array(30).fill(0).map((_, i) => `<div class="confetti" style="--i:${i}; --c:${Mascot.confettiColor(i)}; --d:${Math.random() * 0.5}s;"></div>`).join('')}</div>
        </div>
        <h2 class="sc-title">${station.icon || ''} ${this.X(station.title)}</h2>
        <div class="sc-stats">
          <div class="sc-stat"><div class="scs-icon"><i class="fas fa-list-check"></i></div><div class="scs-val">${station.lessons.length}</div><div class="scs-lbl">${t('lessons') || 'lecciones'}</div></div>
          <div class="sc-stat"><div class="scs-icon"><i class="fas fa-clock"></i></div><div class="scs-val">${Math.max(1, Math.round((Date.now() - this.state.startTime) / 60000))}m</div><div class="scs-lbl">${t('time') || 'tiempo'}</div></div>
        </div>
        ${courseJustCompleted ? this.renderCertificate(course, lang, prog.tier) : ''}
        <div class="sc-actions">
          ${!courseJustCompleted ? `<button class="btn-primary" onclick="CoursesPage.openCourse('${course.id}')" style="background:${course.color};">${t('continueCourse') || 'Continuar curso'} →</button>` : ''}
          <button class="btn-ghost" onclick="Router.go('wisdom/courses')">${t('backToCourses') || 'Volver a cursos'}</button>
        </div>
      </div>`;
    // segundos de estudio → hacia el objetivo diario (SRS)
    if (typeof CoursesSRS !== 'undefined') CoursesSRS.addSeconds(Math.round((Date.now() - this.state.startTime) / 1000), CoursesSRS.goalMinutes(course));
    this.state = null;
  },

  renderCertificate(course, lang, tier) {
    const userName = (AppState.settings && AppState.settings.userName) || AppState.userName || (lang === 'ar' ? 'الطالب' : (lang === 'en' ? 'Student' : 'Estudiante'));
    const date = new Date().toLocaleDateString(currentLocale === 'ar' ? 'ar-EG' : currentLocale);
    const editLabel = lang === 'ar' ? 'تعديل الاسم' : (lang === 'en' ? 'Edit name' : 'Editar nombre');
    const tierRow = tier ? `<div class="cert-tier cert-tier-${tier}">${this._tierIcon(tier)} ${this._tierLabel(tier)}</div>` : '';
    return `
      <div class="certificate" id="certificate">
        <div class="cert-corner cert-tl"><i class="fas fa-star"></i></div>
        <div class="cert-corner cert-tr"><i class="fas fa-star"></i></div>
        <div class="cert-corner cert-bl"><i class="fas fa-star"></i></div>
        <div class="cert-corner cert-br"><i class="fas fa-star"></i></div>
        <div class="cert-header">
          <div class="cert-mascot-row">${Mascot.render('celebrate', 'small')}</div>
          <h3><i class="fas fa-trophy"></i> ${t('certificateOfCompletion') || 'Certificado de Finalización'}</h3>
        </div>
        <div class="cert-body">
          ${tierRow}
          <div class="cert-presented">${t('presentedTo') || 'Otorgado a'}:</div>
          <div class="cert-name" id="cert-name-display">${escapeHtml(userName)}</div>
          <button class="cert-edit-name-btn" onclick="CoursesPage.editCertName()" title="${editLabel}" aria-label="${editLabel}"><i class="fas fa-pen"></i> <span>${editLabel}</span></button>
          <div class="cert-completed">${t('hasCompleted') || 'ha completado el curso'}:</div>
          <div class="cert-course-name">${/<[^>]+>/.test(course.icon || '') ? (course.certIcon || '⭐') : course.icon} ${escapeHtml(this.X(course.title))}</div>
          <div class="cert-date">${date}</div>
        </div>
        <div class="cert-footer"><div class="cert-signature">Quba — ${t('islamicLearning') || 'Aprendizaje Islámico'}</div></div>
        <button class="btn-primary cert-share-btn" onclick="CoursesPage.shareCertificate('${course.id}')"><i class="fas fa-share-alt"></i> ${t('shareCertificate') || 'Compartir certificado'}</button>
      </div>`;
  },

  editCertName() {
    const lang = this.lang();
    const current = (AppState.settings && AppState.settings.userName) || '';
    const promptText = lang === 'ar' ? 'اكتب اسمك للشهادة:' : (lang === 'en' ? 'Enter your name for the certificate:' : 'Escribe tu nombre para el certificado:');
    const val = window.prompt(promptText, current);
    if (val === null) return;
    const clean = val.trim().slice(0, 60);
    if (!AppState.settings) AppState.settings = {};
    AppState.settings.userName = clean;
    Storage.saveSettings();
    const nameEl = document.getElementById('cert-name-display');
    if (nameEl) nameEl.textContent = clean || (lang === 'ar' ? 'الطالب' : (lang === 'en' ? 'Student' : 'Estudiante'));
    showToast(t('nameSaved') || 'Nombre guardado', 1500);
  },

  shareCertificate(courseId) {
    const course = this.getAllCourses().find(c => c.id === courseId);
    const lang = this.lang();
    const userName = (AppState.settings && AppState.settings.userName) || AppState.userName || (lang === 'ar' ? 'الطالب' : (lang === 'en' ? 'Student' : 'Estudiante'));
    const tier = (this.userProgress()[courseId] || {}).tier;
    if (typeof CertShare !== 'undefined') {
      CertShare.open(course, userName, lang, tier);
    } else if (navigator.share) {
      navigator.share({ title: 'Quba — ' + this.X(course.title), text: `🏆 ${t('justCompleted')}: ${this.X(course.title)} — Quba` }).catch(() => {});
    }
  },

  // ============ SALIR / REANUDAR ============
  exitLesson() {
    if (!confirm(t('confirmExitLesson') || '¿Salir de la lección? Tu progreso se guardará.')) return;
    const st = this.state;
    if (st && !st.isReview && !st.skipTestFor && st.station && st.station.lessons && st.station.lessons.length) {
      const gs = this._gs();
      const prog = this._prog(gs, st.courseId);
      // FIX: antes se perdía el punto exacto (this.state = null) y al volver
      // a entrar la estación siempre reiniciaba desde la lección 1.
      prog.stationProgress[st.stationId] = { lessonIdx: st.lessonIdx, doneIdx: st.doneIdx.slice() };
      Gamification.saveState(gs);
    }
    this.state = null;
    this.qrun = null;
    Router.go('wisdom/courses');
  },

  cleanup() { this.state = null; this.qrun = null; },

  // ============ TIPOS GENÉRICOS / HEREDADOS ============
  render_card(lesson) {
    return `
      <div class="lesson-card">
        ${Mascot.render('thinking', 'medium', 'lesson-mascot mascot-float')}
        <h2 class="lesson-card-title">${this.X(lesson.title)}</h2>
        <div class="lesson-card-content">${this.fmtContent(lesson.content)}</div>
        ${lesson.tip ? `<div class="ps-tip">${this.fmtContent(lesson.tip)}</div>` : ''}
        ${lesson.source ? `<div class="lesson-source"><i class="fas fa-book"></i> ${this.X(lesson.source)}</div>` : ''}
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('understand') || 'Lo entiendo'} →</button>
      </div>`;
  },

  // Convierte options de lecciones "de autor" (arrays de strings, de objetos
  // {es,ar,en}, o mixtos) al formato unificado {t, rtl, big} del motor qrun.
  _mkOptsFromStrings(options) {
    return options.map((o) => {
      const s = this.X(o); // resuelve {es,ar,en} u objeto trilingüe, o deja el string tal cual
      const isArabic = /[\u0600-\u06FF]/.test(s);
      return { t: s, rtl: isArabic, big: isArabic };
    });
  },

  render_quiz(lesson) {
    const options = this._mkOptsFromStrings(lesson.options);
    const q = { prompt: this.X(lesson.question), options, correct: lesson.correct, feedback: this.X(lesson.feedback), ids: lesson.learns || [] };
    this.runQuestions([q], {});
    return '';
  },

  render_scenario(lesson) {
    const options = this._mkOptsFromStrings(lesson.options);
    const q = { prompt: this.X(lesson.situation), emoji: lesson.emoji, chrome: 'scenario', options, correct: lesson.correct, feedback: this.X(lesson.feedback), ids: lesson.learns || [] };
    this.runQuestions([q], {});
    return '';
  },

  render_fill_blank(lesson) {
    const glyph = `${lesson.before || ''}<span class="cx-blank">＿</span>${lesson.after || ''}`;
    const options = lesson.options.map(o => ({ t: o, rtl: true, big: true }));
    const q = { prompt: this.X(lesson.translation) || (T_('Completa la palabra', 'أكمل الكلمة', 'Complete the word')[this.lang()]), glyph, options, correct: lesson.correct, feedback: this.X(lesson.feedback), ids: lesson.learns || [] };
    this.runQuestions([q], {});
    return '';
  },

  render_flashcards(lesson) {
    let cards;
    if (lesson.cards) {
      cards = lesson.cards.map(c => ({ front: this.X(c.front), back: this.X(c.back), id: null }));
    } else if (lesson.items && typeof ArabicItems !== 'undefined') {
      cards = ArabicItems.cards(lesson.items); // ya trae {id, front, back, rtl}
    } else cards = [];
    return `
      <div class="lesson-flashcards">
        ${Mascot.render('encourage', 'medium', 'lesson-mascot')}
        <h2 class="lesson-fc-title">${this.X(lesson.title) || this.X({ es: 'Repaso', ar: 'مراجعة', en: 'Review' })}</h2>
        <div class="lesson-fc-hint"><i class="fas fa-hand-point-up"></i> ${t('tapToFlip') || 'Toca para girar'}</div>
        <div class="flashcards-grid">
          ${cards.map(c => `
            <div class="flashcard" onclick="this.classList.toggle('flipped'); ${c.id ? `ArabicAudio.play('${c.id}')` : ''}">
              <div class="flashcard-inner">
                <div class="flashcard-front" dir="${c.rtl || /[\u0600-\u06FF]/.test(c.front) ? 'rtl' : 'auto'}">${c.front}</div>
                <div class="flashcard-back">${c.back}</div>
              </div>
            </div>`).join('')}
        </div>
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('done') || 'Listo'} →</button>
      </div>`;
  },

  // ----- Drag & drop (orden), reutilizado tal cual con reintento -----
  render_drag_drop(lesson) {
    const instruction = this.X(lesson.instruction);
    const shuffled = [...lesson.items].sort(() => Math.random() - 0.5);
    return `
      <div class="lesson-dragdrop">
        ${Mascot.render('thinking', 'medium', 'lesson-mascot')}
        <h2 class="lesson-dd-title">${this.X(lesson.title)}</h2>
        <div class="lesson-dd-instruction">${instruction}</div>
        <div class="dd-items" id="dd-items">
          ${shuffled.map(item => `
            <div class="dd-item" draggable="true" data-id="${item.id}" data-order="${item.order}">
              <i class="fas fa-grip-vertical"></i><span>${this.X(item.label)}</span>
            </div>`).join('')}
        </div>
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.checkDragDrop()">${t('checkAnswer') || 'Verificar'} <i class="fas fa-check"></i></button>
      </div>`;
  },

  initDragDrop() {
    const container = document.getElementById('dd-items');
    if (!container) return;
    let dragged = null;
    container.addEventListener('dragstart', e => { dragged = e.target.closest('.dd-item'); if (dragged) dragged.classList.add('dragging'); });
    container.addEventListener('dragend', () => { if (dragged) dragged.classList.remove('dragging'); dragged = null; });
    container.addEventListener('dragover', e => {
      e.preventDefault();
      const target = e.target.closest('.dd-item');
      if (target && target !== dragged) {
        const rect = target.getBoundingClientRect();
        const after = (e.clientY - rect.top) > rect.height / 2;
        container.insertBefore(dragged, after ? target.nextSibling : target);
      }
    });
    let touchDragging = null;
    container.querySelectorAll('.dd-item').forEach(item => {
      item.addEventListener('touchstart', () => { touchDragging = item; item.classList.add('dragging'); }, { passive: true });
      item.addEventListener('touchmove', e => {
        if (!touchDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.dd-item');
        if (target && target !== touchDragging) {
          const rect = target.getBoundingClientRect();
          const after = (touch.clientY - rect.top) > rect.height / 2;
          container.insertBefore(touchDragging, after ? target.nextSibling : target);
        }
      }, { passive: false });
      item.addEventListener('touchend', () => { if (touchDragging) touchDragging.classList.remove('dragging'); touchDragging = null; });
    });
  },

  checkDragDrop() {
    const items = [...document.querySelectorAll('#dd-items .dd-item')];
    let correct = true;
    items.forEach((el, idx) => {
      const ok = (idx + 1) === parseInt(el.dataset.order, 10);
      el.classList.remove('correct', 'wrong');
      el.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) correct = false;
    });
    const content = document.getElementById('lesson-content');
    const banner = document.createElement('div');
    banner.className = `quiz-feedback ${correct ? 'correct' : 'wrong'}`;
    banner.innerHTML = `
      <div class="qf-row">
        ${Mascot.render(correct ? 'celebrate' : 'shy', 'small')}
        <div class="qf-text">
          <div class="qf-status">${correct ? '<i class="fas fa-circle-check"></i> ' + (t('correct') || '¡Perfecto!') : '<i class="fas fa-lightbulb"></i> ' + (t('tryAgain') || 'Vuelve a intentarlo')}</div>
          <div class="qf-explanation">${correct ? (t('orderCorrect') || 'Has ordenado correctamente.') : (t('orderWrong') || 'Casi. Reordena las piezas marcadas.')}</div>
        </div>
      </div>
      ${correct
        ? `<button class="btn-primary" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>`
        : `<button class="btn-primary" onclick="this.closest('.quiz-feedback').remove()">${t('cxReset') || 'Reintentar'}</button>`}`;
    content.appendChild(banner);
    if (correct && this.state) this.state.correctAnswers++;
    if (navigator.vibrate) navigator.vibrate(correct ? 50 : [100, 50, 100]);
    banner.scrollIntoView({ behavior: 'smooth', block: 'end' });
  },

  // ----- Prayer / Wudu step (how_to_pray usa 'card'; salah/wudu completos usan estos) -----
  render_prayer_step(lesson) {
    const title = this.X(lesson.title);
    const description = this.fmtContent(lesson.description);
    const tip = lesson.tip ? this.fmtContent(lesson.tip) : '';
    const dhikrTrans = lesson.dhikr ? this.X(lesson.dhikr.translation) : '';
    const second = lesson.secondDhikr;
    return `
      <div class="prayer-step-lesson">
        <div class="ps-step-badge">${lesson.stepNumber || ''}</div>
        <h2 class="ps-title">${title}</h2>
        <div class="ps-image-wrap"><picture>
          <source srcset="assets/prayer/${lesson.image}.webp" type="image/webp">
          <img src="assets/prayer/${lesson.image}.png" alt="${escapeHtml(title)}" class="ps-image" loading="lazy" onerror="this.style.display='none'">
        </picture></div>
        <div class="ps-description">${description}</div>
        ${lesson.dhikr ? `
          <div class="ps-dhikr-card">
            <div class="ps-dhikr-label"><i class="fas fa-scroll"></i> ${t('whatToSay') || 'Qué decir'}</div>
            <div class="ps-dhikr-arabic" dir="rtl">${lesson.dhikr.arabic}</div>
            <div class="ps-dhikr-translit"><i class="fas fa-volume-high"></i> ${lesson.dhikr.translit}</div>
            <div class="ps-dhikr-translation">«${dhikrTrans}»</div>
          </div>` : ''}
        ${second ? `
          <div class="ps-dhikr-card ps-dhikr-secondary">
            <div class="ps-dhikr-label">${t('thenSay') || 'Luego di'}</div>
            <div class="ps-dhikr-arabic" dir="rtl">${second.arabic}</div>
            <div class="ps-dhikr-translit"><i class="fas fa-volume-high"></i> ${second.translit}</div>
            <div class="ps-dhikr-translation">«${this.X(second.translation)}»</div>
          </div>` : ''}
        ${tip ? `<div class="ps-tip">${tip}</div>` : ''}
        ${lesson.source ? `<div class="lesson-source"><i class="fas fa-book"></i> ${this.X(lesson.source)}</div>` : ''}
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('nextStep') || 'Siguiente paso'} →</button>
      </div>`;
  },

  render_wudu_step(lesson) {
    const title = this.X(lesson.title) || '';
    const description = this.X(lesson.description) || '';
    const hadith = lesson.hadith || '';
    const lang = this.lang();
    let hadithTrans = lesson[`hadith_translation_${lang}`] || lesson.hadith_translation_es || lesson.hadith_translation_en || '';
    let dhikrMeaning = lesson[`dhikr_meaning_${lang}`] || lesson.dhikr_meaning_es || lesson.dhikr_meaning_en || '';
    return `
      <div class="prayer-step-lesson wudu-step-lesson">
        <div class="ps-step-badge" style="background:linear-gradient(135deg,#42A5F5,#1976D2);">${lesson.number || ''}</div>
        <h2 class="ps-title">${escapeHtml(title)}</h2>
        <div class="ps-image-wrap"><picture>
          <source srcset="assets/wudu/${lesson.image}.webp" type="image/webp">
          <img src="assets/wudu/${lesson.image}.png" alt="${escapeHtml(title)}" class="ps-image" loading="lazy" onerror="this.style.display='none'">
        </picture></div>
        ${description ? `<div class="ps-description" style="white-space:pre-line;">${escapeHtml(description)}</div>` : ''}
        ${lesson.dhikr ? `
          <div class="ps-dhikr-card">
            <div class="ps-dhikr-label"><i class="fas fa-scroll"></i> ${t('whatToSay') || 'Qué decir'}</div>
            <div class="ps-dhikr-arabic" dir="rtl">${escapeHtml(lesson.dhikr)}</div>
            ${lesson.dhikr_translit ? `<div class="ps-dhikr-translit"><i class="fas fa-volume-high"></i> ${escapeHtml(lesson.dhikr_translit)}</div>` : ''}
            ${dhikrMeaning ? `<div class="ps-dhikr-translation">«${escapeHtml(dhikrMeaning)}»</div>` : ''}
          </div>` : ''}
        ${hadith ? `
          <div class="ps-hadith-card">
            <div class="ps-hadith-label"><i class="fas fa-book-open-reader"></i> ${t('hadith') || 'Hadiz'}</div>
            <div class="ps-hadith-text">${escapeHtml(hadith)}</div>
            ${hadithTrans ? `<div class="ps-hadith-trans">«${escapeHtml(hadithTrans)}»</div>` : ''}
          </div>` : ''}
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('nextStep') || 'Siguiente paso'} →</button>
      </div>`;
  },
};

// Pequeño atajo trilingüe local a este archivo (independiente de ArabicItems).
function T_(es, ar, en) { return { es, ar, en }; }

if (typeof window !== 'undefined') window.CoursesPage = CoursesPage;
if (typeof module !== 'undefined') module.exports = CoursesPage;
