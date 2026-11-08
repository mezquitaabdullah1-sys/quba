// 🌙 v1.0.158 — ختمة عائلية + مسار أول صوم + وضع اعتكاف
const FamilyKhatma = {
  KEY: 'quba_family_khatma_v1',
  JUZ: 30,

  load() {
    try {
      const d = JSON.parse(localStorage.getItem(this.KEY) || 'null');
      if (d && Array.isArray(d.members)) { if (!d.done || typeof d.done !== 'object') d.done = {}; return d; }
    } catch (e) {}
    return { members: [], done: {}, created: 0 };
  },
  save(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch (e) {} return d; },

  add(name) {
    const d = this.load();
    name = String(name == null ? '' : name).trim().replace(/\s+/g, ' ');
    if (!name || d.members.length >= 12) return null;
    d.members.push({ id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: name.slice(0, 24) });
    if (!d.created) d.created = Date.now();
    return this.save(d);
  },
  remove(id) { const d = this.load(); d.members = d.members.filter(m => m.id !== id); return this.save(d); },

  /** توزيع الأجزاء الثلاثين على الأعضاء بالتساوي، والباقي للأول */
  alloc(d) {
    d = d || this.load();
    const ms = d.members || [], out = {};
    if (!ms.length) return out;
    const base = Math.floor(this.JUZ / ms.length), rem = this.JUZ % ms.length;
    let j = 1;
    ms.forEach((m, i) => {
      const n = base + (i < rem ? 1 : 0), arr = [];
      for (let k = 0; k < n; k++) arr.push(j++);
      out[m.id] = arr;
    });
    return out;
  },

  toggle(j) {
    const d = this.load(), k = String(j);
    const n = Number(j);
    if (!(n >= 1 && n <= this.JUZ)) return d;
    if (d.done[k]) delete d.done[k]; else d.done[k] = 1;
    return this.save(d);
  },

  progress(d) {
    d = d || this.load();
    const done = Object.keys(d.done || {}).filter(j => Number(j) >= 1 && Number(j) <= this.JUZ).length;
    return { done: done, total: this.JUZ, pct: Math.round((done / this.JUZ) * 100) };
  },
  memberDone(d, arr) { d = d || this.load(); return (arr || []).filter(j => d.done[String(j)]).length; }
};

const FirstFast = {
  KEY: 'quba_first_fast_v1',
  STEPS: [
    { id: 'niyyah', t: 'انوِ الصيام قبل الفجر', b: 'النية محلّها القلب، ويُسنّ تبييتها ليلًا. لا يُشترط التلفّظ بها.' },
    { id: 'suhoor', t: 'تسحّر', b: '«تسحّروا فإنّ في السحور بركة» — متفق عليه. وقت السحور ينتهي بطلوع الفجر (وقت الإمساك في التطبيق).' },
    { id: 'hold', t: 'أمسك من الفجر إلى المغرب', b: 'امتناع عن الطعام والشراب والجماع، وعن كل ما يفسد الصوم.' },
    { id: 'tongue', t: 'احفظ لسانك', b: '«من لم يدع قول الزور والعمل به فليس لله حاجة في أن يدع طعامه وشرابه» — البخاري.' },
    { id: 'forget', t: 'إن نسيت فأكلت فأتمّ صومك', b: '«من نسي وهو صائم فأكل أو شرب فليتمّ صومه، فإنما أطعمه الله وسقاه» — متفق عليه.' },
    { id: 'iftar', t: 'أفطر عند المغرب ولا تتأخّر', b: 'تعجيل الفطر سنّة: تمر وماء، ودعاء «ذهب الظمأ وابتلّت العروق وثبت الأجر إن شاء الله».' },
    { id: 'excuse', t: 'اعرف أعذارك قبل أن تحتاجها', b: 'المرض والسفر والحمل والرضاعة والحيض والنفاس أعذار؛ وما يلزم فيها من قضاء أو فدية يُرجع فيه إلى جهة الإفتاء في بلدك.' }
  ],
  load() {
    try { const d = JSON.parse(localStorage.getItem(this.KEY) || 'null'); if (d && typeof d.done === 'object' && d.done) return d; } catch (e) {}
    return { done: {} };
  },
  save(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch (e) {} return d; },
  toggle(id) { const d = this.load(); if (d.done[id]) delete d.done[id]; else d.done[id] = 1; return this.save(d); },
  progress(d) {
    d = d || this.load();
    const done = this.STEPS.filter(s => d.done[s.id]).length;
    return { done: done, total: this.STEPS.length, pct: Math.round((done / this.STEPS.length) * 100) };
  }
};

const Itikaf = {
  KEY: 'quba_itikaf_v1',
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(this.KEY) || 'null');
      if (d && typeof d === 'object') { if (!Array.isArray(d.log)) d.log = []; return d; }
    } catch (e) {}
    return { start: 0, night: 0, log: [] };
  },
  save(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch (e) {} return d; },
  active() { const d = this.load(); return d.start > 0 ? d : null; },
  start(night) {
    const d = this.load();
    if (d.start > 0) return d;
    d.start = Date.now();
    d.night = Math.max(0, Math.min(30, Number(night) || 0));
    return this.save(d);
  },
  stop() {
    const d = this.load();
    if (!(d.start > 0)) return null;
    const mins = Math.max(1, Math.round((Date.now() - d.start) / 60000));
    d.log.unshift({ at: d.start, end: Date.now(), mins: mins, night: d.night || 0 });
    if (d.log.length > 40) d.log.length = 40;
    d.start = 0;
    return this.save(d);
  },
  stats() {
    const d = this.load(), log = d.log || [];
    const total = log.reduce((a, x) => a + (Number(x.mins) || 0), 0);
    return { sessions: log.length, minutes: total, nights: log.filter(x => x.night >= 21).length };
  },
  fmt(ms) {
    const t = Math.max(0, Math.floor(Number(ms) / 1000));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    const p = n => String(n).padStart(2, '0');
    return p(h) + ':' + p(m) + ':' + p(s);
  }
};

if (typeof window !== 'undefined') { window.FamilyKhatma = FamilyKhatma; window.FirstFast = FirstFast; window.Itikaf = Itikaf; }
