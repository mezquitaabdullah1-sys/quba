// 📿 AdhkarNotify (v1.0.79) — أذكار حقيقية لإشعارات الأذكار داخل التطبيق
//
// الغرض: الإشعار الذي يصل والتطبيق مفتوح يحمل ذكرًا حقيقيًا كاملًا مع مرجعه
// (نفس مجموعة AdhkarTexts في Native، فالنص واحد في الحالتين)، بدل رسالة عامة.
// الجدولة: نوافذ الصباح (٥-٩) والمساء (١٦-٢١) والنوم (٢١-٢٣)، بفترة
// NotifCenter.getSettings().adhkarFrequency بالدقائق، وتُحفظ آخر مرة في
// Storage كي لا تتكرّر عند إعادة فتح الصفحة.
const AdhkarNotify = {
  _lastKey: 'adhkar_last_sent',

  POOL: {
    morning: [
      { ar: '﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...﴾ آية الكرسي — «مَنْ قَالَهَا حِينَ يُصْبِحُ أُجِيرَ مِنَ الْجِنِّ حَتَّى يُمْسِيَ»', es: 'Ayat al-Kursi — «Quien la recita al amanecer queda protegido hasta la tarde»', en: 'Ayat al-Kursi — "Whoever recites it in the morning is protected until evening"', source: 'البقرة ٢٥٥ · صحيح الترغيب ٦٥٥' },
      { ar: '«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ»', es: '«Hemos amanecido y el dominio pertenece a Allah...»', en: '"We have entered the morning and the dominion belongs to Allah..."', source: 'صحيح مسلم ٢٧٢٣' },
      { ar: '«اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ»', es: '«Oh Allah, por Ti amanecemos y atardecemos, por Ti vivimos y morimos»', en: '"O Allah, by You we enter the morning and the evening, by You we live and die"', source: 'سنن الترمذي ٣٣٩١ (حسن)' },
      { ar: '«سُبْحَانَ اللَّهِ وَبِحَمْدِهِ» مئة مرة — «لَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا جَاءَ بِهِ»', es: '«Subhanallahi wa bihamdihi» cien veces por la mañana', en: '"Subhanallahi wa bihamdihi" one hundred times in the morning', source: 'صحيح مسلم ٢٦٩٢' },
    ],
    evening: [
      { ar: '«أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ»', es: '«Hemos atardecido y el dominio pertenece a Allah...»', en: '"We have entered the evening and the dominion belongs to Allah..."', source: 'صحيح مسلم ٢٧٢٣' },
      { ar: '«أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ» ثلاث مرات — «لَمْ يَضُرَّهُ شَيْءٌ»', es: '«Me refugio en las palabras perfectas de Allah» (tres veces)', en: '"I seek refuge in the perfect words of Allah" (three times)', source: 'صحيح مسلم ٢٧٠٩' },
      { ar: '«اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ»', es: '«Oh Allah, concede salud a mi cuerpo, mi oído y mi vista»', en: '"O Allah, grant my body, hearing and sight soundness"', source: 'سنن أبي داود ٥٠٩٠ (حسن)' },
    ],
    sleep: [
      { ar: '«بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا»', es: '«En Tu nombre, oh Allah, muero y vivo»', en: '"In Your name, O Allah, I die and I live"', source: 'صحيح البخاري ٦٣٢٤' },
      { ar: 'آية الكرسي عند النوم — «لَنْ يَزَالَ عَلَيْكَ مِنَ اللَّهِ حَافِظٌ، وَلَا يَقْرَبُكَ شَيْطَانٌ حَتَّى تُصْبِحَ»', es: 'Ayat al-Kursi al dormir: ningún demonio se acercará hasta el amanecer', en: 'Ayat al-Kursi before sleep: no devil comes near until morning', source: 'صحيح البخاري ٢٣١١' },
      { ar: '«اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ» ثلاث مرات', es: '«Oh Allah, protégeme de Tu castigo el día que resucites a Tus siervos»', en: '"O Allah, save me from Your punishment on the Day You resurrect Your servants"', source: 'سنن أبي داود ٥٠٤٥ (صحيح)' },
      { ar: 'التسبيح قبل النوم: «سُبْحَانَ اللَّهِ» ٣٣ · «الْحَمْدُ لِلَّهِ» ٣٣ · «اللَّهُ أَكْبَرُ» ٣٤ — «خَيْرٌ لَكُمَا مِنْ خَادِمٍ»', es: 'Tasbih antes de dormir: 33 · 33 · 34', en: 'Tasbih before sleep: 33 · 33 · 34', source: 'صحيح البخاري ٦٣١٨' },
    ],
    general: [
      { ar: '«سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ»', es: '«Glorificado sea Allah, la alabanza es para Allah, no hay divinidad sino Allah y Allah es el más Grande»', en: '"Glory be to Allah, praise be to Allah, there is no god but Allah, and Allah is the Greatest"', source: 'صحيح مسلم ٢١٣٧' },
      { ar: '«لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ» — «كَنْزٌ مِنْ كُنُوزِ الْجَنَّةِ»', es: '«No hay fuerza ni poder sino con Allah» — un tesoro del Paraíso', en: '"There is no power nor might except with Allah" — a treasure of Paradise', source: 'صحيح البخاري ٦٣٨٤' },
      { ar: '«سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ» — «كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ»', es: '«Dos palabras ligeras en la lengua, pesadas en la balanza»', en: '"Two words light on the tongue, heavy on the scales"', source: 'صحيح البخاري ٦٦٨٢' },
      { ar: '«اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ» — «مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللهُ عَلَيْهِ بِهَا عَشْرًا»', es: '«Quien me envía una bendición, Allah le envía diez»', en: '"Whoever sends one blessing upon me, Allah sends ten upon him"', source: 'صحيح مسلم ٤٠٨' },
    ],
  },

  TITLES: {
    morning: { ar: 'أذكار الصباح', es: 'Adhkar de la mañana', en: 'Morning adhkar' },
    evening: { ar: 'أذكار المساء', es: 'Adhkar de la tarde', en: 'Evening adhkar' },
    sleep:   { ar: 'أذكار النوم',  es: 'Adhkar antes de dormir', en: 'Adhkar before sleep' },
    general: { ar: 'ذكر',         es: 'Dhikr', en: 'Dhikr' },
  },

  _loc() { return (typeof currentLocale !== 'undefined' && currentLocale) || 'es'; },

  /** الفئة المناسبة لهذه اللحظة (أو null إن لم نكن في نافذة أذكار). */
  windowCategory(d = new Date()) {
    const h = d.getHours();
    if (h >= 5 && h < 9) return 'morning';
    if (h >= 16 && h < 21) return 'evening';
    if (h >= 21 && h < 23) return 'sleep';
    return null;
  },

  pick(category) {
    const pool = this.POOL[category] || this.POOL.general;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  _on() {
    try {
      if (typeof NotifCenter !== 'undefined' && NotifCenter.getSettings) {
        const s = NotifCenter.getSettings();
        if (s.adhkar === false) return false;
        return Number(s.adhkarFrequency ?? 120) > 0;
      }
    } catch (e) {}
    return true;
  },

  /** يُرسل إشعار أذكار حقيقيًا واحدًا (يُستدعى من المؤقّت). */
  tick() {
    if (!this._on()) return;
    const cat = this.windowCategory();
    if (!cat) return;
    const freq = (() => { try { return Number(NotifCenter.getSettings().adhkarFrequency ?? 120); } catch (e) { return 120; } })();
    const now = Date.now();
    let last = 0;
    try { last = parseInt(Storage.get(this._lastKey), 10) || 0; } catch (e) {}
    if (now - last < freq * 60 * 1000) return;

    const item = this.pick(cat);
    const loc = this._loc();
    const title = (this.TITLES[cat] && this.TITLES[cat][loc]) || this.TITLES.general[loc];
    const body = (loc === 'ar' ? item.ar : (loc === 'en' ? item.en : item.es)) + '\n— ' + item.source;
    try { Storage.set(this._lastKey, now); } catch (e) {}

    if (typeof NotifCenter !== 'undefined' && typeof NotifCenter._notify === 'function') {
      try { NotifCenter._notify(title, body, 'quba-adhkar-' + cat); return; } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.Android && window.Android.showNotification) {
      try {
        window.Android.showNotification(JSON.stringify({ title, body, tag: 'quba-adhkar-' + cat, actions: [] }));
      } catch (e) {}
    }
  },

  start() {
    if (this._timer) return;
    this._timer = setInterval(() => this.tick(), 60 * 1000);
    setTimeout(() => this.tick(), 8000);
  },
};

if (typeof window !== 'undefined') window.AdhkarNotify = AdhkarNotify;
