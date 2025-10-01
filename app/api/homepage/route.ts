import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HomepageImage from '@/lib/models/HomepageImage';

// GET all homepage images (optionally filter by section)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const query = section ? { section } : {};
    const images = await HomepageImage.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, data: images });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
