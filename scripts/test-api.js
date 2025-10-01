const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('Testing homepage API...');
    const response = await fetch('http://localhost:3000/api/homepage?section=journey');
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log(`Found ${data.data.length} journey images:`);
      data.data.forEach((img, index) => {
        console.log(`${index + 1}. ${img.title} (${img.imageId})`);
      });
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();
