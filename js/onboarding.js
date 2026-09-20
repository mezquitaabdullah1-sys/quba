// 👋 الجولة التعريفية (Onboarding) — تظهر مرة واحدة بعد اختيار اللغة مباشرة
// Onboarding: carrusel de bienvenida first-run, en el idioma elegido y con la
// identidad visual de Quba (esmeralda + dorado). Páginas:
//   1) Bienvenida con el logo de Quba
//   2) Todo lo que necesitas en una app (funciones reales de Quba)
//   3) Tu privacidad primero (con enlace a la política completa)
//   4) Configura tu ubicación (GPS automático o búsqueda manual por ciudad)
// Se marca como completada (quba_onboardingDone) y no vuelve a aparecer.
const Onboarding = {
  idx: 0,
  _el: null,

  I18N: {
    ar: {
      skip: 'تخطَّ',
      next: 'التالي',
      start: 'ابدأ الآن',
      privacyLink: 'سياسة الخصوصية',
      steps: [
        {
          logo: true,
          title: 'قُبَّة',
          sub: 'رفيقك اليومي نحو الجنة — القرآن الكريم، مواقيت الصلاة، القبلة والأذكار في مكان واحد، وباللغة التي تفضّلها.',
        },
        {
          icon: 'fas fa-mosque',
          title: 'كل ما تحتاجه في تطبيق واحد',
          points: [
            { icon: 'fas fa-book-quran',       text: 'القرآن الكريم كاملاً مع التلاوة والترجمة والتفسير — ومتاح دون إنترنت' },
            { icon: 'fas fa-clock',            text: 'مواقيت الصلاة الدقيقة لمدينتك مع الأذان والتنبيهات في وقتها' },
            { icon: 'fas fa-compass',          text: 'بوصلة القبلة الدقيقة أينما كنت' },
            { icon: 'fas fa-lightbulb',        text: 'أذكار الصباح والمساء، المسبحة، الدعاء ودورات تعليمية تفاعلية' },
          ],
        },
        {
          icon: 'fas fa-shield-halved',
          title: 'خصوصيتك أولاً',
          points: [
            { icon: 'fas fa-mobile-screen',    text: 'كل بياناتك محفوظة على جهازك فقط — بلا حسابات وبلا خوادم' },
            { icon: 'fas fa-location-dot',     text: 'موقعك يُستخدم لحساب المواقيت والقبلة فقط، ولا يغادر جهازك' },
            { icon: 'fas fa-ban',              text: 'بلا إعلانات، بلا تتبّع، بلا أدوات تحليل' },
          ],
          footer: 'اطّلع على التفاصيل كاملة في',
        },
      ],
      loc: {
        icon: 'fas fa-location-crosshairs',
        title: 'حدّد موقعك',
        sub: 'مواقيت الصلاة تختلف من مدينة لأخرى، وحسابها يحتاج موقعك.',
        points: [
          { icon: 'fas fa-mosque',         text: 'مواقيت الصلاة محسوبة لمدينتك، لا لمدينة قريبة' },
          { icon: 'fas fa-compass',        text: 'اتجاه القبلة بدقة من مكانك' },
          { icon: 'fas fa-lock',           text: 'موقعك يُحفظ على جهازك، ولا نحتفظ به لدينا' },
        ],
        gps: 'تحديد تلقائي (GPS)',
        gpsHint: 'الأكثر دقة، يتطلب إذن الموقع',
        manual: 'بحث يدوي',
        manualHint: 'ابحث عن مدينتك بالاسم',
        skip: 'تخطَّ الآن',
        skipHint: 'يمكنك ضبط الموقع لاحقاً من الإعدادات',
        confirmTitle: 'هل هذا موقعك؟',
        confirmNote: 'ستُحسب مواقيت الصلاة والقبلة على أساسه',
        confirm: 'تأكيد',
        notMine: 'ليس هذا موقعي',
        searchPh: 'ابحث عن مدينتك...',
        locating: 'جارٍ تحديد موقعك...',
        locError: 'تعذّر تحديد الموقع. جرّب البحث اليدوي.',
        noResults: 'لا نتائج — جرّب اسماً آخر',
      },
    },

    es: {
      skip: 'Omitir',
      next: 'Siguiente',
      start: 'Comenzar',
      privacyLink: 'Política de privacidad',
      steps: [
        {
          logo: true,
          title: 'Quba',
          sub: 'Tu compañero diario hacia el Paraíso: Corán, horarios de oración, Qibla y adhkar en un solo lugar, y en el idioma que prefieras.',
        },
        {
          icon: 'fas fa-mosque',
          title: 'Todo lo que necesitas en una app',
          points: [
            { icon: 'fas fa-book-quran',       text: 'El Corán completo con recitación, traducción y tafsir — disponible sin conexión' },
            { icon: 'fas fa-clock',            text: 'Horarios de oración precisos para tu ciudad, con adhan y recordatorios a su hora' },
            { icon: 'fas fa-compass',          text: 'Brújula de la Qibla precisa estés donde estés' },
            { icon: 'fas fa-lightbulb',        text: 'Adhkar de la mañana y la tarde, tasbih, du\'as y cursos interactivos' },
          ],
        },
        {
          icon: 'fas fa-shield-halved',
          title: 'Tu privacidad primero',
          points: [
            { icon: 'fas fa-mobile-screen',    text: 'Todos tus datos se guardan solo en tu dispositivo — sin cuentas ni servidores' },
            { icon: 'fas fa-location-dot',     text: 'Tu ubicación se usa solo para horarios y Qibla, y nunca sale de tu dispositivo' },
            { icon: 'fas fa-ban',              text: 'Sin anuncios, sin rastreo, sin analíticas' },
          ],
          footer: 'Consulta todos los detalles en la',
        },
      ],
      loc: {
        icon: 'fas fa-location-crosshairs',
        title: 'Configura tu ubicación',
        sub: 'Los horarios de oración cambian de una ciudad a otra, y calcularlos requiere tu ubicación.',
        points: [
          { icon: 'fas fa-mosque',         text: 'Horarios calculados para tu ciudad, no para una cercana' },
          { icon: 'fas fa-compass',        text: 'Dirección de la Qibla exacta desde donde estás' },
          { icon: 'fas fa-lock',           text: 'Tu ubicación se guarda en tu dispositivo; no la conservamos' },
        ],
        gps: 'Detección automática (GPS)',
        gpsHint: 'La más precisa, requiere permiso de ubicación',
        manual: 'Búsqueda manual',
        manualHint: 'Busca tu ciudad por nombre',
        skip: 'Omitir por ahora',
        skipHint: 'Puedes ajustar la ubicación luego en Ajustes',
        confirmTitle: '¿Es esta tu ubicación?',
        confirmNote: 'Los horarios y la Qibla se calcularán en base a ella',
        confirm: 'Confirmar',
        notMine: 'No es mi ubicación',
        searchPh: 'Busca tu ciudad...',
        locating: 'Detectando tu ubicación...',
        locError: 'No se pudo detectar. Prueba la búsqueda manual.',
        noResults: 'Sin resultados — prueba otro nombre',
      },
    },

    en: {
      skip: 'Skip',
      next: 'Next',
      start: 'Get started',
      privacyLink: 'Privacy policy',
      steps: [
        {
          logo: true,
          title: 'Quba',
          sub: 'Your daily companion towards Paradise: Quran, prayer times, Qibla and adhkar in one place, in the language you prefer.',
        },
        {
          icon: 'fas fa-mosque',
          title: 'Everything you need in one app',
          points: [
            { icon: 'fas fa-book-quran',       text: 'The complete Quran with recitation, translation and tafsir — available offline' },
            { icon: 'fas fa-clock',            text: 'Accurate prayer times for your city, with adhan and timely reminders' },
            { icon: 'fas fa-compass',          text: 'A precise Qibla compass wherever you are' },
            { icon: 'fas fa-lightbulb',        text: 'Morning & evening adhkar, tasbih, du\'as and interactive courses' },
          ],
        },
        {
          icon: 'fas fa-shield-halved',
          title: 'Your privacy first',
          points: [
            { icon: 'fas fa-mobile-screen',    text: 'All your data is stored only on your device — no accounts, no servers' },
            { icon: 'fas fa-location-dot',     text: 'Your location is used only for prayer times and Qibla, and never leaves your device' },
            { icon: 'fas fa-ban',              text: 'No ads, no tracking, no analytics' },
          ],
          footer: 'Read the full details in the',
        },
      ],
      loc: {
        icon: 'fas fa-location-crosshairs',
        title: 'Set your location',
        sub: 'Prayer times differ from one city to another, and calculating them requires your location.',
        points: [
          { icon: 'fas fa-mosque',         text: 'Prayer times calculated for your city, not a nearby one' },
          { icon: 'fas fa-compass',        text: 'Exact Qibla direction from where you are' },
          { icon: 'fas fa-lock',           text: 'Your location is stored on your device; we never keep it' },
        ],
        gps: 'Automatic detection (GPS)',
        gpsHint: 'Most accurate, requires location permission',
        manual: 'Manual search',
        manualHint: 'Search your city by name',
        skip: 'Skip for now',
        skipHint: 'You can set your location later in Settings',
        confirmTitle: 'Is this your location?',
        confirmNote: 'Prayer times and Qibla will be calculated from it',
        confirm: 'Confirm',
        notMine: 'Not my location',
        searchPh: 'Search your city...',
        locating: 'Detecting your location...',
        locError: 'Could not detect location. Try manual search.',
        noResults: 'No results — try another name',
      },
    },
  },

  /** ¿Debe mostrarse? Solo la primera vez (tras elegir idioma). */
  shouldShow() {
    try { return !Storage.get('onboardingDone'); } catch (e) { return true; }
  },

  _dict() {
    return this.I18N[currentLocale] || this.I18N.es;
  },

  /** Abre la jaula del carrusel por encima de todo. */
  show() {
    if (this._el) return;
    this.idx = 0;
    const el = document.createElement('div');
    el.id = 'onboarding';
    el.className = 'onboarding';
    document.body.appendChild(el);
    this._el = el;
    this._render();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
  },

  _close(cb) {
    const el = this._el;
    if (!el) return;
    el.classList.add('closing');
    setTimeout(() => { el.remove(); this._el = null; if (cb) cb(); }, 320);
  },

  // ---------- Render ----------
  _render() {
    const d = this._dict();
    const isLoc = this.idx === d.steps.length; // صفحة الموقع (الأخيرة)
    const el = this._el;
    const canSkip = this.idx < d.steps.length - 1; // لا "تخطَّ" في صفحة الخصوصية ولا الموقع

    el.innerHTML = `
      ${canSkip ? `<button class="ob-skip" id="ob-skip">${esc(d.skip)}</button>` : ''}
      <div class="ob-body">${isLoc ? this._locHtml(d.loc) : this._stepHtml(d.steps[this.idx], d)}</div>
      <div class="ob-dots">
        ${d.steps.map((_, i) => `<span class="ob-dot ${i === this.idx ? 'active' : ''}"></span>`).join('')}
        <span class="ob-dot ${isLoc ? 'active' : ''}"></span>
      </div>
      ${isLoc ? '' : `
        <button class="ob-next" id="ob-next">
          ${esc(this.idx === d.steps.length - 1 ? d.next : d.next)}
        </button>`}
    `;

    // Listeners
    const skipBtn = el.querySelector('#ob-skip');
    if (skipBtn) skipBtn.addEventListener('click', () => { this.idx = d.steps.length; this._render(); });
    const nextBtn = el.querySelector('#ob-next');
    if (nextBtn) nextBtn.addEventListener('click', () => { this.idx++; this._render(); });
    const priv = el.querySelector('#ob-privacy-link');
    if (priv) priv.addEventListener('click', () => this.openPrivacy());
    if (isLoc) this._bindLoc(d.loc);
  },

  _stepHtml(step, d) {
    const head = step.logo
      ? `<picture>
           <source srcset="assets/logo.webp" type="image/webp">
           <img src="assets/logo.png" alt="Quba" class="ob-logo">
         </picture>`
      : `<div class="ob-icon"><i class="${esc(step.icon)}"></i></div>`;
    const points = (step.points || []).map(p => `
      <div class="ob-point">
        <span class="ob-point-icon"><i class="${esc(p.icon)}"></i></span>
        <span class="ob-point-text">${esc(p.text)}</span>
      </div>`).join('');
    const footer = step.footer
      ? `<div class="ob-footer">${esc(step.footer)}
           <button class="ob-privacy-link" id="ob-privacy-link">${esc(d.privacyLink)}</button>
         </div>`
      : '';
    return `
      ${head}
      <div class="ob-title">${esc(step.title)}</div>
      ${step.sub ? `<div class="ob-sub">${esc(step.sub)}</div>` : ''}
      ${points ? `<div class="ob-points">${points}</div>` : ''}
      ${footer}
    `;
  },

  // ---------- صفحة الموقع ----------
  _locHtml(L) {
    const points = L.points.map(p => `
      <div class="ob-point">
        <span class="ob-point-icon"><i class="${esc(p.icon)}"></i></span>
        <span class="ob-point-text">${esc(p.text)}</span>
      </div>`).join('');
    return `
      <div class="ob-icon"><i class="${esc(L.icon)}"></i></div>
      <div class="ob-title">${esc(L.title)}</div>
      <div class="ob-sub">${esc(L.sub)}</div>
      <div class="ob-points ob-points-card">${points}</div>
      <div id="ob-loc-zone">
        <button class="ob-loc-btn ob-loc-gps" id="ob-gps">
          <span class="ob-loc-btn-icon"><i class="fas fa-location-crosshairs"></i></span>
          <span class="ob-loc-btn-text">
            <span class="ob-loc-btn-title">${esc(L.gps)}</span>
            <span class="ob-loc-btn-hint">${esc(L.gpsHint)}</span>
          </span>
          <i class="fas fa-chevron-left ob-loc-chevron"></i>
        </button>
        <button class="ob-loc-btn ob-loc-manual" id="ob-manual">
          <span class="ob-loc-btn-icon"><i class="fas fa-magnifying-glass"></i></span>
          <span class="ob-loc-btn-text">
            <span class="ob-loc-btn-title">${esc(L.manual)}</span>
            <span class="ob-loc-btn-hint">${esc(L.manualHint)}</span>
          </span>
          <i class="fas fa-chevron-left ob-loc-chevron"></i>
        </button>
      </div>
      <button class="ob-loc-skip" id="ob-loc-skip">${esc(L.skip)}</button>
      <div class="ob-loc-skip-hint">${esc(L.skipHint)}</div>
    `;
  },

  _bindLoc(L) {
    const el = this._el;
    el.querySelector('#ob-gps').addEventListener('click', () => this._gpsLocate(L));
    el.querySelector('#ob-manual').addEventListener('click', () => this._showSearch(L));
    el.querySelector('#ob-loc-skip').addEventListener('click', () => this.finish());
  },

  /** GPS: pide permiso → geocoding → tarjeta de confirmación */
  async _gpsLocate(L) {
    const zone = this._el.querySelector('#ob-loc-zone');
    zone.innerHTML = `<div class="ob-locating"><i class="fas fa-circle-notch fa-spin"></i> ${esc(L.locating)}</div>`;
    try {
      if (!navigator.geolocation) throw new Error('no geo');
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej,
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 }));
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
      const geo = await LocationService.reverseGeocode(coords.latitude, coords.longitude);
      Object.assign(coords, geo);
      this._showConfirm(L, coords);
    } catch (e) {
      zone.innerHTML = `
        <div class="ob-loc-error"><i class="fas fa-triangle-exclamation"></i> ${esc(L.locError)}</div>
        <button class="ob-loc-btn ob-loc-manual" id="ob-manual2">
          <span class="ob-loc-btn-icon"><i class="fas fa-magnifying-glass"></i></span>
          <span class="ob-loc-btn-text">
            <span class="ob-loc-btn-title">${esc(L.manual)}</span>
            <span class="ob-loc-btn-hint">${esc(L.manualHint)}</span>
          </span>
          <i class="fas fa-chevron-left ob-loc-chevron"></i>
        </button>`;
      this._el.querySelector('#ob-manual2').addEventListener('click', () => this._showSearch(L));
    }
  },

  /** Tarjeta «هل هذا موقعك؟» */
  _showConfirm(L, coords) {
    const zone = this._el.querySelector('#ob-loc-zone');
    const match = (typeof Cities !== 'undefined') ? Cities.match(coords.latitude, coords.longitude) : null;
    const label = match
      ? Cities.label(match)
      : [coords.city, coords.country].filter(Boolean).join('، ');
    zone.innerHTML = `
      <div class="ob-confirm-card">
        <div class="ob-confirm-pin"><i class="fas fa-location-dot"></i></div>
        <div class="ob-confirm-title">${esc(L.confirmTitle)}</div>
        <div class="ob-confirm-city">${esc(label || '—')}</div>
        <div class="ob-confirm-note">${esc(L.confirmNote)}</div>
        <div class="ob-confirm-actions">
          <button class="ob-confirm-no" id="ob-not-mine">${esc(L.notMine)}</button>
          <button class="ob-confirm-yes" id="ob-confirm-yes">${esc(L.confirm)}</button>
        </div>
      </div>`;
    this._el.querySelector('#ob-confirm-yes').addEventListener('click', () => {
      Storage.set('last_location', coords, CONFIG.CACHE_TTL * 7);
      AppState.location = coords;
      this.finish();
    });
    this._el.querySelector('#ob-not-mine').addEventListener('click', () => this._showSearch(L));
  },

  /** البحث اليدوي عن المدينة */
  _showSearch(L) {
    const zone = this._el.querySelector('#ob-loc-zone');
    zone.innerHTML = `
      <div class="ob-search-wrap">
        <input type="search" id="ob-city-search" class="ob-search-input"
               placeholder="${escapeAttr(L.searchPh)}" autocomplete="off">
        <div id="ob-city-results" class="ob-city-results"></div>
      </div>`;
    const inp = zone.querySelector('#ob-city-search');
    const list = zone.querySelector('#ob-city-results');
    const renderList = (q) => {
      const results = Cities.search(q).slice(0, 8);
      list.innerHTML = results.length
        ? results.map(c => `
            <button class="ob-city-item" data-city="${esc(c.id)}">
              <i class="fas fa-location-dot"></i> ${esc(Cities.label(c))}
            </button>`).join('')
        : `<div class="ob-no-results">${esc(L.noResults)}</div>`;
      list.querySelectorAll('.ob-city-item').forEach(b => {
        b.addEventListener('click', () => {
          const city = Cities.byId(b.dataset.city);
          if (city) this._showConfirm(L, {
            latitude: city.lat, longitude: city.lon,
            city: Cities.plainName(city), country: Cities.plainCountry(city),
            manual: true,
          });
        });
      });
    };
    inp.addEventListener('input', () => renderList(inp.value));
    renderList('');
    setTimeout(() => inp.focus(), 120);
  },

  /** Guardar fin de la jaula y refrescar la página actual SOLO si hace falta */
  finish() {
    // v61: antes esto repintaba Inicio SIEMPRE al cerrar la jaula — pero
    // Inicio ya se había cargado en paralelo por debajo (app.js llama a
    // Router.go('home') justo después de mostrar la jaula, sin esperarla),
    // así que para cuando el usuario terminaba la introducción, Inicio
    // solía estar YA lista — y este repintado forzado la volvía a poner en
    // skeleton y a repetir la petición de ubicación/horarios desde cero,
    // haciendo esperar al usuario justo después de la introducción (y dando
    // la sensación de «recarga cada vez»). Ahora solo se repinta si la
    // ubicación cambió de verdad durante la jaula (GPS/búsqueda manual
    // confirmados, o se acaba de fijar la ubicación por defecto porque no
    // había ninguna) — si Inicio ya está pintada con esa misma ubicación,
    // se deja tal cual: instantánea.
    let locationChanged = false;
    try {
      const prevLoc = (typeof AppState !== 'undefined') ? AppState.location : null;
      Storage.set('onboardingDone', true, 3650 * 24 * 60 * 60 * 1000);
      // Si el usuario se saltó la ubicación, fijar la ciudad por defecto para
      // que la home no vuelva a pedir GPS por su cuenta.
      if (!Storage.get('last_location') && typeof LocationService !== 'undefined') {
        LocationService.useDefault();
      }
      const newLoc = Storage.get('last_location');
      if (newLoc && (!prevLoc || prevLoc.latitude !== newLoc.latitude || prevLoc.longitude !== newLoc.longitude)) {
        locationChanged = true;
      }
    } catch (e) {}
    this._close(() => {
      if (!locationChanged) return;
      try {
        if (typeof Router !== 'undefined' && Router.current) {
          const r = Router.current.route;
          const m = r.method || 'render';
          const container = document.getElementById('main-content');
          if (container && r && r.page && typeof r.page[m] === 'function') {
            r.page[m](container, Router.current.params || {});
          }
        }
      } catch (e) {}
    });
  },

  // ---------- سياسة الخصوصية ----------
  openPrivacy() {
    if (document.getElementById('ob-privacy-sheet')) return;
    const P = (typeof PRIVACY_POLICY !== 'undefined') ? PRIVACY_POLICY : null;
    const d = P ? (P[currentLocale] || P.es) : null;
    if (!d) return;

    const sheet = document.createElement('div');
    sheet.id = 'ob-privacy-sheet';
    sheet.className = 'ob-privacy-sheet';
    const body = d.sections.map(s => {
      const inner = s.list
        ? s.list.map(item => `
            <div class="obp-item">
              <div class="obp-item-label">${esc(item.label)}</div>
              <p>${esc(item.body)}</p>
            </div>`).join('')
        : `<p>${esc(s.p)}</p>`;
      return `<section class="obp-section"><h3>${esc(s.h)}</h3>${inner}</section>`;
    }).join('');

    sheet.innerHTML = `
      <div class="obp-card">
        <div class="obp-header">
          <div class="obp-title"><i class="fas fa-shield-halved"></i> ${esc(d.title)}</div>
          <button class="obp-close" id="obp-close" aria-label="×"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="obp-body">
          <p class="obp-intro">${esc(d.intro)}</p>
          <div class="obp-updated">${esc(P.updated)}</div>
          ${body}
          <p class="obp-consent">${esc(d.consent)}</p>
        </div>
      </div>`;
    document.body.appendChild(sheet);
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('visible')));
    sheet.querySelector('#obp-close').addEventListener('click', () => this.closePrivacy());
    sheet.addEventListener('click', (e) => { if (e.target === sheet) this.closePrivacy(); });
  },

  closePrivacy() {
    const sheet = document.getElementById('ob-privacy-sheet');
    if (!sheet) return;
    sheet.classList.remove('visible');
    setTimeout(() => sheet.remove(), 300);
  },
};

if (typeof window !== 'undefined') window.Onboarding = Onboarding;
