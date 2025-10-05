"use client";

import { useState } from "react";
import { X, ShoppingCart, Clock, User, MapPin, Phone } from "lucide-react";

interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  menuItemNameEn?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
}

interface OrderData {
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount?: number;
  customerInfo: CustomerInfo;
  notes?: string;
}

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderData: OrderData | null;
  isLoading?: boolean;
}

export const OrderConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderData,
  isLoading = false
}: OrderConfirmationModalProps) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: ''
  });

  const [notes, setNotes] = useState('');

  if (!isOpen || !orderData) return null;

  const handleConfirm = () => {
    // Update order data with customer info and notes
    orderData.customerInfo = customerInfo;
    orderData.notes = notes;
    onConfirm();
  };

  const formatPrice = (price: number) => {
    return `${price} ريال`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">تأكيد الطلب</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-6 space-y-4">
          {/* Order Number and Date */}
          <div className="bg-gradient-to-r from-[#C2914A] to-[#B8853F] text-white p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">رقم الطلب: {orderData.orderNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatDate(new Date())}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800">الطلبات:</h3>
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.menuItemName}</p>
                  {item.menuItemNameEn && (
                    <p className="text-sm text-gray-500">{item.menuItemNameEn}</p>
                  )}
                  <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#C2914A]">{formatPrice(item.totalPrice)}</p>
                  <p className="text-sm text-gray-500">{formatPrice(item.unitPrice)} لكل قطعة</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">المجموع الكلي:</span>
              <span className="font-bold text-2xl text-green-600">
                {formatPrice(orderData.totalAmount)}
              </span>
            </div>
            {orderData.discountAmount && orderData.discountAmount > 0 && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">الخصم:</span>
                <span className="text-sm text-red-600">-{formatPrice(orderData.discountAmount)}</span>
              </div>
            )}
          </div>

          {/* Customer Information Form */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">معلومات العميل:</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم (اختياري)
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2914A] focus:border-transparent"
                    placeholder="أدخل اسمك"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف (اختياري)
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2914A] focus:border-transparent"
                    placeholder="+966501234567"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان (اختياري)
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2914A] focus:border-transparent resize-none"
                    rows={2}
                    placeholder="أدخل عنوانك"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C2914A] focus:border-transparent resize-none"
                  rows={2}
                  placeholder="أي ملاحظات خاصة بالطلب"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 text-lg">⚠️</div>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">تنبيه مهم:</p>
                <p>سيتم حفظ الطلب في قاعدة البيانات عند الضغط على "تأكيد وفتح واتساب". تأكد من إرسال الرسالة عبر واتساب.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>تأكيد وفتح واتساب</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


