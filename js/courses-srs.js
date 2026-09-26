/**
 * 🔁 CoursesSRS — مراجعة يومية بالتكرار المتباعد (Leitner) + الهدف اليومي + تذكير بعد الصلاة
 * ─────────────────────────────────────────────────────────────────────────────
 * • تُضاف العناصر (letter:/word:/mark:) إلى المراجعة عند إتمام الدرس الذي يقدّمها.
 * • الصناديق 1..6 بفواصل [1، 2، 4، 7، 15، 30] يوماً. الخطأ يُرجع العنصر للصندوق 1.
 * • مراجعة اليوم (~10 أسئلة ≈ 3 دقائق) تُحدِّث الـstreak (Gamification.updateStreak).
 * • الهدف اليومي (10 دقائق) يُحسب من زمن الدروس الفعلي.
 * • التذكير: إشعار بعد صلاة يختارها المستخدم (+20 دقيقة) عبر PrayerNotifications.
 * التخزين: Storage.get('srs') — { items, days, reminder }.
 */
const CoursesSRS = {
  KEY: 'srs',
  INTERVALS: [0, 1, 2, 4, 7, 15, 30], // فهرس = رقم الصندوق
  SESSION_SIZE: 10,
  MIN_ITEMS: 3,
  REMINDER_OFFSET_MIN: 20,
  DEFAULT_GOAL_MIN: 10,

  // ── تاريخ محلي كرقم يوم ─────────────────────────────────────
  dayNum(d) {
    d = d || new Date();
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
  },
  dayKey(d) {
    d = d || new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  },

  _d() {
    let d = Storage.get(this.KEY);
    if (!d || typeof d !== 'object') d = {};
    if (!d.items) d.items = {};
    if (!d.days) d.days = {};
    if (!d.reminder) d.reminder = { on: false, prayer: 'Maghrib' };
    return d;
  },
  _save(d) {
    // نُبقي آخر 60 يوماً فقط من سجلّ الأيام
    const keys = Object.keys(d.days).sort();
    while (keys.length > 60) delete d.days[keys.shift()];
    Storage.set(this.KEY, d);
  },

  // ── العناصر ─────────────────────────────────────────────────
  learn(ids, box) {
    if (!ids || !ids.length) return 0;
    const d = this._d();
    const today = this.dayNum();
    let added = 0;
    ids.forEach(id => {
      if (!id || d.items[id]) return;
      const b = box || 1;
      d.items[id] = { box: b, due: today + (this.INTERVALS[b] || 1), seen: 0, lapses: 0, at: Date.now() };
      added++;
    });
    if (added) this._save(d);
    return added;
  },

  grade(id, ok, inReview) {
    if (!id) return;
    const d = this._d();
    const today = this.dayNum();
    let it = d.items[id];
    if (!it) it = d.items[id] = { box: 1, due: today, seen: 0, lapses: 0, at: Date.now() };
    it.seen++;
    if (ok) {
      it.box = Math.min(6, (it.box || 1) + (inReview ? 1 : 0));
      it.due = today + this.INTERVALS[it.box];
    } else {
      it.box = 1;
      it.lapses = (it.lapses || 0) + 1;
      it.due = inReview ? today + 1 : today; // الخطأ في درس يظهر في مراجعة اليوم
    }
    this._save(d);
  },

  count() { return Object.keys(this._d().items).length; },
  hasEnough() { return this.count() >= this.MIN_ITEMS; },

  dueIds() {
    const d = this._d();
    const today = this.dayNum();
    return Object.keys(d.items)
      .filter(id => d.items[id].due <= today)
      .sort((a, b) => (d.items[a].box - d.items[b].box) || (d.items[a].due - d.items[b].due));
  },
  dueCount() { return this.dueIds().length; },

  /** جلسة مراجعة: المستحقّ أولاً ثم الأضعف/الأقدم لإكمال العدد */
  sessionIds(n) {
    n = n || this.SESSION_SIZE;
    const d = this._d();
    const due = this.dueIds();
    let ids = due.slice(0, n);
    let extra = 0;
    if (ids.length < n) {
      const rest = Object.keys(d.items)
        .filter(id => ids.indexOf(id) < 0)
        .sort((a, b) => (d.items[a].box - d.items[b].box) || (d.items[a].at - d.items[b].at));
      const fill = rest.slice(0, n - ids.length);
      extra = fill.length;
      ids = ids.concat(fill);
    }
    return { ids, dueCount: due.length, extra };
  },

  // ── اليوم: المراجعة والزمن والهدف ─────────────────────────────
  _day(d, key) {
    key = key || this.dayKey();
    if (!d.days[key]) d.days[key] = { sec: 0, reviews: 0, goalHit: false };
    return d.days[key];
  },
  reviewDoneToday() { const d = this._d(); const x = d.days[this.dayKey()]; return !!(x && x.reviews > 0); },
  totalReviewDays() { const d = this._d(); return Object.keys(d.days).filter(k => d.days[k].reviews > 0).length; },
  todaySeconds() { const d = this._d(); const x = d.days[this.dayKey()]; return x ? x.sec : 0; },
  goalMinutes(course) { return (course && course.dailyGoalMin) || this.DEFAULT_GOAL_MIN; },

  /** يضيف ثواني دراسة؛ يُرجع true إن تحقّق الهدف اليومي للتوّ */
  addSeconds(sec, goalMin) {
    sec = Math.max(0, Math.min(150, Math.round(sec || 0)));
    if (!sec) return false;
    const d = this._d();
    const x = this._day(d);
    x.sec += sec;
    let hit = false;
    if (!x.goalHit && x.sec >= (goalMin || this.DEFAULT_GOAL_MIN) * 60) { x.goalHit = true; hit = true; }
    this._save(d);
    return hit;
  },

  markReviewDone() {
    const d = this._d();
    const x = this._day(d);
    x.reviews = (x.reviews || 0) + 1;
    this._save(d);
    return x.reviews;
  },

  // ── تذكير بعد الصلاة ────────────────────────────────────────
  reminderConfig() {
    const r = this._d().reminder;
    return { on: !!r.on, prayer: r.prayer || 'Maghrib', offsetMin: this.REMINDER_OFFSET_MIN };
  },
  setReminder(on, prayer) {
    const d = this._d();
    d.reminder = { on: !!on, prayer: prayer || d.reminder.prayer || 'Maghrib' };
    this._save(d);
    this.reschedule();
  },
  reschedule() {
    try {
      if (typeof PrayerNotifications !== 'undefined' && typeof AppState !== 'undefined' && AppState.timings) {
        PrayerNotifications.scheduleDay(AppState.timings, (AppState.settings && AppState.settings.locale) || 'es');
      }
    } catch (e) { /* noop */ }
  },
  /** يُستدعى عند حلول الوقت: لا يُزعج من راجع اليوم أو لم يتعلّم شيئاً بعد */
  fireReminder() {
    try {
      if (this.reviewDoneToday() || !this.hasEnough()) return;
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const n = new Notification(t('cxRemindNotifTitle'), { body: t('cxRemindNotifBody'), icon: 'assets/courses/arabic/icon.png', tag: 'quba-review' });
      n.onclick = () => {
        try { window.focus(); if (typeof Router !== 'undefined') Router.go('wisdom/courses', { review: 1 }); } catch (e) { /* noop */ }
        n.close();
      };
    } catch (e) { /* noop */ }
  },
};

if (typeof window !== 'undefined') window.CoursesSRS = CoursesSRS;
if (typeof module !== 'undefined') module.exports = CoursesSRS;
