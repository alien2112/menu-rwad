import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Material from '@/lib/models/Material';
import MaterialUsage from '@/lib/models/MaterialUsage';
import Notification from '@/lib/models/Notification';

// GET /api/materials/usage - Get material usage with filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('materialId');
    const department = searchParams.get('department');
    const usageType = searchParams.get('usageType');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (materialId) {
      query.materialId = materialId;
    }
    
    if (department) {
      query.department = department;
    }
    
    if (usageType) {
      query.usageType = usageType;
    }
    
    if (from || to) {
      query.usageDate = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          query.usageDate.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
            toDate.setHours(23, 59, 59, 999);
          }
          query.usageDate.$lte = toDate;
        }
      }
      if (Object.keys(query.usageDate).length === 0) {
        delete query.usageDate;
      }
    }

    // Get usage records with pagination
    const usageRecords = await MaterialUsage.find(query)
      .sort({ usageDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalCount = await MaterialUsage.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: usageRecords,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching material usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch material usage' },
      { status: 500 }
    );
  }
}

// POST /api/materials/usage - Record material usage
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const usageData = await request.json();

    // Validate required fields
    if (!usageData.materialId) {
      return NextResponse.json(
        { success: false, error: 'Material ID is required' },
        { status: 400 }
      );
    }

    if (!usageData.quantityUsed || usageData.quantityUsed <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid quantity used is required' },
        { status: 400 }
      );
    }

    if (!usageData.department) {
      return NextResponse.json(
        { success: false, error: 'Department is required' },
        { status: 400 }
      );
    }

    // Get material details
    const material = await Material.findById(usageData.materialId);
    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      );
    }

    // Check if there's enough quantity
    if (material.currentQuantity < usageData.quantityUsed) {
      return NextResponse.json(
        { success: false, error: 'Insufficient material quantity' },
        { status: 400 }
      );
    }

    // Create usage record
    const usage = new MaterialUsage({
      materialId: usageData.materialId,
      materialName: material.name,
      quantityUsed: usageData.quantityUsed,
      unit: material.unit,
      orderId: usageData.orderId,
      orderNumber: usageData.orderNumber,
      menuItemId: usageData.menuItemId,
      menuItemName: usageData.menuItemName,
      department: usageData.department,
      usageType: usageData.usageType || 'order',
      notes: usageData.notes,
      usedBy: usageData.usedBy,
      usageDate: usageData.usageDate || new Date()
    });

    await usage.save();

    // Update material quantity
    const newQuantity = material.currentQuantity - usageData.quantityUsed;
    await Material.findByIdAndUpdate(usageData.materialId, {
      currentQuantity: newQuantity,
      status: newQuantity <= 0 ? 'out_of_stock' : 'active',
      updatedAt: new Date()
    });

    // Check for low stock alerts
    if (newQuantity <= material.alertLimit) {
      await createLowStockNotification(material, newQuantity);
    }

    return NextResponse.json({
      success: true,
      data: usage,
      message: 'Material usage recorded successfully'
    });

  } catch (error) {
    console.error('Error recording material usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record material usage' },
      { status: 500 }
    );
  }
}

// Helper function to create low stock notification
async function createLowStockNotification(material: any, currentQuantity: number) {
  try {
    // Check if notification already exists for this material
    const existingNotification = await Notification.findOne({
      type: currentQuantity <= 0 ? 'out_of_stock' : 'low_stock',
      relatedId: material._id.toString(),
      isResolved: false
    });

    if (!existingNotification) {
      const notification = new Notification({
        type: currentQuantity <= 0 ? 'out_of_stock' : 'low_stock',
        title: currentQuantity <= 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
        message: `${material.name} is ${currentQuantity <= 0 ? 'out of stock' : 'running low'}. Current quantity: ${currentQuantity} ${material.unit}`,
        priority: currentQuantity <= 0 ? 'urgent' : 'high',
        category: 'inventory',
        relatedId: material._id.toString(),
        relatedType: 'material',
        metadata: {
          materialId: material._id.toString(),
          materialName: material.name,
          currentQuantity: currentQuantity,
          alertLimit: material.alertLimit
        }
      });

      await notification.save();
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

