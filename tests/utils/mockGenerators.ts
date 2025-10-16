import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

/**
 * Mock data generators for comprehensive testing
 * Provides realistic test data for all restaurant management system entities
 */

export class MockDataGenerators {
  /**
   * Generate comprehensive menu item with all optional fields
   */
  static generateCompleteMenuItem(overrides: Partial<any> = {}) {
    const baseItem = {
      name: faker.commerce.productName(),
      nameEn: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      descriptionEn: faker.commerce.productDescription(),
      categoryId: faker.database.mongodbObjectId(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      cost: parseFloat(faker.commerce.price({ min: 5, max: 50 })),
      discountPrice: Math.random() > 0.7 ? parseFloat(faker.commerce.price({ min: 5, max: 80 })) : undefined,
      image: faker.image.url(),
      images: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.image.url()),
      color: faker.color.rgb(),
      preparationTime: faker.number.int({ min: 5, max: 60 }),
      calories: faker.number.int({ min: 50, max: 800 }),
      servingSize: faker.helpers.arrayElement(['Small', 'Medium', 'Large']),
      tags: faker.helpers.arrayElements(['spicy', 'vegetarian', 'gluten-free', 'halal', 'popular'], { min: 0, max: 3 }),
      allergens: faker.helpers.arrayElements(['nuts', 'dairy', 'eggs', 'soy'], { min: 0, max: 2 }),
      status: faker.helpers.arrayElement(['active', 'inactive', 'out_of_stock']),
      featured: faker.datatype.boolean(),
      order: faker.number.int({ min: 0, max: 100 }),
    };

    // Add complex customization options
    const sizeOptions = [
      { name: 'Small', priceModifier: 0, available: true },
      { name: 'Medium', priceModifier: 5, available: true },
      { name: 'Large', priceModifier: 10, available: true },
    ];

    const addonOptions = [
      { name: 'Extra Cheese', price: 3, category: 'toppings', available: true },
      { name: 'Extra Sauce', price: 2, category: 'sauces', available: true },
      { name: 'No Onions', price: 0, category: 'modifications', available: true },
    ];

    const dietaryModifications = [
      { name: 'Vegetarian', priceModifier: 0 },
      { name: 'Vegan', priceModifier: 2 },
      { name: 'Gluten-Free', priceModifier: 3 },
    ];

    return {
      ...baseItem,
      sizeOptions,
      addonOptions,
      dietaryModifications,
      ...overrides,
    };
  }

  /**
   * Generate realistic category with all fields
   */
  static generateCompleteCategory(overrides: Partial<any> = {}) {
    return {
      name: faker.commerce.department(),
      nameEn: faker.commerce.department(),
      description: faker.lorem.sentence(),
      descriptionEn: faker.lorem.sentence(),
      image: faker.image.url(),
      color: faker.color.rgb(),
      icon: faker.helpers.arrayElement(['🍕', '☕', '🥤', '🍰', '🍔', '🥗', '🍜', '🥙']),
      order: faker.number.int({ min: 0, max: 50 }),
      featured: faker.datatype.boolean(),
      featuredOrder: faker.number.int({ min: 0, max: 10 }),
      status: faker.helpers.arrayElement(['active', 'inactive']),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
      ...overrides,
    };
  }

