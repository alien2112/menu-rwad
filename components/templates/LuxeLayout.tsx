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

interface LuxeLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
}

export const LuxeLayout = ({ item, onAddToCart }: LuxeLayoutProps) => {
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
        className="relative z-30 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white rounded-3xl overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-yellow-600/20 border border-yellow-600/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.03, boxShadow: "0 20px 60px rgba(202, 138, 4, 0.3)" }}
      >
        {/* Image Section with Marble Texture Overlay */}
        <div className="relative h-52 overflow-hidden">
          {item.image && !imageError ? (
            <div className="relative w-full h-full">
              <OptimizedImage
                src={item.image}
                alt={item.name}
                width="100%"
                height="100%"
                objectFit="cover"
                className="w-full h-full"
                onError={() => setImageError(true)}
              />
              {/* Marble Texture Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(202,138,4,0.1),transparent_50%)]"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-yellow-600/30" />
            </div>
          )}

          {/* Gold Discount Badge */}
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute top-4 right-4 bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 text-black text-sm font-black px-4 py-2 rounded-xl shadow-xl border-2 border-yellow-400"
            >
              <span className="drop-shadow-sm">-{discountPercentage}%</span>
            </motion.div>
          )}

          {/* Premium Add Button */}
          <motion.button
            onClick={handleAddToCart}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 text-black font-bold px-8 py-3 rounded-full transition-all duration-300 shadow-2xl border-2 border-yellow-400 flex items-center gap-2"
            whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(202, 138, 4, 0.6)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>أضف للسلة</span>
          </motion.button>
        </div>

        {/* Content Section with Gold Accents */}
        <div className="p-6 space-y-4">
          {/* Decorative Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent"></div>

          {/* Title */}
          <h3 className="text-white font-bold text-2xl text-center leading-tight tracking-wide">
            {item.name}
          </h3>

          {item.nameEn && (
            <p className="text-yellow-400/80 text-sm font-medium text-center uppercase tracking-widest">{item.nameEn}</p>
          )}

          {item.description && (
            <p className="text-gray-300 text-base leading-relaxed line-clamp-2 text-center px-2">
              {item.description}
            </p>
          )}

          {/* Meta Info with Gold Borders */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-900/30 to-red-900/30 px-3 py-2 rounded-lg border border-orange-500/40">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300 font-bold text-sm">{item.calories} سعر</span>
              </div>
            )}

            {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 px-3 py-2 rounded-lg border border-blue-500/40">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-bold text-sm">{item.preparationTime} دقيقة</span>
              </div>
            )}
          </div>

          {/* Decorative Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent"></div>

          {/* Price and Rating with Premium Styling */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-yellow-400 font-black text-3xl drop-shadow-lg">
                    {actualPrice.toFixed(2)}
                  </span>
                  <span className="text-yellow-400/80 font-bold text-lg">ر.س</span>
                  <span className="text-gray-500 text-base line-through">
                    {item.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-yellow-400 font-black text-3xl drop-shadow-lg">
                    {actualPrice.toFixed(2)}
                  </span>
                  <span className="text-yellow-400/80 font-bold text-lg">ر.س</span>
                </>
              )}
            </div>

            {/* Rating with Gold Theme */}
            {item.averageRating && item.reviewCount ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 px-4 py-2 rounded-xl hover:from-yellow-900/60 hover:to-yellow-800/60 transition-all border border-yellow-600/40"
              >
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-yellow-200 font-bold text-base">
                  {item.averageRating.toFixed(1)}
                </span>
                <span className="text-yellow-400/60 text-xs">({item.reviewCount})</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Bottom Gold Accent */}
        <div className="h-1 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600"></div>
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
