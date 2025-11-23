// Improved service worker for offline support and API passthrough
const CACHE_NAME = 'healthai-cache-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches if necessary in future versions
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))))
  );
  self.clients.claim();
});

// Helper: determine if request is for API/back-end (do not cache API responses)
function isApiRequest(request) {
  try {
    const url = new URL(request.url);
    // treat requests to paths that contain '/api/' as API calls
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/') || url.pathname.startsWith('/admin/')) return true;
    // also consider cross-origin backend tunnels (heuristic: contains 'healthai-back' or 'localhost:8080' or port 8080)
    if (url.hostname.includes('healthai-back') || url.port === '8080') return true;
    return false;
  } catch (e) {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Do not intercept API/auth/admin requests — let them go to network
  if (isApiRequest(event.request)) {
    return; // no respondWith -> network handles it
  }

  // For navigation requests (SPA routes), try network first, fallback to cached index.html/offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update cache for navigation responses (index.html)
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/offline.html')))
    );
    return;
  }

  // For other GET requests (static assets), try cache, then network, then offline fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // cache fetched static resources for future offline use
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, cloned);
            } catch (e) {
              // ignore put errors
            }
          });
          return response;
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});
