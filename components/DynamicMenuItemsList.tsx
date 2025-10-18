"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { OptimizedImage } from "./OptimizedImage";
import { TemplateId } from "@/lib/types/MenuTemplate";

// Dynamically import template layouts
const ClassicLayout = lazy(() => import("./templates/ClassicLayout").then(m => ({ default: m.ClassicLayout })));
const ModernLayout = lazy(() => import("./templates/ModernLayout").then(m => ({ default: m.ModernLayout })));
const MinimalLayout = lazy(() => import("./templates/MinimalLayout").then(m => ({ default: m.MinimalLayout })));
const ElegantLayout = lazy(() => import("./templates/ElegantLayout").then(m => ({ default: m.ElegantLayout })));
const LuxeLayout = lazy(() => import("./templates/LuxeLayout").then(m => ({ default: m.LuxeLayout })));
const VintageLayout = lazy(() => import("./templates/VintageLayout").then(m => ({ default: m.VintageLayout })));
const ArtisticLayout = lazy(() => import("./templates/ArtisticLayout").then(m => ({ default: m.ArtisticLayout })));
const CompactLayout = lazy(() => import("./templates/CompactLayout").then(m => ({ default: m.CompactLayout })));
const FuturisticLayout = lazy(() => import("./templates/FuturisticLayout").then(m => ({ default: m.FuturisticLayout })));
const NaturalLayout = lazy(() => import("./templates/NaturalLayout").then(m => ({ default: m.NaturalLayout })));

interface MenuItem {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  calories?: number;
  preparationTime?: number;
  categoryId: string;
  averageRating?: number;
  reviewCount?: number;
}

interface DynamicMenuItemsListProps {
  items: MenuItem[];
  onAddToCart: (itemId: string) => void;
  categories?: Array<{
    _id: string;
    name: string;
    nameEn?: string;
    color: string;
  }>;
  showGrouped?: boolean;
  selectedCategory?: string | null;
  viewMode?: 'list' | 'grid';
}

// Loading skeleton for template items
const TemplateItemSkeleton = () => (
  <div className="bg-card/50 rounded-xl p-4 animate-pulse">
    <div className="h-32 bg-white/10 rounded-lg mb-3"></div>
    <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-white/10 rounded w-1/2"></div>
  </div>
);

