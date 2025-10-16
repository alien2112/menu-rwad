import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

/**
 * Test setup and teardown utilities
 * Provides database connection management and cleanup for individual tests
 */

// Test database connection
export async function connectTestDB(): Promise<void> {
  const mongoUri = (global as any).__MONGO_URI__;
  if (!mongoUri) {
    throw new Error('Test database URI not found. Make sure global setup ran correctly.');
  }
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
}

// Clean up test database
export async function cleanupTestDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}

// Close test database connection
export async function closeTestDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

/**
 * Test data generators using Faker.js
 */
export class TestDataGenerator {
  /**
   * Generate realistic menu item data
   */
  static generateMenuItem(overrides: Partial<any> = {}) {
    return {
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
      ingredients: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        ingredientId: faker.database.mongodbObjectId(),
        portion: faker.number.float({ min: 0.1, max: 2.0, fractionDigits: 2 }),
        required: faker.datatype.boolean(),
      })),
      preparationTime: faker.number.int({ min: 5, max: 60 }),
      calories: faker.number.int({ min: 50, max: 800 }),
      servingSize: faker.helpers.arrayElement(['Small', 'Medium', 'Large']),
      tags: faker.helpers.arrayElements(['spicy', 'vegetarian', 'gluten-free', 'halal', 'popular'], { min: 0, max: 3 }),
      allergens: faker.helpers.arrayElements(['nuts', 'dairy', 'eggs', 'soy'], { min: 0, max: 2 }),
      status: faker.helpers.arrayElement(['active', 'inactive', 'out_of_stock']),
      featured: faker.datatype.boolean(),
      order: faker.number.int({ min: 0, max: 100 }),
      ...overrides,
    };
  }

  /**
   * Generate realistic category data
   */
  static generateCategory(overrides: Partial<any> = {}) {
    return {
      name: faker.commerce.department(),
      nameEn: faker.commerce.department(),
      description: faker.lorem.sentence(),
      image: faker.image.url(),
      color: faker.color.rgb(),
      icon: faker.helpers.arrayElement(['🍕', '☕', '🥤', '🍰', '🍔', '🥗']),
      order: faker.number.int({ min: 0, max: 50 }),
      featured: faker.datatype.boolean(),
      featuredOrder: faker.number.int({ min: 0, max: 10 }),
      status: faker.helpers.arrayElement(['active', 'inactive']),
      ...overrides,
    };
  }

  /**
   * Generate realistic material/inventory data
   */
  static generateMaterial(overrides: Partial<any> = {}) {
    return {
      name: faker.commerce.productMaterial(),
      nameEn: faker.commerce.productMaterial(),
      description: faker.commerce.productDescription(),
      unit: faker.helpers.arrayElement(['kg', 'g', 'L', 'ml', 'pieces', 'boxes']),
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
      ...overrides,
    };
  }

  /**
   * Generate realistic order data
   */
  static generateOrder(overrides: Partial<any> = {}) {
    const items = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
      menuItemId: faker.database.mongodbObjectId(),
      menuItemName: faker.commerce.productName(),
      menuItemNameEn: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      unitPrice: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      totalPrice: 0, // Will be calculated
      customizations: faker.helpers.arrayElements(['extra cheese', 'no onions', 'spicy'], { min: 0, max: 2 }),
      department: faker.helpers.arrayElement(['kitchen', 'barista', 'shisha']),
      departmentStatus: 'pending',
      estimatedPrepTime: faker.number.int({ min: 5, max: 30 }),
    }));

    // Calculate total prices
    items.forEach(item => {
      item.totalPrice = item.unitPrice * item.quantity;
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 15; // 15% tax
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return {
      orderNumber: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
      items,
      totalAmount,
      discountAmount: Math.random() > 0.8 ? parseFloat(faker.commerce.price({ min: 5, max: 20 })) : 0,
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
      status: faker.helpers.arrayElement(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
      orderDate: faker.date.recent({ days: 7 }),
      deliveryDate: faker.date.future({ days: 1 }),
      source: faker.helpers.arrayElement(['website_whatsapp', 'manual', 'website']),
      notes: faker.lorem.sentence(),
      whatsappMessageId: faker.string.alphanumeric(20),
      departmentStatuses: {
        kitchen: 'pending',
        barista: 'pending',
        shisha: 'pending',
      },
      assignedTo: {
        kitchen: faker.person.fullName(),
        barista: faker.person.fullName(),
        shisha: faker.person.fullName(),
      },
      ...overrides,
    };
  }

  /**
   * Generate realistic user data
   */
  static generateUser(overrides: Partial<any> = {}) {
    return {
      username: faker.internet.userName(),
      password: faker.internet.password({ length: 12 }),
      role: faker.helpers.arrayElement(['admin', 'kitchen', 'barista', 'shisha']),
      name: faker.person.fullName(),
      isActive: faker.datatype.boolean(),
      lastLogin: faker.date.recent({ days: 7 }),
      ...overrides,
    };
  }

  /**
   * Generate realistic review data
   */
  static generateReview(overrides: Partial<any> = {}) {
    return {
      menuItemId: faker.database.mongodbObjectId(),
      customerName: faker.person.fullName(),
      customerEmail: faker.internet.email(),
      rating: faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.paragraph(),
      isVerified: faker.datatype.boolean(),
      helpfulCount: faker.number.int({ min: 0, max: 20 }),
      ...overrides,
    };
  }
}

/**
 * Test assertion helpers
 */
export class TestAssertions {
  /**
   * Assert API response structure
   */
  static assertApiResponse(response: any, expectedStatus: number = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('data');
  }

  /**
   * Assert error response structure
   */
  static assertErrorResponse(response: any, expectedStatus: number = 400) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('error');
  }

  /**
   * Assert pagination structure
   */
  static assertPagination(pagination: any) {
    expect(pagination).toHaveProperty('currentPage');
    expect(pagination).toHaveProperty('totalPages');
    expect(pagination).toHaveProperty('totalCount');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('hasNextPage');
    expect(pagination).toHaveProperty('hasPrevPage');
    expect(typeof pagination.currentPage).toBe('number');
    expect(typeof pagination.totalPages).toBe('number');
    expect(typeof pagination.totalCount).toBe('number');
    expect(typeof pagination.limit).toBe('number');
    expect(typeof pagination.hasNextPage).toBe('boolean');
    expect(typeof pagination.hasPrevPage).toBe('boolean');
  }

  /**
   * Assert menu item structure
   */
  static assertMenuItem(item: any) {
    expect(item).toHaveProperty('_id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('price');
    expect(item).toHaveProperty('categoryId');
    expect(item).toHaveProperty('status');
    expect(typeof item.price).toBe('number');
    expect(item.price).toBeGreaterThanOrEqual(0);
    expect(['active', 'inactive', 'out_of_stock']).toContain(item.status);
  }

  /**
   * Assert order structure
   */
  static assertOrder(order: any) {
    expect(order).toHaveProperty('_id');
    expect(order).toHaveProperty('orderNumber');
    expect(order).toHaveProperty('items');
    expect(order).toHaveProperty('totalAmount');
    expect(order).toHaveProperty('customerInfo');
    expect(order).toHaveProperty('status');
    expect(Array.isArray(order.items)).toBe(true);
    expect(order.items.length).toBeGreaterThan(0);
    expect(typeof order.totalAmount).toBe('number');
    expect(order.totalAmount).toBeGreaterThan(0);
  }
}

/**
 * Wait for database state to match condition
 */
export async function waitForDatabaseState(
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Database state condition not met within ${timeout}ms`);
}

/**
 * Retry function for flaky operations
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}











