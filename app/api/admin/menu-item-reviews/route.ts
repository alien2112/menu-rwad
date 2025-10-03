import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItemReview from '@/lib/models/MenuItemReview';
import { getCacheHeaders } from '@/lib/cache-invalidation';

// GET all menu item reviews (admin)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    const reviews = await MenuItemReview.find({}).sort({ createdAt: -1 });

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
