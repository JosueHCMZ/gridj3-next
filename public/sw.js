/* GridJ3 · service worker: la app y el generador de PDF funcionan sin internet.
   - /_next/static/*: caché primero (los nombres llevan hash, nunca cambian).
   - Páginas: red primero, caché si no hay conexión.
   - Resto (logos, íconos, manifest): caché y se refresca por detrás. */
const CACHE = 'gridj3-v1';
const PRECARGA = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png',
  '/logos/logo-mariano.webp', '/logos/logo-usac.webp', '/logos/logo-url.webp', '/logos/logo-uvg.webp'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECARGA)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return res;
    })));
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put('/', copia)); }
      return res;
    }).catch(() => caches.match('/')));
    return;
  }

  e.respondWith(caches.match(req).then((hit) => {
    const red = fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return res;
    }).catch(() => hit);
    return hit || red;
  }));
});
