import MenuItem from '@/lib/models/MenuItem';
import { InventoryItem, InventoryConsumption } from '@/lib/models/Inventory';

/**
 * Database query optimization utilities
 * Provides batch operations and optimized query patterns
 */

export interface BatchQueryResult<T> {
  data: T[];
  totalCount: number;
  executionTime: number;
}

/**
 * Batch fetch menu items by IDs
 * More efficient than individual findById calls
 */
export async function batchFetchMenuItems(menuItemIds: string[]): Promise<Map<string, any>> {
  const startTime = Date.now();
  
  try {
    const menuItems = await MenuItem.find({ 
      _id: { $in: menuItemIds } 
    }).lean().exec();
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ Batch fetched ${menuItems.length} menu items in ${executionTime}ms`);
    
    return new Map(menuItems.map(item => [item._id.toString(), item]));
  } catch (error) {
    console.error('Error batch fetching menu items:', error);
    return new Map();
  }
}

/**
 * Batch fetch inventory items by ingredient IDs
 * More efficient than individual findOne calls
 */
export async function batchFetchInventoryItems(ingredientIds: string[]): Promise<Map<string, any>> {
  const startTime = Date.now();
  
  try {
    const inventoryItems = await InventoryItem.find({ 
      ingredientId: { $in: ingredientIds } 
    }).lean().exec();
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ Batch fetched ${inventoryItems.length} inventory items in ${executionTime}ms`);
    
    return new Map(inventoryItems.map(item => [item.ingredientId, item]));
  } catch (error) {
    console.error('Error batch fetching inventory items:', error);
    return new Map();
  }
}

/**
 * Batch update inventory items
 * More efficient than individual save() calls
 */
export async function batchUpdateInventoryItems(updates: Array<{
  ingredientId: string;
  currentStock: number;
  status: string;
  lastUpdated: Date;
}>): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Use bulkWrite for maximum efficiency
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { ingredientId: update.ingredientId },
        update: {
          $set: {
            currentStock: update.currentStock,
            status: update.status,
            lastUpdated: update.lastUpdated
          }
        }
      }
    }));
    
    if (bulkOps.length > 0) {
      await InventoryItem.bulkWrite(bulkOps);
      const executionTime = Date.now() - startTime;
      console.log(`✅ Batch updated ${bulkOps.length} inventory items in ${executionTime}ms`);
    }
  } catch (error) {
    console.error('Error batch updating inventory items:', error);
    throw error;
  }
}

/**
 * Batch create consumption records
 * More efficient than individual save() calls
 */
export async function batchCreateConsumptionRecords(records: Array<{
  ingredientId: string;
  ingredientName: string;
  quantityConsumed: number;
  unit: string;
  reason: string;
  orderId: string;
  menuItemId: string;
  notes: string;
  recordedBy: string;
  recordedAt: Date;
}>): Promise<void> {
  const startTime = Date.now();
  
  try {
    if (records.length > 0) {
      await InventoryConsumption.insertMany(records);
      const executionTime = Date.now() - startTime;
      console.log(`✅ Batch created ${records.length} consumption records in ${executionTime}ms`);
    }
  } catch (error) {
    console.error('Error batch creating consumption records:', error);
    throw error;
  }
}

/**
 * Optimized inventory consumption for orders
 * Uses batch operations for maximum efficiency
 */
