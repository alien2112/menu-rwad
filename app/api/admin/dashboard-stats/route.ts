import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import MenuItem from '@/lib/models/MenuItem';

export async function GET() {
  try {
    await dbConnect();
    
    // Get current date for today's calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Fetch all orders
    const allOrders = await Order.find({});
    
    // Calculate stats
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Today's orders
    const todayOrders = allOrders.filter(order => 
      order.orderDate >= today && order.orderDate < tomorrow
    );
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Pending orders
    const pendingOrders = allOrders.filter(order => 
      ['pending', 'confirmed', 'preparing'].includes(order.status)
    ).length;
    
    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Active staff
    const activeStaff = await User.countDocuments({ isActive: true });
    
    // Top selling item
    const itemSales = new Map();
    allOrders.forEach(order => {
      order.items.forEach(item => {
        const current = itemSales.get(item.menuItemName) || 0;
        itemSales.set(item.menuItemName, current + item.quantity);
      });
    });
    
    const topSellingItem = Array.from(itemSales.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا توجد بيانات';
    
    // System health (mock calculation)
    const systemHealth = calculateSystemHealth(allOrders, activeStaff);
    
    const stats = {
      totalOrders,
      totalRevenue,
      activeStaff,
      pendingOrders,
      todayRevenue,
      averageOrderValue,
      topSellingItem,
      systemHealth
    };
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

function calculateSystemHealth(orders: any[], activeStaff: number): 'excellent' | 'good' | 'warning' | 'critical' {
  // Mock system health calculation
  const pendingOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing'].includes(order.status)
  ).length;
  
  const totalOrders = orders.length;
  const pendingRatio = totalOrders > 0 ? pendingOrders / totalOrders : 0;
  
  if (pendingRatio < 0.1 && activeStaff >= 3) return 'excellent';
  if (pendingRatio < 0.2 && activeStaff >= 2) return 'good';
  if (pendingRatio < 0.4 && activeStaff >= 1) return 'warning';
  return 'critical';
}






