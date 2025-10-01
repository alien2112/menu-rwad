import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageBackground from '@/lib/models/PageBackground';

// GET single page background
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const background = await PageBackground.findById(params.id);
    if (!background) {
      return NextResponse.json(
        { success: false, error: 'Page background not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: background });
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
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const background = await PageBackground.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!background) {
      return NextResponse.json(
        { success: false, error: 'Page background not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: background });
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
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const background = await PageBackground.findByIdAndDelete(params.id);
    if (!background) {
      return NextResponse.json(
        { success: false, error: 'Page background not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
