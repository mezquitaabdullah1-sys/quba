// 🌐 صفحة اختيار اللغة — تظهر عند أول تشغيل للتطبيق فقط
// LanguagePicker: first-run language selection screen with flags.
// Una vez elegido el idioma, se guarda (langChosen) y no vuelve a aparecer.
const LanguagePicker = {
  LANGS: [
    { id: 'ar', flag: '🇸🇦', name: 'العربية',      hint: 'اختر لغتك' },
    { id: 'es', flag: '🇪🇸', name: 'Español',      hint: 'Elige tu idioma' },
    { id: 'en', flag: '🇬🇧', name: 'English',      hint: 'Choose your language' },
  ],

  /** ¿Debe mostrarse la pantalla de selección de idioma? (solo la primera vez) */
  shouldShow() {
    try {
      return !AppState.settings.langChosen && !localStorage.getItem('quba_locale');
    } catch (e) {
      return !AppState.settings.langChosen;
    }
  },

  /** Dibuja la pantalla por encima de todo (splash + app) */
  show() {
    const el = document.createElement('div');
    el.id = 'language-picker';
    el.className = 'lang-picker';
    el.innerHTML = `
      <div class="lang-picker-card">
        <picture>
          <source srcset="assets/logo.webp" type="image/webp">
          <img src="assets/logo.png" alt="Quba" class="lang-picker-logo" width="96" height="96">
        </picture>
        <div class="lang-picker-title">اختر لغتك · Elige tu idioma · Choose your language</div>
        <div class="lang-picker-list">
          ${this.LANGS.map(l => `
            <button class="lang-picker-btn" data-lang="${l.id}">
              <span class="lang-picker-flag">${l.flag}</span>
              <span class="lang-picker-text">
                <span class="lang-picker-name">${l.name}</span>
                <span class="lang-picker-hint">${l.hint}</span>
              </span>
              <span class="lang-picker-chevron"><i class="fas fa-chevron-left"></i></span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(el);
    // Animación de entrada
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));

    el.querySelectorAll('.lang-picker-btn').forEach(btn => {
      btn.addEventListener('click', () => this.choose(btn.dataset.lang, el));
    });
  },

  /** Aplica el idioma elegido y abre la app con él */
  choose(lang, el) {
    if (!I18N[lang]) return;

    // 1) Guardar elección (ya no se volverá a mostrar)
    AppState.settings.langChosen = true;
    AppState.settings.locale = lang;

    // 2) Sincronizar traducción del Corán al idioma elegido (misma lógica que Ajustes)
    if (typeof API !== 'undefined' && API.resolveTranslationForLocale) {
      AppState.settings.translation = API.resolveTranslationForLocale(AppState.settings.translation, lang);
    }
    // Tafsir por defecto según idioma
    try {
      const rs = Storage.get('reader_settings');
      if (rs) {
        const auto = { ar: 'local.ar', en: 'local.en', es: 'local.garcia' }[lang] || 'local.garcia';
        if (rs.tafsir === 'local.auto' || (['local.garcia', 'local.es'].includes(rs.tafsir) && lang !== 'es')) {
          rs.tafsir = auto;
          Storage.set('reader_settings', rs);
        }
      }
    } catch (e) {}

    Storage.saveSettings();
    setLocale(lang); // aplica lang/dir, data-i18n y persiste quba_locale

    // 3) Cerrar la pantalla con animación y continuar el arranque normal
    const picker = el || document.getElementById('language-picker');
    if (picker) {
      picker.classList.add('closing');
      setTimeout(() => picker.remove(), 350);
    }
  },
};
