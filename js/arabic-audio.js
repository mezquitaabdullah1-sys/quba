/**
 * 🔊 ArabicAudio — صوت الحروف والمقاطع والكلمات
 * ─────────────────────────────────────────────
 * 1) إن وُجد تسجيل حقيقي (assets/audio/ar/<key>.mp3 ومذكور في ARABIC_MEDIA.audio) يُشغَّل.
 * 2) وإلا يُستعمل speechSynthesis كاحتياط (جودته تختلف من جهاز لآخر).
 *
 * الهدف (target) يمكن أن يكون:
 *   'letter:ba' | 'word:masjid'   معرّف عنصر (ArabicItems)
 *   { key, text }                 مفتاح ملف + نص احتياطي
 *   'بَ'                           نص عربي خام (TTS فقط)
 */
const ArabicAudio = {
  BASE: 'assets/audio/ar/',
  _el: null,
  _token: 0,   // يتغيّر مع كل تشغيل/إيقاف: يُبطل الاستدعاءات القديمة
  _seq: 0,     // يتغيّر عند إيقاف تسلسل كامل
  _warnedNoVoice: false,

  hasFile(key) {
    return !!key && typeof ARABIC_MEDIA !== 'undefined' && ARABIC_MEDIA.audio && ARABIC_MEDIA.audio.indexOf(key) >= 0;
  },

  resolve(target) {
    if (target && typeof target === 'object') return { key: target.key || null, text: target.text || '' };
    const s = String(target || '');
    if (/^(letter|word|mark):/.test(s) && typeof ArabicItems !== 'undefined') {
      return { key: ArabicItems.audioKey(s), text: ArabicItems.say(s) };
    }
    if (/^phrase_/.test(s)) return { key: s, text: '' };
    return { key: null, text: s };
  },

  stop() {
    this._seq++;
    this._halt();
  },

  _halt() {
    this._token++;
    try { if (this._el) { this._el.pause(); this._el.currentTime = 0; } } catch (e) { /* noop */ }
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) { /* noop */ }
  },

  /** يشغّل الهدف ويُرجع Promise يُحَلّ عند الانتهاء (ولا يُرفَض أبداً). */
  play(target, opts) {
    opts = opts || {};
    const { key, text } = this.resolve(target);
    this._halt();
    const token = this._token;
    return new Promise((resolve) => {
      const done = () => resolve();
      const fallback = () => {
        if (token !== this._token) return done();
        if (!text) return done();
        this.speak(text, opts.rate).then(done);
      };
      if (this.hasFile(key)) {
        try {
          if (!this._el) this._el = new Audio();
          const el = this._el;
          el.onended = done;
          el.onerror = fallback;
          el.src = this.BASE + key + '.mp3';
          const p = el.play();
          if (p && p.catch) p.catch(fallback);
        } catch (e) { fallback(); }
      } else {
        fallback();
      }
    });
  },

  playText(text, opts) { return this.play({ key: null, text }, opts); },

  /** تسلسل: ['letter:ba','letter:ta'] بفواصل قصيرة (يتوقّف عند stop()) */
  async playSequence(targets, gapMs) {
    const seq = ++this._seq;
    for (const tg of targets) {
      if (seq !== this._seq) return;
      await this.play(tg);
      if (seq !== this._seq) return;
      await new Promise(r => setTimeout(r, gapMs == null ? 250 : gapMs));
    }
  },

  ttsSupported() { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'; },

  speak(text, rate) {
    return new Promise((resolve) => {
      if (!this.ttsSupported()) {
        if (typeof showToast === 'function' && typeof t === 'function') showToast(t('cxAudioUnsupported'), 2200);
        return resolve();
      }
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ar-SA';
        u.rate = rate || 0.75;
        u.pitch = 1;
        const voices = synth.getVoices ? synth.getVoices() : [];
        const ar = voices.find(v => v.lang && v.lang.toLowerCase().indexOf('ar') === 0);
        if (ar) u.voice = ar;
        else if (voices.length && !this._warnedNoVoice) {
          this._warnedNoVoice = true;
          if (typeof showToast === 'function' && typeof t === 'function') showToast(t('cxNoArabicVoice'), 3500);
        }
        u.onend = () => resolve();
        u.onerror = () => resolve();
        synth.speak(u);
        if (navigator.vibrate) navigator.vibrate(20);
      } catch (e) { resolve(); }
    });
  },
};

if (typeof window !== 'undefined') window.ArabicAudio = ArabicAudio;
if (typeof module !== 'undefined') module.exports = ArabicAudio;
