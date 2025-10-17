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

interface VintageLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
}

export const VintageLayout = ({ item, onAddToCart }: VintageLayoutProps) => {
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
        className="relative z-30 bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50 text-amber-950 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl border-4 border-amber-900/30"
        style={{
          boxShadow: "0 4px 20px rgba(120, 53, 15, 0.2), inset 0 0 50px rgba(245, 158, 11, 0.1)"
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Ornate Header Border */}
        <div className="relative bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 px-5 py-2 border-b-4 border-amber-950/40">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-px bg-amber-400"></div>
            <span className="text-amber-100 text-xs font-serif uppercase tracking-widest">تراثي أصيل</span>
            <div className="w-12 h-px bg-amber-400"></div>
          </div>
        </div>

        {/* Image with Sepia Filter */}
        <div className="relative h-48 overflow-hidden border-b-4 border-amber-900/30">
          {item.image && !imageError ? (
            <div className="relative w-full h-full" style={{ filter: "sepia(0.3) contrast(1.1)" }}>
              <OptimizedImage
                src={item.image}
                alt={item.name}
                width="100%"
                height="100%"
                objectFit="cover"
                className="w-full h-full"
                onError={() => setImageError(true)}
              />
              {/* Vintage Vignette */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-amber-950/40"></div>
              <div className="absolute inset-0" style={{
                background: "radial-gradient(circle at center, transparent 40%, rgba(120, 53, 15, 0.4) 100%)"
              }}></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-amber-900/20" />
            </div>
          )}

          {/* Vintage Discount Stamp */}
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: -12 }}
              className="absolute top-3 right-3 bg-red-700 text-amber-50 text-xs font-bold px-4 py-3 rounded-full shadow-lg border-4 border-red-900"
              style={{
                boxShadow: "0 4px 10px rgba(127, 29, 29, 0.5)",
                fontFamily: "serif"
              }}
            >
              <div className="text-center">
                <div className="text-base">-{discountPercentage}%</div>
                <div className="text-[10px]">خصم</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content with Vintage Paper Texture */}
        <div className="p-5 bg-gradient-to-b from-amber-50 to-yellow-50 space-y-3">
          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-px bg-amber-900/40"></div>
            <div className="w-2 h-2 bg-amber-900/40 rotate-45"></div>
            <div className="w-8 h-px bg-amber-900/40"></div>
          </div>

          {/* Title with Serif Font */}
          <h3 className="text-amber-950 font-bold text-xl text-center leading-tight" style={{ fontFamily: "serif" }}>
            {item.name}
          </h3>

          {item.nameEn && (
            <p className="text-amber-700 text-sm font-medium text-center italic" style={{ fontFamily: "serif" }}>
              {item.nameEn}
            </p>
          )}

          {item.description && (
            <p className="text-amber-800 text-sm leading-relaxed line-clamp-2 text-center px-2" style={{ fontFamily: "serif" }}>
              {item.description}
            </p>
          )}

          {/* Meta Info with Vintage Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
              <div className="flex items-center gap-1.5 bg-orange-100 px-3 py-1.5 rounded-full border-2 border-orange-800/30">
                <Flame className="w-3.5 h-3.5 text-orange-700" />
                <span className="text-orange-900 font-bold text-xs">{item.calories}</span>
              </div>
            )}

            {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
              <div className="flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-full border-2 border-blue-800/30">
                <Clock className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-blue-900 font-bold text-xs">{item.preparationTime} د</span>
              </div>
            )}
          </div>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2 my-3">
            <div className="w-8 h-px bg-amber-900/40"></div>
            <div className="w-2 h-2 bg-amber-900/40 rotate-45"></div>
            <div className="w-8 h-px bg-amber-900/40"></div>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-red-700 font-black text-2xl" style={{ fontFamily: "serif" }}>
                    {actualPrice.toFixed(2)}
                  </span>
                  <span className="text-red-700 font-bold text-base">ر.س</span>
                  <span className="text-amber-600 text-sm line-through">
                    {item.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-amber-950 font-black text-2xl" style={{ fontFamily: "serif" }}>
                    {actualPrice.toFixed(2)}
                  </span>
                  <span className="text-amber-800 font-bold text-base">ر.س</span>
                </>
              )}
            </div>

            {/* Rating */}
            {item.averageRating && item.reviewCount ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-1.5 bg-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-300 transition-all border-2 border-amber-800/30"
              >
                <Star className="w-4 h-4 text-amber-700 fill-current" />
                <span className="text-amber-950 font-bold text-sm">{item.averageRating.toFixed(1)}</span>
                <span className="text-amber-700 text-xs">({item.reviewCount})</span>
              </button>
            ) : null}
          </div>

          {/* Vintage Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-amber-800 via-amber-900 to-amber-800 text-amber-50 font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md border-2 border-amber-950/40 flex items-center justify-center gap-2 mt-4"
            style={{ fontFamily: "serif" }}
            whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(120, 53, 15, 0.4)" }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-lg">أضف للسلة</span>
          </motion.button>
        </div>

        {/* Ornate Footer Border */}
        <div className="h-3 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border-t-4 border-amber-950/40"></div>
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
