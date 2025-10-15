import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';
import Category from '@/lib/models/Category';
import MaterialUsage from '@/lib/models/MaterialUsage';
import Material from '@/lib/models/Material';
import WasteLog from '@/lib/models/WasteLog';
import User from '@/lib/models/User';
import AnalyticsReport from '@/lib/models/AnalyticsReport';

// GET comprehensive analytics report
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'month';
    const generatedBy = searchParams.get('generatedBy') || 'system';

    // Calculate date range based on period
    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        start = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
        start.setHours(0, 0, 0, 0);
        end = new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000));
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        } else {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
    }

    // Get all data in parallel
    const [
      orders,
      menuItems,
      categories,
      materialUsage,
      materials,
      wasteLogs,
      users
    ] = await Promise.all([
      Order.find({
        orderDate: { $gte: start, $lt: end },
        status: { $in: ['confirmed', 'preparing', 'ready', 'delivered'] }
      }).lean(),
      MenuItem.find({}).lean(),
      Category.find({}).lean(),
      MaterialUsage.find({
        usageDate: { $gte: start, $lt: end }
      }).lean(),
      Material.find({}).lean(),
      WasteLog.find({
        wasteDate: { $gte: start, $lt: end }
      }).lean(),
      User.find({ isActive: true }).lean()
    ]);

    // Create lookup maps
    const menuItemsMap = new Map(menuItems.map(item => [item._id.toString(), item]));
    const categoriesMap = new Map(categories.map(cat => [cat._id.toString(), cat]));
    const materialsMap = new Map(materials.map(mat => [mat._id.toString(), mat]));
    const usersMap = new Map(users.map(user => [user._id.toString(), user]));

    // Calculate sales data
    const salesData = calculateSalesData(orders, start, end);
    
    // Calculate revenue data
    const revenueData = calculateRevenueData(orders, menuItemsMap, categoriesMap);
    
    // Calculate profit data
    const profitData = calculateProfitData(orders, menuItemsMap, categoriesMap);
    
    // Calculate best selling data
    const bestSellingData = calculateBestSellingData(orders, menuItemsMap, categoriesMap);
    
    // Calculate peak hours data
    const peakHoursData = calculatePeakHoursData(orders);
    
    // Calculate staff performance data
    const staffPerformanceData = calculateStaffPerformanceData(orders, usersMap);
    
    // Calculate inventory data
    const inventoryData = calculateInventoryData(materialUsage, materialsMap, start, end);
    
    // Calculate waste data
    const wasteData = calculateWasteData(wasteLogs);

    // Calculate KPIs
    const kpis = {
      totalSales: salesData.totalSales,
      totalProfit: profitData.totalProfit,
      ordersToday: orders.filter(o => {
        const orderDate = new Date(o.orderDate);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }).length,
      topItem: bestSellingData.topItems[0]?.itemName || 'N/A',
      averageOrderValue: salesData.averageOrderValue,
      profitMargin: profitData.profitMargin,
      inventoryTurnover: inventoryData.turnoverRate,
      staffEfficiency: staffPerformanceData.length > 0 
        ? staffPerformanceData.reduce((sum, staff) => sum + (staff.efficiency || 0), 0) / staffPerformanceData.length 
        : 0
    };

    // Normalize period to match AnalyticsReport schema enum
    const schemaPeriod = (
      period === 'day' ? 'daily' :
      period === 'week' ? 'weekly' :
      period === 'month' ? 'monthly' :
      period === 'year' ? 'yearly' : 'custom'
    ) as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

    // Create comprehensive report
    const report = {
      reportType: 'comprehensive',
      period: schemaPeriod,
      startDate: start,
      endDate: end,
      generatedAt: new Date(),
      generatedBy,
      salesData,
      revenueData,
      profitData,
      bestSellingData,
      peakHoursData,
      staffPerformanceData,
      inventoryData,
      wasteData,
      kpis
    };

    // Save report to database
    const savedReport = await AnalyticsReport.create(report);

    return NextResponse.json({
      success: true,
      data: savedReport
    });

  } catch (error: any) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper functions for calculations
