import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import HomepageImage from '@/lib/models/HomepageImage';
import mongoose from 'mongoose';
import { cache } from '@/lib/cache';

// GET single signature drink by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const drink = await HomepageImage.findOne({
      _id: params.id,
      section: 'signature-drinks'
    });

    if (!drink) {
      return NextResponse.json(
        { success: false, error: 'Signature drink not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: drink
    });
  } catch (error: any) {
    console.error('[Signature Drinks API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT - Update signature drink
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, titleEn, description, descriptionEn, imageId, order, status } = body;

    const drink = await HomepageImage.findOneAndUpdate(
      { _id: params.id, section: 'signature-drinks' },
      {
        ...(title && { title }),
        ...(titleEn !== undefined && { titleEn }),
        ...(description !== undefined && { description }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(imageId && { imageId }),
        ...(order !== undefined && { order }),
        ...(status && { status })
      },
      { new: true, runValidators: true }
    );

    if (!drink) {
      return NextResponse.json(
        { success: false, error: 'Signature drink not found' },
        { status: 404 }
      );
    }

    // Clear cache
    cache.delete('signature-drinks:active');

    // Revalidate public pages
    revalidatePath('/');
    revalidateTag('signature-drinks');

    return NextResponse.json(
      {
        success: true,
        data: drink
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[Signature Drinks API] Error updating:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE signature drink
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const drink = await HomepageImage.findOneAndDelete({
      _id: params.id,
      section: 'signature-drinks'
    });

    if (!drink) {
      return NextResponse.json(
        { success: false, error: 'Signature drink not found' },
        { status: 404 }
      );
    }

    // Clear cache
    cache.delete('signature-drinks:active');

    // Revalidate public pages
    revalidatePath('/');
    revalidateTag('signature-drinks');

    return NextResponse.json(
      {
        success: true,
        message: 'Signature drink deleted successfully'
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[Signature Drinks API] Error deleting:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
