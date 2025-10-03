import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageBackground from '@/lib/models/PageBackground';
import { CacheInvalidation, getCacheHeaders, noCacheHeaders } from '@/lib/cache-invalidation';

// GET single page background
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');

    const background = await PageBackground.findById(id);
    if (!background) {
      return NextResponse.json(
        { success: false, error: 'Page background not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, data: background },
      { headers: getCacheHeaders(admin === 'true') }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT update page background
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = await params;
    const background = await PageBackground.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!background) {
      return NextResponse.json(
        { success: false, error: 'Page background not found' },
        { status: 404 }
      );
    }

    // Invalidate all page-background-related caches
    CacheInvalidation.pageBackgrounds();

    return NextResponse.json(
      { success: true, data: background },
      { headers: noCacheHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE page background
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const background = await PageBackground.findByIdAndDelete(id);
    if (!background) {
      return NextResponse.json(
        { success: false, error: 'Page background not found' },
        { status: 404 }
      );
    }

    // Invalidate all page-background-related caches
    CacheInvalidation.pageBackgrounds();

    return NextResponse.json(
      { success: true, data: {} },
      { headers: noCacheHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

