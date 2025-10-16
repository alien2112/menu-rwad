import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';

// Global test database instance
let mongoServer: MongoMemoryServer;
let mongoUri: string;

/**
 * Global setup for Jest tests
 * Initializes MongoDB Memory Server for isolated testing
 */
export default async function globalSetup() {
  console.log('🚀 Setting up test database...');
  
  try {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'maraksh_test_db',
        port: 27018, // Use different port to avoid conflicts
      },
      binary: {
        version: '7.0.0', // Use specific MongoDB version
      },
    });
    
    mongoUri = mongoServer.getUri();
    
    // Set environment variable for tests
    process.env.MONGODB_URI = mongoUri;
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    process.env.WS_PORT = '3001';
    
    console.log('✅ Test database initialized at:', mongoUri);
    
    // Connect to test database
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to test database');
    
    // Store URI globally for cleanup
    (global as any).__MONGO_URI__ = mongoUri;
    (global as any).__MONGO_SERVER__ = mongoServer;
    
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Global teardown for Jest tests
 * Cleans up MongoDB Memory Server
 */
export async function globalTeardown() {
  console.log('🧹 Cleaning up test database...');
  
  try {
    // Close mongoose connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Stop MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('✅ Test database cleanup completed');
    
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
    throw error;
  }
}

/**
 * Helper function to create mock NextRequest
 */
export function createMockRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

/**
 * Helper function to create mock NextRequest with search params
 */
export function createMockRequestWithParams(
  method: string = 'GET',
  url: string = 'http://localhost:3000/api/test',
  searchParams?: Record<string, string>,
  body?: any
): NextRequest {
  const urlObj = new URL(url);
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
  }

  return createMockRequest(method, urlObj.toString(), body);
}











