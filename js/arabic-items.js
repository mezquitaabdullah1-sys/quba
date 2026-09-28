/**
 * 🧩 ArabicItems — سجلّ عناصر التعلّم ومولّدات الأسئلة
 * ─────────────────────────────────────────────────────
 * معرّفات العناصر:
 *   letter:<id>   حرف            (مثال letter:ba)
 *   word:<slug>   كلمة           (مثال word:masjid)
 *   mark:<id>     حركة/تنوين     (مثال mark:fatha)
 *
 * يُستعمل من: النقاط الفحص (checkpoint)، اختبار «تخطَّ المحطة»، الامتحان النهائي،
 * والمراجعة اليومية (CoursesSRS). كل السؤال يُولَّد بلغة الواجهة الحالية.
 *
 * صيغة السؤال (mcq) الموحّدة:
 *   { kind:'mcq', qtype, prompt, glyph?, say?, emoji?, img?, options:[{t, rtl}], correct, feedback, ids:[...] }
 */
const ArabicItems = {
  // ── لغة الواجهة ───────────────────────────────────────────────
  lang() {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    return l === 'ar' ? 'ar' : (l === 'en' ? 'en' : 'es');
  },
  loc(o) {
    if (o == null) return '';
    if (typeof o !== 'object') return o;
    return o[this.lang()] || o.es || o.en || '';
  },
  tt(key, vars) {
    let s = (typeof t === 'function' ? t(key) : key) || key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  },

  // ── مساعدات عامة ──────────────────────────────────────────────
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  pick(arr, n) { return this.shuffle(arr).slice(0, n); },
  parse(id) {
    const i = String(id).indexOf(':');
    return i < 0 ? { kind: '', key: id } : { kind: id.slice(0, i), key: id.slice(i + 1) };
  },

  // ── الوصول للبيانات ───────────────────────────────────────────
  D() { return (typeof ARABIC_DATA !== 'undefined') ? ARABIC_DATA : null; },
  V() { return (typeof ARABIC_VOCAB !== 'undefined') ? ARABIC_VOCAB : null; },

  get(id) {
    const { kind, key } = this.parse(id);
    if (kind === 'letter') { const l = this.D() && this.D().byId[key]; return l ? { kind, id, data: l } : null; }
    if (kind === 'word') { const w = this.V() && this.V().byId[key]; return w ? { kind, id, data: w } : null; }
    if (kind === 'mark') {
      const m = this.D() && this.D().MARKS.find(x => x.id === key);
      return m ? { kind, id, data: m } : null;
    }
    return null;
  },
  letters(group) {
    const D = this.D(); if (!D) return [];
    return D.LETTERS.filter(l => !group || l.g === group);
  },
  lettersUpTo(g) { return this.letters().filter(l => l.g <= g); },
  ids(kind) {
    if (kind === 'letter') return this.letters().map(l => 'letter:' + l.id);
    if (kind === 'word') return this.V() ? this.V().WORDS.map(w => 'word:' + w.id) : [];
    return [];
  },

  // ما يُنطق ويُعرض
  glyph(id) {
    const it = this.get(id); if (!it) return '';
    if (it.kind === 'letter') return it.data.ch;
    if (it.kind === 'word') return it.data.ar;
    if (it.kind === 'mark') return it.data.glyph;
    return '';
  },
  say(id) {
    const it = this.get(id); if (!it) return '';
    if (it.kind === 'letter') return it.data.say;
    if (it.kind === 'word') return it.data.ar;
    if (it.kind === 'mark') return 'ب' + it.data.mark;
    return '';
  },
  // مفتاح مقطع (حرف + حركة قصيرة) للصوت المسجّل
  sylKey(letter, markId) {
    return ['fatha', 'kasra', 'damma'].indexOf(markId) >= 0 ? `syl_${letter.id}_${markId}` : null;
  },
  audioKey(id) {
    const it = this.get(id); if (!it) return null;
    if (it.kind === 'letter') return 'letter_' + it.data.id;
    if (it.kind === 'word') return 'word_' + it.data.s;
    return null;
  },
  meaning(w) {
    const l = this.lang();
    return l === 'ar' ? (w.g || w.en) : (w[l] || w.en);
  },
  label(id) {
    const it = this.get(id); if (!it) return id;
    if (it.kind === 'letter') return it.data.tr;
    if (it.kind === 'word') return this.meaning(it.data);
    if (it.kind === 'mark') return this.loc(it.data.name);
    return id;
  },

  // ── صور الكلمات (مع رجوع للإيموجي) ───────────────────────────
  hasImage(slug) {
    return typeof ARABIC_MEDIA !== 'undefined' && ARABIC_MEDIA.images && ARABIC_MEDIA.images.indexOf(slug) >= 0;
  },
  pic(emoji, slug, alt, cls) {
    const c = cls ? ' ' + cls : '';
    const img = (slug && this.hasImage(slug))
      ? `<img src="assets/arabic/words/${escapeAttr(slug)}.webp" alt="${escapeAttr(alt || '')}" loading="lazy" width="800" height="800" onerror="this.remove()">`
      : '';
    return `<span class="cx-pic${c}" role="img" aria-label="${escapeAttr(alt || '')}"><span class="cx-pic-emoji" aria-hidden="true">${emoji || ''}</span>${img}</span>`;
  },

  // ── مواضع الشكل ───────────────────────────────────────────────
  posLabel(pos) {
    return this.tt({ iso: 'cxPosIso', ini: 'cxPosIni', med: 'cxPosMed', fin: 'cxPosFin' }[pos]);
  },
  dotsText(d) {
    if (!d || d.n === 0) return this.tt('cxDots0');
    return this.tt('cxDots' + d.n + (d.pos === 'below' ? 'b' : 'a'));
  },

  // ── مولّدات الأسئلة ───────────────────────────────────────────
  // اختيار مشتّتات: الأقرب شكلاً أولاً (نفس العائلة)، ثم عشوائي من المجموعة
  _letterDistractors(letter, pool, n) {
    const D = this.D();
    let cand = pool.filter(l => l.id !== letter.id);
    if (cand.length < n) cand = D.LETTERS.filter(l => l.id !== letter.id);
    const near = cand.filter(l => l.fam === letter.fam && letter.fam !== 'solo');
    const rest = this.shuffle(cand.filter(l => near.indexOf(l) < 0));
    return this.shuffle(near).concat(rest).slice(0, n);
  },

  _finish(q) {
    // خلط الخيارات مع الحفاظ على الإجابة الصحيحة
    const correctOpt = q.options[q.correct];
    const shuffled = this.shuffle(q.options);
    q.options = shuffled;
    q.correct = shuffled.indexOf(correctOpt);
    return q;
  },

  qSoundToLetter(l, pool) {
    const ds = this._letterDistractors(l, pool, 3);
    return this._finish({
      kind: 'mcq', qtype: 'sound', prompt: this.tt('cxQSound'), say: 'letter:' + l.id, autoplay: true,
      options: [l].concat(ds).map(x => ({ t: x.ch, rtl: true, big: true })), correct: 0,
      feedback: `${l.ch} = ${l.tr} (${l.nm}) · ${this.loc(l.sound)}`, ids: ['letter:' + l.id],
    });
  },
  qShapeToName(l, pool) {
    const ds = this._letterDistractors(l, pool, 3);
    return this._finish({
      kind: 'mcq', qtype: 'shape', prompt: this.tt('cxQShapeName'), glyph: l.ch, say: 'letter:' + l.id,
      options: [l].concat(ds).map(x => ({ t: x.tr + ' · ' + x.nm, rtl: false })), correct: 0,
      feedback: `${l.ch} = ${l.tr} (${l.nm}) · ${this.loc(l.sound)}`, ids: ['letter:' + l.id],
    });
  },
  qNameToShape(l, pool) {
    const ds = this._letterDistractors(l, pool, 3);
    return this._finish({
      kind: 'mcq', qtype: 'shape', prompt: this.tt('cxQNameShape', { n: l.tr + ' (' + l.nm + ')' }), say: 'letter:' + l.id,
      options: [l].concat(ds).map(x => ({ t: x.ch, rtl: true, big: true })), correct: 0,
      feedback: `${l.ch} = ${l.tr} (${l.nm})`, ids: ['letter:' + l.id],
    });
  },
  qForm(l) {
    const positions = l.conn ? ['ini', 'med', 'fin'] : ['fin'];
    const pos = this.pick(positions, 1)[0];
    const opts = l.conn ? ['iso', 'ini', 'med', 'fin'] : ['iso', 'fin'];
    // مشتّتات إضافية: أشكال حرف آخر لتصل الخيارات إلى 4
    const others = this.D().LETTERS.filter(x => x.id !== l.id && x.conn === l.conn);
    const extra = this.pick(others, 2).map(x => x.forms[pos]);
    const options = opts.filter(p => p !== pos).map(p => l.forms[p]).concat(extra).filter((v, i, a) => a.indexOf(v) === i && v !== l.forms[pos]).slice(0, 3);
    return this._finish({
      kind: 'mcq', qtype: 'form',
      prompt: this.tt('cxQForm', { pos: this.posLabel(pos).toLowerCase(), ch: l.ch }), glyph: l.ch,
      options: [{ t: l.forms[pos], rtl: true, big: true }].concat(options.map(v => ({ t: v, rtl: true, big: true }))), correct: 0,
      feedback: `${l.ch} → ${this.posLabel(pos)}: ${l.forms[pos]}`, ids: ['letter:' + l.id],
    });
  },
  qDots(l, pool) {
    // "أيّ حرف له نقطتان فوقه؟" — الخيارات من الحروف المتشابهة
    const D = this.D();
    let sibs = D.LETTERS.filter(x => x.fam === l.fam && x.id !== l.id && l.fam !== 'solo');
    if (sibs.length < 1) return this.qShapeToName(l, pool);
    const same = D.LETTERS.filter(x => x.id !== l.id && x.dots.n === l.dots.n && x.dots.pos === l.dots.pos);
    const wrong = sibs.filter(x => !(x.dots.n === l.dots.n && x.dots.pos === l.dots.pos));
    const ds = this.shuffle(wrong).concat(this.shuffle(D.LETTERS.filter(x => x.id !== l.id && !(x.dots.n === l.dots.n && x.dots.pos === l.dots.pos) && wrong.indexOf(x) < 0))).slice(0, 3);
    if (same.length && ds.length < 3) ds.push(...same.slice(0, 3 - ds.length));
    return this._finish({
      kind: 'mcq', qtype: 'dots', prompt: this.tt('cxQDots', { d: this.dotsText(l.dots) }),
      options: [l].concat(ds.slice(0, 3)).map(x => ({ t: x.ch, rtl: true, big: true })), correct: 0,
      feedback: `${l.ch} (${l.tr}): ${this.dotsText(l.dots)}`, ids: ['letter:' + l.id],
    });
  },
  qNonConnector() {
    const D = this.D();
    const non = this.pick(D.LETTERS.filter(l => !l.conn), 1)[0];
    const yes = this.pick(D.LETTERS.filter(l => l.conn), 3);
    return this._finish({
      kind: 'mcq', qtype: 'form', prompt: this.tt('cxQNonConn'),
      options: [non].concat(yes).map(x => ({ t: x.ch, rtl: true, big: true })), correct: 0,
      feedback: this.tt('cxFbNonConn'), ids: ['letter:' + non.id],
    });
  },

  _consonants(pool) {
    const skip = { alif: 1, waw: 1, ya: 1 };
    let c = pool.filter(l => !skip[l.id]);
    if (c.length < 3) c = this.D().LETTERS.filter(l => !skip[l.id]);
    return c;
  },
  qMark(markId, pool) {
    const D = this.D();
    const m = D.MARKS.find(x => x.id === markId); if (!m) return null;
    const l = this.pick(this._consonants(pool || D.LETTERS), 1)[0];
    const c = l.c;
    let correct, wrong, glyph;
    const V = { fatha: 'a', kasra: 'i', damma: 'u' };
    if (V[markId]) {
      glyph = l.ch + m.mark; correct = c + V[markId];
      wrong = Object.keys(V).filter(k => k !== markId).map(k => c + V[k]).concat([c]);
    } else if (markId === 'sukun') {
      glyph = l.ch + m.mark; correct = c;
      wrong = [c + 'a', c + 'i', c + 'u'];
    } else if (markId === 'shadda') {
      glyph = l.ch + '\u064E' + m.mark; correct = c + '-' + c + 'a';
      wrong = [c + 'a', c + 'i', c];
    } else { // tanween
      glyph = l.ch + m.mark; correct = c + m.v;
      wrong = ['an', 'in', 'un'].filter(v => v !== m.v).map(v => c + v).concat([c + 'a']);
    }
    const seen = {}; seen[correct] = 1;
    const opts = [correct];
    wrong.forEach(w => { if (!seen[w] && opts.length < 4) { seen[w] = 1; opts.push(w); } });
    return this._finish({
      kind: 'mcq', qtype: 'mark', prompt: this.tt('cxQMark'), glyph, say: { key: this.sylKey(l, markId), text: glyph }, autoplay: false,
      options: opts.map(o => ({ t: o, rtl: false })), correct: 0,
      feedback: `${glyph} = ${correct} · ${this.loc(m.sound)}`, ids: ['mark:' + markId],
    });
  },
  qMarkAudio(markId, pool) {
    // يسمع مقطعاً ويختار كتابته
    const D = this.D();
    const V = { fatha: 'a', kasra: 'i', damma: 'u' };
    if (!V[markId]) return this.qMark(markId, pool);
    const m = D.MARKS.find(x => x.id === markId);
    const l = this.pick(this._consonants(pool || D.LETTERS), 1)[0];
    const others = Object.keys(V).filter(k => k !== markId).map(k => D.MARKS.find(x => x.id === k));
    const opts = [m].concat(others).map(x => ({ t: l.ch + x.mark, rtl: true, big: true }));
    return this._finish({
      kind: 'mcq', qtype: 'audio', prompt: this.tt('cxQMarkAudio'), say: { key: this.sylKey(l, markId), text: l.ch + m.mark }, autoplay: true,
      options: opts.concat([{ t: l.ch + '\u0652', rtl: true, big: true }]).slice(0, 4), correct: 0,
      feedback: `${l.ch + m.mark} = ${l.c + V[markId]}`, ids: ['mark:' + markId],
    });
  },

  _wordDistractors(w, n, needEmoji) {
    const V = this.V();
    let cand = V.WORDS.filter(x => x.id !== w.id && x.topic === w.topic);
    if (needEmoji) cand = cand.filter(x => x.e !== w.e);
    if (cand.length < n) cand = V.WORDS.filter(x => x.id !== w.id && (!needEmoji || x.e !== w.e));
    return this.pick(cand, n);
  },
  qWordMeaning(w) {
    const ds = this._wordDistractors(w, 3);
    return this._finish({
      kind: 'mcq', qtype: 'word', prompt: this.tt('cxQWord'), glyph: w.ar, say: 'word:' + w.id,
      options: [w].concat(ds).map(x => ({ t: this.meaning(x), rtl: this.lang() === 'ar' })), correct: 0,
      feedback: `${w.ar} (${w.tr}) = ${this.meaning(w)}`, ids: ['word:' + w.id],
    });
  },
  qMeaningWord(w) {
    const ds = this._wordDistractors(w, 3);
    return this._finish({
      kind: 'mcq', qtype: 'word', prompt: this.tt('cxQMeaning', { m: this.meaning(w) }), emoji: w.e, img: w.s,
      options: [w].concat(ds).map(x => ({ t: x.ar, rtl: true, big: true })), correct: 0,
      feedback: `${w.ar} (${w.tr}) = ${this.meaning(w)}`, ids: ['word:' + w.id],
    });
  },
  qAudioWord(w) {
    const ds = this._wordDistractors(w, 3);
    // v66: se simplifica añadiendo el significado junto al nombre — reconocer
    // por significado (además del sonido) es más fácil para quien aún no lee
    // el árabe con soltura.
    return this._finish({
      kind: 'mcq', qtype: 'audio', prompt: this.tt('cxQAudioWord'), say: 'word:' + w.id, autoplay: true,
      options: [w].concat(ds).map(x => ({ t: `${x.ar} — ${this.meaning(x)}`, rtl: true })), correct: 0,
      feedback: `${w.ar} (${w.tr}) = ${this.meaning(w)}`, ids: ['word:' + w.id],
    });
  },
  qImageWord(w) {
    const ds = this._wordDistractors(w, 3, true);
    return this._finish({
      kind: 'mcq', qtype: 'image', prompt: this.tt('cxQImage'), emoji: w.e, img: w.s, imgAlt: this.meaning(w),
      options: [w].concat(ds).map(x => ({ t: x.ar, rtl: true, big: true })), correct: 0,
      feedback: `${w.ar} (${w.tr}) = ${this.meaning(w)}`, ids: ['word:' + w.id],
    });
  },

  // سؤال واحد لعنصر (نوع عشوائي مناسب)
  mcq(id, opts) {
    opts = opts || {};
    const it = this.get(id); if (!it) return null;
    const D = this.D();
    if (it.kind === 'letter') {
      const l = it.data;
      const pool = opts.pool || D.LETTERS.filter(x => x.g <= l.g);
      const kinds = ['sound', 'shape', 'name', 'form', 'dots'];
      const k = opts.type || this.pick(kinds.filter(x => x !== opts.avoid), 1)[0];
      if (k === 'sound') return this.qSoundToLetter(l, pool);
      if (k === 'shape') return this.qShapeToName(l, pool);
      if (k === 'name') return this.qNameToShape(l, pool);
      if (k === 'form') return this.qForm(l);
      return this.qDots(l, pool);
    }
    if (it.kind === 'word') {
      const w = it.data;
      // v66: nunca preguntar «reconoce por la imagen» de una palabra abstracta
      // sin representación visual real (Allah, adhán, takbir, eid…) — w.pic
      // marca esto en data/courses/arabic_vocab.js.
      let kinds = w.pic === false ? ['word', 'meaning', 'audio'] : ['word', 'meaning', 'audio', 'image'];
      let k = opts.type || this.pick(kinds.filter(x => x !== opts.avoid), 1)[0];
      if (k === 'image' && w.pic === false) k = 'meaning';
      if (k === 'word') return this.qWordMeaning(w);
      if (k === 'meaning') return this.qMeaningWord(w);
      if (k === 'audio') return this.qAudioWord(w);
      return this.qImageWord(w);
    }
    if (it.kind === 'mark') {
      const k = opts.type || (Math.random() < 0.4 ? 'audio' : 'read');
      return k === 'audio' ? this.qMarkAudio(it.data.id, opts.pool) : this.qMark(it.data.id, opts.pool);
    }
    return null;
  },

  // جلسة أسئلة من قائمة عناصر: سؤال لكل عنصر (مع تكرار بأنواع مختلفة إن قلّت)
  session(ids, n, opts) {
    ids = (ids || []).filter(id => this.get(id));
    if (!ids.length) return [];
    const out = [];
    const order = this.shuffle(ids);
    let i = 0, lastType = null;
    while (out.length < n && i < n * 3) {
      const id = order[i % order.length];
      const q = this.mcq(id, Object.assign({}, opts, { avoid: lastType }));
      if (q) { out.push(q); lastType = q.qtype; }
      i++;
    }
    return out;
  },

  // بطاقات مراجعة (flashcards) من عناصر
  cards(ids) {
    return (ids || []).map(id => {
      const it = this.get(id); if (!it) return null;
      if (it.kind === 'letter') {
        const l = it.data;
        return { id, front: l.ch, back: `${l.tr} (${l.nm}) — ${l.c}`, rtl: true };
      }
      if (it.kind === 'word') {
        const w = it.data;
        return { id, front: w.ar, back: `${w.tr} — ${this.meaning(w)}`, rtl: true };
      }
      return { id, front: it.data.glyph, back: this.loc(it.data.name) + ' — ' + it.data.v, rtl: true };
    }).filter(Boolean);
  },

  // أزواج «طابق الشكل بموضعه» لحرف يتّصل
  formPairs(letterId) {
    const l = this.D().byId[letterId]; if (!l) return [];
    const positions = l.conn ? ['iso', 'ini', 'med', 'fin'] : ['iso', 'fin'];
    return positions.map(p => ({ l: l.forms[p], r: this.posLabel(p), rtl: true }));
  },

  // أزواج كلمة ↔ معناها
  wordPairs(wordIds, n) {
    const ws = this.pick(wordIds.map(id => this.get(id)).filter(Boolean), n || 5);
    return ws.map(it => ({ l: it.data.ar, r: this.meaning(it.data), rtl: true, id: it.id }));
  },

  // ما يُضاف إلى المراجعة بعد إتمام درس
  learnsFor(lesson) {
    if (!lesson) return [];
    if (lesson.learns) return lesson.learns;
    if (lesson.type === 'arabic_letter' && lesson.letterId) return ['letter:' + lesson.letterId];
    if (lesson.type === 'vocab' && lesson.words) return lesson.words.map(w => 'word:' + w);
    return [];
  },

  // ── الامتحان النهائي: n سؤالاً متنوّعاً (صوتي، صور، أشكال، حركات، كلمات) ──
  // مواصفة الخلطة: كل عنصر [نوع، عدد]
  EXAM_BLUEPRINT: [
    ['sound', 3], ['shape', 3], ['form', 2], ['nonconn', 1], ['dots', 1],
    ['mark', 2], ['markaudio', 1], ['shadda', 1], ['tanween', 1],
    ['wordaudio', 2], ['wordimage', 2], ['wordmeaning', 1],
  ],
  exam(n) {
    const D = this.D(), V = this.V();
    n = n || 20;
    const used = {};
    const fresh = (id) => { if (used[id]) return false; used[id] = 1; return true; };
    const lettersAll = D.LETTERS;
    const dotted = lettersAll.filter(l => l.fam !== 'solo');
    const joiners = lettersAll.filter(l => l.conn);
    // الكلمات الدينية أولاً (70%)
    const religious = V.WORDS.filter(w => ['faith', 'worship', 'phrases'].indexOf(w.topic) >= 0);
    const others = V.WORDS.filter(w => religious.indexOf(w) < 0);
    const pickWord = (needEmoji) => {
      for (let i = 0; i < 30; i++) {
        const pool = Math.random() < 0.7 ? religious : others;
        const w = pool[Math.floor(Math.random() * pool.length)];
        // v66: si la pregunta será de imagen, la palabra debe ser realmente
        // representable (w.pic !== false) — si no, se descarta y se reintenta.
        if (needEmoji && w.pic === false) continue;
        if (fresh('w:' + w.id)) return w;
      }
      return needEmoji ? (V.WORDS.find(w => w.pic !== false) || V.WORDS[0]) : V.WORDS[0];
    };
    const pickLetter = (arr) => {
      for (let i = 0; i < 30; i++) {
        const l = arr[Math.floor(Math.random() * arr.length)];
        if (fresh('l:' + l.id)) return l;
      }
      return arr[0];
    };
    const marks = ['fatha', 'kasra', 'damma', 'sukun'];
    const out = [];
    this.EXAM_BLUEPRINT.forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        let q = null;
        if (type === 'sound') q = this.qSoundToLetter(pickLetter(lettersAll), lettersAll);
        else if (type === 'shape') { const l = pickLetter(lettersAll); q = i % 2 ? this.qNameToShape(l, lettersAll) : this.qShapeToName(l, lettersAll); }
        else if (type === 'form') q = this.qForm(pickLetter(joiners));
        else if (type === 'nonconn') q = this.qNonConnector();
        else if (type === 'dots') q = this.qDots(pickLetter(dotted), lettersAll);
        else if (type === 'mark') q = this.qMark(marks[Math.floor(Math.random() * marks.length)], lettersAll);
        else if (type === 'markaudio') q = this.qMarkAudio(['fatha', 'kasra', 'damma'][Math.floor(Math.random() * 3)], lettersAll);
        else if (type === 'shadda') q = this.qMark('shadda', lettersAll);
        else if (type === 'tanween') q = this.qMark(['tan_fath', 'tan_kasr', 'tan_damm'][Math.floor(Math.random() * 3)], lettersAll);
        else if (type === 'wordaudio') q = this.qAudioWord(pickWord());
        else if (type === 'wordimage') q = this.qImageWord(pickWord(true));
        else if (type === 'wordmeaning') q = this.qWordMeaning(pickWord());
        if (q) out.push(q);
      }
    });
    return this.shuffle(out).slice(0, n);
  },

  // مفاتيح الصوت الكاملة (للتسجيل): [{key, text, kind}]
  audioManifestKeys() {
    const D = this.D(), V = this.V(), out = [];
    D.LETTERS.forEach(l => {
      out.push({ key: 'letter_' + l.id, text: l.say, note: `${l.tr} — ${l.nm}` });
      if (!['alif', 'waw', 'ya'].includes(l.id)) {
        ['fatha', 'kasra', 'damma'].forEach(mk => {
          const m = D.MARKS.find(x => x.id === mk);
          out.push({ key: `syl_${l.id}_${mk}`, text: l.ch + m.mark, note: `${l.c}${{ fatha: 'a', kasra: 'i', damma: 'u' }[mk]}` });
        });
      }
    });
    V.WORDS.forEach(w => out.push({ key: 'word_' + w.s, text: w.ar, note: w.tr }));
    V.PHRASES.forEach(p => out.push({ key: 'phrase_' + p.id, text: p.ar, note: p.tr }));
    return out;
  },
};

if (typeof window !== 'undefined') window.ArabicItems = ArabicItems;
if (typeof module !== 'undefined') module.exports = ArabicItems;
