const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Ingredient = require('../lib/models/Ingredient');
const { InventoryItem } = require('../lib/models/Inventory');

async function initInventory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all ingredients
    const ingredients = await Ingredient.find({ status: 'active' });
    console.log(`Found ${ingredients.length} active ingredients`);

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
        console.log(`Created inventory item for: ${ingredient.name} (${initialStock} ${ingredient.unit})`);
      } else {
        console.log(`Inventory item already exists for: ${ingredient.name}`);
      }
    }

    console.log('Inventory initialization completed!');
    
    // Show summary
    const totalItems = await InventoryItem.countDocuments();
    const lowStockItems = await InventoryItem.countDocuments({ status: 'low_stock' });
    const outOfStockItems = await InventoryItem.countDocuments({ status: 'out_of_stock' });
    
    console.log('\n=== Inventory Summary ===');
    console.log(`Total inventory items: ${totalItems}`);
    console.log(`Low stock items: ${lowStockItems}`);
    console.log(`Out of stock items: ${outOfStockItems}`);

  } catch (error) {
    console.error('Error initializing inventory:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
initInventory();
