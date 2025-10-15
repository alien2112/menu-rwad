// Test script to verify theme API endpoint
const testTheme = {
  background: '#FF0000',
  foreground: '#00FF00',
  primary: '#0000FF',
  secondary: '#FFFF00',
  accent: '#FF00FF',
  card: '#00FFFF',
  'card-foreground': '#FFFFFF',
};

async function testThemeAPI() {
  const baseUrl = 'http://localhost:3000';

  console.log('Testing theme API endpoints...\n');

  try {
    // Test 1: PUT - Save theme
    console.log('1. Testing PUT /api/site-settings with theme...');
    const putResponse = await fetch(`${baseUrl}/api/site-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: testTheme }),
    });

    const putData = await putResponse.json();
    console.log('PUT Response status:', putResponse.status);
    console.log('PUT Response:', JSON.stringify(putData, null, 2));

    if (putResponse.ok && putData.success) {
      console.log('✓ Theme saved successfully\n');
    } else {
      console.log('✗ Failed to save theme\n');
      return;
    }

    // Test 2: GET - Fetch saved theme
    console.log('2. Testing GET /api/site-settings...');
    const getResponse = await fetch(`${baseUrl}/api/site-settings`, {
      cache: 'no-store',
    });

    const getData = await getResponse.json();
    console.log('GET Response status:', getResponse.status);
    console.log('GET Response:', JSON.stringify(getData, null, 2));

    if (getResponse.ok && getData.success) {
      const savedTheme = getData.data?.theme;
      console.log('\nSaved theme:', JSON.stringify(savedTheme, null, 2));

      // Verify theme was saved correctly
      const themesMatch = JSON.stringify(savedTheme) === JSON.stringify(testTheme);
      if (themesMatch) {
        console.log('✓ Theme verification PASSED');
      } else {
        console.log('✗ Theme verification FAILED');
        console.log('Expected:', testTheme);
        console.log('Got:', savedTheme);
      }
    } else {
      console.log('✗ Failed to fetch theme\n');
    }

    // Test 3: Reset theme
    console.log('\n3. Testing theme reset...');
    const resetResponse = await fetch(`${baseUrl}/api/site-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetTheme: true }),
    });

    const resetData = await resetResponse.json();
    console.log('Reset Response status:', resetResponse.status);
    console.log('Reset Response:', JSON.stringify(resetData, null, 2));

    if (resetResponse.ok && resetData.success) {
      console.log('✓ Theme reset successfully');
    } else {
      console.log('✗ Failed to reset theme');
    }

  } catch (error) {
    console.error('✗ Test failed with error:', error.message);
  }
}

// Check if dev server is running
fetch('http://localhost:3000')
  .then(() => {
    testThemeAPI();
  })
  .catch(() => {
    console.error('✗ Dev server is not running. Please start it with: npm run dev');
    process.exit(1);
  });
