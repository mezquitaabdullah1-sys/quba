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

    container.innerHTML = `
      <!-- v95: الرأس كتلة واحدة ثابتة، ومحتواها في عمود وسط الشاشة -->
      <div class="home-header home-hero">
        <div class="hh-inner">
          <div class="hh-top">
            <div class="hh-title">
              <div class="home-greeting">${getGreetingByHour()}</div>
              <div class="hh-meta">
                ${hLine ? `<span class="hh-date"><i class="fas fa-moon"></i> ${hLine}</span><span class="hh-sep">/</span>` : ''}
                <span class="hh-date"><i class="fas fa-calendar-day"></i> ${gLine}</span>
              </div>
            </div>
            <button class="home-profile-btn" onclick="Router.go('profile')" aria-label="Profile">
              <i class="fas fa-user-circle"></i>
            </button>
          </div>

          ${nextPrayer ? `
            <div class="hh-next">
              <span class="hh-next-label">${t('nextPrayer')}</span>
              <span class="hh-next-name" id="next-prayer-name">${t('prayers.' + nextPrayer.name)}</span>
              <span class="hh-next-cd" id="countdown">${formatCountdown(nextPrayer.diffMs)}</span>
              <span class="hh-next-time" id="next-prayer-time">${formatTime12h(nextPrayer.time)}</span>
              ${isEstimated ? `<span class="estimated-badge"><i class="fas fa-wifi-slash"></i> ${t('estimatedTimes')}</span>` : ''}
            </div>
          ` : ''}

          <!-- v95: شريط الأيقونات + سهمان صغيران يدلّان على وجود مزيد من الأيقونات -->
          <div class="hh-quick">
            <button class="hh-arrow hh-arrow-start" onclick="HomePage.qScroll(-1)" aria-label="${escapeAttr(t('seeMore') || 'More')}" tabindex="-1"><i class="fas ${chevStart}"></i></button>
            <div class="home-quick-grid" id="home-quick-grid" onscroll="HomePage._syncQArrows()">
              <button class="quick-access-btn" onclick="Router.go('quran')" aria-label="${escapeAttr(t('tabQuran'))}" title="${escapeAttr(t('tabQuran'))}">
                <span class="quick-access-icon"><img src="assets/quick/quran.png" alt="" loading="lazy" draggable="false"></span>
                <span class="quick-access-label">${t('quickQuran')}</span>
              </button>
              <button class="quick-access-btn" onclick="Router.go('prayer',{tab:'qibla'})" aria-label="${escapeAttr(t('qibla'))}" title="${escapeAttr(t('qibla'))}">
                <span class="quick-access-icon"><img src="assets/quick/qibla.png" alt="" loading="lazy" draggable="false"></span>
                <span class="quick-access-label">${t('quickQibla')}</span>
              </button>
              <button class="quick-access-btn" onclick="Router.go('calendar')" aria-label="${escapeAttr(t('hijriCalendar'))}" title="${escapeAttr(t('hijriCalendar'))}">
                <span class="quick-access-icon"><img src="assets/quick/calendar.png" alt="" loading="lazy" draggable="false"></span>
                <span class="quick-access-label">${t('quickCalendar')}</span>
              </button>
              <button class="quick-access-btn" onclick="Router.go('radio')" aria-label="${escapeAttr(RadioData.L('radioTitle'))}" title="${escapeAttr(RadioData.L('radioTitle'))}">
                <span class="quick-access-icon"><img src="assets/quick/radio.png" alt="" loading="lazy" draggable="false"></span>
                <span class="quick-access-label">${t('quickRadio')}</span>
              </button>
              <button class="quick-access-btn" onclick="Router.go('wisdom/library')" aria-label="${escapeAttr(LibraryData.L('libTitle'))}" title="${escapeAttr(LibraryData.L('libTitle'))}">
                <span class="quick-access-icon"><img src="assets/quick/library.png" alt="" loading="lazy" draggable="false"></span>
                <span class="quick-access-label">${t('quickLibrary')}</span>
              </button>
              <button class="quick-access-btn" onclick="Router.go('wisdom/tasbih')" aria-label="${escapeAttr(t('tasbih'))}" title="${escapeAttr(t('tasbih'))}">
                <span class="quick-access-icon"><img src="assets/quick/misbaha.png" alt="" loading="lazy" draggable="false"></span>
                <span class="quick-access-label">${t('quickTasbih')}</span>
              </button>
              <button class="quick-access-btn" onclick="Router.go('videos')" aria-label="${escapeAttr(ClipsData.L('clipsTitle'))}" title="${escapeAttr(ClipsData.L('clipsTitle'))}">
                <span class="quick-access-icon"><img src="assets/quick/clips.png" alt="" loading="lazy" draggable="false"></span>
                <span class="quick-access-label">${t('quickClips')}</span>
              </button>
              <button class="quick-access-btn" onclick="Router.go('wisdom/duas')" aria-label="${escapeAttr(t('quickDuas'))}" title="${escapeAttr(t('quickDuas'))}">
                <span class="quick-access-icon"><img src="assets/quick/duas.png" alt="" loading="lazy" draggable="false"></span>
                <span class="quick-access-label">${t('quickDuas')}</span>
              </button>
              <button class="quick-access-btn" onclick="Router.go('wisdom/courses')" aria-label="${escapeAttr(t('coursesTitle'))}" title="${escapeAttr(t('coursesTitle'))}">
                <span class="quick-access-icon"><img src="assets/quick/courses.png" alt="" loading="lazy" draggable="false"></span>
                <span class="quick-access-label">${t('quickCourses')}</span>
              </button>
            </div>
            <button class="hh-arrow hh-arrow-end" onclick="HomePage.qScroll(1)" aria-label="${escapeAttr(t('seeMore') || 'More')}" tabindex="-1"><i class="fas ${chev}"></i></button>
          </div>
        </div>
      </div>

      <div class="hm-wrap">
        <!-- بطاقة الصلوات: الصلوات الخمس كاملة + أيقونة لكل صلاة + زر المدينة + زر جدول الصلوات -->
        <section class="hm-card hm-prayers">
          <div class="hm-card-head">
            <h2 class="hm-title"><i class="fas fa-mosque"></i> ${t('todayPrayers')}
              <span class="prayer-checkin-progress">${doneCount}/${totalCount} ✔</span>
            </h2>
            <div class="hm-head-actions">
              <button class="prayers-location" onclick="ProfilePage.pickCity()" title="${escapeAttr(t('changeCity') || '')}" aria-label="${escapeAttr(t('changeCity') || '')}">
                <i class="fas fa-location-dot"></i>
                <span>${escapeHtml(cityLine)}</span>
                <i class="fas fa-pen prayers-location-edit"></i>
              </button>
              <button class="hm-mini-btn" onclick="Router.go('prayer')">
                <i class="fas fa-table-columns"></i> ${t('prayerTable') || ''}
              </button>
            </div>
          </div>

          <div class="hm-prayer-grid" id="hm-prayer-strip">
            ${six.map(p => {
              const canCheck = (typeof PrayerTracker !== 'undefined') && PrayerTracker.PRAYERS.includes(p.name);
              const isDone = canCheck && PrayerTracker.isDone(p.name);
              const passed = canCheck && this.isAdhanPassed(p.name);
              const isNext = nextPrayer && nextPrayer.name === p.name;
              return `
              <div class="prayer-row hm-prayer-cell ${isNext ? 'next' : ''} ${isDone ? 'prayer-done' : ''}" data-prayer="${p.name}">
                <span class="hm-pc-ic">${this._prayerIcon(p.name, 20)}</span>
                <span class="hm-chip-nm">${t('prayers.' + p.name)}</span>
                <span class="prayer-time-block">
                  <span class="prayer-time">${formatTime12h(p.time)}</span>
                </span>
                ${isNext ? `<span class="prayer-remaining" data-prayer-remaining="${p.name}"><span class="prayer-remaining-text">${formatCountdown(nextPrayer.diffMs)}</span></span>` : ''}
                <span class="hm-chip-tools">
                  ${canCheck ? `
                    <button class="hm-check ${isDone ? 'checked' : ''} ${passed ? '' : 'locked'}"
                            aria-pressed="${isDone}"
                            title="${escapeAttr(passed ? (t('prayerCheckinTitle') || '') : (t('prayerNotYetToast') || ''))}"
                            onclick="HomePage.toggleCheckin('${p.name}', this)">
                      <i class="fas ${passed ? 'fa-check' : 'fa-lock'}"></i>
                    </button>`
                  : '<span class="hm-check-spacer" aria-hidden="true"></span>'}
                  ${this._prayerBellHtml(p.name) || '<span class="hm-check-spacer" aria-hidden="true"></span>'}
                </span>
              </div>`;
            }).join('')}
          </div>

${typeof DualTiming !== 'undefined' ? `<div class="hm-dual">${DualTiming.render()}</div>` : ''}
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
          ${this._ramadanCountdownHtml()}
          <div class="hm-occ-grid">
            ${this._nextFastHtml()}
            ${this._nextEventHtml()}
          </div>
          ${virtue ? this._virtueCardHtml(virtue) : ''}
        </section>
      </div>
    `;

    // v95: ضبط أسهم شريط الأيقونات بعد الرسم — السهم يظهر فقط عند وجود مزيد
    setTimeout(() => { try { this._syncQArrows(); } catch (e) {} }, 80);
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
      const tr = verse['translation_' + loc0] || verse.translation_es || '';
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
      const tr = dua['translation_' + loc0] || dua.translation_es || dua.translation || '';
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
      const tr = hadith['translation_' + loc0] || hadith.translation_es || '';
      const src = hadith['source_' + loc0] || hadith.source_es || '';
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

  cleanup() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this._ramadanTarget = null; // v60
  },
};
