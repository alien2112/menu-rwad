/**
 * Client-side cache invalidation utility
 * Works with localStorage-based cache from useCachedFetch hook
 */

/**
 * Clear all client-side cache entries matching a pattern
 */
export function invalidateClientCache(pattern?: string): void {
  if (typeof window === 'undefined') return;

  if (!pattern) {
    // Clear all cache entries (nuclear option)
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache:')) {
        localStorage.removeItem(key);
      }
    });
    return;
  }

  // Clear specific pattern
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes(pattern)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Predefined cache invalidation functions for different data types
 */
export const ClientCacheInvalidation = {
  /**
   * Invalidate all category caches
   */
  categories: () => {
    invalidateClientCache('cache:categories');
  },

  /**
   * Invalidate all menu item caches
   */
  items: () => {
    invalidateClientCache('cache:items');
    invalidateClientCache('cache:menu-items');
  },

  /**
   * Invalidate all signature drinks/homepage caches
   */
  signatureDrinks: () => {
    invalidateClientCache('cache:signature-drinks');
    invalidateClientCache('cache:homepage');
  },

  /**
   * Invalidate all offers caches
   */
  offers: () => {
    invalidateClientCache('cache:offers');
  },

  /**
   * Invalidate all reviews caches
   */
  reviews: () => {
    invalidateClientCache('cache:reviews');
  },

  /**
   * Invalidate all menu-item reviews caches
   */
  menuItemReviews: () => {
    invalidateClientCache('cache:menu-item-reviews');
  },

  /**
   * Invalidate all locations caches
   */
  locations: () => {
    invalidateClientCache('cache:locations');
  },

  /**
   * Invalidate all ingredients caches
   */
  ingredients: () => {
    invalidateClientCache('cache:ingredients');
  },

  /**
   * Invalidate all page backgrounds caches
   */
  pageBackgrounds: () => {
    invalidateClientCache('cache:page-backgrounds');
  },

  /**
   * Clear all caches
   */
  all: () => {
    invalidateClientCache();
  },
};
