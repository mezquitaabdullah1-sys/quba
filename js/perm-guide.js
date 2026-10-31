// 🔐 PermGuide — لوحة «حتى يصلك الأذان في وقته» (أندرويد فقط).
// تعرض الحالة الحقيقية للأذونات على الجهاز (إشعارات / تنبيهات دقيقة / صوت المنبّه /
// قيود البطارية) وتتيح طلب كل إذن بضغطة، مع خطوات إضافية لأجهزة سامسونج.
// المصدر الوحيد للحالة هو Android.getPermissionsState() (يُحدّثه MainActivity عند
// onResume وبعد كل نتيجة إذن، ويُبثّ عبر حدث 'quba-perms').
const PermGuide = {
  STR: {
    ar: {
      title: 'حتى يصلك الأذان في وقته',
      intro: 'أجهزة سامسونج توقف التطبيقات في الخلفية لتوفير البطارية، وهذا قد يمنع الأذان من العمل. اتبع الخطوات التالية مرة واحدة:',
      statusNow: 'حالة جهازك الآن',
      notifTitle: 'الإشعارات مسموحة',
      notifDesc: 'بدونها لن يصلك أي تنبيه إطلاقاً',
      notifBtn: 'السماح بالإشعارات',
      exactTitle: 'التنبيهات الدقيقة مسموحة',
      exactDesc: 'بدونها قد يتأخر الأذان عن وقته',
      exactBtn: 'السماح بالتنبيهات الدقيقة',
      soundTitle: 'صوت المنبّه مسموع',
      soundDesc: 'صوت المنبّه مكتوم — لن تسمع الأذان',
      soundBtn: 'فتح إعدادات الصوت',
      batteryTitle: 'العمل بدون قيود البطارية',
      batteryDesc: 'بدونه قد يوقف النظام التطبيق قبل موعد الأذان',
      batteryBtn: 'السماح بالعمل بدون قيود',
      batteryHint: 'اختر Quba ثم «غير مقيّد» — أو «لا تُحسّن»',
      exactHint: 'فعّل «المنبّهات والتذكيرات» ثم ارجع للتطبيق',
      soundHint: 'ارفع صوت «المنبّه» إلى مستوى مسموع',
      stepsTitle: 'خطوات إضافية على جهازك',
      step1: 'اسمح للتطبيق بالعمل بدون قيود البطارية من الزر بالأسفل',
      step2: 'إعدادات الهاتف ← البطارية ← حدود الاستخدام في الخلفية',
      step3: 'تأكد أن Quba ليس ضمن «التطبيقات النائمة» أو «النائمة بعمق»',
      gotIt: 'فهمت',
      stepsNote: 'يمكنك عرض هذه الإرشادات لاحقاً من الإعدادات',
      cardTitle: 'الأذان لا يصل في وقته؟',
      cardDesc: 'خطوات تضمن وصول التنبيه على جهازك',
      refresh: 'تحديث الحالة',
      location: 'الموقع',
      locationDesc: 'لحساب مواقيت الصلاة واتجاه القبلة بدقة',
      notifSettings: 'إعدادات الإشعارات في النظام',
      notifSettingsDesc: 'تفعيل أو إيقاف قنوات التنبيه والأصوات من إعدادات أندرويد',
      appSettings: 'إعدادات التطبيق في النظام',
      appSettingsDesc: 'كل أذونات التطبيق وإدارة البطارية',
      grant: 'طلب الإذن',
      enabled: 'مفعّل'
    },
    es: {
      title: 'Para que el adhan te llegue a tiempo',
      intro: 'Los dispositivos Samsung detienen las apps en segundo plano para ahorrar batería, y eso puede impedir que el adhan funcione. Sigue estos pasos una vez:',
      statusNow: 'Estado de tu dispositivo ahora',
      notifTitle: 'Notificaciones permitidas',
      notifDesc: 'Sin ellas no recibirás ningún aviso',
      notifBtn: 'Permitir notificaciones',
      exactTitle: 'Alarmas exactas permitidas',
      exactDesc: 'Sin ellas el adhan podría retrasarse',
      exactBtn: 'Permitir alarmas exactas',
      soundTitle: 'Sonido de alarma audible',
      soundDesc: 'El sonido de alarma está silenciado — no oirás el adhan',
      soundBtn: 'Abrir ajustes de sonido',
      batteryTitle: 'Funcionar sin restricciones de batería',
      batteryDesc: 'Sin esto el sistema podría detener la app antes del adhan',
      batteryBtn: 'Permitir sin restricciones',
      batteryHint: 'Elige Quba y marca «Sin restricciones»',
      exactHint: 'Activa «Alarmas y recordatorios» y vuelve a la app',
      soundHint: 'Sube el volumen de «Alarma» a un nivel audible',
      stepsTitle: 'Pasos adicionales en tu dispositivo',
      step1: 'Permite que la app funcione sin restricciones de batería con el botón de abajo',
      step2: 'Ajustes del teléfono → Batería → Límites de uso en segundo plano',
      step3: 'Asegúrate de que Quba no esté en «Apps en suspensión» o «en suspensión profunda»',
      gotIt: 'Entendido',
      stepsNote: 'Puedes ver estas instrucciones más tarde desde Ajustes',
      cardTitle: '¿El adhan no llega a su hora?',
      cardDesc: 'Pasos para asegurar que la alerta llegue a tu dispositivo',
      refresh: 'Actualizar estado',
      location: 'Ubicación',
      locationDesc: 'Para calcular los horarios de oración y la alquibla con precisión',
      notifSettings: 'Ajustes de notificaciones del sistema',
      notifSettingsDesc: 'Activa o desactiva los canales y sonidos desde los ajustes de Android',
      appSettings: 'Ajustes de la app en el sistema',
      appSettingsDesc: 'Todos los permisos de la app y la gestión de batería',
      grant: 'Conceder permiso',
      enabled: 'Activo'
    },
    en: {
      title: 'So the adhan reaches you on time',
      intro: 'Samsung devices stop background apps to save battery, and that can prevent the adhan from working. Follow these steps once:',
      statusNow: 'Your device status now',
      notifTitle: 'Notifications allowed',
      notifDesc: 'Without them you will not receive any alert',
      notifBtn: 'Allow notifications',
      exactTitle: 'Exact alarms allowed',
      exactDesc: 'Without them the adhan may be delayed',
      exactBtn: 'Allow exact alarms',
      soundTitle: 'Alarm sound audible',
      soundDesc: 'Alarm sound is muted — you will not hear the adhan',
      soundBtn: 'Open sound settings',
      batteryTitle: 'Running without battery restrictions',
      batteryDesc: 'Without it the system might stop the app before the adhan',
      batteryBtn: 'Allow without restrictions',
      batteryHint: 'Choose Quba and set it to «Unrestricted»',
      exactHint: 'Turn on «Alarms & reminders», then return to the app',
      soundHint: 'Raise the «Alarm» volume to an audible level',
      stepsTitle: 'Additional steps on your device',
      step1: 'Allow the app to run without battery restrictions using the button below',
      step2: 'Phone settings → Battery → Background usage limits',
      step3: 'Make sure Quba is not in "Sleeping apps" or "Deep sleeping apps"',
      gotIt: 'Got it',
      stepsNote: 'You can view these instructions later from Settings',
      cardTitle: 'Adhan not arriving on time?',
      cardDesc: 'Steps to make sure the alert reaches your device',
      refresh: 'Refresh status',
      location: 'Location',
      locationDesc: 'To compute prayer times and the qibla direction accurately',
      notifSettings: 'System notification settings',
      notifSettingsDesc: 'Enable or disable alert channels and sounds from Android settings',
      appSettings: 'App settings in the system',
      appSettingsDesc: 'All app permissions and battery management',
      grant: 'Grant permission',
      enabled: 'On'
    }
  },

  _lang() {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
    return this.STR[l] ? l : 'ar';
  },

  S() { return this.STR[this._lang()]; },

  /** الأرقام الهندية للعربية كما في التصميم (١ ٢ ٣). */
  _num(n) {
    if (this._lang() !== 'ar') return String(n);
    return ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'][n] || String(n);
  },

  _rtl() { return document.documentElement.dir === 'rtl'; },

  /** الحالة الحقيقية من الجسر الأصلي (بلا تخزين محلي — المصدر النظام). */
  state() {
    const def = {
      notifications: false, location: false, exactAlarms: true,
      alarmSound: true, batteryUnrestricted: false, notificationsPermanentlyDenied: false
    };
    try {
      if (window.Android && typeof Android.getPermissionsState === 'function') {
        return Object.assign(def, JSON.parse(Android.getPermissionsState() || '{}') || {});
      }
    } catch (e) {}
    return def;
  },

  // ---------- بطاقات الحالة (تصميم p3) ----------
  _warnCard(title, desc, btn, action, hint) {
    return `
      <div class="pg-card warn">
        <div class="pg-card-head">
          <span class="pg-badge warn"><i class="fas fa-exclamation"></i></span>
          <span class="pg-card-title warn">${title}</span>
        </div>
        <div class="pg-card-desc">${desc}</div>
        <button type="button" class="pg-btn" onclick="${action}">${btn}</button>
        ${hint ? `<div class="pg-card-hint">${hint}</div>` : ''}
      </div>`;
  },

  _okCard(title) {
    return `
      <div class="pg-card ok">
        <div class="pg-card-head">
          <span class="pg-badge ok"><i class="fas fa-check"></i></span>
          <span class="pg-card-title ok">${title}</span>
        </div>
      </div>`;
  },

  statusHtml(st) {
    st = st || this.state();
    const S = this.S();
    let html = `<div class="pg-status-title">${S.statusNow}</div>`;
    html += st.notifications ? this._okCard(S.notifTitle)
      : this._warnCard(S.notifTitle, S.notifDesc, S.notifBtn, 'PermGuide.askNotifications()');
    html += st.exactAlarms ? this._okCard(S.exactTitle)
      : this._warnCard(S.exactTitle, S.exactDesc, S.exactBtn, 'PermGuide.askExactAlarms()', S.exactHint);
    html += st.alarmSound ? this._okCard(S.soundTitle)
      : this._warnCard(S.soundTitle, S.soundDesc, S.soundBtn, 'PermGuide.askSound()', S.soundHint);
    html += st.batteryUnrestricted ? this._okCard(S.batteryTitle)
      : this._warnCard(S.batteryTitle, S.batteryDesc, S.batteryBtn, 'PermGuide.askBattery()', S.batteryHint);
    return html;
  },

  // ---------- الخطوات الإضافية (تصميم p2) ----------
  stepsHtml() {
    const S = this.S();
    const step = (n, text) => `
      <div class="pg-step">
        <span class="pg-step-num">${this._num(n)}</span>
        <span class="pg-step-text">${text}</span>
      </div>`;
    return `
      <div class="pg-steps-title">${S.stepsTitle}</div>
      ${step(1, S.step1)}
      ${step(2, S.step2)}
      ${step(3, S.step3)}
      <button type="button" class="pg-gotit" onclick="PermGuide.close()">${S.gotIt}</button>
      <div class="pg-note">${S.stepsNote}</div>`;
  },

  // ---------- البطاقة الدعوية (تصميم p1) ----------
  card() {
    const S = this.S();
    const chev = this._rtl() ? 'left' : 'right';
    return `
      <div class="pg-nav-card" onclick="PermGuide.open()" role="button" tabindex="0"
           onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();PermGuide.open();}">
        <span class="pg-nav-icon"><i class="fas fa-shield-halved"></i><i class="fas fa-plus pg-nav-plus"></i></span>
        <span class="pg-nav-info">
          <span class="pg-nav-title">${S.cardTitle}</span>
          <span class="pg-nav-desc">${S.cardDesc}</span>
        </span>
        <i class="fas fa-chevron-${chev} pg-nav-chevron"></i>
      </div>`;
  },

  // ---------- اللوحة السفلية (تصميم p3) ----------
  open() {
    const S = this.S();
    let ov = document.getElementById('pg-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'pg-overlay';
      ov.className = 'pg-overlay';
      ov.addEventListener('click', (e) => { if (e.target === ov) PermGuide.close(); });
      document.body.appendChild(ov);
    }
    ov.innerHTML = `
      <div class="pg-sheet" role="dialog" aria-modal="true" aria-label="${S.title}">
        <div class="pg-handle"></div>
        <div class="pg-title"><i class="fas fa-bell"></i><span>${S.title}</span></div>
        <div class="pg-intro">${S.intro}</div>
        <div class="pg-status" id="pg-status">${this.statusHtml()}</div>
        <div class="pg-steps">${this.stepsHtml()}</div>
      </div>`;
    this._bind();
    requestAnimationFrame(() => ov.classList.add('show'));
  },

  close() {
    const ov = document.getElementById('pg-overlay');
    if (!ov) return;
    ov.classList.remove('show');
    setTimeout(() => { try { ov.remove(); } catch (e) {} }, 280);
  },

  /** تحديث البطاقات الحيّة بعد عودة المستخدم من شاشة نظام أو نتيجة إذن. */
  refresh() {
    const sheet = document.getElementById('pg-status');
    if (sheet) sheet.innerHTML = this.statusHtml();
    const inline = document.getElementById('perm-inline-status');
    if (inline) inline.innerHTML = this.statusHtml();
  },

  _bind() {
    if (this._bound) return;
    this._bound = true;
    // MainActivity يبثّ 'quba-perms' عند onResume وبعد كل نتيجة إذن
    window.addEventListener('quba-perms', () => PermGuide.refresh());
  },

  // ---------- v1.0.76: أزرار شاشات النظام (كانت تنادي Android مباشرة فتفشل) ----------
  // كل زر يفتح شاشة النظام المطلوبة ثم يحدّث الحالة تلقائيًا عند العودة.
  _openSystem(action) {
    try { if (window.Android && typeof Android[action] === 'function') Android[action](); }
    catch (e) { console.warn('PermGuide:', action, e); }
    window.addEventListener('quba-perms', () => PermGuide.refresh(), { once: true });
    setTimeout(() => PermGuide.refresh(), 1600);
  },

  /** «السماح بالتنبيهات الدقيقة» — شاشة المنبّهات والتذكيرات (أندرويد 12+). */
  askExactAlarms() { this._openSystem('openExactAlarmSettings'); },

  /** «العمل بدون قيود البطارية» — شاشة تحسين البطارية. */
  askBattery() { this._openSystem('openBatterySettings'); },

  /** «فتح إعدادات الصوت» — مستوى صوت المنبّه. */
  askSound() { this._openSystem('openSoundSettings'); },

  /** طلب إذن الإشعارات مع تحديث اللوحة فور وصول النتيجة. */
  askNotifications() {
    const refresh = () => PermGuide.refresh();
    window.addEventListener('quba-perms', refresh, { once: true });
    try { Android.requestPermissions(JSON.stringify(['notifications'])); } catch (e) {}
    setTimeout(refresh, 1400);
  }
};

if (typeof window !== 'undefined') {
  window.PermGuide = PermGuide;
  // ربط مستمع الحدث مبكرًا كي تُحدَّث اللوحة حتى لو فُتحت لاحقًا
  try { PermGuide._bind(); } catch (e) {}
}
