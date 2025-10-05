const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Image data with URLs and titles
const imageData = [
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/1.jpeg', title: 'شكشوكة' },
  { url: 'https://leafy-clafit-164d09.netlify.app/images/2.jpeg', title: 'بيض اومليت' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/3.jpeg', title: 'كبده' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/4.jpeg', title: 'فول' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/5.jpeg', title: 'صينية مشكله' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/6.jpeg', title: 'حريره مفربية' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/7.jpeg', title: 'بيصاره مغربية' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/8.jpeg', title: 'مسمن مغربي' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/9.jpeg', title: 'حرشه مغربية' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/10.jpeg', title: 'طاقوس مغربي' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/11.jpeg', title: 'بوكاديوس' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/12.jpeg', title: 'بطبوط جبن' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/13.jpeg', title: 'بطبوط لحم' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/14.jpeg', title: 'بطبوط خضار' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/15.jpeg', title: 'سلطة مغربية' },
  { url: 'https://leafy-clafoutis-164d09.netlify.app/images/16.jpeg', title: 'جراتان' }
];

// Create migrated-images directory
const migratedImagesDir = path.join(__dirname, '..', 'public', 'migrated-images');

if (!fs.existsSync(migratedImagesDir)) {
  fs.mkdirSync(migratedImagesDir, { recursive: true });
  console.log('Created migrated-images directory');
}

function sanitizeFilename(filename) {
  // Remove or replace characters that are not safe for filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
}

function downloadImage(url, title) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        // Create filename from title
        const sanitizedTitle = sanitizeFilename(title);
        const filename = `${sanitizedTitle}.jpeg`;
        const filePath = path.join(migratedImagesDir, filename);
        const fileStream = fs.createWriteStream(filePath);
        
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`Downloaded: ${title} -> ${filename}`);
          resolve({ title, filename, success: true });
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject(err);
        });
      } else {
        console.log(`Failed to download ${title}: HTTP ${response.statusCode}`);
        resolve({ title, filename: null, success: false, error: `HTTP ${response.statusCode}` });
      }
    }).on('error', (err) => {
      console.log(`Network error downloading ${title}: ${err.message}`);
      resolve({ title, filename: null, success: false, error: err.message });
    });
  });
}

async function downloadAllImagesWithTitles() {
  console.log('Starting to download images with titles...');
  console.log(`Saving to: ${migratedImagesDir}`);
  
  const results = [];
  
  for (const imageInfo of imageData) {
    try {
      const result = await downloadImage(imageInfo.url, imageInfo.title);
      results.push(result);
    } catch (error) {
      console.error(`Error downloading ${imageInfo.title}:`, error.message);
      results.push({ 
        title: imageInfo.title, 
        filename: null, 
        success: false, 
        error: error.message 
      });
    }
  }
  
  console.log('\nDownload Summary:');
  console.log('================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Successfully downloaded: ${successful.length} images`);
  successful.forEach(result => {
    console.log(`✓ ${result.title} -> ${result.filename}`);
  });
  
  if (failed.length > 0) {
    console.log(`\nFailed downloads: ${failed.length} images`);
    failed.forEach(result => {
      console.log(`✗ ${result.title}: ${result.error}`);
    });
  }
  
  console.log('\nDownload completed!');
}

downloadAllImagesWithTitles().catch(console.error);
