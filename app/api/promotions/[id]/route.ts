import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Promotion from '@/lib/models/Promotion';

export const dynamic = 'force-dynamic';

// GET: Fetch a single promotion by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const promotion = await Promotion.findById(params.id)
      .populate('applicableItems', 'name nameEn')
      .populate('applicableCategories', 'name nameEn')
      .lean();

    if (!promotion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promotion not found'
        },
        { status: 404 }
      );
    }

    // Add computed fields
    const promoDoc = new Promotion(promotion);
    const promotionWithStatus = {
      ...promotion,
      isValid: promoDoc.isValid(),
      isExpired: promoDoc.isExpired(),
      canBeUsed: promoDoc.canBeUsed(),
    };

    return NextResponse.json({
      success: true,
      data: promotionWithStatus,
    });
  } catch (error: unknown) {
    console.error('Error fetching promotion:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch promotion',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update a promotion
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

    // Check if code is being changed and if it conflicts
    if (type === 'discount-code' && code) {
      const existingPromo = await Promotion.findOne({
        code: code.toUpperCase(),
        _id: { $ne: params.id }
      });

      if (existingPromo) {
        return NextResponse.json(
          {
            success: false,
            error: 'Promo code already exists'
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (active !== undefined) updateData.active = active;

    // Update type-specific fields
    if (type === 'discount-code') {
      if (code !== undefined) updateData.code = code.toUpperCase();
      if (discountType !== undefined) updateData.discountType = discountType;
      if (value !== undefined) updateData.value = value;
      if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
      if (minPurchaseAmount !== undefined) updateData.minPurchaseAmount = minPurchaseAmount;

      // Clear Buy X Get Y fields
      updateData.buyQty = undefined;
      updateData.getQty = undefined;
      updateData.applicableItems = [];
      updateData.applicableCategories = [];
    }

    if (type === 'buy-x-get-y') {
      if (buyQty !== undefined) updateData.buyQty = buyQty;
      if (getQty !== undefined) updateData.getQty = getQty;
      if (applicableItems !== undefined) updateData.applicableItems = applicableItems;
      if (applicableCategories !== undefined) updateData.applicableCategories = applicableCategories;

      // Clear discount code fields
      updateData.code = undefined;
      updateData.discountType = undefined;
      updateData.value = undefined;
      updateData.usageLimit = undefined;
      updateData.minPurchaseAmount = 0;
    }

    const promotion = await Promotion.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!promotion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promotion not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promotion,
      message: 'Promotion updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating promotion:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update promotion',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a promotion
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const promotion = await Promotion.findByIdAndDelete(params.id);

    if (!promotion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promotion not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete promotion',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
