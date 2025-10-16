import mongoose from 'mongoose';
import { MockDataGenerators } from './mockGenerators';

/**
 * Database seeding script for comprehensive test data
 * Creates realistic test data for all restaurant management system entities
 */

async function seedTestDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maraksh_test';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to test database');

    // Clear existing data
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log('🧹 Cleared existing test data');

    // Import models (assuming they're registered)
    const Category = mongoose.model('Category');
    const MenuItem = mongoose.model('MenuItem');
    const Material = mongoose.model('Material');
    const User = mongoose.model('User');
    const Order = mongoose.model('Order');
    const Review = mongoose.model('Review');
    const Location = mongoose.model('Location');
    const Offer = mongoose.model('Offer');
    const Notification = mongoose.model('Notification');

    // Seed categories
    console.log('📂 Creating categories...');
    const categories = [];
    const categoryNames = [
      'المقبلات', 'السلطات', 'المشروبات الساخنة', 'المشروبات الباردة',
      'الحلويات', 'البيتزا', 'الساندويتش', 'الشيشة', 'الكوكتيلات', 'العصائر الطبيعية'
    ];
    
    for (let i = 0; i < categoryNames.length; i++) {
      const category = new Category({
        name: categoryNames[i],
        nameEn: `Category ${i + 1}`,
        description: `Description for ${categoryNames[i]}`,
        image: `https://picsum.photos/300/200?random=${i}`,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 5],
        icon: ['🍽️', '🥗', '☕', '🥤', '🍰', '🍕', '🥪', '💨', '🍹', '🥤'][i],
        order: i,
        featured: i < 3,
        featuredOrder: i < 3 ? i : undefined,
        status: 'active',
      });
      await category.save();
      categories.push(category);
    }
    console.log(`✅ Created ${categories.length} categories`);

    // Seed materials/inventory
    console.log('📦 Creating materials...');
    const materials = [];
    const materialNames = [
      'دقيق', 'سكر', 'ملح', 'زيت', 'حليب', 'جبن', 'لحم', 'دجاج', 'خضار', 'فواكه',
      'قهوة', 'شاي', 'عصير', 'ماء', 'غاز', 'ثلج', 'سكر نبات', 'عسل', 'قرفة', 'زعفران'
    ];
    
    for (let i = 0; i < materialNames.length; i++) {
      const material = new Material({
        name: materialNames[i],
        nameEn: `Material ${i + 1}`,
        description: `Description for ${materialNames[i]}`,
        unit: ['kg', 'g', 'L', 'ml', 'pieces'][i % 5],
        currentQuantity: Math.random() * 100,
        minLimit: Math.random() * 10 + 1,
        alertLimit: Math.random() * 20 + 5,
        costPerUnit: Math.random() * 50 + 1,
        supplier: `Supplier ${i + 1}`,
        category: ['food', 'beverage', 'shisha', 'cleaning', 'other'][i % 5],
        status: Math.random() > 0.1 ? 'active' : 'out_of_stock',
        lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
        image: `https://picsum.photos/200/200?random=${i + 100}`,
        notes: `Notes for ${materialNames[i]}`,
      });
      await material.save();
      materials.push(material);
    }
    console.log(`✅ Created ${materials.length} materials`);

    // Seed menu items
    console.log('🍽️ Creating menu items...');
    const menuItems = [];
    const menuItemNames = [
      'بيتزا مارغريتا', 'برجر كلاسيك', 'سلطة سيزر', 'قهوة أمريكية', 'شاي بالنعناع',
      'كيك الشوكولاتة', 'ساندويتش دجاج', 'شيشة تفاح', 'كوكتيل فراولة', 'عصير برتقال',
      'بيتزا بيبروني', 'برجر دجاج', 'سلطة يونانية', 'قهوة لاتيه', 'شاي أخضر',
      'تيراميسو', 'ساندويتش لحم', 'شيشة عنب', 'كوكتيل مانجو', 'عصير تفاح'
    ];
    
    for (let i = 0; i < menuItemNames.length; i++) {
      const categoryId = categories[i % categories.length]._id;
      const menuItem = new MenuItem({
        name: menuItemNames[i],
        nameEn: `Menu Item ${i + 1}`,
        description: `Delicious ${menuItemNames[i]} description`,
        descriptionEn: `Delicious menu item ${i + 1} description`,
        categoryId,
        price: Math.random() * 100 + 10,
        cost: Math.random() * 50 + 5,
        discountPrice: Math.random() > 0.7 ? Math.random() * 80 + 5 : undefined,
        image: `https://picsum.photos/400/300?random=${i + 200}`,
        images: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => 
          `https://picsum.photos/400/300?random=${i + 200 + j}`
        ),
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 5],
        preparationTime: Math.floor(Math.random() * 30) + 5,
        calories: Math.floor(Math.random() * 500) + 100,
        servingSize: ['Small', 'Medium', 'Large'][i % 3],
        tags: ['spicy', 'vegetarian', 'gluten-free', 'halal', 'popular'].slice(0, Math.floor(Math.random() * 3)),
        allergens: ['nuts', 'dairy', 'eggs', 'soy'].slice(0, Math.floor(Math.random() * 2)),
        status: Math.random() > 0.1 ? 'active' : 'out_of_stock',
        featured: i < 5,
        order: i,
        ingredients: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
          ingredientId: materials[Math.floor(Math.random() * materials.length)]._id,
          portion: Math.random() * 2 + 0.1,
          required: Math.random() > 0.3,
        })),
        sizeOptions: [
          { name: 'Small', priceModifier: 0, available: true },
          { name: 'Medium', priceModifier: 5, available: true },
          { name: 'Large', priceModifier: 10, available: true },
        ],
        addonOptions: [
          { name: 'Extra Cheese', price: 3, category: 'toppings', available: true },
          { name: 'Extra Sauce', price: 2, category: 'sauces', available: true },
          { name: 'No Onions', price: 0, category: 'modifications', available: true },
        ],
        dietaryModifications: [
          { name: 'Vegetarian', priceModifier: 0 },
          { name: 'Vegan', priceModifier: 2 },
          { name: 'Gluten-Free', priceModifier: 3 },
        ],
      });
      await menuItem.save();
      menuItems.push(menuItem);
    }
    console.log(`✅ Created ${menuItems.length} menu items`);

    // Seed users
    console.log('👥 Creating users...');
    const users = [];
    const userData = [
      { username: 'admin', password: 'admin2024', role: 'admin', name: 'مدير النظام' },
      { username: 'kitchen', password: 'kitchen2024', role: 'kitchen', name: 'طاهي المطبخ' },
      { username: 'barista', password: 'barista2024', role: 'barista', name: 'بارستا' },
      { username: 'shisha', password: 'shisha2024', role: 'shisha', name: 'مشغل الشيشة' },
    ];
    
    for (const userInfo of userData) {
      const user = new User({
        ...userInfo,
        isActive: true,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
      await user.save();
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // Seed orders
    console.log('📋 Creating orders...');
    const orders = [];
    for (let i = 0; i < 30; i++) {
      const orderItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = menuItem.price;
        
        return {
          menuItemId: menuItem._id,
          menuItemName: menuItem.name,
          menuItemNameEn: menuItem.nameEn,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
          customizations: [],
          department: ['kitchen', 'barista', 'shisha'][Math.floor(Math.random() * 3)],
          departmentStatus: 'pending',
          estimatedPrepTime: Math.floor(Math.random() * 20) + 5,
        };
      });

      const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxRate = 15;
      const taxAmount = subtotal * (taxRate / 100);
      const discountAmount = Math.random() > 0.8 ? Math.random() * 20 : 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const order = new Order({
        orderNumber: `ORD-${String(i + 1).padStart(6, '0')}`,
        items: orderItems,
        totalAmount,
        discountAmount,
        taxInfo: {
          subtotal,
          taxRate,
          taxAmount,
          includeTaxInPrice: true,
        },
        customerInfo: {
          name: `Customer ${i + 1}`,
          phone: `+966501234${String(i).padStart(3, '0')}`,
          address: `Address ${i + 1}`,
        },
        status: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'][Math.floor(Math.random() * 5)],
        orderDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
        source: ['website_whatsapp', 'manual', 'website'][Math.floor(Math.random() * 3)],
        notes: Math.random() > 0.5 ? `Order notes ${i + 1}` : undefined,
        whatsappMessageId: Math.random() > 0.5 ? `msg_${i + 1}` : undefined,
        departmentStatuses: {
          kitchen: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)],
          barista: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)],
          shisha: ['pending', 'in_progress', 'ready', 'served'][Math.floor(Math.random() * 4)],
        },
        assignedTo: {
          kitchen: Math.random() > 0.5 ? 'Kitchen Staff' : undefined,
          barista: Math.random() > 0.5 ? 'Barista Staff' : undefined,
          shisha: Math.random() > 0.5 ? 'Shisha Staff' : undefined,
        },
      });
      await order.save();
      orders.push(order);
    }
    console.log(`✅ Created ${orders.length} orders`);

    // Seed reviews
    console.log('⭐ Creating reviews...');
    const reviews = [];
    for (let i = 0; i < 50; i++) {
      const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const review = new Review({
        menuItemId: menuItem._id,
        customerName: `Customer ${i + 1}`,
        customerEmail: `customer${i + 1}@example.com`,
        rating: Math.floor(Math.random() * 5) + 1,
        comment: `Great ${menuItem.name}! Highly recommended.`,
        isVerified: Math.random() > 0.3,
        helpfulCount: Math.floor(Math.random() * 10),
        images: Math.random() > 0.7 ? [`https://picsum.photos/300/200?random=${i + 300}`] : [],
      });
      await review.save();
      reviews.push(review);
    }
    console.log(`✅ Created ${reviews.length} reviews`);

    // Seed locations
    console.log('📍 Creating locations...');
    const locations = [];
    const locationData = [
      { name: 'الفرع الرئيسي', city: 'الرياض', address: 'شارع الملك فهد' },
      { name: 'فرع الشمال', city: 'الرياض', address: 'شارع العليا' },
      { name: 'فرع الجنوب', city: 'الرياض', address: 'شارع الدائري الجنوبي' },
    ];
    
    for (let i = 0; i < locationData.length; i++) {
      const location = new Location({
        name: locationData[i].name,
        nameEn: `Branch ${i + 1}`,
        address: locationData[i].address,
        city: locationData[i].city,
        state: 'الرياض',
        country: 'السعودية',
        postalCode: `1234${i}`,
        phone: `+966501234${i}00`,
        email: `branch${i + 1}@maraksh.com`,
        coordinates: {
          latitude: 24.7136 + (Math.random() - 0.5) * 0.1,
          longitude: 46.6753 + (Math.random() - 0.5) * 0.1,
        },
        isActive: true,
        openingHours: {
          monday: { open: '09:00', close: '22:00', isOpen: true },
          tuesday: { open: '09:00', close: '22:00', isOpen: true },
          wednesday: { open: '09:00', close: '22:00', isOpen: true },
          thursday: { open: '09:00', close: '22:00', isOpen: true },
          friday: { open: '09:00', close: '23:00', isOpen: true },
          saturday: { open: '10:00', close: '23:00', isOpen: true },
          sunday: { open: '10:00', close: '22:00', isOpen: true },
        },
      });
      await location.save();
      locations.push(location);
    }
    console.log(`✅ Created ${locations.length} locations`);

    // Seed offers
    console.log('🎁 Creating offers...');
    const offers = [];
    const offerTitles = [
      'خصم 20% على البيتزا', 'عرض المشروبات', 'خصم العائلة', 'عرض نهاية الأسبوع',
      'خصم الطلاب', 'عرض الشيشة', 'خصم التوصيل', 'عرض الحلويات'
    ];
    
    for (let i = 0; i < offerTitles.length; i++) {
      const offer = new Offer({
        title: offerTitles[i],
        titleEn: `Offer ${i + 1}`,
        description: `Special offer: ${offerTitles[i]}`,
        descriptionEn: `Special offer description ${i + 1}`,
        discountType: ['percentage', 'fixed', 'buy_x_get_y'][i % 3],
        discountValue: Math.floor(Math.random() * 30) + 10,
        minOrderAmount: Math.floor(Math.random() * 100) + 50,
        maxDiscountAmount: Math.floor(Math.random() * 50) + 20,
        validFrom: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        validTo: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        isActive: Math.random() > 0.2,
        applicableItems: menuItems.slice(0, Math.floor(Math.random() * 5) + 1).map(item => item._id),
        applicableCategories: categories.slice(0, Math.floor(Math.random() * 3) + 1).map(cat => cat._id),
        usageLimit: Math.floor(Math.random() * 100) + 10,
        usedCount: Math.floor(Math.random() * 20),
        image: `https://picsum.photos/400/200?random=${i + 400}`,
      });
      await offer.save();
      offers.push(offer);
    }
    console.log(`✅ Created ${offers.length} offers`);

    // Seed notifications
    console.log('🔔 Creating notifications...');
    const notifications = [];
    for (let i = 0; i < 20; i++) {
      const notification = new Notification({
        type: ['order', 'system', 'staff', 'inventory', 'alert'][Math.floor(Math.random() * 5)],
        priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
        title: `Notification ${i + 1}`,
        message: `This is notification message ${i + 1}`,
        data: {
          orderId: orders[Math.floor(Math.random() * orders.length)]._id,
          menuItemId: menuItems[Math.floor(Math.random() * menuItems.length)]._id,
        },
        department: ['kitchen', 'barista', 'shisha', 'admin'][Math.floor(Math.random() * 4)],
        actionRequired: Math.random() > 0.5,
        targetRoles: ['admin', 'kitchen', 'barista', 'shisha'].slice(0, Math.floor(Math.random() * 2) + 1),
        targetUsers: users.slice(0, Math.floor(Math.random() * 2)).map(user => user._id),
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        read: Math.random() > 0.3,
        dismissed: Math.random() > 0.7,
      });
      await notification.save();
      notifications.push(notification);
    }
    console.log(`✅ Created ${notifications.length} notifications`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Materials: ${materials.length}`);
    console.log(`   - Menu Items: ${menuItems.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Reviews: ${reviews.length}`);
    console.log(`   - Locations: ${locations.length}`);
    console.log(`   - Offers: ${offers.length}`);
    console.log(`   - Notifications: ${notifications.length}`);

    return {
      categories,
      materials,
      menuItems,
      users,
      orders,
      reviews,
      locations,
      offers,
      notifications,
    };

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTestDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedTestDatabase };








