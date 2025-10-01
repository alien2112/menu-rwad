import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HomepageImage from '@/lib/models/HomepageImage';

// GET all signature drinks
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const drinks = await HomepageImage.find({
      section: 'signature-drinks',
      status: 'active'
    }).sort({ order: 1, createdAt: 1 });

    return NextResponse.json({
      success: true,
      data: drinks,
      count: drinks.length
    });
  } catch (error: any) {
    console.error('[Signature Drinks API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST - Create new signature drink
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { title, titleEn, description, descriptionEn, imageId, order } = body;

    if (!title || !imageId) {
      return NextResponse.json(
        { success: false, error: 'Title and imageId are required' },
        { status: 400 }
      );
    }

    const drink = await HomepageImage.create({
      section: 'signature-drinks',
      title,
      titleEn,
      description,
      descriptionEn,
      imageId,
      order: order || 0,
      status: 'active'
    });

    return NextResponse.json({
      success: true,
      data: drink
    });
  } catch (error: any) {
    console.error('[Signature Drinks API] Error creating drink:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