  /**
   * Generate comprehensive material/inventory item
   */
  static generateCompleteMaterial(overrides: Partial<any> = {}) {
    return {
      name: faker.commerce.productMaterial(),
      nameEn: faker.commerce.productMaterial(),
      description: faker.commerce.productDescription(),
      unit: faker.helpers.arrayElement(['kg', 'g', 'L', 'ml', 'pieces', 'boxes', 'bags', 'bottles']),
      currentQuantity: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
      minLimit: faker.number.float({ min: 1, max: 10, fractionDigits: 2 }),
      alertLimit: faker.number.float({ min: 5, max: 20, fractionDigits: 2 }),
      costPerUnit: parseFloat(faker.commerce.price({ min: 1, max: 50 })),
      supplier: faker.company.name(),
      category: faker.helpers.arrayElement(['food', 'beverage', 'shisha', 'cleaning', 'other']),
      status: faker.helpers.arrayElement(['active', 'inactive', 'out_of_stock']),
      lastRestocked: faker.date.recent({ days: 30 }),
      expiryDate: faker.date.future({ years: 1 }),
      image: faker.image.url(),
      notes: faker.lorem.sentence(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
      ...overrides,
    };
  }

  /**
   * Generate complex order with multiple items and departments
   */
  static generateComplexOrder(overrides: Partial<any> = {}) {
    const departments = ['kitchen', 'barista', 'shisha'];
    const items = [];

    // Generate items for each department
    departments.forEach(dept => {
      const itemCount = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < itemCount; i++) {
        const unitPrice = parseFloat(faker.commerce.price({ min: 10, max: 100 }));
        const quantity = faker.number.int({ min: 1, max: 4 });
        
        items.push({
          menuItemId: faker.database.mongodbObjectId(),
          menuItemName: faker.commerce.productName(),
          menuItemNameEn: faker.commerce.productName(),
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
          customizations: faker.helpers.arrayElements([
            'extra cheese', 'no onions', 'spicy', 'extra sauce', 'no salt'
          ], { min: 0, max: 2 }),
          department: dept,
          departmentStatus: 'pending',
          estimatedPrepTime: faker.number.int({ min: 5, max: 30 }),
        });
      }
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 15;
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = Math.random() > 0.8 ? parseFloat(faker.commerce.price({ min: 5, max: 20 })) : 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      orderNumber: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
      items,
      totalAmount,
      discountAmount,
      taxInfo: {
        subtotal,
        taxRate,
        taxAmount,
        includeTaxInPrice: true,
      },
      customerInfo: {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
      },
      status: faker.helpers.arrayElement(['pending', 'confirmed', 'preparing', 'ready', 'delivered']),
      orderDate: faker.date.recent({ days: 7 }),
      deliveryDate: faker.date.future({ days: 1 }),
      source: faker.helpers.arrayElement(['website_whatsapp', 'manual', 'website']),
      notes: faker.lorem.sentence(),
      whatsappMessageId: faker.string.alphanumeric(20),
      departmentStatuses: {
        kitchen: faker.helpers.arrayElement(['pending', 'in_progress', 'ready', 'served']),
        barista: faker.helpers.arrayElement(['pending', 'in_progress', 'ready', 'served']),
        shisha: faker.helpers.arrayElement(['pending', 'in_progress', 'ready', 'served']),
      },
      assignedTo: {
        kitchen: faker.person.fullName(),
        barista: faker.person.fullName(),
        shisha: faker.person.fullName(),
      },
      createdAt: faker.date.recent({ days: 7 }),
      updatedAt: faker.date.recent({ days: 1 }),
      ...overrides,
    };
  }

  /**
   * Generate user with specific role
   */
  static generateUserWithRole(role: 'admin' | 'kitchen' | 'barista' | 'shisha', overrides: Partial<any> = {}) {
    const roleNames = {
      admin: 'مدير النظام',
      kitchen: 'طاهي المطبخ',
      barista: 'بارستا',
      shisha: 'مشغل الشيشة',
    };

    return {
      username: faker.internet.userName(),
      password: faker.internet.password({ length: 12 }),
      role,
      name: roleNames[role],
      isActive: true,
      lastLogin: faker.date.recent({ days: 7 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
      ...overrides,
    };
  }

  /**
   * Generate comprehensive review
   */
  static generateCompleteReview(overrides: Partial<any> = {}) {
    return {
      menuItemId: faker.database.mongodbObjectId(),
      customerName: faker.person.fullName(),
      customerEmail: faker.internet.email(),
      rating: faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.paragraph(),
      isVerified: faker.datatype.boolean(),
      helpfulCount: faker.number.int({ min: 0, max: 20 }),
      images: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.image.url()),
      createdAt: faker.date.recent({ days: 30 }),
      updatedAt: faker.date.recent({ days: 7 }),
      ...overrides,
    };
  }

  /**
   * Generate notification data
   */
  static generateNotification(overrides: Partial<any> = {}) {
    return {
      type: faker.helpers.arrayElement(['order', 'system', 'staff', 'inventory', 'alert']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      message: faker.lorem.paragraph(),
      data: {
        orderId: faker.database.mongodbObjectId(),
        menuItemId: faker.database.mongodbObjectId(),
        quantity: faker.number.int({ min: 1, max: 10 }),
      },
      department: faker.helpers.arrayElement(['kitchen', 'barista', 'shisha', 'admin']),
      actionRequired: faker.datatype.boolean(),
      targetRoles: faker.helpers.arrayElements(['admin', 'kitchen', 'barista', 'shisha'], { min: 1, max: 2 }),
      targetUsers: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.database.mongodbObjectId()),
      timestamp: faker.date.recent({ days: 1 }),
      read: faker.datatype.boolean(),
      dismissed: faker.datatype.boolean(),
      ...overrides,
    };
  }

  /**
   * Generate location data
   */
  static generateLocation(overrides: Partial<any> = {}) {
    return {
      name: faker.location.city(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      coordinates: {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
      },
      isActive: faker.datatype.boolean(),
      openingHours: {
        monday: { open: '09:00', close: '22:00', isOpen: true },
        tuesday: { open: '09:00', close: '22:00', isOpen: true },
        wednesday: { open: '09:00', close: '22:00', isOpen: true },
        thursday: { open: '09:00', close: '22:00', isOpen: true },
        friday: { open: '09:00', close: '23:00', isOpen: true },
        saturday: { open: '10:00', close: '23:00', isOpen: true },
        sunday: { open: '10:00', close: '22:00', isOpen: true },
      },
      ...overrides,
    };
  }

  /**
   * Generate offer/promotion data
   */
  static generateOffer(overrides: Partial<any> = {}) {
    return {
      title: faker.commerce.productName(),
      titleEn: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      descriptionEn: faker.commerce.productDescription(),
      discountType: faker.helpers.arrayElement(['percentage', 'fixed', 'buy_x_get_y']),
      discountValue: faker.number.int({ min: 5, max: 50 }),
      minOrderAmount: parseFloat(faker.commerce.price({ min: 50, max: 200 })),
      maxDiscountAmount: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      validFrom: faker.date.past({ days: 30 }),
      validTo: faker.date.future({ days: 30 }),
      isActive: faker.datatype.boolean(),
      applicableItems: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.database.mongodbObjectId()),
      applicableCategories: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.database.mongodbObjectId()),
      usageLimit: faker.number.int({ min: 1, max: 100 }),
      usedCount: faker.number.int({ min: 0, max: 50 }),
      image: faker.image.url(),
      ...overrides,
    };
  }
}

/**
 * Database seeding utilities
 */
export class DatabaseSeeder {
  /**
   * Seed test database with comprehensive data
   */
  static async seedTestDatabase() {
    const { connectTestDB, cleanupTestDB } = await import('./setup');
    await connectTestDB();
    await cleanupTestDB();

    // Import models
    const Category = mongoose.model('Category');
    const MenuItem = mongoose.model('MenuItem');
    const Material = mongoose.model('Material');
    const User = mongoose.model('User');
    const Order = mongoose.model('Order');
    const Review = mongoose.model('Review');
    const Location = mongoose.model('Location');
    const Offer = mongoose.model('Offer');

    try {
      // Seed categories
      const categories = [];
      for (let i = 0; i < 10; i++) {
        const category = new Category(MockDataGenerators.generateCompleteCategory());
        await category.save();
        categories.push(category);
      }

      // Seed materials
      const materials = [];
      for (let i = 0; i < 50; i++) {
        const material = new Material(MockDataGenerators.generateCompleteMaterial());
        await material.save();
        materials.push(material);
      }

      // Seed menu items
      const menuItems = [];
      for (let i = 0; i < 100; i++) {
        const categoryId = faker.helpers.arrayElement(categories)._id;
        const menuItem = new MenuItem({
          ...MockDataGenerators.generateCompleteMenuItem(),
          categoryId,
          ingredients: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
            ingredientId: faker.helpers.arrayElement(materials)._id,
            portion: faker.number.float({ min: 0.1, max: 2.0, fractionDigits: 2 }),
            required: faker.datatype.boolean(),
          })),
        });
        await menuItem.save();
        menuItems.push(menuItem);
      }

