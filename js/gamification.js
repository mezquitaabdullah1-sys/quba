// 🏆 Sistema de gamificación: XP, niveles, rachas, vidas, logros
// v1.0.152: auditoría del sistema de premios — niveles renombrados y sin duplicados,
// logros de cursos que faltaban (se mostraban como id crudo), umbrales correctos,
// mensajes sin HTML crudo, y progreso por logro para la pantalla de medallas.

const Gamification = {
  // Configuración de XP
  XP_PER_CORRECT: 10,
  XP_CORRECT_ANSWER: 10,        // alias for quiz.js compatibility
  XP_PER_WRONG: 0,
  XP_BONUS_STREAK: 5,           // bonus por cada respuesta correcta consecutiva
  XP_BONUS_NO_MISTAKES: 50,     // bonus al terminar sin fallos
  XP_PER_LESSON: 25,            // por completar lección de curso
  XP_PER_TASBIH_100: 20,        // 100 conteos del tasbih
  XP_PER_ADHKAR_SET: 30,        // por completar un set de adhkar
  XP_PER_ADHKAR_CARD: 2,        // v1.0.151: por cada dhikr completado
  XP_PER_DAILY_TASK: 15,        // v1.0.151: por cada tarea diaria de la portada
  XP_BONUS_ALL_TASKS: 25,       // v1.0.151: al completar las 5 tareas del día

  // Totales reales de la app — los logros de "todo completado" se miden contra esto,
  // no contra un 4/3 obsoleto que los desbloqueaba a la mitad.
  TOTAL_ADHKAR_SETS: 13,
  TOTAL_COURSES: 9,
  TOTAL_BADGES: 21,

  // Sistema de vidas
  MAX_LIVES: 5,
  LIFE_REGEN_MINUTES: 30,       // 1 vida cada 30 minutos

  // Niveles (umbral acumulativo de XP)
  // v1.0.152: nombres sin duplicados y sin palabras árabes sueltas en español.
  LEVELS: [
    { level: 1, xp: 0, name: { es: 'Iniciado', ar: 'مبتدئ', en: 'Initiate' }, icon: '<i class="fas fa-seedling"></i>', emoji: '🌱', color: '#4CAF50' },
    { level: 2, xp: 50, name: { es: 'Buscador', ar: 'باحث', en: 'Seeker' }, icon: '<i class="fas fa-leaf"></i>', emoji: '🌿', color: '#66BB6A' },
    { level: 3, xp: 150, name: { es: 'Estudiante', ar: 'طالب', en: 'Student' }, icon: '<i class="fas fa-book-open"></i>', emoji: '📖', color: '#8BC34A' },
    { level: 4, xp: 300, name: { es: 'Aprendiz', ar: 'متعلّم', en: 'Learner' }, icon: '<i class="fas fa-graduation-cap"></i>', emoji: '🎓', color: '#9CCC65' },
    { level: 5, xp: 500, name: { es: 'Conocedor', ar: 'عارف', en: 'Knowledgeable' }, icon: '<i class="fas fa-lightbulb"></i>', emoji: '💡', color: '#FFA726' },
    { level: 6, xp: 750, name: { es: 'Sabio', ar: 'حكيم', en: 'Wise' }, icon: '<i class="fas fa-star"></i>', emoji: '⭐', color: '#FFB74D' },
    { level: 7, xp: 1000, name: { es: 'Maestro', ar: 'معلّم', en: 'Master' }, icon: '<i class="fas fa-medal"></i>', emoji: '🏅', color: '#FF7043' },
    { level: 8, xp: 1500, name: { es: 'Erudito', ar: 'عالم', en: 'Scholar' }, icon: '<i class="fas fa-mosque"></i>', emoji: '🕌', color: '#D4AF37' },
    { level: 9, xp: 2500, name: { es: 'Sabio mayor', ar: 'عَلَم', en: 'Luminary' }, icon: '<i class="fas fa-gem"></i>', emoji: '💎', color: '#FFD700' },
    { level: 10, xp: 5000, name: { es: 'Imán', ar: 'إمام', en: 'Imam' }, icon: '<i class="fas fa-moon"></i>', emoji: '🌙', color: '#9C27B0' },
  ],

  // Logros disponibles (21)
  ACHIEVEMENTS: [
    { id: 'first_quiz', name: { es: 'Primer paso', ar: 'الخطوة الأولى', en: 'First step' }, desc: { es: 'Completa tu primer quiz', ar: 'أكمل أول اختبار لك', en: 'Complete your first quiz' }, icon: '<i class="fas fa-bullseye"></i>' },
    { id: 'perfect_quiz', name: { es: 'Perfección', ar: 'الكمال', en: 'Perfection' }, desc: { es: 'Quiz sin errores', ar: 'اختبار بلا أخطاء', en: 'Quiz with no mistakes' }, icon: '<i class="fas fa-award"></i>' },
    { id: 'streak_3', name: { es: 'Racha de 3', ar: 'سلسلة ٣ أيام', en: '3-day streak' }, desc: { es: '3 días consecutivos activos', ar: '٣ أيام متتالية من النشاط', en: '3 consecutive active days' }, icon: '<i class="fas fa-fire"></i>' },
    { id: 'streak_7', name: { es: 'Semana espiritual', ar: 'أسبوع روحي', en: 'Spiritual week' }, desc: { es: '7 días consecutivos', ar: '٧ أيام متتالية', en: '7 consecutive days' }, icon: '<i class="fas fa-fire-flame-curved"></i>' },
    { id: 'streak_30', name: { es: 'Mes constante', ar: 'شهر من الثبات', en: 'Steady month' }, desc: { es: '30 días consecutivos', ar: '٣٠ يوماً متتالياً', en: '30 consecutive days' }, icon: '<i class="fas fa-fire-flame-simple"></i>' },
    { id: 'quran_master', name: { es: 'Maestro del Corán', ar: 'أستاذ القرآن', en: 'Quran Master' }, desc: { es: '50 respuestas correctas en Corán', ar: '٥٠ إجابة صحيحة في القرآن', en: '50 correct answers in Quran' }, icon: '<i class="fas fa-book-open-reader"></i>' },
    { id: 'sira_lover', name: { es: 'Conocedor de la Sira', ar: 'عاشق السيرة', en: 'Sira lover' }, desc: { es: '50 correctas en Sira', ar: '٥٠ إجابة صحيحة في السيرة', en: '50 correct answers in Sira' }, icon: '<i class="fas fa-mosque"></i>' },
    { id: 'hadith_scholar', name: { es: 'Estudioso del Hadiz', ar: 'باحث الحديث', en: 'Hadith scholar' }, desc: { es: '50 correctas en Hadiz', ar: '٥٠ إجابة صحيحة في الحديث', en: '50 correct answers in Hadith' }, icon: '<i class="fas fa-scroll"></i>' },
    { id: 'fiqh_jurist', name: { es: 'Jurista', ar: 'فقيه', en: 'Jurist' }, desc: { es: '50 correctas en Fiqh', ar: '٥٠ إجابة صحيحة في الفقه', en: '50 correct answers in Fiqh' }, icon: '<i class="fas fa-scale-balanced"></i>' },
    { id: 'history_buff', name: { es: 'Historiador', ar: 'مؤرخ', en: 'Historian' }, desc: { es: '50 correctas en Historia', ar: '٥٠ إجابة صحيحة في التاريخ', en: '50 correct answers in History' }, icon: '<i class="fas fa-moon"></i>' },
    { id: 'prophet_friend', name: { es: 'Amigo de los Profetas', ar: 'صديق الأنبياء', en: 'Friend of the Prophets' }, desc: { es: '50 correctas en Profetas', ar: '٥٠ إجابة صحيحة في الأنبياء', en: '50 correct answers in Prophets' }, icon: '<i class="fas fa-user"></i>' },
    { id: 'tasbih_1000', name: { es: 'Mil dhikrs', ar: 'ألف ذكر', en: 'A thousand dhikrs' }, desc: { es: '1000 conteos en el tasbih', ar: '١٠٠٠ تسبيحة في المسبحة الرقمية', en: '1000 counts on the tasbih' }, icon: '<i class="fas fa-circle-nodes"></i>' },
    { id: 'all_adhkar', name: { es: 'Devoto del dhikr', ar: 'مواظب على الذكر', en: 'Dhikr devotee' }, desc: { es: 'Completa las 13 colecciones de adhkar', ar: 'أكمل مجموعات الأذكار الـ١٣', en: 'Complete all 13 adhkar collections' }, icon: '<i class="fas fa-hands-praying"></i>' },
    { id: 'first_course', name: { es: 'Aprendiz curioso', ar: 'متعلم فضولي', en: 'Curious learner' }, desc: { es: 'Completa tu primer curso', ar: 'أكمل أول دورة لك', en: 'Complete your first course' }, icon: '<i class="fas fa-graduation-cap"></i>' },
    { id: 'all_courses', name: { es: 'Erudito completo', ar: 'عالم شامل', en: 'Complete scholar' }, desc: { es: 'Completa los 9 cursos', ar: 'أكمل الدورات التسع', en: 'Complete all 9 courses' }, icon: '<i class="fas fa-crown"></i>' },
    { id: 'level_5', name: { es: 'Conocedor', ar: 'عارف', en: 'Knowledgeable' }, desc: { es: 'Alcanza el nivel 5', ar: 'اصل إلى المستوى ٥', en: 'Reach level 5' }, icon: '<i class="fas fa-star"></i>' },
    { id: 'level_10', name: { es: 'Imán', ar: 'إمام', en: 'Imam' }, desc: { es: 'Alcanza el nivel 10', ar: 'اصل إلى المستوى ١٠', en: 'Reach level 10' }, icon: '<i class="fas fa-moon"></i>' },
    { id: 'xp_1000', name: { es: 'Mil XP', ar: 'ألف نقطة', en: 'A thousand XP' }, desc: { es: 'Acumula 1000 XP', ar: 'اجمع ١٠٠٠ نقطة خبرة', en: 'Accumulate 1000 XP' }, icon: '<i class="fas fa-bolt"></i>' },
    // v1.0.152: estos tres los concedían los cursos sin estar definidos:
    // se desbloqueaban en silencio y en la lista aparecía el id crudo ("cx_gold_cert").
    { id: 'cx_flawless_station', name: { es: 'Estación perfecta', ar: 'محطة بلا خطأ', en: 'Flawless station' }, desc: { es: 'Termina una estación sin un solo error', ar: 'أكمل محطة دون خطأ واحد', en: 'Finish a station with no mistakes' }, icon: '<i class="fas fa-bullseye"></i>' },
    { id: 'cx_gold_cert', name: { es: 'Certificado de oro', ar: 'شهادة ذهبية', en: 'Gold certificate' }, desc: { es: 'Obtén un certificado de nivel oro', ar: 'احصل على شهادة بالمستوى الذهبي', en: 'Earn a gold-tier certificate' }, icon: '<i class="fas fa-certificate"></i>' },
    { id: 'cx_review_7', name: { es: 'Repaso constante', ar: 'مراجع مواظب', en: 'Steady reviewer' }, desc: { es: 'Repasa 7 días seguidos', ar: 'راجع ٧ أيام متتالية', en: 'Review 7 days in a row' }, icon: '<i class="fas fa-arrows-rotate"></i>' },
  ],

  /** Quita el HTML de un icono para los mensajes de texto plano (showToast usa textContent). */
  _plain(icon) {
    return String(icon || '').replace(/<[^>]*>/g, '').trim();
  },

  /** Icono seguro para toasts: emoji si existe, si no texto sin etiquetas. */
  _iconOf(item) {
    if (!item) return '';
    return item.emoji || this._plain(item.icon) || '🏅';
  },

  // ============ Estado ============
  getState() {
    const def = {
      xp: 0, level: 1, lives: this.MAX_LIVES, lastLifeRegenTime: Date.now(),
      streak: 0, lastActiveDay: null, achievements: [],
      stats: {
        quizzesCompleted: 0, questionsAnswered: 0, correctAnswers: 0,
        coursesCompleted: [], adhkarCompleted: [], tasbihCount: 0,
        categoryStats: {
          quran: { correct: 0, total: 0 }, sira: { correct: 0, total: 0 },
          hadith: { correct: 0, total: 0 }, fiqh: { correct: 0, total: 0 },
          history: { correct: 0, total: 0 }, prophets: { correct: 0, total: 0 },
        },
      },
    };
    let st = Storage.get('gamification');
    if (!st || typeof st !== 'object' || Array.isArray(st)) st = def;
    // v1.0.151: ترحيل دفاعي — حفظ قديم ناقص كان يجعل addXP يرمي استثناء
    // فيبقى العدّاد ثابتًا («النقاط لا تُحتسب») أو يضيع الإنجاز.
    if (typeof st.xp !== 'number' || isNaN(st.xp)) st.xp = 0;
    if (typeof st.streak !== 'number' || isNaN(st.streak)) st.streak = 0;
    if (!Array.isArray(st.achievements)) st.achievements = [];
    if (!st.stats || typeof st.stats !== 'object') st.stats = def.stats;
    const d = st.stats;
    if (!Array.isArray(d.coursesCompleted)) d.coursesCompleted = [];
    if (!Array.isArray(d.adhkarCompleted)) d.adhkarCompleted = [];
    if (typeof d.tasbihCount !== 'number' || isNaN(d.tasbihCount)) d.tasbihCount = 0;
    if (typeof d.questionsAnswered !== 'number' || isNaN(d.questionsAnswered)) d.questionsAnswered = 0;
    if (typeof d.correctAnswers !== 'number' || isNaN(d.correctAnswers)) d.correctAnswers = 0;
    if (typeof d.quizzesCompleted !== 'number' || isNaN(d.quizzesCompleted)) d.quizzesCompleted = 0;
    if (!d.categoryStats || typeof d.categoryStats !== 'object') d.categoryStats = def.stats.categoryStats;
    return st;
  },

  saveState(state) {
    Storage.set('gamification', state);
  },

  // ============ XP y niveles ============
  addXP(amount) {
    const state = this.getState();
    const oldLevel = this.getLevelInfo(state.xp).level;
    const add = Number(amount);
    if (!add || isNaN(add) || add <= 0) {
      return { newLevel: oldLevel, oldLevel, leveledUp: false, added: 0 };
    }
    state.xp += Math.round(add);
    const newLevel = this.getLevelInfo(state.xp).level;
    this.saveState(state);

    // Detectar level up
    if (newLevel > oldLevel) {
      this.onLevelUp(newLevel, oldLevel);
    }

    // Detectar logros por XP
    if (state.xp >= 1000 && !state.achievements.includes('xp_1000')) {
      this.unlockAchievement('xp_1000');
    }
    if (newLevel >= 5 && !state.achievements.includes('level_5')) {
      this.unlockAchievement('level_5');
    }
    if (newLevel >= 10 && !state.achievements.includes('level_10')) {
      this.unlockAchievement('level_10');
    }

    return { newLevel, oldLevel, leveledUp: newLevel > oldLevel, added: Math.round(add) };
  },

  // ============ v1.0.151: احتساب نقاط المهام (مرّة واحدة يوميًا) ============
  _dailyXpKey() { return 'quba_xp_daily_' + this._dayKey(); },

  awardOnce(scope, id, amount) {
    const add = Math.round(Number(amount) || 0);
    if (add <= 0) return 0;
    const key = this._dailyXpKey();
    let led = Storage.get(key);
    if (!led || typeof led !== 'object' || Array.isArray(led)) led = { ids: [], xp: 0 };
    if (!Array.isArray(led.ids)) led.ids = [];
    if (typeof led.xp !== 'number' || isNaN(led.xp)) led.xp = 0;
    const tag = String(scope) + ':' + String(id);
    if (led.ids.indexOf(tag) !== -1) return 0;
    led.ids.push(tag);
    led.xp += add;
    Storage.set(key, led);
    this.addXP(add);
    return add;
  },

  getTodayXp() {
    const led = Storage.get(this._dailyXpKey());
    return (led && typeof led.xp === 'number') ? led.xp : 0;
  },

  getLevelInfo(xp) {
    const safeXp = (typeof xp === 'number' && !isNaN(xp)) ? xp : 0;
    let current = this.LEVELS[0];
    let next = this.LEVELS[1];
    for (let i = 0; i < this.LEVELS.length; i++) {
      if (safeXp >= this.LEVELS[i].xp) {
        current = this.LEVELS[i];
        next = this.LEVELS[i + 1] || null;
      }
    }
    const progress = next ? (safeXp - current.xp) / (next.xp - current.xp) : 1;
    return {
      ...current,
      next,
      progress: Math.min(1, Math.max(0, progress)),
      xpInLevel: safeXp - current.xp,
      xpForNext: next ? next.xp - current.xp : 0,
      xpRemaining: next ? Math.max(0, next.xp - safeXp) : 0,
    };
  },

  onLevelUp(newLevel, oldLevel) {
    const lvl = this.LEVELS[newLevel - 1];
    if (!lvl) return;
    // v1.0.152: antes el toast recibía el icono HTML y showToast usa textContent,
    // así que el usuario leía literalmente «<i class="fas fa-star"></i>».
    if (typeof LevelUpShow === 'function') {
      LevelUpShow(newLevel, oldLevel);
      return;
    }
    const name = typeof L === 'function' ? L(lvl.name) : (lvl.name?.es || lvl.name);
    const lbl = (typeof t === 'function' ? t('level') : '') || 'Nivel';
    if (typeof showToast === 'function') showToast(`${this._iconOf(lvl)} ${lbl} ${newLevel}: ${name}`, 4000);
  },

  // ============ niveles para la pantalla de medallas ============
  getLevelsWithState() {
    const state = this.getState();
    const current = this.getLevelInfo(state.xp).level;
    return this.LEVELS.map(l => ({
      ...l,
      unlocked: current >= l.level,
      isCurrent: current === l.level,
      xpMissing: Math.max(0, l.xp - state.xp),
    }));
  },

  // ============ Vidas ============
  getLives() {
    const state = this.getState();
    const elapsedMs = Date.now() - (state.lastLifeRegenTime || Date.now());
    const elapsedMin = Math.floor(elapsedMs / 60000);
    if (elapsedMin >= this.LIFE_REGEN_MINUTES && state.lives < this.MAX_LIVES) {
      const livesToAdd = Math.min(
        Math.floor(elapsedMin / this.LIFE_REGEN_MINUTES),
        this.MAX_LIVES - state.lives
      );
      state.lives += livesToAdd;
      state.lastLifeRegenTime = Date.now();
      this.saveState(state);
    }
    return state.lives;
  },

  // v12: lives system disabled — unlimited play, XP always preserved
  loseLife() {
    const state = this.getState();
    return state.lives;
  },

  getMinutesToNextLife() {
    const state = this.getState();
    if (state.lives >= this.MAX_LIVES) return 0;
    const elapsedMs = Date.now() - state.lastLifeRegenTime;
    const elapsedMin = elapsedMs / 60000;
    const remaining = this.LIFE_REGEN_MINUTES - (elapsedMin % this.LIFE_REGEN_MINUTES);
    return Math.max(0, remaining);
  },

  // Aggregated stats for UI cards
  getStats() {
    const state = this.getState();
    const levelInfo = this.getLevelInfo(state.xp);
    return {
      xp: state.xp,
      level: levelInfo.level,
      lives: this.getLives(),
      streak: this.getStreak(),
      bestStreak: Math.max(state.bestStreak || 0, this.getStreak()),
      achievements: state.achievements || [],
      badgesTotal: this.TOTAL_BADGES,
      todayXp: this.getTodayXp(),
      totalAnswered: state.stats?.questionsAnswered || state.stats?.totalAnswered || 0,
      categoryStats: state.stats?.categoryStats || {},
    };
  },

  getProgressToNextLevel(xp) {
    const info = this.getLevelInfo(xp);
    if (!info.next) return 100;
    return Math.max(0, Math.min(100, Math.round(info.progress * 100)));
  },

  timeUntilNextLife() {
    const state = this.getState();
    if (state.lives >= this.MAX_LIVES) return 0;
    const elapsedMs = Date.now() - state.lastLifeRegenTime;
    const remainingMs = (this.LIFE_REGEN_MINUTES * 60000) - elapsedMs;
    return Math.max(0, remainingMs);
  },

  // ============ Racha (streak) ============
  _dayKey(d = new Date()) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  _yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return this._dayKey(d);
  },

  _normDay(v) {
    if (!v) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : this._dayKey(d);
  },

  getStreak() {
    const state = this.getState();
    const last = this._normDay(state.lastActiveDay);
    if (!last) return 0;
    if (last === this._dayKey() || last === this._yesterdayKey()) return state.streak || 1;
    return 0;
  },

  updateStreak() {
    const state = this.getState();
    const today = this._dayKey();
    const last = this._normDay(state.lastActiveDay);

    if (last === today) {
      if (!state.streak || state.streak < 1) { state.streak = 1; this.saveState(state); }
      return state.streak;
    }
    if (last === this._yesterdayKey()) {
      state.streak = (state.streak || 0) + 1;
    } else {
      state.streak = 1;
    }
    state.lastActiveDay = today;
    state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
    this.saveState(state);

    if (state.streak >= 3 && !state.achievements.includes('streak_3')) this.unlockAchievement('streak_3');
    if (state.streak >= 7 && !state.achievements.includes('streak_7')) this.unlockAchievement('streak_7');
    if (state.streak >= 30 && !state.achievements.includes('streak_30')) this.unlockAchievement('streak_30');

    try { window.dispatchEvent(new CustomEvent('quba-streak', { detail: state.streak })); } catch (e) {}
    return state.streak;
  },

  // ============ Logros ============
  unlockAchievement(achievementId) {
    const state = this.getState();
    if (state.achievements.includes(achievementId)) return false;
    state.achievements.push(achievementId);
    this.saveState(state);
    const ach = this.ACHIEVEMENTS.find(a => a.id === achievementId);
    if (ach) {
      if (typeof AchievementPopup === 'function') {
        AchievementPopup(ach);
      } else if (typeof showToast === 'function') {
        const achName = typeof L === 'function' ? L(ach.name) : (ach.name?.es || ach.name);
        const achLbl = (typeof t === 'function' ? t('achBadgeUnlocked') : '') || 'Logro';
        showToast(`${this._iconOf(ach)} ${achLbl}: ${achName}`, 4000);
      }
    }
    try { window.dispatchEvent(new CustomEvent('quba-achievement', { detail: { id: achievementId } })); } catch (e) {}
    return true;
  },

  // ============ Progreso por logro (para la galería de medallas) ============
  getAchievementProgress(id) {
    const s = this.getState();
    const st = s.stats || {};
    const cat = (k) => (st.categoryStats && st.categoryStats[k]) ? st.categoryStats[k].correct || 0 : 0;
    const lvl = this.getLevelInfo(s.xp).level;
    const has = s.achievements.includes(id);
    const map = {
      first_quiz: [st.quizzesCompleted || 0, 1],
      perfect_quiz: [has ? 1 : 0, 1],
      streak_3: [this.getStreak(), 3],
      streak_7: [this.getStreak(), 7],
      streak_30: [this.getStreak(), 30],
      quran_master: [cat('quran'), 50],
      sira_lover: [cat('sira'), 50],
      hadith_scholar: [cat('hadith'), 50],
      fiqh_jurist: [cat('fiqh'), 50],
      history_buff: [cat('history'), 50],
      prophet_friend: [cat('prophets'), 50],
      tasbih_1000: [st.tasbihCount || 0, 1000],
      all_adhkar: [(st.adhkarCompleted || []).length, this.TOTAL_ADHKAR_SETS],
      first_course: [(st.coursesCompleted || []).length, 1],
      all_courses: [(st.coursesCompleted || []).length, this.TOTAL_COURSES],
      level_5: [lvl, 5],
      level_10: [lvl, 10],
      xp_1000: [s.xp || 0, 1000],
      cx_flawless_station: [has ? 1 : 0, 1],
      cx_gold_cert: [has ? 1 : 0, 1],
      cx_review_7: [has ? 1 : 0, 1],
    };
    const [have, need] = map[id] || [has ? 1 : 0, 1];
    return {
      have: Math.min(have, need),
      need,
      pct: need ? Math.min(100, Math.round((have / need) * 100)) : 0,
      unlocked: has,
    };
  },

  // ============ Estadísticas por categoría ============
  recordQuizAnswer(category, isCorrect) {
    const state = this.getState();
    state.stats.questionsAnswered++;
    if (isCorrect) state.stats.correctAnswers++;
    if (state.stats.categoryStats[category]) {
      state.stats.categoryStats[category].total++;
      if (isCorrect) state.stats.categoryStats[category].correct++;
    }
    this.saveState(state);

    const catMap = {
      quran: 'quran_master',
      sira: 'sira_lover',
      hadith: 'hadith_scholar',
      fiqh: 'fiqh_jurist',
      history: 'history_buff',
      prophets: 'prophet_friend',
    };
    const achId = catMap[category];
    if (achId && state.stats.categoryStats[category].correct >= 50 && !state.achievements.includes(achId)) {
      this.unlockAchievement(achId);
    }
  },

  recordQuizCompleted(perfectScore = false) {
    const state = this.getState();
    state.stats.quizzesCompleted++;
    this.saveState(state);
    if (state.stats.quizzesCompleted === 1) {
      this.unlockAchievement('first_quiz');
    }
    if (perfectScore) {
      this.unlockAchievement('perfect_quiz');
    }
  },

  recordCourseCompleted(courseId) {
    const state = this.getState();
    if (!state.stats.coursesCompleted.includes(courseId)) {
      state.stats.coursesCompleted.push(courseId);
      this.saveState(state);
      if (state.stats.coursesCompleted.length === 1) {
        this.unlockAchievement('first_course');
      }
      // v1.0.152: antes se concedía con 3 de 9 cursos
      if (state.stats.coursesCompleted.length >= this.TOTAL_COURSES) {
        this.unlockAchievement('all_courses');
      }
    }
  },

  recordTasbihCount(count = 1) {
    const state = this.getState();
    state.stats.tasbihCount += count;
    this.saveState(state);
    if (state.stats.tasbihCount >= 1000) {
      this.unlockAchievement('tasbih_1000');
    }
  },

  recordAdhkarCompleted(setId) {
    const state = this.getState();
    if (!state.stats.adhkarCompleted.includes(setId)) {
      state.stats.adhkarCompleted.push(setId);
      this.saveState(state);
      // v1.0.152: antes 4 de 13
      if (state.stats.adhkarCompleted.length >= this.TOTAL_ADHKAR_SETS) {
        this.unlockAchievement('all_adhkar');
      }
    }
  },
};
