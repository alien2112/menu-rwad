const fs = require('fs');
const path = require('path');

// Moroccan food items with their titles
const moroccanFoodItems = [
  'شكشوكة',
  'بيض اومليت', 
  'كبده',
  'فول',
  'صينية مشكله',
  'حريره مفربية',
  'بيصاره مغربية',
  'مسمن مغربي',
  'حرشه مغربية',
  'طاقوس مغربي',
  'بوكاديوس',
  'بطبوط جبن',
  'بطبوط لحم',
  'بطبوط خضار',
  'سلطة مغربية',
  'جراتان'
];

// Available images to use (from your existing files)
const availableImages = [
  'public/download (2).jpeg',
  'public/hknvf.jpeg',
  'public/Turkish Tea.jpeg',
  'public/Cafea boabe.jpeg',
  'public/Close up of coffee beans roast _ Premium Photo.jpeg',
  'public/first-section.jpeg',
  'public/second-section-first-image.jpeg',
  'public/second-section-second-image.jpeg',
  'public/second-section-third-image-correct.png',
  'public/side-menu-image.jpeg',
  'public/موال مراكش طواجن  1 (1).png',
  'public/clock.png',
  'public/location.png',
  'public/whats.png',
  'public/Cup With Straw.png',
  'public/Droplet.png'
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

function getFileExtension(filePath) {
  return path.extname(filePath);
}

async function copyImagesWithTitles() {
  console.log('Starting to copy images with titles...');
  console.log(`Saving to: ${migratedImagesDir}`);
  
  const results = [];
  
  for (let i = 0; i < moroccanFoodItems.length; i++) {
    const title = moroccanFoodItems[i];
    const sourceImage = availableImages[i % availableImages.length]; // Cycle through available images
    
    try {
      // Check if source file exists
      if (!fs.existsSync(sourceImage)) {
        console.log(`Source file not found: ${sourceImage}`);
        results.push({ title, filename: null, success: false, error: 'Source file not found' });
        continue;
      }
      
      // Create filename from title
      const sanitizedTitle = sanitizeFilename(title);
      const extension = getFileExtension(sourceImage);
      const filename = `${sanitizedTitle}${extension}`;
      const destinationPath = path.join(migratedImagesDir, filename);
      
      // Copy the file
      fs.copyFileSync(sourceImage, destinationPath);
      
      console.log(`Copied: ${title} -> ${filename}`);
      results.push({ title, filename, success: true });
      
    } catch (error) {
      console.error(`Error copying ${title}:`, error.message);
      results.push({ 
        title, 
        filename: null, 
        success: false, 
        error: error.message 
      });
    }
  }
  
  console.log('\nCopy Summary:');
  console.log('=============');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Successfully copied: ${successful.length} images`);
  successful.forEach(result => {
    console.log(`✓ ${result.title} -> ${result.filename}`);
  });
  
  if (failed.length > 0) {
    console.log(`\nFailed copies: ${failed.length} images`);
    failed.forEach(result => {
      console.log(`✗ ${result.title}: ${result.error}`);
    });
  }
  
  console.log('\nCopy completed!');
  console.log(`Images saved in: ${migratedImagesDir}`);
}

copyImagesWithTitles().catch(console.error);
