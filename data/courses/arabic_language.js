/**
 * 🔑 اللغة العربية: مفتاحك لفهم القرآن — Quba v65 (إعادة هيكلة كاملة)
 * ══════════════════════════════════════════════════════════════════
 * من 8 محطات متسلسلة (65 درساً) إلى 4 وحدات و13 محطة (~140 درساً):
 *
 *   الوحدة 1 · الأساسيات        S1  مرحباً بالعربية
 *   الوحدة 2 · الحروف           S2–S6  خمس مجموعات (الشكل ← الصوت ← الكتابة)
 *   الوحدة 3 · آلية القراءة      S7  الحركات والسكون · S8  التنوين والشدّة
 *   الوحدة 4 · كلمات وقراءة      S9  وصل الحروف · S10 مفردات إسلامية · S11 مفردات الحياة
 *                                S12 قراءة عبارات قرآنية · S13 الامتحان النهائي
 *
 * نمط محطة الحروف: غلاف ← عائلات الشكل (مع صورة) ← فيديو المجموعة (قابل للتخطي)
 * ← دروس الحروف (شكل/صوت/كتابة) ← استمع واختر ← طابق الشكل بموضعه ← اختبار
 * ← بطاقات مراجعة ← نقطة تحقق (5 أسئلة، 80%).
 *
 * أنواع الدروس: انظر docs/ARABIC_COURSE_V2.md
 * البيانات الخام: arabic_data.js (الحروف/الفيديو) و arabic_vocab.js (المفردات/العبارات).
 * الامتحان النهائي: 20 سؤالاً متنوّعاً، نجاح 70%، شهادة برونزية/فضّية/ذهبية.
 *
 * @audience ناطقون بغير العربية (الإسبانية أولاً، ثم الإنجليزية والعربية)
 * @duration ~180 دقيقة (هدف يومي 10 دقائق ≈ 18 يوماً)
 */
