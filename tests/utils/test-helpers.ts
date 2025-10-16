import { NextRequest } from 'next/server';
import { faker } from '@faker-js/faker';

/**
 * Test helper utilities for API testing
 * Provides authentication, request creation, and assertion helpers
 */

export class TestHelpers {
  /**
   * Create authenticated request headers
   */
  static createAuthHeaders(token?: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token || 'test-token'}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create admin request headers
   */
  static createAdminHeaders(token?: string): Record<string, string> {
    return {
      ...this.createAuthHeaders(token),
      'X-Admin-Request': 'true',
    };
  }

  /**
   * Create mock NextRequest for testing
   */
  static createMockRequest(
    method: string = 'GET',
    url: string = 'http://localhost:3000/api/test',
    body?: any,
    headers?: Record<string, string>
  ): NextRequest {
    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      requestInit.body = JSON.stringify(body);
    }

    return new NextRequest(url, requestInit);
  }

  /**
   * Create mock NextRequest with search parameters
   */
  static createMockRequestWithParams(
    method: string = 'GET',
    url: string = 'http://localhost:3000/api/test',
    searchParams?: Record<string, string>,
    body?: any,
    headers?: Record<string, string>
  ): NextRequest {
    const urlObj = new URL(url);
    
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        urlObj.searchParams.set(key, value);
      });
    }

    return this.createMockRequest(method, urlObj.toString(), body, headers);
  }

  /**
   * Generate test user credentials
   */
  static generateTestCredentials() {
    return {
      username: faker.internet.userName(),
      password: faker.internet.password({ length: 12 }),
      role: faker.helpers.arrayElement(['admin', 'kitchen', 'barista', 'shisha']),
      name: faker.person.fullName(),
    };
  }

  /**
   * Create test order data
   */
  static createTestOrder(overrides: Partial<any> = {}) {
    const items = [
      {
        menuItemId: faker.database.mongodbObjectId(),
        menuItemName: faker.commerce.productName(),
        menuItemNameEn: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 3 }),
        unitPrice: parseFloat(faker.commerce.price({ min: 10, max: 50 })),
        totalPrice: 0, // Will be calculated
        customizations: [],
        department: faker.helpers.arrayElement(['kitchen', 'barista', 'shisha']),
        departmentStatus: 'pending',
        estimatedPrepTime: faker.number.int({ min: 5, max: 20 }),
      },
    ];

    // Calculate total price
    items.forEach(item => {
      item.totalPrice = item.unitPrice * item.quantity;
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 15;
    const taxAmount = subtotal * (taxRate / 100);

    return {
      orderNumber: `TEST-${faker.string.alphanumeric(6).toUpperCase()}`,
      items,
      totalAmount: subtotal + taxAmount,
      discountAmount: 0,
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
      status: 'pending',
      orderDate: new Date(),
      source: 'manual',
      notes: 'Test order',
      departmentStatuses: {
        kitchen: 'pending',
        barista: 'pending',
        shisha: 'pending',
      },
      ...overrides,
    };
  }

  /**
   * Create test menu item data
   */
  static createTestMenuItem(overrides: Partial<any> = {}) {
    return {
      name: faker.commerce.productName(),
      nameEn: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      categoryId: faker.database.mongodbObjectId(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      cost: parseFloat(faker.commerce.price({ min: 5, max: 50 })),
      image: faker.image.url(),
      preparationTime: faker.number.int({ min: 5, max: 30 }),
      calories: faker.number.int({ min: 50, max: 500 }),
      status: 'active',
      featured: false,
      order: 0,
      ...overrides,
    };
  }

  /**
   * Create test material data
   */
  static createTestMaterial(overrides: Partial<any> = {}) {
    return {
      name: faker.commerce.productMaterial(),
      nameEn: faker.commerce.productMaterial(),
      description: faker.commerce.productDescription(),
      unit: faker.helpers.arrayElement(['kg', 'g', 'L', 'ml', 'pieces']),
      currentQuantity: faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
      minLimit: faker.number.float({ min: 1, max: 10, fractionDigits: 2 }),
      alertLimit: faker.number.float({ min: 5, max: 20, fractionDigits: 2 }),
      costPerUnit: parseFloat(faker.commerce.price({ min: 1, max: 20 })),
      supplier: faker.company.name(),
      category: faker.helpers.arrayElement(['food', 'beverage', 'shisha', 'cleaning', 'other']),
      status: 'active',
      ...overrides,
    };
  }

  /**
   * Create test category data
   */
  static createTestCategory(overrides: Partial<any> = {}) {
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
      status: 'active',
      ...overrides,
    };
  }
}

/**
 * API Response assertion helpers
 */
export class ApiAssertions {
  /**
   * Assert successful API response
   */
  static assertSuccessResponse(response: any, expectedStatus: number = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('data');
  }

  /**
   * Assert error API response
   */
  static assertErrorResponse(response: any, expectedStatus: number = 400) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('error');
    expect(typeof response.body.error).toBe('string');
    expect(response.body.error.length).toBeGreaterThan(0);
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
    expect(pagination).toHaveProperty('nextPage');
    expect(pagination).toHaveProperty('prevPage');
    
