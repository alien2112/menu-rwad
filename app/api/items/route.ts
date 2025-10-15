import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/lib/models/MenuItem';
import { sanitizeString, sanitizeObjectId, sanitizeObject, sanitizePagination } from '@/lib/sanitize';

// GET all menu items with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = sanitizeObjectId(searchParams.get('categoryId'));
    const admin = sanitizeString(searchParams.get('admin'));
    const isAdmin = admin === 'true';
    
    // Pagination parameters
    const { page, limit } = sanitizePagination({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      maxLimit: isAdmin ? 100 : 50 // Admin can request more items
    });
    
    // Search parameter
    const search = sanitizeString(searchParams.get('search'));
    
    // Status filter
    const status = sanitizeString(searchParams.get('status'));
    
    // Featured filter
    const featured = searchParams.get('featured') === 'true';

    await dbConnect();

    // Build optimized query
    const query: any = {};
    
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (featured) {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCount = await MenuItem.countDocuments(query);

    // Use lean() for better performance (returns plain JS objects instead of Mongoose documents)
    // Select only fields needed for menu display (projection)
    const items = await MenuItem
      .find(query)
      .select('name nameEn description price discountPrice cost image calories preparationTime categoryId status tags allergens rating reviewCount sizeOptions addonOptions dietaryModifications featured')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    };

    const headers: Record<string, string> = {};
    if (isAdmin) {
      // Admin requests - no cache
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      // Public requests - use stale-while-revalidate
      headers['Cache-Control'] = 'public, s-maxage=300, stale-while-revalidate=600';
      headers['X-Cache-Status'] = 'MISS';
    }

    return NextResponse.json(
      { 
        success: true, 
        data: items,
        pagination: paginationInfo
      },
      { headers }
    );
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST create new item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const rawBody = await request.json();

    // Sanitize menu item data
    const allowedKeys = ['name', 'nameEn', 'description', 'price', 'discountPrice', 'cost', 'image', 'calories', 'preparationTime', 'categoryId', 'status', 'ingredients'];
    const sanitizedBody = sanitizeObject(rawBody, allowedKeys);

    // Additional validation for categoryId
    if (sanitizedBody.categoryId && !sanitizeObjectId(sanitizedBody.categoryId as any)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const item = await MenuItem.create(sanitizedBody);

    // Cache invalidation removed for now

    return NextResponse.json(
      { success: true, data: item },
      { status: 201, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
