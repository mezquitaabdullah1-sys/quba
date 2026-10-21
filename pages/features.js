// 🧩 v103: صفحة «كل الميزات» — فهرس كامل لكل ميزات التطبيق مجمّعة في أقسام
const FeaturesPage = {
  _L: {
    ar: {
      title: 'كل الميزات', sub: 'كل ما يقدّمه التطبيق في مكان واحد', back: 'الرئيسية',
      g1: 'العبادة والمواقيت', g2: 'القرآن الكريم', g3: 'العلم والمعرفة', g4: 'الصوتيات والفيديو', g5: 'أدوات ومساعدة',
      home: 'الرئيسية', prayer: 'الصلاة والمواقيت', qibla: 'اتجاه القبلة', calendar: 'التقويم الهجري',
      imsakiyah: 'إمساكية رمضان', adhkar: 'الأذكار', duas: 'الأدعية',
      quran: 'القرآن الكريم', mushaf: 'المصحف', radioQuran: 'إذاعة القرآن', tafsir: 'القراءة والتفسير',
      library: 'المكتبة الإسلامية', courses: 'الدورات', quiz: 'الاختبارات', wisdom: 'الحكمة',
      radio: 'الراديو الإسلامي', clips: 'مقتطفات الفيديو',
      tasbih: 'المسبحة', profile: 'الإعدادات والملف',
      d1: 'مواقيت اليوم والأذان والإشعارات', d2: 'بوصلة القبلة الحيّة', d3: 'التقويم والمناسبات',
      d4: 'جدول مواعيد الشهر', d5: 'أذكار الصباح والمساء', d6: 'أدعية مأثورة',
      d7: 'قراءة وسور وتلاوة', d8: 'مصحف بالصفحات', d9: 'بث قرآني متواصل', d10: 'تفسير وترجمة',
      d11: 'كتب تُنزَّل وتُقرأ بلا إنترنت', d12: 'دروس منظمة مع تقدّم', d13: 'اختبر معرفتك', d14: 'حِكم يومية',
      d15: 'بث قرآني وأذكار', d16: 'مقاطع قصيرة مختارة', d17: 'عدّاد التسبيح', d18: 'اللغة والمظهر والصوت',
    },
    es: {
      title: 'Todas las funciones', sub: 'Todo lo que ofrece la app en un solo lugar', back: 'Inicio',
      g1: 'Culto y horarios', g2: 'Sagrado Corán', g3: 'Conocimiento', g4: 'Audio y vídeo', g5: 'Herramientas',
      home: 'Inicio', prayer: 'Oraciones y horarios', qibla: 'Dirección de la qibla', calendar: 'Calendario hijri',
      imsakiyah: 'Imsakía de Ramadán', adhkar: 'Adhkár', duas: 'Súplicas',
      quran: 'Sagrado Corán', mushaf: 'Mushaf', radioQuran: 'Radio Corán', tafsir: 'Lectura y tafsir',
      library: 'Biblioteca islámica', courses: 'Cursos', quiz: 'Cuestionarios', wisdom: 'Sabiduría',
      radio: 'Radio islámica', clips: 'Vídeos cortos',
      tasbih: 'Misbaha', profile: 'Ajustes y perfil',
      d1: 'Horarios, adhan y avisos', d2: 'Brújula de la qibla en vivo', d3: 'Calendario y ocasiones',
      d4: 'Tabla del mes completo', d5: 'Adhkár de mañana y tarde', d6: 'Súplicas auténticas',
      d7: 'Lectura, suras y recitación', d8: 'Mushaf por páginas', d9: 'Emisión coránica continua', d10: 'Tafsir y traducción',
      d11: 'Libros descargables sin internet', d12: 'Lecciones con progreso', d13: 'Pon a prueba tu saber', d14: 'Sabiduría diaria',
      d15: 'Corán y adhkár en audio', d16: 'Fragmentos seleccionados', d17: 'Contador de tasbih', d18: 'Idioma, tema y voz',
    },
    en: {
      title: 'All features', sub: 'Everything the app offers in one place', back: 'Home',
      g1: 'Worship & times', g2: 'The Holy Quran', g3: 'Knowledge', g4: 'Audio & video', g5: 'Tools',
      home: 'Home', prayer: 'Prayer & times', qibla: 'Qibla direction', calendar: 'Hijri calendar',
      imsakiyah: 'Ramadan imsakiyah', adhkar: 'Adhkar', duas: 'Duas',
      quran: 'The Holy Quran', mushaf: 'Mushaf', radioQuran: 'Quran radio', tafsir: 'Reading & tafsir',
      library: 'Islamic library', courses: 'Courses', quiz: 'Quizzes', wisdom: 'Wisdom',
      radio: 'Islamic radio', clips: 'Video clips',
      tasbih: 'Tasbih counter', profile: 'Settings & profile',
      d1: 'Daily times, adhan and alerts', d2: 'Live qibla compass', d3: 'Calendar and occasions',
      d4: 'Full-month timetable', d5: 'Morning & evening adhkar', d6: 'Authentic supplications',
      d7: 'Reading, surahs and recitation', d8: 'Page-by-page mushaf', d9: 'Continuous Quran stream', d10: 'Tafsir and translation',
      d11: 'Books downloaded for offline', d12: 'Structured lessons with progress', d13: 'Test your knowledge', d14: 'Daily wisdom',
      d15: 'Quran and adhkar audio', d16: 'Selected short clips', d17: 'Tasbih counter', d18: 'Language, theme and voice',
    },
  },

  render(container) {
    const loc = (typeof currentLocale !== 'undefined' && ['ar', 'es', 'en'].includes(currentLocale)) ? currentLocale : 'ar';
    const L = this._L[loc] || this._L.ar;
    const chev = 'fa-chevron-' + (document.documentElement.dir === 'rtl' ? 'left' : 'right');
    const groups = [
      {
        t: L.g1, items: [
          [L.prayer, L.d1, 'fa-clock', "Router.go('prayer')"],
          [L.qibla, L.d2, 'fa-compass', "Router.go('prayer',{tab:'qibla'})"],
          [L.calendar, L.d3, 'fa-calendar-days', "Router.go('calendar')"],
          [L.imsakiyah, L.d4, 'fa-table-list', "Router.go('imsakiyah')"],
          [L.adhkar, L.d5, 'fa-hands-praying', "Router.go('wisdom/adhkar')"],
          [L.duas, L.d6, 'fa-book-open', "Router.go('wisdom/duas')"],
        ],
      },
      {
        t: L.g2, items: [
          [L.quran, L.d7, 'fa-book-quran', "Router.go('quran')"],
          [L.mushaf, L.d8, 'fa-book', "Router.go('mushaf')"],
          [L.radioQuran, L.d9, 'fa-tower-broadcast', "Router.go('radio')"],
          [L.tafsir, L.d10, 'fa-magnifying-glass', "Router.go('quran')"],
        ],
      },
      {
        t: L.g3, items: [
          [L.library, L.d11, 'fa-book-bookmark', "Router.go('wisdom/library')"],
          [L.courses, L.d12, 'fa-graduation-cap', "Router.go('wisdom/courses')"],
          [L.quiz, L.d13, 'fa-circle-question', "Router.go('wisdom/quiz')"],
          [L.wisdom, L.d14, "fa-lightbulb", "Router.go('wisdom')"],
        ],
      },
      {
        t: L.g4, items: [
          [L.radio, L.d15, 'fa-radio', "Router.go('radio')"],
          [L.clips, L.d16, 'fa-circle-play', "Router.go('videos')"],
        ],
      },
      {
        t: L.g5, items: [
          [L.tasbih, L.d17, 'fa-circle-dot', "Router.go('wisdom/tasbih')"],
          [L.profile, L.d18, 'fa-gear', "Router.go('profile')"],
        ],
      },
    ];

    container.innerHTML = `
      <div class="fx-wrap">
        <div class="fx-head">
          <button class="fx-back" onclick="Router.go('home',{},{force:true})" aria-label="${escapeAttr(L.back)}"><i class="fas ${chev}"></i></button>
          <div class="fx-head-txt">
            <h1>${escapeHtml(L.title)}</h1>
            <p>${escapeHtml(L.sub)}</p>
          </div>
          <span class="fx-head-ic"><i class="fas fa-layer-group"></i></span>
        </div>
        ${groups.map(g => `
          <section class="fx-group">
            <h2 class="fx-gt">${escapeHtml(g.t)}</h2>
            <div class="fx-grid">
              ${g.items.map(([name, desc, ic, act]) => `
                <button class="fx-tile" onclick="${act}">
                  <span class="fx-tile-ic"><i class="fas ${ic}"></i></span>
                  <span class="fx-tile-b">
                    <span class="fx-tile-n">${escapeHtml(name)}</span>
                    <span class="fx-tile-d">${escapeHtml(desc)}</span>
                  </span>
                </button>`).join('')}
            </div>
          </section>`).join('')}
      </div>`;
  },

  cleanup() {},
};
