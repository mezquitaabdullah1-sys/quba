// 🌙 v98: إمساكية رمضان — جدول مواعيد الصلوات لشهر رمضان كامل ولخمس رمضانات قادمة
//     كل الحسابات محلية (HijriCalc + PrayerCalc) فلا تحتاج إنترنت.
const ImsakiyahPage = {
  _hy: null,
  _years: null,
  _rows: null,
  _loc: null,
  // v132: مدينة الرزنامة — اختيار مستقل تمامًا عن موقع التطبيق
  _calCity: null,
  _CAL_KEY: 'quba_imsak_city_v1',
  _loadCalCity() {
    try {
      const raw = localStorage.getItem(this._CAL_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (o && isFinite(Number(o.lat)) && isFinite(Number(o.lon))) {
        return { name: String(o.name || ''), country: String(o.country || ''),
                 lat: Number(o.lat), lon: Number(o.lon), tz: String(o.tz || '') };
      }
    } catch (e) {}
    return null;
  },
  _saveCalCity(c) {
    try {
      if (c) localStorage.setItem(this._CAL_KEY, JSON.stringify(c));
      else localStorage.removeItem(this._CAL_KEY);
    } catch (e) {}
  },
  _calLoc() {
    const c = this._calCity;
    if (!c) return this._loc;
    return { city: c.name, country: c.country, latitude: Number(c.lat), longitude: Number(c.lon) };
  },

  // أقرب ١ رمضان قادم (أو الجاري) ثم خمس رمضانات بعده = ٦ أشهر
  _ramadanYears() {
    const out = [];
    if (typeof HijriCalc === 'undefined' || !HijriCalc.toGregorian) return out;
    const now = new Date();
    let hy = 1448;
    try { const h = HijriCalc.fromDate(now); if (h && h.year) hy = h.year; } catch (e) {}
    try {
      const first = HijriCalc.toGregorian(hy, 9, 1);
      const after = HijriCalc.toGregorian(hy, 10, 1);
      if (!first || !after || after.getTime() <= now.getTime()) hy += 1;
    } catch (e) {}
    for (let i = 0; i < 6; i++) {
      const y = hy + i;
      let g = null;
      try { g = HijriCalc.toGregorian(y, 9, 1); } catch (e) {}
      if (g) out.push({ hy: y, start: g });
    }
    return out;
  },

  _monthLength(hy) {
    try {
      const s = HijriCalc.toGregorian(hy, 9, 1);
      const e = HijriCalc.toGregorian(hy, 10, 1);
      if (!s || !e) return 30;
      const len = Math.round((e.getTime() - s.getTime()) / 86400000);
      return (len === 29 || len === 30) ? len : 30;
    } catch (e) { return 30; }
  },

  _minusMin(hhmm, min) {
    const [h, m] = String(hhmm || '').split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '';
    let t = h * 60 + m - (min || 0);
    if (t < 0) t += 1440;
    const hh = Math.floor(t / 60) % 24, mm = t % 60;
    return (hh < 10 ? '0' + hh : '' + hh) + ':' + (mm < 10 ? '0' + mm : '' + mm);
  },

  _diffMin(a, b) {
    const p = (x) => { const [h, m] = String(x || '').split(':').map(Number); return (isNaN(h) || isNaN(m)) ? null : h * 60 + m; };
    const A = p(a), B = p(b);
    if (A === null || B === null) return null;
    let d = B - A;
    if (d < 0) d += 1440;
    return d;
  },

  // أسماء الأشهر الهجرية بلغة الواجهة (نسخة خاصة بالصفحة — لا تعتمد على صفحات أخرى)
  _hijriMonthName(m, loc) {
    const M = {
      ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
      es: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Akhir', 'Jumada al-Ula', 'Jumada al-Akhirah', 'Rayab', 'Shaban', 'Ramadán', 'Shawwal', 'Dhul-Qada', 'Dhul-Hiyya'],
      en: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'],
    };
    return ((M[loc] || M.ar)[m - 1]) || '';
  },

  _fmtMin(min) {
    if (min === null || min === undefined) return '—';
    const h = Math.floor(min / 60), m = min % 60;
    const hs = (currentLocale === 'ar') ? 'س' : 'h';
    const ms = (currentLocale === 'ar') ? 'د' : 'm';
    return h + ' ' + hs + ' ' + (m < 10 ? '0' + m : m) + ' ' + ms;
  },

  /**
   * v133: فرق (توقيت مدينة الرزنامة − توقيت الجهاز) بالمللي ثانية.
   * يعمل لأي مدينة: منطقة IANA المحفوظة → اسم في قائمة المدن → تقدير بالطول.
   */
  _calOffsetMs(date) {
    const d = date || new Date();
    const c = this._calCity;
    try {
      if (!c) return 0;
      let tz = c.tz || '';
      if (!tz && typeof Cities !== 'undefined') {
        const listed = Cities.byId(c.id || '') || Cities.match(Number(c.lat), Number(c.lon));
        if (listed && typeof DualTiming !== 'undefined' && DualTiming._tzFor) tz = DualTiming._tzFor(listed);
      }
      if (tz && typeof DualTiming !== 'undefined' && DualTiming._tzOffsetMs) {
        const ms = DualTiming._tzOffsetMs(tz, d);
        if (isFinite(ms)) return ms;
      }
      const cityH = Math.round(Number(c.lon) / 15);
      const devH = -d.getTimezoneOffset() / 60;
      return Math.round((cityH - devH) * 3600000);
    } catch (e) { return 0; }
  },

  _timesFor(lat, lon, date) {
    try {
      if (typeof PrayerCalc === 'undefined') return null;
      const base = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.calculationMethod) || 4;
      const method = (typeof API !== 'undefined' && API._effectiveMethod)
        ? API._effectiveMethod(lat, lon, base) : base;
      // حساب محلي خالص على «ساعة حائط» مدينة الرزنامة — لا يعتمد على
      // موقع التطبيق ولا على ذاكرة الشبكة، فيعمل مع أي مدينة جديدة.
      const offset = this._calOffsetMs(date);
      const wall = new Date(date.getTime() + offset);
      const raw = PrayerCalc.getTimings(Number(lat), Number(lon), wall, method,
        (this._calCity && this._calCity.country) || '', 0) || {};
      const dmin = Math.round(offset / 60000);
      const clean = (v) => String(v || '').split(' ')[0];
      const shift = (v) => {
        const s = clean(v);
        return (dmin && s && s.indexOf(':') !== -1) ? PrayerCalc._shiftTimeStr(s, dmin) : s;
      };
      return {
        Fajr: shift(raw.Fajr), Sunrise: shift(raw.Sunrise), Dhuhr: shift(raw.Dhuhr),
        Asr: shift(raw.Asr), Maghrib: shift(raw.Maghrib), Isha: shift(raw.Isha),
      };
    } catch (e) { return null; }
  },

  _buildRows(hy) {
    const rows = [];
    const y = (this._years || []).find(v => v.hy === hy) || (this._years || [])[0];
    const cal = this._calLoc();
    if (!y || !cal) return rows;
    const len = this._monthLength(hy);
    const todayH = (typeof HijriCalc !== 'undefined' && HijriCalc.fromDate) ? HijriCalc.fromDate(new Date()) : null;
    for (let d = 1; d <= len; d++) {
      const g = new Date(y.start.getFullYear(), y.start.getMonth(), y.start.getDate() + (d - 1), 12, 0, 0, 0);
      const t = this._timesFor(Number(cal.latitude), Number(cal.longitude), g);
      if (!t) continue;
      const imsak = this._minusMin(t.Fajr, 10);
      rows.push({
        d, g, t, imsak,
        fast: this._diffMin(t.Fajr, t.Maghrib),
        // v119: داخل رمضان فقط (سنة + شهر ٩ + يوم)؛ كان يقارن السنة واليوم فيتقدّم المؤشّر قبل رمضان
        isToday: !!(todayH && todayH.year === hy && parseInt(todayH.month, 10) === 9
                    && parseInt(todayH.day, 10) === d),
        wd: (typeof getWeekdayName === 'function') ? getWeekdayName(g.getDay(), (typeof currentLocale !== 'undefined' ? currentLocale : 'ar')) : '',
      });
    }
    return rows;
  },

  async render(container, params = {}, navToken = null) {
    const isStale = () => navToken !== null && typeof Router !== 'undefined' && !Router.isCurrent(navToken);
    const t0 = (k, fb) => (typeof t === 'function' && t(k)) ? t(k) : fb;

    container.innerHTML = `
      <div class="imsk-loading">
        <div class="imsk-spin"><i class="fas fa-moon"></i></div>
        <div>${t0('imsakLoading', 'جارٍ حساب مواعيد الشهر…')}</div>
      </div>`;

    // الموقع: المخزَّن أو الافتراضي — والحساب كله محلي فلا حاجة لشبكة
    let loc = (typeof AppState !== 'undefined' && AppState.location)
      || (typeof LocationService !== 'undefined' && LocationService.getCached && LocationService.getCached())
      || (typeof LocationService !== 'undefined' && LocationService.useDefault && LocationService.useDefault())
      || null;
    if (!loc && typeof LocationService !== 'undefined' && LocationService.getCurrent) {
      try {
        loc = await Promise.race([
          LocationService.getCurrent(),
          new Promise((res) => setTimeout(() => res(null), 6000)),
        ]);
      } catch (e) { loc = null; }
    }
    if (isStale()) return;
    if (!loc) {
      container.innerHTML = `<div class="imsk-empty">${t0('imsakNoLoc', 'تعذّر تحديد الموقع')}</div>`;
      return;
    }
    this._loc = loc;
    this._calCity = this._loadCalCity();
    this._years = this._ramadanYears();
    if (!this._years.length) {
      container.innerHTML = `<div class="imsk-empty">${t0('imsakNoData', 'تعذّر حساب التقويم الهجري')}</div>`;
      return;
    }
    const asked = parseInt(params.year, 10);
    this._hy = (asked && this._years.some(v => v.hy === asked)) ? asked : this._years[0].hy;
    this._rows = this._buildRows(this._hy);
    container.innerHTML = this._html(loc);
  },

  _html(loc) {
    const L = (k) => (typeof ClipsData !== 'undefined' && ClipsData.L) ? ClipsData.L(k) : k;
    const t0 = (k, fb) => (typeof t === 'function' && t(k)) ? t(k) : fb;
    const loc0 = (typeof currentLocale !== 'undefined' && ['es', 'ar', 'en'].includes(currentLocale)) ? currentLocale : 'ar';
    const isRtl = document.documentElement.dir === 'rtl';
    const y = this._years.find(v => v.hy === this._hy) || this._years[0];
    const cal = this._calLoc() || loc;
    const cityLine = [cal.city, cal.country].filter(Boolean).join(', ');
    const isCalCity = !!(this._calCity && this._calCity.lat != null);
    const gYear = y.start.getFullYear();
    const rows = this._rows || [];
    const fasts = rows.map(r => r.fast).filter(v => v !== null);
    const longest = fasts.length ? Math.max.apply(null, fasts) : null;
    const shortest = fasts.length ? Math.min.apply(null, fasts) : null;
    const lastDay = rows.length ? rows[rows.length - 1] : null;
    const fdate = (d) => { try { return d.toLocaleDateString(loc0, { day: 'numeric', month: 'long' }); } catch (e) { return d.toISOString().slice(0, 10); } };
    const gShort = (d) => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');

    const chips = this._years.map(v => `
      <button class="imsk-chip ${v.hy === this._hy ? 'active' : ''}" data-hy="${v.hy}" onclick="ImsakiyahPage.setYear(${v.hy})">
        <span class="imsk-chip-h">${v.hy}</span>
        <span class="imsk-chip-g">${v.start.getFullYear()}</span>
      </button>`).join('');

    const body = rows.map(r => `
      <tr class="${r.isToday ? 'is-today' : ''}">
        <td class="imsk-td-day">
          <span class="imsk-daynum">${r.d}</span>
          <span class="imsk-wd">${escapeHtml(r.wd)}</span>
          ${r.isToday ? `<span class="imsk-today-badge">${t0('imsakToday', 'اليوم')}</span>` : ''}
        </td>
        <td class="imsk-td-hijri">${r.d} ${this._hijriMonthName(9, loc0)}</td>
        <td class="imsk-td-greg">${gShort(r.g)}</td>
        <td class="imsk-td-imsak">${r.imsak}</td>
        <td class="imsk-td-fajr">${r.t.Fajr}</td>
        <td>${r.t.Sunrise}</td>
        <td>${r.t.Dhuhr}</td>
        <td>${r.t.Asr}</td>
        <td class="imsk-td-iftar">${r.t.Maghrib}</td>
        <td>${r.t.Isha}</td>
      </tr>`).join('');

    return `
      <div class="imsk-page">
        <div class="imsk-cover">
          <img class="imsk-cover-img" src="assets/ramadan/imsakiyah-cover.jpg" alt="" draggable="false">
          <div class="imsk-cover-veil"></div>
          <button class="imsk-back" onclick="Router.go('home')" aria-label="${escapeAttr(t0('back', 'رجوع'))}">
            <i class="fas fa-chevron-${isRtl ? 'right' : 'left'}"></i>
          </button>
          <div class="imsk-cover-body">
            <div class="imsk-cover-kicker"><i class="fas fa-star-and-crescent"></i> ${t0('imsakKicker', 'مواقيت الصيام والإفطار')}</div>
            <h1 class="imsk-cover-title">${t0('imsakTitle', 'إمساكية رمضان')}</h1>
            <div class="imsk-cover-year">${t0('imsakRamadan', 'رمضان')} ${this._hy} ${loc0 === 'ar' ? 'هـ' : 'AH'} · ${gYear}${loc0 === 'ar' ? ' م' : ''}</div>
            <div class="imsk-cover-loc"><i class="fas fa-location-dot"></i> ${escapeHtml(cityLine)}</div>
          </div>
        </div>

        <div class="imsk-citybar">
          <button class="imsk-city-btn" onclick="ImsakiyahPage.changeCalendarCity()" aria-label="${escapeAttr(t0('imsakCityChange', 'مدينة الإمساكية'))}">
            <i class="fas fa-location-dot"></i>
            <span>${escapeHtml(cal.city || t0('imsakChooseCity', 'اختر مدينة'))}</span>
            ${cal.country ? `<em>${escapeHtml(cal.country)}</em>` : ''}
            <small class="imsk-city-tz">${this._utcLabel()}</small>
            <i class="fas fa-pen imsk-city-edit"></i>
          </button>
          ${isCalCity ? `<button class="imsk-city-reset" onclick="ImsakiyahPage.resetCalendarCity()" title="${escapeAttr(t0('imsakCityUseApp', 'موقع التطبيق'))}">
            <i class="fas fa-rotate-left"></i><span>${t0('imsakCityUseApp', 'موقع التطبيق')}</span>
          </button>` : ''}
        </div>
        ${isCalCity ? `<div class="imsk-city-note"><i class="fas fa-circle-info"></i> ${t0('imsakCityNote', 'هذه الإمساكية لهذه المدينة فقط — موقع التطبيق وبقية الصفحات لم تتغيّر')}</div>` : ''}

        <div class="imsk-years" role="tablist">${chips}</div>

        <div class="imsk-stats">
          <div class="imsk-stat"><div class="imsk-stat-v">${rows.length}</div><div class="imsk-stat-l">${t0('imsakStatDays', 'أيام الشهر')}</div></div>
          <div class="imsk-stat"><div class="imsk-stat-v">${this._fmtMin(longest)}</div><div class="imsk-stat-l">${t0('imsakStatLongest', 'أطول صيام')}</div></div>
          <div class="imsk-stat"><div class="imsk-stat-v">${this._fmtMin(shortest)}</div><div class="imsk-stat-l">${t0('imsakStatShortest', 'أقصر صيام')}</div></div>
        </div>

        <div class="imsk-range">
          <i class="fas fa-calendar-days"></i>
          ${t0('imsakFrom', 'من')} ${fdate(y.start)} ${t0('imsakTo', 'إلى')} ${lastDay ? fdate(lastDay.g) : ''}
        </div>

        <div class="imsk-actions">
          <button class="imsk-act imsk-act-main" onclick="ImsakiyahPage.downloadImage(false)">
            <i class="fas fa-download"></i> ${t0('imsakDownload', 'تحميل صورة الإمساكية')}
          </button>
          <button class="imsk-act imsk-act-sec" onclick="ImsakiyahPage.downloadImage(true)" aria-label="${escapeAttr(t0('imsakShare', 'مشاركة الصورة'))}" title="${escapeAttr(t0('imsakShare', 'مشاركة الصورة'))}">
            <i class="fas fa-share-nodes"></i> ${t0('imsakShare', 'مشاركة')}
          </button>
        </div>

        <div class="imsk-sheet" id="imsk-sheet">
          <div class="imsk-sheet-head">
            <div class="imsk-sheet-title"><i class="fas fa-star-and-crescent"></i> ${t0('imsakTitle', 'إمساكية رمضان')} ${this._hy} ${loc0 === 'ar' ? 'هـ' : 'AH'}</div>
            <div class="imsk-sheet-sub">${escapeHtml(cityLine)} · ${t0('imsakRamadan', 'رمضان')} ${gYear}${loc0 === 'ar' ? ' م' : ''}</div>
          </div>
        <div class="imsk-tablewrap">
          <table class="imsk-table">
            <thead>
              <tr>
                <th class="imsk-th-day">${t0('imsakColDay', 'اليوم')}</th>
                <th>${t0('imsakColHijri', 'هجري')}</th>
                <th>${t0('imsakColGreg', 'ميلادي')}</th>
                <th class="imsk-th-imsak">${t0('imsakColImsak', 'الإمساك')}</th>
                <th>${t0('imsakColFajr', 'الفجر')}</th>
                <th>${t0('imsakColSunrise', 'الشروق')}</th>
                <th>${t0('imsakColDhuhr', 'الظهر')}</th>
                <th>${t0('imsakColAsr', 'العصر')}</th>
                <th class="imsk-th-iftar">${t0('imsakColIftar', 'الإفطار')}</th>
                <th>${t0('imsakColIsha', 'العشاء')}</th>
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </div>
        </div>

        <div class="imsk-note">
          <i class="fas fa-circle-info"></i>
          ${t0('imsakNote', 'المواقيت محسوبة محليًا على جهازك حسب موقعك، وقد تختلف دقيقة أو دقيقتين عن التقويم الرسمي لمدينتك.')}
        </div>
      </div>`;
  },


  /* ---------- v134: تحميل/مشاركة صورة الإمساكية ---------- */
  _utcLabel() {
    try {
      const ms = this._calOffsetMs(new Date());
      const mins = Math.round(ms / 60000);
      if (!isFinite(mins)) return '';
      const sign = mins < 0 ? '-' : '+';
      const a = Math.abs(mins);
      const hh = Math.floor(a / 60), mm = a % 60;
      return 'UTC' + sign + (hh < 10 ? '0' + hh : hh) + ':' + (mm < 10 ? '0' + mm : mm);
    } catch (e) { return ''; }
  },

  _toast(msg) {
    try {
      const old = document.querySelector('.imsk-toast');
      if (old) old.remove();
      const d = document.createElement('div');
      d.className = 'imsk-toast';
      d.textContent = msg;
      document.body.appendChild(d);
      setTimeout(() => { try { d.remove(); } catch (e) {} }, 2600);
    } catch (e) {}
  },

  // صورة الإمساكية كاملة — المولّد في js/imsak-poster.js
  async _posterCanvas() {
    const loc0 = (typeof currentLocale !== 'undefined') ? currentLocale : 'ar';
    const rows = this._rows || [];
    if (!rows.length || typeof ImsakPoster === 'undefined') return null;
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
    const cal = this._calLoc() || {};
    const t0 = (k, fb) => (typeof t === 'function' && t(k)) ? t(k) : fb;
    const y = (this._years || []).find(v => v.hy === this._hy) || {};
    const gYear = y.start ? y.start.getFullYear() : '';
    const monthName = this._hijriMonthName(9, loc0);
    const meta = {
      title: (loc0 === 'ar')
        ? 'إمساكية شهر رمضان ' + gYear + ' م — ' + this._hy + ' هـ'
        : 'Imsakiyah ' + this._hy + ' AH — ' + gYear,
      city: [cal.city, cal.country].filter(Boolean).join(' · '),
      sub: this._utcLabel(),
      note: t0('imsakNote', 'المواقيت محسوبة محليًا على جهازك، وقد تختلف دقيقة أو دقيقتين عن التقويم الرسمي.'),
      cols: [
        { w: 80,  label: t0('imsakColDay', 'اليوم'),   kind: 'day' },
        { w: 108, label: t0('imsakColHijri', 'هجري'),  kind: 'hijri' },
        { w: 84,  label: t0('imsakColGreg', 'ميلادي'), kind: 'greg' },
        { w: 100, label: t0('imsakColImsak', 'الإمساك'), kind: 'imsak' },
        { w: 100, label: t0('imsakColFajr', 'الفجر'),  kind: 'time' },
        { w: 100, label: t0('imsakColSunrise', 'الشروق'), kind: 'time' },
        { w: 100, label: t0('imsakColDhuhr', 'الظهر'), kind: 'time' },
        { w: 100, label: t0('imsakColAsr', 'العصر'),   kind: 'time' },
        { w: 100, label: t0('imsakColIftar', 'الإفطار'), kind: 'iftar' },
        { w: 100, label: t0('imsakColIsha', 'العشاء'), kind: 'time' },
      ],
    };
    const data = rows.map(r => ({
      d: r.d, hijri: r.d + ' ' + monthName,
      greg: String(r.g.getDate()).padStart(2, '0') + '/' + String(r.g.getMonth() + 1).padStart(2, '0'),
      today: !!r.isToday,
      times: [r.imsak, r.t.Fajr, r.t.Sunrise, r.t.Dhuhr, r.t.Asr, r.t.Maghrib, r.t.Isha],
    }));
    return ImsakPoster.render(data, meta);
  },

  async downloadImage(shareMode) {
    try {
      const btn = document.querySelector('.imsk-act-main');
      if (btn) btn.disabled = true;
      const cv = await this._posterCanvas();
      if (!cv) { this._toast('—'); if (btn) btn.disabled = false; return; }
      const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
      if (!blob) { if (btn) btn.disabled = false; return; }
      const fname = 'imsakiyah-ramadan-' + (this._hy || '') + '.png';
      if (shareMode) {
        const file = new File([blob], fname, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], title: 'Quba' }); if (btn) btn.disabled = false; return; }
          catch (e) { if (e && e.name === 'AbortError') { if (btn) btn.disabled = false; return; } }
        }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      this._toast((typeof t === 'function' && t('imsakSaved')) ? t('imsakSaved') : 'تم حفظ الصورة');
      if (btn) btn.disabled = false;
    } catch (e) {
      console.warn('Imsakiyah poster error:', e);
      this._toast('—');
    }
  },

  // v132: تغيير مدينة الرزنامة وحدها — لا يمسّ LocationService ولا AppState
  changeCalendarCity() {
    if (typeof Cities === 'undefined' || !Cities.openPicker) return;
    const t0 = (k, fb) => (typeof t === 'function' && t(k)) ? t(k) : fb;
    const self = this;
    Cities.openPicker({
      title: t0('imsakCityChange', 'مدينة الإمساكية'),
      currentId: null,
      onSelect: (city) => {
        if (!city) return;
        if (Cities._ensureListed) Cities._ensureListed(city);
        const lat = Number(city.lat != null ? city.lat : city.latitude);
        const lon = Number(city.lon != null ? city.lon : city.longitude);
        let tz = city.tz || '';
        if (!tz && typeof DualTiming !== 'undefined' && DualTiming._tzFor) {
          const listed = Cities.byId(city.id) || Cities.match(lat, lon);
          if (listed) tz = DualTiming._tzFor(listed) || '';
        }
        self._calCity = {
          name: Cities.plainName(city),
          country: Cities.plainCountry(city),
          lat: lat, lon: lon, tz: tz || '',
        };
        self._saveCalCity(self._calCity);
        self._refreshCalendar();
      },
    });
  },

  resetCalendarCity() {
    this._calCity = null;
    this._saveCalCity(null);
    this._refreshCalendar();
  },

  _refreshCalendar() {
    const box = document.getElementById('main-content');
    if (!box) return;
    if (!this._loc) this._loc = this._calLoc() || null;
    if (!this._loc) return;
    this._rows = this._buildRows(this._hy);
    const y = box.querySelector('.imsk-tablewrap');
    const top = y ? y.getBoundingClientRect().top : 0;
    box.innerHTML = this._html(this._loc);
    // إبقاء المستخدم عند الجدول نفسه بعد إعادة الرسم
    try {
      const again = box.querySelector('.imsk-tablewrap');
      if (again && top) window.scrollBy(0, again.getBoundingClientRect().top - top);
    } catch (e) {}
  },

  setYear(hy) {
    if (!this._years || !this._years.some(v => v.hy === hy)) return;
    this._hy = hy;
    this._rows = this._buildRows(hy);
    const c = document.getElementById('main-content');
    if (c && this._loc) c.innerHTML = this._html(this._loc);
  },

  cleanup() { this._rows = null; },
};
