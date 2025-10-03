import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import HomepageImage from '@/lib/models/HomepageImage';
import { deleteFromGridFS } from '@/lib/gridfs';
import { cache } from '@/lib/cache';

// GET single homepage image
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const image = await HomepageImage.findById(id);
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: image });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PUT update homepage image
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = await params;
    const image = await HomepageImage.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Clear server-side cache
    cache.delete('signature-drinks:active');
    cache.delete('offers:all');
    cache.delete('homepage:all');

    // Revalidate public pages
    revalidatePath('/');
    revalidatePath('/offers');
    revalidateTag('homepage');
    revalidateTag('signature-drinks');

    return NextResponse.json(
      { success: true, data: image },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE homepage image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const image = await HomepageImage.findById(id);

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete image from GridFS
    if (image.imageId) {
      try {
        await deleteFromGridFS(image.imageId);
      } catch (error) {
        console.error('Error deleting GridFS file:', error);
      }
    }

    // Delete document
    await HomepageImage.findByIdAndDelete(id);

    // Clear server-side cache
    cache.delete('signature-drinks:active');
    cache.delete('offers:all');
    cache.delete('homepage:all');

    // Revalidate public pages
    revalidatePath('/');
    revalidatePath('/offers');
    revalidateTag('homepage');
    revalidateTag('signature-drinks');

    return NextResponse.json(
      { success: true, data: {} },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
