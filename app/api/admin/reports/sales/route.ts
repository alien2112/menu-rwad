import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';
import { sanitizeString, sanitizePagination } from '@/lib/sanitize';

/**
 * Sales reports API for admin analytics
 * Provides comprehensive sales analytics and reporting
 */

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const reportType = sanitizeString(searchParams.get('type')) || 'summary';
    const from = sanitizeString(searchParams.get('from'));
    const to = sanitizeString(searchParams.get('to'));
    const department = sanitizeString(searchParams.get('department'));
    
    // Pagination for detailed reports
    const { page, limit } = sanitizePagination({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      maxLimit: 100
    });
    
    let result;
    
    switch (reportType) {
      case 'summary':
        result = await getSalesSummary(from, to, department);
        break;
      case 'daily':
        result = await getDailySales(from, to, department);
        break;
      case 'menu-items':
        result = await getMenuItemSales(from, to, department, page, limit);
        break;
      case 'departments':
        result = await getDepartmentSales(from, to);
        break;
      case 'hourly':
        result = await getHourlySales(from, to);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      reportType,
      dateRange: { from, to }
    });
    
  } catch (error) {
    console.error('Error generating sales report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate sales report' },
      { status: 500 }
    );
  }
}

// Get sales summary
async function getSalesSummary(from?: string, to?: string, department?: string) {
  const matchStage: any = {};
  
  if (from || to) {
    matchStage.orderDate = {};
    if (from) {
      matchStage.orderDate.$gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      matchStage.orderDate.$lte = toDate;
    }
  }
  
  if (department) {
    matchStage['items.department'] = department;
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalDiscount: { $sum: '$discountAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    }
  ];
  
  const [summary] = await Order.aggregate(pipeline);
  
  return {
    totalOrders: summary?.totalOrders || 0,
    totalRevenue: summary?.totalRevenue || 0,
    totalDiscount: summary?.totalDiscount || 0,
    averageOrderValue: summary?.averageOrderValue || 0,
    completedOrders: summary?.completedOrders || 0,
    pendingOrders: summary?.pendingOrders || 0,
    completionRate: summary?.totalOrders > 0 
      ? (summary.completedOrders / summary.totalOrders) * 100 
      : 0
  };
}

// Get daily sales
async function getDailySales(from?: string, to?: string, department?: string) {
  const matchStage: any = {};
  
  if (from || to) {
    matchStage.orderDate = {};
    if (from) {
      matchStage.orderDate.$gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      matchStage.orderDate.$lte = toDate;
    }
  }
  
  if (department) {
    matchStage['items.department'] = department;
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' },
          day: { $dayOfMonth: '$orderDate' }
        },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ];
  
  return await Order.aggregate(pipeline);
}

// Get menu item sales
async function getMenuItemSales(from?: string, to?: string, department?: string, page: number = 1, limit: number = 20) {
  const matchStage: any = {};
  
  if (from || to) {
    matchStage.orderDate = {};
    if (from) {
      matchStage.orderDate.$gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      matchStage.orderDate.$lte = toDate;
    }
  }
  
  if (department) {
    matchStage['items.department'] = department;
  }
  
  const pipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menuItemId',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'menuitems',
        localField: '_id',
        foreignField: '_id',
        as: 'menuItem'
      }
    },
    { $unwind: '$menuItem' },
    {
      $project: {
        menuItemId: '$_id',
        menuItemName: '$menuItem.name',
        menuItemNameEn: '$menuItem.nameEn',
        totalQuantity: 1,
        totalRevenue: 1,
        orderCount: 1,
        averagePrice: { $divide: ['$totalRevenue', '$totalQuantity'] }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  ];
  
  const results = await Order.aggregate(pipeline);
  
  // Get total count for pagination
  const countPipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    { $group: { _id: '$items.menuItemId' } },
    { $count: 'total' }
  ];
  
  const [countResult] = await Order.aggregate(countPipeline);
  const totalCount = countResult?.total || 0;
  
  return {
    items: results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit
    }
  };
}

// Get department sales
async function getDepartmentSales(from?: string, to?: string) {
  const matchStage: any = {};
  
  if (from || to) {
    matchStage.orderDate = {};
    if (from) {
      matchStage.orderDate.$gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      matchStage.orderDate.$lte = toDate;
    }
  }
  
  const pipeline = [
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.department',
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalQuantity: { $sum: '$items.quantity' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ];
  
  return await Order.aggregate(pipeline);
}

// Get hourly sales
async function getHourlySales(from?: string, to?: string) {
  const matchStage: any = {};
  
  if (from || to) {
    matchStage.orderDate = {};
    if (from) {
      matchStage.orderDate.$gte = new Date(from);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      matchStage.orderDate.$lte = toDate;
    }
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: { $hour: '$orderDate' },
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id': 1 } }
  ];
  
  return await Order.aggregate(pipeline);
}






