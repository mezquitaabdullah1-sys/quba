// 📦 Service Worker — app shell offline + carga instantánea
//
// v1.0.32 había ELIMINADO el Service Worker por completo (ver CHANGELOG
// "PWA eliminado" y "FIX raíz: Service Worker heredado bloqueaba TODOS los
// fixes") porque un SW antiguo se quedaba activo para siempre en los
// dispositivos ya instalados, sirviendo desde su Cache Storage un
// index.html/JS viejo sin importar cuántas veces se corrigiera el código.
//
// La causa raíz de AQUEL bug no era "tener un Service Worker" — era que:
//   1) el SW nunca tomaba control de las pestañas ya abiertas (sin
//      `skipWaiting()` / `clients.claim()`), así que una app instalada como
//      PWA/TWA (que casi nunca se "cierra" de verdad) se quedaba para
//      siempre con la versión con la que se instaló, y
//   2) el nombre de la caché no dependía de la versión de la app, así que
//      una build nueva no forzaba a descartar la caché vieja.
//
// Quitar el SW arregló ESE bug, pero introdujo el que se reporta ahora:
// sin ningún Service Worker, el navegador tiene que volver a descargar por
// red TODO el app shell (HTML/CSS/JS/datos, varios MB) cada vez que se abre
// o se retoma la app — de ahí la "carga cada vez que se vuelve a Inicio" —
// y si no hay internet en el primer arranque, no hay nada que mostrar
// (pantalla en blanco), aunque la propia Home (pages/home.js) ya sabe
// pintar horarios estimados sin conexión: nunca llega a ejecutarse porque
// ni siquiera el JS logra cargarse.
//
// Este archivo resuelve ambas causas a la vez:
//   • CACHE_NAME incluye APP_VERSION (single source of truth: js/version.js)
//     → cada build publica una caché nueva.
//   • skipWaiting() + clients.claim() → el SW nuevo toma control de
//     inmediato, sin esperar a que se cierren todas las pestañas.
//   • activate() borra cualquier caché que no sea la versión actual (y
//     respeta 'quba-quran-audio-v1', que es de js/quran-offline.js y no
//     tiene relación con el app shell).
// Con esto, una build nueva se autolimpia sola — ya no hace falta
// desregistrar el SW a mano en cada carga desde index.html.

importScripts('./js/version.js'); // expone APP_VERSION

const CACHE_NAME = `quba-shell-${typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'v1'}`;
const AUDIO_CACHE = 'quba-quran-audio-v1'; // propiedad de js/quran-offline.js — nunca tocar

