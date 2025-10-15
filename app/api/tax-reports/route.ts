import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import TaxSettings from '@/lib/models/TaxSettings';

// GET tax reports
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'month'; // day, week, month, year

    // Get tax settings
    const taxSettings = await TaxSettings.getTaxSettings();
    
    if (!taxSettings.enableTaxHandling) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Tax handling is disabled',
          reports: []
        }
      });
    }

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

    // Get orders within the date range
    const orders = await Order.find({
      orderDate: {
        $gte: start,
        $lt: end
      },
      status: { $in: ['confirmed', 'preparing', 'ready', 'delivered'] }
    }).lean();

    // Calculate tax metrics
    let totalSales = 0;
    let totalTaxCollected = 0;
    let totalOrders = orders.length;
    let taxableSales = 0;

    orders.forEach(order => {
      const orderTotal = order.totalAmount || 0;
      totalSales += orderTotal;
      
      if (taxSettings.includeTaxInPrice) {
        // Tax is included in price, calculate tax amount
        const taxAmount = (orderTotal * taxSettings.vatRate) / (100 + taxSettings.vatRate);
        totalTaxCollected += taxAmount;
        taxableSales += orderTotal - taxAmount;
      } else {
        // Tax is added to price, calculate tax amount
        const taxAmount = (orderTotal * taxSettings.vatRate) / 100;
        totalTaxCollected += taxAmount;
        taxableSales += orderTotal;
      }
    });

    // Generate compliance report
    const complianceReport = {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        type: period
      },
      taxSettings: {
        taxType: taxSettings.taxType,
        vatRate: taxSettings.vatRate,
        complianceMode: taxSettings.complianceMode,
        taxNumber: taxSettings.taxNumber
      },
      summary: {
        totalOrders,
        totalSales: Number(totalSales.toFixed(2)),
        taxableSales: Number(taxableSales.toFixed(2)),
        totalTaxCollected: Number(totalTaxCollected.toFixed(2)),
        averageOrderValue: totalOrders > 0 ? Number((totalSales / totalOrders).toFixed(2)) : 0
      },
      breakdown: {
        taxRate: `${taxSettings.vatRate}%`,
        taxAmount: Number(totalTaxCollected.toFixed(2)),
        netAmount: Number(taxableSales.toFixed(2)),
        grossAmount: Number(totalSales.toFixed(2))
      }
    };

    // Generate daily breakdown for the period
    const dailyBreakdown = [];
    const currentDate = new Date(start);
    
    while (currentDate < end) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= dayStart && orderDate < dayEnd;
      });
      
      let daySales = 0;
      let dayTax = 0;
      
      dayOrders.forEach(order => {
        const orderTotal = order.totalAmount || 0;
        daySales += orderTotal;
        
        if (taxSettings.includeTaxInPrice) {
          dayTax += (orderTotal * taxSettings.vatRate) / (100 + taxSettings.vatRate);
        } else {
          dayTax += (orderTotal * taxSettings.vatRate) / 100;
        }
      });
      
      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        orders: dayOrders.length,
        sales: Number(daySales.toFixed(2)),
        tax: Number(dayTax.toFixed(2))
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        complianceReport,
        dailyBreakdown,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('[Tax Reports API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}





