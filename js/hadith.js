// 📜 Hadith del día — 14 hadices auténticos (sahih) con traducción ES/EN fiel
// y fuente documentada en los tres idiomas. Rotación quincenal por día del año
// (mismo mecanismo que getDuaOfTheDay). v61.
const DAILY_HADITHS = [
  {
    arabic: '«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»',
    translation_es: 'Las obras valen según las intenciones, y cada cual tendrá conforme a lo que se haya propuesto.',
    translation_en: 'Actions are but by intentions, and every person shall have only that which he intended.',
    source_ar: 'متفق عليه — البخاري ١ · مسلم ١٩٠٧',
    source_es: 'Acordado — Al-Bujari 1 · Muslim 1907',
    source_en: 'Agreed upon — al-Bukhari 1 · Muslim 1907',
  },
  {
    arabic: '«الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ»',
    translation_es: 'La purificación es la mitad de la fe, y «Alabado sea Dios» llena la Balanza.',
    translation_en: 'Purification is half of faith, and “Praise be to Allah” fills the Scale.',
    source_ar: 'رواه مسلم ٢٢٣',
    source_es: 'Muslim 223',
    source_en: 'Muslim 223',
  },
  {
    arabic: '«مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ»',
    translation_es: 'A quien transite un camino buscando el conocimiento, Dios le facilitará por él un camino hacia el Paraíso.',
    translation_en: 'Whoever travels a path seeking knowledge, Allah will make easy for him thereby a path to Paradise.',
    source_ar: 'رواه مسلم ٢٦٩٩',
    source_es: 'Muslim 2699',
    source_en: 'Muslim 2699',
  },
  {
    arabic: '«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»',
    translation_es: 'El mejor de vosotros es quien aprende el Corán y lo enseña.',
    translation_en: 'The best of you are those who learn the Qur’an and teach it.',
    source_ar: 'رواه البخاري ٥٠٢٧',
    source_es: 'Al-Bujari 5027',
    source_en: 'al-Bukhari 5027',
  },
  {
    arabic: '«الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ»',
    translation_es: 'El musulmán es aquel de cuya lengua y de cuya mano están a salvo los demás musulmanes.',
    translation_en: 'The Muslim is the one from whose tongue and hand the Muslims are safe.',
    source_ar: 'متفق عليه — البخاري ١٠ · مسلم ٤٠',
    source_es: 'Acordado — Al-Bujari 10 · Muslim 40',
    source_en: 'Agreed upon — al-Bukhari 10 · Muslim 40',
  },
  {
    arabic: '«لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ»',
    translation_es: 'No será creyente ninguno de vosotros hasta que ame para su hermano lo que ama para sí mismo.',
    translation_en: 'None of you truly believes until he loves for his brother what he loves for himself.',
    source_ar: 'متفق عليه — البخاري ١٣ · مسلم ٤٥',
    source_es: 'Acordado — Al-Bujari 13 · Muslim 45',
    source_en: 'Agreed upon — al-Bukhari 13 · Muslim 45',
  },
  {
    arabic: '«مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ»',
    translation_es: 'Quien crea en Dios y en el Último Día, que diga el bien o calle.',
    translation_en: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.',
    source_ar: 'متفق عليه — البخاري ٦٠١٨ · مسلم ٤٧',
    source_es: 'Acordado — Al-Bujari 6018 · Muslim 47',
    source_en: 'Agreed upon — al-Bukhari 6018 · Muslim 47',
  },
  {
    arabic: '«اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ»',
    translation_es: 'Teme a Dios dondequiera que estés, haz una buena obra tras una mala y la borrará, y trata a la gente con buen carácter.',
    translation_en: 'Be mindful of Allah wherever you are, follow a bad deed with a good one and it will erase it, and treat people with good character.',
    source_ar: 'رواه الترمذي ١٩٨٧ (حسن صحيح)',
    source_es: 'At-Tirmidhi 1987 (hasan sahih)',
    source_en: 'at-Tirmidhi 1987 (hasan sahih)',
  },
  {
    arabic: '«الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ»',
    translation_es: 'La palabra buena es una caridad.',
    translation_en: 'A good word is charity.',
    source_ar: 'متفق عليه — البخاري ٢٩٨٩ · مسلم ١٠٠٩',
    source_es: 'Acordado — Al-Bujari 2989 · Muslim 1009',
    source_en: 'Agreed upon — al-Bukhari 2989 · Muslim 1009',
  },
  {
    arabic: '«مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ»',
    translation_es: 'Quien reza las dos oraciones frescas (Fajr y Asr) entrará en el Paraíso.',
    translation_en: 'Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.',
    source_ar: 'متفق عليه — البخاري ٥٧٤ · مسلم ٦٣٥',
    source_es: 'Acordado — Al-Bujari 574 · Muslim 635',
    source_en: 'Agreed upon — al-Bukhari 574 · Muslim 635',
  },
  {
    arabic: '«أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»',
    translation_es: 'Las obras más amadas por Dios son las más constantes, aunque sean pocas.',
    translation_en: 'The most beloved deeds to Allah are the most consistent, even if small.',
    source_ar: 'متفق عليه — البخاري ٦٤٦٤ · مسلم ٧٨٣',
    source_es: 'Acordado — Al-Bujari 6464 · Muslim 783',
    source_en: 'Agreed upon — al-Bukhari 6464 · Muslim 783',
  },
  {
    arabic: '«مَنْ دَعَا إِلَى هُدًى كَانَ لَهُ مِنَ الْأَجْرِ مِثْلُ أُجُورِ مَنْ تَبِعَهُ لَا يَنْقُصُ ذَلِكَ مِنْ أُجُورِهِمْ شَيْئًا»',
    translation_es: 'Quien invite a la guía tendrá una recompensa igual a la de quienes le sigan, sin que ello les reste nada de su recompensa.',
    translation_en: 'Whoever calls to guidance will have a reward like that of those who follow him, without diminishing their rewards in any way.',
    source_ar: 'رواه مسلم ٢٦٧٤',
    source_es: 'Muslim 2674',
    source_en: 'Muslim 2674',
  },
  {
    arabic: '«الْبِرُّ حُسْنُ الْخُلُقِ، وَالْإِثْمُ مَا حَاكَ فِي نَفْسِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ»',
    translation_es: 'La bondad es el buen carácter; y el pecado es aquello que remueve tu pecho y te disgusta que la gente conozca.',
    translation_en: 'Righteousness is good character, and sin is what wavers in your soul and you would dislike people to know of it.',
    source_ar: 'رواه مسلم ٢٥٥٣',
    source_es: 'Muslim 2553',
    source_en: 'Muslim 2553',
  },
  {
    arabic: '«مَنْ غَدَا إِلَى الْمَسْجِدِ أَوْ رَاحَ أَعَدَّ اللَّهُ لَهُ فِي الْجَنَّةِ نُزُلًا»',
    translation_es: 'A quien va al alba o al atardecer a la mezquita, Dios le prepara una morada en el Paraíso por cada ida y venida.',
    translation_en: 'Whoever goes to the mosque in the morning or the evening, Allah prepares for him a place in Paradise for every going and coming.',
    source_ar: 'متفق عليه — البخاري ٦٦٢ · مسلم ٦٦٩',
    source_es: 'Acordado — Al-Bujari 662 · Muslim 669',
    source_en: 'Agreed upon — al-Bukhari 662 · Muslim 669',
  },
];

// Hadiz del día: rotación por día del año (ciclo de 14 días), igual que DAILY_DUAS.
function getHadithOfTheDay() {
  const today = new Date();
  const day = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return DAILY_HADITHS[day % DAILY_HADITHS.length];
}

if (typeof window !== 'undefined') {
  window.DAILY_HADITHS = DAILY_HADITHS;
  window.getHadithOfTheDay = getHadithOfTheDay;
}
