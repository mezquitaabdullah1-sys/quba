// 🌙 v1.0.162 — دليل رمضان التعليمي: فضل الشهر، العشر الأواخر، خطة الاستغلال،
// ليلة القدر (فضلًا وأدعية)، التراويح والتهجد، صلاة العيد وأحكامه وآدابه.
// كل نص شرعي مذكور بلفظه ومصدره؛ والمسائل الخلافية تُحال إلى جهة الإفتاء.
const RamadanGuide = {
  SECTIONS: [
    /* ================= ١) فضل رمضان ================= */
    {
      id: 'fadl',
      ic: 'fa-moon',
      ti: { ar: 'فضل رمضان', es: 'La virtud de Ramadán', en: 'The virtue of Ramadan' },
      lead: {
        ar: 'رمضان شهر القرآن، تُفتح فيه أبواب الجنة وتُغلق أبواب النار وتُصفَّد الشياطين، فجعله الله موسمًا لتجديد الإيمان وتربية النفس على التقوى.',
        es: 'Ramadán es el mes del Corán: se abren las puertas del Paraíso, se cierran las del Fuego y se encadenan los demonios. Dios lo hizo una temporada para renovar la fe y educar el alma en la piedad.',
        en: 'Ramadan is the month of the Qur’an: the gates of Paradise are opened, the gates of Hell are closed and the devils are chained. God made it a season to renew faith and train the soul in taqwa.'
      },
      txt: [
        {
          ar: '﴿شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ﴾',
          es: '“El mes de Ramadán, en el que fue revelado el Corán, como guía para la humanidad y prueba clara de la guía y del criterio.”',
          en: '“The month of Ramadan in which was revealed the Qur’an, a guidance for mankind and clear proofs of guidance and criterion.”',
          s: 'البقرة ١٨٥', se: 'Al-Baqara 185'
        },
        {
          ar: '«إِذَا جَاءَ رَمَضَانُ فُتِّحَتْ أَبْوَابُ الْجَنَّةِ، وَغُلِّقَتْ أَبْوَابُ النَّارِ، وَصُفِّدَتِ الشَّيَاطِينُ»',
          es: '“Cuando llega Ramadán se abren las puertas del Paraíso, se cierran las del Fuego y se encadenan los demonios.”',
          en: '“When Ramadan comes, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.”',
          s: 'البخاري ١٨٩٩', se: 'Sahih al-Bujari 1899'
        },
        {
          ar: '«مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ»',
          es: '“Quien ayune Ramadán con fe y buscando la recompensa, le serán perdonados sus pecados anteriores.”',
          en: '“Whoever fasts Ramadan out of faith and seeking reward will have his previous sins forgiven.”',
          s: 'البخاري ٣٨، مسلم ٧٦٠', se: 'Bujari 38, Muslim 760'
        },
        {
          ar: '«مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ»',
          es: '“Quien rece en Ramadán con fe y buscando la recompensa, le serán perdonados sus pecados anteriores.”',
          en: '“Whoever stands in prayer during Ramadan out of faith and seeking reward will have his previous sins forgiven.”',
          s: 'البخاري ٣٧', se: 'Sahih al-Bujari 37'
        },
        {
          ar: '«لِلصَّائِمِ فَرْحَتَانِ: فَرْحَةٌ عِنْدَ فِطْرِهِ، وَفَرْحَةٌ عِنْدَ لِقَاءِ رَبِّهِ»',
          es: '“El ayunante tiene dos alegrías: al romper su ayuno y al encontrarse con su Señor.”',
          en: '“The fasting person has two joys: when he breaks his fast and when he meets his Lord.”',
          s: 'مسلم ١١٥١', se: 'Muslim 1151'
        },
        {
          ar: '«إِنَّ فِي الْجَنَّةِ بَابًا يُقَالُ لَهُ الرَّيَّانُ، يَدْخُلُ مِنْهُ الصَّائِمُونَ يَوْمَ الْقِيَامَةِ»',
          es: '“En el Paraíso hay una puerta llamada Al-Rayyan, por la que entrarán los ayunantes el Día del Juicio.”',
          en: '“In Paradise there is a gate called Al-Rayyan, through which the fasting people will enter on the Day of Resurrection.”',
          s: 'البخاري ١٨٩٦', se: 'Sahih al-Bujari 1896'
        }
      ],
      pts: [
        {
          t: { ar: 'الصيام ركن من أركان الإسلام', es: 'El ayuno es un pilar del Islam', en: 'Fasting is a pillar of Islam' },
          b: {
            ar: 'صيام رمضان أحد أركان الإسلام الخمسة التي بُني عليها الدين، فهو فرض عين على كل مسلم بالغ قادر، ولا يُترك إلا بعذر شرعي.',
            es: 'El ayuno de Ramadán es uno de los cinco pilares sobre los que se edifica el Islam: es obligatorio para todo musulmán adulto y capaz, y solo se deja por una excusa legal.',
            en: 'Fasting Ramadan is one of the five pillars on which the religion is built: obligatory for every adult, able Muslim, and only waived by a legal excuse.'
          }
        },
        {
          t: { ar: 'الصوم ليس إمساكًا عن الطعام فقط', es: 'El ayuno no es solo abstenerse de comer', en: 'Fasting is not only abstaining from food' },
          b: {
            ar: 'قال ﷺ: «مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالْعَمَلَ بِهِ فَلَيْسَ لِلَّهِ حَاجَةٌ فِي أَنْ يَدَعَ طَعَامَهُ وَشَرَابَهُ» (البخاري ١٩٠٣). فالصوم حفظ للسان والعين واليد عن الحرام.',
            es: 'Dijo el Profeta ﷺ: “Quien no abandona la mentira y el acto de mentir, Dios no tiene necesidad de que deje su comida y su bebida” (Bujari 1903). El ayuno protege la lengua, la mirada y la mano.',
            en: 'The Prophet ﷺ said: “Whoever does not give up false speech and acting upon it, God has no need of his giving up his food and drink” (Bukhari 1903). Fasting guards the tongue, the eye and the hand.'
          }
        },
        {
          t: { ar: 'غايته التقوى لا الجوع', es: 'Su meta es la taqwa, no el hambre', en: 'Its goal is taqwa, not hunger' },
          b: {
            ar: '﴿يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ﴾ (البقرة ١٨٣) — فالثمرة المطلوبة قلبٌ يتقي الله بعد الشهر.',
            es: '“Se os ha prescrito el ayuno como se prescribió a quienes os precedieron, para que alcancéis la piedad” (Al-Baqara 183). El fruto buscado es un corazón que tema a Dios después del mes.',
            en: '“Fasting is prescribed for you as it was prescribed for those before you, that you may attain taqwa” (Al-Baqara 183). The intended fruit is a heart mindful of God after the month.'
          }
        }
      ]
    },

    /* ================= ٢) فضل العشر الأواخر ================= */
    {
      id: 'ashr',
      ic: 'fa-star-and-crescent',
      ti: { ar: 'فضل العشر الأواخر', es: 'La virtud de las diez últimas noches', en: 'The virtue of the last ten nights' },
      lead: {
        ar: 'العشر الأواخر خلاصة الشهر وذروته: فيها ليلة القدر، وفيها كان النبي ﷺ يضاعف العمل ويوقظ أهله.',
        es: 'Las diez últimas noches son la esencia y la cima del mes: en ellas está Laylat al-Qadr, y en ellas el Profeta ﷺ redoblaba su esfuerzo y despertaba a su familia.',
        en: 'The last ten nights are the essence and peak of the month: they contain Laylat al-Qadr, and in them the Prophet ﷺ redoubled his effort and woke his family.'
      },
      txt: [
        {
          ar: '«كَانَ رَسُولُ اللَّهِ ﷺ إِذَا دَخَلَ الْعَشْرُ أَحْيَا لَيْلَهُ، وَأَيْقَظَ أَهْلَهُ، وَجَدَّ وَشَدَّ الْمِئْزَرَ»',
          es: '“Cuando entraban las diez últimas, el Mensajero de Dios ﷺ vivificaba su noche, despertaba a su familia, se esforzaba y se ceñía el vestido.”',
          en: '“When the last ten nights came, the Messenger of God ﷺ would give life to his night, wake his family, strive hard and tighten his waist-wrapper.”',
          s: 'مسلم ١١٧٤', se: 'Muslim 1174'
        },
        {
          ar: '«تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْعَشْرِ الْأَوَاخِرِ مِنْ رَمَضَانَ»',
          es: '“Buscad Laylat al-Qadr en las diez últimas noches de Ramadán.”',
          en: '“Seek out Laylat al-Qadr in the last ten nights of Ramadan.”',
          s: 'البخاري ٢٠١٧', se: 'Sahih al-Bujari 2017'
        },
        {
          ar: '«كَانَ النَّبِيُّ ﷺ يَعْتَكِفُ الْعَشْرَ الْأَوَاخِرَ مِنْ رَمَضَانَ»',
          es: '“El Profeta ﷺ solía hacer itikaf (retiro) en las diez últimas noches de Ramadán.”',
          en: '“The Prophet ﷺ used to observe i‘tikaf during the last ten nights of Ramadan.”',
          s: 'البخاري ومسلم', se: 'Bujari y Muslim'
        },
        {
          ar: '﴿وَلَيَالٍ عَشْرٍ﴾',
          es: '“Y por las diez noches” (Al-Fayr 2), que muchos exegetas refieren a las diez de Dhul-Hiyya y otros al final de Ramadán.',
          en: '“And by the ten nights” (Al-Fajr 2), which many exegetes refer to the ten of Dhul-Hijjah and others to the end of Ramadan.',
          s: 'الفجر ٢', se: 'Al-Fayr 2'
        }
      ],
      pts: [
        {
          t: { ar: 'اجتهادٌ فوق المعتاد', es: 'Un esfuerzo mayor que el habitual', en: 'Effort beyond the usual' },
          b: {
            ar: 'كان عمل النبي ﷺ في العشر يزيد على عمل سائر الشهر، فاجعل لنفسك فيها برنامجًا أعلى: ليلٌ مُحيا، وقرآن أكثر، وصدقة يومية، واعتكاف ما تيسّر.',
            es: 'La obra del Profeta ﷺ en estas noches superaba la del resto del mes. Hazte un programa más exigente: noche viva, más Corán, limosna diaria y retiro en la medida de lo posible.',
            en: 'The Prophet’s worship in these nights exceeded the rest of the month. Set yourself a higher programme: a living night, more Qur’an, daily charity and retreat as you are able.'
          }
        },
        {
          t: { ar: 'إيقاظ الأهل شريك في الأجر', es: 'Despertar a la familia comparte la recompensa', en: 'Waking the family shares the reward' },
          b: {
            ar: 'لم يكن يجتهد وحده بل يوقظ أهله، فشجّع من في بيتك على القيام ولو بركعتين، وأيقظهم في الليالي الوترية.',
            es: 'No se esforzaba solo: despertaba a su familia. Anima a los tuyos a rezar aunque sean dos rak‘as, sobre todo en las noches impares.',
            en: 'He did not strive alone: he woke his household. Encourage your family to pray even two rak‘ahs, especially on the odd nights.'
          }
        },
        {
          t: { ar: 'الاعتكاف سُنّة مهجورة', es: 'El itikaf, una sunna poco practicada', en: 'I‘tikaf, a neglected sunnah' },
          b: {
            ar: 'الاعتكاف لزوم المسجد للعبادة، وأقله عند كثير من الفقهاء ساعة، ويشترط له الطهارة وترك ما لا يعنيك. إن لم تستطع عشرة أيام فاجعلها ليلة أو ليلتين.',
            es: 'El itikaf es permanecer en la mezquita para adorar. Para muchos juristas su mínimo es una hora, con pureza ritual y dejando lo que no te concierne. Si no puedes diez días, hazlo una o dos noches.',
            en: 'I‘tikaf is staying in the mosque for worship; for many jurists its minimum is an hour, requiring ritual purity and leaving what does not concern you. If you cannot do ten days, do one or two nights.'
          }
        }
      ]
    },

    /* ================= ٣) كيف تستغل رمضان ================= */
    {
      id: 'plan',
      ic: 'fa-list-check',
      ti: { ar: 'كيف تستغل رمضان والأعمال الصالحة', es: 'Cómo aprovechar Ramadán y las obras buenas', en: 'How to make the most of Ramadan and good deeds' },
      lead: {
        ar: 'أكبر خطأ أن يمرّ الشهر بالنية الحسنة دون خطة. اضبط يومك على أوقات الصلوات، واجعل لكل وقت عملًا محددًا يُقاس، وابدأ بما تقدر على الدوام عليه.',
        es: 'El mayor error es dejar pasar el mes con buena intención pero sin plan. Ordena tu día por las horas de oración, asigna a cada franja una obra concreta y medible, y empieza por lo que puedas mantener.',
        en: 'The biggest mistake is letting the month pass with good intention but no plan. Anchor your day to the prayer times, give each slot a concrete measurable deed, and start with what you can sustain.'
      },
      plan: [
        { t: { ar: 'قبل الفجر', es: 'Antes del alba', en: 'Before dawn' }, a: { ar: 'سحور خفيف، نية الصيام، استغفار حتى الفجر', es: 'Suhur ligero, intención de ayunar, istigfar hasta el alba', en: 'Light suhur, intention to fast, seeking forgiveness until dawn' } },
        { t: { ar: 'الفجر', es: 'Alba', en: 'Dawn' }, a: { ar: 'صلاة الفجر في وقتها، أذكار الصباح، ورد القرآن اليومي', es: 'Fayr a su hora, recuerdos de la mañana, la porción diaria de Corán', en: 'Fajr on time, morning dhikr, the daily portion of Qur’an' } },
        { t: { ar: 'الضحى', es: 'Media mañana', en: 'Mid-morning' }, a: { ar: 'عملٌ بإتقان، ذكرٌ مستمر، صدقة صغيرة كل يوم', es: 'Trabajo bien hecho, dhikr continuo, una pequeña limosna cada día', en: 'Work done well, constant dhikr, a small daily charity' } },
        { t: { ar: 'الظهر والعصر', es: 'Duhr y Asr', en: 'Dhuhr and Asr' }, a: { ar: 'الصلاة في وقتها، قيلولة قصيرة، مراجعة حفظ أو درس علم', es: 'Oración a su hora, siesta corta, repaso de memoria o una lección de conocimiento', en: 'Prayer on time, a short nap, revision of memorisation or a lesson of knowledge' } },
        { t: { ar: 'المغرب', es: 'Magrib', en: 'Maghrib' }, a: { ar: 'إفطار على تمر، دعاء الصائم، صلاة المغرب، ثم التراويح', es: 'Romper con dátiles, dua del ayunante, Magrib y luego tarawih', en: 'Break the fast on dates, the fasting person’s dua, Maghrib, then tarawih' } },
        { t: { ar: 'بعد العشاء', es: 'Tras Isha', en: 'After Isha' }, a: { ar: 'ورد الختمة، صلة رحم أو اتصال بوالديك، مراجعة يومك', es: 'Porción de la jatma, visitar o llamar a los padres y parientes, revisar tu día', en: 'Khatma portion, call or visit parents and kin, review your day' } },
        { t: { ar: 'الثلث الأخير', es: 'Último tercio', en: 'Last third' }, a: { ar: 'تهجّد ولو ركعتين، استغفار، ودعاء ليلة القدر', es: 'Tahayyud aunque sean dos rak‘as, istigfar y el dua de Laylat al-Qadr', en: 'Tahajjud even two rak‘ahs, seeking forgiveness, and the Laylat al-Qadr dua' } }
      ],
      pts: [
        {
          t: { ar: 'تلاوة القرآن', es: 'Recitar el Corán', en: 'Reciting the Qur’an' },
          b: {
            ar: '«اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ» (مسلم ٨٠٤). حدّد وردًا يوميًا ثابتًا ولو صفحة، وختمةٌ واحدة بتدبّر خير من ختمتين بعجلة.',
            es: '“Recitad el Corán, pues vendrá el Día del Juicio como intercesor de los suyos” (Muslim 804). Fija una porción diaria constante, aunque sea una página: una jatma con reflexión vale más que dos con prisa.',
            en: '“Recite the Qur’an, for it will come on the Day of Resurrection as an intercessor for its companions” (Muslim 804). Fix a steady daily portion, even one page: one reflective khatma beats two rushed ones.'
          }
        },
        {
          t: { ar: 'تفطير الصائمين', es: 'Dar de comer al ayunante', en: 'Feeding the fasting person' },
          b: {
            ar: '«مَنْ فَطَّرَ صَائِمًا كَانَ لَهُ مِثْلُ أَجْرِهِ» (الترمذي، صحيح). تمرةٌ وماءٌ تكفي، والأجر لا ينقص من أجر الصائم شيئًا.',
            es: '“Quien dé de comer a un ayunante tendrá su misma recompensa” (Tirmidí, auténtico). Basta un dátil y agua, y la recompensa del ayunante no disminuye.',
            en: '“Whoever feeds a fasting person will have his like reward” (Tirmidhi, authentic). A date and water suffice, and the faster’s reward is not diminished.'
          }
        },
        {
          t: { ar: 'الصدقة', es: 'La limosna', en: 'Charity' },
          b: {
            ar: 'كان النبي ﷺ «أَجْوَدَ مَا يَكُونُ فِي رَمَضَانَ» (البخاري ٦). خصّص مبلغًا يوميًا صغيرًا تُخرجه سرًّا، ولا تُؤخّره لآخر الشهر.',
            es: 'El Profeta ﷺ era “más generoso en Ramadán” (Bujari 6). Aparta una cantidad diaria pequeña, dalá en secreto y no la aplaces al final del mes.',
            en: 'The Prophet ﷺ was “most generous in Ramadan” (Bukhari 6). Set aside a small daily amount, give it secretly, and do not postpone it to the month’s end.'
          }
        },
        {
          t: { ar: 'قيام الليل والتراويح', es: 'La oración nocturna y el tarawih', en: 'Night prayer and tarawih' },
          b: {
            ar: '«أَفْضَلُ الصَّلَاةِ بَعْدَ الْمَفْرُوضَةِ صَلَاةُ اللَّيْلِ» (مسلم ١١٦٣). لا تُفوّت التراويح، وإن كنت إمامًا أو معذورًا فصلِّ في بيتك.',
            es: '“La mejor oración después de las obligatorias es la de la noche” (Muslim 1163). No pierdas el tarawih; si eres imam o tienes una excusa, reza en casa.',
            en: '“The best prayer after the obligatory ones is the night prayer” (Muslim 1163). Do not miss tarawih; if you lead or have an excuse, pray at home.'
          }
        },
        {
          t: { ar: 'العمرة في رمضان', es: 'La umrah en Ramadán', en: 'Umrah in Ramadan' },
          b: {
            ar: '«عُمْرَةٌ فِي رَمَضَانَ تَعْدِلُ حَجَّةً» (البخاري ١٧٨٢). ومن لم يستطع فلا حرج؛ فالباب واسع في الصدقة والدعاء.',
            es: '“Una umrah en Ramadán equivale a una peregrinación” (Bujari 1782). Quien no pueda, que no se aflija: la puerta de la limosna y el dua es amplia.',
            en: '“An umrah in Ramadan is equivalent to a Hajj” (Bukhari 1782). Whoever cannot, let it not grieve him: the door of charity and supplication is wide.'
          }
        },
        {
          t: { ar: 'الدعاء عند الإفطار', es: 'El dua al romper el ayuno', en: 'Dua when breaking the fast' },
          b: {
            ar: '«إِنَّ لِلصَّائِمِ عِنْدَ فِطْرِهِ دَعْوَةً مَا تُرَدُّ» (ابن ماجه، حسن). احفظ لنفسك دعاءً جامعًا وادعُ به قبل أن تشرب.',
            es: '“El ayunante tiene al romper su ayuno una súplica que no es rechazada” (Ibn Maya, bueno). Memoriza un dua amplio y hazlo antes de beber.',
            en: '“The fasting person has, at the time of breaking fast, a supplication that is not refused” (Ibn Majah, good). Memorise a comprehensive dua and say it before drinking.'
          }
        },
        {
          t: { ar: 'صلة الرحم وحسن الخلق', es: 'Los lazos familiares y el buen carácter', en: 'Family ties and good character' },
          b: {
            ar: '«أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا» (الترمذي). اجعل لك كل أسبوع مكالمة أو زيارة لقريب، وابتسم في وجه من تعاشر.',
            es: '“El más completo en fe es el mejor de carácter” (Tirmidí). Haz cada semana una llamada o visita a un pariente, y sonríe a quien tratas.',
            en: '“The most complete in faith is the best in character” (Tirmidhi). Make a weekly call or visit to a relative, and smile at those around you.'
          }
        },
        {
          t: { ar: 'ترك المعاصي والغيبة', es: 'Abandonar el pecado y la maledicencia', en: 'Leaving sin and backbiting' },
          b: {
            ar: 'الصيام عن الحرام أصلٌ في قبول الصوم عن الحلال: غيبةٌ أو نميمةٌ أو نظرٌ محرّم تُذهب بركة الشهر. عاهد نفسك على ترك معصية واحدة بعينها حتى نهايته.',
            es: 'Ayunar de lo ilícito es base para que se acepte el ayuno de lo lícito: una maledicencia o una mirada prohibida se llevan la bendición del mes. Comprométete a dejar un pecado concreto hasta el final.',
            en: 'Fasting from the unlawful underpins the acceptance of fasting from the lawful: backbiting or a forbidden glance takes the month’s blessing. Commit to leaving one specific sin until its end.'
          }
        },
        {
          t: { ar: 'إطعام الطعام وطلب العلم', es: 'Dar comida y buscar conocimiento', en: 'Feeding others and seeking knowledge' },
          b: {
            ar: '«أَيُّ الْإِسْلَامِ خَيْرٌ؟ قَالَ: تُطْعِمُ الطَّعَامَ» (البخاري)، و«مَنْ سَلَكَ طَرِيقًا يَبْتَغِي فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ» (مسلم ٢٦٩٩). عشرُ دقائق درسٍ يوميًا تكفي.',
            es: '“¿Qué Islam es mejor? Dijo: que des de comer” (Bujari), y “a quien recorre un camino buscando conocimiento, Dios le facilita un camino al Paraíso” (Muslim 2699). Diez minutos de lección diaria bastan.',
            en: '“Which Islam is best? He said: that you feed others” (Bukhari), and “whoever treads a path seeking knowledge, God eases for him a path to Paradise” (Muslim 2699). Ten minutes of daily study suffice.'
          }
        }
      ]
    },
    /* ================= ٤) فضل ليلة القدر ================= */
    {
      id: 'qadr',
      ic: 'fa-moon',
      ti: { ar: 'فضل ليلة القدر', es: 'La virtud de Laylat al-Qadr', en: 'The virtue of Laylat al-Qadr' },
      lead: {
        ar: 'ليلةٌ واحدة خير من ألف شهر: تُكتب فيها المقادير، وتتنزّل الملائكة، ويسلم فيها الأمر حتى الفجر. وهي في العشر الأواخر، وأرجى لياليها الوتر.',
        es: 'Una sola noche vale más que mil meses: en ella se inscriben los destinos, descienden los ángeles y la paz dura hasta el alba. Está en las diez últimas noches, y las impares son las más probables.',
        en: 'A single night better than a thousand months: destinies are decreed, the angels descend, and peace lasts until dawn. It lies in the last ten nights, and the odd nights are most likely.'
      },
      txt: [
        {
          ar: '﴿إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ • وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ • لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ • تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ • سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ﴾',
          es: '“Ciertamente lo revelamos en la noche del destino. ¿Y qué te hará saber qué es la noche del destino? La noche del destino vale más que mil meses. Descienden los ángeles y el Espíritu en ella, con permiso de su Señor, para cada asunto. Paz es ella, hasta el despuntar del alba.”',
          en: '“Indeed We sent it down on the Night of Decree. And what will make you know what the Night of Decree is? The Night of Decree is better than a thousand months. The angels and the Spirit descend therein by permission of their Lord for every matter. Peace it is until the emergence of dawn.”',
          s: 'سورة القدر ١-٥', se: 'Surat al-Qadr 1-5'
        },
        {
          ar: '«مَنْ قَامَ لَيْلَةَ الْقَدْرِ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ»',
          es: '“Quien rece la noche del destino con fe y buscando la recompensa, le serán perdonados sus pecados anteriores.”',
          en: '“Whoever stands in prayer on the Night of Decree out of faith and seeking reward will have his previous sins forgiven.”',
          s: 'البخاري ١٩٠١', se: 'Sahih al-Bujari 1901'
        },
        {
          ar: '«تَطْلُعُ الشَّمْسُ صَبِيحَةَ لَيْلَةِ الْقَدْرِ لَا شُعَاعَ لَهَا»',
          es: '“El sol sale, la mañana de la noche del destino, sin rayos.”',
          en: '“The sun rises on the morning of the Night of Decree without rays.”',
          s: 'مسلم', se: 'Muslim'
        }
      ],
      pts: [
        {
          t: { ar: 'أرجى الليالي', es: 'Las noches más probables', en: 'The likeliest nights' },
          b: {
            ar: 'كثرت الأحاديث في أنها ليلة السابع والعشرين، لكن الأقوى أنها تتنقّل بين ليالي العشر، فتحرَّها في الليالي الوترية كلها: ٢١، ٢٣، ٢٥، ٢٧، ٢٩.',
            es: 'Muchos hadices señalan la noche 27, pero lo más sólido es que se desplaza entre las diez, así que búscala en todas las impares: 21, 23, 25, 27, 29.',
            en: 'Many reports point to the 27th, but the stronger view is that it moves within the ten, so seek it on all odd nights: 21, 23, 25, 27, 29.'
          }
        },
        {
          t: { ar: 'العلامات ليست شرطًا', es: 'Las señales no son condición', en: 'The signs are not a condition' },
          b: {
            ar: 'ذُكر لها علامات (شمسٌ بلا شعاع، ليلةٌ معتدلة لا حارة ولا باردة)، لكنها علامات ظنّية تُرى بعد انقضاء الليلة، فلا تعتمد عليها في تحديدها، بل اجتهد في العشر كلها.',
            es: 'Se mencionan señales (sol sin rayos, noche templada), pero son indicios probables que se ven después, así que no dependas de ellas para identificarla: esfuérzate en las diez noches.',
            en: 'Signs are reported (a sun without rays, a mild night), but they are probable indications seen afterwards, so do not rely on them to identify it: strive through all ten nights.'
          }
        },
        {
          t: { ar: 'ماذا تفعل فيها؟', es: 'Qué hacer en ella', en: 'What to do in it' },
          b: {
            ar: 'قيامٌ ولو ركعتان، وتر، تلاوة، استغفار، صدقة، ودعاءٌ مُلحّ. وأكثر ما يُقال فيها ما علّمه النبي ﷺ لعائشة: «اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي».',
            es: 'Oración aunque sean dos rak‘as, witr, recitación, istigfar, limosna y súplica insistente. Lo más recomendado es lo que el Profeta ﷺ enseñó a Aisha: “Oh Dios, Tú eres Indulgente y amas el perdón, perdóname”.',
            en: 'Prayer even two rak‘ahs, witr, recitation, seeking forgiveness, charity, and persistent supplication. The most recommended is what the Prophet ﷺ taught Aishah: “O God, You are Pardoning and love pardon, so pardon me.”'
          }
        },
        {
          t: { ar: 'لا تختصر الشهر في ليلة', es: 'No reduzcas el mes a una noche', en: 'Do not reduce the month to one night' },
          b: {
            ar: 'من أقام العشر كلها أدركها قطعًا، ومن اقتصر على ليلةٍ واحدة فقد يخطئها. والاجتهاد في العشر هو هدي النبي ﷺ الثابت.',
            es: 'Quien rece las diez noches la alcanza con certeza; quien se limita a una puede errarla. Esforzarse en las diez es la conducta confirmada del Profeta ﷺ.',
            en: 'Whoever prays all ten nights certainly catches it; whoever limits himself to one may miss it. Striving through the ten is the established practice of the Prophet ﷺ.'
          }
        }
      ]
    },

    /* ================= ٥) أدعية ليلة القدر ================= */
    {
      id: 'qadrdua',
      ic: 'fa-hands-praying',
      ti: { ar: 'أدعية ليلة القدر', es: 'Duas de Laylat al-Qadr', en: 'Duas of Laylat al-Qadr' },
      lead: {
        ar: 'لم يثبت دعاءٌ خاصٌّ محصورٌ بليلة القدر إلا ما علّمه النبي ﷺ لعائشة، ويُشرع فيها كل دعاء جامع. وهذه مجموعة صحيحة الأسانيد تجمع خيري الدنيا والآخرة.',
        es: 'No se ha confirmado un dua exclusivo de Laylat al-Qadr salvo el que el Profeta ﷺ enseñó a Aisha; en ella es lícito todo dua abarcador. Esta es una selección de transmisión auténtica que reúne el bien de ambos mundos.',
        en: 'No exclusive dua for Laylat al-Qadr is established except what the Prophet ﷺ taught Aishah; any comprehensive dua is prescribed in it. This is an authentic selection gathering the good of both worlds.'
      },
      duas: true,
      pts: [
        {
          t: { ar: 'آداب الدعاء', es: 'Etiqueta de la súplica', en: 'Etiquette of supplication' },
          b: {
            ar: 'ابدأ بالحمد والصلاة على النبي ﷺ، وألحّ في الطلب بقلب حاضر، وارفع يديك، واختم بالصلاة على النبي ﷺ. وأفضل الأوقات الثلث الأخير من الليل.',
            es: 'Empieza alabando a Dios y bendiciendo al Profeta ﷺ, insiste con corazón presente, levanta las manos y cierra con la bendición sobre el Profeta. El mejor momento es el último tercio de la noche.',
            en: 'Begin with praise of God and blessings on the Prophet ﷺ, persist with a present heart, raise your hands, and close with blessings on the Prophet. The best time is the last third of the night.'
          }
        },
        {
          t: { ar: 'دعاءٌ لا أصل له', es: 'Un dua sin base', en: 'A dua with no basis' },
          b: {
            ar: 'ما ينتشر من أدعية طويلة مُعيَّنة تُنسَب لليلة القدر لا يثبت منها شيء بلفظه، ومعانيها في كثيرها صحيح. ادعُ بما ورد وتجنّب تخصيص ألفاظ لم تُروَ.',
            es: 'Los largos duas específicos que circulan atribuidos a esa noche no están probados en su texto, aunque muchos de sus sentidos son válidos. Usa lo transmitido y evita fijar fórmulas no narradas.',
            en: 'The long specific duas circulated for that night are not established in their wording, though many of their meanings are valid. Use what is transmitted and avoid fixing unnarated formulas.'
          }
        }
      ]
    },

    /* ================= ٦) التراويح والتهجد ================= */
    {
      id: 'tarawih',
      ic: 'fa-mosque',
      ti: { ar: 'التراويح والتهجد', es: 'Tarawih y tahayyud', en: 'Tarawih and tahajjud' },
      lead: {
        ar: 'قيام رمضان سنّةٌ مؤكدة، والتراويح اسمه بعد العشاء، والتهجد ما كان من الليل بعد نوم. كلاهما بابٌ واسع للأجر، وأفضلهما ما دام صاحبه عليه.',
        es: 'La oración nocturna de Ramadán es una sunna confirmada: el tarawih es su nombre tras Isha, y el tahayyud es lo que se reza de noche después de dormir. Ambos son puertas amplias de recompensa, y lo mejor es lo que se mantiene.',
        en: 'The night prayer of Ramadan is a confirmed sunnah: tarawih is its name after Isha, and tahajjud is what is prayed at night after sleeping. Both are wide doors of reward, and the best is what one keeps up.'
      },
      txt: [
        {
          ar: '«مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ»',
          es: '“Quien rece en Ramadán con fe y buscando la recompensa, le serán perdonados sus pecados anteriores.”',
          en: '“Whoever stands in prayer during Ramadan out of faith and seeking reward will have his previous sins forgiven.”',
          s: 'البخاري ٣٧', se: 'Sahih al-Bujari 37'
        },
        {
          ar: '«صَلَاةُ اللَّيْلِ مَثْنَى مَثْنَى»',
          es: '“La oración de la noche es de dos en dos.”',
          en: '“The night prayer is two by two.”',
          s: 'البخاري ٩٩٠', se: 'Sahih al-Bujari 990'
        },
        {
          ar: '«مَا كَانَ رَسُولُ اللَّهِ ﷺ يَزِيدُ فِي رَمَضَانَ وَلَا فِي غَيْرِهِ عَلَى إِحْدَى عَشْرَةَ رَكْعَةً»',
          es: '“El Mensajero de Dios ﷺ no rezaba más de once rak‘as, ni en Ramadán ni fuera de él.”',
          en: '“The Messenger of God ﷺ did not exceed eleven rak‘ahs, in Ramadan or outside it.”',
          s: 'البخاري ١١٤٧', se: 'Sahih al-Bujari 1147'
        },
        {
          ar: '«أَفْضَلُ الصَّلَاةِ بَعْدَ الْمَفْرُوضَةِ صَلَاةُ اللَّيْلِ»',
          es: '“La mejor oración después de las obligatorias es la de la noche.”',
          en: '“The best prayer after the obligatory ones is the night prayer.”',
          s: 'مسلم ١١٦٣', se: 'Muslim 1163'
        },
        {
          ar: '«يَنْزِلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الْآخِرُ...»',
          es: '“Nuestro Señor desciende cada noche al cielo más cercano cuando queda el último tercio de la noche…”',
          en: '“Our Lord descends each night to the lowest heaven when the last third of the night remains…”',
          s: 'البخاري ١١٤٥', se: 'Sahih al-Bujari 1145'
        }
      ],
      pts: [
        {
          t: { ar: 'حكم التراويح', es: 'Estatuto del tarawih', en: 'Ruling on tarawih' },
          b: {
            ar: 'سنّة مؤكدة، والأفضل أداؤها جماعة في المسجد؛ فقد جمع عمر الناس عليها وقال: «نِعْمَ الْبِدْعَةُ هَذِهِ». ومن صلاها في بيته أدرك أصل السنّة.',
            es: 'Es sunna confirmada, y lo mejor es en congregación en la mezquita: Umar reunió a la gente en ella y dijo: “Qué buena innovación es esta”. Quien la reza en casa alcanza el origen de la sunna.',
            en: 'It is a confirmed sunnah, best performed in congregation in the mosque: Umar gathered people for it and said, “What a good innovation this is.” Whoever prays it at home still attains the sunnah.'
          }
        },
        {
          t: { ar: 'عدد الركعات', es: 'El número de rak‘as', en: 'The number of rak‘ahs' },
          b: {
            ar: 'لم يثبت تحديدٌ ملزم؛ فعل النبي ﷺ إحدى عشرة أو ثلاث عشرة، والجمهور على عشرين، والأمر واسع ما دام خشوعًا بلا مشقة. والأصل: «مَثْنَى مَثْنَى» ثم الوتر.',
            es: 'No hay un número obligatorio: el Profeta ﷺ rezaba once o trece, la mayoría de los juristas veinte, y el asunto es amplio mientras haya recogimiento sin agobio. La base es de dos en dos y luego el witr.',
            en: 'No binding number is established: the Prophet ﷺ prayed eleven or thirteen, most jurists say twenty, and the matter is broad as long as there is focus without hardship. The basis is two by two, then witr.'
          }
        },
        {
          t: { ar: 'وقتها وختامها بالوتر', es: 'Su tiempo y el cierre con witr', en: 'Its time and closing with witr' },
          b: {
            ar: 'تبدأ بعد صلاة العشاء وتمتد إلى الفجر، والوتر ختام صلاة الليل: «اجْعَلُوا آخِرَ صَلَاتِكُمْ بِاللَّيْلِ وِتْرًا» (البخاري). ومن أراد التهجد بعده فليؤخّر الوتر.',
            es: 'Empieza tras Isha y dura hasta el alba; el witr es el cierre de la oración nocturna: “Poned el witr como última oración de la noche” (Bujari). Quien quiera hacer tahayyud después, que retrase el witr.',
            en: 'It begins after Isha and lasts until dawn; witr closes the night prayer: “Make witr the last of your prayer at night” (Bukhari). Whoever intends tahajjud afterwards should delay the witr.'
          }
        },
        {
          t: { ar: 'التهجد وثلث الليل الأخير', es: 'Tahayyud y el último tercio', en: 'Tahajjud and the last third' },
          b: {
            ar: 'التهجد ما كان بعد نوم، وأفضله الثلث الأخير حيث ينزل الربّ نزولًا يليق بجلاله ويُستجاب الدعاء. وأحبّ الصلاة إلى الله صلاة داود: ينام ثلث الليل ويقوم ثلثه وينام سدسه (مسلم).',
            es: 'El tahayyud es lo que se reza tras dormir, y lo mejor es el último tercio, cuando el Señor desciende como corresponde a Su majestad y se responde al dua. La oración más amada por Dios es la de David: dormía un tercio, rezaba un tercio y dormía un sexto (Muslim).',
            en: 'Tahajjud is what is prayed after sleeping; its best time is the last third, when the Lord descends as befits His majesty and supplication is answered. The prayer most loved by God is David’s: he slept a third, prayed a third and slept a sixth (Muslim).'
          }
        },
        {
          t: { ar: 'رفق بالإمام والمأمومين', es: 'Suavidad con el imam y la congregación', en: 'Gentleness with the imam and congregation' },
          b: {
            ar: 'لا تُطِل القراءة بما يشقّ على الناس؛ فقد أنكر النبي ﷺ على معاذ إطالته بالناس. والخشوع في عشر ركعاتٍ خير من العجلة في عشرين.',
            es: 'No alargues la recitación hasta agobiar a la gente: el Profeta ﷺ reprochó a Muadh alargar con la congregación. Diez rak‘as con recogimiento valen más que veinte con prisa.',
            en: 'Do not lengthen the recitation until it burdens people: the Prophet ﷺ reproached Mu‘adh for lengthening it with the congregation. Ten focused rak‘ahs beat twenty rushed ones.'
          }
        }
      ]
    },

    /* ================= ٧) صلاة العيد ================= */
    {
      id: 'eid',
      ic: 'fa-sun',
      ti: { ar: 'صلاة العيد', es: 'La oración del Eid', en: 'The Eid prayer' },
      lead: {
        ar: 'العيدان شعيرتان ثابتتان، وصلاة العيد أظهر شعائرهما: ركعتان في المصلى، بلا أذان ولا إقامة، يجتمع لها الرجال والنساء والصبيان.',
        es: 'Las dos fiestas son un rito establecido, y su oración es su signo más visible: dos rak‘as en el musalla, sin llamada ni iqama, donde se reúnen hombres, mujeres y niños.',
        en: 'The two Eids are an established rite, and their prayer is its clearest sign: two rak‘ahs in the open place, with no adhan or iqama, gathering men, women and children.'
      },
      txt: [
        {
          ar: '«قَدِمَ رَسُولُ اللَّهِ ﷺ الْمَدِينَةَ وَلَهُمْ يَوْمَانِ يَلْعَبُونَ فِيهِمَا، فَقَالَ: قَدْ أَبْدَلَكُمُ اللَّهُ بِهِمَا خَيْرًا مِنْهُمَا: يَوْمَ الْفِطْرِ وَيَوْمَ النَّحْرِ»',
          es: '“Llegó el Mensajero de Dios ﷺ a Medina y tenían dos días de fiesta. Dijo: Dios os ha dado en su lugar algo mejor: el día del Fitr y el día del Adha.”',
          en: '“The Messenger of God ﷺ came to Medina and they had two days of play. He said: God has replaced them for you with something better: the day of Fitr and the day of Adha.”',
          s: 'أبو داود، صحيح', se: 'Abu Dawud, auténtico'
        },
        {
          ar: '«كَانَ رَسُولُ اللَّهِ ﷺ يَخْرُجُ يَوْمَ الْفِطْرِ وَالْأَضْحَى إِلَى الْمُصَلَّى»',
          es: '“El Mensajero de Dios ﷺ salía el día del Fitr y del Adha al lugar de oración.”',
          en: '“The Messenger of God ﷺ used to go out on the day of Fitr and Adha to the prayer ground.”',
          s: 'البخاري ومسلم', se: 'Bujari y Muslim'
        },
        {
          ar: '«كَانَ يَقْرَأُ فِي الْعِيدَيْنِ بِـ﴿سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى﴾ وَ﴿هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ﴾»',
          es: '“En las dos fiestas recitaba ‘Glorifica el nombre de tu Señor, el Altísimo’ y ‘¿Te ha llegado el relato de la que cubre?’.”',
          en: '“On the two Eids he recited ‘Glorify the name of your Lord, the Most High’ and ‘Has there come to you the story of the Overwhelming?’.”',
          s: 'مسلم ٨٧٨', se: 'Muslim 878'
        }
      ],
      pts: [
        {
          t: { ar: 'حكمها', es: 'Su estatuto', en: 'Its ruling' },
          b: {
            ar: 'سنّة مؤكدة عند جمهور الفقهاء، وفرض كفاية عند الحنابلة. تُصلّى في المصلى جماعةً، وتصح فرادى في البيت لمن فاتته.',
            es: 'Sunna confirmada para la mayoría de los juristas, y obligación colectiva según los hanbalíes. Se reza en congregación en el musalla, y válida individualmente en casa para quien la pierda.',
            en: 'A confirmed sunnah for most jurists, and a collective obligation according to the Hanbalis. It is prayed in congregation at the prayer ground, and valid individually at home for one who misses it.'
          }
        },
        {
          t: { ar: 'وقتها', es: 'Su tiempo', en: 'Its time' },
          b: {
            ar: 'من ارتفاع الشمس قِيد رمح (نحو ربع ساعة بعد الشروق) إلى الزوال. ويُستحب تعجيلها في الأضحى وتأخيرها قليلًا في الفطر ليتّسع وقت إخراج زكاة الفطر.',
            es: 'Desde que el sol se eleva una lanza (unos quince minutos tras el amanecer) hasta el mediodía. Se recomienda adelantarla en el Adha y retrasarla algo en el Fitr para dar tiempo a la zakat al-fitr.',
            en: 'From the sun rising a spear’s height (about fifteen minutes after sunrise) until midday. It is recommended to hasten it on Adha and delay it slightly on Fitr to allow time for zakat al-fitr.'
          }
        },
        {
          t: { ar: 'صفتها', es: 'Su forma', en: 'Its form' },
          b: {
            ar: 'ركعتان بلا أذان ولا إقامة. يُكبّر في الأولى سبعًا بعد تكبيرة الإحرام (عند الشافعية والحنابلة) وخمسًا في الثانية، وعند الحنفية ثلاثًا في كل ركعة. والخلاف في عدد التكبيرات مذهبيٌّ معتبر، فاتبع إمام مسجدك ولا تُنكر على غيرك.',
            es: 'Dos rak‘as sin llamada ni iqama. Se dicen siete takbires en la primera tras el takbir de apertura (shafiíes y hanbalíes) y cinco en la segunda; los hanafíes, tres en cada una. La diferencia es jurídica y reconocida: sigue a tu imam y no reproches a otros.',
            en: 'Two rak‘ahs with no adhan or iqama. Seven takbirs in the first after the opening takbir (Shafi‘is and Hanbalis) and five in the second; the Hanafis say three in each. The difference is a recognised legal one: follow your imam and do not censure others.'
          }
        },
        {
          t: { ar: 'الخطبة', es: 'El sermón', en: 'The sermon' },
          b: {
            ar: 'خطبةٌ بعد الصلاة على الأصح، ويُستحب استماعها، ومن انصرف قبلها فقد أدرك الصلاة. وتُخفَّف لمراعاة الناس، ويُذكَّر فيها بزكاة الفطر والأضحية.',
            es: 'El sermón es después de la oración, según lo más correcto; se recomienda escucharlo, y quien se va antes ya obtuvo la oración. Debe ser breve por consideración a la gente y recordar la zakat al-fitr o el sacrificio.',
            en: 'The sermon follows the prayer according to the sounder view; listening is recommended, and one who leaves beforehand has still attained the prayer. It should be short out of consideration, and remind of zakat al-fitr or the sacrifice.'
          }
        },
        {
          t: { ar: 'خروج النساء والصبيان', es: 'Salida de mujeres y niños', en: 'Women and children going out' },
          b: {
            ar: 'كان النبي ﷺ يخرج بالنساء والأبكار وذوات الخدور، ويعتزل الحيّض المصلى. فالجميع يُشرك في شعيرة العيد وفرحه، مع مراعاة الآداب الشرعية.',
            es: 'El Profeta ﷺ salía con las mujeres, las jóvenes y las recatadas, y las menstruantes se apartaban del lugar de oración. Todos participan del rito y de la alegría, respetando la etiqueta legal.',
            en: 'The Prophet ﷺ went out with women, young girls and those in seclusion, while menstruating women kept away from the prayer area. All share in the rite and its joy, observing the legal etiquette.'
          }
        },
        {
          t: { ar: 'إذا وافق العيد يوم جمعة', es: 'Si el Eid coincide con viernes', en: 'If Eid falls on a Friday' },
          b: {
            ar: 'من صلّى العيد سقطت عنه الجمعة في قول جماعة من أهل العلم (رواه أبو داود)، لكن الأفضل حضورها إن تيسّر، والإمام يقيمها لمن حضر.',
            es: 'Quien reza el Eid queda eximido del viernes según varios sabios (narrado por Abu Dawud), aunque es mejor asistir si se puede; el imam la celebra para quien acuda.',
            en: 'Whoever prays the Eid is excused from Friday according to several scholars (reported by Abu Dawud), though attending is better if possible; the imam holds it for those who come.'
          }
        }
      ]
    },

    /* ================= ٨) أحكام وآداب العيد ================= */
    {
      id: 'adab',
      ic: 'fa-mug-hot',
      ti: { ar: 'أحكام وآداب العيد', es: 'Normas y etiqueta del Eid', en: 'Rulings and etiquette of Eid' },
      lead: {
        ar: 'العيد عبادةٌ قبل أن يكون فرحًا: له تكبيرٌ وتهنئةٌ وصلةُ رحم، وله كذلك ما يُجتنب من صيامٍ وإسراف.',
        es: 'El Eid es adoración antes que diversión: tiene takbir, felicitación y lazos familiares, y también cosas que se evitan, como el ayuno y el derroche.',
        en: 'Eid is worship before it is celebration: it has takbir, greeting and family ties, and it also has things to avoid, such as fasting and excess.'
      },
      pts: [
        {
          t: { ar: 'التكبير', es: 'El takbir', en: 'The takbir' },
          b: {
            ar: '﴿وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ﴾ (البقرة ١٨٥). ويُكبّر من ليلة العيد إلى انقضاء الخطبة: «اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ».',
            es: '“Para que completéis el número y glorifiquéis a Dios por haberos guiado” (Al-Baqara 185). Se hace takbir desde la noche del Eid hasta el final del sermón: “Dios es el más grande, no hay dios sino Dios, y a Dios la alabanza”.',
            en: '“That you may complete the number and magnify God for having guided you” (Al-Baqara 185). Takbir is said from the night of Eid until the end of the sermon: “God is the Greatest, there is no god but God, and to God be praise.”'
          }
        },
        {
          t: { ar: 'الاغتسال والتزيّن', es: 'El baño y el arreglo', en: 'Bathing and adorning' },
          b: {
            ar: 'يُستحب الغسل ولبس أحسن الثياب والتطيّب للرجال، والإمام أشدّ تزيّنًا. ويُمنع ما هو محرّم: إسبالٌ أو تشبّه، أو عطرٌ ظاهر للمرأة عند الأجانب.',
            es: 'Se recomienda bañarse, vestir la mejor ropa y perfumarse los hombres, y el imam más aún. Se evita lo ilícito: ropa arrastrada, imitación, o perfume visible de la mujer ante extraños.',
            en: 'Bathing, wearing one’s best clothes and perfume for men are recommended, and more so for the imam. What is unlawful is avoided: trailing garments, imitation, or a woman’s visible perfume before strangers.'
          }
        },
        {
          t: { ar: 'الأكل قبل الخروج', es: 'Comer antes de salir', en: 'Eating before going out' },
          b: {
            ar: 'في عيد الفطر يُفطر على تمرٍّ وترًا قبل الخروج، وفي الأضحى لا يأكل حتى يرجع من الصلاة إن كان ممّن يضحي. هذا هو هدي النبي ﷺ (الترمذي).',
            es: 'En el Fitr se rompe el ayuno con dátiles en número impar antes de salir; en el Adha no se come hasta volver de la oración, si se va a sacrificar. Es la guía del Profeta ﷺ (Tirmidí).',
            en: 'On Fitr one eats an odd number of dates before going out; on Adha one does not eat until returning from the prayer, if offering a sacrifice. This is the Prophet’s guidance (Tirmidhi).'
          }
        },
        {
          t: { ar: 'الذهاب والإياب', es: 'Ida y vuelta', en: 'Going and returning' },
          b: {
            ar: 'يُستحب الخروج ماشيًا والرجوع من طريقٍ آخر، لما فيه من إظهار الشعيرة ولقاء الناس (البخاري). ويُستحب التبكير والتكبير في الطريق.',
            es: 'Se recomienda ir a pie y volver por otro camino, para mostrar el rito y encontrar a la gente (Bujari). También madrugar y hacer takbir en el camino.',
            en: 'Going on foot and returning by a different route is recommended, showing the rite and meeting people (Bukhari). Going early and saying takbir on the way is also recommended.'
          }
        },
        {
          t: { ar: 'التهنئة', es: 'La felicitación', en: 'Congratulating' },
          b: {
            ar: 'كان الصحابة يقولون إذا التقوا يوم العيد: «تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ». وهي عادةٌ حسنة لا نصَّ صريحًا فيها، والمعنى صحيح. هنّئ أهلك وجيرانك وسلّم على من تعرف ومن لا تعرف.',
            es: 'Los Compañeros decían al encontrarse en el Eid: “Que Dios acepte de nosotros y de vosotros”. Es una buena costumbre sin texto explícito, con sentido correcto. Felicita a tu familia, vecinos, y saluda a conocidos y desconocidos.',
            en: 'The Companions said when meeting on Eid: “May God accept from us and from you.” It is a good custom without an explicit text, with a sound meaning. Greet your family, neighbours, and both known and unknown people.'
          }
        },
        {
          t: { ar: 'زكاة الفطر قبل الصلاة', es: 'La zakat al-fitr antes de la oración', en: 'Zakat al-fitr before the prayer' },
          b: {
            ar: '«مَنْ أَدَّاهَا قَبْلَ الصَّلَاةِ فَهِيَ زَكَاةٌ مَقْبُولَةٌ» (أبو داود وابن ماجه). والمقدار والجنس يُؤخذان من جهة الإفتاء في بلدك، لا من تقدير شخصي.',
            es: '“Quien la da antes de la oración, es una zakat aceptada” (Abu Dawud e Ibn Maya). La cantidad y el tipo se toman de la autoridad religiosa de tu país, no de un cálculo personal.',
            en: '“Whoever pays it before the prayer, it is an accepted zakat” (Abu Dawud, Ibn Majah). The amount and type are taken from your country’s religious authority, not personal estimation.'
          }
        },
        {
          t: { ar: 'ما يُمنع في العيد', es: 'Lo que se evita en el Eid', en: 'What is avoided on Eid' },
          b: {
            ar: 'يحرم صيام يوم العيد، وأيام التشريق (١١–١٣ ذي الحجة) لا تُصام إلا لمن لم يجد الهدي. ويُجتنب الإسراف والاختلاط المحرّم وإيذاء الجيران وقطيعة الرحم.',
            es: 'Está prohibido ayunar el día del Eid; los días de Tashriq (11–13 de Dhul-Hiyya) no se ayunan salvo para quien no halla ofrenda. Se evita el derroche, la mezcla ilícita, molestar a los vecinos y romper los lazos familiares.',
            en: 'Fasting on the day of Eid is forbidden; the days of Tashriq (11–13 Dhul-Hijjah) are not fasted except by one who cannot afford the offering. Excess, unlawful mixing, harming neighbours and cutting family ties are avoided.'
          }
        },
        {
          t: { ar: 'آداب اجتماعية', es: 'Etiqueta social', en: 'Social etiquette' },
          b: {
            ar: 'أدخل الفرح على أطفالك ومن حولك من الأيتام والفقراء، وابدأ بالسلام والهدية ولو صغيرة، واعفُ عمّن أساء، وزر من لا يزورك؛ فالعيد محلّ صلةٍ وعفوٍ لا محلّ مقاضاة.',
            es: 'Alegra a tus hijos y a los huérfanos y pobres que te rodean, toma la iniciativa en el saludo y el regalo aunque sea pequeño, perdona a quien te ofendió y visita a quien no te visita: el Eid es tiempo de unión y perdón.',
            en: 'Bring joy to your children and to the orphans and poor around you, take the initiative in greeting and gifting even if small, pardon those who wronged you and visit those who do not visit you: Eid is a time of ties and forgiveness.'
          }
        }
      ]
    }
  ],

  /* أدعية ليلة القدر — نصوص صحيحة الأسانيد */
  QADR_DUAS: [
    {
      key: 1,
      ar: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      es: 'Oh Dios, Tú eres Indulgente y amas el perdón, perdóname.',
      en: 'O God, You are Pardoning and love pardon, so pardon me.',
      s: 'الترمذي ٣٥١٣ (حسن صحيح)', se: 'Tirmidí 3513 (hasan sahih)'
    },
    {
      ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
      es: 'Oh Dios, te pido el Paraíso y me refugio en Ti del Fuego.',
      en: 'O God, I ask You for Paradise and seek refuge in You from the Fire.',
      s: 'أبو داود، صحيح', se: 'Abu Dawud, auténtico'
    },
    {
      ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      es: 'Señor nuestro, danos bien en este mundo y bien en el otro, y protégenos del castigo del Fuego.',
      en: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
      s: 'البقرة ٢٠١', se: 'Al-Baqara 201'
    },
    {
      ar: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي',
      es: 'Oh Dios, rectifica mi religión, que es la protección de mi asunto; rectifica mi mundo, donde está mi sustento; y rectifica mi otra vida, a la que retorno.',
      en: 'O God, set right my religion, which is the safeguard of my affair; set right my world, wherein is my livelihood; and set right my Hereafter, to which I return.',
      s: 'مسلم ٢٧٢٠', se: 'Muslim 2720'
    },
    {
      ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ',
      es: 'Oh Dios, me refugio en Ti de la pérdida de Tu gracia, del cambio de mi salud, de la llegada súbita de Tu castigo y de todo Tu enojo.',
      en: 'O God, I seek refuge in You from the loss of Your favour, the change of Your protection, the suddenness of Your vengeance, and all Your displeasure.',
      s: 'مسلم ٢٧٣٩', se: 'Muslim 2739'
    },
    {
      ar: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي',
      es: 'Oh Dios, guíame y hazme firme en el camino recto.',
      en: 'O God, guide me and keep me steadfast.',
      s: 'مسلم ٢٧٢٥', se: 'Muslim 2725'
    },
    {
      ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
      es: 'Oh Dios, te pido la guía, la piedad, la castidad y la riqueza de espíritu.',
      en: 'O God, I ask You for guidance, piety, chastity and contentment.',
      s: 'مسلم ٢٧٢١', se: 'Muslim 2721'
    },
    {
      ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
      es: 'Oh Dios, me refugio en Ti de la angustia y la tristeza, de la incapacidad y la pereza, de la avaricia y la cobardía, de la carga de la deuda y de la opresión de los hombres.',
      en: 'O God, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men.',
      s: 'البخاري ٦٣٦٩', se: 'Sahih al-Bujari 6369'
    },
    {
      ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
      es: 'Oh Dios, te pido conocimiento útil, sustento lícito y obras aceptadas.',
      en: 'O God, I ask You for beneficial knowledge, goodly provision and accepted deeds.',
      s: 'ابن ماجه، صحيح', se: 'Ibn Maya, auténtico'
    },
    {
      ar: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
      es: 'Señor nuestro, no desvíes nuestros corazones después de habernos guiado, y concédenos de Tu misericordia: Tú eres el Dador.',
      en: 'Our Lord, let not our hearts deviate after You have guided us, and grant us mercy from Yourself: You are the Bestower.',
      s: 'آل عمران ٨', se: 'Al Imran 8'
    },
    {
      ar: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
      es: 'Señor, hazme cumplidor de la oración, y a mi descendencia; Señor nuestro, acepta mi súplica.',
      en: 'My Lord, make me an establisher of prayer, and from my descendants; our Lord, and accept my supplication.',
      s: 'إبراهيم ٤٠', se: 'Ibrahim 40'
    },
    {
      ar: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
      es: 'Señor nuestro, danos en nuestras parejas y descendencia consuelo de los ojos, y haznos guías de los piadosos.',
      en: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us leaders for the righteous.',
      s: 'الفرقان ٧٤', se: 'Al-Furqan 74'
    },
    {
      ar: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
      es: 'Señor nuestro, perdóname a mí, a mis padres y a los creyentes el día en que se establezca la cuenta.',
      en: 'Our Lord, forgive me and my parents and the believers on the Day the account is established.',
      s: 'إبراهيم ٤١', se: 'Ibrahim 41'
    },
    {
      ar: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
      es: 'Oh Dios, ayúdame a recordarte, agradecerte y adorarte bien.',
      en: 'O God, help me to remember You, thank You and worship You well.',
      s: 'أبو داود، صحيح', se: 'Abu Dawud, auténtico'
    },
    {
      ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ',
      es: 'Oh Dios, te pido todo el bien, el inmediato y el futuro, el que conozco y el que no conozco.',
      en: 'O God, I ask You for all good, the immediate and the deferred, what I know of it and what I do not know.',
      s: 'ابن ماجه، صحيح', se: 'Ibn Maya, auténtico'
    }
  ]
};

if (typeof window !== 'undefined') window.RamadanGuide = RamadanGuide;
