import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Modifier from '@/lib/models/Modifier';
import MenuItem from '@/lib/models/MenuItem';

export const dynamic = 'force-dynamic';

// GET: Fetch a single modifier by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const modifier = await Modifier.findById(params.id).lean();

    if (!modifier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Modifier not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: modifier,
    });
  } catch (error: unknown) {
    console.error('Error fetching modifier:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch modifier',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update a modifier
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, nameEn, description, type, options, required, minSelections, maxSelections, order, status } = body;

    // Validation
    if (type && !['single', 'multiple'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid type',
          message: 'Type must be either "single" or "multiple"'
        },
        { status: 400 }
      );
    }

    // Process options if provided
    let processedOptions;
    if (options) {
      processedOptions = options.map((opt: any, index: number) => ({
        id: opt.id || `opt-${Date.now()}-${index}`,
        name: opt.name,
        nameEn: opt.nameEn,
        price: opt.price || 0,
        isDefault: opt.isDefault || false,
      }));
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (processedOptions) updateData.options = processedOptions;
    if (required !== undefined) updateData.required = required;
    if (minSelections !== undefined) updateData.minSelections = minSelections;
    if (maxSelections !== undefined) updateData.maxSelections = maxSelections;
    if (order !== undefined) updateData.order = order;
    if (status !== undefined) updateData.status = status;

    const modifier = await Modifier.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!modifier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Modifier not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: modifier,
      message: 'Modifier updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating modifier:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update modifier',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a modifier
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Find modifier first
    const modifier = await Modifier.findById(params.id);

    if (!modifier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Modifier not found'
        },
        { status: 404 }
      );
    }

    // Remove modifier from all menu items that reference it
    await MenuItem.updateMany(
      { modifiers: params.id },
      { $pull: { modifiers: params.id } }
    );

    // Delete the modifier
    await Modifier.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Modifier deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Error deleting modifier:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete modifier',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
