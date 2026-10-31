// 🎨 TajweedColors — تلوين النص القرآني حسب أحكام التجويد والتلاوة
// v1.0.74: محرّك مضبوط على أحكام التجويد (يعمل محليًا ١٠٠٪ أوفلاين بلا مكتبات):
//   ghunnah          : غنة مشدّدة (ن/م + شدة)                         — أخضر
//   ikhfa            : إخفاء حقيقي (نون ساكنة/تنوين + ١٥ حرفًا)        — بنفسجي
//   idgham-ghunnah   : إدغام بغنة (ي ن م و)                            — سماوي
//   idgham           : إدغام بغير غنة (ل ر)                            — أزرق مخضرّ
//   iqlab            : إقلاب (نون ساكنة/تنوين + باء)                   — برتقالي
//   izhar            : إظهار حلقي (ء ه ع ح غ خ)                        — رمادي
//   qalqalah         : قلقلة (ق ط ب ج د)                               — أحمر
//   madd-tabii       : مد طبيعي (حركتان)                               — أزرق
//   madd-muttasil    : مد متصل (حرف مد + همزة في الكلمة نفسها)         — نيلي
//   madd-munfasil    : مد منفصل (حرف مد آخر الكلمة + همزة أول التالية) — أزرق فاتح
//   madd-lazim       : مد لازم (حرف مد + حرف مشدّد/سكون لازم)          — بنفسجي داكن
//   madd-arid        : مد عارض للسكون (حرف مد + سكون في آخر الكلمة)     — رمادي مزرق
//   laam             : لام شمسية (ال + حرف شمسي)                       — ذهبي
// تصحيح مهم عن الإصدار السابق: «ح» و«خ» ليستا من حروف الإخفاء بل من حروف
// الإظهار الحلقي، وفُصل الإدغام بغنة عن الإدغام بغير غنة، وفُصّلت أنواع المدود.
const TajweedColors = {
  // ── مجموعات الحروف (وفق أحكام التجويد) ─────────────────────────────
  IZHAR: 'ءأإآهعحغخ',        // الإظهار الحلقي — ٦ حروف
  IDGHAM_GH: 'ينمو',          // إدغام بغنة — ٤ حروف
  IDGHAM_NG: 'لر',            // إدغام بغير غنة — حرفان
  IKHFA: 'صذثكجشقسدطزفتضظ',   // الإخفاء الحقيقي — ١٥ حرفًا (بلا ح/خ)
  QALQ: 'قطبجد',              // القلقلة — ٥ حروف
  SHAMSI: 'تثدذرزسشصضطظلن',   // اللام الشمسية — ١٤ حرفًا
  HAMZA: 'ءأإآئؤ',            // الهمزات
  TANWEEN: '\u064B\u064C\u064D',
  FATHA: '\u064E', DAMMA: '\u064F', KASRA: '\u0650',
  SHADDA: '\u0651', SUKUN: '\u0652',
  ALIF_MADDA: '\u0622',

  _esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  _span(cls, text) {
    return `<span class="tjw-${cls}">${this._esc(text)}</span>`;
  },

  /** علامة تشكيل أو علامة وقف قرآنية */
  _isDiac(ch) {
    if (!ch) return false;
    const c = ch.charCodeAt(0);
    return (c >= 0x064B && c <= 0x0652)   // تنوين + حركات + شدة + سكون
        || c === 0x0653 || c === 0x0654 || c === 0x0655
        || c === 0x0670                   // ألف خنجرية
        || c === 0x0640                   // تطويل
        || (c >= 0x06D6 && c <= 0x06ED)   // علامات الوقف
        || (c >= 0x0610 && c <= 0x061A);
  },

  /** تقسيم النص إلى «وحدات»: كل حرف أساسي مع علاماته التالية له */
  _units(text) {
    const chars = Array.from(String(text));
    const n = chars.length;
    const out = [];
    for (let k = 0; k < n; k++) {
      const c = chars[k];
      if (this._isDiac(c)) {
        if (out.length && !out[out.length - 1].space) {
          out[out.length - 1].marks += c;
          out[out.length - 1].text += c;
        }
        continue;
      }
      if (c === ' ' || c === '\u00A0' || c === '\u200f' || c === '\u200e') {
        out.push({ base: c, marks: '', text: c, space: true });
        continue;
      }
      out.push({ base: c, marks: '', text: c, space: false });
    }
    return out;
  },

  /** الحرف التالي غير الفارغ + هل عبرنا مسافة (لتحديد حدود الكلمة) */
  _nextLetter(units, i) {
    let j = i + 1, crossed = false;
    while (j < units.length) {
      if (units[j].space) { crossed = true; j++; continue; }
      return { u: units[j], idx: j, crossed };
    }
    return { u: null, idx: -1, crossed };
  },

  _prevLetter(units, i) {
    let j = i - 1;
    while (j >= 0) {
      if (units[j].space) { j--; continue; }
      return units[j];
    }
    return null;
  },

  /** هل هذه الوحدة آخر حرف في الكلمة؟ (تُستخدم للمد العارض وللقلقلة) */
  _isWordEnd(units, i) {
    let j = i + 1;
    while (j < units.length) {
      if (units[j].space) return true;
      if (units[j].marks) { j++; continue; }
      return false;
    }
    return true; // آخر الأية
  },

  /** هل الوحدة مشدّدة؟ */
  _hasShadda(u) { return !!(u && u.marks && u.marks.indexOf(this.SHADDA) !== -1); },
  _hasSukun(u)  { return !!(u && u.marks && u.marks.indexOf(this.SUKUN) !== -1); },
  _isHaraka(ch) { return ch === this.FATHA || ch === this.DAMMA || ch === this.KASRA; },
  _hasHaraka(u) { return !!(u && u.marks && (u.marks.indexOf(this.FATHA) !== -1 || u.marks.indexOf(this.DAMMA) !== -1 || u.marks.indexOf(this.KASRA) !== -1)); },
  _hasTanween(u) { return !!(u && u.marks && /[\u064B\u064C\u064D]/.test(u.marks)); },

  /** يلوّن نص آية كاملاً ويعيد HTML آمناً (النص الأصلي لا يحوي HTML). */
  colorize(text) {
    if (!text) return '';
    const units = this._units(text);
    const n = units.length;
    let out = '';
    let i = 0;

    while (i < n) {
      const u = units[i];
      if (u.space) { out += this._esc(u.text); i++; continue; }

      const nxt = this._nextLetter(units, i);

      // ── 1) اللام الشمسية: «ا/ٱ» + «ل» + حرف شمسي مشدّد ────────────
      if ((u.base === 'ا' || u.base === '\u0671') && nxt.u && nxt.u.base === 'ل') {
        const after = this._nextLetter(units, nxt.idx);
        if (after.u && this.SHAMSI.indexOf(after.u.base) !== -1 && this._hasShadda(after.u)) {
          out += this._span('laam', u.text + nxt.u.text);
          i = nxt.idx + 1;
          continue;
        }
      }

      // ── 2) غنة مشدّدة: نون أو ميم + شدة ────────────────────────────
      if ((u.base === 'ن' || u.base === 'م') && this._hasShadda(u)) {
        out += this._span('ghunnah', u.text);
        i++;
        continue;
      }

      // ── 3) القلقلة: حرف من «قطبجد» ساكن أو مشدّد أو في آخر الكلمة ──
      if (this.QALQ.indexOf(u.base) !== -1) {
        if (this._hasShadda(u) || this._hasSukun(u)) {
          out += this._span('qalqalah', u.text);
          i++;
          continue;
        }
        // قلقلة كبرى: آخر الكلمة يُوقف عليه بالسكون (بلا حركة ظاهرة)
        if (!this._hasHaraka(u) && this._isWordEnd(units, i)) {
          out += this._span('qalqalah', u.text);
          i++;
          continue;
        }
      }

      // ── 4) النون الساكنة والتنوين: إظهار/إدغام/إقلاب/إخفاء ─────────
      const isTanween = this._hasTanween(u);
      const noonSakina = (u.base === 'ن' && !this._hasShadda(u) && !this._hasHaraka(u));
      if ((isTanween || noonSakina) && nxt.u) {
        const target = nxt.u.base;
        const seg = u.text;
        if (target === 'ب') { out += this._span('iqlab', seg); i++; continue; }
        if (this.IDGHAM_GH.indexOf(target) !== -1) { out += this._span('idgham-ghunnah', seg); i++; continue; }
        if (this.IDGHAM_NG.indexOf(target) !== -1 && nxt.crossed) { out += this._span('idgham', seg); i++; continue; }
        if (this.IZHAR.indexOf(target) !== -1) { out += this._span('izhar', seg); i++; continue; }
        if (this.IKHFA.indexOf(target) !== -1) { out += this._span('ikhfa', seg); i++; continue; }
        out += this._esc(seg); i++; continue;
      }

      // ── 5) المدود: حرف مد بعد حركة مجانسة ──────────────────────────
      const prev = this._prevLetter(units, i);
      const prevMarks = prev ? prev.marks : '';
      let maddCls = null;
      if (u.base === 'ا' || u.base === '\u0649') {
        if (prevMarks.indexOf(this.FATHA) !== -1) maddCls = 'madd-tabii';
      } else if (u.base === '\u0622') {          // آ (ألف ممدودة)
        maddCls = 'madd-tabii';
      } else if (u.base === 'و') {
        if (prevMarks.indexOf(this.DAMMA) !== -1) maddCls = 'madd-tabii';
        else if (prevMarks.indexOf(this.FATHA) !== -1 && this._hasSukun(u)) maddCls = 'madd-tabii'; // مد لين
      } else if (u.base === 'ي') {
        if (prevMarks.indexOf(this.KASRA) !== -1) maddCls = 'madd-tabii';
        else if (prevMarks.indexOf(this.FATHA) !== -1 && this._hasSukun(u)) maddCls = 'madd-tabii'; // مد لين
      }

      if (maddCls) {
        // تحديد نوع المد من الحرف التالي
        if (nxt.u) {
          if (this.HAMZA.indexOf(nxt.u.base) !== -1) {
            maddCls = nxt.crossed ? 'madd-munfasil' : 'madd-muttasil';
          } else if (this._hasShadda(nxt.u)) {
            maddCls = 'madd-lazim';
          } else if (this._hasSukun(nxt.u) && this._isWordEnd(units, nxt.idx)) {
            maddCls = 'madd-arid';
          } else if (this._hasSukun(nxt.u)) {
            maddCls = 'madd-lazim';
          }
        }
        out += this._span(maddCls, u.text);
        i++;
        continue;
      }

      out += this._esc(u.text);
      i++;
    }
    return out;
  },

  /** هل التلوين مفعّل حالياً (إعدادات القارئ أو المصحف) */
  isEnabled() {
    const s = (typeof QuranPage !== 'undefined' && QuranPage.readerSettings) || null;
    if (s && s.tajweedColors) return true;
    return !!(typeof QuranMushafPage !== 'undefined' && QuranMushafPage.tajweed);
  },

  /** مفاتيح الأسطورة: [class, مفتاح الترجمة] — تُستخدم في الإعدادات والمصحف */
  LEGEND: [
    ['ghunnah',        'tjwGhunnah'],
    ['ikhfa',          'tjwIkhfa'],
    ['idgham-ghunnah', 'tjwIdghamGh'],
    ['idgham',         'tjwIdghamNg'],
    ['iqlab',          'tjwIqlab'],
    ['izhar',          'tjwIzhar'],
    ['qalqalah',       'tjwQalqalah'],
    ['madd-tabii',     'tjwMaddTabii'],
    ['madd-muttasil',  'tjwMaddMuttasil'],
    ['madd-munfasil',  'tjwMaddMunfasil'],
    ['madd-lazim',     'tjwMaddLazim'],
    ['madd-arid',      'tjwMaddArid'],
    ['laam',           'tjwLaam'],
  ],

  /** HTML لأسطورة الألوان (تعمل بلا مكتبات) */
  legendHTML() {
    const tr = (k) => (typeof t === 'function' ? (t(k) || k) : k);
    return `<div class="tjw-legend">${this.LEGEND.map(([cls, key]) =>
      `<span class="tjw-legend-item"><i class="tjw-swatch tjw-${cls}"></i>${this._esc(tr(key))}</span>`
    ).join('')}</div>`;
  },
};

if (typeof window !== 'undefined') window.TajweedColors = TajweedColors;
