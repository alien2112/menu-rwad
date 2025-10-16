import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Modifier from '@/lib/models/Modifier';

export const dynamic = 'force-dynamic';

// GET: Fetch all modifiers
export async function GET() {
  try {
    await connectDB();

    const modifiers = await Modifier.find({ status: 'active' })
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: modifiers,
    });
  } catch (error: unknown) {
    console.error('Error fetching modifiers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch modifiers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Create a new modifier
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, nameEn, description, type, options, required, minSelections, maxSelections, order, status } = body;

    // Validation
    if (!name || !type || !options || options.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'name, type, and options are required'
        },
        { status: 400 }
      );
    }

    if (!['single', 'multiple'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid type',
          message: 'Type must be either "single" or "multiple"'
        },
        { status: 400 }
      );
    }

    // Ensure each option has a unique ID
    const processedOptions = options.map((opt: any, index: number) => ({
      id: opt.id || `opt-${Date.now()}-${index}`,
      name: opt.name,
      nameEn: opt.nameEn,
      price: opt.price || 0,
      isDefault: opt.isDefault || false,
    }));

    const modifier = await Modifier.create({
      name,
      nameEn,
      description,
      type,
      options: processedOptions,
      required: required || false,
      minSelections: type === 'multiple' ? minSelections : undefined,
      maxSelections: type === 'multiple' ? maxSelections : 1,
      order: order || 0,
      status: status || 'active',
    });

    return NextResponse.json({
      success: true,
      data: modifier,
      message: 'Modifier created successfully'
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating modifier:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create modifier',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete all modifiers (admin bulk action)
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json(
        {
          success: false,
          error: 'No IDs provided'
        },
        { status: 400 }
      );
    }

    const idArray = ids.split(',');
    await Modifier.deleteMany({ _id: { $in: idArray } });

    return NextResponse.json({
      success: true,
      message: `${idArray.length} modifiers deleted successfully`
    });
  } catch (error: unknown) {
    console.error('Error deleting modifiers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete modifiers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
