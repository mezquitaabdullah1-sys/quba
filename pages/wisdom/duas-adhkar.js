// v1.0.151 — صفحة موحّدة «الأدعية والأذكار»
// دمج صفحتَي الأذكار والأدعية في شاشة واحدة بتبويب مزدوج، مع قوالب بطاقات
// مختلفة لكل ذكر/دعاء (٦ قوالب × ١٢ لوحة ألوان تُختار بحسب معرّف العنصر،
// فيتلوّن كل دعاء بشكل مختلف ويتغيّر شكل بطاقته).
const DuaAdhkarPage = {
  tab: 'adhkar',          // 'adhkar' | 'duas'
  view: 'hub',            // 'hub' | 'list'
  counters: {},           // { [itemId]: n } — محفوظ لليوم الحالي
  _cats: null,
  _q: '',
  _err: false,

  PALETTES: [
    { a: '#0F766E', b: '#0A4F49', s: 'rgba(15,118,110,.10)' },
    { a: '#B8860B', b: '#8A6410', s: 'rgba(184,134,11,.12)' },
    { a: '#C2542D', b: '#8E3A1D', s: 'rgba(194,84,45,.11)' },
    { a: '#4A55A2', b: '#333C7A', s: 'rgba(74,85,162,.11)' },
    { a: '#7B3F8C', b: '#572A64', s: 'rgba(123,63,140,.11)' },
    { a: '#5B7A2B', b: '#40571D', s: 'rgba(91,122,43,.12)' },
    { a: '#A8623B', b: '#7B4527', s: 'rgba(168,98,59,.11)' },
    { a: '#1F6FA8', b: '#154E78', s: 'rgba(31,111,168,.11)' },
    { a: '#B34A6B', b: '#85354E', s: 'rgba(179,74,107,.11)' },
    { a: '#4A6070', b: '#324450', s: 'rgba(74,96,112,.11)' },
    { a: '#8A6A1E', b: '#634B12', s: 'rgba(138,106,30,.12)' },
    { a: '#146B52', b: '#0B4433', s: 'rgba(20,107,82,.11)' },
  ],
  TEMPLATES: ['arch', 'ribbon', 'geo', 'glass', 'parch', 'night'],

  // ---------- أدوات ----------
  _loc() {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
    return ['ar', 'es', 'en'].includes(l) ? l : 'ar';
  },
  _L(ar, es, en) { const l = this._loc(); return l === 'es' ? es : (l === 'en' ? en : ar); },
  _esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
  _js(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  _txt(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
      const l = this._loc();
      return v[l] || v.es || v.en || v.ar || '';
    }
    return String(v);
  },
  _hash(s) {
    let h = 0;
    const str = String(s || '');
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  },

  // ---------- حالة اليوم ----------
  _dayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  },
  _day() {
    try {
      const s = JSON.parse(localStorage.getItem('quba_dq_day') || 'null');
      if (s && s.date === this._dayKey()) return { date: s.date, c: s.c || {}, d: s.d || [] };
    } catch (e) {}
    return { date: this._dayKey(), c: {}, d: [] };
  },
  _saveDay(s) { try { localStorage.setItem('quba_dq_day', JSON.stringify(s)); } catch (e) {} },

  _sets() { return (typeof AdhkarPage !== 'undefined' && AdhkarPage.SETS) ? AdhkarPage.SETS : []; },

  // ---------- الهَب ----------
  async renderHub(container) {
    this.view = 'hub';
    const day = this._day();
    const sets = this._sets();
    const doneSets = sets.filter(s => day.d.indexOf('set:' + s.id) !== -1).length;
    const todayXp = (typeof Gamification !== 'undefined' && Gamification.getTodayXp) ? Gamification.getTodayXp() : 0;
    const dir = (typeof document !== 'undefined' && document.documentElement.dir === 'rtl') ? 'rtl' : 'ltr';
    const back = (dir === 'rtl') ? 'fa-chevron-right' : 'fa-chevron-left';

    container.innerHTML = `
      <div class="dq-page">
        <div class="dq-hero">
          <div class="dq-hero-top">
            <button class="dq-hero-back" onclick="Router.go('wisdom')" aria-label="back"><i class="fas ${back}"></i></button>
            <div style="flex:1;min-width:0;">
              <div class="dq-hero-t">${this._L('الأدعية والأذكار', "Du'as y Adhkar", "Du'as & Adhkar")}</div>
              <div class="dq-hero-s">${this._L('مأثورات النبي ﷺ · موثّقة بمصادرها', 'Invocaciones del Profeta ﷺ · con su fuente', 'Prophetic invocations ﷺ · with sources')}</div>
            </div>
          </div>
          <div class="dq-hero-chips">
            <span class="dq-chip"><i class="fas fa-list-check"></i> ${this._L('أذكار اليوم', 'Adhkar de hoy', 'Today')} <b>${doneSets}/${sets.length}</b></span>
            <span class="dq-chip"><i class="fas fa-bolt"></i> ${this._L('نقاط اليوم', 'XP de hoy', 'Today XP')} <b>+${todayXp}</b></span>
          </div>
        </div>

        <div class="dq-tabs">
          <button class="dq-tab ${this.tab === 'adhkar' ? 'on' : ''}" onclick="DuaAdhkarPage.switchTab('adhkar')">
            <i class="fas fa-mosque"></i> ${this._L('الأذكار', 'Adhkar', 'Adhkar')}
          </button>
          <button class="dq-tab ${this.tab === 'duas' ? 'on' : ''}" onclick="DuaAdhkarPage.switchTab('duas')">
            <i class="fas fa-hands-praying"></i> ${this._L('الأدعية', "Du'as", "Du'as")}
          </button>
        </div>

        <div class="dq-search">
          <i class="fas fa-magnifying-glass"></i>
          <input id="dq-q" type="search" value="${this._esc(this._q)}" placeholder="${this._L('ابحث في الأذكار والأدعية…', 'Buscar en adhkar y du\'as…', 'Search adhkar and du\'as…')}" oninput="DuaAdhkarPage.onSearch(this.value)">
        </div>

        <div id="dq-body">${this._body()}</div>
      </div>`;

    if (this.tab === 'duas' && !this._cats) await this.loadCats();
  },

  _body() {
    if (this.tab === 'adhkar') return this._setsHtml();
    return this._catsHtml();
  },

  switchTab(tab) {
    this.tab = tab;
    this._q = '';
    const body = document.getElementById('dq-body');
    const q = document.getElementById('dq-q');
    if (q) q.value = '';
    document.querySelectorAll('.dq-tab').forEach((el, i) => {
      el.classList.toggle('on', (i === 0 && tab === 'adhkar') || (i === 1 && tab === 'duas'));
    });
    if (body) body.innerHTML = this._body();
    if (tab === 'duas' && !this._cats) this.loadCats();
  },

  onSearch(v) {
    this._q = String(v || '').trim().toLowerCase();
    const body = document.getElementById('dq-body');
    if (body) body.innerHTML = this._body();
  },

  // ---------- تبويب الأذكار ----------
  _setsHtml() {
    const day = this._day();
    const sets = this._sets();
    if (!sets.length) return `<div class="dq-empty"><i class="fas fa-inbox"></i>${this._L('لا توجد مجموعات', 'Sin colecciones', 'No collections')}</div>`;
    const q = this._q;
    const rows = sets.filter(s => {
      if (!q) return true;
      const n = (this._txt ? '' : '') + (t(s.nameKey) || s.id) + ' ' + s.id;
      return n.toLowerCase().includes(q);
    }).map(s => {
      const data = s.data ? s.data() : [];
      const done = day.d.indexOf('set:' + s.id) !== -1;
      const partial = data.filter(d => (day.c[d.id] || 0) >= (d.times || 1)).length;
      const pct = data.length ? Math.round((partial / data.length) * 100) : 0;
      return `<button class="dq-set" onclick="DuaAdhkarPage.openSet('${this._js(s.id)}')"
                style="--a:${s.color};--a-soft:${s.color}22;">
          ${done ? `<span class="dq-set-done"><i class="fas fa-check"></i></span>` : ''}
          <span class="dq-set-ic">${s.icon}</span>
          <span class="dq-set-n">${this._esc(t(s.nameKey) || s.id)}</span>
          <span class="dq-set-m">${data.length} ${this._L('ذكر', 'adhkar', 'adhkar')}</span>
          <span class="dq-set-bar"><span style="width:${pct}%"></span></span>
        </button>`;
    }).join('');
    if (!rows) return `<div class="dq-empty"><i class="fas fa-magnifying-glass"></i>${this._L('لا نتائج', 'Sin resultados', 'No results')}</div>`;
    return `<div class="dq-grid">${rows}</div>
      <div class="dq-note"><i class="fas fa-lightbulb"></i>
        <span>${this._L('اضغط على أي مجموعة لقراءتها. كل بطاقة لها شكلها ولونها، والعدّاد يحفظ تقدّمك لليوم.', 'Toca una colección para leerla. Cada tarjeta tiene su forma y color, y el contador guarda tu progreso del día.', 'Tap a collection to read it. Every card has its own shape and colour, and the counter saves today\'s progress.')}</span>
      </div>`;
  },

  // ---------- تبويب الأدعية ----------
  async loadCats() {
    const body = document.getElementById('dq-body');
    if (body) body.innerHTML = `<div class="dq-empty"><i class="fas fa-spinner fa-spin"></i>${this._L('جارٍ التحميل…', 'Cargando…', 'Loading…')}</div>`;
    let cats = [];
    try {
      cats = await API.getDuaCategories();
    } catch (e) { cats = []; }
    if ((!cats || !cats.length) && typeof LOCAL_DUAS !== 'undefined' && LOCAL_DUAS.categories) {
      cats = LOCAL_DUAS.categories.map(c => ({
        id: c.id, name: c.name_en, name_es: c.name_es, name_ar: c.name_ar,
        icon: c.icon, color: c.color, count: (c.duas || []).length,
      }));
    }
    this._cats = cats || [];
    if (body && this.tab === 'duas') body.innerHTML = this._catsHtml();
  },

  _catName(c) {
    const l = this._loc();
    if (l === 'ar') return c.name_ar || c.name || c.name_en || c.id;
    if (l === 'es') return c.name_es || c.name || c.name_en || c.id;
    return c.name_en || c.name || c.id;
  },

  _catsHtml() {
    const cats = this._cats;
    if (cats === null) return `<div class="dq-empty"><i class="fas fa-spinner fa-spin"></i>${this._L('جارٍ التحميل…', 'Cargando…', 'Loading…')}</div>`;
    const q = this._q;
    const list = (cats || []).filter(c => !q || this._catName(c).toLowerCase().includes(q));
    if (!list.length) return `<div class="dq-empty"><i class="fas fa-magnifying-glass"></i>${this._L('لا نتائج', 'Sin resultados', 'No results')}</div>`;
    return `<div class="dq-grid">${list.map(c => {
      const color = c.color || '#0F766E';
      return `<button class="dq-set" onclick="DuaAdhkarPage.openCategory('${this._js(c.id)}')"
                style="--a:${color};--a-soft:${color}22;">
          <span class="dq-set-ic">${c.icon || '<i class="fas fa-hands-praying"></i>'}</span>
          <span class="dq-set-n">${this._esc(this._catName(c))}</span>
          <span class="dq-set-m">${c.count || 0} ${this._L('دعاء', 'du\'as', 'du\'as')}</span>
        </button>`;
    }).join('')}</div>
    <div class="dq-note"><i class="fas fa-shield-halved"></i>
      <span>${this._L('الأدعية من «حصن المسلم» وغيره من المصادر المعتمدة، وكل دعاء مذكور بمرجعه.', 'Du\'as de "Fortaleza del Musulmán" y otras fuentes verificadas, cada una con su referencia.', 'Du\'as from Fortress of the Muslim and other verified sources, each with its reference.')}</span>
    </div>`;
  },

  // ---------- فتح مجموعة أذكار ----------
  openSet(setId) {
    const set = this._sets().find(s => s.id === setId);
    if (!set) { this.renderHub(document.getElementById('main-content')); return; }
    const data = set.data ? set.data() : [];
    this._renderList({
      kind: 'set', id: set.id, title: t(set.nameKey) || set.id,
      items: data, color: set.color || '#0F766E', icon: set.icon, meta: `${data.length} ${this._L('ذكر', 'adhkar', 'adhkar')}`,
    });
  },

  // ---------- فتح فئة أدعية ----------
  async openCategory(catId) {
    const container = document.getElementById('main-content');
    const cat = (this._cats || []).find(c => String(c.id) === String(catId));
    const color = (cat && cat.color) || '#0F766E';
    const title = cat ? this._catName(cat) : catId;
    if (container) {
      container.innerHTML = `<div class="dq-empty" style="padding-top:70px;"><i class="fas fa-spinner fa-spin"></i>${this._L('جارٍ التحميل…', 'Cargando…', 'Loading…')}</div>`;
    }
    let duas = [];
    try { duas = await API.getDuasByCategory(catId); } catch (e) { duas = []; }
    if (!duas || !duas.length) {
      if (typeof LOCAL_DUAS !== 'undefined' && LOCAL_DUAS.categories) {
        const c = LOCAL_DUAS.categories.find(x => String(x.id) === String(catId));
        if (c) duas = (c.duas || []).map(d => Object.assign({}, d, { title: d.title || (d.translation_en || '') }));
      }
    }
    if (!duas || !duas.length) {
      if (container) container.innerHTML = `<div class="dq-empty"><i class="fas fa-triangle-exclamation"></i>${this._L('تعذّر تحميل الأدعية', 'No se pudieron cargar', 'Could not load')}
        <div style="margin-top:14px;"><button class="dq-count" style="width:auto;padding:10px 18px;" onclick="DuaAdhkarPage.openCategory('${this._js(catId)}')">${this._L('إعادة المحاولة', 'Reintentar', 'Retry')}</button></div></div>`;
      return;
    }
    this._renderList({
      kind: 'cat', id: catId, title, items: duas, color,
      icon: (cat && cat.icon) || '<i class="fas fa-hands-praying"></i>',
      meta: `${duas.length} ${this._L('دعاء', 'du\'as', 'du\'as')}`,
    });
  },

  // ---------- تطبيع عنصر (أذكار أو أدعية) ----------
  _norm(d, kind) {
    const l = this._loc();
    const pick = (base) => d[base + '_' + l] || d[base + '_en'] || d[base] || '';
    return {
      id: String(d.id !== undefined ? d.id : (d.title || Math.random())),
      title: this._txt(d.title) || pick('translation').slice(0, 60) || this._L('دعاء', "Du'a", "Du'a"),
      arabic: d.arabic || d.arabic_text || '',
      translit: d.transliteration || '',
      mean: (kind === 'cat') ? (d['translation_' + l] || d.translation || '') : this._txt(d.translation),
      benefit: (kind === 'cat') ? (d['virtue_' + l] || d.virtue || '') : this._txt(d.benefit),
      source: this._txt(d.source) || d.reference || '',
      times: Number(d.times || d.repeat || 1) || 1,
    };
  },

  // ---------- القائمة (بطاقات) ----------
  _renderList(opt) {
    const container = document.getElementById('main-content');
    if (!container) return;
    const items = (opt.items || []).map(d => this._norm(d, opt.kind));
    this._current = { kind: opt.kind, id: opt.id, title: opt.title, items, color: opt.color, icon: opt.icon };
    const day = this._day();
    const doneN = items.filter(it => (day.c[it.id] || 0) >= it.times).length;
    const pct = items.length ? Math.round((doneN / items.length) * 100) : 0;
    const dir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
    const back = dir === 'rtl' ? 'fa-chevron-right' : 'fa-chevron-left';
    const c = opt.color || '#0F766E';
    const xp = (typeof Gamification !== 'undefined') ? (Gamification.XP_PER_ADHKAR_SET || 30) : 30;

    container.innerHTML = `
      <div class="dq-page">
        <div class="dq-listhead" style="--a:${c};--b:${c}cc;">
          <div class="dq-lh-row">
            <button class="dq-hero-back" onclick="DuaAdhkarPage.back()" aria-label="back"><i class="fas ${back}"></i></button>
            <div style="flex:1;min-width:0;">
              <div class="dq-lh-t">${this._esc(opt.title)}</div>
              <div class="dq-lh-m">${this._esc(opt.meta || '')}</div>
            </div>
          </div>
          <div class="dq-lh-bar"><span id="dq-prog" style="width:${pct}%"></span></div>
        </div>
        <div id="dq-cards">
          ${items.map((it, i) => this._card(it, i, c)).join('')}
        </div>
        <button class="dq-complete" id="dq-complete" style="--a:${c};--b:${c}cc;" onclick="DuaAdhkarPage.completeSet()">
          <i class="fas fa-circle-check"></i>
          <span>${this._L('أتممتُ هذه المجموعة', 'He completado la colección', 'I completed this collection')} · +${xp} XP</span>
        </button>
      </div>`;
  },

  // ---------- بطاقة واحدة بقالب ولون خاصين ----------
  _card(it, idx, catColor) {
    const h = this._hash(it.id + ':' + idx);
    const pal = this.PALETTES[h % this.PALETTES.length];
    // مزيج لون الفئة مع لون البطاقة: نضمن التنوّع داخل نفس الفئة
    const a = (idx % 3 === 0) ? catColor : pal.a;
    const b = (idx % 3 === 0) ? catColor : pal.b;
    const tpl = this.TEMPLATES[(h >> 4) % this.TEMPLATES.length];
    const day = this._day();
    const cnt = day.c[it.id] || 0;
    const done = cnt >= it.times;
    const num = String(idx + 1).padStart(2, '0');
    const bm = this._bookmarked(it.id);

    return `<article class="dq-card dq-tpl-${tpl}" id="dq-c-${this._esc(it.id)}"
              style="--a:${a};--b:${b};--a-soft:${pal.s};">
      <div class="dq-head">
        <span class="dq-idx">${num}</span>
        <h3 class="dq-title">${this._esc(it.title)}</h3>
        ${it.times > 1 ? `<span class="dq-times">×${it.times}</span>` : ''}
      </div>
      <div class="dq-ar" dir="rtl">${this._esc(it.arabic)}</div>
      ${it.translit ? `<div class="dq-tr">${this._esc(it.translit)}</div>` : ''}
      ${it.mean ? `<div class="dq-mean">${this._esc(it.mean)}</div>` : ''}
      ${it.benefit ? `<div class="dq-benefit"><i class="fas fa-star"></i><span>${this._esc(it.benefit)}</span></div>` : ''}
      <div class="dq-foot">
        <span class="dq-src">${it.source ? '— ' + this._esc(it.source) : ''}</span>
        <span class="dq-acts">
          <button class="dq-act" onclick="DuaAdhkarPage.copy('${this._js(it.id)}')" aria-label="copy"><i class="fas fa-copy"></i></button>
          <button class="dq-act" onclick="DuaAdhkarPage.share('${this._js(it.id)}')" aria-label="share"><i class="fas fa-share-alt"></i></button>
          <button class="dq-act ${bm ? 'on' : ''}" id="dq-bm-${this._esc(it.id)}" onclick="DuaAdhkarPage.bookmark('${this._js(it.id)}')" aria-label="bookmark"><i class="${bm ? 'fas' : 'far'} fa-bookmark"></i></button>
        </span>
      </div>
      <button class="dq-count ${done ? 'done' : ''}" id="dq-btn-${this._esc(it.id)}" onclick="DuaAdhkarPage.tap('${this._js(it.id)}', ${it.times})">
        <i class="fas ${done ? 'fa-circle-check' : 'fa-hand-pointer'}"></i>
        <span>${done ? this._L('تمّ', 'Hecho', 'Done') : this._L('اضغط للعدّ', 'Toca para contar', 'Tap to count')}</span>
        <span class="dq-prog" id="dq-txt-${this._esc(it.id)}">${cnt} / ${it.times}</span>
      </button>
    </article>`;
  },

  // ---------- العدّ ----------
  tap(id, times) {
    const day = this._day();
    const target = Number(times) || 1;
    const cur = day.c[id] || 0;
    if (cur >= target) return;
    day.c[id] = cur + 1;
    this._saveDay(day);
    try { if (navigator.vibrate) navigator.vibrate(14); } catch (e) {}

    const txt = document.getElementById('dq-txt-' + id);
    if (txt) txt.textContent = day.c[id] + ' / ' + target;

    if (day.c[id] >= target) {
      const btn = document.getElementById('dq-btn-' + id);
      if (btn) {
        btn.classList.add('done');
        btn.innerHTML = `<i class="fas fa-circle-check"></i><span>${this._L('تمّ', 'Hecho', 'Done')}</span><span class="dq-prog">${target} / ${target}</span>`;
      }
      try { if (navigator.vibrate) navigator.vibrate([50, 35, 50]); } catch (e) {}
      // نقاط صغيرة لكل ذكر يُكمَل — مرّة واحدة في اليوم (منع التكرار)
      if (typeof Gamification !== 'undefined' && Gamification.awardOnce) {
        const got = Gamification.awardOnce('adhkar_card', id, Gamification.XP_PER_ADHKAR_CARD || 2);
        if (got) this._toast(`✅ +${got} XP`);
      }
    }
    this._progress();
  },

  _progress() {
    const cur = this._current;
    if (!cur) return;
    const day = this._day();
    const doneN = cur.items.filter(it => (day.c[it.id] || 0) >= it.times).length;
    const pct = cur.items.length ? Math.round((doneN / cur.items.length) * 100) : 0;
    const bar = document.getElementById('dq-prog');
    if (bar) bar.style.width = pct + '%';
  },

  // ---------- إتمام المجموعة ----------
  completeSet() {
    const cur = this._current;
    if (!cur) return;
    const day = this._day();
    if (cur.kind === 'set' && day.d.indexOf('set:' + cur.id) === -1) {
      day.d.push('set:' + cur.id);
      this._saveDay(day);
    }
    let got = 0;
    if (typeof Gamification !== 'undefined') {
      if (Gamification.recordAdhkarCompleted && cur.kind === 'set') Gamification.recordAdhkarCompleted(cur.id);
      if (Gamification.awardOnce) got = Gamification.awardOnce('adhkar_set', cur.id, Gamification.XP_PER_ADHKAR_SET || 30);
    }
    this._toast(got
      ? `🎉 ${cur.title} · +${got} XP`
      : `✔ ${this._L('سُجّل اليوم مسبقًا', 'Ya registrado hoy', 'Already recorded today')}`);
    setTimeout(() => this.back(), 900);
  },

  back() {
    const container = document.getElementById('main-content');
    if (container) this.renderHub(container);
  },

  // ---------- نسخ/مشاركة/مفصّلة ----------
  _item(id) {
    if (!this._current) return null;
    return this._current.items.find(x => String(x.id) === String(id)) || null;
  },
  _text(it) {
    const lines = [it.title, '', it.arabic];
    if (it.translit) lines.push('', it.translit);
    if (it.mean) lines.push('', it.mean);
    if (it.source) lines.push('', '— ' + it.source);
    lines.push('', '📱 Quba App');
    return lines.join('\n');
  },
  async _copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    }
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(ta); ta.focus(); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  },
  async copy(id) {
    const it = this._item(id);
    if (!it) return;
    const ok = await this._copyText(this._text(it));
    this._toast(ok ? '📋 ' + this._L('نُسخ', 'Copiado', 'Copied') : '⚠️ ' + this._L('تعذّر النسخ', 'Error', 'Failed'));
  },
  async share(id) {
    const it = this._item(id);
    if (!it) return;
    const text = this._text(it);
    if (navigator.share) {
      try { await navigator.share({ title: it.title, text }); } catch (e) {}
    } else {
      const ok = await this._copyText(text);
      this._toast(ok ? '📋 ' + this._L('نُسخ للمشاركة', 'Copiado', 'Copied') : '⚠️');
    }
  },
  _bookmarks() {
    const raw = (typeof Storage !== 'undefined') ? Storage.get('dua_bookmarks') : null;
    return Array.isArray(raw) ? raw.map(String) : [];
  },
  _bookmarked(id) { return this._bookmarks().includes(String(id)); },
  bookmark(id) {
    const list = this._bookmarks();
    const i = list.indexOf(String(id));
    const btn = document.getElementById('dq-bm-' + id);
    if (i >= 0) { list.splice(i, 1); if (btn) { btn.classList.remove('on'); btn.innerHTML = '<i class="far fa-bookmark"></i>'; } this._toast('🤍 ' + this._L('أُزيل', 'Quitado', 'Removed')); }
    else { list.push(String(id)); if (btn) { btn.classList.add('on'); btn.innerHTML = '<i class="fas fa-bookmark"></i>'; } this._toast('❤️ ' + this._L('حُفظ', 'Guardado', 'Saved')); }
    if (typeof Storage !== 'undefined') Storage.set('dua_bookmarks', list);
  },
  _toast(msg) {
    if (typeof showToast === 'function') showToast(msg, 2000);
  },

  cleanup() {},
};

if (typeof window !== 'undefined') window.DuaAdhkarPage = DuaAdhkarPage;
