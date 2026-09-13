// 🕌 MuslimProCities — Tabla OFICIAL de páginas de ciudad de Muslim Pro (v36)
//
// Muslim Pro no expone API pública, pero cada ciudad tiene una página oficial
// en app.muslimpro.com con los horarios PRE-CALCULADOS de los próximos 7 días
// incrustados en el HTML (esos mismos números son los que muestra la app de
// Muslim Pro). Esta tabla mapea cada ciudad de la app (Cities.LIST) a su slug
// oficial, VERIFICADO una a una (2026-09-11) contra app.muslimpro.com:
//   • ciudad con slug → horarios EXACTOS, minuto a minuto, sin búsqueda web.
//   • sin slug (geolocalización libre) → se resuelve dinámicamente
//     (Nominatim + DuckDuckGo) como antes, en MuslimProSync.
//
// Cada entrada puede llevar también `offsets`: corrección por ciudad (en
// minutos, por oración) que reproduce EXACTAMENTE lo que publica Muslim Pro
// cuando el respaldo Aladhan diverge en ±1-3 min (Shuruk/Maghrib/Isha, p.
// ej. Madrid: Muslim Pro publica Dhuhr 14:13 frente a 14:11 de Aladhan).
// Solo se usan cuando la vía directa de Muslim Pro no está disponible.
const MP_CITY_SLUGS = {
  // ─── América Latina ───
  havana:         { slug: 'prayer-times/cuba/prayer-times-havana/3553478' },
  mexico_city:    { slug: 'prayer-times/mexico/prayer-times-mexico-city/3530597' },
  guadalajara:    { slug: 'prayer-times/mexico/prayer-times-guadalajara/4005539' },
  monterrey:      { slug: 'prayer-times/mexico/prayer-times-monterrey/3995465' },
  bogota:         { slug: 'prayer-times/colombia/prayer-times-bogota/3688689' },
  medellin:       { slug: 'prayer-times/colombia/prayer-times-medellin/3674962' },
  cali:           { slug: 'prayer-times/colombia/prayer-times-cali/3687925' },
  buenos_aires:   { slug: 'prayer-times/argentina/prayer-times-buenos-aires/3435910' },
  cordoba_ar:     { slug: 'prayer-times/argentina/prayer-times-cordoba/3860259' },
  santiago:       { slug: 'prayer-times/chile/prayer-times-santiago/3871336' },
  lima:           { slug: 'prayer-times/peru/prayer-times-lima/3936456' },
  sao_paulo:      { slug: 'prayer-times/brazil/prayer-times-sao-paulo/3448439' },
  rio:            { slug: 'prayer-times/brazil/prayer-times-rio-de-janeiro/3451190' },
  brasilia:       { slug: 'prayer-times/brazil/prayer-times-brasilia/3469058' },
  caracas:        { slug: 'prayer-times/venezuela/prayer-times-caracas/3646738' },
  quito:          { slug: 'prayer-times/ecuador/prayer-times-quito/3652462' },
  guayaquil:      { slug: 'prayer-times/ecuador/prayer-times-guayaquil/3657509' },
  la_paz:         { slug: 'prayer-times/bolivia/prayer-times-la-paz/3911925' },
  asuncion:       { slug: 'prayer-times/paraguay/prayer-times-asuncion/3439389' },
  montevideo:     { slug: 'prayer-times/uruguay/prayer-times-montevideo/3441575' },
  panama:         { slug: 'prayer-times/panama/prayer-times-panama-city/3703443' },
  san_jose_cr:    { slug: 'prayer-times/costa-rica/prayer-times-san-jose/3621849' },
  san_salvador:   { slug: 'prayer-times/el-salvador/prayer-times-san-salvador/3583361' },
  guatemala:      { slug: 'prayer-times/guatemala/prayer-times-guatemala-city/3598132' },
  tegucigalpa:    { slug: 'prayer-times/honduras/prayer-times-tegucigalpa/3600949' },
  managua:        { slug: 'prayer-times/nicaragua/prayer-times-managua/3617763' },
  santo_domingo:  { slug: 'prayer-times/dominican-republic/prayer-times-santo-domingo/3492908' },
  san_juan:       { slug: 'prayer-times/puerto-rico/prayer-times-san-juan/4568127' },
  kingston:       { slug: 'prayer-times/jamaica/prayer-times-kingston/3489854' },
  port_au_prince: { slug: 'prayer-times/haiti/prayer-times-port-au-prince/3718426' },
  // ─── Europa ───
  madrid:         { slug: 'prayer-times/spain/prayer-times-madrid/3117735' },
  barcelona:      { slug: 'prayer-times/spain/prayer-times-barcelona/3128760' },
  paris:          { slug: 'prayer-times/france/prayer-times-paris/2988507' },
  marseille:      { slug: 'prayer-times/france/prayer-times-marseille/2995469' },
  london:         { slug: 'prayer-times/united-kingdom/prayer-times-london/2643743' },
  birmingham:     { slug: 'prayer-times/united-kingdom/prayer-times-birmingham/2655603' },
  berlin:         { slug: 'prayer-times/germany/prayer-times-berlin/2950159' },
  frankfurt:      { slug: 'prayer-times/germany/prayer-times-frankfurt/2925533' },
  rome:           { slug: 'prayer-times/italy/prayer-times-rome/3169070' },
  milan:          { slug: 'prayer-times/italy/prayer-times-milan/3173435' },
  amsterdam:      { slug: 'prayer-times/netherlands/prayer-times-amsterdam/2759794' },
  brussels:       { slug: 'prayer-times/belgium/prayer-times-brussels/2800866' },
  stockholm:      { slug: 'prayer-times/sweden/prayer-times-stockholm/2673730' },
  oslo:           { slug: 'prayer-times/norway/prayer-times-oslo/3143244' },
  copenhagen:     { slug: 'prayer-times/denmark/prayer-times-copenhagen/2618425' },
  vienna:         { slug: 'prayer-times/austria/prayer-times-vienna/2761369' },
  zurich:         { slug: 'prayer-times/switzerland/prayer-times-zurich/2657896' },
  geneva:         { slug: 'prayer-times/switzerland/prayer-times-geneva/2660646' },
  lisbon:         { slug: 'prayer-times/portugal/prayer-times-lisbon/2267057' },
  athens:         { slug: 'prayer-times/greece/prayer-times-athens/264371' },
  warsaw:         { slug: 'prayer-times/poland/prayer-times-warsaw/756135' },
  dublin:         { slug: 'prayer-times/ireland/prayer-times-dublin/2964574' },
  istanbul:       { slug: 'prayer-times/turkey/prayer-times-istanbul/745044' },
  ankara:         { slug: 'prayer-times/turkey/prayer-times-ankara/323786' },
  moscow:         { slug: 'prayer-times/russia/prayer-times-moscow/524901' },
  sarajevo:       { slug: 'prayer-times/bosnia-and-herzegovina/prayer-times-sarajevo/3191281' },
  // ─── EE. UU. y Canadá ───
  new_york:       { slug: 'prayer-times/united-states/prayer-times-new-york-city/5128581' },
  los_angeles:    { slug: 'prayer-times/united-states/prayer-times-los-angeles/5368361' },
  chicago:        { slug: 'prayer-times/united-states/prayer-times-chicago/4887398' },
  houston:        { slug: 'prayer-times/united-states/prayer-times-houston/4699066' },
  miami:          { slug: 'prayer-times/united-states/prayer-times-miami/4164138' },
  washington:     { slug: 'prayer-times/united-states/prayer-times-washington/4140963' },
  detroit:        { slug: 'prayer-times/united-states/prayer-times-detroit/4990729' },
  boston:         { slug: 'prayer-times/united-states/prayer-times-boston/4930956' },
  san_francisco:  { slug: 'prayer-times/united-states/prayer-times-san-francisco/5391959' },
  atlanta:        { slug: 'prayer-times/united-states/prayer-times-atlanta/4180439' },
  toronto:        { slug: 'prayer-times/canada/prayer-times-toronto/6167865' },
  montreal:       { slug: 'prayer-times/canada/prayer-times-montreal/6077243' },
  // ─── Jordania y Palestina ───
  amman:          { slug: 'prayer-times/jordan/prayer-times-amman/250441' },
  irbid:          { slug: 'prayer-times/jordan/prayer-times-irbid/248946' },
  zarqa:          { slug: 'prayer-times/jordan/prayer-times-zarqa/250090' },
  aqaba:          { slug: 'prayer-times/jordan/prayer-times-aqaba/250774' },
  jerusalem:      { slug: 'prayer-times/palestine-state-of/prayer-times-jerusalem/281184' },
  gaza:           { slug: 'prayer-times/palestine-state-of/prayer-times-gaza/281133' },
  ramallah:       { slug: 'prayer-times/palestine-state-of/prayer-times-ramallah/282239' },
  nablus:         { slug: 'prayer-times/palestine-state-of/prayer-times-nablus/282615' },
  hebron:         { slug: 'prayer-times/palestine-state-of/prayer-times-hebron/285066' },
  jaffa:          { slug: 'prayer-times/palestine-state-of/prayer-times-jaffa/293397' },
  haifa:          { slug: 'prayer-times/palestine-state-of/prayer-times-haifa/294801' },
  // ─── Golfo (y Haramayn) ───
  mecca:          { slug: 'prayer-times/saudi-arabia/prayer-times-mecca/104515' },
  medina:         { slug: 'prayer-times/saudi-arabia/prayer-times-medina/109223' },
  riyadh:         { slug: 'prayer-times/saudi-arabia/prayer-times-riyadh/108410' },
  jeddah:         { slug: 'prayer-times/saudi-arabia/prayer-times-jeddah/105343' },
  dammam:         { slug: 'prayer-times/saudi-arabia/prayer-times-dammam/110336' },
  doha:           { slug: 'prayer-times/qatar/prayer-times-doha/290030' },
  abu_dhabi:      { slug: 'prayer-times/united-arab-emirates/prayer-times-abu-dhabi/292968' },
  dubai:          { slug: 'prayer-times/united-arab-emirates/prayer-times-dubai/292223' },
  sharjah:        { slug: 'prayer-times/united-arab-emirates/prayer-times-sharjah/292672' },
  kuwait:         { slug: 'prayer-times/kuwait/prayer-times-kuwait-city/285787' },
  manama:         { slug: 'prayer-times/bahrain/prayer-times-manama/290340' },
  muscat:         { slug: 'prayer-times/oman/prayer-times-muscat/287286' },
  cairo:          { slug: 'prayer-times/egypt/prayer-times-cairo/360630' },
};

