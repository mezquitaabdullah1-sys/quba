// 💧 Curso de Wudu — estaciones nuevas (v112): fards, agua, khuffs, tayammum, ghusl, casos.
// Trilingüe {es, ar, en}, mismo molde que salah_extra.js
const WDU = (es, ar, en) => ({ es: es, ar: ar, en: en || es });

const WUDU_EXTRA = {

  // ================= 2. FARDS Y SUNNAS =================
  fard: {
    id: 'wudu_fard',
    icon: '<i class="fas fa-list-ol"></i>',
    title: WDU('Los 6 fards y las sunnas', 'فرائض الوضوء وسننه', 'The 6 fards and the sunnahs'),
    mascotIntro: WDU('No todo en el wudu tiene el mismo peso: hay fards que no se pueden omitir y sunnas que dan recompensa. Vamos a separarlos.',
      'ليس كل ما في الوضوء بدرجة واحدة: فرائض لا يجوز تركها، وسنن تُثاب عليها. لنفرّق بينهما.',
      'Not everything in wudu weighs the same: fards you cannot omit, and sunnahs that bring reward.'),
    lessons: [
      {
        type: 'card',
        title: WDU('Fard, sunna y condición', 'الفرض والسنة والشرط', 'Fard, sunnah and condition'),
        content: WDU(
          `<p><strong>Fard (فرض)</strong> — obligatorio: si se omite, el wudu no es válido.</p>
<p><strong>Sunna (سنة)</strong> — recomendado: si se omite, el wudu sigue siendo válido pero pierdes recompensa.</p>
<p><strong>Condición (شرط)</strong> — algo previo sin lo cual el wudu no se considera: Islam, discernimiento, agua pura, agua lícita, intención.</p>
<p>💡 Confundir estos tres niveles es la causa número uno de dudas: la gente repite el wudu entero por haber olvidado una sunna, o lo deja incompleto pensando que un fard es opcional.</p>`,
          `<p><strong>الفرض</strong> — ما يلزم فعله، وتركه يُبطل الوضوء.</p>
<p><strong>السنة</strong> — ما يُثاب فاعله ولا يبطل الوضوء بتركه.</p>
<p><strong>الشرط</strong> — ما يتوقف عليه صحة الوضوء من خارج أفعاله: الإسلام، والتمييز، وطهورية الماء، وإباحته، والنية.</p>
<p>💡 الخلط بين هذه المراتب الثلاث هو سبب أكثر الوساوس: يعيد أحدهم وضوءه كاملاً لأنه ترك سنة، أو يترك فرضاً وهو يحسبه مستحباً.</p>`,
          `<p><strong>Fard</strong> — obligatory: omitting it invalidates the wudu.</p>
<p><strong>Sunnah</strong> — recommended: omitting it keeps the wudu valid but loses reward.</p>
<p><strong>Condition</strong> — a prerequisite outside the acts themselves: Islam, discernment, pure water, lawful water, intention.</p>`),
      },
      {
        type: 'card',
        title: WDU('Los 6 fards (escuela shafi\'i)', 'الفرائض الستة', 'The 6 fards (Shafi\'i school)'),
        content: WDU(
          `<p>Son seis, y basta olvidar uno para que el wudu no valga:</p>
<p><strong>1.</strong> La intención (niyya) en el corazón.<br>
<strong>2.</strong> Lavar toda la cara.<br>
<strong>3.</strong> Lavar las manos hasta los codos, incluidos.<br>
<strong>4.</strong> Pasar la mano mojada por toda la cabeza.<br>
<strong>5.</strong> Lavar los pies hasta los tobillos, incluidos.<br>
<strong>6.</strong> Guardar este orden.</p>
<p>⚠️ Las escuelas cuentan distinto: la malikí añade la continuidad (muwalat) y la frotación; la hanafí no cuenta la intención como fard. Si sigues una escuela, cíñete a ella sin mezclar.</p>`,
          `<p>هي ستة، وترك واحد منها يُبطل الوضوء:</p>
<p><strong>١.</strong> النية في القلب.<br>
<strong>٢.</strong> غسل الوجه كله.<br>
<strong>٣.</strong> غسل اليدين مع المرفقين.<br>
<strong>٤.</strong> مسح الرأس كله.<br>
<strong>٥.</strong> غسل الرجلين مع الكعبين.<br>
<strong>٦.</strong> الترتيب بينها.</p>
<p>⚠️ والمذاهب تختلف في العدّ: المالكية يعدّون الموالاة والدلك، والحنفية لا يعدّون النية فرضاً. فمن قلّد مذهباً لزمه ولا يخلط.</p>`,
          `<p>Six in the Shafi'i school — omit one and the wudu is invalid: intention, face, arms to the elbows, wiping the whole head, feet to the ankles, and the order.</p>
<p>⚠️ Schools count differently (Maliki adds continuity and rubbing; Hanafi does not count intention as fard). Follow one school without mixing.</p>`),
      },
      {
        type: 'card',
        title: WDU('Lavar la cara: sus límites', 'حدود غسل الوجه', 'Washing the face: its limits'),
        content: WDU(
          `<p>El fard es lavar <strong>toda</strong> la cara una vez; lo perfecto es tres.</p>
<p><strong>De arriba abajo:</strong> desde donde nace el cabello de la frente hasta el final de la barbilla y el hueso bajo la mandíbula.</p>
<p><strong>De lado a lado:</strong> desde el lóbulo de una oreja hasta el de la otra.</p>
<p>Debe llegar el agua a: la frente, las cejas, los párpados y las pestañas, el hueco de los ojos, la nariz por fuera (no dentro), los labios, el bigote, la barba por fuera, y la piel bajo la barba si es rala.</p>
<p>💡 Si la barba es espesa basta lavar su superficie; si es rala debe llegar el agua a la piel.</p>`,
          `<p>الفرض غسل الوجه <strong>كله</strong> مرة واحدة، والأكمل ثلاثاً.</p>
<p><strong>طولاً:</strong> من منابت شعر الرأس إلى آخر الذقن وما تحته من اللحيين.</p>
<p><strong>عرضاً:</strong> من شحمة الأذن إلى شحمة الأذن الأخرى.</p>
<p>ويجب إيصال الماء إلى: الجبهة، والحاجبين، والأجفان، وأصول الشعر، وموضع الأهداب، وما ظهر من الأنف، والشفتين، والشارب، واللحية ظاهرها، والبشرة تحتها إن كانت خفيفة.</p>
<p>💡 فإن كانت اللحية كثيفة كفى غسل ظاهرها، وإن كانت خفيفة وجب إيصال الماء إلى البشرة.</p>`,
          `<p>Wash the <strong>whole</strong> face once (three times is better): from the hairline to the chin and jawbone, from one earlobe to the other.</p>
<p>Water must reach forehead, eyebrows, eyelids, lashes, the outside of the nose, lips, moustache, the surface of the beard — and the skin beneath a thin beard.</p>`),
      },
      {
        type: 'card',
        title: WDU('Los brazos hasta el codo', 'غسل اليدين إلى المرفقين', 'The arms to the elbows'),
        content: WDU(
          `<p>Se lava el brazo <strong>entero</strong> desde las puntas de los dedos hasta el codo, y el codo entra en el lavado — no te detengas antes.</p>
<p>Empieza por la derecha, luego la izquierda (esto es sunna; si empiezas por la izquierda el wudu es válido).</p>
<p><strong>Obligatorio:</strong> que el agua llegue a la piel y a las uñas, y entre los dedos si están apretados.</p>
<p><strong>Sunna:</strong> frotar con la mano, pasar los dedos entre los dedos (tajlil), y lavar tres veces.</p>
<p>💡 Anillo, reloj o pulsera ajustada: muévelos para que el agua pase por debajo.</p>`,
          `<p>يُغسل الذراع <strong>كاملاً</strong> من أطراف الأصابع إلى المرفق، والمرفق داخل في الغسل — لا تتوقف قبله.</p>
<p>يبدأ باليمنى ثم اليسرى، والتيمن سنة؛ ولو بدأ باليسرى صحّ وضوؤه.</p>
<p><strong>الواجب:</strong> وصول الماء إلى البشرة والأظافر، وإلى ما بين الأصابع إن كانت ملتصقة.</p>
<p><strong>السنة:</strong> الدلك باليد، وتخليل الأصابع، والتثليث.</p>
<p>💡 الخاتم والساعة الضيّقة: حرّكهما ليصل الماء إلى ما تحتهما.</p>`,
          `<p>Wash the whole arm from fingertips to elbow, <strong>including</strong> the elbow. Right first. Water must reach the skin and nails; move rings and watches.</p>`),
      },
      {
        type: 'card',
        title: WDU('Mas-h de la cabeza y de las orejas', 'مسح الرأس والأذنين', 'Wiping the head and ears'),
        content: WDU(
          `<p><strong>Fard:</strong> pasar la mano mojada por <strong>toda</strong> la cabeza, una sola vez.</p>
<p><strong>Cómo (sunna):</strong> junta las palmas en la frente, llévalas hasta la nuca y tráelas de vuelta a la frente.</p>
<p>⚠️ No es lavar: es <em>mas-h</em>, pasar la mano, no echar agua ni frotar como con jabón. No se repite.</p>
<p><strong>Las orejas:</strong> se limpian con el agua que queda en la mano (sin agua nueva): los índices dentro y los pulgares por fuera. Es sunna, no fard — pero el Profeta ﷺ dijo: «Las orejas son parte de la cabeza» (Abu Dawud 134).</p>
<p>💡 Mujer con cabello recogido: basta con pasar la mano por la superficie del cabello, sin soltarlo.</p>`,
          `<p><strong>الفرض:</strong> مسح <strong>جميع</strong> الرأس بيده المبلولة مرة واحدة.</p>
<p><strong>الكيفية (سنة):</strong> يجمع كفّيه على مقدّم رأسه، ويمرّهما إلى القفا، ثم يردّهما إلى المقدّم.</p>
<p>⚠️ ليس غسلاً بل مسحاً: لا يصبّ الماء ولا يفرك كما يفعل بالصابون، ولا يكرّره.</p>
<p><strong>الأذنان:</strong> تُمسحان بماء الرأس نفسه لا بماء جديد: السبّابتان داخل الأذنين والإبهامان على ظاهرهما. وهي سنة لا فرض، وقال ﷺ: «الأذنان من الرأس» (أبو داود ١٣٤).</p>
<p>💡 المرأة التي ضفرت شعرها تمسح ظاهر شعرها ولا تنقضه.</p>`,
          `<p><strong>Fard:</strong> wipe the <strong>whole</strong> head with wet hands, once. It is wiping, not washing — no water poured, no rubbing, no repeat.</p>
<p><strong>Ears:</strong> with the same water left on the hand (no fresh water), index fingers inside, thumbs outside — a sunnah, and «the ears are part of the head» (Abu Dawud 134).</p>`),
      },
      {
        type: 'card',
        title: WDU('Los pies hasta el tobillo', 'غسل الرجلين إلى الكعبين', 'The feet to the ankles'),
        content: WDU(
          `<p>Se lava el pie <strong>entero</strong> hasta el tobillo, y el tobillo (el hueso que sobresale) entra en el lavado.</p>
<p><strong>Obligatorio:</strong> el agua llega a todo el pie, también al talón, la planta, entre los dedos y debajo de las uñas largas.</p>
<p><strong>Sunna:</strong> empezar por el derecho, frotar, y pasar el dedo meñique de la mano izquierda entre los dedos del pie (del meñique al gordo).</p>
<p>💡 La planta del pie y el talón son las zonas más olvidadas — y hay una advertencia severa del Profeta ﷺ sobre el talón seco: «¡Ay de los talones del Fuego!» (Bujari 60).</p>`,
          `<p>يُغسل القدم <strong>كله</strong> إلى الكعب، والكعبان (العظمان الناتئان) داخلان في الغسل.</p>
<p><strong>الواجب:</strong> وصول الماء إلى القدم كله، ومنه العقب والأخمص وما بين الأصابع وتحت الأظافر الطويلة.</p>
<p><strong>السنة:</strong> البدء باليمنى، والدلك، وتخليل أصابع الرجل بخنصر اليسرى من الخنصر إلى الإبهام.</p>
<p>💡 والعقب والأخمص أكثر ما يُغفل عنه، وقد جاء الوعيد الشديد في العقب اليابس: «ويلٌ للأعقاب من النار» (البخاري ٦٠).</p>`,
          `<p>Wash the whole foot to the ankle — the ankle bone included. Water must reach heel, sole, between the toes and under long nails.</p>
<p>💡 «Woe to the heels from the Fire» (Bukhari 60) — the heel is the most forgotten part.</p>`),
      },
      {
        type: 'card',
        title: WDU('Intención, orden y continuidad', 'النية والترتيب والموالاة', 'Intention, order and continuity'),
        content: WDU(
          `<p><strong>La intención:</strong> en el corazón, en el momento de empezar. No se pronuncia. Es saber qué estás haciendo, no recitar una fórmula.</p>
<p><strong>El orden:</strong> cara → brazos → cabeza → pies. Si inviertes el orden a propósito, el wudu no vale; si lo olvidas, repites el miembro fuera de orden y lo que venga después.</p>
<p><strong>La continuidad (muwalat):</strong> hacerlo seguido, sin que se seque el miembro anterior. Es fard en la escuela malikí y sunna en la shafi\'i — en ambos casos, hacerlo seguido es lo correcto.</p>
<p>💡 Si te secas entre paso y paso, o contestas una llamada larga, repite el wudu por seguridad.</p>`,
          `<p><strong>النية:</strong> في القلب عند الشروع، ولا تُلفظ. هي معرفة ما تفعله، لا ترديد صيغة.</p>
<p><strong>الترتيب:</strong> الوجه ← اليدان ← الرأس ← الرجلان. فإن خالف الترتيب عمداً بطل، وإن نسِيَ أعاد العضو وما بعده.</p>
<p><strong>الموالاة:</strong> أن يكون متتابعاً بحيث لا يجفّ العضو السابق. وهي فرض عند المالكية وسنة عند الشافعية، وعلى القولين فالتتابع هو الصواب.</p>
<p>💡 فإن جفّ العضو أو طال الفصل بين الأعضاء فأعد الوضوء احتياطاً.</p>`,
          `<p><strong>Intention:</strong> in the heart at the start, never spoken. <strong>Order:</strong> face → arms → head → feet. <strong>Continuity:</strong> no long gap that dries the previous limb.</p>`),
      },
      {
        type: 'card',
        title: WDU('Las 12 sunnas del wudu', 'سنن الوضوء', 'The 12 sunnahs of wudu'),
        content: WDU(
          `<p>Ninguna es obligatoria, pero cada una suma:</p>
<p>1. El siwak antes de empezar.<br>
2. Decir «Bismillah».<br>
3. Lavarse las manos hasta las muñecas al principio.<br>
4. Enjuagar la boca (madmadah).<br>
5. Aspirar agua por la nariz (istinshaq).<br>
6. Pasar los dedos por la barba espesa.<br>
7. Pasar los dedos entre los dedos de manos y pies.<br>
8. Empezar siempre por el lado derecho.<br>
9. Repetir tres veces cada miembro (la cabeza solo una).<br>
10. Frotar (dalk) con la mano.<br>
11. No derrochar agua.<br>
12. Decir la du\'a después de terminar.</p>`,
          `<p>لا واحدة منها واجبة، وكلها تُثاب:</p>
<p>١. السواك قبل الشروع.<br>
٢. التسمية.<br>
٣. غسل الكفين في أوله.<br>
٤. المضمضة.<br>
٥. الاستنشاق.<br>
٦. تخليل اللحية الكثيفة.<br>
٧. تخليل أصابع اليدين والرجلين.<br>
٨. التيامن.<br>
٩. التثليث في الأعضاء (والرأس مرة).<br>
١٠. الدلك باليد.<br>
١١. ترك الإسراف في الماء.<br>
١٢. الدعاء بعده.</p>`,
          `<p>The twelve: siwak, Bismillah, washing the hands first, rinsing the mouth, sniffing water, combing a thick beard, between fingers and toes, starting right, three times each limb (head once), rubbing, not wasting water, the du'a at the end.</p>`),
      },
      {
        type: 'checklist',
        title: WDU('Revisa tu wudu: los 6 fards', 'راجع وضوءك: الفرائض الستة', 'Check your wudu: the 6 fards'),
        intro: WDU('Marca cada casilla solo si estás seguro de haberla cumplido en tu último wudu.',
          'أشّر على كل بند فقط إذا تيقّنت من أدائه في وضوئك الأخير.',
          'Tick each box only if you are sure you fulfilled it in your last wudu.'),
        items: [
          { t: WDU('Hice la intención en el corazón sin decirla', 'عقدت النية في القلب دون تلفّظ') },
          { t: WDU('Lavé toda la cara, de la frente al mentón', 'غسلت وجهي كله من الجبهة إلى الذقن') },
          { t: WDU('Lavé los dos brazos con los codos', 'غسلت ذراعيّ مع المرفقين') },
          { t: WDU('Pasé la mano por toda la cabeza una vez', 'مسحت رأسي كله مرة واحدة') },
          { t: WDU('Lavé los dos pies con los tobillos', 'غسلت قدميّ مع الكعبين') },
          { t: WDU('Respeté el orden: cara, brazos, cabeza, pies', 'راعيت الترتيب: وجه، ذراعان، رأس، رجلان') },
          { t: WDU('Lo hice seguido, sin que se secara un miembro', 'تابعت بلا فاصل حتى لا يجفّ عضو') },
        ],
      },
      { type: 'quiz', question_es: '¿Cuántos fards tiene el wudu en la escuela shafi\'i?',
        question_ar: 'كم عدد فرائض الوضوء عند الشافعية؟',
        question_en: 'How many fards does wudu have in the Shafi\'i school?',
        options_es: ['4', '5', '6', '12'], options_ar: ['٤', '٥', '٦', '١٢'],
        options_en: ['4', '5', '6', '12'], correct: 2,
        explanation_es: 'Seis: intención, cara, brazos, cabeza, pies y orden.',
        explanation_en: 'Six: intention, face, arms, head, feet and order.' },
      { type: 'quiz', question_es: '¿Qué pasa si olvidas una sunna del wudu?',
        question_ar: 'ما حكم من ترك سنة من سنن الوضوء؟',
        question_en: 'What happens if you skip a sunnah of wudu?',
        options_es: ['El wudu es nulo', 'El wudu es válido pero pierdes recompensa', 'Hay que repetirlo entero', 'Hay que hacer suyud as-sahw'],
        options_ar: ['يبطل الوضوء', 'يصحّ الوضوء وتفوت الأجر', 'يعيد الوضوء كاملاً', 'يسجد للسهو'],
        options_en: ['The wudu is invalid', 'Valid, but you lose the reward', 'Repeat the whole wudu', 'Make sujud as-sahw'],
        correct: 1,
        explanation_es: 'La sunna no invalida: solo pierdes su recompensa. Repetir el wudu entero por una sunna olvidada es exceso.',
        explanation_en: 'A sunnah does not invalidate — you only lose its reward.' },
    ],
  },

  // ================= 4. EL AGUA =================
  water: {
    id: 'wudu_water',
    icon: '<i class="fas fa-glass-water-droplet"></i>',
    title: WDU('El agua y sus clases', 'أحكام الماء', 'Water and its categories'),
    mascotIntro: WDU('No cualquier agua sirve. Tres palabras lo resumen todo: tahur, tahir, nayis.',
      'ليس كل ماء صالحاً. ثلاث كلمات تلخّص كل شيء: طهور، طاهر، نجس.',
      'Not every water works. Three words sum it up: tahur, tahir, najis.'),
    lessons: [
      {
        type: 'card',
        title: WDU('Las tres clases de agua', 'أقسام المياه الثلاثة', 'The three categories of water'),
        content: WDU(
          `<p><strong>1. Tahur (طهور)</strong> — pura en sí y purificante. Con ella se hace wudu y ghusl. Es el agua natural: lluvia, río, mar, pozo, manantial, nieve derretida.</p>
<p><strong>2. Tahir (طاهر)</strong> — pura en sí pero que no purifica a otro. Es el agua que cambió por mezclarse con algo limpio (té, café, jabón, azafrán). Limpia la suciedad visible, pero no levanta el hadaz.</p>
<p><strong>3. Nayis (نجس)</strong> — impura. Cayó en ella algo impuro y la cambió (color, olor o sabor), o era poca cantidad y cayó impureza aunque no cambiara.</p>
<p>💡 La regla de oro: <em>el agua es tahur hasta que tengas certeza de lo contrario.</em> La duda no la vuelve impura.</p>`,
          `<p><strong>١. طهور</strong> — طاهر في نفسه مطهّر لغيره، به يُتوضّأ ويُغتسل: ماء المطر والنهر والبحر والبئر والعين وذوب الثلج.</p>
<p><strong>٢. طاهر</strong> — طاهر في نفسه غير مطهّر لغيره؛ وهو ما تغيّر بمخالطة شيء طاهر (شاي، قهوة، صابون، زعفران). يزيل النجس الحسّي ولا يرفع الحدث.</p>
<p><strong>٣. نجس</strong> — ما وقعت فيه نجاسة فغيّرته (لوناً أو ريحاً أو طعماً)، أو كان قليلاً ووقعت فيه نجاسة ولو لم تتغيّر.</p>
<p>💡 والقاعدة الذهبية: <em>الماء طهور حتى تتيقّن من نجاسته.</em> والشكّ لا يُنجّسه.</p>`,
          `<p><strong>Tahur</strong> — pure and purifying: rain, river, sea, well, spring. <strong>Tahir</strong> — pure but not purifying: water changed by something clean (tea, soap). <strong>Najis</strong> — impure.</p>
<p>💡 Golden rule: water stays tahur until you are certain otherwise.</p>`),
      },
      {
        type: 'card',
        title: WDU('Agua usada (musta\'mal)', 'الماء المستعمل', 'Used water (musta\'mal)'),
        content: WDU(
          `<p>El agua que ya se usó para un fard (por ejemplo, la que cae de la cara al lavarla) es <strong>tahir</strong>: pura, pero no purifica.</p>
<p>Por eso no se recoge el agua que cae para volver a usarla en el wudu.</p>
<p>⚠️ Pero el agua que está en el recipiente y solo has metido la mano sigue siendo tahur — el mero contacto no la echa a perder.</p>
<p>💡 En la práctica: usa agua corriente o renueva el agua del recipiente; no recojas la que cae.</p>`,
          `<p>الماء المستعمل في فرض (كالماء الذي يسقط عن الوجه) <strong>طاهر غير مطهّر</strong>: لا يُتوضّأ به ثانياً.</p>
<p>ولذلك لا يُجمع الماء المتساقط لإعادة الوضوء به.</p>
<p>⚠️ أما الماء الذي في الإناء وقد غمس فيه يده فباقٍ على طهوريته؛ مجرّد اللمس لا يُخرجه عن الطهورية.</p>
<p>💡 عملياً: استعمل الماء الجاري أو جدّد ماء الإناء، ولا تجمع المتساقط.</p>`,
          `<p>Water already used for a fard is pure but not purifying — do not reuse it. Water still in the container after dipping a hand stays tahur.</p>`),
      },
      {
        type: 'card',
        title: WDU('Si el agua cambia por algo limpio', 'إذا تغيّر الماء بطاهر', 'If water changes through something clean'),
        content: WDU(
          `<p><strong>Poca agua</strong> (menos de dos qullas, unos 190 litros) + algo limpio que la cambia → deja de purificar: es tahir.</p>
<p><strong>Mucha agua</strong> (dos qullas o más) → sigue siendo tahur aunque cambie, siempre que no sea impureza.</p>
<p>Ejemplo práctico: un vaso de agua con una gota de jabón no vale para el wudu. Una piscina con jabón sigue valiendo.</p>
<p>📖 «Cuando el agua llega a dos qullas, no la vuelve impura nada» (Abu Dawud 63, sahih según algunos).</p>
<p>💡 Duda práctica: si el agua sabe o huele a algo añadido, no la uses para el wudu si tienes otra.</p>`,
          `<p><strong>الماء القليل</strong> (أقل من قُلّتين، نحو ١٩٠ لتراً) إذا خالطه طاهر فغيّره صار طاهراً غير مطهّر.</p>
<p><strong>الماء الكثير</strong> (قُلّتان فأكثر) يبقى طهوراً وإن تغيّر بطاهر، ما لم تكن نجاسة.</p>
<p>مثال: كوب ماء فيه قطرة صابون لا يصلح للوضوء، وحوض سباحة فيه صابون يصلح.</p>
<p>📖 «إذا بلغ الماء قُلّتين لم يحمل الخبث» (أبو داود ٦٣).</p>
<p>💡 عملياً: إذا تغيّر طعم الماء أو ريحه بشيء مضاف فاستعمل غيره إن قدَرت.</p>`,
          `<p>Little water changed by something clean stops purifying; plenty of water (two qullas ≈ 190 L) stays tahur.</p>`),
      },
      {
        type: 'card',
        title: WDU('No derrochar: la advertencia', 'الإسراف في الماء', 'Do not waste water'),
        content: WDU(
          `<p>El Profeta ﷺ pasó junto a Sa\'d, que hacía wudu, y le dijo: <strong>«¿Qué derroche es este?»</strong> Sa\'d preguntó: «¿Hay derroche en el wudu?» Y respondió: <strong>«Sí, aunque estés junto a un río caudaloso.»</strong> (Ibn Majah 425, hasan)</p>
<p>El Profeta ﷺ hacía wudu con un <em>mudd</em> (unos 0,5 litros) y ghusl con un <em>sa\'</em> (unos 2 litros).</p>
<p><strong>En casa:</strong> cierra el grifo entre paso y paso, no dejes correr el agua mientras te enjabonas las manos, y usa un recipiente pequeño si puedes.</p>
<p>💡 El derroche no invalida el wudu, pero es un defecto en la adoración — y en muchos países es además una necesidad de otros.</p>`,
          `<p>مرّ النبي ﷺ بسعدٍ وهو يتوضّأ فقال: <strong>«ما هذا السرف؟»</strong> فقال: أفي الوضوء سرف؟ قال: <strong>«نعم، وإن كنت على نهرٍ جارٍ»</strong> (ابن ماجه ٤٢٥، حسن).</p>
<p>وكان ﷺ يتوضّأ بالمُدّ (نحو نصف لتر) ويغتسل بالصاع (نحو لترين).</p>
<p><strong>في البيت:</strong> أغلق الصنبور بين الأعضاء، ولا تدع الماء يجري أثناء غسل اليدين، واستعمل إناءً صغيراً إن أمكن.</p>
<p>💡 الإسراف لا يُبطل الوضوء، لكنه نقص في العبادة، وفي كثير من البلاد هو اعتداء على حاجة غيرك.</p>`,
          `<p>«Is there waste in wudu?» — «Yes, even beside a flowing river» (Ibn Majah 425). The Prophet ﷺ used about half a litre for wudu.</p>`),
      },
      {
        type: 'card',
        title: WDU('Aguas especiales', 'مياه خاصة', 'Special waters'),
        content: WDU(
          `<p><strong>Agua de mar:</strong> tahur. El Profeta ﷺ dijo: «Su agua es pura y sus muertos son lícitos» (Abu Dawud 83).</p>
<p><strong>Agua de Zamzam:</strong> tahur, sirve para el wudu y para beber.</p>
<p><strong>Agua calentada por el sol:</strong> tahur; se dijo que es desaconsejada por temor a daño en la piel, no por impureza.</p>
<p><strong>Agua destilada o tratada:</strong> tahur mientras conserve su naturaleza de agua.</p>
<p><strong>Nieve y granizo:</strong> tahur si se derriten.</p>
<p><strong>Agua con cloro:</strong> si el olor es leve y sigue siendo agua, es tahur; si se ha convertido en otra cosa, no.</p>`,
          `<p><strong>ماء البحر:</strong> طهور؛ قال ﷺ: «هو الطهور ماؤه، الحلّ ميتته» (أبو داود ٨٣).</p>
<p><strong>ماء زمزم:</strong> طهور يُتوضّأ به ويُشرب.</p>
<p><strong>الماء المسخّن بالشمس:</strong> طهور؛ وكُرِه عند بعضهم خوف الضرر لا للنجاسة.</p>
<p><strong>الماء المقطّر أو المعالج:</strong> طهور ما دام باقياً على طبيعة الماء.</p>
<p><strong>الثلج والبَرَد:</strong> طهور إذا ذابا.</p>
<p><strong>الماء المكلور:</strong> إن كان تغيّره يسيراً وبقي ماءً فهو طهور، وإن تحوّل إلى مادة أخرى فلا.</p>`,
          `<p>Sea water is tahur («its water is pure», Abu Dawud 83), as are Zamzam, melted snow, distilled and lightly chlorinated water.</p>`),
      },
      {
        type: 'card',
        title: WDU('La duda sobre el agua', 'الشكّ في الماء', 'Doubting the water'),
        content: WDU(
          `<p><strong>Regla:</strong> la certeza no se anula por la duda. Si el agua estaba pura y dudas si se ha vuelto impura, sigue siendo pura.</p>
<p>Si la ves claramente cambiada (color, olor, sabor) → no la uses.</p>
<p>Si dudas de si tocó una impureza pero no ves cambio → es pura.</p>
<p>📖 El Profeta ﷺ dijo sobre el agua del desierto: «El agua es pura, nada la vuelve impura» — y sobre la duda en el wudu: «No salgas hasta que oigas un sonido o percibas un olor» (Muslim 361).</p>
<p>💡 Este principio cura el waswas: no investigues, no busques pruebas. Lo que ves es lo que hay.</p>`,
          `<p><strong>القاعدة:</strong> اليقين لا يزول بالشكّ. فإذا كان الماء طاهراً وشككت في نجاسته فهو طاهر.</p>
<p>وإن رأيته متغيّراً بيّناً (لوناً أو ريحاً أو طعماً) فلا تستعمله.</p>
<p>وإن شككت في ملاقاته نجاسة دون تغيّر فهو طهور.</p>
<p>📖 وقال ﷺ في ماء البادية: «الماء طهور لا ينجّسه شيء»، وقال في الشكّ: «فلا يخرجنّ حتى يسمع صوتاً أو يجد ريحاً» (مسلم ٣٦١).</p>
<p>💡 هذا الأصل يُعالج الوسوسة: لا تفتّش ولا تطلب دليلاً؛ الظاهر هو الحكم.</p>`,
          `<p>Certainty is not removed by doubt: water that was pure stays pure unless you clearly see a change.</p>`),
      },
      { type: 'quiz', question_es: '¿Con qué agua NO es válido el wudu?',
        question_ar: 'أيّ ماء لا يصحّ الوضوء به؟',
        question_en: 'Which water does NOT make a valid wudu?',
        options_es: ['Agua de mar', 'Agua de Zamzam', 'Agua con jabón que cambió su naturaleza', 'Agua de lluvia'],
        options_ar: ['ماء البحر', 'ماء زمزم', 'ماء خالطه صابون فغيّره', 'ماء المطر'],
        options_en: ['Sea water', 'Zamzam water', 'Water changed by soap', 'Rain water'],
        correct: 2,
        explanation_es: 'Cambió por algo limpio y era poca: es tahir, purifica la suciedad pero no levanta el hadaz.',
        explanation_en: 'Changed by something clean in small quantity: pure but not purifying.' },
      { type: 'quiz', question_es: '¿Qué dijo el Profeta ﷺ sobre derrochar agua en el wudu?',
        question_ar: 'ماذا قال النبي ﷺ في الإسراف في ماء الوضوء؟',
        question_en: 'What did the Prophet ﷺ say about wasting wudu water?',
        options_es: ['Que es preferible', 'Que está permitido si hay mucho', 'Que es derroche aunque estés junto a un río', 'Que solo importa en verano'],
        options_ar: ['أنه أفضل', 'أنه جائز إذا كثُر الماء', 'أنه سرف ولو على نهر جارٍ', 'أنه لا يهمّ إلا في الصيف'],
        options_en: ['It is preferable', 'Allowed if water is plentiful', 'It is waste even beside a river', 'Only matters in summer'],
        correct: 2,
        explanation_es: 'Ibn Majah 425: «Sí, aunque estés junto a un río caudaloso».',
        explanation_en: 'Ibn Majah 425: «Yes, even beside a flowing river».' },
    ],
  },
  // ================= 6. KHUFFS Y YABIRA =================
  khuff: {
    id: 'wudu_khuff',
    icon: '<i class="fas fa-shoe-prints"></i>',
    title: WDU('Mas-h sobre calcetines y vendas', 'المسح على الخفّين والجبيرة', 'Wiping over socks and bandages'),
    mascotIntro: WDU('En invierno, o cuando estás fuera de casa, no tienes que lavarte los pies: basta pasar la mano.',
      'في الشتاء أو حين تكون خارج البيت لا يلزمك غسل الرجلين: يكفي المسح.',
      'In winter, or when you are out, you do not have to wash your feet: wiping is enough.'),
    lessons: [
      {
        type: 'card',
        title: WDU('Está legislado (y es una facilidad)', 'مشروعية المسح', 'It is legislated — a facilitation'),
        content: WDU(
          `<p>Allah dice: «…y pasad las manos por la cabeza y por los pies» (Al-Ma\'idah 5:6), y en la lectura de Ibn Kathir y otros: «…y por vuestros pies», con mas-h.</p>
<p>El Profeta ﷺ lo practicó muchas veces. Mughira ibn Shu\'ba dijo: «Estaba con el Profeta ﷺ en un viaje; le acerqué el agua para el wudu, se lavó, pasó la mano por sus khuffs y rezó» (Bujari 203, Muslim 274).</p>
<p>Fue una de las cosas que más sorprendió a los que venían de lejos: «¿Cómo te ordena tu Profeta que hagas esto?» — y el compañero respondía: «Sí, nos ordenó el mas-h sobre los calcetines y el tocar la tierra si no encontramos agua.»</p>`,
          `<p>قال تعالى: ﴿وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ﴾ وفي قراءة ابن كثير وغيره «وأرجلكم» بالجرّ، أي بالمسح.</p>
<p>وقد فعله النبي ﷺ مراراً. قال المغيرة بن شعبة: «كنت مع النبي ﷺ في سفر، فأدنيته الوضوء فتوضّأ ومسح على خفّيه وصلّى» (البخاري ٢٠٣، مسلم ٢٧٤).</p>
<p>وكان من أعجب ما سأل عنه وفد من الدهاقين: «كيف تأمرك نبيّك بهذا؟» فيقول الصحابي: «نعم، أمرنا بالمسح على الجوارب وإتيان الأرض إذا لم نجد الماء».</p>`,
          `<p>Quran 5:6 and the practice of the Prophet ﷺ (Bukhari 203, Muslim 274). A granted facilitation, not a shortcut.</p>`),
      },
      {
        type: 'card',
        title: WDU('Las 4 condiciones del mas-h', 'شروط المسح', 'The 4 conditions'),
        content: WDU(
          `<p><strong>1. Ponértelos estando en estado de wudu.</strong> Si te los pones sin wudu previo, no se puede pasar la mano.</p>
<p><strong>2. Que cubran lo obligatorio</strong> — hasta el tobillo, incluido.</p>
<p><strong>3. Que sean tahir</strong> (limpios, no tocados por impureza).</p>
<p><strong>4. Que sean lícitos</strong> y de un material admitido (cuero, lana, algodón… no seda para el hombre, no membrana fina).</p>
<p>💡 El punto que más falla: <em>ponértelos estando puro</em>. Revisa: ¿tenía wudu cuando me los calcé? Si la respuesta es no, quítatelos y lava los pies esta vez.</p>`,
          `<p><strong>١. أن تلبسهما على طهارة كاملة.</strong> فإن لبستهما على غير وضوء لم يجز المسح.</p>
<p><strong>٢. أن يسترا محلّ الفرض</strong> — إلى الكعبين داخلين.</p>
<p><strong>٣. أن يكونا طاهرين</strong> لم تصبهما نجاسة.</p>
<p><strong>٤. أن يكونا مباحين</strong> ومن مادة معتبرة (جلد أو صوف أو قطن… لا حرير للرجل، ولا جورب شفاف).</p>
<p>💡 وأكثر ما يُخطأ فيه: <em>لبسهما على طهارة</em>. اسأل نفسك: هل كنت على وضوء حين لبستهما؟ فإن كان الجواب لا فاخلعهما واغسل رجليك هذه المرة.</p>`,
          `<p>Four: put on while in wudu, cover to the ankle, be pure, be lawful material. The most failed one is the first.</p>`),
      },
      {
        type: 'card',
        title: WDU('La duración', 'مدّة المسح', 'How long it lasts'),
        content: WDU(
          `<p><strong>Residente: un día y una noche (24 h).</strong><br>
<strong>Viajero: tres días y tres noches (72 h).</strong></p>
<p>📖 «El Profeta ﷺ fijó tres días y sus noches para el viajero, y un día y una noche para el residente» (Muslim 276).</p>
<p><strong>¿Desde cuándo se cuenta?</strong> Desde el <em>primer wudu roto después de ponértelos</em>, no desde el momento de ponerlos. Es la opinión más fuerte.</p>
<p>Ejemplo: te los pones el lunes a las 7 con wudu; rompes el wudu el martes a las 10. La cuenta empieza el martes a las 10 y termina el miércoles a las 10.</p>
<p>💡 Al terminar el plazo, debes quitártelos y lavar los pies por completo.</p>`,
          `<p><strong>المقيم: يوم وليلة (٢٤ ساعة).</strong><br>
<strong>المسافر: ثلاثة أيام بلياليهنّ (٧٢ ساعة).</strong></p>
<p>📖 «جعل النبي ﷺ للمسافر ثلاثة أيام ولياليهنّ، وللمقيم يوماً وليلة» (مسلم ٢٧٦).</p>
<p><strong>من أين تُحسب؟</strong> من <em>أوّل حدث بعد اللبس</em>، لا من لحظة اللبس. وهو أقوى الأقوال.</p>
<p>مثال: لبستهما الاثنين السابعة على وضوء، ثم انتقض وضوؤك الثلاثاء العاشرة. تبدأ المدّة الثلاثاء العاشرة وتنتهي الأربعاء العاشرة.</p>
<p>💡 وبانتهاء المدّة تخلعهما وتغسل الرجلين كاملتين.</p>`,
          `<p>Resident: 24 h. Traveller: 72 h — counted from the first broken wudu after putting them on, not from the moment of wearing.</p>`),
      },
      {
        type: 'card',
        title: WDU('Cómo se hace', 'صفة المسح', 'How to wipe'),
        content: WDU(
          `<p>Con la mano derecha mojada, pasa los dedos por <strong>la parte superior</strong> del calcetín derecho, desde la punta de los dedos hacia la pierna, <strong>una sola vez</strong>. Luego lo mismo con la izquierda.</p>
<p>❌ No se pasa por debajo del pie ni por el talón.</p>
<p>❌ No se repite tres veces como el lavado: es mas-h, una vez.</p>
<p>💡 Se puede hacer con una mano o con las dos; lo importante es que el agua llegue a la superficie superior del calcetín.</p>
<p>⚠️ El mas-h no necesita agua nueva: vale con la humedad que queda en la mano tras lavarte la cara y los brazos.</p>`,
          `<p>بيده اليمنى المبلولة يمرّ أصابعه على <strong>أعلى</strong> الخفّ الأيمن من أطراف الأصابع إلى الساق، <strong>مرة واحدة</strong>، ثم كذلك اليسرى.</p>
<p>❌ لا يمسح أسفل القدم ولا العقب.</p>
<p>❌ ولا يكرّره ثلاثاً كالغسل؛ هو مسح مرة واحدة.</p>
<p>💡 ويجوز بيد واحدة أو بيدين، والمقصود وصول الماء إلى ظاهر الخف.</p>
<p>⚠️ ولا يحتاج ماءً جديداً: تكفي النداوة الباقية في اليد بعد غسل الوجه والذراعين.</p>`,
          `<p>Wet right hand over the <strong>top</strong> of the right sock, toes to shin, once. Never underneath. Never three times.</p>`),
      },
      {
        type: 'card',
        title: WDU('Qué anula el mas-h', 'ما يبطل المسح', 'What cancels it'),
        content: WDU(
          `<p><strong>1. El plazo:</strong> al cumplirse 24 h (residente) o 72 h (viajero).</p>
<p><strong>2. La janaba</strong> (relación, eyaculación, menstruación, puerperio): hay que quitárselos y hacer ghusl completo. El mas-h no sustituye al ghusl.</p>
<p><strong>3. Quitártelos</strong> después de haber pasado la mano: según la mayoría hay que lavar los pies de nuevo antes de rezar.</p>
<p><strong>4. La impureza</strong> que llega al calcetín.</p>
<p>💡 Si te los quitas y luego te los vuelves a poner, la cuenta se reinicia — pero solo si te los pones <em>con wudu completo y con los pies lavados</em>.</p>`,
          `<p><strong>١. انتهاء المدّة:</strong> ٢٤ ساعة للمقيم و٧٢ للمسافر.</p>
<p><strong>٢. الجنابة</strong> (جماع، إنزال، حيض، نفاس): يجب الخلع والغسل الكامل، والمسح لا يقوم مقام الغسل.</p>
<p><strong>٣. الخلع</strong> بعد المسح: على الجمهور يغسل رجليه قبل الصلاة.</p>
<p><strong>٤. النجاسة</strong> التي تصيب الخفّ.</p>
<p>💡 فإن خلعتهما ثم لبستهما من جديد استأنفت المدّة، لكن بشرط لبسهما على <em>وضوء كامل ورجلين مغسولتين</em>.</p>`,
          `<p>End of the term, janaba (must remove and do ghusl), removing them after wiping, or impurity reaching them.</p>`),
      },
      {
        type: 'card',
        title: WDU('La venda (yabira)', 'الجبيرة', 'The bandage (jabira)'),
        content: WDU(
          `<p>Si tienes una herida cubierta con venda, escayola o apósito, y no puedes lavar la zona:</p>
<p><strong>1.</strong> Lava lo que está descubierto y sano.<br>
<strong>2.</strong> Pasa la mano mojada por encima de la venda, sin quitarla.<br>
<strong>3.</strong> No hay plazo de tiempo: se hace mientras dure la necesidad.</p>
<p>📖 Se narró que el Profeta ﷺ dijo a un hombre con una herida en la cabeza: «Lávate el resto y pasa la mano por la venda» (Abu Dawud 336, con debilidad en su cadena, pero es la base de la práctica).</p>
<p>⚠️ Si quitar la venda daña la piel, no se quita — el daño se evita y la religión es facilidad.</p>`,
          `<p>إذا كان بك جرح مغطّى بجبيرة أو لاصق طبي وعجزت عن غسل الموضع:</p>
<p><strong>١.</strong> اغسل ما حوله من الصحيح.<br>
<strong>٢.</strong> امسح على الجبيرة بيد مبلولة دون نزعها.<br>
<strong>٣.</strong> ولا وقت محدّد لها؛ تُمسح ما دامت الحاجة.</p>
<p>📖 وروي أن النبي ﷺ قال لرجل أصابه جرح في رأسه: «اغسل ما حوله وامسح على الجبيرة» (أبو داود ٣٣٦، وفي إسناده ضعف، وهو مستند العمل).</p>
<p>⚠️ وإن كان نزعها يضرّ فلا تُنزع؛ فدفع الضرر مقدّم، والدين يسر.</p>`,
          `<p>Wash the healthy skin around it and wipe over the bandage without removing it, for as long as needed.</p>`),
      },
      {
        type: 'card',
        title: WDU('Socks that do not count', 'الجوارب التي لا يُمسح عليها', 'Socks that do not count'),
        content: WDU(
          `<p>❌ <strong>Calcetín transparente</strong> que deja ver el color de la piel: no cubre, no vale.</p>
<p>❌ <strong>Calcetín con agujeros grandes</strong> que muestran parte del pie: si lo que se ve es amplio, no vale; si es mínimo, hay diferencia entre escuelas.</p>
<p>❌ <strong>Media muy fina de nylon</strong> que se pega a la piel: no cubre de forma que permita el mas-h según la mayoría.</p>
<p>✅ <strong>Calcetín grueso opaco</strong>, aunque sea de algodón: vale.</p>
<p>✅ <strong>Bota, zapato cerrado de cuero, polaina</strong>: valen si cubren el tobillo.</p>
<p>💡 Regla simple: si el agua <em>no</em> llegaría a la piel por sí sola, el calcetín no cubre — entonces no se pasa la mano.</p>`,
          `<p>❌ <strong>الجورب الشفاف</strong> الذي يُرى منه لون البشرة: لا يستر فلا يصحّ المسح عليه.</p>
<p>❌ <strong>الجورب المخرّق</strong> خروقاً كبيرة تُبدي بعض القدم: لا يصحّ إن كان الظاهر كثيراً، ويختلفون في اليسير.</p>
<p>❌ <strong>الجورب النايلون الرقيق</strong> الملتصق بالجلد: لا يستر ستراً معتبراً عند الجمهور.</p>
<p>✅ <strong>الجورب السميك غير الشفاف</strong> ولو كان قطنياً: يصحّ.</p>
<p>✅ <strong>الخفّ والحذاء الجلدي المغلق</strong>: يصحّ إن ستر الكعب.</p>
<p>💡 قاعدة بسيطة: إن كان الماء <em>لا</em> يصل إلى البشرة لولا الجورب فهو ساتر؛ وإن كان يصل فليس بساتر.</p>`,
          `<p>Transparent or badly holed socks do not cover, so no wiping. Thick opaque cotton socks and leather boots do.</p>`),
      },
      { type: 'quiz', question_es: '¿Cuánto dura el mas-h para un viajero?',
        question_ar: 'كم مدّة المسح للمسافر؟',
        question_en: 'How long may a traveller wipe over socks?',
        options_es: ['24 horas', '48 horas', '72 horas (3 días y sus noches)', 'Sin límite mientras viaje'],
        options_ar: ['٢٤ ساعة', '٤٨ ساعة', '٧٢ ساعة (ثلاثة أيام بلياليهنّ)', 'بلا حدّ ما دام مسافراً'],
        options_en: ['24 hours', '48 hours', '72 hours (3 days and nights)', 'No limit while travelling'],
        correct: 2, explanation_es: 'Muslim 276: tres días y sus noches para el viajero, un día y una noche para el residente.',
        explanation_en: 'Muslim 276: three days and nights for the traveller.' },
      { type: 'quiz', question_es: '¿Desde cuándo se cuenta el plazo del mas-h?',
        question_ar: 'من متى تُحسب مدّة المسح؟',
        question_en: 'When does the wiping period start?',
        options_es: ['Desde que te los pones', 'Desde el primer wudu roto tras ponértelos', 'Desde la primera oración', 'Desde la mañana siguiente'],
        options_ar: ['من لحظة اللبس', 'من أوّل حدث بعد اللبس', 'من أوّل صلاة', 'من صباح اليوم التالي'],
        options_en: ['From putting them on', 'From the first broken wudu after putting them on', 'From the first prayer', 'From next morning'],
        correct: 1, explanation_es: 'Se cuenta desde el primer hadaz posterior a ponértelos con wudu.',
        explanation_en: 'From the first hadath after putting them on in wudu.' },
    ],
  },

  // ================= 7. TAYAMMUM =================
  tayammum: {
    id: 'wudu_tayammum',
    icon: '<i class="fas fa-mountain-sun"></i>',
    title: WDU('Tayammum: pureza con tierra', 'التيمّم', 'Tayammum: purity with earth'),
    mascotIntro: WDU('Si no hay agua, o el agua te daña, Allah no te deja sin salida: te abre la tierra.',
      'إن لم تجد الماء أو كان يضرّك لم يتركك الله بلا مخرج: فتح لك الأرض.',
      'If there is no water, or water harms you, Allah leaves you a way: the earth.'),
    lessons: [
      {
        type: 'card',
        title: WDU('Su base en el Corán', 'مشروعيته', 'Its Quranic basis'),
        content: WDU(
          `<p>Allah dice: «Oh creyentes, cuando os dispongáis a rezar, lavaos la cara y las manos hasta los codos, pasad las manos por la cabeza y lavaos los pies hasta los tobillos… <strong>Y si estáis enfermos o de viaje, o uno de vosotros viene de hacer sus necesidades, o habéis tocado a las mujeres y no encontráis agua, recurrid a tierra limpia y pasad las manos por vuestros rostros y manos</strong>» (Al-Ma\'idah 5:6).</p>
<p>El Profeta ﷺ dijo: «Me fue dada la tierra como mezquita y como purificadora» (Bujari 335).</p>
<p>💡 Observa: la alternativa no es un castigo, es una extensión de la misma misericordia.</p>`,
          `<p>قال تعالى: ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ… <strong>وَإِنْ كُنْتُمْ مَرْضَى أَوْ عَلَى سَفَرٍ أَوْ جَاءَ أَحَدٌ مِنْكُمْ مِنَ الْغَائِطِ أَوْ لَامَسْتُمُ النِّسَاءَ فَلَمْ تَجِدُوا مَاءً فَتَيَمَّمُوا صَعِيداً طَيِّباً فَامْسَحُوا بِوُجُوهِكُمْ وَأَيْدِيكُمْ</strong>﴾ (المائدة ٦).</p>
<p>وقال ﷺ: «وجُعلت لي الأرض مسجداً وطهوراً» (البخاري ٣٣٥).</p>
<p>💡 وتأمّل: البديل ليس عقوبة، بل امتداد للرحمة نفسها.</p>`,
          `<p>Quran 5:6 and «the earth has been made for me a place of prayer and purification» (Bukhari 335).</p>`),
      },
      {
        type: 'card',
        title: WDU('Cuándo se permite', 'متى يجوز التيمّم', 'When it is allowed'),
        content: WDU(
          `<p><strong>1. No hay agua</strong> — ni cerca, ni accesible, ni en cantidad suficiente.</p>
<p><strong>2. Enfermedad</strong> en la que el agua empeora la condición, o retrasa la curación.</p>
<p><strong>3. Frío extremo</strong> sin medios para calentar el agua y con riesgo de daño.</p>
<p><strong>4. El agua es necesaria para beber</strong> — para ti o para quien está contigo, o para un animal que cuidas.</p>
<p><strong>5. El agua está en un lugar inaccesible</strong> o es propiedad de otro que no la permite.</p>
<p><strong>6. Miedo</strong> a perder la oración por buscar agua.</p>
<p>⚠️ Si puedes conseguir agua con un esfuerzo razonable (un grifo cercano, comprar una botella), no hay tayammum: hay que buscarla.</p>`,
          `<p><strong>١. فقدان الماء</strong> — لا قريباً ولا مبذولاً ولا بكفاية.</p>
<p><strong>٢. المرض</strong> الذي يزيده الماء أو يؤخّر الشفاء.</p>
<p><strong>٣. البرد الشديد</strong> مع تعذّر التسخين وخشية الضرر.</p>
<p><strong>٤. احتياج الماء للشرب</strong> لك أو لمن معك أو لبهيمة ترعاها.</p>
<p><strong>٥. تعذّر الوصول إلى الماء</strong> أو كونه ملكاً لغيره لا يبذله.</p>
<p><strong>٦. خوف فوات الصلاة</strong> بسبب طلب الماء.</p>
<p>⚠️ فإن أمكن تحصيل الماء بجهد معتاد (صنبور قريب، شراء قارورة) فلا تيمّم، بل يجب الطلب.</p>`,
          `<p>No water; illness harmed by water; extreme cold; water needed for drinking; water unreachable; fear of missing the prayer.</p>`),
      },
      {
        type: 'card',
        title: WDU('¿Con qué se hace?', 'الصعيد الطاهر', 'What may be used'),
        content: WDU(
          `<p><strong>Sa\'id tayyib</strong>: tierra limpia, y por extensión todo lo que es de la tierra y no se ha cocido ni transformado: arena, piedra, cal, yeso, mármol, polvo.</p>
<p>✅ Vale la tierra del desierto, la arena de la playa, la piedra lisa.</p>
<p>❌ No vale la ceniza ni el carbón según la mayoría (no son de la tierra).</p>
<p>❌ No vale una pared pintada con pintura que la aísla del material original — aunque hay quien lo permite por necesidad.</p>
<p>💡 Si hay polvo en una superficie, basta con poner la palma y golpearla suavemente.</p>`,
          `<p><strong>الصعيد الطيّب</strong>: التراب الطاهر، ويلحق به كل ما هو من جنس الأرض ولم يُطبخ ولم يتحوّل: الرمل والحجر والجصّ والكلس والرخام والغبار.</p>
<p>✅ تصحّ تربة الصحراء، ورمل الشاطئ، والحجر الأملس.</p>
<p>❌ ولا يصحّ الرماد والفحم على قول الجمهور (ليسا من جنس الأرض).</p>
<p>❌ ولا يصحّ الحائط المطليّ بطلاء يعزل مادته الأصلية — وإن أجازه بعضهم للحاجة.</p>
<p>💡 فإن كان على السطح غبار كفاه أن يضع كفّه ويضربها ضرباً خفيفاً.</p>`,
          `<p>Clean earth and anything of its kind that is not fired or transformed: sand, stone, plaster, marble, dust.</p>`),
      },
      {
        type: 'card',
        title: WDU('Cómo se hace, paso a paso', 'كيفية التيمّم', 'How to do it, step by step'),
        content: WDU(
          `<p><strong>1.</strong> Intención en el corazón.<br>
<strong>2.</strong> Di «Bismillah».<br>
<strong>3.</strong> Golpea la tierra limpia con <strong>las dos palmas</strong>, una sola vez.<br>
<strong>4.</strong> Sacude el exceso (sopla suavemente o junta las manos).<br>
<strong>5.</strong> Pasa las palmas por <strong>toda la cara</strong>, una vez.<br>
<strong>6.</strong> Pasa la palma izquierda por el dorso de la mano derecha hasta la muñeca, y la derecha por el dorso de la izquierda.</p>
<p>💡 Con esto quedas puro para rezar. No hace falta repetir para cada movimiento.</p>
<p>⚠️ Algunos añaden pasar las manos también por la palma; lo esencial es el dorso hasta la muñeca, como en el wudu.</p>`,
          `<p><strong>١.</strong> النية في القلب.<br>
<strong>٢.</strong> التسمية.<br>
<strong>٣.</strong> يضرب الصعيد الطاهر <strong>بكفّيه</strong> ضربة واحدة.<br>
<strong>٤.</strong> ينفض الزائد (ينفخ فيهما أو يضرب إحداهما بالأخرى).<br>
<strong>٥.</strong> يمسح <strong>وجهه كله</strong> بكفّيه مرة.<br>
<strong>٦.</strong> يمسح ظاهر كفّه اليمنى بباطن اليسرى إلى الرسغ، وظاهر اليسرى بباطن اليمنى.</p>
<p>💡 وبذلك تصير طاهراً للصلاة، ولا تحتاج إعادته لكل حركة.</p>
<p>⚠️ وزاد بعضهم مسح الكفّين من باطنهما أيضاً؛ والأصل مسح الظاهر إلى الرسغ كما في الوضوء.</p>`,
          `<p>Intention, Bismillah, strike both palms once on clean earth, shake off, wipe the whole face, then each hand to the wrist with the other palm.</p>`),
      },
      {
        type: 'card',
        title: WDU('Qué lo anula', 'ما يبطل التيمّم', 'What invalidates it'),
        content: WDU(
          `<p><strong>1.</strong> Todo lo que anula el wudu (orina, gases, sueño profundo…).</p>
<p><strong>2.</strong> <strong>Encontrar agua</strong> o poder usarla: el tayammum cae de inmediato.</p>
<p><strong>3.</strong> <strong>Desaparecer la excusa</strong>: si el enfermo sana, o el frío se va, o el agua vuelve a estar accesible.</p>
<p>⚠️ Si estás rezando y ves agua, ¿qué haces? Según la mayoría terminas la oración y no la repites; según otros la repites si el tiempo lo permite. Lo seguro: termina y, si el tiempo sigue abierto, repite.</p>
<p>💡 Si el tayammum era por no encontrar agua y la encuentras <em>después</em> de rezar, la oración ya está hecha y es válida.</p>`,
          `<p><strong>١.</strong> كل ما ينقض الوضوء (بول، ريح، نوم عميق…).</p>
<p><strong>٢.</strong> <strong>وجود الماء</strong> أو القدرة على استعماله: يبطل التيمّم فوراً.</p>
<p><strong>٣.</strong> <strong>زوال العذر</strong>: شفاء المريض، أو ذهاب البرد، أو تيسّر الماء.</p>
<p>⚠️ وإن كنت في الصلاة فرأيت الماء: على الجمهور تُتمّ ولا تعيد، وعند غيرهم تعيد إن بقي الوقت. والأحوط: أتمّ ثم أعد إن كان الوقت باقياً.</p>
<p>💡 وإن كان تيمّمك لفقد الماء ثم وجدته <em>بعد</em> الصلاة فصلاتك ماضية صحيحة.</p>`,
          `<p>Anything breaking wudu, finding water, or the excuse disappearing.</p>`),
      },
      {
        type: 'card',
        title: WDU('Dudas frecuentes', 'مسائل متكرّرة', 'Frequent questions'),
        content: WDU(
          `<p><strong>¿Un tayammum por cada oración?</strong> La escuela shafi\'i lo exige para cada fard; la hanafí y la hanbalí permiten rezar varios fards con uno mientras no se rompa.</p>
<p><strong>¿Puedo rezar sunnas y el Witr con el mismo?</strong> Sí, con el mismo tayammum con el que rezaste el fard, según la mayoría que lo permite.</p>
<p><strong>¿Y si el agua está muy fría pero puedo calentarla?</strong> Hay que calentarla; el tayammum es para quien no puede, no para quien no quiere.</p>
<p><strong>¿Y en el avión o el tren?</strong> Si hay aseo con agua y puedes usarlo sin daño, es wudu; si no, tayammum en tu asiento.</p>
<p>💡 Como ves: la pregunta correcta no es «¿me lo permite mi escuela?» sino «¿puedo usar agua sin daño?» — si puedes, usa agua.</p>`,
          `<p><strong>هل يُتيمّم لكل صلاة؟</strong> الشافعية يوجبون لِكلّ فرض، والحنفية والحنابلة يجيزون أداء فرائض بتيمّم واحد ما لم ينتقض.</p>
<p><strong>هل أصلي السنن والوتر به؟</strong> نعم، بتيمّم الفرض نفسه عند من يجيز ذلك، وهو قول الجمهور.</p>
<p><strong>وإن كان الماء بارداً ويمكن تسخينه؟</strong> يجب التسخين؛ فالتيمّم لمن عجز لا لمن تَرَك.</p>
<p><strong>وفي الطائرة والقطار؟</strong> إن وُجد ماء أمكن استعماله بلا ضرر فهو وضوء، وإلا فتيمّم في مقعدك.</p>
<p>💡 فالسؤال الصحيح ليس «هل يجيزه مذهبي؟» بل «هل أستطيع استعمال الماء بلا ضرر؟» فإن قدرت فاستعمله.</p>`,
          `<p>One tayammum per fard (Shafi'i) or several prayers with one (Hanafi/Hanbali); sunnahs may follow; warm the water if you can.</p>`),
      },
      { type: 'quiz', question_es: '¿Sobre qué se pasa la mano en el tayammum?',
        question_ar: 'علامَ يُمسح في التيمّم؟',
        question_en: 'What do you wipe in tayammum?',
        options_es: ['Todo el cuerpo', 'La cara y las manos', 'Solo la cara', 'La cabeza y los pies'],
        options_ar: ['البدن كله', 'الوجه والكفّان', 'الوجه فقط', 'الرأس والرجلان'],
        options_en: ['The whole body', 'The face and the hands', 'Only the face', 'Head and feet'],
        correct: 1, explanation_es: 'Al-Ma\'idah 5:6: «pasad las manos por vuestros rostros y manos».',
        explanation_en: 'Quran 5:6: face and hands.' },
      { type: 'quiz', question_es: 'Encuentras agua después de haber rezado con tayammum. ¿Qué haces?',
        question_ar: 'وجدت الماء بعد أن صلّيت بالتيمّم. ماذا تفعل؟',
        question_en: 'You find water after praying with tayammum. What now?',
        options_es: ['Repites siempre la oración', 'No la repites: ya fue válida', 'Haces ghusl y nada más', 'Debes repetir todas las del día'],
        options_ar: ['تعيد الصلاة دائماً', 'لا تعيد، فقد صحّت', 'تغتسل فقط', 'تعيد صلوات اليوم كلها'],
        options_en: ['Always repeat it', 'Do not repeat — it was valid', 'Do ghusl only', 'Repeat all prayers of the day'],
        correct: 1, explanation_es: 'El tayammum fue válido en su momento; encontrar agua después no anula la oración hecha.',
        explanation_en: 'The tayammum was valid when performed; later water does not undo the prayer.' },
    ],
  },
  // ================= 8. GHUSL =================
  ghusl: {
    id: 'wudu_ghusl',
    icon: '<i class="fas fa-shower"></i>',
    title: WDU('Ghusl: la purificación mayor', 'الغُسل', 'Ghusl: major purification'),
    mascotIntro: WDU('El wudu limpia lo pequeño; el ghusl lava todo el cuerpo. Aquí están sus causas y su forma.',
      'الوضوء يرفع الحدث الأصغر، والغسل يطهّر البدن كله. هذه أسبابه وصفتُه.',
      'Wudu cleans the minor; ghusl washes the whole body. Here are its causes and its form.'),
    lessons: [
      {
        type: 'card',
        title: WDU('Las 6 causas del ghusl', 'موجبات الغسل', 'The 6 causes of ghusl'),
        content: WDU(
          `<p><strong>1.</strong> La eyaculación (con deseo, dormido o despierto).<br>
<strong>2.</strong> La relación conyugal, aunque no haya eyaculación.<br>
<strong>3.</strong> El fin de la menstruación (hayd).<br>
<strong>4.</strong> El fin del puerperio (nifas) tras el parto.<br>
<strong>5.</strong> La muerte — se lava al difunto, salvo el mártir de batalla.<br>
<strong>6.</strong> La entrada en el Islam, según algunas escuelas.</p>
<p>⚠️ Sin uno de estos, no hace falta ghusl: ducharse por calor o limpieza es bueno, pero no sustituye ni es exigido.</p>`,
          `<p><strong>١.</strong> خروج المنيّ (بشهوة، في النوم أو اليقظة).<br>
<strong>٢.</strong> الجماع ولو بلا إنزال.<br>
<strong>٣.</strong> انقطاع الحيض.<br>
<strong>٤.</strong> انقطاع النفاس بعد الولادة.<br>
<strong>٥.</strong> الموت — يُغسّل الميت، إلا الشهيد في المعركة.<br>
<strong>٦.</strong> الإسلام عند بعض المذاهب.</p>
<p>⚠️ وبدون سبب من هذه لا يجب الغسل؛ والاغتسال للنظافة أو للتبرّد حسن، لكنه ليس واجباً ولا بديلاً عن الوضوء.</p>`,
          `<p>Ejaculation, intercourse, end of menstruation, end of post-natal bleeding, death, and — per some schools — entering Islam.</p>`),
      },
      {
        type: 'card',
        title: WDU('Sus 3 fards', 'فرائض الغسل', 'Its 3 fards'),
        content: WDU(
          `<p><strong>1. La intención</strong> en el corazón al empezar.</p>
<p><strong>2. Que el agua llegue a todo el cuerpo</strong> — piel, raíces del cabello, detrás de las orejas, el ombligo, entre los dedos, debajo de las uñas. Sin dejar ni un punto seco.</p>
<p><strong>3. Quitar la impureza</strong> si hay algo en el cuerpo.</p>
<p>Según la escuela shafi\'i, la boca y la nariz entran en «todo el cuerpo»; según otros son sunna.</p>
<p>💡 Lo que más se olvida: el cabello recogido sin que llegue el agua a su raíz, el lóbulo de la oreja, y el hueco del ombligo.</p>`,
          `<p><strong>١. النية</strong> في القلب عند الشروع.</p>
<p><strong>٢. تعميم البدن بالماء</strong> — البشرة وأصول الشعر، وما خلف الأذنين، والسرّة، وما بين الأصابع، وتحت الأظافر، دون ترك نقطة يابسة.</p>
<p><strong>٣. إزالة النجاسة</strong> إن كانت على البدن.</p>
<p>وعند الشافعية أن الفم والأنف داخلان في «البدن»، وعند غيرهم هما سنة.</p>
<p>💡 وأكثر ما يُغفل: الشعر المعقود دون وصول الماء إلى أصله، وشحمة الأذن، وتجويف السرّة.</p>`,
          `<p>Intention, water reaching the entire body (including hair roots), and removing impurity if present.</p>`),
      },
      {
        type: 'card',
        title: WDU('Cómo lo hacía el Profeta ﷺ', 'صفة غسل النبي ﷺ', 'How the Prophet ﷺ did it'),
        content: WDU(
          `<p>Según Aisha (que Allah esté complacido con ella), el Profeta ﷺ hacía así (Bujari 248, Muslim 316):</p>
<p><strong>1.</strong> Se lavaba las manos.<br>
<strong>2.</strong> Se lavaba la zona íntima y lo que hubiera de impureza.<br>
<strong>3.</strong> Hacía el wudu completo como para la oración.<br>
<strong>4.</strong> Metía los dedos en el agua y frotaba la raíz del cabello.<br>
<strong>5.</strong> Se echaba agua sobre la cabeza tres veces con las dos manos.<br>
<strong>6.</strong> Se lavaba todo el cuerpo.<br>
<strong>7.</strong> Se lavaba los pies, apartándose del lugar.</p>
<p>💡 Fíjate en el orden: primero quita la impureza, luego el wudu, luego el cuerpo. Así el agua no se contamina.</p>`,
          `<p>عن عائشة رضي الله عنها أن النبي ﷺ كان يغتسل هكذا (البخاري ٢٤٨، مسلم ٣١٦):</p>
<p><strong>١.</strong> يغسل يديه.<br>
<strong>٢.</strong> يغسل فرجه وما أصابه من أذى.<br>
<strong>٣.</strong> يتوضّأ وضوءه للصلاة.<br>
<strong>٤.</strong> يُدخل أصابعه في الماء فيخلّل أصول شعره.<br>
<strong>٥.</strong> يحفن على رأسه ثلاث حثيات بيديه.<br>
<strong>٦.</strong> يغسل سائر بدنه.<br>
<strong>٧.</strong> يغسل رجليه متنحّياً عن موضعه.</p>
<p>💡 وتأمّل الترتيب: النجاسة أولاً، ثم الوضوء، ثم البدن؛ حتى لا يتلوّث الماء.</p>`,
          `<p>Hands, private area, full wudu, water into the hair roots three times, then the whole body, then the feet aside (Bukhari 248).</p>`),
      },
      {
        type: 'card',
        title: WDU('El ghusl de la mujer', 'غسل المرأة', 'A woman\'s ghusl'),
        content: WDU(
          `<p><strong>¿Hay que soltar las trenzas?</strong> Si el agua llega a la raíz del cabello sin soltarlas, no hace falta; si no llega, sí.</p>
<p>Umm Salama preguntó: «¿Suelto mi cabello para el ghusl de la menstruación y la janaba?» Él ﷺ dijo: <strong>«No; basta con que viertas agua sobre tu cabeza tres veces y laves todo tu cuerpo»</strong> (Muslim 330).</p>
<p><strong>Durante la menstruación</strong> no se reza ni se ayuna, y no se compensan las oraciones pero sí los ayunos.</p>
<p>💡 No hay «impureza» en la mujer: la sangre es un estado, no una mancha del alma. El Profeta ﷺ comía y se recostaba con su esposa durante la menstruación (Muslim 293).</p>`,
          `<p><strong>هل تنقض المرأة ضفائرها؟</strong> إن وصل الماء إلى أصل الشعر بلا نقض فلا يجب، وإلا وجب.</p>
<p>سألت أم سلمة: «إني امرأة أشدّ ضفر رأسي، أفأنقضه لغسل الجنابة؟» فقال ﷺ: <strong>«لا؛ إنما يكفيك أن تحثي على رأسك ثلاث حثيات ثم تفيضي عليك الماء فإذا أنت قد طهرت»</strong> (مسلم ٣٣٠).</p>
<p><strong>وفي الحيض</strong> لا صلاة ولا صيام، ولا تُقضى الصلاة وتُقضى الأيام.</p>
<p>💡 وليس في المرأة «نجاسة»: الدم حالة طبيعية لا دنَس في الروح؛ وقد كان النبي ﷺ يأكل ويضطجع مع أهله في الحيض (مسلم ٢٩٣).</p>`,
          `<p>No need to undo braids if water reaches the roots («three handfuls, then pour over the body», Muslim 330).</p>`),
      },
      {
        type: 'card',
        title: WDU('Qué se permite antes del ghusl', 'ما يُباح قبل الغسل', 'What is allowed before ghusl'),
        content: WDU(
          `<p>Quien está en janaba puede, antes de lavarse:</p>
<p>✅ Comer y beber.<br>
✅ Dormir — mejor si hace wudu antes (el Profeta ﷺ le dijo a Umar: «Haz wudu y duerme», Bujari 289).<br>
✅ Recordar a Allah, decir «Bismillah», hacer du\'a.<br>
✅ Salir, trabajar, hablar por teléfono.</p>
<p>❌ No debe rezar, ni hacer tawaf, ni tocar el mushaf del Corán, ni entrar en la mezquita salvo de paso.</p>
<p>💡 La janaba no te vuelve «sucio»: es un estado ritual que se levanta con agua. La prueba: el Profeta ﷺ dormía en janaba y se levantaba a rezar tras el ghusl.</p>`,
          `<p>الجنب يجوز له قبل الغسل:</p>
<p>✅ الأكل والشرب.<br>
✅ النوم — والأفضل أن يتوضّأ قبله؛ قال ﷺ لعمر: «توضّأ ونام» (البخاري ٢٨٩).<br>
✅ ذكر الله والتسمية والدعاء.<br>
✅ الخروج والعمل والكلام.</p>
<p>❌ ولا يصلي، ولا يطوف، ولا يمسّ المصحف، ولا يدخل المسجد إلا عابراً.</p>
<p>💡 والجنابة ليست «قذارة»: هي حالة شرعية تُرفع بالماء؛ وقد كان النبي ﷺ ينام جنباً ثم يقوم فيغتسل ويصلّي.</p>`,
          `<p>In janaba you may eat, sleep (better after wudu), remember Allah; you may not pray, do tawaf or touch the mushaf.</p>`),
      },
      {
        type: 'card',
        title: WDU('Ghusl recomendados', 'الأغسال المستحبة', 'Recommended ghusls'),
        content: WDU(
          `<p>No son obligatorios pero hay gran recompensa:</p>
<p>• El viernes (yihad del viernes empieza con el ghusl).<br>
• Los dos días de fiesta (Eid).<br>
• Antes de la peregrinación y en sus etapas.<br>
• Al entrar en el Islam.<br>
• Tras lavar a un difunto.<br>
• Al volver de un viaje.</p>
<p>📖 «El ghusl del viernes es obligatorio para todo puberscente» (Bujari 879) — «obligatorio» aquí con el sentido de muy enfatizado, según la mayoría.</p>`,
          `<p>ليست واجبة وعليها أجر عظيم:</p>
<p>• غسل الجمعة (والأمر فيه مؤكّد).<br>
• غسل العيدين.<br>
• غسل الإحرام ومواقف الحج.<br>
• غسل من أسلم.<br>
• غسل من غسّل ميتاً.<br>
• غسل القدوم من السفر.</p>
<p>📖 «غسل يوم الجمعة واجب على كل محتلم» (البخاري ٨٧٩) — والمراد تأكّد الاستحباب عند الجمهور.</p>`,
          `<p>Friday, the two Eids, ihram, entering Islam, after washing a deceased, returning from travel.</p>`),
      },
      {
        type: 'card',
        title: WDU('Wudu, ghusl, tayammum: la diferencia', 'الفرق بين الوضوء والغسل والتيمّم', 'Wudu, ghusl, tayammum'),
        content: WDU(
          `<p><strong>Wudu</strong> — purificación menor: cara, brazos, cabeza, pies. Se rompe con lo que sale, el sueño profundo, etc. Te permite rezar, tocar el mushaf y hacer tawaf.</p>
<p><strong>Ghusl</strong> — purificación mayor: todo el cuerpo. Se exige por eyaculación, relación, menstruación, puerperio. Incluye el wudu en su validez (aunque es sunna hacerlo dentro).</p>
<p><strong>Tayammum</strong> — sustituto de ambos con tierra limpia, cuando falta el agua o no se puede usar.</p>
<p>💡 Quien hace ghusl completo queda puro para todo, sin necesidad de un wudu aparte — hacerlo es sunna.</p>`,
          `<p><strong>الوضوء</strong> — طهارة صغرى: الوجه والذراعان والرأس والرجلان. ينتقض بالخارج والنوم العميق. يُبيح الصلاة ومسّ المصحف والطواف.</p>
<p><strong>الغسل</strong> — طهارة كبرى: البدن كله. يجب بالإنزال والجماع والحيض والنفاس. ويشمل الوضوء فيصحّ به، وإن كان الوضوء داخله سنة.</p>
<p><strong>التيمّم</strong> — بديل عنهما بالصعيد الطاهر عند فقد الماء أو تعذّر استعماله.</p>
<p>💡 ومن اغتسل غسلاً كاملاً صار طاهراً لكل شيء بلا وضوء آخر، والوضوء بعده سنة.</p>`,
          `<p>Wudu: minor, four limbs. Ghusl: major, whole body. Tayammum: substitute for both with clean earth.</p>`),
      },
      { type: 'quiz', question_es: '¿Cuál de estas NO exige ghusl?',
        question_ar: 'أيّ مما يلي لا يوجب الغسل؟',
        question_en: 'Which of these does NOT require ghusl?',
        options_es: ['La eyaculación', 'El fin de la menstruación', 'Ducharse por calor', 'La relación conyugal'],
        options_ar: ['خروج المنيّ', 'انقطاع الحيض', 'الاغتسال للتبرّد', 'الجماع'],
        options_en: ['Ejaculation', 'End of menstruation', 'Showering because of heat', 'Intercourse'],
        correct: 2, explanation_es: 'Ducharse por calor no es un rito: ni sustituye ni es exigido.',
        explanation_en: 'Showering for heat is not a ritual act.' },
      { type: 'quiz', question_es: '¿Es fard soltar las trenzas en el ghusl?',
        question_ar: 'هل يجب نقض الضفائر في الغسل؟',
        question_en: 'Is undoing braids obligatory in ghusl?',
        options_es: ['Sí, siempre', 'No, si el agua llega a la raíz', 'Solo tras la menstruación', 'Solo en el ghusl del viernes'],
        options_ar: ['نعم دائماً', 'لا، إن وصل الماء إلى أصل الشعر', 'فقط بعد الحيض', 'فقط في غسل الجمعة'],
        options_en: ['Yes, always', 'No, if water reaches the roots', 'Only after menstruation', 'Only for Friday ghusl'],
        correct: 1, explanation_es: 'Muslim 330: basta con tres puñados sobre la cabeza y lavar el cuerpo.',
        explanation_en: 'Muslim 330: three handfuls over the head suffice.' },
    ],
  },

  // ================= 9. CASOS =================
  cases: {
    id: 'wudu_cases',
    icon: '<i class="fas fa-circle-question"></i>',
    title: WDU('Casos y dudas actuales', 'حالات وأسئلة معاصرة', 'Modern cases and doubts'),
    mascotIntro: WDU('Las preguntas que la gente me manda cada semana: uñas, cremas, dudas, dudas y más dudas.',
      'الأسئلة التي تصلني كل أسبوع: الأظافر، والكريمات، والشكوك والشكوك.',
      'The questions I get every week: nails, creams, and endless doubts.'),
    lessons: [
      {
        type: 'card',
        title: WDU('Lo que bloquea el agua', 'ما يمنع وصول الماء', 'What blocks water'),
        content: WDU(
          `<p>❌ <strong>Esmalte de uñas</strong> (incluso el transparente, incluso el de gel): forma una película impermeable → el wudu no es válido. Si lo llevas, quítalo antes del wudu o haz wudu antes de pintártelas.</p>
<p>✅ <strong>Henna (alheña)</strong>: no forma capa, el agua pasa → válida.</p>
❌ <strong>Papel de henna</strong> pegado o cera depilatoria: bloquea → no válido.
<p>❌ <strong>Crema solar muy densa o vaselina espesa</strong>: si forma una capa visible, se quita; si se absorbe, no hay problema.</p>
<p>✅ <strong>Lentes de contacto</strong>: no bloquean la piel; no hay que quitarlas.</p>
<p>✅ <strong>Tinte de cabello</strong>: no bloquea si no deja capa.</p>
<p>💡 Regla: si al pasar el dedo mojado notas una película que separa el agua de la piel, quítala.</p>`,
          `<p>❌ <strong>طلاء الأظافر</strong> (ولو شفافاً أو جِل): يكوّن طبقة عازلة فلا يصحّ الوضوء. فإن كان عليك فانزعيه قبل الوضوء أو توضّئي قبل وضعه.</p>
<p>✅ <strong>الحنّاء</strong>: لا تكوّن طبقة والماء ينفذ → صحيحة.</p>
<p>❌ <strong>ورق الحنّاء</strong> الملتصق أو الشمع: يمنع → لا يصحّ.</p>
<p>❌ <strong>واقي الشمس الكثيف أو الفازلين السميك</strong>: إن شكّل طبقة ظاهرة وجب إزالته، وإن تُشرب في الجلد فلا حرج.</p>
<p>✅ <strong>العدسات اللاصقة</strong>: لا تمنع وصول الماء إلى البشرة، ولا يجب نزعها.</p>
<p>✅ <strong>صبغ الشعر</strong>: لا يمنع إن لم يترك طبقة.</p>
<p>💡 القاعدة: إن أحسست بإصبعك المبلول بغشاء يفصل الماء عن البشرة فأزله.</p>`,
          `<p>Nail polish (even clear or gel) blocks water — remove it. Henna does not block. Contact lenses are fine.</p>`),
      },
      {
        type: 'card',
        title: WDU('Heridas, apósitos y escayola', 'الجروح واللاصق الطبي', 'Wounds, plasters and casts'),
        content: WDU(
          `<p><strong>Herida abierta:</strong> lava lo que la rodea; si el agua daña, pasa la mano mojada por encima sin frotar.</p>
<p><strong>Apósito o escayola:</strong> se pasa la mano por encima (mas-h) y se lava el resto del miembro. No hay plazo.</p>
<p><strong>Sangre de la herida:</strong> si sale y no para, la escuela shafi\'i no considera que anule el wudu si es poca; la hanafí sí. Sigue tu escuela.</p>
<p><strong>Diente que sangra al cepillarse:</strong> no anula el wudu según la mayoría, porque es mínimo.</p>
<p>💡 La regla general: <em>la necesidad hace lícito lo que normalmente no lo sería, pero solo en la medida necesaria.</em></p>`,
          `<p><strong>الجرح المفتوح:</strong> اغسل ما حوله، وإن ضرّه الماء فامسح عليه بيد مبلولة بلا فرك.</p>
<p><strong>اللاصق الطبي والجبيرة:</strong> يُمسح عليها ويُغسل باقي العضو، ولا وقت محدّد.</p>
<p><strong>الدم الخارج من الجرح:</strong> إن سال ولم ينقطع فمذهب الشافعية أنه لا ينقض إن كان قليلاً، والحنفية يقولون ينقض. وكلٌّ يتبع مذهبه.</p>
<p><strong>دم اللثة عند التنظيف:</strong> لا ينقض عند الجمهور لأنه يسير.</p>
<p>💡 والقاعدة: <em>الضرورة تُبيح المحظور بقدرها.</em></p>`,
          `<p>Wash around the wound; wipe over plaster or cast; a little bleeding does not break wudu in the Shafi'i school.</p>`),
      },
      {
        type: 'card',
        title: WDU('Incontinencia y gases constantes', 'سلس البول والريح', 'Incontinence and constant wind'),
        content: WDU(
          `<p>Quien tiene una excusa continua (sale orina o gases sin control, o flujo continuo):</p>
<p><strong>1.</strong> Se limpia y se pone algo que lo proteja.<br>
<strong>2.</strong> Espera a que entre el tiempo de la oración.<br>
<strong>3.</strong> Hace el wudu <strong>después</strong> de entrar el tiempo.<br>
<strong>4.</strong> Reza el fard y todo lo que quiera de sunnas mientras el tiempo siga abierto.<br>
<strong>5.</strong> Cuando entra el tiempo siguiente, repite el wudu.</p>
<p>💡 Su wudu no se rompe por lo que sale sin control: la excusa lo exime. Pero no puede rezar dos fards con el mismo wudu.</p>
<p>📖 La base: la mujer con flujo continuo recibió la orden de hacer un wudu por cada oración (Bujari 306).</p>`,
          `<p>من به عذر مستمر (سلس بول أو ريح أو استحاضة):</p>
<p><strong>١.</strong> ينظّف الموضع ويضع ما يحفظه.<br>
<strong>٢.</strong> ينتظر دخول وقت الصلاة.<br>
<strong>٣.</strong> يتوضّأ <strong>بعد</strong> دخول الوقت.<br>
<strong>٤.</strong> يصلّي الفرض وما شاء من النوافل ما دام الوقت باقياً.<br>
<strong>٥.</strong> فإذا دخل وقت الصلاة التالية أعاد الوضوء.</p>
<p>💡 ولا ينتقض وضوؤه بما يخرج بغير اختيار؛ فالعذر يرفع الحكم، لكنه لا يصلي فرضين بوضوء واحد.</p>
<p>📖 والأصل: أمر المستحاضة بالوضوء لكل صلاة (البخاري ٣٠٦).</p>`,
          `<p>With a continuous excuse: wudu after the time enters, pray the fard plus sunnahs within that time, renew for the next prayer.</p>`),
      },
      {
        type: 'card',
        title: WDU('El waswas en el wudu', 'الوسواس في الوضوء', 'Waswas in wudu'),
        content: WDU(
          `<p>Repetir el wudu cinco veces, dudar si el agua llegó a cada poro, lavar cada miembro diez veces… esto no es piedad: es una enfermedad que el Shaytán usa para que odies la adoración.</p>
<p><strong>El antídoto en tres pasos:</strong></p>
<p><strong>1.</strong> Hazlo <strong>una vez</strong> bien y sigue. No repitas un miembro ya lavado.</p>
<p><strong>2.</strong> Si dudas «¿lo lavé?», la respuesta es <strong>sí</strong> — porque estabas haciendo el wudu y lo natural es que lo hicieras.</p>
<p><strong>3.</strong> No busques certeza absoluta: el wudu no exige ver cada gota.</p>
<p>📖 El Profeta ﷺ dijo: «El agua es pura, nada la vuelve impura» y ordenó no salir de la duda. Y dijo: «No os excedáis en la religión» (Ibn Majah 3029).</p>
<p>💡 Si el waswas te domina, ponte un límite de tiempo: 3 minutos para el wudu completo. Cuando suena, terminas.</p>`,
          `<p>إعادة الوضوء خمس مرات، والشكّ في وصول الماء إلى كل مسام، وغسل العضو عشراً… ليس هذا تقوى، بل مرض يتسلّط به الشيطان حتى تكره العبادة.</p>
<p><strong>والعلاج في ثلاث:</strong></p>
<p><strong>١.</strong> افعله <strong>مرة</strong> واحدة بإتقان ثم امضِ، ولا تُعد عضواً قد غسلته.</p>
<p><strong>٢.</strong> إذا شككت «هل غسلته؟» فالجواب <strong>نعم</strong>، لأنك كنت في وضوء والظاهر أنك فعلت.</p>
<p><strong>٣.</strong> لا تطلب اليقين المطلق؛ فالوضوء لا يشترط رؤية كل قطرة.</p>
<p>📖 وقال ﷺ: «هلك المتنطّعون» ثلاثاً (مسلم ٢٦٧٠)، وقال: «لا تُشدّدوا على أنفسكم».</p>
<p>💡 وإن غلبك الوسواس فاجعل لنفسك حدّاً زمنياً: ثلاث دقائق للوضوء كاملاً، فإذا انتهى الوقت انتهيت.</p>`,
          `<p>Repeating wudu is not piety. Do it once, trust that you did it, and stop. Set a three-minute limit.</p>`),
      },
      {
        type: 'card',
        title: WDU('Dudar después del wudu', 'الشكّ بعد الوضوء', 'Doubting after wudu'),
        content: WDU(
          `<p><strong>Mientras lo haces:</strong> si dudas si lavaste un miembro, lávalo y sigue desde ahí.</p>
<p><strong>Después de terminarlo:</strong> si dudas si se rompió, <strong>no se rompió</strong>. La certeza (que estabas puro) no cae por la duda.</p>
<p>📖 Un hombre se quejó al Profeta ﷺ de que imaginaba salir algo durante la oración. Le dijo: <strong>«No te muevas hasta que oigas un sonido o percibas un olor»</strong> (Muslim 361).</p>
<p>💡 No mires, no te palpes, no te examines: si no hay sonido ni olor, estás puro.</p>
<p>⚠️ Y si estabas seguro de que se rompió y luego dudas si hiciste el wudu: <strong>haz el wudu</strong>, porque aquí la duda va contra ti (la certeza es que estabas impuro).</p>`,
          `<p><strong>أثناءه:</strong> إذا شككت هل غسلت عضواً فاغسله وامضِ من عنده.</p>
<p><strong>بعد تمامه:</strong> إذا شككت هل انتقض <strong>فلم ينتقض</strong>؛ فاليقين لا يزول بالشكّ.</p>
<p>📖 وشكا رجل إلى النبي ﷺ أنه يخيّل إليه أنه يجد شيئاً في الصلاة، فقال: <strong>«لا ينصرف حتى يسمع صوتاً أو يجد ريحاً»</strong> (مسلم ٣٦١).</p>
<p>💡 لا تنظر ولا تتحسّس ولا تفحص: ما لم يكن صوت ولا ريح فأنت طاهر.</p>
<p>⚠️ وإن كنت متيقّناً من الحدث ثم شككت هل توضّأت: <strong>توضّأ</strong>؛ فالشكّ هنا في صفّ الحدث واليقين معه.</p>`,
          `<p>Doubt during wudu: wash the limb. Doubt after: it did not break. «Not until you hear a sound or smell an odour» (Muslim 361).</p>`),
      },
      {
        type: 'card',
        title: WDU('En el baño, con vapor y con poca agua', 'في الحمام والبخار والماء القليل', 'In the bathroom, with steam, with little water'),
        content: WDU(
          `<p><strong>¿Se puede hacer wudu en el baño?</strong> Sí, es válido; se dice Bismillah en el corazón y no se habla dentro.</p>
<p><strong>¿El vapor del baño anula el wudu?</strong> No. El vapor es agua evaporada; no rompe la pureza ni la crea.</p>
<p><strong>¿Poca agua en un recipiente?</strong> Vale mientras no cambie por impureza. Mete la mano sin devolver el agua usada al recipiente.</p>
<p><strong>¿Agua que cae en el lavabo y salpica?</strong> Es agua usada (tahir): no vuelve a servir para el wudu, pero tampoco te impurifica.</p>
<p>💡 En un baño público: usa el grifo con la palma, sin apoyar el cuerpo en el lavabo, y evita el derroche.</p>`,
          `<p><strong>هل يصحّ الوضوء في الحمام؟</strong> نعم صحيح؛ ويسمّي بقلبه ولا يتكلّم فيه.</p>
<p><strong>هل بخار الحمام ينقض الوضوء؟</strong> لا؛ البخار ماء متبخّر لا ينقض الطهارة ولا يحدثها.</p>
<p><strong>وماء قليل في إناء؟</strong> يصحّ ما لم يتغيّر بنجاسة؛ ويغمس يده دون أن يعيد الماء المستعمل إلى الإناء.</p>
<p><strong>والماء المتطاير من المغسلة؟</strong> هو ماء مستعمل (طاهر): لا يُتوضّأ به ثانياً، ولا يُنجّسك.</p>
<p>💡 وفي الحمام العام: افتح الصنبور بكفّك، ولا تُلصق جسمك بالمغسلة، ولا تُسرف.</p>`,
          `<p>Wudu in the bathroom is valid; steam neither breaks nor creates purity; splash water is used but not impure.</p>`),
      },
      {
        type: 'flashcards',
        title: WDU('Términos que debes conocer', 'مصطلحات لا بدّ منها', 'Terms you should know'),
        cards: [
          { front: WDU('Tahur', 'طهور'), back: WDU('Agua pura que además purifica: sirve para wudu y ghusl.', 'ماء طاهر في نفسه مطهّر لغيره، يُتوضّأ به ويُغتسل.') },
          { front: WDU('Hadaz', 'الحدث'), back: WDU('Estado de impureza ritual: menor (necesita wudu) o mayor (necesita ghusl).', 'وصف شرعي يمنع الصلاة: أصغر يحتاج وضوءاً، وأكبر يحتاج غسلاً.') },
          { front: WDU('Muwalat', 'الموالاة'), back: WDU('Hacer el wudu seguido, sin que se seque el miembro anterior.', 'التتابع في الوضوء بحيث لا يجفّ العضو السابق.') },
          { front: WDU('Jabira', 'الجبيرة'), back: WDU('Venda, escayola o apósito que cubre una herida: se pasa la mano por encima.', 'ما يُوضع على الجرح من لاصق أو جبيرة: يُمسح عليه.') },
          { front: WDU('Sa\'id', 'الصعيد'), back: WDU('Superficie de la tierra: arena, piedra, polvo. Material del tayammum.', 'وجه الأرض: تراب ورمل وحجر وغبار، وهو مادة التيمّم.') },
          { front: WDU('Musta\'mal', 'المستعمل'), back: WDU('Agua ya usada en un fard: pura pero no purificante.', 'ماء استُعمل في فرض: طاهر غير مطهّر.') },
        ],
      },
      { type: 'quiz', question_es: '¿Vale el wudu con esmalte de uñas transparente?',
        question_ar: 'هل يصحّ الوضوء مع طلاء أظافر شفاف؟',
        question_en: 'Is wudu valid with clear nail polish?',
        options_es: ['Sí, porque es transparente', 'No, porque forma una capa impermeable', 'Solo si es de marca halal', 'Solo en Ramadán'],
        options_ar: ['نعم لأنه شفاف', 'لا لأنه يكوّن طبقة عازلة', 'فقط إن كان حلالاً', 'فقط في رمضان'],
        options_en: ['Yes, it is transparent', 'No, it forms a waterproof layer', 'Only if halal-certified', 'Only in Ramadan'],
        correct: 1, explanation_es: 'La transparencia no importa: lo que importa es si el agua atraviesa la capa.',
        explanation_en: 'Transparency is irrelevant; what matters is whether water passes through.' },
      { type: 'quiz', question_es: 'Dudas si rompiste el wudu después de hacerlo. ¿Qué haces?',
        question_ar: 'شككت بعد الوضوء هل انتقض. ماذا تفعل؟',
        question_en: 'You doubt whether your wudu broke. What do you do?',
        options_es: ['Repites el wudu', 'No lo repites: sigues puro', 'Haces tayammum', 'Esperas a la siguiente oración'],
        options_ar: ['تعيد الوضوء', 'لا تعيد، فأنت طاهر', 'تتيمّم', 'تنتظر الصلاة التالية'],
        options_en: ['Repeat the wudu', 'Do not repeat: you are still pure', 'Do tayammum', 'Wait for the next prayer'],
        correct: 1, explanation_es: 'Muslim 361: la certeza no se anula por la duda.',
        explanation_en: 'Muslim 361: certainty is not removed by doubt.' },
    ],
  },
};

if (typeof window !== 'undefined') window.WUDU_EXTRA = WUDU_EXTRA;
