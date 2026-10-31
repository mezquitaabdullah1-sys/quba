// 🔔 NotifPerm — طبقة موحّدة لإذن الإشعارات.
// السبب: كود الإشعارات الأصلي كان يعتمد على Notification الخاص بالمتصفح
// (window.Notification) وهو غير موجود إطلاقًا داخل Android WebView، فكانت كل
// محاولة تفعيل تنتهي برسالة «الإشعارات غير مدعومة» ولا تُجدول أي أذان.
// داخل تطبيق Android: الحالة من الجسر الأصلي (Android.getPermissionsState) والطلب
// عبر Android.requestPermissions. خارجه (متصفح): Notification كالسابق.
const NotifPerm = {
  _LS_ASKED: 'quba_notif_perm_asked',

  hasNative() {
    return !!(window.Android && typeof window.Android.getPermissionsState === 'function');
  },

  _nativeState() {
    try { return JSON.parse(window.Android.getPermissionsState() || '{}') || {}; } catch (e) { return {}; }
  },

  /** 'granted' | 'denied' | 'default' | 'unsupported' */
  state() {
    if (this.hasNative()) {
      const s = this._nativeState();
      if (s.notifications) return 'granted';
      return s.notificationsPermanentlyDenied ? 'denied' : 'default';
    }
    if (typeof Notification !== 'undefined') return Notification.permission;
    return 'unsupported';
  },

  isGranted() { return this.state() === 'granted'; },

  _msg(ar, es, en) {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'ar';
    return l === 'ar' ? ar : (l === 'en' ? en : es);
  },

  _toast(text, ms) { if (typeof showToast === 'function') showToast(text, ms || 3500); },

  /**
   * يطلب الإذن. opts.silent=true: بلا رسائل ولا فتح إعدادات النظام (للطلب التلقائي عند التشغيل).
   * @returns {Promise<boolean>}
   */
  async request(opts) {
    const silent = !!(opts && opts.silent);
    const st = this.state();
    if (st === 'granted') return true;
    if (st === 'unsupported') {
      if (!silent) this._toast((typeof t === 'function' && t('notifNotSupported')) || 'Notifications not supported');
      return false;
    }
    if (this.hasNative()) return this._requestNative(silent);

    // متصفح عادي
    if (st === 'denied') {
      if (!silent) this._toast((typeof t === 'function' && t('notifDenied')) || 'Permission denied');
      return false;
    }
    try { return (await Notification.requestPermission()) === 'granted'; } catch (e) { return false; }
  },

  _requestNative(silent) {
    return new Promise((resolve) => {
      const started = Date.now();
      let done = false;
      let timer = null;
      const finish = (ok) => {
        if (done) return;
        done = true;
        window.removeEventListener('quba-perms', onPerms);
        if (timer) clearTimeout(timer);
        if (!ok && !silent) {
          // وصل الرد فورًا بلا حوار ← رُفض الإذن نهائيًا أو الإشعارات مغلقة من النظام:
          // نوجّه المستخدم لشاشة إعدادات الإشعارات.
          const quick = (Date.now() - started) < 900;
          this._toast(this._msg(
            'الإشعارات غير مفعّلة — فعّلها من إعدادات النظام',
            'Las notificaciones están desactivadas — actívalas en los ajustes del sistema',
            'Notifications are off — enable them in system settings'), 4200);
          if (quick) { try { window.Android.openNotificationSettings(); } catch (e) {} }
        }
        resolve(ok);
      };
      const onPerms = () => finish(this.isGranted());
      window.addEventListener('quba-perms', onPerms);
      timer = setTimeout(() => finish(this.isGranted()), 120000);
      try {
        window.Android.requestPermissions(JSON.stringify(['notifications']));
      } catch (e) { finish(false); }
    });
  },

  /**
   * v1.0.81: يُعاد إرسال طلب إذن الإشعارات عند كل فتح للتطبيق ما دام الإذن
   * مغلقًا (وليس مرفوضًا نهائيًا). قبل ذلك كان الطلب يحدث مرة واحدة في أول
   * تشغيل فقط، فإذا أغلق المستخدم الإشعارات لم يعد الطلب يظهر أبدًا.
   */
  async ensureAtLaunch() {
    if (this.isGranted()) return true;
    const st = this.state();
    if (st === 'unsupported' || st === 'denied') return false; // رفض نهائي: إعدادات النظام فقط
    if (this._asking) return false;
    this._asking = true;
    try { return await this.request({ silent: true }); }
    finally { setTimeout(() => { this._asking = false; }, 1500); }
  },
};

if (typeof window !== 'undefined') window.NotifPerm = NotifPerm;
