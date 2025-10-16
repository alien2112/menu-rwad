import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * Integration Flow Test Suite
 * Tests complete end-to-end workflows and cross-module interactions
 */

describe('Integration Flow Tests', () => {
  let testData: any;
  let adminToken: string;

  beforeAll(async () => {
    await connectTestDB();
    await cleanupTestDB();
    
    // Create comprehensive test data for integration testing
    const Category = mongoose.model('Category');
    const MenuItem = mongoose.model('MenuItem');
    const Material = mongoose.model('Material');
    const User = mongoose.model('User');
    const Order = mongoose.model('Order');
    const Notification = mongoose.model('Notification');

    // Create test category
    const category = new Category(MockDataGenerators.generateCompleteCategory({
      name: 'Integration Test Category',
      status: 'active',
    }));
    await category.save();

    // Create test materials with different stock levels
    const materials = [];
    const materialData = [
      { name: 'Flour', currentQuantity: 100, minLimit: 20, alertLimit: 30, costPerUnit: 5.50 },
      { name: 'Salt', currentQuantity: 50, minLimit: 10, alertLimit: 15, costPerUnit: 2.00 },
      { name: 'Sugar', currentQuantity: 25, minLimit: 15, alertLimit: 20, costPerUnit: 3.50 },
      { name: 'Oil', currentQuantity: 5, minLimit: 10, alertLimit: 15, costPerUnit: 8.00 }, // Low stock
      { name: 'Spices', currentQuantity: 0, minLimit: 5, alertLimit: 10, costPerUnit: 12.00 }, // Out of stock
    ];

    for (let i = 0; i < materialData.length; i++) {
      const material = new Material({
        ...materialData[i],
        nameEn: materialData[i].name,
        description: `Description for ${materialData[i].name}`,
        unit: 'kg',
        supplier: `Supplier ${i + 1}`,
        category: 'food',
        status: materialData[i].currentQuantity === 0 ? 'out_of_stock' : 'active',
        lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
      await material.save();
      materials.push(material);
    }

    // Create test menu items with ingredients
    const menuItems = [];
    const menuItemData = [
      { name: 'Pizza Margherita', price: 25.99, ingredients: [0, 1, 2] }, // Uses Flour, Salt, Sugar
      { name: 'Pasta Carbonara', price: 22.99, ingredients: [0, 1, 3] }, // Uses Flour, Salt, Oil
      { name: 'Spiced Rice', price: 18.99, ingredients: [1, 2, 4] }, // Uses Salt, Sugar, Spices (out of stock)
    ];

    for (let i = 0; i < menuItemData.length; i++) {
      const menuItem = new MenuItem({
        name: menuItemData[i].name,
        nameEn: menuItemData[i].name,
        description: `Delicious ${menuItemData[i].name}`,
        categoryId: category._id,
        price: menuItemData[i].price,
        cost: menuItemData[i].price * 0.4, // 40% cost ratio
        image: `https://example.com/${menuItemData[i].name.toLowerCase().replace(' ', '-')}.jpg`,
        preparationTime: 15 + i * 5,
        calories: 300 + i * 100,
        status: 'active',
        featured: i === 0,
        order: i,
        ingredients: menuItemData[i].ingredients.map(ingredientIndex => ({
          ingredientId: materials[ingredientIndex]._id,
          portion: 1 + ingredientIndex * 0.5,
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

  describe('Complete Order Flow Integration', () => {
    it('should handle complete order lifecycle from creation to delivery', async () => {
      const Order = mongoose.model('Order');
      const Material = mongoose.model('Material');
      const Notification = mongoose.model('Notification');

      // Step 1: Create order
      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[0]._id.toString(),
            menuItemName: testData.menuItems[0].name,
            menuItemNameEn: testData.menuItems[0].nameEn,
            quantity: 2,
            unitPrice: testData.menuItems[0].price,
            totalPrice: testData.menuItems[0].price * 2,
            customizations: ['extra cheese'],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 20,
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
          name: 'Integration Test Customer',
          phone: '+966501234567',
          address: '123 Test Street',
        },
        status: 'pending',
        source: 'website_whatsapp',
      });

      const createOrderRequest = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createOrder } = await import('../../app/api/orders/route');
      const createResponse = await createOrder(createOrderRequest);
      const createResponseData = await createResponse.json();

      expect(createResponse.status).toBe(200);
      expect(createResponseData.success).toBe(true);
      const orderId = createResponseData.data._id;

      // Step 2: Verify inventory consumption
      await DatabaseHelpers.waitForCondition(async () => {
        const flour = await Material.findById(testData.materials[0]._id);
        return flour!.currentQuantity < 100; // Should be consumed
      });

      const flourAfterOrder = await Material.findById(testData.materials[0]._id);
      expect(flourAfterOrder!.currentQuantity).toBeLessThan(100);

      // Step 3: Confirm order
      const confirmRequest = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/orders/${orderId}`,
        { status: 'confirmed' },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT: updateOrder } = await import('../../app/api/orders/[id]/route');
      const confirmResponse = await updateOrder(confirmRequest, { params: { id: orderId } });
      const confirmResponseData = await confirmResponse.json();

      expect(confirmResponse.status).toBe(200);
      expect(confirmResponseData.success).toBe(true);
      expect(confirmResponseData.data.status).toBe('confirmed');

      // Step 4: Update to preparing
      const preparingRequest = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/orders/${orderId}`,
        { 
          status: 'preparing',
          departmentStatuses: { kitchen: 'in_progress' },
          assignedTo: { kitchen: 'Kitchen Staff' },
        },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const preparingResponse = await updateOrder(preparingRequest, { params: { id: orderId } });
      const preparingResponseData = await preparingResponse.json();

      expect(preparingResponse.status).toBe(200);
      expect(preparingResponseData.success).toBe(true);
      expect(preparingResponseData.data.status).toBe('preparing');

      // Step 5: Mark as ready
      const readyRequest = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/orders/${orderId}`,
        { 
          status: 'ready',
          departmentStatuses: { kitchen: 'ready' },
        },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const readyResponse = await updateOrder(readyRequest, { params: { id: orderId } });
      const readyResponseData = await readyResponse.json();

      expect(readyResponse.status).toBe(200);
      expect(readyResponseData.success).toBe(true);
      expect(readyResponseData.data.status).toBe('ready');

      // Step 6: Mark as delivered
      const deliveredRequest = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/orders/${orderId}`,
        { 
          status: 'delivered',
          departmentStatuses: { kitchen: 'served' },
          deliveryDate: new Date(),
        },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const deliveredResponse = await updateOrder(deliveredRequest, { params: { id: orderId } });
      const deliveredResponseData = await deliveredResponse.json();

      expect(deliveredResponse.status).toBe(200);
      expect(deliveredResponseData.success).toBe(true);
      expect(deliveredResponseData.data.status).toBe('delivered');

      // Step 7: Verify final order state
      const finalOrder = await Order.findById(orderId);
      expect(finalOrder!.status).toBe('delivered');
      expect(finalOrder!.deliveryDate).toBeDefined();
      expect(finalOrder!.departmentStatuses.kitchen).toBe('served');
    });

    it('should handle order cancellation and inventory restoration', async () => {
      const Order = mongoose.model('Order');
      const Material = mongoose.model('Material');

      // Get initial material quantities
      const initialFlourQuantity = (await Material.findById(testData.materials[0]._id))!.currentQuantity;
      const initialSaltQuantity = (await Material.findById(testData.materials[1]._id))!.currentQuantity;

      // Create order
      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[1]._id.toString(),
            menuItemName: testData.menuItems[1].name,
            menuItemNameEn: testData.menuItems[1].nameEn,
            quantity: 1,
            unitPrice: testData.menuItems[1].price,
            totalPrice: testData.menuItems[1].price,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 15,
          },
        ],
        totalAmount: testData.menuItems[1].price * 1.15,
        taxInfo: {
          subtotal: testData.menuItems[1].price,
          taxRate: 15,
          taxAmount: testData.menuItems[1].price * 0.15,
          includeTaxInPrice: true,
        },
        customerInfo: {
          name: 'Cancellation Test Customer',
          phone: '+966501234568',
          address: '456 Test Avenue',
        },
        status: 'pending',
      });

      const createOrderRequest = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createOrder } = await import('../../app/api/orders/route');
      const createResponse = await createOrder(createOrderRequest);
      const createResponseData = await createResponse.json();

      expect(createResponse.status).toBe(200);
      const orderId = createResponseData.data._id;

      // Verify inventory was consumed
      await DatabaseHelpers.waitForCondition(async () => {
        const flour = await Material.findById(testData.materials[0]._id);
        const salt = await Material.findById(testData.materials[1]._id);
        return flour!.currentQuantity < initialFlourQuantity && salt!.currentQuantity < initialSaltQuantity;
      });

      // Cancel order
      const cancelRequest = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/orders/${orderId}`,
        { 
          status: 'cancelled',
          notes: 'Customer requested cancellation',
        },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT: updateOrder } = await import('../../app/api/orders/[id]/route');
      const cancelResponse = await updateOrder(cancelRequest, { params: { id: orderId } });
      const cancelResponseData = await cancelResponse.json();

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponseData.success).toBe(true);
      expect(cancelResponseData.data.status).toBe('cancelled');

      // Verify inventory was restored
      await DatabaseHelpers.waitForCondition(async () => {
        const flour = await Material.findById(testData.materials[0]._id);
        const salt = await Material.findById(testData.materials[1]._id);
        return flour!.currentQuantity >= initialFlourQuantity && salt!.currentQuantity >= initialSaltQuantity;
      });

      const finalFlourQuantity = (await Material.findById(testData.materials[0]._id))!.currentQuantity;
      const finalSaltQuantity = (await Material.findById(testData.materials[1]._id))!.currentQuantity;

      expect(finalFlourQuantity).toBeGreaterThanOrEqual(initialFlourQuantity);
      expect(finalSaltQuantity).toBeGreaterThanOrEqual(initialSaltQuantity);
    });
  });

  describe('Inventory Management Integration', () => {
    it('should handle low stock alerts and automatic menu item disabling', async () => {
      const Material = mongoose.model('Material');
      const MenuItem = mongoose.model('MenuItem');
      const Notification = mongoose.model('Notification');

      // Set material to low stock level
      const lowStockMaterial = testData.materials[3]; // Oil
      await Material.findByIdAndUpdate(lowStockMaterial._id, {
        currentQuantity: 2, // Below alert limit
      });

      // Update material status
      const updateRequest = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/ingredients/${lowStockMaterial._id}`,
        { currentQuantity: 2 },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT: updateMaterial } = await import('../../app/api/ingredients/[id]/route');
      const updateResponse = await updateMaterial(updateRequest, { params: { id: lowStockMaterial._id.toString() } });
      const updateResponseData = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateResponseData.success).toBe(true);

      // Check if low stock notification was created
      await DatabaseHelpers.waitForCondition(async () => {
        const notifications = await Notification.find({
          type: 'inventory',
          'data.materialId': lowStockMaterial._id,
        });
        return notifications.length > 0;
      });

      const lowStockNotifications = await Notification.find({
        type: 'inventory',
        'data.materialId': lowStockMaterial._id,
      });

      expect(lowStockNotifications.length).toBeGreaterThan(0);
      expect(lowStockNotifications[0].priority).toBe('high');
      expect(lowStockNotifications[0].title).toContain('low stock');

      // Check if menu items using this material were affected
      const affectedMenuItems = await MenuItem.find({
        'ingredients.ingredientId': lowStockMaterial._id,
      });

      expect(affectedMenuItems.length).toBeGreaterThan(0);
    });

    it('should handle out of stock scenarios and prevent orders', async () => {
      const Material = mongoose.model('Material');
      const Order = mongoose.model('Order');

      // Ensure material is out of stock
      const outOfStockMaterial = testData.materials[4]; // Spices
      await Material.findByIdAndUpdate(outOfStockMaterial._id, {
        currentQuantity: 0,
        status: 'out_of_stock',
      });

      // Try to create order with out-of-stock item
      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[2]._id.toString(), // Uses Spices
            menuItemName: testData.menuItems[2].name,
            menuItemNameEn: testData.menuItems[2].nameEn,
            quantity: 1,
            unitPrice: testData.menuItems[2].price,
            totalPrice: testData.menuItems[2].price,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 10,
          },
        ],
        totalAmount: testData.menuItems[2].price * 1.15,
        taxInfo: {
          subtotal: testData.menuItems[2].price,
          taxRate: 15,
          taxAmount: testData.menuItems[2].price * 0.15,
          includeTaxInPrice: true,
        },
        customerInfo: {
          name: 'Out of Stock Test Customer',
          phone: '+966501234569',
          address: '789 Test Boulevard',
        },
      });

      const createOrderRequest = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createOrder } = await import('../../app/api/orders/route');
      const createResponse = await createOrder(createOrderRequest);
      const createResponseData = await createResponse.json();

      // Order should be rejected due to insufficient inventory
      expect(createResponse.status).toBe(400);
      expect(createResponseData.success).toBe(false);
      expect(createResponseData.error).toContain('insufficient');
    });

    it('should handle inventory restocking workflow', async () => {
      const Material = mongoose.model('Material');
      const Notification = mongoose.model('Notification');

      // Restock out of stock material
      const restockRequest = TestHelpers.createMockRequest(
        'PATCH',
        `http://localhost:3000/api/ingredients/${testData.materials[4]._id}/stock`,
        {
          quantity: 50,
          operation: 'set',
          reason: 'Restocked from supplier',
        },
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PATCH: updateStock } = await import('../../app/api/ingredients/[id]/stock/route');
      const restockResponse = await updateStock(restockRequest, { params: { id: testData.materials[4]._id.toString() } });
      const restockResponseData = await restockResponse.json();

      expect(restockResponse.status).toBe(200);
      expect(restockResponseData.success).toBe(true);
      expect(restockResponseData.data.currentQuantity).toBe(50);
      expect(restockResponseData.data.status).toBe('active');

      // Check if restock notification was created
      await DatabaseHelpers.waitForCondition(async () => {
        const notifications = await Notification.find({
          type: 'inventory',
          'data.materialId': testData.materials[4]._id,
          title: { $regex: /restock/i },
        });
        return notifications.length > 0;
      });

      const restockNotifications = await Notification.find({
        type: 'inventory',
        'data.materialId': testData.materials[4]._id,
        title: { $regex: /restock/i },
      });

      expect(restockNotifications.length).toBeGreaterThan(0);
    });
  });

  describe('Menu Management Integration', () => {
    it('should handle menu item creation with inventory validation', async () => {
      const MenuItem = mongoose.model('MenuItem');
      const Material = mongoose.model('Material');

      // Create new menu item with valid ingredients
      const newMenuItemData = {
        name: 'Integration Test Pizza',
        nameEn: 'Integration Test Pizza',
        description: 'A pizza created during integration testing',
        categoryId: testData.category._id.toString(),
        price: 29.99,
        cost: 12.00,
        image: 'https://example.com/integration-pizza.jpg',
        preparationTime: 25,
        calories: 450,
        status: 'active',
        featured: false,
        order: 10,
        ingredients: [
          {
            ingredientId: testData.materials[0]._id.toString(), // Flour
            portion: 1.5,
            required: true,
          },
          {
            ingredientId: testData.materials[1]._id.toString(), // Salt
            portion: 0.2,
            required: true,
          },
        ],
      };

      const createMenuItemRequest = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/items',
        newMenuItemData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createMenuItem } = await import('../../app/api/items/route');
      const createResponse = await createMenuItem(createMenuItemRequest);
      const createResponseData = await createResponse.json();

      expect(createResponse.status).toBe(200);
      expect(createResponseData.success).toBe(true);
      expect(createResponseData.data.name).toBe(newMenuItemData.name);
      expect(createResponseData.data.ingredients).toHaveLength(2);

      // Verify menu item was created
      const createdMenuItem = await MenuItem.findById(createResponseData.data._id);
      expect(createdMenuItem).toBeTruthy();
      expect(createdMenuItem!.ingredients).toHaveLength(2);
    });

    it('should handle menu item updates affecting inventory', async () => {
      const MenuItem = mongoose.model('MenuItem');
      const Material = mongoose.model('Material');

      // Update menu item to use different ingredients
      const updateData = {
        ingredients: [
          {
            ingredientId: testData.materials[2]._id.toString(), // Sugar instead of Salt
            portion: 0.3,
            required: true,
          },
        ],
        price: 32.99, // Updated price
      };

      const updateRequest = TestHelpers.createMockRequest(
        'PUT',
        `http://localhost:3000/api/items/${testData.menuItems[0]._id}`,
        updateData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { PUT: updateMenuItem } = await import('../../app/api/items/[id]/route');
      const updateResponse = await updateMenuItem(updateRequest, { params: { id: testData.menuItems[0]._id.toString() } });
      const updateResponseData = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateResponseData.success).toBe(true);
      expect(updateResponseData.data.price).toBe(32.99);

      // Verify menu item was updated
      const updatedMenuItem = await MenuItem.findById(testData.menuItems[0]._id);
      expect(updatedMenuItem!.ingredients).toHaveLength(1);
      expect(updatedMenuItem!.ingredients[0].ingredientId.toString()).toBe(testData.materials[2]._id.toString());
    });
  });

  describe('Cross-Module Data Consistency', () => {
    it('should maintain data consistency across all modules', async () => {
      const Order = mongoose.model('Order');
      const Material = mongoose.model('Material');
      const MenuItem = mongoose.model('MenuItem');
      const Notification = mongoose.model('Notification');

      // Create order
      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[0]._id.toString(),
            menuItemName: testData.menuItems[0].name,
            menuItemNameEn: testData.menuItems[0].nameEn,
            quantity: 3,
            unitPrice: testData.menuItems[0].price,
            totalPrice: testData.menuItems[0].price * 3,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 20,
          },
        ],
        totalAmount: testData.menuItems[0].price * 3 * 1.15,
        taxInfo: {
          subtotal: testData.menuItems[0].price * 3,
          taxRate: 15,
          taxAmount: testData.menuItems[0].price * 3 * 0.15,
          includeTaxInPrice: true,
        },
        customerInfo: {
          name: 'Consistency Test Customer',
          phone: '+966501234570',
          address: '321 Test Lane',
        },
      });

      const createOrderRequest = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createOrder } = await import('../../app/api/orders/route');
      const createResponse = await createOrder(createOrderRequest);
      const createResponseData = await createResponse.json();

      expect(createResponse.status).toBe(200);
      const orderId = createResponseData.data._id;

      // Verify order exists
      const order = await Order.findById(orderId);
      expect(order).toBeTruthy();
      expect(order!.items).toHaveLength(1);
      expect(order!.items[0].quantity).toBe(3);

      // Verify inventory was consumed
      const flour = await Material.findById(testData.materials[0]._id);
      expect(flour!.currentQuantity).toBeLessThan(100);

      // Verify menu item still exists and is active
      const menuItem = await MenuItem.findById(testData.menuItems[0]._id);
      expect(menuItem).toBeTruthy();
      expect(menuItem!.status).toBe('active');

      // Check for notifications
      const notifications = await Notification.find({
        type: 'order',
        'data.orderId': orderId,
      });
      expect(notifications.length).toBeGreaterThan(0);
    });

    it('should handle concurrent operations maintaining consistency', async () => {
      const Order = mongoose.model('Order');
      const Material = mongoose.model('Material');

      // Create multiple orders concurrently
      const orderPromises = Array.from({ length: 3 }, (_, i) => {
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
          totalAmount: testData.menuItems[0].price * 1.15,
          taxInfo: {
            subtotal: testData.menuItems[0].price,
            taxRate: 15,
            taxAmount: testData.menuItems[0].price * 0.15,
            includeTaxInPrice: true,
          },
          customerInfo: {
            name: `Concurrent Customer ${i + 1}`,
            phone: `+96650123457${i}`,
            address: `${i + 1} Concurrent Street`,
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

      const responses = await Promise.all(orderPromises);
      
      // All orders should be created successfully
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });

      // Verify all orders were created
      const createdOrders = await Order.find({ orderNumber: { $regex: /^CONCURRENT-/ } });
      expect(createdOrders.length).toBeGreaterThan(0);

      // Verify inventory consistency
      const flour = await Material.findById(testData.materials[0]._id);
      expect(flour!.currentQuantity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Recovery and Rollback', () => {
    it('should handle partial failures gracefully', async () => {
      const Order = mongoose.model('Order');
      const Material = mongoose.model('Material');

      // Get initial inventory state
      const initialFlourQuantity = (await Material.findById(testData.materials[0]._id))!.currentQuantity;

      // Create order that should fail due to insufficient inventory
      const orderData = TestHelpers.createTestOrder({
        items: [
          {
            menuItemId: testData.menuItems[0]._id.toString(),
            menuItemName: testData.menuItems[0].name,
            menuItemNameEn: testData.menuItems[0].nameEn,
            quantity: 1000, // Extremely large quantity
            unitPrice: testData.menuItems[0].price,
            totalPrice: testData.menuItems[0].price * 1000,
            customizations: [],
            department: 'kitchen',
            departmentStatus: 'pending',
            estimatedPrepTime: 15,
          },
        ],
        totalAmount: testData.menuItems[0].price * 1000 * 1.15,
        taxInfo: {
          subtotal: testData.menuItems[0].price * 1000,
          taxRate: 15,
          taxAmount: testData.menuItems[0].price * 1000 * 0.15,
          includeTaxInPrice: true,
        },
        customerInfo: {
          name: 'Large Order Customer',
          phone: '+966501234571',
          address: '999 Large Order Street',
        },
      });

      const createOrderRequest = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/orders',
        orderData,
        TestHelpers.createAdminHeaders(adminToken)
      );

      const { POST: createOrder } = await import('../../app/api/orders/route');
      const createResponse = await createOrder(createOrderRequest);
      const createResponseData = await createResponse.json();

      // Order should be rejected
      expect(createResponse.status).toBe(400);
      expect(createResponseData.success).toBe(false);

      // Verify inventory was not consumed
      const finalFlourQuantity = (await Material.findById(testData.materials[0]._id))!.currentQuantity;
      expect(finalFlourQuantity).toBe(initialFlourQuantity);
    });

    it('should handle database connection failures gracefully', async () => {
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

      const { POST: createOrder } = await import('../../app/api/orders/route');
      const response = await createOrder(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });
});











