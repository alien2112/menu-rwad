"use client";

import { useState } from "react";
import { OptimizedImage } from "../OptimizedImage";
import { ShoppingCart, Star, Clock, Flame } from "lucide-react";
import { MenuItemReviewModal } from "../MenuItemReviewModal";

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

interface OriginalLayoutProps {
  item: MenuItem;
  onAddToCart: (id: string) => void;
  viewMode?: 'list' | 'grid';
}

export const OriginalLayout = ({ item, onAddToCart, viewMode = 'list' }: OriginalLayoutProps) => {
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

  // Grid view - Different layout for grid mode
  if (viewMode === 'grid') {
    return (
      <>
        <div className="bg-card border border-muted hover:bg-card/80 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 flex flex-col h-full">
          {/* Image Section */}
          <div className="relative mb-3">
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/10 border border-white/30">
              {item.image && !imageError ? (
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  placeholderColor="rgba(255,255,255,0.1)"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C2914A] to-[#A67939]">
                  <span className="text-white text-3xl font-bold">
                    {item.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                {discountPercentage}%
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-card-foreground font-bold text-base mb-1 leading-tight line-clamp-2">
              {item.name}
            </h3>

            {item.nameEn && (
              <p className="text-muted-foreground text-xs mb-2 line-clamp-1">{item.nameEn}</p>
            )}

            {item.description && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
                {item.description}
              </p>
            )}

            {/* Meta badges */}
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
                <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-full">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-muted-foreground text-xs font-medium">
                    {item.calories}
                  </span>
                </div>
              )}

              {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
                <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span className="text-muted-foreground text-xs font-medium">
                    {item.preparationTime}د
                  </span>
                </div>
              )}

              {item.averageRating && item.reviewCount ? (
                <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-muted-foreground text-xs font-medium">
                    {item.averageRating.toFixed(1)}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-lg">
                  <span className="font-bold text-sm">{actualPrice}</span>
                  <span className="text-xs mr-1">ريال</span>
                </div>

                {hasDiscount && (
                  <div className="text-muted-foreground text-xs line-through">
                    {item.price}
                  </div>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                className="bg-accent hover:bg-accent/90 text-accent-foreground p-2 rounded-full font-bold transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

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
  }

  // List view - Horizontal layout inspired by marakshv3
  return (
    <>
      <div className="bg-card border border-muted hover:bg-card/80 backdrop-blur-sm rounded-3xl p-5 transition-all duration-300 restaurant-menu-item">
        <div className="flex flex-col gap-4">
          {/* Top Section: Image and Info */}
          <div className="flex items-start gap-4">
            {/* Circular Image */}
            <div className="flex-shrink-0 relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-muted-foreground/30 shadow-lg">
                {item.image && !imageError ? (
                  <OptimizedImage
                    src={item.image}
                    alt={item.name}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    placeholderColor="rgba(255,255,255,0.1)"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C2914A] to-[#A67939]">
                    <span className="text-white text-2xl font-bold">
                      {item.name.charAt(0)}
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
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-card-foreground font-bold text-lg mb-1 leading-tight">
                {item.name}
              </h3>

              {item.nameEn && (
                <p className="text-muted-foreground text-xs mb-1">{item.nameEn}</p>
              )}

              {item.description && (
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-2">
                  {item.description}
                </p>
              )}

              {/* Meta Info Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Calories */}
                {item.calories !== undefined && item.calories !== null && item.calories >= 0 && (
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-muted-foreground text-xs font-medium">
                      {item.calories} سعر
                    </span>
                  </div>
                )}

                {/* Preparation Time */}
                {item.preparationTime !== undefined && item.preparationTime !== null && item.preparationTime >= 0 && (
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-muted-foreground text-xs font-medium">
                      {item.preparationTime} دقيقة
                    </span>
                  </div>
                )}

                {/* Rating */}
                {item.averageRating && item.reviewCount ? (
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    <span className="text-muted-foreground text-xs font-medium">
                      {item.averageRating.toFixed(1)} ({item.reviewCount})
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Bottom Section: Price and Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-muted">
            {/* Price Section */}
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
                <span className="font-bold text-base">{actualPrice}</span>
                <span className="text-sm mr-1">ريال</span>
              </div>

              {hasDiscount && (
                <div className="text-muted-foreground text-sm line-through">
                  {item.price} ريال
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Review Button */}
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-muted hover:bg-secondary text-card-foreground p-2.5 rounded-full transition-all duration-300 border border-muted hover:border-ring hover:scale-105"
                title="عرض التقييمات"
              >
                <Star className="w-4 h-4" />
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105 hover:shadow-xl"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>أضف للسلة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
