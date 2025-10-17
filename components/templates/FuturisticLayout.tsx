"use client";

import { useState } from "react";
import { OptimizedImage } from "../OptimizedImage";
import { ShoppingCart, Star, Clock, Flame, ChevronDown } from "lucide-react";
import { MenuItemReviewModal } from "../MenuItemReviewModal";
import { motion, AnimatePresence } from "framer-motion";

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

interface FuturisticLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
}

export const FuturisticLayout = ({ item, onAddToCart }: FuturisticLayoutProps) => {
  const [imageError, setImageError] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const actualPrice = item.discountPrice && item.discountPrice < item.price
    ? item.discountPrice
    : item.price;

  const hasDiscount = item.discountPrice && item.discountPrice < item.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item._id);
  };

  return (
    <>
      <motion.div
        layout
        className="relative z-30 bg-gray-900/50 text-white rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-cyan-500/20 border border-cyan-500/20 restaurant-menu-item"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4 p-4">
          {/* Image */}
          <motion.div layoutId={`futuristic-image-${item._id}`} className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            {item.image && !imageError ? (
              <OptimizedImage
                src={item.image}
                alt={item.name}
                width="100%"
                height="100%"
                objectFit="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">{item.name.charAt(0)}</span>
              </div>
            )}
          </motion.div>

          {/* Details */}
          <div className="flex-1">
            <motion.h3 layoutId={`futuristic-title-${item._id}`} className="text-lg font-bold text-cyan-400">{item.name}</motion.h3>
            <motion.p layoutId={`futuristic-price-${item._id}`} className="text-xl font-bold">{actualPrice.toFixed(2)} <span className="text-sm">R.S</span></motion.p>
            {hasDiscount && <p className="text-sm line-through text-gray-400">{item.price.toFixed(2)} R.S</p>}
          </div>

          {/* Expand Icon */}
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="p-2">
            <ChevronDown className="w-6 h-6 text-cyan-400" />
          </motion.div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-300 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    {item.calories && <div className="flex items-center gap-1 text-sm"><Flame className="w-4 h-4 text-orange-400" /> {item.calories}</div>}
                    {item.preparationTime && <div className="flex items-center gap-1 text-sm"><Clock className="w-4 h-4 text-blue-400" /> {item.preparationTime} min</div>}
                    {item.averageRating && <div className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 text-yellow-400" /> {item.averageRating.toFixed(1)}</div>}
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReviewModal(true);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-sm mt-2"
                >
                  View Reviews
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
