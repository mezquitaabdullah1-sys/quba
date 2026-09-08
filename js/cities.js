// 🌍 Cities — Lista ampliada de ciudades (América Latina y sus capitales,
// principales ciudades de Europa, EE. UU./Canadá, Jordania, Palestina y el
// Golfo) + selector con buscador. Se usa tanto para la ubicación principal
// (perfil) como para el horario secundario de la pantalla de inicio.
//
// Cada ciudad: { id, name (latín), ar (nombre árabe), country, countryAr,
//                flag, lat, lon }
const CITY_LIST = [
  // ─── América Latina (capitales y ciudades principales) ───
  { id: 'havana',        name: 'La Habana',        ar: 'هافانا',           country: 'Cuba',               countryAr: 'كوبا',               flag: '🇨🇺', lat: 23.1136,  lon: -82.3666 },
  { id: 'mexico_city',   name: 'Ciudad de México', ar: 'مكسيكو سيتي',      country: 'México',             countryAr: 'المكسيك',            flag: '🇲🇽', lat: 19.4326,  lon: -99.1332 },
  { id: 'guadalajara',   name: 'Guadalajara',      ar: 'غوادالاخارا',      country: 'México',             countryAr: 'المكسيك',            flag: '🇲🇽', lat: 20.6597,  lon: -103.3496 },
  { id: 'monterrey',     name: 'Monterrey',        ar: 'مونتيري',          country: 'México',             countryAr: 'المكسيك',            flag: '🇲🇽', lat: 25.6866,  lon: -100.3161 },
  { id: 'bogota',        name: 'Bogotá',           ar: 'بوغوتا',           country: 'Colombia',           countryAr: 'كولومبيا',           flag: '🇨🇴', lat: 4.7110,   lon: -74.0721 },
  { id: 'medellin',      name: 'Medellín',         ar: 'ميديين',           country: 'Colombia',           countryAr: 'كولومبيا',           flag: '🇨🇴', lat: 6.2442,   lon: -75.5812 },
  { id: 'cali',          name: 'Cali',             ar: 'كالي',             country: 'Colombia',           countryAr: 'كولومبيا',           flag: '🇨🇴', lat: 3.4516,   lon: -76.5320 },
  { id: 'buenos_aires',  name: 'Buenos Aires',     ar: 'بوينس آيرس',       country: 'Argentina',          countryAr: 'الأرجنتين',          flag: '🇦🇷', lat: -34.6037, lon: -58.3816 },
  { id: 'cordoba_ar',    name: 'Córdoba',          ar: 'قرطبة',            country: 'Argentina',          countryAr: 'الأرجنتين',          flag: '🇦🇷', lat: -31.4201, lon: -64.1888 },
  { id: 'santiago',      name: 'Santiago',         ar: 'سانتياغو',         country: 'Chile',              countryAr: 'تشيلي',              flag: '🇨🇱', lat: -33.4489, lon: -70.6693 },
  { id: 'lima',          name: 'Lima',             ar: 'ليما',             country: 'Perú',               countryAr: 'بيرو',               flag: '🇵🇪', lat: -12.0464, lon: -77.0428 },
  { id: 'sao_paulo',     name: 'São Paulo',        ar: 'ساو باولو',        country: 'Brasil',             countryAr: 'البرازيل',           flag: '🇧🇷', lat: -23.5505, lon: -46.6333 },
  { id: 'rio',           name: 'Río de Janeiro',   ar: 'ريو دي جانيرو',    country: 'Brasil',             countryAr: 'البرازيل',           flag: '🇧🇷', lat: -22.9068, lon: -43.1729 },
  { id: 'brasilia',      name: 'Brasília',         ar: 'برازيليا',         country: 'Brasil',             countryAr: 'البرازيل',           flag: '🇧🇷', lat: -15.7939, lon: -47.8828 },
  { id: 'caracas',       name: 'Caracas',          ar: 'كاراكاس',          country: 'Venezuela',          countryAr: 'فنزويلا',            flag: '🇻🇪', lat: 10.4806,  lon: -66.9036 },
  { id: 'quito',         name: 'Quito',            ar: 'كيتو',             country: 'Ecuador',            countryAr: 'الإكوادور',          flag: '🇪🇨', lat: -0.1807,  lon: -78.4678 },
  { id: 'guayaquil',     name: 'Guayaquil',        ar: 'غواياكيل',         country: 'Ecuador',            countryAr: 'الإكوادور',          flag: '🇪🇨', lat: -2.1894,  lon: -79.8891 },
  { id: 'la_paz',        name: 'La Paz',           ar: 'لاباز',            country: 'Bolivia',            countryAr: 'بوليفيا',            flag: '🇧🇴', lat: -16.4897, lon: -68.1193 },
  { id: 'asuncion',      name: 'Asunción',         ar: 'أسونسيون',         country: 'Paraguay',           countryAr: 'باراغواي',           flag: '🇵🇾', lat: -25.2637, lon: -57.5759 },
  { id: 'montevideo',    name: 'Montevideo',       ar: 'مونتيفيديو',       country: 'Uruguay',            countryAr: 'أوروغواي',           flag: '🇺🇾', lat: -34.9011, lon: -56.1645 },
  { id: 'panama',        name: 'Ciudad de Panamá', ar: 'بنما سيتي',        country: 'Panamá',             countryAr: 'بنما',               flag: '🇵🇦', lat: 8.9824,   lon: -79.5199 },
  { id: 'san_jose_cr',   name: 'San José',         ar: 'سان خوسيه',        country: 'Costa Rica',         countryAr: 'كوستاريكا',          flag: '🇨🇷', lat: 9.9281,   lon: -84.0907 },
  { id: 'san_salvador',  name: 'San Salvador',     ar: 'سان سلفادور',      country: 'El Salvador',        countryAr: 'السلفادور',          flag: '🇸🇻', lat: 13.6929,  lon: -89.2182 },
  { id: 'guatemala',     name: 'Ciudad de Guatemala', ar: 'غواتيمالا سيتي', country: 'Guatemala',         countryAr: 'غواتيمالا',          flag: '🇬🇹', lat: 14.6349,  lon: -90.5069 },
  { id: 'tegucigalpa',   name: 'Tegucigalpa',      ar: 'تيغوسيغالبا',      country: 'Honduras',           countryAr: 'هندوراس',            flag: '🇭🇳', lat: 14.0723,  lon: -87.1921 },
  { id: 'managua',       name: 'Managua',          ar: 'ماناغوا',          country: 'Nicaragua',          countryAr: 'نيكاراغوا',          flag: '🇳🇮', lat: 12.1150,  lon: -86.2362 },
  { id: 'santo_domingo', name: 'Santo Domingo',    ar: 'سانتو دومينغو',    country: 'Rep. Dominicana',    countryAr: 'جمهورية الدومينيكان', flag: '🇩🇴', lat: 18.4861,  lon: -69.9312 },
  { id: 'san_juan',      name: 'San Juan',         ar: 'سان خوان',         country: 'Puerto Rico',        countryAr: 'بورتوريكو',          flag: '🇵🇷', lat: 18.4655,  lon: -66.1057 },
  { id: 'kingston',      name: 'Kingston',         ar: 'كينغستون',         country: 'Jamaica',            countryAr: 'جامايكا',            flag: '🇯🇲', lat: 18.0179,  lon: -76.8099 },
  { id: 'port_au_prince', name: 'Port-au-Prince',  ar: 'بورت أو برنس',     country: 'Haití',              countryAr: 'هايتي',              flag: '🇭🇹', lat: 18.5944,  lon: -72.3074 },

  // ─── Europa (ciudades principales) ───
  { id: 'madrid',        name: 'Madrid',           ar: 'مدريد',            country: 'España',             countryAr: 'إسبانيا',            flag: '🇪🇸', lat: 40.4168,  lon: -3.7038 },
  { id: 'barcelona',     name: 'Barcelona',        ar: 'برشلونة',          country: 'España',             countryAr: 'إسبانيا',            flag: '🇪🇸', lat: 41.3851,  lon: 2.1734 },
  { id: 'paris',         name: 'París',            ar: 'باريس',            country: 'Francia',            countryAr: 'فرنسا',              flag: '🇫🇷', lat: 48.8566,  lon: 2.3522 },
  { id: 'marseille',     name: 'Marsella',         ar: 'مرسيليا',          country: 'Francia',            countryAr: 'فرنسا',              flag: '🇫🇷', lat: 43.2965,  lon: 5.3698 },
  { id: 'london',        name: 'Londres',          ar: 'لندن',             country: 'Reino Unido',        countryAr: 'بريطانيا',           flag: '🇬🇧', lat: 51.5074,  lon: -0.1278 },
  { id: 'birmingham',    name: 'Birmingham',       ar: 'برمنغهام',         country: 'Reino Unido',        countryAr: 'بريطانيا',           flag: '🇬🇧', lat: 52.4862,  lon: -1.8904 },
  { id: 'berlin',        name: 'Berlín',           ar: 'برلين',            country: 'Alemania',           countryAr: 'ألمانيا',            flag: '🇩🇪', lat: 52.5200,  lon: 13.4050 },
  { id: 'frankfurt',     name: 'Fráncfort',        ar: 'فرانكفورت',        country: 'Alemania',           countryAr: 'ألمانيا',            flag: '🇩🇪', lat: 50.1109,  lon: 8.6821 },
  { id: 'rome',          name: 'Roma',             ar: 'روما',             country: 'Italia',             countryAr: 'إيطاليا',            flag: '🇮🇹', lat: 41.9028,  lon: 12.4964 },
  { id: 'milan',         name: 'Milán',            ar: 'ميلانو',           country: 'Italia',             countryAr: 'إيطاليا',            flag: '🇮🇹', lat: 45.4642,  lon: 9.1900 },
  { id: 'amsterdam',     name: 'Ámsterdam',        ar: 'أمستردام',         country: 'Países Bajos',       countryAr: 'هولندا',             flag: '🇳🇱', lat: 52.3676,  lon: 4.9041 },
  { id: 'brussels',      name: 'Bruselas',         ar: 'بروكسل',           country: 'Bélgica',            countryAr: 'بلجيكا',             flag: '🇧🇪', lat: 50.8503,  lon: 4.3517 },
  { id: 'stockholm',     name: 'Estocolmo',        ar: 'ستوكهولم',         country: 'Suecia',             countryAr: 'السويد',             flag: '🇸🇪', lat: 59.3293,  lon: 18.0686 },
  { id: 'oslo',          name: 'Oslo',             ar: 'أوسلو',            country: 'Noruega',            countryAr: 'النرويج',            flag: '🇳🇴', lat: 59.9139,  lon: 10.7522 },
  { id: 'copenhagen',    name: 'Copenhague',       ar: 'كوبنهاغن',         country: 'Dinamarca',          countryAr: 'الدنمارك',           flag: '🇩🇰', lat: 55.6761,  lon: 12.5683 },
  { id: 'vienna',        name: 'Viena',            ar: 'فيينا',            country: 'Austria',            countryAr: 'النمسا',             flag: '🇦🇹', lat: 48.2082,  lon: 16.3738 },
  { id: 'zurich',        name: 'Zúrich',           ar: 'زيورخ',            country: 'Suiza',              countryAr: 'سويسرا',             flag: '🇨🇭', lat: 47.3769,  lon: 8.5417 },
  { id: 'geneva',        name: 'Ginebra',          ar: 'جنيف',             country: 'Suiza',              countryAr: 'سويسرا',             flag: '🇨🇭', lat: 46.2044,  lon: 6.1432 },
  { id: 'lisbon',        name: 'Lisboa',           ar: 'لشبونة',           country: 'Portugal',           countryAr: 'البرتغال',           flag: '🇵🇹', lat: 38.7223,  lon: -9.1393 },
  { id: 'athens',        name: 'Atenas',           ar: 'أثينا',            country: 'Grecia',             countryAr: 'اليونان',            flag: '🇬🇷', lat: 37.9838,  lon: 23.7275 },
  { id: 'warsaw',        name: 'Varsovia',         ar: 'وارسو',            country: 'Polonia',            countryAr: 'بولندا',             flag: '🇵🇱', lat: 52.2297,  lon: 21.0122 },
  { id: 'dublin',        name: 'Dublín',           ar: 'دبلن',             country: 'Irlanda',            countryAr: 'أيرلندا',            flag: '🇮🇪', lat: 53.3498,  lon: -6.2603 },
  { id: 'istanbul',      name: 'Estambul',         ar: 'إسطنبول',          country: 'Turquía',            countryAr: 'تركيا',              flag: '🇹🇷', lat: 41.0082,  lon: 28.9784 },
  { id: 'ankara',        name: 'Ankara',           ar: 'أنقرة',            country: 'Turquía',            countryAr: 'تركيا',              flag: '🇹🇷', lat: 39.9334,  lon: 32.8597 },
  { id: 'moscow',        name: 'Moscú',            ar: 'موسكو',            country: 'Rusia',              countryAr: 'روسيا',              flag: '🇷🇺', lat: 55.7558,  lon: 37.6173 },
  { id: 'sarajevo',      name: 'Sarajevo',         ar: 'سراييفو',          country: 'Bosnia',             countryAr: 'البوسنة',            flag: '🇧🇦', lat: 43.8563,  lon: 18.4131 },

  // ─── EE. UU. y Canadá (ciudades principales) ───
  { id: 'new_york',      name: 'Nueva York',       ar: 'نيويورك',          country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 40.7128,  lon: -74.0060 },
  { id: 'los_angeles',   name: 'Los Ángeles',      ar: 'لوس أنجلوس',       country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 34.0522,  lon: -118.2437 },
  { id: 'chicago',       name: 'Chicago',          ar: 'شيكاغو',           country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 41.8781,  lon: -87.6298 },
  { id: 'houston',       name: 'Houston',          ar: 'هيوستن',           country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 29.7604,  lon: -95.3698 },
  { id: 'miami',         name: 'Miami',            ar: 'ميامي',            country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 25.7617,  lon: -80.1918 },
  { id: 'washington',    name: 'Washington D.C.',  ar: 'واشنطن',           country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 38.9072,  lon: -77.0369 },
  { id: 'detroit',       name: 'Detroit',          ar: 'ديترويت',          country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 42.3314,  lon: -83.0458 },
  { id: 'boston',        name: 'Boston',           ar: 'بوسطن',            country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 42.3601,  lon: -71.0589 },
  { id: 'san_francisco', name: 'San Francisco',    ar: 'سان فرانسيسكو',    country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 37.7749,  lon: -122.4194 },
  { id: 'atlanta',       name: 'Atlanta',          ar: 'أتلانتا',          country: 'EE. UU.',            countryAr: 'أمريكا',             flag: '🇺🇸', lat: 33.7490,  lon: -84.3880 },
  { id: 'toronto',       name: 'Toronto',          ar: 'تورونتو',          country: 'Canadá',             countryAr: 'كندا',               flag: '🇨🇦', lat: 43.6532,  lon: -79.3832 },
  { id: 'montreal',      name: 'Montreal',         ar: 'مونتريال',         country: 'Canadá',             countryAr: 'كندا',               flag: '🇨🇦', lat: 45.5017,  lon: -73.5673 },

  // ─── Jordania y Palestina ───
  { id: 'amman',         name: 'Amán',             ar: 'عمّان',             country: 'Jordania',           countryAr: 'الأردن',             flag: '🇯🇴', lat: 31.9539,  lon: 35.9106 },
  { id: 'irbid',         name: 'Irbid',            ar: 'إربد',             country: 'Jordania',           countryAr: 'الأردن',             flag: '🇯🇴', lat: 32.5568,  lon: 35.8469 },
  { id: 'zarqa',         name: 'Zarqa',            ar: 'الزرقاء',          country: 'Jordania',           countryAr: 'الأردن',             flag: '🇯🇴', lat: 32.0728,  lon: 36.0879 },
  { id: 'aqaba',         name: 'Aqaba',            ar: 'العقبة',           country: 'Jordania',           countryAr: 'الأردن',             flag: '🇯🇴', lat: 29.5321,  lon: 35.0063 },
  { id: 'jerusalem',     name: 'Jerusalén (Al-Quds)', ar: 'القدس',         country: 'Palestina',          countryAr: 'فلسطين',             flag: '🇵🇸', lat: 31.7683,  lon: 35.2137 },
  { id: 'gaza',          name: 'Gaza',             ar: 'غزة',              country: 'Palestina',          countryAr: 'فلسطين',             flag: '🇵🇸', lat: 31.5017,  lon: 34.4668 },
  { id: 'ramallah',      name: 'Ramala',           ar: 'رام الله',         country: 'Palestina',          countryAr: 'فلسطين',             flag: '🇵🇸', lat: 31.9038,  lon: 35.2034 },
  { id: 'nablus',        name: 'Nablus',           ar: 'نابلس',            country: 'Palestina',          countryAr: 'فلسطين',             flag: '🇵🇸', lat: 32.2226,  lon: 35.2622 },
  { id: 'hebron',        name: 'Hebrón (Al-Jalil)', ar: 'الخليل',          country: 'Palestina',          countryAr: 'فلسطين',             flag: '🇵🇸', lat: 31.5326,  lon: 35.0998 },
  { id: 'jaffa',         name: 'Yaffa',            ar: 'يافا',             country: 'Palestina',          countryAr: 'فلسطين',             flag: '🇵🇸', lat: 32.0544,  lon: 34.7522 },
  { id: 'haifa',         name: 'Haifa',            ar: 'حيفا',             country: 'Palestina',          countryAr: 'فلسطين',             flag: '🇵🇸', lat: 32.7940,  lon: 34.9896 },

  // ─── Golfo (y Haramayn) ───
  { id: 'mecca',         name: 'La Meca',          ar: 'مكة المكرمة',       country: 'Arabia Saudí',       countryAr: 'السعودية',           flag: '🇸🇦', lat: 21.4225,  lon: 39.8262 },
  { id: 'medina',        name: 'Medina',           ar: 'المدينة المنورة',   country: 'Arabia Saudí',       countryAr: 'السعودية',           flag: '🇸🇦', lat: 24.4672,  lon: 39.6111 },
  { id: 'riyadh',        name: 'Riad',             ar: 'الرياض',           country: 'Arabia Saudí',       countryAr: 'السعودية',           flag: '🇸🇦', lat: 24.7136,  lon: 46.6753 },
  { id: 'jeddah',        name: 'Yeda',             ar: 'جدة',              country: 'Arabia Saudí',       countryAr: 'السعودية',           flag: '🇸🇦', lat: 21.4858,  lon: 39.1925 },
  { id: 'dammam',        name: 'Dammam',           ar: 'الدمام',           country: 'Arabia Saudí',       countryAr: 'السعودية',           flag: '🇸🇦', lat: 26.4207,  lon: 50.0888 },
  { id: 'doha',          name: 'Doha',             ar: 'الدوحة',           country: 'Catar',              countryAr: 'قطر',                flag: '🇶🇦', lat: 25.2854,  lon: 51.5310 },
  { id: 'abu_dhabi',     name: 'Abu Dabi',         ar: 'أبوظبي',           country: 'Emiratos Árabes',    countryAr: 'الإمارات',           flag: '🇦🇪', lat: 24.4539,  lon: 54.3773 },
  { id: 'dubai',         name: 'Dubái',            ar: 'دبي',              country: 'Emiratos Árabes',    countryAr: 'الإمارات',           flag: '🇦🇪', lat: 25.2048,  lon: 55.2708 },
  { id: 'sharjah',       name: 'Sharjah',          ar: 'الشارقة',          country: 'Emiratos Árabes',    countryAr: 'الإمارات',           flag: '🇦🇪', lat: 25.3463,  lon: 55.4209 },
  { id: 'kuwait',        name: 'Ciudad de Kuwait', ar: 'مدينة الكويت',     country: 'Kuwait',             countryAr: 'الكويت',             flag: '🇰🇼', lat: 29.3759,  lon: 47.9774 },
  { id: 'manama',        name: 'Manama',           ar: 'المنامة',          country: 'Baréin',             countryAr: 'البحرين',            flag: '🇧🇭', lat: 26.2285,  lon: 50.5860 },
  { id: 'muscat',        name: 'Mascate',          ar: 'مسقط',             country: 'Omán',               countryAr: 'عُمان',              flag: '🇴🇲', lat: 23.5880,  lon: 58.3829 },

  // ─── Extra (compatibilidad con la lista anterior) ───
  { id: 'cairo',         name: 'El Cairo',         ar: 'القاهرة',          country: 'Egipto',             countryAr: 'مصر',                flag: '🇪🇬', lat: 30.0444,  lon: 31.2357 },
];

