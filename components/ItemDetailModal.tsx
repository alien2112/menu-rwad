"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart, Loader2, Star, Clock, Flame } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import { ModifierSelector, Modifier, SelectedModifier } from "./ModifierSelector";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/SkeletonLoader";

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
  modifiers?: string[]; // Array of modifier IDs
}

interface ItemDetailModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailModal = ({ item, isOpen, onClose }: ItemDetailModalProps) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [loadingModifiers, setLoadingModifiers] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [adding, setAdding] = useState(false);

  const actualBasePrice = item.discountPrice && item.discountPrice < item.price
    ? item.discountPrice
    : item.price;

  // Fetch modifiers for this item
  useEffect(() => {
    const fetchModifiers = async () => {
      if (!item.modifiers || item.modifiers.length === 0) {
        setModifiers([]);
        setTotalPrice(actualBasePrice);
        return;
      }

      setLoadingModifiers(true);
      try {
        const response = await fetch("/api/modifiers");
        const data = await response.json();

        if (data.success) {
          // Filter only the modifiers assigned to this item
          const itemModifiers = data.data.filter((mod: Modifier) =>
            item.modifiers?.includes(mod._id)
          );
          setModifiers(itemModifiers);
        }
      } catch (error) {
        console.error("Error fetching modifiers:", error);
      } finally {
        setLoadingModifiers(false);
      }
    };

    if (isOpen) {
      fetchModifiers();
      setQuantity(1);
      setSelectedModifiers([]);
      setTotalPrice(actualBasePrice);
    }
  }, [isOpen, item.modifiers, item._id, actualBasePrice]);

  const handleModifierChange = (selections: SelectedModifier[], price: number) => {
    setSelectedModifiers(selections);
    setTotalPrice(price);
  };

  const handleAddToCart = () => {
    setAdding(true);

    // Calculate unit price with modifiers
    const unitPrice = totalPrice;

    addToCart({
      menuItemId: item._id,
      menuItemName: item.name,
      menuItemNameEn: item.nameEn,
      quantity,
      unitPrice,
      basePrice: actualBasePrice,
      totalPrice: unitPrice * quantity,
      image: item.image,
      customization: selectedModifiers.length > 0 ? {
        sizeId: undefined,
        addons: [],
        specialInstructions: "",
        dietaryModifications: [],
        modifiers: selectedModifiers,
      } : undefined,
    });

    setTimeout(() => {
      setAdding(false);
      onClose();
    }, 500);
  };

  const canAddToCart = () => {
    // Check if all required modifiers are selected
    return modifiers.every((modifier) => {
      if (!modifier.required) return true;

      const selection = selectedModifiers.find(s => s.modifierId === modifier._id);
      if (!selection) return false;

      if (modifier.minSelections && selection.selectedOptions.length < modifier.minSelections) {
        return false;
      }

      return true;
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Image */}
          <div className="relative h-64 sm:h-80">
            {item.image ? (
              <OptimizedImage
                src={item.image}
                alt={item.name}
                width="100%"
                height="100%"
                objectFit="cover"
                className="w-full h-full"
                placeholderColor="rgba(255,255,255,0.1)"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <ShoppingCart className="w-20 h-20 text-primary/30" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Discount Badge */}
            {item.discountPrice && item.discountPrice < item.price && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-2 rounded-xl shadow-lg">
                -{Math.round(((item.price - item.discountPrice) / item.price) * 100)}% خصم
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title & Description */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {item.name}
              </h2>
              {item.nameEn && (
                <p className="text-sm text-muted-foreground mb-3">{item.nameEn}</p>
              )}
              {item.description && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-3 flex-wrap">
              {item.calories !== undefined && item.calories >= 0 && (
                <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-foreground">
                    {item.calories} سعر
                  </span>
                </div>
              )}

              {item.preparationTime !== undefined && item.preparationTime >= 0 && (
                <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-foreground">
                    {item.preparationTime} دقيقة
                  </span>
                </div>
              )}

              {item.averageRating && item.reviewCount && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-foreground">
                    {item.averageRating.toFixed(1)} ({item.reviewCount})
                  </span>
                </div>
              )}
            </div>

            {/* Modifiers */}
            {loadingModifiers ? (
              <div className="space-y-4 py-8">
                <Skeleton className="h-6 w-1/3" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              modifiers.length > 0 && (
                <ModifierSelector
                  modifiers={modifiers}
                  onSelectionChange={handleModifierChange}
                  basePrice={actualBasePrice}
                />
              )
            )}

            {/* Quantity & Price */}
            <div className="bg-card/50 rounded-xl p-5 space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">الكمية:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-card hover:bg-card/80 border border-border rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4 text-foreground" />
                  </button>
                  <span className="text-xl font-bold text-foreground w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-card hover:bg-card/80 border border-border rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              </div>

              {/* Price Display */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">السعر الأساسي:</span>
                  <span className="text-foreground font-medium">
                    {actualBasePrice.toFixed(2)} ر.س
                  </span>
                </div>

                {selectedModifiers.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {selectedModifiers.map((modifier) =>
                      modifier.selectedOptions.map((option) => (
                        <div key={`${modifier.modifierId}-${option.id}`} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            + {option.name}
                          </span>
                          <span className="text-foreground">
                            {option.price.toFixed(2)} ر.س
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-2 border-t border-border">
                  <span className="text-foreground font-bold text-lg">الإجمالي:</span>
                  <div className="text-left">
                    <div className="text-2xl font-black text-primary">
                      {(totalPrice * quantity).toFixed(2)} ر.س
                    </div>
                    {quantity > 1 && (
                      <div className="text-xs text-muted-foreground">
                        {totalPrice.toFixed(2)} ر.س × {quantity}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={adding || !canAddToCart()}
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white px-6 py-4 rounded-xl font-bold text-lg transition-all disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري الإضافة...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>أضف إلى السلة</span>
                </>
              )}
            </button>

            {!canAddToCart() && (
              <p className="text-center text-sm text-red-400">
                يرجى اختيار جميع الخيارات المطلوبة
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
