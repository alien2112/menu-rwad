/**
 * @deprecated MATERIAL API ROUTES - NO LONGER IN USE
 * Use /api/inventory endpoints instead
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Material from '@/lib/models/Material';
import MaterialUsage from '@/lib/models/MaterialUsage';

// GET /api/materials/[id] - Get single material with usage history
// @deprecated - Use /api/inventory instead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const material = await Material.findById(params.id);

    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      );
    }

    // Get recent usage history
    const usageHistory = await MaterialUsage.find({ materialId: params.id })
      .sort({ usageDate: -1 })
      .limit(20);

    // Get usage statistics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usageStats = await MaterialUsage.aggregate([
      {
        $match: {
          materialId: params.id,
          usageDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalUsed: { $sum: '$quantityUsed' },
          averageDailyUsage: { $avg: '$quantityUsed' },
          usageCount: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        material,
        usageHistory,
        usageStats: usageStats[0] || { totalUsed: 0, averageDailyUsage: 0, usageCount: 0 }
      }
    });

  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch material' },
      { status: 500 }
    );
  }
}

// PUT /api/materials/[id] - Update material
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const updateData = await request.json();

    // Update status based on quantity
    if (updateData.currentQuantity !== undefined) {
      if (updateData.currentQuantity <= 0) {
        updateData.status = 'out_of_stock';
      } else {
        updateData.status = 'active';
      }
    }

    const material = await Material.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: material,
      message: 'Material updated successfully'
    });

  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update material' },
      { status: 500 }
    );
  }
}

// DELETE /api/materials/[id] - Delete material
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const material = await Material.findByIdAndDelete(params.id);

    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Material deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete material' },
      { status: 500 }
    );
  }
}

