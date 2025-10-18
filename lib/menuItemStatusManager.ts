import MenuItem from '@/lib/models/MenuItem';
import { InventoryItem } from '@/lib/models/Inventory';
import { sendMenuItemDisabledNotification } from '@/lib/notificationUtils';

/**
 * Auto-disable menu items when their required inventory items are out of stock
 * This function should be called after inventory status updates
 */
export async function autoDisableMenuItems(inventoryItemId: string): Promise<void> {
  try {
    // Find all menu items that use this inventory item
    const menuItems = await MenuItem.find({
      'inventoryItems.inventoryItemId': inventoryItemId,
      status: 'active' // Only check active items
    });

    if (menuItems.length === 0) {
      return;
    }

    // Get the inventory item to check its status
    const inventoryItem = await InventoryItem.findById(inventoryItemId);
    if (!inventoryItem) {
      return;
    }

    // If inventory item is out of stock, disable dependent menu items
    if (inventoryItem.status === 'out_of_stock') {
      const disabledItems = [];
      
      for (const menuItem of menuItems) {
        // Check if this inventory item is required for the menu item
        const invItem = menuItem.inventoryItems.find(item => item.inventoryItemId === inventoryItemId);
        if (invItem && invItem.required) {
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
            `نفد المخزون من: ${inventoryItem.ingredientName}`
          );
        }
      }
      
      if (disabledItems.length > 0) {
        console.log(`✅ Auto-disabled ${disabledItems.length} menu items due to out of stock inventory item: ${inventoryItem.ingredientName}`);
      }
    }
  } catch (error) {
    console.error('Error auto-disabling menu items:', error);
  }
}

/**
 * Re-enable menu items when inventory items are back in stock
 * This function should be called when inventory is restocked
 */
export async function autoEnableMenuItems(inventoryItemId: string): Promise<void> {
  try {
    // Find all menu items that use this inventory item and are currently out of stock
    const menuItems = await MenuItem.find({
      'inventoryItems.inventoryItemId': inventoryItemId,
      status: 'out_of_stock'
    });

    if (menuItems.length === 0) {
      return;
    }

    // Get the inventory item to check its status
    const inventoryItem = await InventoryItem.findById(inventoryItemId);
    if (!inventoryItem) {
      return;
    }

    // If inventory item is back in stock, check if we can re-enable menu items
    if (inventoryItem.status === 'in_stock' || inventoryItem.status === 'low_stock') {
      const enabledItems = [];
      
      for (const menuItem of menuItems) {
        // Check if all required inventory items are available
        const allInventoryItemsAvailable = await checkAllInventoryItemsAvailable(menuItem);
        
        if (allInventoryItemsAvailable) {
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
        console.log(`✅ Auto-enabled ${enabledItems.length} menu items due to restocked inventory item: ${inventoryItem.ingredientName}`);
      }
    }
  } catch (error) {
    console.error('Error auto-enabling menu items:', error);
  }
}

/**
 * Check if all required inventory items for a menu item are available
 */
async function checkAllInventoryItemsAvailable(menuItem: any): Promise<boolean> {
  try {
    const inventoryItemIds = menuItem.inventoryItems
      .filter((item: any) => item.required)
      .map((item: any) => item.inventoryItemId);
    
    if (inventoryItemIds.length === 0) {
      return true;
    }
    
    const inventoryItems = await InventoryItem.find({
      _id: { $in: inventoryItemIds },
      status: { $in: ['in_stock', 'low_stock'] }
    });
    
    return inventoryItems.length === inventoryItemIds.length;
  } catch (error) {
    console.error('Error checking inventory items availability:', error);
    return false;
  }
}

/**
 * Batch process menu item status updates for multiple inventory items
 * This is more efficient when processing multiple inventory updates
 */
export async function batchUpdateMenuItemsStatus(inventoryItemIds: string[]): Promise<void> {
  try {
    // Process each inventory item
    for (const inventoryItemId of inventoryItemIds) {
      await autoDisableMenuItems(inventoryItemId);
      await autoEnableMenuItems(inventoryItemId);
    }
  } catch (error) {
    console.error('Error batch updating menu items status:', error);
  }
}






