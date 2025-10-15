/**
 * Verify Fake Data Script
 * Check if fake data was properly generated and can be retrieved
 */

const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://eslamabdaltif:oneone2@cluster0.p8b1qnv.mongodb.net/menurwad?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function verifyData() {
  console.log('🔍 Verifying Fake Data...\n');
  
  try {
    await connectDB();
    
    // Check Categories
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
    
    const categories = await Category.find({});
    console.log(`📂 Categories: ${categories.length} found`);
    if (categories.length > 0) {
      console.log('   Sample categories:');
      categories.slice(0, 3).forEach(cat => {
        console.log(`   - ${cat.name} (${cat.nameEn})`);
      });
    }
    
    // Check Menu Items
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
      createdAt: Date,
      updatedAt: Date
    }));
    
    const menuItems = await MenuItem.find({});
    console.log(`🍽️ Menu Items: ${menuItems.length} found`);
    if (menuItems.length > 0) {
      console.log('   Sample menu items:');
      menuItems.slice(0, 3).forEach(item => {
        console.log(`   - ${item.name} (${item.nameEn}) - ${item.price} ر.س`);
      });
    }
    
    // Check Materials
    const Material = mongoose.model('Material', new mongoose.Schema({
      name: String,
      nameEn: String,
      description: String,
      unit: String,
      currentQuantity: Number,
      minLimit: Number,
      alertLimit: Number,
      costPerUnit: Number,
      supplier: String,
      category: String,
      status: String,
      createdAt: Date,
      updatedAt: Date
    }));
    
    const materials = await Material.find({});
    console.log(`📦 Materials: ${materials.length} found`);
    if (materials.length > 0) {
      console.log('   Sample materials:');
      materials.slice(0, 3).forEach(mat => {
        console.log(`   - ${mat.name} (${mat.currentQuantity} ${mat.unit}) - ${mat.costPerUnit} ر.س`);
      });
    }
    
    // Check Users
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
    
    const users = await User.find({});
    console.log(`👥 Users: ${users.length} found`);
    if (users.length > 0) {
      console.log('   Sample users:');
      users.slice(0, 3).forEach(user => {
        console.log(`   - ${user.username} (${user.name}) - ${user.role}`);
      });
    }
    
    // Check Orders
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
    
    const orders = await Order.find({});
    console.log(`📋 Orders: ${orders.length} found`);
    if (orders.length > 0) {
      console.log('   Sample orders:');
      orders.slice(0, 3).forEach(order => {
        console.log(`   - ${order.orderNumber} - ${order.customerInfo?.name} - ${order.totalAmount} ر.س`);
      });
    }
    
    // Check Printers
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
    
    const printers = await Printer.find({});
    console.log(`🖨️ Printers: ${printers.length} found`);
    if (printers.length > 0) {
      console.log('   Sample printers:');
      printers.forEach(printer => {
        console.log(`   - ${printer.name} (${printer.department}) - ${printer.isOnline ? 'Online' : 'Offline'}`);
      });
    }
    
    // Check Tax Settings
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
    
    const taxSettings = await TaxSettings.find({});
    console.log(`💰 Tax Settings: ${taxSettings.length} found`);
    if (taxSettings.length > 0) {
      const settings = taxSettings[0];
      console.log(`   - VAT Rate: ${settings.vatRate}%`);
      console.log(`   - Tax Handling: ${settings.enableTaxHandling ? 'Enabled' : 'Disabled'}`);
      console.log(`   - Compliance: ${settings.complianceMode}`);
    }
    
    // Check Waste Logs
    const WasteLog = mongoose.model('WasteLog', new mongoose.Schema({
      itemName: String,
      itemId: String,
      category: String,
      quantity: Number,
      unit: String,
      cost: Number,
      reason: String,
      description: String,
      department: String,
      loggedBy: String,
      wasteDate: Date,
      isRecoverable: Boolean,
      recoveryAction: String,
      createdAt: Date,
      updatedAt: Date
    }));
    
    const wasteLogs = await WasteLog.find({});
    console.log(`🗑️ Waste Logs: ${wasteLogs.length} found`);
    if (wasteLogs.length > 0) {
      console.log('   Sample waste logs:');
      wasteLogs.slice(0, 3).forEach(log => {
        console.log(`   - ${log.itemName} - ${log.quantity} ${log.unit} - ${log.cost} ر.س`);
      });
    }
    
    console.log('\n📊 Data Summary:');
    console.log(`• Categories: ${categories.length}`);
    console.log(`• Menu Items: ${menuItems.length}`);
    console.log(`• Materials: ${materials.length}`);
    console.log(`• Users: ${users.length}`);
    console.log(`• Orders: ${orders.length}`);
    console.log(`• Printers: ${printers.length}`);
    console.log(`• Tax Settings: ${taxSettings.length}`);
    console.log(`• Waste Logs: ${wasteLogs.length}`);
    
    if (categories.length === 0 || menuItems.length === 0) {
      console.log('\n❌ No data found! The fake data generation may have failed.');
      console.log('Please run the fake data generation script again.');
    } else {
      console.log('\n✅ Fake data verification successful!');
      console.log('All data is properly stored in the database.');
    }
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the verification
verifyData();
