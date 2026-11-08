/**
 * HabitFlow production Service Worker.
 *
 * Caching strategy:
 *  - Navigation requests (HTML): NETWORK-FIRST. The cached app shell is only
 *    used when the network is unavailable, so an online refresh always gets the
 *    latest index.html and never replays a stale document that references
 *    deleted JS chunks.
 *  - Immutable hashed assets under /assets/: CACHE-FIRST. Vite fingerprints
 *    these filenames, so a cache hit is always byte-identical to the network
 *    version.
 *  - Other same-origin GETs (manifest, icons, fonts): network-first with a cache
 *    fallback (stale-while-revalidate).
 *
 * Only HabitFlow-owned caches (habitflow-cache-*) are ever created or deleted.
 * The cache namespace is versioned; obsolete HabitFlow versions are purged on
 * activation. skipWaiting/clients.claim are intentionally NOT used so an update
 * activates on the next natural navigation, preventing an old page from being
 * mixed with a new worker's caches.
 */

const CACHE_NAME = 'habitflow-cache-v5';
const CACHE_PREFIX = 'habitflow-cache';
const ASSETS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(ASSETS_TO_PRECACHE).catch((err) => {
          console.warn('HabitFlow SW pre-cache partial failure, continuing:', err);
        })
      )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          // Only touch HabitFlow-owned caches, and only obsolete versions.
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests; let cross-origin (e.g. CDNs) pass through.
  if (url.origin !== self.location.origin) return;

  // Navigation (HTML documents): network-first, offline fallback to app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Immutable hashed assets: cache-first, then network (cache successful hits).
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Other same-origin GETs: network-first with cache fallback (SWR).
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Notification click: focus an existing window or open the app root.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
