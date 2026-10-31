// 🗺️ رحلة المسلم — المحطات 4–6 (النبي ﷺ · أركان الإسلام · الأسئلة الشائعة)
// يُحمَّل بعد journey.js ويضيف إلى window.COURSE_JOURNEY.stations
(function () {
  'use strict';
  var C = window.COURSE_JOURNEY;
  if (!C || !C.stations) return;

  C.stations.push(
    // ═══════════════════ المحطة 4 ═══════════════════
    {
      id: 'prophet',
      icon: '<i class="fas fa-mosque"></i>',
      title: { ar: 'نبيّنا محمد ﷺ', es: 'Nuestro Profeta Muhammad ﷺ', en: 'Our Prophet Muhammad ﷺ' },
      mascotIntro: {
        ar: 'الإيمان به ركن، لكن معرفته حبّ. هذه المحطة تعرّفك بالإنسان الذي غيّر التاريخ بلطفه.',
        es: 'Creer en él es un pilar, pero conocerle es amor. Esta estación te presenta al hombre que cambió la historia con su dulzura.',
        en: 'Belief in him is a pillar, but knowing him is love. This station introduces the man who changed history with gentleness.',
      },
      lessons: [
        jCard(
          JT('لماذا نؤمن به رسولاً؟',
            '¿Por qué creemos en él como mensajero?',
            'Why do we believe in him as a messenger?'),
          JT('محمد بن عبد الله ﷺ وُلد في مكة سنة 570م تقريباً، ويتيماً: مات أبوه قبل ولادته، وأمه وهو طفل، ثم جدّه. نشأ في قوم يعبدون الأصنام، فلم يسجد لصنم قط.\n\n**ثلاثة أسباب تجعل رسالته معقولة:**\n\n1️⃣ **أمانته قبل النبوة** — لقّبه قومه «الصادق الأمين» أربعين سنة قبل أن ينزل عليه الوحي.\n2️⃣ **القرآن نفسه** — كتاب لا يستطيع بشر أن يأتي بمثله، وفيه من الأخبار والعلوم ما لا يُعرف إلا بالوحي.\n3️⃣ **تطابق الرسالة مع الفطرة** — عدل، ورحمة، وصدق، ونهي عن الظلم.\n\n🌿 **ملاحظة:** نحن لا نؤمن بأنه إله ولا نعبده؛ هو عبدٌ رسول. والمحبة لا تعني الغلوّ.',
            'Muhammad ibn Abdullah ﷺ nació en La Meca hacia el 570 d.C., huérfano: su padre murió antes de nacer él, su madre siendo niño, luego su abuelo. Creció entre idólatras y nunca se postró ante un ídolo.\n\n**Tres razones que hacen razonable su mensaje:**\n\n1️⃣ **Su honestidad antes de la profecía** — su pueblo le llamó «el veraz, el fiel» durante cuarenta años antes de la revelación.\n2️⃣ **El Corán mismo** — un libro que ningún humano puede igualar, con noticias y conocimientos que solo llegan por revelación.\n3️⃣ **Coherencia con la naturaleza humana** — justicia, misericordia, verdad, rechazo de la opresión.\n\n🌿 **Nota:** no creemos que sea un dios ni le adoramos; es un siervo y mensajero. El amor no implica exageración.',
            "Muhammad ibn Abdullah ﷺ was born in Makkah around 570 CE, an orphan: his father died before his birth, his mother when he was a child, then his grandfather. He grew up among idolaters and never prostrated to an idol.\n\n**Three reasons his message is reasonable:**\n\n1️⃣ **His honesty before prophethood** — his people called him \"the truthful, the trustworthy\" for forty years before revelation.\n2️⃣ **The Quran itself** — a book no human can match, with reports and knowledge that come only by revelation.\n3️⃣ **Coherence with human nature** — justice, mercy, truth, rejection of oppression.\n\n🌿 **Note:** we do not believe he was a god nor worship him; he is a servant and messenger. Love does not mean excess."),
          JT('السيرة · البخاري 6029', 'Sira · Bujari 6029', 'Sira · Sahih al-Bukhari 6029')
        ),
        jInfo('steps',
          JT('خط زمني مختصر: أربع محطات في حياته',
            'Cronología breve: cuatro momentos de su vida',
            'A short timeline: four moments of his life'),
          [
            jItem('fa-baby', JT('الولادة في مكة · 570م', 'Nacimiento en La Meca · 570', 'Birth in Makkah · 570'),
              JT('يتيمٌ في قبيلة قريش، نشأ في بيت جدّه ثم عمّه أبي طالب.',
                'Huérfano en la tribu de Quraysh, criado por su abuelo y luego por su tío Abu Talib.',
                'An orphan of the Quraysh, raised by his grandfather then his uncle Abu Talib.')),
            jItem('fa-lightbulb', JT('بدء الوحي · 610م', 'Inicio de la revelación · 610', 'The revelation begins · 610'),
              JT('في غار حراء، نزل جبريل بأول آية: «اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ». كان عمره أربعين سنة.',
                'En la cueva de Hira, Jibril trajo el primer verso: «Recita en el nombre de tu Señor que creó». Tenía cuarenta años.',
                'In the cave of Hira, Jibril brought the first verse: \"Recite in the name of your Lord who created.\" He was forty.')),
            jItem('fa-route', JT('الهجرة إلى المدينة · 622م', 'La emigración a Medina · 622', 'The migration to Madinah · 622'),
              JT('بعد ثلاث عشرة سنة من الدعوة في مكة، هاجر إلى المدينة وأسّس أول مجتمع مسلم.',
                'Tras trece años de predicación en La Meca, emigró a Medina y fundó la primera comunidad musulmana.',
                'After thirteen years of preaching in Makkah, he migrated to Madinah and founded the first Muslim community.')),
            jItem('fa-moon', JT('الوفاة · 632م', 'Su fallecimiento · 632', 'His death · 632'),
              JT('توفّي في المدينة بعد أن بلّغ الرسالة وأتمّها، ولم يترك مالاً ولا مُلكاً، بل كتاباً وسنّة.',
                'Murió en Medina tras completar el mensaje; no dejó riqueza ni reino, sino un Libro y una Sunna.',
                'He died in Madinah having completed the message; he left no wealth or kingdom, but a Book and a Sunna.')),
          ],
          JT('هذه أربع نقاط فقط. لماذا لا نذكر المعارك والتفاصيل السياسية؟ لأن هدف هذه المحطة التعريف بالإنسان ورسالته، لا دراسة التاريخ التفصيلي.',
            'Solo cuatro puntos. ¿Por qué no las batallas y los detalles políticos? Porque esta estación presenta al hombre y su mensaje, no estudia historia detallada.',
            'Only four points. Why not the battles and political details? Because this station introduces the man and his message, not detailed history.'),
          JT('سيرة ابن هشام · البخاري', 'Sira de Ibn Hisham · Bujari', 'Ibn Hisham’s Sira · Bukhari')
        ),
        jCard(
          JT('أخلاقه قبل النبوة: الصادق الأمين',
            'Su carácter antes de la profecía: el veraz, el fiel',
            'His character before prophethood: the truthful, the trustworthy'),
          JT('قبل أن ينزل عليه شيء، عرفه الناس بأمرين: **الصدق** و**الأمانة**.\n\n• إذا حدّث صدق.\n• إذا ائتُمِن على مال أو سرّ حفظه.\n• إذا عاهد وفى.\n• إذا خاصم أنصف.\n\nولم يكن ذلك في شبابه فقط؛ حمله إلى آخر حياته. وحين سألت عائشة رضي الله عنها عن خلقه قالت: «كان خُلُقه القرآن».\n\n🌱 **درس للمبتدئ:** الأخلاق ليست زينة تُضاف بعد الالتزام، بل هي **البرهان الأول** على صدق الالتزام. من أسلم ولم يتحسّن خلقه، فليعلم أن الطريق أطول مما ظنّ، لا أنه خطأ.',
            'Antes de recibir revelación, la gente le conocía por dos cosas: **veracidad** y **confiabilidad**.\n\n• Si hablaba, decía verdad.\n• Si se le confiaba un bien o un secreto, lo guardaba.\n• Si pactaba, cumplía.\n• Si disputaba, era justo.\n\nY no fue solo en su juventud: le acompañó hasta el final. Cuando preguntaron a Aisha por su carácter, dijo: «Su carácter era el Corán».\n\n🌱 **Lección para el principiante:** la ética no es un adorno que se añade después, sino **la primera prueba** de la sinceridad del compromiso. Si alguien abraza el Islam y su carácter no mejora, sepa que el camino es más largo, no que se equivocó.',
            "Before any revelation, people knew him for two things: **truthfulness** and **trustworthiness**.\n\n• If he spoke, he spoke truth.\n• If entrusted with wealth or a secret, he guarded it.\n• If he made a pact, he fulfilled it.\n• If he disputed, he was fair.\n\nAnd this was not only in his youth: it stayed to the end. When Aisha was asked about his character she said: \"His character was the Quran.\"\n\n🌱 **Lesson for a beginner:** ethics are not an ornament added later but **the first proof** of a commitment's sincerity. If someone embraces Islam and their character does not improve, let them know the road is longer — not that they were wrong."),
          JT('صحيح مسلم 746', 'Sahih Muslim 746', 'Sahih Muslim 746')
        ),
        jCard(
          JT('بدء الوحي: «اقرأ»',
            'El inicio de la revelación: «Recita»',
            'The beginning of revelation: "Recite"'),
          JT('في غار حراء، بعيداً عن ضجيج مكة، كان يخلو للتفكّر. جاءه جبريل فقال: «اقرأ». قال: «ما أنا بقارئ». فضمّه إليه ثلاث مرات، ثم قرأ: «اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ · خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ · اقْرَأْ وَرَبُّكَ الْأَكْرَمُ» (العلق 1-3).\n\nعاد إلى خديجة رضي الله عنها يرتجف، فقالت كلمة تُخلّد: «كلا، والله لا يخزيك الله أبداً؛ إنك لتصل الرحم، وتحمل الكَلّ، وتكسب المعدوم، وتقري الضيف، وتعين على نوائب الحق.»\n\n🌿 **ثلاث فوائد:**\n1️⃣ أول أمر في الإسلام كان **«اقرأ»** — العلم مقدَّم.\n2️⃣ الرجل القويّ يرتجف، فالشجاعة ليست انعدام الخوف بل التقدّم معه.\n3️⃣ الزوجة الصالحة كانت أول من صدّق وآزر، فالدعم القريب نعمة.',
            'En la cueva de Hira, lejos del ruido de La Meca, se retiraba a reflexionar. Vino Jibril y dijo: «Recita». Él respondió: «No soy de los que leen». Le abrazó tres veces y recitó: «Recita en el nombre de tu Señor que creó · creó al ser humano de un coágulo · recita, tu Señor es el más generoso» (96:1-3).\n\nVolvió a Jadiya temblando, y ella dijo una frase inmortal: «No, por Allah, Allah no te humillará jamás; tú unes los lazos familiares, cargas con el débil, ayudas al que no tiene, atiendes al huésped y auxilias en las desgracias justas».\n\n🌿 **Tres frutos:**\n1️⃣ La primera orden del Islam fue **«recita»** — el saber va primero.\n2️⃣ El hombre fuerte tiembla: el valor no es no tener miedo, sino avanzar con él.\n3️⃣ La esposa virtuosa fue la primera en creer y apoyar: el apoyo cercano es una gracia.',
            "In the cave of Hira, away from Makkah's noise, he would withdraw to reflect. Jibril came and said: \"Recite.\" He replied: \"I am not a reciter.\" He embraced him three times, then recited: \"Recite in the name of your Lord who created · created the human being from a clot · recite, your Lord is the most generous\" (96:1-3).\n\nHe returned to Khadija trembling, and she said an immortal sentence: \"No, by Allah, Allah will never humiliate you; you keep family ties, carry the weak, help the destitute, host the guest, and aid in rightful calamities.\"\n\n🌿 **Three fruits:**\n1️⃣ The first command of Islam was **\"recite\"** — knowledge comes first.\n2️⃣ The strong man trembles: courage is not the absence of fear but moving forward with it.\n3️⃣ The virtuous wife was the first to believe and support: near support is a grace."),
          JT('القرآن 96:1-5 · صحيح البخاري 3', 'Corán 96:1-5 · Bujari 3', 'Quran 96:1-5 · Sahih al-Bukhari 3')
        ),
        jCard(
          JT('رحمته بالأطفال والضعيف',
            'Su misericordia con los niños y los débiles',
            'His mercy with children and the weak'),
          JT('كان ﷺ يُقبّل الأطفال ويحملهم في الصلاة. قال الأقرع بن حابس: «إن لي عشرة من الولد ما قبّلت واحداً منهم»، فقال ﷺ: «من لا يَرحم لا يُرحم.» (البخاري 5997)\n\n• كان يُسلّم على الصبيان في الطريق.\n• كان يقصّر الصلاة إذا سمع بكاء طفل.\n• كان يوصي بالضعفاء والأرامل والمساكين.\n• قال: «اللهم إني أُحرّج حقّ الضعيفين: اليتيم والمرأة.» (ابن ماجه 3678)\n\n🌿 **لماذا هذا مهم لك؟** لأن الإسلام يُقاس في أضعف لحظاتك: مع من لا يستطيع أن يردّ لك، ومع من لا يملك شيئاً يُقدّمه.',
            'Besaba a los niños y los llevaba en brazos durante la oración. Al-Aqra‘ ibn Habis dijo: «Tengo diez hijos y no he besado a ninguno», y el Profeta ﷺ respondió: «Quien no tiene misericordia no la recibe» (Bujari 5997).\n\n• Saludaba a los niños en la calle.\n• Acortaba la oración si oía llorar a un niño.\n• Recomendaba cuidar a los débiles, las viudas y los pobres.\n• Dijo: «Oh Allah, declaro inviolables los derechos de los dos débiles: el huérfano y la mujer» (Ibn Maja 3678).\n\n🌿 **¿Por qué te importa?** Porque el Islam se mide en tus momentos más débiles: con quien no puede responderte y con quien no tiene nada que ofrecer.',
            "He kissed children and carried them during prayer. Al-Aqra' ibn Habis said: \"I have ten children and have never kissed one,\" and the Prophet ﷺ replied: \"Whoever shows no mercy receives none\" (Bukhari 5997).\n\n• He greeted children in the street.\n• He shortened the prayer when he heard a child crying.\n• He urged care for the weak, widows and the poor.\n• He said: \"O Allah, I declare the rights of the two weak ones inviolable: the orphan and the woman\" (Ibn Majah 3678).\n\n🌿 **Why does it matter?** Because Islam is measured in your weakest moments: with those who cannot answer you and those who have nothing to offer."),
          JT('صحيح البخاري 5997 · ابن ماجه 3678', 'Bujari 5997 · Ibn Maja 3678', 'Sahih al-Bukhari 5997 · Ibn Majah 3678')
        ),
        jCard(
          JT('رحمته بالحيوان',
            'Su misericordia con los animales',
            'His mercy with animals'),
          JT('قال ﷺ: «إن الله كتب الإحسان على كل شيء.» (مسلم 1955)\n\n**قصص قصيرة:**\n• امرأة دخلت النار في هرة حبستها فلا هي أطعمتها ولا تركتها تأكل من الأرض.\n• رجل سقى كلباً عطشاً فشكر الله له فغفر له.\n• نهى عن تحميل الحيوان ما لا يطيق، وعن تعذيبه، وعن لعنه.\n\n🌿 **معيار صغير يكشف كبيراً:** من يرحم من لا ينطق، يرحم من ينطق. ومن يقسو على حيوان أعزل، يسهل عليه القسوة على إنسان أعزل.',
            'Dijo ﷺ: «Allah ha prescrito la excelencia en todo» (Muslim 1955).\n\n**Historias breves:**\n• Una mujer entró al Fuego por un gato que encerró sin darle de comer ni dejarlo buscar.\n• Un hombre dio agua a un perro sediento y Allah le agradeció y le perdonó.\n• Prohibió cargar a un animal más de lo que puede, torturarlo o maldecirlo.\n\n🌿 **Un criterio pequeño que revela uno grande:** quien es misericordioso con quien no habla, lo será con quien habla. Quien se endurece con un animal indefenso, fácilmente se endurece con una persona indefensa.',
            "He said ﷺ: \"Allah has prescribed excellence in all things\" (Muslim 1955).\n\n**Short stories:**\n• A woman entered the Fire because of a cat she confined, neither feeding it nor letting it eat.\n• A man gave water to a thirsty dog, and Allah thanked him and forgave him.\n• He forbade loading an animal beyond its capacity, torturing it, or cursing it.\n\n🌿 **A small measure that reveals a great one:** whoever is merciful to the speechless will be merciful to the speaking. Whoever hardens against a defenceless animal will easily harden against a defenceless person."),
          JT('صحيح مسلم 1955 · البخاري 2365', 'Muslim 1955 · Bujari 2365', 'Sahih Muslim 1955 · Sahih al-Bukhari 2365')
        ),
        jCard(
          JT('خاتم الأنبياء',
            'El sello de los profetas',
            'The seal of the prophets'),
          JT('«مَا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِنْ رِجَالِكُمْ وَلَٰكِنْ رَسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ» (الأحزاب 40).\n\n**معنى الخاتم:** لا نبيّ بعده، ورسالته للناس جميعاً لا لقبيلة ولا لغة: «وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِلْعَالَمِينَ» (الأنبياء 107).\n\n**وهذا يترتّب عليه:**\n1️⃣ لا انتظار لرسول جديد.\n2️⃣ لا حاجة إلى وسيط بينك وبين الله.\n3️⃣ رسالته محفوظة، فتكفيك بلا إضافات.\n\n📖 قال ﷺ: «كان النبي يُبعث إلى قومه خاصة، وبُعثتُ إلى الناس عامة.» (البخاري 335)',
            '«Muhammad no es el padre de ninguno de vuestros hombres, sino el Mensajero de Allah y el sello de los profetas» (33:40).\n\n**Sentido del sello:** no hay profeta después de él, y su mensaje es para toda la humanidad, no para una tribu ni una lengua: «No te enviamos sino como misericordia para los mundos» (21:107).\n\n**Consecuencias:**\n1️⃣ No se espera un nuevo mensajero.\n2️⃣ No hace falta intermediario entre tú y Allah.\n3️⃣ Su mensaje está preservado: te basta, sin añadidos.\n\n📖 Dijo ﷺ: «Todo profeta era enviado a su pueblo en particular; yo fui enviado a toda la humanidad» (Bujari 335).',
            "\"Muhammad is not the father of any of your men, but the Messenger of Allah and the seal of the prophets\" (33:40).\n\n**Meaning of the seal:** there is no prophet after him, and his message is for all humanity, not one tribe or language: \"We sent you only as a mercy to the worlds\" (21:107).\n\n**Consequences:**\n1️⃣ No new messenger is awaited.\n2️⃣ No intermediary is needed between you and Allah.\n3️⃣ His message is preserved: it suffices you, with no additions.\n\n📖 He said ﷺ: \"Every prophet was sent to his own people; I was sent to all humanity\" (Bukhari 335)."),
          JT('القرآن 33:40 · 21:107', 'Corán 33:40 · 21:107', 'Quran 33:40 · 21:107')
        ),
        jVideo('Uu2XfkC68Hs',
          JT('فيديو: كيف تصبح مسلماً؟ الأركان الخمسة والستة', 'Vídeo: cómo hacerse musulmán — 5 y 6 pilares', 'Video: how to become Muslim — 5 and 6 pillars'),
          JT('فيديو يشرح الشهادتين وأركان الإسلام وأركان الإيمان معاً. مناسب كمقدمة للمحطة الخامسة، وقد وضعناه هنا لأنه يجمع الصورة كاملة. الفيديو بالإسبانية.',
            'Vídeo que explica el testimonio, los cinco pilares y los seis de la fe. Sirve de introducción a la estación 5; está aquí porque reúne el cuadro completo. En español.',
            'A video explaining the testimony, the five pillars and the six of faith together. A good introduction to station 5; it sits here because it gathers the whole picture. In Spanish.')
        ),
        jCard(
          JT('لماذا لا نرسم النبي ﷺ؟',
            '¿Por qué no dibujamos al Profeta ﷺ?',
            'Why do we not depict the Prophet ﷺ?'),
          JT('في هذا التطبيق لن تجد صورة للنبي ﷺ ولا لأي صحابي، وهذا قرار مقصود:\n\n1️⃣ **سدّ باب الغلوّ** — الأمم قبلنا انحرفت حين قدّست صور أنبيائها.\n2️⃣ **الاحترام** — مقامه أعلى من أن يُختزل في رسم.\n3️⃣ **لا نعرف شكله** — لا توجد صورة موثوقة أصلاً، فكل رسم تخيّل.\n\n🌿 **كيف نعرفه إذن؟** بالسيرة، وبأخلاقه، وبوصف أصحابه له: كان ربعةً من القوم، شديد سواد الشعر، واسع الجبهة… وهذه أوصاف تُقرأ ولا تُرسم.\n\n📌 **الرمز المستخدم هنا:** مئذنة، كتاب، هلال، ضوء — عناصر رمزية فقط.',
            'En esta app no encontrarás una imagen del Profeta ﷺ ni de ningún compañero, y es una decisión deliberada:\n\n1️⃣ **Cerrar la puerta al exceso** — naciones anteriores se desviaron al sacralizar imágenes de sus profetas.\n2️⃣ **Respeto** — su rango es mayor que reducirse a un dibujo.\n3️⃣ **No conocemos su forma** — no hay imagen fiable; todo dibujo es imaginación.\n\n🌿 **¿Cómo le conocemos entonces?** Por su biografía, su carácter y la descripción de sus compañeros: de estatura media, cabello muy negro, frente amplia… descripciones que se leen, no se dibujan.\n\n📌 **Símbolos usados aquí:** minarete, libro, media luna, luz — solo elementos simbólicos.',
            "In this app you will find no image of the Prophet ﷺ or of any companion, and this is deliberate:\n\n1️⃣ **Closing the door to excess** — earlier nations went astray by sacralising images of their prophets.\n2️⃣ **Respect** — his rank is greater than being reduced to a drawing.\n3️⃣ **We do not know his form** — no reliable image exists; every drawing is imagination.\n\n🌿 **How do we know him then?** Through his biography, his character and his companions' descriptions: of medium height, very black hair, a broad forehead… descriptions to be read, not drawn.\n\n📌 **Symbols used here:** minaret, book, crescent, light — symbolic elements only.")
        ),
        jFlash(
          JT('بطاقات السيرة', 'Tarjetas de la biografía', 'Biography cards'),
          [
            [JT('الصادق الأمين', 'El veraz, el fiel', 'The truthful, the trustworthy'), JT('لقبه قبل النبوة بأربعين سنة.', 'Su apodo cuarenta años antes de la profecía.', 'His title forty years before prophethood.')],
            [JT('غار حراء', 'Cueva de Hira', 'Cave of Hira'), JT('مكان نزول أول الوحي: «اقرأ».', 'Lugar de la primera revelación: «Recita».', 'Where the first revelation came: "Recite".')],
            [JT('خديجة', 'Jadiya', 'Khadija'), JT('أول من صدّق وآزر.', 'La primera en creer y apoyar.', 'The first to believe and support.')],
            [JT('الهجرة', 'La Hégira', 'The Hijra'), JT('من مكة إلى المدينة سنة 622م.', 'De La Meca a Medina en 622.', 'From Makkah to Madinah in 622.')],
            [JT('خاتم الأنبياء', 'Sello de los profetas', 'Seal of the prophets'), JT('لا نبيّ بعده، ورسالته للعالمين.', 'No hay profeta después; su mensaje es universal.', 'No prophet after him; his message is universal.')],
            [JT('خُلُقه القرآن', 'Su carácter era el Corán', 'His character was the Quran'), JT('وصف عائشة رضي الله عنها.', 'Descripción de Aisha.', "Aisha's description.")],
          ]
        ),
        jQuiz(
          JT('ماذا كان أول أمر نزل في القرآن؟',
            '¿Cuál fue la primera orden revelada en el Corán?',
            'What was the first command revealed in the Quran?'),
          [
            JT('«اقرأ»', '«Recita»', '"Recite"'),
            JT('«صلِّ»', '«Reza»', '"Pray"'),
            JT('«صُم»', '«Ayuna»', '"Fast"'),
            JT('«حُجّ»', '«Peregrina»', '"Make pilgrimage"'),
          ], 0,
          JT('أول ما نزل: «اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ» (العلق 1). العلم أولاً، والعبادة تُبنى على فهم.',
            'Lo primero: «Recita en el nombre de tu Señor que creó» (96:1). El saber primero; la adoración se construye sobre comprensión.',
            'The first: "Recite in the name of your Lord who created" (96:1). Knowledge first; worship is built on understanding.')
        ),
      ],
    },

    // ═══════════════════ المحطة 5 ═══════════════════
    {
      id: 'pillars',
      icon: '<i class="fas fa-hands-praying"></i>',
      title: { ar: 'أركان الإسلام الخمسة', es: 'Los cinco pilares del Islam', en: 'The five pillars of Islam' },
      mascotIntro: {
        ar: 'هذه المحطة بوابة لا كتاب: كل ركن له كورس كامل ينتظرك.',
        es: 'Esta estación es una puerta, no un libro: cada pilar tiene un curso completo esperándote.',
        en: 'This station is a gateway, not a book: each pillar has a full course waiting.',
      },
      lessons: [
        jInfo('grid',
          JT('عجلة الأركان الخمسة', 'La rueda de los cinco pilares', 'The wheel of the five pillars'),
          [
            jItem('fa-shahada', JT('١ · الشهادتان', '1 · El testimonio', '1 · The testimony'), JT('«لا إله إلا الله، محمد رسول الله» — مفتاح الدخول.', '«No hay dios salvo Allah, Muhammad es Su mensajero» — la llave de entrada.', '"No deity but Allah, Muhammad is His messenger" — the key.')),
            jItem('fa-hands-praying', JT('٢ · الصلاة', '2 · La oración', '2 · Prayer'), JT('خمس صلوات في اليوم، عمود الدين.', 'Cinco oraciones al día, el pilar de la religión.', 'Five prayers a day, the pillar of the religion.')),
            jItem('fa-hand-holding-dollar', JT('٣ · الزكاة', '3 · El zakat', '3 · Zakat'), JT('حقّ المال للفقراء: 2.5% في الحول.', 'Derecho del pobre sobre el dinero: 2,5% anual.', 'The poor\'s right in wealth: 2.5% yearly.')),
            jItem('fa-moon', JT('٤ · الصوم', '4 · El ayuno', '4 · Fasting'), JT('رمضان: من الفجر إلى المغرب.', 'Ramadán: del alba al ocaso.', 'Ramadan: from dawn to sunset.')),
            jItem('fa-kaaba', JT('٥ · الحج', '5 · El hajj', '5 · Hajj'), JT('مرة في العمر لمن استطاع.', 'Una vez en la vida para quien pueda.', 'Once in a lifetime for those who can.')),
          ],
          JT('«بُني الإسلام على خمس…» (البخاري 8) — والترتيب هنا تعليمي، لا أفضلية بين الأركان في الوجوب.',
            '«El Islam se edificó sobre cinco…» (Bujari 8). El orden es didáctico; no implica preferencia en la obligatoriedad.',
            '"Islam is built upon five…" (Bukhari 8). The order is pedagogical, not a ranking of obligation.'),
          JT('صحيح البخاري 8', 'Sahih Bujari 8', 'Sahih al-Bukhari 8')
        ),
        jCard(
          JT('الركن الأول: الشهادتان',
            'Pilar 1: el testimonio',
            'Pillar 1: the testimony'),
          JT('«أشهد أن لا إله إلا الله، وأشهد أن محمداً رسول الله.»\n\n**شطران لا ينفصلان:**\n1️⃣ **نفي** كل معبود غير الله، **وإثبات** العبادة له وحده.\n2️⃣ **تصديق** رسالة محمد ﷺ وطاعته فيما أمر.\n\n**شروطها العملية (باختصار):** علمٌ بما تعني، ويقين، وإخلاص، وصدق، ومحبة، وقبول. القول وحده بلا عمل يبقى دعوى.\n\n🌿 **بعد النطق بها:** تصبح مسلماً كاملاً في الحقوق والواجبات؛ لك ما للمسلمين وعليك ما عليهم. ولا يشترط أن تكون قد بلغت الكمال — الطريق يبدأ بالخطوة.',
            '«Atestiguo que no hay divinidad salvo Allah y que Muhammad es el mensajero de Allah».\n\n**Dos partes inseparables:**\n1️⃣ **Negar** toda divinidad ajena y **afirmar** la adoración solo para Él.\n2️⃣ **Aceptar** el mensaje de Muhammad ﷺ y obedecerle en lo que ordenó.\n\n**Condiciones prácticas (resumen):** saber qué significa, certeza, sinceridad, veracidad, amor y aceptación. La palabra sin obra queda en afirmación.\n\n🌿 **Tras pronunciarla:** eres musulmán pleno en derechos y deberes; tienes lo que tienen y debes lo que deben. No se exige que seas perfecto: el camino empieza con el paso.',
            "\"I bear witness that there is no deity but Allah, and that Muhammad is the messenger of Allah.\"\n\n**Two inseparable parts:**\n1️⃣ **Negating** every other deity and **affirming** worship for Him alone.\n2️⃣ **Accepting** Muhammad's ﷺ message and obeying what he commanded.\n\n**Practical conditions (summary):** knowledge of what it means, certainty, sincerity, truthfulness, love and acceptance. The word without action remains a claim.\n\n🌿 **After saying it:** you are a full Muslim in rights and duties; you have what they have and owe what they owe. You are not required to be perfect: the path begins with a step.")
        ),
        jCard(
          JT('الركن الثاني: الصلاة',
            'Pilar 2: la oración',
            'Pillar 2: prayer'),
          JT('خمس صلوات: الفجر، الظهر، العصر، المغرب، العشاء. كل صلاة لها وقت محدّد، وطهارة قبلها، واتجاه قبلة.\n\n**ثلاثة أرقام تُطمئنك:**\n• 5 صلوات ≈ 25 دقيقة في اليوم.\n• الوضوء دقيقتان.\n• أركان الصلاة القولية والفعلية تُتعلّم في أسبوع.\n\n📌 **«تعمّق أكثر»:** افتح **كورس الصلاة الكامل** في قسم الكورسات — فيه خطوات الوضوء، ومواقيت الصلاة، وصفة الصلاة بالصوت والصورة.\n\n🌿 لا تؤجّل الصلاة حتى «تتعلّمها تماماً»؛ تعلّمها وأنت تصلّي.',
            'Cinco oraciones: Fajr, Duhr, Asr, Maghrib, Isha. Cada una tiene su tiempo, requiere pureza previa y orientación a la qibla.\n\n**Tres cifras que tranquilizan:**\n• 5 oraciones ≈ 25 minutos al día.\n• El wudu, dos minutos.\n• Los elementos de la oración se aprenden en una semana.\n\n📌 **«Profundiza más»:** abre el **curso completo de oración** en la sección Cursos: pasos del wudu, tiempos y descripción de la oración con audio.\n\n🌿 No aplaces la oración hasta «saberlo todo»; apréndela rezando.',
            "Five prayers: Fajr, Dhuhr, Asr, Maghrib, Isha. Each has its time, requires prior purity and facing the qibla.\n\n**Three reassuring numbers:**\n• 5 prayers ≈ 25 minutes a day.\n• Wudu: two minutes.\n• The prayer's elements can be learned in a week.\n\n📌 **\"Go deeper\":** open the **complete prayer course** in the Courses section: wudu steps, times, and the prayer described with audio.\n\n🌿 Do not postpone prayer until you \"know it all\"; learn it while praying.")
        ),
        jCard(
          JT('الركن الثالث: الزكاة',
            'Pilar 3: el zakat',
            'Pillar 3: zakat'),
          JT('الزكاة ليست تبرّعاً اختيارياً، بل **حقّ للفقراء** في مال الأغنياء: «وَالَّذِينَ فِي أَمْوَالِهِمْ حَقٌّ مَعْلُومٌ · لِلسَّائِلِ وَالْمَحْرُومِ» (المعارج 24-25).\n\n**الأساسيات:**\n• 2.5% من المال الذي بلغ النصاب وحال عليه الحول.\n• تُخرج من الذهب والفضة والنقود وعروض التجارة.\n• تُصرف لثمانية أصناف ذكرها القرآن (التوبة 60).\n\n🌿 **أثرها النفسي:** تُطهّر المال من الشحّ، وتذكّرك أن ما بيدك أمانة لا ملك مطلق.\n\n📌 **«تعمّق أكثر»:** كورس **أركان الإسلام** يشرح النصاب والحول والأصناف الثمانية بأمثلة.',
            'El zakat no es una donación opcional, sino **un derecho de los pobres** en el dinero de los ricos: «En sus bienes hay un derecho conocido · para el que pide y el privado» (70:24-25).\n\n**Lo básico:**\n• 2,5% del dinero que alcanzó el mínimo (nisab) y cumplió un año.\n• Se calcula sobre oro, plata, efectivo y bienes de comercio.\n• Se distribuye entre las ocho categorías mencionadas en el Corán (9:60).\n\n🌿 **Efecto interior:** purifica el dinero de la avaricia y te recuerda que lo que tienes es depósito, no propiedad absoluta.\n\n📌 **«Profundiza más»:** el curso **Pilares del Islam** explica nisab, el año y las ocho categorías con ejemplos.',
            "Zakat is not an optional donation but **a right of the poor** in the wealth of the rich: \"In their wealth is a known right · for the asker and the deprived\" (70:24-25).\n\n**Basics:**\n• 2.5% of wealth that reached the minimum (nisab) and completed a lunar year.\n• Calculated on gold, silver, cash and trade goods.\n• Distributed among the eight categories named in the Quran (9:60).\n\n🌿 **Inner effect:** it purifies wealth from stinginess and reminds you that what you hold is a trust, not absolute ownership.\n\n📌 **\"Go deeper\":** the **Pillars of Islam** course explains nisab, the year and the eight categories with examples."),
          JT('القرآن 70:24-25 · 9:60', 'Corán 70:24-25 · 9:60', 'Quran 70:24-25 · 9:60')
        ),
        jCard(
          JT('الركن الرابع: صوم رمضان',
            'Pilar 4: el ayuno de Ramadán',
            'Pillar 4: fasting Ramadan'),
          JT('من الفجر إلى المغرب: إمساك عن الطعام والشراب والجماع، مع حفظ اللسان والجوارح.\n\n**ليس امتناعاً فقط، بل تدريب:**\n• على الصبر.\n• على الشعور بالفقراء.\n• على ضبط النفس.\n• على قراءة القرآن.\n\n**أعذار مشروعة:** المرض، السفر، الحمل والرضاع، كِبَر السن — مع القضاء أو الفدية بحسب الحال.\n\n🌿 **نصيحة أول رمضان:** لا تُخطّط لعشرين هدفاً؛ اختر ثلاثة: صيام كامل، وتراويح معظم الليالي، وختم جزء من القرآن.\n\n📌 **«تعمّق أكثر»:** كورس **أركان الإسلام** يشرح أحكام الصوم والأعذار والمفطرات.',
            'Del alba al ocaso: abstenerse de comida, bebida y relaciones, cuidando la lengua y los miembros.\n\n**No es solo abstención, es entrenamiento:**\n• en paciencia,\n• en sentir a los pobres,\n• en dominio de sí,\n• en recitar el Corán.\n\n**Excusas legítimas:** enfermedad, viaje, embarazo y lactancia, vejez — con recuperación o compensación según el caso.\n\n🌿 **Consejo para tu primer Ramadán:** no planifiques veinte metas; elige tres: ayuno completo, tarawih la mayoría de las noches y recitar una parte del Corán.\n\n📌 **«Profundiza más»:** el curso **Pilares del Islam** explica las reglas del ayuno, las excusas y lo que lo invalida.',
            "From dawn to sunset: abstaining from food, drink and intimacy, while guarding the tongue and limbs.\n\n**Not mere abstinence but training:**\n• in patience,\n• in feeling for the poor,\n• in self-control,\n• in reciting the Quran.\n\n**Legitimate excuses:** illness, travel, pregnancy and nursing, old age — with making up or compensation as the case requires.\n\n🌿 **Advice for your first Ramadan:** do not plan twenty goals; pick three: complete fasting, tarawih most nights, and reciting part of the Quran.\n\n📌 **\"Go deeper\":** the **Pillars of Islam** course explains the rules of fasting, excuses, and what invalidates it."),
          JT('القرآن 2:183-185', 'Corán 2:183-185', 'Quran 2:183-185')
        ),
        jCard(
          JT('الركن الخامس: الحج',
            'Pilar 5: el hajj',
            'Pillar 5: hajj'),
          JT('مرة واحدة في العمر، على من استطاع مالاً وبدناً وأمناً في الطريق.\n\n**أركانه الأربعة:** الإحرام، والوقوف بعرفة، وطواف الإفاضة، والسعي بين الصفا والمروة.\n\n**معانيه:**\n• **وحدة** — ملايين بلباس واحد، بلا فرق بين غنيّ وفقير.\n• **توحيد** — كل الاتجاهات إلى بيت واحد.\n• **توبة** — «من حجّ فلم يرفث ولم يفسق رجع كيوم ولدته أمه» (البخاري 1521).\n\n🌿 **إن لم تستطع الآن:** لا تحرم نفسك من الأجر؛ النية الصادقة، والصدقة، والصيام في العشر، والدعاء أن يبلّغك الله بيته.',
            'Una vez en la vida, para quien puede económicamente, físicamente y con seguridad en el camino.\n\n**Sus cuatro pilares:** ihram, la estancia en Arafat, el tawaf de la partida y el sa‘i entre Safa y Marwa.\n\n**Sus sentidos:**\n• **Unidad** — millones con una sola vestimenta, sin diferencia entre rico y pobre.\n• **Tawhid** — todas las direcciones hacia una sola casa.\n• **Arrepentimiento** — «Quien peregrina sin obscenidad ni desobediencia vuelve como el día en que su madre le dio a luz» (Bujari 1521).\n\n🌿 **Si aún no puedes:** no te prives de recompensa; la intención sincera, la limosna, el ayuno en los diez días y pedir a Allah que te lleve a Su casa.',
            "Once in a lifetime, for those able in wealth, body and safety on the road.\n\n**Its four pillars:** ihram, standing at Arafat, the farewell tawaf, and sa'i between Safa and Marwa.\n\n**Its meanings:**\n• **Unity** — millions in one garment, no difference between rich and poor.\n• **Tawhid** — all directions toward one house.\n• **Repentance** — \"Whoever performs hajj without obscenity or disobedience returns as the day his mother bore him\" (Bukhari 1521).\n\n🌿 **If you cannot yet:** do not deprive yourself of reward; sincere intention, charity, fasting in the ten days, and asking Allah to bring you to His house."),
          JT('صحيح البخاري 1521', 'Sahih Bujari 1521', 'Sahih al-Bukhari 1521')
        ),
        {
          type: 'drag_drop',
          title: JT('رتّب الأركان الخمسة', 'Ordena los cinco pilares', 'Order the five pillars'),
          instruction: JT('اسحب البطاقات بالترتيب الذي ورد في حديث «بُني الإسلام على خمس».',
            'Arrastra las tarjetas en el orden del hadiz «El Islam se edificó sobre cinco».',
            'Drag the cards into the order of the hadith "Islam is built upon five".'),
          items: [
            { id: 'shahada', label: JT('الشهادتان', 'El testimonio', 'The testimony'), order: 1 },
            { id: 'salah', label: JT('الصلاة', 'La oración', 'Prayer'), order: 2 },
            { id: 'zakat', label: JT('الزكاة', 'El zakat', 'Zakat'), order: 3 },
            { id: 'sawm', label: JT('صوم رمضان', 'El ayuno de Ramadán', 'Fasting Ramadan'), order: 4 },
            { id: 'hajj', label: JT('الحج', 'El hajj', 'Hajj'), order: 5 },
          ],
        },
        jQuiz(
          JT('كم مرة يجب الحج في العمر؟',
            '¿Cuántas veces es obligatorio el hajj en la vida?',
            'How many times is hajj obligatory in a lifetime?'),
          [
            JT('مرة واحدة لمن استطاع', 'Una vez para quien pueda', 'Once, for those able'),
            JT('كل سنة', 'Cada año', 'Every year'),
            JT('مرتان', 'Dos veces', 'Twice'),
            JT('خمس مرات', 'Cinco veces', 'Five times'),
          ], 0,
          JT('مرة واحدة على المستطيع. وما زاد فهو تطوّع. وفي الحديث: «الحجّ مرة، فمن زاد فهو تطوّع» (أبو داود 1720).',
            'Una vez para quien puede; lo demás es voluntario: «El hajj es una vez; lo que exceda es voluntario» (Abu Dawud 1720).',
            'Once for those able; more is voluntary: "Hajj is once; whatever exceeds is voluntary" (Abu Dawud 1720).')
        ),
      ],
    },

    // ═══════════════════ المحطة 6 ═══════════════════
    {
      id: 'questions',
      icon: '<i class="fas fa-comments"></i>',
      title: { ar: 'أسئلة وشبهات شائعة', es: 'Preguntas y dudas frecuentes', en: 'Common questions and doubts' },
      mascotIntro: {
        ar: 'السؤال ليس عيباً ولا خيانة. هذه المحطة تجيب بهدوء، بلا جدال ولا تعقيد.',
        es: 'Preguntar no es una falta ni una traición. Esta estación responde con calma, sin polémica ni complicación.',
        en: 'Asking is neither a fault nor betrayal. This station answers calmly, without polemics or complication.',
      },
      lessons: [
        jInfo('list',
          JT('خمس شبهات… وخمس حقائق', 'Cinco dudas… cinco hechos', 'Five doubts… five facts'),
          [
            jItem('fa-xmark', JT('✗ «انتشر بالسيف»', '✗ «Se extendió por la espada»', '✗ "It spread by the sword"'),
              JT('✓ لا إكراه في الدين، وأكثر من دخل الإسلام عبر التجارة والتزاوج والدعوة.',
                '✓ «No hay coacción en la religión»; la mayoría entró por comercio, matrimonio y predicación.',
                '✓ "No compulsion in religion"; most entered through trade, marriage and preaching.')),
            jItem('fa-xmark', JT('✗ «المرأة مضطهدة»', '✗ «La mujer está oprimida»', '✗ "Women are oppressed"'),
              JT('✓ للمرأة ذمة مالية مستقلة، وميراث، وحق التعلّم والعمل والشكوى — والظلم العرفي ليس ديناً.',
                '✓ La mujer tiene patrimonio propio, herencia, derecho a estudiar, trabajar y reclamar; la opresión costumbrista no es religión.',
                '✓ Women hold independent wealth, inheritance, and the right to learn, work and complain; customary oppression is not religion.')),
            jItem('fa-xmark', JT('✗ «الله يُغضبه كل شيء»', '✗ «Allah se enoja por todo»', '✗ "Allah is angered by everything"'),
              JT('✓ «رحمة الله سبقت غضبه»، والتوبة مقبولة ما دامت الروح.',
                '✓ «La misericordia de Allah precede a Su ira», y el arrepentimiento se acepta mientras haya vida.',
                '✓ "Allah\'s mercy precedes His wrath," and repentance is accepted while life remains.')),
            jItem('fa-xmark', JT('✗ «دين العرب فقط»', '✗ «Es solo para árabes»', '✗ "It is only for Arabs"'),
              JT('✓ رسالة للناس جميعاً؛ لا فرق بين عربي وأعجمي إلا بالتقوى.',
                '✓ Un mensaje para toda la humanidad; no hay diferencia salvo en la piedad.',
                '✓ A message for all humanity; no difference except in piety.')),
            jItem('fa-xmark', JT('✗ «لا عقل فيه»', '✗ «No hay lugar para la razón»', '✗ "There is no room for reason"'),
              JT('✓ القرآن يدعو إلى النظر والتفكّر عشرات المرات: «أفلا يتدبّرون».',
                '✓ El Corán llama a observar y reflexionar decenas de veces: «¿No meditan?».',
                '✓ The Quran calls to observe and reflect dozens of times: "Will they not reflect?"')),
          ],
          JT('هدف هذه القائمة ليس «كسب الجدل»، بل إزالة غبار عن صورة مشوّهة. من يريد النقاش العميق فليبحث عن عالم موثوق.',
            'El objetivo no es «ganar un debate», sino quitar el polvo de una imagen distorsionada. Quien quiera profundizar, que acuda a un sabio fiable.',
            'The aim is not "winning a debate" but clearing dust from a distorted image. Whoever wants depth should turn to a reliable scholar.')
        ),
        jCard(
          JT('«الإسلام انتشر بالسيف»',
            '«El Islam se extendió por la espada»',
            '"Islam spread by the sword"'),
          JT('**الحقيقة مركّبة، لا سوداء ولا بيضاء:**\n\n1️⃣ **«لَا إِكْرَاهَ فِي الدِّينِ»** (البقرة 256) نصّ صريح، وقد طبّقه النبي ﷺ في فتح مكة: «اذهبوا فأنتم الطلقاء».\n2️⃣ **أكثر من دخل الإسلام تاريخياً** دخل عبر التجارة (جنوب شرق آسيا، غرب أفريقيا) والتزاوج والدعوة الفردية.\n3️⃣ **نعم، وُجدت حروب وفتوحات** — لكن الفتوحات كانت توسّع سلطة، والجزية بديل عن الإسلام لمن لم يسلم، مع حماية المعابد والكنائس.\n4️⃣ **الجزيرة العربية** استُثنيت من تعدد الأديان سياسياً، لا إجباراً على الإيمان.\n\n🌿 **اسأل نفسك:** لو كان الإسلام بالسيف، لَما وُجد مسيحيون في مصر بعد 1400 سنة، ولا هندوس في الهند بعد قرون من الحكم الإسلامي.',
            '**La verdad es compleja, ni negra ni blanca:**\n\n1️⃣ **«No hay coacción en la religión»** (2:256) es texto explícito; el Profeta ﷺ lo aplicó en la conquista de La Meca: «Id, sois libres».\n2️⃣ **La mayoría entró históricamente** por comercio (sudeste asiático, África occidental), matrimonio y predicación individual.\n3️⃣ **Sí hubo guerras y conquistas** — pero las conquistas ampliaban poder, y la yizia era alternativa al Islam para quien no se convertía, con protección de templos e iglesias.\n4️⃣ **Arabia** quedó excluida de la pluralidad religiosa por política, no por forzar la fe.\n\n🌿 **Pregúntate:** si el Islam fuera por la espada, no habría cristianos en Egipto tras 1400 años, ni hindúes en la India tras siglos de dominio musulmán.',
            "**The truth is complex, neither black nor white:**\n\n1️⃣ **\"No compulsion in religion\"** (2:256) is explicit text, applied by the Prophet ﷺ at the conquest of Makkah: \"Go, you are free.\"\n2️⃣ **Most entered historically** through trade (Southeast Asia, West Africa), marriage and individual preaching.\n3️⃣ **Yes, there were wars and conquests** — but conquests expanded power, and the jizya was an alternative to Islam for those who did not convert, with protection of temples and churches.\n4️⃣ **Arabia** was excluded from religious plurality politically, not by forcing faith.\n\n🌿 **Ask yourself:** if Islam came by the sword, there would be no Christians in Egypt after 1400 years, nor Hindus in India after centuries of Muslim rule."),
          JT('القرآن 2:256 · سيرة فتح مكة', 'Corán 2:256 · conquista de La Meca', 'Quran 2:256 · the conquest of Makkah')
        ),
        jCard(
          JT('«المرأة مضطهدة في الإسلام»',
            '«La mujer está oprimida en el Islam»',
            '"Women are oppressed in Islam"'),
          JT('**افصل بين ثلاثة أشياء:** النصّ، والتطبيق التاريخي، والعرف المحلي.\n\n**ما منحه النصّ:**\n• **ذمة مالية مستقلة** — مالها لها، لا يملكه زوج ولا أب.\n• **ميراث** — نصيب مضمون، بعد أن كانت المرأة نفسها تُورَّث.\n• **حقّ التعلّم والعمل والبيع والشراء** — وخديجة رضي الله عنها كانت تاجرة.\n• **حقّ الشكوى** — جاءت امرأة تشتكي زوجها إلى النبي ﷺ فنزل القرآن بإنصافها.\n• **الأم** — «أحقّ الناس بحسن صحابتي؟ قال: أمّك» ثلاثاً (البخاري 5971).\n\n**ما ليس من الدين:** منع التعليم، والعنف الأسري، وتزويج القاصرات بالإكراه، وسلب الميراث — هذه أعراف ظالمة يرفضها النصّ.\n\n🌿 **الإنصاف:** يوجد مسلمون يخالفون دينهم في هذا الباب، والحكم على الدين بأفعال المخالفين خطأ منهجي.',
            '**Separa tres cosas:** el texto, la aplicación histórica y la costumbre local.\n\n**Lo que concede el texto:**\n• **Patrimonio independiente** — su dinero es suyo, no del esposo ni del padre.\n• **Herencia** — una parte garantizada, cuando antes la mujer misma se heredaba.\n• **Derecho a estudiar, trabajar, comprar y vender** — Jadiya era comerciante.\n• **Derecho a reclamar** — una mujer se quejó de su marido ante el Profeta ﷺ y el Corán le dio la razón.\n• **La madre** — «¿Quién merece más mi buen trato? Dijo: tu madre» tres veces (Bujari 5971).\n\n**Lo que no es religión:** impedir la educación, la violencia doméstica, el matrimonio forzado de menores o privar de la herencia — costumbres opresivas que el texto rechaza.\n\n🌿 **Justicia:** hay musulmanes que contradicen su religión aquí; juzgar la religión por quienes la contradicen es un error de método.',
            "**Separate three things:** the text, historical practice, and local custom.\n\n**What the text grants:**\n• **Independent wealth** — her money is hers, not her husband's or father's.\n• **Inheritance** — a guaranteed share, when previously the woman herself was inherited.\n• **The right to learn, work, buy and sell** — Khadija was a merchant.\n• **The right to complain** — a woman complained of her husband to the Prophet ﷺ and the Quran vindicated her.\n• **The mother** — \"Who deserves my good company most? He said: your mother,\" three times (Bukhari 5971).\n\n**What is not religion:** preventing education, domestic violence, forced marriage of minors, or denying inheritance — oppressive customs the text rejects.\n\n🌿 **Fairness:** some Muslims contradict their religion here; judging the religion by those who contradict it is a methodological error.")
        ),
        jCard(
          JT('«الله يُغضبه كل شيء»',
            '«Allah se enoja por todo»',
            '"Allah is angered by everything"'),
          JT('هذه صورة عن إلهٍ يتربّص، وهي مخالفة لنصّ صريح: «وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ» (الأعراف 156)، وقال ﷺ: «إن رحمة الله سبقت غضبه» (مسلم 2751).\n\n**الفرق بين الخوف الصحي والخوف المرضي:**\n• **الصحي** — يدفعك للتوبة والعمل، وينتهي بالرجاء.\n• **المرضي** — يشلّك ويُيئّسك ويمنعك من الدعاء.\n\n**ثلاثة أبواب مفتوحة دائماً:**\n1️⃣ **التوبة** — تُقبل ما دامت الروح في الجسد.\n2️⃣ **الدعاء** — بلا وسيط ولا موعد.\n3️⃣ **العمل الصغير** — «لا تحقرنّ من المعروف شيئاً» (مسلم 2626).\n\n📖 «قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ» (الزمر 53).',
            'Es la imagen de un dios que acecha, contraria a un texto explícito: «Mi misericordia abarca todas las cosas» (7:156), y dijo ﷺ: «La misericordia de Allah precede a Su ira» (Muslim 2751).\n\n**Diferencia entre temor sano y temor enfermizo:**\n• **Sano** — te lleva al arrepentimiento y la acción, y termina en esperanza.\n• **Enfermizo** — te paraliza, te desespera y te impide suplicar.\n\n**Tres puertas siempre abiertas:**\n1️⃣ **Arrepentimiento** — aceptado mientras el alma esté en el cuerpo.\n2️⃣ **Súplica** — sin intermediario ni cita.\n3️⃣ **La obra pequeña** — «No desprecies ninguna buena acción» (Muslim 2626).\n\n📖 «Di: ¡Oh siervos míos que os excedisteis contra vosotros mismos! No desesperéis de la misericordia de Allah» (39:53).',
            "It is the image of a lurking god, contrary to explicit text: \"My mercy encompasses all things\" (7:156), and the Prophet ﷺ said: \"Allah's mercy precedes His wrath\" (Muslim 2751).\n\n**The difference between healthy and morbid fear:**\n• **Healthy** — leads to repentance and action, and ends in hope.\n• **Morbid** — paralyses you, makes you despair, and blocks supplication.\n\n**Three doors always open:**\n1️⃣ **Repentance** — accepted while the soul is in the body.\n2️⃣ **Supplication** — with no intermediary or appointment.\n3️⃣ **The small deed** — \"Do not disdain any good deed\" (Muslim 2626).\n\n📖 \"Say: O My servants who have transgressed against themselves, do not despair of Allah's mercy\" (39:53).")
        ),
        jCard(
          JT('«لماذا خلقنا الله؟»',
            '«¿Por qué nos creó Allah?»',
            '"Why did Allah create us?"'),
          JT('الجواب في آية واحدة: «وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ» (الذاريات 56).\n\n**ومعنى العبادة أوسع من الصلاة:**\n• أن تعمل بأمانة.\n• أن تحسن إلى والديك.\n• أن تبتسم في وجه أخيك.\n• أن تعدل في حكمك.\n• أن تطلب العلم.\n\n**سؤال مقابل قد يريحك:** هل خلقنا عبثاً؟ القرآن يجيب: «أَفَحَسِبْتُمْ أَنَّمَا خَلَقْنَاكُمْ عَبَثًا» (المؤمنون 115). فالحياة ليست لعبة بلا هدف، ولا اختباراً بلا نتيجة.\n\n🌿 **الاختبار الحقيقي:** ليس أن تعرف الجواب، بل أن تعيشه — أن يكون لك اتجاه في يومك المزدحم.',
            'La respuesta está en un verso: «No creé a los genios y a los humanos sino para que Me adoren» (51:56).\n\n**Y la adoración es más amplia que la oración:**\n• trabajar con honestidad,\n• ser bueno con tus padres,\n• sonreír a tu hermano,\n• ser justo al juzgar,\n• buscar conocimiento.\n\n**Una pregunta inversa que alivia:** ¿fuimos creados en vano? El Corán responde: «¿Creísteis que os creamos en vano?» (23:115). La vida no es un juego sin meta ni un examen sin resultado.\n\n🌿 **La prueba real:** no es saber la respuesta, sino vivirla — tener una dirección en tu día ajetreado.',
            "The answer is in one verse: \"I did not create the jinn and humans except to worship Me\" (51:56).\n\n**And worship is broader than prayer:**\n• working honestly,\n• being good to your parents,\n• smiling at your brother,\n• judging fairly,\n• seeking knowledge.\n\n**A reverse question that relieves:** were we created in vain? The Quran answers: \"Did you think We created you in vain?\" (23:115). Life is neither a game without purpose nor an exam without result.\n\n🌿 **The real test:** not knowing the answer, but living it — having a direction in your crowded day.")
        ),
        jCard(
          JT('«لماذا يوجد شرّ في العالم؟»',
            '«¿Por qué hay mal en el mundo?»',
            '"Why is there evil in the world?"'),
          JT('سؤال قديم، ولا يُحلّ بجملة. لكن هذه المحطات الأربع تساعد:\n\n1️⃣ **الشرّ ليس خلقاً مستقلاً** — بل نتيجة الاختيار الحرّ، والحرية ثمنها المسؤولية.\n2️⃣ **الابتلاء تربوي** — «وَنَبْلُوكُم بِالشَّرِّ وَالْخَيْرِ فِتْنَةً» (الأنبياء 35): يُخرج منك ما لا يظهر في الرخاء.\n3️⃣ **المنظور الناقص** — نرى شريحة صغيرة من الزمن؛ الحكمة الكاملة لا تُرى من الداخل.\n4️⃣ **العوض** — للمظلوم حقّ عند الله لا يسقط: «وَلَا تَحْسَبَنَّ اللَّهَ غَافِلًا عَمَّا يَعْمَلُ الظَّالِمُونَ» (إبراهيم 42).\n\n🌿 **ما يُطلب منك عملياً:** لا أن تُفسّر كل ألم، بل أن تُخفّفه حيث تستطيع — وهذا أيضاً عبادة.',
            'Pregunta antigua, y no se resuelve con una frase. Pero estas cuatro ideas ayudan:\n\n1️⃣ **El mal no es una creación independiente** — resulta de la libre elección, y la libertad tiene por precio la responsabilidad.\n2️⃣ **La prueba educa** — «Os probamos con el mal y el bien como prueba» (21:35): saca de ti lo que la comodidad no muestra.\n3️⃣ **Perspectiva incompleta** — vemos una porción pequeña del tiempo; la sabiduría completa no se ve desde dentro.\n4️⃣ **Reparación** — el oprimido tiene un derecho ante Allah que no se pierde: «No creas que Allah está desatento a lo que hacen los opresores» (14:42).\n\n🌿 **Lo que se te pide en la práctica:** no explicar todo dolor, sino aliviarlo donde puedas — eso también es adoración.',
            "An old question, not settled in one sentence. But these four ideas help:\n\n1️⃣ **Evil is not an independent creation** — it results from free choice, and freedom's price is responsibility.\n2️⃣ **Trial educates** — \"We test you with evil and good as a trial\" (21:35): it draws out what comfort never shows.\n3️⃣ **Incomplete perspective** — we see a small slice of time; full wisdom is not visible from inside.\n4️⃣ **Reparation** — the oppressed has a right with Allah that is not lost: \"Do not think Allah is unaware of what the oppressors do\" (14:42).\n\n🌿 **What is asked of you practically:** not to explain every pain, but to ease it where you can — that too is worship.")
        ),
        jCard(
          JT('«لماذا الإسلام وليس غيره؟»',
            '«¿Por qué el Islam y no otra religión?»',
            '"Why Islam and not another religion?"'),
          JT('هذا سؤال شخصي، وجوابه لا يُفرض على أحد. لكن من يبحث بصدق يجده في ثلاثة أمور:\n\n1️⃣ **وضوح التوحيد** — لا وسيط، ولا تجسيد، ولا غموض في من تُعبد.\n2️⃣ **حفظ النصّ** — القرآن محفوظ حرفاً بحرف، بخلاف كتب دينية أخرى تغيّرت نسخها.\n3️⃣ **اتساق التشريع مع الفطرة** — الرحمة، والعدل، والصدق، والنهي عن الظلم.\n\n**وأمر مهم:** الإسلام يقرّ بأن الأنبياء السابقين كانوا على حقّ، وأن أتباعهم الأصليين كانوا مسلمين بمعنى التسليم لله. الاختلاف جاء في النصوص المحرّفة والتأويلات.\n\n🌿 **احترام الآخرين:** «لَكُمْ دِينُكُمْ وَلِيَ دِينِ» (الكافرون 6) — لا إكراه، ولا سخرية، ولا إلزام. من اقتنع اقتنع، ومن لم يقتنع فحسابه على الله.',
            'Es una pregunta personal y su respuesta no se impone a nadie. Quien busca con sinceridad la halla en tres cosas:\n\n1️⃣ **Claridad del tawhid** — sin intermediario, sin encarnación, sin ambigüedad sobre a quién se adora.\n2️⃣ **Preservación del texto** — el Corán está preservado letra por letra, a diferencia de otros textos alterados.\n3️⃣ **Coherencia de la ley con la naturaleza** — misericordia, justicia, verdad, rechazo de la opresión.\n\n**Algo importante:** el Islam confirma que los profetas anteriores estaban en la verdad y que sus seguidores originales eran «musulmanes» en el sentido de entrega a Allah. La diferencia vino de textos alterados e interpretaciones.\n\n🌿 **Respeto al otro:** «Tenéis vuestra religión y yo la mía» (109:6) — sin coacción, sin burla, sin imposición. Quien se convence, se convence; quien no, su cuenta es con Allah.',
            "A personal question whose answer is imposed on no one. Whoever seeks sincerely finds it in three things:\n\n1️⃣ **Clarity of tawhid** — no intermediary, no incarnation, no ambiguity about whom is worshipped.\n2️⃣ **Preservation of the text** — the Quran is preserved letter for letter, unlike other altered texts.\n3️⃣ **Coherence of law with human nature** — mercy, justice, truth, rejection of oppression.\n\n**Something important:** Islam confirms that earlier prophets were upon truth and their original followers were \"muslim\" in the sense of surrender to Allah. The difference came from altered texts and interpretations.\n\n🌿 **Respect for others:** \"You have your religion and I have mine\" (109:6) — no compulsion, no mockery, no imposition. Whoever is convinced is convinced; whoever is not, their account is with Allah.")
        ),
        jVideo('7WvVSdgPCQA',
          JT('فيديو: 100 سؤال عن الإسلام — الجزء 1', 'Vídeo: 100 preguntas sobre el Islam — Parte 1', 'Video: 100 questions about Islam — Part 1'),
          JT('أسئلة يطرحها الناس فعلاً، بإجابات مباشرة. الفيديو بالإسبانية — شاهده كاملاً أو توقّف عند ما يخصّك.',
            'Preguntas que la gente plantea de verdad, con respuestas directas. En español: míralo entero o detente en lo que te interese.',
            'Questions people actually ask, with direct answers. In Spanish: watch it whole or pause at what concerns you.')
        ),
        jFlash(
          JT('مراجعة الأسئلة', 'Repaso de las preguntas', 'Questions review'),
          [
            [JT('لا إكراه في الدين', 'No hay coacción', 'No compulsion'), JT('البقرة 256 — أساس حرية الاعتقاد.', '2:256 — base de la libertad de creencia.', '2:256 — the basis of freedom of belief.')],
            [JT('ذمة مالية', 'Patrimonio propio', 'Own wealth'), JT('مال المرأة لها، لا يملكه غيرها.', 'El dinero de la mujer es suyo.', "A woman's money is hers.")],
            [JT('رحمة سبقت الغضب', 'La misericordia precede', 'Mercy precedes'), JT('مسلم 2751 — لا تيأس.', 'Muslim 2751 — no desesperes.', 'Muslim 2751 — do not despair.')],
            [JT('الغاية من الخلق', 'El fin de la creación', 'Purpose of creation'), JT('العبادة: الذاريات 56.', 'La adoración: 51:56.', 'Worship: 51:56.')],
            [JT('الشرّ والابتلاء', 'El mal y la prueba', 'Evil and trial'), JT('الأنبياء 35 — اختبار لا عبث.', '21:35 — prueba, no absurdo.', '21:35 — trial, not absurdity.')],
            [JT('حساب الآخرين', 'La cuenta de los demás', 'Others\' account'), JT('لا إكراه ولا سخرية: الكافرون 6.', 'Sin coacción ni burla: 109:6.', 'No compulsion or mockery: 109:6.')],
          ]
        ),
        jQuiz(
          JT('ما الآية التي تنصّ على عدم الإكراه في الدين؟',
            '¿Qué verso establece que no hay coacción en la religión?',
            'Which verse states there is no compulsion in religion?'),
          [
            JT('البقرة 256', 'Corán 2:256', 'Quran 2:256'),
            JT('الفاتحة 1', 'Corán 1:1', 'Quran 1:1'),
            JT('الإخلاص 1', 'Corán 112:1', 'Quran 112:1'),
            JT('الكوثر 1', 'Corán 108:1', 'Quran 108:1'),
          ], 0,
          JT('«لَا إِكْرَاهَ فِي الدِّينِ» (البقرة 256). والآية تبني مبدأً: الاقتناع لا يُصنع بالسيف.',
            '«No hay coacción en la religión» (2:256). La convicción no se fabrica con la espada.',
            '"No compulsion in religion" (2:256). Conviction is not manufactured by the sword.')
        ),
      ],
    }
  );
})();