    expect(typeof pagination.currentPage).toBe('number');
    expect(typeof pagination.totalPages).toBe('number');
    expect(typeof pagination.totalCount).toBe('number');
    expect(typeof pagination.limit).toBe('number');
    expect(typeof pagination.hasNextPage).toBe('boolean');
    expect(typeof pagination.hasPrevPage).toBe('boolean');
    
    expect(pagination.currentPage).toBeGreaterThan(0);
    expect(pagination.totalPages).toBeGreaterThan(0);
    expect(pagination.totalCount).toBeGreaterThanOrEqual(0);
    expect(pagination.limit).toBeGreaterThan(0);
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
    
    expect(typeof item.name).toBe('string');
    expect(typeof item.price).toBe('number');
    expect(typeof item.categoryId).toBe('string');
    expect(['active', 'inactive', 'out_of_stock']).toContain(item.status);
    expect(item.price).toBeGreaterThanOrEqual(0);
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
    expect(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']).toContain(order.status);
    
    // Assert order items
    order.items.forEach((item: any) => {
      expect(item).toHaveProperty('menuItemId');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('unitPrice');
      expect(item).toHaveProperty('totalPrice');
      expect(item).toHaveProperty('department');
      expect(typeof item.quantity).toBe('number');
      expect(item.quantity).toBeGreaterThan(0);
      expect(typeof item.unitPrice).toBe('number');
      expect(item.unitPrice).toBeGreaterThanOrEqual(0);
    });
  }

  /**
   * Assert material structure
   */
  static assertMaterial(material: any) {
    expect(material).toHaveProperty('_id');
    expect(material).toHaveProperty('name');
    expect(material).toHaveProperty('unit');
    expect(material).toHaveProperty('currentQuantity');
    expect(material).toHaveProperty('minLimit');
    expect(material).toHaveProperty('alertLimit');
    expect(material).toHaveProperty('status');
    
    expect(typeof material.name).toBe('string');
    expect(typeof material.currentQuantity).toBe('number');
    expect(typeof material.minLimit).toBe('number');
    expect(typeof material.alertLimit).toBe('number');
    expect(['active', 'inactive', 'out_of_stock']).toContain(material.status);
    expect(material.currentQuantity).toBeGreaterThanOrEqual(0);
  }

  /**
   * Assert category structure
   */
  static assertCategory(category: any) {
    expect(category).toHaveProperty('_id');
    expect(category).toHaveProperty('name');
    expect(category).toHaveProperty('status');
    
    expect(typeof category.name).toBe('string');
    expect(['active', 'inactive']).toContain(category.status);
  }

  /**
   * Assert user structure
   */
  static assertUser(user: any) {
    expect(user).toHaveProperty('_id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('isActive');
    
    expect(typeof user.username).toBe('string');
    expect(['admin', 'kitchen', 'barista', 'shisha']).toContain(user.role);
    expect(typeof user.isActive).toBe('boolean');
    expect(user).not.toHaveProperty('password'); // Password should not be returned
  }

  /**
   * Assert review structure
   */
  static assertReview(review: any) {
    expect(review).toHaveProperty('_id');
    expect(review).toHaveProperty('menuItemId');
    expect(review).toHaveProperty('customerName');
    expect(review).toHaveProperty('rating');
    expect(review).toHaveProperty('comment');
    
    expect(typeof review.rating).toBe('number');
    expect(review.rating).toBeGreaterThanOrEqual(1);
    expect(review.rating).toBeLessThanOrEqual(5);
    expect(typeof review.comment).toBe('string');
  }
}

/**
 * Database state helpers
 */
export class DatabaseHelpers {
  /**
   * Wait for database state to match condition
   */
  static async waitForCondition(
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
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Wait for document count to match expected value
   */
  static async waitForDocumentCount(
    model: any,
    query: any,
    expectedCount: number,
    timeout: number = 5000
  ): Promise<void> {
    await this.waitForCondition(
      async () => {
        const count = await model.countDocuments(query);
        return count === expectedCount;
      },
      timeout
    );
  }

  /**
   * Wait for document to exist
   */
  static async waitForDocument(
    model: any,
    query: any,
    timeout: number = 5000
  ): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const doc = await model.findOne(query);
      if (doc) {
        return doc;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Document not found within ${timeout}ms`);
  }
}

/**
 * Retry utilities for flaky operations
 */
export class RetryHelpers {
  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Retry with custom delay function
   */
  static async retryWithDelay<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayFn: (attempt: number) => number = (attempt) => 1000 * attempt
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          const delay = delayFn(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
}

/**
 * Performance testing helpers
 */
export class PerformanceHelpers {
  /**
   * Measure execution time
   */
  static async measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await operation();
    const duration = Date.now() - startTime;
    return { result, duration };
  }

  /**
   * Run concurrent operations
   */
  static async runConcurrent<T>(
    operations: (() => Promise<T>)[],
    concurrency: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];
    
    for (const operation of operations) {
      const promise = operation().then(result => {
        results.push(result);
      });
      
      executing.push(promise);
      
      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }
    
    await Promise.all(executing);
    return results;
  }

  /**
   * Generate load test data
   */
  static generateLoadTestData(count: number, generator: () => any): any[] {
    return Array.from({ length: count }, generator);
  }
}








