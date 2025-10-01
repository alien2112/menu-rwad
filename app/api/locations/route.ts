import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/lib/models/Location';

// GET all locations
export async function GET() {
  try {
    await dbConnect();
    const locations = await Location.find({ status: 'active' }).sort({ order: 1 });
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST create new location
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const location = await Location.create(body);
    return NextResponse.json({ success: true, data: location }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
