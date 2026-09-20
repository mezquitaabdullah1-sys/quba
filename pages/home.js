// 🏠 Pantalla de Inicio
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

    container.innerHTML = `
      <div class="home-header">
        <div class="home-top">
          <div>
            <div class="home-greeting">${getGreetingByHour()}</div>
            <div class="home-location"><i class="fas fa-location-dot"></i> ${escapeHtml(loc.city || '')}${loc.country ? ', ' + escapeHtml(loc.country) : ''}</div>
            ${hijri ? `<div class="home-hijri">${hijri.day} ${hijri.month?.en} ${hijri.year} هـ</div>` : ''}
          </div>
          <button class="home-profile-btn" onclick="Router.go('profile')">
            <i class="fas fa-user-circle"></i>
          </button>
        </div>

        ${nextPrayer ? `
          <div class="next-prayer-card">
            <div class="next-prayer-label">${t('nextPrayer')}</div>
            <div class="next-prayer-name" id="next-prayer-name">${t('prayers.' + nextPrayer.name)}</div>
            <div class="next-prayer-countdown" id="countdown">${formatCountdown(nextPrayer.diffMs)}</div>
            <div class="next-prayer-time" id="next-prayer-time">${formatTime12h(nextPrayer.time)}</div>
            ${isEstimated ? `<div class="estimated-badge"><i class="fas fa-wifi-slash"></i> ${t('estimatedTimes')}</div>` : ''}
          </div>
        ` : ''}

        <!-- v27/v34: Accesos rápidos con iconos realistas a mitad de tamaño
             (Corán, Du'as, Tasbih, Qibla con imagen propia, Cursos) -->
        <div class="home-quick-grid">
        <button class="quick-access-btn" onclick="Router.go('quran')" aria-label="${t('tabQuran')}">
          <span class="quick-access-icon"><img src="assets/quick/quran.png" alt="" loading="lazy" draggable="false"></span>
          <span class="quick-access-label">${t('tabQuran')}</span>
        </button>
        <button class="quick-access-btn" onclick="Router.go('wisdom/duas')" aria-label="${t('quickDuas')}">
          <span class="quick-access-icon"><img src="assets/quick/duas.png" alt="" loading="lazy" draggable="false"></span>
          <span class="quick-access-label">${t('quickDuas')}</span>
        </button>
        <button class="quick-access-btn" onclick="Router.go('wisdom/tasbih')" aria-label="${t('tasbih')}">
          <span class="quick-access-icon"><img src="assets/quick/misbaha.png" alt="" loading="lazy" draggable="false"></span>
          <span class="quick-access-label">${t('tasbih')}</span>
        </button>
        <button class="quick-access-btn" onclick="Router.go('prayer',{tab:'qibla'})" aria-label="${t('qibla')}">
          <span class="quick-access-icon"><img src="assets/quick/qibla.png" alt="" loading="lazy" draggable="false"></span>
          <span class="quick-access-label">${t('qibla')}</span>
        </button>
        <button class="quick-access-btn" onclick="Router.go('wisdom/courses')" aria-label="${t('coursesTitle')}">
          <span class="quick-access-icon"><img src="assets/quick/courses.png" alt="" loading="lazy" draggable="false"></span>
          <span class="quick-access-label">${t('coursesTitle')}</span>
        </button>
        </div>
      </div>

      <!-- Two prominent CTA buttons: Hijri Calendar + Prayer Table -->
      <div class="home-cta-row">
        <button class="hijri-cta-btn" onclick="Router.go('calendar')">
          <div class="hijri-cta-icon"><i class="fas fa-moon"></i></div>
          <div class="hijri-cta-content">
            <div class="hijri-cta-title">${t('hijriCalendar')}</div>
            <div class="hijri-cta-date">${hijri ? `${hijri.day} ${hijri.month?.ar || hijri.month?.en} ${hijri.year} هـ` : ''}</div>
          </div>
        </button>

        <button class="prayer-table-cta-btn" onclick="Router.go('prayer',{tab:'monthly'})">
          <div class="hijri-cta-icon"><i class="fas fa-chart-column"></i></div>
          <div class="hijri-cta-content">
            <div class="hijri-cta-title">${t('prayerTable') || 'Tabla de oraciones'}</div>
            <div class="hijri-cta-date">${t('viewMonth') || 'Vista mensual'}</div>
          </div>
        </button>
      </div>

      <!-- v61: شريط «أكمل القراءة» الرفيع — أسفل زرّي التقويم الهجري والجدول الشهري مباشرة -->
      ${this._resumeStripHtml()}

      <div style="padding: var(--sp-md);">
        <!-- Oraciones del día + ubicación y fechas (hijri / gregoriana) -->
        <div class="prayers-header">
          <h2 class="section-title">${t('todayPrayers')}
            <span class="prayer-checkin-progress" title="${t('prayerCheckinTitle')}">${doneCount}/${totalCount} ✔</span>
          </h2>
          <button class="prayers-location" onclick="ProfilePage.pickCity()" title="${escapeAttr(t('changeCity') || '')}" aria-label="${escapeAttr(t('changeCity') || 'Cambiar ciudad')}">
            <i class="fas fa-location-dot"></i>
            <span>${escapeHtml([loc.city, loc.country].filter(Boolean).join(', ') || (t('chooseCityOrLocation') || 'Elige una ciudad'))}</span>
            <i class="fas fa-pen prayers-location-edit"></i>
          </button>
          ${hijri ? (() => {
            const now = new Date();
            const g = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
            // v40: una sola línea, solo números, ambos separados por «/»
            return `<div class="prayers-dates"><span class="prayers-date compact"><i class="fas fa-moon"></i> ${hijri.day}/${hijri.month?.number || ''}/${hijri.year} <span class="prayers-date-sep">/</span> <i class="fas fa-calendar-day"></i> ${g}</span></div>`;
          })() : ''}
        </div>
        <div class="card prayers-card">
          ${dailyPrayers.map(p => {
            const canCheck = (typeof PrayerTracker !== 'undefined') && PrayerTracker.PRAYERS.includes(p.name);
            const isDone = canCheck && PrayerTracker.isDone(p.name);
            // v35: la casilla solo se puede marcar a partir de la hora del adhan;
            // antes aparece bloqueada (gris) y muestra un aviso al tocarla.
            const passed = canCheck && this.isAdhanPassed(p.name);
            return `
            <div class="prayer-row ${nextPrayer?.name === p.name ? 'next' : ''} ${isDone ? 'prayer-done' : ''}">
              <span class="prayer-emoji">${getPrayerEmoji(p.name)}</span>
              <div class="prayer-name-block">
                <div class="prayer-name">${t('prayers.' + p.name)}</div>
              </div>
              <div class="prayer-time-block">
                <div class="prayer-time">${formatTime12h(p.time)}</div>
                ${nextPrayer?.name === p.name ? `<div class="prayer-remaining" data-prayer-remaining="${p.name}"><i class="fas fa-hourglass-half"></i> <span class="prayer-remaining-text">${formatCountdown(nextPrayer.diffMs)}</span></div>` : ''}
              </div>
              ${this._prayerBellHtml(p.name) || '<span class="prayer-bell-spacer" aria-hidden="true"></span>'}
              ${canCheck ? `
                <button class="prayer-check ${isDone ? 'checked' : ''} ${passed ? '' : 'locked'}"
                        aria-label="${t('prayerCheckinTitle')}"
                        aria-pressed="${isDone}"
                        title="${passed ? t('prayerCheckinTitle') : (t('prayerNotYetToast') || '')}"
                        onclick="HomePage.toggleCheckin('${p.name}', this)">
                  <i class="fas ${passed ? 'fa-check' : 'fa-lock'}"></i>
                </button>`
                // v35: Shuruk no tiene casilla — espaciador del mismo ancho
                // para que su hora quede alineada con las demás oraciones.
                : '<span class="prayer-check-spacer" aria-hidden="true"></span>'}
            </div>`;
          }).join('')}
        </div>

        <!-- v34: franja de horario secundario (otra ciudad) — debajo de la tabla principal -->
        ${typeof DualTiming !== 'undefined' ? DualTiming.render() : ''}

        <!-- Famous Verse of the Day with Wisdom -->
        ${verse ? `
          <h2 class="section-title"><i class="fas fa-book-open-reader"></i> ${t('verseOfDay')}</h2>
          <div class="card-gradient">
            <div class="verse-arabic">${escapeHtml(verse.arabic)}</div>
            <div class="verse-translit">${escapeHtml(verse.transliteration)}</div>
            <div class="verse-divider"></div>
            <div class="verse-translation">"${escapeHtml(verse['translation_' + (AppState.settings.locale || 'es')] || verse.translation_es)}"</div>
            <div class="verse-source">— ${escapeHtml(verse.surahName)} ${verse.surahNumber}:${verse.ayahNumber}</div>
            <div class="verse-wisdom">
              <i class="fas fa-lightbulb"></i>
              <span>${escapeHtml(verse['wisdom_' + (AppState.settings.locale || 'es')] || verse.wisdom_es)}</span>
            </div>
            <button class="share-card-btn" onclick="ShareCard.open('verse')">
              <i class="fas fa-share-nodes"></i> ${t('shareCardBtn')}
            </button>
          </div>
        ` : ''}

        <!-- Du'a del día -->
        <h2 class="section-title"><i class="fas fa-hands-praying"></i> ${t('duaOfDay')}</h2>
        <div class="card dua-day-card">
          <div class="dua-title">${escapeHtml(dua['title_' + (AppState.settings.locale || 'es')] || dua.title)}</div>
          <div class="dua-arabic">${dua.arabic}</div>
          <div class="dua-transliteration">${dua.transliteration}</div>
          <div class="dua-translation">"${escapeHtml(dua['translation_' + (AppState.settings.locale || 'es')] || dua.translation_es || dua.translation)}"</div>
          <div class="dua-source">— ${dua.source}</div>
          <button class="share-card-btn" onclick="ShareCard.open('dua')">
            <i class="fas fa-share-nodes"></i> ${t('shareCardBtn')}
          </button>
        </div>

        <!-- v57: الراديو الإسلامي — أسفل دعاء اليوم بألوان التطبيق -->
        <h2 class="section-title"><i class="fas fa-radio"></i> ${RadioData.L('radioTitle')}</h2>
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

        <!-- v57: مقتطفات دينية — تحت الراديو مباشرة، بطاقتان أسبوعيتان + زر «الكل» -->
        <div class="clips-home-head">
          <h2 class="section-title"><i class="fas fa-circle-play"></i> ${ClipsData.L('clipsTitle')}</h2>
          <button class="clips-home-all" onclick="Router.go('videos')">${ClipsData.L('clipsAll')} <i class="fas fa-chevron-${document.documentElement.dir === 'rtl' ? 'left' : 'right'}"></i></button>
        </div>
        <div class="clips-home-row">
          ${ClipsData.VIDEOS.slice(0, 10).map(v => `
            <button class="clip-home-card" onclick="Router.go('videos',{play:'${v.id}'})" aria-label="${escapeAttr(v.title)}">
              <span class="clip-home-thumb">
                <img src="${ClipsData.thumb(v.id)}" alt="" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/mqdefault.jpg';">
                <span class="clip-play"><i class="fas fa-play"></i></span>
              </span>
              <span class="clip-home-title">${escapeHtml(v.title)}</span>
              <span class="clip-home-watch"><i class="fas fa-circle-play"></i> ${ClipsData.L('clipsWatch')}</span>
            </button>
          `).join('')}
        </div>

        <!-- v61: حديث اليوم — أسفل «مقتطفات دينية» مباشرة، على نمط آية اليوم ودعاء اليوم -->
        ${hadith ? (() => {
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
        })() : ''}

        <!-- Virtud del día -->
        ${virtue ? `
          <h2 class="section-title"><i class="fas fa-sparkles"></i> ${virtue.title}</h2>
          <div class="card virtue-card">
            <div class="virtue-text">${virtue.verse}</div>
            <div class="virtue-source">— ${virtue.source}</div>
          </div>
        ` : ''}

        <!-- v60: العد التنازلي لرمضان — آخر الصفحة الرئيسية -->
        ${this._ramadanCountdownHtml()}

        <!-- v61: المناسبة القادمة ويوم الصيام القادم — بطاقتان رفيعتان آخر الصفحة -->
        ${this._nextEventHtml()}
        ${this._nextFastHtml()}

      </div>
    `;
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
    if (typeof HijriCalc === 'undefined' || !HijriCalc.fromDate) return null;
    try {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      const h0 = HijriCalc.fromDate(d);
      // Si ya estamos DENTRO de Ramadán, cuenta atrás hacia el siguiente año
      if (h0 && h0.month === 9) d.setDate(d.getDate() + Math.max(1, 30 - (h0.day || 1) + 1));
      for (let guard = 0; guard < 420; guard++) {
        const h = HijriCalc.fromDate(d);
        if (h && h.month === 9 && h.day === 1) return new Date(d);
        d.setDate(d.getDate() + 1);
      }
    } catch (e) {}
    return null;
  },

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
      <h2 class="section-title"><i class="fas fa-moon"></i> ${t('ramadanCountdown')}</h2>
      <div class="ramadan-cd-card">
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
      <button class="resume-strip" onclick="Router.go('quran',{surahNumber:${lr.s},ayah:${lr.a}})" aria-label="${escapeAttr(t('resumeReading'))}">
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
  _nextEventHtml() {
    try {
      if (typeof ISLAMIC_HOLIDAYS === 'undefined' || typeof HijriCalc === 'undefined' || !HijriCalc.nextOccurrence) return '';
      let best = null;
      for (const h of ISLAMIC_HOLIDAYS) {
        const oc = HijriCalc.nextOccurrence(h.month, h.day);
        if (oc && (!best || oc.daysLeft < best.daysLeft)) best = { ...oc, h };
      }
      if (!best) return '';
      const loc = (typeof currentLocale !== 'undefined' && ['es','ar','en'].includes(currentLocale)) ? currentLocale : 'es';
      const name = best.h['name_' + loc] || best.h.name_es;
      let gFmt;
      try { gFmt = best.date.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' }); }
      catch (e) { gFmt = best.date.toISOString().slice(0, 10); }
      const daysTxt = best.daysLeft === 0 ? t('todayWord') : (best.daysLeft === 1 ? t('tomorrowWord') : t('daysLeftTxt').replace('{n}', best.daysLeft));
      return `
      <div class="home-mini-card">
        <span class="home-mini-ic ev"><i class="fas fa-star-and-crescent"></i></span>
        <span class="home-mini-body">
          <span class="home-mini-title">${t('nextEventTitle')}</span>
          <span class="home-mini-main">${escapeHtml(name)}</span>
          <span class="home-mini-meta">${best.h.day} ${this._hijriMonthName(best.h.month, loc)} ${best.hijriYear} ${loc === 'ar' ? 'هـ' : 'AH'} · ${escapeHtml(gFmt)} · ${daysTxt}</span>
        </span>
      </div>`;
    } catch (e) { return ''; }
  },

  // ============ v61: يوم الصيام القادم (الاثنين/الخميس · الأيام البيض · عاشوراء وعرفة) ============
  // داخل رمضان لا يُعرض — لرمضان عدّاده الخاص أعلاه.
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
        const loc = (typeof currentLocale !== 'undefined' && ['es','ar','en'].includes(currentLocale)) ? currentLocale : 'es';
        let gFmt;
        try { gFmt = d.toLocaleDateString(loc, { day: 'numeric', month: 'long' }); } catch (e) { gFmt = d.toISOString().slice(0, 10); }
        const wd = (typeof getWeekdayName === 'function') ? getWeekdayName(d.getDay(), loc) : '';
        const daysTxt = i === 0 ? t('todayWord') : (i === 1 ? t('tomorrowWord') : t('daysLeftTxt').replace('{n}', i));
        return `
      <div class="home-mini-card">
        <span class="home-mini-ic fast"><i class="fas fa-moon"></i></span>
        <span class="home-mini-body">
          <span class="home-mini-title">${t('nextFastTitle')} — ${t(kind)}</span>
          <span class="home-mini-main">${wd} · ${escapeHtml(gFmt)}</span>
          <span class="home-mini-meta">${h.day} ${this._hijriMonthName(h.month, loc)} ${h.year} ${loc === 'ar' ? 'هـ' : 'AH'} · ${daysTxt}</span>
        </span>
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
    const rows = container.querySelectorAll('.prayer-row');
    const daily = getDailyPrayers(AppState.timings);
    const idx = daily.findIndex(p => p.name === np.name);
    if (idx >= 0 && rows[idx]) {
      rows[idx].classList.add('next');
      const block = rows[idx].querySelector('.prayer-time-block');
      if (block) {
        block.insertAdjacentHTML('beforeend',
          `<div class="prayer-remaining" data-prayer-remaining="${np.name}"><i class="fas fa-hourglass-half"></i> <span class="prayer-remaining-text">${formatCountdown(np.diffMs)}</span></div>`);
      }
    }
  },

  cleanup() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this._ramadanTarget = null; // v60
  },
};
