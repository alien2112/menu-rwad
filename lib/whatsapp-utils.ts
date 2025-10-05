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

export function generateWhatsAppMessage(orderData: OrderData): string {
  const formatPrice = (price: number) => `${price} ريال`;
  
  // Format items list
  const itemsText = orderData.items.map(item => {
    let itemText = `• ${item.menuItemName}`;
    if (item.menuItemNameEn) {
      itemText += ` (${item.menuItemNameEn})`;
    }
    itemText += ` × ${item.quantity} = ${formatPrice(item.totalPrice)}`;
    return itemText;
  }).join('\n');

  // Format customer info
  const customerInfoText = [
    orderData.customerInfo.name && `الاسم: ${orderData.customerInfo.name}`,
    orderData.customerInfo.phone && `الهاتف: ${orderData.customerInfo.phone}`,
    orderData.customerInfo.address && `العنوان: ${orderData.customerInfo.address}`
  ].filter(Boolean).join('\n');

  // Format notes
  const notesText = orderData.notes ? `\nملاحظات: ${orderData.notes}` : '';

  // Format discount
  const discountText = orderData.discountAmount && orderData.discountAmount > 0 
    ? `\nالخصم: -${formatPrice(orderData.discountAmount)}`
    : '';

  // Format final total
  const finalTotal = orderData.discountAmount && orderData.discountAmount > 0
    ? orderData.totalAmount - orderData.discountAmount
    : orderData.totalAmount;

  const message = `🍕 طلب جديد من الموقع

رقم الطلب: ${orderData.orderNumber}
التاريخ: ${new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())}

الطلبات:
${itemsText}

المجموع: ${formatPrice(orderData.totalAmount)}${discountText}
المجموع النهائي: ${formatPrice(finalTotal)}

تفاصيل العميل:
${customerInfoText}${notesText}

---
تم إنشاء هذا الطلب من موقع مراكش
شكراً لاختيارك مطعم مراكش! 🎉`;

  return message;
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  // Remove any non-numeric characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (assuming Saudi Arabia +966)
  const formattedPhone = cleanPhone.startsWith('966') ? cleanPhone : `966${cleanPhone}`;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}