const COURSE_ARABIC_LANGUAGE = (() => {
  const D = ARABIC_DATA;
  const V = ARABIC_VOCAB;
  const T = D.T;
  const VID = D.VIDEO;

  // ── مساعدات ──────────────────────────────────────────────────
  const letterIds = (g) => D.GROUPS[g];
  const lid = (ids) => ids.map(i => 'letter:' + i);
  const wid = (slugs) => slugs.map(s => 'word:' + s);
  const words = (topic) => V.byTopic(topic).map(w => w.s);
  const syl = (letterId, markId) => {
    const l = D.byId[letterId], m = D.MARKS.find(x => x.id === markId);
    const v = { fatha: 'a', kasra: 'i', damma: 'u', tan_fath: 'an', tan_kasr: 'in', tan_damm: 'un' }[markId] || '';
    return { text: l.ch + m.mark, label: l.c + v, key: ['fatha', 'kasra', 'damma'].indexOf(markId) >= 0 ? `syl_${letterId}_${markId}` : null };
  };

  const letterLesson = (id) => ({ type: 'arabic_letter', letterId: id });

  // مقطع فيديو (start/end بالثواني) + عنوان وملخّص نصي يعمل بلا إنترنت
  const clip = (v, title, summary, listen, extra) => Object.assign({ provider: v.provider, id: v.id, start: v.start, end: v.end, title, summary, listen: listen || [] }, extra || {});
  const videoLesson = (v, title, summary, listen, extra) => Object.assign({ type: 'video', skippable: true }, clip(v, title, summary, listen, extra));
  const videoSeries = (title, segments) => ({ type: 'video', skippable: true, title, segments });

  // سلسلة فيديو كتابة الحروف: مقطع لكل حرف مع إمكانية التكرار
  const writingSeries = (ids, extras) => {
    const segs = ids.map(id => {
      const l = D.byId[id];
      const c = D.writingClip(l);
      return Object.assign({}, c, {
        label: l.ch,
        title: T([`Cómo se escribe ${l.ch}`, `كتابة الحرف ${l.ch}`, `How to write ${l.ch}`]),
        summary: T([
          `${l.tr} (${l.nm}). Formas: ${l.forms.iso} · ${l.forms.ini} · ${l.forms.med} · ${l.forms.fin}. ${l.write.es}`,
          `${l.nm}. الأشكال: ${l.forms.iso} · ${l.forms.ini} · ${l.forms.med} · ${l.forms.fin}. ${l.write.ar}`,
          `${l.tr} (${l.nm}). Forms: ${l.forms.iso} · ${l.forms.ini} · ${l.forms.med} · ${l.forms.fin}. ${l.write.en}`]),
        listen: ['letter:' + id],
      });
    });
    (extras || []).forEach(id => {
      const x = D.EXTRAS.find(e => e.id === id);
      segs.push({
        provider: 'youtube', id: VID.writingId, start: D.ts(x.clip.start), end: D.ts(x.clip.end),
        label: x.ch, title: T([`Cómo se escribe ${x.ch}`, `كتابة ${x.ch}`, `How to write ${x.ch}`]),
        summary: T([`${x.tr} (${x.nm}). ${x.note.es}`, `${x.nm}. ${x.note.ar}`, `${x.tr} (${x.nm}). ${x.note.en}`]),
        listen: [{ text: x.ex.w, label: x.ex.tr }],
      });
    });
    return segs;
  };

  const quiz = (q, options, correct, feedback, learns) => Object.assign({ type: 'quiz', question: T(q), options, correct, feedback: T(feedback) }, learns ? { learns } : {});
  const opt = (es, ar, en) => ({ es, ar, en });

  // ── محطة مجموعة حروف (القالب المتكرّر 2–6) ─────────────────────
  const groupStation = (g, cfg) => {
    const ids = letterIds(g);
    const items = lid(ids);
    const connectors = ids.filter(i => D.byId[i].conn);
    const sound = VID.sounds[g];
    const soundVideo = videoLesson(sound,
      T([`Sonidos del grupo ${g}`, `أصوات المجموعة ${g}`, `Sounds of group ${g}`]),
      T([`Escucha con atención el sonido de cada letra (${ids.map(i => D.byId[i].ch).join(' ')}). Pausa, repite en voz alta y compara con lo que oyes.`,
         `أنصت جيداً لصوت كل حرف (${ids.map(i => D.byId[i].ch).join(' ')}). أوقف الفيديو وكرّر بصوت مسموع وقارن بما تسمع.`,
         `Listen closely to each letter's sound (${ids.map(i => D.byId[i].ch).join(' ')}). Pause, repeat aloud and compare with what you hear.`]),
      items);
    const videoStep = g === 1
      ? videoSeries(T([`Vídeo: las letras y sus sonidos`, `فيديو: الحروف وأصواتها`, `Video: the letters and their sounds`]), [
          Object.assign({ label: T(['Vista general', 'نظرة عامة', 'Overview']) }, clip(VID.lettersIntro,
            T([`El alfabeto árabe: vista general`, `الأبجدية العربية: نظرة عامة`, `The Arabic alphabet: overview`]),
            T([`Un mapa del alfabeto antes de entrar en detalle. El árabe tiene 28 letras y cada una se aprende con tres cosas: su forma, su sonido y su escritura. No intentes memorizarlo todo ahora: lo repasaremos letra por letra.`,
               `خريطة للأبجدية قبل التفصيل. للعربية 28 حرفاً، ونتعلّم كل حرف بثلاثة أشياء: شكله وصوته وكتابته. لا تحاول حفظ كل شيء الآن: سنراجعها حرفاً حرفاً.`,
               `A map of the alphabet before the details. Arabic has 28 letters and each is learned through three things: shape, sound and writing. Don't try to memorise it all now: we'll go letter by letter.`]), [])),
          Object.assign({ label: T([`Sonidos del grupo 1`, `أصوات المجموعة 1`, `Sounds of group 1`]) }, clip(sound,
            T([`Sonidos del grupo 1`, `أصوات المجموعة 1`, `Sounds of group 1`]), soundVideo.summary, items)),
        ])
      : soundVideo;

    return {
      id: 'letters_' + g,
      kind: 'letters',
      icon: `<span class="cx-glyph-icon" aria-hidden="true">${D.byId[ids[0]].ch}</span>`,
      cover: { glyphs: ids.map(i => D.byId[i].ch), tone: g },
      title: cfg.title,
      mascotIntro: cfg.intro,
      items,
      lessons: [].concat(
        [{ type: 'shape_families', letters: ids, group: g }],
        [videoStep],
        ids.map(letterLesson),
        cfg.extra || [],
        [
          { type: 'listen_choose', items },
          { type: 'match_pairs', gen: 'forms', letters: connectors, title: T([`Une cada forma con su posición`, `طابق كلّ شكل بموضعه`, `Match each shape with its position`]) },
        ],
        cfg.quizzes,
        [
          { type: 'flashcards', title: T([`Repaso del grupo ${g}`, `مراجعة المجموعة ${g}`, `Group ${g} review`]), items },
          { type: 'checkpoint', items, n: 5, pass: 0.8 },
        ]
      ),
    };
  };

  // ═══════════════ الوحدة 1 ═══════════════
  const S1 = {
    id: 'welcome', kind: 'intro',
    icon: '<i class="fas fa-door-open"></i>',
    cover: { icon: 'fa-door-open', tone: 0 },
    title: T([`Bienvenida al árabe`, `مرحباً بالعربية`, `Welcome to Arabic`]),
    mascotIntro: T([
      `¡As-salamu alaykum! Esta es tu llave para entender el Corán: aprenderás a leer árabe paso a paso, con sonido, vídeo y práctica.`,
      `السلام عليكم! هذا مفتاحك لفهم القرآن: ستتعلّم قراءة العربية خطوة بخطوة بالصوت والفيديو والتدريب.`,
      `As-salamu alaykum! This is your key to understanding the Quran: you'll learn to read Arabic step by step, with sound, video and practice.`]),
    lessons: [
      { type: 'video', skippable: true, provider: 'local', src: VID.intro.src, poster: VID.intro.poster, start: 0, end: 90,
        title: T([`Bienvenida al curso (90 s)`, `مرحباً بك في الدورة (90 ثانية)`, `Welcome to the course (90 s)`]),
        summary: T([
          `Un vistazo rápido a lo que vas a lograr: leer las letras, oír sus sonidos y descubrir tus primeras palabras del Corán. Empezarás sin saber nada y terminarás leyendo frases reales.`,
          `نظرة سريعة على ما ستحقّقه: قراءة الحروف وسماع أصواتها واكتشاف أولى كلمات القرآن. تبدأ من الصفر وتنتهي بقراءة عبارات حقيقية.`,
          `A quick look at what you'll achieve: reading the letters, hearing their sounds and discovering your first Quranic words. You start from zero and end up reading real phrases.`]) },
      { type: 'infographic', layout: 'list',
        title: T([`¿Por qué aprender árabe?`, `لماذا نتعلّم العربية؟`, `Why learn Arabic?`]),
        items: [
          { icon: 'fa-book-quran', title: T([`La lengua del Corán`, `لغة القرآن`, `The language of the Quran`]), text: T([`Lee el Libro en su idioma original y entiende lo que recitas.`, `اقرأ الكتاب بلغته الأصلية وافهم ما تتلو.`, `Read the Book in its original language and understand what you recite.`]) },
          { icon: 'fa-mosque', title: T([`La lengua de la oración`, `لغة الصلاة`, `The language of prayer`]), text: T([`El adhan, la salah y el du'a se dicen en árabe.`, `الأذان والصلاة والدعاء بالعربية.`, `The adhan, salah and du'a are said in Arabic.`]) },
          { icon: 'fa-earth-africa', title: T([`Cientos de millones de hablantes`, `مئات الملايين من الناطقين`, `Hundreds of millions of speakers`]), text: T([`Una de las lenguas más habladas del mundo.`, `من أكثر لغات العالم انتشاراً.`, `One of the most widely spoken languages in the world.`]) },
          { icon: 'fa-landmark', title: T([`1400 años de saber`, `١٤٠٠ عام من العلم`, `1400 years of knowledge`]), text: T([`Literatura, ciencia, filosofía y poesía a tu alcance.`, `أدب وعلم وفلسفة وشعر في متناولك.`, `Literature, science, philosophy and poetry within reach.`]) },
          { icon: 'fa-font', title: T([`Solo 28 letras`, `٢٨ حرفاً فقط`, `Just 28 letters`]), text: T([`Más simple de lo que parece. ¡Lo verás!`, `أبسط مما تظن. سترى!`, `Simpler than it looks. You'll see!`]) },
        ],
        source: 'Ethnologue · UNESCO Arabic Language Day' },
      { type: 'infographic', layout: 'grid',
        title: T([`5 claves del árabe`, `٥ مفاتيح للعربية`, `5 keys to Arabic`]),
        items: [
          { icon: 'fa-arrow-left-long', title: T([`De derecha a izquierda`, `من اليمين إلى اليسار`, `Right to left`]), text: T([`Se escribe y se lee así: ←`, `تُكتب وتُقرأ هكذا: ←`, `Written and read this way: ←`]) },
          { icon: 'fa-link', title: T([`Letras unidas`, `حروف متّصلة`, `Joined letters`]), text: T([`Casi todas se unen y forman palabras cursivas.`, `أغلبها يتّصل فتتكوّن كلمات متصلة.`, `Most of them join into flowing words.`]) },
          { icon: 'fa-shapes', title: T([`Hasta 4 formas`, `حتى ٤ أشكال`, `Up to 4 shapes`]), text: T([`Aislada · inicial · medial · final.`, `منفصلة · أوّل · وسط · آخر.`, `Isolated · initial · medial · final.`]) },
          { icon: 'fa-music', title: T([`Vocales como signos`, `حركات فوق الحرف وتحته`, `Vowels as marks`]), text: T([`Las vocales cortas van arriba o abajo de la letra.`, `الحركات القصيرة فوق الحرف أو تحته.`, `Short vowels sit above or below the letter.`]) },
          { icon: 'fa-seedling', title: T([`Raíces de 3 letras`, `جذور من ثلاثة حروف`, `3-letter roots`]), text: T([`ك-ت-ب → escribir, libro, escritor, biblioteca.`, `ك-ت-ب ← كتب، كتاب، كاتب، مكتبة.`, `k-t-b → write, book, writer, library.`]) },
        ],
        source: 'Alif Baa (Georgetown University Press)' },
      quiz([`¿Cuántas letras tiene el alfabeto árabe?`, `كم عدد حروف الأبجدية العربية؟`, `How many letters are in the Arabic alphabet?`],
        ['24', '26', '28', '30'], 2,
        [`¡Correcto! 28 letras. Todas son consonantes; las vocales cortas se marcan con signos (harakat).`, `صحيح! 28 حرفاً. جميعها صوامت، وتُضاف الحركات القصيرة بعلامات.`, `Correct! 28 letters. All are consonants; short vowels are marked with signs (harakat).`]),
      quiz([`¿En qué dirección se escribe el árabe?`, `في أيّ اتّجاه تُكتب العربية؟`, `In which direction is Arabic written?`],
        [opt(`Izquierda a derecha`, `من اليسار إلى اليمين`, `Left to right`), opt(`Derecha a izquierda`, `من اليمين إلى اليسار`, `Right to left`), opt(`De arriba a abajo`, `من الأعلى إلى الأسفل`, `Top to bottom`), opt(`Depende del texto`, `حسب النصّ`, `It depends on the text`)], 1,
        [`Derecha a izquierda. Por eso los libros árabes se abren «al revés».`, `من اليمين إلى اليسار، ولذلك تُفتح الكتب العربية «من الخلف».`, `Right to left. That's why Arabic books open "backwards".`]),
      { type: 'journey_map' },
    ],
  };

  // ═══════════════ الوحدة 2: الحروف ═══════════════
  const S2 = groupStation(1, {
    title: T([`Grupo 1: ا ب ت ث ج ح خ`, `المجموعة 1: ا ب ت ث ج ح خ`, `Group 1: ا ب ت ث ج ح خ`]),
    intro: T([
      `¡Empecemos! Cada letra tiene 3 pasos: su forma, su sonido y cómo se escribe. Toca 🔊 para escucharla.`,
      `لنبدأ! لكل حرف ثلاث خطوات: شكله ثم صوته ثم طريقة كتابته. اضغط 🔊 لتسمعه.`,
      `Let's start! Every letter has 3 steps: its shape, its sound and how to write it. Tap 🔊 to hear it.`]),
    quizzes: [
      quiz([`¿Cuál de estas letras tiene UN punto DEBAJO?`, `أيّ من هذه الحروف له نقطة واحدة تحته؟`, `Which of these letters has ONE dot BELOW?`],
        ['ت', 'ب', 'ث', 'خ'], 1,
        [`ب (Baa) es la única con un punto DEBAJO. ت tiene 2 arriba, ث tiene 3 arriba y خ tiene 1 arriba.`, `الباء وحدها لها نقطة تحتها. التاء نقطتان فوق، والثاء ثلاث فوق، والخاء نقطة واحدة فوق.`, `ب (Baa) is the only one with a dot BELOW. ت has 2 above, ث has 3 above, خ has 1 above.`], ['letter:ba']),
      quiz([`«جَمَلٌ» (jamal) significa:`, `«جَمَلٌ» تعني:`, `"jamal" (جَمَلٌ) means:`],
        [opt(`Perro 🐕`, `كلب`, `Dog 🐕`), opt(`Caballo 🐎`, `حصان`, `Horse 🐎`), opt(`Camello 🐫`, `جمل`, `Camel 🐫`), opt(`León 🦁`, `أسد`, `Lion 🦁`)], 2,
        [`¡Correcto! Jamal = camello, un animal muy importante en la cultura árabe.`, `صحيح! جمل: حيوان مهمّ في الثقافة العربية.`, `Correct! Jamal = camel, a very important animal in Arabic culture.`], ['letter:jim']),
    ],
  });

  const S3 = groupStation(2, {
    title: T([`Grupo 2: د ذ ر ز س ش`, `المجموعة 2: د ذ ر ز س ش`, `Group 2: د ذ ر ز س ش`]),
    intro: T([
      `¡Muy bien! Ahora 6 letras más. Ojo: د ذ ر ز NO se unen a la letra siguiente.`,
      `أحسنت! لنكمل مع 6 حروف أخرى. لاحظ: د ذ ر ز لا تتّصل بما بعدها.`,
      `Well done! Six more letters. Careful: د ذ ر ز do NOT join the next letter.`]),
    quizzes: [
      quiz([`¿Cuál letra NO se une a la letra siguiente?`, `أيّ حرف لا يتّصل بما بعده؟`, `Which letter does NOT join the one after it?`],
        ['س', 'ب', 'ر', 'ت'], 2,
        [`ر (Raa) es una de las 6 letras que no se unen hacia adelante: ا د ذ ر ز و.`, `الراء من الحروف الستّة التي لا تتّصل بما بعدها: ا د ذ ر ز و.`, `ر is one of the 6 letters that never join forward: ا د ذ ر ز و.`], ['letter:ra']),
      quiz([`«شَمْسٌ» (shams) significa:`, `«شَمْسٌ» تعني:`, `"shams" (شَمْسٌ) means:`],
        [opt(`Luna 🌙`, `قمر`, `Moon 🌙`), opt(`Sol ☀️`, `شمس`, `Sun ☀️`), opt(`Estrella ⭐`, `نجم`, `Star ⭐`), opt(`Nube ☁️`, `سحاب`, `Cloud ☁️`)], 1,
        [`¡Sí! Shams = sol. Verás esta palabra muchas veces en el Corán.`, `نعم! الشمس: كلمة تتكرّر كثيراً في القرآن.`, `Yes! Shams = sun. You'll see this word often in the Quran.`], ['letter:shin']),
    ],
  });

  const S4 = groupStation(3, {
    title: T([`Grupo 3: ص ض ط ظ ع غ`, `المجموعة 3: ص ض ط ظ ع غ`, `Group 3: ص ض ط ظ ع غ`]),
    intro: T([
      `Estas son las letras «pesadas» y las de la garganta. Se dicen con la lengua atrás o con la garganta apretada. ¡Son únicas del árabe! Ve despacio y repite con el audio.`,
      `هذه الحروف المفخّمة والحلقية. تُنطق برفع أقصى اللسان أو بانقباض الحلق. من خصائص العربية! تمهّل وكرّر مع الصوت.`,
      `These are the "heavy" letters and the throat letters. They're said with the tongue pulled back or the throat squeezed. Unique to Arabic! Go slowly and repeat with the audio.`]),
    // درس إضافي: موضع اللسان
    extra: [
      { type: 'infographic', layout: 'grid',
        title: T([`¿Dónde va la lengua?`, `أين يكون اللسان؟`, `Where does the tongue go?`]),
        intro: T([`Las «pesadas» se hacen con la lengua en forma de cuchara.`, `المفخّمة تُنطق بتقعير اللسان كالملعقة.`, `The "heavy" letters use a spoon-shaped tongue.`]),
        items: [
          { glyph: 'ص ض', title: T([`Lengua de cuchara`, `لسان كالملعقة`, `Spoon tongue`]), text: T([`Hunde el centro y eleva la parte de atrás hacia el paladar. La boca «se llena».`, `قعّر وسط اللسان وارفع أقصاه نحو الحنك. يمتلئ الفم بالصوت.`, `Hollow the middle and lift the back toward the palate. The mouth "fills".`]) },
          { glyph: 'ط ظ', title: T([`Como ت y ذ, pero pesadas`, `كالتاء والذال لكن مفخّمة`, `Like ت and ذ, but heavy`]), text: T([`Misma posición delante, pero con la parte de atrás elevada.`, `الموضع الأمامي نفسه مع رفع أقصى اللسان.`, `Same front position, but with the back of the tongue raised.`]) },
          { glyph: 'ع', title: T([`Garganta apretada`, `حلق منقبض`, `Squeezed throat`]), text: T([`Contrae el centro de la garganta y deja salir la voz.`, `اعصر وسط الحلق ودع الصوت يخرج.`, `Squeeze the middle of the throat and let voice out.`]) },
          { glyph: 'غ', title: T([`Gárgara suave`, `غرغرة خفيفة`, `Soft gargle`]), text: T([`El fondo de la lengua roza el paladar blando, con voz.`, `أقصى اللسان يلامس الحنك اللين مع الصوت.`, `The back of the tongue brushes the soft palate, with voice.`]) },
        ], listen: ['letter:sad', 'letter:dad', 'letter:tta', 'letter:zza', 'letter:ayn', 'letter:ghayn'] },
    ],
    quizzes: [
      quiz([`¿Por qué se llama al árabe «lugat al-ḍād»?`, `لماذا تُسمّى العربية «لغة الضاد»؟`, `Why is Arabic called "the language of the Ḍād"?`],
        [opt(`Porque ض es la letra más común`, `لأنّ الضاد الأكثر شيوعاً`, `Because ض is the most common letter`), opt(`Porque el sonido ض es propio del árabe`, `لأنّ صوت الضاد خاصّ بالعربية`, `Because the ض sound is special to Arabic`), opt(`Porque el árabe empieza con ض`, `لأنّ العربية تبدأ بالضاد`, `Because Arabic starts with ض`), opt(`Es un nombre poético sin significado`, `اسم شعريّ فقط`, `It's just a poetic name`)], 1,
        [`Exacto. Ninguna otra lengua tiene el ض tal cual, por eso el árabe se identifica con él.`, `بالضبط. لا لغة أخرى فيها صوت الضاد الأصيل.`, `Exactly. No other language has the ض exactly as it is, so Arabic is identified with it.`], ['letter:dad']),
      quiz([`¿Qué pareja es «normal» y «pesada»?`, `أيّ زوج هو «مرقّق» و«مفخّم»؟`, `Which pair is "normal" and "heavy"?`],
        ['ب / ف', 'س / ص', 'م / ن', 'ك / ل'], 1,
        [`س (s normal) ↔ ص (s pesada). Otras parejas: ت↔ط, د↔ض, ذ↔ظ.`, `س (مرقّقة) ↔ ص (مفخّمة). وأزواج أخرى: ت↔ط، د↔ض، ذ↔ظ.`, `س (plain s) ↔ ص (heavy s). Other pairs: ت↔ط, د↔ض, ذ↔ظ.`], ['letter:sad']),
    ],
  });

  const S5 = groupStation(4, {
    title: T([`Grupo 4: ف ق ك ل`, `المجموعة 4: ف ق ك ل`, `Group 4: ف ق ك ل`]),
    intro: T([
      `Cuatro letras clave. Ojo con ق y ك: parecen hermanas, pero ق nace mucho más atrás. Y fíjate en ف y ق: solo cambian los puntos.`,
      `أربعة حروف مهمّة. انتبه للقاف والكاف: تبدوان أختين لكنّ القاف أعمق مخرجاً. ولاحظ الفاء والقاف: الفرق في النقاط.`,
      `Four key letters. Watch ق and ك: they look like sisters, but ق is made much farther back. And ف and ق differ only in their dots.`]),
    quizzes: [
      quiz([`¿Cuál es la letra que suena como una «k» hecha muy atrás en la garganta?`, `أيّ حرف يُنطق كالكاف لكن من أقصى الحلق؟`, `Which letter sounds like a "k" made very far back in the throat?`],
        ['ك', 'ق', 'ف', 'ل'], 1,
        [`ق (Qaaf): dos puntos arriba y sonido profundo. ك (Kaaf) es la «k» normal.`, `القاف: نقطتان فوقها وصوتها عميق. أما الكاف فهي الكاف العادية.`, `ق (Qaaf): two dots above and a deep sound. ك (Kaaf) is the normal "k".`], ['letter:qaf', 'letter:kaf']),
      quiz([`«لَيْلٌ» (layl) significa:`, `«لَيْلٌ» تعني:`, `"layl" (لَيْلٌ) means:`],
        [opt(`Día ☀️`, `نهار`, `Day ☀️`), opt(`Noche 🌌`, `ليل`, `Night 🌌`), opt(`Luna 🌙`, `قمر`, `Moon 🌙`), opt(`Libro 📖`, `كتاب`, `Book 📖`)], 1,
        [`Layl = noche. Empieza con ل (Laam).`, `ليل: تبدأ باللام.`, `Layl = night. It starts with ل (Laam).`], ['letter:lam']),
    ],
  });

  const S6 = groupStation(5, {
    title: T([`Grupo 5: م ن هـ و ي`, `المجموعة 5: م ن هـ و ي`, `Group 5: م ن هـ و ي`]),
    intro: T([
      `¡Última estación de letras! Con م ن ه و ي completas las 28. Ojo: و y ي pueden ser consonante o vocal larga.`,
      `آخر محطة للحروف! بـ م ن ه و ي تكتمل الحروف الـ28. انتبه: الواو والياء قد تكونان صامتتين أو حرفَي مدّ.`,
      `Last letter station! With م ن ه و ي you complete all 28. Note: و and ي can be a consonant or a long vowel.`]),
    quizzes: [
      quiz([`¿Qué letras pueden ser consonante o vocal larga?`, `أيّ حروف تأتي صامتة أو حرف مدّ؟`, `Which letters can be a consonant or a long vowel?`],
        ['ب · ت', 'و · ي', 'م · ن', 'ه · ك'], 1,
        [`و → «w» o «ū» · ي → «y» o «ī». (Y ا → «ā».) Alargan las vocales.`, `الواو (w / ū) والياء (y / ī)، وكذلك الألف (ā): تمدّ الحركات.`, `و → "w" or "ū" · ي → "y" or "ī". (And ا → "ā".) They lengthen vowels.`], ['letter:waw', 'letter:ya']),
      quiz([`¿Cuál de estas letras tiene formas MUY distintas según su posición?`, `أيّ حرف تختلف أشكاله كثيراً بحسب موضعه؟`, `Which letter has VERY different shapes depending on position?`],
        ['ب', 'ه', 'م', 'ن'], 1,
        [`ه: ه · هـ · ـهـ · ـه. ¡Parecen cuatro letras distintas!`, `الهاء: ه · هـ · ـهـ · ـه. تبدو كأربعة حروف مختلفة!`, `ه: ه · هـ · ـهـ · ـه. They look like four different letters!`], ['letter:ha']),
    ],
  });

  // ═══════════════ الوحدة 3: آلية القراءة ═══════════════
  const rd = VID.reading;
  const MK = (id) => D.MARKS.find(x => x.id === id);
  const markInfo = (markId, letters, video) => {
    const m = MK(markId);
    return {
      type: 'infographic', layout: 'grid', title: m.name,
      intro: m.look,
      items: [
        { glyph: m.glyph, title: T([`Cómo suena`, `كيف تُنطق`, `How it sounds`]), text: m.sound },
      ],
      examples: letters.map(l => syl(l, markId)),
      video,
      learns: ['mark:' + markId],
    };
  };
  const vidMark = (v, m, listen) => clip(v,
    T([`Vídeo: ${m.name.es}`, `فيديو: ${m.name.ar}`, `Video: ${m.name.en}`]),
    T([`${m.look.es} ${m.sound.es}`, `${m.look.ar} ${m.sound.ar}`, `${m.look.en} ${m.sound.en}`]), listen);
  const fatha = MK('fatha'), kasra = MK('kasra'), damma = MK('damma'), sukun = MK('sukun'), shadda = MK('shadda');
  const sample = ['ba', 'ta', 'jim', 'dal', 'ra', 'sin', 'fa', 'mim', 'nun'];

  const S7 = {
    id: 'harakat', kind: 'marks',
    icon: '<i class="fas fa-music"></i>',
    cover: { glyphs: ['بَ', 'بِ', 'بُ', 'بْ'], tone: 7 },
    title: T([`Las vocales y el sukun`, `الحركات والسكون`, `Vowels and the sukun`]),
    mascotIntro: T([
      `Las letras son consonantes. Las vocales cortas se escriben como signos pequeños arriba o abajo: fatḥa, kasra, ḍamma… y el sukun, que las quita.`,
      `الحروف صوامت، والحركات القصيرة علامات صغيرة فوق الحرف أو تحته: الفتحة والكسرة والضمّة… والسكون الذي يُسقطها.`,
      `Letters are consonants. Short vowels are small marks above or below: fatḥa, kasra, ḍamma… and the sukun, which removes them.`]),
    items: ['mark:fatha', 'mark:kasra', 'mark:damma', 'mark:sukun'],
    lessons: [
      { type: 'infographic', layout: 'grid',
        title: T([`Tres sonidos y un silencio`, `ثلاثة أصوات وسكون`, `Three sounds and a silence`]),
        intro: T([`Sobre la letra ب veremos cómo cambia el sonido.`, `على الحرف ب سنرى كيف يتغيّر الصوت.`, `On the letter ب we'll see how the sound changes.`]),
        items: [
          { glyph: 'بَ', title: T([`Fatḥa · a`, `فتحة · a`, `Fatḥa · a`]), text: T([`Rayita ARRIBA`, `شرطة فوق الحرف`, `Dash ABOVE`]), say: syl('ba', 'fatha') },
          { glyph: 'بِ', title: T([`Kasra · i`, `كسرة · i`, `Kasra · i`]), text: T([`Rayita DEBAJO`, `شرطة تحت الحرف`, `Dash BELOW`]), say: syl('ba', 'kasra') },
          { glyph: 'بُ', title: T([`Ḍamma · u`, `ضمّة · u`, `Ḍamma · u`]), text: T([`«و» diminuta ARRIBA`, `واو صغيرة فوق الحرف`, `Tiny «و» ABOVE`]), say: syl('ba', 'damma') },
          { glyph: 'بْ', title: T([`Sukun · —`, `سكون · —`, `Sukun · —`]), text: T([`Circulito: sin vocal`, `دائرة: بلا حركة`, `Small circle: no vowel`]), say: { text: 'بْ', label: 'b' } },
        ] },
      videoSeries(T([`Vídeo: cómo se lee el árabe`, `فيديو: كيف تُقرأ العربية`, `Video: how Arabic is read`]), [
        Object.assign({ label: T(['Introducción', 'مقدّمة', 'Intro']) }, clip(rd.intro,
          T([`Cómo se lee el árabe`, `كيف تُقرأ العربية`, `How Arabic is read`]),
          T([`Visión general de la lectura: las letras dan las consonantes y unos signos pequeños añaden las vocales. Fíjate en qué cambia al mover el signo de arriba a abajo.`,
             `نظرة عامة على القراءة: الحروف تعطي الصوامت وعلامات صغيرة تضيف الحركات. لاحظ ما يتغيّر عند نقل العلامة من فوق إلى تحت.`,
             `An overview of reading: letters give consonants and small marks add the vowels. Notice what changes when the mark moves from above to below.`]), [])),
        Object.assign({ label: T(['Las harakat', 'الحركات', 'Harakat']) }, clip(rd.general,
          T([`Las harakat en general`, `الحركات عموماً`, `The harakat in general`]),
          T([`Repaso de las tres vocales cortas y del sukun. Practica diciendo ba · bi · bu · b en voz alta.`, `مراجعة الحركات الثلاث والسكون. تدرّب على قول: بَ بِ بُ بْ بصوت مسموع.`, `A review of the three short vowels and the sukun. Practise saying ba · bi · bu · b aloud.`]),
          [syl('ba', 'fatha'), syl('ba', 'kasra'), syl('ba', 'damma')])),
      ]),
      markInfo('fatha', sample.slice(0, 5), vidMark(rd.fatha, fatha, sample.slice(0, 5).map(l => syl(l, 'fatha')))),
      markInfo('kasra', sample.slice(0, 5), vidMark(rd.kasra, kasra, sample.slice(0, 5).map(l => syl(l, 'kasra')))),
      markInfo('damma', sample.slice(0, 5), vidMark(rd.damma, damma, sample.slice(0, 5).map(l => syl(l, 'damma')))),
      { type: 'sound_grid', mode: 'marks', letters: sample, marks: ['fatha', 'kasra', 'damma'],
        title: T([`Tabla de sonidos: a · i · u`, `جدول الأصوات: a · i · u`, `Sound table: a · i · u`]) },
      { type: 'listen_choose', items: ['mark:fatha', 'mark:kasra', 'mark:damma'] },
      quiz([`¿Cómo se pronuncia «بُ»?`, `كيف تُنطق «بُ»؟`, `How is "بُ" pronounced?`], ['ba', 'bi', 'bu', 'b'], 2,
        [`Correcto: bu. La ḍamma (la «و» diminuta) da el sonido «u».`, `صحيح: بُ. الضمّة تعطي صوت الواو القصير.`, `Correct: bu. The ḍamma (the tiny «و») gives the "u" sound.`], ['mark:damma']),
      markInfo('sukun', ['ba', 'ta', 'nun', 'mim', 'lam'], vidMark(rd.sukun, sukun, [])),
      { type: 'match_pairs', title: T([`Une cada signo con su sonido`, `طابق كلّ علامة بصوتها`, `Match each mark with its sound`]),
        pairs: [
          { l: fatha.glyph, r: T(['a (corta)', 'a قصيرة', 'a (short)']), rtl: true },
          { l: kasra.glyph, r: T(['i (corta)', 'i قصيرة', 'i (short)']), rtl: true },
          { l: damma.glyph, r: T(['u (corta)', 'u قصيرة', 'u (short)']), rtl: true },
          { l: sukun.glyph, r: T(['sin vocal', 'بلا حركة', 'no vowel']), rtl: true },
        ] },
      quiz([`«كِتَابٌ» (kitāb) lleva:`, `«كِتَابٌ» فيها:`, `"كِتَابٌ" (kitāb) contains:`],
        [opt(`Fatha + Damma`, `فتحة + ضمّة`, `Fatha + Damma`), opt(`Kasra + Fatha + Damma`, `كسرة + فتحة + ضمّة`, `Kasra + Fatha + Damma`), opt(`Solo Fatha`, `فتحة فقط`, `Only Fatha`), opt(`Sukun + Kasra`, `سكون + كسرة`, `Sukun + Kasra`)], 1,
        [`Kasra (ki) + fatḥa (ta) + alif larga (ā) + ḍamma con tanwīn (bun) = «kitābun».`, `كسرة (كِ) + فتحة (تَ) + ألف ممدودة + ضمّة مع تنوين (بٌ).`, `Kasra (ki) + fatḥa (ta) + long alif (ā) + ḍamma with tanween (bun) = "kitābun".`]),
      { type: 'checkpoint', items: ['mark:fatha', 'mark:kasra', 'mark:damma', 'mark:sukun'], n: 5, pass: 0.8 },
    ],
  };

  const tf = MK('tan_fath'), tk = MK('tan_kasr'), td = MK('tan_damm');
  const S8 = {
    id: 'tanween_shadda', kind: 'marks',
    icon: '<i class="fas fa-layer-group"></i>',
    cover: { glyphs: ['بّ', 'بً', 'بٍ', 'بٌ'], tone: 8 },
    title: T([`Tanween y shadda`, `التنوين والشدّة`, `Tanween and shadda`]),
    mascotIntro: T([
      `Dos signos más y ya sabrás leer casi cualquier palabra vocalizada: la shadda dobla la letra y el tanween añade una «n» al final.`,
      `علامتان فقط وتقرأ أيّ كلمة مُشكَّلة: الشدّة تضاعف الحرف، والتنوين يضيف نوناً في آخر الكلمة.`,
      `Two more marks and you can read almost any vowelled word: the shadda doubles a letter and the tanween adds an "n" at the end.`]),
    items: ['mark:shadda', 'mark:tan_fath', 'mark:tan_kasr', 'mark:tan_damm'],
    lessons: [
      { type: 'infographic', layout: 'grid', title: shadda.name, intro: shadda.look,
        items: [{ glyph: shadda.glyph, title: T([`Cómo suena`, `كيف تُنطق`, `How it sounds`]), text: shadda.sound }],
        examples: [
          { text: 'رَبّ', label: 'rabb' }, { text: 'حَقّ', label: 'ḥaqq' }, { text: 'حُبّ', label: 'ḥubb' }, { text: 'أُمّ', label: 'umm' },
        ],
        video: vidMark(rd.shadda, shadda, []),
        learns: ['mark:shadda'] },
      quiz([`¿Qué signo significa «letra doblada»?`, `أيّ علامة تدلّ على تضعيف الحرف؟`, `Which mark means "doubled letter"?`],
        [opt(`Fatha (ـَ)`, `فتحة`, `Fatha`), opt(`Sukūn (ـْ)`, `سكون`, `Sukūn`), opt(`Shadda (ـّ)`, `شدّة`, `Shadda`), opt(`Kasra (ـِ)`, `كسرة`, `Kasra`)], 2,
        [`La shadda (ـّ): la letra se dice DOS veces, la primera sin vocal y la segunda con ella.`, `الشدّة (ـّ): يُنطق الحرف مرّتين، الأولى ساكنة والثانية متحرّكة.`, `The shadda (ـّ): the letter is said TWICE, first without a vowel and then with it.`], ['mark:shadda']),
      { type: 'gen_quiz', items: ['mark:shadda'] },
      { type: 'infographic', layout: 'grid', title: T([`Tanween: la «n» final`, `التنوين: نون في الآخر`, `Tanween: the final "n"`]),
        intro: T([`Va solo al final de la palabra. Es como duplicar la vocal: an · in · un.`, `يأتي في آخر الكلمة فقط. هو حركة مضاعفة: an · in · un.`, `Only at the end of a word. It's a doubled vowel: an · in · un.`]),
        items: [
          { glyph: tf.glyph, title: T([`Tanween fatḥ · an`, `تنوين فتح · an`, `Tanween fatḥ · an`]), text: T([`كِتَابًا · kitāban`, `كِتَابًا`, `كِتَابًا · kitāban`]), say: { text: 'كِتَابًا', label: 'kitāban' } },
          { glyph: tk.glyph, title: T([`Tanween kasr · in`, `تنوين كسر · in`, `Tanween kasr · in`]), text: T([`كِتَابٍ · kitābin`, `كِتَابٍ`, `كِتَابٍ · kitābin`]), say: { text: 'كِتَابٍ', label: 'kitābin' } },
          { glyph: td.glyph, title: T([`Tanween ḍamm · un`, `تنوين ضمّ · un`, `Tanween ḍamm · un`]), text: T([`كِتَابٌ · kitābun`, `كِتَابٌ`, `كِتَابٌ · kitābun`]), say: { text: 'كِتَابٌ', label: 'kitābun' } },
        ],
        video: clip(rd.tanween,
          T([`Vídeo: el tanween`, `فيديو: التنوين`, `Video: the tanween`]),
          T([`El tanween se pronuncia como una «n» que NO se escribe como letra. Con fatḥ suele llevar una alif detrás (ـًا). Escucha las tres terminaciones y repítelas.`,
             `التنوين نون ساكنة تُنطق ولا تُكتب حرفاً. مع الفتح يُكتب غالباً مع ألف (ـًا). استمع إلى النهايات الثلاث وكرّرها.`,
             `The tanween is pronounced like an "n" that is NOT written as a letter. With fatḥ it usually takes an alif (ـًا). Listen to the three endings and repeat them.`]),
          [{ text: 'كِتَابًا', label: 'kitāban' }, { text: 'كِتَابٍ', label: 'kitābin' }, { text: 'كِتَابٌ', label: 'kitābun' }]),
        learns: ['mark:tan_fath', 'mark:tan_kasr', 'mark:tan_damm'] },
      { type: 'sound_grid', mode: 'marks', letters: ['ba', 'ta', 'kaf', 'mim', 'nun'], marks: ['tan_fath', 'tan_kasr', 'tan_damm'],
        title: T([`Tabla de sonidos: an · in · un`, `جدول الأصوات: an · in · un`, `Sound table: an · in · un`]) },
      { type: 'match_pairs', title: T([`Une cada tanween con su sonido`, `طابق كلّ تنوين بصوته`, `Match each tanween with its sound`]),
        pairs: [
          { l: tf.glyph, r: 'an', rtl: true }, { l: tk.glyph, r: 'in', rtl: true }, { l: td.glyph, r: 'un', rtl: true },
        ] },
      { type: 'fill_blank', before: 'كِتَاب', after: '', options: ['ـٌ', 'ـٍ', 'ـً', 'ـْ'], correct: 0,
        translation: T([`Completa para leer «kitābun».`, `أكمل لتقرأ «kitābun».`, `Complete it to read "kitābun".`]),
        feedback: T([`ـٌ (tanween ḍamm) = «un»: kitābun.`, `ـٌ (تنوين ضمّ) = «un»: كِتَابٌ.`, `ـٌ (tanween ḍamm) = "un": kitābun.`]), learns: ['mark:tan_damm'] },
      { type: 'checkpoint', items: ['mark:shadda', 'mark:tan_fath', 'mark:tan_kasr', 'mark:tan_damm'], n: 5, pass: 0.8 },
      { type: 'flashcards', title: T([`Repaso de signos`, `مراجعة العلامات`, `Marks review`]), items: ['mark:fatha', 'mark:kasra', 'mark:damma', 'mark:sukun', 'mark:shadda', 'mark:tan_fath', 'mark:tan_kasr', 'mark:tan_damm'] },
    ],
  };

  // ═══════════════ الوحدة 4: كلمات وقراءة ═══════════════
  const S9 = {
    id: 'joining', kind: 'writing',
    icon: '<i class="fas fa-link"></i>',
    cover: { glyphs: ['بـ', 'ـيـ', 'ـت'], tone: 9 },
    title: T([`Unir las letras`, `وصل الحروف`, `Joining letters`]),
    mascotIntro: T([
      `Ahora unimos las letras para formar palabras. Verás cada letra cambiar según su posición y cómo se escribe, una por una.`,
      `الآن نصل الحروف لنكوّن كلمات. سترى كل حرف يتغيّر بحسب موضعه وكيف يُكتب، حرفاً حرفاً.`,
      `Now we join letters into words. You'll see each letter change with its position and how it is written, one by one.`]),
    items: lid(['ba', 'jim', 'sin', 'ayn', 'fa', 'kaf', 'mim', 'ha', 'ya', 'dal', 'ra']),
    lessons: [
      { type: 'infographic', layout: 'steps', title: T([`Así se unen las letras`, `هكذا تتّصل الحروف`, `How letters join`]),
        intro: T([`Se une por la derecha de cada letra, porque escribimos hacia la izquierda.`, `يتّصل الحرف بما قبله من جهة اليمين لأننا نكتب نحو اليسار.`, `Each letter joins on its right, because we write toward the left.`]),
        items: [
          { icon: 'fa-1', title: T([`Elige la forma según la posición`, `اختر الشكل بحسب الموضع`, `Pick the shape by position`]), text: T([`Inicial بـ · medial ـبـ · final ـب · aislada ب.`, `أول بـ · وسط ـبـ · آخر ـب · منفصل ب.`, `Initial بـ · medial ـبـ · final ـب · isolated ب.`]) },
          { icon: 'fa-2', title: T([`Seis letras NO se unen a la siguiente`, `ستّة حروف لا تتّصل بما بعدها`, `Six letters do NOT join the next`]), text: T([`ا د ذ ر ز و: después de ellas, la palabra «se corta» y la siguiente letra empieza de nuevo.`, `ا د ذ ر ز و: بعدها تنقطع الكلمة ويبدأ الحرف التالي بشكله الأول.`, `ا د ذ ر ز و: after them the word "breaks" and the next letter starts fresh.`]) },
          { icon: 'fa-3', title: T([`Ejemplo: بـ + ـيـ + ـت`, `مثال: بـ + ـيـ + ـت`, `Example: بـ + ـيـ + ـت`]), text: T([`= بَيْت (bayt, casa).`, `= بَيْت.`, `= بَيْت (bayt, house).`]), say: { text: 'بَيْتٌ', label: 'bayt' } },
        ] },
      videoSeries(T([`Vídeo: cómo se escriben ا ب ت ث ج ح خ`, `فيديو: كتابة ا ب ت ث ج ح خ`, `Video: how to write ا ب ت ث ج ح خ`]), writingSeries(letterIds(1))),
      videoSeries(T([`Vídeo: cómo se escriben د ذ ر ز س ش ص ض`, `فيديو: كتابة د ذ ر ز س ش ص ض`, `Video: how to write د ذ ر ز س ش ص ض`]), writingSeries(['dal', 'dhal', 'ra', 'zay', 'sin', 'shin', 'sad', 'dad'])),
      videoSeries(T([`Vídeo: cómo se escriben ط ظ ع غ ف ق ك ل`, `فيديو: كتابة ط ظ ع غ ف ق ك ل`, `Video: how to write ط ظ ع غ ف ق ك ل`]), writingSeries(['tta', 'zza', 'ayn', 'ghayn', 'fa', 'qaf', 'kaf', 'lam'])),
      videoSeries(T([`Vídeo: cómo se escriben م ن ه و ي ة ى`, `فيديو: كتابة م ن ه و ي ة ى`, `Video: how to write م ن ه و ي ة ى`]), writingSeries(['mim', 'nun', 'ha', 'waw', 'ya'], ['taa_marbuta', 'alif_maqsura'])),
      { type: 'write_trace', group: 1 },
      { type: 'write_trace', group: 2 },
      { type: 'write_trace', group: 3 },
      { type: 'write_trace', group: 4 },
      { type: 'write_trace', group: 5 },
      { type: 'word_builder', word: 'بيت', vocal: 'بَيْتٌ', tr: 'bayt', meaning: T([`casa`, `بيت`, `house`]), emoji: '🏠', slug: 'bayt',
        parts: ['بـ', 'ـيـ', 'ـت'], extra: ['ـبـ', 'ت'], learns: ['word:bayt'] },
      { type: 'word_builder', word: 'كتاب', vocal: 'كِتَابٌ', tr: 'ki-tāb', meaning: T([`libro`, `كتاب`, `book`]), emoji: '📖', slug: 'kitab',
        parts: ['كـ', 'ـتـ', 'ـا', 'ب'], extra: ['ـكـ', 'ـب'], learns: ['word:kitab'] },
      { type: 'word_builder', word: 'مسجد', vocal: 'مَسْجِدٌ', tr: 'mas-jid', meaning: T([`mezquita`, `مسجد`, `mosque`]), emoji: '🕌', slug: 'masjid',
        parts: ['مـ', 'ـسـ', 'ـجـ', 'ـد'], extra: ['ـمـ', 'د'], learns: ['word:masjid'] },
      { type: 'match_pairs', gen: 'forms', letters: ['ha', 'kaf', 'ayn', 'ya'], title: T([`Une cada forma con su posición`, `طابق كلّ شكل بموضعه`, `Match each shape with its position`]) },
      { type: 'gen_quiz', special: 'nonconn' },
      { type: 'checkpoint', items: lid(['ba', 'jim', 'sin', 'ayn', 'fa', 'kaf', 'mim', 'ha', 'ya', 'dal', 'ra']), n: 5, pass: 0.8, qtype: 'form' },
    ],
  };

  const vocabLesson = (title, slugs, intro) => ({ type: 'vocab', title, words: slugs, intro, learns: wid(slugs) });
  const tp = (id) => V.TOPICS.find(x => x.id === id).title;
  const part = (topic, n) => T([`${tp(topic).es} (${n}/2)`, `${tp(topic).ar} (${n}/2)`, `${tp(topic).en} (${n}/2)`]);
  const faith = words('faith'), worship = words('worship'), phrases = words('phrases');
  const family = words('family'), numcol = words('numcol'), life = words('life');
  const numbers = numcol.slice(0, 10), colors = numcol.slice(10);
  const matchWords = (pool) => ({ type: 'match_pairs', gen: 'words', words: pool, n: 5, title: T([`Une cada palabra con su significado`, `طابق كلّ كلمة بمعناها`, `Match each word with its meaning`]) });

  const S10 = {
    id: 'vocab_islam', kind: 'vocab',
    icon: '<i class="fas fa-mosque"></i>',
    cover: { glyphs: ['الله', 'قرآن', 'مسجد'], tone: 10 },
    title: T([`Palabras del Islam`, `كلمات إسلامية`, `Words of Islam`]),
    mascotIntro: T([
      `Aquí están las palabras que oirás cada día: Allah, Corán, mezquita, oración… Cada una con su audio y una pista para pronunciarla bien.`,
      `هذه الكلمات التي ستسمعها كل يوم: الله، القرآن، المسجد، الصلاة… لكلّ منها صوت وتلميح لنطقها نطقاً سليماً.`,
      `These are the words you'll hear every day: Allah, Quran, mosque, prayer… each with audio and a tip to pronounce it well.`]),
    items: wid(faith.concat(worship, phrases)),
    lessons: [
      { type: 'roots' },
      vocabLesson(part('faith', 1), faith.slice(0, 9)),
      vocabLesson(part('faith', 2), faith.slice(9)),
      matchWords(faith),
      vocabLesson(part('worship', 1), worship.slice(0, 10)),
      vocabLesson(part('worship', 2), worship.slice(10)),
      { type: 'gen_quiz', items: wid(worship), qtype: 'image' },
      { type: 'listen_choose', items: wid(worship) },
      vocabLesson(part('phrases', 1), phrases.slice(0, 9)),
      vocabLesson(part('phrases', 2), phrases.slice(9)),
      { type: 'scenario', emoji: '👋',
        situation: T([`Te cruzas con un vecino musulmán y quieres saludarlo. ¿Qué dices?`, `تلتقي جاراً مسلماً وتريد أن تسلّم عليه. ماذا تقول؟`, `You meet a Muslim neighbour and want to greet him. What do you say?`]),
        options: ['السَّلَامُ عَلَيْكُمْ', 'شُكْرًا', 'بِسْمِ اللَّهِ', 'نَعَمْ'], correct: 0,
        feedback: T([`«As-salāmu ʿalaykum»: la paz sea contigo. Se responde: «wa ʿalaykumu s-salām».`, `«السلام عليكم» تحيّة الإسلام، وجوابها «وعليكم السلام».`, `"As-salāmu ʿalaykum": peace be upon you. The reply is "wa ʿalaykumu s-salām".`]),
        learns: ['word:salam_alaykum'] },
      { type: 'scenario', emoji: '🍽️',
        situation: T([`Vas a empezar a comer. ¿Qué dices antes del primer bocado?`, `ستبدأ بالأكل. ماذا تقول قبل أول لقمة؟`, `You're about to start eating. What do you say before the first bite?`]),
        options: ['بِسْمِ اللَّهِ', 'أَسْتَغْفِرُ اللَّهَ', 'لَا', 'أَهْلًا وَسَهْلًا'], correct: 0,
        feedback: T([`«Bismillāh»: en el nombre de Allah. Se dice al empezar cualquier cosa buena.`, `«بسم الله» تُقال عند بدء كل عمل صالح.`, `"Bismillāh": in the name of Allah. Said when starting anything good.`]),
        learns: ['word:bismillah'] },
      { type: 'scenario', emoji: '🕌',
        situation: T([`Es la hora de Duhr y estás en el mercado. Buscas un lugar para rezar. ¿Qué palabra necesitas para preguntar dónde está?`, `حان وقت الظهر وأنت في السوق. تبحث عن مكان للصلاة. ما الكلمة التي تحتاجها لتسأل عنه؟`, `It's time for Dhuhr and you're at the market. You're looking for a place to pray. Which word do you need to ask where it is?`]),
        options: ['مَسْجِد', 'بَيْت', 'مَاء', 'كِتَاب'], correct: 0,
        feedback: T([`«Masjid» = mezquita, el lugar de la postración (sujūd).`, `«مسجد» من السجود: مكان السجود.`, `"Masjid" = mosque, the place of prostration (sujūd).`]),
        learns: ['word:masjid'] },
      { type: 'fill_blank', before: '', after: 'لِلَّهِ', options: ['الْحَمْدُ', 'الْكِتَابُ', 'الْقَمَرُ', 'الْبَيْتُ'], correct: 0,
        translation: T([`Completa: «alabado sea Allah».`, `أكمل: «الثناء لله».`, `Complete: "praise be to Allah".`]),
        feedback: T([`«Al-ḥamdu lillāh» = alabado sea Allah. Alḥamd = la alabanza.`, `«الحمد لله» = الثناء والشكر لله.`, `"Al-ḥamdu lillāh" = praise be to Allah. Ḥamd = praise.`]), learns: ['word:alhamdulillah'] },
      { type: 'checkpoint', items: wid(['allah', 'quran', 'masjid', 'salah', 'wudu', 'dua', 'zakah', 'ramadan', 'bismillah', 'alhamdulillah']), n: 5, pass: 0.8 },
    ],
  };

  const S11 = {
    id: 'vocab_life', kind: 'vocab',
    icon: '<i class="fas fa-house"></i>',
    cover: { glyphs: ['بيت', 'ماء', 'أب'], tone: 11 },
    title: T([`Palabras de cada día`, `كلمات الحياة اليومية`, `Everyday words`]),
    mascotIntro: T([
      `Familia, números, colores y cosas de casa: el vocabulario básico para empezar a entender el mundo en árabe.`,
      `الأسرة والأرقام والألوان وأشياء البيت: المفردات الأساسية لتبدأ فهم العالم بالعربية.`,
      `Family, numbers, colours and things at home: the basic vocabulary to start understanding the world in Arabic.`]),
    items: wid(family.concat(numcol, life)),
    lessons: [
      vocabLesson(tp('family'), family),
      matchWords(family),
      vocabLesson(T([`Números 1–10`, `الأرقام ١–١٠`, `Numbers 1–10`]), numbers),
      { type: 'listen_choose', items: wid(numbers) },
      vocabLesson(T([`Colores`, `الألوان`, `Colours`]), colors),
      { type: 'gen_quiz', items: wid(colors), qtype: 'image' },
      vocabLesson(tp('life'), life),
      matchWords(life),
      { type: 'checkpoint', items: wid(['ab', 'umm', 'sadiq', 'khamsa', 'ahmar', 'bayt', 'maa', 'shams', 'qamar', 'qalam']), n: 5, pass: 0.8 },
    ],
  };

  const S12 = {
    id: 'reading', kind: 'reading',
    icon: '<i class="fas fa-book-quran"></i>',
    cover: { glyphs: ['بِسْمِ', 'اللَّهِ'], tone: 12 },
    title: T([`Lee frases del Corán`, `قراءة عبارات قرآنية`, `Read Quranic phrases`]),
    mascotIntro: T([
      `¡Es el momento! Vas a leer frases reales del Corán palabra por palabra, entender qué dice cada una y armarlas tú mismo.`,
      `حان الوقت! ستقرأ عبارات حقيقية من القرآن كلمة كلمة، وتفهم معنى كلّ كلمة، وتركّبها بنفسك.`,
      `It's time! You'll read real phrases from the Quran word by word, understand each one, and put them together yourself.`]),
    items: wid(['allah', 'rabb', 'quran', 'dua', 'bismillah', 'alhamdulillah', 'la_ilaha']),
    lessons: [
      { type: 'phrase', ids: ['basmala'] },
      { type: 'fill_blank', before: 'بِسْمِ', after: 'الرَّحْمَٰنِ الرَّحِيمِ', options: ['اللَّهِ', 'رَبِّ', 'كِتَابٌ', 'أَحَدٌ'], correct: 0,
        translation: T([`Completa la Basmala.`, `أكمل البسملة.`, `Complete the Basmala.`]),
        feedback: T([`«Bismi llāhi r-raḥmāni r-raḥīm»: en el nombre de Allah, el Compasivo, el Misericordioso.`, `«بسم الله الرحمن الرحيم».`, `"Bismi llāhi r-raḥmāni r-raḥīm": in the name of Allah, the Most Compassionate, the Most Merciful.`]), learns: ['word:allah'] },
      { type: 'phrase', ids: ['hamd'] },
      { type: 'phrase', ids: ['fatiha3'] },
      { type: 'phrase', ids: ['fatiha4'] },
      { type: 'phrase', ids: ['fatiha5'] },
      { type: 'phrase', ids: ['fatiha6'] },
      { type: 'phrase', ids: ['fatiha7'] },
      { type: 'word_order', phrase: 'fatiha5' },
      videoLesson(VID.fatihaFull,
        T([`Vídeo: Sura Al-Fátiha completa`, `فيديو: سورة الفاتحة كاملة`, `Video: Full Surah Al-Fatiha`]),
        T([`Ya leíste sus 7 aleyas una a una. Ahora escúchalas recitadas seguidas, con su traducción al español. Puedes repetir el vídeo las veces que quieras.`,
           `قرأتَ آياتها السبع آية آية. الآن استمع إليها متتالية مع ترجمتها إلى الإسبانية. يمكنك إعادة الفيديو ما شئت من المرات.`,
           `You've just read its 7 ayat one by one. Now listen to them recited in sequence, with the Spanish translation. You can replay the video as many times as you like.`])),
      { type: 'phrase', ids: ['ikhlas1'] },
      { type: 'phrase', ids: ['ikhlas2', 'ikhlas3', 'ikhlas4'] },
      { type: 'word_order', phrase: 'ikhlas1' },
      videoLesson(VID.ikhlasFull,
        T([`Vídeo: Sura Al-Ikhlas completa`, `فيديو: سورة الإخلاص كاملة`, `Video: Full Surah Al-Ikhlas`]),
        T([`Ya leíste sus 4 aleyas. Escúchalas ahora recitadas seguidas, con su traducción al español. Puedes repetir el vídeo las veces que quieras.`,
           `قرأتَ آياتها الأربع. استمع إليها الآن متتالية مع ترجمتها إلى الإسبانية. يمكنك إعادة الفيديو ما شئت من المرات.`,
           `You've just read its 4 ayat. Now listen to them recited in sequence, with the Spanish translation. You can replay the video as many times as you like.`])),
      { type: 'checkpoint', items: wid(['allah', 'rabb', 'quran', 'dua', 'bismillah', 'alhamdulillah', 'la_ilaha', 'kitab', 'sura', 'aya']), n: 5, pass: 0.8 },
    ],
  };

  const S13 = {
    id: 'final_exam', kind: 'exam',
    icon: '<i class="fas fa-graduation-cap"></i>',
    cover: { icon: 'fa-graduation-cap', tone: 13 },
    title: T([`Examen final`, `الامتحان النهائي`, `Final exam`]),
    mascotIntro: T([
      `Última parada: 20 preguntas variadas, con audio e imágenes. Con 70% apruebas y recibes tu certificado de bronce, plata u oro.`,
      `المحطة الأخيرة: 20 سؤالاً متنوّعاً بالصوت والصور. بنسبة 70% تنجح وتنال شهادتك البرونزية أو الفضّية أو الذهبية.`,
      `Last stop: 20 mixed questions with audio and pictures. Pass with 70% and earn your bronze, silver or gold certificate.`]),
    items: [],
    lessons: [
      { type: 'infographic', layout: 'grid', title: T([`Antes de empezar`, `قبل أن تبدأ`, `Before you start`]),
        items: [
          { icon: 'fa-list-check', title: T([`20 preguntas`, `٢٠ سؤالاً`, `20 questions`]), text: T([`Letras, sonidos, vocales, palabras e imágenes.`, `حروف وأصوات وحركات وكلمات وصور.`, `Letters, sounds, vowels, words and pictures.`]) },
          { icon: 'fa-volume-high', title: T([`Con audio`, `بالصوت`, `With audio`]), text: T([`Sube el volumen: habrá preguntas para escuchar.`, `ارفع الصوت: ستكون هناك أسئلة للاستماع.`, `Turn the sound on: some questions are for listening.`]) },
          { icon: 'fa-bullseye', title: T([`Se aprueba con 70%`, `النجاح بنسبة 70%`, `Pass with 70%`]), text: T([`Si no llegas, repasas las falladas y lo intentas de nuevo.`, `إن لم تبلغها راجعت الأخطاء وأعدت المحاولة.`, `If you miss it, review the mistakes and try again.`]) },
          { icon: 'fa-medal', title: T([`Certificado con nivel`, `شهادة بمستوى`, `Levelled certificate`]), text: T([`Bronce 70–79% · Plata 80–89% · Oro 90–100%.`, `برونزي 70–79% · فضّي 80–89% · ذهبي 90–100%.`, `Bronze 70–79% · Silver 80–89% · Gold 90–100%.`]) },
        ] },
      { type: 'final_exam', n: 20, pass: 0.7 },
    ],
  };

  // ═══════════════ الكورس ═══════════════
  const units = [
    { id: 'basics', icon: '<i class="fas fa-seedling"></i>', title: T([`Lo esencial`, `الأساسيات`, `The basics`]), stations: [S1] },
    { id: 'letters', icon: '<i class="fas fa-font"></i>', title: T([`Las letras`, `الحروف`, `The letters`]), stations: [S2, S3, S4, S5, S6] },
    { id: 'reading_mechanics', icon: '<i class="fas fa-music"></i>', title: T([`Cómo se lee`, `آلية القراءة`, `How reading works`]), stations: [S7, S8] },
    { id: 'words', icon: '<i class="fas fa-book-open-reader"></i>', title: T([`Palabras y lectura`, `كلمات وقراءة`, `Words and reading`]), stations: [S9, S10, S11, S12, S13] },
  ];

  return {
    id: 'arabic_language',
    slug: 'arabic-language',
    version: 2,
    icon: '<img class="cx-icon-img" src="assets/courses/arabic/icon-192.webp" alt="" width="56" height="56" decoding="async">',
    iconImage: 'assets/courses/arabic/icon.webp',
    certIcon: '🔑',
    mascotPose: 'welcome',
    color: '#174430',
    accent: '#D4A537',
    ageGroup: 'all',
    durationMin: 180,
    dailyGoalMin: 10,
    difficulty: 'beginner',
    title: T([
      `Árabe: la llave para comprender el Corán`,
      `اللغة العربية: مفتاحك لفهم القرآن`,
      `Arabic: Your Key to Understanding the Quran`]),
    description: T([
      `De las letras a las primeras frases del Corán: forma, sonido y escritura de cada letra, vocales, palabras esenciales del Islam y examen final con certificado.`,
      `من الحروف إلى أولى عبارات القرآن: شكل كلّ حرف وصوته وكتابته، والحركات، وكلمات إسلامية أساسية، وامتحان نهائي بشهادة.`,
      `From letters to your first Quranic phrases: the shape, sound and writing of each letter, vowels, essential Islamic words and a final exam with a certificate.`]),
    units,
    stations: units.reduce((a, u) => a.concat(u.stations), []),
    exam: { stationId: 'final_exam', pass: 0.7, tiers: { gold: 0.9, silver: 0.8, bronze: 0.7 } },
    // ترحيل تقدّم الإصدار القديم (v1) إلى المحطات الجديدة
    legacyStationMap: {
      intro: ['welcome'],
      letters_group_1: ['letters_1'],
      letters_group_2: ['letters_2'],
      letters_group_3: ['letters_3'],
      letters_group_4: ['letters_4', 'letters_5'],
      harakat: ['harakat'],
    },
  };
})();

if (typeof window !== 'undefined') window.COURSE_ARABIC_LANGUAGE = COURSE_ARABIC_LANGUAGE;
if (typeof module !== 'undefined') module.exports = COURSE_ARABIC_LANGUAGE;
