// 🌐 Cliente API — Aladhan + Al-Quran Cloud (v3: con transliteration y navegación)

const API = {
  // ============ PRAYER TIMES (Aladhan) ============
  async getPrayerTimes(lat, lng, date = new Date(), method = 3) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    // v36: método EFECTIVO por ubicación (ver _effectiveMethod): Jordania →
    // 19 (Awqaf), Turquía → 13 (Diyanet), EE.UU./Canadá → 2 (ISNA),
    // Francia → 12 (UOIF)… igualando el convenio por defecto de Muslim Pro.
    // Solo aplica cuando el usuario no ha elegido otro método manualmente.
    method = this._effectiveMethod(lat, lng, method);

    const cacheKey = `prayer_${lat.toFixed(2)}_${lng.toFixed(2)}_${dd}-${mm}-${yyyy}_${method}`;
    const cached = Storage.get(cacheKey);
    // v36: la caché Muslim Pro es exacta → se sirve directo. La caché de
    // Aladhan/cálculo local (±1-3 min de desfase en Shuruk/Maghrib/Isha) YA
    // NO cortocircuita: se reintenta Muslim Pro en cada carga con red para
    // autocurar datos antiguos, y solo se usa como último respaldo.
    if (cached && cached._source === 'muslimpro') return this._applyTimeShift(cached);

    // v21: sin red → respaldo: caché local (aunque no sea Muslim Pro) y,
    // en su defecto, el cálculo astronómico local.
    if (!navigator.onLine) {
      if (cached) return this._applyTimeShift(cached);
      return this._offlinePrayerTimes(lat, lng, date, method);
    }

    try {
      // v27: fuente PRIMARIA = Muslim Pro (espejo exacto, minuto a minuto).
      // MuslimProSync extrae los propios datos pre-calculados de Muslim Pro;
      // si no está disponible (sin proxy/CORS), se continúa con Aladhan.
      if (typeof MuslimProSync !== 'undefined') {
        try {
          const mp = await MuslimProSync.getTimings(lat, lng, date, method);
          if (mp && mp.timings && mp.timings.Fajr) {
            Storage.set(cacheKey, mp, CONFIG.CACHE_TTL * 14); // 14 days cache
            return this._applyTimeShift(mp);
          }
        } catch (e) {
          console.warn('MuslimPro sync no disponible, usando Aladhan:', e.message);
        }
      }

      // v36: Muslim Pro inalcanzable pero ya hay un dato Muslim Pro cacheado
      // de este día (p. ej. la página semanal se cargó antes): úsalo aunque
      // sea viejo antes de degradar a Aladhan — sigue siendo EXACTO.
      if (cached && cached._source === 'muslimpro') return this._applyTimeShift(cached);

      // v18: If online, fetch + also prefetch next 14 days in background
      // v28: la regla jordana (Isha = Maghrib+90) se aplica SIEMPRE del lado
      // cliente en _postProcessPrayerData (Aladhan no la calcula fielmente).
      const url = `${CONFIG.API.ALADHAN}/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}`;
      const res = await this._fetchWithTimeout(url, 8000);
      if (!res.ok) throw new Error('Prayer API error');
      const json = await res.json();
      if (json.code !== 200) throw new Error('Prayer API error');

      // v28: corrección regional (Jordania) + ajuste manual por oración
      json.data = this._postProcessPrayerData(json.data, lat, lng, method, date);
      Storage.set(cacheKey, json.data, CONFIG.CACHE_TTL * 14); // 14 days cache

      // Background prefetch: next 14 days so app works offline for 2 weeks
      this._prefetchNext14Days(lat, lng, method).catch(() => {});

      return this._applyTimeShift(json.data);
    } catch (e) {
      // Red inestable/caída a mitad: nunca dejar al usuario sin nada
      console.warn('Prayer API offline, calculando localmente:', e.message);
      return this._offlinePrayerTimes(lat, lng, date, method);
    }
  },

  // v26: aplica el ajuste manual verano/invierno (±1h) sobre los horarios
  // devueltos (por API o por caché). No toca el objeto original.
  _applyTimeShift(data) {
    try {
      if (!data || !data.timings) return data;
      let t = data.timings;
      // v38: los datos Muslim Pro (y su caché) se guardan CRUDOS — aplicar
      // aquí la corrección regional (Jordania/Palestina) y el ajuste manual
      // por oración, en TODOS los caminos (caché, red, offline).
      if (typeof PrayerCalc !== 'undefined') {
        t = PrayerCalc.applyPrayerOffsets(t);
      }
      const mode = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.timeShift) || 'auto';
      if (mode === 'auto' || typeof PrayerCalc === 'undefined') return t === data.timings ? data : Object.assign({}, data, { timings: t });
      const delta = mode === 'summer' ? 1 : (mode === 'winter' ? -1 : 0);
      if (!delta) return t === data.timings ? data : Object.assign({}, data, { timings: t });
      const shifted = PrayerCalc.shiftTimings(t, delta);
      shifted._timeShifted = mode;
      return Object.assign({}, data, { timings: shifted, _timeShifted: mode });
    } catch (e) { return data; }
  },

  // v28: país detectado para correcciones regionales (AppState → caché → Nominatim)
  _countryFor(lat, lng) {
    try {
      const loc = (typeof AppState !== 'undefined' && AppState.location) || null;
      if (loc && Math.abs(loc.latitude - lat) < 0.5 && Math.abs(loc.longitude - lng) < 0.5) {
        if (loc.countryEn) return loc.countryEn;
        if (loc.country) return loc.country;
      }
      const last = (typeof Storage !== 'undefined' && Storage.get('last_location')) || null;
      if (last && Math.abs(last.latitude - lat) < 0.5 && Math.abs(last.longitude - lng) < 0.5) {
        return last.countryEn || last.country || '';
      }
    } catch (_) { /* ignorar */ }
    return '';
  },

  // v39: elevación (metros) detectada para corregir Shuruq/Maghrib/Isha —
  // mismo patrón que _countryFor (AppState → última ubicación cacheada).
  // Devuelve 0 si aún no se resolvió (LocationService la obtiene de forma
  // asíncrona vía Open-Meteo): en ese caso simplemente no se corrige nada,
  // igual que el comportamiento anterior a esta versión.
  _elevationFor(lat, lng) {
    try {
      const loc = (typeof AppState !== 'undefined' && AppState.location) || null;
      if (loc && Math.abs(loc.latitude - lat) < 0.5 && Math.abs(loc.longitude - lng) < 0.5 &&
          typeof loc.elevation === 'number') {
        return loc.elevation;
      }
      const last = (typeof Storage !== 'undefined' && Storage.get('last_location')) || null;
      if (last && Math.abs(last.latitude - lat) < 0.5 && Math.abs(last.longitude - lng) < 0.5 &&
          typeof last.elevation === 'number') {
        return last.elevation;
      }
    } catch (_) { /* ignorar */ }
    return 0;
  },

  // v28: corrección regional (Jordania: Isha = Maghrib+90) + v39: corrección
  // por ELEVACIÓN (Aladhan no la aplica — su API no acepta ese parámetro,
  // ver PrayerCalc.applyElevationAdjustment) + ajuste manual por oración
  // (±60 min) sobre una respuesta con forma Aladhan.
  _postProcessPrayerData(data, lat, lng, method, date = new Date()) {
    try {
      if (!data || !data.timings || typeof PrayerCalc === 'undefined') return data;
      const country = this._countryFor(lat, lng);
      const elevation = this._elevationFor(lat, lng);
      let t = PrayerCalc.applyElevationAdjustment(data.timings, lat, lng, date, elevation, method);
      t = PrayerCalc.applyRegionalCorrections(t, country, lat, lng);
      t = PrayerCalc.applyPrayerOffsets(t);
      if (t === data.timings) return data;
      return Object.assign({}, data, { timings: t });
    } catch (e) { return data; }
  },

  // v21: respaldo 100% local (sin red) usando PrayerCalc — precisión ±1-2 min
  // v26: PrayerCalc.getTimings ya aplica internamente el ajuste manual
  //      verano/invierno (AppState.settings.timeShift).
  _offlinePrayerTimes(lat, lng, date, method) {
    if (typeof PrayerCalc === 'undefined') throw new Error('Prayer API error');
    // v28: el país permite a PrayerCalc aplicar la regla jordana (Isha=Maghrib+90)
    const country = this._countryFor(lat, lng);
    // v39: la elevación corrige Shuruq/Maghrib/Isha (ver applyElevationAdjustment)
    const elevation = this._elevationFor(lat, lng);
    const timings = PrayerCalc.getTimings(lat, lng, date, method, country, elevation);
    // _estimated se duplica DENTRO de timings porque varias pantallas hacen
    // `AppState.timings = resultado.timings` (pierden el nivel exterior).
    timings._estimated = true;
    return {
      timings,
      date: {
        readable: date.toDateString(),
        gregorian: {
          date: `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getFullYear()}`,
          day: String(date.getDate()),
        },
      },
      meta: { method: (typeof CONFIG.methodName === 'function' ? CONFIG.methodName(method) : CONFIG.CALCULATION_METHODS[method]) || '' },
      _estimated: true, // la UI puede mostrar un aviso de "horario aproximado"
    };
  },

  // Prefetch the next 14 days of prayer times so the app works offline
  async _prefetchNext14Days(lat, lng, method) {
    if (!navigator.onLine) return;
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const key = `prayer_${lat.toFixed(2)}_${lng.toFixed(2)}_${dd}-${mm}-${yyyy}_${method}`;
      if (Storage.get(key)) continue; // already cached
      try {
        const url = `${CONFIG.API.ALADHAN}/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.code === 200) {
            Storage.set(key, json.data, CONFIG.CACHE_TTL * 30); // 30 days cache
          }
        }
        // Small delay to avoid rate-limit
        await new Promise(r => setTimeout(r, 150));
      } catch (_) { /* ignore */ }
    }
  },

  // ============ HIJRI CALENDAR ============
  async gregorianToHijri(date = new Date()) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    const cacheKey = `hijri_${dd}-${mm}-${yyyy}`;
    const cached = Storage.get(cacheKey);
    if (cached) return cached;

    // v21: sin red → usar el cálculo aritmético local (ya usado en el calendario)
    if (!navigator.onLine) return this._gregorianToHijriRich(date);

    try {
      const url = `${CONFIG.API.ALADHAN}/gToH/${dd}-${mm}-${yyyy}`;
      const res = await this._fetchWithTimeout(url, 8000);
      if (!res.ok) throw new Error('Hijri API error');
      const json = await res.json();
      const hijri = json.data?.hijri;
      if (!hijri) throw new Error('Hijri API empty');
      Storage.set(cacheKey, hijri, CONFIG.CACHE_TTL * 7);
      return hijri;
    } catch (e) {
      console.warn('Hijri API offline, calculando localmente:', e.message);
      return this._gregorianToHijriRich(date);
    }
  },

  // v21: envuelve _gregorianToHijri (día/mes/año simples) en la misma forma
  // "rica" que devuelve Aladhan ({day, month:{number,en,ar}, year, weekday}),
  // para que sea intercambiable con cualquier código que ya consuma el hijri.
  _gregorianToHijriRich(gregDate) {
    const h = this._gregorianToHijri(gregDate);
    const monthName = this._hijriMonthName(h.month);
    const weekdayName = this._weekdayName(gregDate.getDay());
    return {
      date: `${String(h.day).padStart(2,'0')}-${String(h.month).padStart(2,'0')}-${h.year}`,
      day: String(h.day),
      month: { number: h.month, en: monthName.en, ar: monthName.ar },
      year: String(h.year),
      weekday: { en: weekdayName.en, ar: weekdayName.ar },
      _estimated: true,
    };
  },

  // Nombres de mes hijri (compartido por el calendario y el fallback de un solo día)
  _hijriMonthName(monthNum) {
    const en = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Akhirah','Rajab','Sha\'ban','Ramadan','Shawwal','Dhul-Qa\'dah','Dhul-Hijjah'][monthNum-1];
    const ar = ['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'][monthNum-1];
    return { en, ar };
  },

  // Nombre de día de la semana (0=domingo), compartido por varios fallbacks offline
  _weekdayName(dayOfWeek) {
    const en = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek];
    const ar = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][dayOfWeek];
    return { en, ar };
  },

  // v19: fetch with hard timeout — a hung request must not leave the UI loading forever
  _fetchWithTimeout(url, ms = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
  },

  async getHijriCalendarMonth(month, year) {
    const cacheKey = `hijri_cal_${month}_${year}`;
    const cached = Storage.get(cacheKey);
    if (cached) return cached;

    // v18: offline-first — if no network, compute Hijri calendar locally
    if (!navigator.onLine) {
      return this._computeHijriCalendarOffline(month, year);
    }

    const url = `${CONFIG.API.ALADHAN}/gToHCalendar/${month}/${year}`;
    try {
      const res = await this._fetchWithTimeout(url, 8000);
      if (!res.ok) throw new Error('Hijri calendar error');
      const json = await res.json();
      const data = json.data || [];
      if (!Array.isArray(data) || data.length === 0) throw new Error('Hijri calendar empty');
      Storage.set(cacheKey, data, CONFIG.CACHE_TTL * 14); // 14 days cache
      return data;
    } catch (e) {
      // Network failed/timeout — fallback to offline computation (always resolves)
      console.warn('Hijri API offline, computing locally:', e.message);
      return this._computeHijriCalendarOffline(month, year);
    }
  },

  // Compute Hijri calendar offline using arithmetic Hijri calendar (Umm al-Qura approximation)
  _computeHijriCalendarOffline(month, year) {
    const daysInGregMonth = new Date(year, month, 0).getDate();
    const result = [];
    for (let d = 1; d <= daysInGregMonth; d++) {
      const greg = new Date(year, month - 1, d);
      const hijri = this._gregorianToHijri(greg);
      const dayOfWeek = greg.getDay(); // 0=Sun
      const weekdayNames = {
        en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek],
        ar: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][dayOfWeek],
      };
      const monthNames = {
        en: ['January','February','March','April','May','June','July','August','September','October','November','December'][month-1],
        ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][month-1],
      };
      const hijriMonths = {
        en: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Akhirah','Rajab','Sha\'ban','Ramadan','Shawwal','Dhul-Qa\'dah','Dhul-Hijjah'][hijri.month-1],
        ar: ['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'][hijri.month-1],
      };
      const dd = String(d).padStart(2,'0');
      const mm = String(month).padStart(2,'0');
      const hd = String(hijri.day).padStart(2,'0');
      const hm = String(hijri.month).padStart(2,'0');
      result.push({
        gregorian: {
          date: `${dd}-${mm}-${year}`,
          day: String(d),
          month: { number: month, en: monthNames.en, ar: monthNames.ar },
          year: String(year),
          weekday: { en: weekdayNames.en, ar: weekdayNames.ar },
        },
        hijri: {
          date: `${hd}-${hm}-${hijri.year}`,
          day: String(hijri.day),
          month: { number: hijri.month, en: hijriMonths.en, ar: hijriMonths.ar },
          year: String(hijri.year),
          weekday: { en: weekdayNames.en, ar: weekdayNames.ar },
        },
      });
    }
    return result;
  },

  // Convert Gregorian Date → Hijri using arithmetic approximation (Umm al-Qura)
  _gregorianToHijri(gregDate) {
    // Tabular Islamic calendar (civil, Friday epoch: 1948440 Julian day)
    // JD = Julian Day Number at noon
    const y = gregDate.getFullYear();
    const m = gregDate.getMonth() + 1;
    const d = gregDate.getDate();
    // Julian Day calculation (Gregorian)
    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    const jdn = d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
    // Islamic epoch: July 16, 622 (Julian) = JD 1948440
    const islamicEpoch = 1948440;
    const daysSinceEpoch = jdn - islamicEpoch;
    // Arithmetic Islamic calendar: 30 years cycle = 10631 days; 11 leap years in 30
    const year30 = Math.floor(daysSinceEpoch / 10631);
    let remaining = daysSinceEpoch - year30 * 10631;
    let year = year30 * 30 + 1;
    while (true) {
      const daysInYear = this._isHijriLeapYear(year) ? 355 : 354;
      if (remaining < daysInYear) break;
      remaining -= daysInYear;
      year++;
    }
    // Month lengths (civil): odd months 30, even months 29, Dhul-Hijjah 30 in leap year
    const monthLengths = [30,29,30,29,30,29,30,29,30,29,30, this._isHijriLeapYear(year) ? 30 : 29];
    let month = 1;
    while (remaining >= monthLengths[month-1]) {
      remaining -= monthLengths[month-1];
      month++;
    }
    const day = remaining + 1;
    return { day, month, year };
  },

  _isHijriLeapYear(y) {
    // 11 leap years in a 30-year cycle: 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29
    const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
    return leapYears.includes(y % 30);
  },

  // Monthly prayer times table for a given lat/lon, method, month, year
  async getPrayerTimesMonth(lat, lon, month, year, method = 3) {
    // v36: MISMA fuente que el horario principal (Muslim Pro exacto). El
    // cálculo offline antes usaba SIEMPRE el método global del usuario
    // (p. ej. MWL 18/17) incluso en Jordania → la tabla mensual y la franja
    // secundaria no coincidían con el horario principal (Isha = Maghrib+90
    // del Ministerio de Awqaf). Ahora el método efectivo se resuelve por
    // ciudad: Jordania → 19, Turquía → 13, EE.UU./Canadá → 2, Francia → 12…
    // (los mismos convenios que publica Muslim Pro por país), salvo elección
    // manual explícita del usuario.
    method = this._effectiveMethod(lat, lon, method);

    const cacheKey = `prayer_month_${lat.toFixed(2)}_${lon.toFixed(2)}_${month}_${year}_${method}`;
    const cached = Storage.get(cacheKey);
    if (cached) return this._applyTimeShiftMonth(cached);

    if (!navigator.onLine) return this._computePrayerMonthOffline(lat, lon, month, year, method);

    // v36: días cubiertos por la semana Muslim Pro (ya cacheados por la
    // carga del horario principal) → exactos, sin petición extra. El resto
    // del mes: Aladhan con el método efectivo de la ciudad.
    try {
      const aladhan = await this._fetchAladhanMonth(lat, lon, month, year, method);
      if (aladhan && aladhan.length) {
        const merged = aladhan.map(day => {
          try {
            const gd = day.date && day.date.gregorian && day.date.gregorian.date; // DD-MM-YYYY
            if (!gd) return day;
            const key = `prayer_${lat.toFixed(2)}_${lon.toFixed(2)}_${gd}_${method}`;
            const mp = Storage.get(key);
            if (mp && mp._source === 'muslimpro' && mp.timings && mp.timings.Fajr) {
              return Object.assign({}, day, { timings: mp.timings, _source: 'muslimpro' });
            }
          } catch (_) { /* día sin cambios */ }
          return day;
        });
        Storage.set(cacheKey, merged, CONFIG.CACHE_TTL * 7);
        return this._applyTimeShiftMonth(merged);
      }
      throw new Error('Prayer month empty');
    } catch (e) {
      console.warn('Prayer month API offline, calculando localmente:', e.message);
      return this._computePrayerMonthOffline(lat, lon, month, year, method);
    }
  },

  // v36: mes completo desde Aladhan (método efectivo ya resuelto por el
  // llamador) + corrección regional (Jordania) + ajuste manual por oración.
  async _fetchAladhanMonth(lat, lon, month, year, method) {
    const url = `${CONFIG.API.ALADHAN}/calendar/${year}/${month}?latitude=${lat}&longitude=${lon}&method=${method}`;
    const res = await this._fetchWithTimeout(url, 8000);
    if (!res.ok) throw new Error('Prayer month error');
    const json = await res.json();
    let data = json.data || [];
    if (!Array.isArray(data) || data.length === 0) return null;
    if (typeof PrayerCalc !== 'undefined') {
      const country = this._countryFor(lat, lon);
      const elevation = this._elevationFor(lat, lon); // v39
      // v39: elevación (Shuruq/Maghrib/Isha) día a día, con la fecha real de
      // cada fila (la declinación solar cambia ligeramente de un día a otro).
      data = data.map((d, idx) => {
        if (!d || !d.timings) return d;
        let t = PrayerCalc.applyElevationAdjustment(d.timings, lat, lon, new Date(year, month - 1, idx + 1), elevation, method);
        t = PrayerCalc.applyRegionalCorrections(t, country, lat, lon);
        t = PrayerCalc.applyPrayerOffsets(t);
        return Object.assign({}, d, { timings: t });
      });
    }
    return data;
  },

  /**
   * v36: método de cálculo EFECTIVO por ubicación — reproduce el convenio
   * por defecto que usa Muslim Pro en cada país (verificado contra sus
   * páginas oficiales, 2026-09-11): Jordania → 19 (Awqaf: Isha = Maghrib+90),
   * Turquía → 13 (Diyanet), EE. UU./Canadá → 2 (ISNA), Francia → 12 (UOIF).
   * Si el usuario eligió un método manualmente, se respeta siempre.
   */
  _effectiveMethod(lat, lon, method) {
    try {
      if (typeof AppState !== 'undefined' && AppState.settings && AppState.settings._calcMethodManual) {
        return method; // elección explícita del usuario: intocable
      }
      const loc = (typeof AppState !== 'undefined' && AppState.location) || null;
      const near = loc && Math.abs(loc.latitude - lat) < 0.5 && Math.abs(loc.longitude - lon) < 0.5;
      if (near && typeof LocationService !== 'undefined') {
        if (LocationService.isJordan(loc)) return 19;      // Awqaf Jordania
        if (LocationService.isPalestine && LocationService.isPalestine(loc)) return 3; // MWL (Muslim Pro)
      }
      // Ciudades conocidas de la lista: convenio oficial de su país
      if (typeof Cities !== 'undefined' && Cities.match) {
        const c = Cities.match(lat, lon);
        if (c) {
          const country = (c.country || '').toLowerCase();
          if (country.includes('turqu') || country.includes('turkey')) return 13; // Diyanet
          if (country.includes('ee. uu') || country.includes('canad')) return 2;  // ISNA
          if (country.includes('francia') || country.includes('france')) return 12; // UOIF
          if (country.includes('jordan')) return 19; // Awqaf Jordania
          if (country.includes('palestin')) return 3;  // MWL (convención MP de Palestina)
          if (country.includes('arabia saud')) return 4; // Umm Al-Qura
        }
      }
      // Bounding boxes cuando la ubicación no está en la lista
      if (typeof LocationService !== 'undefined') {
        if (LocationService.isJordan({ latitude: lat, longitude: lon })) return 19;
        if (LocationService.isPalestine && LocationService.isPalestine({ latitude: lat, longitude: lon })) return 3;
      }
    } catch (_) { /* nunca romper por la autodetección */ }
    return method;
  },

  // v26: aplica ±1h verano/invierno a la tabla mensual (API o caché)
  _applyTimeShiftMonth(data) {
    try {
      if (typeof PrayerCalc === 'undefined' || !Array.isArray(data)) return data;
      // v38: ajuste manual por oración SIEMPRE (incluye días Muslim Pro de
      // la caché, que están guardados en crudo).
      let out = data.map(d => Object.assign({}, d, { timings: PrayerCalc.applyPrayerOffsets(d.timings) }));
      const mode = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.timeShift) || 'auto';
      if (mode === 'auto') return out;
      const delta = mode === 'summer' ? 1 : (mode === 'winter' ? -1 : 0);
      if (!delta) return out;
      return out.map(d => Object.assign({}, d, { timings: PrayerCalc.shiftTimings(d.timings, delta) }));
    } catch (e) { return data; }
  },

  // v21: tabla mensual calculada localmente (mismo shape que Aladhan /calendar)
  _computePrayerMonthOffline(lat, lon, month, year, method) {
    if (typeof PrayerCalc === 'undefined') return [];
    const gregMonthNames = {
      en: ['January','February','March','April','May','June','July','August','September','October','November','December'][month-1],
      ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][month-1],
    };
    const daysInMonth = new Date(year, month, 0).getDate();
    const elevation = this._elevationFor(lat, lon); // v39
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const greg = new Date(year, month - 1, d);
      const timings = PrayerCalc.getTimings(lat, lon, greg, method, this._countryFor(lat, lon), elevation);
      const hijri = this._gregorianToHijri(greg);
      const hijriMonths = this._hijriMonthName(hijri.month);
      const weekdayNames = this._weekdayName(greg.getDay());
      result.push({
        timings,
        date: {
          gregorian: {
            date: `${String(d).padStart(2,'0')}-${String(month).padStart(2,'0')}-${year}`,
            day: String(d),
            month: { number: month, en: gregMonthNames.en, ar: gregMonthNames.ar },
            year: String(year),
            weekday: { en: weekdayNames.en, ar: weekdayNames.ar },
          },
          hijri: {
            day: String(hijri.day),
            month: { number: hijri.month, en: hijriMonths.en, ar: hijriMonths.ar },
            year: String(hijri.year),
          },
        },
      });
    }
    return result;
  },

  // ============ QURAN (Al-Quran Cloud) ============
  // v21: la lista de 114 suras vive local (QuranOfflineService) — instantánea
  // y disponible sin red desde el primer arranque, sin depender de la API.
  async getSurahList() {
    if (typeof QuranOfflineService !== 'undefined') {
      return QuranOfflineService.getSurahList();
    }
    // Respaldo por si el script no cargó (no debería ocurrir)
    const cached = Storage.get('surah_list');
    if (cached) return cached;
    const res = await fetch(`${CONFIG.API.QURAN}/surah`);
    if (!res.ok) throw new Error('Surah list error');
    const json = await res.json();
    const data = json.data || [];
    Storage.set('surah_list', data, CONFIG.CACHE_TTL * 30);
    return data;
  },

  /**
   * Get a surah with arabic + translation + transliteration + audio in parallel.
   * @param {number} surahNumber
   * @param {string} translation - e.g. 'es.cortes', 'es.garcia', 'en.sahih'
   * @param {string} audio - e.g. 'ar.abdurrahmaansudais'
   */
  /**
   * v30: resuelve la edición de traducción coherente con el IDIOMA de la app.
   * Regla anti-conflicto:
   *   • UI en árabe ('none')  → solo texto árabe, sin traducción.
   *   • UI en español        → SIEMPRE Isa García (es.garcia_pdf, local).
   *   • UI en inglés         → NUNCA español: Sahih Intl. (o Pickthall si
   *                            el usuario la eligió explícitamente).
   */
  resolveTranslationForLocale(requested, locale) {
    const loc = locale || (typeof AppState !== 'undefined' && AppState.settings.locale) ||
                (typeof currentLocale !== 'undefined' ? currentLocale : 'es');
    // v32: BUG — "requested === 'none'" hacía que el valor 'none' (que esta
    // misma función devuelve cuando el idioma es árabe) quedara PEGADO para
    // siempre: en cuanto el usuario pasaba por árabe una vez, cualquier
    // cambio posterior a español o inglés seguía llamando a esta función con
    // requested='none' y el cortocircuito lo devolvía otra vez, sin llegar
    // siquiera a mirar el nuevo idioma. Esa es la causa exacta de que la
    // traducción de Isa García "desaparezca" tras cambiar de idioma — el
    // idioma actual (`loc`) es la ÚNICA fuente de verdad aquí, así que basta
    // con decidir según `loc` sin dejar que el valor anterior interfiera.
    if (loc === 'ar') return 'none';
    // v31: en inglés SIEMPRE Sahih International — nunca heredar la edición
    // española del idioma anterior (regla anti-conflicto: ES solo en español).
    if (loc === 'en') return 'en.sahih';
    return 'es.garcia_pdf'; // español: García es la única predeterminada
  },

  // v31: las versiones ≤ v30 podían guardar en IndexedDB suras con el texto
  // ÁRABE en la casilla de traducción (la API reordenaba las ediciones al
  // recibir el id inexistente 'es.garcia_pdf'). Ese dato corrupto era
  // PERMANENTE (sin TTL) y sobrevivía a todos los arreglos. Se purga UNA vez
  // toda la caché de suras; la re-descarga es ligera (solo texto).
  SURAH_CACHE_VER: 'v4',
  _PURGE_KEY: 'quba_purge_quran_full_v1_done',

  async _purgeLegacyQuranCaches() {
    if (typeof CacheDB === 'undefined') return;
    try {
      if (await CacheDB.get(this._PURGE_KEY)) return;
      const store = await CacheDB._tx('readwrite');
      await new Promise((resolve) => {
        const req = store.getAllKeys();
        req.onsuccess = () => {
          (req.result || []).forEach(k => {
            if (typeof k === 'string' && k.startsWith('quran_full_v1_')) {
              try { store.delete(k); } catch (e) {}
            }
          });
          resolve();
        };
        req.onerror = () => resolve();
      });
      // Manifiesto de descarga: las suras marcadas ya no existen → reiniciar
      try { await CacheDB.set('quran_offline_manifest_v1', { translation: null, reciter: null, done: [] }, null); } catch (e) {}
      await CacheDB.set(this._PURGE_KEY, true, null);
    } catch (e) { /* silencioso: nunca romper la lectura */ }
  },

  async getSurahWithTranslation(surahNumber, translation = 'es.garcia_pdf', audio = 'ar.mahermuaiqly') {
    // v30: nunca confiar ciegamente en el valor guardado — se resuelve
    // según el idioma actual para que el modo árabe no muestre traducción
    // y el modo inglés no quede atascado en español.
    translation = this.resolveTranslationForLocale(translation);

    // v31: purga única de suras corruptas heredadas (árabe en la traducción)
    await this._purgeLegacyQuranCaches();

    // v29: la traducción ES autorizada (Isa García, del PDF) es 100% local.
    // La sura (árabe + audio + transliteración) se obtiene con la edición
    // Cortés y luego se reemplaza el texto traducido por el de García.
    const useGarcia = translation === 'es.garcia_pdf';
    const netTranslation = useGarcia ? 'es.cortes' : translation;

    const storeId = useGarcia ? 'es.garcia_pdf' : translation;
    if (typeof QuranOfflineService !== 'undefined') {
      const local = await QuranOfflineService.getLocalSurah(surahNumber, storeId, audio);
      if (local) {
        if (useGarcia) return await this._applyGarciaTranslation(local);
        return local;
      }
    }

    const cacheKey = `surah_${surahNumber}_${storeId}_${audio}_${this.SURAH_CACHE_VER}`;
    const cached = Storage.get(cacheKey);
    if (cached) {
      // Ya se leyó antes: promover a almacenamiento permanente para el futuro
      if (typeof QuranOfflineService !== 'undefined') {
        QuranOfflineService.saveSurah(surahNumber, storeId, audio, cached).catch(() => {});
      }
      if (useGarcia) return await this._applyGarciaTranslation(cached);
      return cached;
    }

    const result = await this._fetchSurahFromNetwork(surahNumber, netTranslation, audio);

    Storage.set(cacheKey, result, CONFIG.CACHE_TTL * 7);
    if (typeof QuranOfflineService !== 'undefined') {
      QuranOfflineService.saveSurah(surahNumber, storeId, audio, result).catch(() => {});
    }
    if (useGarcia) return await this._applyGarciaTranslation(result);
    return result;
  },

  // v29/v31: sustituye la traducción de cada aleya por la de Isa García (local).
  // v31: trabaja sobre un CLON — el objeto cacheado en IndexedDB quedaba
  // mutado con la traducción española y, al cambiar a inglés/árabe, la caché
  // devolvía español aunque se pidiera otra edición (de ahí el «tضارب»).
  // Además garantiza cobertura total: si a alguna aleya le faltara el texto
  // de García, cae al español de red (Cortés) — JAMÁS queda árabe ni inglés
  // en la casilla de traducción cuando la UI está en español.
  async _applyGarciaTranslation(surah) {
    if (!surah || !Array.isArray(surah.ayahs)) return surah;
    const clone = { ...surah, ayahs: surah.ayahs.map(a => ({ ...a })) };
    if (typeof GarciaData === 'undefined') return clone;
    const map = await GarciaData.getSurahTranslation(surah.number);
    if (!map) return clone;
    clone.ayahs.forEach(a => {
      // García tiene prioridad; el portador de red (Cortés, español) es el respaldo
      a.translation = map[a.number] || a.translation || '';
    });
    return clone;
  },

  // v21: extraído de getSurahWithTranslation para que QuranOfflineService
  // pueda reutilizar exactamente la misma llamada de red durante la
  // descarga masiva (mismo shape de datos, una sola fuente de la verdad).
  async _fetchSurahFromNetwork(surahNumber, translation, audio) {
    // Always include transliteration as 4th edition
    const editions = `quran-uthmani,${translation},${audio},en.transliteration`;
    const url = `${CONFIG.API.QURAN}/surah/${surahNumber}/editions/${editions}`;
    const res = await this._fetchWithTimeout(url, 15000);
    if (!res.ok) throw new Error('Surah error');
    const json = await res.json();
    const editionsData = json.data || [];

    if (editionsData.length < 2) throw new Error('Sura no disponible');

    // v30 FIX: localizar cada edición POR SU IDENTIFICADOR, no por posición.
    // La API silenciosamente omite las ediciones inválidas (p.ej. el antiguo
    // id 'es.garcia_pdf' no existe en el servidor), así que antes
    // editionsData[1] podía ser el AUDIO y la app acababa mostrando el texto
    // árabe en la casilla de traducción. Ahora se busca por `edition.identifier`
    // y, si la traducción pedida no viene, se reintenta con una edición válida
    // del mismo idioma en lugar de mostrar árabe.
    const byId = {};
    editionsData.forEach(e => { if (e && e.edition && e.edition.identifier) byId[e.edition.identifier] = e; });

    const arabic = byId['quran-uthmani'] || editionsData[0];
    let trans = translation !== 'none' ? byId[translation] : null;

    // Rescate: la edición pedida no existe en la API → reintento UNA vez con
    // una edición válida (inglés → Sahih Intl.; español → Cortés). García se
    // sustituye después localmente, así que Cortés solo sirve de portador.
    if (translation !== 'none' && !trans) {
      const fallbackId = translation.startsWith('en') ? 'en.sahih' : 'es.cortes';
      const retry = await this._fetchWithTimeout(
        `${CONFIG.API.QURAN}/surah/${surahNumber}/${fallbackId}`, 15000
      ).catch(() => null);
      if (retry && retry.ok) {
        const rj = await retry.json().catch(() => null);
        if (rj && rj.data && rj.data.ayahs) trans = rj.data;
      }
    }

    const aud = byId[audio] || editionsData.find(e => e.edition && e.edition.type === 'audio');
    const translit = byId['en.transliteration'];

    const ayahs = arabic.ayahs.map((a, idx) => ({
      number: a.numberInSurah,
      numberGlobal: a.number, // global ayah index 1-6236
      arabic: a.text,
      translation: trans?.ayahs?.[idx]?.text || '',
      transliteration: (typeof QURAN_TRANSLITERATION !== 'undefined'
        && QURAN_TRANSLITERATION[arabic.number]
        && QURAN_TRANSLITERATION[arabic.number][a.numberInSurah])
        || translit?.ayahs?.[idx]?.text || '',
      audio: aud?.ayahs?.[idx]?.audio || null,
      audioSecondary: aud?.ayahs?.[idx]?.audioSecondary || [],
      juz: a.juz,
      page: a.page,
      sajda: a.sajda,
    }));

    return {
      number: arabic.number,
      name: arabic.name,
      englishName: arabic.englishName,
      englishNameTranslation: arabic.englishNameTranslation,
      revelationType: arabic.revelationType,
      numberOfAyahs: arabic.numberOfAyahs,
      ayahs,
    };
  },

  async getVerseOfTheDay(translation = 'es.cortes') {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const totalAyahs = 6236;
    const ayahNumber = ((dayOfYear * 17) % totalAyahs) + 1;

    const cacheKey = `vod_${ayahNumber}_${translation}`;
    const cached = Storage.get(cacheKey);
    if (cached) return cached;

    try {
      const [arRes, trRes] = await Promise.all([
        fetch(`${CONFIG.API.QURAN}/ayah/${ayahNumber}/quran-uthmani`),
        fetch(`${CONFIG.API.QURAN}/ayah/${ayahNumber}/${translation}`),
      ]);
      const arJ = await arRes.json();
      const trJ = await trRes.json();
      const result = {
        arabic: arJ.data?.text,
        translation: trJ.data?.text,
        surah: arJ.data?.surah?.englishName,
        surahNumber: arJ.data?.surah?.number,
        ayahNumber: arJ.data?.numberInSurah,
      };
      Storage.set(cacheKey, result, CONFIG.CACHE_TTL);
      return result;
    } catch (e) {
      return {
        arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        translation: 'Ciertamente, con la dificultad viene la facilidad.',
        surah: 'Ash-Sharh',
        surahNumber: 94,
        ayahNumber: 6,
      };
    }
  },

  // ============ DUAS (UmmahAPI) ============
  /**
   * Get all dua categories.
   * Returns: [{ id, name, description, count }, ...]
   */
  async getDuaCategories() {
    // 📚 Prefer local vetted dataset (Hisnul Muslim references)
    if (CONFIG.USE_LOCAL_DUAS && typeof LocalDuasService !== 'undefined') {
      const res = await LocalDuasService.getCategories();
      return res.data || [];
    }

    const cacheKey = 'dua_cats_v1';
    const cached = Storage.get(cacheKey);
    if (cached) return cached;
    try {
      // ☁️ Prefer proxy backend if configured
      const url = CONFIG.API.PROXY
        ? `${CONFIG.API.PROXY}/duas/categories`
        : `${CONFIG.API.UMMAH}/duas/categories`;
      const res = await fetch(url);
      const json = await res.json();
      const cats = json?.data?.categories || json?.data || [];
      Storage.set(cacheKey, cats, 7 * 24 * 60 * 60 * 1000); // 7 days
      return cats;
    } catch (e) {
      console.warn('getDuaCategories failed:', e);
      return [];
    }
  },

  /**
   * Get duas for a given category.
   * Returns: [{ id, title, arabic, transliteration, translation, source, repeat }, ...]
   */
  async getDuasByCategory(categoryId) {
    // 📚 Prefer local vetted dataset
    if (CONFIG.USE_LOCAL_DUAS && typeof LocalDuasService !== 'undefined') {
      const lang = AppState.settings.locale || 'es';
      const res = await LocalDuasService.getCategory(categoryId, lang);
      return res.data || [];
    }

    const cacheKey = `dua_cat_${categoryId}_v1`;
    const cached = Storage.get(cacheKey);
    if (cached) return cached;
    try {
      const url = CONFIG.API.PROXY
        ? `${CONFIG.API.PROXY}/duas/category/${encodeURIComponent(categoryId)}`
        : `${CONFIG.API.UMMAH}/duas/category/${encodeURIComponent(categoryId)}`;
      const res = await fetch(url);
      const json = await res.json();
      const duas = json?.data?.duas || json?.data || [];
      Storage.set(cacheKey, duas, 7 * 24 * 60 * 60 * 1000);
      return duas;
    } catch (e) {
      console.warn('getDuasByCategory failed:', e);
      return [];
    }
  },

  /**
   * Get a single random dua.
   */
  async getRandomDua() {
    try {
      const res = await fetch(`${CONFIG.API.UMMAH}/duas/random`);
      const json = await res.json();
      return json?.data || null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Search duas by keyword.
   */
  async searchDuas(query) {
    if (!query || query.length < 2) return [];
    try {
      const res = await fetch(`${CONFIG.API.UMMAH}/duas/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      return json?.data?.duas || [];
    } catch (e) {
      return [];
    }
  },
};

