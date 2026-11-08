// 🕋 Pantalla de Oración + Qibla
const PrayerPage = {
  activeTab: 'times',
  qiblaBearing: 0,
  deviceHeading: 0,
  orientationHandlerAbs: null,
  orientationHandlerRel: null,
  permissionGranted: false,
  countdownInterval: null, // v36: actualiza el «tiempo restante» en la tabla

  // v1.0.138: نصّ ثلاثي اللغات داخل الصفحة
  _px(ar, es, en) {
    let loc = 'ar';
    try {
      loc = (typeof currentLocale !== 'undefined' && ['ar', 'es', 'en'].includes(currentLocale))
        ? currentLocale : ((AppState.settings && AppState.settings.locale) || 'ar');
    } catch (e) { loc = 'ar'; }
    return loc === 'es' ? es : (loc === 'en' ? en : ar);
  },

  async render(container, params = {}) {
    // v14: honor incoming tab param (e.g. Router.go('prayer',{tab:'monthly'}))
    if (params && params.tab && ['times','monthly','qibla'].includes(params.tab)) {
      this.activeTab = params.tab;
    }

    container.innerHTML = Skeleton.prayer();

    try {
      // v40: SIEMPRE releer la ubicación actual del servicio — antes
      // `AppState.location` cortocircuitaba y la página podía mostrar los
      // horarios de la ciudad anterior tras cambiarla (desincronización con
      // la home y el jadwal mensual).
      const loc = await LocationService.getCurrent();
      AppState.location = loc;

      this.qiblaBearing = Qibla.calculateBearing(loc.latitude, loc.longitude);
      const distance = Qibla.distance(loc.latitude, loc.longitude);

      // v40: sello de coordenadas — los horarios cacheados solo se reutilizan
      // si pertenecen a ESTA ciudad. Si la red falla (o el usuario está sin
      // conexión) se recurre al motor astronómico local (PrayerCalc) en lugar
      // de mostrar el aviso de «error de ubicación».
      const stamp = (tgs) => {
        if (tgs) {
          tgs._lat = loc.latitude;
          tgs._lon = loc.longitude;
          tgs._date = new Date().toDateString();
        }
        return tgs;
      };
      const cacheValid = AppState.timings &&
        AppState.timings._lat === loc.latitude &&
        AppState.timings._lon === loc.longitude &&
        AppState.timings._date === new Date().toDateString();

      let timings;
      try {
        timings = cacheValid ? { timings: AppState.timings } :
          await API.getPrayerTimes(loc.latitude, loc.longitude, new Date(), AppState.settings.calculationMethod);
      } catch (netErr) {
        // شبكة أمان: حساب فلكي محلي عند فشل الشبكة بدل رسالة خطأ الموقع
        if (typeof PrayerCalc !== 'undefined') {
          // v43: نفس مسار API._offlinePrayerTimes — يشمل تعويض فرق توقيت
          // المدينة المختارة يدوياً وختم _cityDeltaMs، بدل حساب خام كان
          // يُظهر «الصلاة القادمة» بتوقيت الجهاز رغم اختلاف توقيت المدينة.
          const base = AppState.settings.calculationMethod || 3;
          const method = (API._effectiveMethod) ? API._effectiveMethod(loc.latitude, loc.longitude, base) : base;
          timings = API._offlinePrayerTimes(loc.latitude, loc.longitude, new Date(), method);
        } else {
          throw netErr;
        }
      }

      const hijri = AppState.hijri ? AppState.hijri : await API.gregorianToHijri();

      AppState.timings = stamp(timings.timings);
      AppState.hijri = hijri;

      // 🔔 Programar las alarmas del día: adhan automático a la hora de cada
      // oración y/o recordatorio 15 min antes (cada uno con su interruptor)
      if (typeof PrayerNotifications !== 'undefined' &&
          (PrayerNotifications.isEnabled() || PrayerNotifications.isReminderEnabled())) {
        PrayerNotifications.scheduleDay(AppState.timings, AppState.settings.locale || 'es');
      }

      // Escapar datos de ubicación (Nominatim)
      if (loc) { loc.city = loc.city && String(loc.city); loc.country = loc.country && String(loc.country); }

      this.renderUI(container, loc, hijri, distance);
    } catch (e) {
      console.warn('Prayer error:', e);
      container.innerHTML = this.permissionPrompt();
    }
  },

  renderUI(container, loc, hijri, distance) {
    container.innerHTML = `
      <div class="page-header prayer-header">
        <button class="pr-hdr-dl" onclick="PrayerPage.openDlSheet(event)" aria-label="${this._px('تحميل المواعيد', 'Descargar horarios', 'Download times')}" aria-haspopup="dialog">
          <i class="fas fa-download"></i>
        </button>
        <div class="page-title"><i class="fas fa-mosque"></i> ${t('tabPrayer')}</div>
        ${hijri ? `<div class="page-subtitle">${hijri.day} ${hijri.month?.en} ${hijri.year} هـ</div>` : ''}
        <button class="prayers-location" onclick="ProfilePage.pickCity()" title="${escapeAttr(t('changeCity') || '')}" aria-label="${escapeAttr(t('changeCity') || 'Cambiar ciudad')}">
          <i class="fas fa-location-dot"></i>
          <span>${escapeHtml([loc.city, loc.country].filter(Boolean).join(', ') || (t('chooseCityOrLocation') || 'Elige una ciudad'))}</span>
          <i class="fas fa-pen prayers-location-edit"></i>
        </button>

        <div class="inner-tabs">
          <button class="inner-tab ${this.activeTab === 'times' ? 'active' : ''}" onclick="PrayerPage.switchTab('times')">
            ⏰ ${t('todayPrayers')}
          </button>
          <button class="inner-tab ${this.activeTab === 'monthly' ? 'active' : ''}" onclick="PrayerPage.switchTab('monthly')">
            <i class="fas fa-calendar-days"></i> ${t('monthlyTable') || 'Mensual'}
          </button>
          <button class="inner-tab ${this.activeTab === 'qibla' ? 'active' : ''}" onclick="PrayerPage.switchTab('qibla')">
            <i class="fas fa-compass"></i> ${t('qibla')}
          </button>
        </div>

        <!-- v22: shortcut to the Salah course -->
        <button class="btn-primary prayer-course-btn" onclick="(typeof CoursesPage !== 'undefined') ? CoursesPage.openCourse('salah_complete') : Router.go('wisdom/courses')">
          <i class="fas fa-graduation-cap"></i> ${t('prayerCourseBtn') || 'Curso de Oración'}
        </button>
      </div>

      <div id="prayer-tab-content" style="padding: var(--sp-md);">
        ${this.activeTab === 'times' ? this.timesTab() : (this.activeTab === 'monthly' ? this.monthlyTab(loc) : this.qiblaTab(distance))}
      </div>
    `;

    if (this.activeTab === 'qibla') {
      this.initOrientationListener();
    }
    // v36: en la pestaña de horarios, actualizar el «tiempo restante» bajo
    // la próxima oración cada segundo (y re-render al cambiar de oración).
    if (this.activeTab === 'times') this.startCountdown();
  },

  startCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      if (!AppState.timings) return;
      const np = getNextPrayer(AppState.timings);
      if (!np) return;
      const remEl = document.querySelector('#prayer-tab-content .prayer-remaining');
      if (!remEl) return;
      if (remEl.dataset.prayerRemaining === np.name) {
        const txt = remEl.querySelector('.prayer-remaining-text');
        if (txt) txt.textContent = formatCountdown(np.diffMs);
      } else {
        // v40: al cambiar de oración se actualizan SOLO las filas afectadas,
        // sin re-render completo (el re-render disparaba skeleton + red y se
        // percibía como «recarga» constante de la página).
        const root = document.querySelector('#prayer-tab-content');
        if (!root) return;
        root.querySelectorAll('.prayer-row.next').forEach(r => r.classList.remove('next'));
        remEl.remove();
        const rows = root.querySelectorAll('.prayer-row');
        const daily = getDailyPrayers(AppState.timings);
        const idx = daily.findIndex(p => p.name === np.name);
        if (idx >= 0 && rows[idx]) {
          rows[idx].classList.add('next');
          const block = rows[idx].querySelector('.prayer-time-block');
          if (block) {
            block.insertAdjacentHTML('afterbegin',
              `<div class="prayer-remaining" data-prayer-remaining="${np.name}"><i class="fas fa-hourglass-half"></i> <span class="prayer-remaining-text">${formatCountdown(np.diffMs)}</span></div>`);
          }
        }
      }
    }, 1000);
  },

  switchTab(tab) {
    this.cleanup();
    this.activeTab = tab;
    this.render(document.getElementById('main-content'));
  },

  timesTab() {
    const prayers = getDailyPrayers(AppState.timings);
    const next = getNextPrayer(AppState.timings);
    const isEstimated = !!(AppState.timings && AppState.timings._estimated);
    // v26: insignia del ajuste manual de horario (verano/invierno)
    const shiftMode = (AppState.settings && AppState.settings.timeShift) || 'auto';
    const shiftBadge = shiftMode === 'summer'
      ? `<div class="estimated-badge" style="margin: 0 var(--sp-md) var(--sp-sm);"><i class="fas fa-sun"></i> ${t('timeShiftSummerApplied')}</div>`
      : shiftMode === 'winter'
      ? `<div class="estimated-badge" style="margin: 0 var(--sp-md) var(--sp-sm);"><i class="fas fa-snowflake"></i> ${t('timeShiftWinterApplied')}</div>`
      : '';
    return `
      ${isEstimated ? `<div class="estimated-badge" style="margin: 0 var(--sp-md) var(--sp-sm);"><i class="fas fa-wifi-slash"></i> ${t('estimatedTimes')}</div>` : ''}
      ${shiftBadge}
      <div class="card prayers-card">
        <div class="prayers-checkin-head">
          <span><i class="fas fa-circle-check"></i> ${t('prayerCheckinTitle') || ''}</span>
          <span class="prayer-checkin-progress">${(typeof PrayerTracker !== 'undefined' && PrayerTracker.doneCount) ? (PrayerTracker.doneCount() + '/' + PrayerTracker.totalCount() + ' ✔') : ''}</span>
        </div>
        ${prayers.map(p => {
          const canCheck = (typeof PrayerTracker !== 'undefined') && PrayerTracker.PRAYERS.includes(p.name);
          const isDone = canCheck && PrayerTracker.isDone(p.name);
          // v100: القفل يظهر في المربّع ما دام وقت الأذان لم يدخل بعد
          const passed = (typeof HomePage !== 'undefined' && HomePage.isAdhanPassed) ? HomePage.isAdhanPassed(p.name) : true;
          return `
          <div class="prayer-row ${next?.name === p.name ? 'next' : ''} ${isDone ? 'prayer-done' : ''}">
            <span class="prayer-emoji">${getPrayerEmoji(p.name)}</span>
            <div class="prayer-name-block">
              <div class="prayer-name">${t('prayers.' + p.name)}</div>
              <div class="prayer-arabic">${HomePage.prayerArabic(p.name)}</div>
            </div>
            <div class="prayer-time-block">
              <div class="prayer-time">${formatTime12h(p.time)}</div>
              ${next?.name === p.name ? `<div class="prayer-remaining" data-prayer-remaining="${p.name}"><i class="fas fa-hourglass-half"></i> <span class="prayer-remaining-text">${formatCountdown(next.diffMs)}</span></div>` : ''}
              ${p.iqamah ? `<div class="prayer-iqamah"><i class="fas fa-clock"></i> ${t('iqamah') || 'Iqamah'} ${formatTime12h(p.iqamah)} <span class="iqamah-off">+${p.iqamahOffset} ${t('minShort') || 'min'}</span></div>` : ''}
            </div>
            ${(typeof HomePage !== 'undefined' && HomePage._prayerBellHtml) ? (HomePage._prayerBellHtml(p.name) || '<span class="prayer-bell-spacer" aria-hidden="true"></span>') : ''}
            ${canCheck ? `
              <button class="prayer-check ${isDone ? 'checked' : ''} ${passed ? '' : 'locked'}"
                      aria-label="${t('prayerCheckinTitle')}"
                      aria-pressed="${isDone}"
                      onclick="HomePage.toggleCheckin('${p.name}', this)">
                <i class="fas ${(isDone || passed) ? 'fa-check' : 'fa-lock'}"></i>
              </button>` : '<span class="prayer-check-spacer" aria-hidden="true"></span>'}
          </div>`;
        }).join('')}
        ${this.weekHtml()}

      </div>
    `;
  },


  // ===== v1.0.138: صلوات الأسبوع — قسم قابل للفتح/الإغلاق، نفس مصدر تبويب اليوم =====
  WEEK_KEY: 'quba_week_open',

  weekOpen() {
    try { return localStorage.getItem(this.WEEK_KEY) === '1'; } catch (e) { return false; }
  },
  toggleWeek() {
    const on = !this.weekOpen();
    try { localStorage.setItem(this.WEEK_KEY, on ? '1' : '0'); } catch (e) {}
    const box = document.getElementById('wk-box');
    const btn = document.getElementById('wk-toggle');
    if (box) box.hidden = !on;
    if (btn) {
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      btn.classList.toggle('is-open', on);
    }
    if (on) { try { this._weekSyncAsync(); } catch (e) {} }
  },

  // مواقيت يوم واحد بنفس مسار تبويب اليوم (طريقة المدينة + فرق توقيت المدينة + التوقيت الصيفي/الشتوي)
  _dayTimings(d) {
    const loc = AppState.location || {};
    const base = (AppState.settings && AppState.settings.calculationMethod) || 4;
    try {
      // v1.0.142: التطبيع الكوبي (UTC−4) يتم مرة واحدة داخل _offlinePrayerTimes،
      // فلا نضيف ساعة يدويًا هنا (كان يسبب فروقًا بين تبويبات الصفحة).
      return API._offlinePrayerTimes(loc.latitude, loc.longitude, d, base).timings || {};
    } catch (e) { return {}; }
  },

  // منتصف الليل والثلث الأخير — بين مغرب اليوم وفجر الغد
  _nightTimes(today, tomorrow) {
    const toMin = (s) => {
      const [h, m] = String(s || '').split(' ')[0].split(':').map(Number);
      return (isNaN(h) || isNaN(m)) ? null : h * 60 + m;
    };
    const mg = toMin(today && today.Maghrib), fj = toMin(tomorrow && tomorrow.Fajr);
    if (mg === null || fj === null) return { mid: '', third: '' };
    let span = (fj + 1440 - mg) % 1440;
    if (!span) return { mid: '', third: '' };
    const fmt = (v) => {
      v = ((v % 1440) + 1440) % 1440;
      const h = Math.floor(v / 60), m = Math.round(v % 60);
      return String((h + (m === 60 ? 1 : 0)) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    };
    return { mid: fmt(mg + span / 2), third: fmt(mg + span * 2 / 3) };
  },

  weekHtml() {
    const loc = AppState.location;
    if (!loc) return '';
    const open = this.weekOpen();
    const L = (a, e, en) => this._px(a, e, en);
    const clean = (v) => String(v || '').split(' ')[0].slice(0, 5) || '—';
    const NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    const today = new Date(); today.setHours(12, 0, 0, 0);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime()); d.setDate(d.getDate() + i);
      const tm = (i === 0 && AppState.timings) ? AppState.timings : this._dayTimings(d);
      days.push({ d: d, tm: tm });
    }
    // صفوف الغد لحساب منتصف الليل والثلث الأخير لكل يوم
    const tomorrowTm = days.map((x, i) => (i + 1 < 7) ? days[i + 1].tm : this._dayTimings(new Date(today.getTime() + 7 * 86400000)));

    const hijriOf = (d) => {
      try {
        const h = (typeof HijriCalc !== 'undefined' && HijriCalc.fromDate) ? HijriCalc.fromDate(d) : null;
        if (!h) return '';
        const months = {
          ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
          es: ['Muharram','Safar','Rabi I','Rabi II','Yumada I','Yumada II','Rayab','Shaban','Ramadán','Shawwal','Dhul-Qada','Dhul-Hiyya'],
          en: ['Muharram','Safar','Rabi I','Rabi II','Jumada I','Jumada II','Rajab','Shaban','Ramadan','Shawwal','Dhul-Qadah','Dhul-Hijjah'],
        };
        let l = 'ar';
        try { l = (typeof currentLocale !== 'undefined' && ['ar','es','en'].includes(currentLocale)) ? currentLocale : 'ar'; } catch (e) {}
        return h.day + ' ' + ((months[l] || months.ar)[h.month - 1] || '');
      } catch (e) { return ''; }
    };
    const wd = (d) => { try { return d.toLocaleDateString(currentLocale, { weekday: 'long' }); } catch (e) { return ''; } };
    const gd = (d) => { try { return d.toLocaleDateString(currentLocale, { day: 'numeric', month: 'long' }); } catch (e) { return ''; } };

    const card = (x, i) => {
      const nt = this._nightTimes(x.tm, tomorrowTm[i]);
      const cells = NAMES.map(n => `
        <span class="wk-c" data-wk-p="${n}">
          <em>${t('prayers.' + n) || n}</em>
          <b>${clean(x.tm[n])}</b>
        </span>`).join('');
      return `<div class="wk-day${i === 0 ? ' is-today' : ''}" data-wk-day="${i}">
        <div class="wk-day-h">
          <b>${escapeHtml(wd(x.d))}</b>
          <i>${x.d.getDate()} · ${escapeHtml(hijriOf(x.d))}</i>
          <span>${escapeHtml(gd(x.d))}</span>
          ${i === 0 ? `<em class="wk-today-badge">${L('اليوم', 'Hoy', 'Today')}</em>` : ''}
        </div>
        <div class="wk-cols">${cells}</div>
        <div class="wk-night">
          <span><i class="fas fa-moon"></i> ${L('منتصف الليل', 'Medianoche', 'Midnight')} <b>${clean(nt.mid)}</b></span>
          <span><i class="fas fa-star"></i> ${L('الثلث الأخير', 'Último tercio', 'Last third')} <b>${clean(nt.third)}</b></span>
        </div>
      </div>`;
    };

    return `
      <div class="wk-card">
        <button class="wk-head" id="wk-toggle" onclick="PrayerPage.toggleWeek()" aria-expanded="${open ? 'true' : 'false'}" aria-controls="wk-box">
          <span class="wk-title"><i class="fas fa-calendar-week"></i>${L('صلوات الأسبوع', 'Oraciones de la semana', 'Week prayers')}</span>
          <span class="wk-sub">${L('٧ أيام', '7 días', '7 days')}</span>
          <i class="fas fa-chevron-down wk-chev${open ? ' is-open' : ''}"></i>
        </button>
        <div class="wk-box" id="wk-box" ${open ? '' : 'hidden'}>
          ${days.map(card).join('')}
        </div>
      </div>`;
  },

  // تحديث قيم الأسبوع من نفس مصدر المواقيت الأساسية (يشمل CubaTime وprayer offsets)
  async _weekSyncAsync() {
    const loc = AppState.location;
    if (!loc || typeof API === 'undefined' || !API.getPrayerTimes) return;
    const base = (AppState.settings && AppState.settings.calculationMethod) || 4;
    const today = new Date(); today.setHours(12, 0, 0, 0);
    for (let i = 1; i < 7; i++) {
      const d = new Date(today.getTime()); d.setDate(d.getDate() + i);
      try {
        const res = await API.getPrayerTimes(loc.latitude, loc.longitude, d, base);
        const tm = res && res.timings;
        if (!tm) continue;
        const dayEl = document.querySelector(`[data-wk-day="${i}"]`);
        if (!dayEl) continue;
        ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(n => {
          const el = dayEl.querySelector(`[data-wk-p="${n}"] b`);
          const v = String(tm[n] || '').split(' ')[0].slice(0, 5);
          if (el && v) el.textContent = v;
        });
      } catch (e) { /* يبقى الحساب المحلي */ }
    }
  },

  // ===== v1.0.138: نافذة التحميل — اليوم/الأسبوع/الشهر × PDF/صورة =====
  openDlSheet(ev) {
    if (ev) ev.stopPropagation();
    this.closeDlSheet();
    const L = (a, e, en) => this._px(a, e, en);
    const row = (kind, icon, title, sub) => `
      <div class="dl-row">
        <span class="dl-ic"><i class="fas ${icon}"></i></span>
        <span class="dl-tx"><b>${title}</b><em>${sub}</em></span>
        <span class="dl-fmts">
          <button class="dl-fmt" data-kind="${kind}" data-fmt="pdf" onclick="PrayerPage.runDl('${kind}','pdf',this)"><i class="fas fa-file-pdf"></i> PDF</button>
          <button class="dl-fmt" data-kind="${kind}" data-fmt="png" onclick="PrayerPage.runDl('${kind}','png',this)"><i class="fas fa-image"></i> ${L('صورة', 'Imagen', 'Image')}</button>
        </span>
      </div>`;
    const el = document.createElement('div');
    el.className = 'dl-scrim';
    el.id = 'pr-dl-sheet';
    el.innerHTML = `<div class="dl-sheet" role="dialog" aria-modal="true">
      <div class="dl-h"><b><i class="fas fa-download"></i> ${L('تحميل المواعيد', 'Descargar horarios', 'Download times')}</b>
        <button class="dl-x" onclick="PrayerPage.closeDlSheet()" aria-label="close"><i class="fas fa-xmark"></i></button></div>
      ${row('day', 'fa-calendar-day', L('صلوات اليوم', "Oraciones de hoy", "Today's prayers"), L('الأذان والإقامة', 'Adhan e iqamah', 'Adhan & iqamah'))}
      ${row('week', 'fa-calendar-week', L('صلوات الأسبوع', 'Oraciones de la semana', 'Week prayers'), L('٧ أيام مع منتصف الليل والثلث الأخير', '7 días', '7 days'))}
      ${row('month', 'fa-calendar-days', L('صلوات الشهر', 'Horario del mes', 'Monthly schedule'), L('جدول الشهر كاملًا', 'Mes completo', 'Full month'))}
    </div>`;
    el.addEventListener('click', (e) => { if (e.target === el) this.closeDlSheet(); });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-open'));
  },
  closeDlSheet() {
    const el = document.getElementById('pr-dl-sheet');
    if (el) { el.classList.remove('is-open'); setTimeout(() => el.remove(), 200); }
  },
  async runDl(kind, fmt, btn) {
    const L = (a, e, en) => this._px(a, e, en);
    if (kind === 'month' && (!this._monthly || !this._monthly.data)) {
      const loc = AppState.location || {};
      try { await this.loadMonthlyPrayers(loc); } catch (e) {}
    }
    const map = {
      'day:pdf': 'downloadDaily', 'day:png': 'saveDailyImage',
      'week:pdf': 'downloadWeek', 'week:png': 'saveWeekImage',
      'month:pdf': 'downloadMonth', 'month:png': 'saveMonthImage',
    };
    const fn = map[kind + ':' + fmt];
    if (!fn || typeof PrayerPdf === 'undefined' || typeof PrayerPdf[fn] !== 'function') {
      try { showToast(L('التحميل غير متاح', 'Descarga no disponible', 'Download unavailable'), 1800); } catch (e) {}
      return;
    }
    try { await PrayerPdf[fn](btn); } catch (e) {}
    this.closeDlSheet();
  },

  // ===== v1.0.138: بيانات الأسبوع لملف PDF/الصورة =====
  weekData() {
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const out = [];
    const NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const todayTm = AppState.timings || this._dayTimings(today);
    const tomorrowTm = this._dayTimings(new Date(today.getTime() + 86400000));
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime()); d.setDate(d.getDate() + i);
      const tm = (i === 0 && AppState.timings) ? AppState.timings : this._dayTimings(d);
      const next = this._dayTimings(new Date(d.getTime() + 86400000));
      const nt = this._nightTimes(tm, next);
      let wd = '';
      try { wd = d.toLocaleDateString(currentLocale, { weekday: 'long' }); } catch (e) { wd = ''; }
      let gdate = '';
      try { gdate = d.toLocaleDateString(currentLocale, { day: 'numeric', month: 'long' }); } catch (e) { gdate = ''; }
      out.push({ date: d, weekday: wd, gdate: gdate, timings: tm, night: nt, names: NAMES });
    }
    return out;
  },

  toggleDlMenu(ev) {
    if (ev) ev.stopPropagation();
    const m = document.getElementById('pr-dl-menu');
    const b = document.getElementById('pr-dl-btn');
    if (!m) return;
    const open = m.classList.contains('hidden');
    m.classList.toggle('hidden', !open);
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      const close = () => { this.closeDlMenu(); document.removeEventListener('click', close); };
      setTimeout(() => document.addEventListener('click', close), 0);
    }
  },

  closeDlMenu() {
    const m = document.getElementById('pr-dl-menu');
    const b = document.getElementById('pr-dl-btn');
    if (m) m.classList.add('hidden');
    if (b) b.setAttribute('aria-expanded', 'false');
  },

  // ===== v135: تدريجات البوصلة وأرقامها =====
  _dialTicksHtml() {
    let ticks = '';
    for (let a = 0; a < 360; a += 6) {
      const major = (a % 30 === 0);
      if (a % 90 === 0) continue; // أماكن الجهات الأصلية
      ticks += `<span class="cmp-tick${major ? ' major' : ''}" style="transform:rotate(${a}deg)"><i></i></span>`;
    }
    let nums = '';
    for (let a = 30; a < 360; a += 30) {
      if (a % 90 === 0) continue;
      nums += `<span class="cmp-num" style="transform:rotate(${a}deg)"><b style="transform:rotate(${-a}deg)">${a}</b></span>`;
    }
    return `<div class="cmp-ticks">${ticks}</div><div class="cmp-nums">${nums}</div>`;
  },

  qiblaTab(distance) {
    const loc = AppState.location;
    const lang = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    const atMakkah = loc && Qibla.isAtMakkah(loc.latitude, loc.longitude);
    const cardinal = Qibla.cardinalName(this.qiblaBearing, lang);
    const decl = loc ? Qibla.magneticDeclination(loc.latitude, loc.longitude) : 0;
    const trueBearing = this.qiblaBearing.toFixed(1);

    // Labels per language
    const L = {
      atMakkah:      { es: '¡Estás en la Qibla!',       ar: 'أنت في القبلة!',              en: 'You are at the Qibla!' },
      atMakkahDesc:  { es: 'Te encuentras en Meca o sus alrededores. La Kaaba está cerca.', ar: 'أنت في مكة المكرمة أو ضواحيها. الكعبة قريبة.', en: 'You are in Makkah or its surroundings. The Kaaba is nearby.' },
      pointToKaaba:  { es: 'Gira despacio hasta que la 🕋 llegue a la flecha', ar: 'أدر هاتفك ببطء حتى تصل الكعبة 🕋 إلى السهم', en: 'Slowly turn until the 🕋 reaches the arrow' },
      aligned:       { es: '¡Perfecto! Estás mirando a la Qibla', ar: 'ممتاز! أنت تنظر إلى القبلة', en: 'Perfect! You are facing the Qibla' },
      qiblaDir:      { es: 'Dirección Qibla',            ar: 'اتجاه القبلة',                en: 'Qibla Direction' },
      trueNorth:     { es: 'Norte verdadero',            ar: 'الشمال الحقيقي',              en: 'True North' },
      magneticNorth: { es: 'Norte magnético',            ar: 'الشمال المغناطيسي',           en: 'Magnetic North' },
      declination:   { es: 'Declinación magnética',      ar: 'الانحراف المغناطيسي',         en: 'Magnetic declination' },
      distance:      { es: 'Distancia a la Kaaba',       ar: 'المسافة إلى الكعبة',          en: 'Distance to Kaaba' },
      calibrate:     { es: 'Calibrar brújula',           ar: 'معايرة البوصلة',              en: 'Calibrate compass' },
      noCompass:     { es: 'Sin brújula: la dirección se muestra sin sensor', ar: 'بدون بوصلة: يظهر الاتجاه بدون حساس', en: 'No compass: direction shown without sensor' },
      tip:           { es: '<i class="fas fa-lightbulb"></i> Mantén el teléfono horizontal y alejado de objetos metálicos. La 🕋 siempre marca la dirección real a la Kaaba; la flecha fija es hacia donde apunta tu teléfono ahora.', ar: '<i class="fas fa-lightbulb"></i> حافظ على الهاتف أفقيًا وبعيدًا عن الأجسام المعدنية. الكعبة 🕋 تشير دائمًا للاتجاه الحقيقي، والسهم الثابت يمثّل الاتجاه الذي يشير إليه هاتفك الآن.', en: '<i class="fas fa-lightbulb"></i> Keep the phone horizontal and away from metal objects. The 🕋 always marks the real direction to the Kaaba; the fixed arrow shows where your phone is pointing right now.' },
    };

    return `
      <div class="qibla-v17">
        ${atMakkah ? `
          <div class="card makkah-card">
            <div class="makkah-icon"><i class="fas fa-mosque"></i></div>
            <div class="makkah-title">${L.atMakkah[lang]}</div>
            <div class="makkah-desc">${L.atMakkahDesc[lang]}</div>
            <div class="makkah-dist">${distance.toFixed(1)} km</div>
          </div>
        ` : `
          <div class="card qibla-card">
            <div class="qibla-hint-v17" id="qibla-hint">${L.pointToKaaba[lang]}</div>

            <!-- Compass circle -->
            <div class="compass-v17" id="compass">
              <!-- Rotating ring: turns with the phone (true north), carries
                   the cardinal marks, the magnetic-north dot AND the Kaaba
                   target as children so they all move together. -->
              <div class="compass-ring" id="compass-ring" style="transform: rotate(0deg);">
                ${this._dialTicksHtml()}
                <div class="cardinal-mark n"><span class="cardinal-letter">N</span><span class="cardinal-sub">${L.trueNorth[lang]}</span></div>
                <div class="cardinal-mark e"><span class="cardinal-letter">E</span></div>
                <div class="cardinal-mark s"><span class="cardinal-letter">S</span></div>
                <div class="cardinal-mark w"><span class="cardinal-letter">W</span></div>

                <!-- Magnetic North marker: fixed offset (declination) within the ring -->
                <div class="magnetic-north-marker" style="transform: rotate(${decl}deg);">
                  <div class="mn-dot"></div>
                </div>

                <!-- Kaaba target: fixed at the qibla bearing within the ring,
                     so it swings around the dial as the phone turns -->
                <div class="qibla-target" id="qibla-target" style="transform: rotate(${this.qiblaBearing}deg);">
                  <div class="qibla-target-stem"></div>
                  <div class="qibla-target-badge" id="qibla-target-badge" style="transform: translateX(-50%) rotate(${-this.qiblaBearing}deg);">
                    <span class="kaaba-emoji">🕋</span>
                  </div>
                </div>
              </div>

              <!-- Fixed device pointer: NOT part of the ring — always shows
                   where the phone is pointing right now. Align the 🕋 with it. -->
              <div class="device-pointer" id="device-pointer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 21l8-5 8 5z"/></svg>
              </div>

              <!-- Center hub -->
              <div class="compass-hub" id="compass-hub">
                <div class="hub-inner"></div>
              </div>
            </div>

            <!-- v135: زاوية القبلة الحالية -->
            <div class="cmp-angle-chip"><i class="fas fa-location-arrow"></i> <b id="compass-angle">—</b></div>

            <!-- Numeric info panel -->
            <div class="qibla-info-v17">
              <div class="info-row">
                <div class="info-item">
                  <div class="info-label">${L.qiblaDir[lang]}</div>
                  <div class="info-value main-value">${trueBearing}°</div>
                  <div class="info-sub">${cardinal.long}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">${L.distance[lang]}</div>
                  <div class="info-value">${distance.toFixed(0)} km</div>
                </div>
              </div>
              <div class="info-row secondary">
                <div class="info-item">
                  <div class="info-label">${L.declination[lang]}</div>
                  <div class="info-value">${decl > 0 ? '+' : ''}${decl.toFixed(1)}°</div>
                </div>
                <div class="info-item">
                  <div class="info-label">${L.magneticNorth[lang]}</div>
                  <div class="info-value" id="magnetic-heading-val">—</div>
                </div>
              </div>
            </div>
          </div>

          <div class="qibla-tip-v17">${L.tip[lang]}</div>

          <button class="btn-primary qibla-activate-btn" id="qibla-activate-btn" onclick="PrayerPage.calibrateCompass()">
            <i class="fas fa-compass"></i> ${L.calibrate[lang]}
          </button>
        `}
      </div>
    `;
  },

  // ============ MONTHLY PRAYER TABLE ============
  monthlyTab(loc) {
    // Trigger async load
    setTimeout(() => this.loadMonthlyPrayers(loc), 100);
    return `
      <div class="sub-topbar monthly-topbar"><button class="sub-topbar-btn" onclick="PrayerPage.switchTab('times')" aria-label="${LibraryData.L('libBack')}"><i class="fas ${document.documentElement.dir === 'rtl' ? 'fa-arrow-right' : 'fa-arrow-left'}"></i></button><div><div class="sub-topbar-title">${t('monthlyTable') || 'Mensual'}</div></div></div>
      <div id="monthly-prayer-container">
        ${Skeleton.prayerMonth()}
      </div>
    `;
  },

  async loadMonthlyPrayers(loc) {
    const container = document.getElementById('monthly-prayer-container');
    if (!container) return;

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const data = await API.getPrayerTimesMonth(
        loc.latitude,
        loc.longitude,
        month,
        year,
        AppState.settings.calculationMethod || 3
      );

      this._monthly = { data, month, year }; // guardado para la exportación PDF
      this.renderMonthlyTable(container, data, month, year);
    } catch (e) {
      console.warn('Monthly prayers error:', e);
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-triangle-exclamation"></i></div>
          <div class="empty-state-text">${t('errorLoading') || 'Error al cargar. Verifica tu conexión.'}</div>
          <button class="btn-primary" onclick="PrayerPage.loadMonthlyPrayers(${JSON.stringify(loc).replace(/"/g,'&quot;')})">${t('retry') || 'Reintentar'}</button>
        </div>`;
    }
  },

  renderMonthlyTable(container, data, month, year) {
    if (!data || data.length === 0) {
      container.innerHTML = `<div class="empty-state"><div>${t('noData') || 'Sin datos'}</div></div>`;
      return;
    }

    const monthName = new Date(year, month - 1).toLocaleString(currentLocale, { month: 'long' });
    const today = new Date();
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
    const todayDay = today.getDate();

    // v36/v40: cabecera sobre el jadwal — ciudad + fechas en UNA línea, solo
    // números separados por «/» (hijri / gregoriana), sin mes en texto.
    const loc = AppState.location || {};
    const hijri = AppState.hijri;
    const gregNum = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const hijriNum = hijri ? `${hijri.day}/${hijri.month?.number || ''}/${hijri.year}` : '';

    // Prayer column headers
    const prayerLabels = {
      Fajr: t('prayers.Fajr') || 'Fajr',
      Dhuhr: t('prayers.Dhuhr') || 'Dhuhr',
      Asr: t('prayers.Asr') || 'Asr',
      Maghrib: t('prayers.Maghrib') || 'Maghrib',
      Isha: t('prayers.Isha') || 'Isha',
    };

    // v1.0.138: صف اليوم يأخذ مواقيت تبويب اليوم نفسها (نفس المصدر والتوقيت الصيفي)
    const todayTimings = (AppState.timings && isCurrentMonth) ? AppState.timings : null;
    const rows = data.map(day => {
      const gDate = day.date?.gregorian;
      const hDate = day.date?.hijri;
      const dayNum = parseInt(gDate?.day, 10);
      const isToday = isCurrentMonth && dayNum === todayDay;
      const t24 = t => (t || '').split(' ')[0].slice(0,5); // "05:12 (CET)" -> "05:12"
      const isFriday = new Date(gDate?.date?.split('-').reverse().join('-'))?.getDay() === 5;
      const tm = (isToday && todayTimings) ? Object.assign({}, day.timings, {
        Fajr: todayTimings.Fajr, Sunrise: todayTimings.Sunrise, Dhuhr: todayTimings.Dhuhr,
        Asr: todayTimings.Asr, Maghrib: todayTimings.Maghrib, Isha: todayTimings.Isha,
      }) : (day.timings || {});

      return `
        <tr class="${isToday ? 'monthly-row-today' : ''} ${isFriday ? 'monthly-row-friday' : ''}">
          <td class="monthly-day-col">
            <div class="monthly-greg">${dayNum}</div>
            <div class="monthly-hijri">${hDate?.day} ${hDate?.month?.ar || hDate?.month?.en || ''}</div>
            ${isFriday ? '<div class="monthly-friday-badge"><i class="fas fa-book"></i></div>' : ''}
            ${isToday ? '<div class="monthly-today-badge"><i class="fas fa-star"></i></div>' : ''}
          </td>
          <td>${t24(tm.Fajr)}<div class="monthly-iqamah">${getIqamahTime('Fajr', t24(tm.Fajr)) || ''}</div></td>
          <td>${t24(tm.Dhuhr)}<div class="monthly-iqamah">${getIqamahTime('Dhuhr', t24(tm.Dhuhr)) || ''}</div></td>
          <td>${t24(tm.Asr)}<div class="monthly-iqamah">${getIqamahTime('Asr', t24(tm.Asr)) || ''}</div></td>
          <td>${t24(tm.Maghrib)}<div class="monthly-iqamah">${getIqamahTime('Maghrib', t24(tm.Maghrib)) || ''}</div></td>
          <td>${t24(tm.Isha)}<div class="monthly-iqamah">${getIqamahTime('Isha', t24(tm.Isha)) || ''}</div></td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="monthly-loc-bar">
        ${loc.city ? `<span class="monthly-loc-city"><i class="fas fa-location-dot"></i> ${escapeHtml(loc.city)}${loc.country ? ', ' + escapeHtml(loc.country) : ''}</span>` : ''}
        ${hijriNum ? `<span class="monthly-loc-hijri"><i class="fas fa-moon"></i> ${hijriNum} <span class="prayers-date-sep">/</span> <i class="fas fa-calendar-day"></i> ${gregNum}</span>` : `<span class="monthly-loc-hijri"><i class="fas fa-calendar-day"></i> ${gregNum}</span>`}
      </div>
      <div class="monthly-header">
        <div class="monthly-title"><i class="fas fa-calendar-days"></i> ${monthName} ${year}</div>
        <div class="monthly-subtitle">${data.length} ${t('days') || 'días'}</div>
      </div>
      <div class="monthly-table-wrap">
        <table class="monthly-table">
          <thead>
            <tr>
              <th>${t('day') || 'Día'}</th>
              <th><i class="fas fa-cloud-sun"></i> ${prayerLabels.Fajr}</th>
              <th><i class="fas fa-sun"></i> ${prayerLabels.Dhuhr}</th>
              <th><i class="fas fa-cloud-sun"></i> ${prayerLabels.Asr}</th>
              <th><i class="fas fa-mountain-sun"></i> ${prayerLabels.Maghrib}</th>
              <th><i class="fas fa-moon"></i> ${prayerLabels.Isha}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="monthly-legend">
        <span><span class="legend-dot today"></span> ${t('today') || 'Hoy'}</span>
        <span><span class="legend-dot friday"></span> ${t('friday') || 'Viernes'}</span>
      </div>
    `;
  },

  async calibrateCompass() {
    // iOS 13+ requiere permiso explícito (solo hace falta pedirlo una vez)
    if (!this.permissionGranted && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') {
          this.permissionGranted = true;
        } else {
          showToast('Permiso denegado');
          return;
        }
      } catch (e) {
        showToast('Error: ' + e.message);
        return;
      }
    } else {
      this.permissionGranted = true;
    }

    // v48: «Calibrar» reinicia el filtro de suavizado (arranca de cero, sin
    // arrastrar una media vieja de otra sesión/orientación) y vuelve a
    // enganchar los listeners — así el mismo botón sirve tanto para la
    // primera activación como para recalibrar más tarde.
    this.initOrientationListener();
    this.showCalibrationOverlay();
  },

  initOrientationListener() {
    if (this.orientationHandlerAbs) {
      window.removeEventListener('deviceorientationabsolute', this.orientationHandlerAbs);
      this.orientationHandlerAbs = null;
    }
    if (this.orientationHandlerRel) {
      window.removeEventListener('deviceorientation', this.orientationHandlerRel);
      this.orientationHandlerRel = null;
    }
    if (this._qiblaRaf) {
      cancelAnimationFrame(this._qiblaRaf);
      this._qiblaRaf = null;
    }

    Qibla.resetSmoothing();
    this._lastTrueHeading = undefined;
    this._lastAligned = undefined;
    this._pendingHeading = null;
    this._usingAbsolute = false;
    this._qiblaActive = true;

    // Apply the latest smoothed reading once per animation frame instead of
    // once per sensor sample (sensors can fire up to ~60/sec) — this alone
    // removes a lot of the visible "vibration" since we're no longer forcing
    // dozens of layout/paint updates per second.
    const applyFrame = () => {
      this._qiblaRaf = null;
      if (this._pendingHeading === null) return;
      const heading = this._pendingHeading;
      this._pendingHeading = null;

      // v135: البوصلة تتوقّف كليًا عند مغادرة الصفحة (اختفاء الحلقة)
      if (!this._qiblaActive || !document.getElementById('compass-ring')) { this.cleanup(); return; }

      const loc = AppState.location;
      const lang = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
      // v48: both webkitCompassHeading (iOS) and deviceorientationabsolute's
      // alpha (Android) are MAGNETIC headings, not true headings — always
      // run them through the declination correction (isTrueHeading=false).
      const computed = Qibla.compute(loc?.latitude || 0, loc?.longitude || 0, heading, lang, false);
      const trueHeading = computed.trueHeading;

      // Render deadband: skip DOM writes for sub-degree noise (kills visible vibration)
      if (this._lastTrueHeading !== undefined) {
        let dH = Math.abs(trueHeading - this._lastTrueHeading);
        if (dH > 180) dH = 360 - dH;
        if (dH < 0.35 && this._lastAligned === computed.aligned) return;
      }
      this._lastTrueHeading = trueHeading;

      // Rotating the ring by -trueHeading carries the cardinal marks, the
      // magnetic-north dot AND the Kaaba target along with it (all three
      // are DOM children of #compass-ring) — one transform, three things move.
      const ring = document.getElementById('compass-ring');
      if (ring) ring.style.transform = `rotate(${-trueHeading}deg)`;

      // Counter-rotate the Kaaba badge so it stays upright while it orbits.
      const badge = document.getElementById('qibla-target-badge');
      if (badge) badge.style.transform = `translateX(-50%) rotate(${trueHeading - this.qiblaBearing}deg)`;

      const aligned = computed.aligned;
      const target = document.getElementById('qibla-target');
      const pointer = document.getElementById('device-pointer');
      if (target) target.classList.toggle('aligned', aligned);
      if (pointer) pointer.classList.toggle('aligned', aligned);

      const hint = document.getElementById('qibla-hint');
      if (hint) {
        const L = {
          aligned: { es: '¡Perfecto! Estás mirando a la Qibla', ar: 'ممتاز! أنت تنظر إلى القبلة', en: 'Perfect! You are facing the Qibla' },
          pointTo: { es: 'Gira despacio hasta que la 🕋 llegue a la flecha', ar: 'أدر هاتفك ببطء حتى تصل الكعبة 🕋 إلى السهم', en: 'Slowly turn until the 🕋 reaches the arrow' },
        };
        hint.textContent = aligned ? L.aligned[lang] : L.pointTo[lang];
        hint.classList.toggle('aligned', aligned);
      }

      // Numeric magnetic-heading readout (magnetic = true − declination)
      // v135: زاوية القبلة المتبقية داخل مركز البوصلة
      const angEl = document.getElementById('compass-angle');
      if (angEl) {
        let rel = ((this.qiblaBearing - trueHeading) % 360 + 360) % 360;
        if (rel > 180) rel -= 360;
        angEl.textContent = (rel > 0 ? '+' : (rel < 0 ? '−' : '')) + Math.abs(Math.round(rel)) + '°';
        const hubEl = document.getElementById('compass-hub');
        if (hubEl) hubEl.classList.toggle('aligned', aligned);
      }

      const mhVal = document.getElementById('magnetic-heading-val');
      if (mhVal) {
        const mag = ((trueHeading - computed.magneticDeclination) % 360 + 360) % 360;
        mhVal.textContent = mag.toFixed(1) + '°';
      }

      // Haptic feedback on alignment (debounced)
      if (this._qiblaActive && aligned && navigator.vibrate && !this._lastAligned) {
        try { navigator.vibrate([30, 50, 30]); } catch (e) {}
      }
      this._lastAligned = aligned;
    };

    const processHeading = (rawHeading) => {
      if (rawHeading === null || isNaN(rawHeading)) return;
      // Adaptive smoothing (outlier rejection + micro-jitter deadband)
      const smoothed = Qibla.smoothHeading(rawHeading);
      this.deviceHeading = smoothed;
      this._pendingHeading = smoothed;
      if (!this._qiblaRaf) this._qiblaRaf = requestAnimationFrame(applyFrame);
    };

    // v48: deviceorientationabsolute and deviceorientation can BOTH fire for
    // the same physical movement on some Android/Chrome combinations — one
    // "absolute" (magnetometer-referenced) and one "relative" (can drift from
    // the page's initial orientation). Feeding both into the same filter
    // made the needle fight itself between two slightly different readings,
    // which looked like jitter. Once an "absolute" event arrives we trust it
    // exclusively and stop listening to the relative one. iOS never fires
    // deviceorientationabsolute at all, so this is a no-op there — it keeps
    // using deviceorientation + webkitCompassHeading as before.
    this.orientationHandlerAbs = (e) => {
      this._usingAbsolute = true;
      if (this.orientationHandlerRel) {
        window.removeEventListener('deviceorientation', this.orientationHandlerRel);
        this.orientationHandlerRel = null;
      }
      if (e.alpha === null) return;
      processHeading(360 - e.alpha);
    };

    this.orientationHandlerRel = (e) => {
      if (this._usingAbsolute) return;
      let heading = null;
      if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading; // iOS Safari: magnetic heading
      } else if (e.alpha !== null) {
        heading = 360 - e.alpha;
      }
      processHeading(heading);
    };

    window.addEventListener('deviceorientationabsolute', this.orientationHandlerAbs, true);
    window.addEventListener('deviceorientation', this.orientationHandlerRel, true);
  },

  showCalibrationOverlay() {
    // Remove any existing overlay synchronously (no fade) before creating a
    // fresh one, so re-tapping "Calibrar" quickly can't leave two stacked
    // #qibla-calib-overlay elements mid-transition.
    if (this._calibAutoHide) { clearTimeout(this._calibAutoHide); this._calibAutoHide = null; }
    const existing = document.getElementById('qibla-calib-overlay');
    if (existing) existing.remove();

    const lang = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    const L = {
      title: { es: 'Calibrando brújula', ar: 'جارٍ معايرة البوصلة', en: 'Calibrating compass' },
      desc:  { es: 'Mueve el teléfono trazando un 8 en el aire un par de veces para reajustar el sensor.', ar: 'حرّك هاتفك على شكل الرقم 8 في الهواء عدّة مرات لإعادة ضبط الحساس.', en: 'Move your phone tracing a figure-8 in the air a couple of times to reset the sensor.' },
      done:  { es: 'Listo', ar: 'تم', en: 'Done' },
    };

    const overlay = document.createElement('div');
    overlay.className = 'qibla-calib-overlay';
    overlay.id = 'qibla-calib-overlay';
    overlay.innerHTML = `
      <div class="qibla-calib-sheet">
        <div class="qibla-calib-title">${L.title[lang]}</div>
        <div class="qibla-calib-desc">${L.desc[lang]}</div>
        <div class="qibla-calib-stage">
          <svg class="qibla-calib-track" viewBox="0 0 100 60" fill="none">
            <path d="M50,30 C50,13.4 37.3,2 25,2 C10.7,2 2,15 2,30 C2,45 10.7,58 25,58 C37.3,58 50,46.6 50,30 C50,13.4 62.7,2 75,2 C89.3,2 98,15 98,30 C98,45 89.3,58 75,58 C62.7,58 50,46.6 50,30 Z"
              stroke="#d4a017" stroke-width="2.5" stroke-dasharray="5 6" stroke-linecap="round"/>
          </svg>
          <div class="qibla-calib-phone">📱</div>
        </div>
        <div class="qibla-calib-actions">
          <button class="btn-primary qibla-calib-done-btn" onclick="PrayerPage.hideCalibrationOverlay()">${L.done[lang]}</button>
        </div>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hideCalibrationOverlay();
    });
    document.body.appendChild(overlay);

    this._calibAutoHide = setTimeout(() => this.hideCalibrationOverlay(), 6000);
  },

  hideCalibrationOverlay() {
    if (this._calibAutoHide) {
      clearTimeout(this._calibAutoHide);
      this._calibAutoHide = null;
    }
    const overlay = document.getElementById('qibla-calib-overlay');
    if (!overlay) return;
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 200);
  },

  permissionPrompt() {
    return `
      <div class="permission-needed">
        <div class="permission-needed-icon"><i class="fas fa-location-dot"></i></div>
        <div class="permission-needed-title">${t('locationNeeded')}</div>
        <div class="permission-needed-desc">${t('locationDesc')}</div>
        <button class="btn-primary" onclick="PrayerPage.render(document.getElementById('main-content'))">
          ${t('grantPermission')}
        </button>
      </div>
    `;
  },

  cleanup() {
    this._qiblaActive = false;
    try { if (navigator.vibrate) navigator.vibrate(0); } catch (e) {}
    if (this.orientationHandlerAbs) {
      window.removeEventListener('deviceorientationabsolute', this.orientationHandlerAbs);
      this.orientationHandlerAbs = null;
    }
    if (this.orientationHandlerRel) {
      window.removeEventListener('deviceorientation', this.orientationHandlerRel);
      this.orientationHandlerRel = null;
    }
    if (this._qiblaRaf) {
      cancelAnimationFrame(this._qiblaRaf);
      this._qiblaRaf = null;
    }
    this.hideCalibrationOverlay();
    // v36: detener el contador de «tiempo restante» al salir de la página
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  },
};
