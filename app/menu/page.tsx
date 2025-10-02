"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartIcon, CartModal } from "@/components/CartComponents";
import { MenuHeader } from "@/components/MenuHeader";
import { CategoryTile } from "@/components/CategoryTile";
import { MenuPageSkeleton } from "@/components/SkeletonLoader";
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

// No static fallback; will use cache or fetch

export default function Menu() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<Array<{ id: string; title: string; iconSrc: string; iconAlt: string; route: string; color?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const CACHE_KEY = 'menu_categories_cache_v1';
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  const [pageBackground, setPageBackground] = useState<PageBackground | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Try cache first
        const now = Date.now();
        const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw) as { ts: number; items: any[] };
            if (cached && Array.isArray(cached.items) && now - cached.ts < CACHE_TTL_MS) {
              setMenuItems(cached.items);
              setLoading(false);
              return;
            }
          } catch {}
        }

        const response = await fetch('/api/categories', { cache: 'no-store' });
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Transform categories to menu items format
          const transformedItems = data.data
            .filter((category: Category) => category.status === 'active')
            .sort((a: Category, b: Category) => a.order - b.order)
            .map((category: Category) => ({
              id: category._id,
              title: category.name,
              iconSrc: category.image || category.icon || '',
              iconAlt: category.nameEn || category.name,
              route: `/category/${category._id}`,
              color: category.color
            }));
          
          setMenuItems(transformedItems);
          // Save to cache
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: now, items: transformedItems }));
          } catch {}
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Keep empty; UI will simply show nothing
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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

  const handleItemClick = (route: string) => {
    router.push(route);
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

      {loading ? (
        <MenuPageSkeleton />
      ) : (
        <ErrorBoundary>
          <div className="relative z-10 px-6 pb-8 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
            <MenuHeader />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item, index) => (
                <div className="stagger-fade" style={{ animationDelay: `${index * 100}ms` }} key={item.id}>
                  <CategoryTile
                    title={item.title}
                    icon={item.iconSrc}
                    color={item.color || '#ffffff'}
                    href={item.route}
                  />
                </div>
              ))}
            </div>
          </div>
        </ErrorBoundary>
      )}

      {/* Cart Components */}
      <div className="fixed top-6 right-6 z-40">
        <CartIcon />
      </div>
      <CartModal />
    </div>
  );
}
