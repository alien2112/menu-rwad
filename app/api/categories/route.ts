import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { sanitizeString, sanitizeInteger, sanitizeObject } from '@/lib/sanitize';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = sanitizeString(searchParams.get('featured'));
    const limitParam = sanitizeString(searchParams.get('limit'));
    const admin = sanitizeString(searchParams.get('admin')); // Check if admin request

    // Simple caching - removed complex cache logic for now

    await dbConnect();
    const query: any = {};
    if (featured === 'true') {
      query.featured = true;
      query.status = 'active';
    }
    const sort = featured === 'true' ? { featuredOrder: 1, order: 1, createdAt: -1 } : { order: 1, createdAt: -1 };
    const limit = limitParam ? sanitizeInteger(limitParam, 1, 50, 20) : undefined;

    // Use lean() for better performance + select only needed fields
    let q = Category.find(query)
      .select('name nameEn description image color icon order featured featuredOrder status')
      .sort(sort)
      .lean();

    if (limit) q = q.limit(limit);
    const categories = await q.exec();

    // Cache removed for now

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
    console.error('GET /api/categories failed:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return NextResponse.json(
      { success: false, error: error.message ?? 'Unknown error' },
      { status: 400 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const rawBody = await request.json();

    // Sanitize category data
    const allowedKeys = ['name', 'nameEn', 'description', 'image', 'color', 'icon', 'order', 'featured', 'featuredOrder', 'status'];
    const sanitizedBody = sanitizeObject(rawBody, allowedKeys);

    console.log('Creating category with data:', sanitizedBody);
    const category = await Category.create(sanitizedBody);
    console.log('Created category:', category);

    // Cache invalidation removed for now

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
