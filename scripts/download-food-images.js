const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Image URLs extracted from the old website
const imageUrls = [
  'https://leafy-clafoutis-164d09.netlify.app/images/1.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/2.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/3.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/4.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/5.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/6.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/7.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/8.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/9.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/10.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/11.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/12.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/13.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/14.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/15.jpeg',
  'https://leafy-clafoutis-164d09.netlify.app/images/16.jpeg'
];

const publicDir = path.join(__dirname, '..', 'client', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const filePath = path.join(publicDir, filename);
        const fileStream = fs.createWriteStream(filePath);
        
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('Starting to download food images...');
  
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const filename = `moroccan-food-${i + 1}.jpeg`;
    
    try {
      await downloadImage(url, filename);
    } catch (error) {
      console.error(`Error downloading ${url}:`, error.message);
    }
  }
  
  console.log('Download completed!');
}

downloadAllImages().catch(console.error);

