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
      const loc = AppState.location || await LocationService.getCurrent();
      if (isStale()) return;
      AppState.location = loc;

      const [timings, hijri] = await Promise.all([
        API.getPrayerTimes(loc.latitude, loc.longitude, new Date(), AppState.settings.calculationMethod),
        API.gregorianToHijri(),
      ]);
      if (isStale()) return;

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
      const virtue = hijri ? getDailyVirtue(
        parseInt(hijri.month?.number, 10),
        parseInt(hijri.day, 10),
        new Date().getDay()
      ) : null;

      this.renderContent(container, loc, timings.timings, hijri, verse, dua, virtue);
      this.startCountdown();
    } catch (e) {
      console.warn('Home error:', e);
      if (isStale()) return;
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

  renderContent(container, loc, timings, hijri, verse, dua, virtue) {
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
            <div class="next-prayer-name">${t('prayers.' + nextPrayer.name)}</div>
            <div class="next-prayer-countdown" id="countdown">${formatCountdown(nextPrayer.diffMs)}</div>
            <div class="next-prayer-time">${formatTime12h(nextPrayer.time)}</div>
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

      <div style="padding: var(--sp-md);">
        <!-- Oraciones del día + ubicación y fechas (hijri / gregoriana) -->
        <div class="prayers-header">
          <h2 class="section-title">${t('todayPrayers')}
            <span class="prayer-checkin-progress" title="${t('prayerCheckinTitle')}">${doneCount}/${totalCount} ✔</span>
          </h2>
          <div class="prayers-location"><i class="fas fa-location-dot"></i> ${escapeHtml([loc.city, loc.country].filter(Boolean).join(', '))}</div>
          <div class="prayers-dates">
            ${hijri ? `<span class="prayers-date hijri" dir="${currentLocale === 'ar' ? 'rtl' : 'ltr'}"><i class="fas fa-moon"></i> <b>${t('dateHijriLabel')}:</b> ${hijri.day} ${currentLocale === 'ar' ? (hijri.month?.ar || hijri.month?.en) : (hijri.month?.en || hijri.month?.ar)} ${hijri.year} هـ</span>` : ''}
            <span class="prayers-date greg"><i class="fas fa-calendar-day"></i> <b>${t('dateGregorianLabel')}:</b> ${new Date().toLocaleDateString(currentLocale === 'ar' ? 'ar-EG' : currentLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
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
                <div class="prayer-arabic">${this.prayerArabic(p.name)}</div>
              </div>
              <div class="prayer-time-block">
                <div class="prayer-time">${formatTime12h(p.time)}</div>
              </div>
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
          <div class="dua-title">${dua.title}</div>
          <div class="dua-arabic">${dua.arabic}</div>
          <div class="dua-transliteration">${dua.transliteration}</div>
          <div class="dua-translation">"${dua.translation}"</div>
          <div class="dua-source">— ${dua.source}</div>
          <button class="share-card-btn" onclick="ShareCard.open('dua')">
            <i class="fas fa-share-nodes"></i> ${t('shareCardBtn')}
          </button>
        </div>

        <!-- Virtud del día -->
        ${virtue ? `
          <h2 class="section-title"><i class="fas fa-sparkles"></i> ${virtue.title}</h2>
          <div class="card virtue-card">
            <div class="virtue-text">${virtue.verse}</div>
            <div class="virtue-source">— ${virtue.source}</div>
          </div>
        ` : ''}

      </div>
    `;
  },

  // v26: marcar/desmarcar una oración como realizada (check-in diario).
  // El estado se guarda por fecha: mañana las casillas vuelven a estar vacías.
  // v35: ¿ya pasó la hora del adhan de esta oración hoy?
  // Sunrise no está en la lista de check-in; aquí solo llegan las 5 oraciones.
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
      const el = document.getElementById('countdown');
      if (!el || !AppState.timings) return;
      const np = getNextPrayer(AppState.timings);
      if (np) el.textContent = formatCountdown(np.diffMs);
    }, 1000);
  },

  cleanup() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  },
};
