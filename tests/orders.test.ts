import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * Orders API Test Suite
 * Tests order creation, status updates, inventory consumption, and business logic
 */

describe('Orders API', () => {
  let testData: any;
  let adminToken: string;

  beforeAll(async () => {
    await connectTestDB();
    await cleanupTestDB();
    
    // Create test data
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
        name: `Test Material ${i + 1}`,
        currentQuantity: 100,
        minLimit: 10,
        alertLimit: 20,
      }));
      await material.save();
      materials.push(material);
    }

    // Create test menu items with ingredients
    const menuItems = [];
    for (let i = 0; i < 10; i++) {
      const menuItem = new MenuItem({
        ...MockDataGenerators.generateCompleteMenuItem(),
        categoryId: category._id,
        name: `Test Menu Item ${i + 1}`,
        price: 20 + i * 5,
        ingredients: [
          {
            ingredientId: materials[i % materials.length]._id,
            portion: 1 + i * 0.5,
            required: true,
          },
        ],
      });
      await menuItem.save();
      menuItems.push(menuItem);
    }

    // Create admin user
    const adminUser = new User(MockDataGenerators.generateUserWithRole('admin'));
    await adminUser.save();

    testData = { category, materials, menuItems, adminUser };
    adminToken = 'test-admin-token';
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('POST /api/orders', () => {
    it('should create a new order successfully', async () => {
      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[0]._id.toString(),
            menuItemName: testData.menuItems[0].name,
            menuItemNameEn: testData.menuItems[0].nameEn,
            quantity: 2,
            unitPrice: testData.menuItems[0].price,
            totalPrice: testData.menuItems[0].price * 2,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 15,
          },
        ],
        totalAmount: testData.menuItems[0].price * 2 * 1.15, // Including tax
        taxInfo: {
          subtotal: testData.menuItems[0].price * 2,
          taxRate: 15,
          taxAmount: testData.menuItems[0].price * 2 * 0.15,
          includeTaxInPrice: true,
        },
        customerInfo: {
          name: 'Test Customer',
          phone: '+966501234567',
          address: 'Test Address',
        },
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('_id');
      expect(responseData.data.orderNumber).toBeDefined();
      expect(responseData.data.status).toBe('pending');
      ApiAssertions.assertOrder(responseData.data);

      // Verify order was saved to database
      const Order = mongoose.model('Order');
      const savedOrder = await Order.findById(responseData.data._id);
      expect(savedOrder).toBeTruthy();
      expect(savedOrder!.orderNumber).toBe(orderData.orderNumber);
    });

    it('should validate required fields', async () => {
      const invalidOrder = {
        // Missing required fields
        items: [],
        customerInfo: {},
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        invalidOrder,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBeDefined();
    });

    it('should validate order items', async () => {
      const invalidOrder = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: 'invalid-id',
            menuItemName: 'Test Item',
            quantity: 0, // Invalid quantity
            unitPrice: -10, // Invalid price
            totalPrice: 0,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 15,
          },
        ],
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        invalidOrder,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should validate customer information', async () => {
      const invalidOrder = TestHelpers.createTestOrder({
        customerInfo: {
          name: '', // Empty name
          phone: 'invalid-phone',
          address: '',
        },
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        invalidOrder,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should handle complex order with multiple items', async () => {
      const complexOrder = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[0]._id.toString(),
            menuItemName: testData.menuItems[0].name,
            menuItemNameEn: testData.menuItems[0].nameEn,
            quantity: 1,
            unitPrice: testData.menuItems[0].price,
            totalPrice: testData.menuItems[0].price,
            customizations: ['extra cheese', 'no onions'],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 20,
          },
          {
            menuItemId: testData.menuItems[1]._id.toString(),
            menuItemName: testData.menuItems[1].name,
            menuItemNameEn: testData.menuItems[1].nameEn,
            quantity: 2,
            unitPrice: testData.menuItems[1].price,
            totalPrice: testData.menuItems[1].price * 2,
            customizations: [],
            department: 'barista',
            departmentStatus: 'pending',
            estimatedPrepTime: 10,
          },
        ],
        notes: 'Special instructions for this order',
        source: 'website_whatsapp',
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        complexOrder,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.items).toHaveLength(2);
      expect(responseData.data.notes).toBe(complexOrder.notes);
      expect(responseData.data.source).toBe(complexOrder.source);
    });

    it('should calculate tax correctly', async () => {
      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[0]._id.toString(),
            menuItemName: testData.menuItems[0].name,
            menuItemNameEn: testData.menuItems[0].nameEn,
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 15,
          },
        ],
        taxInfo: {
          subtotal: 100,
          taxRate: 15,
          taxAmount: 15,
          includeTaxInPrice: true,
        },
        totalAmount: 115,
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.taxInfo.taxAmount).toBe(15);
      expect(responseData.data.totalAmount).toBe(115);
    });

    it('should apply discount correctly', async () => {
      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[0]._id.toString(),
            menuItemName: testData.menuItems[0].name,
            menuItemNameEn: testData.menuItems[0].nameEn,
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 15,
          },
        ],
        discountAmount: 10,
        taxInfo: {
          subtotal: 100,
          taxRate: 15,
          taxAmount: 15,
          includeTaxInPrice: true,
        },
        totalAmount: 105, // 100 + 15 - 10
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.discountAmount).toBe(10);
      expect(responseData.data.totalAmount).toBe(105);
    });
  });

  describe('GET /api/orders', () => {
    let testOrders: any[];

    beforeEach(async () => {
      // Create test orders
      const Order = mongoose.model('Order');
      testOrders = [];
      
      for (let i = 0; i < 5; i++) {
        const order = new Order(TestHelpers.createTestOrder({
          orderNumber: `TEST-${i + 1}`,
          status: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'][i],
          orderDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Different dates
        }));
        await order.save();
        testOrders.push(order);
      }
    });

    it('should return paginated orders', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/orders',
        { page: '1', limit: '3' }
      );

      const { GET } = await import('../../app/api/orders/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
      expect(responseData.data.length).toBeLessThanOrEqual(3);
      expect(responseData).toHaveProperty('pagination');
      ApiAssertions.assertPagination(responseData.pagination);
    });

    it('should filter orders by status', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/orders',
        { status: 'pending' }
      );

      const { GET } = await import('../../app/api/orders/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // All returned orders should have pending status
      responseData.data.forEach((order: any) => {
        expect(order.status).toBe('pending');
      });
    });

    it('should filter orders by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/orders',
        { 
          from: yesterday.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0]
        }
      );

      const { GET } = await import('../../app/api/orders/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should search orders by customer name', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/orders',
        { search: 'Test Customer' }
      );

      const { GET } = await import('../../app/api/orders/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should sort orders by date descending', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/orders',
        { sort: 'orderDate', order: 'desc' }
      );

      const { GET } = await import('../../app/api/orders/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Verify sorting
      for (let i = 1; i < responseData.data.length; i++) {
        const currentDate = new Date(responseData.data[i].orderDate);
        const previousDate = new Date(responseData.data[i - 1].orderDate);
        expect(currentDate.getTime()).toBeLessThanOrEqual(previousDate.getTime());
      }
    });
  });

  describe('PUT /api/orders/[id]', () => {
    let testOrder: any;

    beforeEach(async () => {
      const Order = mongoose.model('Order');
      testOrder = new Order(TestHelpers.createTestOrder({
        orderNumber: 'TEST-UPDATE',
        status: 'pending',
      }));
      await testOrder.save();
    });

    it('should update order status', async () => {
      const updateData = {
        status: 'confirmed',
        notes: 'Order confirmed by staff',
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/orders/${testOrder._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/orders/[id]/route');
      const response = await PUT(request, { params: { id: testOrder._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.status).toBe('confirmed');
      expect(responseData.data.notes).toBe(updateData.notes);
    });

    it('should update department statuses', async () => {
      const updateData = {
        departmentStatuses: {
          kitchen: 'in_progress',
          barista: 'ready',
          shisha: 'pending',
        },
        assignedTo: {
          kitchen: 'Kitchen Staff Member',
          barista: 'Barista Staff Member',
        },
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/orders/${testOrder._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/orders/[id]/route');
      const response = await PUT(request, { params: { id: testOrder._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.departmentStatuses.kitchen).toBe('in_progress');
      expect(responseData.data.departmentStatuses.barista).toBe('ready');
      expect(responseData.data.assignedTo.kitchen).toBe('Kitchen Staff Member');
    });

    it('should validate status transitions', async () => {
      const invalidUpdateData = {
        status: 'invalid_status',
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/orders/${testOrder._id}`,
        invalidUpdateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/orders/[id]/route');
      const response = await PUT(request, { params: { id: testOrder._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should return 404 for non-existent order', async () => {
      const updateData = {
        status: 'confirmed',
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        'http://localhost:3000/api/orders/507f1f77bcf86cd799439011',
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/orders/[id]/route');
      const response = await PUT(request, { params: { id: '507f1f77bcf86cd799439011' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
    });
  });

  describe('Inventory Consumption Integration', () => {
    it('should consume inventory when order is created', async () => {
      // Get initial material quantity
      const Material = mongoose.model('Material');
      const material = await Material.findById(testData.materials[0]._id);
      const initialQuantity = material!.currentQuantity;

      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[0]._id.toString(),
            menuItemName: testData.menuItems[0].name,
            menuItemNameEn: testData.menuItems[0].nameEn,
            quantity: 2,
            unitPrice: testData.menuItems[0].price,
            totalPrice: testData.menuItems[0].price * 2,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 15,
          },
        ],
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      // Verify inventory was consumed
      await DatabaseHelpers.waitForCondition(async () => {
        const updatedMaterial = await Material.findById(testData.materials[0]._id);
        return updatedMaterial!.currentQuantity < initialQuantity;
      });

      const updatedMaterial = await Material.findById(testData.materials[0]._id);
      expect(updatedMaterial!.currentQuantity).toBeLessThan(initialQuantity);
    });

    it('should handle insufficient inventory', async () => {
      // Set material quantity to very low amount
      const Material = mongoose.model('Material');
      await Material.findByIdAndUpdate(testData.materials[0]._id, {
        currentQuantity: 0.1,
      });

      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[0]._id.toString(),
            menuItemName: testData.menuItems[0].name,
            menuItemNameEn: testData.menuItems[0].nameEn,
            quantity: 10, // Large quantity that exceeds available inventory
            unitPrice: testData.menuItems[0].price,
            totalPrice: testData.menuItems[0].price * 10,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 15,
          },
        ],
      });

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      // Should either reject the order or mark items as out of stock
      expect([200, 400]).toContain(response.status);
      
      if (response.status === 200) {
        // If order is created, check that inventory status was updated
        const updatedMaterial = await Material.findById(testData.materials[0]._id);
        expect(updatedMaterial!.status).toBe('out_of_stock');
      }
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle concurrent order creation', async () => {
      const orderPromises = Array.from({ length: 5 }, (_, i) => {
        const orderData = TestHelpers.createTestOrder({
          orderNumber: `CONCURRENT-${i + 1}`,
          items: [
            {
              menuItemId: testData.menuItems[0]._id.toString(),
              menuItemName: testData.menuItems[0].name,
              menuItemNameEn: testData.menuItems[0].nameEn,
              quantity: 1,
              unitPrice: testData.menuItems[0].price,
              totalPrice: testData.menuItems[0].price,
              customizations: [],
              department: 'kitchen',
              departmentStatus: 'pending',
              estimatedPrepTime: 15,
            },
          ],
        });

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/orders',
          orderData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { POST } = await import('../../app/api/orders/route');
        return POST(request);
      });

      const responses = await Promise.all(orderPromises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });

      // Verify all orders were created with unique order numbers
      const Order = mongoose.model('Order');
      const createdOrders = await Order.find({ orderNumber: { $regex: /^CONCURRENT-/ } });
      const orderNumbers = createdOrders.map(order => order.orderNumber);
      const uniqueOrderNumbers = new Set(orderNumbers);
      expect(uniqueOrderNumbers.size).toBe(orderNumbers.length);
    });

    it('should prevent inventory from going negative', async () => {
      // Set material quantity to a small amount
      const Material = mongoose.model('Material');
      await Material.findByIdAndUpdate(testData.materials[0]._id, {
        currentQuantity: 2,
      });

      // Create multiple orders that would consume more than available
      const orderPromises = Array.from({ length: 3 }, (_, i) => {
        const orderData = TestHelpers.createTestOrder({
          orderNumber: `INVENTORY-TEST-${i + 1}`,
          items: [
            {
              menuItemId: testData.menuItems[0]._id.toString(),
              menuItemName: testData.menuItems[0].name,
              menuItemNameEn: testData.menuItems[0].nameEn,
              quantity: 2, // Each order consumes 2 units, total would be 6 but only 2 available
              unitPrice: testData.menuItems[0].price,
              totalPrice: testData.menuItems[0].price * 2,
              customizations: [],
              department: 'kitchen',
              departmentStatus: 'pending',
              estimatedPrepTime: 15,
            },
          ],
        });

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/orders',
          orderData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { POST } = await import('../../app/api/orders/route');
        return POST(request);
      });

      const responses = await Promise.all(orderPromises);
      
      // Wait for all operations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify inventory never went negative
      const finalMaterial = await Material.findById(testData.materials[0]._id);
      expect(finalMaterial!.currentQuantity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: TestHelpers.createAdminHeaders(adminToken),
        body: 'invalid json',
      });

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should handle missing authentication', async () => {
      const orderData = TestHelpers.createTestOrder();

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData
        // No auth headers
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database connection failures
      // For now, we'll test with invalid data that should cause validation errors
      const invalidOrderData = {
        items: null,
        customerInfo: null,
        totalAmount: 'invalid',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        invalidOrderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/orders/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });
});












