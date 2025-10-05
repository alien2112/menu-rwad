const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Website URL
const WEBSITE_URL = 'https://leafy-clafoutis-164d09.netlify.app/';

// Create migrated-images directory
const migratedImagesDir = path.join(__dirname, '..', 'public', 'migrated-images');

if (!fs.existsSync(migratedImagesDir)) {
  fs.mkdirSync(migratedImagesDir, { recursive: true });
  console.log('Created migrated-images directory');
}

function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
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
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function extractImageUrls(html) {
  const imageUrls = [];
  
  // Find all img tags
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    let imageUrl = match[1];
    
    // Convert relative URLs to absolute URLs
    if (imageUrl.startsWith('/')) {
      imageUrl = WEBSITE_URL + imageUrl.substring(1);
    } else if (!imageUrl.startsWith('http')) {
      imageUrl = WEBSITE_URL + imageUrl;
    }
    
    imageUrls.push(imageUrl);
  }
  
  // Also look for background images in CSS
  const bgImageRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgImageRegex.exec(html)) !== null) {
    let imageUrl = match[1];
    
    if (imageUrl.startsWith('/')) {
      imageUrl = WEBSITE_URL + imageUrl.substring(1);
    } else if (!imageUrl.startsWith('http')) {
      imageUrl = WEBSITE_URL + imageUrl;
    }
    
    imageUrls.push(imageUrl);
  }
  
  return [...new Set(imageUrls)]; // Remove duplicates
}

async function scrapeAndDownloadImages() {
  try {
    console.log('Fetching website content...');
    const html = await getPageContent(WEBSITE_URL);
    
    console.log('Extracting image URLs...');
    const imageUrls = extractImageUrls(html);
    
    console.log(`Found ${imageUrls.length} images:`);
    imageUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
    
    console.log('\nStarting downloads...');
    const results = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const urlParts = url.split('/');
      const originalFilename = urlParts[urlParts.length - 1];
      
      // Create a safe filename
      const filename = sanitizeFilename(originalFilename) || `image_${i + 1}.jpg`;
      
      try {
        const result = await downloadImage(url, filename);
        results.push(result);
      } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
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
    
    console.log(`\nImages saved in: ${migratedImagesDir}`);
    
  } catch (error) {
    console.error('Error scraping website:', error.message);
  }
}

scrapeAndDownloadImages();
