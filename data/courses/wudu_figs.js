// 🧩 Ensamblaje del curso de Wudu (v112): 6 estaciones originales + 6 nuevas,
// 12 carteles al inicio de su estación, rueda de fards y entrenador de orden.
(function () {
  const C = typeof COURSE_WUDU_COMPLETE !== 'undefined' ? COURSE_WUDU_COMPLETE : null;
  const N = typeof WUDU_EXTRA !== 'undefined' ? WUDU_EXTRA : null;
  if (!C || !N || !C.stations) return;

  const T = (es, ar, en) => ({ es: es, ar: ar, en: en || es });
  const byId = {};
  C.stations.forEach(s => { byId[s.id] = s; });

  const intro = byId.wudu_intro, steps = byId.wudu_steps, dua = byId.wudu_dua,
        nul = byId.wudu_nullifiers, mis = byId.wudu_mistakes, quiz = byId.wudu_quiz;

  function poster(st, img, t_es, t_ar, c_es, c_ar) {
    if (!st || !st.lessons) return;
    st.lessons.unshift({
      type: 'image',
      img: 'assets/wudu/' + img + '.png',
      title: T(t_es, t_ar),
      caption: T(c_es || 'Toca la imagen para verla a pantalla completa.',
                c_ar || 'المس الصورة لتكبيرها بملء الشاشة.'),
    });
  }

  poster(intro, 'p1', 'Por qué el wudu abre la oración', 'لماذا الوضوء مفتاح الصلاة',
    'La pureza es mitad de la fe, y sin ella no hay oración.', 'الطهور شطر الإيمان، ولا صلاة بلا طهور.');
  poster(N.fard, 'p2', 'Los 6 fards en una rueda', 'الفرائض الستة في عجلة',
    'Toca cada fard dentro del curso para ver su detalle.', 'المس كل فرض لتعرف تفصيله.');
  poster(steps, 'p3', 'Los 12 pasos, en orden', 'الخطوات الاثنتا عشرة بالترتيب',
    'Doce casillas: se leen de derecha a izquierda, de arriba abajo.', 'اثنتا عشرة خانة تُقرأ من اليمين إلى اليسار.');
  poster(N.water, 'p4', 'Tres aguas, tres sentencias', 'ثلاث مياه وثلاثة أحكام',
    'Tahur purifica · Tahir limpia pero no purifica · Nayis no se usa.', 'طهور مطهّر · طاهر غير مطهّر · نجس لا يُستعمل.');
  poster(dua, 'p5', 'La du\'a que abre ocho puertas', 'الدعاء الذي يفتح ثمانية أبواب',
    'Se dice mirando al cielo, al terminar el wudu.', 'يُقال رافعاً بصرك إلى السماء عند الفراغ منه.');
  poster(nul, 'p6', 'Los ocho que rompen el wudu', 'ثمانية نواقض للوضوء',
    'Y al lado, lo que NO lo rompe aunque se diga lo contrario.', 'ومعها ما لا ينقضه ولو شاع خلافه.');
  poster(N.khuff, 'p7', 'Mas-h sobre calcetines: las reglas', 'المسح على الخفين: الأحكام',
    'Puesto con wudu · 24 h residente · 72 h viajero.', 'على طهارة · ٢٤ ساعة للمقيم · ٧٢ للمسافر.');
  poster(N.tayammum, 'p8', 'Tayammum en seis gestos', 'التيمّم في ستّ حركات',
    'Dos palmas sobre tierra limpia: cara, y luego las manos.', 'ضربتان على الصعيد: وجه ثم كفّان.');
  poster(N.ghusl, 'p9', 'Ghusl: causas y fards', 'الغسل: أسبابه وفرائضه',
    'Seis causas, tres fards, y la forma del Profeta ﷺ.', 'ستة أسباب، وثلاثة فرائض، وصفتُه ﷺ.');
  poster(N.cases, 'p10', 'Lo que bloquea el agua', 'ما يمنع وصول الماء',
    'Esmalte sí bloquea · henna no · lentes no.', 'الطلاء يمنع · الحنّاء لا · العدسات لا.');
  poster(mis, 'p11', 'Los diez errores más caros', 'أشهر عشرة أخطاء',
    'Ninguno rompe el wudu por sí solo: todos lo empobrecen.', 'لا يبطل الوضوء بها، لكنها تُفسد ثوابه.');
  poster(quiz, 'p12', 'Repaso final', 'مراجعة ختامية',
    'Doce preguntas sobre todo el curso.', 'اثنا عشر سؤالاً على الكورس كله.');

  // ---- rueda de los 6 fards (reutiliza el tipo 'wheel') ----
  if (N.fard && N.fard.lessons) {
    N.fard.lessons.unshift({
      type: 'wheel',
      title: T('Los 6 fards — toca cada uno', 'الفرائض الستة — المس كل فرض'),
      intro: T('Toca un círculo para ver qué exige y qué pasa si lo omites.',
              'المس أي فرض لتعرف ما يقتضيه وحكم تركه.'),
      hint: T('Toca uno de los seis círculos.', 'المس أحد الفرائض الستة أعلاه.'),
      hub: 'الفرائض',
      items: [
        { icon: 'assets/wudu/icons/f1.png', short: T('Niyya', 'النية'),
          title: T('La intención en el corazón', 'النية في القلب'), sub: T('Fard 1', 'الفرض الأول'),
          text: T('Saber qué vas a hacer al empezar. No se pronuncia: quien dice «nawaytu...» en voz alta añade algo que el Profeta ﷺ no hizo. Si la omites, el wudu no cuenta como adoración.',
                  'أن تعلم ما تفعله عند الشروع. ولا تُلفظ؛ فمن قال «نويت…» بصوت مسموع أتى بما لم يفعله النبي ﷺ. ومن تركها لم يُثب على وضوئه.') },
        { icon: 'assets/wudu/icons/f2.png', short: T('La cara', 'الوجه'),
          title: T('Lavar toda la cara', 'غسل الوجه كله'), sub: T('Fard 2', 'الفرض الثاني'),
          text: T('De la raíz del cabello al hueso de la mandíbula, y de oreja a oreja. Debe llegar el agua a la piel bajo la barba si es rala, y a los párpados y labios.',
                  'من منابت الشعر إلى اللحيين، ومن الأذن إلى الأذن. ويجب إيصال الماء إلى البشرة تحت اللحية الخفيفة، وإلى الأجفان والشفتين.') },
        { icon: 'assets/wudu/icons/f3.png', short: T('Los brazos', 'الذراعان'),
          title: T('Los brazos con los codos', 'الذراعان مع المرفقين'), sub: T('Fard 3', 'الفرض الثالث'),
          text: T('Hasta el codo incluido — detenerse antes es el error más común. Y entre los dedos si están apretados.',
                  'إلى المرفق داخلَ الغسل — والتوقف قبله أشهر خطأ. وما بين الأصابع إن كانت ملتصقة.') },
        { icon: 'assets/wudu/icons/f4.png', short: T('La cabeza', 'الرأس'),
          title: T('Pasar la mano por toda la cabeza', 'مسح الرأس كله'), sub: T('Fard 4', 'الفرض الرابع'),
          text: T('Una sola vez, con la mano mojada: no es lavar ni repetir. Con el agua que queda se limpian las orejas (sunna).',
                  'مرة واحدة بيد مبلولة: ليس غسلاً ولا تكراراً. وبما بقي في اليد تُمسح الأذنان (سنة).') },
        { icon: 'assets/wudu/icons/f5.png', short: T('Los pies', 'الرجلان'),
          title: T('Los pies con los tobillos', 'الرجلان مع الكعبين'), sub: T('Fard 5', 'الفرض الخامس'),
          text: T('El tobillo entra en el lavado, y también el talón y la planta. «¡Ay de los talones del Fuego!» (Bujari 60).',
                  'الكعب داخل في الغسل، ومثله العقب والأخمص. «ويلٌ للأعقاب من النار» (البخاري ٦٠).') },
        { icon: 'assets/wudu/icons/f6.png', short: T('El orden', 'الترتيب'),
          title: T('Guardar el orden', 'الترتيب بين الأعضاء'), sub: T('Fard 6', 'الفرض السادس'),
          text: T('Cara → brazos → cabeza → pies. Si lo inviertes a propósito, el wudu no vale; si lo olvidas, repites ese miembro y lo que venga después.',
                  'وجه ← ذراعان ← رأس ← رجلان. فإن خالفت عمداً بطل، وإن نسيت أعدت العضو وما بعده.') },
      ],
    });
  }

  // ---- entrenador de orden (drag & drop) ----
  if (steps && steps.lessons) {
    steps.lessons.push({
      type: 'drag_drop',
      title: T('Ordena los pasos', 'رتّب خطوات الوضوء'),
      instruction: T('Arrastra cada paso a su lugar: del primero al último.',
                     'اسحب كل خطوة إلى موضعها: من الأولى إلى الأخيرة.'),
      items: [
        { id: 's1', label: T('Intención (en el corazón)', 'النية في القلب'), order: 1 },
        { id: 's2', label: T('Bismillah', 'التسمية'), order: 2 },
        { id: 's3', label: T('Lavar las manos', 'غسل الكفين'), order: 3 },
        { id: 's4', label: T('Enjuagar la boca', 'المضمضة'), order: 4 },
        { id: 's5', label: T('Aspirar agua por la nariz', 'الاستنشاق'), order: 5 },
        { id: 's6', label: T('Lavar la cara', 'غسل الوجه'), order: 6 },
        { id: 's7', label: T('Brazo derecho', 'الذراع اليمنى'), order: 7 },
        { id: 's8', label: T('Brazo izquierdo', 'الذراع اليسرى'), order: 8 },
        { id: 's9', label: T('Mas-h de la cabeza y orejas', 'مسح الرأس والأذنين'), order: 9 },
        { id: 's10', label: T('Pie derecho, luego izquierdo', 'القدم اليمنى ثم اليسرى'), order: 10 },
      ],
    });
    steps.lessons.push({
      type: 'checklist',
      title: T('Tu primer wudu completo', 'وضوءك الأول كاملاً'),
      intro: T('Hazlo ahora con agua y marca cada paso al terminarlo. Tómate tu tiempo: la prisa es enemiga del agua que llega.',
               'افعله الآن بالماء وأشّر على كل خطوة عند إتمامها. وتمهّل؛ فالعجلة عدوّ وصول الماء.'),
      items: [
        { t: T('Me remangué y me lavé las manos tres veces', 'شمرت عن ذراعي وغسلت كفّيّ ثلاثاً') },
        { t: T('Dije Bismillah y puse la intención', 'قلت بسم الله وعقدت النية') },
        { t: T('Enjuagué la boca tres veces', 'مضمضت ثلاثاً') },
        { t: T('Aspiré agua por la nariz y la expulsé', 'استنشقت واستنثرت') },
        { t: T('Lavé la cara de frente a mentón, tres veces', 'غسلت وجهي من الجبهة إلى الذقن ثلاثاً') },
        { t: T('Lavé el brazo derecho con el codo', 'غسلت ذراعي اليمنى مع المرفق') },
        { t: T('Lavé el brazo izquierdo con el codo', 'غسلت ذراعي اليسرى مع المرفق') },
        { t: T('Pasé la mano por toda la cabeza, una vez', 'مسحت رأسي كله مرة') },
        { t: T('Limpié las orejas con el mismo agua', 'مسحت أذنيّ بماء الرأس') },
        { t: T('Lavé el pie derecho con el tobillo', 'غسلت قدمي اليمنى مع الكعب') },
        { t: T('Lavé el pie izquierdo con el tobillo', 'غسلت قدمي اليسرى مع الكعب') },
        { t: T('Dije la shahada mirando al cielo', 'قلت الشهادة رافعاً بصري إلى السماء') },
      ],
    });
  }

  // ---- nuevo orden: 12 estaciones ----
  C.stations = [
    intro, N.fard, steps, N.water, dua, nul, N.khuff, N.tayammum, N.ghusl, N.cases, mis, quiz,
  ].filter(Boolean);
  C.durationMin = 70;
  C.description = T(
    'El Wudu completo: por qué, los 6 fards, los 12 pasos con fotos, el agua, la du\'a, lo que lo rompe, calcetines, tayammum, ghusl y las dudas de hoy',
    'الوضوء كاملاً: لماذا، والفرائض الستة، والخطوات الاثنتا عشرة بالصور، وأحكام الماء، والدعاء، والنواقض، والمسح على الخفين، والتيمّم، والغسل، وأسئلة العصر'
  );
})();
