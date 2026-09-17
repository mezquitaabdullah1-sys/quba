// 🎨 TajweedColors — تلوين النص القرآني حسب أحكام التجويد والتلاوة
// v51: يعمل محلياً ١٠٠٪ (أوفلاين) بلا أي مكتبات خارجية.
// يحلّل النص العربي المشكول ويغلّف المواضع المطابقة لأحكام التجويد بألوان
// موحّدة (كما في المصاحف الملوّنة الشائعة):
//   ghunnah  : غنة (شدة مشدودة على نون/ميم)                — أخضر
//   ikhfa    : إخفاء (نون ساكنة/تنوين + حرف الإخفاء)        — بنفسجي
//   idgham   : إدغام (نون ساكنة/تنوين + يرملون)             — سماوي
//   iqlab    : إقلاب (نون ساكنة/تنوين + باء)                — برتقالي
//   qalqalah : قلقلة (قطب جد ساكنة/مشدودة)                  — أحمر
//   madd     : مدود (حروف المد واللين)                      — أزرق
//   laam     : لام شمسية (ال + حرف شمسي)                    — ذهبي
const TajweedColors = {
  // الحروف
  IKHFA: 'تثجحخدذزسشصضطظفقك',
  IDGHAM: 'يرملون',
  SHAMSI: 'تثدذرزسشصضطظلن',
  QALQ: 'قطبجد',

  _esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  _span(cls, text) {
    return `<span class="tjw-${cls}">${this._esc(text)}</span>`;
  },

  _isDiac(ch) {
    return ch >= 'ً' && ch <= 'ْ' || ch === 'ٰ' || ch === 'ـ';
  },

  /** يلوّن نص آية كاملاً ويعيد HTML آمناً (النص الأصلي لا يحوي HTML). */
  colorize(text) {
    if (!text) return '';
    const chars = Array.from(String(text));
    const n = chars.length;
    let out = '';
    let i = 0;

    const skipDiacs = (j) => { while (j < n && this._isDiac(chars[j])) j++; return j; };

    while (i < n) {
      const c = chars[i];

      // — اللام الشمسية: «ال» + حرف شمسي —
      if (c === 'ا' && chars[i + 1] === 'ل') {
        const j = skipDiacs(i + 2);
        const nxt = chars[j];
        if (nxt && this.SHAMSI.includes(nxt)) {
          const following = chars[skipDiacs(j + 1)];
          if (following === 'ّ' || chars[j + 1] === 'ّ') {
            out += this._span('laam', chars.slice(i, j + 1).join(''));
            i = j + 1;
            continue;
          }
        }
        // لا نلوّن «ال» القمرية — تُخرَج كما هي
      }

      // — غنة: نون أو ميم مشدودة —
      if ((c === 'ن' || c === 'م') && chars[i + 1] === 'ّ') {
        out += this._span('ghunnah', c + 'ّ');
        i += 2;
        continue;
      }

      // — قلقلة: حرف قطب جد ساكن أو مشدود —
      if (this.QALQ.includes(c)) {
        const j = skipDiacs(i + 1);
        if (chars[i + 1] === 'ّ' || chars[i + 1] === 'ْ') {
          out += this._span('qalqalah', chars.slice(i, i + 2).join(''));
          i += 2;
          continue;
        }
        // قلقلة كبرى: حرف قطب جد في آخر الكلمة يقف عليه بالسكون
        const isWordEnd = j >= n || chars[j] === ' ' || chars[j] === '\u06D6' || /[ۖ-ۭ]/.test(chars[j] || '');
        if (isWordEnd && !this._isDiac(c)) {
          // حرف مد/لين قبله مع سكون مؤقت — نكتفي بتلوين الحرف نفسه
          out += this._span('qalqalah', c);
          i++;
          continue;
        }
      }

      // — نون ساكنة أو تنوين: إخفاء / إدغام / إقلاب —
      const tanween = (c === 'ً' || c === 'ٌ' || c === 'ٍ');
      const noonSakina = (c === 'ن' && (chars[i + 1] === 'ْ' || (!this._isDiac(chars[i + 1] || '') && chars[i + 1] !== undefined && chars[i + 1] !== 'ّ')));
      if (tanween || noonSakina) {
        const baseLen = noonSakina ? (chars[i + 1] === 'ْ' ? 2 : 1) : 1;
        const j = skipDiacs(i + baseLen);
        const nxt = chars[j];
        // تجاهل المسافات بين الكلمات للبحث عن الحرف التالي
        let k = j;
        let sawSpace = false;
        while (k < n && (chars[k] === ' ' || chars[k] === '\u06D6')) { sawSpace = true; k++; }
        const target = chars[k];
        const seg = chars.slice(i, baseLen === 2 ? i + 2 : i + 1).join('');
        if (target && this.IKHFA.includes(target)) {
          out += this._span('ikhfa', seg);
          i += baseLen;
          continue;
        }
        if (target && this.IDGHAM.includes(target)) {
          out += this._span('idgham', seg);
          i += baseLen;
          continue;
        }
        if (target === 'ب') {
          out += this._span('iqlab', seg);
          i += baseLen;
          continue;
        }
        if (noonSakina) { out += this._esc(seg); i += baseLen; continue; }
      }

      // — مدود: حرف مد (ا/و/ي) ساكن بعد حركة مناسبة، أو واو/ياء ليّنة —
      if (c === 'ا' || c === 'و' || c === 'ي' || c === 'ى') {
        const prev = chars[i - 1];
        const hasSukun = chars[i + 1] === 'ْ';
        // مد طبيعي: ا بعد فتحة، و بعد ضمة، ي/ى بعد كسرة — أو لين: و/ي ساكنة بعد فتحة
        const madd = (c === 'ا' && prev === 'َ')
                  || (c === 'و' && (prev === 'ُ' || prev === 'َ' && hasSukun))
                  || ((c === 'ي' || c === 'ى') && (prev === 'ِ' || prev === 'َ' && hasSukun))
                  || (c === 'ا' && prev === 'ٰ');
        if (madd) {
          out += this._span('madd', hasSukun ? c + 'ْ' : c);
          i += hasSukun ? 2 : 1;
          continue;
        }
      }

      out += this._esc(c);
      i++;
    }
    return out;
  },

  /** هل التلوين مفعّل حالياً (إعدادات القارئ) */
  isEnabled() {
    const s = (typeof QuranPage !== 'undefined' && QuranPage.readerSettings) || null;
    return !!(s && s.tajweedColors);
  },
};

if (typeof window !== 'undefined') window.TajweedColors = TajweedColors;
