// 🕌 PrayerVisuals (v1.0.72) — خلفيات وأيقونات وبانر خفيف لكل صلاة.
//
// لكل صلاة: خلفية فاتحة مولّدة (assets/prayers/<name>.webp)، أيقونة Font Awesome،
// لونان للتدرّج، واسم عربي. تُستخدم في:
//   • خلفية صفّ الصلاة في تبويب «مواقيت اليوم»
//   • بانر «الصلاة القادمة» أعلى القائمة
//   • شارة الأيقونة الملوّنة
// الصور خفيفة (٣-٤ كيلوبايت) ووحدها تُحمَّل محليًا — لا شبكة.
const PrayerVisuals = {
  // الترتيب يتبع ترتيب الصلوات اليومية
  ORDER: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],

  MAP: {
    Fajr:    { bg: 'assets/prayers/fajr.webp',    icon: 'fa-cloud-sun',   c1: '#8E7CC3', c2: '#F6C6D0', ar: 'الفجر'   },
    Dhuhr:   { bg: 'assets/prayers/dhuhr.webp',   icon: 'fa-sun',         c1: '#2E86C1', c2: '#BFE3F5', ar: 'الظهر'   },
    Asr:     { bg: 'assets/prayers/asr.webp',     icon: 'fa-cloud-sun',   c1: '#D68910', c2: '#FBE5C0', ar: 'العصر'   },
    Maghrib: { bg: 'assets/prayers/maghrib.webp', icon: 'fa-mosque',      c1: '#C0616B', c2: '#FBD9CF', ar: 'المغرب'  },
    Isha:    { bg: 'assets/prayers/isha.webp',    icon: 'fa-moon',        c1: '#5B5EA6', c2: '#CBD2F0', ar: 'العشاء'  },
  },

  get(name) { return this.MAP[name] || null; },

  /** مسار الخلفية أو '' إن لم تكن الصلاة معروفة. */
  bg(name) { const v = this.get(name); return v ? v.bg : ''; },

  /** أيقونة Font Awesome (اسم بلا fa-). */
  icon(name) { const v = this.get(name); return v ? v.icon : 'fa-clock'; },

  /** تدرّج لوني مناسب للصلاة (يُستخدم في الشارة والحدود). */
  gradient(name) {
    const v = this.get(name);
    return v ? `linear-gradient(135deg, ${v.c1}, ${v.c2})` : 'linear-gradient(135deg,#0F4C3A,#17694F)';
  },

  /** النمط المضمّن لخلفية صفّ الصلاة: صورة فاتحة + طبقة شفافة لقراءة النص. */
  rowStyle(name) {
    const v = this.get(name);
    if (!v) return '';
    return `--pv-bg:url('${v.bg}');--pv-c1:${v.c1};--pv-c2:${v.c2};`;
  },

  /**
   * بانر «الصلاة القادمة» — خلفية الصلاة + أيقونتها + اسمها + وقتها + المتبقي.
   * @param {string} name     مفتاح الصلاة (Fajr…Isha)
   * @param {string} timeText الوقت المنسّق (١٢ ساعة)
   * @param {string} remain   نص الوقت المتبقي (اختياري)
   */
  bannerHtml(name, timeText, remain) {
    const v = this.get(name);
    if (!v) return '';
    const label = (typeof t === 'function' && t('prayers.' + name)) || v.ar;
    return `
      <div class="pv-banner" data-pv-name="${name}" style="${this.rowStyle(name)}">
        <span class="pv-banner-icon"><i class="fas ${v.icon}"></i></span>
        <span class="pv-banner-info">
          <span class="pv-banner-label">${(typeof t === 'function' && t('nextPrayer')) || 'الصلاة القادمة'}</span>
          <span class="pv-banner-name">${label} <span class="pv-banner-ar">${v.ar}</span></span>
        </span>
        <span class="pv-banner-time">
          <span class="pv-banner-clock">${timeText || ''}</span>
          ${remain ? `<span class="pv-banner-remain"><i class="fas fa-hourglass-half"></i> ${remain}</span>` : ''}
        </span>
      </div>`;
  },

  /** شارة أيقونة صغيرة ملوّنة تُوضع داخل صفّ الصلاة. */
  badgeHtml(name) {
    const v = this.get(name);
    if (!v) return '';
    return `<span class="pv-badge" style="background:${this.gradient(name)};"><i class="fas ${v.icon}"></i></span>`;
  },
};

if (typeof window !== 'undefined') window.PrayerVisuals = PrayerVisuals;
