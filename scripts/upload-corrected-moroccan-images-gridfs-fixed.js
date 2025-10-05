#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket } = require('mongodb');

// MongoDB connection - using the same URI as your existing setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';
const DB_NAME = 'maraksh';

// Base path for images
const IMAGES_BASE_PATH = path.join(__dirname, '../public/صور مراكش');

// Updated category mapping based on corrected menu structure
const CATEGORY_MAPPING = {
  'الشاي': 'tea',
  'العصيرات الطبيعية': 'natural-juices', 
  'القهوة الباردة': 'cold-coffee',
  'المكتيلز والمهيتو': 'cocktails'
};

// Function to clean and normalize Arabic text for MongoDB
function normalizeForMongoDB(text) {
  return text
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '') // Keep Arabic, Latin, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
}

// Function to create MongoDB-friendly filename
function createMongoDBFilename(originalName, category) {
  const baseName = path.parse(originalName).name;
  const extension = path.parse(originalName).ext;
  
  // Normalize the Arabic name
  const normalizedName = normalizeForMongoDB(baseName);
  
  // Create category prefix
  const categoryPrefix = CATEGORY_MAPPING[category] || 'other';
  
  return `${categoryPrefix}-${normalizedName}${extension}`;
}

// Function to upload file to MongoDB GridFS
async function uploadToGridFS(filePath, filename, category, client) {
  try {
    const db = client.db(DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    
    // Check if file already exists
    const existingFiles = await bucket.find({ filename }).toArray();
    if (existingFiles.length > 0) {
      console.log(`   ⏭️  File already exists: ${filename}`);
      return {
        filename,
        url: `/api/images/${filename}`,
        category,
        exists: true,
        fileId: existingFiles[0]._id.toString()
      };
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    const contentType = getContentType(filePath);
    
    // Upload the file
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        category,
        originalName: path.basename(filePath),
        uploadedAt: new Date(),
        fileSize: stats.size
      }
    });
    
    const fileStream = fs.createReadStream(filePath);
    
    return new Promise((resolve, reject) => {
      fileStream.pipe(uploadStream);
      
      uploadStream.on('error', (error) => {
        console.error(`   ❌ Upload error for ${filename}:`, error);
        reject(error);
      });
      
      uploadStream.on('finish', () => {
        console.log(`   ✅ Uploaded: ${filename} (${formatFileSize(stats.size)})`);
        resolve({
          filename,
          url: `/api/images/${filename}`,
          category,
          fileId: uploadStream.id.toString(),
          exists: false,
          fileSize: stats.size
        });
      });
    });
    
  } catch (error) {
    console.error(`   ❌ Database error for ${filename}:`, error);
    throw error;
  }
}

