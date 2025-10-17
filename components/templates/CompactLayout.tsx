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

interface CompactLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
}

export const CompactLayout = ({ item, onAddToCart }: CompactLayoutProps) => {
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
        className="relative z-30 bg-card/80 backdrop-blur-sm text-card-foreground rounded-lg overflow-hidden transition-all duration-200 shadow-md hover:shadow-lg border border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
      >
        {/* Compact Horizontal Layout */}
        <div className="flex gap-3 p-3">
          {/* Small Image */}
          <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
            {item.image && !imageError ? (
              <OptimizedImage
                src={item.image}
                alt={item.name}
                width="96"
                height="96"
                objectFit="cover"
                className="w-full h-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-white/20" />
              </div>
            )}

            {/* Compact Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                -{discountPercentage}%
              </div>
            )}
          </div>

          {/* Content - Maximum Information Density */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Top Section */}
            <div>
              {/* Title - Compact */}
              <h3 className="text-white font-bold text-base leading-tight mb-1 truncate">
                {item.name}
              </h3>

              {item.nameEn && (
                <p className="text-white/50 text-xs truncate mb-1">{item.nameEn}</p>
              )}

              {/* Description - Single Line */}
              {item.description && (
                <p className="text-white/70 text-xs leading-tight line-clamp-1">
                  {item.description}
                </p>
              )}
            </div>

            {/* Bottom Section - Price and Actions */}
            <div className="flex items-center justify-between gap-2 mt-2">
              {/* Left: Meta Info */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
                  <div className="flex items-center gap-1 bg-orange-500/20 px-1.5 py-0.5 rounded border border-orange-500/30">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-white text-[10px] font-semibold">{item.calories}</span>
                  </div>
                )}

                {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
                  <div className="flex items-center gap-1 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span className="text-white text-[10px] font-semibold">{item.preparationTime}</span>
                  </div>
                )}

                {/* Rating - Compact */}
                {item.averageRating && item.reviewCount ? (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center gap-0.5 bg-yellow-500/20 px-1.5 py-0.5 rounded border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
                  >
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-white text-[10px] font-bold">{item.averageRating.toFixed(1)}</span>
                  </button>
                ) : null}
              </div>

              {/* Right: Price and Cart */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Price - Compact */}
                <div className="flex flex-col items-end">
                  {hasDiscount ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-primary font-bold text-base leading-none">
                          {actualPrice.toFixed(0)}
                        </span>
                        <span className="text-primary text-[10px]">ر.س</span>
                      </div>
                      <span className="text-white/40 text-[10px] line-through">
                        {item.price.toFixed(0)}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-white font-bold text-base leading-none">
                        {actualPrice.toFixed(0)}
                      </span>
                      <span className="text-white/70 text-[10px]">ر.س</span>
                    </div>
                  )}
                </div>

                {/* Compact Add Button */}
                <motion.button
                  onClick={handleAddToCart}
                  className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
