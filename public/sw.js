const CACHE_NAME = 'checklist-app-v2';
const urlsToCache = ['/', '/evaluation', '/reports', '/manifest.json'];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - network first for Next.js chunks, cache for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache Next.js chunks - they have hashes and should always be fresh
  // This includes _next/static files which change with each build
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/chunks/') ||
    url.pathname.includes('/_next/')
  ) {
    // Network only for Next.js chunks - don't cache at all
    event.respondWith(fetch(event.request));
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});
