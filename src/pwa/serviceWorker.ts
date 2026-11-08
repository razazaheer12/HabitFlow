/**
 * HabitFlow Service Worker lifecycle control.
 *
 * ROOT CAUSE OF THE STALE-DASHBOARD BUG:
 * The previous main.tsx registered `/sw.js` unconditionally — including under
 * `npm run dev`. That worker precached `/` + `/index.html` and used a
 * cache-first strategy for every non-navigation GET (which in dev includes
 * Vite's `/src/*.tsx` module URLs). Because those module URLs are stable across
 * edits but their contents change, the worker kept replaying the OLD compiled
 * modules on a normal refresh — so the pre-Phase-2.1 Today page (with the
 * heatmap + category breakdown) reappeared. A hard reload (Ctrl+Shift+R)
 * bypassed the worker/HTTP cache and fetched fresh modules, which is why it
 * "fixed" the view temporarily. React Router was NOT the cause.
 *
 * FIX: never register the production worker in development, actively remove any
 * leftover HabitFlow worker + caches in dev, and register normally in production
 * with a network-first navigation strategy and versioned caches.
 */

const CACHE_PREFIX = 'habitflow-cache';
const CLEANUP_FLAG = 'habitflow-dev-sw-cleanup';

/**
 * Removes ONLY HabitFlow-owned service worker registrations (the one served from
 * this origin's `/sw.js`) and ONLY `habitflow-cache-*` CacheStorage namespaces.
 * Unrelated workers/caches on the origin are never touched.
 * Returns true if anything was removed.
 */
async function cleanupStaleDevServiceWorker(): Promise<boolean> {
  let changed = false;

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      const sw = reg.active || reg.waiting || reg.installing;
      if (sw && sw.scriptURL.endsWith('/sw.js')) {
        await reg.unregister();
        changed = true;
      }
    }
  }

  if ('caches' in window) {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        await caches.delete(key);
        changed = true;
      }
    }
  }

  return changed;
}

export function initServiceWorker(): void {
  if (typeof window === 'undefined') return;

  // ---- DEVELOPMENT: no production worker; Vite network + HMR only ----
  if (import.meta.env.DEV) {
    if (!('serviceWorker' in navigator) && !('caches' in window)) return;

    cleanupStaleDevServiceWorker()
      .then((changed) => {
        // One-time guarded reload. If a stale worker/cache was removed and the
        // current document may have been served from it, reload once so the
        // network version takes over. The sessionStorage guard guarantees this
        // can never become an infinite reload loop.
        if (changed && !sessionStorage.getItem(CLEANUP_FLAG)) {
          sessionStorage.setItem(CLEANUP_FLAG, '1');
          window.location.reload();
        }
      })
      .catch((err) => console.warn('HabitFlow dev service-worker cleanup failed:', err));
    return;
  }

  // ---- PRODUCTION: register the worker with a conservative update lifecycle ----
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const hadController = Boolean(navigator.serviceWorker.controller);

    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        // Only auto-apply updates on a returning visit (a controller already
        // exists). This avoids a jarring reload on first load while still
        // picking up new versions — and prevents mixing an old page with a new
        // worker's caches, since the page reloads on controllerchange.
        if (hadController) {
          let reloaded = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (reloaded) return;
            reloaded = true;
            window.location.reload();
          });
        }
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          installing?.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('HabitFlow: an update is ready and will apply on reload.');
            }
          });
        });
      },
      (err) => console.warn('HabitFlow ServiceWorker registration failed:', err)
    );
  });
}
