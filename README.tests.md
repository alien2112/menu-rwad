# 🧪 **Complete API Testing Suite - Restaurant Management System**

## 📋 **Overview**

This comprehensive testing suite provides complete API testing coverage for the Restaurant Management System built with Next.js, MongoDB, and WebSocket notifications. The test suite includes functional tests, integration tests, performance tests, security tests, and WebSocket testing.

## 🏗️ **Test Architecture**

### **Test Structure**
```
tests/
├── setup.ts                    # Test setup and configuration
├── global-setup.ts             # Global test database setup
├── global-teardown.ts          # Global cleanup
├── utils/
│   ├── test-helpers.ts         # Test utilities and assertions
│   └── mockGenerators.ts       # Mock data generators
├── seed/
│   └── seed.ts                 # Database seeding script
├── menu.test.ts                # Menu items API tests
├── orders.test.ts              # Orders API tests
├── inventory.test.ts           # Inventory/Materials API tests
├── auth.test.ts                # Authentication API tests
├── admin.test.ts               # Admin API tests
├── reports.test.ts             # Reports API tests
├── notifications.test.ts       # WebSocket notification tests
├── integration-flow.test.ts     # End-to-end integration tests
├── performance-smoke.test.ts   # Performance and load tests
└── security.test.ts            # Security and vulnerability tests
```

### **Configuration Files**
```
├── jest.config.ts              # Jest configuration
├── tsconfig.test.json          # TypeScript test configuration
├── package.test.json           # Test dependencies
└── performance/
    ├── artillery-orders.yaml   # Artillery load testing config
    └── k6-orders.js            # K6 load testing script
```

## 🚀 **Quick Start**

### **1. Install Dependencies**

```bash
# Install test dependencies
npm install --save-dev @types/jest @types/supertest @types/ws @faker-js/faker jest ts-jest supertest mongodb-memory-server ws artillery k6 eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Or use the provided package.test.json
npm install --save-dev $(cat package.test.json | jq -r '.devDependencies | keys[]' | tr '\n' ' ')
```

### **2. Environment Setup**

```bash
# Set test environment variables
export NODE_ENV=test
export MONGODB_URI=mongodb://localhost:27017/maraksh_test
export JWT_SECRET=test-jwt-secret-key
export WS_PORT=3001
```

### **3. Run Tests**

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:menu
npm run test:orders
npm run test:inventory
npm run test:auth
npm run test:admin
npm run test:reports
npm run test:integration
npm run test:security
npm run test:performance
npm run test:websocket

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📊 **Test Coverage**

### **API Endpoints Covered**

| Module | Endpoints | Coverage |
|--------|-----------|----------|
| **Menu Items** | GET, POST, PUT, DELETE `/api/items` | ✅ Complete |
| **Orders** | GET, POST, PUT `/api/orders` | ✅ Complete |
| **Inventory** | GET, POST, PUT, PATCH `/api/ingredients` | ✅ Complete |
| **Authentication** | POST `/api/auth/login`, `/api/auth/seed` | ✅ Complete |
| **Admin** | GET, POST, PUT `/api/admin/*` | ✅ Complete |
| **Reports** | GET, POST `/api/admin/reports/*` | ✅ Complete |
| **WebSocket** | Real-time notifications | ✅ Complete |

### **Test Types**

| Test Type | Files | Description |
|-----------|-------|-------------|
| **Unit Tests** | All `*.test.ts` | Individual API endpoint testing |
| **Integration Tests** | `integration-flow.test.ts` | End-to-end workflow testing |
| **Performance Tests** | `performance-smoke.test.ts` | Load and stress testing |
| **Security Tests** | `security.test.ts` | Authentication, authorization, input validation |
| **WebSocket Tests** | `notifications.test.ts` | Real-time notification testing |

## 🔧 **Test Configuration**

### **Jest Configuration**

The test suite uses Jest with TypeScript support:

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  testTimeout: 30000,
  maxWorkers: 1, // Sequential execution for database consistency
  collectCoverageFrom: [
    'app/api/**/*.ts',
    'lib/**/*.ts',
    '!**/*.d.ts',
  ],
};
```

### **Database Setup**

Tests use MongoDB Memory Server for isolated testing:

```typescript
// tests/global-setup.ts
const mongoServer = await MongoMemoryServer.create({
  instance: { dbName: 'maraksh_test_db', port: 27018 },
  binary: { version: '7.0.0' },
});
```

## 🧪 **Test Utilities**

### **Test Helpers**

```typescript
// tests/utils/test-helpers.ts
export class TestHelpers {
  static createMockRequest(method, url, body?, headers?)
  static createAuthHeaders(token)
  static createAdminHeaders(token)
  static createTestOrder(overrides?)
  static createTestMenuItem(overrides?)
  static createTestMaterial(overrides?)
}

