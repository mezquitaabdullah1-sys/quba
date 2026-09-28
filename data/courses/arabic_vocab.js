/**
 * 📚 مفردات الكورس (100 كلمة في 6 موضوعات) + العبارات القرآنية + الجذور
 * الأولوية للمصطلحات الدينية (الله، قرآن، مسجد، صلاة…) مع نطقها المقطّعي
 * وتلميح لطريقة لفظ الأصوات الصعبة.
 *
 * كل كلمة: { id, topic, ar, tr, es, en, g (شرح عربي موجز), e (إيموجي احتياطي), s (اسم ملف الصورة), tip? }
 * الصور: assets/arabic/words/<s>.webp — تُستعمل تلقائياً إن وُجدت في data/arabic_media_manifest.js
 * وإلا يظهر الإيموجي. تجنّب تصوير الأنبياء والصحابة.
 */
const ARABIC_VOCAB = (() => {
  const T = (a) => ({ es: a[0], ar: a[1], en: a[2] });

  const TOPICS = [
    { id: 'faith',   emoji: '☝️', title: T([`Dios y la fe`, `الله والإيمان`, `God and faith`]) },
    { id: 'worship', emoji: '🕌', title: T([`Mezquita y adoración`, `المسجد والعبادة`, `Mosque and worship`]) },
    { id: 'phrases', emoji: '👋', title: T([`Saludos y expresiones`, `تحيّات وتعابير`, `Greetings and expressions`]) },
    { id: 'family',  emoji: '👪', title: T([`Familia y personas`, `الأسرة والناس`, `Family and people`]) },
    { id: 'numcol',  emoji: '🔢', title: T([`Números y colores`, `الأرقام والألوان`, `Numbers and colors`]) },
    { id: 'life',    emoji: '🌤️', title: T([`Vida cotidiana`, `الحياة اليومية`, `Daily life`]) },
  ];

  const W = (topic, ar, tr, es, en, g, e, s, pic) => ({ id: s, topic, ar, tr, es, en, g, e, s, pic: pic !== false });

  const WORDS = [
    // ── الله والإيمان (18) ──
    W('faith', 'اللَّهُ', 'al-lāh', 'Dios (Allah)', 'God (Allah)', 'الإله الحقّ', '☝️', 'allah', false),
    W('faith', 'رَبّ', 'rabb', 'Señor, Sustentador', 'Lord, Sustainer', 'المالك المربّي', '💫', 'rabb', false),
    W('faith', 'إِسْلَام', 'is-lām', 'Islam (entrega a Dios)', 'Islam (submission to God)', 'الاستسلام لله', '🕌', 'islam', false),
    W('faith', 'مُسْلِم', 'mus-lim', 'musulmán', 'Muslim', 'من أسلم وجهه لله', '🤲', 'muslim', false),
    W('faith', 'إِيمَان', 'ī-mān', 'fe', 'faith', 'التصديق بالقلب', '💚', 'iman', false),
    W('faith', 'نَبِيّ', 'na-bī', 'profeta', 'prophet', 'من يوحى إليه', '📜', 'nabi', false),
    W('faith', 'رَسُول', 'ra-sūl', 'mensajero', 'messenger', 'مرسَل بالوحي', '✉️', 'rasul', false),
    W('faith', 'مَلَك', 'ma-lak', 'ángel', 'angel', 'مخلوق نوريّ', '✨', 'malak', false),
    W('faith', 'قُرْآن', 'qur-ʾān', 'Corán', 'Quran', 'كلام الله المنزَّل', '📖', 'quran'),
    W('faith', 'كِتَاب', 'ki-tāb', 'libro', 'book', 'صحف مكتوبة', '📚', 'kitab'),
    W('faith', 'سُورَة', 'sū-ra', 'sura (capítulo)', 'surah (chapter)', 'قسم من القرآن', '📑', 'sura', false),
    W('faith', 'آيَة', 'ā-ya', 'aleya (versículo, signo)', 'ayah (verse, sign)', 'جملة من القرآن', '🔹', 'aya', false),
    W('faith', 'جَنَّة', 'jan-na', 'Paraíso', 'Paradise', 'دار النعيم', '🌿', 'janna', false),
    W('faith', 'نَار', 'nār', 'fuego (también: el Infierno)', 'fire (also: Hell)', 'لهب', '🔥', 'nar', false),
    W('faith', 'دُعَاء', 'du-ʿāʾ', 'súplica', 'supplication', 'مناجاة الله', '🙏', 'dua', false),
    W('faith', 'ذِكْر', 'dhikr', 'recuerdo de Dios', 'remembrance of God', 'ذكر الله بالقلب واللسان', '📿', 'dhikr', false),
    W('faith', 'تَوْحِيد', 'taw-ḥīd', 'unicidad de Dios', 'oneness of God', 'إفراد الله بالعبادة', '🌟', 'tawhid', false),
    W('faith', 'شُكْر', 'shukr', 'gratitud', 'gratitude', 'الثناء على المنعِم', '💛', 'shukr', false),

    // ── المسجد والعبادة (20) ──
    W('worship', 'مَسْجِد', 'mas-jid', 'mezquita', 'mosque', 'بيت الصلاة', '🕌', 'masjid'),
    W('worship', 'صَلَاة', 'ṣa-lāh', 'oración (salah)', 'prayer (salah)', 'عبادة بأقوال وأفعال', '🧎', 'salah', false),
    W('worship', 'وُضُوء', 'wu-ḍūʾ', 'ablución', 'ablution', 'الطهارة بالماء', '💧', 'wudu', false),
    W('worship', 'قِبْلَة', 'qib-la', 'qibla (dirección de La Meca)', 'qibla (direction of Makkah)', 'اتجاه الكعبة', '🧭', 'qibla', false),
    W('worship', 'أَذَان', 'a-dhān', 'llamada a la oración', 'call to prayer', 'الإعلام بدخول الوقت', '📢', 'adhan', false),
    W('worship', 'إِمَام', 'i-mām', 'imán (quien dirige la oración)', 'imam (prayer leader)', 'من يؤمّ المصلّين', '🎙️', 'imam', false),
    W('worship', 'رُكُوع', 'ru-kūʿ', 'inclinación en la oración', 'bowing in prayer', 'الانحناء في الصلاة', '🙇', 'ruku', false),
    W('worship', 'سُجُود', 'su-jūd', 'postración', 'prostration', 'وضع الجبهة على الأرض', '⬇️', 'sujud', false),
    W('worship', 'مِحْرَاب', 'miḥ-rāb', 'mihrab (nicho hacia la qibla)', 'mihrab (niche facing the qibla)', 'موضع الإمام في المسجد', '🕌', 'mihrab', false),
    W('worship', 'سَجَّادَة', 'saj-jā-da', 'alfombra de oración', 'prayer rug', 'يُصلَّى عليها', '🟩', 'sajjada', false),
    W('worship', 'جُمُعَة', 'ju-mu-ʿa', 'viernes (oración del viernes)', 'Friday (Friday prayer)', 'يوم اجتماع المسلمين', '📅', 'jumua', false),
    W('worship', 'طَهَارَة', 'ṭa-hā-ra', 'pureza', 'purity', 'النظافة والتطهّر', '🧼', 'tahara', false),
    W('worship', 'نِيَّة', 'niy-ya', 'intención', 'intention', 'قصد القلب', '💭', 'niyya', false),
    W('worship', 'تَكْبِير', 'tak-bīr', 'decir «Allāhu akbar»', 'saying "Allāhu akbar"', 'قول: الله أكبر', '📣', 'takbir', false),
    W('worship', 'زَكَاة', 'za-kāh', 'caridad obligatoria (zakat)', 'obligatory charity (zakat)', 'حقّ الفقراء في المال', '💰', 'zakah'),
    W('worship', 'صَوْم', 'ṣawm', 'ayuno', 'fasting', 'الإمساك عن المفطّرات', '⏳', 'sawm', false),
    W('worship', 'رَمَضَان', 'ra-ma-ḍān', 'Ramadán', 'Ramadan', 'شهر الصيام', '🌙', 'ramadan'),
    W('worship', 'حَجّ', 'ḥajj', 'peregrinación a La Meca', 'pilgrimage to Makkah', 'قصد مكة للنسك', '🧳', 'hajj', false),
    W('worship', 'عِيد', 'ʿīd', 'fiesta', 'festival', 'يوم فرح وعبادة', '🎉', 'eid', false),
    W('worship', 'كَعْبَة', 'kaʿ-ba', 'Kaaba', 'Kaaba', 'البيت الحرام', '🕋', 'kaaba'),

    // ── تحيّات وتعابير (18) ──
    W('phrases', 'السَّلَامُ عَلَيْكُمْ', 'as-sa-lā-mu ʿa-lay-kum', 'la paz sea con vosotros', 'peace be upon you', 'تحيّة الإسلام', '👋', 'salam_alaykum', false),
    W('phrases', 'وَعَلَيْكُمُ السَّلَامُ', 'wa ʿa-lay-ku-mu s-sa-lām', 'y con vosotros la paz', 'and upon you, peace', 'ردّ التحيّة', '🤝', 'wa_alaykum', false),
    W('phrases', 'بِسْمِ اللَّهِ', 'bis-mi-llāh', 'en el nombre de Allah', 'in the name of Allah', 'تُقال قبل البدء', '✨', 'bismillah', false),
    W('phrases', 'الْحَمْدُ لِلَّهِ', 'al-ḥam-du li-llāh', 'alabado sea Allah', 'praise be to Allah', 'شكر وثناء', '🙏', 'alhamdulillah', false),
    W('phrases', 'سُبْحَانَ اللَّهِ', 'sub-ḥā-na-llāh', 'gloria a Allah', 'glory be to Allah', 'تنزيه الله', '🌟', 'subhanallah', false),
    W('phrases', 'اللَّهُ أَكْبَرُ', 'al-lā-hu ak-bar', 'Allah es el más grande', 'Allah is the Greatest', 'تعظيم الله', '📣', 'allahu_akbar', false),
    W('phrases', 'إِنْ شَاءَ اللَّهُ', 'in shā-ʾa-llāh', 'si Allah quiere', 'if Allah wills', 'تعليق الأمر بمشيئة الله', '🤞', 'inshaallah', false),
    W('phrases', 'مَا شَاءَ اللَّهُ', 'mā shā-ʾa-llāh', 'lo que Allah ha querido', 'what Allah has willed', 'إعجاب مع ذكر الله', '🌷', 'mashaallah', false),
    W('phrases', 'جَزَاكَ اللَّهُ خَيْرًا', 'ja-zā-ka-llāhu khay-ran', 'que Allah te recompense con el bien', 'may Allah reward you with good', 'دعاء بالخير لمن أحسن إليك', '🎁', 'jazakallah', false),
    W('phrases', 'بَارَكَ اللَّهُ فِيكَ', 'bā-ra-ka-llāhu fīk', 'que Allah te bendiga', 'may Allah bless you', 'دعاء بالبركة', '💫', 'barakallah', false),
    W('phrases', 'أَسْتَغْفِرُ اللَّهَ', 'as-tagh-fi-ru-llāh', 'pido perdón a Allah', 'I seek Allah\'s forgiveness', 'طلب المغفرة', '🤲', 'astaghfirullah', false),
    W('phrases', 'لَا إِلَهَ إِلَّا اللَّهُ', 'lā i-lā-ha il-la-llāh', 'no hay dios sino Allah', 'there is no god but Allah', 'كلمة التوحيد', '☝️', 'la_ilaha', false),
    W('phrases', 'شُكْرًا', 'shuk-ran', 'gracias', 'thank you', 'كلمة شكر', '🙏', 'shukran', false),
    W('phrases', 'عَفْوًا', 'ʿaf-wan', 'de nada / perdón', 'you\'re welcome / pardon', 'ردّ على الشكر', '🙂', 'afwan', false),
    W('phrases', 'نَعَمْ', 'na-ʿam', 'sí', 'yes', 'كلمة موافقة', '✅', 'naam', false),
    W('phrases', 'لَا', 'lā', 'no', 'no', 'كلمة نفي', '❌', 'no', false),
    W('phrases', 'مَرْحَبًا', 'mar-ḥa-ban', 'hola / bienvenido', 'hello / welcome', 'تحيّة ترحيب', '🙌', 'marhaba', false),
    W('phrases', 'أَهْلًا وَسَهْلًا', 'ah-lan wa sah-lan', 'bienvenido', 'welcome', 'عبارة ترحيب', '🏡', 'ahlan', false),

    // ── الأسرة والناس (15) ──
    W('family', 'أَب', 'ab', 'padre', 'father', 'الوالد', '👨', 'ab'),
    W('family', 'أُمّ', 'umm', 'madre', 'mother', 'الوالدة', '👩', 'umm'),
    W('family', 'ابْن', 'ibn', 'hijo', 'son', 'الولد الذكر', '👦', 'ibn'),
    W('family', 'بِنْت', 'bint', 'hija', 'daughter', 'الولد الأنثى', '👧', 'bint'),
    W('family', 'أَخ', 'akh', 'hermano', 'brother', 'ابن الأب والأم', '👬', 'akh'),
    W('family', 'أُخْت', 'ukht', 'hermana', 'sister', 'بنت الأب والأم', '👭', 'ukht'),
    W('family', 'جَدّ', 'jadd', 'abuelo', 'grandfather', 'أبو الأب أو الأم', '👴', 'jadd'),
    W('family', 'جَدَّة', 'jad-da', 'abuela', 'grandmother', 'أمّ الأب أو الأم', '👵', 'jadda'),
    W('family', 'زَوْج', 'zawj', 'esposo', 'husband', 'شريك الحياة', '💍', 'zawj'),
    W('family', 'زَوْجَة', 'zaw-ja', 'esposa', 'wife', 'شريكة الحياة', '💞', 'zawja'),
    W('family', 'صَدِيق', 'ṣa-dīq', 'amigo', 'friend', 'رفيق مخلص', '🤝', 'sadiq'),
    W('family', 'مُعَلِّم', 'mu-ʿal-lim', 'maestro', 'teacher', 'من يعلّم غيره', '🧑‍🏫', 'muallim'),
    W('family', 'طِفْل', 'ṭifl', 'niño', 'child', 'صغير السنّ', '🧒', 'tifl'),
    W('family', 'رَجُل', 'ra-jul', 'hombre', 'man', 'الذكر البالغ', '🧔', 'rajul'),
    W('family', 'امْرَأَة', 'im-ra-ʾa', 'mujer', 'woman', 'الأنثى البالغة', '🧕', 'imraa'),

    // ── الأرقام والألوان (16) ──
    W('numcol', 'وَاحِد', 'wā-ḥid', 'uno (1)', 'one (1)', 'العدد ١', '1️⃣', 'wahid'),
    W('numcol', 'اثْنَانِ', 'ith-nān', 'dos (2)', 'two (2)', 'العدد ٢', '2️⃣', 'ithnan'),
    W('numcol', 'ثَلَاثَة', 'tha-lā-tha', 'tres (3)', 'three (3)', 'العدد ٣', '3️⃣', 'thalatha'),
    W('numcol', 'أَرْبَعَة', 'ar-ba-ʿa', 'cuatro (4)', 'four (4)', 'العدد ٤', '4️⃣', 'arbaa'),
    W('numcol', 'خَمْسَة', 'kham-sa', 'cinco (5)', 'five (5)', 'العدد ٥', '5️⃣', 'khamsa'),
    W('numcol', 'سِتَّة', 'sit-ta', 'seis (6)', 'six (6)', 'العدد ٦', '6️⃣', 'sitta'),
    W('numcol', 'سَبْعَة', 'sab-ʿa', 'siete (7)', 'seven (7)', 'العدد ٧', '7️⃣', 'sabaa'),
    W('numcol', 'ثَمَانِيَة', 'tha-mā-ni-ya', 'ocho (8)', 'eight (8)', 'العدد ٨', '8️⃣', 'thamaniya'),
    W('numcol', 'تِسْعَة', 'tis-ʿa', 'nueve (9)', 'nine (9)', 'العدد ٩', '9️⃣', 'tisa'),
    W('numcol', 'عَشَرَة', 'ʿa-sha-ra', 'diez (10)', 'ten (10)', 'العدد ١٠', '🔟', 'ashara'),
    W('numcol', 'أَحْمَر', 'aḥ-mar', 'rojo', 'red', 'لون الدم', '🔴', 'ahmar'),
    W('numcol', 'أَخْضَر', 'akh-ḍar', 'verde', 'green', 'لون الشجر', '🟢', 'akhdar'),
    W('numcol', 'أَزْرَق', 'az-raq', 'azul', 'blue', 'لون السماء', '🔵', 'azraq'),
    W('numcol', 'أَصْفَر', 'aṣ-far', 'amarillo', 'yellow', 'لون الشمس', '🟡', 'asfar'),
    W('numcol', 'أَسْوَد', 'as-wad', 'negro', 'black', 'لون الليل', '⚫', 'aswad'),
    W('numcol', 'أَبْيَض', 'ab-yaḍ', 'blanco', 'white', 'لون الثلج', '⚪', 'abyad'),

    // ── الحياة اليومية (13) ──
    W('life', 'بَيْت', 'bayt', 'casa', 'house', 'مكان السكن', '🏠', 'bayt'),
    W('life', 'مَاء', 'māʾ', 'agua', 'water', 'ما نشربه', '💧', 'maa'),
    W('life', 'خُبْز', 'khubz', 'pan', 'bread', 'طعام من الدقيق', '🍞', 'khubz'),
    W('life', 'طَعَام', 'ṭa-ʿām', 'comida', 'food', 'ما يُؤكل', '🍽️', 'taam'),
    W('life', 'شَمْس', 'shams', 'sol', 'sun', 'نجم النهار', '☀️', 'shams'),
    W('life', 'قَمَر', 'qa-mar', 'luna', 'moon', 'ينير الليل', '🌙', 'qamar'),
    W('life', 'سَمَاء', 'sa-māʾ', 'cielo', 'sky', 'ما فوقنا', '☁️', 'sama'),
    W('life', 'أَرْض', 'arḍ', 'tierra', 'earth', 'ما نمشي عليه', '🌍', 'ard'),
    W('life', 'يَوْم', 'yawm', 'día', 'day', 'من الفجر إلى الغروب', '🌤️', 'yawm'),
    W('life', 'لَيْل', 'layl', 'noche', 'night', 'عكس النهار', '🌌', 'layl'),
    W('life', 'شَجَرَة', 'sha-ja-ra', 'árbol', 'tree', 'نبات له جذع', '🌳', 'shajara'),
    W('life', 'عَيْن', 'ʿayn', 'ojo', 'eye', 'للنظر', '👁️', 'ayn'),
    W('life', 'قَلَم', 'qa-lam', 'bolígrafo', 'pen', 'أداة الكتابة', '✏️', 'qalam'),
  ];

  // ── تلميحات اللفظ للمصطلحات الدينية (الأصوات الصعبة) ──
  const TIPS = {
    allah: T([`La "ll" es «pesada» (con la boca llena) después de a/u: Al·lāh. Alarga la "ā".`, `اللام مفخّمة بعد الفتح والضمّ: أَلْ-لَاه. مُدّ الألف.`, `The "ll" is "heavy" (full mouth) after a/u: Al·lāh. Stretch the "ā".`]),
    rabb: T([`La shadda dobla la "b": rab-b. La "r" es un solo toque de lengua.`, `الشدّة تضاعف الباء: رَبّ. والراء طَرْقة واحدة.`, `The shadda doubles the "b": rab-b. The "r" is one tap.`]),
    islam: T([`Empieza con una pausa glotal (hamza) suave; la "ā" es larga: is-LĀM.`, `تبدأ بهمزة خفيفة، والألف ممدودة: إِسْ-لَام.`, `Starts with a soft glottal stop (hamza); the "ā" is long: is-LĀM.`]),
    iman: T([`Hamza inicial + "ī" larga + "ā" larga: ī-MĀN.`, `همزة في البداية ثم ياء ممدودة وألف ممدودة: إِي-مَان.`, `Initial hamza + long "ī" + long "ā": ī-MĀN.`]),
    quran: T([`La "q" nace muy atrás en la garganta; luego una pausa glotal y "ā" larga: qur-ʾĀN.`, `القاف من أقصى اللسان، ثم همزة وألف ممدودة: قُرْ-آن.`, `The "q" is made far back in the throat; then a glottal stop and long "ā": qur-ʾĀN.`]),
    dua: T([`La ʿayn (ع) se hace apretando la garganta; termina en hamza: du-ʿĀʾ.`, `العين من وسط الحلق وتنتهي بهمزة: دُ-عَاء.`, `The ʿayn (ع) squeezes the throat; it ends in a hamza: du-ʿĀʾ.`]),
    dhikr: T([`La "dh" es la "th" suave de "this"; la "k" sigue sin vocal: dhikr.`, `الذال بين الأسنان مع الصوت، والكاف ساكنة: ذِكْر.`, `"dh" is the voiced "th" of "this"; the "k" has no vowel: dhikr.`]),
    tawhid: T([`La ح (ḥ) es una "h" áspera desde la garganta: taw-ḤĪD.`, `الحاء من وسط الحلق: تَوْ-حِيد.`, `The ح (ḥ) is a rough "h" from the throat: taw-ḤĪD.`]),
    masjid: T([`La "j" es como en "job": mas-JID.`, `الجيم من وسط اللسان: مَسْ-جِد.`, `The "j" is as in "job": mas-JID.`]),
    salah: T([`La ص es una "s" pesada: ṢA-lāh. La "ā" es larga y la "h" final, suave.`, `الصاد مفخّمة: صَ-لَاة. الألف ممدودة.`, `ص is a heavy "s": ṢA-lāh. The "ā" is long and the final "h" is soft.`]),
    wudu: T([`La ض es la "d" enfática; termina en hamza: wu-ḌŪʾ.`, `الضاد مفخّمة والواو ممدودة: وُ-ضُوء.`, `ض is the emphatic "d"; it ends in a hamza: wu-ḌŪʾ.`]),
    qibla: T([`La "q" es la de "qamar": qib-la.`, `القاف من أقصى اللسان: قِبْ-لَة.`, `The "q" is the deep one from "qamar": qib-la.`]),
    adhan: T([`"dh" como la "th" de "this"; la última "ā" es larga: a-DHĀN.`, `الذال بين الأسنان: أَ-ذَان.`, `"dh" like the "th" in "this"; the last "ā" is long: a-DHĀN.`]),
    ruku: T([`La "k" va seguida de "ū" larga y de la ʿayn (ع): ru-KŪʿ.`, `ركوع: الكاف ثم واو ممدودة ثم عين.`, `The "k" is followed by a long "ū" and the ʿayn (ع): ru-KŪʿ.`]),
    sujud: T([`La "j" es la de "job"; "ū" larga: su-JŪD.`, `الجيم كما في «جَمَل»، والواو ممدودة: سُ-جُود.`, `The "j" is as in "job"; long "ū": su-JŪD.`]),
    mihrab: T([`La ḥ es áspera desde la garganta: miḥ-RĀB.`, `الحاء من الحلق: مِحْ-رَاب.`, `The ḥ is a rough throat "h": miḥ-RĀB.`]),
    tahara: T([`La ط es la "t" pesada; la "h" es suave: ṭa-HĀ-ra.`, `الطاء مفخّمة والهاء خفيفة: طَ-هَا-رَة.`, `ط is the heavy "t"; the "h" is soft: ṭa-HĀ-ra.`]),
    zakah: T([`La "z" vibra; "ā" larga; "h" final suave: za-KĀH.`, `الزاي مجهورة والألف ممدودة: زَ-كَاة.`, `The "z" buzzes; long "ā"; soft final "h": za-KĀH.`]),
    sawm: T([`La ص es pesada y "aw" suena como "ao": ṢAWM.`, `الصاد مفخّمة: صَوْم.`, `ص is heavy and "aw" sounds like "ow": ṢAWM.`]),
    ramadan: T([`La ض es la "d" enfática: ra-ma-ḌĀN.`, `الضاد مفخّمة والألف ممدودة: رَ-مَ-ضَان.`, `ض is the emphatic "d": ra-ma-ḌĀN.`]),
    hajj: T([`La ح es áspera y la "j" se dobla (shadda): ḥAJJ.`, `الحاء من الحلق والجيم مشدّدة: حَجّ.`, `ح is rough and the "j" is doubled (shadda): ḥAJJ.`]),
    kaaba: T([`La ʿayn (ع) aprieta la garganta: kaʿ-ba.`, `العين من وسط الحلق: كَعْ-بَة.`, `The ʿayn (ع) squeezes the throat: kaʿ-ba.`]),
    alhamdulillah: T([`La ح (ḥ) es áspera: al-ḤAM-du li-llāh.`, `الحاء من الحلق، واللام في «لله» مفخّمة أو مرقّقة بحسب ما قبلها.`, `ح (ḥ) is rough: al-ḤAM-du li-llāh.`]),
    astaghfirullah: T([`La غ (gh) es un gárgara suave: as-tagh-FI-ru-llāh.`, `الغين من أدنى الحلق: أَسْتَغْفِرُ اللَّه.`, `غ (gh) is a soft gargle: as-tagh-FI-ru-llāh.`]),
    subhanallah: T([`La ح (ḥ) es áspera: sub-ḤĀ-na-llāh.`, `الحاء من الحلق: سُبْ-حَانَ اللَّه.`, `ح (ḥ) is rough: sub-ḤĀ-na-llāh.`]),
    marhaba: T([`La ح (ḥ) es áspera: mar-ḤA-ban.`, `الحاء من الحلق: مَرْ-حَبًا.`, `ح (ḥ) is rough: mar-ḤA-ban.`]),
    afwan: T([`La ʿayn (ع) aprieta la garganta: ʿaf-wan.`, `العين من وسط الحلق: عَفْ-وًا.`, `The ʿayn (ع) squeezes the throat: ʿaf-wan.`]),
    sadiq: T([`La ص es pesada y la "q" muy atrás: ṣa-DĪQ.`, `الصاد مفخّمة والقاف من أقصى اللسان: صَ-دِيق.`, `ص is heavy and the "q" far back: ṣa-DĪQ.`]),
    tifl: T([`La ط es la "t" pesada: ṭifl.`, `الطاء مفخّمة: طِفْل.`, `ط is the heavy "t": ṭifl.`]),
    ayn: T([`La ʿayn (ع): aprieta la garganta y deja salir la voz.`, `العين من وسط الحلق مع الصوت.`, `The ʿayn (ع): squeeze the throat and let voice through.`]),
  };

  // ── عبارات قرآنية للقراءة (كلمة بكلمة) ──
  // words: [العربي, اللفظ, {es,ar,en}]
  const PW = (ar, tr, a) => [ar, tr, T(a)];
  const PHRASES = [
    { id: 'basmala', ref: '1:1', ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', tr: 'bis-mi-llā-hi r-raḥ-mā-ni r-ra-ḥīm',
      reciter: { file: 'fatiha_husary', start: 5.86, end: 11.67 },
      trans: T([`En el nombre de Allah, el Compasivo, el Misericordioso.`, `باسم الله ذي الرحمة الواسعة والرحمة الخاصة.`, `In the name of Allah, the Most Compassionate, the Most Merciful.`]),
      words: [PW('بِسْمِ', 'bis-mi', [`en el nombre de`, `باسم`, `in the name of`]), PW('اللَّهِ', 'al-lā-hi', [`Allah`, `الله`, `Allah`]),
              PW('الرَّحْمَٰنِ', 'ar-raḥ-mā-ni', [`el Compasivo`, `ذي الرحمة الواسعة`, `the Most Compassionate`]), PW('الرَّحِيمِ', 'ar-ra-ḥīm', [`el Misericordioso`, `المتّصف بالرحمة`, `the Most Merciful`])] },
    { id: 'hamd', ref: '1:2', ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', tr: 'al-ḥam-du li-llā-hi rab-bi l-ʿā-la-mīn',
      reciter: { file: 'fatiha_husary', start: 11.67, end: 17.72 },
      trans: T([`Alabado sea Allah, Señor de los mundos.`, `الثناء الكامل لله مالك الخلق ومربّيهم.`, `All praise is for Allah, Lord of all worlds.`]),
      words: [PW('الْحَمْدُ', 'al-ḥam-du', [`la alabanza`, `الثناء`, `the praise`]), PW('لِلَّهِ', 'li-llā-hi', [`para Allah`, `لله`, `for Allah`]),
              PW('رَبِّ', 'rab-bi', [`Señor de`, `مالك`, `Lord of`]), PW('الْعَالَمِينَ', 'al-ʿā-la-mīn', [`los mundos`, `الخلائق كلّها`, `the worlds`])] },
    { id: 'fatiha3', ref: '1:3', ar: 'الرَّحْمَٰنِ الرَّحِيمِ', tr: 'ar-raḥ-mā-ni r-ra-ḥīm',
      reciter: { file: 'fatiha_husary', start: 17.72, end: 22.13 },
      trans: T([`El Compasivo, el Misericordioso.`, `ذو الرحمة الواسعة والرحمة الخاصة.`, `The Most Compassionate, the Most Merciful.`]),
      words: [PW('الرَّحْمَٰنِ', 'ar-raḥ-mā-ni', [`el Compasivo`, `ذو الرحمة الواسعة`, `the Most Compassionate`]), PW('الرَّحِيمِ', 'ar-ra-ḥīm', [`el Misericordioso`, `المتّصف بالرحمة`, `the Most Merciful`])] },
    { id: 'fatiha4', ref: '1:4', ar: 'مَٰلِكِ يَوْمِ الدِّينِ', tr: 'mā-li-ki yaw-mi d-dīn',
      reciter: { file: 'fatiha_husary', start: 22.13, end: 26.83 },
      trans: T([`Soberano del Día del Juicio.`, `المتصرّف وحده يوم الجزاء والحساب.`, `Master of the Day of Judgment.`]),
      words: [PW('مَٰلِكِ', 'mā-li-ki', [`Soberano de`, `مالك`, `Master of`]), PW('يَوْمِ', 'yaw-mi', [`el Día`, `يوم`, `the Day`]), PW('الدِّينِ', 'ad-dīn', [`del Juicio`, `الجزاء والحساب`, `of Judgment`])] },
    { id: 'fatiha5', ref: '1:5', ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', tr: 'iy-yā-ka naʿ-bu-du wa iy-yā-ka nas-taʿīn',
      reciter: { file: 'fatiha_husary', start: 26.83, end: 33.71 },
      trans: T([`A Ti solo adoramos y a Ti solo pedimos ayuda.`, `لك وحدك نعبد، ولك وحدك نطلب العون.`, `You alone we worship, and You alone we ask for help.`]),
      words: [PW('إِيَّاكَ', 'iy-yā-ka', [`a Ti solo`, `لك وحدك`, `You alone`]), PW('نَعْبُدُ', 'naʿ-bu-du', [`adoramos`, `نعبد`, `we worship`]),
              PW('وَإِيَّاكَ', 'wa iy-yā-ka', [`y a Ti solo`, `ولك وحدك`, `and You alone`]), PW('نَسْتَعِينُ', 'nas-ta-ʿīn', [`pedimos ayuda`, `نطلب العون`, `we ask for help`])] },
    { id: 'fatiha6', ref: '1:6', ar: 'اهْدِنَا الصِّرَٰطَ الْمُسْتَقِيمَ', tr: 'ih-di-nā ṣ-ṣi-rā-ṭa l-mus-ta-qīm',
      reciter: { file: 'fatiha_husary', start: 33.71, end: 39.21 },
      trans: T([`Guíanos por el camino recto.`, `دلّنا وثبّتنا على الطريق الحق.`, `Guide us to the straight path.`]),
      words: [PW('اهْدِنَا', 'ih-di-nā', [`guíanos`, `دلّنا`, `guide us`]), PW('الصِّرَٰطَ', 'aṣ-ṣi-rāṭ', [`el camino`, `الطريق`, `the path`]), PW('الْمُسْتَقِيمَ', 'al-mus-ta-qīm', [`recto`, `المستقيم`, `the straight`])] },
    { id: 'fatiha7', ref: '1:7', ar: 'صِرَٰطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', tr: 'ṣi-rā-ṭal-la-dhī-na anʿam-ta ʿa-lay-him ghay-ril-magh-ḍū-bi ʿa-lay-him wa-lā ḍ-ḍāl-līn',
      reciter: { file: 'fatiha_husary', start: 39.21, end: 55.0 },
      trans: T([`El camino de los que Tú has agraciado, no el de los que incurrieron en Tu ira, ni el de los extraviados.`, `طريق من هداهم الله وأنعم عليهم، لا طريق من غضب الله عليهم ولا من ضلّوا.`, `The path of those You have blessed, not of those who earned [Your] anger, nor of those who are astray.`]),
      words: [PW('صِرَٰطَ الَّذِينَ', 'ṣi-rā-ṭal-la-dhīn', [`el camino de quienes`, `طريق الذين`, `the path of those`]),
              PW('أَنْعَمْتَ عَلَيْهِمْ', 'anʿam-ta ʿa-lay-him', [`Tú has agraciado`, `أنعمت عليهم`, `You have blessed`]),
              PW('غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ', 'ghay-ril-magh-ḍū-bi ʿa-lay-him', [`no de quienes incurrieron en ira`, `غير من غضب عليهم`, `not of those who earned anger`]),
              PW('وَلَا الضَّالِّينَ', 'wa-lāḍ-ḍāl-līn', [`ni de los extraviados`, `ولا من ضلّوا`, `nor of those who are astray`])] },
    { id: 'ikhlas1', ref: '112:1', ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ', tr: 'qul hu-wa l-lā-hu a-ḥad',
      reciter: { file: 'ikhlas_husary', start: 7.86, end: 13.52 },
      trans: T([`Di: Él, Allah, es Uno.`, `قل: هو الله واحد لا شريك له.`, `Say: He is Allah, the One.`]),
      words: [PW('قُلْ', 'qul', [`di`, `قل`, `say`]), PW('هُوَ', 'hu-wa', [`Él`, `هو`, `He`]), PW('اللَّهُ', 'al-lā-hu', [`Allah`, `الله`, `Allah`]), PW('أَحَدٌ', 'a-ḥad', [`Uno`, `واحد`, `One`])] },
    { id: 'ikhlas2', ref: '112:2', ar: 'اللَّهُ الصَّمَدُ', tr: 'al-lā-hu ṣ-ṣa-mad',
      reciter: { file: 'ikhlas_husary', start: 13.52, end: 18.46 },
      trans: T([`Allah es el Absoluto, de quien todos dependen.`, `الله الذي يقصده الخلق في حاجاتهم.`, `Allah is the Absolute, upon whom all depend.`]),
      words: [PW('اللَّهُ', 'al-lā-hu', [`Allah`, `الله`, `Allah`]), PW('الصَّمَدُ', 'aṣ-ṣa-mad', [`el Absoluto`, `المقصود في الحاجات`, `the Absolute`])] },
    { id: 'ikhlas3', ref: '112:3', ar: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', tr: 'lam ya-lid wa lam yū-lad',
      reciter: { file: 'ikhlas_husary', start: 18.46, end: 24.31 },
      trans: T([`No ha engendrado ni ha sido engendrado.`, `لم يكن له ولد، ولم يكن له والد.`, `He has not begotten, nor was He begotten.`]),
      words: [PW('لَمْ', 'lam', [`no`, `لم`, `not`]), PW('يَلِدْ', 'ya-lid', [`engendró`, `أنجب`, `begot`]), PW('وَلَمْ', 'wa lam', [`ni`, `ولم`, `nor`]), PW('يُولَدْ', 'yū-lad', [`fue engendrado`, `وُلد`, `was born`])] },
    { id: 'ikhlas4', ref: '112:4', ar: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', tr: 'wa lam ya-kun la-hu ku-fu-wan a-ḥad',
      reciter: { file: 'ikhlas_husary', start: 24.31, end: 31.5 },
      trans: T([`Y no hay nadie igual a Él.`, `ولم يكن أحد مثله ولا شبيهاً له.`, `And there is none comparable to Him.`]),
      words: [PW('وَلَمْ يَكُنْ', 'wa lam ya-kun', [`y no hay`, `ولم يكن`, `and there is not`]), PW('لَهُ', 'la-hu', [`para Él`, `له`, `for Him`]),
              PW('كُفُوًا', 'ku-fu-wan', [`igual`, `مثلاً`, `equal`]), PW('أَحَدٌ', 'a-ḥad', [`nadie`, `أحد`, `anyone`])] },
    { id: 'shahada1', ref: '', ar: 'لَا إِلَهَ إِلَّا اللَّهُ', tr: 'lā i-lā-ha il-la-llāh',
      trans: T([`No hay dios sino Allah.`, `لا معبود بحقّ إلا الله.`, `There is no god but Allah.`]),
      words: [PW('لَا', 'lā', [`no hay`, `لا`, `no`]), PW('إِلَهَ', 'i-lā-ha', [`dios`, `معبود`, `god`]), PW('إِلَّا', 'il-lā', [`sino`, `إلا`, `except`]), PW('اللَّهُ', 'al-lā-hu', [`Allah`, `الله`, `Allah`])] },
    { id: 'zidni', ref: '20:114', ar: 'رَبِّ زِدْنِي عِلْمًا', tr: 'rab-bi zid-nī ʿil-man',
      trans: T([`Señor mío, aumenta mi conocimiento.`, `يا ربّ زدني علماً.`, `My Lord, increase me in knowledge.`]),
      words: [PW('رَبِّ', 'rab-bi', [`Señor mío`, `يا ربّي`, `my Lord`]), PW('زِدْنِي', 'zid-nī', [`auméntame`, `زدني`, `increase me`]), PW('عِلْمًا', 'ʿil-man', [`en conocimiento`, `علماً`, `in knowledge`])] },
  ];

  // ── الجذور (نظام العربية) ──
  const ROOTS = [
    { root: 'ك ت ب', tr: 'k-t-b', meaning: T([`escribir`, `الكتابة`, `writing`]),
      words: [
        { ar: 'كَتَبَ', tr: 'ka-ta-ba', es: 'escribió', en: 'he wrote' },
        { ar: 'كِتَاب', tr: 'ki-tāb', es: 'libro', en: 'book' },
        { ar: 'كَاتِب', tr: 'kā-tib', es: 'escritor', en: 'writer' },
        { ar: 'مَكْتَب', tr: 'mak-tab', es: 'oficina, escritorio', en: 'office, desk' },
        { ar: 'مَكْتَبَة', tr: 'mak-ta-ba', es: 'biblioteca', en: 'library' },
        { ar: 'مَكْتُوب', tr: 'mak-tūb', es: 'escrito', en: 'written' },
      ] },
    { root: 'س ج د', tr: 's-j-d', meaning: T([`postrarse`, `السجود`, `prostrating`]),
      words: [
        { ar: 'سَجَدَ', tr: 'sa-ja-da', es: 'se postró', en: 'he prostrated' },
        { ar: 'سُجُود', tr: 'su-jūd', es: 'postración', en: 'prostration' },
        { ar: 'سَاجِد', tr: 'sā-jid', es: 'el que se postra', en: 'one who prostrates' },
        { ar: 'مَسْجِد', tr: 'mas-jid', es: 'mezquita (lugar de postración)', en: 'mosque (place of prostration)' },
        { ar: 'سَجَّادَة', tr: 'saj-jā-da', es: 'alfombra de oración', en: 'prayer rug' },
      ] },
    { root: 'ع ل م', tr: 'ʿ-l-m', meaning: T([`saber`, `العلم`, `knowing`]),
      words: [
        { ar: 'عَلِمَ', tr: 'ʿa-li-ma', es: 'supo', en: 'he knew' },
        { ar: 'عِلْم', tr: 'ʿilm', es: 'conocimiento', en: 'knowledge' },
        { ar: 'عَالِم', tr: 'ʿā-lim', es: 'sabio, erudito', en: 'scholar' },
        { ar: 'مُعَلِّم', tr: 'mu-ʿal-lim', es: 'maestro', en: 'teacher' },
        { ar: 'تَعْلِيم', tr: 'taʿ-līm', es: 'enseñanza', en: 'teaching' },
      ] },
  ];

  const byId = {};
  WORDS.forEach(w => { byId[w.id] = w; });
  const byTopic = (topic) => WORDS.filter(w => w.topic === topic);

  return { T, TOPICS, WORDS, TIPS, PHRASES, ROOTS, byId, byTopic };
})();

if (typeof window !== 'undefined') window.ARABIC_VOCAB = ARABIC_VOCAB;
if (typeof module !== 'undefined') module.exports = ARABIC_VOCAB;
