"use client";

import { useState } from "react";
import { OptimizedImage } from "../OptimizedImage";
import { ShoppingCart, Star, Clock, Flame, Sparkles } from "lucide-react";
import { MenuItemReviewModal } from "../MenuItemReviewModal";
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

interface ElegantLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
}

export const ElegantLayout = ({ item, onAddToCart }: ElegantLayoutProps) => {
  const [imageError, setImageError] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
        className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-md text-card-foreground rounded-2xl overflow-hidden transition-all duration-500 border border-white/10 shadow-2xl hover:shadow-3xl restaurant-menu-item relative"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -6, scale: 1.01, borderColor: "rgba(255,255,255,0.2)" }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Elegant Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Image Section with Elegant Frame */}
        <div className="relative h-52 overflow-hidden">
          <div className="absolute inset-0 border-8 border-white/5 z-10 pointer-events-none"></div>

          {item.image && !imageError ? (
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full h-full"
            >
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
            </motion.div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-white/10 via-white/5 to-transparent flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white/20" />
            </div>
          )}

          {/* Elegant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

          {/* Discount Badge - Elegant Style */}
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
              className="absolute top-5 right-5 bg-gradient-to-br from-amber-400 to-amber-600 text-white px-4 py-2 rounded-lg shadow-2xl border border-amber-300/50"
            >
              <div className="text-center">
                <div className="text-xs font-medium opacity-90">خصم</div>
                <div className="text-lg font-black leading-none">{discountPercentage}%</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 relative">
          {/* Decorative Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          {/* Title Section */}
          <div className="text-center mb-4 pt-2">
            <h3 className="text-white font-bold text-xl mb-2 leading-tight tracking-wide">
              {item.name}
            </h3>

            {item.nameEn && (
              <p className="text-white/50 text-xs font-light tracking-widest uppercase mb-3">
                {item.nameEn}
              </p>
            )}

            {item.description && (
              <p className="text-white/70 text-sm leading-relaxed line-clamp-2 max-w-md mx-auto">
                {item.description}
              </p>
            )}
          </div>

          {/* Meta Info - Elegant Pills */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-5">
            {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full border border-white/10">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-white/90 text-xs font-medium">
                  {item.calories} سعر
                </span>
              </div>
            )}

            {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full border border-white/10">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-white/90 text-xs font-medium">
                  {item.preparationTime} دقيقة
                </span>
              </div>
            )}

            {item.averageRating && item.reviewCount ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                <span className="text-white/90 text-xs font-medium">
                  {item.averageRating.toFixed(1)}
                </span>
                <span className="text-white/50 text-xs">
                  ({item.reviewCount})
                </span>
              </button>
            ) : null}
          </div>

          {/* Elegant Divider */}
          <div className="relative h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-5"></div>

          {/* Price and Cart Section */}
          <div className="flex items-center justify-between gap-4">
            {/* Price - Elegant Display */}
            <div className="flex-1">
              {hasDiscount ? (
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <span className="text-primary font-bold text-2xl">
                      {actualPrice.toFixed(2)}
                    </span>
                    <span className="text-primary/80 font-medium text-sm">ر.س</span>
                  </div>
                  <div className="text-white/40 text-sm line-through">
                    {item.price.toFixed(2)} ر.س
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-white font-bold text-2xl">
                      {actualPrice.toFixed(2)}
                    </span>
                    <span className="text-white/70 font-medium text-sm">ر.س</span>
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Button - Elegant */}
            <motion.button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>أضف للسلة</span>
            </motion.button>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
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
