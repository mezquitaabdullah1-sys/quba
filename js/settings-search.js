// v1.0.128 — شريط بحث في الإعدادات الشخصية
// يبحث في عناصر الإعدادات المعروضة فعليًا (كل صف يُقرأ نصه) وفي سجل
// ميزات التطبيق، ثم ينقل المستخدم: صف الإعداد يُبرز ويُمرَّر إليه،
// والميزة تُفتح عبر Router.
(function () {
  const T = {
    ar: { ph: 'ابحث في الإعدادات أو ميزات التطبيق…', none: 'لا توجد نتائج مطابقة', settings: 'الإعدادات', features: 'ميزات التطبيق', clear: 'مسح البحث' },
    es: { ph: 'Buscar en ajustes o funciones…', none: 'Sin resultados', settings: 'Ajustes', features: 'Funciones de la app', clear: 'Borrar búsqueda' },
    en: { ph: 'Search settings or app features…', none: 'No matching results', settings: 'Settings', features: 'App features', clear: 'Clear search' },
  };

  // كل ميزات التطبيق: r = مسار Router، أو a = دالة تنفيذ (تبويب داخل صفحة)
  const FEATURES = [
    { r: 'prayer', k: 'prayer oracion rezo salat صلاه صلاة مواقيت times horarios adhan azan أذان', n: { ar: 'الصلاة ومواقيت اليوم', es: 'Oración y horarios de hoy', en: 'Prayer & today\'s times' } },
    { a: () => { Router.go('prayer'); setTimeout(() => { try { PrayerPage.switchTab('qibla'); } catch (e) {} }, 420); },
      k: 'qibla quibla قبلة بوصلة brujula compass اتجاه القبلة', n: { ar: 'القبلة (البوصلة)', es: 'Qibla (brújula)', en: 'Qibla (compass)' } },
    { a: () => { Router.go('prayer'); setTimeout(() => { try { PrayerPage.switchTab('monthly'); } catch (e) {} }, 420); },
      k: 'monthly mensual جدول شهري calendario mensual', n: { ar: 'الجدول الشهري للصلوات', es: 'Tabla mensual de oraciones', en: 'Monthly prayer table' } },
    { r: 'imsakiyah', k: 'imsakiyah imsak إمساكية صيام sawm fasting رمضان ramadan', n: { ar: 'الإمساكية والصيام', es: 'Imsakiya y ayuno', en: 'Imsakiya & fasting' } },
    { r: 'quran', k: 'quran coran قرآن مصحف قراءة tilawa recitacion', n: { ar: 'القرآن الكريم (السور)', es: 'Corán (suras)', en: 'Quran (surahs)' } },
    { r: 'mushaf', k: 'mushaf مصحف صفحات paginas', n: { ar: 'المصحف بالصفحات', es: 'Mushaf por páginas', en: 'Mushaf pages' } },
    { r: 'radio', k: 'radio راديو اذاعة بث reciters قراء qaris', n: { ar: 'الراديو والقراء', es: 'Radio y recitadores', en: 'Radio & reciters' } },
    { r: 'wisdom/library', k: 'library biblioteca مكتبه كتب books pdf', n: { ar: 'المكتبة والكتب', es: 'Biblioteca y libros', en: 'Library & books' } },
    { r: 'wisdom/courses', k: 'courses cursos دورات تعلم learning كورس دروس lecciones', n: { ar: 'الدورات التعليمية', es: 'Cursos y lecciones', en: 'Courses & lessons' } },
    { r: 'wisdom/tasbih', k: 'tasbih مسبحه مسبحة سبحة خرز beads contador', n: { ar: 'المسبحة الرقمية', es: 'Tasbih digital', en: 'Digital tasbih' } },
    { r: 'wisdom/adhkar', k: 'adhkar اذكار أذكار صباح مساء morning evening', n: { ar: 'الأذكار', es: 'Adhkar', en: 'Adhkar' } },
    { r: 'wisdom/duas', k: 'duas ادعيه أدعية دعاء suplicas', n: { ar: 'الأدعية', es: 'Du\'as', en: 'Du\'as' } },
    { r: 'wisdom/quiz', k: 'quiz اختبار مسابقه أسئلة preguntas', n: { ar: 'المسابقات والأسئلة', es: 'Cuestionarios', en: 'Quizzes' } },
    { r: 'calendar', k: 'calendar calendario تقويم هجري hijri مناسبات fechas', n: { ar: 'التقويم الهجري والمناسبات', es: 'Calendario hijri', en: 'Hijri calendar' } },
    { r: 'daily', k: 'daily يومي tracker seguimiento عبادات تتبع', n: { ar: 'متابعة يومي والعبادات', es: 'Seguimiento diario', en: 'Daily tracker' } },
    { r: 'videos', k: 'videos فيديو مرئيات clips مقاطع', n: { ar: 'الفيديوهات والمقاطع', es: 'Vídeos y clips', en: 'Videos & clips' } },
    { r: 'wisdom', k: 'wisdom حكمه حكمة أقوال quotes sabiduria', n: { ar: 'الحكم والأقوال', es: 'Sabiduría y citas', en: 'Wisdom & quotes' } },
    { r: 'features', k: 'features funciones ميزات خصائص all todas', n: { ar: 'كل ميزات التطبيق', es: 'Todas las funciones', en: 'All features' } },
    { r: 'profile', k: 'settings ajustes اعدادات الاعدادات حساب perfil profile', n: { ar: 'الإعدادات الشخصية', es: 'Ajustes personales', en: 'Personal settings' } },
  ];

  const AR_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

  function norm(s) {
    return String(s || '')
      .replace(AR_DIACRITICS, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function loc() {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
    return T[l] ? l : 'ar';
  }
  function S() { return T[loc()]; }

  function hostEl() { return document.getElementById('main-content'); }

  // v1.0.129: صفحة الإعدادات فقط. كان الشرط السابق يقبل أي صفحة فيها زر
  // ProfilePage (الرئيسية فيها «تغيير المدينة») فيظهر الشريط في الرئيسية.
  function isProfile() {
    if (typeof Router === 'undefined' || !Router.current) return false;
    return String(Router.current.name || '') === 'profile';
  }

  function close() {
    const p = document.getElementById('ps-panel');
    if (p) { p.hidden = true; p.innerHTML = ''; }
  }

  function rowLabel(row) {
    // العنوان فقط — كان textContent يجمع العنوان والوصف بلا فاصل فتظهر
    // «تكرار الصلاة على النبيتفاصيل الخيار»
    const ttl = row.querySelector('.row-title, .pr-title, .list-title, .lr-title');
    let txt = (ttl ? ttl.textContent : row.textContent) || '';
    txt = txt.replace(/\s+/g, ' ').trim();
    return txt.length > 60 ? txt.slice(0, 58) + '…' : txt;
  }

  function query(q) {
    const panel = document.getElementById('ps-panel');
    if (!panel) return;
    const nq = norm(q);
    if (!nq) { close(); return; }
    const s = S();
    const rows = Array.prototype.slice.call(document.querySelectorAll('#main-content .list-row'))
      .filter(r => norm(r.textContent).indexOf(nq) !== -1).slice(0, 8);
    const feats = FEATURES.filter(f => norm(f.k).indexOf(nq) !== -1 || norm(f.n[loc()] || f.n.en).indexOf(nq) !== -1).slice(0, 6);

    if (!rows.length && !feats.length) {
      panel.innerHTML = '<div class="ps-empty"><i class="fas fa-circle-question"></i> ' + s.none + '</div>';
      panel.hidden = false;
      return;
    }
    let html = '';
    if (rows.length) {
      html += '<div class="ps-group">' + s.settings + '</div>';
      rows.forEach((r, i) => {
        html += '<button type="button" class="ps-item" data-kind="row" data-i="' + i + '">'
          + '<i class="fas fa-sliders"></i><span>' + rowLabel(r).replace(/</g, '&lt;') + '</span>'
          + '<i class="fas fa-arrow-turn-down ps-go"></i></button>';
      });
    }
    if (feats.length) {
      html += '<div class="ps-group">' + s.features + '</div>';
      feats.forEach((f, i) => {
        html += '<button type="button" class="ps-item" data-kind="feat" data-i="' + i + '">'
          + '<i class="fas fa-grip"></i><span>' + (f.n[loc()] || f.n.en) + '</span>'
          + '<i class="fas fa-arrow-left ps-go"></i></button>';
      });
    }
    panel.innerHTML = html;
    panel.hidden = false;
    Array.prototype.forEach.call(panel.querySelectorAll('.ps-item'), btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        if (btn.dataset.kind === 'row') {
          const row = rows[i];
          close();
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.classList.add('ps-flash');
            setTimeout(() => row.classList.remove('ps-flash'), 1600);
          }
        } else {
          const f = feats[i];
          close();
          try {
            if (!f) return;
            if (typeof f.a === 'function') f.a();
            else if (typeof Router !== 'undefined') Router.go(f.r);
          } catch (e) { /* صامت */ }
        }
      });
    });
  }

  function build() {
    const s = S();
    const w = document.createElement('div');
    w.className = 'ps-search';
    w.id = 'ps-search';
    w.innerHTML = '<div class="ps-field">'
      + '<i class="fas fa-magnifying-glass"></i>'
      + '<input id="ps-q" type="search" autocomplete="off" spellcheck="false" placeholder="' + s.ph + '" aria-label="' + s.ph + '">'
      + '<button type="button" class="ps-clear" aria-label="' + s.clear + '"><i class="fas fa-xmark"></i></button>'
      + '</div><div class="ps-panel" id="ps-panel" hidden></div>';
    const input = w.querySelector('#ps-q');
    input.addEventListener('input', () => query(input.value));
    w.querySelector('.ps-clear').addEventListener('click', () => { input.value = ''; query(''); input.focus(); });
    document.addEventListener('click', (e) => { if (!w.contains(e.target)) close(); }, true);
    return w;
  }

  function ensure() {
    const host = hostEl();
    const bar = document.getElementById('ps-search');
    if (!host || !isProfile()) { if (bar) bar.remove(); return; }
    if (bar && host.contains(bar)) return;
    host.insertBefore(build(), host.firstChild);
  }

  let timer = null;
  function schedule() { clearTimeout(timer); timer = setTimeout(ensure, 90); }

  try {
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* صامت */ }
  if (document.readyState !== 'loading') setTimeout(ensure, 250);
  else document.addEventListener('DOMContentLoaded', () => setTimeout(ensure, 250));

  window.SettingsSearch = { query: query, ensure: ensure, close: close };
})();
