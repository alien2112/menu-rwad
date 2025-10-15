import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Department from '@/lib/models/Department';

// GET /api/departments - Get all departments
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const departments = await Department.find({ isActive: true })
      .sort({ order: 1 });

    return NextResponse.json({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST /api/departments - Create department
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const departmentData = await request.json();

    // Validate required fields
    if (!departmentData.name) {
      return NextResponse.json(
        { success: false, error: 'Department name is required' },
        { status: 400 }
      );
    }

    if (!departmentData.type) {
      return NextResponse.json(
        { success: false, error: 'Department type is required' },
        { status: 400 }
      );
    }

    // Check if department type already exists
    const existingDepartment = await Department.findOne({ type: departmentData.type });
    if (existingDepartment) {
      return NextResponse.json(
        { success: false, error: 'Department type already exists' },
        { status: 400 }
      );
    }

    // Create department
    const department = new Department({
      ...departmentData,
      isActive: true
    });

    await department.save();

    return NextResponse.json({
      success: true,
      data: department,
      message: 'Department created successfully'
    });

  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create department' },
      { status: 500 }
    );
  }
}

// PUT /api/departments - Update department
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('id');

    if (!departmentId) {
      return NextResponse.json(
        { success: false, error: 'Department ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    const department = await Department.findByIdAndUpdate(
      departmentId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!department) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: department,
      message: 'Department updated successfully'
    });

  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE /api/departments - Delete department
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('id');

    if (!departmentId) {
      return NextResponse.json(
        { success: false, error: 'Department ID is required' },
        { status: 400 }
      );
    }

    const department = await Department.findByIdAndDelete(departmentId);

    if (!department) {
      return NextResponse.json(
        { success: false, error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}

