"use client";

import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import React, { useState } from "react";
import { ShoppingCart, Star, Clock, Flame } from "lucide-react";
import { MenuItemReviewModal } from "./MenuItemReviewModal";
import { OptimizedImage } from "./OptimizedImage";

interface IngredientTag {
  label: string;
  color?: string;
}

interface MenuItemCardProps {
  id?: string;
  image: string;
  nameAr: string;
  nameEn: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  status: "active" | "out" | "inactive";
  isFeatured?: boolean;
  ingredientTags?: IngredientTag[];
  calories?: number;
  preparationTime?: number;
  servingSize?: string;
}

export const MenuItemCard = ({
  id,
  image,
  nameAr,
  nameEn,
  description,
  price,
  oldPrice,
  category,
  status,
  isFeatured,
  ingredientTags,
  calories,
  preparationTime,
  servingSize,
}: MenuItemCardProps) => {
  const { dispatch } = useCart();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${nameAr}-${nameEn}`,
        name: nameAr,
        nameEn,
        price,
        image,
        category,
      }
    });
  };

  const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.borderRadius = '9999px';
    ripple.style.background = 'rgba(255,255,255,0.35)';
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0.8';
    ripple.style.transition = 'transform 500ms ease-out, opacity 600ms ease-out';
    ripple.className = 'ripple-effect';

    button.appendChild(ripple);
    // Force reflow to start transition
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ripple.offsetHeight;
    ripple.style.transform = 'scale(3)';
    ripple.style.opacity = '0';

    window.setTimeout(() => {
      ripple.remove();
    }, 650);

    handleAddToCart();
  };

  const actualPrice = oldPrice && oldPrice > price ? price : price;
  const hasDiscount = oldPrice && oldPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  return (
    <article className="group bg-card text-card-foreground rounded-3xl p-5 transition-all duration-300 restaurant-menu-item">
      <div className="flex flex-col gap-4">
        {/* Top Section: Image and Info */}
        <div className="flex items-start gap-4">
          {/* Circular Image */}
          <div className="flex-shrink-0 relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/30 shadow-lg">
              {image && !imageError ? (
                <OptimizedImage
                  src={image}
                  alt={nameAr}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  placeholderColor="rgba(255,255,255,0.1)"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C2914A] to-[#A67939]">
                  <span className="text-white text-2xl font-bold">
                    {nameAr.charAt(0)}
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

            {/* Featured Badge */}
            {isFeatured && !hasDiscount && (
              <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                مميز
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg mb-1 leading-tight">
              {nameAr}
            </h3>

            {nameEn && (
              <p className="text-white/60 text-xs mb-1">{nameEn}</p>
            )}

            {description && (
              <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-2">
                {description}
              </p>
            )}

            {/* Meta Info Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Calories */}
              {calories !== undefined && calories !== null && calories >= 0 && (
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-white/90 text-xs font-medium">
                    {calories} سعر
                  </span>
                </div>
              )}

              {/* Preparation Time */}
              {preparationTime !== undefined && preparationTime !== null && preparationTime >= 0 && (
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-white/90 text-xs font-medium">
                    {preparationTime} دقيقة
                  </span>
                </div>
              )}
            </div>

            {/* Ingredient Tags */}
            {ingredientTags && ingredientTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {ingredientTags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: '#c59a6c26',
                      color: '#c59a6c',
                      border: '1px solid #c59a6c4D'
                    }}
                    title={tag.label}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
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
                {oldPrice} ريال
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {status !== 'inactive' && (
            <div className="flex items-center gap-2">
              {/* Review Button */}
              {id && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all duration-300 border border-white/30 hover:border-white/50 hover:scale-105"
                  title="عرض التقييمات"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleButtonClick}
                className="relative overflow-hidden bg-gradient-to-r from-[#C2914A] to-[#B8853F] hover:from-[#B8853F] hover:to-[#A67939] text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105 hover:shadow-xl"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="relative z-10">أضف للسلة</span>
              </button>
            </div>
          )}

          {/* Out of stock badge */}
          {status === 'out' && (
            <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1.5 rounded-full text-xs font-bold">
              نفذ من المخزون
            </div>
          )}

          {/* Inactive badge */}
          {status === 'inactive' && (
            <div className="bg-gray-500/20 text-gray-400 px-3 py-1.5 rounded-full text-xs font-bold">
              غير متاح
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {id && showReviewModal && (
        <MenuItemReviewModal
          menuItemId={id}
          menuItemName={nameAr}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </article>
  );
};


