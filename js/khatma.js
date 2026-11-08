// 📗 v1.0.134 — ختمة القرآن والورد اليومي
// التتبّع حقيقي: صفحة تُعدّ مقروءة إذا مكثت عليها ≥ ١٢ ثانية ثم قلّبتها (أو يدويًا).
// التوزيع: صفحات (افتراضي) أو أرباع محاذاة لبدايات الأرباع (٢٤٠ ربعًا).
const KhatmaStore = {
  KEY: 'quba_khatma_v1',
  TOTAL: 604,
  MIN_SEC: 12,
  _sb: null,

  // ---------- تخزين ----------
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) { d = null; }
    if (!d || typeof d !== 'object') d = { list: [], activeId: null };
    if (!Array.isArray(d.list)) d.list = [];
    return d;
  },
  save(d) {
    // v1.0.145: قبل كل كتابة نتأكد أن «الختمة النشطة» تشير إلى ختمة موجودة.
    // كانت activeId قد تبقى معلّقة على ختمة محذوفة أو غائبة في بيانات قديمة،
    // فيذهب التنفيذ إلى أول ختمة في القائمة بينما الواجهة لا تُظهر أيتها
    // النشطة → «أبدأ ورد ختمة فيفتح ورد ختمة أخرى».
    try { this._fixActive(d); } catch (e) {}
    try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch (e) {}
    if (d && d.activeId) this.syncReminder(this.get(d.activeId));
  },

  /** v1.0.145: اختيار ختمة نشطة صحيحة وحفظ الإصلاح فورًا (بدلًا من الحالة الضمنية) */
  _fixActive(d) {
    if (!d) return null;
    if (!Array.isArray(d.list)) d.list = [];
    const cur = d.list.find(x => x && x.id === d.activeId);
    if (cur) return cur;
    const pool = d.list.filter(x => x && !x.archived);
    const pick = (pool.length ? pool : d.list).slice()
      .sort((a, b) => (b.used || b.created || 0) - (a.used || a.created || 0))[0] || null;
    const nid = pick ? pick.id : null;
    if (nid !== d.activeId) {
      d.activeId = nid;
      try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch (e) {}
    }
    return pick;
  },
  all() { return this.load().list; },
  active() {
    // v1.0.145: نفس ترتيب _fixActive — لا سقوط إلى «أول ختمة» بل إلى آخر
    // ختمة استُخدمت، مع إصلاح activeId المحفوظ.
    return this._fixActive(this.load());
  },
  get(id) { return this.load().list.find(k => k.id === id) || null; },
  upsert(k, activate) {
    const d = this.load();
    const i = d.list.findIndex(x => x.id === k.id);
    const isNew = i < 0;
    if (i >= 0) d.list[i] = k; else d.list.push(k);
    // v1.0.145: كان كل حفظ لأي ختمة يجعلها «النشطة» (d.activeId = k.id)، فأي
    // تحديث لختمة غير مختارة كان يسرق التفعيل. الآن التفعيل عند الإنشاء أو
    // بطلب صريح فقط.
    if (activate === true || isNew || !d.activeId) { d.activeId = k.id; k.used = Date.now(); }
    this.save(d);
    return k;
  },
  remove(id) {
    const d = this.load();
    d.list = d.list.filter(k => k.id !== id);
    // v1.0.145: لا نسقط إلى «أول ختمة» (الأقدم) — save() يختار الأنسب
    if (d.activeId === id) d.activeId = null;
    this.save(d);
    // لم تبقَ أي ختمة: أوقف التذكير المجدول فعلًا
    if (!d.activeId) {
      try {
        if (window.AndroidBridge && typeof AndroidBridge.scheduleWard === 'function') {
          AndroidBridge.scheduleWard(JSON.stringify({ enabled: false }));
        }
      } catch (e) {}
    }
  },
  // v1.0.137: التبديل بين الختمات المنشأة بلا فقدان أي واحدة منها
  setActive(id) {
    const d = this.load();
    const k = d.list.find(x => x.id === id);
    if (!k) return null;
    d.activeId = id;
    k.used = Date.now();
    this.save(d);
    return this.get(id);
  },
  // v1.0.137: تشغيل/إيقاف تذكير ختمة محدّدة (يُعاد جدولة المنبّه للختمة النشطة فقط)
  toggleRemind(id) {
    const d = this.load();
    const k = d.list.find(x => x.id === id);
    if (!k) return null;
    k.remind = k.remind || { on: false, hour: 19, minute: 0 };
    k.remind.on = !k.remind.on;
    this.save(d);
    return k.remind.on;
  },
  archive(id) {
    const k = this.get(id); if (!k) return;
    k.archived = true; this.upsert(k, false);
  },

  // ---------- حدود السور/الأجزاء/الأرباع ----------
  _surahBounds() {
    if (this._sb) return this._sb;
    const first = {}, last = {};
    const pages = (window.QURAN_FULL_AR && window.QURAN_FULL_AR.pages) || [];
    pages.forEach(pg => {
      (pg.ayahs || []).forEach(a => {
        const s = a[0];
        if (!first[s]) first[s] = pg.n;
        last[s] = pg.n;
      });
    });
    this._sb = { first, last };
    return this._sb;
  },
  surahStart(s) { const b = this._surahBounds(); return b.first[s] || 1; },
  surahEnd(s) { const b = this._surahBounds(); return b.last[s] || this.TOTAL; },
  juzPage(j) {
    const D = window.MUSHAF_DIVISIONS; if (!D) return 1;
    const x = (D.juzs || []).find(v => v.juz === j);
    return x ? x.page : 1;
  },
  juzEnd(j) { return j >= 30 ? this.TOTAL : this.juzPage(j + 1) - 1; },
  rubs() { const D = window.MUSHAF_DIVISIONS; return (D && D.rubs) || []; },

  // ---------- نطاق الختمة ----------
  scopePages(scope) {
    if (!scope) return { p1: 1, p2: this.TOTAL };
    let p1 = 1, p2 = this.TOTAL;
    if (scope.type === 'surah') {
      p1 = this.surahStart(scope.s1 || 1);
      p2 = this.surahEnd(scope.s2 || scope.s1 || 114);
    } else if (scope.type === 'juz') {
      p1 = this.juzPage(scope.j1 || 1);
      p2 = this.juzEnd(scope.j2 || scope.j1 || 30);
    } else if (scope.type === 'page') {
      p1 = Math.max(1, scope.p1 || 1);
      p2 = Math.min(this.TOTAL, scope.p2 || this.TOTAL);
    }
    if (p1 > p2) { const t = p1; p1 = p2; p2 = t; }
    return { p1, p2 };
  },
  scopeCount(scope) { const r = this.scopePages(scope); return r.p2 - r.p1 + 1; },

  // ---------- التواريخ ----------
  _fmt(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  },
  _parse(s) {
    const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return new Date();
    return new Date(+m[1], +m[2] - 1, +m[3]);
  },
  today() { return this._fmt(new Date()); },

  /** تواريخ أيام القراءة: من البداية مع تخطّي أيام الراحة حتى نبلغ `days` يومًا */
  schedule(k) {
    const out = [];
    const rest = Array.isArray(k.rest) ? k.rest.slice() : [];
    // v1.0.160: اختيار أيام الأسبوع السبعة كلها «راحة» لا يترك أي يوم قراءة،
    // فكانت الحلقة تنتهي ثم تُسقط الختمة كاملة (٦٠٤ صفحة) في يوم واحد.
    // نتجاهل الراحة في هذه الحالة وحدها حتى تبقى الخطة قابلة للتنفيذ.
    if (rest.length >= 7) rest.length = 0;
    const start = this._parse(k.start);
    const d = new Date(start.getTime());
    const want = Math.max(1, k.days);
    // v1.0.160: سقف ٩٠٠ دورة كان يقطع الخطة قبل نهايتها حين تجتمع مدة طويلة
    // مع أيام راحة (٣٦٥ يومًا + ٦ راحة = ٢٥٥٥ دورة)، فتخرج أيام أقل من
    // المطلوب وتُقسم الصفحات على عدد خاطئ.
    const guardMax = Math.max(900, want * 8);
    let guard = 0;
    while (out.length < want && guard++ < guardMax) {
      if (rest.indexOf(d.getDay()) < 0) out.push(this._fmt(d));
      d.setDate(d.getDate() + 1);
    }
    if (!out.length) out.push(this._fmt(start));
    return out;
  },

  // ---------- الخطة ----------
  /**
   * كل يوم = {i, date, from, to, pages, rubFrom, rubTo, count}
   * from/to صفحتان متجاورتان (from ≤ to) — الاتجاه يُقرأ من k.dir.
   */
  plan(k) {
    const r = this.scopePages(k.scope);
    const dates = this.schedule(k);
    const n = dates.length;
    const wards = [];

    if (k.unit === 'rub') {
      const rubs = this.rubs().filter(x => x.page >= r.p1 && x.page <= r.p2);
      const total = rubs.length || 1;
      // توزيع الأرباع على الأيام
      let idx = 0;
      const base = Math.floor(total / n), rem = total % n;
      for (let d = 0; d < n; d++) {
        const cnt = base + (d < rem ? 1 : 0);
        const slice = rubs.slice(idx, idx + Math.max(1, cnt));
        idx += Math.max(1, cnt);
        if (!slice.length) { wards.push(this._emptyWard(d, dates[d])); continue; }
        const firstPage = slice[0].page;
        const nextRub = rubs[idx];
        const lastPage = nextRub ? nextRub.page - 1 : r.p2;
        wards.push({
          i: d + 1, date: dates[d],
          from: Math.max(r.p1, firstPage), to: Math.min(r.p2, Math.max(firstPage, lastPage)),
          rubFrom: (slice[0] && slice[0].id) || 0, rubTo: (slice[slice.length - 1] && slice[slice.length - 1].id) || 0,
        });
      }
    } else {
      const total = r.p2 - r.p1 + 1;
      const base = Math.floor(total / n), rem = total % n;
      let cursor = r.p1;
      for (let d = 0; d < n; d++) {
        const cnt = base + (d < rem ? 1 : 0);
        const from = cursor;
        const to = Math.min(r.p2, cursor + Math.max(0, cnt) - 1);
        cursor = to + 1;
        if (cnt <= 0) { wards.push(this._emptyWard(d, dates[d])); continue; }
        wards.push({ i: d + 1, date: dates[d], from, to, rubFrom: 0, rubTo: 0 });
      }
    }

    // الاتجاه المعكوس: أعِد ترتيب الأيام على الكتل من الآخر
    if (k.dir === -1) {
      const blocks = wards.map(w => ({ from: w.from, to: w.to }));
      const rev = blocks.slice().reverse();
      wards.forEach((w, i) => { w.from = rev[i].from; w.to = rev[i].to; });
    }

    wards.forEach(w => { w.pages = w.to - w.from + 1; w.count = w.pages; });
    return wards;
  },
  _emptyWard(i, date) { return { i: i + 1, date, from: 0, to: -1, pages: 0, count: 0 }; },

  wardToday(k) {
    if (!k) return null;
    const plan = this.plan(k);
    const t = this.today();
    const exact = plan.find(w => w.date === t);
    if (exact) return Object.assign({ isToday: true, rest: false }, exact);
    if (k.rest && k.rest.indexOf(new Date().getDay()) >= 0) {
      return { isToday: true, rest: true, date: t, from: 0, to: -1, pages: 0, count: 0, i: 0 };
    }
    // قبل البداية
    if (t < plan[0].date) return Object.assign({ isToday: false, before: true }, plan[0]);
    // بعد النهاية
    const last = plan[plan.length - 1];
    return Object.assign({ isToday: false, after: true }, last, { pages: 0, count: 0, to: -1 });
  },

  // ---------- القراءة الفعلية ----------
  _merge(ranges) {
    const rs = (ranges || []).filter(r => Array.isArray(r) && r[0] > 0 && r[1] >= r[0])
      .map(r => [r[0], r[1]]).sort((a, b) => a[0] - b[0]);
    const out = [];
    rs.forEach(r => {
      const last = out[out.length - 1];
      if (last && r[0] <= last[1] + 1) last[1] = Math.max(last[1], r[1]);
      else out.push([r[0], r[1]]);
    });
    return out;
  },
  readSet(k) {
    const set = new Set();
    this._merge(k.reads).forEach(r => { for (let p = r[0]; p <= r[1]; p++) set.add(p); });
    return set;
  },
  markPage(p, src, kid) {
    const k = (kid && this.get(kid)) || this.active();
    if (!k || !p) return null;
    p = Math.min(this.TOTAL, Math.max(1, p));
    const r = this.scopePages(k.scope);
    if (p < r.p1 || p > r.p2) return null;
    const before = this.readSet(k).has(p);
    k.reads = this._merge((k.reads || []).concat([[p, p]]));
    const t = this.today();
    k.log = k.log || {};
    if (!before) k.log[t] = (k.log[t] || 0) + 1;
    this._checkFire(k);
    this.upsert(k, false);
    return { added: !before, page: p };
  },
  markRange(a, b, how, kid) {
    const k = (kid && this.get(kid)) || this.active(); if (!k) return 0;
    a = Math.min(a, b); b = Math.max(a, b);
    let added = 0;
    const had = this.readSet(k);
    for (let p = a; p <= b; p++) if (!had.has(p)) added++;
    k.reads = this._merge((k.reads || []).concat([[a, b]]));
    const t = this.today();
    k.log = k.log || {};
    k.log[t] = (k.log[t] || 0) + added;
    if (how) {
      k.manual = k.manual || [];
      k.manual.push({ d: t, a, b, how: String(how), at: Date.now() });
    }
    this._checkFire(k);
    this.upsert(k, false);
    return added;
  },
  /** v1.0.137: إزالة تقدّم نطاق — تُرجع عدد الصفحات التي أُزيلت */
  unmarkRange(a, b, kid) {
    const k = (kid && this.get(kid)) || this.active(); if (!k) return 0;
    a = Math.min(a, b); b = Math.max(a, b);
    const set = this.readSet(k);
    let removed = 0;
    for (let p = a; p <= b; p++) if (set.has(p)) { set.delete(p); removed++; }
    k.reads = this._merge(Array.from(set).map(x => [x, x]));
    const t = this.today();
    k.log = k.log || {};
    if (removed) k.log[t] = Math.max(0, (k.log[t] || 0) - removed);
    k.manual = (k.manual || []).filter(m => m.d !== t);
    this.upsert(k, false);
    return removed;
  },
  /** v1.0.137: إزالة إتمام يدوي محدّد (بالخطأ) وإرجاع تقدّمه */
  undoManual(i) {
    const k = this.active(); if (!k) return 0;
    const m = (k.manual || [])[i]; if (!m) return 0;
    const set = this.readSet(k);
    let removed = 0;
    for (let p = m.a; p <= m.b; p++) if (set.has(p)) { set.delete(p); removed++; }
    k.reads = this._merge(Array.from(set).map(x => [x, x]));
    k.log = k.log || {};
    if (m.d) k.log[m.d] = Math.max(0, (k.log[m.d] || 0) - removed);
    k.manual.splice(i, 1);
    this.upsert(k, false);
    return removed;
  },
  manualOf(k) {
    const arr = (k && k.manual) || [];
    return arr.map((m, i) => Object.assign({ i: i }, m));
  },
  unmarkPage(p) {
    const k = this.active(); if (!k) return;
    const set = this.readSet(k); set.delete(p);
    k.reads = this._merge(Array.from(set).map(x => [x, x]));
    this.upsert(k, false);
  },

  /** v1.0.145: كل ما تحتاجه واجهة القراءة عن ورد اليوم في نداء واحد */
  wardInfo(k) {
    if (!k) return null;
    const w = this.wardToday(k);
    if (!w) return null;
    const st = w.rest ? 'rest'
      : (w.before ? 'before'
        : (w.after ? 'after'
          : (w.pages > 0 ? 'open' : 'none')));
    const wp = this.wardProgress(k);
    const kp = this.progress(k);
    let n = 0;
    try { n = this.plan(k).length; } catch (e) { n = 0; }
    return {
      k, w, st,
      from: w.from, to: w.to, i: w.i || 0, n,
      done: wp.done, total: wp.total, pct: wp.pct,
      running: !!(k.wrun && k.wrun.d === this.today() && !k.wrun.done),
      kRead: kp.read, kTotal: kp.total, kPct: kp.pct,
    };
  },

  /** v1.0.145: خريطة (سورة:آية) → صفحة مصحف — لربط القراءة المترجمة بالصفحات */
  _ayahPageMap() {
    if (this._apm) return this._apm;
    const m = new Map();
    try {
      const pages = (window.QURAN_FULL_AR && window.QURAN_FULL_AR.pages) || [];
      pages.forEach(pg => {
        const n = pg.n || (pg.page || 0);
        (pg.ayahs || []).forEach(r => { if (r && n) m.set(r[0] + ':' + r[1], n); });
      });
    } catch (e) {}
    this._apm = m;
    return m;
  },
  pageOfAyah(s, a) {
    const p = this._ayahPageMap().get(Number(s) + ':' + Number(a));
    return p || 0;
  },

  // ---------- إحصاءات ----------
  progress(k) {
    if (!k) return { read: 0, total: this.TOTAL, pct: 0 };
    const total = this.scopeCount(k.scope);
    const set = this.readSet(k);
    let read = 0;
    const r = this.scopePages(k.scope);
    set.forEach(p => { if (p >= r.p1 && p <= r.p2) read++; });
    return { read, total, pct: total ? Math.round((read / total) * 100) : 0 };
  },
  wardProgress(k) {
    const w = this.wardToday(k);
    if (!w || w.rest || w.pages <= 0) return { done: 0, total: 0, pct: 0, ward: w };
    const set = this.readSet(k);
    let done = 0;
    for (let p = w.from; p <= w.to; p++) if (set.has(p)) done++;
    return { done, total: w.pages, pct: Math.round((done / w.pages) * 100), ward: w };
  },
  streak(k) {
    const log = (k && k.log) || {};
    // السلسلة تُحفظ طوال اليوم الحالي: إن لم تقرأ اليوم بعد، تُحسب من أمس.
    let n = 0;
    const d = new Date();
    if (!(log[this._fmt(d)] > 0)) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) {
      if (log[this._fmt(d)] > 0) n++;
      else break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  },
  /** دقائق تقديرية: ~١٨ ثانية للصفحة الواحدة قراءةً متأنية */
  estMinutes(pages) { return Math.max(1, Math.round((pages * 75) / 60)); }, // ~٧٥ ثانية للصفحة

  // ---------- المتابعة والتذكير ----------
  _checkFire(k) {
    const pr = this.progress(k);
    const marks = [25, 50, 75, 100];
    k.fired = k.fired || {};
    marks.forEach(m => {
      if (pr.pct >= m && !k.fired[m]) {
        k.fired[m] = 1;
        try {
          if (m === 100 && window.KhatmaPage && KhatmaPage.celebrate) setTimeout(() => KhatmaPage.celebrate(k.id), 600);
          else showToast(`${m}٪ من ختمتك — بارك الله فيك`, 2000);
        } catch (e) {}
      }
    });
  },

  syncReminder(k) {
    try {
      const B = window.AndroidBridge;
      if (!B || typeof B.scheduleWard !== 'function') return;
      if (!k || !k.remind || !k.remind.on) { B.scheduleWard(JSON.stringify({ enabled: false })); return; }
      const w = this.wardToday(k);
      const body = (w && !w.rest && w.pages > 0)
        ? `ورد اليوم: ${w.pages} صفحة · ${this.rangeLabel(k, w)}`
        : 'وردك اليوم بانتظارك — افتح قُبا';
      B.scheduleWard(JSON.stringify({
        enabled: true, hour: k.remind.hour | 0, minute: k.remind.minute | 0,
        title: 'ورد القرآن اليومي', body, route: 'quran/khatma',
      }));
    } catch (e) {}
  },

  // ---------- تسميات ----------
  surahName(s) {
    try {
      const arr = window.SURAH_NAMES;
      if (arr && arr[s - 1]) return arr[s - 1];
    } catch (e) {}
    try {
      if (window.QuranMushafPage && QuranMushafPage._surahName) {
        const n = QuranMushafPage._surahName(s);
        if (n && !/^\d+$/.test(n)) return n;
      }
    } catch (e) {}
    return 'سورة ' + s;
  },
  /** «البقرة ١–٧٤» من نطاق صفحات */
  rangeLabel(k, w) {
    if (!w || w.pages <= 0) return '—';
    const a = this.pageRef(w.from), b = this.pageRef(w.to);
    if (a.s === b.s) return `${this.surahName(a.s)} ${a.a}–${b.a}`;
    return `${this.surahName(a.s)} ${a.a} ← ${this.surahName(b.s)} ${b.a}`;
  },
  pageRef(p) {
    const pages = (window.QURAN_FULL_AR && window.QURAN_FULL_AR.pages) || [];
    const pg = pages[p - 1];
    if (!pg || !pg.ayahs || !pg.ayahs.length) return { s: 1, a: 1 };
    const f = pg.ayahs[0], l = pg.ayahs[pg.ayahs.length - 1];
    return { s: f[0], a: f[1], sEnd: l[0], aEnd: l[1] };
  },
  /** أول آيات الورد للمعاينة */
  wardAyahs(w, max) {
    max = max || 4;
    const pages = (window.QURAN_FULL_AR && window.QURAN_FULL_AR.pages) || [];
    const out = [];
    if (!w || w.pages <= 0) return out;
    const pg = pages[w.from - 1];
    if (!pg) return out;
    for (const a of (pg.ayahs || [])) { out.push(a); if (out.length >= max) break; }
    return out;
  },
};