const Cities = {
  LIST: CITY_LIST,

  byId(id) { return CITY_LIST.find(c => c.id === id) || null; },

  /** Etiqueta legible según el idioma actual: «اسم المدينة، البلد» o «Ciudad, País» */
  label(c) {
    if (!c) return '';
    const isAr = (typeof currentLocale !== 'undefined' ? currentLocale : 'es') === 'ar';
    return isAr ? `${c.flag} ${c.ar}، ${c.countryAr}` : `${c.flag} ${c.name}, ${c.country}`;
  },

  /** Texto plano (sin bandera) para guardar como nombre de ubicación */
  plainName(c) {
    const isAr = (typeof currentLocale !== 'undefined' ? currentLocale : 'es') === 'ar';
    return isAr ? c.ar : c.name;
  },

  plainCountry(c) {
    const isAr = (typeof currentLocale !== 'undefined' ? currentLocale : 'es') === 'ar';
    return isAr ? c.countryAr : c.country;
  },

  _norm(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // quitar acentos latinos
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // quitar harakat, shadda, dagger alif y tatweel
      .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  },

  /** Búsqueda por nombre de ciudad o país, en latín o árabe */
  search(query) {
    const q = this._norm(query).trim();
    if (!q) return CITY_LIST;
    return CITY_LIST.filter(c =>
      this._norm(c.name).includes(q) ||
      this._norm(c.ar).includes(q) ||
      this._norm(c.country).includes(q) ||
      this._norm(c.countryAr).includes(q)
    );
  },

  /**
   * Selector de ciudad con buscador (modal). Reutiliza #modal-overlay/#modal-content.
   * @param {Object} opts { title, currentId, onSelect(city) }
   */
  openPicker(opts) {
    const { title, currentId, onSelect } = opts || {};
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;

    const renderList = (query) => {
      const results = this.search(query);
      const listEl = content.querySelector('#city-picker-list');
      if (!listEl) return;
      listEl.innerHTML = results.length
        ? results.map(c => `
            <div class="modal-option city-option ${c.id === currentId ? 'selected' : ''}" data-city="${c.id}">
              ${escapeHtml(this.label(c))}
            </div>`).join('')
        : `<div style="padding:16px;text-align:center;color:var(--text-secondary);font-size:13px;">—</div>`;
      listEl.querySelectorAll('.city-option').forEach(el => {
        el.addEventListener('click', () => {
          const city = this.byId(el.dataset.city);
          closeModal();
          if (city && typeof onSelect === 'function') onSelect(city);
        });
      });
    };

    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fas fa-city"></i> ${escapeHtml(title || (t('chooseCity') || 'Elige una ciudad'))}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div style="padding:0 4px 4px;">
        <input type="search" id="city-picker-search" class="city-search-input"
               placeholder="${escapeAttr(t('searchCity') || 'Buscar ciudad...')}" autocomplete="off">
        <div id="city-picker-list" class="modal-options city-picker-list"></div>
      </div>
    `;
    overlay.classList.remove('hidden');

    const inp = content.querySelector('#city-picker-search');
    if (inp) {
      inp.addEventListener('input', () => renderList(inp.value));
      setTimeout(() => inp.focus(), 80);
    }
    renderList('');
  },
};

if (typeof window !== 'undefined') {
  window.Cities = Cities;
  window.CITY_LIST = CITY_LIST;
}
