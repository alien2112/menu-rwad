/**
 * Check Application Database Connection
 * Test what database the application is actually connecting to
 */

// Import the same MongoDB connection function that the app uses
const path = require('path');
const fs = require('fs');

// Read the mongodb.ts file to understand the connection logic
const mongodbPath = path.join(__dirname, '..', 'lib', 'mongodb.ts');
const mongodbContent = fs.readFileSync(mongodbPath, 'utf8');

console.log('🔍 Checking Application Database Connection...\n');

// Check environment variables
console.log('Environment Variables:');
console.log(`MARAKSH_MONGODB_URI: ${process.env.MARAKSH_MONGODB_URI || 'Not set'}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI || 'Not set'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);

// Extract the fallback URI from the mongodb.ts file
const fallbackMatch = mongodbContent.match(/return '([^']+)'/);
const fallbackUri = fallbackMatch ? fallbackMatch[1] : 'Not found';

console.log(`\nFallback URI from mongodb.ts: ${fallbackUri}`);

// Determine which URI would be used
let usedUri;
if (process.env.MARAKSH_MONGODB_URI && process.env.MARAKSH_MONGODB_URI.trim()) {
  usedUri = process.env.MARAKSH_MONGODB_URI.trim();
  console.log('\n✅ Using MARAKSH_MONGODB_URI environment variable');
} else if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() && !process.env.MONGODB_URI.trim().startsWith('@')) {
  usedUri = process.env.MONGODB_URI.trim();
  console.log('\n✅ Using MONGODB_URI environment variable');
} else {
  usedUri = fallbackUri;
  console.log('\n✅ Using fallback URI from mongodb.ts');
}

console.log(`\nFinal URI: ${usedUri}`);

// Extract database name from URI
const dbMatch = usedUri.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
const databaseName = dbMatch ? dbMatch[1] : 'Unknown';

console.log(`\nDatabase Name: ${databaseName}`);

if (databaseName === 'menurwad') {
  console.log('\n🎉 SUCCESS: Application is configured to use the menurwad database!');
} else {
  console.log(`\n⚠️ WARNING: Application is configured to use '${databaseName}' database, not 'menurwad'`);
  console.log('This might explain why the API is returning empty data.');
}





