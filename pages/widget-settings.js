// 🧩 ويدجتس الشاشة الرئيسية — صفحة واحدة مرتّبة: معاينة حيّة + لون + نمط + إضافة
// v1.0.146: إعادة تصميم كاملة — تحديث في المكان بلا إعادة رسم (لا يقفز التمرير)،
// مجموعات واضحة للأدوات، ولا زر «حفظ» مكرّر لأن كل تغيير يُطبَّق فورًا.
const WidgetSettingsPage = {
  THEMES: [
    { id: 'emerald', c1: '#0F4C3A', c2: '#06301E', tx: '#FFFFFF', ac: '#E8C877', name: 'زمردي' },
    { id: 'gold', c1: '#E3C069', c2: '#B79333', tx: '#241A05', ac: '#0F4C3A', name: 'ذهبي' },
    { id: 'teal', c1: '#0E4A4A', c2: '#052A2A', tx: '#FFFFFF', ac: '#E8C877', name: 'فيروزي' },
    { id: 'maroon', c1: '#5A1230', c2: '#340A1C', tx: '#FFFFFF', ac: '#E8C877', name: 'عنّابي' },
    { id: 'navy', c1: '#12305A', c2: '#0A1C38', tx: '#FFFFFF', ac: '#E8C877', name: 'كحلي' },
    { id: 'plum', c1: '#2E1A47', c2: '#1A0E2B', tx: '#FFFFFF', ac: '#E8C877', name: 'بنفسجي' },
    { id: 'dark', c1: '#1A1D22', c2: '#090A0C', tx: '#F5F5F5', ac: '#E8C877', name: 'ليلي' },
    { id: 'cream', c1: '#FFF9EC', c2: '#EEDFC2', tx: '#22301E', ac: '#8A6A1E', name: 'عاجي' }
  ],

  GROUPS: [
    {
      title: 'أدوات الصلاة', icon: 'fa-mosque',
      items: [
        { kind: 'prayer_bar', icon: 'fa-clock', size: '4×1', name: 'الصلاة القادمة — شريط', desc: 'العدّ التنازلي وشريط التقدّم' },
        { kind: 'prayer_square', icon: 'fa-stopwatch', size: '2×2', name: 'الصلاة القادمة — مربّع', desc: 'مع التاريخ الهجري' },
        { kind: 'prayer_list', icon: 'fa-list-ul', size: '4×2', name: 'الصلوات الخمس', desc: 'مواقيت اليوم كاملة' },
        { kind: 'prayer_photo', icon: 'fa-image', size: '4×2', name: 'بخلفية المسجد', desc: 'صورة مع طبقة تعتيم' }
      ]
    },
    {
      title: 'المسبحة', icon: 'fa-hand-holding-heart',
      items: [
        { kind: 'tasbih_bar', icon: 'fa-plus-circle', size: '2×1', name: 'المسبحة — شريط', desc: 'عدّاد وزرّا زيادة وإعادة' },
        { kind: 'tasbih_square', icon: 'fa-circle', size: '2×2', name: 'المسبحة — مربّع', desc: 'عدّاد كبير بأزرار مريحة' },
        { kind: 'tasbih_beads', icon: 'fa-circle-nodes', size: '4×2', name: 'المسبحة — خرز', desc: 'خيط خرز حقيقي بالضغط على الخرزة' }
      ]
    },
    {
      title: 'الذكر اليومي', icon: 'fa-book-open',
      items: [
        { kind: 'ayah', icon: 'fa-quran', size: '4×2', name: 'آية اليوم', desc: 'آية متجدّدة كل يوم' },
        { kind: 'hadith', icon: 'fa-comment-dots', size: '4×2', name: 'حديث اليوم', desc: 'حديث متجدّد مع مصدره' },
        { kind: 'dua', icon: 'fa-hands', size: '4×2', name: 'دعاء اليوم', desc: 'دعاء متجدّد من أدعية التطبيق' }
      ]
    },
    {
      title: 'أخرى', icon: 'fa-ellipsis-h',
      items: [
        { kind: 'radio', icon: 'fa-broadcast-tower', size: '4×1', name: 'الراديو', desc: 'يشغّل الراديو مباشرة' },
        { kind: 'ramadan', icon: 'fa-moon', size: '2×2', name: 'العدّ التنازلي لرمضان', desc: 'الأيام المتبقية والتاريخ الهجري' }
      ]
    }
  ],

  BEADS: [
    { id: 'amber', c1: '#FFDA92', c2: '#E29B27', c3: '#7A3C03', name: 'عنبر' },
    { id: 'butterscotch', c1: '#FFF2D4', c2: '#E7B45E', c3: '#8E5A14', name: 'زبدة' },
    { id: 'kuka', c1: '#9A6634', c2: '#4C2B10', c3: '#180B03', name: 'كوكا' },
    { id: 'sandalwood', c1: '#E6BC82', c2: '#AE7633', c3: '#5A320C', name: 'صندل' },
    { id: 'olivewood', c1: '#DCC08A', c2: '#A5793A', c3: '#3C2708', name: 'زيتون' },
    { id: 'ebony', c1: '#6A5A4C', c2: '#241B14', c3: '#060403', name: 'أبنوس' },
    { id: 'onyx', c1: '#454D54', c2: '#14171A', c3: '#000000', name: 'أونيكس' },
    { id: 'agate', c1: '#F6E7D0', c2: '#BE7C42', c3: '#4A2410', name: 'عقيق' },
    { id: 'carnelian', c1: '#FFB183', c2: '#C4400F', c3: '#470B01', name: 'كرنيليان' },
    { id: 'turquoise', c1: '#9BE9E1', c2: '#23A79E', c3: '#064A46', name: 'فيروز' },
    { id: 'lapis', c1: '#6B84E2', c2: '#1A2A7C', c3: '#050A2B', name: 'لازورد' },
    { id: 'coral', c1: '#FFB6A0', c2: '#EF6C4E', c3: '#8C2A14', name: 'مرجان' },
    { id: 'jade', c1: '#B2EBC8', c2: '#3E9A6C', c3: '#0A3A25', name: 'يشب' },
    { id: 'hematite', c1: '#D2DAE3', c2: '#59626C', c3: '#0D1217', name: 'هيماتيت' },
    { id: 'crystal', c1: '#FFFFFF', c2: '#EAE4CC', c3: '#8B8266', name: 'كريستال' },
    { id: 'pearl', c1: '#FFFFFF', c2: '#F1E7D3', c3: '#A4987F', name: 'لؤلؤ' },
    { id: 'gold', c1: '#FFF9DC', c2: '#D4AF37', c3: '#6B4A03', name: 'ذهب' },
    { id: 'silver', c1: '#FFFFFF', c2: '#AAB0BA', c3: '#3F454E', name: 'فضة' },
    { id: 'marble', c1: '#FFFDF9', c2: '#DFD7CB', c3: '#8C8377', name: 'رخام' }
  ],
  BEAD_SHAPES: [
    { id: 'round', name: 'كروي' }, { id: 'oval', name: 'بيضاوي' },
    { id: 'barrel', name: 'برميلي' }, { id: 'disc', name: 'قرصي' },
    { id: 'facet', name: 'مخرّط' }, { id: 'hex', name: 'سداسي' },
    { id: 'octagon', name: 'ثماني' }, { id: 'diamond', name: 'معيّن' },
    { id: 'square', name: 'مربّع' }, { id: 'ring', name: 'حلقي' }
  ],

  cfg: { theme: 'emerald', style: 'grad', beadDesign: 'amber', beadShape: 'round' },
  pv: 'prayer_bar',

  /* ---------- الإعدادات ---------- */
  load() {
    try {
      const raw = localStorage.getItem('quba_widget_cfg');
      if (raw) {
        const o = JSON.parse(raw);
        const ok = o && this.THEMES.some(t => t.id === o.theme);
        if (ok) this.cfg = {
          theme: o.theme,
          style: o.style === 'solid' ? 'solid' : 'grad',
          beadDesign: this.BEADS.some(b => b.id === o.beadDesign) ? o.beadDesign : 'amber',
          beadShape: this.BEAD_SHAPES.some(b => b.id === o.beadShape) ? o.beadShape : 'round'
        };
      }
    } catch (e) {}
  },

  save() {
    try { localStorage.setItem('quba_widget_cfg', JSON.stringify(this.cfg)); } catch (e) {}
    try { if (window.WidgetBridge) WidgetBridge.save(this.cfg); } catch (e) {}
  },

  theme() {
    return this.THEMES.find(t => t.id === this.cfg.theme) || this.THEMES[0];
  },

  /** صورة ساكنة لخيط الخرز بنفس الخامة المختارة */
  beadStrip(design, shape) {
    const b = this.BEADS.find(x => x.id === design) || this.BEADS[0];
    const cells = [];
    for (let i = 0; i < 9; i++) {
      const u = i / 8 * 2 - 1;
      const x = 50 + u * 46;
      const y = 30 + 11 * (1 - u * u);
      const rad = shape === 'oval' ? [11, 8] : shape === 'disc' ? [11, 7] : shape === 'barrel' ? [9, 11] : [10, 10];
      cells.push(`<span style="position:absolute;left:${x}%;top:${y}px;transform:translate(-50%,-50%);
        width:${rad[0]}px;height:${rad[1]}px;border-radius:${shape === 'square' ? '24%' : shape === 'hex' ? '26%' : '50%'};
        background:radial-gradient(circle at 33% 26%, ${b.c1} 0%, ${b.c2} 52%, ${b.c3} 100%);
        box-shadow:inset -1px -2px 4px rgba(0,0,0,.45), 0 2px 5px rgba(0,0,0,.35);"></span>`);
    }
    return `<div style="position:relative;height:62px;margin:2px 0 6px">${cells.join('')}</div>`;
  },

  /* ---------- المعاينة ---------- */
  pvHTML(kind) {
    if (kind === 'prayer_square') {
      return `<div class="wgs-pv wgs-pv-sq">
        <div class="wgs-pv-h">٨ جمادى الأولى ١٤٤٨ هـ</div>
        <div class="wgs-pv-l">الصلاة القادمة</div>
        <div class="wgs-pv-p">العصر</div>
        <div class="wgs-pv-s">3:24 م</div>
        <div class="wgs-pv-c">1:32</div>
      </div>`;
    }
    if (kind === 'tasbih_beads') {
      const b = this.BEADS.find(x => x.id === this.cfg.beadDesign) || this.BEADS[0];
      return `<div class="wgs-pv wgs-pv-beads">
        <div class="wgs-pv-h">${b.name} · ${(this.BEAD_SHAPES.find(s => s.id === this.cfg.beadShape) || {}).name || ''}</div>
        ${this.beadStrip(this.cfg.beadDesign, this.cfg.beadShape)}
        <div class="wgs-pv-r"><span class="wgs-pv-l">اضغط الخرزة للعدّ</span><span class="wgs-pv-s">0 / ٣٣</span></div>
      </div>`;
    }
    if (kind === 'ayah') {
      return `<div class="wgs-pv wgs-pv-ayah">
        <div class="wgs-pv-h">آية اليوم</div>
        <div class="wgs-pv-q">﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴾</div>
        <div class="wgs-pv-s">الطلاق · ٢</div>
      </div>`;
    }
    return `<div class="wgs-pv wgs-pv-bar">
      <div class="wgs-pv-r">
        <div>
          <div class="wgs-pv-l">الصلاة القادمة</div>
          <div class="wgs-pv-p">المغرب</div>
          <div class="wgs-pv-s">6:12 م</div>
        </div>
        <div class="wgs-pv-c">0:47</div>
      </div>
      <div class="wgs-pv-track"><i></i></div>
    </div>`;
  },

  /* ---------- الرسم ---------- */
  render() {
    this.load();
    const root = document.getElementById('main-content');
    const t = this.theme();
    const grid = (bg) => bg;

    root.innerHTML = `
      <div class="wgs-wrap">
        <div class="wgs-head">
          <button class="wgs-back" onclick="Router.go('profile')" aria-label="رجوع"><i class="fas fa-chevron-right"></i></button>
          <div class="wgs-head-t">
            <h1>ويدجتس الشاشة الرئيسية</h1>
            <p>لون واحد ونمط واحد لكل الأدوات</p>
          </div>
        </div>

        <div class="wgs-stage" id="wgs-stage" data-style="${this.cfg.style}">
          <div class="wgs-stage-glow"></div>
          <div class="wgs-tabs" role="tablist">
            <button class="wgs-tab ${this.pv === 'prayer_bar' ? 'on' : ''}" data-pv="prayer_bar" onclick="WidgetSettingsPage.setPreview('prayer_bar')">شريط</button>
            <button class="wgs-tab ${this.pv === 'prayer_square' ? 'on' : ''}" data-pv="prayer_square" onclick="WidgetSettingsPage.setPreview('prayer_square')">مربّع</button>
            <button class="wgs-tab ${this.pv === 'ayah' ? 'on' : ''}" data-pv="ayah" onclick="WidgetSettingsPage.setPreview('ayah')">آية</button>
            <button class="wgs-tab ${this.pv === 'tasbih_beads' ? 'on' : ''}" data-pv="tasbih_beads" onclick="WidgetSettingsPage.setPreview('tasbih_beads')">خرز</button>
          </div>
          <div class="wgs-stage-in" id="wgs-stage-in">${this.pvHTML(this.pv)}</div>
          <div class="wgs-stage-cap">معاينة تقريبية — الحجم على الجهاز يتبع حجم البطاقة</div>
        </div>

        <div class="wgs-sec">
          <div class="wgs-sec-h"><span>لون التصميم</span><em id="wgs-now">${t.name}</em></div>
          <div class="wgs-chips">
            ${this.THEMES.map(x => `
              <button class="wgs-chip ${this.cfg.theme === x.id ? 'on' : ''}" data-wt="${x.id}"
                onclick="WidgetSettingsPage.setTheme('${x.id}')">
                <span class="wgs-dot" style="background:linear-gradient(135deg,${x.c1},${x.c2})"></span>
                <span class="wgs-chip-n">${x.name}</span>
              </button>`).join('')}
          </div>
        </div>

        <div class="wgs-sec">
          <div class="wgs-sec-h"><span>الخلفية</span></div>
          <div class="wgs-seg">
            <button class="${this.cfg.style === 'grad' ? 'on' : ''}" data-st="grad" onclick="WidgetSettingsPage.setStyle('grad')">تدرّج</button>
            <button class="${this.cfg.style === 'solid' ? 'on' : ''}" data-st="solid" onclick="WidgetSettingsPage.setStyle('solid')">لون واحد</button>
          </div>
        </div>

        <div class="wgs-sec">
          <div class="wgs-sec-h"><span>خامة المسبحة</span><em id="wgs-bead-now">${(this.BEADS.find(b => b.id === this.cfg.beadDesign) || this.BEADS[0]).name}</em></div>
          <div class="wgs-beads">
            ${this.BEADS.map(b => `
              <button class="wgs-bead ${this.cfg.beadDesign === b.id ? 'on' : ''}" data-bd="${b.id}"
                onclick="WidgetSettingsPage.setBead('${b.id}')" title="${b.name}">
                <span style="background:radial-gradient(circle at 33% 26%, ${b.c1} 0%, ${b.c2} 52%, ${b.c3} 100%)"></span>
              </button>`).join('')}
          </div>
          <div class="wgs-bshapes">
            ${this.BEAD_SHAPES.map(sh => `
              <button class="wgs-bshape ${this.cfg.beadShape === sh.id ? 'on' : ''}" data-bs="${sh.id}"
                onclick="WidgetSettingsPage.setBeadShape('${sh.id}')">${sh.name}</button>`).join('')}
          </div>
          <p class="wgs-note">تخصّ ويدجت «المسبحة — خرز» فقط.</p>
        </div>

        <div class="wgs-sec">
          <div class="wgs-sec-h"><span>أضف أداة</span><em>${this.GROUPS.reduce((n, g) => n + g.items.length, 0)} أدوات</em></div>
          ${this.GROUPS.map(g => `
            <div class="wgs-grp">
              <div class="wgs-grp-t"><i class="fas ${g.icon}"></i>${g.title}</div>
              ${g.items.map(w => `
                <div class="wgs-item">
                  <span class="wgs-item-i"><i class="fas ${w.icon}"></i></span>
                  <span class="wgs-item-x">
                    <span class="wgs-item-n">${w.name}<b class="wgs-size">${w.size}</b></span>
                    <span class="wgs-item-d">${w.desc}</span>
                  </span>
                  <button class="wgs-add" onclick="WidgetSettingsPage.pin('${w.kind}')" aria-label="إضافة ${w.name}"><i class="fas fa-plus"></i></button>
                </div>`).join('')}
            </div>`).join('')}
          <div class="wgs-tip">
            <i class="fas fa-circle-info"></i>
            <span>إن لم تظهر نافذة التثبيت: اضغط مطوّلًا على مكان فارغ في الشاشة الرئيسية ← الأدوات ← قُبا.</span>
          </div>
        </div>

        <div class="wgs-sec">
          <div class="wgs-sec-h"><span>كيف أضيف ويدجت؟</span></div>
          <ol class="wgs-guide">
            <li><b>اضغط مطوّلًا</b> على مكان فارغ في الشاشة الرئيسية.</li>
            <li>اختر <b>«الأدوات»</b> (Widgets) من القائمة التي تظهر.</li>
            <li>ابحث عن <b>«قُبا»</b> في قائمة التطبيقات، ثم اضغط الأداة المطلوبة.</li>
            <li><b>اسحبها</b> إلى مكانها — ويمكن تغيير حجمها بالضغط المطوّل ثم السحب من الحواف.</li>
          </ol>
          <div class="wgs-tip">
            <i class="fas fa-bolt"></i>
            <span>أسرع طريقة: اضغط زر <b>+</b> أمام أي أداة أعلاه — يفتح التطبيق نافذة التثبيت مباشرة (أندرويد ٨ وأحدث).</span>
          </div>
          <div class="wgs-tip wgs-tip-warn">
            <i class="fas fa-triangle-exclamation"></i>
            <span>إن ظهرت رسالة <b>«Couldn't add widget»</b>: أعد تشغيل الهاتف ثم أعد المحاولة، وتأكّد أن عدد الأدوات على الشاشة لم يبلغ حدّ المشغّل.</span>
          </div>
          <div class="wgs-tip">
            <i class="fas fa-clock-rotate-left"></i>
            <span>الأدوات تتحدّث تلقائيًا كل نصف ساعة، ومواقيت الصلاة كل دقيقة. بعد تغيير الألوان تُطبَّق فورًا.</span>
          </div>
        </div>

        <div class="wgs-apply">
          <div class="wgs-apply-t"><i class="fas fa-check-circle"></i> التغييرات تُطبَّق فورًا على كل أداة مثبَّتة</div>
          <button class="wgs-refresh" onclick="WidgetSettingsPage.refresh()">تحديث الأدوات</button>
        </div>
      </div>`;

    this.paint();
  },

  /** يُحدّث المعاينة والشرائح في المكان — بلا إعادة رسم الصفحة. */
  paint() {
    const stage = document.getElementById('wgs-stage');
    if (!stage) return;
    const t = this.theme();
    stage.dataset.style = this.cfg.style;
    stage.style.setProperty('--wg1', t.c1);
    stage.style.setProperty('--wg2', this.cfg.style === 'solid' ? t.c1 : t.c2);
    stage.style.setProperty('--wtx', t.tx);
    stage.style.setProperty('--wac', t.ac);
    const now = document.getElementById('wgs-now');
    if (now) now.textContent = t.name;
    document.querySelectorAll('.wgs-chip').forEach(b => b.classList.toggle('on', b.dataset.wt === this.cfg.theme));
    document.querySelectorAll('.wgs-seg button').forEach(b => b.classList.toggle('on', b.dataset.st === this.cfg.style));
    document.querySelectorAll('.wgs-tab').forEach(b => b.classList.toggle('on', b.dataset.pv === this.pv));
    document.querySelectorAll('.wgs-bead').forEach(b => b.classList.toggle('on', b.dataset.bd === this.cfg.beadDesign));
    document.querySelectorAll('.wgs-bshape').forEach(b => b.classList.toggle('on', b.dataset.bs === this.cfg.beadShape));
    const bn = document.getElementById('wgs-bead-now');
    if (bn) bn.textContent = (this.BEADS.find(b => b.id === this.cfg.beadDesign) || this.BEADS[0]).name;
  },

  /* ---------- الإجراءات ---------- */
  setTheme(id) {
    if (!this.THEMES.some(t => t.id === id)) return;
    this.cfg.theme = id;
    this.paint();
    this.save();
  },

  setStyle(s) {
    this.cfg.style = s === 'solid' ? 'solid' : 'grad';
    this.paint();
    this.save();
  },

  setPreview(kind) {
    this.pv = kind;
    const box = document.getElementById('wgs-stage-in');
    if (box) box.innerHTML = this.pvHTML(kind);
    this.paint();
  },

  setBead(id) {
    if (!this.BEADS.some(b => b.id === id)) return;
    this.cfg.beadDesign = id;
    if (this.pv === 'tasbih_beads') {
      const box = document.getElementById('wgs-stage-in');
      if (box) box.innerHTML = this.pvHTML('tasbih_beads');
    }
    this.paint();
    this.save();
  },

  setBeadShape(id) {
    if (!this.BEAD_SHAPES.some(b => b.id === id)) return;
    this.cfg.beadShape = id;
    if (this.pv === 'tasbih_beads') {
      const box = document.getElementById('wgs-stage-in');
      if (box) box.innerHTML = this.pvHTML('tasbih_beads');
    }
    this.paint();
    this.save();
  },

  pin(kind) {
    try {
      if (window.WidgetBridge && window.Android && Android.pinWidget) {
        WidgetBridge.pin(kind);
        if (window.showToast) showToast('اتبع نافذة التثبيت لإضافة الأداة', 2200);
      } else if (window.showToast) {
        showToast('التثبيت متاح داخل التطبيق فقط', 2200);
      }
    } catch (e) {}
  },

  refresh() {
    try { if (window.WidgetBridge) WidgetBridge.refresh(); } catch (e) {}
    if (window.showToast) showToast('تم تحديث الأدوات المثبَّتة', 1800);
  }
};
