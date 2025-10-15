import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WasteLog from '@/lib/models/WasteLog';

// GET waste logs with filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const department = searchParams.get('department');
    const category = searchParams.get('category');
    const reason = searchParams.get('reason');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    const query: any = {};
    
    if (startDate && endDate) {
      query.wasteDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (department) {
      query.department = department;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (reason) {
      query.reason = reason;
    }

    // Get total count for pagination
    const totalCount = await WasteLog.countDocuments(query);
    
    // Get waste logs with pagination
    const wasteLogs = await WasteLog.find(query)
      .sort({ wasteDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        wasteLogs,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('[Waste Log API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new waste log
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    const {
      itemName,
      itemId,
      category,
      quantity,
      unit,
      cost,
      reason,
      description,
      department,
      loggedBy,
      wasteDate,
      isRecoverable,
      recoveryAction
    } = body;

    if (!itemName || !category || !quantity || !unit || !cost || !reason || !department || !loggedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validCategories = ['food', 'beverage', 'material', 'equipment', 'other'];
    const validReasons = ['spoiled', 'broken', 'expired', 'damaged', 'overcooked', 'spilled', 'other'];
    const validDepartments = ['kitchen', 'barista', 'shisha', 'general'];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reason' },
        { status: 400 }
      );
    }

    if (!validDepartments.includes(department)) {
      return NextResponse.json(
        { success: false, error: 'Invalid department' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (quantity <= 0 || cost < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be positive and cost must be non-negative' },
        { status: 400 }
      );
    }

    const wasteLog = await WasteLog.create({
      itemName,
      itemId,
      category,
      quantity,
      unit,
      cost,
      reason,
      description,
      department,
      loggedBy,
      wasteDate: wasteDate ? new Date(wasteDate) : new Date(),
      isRecoverable: Boolean(isRecoverable),
      recoveryAction
    });

    return NextResponse.json({
      success: true,
      data: wasteLog,
      message: 'Waste log created successfully'
    });

  } catch (error: any) {
    console.error('[Waste Log API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update waste log
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Waste log ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const wasteLog = await WasteLog.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!wasteLog) {
      return NextResponse.json(
        { success: false, error: 'Waste log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: wasteLog,
      message: 'Waste log updated successfully'
    });

  } catch (error: any) {
    console.error('[Waste Log API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE waste log
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Waste log ID is required' },
        { status: 400 }
      );
    }

    const wasteLog = await WasteLog.findByIdAndDelete(id);

    if (!wasteLog) {
      return NextResponse.json(
        { success: false, error: 'Waste log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Waste log deleted successfully'
    });

  } catch (error: any) {
    console.error('[Waste Log API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}