      // Seed users
      const users = [];
      const roles = ['admin', 'kitchen', 'barista', 'shisha'];
      for (const role of roles) {
        const user = new User(MockDataGenerators.generateUserWithRole(role as any));
        await user.save();
        users.push(user);
      }

      // Seed orders
      const orders = [];
      for (let i = 0; i < 50; i++) {
        const order = new Order(MockDataGenerators.generateComplexOrder());
        await order.save();
        orders.push(order);
      }

      // Seed reviews
      const reviews = [];
      for (let i = 0; i < 200; i++) {
        const review = new Review({
          ...MockDataGenerators.generateCompleteReview(),
          menuItemId: faker.helpers.arrayElement(menuItems)._id,
        });
        await review.save();
        reviews.push(review);
      }

      // Seed locations
      const locations = [];
      for (let i = 0; i < 3; i++) {
        const location = new Location(MockDataGenerators.generateLocation());
        await location.save();
        locations.push(location);
      }

      // Seed offers
      const offers = [];
      for (let i = 0; i < 10; i++) {
        const offer = new Offer(MockDataGenerators.generateOffer());
        await offer.save();
        offers.push(offer);
      }

      console.log('✅ Test database seeded successfully');
      console.log(`📊 Seeded: ${categories.length} categories, ${materials.length} materials, ${menuItems.length} menu items, ${users.length} users, ${orders.length} orders, ${reviews.length} reviews, ${locations.length} locations, ${offers.length} offers`);

      return {
        categories,
        materials,
        menuItems,
        users,
        orders,
        reviews,
        locations,
        offers,
      };

    } catch (error) {
      console.error('❌ Failed to seed test database:', error);
      throw error;
    }
  }

  /**
   * Create minimal test data for specific tests
   */
  static async createMinimalTestData() {
    const { connectTestDB, cleanupTestDB } = await import('./setup');
    await connectTestDB();
    await cleanupTestDB();

    const Category = mongoose.model('Category');
    const MenuItem = mongoose.model('MenuItem');
    const Material = mongoose.model('Material');
    const User = mongoose.model('User');

    // Create one category
    const category = new Category(MockDataGenerators.generateCompleteCategory());
    await category.save();

    // Create one material
    const material = new Material(MockDataGenerators.generateCompleteMaterial());
    await material.save();

    // Create one menu item
    const menuItem = new MenuItem({
      ...MockDataGenerators.generateCompleteMenuItem(),
      categoryId: category._id,
      ingredients: [{
        ingredientId: material._id,
        portion: 1,
        required: true,
      }],
    });
    await menuItem.save();

    // Create admin user
    const adminUser = new User(MockDataGenerators.generateUserWithRole('admin'));
    await adminUser.save();

    return {
      category,
      material,
      menuItem,
      adminUser,
    };
  }
}