function calculateSalesData(orders: any[], start: Date, end: Date) {
  const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Sales by day
  const salesByDay = new Map<string, { sales: number; orders: number }>();
  orders.forEach(order => {
    const date = new Date(order.orderDate).toISOString().split('T')[0];
    const existing = salesByDay.get(date) || { sales: 0, orders: 0 };
    existing.sales += order.totalAmount || 0;
    existing.orders += 1;
    salesByDay.set(date, existing);
  });

  // Sales by hour
  const salesByHour = new Map<number, { sales: number; orders: number }>();
  orders.forEach(order => {
    const hour = new Date(order.orderDate).getHours();
    const existing = salesByHour.get(hour) || { sales: 0, orders: 0 };
    existing.sales += order.totalAmount || 0;
    existing.orders += 1;
    salesByHour.set(hour, existing);
  });

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    salesByDay: Array.from(salesByDay.entries()).map(([date, data]) => ({
      date,
      sales: data.sales,
      orders: data.orders
    })),
    salesByHour: Array.from(salesByHour.entries()).map(([hour, data]) => ({
      hour,
      sales: data.sales,
      orders: data.orders
    }))
  };
}

function calculateRevenueData(orders: any[], menuItemsMap: Map<string, any>, categoriesMap: Map<string, any>) {
  const revenueByDepartment = new Map<string, number>();
  const revenueByCategory = new Map<string, { name: string; revenue: number }>();

  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const menuItem = menuItemsMap.get(item.menuItemId);
      if (menuItem) {
        const category = categoriesMap.get(menuItem.categoryId);
        const categoryName = category?.name || 'Unknown';
        
        // Department revenue
        const deptRevenue = revenueByDepartment.get(item.department) || 0;
        revenueByDepartment.set(item.department, deptRevenue + item.totalPrice);
        
        // Category revenue
        const catData = revenueByCategory.get(menuItem.categoryId) || { name: categoryName, revenue: 0 };
        catData.revenue += item.totalPrice;
        revenueByCategory.set(menuItem.categoryId, catData);
      }
    });
  });

  const totalRevenue = Array.from(revenueByDepartment.values()).reduce((sum, rev) => sum + rev, 0);

  return {
    totalRevenue,
    revenueByDepartment: Array.from(revenueByDepartment.entries()).map(([department, revenue]) => ({
      department,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
    })),
    revenueByCategory: Array.from(revenueByCategory.entries()).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      revenue: data.revenue,
      percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
    }))
  };
}

