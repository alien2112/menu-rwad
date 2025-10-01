import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Offer from '@/lib/models/Offer';

// GET all offers
export async function GET() {
  try {
    await dbConnect();
    const offers = await Offer.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: offers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST create new offer
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const offer = await Offer.create(body);
    return NextResponse.json({ success: true, data: offer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
