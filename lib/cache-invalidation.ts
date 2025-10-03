import { revalidatePath, revalidateTag } from 'next/cache';
import { cache } from './cache';

/**
 * Centralized cache invalidation utility
 * Invalidates both server-side cache and Next.js cache
 */

export const CacheInvalidation = {
  /**
   * Invalidate all category-related caches
   */
  categories: () => {
    cache.delete('categories');
    cache.delete('categories:all');
    revalidatePath('/');
    revalidatePath('/menu');
    revalidateTag('categories');
  },

  /**
   * Invalidate all menu item-related caches
   */
  items: () => {
    cache.delete('items');
    cache.delete('items:all');
    // Clear category-specific item caches
    const keys = Array.from((cache as any).cache.keys());
    keys.forEach((key: string) => {
      if (key.startsWith('items:category:')) {
        cache.delete(key);
      }
    });
    revalidatePath('/');
    revalidatePath('/menu');
    revalidatePath('/category/[id]', 'page');
    revalidateTag('items');
    revalidateTag('menu-items');
  },

  /**
   * Invalidate all signature drinks/homepage-related caches
   */
  signatureDrinks: () => {
    cache.delete('signature-drinks');
    cache.delete('homepage');
    cache.delete('signature-drinks:all');
    revalidatePath('/');
    revalidateTag('signature-drinks');
    revalidateTag('homepage');
  },

  /**
   * Invalidate all offers-related caches
   */
  offers: () => {
    cache.delete('offers');
    cache.delete('offers:all');
    revalidatePath('/');
    revalidatePath('/offers');
    revalidateTag('offers');
  },

  /**
   * Invalidate all reviews-related caches
   */
  reviews: () => {
    cache.delete('reviews');
    cache.delete('reviews:all');
    cache.delete('reviews:approved');
    revalidatePath('/');
    revalidateTag('reviews');
  },

  /**
   * Invalidate all menu-item reviews-related caches
   */
  menuItemReviews: (itemId?: string) => {
    if (itemId) {
      cache.delete(`menu-item-reviews:${itemId}`);
    }
    cache.delete('menu-item-reviews:all');
    const keys = Array.from((cache as any).cache.keys());
    keys.forEach((key: string) => {
      if (key.startsWith('menu-item-reviews:')) {
        cache.delete(key);
      }
    });
    revalidatePath('/menu');
    revalidatePath('/category/[id]', 'page');
    revalidateTag('menu-item-reviews');
  },

  /**
   * Invalidate all locations-related caches
   */
  locations: () => {
    cache.delete('locations');
    cache.delete('locations:all');
    revalidatePath('/');
    revalidateTag('locations');
  },

  /**
   * Invalidate all ingredients-related caches
   */
  ingredients: () => {
    cache.delete('ingredients');
    cache.delete('ingredients:all');
    revalidatePath('/menu');
    revalidateTag('ingredients');
  },

  /**
   * Invalidate all page backgrounds-related caches
   */
  pageBackgrounds: () => {
    cache.delete('page-backgrounds');
    cache.delete('page-backgrounds:all');
    revalidatePath('/');
    revalidatePath('/menu');
    revalidatePath('/offers');
    revalidateTag('page-backgrounds');
  },

  /**
   * Clear all caches (nuclear option)
   */
  all: () => {
    cache.clear();
    revalidatePath('/', 'layout');
    revalidateTag('categories');
    revalidateTag('items');
    revalidateTag('menu-items');
    revalidateTag('signature-drinks');
    revalidateTag('homepage');
    revalidateTag('offers');
    revalidateTag('reviews');
    revalidateTag('menu-item-reviews');
    revalidateTag('locations');
    revalidateTag('ingredients');
    revalidateTag('page-backgrounds');
  },
};

/**
 * Returns no-cache headers for mutation responses
 */
export const noCacheHeaders = () => ({
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
});

/**
 * Returns cache headers based on admin mode
 */
export const getCacheHeaders = (isAdmin: boolean) => {
  if (isAdmin) {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }
  return {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  };
};
