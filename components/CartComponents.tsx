"use client";

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useTaxSettings } from '@/hooks/useTaxSettings';
import { ShoppingCart, X, Plus, Minus, Trash2, Tag, Loader2 } from 'lucide-react';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import { AlertDialog } from '@/components/AlertDialog';
import { generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp-utils';
import { Skeleton } from '@/components/SkeletonLoader';

export function CartIcon() {
  const { state, dispatch } = useCart();

  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_CART' })}
      className="relative p-3 glass-effect rounded-xl text-white hover:bg-white/20 transition-colors"
    >
      <ShoppingCart size={24} />
      {state.totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-coffee-green text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {state.totalItems}
        </span>
      )}
    </button>
  );
}

export function CartModal() {
  const { state, dispatch, applyPromotion, removePromotion } = useCart();
  const { calculateTax, formatPrice, settings } = useTaxSettings();
  const [tableNumber, setTableNumber] = useState<string>('');
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      showAlert('خطأ', 'يرجى إدخال كود الخصم');
      return;
    }

    setApplyingPromo(true);

    try {
      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim(),
          cartItems: state.items,
          cartTotal: state.subtotal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        applyPromotion({
          promotionId: data.data.promotionId,
          code: data.data.code,
          name: data.data.name,
          type: 'discount-code',
          discountAmount: data.data.discountAmount,
          discountType: data.data.discountType,
          discountValue: data.data.discountValue,
        });
        showAlert('نجح', data.message || 'تم تطبيق الكود بنجاح');
        setPromoCode('');
      } else {
        showAlert('خطأ', data.message || data.error || 'الكود غير صحيح');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      showAlert('خطأ', 'حدث خطأ أثناء تطبيق الكود');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    removePromotion();
    setPromoCode('');
    showAlert('تم', 'تم إزالة كود الخصم');
  };

  if (!state.isOpen) return null;

  // Calculate tax for the entire cart
  const cartTaxCalculation = calculateTax(state.totalPrice);
  const showTaxBreakdown = settings?.displayTaxBreakdown && settings?.enableTaxHandling;

  const generateOrderNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `#${timestamp}${random}`;
  };

  const handleWhatsAppOrder = () => {
    if (state.items.length === 0) return;

    // Generate order data
    const orderData = {
      orderNumber: generateOrderNumber(),
      items: state.items.map(item => ({
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        menuItemNameEn: item.menuItemNameEn,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        customizations: item.customization,
      })),
      totalAmount: cartTaxCalculation.finalPrice,
      discountAmount: 0,
      taxInfo: settings?.enableTaxHandling ? {
        subtotal: cartTaxCalculation.breakdown.subtotal,
        taxRate: cartTaxCalculation.breakdown.taxRate,
        taxAmount: cartTaxCalculation.breakdown.taxAmount,
        includeTaxInPrice: settings.includeTaxInPrice
      } : undefined,
      customerInfo: {
        name: '',
        phone: '',
        address: '',
      },
      notes: tableNumber.trim() ? `رقم الطاولة: ${tableNumber.trim()}` : 'تيك أواي',
    };

    setPendingOrder(orderData);
    setShowOrderConfirmation(true);
  };

  const confirmOrder = async () => {
    if (!pendingOrder) return;

    setIsLoading(true);

    try {
      // Save order to database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingOrder),
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      // Generate WhatsApp message
      const message = generateWhatsAppMessage(pendingOrder);
      const whatsappUrl = getWhatsAppUrl('966567833138', message);

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Clear cart and close modals
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'SET_CART_OPEN', payload: false });
      setShowOrderConfirmation(false);
      setPendingOrder(null);
      setTableNumber('');

      // Show success message (you can add a toast notification here)
      console.log('Order saved successfully!');

    } catch (error) {
      console.error('Error saving order:', error);
      // Show error message (you can add a toast notification here)
      showAlert('خطأ', 'حدث خطأ في حفظ الطلب. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeOrderConfirmation = () => {
    setShowOrderConfirmation(false);
    setPendingOrder(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">سلة التسوق</h2>
          <button
            onClick={() => dispatch({ type: 'SET_CART_OPEN', payload: false })}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart size={48} className="text-white/50 mx-auto mb-4" />
              <p className="text-white/70">سلة التسوق فارغة</p>
            </div>
          ) : (
            state.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))
          )}
        </div>

        {/* Total and Actions */}
        {state.items.length > 0 && (
          <>
            <div className="border-t border-white/20 pt-4 mb-6 space-y-3">
              {/* Optional Table Number */}
              <div className="flex items-center gap-3">
                <label className="text-white/80 text-sm min-w-[110px]">رقم الطاولة (اختياري):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="اتركه فارغاً للتيك أواي"
                  className="flex-1 rounded-lg bg-white/10 text-white placeholder-white/40 px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* Promo Code Section */}
              <div className="space-y-2">
                {!state.appliedPromotion ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                        placeholder="أدخل كود الخصم"
                        className="w-full pr-10 pl-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 uppercase"
                        disabled={applyingPromo}
                      />
                    </div>
                    <button
                      onClick={handleApplyPromoCode}
                      disabled={applyingPromo || !promoCode.trim()}
                      className="px-4 py-2 bg-coffee-gold hover:bg-coffee-gold/90 disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      {applyingPromo ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                        'تطبيق'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-green-400 font-medium text-sm">
                          {state.appliedPromotion.code}
                        </p>
                        <p className="text-green-400/70 text-xs">
                          خصم {state.appliedPromotion.discountType === 'percent'
                            ? `${state.appliedPromotion.discountValue}%`
                            : `${state.appliedPromotion.discountValue} ر.س`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromoCode}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">المجموع الفرعي:</span>
                  <span className="text-white">{formatPrice(state.subtotal)}</span>
                </div>

                {/* Show Discount */}
                {state.appliedPromotion && state.appliedPromotion.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>الخصم:</span>
                    <span>- {formatPrice(state.appliedPromotion.discountAmount)}</span>
                  </div>
                )}

                {/* Tax Breakdown */}
                {showTaxBreakdown && (
                  <div className="flex justify-between">
                    <span className="text-white/70">الضريبة ({cartTaxCalculation.breakdown.taxRate}%):</span>
                    <span className="text-white">{formatPrice(cartTaxCalculation.breakdown.taxAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-4 border-t border-white/20 pt-3">
                <span className="text-white font-semibold">المجموع الكلي:</span>
                <span className="text-coffee-gold font-bold text-xl">
                  {formatPrice(state.finalTotal || cartTaxCalculation.finalPrice)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                {tableNumber.trim() ? `اطلب عبر واتساب (طاولة رقم ${tableNumber.trim()})` : 'اطلب عبر واتساب (تيك أواي)'}
              </button>
              
              <button
                onClick={() => dispatch({ type: 'CLEAR_CART' })}
                className="w-full glass-effect text-white hover:bg-white/20 py-3 px-6 rounded-xl transition-colors"
              >
                مسح السلة
              </button>
            </div>
          </>
        )}
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        onClose={closeOrderConfirmation}
        onConfirm={confirmOrder}
        orderData={pendingOrder}
        isLoading={isLoading}
      />
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
      />
    </div>
  );
}

function CartItem({ item }: { item: any }) {
  const { dispatch } = useCart();

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ر.س`;
  };

  return (
    <div className="glass-effect rounded-xl p-4">
      <div className="flex items-center gap-4">
        {/* Item Image */}
        <div className="w-16 h-16 bg-white/10 rounded-xl flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <ShoppingCart size={24} />
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm mb-1 truncate">
            {item.menuItemName || item.name}
          </h3>
          {item.menuItemNameEn && (
            <p className="text-white/60 text-xs mb-1">{item.menuItemNameEn}</p>
          )}
          
          {/* Customizations */}
          {item.customization && (
            <div className="mt-1 space-y-1">
              {/* Size */}
              {item.customization.sizeId && (
                <div className="text-xs text-white/70">
                  الحجم: {item.customization.sizeId}
                </div>
              )}
              
              {/* Addons */}
              {item.customization.addons && item.customization.addons.length > 0 && (
                <div className="text-xs text-white/70">
                  الإضافات: {item.customization.addons.map((addon: any) => `${addon.name} (${addon.quantity})`).join(', ')}
                </div>
              )}
              
              {/* Dietary Modifications */}
              {item.customization.dietaryModifications && item.customization.dietaryModifications.length > 0 && (
                <div className="text-xs text-white/70">
                  تعديلات: {item.customization.dietaryModifications.join(', ')}
                </div>
              )}
              
              {/* Special Instructions */}
              {item.customization.specialInstructions && (
                <div className="text-xs text-white/70">
                  ملاحظات: {item.customization.specialInstructions}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-coffee-gold font-bold text-sm">
              {formatPrice(item.unitPrice || item.price)}
            </span>
            <span className="text-white/60 text-xs">× {item.quantity}</span>
            <span className="text-coffee-gold font-bold text-sm ml-auto">
              = {formatPrice(item.totalPrice || (item.price * item.quantity))}
            </span>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({
              type: 'UPDATE_QUANTITY',
              payload: { menuItemId: item.menuItemId || item.id, quantity: item.quantity - 1 }
            })}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Minus size={16} className="text-white" />
          </button>
          
          <span className="text-white font-semibold min-w-[2rem] text-center">
            {item.quantity}
          </span>
          
          <button
            onClick={() => dispatch({
              type: 'UPDATE_QUANTITY',
              payload: { menuItemId: item.menuItemId || item.id, quantity: item.quantity + 1 }
            })}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.menuItemId || item.id })}
          className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <Trash2 size={16} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}

