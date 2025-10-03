import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Offer from '@/lib/models/Offer';
import { cache, CacheTTL } from '@/lib/cache';

// GET all offers
export async function GET() {
  try {
    const cacheKey = 'offers:all';

    // Try cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(
        { success: true, data: cachedData, cached: true },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache-Status': 'HIT'
          }
        }
      );
    }

    await dbConnect();
    const offers = await Offer.find({}).sort({ order: 1, createdAt: -1 });

    // Cache for 10 minutes
    cache.set(cacheKey, offers, CacheTTL.TEN_MINUTES);

    return NextResponse.json(
      { success: true, data: offers },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache-Status': 'MISS'
        }
      }
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

    return NextResponse.json({ success: true, data: offer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
