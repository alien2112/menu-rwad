"use client";

import { useState } from "react";
import { OptimizedImage } from "../OptimizedImage";
import { ShoppingCart, Star, Clock, Flame, Leaf } from "lucide-react";
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
  ingredients?: string[];
}

interface NaturalLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
}

export const NaturalLayout = ({ item, onAddToCart }: NaturalLayoutProps) => {
  const [imageError, setImageError] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const actualPrice = item.discountPrice && item.discountPrice < item.price
    ? item.discountPrice
    : item.price;

  const handleAddToCart = () => {
    onAddToCart(item._id);
  };

  return (
    <>
      <motion.div
        className="relative z-30 bg-white text-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 restaurant-menu-item"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Image */}
        <div className="relative">
          <div className="h-48 bg-gray-200">
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
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Leaf className="w-16 h-16 text-green-800/30" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-xl font-serif font-semibold text-green-800 mb-2">{item.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{item.description}</p>

          {/* Meta */}
          <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
            {item.calories && <div className="flex items-center gap-1"><Flame className="w-4 h-4 text-red-500" /> {item.calories} cal</div>}
            {item.preparationTime && <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" /> {item.preparationTime} min</div>}
            {item.averageRating && <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {item.averageRating.toFixed(1)}</div>}
          </div>

          {/* Ingredients */}
          {item.ingredients && (
            <div className="mb-4">
              <h4 className="font-semibold text-green-800 mb-2">Ingredients:</h4>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient, index) => (
                  <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">{ingredient}</span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <p className="text-xl font-bold text-green-800">{actualPrice.toFixed(2)} <span className="text-sm">R.S</span></p>
            <button
              onClick={handleAddToCart}
              className="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Add
            </button>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="text-green-800 hover:text-green-700 text-sm mt-2"
          >
            View Reviews
          </button>
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
