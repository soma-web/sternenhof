// Service Worker: Netzwerk zuerst, Cache als Offline-Rückfall.
const CACHE = 'sternenhof-v5';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'css/style.css',
  'js/main.js', 'js/state.js', 'js/ui.js', 'js/audio.js', 'js/syllables.js', 'js/horse.js',
  'js/scenes.js', 'js/care.js', 'js/math.js', 'js/reading.js', 'js/story.js', 'js/hub.js',
  'js/chapters.js', 'js/adventure.js', 'js/dressup.js', 'js/looks.js',
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
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
