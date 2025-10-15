/**
 * Simple Fake Data Generation Script
 * Generates basic test data for system testing
 */

const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/menurwad');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Simple data generators
const generateCategories = async () => {
  console.log('📂 Generating Categories...');
  
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

  const categories = [
    { name: 'المشروبات الساخنة', nameEn: 'Hot Beverages', description: 'مشروبات ساخنة', color: '#C2914A', order: 1, featured: true, status: 'active' },
    { name: 'المشروبات الباردة', nameEn: 'Cold Beverages', description: 'مشروبات باردة', color: '#B8853F', order: 2, featured: true, status: 'active' },
    { name: 'القهوة العربية', nameEn: 'Arabic Coffee', description: 'قهوة عربية', color: '#8B6B2D', order: 3, featured: true, status: 'active' },
    { name: 'الشاي', nameEn: 'Tea', description: 'شاي', color: '#6A5122', order: 4, featured: true, status: 'active' },
    { name: 'العصائر الطبيعية', nameEn: 'Natural Juices', description: 'عصائر طبيعية', color: '#D9A65A', order: 5, featured: true, status: 'active' },
    { name: 'الكوكتيلات', nameEn: 'Cocktails', description: 'كوكتيلات', color: '#E0B777', order: 6, featured: true, status: 'active' },
    { name: 'الأطباق الرئيسية', nameEn: 'Main Dishes', description: 'أطباق رئيسية', color: '#A67939', order: 7, featured: false, status: 'active' },
    { name: 'المقبلات', nameEn: 'Appetizers', description: 'مقبلات', color: '#8B6914', order: 8, featured: false, status: 'active' },
    { name: 'البرجر', nameEn: 'Burgers', description: 'برجر', color: '#CD853F', order: 9, featured: false, status: 'active' },
    { name: 'البيتزا', nameEn: 'Pizza', description: 'بيتزا', color: '#DAA520', order: 10, featured: false, status: 'active' },
    { name: 'الساندويتشات', nameEn: 'Sandwiches', description: 'ساندويتشات', color: '#B8860B', order: 11, featured: false, status: 'active' },
    { name: 'الحلويات', nameEn: 'Desserts', description: 'حلويات', color: '#D2691E', order: 12, featured: false, status: 'active' },
    { name: 'الشيشة', nameEn: 'Shisha', description: 'شيشة', color: '#C2914A', order: 13, featured: false, status: 'active' },
    { name: 'التبغ', nameEn: 'Tobacco', description: 'تبغ', color: '#B8853F', order: 14, featured: false, status: 'active' }
  ];

  await Category.insertMany(categories);
  console.log(`✅ Generated ${categories.length} categories`);
  return categories;
};

