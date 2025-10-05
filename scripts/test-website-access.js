const fs = require('fs');
const path = require('path');
const https = require('https');

// Website URL
const WEBSITE_URL = 'https://leafy-clafoutis-164d09.netlify.app/';

// Create migrated-images directory
const migratedImagesDir = path.join(__dirname, '..', 'public', 'migrated-images');

if (!fs.existsSync(migratedImagesDir)) {
  fs.mkdirSync(migratedImagesDir, { recursive: true });
  console.log('Created migrated-images directory');
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const filePath = path.join(migratedImagesDir, filename);
        const fileStream = fs.createWriteStream(filePath);
        
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded: ${filename}`);
          resolve({ filename, success: true });
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
      } else {
        console.log(`Failed to download ${url}: HTTP ${response.statusCode}`);
        resolve({ filename, success: false, error: `HTTP ${response.statusCode}` });
      }
    }).on('error', (err) => {
      console.log(`Network error downloading ${url}: ${err.message}`);
      resolve({ filename, success: false, error: err.message });
    });
  });
}

function getPageContent(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      console.log(`Website response status: ${response.statusCode}`);
      
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        console.log(`Received ${data.length} characters of HTML`);
        resolve(data);
      });
    }).on('error', (err) => {
      console.error('Error fetching website:', err.message);
      reject(err);
    });
  });
}

async function testWebsiteAccess() {
  try {
    console.log('Testing website access...');
    console.log(`URL: ${WEBSITE_URL}`);
    
    const html = await getPageContent(WEBSITE_URL);
    
    console.log('\nFirst 500 characters of HTML:');
    console.log(html.substring(0, 500));
    
    // Try to find images in different ways
    console.log('\nSearching for images...');
    
    // Method 1: Look for img tags
    const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    if (imgMatches) {
      console.log(`Found ${imgMatches.length} img tags:`);
      imgMatches.forEach((match, index) => {
        console.log(`${index + 1}. ${match}`);
      });
    }
    
    // Method 2: Look for any image file extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?[^"'\s]*)?/gi;
    const imageMatches = html.match(imageExtensions);
    if (imageMatches) {
      console.log(`\nFound ${imageMatches.length} image file references:`);
      [...new Set(imageMatches)].forEach((match, index) => {
        console.log(`${index + 1}. ${match}`);
      });
    }
    
    // Method 3: Look for /images/ paths
    const imagesPathMatches = html.match(/\/images\/[^"'\s]+/gi);
    if (imagesPathMatches) {
      console.log(`\nFound ${imagesPathMatches.length} /images/ paths:`);
      [...new Set(imagesPathMatches)].forEach((match, index) => {
        console.log(`${index + 1}. ${match}`);
      });
    }
    
    // Try to download known image paths
    console.log('\nTrying to download known image paths...');
    const knownImagePaths = [
      '/images/1.jpeg',
      '/images/2.jpeg', 
      '/images/3.jpeg',
      '/images/4.jpeg',
      '/images/5.jpeg',
      '/images/6.jpeg',
      '/images/7.jpeg',
      '/images/8.jpeg',
      '/images/9.jpeg',
      '/images/10.jpeg',
      '/images/11.jpeg',
      '/images/12.jpeg',
      '/images/13.jpeg',
      '/images/14.jpeg',
      '/images/15.jpeg',
      '/images/16.jpeg'
    ];
    
    const results = [];
    for (let i = 0; i < knownImagePaths.length; i++) {
      const imagePath = knownImagePaths[i];
      const fullUrl = WEBSITE_URL + imagePath.substring(1);
      const filename = `moroccan_food_${i + 1}.jpeg`;
      
      console.log(`Trying: ${fullUrl}`);
      try {
        const result = await downloadImage(fullUrl, filename);
        results.push(result);
      } catch (error) {
        console.log(`Failed: ${error.message}`);
        results.push({ filename, success: false, error: error.message });
      }
    }
    
    console.log('\nDownload Summary:');
    console.log('================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`Successfully downloaded: ${successful.length} images`);
    successful.forEach(result => {
      console.log(`✓ ${result.filename}`);
    });
    
    if (failed.length > 0) {
      console.log(`\nFailed downloads: ${failed.length} images`);
      failed.forEach(result => {
        console.log(`✗ ${result.filename}: ${result.error}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testWebsiteAccess();
