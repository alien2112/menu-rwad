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
  categoryId: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  ingredients?: { ingredientId: string; portion: number; required: boolean }[];
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
          const categoryItems = itemsData.data.filter((item: MenuItem) => 
            item.categoryId === categoryId && item.status !== 'inactive'
          );
          console.log('Category items with ingredients:', categoryItems);
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

  // Prepare display items for new card UI
  const displayItems = menuItems.map((item) => {
    // Convert ingredients to ingredient tags
    const ingredientTags = item.ingredients?.map(ingredient => {
      const ingredientData = ingredientsMap[ingredient.ingredientId];
      return {
        label: ingredientData?.name || 'Unknown Ingredient',
        color: ingredientData?.color || '#00BF89'
      };
    }) || [];

    return {
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
            <h2 className="mb-2 text-3xl font-bold text-white">{category.name}</h2>
            {category.description && (
              <p className="text-base text-white/80">{category.description}</p>
            )}
          </header>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayItems.map((it, idx) => (
              <MenuItemCard key={idx} {...it} />
            ))}
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}