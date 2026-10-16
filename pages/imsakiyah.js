// 🌙 v98: إمساكية رمضان — جدول مواعيد الصلوات لشهر رمضان كامل ولخمس رمضانات قادمة
//     كل الحسابات محلية (HijriCalc + PrayerCalc) فلا تحتاج إنترنت.
const ImsakiyahPage = {
  _hy: null,
  _years: null,
  _rows: null,
  _loc: null,

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

  _timesFor(lat, lon, date) {
    try {
      const method = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.calculationMethod) || 4;
      const res = API._offlinePrayerTimes(lat, lon, date, method);
      const tm = (res && res.timings) || {};
      const clean = (v) => String(v || '').split(' ')[0];
      return {
        Fajr: clean(tm.Fajr), Sunrise: clean(tm.Sunrise), Dhuhr: clean(tm.Dhuhr),
        Asr: clean(tm.Asr), Maghrib: clean(tm.Maghrib), Isha: clean(tm.Isha),
      };
    } catch (e) { return null; }
  },

  _buildRows(hy) {
    const rows = [];
    const y = (this._years || []).find(v => v.hy === hy) || (this._years || [])[0];
    if (!y || !this._loc) return rows;
    const len = this._monthLength(hy);
    const todayH = (typeof HijriCalc !== 'undefined' && HijriCalc.fromDate) ? HijriCalc.fromDate(new Date()) : null;
    for (let d = 1; d <= len; d++) {
      const g = new Date(y.start.getFullYear(), y.start.getMonth(), y.start.getDate() + (d - 1), 12, 0, 0, 0);
      const t = this._timesFor(this._loc.latitude, this._loc.longitude, g);
      if (!t) continue;
      const imsak = this._minusMin(t.Fajr, 10);
      rows.push({
        d, g, t, imsak,
        fast: this._diffMin(t.Fajr, t.Maghrib),
        isToday: !!(todayH && todayH.year === hy && parseInt(todayH.day, 10) === d),
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
    const cityLine = [loc.city, loc.country].filter(Boolean).join(', ');
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

        <div class="imsk-note">
          <i class="fas fa-circle-info"></i>
          ${t0('imsakNote', 'المواقيت محسوبة محليًا على جهازك حسب موقعك، وقد تختلف دقيقة أو دقيقتين عن التقويم الرسمي لمدينتك.')}
        </div>
      </div>`;
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
