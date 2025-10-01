"use client";

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';

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
  const { state, dispatch } = useCart();

  if (!state.isOpen) return null;

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ر.س`;
  };

  const generateWhatsAppMessage = () => {
    if (state.items.length === 0) return '';

    let message = 'مرحباً! أود طلب التالي:\n\n';
    
    state.items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   الكمية: ${item.quantity}\n`;
      message += `   السعر: ${formatPrice(item.price * item.quantity)}\n`;
      if (item.notes) {
        message += `   ملاحظات: ${item.notes}\n`;
      }
      message += '\n';
    });

    message += `المجموع الكلي: ${formatPrice(state.totalPrice)}\n\n`;
    message += 'شكراً لكم!';

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = '966567833138'; // Your WhatsApp number
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after ordering
    dispatch({ type: 'CLEAR_CART' });
    dispatch({ type: 'SET_CART_OPEN', payload: false });
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
            <div className="border-t border-white/20 pt-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white font-semibold">المجموع الكلي:</span>
                <span className="text-coffee-gold font-bold text-xl">
                  {formatPrice(state.totalPrice)}
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
                طلب عبر واتساب
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
            {item.name}
          </h3>
          <p className="text-coffee-gold font-bold">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({
              type: 'UPDATE_QUANTITY',
              payload: { id: item.id, quantity: item.quantity - 1 }
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
              payload: { id: item.id, quantity: item.quantity + 1 }
            })}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
          className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <Trash2 size={16} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}
