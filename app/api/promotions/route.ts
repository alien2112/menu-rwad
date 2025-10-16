import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Promotion from '@/lib/models/Promotion';

export const dynamic = 'force-dynamic';

// GET: Fetch all promotions (admin)
export async function GET() {
  try {
    await connectDB();

    const promotions = await Promotion.find()
      .populate('applicableItems', 'name nameEn')
      .populate('applicableCategories', 'name nameEn')
      .sort({ createdAt: -1 })
      .lean();

    // Add computed fields
    const promotionsWithStatus = promotions.map(promo => {
      const promoDoc = new Promotion(promo);
      return {
        ...promo,
        isValid: promoDoc.isValid(),
        isExpired: promoDoc.isExpired(),
        canBeUsed: promoDoc.canBeUsed(),
      };
    });

    return NextResponse.json({
      success: true,
      data: promotionsWithStatus,
    });
  } catch (error: unknown) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch promotions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Create a new promotion
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      name,
      nameEn,
      type,
      description,
      descriptionEn,
      startDate,
      endDate,
      active,
      code,
      discountType,
      value,
      usageLimit,
      minPurchaseAmount,
      buyQty,
      getQty,
      applicableItems,
      applicableCategories,
    } = body;

    // Validation
    if (!name || !type || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'name, type, startDate, and endDate are required'
        },
        { status: 400 }
      );
    }

    // Check for duplicate promo code
    if (type === 'discount-code' && code) {
      const existingPromo = await Promotion.findOne({ code: code.toUpperCase() });
      if (existingPromo) {
        return NextResponse.json(
          {
            success: false,
            error: 'Promo code already exists',
          },
          { status: 400 }
        );
      }
    }

    const promotionData: any = {
      name,
      nameEn,
      type,
      description,
      descriptionEn,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      active: active !== undefined ? active : true,
    };

    // Add type-specific fields
    if (type === 'discount-code') {
      promotionData.code = code?.toUpperCase();
      promotionData.discountType = discountType;
      promotionData.value = value;
      promotionData.usageLimit = usageLimit;
      promotionData.minPurchaseAmount = minPurchaseAmount || 0;
    }

    if (type === 'buy-x-get-y') {
      promotionData.buyQty = buyQty;
      promotionData.getQty = getQty;
      promotionData.applicableItems = applicableItems || [];
      promotionData.applicableCategories = applicableCategories || [];
    }

    const promotion = await Promotion.create(promotionData);

    return NextResponse.json({
      success: true,
      data: promotion,
      message: 'Promotion created successfully'
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create promotion',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Bulk delete promotions
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

    await Promotion.deleteMany({ _id: { $in: idArray } });

    return NextResponse.json({
      success: true,
      message: `${idArray.length} promotion(s) deleted successfully`
    });
  } catch (error: unknown) {
    console.error('Error deleting promotions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete promotions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
