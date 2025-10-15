"use client";

import { useState, useEffect } from 'react';
import { X, Plus, Minus, Clock, Star, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SizeOption {
  id: string;
  name: string;
  nameEn?: string;
  priceModifier: number; // Additional price for this size
  description?: string;
}

export interface AddonOption {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  category: string;
  required: boolean;
  maxQuantity?: number;
}

export interface MenuItemCustomization {
  sizeId?: string;
  addons: Array<{
    addonId: string;
    quantity: number;
  }>;
  specialInstructions: string;
  dietaryModifications: string[];
}

export interface CustomizableMenuItem {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  image?: string;
  preparationTime?: number;
  calories?: number;
  rating?: number;
  reviewCount?: number;
  sizeOptions?: SizeOption[];
  addonOptions?: AddonOption[];
  dietaryModifications?: string[];
  categoryId: string;
  status: 'active' | 'inactive' | 'out_of_stock';
}

interface MenuItemCustomizationModalProps {
  item: CustomizableMenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CustomizableMenuItem, customization: MenuItemCustomization, finalPrice: number) => void;
}

const DIETARY_MODIFICATIONS = [
  { id: 'no-onions', label: 'بدون بصل', icon: '🧅' },
  { id: 'no-garlic', label: 'بدون ثوم', icon: '🧄' },
  { id: 'extra-spicy', label: 'حار جداً', icon: '🌶️' },
  { id: 'mild', label: 'خفيف', icon: '🌶️' },
  { id: 'no-salt', label: 'بدون ملح', icon: '🧂' },
  { id: 'low-salt', label: 'قليل الملح', icon: '🧂' },
  { id: 'extra-cheese', label: 'جبن إضافي', icon: '🧀' },
  { id: 'no-cheese', label: 'بدون جبن', icon: '🧀' },
  { id: 'well-done', label: 'مطهو جيداً', icon: '🔥' },
  { id: 'medium-rare', label: 'نصف مطهو', icon: '🥩' },
];