export const DynamicMenuItemsList = ({
  items,
  onAddToCart,
  categories = [],
  showGrouped = false,
  selectedCategory,
  viewMode = 'list'
}: DynamicMenuItemsListProps) => {
  const [layoutTemplate, setLayoutTemplate] = useState<TemplateId | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('DynamicMenuItemsList - Items received:', items.length);
  console.log('DynamicMenuItemsList - Items data:', items);
  console.log('DynamicMenuItemsList - Categories:', categories.length);
  console.log('DynamicMenuItemsList - Selected category:', selectedCategory);
  console.log('DynamicMenuItemsList - Show grouped:', showGrouped);
  console.log('DynamicMenuItemsList - View mode:', viewMode);
  console.log('DynamicMenuItemsList - Layout template:', layoutTemplate);
  console.log('DynamicMenuItemsList - Loading:', loading);

  // Fetch the current template from the API with polling
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        console.log('Fetching template from API...');
        const response = await fetch('/api/menu-template');
        const data = await response.json();
        console.log('Template API response:', data);

        if (data.success && data.currentTemplate) {
          console.log('Setting template to:', data.currentTemplate);
          setLayoutTemplate(data.currentTemplate);
        } else {
          console.log('No template found, using classic');
          setLayoutTemplate('classic');
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        // Fallback to classic if fetch fails
        setLayoutTemplate('classic');
      } finally {
        setLoading(false);
        console.log('Template loading completed');
      }
    };

    fetchTemplate();

    // Poll every 30 seconds for template updates
    const interval = setInterval(() => {
      fetchTemplate();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Get the appropriate template component
  const getTemplateComponent = (templateId: TemplateId) => {
    switch (templateId) {
      case 'modern':
        return ModernLayout;
      case 'minimal':
        return MinimalLayout;
      case 'elegant':
        return ElegantLayout;
      case 'luxe':
        return LuxeLayout;
      case 'vintage':
        return VintageLayout;
      case 'artistic':
        return ArtisticLayout;
      case 'compact':
        return CompactLayout;
      case 'futuristic':
        return FuturisticLayout;
      case 'natural':
        return NaturalLayout;
      case 'classic':
      default:
        return ClassicLayout;
    }
  };

  // Show loading skeleton while template is being fetched
  if (loading || !layoutTemplate) {
    return (
      <div className={viewMode === 'grid' ? 'px-4 grid grid-cols-2 gap-4 pb-24' : 'px-4 space-y-4 pb-24'}>
        {Array.from({ length: 6 }).map((_, i) => (
          <TemplateItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  const TemplateComponent = getTemplateComponent(layoutTemplate);
  console.log('Selected TemplateComponent:', TemplateComponent);

  // Special handling for offers category
  if (selectedCategory === 'offers') {
    const offersItems = items.filter(item => item.discountPrice && item.discountPrice < item.price);

    if (offersItems.length === 0) {
      return (
        <div className="px-4 text-center py-8">
          <p className="text-white/60 text-lg">لا توجد عروض متاحة حالياً</p>
          <p className="text-white/40 text-sm mt-2">تحقق مرة أخرى لاحقاً</p>
        </div>
      );
    }

    return (
      <div className="px-4 pb-24 relative z-20">
        {/* Offers Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/30">
            <OptimizedImage
              src="/special offer.png"
              alt="العروض الخاصة"
              width="100%"
              height="100%"
              objectFit="cover"
              placeholderColor="rgba(255,255,255,0.1)"
            />
          </div>
          <h2 className="text-white text-xl font-bold">العروض الخاصة</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
          <span className="text-white/60 text-sm">{offersItems.length} عرض</span>
        </div>

        {/* Offers Items */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
          {loading ? (
            // Show skeleton while loading template
            Array.from({ length: 4 }).map((_, i) => (
              <TemplateItemSkeleton key={i} />
            ))
          ) : (
            offersItems.map((item) => (
              <Suspense key={item._id} fallback={<TemplateItemSkeleton />}>
                <TemplateComponent item={item} onAddToCart={onAddToCart} />
              </Suspense>
            ))
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 text-center py-8">
        <p className="text-foreground/60 text-lg">لا توجد عناصر في هذه الفئة</p>
        <p className="text-foreground/40 text-sm mt-2">جرب اختيار فئة أخرى</p>
      </div>
    );
  }

  // If not showing grouped or no categories provided, show simple list/grid
  if (!showGrouped || categories.length === 0) {
    console.log('Rendering items list - count:', items.length, 'loading:', loading);

    return (
      <motion.div
        className={viewMode === 'grid' ? 'px-4 grid grid-cols-2 gap-4 pb-24 relative z-20' : 'px-4 space-y-4 pb-24 relative z-20'}
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
      >
        {loading ? (
          // Show skeleton while loading template
          Array.from({ length: 6 }).map((_, i) => (
            <TemplateItemSkeleton key={i} />
          ))
        ) : (
          items.map((item) => (
            <TemplateComponent key={item._id} item={item} onAddToCart={onAddToCart} />
          ))
        )}
      </motion.div>
    );
  }

  // Group items by category - include ALL items, even without matching category
  const groupedItems = items.reduce((acc, item) => {
    const category = categories.find(cat => cat._id === item.categoryId);

    // If category found, group normally
    if (category) {
      if (!acc[category._id]) {
        acc[category._id] = {
          category,
          items: []
        };
      }
      acc[category._id].items.push(item);
    } else {
      // If no category match, create an "Other" group
      const otherId = 'other_items';
      if (!acc[otherId]) {
        acc[otherId] = {
          category: {
            _id: otherId,
            name: 'أخرى',
            nameEn: 'Other',
            color: '#gray',
            order: 9999
          },
          items: []
        };
      }
      acc[otherId].items.push(item);
    }
    return acc;
  }, {} as Record<string, { category: any; items: MenuItem[] }>);

  // Sort categories by their order
  const sortedCategories = Object.values(groupedItems).sort((a, b) => {
    const aOrder = a.category.order || 9999;
    const bOrder = b.category.order || 9999;
    return aOrder - bOrder;
  });

  console.log('DynamicMenuItemsList - Grouped mode');
  console.log('Total items passed:', items.length);
  console.log('Categories available:', categories.length);
  console.log('Grouped items:', Object.keys(groupedItems).length);
  console.log('Sorted categories count:', sortedCategories.length);
  console.log('Template loading:', loading);
  sortedCategories.forEach(({ category, items: catItems }) => {
    console.log(`Category: ${category.name}, Items: ${catItems.length}`);
  });

  return (
    <motion.div className="px-4 pb-24 relative z-20" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
      {sortedCategories.map(({ category, items: categoryItems }) => (
        <motion.div key={category._id} className="mb-8" variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
          {/* Category Header */}
          <motion.div className="flex items-center gap-3 mb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${category.color}40` }}
            >
              <span className="text-white text-sm font-bold">
                {category.name.charAt(0)}
              </span>
            </div>
            <h2 className="text-foreground text-xl font-bold">{category.name}</h2>
            {category.nameEn && (
              <span className="text-foreground/60 text-sm">({category.nameEn})</span>
            )}
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
            <span className="text-white/60 text-sm">{categoryItems.length} عنصر</span>
          </motion.div>

          {/* Category Items */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4 relative z-20' : 'space-y-4 relative z-20'}>
            {categoryItems.map((item) => (
              <Suspense key={item._id} fallback={<TemplateItemSkeleton />}>
                <TemplateComponent item={item} onAddToCart={onAddToCart} />
              </Suspense>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
