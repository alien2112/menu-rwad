import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Branch from '@/lib/models/Branch';

export const dynamic = 'force-dynamic';

// GET: Fetch all branches
export async function GET() {
  try {
    await connectDB();

    const branches = await Branch.find()
      .sort({ order: 1, name: 1 })
      .lean();

    // Add isOpenNow status to each branch
    const branchesWithStatus = branches.map(branch => {
      const branchDoc = new Branch(branch);
      return {
        ...branch,
        isOpenNow: branchDoc.isOpenNow(),
      };
    });

    return NextResponse.json({
      success: true,
      data: branchesWithStatus,
    });
  } catch (error: unknown) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch branches',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Create a new branch
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      name,
      nameEn,
      address,
      phone,
      email,
      location,
      openingHours,
      themeId,
      logoUrl,
      layoutTemplate,
      isMainBranch,
      isActive,
      order,
      status
    } = body;

    // Validation
    if (!name || !address || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'name, address, and phone are required'
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const existingBranch = await Branch.findOne({ slug });
    if (existingBranch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Branch with this name already exists',
        },
        { status: 400 }
      );
    }

    // If this is set as main branch, unset others
    if (isMainBranch) {
      await Branch.updateMany({}, { $set: { isMainBranch: false } });
    }

    const branch = await Branch.create({
      name,
      nameEn,
      slug,
      address,
      phone,
      email,
      location,
      openingHours,
      themeId,
      logoUrl,
      layoutTemplate: layoutTemplate || 'classic',
      isMainBranch: isMainBranch || false,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      status: status || 'active',
    });

    return NextResponse.json({
      success: true,
      data: branch,
      message: 'Branch created successfully'
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create branch',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Bulk delete branches
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

    // Don't allow deleting main branch
    const mainBranch = await Branch.findOne({ _id: { $in: idArray }, isMainBranch: true });
    if (mainBranch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete main branch'
        },
        { status: 400 }
      );
    }

    await Branch.deleteMany({ _id: { $in: idArray } });

    return NextResponse.json({
      success: true,
      message: `${idArray.length} branch(es) deleted successfully`
    });
  } catch (error: unknown) {
    console.error('Error deleting branches:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete branches',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
