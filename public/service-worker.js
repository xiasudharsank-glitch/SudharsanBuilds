// =====================================================
// SERVICE WORKER - Offline Support & Asset Caching
// =====================================================

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `portfolio-cache-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  // Add more static assets as needed
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// =====================================================
// INSTALL EVENT - Cache static assets
// =====================================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// =====================================================
// ACTIVATE EVENT - Clean up old caches
// =====================================================

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('portfolio-cache-') && name !== CACHE_NAME)
            .map(name => {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// =====================================================
// FETCH EVENT - Intercept and cache requests
// =====================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) URLs
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request type
  const strategy = getCacheStrategy(url, request);

  event.respondWith(
    handleRequest(request, strategy)
      .catch(error => {
        console.error('[Service Worker] Fetch failed:', error);

        // Return offline fallback if available
        return caches.match('/offline.html')
          .then(response => response || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          }));
      })
  );
});

// =====================================================
// CACHE STRATEGY HANDLERS
// =====================================================

/**
 * Determine which cache strategy to use
 */
function getCacheStrategy(url, request) {
  // API requests - Network First (fresh data preferred)
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Static assets (JS, CSS, images) - Cache First (performance)
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font') {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // HTML pages - Stale While Revalidate (show cached, update in background)
  if (request.destination === 'document') {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }

  // Default - Network First
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * Handle request based on strategy
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);

    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);

    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request);

    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);

    default:
      return networkFirst(request);
  }
}

/**
 * Cache First - Return cached response, fallback to network
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  // Cache successful responses
  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}

/**
 * Network First - Try network, fallback to cache
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Stale While Revalidate - Return cache immediately, update in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch and update cache in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached version immediately if available
  return cached || fetchPromise;
}

/**
 * Cache Only - Only return cached responses
 */
async function cacheOnly(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (!cached) {
    throw new Error('No cached response available');
  }

  return cached;
}

// =====================================================
// MESSAGE EVENT - Handle messages from clients
// =====================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;

      case 'CLAIM_CLIENTS':
        self.clients.claim();
        break;

      case 'CLEAR_CACHE':
        event.waitUntil(
          caches.delete(CACHE_NAME)
            .then(() => {
              console.log('[Service Worker] Cache cleared');
              return self.clients.matchAll();
            })
            .then(clients => {
              clients.forEach(client => {
                client.postMessage({ type: 'CACHE_CLEARED' });
              });
            })
        );
        break;

      case 'CACHE_URLS':
        if (event.data.urls && Array.isArray(event.data.urls)) {
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.addAll(event.data.urls))
              .then(() => {
                console.log('[Service Worker] URLs cached');
              })
          );
        }
        break;

      default:
        console.log('[Service Worker] Unknown message type:', event.data.type);
    }
  }
});

// =====================================================
// BACKGROUND SYNC (if supported)
// =====================================================

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync any queued analytics data when back online
  console.log('[Service Worker] Syncing analytics...');
  // Implementation depends on your analytics strategy
}

// =====================================================
// PUSH NOTIFICATIONS (if supported)
// =====================================================

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Portfolio Update', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});
