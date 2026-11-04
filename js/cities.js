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
  // v50: Santiago de Cuba y Holguín — misma tabla (Cities.LIST) y mismo
  // huso (America/Havana en DualTiming._tzFor) que La Habana. Cuba usa UN
  // SOLO huso horario oficial en todo el país (America/Havana, UTC-5/-4);
  // la diferencia real de varios minutos entre estas ciudades y La Habana
  // se debe SOLO a la longitud (cálculo solar), no al huso horario — igual
  // que ocurre, p. ej., entre Nueva York y Chicago dentro de su propio país.
  { id: 'santiago_de_cuba', name: 'Santiago de Cuba', ar: 'سانتياغو دي كوبا', country: 'Cuba',             countryAr: 'كوبا',               flag: '🇨🇺', lat: 20.0217,  lon: -75.8294 },
  { id: 'holguin',       name: 'Holguín',          ar: 'هولغين',           country: 'Cuba',               countryAr: 'كوبا',               flag: '🇨🇺', lat: 20.8869,  lon: -76.2592 },
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

  // ══ v132: تسمية الأراضي المحتلة ══
  // كل مكان تقع إحداثياته في فلسطين التاريخية أو يسمّيه المزوّد Israel /
  // Palestine يُعرض «فلسطين المحتلة» بعلمها، لا باسم الكيان.
  PALESTINE: ['israel', 'il', 'isr', 'state of israel', 'palestine', 'palestina', 'ps', 'pse',
    'palestinian territories', 'palestinian territory', 'occupied palestinian territory',
    'west bank', 'gaza', 'gaza strip', 'إسرائيل', 'اسرائيل', 'فلسطين', 'الضفة الغربية',
    'قطاع غزة', 'ישראל', 'palestina ocupada', 'occupied palestine', 'فلسطين المحتلة'],

  isPalestine(name) {
    if (!name) return false;
    const n = String(name).toLowerCase().trim()
      .replace(/^the\s+/, '').replace(/[.,;()]/g, '').replace(/\s+/g, ' ');
    return this.PALESTINE.indexOf(n) !== -1;
  },

  /** يضع العلم وعلَم «محتلة» على أي سجل بلده فلسطين أو الكيان. */
  _applyPalestine(c) {
    if (!c) return c;
    if (this.isPalestine(c.country) || this.isPalestine(c.countryAr)) {
      c.occupied = true;
      c.flag = '🇵🇸';
      c.countryAr = 'فلسطين المحتلة';
      c.country = 'Palestina ocupada';
    }
    return c;
  },

  /** نصّ البلد بلغة الواجهة، مع احترام التسمية. */
  countryText(c, lang) {
    if (!c) return '';
    const l = lang || (typeof currentLocale !== 'undefined' ? currentLocale : 'es');
    if (c.occupied || this.isPalestine(c.country) || this.isPalestine(c.countryAr)) {
      return l === 'ar' ? 'فلسطين المحتلة' : (l === 'en' ? 'Occupied Palestine' : 'Palestina ocupada');
    }
    return l === 'ar' ? (c.countryAr || c.country || '') : (c.country || c.countryAr || '');
  },

  /** يسمّي بلدًا خامًا (قادمًا من GPS أو خدمة خارجية) بالتسمية الصحيحة. */
  normalizeCountryName(name) {
    const l = (typeof currentLocale !== 'undefined' ? currentLocale : 'es');
    return this.countryText({ country: name, countryAr: name }, l);
  },

  byId(id) { if (!id) return null; return CITY_LIST.find(c => c.id === id) || null; },

  /**
   * v133: يضمن أن مدينة قادمة من البحث العالمي صارت في القائمة المحلية
   * (بلا تكرار)، حتى تعمل كل الدوال التي تعتمد `byId` — أهمها المدينة
   * الثانوية التي كانت تُحفظ بالمعرّف فقط ثم تعود null بعد إعادة التشغيل.
   */
  _ensureListed(city) {
    if (!city) return null;
    const lat = Number(city.lat != null ? city.lat : city.latitude);
    const lon = Number(city.lon != null ? city.lon : city.longitude);
    if (!isFinite(lat) || !isFinite(lon)) return null;
    const id = city.id || ('remote_' + lat.toFixed(4) + '_' + lon.toFixed(4));
    const found = CITY_LIST.find(c => c.id === id);
    if (found) return found;
    const entry = this._applyPalestine({
      id: id,
      name: String(city.name || city.ar || ''),
      ar: String(city.ar || city.name || ''),
      country: String(city.country || ''),
      countryAr: String(city.countryAr || city.country || ''),
      flag: city.flag && city.flag !== '🌍' ? city.flag : '📍',
      lat: lat, lon: lon,
      tz: city.tz || '',
      online: true,
    });
    CITY_LIST.push(entry);
    return entry;
  },

  /**
   * Ciudad de la lista más cercana a unas coordenadas (±0.15° ≈ ~15 km) o
   * null. IMPORTANTE: devuelve la de MENOR distancia, no la primera que
   * entre en el radio — Ramala (31.90, 35.20) y Jerusalén (31.77, 35.21)
   * están a menos de 15 km y ambas entraban, y quedarse con la primera
   * hacía que Ramala heredara el slug/horario de Jerusalén (uno de los
   * desfases reportados).
   */
  match(lat, lon) {
    try {
      const la = Number(lat), lo = Number(lon);
      if (!isFinite(la) || !isFinite(lo)) return null;
      let best = null, bestD = Infinity;
      for (const c of CITY_LIST) {
        const dLat = c.lat - la, dLon = c.lon - lo;
        if (Math.abs(dLat) > 0.15 || Math.abs(dLon) > 0.15) continue;
        const d = dLat * dLat + dLon * dLon;
        if (d < bestD) { bestD = d; best = c; }
      }
      return best;
    } catch (e) { return null; }
  },

  /** Etiqueta legible según el idioma actual: «اسم المدينة، البلد» o «Ciudad, País» */
  label(c) {
    if (!c) return '';
    const lang = (typeof currentLocale !== 'undefined' ? currentLocale : 'es');
    const isAr = lang === 'ar';
    const country = this.countryText(c, lang);
    const city = isAr ? (c.ar || c.name) : (c.name || c.ar);
    const flag = c.occupied ? '🇵🇸' : (c.flag || '📍');
    return country ? `${flag} ${city}${isAr ? '، ' : ', '}${country}` : `${flag} ${city}`;
  },

  /** Texto plano (sin bandera) para guardar como nombre de ubicación */
  plainName(c) {
    const isAr = (typeof currentLocale !== 'undefined' ? currentLocale : 'es') === 'ar';
    return isAr ? c.ar : c.name;
  },

  plainCountry(c) {
    return this.countryText(c, (typeof currentLocale !== 'undefined' ? currentLocale : 'es'));
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
   * v122: بحث في كل مدن العالم (Open-Meteo Geocoding — مجاني بلا مفتاح).
   * يُستخدم كتوسعة للقائمة المحلية عندما لا يجد البحث المحلي نتيجة.
   * @returns {Promise<Array>} مدن بالشكل {name, ar, country, countryAr, lat, lon, online:true}
   */
  async _fetchJson(url, ms) {
    if (typeof fetch !== 'function') return null;
    const opts = { cache: 'no-store', headers: { 'Accept': 'application/json' } };
    try { if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) opts.signal = AbortSignal.timeout(ms || 8000); } catch (e) {}
    try {
      const res = await fetch(url, opts);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { return null; }
  },

  _mk(o) {
    const lat = Number(o.lat), lon = Number(o.lon);
    if (!isFinite(lat) || !isFinite(lon)) return null;
    return this._applyPalestine({
      id: 'remote_' + (o.id || (lat.toFixed(4) + '_' + lon.toFixed(4))),
      name: o.name || '', ar: o.ar || o.name || '',
      country: o.country || '', countryAr: o.countryAr || o.country || '',
      admin: o.admin || '', lat: lat, lon: lon, latitude: lat, longitude: lon,
      tz: o.tz || '', flag: '🌍', online: true,
    });
  },

  /** Open-Meteo Geocoding — مدن وبلدات، تسميات بلغتين وأسماء المناطق. */
  async _remoteMeteo(q, lang) {
    const url = 'https://geocoding-api.open-meteo.com/v1/search?count=20&format=json'
      + '&language=' + lang + '&name=' + encodeURIComponent(q);
    const j = await this._fetchJson(url, 8000);
    return ((j && j.results) || []).map(r => this._mk({
      id: r.id, name: r.name, ar: lang === 'ar' ? r.name : '',
      country: r.country || '', admin: r.admin1 || '',
      lat: r.latitude, lon: r.longitude, tz: r.timezone || '',
    })).filter(Boolean);
  },

  /** Photon (Komoot) — قرى وأحياء وأماكن صغيرة، أسماء عربية حين تتوفر. */
  async _remotePhoton(q, lang) {
    const url = 'https://photon.komoot.io/api/?limit=15&lang=' + lang + '&q=' + encodeURIComponent(q);
    const j = await this._fetchJson(url, 9000);
    const fs = (j && j.features) || [];
    return fs.map(f => {
      const p = f.properties || {};
      const c = (f.geometry && f.geometry.coordinates) || [];
      const nm = p.name || p.city || p.town || p.village || p.street || '';
      const admin = p.state || p.county || p.city || '';
      return this._mk({
        id: (p.osm_id || '') + '_' + (p.osm_type || ''),
        name: nm, ar: nm, country: p.country || '', admin: admin,
        lat: c[1], lon: c[0], tz: '',
      });
    }).filter(r => r && r.name);
  },

  /** Nominatim (OpenStreetMap) — آخر شبكة أمان: أي مكان على الأرض. */
  async _remoteNominatim(q, lang) {
    const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=12&addressdetails=1'
      + '&accept-language=' + lang + '&q=' + encodeURIComponent(q);
    const j = await this._fetchJson(url, 9000);
    if (!Array.isArray(j)) return [];
    return j.map(r => {
      const a = r.address || {};
      const nm = r.name || a.city || a.town || a.village || a.hamlet || a.county || String(r.display_name || '').split(',')[0];
      return this._mk({
        id: r.osm_id, name: nm, ar: nm,
        country: a.country || '', admin: a.state || a.county || a.city || '',
        lat: r.lat, lon: r.lon, tz: '',
      });
    }).filter(Boolean);
  },

  /**
   * v132: بحث في كل مدن وأماكن الأرض — ثلاثة مزوّدات بالتتابع حتى ينجح أحدها،
   * لأن بعض الشبكات تحجب أحدها (Open-Meteo ثم Photon ثم Nominatim).
   */
  async remoteSearch(query) {
    const q = String(query || '').trim();
    if (q.length < 2) return [];
    const lang = (typeof currentLocale !== 'undefined' ? currentLocale : 'ar') === 'ar' ? 'ar' : 'en';
    let rows = [];
    try { rows = await this._remoteMeteo(q, lang); } catch (e) { rows = []; }
    if (!rows.length) { try { rows = await this._remotePhoton(q, lang); } catch (e) { rows = []; } }
    if (!rows.length) { try { rows = await this._remoteNominatim(q, lang); } catch (e) { rows = []; } }
    return rows;
  },

  /** الساعة الآن في مكان: بالمنطقة الزمنية إن توفرت، وإلا بفرق الشمس (CityClock). */
  clockFor(c) {
    try {
      if (c && c.tz) {
        return new Intl.DateTimeFormat('en-GB', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
      }
      if (typeof CityClock !== 'undefined' && CityClock.deltaMsFor) {
        const d = new Date(Date.now() + CityClock.deltaMsFor(c.lat, c.lon, new Date()));
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      }
    } catch (e) {}
    return '';
  },

  /** يعيّن مكانًا مدينةً للتطبيق (كل الصفحات) ثم يعيد رسم الصفحة الحالية. */
  applyCity(o) {
    const lat = Number(o && o.lat), lon = Number(o && o.lon);
    if (!isFinite(lat) || !isFinite(lon)) return;
    if (typeof LocationService === 'undefined' || !LocationService.setManual) return;
    LocationService.setManual(lat, lon, o.name || '', o.country || '');
    try { if (typeof Storage !== 'undefined' && Storage.clearPrayerCache) Storage.clearPrayerCache(); } catch (e) {}
    if (typeof AppState !== 'undefined') AppState.timings = null;
    try { if (typeof closeModal === 'function') closeModal(); } catch (e) {}
    if (typeof showToast === 'function') showToast('🌍 ' + (o.name || '') + (o.country ? ', ' + o.country : ''), 2200);
    try {
      const cur = (typeof Router !== 'undefined' && Router.current) ? Router.current.name : '';
      const r = (typeof Router !== 'undefined' && Router.current) ? Router.current.route : null;
      const box = document.getElementById('main-content');
      if (!box) return;
      if (cur === 'home' && typeof HomePage !== 'undefined') { HomePage.render(box); return; }
      if (r && r.page) {
        const m = r.method || 'render';
        if (typeof r.page[m] === 'function' && cur !== 'profile') { r.page[m](box, (Router.current.params || {})); return; }
      }
      if (typeof ProfilePage !== 'undefined' && ProfilePage.renderGroup) ProfilePage.renderGroup('prayer');
    } catch (e) {}
  },

  /**
   * v132: نافذة «التوقيت في أي مدينة» — بحث في كل العالم، ساعة كل نتيجة،
   * وزر لتعيينها مدينةً للتطبيق. كانت موجودة في نسخة APK سابقة وفُقدت.
   */
  openWorldSearch() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    const lang = (typeof currentLocale !== 'undefined' ? currentLocale : 'ar');
    const isAr = lang === 'ar';
    const T = (k, fb) => {
      try { const v = (typeof t === 'function') ? t(k) : ''; return (v && v !== k) ? v : fb; } catch (e) { return fb; }
    };

    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fas fa-earth-americas"></i> ${escapeHtml(T('worldTimeTitle', isAr ? 'التوقيت في أي مدينة' : 'Time anywhere'))}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="wt-body">
        <input type="search" id="wt-input" class="city-search-input" autocomplete="off"
               placeholder="${escapeAttr(T('worldTimeSearchPlaceholder', isAr ? 'اكتب اسم مدينة أو مكان…' : 'Type a city or place…'))}">
        <div class="city-world-hint"><i class="fas fa-earth-americas"></i> ${escapeHtml(T('worldTimeHint', isAr ? 'ابحث بأي لغة — مدن وقرى ومناطق من كل العالم' : 'Any language — cities, towns and places worldwide'))}</div>
        <div id="wt-list" class="city-picker-list"></div>
      </div>`;
    overlay.classList.remove('hidden');

    const list = content.querySelector('#wt-list');
    const inp = content.querySelector('#wt-input');
    let seq = 0, timer = null;

    const rowHtml = (c) => {
      const lat = Number(c.lat != null ? c.lat : c.latitude);
      const lon = Number(c.lon != null ? c.lon : c.longitude);
      const nm = isAr ? (c.ar || c.name) : (c.name || c.ar);
      const country = this.countryText(c, lang);
      const flag = c.occupied ? '🇵🇸' : (c.flag && c.flag !== '🌍' ? c.flag : '🌍');
      const clock = this.clockFor({ lat: lat, lon: lon, tz: c.tz });
      return `<div class="wt-row" data-lat="${lat}" data-lon="${lon}"
                   data-name="${escapeAttr(c.name || c.ar || '')}" data-country="${escapeAttr(country)}"
                   role="button" tabindex="0">
        <span class="wt-flag">${flag}</span>
        <span class="wt-main"><b>${escapeHtml(nm)}</b><small>${escapeHtml(country)}</small></span>
        <span class="wt-clock">${clock || '—'}</span>
        <span class="wt-set" data-wt-set="1" title="${escapeAttr(T('worldTimeUse', isAr ? 'تعيين' : 'Use'))}"><i class="fas fa-location-arrow"></i></span>
      </div>`;
    };

    const paint = (rows) => {
      if (!list) return;
      list.innerHTML = rows.length ? rows.map(rowHtml).join('')
        : `<div class="city-empty-note">${escapeHtml(T('worldTimeNoResults', isAr ? 'لا نتائج — تحقق من الإملاء أو الاتصال' : 'No results — check spelling or connection'))}</div>`;
    };

    const run = async (q) => {
      const s = String(q || '').trim();
      const local = this.search(s).slice(0, 8);
      paint(local);
      if (s.length < 2) return;
      const mine = ++seq;
      if (list) list.insertAdjacentHTML('beforeend',
        `<div class="city-remote-hint" id="wt-hint"><i class="fas fa-spinner fa-spin"></i> ${escapeHtml(T('worldTimeSearching', isAr ? 'جارٍ البحث…' : 'Searching…'))}</div>`);
      const remote = await this.remoteSearch(s);
      if (mine !== seq) return;
      const hint = content.querySelector('#wt-hint');
      if (hint) hint.remove();
      const known = new Set(local.map(x => this._norm(x.name || x.ar)));
      const extra = remote.filter(r => !known.has(this._norm(r.name)));
      if (extra.length) paint(local.concat(extra));
    };

    if (!content._wtBound) {
      content._wtBound = true;
      content.addEventListener('click', (ev) => {
        const set = ev.target.closest('[data-wt-set]');
        const row = set && set.closest('.wt-row');
        if (!row) return;
        ev.preventDefault();
        ev.stopPropagation();
        this.applyCity({
          lat: parseFloat(row.dataset.lat), lon: parseFloat(row.dataset.lon),
          name: row.dataset.name || '', country: row.dataset.country || '',
        });
      });
    }
    if (inp) {
      inp.addEventListener('input', () => {
        const v = inp.value;
        clearTimeout(timer);
        paint(this.search(v).slice(0, 8));
        timer = setTimeout(() => run(v), 320);
      });
      setTimeout(() => inp.focus(), 90);
    }
    run('');
  },

  /**
   * Selector de ciudad con buscador (modal). Reutiliza #modal-overlay/#modal-content.
   * @param {Object} opts { title, currentId, onSelect(city) }
   */
  openPicker(opts) {
    const { title, currentId, onSelect, onGps } = opts || {};
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;

    let remoteSeq = 0;
    let remoteTimer = null;
    const L3 = (ar, es, en) => {
      const l = (typeof currentLocale !== 'undefined' ? currentLocale : 'es');
      return l === 'ar' ? ar : (l === 'en' ? en : es);
    };
    const listBox = () => content.querySelector('#city-picker-list');
    const localRow = (x) => `
      <div class="modal-option city-option ${x.id === currentId ? 'selected' : ''}" data-city="${x.id}" data-local="1">
        ${escapeHtml(this.label(x))}
      </div>`;
    const remoteRow = (r) => `
      <div class="modal-option city-option city-online-option" data-remote="1"
           data-name="${escapeAttr(r.name)}" data-country="${escapeAttr(r.country || '')}"
           data-lat="${r.lat}" data-lon="${r.lon}">
        ${r.occupied ? '🇵🇸' : '🌍'} ${escapeHtml(r.name)}${r.admin ? ', ' + escapeHtml(r.admin) : ''}${this.countryText(r, (typeof currentLocale !== 'undefined' ? currentLocale : 'ar')) ? ' — ' + escapeHtml(this.countryText(r, (typeof currentLocale !== 'undefined' ? currentLocale : 'ar'))) : ''}
      </div>`;

    // تفويض واحد للنقر: يعمل مع كل النتائج المحلية والعالمية بعد كل تحديث
    const bindClicks = () => {
      const box = listBox();
      if (!box || box._bound) return;
      box._bound = true;
      box.addEventListener('click', (ev) => {
        const opt = ev.target.closest('.city-option');
        if (!opt) return;
        let city = null;
        if (opt.dataset.remote === '1') {
          const lat = parseFloat(opt.dataset.lat);
          const lon = parseFloat(opt.dataset.lon);
          city = {
            id: 'remote_' + lat + '_' + lon,
            name: opt.dataset.name, ar: opt.dataset.name,
            country: opt.dataset.country || '', countryAr: opt.dataset.country || '',
            lat: lat, lon: lon, latitude: lat, longitude: lon,
            flag: '🌍', online: true,
          };
        } else {
          city = this.byId(opt.dataset.city);
        }
        if (!city) return;
        closeModal();
        if (typeof onSelect === 'function') onSelect(city);
      });
    };

    // v130: البحث المحلي + بحث عالمي دائم في كل مدن الأرض (لا نتوقف عند 3 نتائج)
    const renderList = (query) => {
      const q = String(query || '').trim();
      const box = listBox();
      if (!box) return;
      bindClicks();
      if (remoteTimer) { clearTimeout(remoteTimer); remoteTimer = null; }
      if (q.length < 2) {
        const local = this.search(q);
        box.innerHTML = `<div class="city-group-label"><i class="fas fa-location-dot"></i> ${L3('مدن مقترحة', 'Ciudades frecuentes', 'Suggested cities')}</div>`
          + local.map(localRow).join('')
          + `<div class="city-empty-note">${L3('اكتب حرفين أو أكثر للبحث في كل مدن العالم', 'Escribe 2 letras o más para buscar en todo el mundo', 'Type 2+ letters to search every city worldwide')}</div>`;
        return;
      }
      const local = this.search(q);
      box.innerHTML = (local.length
        ? `<div class="city-group-label"><i class="fas fa-list"></i> ${L3('من قائمتك', 'En tu lista', 'In your list')}</div>` + local.map(localRow).join('')
        : '')
        + `<div class="city-group-label city-group-world"><i class="fas fa-earth-americas"></i> ${L3('كل مدن العالم', 'Todas las ciudades del mundo', 'All cities worldwide')}</div>`
        + `<div class="city-remote-hint" id="city-remote-hint"><i class="fas fa-spinner fa-spin"></i> ${L3('جارٍ البحث…', 'Buscando…', 'Searching…')}</div>`;
      const seq = ++remoteSeq;
      remoteTimer = setTimeout(() => {
        this.remoteSearch(q).then(rows => {
          if (seq !== remoteSeq) return;
          const hint = content.querySelector('#city-remote-hint');
          if (hint) hint.remove();
          const el = listBox();
          if (!el) return;
          const known = new Set(local.map(x => this._norm(x.name)));
          const extra = rows.filter(r => !known.has(this._norm(r.name)));
          if (!extra.length) {
            if (!local.length) el.insertAdjacentHTML('beforeend',
              `<div class="city-empty-note">${L3('لا نتائج — تحقق من الإملاء أو من اتصال الإنترنت', 'Sin resultados — revisa la ortografía o tu conexión', 'No results — check spelling or your connection')}</div>`);
            return;
          }
          el.insertAdjacentHTML('beforeend', extra.map(remoteRow).join(''));
        });
      }, 240);
    };

    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-title"><i class="fas fa-city"></i> ${escapeHtml(title || (t('chooseCity') || 'Elige una ciudad'))}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div style="padding:0 4px 4px;">
        ${typeof onGps === 'function' ? `
        <div class="modal-option city-option city-gps-option" id="city-picker-gps" role="button" tabindex="0">
          <i class="fas fa-location-crosshairs"></i>&nbsp; ${escapeHtml(t('useMyLocation') || 'تحديد موقعي تلقائيًا (GPS)')}
        </div>` : ''}
        <input type="search" id="city-picker-search" class="city-search-input"
               placeholder="${escapeAttr(t('searchWorld') || 'Buscar cualquier ciudad del mundo...')}" autocomplete="off">
        <div class="city-world-hint"><i class="fas fa-earth-americas"></i> ${escapeHtml(t('searchWorldHint') || '')}</div>
        <div id="city-picker-list" class="modal-options city-picker-list"></div>
      </div>
    `;
    overlay.classList.remove('hidden');

    const inp = content.querySelector('#city-picker-search');
    if (inp) {
      inp.addEventListener('input', () => renderList(inp.value));
      setTimeout(() => inp.focus(), 80);
    }
    const gpsEl = content.querySelector('#city-picker-gps');
    if (gpsEl && typeof onGps === 'function') {
      const fireGps = () => { closeModal(); onGps(); };
      gpsEl.addEventListener('click', fireGps);
      gpsEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fireGps(); }
      });
    }
    renderList('');
  },
};

if (typeof window !== 'undefined') {
  window.Cities = Cities;
  window.CITY_LIST = CITY_LIST;
}
