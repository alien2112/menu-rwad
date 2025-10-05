import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/lib/models/MenuItem';
import { CacheInvalidation, getCacheHeaders, noCacheHeaders } from '@/lib/cache-invalidation';
import mongoose from 'mongoose';

// GET all menu items
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const admin = searchParams.get('admin');

    const query = categoryId ? { categoryId } : {};
    const items = await MenuItem.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json(
      { success: true, data: items },
      { headers: getCacheHeaders(admin === 'true') }
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
    const body = await request.json();
    const item = await MenuItem.create(body);

    // Invalidate all item-related caches
    CacheInvalidation.items();

    return NextResponse.json(
      { success: true, data: item },
      { status: 201, headers: noCacheHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
