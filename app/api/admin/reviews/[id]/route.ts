import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { CacheInvalidation, noCacheHeaders } from '@/lib/cache-invalidation';

// PATCH - Update review status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const { isApproved } = await request.json();

    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    ) as any;

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Invalidate all review-related caches
    CacheInvalidation.reviews();

    return NextResponse.json(
      {
        success: true,
        data: review
      },
      { headers: noCacheHeaders() }
    );
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const review = await Review.findByIdAndDelete(id) as any;

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Invalidate all review-related caches
    CacheInvalidation.reviews();

    return NextResponse.json(
      {
        success: true,
        message: 'Review deleted successfully'
      },
      { headers: noCacheHeaders() }
    );
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

