/**
 * 🧭 Qibla Compass — High-Precision Qibla Bearing Calculation
 *
 * Implements:
 * - Great-circle bearing (spherical trigonometry) from user position to Kaaba
 * - Haversine distance formula for great-circle distance
 * - Magnetic declination correction (WMM model, simplified)
 * - Smoothing filter (EMA — Exponential Moving Average) for compass stability
 * - True North vs Magnetic North distinction
 * - Makkah detection (within 5 km)
 * - Direction cardinal name lookup (8-point + 16-point)
 *
 * Kaaba coordinates: 21.4225° N, 39.8262° E (Masjid al-Haram, Makkah)
 * Reference: https://www.movable-type.co.uk/scripts/latlong.html
 */

const Qibla = {
  // ============ COORDINATES ============
  KAABA: { lat: 21.4225, lng: 39.8262, name: 'Kaaba, Masjid al-Haram, Makkah' },

  // Radius of the Earth (mean, in km)
  EARTH_RADIUS_KM: 6371.0,

  // Makkah detection threshold (km) — if closer than this, user is "at the Qibla"
  MAKKAH_THRESHOLD_KM: 5,

  // ============ CORE MATHEMATICS ============

  /**
   * Compute initial great-circle bearing from a point to the Kaaba.
   *
   * Formula (spherical trigonometry / Rhumb line):
   *   θ = atan2( sin(Δλ) · cos(φ2),
   *              cos(φ1)·sin(φ2) − sin(φ1)·cos(φ2)·cos(Δλ) )
   *
   * Where:
   *   φ1, λ1 = user's latitude, longitude (radians)
   *   φ2, λ2 = Kaaba latitude, longitude (radians)
   *   Δλ    = λ2 − λ1
   *   θ    = initial bearing in radians (0 = true North, clockwise)
   *
   * Result is normalized to [0, 360) degrees.
   *
   * @param {number} userLat  User's latitude  in degrees
   * @param {number} userLng  User's longitude in degrees
   * @returns {number} Bearing in degrees, 0=North, 90=East, 180=South, 270=West
   */
  calculateBearing(userLat, userLng) {
    const toRad = d => d * Math.PI / 180;
    const toDeg = r => r * 180 / Math.PI;

    const φ1 = toRad(userLat);
    const φ2 = toRad(this.KAABA.lat);
    const Δλ = toRad(this.KAABA.lng - userLng);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  },

  /**
   * Haversine great-circle distance between two points.
   *
   * @param {number} lat1  Latitude  1 in degrees
   * @param {number} lng1  Longitude 1 in degrees
   * @param {number} lat2  Latitude  2 in degrees (default: Kaaba)
   * @param {number} lng2  Longitude 2 in degrees (default: Kaaba)
   * @returns {number} Distance in kilometers
   */
  distance(lat1, lng1, lat2 = this.KAABA.lat, lng2 = this.KAABA.lng) {
    const toRad = d => d * Math.PI / 180;
    const R = this.EARTH_RADIUS_KM;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lng2 - lng1);

    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Compute the angle the Qibla arrow should display relative to the device.
   *
   * arrowAngle = (qiblaBearing − deviceHeading) normalized to [0, 360)
   *
   * When arrowAngle ≈ 0° the user is facing the Qibla.
   *
   * @param {number} qiblaBearing  Bearing to Kaaba (degrees)
   * @param {number} deviceHeading Compass heading of device (degrees, true north)
   * @returns {number} Arrow angle in degrees [0, 360)
   */
  arrowAngle(qiblaBearing, deviceHeading) {
    return ((qiblaBearing - deviceHeading) % 360 + 360) % 360;
  },

  /**
   * Is the arrow within tolerance of pointing at the Qibla?
   *
   * @param {number} arrowAngle  Current arrow angle (degrees)
   * @param {number} tolerance   Acceptable deviation (degrees, default 5)
   * @returns {boolean}
   */
  isAligned(arrowAngle, tolerance = 5) {
    return arrowAngle <= tolerance || arrowAngle >= 360 - tolerance;
  },

  /**
   * Is the user currently in (or very near) Makkah?
   *
   * @param {number} lat
   * @param {number} lng
   * @returns {boolean}
   */
  isAtMakkah(lat, lng) {
    return this.distance(lat, lng) <= this.MAKKAH_THRESHOLD_KM;
  },

  // ============ MAGNETIC DECLINATION ============
  //
  // The device compass reads MAGNETIC north, but Qibla is referenced to TRUE north.
  // The angular difference is the "magnetic declination" (or "variation").
  // We need to add the local declination to convert:
  //   TrueHeading = MagneticHeading + Declination
  //
  // Declination is positive when magnetic north is east of true north.

  /**
   * Approximate magnetic declination for a given location and year.
   * Uses the WMM-2025 simplified model (piecewise coefficients per 10° zones).
   * Accurate to within ~1° for most of the world (±5° near poles).
   *
   * @param {number} lat   Latitude in degrees
   * @param {number} lng   Longitude in degrees
   * @param {number} [year] Current year (default: Date().getFullYear())
   * @returns {number} Declination in degrees (positive = East declination)
   */
  // 2025 magnetic declination grid (degrees, + = East), 15° resolution with
  // bilinear interpolation. Derived from NOAA WMM-2025 isogonic charts.
  // Typical accuracy ±2° in populated regions (worse near the magnetic poles).
  // NOTE: iOS (webkitCompassHeading) and Android "absolute" orientation events
  // bypass this table entirely — the OS applies the full WMM internally; this
  // table is only the fallback for raw magnetic headings.
  DECL_GRID: {
    step: 15,
    lats: [90, 75, 60, 45, 30, 15, 0, -15, -30, -45, -60, -75, -90],
    lons: [-180,-165,-150,-135,-120,-105,-90,-75,-60,-45,-30,-15,0,15,30,45,60,75,90,105,120,135,150,165,180],
    values: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],                                //  90°N
      [0,5,10,15,20,15,5,-5,-15,-20,-25,-15,-5,0,5,10,10,10,10,10,10,5,0,-5,0],            //  75°N
      [-10,-5,0,5,10,12,8,0,-8,-15,-20,-18,-2,5,10,10,8,5,2,0,-2,-5,-8,-10,-10],          //  60°N
      [-12,-10,-5,5,13,9,3,-13,-16,-18,-18,-2,1,3,7,8,6,4,2,-1,-4,-7,-9,-10,-12],         //  45°N
      [-10,-8,-2,3,11,8,0,-7,-12,-15,-16,-4,0,2,5,6,5,4,2,-1,-5,-7,-8,-9,-10],            //  30°N
      [-6,-4,0,5,9,5,-2,-7,-14,-15,-17,-12,-5,0,3,5,5,4,3,1,-1,-3,-4,-5,-6],              //  15°N
      [-4,-3,0,4,8,5,0,-5,-11,-15,-18,-14,-7,-2,2,4,4,3,2,1,0,-1,-2,-3,-4],               //   0°
      [-1,0,2,4,6,4,-2,-7,-12,-18,-21,-18,-12,-4,-10,-8,-4,0,2,3,3,4,5,4,2],              //  15°S
      [0,2,4,5,6,2,-4,0,-8,-18,-22,-21,-17,-14,-20,-15,-12,-8,-2,1,2,6,10,13,10],         //  30°S
      [8,9,9,8,6,0,-5,-6,-8,-13,-18,-20,-19,-16,-16,-14,-12,-10,-6,-1,4,8,11,20,18],      //  45°S
      [15,15,12,8,3,-2,-6,-8,-8,-10,-14,-16,-15,-13,-12,-10,-8,-6,-3,1,5,9,13,16,16],     //  60°S
      [10,8,5,2,0,-2,-4,-5,-5,-6,-8,-8,-8,-7,-6,-5,-4,-2,0,2,4,6,8,9,10],                 //  75°S
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],                                //  90°S
    ],
  },

  magneticDeclination(lat, lng) {
    const g = this.DECL_GRID;
    lat = Math.max(-90, Math.min(90, lat));
    lng = ((lng + 540) % 360) - 180; // normalize to [-180, 180)

    // Latitude band (grid lats are descending: 90 → -90)
    let i = 0;
    while (i < g.lats.length - 2 && lat < g.lats[i + 1]) i++;
    const latFrac = (g.lats[i] - lat) / g.step;

    // Longitude band
    let j = Math.floor((lng + 180) / g.step);
    if (j > g.lons.length - 2) j = g.lons.length - 2;
    const lngFrac = (lng + 180) / g.step - j;

    // Bilinear interpolation between the 4 surrounding grid points
    const v00 = g.values[i][j],     v01 = g.values[i][j + 1];
    const v10 = g.values[i + 1][j], v11 = g.values[i + 1][j + 1];
    const top = v00 + (v01 - v00) * lngFrac;
    const bot = v10 + (v11 - v10) * lngFrac;
    return top + (bot - top) * latFrac;
  },

  /**
   * Convert magnetic heading (from device sensor) to true heading.
   *
   * @param {number} magneticHeading  Heading in degrees from device compass
   * @param {number} lat               User latitude
   * @param {number} lng               User longitude
   * @returns {number} True heading in degrees
   */
  magneticToTrue(magneticHeading, lat, lng) {
    const decl = this.magneticDeclination(lat, lng);
    return (magneticHeading + decl + 360) % 360;
  },

  // ============ CARDINAL DIRECTIONS ============

  /**
   * Get localized cardinal direction name for a bearing.
   *
   * @param {number} bearing  Degrees 0-360
   * @param {string} lang     'es' | 'ar' | 'en'
   * @returns {{short:string, long:string}} Short (N, NE, ...) and long (North, Northeast, ...)
   */
  cardinalName(bearing, lang = 'en') {
    const directions = {
      en: {
        short: ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'],
        long:  ['North','North-Northeast','Northeast','East-Northeast','East','East-Southeast','Southeast','South-Southeast','South','South-Southwest','Southwest','West-Southwest','West','West-Northwest','Northwest','North-Northwest'],
      },
      es: {
        short: ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'],
        long:  ['Norte','Norte-Noreste','Noreste','Este-Noreste','Este','Este-Sureste','Sureste','Sur-Sureste','Sur','Sur-Suroeste','Suroeste','Oeste-Suroeste','Oeste','Oeste-Noroeste','Noroeste','Norte-Noroeste'],
      },
      ar: {
        short: ['ش','ش ش ق','ش ق','ق ش ق','ق','ق ج ق','ج ق','ج ج ق','ج','ج ج غ','ج غ','غ ج غ','غ','غ ش غ','ش غ','ش ش غ'],
        long:  ['شمال','شمال شمال شرق','شمال شرق','شرق شمال شرق','شرق','شرق جنوب شرق','جنوب شرق','جنوب جنوب شرق','جنوب','جنوب جنوب غرب','جنوب غرب','غرب جنوب غرب','غرب','غرب شمال غرب','شمال غرب','شمال شمال غرب'],
      },
    };
    const d = directions[lang] || directions.en;
    const idx = Math.round(bearing / 22.5) % 16;
    return { short: d.short[idx], long: d.long[idx] };
  },

  // ============ SMOOTHING (EMA filter) ============

  _smoothedHeading: null,
  _outlierCount: 0,
  _smoothingFactor: 0.10, // base EMA gain — lower = steadier needle
  OUTLIER_JUMP_DEG: 45,   // single-sample jumps larger than this are sensor glitches

  /**
   * Smooth compass heading with an ADAPTIVE Exponential Moving Average.
   *
   * Stability features:
   * - Circular interpolation (handles 359° → 0° wraparound).
   * - Outlier rejection: isolated spikes (magnetic interference from metal,
   *   electronics, cars) are ignored until confirmed by 3 consecutive
   *   consistent readings — only then does the filter resync.
   * - Adaptive gain: micro-jitter (< 2°) is filtered very hard (α = 0.04)
   *   so a resting needle is rock solid; normal motion uses the base gain;
   *   fast deliberate rotation stays responsive (α up to 0.30) so the
   *   needle never feels stuck.
   *
   * @param {number} newHeading  Latest reading in degrees
   * @param {number} [alpha]     Base smoothing gain (default 0.10)
   * @returns {number} Smoothed heading
   */
  smoothHeading(newHeading, alpha = this._smoothingFactor) {
    if (typeof newHeading !== 'number' || isNaN(newHeading)) {
      return this._smoothedHeading === null ? 0 : this._smoothedHeading;
    }
    newHeading = ((newHeading % 360) + 360) % 360;

    if (this._smoothedHeading === null) {
      this._smoothedHeading = newHeading;
      this._outlierCount = 0;
      return newHeading;
    }

    // Circular shortest-path delta
    let delta = newHeading - this._smoothedHeading;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // Outlier rejection — ignore glitches, resync only if persistent
    if (Math.abs(delta) > this.OUTLIER_JUMP_DEG) {
      this._outlierCount++;
      if (this._outlierCount < 3) return this._smoothedHeading;
      this._outlierCount = 0;
      this._smoothedHeading = newHeading;
      return newHeading;
    }
    this._outlierCount = 0;

    // Adaptive gain by motion magnitude
    const a = Math.abs(delta);
    const eff = a < 2 ? 0.04 : (a < 10 ? alpha : Math.min(0.30, alpha * 2.5));

    this._smoothedHeading = (this._smoothedHeading + eff * delta + 360) % 360;
    return this._smoothedHeading;
  },

  resetSmoothing() {
    this._smoothedHeading = null;
    this._outlierCount = 0;
  },

  // ============ FULL PIPELINE ============

  /**
   * Compute everything needed to render the Qibla compass in one call.
   *
   * @param {number} userLat  User latitude
   * @param {number} userLng  User longitude
   * @param {number} deviceHeading  Raw compass heading (magnetic)
   * @param {string} lang    'es' | 'ar' | 'en'
   * @returns {{
   *   qiblaBearing: number,
   *   distance: number,
   *   isAtMakkah: boolean,
   *   magneticDeclination: number,
   *   trueHeading: number,
   *   arrowAngle: number,
   *   aligned: boolean,
   *   cardinalShort: string,
   *   cardinalLong: string,
   * }}
   */
  compute(userLat, userLng, deviceHeading = 0, lang = 'en', isTrueHeading = false) {
    const bearing = this.calculateBearing(userLat, userLng);
    const dist = this.distance(userLat, userLng);
    const atMakkah = this.isAtMakkah(userLat, userLng);
    const decl = this.magneticDeclination(userLat, userLng);

    // deviceHeading arrives ALREADY SMOOTHED by the caller (no double filtering).
    // If the OS supplied a TRUE heading (iOS webkitCompassHeading or Android
    // absolute events) we must NOT add the declination a second time.
    const trueHeading = isTrueHeading
      ? ((deviceHeading % 360) + 360) % 360
      : (((deviceHeading + decl) % 360) + 360) % 360;

    const arrowAngle = this.arrowAngle(bearing, trueHeading);
    const aligned = this.isAligned(arrowAngle, 5);
    const cardinal = this.cardinalName(bearing, lang);

    return {
      qiblaBearing: bearing,
      distance: dist,
      isAtMakkah: atMakkah,
      magneticDeclination: decl,
      trueHeading,
      arrowAngle,
      aligned,
      cardinalShort: cardinal.short,
      cardinalLong: cardinal.long,
    };
  },
};

// Backwards-compat: expose as a global for inline handlers
if (typeof window !== 'undefined') {
  window.Qibla = Qibla;
}
