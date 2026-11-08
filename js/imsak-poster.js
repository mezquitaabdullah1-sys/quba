/* =====================================================================
   v1.0.154 — مولّد صور الإمساكية
   ١) render(rows, meta)      → ملصق الشهر (1080×1986) أو ورقة A4 (1240×1754)
   ٢) renderDay(row, meta)    → صورة يوم واحد بنسبة ٩:١٦ للستوري (1080×1920)
   كل الدوال غير متزامنة وتعيد canvas — قابلة للاختبار وحدها.
   ===================================================================== */
(function () {
  const AR = '"Amiri","Noto Naskh Arabic",serif';
  const NUM = '"Inter","Segoe UI",sans-serif';
  const GREEN = '#0E4B3C', GREEN_D = '#08301F', INK = '#1B2A22';
  const GOLD = '#B8912F', GOLD_L = '#E4CE8E';
  const CREAM = '#FFFDF6';

  function loadImg(src) {
    return new Promise((res) => {
      if (!src) return res(null);
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  /* ورقة احتياطية (وعاء الطباعة A4) */
  function paper(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(.5, '#FDF9F0'); g.addColorStop(1, '#FBF4E4');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  /* إطار ذهبي مزدوج + معينات الزوايا — للطباعة بلا خلفية صورية (حبر أقل) */
  function goldFrame(ctx, W, H) {
    const m1 = 26, m2 = 36;
    ctx.strokeStyle = 'rgba(184,145,47,.85)'; ctx.lineWidth = 2.4;
    ctx.strokeRect(m1, m1, W - m1 * 2, H - m1 * 2);
    ctx.strokeStyle = 'rgba(184,145,47,.45)'; ctx.lineWidth = 1;
    ctx.strokeRect(m2, m2, W - m2 * 2, H - m2 * 2);
    const pts = [[m1, m1], [W - m1, m1], [m1, H - m1], [W - m1, H - m1]];
    ctx.fillStyle = GOLD;
    pts.forEach(([x, y]) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-6, -6, 12, 12); ctx.restore();
    });
  }

  /* فاصل ذهبي أفقي مع معين في الوسط */
  function divider(ctx, cx, y, half) {
    ctx.save();
    ctx.strokeStyle = 'rgba(184,145,47,.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - half, y); ctx.lineTo(cx - half * 0.25, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + half * 0.25, y); ctx.lineTo(cx + half, y); ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.save(); ctx.translate(cx, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-6, -6, 12, 12); ctx.restore();
    ctx.beginPath(); ctx.arc(cx - half * 1.09, y, 3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + half * 1.09, y, 3, 0, 7); ctx.fill();
    ctx.restore();
  }

  function cfgFor(layout) {
    if (layout === 'a4') {
      return {
        W: 1240, H: 1754, bgPhoto: false, pad: 44,
        titleSize: 86, titleY: 148, divY: 176, divHalf: 188,
        subTitleSize: 31, subTitleY: 228,
        citySize: 26, cityY: 260,
        subSize: 15, subY: 286,
        tableTop: 308, thH: 46, footPad: 104,
        fHead: 17, fDay: 21, fHijri: 16, fGreg: 15, fTime: 18,
        noteSize: 14, methSize: 13, brandSize: 21, brandGap: 42, footGap: 30,
      };
    }
    return {
      W: 1080, H: 1986, bgPhoto: true, pad: 46,
      titleSize: 100, titleY: 290, divY: 322, divHalf: 210,
      subTitleSize: 38, subTitleY: 382,
      citySize: 32, cityY: 426,
      subSize: 19, subY: 456,
      tableTop: 490, thH: 54, footPad: 118,
      fHead: 21, fDay: 23, fHijri: 18, fGreg: 17, fTime: 20,
      noteSize: 17, methSize: 15, brandSize: 25, brandGap: 56, footGap: 34,
    };
  }

  /* ------------------------------------------------------------------
     ملصق الشهر (poster) أو ورقة الطباعة (a4)
     ------------------------------------------------------------------ */
  async function draw(rows, meta) {
    const L = cfgFor(meta.layout);
    const W = L.W, H = L.H;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.direction = 'rtl';
    const ar = (size, weight) => { ctx.font = (weight || '700') + ' ' + size + 'px ' + AR; };
    const num = (size, weight) => { ctx.font = (weight || '600') + ' ' + size + 'px ' + NUM; };

    /* ---------- 1) الخلفية ---------- */
    if (L.bgPhoto) {
      const bg = await loadImg(meta.bg || 'assets/ramadan/imsakiyah-bg.jpg');
      if (bg && bg.width) {
        ctx.drawImage(bg, 0, 0, W, H);
        ctx.fillStyle = 'rgba(255,253,246,0.16)';
        ctx.fillRect(0, 0, W, H);
      } else {
        paper(ctx, W, H);
      }
    } else {
      paper(ctx, W, H);
      goldFrame(ctx, W, H);
    }

    /* ---------- 2) هالة خلف الخط ---------- */
    const gy = L.titleY - 160;
    const glow = ctx.createRadialGradient(W / 2, gy + 10, 20, W / 2, gy + 10, 400);
    glow.addColorStop(0, 'rgba(255,252,240,0.92)');
    glow.addColorStop(.55, 'rgba(255,251,238,0.66)');
    glow.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, gy - 150, W, 470);

    /* ---------- 3) رمضان كريم ---------- */
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(60,45,10,0.30)';
    ar(L.titleSize, '700');
    ctx.fillText('رمضان كريم', W / 2 + 2, L.titleY + 2);
    const cg = ctx.createLinearGradient(0, L.titleY - 94, 0, L.titleY + 16);
    cg.addColorStop(0, '#16705A'); cg.addColorStop(.6, GREEN); cg.addColorStop(1, GREEN_D);
    ctx.fillStyle = cg;
    ctx.fillText('رمضان كريم', W / 2, L.titleY);
    ctx.restore();

    divider(ctx, W / 2, L.divY, L.divHalf);

    /* ---------- 4) العنوان والمدينة ---------- */
    ctx.textAlign = 'center';
    ctx.fillStyle = GREEN_D;
    ar(L.subTitleSize, '700');
    ctx.fillText(meta.title, W / 2, L.subTitleY);
    ctx.fillStyle = '#5C4A1E';
    ar(L.citySize, '700');
    ctx.fillText(meta.city, W / 2, L.cityY);
    ctx.fillStyle = 'rgba(92,74,30,.82)';
    num(L.subSize, '600');
    ctx.fillText(meta.sub || '', W / 2, L.subY);

    /* ---------- 5) لوحة الجدول ---------- */
    const pad = L.pad;
    const tableW = W - pad * 2;
    const tableTop = L.tableTop, thH = L.thH;
    const rowH = Math.floor((H - tableTop - thH - L.footPad) / Math.max(1, rows.length));
    const tableH = thH + rowH * rows.length;

    ctx.save();
    ctx.shadowColor = 'rgba(14,75,60,.20)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = 'rgba(255,253,247,0.92)';
    roundRect(ctx, pad - 6, tableTop - 6, tableW + 12, tableH + 12, 16);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(184,145,47,.75)'; ctx.lineWidth = 1.6;
    roundRect(ctx, pad - 6, tableTop - 6, tableW + 12, tableH + 12, 16);
    ctx.stroke();

    const cols = meta.cols;
    const total = cols.reduce((a, c) => a + c.w, 0);
    // v1.0.154: توزيع الأعمدة على كامل عرض اللوحة مهما كان مقاس الصفحة
    const k = Math.min(1.35, tableW / total);
    const ws = cols.map(c => c.w * k);
    const sumW = ws.reduce((a, b) => a + b, 0);
    let xRight = W - pad + (tableW - sumW) / 2;
    const xs = [];
    ws.forEach(w => { xs.push(xRight - w); xRight -= w; });

    /* رأس الجدول */
    const thg = ctx.createLinearGradient(0, tableTop, 0, tableTop + thH);
    thg.addColorStop(0, 'rgba(15,76,58,.97)'); thg.addColorStop(1, 'rgba(9,48,31,.97)');
    ctx.save();
    roundRect(ctx, pad, tableTop, tableW, thH, 12);
    ctx.fillStyle = thg; ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#F2E7C6'; ar(L.fHead, '700');
    cols.forEach((c, i) => ctx.fillText(c.label, xs[i] + ws[i] / 2, tableTop + thH * 0.68));

    /* الصفوف */
    rows.forEach((r, i) => {
      const y0 = tableTop + thH + i * rowH;
      if (r.qadr) {
        ctx.fillStyle = 'rgba(184,145,47,.24)'; ctx.fillRect(pad, y0, tableW, rowH);
      } else if (r.today) {
        ctx.fillStyle = 'rgba(201,162,39,.26)'; ctx.fillRect(pad, y0, tableW, rowH);
        ctx.fillStyle = GOLD; ctx.fillRect(pad, y0, 5, rowH);
      } else if (r.last10) {
        ctx.fillStyle = 'rgba(201,162,39,.10)'; ctx.fillRect(pad, y0, tableW, rowH);
        ctx.fillStyle = 'rgba(184,145,47,.55)'; ctx.fillRect(pad, y0, 4, rowH);
      } else if (i % 2 === 1) {
        ctx.fillStyle = 'rgba(201,162,39,.075)'; ctx.fillRect(pad, y0, tableW, rowH);
      }
      ctx.strokeStyle = 'rgba(184,145,47,.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, y0 + rowH); ctx.lineTo(pad + tableW, y0 + rowH); ctx.stroke();

      const mid = y0 + rowH / 2 + L.fDay * 0.34;
      ctx.textAlign = 'center';
      ctx.fillStyle = (r.today || r.qadr) ? GREEN_D : '#123B2E';
      num(L.fDay, (r.today || r.qadr) ? '800' : '700');
      ctx.fillText(String(r.d), xs[0] + ws[0] / 2, mid);
      ctx.fillStyle = '#6B5B33'; ar(L.fHijri, '600');
      ctx.fillText(r.hijri, xs[1] + ws[1] / 2, mid);
      ctx.fillStyle = '#7A7563'; num(L.fGreg, '600');
      ctx.fillText(r.greg, xs[2] + ws[2] / 2, mid);
      r.times.forEach((v, j) => {
        const ci = 3 + j;
        const hi = (cols[ci].kind === 'imsak' || cols[ci].kind === 'iftar');
        ctx.fillStyle = hi ? '#8A6A1E' : ((r.today || r.qadr) ? GREEN_D : INK);
        num(L.fTime, hi ? '800' : '600');
        ctx.fillText(v || '—', xs[ci] + ws[ci] / 2, mid);
      });
    });

    ctx.strokeStyle = 'rgba(184,145,47,.75)'; ctx.lineWidth = 1.6;
    roundRect(ctx, pad - 6, tableTop - 6, tableW + 12, tableH + 12, 16);
    ctx.stroke();

    /* ---------- 6) التذييل ---------- */
    const fy = tableTop + tableH + L.footGap;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7C7350'; ar(L.noteSize, '500');
    ctx.fillText(meta.note || '', W / 2, fy);
    if (meta.method) {
      ctx.fillStyle = 'rgba(124,115,80,.85)'; num(L.methSize, '600');
      ctx.fillText(meta.method, W / 2, fy + 24);
    }
    ctx.fillStyle = GREEN;
    ctx.font = '800 ' + L.brandSize + 'px ' + NUM;
    ctx.fillText('Quba  ·  قُبا', W / 2, fy + L.brandGap);

    /* ختم صغير للطباعة: يوضّح أن الورقة A4 */
    if (!L.bgPhoto) {
      ctx.fillStyle = 'rgba(124,115,80,.55)';
      ctx.font = '600 11px ' + NUM;
      ctx.fillText('A4 · 210 × 297 mm', W / 2, H - 34);
    }

    return cv;
  }

  /* ------------------------------------------------------------------
     صورة يوم واحد — ٩:١٦ للستوري (1080×1920)
     ------------------------------------------------------------------ */
  async function drawDay(row, meta) {
    const W = 1080, H = 1920;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.direction = 'rtl';
    const ar = (size, weight) => { ctx.font = (weight || '700') + ' ' + size + 'px ' + AR; };
    const num = (size, weight) => { ctx.font = (weight || '600') + ' ' + size + 'px ' + NUM; };

    const bg = await loadImg(meta.bg || 'assets/ramadan/imsakiyah-bg.jpg');
    if (bg && bg.width) {
      // تغطية كاملة ٩:١٦ مع قصّ مركزي
      const s = Math.max(W / bg.width, H / bg.height);
      const dw = bg.width * s, dh = bg.height * s;
      ctx.drawImage(bg, (W - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.fillStyle = 'rgba(255,253,246,0.14)';
      ctx.fillRect(0, 0, W, H);
    } else {
      paper(ctx, W, H);
    }

    const glow = ctx.createRadialGradient(W / 2, 150, 20, W / 2, 150, 420);
    glow.addColorStop(0, 'rgba(255,252,240,0.92)');
    glow.addColorStop(.6, 'rgba(255,251,238,0.60)');
    glow.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, -60, W, 460);

    /* رمضان كريم */
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(60,45,10,0.28)'; ar(92, '700');
    ctx.fillText('رمضان كريم', W / 2 + 2, 250);
    const cg = ctx.createLinearGradient(0, 166, 0, 264);
    cg.addColorStop(0, '#16705A'); cg.addColorStop(.6, GREEN); cg.addColorStop(1, GREEN_D);
    ctx.fillStyle = cg;
    ctx.fillText('رمضان كريم', W / 2, 248);
    ctx.restore();

    divider(ctx, W / 2, 288, 200);

    /* اليوم والمدينة */
    ctx.textAlign = 'center';
    ctx.fillStyle = GREEN_D; ar(46, '700');
    ctx.fillText(meta.dayLine, W / 2, 372);
    ctx.fillStyle = '#5C4A1E'; ar(34, '700');
    ctx.fillText(meta.city, W / 2, 426);
    ctx.fillStyle = 'rgba(92,74,30,.82)'; num(21, '600');
    ctx.fillText(meta.dateLine, W / 2, 464);

    /* بطاقتا الإمساك والإفطار */
    const pad = 54, gap = 22, cardTop = 540, cardH = 300;
    const cw = (W - pad * 2 - gap) / 2;
    const cards = [
      { x: W - pad - cw, label: meta.lImsak, time: row.imsak || '—', hint: meta.lImsakHint, gold: true },
      { x: pad, label: meta.lIftar, time: row.t.Maghrib || '—', hint: meta.lIftarHint, gold: false },
    ];
    cards.forEach(c => {
      ctx.save();
      ctx.shadowColor = 'rgba(14,75,60,.28)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
      ctx.fillStyle = 'rgba(255,253,247,0.94)';
      roundRect(ctx, c.x, cardTop, cw, cardH, 26); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = c.gold ? 'rgba(184,145,47,.90)' : 'rgba(15,118,110,.55)';
      ctx.lineWidth = 2.4;
      roundRect(ctx, c.x, cardTop, cw, cardH, 26); ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = c.gold ? '#8A6A1E' : '#0F766E';
      ar(30, '700');
      ctx.fillText(c.label, c.x + cw / 2, cardTop + 62);
      ctx.fillStyle = GREEN_D;
      num(88, '800');
      ctx.fillText(c.time, c.x + cw / 2, cardTop + 190);
      if (c.hint) {
        ctx.fillStyle = 'rgba(92,74,30,.72)'; ar(20, '600');
        ctx.fillText(c.hint, c.x + cw / 2, cardTop + 248);
      }
    });

    /* بقية الصلوات — ٥ بلاطات */
    const tiles = [
      { l: meta.lFajr, v: row.t.Fajr },
      { l: meta.lSunrise, v: row.t.Sunrise },
      { l: meta.lDhuhr, v: row.t.Dhuhr },
      { l: meta.lAsr, v: row.t.Asr },
      { l: meta.lIsha, v: row.t.Isha },
    ];
    const tGap = 14;
    const tw = (W - pad * 2 - tGap * 4) / 5;
    const ty = 880, th = 152;
    tiles.forEach((t, i) => {
      const x = W - pad - tw - i * (tw + tGap);
      ctx.fillStyle = 'rgba(255,253,247,0.80)';
      roundRect(ctx, x, ty, tw, th, 18); ctx.fill();
      ctx.strokeStyle = 'rgba(184,145,47,.45)'; ctx.lineWidth = 1.4;
      roundRect(ctx, x, ty, tw, th, 18); ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6B5B33'; ar(21, '600');
      ctx.fillText(t.l, x + tw / 2, ty + 48);
      ctx.fillStyle = GREEN_D; num(34, '800');
      ctx.fillText(t.v || '—', x + tw / 2, ty + 108);
    });

    /* طول الصيام */
    const pillW = 620, pillH = 88, pillY = 1080;
    ctx.save();
    ctx.fillStyle = 'rgba(14,75,60,.92)';
    roundRect(ctx, (W - pillW) / 2, pillY, pillW, pillH, 44); ctx.fill();
    ctx.strokeStyle = 'rgba(228,206,142,.60)'; ctx.lineWidth = 1.6;
    roundRect(ctx, (W - pillW) / 2, pillY, pillW, pillH, 44); ctx.stroke();
    ctx.restore();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F2E7C6'; ar(26, '600');
    ctx.fillText(meta.lFast, W / 2 - 92, pillY + 56);
    ctx.fillStyle = '#FFE9B5'; num(34, '800');
    ctx.fillText(meta.fastLen, W / 2 + 96, pillY + 57);

    /* آية الإمساك */
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(60,74,30,.92)'; ar(36, '600');
    ctx.fillText('وَكُلُوا وَاشْرَبُوا حَتَّىٰ يَتَبَيَّنَ لَكُمُ', W / 2, 1290);
    ctx.fillText('الْخَيْطُ الْأَبْيَضُ مِنَ الْخَيْطِ الْأَسْوَدِ مِنَ الْفَجْرِ', W / 2, 1350);
    ctx.fillStyle = 'rgba(122,106,60,.90)'; ar(24, '600');
    ctx.fillText('سورة البقرة · ١٨٧', W / 2, 1400);

    /* التذييل */
    ctx.fillStyle = '#7C7350'; ar(22, '500');
    ctx.fillText(meta.note || '', W / 2, 1700);
    if (meta.method) {
      ctx.fillStyle = 'rgba(124,115,80,.85)'; num(17, '600');
      ctx.fillText(meta.method, W / 2, 1740);
    }
    ctx.fillStyle = GREEN;
    ctx.font = '800 26px ' + NUM;
    ctx.fillText('Quba  ·  قُبا', W / 2, 1810);

    return cv;
  }

  window.ImsakPoster = { render: draw, renderDay: drawDay };
})();
