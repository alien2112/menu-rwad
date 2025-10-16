import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectTestDB, cleanupTestDB, closeTestDB } from '../setup';
import { TestHelpers, ApiAssertions, DatabaseHelpers } from '../utils/test-helpers';
import { MockDataGenerators } from '../utils/mockGenerators';

/**
 * Authentication API Test Suite
 * Tests login, token validation, role-based access, and security features
 */

describe('Authentication API', () => {
  let testData: any;

  beforeAll(async () => {
    await connectTestDB();
    await cleanupTestDB();
    
    // Create test users with different roles
    const User = mongoose.model('User');
    const users = [];

    const userRoles = [
      { username: 'admin', password: 'admin2024', role: 'admin', name: 'مدير النظام' },
      { username: 'kitchen', password: 'kitchen2024', role: 'kitchen', name: 'طاهي المطبخ' },
      { username: 'barista', password: 'barista2024', role: 'barista', name: 'بارستا' },
      { username: 'shisha', password: 'shisha2024', role: 'shisha', name: 'مشغل الشيشة' },
      { username: 'inactive', password: 'inactive2024', role: 'kitchen', name: 'موظف غير نشط', isActive: false },
    ];

    for (const userInfo of userRoles) {
      const user = new User({
        ...userInfo,
        isActive: userInfo.isActive !== false,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
      await user.save();
      users.push(user);
    }

    testData = { users };
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        username: 'admin',
        password: 'admin2024',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        loginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('id');
      expect(responseData.data).toHaveProperty('username');
      expect(responseData.data).toHaveProperty('role');
      expect(responseData.data).toHaveProperty('name');
      expect(responseData.data.username).toBe('admin');
      expect(responseData.data.role).toBe('admin');
      expect(responseData.data).not.toHaveProperty('password');
      ApiAssertions.assertUser(responseData.data);
    });

    it('should login with different roles', async () => {
      const roles = ['kitchen', 'barista', 'shisha'];
      
      for (const role of roles) {
        const loginData = {
          username: role,
          password: `${role}2024`,
        };

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/auth/login',
          loginData
        );

        const { POST } = await import('../../app/api/auth/login/route');
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(200);
        expect(responseData.success).toBe(true);
        expect(responseData.data.role).toBe(role);
      }
    });

    it('should reject invalid username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        loginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const loginData = {
        username: 'admin',
        password: 'wrongpassword',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        loginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid credentials');
    });

    it('should reject inactive user', async () => {
      const loginData = {
        username: 'inactive',
        password: 'inactive2024',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        loginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid credentials');
    });

    it('should validate required fields', async () => {
      const invalidLoginData = {
        username: 'admin',
        // Missing password
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        invalidLoginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Username and password are required');
    });

    it('should handle empty credentials', async () => {
      const emptyLoginData = {
        username: '',
        password: '',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        emptyLoginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Username and password are required');
    });

    it('should update last login timestamp', async () => {
      const loginData = {
        username: 'admin',
        password: 'admin2024',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        loginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      // Verify last login was updated
      const User = mongoose.model('User');
      const user = await User.findOne({ username: 'admin' });
      expect(user!.lastLogin).toBeDefined();
      expect(new Date().getTime() - user!.lastLogin!.getTime()).toBeLessThan(5000); // Within 5 seconds
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });

  describe('POST /api/auth/seed', () => {
    it('should create default users when none exist', async () => {
      // Clear existing users
      const User = mongoose.model('User');
      await User.deleteMany({});

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/seed',
        {}
      );

      const { POST } = await import('../../app/api/auth/seed/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Array);
      expect(responseData.data.length).toBe(4); // admin, kitchen, barista, shisha
      
      // Verify all roles are present
      const roles = responseData.data.map((user: any) => user.role);
      expect(roles).toContain('admin');
      expect(roles).toContain('kitchen');
      expect(roles).toContain('barista');
      expect(roles).toContain('shisha');
    });

    it('should reject seeding when users already exist', async () => {
      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/seed',
        {}
      );

      const { POST } = await import('../../app/api/auth/seed/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Users already exist');
    });
  });

  describe('Role-Based Access Control', () => {
    let adminToken: string;
    let kitchenToken: string;
    let baristaToken: string;

    beforeEach(async () => {
      // Get tokens for different roles
      adminToken = 'admin-token';
      kitchenToken = 'kitchen-token';
      baristaToken = 'barista-token';
    });

    it('should allow admin to access admin endpoints', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        TestHelpers.createAdminHeaders(adminToken)
      );

      // Mock admin endpoint
      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should deny kitchen staff access to admin endpoints', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/admin/dashboard',
        undefined,
        TestHelpers.createAuthHeaders(kitchenToken)
      );

      // Mock admin endpoint with role checking
      const { GET } = await import('../../app/api/admin/dashboard/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('admin');
    });

    it('should allow kitchen staff to access kitchen endpoints', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/kitchen/orders',
        undefined,
        TestHelpers.createAuthHeaders(kitchenToken)
      );

      // Mock kitchen endpoint
      const { GET } = await import('../../app/api/kitchen/orders/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should deny barista access to kitchen endpoints', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/kitchen/orders',
        undefined,
        TestHelpers.createAuthHeaders(baristaToken)
      );

      // Mock kitchen endpoint with role checking
      const { GET } = await import('../../app/api/kitchen/orders/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('kitchen');
    });
  });

  describe('Token Validation', () => {
    it('should validate valid token', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/auth/validate',
        undefined,
        TestHelpers.createAuthHeaders('valid-token')
      );

      // Mock token validation endpoint
      const { GET } = await import('../../app/api/auth/validate/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('valid');
      expect(responseData.data.valid).toBe(true);
    });

    it('should reject invalid token', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/auth/validate',
        undefined,
        TestHelpers.createAuthHeaders('invalid-token')
      );

      const { GET } = await import('../../app/api/auth/validate/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid token');
    });

    it('should reject missing token', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/auth/validate'
        // No auth headers
      );

      const { GET } = await import('../../app/api/auth/validate/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('No token provided');
    });

    it('should reject expired token', async () => {
      const request = TestHelpers.createMockRequest(
        'GET',
        'http://localhost:3000/api/auth/validate',
        undefined,
        TestHelpers.createAuthHeaders('expired-token')
      );

      const { GET } = await import('../../app/api/auth/validate/route');
      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Token expired');
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection in username', async () => {
      const maliciousLoginData = {
        username: "admin'; DROP TABLE users; --",
        password: 'password123',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        maliciousLoginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      
      // Verify users table still exists
      const User = mongoose.model('User');
      const userCount = await User.countDocuments();
      expect(userCount).toBeGreaterThan(0);
    });

    it('should prevent NoSQL injection in username', async () => {
      const maliciousLoginData = {
        username: { $ne: null },
        password: 'password123',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        maliciousLoginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should handle very long username', async () => {
      const longUsername = 'a'.repeat(1000);
      const loginData = {
        username: longUsername,
        password: 'password123',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        loginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should handle special characters in credentials', async () => {
      const specialCharLoginData = {
        username: 'admin@#$%^&*()',
        password: 'password!@#$%^&*()',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/login',
        specialCharLoginData
      );

      const { POST } = await import('../../app/api/auth/login/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
    });

    it('should handle concurrent login attempts', async () => {
      const loginPromises = Array.from({ length: 10 }, () => {
        const loginData = {
          username: 'admin',
          password: 'admin2024',
        };

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/auth/login',
          loginData
        );

        const { POST } = await import('../../app/api/auth/login/route');
        return POST(request);
      });

      const responses = await Promise.all(loginPromises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle rate limiting', async () => {
      // Simulate rapid login attempts
      const rapidLoginPromises = Array.from({ length: 20 }, (_, i) => {
        const loginData = {
          username: 'admin',
          password: 'wrongpassword', // Wrong password to trigger rate limiting
        };

        const request = TestHelpers.createMockRequest(
          'POST',
          'http://localhost:3000/api/auth/login',
          loginData
        );

        const { POST } = await import('../../app/api/auth/login/route');
        return POST(request);
      });

      const responses = await Promise.all(rapidLoginPromises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Session Management', () => {
    it('should handle logout', async () => {
      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/logout',
        {},
        TestHelpers.createAuthHeaders('valid-token')
      );

      // Mock logout endpoint
      const { POST } = await import('../../app/api/auth/logout/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Logged out successfully');
    });

    it('should handle token refresh', async () => {
      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/refresh',
        {},
        TestHelpers.createAuthHeaders('valid-token')
      );

      // Mock token refresh endpoint
      const { POST } = await import('../../app/api/auth/refresh/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveProperty('token');
    });

    it('should handle password change', async () => {
      const passwordChangeData = {
        currentPassword: 'admin2024',
        newPassword: 'newpassword2024',
      };

      const request = TestHelpers.createMockRequest(
        'POST',
        'http://localhost:3000/api/auth/change-password',
        passwordChangeData,
        TestHelpers.createAuthHeaders('admin-token')
      );

      // Mock password change endpoint
      const { POST } = await import('../../app/api/auth/change-password/route');
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Password changed successfully');
    });
  });
});