// 🧱 App shell — todo lo que index.html carga con <script>/<link>, más
// splash/manifest. Se precachea en install() para que la primera pintura de
// Inicio sea posible incluso sin conexión.
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo.webp',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon.png',
  './assets/logo.png',
  './css/calendar-v16.css',
  './css/components.css',
  './css/courses.css',
  './css/glass-theme.css',
  './css/main.css',
  './css/mushaf.css',
  './css/offline.css',
  './css/qibla-v17.css',
  './css/quran-reader.css',
  './css/restyle-layout.css',
  './css/screens.css',
  './css/share-card.css',
  './css/themes-colorful.css',
  './css/wisdom.css',
  './css/radio.css',
  './css/clips.css',
  './data/adhkar/after_prayer.js',
  './data/adhkar/bathroom.js',
  './data/adhkar/distress.js',
  './data/adhkar/enter_home.js',
  './data/adhkar/evening.js',
  './data/adhkar/food_drink.js',
  './data/adhkar/friday.js',
  './data/adhkar/morning.js',
  './data/adhkar/mosque.js',
  './data/adhkar/quran_adhkar.js',
  './data/adhkar/sleep.js',
  './data/adhkar/travel.js',
  './data/adhkar/wake_up.js',
  './data/calendar2026.js',
  './data/courses/arabic_language.js',
  './data/courses/how_to_pray.js',
  './data/courses/journey.js',
  './data/courses/kids.js',
  './data/courses/names_of_allah.js',
  './data/courses/pillars.js',
  './data/courses/quran_basics.js',
  './data/courses/salah_complete.js',
  './data/courses/wudu_complete.js',
  './data/duas/local_duas.js',
  './data/duas/quran_reading_duas.js',
  './data/famous_verses.js',
  './data/mushaf_divisions.js',
  './data/quiz/fiqh.js',
  './data/quiz/hadith.js',
  './data/quiz/history.js',
  './data/quiz/prophets.js',
  './data/quiz/quran.js',
  './data/quiz/sira.js',
  './data/quran_full_ar.js',
  './data/quran_search_index.js',
  './data/quran_transliteration.js',
  './data/surah_revelation_order.js',
  './js/adhan.js',
  './js/api.js',
  './js/app.js',
  './js/cache-db.js',
  './js/cert-share.js',
  './js/cities.js',
  './js/city-clock.js',
  './js/config.js',
  './js/dual-timing.js',
  './js/duas.js',
  './js/env.public.js',
  './js/event-delegation.js',
  './js/gamification.js',
  './js/garcia-data.js',
  './js/hijri.js',
  './js/radio-data.js',
  './js/radio-service.js',
  './js/videos-data.js',
  './js/i18n.js',
  './js/mascot.js',
  './js/mp-cities.js',
  './js/muslimpro-sync.js',
  './js/notifications.js',
  './js/notif-center.js', // v55
  './js/pdf-export.js',
  './js/prayer-calc.js',
  './js/prayer-tracker.js',
  './js/qibla.js',
  './js/quran-helpers.js',
  './js/quran-offline.js',
  './js/quran-search.js',
  './js/router.js',
  './js/share-card.js',
  './js/skeleton.js',
  './js/storage.js',
  './js/tafsir.js',
  './js/validate.js',
  './js/vendor/jspdf.umd.min.js',
  './js/version.js',
  './js/wake-lock.js',
  './pages/calendar.js',
  './pages/radio.js',
  './pages/videos.js',
  './pages/home.js',
  './pages/language.js',
  './pages/prayer.js',
  './pages/profile.js',
  './pages/quran-mushaf.js',
  './pages/quran.js',
  './pages/wisdom.js',
  './pages/wisdom/adhkar.js',
  './pages/wisdom/courses.js',
  './pages/wisdom/duas.js',
  './pages/wisdom/quiz.js',
  './pages/wisdom/tasbih.js',
];

// Dominios externos que también queremos disponibles sin conexión
// (fuentes e iconos — igual que en la v5.0.0 "Modo offline real").
// Nunca APIs dinámicas (horarios, tafsir, etc.): esas ya tienen su propia
// caché con TTL en js/storage.js y js/cache-db.js.
const RUNTIME_CACHE_HOSTS = new Set([
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Precache resiliente: un solo asset roto (renombrado, 404) no debe
      // tumbar la instalación de todo el app shell.
      const results = await Promise.allSettled(
        CORE_ASSETS.map((url) => cache.add(url))
      );
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn('[SW] No se pudo precachear', CORE_ASSETS[i], r.reason);
        }
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name !== CACHE_NAME && name !== AUDIO_CACHE)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Estrategia: cache-first + revalidación en segundo plano (stale-while-
// revalidate). Esto es lo que hace que abrir/retomar la app sea INSTANTÁNEO
// (se pinta desde caché sin esperar red) y a la vez se mantenga al día
// (la próxima apertura ya usa lo que se acaba de descargar de fondo).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !RUNTIME_CACHE_HOSTS.has(url.hostname)) return; // deja pasar APIs dinámicas tal cual

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => null);

      // Con caché: responde YA con lo cacheado (instantáneo) y deja la
      // red actualizando de fondo. Sin caché: espera la red; si tampoco
      // hay red, no hay nada que mostrar para ese recurso puntual.
      return cached || network;
    })
  );
});

// v58: أزرار إشعار الأذان (إيقاف / تذكير بعد ١٥ دقيقة) — تُمرَّر للتطبيق
self.addEventListener('notificationclick', (event) => {
  const action = event.action || '';
  const tag = (event.notification && event.notification.tag) || '';
  try { event.notification.close(); } catch (e) {}
  if (action !== 'stop' && action !== 'snooze') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
      cs.forEach(c => { try { c.postMessage({ type: 'quba-notif-action', action, tag }); } catch (e) {} });
      if (cs[0] && cs[0].focus) return cs[0].focus();
    })
  );
});