function calculateProfitData(orders: any[], menuItemsMap: Map<string, any>, categoriesMap: Map<string, any>) {
  const itemProfits = new Map<string, { name: string; profit: number; cost: number; quantity: number }>();
  const categoryProfits = new Map<string, { name: string; profit: number; cost: number }>();

  let totalProfit = 0;
  let totalCost = 0;

  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const menuItem = menuItemsMap.get(item.menuItemId);
      if (menuItem && menuItem.cost) {
        const itemCost = menuItem.cost * item.quantity;
        const itemProfit = item.totalPrice - itemCost;
        
        totalProfit += itemProfit;
        totalCost += itemCost;

        // Item profits
        const itemData = itemProfits.get(item.menuItemId) || {
          name: item.menuItemName,
          profit: 0,
          cost: 0,
          quantity: 0
        };
        itemData.profit += itemProfit;
        itemData.cost += itemCost;
        itemData.quantity += item.quantity;
        itemProfits.set(item.menuItemId, itemData);

        // Category profits
        const category = categoriesMap.get(menuItem.categoryId);
        const categoryName = category?.name || 'Unknown';
        const catData = categoryProfits.get(menuItem.categoryId) || {
          name: categoryName,
          profit: 0,
          cost: 0
        };
        catData.profit += itemProfit;
        catData.cost += itemCost;
        categoryProfits.set(menuItem.categoryId, catData);
      }
    });
  });

  const profitMargin = totalCost > 0 ? (totalProfit / (totalCost + totalProfit)) * 100 : 0;

  return {
    totalProfit,
    totalCost,
    profitMargin,
    topProfitableItems: Array.from(itemProfits.entries())
      .map(([itemId, data]) => ({
        itemId,
        itemName: data.name,
        profit: data.profit,
        margin: data.cost > 0 ? (data.profit / (data.cost + data.profit)) * 100 : 0,
        quantitySold: data.quantity
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10),
    topProfitableCategories: Array.from(categoryProfits.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        profit: data.profit,
        margin: data.cost > 0 ? (data.profit / (data.cost + data.profit)) * 100 : 0
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)
  };
}

function calculateBestSellingData(orders: any[], menuItemsMap: Map<string, any>, categoriesMap: Map<string, any>) {
  const itemSales = new Map<string, { name: string; quantity: number; revenue: number; department: string }>();
  const categorySales = new Map<string, { name: string; quantity: number; revenue: number }>();

  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const menuItem = menuItemsMap.get(item.menuItemId);
      if (menuItem) {
        const category = categoriesMap.get(menuItem.categoryId);
        const categoryName = category?.name || 'Unknown';

        // Item sales
        const itemData = itemSales.get(item.menuItemId) || {
          name: item.menuItemName,
          quantity: 0,
          revenue: 0,
          department: item.department
        };
        itemData.quantity += item.quantity;
        itemData.revenue += item.totalPrice;
        itemSales.set(item.menuItemId, itemData);

        // Category sales
        const catData = categorySales.get(menuItem.categoryId) || {
          name: categoryName,
          quantity: 0,
          revenue: 0
        };
        catData.quantity += item.quantity;
        catData.revenue += item.totalPrice;
        categorySales.set(menuItem.categoryId, catData);
      }
    });
  });

  return {
    topItems: Array.from(itemSales.entries())
      .map(([itemId, data]) => ({
        itemId,
        itemName: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue,
        department: data.department
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10),
    topCategories: Array.from(categorySales.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5)
  };
}

function calculatePeakHoursData(orders: any[]) {
  const hourData = new Map<number, { orders: number; revenue: number }>();

  orders.forEach(order => {
    const hour = new Date(order.orderDate).getHours();
    const existing = hourData.get(hour) || { orders: 0, revenue: 0 };
    existing.orders += 1;
    existing.revenue += order.totalAmount || 0;
    hourData.set(hour, existing);
  });

  const peakHours = Array.from(hourData.entries())
    .map(([hour, data]) => {
      let intensity: 'low' | 'medium' | 'high' | 'peak' = 'low';
      if (data.orders >= 10) intensity = 'peak';
      else if (data.orders >= 5) intensity = 'high';
      else if (data.orders >= 2) intensity = 'medium';

      return {
        hour,
        orders: data.orders,
        revenue: data.revenue,
        intensity
      };
    })
    .sort((a, b) => a.hour - b.hour);

  const totalOrders = orders.length;
  const averageOrdersPerHour = totalOrders / 24;

  // Find busiest and quietest days
  const dayData = new Map<string, number>();
  orders.forEach(order => {
    const day = new Date(order.orderDate).toLocaleDateString('en-US', { weekday: 'long' });
    dayData.set(day, (dayData.get(day) || 0) + 1);
  });

  const sortedDays = Array.from(dayData.entries()).sort((a, b) => b[1] - a[1]);
  const busiestDay = sortedDays[0]?.[0] || 'N/A';
  const quietestDay = sortedDays[sortedDays.length - 1]?.[0] || 'N/A';

  return {
    peakHours,
    busiestDay,
    quietestDay,
    averageOrdersPerHour
  };
}

function calculateStaffPerformanceData(orders: any[], usersMap: Map<string, any>) {
  const staffData = new Map<string, { name: string; role: string; orders: number; revenue: number }>();

  orders.forEach(order => {
    if (order.assignedTo) {
      Object.entries(order.assignedTo).forEach(([department, staffId]) => {
        if (staffId) {
          const user = usersMap.get(staffId.toString());
          if (user) {
            const existing = staffData.get(staffId) || {
              name: user.name,
              role: user.role,
              orders: 0,
              revenue: 0
            };
            existing.orders += 1;
            existing.revenue += order.totalAmount || 0;
            staffData.set(staffId, existing);
          }
        }
      });
    }
  });

  return Array.from(staffData.entries()).map(([staffId, data]) => ({
    staffId,
    staffName: data.name,
    role: data.role,
    totalOrders: data.orders,
    totalRevenue: data.revenue,
    averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
    efficiency: data.orders // Simplified efficiency metric
  }));
}

function calculateInventoryData(materialUsage: any[], materialsMap: Map<string, any>, start: Date, end: Date) {
  const materialUsageMap = new Map<string, { quantity: number; cost: number }>();
  let totalInventoryValue = 0;
  let costOfGoodsSold = 0;

  materialsMap.forEach(material => {
    totalInventoryValue += material.currentQuantity * material.costPerUnit;
  });

  materialUsage.forEach(usage => {
    const material = materialsMap.get(usage.materialId);
    if (material) {
      const usageCost = usage.quantityUsed * material.costPerUnit;
      costOfGoodsSold += usageCost;

      const existing = materialUsageMap.get(usage.materialId) || { quantity: 0, cost: 0 };
      existing.quantity += usage.quantityUsed;
      existing.cost += usageCost;
      materialUsageMap.set(usage.materialId, existing);
    }
  });

  const turnoverRate = totalInventoryValue > 0 ? costOfGoodsSold / totalInventoryValue : 0;

  const fastMovingItems = Array.from(materialUsageMap.entries())
    .map(([materialId, data]) => {
      const material = materialsMap.get(materialId);
      return {
        materialId,
        materialName: material?.name || 'Unknown',
        turnoverRate: material?.currentQuantity > 0 ? data.quantity / material.currentQuantity : 0,
        quantityUsed: data.quantity
      };
    })
    .sort((a, b) => b.turnoverRate - a.turnoverRate)
    .slice(0, 10);

  const slowMovingItems = Array.from(materialUsageMap.entries())
    .map(([materialId, data]) => {
      const material = materialsMap.get(materialId);
      return {
        materialId,
        materialName: material?.name || 'Unknown',
        turnoverRate: material?.currentQuantity > 0 ? data.quantity / material.currentQuantity : 0,
        quantityUsed: data.quantity
      };
    })
    .sort((a, b) => a.turnoverRate - b.turnoverRate)
    .slice(0, 10);

  return {
    turnoverRate,
    fastMovingItems,
    slowMovingItems,
    totalInventoryValue,
    costOfGoodsSold
  };
}

function calculateWasteData(wasteLogs: any[]) {
  const totalWasteCost = wasteLogs.reduce((sum, log) => sum + log.cost, 0);
  
  const wasteByCategory = new Map<string, { cost: number; count: number }>();
  const wasteByItem = new Map<string, { cost: number; frequency: number }>();
  const wasteTrends = new Map<string, { cost: number; items: number }>();

  wasteLogs.forEach(log => {
    // By category
    const catData = wasteByCategory.get(log.category) || { cost: 0, count: 0 };
    catData.cost += log.cost;
    catData.count += 1;
    wasteByCategory.set(log.category, catData);

    // By item
    const itemData = wasteByItem.get(log.itemName) || { cost: 0, frequency: 0 };
    itemData.cost += log.cost;
    itemData.frequency += 1;
    wasteByItem.set(log.itemName, itemData);

    // Trends by date
    const date = new Date(log.wasteDate).toISOString().split('T')[0];
    const trendData = wasteTrends.get(date) || { cost: 0, items: 0 };
    trendData.cost += log.cost;
    trendData.items += 1;
    wasteTrends.set(date, trendData);
  });

  return {
    totalWasteCost,
    wasteByCategory: Array.from(wasteByCategory.entries()).map(([category, data]) => ({
      category,
      cost: data.cost,
      percentage: totalWasteCost > 0 ? (data.cost / totalWasteCost) * 100 : 0
    })),
    wasteTrends: Array.from(wasteTrends.entries()).map(([date, data]) => ({
      date,
      cost: data.cost,
      items: data.items
    })),
    topWasteItems: Array.from(wasteByItem.entries())
      .map(([itemName, data]) => ({
        itemName,
        cost: data.cost,
        frequency: data.frequency
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10)
  };
}





