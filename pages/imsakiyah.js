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
  // v1.0.154: عدّاد حي · طريقة حساب مختارة · يوم مختار للستوري · مؤقّت · لوحة المسجد
  _METH_KEY: 'quba_imsak_method_v1',
  _method: 0,
  _selDay: null,
  _timer: null,
  _tv: null,
  _onKey: null,
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

  /* ---------- v1.0.154: مساعدات عامة ---------- */
  _L(ar, es, en) {
    const l = (typeof currentLocale !== 'undefined') ? currentLocale : 'ar';
    return l === 'es' ? es : (l === 'en' ? en : ar);
  },

  _loadMethod() {
    try {
      const v = parseInt(localStorage.getItem(this._METH_KEY), 10);
      return (isFinite(v) && v > 0) ? v : 0;
    } catch (e) { return 0; }
  },
  _saveMethod(m) {
    try {
      if (m) localStorage.setItem(this._METH_KEY, String(m));
      else localStorage.removeItem(this._METH_KEY);
    } catch (e) {}
  },
  /** الطريقة الفعلية: ما اختاره المستخدم في الصفحة، أو إعداد التطبيق */
  _baseMethod() {
    if (this._method) return this._method;
    try { return Number(AppState.settings.calculationMethod) || 4; } catch (e) { return 4; }
  },

  /** v1.0.154: بديل محلي لـ PrayerCalc._shiftTimeStr (لم تكن معرّفة هناك) */
  _shiftStr(s, dmin) {
    if (!s || s.indexOf(':') === -1 || !dmin) return s;
    const p = s.split(' ')[0].split(':').map(Number);
    if (isNaN(p[0]) || isNaN(p[1])) return s;
    const t = ((p[0] * 60 + p[1] + dmin) % 1440 + 1440) % 1440;
    const hh = Math.floor(t / 60), mm = t % 60;
    return (hh < 10 ? '0' + hh : '' + hh) + ':' + (mm < 10 ? '0' + mm : '' + mm);
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

  /** فرق (توقيت مدينة الرزنامة − توقيت الجهاز) بالمللي ثانية — v1.0.153 */
  _zoneOffsetMs(tz, date) {
    try {
      const wall = (zone) => {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: zone, hour12: false,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        }).formatToParts(date).reduce((o, p) => { o[p.type] = p.value; return o; }, {});
        return Date.UTC(+parts.year, +parts.month - 1, +parts.day,
                        +parts.hour % 24, +parts.minute, +parts.second);
      };
      return wall(tz) - wall(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (e) { return NaN; }
  },

  _calOffsetMs(date) {
    const d = date || new Date();
    const c = this._calCity;
    if (!c) return 0;
    try {
      let tz = c.tz || '';
      if (!tz && typeof DualTiming !== 'undefined' && DualTiming._tzFor) {
        tz = DualTiming._tzFor({
          tz: '', country: c.country, name: c.name,
          lat: Number(c.lat), lon: Number(c.lon),
          latitude: Number(c.lat), longitude: Number(c.lon),
        }) || '';
      }
      if (tz) {
        const ms = this._zoneOffsetMs(tz, d);
        // عقلنة: فرق التوقيت الحقيقي لا يبعد عن خط الطول بأكثر من ٣ ساعات.
        // إن تجاوز ذلك فالمنطقة خاطئة — نتجاهلها بدل عرض وقت مغلوط.
        const lonH = Number(c.lon) / 15;
        const offH = ms / 3600000;
        if (isFinite(ms) && Math.abs((offH + d.getTimezoneOffset() / 60) - lonH) < 3.1) {
          c.tz = tz;
          return ms;
        }
      }
      // احتياط أخير: خط الطول بخطوات ربع ساعة (أدق من تقريب الساعات الكاملة)
      const cityH = Math.round((Number(c.lon) / 15) * 4) / 4;
      const devH = -d.getTimezoneOffset() / 60;
      return Math.round((cityH - devH) * 3600000);
    } catch (e) { return 0; }
  },

  /** هل توقيت المدينة مؤكَّد من قاعدة IANA أم مقدّر بخط الطول؟ */
  _tzResolved() {
    const c = this._calCity;
    if (!c) return true;
    if (c.tz) return true;
    try {
      return !!(typeof DualTiming !== 'undefined' && DualTiming._tzFor && DualTiming._tzFor({ country: c.country, lat: c.lat, lon: c.lon }));
    } catch (e) { return false; }
  },

  _methodName(methodId) {
    try {
      const id = Number(methodId || this._baseMethod());
      const M = {
        1: { ar: 'جامعة العلوم الإسلامية — كراتشي', es: 'Univ. de Karachi', en: 'Karachi' },
        2: { ar: 'الجمعية الإسلامية لأمريكا الشمالية', es: 'ISNA', en: 'ISNA' },
        3: { ar: 'رابطة العالم الإسلامي', es: 'Liga Mundial Islámica', en: 'Muslim World League' },
        4: { ar: 'أم القرى — مكة المكرمة', es: 'Umm al-Qura', en: 'Umm al-Qura' },
        5: { ar: 'الهيئة المصرية العامة للمساحة', es: 'Autoridad Egipcia', en: 'Egyptian Authority' },
        7: { ar: 'معهد الجيوفيزياء — طهران', es: 'Univ. de Teherán', en: 'Tehran' },
        8: { ar: 'مصرف كويت', es: 'Kuwait', en: 'Kuwait' },
        9: { ar: 'قطر', es: 'Catar', en: 'Qatar' },
        10: { ar: 'سنغافورة', es: 'Singapur', en: 'Singapore' },
        11: { ar: 'فرنسا', es: 'Francia', en: 'France' },
        12: { ar: 'تركيا', es: 'Turquía', en: 'Turkey' },
        13: { ar: 'روسيا', es: 'Rusia', en: 'Russia' },
        14: { ar: 'ألمانيا', es: 'Alemania', en: 'Germany' },
        16: { ar: 'دبي', es: 'Dubái', en: 'Dubai' },
        17: { ar: 'ماليزيا', es: 'Malasia', en: 'Malaysia' },
        19: { ar: 'الأردن — وزارة الأوقاف', es: 'Jordania (Awqaf)', en: 'Jordan Awqaf' },
        20: { ar: 'تونس', es: 'Túnez', en: 'Tunisia' },
        21: { ar: 'الجزائر', es: 'Argelia', en: 'Algeria' },
        23: { ar: 'المغرب', es: 'Marruecos', en: 'Morocco' },
      };
      const rec = M[id] || { ar: 'طريقة محلية', es: 'Método local', en: 'Local method' };
      const loc = (typeof currentLocale !== 'undefined') ? currentLocale : 'ar';
      return rec[loc] || rec.ar;
    } catch (e) { return ''; }
  },

  _timesFor(lat, lon, date, methodOverride) {
    try {
      if (typeof PrayerCalc === 'undefined') return null;
      // v1.0.154: الطريقة تُمرَّر صريحة (exact = true) كي يكون لمبدّل
      // طريقة الحساب أثر حقيقي في بلدان لها اتفاقية رسمية.
      const method = Number(methodOverride || this._baseMethod());
      const offset = this._calOffsetMs(date);
      // PrayerCalc يطرح من النتيجة إعداد «التوقيت الصيفي/الشتوي» اليدوي الخاص
      // بجهاز المستخدم. ذاك الإعداد يخصّ مدينته هو، ولا يجوز أن يُزحزح مدينة
      // أخرى ساعة كاملة — لذا نطرحه من الفرق قبل الإزاحة.
      let manual = 0;
      try { if (typeof PrayerCalc._manualShiftHours === 'function') manual = PrayerCalc._manualShiftHours() || 0; } catch (e) {}
      const raw = PrayerCalc.getTimings(Number(lat), Number(lon), date, method,
        (this._calCity && this._calCity.country) || '', 0, true) || {};
      const dmin = Math.round(offset / 60000) - Math.round(manual * 60);
      const clean = (v) => String(v || '').split(' ')[0];
      const shift = (v) => {
        const x = clean(v);
        if (!x || x.indexOf(':') === -1) return '';
        return dmin ? this._shiftStr(x, dmin) : x;
      };
      const out = {
        Fajr: shift(raw.Fajr), Sunrise: shift(raw.Sunrise), Dhuhr: shift(raw.Dhuhr),
        Asr: shift(raw.Asr), Maghrib: shift(raw.Maghrib), Isha: shift(raw.Isha),
      };
      return (out.Fajr && out.Maghrib) ? out : null;
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
      // v1.0.153: كان الصف يُحذف بصمت عند فشل الحساب فيظهر الشهر ناقصًا.
      const t = this._timesFor(Number(cal.latitude), Number(cal.longitude), g) || {};
      const ok = !!(t.Fajr && t.Maghrib);
      const imsak = ok ? this._minusMin(t.Fajr, 10) : '';
      rows.push({
        d, g, t, imsak, ok,
        fast: ok ? this._diffMin(t.Fajr, t.Maghrib) : null,
        // v119: داخل رمضان فقط (سنة + شهر ٩ + يوم)؛ كان يقارن السنة واليوم فيتقدّم المؤشّر قبل رمضان
        isToday: !!(todayH && todayH.year === hy && parseInt(todayH.month, 10) === 9
                    && parseInt(todayH.day, 10) === d),
        wdIdx: g.getDay(),
        isFriday: g.getDay() === 5,
        last10: d >= 21,          // v1.0.154: العشر الأواخر
        qadr: d === 27,           // ليلة القدر (أرجح ليلة)
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
    this._method = this._loadMethod();
    this._selDay = null;
    this._years = this._ramadanYears();
    if (!this._years.length) {
      container.innerHTML = `<div class="imsk-empty">${t0('imsakNoData', 'تعذّر حساب التقويم الهجري')}</div>`;
      return;
    }
    const asked = parseInt(params.year, 10);
    this._hy = (asked && this._years.some(v => v.hy === asked)) ? asked : this._years[0].hy;
    this._rows = this._buildRows(this._hy);
    container.innerHTML = this._html(loc);
    this._startTimer();
    this.scheduleReminders(true);
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

    const sel = this._selRow();
    const body = rows.map(r => {
      const cls = [];
      if (r.isToday) cls.push('is-today');
      if (r.isFriday) cls.push('is-friday');
      if (r.last10) cls.push('is-last10');
      if (r.qadr) cls.push('is-qadr');
      if (sel && sel.d === r.d) cls.push('is-sel');
      return `
      <tr class="${cls.join(' ')}" data-d="${r.d}" tabindex="0" role="button" onclick="ImsakiyahPage.selectDay(${r.d})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();ImsakiyahPage.selectDay(${r.d});}">
        <td class="imsk-td-day">
          <span class="imsk-daynum">${r.d}</span>
          <span class="imsk-wd">${escapeHtml(r.wd)}</span>
          ${r.isToday ? `<span class="imsk-today-badge">${t0('imsakToday', 'اليوم')}</span>` : ''}
          ${r.qadr ? `<span class="imsk-tag">★</span>` : ''}
        </td>
        <td class="imsk-td-hijri">${r.d} ${this._hijriMonthName(9, loc0)}</td>
        <td class="imsk-td-greg">${gShort(r.g)}</td>
        <td class="imsk-td-imsak">${r.imsak || '—'}</td>
        <td class="imsk-td-fajr">${r.t.Fajr || '—'}</td>
        <td>${r.t.Sunrise || '—'}</td>
        <td>${r.t.Dhuhr || '—'}</td>
        <td>${r.t.Asr || '—'}</td>
        <td class="imsk-td-iftar">${r.t.Maghrib || '—'}</td>
        <td>${r.t.Isha || '—'}</td>
      </tr>`;
    }).join('');

    return `
      <div class="imsk-page">
        <div class="imsk-cover">
          <img class="imsk-cover-img" src="assets/ramadan/imsakiyah-cover-2.jpg" alt="" draggable="false">
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
            <small class="imsk-city-tz">${this._utcLabel()}${this._calCity && this._calCity.tz ? ' · ' + escapeHtml(this._calCity.tz.replace(/_/g, ' ')) : ''}</small>
            <i class="fas fa-pen imsk-city-edit"></i>
          </button>
          ${isCalCity ? `<button class="imsk-city-reset" onclick="ImsakiyahPage.resetCalendarCity()" title="${escapeAttr(t0('imsakCityUseApp', 'موقع التطبيق'))}">
            <i class="fas fa-rotate-left"></i><span>${t0('imsakCityUseApp', 'موقع التطبيق')}</span>
          </button>` : ''}
        </div>
        ${isCalCity ? `<div class="imsk-city-note"><i class="fas fa-circle-info"></i> ${t0('imsakCityNote', 'هذه الإمساكية لهذه المدينة فقط — موقع التطبيق وبقية الصفحات لم تتغيّر')}</div>` : ''}
        <div class="imsk-tznote ${this._tzResolved() ? 'is-ok' : 'is-warn'}">
          <i class="fas ${this._tzResolved() ? 'fa-clock' : 'fa-triangle-exclamation'}"></i>
          <b>${this._utcLabel()}</b>
          <span>${escapeHtml(this._methodName())}</span>
          ${this._tzResolved() ? '' : `<em>${t0('imsakTzEst', 'التوقيت مقدّر بخط الطول — راجع فرق الساعات يدويًا')}</em>`}
        </div>

        <div class="imsk-method">
          <div class="imsk-method-h"><i class="fas fa-sliders"></i> ${this._L('طريقة الحساب', 'Método de cálculo', 'Calculation method')}</div>
          <div class="imsk-method-opts">${this._methodOptions()}</div>
          <div class="imsk-method-diff">${this._methodDiff()}</div>
        </div>

        <div class="imsk-live" id="imsk-live">
          <div class="imsk-live-top">
            <span class="imsk-live-k"><i class="fas fa-hourglass-half"></i> <span data-live="label">${this._L('باقي للإفطار', 'Falta para el iftar', 'Left to iftar')}</span></span>
            <span class="imsk-live-e"><span data-live="event">—</span> · <b data-live="eventTime">—</b></span>
          </div>
          <div class="imsk-live-t" data-live="clock">--:--:--</div>
          <div class="imsk-live-bar"><i data-live-bar style="width:0%"></i></div>
          <div class="imsk-live-f"><i class="fas fa-circle-info"></i> <span data-live="note">—</span></div>
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

        <div class="imsk-actions">
          <button class="imsk-act imsk-act-main" id="imsk-act-img" onclick="ImsakiyahPage.downloadImage(false)">
            <i class="fas fa-image"></i> ${this._L('صورة الشهر', 'Imagen del mes', 'Month image')}
          </button>
          <button class="imsk-act imsk-act-gold" id="imsk-act-pdf" onclick="ImsakiyahPage.exportPDF()">
            <i class="fas fa-file-pdf"></i> ${this._L('PDF للطباعة A4', 'PDF A4', 'Print PDF A4')}
          </button>
          <button class="imsk-act imsk-act-gold" id="imsk-act-story" onclick="ImsakiyahPage.storyImage()">
            <i class="fas fa-mobile-screen"></i> ${this._L('ستوري يوم', 'Story del día', 'Day story')} <b class="imsk-story-day">${sel ? sel.d : ''}</b>
          </button>
          <button class="imsk-act imsk-act-sec" id="imsk-act-share" onclick="ImsakiyahPage.downloadImage(true)">
            <i class="fas fa-share-nodes"></i> ${this._L('مشاركة', 'Compartir', 'Share')}
          </button>
        </div>
        <button class="imsk-act imsk-act-tv" onclick="Router.go('ramadan')" style="margin-bottom:10px">
          <i class="fas fa-star-and-crescent"></i> ${this._L('وضع رمضان — ختمة والعشر الأواخر', 'Modo Ramadán — jatma y últimas noches', 'Ramadan mode — khatma & last nights')}
        </button>
        <button class="imsk-act imsk-act-tv" onclick="ImsakiyahPage.openTvMode()">
          <i class="fas fa-tv"></i> ${this._L('عرض على التلفاز — لوحة المسجد', 'Ver en TV — modo mezquita', 'Show on TV — masjid board')}
        </button>

        <div class="imsk-card" id="imsk-remind">${this._remindHtml()}</div>
        <div class="imsk-card" id="imsk-fast">${this._fastHtml()}</div>

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
        <div class="imsk-legend">
          <span class="lg-fri"><i></i>${t0('imsakLegFri', 'الجمعة')}</span>
          <span class="lg-l10"><i></i>${this._L('العشر الأواخر', 'Últimas 10 noches', 'Last 10 nights')}</span>
          <span class="lg-qadr"><i></i>${this._L('ليلة ٢٧', 'Noche 27', 'Night 27')}</span>
        </div>
        <div class="imsk-hint"><i class="fas fa-hand-pointer"></i> ${this._L('اضغط على أي يوم لاختيار صورة الستوري لذلك اليوم', 'Toca un día para su imagen de story', 'Tap a day to use it for the story image')}</div>
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

  /* ---------- v1.0.155: تذكير الإمساك والإفطار ---------- */
  _remindKey: 'quba_ramadan_remind_v1',

  _remindCfg() {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(this._remindKey) || 'null'); } catch (e) { o = null; }
    if (!o || typeof o !== 'object') o = { imsak: true, iftar: true, pre: 0 };
    return { imsak: !!o.imsak, iftar: !!o.iftar, pre: Math.max(0, Math.min(45, Number(o.pre) || 0)) };
  },

  _saveRemind(o) {
    try { localStorage.setItem(this._remindKey, JSON.stringify(o)); } catch (e) {}
  },

  /** يرجّع دالة إرسال للجسر الأصلي، أو null في المتصفح */
  _nativeRemind() {
    try {
      if (typeof window === 'undefined') return null;
      const A = window.Android;
      if (A && typeof A.scheduleRamadanReminders === 'function') {
        return (j) => A.scheduleRamadanReminders(j);
      }
      const IB = window.AndroidBridge;
      if (IB && typeof IB.scheduleRamadanReminders === 'function') {
        return (j) => IB.scheduleRamadanReminders(j);
      }
    } catch (e) {}
    return null;
  },

  _fmtLeft(ms) {
    const s = Math.max(0, Math.round(Number(ms) / 1000));
    const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
    const d = this._L('د', 'min', 'min'), hh = this._L('س', 'h', 'h');
    return (h > 0) ? (h + ' ' + hh + ' ' + m + ' ' + d) : (m + ' ' + d);
  },

  /** v1.0.159: التذكيرات تُبنى من أقرب رمضان لا من السنة المعروضة في الرزنامة */
  _rowsForRemind() {
    const ys = this._years || [];
    if (!ys.length) return this._rows || [];
    const hy0 = ys[0].hy;
    if (hy0 === this._hy || !this._loc) return this._rows || [];
    try { return this._buildRows(hy0); } catch (e) { return this._rows || []; }
  },

  _nextRemindInfo() {
    const c = this._remindCfg();
    const rows = this._rowsForRemind();
    const now = Date.now();
    const cand = [];
    rows.forEach(r => {
      if (c.imsak) {
        const at = this._devMsFor(r, r.imsak);
        if (at && at > now) cand.push({ at: at, label: this._L('الإمساك', 'Suhoor', 'Imsak'), d: r.d });
      }
      if (c.iftar) {
        const at = this._devMsFor(r, r.t.Maghrib);
        if (at && at > now) cand.push({ at: at, label: this._L('الإفطار', 'Iftar', 'Iftar'), d: r.d });
      }
    });
    cand.sort((a, b) => a.at - b.at);
    return cand[0] || null;
  },

  _remindHtml() {
    const c = this._remindCfg();
    const B = this._nativeRemind();
    const L = (a, b, cc) => this._L(a, b, cc);
    const nxt = this._nextRemindInfo();
    let status;
    if (!c.imsak && !c.iftar) status = L('التذكيرات موقوفة', 'Avisos apagados', 'Reminders off');
    else if (nxt) status = L('القادم', 'Siguiente', 'Next') + ': <b>' + escapeHtml(nxt.label) + '</b> · '
      + this._L('يوم', 'día', 'day') + ' ' + nxt.d + ' · ' + this._fmtLeft(nxt.at - Date.now());
    else status = L('لا مواقيت قادمة في هذه الرزنامة', 'Sin avisos próximos', 'No upcoming reminders');
    const badge = B
      ? `<span class="imsk-card-badge is-ok"><i class="fas fa-mobile-screen"></i> ${L('إشعارات النظام', 'Notificación del sistema', 'System notification')}</span>`
      : `<span class="imsk-card-badge is-warn"><i class="fas fa-globe"></i> ${L('داخل التطبيق فقط', 'Solo en la app', 'App only')}</span>`;
    return `
      <div class="imsk-card-h"><i class="fas fa-bell"></i> ${L('تذكير الإمساك والإفطار', 'Avisos de suhoor e iftar', 'Suhoor & iftar reminders')}${badge}</div>
      <div class="imsk-tgs">
        <button class="imsk-tg ${c.imsak ? 'is-on' : ''}" onclick="ImsakiyahPage.toggleRemind('imsak')">
          <i class="fas fa-moon"></i> ${L('الإمساك', 'Suhoor', 'Imsak')} <b>${c.imsak ? L('مفعّل', 'ON', 'ON') : L('متوقف', 'OFF', 'OFF')}</b>
        </button>
        <button class="imsk-tg ${c.iftar ? 'is-on' : ''}" onclick="ImsakiyahPage.toggleRemind('iftar')">
          <i class="fas fa-utensils"></i> ${L('الإفطار', 'Iftar', 'Iftar')} <b>${c.iftar ? L('مفعّل', 'ON', 'ON') : L('متوقف', 'OFF', 'OFF')}</b>
        </button>
      </div>
      <div class="imsk-lead">
        <span>${L('تنبيه قبل الإفطار', 'Aviso antes del iftar', 'Pre-iftar alert')}</span>
        ${[0, 10, 15, 30].map(v => `<button class="imsk-lopt ${c.pre === v ? 'is-on' : ''}" onclick="ImsakiyahPage.setRemindLead(${v})">${v ? v + ' ' + L('د', 'min', 'min') : L('بلا', 'No', 'No')}</button>`).join('')}
      </div>
      <div class="imsk-rstat">${status}</div>
      <div class="imsk-rnote"><i class="fas fa-circle-info"></i> ${B
        ? L('تُجدول المواقيت القادمة (حتى ٤٠ تنبيهًا) في كل فتح للتطبيق — وتُعاد تلقائيًا بعد إعادة التشغيل.', 'Se programan los próximos avisos (hasta 40) al abrir la app; se restauran tras reiniciar.', 'Upcoming reminders (up to 40) are scheduled on each app open and restored after reboot.')
        : L('إشعارات النظام تعمل داخل تطبيق قُبَّة (APK). في المتصفح يظهر العدّاد فقط.', 'Las notificaciones del sistema requieren la app Quba.', 'System notifications require the Quba app.')}</div>`;
  },

  toggleRemind(kind) {
    const c = this._remindCfg();
    if (kind === 'imsak') c.imsak = !c.imsak; else c.iftar = !c.iftar;
    this._saveRemind(c);
    this._refreshRemind();
    this.scheduleReminders(true);
  },

  setRemindLead(v) {
    const c = this._remindCfg();
    c.pre = Math.max(0, Math.min(45, Number(v) || 0));
    this._saveRemind(c);
    this._refreshRemind();
    this.scheduleReminders(true);
  },

  _refreshRemind() {
    const box = document.getElementById('imsk-remind');
    if (box) { try { box.innerHTML = this._remindHtml(); } catch (e) {} }
  },

  /** يبني خطة الأيام القادمة ويرسلها للجسر الأصلي (أو يتجاهل في المتصفح) */
  scheduleReminders(silent) {
    const c = this._remindCfg();
    const rows = this._rowsForRemind();
    const now = Date.now();
    const items = [];
    if (c.imsak || c.iftar) {
      rows.forEach(r => {
        if (c.imsak) {
          const at = this._devMsFor(r, r.imsak);
          if (at && at > now + 60000) items.push({
            at: at, kind: 'imsak', day: r.d,
            title: this._L('الإمساك', 'Suhoor', 'Imsak') + ' · ' + this._L('يوم', 'Día', 'Day') + ' ' + r.d,
            body: this._L('أمسك عن الطعام والشراب — ' + r.imsak, 'Comida y bebida hasta las ' + r.imsak, 'Stop eating and drinking — ' + r.imsak),
          });
        }
        if (c.iftar) {
          const at = this._devMsFor(r, r.t.Maghrib);
          if (at && at > now + 60000) {
            if (c.pre && (at - c.pre * 60000) > now + 60000) items.push({
              at: at - c.pre * 60000, kind: 'pre', day: r.d,
              title: this._L('باقي ' + c.pre + ' دقيقة للإفطار', c.pre + ' min para el iftar', c.pre + ' min to iftar'),
              body: this._L('جهّز إفطارك — المغرب ' + r.t.Maghrib, 'Prepara tu iftar — Magreb ' + r.t.Maghrib, 'Get your iftar ready — Maghrib ' + r.t.Maghrib),
            });
            items.push({
              at: at, kind: 'iftar', day: r.d,
              title: this._L('الإفطار', 'Iftar', 'Iftar') + ' · ' + this._L('يوم', 'Día', 'Day') + ' ' + r.d,
              body: this._L('أفطر هنيئًا — ' + r.t.Maghrib, 'Buen iftar — ' + r.t.Maghrib, 'Enjoy your iftar — ' + r.t.Maghrib),
            });
          }
        }
      });
    }
    items.sort((a, b) => a.at - b.at);
    const plan = { enabled: !!(c.imsak || c.iftar), items: items.slice(0, 40) };
    const B = this._nativeRemind();
    if (!B) {
      if (!silent) this._toast(this._L('التذكيرات تحتاج تطبيق الهاتف', 'Los avisos requieren la app', 'Reminders need the phone app'));
      return plan;
    }
    try { B(JSON.stringify(plan)); } catch (e) { console.warn('reminders:', e); }
    if (!silent) this._toast(this._L('تم جدولة التذكيرات', 'Avisos programados', 'Reminders scheduled'));
    return plan;
  },

  /* ---------- v1.0.155: سجل الصيام والقضاء ---------- */
  _fastKey: 'quba_fast_log_v1',

  _fastLog() {
    try {
      const o = JSON.parse(localStorage.getItem(this._fastKey) || '{}');
      return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
    } catch (e) { return {}; }
  },

  _fastMonth() {
    const all = this._fastLog();
    const m = all[String(this._hy || '')];
    return (m && typeof m === 'object' && !Array.isArray(m)) ? m : {};
  },

  _fastState(d) { return Number(this._fastMonth()[String(d)]) || 0; },

  _setFast(d, v) {
    const all = this._fastLog();
    const k = String(this._hy || '');
    let m = all[k];
    if (!m || typeof m !== 'object' || Array.isArray(m)) m = {};
    if (v) m[String(d)] = v; else delete m[String(d)];
    all[k] = m;
    try { localStorage.setItem(this._fastKey, JSON.stringify(all)); } catch (e) {}
    if (v === 1 && typeof Gamification !== 'undefined' && Gamification && typeof Gamification.awardOnce === 'function') {
      try { Gamification.awardOnce('fast', k + '-' + d, 5); } catch (e) {}
    }
    this._refreshFast();
  },

  _fastStats() {
    const m = this._fastMonth();
    const all = this._fastLog();
    let fasted = 0, missed = 0;
    Object.keys(m).forEach(k => {
      if (k === 'repaid') return;
      const v = Number(m[k]);
      if (v === 1) fasted++; else if (v === 2) missed++;
    });
    // v1.0.159: القضاء كان محفوظًا خارج الشهر فيُخصم قضاء سنة من دين سنة أخرى
    let repaid = Number(m.repaid);
    if (!isFinite(repaid)) {
      repaid = Math.max(0, Number(all.repaid) || 0);
      try {
        const d = this._fastLog(), key = String(this._hy || '');
        if (!d[key] || typeof d[key] !== 'object' || Array.isArray(d[key])) d[key] = {};
        d[key].repaid = repaid;
        localStorage.setItem(this._fastKey, JSON.stringify(d));
      } catch (e) {}
    }
    repaid = Math.max(0, repaid);
    return { fasted: fasted, missed: missed, repaid: repaid, owed: Math.max(0, missed - repaid) };
  },

  addQada(n) {
    const all = this._fastLog();
    const key = String(this._hy || '');
    let m = all[key];
    if (!m || typeof m !== 'object' || Array.isArray(m)) m = {};
    const cur = isFinite(Number(m.repaid)) ? Number(m.repaid) : Math.max(0, Number(all.repaid) || 0);
    m.repaid = Math.max(0, cur + Number(n || 0));
    all[key] = m;
    try { localStorage.setItem(this._fastKey, JSON.stringify(all)); } catch (e) {}
    this._refreshFast();
  },

  /** حلقات الحالة: غير مسجّل ← صائم ← أفطر ← غير مسجّل */
  cycleFast(d) {
    const row = (this._rows || []).find(r => r.d === Number(d));
    if (!row) return;
    // v1.0.159: row.g منتصف النهار، فكان «اليوم» نفسه يُحسب مستقبلًا (١٢:٠٠ > ٠٠:٠٠)
    const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
    if (row.g && row.g.getTime() >= midnight.getTime() + 86400000) {
      this._toast(this._L('هذا اليوم لم يأتِ بعد', 'Ese día aún no llega', 'That day has not come yet'));
      return;
    }
    const cur = this._fastState(d);
    const nxt = cur === 0 ? 1 : (cur === 1 ? 2 : 0);
    this._setFast(d, nxt);
  },

  _fastHtml() {
    const st = this._fastStats();
    const rows = this._rows || [];
    const L = (a, b, c) => this._L(a, b, c);
    const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
    const tomorrow = midnight.getTime() + 86400000;
    const chips = rows.map(r => {
      const v = this._fastState(r.d);
      const future = !!(r.g && r.g.getTime() >= tomorrow);
      const cls = v === 1 ? 'is-fast' : (v === 2 ? 'is-miss' : '');
      const icon = v === 1 ? 'fa-check' : (v === 2 ? 'fa-xmark' : 'fa-minus');
      return `<button class="imsk-fchip ${cls} ${future ? 'is-future' : ''}" ${future ? 'disabled' : ''} onclick="ImsakiyahPage.cycleFast(${r.d})"><b>${r.d}</b><i class="fas ${icon}"></i></button>`;
    }).join('');
    return `
      <div class="imsk-card-h"><i class="fas fa-clipboard-check"></i> ${L('سجل الصيام والقضاء', 'Registro de ayuno y reposición', 'Fasting & makeup log')}</div>
      <div class="imsk-fsum">
        <div class="is-fast"><b>${st.fasted}</b><span>${L('صمت', 'Ayuné', 'Fasted')}</span></div>
        <div class="is-miss"><b>${st.missed}</b><span>${L('أفطرت', 'No ayuné', 'Missed')}</span></div>
        <div class="${st.owed ? 'is-owed' : ''}"><b>${st.owed}</b><span>${L('عليك قضاء', 'Por reponer', 'To make up')}</span></div>
        <div><b>${st.repaid}</b><span>${L('قضيت', 'Repuestas', 'Made up')}</span></div>
      </div>
      <div class="imsk-fgrid">${chips}</div>
      <div class="imsk-qada">
        <button class="imsk-qbtn" onclick="ImsakiyahPage.addQada(1)"><i class="fas fa-plus"></i> ${L('قضيت يومًا', 'Repuse un día', 'Made up a day')}</button>
        <button class="imsk-qbtn imsk-qbtn-sec" onclick="ImsakiyahPage.addQada(-1)"><i class="fas fa-rotate-left"></i> ${L('تراجع', 'Deshacer', 'Undo')}</button>
      </div>
      <div class="imsk-qhint">${L('اضغط أي يوم: صائم ← أفطر ← مسح', 'Toca un día: ayuné ← no ayuné ← borrar', 'Tap a day: fasted ← missed ← clear')}</div>`;
  },

  _refreshFast() {
    const box = document.getElementById('imsk-fast');
    if (box) { try { box.innerHTML = this._fastHtml(); } catch (e) {} }
  },

  // صورة الإمساكية كاملة — المولّد في js/imsak-poster.js
  async _posterCanvas(opts) {
    const o = opts || {};
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
      bg: (o.layout === 'a4') ? '' : 'assets/ramadan/imsakiyah-bg.jpg',
      layout: o.layout || 'poster',
      method: this._methodName() ? (this._methodName() + ' · ' + this._utcLabel()) : this._utcLabel(),
      note: t0('imsakNote', 'المواقيت محسوبة محليًا على جهازك، وقد تختلف دقيقة أو دقيقتين عن التقويم الرسمي.'),
      cols: [
        { w: 96, label: t0('imsakColDay', 'اليوم'),   kind: 'day' },
        { w: 108, label: t0('imsakColHijri', 'هجري'),  kind: 'hijri' },
        { w: 78, label: t0('imsakColGreg', 'ميلادي'), kind: 'greg' },
        { w: 96, label: t0('imsakColImsak', 'الإمساك'), kind: 'imsak' },
        { w: 94, label: t0('imsakColFajr', 'الفجر'),  kind: 'time' },
        { w: 94, label: t0('imsakColSunrise', 'الشروق'), kind: 'time' },
        { w: 94, label: t0('imsakColDhuhr', 'الظهر'), kind: 'time' },
        { w: 94, label: t0('imsakColAsr', 'العصر'),   kind: 'time' },
        { w: 110, label: t0('imsakColIftar', 'الإفطار'), kind: 'iftar' },
        { w: 94, label: t0('imsakColIsha', 'العشاء'), kind: 'time' },
      ],
    };
    const data = rows.map(r => ({
      d: r.d, hijri: r.d + ' ' + monthName,
      greg: String(r.g.getDate()).padStart(2, '0') + '/' + String(r.g.getMonth() + 1).padStart(2, '0'),
      today: !!r.isToday, qadr: !!r.qadr, last10: !!r.last10,
      times: [r.imsak, r.t.Fajr, r.t.Sunrise, r.t.Dhuhr, r.t.Asr, r.t.Maghrib, r.t.Isha],
    }));
    return await ImsakPoster.render(data, meta);
  },

  async downloadImage(shareMode) {
    const btn = document.getElementById('imsk-act-img');
    if (btn) btn.disabled = true;
    try {
      const cv = await this._posterCanvas();
      if (!cv) { this._toast(this._L('تعذّر إنشاء الصورة — أعد فتح الصفحة', 'No se pudo crear la imagen', 'Could not create the image')); return; }
      const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
      if (!blob) { this._toast(this._L('تعذّر تحويل الصورة', 'No se pudo convertir la imagen', 'Could not convert the image')); return; }
      const fname = 'imsakiyah-ramadan-' + (this._hy || '') + '.png';
      await this._saveBlob(blob, fname, !!shareMode);
      this._toast((typeof t === 'function' && t('imsakSaved')) ? t('imsakSaved') : this._L('تم حفظ الصورة', 'Imagen guardada', 'Image saved'));
    } catch (e) {
      console.warn('Imsakiyah poster error:', e);
      this._toast(this._L('تعذّر إنشاء الصورة على هذا الجهاز', 'No se pudo crear la imagen en este dispositivo', 'Could not create the image on this device'));
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  /** v1.0.154: حفظ/مشاركة أي Blob — الجسر الأصلي أولًا لأنه الوحيد الذي يعمل داخل APK */
  async _saveBlob(blob, name, preferShare) {
    const mime = (blob && blob.type) || 'application/octet-stream';
    const native = (typeof window !== 'undefined' && window.__qubaSendBlobToNative && typeof Android !== 'undefined');
    if (preferShare && !native && typeof navigator !== 'undefined' && navigator.canShare) {
      const f = new File([blob], name, { type: mime });
      if (navigator.canShare({ files: [f] })) {
        try { await navigator.share({ files: [f], title: 'Quba' }); return true; }
        catch (e) { if (e && e.name === 'AbortError') return true; }
      }
    }
    if (native) {
      await window.__qubaSendBlobToNative(blob, name, mime, preferShare ? 'share' : 'save');
      return true;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => { try { URL.revokeObjectURL(a.href); } catch (e) {} }, 5000);
    return true;
  },

  /* ---------- v1.0.154: PDF بمقاس A4 جاهز للطباعة ---------- */
  async exportPDF() {
    const btn = document.getElementById('imsk-act-pdf');
    if (btn) btn.disabled = true;
    try {
      const JsPDF = (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      if (!JsPDF) { this._toast(this._L('مكتبة PDF غير متاحة', 'PDF no disponible', 'PDF library missing')); return; }
      const cv = await this._posterCanvas({ layout: 'a4' });
      if (!cv) { this._toast(this._L('تعذّر إنشاء صفحة PDF', 'No se pudo crear el PDF', 'Could not build the PDF')); return; }
      const img = cv.toDataURL('image/jpeg', 0.92);
      const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      doc.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      doc.setProperties({ title: 'Imsakiyah Ramadan ' + (this._hy || ''), creator: 'Quba' });
      const blob = doc.output('blob');
      const name = 'imsakiyah-ramadan-' + (this._hy || '') + '-A4.pdf';
      await this._saveBlob(blob, name, false);
      this._toast(this._L('تم حفظ ملف PDF (A4)', 'PDF guardado (A4)', 'PDF saved (A4)'));
    } catch (e) {
      console.warn('Imsakiyah PDF error:', e);
      this._toast(this._L('تعذّر إنشاء PDF على هذا الجهاز', 'No se pudo crear el PDF en este dispositivo', 'Could not create the PDF on this device'));
    } finally {
      const b = document.getElementById('imsk-act-pdf');
      if (b) b.disabled = false;
    }
  },

  /* ---------- v1.0.154: ستوري ٩:١٦ ليوم واحد ---------- */
  async storyImage() {
    const btn = document.getElementById('imsk-act-story');
    if (btn) btn.disabled = true;
    try {
      const row = this._selRow();
      if (!row || typeof ImsakPoster === 'undefined' || !ImsakPoster.renderDay) {
        this._toast(this._L('اختر يومًا من الجدول أولًا', 'Elige un día de la tabla', 'Pick a day from the table'));
        return;
      }
      try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
      const loc0 = (typeof currentLocale !== 'undefined') ? currentLocale : 'ar';
      const cal = this._calLoc() || {};
      const t0 = (k, fb) => (typeof t === 'function' && t(k)) ? t(k) : fb;
      const meta = {
        city: [cal.city, cal.country].filter(Boolean).join(' · '),
        dayLine: this._L('يوم ' + row.d + ' من رمضان', 'Día ' + row.d + ' de Ramadán', 'Day ' + row.d + ' of Ramadan'),
        dateLine: (function () {
          let g = '';
          try { g = row.g.toLocaleDateString(loc0, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { g = ''; }
          return g + '  ·  ' + row.d + ' ' + this._hijriMonthName(9, loc0);
        }).call(this),
        lImsak: this._L('الإمساك', 'Imsak', 'Imsak'),
        lImsakHint: this._L('قبل الفجر بعشر دقائق', '10 min antes del Fajr', '10 min before Fajr'),
        lIftar: this._L('الإفطار', 'Iftar', 'Iftar'),
        lIftarHint: this._L('أذان المغرب', 'Magreb', 'Maghrib adhan'),
        lFajr: t0('imsakColFajr', 'الفجر'), lSunrise: t0('imsakColSunrise', 'الشروق'),
        lDhuhr: t0('imsakColDhuhr', 'الظهر'), lAsr: t0('imsakColAsr', 'العصر'),
        lIsha: t0('imsakColIsha', 'العشاء'),
        lFast: this._L('طول الصيام', 'Duración del ayuno', 'Fasting length'),
        fastLen: this._fmtMin(row.fast),
        method: this._methodName() + ' · ' + this._utcLabel(),
        note: t0('imsakNote', 'المواقيت محسوبة محليًا على جهازك.'),
        bg: 'assets/ramadan/imsakiyah-bg.jpg',
      };
      const cv = await ImsakPoster.renderDay(row, meta);
      const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
      if (!blob) { this._toast(this._L('تعذّر تحويل الصورة', 'No se pudo convertir la imagen', 'Could not convert the image')); return; }
      await this._saveBlob(blob, 'imsak-story-day-' + row.d + '.png', true);
      this._toast(this._L('جاهزة — يوم ' + row.d, 'Lista — día ' + row.d, 'Ready — day ' + row.d));
    } catch (e) {
      console.warn('Imsakiyah story error:', e);
      this._toast(this._L('تعذّر إنشاء صورة الستوري', 'No se pudo crear la story', 'Could not create the story image'));
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  /* ---------- v1.0.154: اختيار يوم للستوري ---------- */
  selectDay(d) {
    this._selDay = Number(d) || null;
    const box = document.getElementById('main-content');
    if (!box) return;
    const all = box.querySelectorAll('.imsk-table tbody tr');
    for (let i = 0; i < all.length; i++) all[i].classList.remove('is-sel');
    const row = box.querySelector('.imsk-table tbody tr[data-d="' + this._selDay + '"]');
    if (row) row.classList.add('is-sel');
    const label = box.querySelector('.imsk-story-day');
    if (label) label.textContent = String(this._selDay);
  },

  /* ---------- v1.0.154: مبدّل طريقة الحساب ---------- */
  _methodShort(id) {
    const M = {
      4: { ar: 'أم القرى', es: 'Umm al-Qura', en: 'Umm al-Qura' },
      3: { ar: 'رابطة العالم', es: 'Liga Islámica', en: 'Muslim World League' },
      19: { ar: 'الأوقاف الأردنية', es: 'Awqaf Jordania', en: 'Jordan Awqaf' },
      2: { ar: 'ISNA', es: 'ISNA', en: 'ISNA' },
      5: { ar: 'مصر', es: 'Egipto', en: 'Egypt' },
      1: { ar: 'كراتشي', es: 'Karachi', en: 'Karachi' },
    };
    const l = (typeof currentLocale !== 'undefined') ? currentLocale : 'ar';
    const rec = M[Number(id)] || { ar: 'طريقة ' + id, es: 'Método ' + id, en: 'Method ' + id };
    return rec[l] || rec.ar;
  },

  _methodOptions() {
    const cur = this._method || 0;
    let out = `<button class="imsk-mopt ${cur ? '' : 'is-on'}" onclick="ImsakiyahPage.setMethod(0)">${this._L('تلقائي', 'Auto', 'Auto')}</button>`;
    [4, 3, 19, 2, 5].forEach(id => {
      out += `<button class="imsk-mopt ${cur === id ? 'is-on' : ''}" onclick="ImsakiyahPage.setMethod(${id})">${escapeHtml(this._methodShort(id))}</button>`;
    });
    return out;
  },

  /** فرق الوقت بين الطريقة المختارة وطريقة التطبيق — لليوم نفسه */
  _methodDiff() {
    const row = (this._rows || []).find(r => r.isToday) || (this._rows || [])[0];
    const cal = this._calLoc();
    if (!row || !cal) return '';
    let base = 4;
    try { base = Number(AppState.settings.calculationMethod) || 4; } catch (e) { base = 4; }
    const other = (this._method && this._method !== base) ? this._method : (base === 3 ? 4 : 3);
    const a = this._timesFor(Number(cal.latitude), Number(cal.longitude), row.g, base) || {};
    const b = this._timesFor(Number(cal.latitude), Number(cal.longitude), row.g, other) || {};
    const mins = (s) => { const [h, m] = String(s || '').split(':').map(Number); return (isNaN(h) || isNaN(m)) ? null : h * 60 + m; };
    const parts = [];
    [['Fajr', this._L('الفجر', 'Fajr', 'Fajr')], ['Maghrib', this._L('الإفطار', 'Iftar', 'Iftar')]].forEach(([k, lbl]) => {
      const A = mins(a[k]), B = mins(b[k]);
      if (A === null || B === null) return;
      const dv = B - A;
      if (!dv) { parts.push(lbl + ' ±0'); return; }
      parts.push(lbl + ' <em>' + (dv > 0 ? '+' : '−') + Math.abs(dv) + ' ' + this._L('د', 'min', 'min') + '</em>');
    });
    if (!parts.length) return '';
    return this._L('الفرق اليوم', 'Diferencia hoy', 'Difference today') + ' · '
      + escapeHtml(this._methodShort(base)) + ' ↔ ' + escapeHtml(this._methodShort(other)) + ': <b>' + parts.join('</b> · <b>') + '</b>';
  },

  setMethod(id) {
    const m = Number(id) || 0;
    this._method = m;
    this._saveMethod(m);
    this._refreshCalendar();
    this._tick();
  },

  /* ---------- v1.0.154: العدّاد التنازلي ---------- */
  _startTimer() {
    this._stopTimer();
    this._tick();
    this._timer = setInterval(() => this._tick(), 1000);
  },
  _stopTimer() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  },

  /** الوقت الحالي كما يُقرأ في مدينة الرزنامة (استخدم getUTC* على الناتج) */
  _cityNowMs() { return Date.now() + this._calOffsetMs(new Date()); },

  _rowForCityDate(cityMs) {
    const d = new Date(cityMs);
    const y = d.getUTCFullYear(), mo = d.getUTCMonth(), da = d.getUTCDate();
    const rows = this._rows || [];
    for (let i = 0; i < rows.length; i++) {
      const g = rows[i].g;
      if (g.getFullYear() === y && g.getMonth() === mo && g.getDate() === da) return rows[i];
    }
    return null;
  },

  /** لحظة الحدث على ساعة الجهاز من وقت مدينة الرزنامة */
  _devMsFor(row, hhmm) {
    if (!row || !hhmm || String(hhmm).indexOf(':') === -1) return null;
    const [h, m] = String(hhmm).split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    const wall = Date.UTC(row.g.getFullYear(), row.g.getMonth(), row.g.getDate(), h, m, 0, 0);
    let off = this._calOffsetMs(new Date(wall));
    if (!isFinite(off)) off = 0;
    let dev = wall - off;
    try {
      const off2 = this._calOffsetMs(new Date(dev));
      if (isFinite(off2)) dev = wall - off2;
    } catch (e) {}
    return dev;
  },

  _selRow() {
    const rows = this._rows || [];
    if (!rows.length) return null;
    if (this._selDay) {
      const r = rows.find(x => x.d === Number(this._selDay));
      if (r) return r;
    }
    return rows.find(x => x.isToday) || rows[0];
  },

  _clockText(ms) {
    if (!isFinite(ms) || ms < 0) ms = 0;
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    const p = (n) => (n < 10 ? '0' + n : '' + n);
    const base = p(h) + ':' + p(m) + ':' + p(ss);
    return d > 0 ? (d + ' ' + this._L('يوم', 'días', 'days') + ' ' + base) : base;
  },

  _tick() {
    const rows = this._rows || [];
    if (!rows.length) return;
    const now = Date.now();
    const today = this._rowForCityDate(this._cityNowMs());
    const L = (a, b, c) => this._L(a, b, c);
    const imsakName = L('الإمساك', 'Imsak', 'Imsak');
    const iftarName = L('الإفطار', 'Iftar', 'Iftar');

    let label = '', evName = '', evTime = '', target = null, pct = 0, note = '', mode = 'imsak';

    if (today) {
      const dImsak = this._devMsFor(today, today.imsak || today.t.Fajr);
      const dIftar = this._devMsFor(today, today.t.Maghrib);
      const hasFast = !!(dImsak && dIftar);
      if (hasFast && now >= dImsak && now < dIftar) {
        mode = 'iftar';
        target = dIftar;
        evName = iftarName;
        evTime = today.t.Maghrib;
        pct = Math.max(0, Math.min(1, (now - dImsak) / Math.max(1, dIftar - dImsak)));
        note = L('الإمساك ', 'Imsak ', 'Imsak ') + (today.imsak || '—')
             + ' · ' + L('مدة الصيام ', 'Ayuno ', 'Fast ') + this._fmtMin(today.fast);
        label = L('باقي للإفطار', 'Falta para el iftar', 'Left to iftar');
      } else if (hasFast && now < dImsak) {
        target = dImsak;
        evName = imsakName;
        evTime = today.imsak;
        note = L('الإفطار ', 'Iftar ', 'Iftar ') + today.t.Maghrib
             + ' · ' + L('مدة الصيام ', 'Ayuno ', 'Fast ') + this._fmtMin(today.fast);
        label = L('باقي للإمساك', 'Falta para el imsak', 'Left to imsak');
      } else {
        const next = rows[rows.indexOf(today) + 1] || null;
        evName = imsakName;
        if (next) {
          target = this._devMsFor(next, next.imsak || next.t.Fajr);
          evTime = next.imsak;
          note = L('يوم ', 'Día ', 'Day ') + next.d + ' · ' + L('الإفطار ', 'Iftar ', 'Iftar ') + next.t.Maghrib;
        } else {
          note = L('آخر أيام الشهر', 'Último día del mes', 'Last day of the month');
        }
        label = L('باقي للإمساك', 'Falta para el imsak', 'Left to imsak');
      }
    } else {
      const first = rows[0];
      const firstAt = this._devMsFor(first, first.imsak || first.t.Fajr);
      // v1.0.159: رزنامة سنة مضت كانت تعرض عدّادًا إلى تاريخ قديم (00:00:00) و«بداية رمضان بعد»
      if (firstAt && firstAt < now - 86400000) {
        label = L('شهر مضى', 'Mes pasado', 'Past month');
        evName = '—'; evTime = '—';
        note = L('هذه رزنامة رمضان ' + this._hy + ' — اختر سنة أخرى من الأعلى', 'Esta lista es de un mes pasado', 'This list is from a past month');
      } else {
        target = firstAt;
        evName = imsakName;
        evTime = first.imsak;
        let dstr = '';
        try { dstr = first.g.toLocaleDateString((typeof currentLocale !== 'undefined' ? currentLocale : 'ar'), { day: 'numeric', month: 'long' }); } catch (e) {}
        note = L('أول يوم: ', 'Primer día: ', 'First day: ') + dstr
             + ' · ' + L('الإفطار ', 'Iftar ', 'Iftar ') + first.t.Maghrib;
        label = L('بداية رمضان بعد', 'Ramadán empieza en', 'Ramadan starts in');
      }
    }

    const set = (k, v) => {
      const els = document.querySelectorAll('[data-live="' + k + '"]');
      for (let i = 0; i < els.length; i++) els[i].textContent = v;
    };
    set('label', label);
    set('clock', target ? this._clockText(target - now) : '--:--:--');
    set('event', evName || '—');
    set('eventTime', evTime || '—');
    set('note', note || '');
    const bars = document.querySelectorAll('[data-live-bar]');
    for (let i = 0; i < bars.length; i++) bars[i].style.width = (pct * 100).toFixed(1) + '%';
    const box = document.getElementById('imsk-live');
    if (box) box.classList.toggle('is-iftar', mode === 'iftar');
  },

  /* ---------- v1.0.154: نمط لوحة المسجد (شاشة كاملة) ---------- */
  openTvMode() {
    const rows = this._rows || [];
    if (!rows.length) return;
    this.closeTvMode();
    const cal = this._calLoc() || {};
    const row = this._rowForCityDate(this._cityNowMs()) || this._selRow() || rows[0];
    const loc0 = (typeof currentLocale !== 'undefined') ? currentLocale : 'ar';
    let dstr = '';
    try { dstr = row.g.toLocaleDateString(loc0, { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) {}
    const tiles = [
      [this._L('الإمساك', 'Imsak', 'Imsak'), row.imsak, 1],
      [this._L('الفجر', 'Fajr', 'Fajr'), row.t.Fajr, 0],
      [this._L('الشروق', 'Amanecer', 'Sunrise'), row.t.Sunrise, 0],
      [this._L('الظهر', 'Dhuhr', 'Dhuhr'), row.t.Dhuhr, 0],
      [this._L('العصر', 'Asr', 'Asr'), row.t.Asr, 0],
      [this._L('الإفطار', 'Iftar', 'Iftar'), row.t.Maghrib, 1],
      [this._L('العشاء', 'Isha', 'Isha'), row.t.Isha, 0],
    ].map(t => `<div class="imsk-tv-time ${t[2] ? 'is-key' : ''}"><span>${escapeHtml(t[0])}</span><b>${t[1] || '—'}</b></div>`).join('');

    const el = document.createElement('div');
    el.className = 'imsk-tv';
    el.id = 'imsk-tv';
    el.innerHTML = `
      <div class="imsk-tv-top">
        <span class="imsk-tv-city"><i class="fas fa-location-dot"></i> ${escapeHtml([cal.city, cal.country].filter(Boolean).join(' · '))}</span>
        <span class="imsk-tv-date">${escapeHtml(dstr)} · ${row.d} ${this._L('رمضان', 'Ramadán', 'Ramadan')}</span>
        <button class="imsk-tv-close" onclick="ImsakiyahPage.closeTvMode()">${this._L('إغلاق', 'Cerrar', 'Close')}</button>
      </div>
      <div class="imsk-tv-mid">
        <div class="imsk-tv-label" data-live="label">—</div>
        <div class="imsk-tv-clock" data-live="clock">--:--:--</div>
        <div class="imsk-tv-sub"><span data-live="event">—</span> · <b data-live="eventTime">—</b></div>
      </div>
      <div class="imsk-tv-times">${tiles}</div>
      <div class="imsk-tv-foot">
        <b>Quba · قُبَّة</b>
        <span>${escapeHtml(this._methodName() || '')}</span>
      </div>`;
    document.body.appendChild(el);
    this._tv = el;
    try {
      if (document.documentElement.requestFullscreen) {
        const p = document.documentElement.requestFullscreen();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) {}
    this._onKey = (ev) => { if (ev.key === 'Escape') this.closeTvMode(); };
    document.addEventListener('keydown', this._onKey);
    this._tick();
  },

  closeTvMode() {
    const el = this._tv || document.getElementById('imsk-tv');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    this._tv = null;
    if (this._onKey) {
      try { document.removeEventListener('keydown', this._onKey); } catch (e) {}
      this._onKey = null;
    }
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        const p = document.exitFullscreen();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) {}
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
          id: city.id || '',
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
    this._tick();
    // v1.0.159: تغيير المدينة يغيّر المواقيت — كان التذكير يبقى على توقيت المدينة القديمة
    try { this.scheduleReminders(true); } catch (e) {}
    // إبقاء المستخدم عند الجدول نفسه بعد إعادة الرسم
    try {
      const again = box.querySelector('.imsk-tablewrap');
      if (again && top) window.scrollBy(0, again.getBoundingClientRect().top - top);
    } catch (e) {}
  },

  setYear(hy) {
    if (!this._years || !this._years.some(v => v.hy === hy)) return;
    this._hy = hy;
    // v1.0.159: كان اليوم المختار للستوري يبقى من السنة السابقة فيُصدَّر يوم خاطئ
    this._selDay = null;
    this._rows = this._buildRows(hy);
    const c = document.getElementById('main-content');
    if (c && this._loc) { c.innerHTML = this._html(this._loc); this._tick(); }
    this.scheduleReminders(true);
  },

  cleanup() {
    this._stopTimer();
    this.closeTvMode();
    this._rows = null;
    this._selDay = null;
  },
};
