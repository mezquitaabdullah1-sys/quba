/**
 * 🗂️ فهرس الوسائط الموجودة فعلاً (يُولَّد آلياً)
 * ─────────────────────────────────────────────
 * لا تُعدِّل هذا الملف يدوياً: شغّل
 *     node scripts/arabic-media.js manifest
 * بعد إضافة ملفات إلى:
 *     assets/audio/ar/*.mp3        (صوت الحروف والمقاطع والكلمات)
 *     assets/arabic/words/*.webp   (صور الكلمات: 800px، ≤ 80KB)
 * التطبيق لا يطلب إلا الملفات المذكورة هنا (فلا أخطاء 404)، وإن غاب الصوت
 * يعود إلى speechSynthesis، وإن غابت الصورة يظهر الإيموجي.
 */
const ARABIC_MEDIA = { audio: [], images: [] };
if (typeof window !== 'undefined') window.ARABIC_MEDIA = ARABIC_MEDIA;
if (typeof module !== 'undefined') module.exports = ARABIC_MEDIA;
