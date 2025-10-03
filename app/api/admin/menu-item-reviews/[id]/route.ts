import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItemReview from '@/lib/models/MenuItemReview';
import { CacheInvalidation, noCacheHeaders } from '@/lib/cache-invalidation';

// PATCH update review (admin - approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const review = await MenuItemReview.findByIdAndUpdate(
      id,
      { isApproved: body.isApproved },
      { new: true }
    );

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Invalidate menu-item-review caches
    CacheInvalidation.menuItemReviews(review.menuItemId);

    return NextResponse.json(
      { success: true, data: review },
      { headers: noCacheHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE review (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const review = await MenuItemReview.findByIdAndDelete(id);

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Invalidate menu-item-review caches
    CacheInvalidation.menuItemReviews(review.menuItemId);

    return NextResponse.json(
      { success: true, data: {} },
      { headers: noCacheHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
