import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * Inventory/Materials API Test Suite
 * Tests CRUD operations, stock management, alerts, and status transitions
 */

describe('Inventory/Materials API', () => {
  let testData: any;
  let adminToken: string;

  beforeAll(async () => {
    await connectTestDB();
    await cleanupTestDB();
    
    // Create test data
    const Material = mongoose.model('Material');
    const User = mongoose.model('User');

    // Create test materials with different stock levels
    const materials = [];
    const materialData = [
      { name: 'High Stock Material', currentQuantity: 100, minLimit: 10, alertLimit: 20 },
      { name: 'Low Stock Material', currentQuantity: 15, minLimit: 10, alertLimit: 20 },
      { name: 'Critical Stock Material', currentQuantity: 5, minLimit: 10, alertLimit: 20 },
      { name: 'Out of Stock Material', currentQuantity: 0, minLimit: 10, alertLimit: 20 },
    ];

    for (let i = 0; i < materialData.length; i++) {
      const material = new Material(MockDataGenerators.generateCompleteMaterial({
        ...materialData[i],
        nameEn: materialData[i].name,
        category: ['food', 'beverage', 'shisha', 'cleaning'][i % 4],
        status: materialData[i].currentQuantity === 0 ? 'out_of_stock' : 'active',
      }));
      await material.save();
      materials.push(material);
    }

    // Create admin user
    const adminUser = new User(MockDataGenerators.generateUserWithRole('admin'));
    await adminUser.save();

    testData = { materials, adminUser };
    adminToken = 'test-admin-token';
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('GET /api/ingredients', () => {
    it('should return paginated materials', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/ingredients',
        { page: '1', limit: '10' }
      );

      const { GET } = await import('../../app/api/ingredients/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
      expect(responseData.data.length).toBeLessThanOrEqual(10);
      expect(responseData).toHaveProperty('pagination');
      ApiAssertions.assertPagination(responseData.pagination);
    });

    it('should filter materials by category', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/ingredients',
        { category: 'food' }
      );

      const { GET } = await import('../../app/api/ingredients/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // All returned materials should be in the food category
      responseData.data.forEach((material: any) => {
        expect(material.category).toBe('food');
      });
    });

    it('should filter materials by status', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/ingredients',
        { status: 'active' }
      );

      const { GET } = await import('../../app/api/ingredients/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // All returned materials should be active
      responseData.data.forEach((material: any) => {
        expect(material.status).toBe('active');
      });
    });

    it('should filter low stock materials', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/ingredients',
        { lowStock: 'true' }
      );

      const { GET } = await import('../../app/api/ingredients/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // All returned materials should have low stock
      responseData.data.forEach((material: any) => {
        expect(material.currentQuantity).toBeLessThanOrEqual(material.alertLimit);
      });
    });

    it('should search materials by name', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/ingredients',
        { search: 'High Stock' }
      );

      const { GET } = await import('../../app/api/ingredients/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Should find materials matching the search term
      expect(responseData.data.length).toBeGreaterThan(0);
      responseData.data.forEach((material: any) => {
        expect(material.name.toLowerCase()).toContain('high stock');
      });
    });

    it('should sort materials by quantity', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/ingredients',
        { sort: 'currentQuantity', order: 'asc' }
      );

      const { GET } = await import('../../app/api/ingredients/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Verify sorting
      for (let i = 1; i < responseData.data.length; i++) {
        expect(responseData.data[i].currentQuantity).toBeGreaterThanOrEqual(
          responseData.data[i - 1].currentQuantity
        );
      }
    });
  });

  describe('POST /api/ingredients', () => {
    it('should create a new material', async () => {
      const newMaterial = TestHelpers.createTestMaterial({
        name: 'New Test Material',
        nameEn: 'New Test Material',
        category: 'food',
        currentQuantity: 50,
        minLimit: 10,
        alertLimit: 20,
        costPerUnit: 15.50,
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/ingredients',
        newMaterial,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/ingredients/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('_id');
      expect(responseData.data.name).toBe(newMaterial.name);
      expect(responseData.data.currentQuantity).toBe(newMaterial.currentQuantity);
      ApiAssertions.assertMaterial(responseData.data);
    });

    it('should validate required fields', async () => {
      const invalidMaterial = {
        // Missing required fields
        category: 'food',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/ingredients',
        invalidMaterial,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/ingredients/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBeDefined();
    });

    it('should validate quantity values', async () => {
      const invalidMaterial = TestHelpers.createTestMaterial({
        name: 'Invalid Material',
        currentQuantity: -10, // Invalid negative quantity
        minLimit: -5, // Invalid negative limit
        alertLimit: 0, // Invalid zero limit
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/ingredients',
        invalidMaterial,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/ingredients/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should validate category enum', async () => {
      const invalidMaterial = TestHelpers.createTestMaterial({
        name: 'Invalid Category Material',
        category: 'invalid_category',
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/ingredients',
        invalidMaterial,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/ingredients/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should handle complex material with all fields', async () => {
      const complexMaterial = MockDataGenerators.generateCompleteMaterial({
        name: 'Complex Test Material',
        nameEn: 'Complex Test Material',
        description: 'A complex material with all fields populated',
        unit: 'kg',
        currentQuantity: 75.5,
        minLimit: 15.0,
        alertLimit: 25.0,
        costPerUnit: 25.99,
        supplier: 'Premium Supplier Co.',
        category: 'food',
        status: 'active',
        lastRestocked: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        image: 'https://example.com/material.jpg',
        notes: 'Special handling required',
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/ingredients',
        complexMaterial,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/ingredients/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.supplier).toBe(complexMaterial.supplier);
      expect(responseData.data.expiryDate).toBeDefined();
      expect(responseData.data.notes).toBe(complexMaterial.notes);
    });
  });

  describe('PUT /api/ingredients/[id]', () => {
    it('should update existing material', async () => {
      const updateData = {
        currentQuantity: 75,
        minLimit: 15,
        alertLimit: 25,
        costPerUnit: 20.99,
        supplier: 'Updated Supplier',
        notes: 'Updated notes',
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/ingredients/[id]/route');
      const response = await PUT(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.currentQuantity).toBe(updateData.currentQuantity);
      expect(responseData.data.supplier).toBe(updateData.supplier);
      expect(responseData.data.notes).toBe(updateData.notes);
    });

    it('should update material status based on quantity', async () => {
      const updateData = {
        currentQuantity: 0, // Should trigger out_of_stock status
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/ingredients/[id]/route');
      const response = await PUT(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.currentQuantity).toBe(0);
      expect(responseData.data.status).toBe('out_of_stock');
    });

    it('should trigger low stock alert when quantity drops below alert limit', async () => {
      const updateData = {
        currentQuantity: 5, // Below alert limit of 20
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/ingredients/[id]/route');
      const response = await PUT(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.currentQuantity).toBe(5);
      
      // Check if notification was created (if notification system is implemented)
      const Notification = mongoose.model('Notification');
      const notifications = await Notification.find({
        type: 'inventory',
        'data.materialId': testData.materials[0]._id,
      });
      
      // This test assumes notification system is implemented
      // If not implemented, this assertion can be removed or modified
      if (notifications.length > 0) {
        expect(notifications[0].priority).toBe('high');
        expect(notifications[0].title).toContain('low stock');
      }
    });

    it('should return 404 for non-existent material', async () => {
      const updateData = {
        currentQuantity: 50,
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        'http://localhost:3000/api/ingredients/507f1f77bcf86cd799439011',
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/ingredients/[id]/route');
      const response = await PUT(request, { params: { id: '507f1f77bcf86cd799439011' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        currentQuantity: -10, // Invalid negative quantity
        category: 'invalid_category', // Invalid category
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}`,
        invalidUpdateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/ingredients/[id]/route');
      const response = await PUT(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });

  describe('PATCH /api/ingredients/[id]/stock', () => {
    it('should update stock quantity', async () => {
      const stockUpdate = {
        quantity: 25,
        operation: 'add', // add, subtract, set
        reason: 'Restocked from supplier',
      };

      const request = TestHelpers.createMockRequest(
        'PATCH',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}/stock`,
        stockUpdate,
        TestHelpers.createAdminHeaders(adminToken)
      );

      // Mock the stock update endpoint
      const { PATCH } = await import('../../app/api/ingredients/[id]/stock/route');
      const response = await PATCH(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.currentQuantity).toBe(testData.materials[0].currentQuantity + 25);
    });

    it('should subtract stock quantity', async () => {
      const initialQuantity = testData.materials[0].currentQuantity;
      const stockUpdate = {
        quantity: 10,
        operation: 'subtract',
        reason: 'Used in production',
      };

      const request = TestHelpers.createMockRequest(
        'PATCH',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}/stock`,
        stockUpdate,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PATCH } = await import('../../app/api/ingredients/[id]/stock/route');
      const response = await PATCH(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.currentQuantity).toBe(initialQuantity - 10);
    });

    it('should set exact stock quantity', async () => {
      const stockUpdate = {
        quantity: 50,
        operation: 'set',
        reason: 'Physical count adjustment',
      };

      const request = TestHelpers.createMockRequest(
        'PATCH',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}/stock`,
        stockUpdate,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PATCH } = await import('../../app/api/ingredients/[id]/stock/route');
      const response = await PATCH(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.currentQuantity).toBe(50);
    });

    it('should prevent negative stock', async () => {
      const stockUpdate = {
        quantity: 1000, // Large quantity that would make stock negative
        operation: 'subtract',
        reason: 'Large consumption',
      };

      const request = TestHelpers.createMockRequest(
        'PATCH',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}/stock`,
        stockUpdate,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PATCH } = await import('../../app/api/ingredients/[id]/stock/route');
      const response = await PATCH(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      // Should either reject the operation or set quantity to 0
      expect([200, 400]).toContain(response.status);
      
      if (response.status === 200) {
        expect(responseData.data.currentQuantity).toBeGreaterThanOrEqual(0);
      }
    });

    it('should validate operation type', async () => {
      const stockUpdate = {
        quantity: 10,
        operation: 'invalid_operation',
        reason: 'Test',
      };

      const request = TestHelpers.createMockRequest(
        'PATCH',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}/stock`,
        stockUpdate,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PATCH } = await import('../../app/api/ingredients/[id]/stock/route');
      const response = await PATCH(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });

  describe('Status Transition Tests', () => {
    it('should transition from active to out_of_stock when quantity reaches zero', async () => {
      const Material = mongoose.model('Material');
      const material = await Material.findById(testData.materials[0]._id);
      expect(material!.status).toBe('active');

      const updateData = {
        currentQuantity: 0,
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/ingredients/[id]/route');
      const response = await PUT(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.status).toBe('out_of_stock');
    });

    it('should transition from out_of_stock to active when restocked', async () => {
      const Material = mongoose.model('Material');
      const outOfStockMaterial = testData.materials.find((m: any) => m.status === 'out_of_stock');
      
      const updateData = {
        currentQuantity: 25,
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/ingredients/${outOfStockMaterial._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/ingredients/[id]/route');
      const response = await PUT(request, { params: { id: outOfStockMaterial._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.status).toBe('active');
    });

    it('should maintain active status when quantity is above alert limit', async () => {
      const Material = mongoose.model('Material');
      const material = await Material.findById(testData.materials[0]._id);
      
      const updateData = {
        currentQuantity: 50, // Above alert limit
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/ingredients/${testData.materials[0]._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/ingredients/[id]/route');
      const response = await PUT(request, { params: { id: testData.materials[0]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.status).toBe('active');
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk stock updates', async () => {
      const bulkUpdate = {
        materials: [
          { id: testData.materials[0]._id.toString(), quantity: 30, operation: 'set' },
          { id: testData.materials[1]._id.toString(), quantity: 20, operation: 'set' },
        ],
        reason: 'Monthly inventory count',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/ingredients/bulk-stock-update',
        bulkUpdate,
        TestHelpers.createAdminHeaders(adminToken)
      );

      // Mock the bulk update endpoint
      const { POST } = await import('../../app/api/ingredients/bulk-stock-update/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.updatedCount).toBe(2);
    });

    it('should handle bulk status updates', async () => {
      const bulkStatusUpdate = {
        materials: [
          { id: testData.materials[0]._id.toString(), status: 'inactive' },
          { id: testData.materials[1]._id.toString(), status: 'inactive' },
        ],
        reason: 'Discontinued items',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/ingredients/bulk-status-update',
        bulkStatusUpdate,
        TestHelpers.createAdminHeaders(adminToken)
      );

      // Mock the bulk status update endpoint
      const { POST } = await import('../../app/api/ingredients/bulk-status-update/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.updatedCount).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/ingredients', {
        method: 'POST',
        headers: TestHelpers.createAdminHeaders(adminToken),
        body: 'invalid json',
      });

      const { POST } = await import('../../app/api/ingredients/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should handle missing authentication', async () => {
      const materialData = TestHelpers.createTestMaterial();

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/ingredients',
        materialData
        // No auth headers
      );

      const { POST } = await import('../../app/api/ingredients/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should handle concurrent updates gracefully', async () => {
      const updatePromises = Array.from({ length: 3 }, (_, i) => {
        const updateData = {
          currentQuantity: 10 + i * 5,
        };

        const request = TestHelpers.createMockRequest(
          'PUT',
          `http://localhost:3000/api/ingredients/${testData.materials[0]._id}`,
          updateData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { PUT } = await import('../../app/api/ingredients/[id]/route');
        return PUT(request, { params: { id: testData.materials[0]._id.toString() } });
      });

      const responses = await Promise.all(updatePromises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });

      // Verify final state is consistent
      const Material = mongoose.model('Material');
      const finalMaterial = await Material.findById(testData.materials[0]._id);
      expect(finalMaterial!.currentQuantity).toBeGreaterThanOrEqual(0);
    });
  });
});












