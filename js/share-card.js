/**
 * 🖼️ مشاركة آية اليوم / دعاء اليوم — Quba
 *
 * Genera una tarjeta 1080×1350 (4:5, ideal para story/feed de WhatsApp e
 * Instagram) con una de las plantillas de fondo incluidas, el texto árabe
 * en el centro y debajo la traducción (español o inglés según el ajuste de
 * idioma) en blanco. Marca de agua pequeña del logo + nombre del app en la
 * esquina inferior. Botones: Descargar PNG / Compartir (Web Share API).
 */

const ShareCard = {
  BG_LIST: ['bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg', 'bg5.jpg', 'bg6.jpg', 'bg7.jpg', 'bg8.jpg', 'bg9.jpg'],
  BG_DIR: 'assets/share-bg/',
  LOGO: 'assets/logo.png',
  W: 1080,
  H: 1350,
  selectedBg: 0,
  _lastBlob: null,
  _lastUrl: null,

  /** type: 'verse' | 'dua' */
  open(type) {
    const verse = (typeof getFamousVerseOfTheDay === 'function') ? getFamousVerseOfTheDay() : null;
    const dua = (typeof getDuaOfTheDay === 'function') ? getDuaOfTheDay() : null;
    const locale = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.locale) || 'es';
    const trKey = 'translation_' + locale;
    const wisKey = 'wisdom_' + locale;

    let data;
    if (type === 'verse' && verse) {
      data = {
        type: 'verse',
        arabic: verse.arabic,
        translation: verse[trKey] || verse.translation_es,
        source: `${verse.surahName} ${verse.surahNumber}:${verse.ayahNumber}`,
        wisdom: verse[wisKey] || verse.wisdom_es || '',
      };
    } else {
      data = {
        type: 'dua',
        arabic: dua ? dua.arabic : '',
        translation: dua ? dua.translation : '',
        source: dua ? dua.source : '',
        wisdom: '',
      };
    }

    this._renderModal(type, data);
    this._renderImage(data, this.selectedBg);
  },

  _renderModal(type, data) {
    let host = document.getElementById('share-card-modal');
    if (!host) {
      host = document.createElement('div');
      host.id = 'share-card-modal';
      host.className = 'sc-modal';
      document.body.appendChild(host);
    }

    const thumbs = this.BG_LIST.map((f, i) => `
      <button class="sc-thumb${i === this.selectedBg ? ' active' : ''}"
              data-bg="${i}" onclick="ShareCard.selectBg(${i})"
              aria-label="Fondo ${i + 1}">
        <img src="${this.BG_DIR}${f}" alt="" loading="lazy" draggable="false">
      </button>`).join('');

    host.innerHTML = `
      <div class="sc-backdrop" onclick="ShareCard.close()"></div>
      <div class="sc-panel" dir="ltr">
        <div class="sc-head">
          <h3><i class="fas fa-share-nodes"></i> ${t('shareCardTitle')}</h3>
          <button class="sc-close" onclick="ShareCard.close()" aria-label="${t('shareCardClose')}">
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <div class="sc-toggle">
          <button class="${type === 'verse' ? 'active' : ''}" onclick="ShareCard.switchType('verse')">
            <i class="fas fa-book-open-reader"></i> ${t('verseOfDay')}
          </button>
          <button class="${type === 'dua' ? 'active' : ''}" onclick="ShareCard.switchType('dua')">
            <i class="fas fa-hands-praying"></i> ${t('duaOfDay')}
          </button>
        </div>

        <div class="sc-preview">
          <img id="sc-result" alt="${t('shareCardPreview')}">
          <div class="sc-loading" id="sc-loading"><i class="fas fa-circle-notch fa-spin"></i></div>
        </div>

        <div class="sc-thumbs">${thumbs}</div>

        <div class="sc-actions">
          <button class="sc-btn sc-btn-secondary" onclick="ShareCard.download()">
            <i class="fas fa-download"></i> ${t('shareCardDownload')}
          </button>
          <button class="sc-btn sc-btn-primary" onclick="ShareCard.share()">
            <i class="fas fa-share-nodes"></i> ${t('shareCardShare')}
          </button>
        </div>
      </div>`;

    host.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  switchType(type) {
    this.close();
    this.open(type);
  },

  selectBg(i) {
    this.selectedBg = i;
    const host = document.getElementById('share-card-modal');
    if (host) {
      host.querySelectorAll('.sc-thumb').forEach(b =>
        b.classList.toggle('active', parseInt(b.dataset.bg, 10) === i));
    }
    const verse = (typeof getFamousVerseOfTheDay === 'function') ? getFamousVerseOfTheDay() : null;
    const dua = (typeof getDuaOfTheDay === 'function') ? getDuaOfTheDay() : null;
    const isVerse = host && host.querySelector('.sc-toggle button.active i.fa-book-open-reader');
    const locale = (typeof AppState !== 'undefined' && AppState.settings && AppState.settings.locale) || 'es';
    const trKey = 'translation_' + locale;
    const wisKey = 'wisdom_' + locale;
    const data = isVerse && verse
      ? { type: 'verse', arabic: verse.arabic, translation: verse[trKey] || verse.translation_es,
          source: `${verse.surahName} ${verse.surahNumber}:${verse.ayahNumber}`, wisdom: verse[wisKey] || '' }
      : { type: 'dua', arabic: dua ? dua.arabic : '',
          translation: dua ? (dua[trKey] || dua.translation_es || dua.translation) : '',
          source: dua ? dua.source : '', wisdom: '' };
    this._renderImage(data, i);
  },

  close() {
    const host = document.getElementById('share-card-modal');
    if (host) host.classList.remove('open');
    document.body.style.overflow = '';
    if (this._lastUrl) { URL.revokeObjectURL(this._lastUrl); this._lastUrl = null; }
  },

  _loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
  },

  /** Envuelve texto en líneas que quepan en maxWidth (canvas 2d). */
  _wrap(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/);
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

  /** Ajusta el tamaño de fuente hasta que el bloque quepa en maxH. */
  _fit(ctx, text, maxWidth, maxH, baseSize, minSize, lineHeight, makeFont) {
    let size = baseSize;
    let lines;
    do {
      ctx.font = makeFont(size);
      lines = this._wrap(ctx, text, maxWidth);
      if (lines.length * size * lineHeight <= maxH || size <= minSize) break;
      size -= 2;
    } while (size > minSize);
    return { size, lines, blockH: lines.length * size * lineHeight, lineHeight };
  },

  async _renderImage(data, bgIndex) {
    const loading = document.getElementById('sc-loading');
    const result = document.getElementById('sc-result');
    if (loading) loading.style.display = 'flex';

    try {
      // Asegurar que las fuentes árabes están listas antes de pintar
      try {
        await Promise.all([
          document.fonts.load('700 64px "Amiri"'),
          document.fonts.load('700 40px "Noto Naskh Arabic"'),
          document.fonts.load('600 36px "Inter"'),
          document.fonts.ready,
        ]);
      } catch (e) { /* si falla, se pinta con fuentes de sistema */ }

      const [bg, logo] = await Promise.all([
        this._loadImage(this.BG_DIR + this.BG_LIST[bgIndex]),
        this._loadImage(this.LOGO).catch(() => null),
      ]);

      const canvas = document.createElement('canvas');
      canvas.width = this.W;
      canvas.height = this.H;
      const ctx = canvas.getContext('2d');

      // 1) Fondo cover
      const scale = Math.max(this.W / bg.width, this.H / bg.height);
      const dw = bg.width * scale, dh = bg.height * scale;
      ctx.drawImage(bg, (this.W - dw) / 2, (this.H - dh) / 2, dw, dh);

      // 2) Veladura oscura suave (legibilidad sin ocultar la imagen)
      ctx.fillStyle = 'rgba(10, 16, 14, 0.38)';
      ctx.fillRect(0, 0, this.W, this.H);
      const grad = ctx.createRadialGradient(this.W / 2, this.H / 2, this.H * 0.15,
                                            this.W / 2, this.H / 2, this.H * 0.75);
      grad.addColorStop(0, 'rgba(10, 16, 14, 0.35)');
      grad.addColorStop(1, 'rgba(10, 16, 14, 0.72)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.W, this.H);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 2;

      const maxW = this.W - 140; // márgenes laterales
      const cy = this.H / 2;

      // 3) Árabe (arriba del centro) — Amiri
      const ar = this._fit(ctx, data.arabic, maxW, 560, 76, 40, 1.55,
                           s => `700 ${s}px "Amiri", "Noto Naskh Arabic", serif`);
      // 4) Traducción (debajo) — Inter/Noto, blanco
      const tr = this._fit(ctx, '“' + (data.translation || '') + '”', maxW - 40, 340, 42, 26, 1.45,
                           s => `600 ${s}px "Inter", sans-serif`);
      // 5) Fuente / referencia
      const srcSize = 30;
      const gap = 34;
      const totalH = ar.blockH + gap + tr.blockH + (data.source ? gap + srcSize * 1.4 : 0);
      let y = cy - totalH / 2;

      ctx.direction = 'rtl';
      ar.lines.forEach(line => {
        ctx.font = `700 ${ar.size}px "Amiri", "Noto Naskh Arabic", serif`;
        ctx.fillText(line, this.W / 2, y + ar.size * ar.lineHeight / 2);
        y += ar.size * ar.lineHeight;
      });
      y += gap;

      // Separador ornamental
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(this.W / 2 - 90, y - 8, 180, 3);
      ctx.beginPath();
      ctx.arc(this.W / 2, y - 6, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 14;
      y += gap - 12;

      ctx.direction = 'ltr';
      tr.lines.forEach(line => {
        ctx.font = `600 ${tr.size}px "Inter", sans-serif`;
        ctx.fillText(line, this.W / 2, y + tr.size * tr.lineHeight / 2);
        y += tr.size * tr.lineHeight;
      });

      if (data.source) {
        y += gap - 10;
        ctx.font = `500 ${srcSize}px "Inter", sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.fillText('— ' + data.source + ' —', this.W / 2, y);
      }

      // 6) Marca de agua: logo + nombre en la esquina inferior izquierda
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8;
      const wmY = this.H - 64;
      const wmLogo = 44;
      if (logo) {
        ctx.globalAlpha = 0.9;
        ctx.drawImage(logo, 48, wmY - wmLogo / 2, wmLogo, wmLogo);
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = 'left';
      ctx.font = '600 30px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillText('Quba', 48 + (logo ? wmLogo + 16 : 0), wmY);
      ctx.font = '400 22px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillText(t('shareCardWatermark'), 48 + (logo ? wmLogo + 16 : 0), wmY + 28);

      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      this._lastBlob = blob;
      if (this._lastUrl) URL.revokeObjectURL(this._lastUrl);
      this._lastUrl = URL.createObjectURL(blob);
      if (result) result.src = this._lastUrl;
    } catch (e) {
      console.warn('ShareCard render error:', e);
    } finally {
      if (loading) loading.style.display = 'none';
    }
  },

  download() {
    if (!this._lastBlob) return;
    const a = document.createElement('a');
    const day = new Date().toISOString().slice(0, 10);
    a.href = URL.createObjectURL(this._lastBlob);
    a.download = `quba-daily-${day}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  },

  async share() {
    if (!this._lastBlob) return;
    const day = new Date().toISOString().slice(0, 10);
    const file = new File([this._lastBlob], `quba-daily-${day}.png`, { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Quba' });
      } else {
        // Navegadores sin compartir de archivos → descarga directa
        this.download();
      }
    } catch (e) {
      if (e && e.name !== 'AbortError') this.download();
    }
  },
};
