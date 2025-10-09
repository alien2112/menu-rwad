"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, List, Grid3X3 } from "lucide-react";
import { CartIcon, CartModal } from "@/components/CartComponents";
import { RestaurantMenuHeader } from "@/components/RestaurantMenuHeader";
import { CategoriesSection } from "@/components/CategoriesSection";
import { MenuItemsList } from "@/components/MenuItemsList";
import { MenuPageSkeleton } from "@/components/SkeletonLoader";
import { SearchBar } from "@/components/SearchBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useCart } from "@/contexts/CartContext";
import { useCachedFetch } from "@/hooks/useCachedFetch";
import { motion } from "framer-motion";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PageBackground {
  _id: string;
  pageRoute: string;
  pageName: string;
  backgroundImageId?: string;
  backgroundImageUrl?: string;
  status: 'active' | 'inactive';
}

interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  image?: string;
  icon?: string;
  color: string;
  order: number;
  status: 'active' | 'inactive';
}

interface MenuItem {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  calories?: number;
  categoryId: string;
  status: 'active' | 'inactive';
}


// No static fallback; will use cache or fetch

export default function Menu() {
  const router = useRouter();
  const { dispatch } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [hero, setHero] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Use cached fetch for categories
  const { 
    data: categoriesData, 
    loading: categoriesLoading, 
    error: categoriesError,
    isCached: categoriesCached 
  } = useCachedFetch<Category[]>('/api/categories', {
    cacheKey: 'menu_categories_cache_v1',
    cacheTTL: 10 * 60 * 1000 // 10 minutes
  });

  // Use cached fetch for menu items
  const { 
    data: itemsData, 
    loading: itemsLoading, 
    error: itemsError,
    isCached: itemsCached 
  } = useCachedFetch<MenuItem[]>('/api/items', {
    cacheKey: 'menu_items_cache_v1',
    cacheTTL: 10 * 60 * 1000 // 10 minutes
  });

  // Process categories data
  const categories = categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0
    ? categoriesData
        .filter((category: Category) => category.status === 'active')
        .sort((a: Category, b: Category) => a.order - b.order)
    : [];

  // Process menu items data
  const menuItems = itemsData && Array.isArray(itemsData) && itemsData.length > 0
    ? itemsData
    : [];

  // Overall loading state
  const loading = categoriesLoading || itemsLoading;

  // Log cache status for debugging
  useEffect(() => {
    console.log('Categories data:', categoriesData);
    console.log('Items data:', itemsData);
    console.log('Categories length:', categories.length);
    console.log('Menu items length:', menuItems.length);
    
    if (categoriesCached) {
      console.log('Categories loaded from cache');
    }
    if (itemsCached) {
      console.log('Menu items loaded from cache');
    }
  }, [categoriesCached, itemsCached, categoriesData, itemsData, categories.length, menuItems.length]);

  useEffect(() => {
    // Fetch background asynchronously without blocking main content
    const fetchBackground = async () => {
      try {
        const response = await fetch('/api/page-backgrounds');
        const data = await response.json();
        if (data.success) {
          const normalize = (r?: string) => {
            if (!r) return '';
            let out = r.toLowerCase();
            if (!out.startsWith('/')) out = `/${out}`;
            out = out.replace(/\/+$/, '');
            return out;
          };
          const target = normalize('/menu');
          const bg = data.data.find((b: PageBackground) => normalize(b.pageRoute) === target && b.status === 'active');
          setPageBackground(bg || null);
        }
      } catch (e) {
        console.error('Failed to fetch page background for /menu', e);
      }
    };
    const fetchHero = async () => {
      try {
        const response = await fetch('/api/page-hero?pageRoute=/menu');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const active = data.data.find((h: any) => h.status === 'active');
          setHero(active || null);
        }
      } catch (e) {
        console.error('Failed to fetch page hero for /menu', e);
      }
    };

    // Don't block main content loading
    fetchBackground();
    fetchHero();
  }, []);

  const getBackgroundImage = () => {
    if (pageBackground?.backgroundImageId) {
      return `/api/images/${pageBackground.backgroundImageId}`;
    }
    if (pageBackground?.backgroundImageUrl) {
      return pageBackground.backgroundImageUrl;
    }
    return undefined;
  };

  const handleCategoryClick = (categoryId: string) => {
    console.log('Category clicked:', categoryId);
    console.log('Available categories:', categories.map(c => ({ id: c._id, name: c.name })));
    console.log('Available menu items:', menuItems.map(m => ({ id: m._id, name: m.name, categoryId: m.categoryId })));
    
    if (categoryId === 'all') {
      setSelectedCategory(null);
    } else if (categoryId === 'offers') {
      setSelectedCategory('offers');
    } else {
      setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    }
  };

  const handleItemClick = (itemId: string) => {
    const item = menuItems.find(item => item._id === itemId);
    if (item) {
      const actualPrice = item.discountPrice && item.discountPrice < item.price
        ? item.discountPrice
        : item.price;
        
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: item._id,
          name: item.name,
          nameEn: item.nameEn,
          price: actualPrice,
          image: item.image,
        }
      });
    }
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Clear category selection when searching
    if (query.trim()) {
      setSelectedCategory(null);
    }
  };

  const backgroundImageUrl = getBackgroundImage();
  
  // Filter menu items by selected category and search query
  const filteredMenuItems = (() => {
    let items = menuItems;
    
    // Filter by category if selected
    if (selectedCategory && selectedCategory !== 'offers') {
      items = items.filter(item => item.categoryId === selectedCategory);
    }
    
    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    return items;
  })();

  // Calculate offers count
  const offersCount = menuItems.filter(item => item.discountPrice && item.discountPrice < item.price).length;

  console.log('Selected category:', selectedCategory);
  console.log('All menu items:', menuItems.length);
  console.log('Filtered menu items:', filteredMenuItems.length);
  console.log('Filtered items:', filteredMenuItems);

  return (
    <div
      className="min-h-screen relative overflow-hidden font-['Tajawal'] bg-background"
      dir="rtl"
      style={
        backgroundImageUrl
          ? {
              backgroundImage: `url('${backgroundImageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {}
      }
    >
      {/* Light overlay for background images */}
      {backgroundImageUrl && <div className="absolute inset-0 bg-black/20 z-0" />}

      {loading ? (
        <MenuPageSkeleton />
      ) : categoriesError || itemsError ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-foreground">
            <h2 className="text-xl font-bold mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-foreground/70 mb-4">
              {categoriesError ? 'فشل في تحميل الفئات' : 'فشل في تحميل عناصر القائمة'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full hover:bg-secondary/90 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      ) : (
        <ErrorBoundary>
          <motion.div
            className="relative z-10 min-h-screen pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Header */}
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <RestaurantMenuHeader hero={hero || undefined} />
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
            >
              <SearchBar onSearch={handleSearch} />
            </motion.div>

            {/* Categories Section */}
            <motion.div
              key={selectedCategory ?? 'all'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
            >
              <CategoriesSection
                categories={categories}
                onCategoryClick={handleCategoryClick}
                selectedCategory={selectedCategory}
                offersCount={offersCount}
              />
            </motion.div>

            {/* View Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              className="px-4 mb-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-foreground/70 text-sm">عرض:</span>
                  <div className="flex bg-white/10 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'list'
                          ? 'bg-white/20 text-foreground'
                          : 'text-foreground/60 hover:text-foreground/80'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      قائمة
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white/20 text-foreground'
                          : 'text-foreground/60 hover:text-foreground/80'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      شبكة
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Menu Items */}
            <motion.div
              key={`${selectedCategory ?? 'all'}-${searchQuery}-${viewMode}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
            >
              <MenuItemsList
                items={filteredMenuItems}
                onAddToCart={handleItemClick}
                categories={categories}
                showGrouped={selectedCategory === null && !searchQuery.trim()}
                selectedCategory={selectedCategory}
                viewMode={viewMode}
              />
            </motion.div>
          </motion.div>
        </ErrorBoundary>
      )}

      {/* Unified Cart Components */}
      <div className="fixed top-6 right-6 z-40">
        <CartIcon />
      </div>
      <CartModal />

    </div>
  );
}
