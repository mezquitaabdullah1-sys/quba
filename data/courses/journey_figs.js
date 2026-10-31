// 🗺️ رحلة المسلم — إنفوجرافيك المحطات (v108)
// تُبنى الصور بالكود (HTML → PNG) بنصّ عربي دقيق بخط Amiri، لا بتوليد صور،
// لأن دقة النصّ القرآني والعقدي لا تحتمل تشويهاً. تُضاف كأول درس في كل محطة.
(function () {
  'use strict';
  var C = window.COURSE_JOURNEY;
  if (!C || !C.stations) return;
  var MAP = { welcome: 's1', god: 's2', iman: 's3', prophet: 's4', pillars: 's5', questions: 's6', akhlaq: 's7', muamalat: 's8', next: 's9' };
  C.stations.forEach(function (s) {
    var f = MAP[s.id];
    if (!f) return;
    var already = s.lessons.some(function (l) { return l.type === 'image' && String(l.img || '').indexOf(f + '.png') > -1; });
    if (already) return;
    s.lessons.unshift({
      type: 'image',
      img: 'assets/journey/' + f + '.png',
      title: s.title,
      caption: {
        ar: 'إنفوجرافيك المحطة — المس الصورة لتكبيرها.',
        es: 'Infografía de la estación — toca la imagen para ampliarla.',
        en: 'Station infographic — tap the image to enlarge.',
      },
    });
  });
})();
