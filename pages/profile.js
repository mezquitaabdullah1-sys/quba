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

        ${groupCard('palette', '#6a5acd', t('generalSettings'), t('generalSettingsDesc'), "ProfilePage.renderGroup('general')")}
        ${groupCard('mosque', '#2e8b57', t('prayerSettings'), t('prayerSettingsDesc'), "ProfilePage.renderGroup('prayer')")}
        ${groupCard('bullhorn', '#b8860b', t('adhanSettings'), t('adhanGroupDesc'), "ProfilePage.renderGroup('adhan')")}
        ${groupCard('database', '#c0392b', t('dataZone'), t('dataZoneGroupDesc'), "ProfilePage.renderGroup('data')")}
        ${window.Android ? groupCard('shield-halved', '#0f4c3a', (t('permSettings') || 'الأذونات والصلاحيات'), (t('permSettingsDesc') || 'الإشعارات والموقع والمنبّهات الدقيقة'), "ProfilePage.renderPermsGroup(document.getElementById('main-content'))") : ''}

        <!-- v1.0.70: بطاقة «الأذان لا يصل في وقته؟» ← لوحة الحالة والخطوات -->
        ${window.Android && typeof PermGuide !== 'undefined' ? PermGuide.card() : ''}

        <!-- ===== Funciones de la app ===== -->
        <div class="section-label"><i class="fas fa-grip"></i> ${t('appFeatures')}</div>
        <div class="card" style="padding:12px;margin-bottom:12px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px;">
            ${this._featureBtn('book-quran', '#2e8b57', t('tabQuran'), "Router.go('quran')")}
            ${this._featureBtn('compass', '#1e88e5', t('quickQibla'), "Router.go('prayer',{tab:'qibla'})")}
            ${this._featureBtn('calendar-days', '#c0392b', t('quickCalendar'), "Router.go('calendar')")}
            ${this._featureBtn('tower-broadcast', '#8e44ad', t('quickRadio'), "Router.go('radio')")}
            ${this._featureBtn('book', '#b8860b', t('quickLibrary'), "Router.go('wisdom/library')")}
            ${this._featureBtn('circle-nodes', '#0f9b8e', t('quickTasbih'), "Router.go('wisdom/tasbih')")}
            ${this._featureBtn('circle-play', '#d35400', t('quickClips'), "Router.go('videos')")}
            ${this._featureBtn('hands-praying', '#7b5ea7', t('quickDuas'), "Router.go('wisdom/duas')")}
            ${this._featureBtn('graduation-cap', '#2e6da4', t('quickCourses'), "Router.go('wisdom/courses')")}
            ${this._featureBtn('mosque', '#1f7a5a', t('tabPrayer'), "Router.go('prayer')")}
            ${this._featureBtn('lightbulb', '#c9a227', t('tabWisdom'), "Router.go('wisdom')")}
            ${this._featureBtn('list-check', '#0f7a6a', 'يومي', "Router.go('daily')")}
            ${this._featureBtn('layer-group', '#5a6b7b', t('allFeatures') || '', "Router.go('features')")}
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
          <!-- v122: خانة واحدة للموقع — GPS أو بحث عن مدينة من نفس النافذة -->
          <div class="list-row" onclick="ProfilePage.pickCity()">
            <div class="list-row-icon"><i class="fas fa-location-crosshairs"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${loc ? escapeHtml(loc.city || t('unknownCity') || '') : (t('noLocation') || '')}</div>
              <div class="list-row-value">${loc ? [loc.country || '', (loc.manual ? (t('modeManual') || 'يدوي') : (t('modeGps') || 'GPS تلقائي'))].filter(Boolean).join(' · ') : (t('chooseCityOrLocation') || '')}</div>
              <div class="list-row-value" style="opacity:.7;">${t('locationOneField') || ''}</div>
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
    AdhanService.normalizeSettings();
    const A = AdhanService.getSettings();
    const adhanVoice = AdhanService._resolveVoice(A.voice, false);
    const adhanFajrVoice = AdhanService._resolveVoice(A.fajrVoice, true);
    const chevron = currentLocale === 'ar' ? 'left' : 'right';
    const PN = (typeof PrayerNotifications !== 'undefined') ? PrayerNotifications : null;
    const alertsOn = PN ? PN.isEnabled() : true;
    const remindOn = PN ? PN.isReminderEnabled() : true;
    const iq = AdhanService.iqamaSettings();
    const custom = AdhanService.customItems();

    const toggleRow = (icon, label, desc, on, handler, attr) => `
      <div class="list-row">
        <div class="list-row-icon"><i class="fas fa-${icon}"></i></div>
        <div class="list-row-info">
          <div class="list-row-label">${label}</div>
          ${desc ? `<div class="list-row-value">${desc}</div>` : ''}
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${attr || ''} ${on ? 'checked' : ''} onchange="${handler}">
          <span class="toggle-slider"></span>
        </label>
      </div>`;

    // ---------- 1) الأذان ----------
    const adhanBody = `
      <div class="list-row" onclick="ProfilePage.pickAdhanVoice()">
        <div class="list-row-icon">🕌</div>
        <div class="list-row-info">
          <div class="list-row-label">${t('adhanChoose') || 'اختيار الأذان'}</div>
          <div class="list-row-value">${AdhanService.voiceName(adhanVoice)}</div>
          <div class="list-row-value" style="opacity:.72;">${t('adhanChooseDesc') || ''}</div>
        </div>
        <button class="list-row-btn" onclick="event.stopPropagation(); AdhanService.preview('${adhanVoice.id}')"><i class="fas fa-play"></i></button>
        <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
      </div>
      <div class="list-row" onclick="ProfilePage.pickAdhanFajrVoice()">
        <div class="list-row-icon">🌅</div>
        <div class="list-row-info">
          <div class="list-row-label">${t('adhanFajrVoice') || 'أذان الفجر'}</div>
          <div class="list-row-value">${AdhanService.voiceName(adhanFajrVoice)}</div>
          <div class="list-row-value" style="opacity:.72;">${t('adhanFajrVoiceDesc') || ''}</div>
        </div>
        <button class="list-row-btn" onclick="event.stopPropagation(); AdhanService.preview('${adhanFajrVoice.id}')"><i class="fas fa-play"></i></button>
        <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
      </div>
      <div class="list-row" style="flex-direction:column;align-items:stretch;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="list-row-icon">📁</div>
          <div class="list-row-info">
            <div class="list-row-label">${t('myAdhans') || 'أذانات من الملفات'}</div>
            <div class="list-row-value">${t('myAdhansDesc') || ''}</div>
          </div>
        </div>
        ${custom.length ? `<div class="my-adhan-list">
          ${custom.map(i => `<div class="my-adhan-item">
            <span class="my-adhan-badge">${i.type === 'fajr' ? '🌅' : '🕌'}</span>
            <span class="my-adhan-name">${escapeHtml(i.name || i.id)}</span>
            <button class="list-row-btn" onclick="event.stopPropagation(); AdhanService.preview('${i.id}')"><i class="fas fa-play"></i></button>
            <button class="list-row-btn" onclick="event.stopPropagation(); ProfilePage.deleteMyAdhan('${i.id}')"><i class="fas fa-trash"></i></button>
          </div>`).join('')}
        </div>` : `<div class="list-row-value" style="opacity:.7;padding-top:6px;">${t('noMyAdhans') || ''}</div>`}
        <div class="my-adhan-add">
          <button class="btn-soft" onclick="event.stopPropagation(); ProfilePage.addMyAdhan(false)">➕ ${t('addAdhanRegular') || 'أذان عادي'}</button>
          <button class="btn-soft" onclick="event.stopPropagation(); ProfilePage.addMyAdhan(true)">➕ ${t('addAdhanFajr') || 'أذان فجر'}</button>
        </div>
      </div>
      <div class="list-row" style="flex-direction:column;align-items:stretch;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="list-row-icon"><i class="fas fa-volume-down"></i></div>
          <div class="list-row-info">
            <div class="list-row-label">${t('adhanVolumeStrength') || 'شدة صوت الأذان'}</div>
            <div class="list-row-value" id="volume-value">${Math.round(A.volume * 100)}%</div>
          </div>
        </div>
        <input type="range" min="0" max="100" value="${Math.round(A.volume * 100)}" class="volume-slider"
          oninput="ProfilePage.setAdhanVolume(this.value)" onchange="ProfilePage.setAdhanVolume(this.value)"
          style="width:100%;margin-top:12px;">
      </div>
      ${toggleRow('hands-praying', t('duaAfterAdhan') || 'دعاء بعد الأذان', t('duaAfterAdhanDesc') || '', A.duaAfterAdhan, 'ProfilePage.setDuaAfterAdhan(this.checked)')}
      <div class="list-row" style="flex-direction:column;align-items:stretch;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="list-row-icon"><i class="fas fa-bell-concierge"></i></div>
          <div class="list-row-info">
            <div class="list-row-label">${t('perPrayerSound') || 'صوت كل صلاة على حدة'}</div>
            <div class="list-row-value">${t('perPrayerSoundDesc') || ''}</div>
          </div>
        </div>
        <div class="prayer-bells-row">
          ${['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(pn => {
            const on = PN && PN.isPrayerOn ? PN.isPrayerOn(pn) : true;
            return `<button class="prayer-bell ${on ? '' : 'off'}" data-prayer-bell="${pn}" aria-pressed="${on}" onclick="ProfilePage.toggleBellNotif('${pn}')"><i class="fas ${on ? 'fa-bell' : 'fa-bell-slash'}"></i><span class="pb-name">${t('prayers.' + pn)}</span></button>`;
          }).join('')}
        </div>
      </div>
      ${this._ncRow('snooze', 'clock-rotate-left', t('didYouPrayBtn') || 'تذكير: هل صليت؟', t('didYouPrayBtnDesc') || '')}
    `;

    // ---------- 2) الإقامة ----------
    const iqamaBody = `
      ${toggleRow('person-praying', t('iqamaToggle') || 'إشعار الإقامة', t('iqamaToggleDesc') || '', iq.enabled, 'ProfilePage.setIqamaEnabled(this.checked)')}
      <div class="list-row" style="flex-direction:column;align-items:stretch;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="list-row-icon"><i class="fas fa-hourglass-half"></i></div>
          <div class="list-row-info">
            <div class="list-row-label">${t('iqamaMinutes') || 'الدقائق بين الأذان والإقامة'}</div>
            <div class="list-row-value">${t('iqamaMinutesDesc') || ''}</div>
          </div>
        </div>
        <div class="iqama-grid">
          ${['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(pn => {
            const mins = iq.minutes[pn] || 0;
            return `<div class="iqama-cell">
              <div class="iqama-cell-name">${t('prayers.' + pn)}</div>
              <div class="iqama-stepper">
                <button onclick="event.stopPropagation(); ProfilePage.stepIqama('${pn}',-5)">−</button>
                <span>${mins}</span>
                <button onclick="event.stopPropagation(); ProfilePage.stepIqama('${pn}',5)">+</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;

    // ---------- 3) الإشعارات الدقيقة ----------
    const salawatBlock = `<details class="acc acc2">
      <summary><span class="acc-ico">🌹</span><span class="acc-title">${t('ncSalawat') || 'إشعارات الصلاة على النبي'}</span><i class="fas fa-chevron-down acc-chev"></i></summary>
      <div class="acc-body">
        ${this._ncRow('salawat', 'heart', t('ncEnable') || 'تفعيل', t('ncSalawatDesc') || '')}
        ${this._salawatFreqRow()}
        ${this._ncRow('salawatVoice', 'microphone', t('ncSalawatVoice') || 'نطق صوتي', '')}
      </div>
    </details>`;
    const adhkarBlock = `<details class="acc acc2">
      <summary><span class="acc-ico">📖</span><span class="acc-title">${t('ncAdhkarGroup') || 'إشعارات الأذكار'}</span><i class="fas fa-chevron-down acc-chev"></i></summary>
      <div class="acc-body">
        ${this._ncRow('adhkar', 'book-open', t('ncEnable') || 'تفعيل', t('ncAdhkarDesc') || '')}
        ${this._ncRow('duaMorning', 'sun', t('ncDuaMorning') || 'دعاء الصباح', '')}
        ${this._ncRow('duaEvening', 'moon', t('ncDuaEvening') || 'دعاء المساء', '')}
      </div>
    </details>`;
    const stopBlock = `<details class="acc acc2">
      <summary><span class="acc-ico">🔇</span><span class="acc-title">${t('ncStopGroup') || 'إشعارات إيقاف الأذان'}</span><i class="fas fa-chevron-down acc-chev"></i></summary>
      <div class="acc-body">
        ${this._ncRow('flipToStop', 'mobile-screen', t('ncStopFlip') || 'إيقاف الأذان بقلب الهاتف', '')}
        ${this._ncRow('powerToStop', 'power-off', t('ncStopPower') || 'إيقاف الأذان بزر التشغيل', '')}
      </div>
    </details>`;

    const denied = (typeof Notification !== 'undefined' && Notification.permission === 'denied');
    container.innerHTML = `
      ${this._subHeader('bell-concierge', t('adhanSettings') || 'الأذان والإشعارات')}
      <div style="padding: 0 var(--sp-md);">

        <div class="section-label"><i class="fas fa-bell"></i> ${t('mainAlerts') || 'التنبيهات الرئيسية'}</div>
        <div class="card" style="padding:0;overflow:hidden;">
          ${toggleRow('bell', t('adhanAlertToggle') || 'تنبيه الأذان', t('adhanAlertToggleDesc') || '', alertsOn, 'ProfilePage.setPrayerNotifEnabled(this.checked)', 'data-alert="adhan"')}
          ${toggleRow('hourglass-half', t('prePrayerAlert') || 'تنبيه قبل الصلاة', t('prePrayerAlertDesc') || '', remindOn, 'ProfilePage.setPrayerReminderEnabled(this.checked)', 'data-alert="pre"')}
          ${this._ncRow('persistent', 'thumbtack', t('persistentBar') || 'الإشعار الثابت للوقت المتبقي', t('persistentBarDesc') || '')}
        </div>
        ${denied ? `<button class="alert-denied" onclick="Router.go('profile')"><i class="fas fa-triangle-exclamation"></i> ${t('notifDeniedNote') || 'الإشعارات غير مسموحة في النظام — اضغط للتفعيل'}</button>` : ''}

        ${this._acc('bullhorn', t('adhanSection') || 'الأذان', adhanBody)}
        ${this._acc('hourglass-half', t('iqamaSection') || 'الإقامة', iqamaBody)}
        ${this._acc('sliders', t('fineNotifs') || 'الإشعارات الدقيقة', salawatBlock + adhkarBlock + stopBlock)}

      </div>
    `;
    this._syncAlertToggles();
    requestAnimationFrame(() => this._syncAlertToggles());
  },

  // v127: مزامنة المفاتيح مع الحالة الحقيقية (تصلح رجوعها للرمادي)
  _syncAlertToggles() {
    const set = (sel, v) => { const el = document.querySelector(sel); if (el) el.checked = !!v; };
    try {
      if (typeof PrayerNotifications !== 'undefined') {
        set('[data-alert="adhan"]', PrayerNotifications.isEnabled());
        set('[data-alert="pre"]', PrayerNotifications.isReminderEnabled());
        document.querySelectorAll('[data-prayer-bell]').forEach(b => {
          const n = b.getAttribute('data-prayer-bell');
          const on = PrayerNotifications.isPrayerOn ? PrayerNotifications.isPrayerOn(n) : true;
          b.classList.toggle('off', !on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          const ic = b.querySelector('i');
          if (ic) ic.className = 'fas ' + (on ? 'fa-bell' : 'fa-bell-slash');
        });
      }
      if (typeof NotifCenter !== 'undefined') set('[data-nc="persistent"]', NotifCenter.isOn('persistent'));
    } catch (e) {}
  },

  // v127: تشغيل/إطفاء صوت صلاة واحدة — يُشغّل تنبيه الأذان الرئيسي تلقائيًا
  async toggleBellNotif(name) {
    if (typeof PrayerNotifications === 'undefined') return;
    try {
      const on = PrayerNotifications.isPrayerOn ? PrayerNotifications.isPrayerOn(name) : true;
      const next = !on;
      if (next && PrayerNotifications.isEnabled && !PrayerNotifications.isEnabled()) {
        const ok = await PrayerNotifications.enable();
        if (!ok) { this.renderGroup('adhan'); return; }
      }
      if (PrayerNotifications.setPrayerOn) PrayerNotifications.setPrayerOn(name, next);
      else if (typeof HomePage !== 'undefined' && HomePage.togglePrayerNotif) { HomePage.togglePrayerNotif(name); return; }
      try { if (AppState.timings) PrayerNotifications.scheduleDay(AppState.timings, AppState.settings.locale || 'es'); } catch (e) {}
    } catch (e) {}
    this.renderGroup('adhan');
  },

  // v122: قسم قابل للطيّ (details/summary) بنفس شكل البطاقات
  _acc(icon, title, body, open) {
    return `<details class="acc"${open ? ' open' : ''}>
      <summary><span class="acc-ico"><i class="fas fa-${icon}"></i></span><span class="acc-title">${title}</span><i class="fas fa-chevron-down acc-chev"></i></summary>
      <div class="acc-body">${body}</div>
    </details>`;
  },

  // v122: تفعيل/إطفاء صوت الأذان (muted معكوس)
  toggleAdhanSound(on) {
    try {
      AppState.settings.adhan = AppState.settings.adhan || {};
      AppState.settings.adhan.muted = !on;
      Storage.saveSettings();
      if (typeof AdhanService !== 'undefined' && AdhanService.syncNative) AdhanService.syncNative();
    } catch (e) {}
    showToast((on ? '🔊 ' : '🔇 ') + (t(on ? 'adhanEnableSoundOn' : 'adhanEnableSoundOff') || ''), 2000);
    this.renderGroup('adhan');
  },

  // منتقي فترة تذكير الصلاة على النبي ﷺ: كل نصف ساعة / ساعة / ساعتين /
  // ٣ ساعات / إطفاء — ضمن النافذة ٩ صباحًا → ٩ مساءً. يُخزَّن بالدقائق في
  // notif_center.salawatFrequency (0 = إطفاء)، ويعيد الجدولة فورًا.
  _salawatFreqRow() {
    const freq = (typeof NotifCenter !== 'undefined') ? Number(NotifCenter.getSettings().salawatFrequency ?? 180) : 180;
    const label = { 30: t('freq30') || 'كل نصف ساعة', 60: t('freq60') || 'كل ساعة', 120: t('freq120') || 'كل ساعتين', 180: t('freq180') || 'كل ٣ ساعات', 0: t('freqOff') || 'إطفاء الإشعار' }[freq] || (t('freq180') || 'كل ٣ ساعات');
    const chevron = currentLocale === 'ar' ? 'left' : 'right';
    return `
      <div class="list-row" onclick="ProfilePage.pickSalawatFrequency()">
        <div class="list-row-icon"><i class="fas fa-clock"></i></div>
        <div class="list-row-info">
          <div class="list-row-label">${t('ncSalawatFreq') || 'فترة تذكير الصلاة على النبي'}</div>
          <div class="list-row-value">${label}</div>
        </div>
        <i class="fas fa-chevron-${chevron} list-row-chevron"></i>
      </div>`;
  },

  pickSalawatFrequency() {
    if (typeof NotifCenter === 'undefined') return;
    const options = [
      { id: '30',  label: '⏱️ ' + (t('freq30') || 'كل نصف ساعة') },
      { id: '60',  label: '🕐 ' + (t('freq60') || 'كل ساعة') },
      { id: '120', label: '🕑 ' + (t('freq120') || 'كل ساعتين') },
      { id: '180', label: '🕒 ' + (t('freq180') || 'كل ٣ ساعات') },
      { id: '0',   label: '🔕 ' + (t('freqOff') || 'إطفاء الإشعار') },
    ];
    const current = String(Number(NotifCenter.getSettings().salawatFrequency ?? 180));
    showModal(t('ncSalawatFreq') || 'فترة تذكير الصلاة على النبي', options, current, id => {
      const s = NotifCenter.getSettings();
      s.salawatFrequency = parseInt(id, 10);
      Storage.set(NotifCenter.storageKey, s);
      NotifCenter.init(); // إعادة الجدولة فورًا (واجهة)
      // إعادة جدولة المنبّهات الأصلية ليعمل التذكير والتطبيق مغلق
      if (typeof PrayerNotifications !== 'undefined' && typeof AppState !== 'undefined' && AppState.timings) {
        try { PrayerNotifications.scheduleDay(AppState.timings, (AppState.settings && AppState.settings.locale) || 'ar'); } catch (e) {}
      }
      this.renderGroup('adhan');
    });
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
          <input type="checkbox" data-nc="${key}" ${on ? 'checked' : ''} onchange="ProfilePage.setNotifCenter('${key}', this.checked, this)">
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
      nightAuto: '<i class="fas fa-circle-half-stroke"></i> ' + t('themeNightAuto') +
        (typeof NightMode !== 'undefined' ? ' — ' + NightMode.statusText() : ''),
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

          <!-- v64: قراءة القرآن مع الترجمة صوتيًا (القارئ + راديو القرآن المترجم) -->
          <div class="list-row" onclick="ProfilePage.toggleVoiceTranslation()" style="cursor:pointer;">
            <div class="list-row-icon"><i class="fas fa-volume-high"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${t('voiceTrSetting')}</div>
              <div class="list-row-value">${t('voiceTrSettingDesc')}</div>
            </div>
            <label class="toggle-switch" onclick="event.stopPropagation();">
              <input type="checkbox" ${AppState.settings.quranVoiceTranslation ? 'checked' : ''} onchange="ProfilePage.setVoiceTranslation(this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

      </div>
    `;
  },

  // ================= v64: الترجمة الصوتية للقرآن (تفعيل/إلغاء) =================
  setVoiceTranslation(on) {
    AppState.settings.quranVoiceTranslation = !!on;
    Storage.saveSettings();
    if (!on) {
      try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch (e) {}
      if (typeof RadioService !== 'undefined' && RadioService._stopTrAudio) RadioService._stopTrAudio();
    }
    showToast((on ? '🔊 ' : '🔇 ') + t(on ? 'voiceTrOn' : 'voiceTrOff'), 2000);
  },

  toggleVoiceTranslation() {
    this.setVoiceTranslation(!AppState.settings.quranVoiceTranslation);
    this.renderGeneralGroup(document.getElementById('main-content'));
  },

  // ================= الأذونات والصلاحيات (Android فقط) =================
  renderPermsGroup(container) {
    if (!window.Android || !Android.getPermissionsState) return;
    let st = { notifications: false, location: false, exactAlarms: true, alarmSound: true, batteryUnrestricted: false };
    try { Object.assign(st, JSON.parse(Android.getPermissionsState())); } catch (e) {}
    const S = (typeof PermGuide !== 'undefined') ? PermGuide.S() : { grant: 'طلب الإذن', enabled: 'مفعّل', location: 'الموقع', locationDesc: '', notifSettings: 'إعدادات الإشعارات في النظام', notifSettingsDesc: '', appSettings: 'إعدادات التطبيق في النظام', appSettingsDesc: '', refresh: 'تحديث الحالة' };
    const okBadge = '<span style="color:#2e8b57;font-weight:700;font-size:13px;white-space:nowrap;">✓ ' + S.enabled + '</span>';
    const btn = (label, action) => '<button style="padding:8px 14px;font-size:13px;border:none;border-radius:10px;background:#0f4c3a;color:#fff;white-space:nowrap;cursor:pointer;" onclick="' + action + '">' + label + '</button>';
    const row = (icon, label, desc, ok, btnLabel, action) => `
          <div class="list-row">
            <div class="list-row-icon"><i class="fas ${icon}"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${label}</div>
              <div class="list-row-value">${desc}</div>
            </div>
            ${ok ? okBadge : btn(btnLabel, action)}
          </div>`;
    const linkRow = (icon, label, desc, action) => `
          <div class="list-row" onclick="${action}" style="cursor:pointer;">
            <div class="list-row-icon"><i class="fas ${icon}"></i></div>
            <div class="list-row-info">
              <div class="list-row-label">${label}</div>
              <div class="list-row-value">${desc}</div>
            </div>
            <i class="fas fa-chevron-${document.documentElement.dir === 'rtl' ? 'left' : 'right'} list-row-chevron"></i>
          </div>`;
    container.innerHTML = `
      ${this._subHeader('shield-halved', (typeof t === 'function' && t('permSettings')) || 'الأذونات والصلاحيات')}
      <div style="padding: 0 var(--sp-md);">
        ${(typeof PermGuide !== 'undefined') ? PermGuide.card() : ''}
        <div id="perm-inline-status">${(typeof PermGuide !== 'undefined') ? PermGuide.statusHtml(st) : ''}</div>
        <div class="card" style="padding:0;overflow:hidden;margin-top:12px;">
          ${row('fa-location-dot', S.location, S.locationDesc, st.location, S.grant, "ProfilePage.askPerm('location')")}
        </div>
        <div class="card" style="padding:0;overflow:hidden;margin-top:12px;">
          ${linkRow('fa-gear', S.notifSettings, S.notifSettingsDesc, "Android.openNotificationSettings()")}
          ${linkRow('fa-sliders', S.appSettings, S.appSettingsDesc, "Android.openAppSettings()")}
        </div>
        <div style="text-align:center;margin:14px 0;">
          <button style="padding:10px 18px;font-size:14px;border:none;border-radius:12px;background:#0f4c3a;color:#fff;cursor:pointer;" onclick="ProfilePage.renderPermsGroup(document.getElementById('main-content'))"><i class="fas fa-arrows-rotate"></i> ${S.refresh}</button>
        </div>
      </div>
    `;
  },

  askPerm(which) {
    const refresh = () => {
      const c = document.getElementById('main-content');
      if (c) this.renderPermsGroup(c);
    };
    // الغلاف الأصلي يبثّ 'quba-perms' بعد نتيجة الحوار؛ المؤقّت احتياط
    window.addEventListener('quba-perms', refresh, { once: true });
    try { Android.requestPermissions(JSON.stringify([which])); } catch (e) {}
    setTimeout(refresh, 1200);
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
        if (city && city.online && typeof Cities !== 'undefined' && Cities._ensureListed) Cities._ensureListed(city);
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
      { id: 'nightAuto', label: '<i class="fas fa-circle-half-stroke"></i> ' + t('themeNightAuto') },
    ];
    showModal(t('theme'), options, AppState.settings.theme, id => {
      AppState.settings.theme = id;
      Storage.saveSettings();
      applyTheme();
      if (typeof NightMode !== 'undefined') NightMode.refresh(); // v1.0.73
      this.renderGroup('general');
      if (id === 'nightAuto') showToast('🌙 ' + t('nightAutoHint'), 4200);
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
  // اختيار أذان — الأذان العادي (لباقي الصلوات)
  // v1.0.76: «أذان مخصص (من ملفات الجهاز)» هو آخر خيارات القائمة، واختياره يفتح
  // منتقي ملفات النظام مباشرة (سابقًا كان الاختيار يُحفظ بلا ملف فلا يعمل الأذان).
  _pickAdhanVoiceOf(isFajr) {
    const type = isFajr ? 'fajr' : 'regular';
    const key = isFajr ? 'fajrVoice' : 'voice';
    const options = AdhanService.voicesOf(type).map(v => ({
      id: v.id,
      label: v.id === 'custom'
        ? (t('adhanCustomLast') || '📁 أذان مخصص (من ملفات الجهاز)')
        : (v.custom ? ('📁 ' + AdhanService.voiceName(v)) : AdhanService.voiceLabel(v)),
    }));
    const title = isFajr ? (t('adhanFajrVoice') || 'اختيار أذان الفجر') : (t('adhanChoose') || 'اختيار أذان');
    showModal(title, options, AppState.settings.adhan[key], id => {
      if (id === 'custom') {
        // آخر الخيارات: منتقي ملفات الجهاز — الحفظ يتم بعد اختيار الملف فعلاً
        this.pickCustomAdhan(isFajr);
        return;
      }
      AppState.settings.adhan[key] = id;
      Storage.saveSettings();
      AdhanService.syncNative();
      this.renderGroup('adhan');
      AdhanService.preview(id);
    });
  },

  // اختيار أذان — الأذان العادي (لباقي الصلوات)
  pickAdhanVoice() { this._pickAdhanVoiceOf(false); },

  // اختيار أذان الفجر — يعمل لصلاة الفجر فقط
  pickAdhanFajrVoice() { this._pickAdhanVoiceOf(true); },

  // Interruptores con estado explícito (checked)
  // ============ v1.0.72: الأذان المخصص (ملف صوتي من الجهاز) ============
  pickCustomAdhan(isFajr) {
    if (typeof AdhanService === 'undefined' || !AdhanService.pickCustom) return;
    // Native يبثّ quba-custom-adhan بعد اختيار الملف (أو إلغائه)
    const apply = () => {
      const f = AdhanService.customFileName(isFajr);
      if (f) {
        if (isFajr) AppState.settings.adhan.fajrVoice = 'custom';
        else AppState.settings.adhan.voice = 'custom';
        Storage.saveSettings();
        AdhanService.syncNative();
        showToast('📁 ' + f, 2500);
      }
      this.renderGroup('adhan');
    };
    window.addEventListener('quba-custom-adhan', apply, { once: true });
    AdhanService.pickCustom(isFajr);
  },

  // ============ v1.0.81: إدارة «ملفاتي» والأذان المخصص المتعدد ============
  addMyAdhan(isFajr) {
    if (typeof AdhanService === 'undefined') return;
    const type = isFajr ? 'fajr' : 'regular';
    const before = AdhanService.customItems().map(i => i.id);
    const apply = () => {
      const added = AdhanService.customItems().find(i => before.indexOf(i.id) === -1);
      if (added) {
        AppState.settings.adhan[isFajr ? 'fajrVoice' : 'voice'] = added.id;
        Storage.saveSettings();
        AdhanService.syncNative();
        showToast('📁 ' + (added.name || added.id), 2500);
      }
      this.renderGroup('adhan');
    };
    window.addEventListener('quba-custom-adhan', apply, { once: true });
    AdhanService.pickCustom(isFajr);
  },

  deleteMyAdhan(id) {
    if (typeof AdhanService === 'undefined') return;
    const item = AdhanService.customById(id);
    if (!item) return;
    AdhanService.deleteCustom(id);
    const key = item.type === 'fajr' ? 'fajrVoice' : 'voice';
    if (AppState.settings.adhan[key] === id) {
      AppState.settings.adhan[key] = item.type === 'fajr'
        ? AdhanService.DEFAULT_FAJR_VOICE : AdhanService.DEFAULT_VOICE;
      Storage.saveSettings();
    }
    AdhanService.syncNative();
    showToast('🗑️ ' + (item.name || id), 1800);
    setTimeout(() => this.renderGroup('adhan'), 120);
  },

  /** v1.0.81: مفتاح «دعاء ما بعد الأذان». */
  setDuaAfterAdhan(on) {
    AppState.settings.adhan.duaAfterAdhan = !!on;
    Storage.saveSettings();
    AdhanService.syncNative();
    // v1.0.87: تأكيد صريح للمستخدم (كان التبديل صامتًا فلا يدري أمُفعَّل هو أم لا)
    const st = document.getElementById('dua-state');
    if (st) st.textContent = on ? (t('duaToggleOn') || 'مُفعَّل') : (t('duaToggleOff') || 'مُعطَّل');
    if (typeof showToast === 'function') {
      showToast(on ? (t('duaToastOn') || '🤲 دعاء ما بعد الأذان: مُفعَّل')
                   : (t('duaToastOff') || '🤲 دعاء ما بعد الأذان: مُعطَّل'), 2800);
    }
  },

  _saveIqama(next) {
    AppState.settings.iqama = next;
    Storage.saveSettings();
    try { if (typeof IQAMAH_OFFSETS !== 'undefined') Object.assign(IQAMAH_OFFSETS, next.minutes); } catch (e) {}
    // إعادة الجدولة فورًا: منبّهات الإقامة + الإشعار الثابت
    try {
      if (typeof AppState !== 'undefined' && AppState.timings) {
        PrayerNotifications.scheduleDay(AppState.timings, AppState.settings.locale || 'es');
      }
    } catch (e) {}
  },

  setIqamaEnabled(on) {
    const cur = AdhanService.iqamaSettings();
    this._saveIqama({ enabled: !!on, minutes: cur.minutes });
    showToast(on ? '🕌 ' + (t('iqamaToggle') || '') : '🔕', 1500);
  },

  stepIqama(prayer, delta) {
    const cur = AdhanService.iqamaSettings();
    const mins = Object.assign({}, cur.minutes);
    mins[prayer] = Math.max(0, Math.min(90, (Number(mins[prayer]) || 0) + delta));
    this._saveIqama({ enabled: cur.enabled, minutes: mins });
    this.renderGroup('adhan');
  },

  deleteCustomAdhan(isFajr) {
    if (typeof AdhanService === 'undefined' || !AdhanService.deleteCustom) return;
    AdhanService.deleteCustom(isFajr ? 'fajr' : 'regular');
    // إن كان الصوت الحالي هو المخصص نعود للافتراضي المضمّن
    if (isFajr && AppState.settings.adhan.fajrVoice === 'custom') {
      AppState.settings.adhan.fajrVoice = AdhanService.DEFAULT_FAJR_VOICE;
    } else if (!isFajr && AppState.settings.adhan.voice === 'custom') {
      AppState.settings.adhan.voice = AdhanService.DEFAULT_VOICE;
    }
    Storage.saveSettings();
    AdhanService.syncNative();
    showToast('🗑️ ' + (t('adhanCustomNone') || ''), 1800);
    setTimeout(() => this.renderGroup('adhan'), 120);
  },

  // ============ v1.0.72: تعيين مدينة من البحث العالمي ============
  setWorldCity(city) {
    if (!city) return;
    LocationService.setManual(city.lat, city.lon, city.name, city.country);
    if (typeof Storage !== 'undefined' && Storage.clearPrayerCache) Storage.clearPrayerCache();
    AppState.timings = null;
    showToast((city.flag || '🌍') + ' ' + city.name + (city.country ? ', ' + city.country : ''), 2200);
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

  openWorldTime() {
    if (typeof Cities !== 'undefined' && Cities.openWorldSearch) Cities.openWorldSearch();
  },

  setAdhanVolume(val) {
    const v = Math.max(0, Math.min(100, parseInt(val, 10))) / 100;
    AppState.settings.adhan.volume = v;
    Storage.saveSettings();
    const el = document.getElementById('volume-value');
    if (el) el.textContent = Math.round(v * 100) + '%';
    AdhanService.setVolume(v);
    AdhanService.syncNative();
    // v1.0.87: تحذير صريح عند الصفر — مستوى 0 يعني أذانًا ودعاءً صامتين تمامًا
    if (v === 0 && typeof showToast === 'function') {
      showToast(t('adhanVolumeZeroWarn') || '🔇 المستوى 0%: لن يُسمع الأذان ولا دعاء ما بعد الأذان', 3200);
    }
  },

  // ============ v1.0.74: نافذة تأكيد/تراجع موحّدة ============
  // بدل كتابة كلمة «حذف» يدويًا للتأكيد، تظهر نافذة بخيارين واضحين:
  // «تأكيد» أو «تراجع» — تُستخدم لحذف البيانات وتصديرها معًا.
  _confirmDialog(opts) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) { if (opts && opts.onConfirm) opts.onConfirm(); return; }
    const icon = (opts && opts.icon) || 'fa-circle-question';
    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">${(opts && opts.title) || ''}</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="confirm-sheet">
        <div class="confirm-icon ${opts && opts.danger ? 'danger' : ''}"><i class="fas ${icon}"></i></div>
        <p class="confirm-msg">${(opts && opts.message) || ''}</p>
        ${opts && opts.note ? `<p class="confirm-note">${opts.note}</p>` : ''}
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-cancel" onclick="closeModal()">${(opts && opts.cancelLabel) || ''}</button>
        <button class="confirm-btn confirm-ok ${opts && opts.danger ? 'danger' : ''}" id="confirm-ok-btn">${(opts && opts.confirmLabel) || ''}</button>
      </div>
    `;
    overlay.classList.remove('hidden');
    const ok = document.getElementById('confirm-ok-btn');
    if (ok) ok.onclick = () => { closeModal(); try { if (opts && opts.onConfirm) opts.onConfirm(); } catch (e) {} };
  },

  exportData() {
    this._confirmDialog({
      title: t('exportData') || 'Exportar datos',
      icon: 'fa-download',
      message: t('exportConfirm') || '¿Exportar una copia de tus datos?',
      note: t('exportConfirmNote') || 'Se descargará un archivo JSON con tus ajustes y progreso.',
      confirmLabel: t('confirmExport') || 'Exportar',
      cancelLabel: t('cancelAction') || 'Cancelar',
      onConfirm: () => this._doExportData(),
    });
  },

  _doExportData() {
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
    this._confirmDialog({
      title: t('resetProgress') || 'Reiniciar progreso',
      icon: 'fa-triangle-exclamation',
      danger: true,
      message: t('confirmReset') || '¿Borrar TODO tu progreso (XP, marcadores, ajustes, caché)?',
      note: t('resetUndoWarning') || 'Esta acción no se puede deshacer.',
      confirmLabel: t('confirmDelete') || 'Borrar',
      cancelLabel: t('cancelAction') || 'Cancelar',
      onConfirm: () => this._doResetProgress(),
    });
  },

  _doResetProgress() {
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

  _permDeniedNote() {
    return NotifPerm._msg('لم يُفعَّل — الإشعارات غير مسموحة للتطبيق', 'No activado — las notificaciones no están permitidas', 'Not enabled — notifications are not allowed');
  },

  async setPrayerNotifEnabled(checked) {
    if (typeof PrayerNotifications === 'undefined') return;
    const label = t('adhanAlertToggle') || 'تنبيه الأذان';
    if (!checked) {
      PrayerNotifications.disable();
      ToggleFeedback.announce(label, false);
    } else {
      const ok = await PrayerNotifications.enable();
      if (ok && AppState.timings) {
        PrayerNotifications.scheduleDay(AppState.timings, AppState.settings.locale || 'es');
      }
      if (ok) ToggleFeedback.announce(label, true);
      else ToggleFeedback.announce(label, false, this._permDeniedNote());
      try { this.toggleAdhanSound(!!checked); } catch (e) {}
    }
    this.renderGroup('adhan');
    setTimeout(() => this._syncAlertToggles(), 300);
  },

  // Interruptor del recordatorio «اقتربت صلاة الظهر» (15 min antes)
  async setPrayerReminderEnabled(checked) {
    if (typeof PrayerNotifications === 'undefined') return;
    const label = t('prePrayerAlert') || 'تنبيه قبل الصلاة والإقامة';
    if (!checked) {
      PrayerNotifications.disableReminder();
      ToggleFeedback.announce(label, false);
    } else {
      const ok = await PrayerNotifications.enableReminder();
      if (ok && AppState.timings) {
        PrayerNotifications.scheduleDay(AppState.timings, AppState.settings.locale || 'es');
      }
      if (ok) ToggleFeedback.announce(label, true);
      else ToggleFeedback.announce(label, false, this._permDeniedNote());
    }
    this.renderGroup('adhan');
    setTimeout(() => this._syncAlertToggles(), 300);
  },

  // v55: مفاتيح مركز الإشعارات (تفعيل/إيقاف لكل ميزة)
  async setNotifCenter(key, checked, inputEl) {
    if (typeof NotifCenter === 'undefined') return;
    const label = inputEl ? ToggleFeedback.labelFor(inputEl) : '';
    if (checked) {
      const ok = await NotifCenter.ensurePermission().catch(() => false);
      // مفاتيح الحساسات (قلب الهاتف/أزرار الصوت…) لا تحتاج إذن إشعارات
      const needsPerm = !['flipToStop', 'powerToStop', 'salawatVoice', 'snooze'].includes(key);
      if (!ok && needsPerm) {
        NotifCenter.set(key, false);
        if (inputEl) inputEl.checked = false;
        ToggleFeedback.announce(label, false, this._permDeniedNote());
        return;
      }
    }
    NotifCenter.set(key, checked);
    ToggleFeedback.announce(label, checked);
  },

  cleanup() {
    AdhanService.stopPreview();
  },
};
