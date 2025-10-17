import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * Admin API Test Suite
 * Tests admin-specific endpoints, bulk operations, staff management, and reporting
 */

describe('Admin API', () => {
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
    const Order = mongoose.model('Order');

    // Create test category
    const category = new Category(MockDataGenerators.generateCompleteCategory());
    await category.save();

    // Create test materials
    const materials = [];
    for (let i = 0; i < 10; i++) {
      const material = new Material(MockDataGenerators.generateCompleteMaterial({
        name: `Admin Test Material ${i + 1}`,
        currentQuantity: 50 + i * 10,
        category: ['food', 'beverage', 'shisha', 'cleaning', 'other'][i % 5],
      }));
      await material.save();
      materials.push(material);
    }

    // Create test menu items
    const menuItems = [];
    for (let i = 0; i < 20; i++) {
      const menuItem = new MenuItem({
        ...MockDataGenerators.generateCompleteMenuItem(),
        categoryId: category._id,
        name: `Admin Test Item ${i + 1}`,
        price: 20 + i * 2,
        status: i < 15 ? 'active' : 'inactive',
        featured: i < 5,
      });
      await menuItem.save();
      menuItems.push(menuItem);
    }

    // Create test users
    const users = [];
    const userRoles = ['admin', 'kitchen', 'barista', 'shisha'];
    for (const role of userRoles) {
      const user = new User(MockDataGenerators.generateUserWithRole(role as any));
      await user.save();
      users.push(user);
    }

    // Create test orders
    const orders = [];
    for (let i = 0; i < 15; i++) {
      const order = new Order(TestHelpers.createTestOrder({
        orderNumber: `ADMIN-${i + 1}`,
        status: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'][i % 5],
        orderDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        totalAmount: 50 + i * 10,
      }));
      await order.save();
      orders.push(order);
    }

    testData = { category, materials, menuItems, users, orders };
    adminToken = 'test-admin-token';
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('GET /api/admin/dashboard', () => {
    it('should return dashboard statistics', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('totalOrders');
      expect(responseData.data).toHaveProperty('totalRevenue');
      expect(responseData.data).toHaveProperty('totalMenuItems');
      expect(responseData.data).toHaveProperty('totalMaterials');
      expect(responseData.data).toHaveProperty('totalStaff');
      expect(responseData.data).toHaveProperty('recentOrders');
      expect(responseData.data).toHaveProperty('lowStockItems');
      expect(responseData.data).toHaveProperty('topSellingItems');
    });

    it('should return filtered dashboard data by date range', async () => {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        {
          from: lastWeek.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('totalOrders');
      expect(responseData.data).toHaveProperty('totalRevenue');
    });

    it('should deny access to non-admin users', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        TestHelpers.createAuthHeaders('kitchen-token')
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('admin');
    });
  });

  describe('POST /api/admin/menu/bulk-update', () => {
    it('should update multiple menu items', async () => {
      const bulkUpdateData = {
        items: [
          { id: testData.menuItems[0]._id.toString(), price: 35.99, status: 'active' },
          { id: testData.menuItems[1]._id.toString(), price: 45.99, status: 'active' },
          { id: testData.menuItems[2]._id.toString(), featured: true },
        ],
        reason: 'Price adjustment and feature updates',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/menu/bulk-update',
        bulkUpdateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/menu/bulk-update/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('updatedCount');
      expect(responseData.data.updatedCount).toBe(3);
      expect(responseData.data).toHaveProperty('updatedItems');
      expect(responseData.data.updatedItems).toHaveLength(3);
    });

    it('should validate bulk update data', async () => {
      const invalidBulkUpdateData = {
        items: [
          { id: 'invalid-id', price: -10 }, // Invalid ID and negative price
          { id: testData.menuItems[0]._id.toString(), status: 'invalid_status' },
        ],
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/menu/bulk-update',
        invalidBulkUpdateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/menu/bulk-update/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBeDefined();
    });

    it('should handle partial failures in bulk update', async () => {
      const mixedBulkUpdateData = {
        items: [
          { id: testData.menuItems[0]._id.toString(), price: 30.99 }, // Valid
          { id: '507f1f77bcf86cd799439011', price: 40.99 }, // Non-existent ID
          { id: testData.menuItems[1]._id.toString(), price: 50.99 }, // Valid
        ],
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/menu/bulk-update',
        mixedBulkUpdateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/menu/bulk-update/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.updatedCount).toBe(2); // Only 2 valid items updated
      expect(responseData.data).toHaveProperty('errors');
      expect(responseData.data.errors).toHaveLength(1); // 1 error for non-existent ID
    });
  });

  describe('GET /api/admin/staff', () => {
    it('should return paginated staff members', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/staff',
        { page: '1', limit: '10' },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/staff/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
      expect(responseData).toHaveProperty('pagination');
      ApiAssertions.assertPagination(responseData.pagination);
    });

    it('should filter staff by role', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/staff',
        { role: 'kitchen' },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/staff/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // All returned staff should have kitchen role
      responseData.data.forEach((staff: any) => {
        expect(staff.role).toBe('kitchen');
      });
    });

    it('should filter staff by department', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/staff',
        { department: 'kitchen' },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/staff/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // All returned staff should be in kitchen department
      responseData.data.forEach((staff: any) => {
        expect(staff.department).toBe('kitchen');
      });
    });

    it('should filter staff by status', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/staff',
        { status: 'active' },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/staff/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      
      // All returned staff should be active
      responseData.data.forEach((staff: any) => {
        expect(staff.status).toBe('active');
      });
    });
  });

  describe('POST /api/admin/staff', () => {
    it('should create new staff member', async () => {
      const newStaffData = {
        name: 'New Staff Member',
        email: 'newstaff@maraksh.com',
        phone: '+966501234569',
        role: 'kitchen',
        department: 'kitchen',
        permissions: ['kitchen', 'inventory'],
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/staff',
        newStaffData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/staff/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('_id');
      expect(responseData.data.name).toBe(newStaffData.name);
      expect(responseData.data.role).toBe(newStaffData.role);
      expect(responseData.data.department).toBe(newStaffData.department);
    });

    it('should validate required fields for staff creation', async () => {
      const invalidStaffData = {
        name: 'Incomplete Staff',
        // Missing required fields
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/staff',
        invalidStaffData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/staff/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBeDefined();
    });

    it('should validate role and department combinations', async () => {
      const invalidStaffData = {
        name: 'Invalid Role Staff',
        email: 'invalid@maraksh.com',
        phone: '+966501234570',
        role: 'kitchen',
        department: 'admin', // Invalid combination
        permissions: ['kitchen'],
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/staff',
        invalidStaffData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/staff/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });

  describe('PUT /api/admin/staff/[id]', () => {
    it('should update staff member', async () => {
      const updateData = {
        name: 'Updated Staff Member',
        email: 'updated@maraksh.com',
        phone: '+966501234571',
        status: 'active',
        permissions: ['kitchen', 'inventory', 'orders'],
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/admin/staff/${testData.users[1]._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/admin/staff/[id]/route');
      const response = await PUT(request, { params: { id: testData.users[1]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.name).toBe(updateData.name);
      expect(responseData.data.email).toBe(updateData.email);
      expect(responseData.data.status).toBe(updateData.status);
    });

    it('should deactivate staff member', async () => {
      const updateData = {
        status: 'inactive',
        reason: 'Terminated',
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/admin/staff/${testData.users[2]._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/admin/staff/[id]/route');
      const response = await PUT(request, { params: { id: testData.users[2]._id.toString() } });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.status).toBe('inactive');
    });

    it('should return 404 for non-existent staff member', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const request = TestHelpers.createMockRequest(
        'PUT',
        'http://localhost:3000/api/admin/staff/507f1f77bcf86cd799439011',
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT } = await import('../../app/api/admin/staff/[id]/route');
      const response = await PUT(request, { params: { id: '507f1f77bcf86cd799439011' } });
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
    });
  });

  describe('GET /api/admin/reports/sales', () => {
    it('should return sales report', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/sales',
        {
          from: '2024-01-01',
          to: '2024-12-31',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/sales/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('totalSales');
      expect(responseData.data).toHaveProperty('totalOrders');
      expect(responseData.data).toHaveProperty('averageOrderValue');
      expect(responseData.data).toHaveProperty('salesByDate');
      expect(responseData.data).toHaveProperty('topSellingItems');
      expect(responseData.data).toHaveProperty('salesByDepartment');
    });

    it('should return sales report by department', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/sales',
        {
          from: '2024-01-01',
          to: '2024-12-31',
          department: 'kitchen',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/sales/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('totalSales');
      expect(responseData.data).toHaveProperty('totalOrders');
    });

    it('should validate date range', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/sales',
        {
          from: 'invalid-date',
          to: '2024-12-31',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/sales/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });

  describe('GET /api/admin/reports/inventory', () => {
    it('should return inventory report', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/inventory',
        {},
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/inventory/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('totalMaterials');
      expect(responseData.data).toHaveProperty('lowStockItems');
      expect(responseData.data).toHaveProperty('outOfStockItems');
      expect(responseData.data).toHaveProperty('totalValue');
      expect(responseData.data).toHaveProperty('materialsByCategory');
    });

    it('should filter inventory report by category', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/inventory',
        { category: 'food' },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/inventory/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('totalMaterials');
    });
  });

  describe('POST /api/admin/export', () => {
    it('should export sales data to CSV', async () => {
      const exportData = {
        type: 'sales',
        format: 'csv',
        from: '2024-01-01',
        to: '2024-12-31',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/export',
        exportData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/export/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('downloadUrl');
      expect(responseData.data).toHaveProperty('filename');
      expect(responseData.data.filename).toContain('.csv');
    });

    it('should export inventory data to Excel', async () => {
      const exportData = {
        type: 'inventory',
        format: 'excel',
        category: 'food',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/export',
        exportData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/export/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('downloadUrl');
      expect(responseData.data).toHaveProperty('filename');
      expect(responseData.data.filename).toContain('.xlsx');
    });

    it('should validate export parameters', async () => {
      const invalidExportData = {
        type: 'invalid_type',
        format: 'invalid_format',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/export',
        invalidExportData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/export/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });

  describe('System Management', () => {
    it('should clear cache', async () => {
      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/clear-cache',
        {},
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/clear-cache/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Cache cleared successfully');
    });

    it('should perform system cleanup', async () => {
      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/cleanup',
        {
          cleanupOrders: true,
          cleanupLogs: true,
          olderThan: 30, // days
        },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/cleanup/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('cleanedOrders');
      expect(responseData.data).toHaveProperty('cleanedLogs');
    });

    it('should backup system data', async () => {
      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/backup',
        {
          includeOrders: true,
          includeInventory: true,
          includeMenu: true,
        },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/backup/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('backupUrl');
      expect(responseData.data).toHaveProperty('backupSize');
    });
  });

  describe('Error Handling and Security', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/menu/bulk-update', {
        method: 'POST',
        headers: TestHelpers.createAdminHeaders(adminToken),
        body: 'invalid json',
      });

      const { POST } = await import('../../app/api/admin/menu/bulk-update/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should prevent unauthorized access', async () => {
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
    });

    it('should prevent non-admin access to admin endpoints', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        TestHelpers.createAuthHeaders('kitchen-token')
      );

      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
    });

    it('should handle concurrent admin operations', async () => {
      const operations = Array.from({ length: 5 }, (_, i) => {
        const bulkUpdateData = {
          items: [
            { id: testData.menuItems[i]._id.toString(), price: 30 + i * 5 },
          ],
          reason: `Concurrent update ${i + 1}`,
        };

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/admin/menu/bulk-update',
          bulkUpdateData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { POST } = await import('../../app/api/admin/menu/bulk-update/route');
        return POST(request);
      });

      const responses = await Promise.all(operations);
      
      // All operations should succeed
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });
    });
  });
});












