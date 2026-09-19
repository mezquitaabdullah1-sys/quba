// 🔒 سياسة خصوصية Quba — نص محلي 100% (بدون خوادم، يعمل بلا إنترنت)
// Política de privacidad trilingüe (AR/ES/EN) alineada con la app:
//   • Local-first: todos los ajustes, el tasbih y el progreso viven SOLO en
//     el dispositivo (localStorage/IndexedDB). No hay cuentas ni servidores
//     propios de Quba.
//   • Ubicación: se usa solo para oración/Qibla; las coordenadas nunca se
//     guardan en ningún servidor ni se envían junto a identificadores.
//   • Red: Aladhan (horarios, recibe lat/lon), Al-Quran Cloud (texto/tafsir/
//     audio), Nominatim/OpenStreetMap (nombre de la ciudad), Open-Meteo
//     (elevación), Islamic Network CDN (audio), y las APIs públicas de
//     traducción/búsqueda de du'as (MyMemory / Lingva / LibreTranslate /
//     Ummah API) solo cuando el usuario las invoca.
//   • Notificaciones: locales (adhan/recordatorios), se programan en el
//     dispositivo.
//   • Sin anuncios, sin analítica, sin rastreadores.
// El texto se muestra en la pantalla de onboarding (enlace al pie) y también
// se puede abrir desde Ajustes.
const PRIVACY_POLICY = {
  updated: '2026-09-16',

  ar: {
    title: 'سياسة الخصوصية',
    intro:
      'تطبيق «قُبَّة» رفيقك الإسلامي اليومي. خصوصيتك وأمان بياناتك أولوية قصوى لدينا، ' +
      'وقد بُني التطبيق من الأساس ليحفظ بياناتك على جهازك وحدك.',
    sections: [
      {
        h: '١. بياناتك محفوظة على جهازك فقط',
        p:
          'لا يملك التطبيق خوادم خاصة بنا، ولا نطلب منك إنشاء حساب أو إدخال اسمك أو بريدك ' +
          'أو رقم هاتفك. جميع تفضيلاتك وإعداداتك وعدّاد المسبحة وسجلاتك تُحفظ محلياً على ' +
          'جهازك فقط. لا يحتوي التطبيق على إعلانات أو أدوات تتبّع أو تحليلات.',
      },
      {
        h: '٢. صلاحيات الوصول واستخدامها',
        list: [
          {
            label: 'تحديد الموقع (GPS)',
            body:
              'يُستخدم موقعك لغرضين فقط: حساب مواقيت الصلاة بدقة وتحديد اتجاه القبلة. ' +
              'يُحسب كلاهما على جهازك بالكامل؛ إحداثياتك لا تُرسَل إلى أي خادم تابع لنا ' +
              'ولا تُربط بأي هوية شخصية.',
          },
          {
            label: 'الاتصال بالإنترنت',
            body:
              'يُستخدم لجلب مواقيت الصلاة (Aladhan)، ونص القرآن الكريم والترجمات والتفسير ' +
              'والإذاعات الإسلامية المباشرة (Al-Quran Cloud)، ولمعرفة اسم مدينتك عند استخدام ' +
              'GPS (OpenStreetMap). تخضع هذه الخدمات الخارجية لسياسات الخصوصية الخاصة بها.',
          },
          {
            label: 'التنبيهات والإشعارات',
            body:
              'تُستخدم لتذكيرك بمواقيت الصلاة وتشغيل صوت الأذان في وقته الفعلي، إضافةً إلى ' +
              'أذكار الصباح والمساء. تتم جدولة الإشعارات محلياً على جهازك.',
          },
          {
            label: 'تشغيل الصوت في الخلفية',
            body:
              'للاستماع إلى تلاوة القرآن الكريم والأذان والإذاعات مع إمكانية التحكم بها من ' +
              'شريط الإشعارات أثناء استخدام تطبيقات أخرى.',
          },
        ],
      },
      {
        h: '٣. بيانات الأطفال',
        p: 'التطبيق لا يستهدف فئة عمرية معينة ولا يجمع عمداً أي بيانات من الأطفال.',
      },
      {
        h: '٤. حذف بياناتك',
        p:
          'بما أن كل بياناتك محفوظة محلياً على جهازك، فإن إلغاء تثبيت التطبيق أو مسح بياناته ' +
          'من إعدادات الجهاز يحذف كل ما يخصك نهائياً — لا يوجد شيء لنحذفه من طرفنا.',
      },
      {
        h: '٥. التعديلات على هذه السياسة',
        p:
          'قد نحدّث هذه الصفحة من حين لآخر لتعزيز حماية خصوصيتك ومواكبة ميزات التطبيق الجديدة. ' +
          'ننصحك بمراجعتها بشكل دوري، وسيظهر تاريخ آخر تحديث أعلاه.',
      },
      {
        h: '٦. التواصل',
        p: 'لأي استفسار حول الخصوصية أو اقتراح لتحسينها، راسلنا من قسم «الدعم» في صفحة «حسابي».',
      },
    ],
    consent: 'باستخدامك تطبيق «قُبَّة» فإنك توافق على سياسة الخصوصية هذه كما هي موضحة أعلاه.',
  },

  es: {
    title: 'Política de privacidad',
    intro:
      'Quba es tu compañero islámico diario. Tu privacidad y la seguridad de tus datos son ' +
      'una prioridad máxima: la app se construyó desde cero para que tus datos vivan solo ' +
      'en tu dispositivo.',
    sections: [
      {
        h: '1. Tus datos se quedan en tu dispositivo',
        p:
          'No tenemos servidores propios y no te pedimos crear una cuenta, ni tu nombre, ' +
          'correo ni teléfono. Todas tus preferencias, ajustes, contador de tasbih y tu ' +
          'progreso se guardan localmente en tu dispositivo. La app no contiene anuncios, ' +
          'ni analíticas, ni rastreadores.',
      },
      {
        h: '2. Permisos de acceso y su uso',
        list: [
          {
            label: 'Ubicación (GPS)',
            body:
              'Tu ubicación se usa solo para dos fines: calcular los horarios de oración con ' +
              'precisión y determinar la dirección de la Qibla. Ambos cálculos se realizan en ' +
              'tu dispositivo; tus coordenadas nunca se envían a ningún servidor nuestro ni se ' +
              'vinculan a ninguna identidad personal.',
          },
          {
            label: 'Conexión a Internet',
            body:
              'Se usa para obtener los horarios de oración (Aladhan), el texto del Corán, las ' +
              'traducciones, el tafsir y las radios islámicas en directo (Al-Quran Cloud), y ' +
              'para conocer el nombre de tu ciudad al usar el GPS (OpenStreetMap). Estos ' +
              'servicios externos están sujetos a sus propias políticas de privacidad.',
          },
          {
            label: 'Notificaciones',
            body:
              'Se usan para recordarte los horarios de oración y reproducir el adhan en su ' +
              'momento exacto, además de los adhkar de la mañana y la tarde. Las notificaciones ' +
              'se programan localmente en tu dispositivo.',
          },
          {
            label: 'Reproducción de audio en segundo plano',
            body:
              'Para escuchar la recitación del Corán, el adhan y las radios mientras usas otras ' +
              'apps, con controles desde la barra de notificaciones.',
          },
        ],
      },
      {
        h: '3. Datos de menores',
        p: 'La app no está dirigida a ningún grupo de edad concreto ni recopila datos de menores de forma deliberada.',
      },
      {
        h: '4. Eliminar tus datos',
        p:
          'Como todos tus datos se guardan localmente en tu dispositivo, desinstalar la app o ' +
          'borrar sus datos desde los ajustes del teléfono elimina definitivamente todo lo que ' +
          'te pertenece: no hay nada que borrar de nuestra parte.',
      },
      {
        h: '5. Cambios en esta política',
        p:
          'Podemos actualizar esta página ocasionalmente para reforzar tu privacidad y reflejar ' +
          'las nuevas funciones de la app. Te recomendamos revisarla periódicamente; la fecha ' +
          'de la última actualización aparece arriba.',
      },
      {
        h: '6. Contacto',
        p: 'Para cualquier consulta sobre privacidad o sugerencia de mejora, escríbenos desde la sección «Soporte» en la página «Yo».',
      },
    ],
    consent: 'Al usar Quba aceptas esta política de privacidad tal como se describe arriba.',
  },

  en: {
    title: 'Privacy policy',
    intro:
      'Quba is your daily Islamic companion. Your privacy and the security of your data are a ' +
      'top priority: the app is built from the ground up so that your data lives only on your ' +
      'device.',
    sections: [
      {
        h: '1. Your data stays on your device',
        p:
          'We own no servers and we never ask you to create an account or provide your name, ' +
          'email or phone number. All your preferences, settings, tasbih counter and records ' +
          'are stored locally on your device only. The app contains no ads, no analytics and ' +
          'no trackers.',
      },
      {
        h: '2. Access permissions and how they are used',
        list: [
          {
            label: 'Location (GPS)',
            body:
              'Your location is used for two purposes only: accurately calculating prayer times ' +
              'and determining the Qibla direction. Both are computed entirely on your device; ' +
              'your coordinates are never sent to any server of ours nor linked to any personal ' +
              'identity.',
          },
          {
            label: 'Internet connection',
            body:
              'Used to fetch prayer times (Aladhan), the Quran text, translations, tafsir and ' +
              'live Islamic radio streams (Al-Quran Cloud), and to resolve your city name when ' +
              'using GPS (OpenStreetMap). These external services are governed by their own ' +
              'privacy policies.',
          },
          {
            label: 'Notifications',
            body:
              'Used to remind you of prayer times and to play the adhan at its exact time, as ' +
              'well as the morning and evening adhkar. Notifications are scheduled locally on ' +
              'your device.',
          },
          {
            label: 'Background audio playback',
            body:
              'Lets you listen to Quran recitation, the adhan and radio streams while using ' +
              'other apps, with controls in the notification bar.',
          },
        ],
      },
      {
        h: "3. Children's data",
        p: 'The app does not target any specific age group and does not knowingly collect any data from children.',
      },
      {
        h: '4. Deleting your data',
        p:
          'Since all your data is stored locally on your device, uninstalling the app or ' +
          'clearing its data from your device settings permanently deletes everything that ' +
          'belongs to you — there is nothing for us to delete on our side.',
      },
      {
        h: '5. Changes to this policy',
        p:
          'We may update this page from time to time to strengthen your privacy and keep up ' +
          'with new app features. Please review it periodically; the last-updated date is ' +
          'shown above.',
      },
      {
        h: '6. Contact',
        p: 'For any privacy question or suggestion, reach us from the Support section on the "Me" page.',
      },
    ],
    consent: 'By using Quba you agree to this privacy policy as described above.',
  },
};

if (typeof window !== 'undefined') window.PRIVACY_POLICY = PRIVACY_POLICY;
