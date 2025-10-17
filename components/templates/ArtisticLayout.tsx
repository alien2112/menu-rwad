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

interface ArtisticLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
}

export const ArtisticLayout = ({ item, onAddToCart }: ArtisticLayoutProps) => {
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
        className="relative z-30 bg-gradient-to-br from-purple-900/90 via-pink-800/80 to-orange-600/90 text-white rounded-3xl overflow-hidden transition-all duration-500"
        style={{
          boxShadow: "0 8px 32px rgba(236, 72, 153, 0.3), 0 0 60px rgba(139, 92, 246, 0.2)",
          transform: "rotate(-1deg)"
        }}
        initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
        animate={{ opacity: 1, rotate: -1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        whileHover={{ rotate: 0, scale: 1.03, boxShadow: "0 12px 48px rgba(236, 72, 153, 0.5)" }}
      >
        {/* Artistic Header with Gradient Swirl */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

        {/* Image Section - Asymmetric */}
        <div className="relative">
          <div className="relative h-44 overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}>
            {item.image && !imageError ? (
              <motion.div
                whileHover={{ scale: 1.15, rotate: 2 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
              >
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  className="w-full h-full"
                  onError={() => setImageError(true)}
                />
              </motion.div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-800 to-pink-700 flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-white/20" />
              </div>
            )}

            {/* Colorful Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-orange-500/30 mix-blend-overlay"></div>
          </div>

          {/* Creative Discount Badge */}
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 12 }}
              className="absolute -top-2 -left-2 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white text-sm font-black px-5 py-3 rounded-2xl shadow-2xl border-2 border-white/40"
              style={{ transform: "rotate(12deg)" }}
            >
              <Sparkles className="w-4 h-4 inline mr-1" />
              {discountPercentage}%-
            </motion.div>
          )}
        </div>

        {/* Content Section - Asymmetric Layout */}
        <div className="relative px-6 pt-4 pb-6 space-y-3">
          {/* Floating Art Elements */}
          <div className="absolute top-0 left-4 w-8 h-8 bg-cyan-400/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 right-6 w-12 h-12 bg-pink-500/20 rounded-full blur-xl"></div>

          {/* Title with Creative Typography */}
          <h3 className="text-white font-black text-2xl leading-tight" style={{
            textShadow: "2px 2px 8px rgba(0,0,0,0.3), 0 0 20px rgba(236, 72, 153, 0.4)"
          }}>
            {item.name}
          </h3>

          {item.nameEn && (
            <p className="text-cyan-200 text-sm font-bold uppercase tracking-wider italic transform -skew-x-6">
              {item.nameEn}
            </p>
          )}

          {item.description && (
            <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Meta Info with Vibrant Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                <Flame className="w-4 h-4" />
                <span className="font-bold text-sm">{item.calories}</span>
              </div>
            )}

            {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-sm">{item.preparationTime} د</span>
              </div>
            )}

            {/* Rating */}
            {item.averageRating && item.reviewCount ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 px-3 py-1.5 rounded-full border border-white/20 shadow-lg hover:scale-105 transition-transform"
              >
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-sm">{item.averageRating.toFixed(1)}</span>
                <span className="text-xs opacity-80">({item.reviewCount})</span>
              </button>
            ) : null}
          </div>

          {/* Price and Cart - Creative Layout */}
          <div className="flex items-end justify-between pt-3">
            {/* Price */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg blur-lg"></div>
              <div className="relative flex items-baseline gap-2">
                {hasDiscount ? (
                  <>
                    <span className="text-white font-black text-3xl" style={{
                      textShadow: "0 0 20px rgba(236, 72, 153, 0.8)"
                    }}>
                      {actualPrice.toFixed(2)}
                    </span>
                    <span className="text-white/90 font-bold text-lg">ر.س</span>
                    <span className="text-white/50 text-sm line-through">
                      {item.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-white font-black text-3xl" style={{
                      textShadow: "0 0 20px rgba(236, 72, 153, 0.8)"
                    }}>
                      {actualPrice.toFixed(2)}
                    </span>
                    <span className="text-white/90 font-bold text-lg">ر.س</span>
                  </>
                )}
              </div>
            </div>

            {/* Creative Add Button */}
            <motion.button
              onClick={handleAddToCart}
              className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold p-4 rounded-2xl shadow-2xl border-2 border-white/30"
              whileHover={{
                scale: 1.1,
                rotate: 5,
                boxShadow: "0 0 30px rgba(236, 72, 153, 0.8)"
              }}
              whileTap={{ scale: 0.9, rotate: -5 }}
            >
              <ShoppingCart className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Artistic Bottom Accent */}
        <div className="h-2 bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-500"></div>
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
