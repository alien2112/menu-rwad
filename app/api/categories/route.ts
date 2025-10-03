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

    // Create cache key based on query params
    const cacheKey = `categories:${featured}:${limitParam}`;

    // Try to get from cache
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

    // Cache the result for 10 minutes
    cache.set(cacheKey, categories, CacheTTL.TEN_MINUTES);

    return NextResponse.json(
      { success: true, data: categories },
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

// POST create new category
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('Creating category with data:', body);
    const category = await Category.create(body);
    console.log('Created category:', category);

    // Invalidate cache when creating new category
    cache.delete('categories:null:null');
    cache.delete('categories:true:8');

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
