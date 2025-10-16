import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QRCode from '@/lib/models/QRCode';
import QRScan from '@/lib/models/QRScan';

export const dynamic = 'force-dynamic';

// GET: Get analytics for a specific QR code
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Verify QR code exists
    const qrCode = await QRCode.findById(params.id);

    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'QR code not found'
        },
        { status: 404 }
      );
    }

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overall statistics
    const statistics = await (QRScan as any).getStatistics(params.id, startDate, endDate);

    // Get scans by day
    const scansByDay = await (QRScan as any).getScansByDay(params.id, days);

    // Get scans by hour (for peak times)
    const scansByHour = await QRScan.aggregate([
      {
        $match: {
          qrCodeId: qrCode._id,
          scannedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$scannedAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get recent scans
    const recentScans = await QRScan.find({
      qrCodeId: params.id
    })
      .sort({ scannedAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        qrCode: {
          id: qrCode._id,
          name: qrCode.name,
          type: qrCode.type,
          totalScans: qrCode.totalScans,
          lastScannedAt: qrCode.lastScannedAt,
        },
        statistics,
        scansByDay,
        scansByHour,
        recentScans,
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching QR code analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
