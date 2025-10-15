import MenuItem from '@/lib/models/MenuItem';
import { InventoryItem } from '@/lib/models/Inventory';
import { sendMenuItemDisabledNotification } from '@/lib/notificationUtils';

/**
 * Auto-disable menu items when their required ingredients are out of stock
 * This function should be called after inventory status updates
 */
export async function autoDisableMenuItems(ingredientId: string): Promise<void> {
  try {
    // Find all menu items that use this ingredient
    const menuItems = await MenuItem.find({
      'ingredients.ingredientId': ingredientId,
      status: 'active' // Only check active items
    });

    if (menuItems.length === 0) {
      return;
    }

    // Get the inventory item to check its status
    const inventoryItem = await InventoryItem.findOne({ ingredientId });
    if (!inventoryItem) {
      return;
    }

    // If ingredient is out of stock, disable dependent menu items
    if (inventoryItem.status === 'out_of_stock') {
      const disabledItems = [];
      
      for (const menuItem of menuItems) {
        // Check if this ingredient is required for the menu item
        const ingredient = menuItem.ingredients.find(ing => ing.ingredientId === ingredientId);
        if (ingredient && ingredient.required) {
          // Disable the menu item
          menuItem.status = 'out_of_stock';
          await menuItem.save();
          
          disabledItems.push({
            name: menuItem.name,
            id: menuItem._id
          });
          
          // Send notification
          await sendMenuItemDisabledNotification(
            menuItem.name,
            `نفد المخزون من المكون: ${inventoryItem.ingredientName}`
          );
        }
      }
      
      if (disabledItems.length > 0) {
        console.log(`✅ Auto-disabled ${disabledItems.length} menu items due to out of stock ingredient: ${inventoryItem.ingredientName}`);
      }
    }
  } catch (error) {
    console.error('Error auto-disabling menu items:', error);
  }
}

/**
 * Re-enable menu items when ingredients are back in stock
 * This function should be called when inventory is restocked
 */
export async function autoEnableMenuItems(ingredientId: string): Promise<void> {
  try {
    // Find all menu items that use this ingredient and are currently out of stock
    const menuItems = await MenuItem.find({
      'ingredients.ingredientId': ingredientId,
      status: 'out_of_stock'
    });

    if (menuItems.length === 0) {
      return;
    }

    // Get the inventory item to check its status
    const inventoryItem = await InventoryItem.findOne({ ingredientId });
    if (!inventoryItem) {
      return;
    }

    // If ingredient is back in stock, check if we can re-enable menu items
    if (inventoryItem.status === 'in_stock' || inventoryItem.status === 'low_stock') {
      const enabledItems = [];
      
      for (const menuItem of menuItems) {
        // Check if all required ingredients are available
        const allIngredientsAvailable = await checkAllIngredientsAvailable(menuItem);
        
        if (allIngredientsAvailable) {
          // Re-enable the menu item
          menuItem.status = 'active';
          await menuItem.save();
          
          enabledItems.push({
            name: menuItem.name,
            id: menuItem._id
          });
        }
      }
      
      if (enabledItems.length > 0) {
        console.log(`✅ Auto-enabled ${enabledItems.length} menu items due to restocked ingredient: ${inventoryItem.ingredientName}`);
      }
    }
  } catch (error) {
    console.error('Error auto-enabling menu items:', error);
  }
}

/**
 * Check if all required ingredients for a menu item are available
 */
async function checkAllIngredientsAvailable(menuItem: any): Promise<boolean> {
  try {
    const ingredientIds = menuItem.ingredients
      .filter((ing: any) => ing.required)
      .map((ing: any) => ing.ingredientId);
    
    if (ingredientIds.length === 0) {
      return true;
    }
    
    const inventoryItems = await InventoryItem.find({
      ingredientId: { $in: ingredientIds },
      status: { $in: ['in_stock', 'low_stock'] }
    });
    
    return inventoryItems.length === ingredientIds.length;
  } catch (error) {
    console.error('Error checking ingredients availability:', error);
    return false;
  }
}

/**
 * Batch process menu item status updates for multiple ingredients
 * This is more efficient when processing multiple inventory updates
 */
export async function batchUpdateMenuItemsStatus(ingredientIds: string[]): Promise<void> {
  try {
    // Process each ingredient
    for (const ingredientId of ingredientIds) {
      await autoDisableMenuItems(ingredientId);
      await autoEnableMenuItems(ingredientId);
    }
  } catch (error) {
    console.error('Error batch updating menu items status:', error);
  }
}






