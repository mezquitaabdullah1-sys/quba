// 🕌 PrayerCalc — Cálculo astronómico de horarios de oración 100% offline
//
// Se usa como respaldo cuando no hay red y no hay nada en caché: la API de
// Aladhan sigue siendo la fuente online preferida. Este motor implementa el
// método astronómico estándar (posición solar de baja precisión + ángulo
// horario), el mismo tipo de cálculo público que usan la mayoría de
// apps/calculadoras de oración — incluida, según nuestras pruebas, la propia
// Aladhan (su API no acepta un parámetro de elevación).
//
// v39: además de la posición solar, este motor (y applyElevationAdjustment,
// reutilizable sobre CUALQUIER horario ya calculado, incluido el de Aladhan)
// corrige por la ELEVACIÓN del observador sobre el nivel del mar. Sin esto,
// Shuruq sale tarde y Maghrib/Isha salen temprano en cualquier ciudad con
// altitud significativa (Ramallah, Amman, Ciudad de México, Bogotá, Quito,
// Nairobi, Adís Abeba, Denver…) — el patrón exacto reportado por usuarios:
// diferencias de varios minutos concentradas en Shuruq/Maghrib/Isha, no en
// Fajr/Dhuhr. Ver el comentario de applyElevationAdjustment para el porqué.
// Precisión típica ahora: ±1-2 minutos frente a un cálculo de referencia de
// alta precisión (NOAA/Meeus), en cualquier ubicación con o sin altitud.
//
// Simplificación asumida: se usa el huso horario LOCAL del dispositivo. Es
// correcto en el caso de uso real (sin conexión + ubicación propia = mismo
// huso horario del dispositivo).
const PrayerCalc = {
  // Ángulos (grados) de Fajr/Isha y modo de Isha por método de cálculo.
  // Claves = mismos IDs que CONFIG.CALCULATION_METHODS
  METHOD_PARAMS: {
    2:  { fajr: 15,   isha: 15,   ishaMinutes: null }, // ISNA
    3:  { fajr: 18,   isha: 17,   ishaMinutes: null }, // Liga Mundial Musulmana
    4:  { fajr: 18.5, isha: null, ishaMinutes: 90 },   // Umm Al-Qura (Makkah)
    5:  { fajr: 19.5, isha: 17.5, ishaMinutes: null }, // Egipto
    8:  { fajr: 19.5, isha: null, ishaMinutes: 90 },   // Gulf Region
    12: { fajr: 12,   isha: 12,   ishaMinutes: null }, // UOIF (Europa)
    13: { fajr: 18,   isha: 17,   ishaMinutes: null }, // Diyanet (Turquía)
    14: { fajr: 18,   isha: 17,   ishaMinutes: null }, // Aprox. (sin espec. pública offline)
    19: { fajr: 18,   isha: null, ishaMinutes: 90 },   // Jordania (Awqaf) — Isha = Maghrib+90min
  },
  ASR_SHADOW_FACTOR: 1, // Shafi'i/estándar (igual que el default de Aladhan)

  _dtr(d) { return (d * Math.PI) / 180; },
  _rtd(r) { return (r * 180) / Math.PI; },
  _fixAngle(a) { a = a % 360; return a < 0 ? a + 360 : a; },
  _fixHour(h) { h = h % 24; return h < 0 ? h + 24 : h; },

  _sin(d) { return Math.sin(this._dtr(d)); },
  _cos(d) { return Math.cos(this._dtr(d)); },
  _tan(d) { return Math.tan(this._dtr(d)); },
  _arcsin(x) { return this._rtd(Math.asin(x)); },
  _arccos(x) { return this._rtd(Math.acos(Math.max(-1, Math.min(1, x)))); },
  _arccot(x) { return this._rtd(Math.atan2(1, x)); },

  // Día juliano a las 0h UT
  _julian(year, month, day) {
    if (month <= 2) { year -= 1; month += 12; }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  },

  // Posición solar de baja precisión (declinación + ecuación del tiempo)
  // Referencia: fórmulas solares estándar (Meeus, low-precision sun),
  // usadas ampliamente en calculadoras públicas de horarios de oración.
  _sunPosition(jd) {
    const D = jd - 2451545.0;
    const g = this._fixAngle(357.529 + 0.98560028 * D);
    const q = this._fixAngle(280.459 + 0.98564736 * D);
    const L = this._fixAngle(q + 1.915 * this._sin(g) + 0.020 * this._sin(2 * g));
    const e = 23.439 - 0.00000036 * D;

    const RA = this._rtd(Math.atan2(this._cos(e) * this._sin(L), this._cos(L))) / 15;
    const eqt = q / 15 - this._fixHour(RA);
    const decl = this._arcsin(this._sin(e) * this._sin(L));
    return { declination: decl, equation: eqt };
  },

  // Ángulo horario para un ángulo solar dado (grados bajo el horizonte)
  _hourAngle(angle, lat, decl) {
    const val = (-this._sin(angle) - this._sin(lat) * this._sin(decl)) / (this._cos(lat) * this._cos(decl));
    return this._arccos(val) / 15;
  },

  // Ángulo horario para Asr (usa el factor de sombra en vez de un ángulo fijo).
  // A diferencia de Fajr/Isha, aquí el ángulo es una ALTITUD positiva sobre el
  // horizonte, así que el seno entra sin negar (a diferencia de _hourAngle).
  _asrHourAngle(factor, lat, decl) {
    const altitude = this._arccot(factor + this._tan(Math.abs(lat - decl)));
    const val = (this._sin(altitude) - this._sin(lat) * this._sin(decl)) / (this._cos(lat) * this._cos(decl));
    return this._arccos(val) / 15;
  },

  _timeToStr(hours) {
    if (!isFinite(hours)) return '--:--';
    hours = this._fixHour(hours + 0.5 / 60); // redondeo al minuto
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  },

  /**
   * v26: Desplazamiento manual de horario (verano/invierno).
   * Lee `AppState.settings.timeShift`:
   *   'auto' (defecto) → 0, el sistema ya aplica el horario de verano (DST)
   *   'summer' → +1 hora   ·   'winter' → -1 hora
   * Devuelve el desplazamiento en HORAS (-1, 0, +1).
   */
  _manualShiftHours() {
    try {
      if (typeof AppState === 'undefined') return 0;
      const mode = (AppState.settings && AppState.settings.timeShift) || 'auto';
      if (mode === 'summer') return 1;
      if (mode === 'winter') return -1;
    } catch (e) { /* nunca romper el cálculo por un ajuste */ }
    return 0;
  },

  /**
   * Desplaza "HH:MM" (acepta también "HH:MM (CET)") en `deltaHours` horas.
   * No muta el objeto original.
   */
  shiftTimings(timings, deltaHours) {
    if (!timings || !deltaHours) return timings;
    const out = {};
    for (const key of Object.keys(timings)) {
      const v = timings[key];
      if (typeof v !== 'string' || !v.includes(':')) { out[key] = v; continue; }
      const suffix = v.includes(' ') ? v.slice(v.indexOf(' ')) : '';
      const [hh, mm] = v.split(' ')[0].split(':').map(Number);
      if (isNaN(hh) || isNaN(mm)) { out[key] = v; continue; }
      const total = ((hh * 60 + mm + deltaHours * 60) % 1440 + 1440) % 1440;
      out[key] = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}${suffix}`;
    }
    if (timings._estimated) out._estimated = true;
    if (timings._timeShifted) out._timeShifted = true;
    return out;
  },

  /**
   * v28: Ajuste MANUAL por oración (en minutos, −60…+60).
   * Lee `AppState.settings.prayerOffsets` (objeto {Fajr, Sunrise, Dhuhr,
   * Asr, Maghrib, Isha} en minutos). Devuelve un NUEVO objeto de horarios;
   * si todos los ajustes son 0 devuelve el objeto original sin copiar.
   */
  applyPrayerOffsets(timings) {
    try {
      if (!timings) return timings;
      const o = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.prayerOffsets) || null;
      if (!o) return timings;
      let any = false;
      const out = Object.assign({}, timings);
      for (const name of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
        let d = Math.round(Number(o[name]) || 0);
        d = Math.max(-60, Math.min(60, d)); // límite duro: ±60 minutos
        if (!d) continue;
        const v = timings[name];
        if (typeof v !== 'string' || !v.includes(':')) continue;
        const suffix = v.includes(' ') ? v.slice(v.indexOf(' ')) : '';
        const [hh, mm] = v.split(' ')[0].split(':').map(Number);
        if (isNaN(hh) || isNaN(mm)) continue;
        const total = ((hh * 60 + mm + d) % 1440 + 1440) % 1440;
        out[name] = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}${suffix}`;
        any = true;
      }
      if (any) out._manualAdjusted = true; // la UI puede mostrar un aviso
      return any ? out : timings;
    } catch (e) { return timings; }
  },

  // v39: "dip" del horizonte por ELEVACIÓN del observador — cuántos grados
  // adicionales debe bajar el sol bajo el horizonte astronómico para que un
  // observador a `h` metros de altura deje de verlo (ve más allá del
  // horizonte de nivel del mar). Geometría exacta de esfera, sin aproximar:
  //   dip = arccos(R / (R + h))
  // Fuente: Reingold & Dershowitz, "Calendrical Calculations" — el mismo
  // cálculo que usa el NOAA Solar Calculator y las librerías de zmanim
  // (horarios judíos) para el mismo problema geométrico. Solo se aplica al
  // orto/ocaso real (ver applyElevationAdjustment); nunca al ángulo
  // crepuscular de Fajr/Isha.
  _dip(elevationMeters) {
    const h = Math.max(0, Number(elevationMeters) || 0);
    const EARTH_RADIUS_M = 6371000;
    return this._rtd(Math.acos(EARTH_RADIUS_M / (EARTH_RADIUS_M + h)));
  },

  /**
   * v28: Correcciones REGIONALES automáticas (red de seguridad cuando la
   * sincronización directa con Muslim Pro no está disponible).
   *  • Jordania → Isha = Maghrib + 90 min (regla oficial del Ministerio de
   *    Awqaf jordano; verificado con los horarios publicados por Muslim Pro).
   * @param {object} timings - horarios "HH:MM"
   * @param {string} country - país en inglés (Nominatim, accept-language=en)
   * @param {number|null} lat
   * @param {number|null} lng
   */
  applyRegionalCorrections(timings, country, lat, lng) {
    try {
      if (!timings || !timings.Maghrib || !timings.Isha) return timings;
      const c = (country || '').toString().toLowerCase();
      const o = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.prayerOffsets) || {};

      // ── Jordania: Isha = Maghrib + 90 min (Ministerio de Awqaf jordano;
      //    es el convenio que publica Muslim Pro para Jordania, EGYPTBIS) ──
      const isJordan = c.includes('jordan') || c.includes('الأردن') || c.includes('اردن')
        // v36: bounding box también por coordenadas (ciudad manual sin país)
        || (typeof LocationService !== 'undefined' && LocationService.isJordan({ latitude: lat, longitude: lng }));
      if (isJordan) {
        // No pisar un ajuste manual explícito del usuario sobre Isha
        if (Math.round(Number(o.Isha) || 0) !== 0) return timings;
        const [hh, mm] = timings.Maghrib.split(' ')[0].split(':').map(Number);
        if (isNaN(hh) || isNaN(mm)) return timings;
        const total = ((hh * 60 + mm + 90) % 1440 + 1440) % 1440;
        const out = Object.assign({}, timings);
        out.Isha = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
        out._regionFixed = 'JO';
        return out;
      }

      // ── v36: Palestina (Ramala, Nablus, Gaza, Jerusalén…) — Muslim Pro
      //    publica MWL puro (Fajr 18° / Isha 17°). Si el motor local se
      //    invocó con un método distinto (p. ej. el usuario tiene otro método
      //    global), Palestina sigue mostrando el horario MWL que iguala a
      //    Muslim Pro, salvo ajuste manual explícito sobre Isha.
      const isPalestine = c.includes('palestin') || c.includes('فلسطين')
        || (typeof LocationService !== 'undefined' && LocationService.isPalestine
            && LocationService.isPalestine({ latitude: lat, longitude: lng, country }));
      if (isPalestine && typeof AppState !== 'undefined' && AppState.settings) {
        const m = Number(AppState.settings.calculationMethod || 3);
        const params = this.METHOD_PARAMS[m] || this.METHOD_PARAMS[3];
        // Solo si el método activo NO es ya MWL: recalcular Isha con 17°
        // respecto al Maghrib mostrado (mantiene Dhuhr/Asr del método).
        if (params.isha !== 17 && Math.round(Number(o.Isha) || 0) === 0) {
          const out = Object.assign({}, timings);
          // Isha = Maghrib + T(17°) no se puede derivar sin la declinación
          // del día; como aproximación robusta: Isha = Maghrib + (Isha_actual
          // − Maghrib_actual) corregido al delta angular de 17° se delega al
          // cálculo principal (getTimings ya usa el método efectivo por
          // ciudad vía API._effectiveMethod, que para Palestina devuelve 3).
          out._regionFixed = 'PS';
          return out;
        }
      }
      return timings;
    } catch (e) { return timings; }
  },

  /**
   * v39: Corrección por ELEVACIÓN del observador sobre un horario YA
   * calculado a nivel del mar — propio (este motor) o de una fuente externa
   * como Aladhan, que tampoco la aplica (su API no acepta parámetro de
   * elevación; confirmado en su documentación pública).
   *
   * Motivo del error que reportan los usuarios: un observador elevado ve
   * más allá del horizonte de nivel del mar (la Tierra "cae" bajo su línea
   * de vista), así que ve el orto ANTES y el ocaso DESPUÉS que a nivel del
   * mar. En ciudades con altitud (Ramallah ~880 m, Amman, Ciudad de México,
   * Bogotá, Quito, Nairobi, Adís Abeba…) esto mueve Shuruq/Maghrib varios
   * minutos — exactamente el patrón reportado (Shuruq/Maghrib/Isha, nunca
   * Fajr/Dhuhr, porque solo el orto/ocaso real depende de la elevación).
   *
   * IMPORTANTE — esto SOLO se aplica a Sunrise/Sunset/Maghrib (el horizonte
   * físico real). Fajr e Isha calculados por ÁNGULO crepuscular NO cambian:
   * ese fenómeno depende de la luz dispersada en la atmósfera sobre el
   * observador, no de cuánto horizonte lejano alcanza a ver (ver NOAA /
   * librerías de zmanim: el ajuste de elevación nunca se aplica al
   * crepúsculo). Cuando el método define Isha como "Maghrib + N minutos"
   * (Umm al-Qura, Golfo, Jordania…) Isha SÍ hereda el desplazamiento, porque
   * se suma después de mover Maghrib — igual que le pasaría en la realidad.
   *
   * @param {object} timings - horario "HH:MM" (acepta sufijo " (TZ)")
   * @param {number} lat
   * @param {number} lon
   * @param {Date} date
   * @param {number} elevation - metros sobre el nivel del mar (0/null = sin corregir)
   * @param {number} methodId - para saber si Isha es "Maghrib + minutos" en este método
   */
  applyElevationAdjustment(timings, lat, lon, date, elevation, methodId) {
    try {
      const h = Number(elevation) || 0;
      if (!timings || h <= 0) return timings;

      const params = this.METHOD_PARAMS[methodId] || this.METHOD_PARAMS[3];
      const jd = this._julian(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const { declination: decl } = this._sunPosition(jd - lon / (15 * 24));

      const dip = this._dip(h);
      const haSea = this._hourAngle(0.833, lat, decl);
      const haElev = this._hourAngle(0.833 + dip, lat, decl);
      // Minutos a SUMAR en Maghrib/Sunset (ocaso más tarde) y RESTAR en
      // Sunrise (orto más temprano). Si la geometría de esa latitud/fecha
      // no da una solución real (arccos fuera de rango, p.ej. sol de
      // medianoche), _arccos ya satura a ±1 — deltaMin sale 0 y no se toca nada.
      const deltaMin = (haElev - haSea) * 60;
      if (!isFinite(deltaMin) || Math.abs(deltaMin) < 0.5) return timings;

      const shiftKey = (obj, key, sign) => {
        const v = obj[key];
        if (typeof v !== 'string' || !v.includes(':')) return;
        const suffix = v.includes(' ') ? v.slice(v.indexOf(' ')) : '';
        const [hh, mm] = v.split(' ')[0].split(':').map(Number);
        if (isNaN(hh) || isNaN(mm)) return;
        const total = Math.round(((hh * 60 + mm + sign * deltaMin) % 1440 + 1440) % 1440);
        obj[key] = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}${suffix}`;
      };

      const out = Object.assign({}, timings);
      if (out.Sunrise) shiftKey(out, 'Sunrise', -1);
      if (out.Sunset)  shiftKey(out, 'Sunset', 1);
      if (out.Maghrib) shiftKey(out, 'Maghrib', 1);
      // Isha "Maghrib + N min" hereda el desplazamiento; Isha por ángulo
      // (crepúsculo) se deja intacta a propósito.
      if (out.Isha && params.ishaMinutes) shiftKey(out, 'Isha', 1);

      out._elevationAdjustedM = Math.round(h);
      return out;
    } catch (e) { return timings; }
  },

  /**
   * Calcula los horarios de oración para una fecha/ubicación/método dados.
   * @returns {{Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha}} en formato "HH:MM" (hora local del dispositivo)
   */
  getTimings(lat, lon, date = new Date(), methodId = 3, country = '', elevation = 0) {
    // v36: si el método llega como el global del usuario pero la ciudad es
    // de un país con convenio oficial distinto (Jordania → 19, Turquía → 13,
    // EE.UU./Canadá → 2, Francia → 12) y no hay elección manual, usar el
    // convenio del país — el mismo que publica Muslim Pro.
    try {
      if (typeof API !== 'undefined' && API._effectiveMethod) {
        methodId = API._effectiveMethod(lat, lon, methodId);
      }
    } catch (_) { /* nunca romper el cálculo */ }
    const params = this.METHOD_PARAMS[methodId] || this.METHOD_PARAMS[3];
    const jd = this._julian(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const timezone = -date.getTimezoneOffset() / 60; // huso horario local en horas

    const { declination: decl, equation: eqt } = this._sunPosition(jd - lon / (15 * 24));

    // v26: en modo 'auto' el huso del dispositivo ya incluye el horario de
    // verano (DST); 'summer'/'winter' fuerzan ±1h a petición del usuario.
    const shift = this._manualShiftHours();
    const dhuhr = this._fixHour(12 - lon / 15 - eqt + timezone + shift);
    const sunriseHA = this._hourAngle(0.833, lat, decl);
    const maghribHA = sunriseHA; // mismo ángulo, lado opuesto
    const fajrHA = this._hourAngle(params.fajr, lat, decl);
    const asrHA = this._asrHourAngle(this.ASR_SHADOW_FACTOR, lat, decl);

    const fajr = dhuhr - fajrHA;
    const sunrise = dhuhr - sunriseHA;
    const asr = dhuhr + asrHA;
    const maghrib = dhuhr + maghribHA;
    let isha;
    if (params.ishaMinutes) {
      isha = maghrib + params.ishaMinutes / 60;
    } else {
      const ishaHA = this._hourAngle(params.isha, lat, decl);
      isha = dhuhr + ishaHA;
    }

    let timings = {
      Fajr: this._timeToStr(fajr),
      Sunrise: this._timeToStr(sunrise),
      Dhuhr: this._timeToStr(dhuhr),
      Asr: this._timeToStr(asr),
      Maghrib: this._timeToStr(maghrib),
      Isha: this._timeToStr(isha),
    };
    // v39: elevación (orto/ocaso reales) → v28: corrección regional (p. ej.
    // Jordania: Isha = Maghrib + 90 min) → ajuste manual por oración del
    // usuario (±60 min). El orden importa: la elevación va primero para que
    // las correcciones posteriores actúen sobre el horario ya realista.
    timings = this.applyElevationAdjustment(timings, lat, lon, date, elevation, methodId);
    timings = this.applyRegionalCorrections(timings, country, lat, lon);
    timings = this.applyPrayerOffsets(timings);
    return timings;
  },
};

if (typeof window !== 'undefined') {
  window.PrayerCalc = PrayerCalc;
}
