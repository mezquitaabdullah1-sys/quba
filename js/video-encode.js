/**
 * 🎞️ VideoEncode — ترميز فيديو MP4 داخل WebView (v1.0.167)
 *
 * المسار الأول: WebCodecs (VideoEncoder H.264 + AudioEncoder AAC) مع حاوية MP4
 *               عبر mp4-muxer — ناتج .mp4 جاهز للمشاركة على واتساب/إنستغرام.
 * المسار الاحتياطي: MediaRecorder على canvas.captureStream — يُجرَّب mp4 أولًا
 *               ثم webm.
 *
 * لا يعتمد على شبكة ولا على مكتبة خارجية سوى js/vendor/mp4-muxer.min.js
 * (محزومة داخل التطبيق).
 */

const VideoEncode = {
  _det: null,

  /** هل الترميز السريع متاح؟ يُفحص مرة واحدة ونتذكّر النتيجة. */
  async detect() {
    if (this._det) return this._det;
    const det = { webcodecs: false, codec: null, muxer: false, recorderMp4: false, recorderWebm: false };
    det.muxer = !!(window.Mp4Muxer && window.Mp4Muxer.Muxer);
    if (window.VideoEncoder && window.AudioEncoder && det.muxer) {
      const cands = ['avc1.42001f', 'avc1.4d0028', 'avc1.640028', 'avc1.42002a', 'avc1.640033'];
      for (const codec of cands) {
        try {
          const r = await VideoEncoder.isConfigSupported({
            codec, width: 720, height: 1280, bitrate: 4000000, framerate: 30,
          });
          if (r && r.supported) { det.webcodecs = true; det.codec = codec; break; }
        } catch (e) { /* غير مدعوم */ }
      }
    }
    if (window.MediaRecorder) {
      const probe = (m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } };
      det.recorderMp4 = probe('video/mp4;codecs=avc1.42E01E') || probe('video/mp4');
      det.recorderWebm = probe('video/webm;codecs=vp9') || probe('video/webm');
    }
    this._det = det;
    return det;
  },

  /** يصف للمستخدم ما سيحدث — يُعرض في الواجهة بدل الفشل الصامت. */
  async modeLabel() {
    const d = await this.detect();
    if (d.webcodecs) return 'fast';
    if (d.recorderMp4) return 'compat-mp4';
    if (d.recorderWebm) return 'compat-webm';
    return 'none';
  },

  /**
   * يرمّز فيديو كاملًا.
   * @param {object} o
   *   canvas      لوحة الرسم (بنفس أبعاد الإخراج)
   *   width,height
   *   fps         إطارات/ثانية (افتراضي ٣٠)
   *   duration    المدة بالثواني
   *   drawFrame   دالة async (t) ترسم الإطار عند الزمن t
   *   audioBuffer AudioBuffer أو null
   *   leadIn      ثوانٍ قبل بدء الصوت (افتراضي ٠.٣)
   *   tail         ثوانٍ بعد انتهاء الصوت (افتراضي ١.٢)
   *   onProgress  (0..1)
   *   signal      AbortSignal
   * @returns {Promise<{blob:Blob, container:'mp4'|'webm', mode:string}>}
   */
  async encode(o) {
    const det = await this.detect();
    if (det.webcodecs) {
      try {
        return await this._encodeWebCodecs(o, det);
      } catch (e) {
        console.warn('VideoEncode: WebCodecs failed, falling back →', e && e.message);
        if (o.signal && o.signal.aborted) throw e;
      }
    }
    return await this._encodeRecorder(o, det);
  },

  /* ================= المسار ١: WebCodecs + mp4-muxer ================= */

  async _encodeWebCodecs(o, det) {
    const { Muxer, ArrayBufferTarget } = window.Mp4Muxer;
    const W = o.width, H = o.height;
    const fps = o.fps || 30;
    const bitrate = o.bitrate || Math.round(W * H * fps * 0.11);
    const total = o.duration;

    // ١) صوت AAC مسبقًا (سريع، لا يعتمد على الزمن الحقيقي)
    let audioChunks = [];
    let sampleRate = 48000;
    if (o.audioBuffer) {
      const res = await this._encodeAudio(o.audioBuffer, o.signal);
      if (res) { audioChunks = res.chunks; sampleRate = res.sampleRate; }
    }
    const hasAudio = audioChunks.length > 0;

    // ٢) الحاوية
    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: { codec: 'avc', width: W, height: H, frameRate: fps },
      audio: hasAudio
        ? { codec: 'aac', numberOfChannels: 1, sampleRate }
        : undefined,
      fastStart: 'in-memory',
    });

    // ٣) مرمّز الفيديو
    let encError = null;
    const venc = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => { encError = e; },
    });
    const cfg = { codec: det.codec, width: W, height: H, bitrate, framerate: fps, latencyMode: 'realtime' };
    const sup = await VideoEncoder.isConfigSupported(cfg);
    if (!sup || !sup.supported) throw new Error('video_config_unsupported');
    venc.configure(cfg);

    // ٤) حلقة الرسم بالزمن الحقيقي (تحافظ على تزامن الصوت)
    const nFrames = Math.max(1, Math.round(total * fps));
    const t0 = performance.now();
    for (let i = 0; i < nFrames; i++) {
      if (o.signal && o.signal.aborted) { try { venc.close(); } catch (e) {} throw new Error('aborted'); }
      if (encError) throw encError;
      const t = i / fps;
      const wait = (t0 + t * 1000) - performance.now();
      if (wait > 0) await sleep(wait);
      await o.drawFrame(t);
      const frame = new VideoFrame(o.canvas, {
        timestamp: Math.round(t * 1e6),
        duration: Math.round(1e6 / fps),
      });
      venc.encode(frame, { keyFrame: i % (fps * 2) === 0 });
      frame.close();
      if (venc.encodeQueueSize > 6) await this._drain(venc, 4);
      if (o.onProgress && (i % 3 === 0 || i === nFrames - 1)) o.onProgress((i + 1) / nFrames);
    }
    await venc.flush();
    venc.close();
    if (encError) throw encError;

    // ٥) الصوت بعد الفيديو — ترتيب الإدخال في mp4-muxer لا يهم
    if (hasAudio) for (const { chunk, meta } of audioChunks) muxer.addAudioChunk(chunk, meta);

    muxer.finalize();
    const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
    return { blob, container: 'mp4', mode: 'webcodecs' };
  },

  /** يحوّل AudioBuffer إلى قائمة EncodedAudioChunk بصيغة AAC أحادية. */
  async _encodeAudio(buf, signal) {
    const sampleRate = 48000;
    // خلط إلى أحادية + إعادة عيّنة عبر OfflineAudioContext
    const dur = buf.duration;
    const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(dur * sampleRate)), sampleRate);
    const src = off.createBufferSource();
    src.buffer = buf;
    src.connect(off.destination);
    src.start();
    const rendered = await off.startRendering();
    const data = rendered.getChannelData(0);

    const chunks = [];
    let meta = null;
    // AAC غير مدعوم على بعض الأجهزة → نكمل بفيديو بلا صوت بدل فشل كامل
    try {
      const supA = await AudioEncoder.isConfigSupported({
        codec: 'mp4a.40.2', sampleRate, numberOfChannels: 1, bitrate: 128000,
      });
      if (!supA || !supA.supported) return null;
    } catch (e) { return null; }
    const enc = new AudioEncoder({
      output: (chunk, m) => { if (m) meta = m; chunks.push({ chunk, meta: m }); },
      error: (e) => { throw e; },
    });
    enc.configure({ codec: 'mp4a.40.2', sampleRate, numberOfChannels: 1, bitrate: 128000 });

    const FRAME = 4096;
    for (let off2 = 0; off2 < data.length; off2 += FRAME) {
      if (signal && signal.aborted) { try { enc.close(); } catch (e) {} throw new Error('aborted'); }
      const n = Math.min(FRAME, data.length - off2);
      const copy = new Float32Array(n);
      copy.set(data.subarray(off2, off2 + n));
      const ad = new AudioData({
        format: 'f32-planar',
        sampleRate,
        numberOfFrames: n,
        numberOfChannels: 1,
        timestamp: Math.round((off2 / sampleRate) * 1e6),
        data: copy,
      });
      enc.encode(ad);
      ad.close();
    }
    await enc.flush();
    enc.close();
    return { chunks, meta, sampleRate };
  },

  /* ================= المسار ٢: MediaRecorder ================= */

  async _encodeRecorder(o, det) {
    const mime = det.recorderMp4 ? 'video/mp4'
      : (det.recorderWebm ? 'video/webm;codecs=vp9' : null);
    if (!mime) throw new Error('no_encoder');
    const fps = o.fps || 30;
    const stream = o.canvas.captureStream(fps);

    let ac = null, audioSrc = null;
    if (o.audioBuffer) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        if (ac.state === 'suspended') await ac.resume();
        const dest = ac.createMediaStreamDestination();
        audioSrc = ac.createBufferSource();
        audioSrc.buffer = o.audioBuffer;
        audioSrc.connect(dest);
        dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
        audioSrc.start();
      } catch (e) { console.warn('audio track skipped', e); }
    }

    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4500000 });
    const parts = [];
    rec.ondataavailable = (ev) => { if (ev.data && ev.data.size) parts.push(ev.data); };
    const done = new Promise(res => { rec.onstop = res; });
    rec.start(200);

    const nFrames = Math.max(1, Math.round(o.duration * fps));
    const t0 = performance.now();
    for (let i = 0; i < nFrames; i++) {
      if (o.signal && o.signal.aborted) break;
      const t = i / fps;
      const wait = (t0 + t * 1000) - performance.now();
      if (wait > 0) await sleep(wait);
      await o.drawFrame(t);
      if (o.onProgress && i % 3 === 0) o.onProgress((i + 1) / nFrames);
    }
    try { rec.stop(); } catch (e) {}
    await done;
    try { if (audioSrc) audioSrc.stop(); if (ac) ac.close(); } catch (e) {}
    stream.getTracks().forEach(t => t.stop());

    if (o.signal && o.signal.aborted) throw new Error('aborted');
    const blob = new Blob(parts, { type: mime });
    return {
      blob,
      container: mime.indexOf('mp4') === 0 ? 'mp4' : 'webm',
      mode: mime.indexOf('mp4') === 0 ? 'recorder-mp4' : 'recorder-webm',
    };
  },

  /* ================= أدوات ================= */

  _drain(enc, below) {
    return new Promise(res => {
      const tick = () => {
        if (enc.encodeQueueSize <= below) return res();
        setTimeout(tick, 8);
      };
      tick();
    });
  },

  /**
   * يجلب ملف MP3 ويحوّله إلى AudioBuffer.
   * @param {string[]} urls  قائمة روابط بديلة
   */
  async fetchAudioBuffer(urls, onProgress) {
    let lastErr = null;
    for (const url of urls) {
      try {
        const r = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (!r.ok) { lastErr = new Error('HTTP ' + r.status); continue; }
        const total = Number(r.headers.get('content-length') || 0);
        const reader = r.body && r.body.getReader ? r.body.getReader() : null;
        let raw;
        if (reader) {
          const parts = [];
          let got = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            parts.push(value);
            got += value.length;
            if (onProgress && total) onProgress(got / total);
          }
          raw = await new Blob(parts).arrayBuffer();
        } else {
          raw = await r.arrayBuffer();
        }
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC();
        const buf = await ctx.decodeAudioData(raw);
        ctx.close();
        return buf;
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('audio_fetch_failed');
  },

  /** يوصل عدة AudioBuffers بتسلسل مع فاصل صامت — لتلاوة مقطع متعدد الآيات. */
  concatBuffers(buffers, gapSec = 0.25) {
    if (!buffers.length) return null;
    const sr = buffers[0].sampleRate;
    const ch = Math.min(2, Math.max(1, buffers[0].numberOfChannels));
    let len = 0;
    buffers.forEach((b, i) => { len += b.length + (i < buffers.length - 1 ? Math.round(gapSec * sr) : 0); });
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const out = ctx.createBuffer(ch, len, sr);
    let pos = 0;
    for (let i = 0; i < buffers.length; i++) {
      const b = buffers[i];
      for (let c = 0; c < ch; c++) {
        const srcCh = b.getChannelData(Math.min(c, b.numberOfChannels - 1));
        out.getChannelData(c).set(srcCh, pos);
      }
      pos += b.length + (i < buffers.length - 1 ? Math.round(gapSec * sr) : 0);
    }
    ctx.close();
    return out;
  },
};

function sleep(ms) {
  return new Promise(r => setTimeout(r, Math.max(0, Math.min(ms, 2000))));
}

if (typeof window !== 'undefined') window.VideoEncode = VideoEncode;
