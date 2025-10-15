import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import MaterialUsage from '@/lib/models/MaterialUsage';
import Notification from '@/lib/models/Notification';
import ArchiveLog from '@/lib/models/ArchiveLog';
import * as XLSX from 'xlsx';

// POST /api/cleanup-with-export - Clean up old data with Excel export
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check if this is a scheduled cleanup (from cron job)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = {
      ordersArchived: 0,
      usageArchived: 0,
      notificationsArchived: 0,
      ordersDeleted: 0,
      usageDeleted: 0,
      notificationsDeleted: 0,
      errors: [] as string[],
      excelFiles: [] as { type: string; fileName: string; data: string; mimeType: string }[]
    };

    // Archive and clean orders older than 2 weeks
    try {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Archive orders
      const ordersToArchive = await Order.find({
        orderDate: { $lt: twoWeeksAgo }
      });

      if (ordersToArchive.length > 0) {
        // Create archive
        const archiveLog = new ArchiveLog({
          archiveType: 'orders',
          period: {
            startDate: new Date(0), // From beginning
            endDate: twoWeeksAgo
          },
          recordCount: ordersToArchive.length,
          status: 'processing'
        });

        await archiveLog.save();

        // Convert to Excel FIRST
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(ordersToArchive);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
        
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        const fileName = `orders_cleanup_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Convert to base64 for download
        const base64Data = excelBuffer.toString('base64');
        
        try {
          // Update archive log
          await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
            status: 'completed',
            filePath: fileName,
            completedAt: new Date()
          });

          results.ordersArchived = ordersToArchive.length;
          
          // Add Excel file to results
          results.excelFiles.push({
            type: 'orders',
            fileName: fileName,
            data: base64Data,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          
          // ONLY DELETE AFTER SUCCESSFUL ARCHIVE
          await Order.deleteMany({
            orderDate: { $lt: twoWeeksAgo }
          });
          results.ordersDeleted = ordersToArchive.length;
          
        } catch (error) {
          await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
          results.errors.push(`Failed to archive orders: ${error}`);
          // DO NOT DELETE if archiving failed
        }
      }
    } catch (error) {
      results.errors.push(`Error processing orders: ${error}`);
    }

    // Archive and clean material usage older than 1 month
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const usageToArchive = await MaterialUsage.find({
        usageDate: { $lt: oneMonthAgo }
      });

      if (usageToArchive.length > 0) {
        // Create archive
        const archiveLog = new ArchiveLog({
          archiveType: 'usage',
          period: {
            startDate: new Date(0),
            endDate: oneMonthAgo
          },
          recordCount: usageToArchive.length,
          status: 'processing'
        });

        await archiveLog.save();

        try {
          // Convert to Excel FIRST
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(usageToArchive);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Usage');
          
          const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
          const fileName = `usage_cleanup_${new Date().toISOString().split('T')[0]}.xlsx`;
          
          // Convert to base64 for download
          const base64Data = excelBuffer.toString('base64');
          
          await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
            status: 'completed',
            filePath: fileName,
            completedAt: new Date()
          });

          results.usageArchived = usageToArchive.length;
          
          // Add Excel file to results
          results.excelFiles.push({
            type: 'usage',
            fileName: fileName,
            data: base64Data,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          
          // ONLY DELETE AFTER SUCCESSFUL ARCHIVE
          await MaterialUsage.deleteMany({
            usageDate: { $lt: oneMonthAgo }
          });
          results.usageDeleted = usageToArchive.length;
          
        } catch (error) {
          await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
          results.errors.push(`Failed to archive usage: ${error}`);
          // DO NOT DELETE if archiving failed
        }
      }
    } catch (error) {
      results.errors.push(`Error processing usage: ${error}`);
    }

    // Clean resolved notifications older than 1 week
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const notificationsToArchive = await Notification.find({
        isResolved: true,
        resolvedAt: { $lt: oneWeekAgo }
      });

      if (notificationsToArchive.length > 0) {
        // Create archive
        const archiveLog = new ArchiveLog({
          archiveType: 'notifications',
          period: {
            startDate: new Date(0),
            endDate: oneWeekAgo
          },
          recordCount: notificationsToArchive.length,
          status: 'processing'
        });

        await archiveLog.save();

        try {
          // Convert to Excel FIRST
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(notificationsToArchive);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Notifications');
          
          const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
          const fileName = `notifications_cleanup_${new Date().toISOString().split('T')[0]}.xlsx`;
          
          // Convert to base64 for download
          const base64Data = excelBuffer.toString('base64');
          
          await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
            status: 'completed',
            filePath: fileName,
            completedAt: new Date()
          });

          results.notificationsArchived = notificationsToArchive.length;
          
          // Add Excel file to results
          results.excelFiles.push({
            type: 'notifications',
            fileName: fileName,
            data: base64Data,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          
          // ONLY DELETE AFTER SUCCESSFUL ARCHIVE
          await Notification.deleteMany({
            isResolved: true,
            resolvedAt: { $lt: oneWeekAgo }
          });
          results.notificationsDeleted = notificationsToArchive.length;
          
        } catch (error) {
          await ArchiveLog.findByIdAndUpdate(archiveLog._id, {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
          results.errors.push(`Failed to archive notifications: ${error}`);
          // DO NOT DELETE if archiving failed
        }
      }
    } catch (error) {
      results.errors.push(`Error processing notifications: ${error}`);
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Cleanup completed with Excel exports'
    });

  } catch (error) {
    console.error('Error in cleanup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform cleanup' },
      { status: 500 }
    );
  }
}

