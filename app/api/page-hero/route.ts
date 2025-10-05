import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageHero from '@/lib/models/PageHero';
import { getCacheHeaders, noCacheHeaders } from '@/lib/cache-invalidation';

// GET all heroes
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    const pageRoute = searchParams.get('pageRoute') || undefined;

    const query: any = {};
    if (pageRoute) query.pageRoute = pageRoute;

    const heroes = await PageHero.find(query).sort({ pageRoute: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: heroes }, { headers: getCacheHeaders(admin === 'true') });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// POST create hero
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const hero = await PageHero.create(body);
    return NextResponse.json({ success: true, data: hero }, { status: 201, headers: noCacheHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}






