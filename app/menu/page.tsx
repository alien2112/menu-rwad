"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { CartIcon, CartModal } from "@/components/CartComponents";
import { RestaurantMenuHeader } from "@/components/RestaurantMenuHeader";
import { CategoriesSection } from "@/components/CategoriesSection";
import { MenuItemsList } from "@/components/MenuItemsList";
import { MenuPageSkeleton } from "@/components/SkeletonLoader";
import { SearchBar } from "@/components/SearchBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useCart } from "@/contexts/CartContext";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const CACHE_KEY = 'menu_categories_cache_v1';
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories', { cache: 'no-store' });
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.success && categoriesData.data.length > 0) {
          const activeCategories = categoriesData.data
            .filter((category: Category) => category.status === 'active')
            .sort((a: Category, b: Category) => a.order - b.order);
          
          console.log('Fetched categories:', activeCategories);
          console.log('Category IDs:', activeCategories.map(c => ({ id: c._id, name: c.name })));
          setCategories(activeCategories);
        } else {
          console.log('No categories found or API error:', categoriesData);
        }

        // Fetch all menu items at once
        const itemsResponse = await fetch('/api/items', { cache: 'no-store' });
        const itemsData = await itemsResponse.json();
        
        console.log('Raw API response:', itemsData);
        
        if (itemsData.success && itemsData.data.length > 0) {
          // Process items from database - use real data only
          const allItems = itemsData.data;
          
          console.log('All items (no status filter):', allItems);
          console.log('Items with status active:', itemsData.data.filter((item: any) => item.status === 'active').length);
          console.log('Items with status inactive:', itemsData.data.filter((item: any) => item.status === 'inactive').length);
          console.log('Items with no status:', itemsData.data.filter((item: any) => !item.status).length);
          
          // Use all items for now to test
          setMenuItems(allItems);
        } else {
          console.log('No menu items found or API error:', itemsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const response = await fetch('/api/page-backgrounds', { cache: 'no-store' });
        const data = await response.json();
        console.log('[Menu BG] API response:', data);
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
          console.log('[Menu BG] target =', target, ' matched background =', bg);
          if (bg) {
            console.log('[Menu BG] backgroundImageId =', bg.backgroundImageId);
            console.log('[Menu BG] backgroundImageUrl =', bg.backgroundImageUrl);
          }
          setPageBackground(bg || null);
        }
      } catch (e) {
        console.error('Failed to fetch page background for /menu', e);
      }
    };
    fetchBackground();
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
    } else {
      setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    }
  };

  const handleItemClick = (itemId: string) => {
    const item = menuItems.find(item => item._id === itemId);
    if (item) {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: item._id,
          name: item.name,
          nameEn: item.nameEn,
          price: item.price,
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
    if (selectedCategory) {
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

  console.log('Selected category:', selectedCategory);
  console.log('All menu items:', menuItems.length);
  console.log('Filtered menu items:', filteredMenuItems.length);
  console.log('Filtered items:', filteredMenuItems);

  return (
    <div
      className="min-h-screen relative overflow-hidden font-['Tajawal']"
      dir="rtl"
      style={
        backgroundImageUrl
          ? {
              backgroundImage: `url('${backgroundImageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {
              background: 'linear-gradient(to bottom right, #4F3500, #3E2901, #2A1F00)',
            }
      }
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {loading ? (
        <MenuPageSkeleton />
      ) : (
        <ErrorBoundary>
          <div className="relative z-10 min-h-screen pb-24">
            {/* Header */}
            <RestaurantMenuHeader />

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Categories Section */}
            <CategoriesSection
              categories={categories}
              onCategoryClick={handleCategoryClick}
              selectedCategory={selectedCategory}
            />

            {/* Menu Items */}
            <MenuItemsList
              items={filteredMenuItems}
              onAddToCart={handleItemClick}
              categories={categories}
              showGrouped={selectedCategory === null && !searchQuery.trim()}
            />
          </div>
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