window.KhatmaStore = KhatmaStore;


/* ============================================================
   v1.0.171 — جلسة الورد: تبدأ الحساب فورًا وتستمر مهما كان مدخل
   القارئ (المصحف، القارئ المترجم، شاشة الورد). الجلسة تُحفظ مع الختمة
   فتبقى بعد إغلاق التطبيق، وتنتهي تلقائيًا عند إتمام ورد اليوم.
   ============================================================ */
if (typeof KhatmaStore !== 'undefined') {
  KhatmaStore.startWard = function (k) {
    const kk = k || this.active();
    if (!kk) return null;
    kk.wrun = { d: this.today(), at: Date.now(), done: false };
    this.upsert(kk, false);
    return kk.wrun;
  };
  KhatmaStore.endWard = function (k) {
    const kk = k || this.active();
    if (!kk) return null;
    kk.wrun = { d: this.today(), at: Date.now(), done: true };
    this.upsert(kk, false);
    return kk.wrun;
  };
  KhatmaStore.wardRunning = function (k) {
    const kk = k || this.active();
    if (!kk || !kk.wrun) return false;
    if (kk.wrun.d !== this.today() || kk.wrun.done) return false;
    // إتمام تلقائي عند بلوغ العدد
    try {
      const wp = this.wardProgress(kk);
      if (wp && wp.total > 0 && wp.done >= wp.total) { this.endWard(kk); return false; }
    } catch (e) {}
    return true;
  };
}
