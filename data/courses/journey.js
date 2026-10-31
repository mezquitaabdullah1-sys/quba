// 🗺️ Course: "Rihlat al-Muslim" (رحلة المسلم) — v106
// إعادة هيكلة كاملة: 4 محطات (21 درساً) ← 9 محطات (~77 درساً)
// على نمط كورس «اللغة العربية»: غلاف ← خريطة ← إنفوجرافيك ← بطاقات عميقة
// ← فيديو ← بطاقات مراجعة ← اختبار. المحطات 4–9 في journey_b/c.js
//
// ⚠️ ضوابط المحتوى: لا يُرسم النبي ﷺ ولا أي صحابي؛ الرمز فقط (مئذنة/كتاب/هلال/ضوء).
// الأحاديث مذكورة باختصار مع مصدرها، والآيات بنصّها.
//
// @audience فضوليون + مسلمون جدد (بلا خلفية سابقة)
// @duration ~190 دقيقة (هدف يومي 10 دقائق ≈ 20 يوماً)

// ── مساعدات التأليف ────────────────────────────────────────────
function JT(ar, es, en) { return { ar: ar, es: es, en: en }; }

function jCard(title, content, source, tip) {
  var o = { type: 'card', title: title, content: content };
  if (source) o.source = source;
  if (tip) o.tip = tip;
  return o;
}
function jInfo(layout, title, items, intro, source) {
  var o = { type: 'infographic', layout: layout, title: title, items: items };
  if (intro) o.intro = intro;
  if (source) o.source = source;
  return o;
}
function jItem(icon, title, text) { return { icon: icon, title: title, text: text }; }
function jQuiz(question, options, correct, feedback) {
  return { type: 'quiz', question: question, options: options, correct: correct, feedback: feedback };
}
function jScn(emoji, situation, options, correct, feedback) {
  return { type: 'scenario', emoji: emoji, situation: situation, options: options, correct: correct, feedback: feedback };
}
function jFlash(title, pairs) {
  return {
    type: 'flashcards', title: title,
    cards: pairs.map(function (p) { return { front: p[0], back: p[1] }; }),
  };
}
function jVideo(id, title, summary, start, end) {
  return {
    type: 'video', skippable: true, provider: 'youtube', id: id,
    start: start || 0, end: end || 0, title: title, summary: summary, listen: [],
  };
}
function jCheck(title, items, intro) {
  return { type: 'checklist', title: title, intro: intro, items: items };
}

