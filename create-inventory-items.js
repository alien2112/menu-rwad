// Create test inventory items
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://eslamabdaltif:oneone2@cluster0.p8b1qnv.mongodb.net/menurwad?retryWrites=true&w=majority&appName=Cluster0';

// Inventory Item schema
const inventoryItemSchema = new mongoose.Schema({
  ingredientId: { type: String, required: true },
  ingredientName: { type: String, required: true, trim: true },
  currentStock: { type: Number, required: true, min: 0, default: 0 },
  unit: { type: String, required: true, default: 'g' },
  minStockLevel: { type: Number, required: true, min: 0, default: 10 },
  maxStockLevel: { type: Number, required: true, min: 0, default: 100 },
  lastUpdated: { type: Date, default: Date.now },
  status: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
}, { timestamps: true });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

async function createInventoryItems() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected');

    // Check existing inventory items
    const existingItems = await InventoryItem.find({});
    console.log(`📦 Found ${existingItems.length} existing inventory items`);

    if (existingItems.length === 0) {
      console.log('📦 No inventory items found, creating sample items...');
      
      // Create sample inventory items
      const sampleItems = [
        {
          ingredientId: 'ingredient_001',
          ingredientName: 'دقيق القمح',
          currentStock: 50,
          unit: 'kg',
          minStockLevel: 10,
          maxStockLevel: 100,
          status: 'in_stock'
        },
        {
          ingredientId: 'ingredient_002',
          ingredientName: 'زيت الزيتون',
          currentStock: 25,
          unit: 'L',
          minStockLevel: 5,
          maxStockLevel: 50,
          status: 'in_stock'
        },
        {
          ingredientId: 'ingredient_003',
          ingredientName: 'جبن موزاريلا',
          currentStock: 15,
          unit: 'kg',
          minStockLevel: 5,
          maxStockLevel: 30,
          status: 'in_stock'
        },
        {
          ingredientId: 'ingredient_004',
          ingredientName: 'طماطم طازجة',
          currentStock: 8,
          unit: 'kg',
          minStockLevel: 3,
          maxStockLevel: 20,
          status: 'low_stock'
        },
        {
          ingredientId: 'ingredient_005',
          ingredientName: 'بصل',
          currentStock: 12,
          unit: 'kg',
          minStockLevel: 5,
          maxStockLevel: 25,
          status: 'in_stock'
        },
        {
          ingredientId: 'ingredient_006',
          ingredientName: 'لحم بقري',
          currentStock: 0,
          unit: 'kg',
          minStockLevel: 5,
          maxStockLevel: 20,
          status: 'out_of_stock'
        },
        {
          ingredientId: 'ingredient_007',
          ingredientName: 'قهوة عربية',
          currentStock: 30,
          unit: 'kg',
          minStockLevel: 10,
          maxStockLevel: 50,
          status: 'in_stock'
        },
        {
          ingredientId: 'ingredient_008',
          ingredientName: 'حليب',
          currentStock: 20,
          unit: 'L',
          minStockLevel: 5,
          maxStockLevel: 40,
          status: 'in_stock'
        },
        {
          ingredientId: 'ingredient_009',
          ingredientName: 'سكر',
          currentStock: 18,
          unit: 'kg',
          minStockLevel: 5,
          maxStockLevel: 30,
          status: 'in_stock'
        },
        {
          ingredientId: 'ingredient_010',
          ingredientName: 'شاي أحمر',
          currentStock: 25,
          unit: 'kg',
          minStockLevel: 5,
          maxStockLevel: 40,
          status: 'in_stock'
        }
      ];

      // Create inventory items
      for (const itemData of sampleItems) {
        const newItem = await InventoryItem.create(itemData);
        console.log(`✅ Created: ${newItem.ingredientName} (${newItem.currentStock} ${newItem.unit}) - ${newItem.status}`);
      }

      console.log(`\n🎉 Created ${sampleItems.length} inventory items!`);
    } else {
      console.log('📦 Inventory items already exist:');
      existingItems.forEach(item => {
        console.log(`   - ${item.ingredientName} (${item.currentStock} ${item.unit}) - ${item.status}`);
      });
    }

    // Test the API endpoint
    console.log('\n🔍 Testing inventory API...');
    const allItems = await InventoryItem.find({}).sort({ ingredientName: 1 });
    console.log(`📊 Total inventory items: ${allItems.length}`);
    
    if (allItems.length > 0) {
      console.log('\n📋 Available inventory items for menu:');
      allItems.forEach(item => {
        console.log(`   - ${item.ingredientName} (${item.unit}) - ${item.currentStock} متوفر`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createInventoryItems();
