import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QRCode from '@/lib/models/QRCode';

export const dynamic = 'force-dynamic';

// GET: Fetch a single QR code by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const qrCode = await QRCode.findById(params.id)
      .populate('branchId', 'name nameEn')
      .populate('categoryId', 'name nameEn')
      .lean();

    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'QR code not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: qrCode,
    });
  } catch (error: unknown) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch QR code',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update a QR code
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (type !== undefined) updateData.type = type;
    if (branchId !== undefined) updateData.branchId = branchId;
    if (tableNumber !== undefined) updateData.tableNumber = tableNumber;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (customUrl !== undefined) updateData.customUrl = customUrl;
    if (customization !== undefined) updateData.customization = customization;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Regenerate URL if relevant fields changed
    if (branchId !== undefined || tableNumber !== undefined || categoryId !== undefined || customUrl !== undefined) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const existingQR = await QRCode.findById(params.id);

      if (existingQR) {
        let url = `${baseUrl}/menu?qr=${existingQR.token}`;

        if (branchId) {
          url += `&branch=${branchId}`;
        }
        if (tableNumber) {
          url += `&table=${tableNumber}`;
        }
        if (categoryId) {
          url += `&category=${categoryId}`;
        }
        if (customUrl) {
          url = customUrl;
        }

        updateData.url = url;
      }
    }

    const qrCode = await QRCode.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('branchId', 'name nameEn')
      .populate('categoryId', 'name nameEn');

    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'QR code not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: qrCode,
      message: 'QR code updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating QR code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update QR code',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a QR code
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const qrCode = await QRCode.findByIdAndDelete(params.id);

    if (!qrCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'QR code not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Error deleting QR code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete QR code',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
