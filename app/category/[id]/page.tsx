"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";
import { MenuItemCard } from "@/components/MenuItemCard";
import { MenuItemsSkeleton } from "@/components/SkeletonLoader";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  images?: string[];
  categoryId: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  ingredients?: { ingredientId: string; portion: number; required: boolean }[];
  calories?: number;
  preparationTime?: number;
  servingSize?: string;
  allergens?: string[];
  tags?: string[];
  color?: string;
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Ingredient {
  _id: string;
  name: string;
  color?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredientsMap, setIngredientsMap] = useState<Record<string, Ingredient>>({});
  const [loading, setLoading] = useState(true);
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // Fetch category details
        const categoryResponse = await fetch('/api/categories');
        const categoryData = await categoryResponse.json();
        
        if (categoryData.success && categoryData.data) {
          const foundCategory = categoryData.data.find((cat: Category) => 
            cat._id === categoryId || 
            cat.nameEn?.toLowerCase().replace(/\s+/g, '-') === categoryId
          );
          
          if (foundCategory) {
            setCategory(foundCategory);
          }
        }

        // Fetch menu items for this category
        const itemsResponse = await fetch('/api/items');
        const itemsData = await itemsResponse.json();
        
        if (itemsData.success && itemsData.data) {
          console.log('All items from API:', itemsData.data);
          console.log('Looking for categoryId:', categoryId);
          
          let categoryItems = itemsData.data.filter((item: MenuItem) => 
            item.categoryId === categoryId && item.status !== 'inactive'
          );
          
          console.log('Items matching categoryId:', categoryItems);
          
          // Special handling for offers category - show only items with discountPrice
          if (categoryId === '68dcc52cad46b03aff8a3cbb') {
            console.log('Filtering for offers category - items with discountPrice');
            const itemsWithDiscount = categoryItems.filter((item: MenuItem) => {
              console.log(`Item ${item.name}: discountPrice=${item.discountPrice}, price=${item.price}`);
              return item.discountPrice && item.discountPrice > 0;
            });
            console.log('Items with discountPrice:', itemsWithDiscount);
            
            // If no items found in this category, show all items with discountPrice
            if (itemsWithDiscount.length === 0) {
              console.log('No items with discountPrice in this category, showing all items with discountPrice');
              const allItemsWithDiscount = itemsData.data.filter((item: MenuItem) => 
                item.discountPrice && item.discountPrice > 0 && item.status !== 'inactive'
              );
              console.log('All items with discountPrice:', allItemsWithDiscount);
              categoryItems = allItemsWithDiscount;
            } else {
              categoryItems = itemsWithDiscount;
            }
          }
          
          console.log('Final category items:', categoryItems);
          setMenuItems(categoryItems);
        }

        // Fetch ingredients list and index by id for colors
        const ingResponse = await fetch('/api/ingredients');
        const ingData = await ingResponse.json();
        if (ingData.success && ingData.data) {
          const map: Record<string, Ingredient> = {};
          for (const ing of ingData.data as Ingredient[]) {
            map[ing._id] = ing;
          }
          setIngredientsMap(map);
        }
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const response = await fetch('/api/page-backgrounds', { cache: 'no-store' });
        const data = await response.json();
        console.log('[Category BG] API response:', data);
        if (data.success) {
          const slug = category?.nameEn?.toLowerCase().replace(/\s+/g, '-');
          const possibleRoutes = [
            `/category/${categoryId}`,
            slug ? `/category/${slug}` : undefined,
          ].filter(Boolean);
          console.log('[Category BG] categoryId =', categoryId);
          console.log('[Category BG] category name =', category?.name);
          console.log('[Category BG] possibleRoutes =', possibleRoutes);
          console.log('[Category BG] all backgrounds =', data.data.map((b: any) => ({ route: b.pageRoute, name: b.pageName, status: b.status })));
          const bg = data.data.find((b: PageBackground) => possibleRoutes.includes(b.pageRoute) && b.status === 'active');
          console.log('[Category BG] matched background =', bg);
          if (bg) {
            console.log('[Category BG] backgroundImageId =', bg.backgroundImageId);
            console.log('[Category BG] backgroundImageUrl =', bg.backgroundImageUrl);
          }
          setPageBackground(bg || null);
        }
      } catch (e) {
        console.error('Failed to fetch page background for category', e);
      }
    };
    if (categoryId && category) fetchBackground();
  }, [categoryId, category]);

  // Create mapping from category names to page routes (same as static pages)
  const getPageRoute = (category: Category | null): string => {
    if (!category) return '';
    
    // For dynamic categories, use the actual dynamic route
    return `/category/${category._id}`;
  };

  // Filter and prepare display items
  const filteredMenuItems = menuItems.filter(item => {
    const itemPrice = item.discountPrice || item.price;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = itemPrice >= priceRange[0] && itemPrice <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  const displayItems = filteredMenuItems.map((item) => {
    // Convert ingredients to ingredient tags
    const ingredientTags = item.ingredients?.map(ingredient => {
      const ingredientData = ingredientsMap[ingredient.ingredientId];
      return {
        label: ingredientData?.name || 'Unknown Ingredient',
        color: ingredientData?.color || '#00BF89'
      };
    }) || [];


    return {
      id: item._id,
      image: item.image || "",
      nameAr: item.name,
      nameEn: item.nameEn || "",
      description: item.description || "",
      price: item.discountPrice || item.price,
      oldPrice: item.discountPrice ? item.price : undefined,
      category: category?.name || "",
      status: (item.status === 'out_of_stock' ? 'out' : item.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive' | 'out',
      isFeatured: false,
      ingredientTags,
      calories: (item as any).calories,
      preparationTime: (item as any).preparationTime,
      servingSize: (item as any).servingSize,
    };
  });

  if (loading) {
    return (
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: pageBackground?.backgroundImageId 
            ? `url('/api/images/${pageBackground.backgroundImageId}')`
            : pageBackground?.backgroundImageUrl 
            ? `url('${pageBackground.backgroundImageUrl}')`
            : 'linear-gradient(to bottom right, #201007, #1c0e06, #0a0502)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <MenuItemsSkeleton />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
        <div className="text-white text-xl">Category not found</div>
      </div>
    );
  }

  const getBackgroundImage = () => {
    if (pageBackground?.backgroundImageId) {
      return `/api/images/${pageBackground.backgroundImageId}`;
    }
    if (pageBackground?.backgroundImageUrl) {
      return pageBackground.backgroundImageUrl;
    }
    return undefined;
  };

  const backgroundImageUrl = getBackgroundImage();

  return (
    <div
      className="min-h-screen relative overflow-hidden font-['Tajawal']"
      dir="rtl"
      style={
        backgroundImageUrl
          ? {
              backgroundImage: `url('${backgroundImageUrl}')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {
              background: 'linear-gradient(to bottom right, #201007, #1c0e06, #0a0502)',
            }
      }
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6 py-8">
        <ErrorBoundary>
          <header className="mb-6 text-right">
            <h2 className="mb-2 text-3xl font-bold text-white">
              {categoryId === '68dcc52cad46b03aff8a3cbb' ? 'العروض' : category.name}
            </h2>
            {categoryId === '68dcc52cad46b03aff8a3cbb' ? (
              <p className="text-base text-white/80">اكتشف أفضل العروض والمنتجات المخفضة</p>
            ) : category.description && (
              <p className="text-base text-white/80">{category.description}</p>
            )}
          </header>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Price Range Filter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <label className="block text-white mb-2 font-semibold">نطاق السعر: {priceRange[0]} - {priceRange[1]} ريال</label>
              <div className="flex gap-4">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((it, idx) => (
            <div
              key={idx}
              className="stagger-fade"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <MenuItemCard {...it} />
            </div>
          ))}
        </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}