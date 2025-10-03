import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/lib/models/Location';
import { CacheInvalidation, getCacheHeaders, noCacheHeaders } from '@/lib/cache-invalidation';

// GET all locations
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    const locations = await Location.find({ status: 'active' }).sort({ order: 1 });

    return NextResponse.json(
      { success: true, data: locations },
      { headers: getCacheHeaders(admin === 'true') }
    );
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

    // Invalidate all location-related caches
    CacheInvalidation.locations();

    return NextResponse.json(
      { success: true, data: location },
      { status: 201, headers: noCacheHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
