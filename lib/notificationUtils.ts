import { sendSSENotification, broadcastSSENotification } from '@/app/api/sse/route';

/**
 * Utility functions for sending notifications throughout the system
 * This provides a centralized way to trigger notifications from any API route
 * Compatible with Vercel deployment using Server-Sent Events (SSE)
 */

export interface NotificationData {
  type: 'order' | 'system' | 'staff' | 'inventory' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: any;
  department?: 'kitchen' | 'barista' | 'shisha' | 'admin';
  actionRequired?: boolean;
  targetRoles?: string[];
  targetUsers?: string[];
}

/**
 * Send a notification using SSE
 * This function safely handles cases where SSE is not available
 */
export async function sendNotification(notification: NotificationData): Promise<void> {
  try {
    // For now, we'll broadcast to all users
    // In production, you might want to implement user-specific targeting
    await broadcastSSENotification(notification);
    console.log(`✅ SSE Notification sent: ${notification.title}`);
  } catch (error) {
    console.error('❌ Error sending SSE notification:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Send inventory-related notifications
 */
export async function sendInventoryNotification(
  message: string, 
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  data?: any
): Promise<void> {
  await sendNotification({
    type: 'inventory',
    priority,
    title: 'إشعار المخزون',
    message,
    data,
    actionRequired: true,
    targetRoles: ['admin', 'kitchen']
  });
}

/**
 * Send low stock notification
 */
export async function sendLowStockNotification(
  ingredientName: string, 
  currentStock: number, 
  minStockLevel: number
): Promise<void> {
  await sendInventoryNotification(
    `المخزون منخفض: ${ingredientName} - الكمية الحالية: ${currentStock} (الحد الأدنى: ${minStockLevel})`,
    'high',
    { ingredientName, currentStock, minStockLevel, type: 'low_stock' }
  );
}

/**
 * Send out of stock notification
 */
export async function sendOutOfStockNotification(
  ingredientName: string
): Promise<void> {
  await sendInventoryNotification(
    `نفد المخزون: ${ingredientName}`,
    'urgent',
    { ingredientName, type: 'out_of_stock' }
  );
}

/**
 * Send order notification
 */
export async function sendOrderNotification(orderData: any): Promise<void> {
  try {
    const notificationService = getNotificationService();
    if (notificationService) {
      await notificationService.sendOrderNotification(orderData);
      console.log(`✅ Order notification sent for order ${orderData.orderNumber}`);
    }
  } catch (error) {
    console.error('❌ Error sending order notification:', error);
  }
}

/**
 * Send system notification
 */
export async function sendSystemNotification(
  message: string, 
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): Promise<void> {
  await sendNotification({
    type: 'system',
    priority,
    title: 'إشعار النظام',
    message,
    actionRequired: false,
    targetRoles: ['admin']
  });
}

/**
 * Send staff notification to a specific staff member (by id)
 */
export async function sendStaffNotification(
  staffId: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): Promise<void> {
  await sendNotification({
    type: 'staff',
    priority,
    title: 'إشعار الموظفين',
    message,
    actionRequired: false,
    targetUsers: [staffId]
  });
}

/**
 * Send menu item disabled notification
 */
export async function sendMenuItemDisabledNotification(
  menuItemName: string,
  reason: string
): Promise<void> {
  await sendNotification({
    type: 'system',
    priority: 'medium',
    title: 'تم تعطيل عنصر من القائمة',
    message: `تم تعطيل "${menuItemName}" بسبب: ${reason}`,
    actionRequired: true,
    targetRoles: ['admin', 'kitchen']
  });
}

