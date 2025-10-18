// Test script to seed users and test login
const https = require('https');
const http = require('http');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAuth() {
  try {
    console.log('🌱 Seeding demo users...');
    
    // Seed users
    const seedResponse = await makeRequest('http://localhost:3000/api/auth/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Seed response:', seedResponse.status, seedResponse.data);
    
    if (seedResponse.data.success) {
      console.log('✅ Users seeded successfully!');
      console.log('📋 Demo credentials:');
      console.log('   Admin: admin / Admin@2024');
      console.log('   Kitchen: kitchen / Kitchen@2024');
      console.log('   Barista: barista / Barista@2024');
      console.log('   Shisha: shisha / Shisha@2024');
      
      console.log('\n🔐 Testing admin login...');
      
      // Test login
      const loginResponse = await makeRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'Admin@2024'
        })
      });
      
      console.log('Login response:', loginResponse.status, loginResponse.data);
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful!');
        console.log('User:', loginResponse.data.data.user);
      } else {
        console.log('❌ Login failed:', loginResponse.data.error);
      }
    } else {
      console.log('❌ Failed to seed users:', seedResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuth();

