import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Material from '@/lib/models/Material';
import MaterialUsage from '@/lib/models/MaterialUsage';
import Notification from '@/lib/models/Notification';
import InventoryItem from '@/lib/models/Inventory';

// GET /api/materials - Get all materials with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const lowStock = searchParams.get('lowStock') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (lowStock) {
      query.$expr = {
        $lte: ['$currentQuantity', '$alertLimit']
      };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get materials with pagination
    const materials = await Material.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalCount = await Material.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: materials,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

// POST /api/materials - Create new material
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const materialData = await request.json();

    // Validate required fields
    if (!materialData.name) {
      return NextResponse.json(
        { success: false, error: 'Material name is required' },
        { status: 400 }
      );
    }

    if (materialData.currentQuantity === undefined || materialData.currentQuantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid current quantity is required' },
        { status: 400 }
      );
    }

    if (materialData.alertLimit === undefined || materialData.alertLimit < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid alert limit is required' },
        { status: 400 }
      );
    }

    if (materialData.minLimit === undefined || materialData.minLimit < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid minimum limit is required' },
        { status: 400 }
      );
    }

    // Create material
    const material = new Material({
      ...materialData,
      status: materialData.currentQuantity <= 0 ? 'out_of_stock' : 'active'
    });

    await material.save();

    // Sync with Inventory if ingredientId is provided
    if (materialData.ingredientId) {
      await syncMaterialToInventory(material);
    }

    // Check if material is low stock and create notification
    if (material.currentQuantity <= material.alertLimit) {
      await createLowStockNotification(material);
    }

    return NextResponse.json({
      success: true,
      data: material,
      message: 'Material created successfully'
    });

  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create material' },
      { status: 500 }
    );
  }
}

// PUT /api/materials - Update material
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('id');

    if (!materialId) {
      return NextResponse.json(
        { success: false, error: 'Material ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Get current material to check for status changes
    const currentMaterial = await Material.findById(materialId);
    if (!currentMaterial) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      );
    }

    // Update status based on quantity
    if (updateData.currentQuantity !== undefined) {
      if (updateData.currentQuantity <= 0) {
        updateData.status = 'out_of_stock';
      } else if (updateData.currentQuantity <= updateData.alertLimit) {
        updateData.status = 'active';
      } else {
        updateData.status = 'active';
      }
    }

    const material = await Material.findByIdAndUpdate(
      materialId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material not found' },
        { status: 404 }
      );
    }

    // Sync with Inventory if ingredientId is provided and quantity changed
    if (material.ingredientId && updateData.currentQuantity !== undefined) {
      await syncMaterialToInventory(material);
    }

    // Check for stock alerts
    if (material.currentQuantity <= material.alertLimit) {
      await createLowStockNotification(material);
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

// DELETE /api/materials - Delete material
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('id');

    if (!materialId) {
      return NextResponse.json(
        { success: false, error: 'Material ID is required' },
        { status: 400 }
      );
    }

    const material = await Material.findByIdAndDelete(materialId);

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

// Helper function to sync material stock with inventory
async function syncMaterialToInventory(material: any) {
  try {
    if (!material.ingredientId) return;

    // Find or create inventory item for this ingredient
    const inventoryItem = await InventoryItem.findOne({ ingredientId: material.ingredientId });

    if (inventoryItem) {
      // Update inventory stock to match material quantity
      inventoryItem.currentStock = material.currentQuantity;

      // Update status based on stock levels
      if (inventoryItem.currentStock <= 0) {
        inventoryItem.status = 'out_of_stock';
      } else if (inventoryItem.currentStock <= inventoryItem.minStockLevel) {
        inventoryItem.status = 'low_stock';
      } else {
        inventoryItem.status = 'in_stock';
      }

      inventoryItem.lastUpdated = new Date();
      await inventoryItem.save();

      console.log(`Synced Material ${material.name} to Inventory ${inventoryItem.ingredientName}`);
    }
  } catch (error) {
    console.error('Error syncing material to inventory:', error);
  }
}

// Helper function to create low stock notification
async function createLowStockNotification(material: any) {
  try {
    // Check if notification already exists for this material
    const existingNotification = await Notification.findOne({
      type: material.currentQuantity <= 0 ? 'out_of_stock' : 'low_stock',
      relatedId: material._id.toString(),
      isResolved: false
    });

    if (!existingNotification) {
      const notification = new Notification({
        type: material.currentQuantity <= 0 ? 'out_of_stock' : 'low_stock',
        title: material.currentQuantity <= 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
        message: `${material.name} is ${material.currentQuantity <= 0 ? 'out of stock' : 'running low'}. Current quantity: ${material.currentQuantity} ${material.unit}`,
        priority: material.currentQuantity <= 0 ? 'urgent' : 'high',
        category: 'inventory',
        relatedId: material._id.toString(),
        relatedType: 'material',
        metadata: {
          materialId: material._id.toString(),
          materialName: material.name,
          currentQuantity: material.currentQuantity,
          alertLimit: material.alertLimit
        }
      });

      await notification.save();
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

