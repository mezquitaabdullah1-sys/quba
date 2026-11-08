// 📿 صفحة «يومي» — تتبّع الأعمال اليومية + إحصائيات (v128)
const DailyTrackerPage = {
  view: 'today',
  _lang() {
    try { return (typeof currentLocale !== 'undefined' && ['ar','es','en'].includes(currentLocale)) ? currentLocale : 'ar'; } catch (e) { return 'ar'; }
  },
  L(ar, es, en) { const l = this._lang(); return l === 'es' ? es : (l === 'en' ? en : ar); },

  _name(id) {
    const N = {
      fajr:   ['الفجر', 'Fajr', 'Fajr'],
      dhuhr:  ['الظهر', 'Dhuhr', 'Dhuhr'],
      asr:    ['العصر', 'Asr', 'Asr'],
      maghrib:['المغرب', 'Maghrib', 'Maghrib'],
      isha:   ['العشاء', 'Isha', 'Isha'],
      jamaa:  ['صلاة في الجماعة', 'En congregación', 'In congregation'],
      rawatib:['السنن الرواتب', 'Sunnah rawatib', 'Rawatib sunnah'],
      witr:   ['الوتر', 'Witr', 'Witr'],
      duha:   ['صلاة الضحى', 'Duha', 'Duha'],
      tahajjud:['التهجّد', 'Tahajjud', 'Tahajjud'],
      quran:  ['ورد القرآن', 'Lectura del Corán', 'Quran portion'],
      morning:['أذكار الصباح', 'Adhkar de la mañana', 'Morning adhkar'],
      evening:['أذكار المساء', 'Adhkar de la tarde', 'Evening adhkar'],
      afterprayer:['أذكار بعد الصلاة', 'Adhkar tras la oración', 'After-prayer adhkar'],
      tasbih: ['التسبيح', 'Tasbih', 'Tasbih'],
      istighfar:['الاستغفار', 'Istighfar', 'Istighfar'],
      salawat:['الصلاة على النبي', 'Salawat', 'Salawat'],
      sadaqah:['صدقة', 'Sadaqah', 'Charity'],
      fasting:['صيام', 'Ayuno', 'Fasting'],
      parents:['الدعاء للوالدين', 'Dua por los padres', 'Dua for parents'],
      knowledge:['طلب العلم', 'Buscar conocimiento', 'Seeking knowledge'],
      tarawih: ['التراويح', 'Tarawih', 'Tarawih'],
      qiyam:   ['قيام الليل', 'Qiyam al-layl', 'Night prayer'],
      khatma_ward:['ورد الختمة', 'Wird de la jatma', 'Khatma wird'],
      iftar_saim:['إفطار صائم', 'Dar iftar', 'Feed a fasting person'],
      sadaqah_r:['صدقة رمضان', 'Sadaqa de Ramadán', 'Ramadan charity'],
      itikaf:  ['اعتكاف', 'I\'tikaf', 'I\'tikaf'],
      qadr_dua:['دعاء ليلة القدر', 'Dua de la noche', 'Laylat al-Qadr dua']
    };
    const l = this._lang();
    const v = N[id] || [id, id, id];
    return l === 'es' ? v[1] : (l === 'en' ? v[2] : v[0]);
  },

  _catName(c) {
    const M = {
      prayers: ['الصلوات الخمس', 'Las cinco oraciones', 'The five prayers'],
      sunan:   ['السنن والنوافل', 'Sunnah y nawafil', 'Sunnah & nawafil'],
      dhikr:   ['القرآن والذكر', 'Corán y dhikr', 'Quran & dhikr'],
      khayr:   ['الخير', 'El bien', 'Good deeds'],
      ramadan: ['رمضان', 'Ramadán', 'Ramadan']
    };
    const l = this._lang(); const v = M[c] || [c, c, c];
    return l === 'es' ? v[1] : (l === 'en' ? v[2] : v[0]);
  },

  _encourage(p) {
    if (p === 0) return this.L('ابدأ يومك بخطوة', 'Empieza con un paso', 'Start with one step');
    if (p < 50) return this.L('أحسنت، أكمل ما بقي', 'Bien, sigue adelante', 'Good, keep going');
    if (p < 100) return this.L('بقيت خطوات قليلة', 'Quedan pocos pasos', 'Just a few steps left');
    return this.L('ما شاء الله، يوم كامل', 'Mashallah, día completo', 'Mashallah, a full day');
  },

  _isR() {
    try { return !!(DailyTracker && DailyTracker.inRamadan && DailyTracker.inRamadan()); } catch (e) { return false; }
  },

  async render(container) {
    try { if (DailyTracker.applySeason) DailyTracker.applySeason(); } catch (e) {}
    try { if (typeof DailyTracker !== 'undefined') DailyTracker.syncPrayers(); } catch (e) {}
    if (this.view === 'stats') return this.renderStats(container);

    const k = DailyTracker.dayKey();
    const pct = DailyTracker.pct(k);
    const done = DailyTracker.doneCount(k);
    const total = DailyTracker.ITEMS.length;
    const pts = DailyTracker.pts(k);
    const streak = DailyTracker.streak();
    const loc = this._lang();

    const week = DailyTracker.lastDays(7);
    const weekHtml = week.map(d => {
      let letter = '';
      try { letter = d.date.toLocaleDateString(loc === 'ar' ? 'ar-EG' : (loc === 'es' ? 'es-ES' : 'en-GB'), { weekday: 'narrow' }); } catch (e) { letter = ''; }
      const isToday = d.key === k;
      return `<div class="tk-day${isToday ? ' today' : ''}">
        <span class="tk-day-l">${letter}</span>
        <span class="tk-day-ring" style="--p:${d.pct}"><span>${d.date.getDate()}</span></span>
      </div>`;
    }).join('');

    const itemCard = (it) => {
      const on = DailyTracker.isDone(it.id, k);
      return `<button class="tk-item${on ? ' on' : ''}" onclick="DailyTrackerPage.toggle('${it.id}')" aria-pressed="${on}">
        <span class="tk-tick"><i class="fas ${on ? 'fa-check' : 'fa-plus'}"></i></span>
        <span class="tk-ic"><i class="fas fa-${it.ic}"></i></span>
        <span class="tk-name">${this._name(it.id)}</span>
        <span class="tk-pts">+${it.pts}</span>
      </button>`;
    };

    const prayerRow = DailyTracker.itemsOf('prayers').map(it => {
      const on = DailyTracker.isDone(it.id, k);
      return `<button class="tk-prayer${on ? ' on' : ''}" onclick="DailyTrackerPage.toggle('${it.id}')" aria-pressed="${on}">
        <span class="tk-pr-circle"><i class="fas ${on ? 'fa-check' : 'fa-' + it.ic}"></i></span>
        <span class="tk-pr-name">${this._name(it.id)}</span>
      </button>`;
    }).join('');

    container.innerHTML = `
      <div class="tk-wrap">
        <div class="tk-head">
          <button class="tk-hbtn" onclick="Router.go('home')" aria-label="${this.L('رجوع','Volver','Back')}"><i class="fas fa-arrow-${loc === 'ar' ? 'right' : 'left'}"></i></button>
          <div class="tk-title">${this.L('يومي','Mi día','My day')}</div>
          <button class="tk-stats-btn" onclick="DailyTrackerPage.setView('stats')"><i class="fas fa-chart-simple"></i> ${this.L('إحصائياتي','Mis estadísticas','My stats')}</button>
        </div>

        <section class="tk-hero">
          <div class="tk-hero-glow"></div>
          <div class="tk-hero-main">
            <div class="tk-ring" style="--p:${pct}">
              <div class="tk-ring-in"><b>${pct}%</b><span>${pts} ${this.L('نقطة','pts','pts')}</span></div>
            </div>
            <div class="tk-hero-txt">
              <div class="tk-enc">${this._encourage(pct)}</div>
              <div class="tk-hero-sub">${done} ${this.L('من','de','of')} ${total} ${this.L('أعمال','obras','deeds')}</div>
              <div class="tk-pill"><i class="fas fa-fire"></i> ${this.L('مواظبة','Racha','Streak')} ${streak} ${this.L('يوم','día(s)','day(s)')}</div>
            </div>
          </div>
          <div class="tk-hero-bar"><span style="width:${pct}%"></span></div>
        </section>

        <section class="tk-week-card">${weekHtml}</section>

        <section class="tk-sec">
          <div class="tk-sec-t"><i class="fas fa-mosque"></i> ${this._catName('prayers')}</div>
          <div class="tk-prayers">${prayerRow}</div>
        </section>

        ${(this._isR() ? ['ramadan'] : []).map(c => `
          <section class="tk-sec tk-sec-rmd">
            <div class="tk-sec-t"><i class="fas fa-star-and-crescent"></i> ${this._catName(c)} <button class="tk-rmd-link" onclick="Router.go('ramadan')">${this.L('وضع رمضان','Modo Ramadán','Ramadan mode')} <i class="fas fa-chevron-${this._lang() === 'ar' ? 'left' : 'right'}"></i></button></div>
            <div class="tk-grid">${DailyTracker.itemsOf(c).map(itemCard).join('')}</div>
          </section>`).join('')}

        ${['sunan', 'dhikr', 'khayr'].map(c => `
          <section class="tk-sec">
            <div class="tk-sec-t"><i class="fas fa-${c === 'sunan' ? 'star' : (c === 'dhikr' ? 'book-open' : 'hand-holding-heart')}"></i> ${this._catName(c)}</div>
            <div class="tk-grid">${DailyTracker.itemsOf(c).map(itemCard).join('')}</div>
          </section>`).join('')}

        <div class="tk-note"><i class="fas fa-lock"></i> ${this.L('يُسجَّل على جهازك وحده.', 'Se guarda solo en tu dispositivo.', 'Stored on your device only.')}</div>
      </div>`;
  },

  toggle(id) {
    const PR = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const isPr = PR.indexOf(id) >= 0;
    const pName = isPr ? id.charAt(0).toUpperCase() + id.slice(1) : '';
    if (isPr) {
      // v1.0.138: لا يُعلَّم وقت لم يدخل بعد — نفس سلوك صفحة الصلاة ورسالتها
      const passed = (typeof HomePage !== 'undefined' && HomePage.isAdhanPassed) ? HomePage.isAdhanPassed(pName) : true;
      const already = (typeof PrayerTracker !== 'undefined') ? PrayerTracker.isDone(pName) : false;
      if (!already && !passed) {
        try {
          if (typeof showToast === 'function') showToast('🕐 ' + ((typeof t === 'function' && t('prayerNotYetToast')) || 'لم يحن وقت الأذان بعد'), 2200);
          if (navigator.vibrate) navigator.vibrate(40);
        } catch (e) {}
        return;
      }
    }
    const now = DailyTracker.toggle(id);
    // v1.0.138: مزامنة مع مربّعات صفحة الصلاة (والعكس قائم هناك)
    try {
      if (isPr && typeof PrayerTracker !== 'undefined' && PrayerTracker.isDone(pName) !== now) {
        PrayerTracker.toggle(pName);
      }
    } catch (e) {}
    try {
      if (typeof showToast === 'function' && now) {
        const pts = (DailyTracker.ITEMS.find(i => i.id === id) || {}).pts || 0;
        showToast('✅ +' + pts, 1100);
      }
    } catch (e) {}
    const c = document.getElementById('main-content');
    if (c) {
      // v1.0.160: كل ضغطة على عمل كانت تعيد رسم الصفحة كاملة فيقفز التمرير
      // إلى أعلى، فيضيع مكان المستخدم وسط قائمة طويلة من الأعمال.
      const sc = c.scrollTop || 0;
      const wy = (typeof window !== 'undefined' && window.scrollY) || 0;
      this.render(c);
      c.scrollTop = sc;
      if (wy) { try { window.scrollTo(0, wy); } catch (e) {} }
    }
  },

  setView(v) {
    this.view = v;
    const c = document.getElementById('main-content');
    if (c) { c.scrollTop = 0; this.render(c); }
  },

  _weekSectionHtml() {
    const rows = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = DailyTracker.dayKey(d);
      const p = DailyTracker.pct(k);
      const pts = DailyTracker.pts(k);
      const dn = DailyTracker.doneCount(k);
      let name = '';
      try {
        name = d.toLocaleDateString(this._lang() === 'ar' ? 'ar-EG' : (this._lang() === 'es' ? 'es-ES' : 'en-GB'), { weekday: 'long' });
      } catch (e) { name = k; }
      const isToday = i === 0;
      rows.push(`<div class="tk-wk-row${isToday ? ' today' : ''}">
        <span class="tk-wk-d">
          <b>${name}</b>
          <i>${d.getDate()}/${d.getMonth() + 1}</i>
        </span>
        <span class="tk-wk-bar"><span style="width:${p}%"></span></span>
        <span class="tk-wk-v"><b>${p}%</b><i>${dn} ${this.L('عمل','obras','deeds')} · ${pts} ${this.L('نقطة','pts','pts')}</i></span>
      </div>`);
    }
    return `<section class="tk-card">
      <div class="tk-card-h"><b>${this.L('أيام الأسبوع','Días de la semana','Days of the week')}</b><span>${this.L('آخر 7 أيام','últimos 7 días','last 7 days')}</span></div>
      ${rows.join('')}
    </section>`;
  },

  renderStats(container) {
    const avg = DailyTracker.avgPct(30);
    const streak = DailyTracker.streak();
    const best = DailyTracker.longestStreak();
    const days = DailyTracker.lastDays(30);
    const logged = DailyTracker.loggedDays(30);
    const maxBar = 100;

    const bars = days.map(d => `<div class="tk-bar" title="${d.key} · ${d.pct}%">
        <span style="height:${Math.max(4, (d.pct / maxBar) * 100)}%" class="${d.pct >= 60 ? 'hi' : ''}"></span>
      </div>`).join('');

    const prayers = DailyTracker.itemsOf('prayers').map(it => {
      const c = DailyTracker.countItem(it.id, 30);
      const w = Math.round((c / 30) * 100);
      return `<div class="tk-row">
        <span class="tk-row-ic"><i class="fas fa-${it.ic}"></i></span>
        <span class="tk-row-name">${this._name(it.id)}</span>
        <span class="tk-row-bar"><span style="width:${w}%"></span></span>
        <span class="tk-row-v">${c}/30</span>
      </div>`;
    }).join('');

    const top = DailyTracker.topItems(30, 4).map((t, i) => `<div class="tk-top">
        <span class="tk-top-rank">${i + 1}</span>
        <span class="tk-row-ic"><i class="fas fa-${t.ic}"></i></span>
        <span class="tk-row-name">${this._name(t.id)}</span>
        <span class="tk-top-v">${t.c} ${this.L('يوم','d','d')}</span>
      </div>`).join('');

    container.innerHTML = `
      <div class="tk-wrap">
        <div class="tk-head">
          <button class="tk-hbtn" onclick="DailyTrackerPage.setView('today')" aria-label="${this.L('رجوع','Volver','Back')}"><i class="fas fa-arrow-${this._lang() === 'ar' ? 'right' : 'left'}"></i></button>
          <div class="tk-title">${this.L('إحصائياتي','Mis estadísticas','My stats')}</div>
          <span style="width:38px"></span>
        </div>

        <div class="tk-stat3">
          <div class="tk-stat"><i class="fas fa-gauge-high"></i><b>${avg}%</b><span>${this.L('متوسط أيامك','Tu media','Your average')}</span></div>
          <div class="tk-stat"><i class="fas fa-fire"></i><b>${streak}</b><span>${this.L('مواظبة حالية','Racha actual','Current streak')}</span></div>
          <div class="tk-stat"><i class="fas fa-trophy"></i><b>${best}</b><span>${this.L('أطول مواظبة','Mejor racha','Best streak')}</span></div>
        </div>

        ${this._weekSectionHtml()}

        <section class="tk-card">
          <div class="tk-card-h"><b>${this.L('آخر 30 يومًا','Últimos 30 días','Last 30 days')}</b><span>${logged} ${this.L('يومًا مسجّلًا','días registrados','days logged')}</span></div>
          <div class="tk-chart">${bars}</div>
          <div class="tk-chart-x"><span>${this.L('قبل 30','hace 30','30 ago')}</span><span>${this.L('اليوم','hoy','today')}</span></div>
        </section>

        <section class="tk-card">
          <div class="tk-card-h"><b>${this.L('الصلوات في 30 يومًا','Oraciones en 30 días','Prayers in 30 days')}</b></div>
          ${prayers}
        </section>

        <section class="tk-card">
          <div class="tk-card-h"><b>${this.L('الأكثر مواظبة','Lo más constante','Most consistent')}</b></div>
          ${top || `<div class="tk-empty">${this.L('ابدأ التسجيل اليوم لتظهر إحصائياتك', 'Empieza hoy para ver tus datos', 'Start today to see your stats')}</div>`}
        </section>

        <button class="tk-reset" onclick="DailyTrackerPage.askReset()"><i class="fas fa-trash-can"></i> ${this.L('تصفير سجل التتبع','Borrar historial','Reset history')}</button>
        <div class="tk-note"><i class="fas fa-lock"></i> ${this.L('يُسجَّل على جهازك وحده.', 'Se guarda solo en tu dispositivo.', 'Stored on your device only.')}</div>
      </div>`;
  },

  askReset() {
    const msg = this.L('هل تحذف كل سجل التتبع؟ لا يمكن التراجع.', '¿Borrar todo el historial? No se puede deshacer.', 'Delete all history? This cannot be undone.');
    try {
      if (typeof confirmDialog === 'function') {
        confirmDialog(msg, () => { DailyTracker.resetAll(); this.setView('today'); });
        return;
      }
    } catch (e) {}
    if (window.confirm(msg)) { DailyTracker.resetAll(); this.setView('today'); }
  },

  cleanup() {}
};

if (typeof window !== 'undefined') window.DailyTrackerPage = DailyTrackerPage;
