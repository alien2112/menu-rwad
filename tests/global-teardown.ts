import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

/**
 * Global teardown for Jest tests
 * Cleans up MongoDB Memory Server and connections
 */
export default async function globalTeardown() {
  console.log('🧹 Cleaning up test database...');
  
  try {
    // Close mongoose connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Stop MongoDB Memory Server
    const mongoServer = (global as any).__MONGO_SERVER__;
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('✅ Test database cleanup completed');
    
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
    throw error;
  }
}











