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
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const CACHE_KEY = 'menu_categories_cache_v1';
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make API calls in parallel for faster loading
        const [categoriesResponse, itemsResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/items')
        ]);

        // Process categories
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success && categoriesData.data.length > 0) {
          const activeCategories = categoriesData.data
            .filter((category: Category) => category.status === 'active')
            .sort((a: Category, b: Category) => a.order - b.order);
          
          console.log('Fetched categories:', activeCategories);
          setCategories(activeCategories);
        } else {
          console.log('No categories found or API error:', categoriesData);
        }
        setCategoriesLoaded(true);

        // Process menu items
        const itemsData = await itemsResponse.json();
        console.log('Raw API response:', itemsData);
        
        if (itemsData.success && itemsData.data.length > 0) {
          const allItems = itemsData.data;
          console.log('All items (no status filter):', allItems);
          setMenuItems(allItems);
        } else {
          console.log('No menu items found or API error:', itemsData);
        }
        setItemsLoaded(true);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    
    // Don't block main content loading
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
    } else if (categoryId === 'offers') {
      setSelectedCategory('offers');
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

      {!categoriesLoaded || !itemsLoaded ? (
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
              offersCount={offersCount}
            />

            {/* Menu Items */}
            <MenuItemsList
              items={filteredMenuItems}
              onAddToCart={handleItemClick}
              categories={categories}
              showGrouped={selectedCategory === null && !searchQuery.trim()}
              selectedCategory={selectedCategory}
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
