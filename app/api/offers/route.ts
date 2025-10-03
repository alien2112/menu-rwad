import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Offer from '@/lib/models/Offer';
import { cache, CacheTTL } from '@/lib/cache';

// GET all offers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    const cacheKey = 'offers:all';

    // Admin requests bypass cache
    if (admin !== 'true') {
      // Try cache first for public requests
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(
          { success: true, data: cachedData, cached: true },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
              'X-Cache-Status': 'HIT'
            }
          }
        );
      }
    }

    await dbConnect();
    const offers = await Offer.find({}).sort({ order: 1, createdAt: -1 });

    // Cache for public requests only
    if (admin !== 'true') {
      cache.set(cacheKey, offers, CacheTTL.ONE_MINUTE);
    }

    const headers: Record<string, string> = {};

    if (admin === 'true') {
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, s-maxage=60, stale-while-revalidate=120';
      headers['X-Cache-Status'] = 'MISS';
    }

    return NextResponse.json(
      { success: true, data: offers },
      { headers }
    );
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

    // Invalidate cache
    cache.delete('offers:all');

    // Revalidate public pages
    const { revalidatePath, revalidateTag } = await import('next/cache');
    revalidatePath('/');
    revalidatePath('/offers');
    revalidateTag('offers');

    return NextResponse.json(
      { success: true, data: offer },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
