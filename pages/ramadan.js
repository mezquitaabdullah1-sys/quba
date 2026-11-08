// 🌙 v1.0.156 — «وضع رمضان»: ختمة ذكية + إحياء العشر الأواخر
const RamadanPage = {
  night: null,
  duaAll: false,
  _open: { fam: false, first: false },
  _gOpen: null,
  _iv: null,
  ZKEY: 'quba_zakat_calc_v1',
  NKEY: 'quba_ramadan_nights_v1',

  _lang() { try { return (typeof currentLocale !== 'undefined' && ['ar','es','en'].includes(currentLocale)) ? currentLocale : 'ar'; } catch (e) { return 'ar'; } },
  L(ar, es, en) { const l = this._lang(); return l === 'es' ? es : (l === 'en' ? en : ar); },

  /* ---------- تواريخ الشهر ---------- */
  _hijri() {
    try {
      if (typeof HijriCalc === 'undefined' || !HijriCalc.fromDate) return null;
      const h = HijriCalc.fromDate(new Date());
      if (!h) return null;
      const y = Number(h.year), m = Number(h.month), d = Number(h.day);
      if (!isFinite(y) || !isFinite(m) || !isFinite(d)) return null;
      return { y: y, m: m, d: d };
    } catch (e) { return null; }
  },

  _monthLen(hy) {
    try {
      const a = HijriCalc.toGregorian(hy, 9, 1);
      const b = HijriCalc.toGregorian(hy, 10, 1);
      if (!a || !b) return 30;
      const n = Math.round((b.getTime() - a.getTime()) / 86400000);
      return (n >= 29 && n <= 30) ? n : 30;
    } catch (e) { return 30; }
  },

  /** v1.0.159: داخل رمضان فعليًا أو في وضع المعاينة */
  _preview() { try { return !!(typeof DailyTracker !== 'undefined' && DailyTracker.previewOn && DailyTracker.previewOn()); } catch (e) { return false; } },
  _inR() {
    const h = this._hijri();
    if (h && h.m === 9) return true;
    return this._preview();
  },
  /** يوم رمضان — ١ في وضع المعاينة خارج الشهر */
  _day() {
    const h = this._hijri();
    if (h && h.m === 9) return h.d;
    return this._preview() ? 1 : 0;
  },

  _daysLeft() {
    const h = this._hijri();
    if (h && h.m === 9) return Math.max(0, this._monthLen(h.y) - h.d + 1);
    if (this._preview()) return this._monthLen(h ? h.y : 0) || 30;
    return 0;
  },

  /** v1.0.159: أيام حتى أول رمضان قادم — لهدف مبدئي قبل الشهر */
  _daysToNext() {
    const h = this._hijri();
    if (!h || typeof HijriCalc === 'undefined' || !HijriCalc.toGregorian) return 30;
    let y = h.y;
    try {
      const a = HijriCalc.toGregorian(y, 9, 1);
      if (!a || a.getTime() <= Date.now()) y += 1;
      const g = HijriCalc.toGregorian(y, 9, 1);
      if (g) return Math.max(1, Math.ceil((g.getTime() - Date.now()) / 86400000));
    } catch (e) {}
    return 30;
  },

  /* ---------- الختمة ---------- */
  _khatma() {
    try {
      if (typeof KhatmaStore === 'undefined') return null;
      const k = KhatmaStore.active();
      if (!k) return null;
      const sc = KhatmaStore.scopePages(k.scope || { type: 'full' });
      const total = Math.max(1, sc.p2 - sc.p1 + 1);
      let read = 0;
      try { read = KhatmaStore.readSet(k).size; } catch (e) { read = 0; }
      const done = Math.max(0, Math.min(total, read));
      const left = total - done;
      const pct = Math.round((done / total) * 100);
      // v1.0.159: كان الهدف يقسم على يوم واحد خارج رمضان فيعرض «كل المتبقي اليوم»
      const inR = this._inR();
      const days = inR ? (this._daysLeft() || 1) : this._daysToNext();
      const target = Math.ceil(left / days);
      let todayWard = null;
      try { todayWard = KhatmaStore.wardToday(k); } catch (e) { todayWard = null; }
      return { k: k, total: total, done: done, left: left, pct: pct, days: days, target: target, ward: todayWard, inR: inR };
    } catch (e) { return null; }
  },

  /* ---------- سجل الليالي ---------- */
  _all() {
    try {
      const o = JSON.parse(localStorage.getItem(this.NKEY) || '{}');
      return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
    } catch (e) { return {}; }
  },
  _nightRec(n) {
    const h = this._hijri();
    const all = this._all();
    const y = h ? String(h.y) : '0';
    const m = all[y];
    const rec = (m && m[String(n)]) ? m[String(n)] : {};
    return (rec && typeof rec === 'object') ? rec : {};
  },
  _mark(n, id, on) {
    const h = this._hijri();
    const all = this._all();
    const y = h ? String(h.y) : '0';
    if (!all[y] || typeof all[y] !== 'object') all[y] = {};
    const cur = (all[y][String(n)] && typeof all[y][String(n)] === 'object') ? all[y][String(n)] : {};
    if (on) { cur[id] = 1; } else { delete cur[id]; }
    all[y][String(n)] = cur;
    try { localStorage.setItem(this.NKEY, JSON.stringify(all)); } catch (e) {}
    if (on) {
      try {
        if (typeof Gamification !== 'undefined' && Gamification.awardOnce) {
          Gamification.awardOnce('qadr', y + '-' + n + '-' + id, 5);
        }
      } catch (e) {}
    }
  },
  _nightPct(n) {
    const r = this._nightRec(n);
    const t = this.DEEDS.length;
    let c = 0;
    this.DEEDS.forEach(d => { if (r[d.id]) c++; });
    return Math.round((c / t) * 100);
  },

  DEEDS: [
    { id: 'qiyam',   ic: 'moon',            n: ['قيام الليل', 'Qiyam al-layl', 'Night prayer'] },
    { id: 'tarawih', ic: 'mosque',          n: ['التراويح', 'Tarawih', 'Tarawih'] },
    { id: 'witr',    ic: 'star',            n: ['الوتر', 'Witr', 'Witr'] },
    { id: 'quran',   ic: 'book-open',       n: ['تلاوة الورد', 'Recitación', 'Recitation'] },
    { id: 'dua',     ic: 'hands-praying',   n: ['دعاء ليلة القدر', 'Dua de la noche', 'Night dua'] },
    { id: 'sadaqah', ic: 'hand-holding-heart', n: ['صدقة', 'Sadaqa', 'Charity'] },
    { id: 'istighfar', ic: 'heart',         n: ['استغفار', 'Istighfar', 'Istighfar'] },
    { id: 'itikaf',  ic: 'person-praying',  n: ['اعتكاف / خلوة', 'I\'tikaf', 'I\'tikaf'] }
  ],

  /* ---------- الواجهة ---------- */
  /* ---------- دعاء اليوم ---------- */
  _dua() {
    const list = (typeof RamadanDuas !== 'undefined' && RamadanDuas.length) ? RamadanDuas : [];
    if (!list.length) return null;
    const inR = this._inR();
    const day = this._day() || 1;
    const idx = inR ? Math.min(list.length - 1, Math.max(0, day - 1)) : 0;
    return { list: list, inR: inR, idx: idx, item: list[idx] };
  },

  /** v1.0.159: إعادة رسم مع الحفاظ على موضع التمرير (كانت الأزرار تُرجعك لأعلى الصفحة) */
  _rerender() {
    const c = document.getElementById('main-content');
    if (!c) return;
    const y = c.scrollTop;
    this.render(c);
    try { c.scrollTop = y; } catch (e) {}
  },

  toggleDuas() { this.duaAll = !this.duaAll; this._rerender(); },

  /* ---------- v1.0.162: دليل رمضان التعليمي ---------- */
  toggleGuide(id) { this._gOpen = (this._gOpen === id) ? null : id; this._rerender(); },

  copyGuideDua(i) {
    const list = (typeof RamadanGuide !== 'undefined' && RamadanGuide.QADR_DUAS) ? RamadanGuide.QADR_DUAS : [];
    const it = list[i];
    if (!it) return;
    const txt = it.ar + (it.s ? ' — ' + it.s : '');
    const done = () => { try { if (typeof showToast === 'function') showToast('📋 ' + this.L('نُسخ الدعاء', 'Dua copiado', 'Dua copied'), 1600); } catch (e) {} };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done).catch(() => this._fallbackCopy(txt, done)); return; }
    } catch (e) {}
    this._fallbackCopy(txt, done);
  },

  guideCard() {
    const L = (a, b, c) => this.L(a, b, c);
    if (typeof RamadanGuide === 'undefined' || !Array.isArray(RamadanGuide.SECTIONS)) return '';
    const lg = this._lang();
    const P = o => this.esc(o ? (o[lg] || o.ar || '') : '');
    const src = o => this.esc(lg === 'ar' ? (o.s || '') : (o.se || o.s || ''));

    const rows = RamadanGuide.SECTIONS.map(s => {
      const open = this._gOpen === s.id;
      let body = '';
      if (open) {
        const txt = (s.txt || []).map(t => `
          <div class="rmd-gtext">
            <div class="rmd-gar" dir="rtl" lang="ar">${this.esc(t.ar)}</div>
            ${(lg !== 'ar' && (t[lg] || t.es)) ? `<div class="rmd-gtr">${P({ ar: t.ar, es: t.es, en: t.en })}</div>` : ''}
            <div class="rmd-gsrc"><i class="fas fa-bookmark"></i> ${src(t)}</div>
          </div>`).join('');
        const plan = (s.plan || []).length ? `<div class="rmd-gplan">${s.plan.map(p => `
          <div class="rmd-gprow"><span class="rmd-gpt">${P(p.t)}</span><span class="rmd-gpa">${P(p.a)}</span></div>`).join('')}</div>` : '';
        const pts = (s.pts || []).length ? `<div class="rmd-gpts">${s.pts.map(p => `
          <div class="rmd-gpt-i"><b>${P(p.t)}</b><span>${P(p.b)}</span></div>`).join('')}</div>` : '';
        const duas = (s.duas && typeof RamadanGuide.QADR_DUAS !== 'undefined') ? `<div class="rmd-gduas">${RamadanGuide.QADR_DUAS.map((d, i) => `
          <div class="rmd-gd ${d.key ? 'is-key' : ''}">
            <div class="rmd-gd-ar" dir="rtl" lang="ar">${this.esc(d.ar)}</div>
            ${lg !== 'ar' ? `<div class="rmd-gd-tr">${this.esc(lg === 'es' ? d.es : d.en)}</div>` : ''}
            <div class="rmd-gd-f">
              <span class="rmd-gsrc"><i class="fas fa-bookmark"></i> ${src(d)}</span>
              <button class="rmd-gcopy" onclick="RamadanPage.copyGuideDua(${i})" aria-label="${L('نسخ', 'Copiar', 'Copy')}"><i class="fas fa-copy"></i></button>
            </div>
          </div>`).join('')}</div>` : '';
        body = `<div class="rmd-gbody">
          ${s.lead ? `<p class="rmd-glead">${P(s.lead)}</p>` : ''}
          ${txt}${plan}${pts}${duas}
        </div>`;
      }
      return `<div class="rmd-grow ${open ? 'is-open' : ''}">
        <button class="rmd-ghead" aria-expanded="${open ? 'true' : 'false'}" onclick="RamadanPage.toggleGuide('${s.id}')">
          <span class="rmd-gico"><i class="fas ${s.ic || 'fa-book'}"></i></span>
          <span class="rmd-gtt">${P(s.ti)}</span>
          <i class="fas fa-chevron-${open ? 'up' : 'down'} rmd-gchev"></i>
        </button>
        ${body}
      </div>`;
    }).join('');

    return `
      <section class="rmd-card rmd-gcard">
        <div class="rmd-card-h"><i class="fas fa-graduation-cap"></i> ${L('دليل رمضان التعليمي', 'Guía de Ramadán', 'Ramadan guide')}</div>
        <p class="rmd-gintro">${L(
          'ثمانية أبواب مختصرة: فضل الشهر والعشر الأواخر، خطة الاستغلال والأعمال الصالحة، فضل ليلة القدر وأدعيتها، التراويح والتهجد، وصلاة العيد وأحكامه وآدابه.',
          'Ocho apartados breves: la virtud del mes y de las diez últimas noches, un plan de aprovechamiento y obras buenas, Laylat al-Qadr y sus duas, tarawih y tahayyud, y la oración del Eid con sus normas y etiqueta.',
          'Eight short sections: the virtue of the month and the last ten nights, a plan and good deeds, Laylat al-Qadr and its duas, tarawih and tahajjud, and the Eid prayer with its rulings and etiquette.')}</p>
        <div class="rmd-glist">${rows}</div>
        <div class="rmd-note"><i class="fas fa-circle-info"></i> ${L(
          'النقول بلفظها ومصادرها. والمسائل الخلافية تُردّ إلى جهة الإفتاء في بلدك.',
          'Las citas van con su texto y fuente. Las cuestiones disputadas se remiten a la autoridad religiosa de tu país.',
          'Quotations are given with their wording and source. Disputed matters are referred to your country’s religious authority.')}</div>
      </section>`;
  },


  copyDua(i) {
    const list = (typeof RamadanDuas !== 'undefined') ? RamadanDuas : [];
    const it = list[i];
    if (!it) return;
    const txt = it.d + (it.s ? ' — ' + it.s : '');
    const done = () => { try { if (typeof showToast === 'function') showToast('📋 ' + this.L('نُسخ الدعاء', 'Dua copiado', 'Dua copied'), 1600); } catch (e) {} };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done).catch(() => this._fallbackCopy(txt, done)); return; }
    } catch (e) {}
    this._fallbackCopy(txt, done);
  },

  _fallbackCopy(txt, done) {
    try {
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); done();
    } catch (e) {}
  },

  /* ---------- حاسبة زكاة الفطر (كل الأرقام يدخلها المستخدم) ---------- */
  _zLoad() {
    try {
      const r = JSON.parse(localStorage.getItem(this.ZKEY) || '{}');
      return { p: Number(r.p) > 0 ? Number(r.p) : 1, sa: Number(r.sa) || 0, pr: Number(r.pr) || 0 };
    } catch (e) { return { p: 1, sa: 0, pr: 0 }; }
  },

  _fmt(v) { const x = Math.round((Number(v) || 0) * 100) / 100; return String(x); },

  _zOut(n, sa, pr) {
    const L = (a, b, c) => this.L(a, b, c);
    const kg = (Number(n) || 0) * (Number(sa) || 0);
    const money = kg * (Number(pr) || 0);
    return `<div class="rmd-zr">
        <div><b>${this._fmt(kg)}</b><span>${L('كجم إجمالًا', 'kg en total', 'kg total')}</span></div>
        <div class="is-key"><b>${this._fmt(money)}</b><span>${L('الإجمالي نقدًا', 'Total en efectivo', 'Total in cash')}</span></div>
      </div>
      <div class="rmd-note"><i class="fas fa-circle-info"></i> ${L('المقدار يتبع فتوى جهة الإفتاء في بلدك (نوع الطعام وكيله)، ووقت الإخراج قبل صلاة العيد.', 'La cantidad sigue a tu autoridad local; se entrega antes de la oración del Eid.', 'The amount follows your local authority; due before the Eid prayer.')}</div>`;
  },

  zCalc(save) {
    const g = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const n = Math.min(50, Math.max(1, parseInt(g('rmd-z-p'), 10) || 1));
    const sa = Math.max(0, parseFloat(g('rmd-z-sa')) || 0);
    const pr = Math.max(0, parseFloat(g('rmd-z-pr')) || 0);
    const out = document.getElementById('rmd-z-out');
    if (out) out.innerHTML = this._zOut(n, sa, pr);
    if (save !== false) { try { localStorage.setItem(this.ZKEY, JSON.stringify({ p: n, sa: sa, pr: pr })); } catch (e) {} }
  },

  render(container, params) {
    const root = container || document.getElementById('main-content');
    if (!root) return;
    if (params && params.night) this.night = Number(params.night) || this.night;
    const h = this._hijri();
    const inR = this._inR();
    const day = this._day();
    const preview = this._preview();
    const L = (a, b, c) => this.L(a, b, c);
    const isRtl = (document.documentElement && document.documentElement.dir === 'rtl');
    const len = h ? this._monthLen(h.y) : 30;
    const daysLeft = this._daysLeft();
    // v1.0.159: الليلة المختارة تُقيَّد بطول الشهر — كان اختيار ٣٠ يبقى معلّقًا في شهر ٢٩ يومًا
    const night = Math.max(21, Math.min(len, this.night || (inR && day >= 21 ? day : 21)));
    this.night = night;

    const kk = this._khatma();

    const khatmaHtml = kk ? `
      <div class="rmd-kh-top">
        <div class="rmd-kh-ring" style="--p:${kk.pct}"><b>${kk.pct}%</b></div>
        <div class="rmd-kh-meta">
          <div class="rmd-kh-name">${this.esc(kk.k.name || L('ختمتي', 'Mi jatma', 'My khatma'))}</div>
          <div class="rmd-kh-sub">${kk.done} / ${kk.total} ${L('صفحة', 'págs', 'pages')}</div>
        </div>
      </div>
      <div class="rmd-bar"><span style="width:${kk.pct}%"></span></div>
      <div class="rmd-kh-grid">
        <div><b>${kk.left}</b><span>${L('باقية', 'Restan', 'Left')}</span></div>
        <div><b>${kk.days}</b><span>${kk.inR ? L('يومًا', 'días', 'days') : L('يومًا لرمضان', 'días a Ramadán', 'days to Ramadan')}</span></div>
        <div class="is-key"><b>${kk.target}</b><span>${kk.inR ? L('هدف اليوم', 'Objetivo hoy', 'Today\'s target') : L('هدف مبدئي', 'Objetivo inicial', 'Initial target')}</span></div>
      </div>
      ${kk.ward && kk.ward.pages ? `<div class="rmd-note"><i class="fas fa-bookmark"></i> ${L('ورد اليوم', 'Wird de hoy', 'Today\'s wird')}: <b>${L('صفحة', 'pág', 'page')} ${kk.ward.from}${kk.ward.to > kk.ward.from ? '–' + kk.ward.to : ''}</b></div>` : ''}
      ${kk.left === 0 ? `<div class="rmd-done"><i class="fas fa-circle-check"></i> ${L('أتممت الختمة — تقبّل الله', 'Jatma completa', 'Khatma complete')}</div>` : ''}
      <div class="rmd-actions">
        <button class="rmd-btn" onclick="Router.go('quran/khatma')"><i class="fas fa-book-open-reader"></i> ${L('افتح الختمة', 'Abrir jatma', 'Open khatma')}</button>
      </div>` : `
      <div class="rmd-empty">
        <i class="fas fa-book-quran"></i>
        <p>${L('لم تبدأ ختمة بعد. أنشئ ختمة على ٦٠٤ صفحات ووزّعها على أيام رمضان.', 'Aún no hay jatma. Crea una de 604 páginas repartidas en Ramadán.', 'No khatma yet. Create one over 604 pages across Ramadan.')}</p>
        <button class="rmd-btn" onclick="Router.go('quran/khatma', {view:'create'})"><i class="fas fa-plus"></i> ${L('ابدأ ختمة رمضان', 'Empezar jatma', 'Start Ramadan khatma')}</button>
      </div>`;

    const nights = [];
    for (let n = 21; n <= len; n++) {
      const odd = n % 2 === 1;
      const isToday = inR && h && h.d === n;
      nights.push(`<button class="rmd-nchip ${this.night === n || (!this.night && isToday) ? 'is-on' : ''} ${odd ? 'is-odd' : ''} ${isToday ? 'is-today' : ''}" onclick="RamadanPage.pickNight(${n})">
        <b>${n}</b>${odd ? '<i class="fas fa-star"></i>' : ''}</button>`);
    }

    const rec = this._nightRec(night);
    const pct = this._nightPct(night);
    const deeds = this.DEEDS.map(d => {
      const on = !!rec[d.id];
      return `<button class="rmd-deed ${on ? 'on' : ''}" onclick="RamadanPage.toggleDeed(${night}, '${d.id}')">
        <span class="rmd-tick"><i class="fas ${on ? 'fa-check' : 'fa-plus'}"></i></span>
        <i class="fas fa-${d.ic}"></i>
        <span>${d.n[this._lang() === 'es' ? 1 : (this._lang() === 'en' ? 2 : 0)]}</span>
      </button>`;
    }).join('');

    const du = this._dua();
    const duaHtml = du ? `
      <section class="rmd-card">
        <div class="rmd-card-h"><i class="fas fa-hands-praying"></i> ${du.inR ? L('دعاء اليوم ' + (du.idx + 1), 'Dua del día ' + (du.idx + 1), 'Dua of day ' + (du.idx + 1)) : L('أدعية الشهر الثلاثون', 'Los 30 duas', 'The 30 duas')}</div>
        <div class="rmd-dua-x rmd-dua-big">${this.esc(du.item.d)}</div>
        <div class="rmd-dmeta">
          ${du.item.t ? `<span class="rmd-tag">${this.esc(du.item.t)}</span>` : ''}
          ${du.item.s ? `<span class="rmd-src"><i class="fas fa-bookmark"></i> ${this.esc(du.item.s)}</span>` : ''}
        </div>
        <div class="rmd-actions">
          <button class="rmd-btn" onclick="RamadanPage.copyDua(${du.idx})"><i class="fas fa-copy"></i> ${L('نسخ', 'Copiar', 'Copy')}</button>
          <button class="rmd-btn rmd-btn-ghost" onclick="RamadanPage.toggleDuas()"><i class="fas fa-list"></i> ${this.duaAll ? L('إخفاء القائمة', 'Ocultar lista', 'Hide list') : L('كل الأدعية', 'Ver las 30', 'All 30')}</button>
        </div>
        ${this.duaAll ? `<div class="rmd-dlist">${du.list.map((x, i) => `<div class="rmd-drow ${i === du.idx ? 'is-today' : ''}"><b>${i + 1}</b><div><div class="rmd-drow-x">${this.esc(x.d)}</div><div class="rmd-drow-m">${x.t ? this.esc(x.t) : ''}${x.s ? ' · ' + this.esc(x.s) : ''}</div></div></div>`).join('')}</div>` : ''}
      </section>` : '';

    const z = this._zLoad();
    const zakatHtml = `
      <section class="rmd-card">
        <div class="rmd-card-h"><i class="fas fa-calculator"></i> ${L('حاسبة زكاة الفطر', 'Calculadora de Zakat al-Fitr', 'Zakat al-Fitr calculator')}</div>
        <div class="rmd-z">
          <label class="rmd-zf"><span>${L('عدد الأفراد (أنت ومن تعول)', 'Personas (tú y dependientes)', 'People (you + dependents)')}</span>
            <input id="rmd-z-p" type="number" min="1" step="1" inputmode="numeric" value="${z.p}" oninput="RamadanPage.zCalc()"></label>
          <label class="rmd-zf"><span>${L('مقدار الصاع بالكيلوجرام', 'Un sa en kg', 'One sa in kg')}</span>
            <input id="rmd-z-sa" type="number" min="0" step="0.1" inputmode="decimal" value="${z.sa || ''}" placeholder="${L('كما تفتي به جهتك', 'Según tu autoridad', 'Per your authority')}" oninput="RamadanPage.zCalc()"></label>
          <label class="rmd-zf"><span>${L('سعر كيلو الطعام', 'Precio por kilo', 'Price per kilo')}</span>
            <input id="rmd-z-pr" type="number" min="0" step="0.01" inputmode="decimal" value="${z.pr || ''}" placeholder="0.00" oninput="RamadanPage.zCalc()"></label>
        </div>
        <div class="rmd-zout" id="rmd-z-out">${this._zOut(z.p, z.sa, z.pr)}</div>
      </section>`;

    root.innerHTML = `
      <div class="rmd-wrap">
        <div class="rmd-head">
          <button class="rmd-back" onclick="Router.go('home')" aria-label="${L('رجوع', 'Volver', 'Back')}"><i class="fas fa-chevron-${isRtl ? 'right' : 'left'}"></i></button>
          <div class="rmd-title">${L('وضع رمضان', 'Modo Ramadán', 'Ramadan mode')}</div>
          <button class="rmd-back" onclick="Router.go('imsakiyah')" aria-label="${L('الإمساكية', 'Imsakiyah', 'Imsakiyah')}"><i class="fas fa-calendar-days"></i></button>
        </div>

        <div class="rmd-hero">
          <div class="rmd-hero-day">
            ${inR ? `<b>${day}</b><span>${L('رمضان', 'Ramadán', 'Ramadan')}</span>` : `<b>—</b><span>${L('خارج رمضان', 'Fuera de Ramadán', 'Not in Ramadan')}</span>`}
          </div>
          <div class="rmd-hero-txt">
            <div class="rmd-hero-h">${inR ? L('يوم ' + day + ' من رمضان', 'Día ' + day + ' de Ramadán', 'Day ' + day + ' of Ramadan') : L('رمضان', 'Ramadán', 'Ramadan')}</div>
            <div class="rmd-hero-s">${inR ? `${daysLeft} ${L('يومًا باقية', 'días restantes', 'days left')}` : L('ستظهر خطط الشهر في رمضان', 'Los planes aparecen en Ramadán', 'Plans appear during Ramadan')}${preview ? ' · ' + L('معاينة', 'Vista previa', 'Preview') : ''}</div>
          </div>
        </div>

        <section class="rmd-card">
          <div class="rmd-card-h"><i class="fas fa-book-quran"></i> ${L('ختمة رمضان الذكية', 'Jatma inteligente', 'Smart khatma')}</div>
          ${khatmaHtml}
        </section>

        ${duaHtml}

        <section class="rmd-card">
          <div class="rmd-card-h"><i class="fas fa-star-and-crescent"></i> ${L('إحياء العشر الأواخر', 'Las diez últimas noches', 'The last ten nights')}</div>
          <div class="rmd-nights">${nights.join('')}</div>
          <div class="rmd-night-bar"><span style="width:${pct}%"></span><b>${pct}%</b></div>
          <div class="rmd-deeds">${deeds}</div>
          <div class="rmd-dua">
            <div class="rmd-dua-t">${L('دعاء ليلة القدر', 'Dua de la noche del destino', 'Dua of Laylat al-Qadr')}</div>
            <div class="rmd-dua-x">اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي</div>
          </div>
          <div class="rmd-note"><i class="fas fa-circle-info"></i> ${L('الليالي الوترية معلَّمة بالنجمة — تحرَّها في العشر كلها.', 'Noches impares marcadas con estrella.', 'Odd nights are starred — seek it in all ten.')}</div>
        </section>

        ${this.guideCard()}

        ${zakatHtml}

        ${this.itikafCard()}
        ${this.familyCard()}
        ${this.firstFastCard()}

        <button class="rmd-preview ${(typeof DailyTracker !== 'undefined' && DailyTracker.previewOn && DailyTracker.previewOn()) ? 'is-on' : ''}" onclick="RamadanPage.preview()">
          <i class="fas fa-eye"></i> ${L('معاينة خارج رمضان (للتجربة)', 'Vista previa fuera de Ramadán', 'Preview outside Ramadan')}
        </button>
        <div class="rmd-note rmd-lock"><i class="fas fa-lock"></i> ${L('يُسجَّل على جهازك وحده.', 'Solo en tu dispositivo.', 'Stored on your device only.')}</div>
      </div>`;

    // v1.0.159: بعد كتابة الصفحة — كان المؤقّت يبدأ قبل وجود عنصر العدّاد
    if (typeof Itikaf !== 'undefined' && Itikaf.active()) { try { this._startItTimer(); } catch (e) {} }
  },

  esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },

  /* ---------- v1.0.158: الاعتكاف / الختمة العائلية / مسار أول صوم ---------- */
  toggleSec(k) {
    this._open[k] = !this._open[k];
    this._rerender();
  },

  famAdd() {
    const el = document.getElementById('rmd-fam-n');
    const nm = el ? el.value : '';
    const d = (typeof FamilyKhatma !== 'undefined') ? FamilyKhatma.add(nm) : null;
    try {
      if (typeof showToast === 'function') showToast(d ? '👨‍👩‍👧 ' + this.L('أُضيف إلى الختمة', 'Añadido', 'Added') : this.L('اكتب اسمًا (حتى ١٢ فردًا)', 'Escribe un nombre', 'Enter a name'), 1700);
    } catch (e) {}
    this._rerender();
  },

  famRemove(id) {
    if (typeof FamilyKhatma !== 'undefined') FamilyKhatma.remove(id);
    this._rerender();
  },

  famToggle(j) {
    if (typeof FamilyKhatma !== 'undefined') FamilyKhatma.toggle(j);
    this._rerender();
  },

  firstToggle(id) {
    if (typeof FirstFast === 'undefined') return;
    FirstFast.toggle(id);
    this._rerender();
  },

  itStart() {
    if (typeof Itikaf === 'undefined') return;
    const h = this._hijri();
    Itikaf.start(h && h.m === 9 ? h.d : 0);
    try { if (typeof showToast === 'function') showToast('🕌 ' + this.L('بدأ الاعتكاف — تقبّل الله', 'Itikaf iniciado', 'Itikaf started'), 1800); } catch (e) {}
    const c = document.getElementById('main-content');
    if (c) this.render(c);
  },

  itStop() {
    if (typeof Itikaf === 'undefined') return;
    const d = Itikaf.stop();
    try {
      if (typeof showToast === 'function') {
        const m = d && d.log && d.log[0] ? d.log[0].mins : 0;
        showToast(m ? '✅ ' + this.L('سُجّل اعتكاف ' + m + ' دقيقة', 'Registrado: ' + m + ' min', m + ' min recorded') : '✅', 2000);
      }
    } catch (e) {}
    const c = document.getElementById('main-content');
    if (c) this.render(c);
  },

  _startItTimer() {
    this._stopItTimer();
    if (typeof Itikaf === 'undefined' || !Itikaf.active()) return;
    const tick = () => {
      const el = document.getElementById('rmd-it-t');
      const a = Itikaf.active();
      if (!el || !a) { this._stopItTimer(); return; }
      el.textContent = Itikaf.fmt(Date.now() - a.start);
    };
    tick();
    this._iv = setInterval(tick, 1000);
  },

  _stopItTimer() { if (this._iv) { try { clearInterval(this._iv); } catch (e) {} this._iv = null; } },

  itikafCard() {
    const L = (a, b, c) => this.L(a, b, c);
    if (typeof Itikaf === 'undefined') return '';
    const a = Itikaf.active(), st = Itikaf.stats();
    return `
      <section class="rmd-card">
        <div class="rmd-card-h"><i class="fas fa-mosque"></i> ${L('وضع الاعتكاف', 'Modo Itikaf', 'Itikaf mode')}</div>
        ${a ? `
          <div class="rmd-it-live">
            <div class="rmd-it-lab">${L('في اعتكاف منذ', 'En itikaf desde hace', 'In itikaf for')}</div>
            <div class="rmd-it-t" id="rmd-it-t">${Itikaf.fmt(Date.now() - a.start)}</div>
            ${a.night ? `<div class="rmd-it-night">${L('ليلة ' + a.night, 'Noche ' + a.night, 'Night ' + a.night)}</div>` : ''}
          </div>
          <div class="rmd-dua-x rmd-it-dhikr">سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ</div>
          <div class="rmd-actions"><button class="rmd-btn rmd-btn-ghost" onclick="RamadanPage.itStop()"><i class="fas fa-stop"></i> ${L('أنهِ الاعتكاف وسجّله', 'Terminar y guardar', 'End and save')}</button></div>
        ` : `
          <p class="rmd-p">${L('لزوم المسجد بنيّة التقرّب إلى الله، مع الانقطاع للذكر والتلاوة والدعاء.', 'Permanecer en la mezquita con intención de acercarte a Dios, dedicado al recuerdo y la recitación.', 'Staying in the mosque with the intention of worship, devoted to dhikr, recitation and dua.')}</p>
          <div class="rmd-actions"><button class="rmd-btn" onclick="RamadanPage.itStart()"><i class="fas fa-play"></i> ${L('ابدأ الاعتكاف', 'Iniciar Itikaf', 'Start itikaf')}</button></div>
          <div class="rmd-note"><i class="fas fa-circle-info"></i> ${L('يُشترط المسجد والنية والطهارة من الحيض والنفاس، والامتناع عن الجماع. وأقله وشروطه تختلف بين المذاهب — راجع جهة الإفتاء.', 'Requiere mezquita, intención y pureza ritual; su duración mínima varía según la escuela.', 'Requires a mosque, intention, ritual purity; minimum length varies by school.')}</div>
        `}
        ${st.sessions ? `<div class="rmd-it-stats"><span><b>${st.sessions}</b> ${L('مرة', 'sesiones', 'sessions')}</span><span><b>${Math.round(st.minutes / 60 * 10) / 10}</b> ${L('ساعة', 'horas', 'hours')}</span><span><b>${st.nights}</b> ${L('في العشر', 'en las diez', 'in last ten')}</span></div>` : ''}
      </section>`;
  },

  familyCard() {
    const L = (a, b, c) => this.L(a, b, c);
    if (typeof FamilyKhatma === 'undefined') return '';
    const d = FamilyKhatma.load();
    const pr = FamilyKhatma.progress(d);
    const al = FamilyKhatma.alloc(d);
    const rows = d.members.map(m => {
      const arr = al[m.id] || [];
      const dn = FamilyKhatma.memberDone(d, arr);
      const lbl = arr.length ? (arr.length === 1 ? String(arr[0]) : arr[0] + '–' + arr[arr.length - 1]) : '—';
      const pct = arr.length ? Math.round((dn / arr.length) * 100) : 0;
      return `<div class="rmd-frow">
        <div class="rmd-fav">${this.esc((m.name || '؟').trim().charAt(0))}</div>
        <div class="rmd-fmain">
          <div class="rmd-fname">${this.esc(m.name)} <span class="rmd-fjuz">${L('جزء', 'yuz', 'juz')} ${lbl}</span></div>
          <div class="rmd-fbar"><span style="width:${pct}%"></span></div>
        </div>
        <div class="rmd-fpct">${dn}/${arr.length}</div>
        <button class="rmd-fdel" onclick="RamadanPage.famRemove('${m.id}')" aria-label="${L('حذف', 'Quitar', 'Remove')}"><i class="fas fa-xmark"></i></button>
      </div>`;
    }).join('');
    const grid = d.members.length ? `<div class="rmd-jgrid">${Array.from({ length: 30 }, (_, i) => i + 1).map(j => `<button class="rmd-jchip ${d.done[String(j)] ? 'on' : ''}" onclick="RamadanPage.famToggle(${j})">${j}</button>`).join('')}</div>` : '';
    const open = !!this._open.fam;
    return `
      <section class="rmd-card">
        <button class="rmd-sec-h" aria-expanded="${open ? 'true' : 'false'}" onclick="RamadanPage.toggleSec('fam')">
          <span><i class="fas fa-people-roof"></i> ${L('ختمة البيت', 'Jatma familiar', 'Family khatma')}</span>
          <span class="rmd-sec-m">${pr.done}/${pr.total} <i class="fas fa-chevron-${open ? 'up' : 'down'}"></i></span>
        </button>
        ${open ? `
          <div class="rmd-bar"><span style="width:${pr.pct}%"></span></div>
          <div class="rmd-flist">${rows || `<p class="rmd-p">${L('أضف أفراد البيت ويُوزَّع عليهم الثلاثون جزءًا بالتساوي (حتى ١٢ فردًا).', 'Añade a tu familia y se reparten los 30 yuz.', 'Add family members; the 30 juz are split evenly.')}</p>`}</div>
          <div class="rmd-fadd">
            <input id="rmd-fam-n" type="text" maxlength="24" placeholder="${L('اسم الفرد', 'Nombre', 'Name')}" onkeydown="if(event.key==='Enter')RamadanPage.famAdd()">
            <button class="rmd-btn" onclick="RamadanPage.famAdd()"><i class="fas fa-plus"></i></button>
          </div>
          ${grid}
          <div class="rmd-note"><i class="fas fa-circle-info"></i> ${L('اضغط رقم الجزء ليُعلَّم مقروءًا. التوزيع تنظيم عملي بين الأحياء؛ ومن أراد إهداء الثواب فمحلّه فتوى جهته.', 'Toca un yuz para marcarlo leído.', 'Tap a juz to mark it read.')}</div>
        ` : ''}
      </section>`;
  },

  firstFastCard() {
    const L = (a, b, c) => this.L(a, b, c);
    if (typeof FirstFast === 'undefined') return '';
    const d = FirstFast.load(), pr = FirstFast.progress(d);
    const open = !!this._open.first;
    return `
      <section class="rmd-card">
        <button class="rmd-sec-h" aria-expanded="${open ? 'true' : 'false'}" onclick="RamadanPage.toggleSec('first')">
          <span><i class="fas fa-seedling"></i> ${L('أول صوم — خطوة بخطوة', 'Primer ayuno, paso a paso', 'First fast, step by step')}</span>
          <span class="rmd-sec-m">${pr.done}/${pr.total} <i class="fas fa-chevron-${open ? 'up' : 'down'}"></i></span>
        </button>
        ${open ? `
          <div class="rmd-bar"><span style="width:${pr.pct}%"></span></div>
          <div class="rmd-steps">${FirstFast.STEPS.map((st, i) => {
            const on = !!d.done[st.id];
            return `<button class="rmd-step ${on ? 'on' : ''}" onclick="RamadanPage.firstToggle('${st.id}')">
              <span class="rmd-snum">${on ? '<i class="fas fa-check"></i>' : (i + 1)}</span>
              <span class="rmd-sbody"><b>${this.esc(st.t)}</b><span>${this.esc(st.b)}</span></span>
            </button>`;
          }).join('')}</div>
          <div class="rmd-bad"><i class="fas fa-triangle-exclamation"></i> <b>${L('ما يُفسد الصوم:', 'Rompe el ayuno:', 'Breaks the fast:')}</b> ${L('الأكل أو الشرب عمدًا، الجماع، التقيّؤ عمدًا، وخروج دم الحيض أو النفاس.', 'Comer o beber a propósito, relaciones, vómito deliberado, menstruación o puerperio.', 'Deliberate eating/drinking, intercourse, deliberate vomiting, menstruation or postnatal bleeding.')}</div>
        ` : ''}
      </section>`;
  },

  preview() {
    const on = (typeof DailyTracker !== 'undefined' && DailyTracker.previewOn) ? DailyTracker.previewOn() : false;
    try { if (typeof DailyTracker !== 'undefined' && DailyTracker.setPreview) DailyTracker.setPreview(!on); } catch (e) {}
    this._rerender();
    try { if (typeof showToast === 'function') showToast(!on ? '🌙 وضع المعاينة مفعّل — صفحة رمضان تعمل الآن' : '⏹️ أُوقف وضع المعاينة', 2000); } catch (e) {}
  },

  pickNight(n) { this.night = Math.max(21, Number(n) || 21); this._rerender(); },

  toggleDeed(n, id) {
    const rec = this._nightRec(n);
    this._mark(n, id, !rec[id]);
    this._rerender();
  },

  cleanup() { this._stopItTimer(); }
};

if (typeof window !== 'undefined') window.RamadanPage = RamadanPage;
