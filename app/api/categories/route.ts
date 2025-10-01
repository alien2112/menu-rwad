import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/lib/models/Category';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limitParam = searchParams.get('limit');
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
    return NextResponse.json({ success: true, data: categories });
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
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
