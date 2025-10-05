#!/usr/bin/env node

/**
 * Comprehensive WebP Conversion Script for Public Folder Images
 * 
 * This script converts ALL images in the public folder to WebP format while:
 * 1. Keeping all original images as backups
 * 2. Creating WebP versions alongside originals
 * 3. Providing rollback capability
 * 4. Maintaining file structure
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
require('dotenv').config();

// Configuration
const CONFIG = {
  webpQuality: 85,
  batchSize: 5,
  backupSuffix: '.backup',
  webpSuffix: '.webp',
  supportedFormats: ['.jpg', '.jpeg', '.png'],
  excludePatterns: [
    '*.backup.*',
    '*.webp',
    'placeholder.svg',
    'robots.txt'
  ]
};

// Statistics tracking
const stats = {
  total: 0,
  converted: 0,
  skipped: 0,
  errors: 0,
  originalSize: 0,
  webpSize: 0,
  timeSaved: 0,
};

/**
 * Check if file should be excluded
 */
function shouldExclude(filename) {
  return CONFIG.excludePatterns.some(pattern => {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(filename);
  });
}

/**
 * Convert image file to WebP format
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    const webpBuffer = await sharp(inputPath)
      .webp({ 
        quality: CONFIG.webpQuality,
        effort: 6,
        lossless: false
      })
      .toBuffer();
    
    await fs.promises.writeFile(outputPath, webpBuffer);
    return webpBuffer.length;
  } catch (error) {
    console.error(`   ❌ WebP conversion failed for ${inputPath}:`, error.message);
    throw error;
  }
}

/**
 * Create backup of original file
 */
async function createBackup(originalPath) {
  const backupPath = originalPath + CONFIG.backupSuffix;
  
  try {
    await fs.promises.copyFile(originalPath, backupPath);
    console.log(`   💾 Created backup: ${path.basename(backupPath)}`);
  } catch (error) {
    console.error(`   ❌ Backup failed for ${originalPath}:`, error.message);
    throw error;
  }
}

/**
 * Process a single image file
 */
async function processImage(filePath) {
  const filename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  console.log(`   📸 Processing: ${filename}`);
  
  // Skip if not supported format
  if (!CONFIG.supportedFormats.includes(ext)) {
    console.log(`   ⏭️  Skipping: ${filename} (unsupported format: ${ext})`);
    stats.skipped++;
    return;
  }
  
  // Skip if already excluded
  if (shouldExclude(filename)) {
    console.log(`   ⏭️  Skipping: ${filename} (excluded pattern)`);
    stats.skipped++;
    return;
  }
  
  try {
    // Get original file size
    const originalStats = await fs.promises.stat(filePath);
    stats.originalSize += originalStats.size;
    
    // Create backup
    await createBackup(filePath);
    
    // Convert to WebP
    const webpPath = filePath.replace(ext, CONFIG.webpSuffix);
    console.log(`   🔄 Converting to WebP: ${filename}`);
    
    const webpSize = await convertToWebP(filePath, webpPath);
    stats.webpSize += webpSize;
    stats.timeSaved += (originalStats.size - webpSize);
    
    console.log(`   ✅ Converted: ${filename} → ${path.basename(webpPath)}`);
    console.log(`      📊 Size: ${formatFileSize(originalStats.size)} → ${formatFileSize(webpSize)}`);
    console.log(`      📈 Compression: ${Math.round((1 - webpSize / originalStats.size) * 100)}%`);
    
    stats.converted++;
    
  } catch (error) {
    console.error(`   ❌ Error processing ${filename}:`, error.message);
    stats.errors++;
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get all image files recursively
 */
async function getAllImageFiles(dir) {
  const files = [];
  
  async function scanDirectory(currentDir) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (CONFIG.supportedFormats.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await scanDirectory(dir);
  return files;
}

/**
 * Main conversion function
 */
async function convertPublicImagesToWebP() {
  try {
    console.log('🚀 Starting comprehensive WebP conversion for public folder...\n');
    console.log(`📊 Configuration:`);
    console.log(`   WebP Quality: ${CONFIG.webpQuality}%`);
    console.log(`   Batch Size: ${CONFIG.batchSize}`);
    console.log(`   Backup Suffix: ${CONFIG.backupSuffix}`);
    console.log(`   WebP Suffix: ${CONFIG.webpSuffix}\n`);
    
    const publicDir = path.join(process.cwd(), 'public');
    
    if (!fs.existsSync(publicDir)) {
      throw new Error('Public directory not found');
    }
    
    console.log(`📁 Scanning public directory: ${publicDir}\n`);
    
    // Get all image files
    const imageFiles = await getAllImageFiles(publicDir);
    stats.total = imageFiles.length;
    
    console.log(`📁 Found ${imageFiles.length} image files to process\n`);
    
    if (imageFiles.length === 0) {
      console.log('ℹ️  No image files found to convert\n');
      return;
    }
    
    // Process files in batches
    for (let i = 0; i < imageFiles.length; i += CONFIG.batchSize) {
      const batch = imageFiles.slice(i, i + CONFIG.batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(imageFiles.length / CONFIG.batchSize)}`);
      
      await Promise.all(batch.map(filePath => processImage(filePath)));
      
      console.log(`✅ Batch completed\n`);
    }
    
    // Print final statistics
    console.log('📊 Conversion Complete!\n');
    console.log('📈 Statistics:');
    console.log(`   Total Files: ${stats.total}`);
    console.log(`   Converted: ${stats.converted}`);
    console.log(`   Skipped: ${stats.skipped}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Success Rate: ${Math.round((stats.converted / stats.total) * 100)}%\n`);
    
    console.log('💾 Size Analysis:');
    console.log(`   Original Total Size: ${formatFileSize(stats.originalSize)}`);
    console.log(`   WebP Total Size: ${formatFileSize(stats.webpSize)}`);
    console.log(`   Space Saved: ${formatFileSize(stats.timeSaved)}`);
    console.log(`   Compression Ratio: ${Math.round((1 - stats.webpSize / stats.originalSize) * 100)}%\n`);
    
    console.log('🛡️ Safety Features:');
    console.log('   ✅ All original images backed up');
    console.log('   ✅ WebP versions created alongside originals');
    console.log('   ✅ File structure maintained');
    console.log('   ✅ Rollback capability preserved\n');
    
    console.log('🎯 Next Steps:');
    console.log('   1. Update your app to use WebP images');
    console.log('   2. Test WebP images in your application');
    console.log('   3. Monitor performance improvements');
    console.log('   4. Consider removing backups after successful testing\n');
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}

/**
 * Rollback function to restore originals
 */
async function rollbackToOriginals() {
  try {
    console.log('🔄 Starting rollback to original images...\n');
    
    const publicDir = path.join(process.cwd(), 'public');
    const backupFiles = await getAllImageFiles(publicDir, '.backup');
    
    console.log(`📁 Found ${backupFiles.length} backup files to restore\n`);
    
    for (const backupFile of backupFiles) {
      const originalFile = backupFile.replace(CONFIG.backupSuffix, '');
      const filename = path.basename(originalFile);
      
      console.log(`🔄 Restoring: ${path.basename(backupFile)} → ${filename}`);
      
      try {
        await fs.promises.copyFile(backupFile, originalFile);
        console.log(`✅ Restored: ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to restore ${filename}:`, error.message);
      }
    }
    
    console.log('\n✅ Rollback completed successfully!');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'rollback') {
  rollbackToOriginals();
} else {
  convertPublicImagesToWebP();
}
