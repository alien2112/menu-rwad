import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/lib/models/Review';

// GET - Fetch all reviews for admin
export async function GET() {
  try {
    await dbConnect();
    
    const reviews = await Review.find()
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

