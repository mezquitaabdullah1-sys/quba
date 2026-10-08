/**
 * 🔑 اللغة العربية: مفتاحك لفهم القرآن — بيانات الكورس (v2)
 * ══════════════════════════════════════════════════════════════════
 * ملف بيانات خالص (بلا واجهة): الحروف، العائلات الشكلية، الحركات، الفيديو.
 * المفردات في data/courses/arabic_vocab.js، وتركيب المحطات في arabic_language.js.
 *
 * كل نص موجّه للمتعلّم هو {es, ar, en}. الإسبانية هي اللغة الافتراضية للتطبيق.
 * مصادر المحتوى اللغوي: Alif Baa (Georgetown UP)، سلسلة كتاب المدينة (الجامعة
 * الإسلامية بالمدينة المنورة)، والجزرية لمخارج الحروف.
 *
 * تنبيه للمراجعة: مخارج الحروف وأوصاف الكتابة موجزة للمبتدئين؛ أما ترتيب
 * ضربات القلم الدقيق فيُعرض في فيديو الكتابة (وحدة «كلمات وقراءة») وسيُضاف
 * لاحقاً درس write_trace لتتبّع الحرف بالإصبع.
 */
const ARABIC_DATA = (() => {
  const T = (a) => ({ es: a[0], ar: a[1], en: a[2] });

  // "m:ss" → ثوانٍ
  const ts = (s) => {
    const p = String(s).split(':').map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  };

  // ── الحروف الـ28 ───────────────────────────────────────────────
  // L(id, مجموعة, الحرف, الاسم, اللاتيني, الصوت الصامت, خيارات, صوت, مخرج, مثال, ملاحظة, كتابة, مقطع الكتابة)
  const L = (id, g, ch, nm, tr, c, o, sound, mouth, ex, note, write, clip) => {
    const conn = o.conn !== false;
    return {
      id, g, ch, nm, tr, c,
      say: o.say || (ch + '\u064E'),          // ما يُنطق عند النقر (الحرف + فتحة)
      conn,
      forms: {
        iso: ch,
        ini: conn ? ch + '\u0640' : ch,
        med: '\u0640' + ch + (conn ? '\u0640' : ''),
        fin: '\u0640' + ch,
      },
      dots: { n: o.dots[0], pos: o.dots[1] },   // pos: above | below | none
      fam: o.fam,
      sound: T(sound),
      mouth: T(mouth),
      ex: { w: ex[0], tr: ex[1], es: ex[2], en: ex[3], ar: ex[4], e: ex[5], s: ex[6] },
      note: T(note),
      write: T(write),
      clip: clip ? { start: clip[0], end: clip[1] } : null,
    };
  };

  const LETTERS = [
    // ═══ المجموعة 1 ═══
    L('alif', 1, 'ا', 'أَلِف', 'Alif', 'ā', { say: 'آ', dots: [0, 'none'], fam: 'solo', conn: false },
      [`Vocal larga «aa»: como una "a" de "casa" alargada.`, `حرف مدّ: يُنطق ألفاً ممدودة كالألف في «بَاب».`, `A long vowel "aa", like the "a" in "father" held longer.`],
      [`Abre la boca y deja salir el aire sin que la lengua toque nada: un sonido abierto y prolongado.`, `من الجوف: يخرج الصوت من فراغ الفم دون أن يلمس اللسان شيئاً.`, `Open your mouth and let the air flow; the tongue touches nothing. An open, held sound.`],
      ['أَبٌ', 'ab', 'padre', 'father', 'والد', '👨', 'ab'],
      [`Es la primera letra. NO se une a la letra que le sigue. Con una hamza encima (أ) suena "a" corta; en medio de una palabra (بَاب) se alarga: "aa".`, `أوّل الحروف. لا تتّصل بما بعدها. مع الهمزة (أ) تُنطق فتحة قصيرة، وفي وسط الكلمة (بَاب) تُمَدّ: «آ».`, `The first letter. It does NOT join the next letter. With a hamza (أ) it is a short "a"; inside a word (بَاب) it stretches to "aa".`],
      [`Un solo trazo vertical recto, de arriba abajo. Sin puntos.`, `خطّ رأسيّ مستقيم من الأعلى إلى الأسفل. بلا نقاط.`, `One straight vertical stroke, top to bottom. No dots.`],
      ['0:49', '3:00']),
    L('ba', 1, 'ب', 'بَاء', 'Baa', 'b', { dots: [1, 'below'], fam: 'ba' },
      [`Como la "b" de "barco".`, `مثل الباء في «بَاب».`, `Like "b" in "book".`],
      [`Cierra los dos labios y suéltalos con un pequeño golpe de aire.`, `من الشفتين: تنطبق إحداهما على الأخرى.`, `Close both lips, then release with a small puff of air.`],
      ['بَابٌ', 'bāb', 'puerta', 'door', 'مدخل', '🚪', 'bab'],
      [`UN punto DEBAJO. Comparte forma con ت y ث: solo cambian los puntos.`, `نقطة واحدة تحت الحرف. تشترك في الشكل مع ت وث: الفرق في النقاط فقط.`, `ONE dot BELOW. It shares its shape with ت and ث: only the dots change.`],
      [`Un cuenco poco profundo trazado de derecha a izquierda; después UN punto debajo, en el centro.`, `حوض قليل العمق يُكتب من اليمين إلى اليسار، ثم نقطة واحدة تحت الوسط.`, `A shallow bowl drawn right to left, then ONE dot below its middle.`],
      ['3:03', '4:53']),
    L('ta', 1, 'ت', 'تَاء', 'Taa', 't', { dots: [2, 'above'], fam: 'ba' },
      [`Como la "t" de "taza".`, `مثل التاء في «تُفَّاح».`, `Like "t" in "tea".`],
      [`La punta de la lengua toca la base de los dientes superiores.`, `من طرف اللسان مع أصول الثنايا العليا.`, `The tongue tip touches the base of the upper front teeth.`],
      ['تُفَّاحٌ', 'tuf-fāḥ', 'manzana', 'apple', 'فاكهة', '🍎', 'tuffah'],
      [`DOS puntos ARRIBA. Misma silueta que ب y ث.`, `نقطتان فوق الحرف. الشكل نفسه كالباء والثاء.`, `TWO dots ABOVE. Same silhouette as ب and ث.`],
      [`El mismo cuenco que ب, con DOS puntos arriba.`, `الحوض نفسه كالباء، مع نقطتين فوقه.`, `The same bowl as ب, with TWO dots above.`],
      ['4:55', '6:58']),
    L('tha', 1, 'ث', 'ثَاء', 'Thaa', 'th', { dots: [3, 'above'], fam: 'ba' },
      [`Como la "th" del inglés "think" (en España, como la "z" de "zapato").`, `مثل الثاء في «ثَوْب».`, `Like "th" in "think".`],
      [`Saca apenas la punta de la lengua entre los dientes y sopla aire, sin voz.`, `من طرف اللسان مع أطراف الثنايا العليا، بلا صوت.`, `Place the tongue tip lightly between the teeth and blow air, without voice.`],
      ['ثَوْبٌ', 'thawb', 'túnica, prenda', 'garment', 'لباس', '👕', 'thawb'],
      [`TRES puntos ARRIBA (en triángulo). Este sonido no existe en el español de América.`, `ثلاث نقاط فوق الحرف. هذا الصوت غير موجود في الإسبانية الأمريكية.`, `THREE dots ABOVE (in a triangle). Spanish speakers in the Americas: this sound is new.`],
      [`El mismo cuenco que ب, con TRES puntos arriba.`, `الحوض نفسه كالباء، مع ثلاث نقاط فوقه.`, `The same bowl as ب, with THREE dots above.`],
      ['6:59', '9:12']),
    L('jim', 1, 'ج', 'جِيم', 'Jiim', 'j', { dots: [1, 'below'], fam: 'jim' },
      [`Como la "j" del inglés "job" (una "d" y una "y" fundidas).`, `مثل الجيم في «جَمَل».`, `Like "j" in "job".`],
      [`La parte media de la lengua sube y toca el paladar.`, `من وسط اللسان مع ما يحاذيه من الحنك الأعلى.`, `The middle of the tongue rises and touches the palate.`],
      ['جَمَلٌ', 'ja-mal', 'camello', 'camel', 'حيوان الصحراء', '🐫', 'jamal'],
      [`UN punto DENTRO de la curva (abajo). Misma forma que ح y خ.`, `نقطة واحدة داخل التقوّس (تحت). الشكل نفسه كالحاء والخاء.`, `ONE dot INSIDE the curve (below). Same shape as ح and خ.`],
      [`Forma de gancho: un trazo arriba que baja y se curva de vuelta; UN punto dentro de la curva.`, `شكل كالخُطّاف: خطّ علويّ ينزل ويلتفّ راجعاً؛ ونقطة واحدة داخل التقوّس.`, `A hook shape: a stroke on top that comes down and curls back; ONE dot inside the curve.`],
      ['9:14', '11:22']),
    L('hha', 1, 'ح', 'حَاء', 'Ḥaa', 'ḥ', { dots: [0, 'none'], fam: 'jim' },
      [`Una "h" fuerte y áspera, soplada desde el centro de la garganta (sin equivalente en español).`, `حاء مهموسة من وسط الحلق.`, `A strong, breathy "h" from the middle of the throat (no English equivalent).`],
      [`Aprieta un poco la garganta y sopla aire caliente, como si empañaras un cristal con fuerza.`, `من وسط الحلق.`, `Tighten the throat slightly and blow warm air, as if fogging a mirror hard.`],
      ['حُبٌّ', 'ḥubb', 'amor', 'love', 'مودّة', '❤️', 'hubb'],
      [`⚠️ SIN puntos. Es una letra de la garganta: no la confundas con ه (una "h" suave).`, `⚠️ بلا نقاط. حرف حلقيّ: لا تخلطه بالهاء (ه) الخفيفة.`, `⚠️ NO dots. A throat letter: don't mix it up with ه (a soft "h").`],
      [`La misma forma que ج, pero SIN punto.`, `شكل الجيم نفسه، لكن بلا نقطة.`, `The same shape as ج, but WITHOUT a dot.`],
      ['11:23', '13:04']),
    L('kha', 1, 'خ', 'خَاء', 'Khaa', 'kh', { dots: [1, 'above'], fam: 'jim' },
      [`Como la "j" española de "jota" (o la "ch" alemana de "Bach").`, `مثل الخاء في «خُبْز».`, `Like the Spanish "j" in "jota" or the German "ch" in "Bach".`],
      [`El fondo de la lengua se acerca al velo del paladar y el aire sale rozando.`, `من أدنى الحلق إلى الفم.`, `The back of the tongue nears the soft palate and air scrapes through.`],
      ['خُبْزٌ', 'khubz', 'pan', 'bread', 'طعام', '🍞', 'khubz'],
      [`UN punto ARRIBA. Si hablas español: ¡este sonido ya lo tienes!`, `نقطة واحدة فوق الحرف. إن كنت تتكلّم الإسبانية فهذا الصوت عندك أصلاً!`, `ONE dot ABOVE. Spanish speakers: you already own this sound!`],
      [`Como ج y ح, pero con UN punto ARRIBA.`, `كالجيم والحاء، مع نقطة واحدة فوقها.`, `Like ج and ح, but with ONE dot ABOVE.`],
      ['13:05', '15:08']),

    // ═══ المجموعة 2 ═══
    L('dal', 2, 'د', 'دَال', 'Daal', 'd', { dots: [0, 'none'], fam: 'dal', conn: false },
      [`Como la "d" de "dado".`, `مثل الدال في «دَار».`, `Like "d" in "door".`],
      [`La punta de la lengua toca la base de los dientes superiores; con voz.`, `من طرف اللسان مع أصول الثنايا العليا.`, `The tongue tip touches the base of the upper teeth; voiced.`],
      ['دَارٌ', 'dār', 'casa, hogar', 'house, home', 'بيت', '🏠', 'dar'],
      [`SIN puntos. NO se une a la letra siguiente.`, `بلا نقاط. لا تتّصل بما بعدها.`, `NO dots. Does NOT join the next letter.`],
      [`Un pequeño ángulo abierto hacia la izquierda, apoyado en la línea. Sin puntos.`, `زاوية صغيرة مفتوحة نحو اليسار، تقف على السطر. بلا نقاط.`, `A small angle opening to the left, sitting on the line. No dots.`],
      ['15:09', '15:58']),
    L('dhal', 2, 'ذ', 'ذَال', 'Dhaal', 'dh', { dots: [1, 'above'], fam: 'dal', conn: false },
      [`Como la "th" del inglés "this" (con voz).`, `مثل الذال في «ذَهَب».`, `Like "th" in "this" (voiced).`],
      [`La punta de la lengua queda entre los dientes y vibra con voz.`, `من طرف اللسان مع أطراف الثنايا العليا، مع الصوت.`, `The tongue tip rests between the teeth and vibrates with voice.`],
      ['ذَهَبٌ', 'dha-hab', 'oro', 'gold', 'معدن ثمين', '🪙', 'dhahab'],
      [`Es د con UN punto ARRIBA. NO se une después.`, `هي الدال مع نقطة فوقها. لا تتّصل بما بعدها.`, `It is د with ONE dot ABOVE. Does NOT join after it.`],
      [`La forma de د con UN punto arriba.`, `شكل الدال مع نقطة واحدة فوقه.`, `The shape of د with ONE dot above.`],
      ['15:59', '16:54']),
    L('ra', 2, 'ر', 'رَاء', 'Raa', 'r', { dots: [0, 'none'], fam: 'ra', conn: false },
      [`Como la "r" suave de "pero": un solo toque de lengua.`, `مثل الراء في «رَأْس».`, `Like the soft Spanish "r" in "pero": a single tap.`],
      [`La punta de la lengua golpea una vez la encía superior, justo detrás de los dientes.`, `من طرف اللسان مع لثة الثنايا العليا (فيه تكرار خفيف).`, `The tongue tip taps the ridge behind the upper teeth once.`],
      ['رَأْسٌ', 'raʾs', 'cabeza', 'head', 'أعلى الجسم', '🙂', 'ras'],
      [`SIN puntos. NO se une después. Es UN solo toque, no la "rr" fuerte.`, `بلا نقاط. لا تتّصل بما بعدها. طَرْقة واحدة، لا الراء المكرّرة.`, `NO dots. Does NOT join after it. ONE tap, not a rolled "rr".`],
      [`Una curva que baja por DEBAJO de la línea, como una coma. Sin puntos.`, `منحنى ينزل تحت السطر كالفاصلة. بلا نقاط.`, `A curve that dips BELOW the line, like a comma. No dots.`],
      ['16:55', '17:54']),
    L('zay', 2, 'ز', 'زَاي', 'Zaay', 'z', { dots: [1, 'above'], fam: 'ra', conn: false },
      [`Como la "z" del inglés "zebra" (una "s" con vibración).`, `مثل الزاي في «زَيْت».`, `Like "z" in "zebra".`],
      [`Como س pero con voz: la lengua cerca de los dientes y el aire vibra.`, `كالسين لكن مع الصوت: يهتزّ الهواء عند الأسنان.`, `Like س but voiced: the tongue near the teeth and the air buzzes.`],
      ['زَيْتٌ', 'zayt', 'aceite', 'oil', 'زيت الزيتون', '🫒', 'zayt'],
      [`Es ر con UN punto ARRIBA. NO se une después.`, `هي الراء مع نقطة فوقها. لا تتّصل بما بعدها.`, `It is ر with ONE dot ABOVE. Does NOT join after it.`],
      [`La forma de ر con UN punto arriba.`, `شكل الراء مع نقطة واحدة فوقه.`, `The shape of ر with ONE dot above.`],
      ['17:56', '18:52']),
    L('sin', 2, 'س', 'سِين', 'Siin', 's', { dots: [0, 'none'], fam: 'sin' },
      [`Como la "s" de "sol".`, `مثل السين في «سَمَاء».`, `Like "s" in "sun".`],
      [`Aire sin voz que pasa entre la lengua y los dientes: un silbido suave.`, `من بين طرف اللسان وفويق الثنايا السفلى، بلا صوت.`, `Voiceless air between the tongue and the teeth: a soft hiss.`],
      ['سَمَاءٌ', 'sa-māʾ', 'cielo', 'sky', 'فوقنا', '☁️', 'sama'],
      [`Tres "dientes" sin puntos.`, `ثلاث أسنان بلا نقاط.`, `Three "teeth" and no dots.`],
      [`Tres pequeños dientes seguidos y, al final, una cola redonda. Sin puntos.`, `ثلاث أسنان متتالية وذيل مستدير في النهاية. بلا نقاط.`, `Three small teeth in a row and a round tail at the end. No dots.`],
      ['18:54', '20:49']),
    L('shin', 2, 'ش', 'شِين', 'Shiin', 'sh', { dots: [3, 'above'], fam: 'sin' },
      [`Como la "sh" del inglés "she".`, `مثل الشين في «شَمْس».`, `Like "sh" in "she".`],
      [`La parte media de la lengua se acerca al paladar y sale aire: "shhh".`, `من وسط اللسان مع ما يحاذيه من الحنك الأعلى.`, `The middle of the tongue nears the palate; air escapes: "shhh".`],
      ['شَمْسٌ', 'shams', 'sol', 'sun', 'نجم النهار', '☀️', 'shams'],
      [`Es س con TRES puntos ARRIBA.`, `هي السين مع ثلاث نقاط فوقها.`, `It is س with THREE dots ABOVE.`],
      [`La forma de س con TRES puntos arriba.`, `شكل السين مع ثلاث نقاط فوقه.`, `The shape of س with THREE dots above.`],
      ['20:51', '23:11']),

    // ═══ المجموعة 3 (المفخّمة والحلقية) ═══
    L('sad', 3, 'ص', 'صَاد', 'Ṣaad', 'ṣ', { dots: [0, 'none'], fam: 'sad' },
      [`Una "s" ENFÁTICA (pesada): la lengua se eleva atrás y el sonido sale grave.`, `صاد مُفخَّمة: يرتفع أقصى اللسان فيغلُظ الصوت.`, `An EMPHATIC "s": the back of the tongue rises and the sound turns deep.`],
      [`Coloca la lengua como para س, pero hunde el centro (como una cuchara) y eleva la parte de atrás hacia el paladar blando. La boca "se llena" de sonido.`, `من طرف اللسان مع فويق الثنايا السفلى مع إطباق وتفخيم: يرتفع أقصى اللسان نحو الحنك.`, `Place the tongue as for س, then hollow the middle (like a spoon) and lift the back toward the soft palate. The mouth "fills" with sound.`],
      ['صَدِيقٌ', 'ṣa-dīq', 'amigo', 'friend', 'رفيق', '🤝', 'sadiq'],
      [`La versión "pesada" de س. Compara: سَيْف (espada) y صَيْف (verano).`, `النسخة المفخّمة من السين. قارن: سَيْف وصَيْف.`, `The "heavy" version of س. Compare: سَيْف (sword) and صَيْف (summer).`],
      [`Un lazo cerrado con una cola larga hacia la izquierda. Sin puntos.`, `عُقدة مغلقة لها ذيل طويل نحو اليسار. بلا نقاط.`, `A closed loop with a long tail to the left. No dots.`],
      ['23:16', '25:01']),
    L('dad', 3, 'ض', 'ضَاد', 'Ḍaad', 'ḍ', { dots: [1, 'above'], fam: 'sad' },
      [`Una "d" ENFÁTICA: el sonido más característico del árabe.`, `ضاد مُفخَّمة، أخصّ أصوات العربية.`, `An EMPHATIC "d": the most characteristic Arabic sound.`],
      [`Apoya los BORDES laterales de la lengua contra las muelas superiores, eleva la parte de atrás y pronuncia con voz.`, `من إحدى حافتَي اللسان مع ما يليها من الأضراس العليا، مع الإطباق.`, `Press the SIDES of the tongue against the upper molars, lift the back, and use voice.`],
      ['ضَوْءٌ', 'ḍawʾ', 'luz', 'light', 'نور', '💡', 'daw'],
      [`💫 El árabe se llama «lugat al-ḍād» (la lengua del ḍād) porque este sonido es propio suyo.`, `💫 تُسمّى العربية «لغة الضاد» لأنّ هذا الصوت من خصائصها.`, `💫 Arabic is called "the language of the Ḍād" because this sound is its signature.`],
      [`La forma de ص con UN punto ARRIBA.`, `شكل الصاد مع نقطة واحدة فوقه.`, `The shape of ص with ONE dot ABOVE.`],
      ['25:02', '27:01']),
    L('tta', 3, 'ط', 'طَاء', 'Ṭaa', 'ṭ', { dots: [0, 'none'], fam: 'tta' },
      [`Una "t" ENFÁTICA (pesada), con la lengua atrás.`, `طاء مُفخَّمة.`, `An EMPHATIC "t", with the tongue pulled back.`],
      [`La punta de la lengua toca la base de los dientes superiores, con el centro hundido y la parte de atrás elevada hacia el paladar.`, `من طرف اللسان مع أصول الثنايا العليا مع الإطباق.`, `The tongue tip touches the base of the upper teeth, middle hollowed, back raised toward the palate.`],
      ['طَعَامٌ', 'ṭa-ʿām', 'comida', 'food', 'أكل', '🍽️', 'taam'],
      [`Versión pesada de ت. Fíjate en el trazo vertical.`, `النسخة المفخّمة من التاء. انتبه إلى الخطّ الرأسيّ.`, `The heavy version of ت. Look for the vertical stroke.`],
      [`Un lazo cerrado atravesado por un trazo vertical. Sin puntos.`, `عُقدة مغلقة يخترقها خطّ رأسيّ. بلا نقاط.`, `A closed loop crossed by a vertical stroke. No dots.`],
      ['27:03', '27:58']),
    L('zza', 3, 'ظ', 'ظَاء', 'Ẓaa', 'ẓ', { dots: [1, 'above'], fam: 'tta' },
      [`Una "th" (como en "this") ENFÁTICA, más grave.`, `ظاء مُفخَّمة.`, `An EMPHATIC "th" (as in "this"), deeper.`],
      [`La punta de la lengua entre los dientes, con la parte de atrás elevada; con voz.`, `من طرف اللسان مع أطراف الثنايا العليا مع الإطباق.`, `Tongue tip between the teeth, back of the tongue raised; voiced.`],
      ['ظِلٌّ', 'ẓill', 'sombra', 'shade', 'ظلّ الشجرة', '🌳', 'zill'],
      [`Es ط con UN punto ARRIBA. Versión pesada de ذ.`, `هي الطاء مع نقطة فوقها. النسخة المفخّمة من الذال.`, `It is ط with ONE dot ABOVE. The heavy version of ذ.`],
      [`La forma de ط con UN punto arriba.`, `شكل الطاء مع نقطة واحدة فوقه.`, `The shape of ط with ONE dot above.`],
      ['28:02', '29:02']),
    L('ayn', 3, 'ع', 'عَيْن', 'ʿAyn', 'ʿ', { dots: [0, 'none'], fam: 'ayn' },
      [`Un sonido gutural profundo, sin equivalente: la voz sale con la garganta apretada.`, `حرف حلقيّ مجهور من وسط الحلق.`, `A deep guttural sound with no equivalent: voice through a tightened throat.`],
      [`Contrae el centro de la garganta y deja salir la voz, como al decir "aah" con la garganta apretada.`, `من وسط الحلق.`, `Squeeze the middle of the throat and let voice out, like a strained "aah".`],
      ['عَيْنٌ', 'ʿayn', 'ojo (también: manantial)', 'eye (also: spring)', 'للنظر', '👁️', 'ayn'],
      [`⚠️ Uno de los sonidos más difíciles. Ve despacio y repítelo con el audio.`, `⚠️ من أصعب الأصوات. تمهّل وكرّره مع الصوت.`, `⚠️ One of the hardest sounds. Go slowly and repeat it with the audio.`],
      [`Un pequeño gancho arriba y una curva abierta debajo (como una "e" girada). Sin puntos.`, `خُطّاف صغير في الأعلى ومنحنى مفتوح تحته (كحرف e مقلوب). بلا نقاط.`, `A small hook on top and an open curve below (like a turned "e"). No dots.`],
      ['29:04', '30:35']),
    L('ghayn', 3, 'غ', 'غَيْن', 'Ghayn', 'gh', { dots: [1, 'above'], fam: 'ayn' },
      [`Como la "r" francesa de "Paris": un gárgaras suave con voz.`, `غين مجهورة من أدنى الحلق.`, `Like the French "r" in "Paris": a soft gargle with voice.`],
      [`El fondo de la lengua roza el velo del paladar, con voz: como hacer gárgaras suaves.`, `من أدنى الحلق إلى الفم.`, `The back of the tongue brushes the soft palate, voiced: like a gentle gargle.`],
      ['غُرَابٌ', 'ghu-rāb', 'cuervo', 'crow', 'طائر أسود', '🐦', 'ghurab'],
      [`Es ع con UN punto ARRIBA.`, `هي العين مع نقطة فوقها.`, `It is ع with ONE dot ABOVE.`],
      [`La forma de ع con UN punto arriba.`, `شكل العين مع نقطة واحدة فوقه.`, `The shape of ع with ONE dot above.`],
      ['30:37', '32:30']),

    // ═══ المجموعة 4 ═══
    L('fa', 4, 'ف', 'فَاء', 'Faa', 'f', { dots: [1, 'above'], fam: 'fa' },
      [`Como la "f" de "foto".`, `مثل الفاء في «فَم».`, `Like "f" in "foot".`],
      [`Los dientes superiores rozan el labio inferior.`, `من باطن الشفة السفلى مع أطراف الثنايا العليا.`, `The upper teeth touch the lower lip.`],
      ['فَمٌ', 'fam', 'boca', 'mouth', 'للكلام', '👄', 'fam'],
      [`UN punto ARRIBA, sobre el lazo. Se parece a ق: la diferencia son los puntos (1 y 2).`, `نقطة واحدة فوق العُقدة. تشبه القاف: الفرق في النقاط (١ و٢).`, `ONE dot ABOVE the loop. It looks like ق: the difference is the dots (1 vs 2).`],
      [`Un lazo pequeño con UN punto arriba; aislada, con una cola corta hacia la izquierda.`, `عُقدة صغيرة مع نقطة فوقها؛ وفي المنفصلة ذيل قصير نحو اليسار.`, `A small loop with ONE dot above; isolated, with a short tail to the left.`],
      ['32:35', '33:53']),
    L('qaf', 4, 'ق', 'قَاف', 'Qaaf', 'q', { dots: [2, 'above'], fam: 'fa' },
      [`Una "k" pronunciada mucho más atrás, en la garganta.`, `قاف: من أقصى اللسان مع ما فوقه من الحنك.`, `A "k" made much farther back, in the throat.`],
      [`El fondo de la lengua toca el paladar blando y la úvula, muy atrás; sin voz y "pesada".`, `من أقصى اللسان مع ما فوقه من الحنك الأعلى.`, `The very back of the tongue touches the soft palate and uvula; voiceless and "heavy".`],
      ['قَمَرٌ', 'qa-mar', 'luna', 'moon', 'ينير الليل', '🌙', 'qamar'],
      [`DOS puntos ARRIBA. NO es la "k" española: piensa en tragar una "k".`, `نقطتان فوق الحرف. ليست الكاف: تخيّل أنك «تبتلع» الكاف.`, `TWO dots ABOVE. NOT a normal "k": imagine swallowing the "k".`],
      [`Un lazo con DOS puntos arriba y una cola profunda que baja por debajo de la línea.`, `عُقدة مع نقطتين فوقها وذيل عميق ينزل تحت السطر.`, `A loop with TWO dots above and a deep tail that drops below the line.`],
      ['33:55', '35:30']),
    L('kaf', 4, 'ك', 'كَاف', 'Kaaf', 'k', { dots: [0, 'none'], fam: 'solo' },
      [`Como la "k" de "kilo" o "casa".`, `مثل الكاف في «كِتَاب».`, `Like "k" in "kite".`],
      [`La parte media-trasera de la lengua toca el paladar, más adelante que ق.`, `من أقصى اللسان مع ما فوقه من الحنك، أدنى قليلاً من القاف.`, `The mid-back of the tongue touches the palate, a bit farther forward than ق.`],
      ['كِتَابٌ', 'ki-tāb', 'libro', 'book', 'أوراق مكتوبة', '📖', 'kitab'],
      [`SIN puntos. La forma cambia bastante entre aislada (ك) y unida (كـ ـكـ).`, `بلا نقاط. يتغيّر شكلها كثيراً بين المنفصلة (ك) والمتّصلة (كـ ـكـ).`, `NO dots. The shape changes a lot between isolated (ك) and joined (كـ ـكـ).`],
      [`Aislada: un trazo largo con un pequeño gancho dentro. Unida: una raya alta con un trazo inclinado.`, `المنفصلة: خطّ طويل بداخله خُطّاف صغير. المتّصلة: شرطة عالية مع خطّ مائل.`, `Isolated: a long stroke with a small hook inside. Joined: a tall stroke with a slanted mark.`],
      ['35:32', '36:52']),
    L('lam', 4, 'ل', 'لَام', 'Laam', 'l', { dots: [0, 'none'], fam: 'solo' },
      [`Como la "l" de "luna".`, `مثل اللام في «لَيْل».`, `Like "l" in "light".`],
      [`La punta de la lengua toca la encía superior y el aire sale por los lados.`, `من حافة اللسان مع ما يحاذيها من اللثة العليا.`, `The tongue tip touches the upper gum and air flows around the sides.`],
      ['لَيْلٌ', 'layl', 'noche', 'night', 'عكس النهار', '🌌', 'layl'],
      [`Con alif forma la unión especial لا («lā» = "no"): se escribe cruzada, no como dos letras sueltas.`, `مع الألف تُكتب لا: تتقاطعان ولا تُكتبان منفصلتين.`, `With alif it forms the special ligature لا ("lā" = "no"): written crossed, not as two separate letters.`],
      [`Un trazo alto vertical que baja y se curva a la izquierda por debajo de la línea. Sin puntos.`, `خطّ عالٍ رأسيّ ينزل ثم ينعطف نحو اليسار تحت السطر. بلا نقاط.`, `A tall vertical stroke that drops and curves left below the line. No dots.`],
      ['36:54', '38:00']),

    // ═══ المجموعة 5 ═══
    L('mim', 5, 'م', 'مِيم', 'Miim', 'm', { dots: [0, 'none'], fam: 'solo' },
      [`Como la "m" de "mamá".`, `مثل الميم في «مَاء».`, `Like "m" in "moon".`],
      [`Cierra los labios; el aire sale por la nariz.`, `من الشفتين: تنطبقان معاً.`, `Close the lips; air passes through the nose.`],
      ['مَاءٌ', 'māʾ', 'agua', 'water', 'للشرب', '💧', 'maa'],
      [`Un círculo pequeño con una cola que baja. Sin puntos.`, `دائرة صغيرة لها ذيل ينزل. بلا نقاط.`, `A small circle with a tail that drops. No dots.`],
      [`Un círculo pequeño y cerrado; aislada y final, con una cola que baja bajo la línea.`, `دائرة صغيرة مغلقة؛ وفي المنفصلة والأخيرة ذيل ينزل تحت السطر.`, `A small closed circle; isolated and final forms have a tail below the line.`],
      ['38:02', '39:33']),
    L('nun', 5, 'ن', 'نُون', 'Nuun', 'n', { dots: [1, 'above'], fam: 'ba' },
      [`Como la "n" de "nube".`, `مثل النون في «نَار».`, `Like "n" in "noon".`],
      [`La punta de la lengua toca la encía superior y el aire pasa por la nariz.`, `من طرف اللسان مع لثة الثنايا العليا.`, `The tongue tip touches the upper gum; air passes through the nose.`],
      ['نَارٌ', 'nār', 'fuego', 'fire', 'لهب', '🔥', 'nar'],
      [`UN punto ARRIBA. Unida (نـ ـنـ) es de la familia de ب ت ث. ¡La familia se completa!`, `نقطة واحدة فوق الحرف. في الاتّصال (نـ ـنـ) تنضمّ إلى عائلة ب ت ث.`, `ONE dot ABOVE. Joined (نـ ـنـ) it belongs to the family of ب ت ث. The family is complete!`],
      [`Aislada: un cuenco profundo con UN punto arriba. Unida: un diente con UN punto ARRIBA.`, `المنفصلة: حوض عميق مع نقطة فوقه. المتّصلة: سنّ صغيرة مع نقطة فوقها.`, `Isolated: a deep bowl with ONE dot above. Joined: a small tooth with ONE dot ABOVE.`],
      ['39:37', '41:00']),
    L('ha', 5, 'ه', 'هَاء', 'Haa', 'h', { dots: [0, 'none'], fam: 'solo' },
      [`Como la "h" suave del inglés "hello" (solo aire).`, `مثل الهاء في «هَوَاء».`, `Like the soft "h" in "hello".`],
      [`Desde lo más profundo de la garganta: un soplo suave, sin apretar.`, `من أقصى الحلق.`, `From the deepest part of the throat: a soft breath, no squeezing.`],
      ['هَوَاءٌ', 'ha-wāʾ', 'aire', 'air', 'نتنفّسه', '💨', 'hawa'],
      [`⚠️ Sus 4 formas se ven MUY distintas (ه هـ ـهـ ـه). Practícalas una por una.`, `⚠️ أشكالها الأربعة مختلفة جدّاً (ه هـ ـهـ ـه). تدرّب عليها واحداً واحداً.`, `⚠️ Its 4 forms look VERY different (ه هـ ـهـ ـه). Practise them one by one.`],
      [`Cambia mucho de forma: ه aislada, هـ inicial, ـهـ medial, ـه final. No lleva puntos.`, `يتغيّر شكلها كثيراً: ه منفصلة، هـ أوّل، ـهـ وسط، ـه آخر. بلا نقاط.`, `Its shape changes a lot: ه isolated, هـ initial, ـهـ medial, ـه final. No dots.`],
      ['41:02', '42:21']),
    L('waw', 5, 'و', 'وَاو', 'Waaw', 'w', { dots: [0, 'none'], fam: 'solo', conn: false, say: 'وَ' },
      [`Consonante: "w" de "wow". Vocal larga: "uu" (una "u" de "luna" alargada).`, `صامت (w) أو حرف مدّ (ū) مثل الواو في «نُور».`, `Consonant: "w" as in "wow". Long vowel: "uu" (like "moon").`],
      [`Redondea los labios y déjalos casi cerrados, como para silbar.`, `من الشفتين: تنفتحان مع استدارة.`, `Round your lips and leave them almost closed, as if whistling.`],
      ['وَرْدَةٌ', 'war-da', 'rosa (flor)', 'rose (flower)', 'زهرة', '🌹', 'warda'],
      [`Tiene dos usos: consonante "w" o vocal larga "ū". NO se une a la letra siguiente.`, `لها استعمالان: صامتة (w) أو حرف مدّ (ū). لا تتّصل بما بعدها.`, `Two jobs: the consonant "w" or the long vowel "ū". It does NOT join the next letter.`],
      [`Un lazo redondo pequeño con una cola que baja por debajo de la línea. Sin puntos.`, `عُقدة مستديرة صغيرة لها ذيل ينزل تحت السطر. بلا نقاط.`, `A small round loop with a tail that drops below the line. No dots.`],
      ['42:24', '42:56']),
    L('ya', 5, 'ي', 'يَاء', 'Yaa', 'y', { dots: [2, 'below'], fam: 'ba', say: 'يَ' },
      [`Consonante: "y" de "yema". Vocal larga: "ii" (una "i" de "mira" alargada).`, `صامت (y) أو حرف مدّ (ī) مثل الياء في «فِيل».`, `Consonant: "y" as in "yes". Long vowel: "ee" (like "seen").`],
      [`La parte media de la lengua sube cerca del paladar y los labios se estiran.`, `من وسط اللسان مع ما يحاذيه من الحنك الأعلى.`, `The middle of the tongue rises near the palate and the lips stretch.`],
      ['يَدٌ', 'yad', 'mano', 'hand', 'عضو الجسم', '✋', 'yad'],
      [`DOS puntos DEBAJO en todas sus formas. Unida (يـ ـيـ) es de la familia de ب ت ث ن.`, `نقطتان تحت الحرف في كل أشكاله. في الاتّصال (يـ ـيـ) تنتمي إلى عائلة ب ت ث ن.`, `TWO dots BELOW in every form. Joined (يـ ـيـ) it belongs to the family of ب ت ث ن.`],
      [`Unida: un diente con DOS puntos DEBAJO. Aislada y final: un cuenco con cola y DOS puntos debajo.`, `المتّصلة: سنّ صغيرة مع نقطتين تحتها. المنفصلة والأخيرة: حوض له ذيل ونقطتان تحته.`, `Joined: a small tooth with TWO dots BELOW. Isolated and final: a tailed bowl with TWO dots below.`],
      ['42:59', '44:32']),
  ];

  // حرفان إضافيان يظهران في فيديو الكتابة (وحدة وصل الحروف)
  const EXTRAS = [
    { id: 'taa_marbuta', ch: 'ة', nm: 'تَاء مَرْبُوطَة', tr: 'Taa marbūṭa', forms: { iso: 'ة', fin: 'ـة' }, clip: { start: '44:41', end: '45:28' },
      note: T([`Solo aparece al FINAL de una palabra (فَاطِمَة). Suena "a" o "ah"; si continúas leyendo, suena "t". No se une a lo que sigue.`, `تأتي في آخر الكلمة فقط (رَحْمَة). تُنطق هاءً عند الوقف وتاءً عند الوصل. لا تتّصل بما بعدها.`, `Appears only at the END of a word (رَحْمَة). Sounds like "a/ah" when you stop, and "t" when you keep reading. It does not join what follows.`]),
      ex: { w: 'رَحْمَةٌ', tr: 'raḥ-ma', es: 'misericordia', en: 'mercy', e: '🤍' } },
    { id: 'alif_maqsura', ch: 'ى', nm: 'أَلِف مَقْصُورَة', tr: 'Alif maqṣūra', forms: { iso: 'ى', fin: 'ـى' }, clip: { start: '45:32', end: '46:12' },
      note: T([`Solo al FINAL de una palabra. Se ve como ي sin puntos, pero suena como una "a" larga (مُوسَى, مَعْنَى).`, `في آخر الكلمة فقط. تُشبه الياء بلا نقاط لكنها تُنطق ألفاً (مُوسَى، مَعْنَى).`, `Only at the END of a word. It looks like ي without dots but sounds like a long "aa" (مُوسَى, مَعْنَى).`]),
      ex: { w: 'مَعْنَى', tr: 'maʿ-nā', es: 'significado', en: 'meaning', e: '💬' } },
  ];

  // ── عائلات الشكل: نحتفظ بالترتيب الأبجدي المألوف ونضيف العائلات تلميحاً بصرياً ──
  const FAMILIES = [
    { id: 'ba', members: ['ba', 'ta', 'tha', 'nun', 'ya'],
      title: T([`La familia del cuenco`, `عائلة الحوض`, `The bowl family`]),
      hint: T([`Mismo cuerpo, distintos puntos: 1 debajo → ب · 2 arriba → ت · 3 arriba → ث · 1 arriba → ن · 2 debajo → ي.`, `الجسم واحد والنقاط تفرّق: نقطة تحت ← ب · نقطتان فوق ← ت · ثلاث فوق ← ث · نقطة فوق ← ن · نقطتان تحت ← ي.`, `Same body, different dots: 1 below → ب · 2 above → ت · 3 above → ث · 1 above → ن · 2 below → ي.`]) },
    { id: 'jim', members: ['jim', 'hha', 'kha'],
      title: T([`La familia del gancho`, `عائلة الخُطّاف`, `The hook family`]),
      hint: T([`Un gancho: punto dentro → ج · sin punto → ح · punto arriba → خ.`, `خُطّاف واحد: نقطة داخله ← ج · بلا نقطة ← ح · نقطة فوقه ← خ.`, `One hook: dot inside → ج · no dot → ح · dot above → خ.`]) },
    { id: 'dal', members: ['dal', 'dhal'],
      title: T([`La familia del ángulo`, `عائلة الزاوية`, `The angle family`]),
      hint: T([`Sin punto → د · un punto arriba → ذ. Ninguna se une a la siguiente.`, `بلا نقطة ← د · نقطة فوق ← ذ. ولا تتّصل إحداهما بما بعدها.`, `No dot → د · one dot above → ذ. Neither joins the next letter.`]) },
    { id: 'ra', members: ['ra', 'zay'],
      title: T([`La familia de la coma`, `عائلة الفاصلة`, `The comma family`]),
      hint: T([`Sin punto → ر · un punto arriba → ز. Tampoco se unen a la siguiente.`, `بلا نقطة ← ر · نقطة فوق ← ز. ولا تتّصلان بما بعدهما.`, `No dot → ر · one dot above → ز. They don't join the next letter either.`]) },
    { id: 'sin', members: ['sin', 'shin'],
      title: T([`La familia de los dientes`, `عائلة الأسنان`, `The teeth family`]),
      hint: T([`Tres dientes: sin puntos → س · tres puntos arriba → ش.`, `ثلاث أسنان: بلا نقاط ← س · ثلاث نقاط فوق ← ش.`, `Three teeth: no dots → س · three dots above → ش.`]) },
    { id: 'sad', members: ['sad', 'dad'],
      title: T([`La familia del lazo`, `عائلة العُقدة`, `The loop family`]),
      hint: T([`Un lazo con cola: sin punto → ص · un punto arriba → ض.`, `عُقدة لها ذيل: بلا نقطة ← ص · نقطة فوق ← ض.`, `A loop with a tail: no dot → ص · one dot above → ض.`]) },
    { id: 'tta', members: ['tta', 'zza'],
      title: T([`La familia del lazo con palo`, `عائلة العُقدة والعمود`, `The loop-and-stick family`]),
      hint: T([`Lazo con trazo vertical: sin punto → ط · un punto arriba → ظ.`, `عُقدة يخترقها عمود: بلا نقطة ← ط · نقطة فوق ← ظ.`, `A loop with a vertical stroke: no dot → ط · one dot above → ظ.`]) },
    { id: 'ayn', members: ['ayn', 'ghayn'],
      title: T([`La familia de la garganta`, `عائلة الحلق`, `The throat family`]),
      hint: T([`Sin punto → ع · un punto arriba → غ.`, `بلا نقطة ← ع · نقطة فوق ← غ.`, `No dot → ع · one dot above → غ.`]) },
    { id: 'fa', members: ['fa', 'qaf'],
      title: T([`La familia del lazo pequeño`, `عائلة العُقدة الصغيرة`, `The little-loop family`]),
      hint: T([`Un punto arriba → ف · dos puntos arriba → ق.`, `نقطة فوق ← ف · نقطتان فوق ← ق.`, `One dot above → ف · two dots above → ق.`]) },
    { id: 'solo', members: ['alif', 'kaf', 'lam', 'mim', 'ha', 'waw'],
      title: T([`Letras con forma propia`, `حروف لكلّ منها شكله`, `Letters with their own shape`]),
      hint: T([`No tienen "parientes": aprende cada silueta por separado.`, `لا أقارب لها في الشكل: احفظ كلّ صورة على حدة.`, `No look-alikes: learn each silhouette on its own.`]) },
  ];

  // ── المجموعات (محطات الحروف) ──────────────────────────────────
  const GROUPS = {
    1: ['alif', 'ba', 'ta', 'tha', 'jim', 'hha', 'kha'],
    2: ['dal', 'dhal', 'ra', 'zay', 'sin', 'shin'],
    3: ['sad', 'dad', 'tta', 'zza', 'ayn', 'ghayn'],
    4: ['fa', 'qaf', 'kaf', 'lam'],
    5: ['mim', 'nun', 'ha', 'waw', 'ya'],
  };

  // ── الحركات والتنوين ───────────────────────────────────────────
  // glyph: العلامة وحدها على تطويلة؛ ex: أمثلة مع حرف الباء
  const MARKS = [
    { id: 'fatha', glyph: '\u0640\u064E', mark: '\u064E', nm: 'فَتْحَة', tr: 'Fatḥa', v: 'a', where: 'above',
      name: T([`Fatḥa (فَتْحَة)`, `الفَتْحَة`, `Fatha (فَتْحَة)`]),
      look: T([`Una rayita inclinada ARRIBA de la letra.`, `شرطة صغيرة مائلة فوق الحرف.`, `A small slanted dash ABOVE the letter.`]),
      sound: T([`Suena "a" corta, como la "a" de "casa".`, `تُنطق فتحة قصيرة كالألف في «بَ».`, `Sounds like a short "a", as in "cat".`]) },
    { id: 'kasra', glyph: '\u0640\u0650', mark: '\u0650', nm: 'كَسْرَة', tr: 'Kasra', v: 'i', where: 'below',
      name: T([`Kasra (كَسْرَة)`, `الكَسْرَة`, `Kasra (كَسْرَة)`]),
      look: T([`Una rayita inclinada DEBAJO de la letra.`, `شرطة صغيرة مائلة تحت الحرف.`, `A small slanted dash BELOW the letter.`]),
      sound: T([`Suena "i" corta, como la "i" de "mira".`, `تُنطق كسرة قصيرة كالياء في «بِ».`, `Sounds like a short "i", as in "sit".`]) },
    { id: 'damma', glyph: '\u0640\u064F', mark: '\u064F', nm: 'ضَمَّة', tr: 'Ḍamma', v: 'u', where: 'above',
      name: T([`Ḍamma (ضَمَّة)`, `الضَّمَّة`, `Damma (ضَمَّة)`]),
      look: T([`Una "و" diminuta ARRIBA de la letra.`, `واو صغيرة فوق الحرف.`, `A tiny "و" ABOVE the letter.`]),
      sound: T([`Suena "u" corta, como la "u" de "luna".`, `تُنطق ضمّة قصيرة كالواو في «بُ».`, `Sounds like a short "u", as in "put".`]) },
    { id: 'sukun', glyph: '\u0640\u0652', mark: '\u0652', nm: 'سُكُون', tr: 'Sukūn', v: '', where: 'above',
      name: T([`Sukūn (سُكُون)`, `السُّكُون`, `Sukun (سُكُون)`]),
      look: T([`Un circulito ARRIBA de la letra.`, `دائرة صغيرة فوق الحرف.`, `A tiny circle ABOVE the letter.`]),
      sound: T([`La letra suena sola, SIN vocal: se "corta". Ej.: مِنْ = "min".`, `يُنطق الحرف ساكناً بلا حركة: يُقطع. مثل: مِنْ.`, `The letter sounds alone, with NO vowel: it is "cut". E.g. مِنْ = "min".`]) },
    { id: 'shadda', glyph: '\u0640\u0651', mark: '\u0651', nm: 'شَدَّة', tr: 'Shadda', v: '', where: 'above',
      name: T([`Shadda (شَدَّة)`, `الشَّدَّة`, `Shadda (شَدَّة)`]),
      look: T([`Una "w" pequeña ARRIBA de la letra.`, `رأس شين صغير فوق الحرف.`, `A small "w"-like sign ABOVE the letter.`]),
      sound: T([`La letra se pronuncia DOBLE: una vez sin vocal y otra con vocal. Ej.: رَبّ = "rabb".`, `يُنطق الحرف مضاعفاً: مرّة ساكنة ومرّة متحرّكة. مثل: رَبّ.`, `The letter is pronounced DOUBLE: once without a vowel, once with it. E.g. رَبّ = "rabb".`]) },
    { id: 'tan_fath', glyph: '\u0640\u064B', mark: '\u064B', nm: 'تَنْوِين الفَتْح', tr: 'Tanwīn fatḥ', v: 'an', where: 'above',
      name: T([`Tanwīn con fatḥa (ـً)`, `تنوين الفتح (ـً)`, `Tanween fatha (ـً)`]),
      look: T([`Dos rayitas inclinadas ARRIBA (casi siempre con una alif: ـًا).`, `فتحتان فوق الحرف (وغالباً مع ألف: ـًا).`, `Two slanted dashes ABOVE (usually with an alif: ـًا).`]),
      sound: T([`Suena "an" al final de la palabra: كِتَابًا = "kitāban".`, `تُنطق «ـَنْ» في آخر الكلمة: كِتَابًا.`, `Sounds "an" at the end of a word: كِتَابًا = "kitāban".`]) },
    { id: 'tan_kasr', glyph: '\u0640\u064D', mark: '\u064D', nm: 'تَنْوِين الكَسْر', tr: 'Tanwīn kasr', v: 'in', where: 'below',
      name: T([`Tanwīn con kasra (ـٍ)`, `تنوين الكسر (ـٍ)`, `Tanween kasra (ـٍ)`]),
      look: T([`Dos rayitas inclinadas DEBAJO de la letra.`, `كسرتان تحت الحرف.`, `Two slanted dashes BELOW the letter.`]),
      sound: T([`Suena "in" al final de la palabra: كِتَابٍ = "kitābin".`, `تُنطق «ـِنْ» في آخر الكلمة: كِتَابٍ.`, `Sounds "in" at the end of a word: كِتَابٍ = "kitābin".`]) },
    { id: 'tan_damm', glyph: '\u0640\u064C', mark: '\u064C', nm: 'تَنْوِين الضَّمّ', tr: 'Tanwīn ḍamm', v: 'un', where: 'above',
      name: T([`Tanwīn con ḍamma (ـٌ)`, `تنوين الضمّ (ـٌ)`, `Tanween damma (ـٌ)`]),
      look: T([`Dos "و" diminutas ARRIBA de la letra.`, `ضمّتان فوق الحرف.`, `Two tiny "و" ABOVE the letter.`]),
      sound: T([`Suena "un" al final de la palabra: كِتَابٌ = "kitābun".`, `تُنطق «ـُنْ» في آخر الكلمة: كِتَابٌ.`, `Sounds "un" at the end of a word: كِتَابٌ = "kitābun".`]) },
  ];

  // ── الفيديو (مقاطع start/end بالثواني) ─────────────────────────
  // ملاحظة: المعرّفات والتوقيتات مأخوذة من مواصفات المشروع ولم يُتحقَّق منها بلا اتصال.
  const V = (id, a, b) => ({ provider: 'youtube', id, start: ts(a), end: ts(b) });
  const VIDEO = {
    // V0 — فيديو تعريفي ~90 ثانية، يُستضاف داخل التطبيق (≤ 2MB). لم يُرفع بعد.
    intro: { provider: 'local', src: 'assets/video/arabic_intro.mp4', poster: 'assets/courses/arabic/intro-poster.webp', start: 0, end: 30 },
    lettersIntro: V('LfCWAyQWUWc', '3:19', '8:54'),
    sounds: {
      1: V('73iZ56eliz0', '0:13', '0:36'),
      2: V('73iZ56eliz0', '0:37', '0:59'),
      3: V('73iZ56eliz0', '0:59', '1:19'),
      4: V('73iZ56eliz0', '1:20', '1:33'),
      5: V('73iZ56eliz0', '1:35', '1:51'),
    },
    reading: {
      intro: V('EsQfp1oy0HU', '0:31', '3:15'),
      general: V('EsQfp1oy0HU', '3:16', '4:05'),
      fatha: V('EsQfp1oy0HU', '4:05', '5:56'),
      kasra: V('EsQfp1oy0HU', '5:56', '7:15'),
      damma: V('EsQfp1oy0HU', '7:15', '9:05'),
      sukun: V('EsQfp1oy0HU', '9:05', '13:33'),
      shadda: V('EsQfp1oy0HU', '13:35', '17:52'),
      tanween: V('EsQfp1oy0HU', '18:58', '26:34'),
    },
    writingId: 'AJGry6FeJM0',
    // فيديوهات كاملة (بلا قصّ) لبطاقتَي سورتَي الفاتحة والإخلاص، بترجمة إسبانية.
    fatihaFull: { provider: 'youtube', id: 'hE7cnsFfIus' },
    ikhlasFull: { provider: 'youtube', id: 'OD-onPuCiGs' },
  };

  // مقطع كتابة حرف: من فيديو الكتابة
  const writingClip = (item) => item && item.clip
    ? { provider: 'youtube', id: VIDEO.writingId, start: ts(item.clip.start), end: ts(item.clip.end) }
    : null;

  const byId = {};
  LETTERS.forEach(l => { byId[l.id] = l; });

  return { T, ts, LETTERS, EXTRAS, FAMILIES, GROUPS, MARKS, VIDEO, writingClip, byId };
})();

if (typeof window !== 'undefined') window.ARABIC_DATA = ARABIC_DATA;
if (typeof module !== 'undefined') module.exports = ARABIC_DATA;
