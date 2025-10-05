// Clear localStorage cache for testing
// Run this in browser console to clear cache

const cacheKeys = [
  'menu_categories_cache_v1',
  'menu_items_cache_v1',
  'home_featured_categories_cache_v1'
];

cacheKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`Cleared cache: ${key}`);
});

console.log('All cache cleared! Refresh the page to test fresh data loading.');
