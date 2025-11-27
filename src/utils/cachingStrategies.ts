// =====================================================
// CACHING STRATEGIES
// localStorage, sessionStorage, Cache API, IndexedDB
// =====================================================

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  version?: string; // Cache version for invalidation
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
  ttl?: number;
}

// =====================================================
// LOCAL STORAGE CACHE
// =====================================================

/**
 * Store data in localStorage with TTL
 */
export function setLocalCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void {
  const { ttl, version = '1.0.0' } = options;

  const cachedData: CachedData<T> = {
    data,
    timestamp: Date.now(),
    version,
    ttl
  };

  try {
    localStorage.setItem(key, JSON.stringify(cachedData));
  } catch (error) {
    console.error('Error setting localStorage cache:', error);
    // Handle quota exceeded - clear old items
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCacheItems();
      // Retry
      try {
        localStorage.setItem(key, JSON.stringify(cachedData));
      } catch (retryError) {
        console.error('Failed to cache after cleanup:', retryError);
      }
    }
  }
}

/**
 * Get data from localStorage cache
 */
export function getLocalCache<T>(
  key: string,
  currentVersion: string = '1.0.0'
): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cachedData: CachedData<T> = JSON.parse(cached);

    // Check version
    if (cachedData.version !== currentVersion) {
      localStorage.removeItem(key);
      return null;
    }

    // Check TTL
    if (cachedData.ttl) {
      const age = Date.now() - cachedData.timestamp;
      if (age > cachedData.ttl) {
        localStorage.removeItem(key);
        return null;
      }
    }

    return cachedData.data;
  } catch (error) {
    console.error('Error getting localStorage cache:', error);
    return null;
  }
}

/**
 * Clear old cache items based on timestamp
 */
function clearOldCacheItems() {
  const items: Array<{ key: string; timestamp: number }> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      if (data.timestamp) {
        items.push({ key, timestamp: data.timestamp });
      }
    } catch (e) {
      // Skip invalid items
    }
  }

  // Sort by timestamp and remove oldest 25%
  items.sort((a, b) => a.timestamp - b.timestamp);
  const toRemove = Math.ceil(items.length * 0.25);

  for (let i = 0; i < toRemove; i++) {
    localStorage.removeItem(items[i].key);
  }
}

/**
 * Clear all cache items with a specific prefix
 */
export function clearCacheByPrefix(prefix: string) {
  const keys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }

  keys.forEach(key => localStorage.removeItem(key));
}

// =====================================================
// SESSION STORAGE CACHE
// =====================================================

/**
 * Store data in sessionStorage (cleared on tab close)
 */
export function setSessionCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting sessionStorage cache:', error);
  }
}

/**
 * Get data from sessionStorage
 */
export function getSessionCache<T>(key: string): T | null {
  try {
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error getting sessionStorage cache:', error);
    return null;
  }
}

// =====================================================
// CACHE API (Service Worker)
// =====================================================

const CACHE_NAME = 'portfolio-cache-v1';

/**
 * Cache assets using Cache API
 */
export async function cacheAssets(urls: string[]): Promise<void> {
  if (!('caches' in window)) {
    console.warn('Cache API not supported');
    return;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
  } catch (error) {
    console.error('Error caching assets:', error);
  }
}

/**
 * Get cached response or fetch from network
 */
export async function getCachedOrFetch(url: string): Promise<Response> {
  if (!('caches' in window)) {
    return fetch(url);
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);

    if (cached) {
      return cached;
    }

    const response = await fetch(url);

    // Cache successful responses
    if (response.ok) {
      cache.put(url, response.clone());
    }

    return response;
  } catch (error) {
    console.error('Error in getCachedOrFetch:', error);
    return fetch(url);
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) return;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
}

/**
 * Update cache and return fresh data
 */
export async function updateCache(url: string): Promise<Response> {
  if (!('caches' in window)) {
    return fetch(url);
  }

  try {
    const response = await fetch(url);
    const cache = await caches.open(CACHE_NAME);

    if (response.ok) {
      cache.put(url, response.clone());
    }

    return response;
  } catch (error) {
    console.error('Error updating cache:', error);
    throw error;
  }
}

// =====================================================
// INDEXEDDB CACHE (for large data)
// =====================================================

const DB_NAME = 'portfolio-db';
const STORE_NAME = 'cache-store';

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Store large data in IndexedDB
 */
export async function setIndexedDBCache<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      version: '1.0.0'
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cachedData, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error setting IndexedDB cache:', error);
  }
}

/**
 * Get data from IndexedDB
 */
export async function getIndexedDBCache<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => {
        const cachedData: CachedData<T> | undefined = request.result;
        resolve(cachedData ? cachedData.data : null);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting IndexedDB cache:', error);
    return null;
  }
}

/**
 * Clear all IndexedDB data
 */
export async function clearIndexedDBCache(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing IndexedDB cache:', error);
  }
}

// =====================================================
// API RESPONSE CACHE WITH AUTOMATIC INVALIDATION
// =====================================================

export interface APICache {
  get<T>(url: string): Promise<T | null>;
  set<T>(url: string, data: T, ttl?: number): Promise<void>;
  invalidate(url: string): void;
  invalidateAll(): void;
}

export function createAPICache(defaultTTL: number = 5 * 60 * 1000): APICache {
  const prefix = 'api-cache:';

  return {
    async get<T>(url: string): Promise<T | null> {
      return getLocalCache<T>(prefix + url);
    },

    async set<T>(url: string, data: T, ttl?: number): Promise<void> {
      setLocalCache(prefix + url, data, { ttl: ttl || defaultTTL });
    },

    invalidate(url: string): void {
      localStorage.removeItem(prefix + url);
    },

    invalidateAll(): void {
      clearCacheByPrefix(prefix);
    }
  };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get cache statistics
 */
export function getCacheStats() {
  let localStorageSize = 0;
  let sessionStorageSize = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      localStorageSize += localStorage.getItem(key)?.length || 0;
    }
  }

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      sessionStorageSize += sessionStorage.getItem(key)?.length || 0;
    }
  }

  return {
    localStorageSize: (localStorageSize / 1024).toFixed(2) + ' KB',
    localStorageItems: localStorage.length,
    sessionStorageSize: (sessionStorageSize / 1024).toFixed(2) + ' KB',
    sessionStorageItems: sessionStorage.length
  };
}

/**
 * Estimate remaining storage quota
 */
export async function getStorageQuota(): Promise<{
  usage: number;
  quota: number;
  percent: number;
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percent = (usage / quota) * 100;

      return {
        usage: Math.round(usage / 1024 / 1024), // MB
        quota: Math.round(quota / 1024 / 1024), // MB
        percent: Math.round(percent)
      };
    } catch (error) {
      console.error('Error getting storage quota:', error);
      return null;
    }
  }

  return null;
}
