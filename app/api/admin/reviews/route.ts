import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { getCacheHeaders } from '@/lib/cache-invalidation';

// GET - Fetch all reviews for admin
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    const reviews = await Review.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: reviews
      },
      { headers: getCacheHeaders(admin === 'true') }
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