// ============ LOCATION ============
const LocationService = {
  // Default fallback: Mosque Abdullah, Havana, Cuba
  DEFAULT_LOCATION: {
    latitude: 23.1136,
    longitude: -82.3666,
    city: 'La Habana',
    country: 'Cuba',
    isDefault: true,
  },

  // Check current permission state (works on modern browsers)
  async checkPermission() {
    if (!navigator.permissions) return 'unknown';
    try {
      const res = await navigator.permissions.query({ name: 'geolocation' });
      return res.state; // 'granted' | 'prompt' | 'denied'
    } catch (e) {
      return 'unknown';
    }
  },

  // v39: elevación (metros) vía Open-Meteo — gratis, sin API key, con CORS
  // habilitado para llamarse directo desde el navegador sin pasar por el
  // proxy backend (github.com/open-meteo/open-meteo: "No API key required,
  // CORS supported"). Se usa para corregir Shuruq/Maghrib/Isha en ciudades
  // con altitud — ver PrayerCalc.applyElevationAdjustment para el porqué.
  // Uso NO comercial según su licencia; si Quba se distribuye/monetiza,
  // revisar https://open-meteo.com/en/pricing (mismo endpoint con clave de
  // pago, o self-host). Nunca lanza: si falla, la app sigue como antes
  // (sin corregir elevación), no bloquea el resto del geocoding.
  async fetchElevation(lat, lon) {
    try {
      const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;
      const res = await (typeof API !== 'undefined' ? API._fetchWithTimeout(url, 6000) : fetch(url));
      if (!res.ok) return null;
      const data = await res.json();
      const el = Array.isArray(data.elevation) ? data.elevation[0] : null;
      return (typeof el === 'number' && isFinite(el)) ? el : null;
    } catch (e) {
      return null;
    }
  },

  // Reverse geocode via Nominatim with graceful failure
  // v39: la elevación se pide EN PARALELO (Open-Meteo) — no añade latencia
  // extra apreciable, y así queda lista en cuanto se resuelve la ubicación.
  async reverseGeocode(lat, lon) {
    const elevationPromise = this.fetchElevation(lat, lon);
    try {
      const res = await fetch(
        // v28: siempre en inglés → detección de país estable ('Jordan',
        // 'Palestinian Territory', …) independiente del idioma de la app.
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const elevation = await elevationPromise;
      return {
        city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || '',
        country: data.address?.country || '',
        countryCode: (data.address?.country_code || '').toUpperCase(),
        elevation, // v39: metros s.n.m., o null si Open-Meteo no respondió
      };
    } catch (e) {
      const elevation = await elevationPromise.catch(() => null);
      return { city: '', country: '', elevation };
    }
  },

  // Main entry — with cascading fallbacks
  async getCurrent(options = {}) {
    const { forceRefresh = false, silent = false } = options;

    // 1) Use cached if available and not forcing refresh
    if (!forceRefresh) {
      // v40: leer la caché PRIMERO (v39 usaba `cached` antes de declararlo →
      // ReferenceError al primer arranque: home congelada en el skeleton y el
      // error se manifestaba además como «problema al acceder a la ubicación»).
      const cached = Storage.get('last_location');
      if (cached) {
        // v39/v40: una ubicación cacheada de ANTES de esta versión no tiene
        // `elevation` — se completa EN SEGUNDO PLANO (sin bloquear ni añadir
        // latencia aquí) para que Shuruq/Maghrib/Isha se corrijan en cuanto
        // haya respuesta, en vez de esperar hasta que expire esta caché de 7
        // días. Nunca falla de forma visible: si Open-Meteo no responde, la
        // app sigue exactamente como estaba.
        if (typeof cached.elevation !== 'number' && typeof navigator !== 'undefined' && navigator.onLine) {
          this.fetchElevation(cached.latitude, cached.longitude).then((elevation) => {
            if (typeof elevation !== 'number') return;
            const patched = Object.assign({}, cached, { elevation });
            Storage.set('last_location', patched, CONFIG.CACHE_TTL * 7);
            if (typeof AppState !== 'undefined' && AppState.location &&
                AppState.location.latitude === cached.latitude &&
                AppState.location.longitude === cached.longitude) {
              AppState.location.elevation = elevation;
            }
          }).catch(() => {});
        }
        return cached;
      }
    }

    // 2) Try browser geolocation
    if (!navigator.geolocation) {
      if (!silent) showToast((t('geoNotSupported') || 'Geolocalización no soportada. Usando ubicación por defecto.'), 3000);
      return this.useDefault();
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          const geo = await this.reverseGeocode(coords.latitude, coords.longitude);
          Object.assign(coords, geo);
          Storage.set('last_location', coords, CONFIG.CACHE_TTL * 7);
          resolve(coords);
        },
        (err) => {
          // Cascading fallback: cached -> default
          const cached = Storage.get('last_location');
          if (cached) return resolve(cached);

          if (!silent) {
            const msg = err.code === 1
              ? (t('geoPermDenied') || '<i class="fas fa-triangle-exclamation"></i> Permiso denegado. Usando La Habana por defecto. Puedes cambiarla en el perfil.')
              : err.code === 2
              ? (t('geoUnavailable') || '<i class="fas fa-triangle-exclamation"></i> Posición no disponible. Usando ubicación por defecto.')
              : (t('geoTimeout') || '<i class="fas fa-triangle-exclamation"></i> Tiempo agotado. Usando ubicación por defecto.');
            showToast(msg, 4000);
          }
          resolve(this.useDefault());
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }
      );
    });
  },

  // Explicitly request permission (with clear UX)
  async requestPermission() {
    if (!navigator.geolocation) {
      showToast((t('geoNotSupported') || 'No soportado'), 3000);
      return null;
    }
    // Trigger the browser prompt
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          const geo = await this.reverseGeocode(coords.latitude, coords.longitude);
          Object.assign(coords, geo);
          Storage.set('last_location', coords, CONFIG.CACHE_TTL * 7);
          showToast((t('geoGranted') || 'Ubicación activada: '+ (coords.city || '')), 2500);
          resolve(coords);
        },
        (err) => {
          const msg = err.code === 1
            ? (t('geoPermDeniedHelp') || '<i class="fas fa-circle-xmark"></i> Permiso denegado. Abre la configuración del navegador para habilitarlo.')
            : (t('geoError') || '<i class="fas fa-circle-xmark"></i> Error al obtener ubicación.');
          showToast(msg, 5000);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  },

  // Set a manual location (from profile settings)
  // v40: vuelve a ser INMEDIATA — la ciudad cambia al instante, sin esperar
  // al servidor de elevación (v39 bloqueaba la UI 1–6 s en cada cambio de
  // ciudad, de ahí la «lentitud al cambiar de país»). La elevación (v39) se
  // resuelve en segundo plano y se parchea en cuanto llega: el horario se
  // recalcula solo con la corrección, sin re-render completo ni esperas.
  setManual(lat, lon, city, country) {
    const coords = {
      latitude: lat,
      longitude: lon,
      city: city || '',
      country: country || '',
      // v28: versión en inglés (para las correcciones regionales por país)
      countryEn: this.countryEnOf(lat, lon, country),
      elevation: null, // se completa abajo en segundo plano
      manual: true,
    };
    Storage.set('last_location', coords, CONFIG.CACHE_TTL * 30);
    AppState.location = coords;

    // v39/v40: elevación sin bloquear — cuando llega, se guarda y se
    // recalculan los horarios del día silenciosamente (misma corrección de
    // Shuruq/Maghrib/Isha, pero sin congelar la UI mientras tanto).
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.fetchElevation(lat, lon).then((elevation) => {
        if (typeof elevation !== 'number') return;
        const patched = Object.assign({}, coords, { elevation });
        Storage.set('last_location', patched, CONFIG.CACHE_TTL * 30);
        if (typeof AppState !== 'undefined' && AppState.location &&
            AppState.location.latitude === lat && AppState.location.longitude === lon) {
          AppState.location.elevation = elevation;
          AppState.timings = null; // invalida el horario calculado sin elevación
        }
      }).catch(() => {});
    }
    return coords;
  },

  useDefault() {
    Storage.set('last_location', this.DEFAULT_LOCATION, CONFIG.CACHE_TTL * 7);
    return { ...this.DEFAULT_LOCATION };
  },

  // v28: detección de Jordania (nombre EN/ES/AR o bounding box aproximado)
  isJordan(loc) {
    if (!loc) return false;
    const hay = [loc.countryEn, loc.country].filter(Boolean).join(' ').toLowerCase();
    if (hay.includes('jordan') || hay.includes('jordania') ||
        hay.includes('الأردن') || hay.includes('اردن')) return true;
    const la = Number(loc.latitude), lo = Number(loc.longitude);
    return la >= 29.0 && la <= 33.4 && lo >= 34.9 && lo <= 39.4;
  },

  // v36: detección de Palestina (nombre EN/ES/AR o bounding box aproximado).
  // Muslim Pro publica para Palestina el convenio MWL (Fajr 18° / Isha 17°),
  // así que la app debe usar el método 3 en Ramala, Nablus, Gaza, Jerusalén…
  // incluso si el usuario tiene otro método global (salvo elección manual).
  isPalestine(loc) {
    if (!loc) return false;
    const hay = [loc.countryEn, loc.country].filter(Boolean).join(' ').toLowerCase();
    if (hay.includes('palestin') || hay.includes('فلسطين')) return true;
    const la = Number(loc.latitude), lo = Number(loc.longitude);
    // Franja de Gaza + Cisjordania (aprox.): 31.2-32.6 N, 34.2-35.6 E
    return la >= 31.2 && la <= 32.6 && lo >= 34.2 && lo <= 35.6;
  },

  // v28: nombre de país en inglés según coordenadas (sin depender de la red).
  // Solo normaliza los países con corrección regional activa (JO y PS).
  countryEnOf(lat, lon, country) {
    if (this.isJordan({ latitude: lat, longitude: lon, country })) return 'Jordan';
    if (this.isPalestine({ latitude: lat, longitude: lon, country })) return 'Palestine';
    return country || '';
  },

  getCached() {
    return Storage.get('last_location');
  },
};

