// ✅ DailyTracker — نظام تتبع العبادات والأعمال اليومية (v128)
// يخزّن محليًا فقط: { "YYYY-MM-DD": { ids: {fajr:1,...} } }
// النقاط تُحسب حيًّا من قائمة ITEMS، فلا تتعارض مع تحديث القائمة لاحقًا.
const DailyTracker = {
  KEY: 'quba_daily_v1',
  MIN_DAY_PCT: 0.6,   // نسبة اليوم المحسوب «مكتملًا» لسلسلة المواظبة

  ITEMS: [
    // الصلوات الخمس
    { id: 'fajr',    cat: 'prayers', pts: 10, ic: 'cloud-moon' },
    { id: 'dhuhr',   cat: 'prayers', pts: 10, ic: 'sun' },
    { id: 'asr',     cat: 'prayers', pts: 10, ic: 'cloud-sun' },
    { id: 'maghrib', cat: 'prayers', pts: 10, ic: 'cloud-moon-rain' },
    { id: 'isha',    cat: 'prayers', pts: 10, ic: 'moon' },
    // السنن والنوافل
    { id: 'jamaa',   cat: 'sunan', pts: 10, ic: 'users' },
    { id: 'rawatib', cat: 'sunan', pts: 5,  ic: 'plus' },
    { id: 'witr',    cat: 'sunan', pts: 5,  ic: 'star' },
    { id: 'duha',    cat: 'sunan', pts: 5,  ic: 'sun-plant-wilt' },
    { id: 'tahajjud',cat: 'sunan', pts: 8,  ic: 'moon' },
    // القرآن والذكر
    { id: 'quran',   cat: 'dhikr', pts: 10, ic: 'book-open' },
    { id: 'morning', cat: 'dhikr', pts: 5,  ic: 'sun' },
    { id: 'evening', cat: 'dhikr', pts: 5,  ic: 'moon' },
    { id: 'afterprayer', cat: 'dhikr', pts: 5, ic: 'hands-praying' },
    { id: 'tasbih',  cat: 'dhikr', pts: 5,  ic: 'fingerprint' },
    { id: 'istighfar', cat: 'dhikr', pts: 5, ic: 'heart' },
    { id: 'salawat', cat: 'dhikr', pts: 5,  ic: 'seedling' },
    // الخير
    { id: 'sadaqah', cat: 'khayr', pts: 5,  ic: 'hand-holding-heart' },
    { id: 'fasting', cat: 'khayr', pts: 10, ic: 'moon' },
    { id: 'parents', cat: 'khayr', pts: 5,  ic: 'people-roof' },
    { id: 'knowledge', cat: 'khayr', pts: 5, ic: 'graduation-cap' }
  ],

  CATS: ['prayers', 'sunan', 'dhikr', 'khayr'],

  dayKey(d) {
    const x = d || new Date();
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  },

  _all() {
    try {
      if (typeof Storage !== 'undefined' && Storage.get) return Storage.get(this.KEY) || {};
      return JSON.parse(localStorage.getItem(this.KEY) || '{}');
    } catch (e) { return {}; }
  },

  _save(all) {
    try {
      if (typeof Storage !== 'undefined' && Storage.set) Storage.set(this.KEY, all);
      else localStorage.setItem(this.KEY, JSON.stringify(all));
    } catch (e) {}
  },

  rec(key) {
    const all = this._all();
    return (all[key || this.dayKey()] || { ids: {} });
  },

  ids(key) {
    const r = this.rec(key);
    return (r && r.ids) || {};
  },

  isDone(id, key) { return !!this.ids(key)[id]; },

  // تبديل حالة عمل — يعيد الحالة الجديدة
  toggle(id, key) {
    if (!this.ITEMS.some(i => i.id === id)) return false;
    const k = key || this.dayKey();
    const all = this._all();
    const day = all[k] || { ids: {} };
    day.ids = day.ids || {};
    if (day.ids[id]) delete day.ids[id];
    else day.ids[id] = 1;
    day.updated = Date.now();
    all[k] = day;
    this._save(all);
    return !!day.ids[id];
  },

  // تعليم تلقائي (لا يمسح ما علّمه المستخدم)
  autoMark(id, key) {
    if (this.isDone(id, key)) return;
    this.toggle(id, key);
  },

  // تزامن الصلوات مع سجل الصلوات الموجود في التطبيق
  syncPrayers(key) {
    try {
      if (typeof PrayerTracker === 'undefined' || !PrayerTracker.isDone) return;
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(id => {
        const name = id.charAt(0).toUpperCase() + id.slice(1);
        if (PrayerTracker.isDone(name)) this.autoMark(id, key);
      });
    } catch (e) {}
  },

  itemsOf(cat) { return this.ITEMS.filter(i => i.cat === cat); },

  pts(key) {
    const ids = this.ids(key);
    return this.ITEMS.reduce((s, i) => s + (ids[i.id] ? i.pts : 0), 0);
  },

  maxPts() { return this.ITEMS.reduce((s, i) => s + i.pts, 0); },

  doneCount(key) {
    const ids = this.ids(key);
    return this.ITEMS.filter(i => ids[i.id]).length;
  },

  pct(key) {
    return Math.round((this.doneCount(key) / this.ITEMS.length) * 100);
  },

  // سلسلة المواظبة: أيام متتالية حققت 60% أو أكثر، تنتهي اليوم أو أمس
  streak() {
    let n = 0;
    const d = new Date();
    if (this.pct(this.dayKey(d)) < this.MIN_DAY_PCT * 100) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) {
      if (this.pct(this.dayKey(d)) >= this.MIN_DAY_PCT * 100) { n++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return n;
  },

  longestStreak() {
    const all = this._all();
    const keys = Object.keys(all).sort();
    let best = 0, run = 0, prev = null;
    keys.forEach(k => {
      if (this.pct(k) < this.MIN_DAY_PCT * 100) { run = 0; prev = k; return; }
      if (prev) {
        const gap = (new Date(k) - new Date(prev)) / 86400000;
        run = (gap === 1) ? run + 1 : 1;
      } else run = 1;
      prev = k;
      if (run > best) best = run;
    });
    return best;
  },

  // آخر n يومًا (الأقدم أولًا): [{key, pct, pts, done}]
  lastDays(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = this.dayKey(d);
      out.push({ key: k, date: d, pct: this.pct(k), pts: this.pts(k), done: this.doneCount(k) });
    }
    return out;
  },

  // متوسط نسبة الإنجاز في آخر n يومًا (الأيام المسجّلة فقط)
  avgPct(n) {
    const days = this.lastDays(n || 30).filter(d => d.done > 0);
    if (!days.length) return 0;
    return Math.round(days.reduce((s, d) => s + d.pct, 0) / days.length);
  },

  loggedDays(n) { return this.lastDays(n || 30).filter(d => d.done > 0).length; },

  // عدد مرات إنجاز عمل خلال آخر n يومًا
  countItem(id, n) {
    let c = 0;
    this.lastDays(n || 30).forEach(d => { if (this.ids(d.key)[id]) c++; });
    return c;
  },

  // أكثر الأعمال مواظبةً في آخر n يومًا
  topItems(n, limit) {
    const arr = this.ITEMS.map(i => ({ id: i.id, ic: i.ic, c: this.countItem(i.id, n) }))
      .filter(x => x.c > 0).sort((a, b) => b.c - a.c);
    return arr.slice(0, limit || 3);
  },

  resetAll() { this._save({}); }
};

if (typeof window !== 'undefined') window.DailyTracker = DailyTracker;
