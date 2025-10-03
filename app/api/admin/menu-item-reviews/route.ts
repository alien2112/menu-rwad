import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItemReview from '@/lib/models/MenuItemReview';

// GET all menu item reviews (admin)
export async function GET() {
  try {
    await dbConnect();
    const reviews = await MenuItemReview.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
