import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QRCode from '@/lib/models/QRCode';

export const dynamic = 'force-dynamic';

// GET: Fetch all QR codes
export async function GET() {
  try {
    await connectDB();

    const qrCodes = await QRCode.find()
      .populate('branchId', 'name nameEn')
      .populate('categoryId', 'name nameEn')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: qrCodes,
    });
  } catch (error: unknown) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch QR codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Create a new QR code
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      name,
      nameEn,
      type,
      branchId,
      tableNumber,
      categoryId,
      customUrl,
      customization,
      isActive,
    } = body;

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'name and type are required'
        },
        { status: 400 }
      );
    }

    // Type-specific validation
    if (type === 'branch' && !branchId) {
      return NextResponse.json(
        {
          success: false,
          error: 'branchId is required for branch QR codes',
        },
        { status: 400 }
      );
    }

    if (type === 'table' && (!branchId || !tableNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: 'branchId and tableNumber are required for table QR codes',
        },
        { status: 400 }
      );
    }

    if (type === 'category' && !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: 'categoryId is required for category QR codes',
        },
        { status: 400 }
      );
    }

    const qrCodeData: any = {
      name,
      nameEn,
      type,
      branchId,
      tableNumber,
      categoryId,
      customUrl,
      customization: customization || {},
      isActive: isActive !== undefined ? isActive : true,
    };

    const qrCode = await QRCode.create(qrCodeData);

    // Populate references
    await qrCode.populate('branchId', 'name nameEn');
    await qrCode.populate('categoryId', 'name nameEn');

    return NextResponse.json({
      success: true,
      data: qrCode,
      message: 'QR code created successfully'
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating QR code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create QR code',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Bulk delete QR codes
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json(
        {
          success: false,
          error: 'No IDs provided'
        },
        { status: 400 }
      );
    }

    const idArray = ids.split(',');

    await QRCode.deleteMany({ _id: { $in: idArray } });

    return NextResponse.json({
      success: true,
      message: `${idArray.length} QR code(s) deleted successfully`
    });
  } catch (error: unknown) {
    console.error('Error deleting QR codes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete QR codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
