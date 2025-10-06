import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageHero from '@/lib/models/PageHero';
import { getCacheHeaders, noCacheHeaders } from '@/lib/cache-invalidation';

// GET single hero
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    const hero = await PageHero.findById(id);
    if (!hero) {
      return NextResponse.json({ success: false, error: 'Hero not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: hero }, { headers: getCacheHeaders(admin === 'true') });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PUT update hero
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = await params;
    const hero = await PageHero.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!hero) {
      return NextResponse.json({ success: false, error: 'Hero not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: hero }, { headers: noCacheHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE hero
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const hero = await PageHero.findByIdAndDelete(id);
    if (!hero) {
      return NextResponse.json({ success: false, error: 'Hero not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} }, { headers: noCacheHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}








