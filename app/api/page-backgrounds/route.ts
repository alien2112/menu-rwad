import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageBackground from '@/lib/models/PageBackground';

// GET all page backgrounds
export async function GET() {
  try {
    await dbConnect();
    const backgrounds = await PageBackground.find({}).sort({ pageRoute: 1 });
    return NextResponse.json({ success: true, data: backgrounds });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST create new page background
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const background = await PageBackground.create(body);
    return NextResponse.json({ success: true, data: background }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

