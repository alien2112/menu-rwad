/**
 * Cache Invalidation Utilities
 *
 * Use these functions to clear client-side localStorage cache
 * when admin makes changes that should reflect on the public menu.
 */

export const CACHE_KEYS = {
  MENU_ITEMS: 'menu_items_cache_v1',
  MENU_CATEGORIES: 'menu_categories_cache_v1',
  INGREDIENTS: 'ingredients_cache_v1',
  MODIFIERS: 'modifiers_cache_v1',
  OFFERS: 'offers_cache_v1',
  PROMOTIONS: 'promotions_cache_v1',
};

/**
 * Clear all menu-related cache
 */
export function clearAllMenuCache() {
  if (typeof window === 'undefined') return;

  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('🗑️ All menu cache cleared');
}

/**
 * Clear specific cache by key
 */
export function clearCache(cacheKey: string) {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(cacheKey);
  console.log(`🗑️ Cache cleared: ${cacheKey}`);
}

/**
 * Clear cache for menu items and categories
 * Use this when items or categories are modified
 */
export function clearMenuDataCache() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(CACHE_KEYS.MENU_ITEMS);
  localStorage.removeItem(CACHE_KEYS.MENU_CATEGORIES);

  console.log('🗑️ Menu items and categories cache cleared');
}

/**
 * Clear cache by pattern
 */
export function clearCachePattern(pattern: string) {
  if (typeof window === 'undefined') return;

  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(pattern)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));

  if (keysToRemove.length > 0) {
    console.log(`🗑️ Cleared ${keysToRemove.length} cache entries matching "${pattern}"`);
  }
}
