// 🕌 Adhan Service — Plays adhan with different voices
// v20 FIX: las URLs antiguas (cdn.islamic.network) devuelven 403 — error
// "No se pudo reproducir el adhan". Ahora se usan fuentes verificadas
// (cdn.aladhan.com + islamcan.com) con fallback automático por voz.
// v24: nuevo modo de reproducción:
//   • 'full'    → adhan completo (las dos voces configuradas en secuencia)
//   • 'takbeer' → SOLO las dos primeras takbeer (se reproduce la 1ª voz y se
//                 corta automáticamente tras `takbeerDuration` segundos)
const AdhanService = {
  // v35: nombre y país de cada muecín/localización del adhan según el
  // idioma activo de la app (árabe / inglés / español).
  voiceName(voice) {
    if (!voice) return '';
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    if (loc === 'ar') return voice.nameAr || voice.name;
    if (loc === 'en') return voice.nameEn || voice.name;
    return voice.name;
  },

  voiceCountry(voice) {
    if (!voice) return '';
    const loc = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    if (loc === 'ar') return voice.countryAr || voice.country || '';
    if (loc === 'en') return voice.countryEn || voice.country || '';
    return voice.country || '';
  },

  VOICES: [
    { id: 'makkah',   name: 'Makkah — Ali Ahmad Mulla', nameAr: 'أذان الحرم المكي — علي أحمد ملا', nameEn: 'Makkah — Ali Ahmad Mulla', country: 'Arabia Saudí', countryAr: 'السعودية', countryEn: 'Saudi Arabia', flag: '🕋', url: 'https://cdn.aladhan.com/audio/adhans/a1.mp3',      fallbackUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
    { id: 'madinah',  name: 'Madinah — Adhan Madinah', nameAr: 'أذان الحرم النبوي — المدينة المنورة', nameEn: 'Madinah — Madinah Adhan', country: 'Arabia Saudí', countryAr: 'السعودية', countryEn: 'Saudi Arabia', flag: '🕌', url: 'https://cdn.aladhan.com/audio/adhans/a2.mp3',      fallbackUrl: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
    { id: 'egypt',    name: 'Egipto — Adhan Egypt', nameAr: 'الأذان المصري — مصر', nameEn: 'Egypt — Egyptian Adhan', country: 'Egipto', countryAr: 'مصر', countryEn: 'Egypt', flag: '🇪🇬', url: 'https://cdn.aladhan.com/audio/adhans/a3.mp3',      fallbackUrl: 'https://www.islamcan.com/audio/adhan/azan3.mp3' },
    { id: 'turkey',   name: 'Turquía — Adhan Turkish', nameAr: 'الأذان التركي — تركيا', nameEn: 'Türkiye — Turkish Adhan', country: 'Turquía', countryAr: 'تركيا', countryEn: 'Türkiye', flag: '🇹🇷', url: 'https://cdn.aladhan.com/audio/adhans/a4.mp3',      fallbackUrl: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
    { id: 'aqsa',     name: 'Al-Aqsa — Adhan Al-Aqsa', nameAr: 'أذان المسجد الأقصى — القدس', nameEn: 'Al-Aqsa — Al-Aqsa Adhan', country: 'Palestina', countryAr: 'فلسطين', countryEn: 'Palestine', flag: '🇵🇸', url: 'https://www.islamcan.com/audio/adhan/azan1.mp3', fallbackUrl: 'https://cdn.aladhan.com/audio/adhans/a1.mp3' },
    { id: 'algeria',  name: 'Argelia — Adhan Algerian', nameAr: 'الأذان الجزائري — الجزائر', nameEn: 'Algeria — Algerian Adhan', country: 'Argelia', countryAr: 'الجزائر', countryEn: 'Algeria', flag: '🇩🇿', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3', fallbackUrl: 'https://cdn.aladhan.com/audio/adhans/a2.mp3' },
    // v57: أذان الفجر — نسخ خاصة بالتثويب («الصلاة خير من النوم» مرتين بعد الحيعلة)
    { id: 'fajr_makkah',  name: 'Fajr — Makkah (Tathwib)', nameAr: 'أذان الفجر — مكة المكرمة (بالتثويب)', nameEn: 'Fajr Adhan — Makkah (Tathwib)', country: 'Arabia Saudí', countryAr: 'السعودية', countryEn: 'Saudi Arabia', flag: '🌅', url: 'https://www.islamcan.com/audio/adhan/azan5.mp3', fallbackUrl: 'https://cdn.aladhan.com/audio/adhans/a5.mp3' },
    { id: 'fajr_madinah', name: 'Fajr — Madinah (Tathwib)', nameAr: 'أذان الفجر — المدينة المنورة (بالتثويب)', nameEn: 'Fajr Adhan — Madinah (Tathwib)', country: 'Arabia Saudí', countryAr: 'السعودية', countryEn: 'Saudi Arabia', flag: '🌅', url: 'https://cdn.aladhan.com/audio/adhans/a5.mp3', fallbackUrl: 'https://www.islamcan.com/audio/adhan/azan5.mp3' },
  ],

  audio: null,
  previewAudio: null,
  _cutTimer: null, // v24: temporizador que corta el audio en modo 'takbeer'

  getSettings() {
    // v24: defaults extendidos (mode / takbeerDuration) con fusión para
    // ajustes antiguos guardados antes de la v24
    return Object.assign({
      voice1: 'makkah',
      voice2: 'madinah',
      volume: 0.8,
      muted: false,
      mode: 'full',          // 'full' | 'takbeer'
      takbeerDuration: 16,   // v59: antes 12 — cortaba la 2ª takbeer a mitad en varias voces; ajustable en Perfil
      fajrVoice: 'fajr_makkah', // v57: voz del adhan de Fajr (con tathwib)
    }, (typeof AppState !== 'undefined' && AppState.settings.adhan) || {});
  },

  /**
   * Reproduce una voz con fallback automático: si la URL principal falla
   * (red, 403, CORS...), intenta la URL alternativa antes de rendirse.
   * v24: parámetro opcional maxMs — corta el audio tras N milisegundos
   * (usado por el modo "solo las dos primeras takbeer").
   *
   * v53 FIX (corte prematuro, antes de completar ni una takbeera):
   * con CDNs inestables, la conexión puede cerrarse a mitad de la
   * descarga — el navegador interpreta eso como que el audio "terminó"
   * (dispara 'ended') aunque solo se hayan reproducido 1-2 segundos de
   * un archivo mucho más largo. El código anterior lo daba por bueno
   * (finish(true)) y saltaba a la siguiente voz / cerraba el modo
   * takbeer casi al instante. Ahora se compara currentTime con la
   * duración real reportada por el archivo: si el hueco es grande, se
   * trata como un fallo de red y se reintenta (fallback y, si hace
   * falta, un reintento extra) en vez de aceptarlo como final legítimo.
   * @returns {Promise<boolean>} true si empezó a sonar
   */
  _playVoice(voice, volume, onEnded, maxMs = 0) {
    return new Promise((resolve) => {
      let settled = false;
      let usedFallback = false;
      let extraRetryUsed = false;

      const clearCut = () => {
        if (this._cutTimer) { clearTimeout(this._cutTimer); this._cutTimer = null; }
      };
      const finish = (a, ok) => {
        if (settled) return;
        settled = true;
        clearCut();
        if (a && a !== this.audio) { try { a.pause(); } catch (e) {} }
        resolve(ok);
        if (onEnded) onEnded();
      };

      // v53: ¿el 'ended' llegó mucho antes del final real del archivo?
      // (stream truncado por la red, no un final legítimo)
      const endedPrematurely = (a) => {
        const dur = a.duration;
        return isFinite(dur) && dur > 1 && (dur - a.currentTime) > 1.5;
      };

      const tryUrl = (url, isFallback) => {
        const a = new Audio();
        a.volume = volume;
        a.preload = 'auto';
        a.src = url;

        // v53: punto único para decidir qué hacer ante cualquier fallo
        // (carga, red o corte prematuro) — antes cada handler decidía por
        // su cuenta y solo probaba el fallback una vez, sin red de
        // seguridad si ESE también fallaba a mitad de camino.
        const handleFailure = (reason) => {
          console.warn('Adhan: ' + reason, voice.id, url);
          if (!usedFallback && voice.fallbackUrl) {
            usedFallback = true;
            tryUrl(voice.fallbackUrl, true);
          } else if (!extraRetryUsed) {
            extraRetryUsed = true;
            tryUrl(url, isFallback); // último intento: misma fuente, puede ser un simple corte de red
          } else {
            finish(a, false);
          }
        };

        a.onerror = () => handleFailure('fallo de carga/red');
        a.onended = () => {
          if (endedPrematurely(a)) { handleFailure('corte prematuro (stream incompleto)'); return; }
          finish(a, true);
        };
        // v25: corte por progreso real del audio (modo takbeer) — garantía
        // extra por si el temporizador se retrasa (pestaña en 2º plano):
        // en cuanto la reproducción alcanza maxMs se corta, pase lo que pase.
        if (maxMs > 0) {
          a.addEventListener('timeupdate', () => {
            if (a.currentTime * 1000 >= maxMs) {
              try { a.pause(); a.currentTime = 0; } catch (e) {}
              finish(a, true);
            }
          });
        }
        const p = a.play();
        if (p && p.then) {
          p.then(() => {
            // v24: corte programado (modo takbeer) — solo si realmente sonó
            if (maxMs > 0) {
              clearCut();
              this._cutTimer = setTimeout(() => {
                this._cutTimer = null;
                try { a.pause(); a.currentTime = 0; } catch (e) {}
                finish(a, true);
              }, maxMs);
            }
          }).catch(err => {
            // NotAllowedError = sin gesto del usuario; no tiene sentido el fallback
            if (err && err.name === 'NotAllowedError') {
              console.warn('Adhan: reproducción bloqueada (se requiere interacción del usuario)');
              finish(a, false);
              return;
            }
            handleFailure('play() rechazado: ' + (err && err.name));
          });
        }
        this.audio = a;
      };
      tryUrl(voice.url, false);
    });
  },

  preview(voiceId) {
    this.stopPreview();
    const voice = this.VOICES.find(v => v.id === voiceId);
    if (!voice) return;
    const settings = this.getSettings();
    const volume = settings.muted ? 0 : settings.volume;

    const tryUrl = (url, isFallback) => {
      this.previewAudio = new Audio(url);
      this.previewAudio.volume = volume;
      this.previewAudio.onerror = () => {
        if (!isFallback && voice.fallbackUrl) { tryUrl(voice.fallbackUrl, true); return; }
        if (typeof showToast === 'function') showToast('⚠️ ' + (t('adhanPlayError') || 'No se pudo reproducir'), 3000);
      };
      this.previewAudio.play().then(() => {
        if (typeof showToast === 'function') showToast('🔊 ' + this.voiceName(voice), 1500);
      }).catch(err => {
        console.warn('Adhan preview failed:', err);
        if (!isFallback && voice.fallbackUrl && err && err.name !== 'NotAllowedError') {
          tryUrl(voice.fallbackUrl, true);
          return;
        }
        if (typeof showToast === 'function') showToast('⚠️ ' + (t('adhanPlayError') || 'No se pudo reproducir'), 3000);
      });
    };
    tryUrl(voice.url, false);
  },

  stopPreview() {
    if (this.previewAudio) {
      try { this.previewAudio.pause(); this.previewAudio.currentTime = 0; this.previewAudio.onerror = null; } catch (e) {}
      this.previewAudio = null;
    }
  },

  setVolume(v) {
    if (this.previewAudio) this.previewAudio.volume = v;
    if (this.audio) this.audio.volume = v;
  },

  /**
   * Reproduce el adhan según el modo configurado:
   *  - 'full'    → las dos voces en secuencia (adhan completo)
   *  - 'takbeer' → solo las dos primeras takbeer (1ª voz, corte a los N seg)
   */
  async playFullAdhan(onEnded, prayerKey) {
    const settings = this.getSettings();
    if (settings.muted) { if (onEnded) onEnded(); return false; }
    // v57: للفجر صوت خاص (تثويب: «الصلاة خير من النوم»). prayerKey يصل من
    // PrayerNotifications.notify(tag). ندعم أيضاً النداء القديم playFullAdhan('Fajr').
    if (typeof onEnded === 'string') { prayerKey = onEnded; onEnded = null; }
    const isFajr = String(prayerKey || '').toLowerCase() === 'fajr';
    const fajrV = this.VOICES.find(v => v.id === (settings.fajrVoice || 'fajr_makkah'))
      || this.VOICES.find(v => v.id === 'fajr_makkah');
    const voice1 = (isFajr && fajrV) ? fajrV : (this.VOICES.find(v => v.id === settings.voice1) || this.VOICES[0]);
    const voice2 = this.VOICES.find(v => v.id === settings.voice2) || this.VOICES[1];

    this.stopPreview();

    // v24: modo "solo las dos primeras takbeer"
    if (settings.mode === 'takbeer') {
      // v25: solo las DOS primeras takbeer — se reproduce la 1ª voz con
      // doble mecanismo de corte (temporizador + progreso del audio) y NO
      // se continúa con la segunda voz ni con el adhan completo.
      const durMs = Math.max(5, settings.takbeerDuration || 16) * 1000;
      const ok = await this._playVoice(voice1, settings.volume, onEnded, durMs);
      if (!ok && typeof showToast === 'function') {
        showToast('⚠️ ' + (t('adhanPlayError') || 'No se pudo reproducir'), 3000);
      }
      return ok;
    }

    // Modo adhan completo (dos voces en secuencia, fallback incluido)
    const ok1 = await this._playVoice(voice1, settings.volume, null);
    if (!ok1) {
      // Intentar al menos la segunda voz (otra fuente puede funcionar)
      const ok2 = await this._playVoice(voice2, settings.volume, onEnded);
      if (!ok2 && typeof showToast === 'function') {
        showToast('⚠️ ' + (t('adhanPlayError') || 'No se pudo reproducir'), 3000);
      }
      return ok2;
    }
    const ok2 = await this._playVoice(voice2, settings.volume, onEnded);
    return ok2;
  },

  stop() {
    this.stopPreview();
    if (this._cutTimer) { clearTimeout(this._cutTimer); this._cutTimer = null; }
    if (this.audio) {
      try { this.audio.pause(); this.audio.currentTime = 0; this.audio.onended = null; this.audio.onerror = null; } catch (e) {}
      this.audio = null;
    }
  },
};

if (typeof window !== 'undefined') {
  window.AdhanService = AdhanService;
}
