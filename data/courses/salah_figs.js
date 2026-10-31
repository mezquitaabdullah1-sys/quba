// 🧩 Salah course assembly (v110): 7 existing stations + 5 new ones,
// with 10 poster lessons injected at the head of their station.
(function () {
  const C = typeof COURSE_SALAH_COMPLETE !== 'undefined' ? COURSE_SALAH_COMPLETE : null;
  const N = typeof SALAH_EXTRA !== 'undefined' ? SALAH_EXTRA : null;
  if (!C || !N || !C.stations) return;

  const st = C.stations;
  // existing order: 0 conditions, 1 pillars, 2 steps, 3 wajibat, 4 tashahhud, 5 four_rakah, 6 summary
  const conditions = st[0], pillars = st[1], steps = st[2], wajibat = st[3];
  const tashahhud = st[4], four = st[5], summary = st[6];

  const T = (es, ar, en) => ({ es: es, ar: ar, en: en || es });

  function poster(station, img, title_es, title_ar, cap_es, cap_ar) {
    if (!station || !station.lessons) return;
    station.lessons.unshift({
      type: 'image',
      img: 'assets/salah/' + img + '.png',
      title: T(title_es, title_ar),
      caption: T(
        cap_es || 'Toca la imagen para verla a pantalla completa.',
        cap_ar || 'المس الصورة لتكبيرها بملء الشاشة.'
      ),
    });
  }

  // ---- poster at the head of each station ----
  poster(conditions, 'p1', 'Las 6 condiciones de un vistazo', 'الشروط الستة في لمحة واحدة',
    'Rueda de las seis condiciones. Toca para ampliar.', 'عجلة الشروط الستة. المس للتكبير.');
  poster(pillars, 'p2', 'Los 14 pilares en orden', 'الأركان الأربعة عشر بالترتيب',
    'Los catorce pilares numerados, y la calma (tuma\'nina) al lado.', 'الأربعة عشر مرتبة، ومعها الطمأنينة.');
  poster(N.qiraah, 'p3', 'El orden de la recitación', 'ترتيب ما تقرأه واقفاً',
    'Istiftah → refugio → Basmala → Al-Fátiha → sura.', 'استفتاح ← تعوذ ← بسملة ← فاتحة ← سورة.');
  poster(steps, 'p4', 'Los 11 pasos de un vistazo', 'الخطوات الإحدى عشرة في لمحة',
    'Antes de empezar, mira el camino completo.', 'قبل أن تبدأ، انظر إلى المسار كاملاً.');
  poster(wajibat, 'p5', 'Pilar, obligación y sunnah', 'ركن وواجب وسنة',
    'Qué pasa si omites cada uno.', 'ما يترتب على ترك كل نوع.');
  poster(tashahhud, 'p6', 'La estructura del último sentado', 'بنية الجلسة الأخيرة',
    'Tashahhud → Ibrahimiyya → du\'a → taslim.', 'تشهد ← إبراهيمية ← دعاء ← تسليم.');
  poster(four, 'p7', 'Rakahs de las cinco oraciones', 'عدد ركعات الفروض الخمسة',
    'Fajr 2 · Dhuhr 4 · Asr 4 · Maghrib 3 · Isha 4.', 'الفجر ٢ · الظهر ٤ · العصر ٤ · المغرب ٣ · العشاء ٤.');
  poster(N.rawatib, 'p8', 'Sunnahs antes y después', 'السنن الرواتب قبل وبعد',
    'Doce rakats al día repartidas alrededor de las obligatorias.', 'اثنتا عشرة ركعة موزعة حول الفرائض.');
  poster(N.special, 'p9', 'Tres oraciones distintas', 'ثلاث صلوات مختلفة',
    'Witr, Jumu\'ah y Janazah comparadas.', 'الوتر والجمعة والجنازة في مقارنة واحدة.');
  poster(N.travel, 'p10', 'Viaje, olvido y excusa', 'السفر والنسيان والعذر',
    'Tres casos que cambian la forma, no la obligación.', 'ثلاث حالات تغيّر الهيئة لا الوجوب.');


  // ---- interactive conditions wheel (v111) ----
  if (conditions && conditions.lessons) {
    conditions.lessons.unshift({
      type: 'wheel',
      title: T('Las 6 condiciones — toca cada una', 'الشروط الستة — المس كل شرط'),
      intro: T('Toca un círculo para ver qué significa y cómo cumplirlo.',
              'المس أي شرط لتعرف معناه وكيف تحققه.'),
      hint: T('Toca uno de los seis círculos de arriba.',
             'المس أحد الشروط الستة في العجلة أعلاه.'),
      hub: 'الشروط',
      items: [
        { icon: 'assets/salah/icons/c1.png',
          short: T('Islam y razón', 'الإسلام والعقل'),
          title: T('Islam, razón y discernimiento', 'الإسلام والعقل والتمييز'),
          sub: T('La primera condición', 'الشرط الأول'),
          text: T('La oración solo es válida si la persona es musulmana, cuerda y capaz de distinguir. Un niño pequeño o quien ha perdido el juicio no está obligado a rezar.',
                  'لا تصح الصلاة إلا من مسلم عاقل مميّز. فالصغير الذي لا يميّز وغير المميز لا تلزمهما الصلاة، رحمة من الله ورفعاً للحرج.') },
        { icon: 'assets/salah/icons/c2.png',
          short: T('Pureza', 'الطهارة'),
          title: T('Estar en estado de pureza (tahara)', 'الطهارة من الحدث والنجس'),
          sub: T('Wudu o ghusl', 'الوضوء أو الغسل'),
          text: T('Necesitas wudu si has perdido la ablución, y ghusl tras la menstruación, el puerperio o el acto conyugal. También el cuerpo, la ropa y el lugar deben estar libres de impureza.',
                  'تحتاج الوضوء إذا انتقض، والغسل بعد الحيض والنفاس والجنابة. ويشترط أيضاً طهارة البدن والثوب والمكان من النجاسة.') },
        { icon: 'assets/salah/icons/c3.png',
          short: T('Cubrir el cuerpo', 'ستر العورة'),
          title: T('Cubrir el awrah', 'ستر العورة'),
          sub: T('Ropa limpia y amplia', 'لباس ساتر نظيف'),
          text: T('El hombre cubre desde el ombligo hasta la rodilla como mínimo, y lo completo es hombros incluidos. La mujer cubre todo el cuerpo salvo el rostro y las manos.',
                  'الرجل يستر ما بين السرة والركبة أقلّه، والأكمل ستر الكتفين. والمرأة تستر جميع بدنها إلا الوجه والكفين.') },
        { icon: 'assets/salah/icons/c4.png',
          short: T('Hora correcta', 'دخول الوقت'),
          title: T('Entrar el tiempo de la oración', 'دخول وقت الصلاة'),
          sub: T('Cada oración tiene su hora', 'لكل صلاة وقتها'),
          text: T('No vale adelantar la oración antes de su tiempo ni retrasarla hasta que salga. El tiempo entra con el adhan y termina con el siguiente.',
                  'لا تصح الصلاة قبل دخول وقتها ولا بعد خروجه. يبدأ الوقت بالأذان وينتهي بدخول وقت الصلاة التالية.') },
        { icon: 'assets/salah/icons/c5.png',
          short: T('La Qibla', 'القبلة'),
          title: T('Orientarse hacia la Qibla', 'استقبال القبلة'),
          sub: T('Hacia La Meca', 'نحو الكعبة'),
          text: T('Todo el cuerpo mira a la Kaaba en La Meca. Si estás en un lugar lejano, basta la dirección aproximada; dentro de la mezquita, sigue el mihrab.',
                  'يستقبل المصلي الكعبة بجميع بدنه. ومن كان بعيداً كفاه الاجتهاد في الجهة، ومن كان في المسجد تبع المحراب.') },
        { icon: 'assets/salah/icons/c6.png',
          short: T('La intención', 'النية'),
          title: T('La intención en el corazón', 'النية في القلب'),
          sub: T('No se dice en voz alta', 'لا تُقال باللسان'),
          text: T('Basta con saber en tu corazón qué oración vas a rezar. No hay que pronunciar ninguna fórmula: la intención es un acto del corazón, no de la lengua.',
                  'تكفي معرفة القلب للصلاة التي تريد أداءها. ولا يُشرع التلفظ بها؛ فالنية عمل قلبي لا لساني.') },
      ],
    });
  }

  // ---- new order: 12 stations ----
  C.stations = [conditions, pillars, N.qiraah, steps, wajibat, tashahhud, four, N.rawatib, N.mistakes, N.special, N.travel, summary];
  C.durationMin = 80;
  C.description = {
    es: 'La Salah completa: condiciones, pilares, qué recitar, 11 posiciones con fotos, sunnahs, errores, oraciones especiales y viaje',
    ar: 'الصلاة كاملة: الشروط، الأركان، ما تقرأ، 11 خطوة بالصور، السنن، الأخطاء، الصلوات الخاصة وأحكام السفر',
    en: 'The complete Salah: conditions, pillars, recitation, 11 photo steps, sunnahs, mistakes, special prayers and travel',
  };
})();
