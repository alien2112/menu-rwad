import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseCachedFetchOptions {
  cacheKey: string;
  cacheTTL?: number; // in milliseconds
  enabled?: boolean;
  pollingInterval?: number; // in milliseconds, 0 to disable polling
}

interface UseCachedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isCached: boolean;
}

/**
 * Custom hook for fetching data with client-side caching
 * Uses localStorage for persistence across sessions
 */
export function useCachedFetch<T>(
  url: string,
  options: UseCachedFetchOptions
): UseCachedFetchResult<T> {
  const { cacheKey, cacheTTL = 600000, enabled = true, pollingInterval = 0 } = options; // Default 10 minutes

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  const fetchData = useCallback(async (skipCache: boolean = false) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to get from cache first
      if (!skipCache && typeof window !== 'undefined') {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw) as CacheEntry<T>;
            const now = Date.now();

            // Check if cache is still valid
            if (cached.timestamp && now - cached.timestamp < cacheTTL) {
              setData(cached.data);
              setIsCached(true);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Invalid cache, continue to fetch
            localStorage.removeItem(cacheKey);
          }
        }
      }

      // Fetch from API
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const fetchedData = result.data || result;

      setData(fetchedData);
      setIsCached(false);

      // Cache the result
      if (typeof window !== 'undefined') {
        try {
          const cacheEntry: CacheEntry<T> = {
            data: fetchedData,
            timestamp: Date.now(),
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
        } catch (e) {
          console.warn('Failed to cache data:', e);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, cacheTTL, enabled]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up polling if enabled
  useEffect(() => {
    if (!enabled || pollingInterval <= 0) return;

    const interval = setInterval(() => {
      // Silently refetch in background without showing loading state
      fetchData(true);
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enabled, pollingInterval, fetchData]);

  return { data, loading, error, refetch, isCached };
}

/**
 * Clear specific cache entry
 */
export function clearCache(cacheKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(cacheKey);
  }
}

/**
 * Clear all cache entries matching a pattern
 */
export function clearCachePattern(pattern: string): void {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    });
  }
}
