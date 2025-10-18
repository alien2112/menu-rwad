// Simple script to test the inventory API
const { exec } = require('child_process');

// Run curl command to test the API
exec('curl http://localhost:3000/api/inventory', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing curl: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`Curl stderr: ${stderr}`);
  }
  
  try {
    const data = JSON.parse(stdout);
    console.log('Inventory API response:', JSON.stringify(data, null, 2));
  } catch (parseError) {
    console.error('Error parsing JSON response:', parseError);
    console.log('Raw response:', stdout);
  }
});