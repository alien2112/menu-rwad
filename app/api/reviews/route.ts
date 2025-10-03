import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { CacheInvalidation, getCacheHeaders, noCacheHeaders } from '@/lib/cache-invalidation';

// GET - Fetch approved reviews
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(20);

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

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { author_name, rating, text, email, phone } = body;

    // Validation
    if (!author_name || !rating || !text) {
      return NextResponse.json(
        { success: false, error: 'Name, rating, and review text are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Review text must be less than 500 characters' },
        { status: 400 }
      );
    }

    const review = new Review({
      author_name,
      rating,
      text,
      email,
      phone,
      isApproved: false // Reviews need approval
    });

    await review.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully! It will be published after approval.',
        data: review
      },
      { headers: noCacheHeaders() }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

