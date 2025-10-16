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

interface MinimalLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
}

export const MinimalLayout = ({ item, onAddToCart }: MinimalLayoutProps) => {
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
        className="bg-card/50 backdrop-blur-sm text-card-foreground rounded-lg overflow-hidden transition-all duration-200 border border-white/5 hover:border-white/10 restaurant-menu-item"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.15)" }}
      >
        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-1">
                <h3 className="text-white font-semibold text-lg leading-tight">
                  {item.name}
                </h3>
                {hasDiscount && (
                  <span className="text-red-400 text-xs font-medium bg-red-400/10 px-2 py-0.5 rounded">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              {item.nameEn && (
                <p className="text-white/40 text-xs mb-2 font-light">{item.nameEn}</p>
              )}

              {item.description && (
                <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>

            {/* Small Image */}
            {item.image && !imageError && (
              <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-white/5 border border-white/10">
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  placeholderColor="rgba(255,255,255,0.05)"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </div>

          {/* Meta Info - Minimal Icons */}
          <div className="flex items-center gap-4 mb-4 text-white/50">
            {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Flame className="w-3.5 h-3.5" />
                <span>{item.calories}</span>
              </div>
            )}

            {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.preparationTime} دقيقة</span>
              </div>
            )}

            {item.averageRating && item.reviewCount ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-1.5 text-xs hover:text-white/70 transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{item.averageRating.toFixed(1)}</span>
              </button>
            ) : null}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 mb-4"></div>

          {/* Bottom Section: Price and Action */}
          <div className="flex items-center justify-between gap-4">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-white font-medium text-xl">
                {actualPrice.toFixed(2)}
              </span>
              <span className="text-white/60 text-sm">ر.س</span>
              {hasDiscount && (
                <span className="text-white/30 text-sm line-through">
                  {item.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>أضف</span>
            </button>
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
