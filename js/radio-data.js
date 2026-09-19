// 📻 RadioData — قوائم الإذاعات والقراء والتلاوة المترجمة + نصوص الواجهة (AR/ES/EN)
// v56: الراديو الإسلامي — بث مباشر + تلاوة مترجمة (نص حي) + مؤقت النوم
// المصادر: MP3Quran API v3 (qurango.net) — everyayah.com (آية/آية) —
//          ترجمة García المحلية (ES، أوفلاين) — AlQuran Cloud (EN)
const RadioData = {

  // ============ نصوص الواجهة (ثلاثي اللغة، مستقل عن i18n.js) ============
  LOCALES: {
    ar: {
      radioTitle: 'الراديو الإسلامي',
      radioSubtitle: 'اسمع وتدبّر — بث مباشر وتلاوات على مدار الساعة',
      tabMain: 'الإذاعات الرئيسية',
      tabReciters: 'القرّاء',
      tabQiraat: 'القراءات العشر',
      tabTranslated: 'قرآن مترجم',
      tabExtra: 'أذكار ورقية وتكبيرات',
      tapToListen: 'اضغط للاستماع',
      nowPlaying: 'يُبث الآن',
      loading: 'جارٍ الاتصال بالبث…',
      playError: 'تعذّر الاتصال بالبث — تحقق من الإنترنت',
      sleepTimer: 'مؤقّت النوم',
      sleepOff: 'بدون مؤقّت',
      sleepMin: 'دقيقة',
      sleepActive: 'يتوقف بعد',
      share: 'مشاركة',
      shareMsg: 'أستمع الآن إلى',
      viaApp: 'عبر تطبيق Quba',
      chooseReciter: 'اختر القارئ',
      chooseLang: 'لغة الترجمة',
      spanish: 'الإسبانية',
      english: 'الإنجليزية',
      chooseSurah: 'اختر السورة',
      searchSurah: 'ابحث عن سورة…',
      ayah: 'آية',
      of: 'من',
      liveTranslation: 'الترجمة الحيّة',
      translationNote: 'التلاوة بالعربية وتظهر الترجمة النصية هنا متزامنة مع الآيات',
      replayAyah: 'إعادة الآية',
      prevAyah: 'الآية السابقة',
      nextAyah: 'التالية',
      live: 'مباشر',
      hubTitle: 'اسمع وتدبّر',
      hubReciters: 'القرّاء',
      hubRadio: 'الراديو',
      hubTasbih: 'السبحة',
      wisdomRadioDesc: 'بث مباشر · تلاوة مترجمة · رقية وتكبيرات',
      stationCairoDesc: 'بث مباشر ٢٤/٧ — إذاعة القرآن الكريم المصرية',
      sleepSetToast: 'سيتوقف التشغيل تلقائيًا',
      sleepCancelToast: 'تم إلغاء مؤقّت النوم',
      stopsAtEnd: 'سيتوقف الصوت عند انتهاء الوقت',
      continueBg: 'يستمر الصوت حتى مع إطفاء الشاشة',
    },
    es: {
      radioTitle: 'Radio Islámica',
      radioSubtitle: 'Escucha y reflexiona — en directo y recitaciones 24/7',
      tabMain: 'Emisoras principales',
      tabReciters: 'Recitadores',
      tabQiraat: 'Las Diez Lecturas',
      tabTranslated: 'Corán traducido',
      tabExtra: 'Adhkar, Ruqiah y Takbir',
      tapToListen: 'Toca para escuchar',
      nowPlaying: 'Sonando ahora',
      loading: 'Conectando con la emisora…',
      playError: 'No se pudo conectar — revisa tu conexión',
      sleepTimer: 'Temporizador de sueño',
      sleepOff: 'Sin temporizador',
      sleepMin: 'min',
      sleepActive: 'Se detiene en',
      share: 'Compartir',
      shareMsg: 'Estoy escuchando',
      viaApp: 'con la app Quba',
      chooseReciter: 'Elige el recitador',
      chooseLang: 'Idioma de la traducción',
      spanish: 'Español',
      english: 'English',
      chooseSurah: 'Elige la sura',
      searchSurah: 'Buscar sura…',
      ayah: 'Aleya',
      of: 'de',
      liveTranslation: 'Traducción en vivo',
      translationNote: 'Recitación en árabe con la traducción escrita sincronizada aquí',
      replayAyah: 'Repetir aleya',
      prevAyah: 'Aleya anterior',
      nextAyah: 'Siguiente',
      live: 'EN VIVO',
      hubTitle: 'Escucha y reflexiona',
      hubReciters: 'Recitadores',
      hubRadio: 'Radio',
      hubTasbih: 'Tasbih',
      wisdomRadioDesc: 'Directo · Corán traducido · Ruqiah y Takbir',
      stationCairoDesc: 'Directo 24/7 — Radio del Corán de Egipto',
      sleepSetToast: 'La reproducción se detendrá sola',
      sleepCancelToast: 'Temporizador cancelado',
      stopsAtEnd: 'El audio se detendrá al acabar el tiempo',
      continueBg: 'El audio continúa aunque apagues la pantalla',
    },
    en: {
      radioTitle: 'Islamic Radio',
      radioSubtitle: 'Listen & reflect — live streams and recitations 24/7',
      tabMain: 'Main stations',
      tabReciters: 'Reciters',
      tabQiraat: 'The Ten Readings',
      tabTranslated: 'Translated Quran',
      tabExtra: 'Adhkar, Ruqyah & Takbir',
      tapToListen: 'Tap to listen',
      nowPlaying: 'Now playing',
      loading: 'Connecting to stream…',
      playError: 'Could not connect — check your connection',
      sleepTimer: 'Sleep timer',
      sleepOff: 'No timer',
      sleepMin: 'min',
      sleepActive: 'Stops in',
      share: 'Share',
      shareMsg: 'I am listening to',
      viaApp: 'via the Quba app',
      chooseReciter: 'Choose reciter',
      chooseLang: 'Translation language',
      spanish: 'Spanish',
      english: 'English',
      chooseSurah: 'Choose a surah',
      searchSurah: 'Search surah…',
      ayah: 'Ayah',
      of: 'of',
      liveTranslation: 'Live translation',
      translationNote: 'Arabic recitation with the written translation synced here',
      replayAyah: 'Replay ayah',
      prevAyah: 'Previous ayah',
      nextAyah: 'Next',
      live: 'LIVE',
      hubTitle: 'Listen & Reflect',
      hubReciters: 'Reciters',
      hubRadio: 'Radio',
      hubTasbih: 'Tasbih',
      wisdomRadioDesc: 'Live · Translated Quran · Ruqyah & Takbir',
      stationCairoDesc: 'Live 24/7 — Egypt Quran Radio',
      sleepSetToast: 'Playback will stop automatically',
      sleepCancelToast: 'Sleep timer cancelled',
      stopsAtEnd: 'Audio will stop when time is up',
      continueBg: 'Audio keeps playing even with the screen off',
    },
  },

  L(key) {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    const loc = this.LOCALES[l] ? l : (l === 'ar' ? 'ar' : (l === 'en' ? 'en' : 'es'));
    return (this.LOCALES[loc] && this.LOCALES[loc][key]) || this.LOCALES.es[key] || this.LOCALES.ar[key] || key;
  },

  // صور الخلفيات (CC/متحقق من ترخيصها عبر بحث الصور)
  IMG: {
    kaaba: 'https://sspark.genspark.ai/i/Lr967kV2mA0RCIDl?width=1200',
    kaaba2: 'https://sspark.genspark.ai/i/sLdUKqseJBl60Yhv?width=1200',
    quran: 'https://sspark.genspark.ai/i/7AOKvZ7Zl2un2v8z?width=1200',
    quran2: 'https://sspark.genspark.ai/i/BPbgoCK2wl758OD1?width=1200',
    language: 'https://sspark.genspark.ai/i/X2HS5tYJf7wpiSOq?width=1200',
  },

  // ============ الإذاعات الرئيسية ============
  MAIN: [
    {
      id: 'cairo',
      name: { ar: 'إذاعة القرآن الكريم من القاهرة', es: 'Radio del Sagrado Corán — El Cairo', en: 'Holy Quran Radio — Cairo' },
      descKey: 'stationCairoDesc',
      url: 'https://stream.radiojar.com/0tpy1h0kxtzuv',
      img: 'kaaba',
    },
  ],

  // ============ القرّاء (بث متواصل ٢٤/٧ — MP3Quran / qurango) ============
  RECITERS: [
    { id: 'maher',    name: { ar: 'ماهر المعيقلي', es: 'Maher Al-Muaiqly', en: 'Maher Al-Muaiqly' },      url: 'https://backup.qurango.net/radio/maher', img: 'kaaba2' },
    { id: 'afasy',    name: { ar: 'مشاري راشد العفاسي', es: 'Mishary Alafasy', en: 'Mishary Alafasy' },   url: 'https://backup.qurango.net/radio/mishary_alafasi', img: 'quran' },
    { id: 'minshawi', name: { ar: 'محمد صديق المنشاوي', es: 'M. Siddiq Al-Minshawi', en: 'M. Siddiq Al-Minshawi' }, url: 'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi', img: 'quran2' },
    { id: 'minshawi_mj', name: { ar: 'المنشاوي (مجوَّد)', es: 'Al-Minshawi (Muyawwad)', en: 'Al-Minshawi (Mujawwad)' }, url: 'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi_mojawwad', img: 'quran' },
    { id: 'hussary',  name: { ar: 'محمود خليل الحصري', es: 'M. Khalil Al-Husary', en: 'M. Khalil Al-Husary' }, url: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary', img: 'kaaba' },
    { id: 'hussary_mj', name: { ar: 'الحصري (مجوَّد)', es: 'Al-Husary (Muyawwad)', en: 'Al-Husary (Mujawwad)' }, url: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary_mojawwad', img: 'kaaba2' },
    { id: 'tarateel', name: { ar: 'تراتيل قصيرة متميزة', es: 'Tarâteel cortas selectas', en: 'Short selected Tarateel' }, url: 'https://backup.qurango.net/radio/tarateel', img: 'quran2' },
  ],

  // ============ القراءات العشر (روايات) ============
  QIRAAT: [
    { id: 'hussary_warsh', name: { ar: 'الحصري — رواية ورش عن نافع', es: 'Al-Husary — Warsh an-Nafi', en: 'Al-Husary — Warsh an-Nafi' }, url: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary_warsh', img: 'quran' },
    { id: 'khalaf', name: { ar: 'عبدالله الخلف — قراءات وروايات', es: 'Abdullah Al-Khalaf — Lecturas', en: 'Abdullah Al-Khalaf — Readings' }, url: 'https://backup.qurango.net/radio/abdullah_alkhalaf', img: 'quran2' },
    // ملاحظة: يمكن إضافة المزيد من محطات الروايات (قالون، الدوري…) فور توفّرها في مصدر البث
  ],

  // ============ الأذكار والرقية الشرعية وتكبيرات العيد ============
  EXTRA: [
    { id: 'eid',    name: { ar: 'تكبيرات العيد', es: 'Takbirât del Eid', en: 'Eid Takbeer' },            url: 'https://backup.qurango.net/radio/eid', img: 'kaaba', badge: '🌙' },
    { id: 'roqiah', name: { ar: 'الرقية الشرعية', es: 'Ruqiah legal (sharʿí)', en: 'Ruqyah Shariah' },   url: 'https://backup.qurango.net/radio/roqiah', img: 'quran2', badge: '🤲' },
    { id: 'adhkar_s', name: { ar: 'أذكار الصباح', es: 'Adhkar de la mañana', en: 'Morning Adhkar' },     url: 'https://backup.qurango.net/radio/athkar_sabah', img: 'kaaba2', badge: '🌅' },
    { id: 'adhkar_m', name: { ar: 'أذكار المساء', es: 'Adhkar de la tarde', en: 'Evening Adhkar' },      url: 'https://backup.qurango.net/radio/athkar_masa', img: 'kaaba2', badge: '🌇' },
    { id: 'sira',   name: { ar: 'في ظلال السيرة النبوية', es: 'A la sombra de la Sîra', en: 'In the Shade of the Seerah' }, url: 'https://backup.qurango.net/radio/fi_zilal_alsiyra', img: 'quran', badge: '📜' },
    { id: 'sahabah', name: { ar: 'صور من حياة الصحابة', es: 'Escenas de la vida de los Compañeros', en: 'Scenes from the Companions’ lives' }, url: 'https://backup.qurango.net/radio/sahabah', img: 'quran2', badge: '🕌' },
  ],

  // ============ التلاوة المترجمة (آية/آية عبر everyayah — متحقق منه) ============
  AV_RECITERS: [
    { id: 'alafasy', folder: 'Alafasy_128kbps', name: { ar: 'مشاري راشد العفاسي', es: 'Mishary Alafasy', en: 'Mishary Alafasy' } },
    { id: 'abdulsamad', folder: 'AbdulSamad_64kbps_QuranExplorer.Com', name: { ar: 'عبد الباسط عبد الصمد', es: 'Abdul Basit Abdul Samad', en: 'Abdul Basit Abdul Samad' } },
  ],

  ayahUrl(folder, surah, ayah) {
    const p = (n) => String(n).padStart(3, '0');
    return `https://everyayah.com/data/${folder}/${p(surah)}${p(ayah)}.mp3`;
  },

  // [رقم، الاسم العربي، الاسم الإسباني، الاسم الإنجليزي، عدد الآيات]
  SURAHS: [
    [1,'الفاتحة','La Fatiha','Al-Fatihah',7],[2,'البقرة','La Vaca','Al-Baqarah',286],
    [3,'آل عمران','La Familia de Imran','Aal-Imran',200],[4,'النساء','Las Mujeres','An-Nisa',176],
    [5,'المائدة','La Mesa Servida','Al-Maidah',120],[6,'الأنعام','El Ganado','Al-Anam',165],
    [7,'الأعراف','Los Elevados','Al-Araf',206],[8,'الأنفال','El Botín','Al-Anfal',75],
    [9,'التوبة','El Arrepentimiento','At-Tawbah',129],[10,'يونس','Jonás','Yunus',109],
    [11,'هود','Hud','Hud',123],[12,'يوسف','José','Yusuf',111],
    [13,'الرعد','El Trueno','Ar-Rad',43],[14,'إبراهيم','Abraham','Ibrahim',52],
    [15,'الحجر','Al-Hiyr','Al-Hijr',99],[16,'النحل','Las Abejas','An-Nahl',128],
    [17,'الإسراء','El Viaje Nocturno','Al-Isra',111],[18,'الكهف','La Caverna','Al-Kahf',110],
    [19,'مريم','María','Maryam',98],[20,'طه','Ta-Ha','Ta-Ha',135],
    [21,'الأنبياء','Los Profetas','Al-Anbiya',112],[22,'الحج','La Peregrinación','Al-Hajj',78],
    [23,'المؤمنون','Los Creyentes','Al-Muminun',118],[24,'النور','La Luz','An-Nur',64],
    [25,'الفرقان','El Discernimiento','Al-Furqan',77],[26,'الشعراء','Los Poetas','Ash-Shuara',227],
    [27,'النمل','Las Hormigas','An-Naml',93],[28,'القصص','Los Relatos','Al-Qasas',88],
    [29,'العنكبوت','La Araña','Al-Ankabut',69],[30,'الروم','Los Bizantinos','Ar-Rum',60],
    [31,'لقمان','Luqmán','Luqman',34],[32,'السجدة','La Postración','As-Sajdah',30],
    [33,'الأحزاب','Los Aliados','Al-Ahzab',73],[34,'سبأ','Saba','Saba',54],
    [35,'فاطر','El Creador','Fatir',45],[36,'يس','Ya-Sin','Ya-Sin',83],
    [37,'الصافات','Los Alineados','As-Saffat',182],[38,'ص','Sad','Sad',88],
    [39,'الزمر','Los Grupos','Az-Zumar',75],[40,'غافر','El Perdonador','Ghafir',85],
    [41,'فصلت','Explicadas','Fussilat',54],[42,'الشورى','La Consulta','Ash-Shura',53],
    [43,'الزخرف','Los Ornamentos','Az-Zukhruf',89],[44,'الدخان','El Humo','Ad-Dukhan',59],
    [45,'الجاثية','De Rodillas','Al-Jaziyah',37],[46,'الأحقاف','Las Dunas','Al-Ahqaf',35],
    [47,'محمد','Mahoma','Muhammad',38],[48,'الفتح','La Victoria','Al-Fath',29],
    [49,'الحجرات','Las Habitaciones','Al-Hujurat',18],[50,'ق','Qaf','Qaf',45],
    [51,'الذاريات','Los Vientos','Az-Zariyat',60],[52,'الطور','El Monte','At-Tur',49],
    [53,'النجم','La Estrella','An-Najm',62],[54,'القمر','La Luna','Al-Qamar',55],
    [55,'الرحمن','El Misericordioso','Ar-Rahman',78],[56,'الواقعة','El Acontecimiento','Al-Waqiah',96],
    [57,'الحديد','El Hierro','Al-Hadid',29],[58,'المجادلة','La Discusión','Al-Muyadala',22],
    [59,'الحشر','La Reunión','Al-Hashr',24],[60,'الممتحنة','La Examinada','Al-Mumtahanah',13],
    [61,'الصف','Las Filas','As-Saff',14],[62,'الجمعة','El Viernes','Al-Yumuah',11],
    [63,'المنافقون','Los Hipócritas','Al-Munafiqun',11],[64,'التغابن','El Engaño','At-Tagabun',18],
    [65,'الطلاق','El Divorcio','At-Talaq',12],[66,'التحريم','La Prohibición','At-Tahrim',12],
    [67,'الملك','El Reino','Al-Mulk',30],[68,'القلم','La Pluma','Al-Qalam',52],
    [69,'الحاقة','La Verdad Inevitable','Al-Haqqah',52],[70,'المعارج','Los Grados','Al-Maariy',44],
    [71,'نوح','Noé','Nuh',28],[72,'الجن','Los Genios','Al-Yinn',28],
    [73,'المزمل','El Arropado','Al-Muzzammil',20],[74,'المدثر','El Envuelto','Al-Muddazzir',56],
    [75,'القيامة','La Resurrección','Al-Qiyamah',40],[76,'الإنسان','El Hombre','Al-Insan',31],
    [77,'المرسلات','Los Enviados','Al-Mursalat',50],[78,'النبأ','La Noticia','An-Naba',40],
    [79,'النازعات','Los Que Arrancan','An-Naziat',46],[80,'عبس','Frunció el Ceño','Abasa',42],
    [81,'التكوير','El Enrollamiento','At-Takwir',29],[82,'الانفطار','La Hendidura','Al-Infitar',19],
    [83,'المطففين','Los Defraudadores','Al-Mutaffifin',36],[84,'الانشقاق','El Resquebrajamiento','Al-Inshiqaq',25],
    [85,'البروج','Las Constelaciones','Al-Buruj',22],[86,'الطارق','El Asteroide','At-Tariq',17],
    [87,'الأعلى','El Altísimo','Al-Ala',19],[88,'الغاشية','La Que Todo lo Cubre','Al-Gashiyah',26],
    [89,'الفجر','El Alba','Al-Fayr',30],[90,'البلد','La Ciudad','Al-Balad',20],
    [91,'الشمس','El Sol','Ash-Shams',15],[92,'الليل','La Noche','Al-Layl',21],
    [93,'الضحى','La Mañana','Ad-Duha',11],[94,'الشرح','La Expansión','Ash-Sharh',8],
    [95,'التين','La Higuera','At-Tin',8],[96,'العلق','El Coágulo','Al-Alaq',19],
    [97,'القدر','El Decreto','Al-Qadr',5],[98,'البينة','La Prueba','Al-Bayyinah',8],
    [99,'الزلزلة','El Terremoto','Az-Zalzalah',8],[100,'العاديات','Los Corceles','Al-Adiyat',11],
    [101,'القارعة','La Calamidad','Al-Qariah',11],[102,'التكاثر','La Rivalidad','At-Takazur',8],
    [103,'العصر','La Tarde','Al-Asr',3],[104,'الهمزة','El Difamador','Al-Humazah',9],
    [105,'الفيل','El Elefante','Al-Fil',5],[106,'قريش','Quraysh','Quraish',4],
    [107,'الماعون','La Ayuda','Al-Maun',7],[108,'الكوثر','La Abundancia','Al-Kawzar',3],
    [109,'الكافرون','Los Incrédulos','Al-Kafirun',6],[110,'النصر','El Auxilio','An-Nasr',3],
    [111,'المسد','Las Fibras','Al-Masad',5],[112,'الإخلاص','La Pureza','Al-Ikhlas',4],
    [113,'الفلق','El Amanecer','Al-Falaq',5],[114,'الناس','Los Hombres','An-Nas',6],
  ],

  surahInfo(n) {
    const s = this.SURAHS.find(x => x[0] === n);
    if (!s) return { n, ar: 'سورة ' + n, es: 'Sura ' + n, en: 'Surah ' + n, ayahs: 0 };
    return { n: s[0], ar: s[1], es: s[2], en: s[3], ayahs: s[4] };
  },

  surahName(n) {
    const i = this.surahInfo(n);
    const l = (typeof currentLocale !== 'undefined' ? currentLocale : 'es');
    return l === 'ar' ? i.ar : (l === 'en' ? i.en : i.es);
  },

  // ============ النص العربي للآية (من المصحف المحلي، أوفلاين) ============
  _arIndex: null,
  arabicAyah(surah, ayah) {
    try {
      if (!this._arIndex) {
        this._arIndex = {};
        const pages = (typeof window !== 'undefined' && window.QURAN_FULL_AR && window.QURAN_FULL_AR.pages) || [];
        for (const p of pages) for (const a of (p.ayahs || [])) {
          this._arIndex[a[0] + ':' + a[1]] = a[2];
        }
      }
      return this._arIndex[surah + ':' + ayah] || '';
    } catch (e) { return ''; }
  },

  // ============ الترجمة النصية ============
  // ES: ترجمة García المحلية (data/garcia/{n}.json — أوفلاين ١٠٠٪)
  // EN: Sahih International عبر AlQuran Cloud (تُخزَّن في localStorage بعد أول جلب)
  _trMem: {},
  async getTranslation(surah, lang) {
    const key = lang + '_' + surah;
    if (this._trMem[key]) return this._trMem[key];
    let out = null;
    try {
      if (lang === 'es' && typeof GarciaData !== 'undefined' && GarciaData.getSurahTranslation) {
        out = await GarciaData.getSurahTranslation(surah);
      } else if (lang === 'es') {
        const r = await fetch(`data/garcia/${surah}.json`);
        out = await r.json();
      } else {
        const cacheKey = 'radio_tr_en_' + surah;
        const cached = (typeof Storage !== 'undefined' && Storage.get) ? Storage.get(cacheKey) : null;
        if (cached) { out = cached; }
        else {
          const r = await fetch(`https://api.alquran.cloud/v1/surah/${surah}/en.sahih`);
          const j = await r.json();
          out = (j.data.ayahs || []).map(a => ({ ayah: a.numberInSurah, text: a.text }));
          if (typeof Storage !== 'undefined' && Storage.set) Storage.set(cacheKey, out);
          else try { localStorage.setItem('quba_' + cacheKey, JSON.stringify(out)); } catch (e) {}
        }
      }
    } catch (e) { console.warn('RadioData.getTranslation:', e); }
    // تحويل إلى خريطة رقم الآية → النص
    let map = null;
    if (Array.isArray(out)) {
      map = {};
      out.forEach(t => { map[t.ayah] = t.text; });
    }
    this._trMem[key] = map;
    return map;
  },

  name(station) {
    const l = (typeof currentLocale !== 'undefined' ? currentLocale : 'es');
    return station.name[l] || station.name.es || station.name.ar;
  },
};