const generateMenuItems = async (categories) => {
  console.log('🍽️ Generating Menu Items...');
  
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

  const menuItems = [
    // Hot Beverages
    { name: 'قهوة عربية', nameEn: 'Arabic Coffee', categoryId: categories[2]._id, price: 25, cost: 8, prepTime: 5, calories: 50 },
    { name: 'قهوة تركية', nameEn: 'Turkish Coffee', categoryId: categories[2]._id, price: 30, cost: 10, prepTime: 8, calories: 60 },
    { name: 'قهوة إسبريسو', nameEn: 'Espresso', categoryId: categories[0]._id, price: 20, cost: 6, prepTime: 3, calories: 40 },
    { name: 'قهوة لاتيه', nameEn: 'Latte', categoryId: categories[0]._id, price: 35, cost: 12, prepTime: 5, calories: 120 },
    { name: 'كابتشينو', nameEn: 'Cappuccino', categoryId: categories[0]._id, price: 32, cost: 11, prepTime: 4, calories: 100 },
    { name: 'شاي أحمر', nameEn: 'Red Tea', categoryId: categories[3]._id, price: 15, cost: 5, prepTime: 3, calories: 30 },
    { name: 'شاي أخضر', nameEn: 'Green Tea', categoryId: categories[3]._id, price: 18, cost: 6, prepTime: 3, calories: 25 },
    { name: 'شاي بالحليب', nameEn: 'Tea with Milk', categoryId: categories[3]._id, price: 20, cost: 7, prepTime: 4, calories: 80 },

    // Cold Beverages
    { name: 'قهوة باردة', nameEn: 'Cold Coffee', categoryId: categories[1]._id, price: 28, cost: 9, prepTime: 4, calories: 150 },
    { name: 'فرابتشينو', nameEn: 'Frappuccino', categoryId: categories[1]._id, price: 40, cost: 14, prepTime: 6, calories: 200 },
    { name: 'عصير برتقال', nameEn: 'Orange Juice', categoryId: categories[4]._id, price: 22, cost: 8, prepTime: 3, calories: 120 },
    { name: 'عصير تفاح', nameEn: 'Apple Juice', categoryId: categories[4]._id, price: 25, cost: 9, prepTime: 3, calories: 110 },
    { name: 'عصير مانجو', nameEn: 'Mango Juice', categoryId: categories[4]._id, price: 30, cost: 11, prepTime: 4, calories: 140 },
    { name: 'كوكتيل فواكه', nameEn: 'Fruit Cocktail', categoryId: categories[5]._id, price: 35, cost: 13, prepTime: 5, calories: 180 },

    // Main Dishes
    { name: 'برجر لحم', nameEn: 'Beef Burger', categoryId: categories[8]._id, price: 45, cost: 18, prepTime: 15, calories: 600 },
    { name: 'برجر دجاج', nameEn: 'Chicken Burger', categoryId: categories[8]._id, price: 42, cost: 16, prepTime: 12, calories: 550 },
    { name: 'بيتزا مارغريتا', nameEn: 'Margherita Pizza', categoryId: categories[9]._id, price: 65, cost: 25, prepTime: 20, calories: 800 },
    { name: 'بيتزا بيبروني', nameEn: 'Pepperoni Pizza', categoryId: categories[9]._id, price: 75, cost: 30, prepTime: 22, calories: 900 },
    { name: 'ساندويتش لحم', nameEn: 'Meat Sandwich', categoryId: categories[10]._id, price: 35, cost: 14, prepTime: 10, calories: 400 },
    { name: 'ساندويتش دجاج', nameEn: 'Chicken Sandwich', categoryId: categories[10]._id, price: 32, cost: 13, prepTime: 8, calories: 350 },
    { name: 'كباب لحم', nameEn: 'Meat Kebab', categoryId: categories[6]._id, price: 55, cost: 22, prepTime: 18, calories: 700 },
    { name: 'كباب دجاج', nameEn: 'Chicken Kebab', categoryId: categories[6]._id, price: 50, cost: 20, prepTime: 15, calories: 650 },

    // Appetizers
    { name: 'حمص', nameEn: 'Hummus', categoryId: categories[7]._id, price: 25, cost: 10, prepTime: 5, calories: 200 },
    { name: 'متبل', nameEn: 'Moutabal', categoryId: categories[7]._id, price: 28, cost: 11, prepTime: 6, calories: 220 },
    { name: 'فتوش', nameEn: 'Fattoush', categoryId: categories[7]._id, price: 30, cost: 12, prepTime: 8, calories: 150 },
    { name: 'تبولة', nameEn: 'Tabbouleh', categoryId: categories[7]._id, price: 25, cost: 10, prepTime: 7, calories: 120 },

    // Desserts
    { name: 'كنافة', nameEn: 'Knafeh', categoryId: categories[11]._id, price: 35, cost: 14, prepTime: 10, calories: 400 },
    { name: 'بقلاوة', nameEn: 'Baklava', categoryId: categories[11]._id, price: 40, cost: 16, prepTime: 5, calories: 350 },
    { name: 'أم علي', nameEn: 'Umm Ali', categoryId: categories[11]._id, price: 30, cost: 12, prepTime: 8, calories: 300 },
    { name: 'مهلبية', nameEn: 'Muhallabia', categoryId: categories[11]._id, price: 25, cost: 10, prepTime: 6, calories: 250 },

    // Shisha
    { name: 'شيشة تفاح', nameEn: 'Apple Shisha', categoryId: categories[12]._id, price: 60, cost: 20, prepTime: 5, calories: 0 },
    { name: 'شيشة عنب', nameEn: 'Grape Shisha', categoryId: categories[12]._id, price: 65, cost: 22, prepTime: 5, calories: 0 },
    { name: 'شيشة فراولة', nameEn: 'Strawberry Shisha', categoryId: categories[12]._id, price: 70, cost: 24, prepTime: 5, calories: 0 },
    { name: 'شيشة نعناع', nameEn: 'Mint Shisha', categoryId: categories[12]._id, price: 55, cost: 18, prepTime: 5, calories: 0 }
  ];

  const itemsWithIds = menuItems.map((item, index) => ({
    ...item,
    description: `وصف ${item.name}`,
    image: `/images/items/${item.nameEn.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    preparationTime: item.prepTime,
    status: 'active',
    featured: index < 10,
    order: index + 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await MenuItem.insertMany(itemsWithIds);
  console.log(`✅ Generated ${itemsWithIds.length} menu items`);
  return itemsWithIds;
};

const generateUsers = async () => {
  console.log('👥 Generating Users...');
  
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

  const users = [
    { username: 'admin', password: 'admin2024', role: 'admin', name: 'مدير النظام', isActive: true },
    { username: 'kitchen', password: 'kitchen2024', role: 'kitchen', name: 'مطبخ', isActive: true },
    { username: 'barista', password: 'barista2024', role: 'barista', name: 'بارستا', isActive: true },
    { username: 'shisha', password: 'shisha2024', role: 'shisha', name: 'شيشة', isActive: true },
    { username: 'chef1', password: 'chef2024', role: 'kitchen', name: 'محمد الشيف', isActive: true },
    { username: 'chef2', password: 'chef2024', role: 'kitchen', name: 'أحمد الطباخ', isActive: true },
    { username: 'barista1', password: 'barista2024', role: 'barista', name: 'فاطمة البارستا', isActive: true },
    { username: 'barista2', password: 'barista2024', role: 'barista', name: 'علي البارستا', isActive: true },
    { username: 'shisha1', password: 'shisha2024', role: 'shisha', name: 'سارة الشيشة', isActive: true },
    { username: 'shisha2', password: 'shisha2024', role: 'shisha', name: 'خالد الشيشة', isActive: true }
  ];

  await User.insertMany(users);
  console.log(`✅ Generated ${users.length} users`);
  return users;
};

const generateMaterials = async () => {
  console.log('📦 Generating Materials...');
  
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

  const materials = [
    { name: 'قهوة عربية', unit: 'kg', currentQuantity: 10, minLimit: 2, costPerUnit: 45, category: 'food', supplier: 'مورد القهوة' },
    { name: 'حليب', unit: 'liter', currentQuantity: 20, minLimit: 5, costPerUnit: 8, category: 'beverage', supplier: 'مورد الألبان' },
    { name: 'سكر', unit: 'kg', currentQuantity: 15, minLimit: 3, costPerUnit: 6, category: 'food', supplier: 'مورد السكر' },
    { name: 'لحم بقري', unit: 'kg', currentQuantity: 8, minLimit: 2, costPerUnit: 85, category: 'food', supplier: 'مورد اللحوم' },
    { name: 'دجاج', unit: 'kg', currentQuantity: 12, minLimit: 3, costPerUnit: 35, category: 'food', supplier: 'مورد الدجاج' },
    { name: 'خبز', unit: 'piece', currentQuantity: 100, minLimit: 20, costPerUnit: 2, category: 'food', supplier: 'مخبز الأصالة' },
    { name: 'جبن', unit: 'kg', currentQuantity: 6, minLimit: 2, costPerUnit: 25, category: 'food', supplier: 'مورد الأجبان' },
    { name: 'طماطم', unit: 'kg', currentQuantity: 10, minLimit: 3, costPerUnit: 12, category: 'food', supplier: 'مورد الخضار' },
    { name: 'بصل', unit: 'kg', currentQuantity: 8, minLimit: 2, costPerUnit: 8, category: 'food', supplier: 'مورد الخضار' },
    { name: 'تبغ الشيشة', unit: 'kg', currentQuantity: 5, minLimit: 1, costPerUnit: 120, category: 'shisha', supplier: 'مورد التبغ' },
    { name: 'فحم الشيشة', unit: 'kg', currentQuantity: 20, minLimit: 5, costPerUnit: 15, category: 'shisha', supplier: 'مورد الفحم' },
    { name: 'أكياس الشيشة', unit: 'piece', currentQuantity: 50, minLimit: 10, costPerUnit: 3, category: 'shisha', supplier: 'مورد الشيشة' }
  ];

  const materialsWithIds = materials.map(mat => ({
    ...mat,
    nameEn: mat.name,
    description: `مادة ${mat.name}`,
    alertLimit: mat.minLimit + 2,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await Material.insertMany(materialsWithIds);
  console.log(`✅ Generated ${materialsWithIds.length} materials`);
  return materialsWithIds;
};

const generatePrinters = async () => {
  console.log('🖨️ Generating Printers...');
  
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

  const printers = [
    {
      name: 'طابعة المطبخ',
      department: 'kitchen',
      connectionType: 'LAN',
      connectionDetails: { ipAddress: '192.168.1.100', port: 9100 },
      paperWidth: 58,
      isActive: true,
      isOnline: true,
      settings: {
        copies: 1,
        printCustomerCopy: true,
        printInternalCopy: true,
        includeLogo: false,
        includeQRCode: true,
        fontSize: 'medium',
        paperCut: true,
        buzzer: true
      },
      printCount: 150,
      errorCount: 2
    },
    {
      name: 'طابعة البارستا',
      department: 'barista',
      connectionType: 'WiFi',
      connectionDetails: { ipAddress: '192.168.1.101', port: 9100 },
      paperWidth: 58,
      isActive: true,
      isOnline: true,
      settings: {
        copies: 1,
        printCustomerCopy: true,
        printInternalCopy: true,
        includeLogo: false,
        includeQRCode: true,
        fontSize: 'medium',
        paperCut: true,
        buzzer: true
      },
      printCount: 120,
      errorCount: 1
    },
    {
      name: 'طابعة الشيشة',
      department: 'shisha',
      connectionType: 'LAN',
      connectionDetails: { ipAddress: '192.168.1.102', port: 9100 },
      paperWidth: 80,
      isActive: true,
      isOnline: true,
      settings: {
        copies: 1,
        printCustomerCopy: true,
        printInternalCopy: true,
        includeLogo: false,
        includeQRCode: true,
        fontSize: 'medium',
        paperCut: true,
        buzzer: true
      },
      printCount: 80,
      errorCount: 0
    }
  ];

  const printersWithIds = printers.map(printer => ({
    ...printer,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await Printer.insertMany(printersWithIds);
  console.log(`✅ Generated ${printersWithIds.length} printers`);
  return printersWithIds;
};

const generateTaxSettings = async () => {
  console.log('💰 Generating Tax Settings...');
  
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

  const taxSettings = {
    enableTaxHandling: true,
    taxType: 'VAT',
    vatRate: 15,
    includeTaxInPrice: true,
    displayTaxBreakdown: true,
    generateTaxReports: true,
    taxNumber: '312345678901234',
    complianceMode: 'Saudi ZATCA',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await TaxSettings.create(taxSettings);
  console.log('✅ Generated tax settings');
  return taxSettings;
};

const generateOrders = async (menuItems, users) => {
  console.log('📋 Generating Orders...');
  
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

  const customerNames = [
    'أحمد محمد', 'فاطمة علي', 'محمد عبدالله', 'عائشة حسن', 'عبدالرحمن سالم',
    'نورا أحمد', 'خالد المطيري', 'سارة العتيبي', 'يوسف القحطاني', 'مريم الشهري'
  ];

  const phoneNumbers = [
    '0501234567', '0502345678', '0503456789', '0504567890', '0505678901',
    '0506789012', '0507890123', '0508901234', '0509012345', '0500123456'
  ];

  const orders = [];
  const now = new Date();
  const startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago

  for (let i = 0; i < 50; i++) {
    const orderDate = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const phone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
    const tableNumber = Math.floor(Math.random() * 20) + 1;
    
    // Generate 1-4 random items per order
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const selectedItems = [];
    for (let j = 0; j < itemCount; j++) {
      const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      if (!selectedItems.find(item => item._id === randomItem._id)) {
        selectedItems.push(randomItem);
      }
    }
    
    const orderItems = selectedItems.map(item => {
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = item.price;
      const totalPrice = unitPrice * quantity;
      
      // Determine department based on category
      let department = 'kitchen';
      if (item.name.includes('قهوة') || item.name.includes('شاي') || item.name.includes('عصير') || item.name.includes('كوكتيل')) {
        department = 'barista';
      } else if (item.name.includes('شيشة')) {
        department = 'shisha';
      }
      
      return {
        menuItemId: item._id,
        menuItemName: item.name,
        menuItemNameEn: item.nameEn,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        department: department,
        departmentStatus: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)],
        estimatedPrepTime: item.preparationTime || Math.floor(Math.random() * 15) + 5
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = Math.random() > 0.8 ? Math.floor(Math.random() * 20) + 5 : 0;
    
    // Calculate tax (15% VAT included)
    const subtotal = totalAmount - discountAmount;
    const taxAmount = (subtotal * 15) / 115;
    const finalAmount = subtotal;

    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Assign staff
    const departments = [...new Set(orderItems.map(item => item.department))];
    const assignedTo = {};
    departments.forEach(dept => {
      const staffForDept = users.filter(user => user.role === dept);
      if (staffForDept.length > 0) {
        assignedTo[dept] = staffForDept[Math.floor(Math.random() * staffForDept.length)]._id;
      }
    });

    const order = {
      orderNumber: `#${Date.now().toString().slice(-6)}${i.toString().padStart(2, '0')}`,
      items: orderItems,
      totalAmount: finalAmount,
      discountAmount: discountAmount,
      taxInfo: {
        subtotal: subtotal - taxAmount,
        taxRate: 15,
        taxAmount: taxAmount,
        includeTaxInPrice: true
      },
      customerInfo: {
        name: customerName,
        phone: phone,
        address: 'الرياض، المملكة العربية السعودية'
      },
      status: status,
      departmentStatuses: {
        kitchen: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)],
        barista: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)],
        shisha: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)]
      },
      orderDate: orderDate,
      source: ['website_whatsapp', 'manual', 'website'][Math.floor(Math.random() * 3)],
      notes: `طاولة رقم ${tableNumber}`,
      assignedTo: assignedTo,
      createdAt: orderDate,
      updatedAt: orderDate
    };

    orders.push(order);
  }

  await Order.insertMany(orders);
  console.log(`✅ Generated ${orders.length} orders`);
  return orders;
};

