import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HomepageImage from '@/lib/models/HomepageImage';

// GET all homepage images (optionally filter by section)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const admin = searchParams.get('admin'); // Check if admin request

    const query = section ? { section, status: 'active' } : { status: 'active' };
    const images = await HomepageImage.find(query).sort({ order: 1, createdAt: 1 });

    // Set appropriate cache headers
    const headers: Record<string, string> = {};

    if (admin === 'true') {
      // Admin requests - no cache
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      // Public requests - use stale-while-revalidate
      headers['Cache-Control'] = 'public, s-maxage=60, stale-while-revalidate=120';
    }

    return NextResponse.json({ success: true, data: images }, { headers });
  } catch (error: any) {
    console.error('[Homepage API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