// Function to get content type based on file extension
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// Function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process all images
async function uploadAllImages() {
  console.log('🚀 Starting corrected Moroccan images upload to MongoDB GridFS...\n');
  
  if (!fs.existsSync(IMAGES_BASE_PATH)) {
    console.error('❌ Images folder not found:', IMAGES_BASE_PATH);
    return;
  }

  console.log(`📂 Images path: ${IMAGES_BASE_PATH}`);
  console.log(`🗄️  MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
  console.log(`📊 Database: ${DB_NAME}\n`);

  const client = new MongoClient(MONGODB_URI);
  const uploadResults = [];
  const errors = [];
  let totalSize = 0;

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!\n');

    // Process each category folder
    for (const [categoryName, categoryFolder] of Object.entries(CATEGORY_MAPPING)) {
      const categoryPath = path.join(IMAGES_BASE_PATH, categoryName);
      
      if (!fs.existsSync(categoryPath)) {
        console.log(`⚠️  Category folder not found: ${categoryName}`);
        continue;
      }

      console.log(`📁 Processing category: ${categoryName} (${categoryFolder})`);
      
      const files = fs.readdirSync(categoryPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      console.log(`   Found ${imageFiles.length} images`);

      for (const imageFile of imageFiles) {
        const originalPath = path.join(categoryPath, imageFile);
        const mongoFilename = createMongoDBFilename(imageFile, categoryName);

        try {
          console.log(`   Processing: ${imageFile} → ${mongoFilename}`);
          
          // Upload the file
          const result = await uploadToGridFS(originalPath, mongoFilename, categoryName, client);
          
          uploadResults.push({
            original: imageFile,
            filename: mongoFilename,
            category: categoryName,
            categoryFolder,
            url: result.url,
            fileId: result.fileId,
            exists: result.exists,
            fileSize: result.fileSize || 0
          });

          if (!result.exists) {
            totalSize += result.fileSize || 0;
          }

          // Add small delay to avoid overwhelming the database
          await delay(300);

        } catch (error) {
          console.error(`   ❌ Error uploading ${imageFile}:`, error.message);
          errors.push({
            file: imageFile,
            error: error.message
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return;
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log('🔌 MongoDB connection closed.');
  }

  // Print summary
  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${uploadResults.filter(r => !r.exists).length} images`);
  console.log(`⏭️  Already existed: ${uploadResults.filter(r => r.exists).length} images`);
  console.log(`❌ Failed uploads: ${errors.length} images`);
  console.log(`📦 Total size uploaded: ${formatFileSize(totalSize)}`);

  if (uploadResults.length > 0) {
    console.log('\n📋 Uploaded files:');
    uploadResults.forEach(result => {
      const status = result.exists ? '⏭️' : '✅';
      const size = result.fileSize ? ` (${formatFileSize(result.fileSize)})` : '';
      console.log(`  ${status} ${result.original} → ${result.filename}${size}`);
      console.log(`     URL: ${result.url}`);
      console.log(`     File ID: ${result.fileId}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ Failed uploads:');
    errors.forEach(error => {
      console.log(`  ${error.file}: ${error.error}`);
    });
  }

  // Generate database update script
  if (uploadResults.length > 0) {
    console.log('\n🔧 Generating database update script...');
    generateDatabaseUpdateScript(uploadResults);
  }

  // Generate image mapping JSON
  if (uploadResults.length > 0) {
    console.log('\n📄 Generating image mapping JSON...');
    generateImageMappingJSON(uploadResults);
  }
}

// Function to generate database update script
function generateDatabaseUpdateScript(uploadResults) {
  const scriptContent = `// Auto-generated script to update menu items with GridFS image URLs
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';
const DB_NAME = 'maraksh';

// Image mappings
const imageMappings = ${JSON.stringify(uploadResults, null, 2)};

async function updateMenuItems() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('menuitems');
    
    console.log('🔄 Updating menu items with GridFS image URLs...');
    
    let updatedCount = 0;
    
    for (const mapping of imageMappings) {
      const originalName = mapping.original.replace(/\\.[^/.]+$/, ""); // Remove extension
      
      // Try to find matching menu item by name (case-insensitive)
      const result = await collection.updateMany(
        { 
          name: { $regex: originalName, $options: 'i' },
          categoryId: { $exists: true }
        },
        { 
          $set: { 
            image: mapping.url,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(\`✅ Updated \${result.modifiedCount} items for: \${originalName}\`);
        updatedCount += result.modifiedCount;
      } else {
        console.log(\`⚠️  No items found for: \${originalName}\`);
      }
    }
    
    console.log(\`✅ Database update completed! Updated \${updatedCount} menu items.\`);
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
  } finally {
    await client.close();
  }
}

updateMenuItems();
`;

  const scriptPath = path.join(__dirname, 'update-corrected-moroccan-images-db.js');
  fs.writeFileSync(scriptPath, scriptContent);
  console.log(`📝 Database update script created: ${scriptPath}`);
}

// Function to generate image mapping JSON
function generateImageMappingJSON(uploadResults) {
  const mappingData = {
    generatedAt: new Date().toISOString(),
    totalImages: uploadResults.length,
    categories: {},
    images: uploadResults
  };

  // Group by categories
  uploadResults.forEach(result => {
    if (!mappingData.categories[result.categoryFolder]) {
      mappingData.categories[result.categoryFolder] = [];
    }
    mappingData.categories[result.categoryFolder].push({
      original: result.original,
      filename: result.filename,
      url: result.url,
      fileId: result.fileId
    });
  });

  const jsonPath = path.join(__dirname, 'corrected-moroccan-images-mapping.json');
  fs.writeFileSync(jsonPath, JSON.stringify(mappingData, null, 2));
  console.log(`📄 Image mapping JSON created: ${jsonPath}`);
}

// Run the upload
if (require.main === module) {
  uploadAllImages().catch(console.error);
}

module.exports = { uploadAllImages, createMongoDBFilename, normalizeForMongoDB };





