/* =====================================================================
   v134 — مولّد صورة الإمساكية (Poster)
   لوحة رأسية بأسلوب الملصق: إطار زخرفي، «رمضان كريم» بخط عربي، فانوسان،
   ثم جدول الشهر كاملًا. دالة نقية تعيد canvas — قابلة للاختبار وحدها.
   ===================================================================== */
(function () {
  const AR = '"Amiri","Noto Naskh Arabic",serif';
  const NUM = '"Inter","Segoe UI",sans-serif';
  const GREEN = '#0E4B3C', GREEN_D = '#08301F', INK = '#1B2A22';
  const GOLD = '#C9A227', GOLD_L = '#E4CE8E', CREAM = '#FFFDF8';

  function star(ctx, cx, cy, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i + (rot || 0);
      const rr = i % 2 ? r * 0.56 : r;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }

  function lantern(ctx, x, yTop, s, chain) {
    const w = s * 0.66, h = s;
    ctx.save();
    // سلسلة
    ctx.strokeStyle = 'rgba(201,162,39,.75)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yTop + chain); ctx.stroke();
    const y0 = yTop + chain;
    // توهّج
    const g = ctx.createRadialGradient(x, y0 + h * 0.55, 2, x, y0 + h * 0.55, s * 1.15);
    g.addColorStop(0, 'rgba(255,214,120,.42)'); g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y0 + h * 0.55, s * 1.15, 0, 7); ctx.fill();
    // القبّة
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.30, y0 + h * 0.22);
    ctx.quadraticCurveTo(x, y0 - h * 0.16, x + w * 0.30, y0 + h * 0.22);
    ctx.closePath(); ctx.fill();
    // الحلقة
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y0 + h * 0.13, 4.5, 0, 7); ctx.stroke();
    // البدن
    const bg = ctx.createLinearGradient(x - w / 2, y0, x + w / 2, y0 + h);
    bg.addColorStop(0, '#E7C766'); bg.addColorStop(.45, '#C9A227'); bg.addColorStop(1, '#9C7A18');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.34, y0 + h * 0.26);
    ctx.lineTo(x + w * 0.34, y0 + h * 0.26);
    ctx.quadraticCurveTo(x + w * 0.52, y0 + h * 0.62, x + w * 0.24, y0 + h * 0.86);
    ctx.lineTo(x - w * 0.24, y0 + h * 0.86);
    ctx.quadraticCurveTo(x - w * 0.52, y0 + h * 0.62, x - w * 0.34, y0 + h * 0.26);
    ctx.closePath(); ctx.fill();
    // زجاج
    ctx.fillStyle = 'rgba(255,246,214,.86)';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.24, y0 + h * 0.36);
    ctx.lineTo(x + w * 0.24, y0 + h * 0.36);
    ctx.quadraticCurveTo(x + w * 0.36, y0 + h * 0.60, x + w * 0.17, y0 + h * 0.78);
    ctx.lineTo(x - w * 0.17, y0 + h * 0.78);
    ctx.quadraticCurveTo(x - w * 0.36, y0 + h * 0.60, x - w * 0.24, y0 + h * 0.36);
    ctx.closePath(); ctx.fill();
    // خطوط الزجاج
    ctx.strokeStyle = 'rgba(156,122,24,.55)'; ctx.lineWidth = 1.6;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(x + i * w * 0.14, y0 + h * 0.36); ctx.lineTo(x + i * w * 0.14, y0 + h * 0.78); ctx.stroke();
    }
    // القاعدة
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.ellipse(x, y0 + h * 0.88, w * 0.30, h * 0.05, 0, 0, 7); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - w * 0.10, y0 + h * 0.90); ctx.lineTo(x + w * 0.10, y0 + h * 0.90);
    ctx.lineTo(x, y0 + h * 1.02); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function draw(rows, meta) {
    const W = 1080, pad = 52, tableW = W - pad * 2;
    const headH = 448, thH = 58, rowH = 45, footH = 108;
    const H = headH + thH + rows.length * rowH + footH;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.direction = 'rtl';
    const ar = (fn, size, weight) => { ctx.font = (weight || '700') + ' ' + size + 'px ' + AR; };
    const num = (fn, size, weight) => { ctx.font = (weight || '600') + ' ' + size + 'px ' + NUM; };

    /* ---------- 1) الورق ---------- */
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(.5, CREAM); bg.addColorStop(1, '#FBF6E9');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    /* نقش نجمي خافت */
    ctx.save(); ctx.strokeStyle = 'rgba(201,162,39,.115)'; ctx.lineWidth = 1.1;
    for (let y = 40; y < H; y += 62) {
      for (let x = 40 + ((y / 62) | 0) % 2 * 31; x < W; x += 62) {
        star(ctx, x, y, 19, Math.PI / 8); ctx.stroke();
      }
    }
    ctx.restore();

    /* ---------- 2) الإطار الزخرفي ---------- */
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.strokeStyle = 'rgba(201,162,39,.45)'; ctx.lineWidth = 1.2;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    // وريدات الزوايا
    const corner = (cx, cy, sx, sy) => {
      ctx.save(); ctx.translate(cx, cy);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, 7); ctx.stroke();
      star(ctx, 0, 0, 13, Math.PI / 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx * 18, 0); ctx.lineTo(sx * 54, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, sy * 18); ctx.lineTo(0, sy * 54); ctx.stroke();
      star(ctx, sx * 62, 0, 6, Math.PI / 8); ctx.fillStyle = GOLD; ctx.fill();
      star(ctx, 0, sy * 62, 6, Math.PI / 8); ctx.fill();
      ctx.restore();
    };
    corner(44, 44, 1, 1); corner(W - 44, 44, -1, 1);
    corner(44, H - 44, 1, -1); corner(W - 44, H - 44, -1, -1);

    /* ---------- 3) الفانوسان ---------- */
    lantern(ctx, 168, 34, 118, 54);
    lantern(ctx, W - 168, 34, 118, 54);

    /* ---------- 4) رمضان كريم ---------- */
    const cg = ctx.createLinearGradient(0, 96, 0, 210);
    cg.addColorStop(0, '#11604B'); cg.addColorStop(.55, GREEN); cg.addColorStop(1, GREEN_D);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = cg;
    ar(0, 112, '700');
    ctx.fillText('رمضان كريم', W / 2, 196);
    // لمعة ذهبية رقيقة أعلى الحروف
    ctx.globalAlpha = .28; ctx.fillStyle = GOLD_L;
    ctx.fillText('رمضان كريم', W / 2, 193);
    ctx.restore();

    // زخرفة تحت الخط
    ctx.save();
    ctx.strokeStyle = 'rgba(201,162,39,.85)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2 - 190, 226); ctx.lineTo(W / 2 - 40, 226); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2 + 40, 226); ctx.lineTo(W / 2 + 190, 226); ctx.stroke();
    star(ctx, W / 2, 226, 11, Math.PI / 8); ctx.fillStyle = GOLD; ctx.fill();
    ctx.beginPath(); ctx.arc(W / 2 - 208, 226, 3.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(W / 2 + 208, 226, 3.4, 0, 7); ctx.fill();
    ctx.restore();

    /* ---------- 5) العنوان والمدينة ---------- */
    ctx.textAlign = 'center';
    ctx.fillStyle = GREEN;
    ar(0, 47, '700');
    ctx.fillText(meta.title, W / 2, 292);
    ctx.fillStyle = '#7A6A3C';
    ar(0, 35, '600');
    ctx.fillText(meta.city, W / 2, 342);
    ctx.fillStyle = 'rgba(122,106,60,.85)';
    num(0, 22, '600');
    ctx.fillText(meta.sub, W / 2, 378);

    /* ---------- 6) الجدول ---------- */
    const cols = meta.cols; // [{w,label,kind}]
    const total = cols.reduce((a, c) => a + c.w, 0);
    let xRight = W - pad - (tableW - total) / 2;
    const xs = [];
    cols.forEach(c => { xs.push(xRight - c.w); xRight -= c.w; });

    // ظل ناعم تحت الجدول
    ctx.save();
    ctx.shadowColor = 'rgba(14,75,60,.18)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(pad - 10, headH - 2, tableW + 20, thH + rows.length * rowH);
    ctx.restore();

    // رأس الجدول
    const thg = ctx.createLinearGradient(0, headH, 0, headH + thH);
    thg.addColorStop(0, '#F1E6C8'); thg.addColorStop(1, '#E7D8B2');
    ctx.fillStyle = thg;
    ctx.fillRect(pad - 10, headH, tableW + 20, thH);
    ctx.strokeStyle = 'rgba(201,162,39,.85)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad - 10, headH); ctx.lineTo(W - pad + 10, headH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad - 10, headH + thH); ctx.lineTo(W - pad + 10, headH + thH); ctx.stroke();
    ctx.fillStyle = GREEN_D; ar(0, 22, '700');
    cols.forEach((c, i) => ctx.fillText(c.label, xs[i] + c.w / 2, headH + 39));

    // الصفوف
    rows.forEach((r, i) => {
      const y0 = headH + thH + i * rowH;
      if (r.today) {
        const hg = ctx.createLinearGradient(xs[0], 0, xs[xs.length - 1] + cols[cols.length - 1].w, 0);
        hg.addColorStop(0, 'rgba(201,162,39,.22)'); hg.addColorStop(1, 'rgba(15,118,110,.18)');
        ctx.fillStyle = hg; ctx.fillRect(pad - 10, y0, tableW + 20, rowH);
      } else if (i % 2 === 1) {
        ctx.fillStyle = 'rgba(201,162,39,.075)'; ctx.fillRect(pad - 10, y0, tableW + 20, rowH);
      }
      ctx.strokeStyle = 'rgba(201,162,39,.26)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad - 10, y0 + rowH); ctx.lineTo(W - pad + 10, y0 + rowH); ctx.stroke();
      // فاصل الأعمدة
      ctx.strokeStyle = 'rgba(14,75,60,.10)';
      for (let k = 1; k < xs.length; k++) {
        ctx.beginPath(); ctx.moveTo(xs[k] + cols[k].w, y0 + 6); ctx.lineTo(xs[k] + cols[k].w, y0 + rowH - 6); ctx.stroke();
      }
      const mid = y0 + 30;
      ctx.textAlign = 'center';
      ctx.fillStyle = r.today ? GREEN_D : '#123B2E';
      num(0, 22, r.today ? '800' : '700');
      ctx.fillText(String(r.d), xs[0] + cols[0].w / 2, mid);
      ctx.fillStyle = '#6B5B33'; ar(0, 19, '600');
      ctx.fillText(r.hijri, xs[1] + cols[1].w / 2, mid);
      ctx.fillStyle = '#7A7563'; num(0, 18, '600');
      ctx.fillText(r.greg, xs[2] + cols[2].w / 2, mid);
      r.times.forEach((v, k) => {
        const ci = 3 + k;
        const gold = (cols[ci].kind === 'imsak' || cols[ci].kind === 'iftar');
        ctx.fillStyle = gold ? '#8A6A1E' : (r.today ? GREEN_D : INK);
        num(0, 20, gold ? '800' : '600');
        ctx.fillText(v || '—', xs[ci] + cols[ci].w / 2, mid);
      });
    });

    // إطار الجدول
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
    ctx.strokeRect(pad - 10, headH, tableW + 20, thH + rows.length * rowH);

    /* ---------- 7) التذييل ---------- */
    const fy = headH + thH + rows.length * rowH + 46;
    ctx.fillStyle = '#8A855F'; ar(0, 19, '500');
    ctx.fillText(meta.note, W / 2, fy);
    ctx.fillStyle = GREEN;
    ctx.font = '800 26px ' + NUM;
    ctx.fillText('Quba  ·  قُبا', W / 2, fy + 42);

    return cv;
  }

  window.ImsakPoster = { render: draw };
})();
