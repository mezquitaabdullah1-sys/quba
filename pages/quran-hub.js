// v1.0.131 — صفحة القرآن أصبحت بوابة بثلاثة مداخل: قراءة · ختمة وورد · حفظ.
// القائمة القديمة انتقلت إلى المسار quran/read كما هي.
const QuranHubPage = {
  render(container) {
    const last = Storage.get('mushaf_last_page');
    const lastRead = Storage.get('quran_last_read');
    const L = (ar, es, en) => {
      const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
      return l === 'es' ? es : (l === 'en' ? en : ar);
    };
    const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

    let resume = '';
    if (last && last > 1) {
      resume = `<button class="qhb-resume" onclick="Router.go('mushaf', {page:${last}})">
        <i class="fas fa-clock-rotate-left"></i>
        <span>${L('متابعة من صفحة', 'Continuar en la página', 'Resume at page')} ${ar(last)}</span>
        <i class="fas fa-chevron-left"></i>
      </button>`;
    } else if (lastRead && lastRead.s) {
      resume = `<button class="qhb-resume" onclick="Router.go('surah', {surah:${lastRead.s}, ayah:${lastRead.a || 1}})">
        <i class="fas fa-clock-rotate-left"></i>
        <span>${L('متابعة آخر قراءة', 'Continuar la última lectura', 'Resume last reading')}</span>
        <i class="fas fa-chevron-left"></i>
      </button>`;
    }

    container.innerHTML = `
      <div class="qhb" dir="rtl">
        <div class="qhb-hero">
          <div class="qhb-hero-orn"></div>
          <div class="qhb-hero-in">
            <div class="qhb-hero-kicker">${L('كتاب الله', 'Libro de Allah', 'Book of Allah')}</div>
            <h1 class="qhb-hero-title">${L('القرآن الكريم', 'El Sagrado Corán', 'The Holy Quran')}</h1>
            <div class="qhb-hero-sub">114 ${t('surahs').toLowerCase()} · 604 ${L('صفحة', 'páginas', 'pages')} · 30 ${L('جزءًا', 'yuz', 'juz')}</div>
          </div>
        </div>

        ${resume}

        <div class="qhb-cards">
          <button class="qhb-card qhb-c1" onclick="Router.go('quran/read')">
            <span class="qhb-ic"><i class="fas fa-book-open-reader"></i></span>
            <span class="qhb-tx">
              <b>${L('قراءة القرآن', 'Leer el Corán', 'Read the Quran')}</b>
              <em>${L('السور · البحث · التلاوة · صفحة كاملة', 'Suras · búsqueda · recitación · página completa', 'Suras · search · audio · full page')}</em>
            </span>
            <i class="fas fa-chevron-left qhb-arw"></i>
          </button>

          <button class="qhb-card qhb-c2" onclick="Router.go('quran/khatma')">
            <span class="qhb-ic"><i class="fas fa-calendar-check"></i></span>
            <span class="qhb-tx">
              <b>${L('ختم القرآن والورد', 'Jatma y Wird diario', 'Khatma & daily ward')}</b>
              <em>${L('خطة ختمة · ورد يومي · تذكير', 'Plan · wird diario · recordatorio', 'Plan · daily ward · reminders')}</em>
            </span>
            <span class="qhb-badge">${L('جديد', 'Nuevo', 'New')}</span>
          </button>

          <button class="qhb-card qhb-c3" disabled>
            <span class="qhb-ic"><i class="fas fa-brain"></i></span>
            <span class="qhb-tx">
              <b>${L('حفظ القرآن', 'Memorizar el Corán', 'Memorize the Quran')}</b>
              <em>${L('مراجعة ذكية وخطط حفظ', 'Repaso inteligente y planes', 'Smart review and plans')}</em>
            </span>
            <span class="qhb-badge qhb-soon">${L('قريبًا', 'Pronto', 'Soon')}</span>
          </button>
        </div>
      </div>`;
  },
};
