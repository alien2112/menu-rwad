/**
 * Test Application Database Connection
 * Verify that the app is using the same database as the fake data
 */

const mongoose = require('mongoose');

// Connect to MongoDB using the same connection as the app
async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://eslamabdaltif:oneone2@cluster0.p8b1qnv.mongodb.net/menurwad?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB Atlas (menurwad database)');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testAppDatabase() {
  console.log('🔍 Testing Application Database Connection...\n');
  
  try {
    await connectDB();
    
    // Test the same models that the app uses
    const Category = mongoose.model('Category', new mongoose.Schema({
      name: String,
      nameEn: String,
      description: String,
      image: String,
      color: String,
      order: Number,
      featured: Boolean,
      status: String,
      createdAt: Date,
      updatedAt: Date
    }));

    const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({
      name: String,
      nameEn: String,
      description: String,
      categoryId: String,
      price: Number,
      cost: Number,
      image: String,
      preparationTime: Number,
      calories: Number,
      status: String,
      featured: Boolean,
      order: Number,
      ingredients: Array,
      allergens: Array,
      createdAt: Date,
      updatedAt: Date
    }));

    const Order = mongoose.model('Order', new mongoose.Schema({
      orderNumber: String,
      items: Array,
      totalAmount: Number,
      discountAmount: Number,
      taxInfo: Object,
      customerInfo: Object,
      status: String,
      departmentStatuses: Object,
      orderDate: Date,
      source: String,
      notes: String,
      assignedTo: Object,
      createdAt: Date,
      updatedAt: Date
    }));

    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      name: String,
      isActive: Boolean,
      lastLogin: Date,
      createdAt: Date,
      updatedAt: Date
    }));

    const Printer = mongoose.model('Printer', new mongoose.Schema({
      name: String,
      department: String,
      connectionType: String,
      connectionDetails: Object,
      paperWidth: Number,
      isActive: Boolean,
      isOnline: Boolean,
      settings: Object,
      printCount: Number,
      errorCount: Number,
      createdAt: Date,
      updatedAt: Date
    }));

    const TaxSettings = mongoose.model('TaxSettings', new mongoose.Schema({
      enableTaxHandling: Boolean,
      taxType: String,
      vatRate: Number,
      includeTaxInPrice: Boolean,
      displayTaxBreakdown: Boolean,
      generateTaxReports: Boolean,
      taxNumber: String,
      complianceMode: String,
      createdAt: Date,
      updatedAt: Date
    }));

    // Test data retrieval
    console.log('📊 Testing Data Retrieval...\n');
    
    const categories = await Category.find({});
    console.log(`📂 Categories: ${categories.length} found`);
    
    const menuItems = await MenuItem.find({});
    console.log(`🍽️ Menu Items: ${menuItems.length} found`);
    
    const orders = await Order.find({});
    console.log(`📋 Orders: ${orders.length} found`);
    
    const users = await User.find({});
    console.log(`👥 Users: ${users.length} found`);
    
    const printers = await Printer.find({});
    console.log(`🖨️ Printers: ${printers.length} found`);
    
    const taxSettings = await TaxSettings.find({});
    console.log(`💰 Tax Settings: ${taxSettings.length} found`);

    console.log('\n✅ Database Connection Test Results:');
    console.log(`• Database: menurwad`);
    console.log(`• Connection: MongoDB Atlas`);
    console.log(`• Categories: ${categories.length}`);
    console.log(`• Menu Items: ${menuItems.length}`);
    console.log(`• Orders: ${orders.length}`);
    console.log(`• Users: ${users.length}`);
    console.log(`• Printers: ${printers.length}`);
    console.log(`• Tax Settings: ${taxSettings.length}`);

    if (categories.length > 0 && menuItems.length > 0 && orders.length > 0) {
      console.log('\n🎉 SUCCESS: Your application is using the same database with fake data!');
      console.log('✅ All data is accessible and ready for testing.');
    } else {
      console.log('\n❌ WARNING: Some data might be missing. Please regenerate fake data.');
    }

  } catch (error) {
    console.error('❌ Error testing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testAppDatabase();





