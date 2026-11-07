// Service Worker: Netzwerk zuerst, Cache als Offline-Rückfall.
const CACHE = 'sternenhof-v9';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'css/style.css',
  'js/main.js', 'js/state.js', 'js/ui.js', 'js/audio.js', 'js/syllables.js', 'js/horse.js',
  'js/scenes.js', 'js/care.js', 'js/math.js', 'js/reading.js', 'js/story.js', 'js/hub.js',
  'js/chapters.js', 'js/adventure.js', 'js/dressup.js', 'js/looks.js', 'js/tournament.js', 'js/stable.js', 'js/version.js', 'js/spelling.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Eigene Dateien immer beim Server nachfragen (no-cache = mit ETag prüfen, kein veralteter Zwischenspeicher)
  const own = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(
    fetch(e.request, own ? { cache: 'no-cache' } : undefined)
      .then((res) => {
        const copy = res.clone();
        if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
