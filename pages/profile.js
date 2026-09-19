// 👤 Pantalla de Ajustes — hub agrupado en secciones
// Cada grupo (Oración, Adhan, General, Datos) tiene su propia sub-página;
// el hub muestra además las tarjetas de Funciones, Actualizaciones,
// Acerca de, Fuentes del contenido y Comunidad.
const ProfilePage = {

  // ================= HUB PRINCIPAL =================
  async render(container) {
    const chevron = currentLocale === 'ar' ? 'left' : 'right';

    const groupCard = (icon, color, title, desc, action) => `
      <div class="card" style="padding:0;overflow:hidden;margin-bottom:12px;">
        <div class="list-row" onclick="${action}" style="padding:16px;">
          <div class="list-row-icon" style="background:${color}1a;color:${color};width:46px;height:46px;font-size:19px;"><i class="fas fa-${icon}"></i></div>
          <div class="list-row-info">
            <div class="list-row-label" style="font-size:16px;font-weight:700;">${title}</div>
            <div class="list-row-value" style="font-size:12px;line-height:1.5;">${desc}</div>
          </div>
          <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
        </div>
      </div>`;

    container.innerHTML = `
      <!-- Cabecera simplificada — sin avatar ni saludo, solo el título -->
      <div style="padding: calc(var(--sp-md) + 8px) var(--sp-md) var(--sp-md); text-align:center;">
        <div style="width:64px;height:64px;border-radius:20px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#D4AF37,#b08d1e);color:#fff;font-size:26px;box-shadow:0 6px 18px rgba(212,175,55,.35);">
          <i class="fas fa-gear"></i>
        </div>
        <div style="font-size:21px;font-weight:800;color:var(--text);">${t('personalSettings')}</div>
      </div>

      <div style="padding: 0 var(--sp-md);">

        <!-- ===== Grupos de ajustes ===== -->
        <div class="section-label"><i class="fas fa-sliders"></i> ${t('settings')}</div>

        ${groupCard('mosque', '#2e8b57', t('prayerSettings'), t('prayerSettingsDesc'), "ProfilePage.renderGroup('prayer')")}
        ${groupCard('bullhorn', '#b8860b', t('adhanSettings'), t('adhanGroupDesc'), "ProfilePage.renderGroup('adhan')")}
        ${groupCard('palette', '#6a5acd', t('generalSettings'), t('generalSettingsDesc'), "ProfilePage.renderGroup('general')")}
        ${groupCard('database', '#c0392b', t('dataZone'), t('dataZoneGroupDesc'), "ProfilePage.renderGroup('data')")}

        <!-- ===== Funciones de la app ===== -->
        <div class="section-label"><i class="fas fa-grip"></i> ${t('appFeatures')}</div>
        <div class="card" style="padding:12px;margin-bottom:12px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px;">
            ${this._featureBtn('book-quran', '#2e8b57', t('tabQuran'), "Router.go('quran')")}
            ${this._featureBtn('mosque', '#b8860b', t('tabPrayer'), "Router.go('prayer')")}
            ${this._featureBtn('compass', '#1e88e5', t('qibla'), "Router.go('prayer',{tab:'qibla'})")}
            ${this._featureBtn('lightbulb', '#8e44ad', t('tabWisdom'), "Router.go('wisdom')")}
            ${this._featureBtn('calendar-days', '#c0392b', t('hijriCalendar'), "Router.go('calendar')")}
            ${this._featureBtn('graduation-cap', '#d35400', t('coursesTitle'), "Router.go('wisdom/courses')")}
          </div>
        </div>

        <!-- ===== Buscar actualizaciones ===== -->
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:12px;">
          <div class="list-row" onclick="ProfilePage.checkForUpdates()">
            <div class="list-row-icon" style="background:#1e88e51a;color:#1e88e5;"><i class="fas fa-arrows-rotate" id="update-check-icon"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('checkUpdates')}</div>
              <div class="list-row-value">${t('currentVersion')}: v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0.0'}</div>
            </div>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
        </div>

        <!-- ===== Acerca de la app (incluye línea «Creado en La Habana · 2026») ===== -->
        <div class="section-label"><i class="fas fa-circle-info"></i> ${t('about')}</div>
        <div class="card about-card" style="margin-bottom:12px;">
          <img src="assets/icon.png" alt="Quba" style="width:80px;height:80px;border-radius:22px;margin-bottom:8px;">
          <div class="about-name">Quba — قُبَّة</div>
          <div class="about-version">v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0.0'}</div>
          <div class="about-version" style="opacity:.75;font-size:12px;">${t('mosqueFooterMade') || ''}</div>
          <div class="about-desc" style="line-height:1.9;">${t('tagline')}</div>
        </div>

        <!-- ===== Fuentes del contenido ===== -->
        <div class="section-label"><i class="fas fa-book-open"></i> ${t('contentSources')}</div>
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:12px;">
          ${this._sourceRow('fa-clock', t('sourcePrayerTimes'), 'Aladhan API · Muslim Pro')}
          ${this._sourceRow('fa-book-quran', t('sourceQuran'), 'AlQuran Cloud · Islamic Network · EveryAyah · QuranicAudio')}
          ${this._sourceRow('fa-magnifying-glass', t('sourceTafsir'), t('sourceTafsirDesc'))}
          ${this._sourceRow('fa-volume-high', t('sourceAdhanAudio'), 'Aladhan CDN · IslamCan')}
          ${this._sourceRow('fa-location-dot', t('sourceGeo'), 'OpenStreetMap Nominatim · Open-Meteo')}
        </div>

        <!-- ===== Comunidad: Masjid Abdullah + redes ===== -->
        <div class="section-label"><i class="fas fa-people-group"></i> ${t('communityTitle')}</div>
        <div class="card" style="padding:18px;text-align:center;margin-bottom:12px;">
          <img src="assets/mosque-logo.png" alt="Mezquita Abdullah" class="mosque-footer-logo" loading="lazy">
          <div class="mosque-footer-title">${t('mosqueFooterTitle') || 'Masjid Abdullah'}</div>
          <div class="mosque-footer-desc">${t('mosqueFooterDesc') || ''}</div>
          <div style="margin-top:10px;font-size:13px;line-height:1.9;color:var(--text-secondary);">${t('communityDesc')}</div>
          <div class="social-links" style="margin-top:14px;">
            <a class="social-link social-whatsapp" href="https://whatsapp.com/channel/0029Vb7hD1KKmCPJx0NlLU06" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp — Mezquita Abdullah" title="WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
            <a class="social-link social-instagram" href="https://www.instagram.com/mezquita__abdullah?igsi=MXZjZ2V0anEzZWllag==" target="_blank" rel="noopener noreferrer" aria-label="Instagram — Mezquita Abdullah" title="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
            <a class="social-link social-facebook" href="https://www.facebook.com/share/1CB7kJePhg/" target="_blank" rel="noopener noreferrer" aria-label="Facebook — Mezquita Abdullah" title="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
          </div>
          <div class="mosque-footer-dua" style="margin-top:14px;font-size:13px;line-height:1.9;color:var(--text-secondary);font-style:italic;">${t('mosqueFooterDua') || ''}</div>
        </div>

      </div>
    `;
  },

  // Botón de función con navegación
  _featureBtn(icon, color, label, action) {
    return `
      <button onclick="${action}" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 6px;border:1px solid var(--text-secondary,#ccc3);border-radius:16px;background:transparent;cursor:pointer;color:var(--text);">
        <span style="width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:${color}1a;color:${color};font-size:18px;"><i class="fas fa-${icon}"></i></span>
        <span style="font-size:12px;font-weight:600;">${label}</span>
      </button>`;
  },

  _sourceRow(icon, label, value) {
    return `
      <div class="list-row" style="cursor:default;">
        <div class="list-row-icon"><i class="fas ${icon}"></i></div>
        <div class="list-row-info">
          <div class="list-row-label">${label}</div>
          <div class="list-row-value">${value}</div>
        </div>
      </div>`;
  },

  // Cabecera de sub-página con botón de regreso al hub
  _subHeader(icon, title) {
    return `
      <div style="padding: calc(var(--sp-md) + 8px) var(--sp-md) var(--sp-sm);">
        <div class="list-row" onclick="ProfilePage.render(document.getElementById('main-content'))" style="cursor:pointer;padding:0;">
          <div class="list-row-icon" style="width:38px;height:38px;"><i class="fas fa-arrow-${currentLocale === 'ar' ? 'right' : 'left'}"></i></div>
          <div class="list-row-info">
            <div class="list-row-label" style="font-size:18px;font-weight:800;"><i class="fas fa-${icon}" style="margin-inline-end:6px;opacity:.7;"></i> ${title}</div>
            <div class="list-row-value">${t('back')} · ${t('personalSettings')}</div>
          </div>
        </div>
      </div>`;
  },

  // ================= ROUTER INTERNO DE GRUPOS =================
  renderGroup(group) {
    const fn = {
      prayer:  'renderPrayerGroup',
      adhan:   'renderAdhanGroup',
      general: 'renderGeneralGroup',
      data:    'renderDataGroup',
    }[group];
    const container = document.getElementById('main-content');
    if (container) container.scrollTop = 0;
    if (fn && typeof this[fn] === 'function') this[fn](container);
  },

  // ================= GRUPO: ORACIÓN =================
  renderPrayerGroup(container) {
    const methodName = (typeof CONFIG.methodName === 'function'
      ? CONFIG.methodName(AppState.settings.calculationMethod)
      : CONFIG.CALCULATION_METHODS[AppState.settings.calculationMethod]) || '—';
    const loc = AppState.location || LocationService.getCached();
    const chevron = currentLocale === 'ar' ? 'left' : 'right';

    container.innerHTML = `
      ${this._subHeader('mosque', t('prayerSettings'))}
      <div style="padding: 0 var(--sp-md);">

        <!-- Ubicación y ciudad -->
        <div class="section-label"><i class="fas fa-location-dot"></i> ${t('location')}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="list-row" onclick="ProfilePage.requestLocation()">
            <div class="list-row-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${loc ? (loc.city || t('unknownCity') || 'Desconocido') : t('noLocation') || 'Sin ubicación'}</div>
              <div class="list-row-value">${loc ? ((loc.country || '') + (loc.isDefault ? ' · ' + (t('defaultLocation') || 'por defecto') : '') + (loc.manual ? ' · ' + (t('manual') || 'manual') : '')) : ''}</div>
            </div>
            <i class="fas fa-sync-alt list-row-chevron"></i>
          </div>
          <div class="list-row" onclick="ProfilePage.pickCity()">
            <div class="list-row-icon"><i class="fas fa-city"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('changeCity') || 'Cambiar ciudad'}</div>
              <div class="list-row-value">${t('manualLocation') || 'Ubicación manual'}</div>
            </div>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
        </div>

        <!-- Método de cálculo -->
        <div class="section-label"><i class="fas fa-calculator"></i> ${t('calculationMethod')}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="list-row" onclick="ProfilePage.pickMethod()">
            <div class="list-row-icon"><i class="fas fa-calculator"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('calculationMethod')}</div>
              <div class="list-row-value">${methodName}</div>
            </div>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
        </div>

        <!-- Horario secundario -->
        <div class="section-label"><i class="fas fa-earth-americas"></i> ${t('secondaryTiming')}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="list-row" onclick="ProfilePage.pickSecondaryCity()">
            <div class="list-row-icon"><i class="fas fa-city"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${(() => { const c = DualTiming.getCity(); return c ? escapeHtml(Cities.plainName(c)) : (t('secondaryNone') || 'No configurado'); })()}</div>
              <div class="list-row-value">${(() => { const c = DualTiming.getCity(); return c ? escapeHtml(Cities.plainCountry(c)) : (t('secondaryTimingDesc') || 'Muestra las oraciones de otra ciudad bajo la tabla principal'); })()}</div>
            </div>
            ${DualTiming.getCity() ? `<button class="list-row-btn" onclick="event.stopPropagation(); ProfilePage.removeSecondaryCity()" aria-label="${escapeAttr(t('removeSecondary') || 'Quitar')}"><i class="fas fa-xmark"></i></button>` : ''}
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
          <div style="padding: 0 var(--sp-md) 12px; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
            <i class="fas fa-circle-info"></i> ${t('secondaryTimingDesc')}
          </div>
        </div>

        <!-- Horario de verano / invierno (DST) -->
        <div class="section-label"><i class="fas fa-clock"></i> ${t('timeShift')}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="list-row" onclick="ProfilePage.pickTimeShift()">
            <div class="list-row-icon"><i class="fas fa-${(AppState.settings.timeShift || 'auto') === 'summer' ? 'sun' : ((AppState.settings.timeShift || 'auto') === 'winter' ? 'snowflake' : 'arrows-rotate')}"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('timeShift')}</div>
              <div class="list-row-value">${{
                auto: '<i class="fas fa-arrows-rotate"></i> ' + t('timeShiftAuto'),
                summer: '<i class="fas fa-sun"></i> ' + t('timeShiftSummer'),
                winter: '<i class="fas fa-snowflake"></i> ' + t('timeShiftWinter'),
              }[AppState.settings.timeShift || 'auto']}</div>
            </div>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
          <div style="padding: 0 var(--sp-md) 12px; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
            <i class="fas fa-circle-info"></i> ${t('timeShiftDesc')}
          </div>
        </div>

        <!-- Ajuste manual por oración (±60 min) -->
        ${(() => {
          if (!AppState.settings.prayerOffsets) {
            AppState.settings.prayerOffsets = { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
          }
          const PO = AppState.settings.prayerOffsets;
          const fmt = v => (v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '0') + ' ' + (t('minShort') || 'min');
          const anySet = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'].some(k => (Number(PO[k]) || 0) !== 0);
          const row = (name, icon) => `
          <div class="list-row" style="cursor:default;">
            <div class="list-row-icon"><i class="fas fa-${icon}"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('prayers.' + name)}</div>
              <div class="list-row-value" id="offset-value-${name}">${fmt(Number(PO[name]) || 0)}</div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <button class="list-row-btn" onclick="ProfilePage.adjustOffset('${name}', -1)" aria-label="-1 min" style="width:34px;height:34px;"><i class="fas fa-minus"></i></button>
              <button class="list-row-btn" onclick="ProfilePage.adjustOffset('${name}', 1)" aria-label="+1 min" style="width:34px;height:34px;"><i class="fas fa-plus"></i></button>
            </div>
          </div>`;
          return `
        <div class="section-label"><i class="fas fa-sliders"></i> ${t('prayerAdjust') || 'Ajuste manual de horarios'}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="list-row" onclick="ProfilePage.togglePrayerAdjust()" style="cursor:pointer;">
            <div class="list-row-icon"><i class="fas fa-sliders"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('prayerAdjust') || 'Ajuste manual de horarios'}</div>
              <div class="list-row-value">${anySet ? ('⚠️ ' + (t('prayerAdjustActive') || '')) : (t('prayerAdjustTap') || '')}</div>
            </div>
            <i class="fas fa-chevron-down list-row-chevron prayer-adjust-chevron${this._prayerAdjustOpen ? ' open' : ''}"></i>
          </div>
          <div class="prayer-adjust-body" style="display:${this._prayerAdjustOpen ? 'block' : 'none'};">
          ${row('Fajr', 'cloud-moon')}
          ${row('Sunrise', 'sun')}
          ${row('Dhuhr', 'sun')}
          ${row('Asr', 'cloud-sun')}
          ${row('Maghrib', 'moon')}
          ${row('Isha', 'star-and-crescent')}
          ${anySet ? `
          <div class="list-row" onclick="ProfilePage.resetOffsets()">
            <div class="list-row-icon"><i class="fas fa-rotate-left"></i></div>
            <div class="list-row-info"><div class="list-row-label">${t('prayerAdjustReset') || 'Restablecer ajustes'}</div></div>
          </div>` : ''}
          <div style="padding: 0 var(--sp-md) 12px; font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
            <i class="fas fa-circle-info"></i> ${t('prayerAdjustDesc') || 'Adelanta o retrasa cada oración entre −60 y +60 minutos. Se aplica sobre cualquier método de cálculo y sobre los horarios de Muslim Pro.'}
          </div>
          </div>
        </div>`;
        })()}

      </div>
    `;
  },

  // ================= GRUPO: ADHAN Y NOTIFICACIONES =================
  renderAdhanGroup(container) {
    // Ajustes de adhan (con defaults)
    if (!AppState.settings.adhan) {
      AppState.settings.adhan = {
        voice1: 'makkah',
        voice2: 'madinah',
        volume: 0.8,
        muted: false,
        mode: 'full',
        takbeerDuration: 12,
      };
    } else {
      if (!AppState.settings.adhan.mode) AppState.settings.adhan.mode = 'full';
      if (!AppState.settings.adhan.takbeerDuration) AppState.settings.adhan.takbeerDuration = 12;
    }
    const adhanVoice1 = AdhanService.VOICES.find(v => v.id === AppState.settings.adhan.voice1) || AdhanService.VOICES[0];
    const adhanVoice2 = AdhanService.VOICES.find(v => v.id === AppState.settings.adhan.voice2) || AdhanService.VOICES[1];
    const chevron = currentLocale === 'ar' ? 'left' : 'right';

    container.innerHTML = `
      ${this._subHeader('bullhorn', t('adhanSettings'))}
      <div style="padding: 0 var(--sp-md);">

        <div class="section-label"><i class="fas fa-mosque"></i> ${t('adhanSettings')}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="list-row" onclick="ProfilePage.pickAdhanMode()">
            <div class="list-row-icon"><i class="fas fa-sliders"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('adhanMode') || 'Tipo de adhan'}</div>
              <div class="list-row-value">${AppState.settings.adhan.mode === 'takbeer' ? (t('adhanModeTakbeer') || 'Solo las dos primeras Takbeer') : (t('adhanModeFull') || 'Adhan completo')}</div>
            </div>
            <button class="list-row-btn" onclick="event.stopPropagation(); ProfilePage.previewTakbeer()">
              <i class="fas fa-play"></i>
            </button>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
          <div class="list-row" onclick="ProfilePage.pickAdhanVoice(1)">
            <div class="list-row-icon">1️⃣</div>
            <div class="list-row-info">
              <div class="list-row-label">${t('adhanFirstTakbeer') || 'Primer Takbeer'}</div>
              <div class="list-row-value">${AdhanService.voiceName(adhanVoice1)}</div>
            </div>
            <button class="list-row-btn" onclick="event.stopPropagation(); AdhanService.preview('${adhanVoice1.id}')">
              <i class="fas fa-play"></i>
            </button>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
          <div class="list-row" onclick="ProfilePage.pickAdhanVoice(2)">
            <div class="list-row-icon">2️⃣</div>
            <div class="list-row-info">
              <div class="list-row-label">${t('adhanSecondTakbeer') || 'Segundo Takbeer'}</div>
              <div class="list-row-value">${AdhanService.voiceName(adhanVoice2)}</div>
            </div>
            <button class="list-row-btn" onclick="event.stopPropagation(); AdhanService.preview('${adhanVoice2.id}')">
              <i class="fas fa-play"></i>
            </button>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
          <div class="list-row">
            <div class="list-row-icon"><i class="fas fa-${AppState.settings.adhan.muted ? 'volume-mute' : 'volume-up'}"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('adhanMute') || 'Silenciar Adhan'}</div>
              <div class="list-row-value">${AppState.settings.adhan.muted ? (t('muted') || 'Silenciado') : (t('active') || 'Activo')}</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${AppState.settings.adhan.muted ? 'checked' : ''} onchange="ProfilePage.setAdhanMuted(this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="list-row" style="flex-direction:column;align-items:stretch;">
            <div style="display:flex;align-items:center;gap:14px;">
              <div class="list-row-icon"><i class="fas fa-volume-down"></i></div>
              <div class="list-row-info">
                <div class="list-row-label">${t('adhanVolume') || 'Volumen'}</div>
                <div class="list-row-value" id="volume-value">${Math.round(AppState.settings.adhan.volume * 100)}%</div>
              </div>
            </div>
            <input type="range" min="0" max="100" value="${Math.round(AppState.settings.adhan.volume * 100)}"
              class="volume-slider"
              oninput="ProfilePage.setAdhanVolume(this.value)"
              onchange="ProfilePage.setAdhanVolume(this.value)"
              style="width:100%;margin-top:12px;">
          </div>
        </div>

        <div class="section-label"><i class="fas fa-bell"></i> ${t('notifications')}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="list-row">
            <div class="list-row-icon"><i class="fas fa-bell"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('prayerNotif') || 'Notificaciones de oración'}</div>
              <div class="list-row-value">${(typeof PrayerNotifications !== 'undefined' && PrayerNotifications.isEnabled()) ? (t('active') || 'Activo') : (t('inactive') || 'Inactivo')}</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${(typeof PrayerNotifications !== 'undefined' && PrayerNotifications.isEnabled()) ? 'checked' : ''} onchange="ProfilePage.setPrayerNotifEnabled(this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="list-row">
            <div class="list-row-icon"><i class="fas fa-hourglass-half"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('prayerReminder') || 'Recordatorio antes de la oración'}</div>
              <div class="list-row-value">${(typeof PrayerNotifications !== 'undefined' && PrayerNotifications.isReminderEnabled()) ? (t('active') || 'Activo') : (t('inactive') || 'Inactivo')} · ${t('reminderHint') || '15 minutos antes'}</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${(typeof PrayerNotifications !== 'undefined' && PrayerNotifications.isReminderEnabled()) ? 'checked' : ''} onchange="ProfilePage.setPrayerReminderEnabled(this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- v55: إعدادات مركز الإشعارات — كل ميزة بمفتاح مستقل -->
        <div class="section-label"><i class="fas fa-bell"></i> ${t('ncSection') || 'المزيد من الإشعارات'}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          ${this._ncRow('adhanAlert', 'mosque', t('ncAdhanAlert') || 'بطاقة تنبيه الأذان', t('ncAdhanAlertDesc') || 'حديث مناسب للصلاة + زر إيقاف الأذان + تذكير بعد ١٥ دقيقة')}
          ${this._ncRow('snooze', 'hourglass-half', t('ncSnooze') || 'زر «تذكير بعد ١٥ دقيقة» (هل صليت؟)', '')}
          ${this._ncRow('salawat', 'heart', t('ncSalawat') || 'الصلاة على النبي ﷺ', t('ncSalawatDesc') || 'كل ٣ ساعات من ٩ صباحاً إلى ٩ مساءً، مع صوت')}
          ${this._ncRow('salawatVoice', 'microphone', t('ncSalawatVoice') || 'نطق الصلاة على النبي صوتياً', '')}
          ${this._ncRow('duaMorning', 'sun', t('ncDuaMorning') || 'دعاء الصباح (٧:٠٠ صباحاً)', '')}
          ${this._ncRow('duaEvening', 'moon', t('ncDuaEvening') || 'دعاء المساء (٧:٠٠ مساءً)', '')}
          ${this._ncRow('persistent', 'thumbtack', t('ncPersistent') || 'إشعار ثابت بالصلاة القادمة والوقت المتبقي', '')}
          ${this._ncRow('flipToStop', 'mobile-screen', t('ncStopFlip') || 'إيقاف الأذان عند قلب الهاتف', '')}
          ${this._ncRow('volumeToStop', 'volume-low', t('ncStopVolume') || 'إيقاف الأذان بأزرار الصوت', '')}
          ${this._ncRow('powerToStop', 'power-off', t('ncStopPower') || 'إيقاف الأذان بزر التشغيل (إطفاء الشاشة)', '')}
        </div>

      </div>
    `;
  },

  // v55: صف مفتاح تفعيل لميزة من مركز الإشعارات
  _ncRow(key, icon, label, desc) {
    const on = (typeof NotifCenter !== 'undefined') ? NotifCenter.isOn(key) : false;
    return `
      <div class="list-row">
        <div class="list-row-icon"><i class="fas fa-${icon}"></i></div>
        <div class="list-row-info">
          <div class="list-row-label">${label}</div>
          ${desc ? `<div class="list-row-value">${desc}</div>` : ''}
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${on ? 'checked' : ''} onchange="ProfilePage.setNotifCenter('${key}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>`;
  },

  // ================= GRUPO: GENERAL =================
  renderGeneralGroup(container) {
    const langLabel = { es: '🇪🇸 Español', ar: '🇸🇦 العربية', en: '🇬🇧 English' }[AppState.settings.locale];
    const themeLabel = {
      light: '<i class="fas fa-sun"></i> ' + t('themeLight'),
      dark: '<i class="fas fa-moon"></i> ' + t('themeDark'),
      auto: '<i class="fas fa-arrows-rotate"></i> ' + t('themeAuto'),
      maroon: '<i class="fas fa-crown"></i> ' + t('themeMaroon'),
      brown: '<i class="fas fa-mug-hot"></i> ' + t('themeBrown'),
      emerald: '<i class="fas fa-mosque"></i> ' + t('themeEmerald'),
    }[AppState.settings.theme];
    const chevron = currentLocale === 'ar' ? 'left' : 'right';

    container.innerHTML = `
      ${this._subHeader('palette', t('generalSettings'))}
      <div style="padding: 0 var(--sp-md);">

        <!-- Nombre del usuario (para certificados) -->
        <div class="section-label"><i class="fas fa-user"></i> ${t('yourName') || 'Tu nombre'}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="list-row" onclick="ProfilePage.editUserName()">
            <div class="list-row-icon"><i class="fas fa-user-edit"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('displayName') || 'Nombre para mostrar'}</div>
              <div class="list-row-value">${AppState.settings.userName ? escapeHtml(AppState.settings.userName) : (t('nameHint') || 'Aparecerá en tus certificados')}</div>
            </div>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
        </div>

        <div class="section-label"><i class="fas fa-gear"></i> ${t('settings')}</div>
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="list-row" onclick="ProfilePage.pickLanguage()">
            <div class="list-row-icon"><i class="fas fa-language"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('language')}</div>
              <div class="list-row-value">${langLabel}</div>
            </div>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>

          <div class="list-row" onclick="ProfilePage.pickTheme()">
            <div class="list-row-icon"><i class="fas fa-adjust"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('theme')}</div>
              <div class="list-row-value">${themeLabel}</div>
            </div>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
        </div>

      </div>
    `;
  },

  // ================= GRUPO: DATOS Y PROGRESO =================
  renderDataGroup(container) {
    const chevron = currentLocale === 'ar' ? 'left' : 'right';
    container.innerHTML = `
      ${this._subHeader('database', t('dataZone'))}
      <div style="padding: 0 var(--sp-md);">
        <div class="section-label"><i class="fas fa-database"></i> ${t('dataZone')}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          <div class="list-row" onclick="ProfilePage.exportData()">
            <div class="list-row-icon"><i class="fas fa-download"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('exportData') || 'Exportar datos'}</div>
              <div class="list-row-value">${t('exportDataDesc') || 'Guardar copia local (JSON)'}</div>
            </div>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
          <div class="list-row list-row-danger" onclick="ProfilePage.confirmResetProgress()">
            <div class="list-row-icon" style="background:#fee;color:#c33;"><i class="fas fa-redo"></i></div>
            <div class="list-row-info">
              <div class="list-row-label" style="color:#c33;">${t('resetProgress') || 'Reiniciar progreso'}</div>
              <div class="list-row-value">${t('resetProgressDesc') || 'Borrar XP, marcadores y ajustes'}</div>
            </div>
            <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
          </div>
        </div>
      </div>
    `;
  },

  // ================= BUSCAR ACTUALIZACIONES =================
  async checkForUpdates() {
    const icon = document.getElementById('update-check-icon');
    if (icon) icon.classList.add('fa-spin');
    showToast(t('checkingUpdates'), 2000);
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          await new Promise(r => setTimeout(r, 1500));
          if (reg.waiting) {
            showToast('⬇️ ' + t('updateReady'), 2500);
            if (icon) icon.classList.remove('fa-spin');
            return;
          }
        }
      }
      showToast('✔️ ' + t('noUpdates'), 2500);
    } catch (e) {
      showToast('✔️ ' + t('noUpdates'), 2500);
    } finally {
      if (icon) icon.classList.remove('fa-spin');
    }
  },

  // ============ USER NAME (para certificados) ============
  editUserName() {
    const current = AppState.settings.userName || '';
    const lang = currentLocale === 'ar' ? 'ar' : (currentLocale === 'en' ? 'en' : 'es');
    const labels = {
      es: { title: 'Tu nombre', hint: 'Aparecerá en tus certificados de cursos', placeholder: 'Ej: Ahmad Al-Sayyid', save: 'Guardar', cancel: 'Cancelar' },
      ar: { title: 'اسمك',        hint: 'سيظهر في شهادات إنجاز الدورات',        placeholder: 'مثال: أحمد السيد',    save: 'حفظ',      cancel: 'إلغاء' },
      en: { title: 'Your name',   hint: 'Will appear on your course certificates', placeholder: 'e.g. Ahmad Al-Sayyid', save: 'Save',     cancel: 'Cancel' },
    };
    const L = labels[lang];
    const html = `
      <div class="modal-header">
        <div class="modal-title"><i class="fas fa-user"></i> ${L.title}</div>
        <button class="modal-close" onclick="closeModal()" aria-label="${L.cancel}">×</button>
      </div>
      <div style="padding: 8px 4px 4px;">
        <div style="color:var(--text-secondary);font-size:13px;margin-bottom:12px;">${L.hint}</div>
        <input type="text" id="user-name-input" value="${escapeAttr(current)}" placeholder="${escapeAttr(L.placeholder)}" maxlength="60"
               style="width:100%;padding:12px 14px;border:2px solid #D4AF37;border-radius:12px;font-size:16px;background:var(--card);color:var(--text);">
        <div style="display:flex;gap:10px;margin-top:16px;">
          <button class="btn-secondary" style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--text-secondary);background:transparent;color:var(--text);cursor:pointer;" onclick="closeModal()">${L.cancel}</button>
          <button class="btn-primary" style="flex:2;padding:12px;" onclick="ProfilePage.saveUserName()">${L.save}</button>
        </div>
      </div>
    `;
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(() => {
      const inp = document.getElementById('user-name-input');
      if (inp) { inp.focus(); inp.select(); }
    }, 100);
    const inp = document.getElementById('user-name-input');
    if (inp) inp.addEventListener('keypress', e => { if (e.key === 'Enter') ProfilePage.saveUserName(); });
  },

  saveUserName() {
    const inp = document.getElementById('user-name-input');
    if (!inp) return;
    const val = inp.value.trim().slice(0, 60);
    AppState.settings.userName = val;
    Storage.saveSettings();
    closeModal();
    showToast((t('nameSaved') || 'Nombre guardado'), 1500);
    this.renderGroup('general');
  },

  // ============ LOCATION ============
  async requestLocation() {
    showToast((t('requestingLocation') || 'Solicitando ubicación...'), 1500);
    const coords = await LocationService.requestPermission();
    if (coords) {
      AppState.location = coords;
      AppState.timings = null; // Invalidate prayer cache
      this.renderGroup('prayer');
    }
  },

  // Selector de ciudad principal con la lista ampliada (Cities) y buscador
  pickCity() {
    Cities.openPicker({
      title: t('changeCity') || 'Cambiar ciudad',
      currentId: null,
      onGps: async () => {
        if (typeof LocationService === 'undefined') return;
        const coords = await LocationService.requestPermission();
        if (!coords) return;
        if (typeof Storage !== 'undefined' && Storage.clearPrayerCache) {
          Storage.clearPrayerCache();
        }
        AppState.location = coords;
        AppState.timings = null;
        const container = document.getElementById('main-content');
        const cur = (typeof Router !== 'undefined' && Router.current) ? Router.current.name : 'profile';
        if (cur === 'home' && typeof HomePage !== 'undefined') {
          HomePage.render(container);
        } else if (cur !== 'profile' && Router.current && Router.current.route) {
          const r = Router.current.route;
          const m = r.method || 'render';
          if (typeof r.page[m] === 'function') r.page[m](container, Router.current.params || {});
        } else {
          this.renderGroup('prayer');
        }
      },
      onSelect: async (city) => {
        LocationService.setManual(city.lat, city.lon, Cities.plainName(city), Cities.plainCountry(city));
        if (typeof Storage !== 'undefined' && Storage.clearPrayerCache) {
          Storage.clearPrayerCache();
        }
        AppState.timings = null;
        showToast(Cities.label(city), 2000);
        const container = document.getElementById('main-content');
        const cur = (typeof Router !== 'undefined' && Router.current) ? Router.current.name : 'profile';
        if (cur !== 'profile' && typeof HomePage !== 'undefined' && cur === 'home') {
          HomePage.render(container);
        } else if (cur !== 'profile' && Router.current && Router.current.route) {
          const r = Router.current.route;
          const m = r.method || 'render';
          if (typeof r.page[m] === 'function') r.page[m](container, Router.current.params || {});
        } else {
          this.renderGroup('prayer');
        }
      },
    });
  },

  // ============ HORARIO SECUNDARIO (franja del inicio) ============
  pickSecondaryCity() {
    DualTiming.openPicker();
  },

  removeSecondaryCity() {
    DualTiming.remove();
    this.renderGroup('prayer');
  },

  // ============ LANGUAGE / THEME / METHOD ============
  pickLanguage() {
    const options = [
      { id: 'es', label: '🇪🇸 Español' },
      { id: 'ar', label: '🇸🇦 العربية' },
      { id: 'en', label: '🇬🇧 English' },
    ];
    showModal(t('language'), options, AppState.settings.locale, id => {
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
      this.renderGroup('general');
      showToast(t('settings'));
    });
  },

  pickTheme() {
    const options = [
      { id: 'light', label: '<i class="fas fa-sun"></i> ' + t('themeLight') },
      { id: 'dark', label: '<i class="fas fa-moon"></i> ' + t('themeDark') },
      { id: 'emerald', label: '<i class="fas fa-mosque"></i> ' + t('themeEmerald') },
      { id: 'maroon', label: '<i class="fas fa-crown"></i> ' + t('themeMaroon') },
      { id: 'brown', label: '<i class="fas fa-mug-hot"></i> ' + t('themeBrown') },
      { id: 'auto', label: '<i class="fas fa-arrows-rotate"></i> ' + t('themeAuto') },
    ];
    showModal(t('theme'), options, AppState.settings.theme, id => {
      AppState.settings.theme = id;
      Storage.saveSettings();
      applyTheme();
      this.renderGroup('general');
    });
  },

  pickMethod() {
    const options = Object.keys(CONFIG.CALCULATION_METHODS).map(id => ({
      id: parseInt(id, 10),
      label: (typeof CONFIG.methodName === 'function' ? CONFIG.methodName(id) : CONFIG.CALCULATION_METHODS[id]),
    }));
    showModal(t('calculationMethod'), options, AppState.settings.calculationMethod, id => {
      AppState.settings.calculationMethod = id;
      AppState.settings._calcMethodManual = true; // no pisar la elección del usuario
      Storage.saveSettings();
      AppState.timings = null;
      this.renderGroup('prayer');
      showToast(t('settings'));
    });
  },

  // Selector de ajuste horario (verano/invierno). Al cambiarlo se invalida la
  // caché de horarios en memoria y se reprograman las alarmas (adhan/recordatorios).
  pickTimeShift() {
    const options = [
      { id: 'auto',   label: '<i class="fas fa-arrows-rotate"></i> ' + t('timeShiftAuto') },
      { id: 'summer', label: '<i class="fas fa-sun"></i> ' + t('timeShiftSummer') },
      { id: 'winter', label: '<i class="fas fa-snowflake"></i> ' + t('timeShiftWinter') },
    ];
    showModal(t('timeShift'), options, AppState.settings.timeShift || 'auto', id => {
      AppState.settings.timeShift = id;
      Storage.saveSettings();
      AppState.timings = null; // forzar recálculo con el nuevo desplazamiento
      if (typeof PrayerNotifications !== 'undefined' &&
          (PrayerNotifications.isEnabled() || PrayerNotifications.isReminderEnabled()) &&
          typeof API !== 'undefined' && AppState.location) {
        API.getPrayerTimes(AppState.location.latitude, AppState.location.longitude,
          new Date(), AppState.settings.calculationMethod)
          .then(r => {
            if (r && r.timings) {
              AppState.timings = r.timings;
              PrayerNotifications.scheduleDay(r.timings, AppState.settings.locale || 'es');
            }
          }).catch(() => {});
      }
      this.renderGroup('prayer');
      showToast(
        id === 'summer' ? '☀️ ' + t('timeShiftSummerApplied')
        : id === 'winter' ? '❄️ ' + t('timeShiftWinterApplied')
        : '✔️ ' + t('timeShiftAuto'), 2200);
    });
  },

  // Ajuste manual por oración — botones −1/+1 minuto, límite ±60.
  adjustOffset(name, delta) {
    if (!['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(name)) return;
    if (!AppState.settings.prayerOffsets) {
      AppState.settings.prayerOffsets = { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    }
    const cur = Math.round(Number(AppState.settings.prayerOffsets[name]) || 0);
    const next = Math.max(-60, Math.min(60, cur + delta));
    if (next === cur) return; // ya está en el límite ±60
    AppState.settings.prayerOffsets[name] = next;
    this._afterOffsetsChanged(next === 0 ? '0 ' + (t('minShort') || 'min') : null);
  },

  // Pliega/despliega el bloque de ajuste manual por oración
  togglePrayerAdjust() {
    this._prayerAdjustOpen = !this._prayerAdjustOpen;
    const body = document.querySelector('.prayer-adjust-body');
    if (body) body.style.display = this._prayerAdjustOpen ? 'block' : 'none';
    const chev = document.querySelector('.prayer-adjust-chevron');
    if (chev) chev.classList.toggle('open', !!this._prayerAdjustOpen);
  },

  resetOffsets() {
    AppState.settings.prayerOffsets = { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    this._afterOffsetsChanged();
  },

  // Persiste, invalida horarios en memoria y reprograma las alarmas del día.
  _afterOffsetsChanged() {
    Storage.saveSettings();
    AppState.timings = null;
    if (typeof PrayerNotifications !== 'undefined' &&
        (PrayerNotifications.isEnabled() || PrayerNotifications.isReminderEnabled()) &&
        typeof API !== 'undefined' && AppState.location) {
      API.getPrayerTimes(AppState.location.latitude, AppState.location.longitude,
        new Date(), AppState.settings.calculationMethod)
        .then(r => {
          if (r && r.timings) {
            AppState.timings = r.timings;
            PrayerNotifications.scheduleDay(r.timings, AppState.settings.locale || 'es');
          }
        }).catch(() => {});
    }
    this.renderGroup('prayer');
    showToast('✔️ ' + (t('prayerAdjustSaved') || 'Ajuste guardado'), 1500);
  },

  // ============ ADHAN ============
  pickAdhanVoice(takbeerNum) {
    const options = AdhanService.VOICES.map(v => ({
      id: v.id,
      label: `${v.flag || '<i class="fas fa-mosque"></i>'} ${AdhanService.voiceName(v)} · ${AdhanService.voiceCountry(v)}`,
    }));
    const currentId = takbeerNum === 1 ? AppState.settings.adhan.voice1 : AppState.settings.adhan.voice2;
    const title = takbeerNum === 1
      ? (t('adhanFirstTakbeer') || 'Primer Takbeer')
      : (t('adhanSecondTakbeer') || 'Segundo Takbeer');
    showModal(title, options, currentId, id => {
      if (takbeerNum === 1) AppState.settings.adhan.voice1 = id;
      else AppState.settings.adhan.voice2 = id;
      Storage.saveSettings();
      this.renderGroup('adhan');
      AdhanService.preview(id);
    });
  },

  // Selector de modo del adhan (completo / solo 2 primeras takbeer)
  pickAdhanMode() {
    const options = [
      { id: 'full',    label: '🕌 ' + (t('adhanModeFull') || 'Adhan completo') },
      { id: 'takbeer', label: '⏩ ' + (t('adhanModeTakbeer') || 'Solo las dos primeras Takbeer') },
    ];
    showModal(t('adhanMode') || 'Tipo de adhan', options, AppState.settings.adhan.mode, id => {
      AppState.settings.adhan.mode = id;
      Storage.saveSettings();
      this.renderGroup('adhan');
      if (id === 'takbeer') this.previewTakbeer();
    });
  },

  // Vista previa del modo «solo las dos primeras takbeer» (1ª voz con corte)
  previewTakbeer() {
    if (typeof AdhanService === 'undefined') return;
    const s = AppState.settings.adhan;
    const voice = AdhanService.VOICES.find(v => v.id === s.voice1) || AdhanService.VOICES[0];
    AdhanService.stopPreview();
    const wasMuted = s.muted;
    s.muted = false;
    AdhanService._playVoice(voice, s.volume, null, (s.takbeerDuration || 12) * 1000)
      .finally(() => { s.muted = wasMuted; });
    showToast('🔊 ' + (t('adhanModeTakbeer') || 'Solo las dos primeras Takbeer'), 2000);
  },

  // Interruptores con estado explícito (checked)
  setAdhanMuted(checked) {
    AppState.settings.adhan.muted = !!checked;
    if (checked && typeof AdhanService !== 'undefined') AdhanService.stop();
    Storage.saveSettings();
    this.renderGroup('adhan');
    showToast(checked
      ? '<i class="fas fa-volume-xmark"></i> ' + (t('adhanMuted') || 'Adhan silenciado')
      : '<i class="fas fa-volume-high"></i> ' + (t('adhanUnmuted') || 'Adhan activo'), 1500);
  },

  setAdhanVolume(val) {
    const v = Math.max(0, Math.min(100, parseInt(val, 10))) / 100;
    AppState.settings.adhan.volume = v;
    Storage.saveSettings();
    const el = document.getElementById('volume-value');
    if (el) el.textContent = Math.round(v * 100) + '%';
    AdhanService.setVolume(v);
  },

  exportData() {
    try {
      const data = { version: (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0.0'), exportedAt: new Date().toISOString(), storage: {} };
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('quba_')) data.storage[k] = localStorage.getItem(k);
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quba-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
      showToast(t('exportOk') || 'Backup descargado');
    } catch(e) {
      showToast(t('error') + ': '+ e.message);
    }
  },

  confirmResetProgress() {
    const msg = t('confirmReset') || '¿Borrar TODO tu progreso (XP, marcadores, ajustes, caché)? Esta acción no se puede deshacer.';
    if (!confirm(msg)) return;
    const confirmText = t('resetTypeConfirm') || 'BORRAR';
    const input = prompt((t('resetTypeQuestion') || 'Escribe') + ` "${confirmText}" ` + (t('resetTypeToConfirm') || 'para confirmar:'));
    if (input !== confirmText) {
      showToast(t('resetCancelled') || 'Cancelado');
      return;
    }
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('quba_')) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    if (typeof CacheDB !== 'undefined') {
      CacheDB.clear().catch(() => {});
    }
    showToast(t('resetOk') || 'Progreso reiniciado. Recargando...');
    setTimeout(() => location.reload(), 1500);
  },

  async setPrayerNotifEnabled(checked) {
    if (typeof PrayerNotifications === 'undefined') return;
    if (!checked) {
      PrayerNotifications.disable();
    } else {
      const ok = await PrayerNotifications.enable();
      if (ok && AppState.timings) {
        PrayerNotifications.scheduleDay(AppState.timings, AppState.settings.locale || 'es');
      }
    }
    this.renderGroup('adhan');
  },

  // Interruptor del recordatorio «اقتربت صلاة الظهر» (15 min antes)
  async setPrayerReminderEnabled(checked) {
    if (typeof PrayerNotifications === 'undefined') return;
    if (!checked) {
      PrayerNotifications.disableReminder();
    } else {
      const ok = await PrayerNotifications.enableReminder();
      if (ok && AppState.timings) {
        PrayerNotifications.scheduleDay(AppState.timings, AppState.settings.locale || 'es');
      }
    }
    this.renderGroup('adhan');
  },

  // v55: مفاتيح مركز الإشعارات (تفعيل/إيقاف لكل ميزة)
  async setNotifCenter(key, checked) {
    if (typeof NotifCenter === 'undefined') return;
    if (checked) await NotifCenter.ensurePermission().catch(() => {});
    NotifCenter.set(key, checked);
    showToast('✅ ' + (t('ncSaved') || 'تم حفظ إعدادات الإشعارات'), 1500);
  },

  cleanup() {
    AdhanService.stopPreview();
  },
};
