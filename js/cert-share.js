/**
 * 🏅 شهادة إتمام الدورة — Quba
 *
 * v36: genera una IMAGEN (canvas 1472×2208) usando el fondo ornamental
 * verde/dorado del usuario (assets/cert/certificate-template.jpg) en lugar
 * del antiguo texto plano que se compartía. Modal con vista previa +
 * botones "Descargar PNG" y "Compartir" (Web Share API con archivo).
 */

const CertShare = {
  TEMPLATE: 'assets/cert/certificate-template.jpg',
  LOGO: 'assets/logo.png',
  // Plantilla original 736×1104 → salida ×2 (1472×2208), ideal para imprimir/compartir
  W: 1472,
  H: 2208,
  _lastBlob: null,
  _lastUrl: null,

  _loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
  },

  _wrap(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  },

  /** Reduce la fuente hasta que el texto quepa en una línea de maxWidth. */
  _fitLine(ctx, text, maxWidth, baseSize, minSize, makeFont) {
    let size = baseSize;
    while (size > minSize) {
      ctx.font = makeFont(size);
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    }
    return size;
  },

  _ornamentLine(ctx, cx, y, halfW, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - halfW, y);
    ctx.lineTo(cx - 40, y);
    ctx.moveTo(cx + 40, y);
    ctx.lineTo(cx + halfW, y);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.save();
    ctx.translate(cx, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
  },

  /** Datos localizados de la fecha (hijri + gregoriana) para la firma. */
  _dateLines(locale) {
    const ar = locale === 'ar';
    const now = new Date();
    const greg = now.toLocaleDateString(ar ? 'ar-EG' : locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let hijri = '';
    const h = (typeof AppState !== 'undefined') ? AppState.hijri : null;
    if (h && h.day && h.year) {
      const m = ar ? (h.month?.ar || h.month?.en) : (h.month?.en || h.month?.ar);
      hijri = `${h.day} ${m} ${h.year} هـ`;
    } else if (typeof API !== 'undefined' && API._gregorianToHijriRich) {
      const hl = API._gregorianToHijriRich(now);
      const m = ar ? (hl.month?.ar || hl.month?.en) : (hl.month?.en || hl.month?.ar);
      hijri = `${hl.day} ${m} ${hl.year} هـ`;
    }
    return { greg, hijri };
  },

  async _renderImage(data) {
    try {
      await Promise.all([
        document.fonts.load('700 64px "Amiri"'),
        document.fonts.load('700 48px "Noto Naskh Arabic"'),
        document.fonts.ready,
      ]);
    } catch (e) { /* fuentes de sistema si falla */ }

    const [tpl, logo] = await Promise.all([
      this._loadImage(this.TEMPLATE),
      this._loadImage(this.LOGO).catch(() => null),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = this.W;
    canvas.height = this.H;
    const ctx = canvas.getContext('2d');

    // Fondo: la plantilla ornamental (cover)
    const scale = Math.max(this.W / tpl.width, this.H / tpl.height);
    const dw = tpl.width * scale, dh = tpl.height * scale;
    ctx.drawImage(tpl, (this.W - dw) / 2, (this.H - dh) / 2, dw, dh);

    const rtl = data.locale === 'ar';
    const cx = this.W / 2;
    const innerW = this.W * 0.72; // margen dentro del marco dorado
    const GOLD = '#d4af37';
    const GOLD_SOFT = '#e9d189';
    const IVORY = '#f5f1e6';
    const arFont = '"Amiri","Noto Naskh Arabic",serif';
    const latFont = '"Georgia","Times New Roman",serif';
    const main = rtl ? arFont : latFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = rtl ? 'rtl' : 'ltr';

    let y = this.H * 0.145;

    // Bismillah (siempre en árabe, tipografía Amiri)
    ctx.fillStyle = GOLD_SOFT;
    ctx.font = `600 ${Math.round(this.W * 0.034)}px ${arFont}`;
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', cx, y);
    y += this.H * 0.052;

    // Título del certificado
    ctx.fillStyle = GOLD;
    const titleSize = this._fitLine(ctx, data.title, innerW, Math.round(this.W * 0.058), 30, s => `700 ${s}px ${main}`);
    ctx.font = `700 ${titleSize}px ${main}`;
    ctx.fillText(data.title, cx, y);
    y += this.H * 0.036;
    this._ornamentLine(ctx, cx, y, innerW * 0.32, GOLD);
    y += this.H * 0.050;

    // "Otorgado a"
    ctx.fillStyle = IVORY;
    ctx.font = `italic 400 ${Math.round(this.W * 0.030)}px ${main}`;
    ctx.fillText(data.presentedTo, cx, y);
    y += this.H * 0.052;

    // Nombre del estudiante (lo más grande)
    ctx.fillStyle = GOLD;
    const nameSize = this._fitLine(ctx, data.name, innerW, Math.round(this.W * 0.080), 34, s => `700 ${s}px ${main}`);
    ctx.font = `700 ${nameSize}px ${main}`;
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 8;
    ctx.fillText(data.name, cx, y);
    ctx.shadowBlur = 0;
    y += this.H * 0.034;
    this._ornamentLine(ctx, cx, y, innerW * 0.44, GOLD);
    y += this.H * 0.052;

    // "ha completado el curso"
    ctx.fillStyle = IVORY;
    ctx.font = `400 ${Math.round(this.W * 0.030)}px ${main}`;
    ctx.fillText(data.hasCompleted, cx, y);
    y += this.H * 0.050;

    // Nombre del curso (puede ocupar 2 líneas)
    ctx.fillStyle = '#ffffff';
    const courseBase = Math.round(this.W * 0.042);
    ctx.font = `700 ${courseBase}px ${main}`;
    const courseLines = this._wrap(ctx, `${data.courseIcon} ${data.courseTitle}`, innerW);
    courseLines.slice(0, 2).forEach(line => {
      ctx.fillText(line, cx, y);
      y += courseBase * 1.35;
    });
    y += this.H * 0.030;

    // Fechas: hijri + gregoriana
    ctx.fillStyle = GOLD_SOFT;
    ctx.font = `600 ${Math.round(this.W * 0.028)}px ${main}`;
    if (data.hijri) {
      ctx.fillText(`${t('dateHijriLabel')}: ${data.hijri}`, cx, y);
      y += this.H * 0.038;
    }
    ctx.fillText(`${t('dateGregorianLabel')}: ${data.greg}`, cx, y);

    // Logo + firma cerca del borde inferior (encima del ornamento inferior)
    const footY = this.H * 0.845;
    if (logo) {
      const lh = Math.round(this.H * 0.055);
      const lw = Math.round(lh * (logo.width / logo.height));
      ctx.drawImage(logo, cx - lw / 2, footY - lh / 2, lw, lh);
    }
    ctx.fillStyle = GOLD;
    ctx.font = `700 ${Math.round(this.W * 0.028)}px ${main}`;
    ctx.fillText(`Quba — ${data.signature}`, cx, footY + this.H * 0.045);

    return canvas;
  },

  async open(course, userName, locale) {
    const { greg, hijri } = this._dateLines(locale);
    const data = {
      locale,
      title: t('certificateOfCompletion'),
      presentedTo: t('presentedTo'),
      name: userName,
      hasCompleted: t('hasCompleted'),
      // course.icon puede ser HTML (<i class="fas fa-…"></i>) — canvas no
      // pinta HTML, así que usamos solo emoji/txt plano; si no hay, ⭐.
      courseIcon: /<[^>]+>/.test(course.icon || '')
        ? '⭐'
        : (String(course.icon || '').trim() || '⭐'),
      courseTitle: course.title[locale] || course.title.es,
      signature: t('islamicLearning'),
      greg,
      hijri,
    };

    this._renderModal(course);
    try {
      const canvas = await this._renderImage(data);
      this._lastBlob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      if (this._lastUrl) URL.revokeObjectURL(this._lastUrl);
      this._lastUrl = URL.createObjectURL(this._lastBlob);
      const img = document.getElementById('cert-share-result');
      const loading = document.getElementById('cert-share-loading');
      if (img) img.src = this._lastUrl;
      if (loading) loading.style.display = 'none';
    } catch (e) {
      console.warn('CertShare render error:', e);
      showToast('⚠️ ' + (e.message || 'Error'), 2500);
      this.close();
    }
  },

  _renderModal(course) {
    let host = document.getElementById('cert-share-modal');
    if (!host) {
      host = document.createElement('div');
      host.id = 'cert-share-modal';
      host.className = 'sc-modal';
      document.body.appendChild(host);
    }
    host.innerHTML = `
      <div class="sc-backdrop" onclick="CertShare.close()"></div>
      <div class="sc-panel" dir="ltr">
        <div class="sc-head">
          <h3><i class="fas fa-award"></i> ${t('certificateOfCompletion')}</h3>
          <button class="sc-close" onclick="CertShare.close()" aria-label="${t('shareCardClose')}">
            <i class="fas fa-xmark"></i>
          </button>
        </div>
        <div class="sc-preview cert-share-preview">
          <img id="cert-share-result" alt="${t('certificateOfCompletion')}">
          <div class="sc-loading" id="cert-share-loading"><i class="fas fa-circle-notch fa-spin"></i></div>
        </div>
        <div class="sc-actions">
          <button class="sc-btn sc-btn-secondary" onclick="CertShare.download()">
            <i class="fas fa-download"></i> ${t('downloadCertificate')}
          </button>
          <button class="sc-btn sc-btn-primary" onclick="CertShare.share('${course.id}')">
            <i class="fas fa-share-nodes"></i> ${t('shareCertificate')}
          </button>
        </div>
      </div>`;
    host.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  download() {
    if (!this._lastBlob) return;
    const a = document.createElement('a');
    a.href = this._lastUrl;
    a.download = 'quba-certificate.png';
    a.click();
    showToast('✔️ ' + (t('downloadCertificate')), 1500);
  },

  async share(courseId) {
    if (!this._lastBlob) return;
    const file = new File([this._lastBlob], 'quba-certificate.png', { type: 'image/png' });
    const locale = (typeof currentLocale !== 'undefined') ? currentLocale : 'es';
    const lang = locale === 'ar' ? 'ar' : (locale === 'en' ? 'en' : 'es');
    const course = (typeof CoursesPage !== 'undefined')
      ? CoursesPage.getAllCourses().find(c => c.id === courseId) : null;
    const title = course ? (course.title[lang] || course.title.es) : 'Quba';
    const text = `🏆 ${t('justCompleted')}: ${title} — Quba`;
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title, text }); } catch (e) { /* cancelado */ }
    } else if (navigator.share) {
      try { await navigator.share({ title, text }); } catch (e) { /* cancelado */ }
    } else {
      this.download();
    }
  },

  close() {
    const host = document.getElementById('cert-share-modal');
    if (host) host.classList.remove('open');
    document.body.style.overflow = '';
    if (this._lastUrl) { URL.revokeObjectURL(this._lastUrl); this._lastUrl = null; }
    this._lastBlob = null;
  },
};