export class ApiAssertions {
  static assertSuccessResponse(response, expectedStatus?)
  static assertErrorResponse(response, expectedStatus?)
  static assertPagination(pagination)
  static assertMenuItem(item)
  static assertOrder(order)
  static assertMaterial(material)
}
```

### **Mock Data Generators**

```typescript
// tests/utils/mockGenerators.ts
export class MockDataGenerators {
  static generateCompleteMenuItem(overrides?)
  static generateCompleteCategory(overrides?)
  static generateCompleteMaterial(overrides?)
  static generateComplexOrder(overrides?)
  static generateUserWithRole(role, overrides?)
  static generateCompleteReview(overrides?)
  static generateNotification(overrides?)
}
```

## 🔒 **Security Testing**

### **Authentication Tests**
- ✅ Valid/invalid credentials
- ✅ Token validation
- ✅ Role-based access control
- ✅ Session management
- ✅ Brute force protection

### **Input Validation Tests**
- ✅ SQL injection prevention
- ✅ NoSQL injection prevention
- ✅ XSS attack prevention
- ✅ Path traversal prevention
- ✅ Oversized payload handling
- ✅ Prototype pollution prevention

### **Authorization Tests**
- ✅ Admin-only endpoints
- ✅ Role-based permissions
- ✅ Cross-department access prevention
- ✅ Unauthorized operation blocking

## ⚡ **Performance Testing**

### **Load Testing with Artillery**

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run performance/artillery-orders.yaml

# Run with custom target
artillery run performance/artillery-orders.yaml --target http://your-api.com
```

### **Load Testing with K6**

```bash
# Install K6
# macOS: brew install k6
# Linux: https://k6.io/docs/getting-started/installation/

# Run load test
k6 run performance/k6-orders.js

# Run with custom VUs
k6 run --vus 50 --duration 5m performance/k6-orders.js
```

### **Performance Metrics**

| Metric | Threshold | Description |
|--------|-----------|-------------|
| **Response Time** | < 1000ms | API response time |
| **Throughput** | > 100 RPS | Requests per second |
| **Error Rate** | < 1% | Failed request percentage |
| **Memory Usage** | < 100MB | Memory consumption |
| **Concurrent Users** | 100+ | Simultaneous users |

## 🔔 **WebSocket Testing**

### **Connection Tests**
- ✅ WebSocket connection establishment
- ✅ Connection error handling
- ✅ Multiple concurrent connections
- ✅ Connection close events

### **Notification Tests**
- ✅ Order notifications
- ✅ Inventory alerts
- ✅ System notifications
- ✅ Staff notifications
- ✅ Message validation
- ✅ Error handling

### **Real-time Features**
- ✅ Order status updates
- ✅ Low stock alerts
- ✅ System maintenance notifications
- ✅ Staff schedule changes

## 🚀 **CI/CD Integration**

### **GitHub Actions Workflow**

```yaml
# .github/workflows/test.yml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/maraksh_test
        JWT_SECRET: test-jwt-secret-key
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### **Test Scripts**

```json
{
  "scripts": {
    "test": "jest --runInBand",
    "test:watch": "jest --watch --runInBand",
    "test:coverage": "jest --coverage --runInBand",
    "test:ci": "jest --ci --coverage --runInBand --watchAll=false",
    "test:menu": "jest tests/menu.test.ts --runInBand",
    "test:orders": "jest tests/orders.test.ts --runInBand",
    "test:integration": "jest tests/integration-flow.test.ts --runInBand",
    "test:security": "jest tests/security.test.ts --runInBand",
    "test:performance": "jest tests/performance-smoke.test.ts --runInBand",
    "performance:artillery": "artillery run performance/artillery-orders.yaml",
    "performance:k6": "k6 run performance/k6-orders.js"
  }
}
```

## 📈 **Test Reports**

### **Coverage Reports**

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### **Performance Reports**

```bash
# Artillery report
artillery run performance/artillery-orders.yaml --output report.json
artillery report report.json

# K6 report
k6 run --out json=performance-report.json performance/k6-orders.js
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Database Connection Errors**
   ```bash
   # Ensure MongoDB Memory Server is properly installed
   npm install mongodb-memory-server --save-dev
   ```

2. **Port Conflicts**
   ```bash
   # Change WebSocket port in tests
   export WS_PORT=3002
   ```

3. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

4. **Test Timeouts**
   ```bash
   # Increase Jest timeout
   export JEST_TIMEOUT=60000
   ```

### **Debug Mode**

```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test with verbose output
npm test -- --verbose tests/menu.test.ts
```

## 📚 **Best Practices**

### **Writing Tests**

1. **Use descriptive test names**
   ```typescript
   it('should create a new menu item with valid data', async () => {
     // Test implementation
   });
   ```

2. **Test both success and failure cases**
   ```typescript
   it('should return 400 for invalid menu item data', async () => {
     // Test error handling
   });
   ```

3. **Use proper assertions**
   ```typescript
   expect(response.status).toBe(200);
   expect(responseData.success).toBe(true);
   expect(responseData.data).toHaveProperty('_id');
   ```

4. **Clean up test data**
   ```typescript
   afterEach(async () => {
     await cleanupTestDB();
   });
   ```

### **Performance Testing**

1. **Start with small loads**
2. **Gradually increase load**
3. **Monitor system resources**
4. **Test under realistic conditions**

### **Security Testing**

1. **Test all input validation**
2. **Verify authentication/authorization**
3. **Check for common vulnerabilities**
4. **Test error handling**

## 🤝 **Contributing**

### **Adding New Tests**

1. Create test file in appropriate directory
2. Follow naming convention: `*.test.ts`
3. Use existing test utilities
4. Add proper documentation
5. Update this README

### **Test Standards**

- ✅ All tests must pass
- ✅ Coverage must be > 80%
- ✅ Tests must be deterministic
- ✅ Tests must clean up after themselves
- ✅ Tests must have proper error handling

## 📞 **Support**

For questions or issues with the test suite:

1. Check the troubleshooting section
2. Review test documentation
3. Check existing test examples
4. Create an issue with detailed information

---

**Happy Testing! 🎉**









