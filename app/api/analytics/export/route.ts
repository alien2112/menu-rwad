import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';
import Category from '@/lib/models/Category';
import MaterialUsage from '@/lib/models/MaterialUsage';
import Material from '@/lib/models/Material';
import WasteLog from '@/lib/models/WasteLog';
import User from '@/lib/models/User';

// GET export analytics data
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv, json
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'month';
    const type = searchParams.get('type') || 'comprehensive'; // sales, profit, inventory, staff, waste, comprehensive

    // Calculate date range
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

    let exportData: any = {};

    if (type === 'comprehensive' || type === 'sales') {
      // Sales data
      const orders = await Order.find({
        orderDate: { $gte: start, $lt: end },
        status: { $in: ['confirmed', 'preparing', 'ready', 'delivered'] }
      }).lean();

      exportData.sales = {
        summary: {
          totalSales: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
          totalOrders: orders.length,
          averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length : 0
        },
        orders: orders.map(order => ({
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          orderDate: order.orderDate,
          items: order.items?.length || 0,
          customerName: order.customerInfo?.name || 'N/A',
          customerPhone: order.customerInfo?.phone || 'N/A'
        }))
      };
    }

    if (type === 'comprehensive' || type === 'profit') {
      // Profit data
      const orders = await Order.find({
        orderDate: { $gte: start, $lt: end },
        status: { $in: ['confirmed', 'preparing', 'ready', 'delivered'] }
      }).lean();
      
      const menuItems = await MenuItem.find({}).lean();
      const menuItemsMap = new Map(menuItems.map(item => [item._id.toString(), item]));

      let totalProfit = 0;
      let totalCost = 0;
      const itemProfits: any[] = [];

      orders.forEach(order => {
        order.items?.forEach((item: any) => {
          const menuItem = menuItemsMap.get(item.menuItemId);
          if (menuItem && menuItem.cost) {
            const itemCost = menuItem.cost * item.quantity;
            const itemProfit = item.totalPrice - itemCost;
            
            totalProfit += itemProfit;
            totalCost += itemCost;

            itemProfits.push({
              itemName: item.menuItemName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              cost: itemCost,
              profit: itemProfit,
              margin: itemCost > 0 ? (itemProfit / (itemCost + itemProfit)) * 100 : 0
            });
          }
        });
      });

      exportData.profit = {
        summary: {
          totalProfit,
          totalCost,
          profitMargin: totalCost > 0 ? (totalProfit / (totalCost + totalProfit)) * 100 : 0
        },
        itemDetails: itemProfits
      };
    }

    if (type === 'comprehensive' || type === 'inventory') {
      // Inventory data
      const materialUsage = await MaterialUsage.find({
        usageDate: { $gte: start, $lt: end }
      }).lean();
      
      const materials = await Material.find({}).lean();
      const materialsMap = new Map(materials.map(mat => [mat._id.toString(), mat]));

      const inventoryData = materialUsage.map(usage => {
        const material = materialsMap.get(usage.materialId);
        return {
          materialName: material?.name || 'Unknown',
          quantityUsed: usage.quantityUsed,
          unit: usage.unit,
          department: usage.department,
          usageType: usage.usageType,
          usageDate: usage.usageDate,
          cost: material ? usage.quantityUsed * material.costPerUnit : 0
        };
      });

      exportData.inventory = {
        usage: inventoryData,
        summary: {
          totalUsageCost: inventoryData.reduce((sum, item) => sum + item.cost, 0),
          totalItems: inventoryData.length
        }
      };
    }

    if (type === 'comprehensive' || type === 'staff') {
      // Staff performance data
      const orders = await Order.find({
        orderDate: { $gte: start, $lt: end },
        status: { $in: ['confirmed', 'preparing', 'ready', 'delivered'] }
      }).lean();
      
      const users = await User.find({ isActive: true }).lean();
      const usersMap = new Map(users.map(user => [user._id.toString(), user]));

      const staffData = new Map<string, any>();

      orders.forEach(order => {
        if (order.assignedTo) {
          Object.entries(order.assignedTo).forEach(([department, staffId]) => {
            if (staffId) {
              const user = usersMap.get(staffId.toString());
              if (user) {
                const existing = staffData.get(staffId) || {
                  staffName: user.name,
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

      exportData.staff = {
        performance: Array.from(staffData.entries()).map(([staffId, data]) => ({
          staffId,
          staffName: data.staffName,
          role: data.role,
          totalOrders: data.orders,
          totalRevenue: data.revenue,
          averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0
        }))
      };
    }

    if (type === 'comprehensive' || type === 'waste') {
      // Waste data
      const wasteLogs = await WasteLog.find({
        wasteDate: { $gte: start, $lt: end }
      }).lean();

      exportData.waste = {
        logs: wasteLogs.map(log => ({
          itemName: log.itemName,
          category: log.category,
          quantity: log.quantity,
          unit: log.unit,
          cost: log.cost,
          reason: log.reason,
          department: log.department,
          wasteDate: log.wasteDate,
          isRecoverable: log.isRecoverable,
          recoveryAction: log.recoveryAction
        })),
        summary: {
          totalCost: wasteLogs.reduce((sum, log) => sum + log.cost, 0),
          totalItems: wasteLogs.reduce((sum, log) => sum + log.quantity, 0),
          totalLogs: wasteLogs.length
        }
      };
    }

    // Add metadata
    exportData.metadata = {
      exportDate: new Date().toISOString(),
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      type,
      format
    };

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportData
      });
    }

    // CSV format
    if (format === 'csv') {
      let csvContent = '';
      
      if (type === 'comprehensive' || type === 'sales') {
        csvContent += 'SALES DATA\n';
        csvContent += 'Order Number,Total Amount,Status,Order Date,Items Count,Customer Name,Customer Phone\n';
        
        exportData.sales.orders.forEach((order: any) => {
          csvContent += `"${order.orderNumber}","${order.totalAmount}","${order.status}","${order.orderDate}","${order.items}","${order.customerName}","${order.customerPhone}"\n`;
        });
        
        csvContent += '\n';
      }

      if (type === 'comprehensive' || type === 'profit') {
        csvContent += 'PROFIT DATA\n';
        csvContent += 'Item Name,Quantity,Unit Price,Total Price,Cost,Profit,Margin\n';
        
        exportData.profit.itemDetails.forEach((item: any) => {
          csvContent += `"${item.itemName}","${item.quantity}","${item.unitPrice}","${item.totalPrice}","${item.cost}","${item.profit}","${item.margin.toFixed(2)}%"\n`;
        });
        
        csvContent += '\n';
      }

      if (type === 'comprehensive' || type === 'waste') {
        csvContent += 'WASTE DATA\n';
        csvContent += 'Item Name,Category,Quantity,Unit,Cost,Reason,Department,Waste Date,Recoverable,Recovery Action\n';
        
        exportData.waste.logs.forEach((log: any) => {
          csvContent += `"${log.itemName}","${log.category}","${log.quantity}","${log.unit}","${log.cost}","${log.reason}","${log.department}","${log.wasteDate}","${log.isRecoverable}","${log.recoveryAction || ''}"\n`;
        });
        
        csvContent += '\n';
      }

      const filename = `analytics-${type}-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid format specified'
    }, { status: 400 });

  } catch (error: any) {
    console.error('[Analytics Export API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}





