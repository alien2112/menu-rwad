// Test script to verify categories API
async function testCategoriesAPI() {
  const baseUrl = 'http://localhost:3000'; // Adjust if your dev server runs on different port
  
  try {
    console.log('Testing Categories API...');
    
    // Test GET /api/categories
    console.log('\n1. Testing GET /api/categories');
    const getResponse = await fetch(`${baseUrl}/api/categories`);
    const getData = await getResponse.json();
    
    if (getData.success) {
      console.log(`✅ GET /api/categories successful - Found ${getData.data.length} categories`);
      getData.data.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.name} (${category.nameEn}) - Order: ${category.order}`);
      });
    } else {
      console.log('❌ GET /api/categories failed:', getData.error);
    }
    
    // Test POST /api/categories/seed (upload categories)
    console.log('\n2. Testing POST /api/categories/seed');
    const seedResponse = await fetch(`${baseUrl}/api/categories/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const seedData = await seedResponse.json();
    
    if (seedData.success) {
      console.log(`✅ POST /api/categories/seed successful - Uploaded ${seedData.data.length} categories`);
    } else {
      console.log('❌ POST /api/categories/seed failed:', seedData.error);
    }
    
    // Test GET /api/categories again to verify upload
    console.log('\n3. Verifying categories after upload');
    const verifyResponse = await fetch(`${baseUrl}/api/categories`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      console.log(`✅ Verification successful - Found ${verifyData.data.length} categories in database`);
    } else {
      console.log('❌ Verification failed:', verifyData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testCategoriesAPI();
