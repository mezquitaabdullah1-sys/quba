// 🗺️ رحلة المسلم — المحطات 7–9 (الأخلاق · المعاملات · طريقك يبدأ الآن)
// يُحمَّل بعد journey_b.js
(function () {
  'use strict';
  var C = window.COURSE_JOURNEY;
  if (!C || !C.stations) return;

  C.stations.push(
    // ═══════════════════ المحطة 7 ═══════════════════
    {
      id: 'akhlaq',
      icon: '<i class="fas fa-spa"></i>',
      title: { ar: 'الأخلاق: صفات المسلم', es: 'Carácter: las cualidades del musulmán', en: 'Character: the Muslim’s qualities' },
      mascotIntro: {
        ar: 'قال ﷺ: «إنما بُعثت لأتمّم مكارم الأخلاق». الأخلاق ليست فرعاً في الدين، بل ثمرته.',
        es: 'Dijo ﷺ: «Fui enviado para perfeccionar las nobles cualidades». La ética no es una rama: es el fruto.',
        en: 'He said ﷺ: "I was sent to perfect noble character." Ethics are not a branch of the religion; they are its fruit.',
      },
      lessons: [
        jInfo('grid',
          JT('عجلة الأخلاق الثمانية', 'La rueda de las ocho cualidades', 'The wheel of eight qualities'),
          [
            jItem('fa-check-double', JT('الصدق', 'Veracidad', 'Truthfulness'), JT('قول الحقّ ولو على نفسك.', 'Decir la verdad aunque te cueste.', 'Telling the truth even against yourself.')),
            jItem('fa-lock', JT('الأمانة', 'Confianza', 'Trustworthiness'), JT('حفظ ما اؤتمنت عليه: مال، سرّ، وقت.', 'Guardar lo confiado: dinero, secreto, tiempo.', 'Guarding what is entrusted: money, secrets, time.')),
            jItem('fa-hourglass-half', JT('الصبر', 'Paciencia', 'Patience'), JT('حبس النفس على ما تكره لبلوغ ما تحب.', 'Contener el alma en lo que disgusta para alcanzar lo amado.', 'Holding the self through the disliked to reach the beloved.')),
            jItem('fa-hand-holding-heart', JT('الشكر', 'Gratitud', 'Gratitude'), JT('استعمال النعمة في طاعة المنعم.', 'Usar el don en obediencia al Dador.', "Using the gift in obedience to the Giver.")),
            jItem('fa-eye-low-vision', JT('الحياء', 'Pudor', 'Modesty'), JT('حياء من الله قبل حياء من الناس.', 'Pudor ante Allah antes que ante la gente.', 'Modesty before Allah before people.')),
            jItem('fa-scale-balanced', JT('العدل', 'Justicia', 'Justice'), JT('أن تنصف من تكره.', 'Ser justo incluso con quien odias.', 'Being fair even with one you dislike.')),
            jItem('fa-hands-holding-child', JT('الرحمة', 'Misericordia', 'Mercy'), JT('رحمة الضعيف بلا منّة.', 'Misericordia con el débil sin recordarlo.', 'Mercy to the weak without reminding them.')),
            jItem('fa-gift', JT('الكرم', 'Generosidad', 'Generosity'), JT('العطاء بلا انتظار مقابل.', 'Dar sin esperar retorno.', 'Giving without expecting return.')),
          ],
          JT('هذه خريطة، وليست الدرس. كل صفة لها بطاقة مستقلة بعد هذه الشاشة: حديث + موقف واقعي.',
            'Esto es un mapa, no la lección. Cada cualidad tiene su tarjeta: un hadiz y una situación real.',
            'This is a map, not the lesson. Each quality has its own card: a hadith and a real situation.'),
          JT('صحيح البخاري 6029', 'Sahih Bujari 6029', 'Sahih al-Bukhari 6029')
        ),
        jCard(
          JT('١ · الصدق', '1 · La veracidad', '1 · Truthfulness'),
          JT('«عليكم بالصدق، فإن الصدق يهدي إلى البرّ، وإن البرّ يهدي إلى الجنة.» (مسلم 2607)\n\n**الصدق أنواع:** في القول، في العمل، في الوعد، وفي وصف حالتك للناس.\n\n🎯 **موقف واقعي:** أخطأت في عمل، ولم يلاحظ أحد. ماذا تفعل؟\n• **الصادق:** يُبلغ المسؤول ويصلح الخطأ، ولو تكلّف ذلك اعترافاً.\n• **المنافق عملياً:** يسكت ويترك الضرر يكبر.\n\n🌿 **قاعدة:** الصدق ليس «قول الحقيقة دائماً في كل وقت»، بل قولها حيث تُنفع، مع اختيار الكلمة التي لا تجرح. والكذب المباح استثناء محدود (الإصلاح بين الناس، وفي الحرب، وفي حديث الرجل لزوجته) وليس باباً للتسهيل.',
          '«Sed veraces, pues la veracidad guía a la rectitud, y la rectitud guía al Paraíso» (Muslim 2607).\n\n**Tipos de veracidad:** en la palabra, en la obra, en la promesa, y al describir tu situación a la gente.\n\n🎯 **Situación real:** cometiste un error en el trabajo y nadie lo notó. ¿Qué haces?\n• **El veraz:** avisa al responsable y corrige el error, aunque cueste admitirlo.\n• **El hipócrita práctico:** calla y deja crecer el daño.\n\n🌿 **Regla:** veracidad no es «decir la verdad siempre y a cualquier precio», sino donde beneficia, con la palabra que no hiere. Las excepciones (reconciliar, en la guerra, el esposo con su esposa) son limitadas, no una puerta abierta.',
          "Be truthful, for truthfulness guides to righteousness, and righteousness guides to Paradise\" (Muslim 2607).\n\n**Kinds of truthfulness:** in speech, in action, in promises, and in describing your situation to people.\n\n🎯 **Real situation:** you made a mistake at work and no one noticed. What do you do?\n• **The truthful:** tells the supervisor and fixes it, even at the cost of admitting it.\n• **The practical hypocrite:** stays silent and lets the harm grow.\n\n🌿 **Rule:** truthfulness is not \"always say everything\", but saying it where it helps, with words that do not wound. Limited exceptions (reconciling, war, a husband with his wife) are narrow, not a general licence."),
          JT('صحيح مسلم 2607', 'Sahih Muslim 2607', 'Sahih Muslim 2607')
        ),
        jCard(
          JT('٢ · الأمانة', '2 · La confianza', '2 · Trustworthiness'),
          JT('«إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا» (النساء 58).\n\n**الأمانة أوسع من المال:** سرّ تُحفظ عليه، وقت تُكلَّف به، بيت تعمل فيه، جار تأمنه على عرضك، حساب على الإنترنت تُديره.\n\n🎯 **موقف واقعي:** وجدت محفظة فيها نقود في الشارع. والكاميرا لا تراك.\n• **الأمين:** يبحث عن صاحبها، أو يسلّمها لجهة موثوقة.\n• **الآخذ:** يبرّر لنفسه أن «صاحبها لن يعود».\n\n🌿 **قاعدة عملية:** الأمانة تُختبر في الخلوة، لا في العلن. ما تفعله وأنت غير مرئي هو حقيقتك.',
          '«Allah os ordena devolver los depósitos a sus dueños» (4:58).\n\n**La confianza es más amplia que el dinero:** un secreto, un tiempo asignado, una casa donde trabajas, un vecino que confía en tu honor, una cuenta digital que administras.\n\n🎯 **Situación real:** encuentras una cartera con dinero en la calle. La cámara no te ve.\n• **El fiel:** busca al dueño o la entrega a una autoridad fiable.\n• **El que toma:** se justifica que «no volverá».\n\n🌿 **Regla práctica:** la confianza se prueba en privado, no en público. Lo que haces cuando nadie te ve es tu realidad.',
          "\"Allah commands you to return trusts to their owners\" (4:58).\n\n**Trust is broader than money:** a secret kept, time assigned, a house where you work, a neighbour who trusts your honour, an online account you manage.\n\n🎯 **Real situation:** you find a wallet with money in the street. No camera sees you.\n• **The trustworthy:** seeks the owner or hands it to a reliable authority.\n• **The taker:** justifies that \"they won't come back\".\n\n🌿 **Practical rule:** trust is tested in private, not in public. What you do unseen is your reality."),
          JT('القرآن 4:58', 'Corán 4:58', 'Quran 4:58')
        ),
        jCard(
          JT('٣ · الصبر', '3 · La paciencia', '3 · Patience'),
          JT('«وَاللَّهُ يُحِبُّ الصَّابِرِينَ» (آل عمران 146).\n\n**ثلاثة أنواع:**\n1️⃣ **صبر على الطاعة** — الاستمرار حين يصعب.\n2️⃣ **صبر عن المعصية** — الكفّ حين يُغريك الهوى.\n3️⃣ **صبر على البلاء** — الثبات حين يُوجعك القدر.\n\n🎯 **موقف واقعي:** خسرت فرصة عمل كنت تنتظرها.\n• **الصابر:** يحزن بصدق، ثم يبحث عن البديل ويدعو.\n• **غيره:** يتوقف، ويلوم الله، ويترك السعي.\n\n🌿 **فرق مهم:** الصبر ليس كتمان الألم ولا إنكار الحزن. النبي ﷺ بكى، وقال: «إنما أشكو بثّي وحزني إلى الله». الصبر أن تبقى فعّالاً وأنت متألم.',
          '«Allah ama a los pacientes» (3:146).\n\n**Tres tipos:**\n1️⃣ **Paciencia en la obediencia** — continuar cuando cuesta.\n2️⃣ **Paciencia ante el pecado** — contenerse cuando el deseo tienta.\n3️⃣ **Paciencia en la prueba** — firmeza cuando el decreto duele.\n\n🎯 **Situación real:** pierdes un trabajo que esperabas.\n• **El paciente:** se entristece sinceramente, luego busca alternativa y suplica.\n• **El otro:** se detiene, reprocha a Allah y deja de esforzarse.\n\n🌿 **Diferencia clave:** paciencia no es ocultar el dolor ni negar la tristeza. El Profeta ﷺ lloró y dijo: «Solo me quejo de mi angustia a Allah». Paciencia es seguir activo mientras duele.',
          "\"Allah loves the patient\" (3:146).\n\n**Three kinds:**\n1️⃣ **Patience in obedience** — continuing when it is hard.\n2️⃣ **Patience against sin** — restraining when desire tempts.\n3️⃣ **Patience in trial** — firmness when the decree hurts.\n\n🎯 **Real situation:** you lose a job you were waiting for.\n• **The patient:** grieves honestly, then seeks alternatives and prays.\n• **The other:** stops, blames Allah, and abandons effort.\n\n🌿 **Key difference:** patience is not hiding pain or denying sadness. The Prophet ﷺ wept and said: \"I complain of my anguish to Allah.\" Patience is staying active while it hurts."),
          JT('القرآن 3:146', 'Corán 3:146', 'Quran 3:146')
        ),
        jCard(
          JT('٤ · الشكر', '4 · La gratitud', '4 · Gratitude'),
          JT('«وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ» (إبراهيم 7).\n\n**الشكر ليس كلمة تُقال، بل ثلاثة:**\n• **اعتراف بالقلب** أن النعمة من الله.\n• **ثناء باللسان** — «الحمد لله».\n• **استعمال بالنعمة في الطاعة** — هذا أصعبها وأصدقها.\n\n🎯 **موقف واقعي:** تريد شيئاً ولا تملكه، وتشعر أن حياتك ناقصة.\n• **الشاكر:** يعدّ ما عنده ويستخدمه، فيشعر بالاتساع.\n• **الجاحد:** يعدّ ما ليس عنده، فيشعر بالفقر دائماً.\n\n🌿 **تمرين أسبوعي:** اكتب كل مساء ثلاث نعم محدّدة لا عامّة («صحة أمي»، «صديق يسأل عني»). الشكر يتحوّل من شعور إلى عادة.',
          '«Si sois agradecidos, os daré más» (14:7).\n\n**Gratitud no es una palabra, son tres:**\n• **reconocimiento del corazón** de que el don viene de Allah,\n• **alabanza con la lengua** — «Alabado sea Allah»,\n• **uso del don en obediencia** — lo más difícil y lo más sincero.\n\n🎯 **Situación real:** deseas algo que no tienes y sientes que tu vida está incompleta.\n• **El agradecido:** cuenta lo que tiene y lo usa, y siente amplitud.\n• **El ingrato:** cuenta lo que no tiene, y siente siempre pobreza.\n\n🌿 **Ejercicio semanal:** escribe cada noche tres dones concretos (no generales): «la salud de mi madre», «un amigo que pregunta por mí». La gratitud pasa de emoción a hábito.',
          "\"If you are grateful, I will give you more\" (14:7).\n\n**Gratitude is not one word but three:**\n• **recognition in the heart** that the gift is from Allah,\n• **praise with the tongue** — \"alhamdulillah\",\n• **using the gift in obedience** — the hardest and truest.\n\n🎯 **Real situation:** you want something you lack and feel your life is incomplete.\n• **The grateful:** counts what he has and uses it, and feels spaciousness.\n• **The ungrateful:** counts what he lacks, and always feels poor.\n\n🌿 **Weekly exercise:** each evening write three specific gifts (not general): \"my mother's health\", \"a friend who asks about me\". Gratitude turns from feeling into habit."),
          JT('القرآن 14:7', 'Corán 14:7', 'Quran 14:7')
        ),
        jCard(
          JT('٥ · الحياء', '5 · El pudor', '5 · Modesty'),
          JT('«الحياء شعبة من الإيمان.» (البخاري 9)\n\n**الحياء ليس خجلاً مرضياً** يمنعك من السؤال أو الحقّ. الحياء المحمود نوعان:\n1️⃣ **حياء من الله** — أن تستحي أن يراك حيث نهاك.\n2️⃣ **حياء من الناس** — أن تستحي من فعل قبيح يُذكر به أهلك.\n\n**والحياء المذموم:** أن تمنعك خجلة الناس من قول الحقّ أو طلب العلم.\n\n🎯 **موقف واقعي:** أصدقاؤك يسخرون من صلاتك.\n• **الحياء الصحيح:** لا تترك الصلاة ولا تُسِفّههم؛ توازن بين ثباتك ولطفك.\n• **الحياء المذموم:** تترك الصلاة خجلاً.\n\n🌿 **معيار:** الحياء يمنعك من **الخطأ**، ولا يمنعك من **الخير**.',
          '«El pudor es una rama de la fe» (Bujari 9).\n\n**El pudor no es timidez enfermiza** que te impide preguntar o reclamar un derecho. El pudor loable es de dos tipos:\n1️⃣ **ante Allah** — avergonzarte de que te vea donde te prohibió,\n2️⃣ **ante la gente** — avergonzarte de un acto feo que se atribuya a tu familia.\n\n**Y el pudor reprobable:** que la vergüenza ante la gente te impida decir la verdad o buscar conocimiento.\n\n🎯 **Situación real:** tus amigos se burlan de tu oración.\n• **Pudor correcto:** no dejas la oración ni los insultas; equilibrio entre firmeza y suavidad.\n• **Pudor reprobable:** dejas la oración por vergüenza.\n\n🌿 **Criterio:** el pudor te impide **el error**, no **el bien**.',
          "\"Modesty is a branch of faith\" (Bukhari 9).\n\n**Modesty is not a morbid shyness** that stops you from asking or claiming a right. Praiseworthy modesty is of two kinds:\n1️⃣ **before Allah** — to be ashamed He sees you where He forbade,\n2️⃣ **before people** — to be ashamed of a foul act attributed to your family.\n\n**And blameworthy modesty:** when shame before people stops you from speaking truth or seeking knowledge.\n\n🎯 **Real situation:** your friends mock your prayer.\n• **Correct modesty:** you neither abandon prayer nor insult them; firmness with gentleness.\n• **Blameworthy modesty:** you drop the prayer out of shame.\n\n🌿 **Criterion:** modesty stops you from **wrong**, not from **good**."),
          JT('صحيح البخاري 9', 'Sahih Bujari 9', 'Sahih al-Bukhari 9')
        ),
        jCard(
          JT('٦ · العدل', '6 · La justicia', '6 · Justice'),
          JT('«يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ لِلَّهِ شُهَدَاءَ بِالْقِسْطِ وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا ۚ اعْدِلُوا» (المائدة 8).\n\n**معنى قوي:** لا يجوز أن يدفعك **بغضك** لشخص إلى الظلم. العدل مع من تكره، ومع من لا يحبك، أصدق من العدل مع الصديق.\n\n🎯 **موقف واقعي:** اختلفت مع زميل، ولجنة التقييم تسألك عنه.\n• **العادل:** يقول ما يعرفه من حسناته وسيئاته بلا زيادة.\n• **الظالم:** يستغلّ الفرصة ليُسقطه.\n\n🌿 **مستوى أعلى:** أن تذكر للغائب ما تحب أن يُذكر لك، وأن تعتذر حين تخطئ، لا أن تنتظر اعتذاره.',
          '«¡Oh creyentes! Sed firmes por Allah, testigos con equidad, y que el odio a un pueblo no os lleve a no ser justos. Sed justos» (5:8).\n\n**Sentido fuerte:** no puede tu **odio** a alguien empujarte a la injusticia. La justicia con quien odias, y con quien no te ama, es más sincera que con el amigo.\n\n🎯 **Situación real:** discutiste con un colega y el comité de evaluación te pregunta por él.\n• **El justo:** dice lo que sabe de sus virtudes y defectos sin exagerar.\n• **El injusto:** aprovecha para hundirlo.\n\n🌿 **Nivel superior:** decir del ausente lo que te gustaría que dijeran de ti, y disculparte cuando yerras en lugar de esperar su disculpa.',
          "\"O you who believe, be steadfast for Allah, witnesses in justice, and let not hatred of a people lead you to be unjust. Be just\" (5:8).\n\n**A strong meaning:** your **hatred** of someone may not push you into injustice. Justice toward one you hate, and toward one who does not love you, is truer than justice toward a friend.\n\n🎯 **Real situation:** you argued with a colleague and the review committee asks about him.\n• **The just:** states what he knows of strengths and faults without exaggeration.\n• **The unjust:** uses the chance to sink him.\n\n🌿 **A higher level:** say of the absent what you would want said of you, and apologise when you err instead of waiting for their apology."),
          JT('القرآن 5:8', 'Corán 5:8', 'Quran 5:8')
        ),
        jCard(
          JT('٧ · الرحمة', '7 · La misericordia', '7 · Mercy'),
          JT('«الراحمون يرحمهم الرحمن، ارحموا من في الأرض يرحمكم من في السماء.» (أبو داود 4941)\n\n**الرحمة ليست ضعفاً:**\n• أن تعفو وأنت قادر — قوة.\n• أن تخفّف عن متعب — حكمة.\n• أن تستر على من ستره الله — أمانة.\n\n🎯 **موقف واقعي:** خادم في مطعم أخطأ في طلبك أمام أصدقائك.\n• **الرحيم:** يبتسم ويصحّح بهدوء، ولا يحرجه.\n• **القسوّ:** يرفع صوته ليُظهر أنه «صاحب حقّ».\n\n🌿 **تذكّر:** رحمتك بالناس لا تُنقص حقّك، بل تُضاعف أجرك. والحدّ الشرعي لا يُلغى بالرحمة، لكن **الأسلوب** يُختار بالرحمة.',
          '«Los misericordiosos reciben la misericordia del Misericordioso. Sed misericordiosos con los de la tierra y será misericordioso con vosotros el de los cielos» (Abu Dawud 4941).\n\n**La misericordia no es debilidad:**\n• perdonar pudiendo — fuerza,\n• aliviar al cansado — sabiduría,\n• cubrir a quien Allah cubrió — confianza.\n\n🎯 **Situación real:** un camarero se equivoca con tu pedido delante de tus amigos.\n• **El misericordioso:** sonríe y corrige con calma, sin avergonzarlo.\n• **El duro:** alza la voz para mostrar que «tiene razón».\n\n🌿 **Recuerda:** tu misericordia con la gente no reduce tu derecho, multiplica tu recompensa. El límite legal no se anula por misericordia, pero **el modo** se elige con misericordia.',
          "\"The merciful will receive mercy from the Most Merciful. Be merciful to those on earth and the One in the heavens will be merciful to you\" (Abu Dawud 4941).\n\n**Mercy is not weakness:**\n• forgiving while able — strength,\n• easing the tired — wisdom,\n• covering whom Allah covered — trustworthiness.\n\n🎯 **Real situation:** a waiter gets your order wrong in front of your friends.\n• **The merciful:** smiles and corrects calmly, without humiliating him.\n• **The harsh:** raises his voice to show he \"has a right\".\n\n🌿 **Remember:** your mercy to people does not reduce your right, it multiplies your reward. The legal limit is not cancelled by mercy, but **the manner** is chosen with mercy."),
          JT('سنن أبي داود 4941', 'Abu Dawud 4941', 'Sunan Abu Dawud 4941')
        ),
        jCard(
          JT('٨ · الكرم', '8 · La generosidad', '8 · Generosity'),
          JT('«مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ.» (مسلم 2588) — وفي رواية: «ما نقص مال من صدقة».\n\n**الكرم ليس المال فقط:**\n• **كرم الوقت** — أن تسمع أحداً بلا عجلة.\n• **كرم الوجه** — أن تلقى الناس ببِشر.\n• **كرم العلم** — أن تعلّم ما تعلمته.\n• **كرم العفو** — أن تُسقط حقّك لوجه الله.\n\n🎯 **موقف واقعي:** صديق يطلب مساعدة مالية، وأنت في ضيق.\n• **الكريم:** يعطي ما يستطيع بلا حرج، أو يعتذر بصدق ويقترح بديلاً.\n• **غيره:** يخفي قدرته ويختلق الأعذار.\n\n🌿 **قاعدة:** «أفضل الصدقة ما كان عن ظهر غنى» — والكرم الحقيقي يبدأ بعد التأكد من حاجة أهلك.',
          '«La limosna no disminuye la riqueza» (Muslim 2588).\n\n**La generosidad no es solo dinero:**\n• **tiempo** — escuchar sin prisa,\n• **rostro** — recibir con alegría,\n• **conocimiento** — enseñar lo que aprendiste,\n• **perdón** — renunciar a tu derecho por Allah.\n\n🎯 **Situación real:** un amigo pide ayuda económica y tú estás ajustado.\n• **El generoso:** da lo que puede sin vergüenza, o se disculpa con sinceridad y propone una alternativa.\n• **El otro:** oculta su capacidad e inventa excusas.\n\n🌿 **Regla:** «La mejor limosna es la que sale de la holgura»; la generosidad real empieza tras asegurar a tu familia.',
          "\"Charity does not decrease wealth\" (Muslim 2588).\n\n**Generosity is not only money:**\n• **time** — listening without hurry,\n• **face** — meeting people cheerfully,\n• **knowledge** — teaching what you learned,\n• **forgiveness** — waiving your right for Allah.\n\n🎯 **Real situation:** a friend asks for financial help and you are tight.\n• **The generous:** gives what he can without shame, or apologises honestly and suggests an alternative.\n• **The other:** hides his capacity and invents excuses.\n\n🌿 **Rule:** \"The best charity is that which comes from sufficiency\"; real generosity starts after securing your family."),
          JT('صحيح مسلم 2588', 'Sahih Muslim 2588', 'Sahih Muslim 2588')
        ),
        jScn('🤝',
          JT('زميلك أخطأ في حقّك أمام الجميع، ثم جاء يعتذر أمامك وحدك. ماذا تفعل؟',
            'Un colega te faltó delante de todos y luego se disculpa en privado. ¿Qué haces?',
            'A colleague wronged you publicly, then apologises in private. What do you do?'),
          [
            JT('أقبل اعتذاره وأحفظ له ماء وجهه، وأوضّح بهدوء أن الأذى كان علنياً',
              'Acepto su disculpa, le guardo el honor y explico con calma que el daño fue público',
              'I accept the apology, protect his dignity, and calmly note the harm was public'),
            JT('أرفض الاعتذار حتى يعتذر أمام الجميع',
              'Rechazo la disculpa hasta que se disculpe ante todos',
              'I refuse until he apologises in front of everyone'),
            JT('أوافق ثم أشتكي عليه لكل من يعرفه',
              'Acepto y luego me quejo de él con todos',
              'I accept, then complain about him to everyone'),
            JT('أتجاهله تماماً ولا أردّ',
              'Le ignoro por completo sin responder',
              'I ignore him entirely and say nothing'),
          ], 0,
          JT('الإصلاح هو الأصل: «خيركم من يبدأ بالسلام»، والعفو عند القدرة من أعلى الأخلاق. لكن بيان الحقّ بلطف مشروع أيضاً — الأذى العلني يحتاج توضيحاً، لا انتقاماً.',
            'La reconciliación es la base: «el mejor es quien saluda primero», y perdonar pudiendo es de la ética más alta. Pero explicar el derecho con suavidad es legítimo: el daño público requiere aclaración, no venganza.',
            'Reconciliation is the base: "the best of you is the one who greets first," and forgiving while able is among the highest ethics. But stating your right gently is legitimate too: public harm needs clarification, not revenge.')
        ),
      ],
    },

    // ═══════════════════ المحطة 8 ═══════════════════
    {
      id: 'muamalat',
      icon: '<i class="fas fa-handshake"></i>',
      title: { ar: 'المعاملات: كيف نتعامل مع الآخرين', es: 'Trato con los demás', en: 'Dealing with others' },
      mascotIntro: {
        ar: 'الدين ليس في المسجد فقط: أخلاقك في البيت والسوق والشارع هي الامتحان الحقيقي.',
        es: 'La religión no está solo en la mezquita: tu ética en casa, en el mercado y en la calle es el examen real.',
        en: 'Religion is not only in the mosque: your ethics at home, in the market and on the street are the real exam.',
      },
      lessons: [
        jInfo('list',
          JT('دوائر الحقوق المتداخلة', 'Los círculos de derechos', 'The circles of rights'),
          [
            jItem('fa-people-roof', JT('الدائرة 1 · الوالدان والأهل', 'Círculo 1 · Padres y familia', 'Circle 1 · Parents and family'),
              JT('الأقرب أولاً: «وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا» (الإسراء 23).',
                'Lo más cercano primero: «Tu Señor decretó que no adoréis sino a Él y que seáis buenos con los padres» (17:23).',
                'The nearest first: "Your Lord decreed that you worship none but Him and be good to parents" (17:23).')),
            jItem('fa-house', JT('الدائرة 2 · الجار', 'Círculo 2 · El vecino', 'Circle 2 · The neighbour'),
              JT('«ما زال جبريل يوصيني بالجار حتى ظننت أنه سيورّثه» (البخاري 6014).',
                '«Jibril no dejaba de recomendarme al vecino hasta que pensé que le daría herencia» (Bujari 6014).',
                '"Jibril kept recommending the neighbour until I thought he would inherit" (Bukhari 6014).')),
            jItem('fa-users', JT('الدائرة 3 · المسلمون', 'Círculo 3 · Los musulmanes', 'Circle 3 · Muslims'),
              JT('حقوق الأخوّة: السلام، والدعوة، والنصيحة، والعيادة، والتشييع.',
                'Derechos de la hermandad: el saludo, la invitación, el consejo, la visita al enfermo, el funeral.',
                'Rights of brotherhood: greeting, invitations, sincere advice, visiting the sick, funerals.')),
            jItem('fa-globe', JT('الدائرة 4 · الناس جميعاً', 'Círculo 4 · Toda la gente', 'Circle 4 · All people'),
              JT('العدل والرحمة لكل إنسان، مسلماً كان أو غير مسلم.',
                'Justicia y misericordia para todo ser humano, musulmán o no.',
                'Justice and mercy for every human being, Muslim or not.')),
          ],
          JT('كلما ضاقت الدائرة زاد الحقّ. من أهمل الدائرة الصغرى بحجّة الكبرى أخطأ الترتيب.',
            'Cuanto más estrecho el círculo, mayor el derecho. Quien descuida el círculo pequeño por el grande equivoca el orden.',
            'The narrower the circle, the greater the right. Whoever neglects the small circle for the large one gets the order wrong.')
        ),
        jCard(
          JT('حقوق الوالدين', 'Los derechos de los padres', 'The rights of parents'),
          JT('«وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا» (الإسراء 23).\n\n**واجبات عملية:**\n1️⃣ طاعتهما في المعروف (لا في معصية الله).\n2️⃣ الكلام اللين، وعدم رفع الصوت.\n3️⃣ النفقة عند الحاجة.\n4️⃣ الدعاء لهما حيَّين وميّتين.\n5️⃣ صلة أصدقائهما بعد وفاتهما.\n\n🎯 **موقف صعب:** والدك يطلب منك أمراً يخالف رأيك لكنه ليس معصية. الأفضل أن تجتهد في إرضائه بلا إضرار بنفسك، وأن تشرح بلطف لا بجدال.\n\n🌿 **المفتاح:** «أمّك، ثم أمّك، ثم أمّك، ثم أبوك» (البخاري 5971) — الأولوية في البِرّ، لا في الحقوق المالية.',
          '«Tu Señor decretó que no adoréis sino a Él y que seáis buenos con los padres. Si uno o ambos alcanzan la vejez contigo, no les digas \"uf\" ni los reprendas, y háblales con palabra noble» (17:23).\n\n**Deberes prácticos:**\n1️⃣ obedecerles en lo lícito (no en desobediencia a Allah),\n2️⃣ hablar con suavidad y no alzar la voz,\n3️⃣ sostenerlos si lo necesitan,\n4️⃣ suplicar por ellos vivos y muertos,\n5️⃣ mantener el vínculo con sus amigos tras su muerte.\n\n🎯 **Situación difícil:** tu padre te pide algo contrario a tu opinión, pero no ilícito. Esfuérzate en complacerle sin dañarte, y explica con suavidad, no con discusión.\n\n🌿 **La clave:** «Tu madre, luego tu madre, luego tu madre, luego tu padre» (Bujari 5971): prioridad en el trato, no en los derechos económicos.',
          "\"Your Lord decreed that you worship none but Him and be good to parents. If one or both reach old age with you, say not 'uf' nor rebuke them, but speak to them a noble word\" (17:23).\n\n**Practical duties:**\n1️⃣ obey them in what is lawful (not in disobedience to Allah),\n2️⃣ speak gently and do not raise your voice,\n3️⃣ support them if needed,\n4️⃣ pray for them alive and dead,\n5️⃣ keep ties with their friends after their death.\n\n🎯 **A hard situation:** your father asks something against your view but not unlawful. Strive to please him without harming yourself, and explain gently, not argumentatively.\n\n🌿 **The key:** \"Your mother, then your mother, then your mother, then your father\" (Bukhari 5971): priority in kindness, not in financial rights."),
          JT('القرآن 17:23 · البخاري 5971', 'Corán 17:23 · Bujari 5971', 'Quran 17:23 · Sahih al-Bukhari 5971')
        ),
        jCard(
          JT('حقوق الجار', 'Los derechos del vecino', 'The rights of the neighbour'),
          JT('«مَا زَالَ جِبْرِيلُ يُوصِينِي بِالْجَارِ حَتَّى ظَنَنْتُ أَنَّهُ سَيُوَرِّثُهُ.» (البخاري 6014)\n\n**ثلاثة أنواع من الجيران:**\n1️⃣ **جار مسلم قريب** — ثلاثة حقوق: القرابة، والجوار، والإسلام.\n2️⃣ **جار مسلم غير قريب** — حقّان: الجوار والإسلام.\n3️⃣ **جار غير مسلم** — حقّ الجوار.\n\n**كيف تُحسن إليه؟** مشاركة الطعام، والسلام، والمساعدة، وعدم إيذائه بصوت أو رائحة، والهدية أحياناً.\n\n🎯 **موقف واقعي:** جارك يرفع صوته كل ليلة.\n• **الأفضل:** يتحدّث معه بلطف مرة ومرتين، ثم يستعين بمن يصلح، ولا يبدأ بالشكوى.\n\n🌿 **حديث جامع:** «من كان يؤمن بالله واليوم الآخر فليُكرم جاره.» (البخاري 6018)',
          '«Jibril no dejaba de recomendarme al vecino hasta que pensé que le daría herencia» (Bujari 6014).\n\n**Tres tipos de vecinos:**\n1️⃣ **musulmán y pariente** — tres derechos: parentesco, vecindad e Islam,\n2️⃣ **musulmán no pariente** — dos: vecindad e Islam,\n3️⃣ **no musulmán** — el derecho de vecindad.\n\n**¿Cómo ser bueno con él?** Compartir comida, saludar, ayudar, no molestar con ruido u olores, regalar de vez en cuando.\n\n🎯 **Situación real:** tu vecino hace ruido cada noche.\n• **Lo mejor:** hablar con suavidad una y otra vez, luego pedir mediación, sin empezar por la denuncia.\n\n🌿 **Hadiz integral:** «Quien cree en Allah y el Último Día, que honre a su vecino» (Bujari 6018).',
          "\"Jibril kept recommending the neighbour to me until I thought he would give him inheritance\" (Bukhari 6014).\n\n**Three kinds of neighbours:**\n1️⃣ **Muslim and relative** — three rights: kinship, neighbourhood, Islam,\n2️⃣ **Muslim not related** — two: neighbourhood and Islam,\n3️⃣ **non-Muslim** — the right of neighbourhood.\n\n**How to be good to them?** Share food, greet, help, do not disturb with noise or smells, give gifts occasionally.\n\n🎯 **Real situation:** your neighbour is loud every night.\n• **Best:** speak gently once and again, then seek mediation, rather than starting with a complaint.\n\n🌿 **A comprehensive hadith:** \"Whoever believes in Allah and the Last Day, let him honour his neighbour\" (Bukhari 6018)."),
          JT('صحيح البخاري 6014 · 6018', 'Bujari 6014 · 6018', 'Sahih al-Bukhari 6014 · 6018')
        ),
        jCard(
          JT('الجار غير المسلم والتعايش',
            'El vecino no musulmán y la convivencia',
            'The non-Muslim neighbour and coexistence'),
          JT('كثير من المسلمين الجدد لديهم عائلة أو جيران على دين آخر، ويحتاجون توجيهاً عملياً لا خطاباً.\n\n**ثلاث قواعد:**\n1️⃣ **البرّ لا يعني الموافقة على العقيدة** — أنت تُحسن إلى إنسان، لا تُقرّ كل ما يعتقده.\n2️⃣ **لا خيانة ولا إكراه** — لا تكذب عليهم، ولا تُلزمهم بشيء.\n3️⃣ **العدل مقدَّم على العاطفة** — «لَا يَنْهَاكُمُ اللَّهُ عَنِ الَّذِينَ لَمْ يُقَاتِلُوكُمْ … أَن تَبَرُّوهُمْ وَتُقْسِطُوا إِلَيْهِمْ» (الممتحنة 8).\n\n🎯 **موقف واقعي:** أمّك غير المسلمة أعدّت طعاماً فيه ما لا تأكله.\n• **الأفضل:** تشكرها وتعتذر بلطف بلا إحراج، وتشاركها الطعام الحلال، وتحفظ علاقتكما.\n\n🌿 **حديث:** «إن الله أمرنا بالإحسان إلى أهل الذمة» — وأعظم من ذلك: صلة الأمّ غير المسلمة من أعظم أبواب البرّ.',
          'Muchos nuevos musulmanes tienen familia o vecinos de otra religión y necesitan una guía práctica, no un discurso.\n\n**Tres reglas:**\n1️⃣ **Ser bueno no significa aprobar la creencia** — haces bien a una persona, no confirmas todo lo que cree.\n2️⃣ **Sin engaño ni coacción** — no les mientes ni les impones nada.\n3️⃣ **La justicia antes que la emoción** — «Allah no os prohíbe ser buenos y justos con quienes no os combatieron» (60:8).\n\n🎯 **Situación real:** tu madre no musulmana cocinó algo que no comes.\n• **Mejor:** agradece y discúlpate con suavidad sin avergonzarla, comparte lo que sí puedes y cuida la relación.\n\n🌿 **Principio:** la bondad con la madre no musulmana es una de las mayores puertas de piedad filial.',
          "Many new Muslims have family or neighbours of another faith and need practical guidance, not a lecture.\n\n**Three rules:**\n1️⃣ **Kindness does not mean approving the creed** — you do good to a person, not confirm everything they believe.\n2️⃣ **No deceit, no compulsion** — do not lie to them, do not impose anything.\n3️⃣ **Justice before emotion** — \"Allah does not forbid you to be kind and just to those who did not fight you\" (60:8).\n\n🎯 **Real situation:** your non-Muslim mother cooked something you do not eat.\n• **Best:** thank her and apologise gently without embarrassing her, share what you can, and protect the relationship.\n\n🌿 **Principle:** kindness to a non-Muslim mother is among the greatest doors of filial devotion."),
          JT('القرآن 60:8 · صحيح مسلم 1003', 'Corán 60:8 · Muslim 1003', 'Quran 60:8 · Sahih Muslim 1003')
        ),
        jCard(
          JT('الرفق بالحيوان والبيئة',
            'Cuidado de los animales y del entorno',
            'Care for animals and the environment'),
          JT('«إن الله كتب الإحسان على كل شيء.» (مسلم 1955) — والإحسان لا يقتصر على البشر.\n\n**ثلاث صور عملية:**\n• **الحيوان** — طعام وشراب ومأوى، وعدم تحميله ما لا يطيق.\n• **البيئة** — لا تُلقِ أذى في الطريق، فإماطة الأذى شعبة من الإيمان.\n• **الماء والطعام** — لا إسراف: «وَلَا تُسْرِفُوا» (الأعراف 31).\n\n🎯 **موقف واقعي:** ترى قطّة جائعة قرب بيتك كل صباح.\n• **الأفضل:** إناء ماء وطعام بسيط — عمل صغير يومي، وأجره عند الله عظيم.\n\n🌿 **تذكّر حديث المرأة التي حبست الهرة، وحديث الرجل الذي سقى الكلب: النية والرحمة يغيّران الحساب.',
          '«Allah ha prescrito la excelencia en todo» (Muslim 1955), y no se limita a los humanos.\n\n**Tres formas prácticas:**\n• **Animales** — comida, agua y refugio; no cargarlos más de lo que pueden.\n• **Entorno** — no arrojar daño en el camino; quitar un obstáculo es una rama de la fe.\n• **Agua y comida** — sin derroche: «Y no os excedáis» (7:31).\n\n🎯 **Situación real:** ves un gato hambriento junto a tu casa cada mañana.\n• **Mejor:** un cuenco de agua y algo de comida: una obra pequeña diaria de gran recompensa.\n\n🌿 **Recuerda** la historia de la mujer que encerró al gato y la del hombre que dio agua al perro: la intención y la misericordia cambian la cuenta.',
          "\"Allah has prescribed excellence in all things\" (Muslim 1955), and it is not limited to humans.\n\n**Three practical forms:**\n• **Animals** — food, water and shelter; do not load them beyond capacity.\n• **The environment** — do not throw harm in the road; removing an obstacle is a branch of faith.\n• **Water and food** — no waste: \"And do not be extravagant\" (7:31).\n\n🎯 **Real situation:** you see a hungry cat near your home each morning.\n• **Best:** a bowl of water and simple food: a small daily deed with great reward.\n\n🌿 **Remember** the woman who confined the cat and the man who gave the dog water: intention and mercy change the reckoning."),
          JT('صحيح مسلم 1955 · البخاري 2365', 'Muslim 1955 · Bujari 2365', 'Sahih Muslim 1955 · Sahih al-Bukhari 2365')
        ),
        jCard(
          JT('الأمانة في التجارة والعمل',
            'Honestidad en el comercio y el trabajo',
            'Honesty in trade and work'),
          JT('«التاجر الصدوق الأمين مع النبيين والصدّيقين والشهداء.» (الترمذي 1209)\n\n**المحرّمات الثلاثة الكبرى:**\n1️⃣ **الربا** — كل زيادة مشروطة في القرض أو المعاملة.\n2️⃣ **الغرر** — البيع بالمجهول الذي يُفضي إلى نزاع.\n3️⃣ **الميسر** — القمار والمراهنات.\n\n**والواجبات:** الصدق في الوصف، والوفاء بالعقد، والعدل في الوزن، وإنظار المعسر.\n\n🎯 **موقف واقعي:** تعرف عيباً في سلعة تبيعها، والمشتري لا يسأل.\n• **الأمين:** يبيّن العيب ويُنقص من الثمن.\n• **غيره:** يسكت، ويقول «هو لم يسأل».\n\n🌿 **قاعدة:** «من غشّ فليس منّا» (مسلم 101).',
          '«El comerciante veraz y fiel estará con los profetas, los veraces y los mártires» (Tirmidi 1209).\n\n**Las tres grandes prohibiciones:**\n1️⃣ **Riba** — todo aumento condicionado en un préstamo o transacción.\n2️⃣ **Gharar** — vender lo desconocido que lleva a disputa.\n3️⃣ **Maysir** — juegos de azar y apuestas.\n\n**Y los deberes:** veracidad en la descripción, cumplir el contrato, justicia en la medida, dar plazo al insolvente.\n\n🎯 **Situación real:** conoces un defecto en un producto que vendes y el comprador no pregunta.\n• **El fiel:** declara el defecto y baja el precio.\n• **El otro:** calla y dice «no preguntó».\n\n🌿 **Regla:** «Quien engaña no es de los nuestros» (Muslim 101).',
          "\"The truthful, trustworthy merchant will be with the prophets, the truthful and the martyrs\" (Tirmidhi 1209).\n\n**The three great prohibitions:**\n1️⃣ **Riba** — any conditional increase in a loan or transaction.\n2️⃣ **Gharar** — selling the unknown that leads to dispute.\n3️⃣ **Maysir** — gambling and betting.\n\n**And the duties:** truthfulness in description, honouring the contract, fairness in measure, granting time to the insolvent.\n\n🎯 **Real situation:** you know a defect in a product you sell and the buyer does not ask.\n• **The trustworthy:** declares the defect and lowers the price.\n• **The other:** stays silent and says \"he didn't ask\".\n\n🌿 **Rule:** \"Whoever deceives is not of us\" (Muslim 101)."),
          JT('الترمذي 1209 · مسلم 101', 'Tirmidi 1209 · Muslim 101', 'Tirmidhi 1209 · Muslim 101')
        ),
        jCard(
          JT('حقوق المسلم على المسلم',
            'Los derechos del musulmán sobre el musulmán',
            'The rights of a Muslim upon a Muslim'),
          JT('«حقّ المسلم على المسلم ستّ…» (مسلم 2162):\n\n1️⃣ **إذا لقيته فسلّم عليه**.\n2️⃣ **إذا دعاك فأجبه**.\n3️⃣ **إذا استنصحك فانصح له** — بصدق، لا بما يرضيه فقط.\n4️⃣ **إذا عطس فحمد الله فشمّته** — قل: «يرحمك الله».\n5️⃣ **إذا مرض فعُده**.\n6️⃣ **إذا مات فاتبعه** — شيّع جنازته.\n\n🎯 **موقف واقعي:** يسألك أخوك رأياً في قرار سيؤذيه.\n• **الناصح:** يقول الحقّ بلطف، ويقترح بديلاً.\n• **المجامِل:** يقول «افعل ما تراه» ويتركه يخطئ.\n\n🌿 **قاعدة:** النصيحة جزء من الحقوق، لا تدخّل في الشؤون.',
          '«El derecho del musulmán sobre el musulmán son seis…» (Muslim 2162):\n\n1️⃣ **si le encuentras, salúdale**,\n2️⃣ **si te invita, acepta**,\n3️⃣ **si te pide consejo, aconséjale** — con verdad, no solo con lo que le agrada,\n4️⃣ **si estornuda y alaba a Allah, respóndele** — «Que Allah tenga misericordia de ti»,\n5️⃣ **si enferma, visítale**,\n6️⃣ **si muere, acompáñale** — sigue su funeral.\n\n🎯 **Situación real:** tu hermano te pide opinión sobre una decisión que le perjudicará.\n• **El consejero:** dice la verdad con suavidad y propone alternativa.\n• **El complaciente:** dice «haz lo que veas» y le deja equivocarse.\n\n🌿 **Regla:** el consejo es parte de los derechos, no intromisión.',
          "\"The right of a Muslim upon a Muslim is six…\" (Muslim 2162):\n\n1️⃣ **if you meet him, greet him**,\n2️⃣ **if he invites you, accept**,\n3️⃣ **if he asks advice, advise him** — truthfully, not only what pleases him,\n4️⃣ **if he sneezes and praises Allah, answer him** — \"May Allah have mercy on you\",\n5️⃣ **if he is ill, visit him**,\n6️⃣ **if he dies, follow him** — attend his funeral.\n\n🎯 **Real situation:** your brother asks your view on a decision that will harm him.\n• **The adviser:** tells the truth gently and offers an alternative.\n• **The pleaser:** says \"do as you see fit\" and lets him err.\n\n🌿 **Rule:** advice is part of rights, not intrusion."),
          JT('صحيح مسلم 2162', 'Sahih Muslim 2162', 'Sahih Muslim 2162')
        ),
        jScn('🏘️',
          JT('جارك غير المسلم يطرق بابك عند المغرب ليطلب ماءً ساخناً لأنه مريض. ماذا تفعل؟',
            'Tu vecino no musulmán llama a tu puerta al atardecer pidiendo agua caliente porque está enfermo. ¿Qué haces?',
            'Your non-Muslim neighbour knocks at sunset asking for hot water because he is ill. What do you do?'),
          [
            JT('أعطيه ما طلب وأسأل عن حاله، وأعرض عليه مساعدة أخرى',
              'Le doy lo que pide, pregunto por su salud y ofrezco más ayuda',
              'I give what he asks, ask about his health, and offer more help'),
            JT('أعتذر لأن التعامل مع غير المسلمين لا يجوز',
              'Me excuso porque tratar con no musulmanes no está permitido',
              'I decline because dealing with non-Muslims is not allowed'),
            JT('أعطيه الماء بسرعة وأغلق الباب بلا كلام',
              'Le doy el agua rápido y cierro la puerta sin hablar',
              'I hand the water quickly and close the door without speaking'),
            JT('أطلب منه أن يعود في وقت آخر',
              'Le pido que vuelva en otro momento',
              'I ask him to come back another time'),
          ], 0,
          JT('الإحسان إلى الجار غير المسلم مطلوب، وقد وصّى القرآن بالبرّ والقسط مع من لم يقاتلنا (الممتحنة 8). خدمة مريض لا تُقرّ عقيدته، لكنها تُظهر خُلق الإسلام.',
            'La bondad con el vecino no musulmán es requerida; el Corán ordena bondad y equidad con quien no nos combate (60:8). Servir a un enfermo no aprueba su credo: muestra la ética del Islam.',
            'Kindness to a non-Muslim neighbour is required; the Quran commands goodness and fairness to those who do not fight us (60:8). Serving a sick man does not endorse his creed: it displays Islam\'s ethics.')
        ),
        jQuiz(
          JT('كم حقاً للجار المسلم غير القريب؟',
            '¿Cuántos derechos tiene un vecino musulmán no pariente?',
            'How many rights does a Muslim non-relative neighbour have?'),
          [
            JT('حقّان: الجوار والإسلام', 'Dos: vecindad e Islam', 'Two: neighbourhood and Islam'),
            JT('حقّ واحد', 'Uno', 'One'),
            JT('ثلاثة حقوق', 'Tres', 'Three'),
            JT('لا حقّ له', 'Ninguno', 'None'),
          ], 0,
          JT('حقّان. الجار المسلم القريب له ثلاثة (يُضاف القرابة)، والجار غير المسلم له حقّ الجوار.',
            'Dos. El musulmán pariente tiene tres (se añade el parentesco); el no musulmán tiene el derecho de vecindad.',
            'Two. A Muslim relative has three (kinship is added); a non-Muslim has the right of neighbourhood.')
        ),
      ],
    },

    // ═══════════════════ المحطة 9 ═══════════════════
    {
      id: 'next',
      icon: '<i class="fas fa-flag-checkered"></i>',
      title: { ar: 'طريقك يبدأ الآن', es: 'Tu camino empieza ahora', en: 'Your path starts now' },
      mascotIntro: {
        ar: 'وصلت إلى آخر خريطة، لا إلى آخر الطريق. الآن تختار خطوتك التالية.',
        es: 'Llegaste al final del mapa, no del camino. Ahora eliges tu siguiente paso.',
        en: 'You reached the end of the map, not of the road. Now you choose your next step.',
      },
      lessons: [
        jInfo('steps',
          JT('خريطة الكورسات التالية', 'Mapa de los próximos cursos', 'A map of next courses'),
          [
            jItem('fa-droplet', JT('كورس الوضوء', 'Curso de wudu', 'Wudu course'),
              JT('خطوات الوضوء بالصوت والصورة، مع أخطاء شائعة. ابدأ به إن لم تكن متوضئاً بثقة.',
                'Pasos del wudu con audio e imagen y errores comunes. Empieza aquí si no te sientes seguro.',
                'Wudu steps with audio, images and common mistakes. Start here if you are unsure.')),
            jItem('fa-hands-praying', JT('كورس الصلاة الكامل', 'Curso completo de oración', 'Complete prayer course'),
              JT('من تكبيرة الإحرام إلى التسليم، وأوقات الصلوات، وسجود السهو.',
                'Desde el takbir inicial al saludo final, tiempos y postración por olvido.',
                'From the opening takbir to the closing salam, times, and prostration of forgetfulness.')),
            jItem('fa-book-open', JT('كورس أساسيات القرآن', 'Curso de fundamentos del Corán', 'Quran basics course'),
              JT('كيف تقرأ، وكيف تحفظ، وأول سور تحفظها بعد الفاتحة.',
                'Cómo leer, cómo memorizar y las primeras suras tras al-Fatiha.',
                'How to read, how to memorise, and the first surahs after al-Fatiha.')),
            jItem('fa-language', JT('العربية من الصفر', 'Árabe desde cero', 'Arabic from zero'),
              JT('قراءة الحروف والحركات، ثم فهم ما تقرأه في الصلاة.',
                'Letras y vocales, y luego entender lo que recitas en la oración.',
                'Letters and vowels, then understanding what you recite in prayer.')),
            jItem('fa-kaaba', JT('أركان الإسلام', 'Pilares del Islam', 'Pillars of Islam'),
              JT('الزكاة والصوم والحج بأحكامها العملية.',
                'Zakat, ayuno y hajj con sus reglas prácticas.',
                'Zakat, fasting and hajj with practical rules.')),
          ],
          JT('لا تفتح خمسة كورسات في يوم واحد. اختر واحداً، وأنهه، ثم انتقل.',
            'No abras cinco cursos en un día. Elige uno, termínalo y pasa al siguiente.',
            'Do not open five courses in one day. Choose one, finish it, then move on.')
        ),
        jCard(
          JT('خطة شهرك الأول',
            'Tu plan del primer mes',
            'Your first-month plan'),
          JT('**الأسبوع 1 — الطهارة والبداية**\n• الوضوء: خطواته وأركانه.\n• الفاتحة: آية آية.\n• ركعتان بعد كل وضوء (سنة الوضوء).\n\n**الأسبوع 2 — الصلاة**\n• صلاة واحدة كاملة بتعلّمها (الظهر مثلاً).\n• ثم أضف الثانية.\n• احضر جمعة واحدة إن أمكن.\n\n**الأسبوع 3 — القرآن**\n• قراءة صفحة يومياً ببطء.\n• حفظ سورة الإخلاص والمعوذتين.\n• دعاء قبل النوم.\n\n**الأسبوع 4 — المجتمع**\n• زيارة مسجد.\n• التعريف بنفسك على مسلم واحد.\n• البدء بكورس العربية 10 دقائق يومياً.\n\n🌿 **قاعدة الاستمرار:** القليل الدائم خير من الكثير المنقطع — «أحبّ الأعمال إلى الله أدومها وإن قلّ» (البخاري 6464).',
          '**Semana 1 — pureza y comienzo**\n• wudu: pasos y elementos,\n• al-Fatiha verso a verso,\n• dos rak‘as tras cada wudu.\n\n**Semana 2 — oración**\n• una oración completa aprendida (Duhr, por ejemplo),\n• luego añade la segunda,\n• asiste a un yumu‘a si puedes.\n\n**Semana 3 — Corán**\n• una página diaria con calma,\n• memoriza al-Ikhlas y las dos protectoras,\n• súplica antes de dormir.\n\n**Semana 4 — comunidad**\n• visita una mezquita,\n• preséntate a un musulmán,\n• empieza el curso de árabe 10 minutos al día.\n\n🌿 **Regla de constancia:** poco constante vale más que mucho interrumpido — «Las obras más amadas por Allah son las más constantes, aunque sean pocas» (Bujari 6464).',
          "**Week 1 — purity and beginning**\n• wudu: steps and elements,\n• al-Fatiha verse by verse,\n• two rak'as after each wudu.\n\n**Week 2 — prayer**\n• one full prayer learned (Dhuhr, for example),\n• then add the second,\n• attend one Jumu'ah if you can.\n\n**Week 3 — Quran**\n• one page daily, slowly,\n• memorise al-Ikhlas and the two protectors,\n• supplication before sleep.\n\n**Week 4 — community**\n• visit a mosque,\n• introduce yourself to one Muslim,\n• start the Arabic course, 10 minutes a day.\n\n🌿 **Rule of consistency:** a little sustained beats much interrupted — \"The deeds most beloved to Allah are the most constant, even if few\" (Bukhari 6464)."),
          JT('صحيح البخاري 6464', 'Sahih Bujari 6464', 'Sahih al-Bukhari 6464')
        ),
        jCard(
          JT('رفيق الطريق: كيف لا تعود وحدك؟',
            'Compañero de camino: ¿cómo no volver solo?',
            'A companion on the road: how not to walk alone?'),
          JT('أكثر من يتوقف عن الالتزام لا يتوقف لأن الحجّة ضعيفة، بل لأنّه كان **وحده**.\n\n**ثلاث ركائز للمجتمع:**\n1️⃣ **مسجد قريب** — ولو مرة أسبوعياً.\n2️⃣ **صديق واحد صالح** — يكفي واحد يسأل عنك.\n3️⃣ **مجموعة صغيرة** — درس أو حلقة قرآن أو تطبيق نتقاسمه.\n\n**وإن لم تجد مجتمعاً؟**\n• ابدأ أنت: درس أسبوعي في بيتك.\n• تواصل مع مركز إسلامي على الإنترنت.\n• لا تجعل العزلة عذراً للانقطاع.\n\n🌿 **تحذير لطيف:** احذر من العزلة الفكرية — لا تقرأ وحدك في مسائل الخلاف الكبرى؛ اسأل عالماً موثوقاً. والثبات يأتي بالصحبة والعلم والعمل، لا بالحماس المؤقت.',
          'La mayoría de quienes dejan de practicar no se detienen por falta de argumentos, sino porque estaban **solos**.\n\n**Tres bases de comunidad:**\n1️⃣ **una mezquita cercana** — aunque sea semanal,\n2️⃣ **un solo buen amigo** — basta uno que pregunte por ti,\n3️⃣ **un grupo pequeño** — una clase, un círculo de Corán o una app compartida.\n\n**¿Y si no encuentras comunidad?**\n• empieza tú: una clase semanal en tu casa,\n• contacta un centro islámico online,\n• no hagas de la soledad excusa para dejar de practicar.\n\n🌿 **Aviso amable:** cuidado con el aislamiento intelectual — no decidas solo en las grandes cuestiones de disputa; consulta a un sabio fiable. La constancia viene de compañía, conocimiento y obra, no de entusiasmo pasajero.',
          "Most who stop practising do not stop for lack of arguments but because they were **alone**.\n\n**Three foundations of community:**\n1️⃣ **a nearby mosque** — even weekly,\n2️⃣ **one good friend** — one is enough if he asks about you,\n3️⃣ **a small group** — a class, a Quran circle, or a shared app.\n\n**And if you find no community?**\n• start one: a weekly class at home,\n• contact an Islamic centre online,\n• do not make isolation an excuse to stop.\n\n🌿 **A gentle warning:** beware intellectual isolation — do not decide alone on major disputed questions; consult a reliable scholar. Consistency comes from companionship, knowledge and action, not passing enthusiasm.")
        ),
        jFlash(
          JT('خلاصة الرحلة', 'Resumen del viaje', 'Journey summary'),
          [
            [JT('من هو الله؟', '¿Quién es Allah?', 'Who is Allah?'), JT('واحد لا شريك، رحيم قريب.', 'Uno sin socio, misericordioso, cercano.', 'One with no partner, merciful, near.')],
            [JT('الإسلام', 'Islam', 'Islam'), JT('استسلام وسلام وإخلاص.', 'Sumisión, paz, sinceridad.', 'Surrender, peace, sincerity.')],
            [JT('أركان الإيمان', 'Pilares de la fe', 'Pillars of faith'), JT('ستة: الله، ملائكته، كتبه، رسله، اليوم الآخر، القدر.', 'Seis: Allah, ángeles, libros, mensajeros, Último Día, decreto.', 'Six: Allah, angels, books, messengers, Last Day, decree.')],
            [JT('أركان الإسلام', 'Pilares del Islam', 'Pillars of Islam'), JT('خمسة: الشهادة، الصلاة، الزكاة، الصوم، الحج.', 'Cinco: testimonio, oración, zakat, ayuno, hajj.', 'Five: testimony, prayer, zakat, fasting, hajj.')],
            [JT('النبي ﷺ', 'El Profeta ﷺ', 'The Prophet ﷺ'), JT('الصادق الأمين، خاتم الأنبياء، رحمة للعالمين.', 'El veraz y fiel, sello de los profetas, misericordia universal.', 'The truthful and trustworthy, seal of prophets, mercy to the worlds.')],
            [JT('الأخلاق', 'Carácter', 'Character'), JT('ثماني صفات: صدق، أمانة، صبر، شكر، حياء، عدل، رحمة، كرم.', 'Ocho: veracidad, confianza, paciencia, gratitud, pudor, justicia, misericordia, generosidad.', 'Eight: truthfulness, trust, patience, gratitude, modesty, justice, mercy, generosity.')],
          ]
        ),
        jQuiz(
          JT('ما أفضل وصف لما ينبغي أن تفعله بعد إتمام هذه الرحلة؟',
            '¿Cuál es la mejor descripción de lo que deberías hacer al terminar este viaje?',
            'What best describes what you should do after this journey?'),
          [
            JT('اختيار كورس واحد متخصّص وإنهاؤه بثبات',
              'Elegir un curso especializado y terminarlo con constancia',
              'Choose one specialised course and finish it consistently'),
            JT('إنهاء كل الكورسات في أسبوع',
              'Terminar todos los cursos en una semana',
              'Finish every course in a week'),
            JT('الانتظار حتى تشعر بالكمال',
              'Esperar hasta sentirte perfecto',
              'Wait until you feel perfect'),
            JT('التوقف لأن المعلومات كثيرة',
              'Detenerse porque hay demasiada información',
              'Stop because there is too much information'),
          ], 0,
          JT('«أحبّ الأعمال إلى الله أدومها وإن قلّ». اختر واحداً، وأنهه، وأضف عادة صغيرة ثابتة.',
            '«Las obras más amadas por Allah son las más constantes, aunque sean pocas». Elige una, termínala y añade un hábito pequeño.',
            '"The deeds most beloved to Allah are the most constant, even if few." Choose one, finish it, and add one small steady habit.')
        ),
      ],
    }
  );
})();
