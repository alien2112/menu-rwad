import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * Security Testing Suite
 * Tests authentication, authorization, input validation, and security vulnerabilities
 */

describe('Security Tests', () => {
  let testData: any;
  let adminToken: string;
  let kitchenToken: string;

  beforeAll(async () => {
    await connectTestDB();
    await cleanupTestDB();
    
    // Create test data for security testing
    const Category = mongoose.model('Category');
    const MenuItem = mongoose.model('MenuItem');
    const Material = mongoose.model('Material');
    const User = mongoose.model('User');

    // Create test category
    const category = new Category(MockDataGenerators.generateCompleteCategory());
    await category.save();

    // Create test materials
    const materials = [];
    for (let i = 0; i < 5; i++) {
      const material = new Material(MockDataGenerators.generateCompleteMaterial({
        name: `Security Test Material ${i + 1}`,
        currentQuantity: 100,
        minLimit: 10,
        alertLimit: 20,
      }));
      await material.save();
      materials.push(material);
    }

    // Create test menu items
    const menuItems = [];
    for (let i = 0; i < 10; i++) {
      const menuItem = new MenuItem({
        ...MockDataGenerators.generateCompleteMenuItem(),
        categoryId: category._id,
        name: `Security Test Item ${i + 1}`,
        price: 20 + i * 2,
        status: 'active',
        ingredients: [
          {
            ingredientId: materials[i % materials.length]._id,
            portion: 1 + i * 0.1,
            required: true,
          },
        ],
      });
      await menuItem.save();
      menuItems.push(menuItem);
    }

    // Create test users with different roles
    const adminUser = new User(MockDataGenerators.generateUserWithRole('admin'));
    await adminUser.save();

    const kitchenUser = new User(MockDataGenerators.generateUserWithRole('kitchen'));
    await kitchenUser.save();

    testData = { category, materials, menuItems, adminUser, kitchenUser };
    adminToken = 'test-admin-token';
    kitchenToken = 'test-kitchen-token';
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('Authentication Security', () => {
    it('should prevent access without authentication', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard'
        // No auth headers
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('unauthorized');
    });

    it('should reject invalid authentication tokens', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        TestHelpers.createAuthHeaders('invalid-token')
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('invalid');
    });

    it('should reject expired authentication tokens', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        TestHelpers.createAuthHeaders('expired-token')
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('expired');
    });

    it('should handle malformed authentication headers', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        { 'Authorization': 'InvalidFormat token' }
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should prevent brute force attacks on login', async () => {
      const loginAttempts = Array.from({ length: 10 }, () => {
        const loginData = {
          username: 'admin',
          password: 'wrongpassword',
        };

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/auth/login',
          loginData
        );

        const { POST: login } = await import('../../app/api/auth/login/route');
        return login(request);
      });

      const responses = await Promise.all(loginAttempts);
      
      // After multiple failed attempts, should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Authorization Security', () => {
    it('should prevent kitchen staff from accessing admin endpoints', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        TestHelpers.createAuthHeaders(kitchenToken)
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('admin');
    });

    it('should prevent barista from accessing kitchen endpoints', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/kitchen/orders',
        undefined,
        TestHelpers.createAuthHeaders('barista-token')
      );

      const { GET } = await import('../../app/api/kitchen/orders/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('kitchen');
    });

    it('should prevent unauthorized menu item creation', async () => {
      const menuItemData = TestHelpers.createTestMenuItem({
        categoryId: testData.category._id.toString(),
        name: 'Unauthorized Item',
        price: 25.99,
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        menuItemData,
        TestHelpers.createAuthHeaders(kitchenToken) // Kitchen staff shouldn't create menu items
      );

      const { POST: createMenuItem } = await import('../../app/api/items/route');
      const response = await createMenuItem(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
    });

    it('should prevent unauthorized order modifications', async () => {
      const updateData = {
        status: 'cancelled',
        notes: 'Unauthorized cancellation',
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/orders/507f1f77bcf86cd799439011`,
        updateData,
        TestHelpers.createAuthHeaders('barista-token') // Barista shouldn't cancel orders
      );

      const { PUT: updateOrder } = await import('../../app/api/orders/[id]/route');
      const response = await updateOrder(request, { params: { id: '507f1f77bcf86cd799439011' } });
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent SQL injection in search parameters', async () => {
      const maliciousSearches = [
        "'; DROP TABLE menu_items; --",
        "' OR '1'='1",
        "'; INSERT INTO menu_items VALUES ('hacked', 0); --",
        "' UNION SELECT * FROM users --",
      ];

      for (const maliciousSearch of maliciousSearches) {
        const request = TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { search: maliciousSearch }
        );

        const { GET } = await import('../../app/api/items/route');
        const response = await GET(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        // Should return empty results or sanitized results, not execute malicious SQL
        expect(responseData.data).toBeInstanceOf(Array);
      }
    });

    it('should prevent NoSQL injection in request body', async () => {
      const maliciousPayloads = [
        { name: { $ne: null } },
        { price: { $gt: 0 } },
        { status: { $in: ['active', 'inactive'] } },
        { categoryId: { $regex: '.*' } },
      ];

      for (const maliciousPayload of maliciousPayloads) {
        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/items',
          maliciousPayload,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { POST: createMenuItem } = await import('../../app/api/items/route');
        const response = await createMenuItem(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
      }
    });

    it('should prevent XSS attacks in text fields', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(\'XSS\')">',
        '"><script>alert("XSS")</script>',
      ];

      for (const xssPayload of xssPayloads) {
        const menuItemData = TestHelpers.createTestMenuItem({
          categoryId: testData.category._id.toString(),
          name: xssPayload,
          description: xssPayload,
          price: 25.99,
        });

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/items',
          menuItemData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { POST: createMenuItem } = await import('../../app/api/items/route');
        const response = await createMenuItem(request);
        const responseData = await response.json();

        if (response.status === 200) {
          // If created, verify XSS payload was sanitized
          expect(responseData.data.name).not.toContain('<script>');
          expect(responseData.data.name).not.toContain('javascript:');
          expect(responseData.data.description).not.toContain('<script>');
        } else {
          // Should be rejected due to validation
          expect(response.status).toBe(400);
        }
      }
    });

    it('should prevent path traversal attacks', async () => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      ];

      for (const payload of pathTraversalPayloads) {
        const request = TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { image: payload }
        );

        const { GET } = await import('../../app/api/items/route');
        const response = await GET(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        // Should not expose system files
      }
    });

    it('should validate numeric inputs properly', async () => {
      const invalidNumericInputs = [
        { price: 'not-a-number' },
        { price: Infinity },
        { price: -Infinity },
        { price: NaN },
        { quantity: 'abc' },
        { quantity: -1 },
        { quantity: 0 },
      ];

      for (const invalidInput of invalidNumericInputs) {
        const menuItemData = TestHelpers.createTestMenuItem({
          categoryId: testData.category._id.toString(),
          ...invalidInput,
        });

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/items',
          menuItemData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { POST: createMenuItem } = await import('../../app/api/items/route');
        const response = await createMenuItem(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
      }
    });

    it('should validate array inputs properly', async () => {
      const invalidArrayInputs = [
        { ingredients: 'not-an-array' },
        { ingredients: null },
        { ingredients: {} },
        { tags: 'not-an-array' },
        { allergens: 123 },
      ];

      for (const invalidInput of invalidArrayInputs) {
        const menuItemData = TestHelpers.createTestMenuItem({
          categoryId: testData.category._id.toString(),
          ...invalidInput,
        });

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/items',
          menuItemData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { POST: createMenuItem } = await import('../../app/api/items/route');
        const response = await createMenuItem(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
      }
    });
  });

  describe('Data Validation Security', () => {
    it('should prevent oversized payloads', async () => {
      const oversizedPayload = {
        name: 'A'.repeat(10000), // Very long name
        description: 'B'.repeat(50000), // Very long description
        categoryId: testData.category._id.toString(),
        price: 25.99,
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        oversizedPayload,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createMenuItem } = await import('../../app/api/items/route');
      const response = await createMenuItem(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should prevent deeply nested objects', async () => {
      const deeplyNestedPayload = {
        name: 'Nested Test',
        categoryId: testData.category._id.toString(),
        price: 25.99,
        customData: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: {
                    level6: {
                      level7: {
                        level8: {
                          level9: {
                            level10: 'deep value'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        deeplyNestedPayload,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createMenuItem } = await import('../../app/api/items/route');
      const response = await createMenuItem(request);
      const responseData = await response.json();

      // Should either reject or sanitize the deeply nested structure
      expect([200, 400]).toContain(response.status);
    });

    it('should prevent prototype pollution', async () => {
      const prototypePollutionPayload = {
        name: 'Prototype Test',
        categoryId: testData.category._id.toString(),
        price: 25.99,
        '__proto__': {
          'isAdmin': true,
          'role': 'admin'
        },
        'constructor': {
          'prototype': {
            'isAdmin': true
          }
        }
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        prototypePollutionPayload,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createMenuItem } = await import('../../app/api/items/route');
      const response = await createMenuItem(request);
      const responseData = await response.json();

      if (response.status === 200) {
        // If created, verify prototype pollution was prevented
        expect(responseData.data).not.toHaveProperty('isAdmin');
        expect(responseData.data).not.toHaveProperty('role');
      } else {
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Rate Limiting Security', () => {
    it('should implement rate limiting on API endpoints', async () => {
      const rapidRequests = Array.from({ length: 100 }, () => {
        const request = TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { page: '1', limit: '10' }
        );

        const { GET } = await import('../../app/api/items/route');
        return GET(request);
      });

      const responses = await Promise.all(rapidRequests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should implement different rate limits for different endpoints', async () => {
      // Test read endpoints (should have higher limits)
      const readRequests = Array.from({ length: 50 }, () => {
        const request = TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { page: '1', limit: '10' }
        );

        const { GET } = await import('../../app/api/items/route');
        return GET(request);
      });

      // Test write endpoints (should have lower limits)
      const writeRequests = Array.from({ length: 20 }, () => {
        const menuItemData = TestHelpers.createTestMenuItem({
          categoryId: testData.category._id.toString(),
          name: `Rate Limit Test ${Math.random()}`,
          price: 25.99,
        });

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/items',
          menuItemData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { POST: createMenuItem } = await import('../../app/api/items/route');
        return createMenuItem(request);
      });

      const readResponses = await Promise.all(readRequests);
      const writeResponses = await Promise.all(writeRequests);

      // Write endpoints should be rate limited more aggressively
      const readRateLimited = readResponses.filter(r => r.status === 429).length;
      const writeRateLimited = writeResponses.filter(r => r.status === 429).length;

      expect(writeRateLimited).toBeGreaterThan(readRateLimited);
    });
  });

  describe('Information Disclosure Security', () => {
    it('should not expose sensitive information in error messages', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/items/invalid-id'
      );

      const { GET } = await import('../../app/api/items/[id]/route');
      const response = await GET(request, { params: { id: 'invalid-id' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
      // Error message should not expose internal details
      expect(responseData.error).not.toContain('MongoDB');
      expect(responseData.error).not.toContain('database');
      expect(responseData.error).not.toContain('connection');
    });

    it('should not expose stack traces in production', async () => {
      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        { invalid: 'data' },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createMenuItem } = await import('../../app/api/items/route');
      const response = await createMenuItem(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      // Should not expose stack traces or internal file paths
      expect(responseData.error).not.toContain('at ');
      expect(responseData.error).not.toContain('.ts:');
      expect(responseData.error).not.toContain('.js:');
    });

    it('should not expose internal system information', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/items',
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Response should not contain internal system information
      const responseString = JSON.stringify(responseData);
      expect(responseString).not.toContain('mongodb://');
      expect(responseString).not.toContain('localhost:27017');
      expect(responseString).not.toContain('process.env');
      expect(responseString).not.toContain('__dirname');
    });
  });

  describe('Session Security', () => {
    it('should handle session fixation attacks', async () => {
      // Test that session tokens are properly validated and not predictable
      const sessionTokens = Array.from({ length: 10 }, () => {
        return Math.random().toString(36).substring(2);
      });

      for (const token of sessionTokens) {
        const request = TestHelpers.createMockRequest(
          'GET',
          'http://localhost:3000/api/admin/dashboard',
          undefined,
          TestHelpers.createAuthHeaders(token)
        );

        const { GET } = await import('../../app/api/admin/dashboard/route');
        const response = await GET(request);
        const responseData = await response.json();

        expect(response.status).toBe(401);
        expect(responseData.success).toBe(false);
      }
    });

    it('should implement proper session timeout', async () => {
      // Test session timeout by using an old token
      const oldToken = 'old-session-token';
      
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        TestHelpers.createAuthHeaders(oldToken)
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('expired');
    });
  });
});







