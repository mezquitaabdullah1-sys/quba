// 🕋 Pantalla de Oración + Qibla
const PrayerPage = {
  activeTab: 'times',
  qiblaBearing: 0,
  deviceHeading: 0,
  orientationHandlerAbs: null,
  orientationHandlerRel: null,
  permissionGranted: false,
  countdownInterval: null, // v36: actualiza el «tiempo restante» en la tabla

  async render(container, params = {}) {
    // v14: honor incoming tab param (e.g. Router.go('prayer',{tab:'monthly'}))
    if (params && params.tab && ['times','monthly','qibla'].includes(params.tab)) {
      this.activeTab = params.tab;
    }

    container.innerHTML = Skeleton.prayer();

    try {
      // v40: SIEMPRE releer la ubicación actual del servicio — antes
      // `AppState.location` cortocircuitaba y la página podía mostrar los
      // horarios de la ciudad anterior tras cambiarla (desincronización con
      // la home y el jadwal mensual).
      const loc = await LocationService.getCurrent();
      AppState.location = loc;

      this.qiblaBearing = Qibla.calculateBearing(loc.latitude, loc.longitude);
      const distance = Qibla.distance(loc.latitude, loc.longitude);

      // v40: sello de coordenadas — los horarios cacheados solo se reutilizan
      // si pertenecen a ESTA ciudad. Si la red falla (o el usuario está sin
      // conexión) se recurre al motor astronómico local (PrayerCalc) en lugar
      // de mostrar el aviso de «error de ubicación».
      const stamp = (tgs) => {
        if (tgs) {
          tgs._lat = loc.latitude;
          tgs._lon = loc.longitude;
          tgs._date = new Date().toDateString();
        }
        return tgs;
      };
      const cacheValid = AppState.timings &&
        AppState.timings._lat === loc.latitude &&
        AppState.timings._lon === loc.longitude &&
        AppState.timings._date === new Date().toDateString();

      let timings;
      try {
        timings = cacheValid ? { timings: AppState.timings } :
          await API.getPrayerTimes(loc.latitude, loc.longitude, new Date(), AppState.settings.calculationMethod);
      } catch (netErr) {
        // شبكة أمان: حساب فلكي محلي عند فشل الشبكة بدل رسالة خطأ الموقع
        if (typeof PrayerCalc !== 'undefined') {
          // v43: نفس مسار API._offlinePrayerTimes — يشمل تعويض فرق توقيت
          // المدينة المختارة يدوياً وختم _cityDeltaMs، بدل حساب خام كان
          // يُظهر «الصلاة القادمة» بتوقيت الجهاز رغم اختلاف توقيت المدينة.
          const base = AppState.settings.calculationMethod || 3;
          const method = (API._effectiveMethod) ? API._effectiveMethod(loc.latitude, loc.longitude, base) : base;
          timings = API._offlinePrayerTimes(loc.latitude, loc.longitude, new Date(), method);
        } else {
          throw netErr;
        }
      }

      const hijri = AppState.hijri ? AppState.hijri : await API.gregorianToHijri();

      AppState.timings = stamp(timings.timings);
      AppState.hijri = hijri;

      // 🔔 Programar las alarmas del día: adhan automático a la hora de cada
      // oración y/o recordatorio 15 min antes (cada uno con su interruptor)
      if (typeof PrayerNotifications !== 'undefined' &&
          (PrayerNotifications.isEnabled() || PrayerNotifications.isReminderEnabled())) {
        PrayerNotifications.scheduleDay(AppState.timings, AppState.settings.locale || 'es');
      }

      // Escapar datos de ubicación (Nominatim)
      if (loc) { loc.city = loc.city && String(loc.city); loc.country = loc.country && String(loc.country); }

      this.renderUI(container, loc, hijri, distance);
    } catch (e) {
      console.warn('Prayer error:', e);
      container.innerHTML = this.permissionPrompt();
    }
  },

  renderUI(container, loc, hijri, distance) {
    container.innerHTML = `
      <div class="page-header">
        <div class="page-title"><i class="fas fa-mosque"></i> ${t('tabPrayer')}</div>
        ${hijri ? `<div class="page-subtitle">${hijri.day} ${hijri.month?.en} ${hijri.year} هـ</div>` : ''}
        <button class="prayers-location" onclick="ProfilePage.pickCity()" title="${escapeAttr(t('changeCity') || '')}" aria-label="${escapeAttr(t('changeCity') || 'Cambiar ciudad')}">
          <i class="fas fa-location-dot"></i>
          <span>${escapeHtml([loc.city, loc.country].filter(Boolean).join(', ') || (t('chooseCityOrLocation') || 'Elige una ciudad'))}</span>
          <i class="fas fa-pen prayers-location-edit"></i>
        </button>

        <div class="inner-tabs">
          <button class="inner-tab ${this.activeTab === 'times' ? 'active' : ''}" onclick="PrayerPage.switchTab('times')">
            ⏰ ${t('todayPrayers')}
          </button>
          <button class="inner-tab ${this.activeTab === 'monthly' ? 'active' : ''}" onclick="PrayerPage.switchTab('monthly')">
            <i class="fas fa-calendar-days"></i> ${t('monthlyTable') || 'Mensual'}
          </button>
          <button class="inner-tab ${this.activeTab === 'qibla' ? 'active' : ''}" onclick="PrayerPage.switchTab('qibla')">
            <i class="fas fa-compass"></i> ${t('qibla')}
          </button>
        </div>

        <!-- v22: shortcut to the Salah course -->
        <button class="btn-primary prayer-course-btn" onclick="(typeof CoursesPage !== 'undefined') ? CoursesPage.openCourse('salah_complete') : Router.go('wisdom/courses')">
          <i class="fas fa-graduation-cap"></i> ${t('prayerCourseBtn') || 'Curso de Oración'}
        </button>
      </div>

      <div id="prayer-tab-content" style="padding: var(--sp-md);">
        ${this.activeTab === 'times' ? this.timesTab() : (this.activeTab === 'monthly' ? this.monthlyTab(loc) : this.qiblaTab(distance))}
      </div>
    `;

    if (this.activeTab === 'qibla') {
      this.initOrientationListener();
    }
    // v36: en la pestaña de horarios, actualizar el «tiempo restante» bajo
    // la próxima oración cada segundo (y re-render al cambiar de oración).
    if (this.activeTab === 'times') this.startCountdown();
  },

  startCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      if (!AppState.timings) return;
      const np = getNextPrayer(AppState.timings);
      if (!np) return;
      const remEl = document.querySelector('#prayer-tab-content .prayer-remaining');
      if (!remEl) return;
      if (remEl.dataset.prayerRemaining === np.name) {
        const txt = remEl.querySelector('.prayer-remaining-text');
        if (txt) txt.textContent = formatCountdown(np.diffMs);
      } else {
        // v40: al cambiar de oración se actualizan SOLO las filas afectadas,
        // sin re-render completo (el re-render disparaba skeleton + red y se
        // percibía como «recarga» constante de la página).
        const root = document.querySelector('#prayer-tab-content');
        if (!root) return;
        root.querySelectorAll('.prayer-row.next').forEach(r => r.classList.remove('next'));
        remEl.remove();
        const rows = root.querySelectorAll('.prayer-row');
        const daily = getDailyPrayers(AppState.timings);
        const idx = daily.findIndex(p => p.name === np.name);
        if (idx >= 0 && rows[idx]) {
          rows[idx].classList.add('next');
          const block = rows[idx].querySelector('.prayer-time-block');
          if (block) {
            block.insertAdjacentHTML('afterbegin',
              `<div class="prayer-remaining" data-prayer-remaining="${np.name}"><i class="fas fa-hourglass-half"></i> <span class="prayer-remaining-text">${formatCountdown(np.diffMs)}</span></div>`);
          }
        }
      }
    }, 1000);
  },

  switchTab(tab) {
    this.cleanup();
    this.activeTab = tab;
    this.render(document.getElementById('main-content'));
  },

  timesTab() {
    const prayers = getDailyPrayers(AppState.timings);
    const next = getNextPrayer(AppState.timings);
    const isEstimated = !!(AppState.timings && AppState.timings._estimated);
    // v26: insignia del ajuste manual de horario (verano/invierno)
    const shiftMode = (AppState.settings && AppState.settings.timeShift) || 'auto';
    const shiftBadge = shiftMode === 'summer'
      ? `<div class="estimated-badge" style="margin: 0 var(--sp-md) var(--sp-sm);"><i class="fas fa-sun"></i> ${t('timeShiftSummerApplied')}</div>`
      : shiftMode === 'winter'
      ? `<div class="estimated-badge" style="margin: 0 var(--sp-md) var(--sp-sm);"><i class="fas fa-snowflake"></i> ${t('timeShiftWinterApplied')}</div>`
      : '';
    return `
      ${isEstimated ? `<div class="estimated-badge" style="margin: 0 var(--sp-md) var(--sp-sm);"><i class="fas fa-wifi-slash"></i> ${t('estimatedTimes')}</div>` : ''}
      ${shiftBadge}
      <div class="card prayers-card">
        ${prayers.map(p => {
          const canCheck = (typeof PrayerTracker !== 'undefined') && PrayerTracker.PRAYERS.includes(p.name);
          const isDone = canCheck && PrayerTracker.isDone(p.name);
          return `
          <div class="prayer-row ${next?.name === p.name ? 'next' : ''} ${isDone ? 'prayer-done' : ''}">
            <span class="prayer-emoji">${getPrayerEmoji(p.name)}</span>
            <div class="prayer-name-block">
              <div class="prayer-name">${t('prayers.' + p.name)}</div>
              <div class="prayer-arabic">${HomePage.prayerArabic(p.name)}</div>
            </div>
            <div class="prayer-time-block">
              <div class="prayer-time">${formatTime12h(p.time)}</div>
              ${next?.name === p.name ? `<div class="prayer-remaining" data-prayer-remaining="${p.name}"><i class="fas fa-hourglass-half"></i> <span class="prayer-remaining-text">${formatCountdown(next.diffMs)}</span></div>` : ''}
              ${p.iqamah ? `<div class="prayer-iqamah"><i class="fas fa-bell"></i> ${t('iqamah') || 'Iqamah'} ${formatTime12h(p.iqamah)} <span class="iqamah-off">+${p.iqamahOffset} ${t('minShort') || 'min'}</span></div>` : ''}
            </div>
            ${(typeof HomePage !== 'undefined' && HomePage._prayerBellHtml) ? HomePage._prayerBellHtml(p.name) : ''}
            ${canCheck ? `
              <button class="prayer-check ${isDone ? 'checked' : ''}"
                      aria-label="${t('prayerCheckinTitle')}"
                      aria-pressed="${isDone}"
                      onclick="HomePage.toggleCheckin('${p.name}', this)">
                <i class="fas fa-check"></i>
              </button>` : '<span class="prayer-check-spacer" aria-hidden="true"></span>'}
          </div>`;
        }).join('')}
        <div style="padding: 8px;">
          <button class="btn-ghost pdf-btn" onclick="PrayerPdf.downloadDaily(this)" aria-label="${t('downloadPdf') || 'PDF'}">
            <span><i class="fas fa-file-pdf"></i> ${t('downloadPdf') || 'Descargar PDF'}</span>
            <i class="fas fa-download"></i>
          </button>
          <button class="btn-ghost pdf-btn" onclick="PrayerPdf.saveDailyImage(this)" aria-label="${t('saveImage') || 'PNG'}">
            <span><i class="fas fa-image"></i> ${t('saveImage') || 'حفظ كصورة'}</span>
            <i class="fas fa-download"></i>
          </button>
          <button class="btn-ghost" onclick="Router.go('calendar')">
            <span><i class="fas fa-calendar"></i> ${t('hijriCalendar')}</span>
            <i class="fas fa-chevron-${currentLocale === 'ar' ? 'left' : 'right'}"></i>
          </button>
        </div>
      </div>
    `;
  },

  qiblaTab(distance) {
    const loc = AppState.location;
    const lang = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    const atMakkah = loc && Qibla.isAtMakkah(loc.latitude, loc.longitude);
    const cardinal = Qibla.cardinalName(this.qiblaBearing, lang);
    const decl = loc ? Qibla.magneticDeclination(loc.latitude, loc.longitude) : 0;
    const trueBearing = this.qiblaBearing.toFixed(1);

    // Labels per language
    const L = {
      atMakkah:      { es: '¡Estás en la Qibla!',       ar: 'أنت في القبلة!',              en: 'You are at the Qibla!' },
      atMakkahDesc:  { es: 'Te encuentras en Meca o sus alrededores. La Kaaba está cerca.', ar: 'أنت في مكة المكرمة أو ضواحيها. الكعبة قريبة.', en: 'You are in Makkah or its surroundings. The Kaaba is nearby.' },
      pointToKaaba:  { es: 'Gira despacio hasta que la 🕋 llegue a la flecha', ar: 'أدر هاتفك ببطء حتى تصل الكعبة 🕋 إلى السهم', en: 'Slowly turn until the 🕋 reaches the arrow' },
      aligned:       { es: '¡Perfecto! Estás mirando a la Qibla', ar: 'ممتاز! أنت تنظر إلى القبلة', en: 'Perfect! You are facing the Qibla' },
      qiblaDir:      { es: 'Dirección Qibla',            ar: 'اتجاه القبلة',                en: 'Qibla Direction' },
      trueNorth:     { es: 'Norte verdadero',            ar: 'الشمال الحقيقي',              en: 'True North' },
      magneticNorth: { es: 'Norte magnético',            ar: 'الشمال المغناطيسي',           en: 'Magnetic North' },
      declination:   { es: 'Declinación magnética',      ar: 'الانحراف المغناطيسي',         en: 'Magnetic declination' },
      distance:      { es: 'Distancia a la Kaaba',       ar: 'المسافة إلى الكعبة',          en: 'Distance to Kaaba' },
      calibrate:     { es: 'Calibrar brújula',           ar: 'معايرة البوصلة',              en: 'Calibrate compass' },
      noCompass:     { es: 'Sin brújula: la dirección se muestra sin sensor', ar: 'بدون بوصلة: يظهر الاتجاه بدون حساس', en: 'No compass: direction shown without sensor' },
      tip:           { es: '<i class="fas fa-lightbulb"></i> Mantén el teléfono horizontal y alejado de objetos metálicos. La 🕋 siempre marca la dirección real a la Kaaba; la flecha fija es hacia donde apunta tu teléfono ahora.', ar: '<i class="fas fa-lightbulb"></i> حافظ على الهاتف أفقيًا وبعيدًا عن الأجسام المعدنية. الكعبة 🕋 تشير دائمًا للاتجاه الحقيقي، والسهم الثابت يمثّل الاتجاه الذي يشير إليه هاتفك الآن.', en: '<i class="fas fa-lightbulb"></i> Keep the phone horizontal and away from metal objects. The 🕋 always marks the real direction to the Kaaba; the fixed arrow shows where your phone is pointing right now.' },
    };

    return `
      <div class="qibla-v17">
        ${atMakkah ? `
          <div class="card makkah-card">
            <div class="makkah-icon"><i class="fas fa-mosque"></i></div>
            <div class="makkah-title">${L.atMakkah[lang]}</div>
            <div class="makkah-desc">${L.atMakkahDesc[lang]}</div>
            <div class="makkah-dist">${distance.toFixed(1)} km</div>
          </div>
        ` : `
          <div class="card qibla-card">
            <div class="qibla-hint-v17" id="qibla-hint">${L.pointToKaaba[lang]}</div>

            <!-- Compass circle -->
            <div class="compass-v17" id="compass">
              <!-- Rotating ring: turns with the phone (true north), carries
                   the cardinal marks, the magnetic-north dot AND the Kaaba
                   target as children so they all move together. -->
              <div class="compass-ring" id="compass-ring" style="transform: rotate(0deg);">
                <div class="cardinal-mark n"><span class="cardinal-letter">N</span><span class="cardinal-sub">${L.trueNorth[lang]}</span></div>
                <div class="cardinal-mark e"><span class="cardinal-letter">E</span></div>
                <div class="cardinal-mark s"><span class="cardinal-letter">S</span></div>
                <div class="cardinal-mark w"><span class="cardinal-letter">W</span></div>

                <!-- Magnetic North marker: fixed offset (declination) within the ring -->
                <div class="magnetic-north-marker" style="transform: rotate(${decl}deg);">
                  <div class="mn-dot"></div>
                </div>

                <!-- Kaaba target: fixed at the qibla bearing within the ring,
                     so it swings around the dial as the phone turns -->
                <div class="qibla-target" id="qibla-target" style="transform: rotate(${this.qiblaBearing}deg);">
                  <div class="qibla-target-stem"></div>
                  <div class="qibla-target-badge" id="qibla-target-badge" style="transform: translateX(-50%) rotate(${-this.qiblaBearing}deg);">
                    <span class="kaaba-emoji">🕋</span>
                  </div>
                </div>
              </div>

              <!-- Fixed device pointer: NOT part of the ring — always shows
                   where the phone is pointing right now. Align the 🕋 with it. -->
              <div class="device-pointer" id="device-pointer">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 21l8-5 8 5z"/></svg>
              </div>

              <!-- Center hub -->
              <div class="compass-hub">
                <div class="hub-inner"></div>
              </div>
            </div>

            <!-- Numeric info panel -->
            <div class="qibla-info-v17">
              <div class="info-row">
                <div class="info-item">
                  <div class="info-label">${L.qiblaDir[lang]}</div>
                  <div class="info-value main-value">${trueBearing}°</div>
                  <div class="info-sub">${cardinal.long}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">${L.distance[lang]}</div>
                  <div class="info-value">${distance.toFixed(0)} km</div>
                </div>
              </div>
              <div class="info-row secondary">
                <div class="info-item">
                  <div class="info-label">${L.declination[lang]}</div>
                  <div class="info-value">${decl > 0 ? '+' : ''}${decl.toFixed(1)}°</div>
                </div>
                <div class="info-item">
                  <div class="info-label">${L.magneticNorth[lang]}</div>
                  <div class="info-value" id="magnetic-heading-val">—</div>
                </div>
              </div>
            </div>
          </div>

          <div class="qibla-tip-v17">${L.tip[lang]}</div>

          <button class="btn-primary qibla-activate-btn" id="qibla-activate-btn" onclick="PrayerPage.calibrateCompass()">
            <i class="fas fa-compass"></i> ${L.calibrate[lang]}
          </button>
        `}
      </div>
    `;
  },

  // ============ MONTHLY PRAYER TABLE ============
  monthlyTab(loc) {
    // Trigger async load
    setTimeout(() => this.loadMonthlyPrayers(loc), 100);
    return `
      <div id="monthly-prayer-container">
        ${Skeleton.prayerMonth()}
      </div>
    `;
  },

  async loadMonthlyPrayers(loc) {
    const container = document.getElementById('monthly-prayer-container');
    if (!container) return;

    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const data = await API.getPrayerTimesMonth(
        loc.latitude,
        loc.longitude,
        month,
        year,
        AppState.settings.calculationMethod || 3
      );

      this._monthly = { data, month, year }; // guardado para la exportación PDF
      this.renderMonthlyTable(container, data, month, year);
    } catch (e) {
      console.warn('Monthly prayers error:', e);
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-triangle-exclamation"></i></div>
          <div class="empty-state-text">${t('errorLoading') || 'Error al cargar. Verifica tu conexión.'}</div>
          <button class="btn-primary" onclick="PrayerPage.loadMonthlyPrayers(${JSON.stringify(loc).replace(/"/g,'&quot;')})">${t('retry') || 'Reintentar'}</button>
        </div>`;
    }
  },

  renderMonthlyTable(container, data, month, year) {
    if (!data || data.length === 0) {
      container.innerHTML = `<div class="empty-state"><div>${t('noData') || 'Sin datos'}</div></div>`;
      return;
    }

    const monthName = new Date(year, month - 1).toLocaleString(currentLocale, { month: 'long' });
    const today = new Date();
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
    const todayDay = today.getDate();

    // v36/v40: cabecera sobre el jadwal — ciudad + fechas en UNA línea, solo
    // números separados por «/» (hijri / gregoriana), sin mes en texto.
    const loc = AppState.location || {};
    const hijri = AppState.hijri;
    const gregNum = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const hijriNum = hijri ? `${hijri.day}/${hijri.month?.number || ''}/${hijri.year}` : '';

    // Prayer column headers
    const prayerLabels = {
      Fajr: t('prayers.Fajr') || 'Fajr',
      Dhuhr: t('prayers.Dhuhr') || 'Dhuhr',
      Asr: t('prayers.Asr') || 'Asr',
      Maghrib: t('prayers.Maghrib') || 'Maghrib',
      Isha: t('prayers.Isha') || 'Isha',
    };

    const rows = data.map(day => {
      const gDate = day.date?.gregorian;
      const hDate = day.date?.hijri;
      const dayNum = parseInt(gDate?.day, 10);
      const isToday = isCurrentMonth && dayNum === todayDay;
      const t24 = t => (t || '').split(' ')[0].slice(0,5); // "05:12 (CET)" -> "05:12"
      const isFriday = new Date(gDate?.date?.split('-').reverse().join('-'))?.getDay() === 5;

      return `
        <tr class="${isToday ? 'monthly-row-today' : ''} ${isFriday ? 'monthly-row-friday' : ''}">
          <td class="monthly-day-col">
            <div class="monthly-greg">${dayNum}</div>
            <div class="monthly-hijri">${hDate?.day} ${hDate?.month?.ar || hDate?.month?.en || ''}</div>
            ${isFriday ? '<div class="monthly-friday-badge"><i class="fas fa-book"></i></div>' : ''}
            ${isToday ? '<div class="monthly-today-badge"><i class="fas fa-star"></i></div>' : ''}
          </td>
          <td>${t24(day.timings?.Fajr)}<div class="monthly-iqamah">${getIqamahTime('Fajr', t24(day.timings?.Fajr)) || ''}</div></td>
          <td>${t24(day.timings?.Dhuhr)}<div class="monthly-iqamah">${getIqamahTime('Dhuhr', t24(day.timings?.Dhuhr)) || ''}</div></td>
          <td>${t24(day.timings?.Asr)}<div class="monthly-iqamah">${getIqamahTime('Asr', t24(day.timings?.Asr)) || ''}</div></td>
          <td>${t24(day.timings?.Maghrib)}<div class="monthly-iqamah">${getIqamahTime('Maghrib', t24(day.timings?.Maghrib)) || ''}</div></td>
          <td>${t24(day.timings?.Isha)}<div class="monthly-iqamah">${getIqamahTime('Isha', t24(day.timings?.Isha)) || ''}</div></td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="monthly-loc-bar">
        ${loc.city ? `<span class="monthly-loc-city"><i class="fas fa-location-dot"></i> ${escapeHtml(loc.city)}${loc.country ? ', ' + escapeHtml(loc.country) : ''}</span>` : ''}
        ${hijriNum ? `<span class="monthly-loc-hijri"><i class="fas fa-moon"></i> ${hijriNum} <span class="prayers-date-sep">/</span> <i class="fas fa-calendar-day"></i> ${gregNum}</span>` : `<span class="monthly-loc-hijri"><i class="fas fa-calendar-day"></i> ${gregNum}</span>`}
      </div>
      <div class="monthly-header">
        <div class="monthly-title"><i class="fas fa-calendar-days"></i> ${monthName} ${year}</div>
        <div class="monthly-subtitle">${data.length} ${t('days') || 'días'}</div>
        <button class="btn-primary pdf-btn-month" onclick="PrayerPdf.downloadMonth(this)" aria-label="${t('downloadPdf') || 'PDF'}">
          <i class="fas fa-file-pdf"></i> ${t('downloadPdf') || 'Descargar PDF'}
        </button>
      </div>
      <div class="monthly-table-wrap">
        <table class="monthly-table">
          <thead>
            <tr>
              <th>${t('day') || 'Día'}</th>
              <th><i class="fas fa-cloud-sun"></i> ${prayerLabels.Fajr}</th>
              <th><i class="fas fa-sun"></i> ${prayerLabels.Dhuhr}</th>
              <th><i class="fas fa-cloud-sun"></i> ${prayerLabels.Asr}</th>
              <th><i class="fas fa-mountain-sun"></i> ${prayerLabels.Maghrib}</th>
              <th><i class="fas fa-moon"></i> ${prayerLabels.Isha}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="monthly-legend">
        <span><span class="legend-dot today"></span> ${t('today') || 'Hoy'}</span>
        <span><span class="legend-dot friday"></span> ${t('friday') || 'Viernes'}</span>
      </div>
    `;
  },

  async calibrateCompass() {
    // iOS 13+ requiere permiso explícito (solo hace falta pedirlo una vez)
    if (!this.permissionGranted && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') {
          this.permissionGranted = true;
        } else {
          showToast('Permiso denegado');
          return;
        }
      } catch (e) {
        showToast('Error: ' + e.message);
        return;
      }
    } else {
      this.permissionGranted = true;
    }

    // v48: «Calibrar» reinicia el filtro de suavizado (arranca de cero, sin
    // arrastrar una media vieja de otra sesión/orientación) y vuelve a
    // enganchar los listeners — así el mismo botón sirve tanto para la
    // primera activación como para recalibrar más tarde.
    this.initOrientationListener();
    this.showCalibrationOverlay();
  },

  initOrientationListener() {
    if (this.orientationHandlerAbs) {
      window.removeEventListener('deviceorientationabsolute', this.orientationHandlerAbs);
      this.orientationHandlerAbs = null;
    }
    if (this.orientationHandlerRel) {
      window.removeEventListener('deviceorientation', this.orientationHandlerRel);
      this.orientationHandlerRel = null;
    }
    if (this._qiblaRaf) {
      cancelAnimationFrame(this._qiblaRaf);
      this._qiblaRaf = null;
    }

    Qibla.resetSmoothing();
    this._lastTrueHeading = undefined;
    this._lastAligned = undefined;
    this._pendingHeading = null;
    this._usingAbsolute = false;

    // Apply the latest smoothed reading once per animation frame instead of
    // once per sensor sample (sensors can fire up to ~60/sec) — this alone
    // removes a lot of the visible "vibration" since we're no longer forcing
    // dozens of layout/paint updates per second.
    const applyFrame = () => {
      this._qiblaRaf = null;
      if (this._pendingHeading === null) return;
      const heading = this._pendingHeading;
      this._pendingHeading = null;

      const loc = AppState.location;
      const lang = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
      // v48: both webkitCompassHeading (iOS) and deviceorientationabsolute's
      // alpha (Android) are MAGNETIC headings, not true headings — always
      // run them through the declination correction (isTrueHeading=false).
      const computed = Qibla.compute(loc?.latitude || 0, loc?.longitude || 0, heading, lang, false);
      const trueHeading = computed.trueHeading;

      // Render deadband: skip DOM writes for sub-degree noise (kills visible vibration)
      if (this._lastTrueHeading !== undefined) {
        let dH = Math.abs(trueHeading - this._lastTrueHeading);
        if (dH > 180) dH = 360 - dH;
        if (dH < 0.35 && this._lastAligned === computed.aligned) return;
      }
      this._lastTrueHeading = trueHeading;

      // Rotating the ring by -trueHeading carries the cardinal marks, the
      // magnetic-north dot AND the Kaaba target along with it (all three
      // are DOM children of #compass-ring) — one transform, three things move.
      const ring = document.getElementById('compass-ring');
      if (ring) ring.style.transform = `rotate(${-trueHeading}deg)`;

      // Counter-rotate the Kaaba badge so it stays upright while it orbits.
      const badge = document.getElementById('qibla-target-badge');
      if (badge) badge.style.transform = `translateX(-50%) rotate(${trueHeading - this.qiblaBearing}deg)`;

      const aligned = computed.aligned;
      const target = document.getElementById('qibla-target');
      const pointer = document.getElementById('device-pointer');
      if (target) target.classList.toggle('aligned', aligned);
      if (pointer) pointer.classList.toggle('aligned', aligned);

      const hint = document.getElementById('qibla-hint');
      if (hint) {
        const L = {
          aligned: { es: '¡Perfecto! Estás mirando a la Qibla', ar: 'ممتاز! أنت تنظر إلى القبلة', en: 'Perfect! You are facing the Qibla' },
          pointTo: { es: 'Gira despacio hasta que la 🕋 llegue a la flecha', ar: 'أدر هاتفك ببطء حتى تصل الكعبة 🕋 إلى السهم', en: 'Slowly turn until the 🕋 reaches the arrow' },
        };
        hint.textContent = aligned ? L.aligned[lang] : L.pointTo[lang];
        hint.classList.toggle('aligned', aligned);
      }

      // Numeric magnetic-heading readout (magnetic = true − declination)
      const mhVal = document.getElementById('magnetic-heading-val');
      if (mhVal) {
        const mag = ((trueHeading - computed.magneticDeclination) % 360 + 360) % 360;
        mhVal.textContent = mag.toFixed(1) + '°';
      }

      // Haptic feedback on alignment (debounced)
      if (aligned && navigator.vibrate && !this._lastAligned) {
        navigator.vibrate([30, 50, 30]);
      }
      this._lastAligned = aligned;
    };

    const processHeading = (rawHeading) => {
      if (rawHeading === null || isNaN(rawHeading)) return;
      // Adaptive smoothing (outlier rejection + micro-jitter deadband)
      const smoothed = Qibla.smoothHeading(rawHeading);
      this.deviceHeading = smoothed;
      this._pendingHeading = smoothed;
      if (!this._qiblaRaf) this._qiblaRaf = requestAnimationFrame(applyFrame);
    };

    // v48: deviceorientationabsolute and deviceorientation can BOTH fire for
    // the same physical movement on some Android/Chrome combinations — one
    // "absolute" (magnetometer-referenced) and one "relative" (can drift from
    // the page's initial orientation). Feeding both into the same filter
    // made the needle fight itself between two slightly different readings,
    // which looked like jitter. Once an "absolute" event arrives we trust it
    // exclusively and stop listening to the relative one. iOS never fires
    // deviceorientationabsolute at all, so this is a no-op there — it keeps
    // using deviceorientation + webkitCompassHeading as before.
    this.orientationHandlerAbs = (e) => {
      this._usingAbsolute = true;
      if (this.orientationHandlerRel) {
        window.removeEventListener('deviceorientation', this.orientationHandlerRel);
        this.orientationHandlerRel = null;
      }
      if (e.alpha === null) return;
      processHeading(360 - e.alpha);
    };

    this.orientationHandlerRel = (e) => {
      if (this._usingAbsolute) return;
      let heading = null;
      if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading; // iOS Safari: magnetic heading
      } else if (e.alpha !== null) {
        heading = 360 - e.alpha;
      }
      processHeading(heading);
    };

    window.addEventListener('deviceorientationabsolute', this.orientationHandlerAbs, true);
    window.addEventListener('deviceorientation', this.orientationHandlerRel, true);
  },

  showCalibrationOverlay() {
    // Remove any existing overlay synchronously (no fade) before creating a
    // fresh one, so re-tapping "Calibrar" quickly can't leave two stacked
    // #qibla-calib-overlay elements mid-transition.
    if (this._calibAutoHide) { clearTimeout(this._calibAutoHide); this._calibAutoHide = null; }
    const existing = document.getElementById('qibla-calib-overlay');
    if (existing) existing.remove();

    const lang = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    const L = {
      title: { es: 'Calibrando brújula', ar: 'جارٍ معايرة البوصلة', en: 'Calibrating compass' },
      desc:  { es: 'Mueve el teléfono trazando un 8 en el aire un par de veces para reajustar el sensor.', ar: 'حرّك هاتفك على شكل الرقم 8 في الهواء عدّة مرات لإعادة ضبط الحساس.', en: 'Move your phone tracing a figure-8 in the air a couple of times to reset the sensor.' },
      done:  { es: 'Listo', ar: 'تم', en: 'Done' },
    };

    const overlay = document.createElement('div');
    overlay.className = 'qibla-calib-overlay';
    overlay.id = 'qibla-calib-overlay';
    overlay.innerHTML = `
      <div class="qibla-calib-sheet">
        <div class="qibla-calib-title">${L.title[lang]}</div>
        <div class="qibla-calib-desc">${L.desc[lang]}</div>
        <div class="qibla-calib-stage">
          <svg class="qibla-calib-track" viewBox="0 0 100 60" fill="none">
            <path d="M50,30 C50,13.4 37.3,2 25,2 C10.7,2 2,15 2,30 C2,45 10.7,58 25,58 C37.3,58 50,46.6 50,30 C50,13.4 62.7,2 75,2 C89.3,2 98,15 98,30 C98,45 89.3,58 75,58 C62.7,58 50,46.6 50,30 Z"
              stroke="#d4a017" stroke-width="2.5" stroke-dasharray="5 6" stroke-linecap="round"/>
          </svg>
          <div class="qibla-calib-phone">📱</div>
        </div>
        <div class="qibla-calib-actions">
          <button class="btn-primary qibla-calib-done-btn" onclick="PrayerPage.hideCalibrationOverlay()">${L.done[lang]}</button>
        </div>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hideCalibrationOverlay();
    });
    document.body.appendChild(overlay);

    this._calibAutoHide = setTimeout(() => this.hideCalibrationOverlay(), 6000);
  },

  hideCalibrationOverlay() {
    if (this._calibAutoHide) {
      clearTimeout(this._calibAutoHide);
      this._calibAutoHide = null;
    }
    const overlay = document.getElementById('qibla-calib-overlay');
    if (!overlay) return;
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 200);
  },

  permissionPrompt() {
    return `
      <div class="permission-needed">
        <div class="permission-needed-icon"><i class="fas fa-location-dot"></i></div>
        <div class="permission-needed-title">${t('locationNeeded')}</div>
        <div class="permission-needed-desc">${t('locationDesc')}</div>
        <button class="btn-primary" onclick="PrayerPage.render(document.getElementById('main-content'))">
          ${t('grantPermission')}
        </button>
      </div>
    `;
  },

  cleanup() {
    if (this.orientationHandlerAbs) {
      window.removeEventListener('deviceorientationabsolute', this.orientationHandlerAbs);
      this.orientationHandlerAbs = null;
    }
    if (this.orientationHandlerRel) {
      window.removeEventListener('deviceorientation', this.orientationHandlerRel);
      this.orientationHandlerRel = null;
    }
    if (this._qiblaRaf) {
      cancelAnimationFrame(this._qiblaRaf);
      this._qiblaRaf = null;
    }
    this.hideCalibrationOverlay();
    // v36: detener el contador de «tiempo restante» al salir de la página
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  },
};
