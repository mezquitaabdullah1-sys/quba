/**
 * 🎬 VideoLayout — الطبقة النصية المشتركة بين بطاقة المشاركة واستوديو الفيديو
 * v1.0.167
 *
 * كل دوال الرسم هنا تعمل على أي canvas 2D، وتأخذ نفس مدخلات quran.com:
 * حجم خط المصحف، حجم خط الترجمة، لون النص، لون التمييز (الحدود/الفاصل).
 * لا تعتمد على DOM ولا على أي مكتبة خارجية — تعمل داخل WebView بلا إنترنت.
 */

const VideoLayout = {
  /* ============ قياس وتقسيم النص ============ */

  /** يقسّم النص إلى أسطر لا يتجاوز عرض كل منها maxWidth. */
  wrap(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  },

  /** يصغّر الخط تدريجيًا حتى يدخل النص كاملًا في المساحة المتاحة. */
  fit(ctx, text, maxW, maxH, baseSize, minSize, lineHeight, makeFont, step = 2) {
    let size = baseSize;
    let lines = [];
    let blockH = 0;
    for (;;) {
      ctx.font = makeFont(size);
      lines = this.wrap(ctx, text, maxW);
      blockH = lines.length * size * lineHeight;
      if (blockH <= maxH || size <= minSize) break;
      size = Math.max(minSize, size - step);
    }
    return { size, lines, blockH, lineHeight };
  },

  /**
   * يرسم مقطع آية كاملًا: نص عثماني + فاصل زخرفي + ترجمة + مرجع.
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} o
   *   W,H            أبعاد اللوحة
   *   arabic         النص العربي
   *   translation    الترجمة (قد تكون فارغة)
   *   source         «سورة البقرة ٢:٢٥٥»
   *   fontColor      لون النص
   *   accentColor    لون الفاصل/النقطة
   *   arScale        ١..٦ حجم خط المصحف
   *   trScale        ١..٦ حجم خط الترجمة
   *   fontStyle      'naskh' | 'amiri'
   *   scale          معامل عام لحجم اللوحة (فيديو 1080 = ١)
   *   centerY        مركز الكتلة رأسيًا (افتراضي منتصف اللوحة)
   *   maxWidthRatio  نسبة العرض المتاح (افتراضي ٠.٨٦)
   */
  drawVerse(ctx, o) {
    const W = o.W, H = o.H;
    const sc = o.scale || 1;
    const arScale = Math.max(1, Math.min(6, o.arScale || 4));
    const trScale = Math.max(0, Math.min(6, o.trScale == null ? 3 : o.trScale));
    const showTr = !!(o.translation && trScale > 0);
    const maxW = W * (o.maxWidthRatio || 0.86);
    const fontColor = o.fontColor || '#ffffff';
    const accent = o.accentColor || '#D4AF37';

    const arFont = o.fontStyle === 'amiri'
      ? (s => `700 ${s}px "Amiri", "Noto Naskh Arabic", serif`)
      : (s => `700 ${s}px "Noto Naskh Arabic", "Amiri", serif`);
    const uiFont = (s) => `600 ${s}px "Inter", "Segoe UI", sans-serif`;

    // مقاسات أساسية مشتقة من مقياس المستخدم — ٤ = «متوسط» كما في quran.com
    const baseAr = (34 + arScale * 15) * sc;   //  ٤ → 94px عند 1080
    const baseTr = (18 + trScale * 9) * sc;    //  ٣ → 45px
    const baseSrc = 26 * sc;

    // المساحة المتاحة: ٧٢٪ من الارتفاع كحد أقصى، مقسومة بين العربية والترجمة
    const availH = H * 0.72;
    const arMaxH = showTr ? availH * 0.58 : availH * 0.82;
    const trMaxH = availH * 0.34;

    const ar = this.fit(ctx, o.arabic, maxW, arMaxH, baseAr, 26 * sc, 1.55, arFont);
    const tr = showTr
      ? this.fit(ctx, '“' + o.translation + '”', maxW * 0.94, trMaxH, baseTr, 16 * sc, 1.45, uiFont)
      : { size: 0, lines: [], blockH: 0, lineHeight: 1.45 };

    const gap = 30 * sc;
    const srcSize = o.source ? baseSrc : 0;
    const totalH = ar.blockH + (showTr ? gap + tr.blockH : 0) + (srcSize ? gap + srcSize * 1.5 : 0);
    let y = (o.centerY || H / 2) - totalH / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fontColor;
    if (o.shadow !== false) {
      ctx.shadowColor = 'rgba(0,0,0,0.62)';
      ctx.shadowBlur = 18 * sc;
      ctx.shadowOffsetY = 2 * sc;
    }

    // ١) النص العربي
    ctx.direction = 'rtl';
    for (const line of ar.lines) {
      ctx.font = arFont(ar.size);
      ctx.fillText(line, W / 2, y + ar.size * ar.lineHeight / 2);
      y += ar.size * ar.lineHeight;
    }
    ctx.direction = 'ltr';

    // ٢) الفاصل الزخرفي
    if (showTr || o.source) {
      y += gap * 0.35;
      ctx.shadowBlur = 0;
      ctx.fillStyle = accent;
      const half = 78 * sc, thick = 2.5 * sc;
      ctx.fillRect(W / 2 - half, y, half * 2, thick);
      ctx.beginPath();
      ctx.arc(W / 2, y + thick / 2, 6.5 * sc, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'rgba(0,0,0,0.62)';
      ctx.shadowBlur = 18 * sc;
      ctx.fillStyle = fontColor;
      y += gap * 0.65;
    }

    // ٣) الترجمة
    if (showTr) {
      ctx.fillStyle = fontColor;
      for (const line of tr.lines) {
        ctx.font = uiFont(tr.size);
        ctx.fillText(line, W / 2, y + tr.size * tr.lineHeight / 2);
        y += tr.size * tr.lineHeight;
      }
    }

    // ٤) المرجع
    if (o.source) {
      y += gap * 0.55;
      ctx.font = `500 ${srcSize}px "Inter", "Segoe UI", sans-serif`;
      ctx.fillStyle = this._alpha(fontColor, 0.9);
      ctx.fillText('— ' + o.source + ' —', W / 2, y);
    }
    ctx.restore();
    return totalH;
  },

  /** ختم التطبيق أسفل اللوحة (اختياري في الفيديو). */
  drawWatermark(ctx, o) {
    const W = o.W, H = o.H, sc = o.scale || 1;
    const color = o.fontColor || '#ffffff';
    const y = H - 54 * sc;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8 * sc;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    if (o.logo) {
      const s = 40 * sc;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(o.logo, 40 * sc, y - s / 2, s, s);
      ctx.globalAlpha = 1;
    }
    const tx = 40 * sc + (o.logo ? 50 * sc : 0);
    ctx.font = `600 ${27 * sc}px "Inter", "Segoe UI", sans-serif`;
    ctx.fillStyle = this._alpha(color, 0.95);
    ctx.fillText('Quba', tx, y);
    if (o.tagline) {
      ctx.font = `400 ${19 * sc}px "Inter", "Segoe UI", sans-serif`;
      ctx.fillStyle = this._alpha(color, 0.6);
      ctx.fillText(o.tagline, tx, y + 24 * sc);
    }
    ctx.restore();
  },

  /** تحويل #rrggbb + شفافية إلى rgba(). */
  _alpha(hex, a) {
    const h = String(hex || '#ffffff').replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full, 16);
    if (isNaN(n)) return `rgba(255,255,255,${a})`;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  },

  /** مثلث «قاعدة البسملة» لا نحتاجه — تُترك البيانات للمصحف. */

  /**
   * حساب تحويل Ken Burns (تقريب/إزاحة) لصورة خلفية داخل لوحة W×H.
   * @param {number} t  الزمن بالثواني
   * @param {number} dur المدة الكلية
   * @param {number} mode 0..3 نمط الحركة
   * @param {number} iw,ih أبعاد الصورة الأصلية
   * @returns {{sx:number,sy:number,sw:number,sh:number}}
   */
  kenBurnsRect(t, dur, mode, iw, ih, W, H) {
    const p = Math.max(0, Math.min(1, dur > 0 ? t / dur : 0));
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
    const zoomFrom = 1.06, zoomTo = 1.22;
    const z = zoomFrom + (zoomTo - zoomFrom) * ease;      // نسبة القص
    // نطاق القص: أكبر من نسبة اللوحة لتفادي الفراغ
    const viewRatio = W / H;
    let cw = iw / z, ch = ih / z;
    if (cw / ch > viewRatio) cw = ch * viewRatio; else ch = cw / viewRatio;

    // اتجاه الإزاحة حسب النمط
    let cx = iw / 2, cy = ih / 2;
    const dx = (iw - cw) / 2, dy = (ih - ch) / 2;
    const k = easyStep(ease);
    if (mode === 0) { cx = iw / 2 - dx + 2 * dx * k; cy = ih / 2 - dy + 2 * dy * k; }       // يمين-أسفل
    else if (mode === 1) { cx = iw / 2 + dx - 2 * dx * k; cy = ih / 2 + dy - 2 * dy * k; }  // يسار-أعلى
    else if (mode === 2) { cx = iw / 2 - dx + 2 * dx * k; cy = ih / 2 + dy - 2 * dy * k; }  // يمين-أعلى
    else { cx = iw / 2; cy = ih / 2 - dy + 2 * dy * k; }                                     // عمودي

    return { sx: cx - cw / 2, sy: cy - ch / 2, sw: cw, sh: ch };
  },

  /* ================= التظليل الزمني (v1.0.168) ================= */

  /** يقسّم آيات إلى أسطر من كلمات مع إحداثيات حرفية لكل كلمة. */
  _layoutAyahs(ctx, ayahs, maxW, size, lineH) {
    const spaceW = ctx.measureText('\u00A0').width || size * 0.26;
    const lines = [];
    const chars = [];
    let cur = { tokens: [], width: 0, gapBefore: false };

    const flush = () => { if (cur.tokens.length) { lines.push(cur); cur = { tokens: [], width: 0, gapBefore: false }; } };

    ayahs.forEach((a, ai) => {
      if (cur.tokens.length) flush();
      cur.gapBefore = ai > 0;
      const words = String(a.text || '').split(/\s+/).filter(Boolean);
      words.push('\u06DD' + (a.marker || ''));
      let cpos = 0;
      words.forEach((wd) => {
        const w = ctx.measureText(wd).width;
        const first = cur.tokens.length === 0;
        if (!first && cur.width + spaceW + w > maxW) {
          flush();
          cur.gapBefore = false;
        }
        const isFirst = cur.tokens.length === 0;
        const startChar = cpos;
        cpos += wd.length + 1;
        cur.tokens.push({ txt: wd, w, ayah: ai, endChar: cpos, startChar });
        cur.width += isFirst ? w : spaceW + w;
      });
      chars[ai] = cpos;
    });
    flush();
    return { lines, spaceW, chars, height: lines.length * size * lineH };
  },

  /**
   * يرسم مقطعًا متعدد الآيات مع تظليل الكلمات المقروءة.
   * o: { ayahs:[{text,marker}], timings:[{start,dur}], t, highlight, ...common }
   */
  drawVerseTimed(ctx, o) {
    const W = o.W, H = o.H, sc = o.scale || 1;
    const arScale = Math.max(1, Math.min(6, o.arScale || 4));
    const maxW = W * (o.maxWidthRatio || 0.86);
    const lineH = 1.5;
    const fontColor = o.fontColor || '#ffffff';
    const accent = o.accentColor || '#D4AF37';
    const arFont = (s) => `700 ${s}px "Noto Naskh Arabic", "Amiri", serif`;
    const uiFont = (s) => `600 ${s}px "Inter", "Segoe UI", sans-serif`;

    // ١) قياس: نصغّر حتى تدخل كل الآيات في ٦٦٪ من الارتفاع
    const areaH = H * 0.66;
    let size = (34 + arScale * 15) * sc;
    const minSize = 24 * sc;
    let lay = null;
    for (let k = 0; k < 60; k++) {
      ctx.font = arFont(size);
      lay = this._layoutAyahs(ctx, o.ayahs, maxW, size, lineH);
      if (lay.height <= areaH || size <= minSize) break;
      size -= 2;
    }
    const gapAyah = size * 0.55;
    const nGaps = lay.lines.filter(l => l.gapBefore).length;
    const totalH = lay.height + gapAyah * nGaps;

    // ٢) الآية الجارية والتقدّم داخلها
    let act = -1, prog = 0;
    const tm = o.timings || [];
    if (o.highlight && tm.length) {
      for (let i = 0; i < tm.length; i++) {
        const s0 = tm[i].start, s1 = s0 + tm[i].dur;
        if (o.t >= s0 && o.t <= s1) { act = i; prog = (o.t - s0) / Math.max(0.001, tm[i].dur); break; }
      }
      if (act < 0 && o.t > tm[tm.length - 1].start + tm[tm.length - 1].dur) {
        act = tm.length - 1;
        prog = 1;
      }
    }
    const actChars = act >= 0 ? prog * (lay.chars[act] || 0) : -1;

    // ٣) الرسم من اليمين لليسار كلمة بكلمة (الحروف العربية تتصل داخل الكلمة فقط)
    let y = (o.centerY || H / 2) - totalH / 2 + size * lineH / 2;
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';
    ctx.shadowColor = 'rgba(0,0,0,0.62)';
    ctx.shadowBlur = 16 * sc;
    ctx.shadowOffsetY = 2 * sc;

    for (const line of lay.lines) {
      if (line.gapBefore) y += gapAyah;
      let x = W / 2 + line.width / 2;
      for (const tk of line.tokens) {
        const spoken = act >= 0 && tk.ayah === act && tk.endChar <= actChars + 0.01;
        ctx.font = arFont(size);
        ctx.fillStyle = spoken ? accent : fontColor;
        ctx.fillText(tk.txt, x, y);
        x -= tk.w + lay.spaceW;
      }
      y += size * lineH;
    }
    ctx.restore();

    // ٤) الترجمة والمرجع تحت الكتلة (بلا تظليل)
    let ty = (o.centerY || H / 2) + totalH / 2 + size * 0.45;
    const bodyH = H * 0.9 - ty;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'ltr';
    ctx.shadowColor = 'rgba(0,0,0,0.62)';
    ctx.shadowBlur = 16 * sc;
    const trScale = Math.max(0, Math.min(6, o.trScale == null ? 3 : o.trScale));
    if (o.translation && trScale > 0 && bodyH > 40 * sc) {
      const baseTr = (18 + trScale * 9) * sc;
      const tr = this.fit(ctx, '“' + o.translation + '”', maxW * 0.94, Math.min(bodyH * 0.7, H * 0.2), baseTr, 15 * sc, 1.4, uiFont);
      ctx.fillStyle = fontColor;
      for (const line of tr.lines) {
        ctx.font = uiFont(tr.size);
        ctx.fillText(line, W / 2, ty + tr.size * tr.lineHeight / 2);
        ty += tr.size * tr.lineHeight;
      }
      ty += 10 * sc;
    }
    if (o.source) {
      ctx.font = `500 ${24 * sc}px "Inter", "Segoe UI", sans-serif`;
      ctx.fillStyle = this._alpha(fontColor, 0.88);
      ctx.fillText('— ' + o.source + ' —', W / 2, ty + 12 * sc);
    }
    ctx.restore();
  },
};

function easyStep(p) { return p; }

if (typeof window !== 'undefined') window.VideoLayout = VideoLayout;