// ============ Helpers de fecha y oración ============
// ⏰ v20: Iqamah (tiempo de espera hasta la congregación) en minutos por oración
// Fajr +20 · Dhuhr +15 · Asr +15 · Maghrib +5 · Isha +15
const IQAMAH_OFFSETS = { Fajr: 20, Dhuhr: 15, Asr: 15, Maghrib: 5, Isha: 15 };

function addMinutesToTime(time24, minutes) {
  if (!time24 || !time24.includes(':')) return '--:--';
  let [h, m] = time24.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '--:--';
  const total = (h * 60 + m + minutes) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function getIqamahTime(prayerName, adhanTime24) {
  const off = IQAMAH_OFFSETS[prayerName];
  if (off === undefined) return null;
  return addMinutesToTime(adhanTime24, off);
}

function getDailyPrayers(timings) {
  if (!timings) return [];
  const names = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  return names.map(n => {
    const time = (timings[n] || '--:--').split(' ')[0];
    return {
      name: n,
      time,
      iqamah: getIqamahTime(n, time),
      iqamahOffset: IQAMAH_OFFSETS[n] || null,
    };
  });
}

function getNextPrayer(timings) {
  if (!timings) return null;
  const order = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const now = new Date();
  for (const name of order) {
    const ts = (timings[name] || '').split(' ')[0];
    if (!ts) continue;
    const [h, m] = ts.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d > now) {
      const diffMs = d - now;
      return { name, time: ts, diffMs, date: d };
    }
  }
  const ts = (timings.Fajr || '05:00').split(' ')[0];
  const [h, m] = ts.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(h, m, 0, 0);
  return { name: 'Fajr', time: ts, diffMs: d - now, date: d, nextDay: true };
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function formatTime12h(time24) {
  if (!time24 || !time24.includes(':')) return '--:--';
  let [h, m] = time24.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '--:--';
  // v35: etiquetas AM/PM localizadas (ص/م en árabe, a. m./p. m. en español)
  const ampm = h >= 12 ? (t('pmLabel') || 'PM') : (t('amLabel') || 'AM');
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getGreetingByHour() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('greetingMorning');
  if (h >= 12 && h < 18) return t('greetingAfternoon');
  if (h >= 18 && h < 22) return t('greetingEvening');
  return t('greetingNight');
}

if (typeof window !== 'undefined') {
  window.IQAMAH_OFFSETS = IQAMAH_OFFSETS;
  window.getIqamahTime = getIqamahTime;
  window.addMinutesToTime = addMinutesToTime;
}

function getPrayerEmoji(name) {
  const map = {
    Fajr: '<i class="fas fa-cloud-sun"></i>',
    Sunrise: '<i class="fas fa-sun"></i>',
    Dhuhr: '<i class="fas fa-sun"></i>',
    Asr: '<i class="fas fa-cloud-sun"></i>',
    Maghrib: '<i class="fas fa-mountain-sun"></i>',
    Isha: '<i class="fas fa-moon"></i>',
  };
  return map[name] || '<i class="fas fa-mosque"></i>';
}
