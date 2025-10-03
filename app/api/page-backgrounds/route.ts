import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageBackground from '@/lib/models/PageBackground';
import { CacheInvalidation, getCacheHeaders, noCacheHeaders } from '@/lib/cache-invalidation';

// GET all page backgrounds
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    const backgrounds = await PageBackground.find({}).sort({ pageRoute: 1 });

    return NextResponse.json(
      { success: true, data: backgrounds },
      { headers: getCacheHeaders(admin === 'true') }
    );
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

    // Invalidate all page-background-related caches
    CacheInvalidation.pageBackgrounds();

    return NextResponse.json(
      { success: true, data: background },
      { status: 201, headers: noCacheHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