const MuslimProCities = {
  /**
   * Slug oficial de Muslim Pro para unas coordenadas, si coinciden con una
   * ciudad conocida de la app (±0.15° ≈ ~15 km). Sin coincidencia → null y
   * MuslimProSync resuelve dinámicamente como antes.
   */
  slugFor(lat, lng) {
    try {
      // v36.1: usar la ciudad MÁS CERCANA dentro de ±0.15° (no la primera
      // que coincida): Ramala y Jerusalén están a <15 km y quedarse con la
      // primera hacía que Ramala heredara el slug de Jerusalén (desfase
      // reportado). Delegar en Cities.match, que ya resuelve por distancia.
      const c = (typeof Cities !== 'undefined' && Cities.match) ? Cities.match(lat, lng) : null;
      if (!c) return null;
      const e = MP_CITY_SLUGS[c.id];
      return e ? e.slug : null;
    } catch (e) { /* silencioso */ }
    return null;
  },

  /** Id de ciudad conocida para unas coordenadas (o null). */
  cityIdFor(lat, lng) {
    try {
      const c = (typeof Cities !== 'undefined' && Cities.match) ? Cities.match(lat, lng) : null;
      return c ? c.id : null;
    } catch (e) { /* silencioso */ }
    return null;
  },
};

if (typeof window !== 'undefined') {
  window.MP_CITY_SLUGS = MP_CITY_SLUGS;
  window.MuslimProCities = MuslimProCities;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MP_CITY_SLUGS, MuslimProCities };
}
