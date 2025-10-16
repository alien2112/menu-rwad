"use client";

import { useState } from "react";
import { OptimizedImage } from "../OptimizedImage";
import { ShoppingCart, Star, Clock, Flame } from "lucide-react";
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

interface ModernLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
}

export const ModernLayout = ({ item, onAddToCart }: ModernLayoutProps) => {
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
        className="bg-card text-card-foreground rounded-2xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl restaurant-menu-item"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Large Image Section */}
        <div className="relative h-56 overflow-hidden group">
          {item.image && !imageError ? (
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
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
            <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-white/30" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Discount Badge */}
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-black px-3 py-2 rounded-xl shadow-lg"
            >
              -{discountPercentage}% خصم
            </motion.div>
          )}

          {/* Add to Cart Button - Floating */}
          <motion.button
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-white p-3.5 rounded-full transition-all duration-200 shadow-xl"
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-white font-black text-xl mb-2 leading-tight tracking-tight">
            {item.name}
          </h3>

          {item.nameEn && (
            <p className="text-white/50 text-sm font-medium mb-2 uppercase tracking-wide">{item.nameEn}</p>
          )}

          {item.description && (
            <p className="text-white/80 text-base leading-relaxed line-clamp-2 mb-4">
              {item.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-2.5 flex-wrap mb-4">
            {/* Calories */}
            {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1.5 rounded-lg border border-orange-500/30">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white font-semibold text-sm">
                  {item.calories} سعر
                </span>
              </div>
            )}

            {/* Preparation Time */}
            {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
              <div className="flex items-center gap-1.5 bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/30">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold text-sm">
                  {item.preparationTime} دقيقة
                </span>
              </div>
            )}
          </div>

          {/* Price and Rating */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-primary font-black text-2xl">
                    {actualPrice.toFixed(2)}
                  </span>
                  <span className="text-primary font-bold text-lg">ر.س</span>
                  <span className="text-white/40 text-base line-through">
                    {item.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-white font-black text-2xl">
                    {actualPrice.toFixed(2)}
                  </span>
                  <span className="text-white/80 font-bold text-lg">ر.س</span>
                </>
              )}
            </div>

            {/* Rating */}
            {item.averageRating && item.reviewCount ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-2 rounded-lg hover:from-yellow-500/30 hover:to-orange-500/30 transition-all border border-yellow-500/30"
              >
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-bold text-sm">
                  {item.averageRating.toFixed(1)}
                </span>
                <span className="text-white/50 text-xs font-medium">
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
          menuItemId={item._id}
          menuItemName={item.name}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
};
