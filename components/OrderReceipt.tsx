"use client";

import React from 'react';
import { Receipt, Calendar, User, Phone, MapPin } from 'lucide-react';
import { IOrder } from '@/lib/models/Order';

interface OrderReceiptProps {
  order: IOrder;
  showTaxBreakdown?: boolean;
}

export function OrderReceipt({ order, showTaxBreakdown = true }: OrderReceiptProps) {
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ر.س`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Receipt className="w-6 h-6 text-coffee-primary" />
          <h2 className="text-xl font-bold text-gray-800">فاتورة الطلب</h2>
        </div>
        <p className="text-gray-600">مقهى مراكش</p>
      </div>

      {/* Order Info */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">رقم الطلب:</span>
          <span className="font-bold text-gray-800">{order.orderNumber}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">التاريخ:</span>
          <span className="text-gray-800">{formatDate(order.orderDate)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">الحالة:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status === 'pending' ? 'في الانتظار' :
             order.status === 'confirmed' ? 'مؤكد' :
             order.status === 'preparing' ? 'قيد التحضير' :
             order.status === 'ready' ? 'جاهز' :
             order.status === 'delivered' ? 'تم التسليم' :
             'ملغي'}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      {order.customerInfo && (
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">معلومات العميل</h3>
          <div className="space-y-1 text-sm">
            {order.customerInfo.name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{order.customerInfo.name}</span>
              </div>
            )}
            {order.customerInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{order.customerInfo.phone}</span>
              </div>
            )}
            {order.customerInfo.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{order.customerInfo.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="font-semibold text-gray-800 mb-3">المنتجات</h3>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.menuItemName}</p>
                {item.menuItemNameEn && (
                  <p className="text-sm text-gray-600">{item.menuItemNameEn}</p>
                )}
                <p className="text-sm text-gray-500">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
                {item.customizations && item.customizations.length > 0 && (
                  <div className="mt-1">
                    {item.customizations.map((custom, idx) => (
                      <p key={idx} className="text-xs text-gray-500">+ {custom}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800">{formatPrice(item.totalPrice)}</p>
                <p className="text-xs text-gray-500">
                  {item.department === 'kitchen' ? 'مطبخ' :
                   item.department === 'barista' ? 'بارستا' :
                   'شيشة'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Breakdown */}
      {showTaxBreakdown && order.taxInfo && (
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">تفصيل الضريبة</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">المجموع الفرعي:</span>
              <span className="text-gray-800">{formatPrice(order.taxInfo.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الضريبة ({order.taxInfo.taxRate}%):</span>
              <span className="text-gray-800">{formatPrice(order.taxInfo.taxAmount)}</span>
            </div>
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">الخصم:</span>
                <span className="text-red-600">-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="border-t-2 border-coffee-primary pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">المجموع الكلي:</span>
          <span className="text-xl font-bold text-coffee-primary">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">ملاحظات:</span> {order.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          شكراً لزيارتكم - نتمنى لكم وجبة شهية
        </p>
        <p className="text-xs text-gray-400 mt-1">
          تم إنشاء هذه الفاتورة تلقائياً
        </p>
      </div>
    </div>
  );
}





