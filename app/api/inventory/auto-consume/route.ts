import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { InventoryItem, InventoryConsumption } from '@/lib/models/Inventory';
import MenuItem from '@/lib/models/MenuItem';
import Ingredient from '@/lib/models/Ingredient';
import { sendLowStockNotification, sendOutOfStockNotification } from '@/lib/notificationUtils';
import { autoDisableMenuItems } from '@/lib/menuItemStatusManager';
import { convertUnit } from '@/lib/unitConversion';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { orderId, items, recordedBy } = body;

    if (!orderId || !items || !Array.isArray(items) || !recordedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const consumptionResults = [];

    for (const orderItem of items) {
      const { menuItemId, quantity } = orderItem;

      // Get menu item details
      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem) {
        console.warn(`Menu item not found: ${menuItemId}`);
        continue;
      }

      // Process each inventory item in the menu item
      if (!menuItem.inventoryItems) {
        console.warn(`Menu item ${menuItemId} has no inventory items`);
        continue;
      }

      for (const invItem of menuItem.inventoryItems) {
        const { inventoryItemId, portion } = invItem;

        // Find inventory item
        const inventoryItem = await InventoryItem.findById(inventoryItemId);
        if (!inventoryItem) {
          console.warn(`Inventory item not found: ${inventoryItemId}`);
          continue;
        }

        // Calculate total consumption
        const totalConsumption = portion * quantity;

        // Check if there's enough stock
        if (inventoryItem.currentStock < totalConsumption) {
          console.warn(`Insufficient stock for inventory item ${inventoryItemId}: ${inventoryItem.currentStock} < ${totalConsumption}`);
          continue;
        }

        // Create consumption record
        const consumptionRecord = new InventoryConsumption({
          ingredientId: inventoryItem.ingredientId, // Keep for backward compatibility
          ingredientName: inventoryItem.ingredientName,
          quantityConsumed: totalConsumption,
          unit: inventoryItem.unit,
          reason: 'order',
          orderId,
          menuItemId,
          notes: `Auto-consumption for order ${orderId}`,
          recordedBy,
          recordedAt: new Date()
        });

        await consumptionRecord.save();

        // Update inventory stock
        inventoryItem.currentStock -= totalConsumption;
        
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
          // Auto-disable menu items that depend on this inventory item
          await autoDisableMenuItems(inventoryItemId);
        } else if (inventoryItem.status === 'low_stock') {
          await sendLowStockNotification(
            inventoryItem.ingredientName, 
            inventoryItem.currentStock, 
            inventoryItem.minStockLevel
          );
        }

        consumptionResults.push({
          inventoryItemId,
          ingredientName: inventoryItem.ingredientName,
          quantityConsumed: totalConsumption,
          unit: inventoryItem.unit,
          success: true
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: consumptionResults,
      message: `Successfully processed ${consumptionResults.length} inventory consumptions`
    });

  } catch (error) {
    console.error('Error processing auto-consumption:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process auto-consumption' },
      { status: 500 }
    );
  }
}



