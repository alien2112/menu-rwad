import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Ingredient from '@/lib/models/Ingredient';
import { CacheInvalidation, getCacheHeaders, noCacheHeaders } from '@/lib/cache-invalidation';

// GET all ingredients
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    const ingredients = await Ingredient.find({ status: 'active' }).sort({ name: 1 });

    return NextResponse.json(
      { success: true, data: ingredients },
      { headers: getCacheHeaders(admin === 'true') }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST create new ingredient
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const ingredient = await Ingredient.create(body);

    // Invalidate all ingredient-related caches
    CacheInvalidation.ingredients();

    return NextResponse.json(
      { success: true, data: ingredient },
      { status: 201, headers: noCacheHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}