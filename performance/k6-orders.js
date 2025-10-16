import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
    errors: ['rate<0.1'],
  },
};

// Test data
const BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'Bearer test-admin-token';

// Helper functions
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomDate() {
  const start = new Date('2024-01-01');
  const end = new Date('2024-12-31');
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

// Test scenarios
export default function() {
  const scenario = getRandomInt(1, 5);
  
  switch (scenario) {
    case 1:
      testMenuItemsAPI();
      break;
    case 2:
      testOrdersAPI();
      break;
    case 3:
      testInventoryAPI();
      break;
    case 4:
      testAdminDashboardAPI();
      break;
    case 5:
      testReportsAPI();
      break;
  }
  
  sleep(1);
}

function testMenuItemsAPI() {
  const params = {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  };

  // Test GET /api/items with pagination
  const getResponse = http.get(`${BASE_URL}/api/items?page=${getRandomInt(1, 10)}&limit=${getRandomInt(10, 50)}`, params);
  
  check(getResponse, {
    'Menu items GET status is 200': (r) => r.status === 200,
    'Menu items response time < 1000ms': (r) => r.timings.duration < 1000,
    'Menu items response has data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.success === true && Array.isArray(data.data);
      } catch (e) {
        return false;
      }
    },
  }) || errorRate.add(1);

  // Test search functionality
  const searchResponse = http.get(`${BASE_URL}/api/items?search=${getRandomString(5)}`, params);
  
  check(searchResponse, {
    'Menu items search status is 200': (r) => r.status === 200,
    'Menu items search response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);
}

function testOrdersAPI() {
  const params = {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  };

  // Test GET /api/orders
  const getResponse = http.get(`${BASE_URL}/api/orders?page=${getRandomInt(1, 5)}&limit=${getRandomInt(10, 30)}`, params);
  
  check(getResponse, {
    'Orders GET status is 200': (r) => r.status === 200,
    'Orders response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  // Test POST /api/orders
  const orderData = {
    orderNumber: `K6-${getRandomString(8)}`,
    items: [
      {
        menuItemId: getRandomString(24),
        menuItemName: 'K6 Test Item',
        menuItemNameEn: 'K6 Test Item',
        quantity: getRandomInt(1, 5),
        unitPrice: getRandomInt(10, 50),
        totalPrice: getRandomInt(10, 50),
        customizations: [],
        department: 'kitchen',
        departmentStatus: 'pending',
        estimatedPrepTime: 15,
      },
    ],
    totalAmount: getRandomInt(50, 200),
    discountAmount: 0,
    taxInfo: {
      subtotal: getRandomInt(50, 200),
      taxRate: 15,
      taxAmount: getRandomInt(5, 30),
      includeTaxInPrice: true,
    },
    customerInfo: {
      name: `K6 Customer ${getRandomString(6)}`,
      phone: '+966501234567',
      address: 'K6 Test Address',
    },
    status: 'pending',
    orderDate: getRandomDate(),
    source: 'website_whatsapp',
    departmentStatuses: {
      kitchen: 'pending',
      barista: 'pending',
      shisha: 'pending',
    },
  };

  const postResponse = http.post(`${BASE_URL}/api/orders`, JSON.stringify(orderData), params);
  
  check(postResponse, {
    'Orders POST status is 200 or 400': (r) => r.status === 200 || r.status === 400,
    'Orders POST response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
}

function testInventoryAPI() {
  const params = {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  };

  // Test GET /api/ingredients
  const getResponse = http.get(`${BASE_URL}/api/ingredients?page=${getRandomInt(1, 5)}&limit=${getRandomInt(10, 30)}`, params);
  
  check(getResponse, {
    'Inventory GET status is 200': (r) => r.status === 200,
    'Inventory response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  // Test PUT /api/ingredients/[id] (update stock)
  const updateData = {
    currentQuantity: getRandomInt(0, 100),
    minLimit: getRandomInt(5, 20),
    alertLimit: getRandomInt(10, 30),
  };

  const putResponse = http.put(`${BASE_URL}/api/ingredients/${getRandomString(24)}`, JSON.stringify(updateData), params);
  
  check(putResponse, {
    'Inventory PUT status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'Inventory PUT response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);
}

function testAdminDashboardAPI() {
  const params = {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  };

  // Test GET /api/admin/dashboard
  const dashboardResponse = http.get(`${BASE_URL}/api/admin/dashboard`, params);
  
  check(dashboardResponse, {
    'Admin dashboard status is 200': (r) => r.status === 200,
    'Admin dashboard response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  // Test GET /api/admin/reports/sales
  const salesResponse = http.get(`${BASE_URL}/api/admin/reports/sales?from=2024-01-01&to=2024-12-31`, params);
  
  check(salesResponse, {
    'Sales report status is 200': (r) => r.status === 200,
    'Sales report response time < 3000ms': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);
}

function testReportsAPI() {
  const params = {
    headers: {
      'Authorization': AUTH_TOKEN,
      'Content-Type': 'application/json',
    },
  };

  // Test GET /api/admin/reports/inventory
  const inventoryReportResponse = http.get(`${BASE_URL}/api/admin/reports/inventory`, params);
  
  check(inventoryReportResponse, {
    'Inventory report status is 200': (r) => r.status === 200,
    'Inventory report response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  // Test POST /api/admin/reports/export
  const exportData = {
    reportType: 'sales',
    format: 'csv',
    from: '2024-01-01',
    to: '2024-12-31',
    includeCharts: false,
  };

  const exportResponse = http.post(`${BASE_URL}/api/admin/reports/export`, JSON.stringify(exportData), params);
  
  check(exportResponse, {
    'Export report status is 200': (r) => r.status === 200,
    'Export report response time < 5000ms': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('Starting K6 load test for Restaurant Management System');
  
  // Verify API is accessible
  const healthCheck = http.get(`${BASE_URL}/api/items?page=1&limit=1`);
  if (healthCheck.status !== 200) {
    throw new Error('API is not accessible');
  }
  
  console.log('API health check passed');
  return { timestamp: new Date().toISOString() };
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log(`Load test completed at ${data.timestamp}`);
}










