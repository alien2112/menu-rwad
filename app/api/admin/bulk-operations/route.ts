import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/lib/models/MenuItem';
import Order from '@/lib/models/Order';
import { InventoryItem } from '@/lib/models/Inventory';
import { sanitizeString, sanitizeObjectId, sanitizePagination } from '@/lib/sanitize';
import { sendSystemNotification } from '@/lib/notificationUtils';

/**
 * Bulk operations API for admin panel
 * Provides efficient bulk updates and operations
 */

// Bulk update menu items
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { operation, items, updates } = body;
    
    if (!operation || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (operation) {
      case 'bulk-update-prices':
        result = await bulkUpdatePrices(items, updates);
        break;
      case 'bulk-update-status':
        result = await bulkUpdateStatus(items, updates);
        break;
      case 'bulk-update-featured':
        result = await bulkUpdateFeatured(items, updates);
        break;
      case 'bulk-delete':
        result = await bulkDeleteItems(items);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }
    
    // Send notification about bulk operation
    await sendSystemNotification(
      `تم تنفيذ عملية ${operation} على ${result.updatedCount} عنصر`,
      'medium'
    );
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Bulk operation ${operation} completed successfully`
    });
    
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

// Bulk update prices
async function bulkUpdatePrices(itemIds: string[], updates: { price?: number; discountPrice?: number }) {
  const bulkOps = itemIds.map(id => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: updates }
    }
  }));
  
  const result = await MenuItem.bulkWrite(bulkOps);
  
  return {
    operation: 'bulk-update-prices',
    updatedCount: result.modifiedCount,
    totalItems: itemIds.length
  };
}

// Bulk update status
async function bulkUpdateStatus(itemIds: string[], updates: { status: string }) {
  const bulkOps = itemIds.map(id => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: updates }
    }
  }));
  
  const result = await MenuItem.bulkWrite(bulkOps);
  
  return {
    operation: 'bulk-update-status',
    updatedCount: result.modifiedCount,
    totalItems: itemIds.length
  };
}

// Bulk update featured status
async function bulkUpdateFeatured(itemIds: string[], updates: { featured: boolean }) {
  const bulkOps = itemIds.map(id => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: updates }
    }
  }));
  
  const result = await MenuItem.bulkWrite(bulkOps);
  
  return {
    operation: 'bulk-update-featured',
    updatedCount: result.modifiedCount,
    totalItems: itemIds.length
  };
}

// Bulk delete items
async function bulkDeleteItems(itemIds: string[]) {
  const result = await MenuItem.deleteMany({ _id: { $in: itemIds } });
  
  return {
    operation: 'bulk-delete',
    deletedCount: result.deletedCount,
    totalItems: itemIds.length
  };
}

// Get bulk operation status
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const operation = sanitizeString(searchParams.get('operation'));
    
    if (!operation) {
      return NextResponse.json(
        { success: false, error: 'Operation parameter required' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (operation) {
      case 'menu-stats':
        result = await getMenuStats();
        break;
      case 'inventory-alerts':
        result = await getInventoryAlerts();
        break;
      case 'order-summary':
        result = await getOrderSummary();
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error getting bulk operation status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get operation status' },
      { status: 500 }
    );
  }
}

// Get menu statistics
async function getMenuStats() {
  const pipeline = [
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];
  
  const statusStats = await MenuItem.aggregate(pipeline);
  
  const totalItems = await MenuItem.countDocuments();
  const featuredItems = await MenuItem.countDocuments({ featured: true });
  const activeItems = await MenuItem.countDocuments({ status: 'active' });
  
  return {
    totalItems,
    featuredItems,
    activeItems,
    statusBreakdown: statusStats
  };
}

// Get inventory alerts
async function getInventoryAlerts() {
  const lowStockItems = await InventoryItem.find({
    status: { $in: ['low_stock', 'out_of_stock'] }
  }).lean();
  
  const totalItems = await InventoryItem.countDocuments();
  const outOfStockCount = await InventoryItem.countDocuments({ status: 'out_of_stock' });
  const lowStockCount = await InventoryItem.countDocuments({ status: 'low_stock' });
  
  return {
    totalItems,
    outOfStockCount,
    lowStockCount,
    alertItems: lowStockItems
  };
}

// Get order summary
async function getOrderSummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const pipeline = [
    {
      $match: {
        orderDate: { $gte: today }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ];
  
  const todayStats = await Order.aggregate(pipeline);
  
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const completedOrders = await Order.countDocuments({ status: 'completed' });
  
  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    todayStats
  };
}