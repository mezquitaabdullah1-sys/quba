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
      translationNote: 'اختر القارئ ثم السورة — تظهر الآية بالعربية وترجمتها في بطاقة التشغيل متزامنةً مع التلاوة',
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
      stationJordanDesc: 'بث مباشر ٢٤/٧ — إذاعة القرآن الكريم الأردنية (عمّان)',
      stationPalestineDesc: 'بث مباشر ٢٤/٧ — إذاعة القرآن الكريم من نابلس، فلسطين',
      repeatMode: 'وضع الإعادة',
      rep_one: 'إعادة السورة',
      rep_all: 'إعادة الكل (تشغيل متواصل)',
      rep_random: 'اختيار عشوائي',
      availableSurahs: 'السور المتوفرة لهذا القارئ',
      sleepSetToast: 'سيتوقف التشغيل تلقائيًا',
      sleepCancelToast: 'تم إلغاء مؤقّت النوم',
      stopsAtEnd: 'سيتوقف الصوت عند انتهاء الوقت',
      continueBg: 'يستمر الصوت حتى مع إطفاء الشاشة',
      homeQuranRadio: 'إذاعة القرآن الكريم',
      homeQuranTranslated: 'القرآن مترجم',
      homeAdhkarAudio: 'الأذكار صوتياً',
      stationMixDesc: 'تلاوات متنوعة على مدار الساعة لعدد كبير من القرّاء',
      tabSleep: 'قرآن قبل النوم',
      sleepPlayAll: 'تشغيل قائمة النوم كاملة',
      sleepHint: 'تلاوات هادئة تساعد على النوم — يمكنك إضافة أصوات طبيعية خفيفة في الخلفية',
      ambTitle: 'أصوات خلفية لطيفة',
      ambOff: 'إيقاف الصوت',
      amb_rain: 'صوت المطر',
      amb_waves: 'صوت الأمواج',
      amb_wind: 'صوت الرياح',
      amb_white: 'ضوضاء بيضاء',
      voiceTr: 'قراءة الترجمة صوتيًا',
      voiceTrOn: 'الترجمة الصوتية مفعّلة — تُقرأ الترجمة بعد كل آية',
      voiceTrOff: 'الترجمة الصوتية متوقفة',
      // v1.0.74
      liveStream: 'بث مباشر',
      liveMujawwad: 'بث مباشر (مجوَّد)',
      pickSurah: 'اختيار سورة',
      noLive: 'لا يتوفر بث مباشر لهذا القارئ — اختر سورة',
      surahsCount: 'سورة',
      rep_off: 'بدون تكرار',
      rep_one_s: 'السورة',
      rep_all_s: 'متواصل',
      rep_random_s: 'عشوائي',
      rep_off_s: 'بدون',
      syncExact: 'مزامنة دقيقة مع التلاوة',
      syncApprox: 'مزامنة تقريبية (لا يتوفر توقيت رسمي لهذا القارئ)',
      surahUnavailable: 'هذه السورة غير متوفرة لهذا القارئ',
      reciterSurahs: 'سور القارئ',
      stopEnd: 'يتوقف بعد انتهاء السورة',
      download: 'تحميل',
      downloadingAudio: 'جارٍ تحميل التلاوة…',
      downloadDone: 'تم حفظ ملف التلاوة',
      downloadFail: 'تعذّر تحميل الملف',
      dlFailed: 'Failed to download {n} files',
      saveToDevice: 'Save to phone',
      saveAllDevice: 'Save all to phone',
      deviceSaved: 'Saved to Downloads',
      deviceFailed: 'Could not save to phone',
      noAudioYet: 'No stored audio yet',
      dlFailed: 'No se pudieron descargar {n} archivos',
      saveToDevice: 'Guardar en el teléfono',
      saveAllDevice: 'Guardar todo en el teléfono',
      deviceSaved: 'Guardado en Descargas',
      deviceFailed: 'No se pudo guardar en el teléfono',
      noAudioYet: 'Todavía no hay audio guardado',
      dlFailed: 'تعذّر تحميل {n} ملف',
      saveToDevice: 'حفظ على الجهاز',
      saveAllDevice: 'حفظ الكل على الجهاز',
      deviceSaved: 'تم الحفظ في مجلد التنزيلات',
      deviceFailed: 'تعذّر الحفظ على الجهاز',
      noAudioYet: 'لا يوجد صوت محفوظ بعد',
      dlTitle: 'القراءات المحمّلة',
      favTitle: 'المفضلة',
      dlEmpty: 'لا توجد قراءات محمّلة بعد',
      favEmpty: 'لا مفضّلات بعد — اضغط القلب على أي بطاقة',
      dlAllSurahs: 'تحميل كل السور',
      dlAllDone: 'اكتمل التحميل',
      dlCancel: 'إلغاء',
      dlStopped: 'أُوقف التحميل',
      dlAlready: 'محمّلة مسبقًا',
      favAdd: 'أضف إلى المفضلة',
      favRemove: 'إزالة من المفضلة',
      favAdded: 'أُضيف إلى المفضلة',
      favRemoved: 'أُزيل من المفضلة',
      playNow: 'تشغيل',
      favReciter: 'قارئ',
      downloaded: 'محمّلة',
      dlPlayLocal: 'تشغيل من الجهاز (دون إنترنت)',
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
      stationJordanDesc: 'Directo 24/7 — Radio del Corán de Jordania (Amán)',
      stationPalestineDesc: 'Directo 24/7 — Radio del Corán de Nablus, Palestina',
      repeatMode: 'Modo de repetición',
      rep_one: 'Repetir la sura',
      rep_all: 'Repetir todo (continuo)',
      rep_random: 'Aleatorio',
      availableSurahs: 'Suras disponibles de este recitador',
      sleepSetToast: 'La reproducción se detendrá sola',
      sleepCancelToast: 'Temporizador cancelado',
      stopsAtEnd: 'El audio se detendrá al acabar el tiempo',
      continueBg: 'El audio continúa aunque apagues la pantalla',
      homeQuranRadio: 'Radio del Corán',
      homeQuranTranslated: 'Corán traducido',
      homeAdhkarAudio: 'Adhkar en audio',
      stationMixDesc: 'Recitaciones variadas 24/7 de muchos recitadores',
      tabSleep: 'Corán antes de dormir',
      sleepPlayAll: 'Reproducir toda la lista para dormir',
      sleepHint: 'Recitaciones calmadas para conciliar el sueño — añade sonidos suaves de fondo',
      ambTitle: 'Sonidos de fondo suaves',
      ambOff: 'Detener sonido',
      amb_rain: 'Lluvia',
      amb_waves: 'Olas del mar',
      amb_wind: 'Viento',
      amb_white: 'Ruido blanco',
      voiceTr: 'Leer la traducción en voz alta',
      voiceTrOn: 'Traducción hablada activada — se lee tras cada aleya',
      voiceTrOff: 'Traducción hablada desactivada',
      // v1.0.74
      liveStream: 'En directo',
      liveMujawwad: 'En directo (muyawwad)',
      pickSurah: 'Elegir sura',
      noLive: 'Este recitador no tiene emisión en directo — elige una sura',
      surahsCount: 'suras',
      rep_off: 'Sin repetición',
      rep_one_s: 'Sura',
      rep_all_s: 'Continuo',
      rep_random_s: 'Aleatorio',
      rep_off_s: 'Sin',
      syncExact: 'Sincronización exacta con la recitación',
      syncApprox: 'Sincronización aproximada (sin tiempos oficiales para este recitador)',
      surahUnavailable: 'Esta sura no está disponible para este recitador',
      reciterSurahs: 'Suras del recitador',
      stopEnd: 'Se detiene al acabar la sura',
      download: 'Descargar',
      downloadingAudio: 'Descargando la recitación…',
      downloadDone: 'Archivo de recitación guardado',
      downloadFail: 'No se pudo descargar el archivo',
      dlTitle: 'Recitaciones descargadas',
      favTitle: 'Favoritos',
      dlEmpty: 'Todavía no hay recitaciones descargadas',
      favEmpty: 'Sin favoritos — toca el corazón en cualquier tarjeta',
      dlAllSurahs: 'Descargar todas las suras',
      dlAllDone: 'Descarga completada',
      dlCancel: 'Cancelar',
      dlStopped: 'Descarga detenida',
      dlAlready: 'Ya descargada',
      favAdd: 'Añadir a favoritos',
      favRemove: 'Quitar de favoritos',
      favAdded: 'Añadido a favoritos',
      favRemoved: 'Quitado de favoritos',
      playNow: 'Reproducir',
      favReciter: 'Recitador',
      downloaded: 'Descargada',
      dlPlayLocal: 'Reproducir desde el dispositivo (sin internet)',
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
      stationJordanDesc: 'Live 24/7 — Jordan Quran Radio (Amman)',
      stationPalestineDesc: 'Live 24/7 — Quran Radio Nablus, Palestine',
      repeatMode: 'Repeat mode',
      rep_one: 'Repeat surah',
      rep_all: 'Repeat all (continuous)',
      rep_random: 'Random shuffle',
      availableSurahs: 'Available surahs for this reciter',
      sleepSetToast: 'Playback will stop automatically',
      sleepCancelToast: 'Sleep timer cancelled',
      stopsAtEnd: 'Audio will stop when time is up',
      continueBg: 'Audio keeps playing even with the screen off',
      homeQuranRadio: 'Quran Radio',
      homeQuranTranslated: 'Translated Quran',
      homeAdhkarAudio: 'Adhkar audio',
      stationMixDesc: 'Recitations 24/7 by many reciters',
      tabSleep: 'Quran before sleep',
      sleepPlayAll: 'Play full sleep playlist',
      sleepHint: 'Calming recitations to fall asleep — add gentle nature sounds in the background',
      ambTitle: 'Gentle background sounds',
      ambOff: 'Stop sound',
      amb_rain: 'Rain',
      amb_waves: 'Ocean waves',
      amb_wind: 'Wind',
      amb_white: 'White noise',
      voiceTr: 'Read the translation aloud',
      voiceTrOn: 'Spoken translation on — read after each ayah',
      voiceTrOff: 'Spoken translation off',
      // v1.0.74
      liveStream: 'Live stream',
      liveMujawwad: 'Live stream (Mujawwad)',
      pickSurah: 'Choose surah',
      noLive: 'No live stream for this reciter — choose a surah',
      surahsCount: 'surahs',
      rep_off: 'No repeat',
      rep_one_s: 'Surah',
      rep_all_s: 'Continuous',
      rep_random_s: 'Shuffle',
      rep_off_s: 'Off',
      syncExact: 'Exact sync with the recitation',
      syncApprox: 'Approximate sync (no official timing for this reciter)',
      surahUnavailable: 'This surah is not available for this reciter',
      reciterSurahs: 'Reciter surahs',
      stopEnd: 'Stops when the surah ends',
      download: 'Download',
      downloadingAudio: 'Downloading recitation…',
      downloadDone: 'Recitation file saved',
      downloadFail: 'Could not download the file',
      dlTitle: 'Downloaded recitations',
      favTitle: 'Favorites',
      dlEmpty: 'No downloaded recitations yet',
      favEmpty: 'No favorites yet — tap the heart on any card',
      dlAllSurahs: 'Download all surahs',
      dlAllDone: 'Download complete',
      dlCancel: 'Cancel',
      dlStopped: 'Download stopped',
      dlAlready: 'Already downloaded',
      favAdd: 'Add to favorites',
      favRemove: 'Remove from favorites',
      favAdded: 'Added to favorites',
      favRemoved: 'Removed from favorites',
      playNow: 'Play',
      favReciter: 'Reciter',
      downloaded: 'Downloaded',
      dlPlayLocal: 'Play from device (offline)',
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
    // v1.0.74: صور الإذاعات المرفقة من المستخدم (محلية — تعمل أوفلاين)
    cairo: 'assets/radio/st_cairo.webp',
    jordan: 'assets/radio/st_jordan.webp',
    palestine: 'assets/radio/st_palestine.webp',
  },

  IMG_FALLBACK: 'assets/radio-placeholder.svg',

  imgUrl(key) { return (key && (this.IMG[key] || (/[\/.]/.test(key) ? key : ''))) || ''; },

  bgImage(url) {
    return url
      ? `url('${url}'), url('${this.IMG_FALLBACK}')`
      : `url('${this.IMG_FALLBACK}')`;
  },

  // ============ v1.0.74: روابط البث ============
  // qurango.net (الرئيسي) أولاً ثم backup.qurango.net احتياطياً — فُحص كلاهما:
  // backup يعيد 500 بشكل متقطع، والرئيسي يعيد 502 أحياناً؛ لذلك نجرّب الاثنين.
  qg(slug) { return ['https://qurango.net/radio/' + slug, 'https://backup.qurango.net/radio/' + slug]; },

  // قائمة الروابط المرشّحة لمحطة (تُجرَّب بالترتيب عند الفشل)
  streamCands(st) {
    if (!st) return [];
    if (st.slug) return this.qg(st.slug);
    const out = [];
    if (st.url) out.push(st.resolve ? { url: st.url, resolve: true } : st.url);
    (st.alts || []).forEach(u => out.push(u));
    return out;
  },

  // ============ الإذاعات الرئيسية ============
  MAIN: [
    {
      id: 'cairo',
      name: { ar: 'إذاعة القرآن الكريم من القاهرة', es: 'Radio del Sagrado Corán — El Cairo', en: 'Holy Quran Radio — Cairo' },
      descKey: 'stationCairoDesc',
      // v1.0.74 FIX: المعرّف السابق (0tpy1h0kxtzuv) كان «Saudi Quran Radio» وليس القاهرة.
      // radiojar يحوّل (302) إلى عقدة http:// تُحجب في التطبيق (https فقط) —
      // resolve=true: يُحلّ التحويل أصلياً وتُشغَّل العقدة نفسها عبر https.
      url: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
      resolve: true,
      img: 'cairo',
    },
    {
      id: 'jordan',
      name: { ar: 'إذاعة القرآن الكريم — الأردن', es: 'Radio del Corán — Jordania', en: 'Quran Radio — Jordan' },
      descKey: 'stationJordanDesc',
      url: 'https://jrtv-live.ercdn.net/jrradio/quranradio.m3u8',
      img: 'jordan',
    },
    {
      id: 'palestine',
      name: { ar: 'إذاعة القرآن الكريم — نابلس، فلسطين', es: 'Radio del Corán — Nablus, Palestina', en: 'Quran Radio — Nablus, Palestine' },
      descKey: 'stationPalestineDesc',
      // v1.0.74: البث الصوتي الرسمي للإذاعة (Shoutcast، صوت فقط) — رابط HLS
      // السابق بث فيديو ثقيل (~6Mbps) ويرفض الاتصالات الزائدة (503).
      url: 'https://quran-radio.org:8899/;',
      alts: ['https://streaming.zaytonatube.com:8081/holyquran/holyquran/index.m3u8'],
      img: 'palestine',
    },
    {
      id: 'mix',
      name: { ar: 'إذاعة التلاوات المتنوعة — لعدد من القرّاء', es: 'Emisora general — varios recitadores', en: 'General station — various reciters' },
      descKey: 'stationMixDesc',
      slug: 'mix',
      img: 'quran',
    },
  ],

  // ============ v1.0.74: القرّاء — قائمة موحّدة (بث مباشر + سور كاملة + آية/آية) ============
  // live:   محطات qurango الخاصة بالقارئ ({slug, k:'liveStream'|'liveMujawwad'})
  // server: مجلد MP3Quran للسور الكاملة (SSS.mp3) — تُستخدم في «اختيار سورة»
  // list:   السور المتوفرة (إن لم تكن ١١٤ كاملة)
  // read:   معرّف ayat_timing في MP3Quran (توقيت كل آية داخل ملف السورة)
  // ea:     مجلد everyayah.com (آية/آية) — مزامنة دقيقة للترجمة الحية
  // img:    صورة القارئ (من الصور المرفقة) — بدونها يظهر الحرف الأول
  RECITERS: [
    { id: 'dosari', name: { ar: 'ياسر الدوسري', es: 'Yasser Al-Dosari', en: 'Yasser Al-Dosari' }, img: 'assets/radio/r_dosari.webp',
      live: [{ slug: 'yasser_aldosari' }], server: 'https://cdn.mp3quran.net/audio/yasser-dosari/r1/', read: 92, ea: 'Yasser_Ad-Dussary_128kbps' },
    { id: 'luhaidan', name: { ar: 'محمد اللحيدان', es: 'Muhammad Al-Luhaidan', en: 'Muhammad Al-Luhaidan' }, img: 'assets/radio/r_luhaidan.webp',
      live: [{ slug: 'mohammed_allohaidan' }], server: 'https://cdn.mp3quran.net/audio/muhammad-luhaidan/r1/' },
    { id: 'nuaina', name: { ar: 'أحمد نعينع', es: 'Ahmad Nuaina', en: 'Ahmad Nuaina' }, img: 'assets/radio/r_nuaina.webp',
      live: [{ slug: 'ahmad_nauina' }], server: 'https://cdn.mp3quran.net/audio/ahmad-naina/r1/', read: 9, ea: 'Ahmed_Neana_128kbps' },
    { id: 'binhumaid', name: { ar: 'أحمد طالب بن حميد', es: 'Ahmad Talib bin Humaid', en: 'Ahmad Talib bin Humaid' }, img: 'assets/radio/r_binhumaid.webp',
      live: [{ slug: 'a_binhameed' }], server: 'https://cdn.mp3quran.net/audio/ahmad-humaid/r1/', read: 137,
      list: '1,2,3,4,5,6,7,8,10,11,12,13,15,18,19,20,21,22,25,26,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114' },
    { id: 'islam', name: { ar: 'إسلام صبحي', es: 'Islam Sobhi', en: 'Islam Sobhi' }, img: 'assets/radio/r_islam.webp',
      live: [], server: 'https://cdn.mp3quran.net/audio/islam-sobhi/r1/',
      list: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,38,41,42,43,44,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114' },
    { id: 'maher', name: { ar: 'ماهر المعيقلي', es: 'Maher Al-Muaiqly', en: 'Maher Al-Muaiqly' }, img: 'assets/radio/r_maher.webp',
      live: [{ slug: 'maher' }], server: 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/', ea: 'MaherAlMuaiqly128kbps' },
    { id: 'balushi', name: { ar: 'هزاع البلوشي', es: 'Hazza Al-Balushi', en: 'Hazza Al-Balushi' }, img: 'assets/radio/r_balushi.webp',
      live: [{ slug: 'hazza' }], server: 'https://cdn.mp3quran.net/audio/hazza-balushi/r1/',
      list: '1,6,8,12,13,14,15,17,18,19,20,21,22,25,29,30,31,32,34,35,36,37,38,39,40,41,42,43,44,45,46,47,49,50,51,52,53,54,55,56,57,61,63,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114' },
    { id: 'minshawi', name: { ar: 'محمد صديق المنشاوي', es: 'M. Siddiq Al-Minshawi', en: 'M. Siddiq Al-Minshawi' }, img: 'assets/radio/r_minshawi.webp',
      live: [{ slug: 'mohammed_siddiq_alminshawi' }, { slug: 'mohammed_siddiq_alminshawi_mojawwad', k: 'liveMujawwad' }],
      server: 'https://cdn.mp3quran.net/audio/muhammad-minshawi/r1/', read: 112, ea: 'Minshawy_Murattal_128kbps' },
    // v1.0.82: قراءة ثانية للمنشاوي — «المصحف المعلّم» (ترديد الطفل بعد كل آية).
    // المجلد مؤكَّد من واجهة MP3Quran البرمجية (moshaf «المصحف المعلم»، ١١٤ سورة).
    { id: 'minshawi_mlm', name: { ar: 'المنشاوي — المصحف المعلّم (ترديد الطفل)', es: 'M. Siddiq Al-Minshawi — Corán del maestro (el niño repite)', en: 'M. Siddiq Al-Minshawi — Teaching Quran (child repeats)' }, img: 'assets/radio/r_minshawi.webp',
      live: [], server: 'https://cdn.mp3quran.net/audio/muhammad-minshawi/r3/' },
    { id: 'hussary', name: { ar: 'محمود خليل الحصري', es: 'M. Khalil Al-Husary', en: 'M. Khalil Al-Husary' }, img: 'assets/radio/r_hussary.webp',
      live: [{ slug: 'mahmoud_khalil_alhussary' }, { slug: 'mahmoud_khalil_alhussary_mojawwad', k: 'liveMujawwad' }],
      server: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r1/', read: 118, ea: 'Husary_128kbps' },
    { id: 'abdulbasit', name: { ar: 'عبدالباسط عبدالصمد', es: 'Abdulbasit Abdulsamad', en: 'Abdulbasit Abdulsamad' }, img: 'assets/radio/r_abdulbasit.webp',
      live: [{ slug: 'abdulbasit_abdulsamad' }, { slug: 'abdulbasit_abdulsamad_mojawwad', k: 'liveMujawwad' }],
      server: 'https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3/', read: 53, ea: 'Abdul_Basit_Murattal_192kbps' },
    { id: 'banna', name: { ar: 'محمود علي البنا', es: 'Mahmoud Ali Al-Banna', en: 'Mahmoud Ali Al-Banna' }, img: 'assets/radio/r_banna.webp',
      live: [{ slug: 'mahmoud_ali__albanna' }, { slug: 'mahmoud_ali__albanna_mojawwad', k: 'liveMujawwad' }],
      server: 'https://cdn.mp3quran.net/audio/mahmoud-banna/r1/', ea: 'mahmoud_ali_al_banna_32kbps' },
    { id: 'sudais', name: { ar: 'عبدالرحمن السديس', es: 'Abdulrahman Al-Sudais', en: 'Abdulrahman Al-Sudais' }, img: 'assets/radio/r_sudais.webp',
      live: [{ slug: 'abdulrahman_alsudaes' }], server: 'https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1/', read: 54, ea: 'Abdurrahmaan_As-Sudais_192kbps' },
    { id: 'shuraim', name: { ar: 'سعود الشريم', es: 'Saud Al-Shuraim', en: 'Saud Al-Shuraim' }, img: 'assets/radio/r_shuraim.webp',
      live: [{ slug: 'saud_alshuraim' }], server: 'https://cdn.mp3quran.net/audio/saud-shuraim/r1/', read: 31, ea: 'Saood_ash-Shuraym_128kbps' },
    { id: 'ghamdi', name: { ar: 'سعد الغامدي', es: 'Saad Al-Ghamdi', en: 'Saad Al-Ghamdi' }, img: 'assets/radio/r_ghamdi.webp',
      live: [{ slug: 'saad_alghamdi' }], server: 'https://cdn.mp3quran.net/audio/saad-ghamdi/r1/', read: 30, ea: 'Ghamadi_40kbps' },
    { id: 'qatami', name: { ar: 'ناصر القطامي', es: 'Nasser Al-Qatami', en: 'Nasser Al-Qatami' }, img: 'assets/radio/r_qatami.webp',
      live: [{ slug: 'nasser_alqatami' }], server: 'https://cdn.mp3quran.net/audio/nasser-qatami/r1/', read: 86, ea: 'Nasser_Alqatami_128kbps' },
    { id: 'juhany', name: { ar: 'عبدالله عواد الجهني', es: 'Abdullah Awad Al-Juhany', en: 'Abdullah Awad Al-Juhany' }, img: 'assets/radio/r_juhany.webp',
      live: [{ slug: 'abdullah_aljohany' }], server: 'https://cdn.mp3quran.net/audio/abdullah-juhani/r1/', read: 62, ea: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps' },
    { id: 'ajmy', name: { ar: 'أحمد بن علي العجمي', es: 'Ahmed Al-Ajmi', en: 'Ahmed Al-Ajmi' }, img: 'assets/radio/r_ajmy.webp',
      live: [{ slug: 'ahmad_alajmy' }], server: 'https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/', read: 5, ea: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net' },
    { id: 'shatri', name: { ar: 'أبو بكر الشاطري', es: 'Abu Bakr Al-Shatri', en: 'Abu Bakr Al-Shatri' }, img: 'assets/radio/r_shatri.webp',
      live: [{ slug: 'shaik_abu_bakr_al_shatri' }], server: 'https://cdn.mp3quran.net/audio/abubakr-shatri/r1/', read: 4, ea: 'Abu_Bakr_Ash-Shaatree_128kbps' },
    { id: 'ayyub', name: { ar: 'محمد أيوب', es: 'Muhammad Ayyub', en: 'Muhammad Ayyub' }, img: 'assets/radio/r_ayyub.webp',
      live: [{ slug: 'mohammed_ayyub' }], server: 'https://cdn.mp3quran.net/audio/muhammad-ayyub/r1/', read: 109, ea: 'Muhammad_Ayyoub_128kbps' },
    { id: 'jibreel', name: { ar: 'محمد جبريل', es: 'Muhammad Jibreel', en: 'Muhammad Jibreel' }, img: 'assets/radio/r_jibreel.webp',
      live: [{ slug: 'mohammed_jibreel' }], server: 'https://cdn.mp3quran.net/audio/muhammad-jibreel/r1/', ea: 'Muhammad_Jibreel_128kbps' },
  ],

  reciter(id) { return this.RECITERS.find(r => r.id === id) || null; },

  // السور المتوفرة لقارئ (مصفوفة أرقام)
  surahsFor(r) {
    if (!r) return [];
    if (r._list) return r._list;
    r._list = r.list ? r.list.split(',').map(Number).filter(n => n >= 1 && n <= 114)
                     : Array.from({ length: 114 }, (_, i) => i + 1);
    return r._list;
  },

  hasSurah(r, n) { return this.surahsFor(r).indexOf(Number(n)) >= 0; },

  surahFileUrl(r, n) { return r && r.server ? r.server + String(n).padStart(3, '0') + '.mp3' : ''; },

  // المحطة (بث مباشر) لقارئ
  liveStation(r, i) {
    const lv = r && r.live && r.live[i || 0];
    if (!lv) return null;
    return { id: r.id + '_live' + (i || 0), slug: lv.slug, name: r.name, img: r.img, k: lv.k || 'liveStream', rid: r.id };
  },

  // الحروف الأولى للأفاتار الحرفي
  initials(r) {
    const n = (r && r.name && (r.name.ar || r.name.en)) || '';
    const w = n.replace(/^(ال)/, '').split(/\s+/).filter(Boolean);
    return (w[0] ? w[0][0] : '') + (w[1] ? w[1].replace(/^ال/, '')[0] : '');
  },

  avatarHtml(r, cls) {
    const c = cls || 'rc-av';
    if (r && r.img) return `<img class="${c}" src="${r.img}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;${c} rc-ini&quot;>${this.initials(r)}</span>'">`;
    return `<span class="${c} rc-ini">${this.initials(r)}</span>`;
  },

  // ============ الأذكار والرقية الشرعية وتكبيرات العيد والتراتيل ============
  EXTRA: [
    { id: 'eid',    name: { ar: 'تكبيرات العيد', es: 'Takbirât del Eid', en: 'Eid Takbeer' }, slug: 'eid', img: 'kaaba', badge: '🌙' },
    { id: 'roqiah', name: { ar: 'الرقية الشرعية', es: 'Ruqiah legal (sharʿí)', en: 'Ruqyah Shariah' }, slug: 'roqiah', img: 'quran2', badge: '🤲' },
    { id: 'adhkar_s', name: { ar: 'أذكار الصباح', es: 'Adhkar de la mañana', en: 'Morning Adhkar' }, slug: 'athkar_sabah', img: 'kaaba2', badge: '🌅' },
    { id: 'adhkar_m', name: { ar: 'أذكار المساء', es: 'Adhkar de la tarde', en: 'Evening Adhkar' }, slug: 'athkar_masa', img: 'kaaba2', badge: '🌇' },
    { id: 'tarateel', name: { ar: 'تراتيل قصيرة متميزة', es: 'Tarâteel cortas selectas', en: 'Short selected Tarateel' }, slug: 'tarateel', img: 'quran2', badge: '🎧' },
    { id: 'sira',   name: { ar: 'في ظلال السيرة النبوية', es: 'A la sombra de la Sîra', en: 'In the Shade of the Seerah' }, slug: 'fi_zilal_alsiyra', img: 'quran', badge: '📜' },
    { id: 'sahabah', name: { ar: 'صور من حياة الصحابة', es: 'Escenas de la vida de los Compañeros', en: 'Scenes from the Companions’ lives' }, slug: 'sahabah', img: 'quran2', badge: '🕌' },
  ],

  // ============ v58: قرآن قبل النوم — سور هادئة تُشغَّل بالتتابع ============
  SLEEP_SURAHS: [67, 32, 55, 56, 112, 113, 114],
  SLEEP_RECITER: 'dosari',

  ayahUrl(folder, surah, ayah) {
    const p = (n) => String(n).padStart(3, '0');
    if (/^https?:\/\//.test(folder)) return folder + p(surah) + p(ayah) + '.mp3';
    return `https://everyayah.com/data/${folder}/${p(surah)}${p(ayah)}.mp3`;
  },

  // ============ v1.0.74: توقيت الآيات داخل ملف السورة الكاملة ============
  // MP3Quran ayat_timing (CORS *) — [{ayah,start_time,end_time}] بالمللي ثانية.
  // يُخزَّن محلياً بعد أول جلب. للقرّاء غير المدعومين (اللحيدان، إسلام صبحي،
  // البلوشي...) نقدّر التوقيت تناسبياً مع طول نص كل آية (مزامنة تقريبية).
  _tmMem: {},
  async getTimings(read, surah) {
    if (!read || !surah) return null;
    const key = read + '_' + surah;
    if (this._tmMem[key]) return this._tmMem[key];
    const lsKey = 'quba_radio_tm_' + key;
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) { const v = JSON.parse(raw); if (Array.isArray(v) && v.length) { this._tmMem[key] = v; return v; } }
    } catch (e) {}
    try {
      const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const to = ctl ? setTimeout(() => ctl.abort(), 12000) : null;
      const r = await fetch(`https://www.mp3quran.net/api/v3/ayat_timing?surah=${surah}&read=${read}`, ctl ? { signal: ctl.signal } : undefined);
      if (to) clearTimeout(to);
      if (!r.ok) return null;
      const j = await r.json();
      const v = (Array.isArray(j) ? j : [])
        .filter(x => x && Number(x.ayah) >= 1)
        .map(x => [Number(x.ayah), Number(x.start_time) || 0, Number(x.end_time) || 0])
        .sort((a, b) => a[0] - b[0]);
      if (!v.length) return null;
      this._tmMem[key] = v;
      try { localStorage.setItem(lsKey, JSON.stringify(v)); } catch (e) {}
      return v;
    } catch (e) { return null; }
  },

  // تقدير تناسبي: [[ayah,start,end]...] لمدة إجمالية durMs
  estimateTimings(surah, durMs) {
    const info = this.surahInfo(surah);
    if (!info.ayahs || !durMs || durMs <= 0) return null;
    const strip = (t) => String(t || '').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\s]/g, '');
    const w = [];
    for (let i = 1; i <= info.ayahs; i++) w.push(Math.max(4, strip(this.arabicAyah(surah, i)).length || 20));
    // البسملة في أول الملف (ما عدا الفاتحة — آيتها الأولى — والتوبة)
    const lead = (surah !== 1 && surah !== 9) ? 19 : 0;
    const total = w.reduce((a, b) => a + b, 0) + lead;
    const out = [];
    let acc = lead;
    for (let i = 0; i < w.length; i++) {
      const st = Math.round(acc / total * durMs);
      acc += w[i];
      out.push([i + 1, st, Math.round(acc / total * durMs)]);
    }
    return out;
  },

  // رقم الآية عند الموضع ms ضمن جدول توقيت
  ayahAt(tm, ms) {
    if (!tm || !tm.length) return 0;
    let lo = 0, hi = tm.length - 1, ans = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (tm[mid][1] <= ms) { ans = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return tm[ans][0];
  },

  ayahStart(tm, n) {
    if (!tm) return null;
    const e = tm.find(x => x[0] === n);
    return e ? e[1] : null;
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
    // المصادر المحتملة: مصفوفة [{ayah,text}] أو كائن خريطة {n: text}
    // (GarciaData.getSurahTranslation يعيد كائنًا لا مصفوفة — كان يُهمَل سابقًا)
    let map = null;
    if (Array.isArray(out)) {
      map = {};
      out.forEach(t => { if (t && t.ayah != null) map[t.ayah] = t.text; });
    } else if (out && typeof out === 'object') {
      map = {};
      for (const k in out) {
        const v = out[k];
        if (v == null) continue;
        map[k] = (typeof v === 'object') ? (v.text != null ? v.text : (v.translation || '')) : v;
      }
      if (!Object.keys(map).length) map = null;
    }
    this._trMem[key] = map;
    return map;
  },

  name(station) {
    const l = (typeof currentLocale !== 'undefined' ? currentLocale : 'es');
    return station.name[l] || station.name.es || station.name.ar;
  },
};
