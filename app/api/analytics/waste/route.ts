import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WasteLog from '@/lib/models/WasteLog';

// GET waste analytics
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const department = searchParams.get('department');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    // Calculate date range
    const now = new Date();
    let start: Date, end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to last 30 days
      start = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      end = now;
    }

    // Build match stage for aggregation
    const matchStage: any = {
      wasteDate: { $gte: start, $lte: end }
    };
    
    if (department) {
      matchStage.department = department;
    }

    // Get waste summary
    const wasteSummary = await WasteLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' },
          totalItems: { $sum: '$quantity' },
          totalLogs: { $sum: 1 },
          averageCost: { $avg: '$cost' },
          byCategory: {
            $push: {
              category: '$category',
              cost: '$cost',
              quantity: '$quantity'
            }
          },
          byReason: {
            $push: {
              reason: '$reason',
              cost: '$cost',
              quantity: '$quantity'
            }
          },
          byDepartment: {
            $push: {
              department: '$department',
              cost: '$cost',
              quantity: '$quantity'
            }
          }
        }
      }
    ]);

    // Get waste trends
    let dateFormat: string;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%U';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const wasteTrends = await WasteLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$wasteDate'
            }
          },
          totalCost: { $sum: '$cost' },
          totalItems: { $sum: '$quantity' },
          totalLogs: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top waste items
    const topWasteItems = await WasteLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$itemName',
          totalCost: { $sum: '$cost' },
          totalQuantity: { $sum: '$quantity' },
          frequency: { $sum: 1 },
          averageCost: { $avg: '$cost' },
          categories: { $addToSet: '$category' },
          reasons: { $addToSet: '$reason' },
          departments: { $addToSet: '$department' }
        }
      },
      { $sort: { totalCost: -1 } },
      { $limit: 10 }
    ]);

    // Get waste by category
    const wasteByCategory = await WasteLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalCost: { $sum: '$cost' },
          totalQuantity: { $sum: '$quantity' },
          frequency: { $sum: 1 }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    // Get waste by reason
    const wasteByReason = await WasteLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$reason',
          totalCost: { $sum: '$cost' },
          totalQuantity: { $sum: '$quantity' },
          frequency: { $sum: 1 }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    // Get waste by department
    const wasteByDepartment = await WasteLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$department',
          totalCost: { $sum: '$cost' },
          totalQuantity: { $sum: '$quantity' },
          frequency: { $sum: 1 }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    // Calculate recovery rate
    const recoveryStats = await WasteLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalItems: { $sum: '$quantity' },
          recoverableItems: {
            $sum: {
              $cond: ['$isRecoverable', '$quantity', 0]
            }
          },
          totalCost: { $sum: '$cost' },
          recoverableCost: {
            $sum: {
              $cond: ['$isRecoverable', '$cost', 0]
            }
          }
        }
      }
    ]);

    const recoveryRate = recoveryStats[0] ? {
      itemRecoveryRate: recoveryStats[0].totalItems > 0 
        ? (recoveryStats[0].recoverableItems / recoveryStats[0].totalItems) * 100 
        : 0,
      costRecoveryRate: recoveryStats[0].totalCost > 0 
        ? (recoveryStats[0].recoverableCost / recoveryStats[0].totalCost) * 100 
        : 0
    } : { itemRecoveryRate: 0, costRecoveryRate: 0 };

    // Format the response
    const summary = wasteSummary[0] || {
      totalCost: 0,
      totalItems: 0,
      totalLogs: 0,
      averageCost: 0
    };

    // Calculate percentages for categories
    const wasteByCategoryWithPercentage = wasteByCategory.map(cat => ({
      ...cat,
      percentage: summary.totalCost > 0 ? (cat.totalCost / summary.totalCost) * 100 : 0
    }));

    const wasteByReasonWithPercentage = wasteByReason.map(reason => ({
      ...reason,
      percentage: summary.totalCost > 0 ? (reason.totalCost / summary.totalCost) * 100 : 0
    }));

    const wasteByDepartmentWithPercentage = wasteByDepartment.map(dept => ({
      ...dept,
      percentage: summary.totalCost > 0 ? (dept.totalCost / summary.totalCost) * 100 : 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCost: summary.totalCost,
          totalItems: summary.totalItems,
          totalLogs: summary.totalLogs,
          averageCost: summary.averageCost,
          ...recoveryRate
        },
        trends: wasteTrends,
        topWasteItems,
        wasteByCategory: wasteByCategoryWithPercentage,
        wasteByReason: wasteByReasonWithPercentage,
        wasteByDepartment: wasteByDepartmentWithPercentage,
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          groupBy
        }
      }
    });

  } catch (error: any) {
    console.error('[Waste Analytics API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}





