import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItemReview from '@/lib/models/MenuItemReview';
import { CacheInvalidation, getCacheHeaders, noCacheHeaders } from '@/lib/cache-invalidation';

// GET all reviews for a menu item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    // Only return approved reviews for public view
    const reviews = await MenuItemReview.find({
      menuItemId: id,
      isApproved: true
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: reviews },
      { headers: getCacheHeaders(admin === 'true') }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST create new review for a menu item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const review = await MenuItemReview.create({
      ...body,
      menuItemId: id,
      isApproved: false // Reviews need approval by default
    });

    return NextResponse.json(
      { success: true, data: review },
      { status: 201, headers: noCacheHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
