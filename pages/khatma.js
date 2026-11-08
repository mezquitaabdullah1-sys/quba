// 📗 v1.0.134 — شاشات ختمة القرآن والورد
const KhatmaPage = {
  form: null,

  L(ar, es, en) {
    let loc = 'ar';
    try { loc = (AppState && AppState.settings && AppState.settings.locale) || 'ar'; } catch (e) {}
    return loc === 'ar' ? ar : (loc === 'en' ? en : es);
  },
  ar(n) { return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]); },
  esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },

  render(container, params = {}) {
    const root = container || document.getElementById('main-content');
    if (!root) return;
    const view = params.view || '';
    if (view === 'create') return this.renderCreate(root);
    if (view === 'day') return this.renderDay(root);
    return this.renderHub(root);
  },

  // ================= الرئيسية =================
  renderHub(root) {
    const k = KhatmaStore.active();
    const L = (a, e, en) => this.L(a, e, en);
    const head = `
      <div class="kht-head">
        <button class="kht-ic" onclick="Router.go('quran')" aria-label="back"><i class="fas fa-chevron-right"></i></button>
        <div class="kht-ttl">
          <b>${L('ختمة القرآن والورد', 'Jatma y Wird', 'Khatma & Ward')}</b>
          <em>${L('تتبّع حقيقي · توزيع على الأرباع · تذكير', 'Seguimiento real · cuartos · recordatorio', 'Real tracking · quarters · reminders')}</em>
        </div>
        <button class="kht-ic" onclick="Router.go('quran/khatma',{view:'create'})" aria-label="add"><i class="fas fa-plus"></i></button>
      </div>`;

    if (!k) {
      root.innerHTML = `<div class="kht-wrap" dir="rtl">
        ${head}
        <div class="kht-empty">
          <div class="kht-empty-orn"><i class="fas fa-book-quran"></i></div>
          <h2>${L('ابدأ ختمتك الأولى', 'Empieza tu primera jatma', 'Start your first khatma')}</h2>
          <p>${L('حدّد المدة، ونوزّع عليك الصفحات على أيامك — مع ورد يومي محاذى لبدايات الأرباع، وتذكير لا يفوتك.', 'Elige la duración y repartimos las páginas por días, con wird diario alineado a los cuartos y recordatorio.', 'Pick a duration and we split the pages across your days — with a ward aligned to quarter starts and a reminder.')}</p>
          <button class="kht-btn kht-btn-main" onclick="Router.go('quran/khatma',{view:'create'})"><i class="fas fa-wand-magic-sparkles"></i> ${L('إنشاء ختمة', 'Crear jatma', 'Create khatma')}</button>
          <div class="kht-feats">
            <div class="kht-feat"><i class="fas fa-fingerprint"></i><b>${L('تقدّم من قراءتك فعلًا', 'Progreso real', 'Real progress')}</b><span>${L('الصفحة تُحتسب بعد ١٢ ثانية مكوث وتقليب', 'La página cuenta tras 12 s', 'A page counts after 12 s')}</span></div>
            <div class="kht-feat"><i class="fas fa-border-all"></i><b>${L('ورد على الأرباع', 'Wird por cuartos', 'Ward by quarters')}</b><span>${L('٢٤٠ ربعًا ÷ أيامك = بداية منظّمة كل يوم', '240 cuartos ÷ días', '240 quarters ÷ your days')}</span></div>
            <div class="kht-feat"><i class="fas fa-bell"></i><b>${L('تذكير يومي', 'Recordatorio', 'Daily reminder')}</b><span>${L('إشعار بقناة مستقلة لا يزاحم الأذان', 'Canal propio', 'Own channel')}</span></div>
          </div>
        </div>
      </div>`;
      return;
    }

    const pr = KhatmaStore.progress(k);
    const wr = KhatmaStore.wardProgress(k);
    const plan = KhatmaStore.plan(k);
    const w = wr.ward;
    const totalDays = plan.length;
    const dayNo = w ? w.i : 0;
    const R = 54, C = 2 * Math.PI * R;
    const dash = (pr.pct / 100) * C;

    // v1.0.160: ختمة لم تبدأ بعد كانت تُعرض كأنها «ورد اليوم» وتُفتح للقراءة.
    const wardLine = (w && w.before)
      ? `${L('تبدأ في', 'Empieza el', 'Starts')} ${w.date} · ${KhatmaStore.rangeLabel(k, w)}`
      : ((w && !w.rest && w.pages > 0)
        ? `${KhatmaStore.rangeLabel(k, w)} · ${this.ar(w.pages)} ${L('صفحات', 'págs', 'pages')} · ≈ ${this.ar(KhatmaStore.estMinutes(w.pages))} ${L('د', 'min', 'min')}`
        : (w && w.rest ? L('يوم راحة — لا ورد اليوم', 'Día de descanso', 'Rest day') : L('لا ورد محدَّد', 'Sin wird', 'No ward')));

    const todayCard = `
      <div class="kht-today">
        <div class="kht-today-top">
          <span class="kht-today-k">${L('ورد اليوم', 'Wird de hoy', "Today's ward")} · <b class="kht-today-name">${this.esc(k.name || '')}</b></span>
          <span class="kht-today-d">${dayNo ? `${L('اليوم', 'Día', 'Day')} ${this.ar(dayNo)} / ${this.ar(totalDays)}` : ''}</span>
        </div>
        <div class="kht-today-range">${this.esc(wardLine)}</div>
        <div class="kht-today-bar"><i style="width:${wr.pct}%"></i></div>
        <div class="kht-today-meta">
          <span>${this.ar(wr.done)} / ${this.ar(wr.total || 0)} ${L('صفحة', 'pág', 'pg')}</span>
          <span>${wr.pct}%</span>
        </div>
        <div class="kht-today-btns">
          <button class="kht-btn kht-btn-main" onclick="KhatmaPage.openWard()"><i class="fas fa-book-open"></i> ${L('افتح الورد', 'Abrir wird', 'Open ward')}</button>
          <button class="kht-btn kht-btn-ghost" onclick="KhatmaPage.openWard(true)"><i class="fas fa-book-quran"></i> ${L('من المصحف', 'Mushaf', 'Mushaf')}</button>
        </div>
      </div>`;

    const heat = this._heatmap(k);
    const stats = `
      <div class="kht-stats">
        <div class="kht-stat"><b>${this.ar(pr.read)}</b><span>${L('صفحة مقروءة', 'leídas', 'pages read')}</span></div>
        <div class="kht-stat"><b>${this.ar(pr.pct)}%</b><span>${L('من الختمة', 'de la jatma', 'of khatma')}</span></div>
        <div class="kht-stat"><b>${this.ar(KhatmaStore.streak(k))}</b><span>${L('يوم متتابع', 'días seguidos', 'day streak')}</span></div>
      </div>`;

    root.innerHTML = `<div class="kht-wrap" dir="rtl">
      ${head}
      <div class="kht-hero">
        <div class="kht-ring">
          <svg viewBox="0 0 130 130" aria-hidden="true">
            <circle cx="65" cy="65" r="${R}" class="kht-ring-bg"></circle>
            <circle cx="65" cy="65" r="${R}" class="kht-ring-fg" style="stroke-dasharray:${dash} ${C}"></circle>
          </svg>
          <div class="kht-ring-in">
            <b>${pr.pct}%</b>
            <em>${this.ar(pr.read)} / ${this.ar(pr.total)}</em>
          </div>
        </div>
        <div class="kht-hero-tx">
          <h2>${this.esc(k.name || this.L('ختمتي', 'Mi jatma', 'My khatma'))}</h2>
          <div class="kht-chips">
            <span class="kht-chip"><i class="fas fa-calendar"></i> ${this.ar(k.days)} ${L('يوم', 'días', 'days')}</span>
            <span class="kht-chip"><i class="fas fa-layer-group"></i> ${k.unit === 'rub' ? L('أرباع', 'cuartos', 'quarters') : L('صفحات', 'páginas', 'pages')}</span>
            ${k.dir === -1 ? `<span class="kht-chip"><i class="fas fa-arrow-down-wide-short"></i> ${L('معكوسة', 'inversa', 'reversed')}</span>` : ''}
            ${k.rest && k.rest.length ? `<span class="kht-chip"><i class="fas fa-mug-hot"></i> ${this.ar(k.rest.length)} ${L('راحة', 'descanso', 'rest')}</span>` : ''}
          </div>
          ${k.intent ? `<div class="kht-intent"><i class="fas fa-heart"></i> ${this.esc(k.intent)}</div>` : ''}
        </div>
      </div>
      ${todayCard}
      ${stats}
      ${this._listHtml()}
      <div class="kht-sec-h"><b>${L('آخر ٣٠ يومًا', 'Últimos 30 días', 'Last 30 days')}</b><span>${L('كل مربّع يوم', 'cada cuadro = un día', 'each square = a day')}</span></div>
      <div class="kht-heat">${heat}</div>
      <div class="kht-plan">
        <div class="kht-sec-h"><b>${L('خطة الختمة', 'Plan', 'Plan')}</b><span>${this.ar(totalDays)} ${L('وردًا', 'wirds', 'wards')}</span></div>
        <div class="kht-plan-list">${plan.slice(0, 40).map(x => this._planRow(k, x)).join('')}</div>
        ${plan.length > 40 ? `<div class="kht-more">${L('+ بقية الأيام', '+ resto', '+ rest')}</div>` : ''}
      </div>
      <div class="kht-actions">
        <button class="kht-act" onclick="KhatmaPage.openSettings()"><i class="fas fa-sliders"></i> ${L('تعديل الخطة', 'Editar', 'Edit plan')}</button>
        <button class="kht-act" onclick="KhatmaPage.markAllToday()"><i class="fas fa-check-double"></i> ${L('أتممت ورد اليوم', "Completé el wird", "I finished today's ward")}</button>
        <button class="kht-act" onclick="KhatmaPage.gaps()"><i class="fas fa-magnifying-glass"></i> ${L('صفحات لم تُقرأ', 'Sin leer', 'Unread pages')}</button>
        <button class="kht-act kht-danger" onclick="KhatmaPage.confirmDelete()"><i class="fas fa-trash"></i> ${L('حذف الختمة', 'Eliminar', 'Delete')}</button>
      </div>
    </div>`;
  },

  // v1.0.137: قائمة كل الختمات — وصول ومتابعة وتحكّم وتذكير وحذف
  _listHtml() {
    let list = [];
    try { list = KhatmaStore.all() || []; } catch (e) { list = []; }
    if (!list.length) return '';
    const L = (a, e, en) => this.L(a, e, en);
    let activeId = null;
    // v1.0.145: الواجهة تقرأ «النشطة» من نفس مصدر التنفيذ (active) لا من
    // الحقل الخام — كانا قد يختلفان فتُعلَّم ختمة ويُفتح ورد أخرى.
    try { const cur = KhatmaStore.active(); activeId = cur && cur.id; } catch (e) {}
    const rows = list.slice().sort((a, b) => (b.created || 0) - (a.created || 0)).map(k => {
      let pr = { read: 0, total: 604, pct: 0 };
      try { pr = KhatmaStore.progress(k); } catch (e) {}
      const isA = k.id === activeId;
      const rem = !!(k.remind && k.remind.on);
      const time = rem ? `${String((k.remind.hour | 0)).padStart(2, '0')}:${String((k.remind.minute | 0)).padStart(2, '0')}` : '';
      return `<div class="kht-lrow${isA ? ' is-active' : ''}">
        <button class="kht-lmain" onclick="KhatmaPage.switchTo('${k.id}')">
          <span class="kht-lpct" style="--p:${pr.pct}"><b>${this.ar(pr.pct)}%</b></span>
          <span class="kht-ltx">
            <b>${this.esc(k.name || '')}</b>
            <em>${this.ar(pr.read)}/${this.ar(pr.total)} ${L('صفحة', 'págs', 'pages')} · ${this.ar(k.days)} ${L('يوم', 'días', 'days')}${time ? ' · ⏰ ' + time : ''}</em>
          </span>
          ${isA ? `<span class="kht-lnow">${L('الحالية', 'Actual', 'Current')}</span>` : `<span class="kht-lgo"><i class="fas fa-arrow-left"></i></span>`}
        </button>
        <button class="kht-lbtn${rem ? ' is-on' : ''}" onclick="event.stopPropagation();KhatmaPage.toggleRemindOf('${k.id}')" aria-label="${L('تذكير', 'Recordatorio', 'Reminder')}" title="${L('تذكير', 'Recordatorio', 'Reminder')}"><i class="fas ${rem ? 'fa-bell' : 'fa-bell-slash'}"></i></button>
        <button class="kht-lbtn kht-lbtn-del" onclick="event.stopPropagation();KhatmaPage.confirmDeleteOf('${k.id}')" aria-label="${L('حذف', 'Eliminar', 'Delete')}" title="${L('حذف', 'Eliminar', 'Delete')}"><i class="fas fa-trash"></i></button>
      </div>`;
    }).join('');
    return `<div class="kht-list">
      <div class="kht-sec-h"><b>${L('ختماتي', 'Mis jatmas', 'My khatmas')}</b><span>${this.ar(list.length)}</span></div>
      ${rows}
      <button class="kht-add" onclick="Router.go('quran/khatma',{view:'create'})"><i class="fas fa-plus"></i> ${L('ختمة جديدة', 'Nueva jatma', 'New khatma')}</button>
    </div>`;
  },

  switchTo(id) {
    const k = KhatmaStore.setActive(id);
    if (!k) return;
    // v1.0.145: تحقّق فعلي بعد التبديل — لا نُعلن ختمة ونعمل على أخرى
    const now = KhatmaStore.active();
    try { showToast(this.L('الختمة الحالية: ', 'Jatma actual: ', 'Current: ') + ((now && now.name) || k.name || ''), 1500); } catch (e) {}
    this.render(null, {});
  },
  toggleRemindOf(id) {
    const on = KhatmaStore.toggleRemind(id);
    if (on === null) return;
    try { showToast(on ? this.L('تشغيل التذكير لهذه الختمة', 'Recordatorio activado', 'Reminder on') : this.L('إيقاف التذكير', 'Recordatorio desactivado', 'Reminder off'), 1400); } catch (e) {}
    this.render(null, {});
  },
  confirmDeleteOf(id) {
    const k = KhatmaStore.get(id); if (!k) return;
    this._delId = id;
    this._sheet(this.L('حذف الختمة', 'Eliminar jatma', 'Delete khatma'), `
      <p class="kht-hint"><b>${this.esc(k.name || '')}</b> — ${this.L('سيُحذف سجل القراءة لهذه الختمة نهائيًا.', 'Se borrará su registro de lectura.', 'Its reading log will be erased.')}</p>
      <button class="kht-btn kht-danger" onclick="KhatmaPage.doDeleteId()">${this.L('نعم، احذف', 'Sí, eliminar', 'Yes, delete')}</button>`);
  },
  doDeleteId() {
    const id = this._delId; this._delId = null;
    if (!id) return;
    KhatmaStore.remove(id);
    this.closeSheet();
    this.render(null, {});
  },

  _planRow(k, w) {
    const done = (w.from > 0) ? (function () {
      const set = KhatmaStore.readSet(k); let n = 0;
      for (let p = w.from; p <= w.to; p++) if (set.has(p)) n++;
      return n;
    })() : 0;
    const full = w.pages > 0 && done >= w.pages;
    return `<div class="kht-prow ${full ? 'is-done' : ''} ${w.date === KhatmaStore.today() ? 'is-today' : ''}">
      <span class="kht-pday">${KhatmaStore.arDigits ? KhatmaStore.arDigits(w.i) : this.ar(w.i)}</span>
      <span class="kht-ptxt">${this.esc(KhatmaStore.rangeLabel(k, w))}</span>
      <span class="kht-ppages">${this.ar(w.pages)}</span>
      <i class="fas ${full ? 'fa-circle-check' : 'fa-circle'}"></i>
    </div>`;
  },

  _heatmap(k) {
    const log = k.log || {};
    const out = [];
    const d = new Date(); d.setDate(d.getDate() - 29);
    for (let i = 0; i < 30; i++) {
      const key = KhatmaStore._fmt(d);
      const n = log[key] || 0;
      const cls = n === 0 ? 'kht-h0' : (n < 3 ? 'kht-h1' : (n < 8 ? 'kht-h2' : (n < 15 ? 'kht-h3' : 'kht-h4')));
      out.push(`<i class="${cls}" title="${key} · ${n}"></i>`);
      d.setDate(d.getDate() + 1);
    }
    return out.join('');
  },

  // ================= إنشاء =================
  _defaultForm() {
    return {
      name: '', intent: '', scopeType: 'full', s1: 1, s2: 114, j1: 1, j2: 30, p1: 1, p2: 604,
      dir: 1, days: 30, unit: 'page', rest: [], start: KhatmaStore.today(),
      remindOn: true, hour: 19, minute: 0,
    };
  },

  renderCreate(root) {
    if (!this.form) this.form = this._defaultForm();
    const f = this.form;
    const L = (a, e, en) => this.L(a, e, en);
    const sum = this._summary();

    const durations = [1, 3, 7, 10, 14, 21, 30, 45, 60, 90];
    const days7 = [
      [0, L('الأحد', 'Dom', 'Sun')], [1, L('الاثنين', 'Lun', 'Mon')], [2, L('الثلاثاء', 'Mar', 'Tue')],
      [3, L('الأربعاء', 'Mié', 'Wed')], [4, L('الخميس', 'Jue', 'Thu')], [5, L('الجمعة', 'Vie', 'Fri')], [6, L('السبت', 'Sáb', 'Sat')],
    ];

    root.innerHTML = `<div class="kht-wrap kht-create" dir="rtl">
      <div class="kht-head">
        <button class="kht-ic" onclick="KhatmaPage.cancelCreate()" aria-label="close"><i class="fas fa-xmark"></i></button>
        <div class="kht-ttl"><b>${L('ختمة جديدة', 'Nueva jatma', 'New khatma')}</b><em>${L('كل شيء داخل جهازك — بلا حساب ولا إنترنت', 'Todo local, sin cuenta', 'All local, no account')}</em></div>
      </div>

      <label class="kht-field">
        <span>${L('اسم الختمة', 'Nombre', 'Name')}</span>
        <input id="kht-name" type="text" maxlength="40" value="${this.esc(f.name)}" placeholder="${L('ختمة أمي · ختمة رمضان', 'Jatma de mamá', "Mom's khatma")}" oninput="KhatmaPage.form.name=this.value">
      </label>
      <label class="kht-field">
        <span>${L('النيّة أو الإهداء (اختياري)', 'Intención (opcional)', 'Intention (optional)')}</span>
        <input id="kht-intent" type="text" maxlength="60" value="${this.esc(f.intent)}" placeholder="${L('لروح فلان · بنيّة الشفاء', 'Por el alma de…', 'For the soul of…')}" oninput="KhatmaPage.form.intent=this.value">
      </label>

      <div class="kht-sec">
        <div class="kht-sec-h"><b>${L('النطاق', 'Alcance', 'Scope')}</b></div>
        <div class="kht-chips-row" id="kht-scope-chips">
          ${[['full', L('ختمة كاملة', 'Completa', 'Full')], ['surah', L('سور', 'Suras', 'Suras')], ['juz', L('أجزاء', 'Yuz', 'Juz')], ['page', L('صفحات', 'Páginas', 'Pages')]]
            .map(([v, t]) => `<button class="kht-opt ${f.scopeType === v ? 'is-on' : ''}" data-scope="${v}" onclick="KhatmaPage.set('scopeType','${v}')">${t}</button>`).join('')}
        </div>
        <div id="kht-scope-detail">${this._scopeDetail()}</div>
      </div>

      <div class="kht-sec">
        <div class="kht-sec-h"><b>${L('المدة', 'Duración', 'Duration')}</b><span>${L('يومًا', 'días', 'days')}</span></div>
        <div class="kht-chips-row">
          ${durations.map(d => `<button class="kht-opt ${f.days === d ? 'is-on' : ''}" onclick="KhatmaPage.set('days',${d})">${this.ar(d)}</button>`).join('')}
        </div>
        <div class="kht-inline">
          <label class="kht-mini">${L('أيام مخصّصة', 'Días', 'Custom days')}
            <input id="kht-days" type="number" min="1" max="365" value="${f.days}" onchange="KhatmaPage.setDays(this.value)">
          </label>
          <label class="kht-mini">${L('أو صفحات يوميًا', 'O págs/día', 'Or pages/day')}
            <input id="kht-perday" type="number" min="1" max="604" value="" placeholder="—" onchange="KhatmaPage.setPerDay(this.value)">
          </label>
        </div>
        <p class="kht-hint" id="kht-hint">${L('أقل من ٣ أيام مخالف لهدي النبي ﷺ: «لا يفقه من قرأ القرآن في أقل من ثلاث» — نعرضه لكن لا نرشّحه.', 'Menos de 3 días no es recomendable.', 'Fewer than 3 days is discouraged by the Sunnah.')}</p>
      </div>

      <div class="kht-sec">
        <div class="kht-sec-h"><b>${L('وحدة الورد', 'Unidad', 'Ward unit')}</b></div>
        <div class="kht-chips-row">
          <button class="kht-opt ${f.unit === 'page' ? 'is-on' : ''}" onclick="KhatmaPage.set('unit','page')">${L('صفحات (افتراضي)', 'Páginas', 'Pages')}</button>
          <button class="kht-opt ${f.unit === 'rub' ? 'is-on' : ''}" onclick="KhatmaPage.set('unit','rub')">${L('أرباع — محاذاة دقيقة', 'Cuartos', 'Quarters')}</button>
        </div>
        <div class="kht-chips-row">
          <button class="kht-opt ${f.dir === 1 ? 'is-on' : ''}" onclick="KhatmaPage.set('dir',1)">${L('الفاتحة ← الناس', 'Fātiḥa → Nās', 'Fatiha → Nas')}</button>
          <button class="kht-opt ${f.dir === -1 ? 'is-on' : ''}" onclick="KhatmaPage.set('dir',-1)">${L('الناس ← الفاتحة', 'Nās → Fātiḥa', 'Nas → Fatiha')}</button>
        </div>
      </div>

      <div class="kht-sec">
        <div class="kht-sec-h"><b>${L('أيام الراحة', 'Días de descanso', 'Rest days')}</b><span>${L('اختياري', 'opcional', 'optional')}</span></div>
        <div class="kht-chips-row kht-week">
          ${days7.map(([v, t]) => `<button class="kht-opt kht-opt-sm ${f.rest.indexOf(v) >= 0 ? 'is-on' : ''}" onclick="KhatmaPage.toggleRest(${v})">${t}</button>`).join('')}
        </div>
      </div>

      <div class="kht-sec">
        <div class="kht-sec-h"><b>${L('البداية والتذكير', 'Inicio y recordatorio', 'Start & reminder')}</b></div>
        <div class="kht-chips-row">
          <button class="kht-opt ${f.start === KhatmaStore.today() ? 'is-on' : ''}" onclick="KhatmaPage.setStart(0)">${L('اليوم', 'Hoy', 'Today')}</button>
          <button class="kht-opt" onclick="KhatmaPage.setStart(1)">${L('غدًا', 'Mañana', 'Tomorrow')}</button>
          <label class="kht-opt kht-date">${L('تاريخ', 'Fecha', 'Date')}<input type="date" value="${f.start}" onchange="KhatmaPage.set('start',this.value)"></label>
        </div>
        <div class="kht-remind">
          <label class="kht-switch">
            <input type="checkbox" ${f.remindOn ? 'checked' : ''} onchange="KhatmaPage.set('remindOn',this.checked)">
            <span>${L('تذكير يومي بالورد', 'Recordatorio diario', 'Daily reminder')}</span>
          </label>
          <input type="time" value="${String(f.hour).padStart(2, '0')}:${String(f.minute).padStart(2, '0')}" ${f.remindOn ? '' : 'disabled'} onchange="KhatmaPage.setTime(this.value)">
        </div>
      </div>

      <div class="kht-sum" id="kht-sum">${sum}</div>
      <button class="kht-btn kht-btn-main kht-create-go" onclick="KhatmaPage.save()"><i class="fas fa-check"></i> ${L('ابدأ الختمة', 'Empezar', 'Start khatma')}</button>
    </div>`;
  },

  _scopeDetail() {
    const f = this.form; const L = (a, e, en) => this.L(a, e, en);
    if (f.scopeType === 'surah') {
      const opt = n => `<option value="${n}" ${f.s1 === n ? 'selected' : ''}>${n}. ${KhatmaStore.surahName(n)}</option>`;
      const opt2 = n => `<option value="${n}" ${f.s2 === n ? 'selected' : ''}>${n}. ${KhatmaStore.surahName(n)}</option>`;
      let a = '', b = '';
      for (let i = 1; i <= 114; i++) { a += opt(i); b += opt2(i); }
      return `<div class="kht-inline">
        <label class="kht-mini">${L('من سورة', 'Desde', 'From')}<select onchange="KhatmaPage.set('s1',+this.value)">${a}</select></label>
        <label class="kht-mini">${L('إلى سورة', 'Hasta', 'To')}<select onchange="KhatmaPage.set('s2',+this.value)">${b}</select></label>
      </div>`;
    }
    if (f.scopeType === 'juz') {
      let a = '', b = '';
      for (let i = 1; i <= 30; i++) { a += `<option value="${i}" ${f.j1 === i ? 'selected' : ''}>${i}</option>`; b += `<option value="${i}" ${f.j2 === i ? 'selected' : ''}>${i}</option>`; }
      return `<div class="kht-inline">
        <label class="kht-mini">${L('من جزء', 'Desde', 'From')}<select onchange="KhatmaPage.set('j1',+this.value)">${a}</select></label>
        <label class="kht-mini">${L('إلى جزء', 'Hasta', 'To')}<select onchange="KhatmaPage.set('j2',+this.value)">${b}</select></label>
      </div>`;
    }
    if (f.scopeType === 'page') {
      return `<div class="kht-inline">
        <label class="kht-mini">${L('من صفحة', 'Desde', 'From')}<input type="number" min="1" max="604" value="${f.p1}" onchange="KhatmaPage.set('p1',+this.value)"></label>
        <label class="kht-mini">${L('إلى صفحة', 'Hasta', 'To')}<input type="number" min="1" max="604" value="${f.p2}" onchange="KhatmaPage.set('p2',+this.value)"></label>
      </div>`;
    }
    return `<p class="kht-hint">${L('٦٠٤ صفحات كاملة — من الفاتحة إلى الناس.', '604 páginas completas.', 'All 604 pages.')}</p>`;
  },

  _summary() {
    const f = this.form;
    const scope = f.scopeType === 'full' ? { type: 'full' }
      : (f.scopeType === 'surah' ? { type: 'surah', s1: f.s1, s2: f.s2 }
        : (f.scopeType === 'juz' ? { type: 'juz', j1: f.j1, j2: f.j2 } : { type: 'page', p1: f.p1, p2: f.p2 }));
    const total = KhatmaStore.scopeCount(scope);
    const days = Math.max(1, +f.days || 1);
    const per = Math.ceil(total / days);
    const plan = KhatmaStore.plan({ scope, days, unit: f.unit, rest: f.rest, start: f.start, dir: f.dir });
    const rubs = f.unit === 'rub' ? KhatmaStore.rubs().filter(r => {
      const rr = KhatmaStore.scopePages(scope);
      return r.page >= rr.p1 && r.page <= rr.p2;
    }).length : 0;
    const mind = per * 18 / 60;
    const end = plan[plan.length - 1] ? plan[plan.length - 1].date : f.start;
    const L = (a, e, en) => this.L(a, e, en);
    return `<div class="kht-sum-in">
      <div class="kht-sum-main">${this.ar(total)} ${L('صفحة', 'págs', 'pages')} ÷ ${this.ar(days)} ${L('يومًا', 'días', 'days')} = <b>${this.ar(per)} ${L('صفحة يوميًا', 'pág/día', 'pages/day')}</b></div>
      <div class="kht-sum-sub">${f.unit === 'rub' ? `≈ ${this.ar(Math.max(1, Math.round(rubs / days)))} ${L('أرباع يوميًا', 'cuartos/día', 'quarters/day')} · ` : ''}≈ ${this.ar(Math.max(1, Math.round(mind)))} ${L('دقيقة قراءة', 'min de lectura', 'min of reading')} · ${L('ينتهي', 'Termina', 'Ends')} ${end}</div>
    </div>`;
  },

  // ---- أحداث النموذج ----
  set(k, v) {
    this.form[k] = v;
    if (k === 'scopeType') {
      const d = document.getElementById('kht-scope-detail');
      if (d) d.innerHTML = this._scopeDetail();
      document.querySelectorAll('#kht-scope-chips .kht-opt').forEach(b => b.classList.toggle('is-on', b.dataset.scope === v));
    } else {
      // إعادة رسم أزرار الاختيار النشِطة
      document.querySelectorAll('.kht-opt').forEach(b => {
        if (!b.dataset.scope && b.getAttribute('onclick') && b.getAttribute('onclick').indexOf(`'${k}',${v}`) >= 0) b.classList.add('is-on');
        else if (!b.dataset.scope) b.classList.remove('is-on');
      });
    }
    this._refresh();
  },
  setDays(v) {
    this.form.days = Math.max(1, Math.min(365, parseInt(v, 10) || 1));
    this._refresh();
  },
  setPerDay(v) {
    const per = Math.max(1, parseInt(v, 10) || 0);
    if (!per) return;
    const scope = this.form.scopeType === 'full' ? { type: 'full' }
      : (this.form.scopeType === 'surah' ? { type: 'surah', s1: this.form.s1, s2: this.form.s2 }
        : (this.form.scopeType === 'juz' ? { type: 'juz', j1: this.form.j1, j2: this.form.j2 } : { type: 'page', p1: this.form.p1, p2: this.form.p2 }));
    const total = KhatmaStore.scopeCount(scope);
    this.form.days = Math.max(1, Math.ceil(total / per));
    const d = document.getElementById('kht-days'); if (d) d.value = this.form.days;
    this._refresh();
  },
  setStart(off) {
    const d = new Date(); d.setDate(d.getDate() + off);
    this.form.start = KhatmaStore._fmt(d);
    this._refresh(true);
  },
  setTime(v) {
    const m = String(v || '').match(/(\d{1,2}):(\d{2})/);
    if (!m) return;
    this.form.hour = +m[1]; this.form.minute = +m[2];
    this._refresh();
  },
  toggleRest(v) {
    const i = this.form.rest.indexOf(v);
    if (i >= 0) this.form.rest.splice(i, 1); else this.form.rest.push(v);
    this._refresh(true);
  },
  _refresh(full) {
    const s = document.getElementById('kht-sum');
    if (s) s.innerHTML = this._summary();
    if (full) {
      document.querySelectorAll('.kht-chips-row .kht-opt').forEach(b => {
        const oc = b.getAttribute('onclick') || '';
        const m = oc.match(/KhatmaPage\.(set|toggleRest)\('?(\w+)'?,?\s*(-?\d*)/);
        if (!m) return;
        if (m[1] === 'toggleRest') b.classList.toggle('is-on', this.form.rest.indexOf(+m[3]) >= 0);
      });
    }
  },

  cancelCreate() { this.form = null; Router.go('quran/khatma'); },

  save() {
    const f = this.form || this._defaultForm();
    const scope = f.scopeType === 'full' ? { type: 'full' }
      : (f.scopeType === 'surah' ? { type: 'surah', s1: f.s1, s2: f.s2 }
        : (f.scopeType === 'juz' ? { type: 'juz', j1: f.j1, j2: f.j2 } : { type: 'page', p1: f.p1, p2: f.p2 }));
    const k = {
      id: 'k' + Date.now().toString(36),
      name: (f.name || '').trim() || this.L('ختمتي', 'Mi jatma', 'My khatma'),
      intent: (f.intent || '').trim(),
      created: Date.now(), archived: false,
      scope, dir: f.dir, days: Math.max(1, +f.days || 1), unit: f.unit,
      rest: (f.rest || []).slice(), start: f.start,
      remind: { on: !!f.remindOn, hour: f.hour | 0, minute: f.minute | 0 },
      reads: [], log: {}, fired: {},
    };
    KhatmaStore.upsert(k);
    KhatmaStore.syncReminder(k);
    this.form = null;
    try { showToast(this.L('بدأت ختمتك — بارك الله فيك', 'Jatma creada', 'Khatma started'), 1800); } catch (e) {}
    Router.go('quran/khatma');
  },

  // ================= ورد اليوم =================
  renderDay(root) {
    const k = KhatmaStore.active();
    if (!k) { Router.go('quran/khatma'); return; }
    const L = (a, e, en) => this.L(a, e, en);
    const wr = KhatmaStore.wardProgress(k);
    const w = wr.ward;
    const ayahs = (w && !w.rest) ? KhatmaStore.wardAyahs(w, 4) : [];
    const R = 42, C = 2 * Math.PI * R;

    root.innerHTML = `<div class="kht-wrap" dir="rtl">
      <div class="kht-head">
        <button class="kht-ic" onclick="Router.go('quran/khatma')"><i class="fas fa-chevron-right"></i></button>
        <div class="kht-ttl"><b>${L('ورد اليوم', "Wird de hoy", "Today's ward")}</b><em>${this.esc(k.name || '')}</em></div>
      </div>
      <div class="kht-day">
        <div class="kht-ring kht-ring-sm">
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${R}" class="kht-ring-bg"></circle>
          <circle cx="50" cy="50" r="${R}" class="kht-ring-fg" style="stroke-dasharray:${(wr.pct / 100) * C} ${C}"></circle></svg>
          <div class="kht-ring-in"><b>${wr.pct}%</b><em>${this.ar(wr.done)}/${this.ar(wr.total || 0)}</em></div>
        </div>
        <div class="kht-day-tx">
          <b>${this.esc(w && w.pages > 0 ? KhatmaStore.rangeLabel(k, w) : L('يوم راحة', 'Descanso', 'Rest day'))}</b>
          <span>${w && w.pages > 0 ? `${this.ar(w.pages)} ${L('صفحات', 'págs', 'pages')} · ≈ ${this.ar(KhatmaStore.estMinutes(w.pages))} ${L('دقيقة', 'min', 'min')}` : ''}</span>
          <span class="kht-day-date">${w ? w.date : ''}</span>
        </div>
      </div>
      ${ayahs.length ? `<div class="kht-preview">
        <div class="kht-sec-h"><b>${L('من أول الورد', 'Inicio del wird', 'Ward opening')}</b></div>
        ${ayahs.map(a => `<p class="kht-ayah">${this.esc(a[2])} <span class="kht-ay-n">﴿${this.ar(a[1])}﴾</span></p>`).join('')}
      </div>` : ''}
      ${(w && w.pages > 0) ? `<div class="kht-bounds">
        <div class="kht-bound"><i class="fas fa-flag"></i><span>${L('يبدأ', 'Empieza', 'Starts')}</span><b>${L('صفحة', 'pág.', 'page')} ${this.ar(w.from)}</b><em>${this.esc(KhatmaStore.surahName(KhatmaStore.pageRef(w.from).s))} ${this.ar(KhatmaStore.pageRef(w.from).a)}</em></div>
        <div class="kht-bound is-end"><i class="fas fa-flag-checkered"></i><span>${L('ينتهي', 'Termina', 'Ends')}</span><b>${L('صفحة', 'pág.', 'page')} ${this.ar(w.to)}</b><em>${this.esc(KhatmaStore.surahName(KhatmaStore.pageRef(w.to).sEnd || KhatmaStore.pageRef(w.to).s))} ${this.ar(KhatmaStore.pageRef(w.to).aEnd || KhatmaStore.pageRef(w.to).a)}</em></div>
      </div>` : ''}
      <div class="kht-actions">
        <button class="kht-act kht-act-main" onclick="KhatmaPage.openWard(true)"><i class="fas fa-book-quran"></i> ${L('افتح الورد في المصحف', 'Abrir en el mushaf', 'Open ward in mushaf')}</button>
        <button class="kht-act" onclick="KhatmaPage.openWard()"><i class="fas fa-book-open-reader"></i> ${L('قراءة بالترجمة', 'Con traducción', 'With translation')}</button>
        <button class="kht-act" onclick="KhatmaPage.markAllToday()"><i class="fas fa-check-double"></i> ${L('أتممت ورد اليوم', 'Completé el wird', "I finished today's ward")}</button>
        ${wr.done > 0 ? `<button class="kht-act kht-danger" onclick="KhatmaPage.undoToday()"><i class="fas fa-rotate-left"></i> ${L('إزالة تقدّم اليوم', 'Quitar progreso de hoy', "Remove today's progress")}</button>` : ''}
      </div>
    </div>`;
  },

  // ================= أفعال =================
  openWard(toMushaf) {
    const k = KhatmaStore.active(); if (!k) return;
    const w = KhatmaStore.wardToday(k);
    if (w && w.before) {
      try { showToast(this.L('ختمتك تبدأ في ', 'Tu jatma empieza el ', 'Your khatma starts on ') + w.date, 2000); } catch (e) {}
      return;
    }
    if (!w || w.pages <= 0) { try { showToast(this.L('لا ورد لهذا اليوم', 'Sin wird hoy', 'No ward today'), 1600); } catch (e) {} return; }
    // v1.0.145: نُثبّت هوية الختمة في المسار (kid) ونمرّر وجهة رجوع صريحة.
    // بدون ذلك كان أي تغيير للختمة النشطة يقلب الورد إلى ختمة أخرى، وكان
    // الرجوع من القارئ يهبط على صفحة غير صفحة الختمة.
    const start = k.dir === -1 ? w.to : w.from;
    const back = 'quran/khatma';
    if (toMushaf) { Router.go('mushaf', { page: start, ward: 1, kid: k.id, back: back }); return; }
    const r = KhatmaStore.pageRef(w.from);
    try {
      Router.push('surah', { surahNumber: r.s, ayah: r.a, kid: k.id, ward: 1, back: back });
    } catch (e) { Router.go('mushaf', { page: start, ward: 1, kid: k.id, back: back }); }
  },
  markAllToday() {
    const k = KhatmaStore.active(); if (!k) return;
    const w = KhatmaStore.wardToday(k);
    const L = (a, e, en) => this.L(a, e, en);
    if (w && w.before) { try { showToast(L('ختمتك تبدأ في ', 'Tu jatma empieza el ', 'Your khatma starts on ') + w.date, 2000); } catch (e) {} return; }
    if (!w || w.pages <= 0) { try { showToast(L('لا ورد لهذا اليوم', 'Sin wird hoy', 'No ward today'), 1600); } catch (e) {} return; }
    const wr = KhatmaStore.wardProgress(k);
    const opt = (how, icon, title, desc) => `<button class="kht-man-opt" onclick="KhatmaPage.applyManual('${how}')">
      <span class="kht-man-ic"><i class="fas ${icon}"></i></span>
      <span class="kht-man-tx"><b>${title}</b><em>${desc}</em></span>
      <i class="fas fa-chevron-left kht-man-go"></i>
    </button>`;
    const html = `
      <div class="kht-man-sum">
        <span>${L('ورد اليوم', 'Wird de hoy', "Today's ward")}</span>
        <b>${this.esc(KhatmaStore.rangeLabel(k, w))}</b>
        <em>${this.ar(w.pages)} ${L('صفحة', 'págs', 'pages')} · ${this.ar(wr.done)}/${this.ar(wr.total)} ${L('مقروءة', 'leídas', 'read')}</em>
      </div>
      ${opt('external', 'fa-book-quran', L('أتممته من مصحف خارجي', 'Lo leí en un mushaf externo', 'Read from an external mushaf'), L('ورقي أو تطبيق آخر — يُحتسب الورد كاملًا', 'Papel u otra app — cuenta el wird completo', 'Paper or another app — full ward counted'))}
      ${opt('inapp', 'fa-mobile-screen-button', L('قرأته داخل قُبا ونسيت التتبّع', 'Lo leí en Quba sin seguimiento', 'Read in Quba untracked'), L('لم يُحتسب تلقائيًا فأتمّه الآن', 'No se registró — márcalo', 'Not auto-counted — mark it'))}
      ${opt('catchup', 'fa-clock-rotate-left', L('قضاء ورد فائت', 'Poner al día un wird', 'Catch up a missed ward'), L('أحتسبه لهذا اليوم بدل اليوم الفائت', 'Lo cuento para hoy', 'Count it for today'))}
      ${wr.done > 0 ? `<button class="kht-man-opt kht-man-danger" onclick="KhatmaPage.undoToday()">
        <span class="kht-man-ic"><i class="fas fa-rotate-left"></i></span>
        <span class="kht-man-tx"><b>${L('إزالة تقدّم اليوم', 'Quitar el progreso de hoy', "Remove today's progress")}</b><em>${L('ضغطت بالخطأ؟ يُرجع الورد كما كان', '¿Un error? Revierte el wird', 'Pressed by mistake? Reverts it')}</em></span>
        <i class="fas fa-chevron-left kht-man-go"></i>
      </button>` : ''}
      <p class="kht-hint">${L('الإتمام اليدوي يُسجّل كمصدره، ويمكن إزالته في أي وقت.', 'La marca manual se registra con su origen y se puede deshacer.', 'Manual entries keep their source and can be undone anytime.')}</p>`;
    this._sheet(L('كيف أتممت الورد؟', '¿Cómo completaste el wird?', 'How did you complete it?'), html);
  },
  applyManual(how) {
    const k = KhatmaStore.active(); if (!k) return;
    const w = KhatmaStore.wardToday(k);
    if (!w || w.pages <= 0) return;
    const n = KhatmaStore.markRange(w.from, w.to, how);
    this.closeSheet();
    try { showToast(this.L('تم احتساب ورد اليوم', 'Wird completado', 'Ward recorded') + (n ? '' : ''), 1800); } catch (e) {}
    this.render(null, {});
  },
  undoToday() {
    const k = KhatmaStore.active(); if (!k) return;
    const w = KhatmaStore.wardToday(k);
    if (!w || w.pages <= 0) return;
    const n = KhatmaStore.unmarkRange(w.from, w.to);
    this.closeSheet();
    try { showToast(this.L('أُزيل تقدّم اليوم (' + n + ' صفحة)', 'Progreso de hoy eliminado', 'Today\'s progress removed'), 1900); } catch (e) {}
    this.render(null, {});
  },
  gaps() {
    const k = KhatmaStore.active(); if (!k) return;
    const r = KhatmaStore.scopePages(k.scope);
    const set = KhatmaStore.readSet(k);
    const gaps = [];
    let start = 0;
    for (let p = r.p1; p <= r.p2; p++) {
      if (!set.has(p)) { if (!start) start = p; }
      else if (start) { gaps.push([start, p - 1]); start = 0; }
    }
    if (start) gaps.push([start, r.p2]);
    const html = gaps.length
      ? gaps.slice(0, 12).map(g => `<div class="kht-prow"><span class="kht-ptxt">${this.ar(g[0])}${g[1] > g[0] ? ' – ' + this.ar(g[1]) : ''}</span><span class="kht-ppages">${this.ar(g[1] - g[0] + 1)}</span></div>`).join('')
      : `<div class="kht-allread"><i class="fas fa-circle-check"></i> ${this.L('لا فجوات — أتممت نطاق ختمتك', 'Sin huecos', 'No gaps')}</div>`;
    this._sheet(this.L('صفحات لم تُقرأ', 'Páginas sin leer', 'Unread pages'), html);
  },
  openSettings() {
    const k = KhatmaStore.active(); if (!k) return;
    const html = `
      <label class="kht-field"><span>${this.L('الاسم', 'Nombre', 'Name')}</span>
        <input id="kht-e-name" value="${this.esc(k.name)}" maxlength="40"></label>
      <label class="kht-field"><span>${this.L('النيّة', 'Intención', 'Intention')}</span>
        <input id="kht-e-intent" value="${this.esc(k.intent || '')}" maxlength="60"></label>
      <label class="kht-field"><span>${this.L('المدة (أيام)', 'Duración', 'Days')}</span>
        <input id="kht-e-days" type="number" min="1" max="365" value="${k.days}"></label>
      <label class="kht-switch"><input id="kht-e-rem" type="checkbox" ${k.remind && k.remind.on ? 'checked' : ''}><span>${this.L('تذكير يومي', 'Recordatorio', 'Daily reminder')}</span></label>
      <input id="kht-e-time" type="time" value="${String((k.remind && k.remind.hour) || 19).padStart(2, '0')}:${String((k.remind && k.remind.minute) || 0).padStart(2, '0')}">
      <button class="kht-btn kht-btn-main" onclick="KhatmaPage.applySettings()">${this.L('حفظ وتوزيع جديد', 'Guardar y redistribuir', 'Save & redistribute')}</button>`;
    this._sheet(this.L('تعديل الخطة', 'Editar plan', 'Edit plan'), html);
  },
  applySettings() {
    const k = KhatmaStore.active(); if (!k) return;
    const g = id => document.getElementById(id);
    k.name = (g('kht-e-name').value || k.name).trim();
    k.intent = (g('kht-e-intent').value || '').trim();
    k.days = Math.max(1, Math.min(365, parseInt(g('kht-e-days').value, 10) || k.days));
    const rem = g('kht-e-rem').checked;
    const tm = String(g('kht-e-time').value || '19:00').match(/(\d{1,2}):(\d{2})/);
    k.remind = { on: rem, hour: tm ? +tm[1] : 19, minute: tm ? +tm[2] : 0 };
    KhatmaStore.upsert(k);
    KhatmaStore.syncReminder(k);
    this.closeSheet();
    this.render(null, {});
    try { showToast(this.L('حُفظت الخطة', 'Plan guardado', 'Plan saved'), 1500); } catch (e) {}
  },
  confirmDelete() {
    this._sheet(this.L('حذف الختمة', 'Eliminar', 'Delete khatma'), `
      <p class="kht-hint">${this.L('سيُحذف سجل القراءة لهذه الختمة نهائيًا.', 'Se borrará el registro.', 'Reading log will be erased.')}</p>
      <button class="kht-btn kht-danger" onclick="KhatmaPage.doDelete()">${this.L('نعم، احذف', 'Sí, eliminar', 'Yes, delete')}</button>`);
  },
  doDelete() {
    const k = KhatmaStore.active(); if (!k) return;
    KhatmaStore.remove(k.id);
    try { if (window.AndroidBridge && AndroidBridge.scheduleWard) AndroidBridge.scheduleWard(JSON.stringify({ enabled: false })); } catch (e) {}
    this.closeSheet();
    Router.go('quran/khatma');
  },

  // ---- شيت ----
  _sheet(title, html) {
    this.closeSheet();
    const el = document.createElement('div');
    el.className = 'kht-sheet-scrim';
    el.id = 'kht-sheet';
    el.innerHTML = `<div class="kht-sheet" dir="rtl">
      <div class="kht-sheet-h"><b>${title}</b><button class="kht-ic" onclick="KhatmaPage.closeSheet()"><i class="fas fa-xmark"></i></button></div>
      <div class="kht-sheet-b">${html}</div>
    </div>`;
    el.addEventListener('click', ev => { if (ev.target === el) this.closeSheet(); });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-open'));
  },
  closeSheet() {
    const el = document.getElementById('kht-sheet');
    if (el) { el.classList.remove('is-open'); setTimeout(() => el.remove(), 220); }
  },

  celebrate(id) {
    const k = KhatmaStore.get(id); if (!k) return;
    this._sheet(this.L('تمّت الختمة', 'Jatma completada', 'Khatma complete'), `
      <div class="kht-celebrate">
        <div class="kht-cele-orn"><i class="fas fa-star-and-crescent"></i></div>
        <h3>${this.L('تقبّل الله ختمتك', 'Que Allah acepte', 'May Allah accept')}</h3>
        <p>${this.esc(k.name)}${k.intent ? ' — ' + this.esc(k.intent) : ''}</p>
        <button class="kht-btn kht-btn-main" onclick="KhatmaPage.closeSheet()">${this.L('آمين', 'Amín', 'Ameen')}</button>
      </div>`);
  },
};

window.KhatmaPage = KhatmaPage;
