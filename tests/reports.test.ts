import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * Reports API Test Suite
 * Tests sales reports, analytics, data export, and performance metrics
 */

describe('Reports API', () => {
  let testData: any;
  let adminToken: string;

  beforeAll(async () => {
    await connectTestDB();
    await cleanupTestDB();
    
    // Create comprehensive test data for reporting
    const Category = mongoose.model('Category');
    const MenuItem = mongoose.model('MenuItem');
    const Material = mongoose.model('Material');
    const Order = mongoose.model('Order');
    const Review = mongoose.model('Review');
    const User = mongoose.model('User');

    // Create test category
    const category = new Category(MockDataGenerators.generateCompleteCategory());
    await category.save();

    // Create test materials
    const materials = [];
    for (let i = 0; i < 15; i++) {
      const material = new Material(MockDataGenerators.generateCompleteMaterial({
        name: `Report Test Material ${i + 1}`,
        currentQuantity: Math.random() * 100,
        minLimit: 10,
        alertLimit: 20,
        costPerUnit: Math.random() * 50 + 5,
        category: ['food', 'beverage', 'shisha', 'cleaning', 'other'][i % 5],
        status: Math.random() > 0.1 ? 'active' : 'out_of_stock',
      }));
      await material.save();
      materials.push(material);
    }

    // Create test menu items
    const menuItems = [];
    for (let i = 0; i < 25; i++) {
      const menuItem = new MenuItem({
        ...MockDataGenerators.generateCompleteMenuItem(),
        categoryId: category._id,
        name: `Report Test Item ${i + 1}`,
        price: 15 + i * 3,
        cost: 5 + i * 1.5,
        status: 'active',
        featured: i < 8,
        order: i,
      });
      await menuItem.save();
      menuItems.push(menuItem);
    }

    // Create test orders with different dates and amounts
    const orders = [];
    const orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    const departments = ['kitchen', 'barista', 'shisha'];
    
    for (let i = 0; i < 50; i++) {
      const orderDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      
      const order = new Order({
        orderNumber: `RPT-${String(i + 1).padStart(4, '0')}`,
        items: [
          {
            menuItemId: menuItems[Math.floor(Math.random() * menuItems.length)]._id,
            menuItemName: `Item ${i + 1}`,
            menuItemNameEn: `Item ${i + 1}`,
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPrice: 20 + Math.random() * 30,
            totalPrice: 0, // Will be calculated
            customizations: [],
            department,
            departmentStatus: 'pending',
            estimatedPrepTime: Math.floor(Math.random() * 20) + 5,
          },
        ],
        totalAmount: 30 + Math.random() * 100,
        discountAmount: Math.random() > 0.8 ? Math.random() * 20 : 0,
        taxInfo: {
          subtotal: 30 + Math.random() * 100,
          taxRate: 15,
          taxAmount: (30 + Math.random() * 100) * 0.15,
          includeTaxInPrice: true,
        },
        customerInfo: {
          name: `Customer ${i + 1}`,
          phone: `+966501234${String(i).padStart(3, '0')}`,
          address: `Address ${i + 1}`,
        },
        status,
        orderDate,
        deliveryDate: status === 'delivered' ? new Date(orderDate.getTime() + Math.random() * 2 * 60 * 60 * 1000) : undefined,
        source: ['website_whatsapp', 'manual', 'website'][Math.floor(Math.random() * 3)],
        notes: Math.random() > 0.7 ? `Order notes ${i + 1}` : undefined,
        departmentStatuses: {
          kitchen: department === 'kitchen' ? 'ready' : 'pending',
          barista: department === 'barista' ? 'ready' : 'pending',
          shisha: department === 'shisha' ? 'ready' : 'pending',
        },
      });
      
      // Calculate total price for items
      order.items.forEach((item: any) => {
        item.totalPrice = item.unitPrice * item.quantity;
      });
      
      await order.save();
      orders.push(order);
    }

    // Create test reviews
    const reviews = [];
    for (let i = 0; i < 100; i++) {
      const review = new Review({
        menuItemId: menuItems[Math.floor(Math.random() * menuItems.length)]._id,
        customerName: `Reviewer ${i + 1}`,
        customerEmail: `reviewer${i + 1}@example.com`,
        rating: Math.floor(Math.random() * 5) + 1,
        comment: `Great item! Review ${i + 1}`,
        isVerified: Math.random() > 0.3,
        helpfulCount: Math.floor(Math.random() * 20),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
      await review.save();
      reviews.push(review);
    }

    // Create admin user
    const adminUser = new User(MockDataGenerators.generateUserWithRole('admin'));
    await adminUser.save();

    testData = { category, materials, menuItems, orders, reviews, adminUser };
    adminToken = 'test-admin-token';
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('GET /api/admin/reports/sales', () => {
    it('should return comprehensive sales report', async () => {
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
      expect(responseData.data).toHaveProperty('salesBySource');
      expect(responseData.data).toHaveProperty('conversionRate');
      expect(responseData.data).toHaveProperty('revenueGrowth');
    });

    it('should return sales report for specific date range', async () => {
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/sales',
        {
          from: lastWeek.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/sales/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.totalSales).toBeGreaterThanOrEqual(0);
      expect(responseData.data.totalOrders).toBeGreaterThanOrEqual(0);
    });

    it('should filter sales report by department', async () => {
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

    it('should return sales report by status', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/sales',
        {
          from: '2024-01-01',
          to: '2024-12-31',
          status: 'delivered',
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

    it('should validate date range parameters', async () => {
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

    it('should handle missing date parameters', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/sales',
        {},
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/sales/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      // Should default to current month or all time
    });
  });

  describe('GET /api/admin/reports/inventory', () => {
    it('should return comprehensive inventory report', async () => {
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
      expect(responseData.data).toHaveProperty('stockTurnover');
      expect(responseData.data).toHaveProperty('wasteReport');
      expect(responseData.data).toHaveProperty('reorderSuggestions');
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
      expect(responseData.data).toHaveProperty('totalValue');
    });

    it('should return low stock alert report', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/inventory',
        { alertType: 'low_stock' },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/inventory/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('lowStockItems');
      expect(responseData.data.lowStockItems).toBeInstanceOf(Array);
    });

    it('should return stock valuation report', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/inventory',
        { reportType: 'valuation' },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/inventory/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('totalValue');
      expect(responseData.data).toHaveProperty('valueByCategory');
    });
  });

  describe('GET /api/admin/reports/performance', () => {
    it('should return performance metrics report', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/performance',
        {
          from: '2024-01-01',
          to: '2024-12-31',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/performance/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('orderProcessingTime');
      expect(responseData.data).toHaveProperty('kitchenPerformance');
      expect(responseData.data).toHaveProperty('baristaPerformance');
      expect(responseData.data).toHaveProperty('shishaPerformance');
      expect(responseData.data).toHaveProperty('customerSatisfaction');
      expect(responseData.data).toHaveProperty('staffEfficiency');
      expect(responseData.data).toHaveProperty('peakHours');
    });

    it('should return department-specific performance', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/performance',
        {
          from: '2024-01-01',
          to: '2024-12-31',
          department: 'kitchen',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/performance/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('kitchenPerformance');
      expect(responseData.data.kitchenPerformance).toHaveProperty('averagePrepTime');
      expect(responseData.data.kitchenPerformance).toHaveProperty('orderVolume');
    });
  });

  describe('GET /api/admin/reports/customers', () => {
    it('should return customer analytics report', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/customers',
        {
          from: '2024-01-01',
          to: '2024-12-31',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/customers/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('totalCustomers');
      expect(responseData.data).toHaveProperty('newCustomers');
      expect(responseData.data).toHaveProperty('returningCustomers');
      expect(responseData.data).toHaveProperty('customerRetention');
      expect(responseData.data).toHaveProperty('averageOrderFrequency');
      expect(responseData.data).toHaveProperty('customerLifetimeValue');
      expect(responseData.data).toHaveProperty('topCustomers');
    });

    it('should return customer segmentation report', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/customers',
        {
          from: '2024-01-01',
          to: '2024-12-31',
          segment: 'high_value',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/customers/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('segmentData');
    });
  });

  describe('POST /api/admin/reports/export', () => {
    it('should export sales report to CSV', async () => {
      const exportData = {
        reportType: 'sales',
        format: 'csv',
        from: '2024-01-01',
        to: '2024-12-31',
        includeCharts: false,
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/reports/export',
        exportData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/reports/export/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('downloadUrl');
      expect(responseData.data).toHaveProperty('filename');
      expect(responseData.data).toHaveProperty('fileSize');
      expect(responseData.data.filename).toContain('.csv');
    });

    it('should export inventory report to Excel', async () => {
      const exportData = {
        reportType: 'inventory',
        format: 'excel',
        category: 'food',
        includeCharts: true,
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/reports/export',
        exportData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/reports/export/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('downloadUrl');
      expect(responseData.data).toHaveProperty('filename');
      expect(responseData.data.filename).toContain('.xlsx');
    });

    it('should export performance report to PDF', async () => {
      const exportData = {
        reportType: 'performance',
        format: 'pdf',
        from: '2024-01-01',
        to: '2024-12-31',
        includeCharts: true,
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/reports/export',
        exportData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/reports/export/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('downloadUrl');
      expect(responseData.data).toHaveProperty('filename');
      expect(responseData.data.filename).toContain('.pdf');
    });

    it('should validate export parameters', async () => {
      const invalidExportData = {
        reportType: 'invalid_type',
        format: 'invalid_format',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/reports/export',
        invalidExportData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/reports/export/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should handle large data exports', async () => {
      const exportData = {
        reportType: 'sales',
        format: 'csv',
        from: '2020-01-01',
        to: '2024-12-31',
        includeCharts: false,
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/reports/export',
        exportData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST } = await import('../../app/api/admin/reports/export/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('downloadUrl');
    });
  });

  describe('GET /api/admin/reports/analytics', () => {
    it('should return business analytics dashboard', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/analytics',
        {
          period: 'month',
          compareWith: 'previous',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/analytics/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('revenueTrend');
      expect(responseData.data).toHaveProperty('orderTrend');
      expect(responseData.data).toHaveProperty('customerTrend');
      expect(responseData.data).toHaveProperty('inventoryTrend');
      expect(responseData.data).toHaveProperty('profitMargin');
      expect(responseData.data).toHaveProperty('growthRate');
      expect(responseData.data).toHaveProperty('kpis');
    });

    it('should return comparative analytics', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/analytics',
        {
          period: 'quarter',
          compareWith: 'year_ago',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/analytics/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('comparison');
      expect(responseData.data.comparison).toHaveProperty('revenueChange');
      expect(responseData.data.comparison).toHaveProperty('orderChange');
      expect(responseData.data.comparison).toHaveProperty('customerChange');
    });

    it('should return real-time analytics', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/analytics',
        {
          period: 'today',
          realTime: 'true',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { GET } = await import('../../app/api/admin/reports/analytics/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('liveOrders');
      expect(responseData.data).toHaveProperty('currentRevenue');
      expect(responseData.data).toHaveProperty('activeStaff');
    });
  });

  describe('Error Handling and Performance', () => {
    it('should handle malformed JSON in export requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/reports/export', {
        method: 'POST',
        headers: TestHelpers.createAdminHeaders(adminToken),
        body: 'invalid json',
      });

      const { POST } = await import('../../app/api/admin/reports/export/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should prevent unauthorized access to reports', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/reports/sales'
        // No auth headers
      );

      const { GET } = await import('../../app/api/admin/reports/sales/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should handle concurrent report requests', async () => {
      const reportPromises = Array.from({ length: 5 }, (_, i) => {
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
        return GET(request);
      });

      const responses = await Promise.all(reportPromises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle large date ranges efficiently', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/admin/reports/sales',
        {
          from: '2020-01-01',
          to: '2024-12-31',
        },
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const startTime = Date.now();
      const { GET } = await import('../../app/api/admin/reports/sales/route');
      const response = await GET(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle missing data gracefully', async () => {
      // Clear all orders to test empty data scenario
      const Order = mongoose.model('Order');
      await Order.deleteMany({});

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
      expect(responseData.data.totalSales).toBe(0);
      expect(responseData.data.totalOrders).toBe(0);
    });
  });
});








