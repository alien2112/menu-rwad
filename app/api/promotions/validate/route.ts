import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Promotion from '@/lib/models/Promotion';

export const dynamic = 'force-dynamic';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryId?: string;
}

interface ValidateRequest {
  code: string;
  cartItems: CartItem[];
  cartTotal: number;
}

// POST: Validate a promo code
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body: ValidateRequest = await req.json();
    const { code, cartItems, cartTotal } = body;

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promo code is required'
        },
        { status: 400 }
      );
    }

    // Find the promotion
    const promotion = await Promotion.findOne({
      code: code.toUpperCase(),
      type: 'discount-code',
    });

    if (!promotion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid promo code',
          message: 'الكود غير صحيح'
        },
        { status: 404 }
      );
    }

    // Check if promotion is active
    if (!promotion.active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promo code is not active',
          message: 'الكود غير نشط'
        },
        { status: 400 }
      );
    }

    // Check if promotion is expired
    if (promotion.isExpired()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promo code has expired',
          message: 'الكود منتهي الصلاحية'
        },
        { status: 400 }
      );
    }

    // Check if promotion is valid (within date range)
    if (!promotion.isValid()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promo code is not valid yet',
          message: 'الكود غير صالح حالياً'
        },
        { status: 400 }
      );
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Promo code usage limit reached',
          message: 'تم الوصول للحد الأقصى لاستخدام الكود'
        },
        { status: 400 }
      );
    }

    // Check minimum purchase amount
    if (promotion.minPurchaseAmount && cartTotal < promotion.minPurchaseAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum purchase amount is ${promotion.minPurchaseAmount}`,
          message: `الحد الأدنى للشراء هو ${promotion.minPurchaseAmount} ريال`
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;

    if (promotion.discountType === 'percent') {
      discountAmount = (cartTotal * (promotion.value || 0)) / 100;
    } else if (promotion.discountType === 'fixed') {
      discountAmount = promotion.value || 0;
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    const finalTotal = cartTotal - discountAmount;

    return NextResponse.json({
      success: true,
      data: {
        promotionId: promotion._id,
        code: promotion.code,
        name: promotion.name,
        discountType: promotion.discountType,
        discountValue: promotion.value,
        discountAmount,
        originalTotal: cartTotal,
        finalTotal,
      },
      message: 'تم تطبيق الكود بنجاح'
    });
  } catch (error: unknown) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate promo code',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
