import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { InventoryItem } from '@/lib/models/Inventory';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('assignedTo.kitchen', 'name')
      .populate('assignedTo.barista', 'name')
      .populate('assignedTo.shisha', 'name');
    
    // Fetch recent user activities
    const recentUsers = await User.find({})
      .sort({ updatedAt: -1 })
      .limit(5);
    
    // Fetch recent notifications
    const recentNotifications = await Notification.find({ dismissed: false })
      .sort({ timestamp: -1 })
      .limit(10);
    
    // Fetch inventory alerts (low or out of stock)
    const inventoryAlerts = await InventoryItem.find({ status: { $in: ['low_stock', 'out_of_stock'] } })
      .sort({ updatedAt: -1 })
      .limit(10);
    
    // Combine and format activities
    const activities = [
      // Recent orders
      ...recentOrders.map((order: any) => ({
        id: `order-${order._id}`,
        type: 'order' as const,
        message: `طلب رقم ${order.orderNumber} بقيمة ${order.totalAmount} ر.س` ,
        timestamp: order.createdAt || order.orderDate,
        user: order.customerInfo?.name || 'عميل',
        priority: ['pending', 'confirmed', 'preparing'].includes(order.status) ? 'high' as const : 'medium' as const
      })),
      
      // Recent user updates/logins
      ...recentUsers.map((user: any) => ({
        id: `user-${user._id}`,
        type: 'staff' as const,
        message: `${user.name || user.username} قام بنشاط مؤخرًا`,
        timestamp: user.lastLogin || user.updatedAt,
        user: user.name || user.username,
        priority: 'low' as const
      })),
      
      // Notifications
      ...recentNotifications.map((n: any) => ({
        id: `notification-${n._id}`,
        type: (n.type || 'system') as 'order' | 'system' | 'staff' | 'inventory' | 'alert',
        message: n.message || n.title,
        timestamp: n.timestamp || n.createdAt,
        user: n.department || 'النظام',
        priority: (n.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent'
      })),
      
      // Inventory alerts
      ...inventoryAlerts.map((item: any) => ({
        id: `inventory-${item._id}`,
        type: 'inventory' as const,
        message: item.status === 'out_of_stock'
          ? `نفد المخزون: ${item.ingredientName}`
          : `مخزون منخفض: ${item.ingredientName}`,
        timestamp: item.updatedAt || item.lastUpdated,
        user: 'المخزون',
        priority: item.status === 'out_of_stock' ? 'urgent' as const : 'high' as const
      }))
    ];
    
    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json({
      success: true,
      data: activities.slice(0, 20) // Return top 20 activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}






