import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { InventoryItem } from '@/lib/models/Inventory';
import Ingredient from '@/lib/models/Ingredient';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get all active ingredients
    const ingredients = await Ingredient.find({ status: 'active' });
    console.log(`Found ${ingredients.length} active ingredients`);

    const createdItems = [];
    const existingItems = [];

    // Create inventory items for each ingredient
    for (const ingredient of ingredients) {
      // Check if inventory item already exists
      const existingInventory = await InventoryItem.findOne({ ingredientId: ingredient._id.toString() });
      
      if (!existingInventory) {
        // Create initial inventory item with default stock levels
        const initialStock = Math.floor(Math.random() * 100) + 20; // Random stock between 20-120
        const minStock = Math.floor(initialStock * 0.2); // 20% of initial stock as minimum
        const maxStock = Math.floor(initialStock * 1.5); // 150% of initial stock as maximum

        const inventoryItem = new InventoryItem({
          ingredientId: ingredient._id.toString(),
          ingredientName: ingredient.name,
          currentStock: initialStock,
          unit: ingredient.unit,
          minStockLevel: minStock,
          maxStockLevel: maxStock,
          status: initialStock > minStock ? 'in_stock' : 'low_stock',
          lastUpdated: new Date()
        });

        await inventoryItem.save();
        createdItems.push({
          name: ingredient.name,
          stock: initialStock,
          unit: ingredient.unit
        });
      } else {
        existingItems.push({
          name: ingredient.name,
          stock: existingInventory.currentStock,
          unit: ingredient.unit
        });
      }
    }

    // Get summary
    const totalItems = await InventoryItem.countDocuments();
    const lowStockItems = await InventoryItem.countDocuments({ status: 'low_stock' });
    const outOfStockItems = await InventoryItem.countDocuments({ status: 'out_of_stock' });

    return NextResponse.json({
      success: true,
      data: {
        created: createdItems,
        existing: existingItems,
        summary: {
          totalItems,
          lowStockItems,
          outOfStockItems
        }
      },
      message: `Inventory initialization completed! Created ${createdItems.length} new items, ${existingItems.length} already existed.`
    });

  } catch (error) {
    console.error('Error initializing inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize inventory' },
      { status: 500 }
    );
  }
}



