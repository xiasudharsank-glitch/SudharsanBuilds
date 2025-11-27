// =====================================================
// SERVICE WORKER REGISTRATION
// Register, update, and manage service worker lifecycle
// =====================================================

export interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported in this browser');
    return;
  }

  // Only register in production
  if (import.meta.env.DEV) {
    console.log('Service Worker registration skipped in development mode');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('Service Worker registered successfully:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('New service worker available');

          if (config.onUpdate) {
            config.onUpdate(registration);
          }
        }
      });
    });

    // Success callback
    if (config.onSuccess && registration.active) {
      config.onSuccess(registration);
    }

    // Setup offline/online listeners
    setupNetworkListeners(config);

  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();

    if (success) {
      console.log('Service Worker unregistered successfully');
    }

    return success;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Update service worker
 */
export async function updateServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('Service Worker update check triggered');
  } catch (error) {
    console.error('Service Worker update failed:', error);
  }
}

/**
 * Skip waiting and activate new service worker immediately
 */
export async function skipWaiting(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (registration.waiting) {
      // Send message to waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload page when new service worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  } catch (error) {
    console.error('Skip waiting failed:', error);
  }
}

/**
 * Clear service worker cache
 */
export async function clearServiceWorkerCache(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      console.log('Service Worker cache clear requested');
    }
  } catch (error) {
    console.error('Clear cache failed:', error);
  }
}

/**
 * Precache specific URLs
 */
export async function precacheUrls(urls: string[]): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (registration.active) {
      registration.active.postMessage({
        type: 'CACHE_URLS',
        urls
      });
      console.log('Precaching requested for', urls.length, 'URLs');
    }
  } catch (error) {
    console.error('Precache failed:', error);
  }
}

/**
 * Check if service worker is registered and active
 */
export async function isServiceWorkerActive(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return !!registration && !!registration.active;
  } catch (error) {
    console.error('Service Worker check failed:', error);
    return false;
  }
}

/**
 * Get service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.getRegistration();
  } catch (error) {
    console.error('Get registration failed:', error);
    return null;
  }
}

/**
 * Setup network online/offline listeners
 */
function setupNetworkListeners(config: ServiceWorkerConfig) {
  window.addEventListener('online', () => {
    console.log('Network: Online');
    if (config.onOnline) {
      config.onOnline();
    }
  });

  window.addEventListener('offline', () => {
    console.log('Network: Offline');
    if (config.onOffline) {
      config.onOffline();
    }
  });
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Wait for service worker to be ready
 */
export async function waitForServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Service Worker ready failed:', error);
    return null;
  }
}

/**
 * Setup service worker message listener
 */
export function onServiceWorkerMessage(
  callback: (event: MessageEvent) => void
): () => void {
  if (!('serviceWorker' in navigator)) {
    return () => {};
  }

  navigator.serviceWorker.addEventListener('message', callback);

  // Return cleanup function
  return () => {
    navigator.serviceWorker.removeEventListener('message', callback);
  };
}

/**
 * Request persistent storage permission
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator) || !('persist' in navigator.storage)) {
    console.warn('Persistent storage not supported');
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persisted();

    if (isPersisted) {
      console.log('Storage is already persisted');
      return true;
    }

    const granted = await navigator.storage.persist();

    if (granted) {
      console.log('Storage persistence granted');
    } else {
      console.log('Storage persistence denied');
    }

    return granted;
  } catch (error) {
    console.error('Request persistent storage failed:', error);
    return false;
  }
}