export const MenuItemCustomizationModal = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: MenuItemCustomizationModalProps) => {
  const [customization, setCustomization] = useState<MenuItemCustomization>({
    sizeId: undefined,
    addons: [],
    specialInstructions: '',
    dietaryModifications: [],
  });

  const [quantity, setQuantity] = useState(1);

  // Reset customization when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen) {
      setCustomization({
        sizeId: item.sizeOptions?.[0]?.id || undefined,
        addons: [],
        specialInstructions: '',
        dietaryModifications: [],
      });
      setQuantity(1);
    }
  }, [isOpen, item._id]);

  const calculatePrice = (): number => {
    let basePrice = item.discountPrice || item.basePrice;
    
    // Add size modifier
    if (customization.sizeId && item.sizeOptions) {
      const selectedSize = item.sizeOptions.find(size => size.id === customization.sizeId);
      if (selectedSize) {
        basePrice += selectedSize.priceModifier;
      }
    }

    // Add addon prices
    const addonTotal = customization.addons.reduce((total, addon) => {
      const addonOption = item.addonOptions?.find(opt => opt.id === addon.addonId);
      return total + (addonOption ? addonOption.price * addon.quantity : 0);
    }, 0);

    return (basePrice + addonTotal) * quantity;
  };

  const updateAddonQuantity = (addonId: string, newQuantity: number) => {
    const addonOption = item.addonOptions?.find(opt => opt.id === addonId);
    if (!addonOption) return;

    const maxQuantity = addonOption.maxQuantity || 10;
    const quantity = Math.max(0, Math.min(newQuantity, maxQuantity));

    setCustomization(prev => ({
      ...prev,
      addons: prev.addons.map(addon =>
        addon.addonId === addonId ? { ...addon, quantity } : addon
      ).filter(addon => addon.quantity > 0)
    }));
  };

  const addAddon = (addonId: string) => {
    setCustomization(prev => {
      const existingAddon = prev.addons.find(addon => addon.addonId === addonId);
      if (existingAddon) {
        return prev;
      }
      return {
        ...prev,
        addons: [...prev.addons, { addonId, quantity: 1 }]
      };
    });
  };

  const toggleDietaryModification = (modificationId: string) => {
    setCustomization(prev => ({
      ...prev,
      dietaryModifications: prev.dietaryModifications.includes(modificationId)
        ? prev.dietaryModifications.filter(id => id !== modificationId)
        : [...prev.dietaryModifications, modificationId]
    }));
  };

  const handleAddToCart = () => {
    onAddToCart(item, customization, calculatePrice());
    onClose();
  };

  const finalPrice = calculatePrice();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">تخصيص الطلب</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Item Info */}
          <div className="flex items-center gap-4">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              {item.nameEn && (
                <p className="text-sm text-gray-600">{item.nameEn}</p>
              )}
              {item.description && (
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {item.preparationTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{item.preparationTime} دقيقة</span>
                  </div>
                )}
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{item.rating}</span>
                  </div>
                )}
                {item.calories && (
                  <span>{item.calories} سعرة حرارية</span>
                )}
              </div>
            </div>
          </div>

          {/* Size Options */}
          {item.sizeOptions && item.sizeOptions.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-3">اختر الحجم</h4>
              <div className="space-y-2">
                {item.sizeOptions.map((size) => (
                  <label
                    key={size.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      customization.sizeId === size.id
                        ? 'border-[#C2914A] bg-[#C2914A]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="size"
                        value={size.id}
                        checked={customization.sizeId === size.id}
                        onChange={() => setCustomization(prev => ({ ...prev, sizeId: size.id }))}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{size.name}</div>
                        {size.nameEn && (
                          <div className="text-sm text-gray-600">{size.nameEn}</div>
                        )}
                        {size.description && (
                          <div className="text-sm text-gray-500">{size.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {size.priceModifier > 0 && (
                        <div className="text-sm text-green-600">+{size.priceModifier} ريال</div>
                      )}
                      {size.priceModifier < 0 && (
                        <div className="text-sm text-red-600">{size.priceModifier} ريال</div>
                      )}
                      {size.priceModifier === 0 && (
                        <div className="text-sm text-gray-500">مجاني</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Addon Options */}
          {item.addonOptions && item.addonOptions.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-3">الإضافات</h4>
              <div className="space-y-3">
                {item.addonOptions.map((addon) => {
                  const currentQuantity = customization.addons.find(a => a.addonId === addon.id)?.quantity || 0;
                  return (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{addon.name}</div>
                        {addon.nameEn && (
                          <div className="text-sm text-gray-600">{addon.nameEn}</div>
                        )}
                        <div className="text-sm text-gray-500">{addon.price} ريال</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentQuantity > 0 ? (
                          <>
                            <button
                              onClick={() => updateAddonQuantity(addon.id, currentQuantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{currentQuantity}</span>
                            <button
                              onClick={() => updateAddonQuantity(addon.id, currentQuantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => addAddon(addon.id)}
                            className="px-4 py-2 bg-[#C2914A] text-white rounded-lg hover:bg-[#C2914A]/90 transition-colors"
                          >
                            إضافة
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dietary Modifications */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3">تعديلات غذائية</h4>
            <div className="grid grid-cols-2 gap-2">
              {DIETARY_MODIFICATIONS.map((modification) => (
                <label
                  key={modification.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    customization.dietaryModifications.includes(modification.id)
                      ? 'bg-[#C2914A]/20 border border-[#C2914A]'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={customization.dietaryModifications.includes(modification.id)}
                    onChange={() => toggleDietaryModification(modification.id)}
                    className="sr-only"
                  />
                  <span className="text-lg">{modification.icon}</span>
                  <span className="text-sm text-gray-700">{modification.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3">تعليمات خاصة</h4>
            <textarea
              value={customization.specialInstructions}
              onChange={(e) => setCustomization(prev => ({ ...prev, specialInstructions: e.target.value }))}
              placeholder="أي تعليمات خاصة للطلب..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C2914A] focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Quantity */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3">الكمية</h4>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">المجموع:</span>
              <span className="text-2xl font-bold text-[#C2914A]">{finalPrice} ريال</span>
            </div>
            {quantity > 1 && (
              <div className="text-sm text-gray-600 mt-1">
                {quantity} × {finalPrice / quantity} ريال
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-[#C2914A] to-[#B8853F] text-white py-3 rounded-lg font-medium hover:from-[#B8853F] hover:to-[#A67A35] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>إضافة للسلة ({finalPrice} ريال)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};







