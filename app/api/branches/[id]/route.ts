import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Branch from '@/lib/models/Branch';

export const dynamic = 'force-dynamic';

// GET: Fetch a single branch by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const branch = await Branch.findById(params.id).lean();

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Branch not found'
        },
        { status: 404 }
      );
    }

    // Add isOpenNow status
    const branchDoc = new Branch(branch);
    const branchWithStatus = {
      ...branch,
      isOpenNow: branchDoc.isOpenNow(),
    };

    return NextResponse.json({
      success: true,
      data: branchWithStatus,
    });
  } catch (error: unknown) {
    console.error('Error fetching branch:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch branch',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update a branch
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      name,
      nameEn,
      address,
      city,
      country,
      timezone,
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
      status,
      restaurantId,
      managerId
    } = body;

    // If this is being set as main branch, unset others
    if (isMainBranch) {
      await Branch.updateMany(
        { _id: { $ne: params.id } },
        { $set: { isMainBranch: false } }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (location !== undefined) updateData.location = location;
    if (openingHours !== undefined) updateData.openingHours = openingHours;
    if (themeId !== undefined) updateData.themeId = themeId;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (layoutTemplate !== undefined) updateData.layoutTemplate = layoutTemplate;
    if (isMainBranch !== undefined) updateData.isMainBranch = isMainBranch;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;
    if (status !== undefined) updateData.status = status;
    if (restaurantId !== undefined) updateData.restaurantId = restaurantId;
    if (managerId !== undefined) updateData.managerId = managerId;

    // Update slug if name changed
    if (name) {
      updateData.slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug conflicts with another branch
      const existingBranch = await Branch.findOne({
        slug: updateData.slug,
        _id: { $ne: params.id }
      });

      if (existingBranch) {
        return NextResponse.json(
          {
            success: false,
            error: 'Branch with this name already exists'
          },
          { status: 400 }
        );
      }
    }

    const branch = await Branch.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Branch not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: branch,
      message: 'Branch updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update branch',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a branch
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check if it's the main branch
    const branch = await Branch.findById(params.id);

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Branch not found'
        },
        { status: 404 }
      );
    }

    if (branch.isMainBranch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete the main branch'
        },
        { status: 400 }
      );
    }

    await Branch.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete branch',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
