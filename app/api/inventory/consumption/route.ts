import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { InventoryItem, InventoryConsumption } from '@/lib/models/Inventory';
import { sendLowStockNotification, sendOutOfStockNotification } from '@/lib/notificationUtils';
import { autoDisableMenuItems } from '@/lib/menuItemStatusManager';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason');
    const ingredientId = searchParams.get('ingredientId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query: any = {};
    if (reason && reason !== 'all') {
      query.reason = reason;
    }
    if (ingredientId) {
      query.ingredientId = ingredientId;
    }

    const consumptionRecords = await InventoryConsumption
      .find(query)
      .sort({ recordedAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: consumptionRecords
    });

  } catch (error) {
    console.error('Error fetching consumption records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consumption records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      ingredientId, 
      ingredientName, 
      quantityConsumed, 
      unit, 
      reason, 
      orderId, 
      menuItemId, 
      notes, 
      recordedBy 
    } = body;

    // Validate required fields
    if (!ingredientId || !ingredientName || !quantityConsumed || !unit || !reason || !recordedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the inventory item
    const inventoryItem = await InventoryItem.findOne({ ingredientId });
    if (!inventoryItem) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Check if there's enough stock
    if (inventoryItem.currentStock < quantityConsumed) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock available' },
        { status: 400 }
      );
    }

    // Create consumption record
    const consumptionRecord = new InventoryConsumption({
      ingredientId,
      ingredientName,
      quantityConsumed,
      unit,
      reason,
      orderId,
      menuItemId,
      notes,
      recordedBy,
      recordedAt: new Date()
    });

    await consumptionRecord.save();

    // Update inventory stock
    inventoryItem.currentStock -= quantityConsumed;
    
    // Update status based on new stock level
    if (inventoryItem.currentStock <= 0) {
      inventoryItem.status = 'out_of_stock';
    } else if (inventoryItem.currentStock <= inventoryItem.minStockLevel) {
      inventoryItem.status = 'low_stock';
    } else {
      inventoryItem.status = 'in_stock';
    }

    inventoryItem.lastUpdated = new Date();
    await inventoryItem.save();

    // Send notifications based on stock status
    if (inventoryItem.status === 'out_of_stock') {
      await sendOutOfStockNotification(inventoryItem.ingredientName);
      // Auto-disable menu items that depend on this ingredient
      await autoDisableMenuItems(ingredientId);
    } else if (inventoryItem.status === 'low_stock') {
      await sendLowStockNotification(
        inventoryItem.ingredientName, 
        inventoryItem.currentStock, 
        inventoryItem.minStockLevel
      );
    }

    return NextResponse.json({
      success: true,
      data: consumptionRecord,
      message: 'Consumption recorded successfully'
    });

  } catch (error) {
    console.error('Error recording consumption:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record consumption' },
      { status: 500 }
    );
  }
}



