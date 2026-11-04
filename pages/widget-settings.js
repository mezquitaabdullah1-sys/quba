// 🧩 ويدجتس الشاشة الرئيسية — اختيار اللون والنمط + تثبيت ويدجت
const WidgetSettingsPage = {
  THEMES: [
    { id: 'emerald', c1: '#0F4C3A', c2: '#06301E', tx: '#FFFFFF', name: 'زمردي' },
    { id: 'gold', c1: '#E3C069', c2: '#B79333', tx: '#241A05', name: 'ذهبي' },
    { id: 'teal', c1: '#0E4A4A', c2: '#052A2A', tx: '#FFFFFF', name: 'فيروزي' },
    { id: 'maroon', c1: '#5A1230', c2: '#340A1C', tx: '#FFFFFF', name: 'عنّابي' },
    { id: 'navy', c1: '#12305A', c2: '#0A1C38', tx: '#FFFFFF', name: 'كحلي' },
    { id: 'plum', c1: '#2E1A47', c2: '#1A0E2B', tx: '#FFFFFF', name: 'بنفسجي' },
    { id: 'dark', c1: '#1A1D22', c2: '#090A0C', tx: '#F5F5F5', name: 'ليلي' },
    { id: 'cream', c1: '#FFF9EC', c2: '#EEDFC2', tx: '#22301E', name: 'عاجي' }
  ],
  WIDGETS: [
    { kind: 'prayer_bar', name: 'مواقيت الصلاة — شريط 4×1', desc: 'الصلاة القادمة + العدّ التنازلي + شريط التقدّم' },
    { kind: 'prayer_square', name: 'مواقيت الصلاة — مربّع 2×2', desc: 'العدّ التنازلي مع التاريخ الهجري' },
    { kind: 'prayer_list', name: 'مواقيت الصلاة — الصلوات الخمس 4×2', desc: 'المواقيت كاملة مع تمييز الصلاة القادمة' },
    { kind: 'prayer_photo', name: 'مواقيت الصلاة — خلفية المسجد 4×2', desc: 'صورة مصحوبة بطبقة تعتيم هادئة' },
    { kind: 'tasbih_bar', name: 'المسبحة — شريط 2×1', desc: 'عدّاد التسبيح + زر زيادة وإعادة' },
    { kind: 'tasbih_square', name: 'المسبحة — مربّع 2×2', desc: 'عدّاد كبير بأزرار مريحة للإصبع' },
    { kind: 'radio', name: 'الراديو — شريط 4×1', desc: 'يفتح الراديو مباشرة من الشاشة الرئيسية' },
    { kind: 'ayah', name: 'آية اليوم — 4×2', desc: 'آية متجدّدة كل يوم مع اسمها ورقمها' },
    { kind: 'hadith', name: 'حديث اليوم — 4×2', desc: 'حديث متجدّد كل يوم مع مصدره' },
    { kind: 'dua', name: 'دعاء اليوم — 4×2', desc: 'دعاء متجدّد كل يوم من أدعية التطبيق' },
    { kind: 'ramadan', name: 'العدّ التنازلي لرمضان — 2×2', desc: 'الأيام المتبقية وتاريخ اليوم الهجري' }
  ],

  cfg: { theme: 'emerald', style: 'grad' },

  load() {
    try {
      const raw = localStorage.getItem('quba_widget_cfg');
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.theme) this.cfg = { theme: o.theme, style: o.style === 'solid' ? 'solid' : 'grad' };
      }
    } catch (e) {}
  },

  save() {
    localStorage.setItem('quba_widget_cfg', JSON.stringify(this.cfg));
    try { if (window.WidgetBridge) WidgetBridge.save(this.cfg); } catch (e) {}
  },

  bg(t) {
    return this.cfg.style === 'solid' ? t.c1 : `linear-gradient(135deg, ${t.c1}, ${t.c2})`;
  },

  previewPrayer() {
    const t = this.THEMES.find(x => x.id === this.cfg.theme) || this.THEMES[0];
    const now = new Date();
    const p = (window.AppState && AppState.timings && AppState.timings.Maghrib) ? AppState.timings.Maghrib : '6:12 PM';
    return `
      <div class="wgs-prev-card" style="background:${this.bg(t)};color:${t.tx}">
        <div class="wgs-prev-row">
          <div>
            <div class="wgs-prev-l">الصلاة القادمة</div>
            <div class="wgs-prev-p">المغرب</div>
            <div class="wgs-prev-t">${p}</div>
          </div>
          <div class="wgs-prev-c">0:47</div>
        </div>
        <div class="wgs-prev-bar"><span style="width:62%"></span></div>
      </div>`;
  },

  previewSquare() {
    const t = this.THEMES.find(x => x.id === this.cfg.theme) || this.THEMES[0];
    return `
      <div class="wgs-prev-sq" style="background:${this.bg(t)};color:${t.tx}">
        <div class="wgs-prev-l">٨ جمادى الأولى ١٤٤٨ هـ</div>
        <div class="wgs-prev-l" style="margin-top:4px">الصلاة القادمة</div>
        <div class="wgs-prev-p" style="font-size:19px">العصر</div>
        <div class="wgs-prev-t">3:24 م</div>
        <div class="wgs-prev-c" style="font-size:17px;margin-top:auto">1:32</div>
      </div>`;
  },

  render() {
    this.load();
    const root = document.getElementById('main-content');
    root.innerHTML = `
      <div class="wgs-wrap">
        <div class="wgs-head">
          <button class="wgs-back" onclick="Router.go('profile')"><i class="fas fa-chevron-right"></i></button>
          <div>
            <h1>ويدجتس الشاشة الرئيسية</h1>
            <p>ألوان وأنماط موحّدة لكل الويدجتس</p>
          </div>
        </div>

        <div class="wgs-sec">
          <div class="wgs-sec-t">لون التصميم</div>
          <div class="wgs-themes">
            ${this.THEMES.map(t => `
              <button class="wgs-sw ${this.cfg.theme === t.id ? 'on' : ''}" data-theme="${t.id}"
                onclick="WidgetSettingsPage.setTheme('${t.id}')"
                style="background:linear-gradient(135deg,${t.c1},${t.c2})">
                <span>${t.name}</span>
              </button>`).join('')}
          </div>
        </div>

        <div class="wgs-sec">
          <div class="wgs-sec-t">نمط الخلفية</div>
          <div class="wgs-styles">
            <button class="wgs-st ${this.cfg.style === 'grad' ? 'on' : ''}" onclick="WidgetSettingsPage.setStyle('grad')">تدرّج</button>
            <button class="wgs-st ${this.cfg.style === 'solid' ? 'on' : ''}" onclick="WidgetSettingsPage.setStyle('solid')">لون واحد</button>
          </div>
        </div>

        <div class="wgs-sec">
          <div class="wgs-sec-t">معاينة</div>
          <div class="wgs-previews">
            ${this.previewPrayer()}
            ${this.previewSquare()}
          </div>
          <p class="wgs-note">الحجم في المعاينة تقريبي — على الشاشة الرئيسية يتكيّف مع حجم البطاقة.</p>
        </div>

        <div class="wgs-sec">
          <div class="wgs-sec-t">أضف ويدجت</div>
          <div class="wgs-list">
            ${this.WIDGETS.map(w => `
              <div class="wgs-item">
                <div>
                  <div class="wgs-item-n">${w.name}</div>
                  <div class="wgs-item-d">${w.desc}</div>
                </div>
                <button class="wgs-add" onclick="WidgetSettingsPage.pin('${w.kind}')">إضافة</button>
              </div>`).join('')}
          </div>
        </div>

        <div class="wgs-foot">
          <button class="wgs-save" onclick="WidgetSettingsPage.saveNow()">حفظ الألوان وتطبيقها</button>
          <p class="wgs-note">تُطبَّق الألوان على كل الويدجتس المثبّتة فورًا.</p>
        </div>
      </div>`;
  },

  setTheme(id) { this.cfg.theme = id; this.save(); this.render(); },
  setStyle(s) { this.cfg.style = s; this.save(); this.render(); },
  saveNow() {
    this.save();
    if (window.showToast) showToast('تم تطبيق الألوان على الويدجتس', 2000);
  },
  pin(kind) {
    try {
      if (window.WidgetBridge) WidgetBridge.pin(kind);
      else if (window.showToast) showToast('التثبيت متاح داخل التطبيق فقط', 2200);
    } catch (e) {}
  }
};