export async function optimizedAutoConsumeInventory(order: any): Promise<{
  success: boolean;
  consumedItems: number;
  errors: string[];
}> {
  const startTime = Date.now();
  const errors: string[] = [];
  let consumedItems = 0;
  
  try {
    // Step 1: Collect all unique menu item IDs and ingredient IDs
    const menuItemIds = [...new Set(order.items.map((item: any) => item.menuItemId))];
    const ingredientIds = new Set<string>();
    
    // Step 2: Batch fetch menu items
    const menuItemsMap = await batchFetchMenuItems(menuItemIds);
    
    // Step 3: Collect all ingredient IDs from menu items
    for (const menuItem of menuItemsMap.values()) {
      menuItem.ingredients.forEach((ingredient: any) => {
        ingredientIds.add(ingredient.ingredientId);
      });
    }
    
    // Step 4: Batch fetch inventory items
    const inventoryMap = await batchFetchInventoryItems(Array.from(ingredientIds));
    
    // Step 5: Prepare batch updates and consumption records
    const inventoryUpdates: Array<{
      ingredientId: string;
      currentStock: number;
      status: string;
      lastUpdated: Date;
    }> = [];
    
    const consumptionRecords: Array<{
      ingredientId: string;
      ingredientName: string;
      quantityConsumed: number;
      unit: string;
      reason: string;
      orderId: string;
      menuItemId: string;
      notes: string;
      recordedBy: string;
      recordedAt: Date;
    }> = [];
    
    // Step 6: Process each order item
    for (const orderItem of order.items) {
      const menuItem = menuItemsMap.get(orderItem.menuItemId);
      if (!menuItem) {
        errors.push(`Menu item not found: ${orderItem.menuItemId}`);
        continue;
      }
      
      // Process each ingredient
      for (const ingredient of menuItem.ingredients) {
        const inventoryItem = inventoryMap.get(ingredient.ingredientId);
        if (!inventoryItem) {
          errors.push(`Inventory item not found for ingredient: ${ingredient.ingredientId}`);
          continue;
        }
        
        const totalConsumption = ingredient.portion * orderItem.quantity;
        
        // Check if there's enough stock
        if (inventoryItem.currentStock < totalConsumption) {
          errors.push(`Insufficient stock for ${inventoryItem.ingredientName}: ${inventoryItem.currentStock} < ${totalConsumption}`);
          continue;
        }
        
        // Prepare consumption record
        consumptionRecords.push({
          ingredientId: ingredient.ingredientId,
          ingredientName: inventoryItem.ingredientName,
          quantityConsumed: totalConsumption,
          unit: inventoryItem.unit,
          reason: 'order',
          orderId: order._id.toString(),
          menuItemId: orderItem.menuItemId,
          notes: `Auto-consumption for order ${order.orderNumber}`,
          recordedBy: 'system',
          recordedAt: new Date()
        });
        
        // Calculate new stock and status
        const newStock = inventoryItem.currentStock - totalConsumption;
        let newStatus = 'in_stock';
        
        if (newStock <= 0) {
          newStatus = 'out_of_stock';
        } else if (newStock <= inventoryItem.minStockLevel) {
          newStatus = 'low_stock';
        }
        
        // Prepare inventory update
        inventoryUpdates.push({
          ingredientId: ingredient.ingredientId,
          currentStock: newStock,
          status: newStatus,
          lastUpdated: new Date()
        });
        
        consumedItems++;
      }
    }
    
    // Step 7: Execute batch operations
    if (consumptionRecords.length > 0) {
      await batchCreateConsumptionRecords(consumptionRecords);
    }
    
    if (inventoryUpdates.length > 0) {
      await batchUpdateInventoryItems(inventoryUpdates);
    }
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ Optimized inventory consumption completed in ${executionTime}ms`);
    
    return {
      success: errors.length === 0,
      consumedItems,
      errors
    };
    
  } catch (error) {
    console.error('Error in optimized auto-consume inventory:', error);
    return {
      success: false,
      consumedItems,
      errors: [...errors, 'Error processing inventory consumption']
    };
  }
}

/**
 * Get inventory summary with optimized queries
 */
export async function getInventorySummary(): Promise<{
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}> {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$cost'] } }
        }
      }
    ];
    
    const results = await InventoryItem.aggregate(pipeline);
    
    const summary = {
      totalItems: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0
    };
    
    results.forEach(result => {
      summary.totalItems += result.count;
      summary.totalValue += result.totalValue || 0;
      
      switch (result._id) {
        case 'in_stock':
          summary.inStock = result.count;
          break;
        case 'low_stock':
          summary.lowStock = result.count;
          break;
        case 'out_of_stock':
          summary.outOfStock = result.count;
          break;
      }
    });
    
    return summary;
  } catch (error) {
    console.error('Error getting inventory summary:', error);
    return {
      totalItems: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0
    };
  }
}