const COURSE_JOURNEY = {
  id: 'journey',
  icon: '<i class="fas fa-map"></i>',
  mascotPose: 'welcome',
  color: '#0F4C3A',
  ageGroup: 'all',
  durationMin: 190,
  difficulty: 'beginner',
  title: {
    es: 'Rihlat al-Muslim (Viaje del Musulmán)',
    ar: 'رحلة المسلم',
    en: "Muslim's Journey",
  },
  description: {
    es: '9 estaciones y 77 lecciones: de «¿qué hago ahora?» a una vida musulmana con sentido. Para curiosos y nuevos musulmanes.',
    ar: '9 محطات و77 درساً: من «ماذا أفعل الآن؟» إلى حياة مسلمة واضحة. للفضوليين والمسلمين الجدد.',
    en: '9 stations and 77 lessons: from "what do I do now?" to a clear Muslim life. For the curious and new Muslims.',
  },
  stations: [
    // ═══════════════════ المحطة 1 ═══════════════════
    {
      id: 'welcome',
      icon: '<i class="fas fa-door-open"></i>',
      title: { ar: 'الترحيب وأول خطواتك', es: 'Bienvenida y primeros pasos', en: 'Welcome and first steps' },
      mascotIntro: {
        ar: 'أهلاً بك. لن أطلب منك أن تعرف كل شيء اليوم — فقط الخطوة التالية.',
        es: 'Bienvenido. No te pediré que lo sepas todo hoy: solo el siguiente paso.',
        en: "Welcome. I won't ask you to know everything today — just the next step.",
      },
      lessons: [
        jCard(
          JT('أهلاً بك في رحلة المسلم',
            'Bienvenido al Viaje del Musulmán',
            'Welcome to the Muslim Journey'),
          JT('هذه ليست صفحة تُقرأ مرة واحدة، بل طريق تمشيه خطوة خطوة. في كل محطة تجد بطاقة قصيرة تشرح فكرة، ثم سؤالاً يتأكد أن الفكرة وصلت، ثم مراجعة سريعة.\n\nلا تحتاج خلفية سابقة، ولا تحتاج أن تعرف كل شيء قبل أن تبدأ. من حقّك أن تسأل، ومن حقّك أن تتوقف وتعود.\n\n🎯 **هدف الرحلة:** أن تفهم من هو الله، ولماذا أُرسل محمد ﷺ، وكيف تعيش إسلامك في يومك العادي — بلطف مع نفسك.',
            'No es una página para leer una vez, sino un camino que se recorre paso a paso. En cada estación: una tarjeta breve, una pregunta que confirma la idea y un repaso rápido.\n\nNo necesitas formación previa ni saberlo todo antes de empezar. Tienes derecho a preguntar, a parar y a volver.\n\n🎯 **Objetivo:** entender quién es Allah, por qué fue enviado Muhammad ﷺ y cómo vivir tu Islam en un día normal — con paciencia contigo mismo.',
            "This is not a page to read once, but a path you walk step by step. Each station has a short card, a question that confirms the idea, and a quick review.\n\nYou need no background and no prior knowledge. You have the right to ask, to pause, and to come back.\n\n🎯 **Goal:** understand who Allah is, why Muhammad ﷺ was sent, and how to live your Islam in an ordinary day — gently with yourself."),
          JT('مقدمة الكورس', 'Introducción', 'Course intro')
        ),
        jInfo('list',
          JT('خريطة الطريق: تسع محطات', 'El mapa: nueve estaciones', 'The map: nine stations'),
          [
            jItem('fa-door-open', JT('1 · الترحيب وأول خطواتك', '1 · Bienvenida y primeros pasos', '1 · Welcome and first steps'),
              JT('ماذا أفعل في أول 40 يوماً؟', '¿Qué hago en los primeros 40 días?', 'What do I do in the first 40 days?')),
            jItem('fa-circle-question', JT('2 · من هو الله؟ ومعنى الإسلام', '2 · ¿Quién es Allah? Y el sentido del Islam', '2 · Who is Allah? And what Islam means'),
              JT('التوحيد ببساطة، ومعاني كلمة «إسلام».', 'El tawhid con sencillez y los sentidos de «islam».', 'Tawhid simply, and what "Islam" means.')),
            jItem('fa-star', JT('3 · أركان الإيمان الستة', '3 · Los seis pilares de la fe', '3 · The six pillars of faith'),
              JT('ماذا نؤمن به، ولماذا؟', 'En qué creemos y por qué.', 'What we believe, and why.')),
            jItem('fa-mosque', JT('4 · نبيّنا محمد ﷺ', '4 · Nuestro Profeta Muhammad ﷺ', '4 · Our Prophet Muhammad ﷺ'),
              JT('من هو، وكيف كان خلقه؟', 'Quién fue y cómo era su carácter.', 'Who he was, and his character.')),
            jItem('fa-hands-praying', JT('5 · أركان الإسلام الخمسة', '5 · Los cinco pilares del Islam', '5 · The five pillars of Islam'),
              JT('بوابة إلى كورسات الصلاة والزكاة والصوم والحج.', 'Puerta a los cursos de oración, zakat, ayuno y hajj.', 'A gateway to the prayer, zakat, fasting and hajj courses.')),
            jItem('fa-comments', JT('6 · أسئلة وشبهات شائعة', '6 · Preguntas y dudas frecuentes', '6 · Common questions and doubts'),
              JT('أشهر خمسة أسئلة، بإجابات هادئة.', 'Las cinco dudas más comunes, con respuestas serenas.', 'The five most common doubts, calmly answered.')),
            jItem('fa-spa', JT('7 · الأخلاق: صفات المسلم', '7 · Carácter: las cualidades del musulmán', '7 · Character: the Muslim’s qualities'),
              JT('ثماني صفات، كل واحدة بحديث وموقف واقعي.', 'Ocho cualidades, cada una con un hadiz y una situación real.', 'Eight qualities, each with a hadith and a real-life situation.')),
            jItem('fa-handshake', JT('8 · المعاملات: كيف نتعامل مع الآخرين', '8 · Trato con los demás', '8 · Dealing with others'),
              JT('الوالدان، الجار، المجتمع، والأمانة.', 'Padres, vecino, comunidad y honestidad.', 'Parents, neighbour, community, honesty.')),
            jItem('fa-flag-checkered', JT('9 · طريقك يبدأ الآن', '9 · Tu camino empieza ahora', '9 · Your path starts now'),
              JT('خريطة الكورسات التالية وخطة شهرك الأول.', 'Mapa de los siguientes cursos y plan del primer mes.', 'A map of next courses and your first-month plan.')),
          ],
          JT('ابدأ من المحطة 1 وامشِ بالترتيب. كل محطة مستقلة، لكن الترتيب يبني الفهم.',
            'Empieza por la estación 1 y avanza en orden. Cada estación es independiente, pero el orden construye comprensión.',
            'Start at station 1 and go in order. Each station stands alone, but the order builds understanding.')
        ),
        jCheck(
          JT('أول 40 يوماً: قائمة تحقّق', 'Primeros 40 días: lista de control', 'First 40 days: a checklist'),
          [
            { t: JT('الغُسل: أول ما يُستحبّ لمن أسلم — اغتسل كغسل الجنابة ثم اشهد الشهادتين.',
              'El baño ritual (ghusl): lo primero recomendado al abrazar el Islam — lávate por completo y pronuncia el testimonio.',
              'The ritual bath (ghusl): the first recommended act — wash fully, then say the testimony.') },
            { t: JT('تعلّم سورة الفاتحة: سبع آيات تُقرأ في كل ركعة. ابدأ بآية كل يوم.',
              'Aprende al-Fatiha: siete versos que se recitan en cada oración. Empieza por un verso al día.',
              'Learn al-Fatiha: seven verses recited in every prayer. Start with one verse a day.') },
            { t: JT('تعلّم الوضوء: خطواته خمسة أساسية، ولا تستغرق دقيقتين.',
              'Aprende el wudu: cinco pasos básicos, menos de dos minutos.',
              'Learn wudu: five basic steps, under two minutes.') },
            { t: JT('تعلّم الصلاة: ابدأ بركعتين، ثم أكمل الخمس خلال أسبوع أو أكثر.',
              'Aprende la oración: empieza con dos rak‘as y completa las cinco en una semana o más.',
              'Learn the prayer: start with two rak‘as, then complete all five within a week or more.') },
            { t: JT('ابحث عن مسجد أو مجتمع قريب: حضور جماعة واحدة يثبّت أكثر من عشرة دروس.',
              'Busca una mezquita o comunidad cercana: una sola oración en grupo fija más que diez lecciones.',
              'Find a mosque or nearby community: one congregational prayer stabilises more than ten lessons.') },
            { t: JT('ابدأ كورس العربية من الصفر: عشر دقائق يومياً تكفي لقراءة القرآن خلال أشهر.',
              'Empieza el curso de árabe desde cero: diez minutos al día bastan para leer el Corán en unos meses.',
              'Start the Arabic-from-zero course: ten minutes a day is enough to read the Quran in a few months.') },
          ],
          JT('المس كل بند عندما تنجزه — يُحفظ تلقائياً على جهازك. لا يوجد ترتيب إلزامي، ولا وقت محدّد.',
            'Toca cada punto al completarlo — se guarda en tu dispositivo. No hay orden obligatorio ni plazo.',
            'Tap each item as you complete it — it saves on your device. No mandatory order, no deadline.')
        ),
        jCard(
          JT('الإسلام لا يمحو ماضيك',
            'El Islam no borra tu pasado',
            'Islam does not erase your past'),
          JT('كثيرون يظنون أن من أسلم يبدأ من صفر محاسبي، وأن ماضيه سيبقى معلّقاً فوقه. الحديث يقول العكس تماماً:\n\n«الإسلام يهدم ما كان قبله.»\n\nومعناه أن ما مضى قبل الإسلام يسقط، ولا يُحاسب عليه الإنسان بعد أن أسلم. تبدأ صفحة بيضاء، لكن ليس صفحة فارغة: خبرتك، ولطفك، وصدقك، وحبّك للناس — كل ذلك يبقى ويكبر.\n\n💡 **ملاحظة:** الندم على خطأ سابق ليس شرطاً للبداية، لكنه بداية طيبة للثبات.',
            'Muchos creen que al convertirse uno empieza de cero y que su pasado quedará suspendido sobre él. El hadiz dice lo contrario:\n\n«El Islam derriba lo que hubo antes de él.»\n\nLo pasado antes del Islam cae, y no se le cuenta tras abrazarlo. Empiezas una página en blanco, pero no vacía: tu experiencia, tu amabilidad, tu sinceridad y tu amor por la gente permanecen y crecen.\n\n💡 **Nota:** arrepentirse de un error pasado no es requisito para empezar, pero es un buen comienzo para mantenerse.',
            'Many think that on becoming Muslim you start from zero and your past hangs over you. The hadith says the opposite:\n\n"Islam demolishes what came before it."\n\nWhat happened before Islam falls away and is not counted against you. You start a blank page, but not an empty one: your experience, kindness, honesty and love for people all remain and grow.\n\n💡 **Note:** regret over a past mistake is not a condition for starting, but it is a good beginning for staying.'),
          JT('صحيح مسلم 121', 'Sahih Muslim 121', 'Sahih Muslim 121')
        ),
        jCard(
          JT('ماذا أفعل الآن؟ خطوات هذا الأسبوع',
            '¿Qué hago ahora? Pasos para esta semana',
            'What do I do now? Steps for this week'),
          JT('١) **اغتسل** ثم قل الشهادتين بقلب حاضر: «أشهد أن لا إله إلا الله، وأشهد أن محمداً رسول الله».\n\n٢) **تعلّم الوضوء** — دقيقتان، وخطواته في كورس الوضوء داخل التطبيق.\n\n٣) **احفظ الفاتحة** آية آية، واسمعها بصوت قارئ تحبّه.\n\n٤) **صلِّ ركعتين** في أول يوم، ولا تُطالب نفسك بالخمس فوراً إن كان الأمر جديداً.\n\n٥) **ابحث عن مسجد** قريب، أو تواصل مع مسلم تثق به.\n\n🤍 **عن إخبار العائلة:** لا يوجد أمر بأن تخبر أحداً فوراً. التوقيت والطريقة تقدير شخصي يعتمد على ظروفك وسلامتك وعلاقتك بأهلك. من الحكمة أن تختار لحظة آمنة، وأن تتحدث بلطف وصدق. وإن كان هناك خطر أذى حقيقي، فأولوية الشرع حفظ النفس: استشر شخصاً موثوقاً قبل أي خطوة.',
            '1) **Haz el ghusl** y pronuncia el testimonio con el corazón presente: «Atestiguo que no hay divinidad salvo Allah, y que Muhammad es Su mensajero».\n\n2) **Aprende el wudu** — dos minutos; sus pasos están en el curso de wudu de la app.\n\n3) **Memoriza al-Fatiha** verso a verso y escúchala con una voz que te guste.\n\n4) **Reza dos rak‘as** el primer día; no te exijas las cinco de golpe si todo es nuevo.\n\n5) **Busca una mezquita** cercana o contacta con un musulmán de confianza.\n\n🤍 **Sobre decírselo a la familia:** no hay ninguna orden de contarlo de inmediato. El momento y la forma son una decisión personal según tus circunstancias, tu seguridad y tu relación con ellos. Es sabio elegir un momento seguro y hablar con suavidad y verdad. Si hay riesgo real de daño, la prioridad de la ley es preservar la vida: consulta a alguien de confianza antes de cualquier paso.',
            "1) **Perform ghusl**, then say the testimony with a present heart: \"I bear witness that there is no deity but Allah, and that Muhammad is His messenger.\"\n\n2) **Learn wudu** — two minutes; the steps are in the app's wudu course.\n\n3) **Memorise al-Fatiha** verse by verse and listen to a reciter you like.\n\n4) **Pray two rak‘as** on day one; don't demand all five at once if this is all new.\n\n5) **Find a mosque** nearby, or reach out to a Muslim you trust.\n\n🤍 **About telling your family:** there is no command to tell anyone immediately. Timing and manner are a personal judgement based on your circumstances, your safety and your relationship with them. It is wise to choose a safe moment and speak gently and truthfully. If there is a real risk of harm, the law's priority is preserving life: consult someone you trust before any step."),
          JT('خطة عملية', 'Plan práctico', 'Practical plan')
        ),
        jQuiz(
          JT('ما أول خطوة عملية يُستحبّ أن تبدأ بها بعد الشهادتين؟',
            '¿Cuál es el primer paso práctico recomendado tras el testimonio?',
            'What is the first recommended practical step after the testimony?'),
          [
            JT('الغُسل ثم تعلّم الوضوء والصلاة', 'El ghusl, y luego aprender el wudu y la oración', 'Ghusl, then learning wudu and prayer'),
            JT('حفظ القرآن كاملاً', 'Memorizar todo el Corán', 'Memorising the whole Quran'),
            JT('صيام ثلاثين يوماً', 'Ayunar treinta días', 'Fasting thirty days'),
            JT('الحديث مع العائلة فوراً', 'Hablar con la familia de inmediato', 'Talking to family immediately'),
          ], 0,
          JT('البداية العملية: طهارة، ثم وضوء، ثم صلاة. والقرآن يُتعلّم بالتدريج، والعائلة قرار شخصي بتوقيت آمن.',
            'El comienzo práctico: pureza, wudu, oración. El Corán se aprende por etapas y la familia es una decisión personal en un momento seguro.',
            'The practical start: purity, then wudu, then prayer. The Quran is learned gradually, and family is a personal decision at a safe time.')
        ),
      ],
    },

    // ═══════════════════ المحطة 2 ═══════════════════
    {
      id: 'god',
      icon: '<i class="fas fa-circle-question"></i>',
      title: { ar: 'من هو الله؟ ومعنى الإسلام', es: '¿Quién es Allah? Y el sentido del Islam', en: 'Who is Allah? And what Islam means' },
      mascotIntro: {
        ar: 'قبل أي شيء آخر: من نعبد؟ هذه المحطة تضع الأساس الذي يقوم عليه كل ما بعدها.',
        es: 'Antes que nada: ¿a quién adoramos? Esta estación pone el fundamento de todo lo que viene.',
        en: 'Before anything else: whom do we worship? This station lays the foundation for everything after.',
      },
      lessons: [
        jCard(
          JT('من هو الله؟',
            '¿Quién es Allah?',
            'Who is Allah?'),
          JT('«الله» هو الاسم الخاص بالخالق، لا يُطلق على غيره، ولا يُجمع ولا يُؤنّث.\n\n**أربعة معانٍ تختصر الأمر:**\n\n1️⃣ **واحد لا شريك له** — لا شريك في الملك، ولا في العبادة، ولا في الأسماء.\n2️⃣ **الخالق والمدبّر** — كل ما في الكون يجري بأمره.\n3️⃣ **رحمن رحيم** — رحمته سبقت غضبه، وهو أرحم بعبده من الأم بولدها.\n4️⃣ **قريب مجيب** — ليس بعيداً يحتاج وسيطاً لتسمعه: «وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ» (البقرة 186).\n\n👁️ **نقطة يكثر السؤال عنها:** لا يُرى في الدنيا. لا تُبحث عنه في صورة أو تمثال أو مكان؛ يُعرف بأسمائه وصفاته وآثاره في خلقه. ورؤيته في الآخرة أعلى نعيم أهل الجنة.',
            '«Allah» es el nombre propio del Creador: no se aplica a otro, no tiene plural ni femenino.\n\n**Cuatro ideas que lo resumen:**\n\n1️⃣ **Uno sin asociado** — sin socio en el dominio, en la adoración ni en los nombres.\n2️⃣ **Creador y Ordenador** — todo el universo marcha por Su mandato.\n3️⃣ **Misericordioso** — Su misericordia precede a Su ira; es más misericordioso con Su siervo que una madre con su hijo.\n4️⃣ **Cercano y que responde** — no está lejos ni necesita intermediario: «Cuando Mis siervos te pregunten por Mí, estoy cerca» (2:186).\n\n👁️ **Duda frecuente:** no se Le ve en este mundo. No se Le busca en una imagen, estatua o lugar; se Le conoce por Sus nombres, atributos y las huellas en Su creación. Verle en el Más Allá es el mayor deleite del Paraíso.',
            "\"Allah\" is the proper name of the Creator: it applies to no one else, and has no plural or feminine.\n\n**Four ideas that sum it up:**\n\n1️⃣ **One with no partner** — no partner in dominion, in worship, or in names.\n2️⃣ **Creator and Sustainer** — the whole universe runs by His command.\n3️⃣ **Most Merciful** — His mercy precedes His wrath; He is more merciful to His servant than a mother to her child.\n4️⃣ **Near and responsive** — not distant, needing no intermediary: \"When My servants ask you about Me, I am near\" (2:186).\n\n👁️ **A common question:** He is not seen in this world. Do not look for Him in an image, statue or place; He is known through His names, attributes and the traces in His creation. Seeing Him in the Hereafter is the greatest delight of Paradise."),
          JT('القرآن 2:186 · 112:1-4', 'Corán 2:186 · 112:1-4', 'Quran 2:186 · 112:1-4')
        ),
        jInfo('grid',
          JT('ثلاثة معانٍ لكلمة «إسلام»', 'Tres sentidos de la palabra «islam»', 'Three meanings of the word "Islam"'),
          [
            jItem('fa-hand', JT('الاستسلام', 'Sumisión', 'Surrender'),
              JT('أن تسلّم أمرك لله وحده، بلا مقاومة ولا شريك. من هنا: «أسلمتُ وجهي لله».',
                'Entregar tu asunto solo a Allah, sin resistencia ni asociados.',
                'Handing your affair to Allah alone, without resistance or partners.')),
            jItem('fa-dove', JT('السلام', 'Paz', 'Peace'),
              JT('من الجذر نفسه: سلام مع الله، وسلام مع الناس، وسلام داخلي مع نفسك.',
                'De la misma raíz: paz con Allah, con la gente y contigo mismo.',
                'From the same root: peace with Allah, with people, and within yourself.')),
            jItem('fa-heart', JT('الإخلاص', 'Sinceridad', 'Sincerity'),
              JT('أن يكون الظاهر والباطن واحداً، وأن تعمل للناس كما تعمل وحدك.',
                'Que lo exterior y lo interior sean uno, y obrar con la gente como obrarías a solas.',
                'That the outward and inward are one, and that you act with people as you would alone.')),
          ],
          JT('ثلاث كلمات من جذر واحد: س-ل-م — تسليمٌ يُنتج سلاماً، يُثمر إخلاصاً.',
            'Tres palabras de una raíz: s-l-m — una entrega que produce paz y da sinceridad.',
            'Three words from one root: s-l-m — a surrender that yields peace and bears sincerity.')
        ),
        jInfo('list',
          JT('أنواع التوحيد الثلاثة', 'Los tres tipos de tawhid', 'The three kinds of tawhid'),
          [
            jItem('fa-crown', JT('توحيد الربوبية', 'Tawhid al-Rububiyya', 'Tawhid of Lordship'),
              JT('الإقرار بأن الله وحده الخالق، المالك، المدبّر، الرزّاق، المحيي المميت. حتى المشركون قديماً كانوا يقرّون به، ولم يُدخلهم الإسلام.',
                'Reconocer que solo Allah crea, posee, ordena, provee, da vida y muerte. Incluso los idólatras antiguos lo admitían, y eso no los hizo musulmanes.',
                'Acknowledging that Allah alone creates, owns, orders, provides, gives life and death. Even the ancient idolaters admitted this, and it did not make them Muslim.')),
            jItem('fa-hands-praying', JT('توحيد الألوهية', 'Tawhid al-Uluhiyya', 'Tawhid of Worship'),
              JT('أن تصرف العبادة — الدعاء، الخوف، الرجاء، الذبح، النذر — لله وحده. هذا هو جوهر رسالة كل نبي، وهو الذي وقع فيه الخلاف.',
                'Dirigir la adoración — súplica, miedo, esperanza, sacrificio, voto — solo a Allah. Es el núcleo del mensaje de todo profeta.',
                'Directing worship — supplication, fear, hope, sacrifice, vows — to Allah alone. This is the core of every prophet\'s message.')),
            jItem('fa-signature', JT('توحيد الأسماء والصفات', 'Tawhid de los nombres y atributos', 'Tawhid of Names and Attributes'),
              JT('إثبات ما أثبته الله لنفسه من أسماء وصفات، بلا تحريف ولا تعطيل ولا تمثيل: «لَيْسَ كَمِثْلِهِ شَيْءٌ وَهُوَ السَّمِيعُ الْبَصِيرُ» (الشورى 11).',
                'Afirmar los nombres y atributos que Allah afirmó para Sí, sin distorsión, negación ni comparación: «Nada es semejante a Él, y Él es el que todo lo oye, todo lo ve» (42:11).',
                'Affirming the names and attributes Allah affirmed for Himself, without distortion, denial or comparison: "Nothing is like Him, and He is the All-Hearing, All-Seeing" (42:11).')),
          ],
          JT('الثلاثة مترابطة: من عرف أن الله وحده الخالق، لزمه أن يعبده وحده، وأن يصفه بما وصف به نفسه.',
            'Los tres están unidos: quien sabe que solo Allah crea, debe adorarle solo y describirle como Él se describió.',
            'The three are linked: whoever knows that Allah alone creates must worship Him alone and describe Him as He described Himself.'),
          JT('القرآن 42:11', 'Corán 42:11', 'Quran 42:11')
        ),
        jCard(
          JT('ما هو الشرك؟ ببساطة',
            '¿Qué es el shirk? En sencillo',
            'What is shirk? Simply put'),
          JT('**الشرك** هو أن تجعل لله شريكاً في شيء يختصّ به: في الخلق، أو في العبادة، أو في الأسماء والصفات.\n\n**صور قريبة من حياتك:**\n• أن تدعو غير الله في حاجة لا يقدر عليها إلا الله.\n• أن تخاف من مخلوق خوفاً يشلّك كما تخاف من الله.\n• أن تُطيع مخلوقاً في معصية الله طاعة مطلقة.\n• أن تعتقد أن شيئاً ينفع أو يضرّ استقلالاً عن الله.\n\n🌿 **الفرق المهم:** **التوسّل المشروع** (أن تدعو الله، وتتقرّب إليه بأسمائه، أو بعملك الصالح، أو بدعاء رجل صالح حيّ) ليس شركاً. الشرك في **صرف العبادة** لغير الله، لا في طلب الدعاء من أخيك.\n\nهذا مدخل عام فقط؛ التفاصيل الفقهية لها موضعها في العلم المتقدّم.',
            '**Shirk** es dar a Allah un asociado en algo exclusivo de Él: la creación, la adoración o los nombres y atributos.\n\n**Formas cercanas a tu vida:**\n• Invocar a otro en una necesidad que solo Allah puede resolver.\n• Temer a una criatura con un miedo que te paraliza como el de Allah.\n• Obedecer a una criatura en desobediencia a Allah con obediencia absoluta.\n• Creer que algo beneficia o daña de forma independiente de Allah.\n\n🌿 **Distinción importante:** la intercesión legítima (suplicar a Allah, acercarse por Sus nombres, por una buena obra o por la súplica de un hombre virtuoso vivo) no es shirk. El shirk es **dirigir la adoración** a otro, no pedir a tu hermano que rece por ti.\n\nEsto es solo una introducción; los detalles jurídicos tienen su lugar en el saber avanzado.',
            "**Shirk** is setting up a partner with Allah in something exclusive to Him: creation, worship, or names and attributes.\n\n**Forms close to your life:**\n• Calling on other than Allah in a need only Allah can meet.\n• Fearing a creature with a fear that paralyses you as fear of Allah would.\n• Obeying a creature in disobedience to Allah with absolute obedience.\n• Believing something benefits or harms independently of Allah.\n\n🌿 **An important distinction:** legitimate seeking of nearness (praying to Allah, drawing close through His names, a good deed, or the supplication of a living righteous man) is not shirk. Shirk is **directing worship** to other than Allah, not asking your brother to pray for you.\n\nThis is only an introduction; legal details belong to advanced study."),
          JT('مدخل عام', 'Introducción general', 'General introduction')
        ),
        jVideo('r7HHc08F6P0',
          JT('فيديو: ما هو الإسلام؟', 'Vídeo: ¿Qué es el Islam?', 'Video: What is Islam?'),
          JT('شرح مبسّط لمعنى «إله واحد» ولرسالة الإسلام. الفيديو بالإسبانية؛ يمكنك متابعته بالصورة ثم قراءة البطاقة التالية بالعربية.',
            'Explicación sencilla del «Dios único» y del mensaje del Islam. El vídeo está en español.',
            'A simple explanation of "one God" and the message of Islam. The video is in Spanish; follow the visuals, then read the next card.')
        ),
        jCard(
          JT('الإسلام والإيمان والإحسان',
            'Islam, iman e ihsan',
            'Islam, Iman and Ihsan'),
          JT('جاء جبريل عليه السلام في صورة رجل، فجلس إلى النبي ﷺ وسأله عن الإسلام والإيمان والإحسان والساعة، ثم قال النبي ﷺ: «هذا جبريل أتاكم يعلّمكم دينكم.»\n\n**المراتب الثلاث:**\n\n1️⃣ **الإسلام** — خمسة أعمال ظاهرة: الشهادتان، الصلاة، الزكاة، الصوم، الحج.\n2️⃣ **الإيمان** — ستة أصول باطنة: الله، ملائكته، كتبه، رسله، اليوم الآخر، القدر.\n3️⃣ **الإحسان** — «أن تعبد الله كأنك تراه، فإن لم تكن تراه فإنه يراك.»\n\n🌱 **ترتيبٌ يريح المبتدئ:** ابدأ بالظاهر (تعلّم الصلاة)، واغرس الباطن بالمعرفة، ثم ارفع الجودة بالإحسان. لا تنتظر أن تصل إلى الإحسان لتبدأ الصلاة.',
            'Jibril (Gabriel) vino en forma de hombre, se sentó con el Profeta ﷺ y le preguntó por el islam, el iman, el ihsan y la Hora. Luego el Profeta ﷺ dijo: «Ese era Jibril, vino a enseñaros vuestra religión».\n\n**Los tres niveles:**\n\n1️⃣ **Islam** — cinco obras exteriores: testimonio, oración, zakat, ayuno, hajj.\n2️⃣ **Iman** — seis fundamentos interiores: Allah, Sus ángeles, Sus libros, Sus mensajeros, el Último Día, el decreto.\n3️⃣ **Ihsan** — «Adorar a Allah como si Le vieras; si no Le ves, Él te ve».\n\n🌱 **Un orden que tranquiliza al principiante:** empieza por lo exterior (aprender la oración), planta el interior con conocimiento y luego eleva la calidad con el ihsan. No esperes al ihsan para empezar a rezar.',
            "Jibril (Gabriel) came in the form of a man, sat with the Prophet ﷺ and asked him about Islam, iman, ihsan and the Hour. Then the Prophet ﷺ said: \"That was Jibril; he came to teach you your religion.\"\n\n**The three levels:**\n\n1️⃣ **Islam** — five outward acts: testimony, prayer, zakat, fasting, hajj.\n2️⃣ **Iman** — six inward foundations: Allah, His angels, His books, His messengers, the Last Day, the decree.\n3️⃣ **Ihsan** — \"To worship Allah as if you see Him; if you do not see Him, He sees you.\"\n\n🌱 **An order that comforts a beginner:** start with the outward (learning the prayer), plant the inward with knowledge, then raise the quality with ihsan. Do not wait for ihsan to start praying."),
          JT('صحيح مسلم 8 (حديث جبريل)', 'Sahih Muslim 8 (hadiz de Jibril)', 'Sahih Muslim 8 (Hadith of Jibril)')
        ),
        jCard(
          JT('أسماء الله: كيف نفهمها؟',
            'Los nombres de Allah: ¿cómo entenderlos?',
            'Allah’s names: how to understand them'),
          JT('أسماء الله ليست ألقاباً للتبرّك فقط، بل **منهج حياة**: كل اسم تعرفه يفتح باباً للدعاء وسلوكاً في التعامل.\n\n| الاسم | معناه | أثره في يومك |\n|---|---|---|\n| **الرحمن الرحيم** | رحمة واسعة | أن ترحم من هو أضعف منك |\n| **السميع** | يسمع كل شيء | أن تستحي من كلمة تؤذي |\n| **البصير** | يرى كل شيء | أن تُتقن العمل ولو لم يرَك أحد |\n| **الغفور** | يغفر الذنوب | أن تغفر لمن أخطأ في حقك |\n| **الرزّاق** | يرزق كل مخلوق | أن تعمل بجدّ بلا قلق مرضي |\n| **الحكيم** | يضع الأمور مواضعها | أن تتروّى قبل الحكم |\n\n💡 **قاعدة:** ما ورد في القرآن والسنّة من الأسماء نُثبته، ولا نشتقّ أسماء من أفعال لم تُذكر. ومن حفظها وفهمها ازداد قرباً.',
            'Los nombres de Allah no son solo fórmulas de bendición: son **un método de vida**. Cada nombre que conoces abre una puerta de súplica y una conducta.\n\n| Nombre | Sentido | Efecto en tu día |\n|---|---|---|\n| **Ar-Rahman, Ar-Rahim** | misericordia amplia | ser misericordioso con el más débil |\n| **As-Sami‘** | todo lo oye | cuidar la palabra que hiere |\n| **Al-Basir** | todo lo ve | hacer bien tu trabajo aunque nadie te vea |\n| **Al-Ghafur** | perdona | perdonar a quien te falló |\n| **Ar-Razzaq** | provee a toda criatura | trabajar sin angustia enfermiza |\n| **Al-Hakim** | pone cada cosa en su lugar | no juzgar a la ligera |\n\n💡 **Regla:** afirmamos los nombres que aparecen en el Corán y la Sunna, sin inventarlos. Quien los aprende y comprende se acerca más.',
            "Allah's names are not just formulas of blessing: they are **a way of life**. Each name you know opens a door of supplication and a behaviour.\n\n| Name | Meaning | Effect on your day |\n|---|---|---|\n| **Ar-Rahman, Ar-Rahim** | vast mercy | be merciful to the weaker |\n| **As-Sami'** | hears all | guard the word that wounds |\n| **Al-Basir** | sees all | do your work well though unseen |\n| **Al-Ghafur** | forgives | forgive those who wronged you |\n| **Ar-Razzaq** | provides for all | work without anxious worry |\n| **Al-Hakim** | places things rightly | do not judge hastily |\n\n💡 **Rule:** we affirm the names found in the Quran and Sunna and invent none. Whoever learns and understands them draws closer."),
          JT('القرآن 17:110 · صحيح البخاري 2736', 'Corán 17:110 · Bujari 2736', 'Quran 17:110 · Sahih al-Bukhari 2736')
        ),
        jFlash(
          JT('مراجعة سريعة', 'Repaso rápido', 'Quick review'),
          [
            [JT('الله', 'Allah', 'Allah'), JT('واحد لا شريك له، خالق ومدبّر ورحيم وقريب.', 'Uno sin asociado: creador, ordenador, misericordioso, cercano.', 'One with no partner: creator, sustainer, merciful, near.')],
            [JT('إسلام', 'Islam', 'Islam'), JT('استسلام لله، وسلام، وإخلاص.', 'Sumisión a Allah, paz y sinceridad.', 'Surrender to Allah, peace, sincerity.')],
            [JT('الربوبية', 'Rububiyya', 'Lordship'), JT('الله وحده الخالق المالك المدبّر.', 'Solo Allah crea, posee y ordena.', 'Allah alone creates, owns and orders.')],
            [JT('الألوهية', 'Uluhiyya', 'Worship'), JT('العبادة لله وحده: دعاء، خوف، رجاء.', 'La adoración solo a Allah: súplica, temor, esperanza.', 'Worship to Allah alone: prayer, fear, hope.')],
            [JT('الشرك', 'Shirk', 'Shirk'), JT('صرف شيء من العبادة لغير الله.', 'Dirigir algo de la adoración a otro que Allah.', 'Directing any worship to other than Allah.')],
            [JT('الإحسان', 'Ihsan', 'Ihsan'), JT('أن تعبد الله كأنك تراه.', 'Adorar a Allah como si Le vieras.', 'Worship Allah as if you see Him.')],
          ]
        ),
        jQuiz(
          JT('أي نوع من التوحيد هو الإقرار بأن الله وحده الخالق والرزّاق؟',
            '¿Qué tipo de tawhid es reconocer que solo Allah crea y provee?',
            'Which kind of tawhid is acknowledging that Allah alone creates and provides?'),
          [
            JT('توحيد الربوبية', 'Tawhid al-Rububiyya', 'Tawhid of Lordship'),
            JT('توحيد الألوهية', 'Tawhid al-Uluhiyya', 'Tawhid of Worship'),
            JT('توحيد الأسماء والصفات', 'Tawhid de nombres y atributos', 'Tawhid of Names and Attributes'),
            JT('الإحسان', 'Ihsan', 'Ihsan'),
          ], 0,
          JT('الربوبية = الخلق والملك والتدبير. أما صرف العبادة لله وحده فهو توحيد الألوهية، وهو الذي وقع فيه الخلاف مع المشركين.',
            'Rububiyya = creación, dominio y orden. Dirigir la adoración solo a Allah es Uluhiyya, donde surgió la diferencia con los idólatras.',
            'Lordship = creation, dominion, ordering. Directing worship to Allah alone is Uluhiyya, where the dispute with the idolaters lay.')
        ),
      ],
    },

    // ═══════════════════ المحطة 3 ═══════════════════
    {
      id: 'iman',
      icon: '<i class="fas fa-star"></i>',
      title: { ar: 'أركان الإيمان الستة', es: 'Los seis pilares de la fe', en: 'The six pillars of faith' },
      mascotIntro: {
        ar: 'الإيمان ليس شعوراً غامضاً، بل ستة أصول واضحة تُبنى عليها حياة.',
        es: 'El iman no es un sentimiento vago, sino seis fundamentos claros sobre los que se construye una vida.',
        en: 'Iman is not a vague feeling but six clear foundations on which a life is built.',
      },
      lessons: [
        jInfo('grid',
          JT('عجلة الإيمان: الأركان الستة', 'La rueda del iman: seis pilares', 'The wheel of iman: six pillars'),
          [
            jItem('fa-star', JT('١ · الله', '1 · Allah', '1 · Allah'), JT('الإيمان بوجوده ووحدانيته وأسمائه وصفاته.', 'Su existencia, unicidad, nombres y atributos.', 'His existence, oneness, names and attributes.')),
            jItem('fa-feather', JT('٢ · الملائكة', '2 · Los ángeles', '2 · The angels'), JT('خلقٌ من نور، لا يعصون الله، ومنهم جبريل بالوحي.', 'Criaturas de luz que no desobedecen; Jibril trajo la revelación.', 'Beings of light who do not disobey; Jibril brought revelation.')),
            jItem('fa-book', JT('٣ · الكتب', '3 · Los libros', '3 · The books'), JT('التوراة والإنجيل والزبور والقرآن الذي حفظه الله.', 'Tawrat, Injil, Zabur y el Corán preservado por Allah.', 'Tawrat, Injil, Zabur, and the Quran preserved by Allah.')),
            jItem('fa-user-tie', JT('٤ · الرسل', '4 · Los mensajeros', '4 · The messengers'), JT('من آدم إلى محمد ﷺ، آخرهم وخاتمهم.', 'Desde Adán hasta Muhammad ﷺ, el último.', 'From Adam to Muhammad ﷺ, the last of them.')),
            jItem('fa-scale-balanced', JT('٥ · اليوم الآخر', '5 · El Último Día', '5 · The Last Day'), JT('البعث والحساب والجنة والنار.', 'Resurrección, cuenta, Paraíso e Infierno.', 'Resurrection, reckoning, Paradise and Hell.')),
            jItem('fa-hourglass-half', JT('٦ · القدر', '6 · El decreto', '6 · The decree'), JT('كل شيء بقدر، مع مسؤولية الإنسان عن اختياره.', 'Todo ocurre por decreto, con responsabilidad humana.', 'All occurs by decree, with human responsibility.')),
          ],
          JT('«الإيمان أن تؤمن بالله وملائكته وكتبه ورسله واليوم الآخر، وتؤمن بالقدر خيره وشره.» (مسلم 8)',
            '«El iman es creer en Allah, Sus ángeles, Sus libros, Sus mensajeros, el Último Día, y en el decreto, bueno y malo» (Muslim 8).',
            '"Iman is to believe in Allah, His angels, His books, His messengers, the Last Day, and the decree, good and bad" (Muslim 8).'),
          JT('صحيح مسلم 8', 'Sahih Muslim 8', 'Sahih Muslim 8')
        ),
        jCard(
          JT('الركن الأول: الإيمان بالله',
            'Pilar 1: la fe en Allah',
            'Pillar 1: belief in Allah'),
          JT('ليس الإيمان بالله أن تقول «أظنّ أن هناك خالقاً»، بل أربعة أمور:\n\n1️⃣ **الإقرار بوجوده** — الكون لا يقوم بنفسه.\n2️⃣ **الوحدانية** — لا شريك في الملك ولا في العبادة.\n3️⃣ **الأسماء والصفات** — كما وصف نفسه، بلا تمثيل.\n4️⃣ **العبادة له وحده** — الدعاء، الخوف، الرجاء، الشكر.\n\n🌱 **اختبار عملي:** من الذي تدعوه حين تشتدّ عليك الأمور؟ الجواب الصادق يكشف حقيقة إيمانك أكثر من أي كلام.',
            'Creer en Allah no es decir «creo que hay un Creador», sino cuatro cosas:\n\n1️⃣ **Afirmar Su existencia** — el universo no se sostiene solo.\n2️⃣ **Unicidad** — sin socio en el dominio ni en la adoración.\n3️⃣ **Nombres y atributos** — como Él se describió, sin comparación.\n4️⃣ **Adorarle solo** — súplica, temor, esperanza, gratitud.\n\n🌱 **Prueba práctica:** ¿a quién invocas cuando las cosas se ponen difíciles? La respuesta sincera revela tu fe más que cualquier frase.',
            "Belief in Allah is not saying \"I think there is a Creator\" but four things:\n\n1️⃣ **Affirming His existence** — the universe does not hold itself up.\n2️⃣ **Oneness** — no partner in dominion or worship.\n3️⃣ **Names and attributes** — as He described Himself, without comparison.\n4️⃣ **Worshipping Him alone** — supplication, fear, hope, gratitude.\n\n🌱 **A practical test:** whom do you call on when things get hard? The honest answer reveals your faith more than any sentence.")
        ),
        jCard(
          JT('الركن الثاني: الإيمان بالملائكة',
            'Pilar 2: la fe en los ángeles',
            'Pillar 2: belief in the angels'),
          JT('الملائكة خلقٌ من نور، لا يأكلون ولا ينامون ولا يعصون: «لَا يَعْصُونَ اللَّهَ مَا أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ» (التحريم 6).\n\n**من نعرفهم بأسمائهم:**\n• **جبريل** — الأمين على الوحي.\n• **ميكائيل** — الموكّل بالمطر والرزق.\n• **إسرافيل** — الموكّل بالنفخ في الصور.\n• **ملك الموت** — بقبض الأرواح.\n• **منكر ونكير** — سؤال القبر.\n• **الكِتاب** — يكتبون الحسنات والسيئات.\n\n💡 **أثر عملي:** معرفة أن كاتباً يسجّل عملك تجعلك تُحسن ما لا يراه أحد، وتمنعك من إساءة لا يراها إلا الله وملائكته.',
            'Los ángeles son criaturas de luz: no comen, no duermen, no desobedecen: «No desobedecen a Allah en lo que les ordena y hacen lo que se les manda» (66:6).\n\n**Conocidos por nombre:**\n• **Jibril** — el fiel de la revelación.\n• **Mikail** — encargado de la lluvia y el sustento.\n• **Israfil** — encargado de soplar la trompeta.\n• **El ángel de la muerte** — toma las almas.\n• **Munkar y Nakir** — la pregunta de la tumba.\n• **Los escribas** — registran obras buenas y malas.\n\n💡 **Efecto práctico:** saber que un escriba anota tu obra te hace hacer bien lo que nadie ve.',
            "Angels are beings of light: they do not eat, sleep or disobey: \"They do not disobey Allah in what He commands them and do what they are commanded\" (66:6).\n\n**Known by name:**\n• **Jibril** — entrusted with revelation.\n• **Mikail** — entrusted with rain and provision.\n• **Israfil** — entrusted with blowing the trumpet.\n• **The angel of death** — takes souls.\n• **Munkar and Nakir** — the questioning in the grave.\n• **The scribes** — record good and bad deeds.\n\n💡 **Practical effect:** knowing a scribe records your deed makes you do well what no one sees."),
          JT('القرآن 66:6 · صحيح مسلم 8', 'Corán 66:6 · Muslim 8', 'Quran 66:6 · Sahih Muslim 8')
        ),
        jCard(
          JT('الركن الثالث: الإيمان بالكتب',
            'Pilar 3: la fe en los libros',
            'Pillar 3: belief in the books'),
          JT('نؤمن بكل كتاب أنزله الله، ونؤمن أن **القرآن** هو المهيمن عليها:\n\n1️⃣ **صحف إبراهيم وموسى** — لم تصل إلينا.\n2️⃣ **التوراة** — على موسى عليه السلام.\n3️⃣ **الزبور** — على داود عليه السلام.\n4️⃣ **الإنجيل** — على عيسى عليه السلام.\n5️⃣ **القرآن** — على محمد ﷺ، محفوظ بحفظ الله: «إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ» (الحجر 9).\n\n📖 **معنى الإيمان بالقرآن عملياً:** أن تجعله مرجعك الأول، لا كتاباً للتبرّك في المناسبات.',
            'Creemos en todos los libros que Allah reveló, y que el **Corán** es el criterio sobre ellos:\n\n1️⃣ **Hojas de Ibrahim y Musa** — no llegaron a nosotros.\n2️⃣ **Tawrat** — a Musa.\n3️⃣ **Zabur** — a Dawud.\n4️⃣ **Injil** — a Isa.\n5️⃣ **Corán** — a Muhammad ﷺ, preservado por Allah: «Somos Nosotros quienes hemos revelado el Recuerdo y Nosotros lo protegemos» (15:9).\n\n📖 **En la práctica:** hacer del Corán tu primera referencia, no un libro de bendición para ocasiones.',
            "We believe in every book Allah revealed, and that the **Quran** is the criterion over them:\n\n1️⃣ **Scrolls of Ibrahim and Musa** — they did not reach us.\n2️⃣ **Tawrat** — to Musa.\n3️⃣ **Zabur** — to Dawud.\n4️⃣ **Injil** — to Isa.\n5️⃣ **Quran** — to Muhammad ﷺ, preserved by Allah: \"It is We who sent down the Reminder, and it is We who guard it\" (15:9).\n\n📖 **In practice:** make the Quran your first reference, not a book of blessing for occasions."),
          JT('القرآن 15:9 · 5:48', 'Corán 15:9 · 5:48', 'Quran 15:9 · 5:48')
        ),
        jCard(
          JT('الركن الرابع: الإيمان بالرسل',
            'Pilar 4: la fe en los mensajeros',
            'Pillar 4: belief in the messengers'),
          JT('الله لم يترك البشر بلا هداية. أرسل رسلاً كثيرين، أولهم آدم، وآخرهم محمد ﷺ.\n\n**خمسة من أولي العزم:** نوح، إبراهيم، موسى، عيسى، محمد ﷺ.\n\n**ما نتعلّمه من قصصهم:**\n• **نوح** — الصبر على قومه قروناً.\n• **إبراهيم** — الثبات أمام السلطة والرفض.\n• **موسى** — مواجهة الطغيان بالكلمة الحق.\n• **عيسى** — الرحمة والزهد.\n• **محمد ﷺ** — الرحمة الشاملة والخلق العظيم.\n\n🌿 **قاعدة:** نؤمن بجميع الرسل، ونُحبّهم، ولا نفرّق بينهم في أصل الرسالة، وإن اختلفت الشرائع.',
            'Allah no dejó a la humanidad sin guía. Envió muchos mensajeros; el primero, Adán; el último, Muhammad ﷺ.\n\n**Cinco de firme voluntad:** Nuh, Ibrahim, Musa, Isa y Muhammad ﷺ.\n\n**Qué aprendemos de ellos:**\n• **Nuh** — paciencia durante siglos.\n• **Ibrahim** — firmeza ante el poder y el rechazo.\n• **Musa** — enfrentar la tiranía con la palabra justa.\n• **Isa** — misericordia y desapego.\n• **Muhammad ﷺ** — misericordia universal y carácter sublime.\n\n🌿 **Regla:** creemos en todos, los amamos y no los separamos en el origen del mensaje, aunque las leyes difieran.',
            "Allah did not leave humanity without guidance. He sent many messengers; the first was Adam, the last Muhammad ﷺ.\n\n**Five of firm resolve:** Nuh, Ibrahim, Musa, Isa and Muhammad ﷺ.\n\n**What we learn from them:**\n• **Nuh** — patience for centuries.\n• **Ibrahim** — firmness before power and rejection.\n• **Musa** — facing tyranny with the truthful word.\n• **Isa** — mercy and detachment.\n• **Muhammad ﷺ** — universal mercy and sublime character.\n\n🌿 **Rule:** we believe in all of them, love them, and do not separate them in the origin of the message, though the laws differed.")
        ),
        jCard(
          JT('الركن الخامس: الإيمان باليوم الآخر',
            'Pilar 5: la fe en el Último Día',
            'Pillar 5: belief in the Last Day'),
          JT('اليوم الآخر يبدأ بسؤال القبر، ويمرّ بالبعث والحشر والحساب والميزان والصراط، وينتهي بجنة أو نار.\n\n**ماذا يغيّر هذا الاعتقاد في حياتك؟**\n\n1️⃣ **يعطي قيمة للعمل الصغير** — كلمة طيبة، صدقة، إماطة أذى.\n2️⃣ **يوازن الظلم** — من نجا في الدنيا لن ينجو من العدل.\n3️⃣ **يخفّف فقد الأحبّة** — اللقاء ليس مستحيلاً.\n4️⃣ **يمنحك فرصة للتوبة** — ما دام في العمر بقيّة.\n\n📖 «فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ» (الزلزلة 7).',
            'El Último Día comienza con la pregunta de la tumba y pasa por la resurrección, la reunión, la cuenta, la balanza y el puente, para terminar en Jardín o Fuego.\n\n**¿Qué cambia esta creencia en tu vida?**\n\n1️⃣ **Da valor a la obra pequeña** — una palabra amable, una limosna, quitar un daño.\n2️⃣ **Equilibra la injusticia** — quien escapó aquí no escapará de la justicia.\n3️⃣ **Alivia la pérdida** — el reencuentro no es imposible.\n4️⃣ **Da espacio al arrepentimiento** — mientras quede vida.\n\n📖 «Quien haga el peso de un átomo de bien, lo verá» (99:7).',
            "The Last Day begins with the questioning in the grave and passes through resurrection, gathering, reckoning, the scales and the bridge, ending in a Garden or a Fire.\n\n**What does this belief change in your life?**\n\n1️⃣ **It values the small deed** — a kind word, a charity, removing harm.\n2️⃣ **It balances injustice** — whoever escaped here will not escape justice.\n3️⃣ **It eases loss** — the meeting is not impossible.\n4️⃣ **It leaves room for repentance** — while life remains.\n\n📖 \"Whoever does an atom's weight of good will see it\" (99:7).")
        ),
        jCard(
          JT('الركن السادس: الإيمان بالقدر',
            'Pilar 6: la fe en el decreto',
            'Pillar 6: belief in the decree'),
          JT('القدر أربع مراتب: **علم الله** بما سيكون، **كتابته**، **مشيئته**، و**خلقه** لكل شيء.\n\n**وأهم سؤال: هل يعني ذلك أنني مسيّر؟** لا. عندك **إرادة حقيقية واختيار**، ولذلك يُثاب العاصي ويُلام، وتُمدح الطاعة. القدر يفسّر ما لا تتحكّم فيه (المولد، المرض، القدرات)، والاختيار يفسّر ما تتحكّم فيه (الصدق، الصلاة، اللطف).\n\n🌿 **ثلاث جمل تحلّ 90% من القلق:**\n• ما فاتك لم يكن ليصيبك.\n• ما أصابك لم يكن ليخطئك.\n• «وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ» (الطلاق 3).\n\n📖 قال النبي ﷺ: «احرص على ما ينفعك، واستعن بالله ولا تعجز.» (مسلم 2664)',
            'El decreto tiene cuatro niveles: **la ciencia de Allah**, **su escritura**, **su voluntad** y **su creación** de todo.\n\n**Y la gran pregunta: ¿estoy predeterminado?** No. Tienes **voluntad y elección reales**; por eso se premia la obediencia y se reprocha el mal. El decreto explica lo que no controlas (nacimiento, enfermedad, capacidades); la elección explica lo que sí controlas (sinceridad, oración, amabilidad).\n\n🌿 **Tres frases que disuelven el 90% de la angustia:**\n• Lo que perdiste no iba a alcanzarte.\n• Lo que te alcanzó no iba a fallarte.\n• «Quien confía en Allah, Él le basta» (65:3).\n\n📖 El Profeta ﷺ dijo: «Afánate por lo que te beneficia, pide ayuda a Allah y no te rindas» (Muslim 2664).',
            "The decree has four levels: **Allah's knowledge**, **His writing**, **His will**, and **His creation** of all things.\n\n**And the big question: am I predetermined?** No. You have **real will and choice**; hence obedience is rewarded and wrongdoing blamed. The decree explains what you do not control (birth, illness, capacities); choice explains what you do (honesty, prayer, kindness).\n\n🌿 **Three sentences that dissolve 90% of anxiety:**\n• What you missed was never going to reach you.\n• What reached you was never going to miss you.\n• \"Whoever trusts in Allah, He is sufficient for him\" (65:3).\n\n📖 The Prophet ﷺ said: \"Strive for what benefits you, seek Allah's help, and do not give up\" (Muslim 2664)."),
          JT('القرآن 65:3 · صحيح مسلم 2664', 'Corán 65:3 · Muslim 2664', 'Quran 65:3 · Sahih Muslim 2664')
        ),
        jFlash(
          JT('الأركان الستة: مراجعة', 'Los seis pilares: repaso', 'The six pillars: review'),
          [
            [JT('الركن 1', 'Pilar 1', 'Pillar 1'), JT('الإيمان بالله', 'Fe en Allah', 'Belief in Allah')],
            [JT('الركن 2', 'Pilar 2', 'Pillar 2'), JT('الإيمان بالملائكة', 'Fe en los ángeles', 'Belief in the angels')],
            [JT('الركن 3', 'Pilar 3', 'Pillar 3'), JT('الإيمان بالكتب', 'Fe en los libros', 'Belief in the books')],
            [JT('الركن 4', 'Pilar 4', 'Pillar 4'), JT('الإيمان بالرسل', 'Fe en los mensajeros', 'Belief in the messengers')],
            [JT('الركن 5', 'Pilar 5', 'Pillar 5'), JT('الإيمان باليوم الآخر', 'Fe en el Último Día', 'Belief in the Last Day')],
            [JT('الركن 6', 'Pilar 6', 'Pillar 6'), JT('الإيمان بالقدر', 'Fe en el decreto', 'Belief in the decree')],
          ]
        ),
        jQuiz(
          JT('من هو المَلَك الموكّل بالوحي؟',
            '¿Qué ángel está encargado de la revelación?',
            'Which angel is entrusted with revelation?'),
          [
            JT('جبريل', 'Jibril', 'Jibril'),
            JT('ميكائيل', 'Mikail', 'Mikail'),
            JT('إسرافيل', 'Israfil', 'Israfil'),
            JT('مالك', 'Malik', 'Malik'),
          ], 0,
          JT('جبريل عليه السلام هو الأمين على الوحي. ميكائيل للمطر والرزق، وإسرافيل للصور، ومالك خازن النار.',
            'Jibril es el fiel de la revelación; Mikail, de la lluvia; Israfil, de la trompeta; Malik, del Fuego.',
            'Jibril is entrusted with revelation; Mikail with rain; Israfil with the trumpet; Malik with the Fire.')
        ),
      ],
    },
  ],
};

if (typeof window !== 'undefined') window.COURSE_JOURNEY = COURSE_JOURNEY;
