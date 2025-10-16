import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QRCode from '@/lib/models/QRCode';
import QRScan from '@/lib/models/QRScan';

export const dynamic = 'force-dynamic';

// POST: Track a QR code scan
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { token, sessionId } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token is required'
        },
        { status: 400 }
      );
    }

    // Find the QR code
    const qrCode = await QRCode.findOne({ token });

    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid QR code token'
        },
        { status: 404 }
      );
    }

    // Get user agent and device type
    const userAgent = req.headers.get('user-agent') || '';
    const deviceType = getDeviceType(userAgent);

    // Get IP address
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                      req.headers.get('x-real-ip') ||
                      'unknown';

    // Create scan record
    const scanData: any = {
      qrCodeId: qrCode._id,
      token: qrCode.token,
      scannedAt: new Date(),
      deviceType,
      userAgent,
      ipAddress,
      branchId: qrCode.branchId,
      tableNumber: qrCode.tableNumber,
      categoryId: qrCode.categoryId,
      sessionId,
    };

    await QRScan.create(scanData);

    // Increment QR code scan count
    await qrCode.incrementScans();

    return NextResponse.json({
      success: true,
      message: 'Scan tracked successfully',
      data: {
        qrCodeId: qrCode._id,
        url: qrCode.url,
        branchId: qrCode.branchId,
        tableNumber: qrCode.tableNumber,
        categoryId: qrCode.categoryId,
      }
    });
  } catch (error: unknown) {
    console.error('Error tracking QR scan:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track scan',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to detect device type
function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  const ua = userAgent.toLowerCase();

  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/.test(ua)) {
    return 'mobile';
  }

  if (/tablet|ipad|playbook|silk/.test(ua)) {
    return 'tablet';
  }

  if (/windows|macintosh|linux/.test(ua)) {
    return 'desktop';
  }

  return 'unknown';
}
