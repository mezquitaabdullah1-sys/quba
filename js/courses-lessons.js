// 🕌 Lecciones específicas del curso de árabe (v2)
// Se añaden a CoursesPage como render_<type>(lesson) + los estados/handlers
// que necesitan (match_pairs, word_builder, word_order, video con pestañas).
// Depende de: ArabicItems (js/arabic-items.js), ArabicAudio (js/arabic-audio.js),
// CoursesSRS (js/courses-srs.js). Todo el texto pasa por this.X()/this.bold()
// para resolver {es,ar,en} y convertir **negrita**.
Object.assign(CoursesPage, {

  _skipCard() {
    return `<div class="lesson-card"><button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button></div>`;
  },

  // ============ VIDEO ============
  render_video(lesson) {
    if (lesson.segments && lesson.segments.length) {
      this._vid = { segs: lesson.segments };
      return `
        <div class="lesson-card cx-video-lesson">
          ${Mascot.render('idle', 'medium', 'lesson-mascot')}
          <h2 class="lesson-card-title">${this.X(lesson.title)}</h2>
          <div class="cx-video-tabs">
            ${lesson.segments.map((s, i) => `<button class="cx-vtab ${i === 0 ? 'active' : ''}" data-vi="${i}" onclick="CoursesPage.videoTab(${i})">${this.X(s.label) || (i + 1)}</button>`).join('')}
          </div>
          <div id="cx-video-slot">${this._videoBlock(lesson.segments[0], 'cxv0')}</div>
          <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>
        </div>`;
    }
    this._vid = null;
    return `
      <div class="lesson-card cx-video-lesson">
        ${Mascot.render('idle', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${this.X(lesson.title)}</h2>
        <div id="cx-video-slot">${this._videoBlock(lesson, 'cxv0')}</div>
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>
      </div>`;
  },

  videoTab(i) {
    if (!this._vid) return;
    document.querySelectorAll('.cx-vtab').forEach((b, bi) => b.classList.toggle('active', bi === i));
    const slot = document.getElementById('cx-video-slot');
    if (slot) slot.innerHTML = this._videoBlock(this._vid.segs[i], 'cxv' + i);
  },

  // v67: convierte "44:41", "1:02:03", "75" o 75 → segundos (número entero).
  // Antes los clips de las letras llegaban como texto ("0:49") y acababan en
  // `start=NaN` en la URL del reproductor: el vídeo no arrancaba en su clip.
  _toSec(v) {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'number') return isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
    const s = String(v).trim();
    if (/^\d+(\.\d+)?$/.test(s)) return Math.floor(parseFloat(s));
    const p = s.split(':').map(Number);
    if (!p.length || p.length > 3 || p.some(n => isNaN(n))) return 0;
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : (p.length === 2 ? p[0] * 60 + p[1] : p[0]);
  },

  // Bloque reutilizable: miniatura con botón de reproducir (no carga el
  // iframe hasta el toque, para ahorrar datos), resumen y fila "toca para oír".
  _videoBlock(v, uid) {
    if (!v) return '';
    const title = this.X(v.title);
    const summary = this.fmtContent(v.summary);
    const listen = (v.listen || []).map(it => {
      if (typeof it === 'string') {
        const g = (typeof ArabicItems !== 'undefined') ? ArabicItems.glyph(it) : it;
        return `<button class="cx-listen-chip" onclick="ArabicAudio.play('${it}')"><i class="fas fa-volume-low"></i> <span dir="rtl">${g}</span></button>`;
      }
      const say = JSON.stringify({ key: it.key || null, text: it.text || '' });
      return `<button class="cx-listen-chip" onclick='ArabicAudio.play(${say})'><i class="fas fa-volume-low"></i> <span dir="rtl">${it.text || ''}</span>${it.label ? `<small>${it.label}</small>` : ''}</button>`;
    }).join('');
    const start = this._toSec(v.start);
    const end = this._toSec(v.end);
    let media, openLink = '';
    if (v.provider === 'local') {
      // Si el archivo no existe (p. ej. aún no se subió), se muestra un aviso
      // en lugar de un reproductor roto.
      media = `<video class="cx-video-el" controls playsinline preload="none" poster="${escapeAttr(v.poster || '')}" src="${escapeAttr(v.src)}" onerror="CoursesPage._videoMissing(this)"></video>`;
    } else {
      const ytId = /^[\w-]{11}$/.test(String(v.id || '')) ? v.id : '';
      if (!ytId) return '';
      const thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      media = `
        <div class="cx-video-thumb" id="${uid}" role="button" tabindex="0" style="background-image:url('${thumb}')" onclick="CoursesPage.loadYouTube('${uid}','${ytId}',${start},${end})">
          <span class="cx-video-play" aria-label="${escapeAttr(t('cxPlayClip') || 'Reproducir')}"><i class="fas fa-play"></i></span>
        </div>`;
      // Enlace de respaldo: si el reproductor incrustado fallara (sin conexión
      // o bloqueado por el sistema), el clip se abre igual en YouTube.
      openLink = `<a class="cx-video-open" href="https://www.youtube.com/watch?v=${ytId}${start ? '&t=' + start + 's' : ''}" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube"></i> ${t('cxOpenYoutube') || 'Abrir en YouTube'}</a>`;
    }
    return `
      <div class="cx-video-block">
        ${media}
        ${openLink}
        ${title ? `<div class="cx-video-title">${title}</div>` : ''}
        ${summary ? `<div class="cx-video-summary">${summary}</div>` : ''}
        ${listen ? `<div class="cx-listen-row">${listen}</div>` : ''}
        <div class="cx-video-stopnote"><i class="fas fa-hand"></i> ${t('cxPauseRepeat') || 'Pausa el vídeo y repite en voz alta'}</div>
      </div>`;
  },

  _videoMissing(el) {
    if (!el || !el.parentNode) return;
    const d = document.createElement('div');
    d.className = 'cx-video-missing';
    d.innerHTML = '<i class="fas fa-film"></i> ' + escapeHtml(t('cxVideoMissing') || 'Vídeo no disponible por ahora');
    el.parentNode.replaceChild(d, el);
  },

  // ============ v69: VÍDEO DE BIENVENIDA A PANTALLA COMPLETA ============
  // Se muestra UNA sola vez al abrir el curso de árabe por primera vez
  // (prog.introSeen). Al terminar aparece el botón dorado «Empezar», que cierra
  // el vídeo y abre la etapa de introducción. El mismo vídeo sigue siendo la
  // primera lección de esa etapa (lesson type 'video') para verlo más tarde.
  _introVideoCfg() {
    const V = (typeof ARABIC_DATA !== 'undefined' && ARABIC_DATA.VIDEO && ARABIC_DATA.VIDEO.intro) || null;
    return V && V.src ? V : { src: 'assets/video/arabic_intro.mp4', poster: 'assets/courses/arabic/intro-poster.webp' };
  },

  _maybeShowIntro(course) {
    if (!course || course.id !== 'arabic_language') return;
    if (document.getElementById('cx-intro-overlay')) return;
    const gs = this._gs();
    const prog = this._prog(gs, course.id);
    if (prog.introSeen) return;
    this.showIntroVideo(course);
  },

  showIntroVideo(course) {
    if (document.getElementById('cx-intro-overlay')) return;
    const cfg = this._introVideoCfg();
    const el = document.createElement('div');
    el.id = 'cx-intro-overlay';
    el.className = 'cx-intro-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = `
      <video class="cx-intro-video" playsinline webkit-playsinline preload="auto" poster="${escapeAttr(cfg.poster || '')}" src="${escapeAttr(cfg.src)}"></video>
      <button class="cx-intro-skip" type="button" aria-label="${escapeAttr(t('cxIntroSkip') || 'Saltar')}"><i class="fas fa-xmark"></i></button>
      <button class="cx-intro-play" type="button" hidden aria-label="${escapeAttr(t('cxIntroPlay') || 'Reproducir')}"><i class="fas fa-play"></i></button>
      <div class="cx-intro-end" hidden>
        <button class="cx-intro-start" type="button">${escapeHtml(t('cxIntroStart') || 'Empezar')}</button>
      </div>`;
    document.body.appendChild(el);
    this._introEl = el;

    const video = el.querySelector('video');
    const playBtn = el.querySelector('.cx-intro-play');
    const endBox = el.querySelector('.cx-intro-end');
    // Pantalla completa real cuando el navegador lo permite (si no, el overlay
    // fijo ya cubre toda la ventana, incluida la barra de pestañas).
    try { const rf = el.requestFullscreen || el.webkitRequestFullscreen; if (rf) { const p = rf.call(el); if (p && p.catch) p.catch(() => {}); } } catch (_) {}

    const showEnd = () => { playBtn.hidden = true; endBox.hidden = false; requestAnimationFrame(() => endBox.classList.add('show')); };
    const tryPlay = () => {
      const p = video.play();
      if (p && p.catch) p.catch(() => { playBtn.hidden = false; }); // autoplay con sonido bloqueado → botón ▶
    };
    video.addEventListener('playing', () => { playBtn.hidden = true; });
    video.addEventListener('ended', showEnd);
    video.addEventListener('error', showEnd);   // si el archivo falta, no dejar al usuario bloqueado
    video.addEventListener('click', () => { if (endBox.hidden) { video.paused ? tryPlay() : video.pause(); } });
    playBtn.addEventListener('click', tryPlay);
    el.querySelector('.cx-intro-skip').addEventListener('click', () => this.closeIntroVideo(false));
    el.querySelector('.cx-intro-start').addEventListener('click', () => this.closeIntroVideo(true));
    tryPlay();
  },

  closeIntroVideo(startCourse) {
    const el = this._introEl || document.getElementById('cx-intro-overlay');
    if (el) {
      const v = el.querySelector('video');
      try { v && v.pause(); } catch (_) {}
      try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); } catch (_) {}
      el.remove();
    }
    this._introEl = null;
    const gs = this._gs();
    const prog = this._prog(gs, 'arabic_language');
    prog.introSeen = true;
    Gamification.saveState(gs);
    if (!startCourse) return;
    // Abre la etapa de introducción. El vídeo ya se acaba de ver, así que se
    // cuenta como lección hecha y la etapa continúa desde la siguiente.
    this.startStation('arabic_language', 'welcome');
    const st = this.state;
    if (st && st.stationId === 'welcome' && st.lessonIdx === 0 && st.station.lessons[0] && st.station.lessons[0].type === 'video') {
      this._markLessonDone(0, Gamification.XP_PER_LESSON || 25);
      st.lessonIdx = 1;
    }
  },

  loadYouTube(uid, ytId, start, end) {
    const el = document.getElementById(uid);
    if (!el || !/^[\w-]{11}$/.test(String(ytId))) return;
    const s = this._toSec(start), e = this._toSec(end);
    const params = ['autoplay=1', 'rel=0', 'modestbranding=1', 'playsinline=1'];
    if (s) params.push('start=' + s);
    if (e && e > s) params.push('end=' + e);
    try { if (/^https?:$/.test(location.protocol)) params.push('origin=' + encodeURIComponent(location.origin)); } catch (_) {}
    el.outerHTML = `<div class="cx-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${ytId}?${params.join('&')}" title="video" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  },

  // ============ INFOGRAFÍA ============
  render_infographic(lesson) {
    const layout = lesson.layout || 'list';
    const items = lesson.items || [];
    const examples = (lesson.examples || []).map((ex, i) => {
      const say = JSON.stringify({ key: ex.key || null, text: ex.text || '' });
      return `<button class="cx-listen-chip" onclick='ArabicAudio.play(${say})'><span dir="rtl">${ex.text}</span><small>${ex.label || ''}</small></button>`;
    }).join('');
    return `
      <div class="lesson-card cx-infographic cx-layout-${layout}">
        ${Mascot.render('thinking', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${this.X(lesson.title)}</h2>
        ${lesson.intro ? `<div class="cx-info-intro">${this.X(lesson.intro)}</div>` : ''}
        <div class="cx-info-items">
          ${items.map((it, i) => this._infoItem(it, layout, i)).join('')}
        </div>
        ${examples ? `<div class="cx-listen-row">${examples}</div>` : ''}
        ${lesson.video ? this._videoBlock(lesson.video, 'cxvinfo') : ''}
        ${lesson.source ? `<div class="lesson-source"><i class="fas fa-book"></i> ${this.X(lesson.source)}</div>` : ''}
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>
      </div>`;
  },

  _infoItem(it, layout, i) {
    const visual = it.icon ? `<i class="fas ${it.icon}"></i>` : (it.glyph ? `<span dir="rtl">${it.glyph}</span>` : (layout === 'steps' ? (i + 1) : ''));
    const say = it.say ? `<button class="cx-audio-btn cx-audio-sm" onclick='ArabicAudio.play(${JSON.stringify({ key: it.say.key || null, text: it.say.text || '' })})'><i class="fas fa-volume-high"></i></button>` : '';
    return `
      <div class="cx-info-item">
        <div class="cx-info-visual">${visual}</div>
        <div class="cx-info-body">
          <div class="cx-info-title">${this.X(it.title)}</div>
          <div class="cx-info-text">${this.X(it.text)}</div>
        </div>
        ${say}
      </div>`;
  },

  // ============ TABLA DE SONIDOS (letra × harakat) ============
  render_sound_grid(lesson) {
    const D = ArabicItems.D();
    const letters = lesson.letters.map(id => D.byId[id]).filter(Boolean);
    const marks = lesson.marks.map(id => D.MARKS.find(m => m.id === id)).filter(Boolean);
    return `
      <div class="lesson-card cx-sound-grid">
        ${Mascot.render('encourage', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${this.X(lesson.title)}</h2>
        <div class="cx-sg-hint"><i class="fas fa-hand-point-up"></i> ${t('cxTapToHear') || 'Toca cada celda para escucharla'}</div>
        <div class="cx-sg-wrap"><table class="cx-sg-table">
          <thead><tr><th></th>${marks.map(m => `<th>${m.v || m.tr}</th>`).join('')}</tr></thead>
          <tbody>
            ${letters.map(l => `
              <tr><th class="cx-sg-letter" dir="rtl">${l.ch}</th>
                ${marks.map(m => {
                  const say = JSON.stringify({ key: ArabicItems.sylKey(l, m.id), text: l.ch + m.mark });
                  return `<td><button class="cx-sg-cell" dir="rtl" onclick='ArabicAudio.play(${say})'>${l.ch}${m.mark}</button></td>`;
                }).join('')}
              </tr>`).join('')}
          </tbody>
        </table></div>
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>
      </div>`;
  },

  // ============ FAMILIAS DE FORMA ============
  render_shape_families(lesson) {
    const D = ArabicItems.D();
    const set = new Set(lesson.letters || []);
    const fams = D.FAMILIES.filter(f => f.members.some(m => set.has(m)));
    return `
      <div class="lesson-card cx-shape-families">
        ${Mascot.render('thinking', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${t('cxFamilies') || 'Familias de forma'}</h2>
        <div class="cx-fam-list">
          ${fams.map(f => `
            <div class="cx-fam-card">
              <div class="cx-fam-title">${this.X(f.title)}</div>
              <div class="cx-fam-glyphs" dir="rtl">${f.members.filter(m => set.has(m)).map(m => `<span class="cx-fam-g">${D.byId[m].ch}</span>`).join('')}</div>
              <div class="cx-fam-hint">${this.X(f.hint)}</div>
            </div>`).join('')}
        </div>
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>
      </div>`;
  },

  // ============ HOJA DE LETRA (rica) ============
  render_arabic_letter(lesson) {
    const D = ArabicItems.D();
    const l = D.byId[lesson.letterId];
    if (!l) return this._skipCard();
    const positions = l.conn ? ['iso', 'ini', 'med', 'fin'] : ['iso', 'fin'];
    const formsRow = ['iso', 'ini', 'med', 'fin'].map(p => {
      const active = positions.includes(p);
      return `<div class="cx-form-cell ${active ? '' : 'dim'}"><div class="cx-form-glyph" dir="rtl">${l.forms[p]}</div><div class="cx-form-lbl">${ArabicItems.posLabel(p)}</div></div>`;
    }).join('');
    const dots = ArabicItems.dotsText(l.dots);
    const exMeaning = this.L({ es: l.ex.es, ar: l.ex.ar, en: l.ex.en });
    const pic = ArabicItems.pic(l.ex.e, l.ex.s, exMeaning, 'cx-letter-ex-pic');
    // v66: el vídeo de escritura de esta letra vive SIEMPRE dentro de la
    // tarjeta (no oculto tras un botón) para poder verlo y repasarlo junto
    // con el resto de la información, tal como se pidió.
    const clipBlock = l.clip
      ? `<div class="al-section"><div class="al-section-label">${t('cxHowToWrite') || 'Cómo se escribe'}</div>
           ${this._videoBlock(Object.assign({}, D.writingClip(l), { title: '', summary: '' }), 'cxclip_' + l.id)}
         </div>`
      : '';
    return `
      <div class="arabic-letter-lesson">
        <div class="al-letter-hero">
          <div class="al-letter-glyph" dir="rtl">${l.ch}</div>
          <button class="al-speak-btn" onclick="ArabicAudio.play('letter:${l.id}')"><i class="fas fa-volume-high"></i></button>
        </div>
        <div class="al-letter-name">${l.tr} <span class="al-name-ar" dir="rtl">(${l.nm})</span></div>

        <div class="al-section"><div class="al-section-label">${t('cxForms') || 'Las formas'}</div><div class="al-forms-grid">${formsRow}</div></div>

        <div class="al-section">
          <div class="al-section-label">${t('cxDotsLabel') || 'Los puntos'}</div>
          <div class="al-sound-desc">${dots}</div>
        </div>

        <div class="al-section">
          <div class="al-section-label">${t('cxSoundLabel') || 'El sonido'}</div>
          <div class="al-sound-desc">${this.X(l.sound)}</div>
          <div class="al-note">${this.X(l.mouth)}</div>
        </div>

        <div class="al-example-card">
          <div class="al-example-row">
            ${pic}
            <div class="al-example-content">
              <div class="al-example-word" dir="rtl">${l.ex.w}</div>
              <div class="al-example-translit">${l.ex.tr}</div>
              <div class="al-example-meaning">${exMeaning}</div>
            </div>
            <button class="al-speak-btn al-speak-sm" onclick="ArabicAudio.play({key:null,text:'${l.ex.w}'})"><i class="fas fa-volume-high"></i></button>
          </div>
        </div>

        ${l.note ? `<div class="al-note al-note-box">${this.X(l.note)}</div>` : ''}
        ${l.write ? `<div class="al-note">${this.X(l.write)}</div>` : ''}
        ${clipBlock}

        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.startLetterQuiz('${l.id}')">${t('cxCheckLetter') || 'Comprobar lo aprendido'} →</button>
      </div>`;
  },

  // v66: antes de pasar a la siguiente letra, 3 preguntas SOLO sobre esta.
  // No hay botón para saltarlas: la lección no avanza hasta resolverlas
  // (la cola de errores del motor ya permite reintentar las falladas).
  startLetterQuiz(letterId) {
    const lesson = this.state.station.lessons[this.state.lessonIdx];
    const D = ArabicItems.D();
    const l = D.byId[letterId];
    const qs = ArabicItems.session(['letter:' + letterId], 3, {});
    if (!qs.length) { this.advanceContent(lesson); return; }
    if (l) showToast('📝 ' + (t('cxCheckLetter') || 'Comprobar lo aprendido') + ': ' + l.ch, 1200);
    this.runQuestions(qs, { onDone: () => this.advanceContent(lesson) });
  },

  // ============ ESCUCHA Y ELIGE (secuencia de N preguntas de audio) ============
  render_listen_choose(lesson) {
    const qs = (typeof ArabicItems !== 'undefined') ? ArabicItems.session(lesson.items, lesson.items.length, { type: 'audio' }) : [];
    this.runQuestions(qs, {});
    return '';
  },

  // ============ QUIZ GENERADO (gen_quiz) ============
  render_gen_quiz(lesson) {
    let qs = [];
    if (lesson.special === 'nonconn') {
      const q = ArabicItems.qNonConnector();
      if (q) qs = [q];
    } else if (lesson.items && lesson.items.length) {
      const opts = lesson.qtype ? { type: lesson.qtype } : {};
      qs = ArabicItems.session(lesson.items, lesson.items.length, opts);
    }
    if (!qs.length) { this.advanceContent(lesson); return ''; }
    this.runQuestions(qs, {});
    return '';
  },

  // ============ PUNTO DE CONTROL (checkpoint) ============
  render_checkpoint(lesson) {
    const opts = lesson.qtype ? { type: lesson.qtype } : {};
    const qs = ArabicItems.session(lesson.items, lesson.n || 5, opts);
    if (!qs.length) { this.advanceContent(lesson); return ''; }
    this.runQuestions(qs, { onDone: (res) => this._afterCheckpoint(res) });
    return '';
  },

  _afterCheckpoint(res) {
    const noMistakes = res.mistakes === 0;
    if (noMistakes && res.total > 1) {
      showToast('🌟 ' + (t('cxFlawless') || '¡Punto de control sin errores!'), 2000);
      // وسم «محطة بلا أخطاء»: يُفتح عند إتمام أي نقطة تحقّق بلا أخطاء
      if (typeof Gamification !== 'undefined') Gamification.unlockAchievement('cx_flawless_station');
    } else {
      showToast('✅ ' + (t('cxCpPassed') || 'Punto de control superado'), 1600);
    }
    this.advanceContent();
  },

  // ============ EXAMEN FINAL ============
  render_final_exam(lesson) {
    const qs = ArabicItems.exam(lesson.n || 20);
    this.runQuestions(qs, { onDone: (res) => this._afterFinalExam(res) });
    return '';
  },

  _afterFinalExam(res) {
    const gs = this._gs();
    const prog = this._prog(gs, this.state.courseId);
    const tiers = (this.state.course.exam && this.state.course.exam.tiers) || { gold: 0.9, silver: 0.8, bronze: 0.7 };
    let tier = null;
    if (res.accuracy >= tiers.gold) tier = 'gold';
    else if (res.accuracy >= tiers.silver) tier = 'silver';
    else tier = 'bronze'; // la cola de errores ya obligó a corregir todo: siempre se completa
    prog.tier = tier;
    prog.examScore = res.accuracy;
    Gamification.saveState(gs);
    // وسم «الشهادة الذهبية»: امتحان نهائي بنسبة 90% فأكثر
    if (tier === 'gold' && typeof Gamification !== 'undefined') Gamification.unlockAchievement('cx_gold_cert');
    showToast(`${this._tierIcon(tier)} ${(t('cxExamScored') || 'Puntuación').replace('{pct}', Math.round(res.accuracy * 100))}`, 2400);
    this.advanceContent();
  },

  // ============ VOCABULARIO ============
  render_vocab(lesson) {
    const V = ArabicItems.V();
    const words = (lesson.words || []).map(id => V.byId[id]).filter(Boolean);
    return `
      <div class="lesson-card cx-vocab">
        ${Mascot.render('encourage', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${this.X(lesson.title)}</h2>
        ${lesson.intro ? `<div class="cx-info-intro">${this.X(lesson.intro)}</div>` : ''}
        <div class="cx-vocab-grid">
          ${words.map(w => {
            const meaning = ArabicItems.meaning(w);
            const tip = (V.TIPS && V.TIPS[w.id]) ? this.X(V.TIPS[w.id]) : '';
            return `
            <button class="cx-vocab-card" onclick="ArabicAudio.play('word:${w.id}')" title="${escapeHtml(tip)}">
              ${ArabicItems.pic(w.e, w.s, meaning, 'cx-vocab-pic')}
              <div class="cx-vocab-ar" dir="rtl">${w.ar}</div>
              <div class="cx-vocab-tr">${w.tr}</div>
              <div class="cx-vocab-meaning">${meaning}</div>
            </button>`;
          }).join('')}
        </div>
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>
      </div>`;
  },

  // ============ FRASE / AZORA (lectura palabra por palabra) ============
  render_phrase(lesson) {
    const V = ArabicItems.V();
    const phrases = (lesson.ids || []).map(id => V.PHRASES.find(p => p.id === id)).filter(Boolean);
    return `
      <div class="lesson-card cx-phrase-lesson">
        ${Mascot.render('idle', 'medium', 'lesson-mascot')}
        ${phrases.map(ph => `
          <div class="cx-phrase-card">
            ${ph.ref ? `<div class="cx-phrase-ref">${ph.ref}</div>` : ''}
            <div class="cx-phrase-ar" dir="rtl">${ph.ar}
              <button class="cx-audio-btn cx-audio-sm${ph.reciter ? ' cx-audio-reciter' : ''}" onclick="CoursesPage.playPhraseAudio('${ph.id}')" title="${ph.reciter ? (t('cxListenReciter') || 'Escuchar al recitador') : (t('cxListen') || 'Escuchar')}"><i class="fas fa-volume-high"></i></button>
            </div>
            <div class="cx-phrase-words" dir="rtl">
              ${ph.words.map(w => `<button class="cx-phrase-word" onclick="ArabicAudio.play({key:null,text:'${w[0]}'})"><span class="cx-pw-ar">${w[0]}</span><span class="cx-pw-tr">${w[1]}</span></button>`).join('')}
            </div>
            <div class="cx-phrase-trans">«${this.X(ph.trans)}»</div>
          </div>`).join('')}
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>
      </div>`;
  },

  /** Reproduce el audio de una frase/aleya por id (recitador real si existe, si no TTS). */
  playPhraseAudio(id) {
    const V = ArabicItems.V();
    const ph = V.PHRASES.find(p => p.id === id);
    if (ph) ArabicAudio.playPhrase(ph);
  },

  // ============ RAÍCES ============
  render_roots(lesson) {
    const V = ArabicItems.V();
    return `
      <div class="lesson-card cx-roots">
        ${Mascot.render('thinking', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${this.X({ es: 'La raíz: el corazón de la palabra', ar: 'الجذر: قلب الكلمة', en: 'The root: the heart of the word' })}</h2>
        ${V.ROOTS.map(r => `
          <div class="cx-root-card">
            <div class="cx-root-head" dir="rtl">${r.root} <small>(${r.tr})</small></div>
            <div class="cx-root-meaning">${this.X(r.meaning)}</div>
            <div class="cx-root-words">
              ${r.words.map(w => `<button class="cx-root-word" onclick="ArabicAudio.play({key:null,text:'${w.ar}'})"><span dir="rtl">${w.ar}</span><small>${this.X({ es: w.es, en: w.en, ar: w.g || w.es })}</small></button>`).join('')}
            </div>
          </div>`).join('')}
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>
      </div>`;
  },

  // ============ MAPA DE RUTA (vista previa dentro de "bienvenida") ============
  render_journey_map(lesson) {
    const course = this.state.course;
    if (!course.units) return this._skipCard();
    return `
      <div class="lesson-card cx-journey-preview">
        ${Mascot.renderWithSpeech('celebrate', t('cxJourneyText') || '¡Este es tu camino! Cada estación te acerca más.', 'medium')}
        <div class="cx-jp-units">
          ${course.units.map(u => `
            <div class="cx-jp-unit">
              <div class="cx-jp-unit-title">${u.icon || ''} ${this.X(u.title)}</div>
              <div class="cx-jp-stations">
                ${u.stations.map(sid => {
                  const s = course.stations.find(x => x.id === sid.id || x === sid) || sid;
                  return `<span class="cx-jp-node">${s.icon || ''}</span>`;
                }).join('<span class="cx-jp-line"></span>')}
              </div>
            </div>`).join('')}
        </div>
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('cxContinue') || '¡Vamos!'} →</button>
      </div>`;
  },

  // ============ ORDENA LAS PALABRAS (word_order) ============
  render_word_order(lesson) {
    const V = ArabicItems.V();
    const ph = V.PHRASES.find(p => p.id === lesson.phrase);
    if (!ph) return this._skipCard();
    const ids = ph.words.map((w, i) => i);
    this._wo = { words: ph.words, pool: ArabicItems.shuffle(ids), placed: [], ph };
    return `
      <div class="lesson-card cx-word-order">
        ${Mascot.render('thinking', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${t('cxWordOrder') || 'Ordena las palabras'}</h2>
        <div class="cx-wo-answer" id="wo-answer" dir="rtl"></div>
        <div class="cx-wo-tray" id="wo-tray" dir="rtl"></div>
        <div id="wo-feedback"></div>
        <div class="cx-wo-actions">
          <button class="btn-ghost" onclick="CoursesPage.woUndo()"><i class="fas fa-rotate-left"></i> ${t('cxUndo') || 'Deshacer'}</button>
          <button class="btn-primary" onclick="CoursesPage.woCheck()">${t('checkAnswer') || 'Verificar'} <i class="fas fa-check"></i></button>
        </div>
      </div>`;
  },

  _woRefresh() {
    const s = this._wo; if (!s) return;
    const tray = document.getElementById('wo-tray');
    const ans = document.getElementById('wo-answer');
    if (tray) tray.innerHTML = s.pool.map(i => `<button class="cx-wo-tile" onclick="CoursesPage.woTap(${i})">${s.words[i][0]}</button>`).join('');
    if (ans) ans.innerHTML = s.placed.length ? s.placed.map(i => `<span class="cx-wo-tile placed">${s.words[i][0]}</span>`).join('') : `<span class="cx-wo-hint">${t('cxWordOrderHint') || 'Toca las palabras en el orden correcto'}</span>`;
  },
  woTap(i) {
    const s = this._wo; if (!s) return;
    const idx = s.pool.indexOf(i); if (idx === -1) return;
    s.pool.splice(idx, 1); s.placed.push(i);
    this._woRefresh();
  },
  woUndo() {
    const s = this._wo; if (!s || !s.placed.length) return;
    s.pool.push(s.placed.pop());
    this._woRefresh();
  },
  woCheck() {
    const s = this._wo; if (!s) return;
    const ok = s.placed.length === s.words.length && s.placed.every((v, idx) => v === idx);
    const box = document.getElementById('wo-feedback'); if (!box) return;
    if (ok) {
      box.innerHTML = `<div class="quiz-feedback correct"><div class="qf-row">${Mascot.render('celebrate', 'small')}<div class="qf-text"><div class="qf-status"><i class="fas fa-circle-check"></i> ${t('correct') || '¡Correcto!'}</div><div class="qf-explanation">«${this.X(s.ph.trans)}»</div></div></div>
        <button class="btn-primary" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button></div>`;
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      box.innerHTML = `<div class="quiz-feedback wrong"><div class="qf-row">${Mascot.render('shy', 'small')}<div class="qf-text"><div class="qf-status"><i class="fas fa-lightbulb"></i> ${t('tryAgain') || 'Inténtalo de nuevo'}</div></div></div></div>`;
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  },

  // ============ CONSTRUYE LA PALABRA (word_builder) ============
  render_word_builder(lesson) {
    const tiles = ArabicItems.shuffle(
      lesson.parts.map((p, i) => ({ key: 'p' + i, val: p })).concat((lesson.extra || []).map((p, i) => ({ key: 'e' + i, val: p })))
    );
    this._wb = { pool: tiles.map(x => x.key), placed: [], byKey: {}, lesson };
    tiles.forEach(x => { this._wb.byKey[x.key] = x.val; });
    return `
      <div class="lesson-card cx-word-builder">
        ${Mascot.render('thinking', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${t('cxBuildWord') || 'Construye la palabra'}</h2>
        ${lesson.meaning ? `<div class="cx-wb-hint">${this.X(lesson.meaning)} ${lesson.emoji || ''}</div>` : ''}
        <div class="cx-wo-answer" id="wb-answer" dir="rtl"></div>
        <div class="cx-wo-tray" id="wb-tray" dir="rtl"></div>
        <div id="wb-feedback"></div>
        <div class="cx-wo-actions">
          <button class="btn-ghost" onclick="CoursesPage.wbUndo()"><i class="fas fa-rotate-left"></i> ${t('cxUndo') || 'Deshacer'}</button>
          <button class="btn-primary" onclick="CoursesPage.wbCheck()">${t('checkAnswer') || 'Verificar'} <i class="fas fa-check"></i></button>
        </div>
      </div>`;
  },

  _wbRefresh() {
    const s = this._wb; if (!s) return;
    const tray = document.getElementById('wb-tray');
    const ans = document.getElementById('wb-answer');
    if (tray) tray.innerHTML = s.pool.map(k => `<button class="cx-wo-tile" onclick="CoursesPage.wbTap('${k}')">${s.byKey[k]}</button>`).join('');
    if (ans) ans.innerHTML = s.placed.length ? s.placed.map(k => `<span class="cx-wo-tile placed">${s.byKey[k]}</span>`).join('') : `<span class="cx-wo-hint">${t('cxBuildHint') || 'Toca las piezas en orden'}</span>`;
  },
  wbTap(k) {
    const s = this._wb; if (!s) return;
    const i = s.pool.indexOf(k); if (i === -1) return;
    s.pool.splice(i, 1); s.placed.push(k);
    this._wbRefresh();
  },
  wbUndo() {
    const s = this._wb; if (!s || !s.placed.length) return;
    s.pool.push(s.placed.pop());
    this._wbRefresh();
  },
  wbCheck() {
    const s = this._wb; if (!s) return;
    const got = s.placed.map(k => s.byKey[k]).join('');
    const want = s.lesson.parts.join('');
    const box = document.getElementById('wb-feedback'); if (!box) return;
    if (got === want) {
      const say = (s.lesson.vocal || s.lesson.word || '').replace(/'/g, '');
      box.innerHTML = `<div class="quiz-feedback correct"><div class="qf-row">${Mascot.render('celebrate', 'small')}
          <div class="qf-text"><div class="qf-status" dir="rtl"><i class="fas fa-circle-check"></i> ${s.lesson.word}</div><div class="qf-explanation">${s.lesson.tr || ''} — ${this.X(s.lesson.meaning)}</div></div>
          <button class="cx-audio-btn cx-audio-sm" onclick="ArabicAudio.play({key:null,text:'${say}'})"><i class="fas fa-volume-high"></i></button>
        </div>
        <button class="btn-primary" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button></div>`;
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      box.innerHTML = `<div class="quiz-feedback wrong"><div class="qf-row">${Mascot.render('shy', 'small')}<div class="qf-text"><div class="qf-status">${t('tryAgain') || 'Inténtalo de nuevo'}</div></div></div></div>`;
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  },

  // ============ PRACTICAR LA ESCRITURA (write_trace) ============
  // Lienzo con el trazo de la letra en puntos para calcar encima, selector de
  // letra y de posición (aislada/inicial/medial/final), y botón de borrar.
  // v66: vive solo en la unidad de escritura («وصل الحروف»), no en las
  // estaciones de letras.
  render_write_trace(lesson) {
    const D = ArabicItems.D();
    const letters = D.LETTERS.filter(l => l.g === lesson.group);
    this._wt = { letters, letterIdx: 0, pos: 'iso' };
    return `
      <div class="lesson-card cx-write-trace">
        ${Mascot.render('encourage', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${t('cxWriteTitle') || 'Practica la escritura'}</h2>
        <div class="cx-wt-hint">${t('cxWritePick') || 'Elige una letra'}</div>
        <div class="cx-wt-letters" id="wt-letters"></div>
        <div class="cx-wt-forms" id="wt-forms"></div>
        <div class="cx-wt-board-wrap">
          <div class="cx-wt-arrow"><i class="fas fa-arrow-left-long"></i> ${t('cxWriteDir') || 'Sigue el trazo punteado, de derecha a izquierda'}</div>
          <canvas id="wt-canvas" class="cx-wt-canvas" width="320" height="320"></canvas>
        </div>
        <div class="cx-wo-actions">
          <button class="btn-ghost" onclick="CoursesPage.wtClear()"><i class="fas fa-eraser"></i> ${t('cxWriteClear') || 'Borrar'}</button>
        </div>
        <button class="btn-primary lesson-continue-btn" onclick="CoursesPage.advanceContent()">${t('continue') || 'Continuar'} →</button>
      </div>`;
  },

  _wtSetup() {
    if (!this._wt) return;
    this._wtRenderPickers();
    this._wtDrawGuide();
    this._wtBindCanvas();
  },

  _wtRenderPickers() {
    const s = this._wt; if (!s) return;
    const lettersEl = document.getElementById('wt-letters');
    if (lettersEl) {
      lettersEl.innerHTML = s.letters.map((l, i) =>
        `<button class="cx-wt-letter-btn ${i === s.letterIdx ? 'active' : ''}" onclick="CoursesPage.wtPickLetter(${i})">${l.ch}</button>`).join('');
    }
    const l = s.letters[s.letterIdx];
    const positions = l.conn ? ['iso', 'ini', 'med', 'fin'] : ['iso', 'fin'];
    if (positions.indexOf(s.pos) === -1) s.pos = positions[0];
    const formsEl = document.getElementById('wt-forms');
    if (formsEl) {
      formsEl.innerHTML = positions.map(p =>
        `<button class="cx-wt-form-btn ${p === s.pos ? 'active' : ''}" onclick="CoursesPage.wtPickForm('${p}')">${ArabicItems.posLabel(p)}</button>`).join('');
    }
  },

  wtPickLetter(i) {
    const s = this._wt; if (!s) return;
    s.letterIdx = i;
    this._wtRenderPickers();
    this._wtDrawGuide();
  },
  wtPickForm(p) {
    const s = this._wt; if (!s) return;
    s.pos = p;
    this._wtRenderPickers();
    this._wtDrawGuide();
  },
  wtClear() {
    const canvas = document.getElementById('wt-canvas');
    if (!canvas || !this._wtGuideData) return;
    canvas.getContext('2d').putImageData(this._wtGuideData, 0, 0);
  },

  // Dibuja la letra elegida como un trazo punteado (guía) para calcar encima.
  _wtDrawGuide() {
    const canvas = document.getElementById('wt-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = this._wt;
    const l = s.letters[s.letterIdx];
    const glyph = l.forms[s.pos];
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.getAttribute('data-theme') !== 'light');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(canvas.width * 0.55)}px 'Amiri', serif`;
    ctx.strokeStyle = isDark ? 'rgba(230,230,230,0.5)' : 'rgba(120,120,120,0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 7]);
    ctx.strokeText(glyph, canvas.width / 2, canvas.height / 2 + canvas.height * 0.04);
    // pequeño punto de inicio a la derecha, como referencia general
    ctx.setLineDash([]);
    ctx.fillStyle = 'var(--gold-soft, #D4A537)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.86, canvas.height * 0.32, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this._wtGuideData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  },

  // Dibuja libremente encima de la guía (ratón o dedo).
  _wtBindCanvas() {
    const canvas = document.getElementById('wt-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ink = (this.state && this.state.course && this.state.course.color) || '#174430';
    let drawing = false, last = null;
    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
    };
    canvas.style.touchAction = 'none';
    canvas.onpointerdown = (e) => {
      drawing = true; last = getPos(e);
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* no-op */ }
    };
    canvas.onpointermove = (e) => {
      if (!drawing) return;
      const p = getPos(e);
      ctx.strokeStyle = ink; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
    };
    const stop = () => { drawing = false; last = null; };
    canvas.onpointerup = stop; canvas.onpointercancel = stop; canvas.onpointerleave = stop;
  },


  render_match_pairs(lesson) {
    let pairs = [];
    if (lesson.pairs) {
      pairs = lesson.pairs.map(p => ({ l: p.l, r: this.X(p.r), rtl: p.rtl !== false }));
    } else if (lesson.gen === 'forms') {
      (lesson.letters || []).forEach(id => {
        const fp = ArabicItems.formPairs(id);
        if (fp.length) pairs.push(ArabicItems.pick(fp, 1)[0]);
      });
    } else if (lesson.gen === 'words') {
      pairs = ArabicItems.wordPairs((lesson.words || []).map(w => 'word:' + w), lesson.n || 5);
    }
    pairs = pairs.slice(0, 8).map((p, i) => ({ i, l: p.l, r: this.X(p.r), rtl: p.rtl !== false }));
    this._mp = { pairs, matched: new Set(), selL: null, selR: null, total: pairs.length };
    const leftOrder = ArabicItems.shuffle(pairs.map(p => p.i));
    const rightOrder = ArabicItems.shuffle(pairs.map(p => p.i));
    return `
      <div class="lesson-card cx-match-pairs">
        ${Mascot.render('encourage', 'medium', 'lesson-mascot')}
        <h2 class="lesson-card-title">${this.X(lesson.title) || (t('cxMatchTitle') || 'Une cada pareja')}</h2>
        <div class="cx-mp-board">
          <div class="cx-mp-col">${leftOrder.map(i => `<button class="cx-mp-btn mp-l" data-pair="${i}" dir="${pairs[i].rtl ? 'rtl' : 'auto'}" onclick="CoursesPage.matchPick('l', ${i}, this)">${pairs[i].l}</button>`).join('')}</div>
          <div class="cx-mp-col">${rightOrder.map(i => `<button class="cx-mp-btn mp-r" data-pair="${i}" dir="auto" onclick="CoursesPage.matchPick('r', ${i}, this)">${pairs[i].r}</button>`).join('')}</div>
        </div>
      </div>`;
  },

  matchPick(side, i, el) {
    const s = this._mp; if (!s || s.matched.has(i)) return;
    el.classList.add('picked');
    if (side === 'l') {
      if (s.selL != null && s.selL !== i) document.querySelector(`.mp-l[data-pair="${s.selL}"]`)?.classList.remove('picked');
      s.selL = i;
    } else {
      if (s.selR != null && s.selR !== i) document.querySelector(`.mp-r[data-pair="${s.selR}"]`)?.classList.remove('picked');
      s.selR = i;
    }
    if (s.selL != null && s.selR != null) {
      const ok = s.selL === s.selR;
      const li = s.selL, ri = s.selR;
      if (ok) {
        s.matched.add(li);
        document.querySelectorAll(`[data-pair="${li}"]`).forEach(b => { b.classList.add('matched'); b.classList.remove('picked'); b.disabled = true; });
        if (navigator.vibrate) navigator.vibrate(50);
        s.selL = null; s.selR = null;
        if (s.matched.size === s.total) setTimeout(() => { showToast('✅ ' + (t('cxMatchDone') || '¡Todo emparejado!'), 1400); this.advanceContent(); }, 450);
      } else {
        if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
        document.querySelector(`.mp-l[data-pair="${li}"]`)?.classList.add('mp-wrong');
        document.querySelector(`.mp-r[data-pair="${ri}"]`)?.classList.add('mp-wrong');
        setTimeout(() => {
          document.querySelectorAll('.picked, .mp-wrong').forEach(b => b.classList.remove('picked', 'mp-wrong'));
        }, 500);
        s.selL = null; s.selR = null;
      }
    }
  },
});

// El motor genérico necesita saber qué hacer tras montar estos tipos en el DOM.
CoursesPage._afterRenderLesson = function (lesson) {
  if (lesson.type === 'drag_drop') setTimeout(() => this.initDragDrop(), 100);
  if (lesson.type === 'word_order') this._woRefresh();
  if (lesson.type === 'word_builder') this._wbRefresh();
  if (lesson.type === 'write_trace') this._wtSetup();
};
