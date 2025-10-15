import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers, PerformanceHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * Performance and Load Testing Suite
 * Tests system performance under various load conditions
 */

describe('Performance and Load Tests', () => {
  let testData: any;
  let adminToken: string;

  beforeAll(async () => {
    await connectTestDB();
    await cleanupTestDB();
    
    // Create test data for performance testing
    const Category = mongoose.model('Category');
    const MenuItem = mongoose.model('MenuItem');
    const Material = mongoose.model('Material');
    const User = mongoose.model('User');

    // Create test category
    const category = new Category(MockDataGenerators.generateCompleteCategory());
    await category.save();

    // Create test materials
    const materials = [];
    for (let i = 0; i < 20; i++) {
      const material = new Material(MockDataGenerators.generateCompleteMaterial({
        name: `Perf Test Material ${i + 1}`,
        currentQuantity: 1000, // High quantity for load testing
        minLimit: 10,
        alertLimit: 20,
      }));
      await material.save();
      materials.push(material);
    }

    // Create test menu items
    const menuItems = [];
    for (let i = 0; i < 50; i++) {
      const menuItem = new MenuItem({
        ...MockDataGenerators.generateCompleteMenuItem(),
        categoryId: category._id,
        name: `Perf Test Item ${i + 1}`,
        price: 20 + i * 2,
        status: 'active',
        ingredients: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
          ingredientId: materials[Math.floor(Math.random() * materials.length)]._id,
          portion: Math.random() * 2 + 0.1,
          required: true,
        })),
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

  describe('API Response Time Tests', () => {
    it('should respond to menu items request within acceptable time', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { page: '1', limit: '20' }
      );

      const { result, duration } = await PerformanceHelpers.measureTime(async () => {
        const { GET } = await import('../../app/api/items/route');
        return await GET(request);
      });

      expect(result.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle pagination efficiently', async () => {
      const pageSizes = [10, 20, 50, 100];
      
      for (const pageSize of pageSizes) {
        const request = TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { page: '1', limit: pageSize.toString() }
        );

        const { result, duration } = await PerformanceHelpers.measureTime(async () => {
          const { GET } = await import('../../app/api/items/route');
          return await GET(request);
        });

        expect(result.status).toBe(200);
        expect(duration).toBeLessThan(2000); // Should respond within 2 seconds even for large pages
      }
    });

    it('should handle search queries efficiently', async () => {
      const searchTerms = ['Perf Test', 'Item 1', 'Material', 'Test'];
      
      for (const searchTerm of searchTerms) {
        const request = TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { search: searchTerm }
        );

        const { result, duration } = await PerformanceHelpers.measureTime(async () => {
          const { GET } = await import('../../app/api/items/route');
          return await GET(request);
        });

        expect(result.status).toBe(200);
        expect(duration).toBeLessThan(1500); // Search should be fast
      }
    });

    it('should handle inventory queries efficiently', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/ingredients',
        { page: '1', limit: '50' }
      );

      const { result, duration } = await PerformanceHelpers.measureTime(async () => {
        const { GET } = await import('../../app/api/ingredients/route');
        return await GET(request);
      });

      expect(result.status).toBe(200);
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent menu item requests', async () => {
      const concurrentRequests = Array.from({ length: 20 }, () => {
        const request = TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { page: '1', limit: '10' }
        );

        const { GET } = await import('../../app/api/items/route');
        return GET(request);
      });

      const startTime = Date.now();
      const responses = await PerformanceHelpers.runConcurrent(concurrentRequests, 10);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should handle concurrent order creation requests', async () => {
      const orderPromises = Array.from({ length: 10 }, (_, i) => {
        const orderData = TestHelpers.createTestOrder({
          orderNumber: `PERF-${i + 1}`,
          items: [
            {
              menuItemId: testData.menuItems[i % testData.menuItems.length]._id.toString(),
              menuItemName: testData.menuItems[i % testData.menuItems.length].name,
              menuItemNameEn: testData.menuItems[i % testData.menuItems.length].nameEn,
              quantity: 1,
              unitPrice: testData.menuItems[i % testData.menuItems.length].price,
              totalPrice: testData.menuItems[i % testData.menuItems.length].price,
              customizations: [],
              department: 'kitchen',
              departmentStatus: 'pending',
              estimatedPrepTime: 15,
            },
          ],
          totalAmount: testData.menuItems[i % testData.menuItems.length].price * 1.15,
          taxInfo: {
            subtotal: testData.menuItems[i % testData.menuItems.length].price,
            taxRate: 15,
            taxAmount: testData.menuItems[i % testData.menuItems.length].price * 0.15,
            includeTaxInPrice: true,
          },
          customerInfo: {
            name: `Perf Customer ${i + 1}`,
            phone: `+96650123457${i}`,
            address: `${i + 1} Performance Street`,
          },
        });

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/orders',
          orderData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { POST: createOrder } = await import('../../app/api/orders/route');
        return createOrder(request);
      });

      const startTime = Date.now();
      const responses = await PerformanceHelpers.runConcurrent(orderPromises, 5);
      const endTime = Date.now();

      // Most requests should succeed (some might fail due to inventory constraints)
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(5);

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(10000);
    });

    it('should handle concurrent inventory updates', async () => {
      const Material = mongoose.model('Material');
      const material = testData.materials[0];

      const updatePromises = Array.from({ length: 15 }, (_, i) => {
        const updateData = {
          currentQuantity: 1000 + i,
        };

        const request = TestHelpers.createMockRequest(
          'PUT',
          `http://localhost:3000/api/ingredients/${material._id}`,
          updateData,
          TestHelpers.createAdminHeaders(adminToken)
        );

        const { PUT: updateMaterial } = await import('../../app/api/ingredients/[id]/route');
        return updateMaterial(request, { params: { id: material._id.toString() } });
      });

      const startTime = Date.now();
      const responses = await PerformanceHelpers.runConcurrent(updatePromises, 5);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(8000);
    });
  });

  describe('Database Performance Tests', () => {
    it('should handle large dataset queries efficiently', async () => {
      // Create additional test data for large dataset testing
      const MenuItem = mongoose.model('MenuItem');
      const largeDatasetItems = [];

      for (let i = 0; i < 100; i++) {
        const menuItem = new MenuItem({
          ...MockDataGenerators.generateCompleteMenuItem(),
          categoryId: testData.category._id,
          name: `Large Dataset Item ${i + 1}`,
          price: 15 + i * 0.5,
          status: 'active',
        });
        largeDatasetItems.push(menuItem);
      }

      await MenuItem.insertMany(largeDatasetItems);

      // Test query performance on large dataset
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { page: '1', limit: '100' }
      );

      const { result, duration } = await PerformanceHelpers.measureTime(async () => {
        const { GET } = await import('../../app/api/items/route');
        return await GET(request);
      });

      expect(result.status).toBe(200);
      expect(duration).toBeLessThan(2000); // Should handle large datasets efficiently

      // Clean up
      await MenuItem.deleteMany({ name: { $regex: /^Large Dataset Item/ } });
    });

    it('should handle complex aggregation queries efficiently', async () => {
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

      const { result, duration } = await PerformanceHelpers.measureTime(async () => {
        const { GET } = await import('../../app/api/admin/reports/sales/route');
        return await GET(request);
      });

      expect(result.status).toBe(200);
      expect(duration).toBeLessThan(3000); // Complex aggregations should complete within 3 seconds
    });

    it('should handle bulk operations efficiently', async () => {
      const bulkUpdateData = {
        items: Array.from({ length: 20 }, (_, i) => ({
          id: testData.menuItems[i]._id.toString(),
          price: 25 + i * 2,
          status: 'active',
        })),
        reason: 'Bulk performance test update',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/admin/menu/bulk-update',
        bulkUpdateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { result, duration } = await PerformanceHelpers.measureTime(async () => {
        const { POST: bulkUpdate } = await import('../../app/api/admin/menu/bulk-update/route');
        return await bulkUpdate(request);
      });

      expect(result.status).toBe(200);
      expect(duration).toBeLessThan(5000); // Bulk operations should complete within 5 seconds
    });
  });

  describe('Memory Usage Tests', () => {
    it('should handle memory efficiently during large operations', async () => {
      const initialMemory = process.memoryUsage();

      // Perform memory-intensive operations
      const operations = Array.from({ length: 50 }, (_, i) => {
        const request = TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { page: (i + 1).toString(), limit: '20' }
        );

        const { GET } = await import('../../app/api/items/route');
        return GET(request);
      });

      await Promise.all(operations);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should handle large payload responses efficiently', async () => {
      const request = TestHelpers.createMockRequestWithParams(
        'GET',
        'http://localhost:3000/api/items',
        { page: '1', limit: '100' }
      );

      const { result, duration } = await PerformanceHelpers.measureTime(async () => {
        const { GET } = await import('../../app/api/items/route');
        return await GET(request);
      });

      expect(result.status).toBe(200);
      expect(duration).toBeLessThan(2000);

      // Verify response size is reasonable
      const responseData = await result.json();
      expect(responseData.data.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Stress Testing', () => {
    it('should maintain stability under high load', async () => {
      const highLoadOperations = Array.from({ length: 100 }, (_, i) => {
        const request = TestHelpers.createMockRequestWithParams(
          'GET',
          'http://localhost:3000/api/items',
          { 
            page: (i % 10 + 1).toString(), 
            limit: '10',
            search: i % 2 === 0 ? 'Perf Test' : undefined,
          }
        );

        const { GET } = await import('../../app/api/items/route');
        return GET(request);
      });

      const startTime = Date.now();
      const responses = await PerformanceHelpers.runConcurrent(highLoadOperations, 20);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time even under high load
      expect(endTime - startTime).toBeLessThan(15000);
    });

    it('should handle mixed workload efficiently', async () => {
      const mixedOperations = [
        // Read operations
        ...Array.from({ length: 20 }, () => {
          const request = TestHelpers.createMockRequestWithParams(
            'GET',
            'http://localhost:3000/api/items',
            { page: '1', limit: '10' }
          );
          const { GET } = await import('../../app/api/items/route');
          return GET(request);
        }),
        // Write operations
        ...Array.from({ length: 10 }, (_, i) => {
          const orderData = TestHelpers.createTestOrder({
            orderNumber: `MIXED-${i + 1}`,
            items: [
              {
                menuItemId: testData.menuItems[i % testData.menuItems.length]._id.toString(),
                menuItemName: testData.menuItems[i % testData.menuItems.length].name,
                menuItemNameEn: testData.menuItems[i % testData.menuItems.length].nameEn,
                quantity: 1,
                unitPrice: testData.menuItems[i % testData.menuItems.length].price,
                totalPrice: testData.menuItems[i % testData.menuItems.length].price,
                customizations: [],
                department: 'kitchen',
                departmentStatus: 'pending',
                estimatedPrepTime: 15,
              },
            ],
            totalAmount: testData.menuItems[i % testData.menuItems.length].price * 1.15,
            taxInfo: {
              subtotal: testData.menuItems[i % testData.menuItems.length].price,
              taxRate: 15,
              taxAmount: testData.menuItems[i % testData.menuItems.length].price * 0.15,
              includeTaxInPrice: true,
            },
            customerInfo: {
              name: `Mixed Customer ${i + 1}`,
              phone: `+96650123457${i}`,
              address: `${i + 1} Mixed Street`,
            },
          });

          const request = TestHelpers.createMockRequest(
            'POST',
            'http://localhost:3000/api/orders',
            orderData,
            TestHelpers.createAdminHeaders(adminToken)
          );
          const { POST: createOrder } = await import('../../app/api/orders/route');
          return createOrder(request);
        }),
        // Update operations
        ...Array.from({ length: 10 }, (_, i) => {
          const updateData = {
            currentQuantity: 1000 + i,
          };

          const request = TestHelpers.createMockRequest(
            'PUT',
            `http://localhost:3000/api/ingredients/${testData.materials[i % testData.materials.length]._id}`,
            updateData,
            TestHelpers.createAdminHeaders(adminToken)
          );
          const { PUT: updateMaterial } = await import('../../app/api/ingredients/[id]/route');
          return updateMaterial(request, { params: { id: testData.materials[i % testData.materials.length]._id.toString() } });
        }),
      ];

      const startTime = Date.now();
      const responses = await PerformanceHelpers.runConcurrent(mixedOperations, 15);
      const endTime = Date.now();

      // Most operations should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(30); // At least 75% should succeed

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(20000);
    });
  });

  describe('Error Handling Under Load', () => {
    it('should handle errors gracefully under high load', async () => {
      const errorProneOperations = Array.from({ length: 50 }, (_, i) => {
        // Mix of valid and invalid requests
        if (i % 3 === 0) {
          // Invalid request
          const request = TestHelpers.createMockRequestWithParams(
            'GET',
            'http://localhost:3000/api/items',
            { page: 'invalid', limit: 'invalid' }
          );
          const { GET } = await import('../../app/api/items/route');
          return GET(request);
        } else {
          // Valid request
          const request = TestHelpers.createMockRequestWithParams(
            'GET',
            'http://localhost:3000/api/items',
            { page: '1', limit: '10' }
          );
          const { GET } = await import('../../app/api/items/route');
          return GET(request);
        }
      });

      const responses = await PerformanceHelpers.runConcurrent(errorProneOperations, 10);

      // Valid requests should succeed, invalid ones should fail gracefully
      responses.forEach((response, index) => {
        if (index % 3 === 0) {
          // Invalid requests should return error status
          expect([400, 422]).toContain(response.status);
        } else {
          // Valid requests should succeed
          expect(response.status).toBe(200);
        }
      });
    });

    it('should maintain system stability during error conditions', async () => {
      // Test system stability by mixing normal operations with error conditions
      const stabilityOperations = Array.from({ length: 30 }, (_, i) => {
        if (i % 5 === 0) {
          // Malformed request
          const request = new NextRequest('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: TestHelpers.createAdminHeaders(adminToken),
            body: 'malformed json',
          });
          const { POST: createOrder } = await import('../../app/api/orders/route');
          return createOrder(request);
        } else {
          // Normal request
          const request = TestHelpers.createMockRequestWithParams(
            'GET',
            'http://localhost:3000/api/items',
            { page: '1', limit: '5' }
          );
          const { GET } = await import('../../app/api/items/route');
          return GET(request);
        }
      });

      const responses = await PerformanceHelpers.runConcurrent(stabilityOperations, 10);

      // System should remain stable and handle both success and error cases
      responses.forEach((response, index) => {
        if (index % 5 === 0) {
          expect(response.status).toBe(400); // Malformed requests should return 400
        } else {
          expect(response.status).toBe(200); // Normal requests should succeed
        }
      });
    });
  });
});







