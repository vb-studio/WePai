/* =========================================================
   WePai — Service Worker
   Caching strategy: Cache First for assets, Network First for HTML
   ========================================================= */

const CACHE_NAME    = 'wepai-v1';
const ASSETS_CACHE  = 'wepai-assets-v1';

// Files to pre-cache on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/state.js',
    '/js/utils.js',
    '/js/modal.js',
    '/js/navigation.js',
    '/js/screens/dashboard.js',
    '/js/screens/registro.js',
    '/js/screens/rutinas.js',
    '/js/screens/perfil.js',
    '/js/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// ---------- Install: Pre-cache shell ----------
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// ---------- Activate: Clean old caches ----------
self.addEventListener('activate', (event) => {
    const VALID_CACHES = [CACHE_NAME, ASSETS_CACHE];
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => !VALID_CACHES.includes(key))
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// ---------- Fetch: Stale-While-Revalidate ----------
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET and cross-origin requests
    if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

    // For navigation requests: Network first, fallback to cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => caches.match('/index.html'))
        );
        return;
    }

    // For assets: Cache first, then network
    event.respondWith(
        caches.match(request).then(cached => {
            const fetchPromise = fetch(request).then(response => {
                if (response && response.status === 200) {
                    const cloned = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
                }
                return response;
            });
            return cached || fetchPromise;
        })
    );
});
