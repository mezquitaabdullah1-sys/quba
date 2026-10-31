// 💾 Almacenamiento local con TTL + caché en memoria
// v22: capa síncrona en memoria (Map) — las lecturas repetidas (navegación
// entre pestañas) ya no tocan localStorage ni reparsean JSON. Los datos se
// cargan una vez y la navegación es instantánea.
const Storage = {
  _mem: new Map(),

  // 🛡️ نسخة احتياطية أصلية (Android) للبيانات المهمة: تقدّم الصلوات، الـstreak، النقاط،
  // الإعدادات… سبب فقدانها سابقًا: localStorage في WebView تُكتب للقرص بتأخير، وإغلاق
  // التطبيق من الخلفية بعد التعديل مباشرة كان يُضيّع آخر تغيير. الجسر الأصلي يحفظها
  // في SharedPreferences فورًا ويحقنها عند التشغيل (window.__qubaMirror).
  MIRROR_KEYS: [
    'prayer_checkin', 'gamification', 'settings',
    'prayer_notif_enabled', 'prayer_reminder_enabled', 'prayer_notif_prayers', 'notif_center',
    'onboardingDone', 'last_location', 'reader_settings',
    'mushaf_last_page', 'mushaf_font', 'mushaf_tajweed', 'quran_bookmarks_v2', 'quran_last_read',
    'quran_repeat_cfg', 'dua_bookmarks', 'tasbih_settings', 'tasbih_log', 'tasbih', 'srs',
  ],

  _mirror(key, itemJson) {
    try {
      if (!window.Android || typeof window.Android.persistState !== 'function') return;
      if (this.MIRROR_KEYS.indexOf(key) < 0) return;
      window.Android.persistState('quba_' + key, itemJson);
    } catch (e) { /* صامت */ }
  },

  // يُستدعى مرة عند التحميل: يعيد ما فقدته localStorage (أو ما كان أقدم منه) من النسخة الأصلية
  _restoreFromMirror() {
    try {
      const m = window.__qubaMirror;
      if (!m || typeof m !== 'object') return;
      Object.keys(m).forEach((lsKey) => {
        try {
          const mirrored = JSON.parse(m[lsKey]);
          const rawLocal = localStorage.getItem(lsKey);
          let useMirror = !rawLocal;
          if (rawLocal && !useMirror) {
            const local = JSON.parse(rawLocal);
            useMirror = (mirrored.timestamp || 0) > (local.timestamp || 0);
          }
          if (useMirror) localStorage.setItem(lsKey, m[lsKey]);
        } catch (e) { /* عنصر تالف: نتجاهله */ }
      });
    } catch (e) { /* صامت */ }
  },

  set(key, value, ttl = null) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    this._mem.set(key, item);
    let json = null;
    try {
      json = JSON.stringify(item);
      localStorage.setItem('quba_' + key, json);
    } catch (e) {
      console.warn('Storage full:', e);
    }
    if (json) this._mirror(key, json);
  },

  get(key) {
    // 1) Caché en memoria (instantáneo)
    if (this._mem.has(key)) {
      const item = this._mem.get(key);
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this._mem.delete(key);
        return null;
      }
      return item.value;
    }
    // 2) localStorage (persistente)
    try {
      const raw = localStorage.getItem('quba_' + key);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem('quba_' + key);
        return null;
      }
      this._mem.set(key, item); // promover a memoria para próximas lecturas
      return item.value;
    } catch (e) {
      return null;
    }
  },

  remove(key) {
    this._mem.delete(key);
    localStorage.removeItem('quba_' + key);
    this._mirror(key, '');
  },

  // v38: borra TODA la caché de horarios de oración (`prayer_*`,
  // `prayer_month_*`). Se usa al cambiar de ciudad manualmente y en la
  // purga única post-actualización: los datos antiguos no deben sobrevivir
  // tapando los horarios exactos ni el ajuste manual del usuario.
  clearPrayerCache() {
    try {
      // ⚠️ كان يحذف كل مفتاح يبدأ بـ prayer_ — فيمسح معه تقدّم الصلوات (prayer_checkin)
      // ومفاتيح الإشعارات وأعلام الترحيل نفسها عند كل تغيير مدينة. نستثني بيانات المستخدم.
      const PROTECTED = ['prayer_checkin', 'prayer_notif_enabled', 'prayer_reminder_enabled',
        'prayer_notif_prayers', 'prayer_cache_v38_purged', 'prayer_cache_v40_purged'];
      const isPrayerKey = (k) => !PROTECTED.includes(k) && (/^prayer_/.test(k) || /^prayer_month_/.test(k));
      for (const k of Array.from(this._mem.keys())) {
        if (isPrayerKey(k)) this._mem.delete(k);
      }
      const doomed = [];
      for (let i = 0; i < localStorage.length; i++) {
        const raw = localStorage.key(i);
        if (raw && raw.startsWith('quba_') && isPrayerKey(raw.slice(5))) doomed.push(raw);
      }
      doomed.forEach(k => localStorage.removeItem(k));
    } catch (e) { /* silencioso: nunca romper por limpieza */ }
  },

  loadSettings() {
    // v1.0.71: تنبيه الأذان مفعّل افتراضيًا — يُكتب صراحة عند أول تشغيل
    const _notifSeed = Storage.get('prayer_notif_enabled');
    if (_notifSeed === undefined || _notifSeed === null) Storage.set('prayer_notif_enabled', true);

    const settings = Storage.get('settings');
    if (settings) {
      Object.assign(AppState.settings, settings);
      // v28: los ajustes guardados antes de v28 no tienen prayerOffsets
      if (!AppState.settings.prayerOffsets) {
        AppState.settings.prayerOffsets = { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
      }
      // v38: ترحيل لمرة واحدة — المظهر الأساسي الجديد (الأخضر الملكي والذهبي)
      // يطبق على من كان على الوضع التلقائي أو الفاتح الافتراضي فقط؛
      // من اختار مظهراً صراحة (داكن/خمري/بني) يبقى على اختياره.
      if (!AppState.settings._v38ThemeMigrated) {
        AppState.settings._v38ThemeMigrated = true;
        if (AppState.settings.theme === 'auto' || AppState.settings.theme === 'light') {
          AppState.settings.theme = 'emerald';
        }
        Storage.saveSettings();
      }
      // v54: ترحيل لمرة واحدة — القارئ الافتراضي صار محمود خليل الحصري.
      // يُطبَّق فقط على من بقي على القارئ الافتراضي القديم (ماهر المعيقلي)
      // أو القديم جداً (العفاسي)؛ من اختار قارئاً آخر يبقى على اختياره.
      if (!AppState.settings._v54ReciterMigrated) {
        AppState.settings._v54ReciterMigrated = true;
        if (AppState.settings.reciter === 'ar.mahermuaiqly' || AppState.settings.reciter === 'ar.alafasy' || !AppState.settings.reciter) {
          AppState.settings.reciter = 'ar.husary';
        }
        Storage.saveSettings();
      }
    } else {
      // Primer uso: selección automática de Al-Husary como recitador base
      AppState.settings.reciter = 'ar.husary';
    }
    return AppState.settings;
  },

  saveSettings() {
    Storage.set('settings', AppState.settings);
  },
};

