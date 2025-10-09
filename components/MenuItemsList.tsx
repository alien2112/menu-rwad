"use client";

import { useState } from "react";
import { OptimizedImage } from "./OptimizedImage";
import { ShoppingCart, Star, Clock, Flame } from "lucide-react";
import { MenuItemReviewModal } from "./MenuItemReviewModal";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";

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

interface MenuItemsListProps {
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

const MenuItemGridCard = ({ item, onAddToCart }: { item: MenuItem; onAddToCart: (id: string) => void }) => {
  const [imageError, setImageError] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { dispatch } = useCart();

  const actualPrice = item.discountPrice && item.discountPrice < item.price
    ? item.discountPrice
    : item.price;

  const hasDiscount = item.discountPrice && item.discountPrice < item.price;
  const discountPercentage = hasDiscount
    ? Math.round(((item.price - item.discountPrice!) / item.price) * 100)
    : 0;

  const handleAddToCart = () => {
    onAddToCart(item._id);
  };

  return (
    <>
      <motion.div
        className="bg-card text-card-foreground rounded-3xl overflow-hidden transition-all duration-300 restaurant-menu-item"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {item.image && !imageError ? (
            <OptimizedImage
              src={item.image}
              alt={item.name}
              width="100%"
              height="100%"
              objectFit="cover"
              className="w-full h-full"
              placeholderColor="rgba(255,255,255,0.1)"
              preserveTransparency={true}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-white/30" />
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPercentage}%
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="text-white font-bold text-lg mb-1 leading-tight">
            {item.name}
          </h3>

          {item.nameEn && (
            <p className="text-white/60 text-xs mb-2">{item.nameEn}</p>
          )}

          {item.description && (
            <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-3">
              {item.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {/* Calories */}
            {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-white/90 text-xs font-medium">
                  {item.calories} سعر
                </span>
              </div>
            )}

            {/* Preparation Time */}
            {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3 text-blue-400" />
                <span className="text-white/90 text-xs font-medium">
                  {item.preparationTime} دقيقة
                </span>
              </div>
            )}
          </div>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">
                    {actualPrice.toFixed(2)} ر.س
                  </span>
                  <span className="text-white/50 text-sm line-through">
                    {item.price.toFixed(2)} ر.س
                  </span>
                </div>
              ) : (
                <span className="text-white font-bold text-lg">
                  {actualPrice.toFixed(2)} ر.س
                </span>
              )}
            </div>

            {/* Rating */}
            {item.averageRating && item.reviewCount ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white/90 text-xs font-medium">
                  {item.averageRating.toFixed(1)}
                </span>
                <span className="text-white/60 text-xs">
                  ({item.reviewCount})
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Review Modal */}
      {showReviewModal && (
        <MenuItemReviewModal
          itemId={item._id}
          itemName={item.name}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
};

const MenuItemCard = ({ item, onAddToCart }: { item: MenuItem; onAddToCart: (id: string) => void }) => {
  const [imageError, setImageError] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { dispatch } = useCart();

  const actualPrice = item.discountPrice && item.discountPrice < item.price
    ? item.discountPrice
    : item.price;

  const hasDiscount = item.discountPrice && item.discountPrice < item.price;
  const discountPercentage = hasDiscount
    ? Math.round(((item.price - item.discountPrice!) / item.price) * 100)
    : 0;

  const handleAddToCart = () => {
    // Only call the parent callback, let the parent handle the dispatch
    onAddToCart(item._id);
  };

  return (
    <>
      <motion.div
        className="bg-card text-card-foreground rounded-3xl p-5 transition-all duration-300 restaurant-menu-item"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex flex-col gap-4">
          {/* Top Section: Image and Info */}
          <div className="flex items-start gap-4">
            {/* Circular Image */}
            <div className="flex-shrink-0 relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/30 shadow-lg">
                {item.image && !imageError ? (
                  <OptimizedImage
                    src={item.image}
                    alt={item.name}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    placeholderColor="rgba(255,255,255,0.1)"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C2914A] to-[#A67939]">
                    <span className="text-white text-2xl font-bold">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                  {discountPercentage}%
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg mb-1 leading-tight">
                {item.name}
              </h3>

              {item.nameEn && (
                <p className="text-white/60 text-xs mb-1">{item.nameEn}</p>
              )}

              {item.description && (
                <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-2">
                  {item.description}
                </p>
              )}

              {/* Meta Info Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Calories */}
                {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-white/90 text-xs font-medium">
                      {item.calories} سعر
                    </span>
                  </div>
                )}

                {/* Preparation Time */}
                {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-white/90 text-xs font-medium">
                      {item.preparationTime} دقيقة
                    </span>
                  </div>
                )}

                {/* Rating */}
                {item.averageRating && item.reviewCount ? (
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    <span className="text-white/90 text-xs font-medium">
                      {item.averageRating.toFixed(1)} ({item.reviewCount})
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Bottom Section: Price and Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
            {/* Price Section */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-[#C2914A] to-[#B8853F] text-white px-4 py-2 rounded-full shadow-lg">
                <span className="font-bold text-base">{actualPrice}</span>
                <span className="text-sm mr-1">ريال</span>
              </div>

              {hasDiscount && (
                <div className="text-white/50 text-sm line-through">
                  {item.price} ريال
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Review Button */}
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105"
                title="عرض التقييمات"
              >
                <Star className="w-4 h-4" />
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-[#C2914A] to-[#B8853F] hover:from-[#B8853F] hover:to-[#A67939] text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105 hover:shadow-xl"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>أضف للسلة</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Review Modal */}
      {showReviewModal && (
        <MenuItemReviewModal
          menuItemId={item._id}
          menuItemName={item.name}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
};

export const MenuItemsList = ({ items, onAddToCart, categories = [], showGrouped = false, selectedCategory, viewMode = 'list' }: MenuItemsListProps) => {
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
      <div className="px-4 pb-24">
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
          {offersItems.map((item) => (
            viewMode === 'grid' ? (
              <MenuItemGridCard key={item._id} item={item} onAddToCart={onAddToCart} />
            ) : (
              <MenuItemCard key={item._id} item={item} onAddToCart={onAddToCart} />
            )
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 text-center py-8">
        <p className="text-white/60 text-lg">لا توجد عناصر في هذه الفئة</p>
        <p className="text-white/40 text-sm mt-2">جرب اختيار فئة أخرى</p>
      </div>
    );
  }

  // If not showing grouped or no categories provided, show simple list/grid respecting viewMode
  if (!showGrouped || categories.length === 0) {
    return (
      <motion.div
        className={viewMode === 'grid' ? 'px-4 grid grid-cols-2 gap-4 pb-24' : 'px-4 space-y-4 pb-24'}
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
      >
        {items.map((item) => (
          <motion.div key={item._id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            {viewMode === 'grid' ? (
              <MenuItemGridCard item={item} onAddToCart={onAddToCart} />
            ) : (
              <MenuItemCard item={item} onAddToCart={onAddToCart} />
            )}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = categories.find(cat => cat._id === item.categoryId);
    if (category) {
      if (!acc[category._id]) {
        acc[category._id] = {
          category,
          items: []
        };
      }
      acc[category._id].items.push(item);
    }
    return acc;
  }, {} as Record<string, { category: any; items: MenuItem[] }>);

  // Sort categories by their order
  const sortedCategories = Object.values(groupedItems).sort((a, b) => {
    const aOrder = categories.find(cat => cat._id === a.category._id)?.order || 0;
    const bOrder = categories.find(cat => cat._id === b.category._id)?.order || 0;
    return aOrder - bOrder;
  });

  return (
    <motion.div className="px-4 pb-24" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
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
          <motion.div
            className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}
            initial="hidden"
            animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } } }}
          >
            {categoryItems.map((item) => (
              <motion.div key={item._id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                {viewMode === 'grid' ? (
                  <MenuItemGridCard item={item} onAddToCart={onAddToCart} />
                ) : (
                  <MenuItemCard item={item} onAddToCart={onAddToCart} />
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};
