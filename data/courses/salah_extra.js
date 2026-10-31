// 🕌 Salah course — new stations (v110): what to recite, rawatib, common mistakes,
// special prayers, travel & excuse. Trilingual {es, ar, en}.
const SLH = (es, ar, en) => ({ es, ar, en });

const SALAH_EXTRA = {

  // ================= 3. QUÉ RECITAR =================
  qiraah: {
    id: 'qiraah',
    icon: '<i class="fas fa-book-open-reader"></i>',
    title: SLH('Qué recitar de pie', 'ماذا تقرأ واقفاً', 'What to recite while standing'),
    mascotIntro: SLH('Aquí están los textos completos, sin cortes. Escúchalos y repítelos.',
      'هذه النصوص كاملة بلا قطع. استمع إليها وردّدها.',
      'Here are the full texts, unabridged. Listen and repeat.'),
    lessons: [
      {
        type: 'card',
        title: SLH('Du\'a de apertura (Istiftah)', 'دعاء الاستفتاح', 'Opening supplication'),
        content: {
          es: `<p>Se dice después del takbir, antes de Al-Fátiha:</p>
<p class="arabic-block" dir="rtl">سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ</p>
<p><em>Subhanaka Allahumma wa bihamdika, wa tabaraka ismuka, wa ta'ala jadduka, wa la ilaha ghayruka.</em></p>
<p>«Gloria a Ti, oh Allah, y alabanza; bendito es Tu nombre, excelso Tu poder, y no hay divinidad fuera de Ti.»</p>`,
          ar: `<p>يُقال بعد تكبيرة الإحرام وقبل الفاتحة:</p>
<p class="arabic-block" dir="rtl">سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ</p>
<p>المعنى: أنزّهك يا الله وأحمدك، واسمك مبارك، وعظمتك عالية، ولا معبود غيرك.</p>`,
          en: `<p>Said after the opening takbir, before Al-Fatiha:</p>
<p class="arabic-block" dir="rtl">سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ</p>`,
        },
        source: SLH('Hadiz de Abu Sa\'id (Muslim)', 'حديث أبي سعيد (مسلم)', 'Hadith of Abu Sa\'id (Muslim)'),
      },
      {
        type: 'card',
        title: SLH('Refugio y Basmala', 'التعوذ والبسملة', 'Seeking refuge and the Basmala'),
        content: {
          es: `<p>Antes de recitar, busca refugio en Allah:</p>
<p class="arabic-block" dir="rtl">أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ</p>
<p><em>A'udhu billahi min ash-shaytan ir-rajim.</em> «Me refugio en Allah del Shaytán expulsado.»</p>
<p>Luego, al empezar cada sura:</p>
<p class="arabic-block" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
<p><em>Bismillah ir-Rahman ir-Rahim.</em> «En el nombre de Allah, el Clemente, el Misericordioso.»</p>`,
          ar: `<p>قبل القراءة تستعيذ بالله:</p>
<p class="arabic-block" dir="rtl">أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ</p>
<p>ثم عند بدء كل سورة:</p>
<p class="arabic-block" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
<p>والبسملة تُقال قبل الفاتحة وقبل السورة التي بعدها.</p>`,
          en: `<p>Before reciting:</p>
<p class="arabic-block" dir="rtl">أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ</p>
<p>Then: <span dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span></p>`,
        },
      },
      {
        type: 'card',
        title: SLH('Al-Fátiha — texto completo', 'سورة الفاتحة كاملة', 'Al-Fatiha — full text'),
        content: {
          es: `<p class="arabic-block" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ</p>
<p><strong>1.</strong> En el nombre de Allah, el Clemente, el Misericordioso.<br>
<strong>2.</strong> Toda alabanza es para Allah, Señor de los mundos.<br>
<strong>3.</strong> El Clemente, el Misericordioso.<br>
<strong>4.</strong> Dueño del Día del Juicio.<br>
<strong>5.</strong> Solo a Ti adoramos y solo a Ti pedimos ayuda.<br>
<strong>6.</strong> Guíanos por el camino recto.<br>
<strong>7.</strong> El camino de los que agraciaste, no el de los que incurrieron en Tu ira ni el de los extraviados.</p>
<p>🔊 Escucha la recitación completa y repite después de cada verso.</p>`,
          ar: `<p class="arabic-block" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ</p>
<p>هذه السورة سبع آيات، تُقرأ في كل ركعة، وهي أعظم سورة في القرآن.</p>
<p>🔊 استمع للقراءة الكاملة ثم رددها آية آية.</p>
<div class="cx-audio-embed"><audio controls preload="none" src="assets/audio/ar/fatiha_husary.mp3"></audio></div>`,
          en: `<p class="arabic-block" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ</p>
<div class="cx-audio-embed"><audio controls preload="none" src="assets/audio/ar/fatiha_husary.mp3"></audio></div>`,
        },
        source: SLH('Corán 1:1-7', 'القرآن ١:١-٧', 'Quran 1:1-7'),
      },
      {
        type: 'card',
        title: SLH('Qué significa la Fátiha', 'معنى الفاتحة كلمة كلمة', 'What Al-Fatiha means'),
        content: {
          es: `<p>Entender lo que dices cambia tu oración por completo:</p>
<ul>
<li><strong>Al-Hamdu lillah</strong> — la alabanza pertenece a Allah solo.</li>
<li><strong>Rabb al-'alamin</strong> — Señor de todo lo creado, no solo de los musulmanes.</li>
<li><strong>Malik yawm ad-din</strong> — Dueño del Día del Juicio: la justicia final.</li>
<li><strong>Iyyaka na'budu</strong> — «solo a Ti»: aquí está el corazón del Tawhid.</li>
<li><strong>Ihdina as-sirat al-mustaqim</strong> — una petición diaria de guía, no solo información.</li>
</ul>
<p>💡 La Fátiha es una conversación: la primera mitad es alabanza, la segunda es súplica.</p>`,
          ar: `<p>فهم ما تقوله يغيّر صلاتك كلها:</p>
<ul>
<li><strong>الحمد لله</strong> — الحمد كله لله وحده.</li>
<li><strong>رب العالمين</strong> — رب كل المخلوقات، لا المسلمين فقط.</li>
<li><strong>مالك يوم الدين</strong> — مالك يوم الحساب والعدل الأخير.</li>
<li><strong>إياك نعبد</strong> — تقديم «إياك» يفيد الحصر، وهنا قلب التوحيد.</li>
<li><strong>اهدنا الصراط المستقيم</strong> — طلب هداية يومي، لا مجرد خبر.</li>
</ul>
<p>💡 الفاتحة حوار: نصفها الأول ثناء، ونصفها الثاني دعاء.</p>`,
          en: `<p>Understanding what you say transforms your prayer. The first half is praise, the second is a request for guidance.</p>`,
        },
      },
      {
        type: 'card',
        title: SLH('Sura Al-Ikhlas — corta y completa', 'سورة الإخلاص كاملة', 'Sura Al-Ikhlas'),
        content: {
          es: `<p class="arabic-block" dir="rtl">قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ</p>
<p><strong>Traducción:</strong> Di: Él es Allah, Único. Allah, el Absoluto. No engendró ni fue engendrado. Y no hay nada comparable a Él.</p>
<p>Es la sura más recomendada para empezar: corta, fácil de memorizar y resume el Tawhid.</p>
<div class="cx-audio-embed"><audio controls preload="none" src="assets/audio/ar/ikhlas_husary.mp3"></audio></div>`,
          ar: `<p class="arabic-block" dir="rtl">قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ</p>
<p>أربع آيات، تُختصر فيها عقيدة التوحيد كلها، وهي أسهل سورة للحفظ للمبتدئ.</p>
<div class="cx-audio-embed"><audio controls preload="none" src="assets/audio/ar/ikhlas_husary.mp3"></audio></div>`,
          en: `<p class="arabic-block" dir="rtl">قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ</p>`,
        },
        source: SLH('Corán 112', 'سورة الإخلاص', 'Quran 112'),
      },
      {
        type: 'card',
        title: SLH('Sura Al-Kawthar', 'سورة الكوثر', 'Sura Al-Kawthar'),
        content: {
          es: `<p class="arabic-block" dir="rtl">إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ ۝ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ</p>
<p><strong>Traducción:</strong> Ciertamente te hemos dado la abundancia. Reza, pues, a tu Señor y sacrifica. Quien te odia, ese es el cortado.</p>
<p>Alternativa a Al-Ikhlas: memoriza una de las dos y varíalas entre rakats.</p>`,
          ar: `<p class="arabic-block" dir="rtl">إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ ۝ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ</p>
<p>ثلاث آيات قصيرة، بديل جيد للإخلاص، ويُسنّ تنويع السور بين الركعات.</p>`,
          en: `<p class="arabic-block" dir="rtl">إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ ۝ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ</p>`,
        },
        source: SLH('Corán 108', 'سورة الكوثر', 'Quran 108'),
      },
      {
        type: 'quiz',
        question: SLH('¿Qué se recita primero después del takbir?', 'ماذا تقرأ أولاً بعد تكبيرة الإحرام؟', 'What comes first after the takbir?'),
        options: ['Al-Fátiha', 'El du\'a de apertura (Istiftah)', 'La Basmala', 'Al-Ikhlas'],
        correct: 1,
        feedback: {
          es: 'Primero el Istiftah, luego el refugio, la Basmala, Al-Fátiha y una sura.',
          ar: 'أولاً الاستفتاح، ثم التعوذ، فالبسملة، فالفاتحة، ثم سورة.',
          en: 'Istiftah, then refuge, Basmala, Al-Fatiha, then a sura.',
        },
      },
      {
        type: 'quiz',
        question: SLH('¿Cuántos versos tiene Al-Fátiha?', 'كم عدد آيات الفاتحة؟', 'How many verses does Al-Fatiha have?'),
        options: ['5', '6', '7', '10'],
        correct: 2,
        feedback: {
          es: 'Siete versos, y se recita en cada rakah.',
          ar: 'سبع آيات، وتُقرأ في كل ركعة.',
          en: 'Seven verses, recited in every rakah.',
        },
      },
      {
        type: 'quiz',
        question: SLH('¿Es obligatorio recitar una sura después de Al-Fátiha?', 'هل تجب قراءة سورة بعد الفاتحة؟', 'Is a sura after Al-Fatiha obligatory?'),
        options: [
          'Sí, es un pilar sin el cual la oración es nula',
          'No: es Sunnah en las dos primeras rakats',
          'Solo en Fajr',
          'Solo en las oraciones de 4 rakats',
        ],
        correct: 1,
        feedback: {
          es: 'Al-Fátiha es pilar; la sura que la sigue es Sunnah.',
          ar: 'الفاتحة ركن، والسورة بعدها سنة.',
          en: 'Al-Fatiha is a pillar; the sura after it is Sunnah.',
        },
      },
    ],
  },

  // ================= 8. SUNNAHS RAWATIB =================
  rawatib: {
    id: 'rawatib',
    icon: '<i class="fas fa-star-and-crescent"></i>',
    title: SLH('Las sunnahs rawatib', 'السنن الرواتب', 'The regular sunnah prayers'),
    mascotIntro: SLH('Doce rakats voluntarias al día, repartidas antes y después de las obligatorias.',
      'اثنتا عشرة ركعة تطوّعاً في اليوم، قبل الفروض وبعدها.',
      'Twelve voluntary rakats a day, before and after the obligatory prayers.'),
    lessons: [
      {
        type: 'card',
        title: SLH('Qué son y por qué', 'ما هي ولماذا', 'What they are and why'),
        content: {
          es: `<p>Las <strong>sunnahs rawatib</strong> son oraciones voluntarias que se hacen junto a las cinco obligatorias: antes o después.</p>
<p>No son obligatorias: si no las haces, no hay pecado ni corrección. Pero completan lo que falta en la oración obligatoria y son la vía más fácil para que la oración pase de «cumplida» a «amada».</p>
<p>El Profeta ﷺ dijo que quien reza doce rakats al día (fuera de las obligatorias), Allah le construye una casa en el Paraíso.</p>`,
          ar: `<p><strong>السنن الرواتب</strong> هي الصلوات التطوعية المرتبطة بالفرائض الخمس، قبلها أو بعدها.</p>
<p>ليست واجبة: من تركها فلا إثم ولا سجود سهو. لكنها تجبر النقص في الفريضة، وهي أسهل طريق لتصبح الصلاة محبوبة لا مجرد دَين.</p>
<p>قال النبي ﷺ: «من صلّى في يوم وليلة اثنتي عشرة ركعة تطوعاً، بُني له بيت في الجنة».</p>`,
          en: `<p><strong>Rawatib</strong> are voluntary prayers attached to the five obligatory ones. Not obligatory — but they complete what is lacking.</p>`,
        },
        source: SLH('Muslim', 'رواه مسلم', 'Muslim'),
      },
      {
        type: 'card',
        title: SLH('La virtud de las dos de Fajr', 'فضل ركعتي الفجر', 'The virtue of the two of Fajr'),
        content: {
          es: `<p>Son solo dos rakats, antes del Fajr, y son las más valiosas del día:</p>
<p class="arabic-block" dir="rtl">رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا</p>
<p>«Las dos rakats del Fajr son mejores que el mundo y todo lo que contiene.»</p>
<p>💡 Son cortas: Al-Fátiha y una sura breve. No las alargues al principio; lo importante es no dejarlas.</p>`,
          ar: `<p>ركعتان فقط قبل الفجر، وهما أفضل تطوّع في اليوم:</p>
<p class="arabic-block" dir="rtl">رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا</p>
<p>💡 خفيفتان: الفاتحة وسورة قصيرة. لا تُطوّلهما في البداية، المهم ألا تتركهما.</p>`,
          en: `<p>Two rakats before Fajr, better than the world and all it contains.</p>`,
        },
        source: SLH('Muslim', 'رواه مسلم', 'Muslim'),
      },
      {
        type: 'card',
        title: SLH('Cómo rezar una sunnah', 'كيف تصلي السنة', 'How to pray a sunnah'),
        content: {
          es: `<p>Exactamente igual que la obligatoria, con dos diferencias:</p>
<ul>
<li>La <strong>intención</strong> es rezar «dos rakats de sunnah», no la obligatoria.</li>
<li>Se rezan de <strong>dos en dos</strong>: cada dos rakats, taslim.</li>
</ul>
<p>Si son cuatro (antes del Dhuhr), puedes hacerlas en dos bloques de dos, con un taslim en medio, o seguidas con un solo taslim al final.</p>
<p>Se pueden rezar en casa: es mejor, y evita confundir a quien te vea.</p>`,
          ar: `<p>هي كالفريضة تماماً إلا في أمرين:</p>
<ul>
<li><strong>النية</strong>: أن تنوي «ركعتين سنة»، لا الفريضة.</li>
<li>تُصلّى <strong>مثنى مثنى</strong>: كل ركعتين بتسليمة.</li>
</ul>
<p>وإن كانت أربعاً (قبل الظهر) فإمّا ركعتين ثم ركعتين، أو أربعاً بتسليمة واحدة.</p>
<p>والأفضل أداؤها في البيت، لئلا يلتبس على من يراك أنها فريضة.</p>`,
          en: `<p>Same as the obligatory prayer, but with the intention of sunnah, prayed two by two.</p>`,
        },
      },
      {
        type: 'quiz',
        question: SLH('¿Cuántas rakats tiene la sunnah antes del Fajr?', 'كم ركعة سنة الفجر؟', 'How many rakats before Fajr?'),
        options: ['1', '2', '4', 'No tiene'],
        correct: 1,
        feedback: { es: 'Dos rakats, y son las más valiosas.', ar: 'ركعتان، وهما أفضل التطوع.', en: 'Two rakats.' },
      },
      {
        type: 'quiz',
        question: SLH('¿Cuántas rakats de sunnah hay antes y después del Dhuhr?', 'كم سنة الظهر قبلها وبعدها؟', 'Sunnah around Dhuhr?'),
        options: ['2 antes y 2 después', '4 antes y 2 después', 'Ninguna', '4 antes y 4 después'],
        correct: 1,
        feedback: { es: 'Cuatro antes y dos después.', ar: 'أربع قبلها وركعتان بعدها.', en: 'Four before, two after.' },
      },
      {
        type: 'quiz',
        question: SLH('¿Hay sunnah antes o después del Asr?', 'هل للعصر سنة راتبة؟', 'Is there a rawatib for Asr?'),
        options: ['Sí, 4 antes', 'Sí, 2 después', 'No hay sunnah rawatib para el Asr', 'Sí, 6 antes'],
        correct: 2,
        feedback: {
          es: 'No hay rawatib para el Asr; sí existen oraciones voluntarias generales.',
          ar: 'لا سنة راتبة للعصر، لكن التطوع المطلق مشروع.',
          en: 'No rawatib for Asr.',
        },
      },
      {
        type: 'scenario',
        title: SLH('Llegas tarde al Fajr', 'أدركت الفجر متأخراً', 'You are late for Fajr'),
        situation: {
          es: 'Entras a la mezquita y el imam ya está en el ruku del Fajr. ¿Qué haces con las dos rakats de sunnah?',
          ar: 'دخلت المسجد والإمام راكع في فجر، فماذا تفعل بركعتي السنة؟',
          en: 'The imam is already bowing. What about the two sunnah rakats?',
        },
        choices: [
          { text: SLH('Rezo las dos de sunnah primero, aunque pierda la primera rakat con el imam.',
                  'أصلي السنة أولاً ولو فاتتني ركعة مع الإمام.',
                  'Pray the sunnah first.'),
            correct: false,
            why: SLH('Se pierde la congregación, que vale más que la sunnah.',
              'تفوتك الجماعة، وهي أعظم من السنة.',
              'You lose the congregation.') },
          { text: SLH('Entro con el imam y rezo la sunnah después del Fajr.',
                  'أدخل مع الإمام وأصلي السنة بعد الفجر.',
                  'Join the imam, pray the sunnah after.'),
            correct: true,
            why: SLH('Se puede recuperar después; la congregación no se recupera.',
              'السنة تُقضى بعد الصلاة، أما الجماعة فلا تُستدرك.',
              'The sunnah can be made up; the congregation cannot.') },
        ],
      },
    ],
  },

  // ================= 9. ERRORES COMUNES =================
  mistakes: {
    id: 'mistakes',
    icon: '<i class="fas fa-triangle-exclamation"></i>',
    title: SLH('Errores comunes', 'الأخطاء الشائعة', 'Common mistakes'),
    mascotIntro: SLH('Cinco comparaciones: a la izquierda el error (✗), a la derecha lo correcto (✓).',
      'خمس مقارنات: على اليسار الخطأ (✗) وعلى اليمين الصواب (✓).',
      'Five comparisons: wrong on the left, correct on the right.'),
    lessons: [
      {
        type: 'image',
        img: 'assets/prayer/mistake1.png',
        title: SLH('La espalda en el ruku', 'الظهر في الركوع', 'The back in ruku'),
        caption: SLH('✗ espalda curvada y cabeza caída · ✓ espalda recta y plana, cabeza al nivel de la cadera',
          '✗ ظهر مقوّس ورأس متدلٍّ · ✓ ظهر مستقيم مستوٍ والرأس في مستوى الحوض',
          '✗ curved back · ✓ flat straight back'),
      },
      {
        type: 'image',
        img: 'assets/prayer/mistake2.png',
        title: SLH('Los codos en el suyud', 'المرفقان في السجود', 'The elbows in sujud'),
        caption: SLH('✗ antebrazos pegados al suelo y brazos abiertos · ✓ codos levantados y separados del cuerpo',
          '✗ مرفقان وساعدان ملتصقان بالأرض والذراعان مبسوطتان · ✓ مرفقان مرفوعان بعيدان عن الجسم',
          '✗ forearms flat on the floor · ✓ elbows raised'),
      },
      {
        type: 'image',
        img: 'assets/prayer/mistake3.png',
        title: SLH('La mirada', 'اتجاه النظر', 'Where you look'),
        caption: SLH('✗ mirada al techo o al lado · ✓ mirada al lugar de la postración',
          '✗ نظر إلى السقف أو الجانب · ✓ نظر إلى موضع السجود',
          '✗ looking away · ✓ looking at the place of prostration'),
      },
      {
        type: 'image',
        img: 'assets/prayer/mistake4.png',
        title: SLH('La calma (tuma\'nina)', 'الطمأنينة', 'Stillness (tuma\'nina)'),
        caption: SLH('✗ movimiento rápido y borroso · ✓ quietud completa en cada posición',
          '✗ حركة سريعة مضطربة · ✓ سكون تام في كل ركن',
          '✗ rushing · ✓ complete stillness'),
      },
      {
        type: 'image',
        img: 'assets/prayer/mistake5.png',
        title: SLH('Sentarse en el tashahhud', 'الجلوس للتشهد', 'Sitting for tashahhud'),
        caption: SLH('✗ piernas cruzadas con los dos pies planos · ✓ pie izquierdo tendido bajo el cuerpo y derecho erguido',
          '✗ تربّع وقدمان مبسوطتان · ✓ القدم اليسرى مفرشة تحته واليمنى منصوبة',
          '✗ cross-legged · ✓ left foot under, right foot upright'),
      },
      {
        type: 'quiz',
        question: SLH('¿Qué posición se considera incorrecta en el ruku?', 'أي هيئة تُعدّ خطأً في الركوع؟', 'Which ruku posture is wrong?'),
        options: [
          'Espalda recta y manos en las rodillas',
          'Espalda curvada y cabeza muy baja',
          'Mirar al lugar de la postración',
          'Separar los brazos del cuerpo',
        ],
        correct: 1,
        feedback: {
          es: 'La espalda debe quedar plana; curvarla rompe la posición.',
          ar: 'يجب أن يكون الظهر مستوياً؛ تقويسه يخلّ بالركوع.',
          en: 'The back must stay flat.',
        },
      },
      {
        type: 'quiz',
        question: SLH('En el suyud, ¿qué se hace con los codos?', 'ماذا تفعل بالمرفقين في السجود؟', 'Elbows in sujud?'),
        options: ['Pegarlos al suelo', 'Levantarlos y separarlos', 'Apoyarse en ellos', 'No importa'],
        correct: 1,
        feedback: {
          es: 'Se levantan del suelo: es la diferencia entre una postración correcta y una «como un animal».',
          ar: 'تُرفع عن الأرض، وهذا فرق بين سجود صحيح وسجود كسجود البهائم.',
          en: 'Raise them off the ground.',
        },
      },
      {
        type: 'quiz',
        question: SLH('¿Qué significa tuma\'nina?', 'ما معنى الطمأنينة في الصلاة؟', 'What is tuma\'nina?'),
        options: [
          'Recitar más rápido para terminar antes',
          'Quedarse quieto en cada posición el tiempo suficiente',
          'Cerrar los ojos',
          'Rezar en voz alta',
        ],
        correct: 1,
        feedback: {
          es: 'Quietud real en cada pilar: sin ella la oración no es válida.',
          ar: 'سكون في كل ركن بقدر ما يستقرّ فيه، وهي ركن لا تصح الصلاة بدونها.',
          en: 'Stillness in every position — a pillar of the prayer.',
        },
      },
    ],
  },

  // ================= 10. ORACIONES ESPECIALES =================
  special: {
    id: 'special',
    icon: '<i class="fas fa-star"></i>',
    title: SLH('Oraciones especiales', 'صلوات خاصة', 'Special prayers'),
    mascotIntro: SLH('Witr, Jumu\'ah y la oración fúnebre: qué las hace distintas.',
      'الوتر والجمعة والجنازة: ما الذي يميّزها.',
      'Witr, Jumu\'ah and the funeral prayer.'),
    lessons: [
      {
        type: 'card',
        title: SLH('Witr — la última de la noche', 'الوتر', 'Witr'),
        content: {
          es: `<p><strong>Witr</strong> es una oración voluntaria que cierra la oración de la noche. Puede ser una sola rakah, o tres, o cinco.</p>
<ul>
<li><strong>Cuándo:</strong> entre el Isha y el Fajr. Lo mejor, al final de la noche.</li>
<li><strong>Cuántas:</strong> una rakah como mínimo; lo más común y seguro para el que empieza es <strong>una</strong>.</li>
<li><strong>Con qué:</strong> Al-Fátiha y una sura corta; se puede añadir Al-Ikhlas.</li>
</ul>
<p>💡 No es obligatoria, pero el Profeta ﷺ casi nunca la dejaba, viajando o en casa.</p>`,
          ar: `<p><strong>الوتر</strong> سنة تُختم بها صلاة الليل. أقلّه ركعة، ويجوز ثلاث أو خمس.</p>
<ul>
<li><strong>وقته:</strong> بين العشاء والفجر، وأفضله آخر الليل.</li>
<li><strong>عدده:</strong> ركعة كافية، ويجوز ثلاث أو أكثر.</li>
<li><strong>يقرأ فيه:</strong> الفاتحة وسورة قصيرة، ويُسنّ الإخلاص.</li>
</ul>
<p>💡 ليس واجباً، لكن النبي ﷺ كان لا يدعه حضراً ولا سفراً غالباً.</p>`,
          en: `<p><strong>Witr</strong> closes the night prayer: at least one rakah, between Isha and Fajr.</p>`,
        },
        source: SLH('Bukhari y Muslim', 'البخاري ومسلم', 'Bukhari & Muslim'),
      },
      {
        type: 'card',
        title: SLH('Du\'a al-Qunut — breve', 'دعاء القنوت بإيجاز', 'The Qunut supplication'),
        content: {
          es: `<p>En efecto: se puede decir en el Witr, después del ruku del último rakah, o antes. Si aún no lo has memorizado, basta con:</p>
<p class="arabic-block" dir="rtl">اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ</p>
<p>«Oh Allah, guíame entre los que guiaste, concédeme Salud entre los que sanaste, y protégeme entre los que protegiste.»</p>
<p>No hace falta el texto completo: empieza con esta parte y ve añadiendo poco a poco.</p>`,
          ar: `<p>يُشرع في الوتر بعد ركوع الركعة الأخيرة أو قبلها. ومن لم يحفظ النص الطويل يكفيه:</p>
<p class="arabic-block" dir="rtl">اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ</p>
<p>لا يلزمك النص الكامل: ابدأ بهذا القدر ثم أضف قليلاً قليلاً.</p>`,
          en: `<p>Said in Witr. Start with the short portion and add gradually.</p>`,
        },
      },
      {
        type: 'card',
        title: SLH('Jumu\'ah — el viernes', 'صلاة الجمعة', 'Jumu\'ah'),
        content: {
          es: `<p>El Friday es un día de fiesta semanal. La oración del <strong>Jumu\'ah</strong> sustituye al Dhuhr para quien está obligado a ella.</p>
<ul>
<li><strong>Estructura:</strong> dos <em>khutbah</em> (sermones) y luego <strong>dos rakats</strong> en congregación.</li>
<li><strong>Quién:</strong> obligatoria para el hombre adulto, sano, residente. No para el viajero, el enfermo, la mujer embarazada o con hijos pequeños.</li>
<li><strong>Hora:</strong> en el tiempo del Dhuhr, solo en mezquita y en congregación.</li>
</ul>
<p>⚠️ Quien no puede asistir reza Dhuhr (4 rakats) como cualquier día.</p>`,
          ar: `<p>الجمعة عيد أسبوعي، وهي بدل الظهر لمن وجبت عليه.</p>
<ul>
<li><strong>هيئتها:</strong> خطبتان ثم <strong>ركعتان</strong> في جماعة.</li>
<li><strong>على من تجب:</strong> الرجل البالغ الصحيح المقيم. ولا تجب على المسافر والمريض والمرأة.</li>
<li><strong>وقتها:</strong> وقت الظهر، في المسجد وجماعة فقط.</li>
</ul>
<p>⚠️ من لم يجب عليه الجمعة يصلي الظهر أربعاً كالمعتاد.</p>`,
          en: `<p>Jumu\'ah: two sermons then two rakats, instead of Dhuhr, for those obliged.</p>`,
        },
      },
      {
        type: 'card',
        title: SLH('La oración fúnebre (Janazah)', 'صلاة الجنازة', 'The funeral prayer'),
        content: {
          es: `<p>Es una oración de súplica por el difunto, no de movimiento:</p>
<ul>
<li><strong>Sin ruku y sin suyud:</strong> solo estás de pie.</li>
<li><strong>Cuatro takbirs:</strong> en cada uno se levantan las manos y se hace una pausa.</li>
<li><strong>Orden:</strong> 1) Al-Fátiha, 2) Salat sobre el Profeta ﷺ, 3) súplica por el difunto, 4) taslim.</li>
</ul>
<p class="arabic-block" dir="rtl">اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ</p>
<p>«Oh Allah, perdónalo, tenle misericordia, sánalo y perdona sus faltas.»</p>`,
          ar: `<p>صلاة الجنازة دعاء للميت، ليس فيها حركة:</p>
<ul>
<li><strong>لا ركوع ولا سجود:</strong> كلها قيام.</li>
<li><strong>أربع تكبيرات:</strong> يُرفع اليد مع كل تكبيرة.</li>
<li><strong>الترتيب:</strong> الفاتحة ثم الصلاة على النبي ﷺ ثم الدعاء للميت ثم تسليمة.</li>
</ul>
<p class="arabic-block" dir="rtl">اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ</p>`,
          en: `<p>No ruku, no sujud — four takbirs standing.</p>`,
        },
      },
      {
        type: 'quiz',
        question: SLH('¿Qué diferencia al Witr de la oración de la noche?', 'ما الذي يميز الوتر عن بقية صلاة الليل؟', 'What sets Witr apart?'),
        options: [
          'Se reza solo al atardecer',
          'Es una sola rakah (o más) que cierra la oración de la noche',
          'Tiene dos rukus',
          'Solo se reza en Ramadán',
        ],
        correct: 1,
        feedback: {
          es: 'Una rakah o más, al final de la noche.',
          ar: 'ركعة فأكثر، تُختم بها صلاة الليل.',
          en: 'One or more rakats, closing the night prayer.',
        },
      },
      {
        type: 'quiz',
        question: SLH('¿Cuántas rakats y cuántos takbirs tiene la Janazah?', 'كم ركعة وتكبيرة في صلاة الجنازة؟', 'Janazah structure?'),
        options: ['2 rakats y 4 takbirs', '4 rakats', '0 rakats (sin ruku ni suyud) y 4 takbirs', '2 rakats y 2 takbirs'],
        correct: 2,
        feedback: {
          es: 'No hay rakats: solo cuatro takbirs de pie.',
          ar: 'لا ركعات فيها: أربع تكبيرات قائماً فقط.',
          en: 'No rakats, just four takbirs standing.',
        },
      },
    ],
  },

  // ================= 11. TRAVEL & EXCUSE =================
  travel: {
    id: 'travel',
    icon: '<i class="fas fa-compass"></i>',
    title: SLH('Viaje y excusas válidas', 'السفر والعذر', 'Travel and valid excuses'),
    mascotIntro: SLH('Tres situaciones que cambian la forma de rezar, no la obligación de rezar.',
      'ثلاث حالات تغيّر هيئة الصلاة، لا وجوبها.',
      'Three situations that change the form, not the obligation.'),
    lessons: [
      {
        type: 'card',
        title: SLH('Acortar (qasr) en el viaje', 'قصر الصلاة في السفر', 'Shortening in travel'),
        content: {
          es: `<p>El viajero puede rezar las oraciones de <strong>cuatro rakats en dos</strong>: Dhuhr, Asr e Isha. Fajr (2) y Maghrib (3) no se acortan.</p>
<ul>
<li>Se aplica desde que sales de tu ciudad hasta que regresas.</li>
<li>Es una <strong>facilitación</strong>, no una carga: si te cuesta, acórtalas; es válido.</li>
<li>No requiere congregación: se acorta igual solo o en grupo.</li>
</ul>`,
          ar: `<p>للمسافر أن يصلي <strong>الرباعية ركعتين</strong>: الظهر والعصر والعشاء. أما الفجر (٢) والمغرب (٣) فلا تُقصران.</p>
<ul>
<li>يبدأ القصر من خروجه من بلده إلى رجوعه.</li>
<li>هو <strong>رخصة</strong> لا مشقة: إن شقّ عليك فاقصر، وهو صحيح.</li>
<li>لا يشترط جماعة: يقصر منفرداً أو مع جماعة.</li>
</ul>`,
          en: `<p>Dhuhr, Asr and Isha become two rakats while travelling.</p>`,
        },
      },
      {
        type: 'card',
        title: SLH('Combinar (yam\') dos oraciones', 'الجمع بين الصلاتين', 'Combining two prayers'),
        content: {
          es: `<p>El viajero puede unir Dhuhr con Asr, y Maghrib con Isha, en el tiempo de una de las dos:</p>
<ul>
<li><strong>Yam\' taqdim:</strong> las dos en el tiempo de la primera.</li>
<li><strong>Yam\' ta\'khir:</strong> las dos en el tiempo de la segunda.</li>
</ul>
<p>Se hace por una necesidad real (viaje, lluvia intensa, enfermedad que lo dificulte). Si puedes rezar cada una en su tiempo, es mejor hacerlo.</p>`,
          ar: `<p>للمسافر أن يجمع بين الظهر والعصر، وبين المغرب والعشاء، في وقت إحداهما:</p>
<ul>
<li><strong>جمع تقديم:</strong> تصليهما في وقت الأولى.</li>
<li><strong>جمع تأخير:</strong> تصليهما في وقت الثانية.</li>
</ul>
<p>يكون الجمع لحاجة حقيقية (سفر، مطر شديد، مرض يشق معه الأداء). وإن قدرت على أداء كل صلاة في وقتها فهو أفضل.</p>`,
          en: `<p>Dhuhr+Asr, Maghrib+Isha may be combined while travelling.</p>`,
        },
      },
      {
        type: 'card',
        title: SLH('Recuperar una oración perdida', 'قضاء الفائتة', 'Making up a missed prayer'),
        content: {
          es: `<p>Si olvidas una oración o te quedas dormido, no hay castigo: pero se reza <strong>en cuanto la recuerdes</strong>, sin esperar a la siguiente.</p>
<p>El Profeta ﷺ dijo: «Quien olvida una oración o se duerme, que la rece cuando la recuerde; no hay expiación para ella excepto eso.»</p>
<p>Si has perdido varias, recupéralas en orden; si temes que se pase el tiempo de la actual, reza primero la actual y luego las anteriores.</p>`,
          ar: `<p>من نسي صلاة أو نام عنها فلا إثم عليه، لكنه يصليها <strong>فور تذكّره</strong>، بلا انتظار للصلاة التالية.</p>
<p>قال النبي ﷺ: «من نسي صلاة أو نام عنها، فليصلّها إذا ذكرها، لا كفارة لها إلا ذلك».</p>
<p>وإن فاتتك صلوات كثيرة فصلّها مرتبة، وإن خشيت خروج وقت الحاضرة فابدأ بالحاضرة ثم اقضِ ما قبلها.</p>`,
          en: `<p>Pray it as soon as you remember — no waiting for the next one.</p>`,
        },
        source: SLH('Muslim', 'رواه مسلم', 'Muslim'),
      },
      {
        type: 'card',
        title: SLH('La menstruación: una facilitación, no una carencia', 'الحيض والنفاس: رخصة لا نقص', 'Menstruation: a facilitation, not a shortcoming'),
        content: {
          es: `<p>Durante la menstruación y el puerperio, la mujer <strong>no reza</strong> ni ayuna, y no tiene que recuperar las oraciones después.</p>
<p>Esto es una disposición de Allah, no un castigo: el cuerpo tiene un ciclo, y la religión lo reconoce. Ella sigue siendo plenamente creyente y puede recordar a Allah, hacer du\'a, escuchar el Corán y dar caridad.</p>
<p>Cuando termina, se purifica (ghusl) y vuelve a rezar sin compensar los días pasados. No hay deuda de oraciones por esos días.</p>
<p>💡 No es necesario justificarse ante nadie: es un asunto entre ella y su Señor.</p>`,
          ar: `<p>الحائض والنفساء <strong>لا تصليان</strong> ولا تصومان، ولا تقضيان الصلوات بعد ذلك.</p>
<p>وهذا حكم من الله ورحمة، لا عقاب: للجسد دورة يعرفها الدين. وهي في تلك الأيام مؤمنة كاملة، تذكر الله وتدعو وتستمع للقرآن وتتصدق.</p>
<p>فإذا طهرت اغتسلت وصلّت، ولا قضاء عليها للصلوات الفائتة في أيام الحيض.</p>
<p>💡 ولا يلزمها أن تعتذر لأحد: الأمر بينها وبين ربها.</p>`,
          en: `<p>She does not pray during menstruation or postpartum bleeding, and does not make up those prayers — a mercy, not a shortcoming.</p>`,
        },
      },
      {
        type: 'quiz',
        question: SLH('¿Qué oraciones se acortan en el viaje?', 'أي الصلوات تُقصر في السفر؟', 'Which prayers are shortened?'),
        options: ['Fajr y Maghrib', 'Dhuhr, Asr e Isha', 'Todas', 'Solo la del viernes'],
        correct: 1,
        feedback: {
          es: 'Las de cuatro rakats pasan a dos; Fajr y Maghrib no cambian.',
          ar: 'الرباعية تصير ركعتين، والفجر والمغرب لا يتغيران.',
          en: 'The four-rakah prayers become two.',
        },
      },
      {
        type: 'quiz',
        question: SLH('¿Cuándo se recupera una oración olvidada?', 'متى تُقضى الصلاة المنسية؟', 'When is a missed prayer made up?'),
        options: ['Al día siguiente', 'En cuanto la recuerdes', 'Solo después del Isha', 'No se recupera'],
        correct: 1,
        feedback: {
          es: 'En cuanto la recuerdes, sin esperar.',
          ar: 'فور تذكّرها، بلا تأخير.',
          en: 'As soon as you remember.',
        },
      },
    ],
  },
};
