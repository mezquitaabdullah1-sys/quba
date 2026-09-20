// 🎬 ClipsData — مقتطفات دينية: قائمة فيديوهات يوتيوب + قوائم تشغيل + نصوص الواجهة (AR/ES/EN)
// v57: مشاهدة الفيديوهات داخل التطبيق (مشغّل يوتيوب المدمج) — تظهر في الرئيسية تحت الراديو وفي صفحة الحكمة
// الصور المصغّرة تُجلب مباشرة من i.ytimg.com (بدون مفتاح API) — hqdefault.jpg
const ClipsData = {

  // ============ نصوص الواجهة (ثلاثي اللغة — نفس أسلوب RadioData.L) ============
  LOCALES: {
    ar: {
      clipsTitle: 'مقتطفات دينية',
      clipsSubtitle: 'مقاطع مختارة من يوتيوب — تُشغَّل هنا بمشغّله',
      clipsAll: 'الكل',
      clipsCatEs: 'فيديوهات إسبانية',
      clipsCatAr: 'فيديوهات عربية',
      clipsCatEn: 'فيديوهات إنجليزية',
      clipsWatch: 'شاهد الفيديو',
      clipsBack: 'رجوع',
      clipsOpenYoutube: 'فتح في يوتيوب',
      clipsVideosTab: 'فيديوهات',
      clipsAlbumsTab: 'قوائم التشغيل',
      clipsVideosCount: 'فيديو',
      clipsAlbumWritten: 'ترجمة مكتوبة',
      clipsAlbumOral: 'ترجمة صوتية',
      clipsAlbumWrittenDesc: 'القرآن الكريم كاملًا (١–١١٤) بالترجمة الإسبانية المكتوبة',
      clipsAlbumOralDesc: 'القرآن الكريم بالترجمة الإسبانية الصوتية',
      wisdomClipsDesc: 'مقاطع يوتيوب مختارة تُشاهَد داخل التطبيق',
    },
    es: {
      clipsTitle: 'Clips islámicos',
      clipsSubtitle: 'Videos seleccionados de YouTube — se reproducen aquí',
      clipsAll: 'Todos',
      clipsCatEs: 'Videos en español',
      clipsCatAr: 'Videos en árabe',
      clipsCatEn: 'Videos en inglés',
      clipsWatch: 'Ver video',
      clipsBack: 'Volver',
      clipsOpenYoutube: 'Abrir en YouTube',
      clipsVideosTab: 'Videos',
      clipsAlbumsTab: 'Listas',
      clipsVideosCount: 'videos',
      clipsAlbumWritten: 'Traducción escrita',
      clipsAlbumOral: 'Traducción oral',
      clipsAlbumWrittenDesc: 'El Corán completo (1–114) con traducción escrita al español',
      clipsAlbumOralDesc: 'El Corán con traducción oral al español',
      wisdomClipsDesc: 'Videos de YouTube seleccionados, dentro de la app',
    },
    en: {
      clipsTitle: 'Islamic clips',
      clipsSubtitle: 'Curated YouTube videos — played right here',
      clipsAll: 'All',
      clipsCatEs: 'Spanish videos',
      clipsCatAr: 'Arabic videos',
      clipsCatEn: 'English videos',
      clipsWatch: 'Watch video',
      clipsBack: 'Back',
      clipsOpenYoutube: 'Open in YouTube',
      clipsVideosTab: 'Videos',
      clipsAlbumsTab: 'Playlists',
      clipsVideosCount: 'videos',
      clipsAlbumWritten: 'Written translation',
      clipsAlbumOral: 'Spoken translation',
      clipsAlbumWrittenDesc: 'The full Quran (1–114) with written Spanish translation',
      clipsAlbumOralDesc: 'The Quran with spoken Spanish translation',
      wisdomClipsDesc: 'Curated YouTube videos inside the app',
    },
  },

  // فيديوهات مختارة — القائمة الأولية (تُوسَّع لاحقًا)
  // الحقول: id (معرّف يوتيوب)، العنوان بالإسبانية، القناة
  VIDEOS: [
    { id: '7WvVSdgPCQA', title: '100 preguntas sobre el Islam — Parte 1', channel: 'Mister Tahar' },
    { id: 'O1RpfRp19co', title: '10 Biggest Misconceptions About Islam Explained in 6 Minutes', channel: 'Brother yusuf', cats: ['es', 'en'] },
    { id: 'JnECmQ_8C6Q', title: '001 – Surat Al-Faatiha (La Sura que abre el Libro)', channel: 'Europe Revive' },
    { id: '7lvuE6xwjrY', title: 'El islam NO es Como Tú Crees: Bendiciones, Pruebas y Sabiduría', channel: 'Regreso A La Verdad' },
    { id: 'Uu2XfkC68Hs', title: 'Cómo hacerte musulmán — 5 pilares del Islam y 6 pilares de fe', channel: 'Savage Petrov' },
    { id: 'O7jBANtNHHU', title: 'El rezo del Profeta ﷺ descrito — Aprende a rezar fácil', channel: 'Savage Petrov' },
    { id: 'EajB3cScC38', title: '¿Cómo se ordenó el Corán? Preguntas de Islam | Mohammad Idrissi #13', channel: 'La Última Medina' },
    { id: 'OjF6qi45Q1E', title: 'Cómo es la Figura de Jesús en el Islam', channel: 'Tengo un Plan' },
    { id: 'yt5WyqQT0GI', title: 'The Biggest Myths About Islam Debunked in 8 Minutes', channel: 'Brother Aqib', cats: ['es', 'en'] },
    { id: 'hE7cnsFfIus', title: 'Corán 1 · Al-Fatiha «El Abridor» — Español', channel: 'Islam Light' },
    { id: 'U86D0188Mp8', title: 'Quiz Islámico 🌟 Conocimientos generales sobre el Islam', channel: 'Quiz Islámico' },
    { id: 'd0B-N97qLsU', title: 'Ali Dawah responde las preguntas más difíciles del ateísmo', channel: 'Towards Eternity' },
    { id: 'r7HHc08F6P0', title: '¿Qué es el Islam? El Mensaje de Un Solo Dios, explicado simple', channel: 'IslamInSpanishTV' },
  ],

  // قوائم التشغيل (ألبومات)
  PLAYLISTS: [
    { id: 'PLe-PTxA3C-wxZKapQjss55hTAiAHqx5fv', kind: 'written', title: 'Corán con Traducción al Español — Sura 1 a 114' },
    { id: 'PLVXWYY1l9S_KqDfaEnLAm0RTMS8MI_nyt', kind: 'oral', title: 'El Sagrado Corán en Español' },
  ],

  thumb(id) { return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; },

  watchUrl(id) { return 'https://youtu.be/' + id; },

  // v59: تصنيف حسب اللغة — es هو الافتراضي لكل فيديو بلا حقل cats
  byCat(cat) { return this.VIDEOS.filter(v => (v.cats || ['es']).indexOf(cat) !== -1); },
  playlistUrl(id) { return 'https://www.youtube.com/playlist?list=' + id; },

  L(key) {
    const l = (typeof currentLocale !== 'undefined' && currentLocale) || 'es';
    const loc = this.LOCALES[l] ? l : (l === 'ar' ? 'ar' : (l === 'en' ? 'en' : 'es'));
    return (this.LOCALES[loc] && this.LOCALES[loc][key]) || this.LOCALES.es[key] || this.LOCALES.ar[key] || key;
  },
};

if (typeof module !== 'undefined') module.exports = ClipsData;
