import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { cache, CacheTTL } from '@/lib/cache';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limitParam = searchParams.get('limit');
    const admin = searchParams.get('admin'); // Check if admin request

    // Create cache key based on query params
    const cacheKey = `categories:${featured}:${limitParam}`;

    // Admin requests bypass cache
    if (admin !== 'true') {
      // Try to get from cache for public requests
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
    const query: any = {};
    if (featured === 'true') {
      query.featured = true;
      query.status = 'active';
    }
    const sort = featured === 'true' ? { featuredOrder: 1, order: 1, createdAt: -1 } : { order: 1, createdAt: -1 };
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 0, 50) : undefined;
    const q = Category.find(query).sort(sort);
    if (limit) q.limit(limit);
    const categories = await q;

    // Cache the result for public requests only
    if (admin !== 'true') {
      cache.set(cacheKey, categories, CacheTTL.ONE_MINUTE); // Shorter cache for fresher data
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
      { success: true, data: categories },
      { headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('Creating category with data:', body);
    const category = await Category.create(body);
    console.log('Created category:', category);

    // Invalidate all category caches
    cache.clear(); // Clear all cache to be safe

    // Revalidate public pages
    const { revalidatePath, revalidateTag } = await import('next/cache');
    revalidatePath('/');
    revalidatePath('/menu');
    revalidateTag('categories');

    return NextResponse.json(
      { success: true, data: category },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