// Restaurar primero la copia nativa (si localStorage perdió algo), luego cargar ajustes
Storage._restoreFromMirror();
Storage.loadSettings();

// v38: purga ÚNICA post-actualización — elimina horarios cacheados de
// versiones anteriores que llevaban el ajuste manual ya horneado dentro,
// de modo que el nuevo ajuste manual (aplicado siempre en vivo) se note
// al instante y los horarios base sean los exactos de Muslim Pro.
try {
  if (!Storage.get('prayer_cache_v38_purged')) {
    Storage.clearPrayerCache();
    Storage.set('prayer_cache_v38_purged', true, 365 * 24 * 60 * 60 * 1000);
  }
} catch (e) { /* silencioso */ }

// v40: purga ÚNICA post-actualización — el motor de horarios añade ahora la
// corrección por ELEVACIÓN (Shuruq/Maghrib/Isha): los horarios cacheados sin
// ella (hasta 14/30 días) no deben sobrevivir tapando el cálculo corregido.
try {
  if (!Storage.get('prayer_cache_v40_purged')) {
    Storage.clearPrayerCache();
    Storage.set('prayer_cache_v40_purged', true, 365 * 24 * 60 * 60 * 1000);
  }
} catch (e) { /* silencioso: nunca romper por limpieza */ }
