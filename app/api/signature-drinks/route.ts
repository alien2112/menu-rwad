import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HomepageImage from '@/lib/models/HomepageImage';
import { cache, CacheTTL } from '@/lib/cache';

// GET all signature drinks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin'); // Check if admin request
    const cacheKey = 'signature-drinks:active';

    // Admin requests bypass cache
    if (admin !== 'true') {
      // Try cache first for public requests
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(
          {
            success: true,
            data: cachedData,
            count: cachedData.length,
            cached: true
          },
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

    const drinks = await HomepageImage.find({
      section: 'signature-drinks',
      status: 'active'
    }).sort({ order: 1, createdAt: 1 });

    // Cache for public requests only
    if (admin !== 'true') {
      cache.set(cacheKey, drinks, CacheTTL.ONE_MINUTE); // Shorter cache for fresher data
    }

    const headers: Record<string, string> = {};

    if (admin === 'true') {
      // Admin requests - no cache
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      // Public requests - use stale-while-revalidate
      headers['Cache-Control'] = 'public, s-maxage=60, stale-while-revalidate=120';
      headers['X-Cache-Status'] = 'MISS';
    }

    return NextResponse.json(
      {
        success: true,
        data: drinks,
        count: drinks.length
      },
      { headers }
    );
  } catch (error: any) {
    console.error('[Signature Drinks API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST - Create new signature drink
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { title, titleEn, description, descriptionEn, imageId, order } = body;

    if (!title || !imageId) {
      return NextResponse.json(
        { success: false, error: 'Title and imageId are required' },
        { status: 400 }
      );
    }

    const drink = await HomepageImage.create({
      section: 'signature-drinks',
      title,
      titleEn,
      description,
      descriptionEn,
      imageId,
      order: order || 0,
      status: 'active'
    });

    // Invalidate cache
    cache.delete('signature-drinks:active');

    // Revalidate public pages
    const { revalidatePath, revalidateTag } = await import('next/cache');
    revalidatePath('/');
    revalidateTag('signature-drinks');

    return NextResponse.json(
      {
        success: true,
        data: drink
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[Signature Drinks API] Error creating drink:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
