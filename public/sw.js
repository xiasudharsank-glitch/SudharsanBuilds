// ✅ P1 FIX: Service Worker with proper versioning and update strategy
// Network-first for HTML, cache-first for assets

// ✅ P1 FIX: Use timestamp to force cache updates on deployment
const CACHE_VERSION = '2025-01-20-v1';
const CACHE_NAME = `sudharsanbuilds-${CACHE_VERSION}`;
const RUNTIME_CACHE = `sudharsanbuilds-runtime-${CACHE_VERSION}`;

// ✅ PRODUCTION: Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html', // ✅ PRODUCTION: Offline fallback page
];

// ✅ P1 FIX: Install event - Force immediate activation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting - activating immediately');
        return self.skipWaiting(); // Force activate immediately
      })
  );
});

// ✅ P1 FIX: Activate event - Clean old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete any cache that doesn't match current version
            return cacheName.startsWith('sudharsanbuilds-') &&
                   cacheName !== CACHE_NAME &&
                   cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim(); // Take control of all pages immediately
    })
  );
});

// ✅ P1 FIX: Fetch event - Network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  const isHTMLRequest = event.request.headers.get('accept')?.includes('text/html') ||
                        url.pathname.endsWith('.html') ||
                        url.pathname === '/';

  // ✅ P1 FIX: Network-first for HTML (ensures fresh content after deployment)
  if (isHTMLRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // ✅ PRODUCTION: Better offline fallback
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) return cachedResponse;
              // Show offline page for HTML requests
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // ✅ Cache-first for static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Fetch from network and cache
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
