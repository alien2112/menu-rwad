import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  ts: number;
  items: T;
}

interface UseClientCacheOptions<T> {
  cacheKey: string;
  cacheTTL?: number; // in milliseconds
  fetchFn: () => Promise<T>;
  enabled?: boolean;
}

interface UseClientCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Custom hook for client-side caching with localStorage
 * Automatically handles cache invalidation and refetching
 */
export function useClientCache<T>({
  cacheKey,
  cacheTTL = 600000, // Default 10 minutes
  fetchFn,
  enabled = true,
}: UseClientCacheOptions<T>): UseClientCacheResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(cacheKey);
    }
  }, [cacheKey]);

  const fetchData = useCallback(
    async (skipCache: boolean = false) => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try cache first (unless skipping)
        if (!skipCache && typeof window !== 'undefined') {
          const cachedRaw = localStorage.getItem(cacheKey);
          if (cachedRaw) {
            try {
              const cached = JSON.parse(cachedRaw) as CacheEntry<T>;
              const now = Date.now();

              // Check if cache is still valid
              if (
                cached &&
                cached.items !== undefined &&
                now - cached.ts < cacheTTL
              ) {
                setData(cached.items);
                setLoading(false);
                return;
              }
            } catch (e) {
              // Invalid cache, clear and continue
              localStorage.removeItem(cacheKey);
            }
          }
        }

        // Fetch fresh data
        const result = await fetchFn();
        setData(result);

        // Cache the result
        if (typeof window !== 'undefined') {
          try {
            const cacheEntry: CacheEntry<T> = {
              ts: Date.now(),
              items: result,
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
    },
    [cacheKey, cacheTTL, enabled, fetchFn]
  );

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch, clearCache };
}

/**
 * Listen for storage events to sync cache across tabs
 */
export function useCacheSyncAcrossTabs(cacheKey: string, onCacheCleared: () => void) {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === cacheKey && e.newValue === null) {
        // Cache was cleared in another tab
        onCacheCleared();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [cacheKey, onCacheCleared]);
}
