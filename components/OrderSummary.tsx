"use client";

import { ShoppingCart, X, Plus, Minus, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  total: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export const OrderModal = ({
  isOpen,
  onClose,
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: OrderModalProps) => {
  const router = useRouter();

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    // Build WhatsApp message
    let message = "مرحباً! أود طلب الآتي:\n\n";

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   الكمية: ${item.quantity}\n`;
      message += `   السعر: ${item.price} ريال\n`;
      message += `   المجموع: ${item.price * item.quantity} ريال\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━\n`;
    message += `المجموع الكلي: ${total} ريال سعودي`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // WhatsApp business number - replace with actual number
    const whatsappNumber = "966500000000"; // Replace with actual restaurant WhatsApp number

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Close modal after sending
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">قائمة طلباتي</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">قائمة الطلبات فارغة</p>
              <p className="text-gray-400 text-sm mt-2">اختر بعض العناصر من القائمة</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                {/* Item Info */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.price} ريال</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>

                  <span className="w-8 text-center font-medium">{item.quantity}</span>

                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-white">
            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">المجموع الكلي:</span>
              <span className="text-2xl font-bold text-[#C2914A]">{total} ريال</span>
            </div>

            {/* WhatsApp Checkout Button */}
            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              <span>إرسال الطلب عبر واتساب</span>
            </button>

            <p className="text-center text-gray-500 text-xs mt-2">
              سيتم فتح واتساب لإتمام طلبك
            </p>
          </div>
        )}
      </div>
    </>
  );
};
