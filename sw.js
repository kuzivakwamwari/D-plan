/**
 * sw.js — Service Worker
 * ───────────────────────
 * Strategy: Cache-first for static assets, Network-first for HTML pages.
 * This lets you test offline/caching behaviour across all pages.
 */

const CACHE_NAME    = 'pwa-app-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './contacts.html',
  './profile.html',
  './style.css',
  './db.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Google Fonts — cached on first visit
];

// ── Install: pre-cache all static assets ────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing and pre-caching assets...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => {
        console.log('[SW] Pre-cache complete');
        self.skipWaiting();
      })
  );
});

// ── Activate: remove old caches ─────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: smart routing strategy ───────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) return;

  // HTML pages → Network-first (show latest, fall back to cache)
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else → Cache-first (fast, serve offline)
  event.respondWith(cacheFirst(request));
});

// ── Strategy: Network-first ──────────────────────────────────────
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    console.log('[SW] Network failed, serving from cache:', request.url);
    const cached = await cache.match(request);
    return cached || cache.match('./index.html'); // fallback
  }
}

// ── Strategy: Cache-first ────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    console.log('[SW] Serving from cache:', request.url);
    return cached;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    console.log('[SW] Both cache and network failed for:', request.url);
    return new Response('Offline and not cached.', { status: 503 });
  }
}

// ── Message: force cache refresh ─────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'GET_CACHE_LIST') {
    caches.open(CACHE_NAME).then(cache =>
      cache.keys().then(keys => {
        event.source.postMessage({
          type: 'CACHE_LIST',
          urls: keys.map(r => r.url)
        });
      })
    );
  }
});
