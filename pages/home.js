// 🏠 Pantalla de Inicio
// v94: الرئيسية المبسّطة — رأس واحد ثابت (تحية/تاريخ/صلاة قادمة/أيقونات)، بطاقة صلوات مضغوطة،
//      شريط «اليوم» بالسحب، وقسم وسائط واحد بثلاثة تبويبات (راديو/مقتطفات/مكتبة).
const HomePage = {
  countdownInterval: null,

  async render(container, params = {}, navToken = null) {
    // v19: if the user navigates away while we await APIs, do NOT touch the
    // DOM afterwards — otherwise a late Home render wipes the new page
    // (this was the root cause of "calendar not opening / stuck loading").
    const isStale = () => navToken !== null && typeof Router !== 'undefined' && !Router.isCurrent(navToken);

    container.innerHTML = Skeleton.home();

    try {
      // v40: SIEMPRE releer el servicio de ubicación — antes `AppState.location`
      // cortocircuitaba y la home podía quedarse con la ciudad anterior tras
      // cambiarla en otra pantalla (desincronización entre páginas).
      // v41: TOPE de 8 s al GPS/geocoding — en el primer arranque el
      // sistema puede dejar el diálogo de permiso sin responder y la home se
      // quedaba congelada en el skeleton (la «página vacía al abrir»). Pasado
      // el tope se pinta al instante con la última ubicación conocida o la
      // ubicación por defecto; si el GPS responde después, el siguiente render
      // ya usa la ubicación real.
      const loc = await Promise.race([
        LocationService.getCurrent(),
        new Promise((res) => setTimeout(() => {
          res((LocationService.getCached && LocationService.getCached()) || LocationService.useDefault());
        }, 8000)),
      ]);
      if (isStale()) return;
      AppState.location = loc;

      // v41: los horarios y la fecha hijri tienen TOPE de 12 s — con red
      // lenta o colgada la home ya no espera indefinidamente: salta el catch
      // y pinta con el cálculo offline (PrayerCalc) sobre la misma ubicación.
      const withTimeout = (p, ms) => Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
      ]);
      const [timings, hijri] = await Promise.all([
        withTimeout(API.getPrayerTimes(loc.latitude, loc.longitude, new Date(), AppState.settings.calculationMethod), 12000),
        withTimeout(API.gregorianToHijri(), 12000).catch(() => null),
      ]);
      if (isStale()) return;

      // v43: ختم الإحداثيات على المواقيت كي تستخدمها صفحة الصلاة مع ختم
      // فرق التوقيت نفسه بدل إعادة الجلب (نفس منطق stamp في PrayerPage).
      if (timings.timings && loc) {
        timings.timings._lat = loc.latitude;
        timings.timings._lon = loc.longitude;
        timings.timings._date = new Date().toDateString();
      }
      AppState.timings = timings.timings;
      AppState.hijri = hijri;

      // v35: reprogramar las alarmas del día al cargar la home — garantiza
      // que el adhan suene a la hora de cada oración aunque no se abra la
      // pestaña de oración, respetando el modo (completo / 2 takbeer).
      if (typeof PrayerNotifications !== 'undefined' &&
          (PrayerNotifications.isEnabled() || PrayerNotifications.isReminderEnabled())) {
        PrayerNotifications.scheduleDay(AppState.timings, AppState.settings.locale || 'es');
      }

      // Use curated famous verses with wisdom (not random)
      const verse = getFamousVerseOfTheDay();
      const dua = getDuaOfTheDay();
      // v61: حديث اليوم (أحاديث صحيحة بترجمة معتمدة — js/hadith.js)
      const hadith = (typeof getHadithOfTheDay === 'function') ? getHadithOfTheDay() : null;
      const virtue = hijri ? getDailyVirtue(
        parseInt(hijri.month?.number, 10),
        parseInt(hijri.day, 10),
        new Date().getDay(),
        AppState.settings.locale || 'es' // v50: «Día bendecido» sigue el idioma de la UI
      ) : null;

      this.renderContent(container, loc, timings.timings, hijri, verse, dua, virtue, hadith);
      this.startCountdown();
    } catch (e) {
      console.warn('Home error:', e);
      if (isStale()) return;
      // v41: NUNCA dejar la home vacía ni congelada — ante CUALQUIER fallo
      // (red, GPS, API, primera apertura) se pinta al instante con el motor
      // astronómico offline (PrayerCalc) sobre la última ubicación conocida
      // o la por defecto. El usuario ve sus horarios (marcados como
      // estimados) en vez de una pantalla en blanco.
      try {
        const loc2 = (typeof LocationService !== 'undefined' && LocationService.getCached && LocationService.getCached())
          || (typeof LocationService !== 'undefined' ? LocationService.useDefault() : null);
        if (loc2 && typeof API !== 'undefined' && API._offlinePrayerTimes) {
          AppState.location = loc2;
          const off = API._offlinePrayerTimes(loc2.latitude, loc2.longitude, new Date(), AppState.settings.calculationMethod);
          // v43: ختم الإحداثيات — ضروري لئلا تُعيد صفحة الصلاة جلب المواقيت
          // من جديد وتفقد ختم فرق التوقيت (_cityDeltaMs) الخاص بالمدينة.
          off.timings._lat = loc2.latitude;
          off.timings._lon = loc2.longitude;
          off.timings._date = new Date().toDateString();
          AppState.timings = off.timings;
          const verse2 = getFamousVerseOfTheDay();
          const dua2 = getDuaOfTheDay();
          const hadith2 = (typeof getHadithOfTheDay === 'function') ? getHadithOfTheDay() : null;
          this.renderContent(container, loc2, off.timings, null, verse2, dua2, null, hadith2);
          this.startCountdown();
          return;
        }
      } catch (e2) { /* si ni el offline funciona, sigue al mensaje de error */ }
      // v21: skeleton offline — no perder el saludo ni la posibilidad de
      // reintentar solo porque falló todo lo demás (ubicación/red/etc.)
      const offline = !navigator.onLine;
      container.innerHTML = `
        <div class="home-header">
          <div class="home-top">
            <div>
              <div class="home-greeting">${getGreetingByHour()}</div>
            </div>
          </div>
        </div>
        ${UIState.error("HomePage.render(document.getElementById('main-content'))", offline ? t('offlineHomeDesc') : t('locationDesc'))}
      `;
    }
  },

  renderContent(container, loc, timings, hijri, verse, dua, virtue, hadith) {
    const dailyPrayers = getDailyPrayers(timings);
    const nextPrayer = getNextPrayer(timings);
    const isEstimated = !!(timings && timings._estimated) || !!(hijri && hijri._estimated);
    // v26: progreso del check-in diario de oraciones (se reinicia cada día)
    const doneCount = (typeof PrayerTracker !== 'undefined') ? PrayerTracker.doneCount() : 0;
    const totalCount = (typeof PrayerTracker !== 'undefined') ? PrayerTracker.totalCount() : 5;
    // v95: v95: ترتيب مريح في وسط الشاشة — معلومة واحدة في مكان واحد،
    //      الصلوات الخمس تظهر كاملة بلا سحب + أيقونة لكل صلاة، زر المدينة في بطاقة الصلوات،
    //      بطاقات الآية/الدعاء/الحديث صغيرة وموزّعة بين الأقسام،
    //      مقتطفات بلغة التطبيق المختارة، وبطاقات المناسبات بألوان مختلفة مع زر التقويم الهجري.
    const isAr = document.documentElement.dir === 'rtl';
    const chev = 'fa-chevron-' + (isAr ? 'left' : 'right');
    const chevStart = 'fa-chevron-' + (isAr ? 'right' : 'left');
    const loc0 = (typeof currentLocale !== 'undefined' && ['es', 'ar', 'en'].includes(currentLocale)) ? currentLocale : 'es';
    const cityLine = [loc.city, loc.country].filter(Boolean).join(', ') || (t('chooseCityOrLocation') || '');
    const now0 = new Date();
    const gLine = String(now0.getDate()).padStart(2, '0') + '/' + String(now0.getMonth() + 1).padStart(2, '0') + '/' + now0.getFullYear();
    const hLine = hijri ? (hijri.day + '/' + (hijri.month?.number || '') + '/' + hijri.year + ' ' + (loc0 === 'ar' ? 'هـ' : 'AH')) : '';
    // v96: الصلوات الست (الشروق + الخمس) في شريط واحد — الست تظهر كاملة بلا سحب
    const SIX = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const six = dailyPrayers.filter(p => SIX.includes(p.name));
    // v95: مقتطفات الرئيسية بلغة التطبيق المختارة (عربي/إسباني/إنجليزي)
    const appLang = (typeof ClipsData !== 'undefined' && ClipsData.LANGS && ClipsData.LANGS.includes(loc0)) ? loc0 : 'es';
    const langName = { ar: 'العربية', es: 'Español', en: 'English' }[appLang] || '';
    let clipList = (typeof ClipsData !== 'undefined' && ClipsData.byCat) ? ClipsData.byCat(appLang) : [];
    if (!clipList.length && typeof ClipsData !== 'undefined' && ClipsData.byCat) clipList = ClipsData.byCat('es');
    clipList = clipList.slice(0, 12);

    // v100: سطر التاريخ (اسم الشهر) + تسمية «متبقٍ على الأذان» بلغة الواجهة
    let hLineFull = '';
    try {
      if (hijri && hijri.month) {
        hLineFull = hijri.day + ' ' + this._hijriMonthName(hijri.month.number, loc0) + ' ' + hijri.year + ' ' + (loc0 === 'ar' ? 'هـ' : 'AH');
      }
    } catch (e) { hLineFull = hLine; }
    let gLineFull = gLine;
    try {
      gLineFull = now0.toLocaleDateString(loc0, { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { gLineFull = gLine; }
    const adhanLbl = ({ ar: 'متبقٍ على الأذان', es: 'Falta para el adhan', en: 'Time to adhan' })[loc0] || 'متبقٍ على الأذان';

    // ============ v102: بيانات الرأس الجديد ============
    const hxl = {
      ar: { services: 'خدماتنا', ramadanIn: 'رمضان في {n} يومًا', nextOcc: 'المناسبة القادمة',
            qhint: 'حرّك هاتفك لتحديد اتجاه القبلة', qon: 'تشغيل البوصلة', qaligned: 'أنت متجه نحو القبلة',
            settings: 'الإعدادات', allFeatures: 'كل الميزات', language: 'اللغة', theme: 'المظهر', todayPrayers: 'صلوات اليوم',
            prevLbl: 'مضى على', elapsed: 'الوقت الماضي', nextLbl: 'الصلاة القادمة' },
      es: { services: 'Nuestros servicios', ramadanIn: 'Ramadán en {n} días', nextOcc: 'Próxima ocasión',
            qhint: 'Mueve el teléfono para orientar la qibla', qon: 'Activar brújula', qaligned: 'Estás orientado a la qibla',
            settings: 'Ajustes', allFeatures: 'Todas las funciones', language: 'Idioma', theme: 'Tema', todayPrayers: 'Oraciones de hoy',
            prevLbl: 'Han pasado', elapsed: 'Tiempo transcurrido', nextLbl: 'Próxima oración' },
      en: { services: 'Our services', ramadanIn: 'Ramadan in {n} days', nextOcc: 'Next occasion',
            qhint: 'Move your phone to find the qibla', qon: 'Enable compass', qaligned: 'You are facing the qibla',
            settings: 'Settings', allFeatures: 'All features', language: 'Language', theme: 'Theme', todayPrayers: "Today's prayers",
            prevLbl: 'Elapsed', elapsed: 'Time elapsed', nextLbl: 'Next prayer' },
    }[loc0] || {};
    const skyKey = this._skyKey(timings);
    let ramDays = null;
    try {
      const rt = this._findRamadanTarget();
      if (rt) ramDays = Math.max(0, Math.ceil((rt.getTime() - now0.getTime()) / 86400000));
    } catch (e) { ramDays = null; }
    const ramTxt = (ramDays === null) ? '' : hxl.ramadanIn.replace('{n}', ramDays);
    const pct0 = this._dayProgress(timings);
    const prevTxt = this._prevPrayerText(timings, loc0);
    let dowTxt = '';
    try { dowTxt = now0.toLocaleDateString(loc0, { weekday: 'long' }); } catch (e) { dowTxt = ''; }
    let occTxt = '';
    try {
      if (typeof ISLAMIC_HOLIDAYS !== 'undefined' && typeof HijriCalc !== 'undefined' && HijriCalc.nextOccurrence) {
        let best = null;
        for (const hh of ISLAMIC_HOLIDAYS) {
          const oc = HijriCalc.nextOccurrence(hh.month, hh.day);
          if (oc && (!best || oc.daysLeft < best.daysLeft)) best = { daysLeft: oc.daysLeft, h: hh };
        }
        if (best) {
          const nm = best.h['name_' + loc0] || best.h.name_es;
          const dtxt = best.daysLeft === 0 ? t('todayWord')
            : (best.daysLeft === 1 ? t('tomorrowWord') : t('daysLeftTxt').replace('{n}', best.daysLeft));
          occTxt = hxl.nextOcc + ': ' + nm + ' · ' + dtxt;
        }
      }
    } catch (e) { occTxt = ''; }

    container.innerHTML = `
      <!-- v102: بطاقة الرأس — خلفية سماء/مسجد متغيّرة + صلاة قادمة + تاريخ + شريط الصلوات داخلها -->
      <div class="home-header home-hero hsx-hero hsx-${skyKey}" id="home-hero">
        <div class="hsx-bg" style="background-image:url('assets/sky/${skyKey}.jpg')"></div>
        <div class="hsx-veil"></div>
        <div class="hh-inner hsx-inner">

          <!-- الصف الأول: الإعدادات · اللغة · المظهر · رمضان · المدينة والبلد -->
          <div class="hsx-top">
            <button class="hsx-ibtn" onclick="Router.go('profile')" aria-label="${escapeAttr(hxl.settings)}" title="${escapeAttr(hxl.settings)}"><i class="fas fa-gear"></i></button>
            <button class="hsx-ibtn" onclick="HomePage.quickMenu('lang', event)" aria-label="${escapeAttr(hxl.language)}" title="${escapeAttr(hxl.language)}"><i class="fas fa-language"></i></button>
            <button class="hsx-ibtn" onclick="HomePage.quickMenu('theme', event)" aria-label="${escapeAttr(hxl.theme)}" title="${escapeAttr(hxl.theme)}"><i class="fas fa-palette"></i></button>
            ${ramTxt ? `<button class="hsx-ram" onclick="Router.go('calendar')" title="${escapeAttr(t('ramadanCountdown') || '')}"><i class="fas fa-moon"></i><span>${escapeHtml(ramTxt)}</span></button>` : ''}
            <button class="hsx-city" onclick="ProfilePage.pickCity()" aria-label="${escapeAttr(t('changeCity') || '')}" title="${escapeAttr(t('changeCity') || '')}">
              <i class="fas fa-location-dot"></i><span>${escapeHtml(cityLine)}</span>
            </button>
          </div>

          <!-- بطاقة الصلاة القادمة: الوقت + المتبقي + ما مضى على الصلاة السابقة -->
          ${nextPrayer ? `
            <div class="hsx-next" id="hsx-next">
              <div class="hsx-next-head">
                <span class="hsx-k"><i class="fas fa-mosque"></i> ${hxl.nextLbl}</span>
                <span class="hsx-np"><b id="next-prayer-name">${t('prayers.' + nextPrayer.name)}</b><span class="hsx-t" id="next-prayer-time">${formatTime12h(nextPrayer.time)}</span></span>
              </div>
              <div class="hsx-metrics">
                <span class="hsx-metric">
                  <span class="hsx-mlbl">${adhanLbl}</span>
                  <span class="hsx-cd" id="countdown">${formatCountdown(nextPrayer.diffMs)}</span>
                </span>
                <span class="hsx-metric end">
                  <span class="hsx-mlbl">${hxl.elapsed}</span>
                  ${prevTxt ? `<span class="hsx-prev" id="hsx-prev" data-txt="${escapeAttr(prevTxt)}"><i class="fas fa-hourglass-half"></i> ${escapeHtml(prevTxt)}</span>` : ''}
                </span>
              </div>
            </div>
          ` : ''}

          <!-- بطاقة اليوم والتاريخ الهجري/الميلادي + المناسبة القادمة -->
          <div class="hsx-date" id="hsx-date">
            <div class="hsx-date-main">
              ${dowTxt ? `<span class="hsx-dow">${escapeHtml(dowTxt)}</span>` : ''}
              ${hLineFull ? `<span class="hsx-hij">${escapeHtml(hLineFull)}</span>` : ''}
            </div>
            <div class="hsx-greg">${escapeHtml(gLineFull)}</div>
            ${occTxt ? `<div class="hsx-occ"><i class="fas fa-star-and-crescent"></i> ${escapeHtml(occTxt)}</div>` : ''}
          </div>

          <!-- صلوات اليوم داخل البطاقة: شريط + خط تقدّم وكرة ذهبية -->
          <div class="hsx-prayers">
            <div class="hsx-strip">
              ${six.map(p => {
                const isNext = nextPrayer && nextPrayer.name === p.name;
                return `<div class="hsx-cell prayer-row${isNext ? ' next' : ''}${p.name === 'Sunrise' ? ' is-sunrise' : ''}" data-prayer="${p.name}">
                  <span class="hsx-cn">${t('prayers.' + p.name)}</span>
                  <span class="hsx-ci">${this._prayerIcon(p.name, 17)}</span>
                  <span class="hsx-ct">${formatTime12h(p.time)}</span>
                </div>`;
              }).join('')}
            </div>
            <div class="hsx-trackwrap">
              <div class="hsx-track">
                <span class="hsx-fill" id="hsx-fill" style="width:${pct0.toFixed(2)}%"></span>
                ${six.map(p => `<span class="hsx-tk" style="inset-inline-start:${this._prayerPct(timings, p.name).toFixed(2)}%"></span>`).join('')}
                <span class="hsx-ball" id="hsx-ball" style="inset-inline-start:${pct0.toFixed(2)}%"></span>
              </div>
            </div>
          </div>

          ${isEstimated ? `<span class="estimated-badge"><i class="fas fa-wifi-slash"></i> ${t('estimatedTimes')}</span>` : ''}
        </div>
      </div>

      <!-- v102: شريط القبلة — بين بطاقة الرأس وبطاقة الخدمات -->
      <section class="hsx-qibla" id="hsx-qibla" onclick="HomePage.qiblaPermit()">
        <div class="hsx-q-head">
          <span class="hsx-q-title"><i class="fas fa-kaaba"></i> ${t('qibla')}</span>
          <span class="hsx-q-deg" id="hsx-q-deg">0°</span>
        </div>
        <div class="hsx-q-dial">
          <div class="hsx-q-strip" id="hsx-q-strip"></div>
          <div class="hsx-q-center"></div>
        </div>
        <div class="hsx-q-hint" id="hsx-q-hint">${escapeHtml(hxl.qhint)}</div>
      </section>

      <div class="hm-wrap">
        <!-- v102: بطاقة الخدمات — كل أيقونات الميزات في مكان واحد -->
        <section class="hm-card hm-prayers hsx-services">
          <div class="hm-card-head">
            <h2 class="hm-title"><i class="fas fa-grip"></i> ${escapeHtml(hxl.services)}</h2>
            <button class="hm-mini-btn" onclick="Router.go('features')"><i class="fas fa-layer-group"></i> ${escapeHtml(hxl.allFeatures || '')} <i class="fas fa-chevron-${isAr ? 'left' : 'right'}"></i></button>
          </div>
          <div class="hsx-serv-grid">
            <button class="hsx-serv" onclick="Router.go('quran')" aria-label="${escapeAttr(t('quickQuran'))}" title="${escapeAttr(t('quickQuran'))}">
              <img src="assets/quick/quran.png" alt="" loading="lazy" draggable="false">
              <span>${t('quickQuran')}</span>
            </button>
            <button class="hsx-serv" onclick="Router.go('prayer',{tab:'qibla'})" aria-label="${escapeAttr(t('quickQibla'))}" title="${escapeAttr(t('quickQibla'))}">
              <img src="assets/quick/qibla.png" alt="" loading="lazy" draggable="false">
              <span>${t('quickQibla')}</span>
            </button>
            <button class="hsx-serv" onclick="Router.go('calendar')" aria-label="${escapeAttr(t('quickCalendar'))}" title="${escapeAttr(t('quickCalendar'))}">
              <img src="assets/quick/calendar.png" alt="" loading="lazy" draggable="false">
              <span>${t('quickCalendar')}</span>
            </button>
            <button class="hsx-serv" onclick="Router.go('radio')" aria-label="${escapeAttr(t('quickRadio'))}" title="${escapeAttr(t('quickRadio'))}">
              <img src="assets/quick/radio.png" alt="" loading="lazy" draggable="false">
              <span>${t('quickRadio')}</span>
            </button>
            <button class="hsx-serv" onclick="Router.go('wisdom/library')" aria-label="${escapeAttr(t('quickLibrary'))}" title="${escapeAttr(t('quickLibrary'))}">
              <img src="assets/quick/library.png" alt="" loading="lazy" draggable="false">
              <span>${t('quickLibrary')}</span>
            </button>
            <button class="hsx-serv" onclick="Router.go('wisdom/tasbih')" aria-label="${escapeAttr(t('quickTasbih'))}" title="${escapeAttr(t('quickTasbih'))}">
              <img src="assets/quick/misbaha.png" alt="" loading="lazy" draggable="false">
              <span>${t('quickTasbih')}</span>
            </button>
            <button class="hsx-serv" onclick="Router.go('videos')" aria-label="${escapeAttr(t('quickClips'))}" title="${escapeAttr(t('quickClips'))}">
              <img src="assets/quick/clips.png" alt="" loading="lazy" draggable="false">
              <span>${t('quickClips')}</span>
            </button>
            <button class="hsx-serv" onclick="Router.go('wisdom/duas')" aria-label="${escapeAttr(t('quickDuas'))}" title="${escapeAttr(t('quickDuas'))}">
              <img src="assets/quick/duas.png" alt="" loading="lazy" draggable="false">
              <span>${t('quickDuas')}</span>
            </button>
            <button class="hsx-serv" onclick="Router.go('wisdom/courses')" aria-label="${escapeAttr(t('quickCourses'))}" title="${escapeAttr(t('quickCourses'))}">
              <img src="assets/quick/courses.png" alt="" loading="lazy" draggable="false">
              <span>${t('quickCourses')}</span>
            </button>
          </div>
        </section>

        <!-- آية اليوم — بطاقة صغيرة (كما كانت، بحجم أصغر) -->
        ${verse ? this._verseCardHtml(verse, loc0) : ''}

        <!-- «أكمل القراءة» — سطر واحد إن وُجد -->
        ${(() => { const rs = this._resumeStripHtml(); return rs ? `<div class="hm-resume">${rs}</div>` : ''; })()}

        <!-- قسم واحد للوسائط: راديو · مقتطفات (بلغة التطبيق) · مكتبة -->
        <section class="hm-media">
          <div class="hm-media-head">
            <div class="hm-tabs" role="tablist">
              <button class="hm-tab active" data-pane="radio" onclick="HomePage.mediaTab('radio')"><i class="fas fa-radio"></i> ${RadioData.L('radioTitle')}</button>
              <button class="hm-tab" data-pane="clips" onclick="HomePage.mediaTab('clips')"><i class="fas fa-circle-play"></i> ${ClipsData.L('clipsTitle')}</button>
              <button class="hm-tab" data-pane="library" onclick="HomePage.mediaTab('library')"><i class="fas fa-book"></i> ${LibraryData.L('libTitle')}</button>
            </div>
            <button class="hm-mini-btn" id="hm-media-more" onclick="HomePage.mediaMore()">${ClipsData.L('clipsSeeAll')} <i class="fas ${chev}"></i></button>
          </div>

          <div class="hm-pane" id="hm-pane-radio">
            <div class="radio-hub-grid">
              <button class="radio-hub-btn rh-quran" onclick="Router.go('radio')" aria-label="${RadioData.L('homeQuranRadio')}">
                <i class="fas fa-tower-broadcast"></i><span>${RadioData.L('homeQuranRadio')}</span>
              </button>
              <button class="radio-hub-btn rh-translated" onclick="Router.go('radio',{tab:'translated'})" aria-label="${RadioData.L('homeQuranTranslated')}">
                <i class="fas fa-language"></i><span>${RadioData.L('homeQuranTranslated')}</span>
              </button>
              <button class="radio-hub-btn rh-adhkar" onclick="Router.go('radio',{tab:'extra'})" aria-label="${RadioData.L('homeAdhkarAudio')}">
                <i class="fas fa-moon"></i><span>${RadioData.L('homeAdhkarAudio')}</span>
              </button>
            </div>
          </div>

          <div class="hm-pane" id="hm-pane-clips" hidden>
            <div class="hm-pane-note">
              <i class="fas fa-language"></i> ${ClipsData.langFlag(appLang)} ${escapeHtml(langName)} — ${clipList.length}
            </div>
            <div class="hm-strip clips-home-row hm-clips-row">
              ${clipList.map(v => `
                <button class="clip-home-card" onclick="Router.go('videos',{play:'${v.id}'})" aria-label="${escapeAttr(v.title)}">
                  <span class="clip-home-thumb">
                    <img src="${ClipsData.thumb(v.id, true)}" alt="" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg';">
                    <span class="clip-play"><i class="fas fa-play"></i></span>
                    ${ClipsData.fmtDur(ClipsData.durOf(v.id)) ? `<span class="hm-clip-dur">${ClipsData.fmtDur(ClipsData.durOf(v.id))}</span>` : ''}
                  </span>
                  <span class="clip-home-title">${escapeHtml(v.title)}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="hm-pane" id="hm-pane-library" hidden>
            ${(() => {
              const sl = (typeof LibraryService !== 'undefined' && LibraryService.shelf()) || [];
              if (!sl.length) return `<button class="lib-empty-home" onclick="Router.go('wisdom/library')">
                  <span class="lib-empty-ic"><i class="fas fa-plus"></i></span>
                  <span class="lib-empty-t">${LibraryData.L('libShelfHomeEmptyTitle')}</span>
                  <span class="lib-empty-d">${LibraryData.L('libShelfHomeEmptyDesc')}</span>
                </button>`;
              return `<div class="hm-strip clips-home-row lib-home-row hm-lib-row">${sl.slice(0, 10).map(b => {
                const k = b.kind || 't';
                const go = k === 'ih' ? ('Router.go(\'wisdom/library\',{ihbook:' + b.id + '})') : ('Router.go(\'wisdom/library\',{book:' + b.id + '})');
                return `<button class="lib-home-card" onclick="${go}" aria-label="${escapeAttr(b.name || '')}">
                    ${LibraryPage._cover(b, '', k)}
                    <span class="clip-home-title">${escapeHtml(b.name || '')}</span>
                  </button>`;
              }).join('')}</div>`;
            })()}
            <div class="hm-lib-chips">
              <button class="hm-lib-chip" onclick="Router.go('wisdom/library',{newmuslims:true})"><i class="fas fa-seedling"></i> ${LibraryData.L('libCardNewMuslims')}</button>
              <button class="hm-lib-chip" onclick="Router.go('wisdom/library',{kids:true})"><i class="fas fa-child-reaching"></i> ${LibraryData.L('libCardKids')}</button>
              <button class="hm-lib-chip" onclick="Router.go('wisdom/library',{topic:'qisas'})"><i class="fas fa-feather"></i> ${LibraryData.L('libSecQisas')}</button>
              <button class="hm-lib-chip" onclick="Router.go('wisdom/library',{topic:'seerah'})"><i class="fas fa-book"></i> ${LibraryData.L('libSecSeerah')}</button>
              <button class="hm-lib-chip" onclick="Router.go('wisdom/library',{topic:'hadith')"><i class="fas fa-quote-right"></i> ${LibraryData.L('libSecHadith')}</button>
              <button class="hm-lib-chip" onclick="Router.go('wisdom/library',{topic:'fiqh'})"><i class="fas fa-scale-balanced"></i> ${LibraryData.L('libSecFiqh')}</button>
            </div>
          </div>
        </section>

        <!-- دعاء اليوم — بطاقة صغيرة -->
        ${dua ? this._duaCardHtml(dua, loc0) : ''}

        <!-- حديث اليوم — بطاقة صغيرة -->
        ${hadith ? this._hadithSmallHtml(hadith, loc0) : ''}

        <!-- المناسبات: رمضان (مؤقت كامل) + الصيام + المناسبة القادمة + مناسبة اليوم -->
        <section class="hm-occ">
          <div class="hm-occ-strip">
            ${this._ramadanCountdownHtml()}
            ${this._nextFastHtml()}
            ${this._nextEventHtml()}
            ${virtue ? this._virtueCardHtml(virtue) : ''}
          </div>
        </section>
      </div>
    `;

    // v95: ضبط أسهم شريط الأيقونات بعد الرسم — السهم يظهر فقط عند وجود مزيد
    // v102: شريط القبلة — رسم الساعة + بدء مستشعر الاتجاه
    try { this._qiblaStart(loc); } catch (e) {}
    // v102: مزامنة أولية لخط التقدّم والسطر «مضى على …»
    try { this._tickHero(); } catch (e) {}
  },

  // v26: marcar/desmarcar una oración como realizada (check-in diario).
  // El estado se guarda por fecha: mañana las casillas vuelven a estar vacías.
  // v35: ¿ya pasó la hora del adhan de esta oración hoy?
  // Sunrise no está en la lista de check-in; aquí solo llegan las 5 oraciones.
  // v57: جرس الإشعارات بجانب كل صلاة — يطفئ/يشغّل إشعارها وصوت أذانها
  // ============ v60: العد التنازلي لرمضان (motor hijri local Umm al-Qura) ============
  _ramadanMonthName() {
    const l = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    return { es: 'Ramadán', ar: 'رمضان', en: 'Ramadan' }[l];
  },

  // Busca el próximo 1 de Ramadán día a día con HijriCalc (local, sin red).
  _findRamadanTarget() {
    if (typeof HijriCalc === 'undefined' || !HijriCalc.toGregorian) return null;
    try {
      const now = new Date();
      const h0 = HijriCalc.fromDate(now);
      if (!h0) return null;
      // v64 FIX (فرق الساعات): نحسب تاريخ 1 رمضان مباشرة عبر toGregorian ثم
      // نجعل الهدف منتصف الليل المحلي 00:00 الذي يبدأ عنده اليوم فعلًا — قبل
      // ذلك كان الهدف ظهر اليوم السابق (تقدير متوسط + بحث يومي)، فيظهر العد
      // التنازلي متقدمًا عدّة ساعات عن بدء رمضان الحقيقي.
      const hy = (h0.month >= 9) ? h0.year + 1 : h0.year; // داخل/بعد رمضان → رمضان القادم
      let g = HijriCalc.toGregorian(hy, 9, 1); // Date محلية 12:00 ليوم 1 رمضان (أم القرى)
      let target = g ? new Date(g.getFullYear(), g.getMonth(), g.getDate(), 0, 0, 0, 0) : null;
      if (!target || target.getTime() <= now.getTime()) {
        g = HijriCalc.toGregorian(hy + 1, 9, 1);
        target = g ? new Date(g.getFullYear(), g.getMonth(), g.getDate(), 0, 0, 0, 0) : null;
      }
      return target;
    } catch (e) {}
    return null;
  },

  // ============ v95: مؤقّت رمضان — بطاقة كاملة (بلا قطع) + زر التقويم الهجري ============
  _ramadanCountdownHtml() {
    const target = this._findRamadanTarget();
    if (!target) return '';
    this._ramadanTarget = target;
    let hijriYear = '';
    try { const h = HijriCalc.fromDate(target); if (h && h.year) hijriYear = h.year; } catch (e) {}
    const loc = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    let gFmt;
    try { gFmt = target.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { gFmt = target.toISOString().slice(0, 10); }
    return `
      <div class="ramadan-cd-card occ-card occ-ramadan">
        <div class="occ-head">
          <span class="occ-ic"><i class="fas fa-moon"></i></span>
          <span class="occ-title">${t('ramadanCountdown')}</span>
          <button class="occ-btn" onclick="Router.go('calendar')" title="${escapeAttr(t('hijriCalendar') || '')}">
            <i class="fas fa-calendar-days"></i> ${t('hijriCalendar')}
          </button>
        </div>
        <div class="ramadan-cd-grid">
          <div class="ramadan-cd-cell"><div class="ramadan-cd-num" id="ramadan-cd-d">–</div><div class="ramadan-cd-lbl">${t('cdDays')}</div></div>
          <div class="ramadan-cd-cell"><div class="ramadan-cd-num" id="ramadan-cd-h">–</div><div class="ramadan-cd-lbl">${t('cdHours')}</div></div>
          <div class="ramadan-cd-cell"><div class="ramadan-cd-num" id="ramadan-cd-m">–</div><div class="ramadan-cd-lbl">${t('cdMinutes')}</div></div>
          <div class="ramadan-cd-cell"><div class="ramadan-cd-num" id="ramadan-cd-s">–</div><div class="ramadan-cd-lbl">${t('cdSeconds')}</div></div>
        </div>
        <div class="ramadan-cd-dates">
          <div class="ramadan-cd-date"><div class="ramadan-cd-date-lbl">${t('hijriDate')}</div><div>1 ${this._ramadanMonthName()} ${hijriYear} ${loc === 'ar' ? 'هـ' : 'AH'}</div></div>
          <div class="ramadan-cd-date"><div class="ramadan-cd-date-lbl">${t('gregDate')}</div><div>${gFmt}</div></div>
        </div>
        <button class="occ-cta" onclick="Router.go('imsakiyah')">
          <i class="fas fa-table-list"></i> ${t('imsakOpen') || ''}
        </button>
      </div>
    `;
  },

  // Busca el próximo 1 de Ramadán día a día con HijriCalc (local, sin red).
  _findRamadanTarget() {
    if (typeof HijriCalc === 'undefined' || !HijriCalc.toGregorian) return null;
    try {
      const now = new Date();
      const h0 = HijriCalc.fromDate(now);
      if (!h0) return null;
      const hy = (h0.month >= 9) ? h0.year + 1 : h0.year;
      let g = HijriCalc.toGregorian(hy, 9, 1);
      let target = g ? new Date(g.getFullYear(), g.getMonth(), g.getDate(), 0, 0, 0, 0) : null;
      if (!target || target.getTime() <= now.getTime()) {
        g = HijriCalc.toGregorian(hy + 1, 9, 1);
        target = g ? new Date(g.getFullYear(), g.getMonth(), g.getDate(), 0, 0, 0, 0) : null;
      }
      return target;
    } catch (e) {}
    return null;
  },

  _tickRamadan() {
    const target = this._ramadanTarget;
    if (!target || !document.getElementById('ramadan-cd-d')) return;
    let diff = target.getTime() - Date.now();
    if (diff < 0) diff = 0;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('ramadan-cd-d', Math.floor(diff / 86400000));
    set('ramadan-cd-h', Math.floor((diff % 86400000) / 3600000));
    set('ramadan-cd-m', Math.floor((diff % 3600000) / 60000));
    set('ramadan-cd-s', Math.floor((diff % 60000) / 1000));
  },

  // ============ v61: شريط «أكمل القراءة» — رفيع وبسيط على نمط تطبيقات المصاحف ============
  // يقرأ آخر آية محفوظة تلقائيًا أثناء القراءة (QuranPage._trackLastRead) ويعود إليها عند الضغط.
  _resumeStripHtml() {
    try {
      if (typeof QuranPage === 'undefined' || !QuranPage.getLastRead) return '';
      const lr = QuranPage.getLastRead();
      if (!lr || !lr.s) return '';
      const loc = (typeof currentLocale !== 'undefined' && ['es','ar','en'].includes(currentLocale)) ? currentLocale : 'es';
      const info = (typeof RadioData !== 'undefined' && RadioData.surahInfo) ? RadioData.surahInfo(lr.s) : null;
      const surahName = info ? (loc === 'ar' ? info.ar : (loc === 'en' ? info.en : info.es)) : '';
      const page = this._ayahPage(lr.s, lr.a);
      let rel = '';
      if (lr.t) {
        const days = Math.floor((Date.now() - lr.t) / 86400000);
        rel = days <= 0 ? t('resumeToday') : (days === 1 ? t('resumeYesterday') : t('resumeDaysAgo').replace('{n}', days));
      }
      return `
      <button class="resume-strip" onclick="Router.go('surah',{surahNumber:${lr.s},ayah:${lr.a}})" aria-label="${escapeAttr(t('resumeReading'))}">
        <span class="resume-strip-ic"><i class="fas fa-bookmark"></i></span>
        <span class="resume-strip-body">
          <span class="resume-strip-label">${t('resumeReading')} — ${t('resumeStoppedAt')}</span>
          <span class="resume-strip-title">${loc === 'ar' ? 'سورة ' : ''}${escapeHtml(surahName)} — ${t('resumeAyah')} ${lr.a}</span>
          <span class="resume-strip-meta">${page ? t('resumePage') + ' ' + page : ''}${page && rel ? ' · ' : ''}${rel}</span>
        </span>
        <i class="fas fa-chevron-${document.documentElement.dir === 'rtl' ? 'left' : 'right'} resume-strip-arrow"></i>
      </button>`;
    } catch (e) { return ''; }
  },

  // ============ v63: بطاقة «حديث اليوم» — نفس نمط بطاقة «دعاء اليوم» ============
  _hadithCardHtml(hadith) {
    try {
      if (!hadith) return '';
      const hloc = ['es','ar','en'].includes(AppState.settings.locale) ? AppState.settings.locale : 'es';
      const htr = hadith['translation_' + hloc];
      const hsrc = hadith['source_' + hloc] || hadith.source_es || '';
      return `
        <h2 class="section-title"><i class="fas fa-scroll"></i> ${t('hadithOfDay')}</h2>
        <div class="card dua-day-card hadith-day-card">
          <div class="dua-arabic">${escapeHtml(hadith.arabic)}</div>
          ${htr ? `<div class="dua-translation">"${escapeHtml(htr)}"</div>` : ''}
          <div class="dua-source">— ${escapeHtml(hsrc)}</div>
        </div>`;
    } catch (e) { return ''; }
  },

  // صفحة المصحف (مصحف المدينة) التي تقع فيها الآية — من تجزئة المصحف المحلية (أوفلاين)
  _ayahPage(surah, ayah) {
    try {
      // الأدق: المصحف المحلي (مصحف المدينة، أوفلاين) — الصفحة التي تحوي الآية فعلًا
      const qfa = (typeof window !== 'undefined') && window.QURAN_FULL_AR;
      if (qfa && qfa.pages) {
        for (let i = 0; i < qfa.pages.length; i++) {
          const ay = qfa.pages[i].ayahs || [];
          for (const a of ay) { if (a[0] === surah && a[1] === ayah) return i + 1; }
        }
      }
      const divs = (typeof window !== 'undefined') && window.MUSHAF_DIVISIONS;
      if (divs && divs.rubs) {
        let page = 1;
        for (const r of divs.rubs) {
          if (r.s < surah || (r.s === surah && r.a <= ayah)) page = r.page;
          else break;
        }
        return page;
      }
    } catch (e) {}
    return null;
  },

  _hijriMonthName(m, loc) {
    const M = {
      ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
      es: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Akhir', 'Jumada al-Ula', 'Jumada al-Akhirah', 'Rayab', 'Shaban', 'Ramadán', 'Shawwal', 'Dhul-Qada', 'Dhul-Hiyya'],
      en: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'],
    };
    return ((M[loc] || M.es)[m - 1]) || '';
  },

  // ============ v61: المناسبة القادمة — بمحرك أم القرى المحلي (دون إنترنت) ============
  // ============ v95: المناسبة القادمة — بطاقة ملوّنة ============
  _nextEventHtml() {
    try {
      if (typeof ISLAMIC_HOLIDAYS === 'undefined' || typeof HijriCalc === 'undefined' || !HijriCalc.nextOccurrence) return '';
      let best = null;
      for (const h of ISLAMIC_HOLIDAYS) {
        const oc = HijriCalc.nextOccurrence(h.month, h.day);
        if (oc && (!best || oc.daysLeft < best.daysLeft)) best = { ...oc, h };
      }
      if (!best) return '';
      const loc = (typeof currentLocale !== 'undefined' && ['es', 'ar', 'en'].includes(currentLocale)) ? currentLocale : 'es';
      const name = best.h['name_' + loc] || best.h.name_es;
      let gFmt;
      try { gFmt = best.date.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' }); }
      catch (e) { gFmt = best.date.toISOString().slice(0, 10); }
      const daysTxt = best.daysLeft === 0 ? t('todayWord') : (best.daysLeft === 1 ? t('tomorrowWord') : t('daysLeftTxt').replace('{n}', best.daysLeft));
      return `
      <div class="occ-card occ-event">
        <div class="occ-head">
          <span class="occ-ic"><i class="fas fa-star-and-crescent"></i></span>
          <span class="occ-title">${t('nextEventTitle')}</span>
        </div>
        <div class="occ-main">${escapeHtml(name)}</div>
        <div class="occ-meta">${best.h.day} ${this._hijriMonthName(best.h.month, loc)} ${best.hijriYear} ${loc === 'ar' ? 'هـ' : 'AH'} · ${escapeHtml(gFmt)} · ${daysTxt}</div>
      </div>`;
    } catch (e) { return ''; }
  },

  // ============ v61: يوم الصيام القادم (الاثنين/الخميس · الأيام البيض · عاشوراء وعرفة) ============
  // داخل رمضان لا يُعرض — لرمضان عدّاده الخاص أعلاه.
  // ============ v95: يوم الصيام القادم — بطاقة ملوّنة بأسلوب المناسبات ============
  _nextFastHtml() {
    try {
      if (typeof HijriCalc === 'undefined' || !HijriCalc.fromDate) return '';
      const EVENT_FASTS = { '1,10': true, '12,9': true }; // عاشوراء · يوم عرفة
      for (let i = 0; i < 60; i++) {
        const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i);
        const h = HijriCalc.fromDate(d);
        if (!h) continue;
        let kind = null;
        if (EVENT_FASTS[h.month + ',' + h.day]) kind = 'fastEvent';
        else if (h.month !== 9 && h.day >= 13 && h.day <= 15) kind = 'fastWhite';
        else if (h.month !== 9 && (d.getDay() === 1 || d.getDay() === 4)) kind = 'fastWeekday';
        if (!kind) continue;
        const loc = (typeof currentLocale !== 'undefined' && ['es', 'ar', 'en'].includes(currentLocale)) ? currentLocale : 'es';
        let gFmt;
        try { gFmt = d.toLocaleDateString(loc, { day: 'numeric', month: 'long' }); } catch (e) { gFmt = d.toISOString().slice(0, 10); }
        const wd = (typeof getWeekdayName === 'function') ? getWeekdayName(d.getDay(), loc) : '';
        const daysTxt = i === 0 ? t('todayWord') : (i === 1 ? t('tomorrowWord') : t('daysLeftTxt').replace('{n}', i));
        return `
      <div class="occ-card occ-fast">
        <div class="occ-head">
          <span class="occ-ic"><i class="fas fa-moon"></i></span>
          <span class="occ-title">${t('nextFastTitle')} — ${t(kind)}</span>
        </div>
        <div class="occ-main">${escapeHtml(wd)} · ${escapeHtml(gFmt)}</div>
        <div class="occ-meta">${h.day} ${this._hijriMonthName(h.month, loc)} ${h.year} ${loc === 'ar' ? 'هـ' : 'AH'} · ${daysTxt}</div>
      </div>`;
      }
    } catch (e) {}
    return '';
  },

  _prayerBellHtml(name) {
    if (typeof PrayerNotifications === 'undefined' || !PrayerNotifications.PRAYERS ||
        PrayerNotifications.PRAYERS.indexOf(name) === -1) return '';
    const on = PrayerNotifications.isPrayerOn(name);
    return `<button class="prayer-bell ${on ? '' : 'off'}" data-prayer-bell="${name}" aria-pressed="${on}" title="${t('prayerBellTitle') || 'إشعار وأذان هذه الصلاة'}" onclick="event.stopPropagation(); HomePage.togglePrayerNotif('${name}')"><i class="fas ${on ? 'fa-bell' : 'fa-bell-slash'}"></i></button>`;
  },

  togglePrayerNotif(name) {
    if (typeof PrayerNotifications === 'undefined' || !PrayerNotifications.setPrayerOn) return;
    const on = !PrayerNotifications.isPrayerOn(name);
    PrayerNotifications.setPrayerOn(name, on);
    document.querySelectorAll('[data-prayer-bell="' + name + '"]').forEach(b => {
      b.classList.toggle('off', !on);
      b.setAttribute('aria-pressed', String(on));
      const ic = b.querySelector('i');
      if (ic) ic.className = 'fas ' + (on ? 'fa-bell' : 'fa-bell-slash');
    });
    const pname = t('prayers.' + name) || name;
    if (typeof showToast === 'function') showToast((on ? '🔔 ' : '🔕 ') + pname, 1400);
  },

  isAdhanPassed(name) {
    const raw = (typeof AppState !== 'undefined' && AppState.timings) ? AppState.timings[name] : null;
    if (!raw) return true; // sin horario disponible → no bloquear
    const clean = String(raw).split(' ')[0];
    const [h, m] = clean.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return true;
    const adhanAt = new Date();
    adhanAt.setHours(h, m, 0, 0);
    return Date.now() >= adhanAt.getTime();
  },

  toggleCheckin(name, btn) {
    if (typeof PrayerTracker === 'undefined') return;
    // v35: no permitir marcar antes de la hora del adhan
    if (!this.isAdhanPassed(name)) {
      showToast('🕐 ' + (t('prayerNotYetToast') || 'Aún no ha llegado la hora del adhan'), 2200);
      if (navigator.vibrate) navigator.vibrate(40);
      return;
    }
    const nowDone = PrayerTracker.toggle(name);
    if (btn) {
      btn.classList.toggle('checked', nowDone);
      btn.setAttribute('aria-pressed', nowDone);
      const row = btn.closest('.prayer-row');
      if (row) row.classList.toggle('prayer-done', nowDone);
    }
    // Actualizar el contador del encabezado (X/5 ✔)
    const prog = document.querySelector('.prayer-checkin-progress');
    if (prog) prog.textContent = `${PrayerTracker.doneCount()}/${PrayerTracker.totalCount()} ✔`;
    if (navigator.vibrate) navigator.vibrate(30);
    if (nowDone) {
      showToast('✔️ ' + (t('prayerDoneToast') || ''), 1800);
      if (PrayerTracker.doneCount() === PrayerTracker.totalCount()) {
        showToast('🎉 ' + (t('allPrayersDoneToast') || ''), 3000);
      }
    }
  },

  prayerArabic(name) {
    const map = {
      Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر',
      Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
    };
    return map[name] || '';
  },

  progressRing(progress, icon, label, value, color) {
    const r = 32;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - progress);
    return `
      <div class="progress-ring-container">
        <div class="progress-ring-wrapper">
          <svg class="progress-ring-svg" width="80" height="80">
            <circle class="progress-ring-bg" cx="40" cy="40" r="${r}"></circle>
            <circle class="progress-ring-fg" cx="40" cy="40" r="${r}"
                    style="stroke: ${color}; stroke-dasharray: ${circ}; stroke-dashoffset: ${offset};"></circle>
          </svg>
          <div class="progress-ring-center">
            <div>${icon}</div>
            <div class="progress-ring-value">${value}</div>
          </div>
        </div>
        <div class="progress-ring-label">${label}</div>
      </div>
    `;
  },

  startCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      // v60: العد التنازلي لرمضان مستقل عن مواقيت الصلاة
      this._tickRamadan();
      try { this._tickHero(); } catch (e) {}
      if (!AppState.timings) return;
      const np = getNextPrayer(AppState.timings);
      if (!np) return;
      const el = document.getElementById('countdown');
      if (el) el.textContent = formatCountdown(np.diffMs);
      // v38/v40: actualizar también el «tiempo restante» bajo la hora de la
      // próxima oración. Al cambiar de oración se actualizan SOLO los nodos
      // afectados (tarjeta + filas), sin re-render completo: antes el
      // re-render cada minuto lanzaba skeleton + peticiones de red y el
      // usuario lo percibía como «la página se recarga al hacer cualquier
      // cosa».
      const remEl = document.querySelector('.prayer-remaining');
      if (remEl) {
        if (remEl.dataset.prayerRemaining === np.name) {
          const txt = remEl.querySelector('.prayer-remaining-text');
          if (txt) txt.textContent = formatCountdown(np.diffMs);
        } else {
          this._moveNextPrayer(np);
        }
      }
    }, 1000);
  },

  // v40: cambio de oración SIN re-render — actualiza en su sitio la tarjeta
  // de la cabecera y mueve el marcador «siguiente» entre las filas.
  // v95: تغيير الصلاة القادمة — البحث باسم الصلاة (data-prayer) بدل الفهرس،
  //      لأن الشبكة صارت خمس حبّات (بلا الشروق) والفهرس القديم كان يحرّك الحبّة الخطأ.
  _moveNextPrayer(np) {
    const container = document.getElementById('main-content');
    if (!container) return;
    const nameEl = container.querySelector('#next-prayer-name');
    if (nameEl) nameEl.textContent = t('prayers.' + np.name);
    const timeEl = container.querySelector('#next-prayer-time');
    if (timeEl) timeEl.textContent = formatTime12h(np.time);
    container.querySelectorAll('.prayer-row.next').forEach(r => r.classList.remove('next'));
    const remEl = container.querySelector('.prayer-remaining');
    if (remEl) remEl.remove();
    const row = container.querySelector('.prayer-row[data-prayer="' + np.name + '"]');
    if (row) {
      row.classList.add('next');
      const html = `<span class="prayer-remaining" data-prayer-remaining="${np.name}"><span class="prayer-remaining-text">${formatCountdown(np.diffMs)}</span></span>`;
      const tools = row.querySelector('.hm-chip-tools');
      if (tools) tools.insertAdjacentHTML('beforebegin', html);
      else row.insertAdjacentHTML('beforeend', html);
    }
  },

  // ============ v94: تبويبات قسم الوسائط (راديو · مقتطفات · مكتبة) ============
  _mPane: 'radio',

  mediaTab(pane) {
    if (['radio', 'clips', 'library'].indexOf(pane) === -1) pane = 'radio';
    this._mPane = pane;
    ['radio', 'clips', 'library'].forEach(k => {
      const el = document.getElementById('hm-pane-' + k);
      if (el) el.hidden = (k !== pane);
    });
    const root = document.getElementById('main-content') || document;
    root.querySelectorAll('.hm-tab').forEach(b => b.classList.toggle('active', b.dataset.pane === pane));
  },

  mediaMore() {
    const p = this._mPane || 'radio';
    if (p === 'clips') Router.go('videos');
    else if (p === 'library') Router.go('wisdom/library');
    else Router.go('radio');
  },

  // ============ v95: بطاقات صغيرة للآية/الدعاء/الحديث/مناسبة اليوم ============
  _verseCardHtml(verse, loc0) {
    try {
      if (!verse) return '';
      const tr = (loc0 === 'ar') ? (verse.translation_ar || '') : (verse['translation_' + loc0] || verse.translation_es || '');
      const wis = verse['wisdom_' + loc0] || verse.wisdom_es || '';
      return `
      <section class="hm-card hm-small hm-c-verse">
        <div class="hm-card-head">
          <h2 class="hm-title"><i class="fas fa-book-open-reader"></i> ${t('verseOfDay')}</h2>
          <button class="hm-icon-btn" onclick="ShareCard.open('verse')" aria-label="${escapeAttr(t('shareCardBtn') || '')}"><i class="fas fa-share-nodes"></i></button>
        </div>
        <div class="card-gradient hm-verse-body">
          <div class="verse-arabic" dir="rtl">${escapeHtml(verse.arabic || '')}</div>
          ${verse.transliteration ? `<div class="verse-translit">${escapeHtml(verse.transliteration)}</div>` : ''}
          <div class="verse-divider"></div>
          <div class="verse-translation">"${escapeHtml(tr)}"</div>
          <div class="verse-source">— ${escapeHtml(verse.surahName)} ${verse.surahNumber}:${verse.ayahNumber}</div>
          ${wis ? `<div class="verse-wisdom"><i class="fas fa-lightbulb"></i> <span>${escapeHtml(wis)}</span></div>` : ''}
        </div>
      </section>`;
    } catch (e) { return ''; }
  },

  _duaCardHtml(dua, loc0) {
    try {
      if (!dua) return '';
      const tr = (loc0 === 'ar') ? (dua.translation_ar || '') : (dua['translation_' + loc0] || dua.translation_es || dua.translation || '');
      return `
      <section class="hm-card hm-small hm-c-dua">
        <div class="hm-card-head">
          <h2 class="hm-title"><i class="fas fa-hands-praying"></i> ${t('duaOfDay')}</h2>
          <button class="hm-icon-btn" onclick="ShareCard.open('dua')" aria-label="${escapeAttr(t('shareCardBtn') || '')}"><i class="fas fa-share-nodes"></i></button>
        </div>
        <div class="card dua-day-card hm-verse-body">
          <div class="dua-title">${escapeHtml(dua['title_' + loc0] || dua.title || '')}</div>
          <div class="dua-arabic" dir="rtl">${escapeHtml(dua.arabic || '')}</div>
          ${dua.transliteration ? `<div class="dua-transliteration">${escapeHtml(dua.transliteration)}</div>` : ''}
          <div class="dua-translation">"${escapeHtml(tr)}"</div>
          <div class="dua-source">— ${escapeHtml(dua.source || '')}</div>
        </div>
      </section>`;
    } catch (e) { return ''; }
  },

  _hadithSmallHtml(hadith, loc0) {
    try {
      if (!hadith) return '';
      // v101: في العربية لا تُعرض أي ترجمة — نص الحديث ومصدره بالعربية فقط (كنمط الآية والدعاء)
      const isAr = (loc0 === 'ar');
      const tr = isAr ? (hadith.translation_ar || '') : (hadith['translation_' + loc0] || hadith.translation_es || '');
      const src = hadith['source_' + loc0] || (isAr ? '' : hadith.source_es) || '';
      return `
      <section class="hm-card hm-small hm-c-hadith">
        <div class="hm-card-head">
          <h2 class="hm-title"><i class="fas fa-scroll"></i> ${t('hadithOfDay')}</h2>
        </div>
        <div class="card dua-day-card hadith-day-card hm-verse-body">
          <div class="dua-arabic" dir="rtl">${escapeHtml(hadith.arabic || '')}</div>
          ${tr ? `<div class="dua-translation">"${escapeHtml(tr)}"</div>` : ''}
          <div class="dua-source">— ${escapeHtml(src)}</div>
        </div>
      </section>`;
    } catch (e) { return ''; }
  },

  _virtueCardHtml(virtue) {
    try {
      if (!virtue) return '';
      return `
      <div class="occ-card occ-virtue">
        <div class="occ-head">
          <span class="occ-ic"><i class="fas fa-sparkles"></i></span>
          <span class="occ-title">${escapeHtml(virtue.title || '')}</span>
        </div>
        <div class="occ-main">${escapeHtml(virtue.verse || '')}</div>
        <div class="occ-meta">— ${escapeHtml(virtue.source || '')}</div>
      </div>`;
    } catch (e) { return ''; }
  },

  // ============ v95: أيقونة لكل صلاة (SVG مدمج — مُضمَنة في كل الحالات) ============
  _prayerIcon(name, size) {
    const s = size || 20;
    const open = '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    const sun = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
    const rays = (cx, cy, r, len) => {
      let d = '';
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i;
        const x1 = cx + Math.cos(a) * (r + 1.4), y1 = cy + Math.sin(a) * (r + 1.4);
        const x2 = cx + Math.cos(a) * (r + 1.4 + len), y2 = cy + Math.sin(a) * (r + 1.4 + len);
        d += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
      }
      return d;
    };
    const crescent = '<path d="M15.6 5.2a6 6 0 1 0 3.1 8.6 6.9 6.9 0 0 1-3.1-8.6z" fill="currentColor" stroke="none"/>';
    const star = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
    let body = '';
    if (name === 'Fajr') {
      // فجر: هلال الفجر + سطر الأفق
      body = crescent + star(5.2, 7.4, 0.95) + star(3.4, 11.6, 0.7) + '<path d="M4 18.4h16"/>';
    } else if (name === 'Sunrise') {
      // شروق: نصف شمس فوق الأفق + سهم صاعد
      body = '<path d="M3.4 17.6h17.2"/><path d="M6.6 17.6a5.4 5.4 0 0 1 10.8 0"/>'
        + '<path d="M12 3.4v2.4"/><path d="M5.6 6.2l1.4 1.4"/><path d="M18.4 6.2l-1.4 1.4"/>';
    } else if (name === 'Dhuhr') {
      body = sun(12, 12, 4) + rays(12, 12, 4, 2.1);
    } else if (name === 'Asr') {
      // عصر: شمس مع غيمة
      body = sun(9.6, 9.6, 3.1) + rays(9.6, 9.6, 3.1, 1.6)
        + '<path d="M8.6 18.4h9.2a3.1 3.1 0 0 0 .2-6.2 4.3 4.3 0 0 0-8.2 1 2.7 2.7 0 0 0-1.2 5.2z" fill="none"/>';
    } else if (name === 'Maghrib') {
      // مغرب: شمس تغيب تحت الأفق + سهم هابط
      body = '<path d="M3.4 15.2h17.2"/><path d="M6.6 15.2a5.4 5.4 0 0 1 10.8 0"/>'
        + '<path d="M12 19.6v2.2"/><path d="M9.9 19.9l2.1 2.1 2.1-2.1"/>';
    } else {
      // عشاء: هلال + نجوم
      body = crescent + star(5.4, 7, 1.05) + star(3.2, 11.2, 0.75) + star(7.8, 17.4, 0.85) + star(17.2, 18.6, 0.7);
    }
    return open + body + '</svg>';
  },

  // ============ v95: أسهم شريط الأيقونات (تدلّ على وجود مزيد من الأيقونات) ============
  qScroll(dir) {
    const el = document.getElementById('home-quick-grid');
    if (!el) return;
    const rtl = document.documentElement.dir === 'rtl';
    const amount = Math.max(150, Math.round(el.clientWidth * 0.75));
    const left = (rtl ? -1 : 1) * (dir || 1) * amount;
    try { el.scrollBy({ left, behavior: 'smooth' }); } catch (e) { el.scrollLeft += left; }
    setTimeout(() => { try { this._syncQArrows(); } catch (e) {} }, 420);
  },

  _syncQArrows() {
    const el = document.getElementById('home-quick-grid');
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft || 0);
    const scrollable = max > 4;
    const atStart = pos <= 4;
    const atEnd = !scrollable || pos >= max - 4;
    const root = el.closest('.hh-quick') || el.parentElement;
    if (!root) return;
    const a = root.querySelector('.hh-arrow-start');
    const b = root.querySelector('.hh-arrow-end');
    if (a) a.classList.toggle('show', scrollable && !atStart);
    if (b) b.classList.toggle('show', scrollable && !atEnd);
  },

  // ============ v98: تقليص رأس الصفحة قليلًا عند النزول ============
  // v100: تقليص الرأس — قراءة واحدة لكل إطار (rAF) + منطقة ميتة (يدخل عند 44px
  //       ويخرج عند 6px) فلا يحدث اهتزاز/لاق إذا توقّف التمرير عند الحدّ.
  _bindShrink() {
    const hero = document.getElementById('home-hero');
    const cont = document.getElementById('main-content');
    if (!hero || !cont) return;
    let ticking = false;
    const apply = () => {
      ticking = false;
      const y = Math.max(cont.scrollTop || 0, window.pageYOffset || 0);
      const on = hero.classList.contains('hh-shrunk') ? (y > 6) : (y > 44);
      if (hero.classList.contains('hh-shrunk') !== on) hero.classList.toggle('hh-shrunk', on);
    };
    this._shrinkH = () => { if (ticking) return; ticking = true; requestAnimationFrame(apply); };
    this._shrinkSc = cont;
    cont.addEventListener('scroll', this._shrinkH, { passive: true });
    window.addEventListener('scroll', this._shrinkH, { passive: true });
    apply();
  },

  _unbindShrink() {
    if (this._shrinkH) {
      if (this._shrinkSc) this._shrinkSc.removeEventListener('scroll', this._shrinkH);
      window.removeEventListener('scroll', this._shrinkH);
    }
    this._shrinkH = null;
    this._shrinkSc = null;
  },
  _unbindShrink() {
    if (this._scrollEl && this._onScroll) {
      try { this._scrollEl.removeEventListener('scroll', this._onScroll); } catch (e) {}
    }
    this._scrollEl = null;
    this._onScroll = null;
    this._shrunk = false;
  },

  // ============ v102: خلفية الرأس حسب الوقت · خط تقدّم اليوم · القبلة الحيّة ============
  _mnOf(ts) {
    const m = String(ts || '').split(' ')[0].match(/(\d{1,2}):(\d{2})/);
    return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
  },

  // لحظة الصلاة الحقيقية (تحترم فرق توقيت المدينة المختارة يدويًا)
  _moment(timings, name, dayOffset) {
    if (!timings) return null;
    const ts = String(timings[name] || '').split(' ')[0];
    if (!ts || ts.indexOf(':') === -1) return null;
    const deltaMs = Number(timings._cityDeltaMs) || 0;
    let d = null;
    if (deltaMs && typeof CityClock !== 'undefined' && CityClock.toDate) {
      try { d = CityClock.toDate(ts, deltaMs, new Date()); } catch (e) { d = null; }
    }
    if (!d) {
      const parts = ts.split(':').map(Number);
      if (isNaN(parts[0]) || isNaN(parts[1])) return null;
      d = new Date();
      d.setHours(parts[0], parts[1], 0, 0);
    }
    if (dayOffset) d = new Date(d.getTime() + dayOffset * 86400000);
    return d;
  },

  _skyKey(timings) {
    const now = new Date();
    const m = now.getHours() * 60 + now.getMinutes();
    const f = this._mnOf(timings && timings.Fajr);
    const s = this._mnOf(timings && timings.Sunrise);
    const a = this._mnOf(timings && timings.Asr);
    const g = this._mnOf(timings && timings.Maghrib);
    if (f !== null && m < f) return 'night';
    if (g !== null && m >= g) return 'night';
    if (f !== null && s !== null && m >= f && m < s + 25) return 'morning';
    if (a !== null && g !== null && m >= a) return 'dusk';
    return 'noon';
  },

  // v103: خط التقدّم دقيق — كل صلاة عند مركز خليّتها في الشريط تمامًا،
  //       والحركة بين صلاة وأخرى تُوزَّع على المسافة بين الخليّتين فقط،
  //       فدقائق قليلة بعد الأذان تحرّك الكرة قليلًا لا بعيدًا.
  _dayProgress(timings) {
    const CELLS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const N = CELLS.length;
    const now = Date.now();
    const pts = [];
    for (const n of CELLS) {
      const d = this._moment(timings, n);
      if (d) pts.push(d.getTime());
    }
    if (pts.length < 2) return 0;
    const c = (i) => ((i + 0.5) / N) * 100;
    if (now <= pts[0]) return c(0);
    for (let i = 0; i < pts.length - 1; i++) {
      if (now >= pts[i] && now < pts[i + 1]) {
        const f = (now - pts[i]) / (pts[i + 1] - pts[i]);
        return c(i) + f * (c(i + 1) - c(i));
      }
    }
    return c(pts.length - 1);
  },

  // v103: موضع علامة الصلاة = مركز خليّتها (نفس مرجع الكرة تمامًا)
  _prayerPct(timings, name) {
    const CELLS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const i = CELLS.indexOf(name);
    return i < 0 ? 0 : ((i + 0.5) / CELLS.length) * 100;
  },

  _prevPrayerText(timings, loc0) {
    try {
      const ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const now = Date.now();
      let best = null;
      for (const n of ORDER) {
        const d = this._moment(timings, n);
        if (d && d.getTime() <= now) best = { n, d };
      }
      if (!best) {
        const d = this._moment(timings, 'Isha', -1);
        if (d) best = { n: 'Isha', d };
      }
      if (!best) return '';
      const mins = Math.max(0, Math.round((now - best.d.getTime()) / 60000));
      const name = t('prayers.' + best.n);
      let dur;
      if (mins < 60) dur = (loc0 === 'ar' ? mins + ' دقيقة' : mins + ' min');
      else {
        const h = Math.floor(mins / 60), r = mins % 60;
        if (loc0 === 'ar') dur = r ? h + ' ساعة و' + r + ' دقيقة' : h + ' ساعة';
        else dur = r ? h + ' h ' + r + ' min' : h + ' h';
      }
      if (loc0 === 'ar') return 'مضى على ' + name + ' ' + dur;
      if (loc0 === 'en') return dur + ' since ' + name;
      return 'Han pasado ' + dur + ' de ' + name;
    } catch (e) { return ''; }
  },

  // تحديث كل ثانية: السطر «مضى على …» + خط التقدّم + خلفية الرأس
  _tickHero() {
    if (!AppState.timings) return;
    const loc0 = (typeof currentLocale !== 'undefined' && ['es', 'ar', 'en'].includes(currentLocale)) ? currentLocale : 'es';
    const prev = this._prevPrayerText(AppState.timings, loc0);
    const pv = document.getElementById('hsx-prev');
    if (pv && prev && pv.dataset.txt !== prev) {
      pv.dataset.txt = prev;
      pv.innerHTML = '<i class="fas fa-hourglass-half"></i> ' + escapeHtml(prev);
    }
    const pct = this._dayProgress(AppState.timings);
    const fill = document.getElementById('hsx-fill');
    if (fill) fill.style.width = pct.toFixed(2) + '%';
    const ball = document.getElementById('hsx-ball');
    if (ball) {
      try { ball.style.setProperty('inset-inline-start', pct.toFixed(2) + '%'); }
      catch (e) { ball.style.left = pct.toFixed(2) + '%'; }
    }
    const hero = document.getElementById('home-hero');
    if (hero) {
      const k = this._skyKey(AppState.timings);
      ['morning', 'noon', 'dusk', 'night'].forEach(x => hero.classList.toggle('hsx-' + x, x === k));
    }
  },

  // ============ v103: تغيير اللغة/المظهر فورًا من الرأس (بلا صفحة الإعدادات) ============
  _popEl: null,

  quickMenu(kind, ev) {
    try { if (ev && ev.stopPropagation) ev.stopPropagation(); } catch (e) {}
    this._closePop();
    const anchorEl = (ev && (ev.currentTarget || ev.target)) ? (ev.currentTarget || ev.target).closest('.hsx-ibtn') : null;
    const rect = anchorEl ? anchorEl.getBoundingClientRect() : { left: 20, right: 60, bottom: 80, top: 40 };
    const loc = (typeof currentLocale !== 'undefined') ? currentLocale : 'es';
    const LANG = [
      { id: 'ar', label: 'العربية', sub: 'AR' },
      { id: 'en', label: 'English', sub: 'EN' },
      { id: 'es', label: 'Español', sub: 'ES' },
    ];
    const THEMES = [
      { id: 'light', icon: 'fa-sun', label: { ar: 'فاتح', es: 'Claro', en: 'Light' }[loc] },
      { id: 'dark', icon: 'fa-moon', label: { ar: 'داكن', es: 'Oscuro', en: 'Dark' }[loc] },
      { id: 'emerald', icon: 'fa-mosque', label: { ar: 'زمردي', es: 'Esmeralda', en: 'Emerald' }[loc] },
      { id: 'maroon', icon: 'fa-crown', label: { ar: 'عنابي', es: 'Granate', en: 'Maroon' }[loc] },
      { id: 'brown', icon: 'fa-mug-hot', label: { ar: 'بنّي', es: 'Marrón', en: 'Brown' }[loc] },
      { id: 'auto', icon: 'fa-arrows-rotate', label: { ar: 'تلقائي', es: 'Automático', en: 'Auto' }[loc] },
    ];
    const cur = kind === 'lang' ? (AppState.settings.locale || 'ar') : (AppState.settings.theme || 'light');
    const items = (kind === 'lang' ? LANG : THEMES).map(it => {
      const on = it.id === cur ? ' on' : '';
      const ic = it.icon ? `<i class="fas ${it.icon}"></i>` : `<span class="hsx-pop-code">${it.sub}</span>`;
      const act = kind === 'lang' ? `HomePage.applyLang('${it.id}')` : `HomePage.applyTheme('${it.id}')`;
      return `<button class="hsx-pop-i${on}" onclick="${act}">${ic}<span>${escapeHtml(it.label)}</span>${on ? '<i class="fas fa-check hsx-pop-ok"></i>' : ''}</button>`;
    }).join('');
    const pop = document.createElement('div');
    pop.className = 'hsx-pop';
    pop.innerHTML = `<div class="hsx-pop-t">${kind === 'lang' ? escapeHtml({ ar: 'اللغة', es: 'Idioma', en: 'Language' }[loc]) : escapeHtml({ ar: 'المظهر', es: 'Tema', en: 'Theme' }[loc])}</div>${items}`;
    document.body.appendChild(pop);
    const w = pop.offsetWidth || 190, h = pop.offsetHeight || 200;
    let left = Math.min(Math.max(8, rect.left), window.innerWidth - w - 8);
    if (document.documentElement.dir === 'rtl') left = Math.min(Math.max(8, rect.left), window.innerWidth - w - 8);
    let top = rect.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, rect.top - h - 8);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    this._popEl = pop;
    this._popClose = (e) => { if (!pop.contains(e.target)) this._closePop(); };
    setTimeout(() => {
      document.addEventListener('pointerdown', this._popClose, true);
      window.addEventListener('scroll', this._popClose, true);
    }, 30);
  },

  _closePop() {
    try {
      if (this._popClose) {
        document.removeEventListener('pointerdown', this._popClose, true);
        window.removeEventListener('scroll', this._popClose, true);
      }
    } catch (e) {}
    this._popClose = null;
    if (this._popEl && this._popEl.parentNode) this._popEl.parentNode.removeChild(this._popEl);
    this._popEl = null;
  },

  applyLang(id) {
    try {
      if (!['ar', 'es', 'en'].includes(id)) return;
      AppState.settings.locale = id;
      if (typeof API !== 'undefined' && API.resolveTranslationForLocale) {
        AppState.settings.translation = API.resolveTranslationForLocale(AppState.settings.translation, id);
      }
      Storage.saveSettings();
      setLocale(id);
      try {
        const rs = Storage.get('reader_settings');
        if (rs) {
          const auto = { ar: 'local.ar', en: 'local.en', es: 'local.garcia' }[id] || 'local.garcia';
          if (rs.tafsir === 'local.auto' || (['local.garcia', 'local.es'].includes(rs.tafsir) && id !== 'es')) {
            rs.tafsir = auto;
            Storage.set('reader_settings', rs);
          }
        }
      } catch (e) {}
      this._closePop();
      Router.go('home', {}, { force: true });
    } catch (e) { console.warn('applyLang', e); }
  },

  applyTheme(id) {
    try {
      AppState.settings.theme = id;
      Storage.saveSettings();
      applyTheme();
      this._closePop();
      // إعادة رسم الرأس بالخلفية/الألوان الجديدة فورًا
      Router.go('home', {}, { force: true });
    } catch (e) { console.warn('applyTheme', e); }
  },

  // ---------- شريط القبلة ----------
  _qBearing: 0,
  _qHeading: null,
  _qBind: false,

  _qStripHtml(bearing) {
    const PX = 2.2;
    const loc = (typeof currentLocale !== 'undefined') ? currentLocale : 'es';
    const CARD = {
      ar: { n: 'ش', e: 'ق', s: 'ج', w: 'غ' },
      es: { n: 'N', e: 'E', s: 'S', w: 'O' },
      en: { n: 'N', e: 'E', s: 'S', w: 'W' },
    }[loc] || { n: 'N', e: 'E', s: 'S', w: 'W' };
    let out = '';
    for (const copy of [-1, 0, 1]) {
      const base = copy * 360;
      for (let d = 0; d < 360; d += 15) {
        const x = (base + d + 540) * PX;
        const major = (d % 90 === 0);
        out += '<span class="hsx-qtick' + (major ? ' major' : '') + '" style="left:' + x.toFixed(1) + 'px"></span>';
        if (major) {
          const k = { 0: 'n', 90: 'e', 180: 's', 270: 'w' }[d];
          out += '<span class="hsx-qcard" style="left:' + x.toFixed(1) + 'px">' + CARD[k] + '</span>';
        }
      }
      const kx = (base + bearing + 540) * PX;
      out += '<span class="hsx-kaaba" style="left:' + kx.toFixed(1) + 'px"><i class="fas fa-kaaba"></i></span>';
    }
    return out;
  },

  _qSlide(heading) {
    const strip = document.getElementById('hsx-q-strip');
    if (!strip) return;
    const PX = 2.2;
    const W = (strip.parentElement && strip.parentElement.clientWidth) || 320;
    const tx = (W / 2) - ((heading + 540) * PX);
    strip.style.transform = 'translateX(' + tx.toFixed(1) + 'px)';
  },

  _qiblaStart(loc) {
    if (typeof Qibla === 'undefined') return;
    this._qLoc = loc;
    this._qBearing = Qibla.calculateBearing(loc.latitude, loc.longitude);
    const deg = document.getElementById('hsx-q-deg');
    if (deg) deg.textContent = Math.round(this._qBearing) + '°';
    const strip = document.getElementById('hsx-q-strip');
    if (strip) strip.innerHTML = this._qStripHtml(this._qBearing);
    this._qSlide(this._qHeading == null ? 0 : this._qHeading);
    // iOS يحتاج إذنًا من لمسة المستخدم — لا نطلبها تلقائيًا
    const needsGesture = typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function';
    if (!needsGesture) this._qBindSensors();
  },

  _qBindSensors() {
    if (this._qBind) return;
    this._qAbs = (e) => this._qOnOrient(e, true);
    this._qRel = (e) => this._qOnOrient(e, false);
    window.addEventListener('deviceorientationabsolute', this._qAbs, true);
    window.addEventListener('deviceorientation', this._qRel, true);
    this._qBind = true;
  },

  qiblaPermit() {
    const self = this;
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(r => {
        if (r === 'granted') self._qBindSensors();
      }).catch(() => {});
    } else {
      this._qBindSensors();
    }
  },

  _qOnOrient(e, absolute) {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading) && e.webkitCompassHeading >= 0) {
      h = e.webkitCompassHeading;
    } else if (typeof e.alpha === 'number') {
      if (absolute || e.absolute === true) { h = 360 - e.alpha; this._qHasAbs = true; }
      else if (!this._qHasAbs) h = 360 - e.alpha;
    }
    if (h === null) return;
    h = ((h % 360) + 360) % 360;
    if (this._qHeading == null) this._qHeading = h;
    else this._qHeading = (this._qHeading + 0.28 * (((h - this._qHeading + 540) % 360) - 180) + 360) % 360;
    if (this._qRaf) return;
    const self = this;
    this._qRaf = requestAnimationFrame(() => {
      self._qRaf = null;
      self._qSlide(self._qHeading);
      self._qAlignCheck();
    });
  },

  _qAlignCheck() {
    const card = document.getElementById('hsx-qibla');
    const hint = document.getElementById('hsx-q-hint');
    if (!card || this._qHeading == null) return;
    const diff = ((this._qBearing - this._qHeading) % 360 + 360) % 360;
    const ok = diff <= 8 || diff >= 352;
    if (card.classList.contains('aligned') !== ok) card.classList.toggle('aligned', ok);
    if (hint && this._qHintTxt === undefined) this._qHintTxt = hint.textContent;
    if (hint) {
      const aligned = (typeof currentLocale !== 'undefined' && currentLocale === 'ar')
        ? 'أنت متجه نحو القبلة'
        : ((typeof currentLocale !== 'undefined' && currentLocale === 'en') ? 'You are facing the qibla' : 'Estás orientado a la qibla');
      hint.textContent = ok ? aligned : (this._qHintTxt || hint.textContent);
    }
  },

  _qiblaStop() {
    try {
      if (this._qAbs) window.removeEventListener('deviceorientationabsolute', this._qAbs, true);
      if (this._qRel) window.removeEventListener('deviceorientation', this._qRel, true);
    } catch (e) {}
    if (this._qRaf) { cancelAnimationFrame(this._qRaf); this._qRaf = null; }
    this._qAbs = null; this._qRel = null; this._qBind = false; this._qHeading = null; this._qHasAbs = false;
  },

  cleanup() {
    this._unbindShrink();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this._ramadanTarget = null; // v60
    try { this._qiblaStop(); } catch (e) {} // v102
    try { this._closePop(); } catch (e) {} // v103
  },
};
