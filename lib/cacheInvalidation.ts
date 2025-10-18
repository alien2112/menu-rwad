/**
 * Cache Invalidation Utilities
 *
 * Use these functions to clear client-side localStorage cache
 * when admin makes changes that should reflect on the public menu.
 *
 * Admin and public routes use SEPARATE cache keys to prevent interference.
 */

// Public menu cache keys (used by customers)
export const CACHE_KEYS = {
  MENU_ITEMS: 'public_menu_items_v1',
  MENU_CATEGORIES: 'public_menu_categories_v1',
  INGREDIENTS: 'public_ingredients_v1',
  MODIFIERS: 'public_modifiers_v1',
  OFFERS: 'public_offers_v1',
  PROMOTIONS: 'public_promotions_v1',
};

// Admin cache keys (completely separate from public)
export const ADMIN_CACHE_KEYS = {
  MENU_ITEMS: 'admin_menu_items_v1',
  MENU_CATEGORIES: 'admin_menu_categories_v1',
  INGREDIENTS: 'admin_ingredients_v1',
  MODIFIERS: 'admin_modifiers_v1',
  OFFERS: 'admin_offers_v1',
  PROMOTIONS: 'admin_promotions_v1',
  INVENTORY: 'admin_inventory_v1',
  MATERIALS: 'admin_materials_v1',
};

/**
 * Clear all PUBLIC menu-related cache
 * Use this in admin after making changes to invalidate customer cache
 */
export function clearAllMenuCache() {
  if (typeof window === 'undefined') return;

  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('🗑️ All PUBLIC menu cache cleared');
}

/**
 * Clear all ADMIN cache
 * Use this when admin data needs refresh
 */
export function clearAllAdminCache() {
  if (typeof window === 'undefined') return;

  Object.values(ADMIN_CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('🗑️ All ADMIN cache cleared');
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
