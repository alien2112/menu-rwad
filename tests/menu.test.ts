import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * Menu Items API Test Suite
 * Tests CRUD operations, pagination, filtering, and search functionality
 */

describe('Menu Items API', () => {
  let testData: any;
  let adminToken: string;

  beforeAll(async () => {
    await connectTestDB();
    await cleanupTestDB();
    
    // Create test data
    const Category = mongoose.model('Category');
    const MenuItem = mongoose.model('MenuItem');
    const User = mongoose.model('User');

    // Create test category
    const category = new Category(MockDataGenerators.generateCompleteCategory());
    await category.save();

    // Create test menu items
    const menuItems = [];
    for (let i = 0; i < 25; i++) {
      const menuItem = new MenuItem({
        ...MockDataGenerators.generateCompleteMenuItem(),
        categoryId: category._id,
        name: `Test Item ${i + 1}`,
        price: 10 + i * 5,
        status: i < 20 ? 'active' : 'inactive',
        featured: i < 5,
        order: i,
      });
      await menuItem.save();
      menuItems.push(menuItem);
    }

    // Create admin user
    const adminUser = new User(MockDataGenerators.generateUserWithRole('admin'));
    await adminUser.save();

    testData = { category, menuItems, adminUser };
    adminToken = 'test-admin-token';
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('GET /api/items', () => {
    it('should return paginated menu items', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { page: '1', limit: '10' }
      );

      // Mock the API handler
      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
      expect(responseData.data.length).toBeLessThanOrEqual(10);
      expect(responseData).toHaveProperty('pagination');
      ApiAssertions.assertPagination(responseData.pagination);
    });

    it('should filter items by category', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { categoryId: testData.category._id.toString() }
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
      
      // All items should belong to the specified category
      responseData.data.forEach((item: any) => {
        expect(item.categoryId).toBe(testData.category._id.toString());
      });
    });

    it('should filter items by status', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { status: 'active' }
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // All items should be active
      responseData.data.forEach((item: any) => {
        expect(item.status).toBe('active');
      });
    });

    it('should filter featured items', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { featured: 'true' }
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // All items should be featured
      responseData.data.forEach((item: any) => {
        expect(item.featured).toBe(true);
      });
    });

    it('should search items by name', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { search: 'Test Item 1' }
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Should find items matching the search term
      expect(responseData.data.length).toBeGreaterThan(0);
      responseData.data.forEach((item: any) => {
        expect(item.name.toLowerCase()).toContain('test item 1');
      });
    });

    it('should handle admin requests with no cache', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { admin: 'true' },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate, max-age=0');
    });

    it('should validate pagination parameters', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { page: '0', limit: '0' }
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.pagination.currentPage).toBeGreaterThan(0);
      expect(responseData.pagination.limit).toBeGreaterThan(0);
    });

    it('should handle invalid category ID', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { categoryId: 'invalid-id' }
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new menu item', async () => {
      const newItem = TestHelpers.createTestMenuItem({
        categoryId: testData.category._id.toString(),
        name: 'New Test Item',
        price: 25.50,
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        newItem,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/items/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('_id');
      expect(responseData.data.name).toBe(newItem.name);
      expect(responseData.data.price).toBe(newItem.price);
      ApiAssertions.assertMenuItem(responseData.data);
    });

    it('should validate required fields', async () => {
      const invalidItem = {
        // Missing required fields
        price: 25.50,
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        invalidItem,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/items/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBeDefined();
    });

    it('should validate price is positive', async () => {
      const invalidItem = TestHelpers.createTestMenuItem({
        categoryId: testData.category._id.toString(),
        price: -10,
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        invalidItem,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/items/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should validate category exists', async () => {
      const invalidItem = TestHelpers.createTestMenuItem({
        categoryId: '507f1f77bcf86cd799439011', // Non-existent category
        name: 'Test Item',
        price: 25.50,
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        invalidItem,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/items/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should handle complex menu item with all fields', async () => {
      const complexItem = MockDataGenerators.generateCompleteMenuItem({
        categoryId: testData.category._id.toString(),
        name: 'Complex Test Item',
        price: 45.99,
        ingredients: [
          {
            ingredientId: '507f1f77bcf86cd799439011',
            portion: 1.5,
            required: true,
          },
        ],
        sizeOptions: [
          { name: 'Small', priceModifier: 0, available: true },
          { name: 'Large', priceModifier: 10, available: true },
        ],
        addonOptions: [
          { name: 'Extra Cheese', price: 5, category: 'toppings', available: true },
        ],
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        complexItem,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/items/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.sizeOptions).toHaveLength(2);
      expect(responseData.data.addonOptions).toHaveLength(1);
    });
  });

  describe('PUT /api/items/[id]', () => {
    it('should update existing menu item', async () => {
      const updateData = {
        name: 'Updated Test Item',
        price: 35.99,
        status: 'active',
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/items/${testData.menuItems[0]._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      // Mock the dynamic route handler
      const { PUT } = await import('../../app/api/items/[id]/route');
      const response = await PUT(request, { params: { id: testData.menuItems[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.name).toBe(updateData.name);
      expect(responseData.data.price).toBe(updateData.price);
    });

    it('should return 404 for non-existent item', async () => {
      const updateData = {
        name: 'Updated Test Item',
        price: 35.99,
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        'http://localhost:3000/api/items/507f1f77bcf86cd799439011',
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/items/[id]/route');
      const response = await PUT(request, { params: { id: '507f1f77bcf86cd799439011' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        price: -10, // Invalid negative price
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/items/${testData.menuItems[0]._id}`,
        invalidUpdateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/items/[id]/route');
      const response = await PUT(request, { params: { id: testData.menuItems[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });

  describe('DELETE /api/items/[id]', () => {
    it('should delete existing menu item', async () => {
      const request = TestHelpers.createMockRequest(
        'DELETE',
        `http://localhost:3000/api/items/${testData.menuItems[1]._id}`,
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { DELETE } = await import('../../app/api/items/[id]/route');
      const response = await DELETE(request, { params: { id: testData.menuItems[1]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toContain('deleted');

      // Verify item is deleted
      const MenuItem = mongoose.model('MenuItem');
      const deletedItem = await MenuItem.findById(testData.menuItems[1]._id);
      expect(deletedItem).toBeNull();
    });

    it('should return 404 for non-existent item', async () => {
      const request = TestHelpers.createMockRequest(
        'DELETE',
        'http://localhost:3000/api/items/507f1f77bcf86cd799439011',
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { DELETE } = await import('../../app/api/items/[id]/route');
      const response = await DELETE(request, { params: { id: '507f1f77bcf86cd799439011' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in POST request', async () => {
      const request = new NextRequest('http://localhost:3000/api/items', {
        method: 'POST',
        headers: TestHelpers.createAdminHeaders(adminToken),
        body: 'invalid json',
      });

      const { POST } = await import('../../app/api/items/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should handle very large pagination requests', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { page: '1', limit: '1000' }
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.pagination.limit).toBeLessThanOrEqual(100); // Should be capped
    });

    it('should handle special characters in search', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { search: 'Test Item @#$%^&*()' }
      );

      const { GET } = await import('../../app/api/items/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => {
        return TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { page: '1', limit: '5' }
        );
      });

      const { GET } = await import('../../app/api/items/route');
      const responses = await Promise.all(requests.map(req => GET(req)));

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});