const generateWasteLogs = async (materials, users) => {
  console.log('🗑️ Generating Waste Logs...');
  
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

  const wasteLogs = [];
  const now = new Date();
  const startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago

  for (let i = 0; i < 30; i++) {
    const material = materials[Math.floor(Math.random() * materials.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const wasteDate = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
    const quantity = Math.floor(Math.random() * 5) + 1;
    const cost = quantity * material.costPerUnit * (0.1 + Math.random() * 0.9);
    
    const wasteLog = {
      itemName: material.name,
      itemId: material._id,
      category: material.category,
      quantity: quantity,
      unit: material.unit,
      cost: Math.round(cost * 100) / 100,
      reason: ['spoiled', 'broken', 'expired', 'damaged', 'overcooked', 'spilled', 'other'][Math.floor(Math.random() * 7)],
      description: `هدر ${material.name}`,
      department: ['kitchen', 'barista', 'shisha', 'general'][Math.floor(Math.random() * 4)],
      loggedBy: user.name,
      wasteDate: wasteDate,
      isRecoverable: Math.random() > 0.7,
      recoveryAction: Math.random() > 0.7 ? 'إعادة تدوير' : undefined,
      createdAt: wasteDate,
      updatedAt: wasteDate
    };

    wasteLogs.push(wasteLog);
  }

  await WasteLog.insertMany(wasteLogs);
  console.log(`✅ Generated ${wasteLogs.length} waste logs`);
  return wasteLogs;
};

async function generateAllFakeData() {
  console.log('🚀 Starting Simple Fake Data Generation...\n');
  
  try {
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    const collections = ['categories', 'menuitems', 'materials', 'users', 'orders', 'wastelogs', 'printers', 'taxsettings'];
    
    for (const collection of collections) {
      try {
        await mongoose.connection.db.collection(collection).deleteMany({});
        console.log(`   Cleared ${collection}`);
      } catch (error) {
        // Collection might not exist, that's okay
      }
    }
    
    console.log('');

    // Generate data
    const categories = await generateCategories();
    const menuItems = await generateMenuItems(categories);
    const materials = await generateMaterials();
    const users = await generateUsers();
    const printers = await generatePrinters();
    const orders = await generateOrders(menuItems, users);
    const wasteLogs = await generateWasteLogs(materials, users);
    const taxSettings = await generateTaxSettings();

    console.log('\n🎉 Fake Data Generation Complete!');
    console.log('\n📊 Generated Data Summary:');
    console.log(`• Categories: ${categories.length}`);
    console.log(`• Menu Items: ${menuItems.length}`);
    console.log(`• Materials: ${materials.length}`);
    console.log(`• Users: ${users.length}`);
    console.log(`• Printers: ${printers.length}`);
    console.log(`• Orders: ${orders.length}`);
    console.log(`• Waste Logs: ${wasteLogs.length}`);
    console.log(`• Tax Settings: 1`);

    console.log('\n🔧 Test Data Features:');
    console.log('• Realistic Arabic restaurant data');
    console.log('• Multi-department orders (kitchen, barista, shisha)');
    console.log('• Complete order lifecycle');
    console.log('• Tax calculations with 15% VAT');
    console.log('• Staff assignments');
    console.log('• Material and inventory data');
    console.log('• Waste logging');
    console.log('• Printer configurations');

    console.log('\n📋 Ready for Testing!');
    console.log('You can now test all features with realistic data.');

  } catch (error) {
    console.error('❌ Error generating fake data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the generation
generateAllFakeData();
