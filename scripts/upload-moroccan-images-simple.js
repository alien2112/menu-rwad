#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  GITHUB_TOKEN: 'your_github_token_here', // Replace with your GitHub token
  REPO_OWNER: 'your_username', // Replace with your GitHub username
  REPO_NAME: 'marakshv2', // Replace with your repository name
  BRANCH: 'master'
};

// Base path for images
const IMAGES_BASE_PATH = path.join(__dirname, '../public/صور مراكش');

// Category mapping (Arabic to English)
const CATEGORY_MAPPING = {
  'الشاي': 'tea',
  'العصيرات الطبيعية': 'natural-juices', 
  'القهوة الباردة': 'cold-coffee',
  'المكتيلز والمهيتو': 'cocktails'
};

// Function to clean and normalize Arabic text for GitHub
function normalizeForGitHub(text) {
  return text
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '') // Keep Arabic, Latin, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
}

// Function to create GitHub-friendly filename
function createGitHubFilename(originalName, category) {
  const baseName = path.parse(originalName).name;
  const extension = path.parse(originalName).ext;
  
  // Normalize the Arabic name
  const normalizedName = normalizeForGitHub(baseName);
  
  // Create category prefix
  const categoryPrefix = CATEGORY_MAPPING[category] || 'other';
  
  return `${categoryPrefix}-${normalizedName}${extension}`;
}

// Function to upload file to GitHub using GitHub API
async function uploadToGitHub(filePath, githubPath) {
  const https = require('https');
  
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    const base64Content = fileContent.toString('base64');
    
    const data = JSON.stringify({
      message: `Add Moroccan food image: ${path.basename(githubPath)}`,
      content: base64Content,
      branch: CONFIG.BRANCH
    });

    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contents/${githubPath}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
        'User-Agent': 'Moroccan Images Upload Script',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Uploaded: ${githubPath}`);
          resolve(JSON.parse(responseData));
        } else {
          console.error(`❌ Failed to upload ${githubPath}:`, responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error for ${githubPath}:`, error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Function to check if file exists in GitHub
async function checkFileExists(githubPath) {
  const https = require('https');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contents/${githubPath}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
        'User-Agent': 'Moroccan Images Check Script'
      }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

// Function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process all images
async function uploadAllImages() {
  console.log('🚀 Starting Moroccan images upload to GitHub...\n');
  
  // Check configuration
  if (CONFIG.GITHUB_TOKEN === 'your_github_token_here') {
    console.error('❌ Please update GITHUB_TOKEN in the script');
    return;
  }
  
  if (CONFIG.REPO_OWNER === 'your_username') {
    console.error('❌ Please update REPO_OWNER in the script');
    return;
  }
  
  if (!fs.existsSync(IMAGES_BASE_PATH)) {
    console.error('❌ Images folder not found:', IMAGES_BASE_PATH);
    return;
  }

  const uploadResults = [];
  const errors = [];

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
      const githubFilename = createGitHubFilename(imageFile, categoryName);
      const githubPath = `public/images/moroccan-food/${githubFilename}`;

      try {
        console.log(`   Processing: ${imageFile} → ${githubFilename}`);
        
        // Check if file already exists
        const exists = await checkFileExists(githubPath);
        if (exists) {
          console.log(`   ⏭️  Skipping existing file: ${githubPath}`);
          continue;
        }

        // Upload the file
        await uploadToGitHub(originalPath, githubPath);
        uploadResults.push({
          original: imageFile,
          github: githubPath,
          category: categoryName,
          url: `https://raw.githubusercontent.com/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${githubPath}`
        });

        // Add delay to avoid rate limiting
        await delay(1500);

      } catch (error) {
        console.error(`   ❌ Error uploading ${imageFile}:`, error.message);
        errors.push({
          file: imageFile,
          error: error.message
        });
      }
    }
  }

  // Print summary
  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded: ${uploadResults.length} images`);
  console.log(`❌ Failed uploads: ${errors.length} images`);

  if (uploadResults.length > 0) {
    console.log('\n📋 Uploaded files:');
    uploadResults.forEach(result => {
      console.log(`  ${result.original} → ${result.github}`);
      console.log(`  URL: ${result.url}`);
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
}

// Function to generate database update script
function generateDatabaseUpdateScript(uploadResults) {
  const scriptContent = `// Auto-generated script to update menu items with new image URLs
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maraksh';
const DB_NAME = 'maraksh';

// Image mappings
const imageMappings = ${JSON.stringify(uploadResults, null, 2)};

async function updateMenuItems() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('menuitems');
    
    console.log('🔄 Updating menu items with new image URLs...');
    
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
            image: mapping.url
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(\`✅ Updated \${result.modifiedCount} items for: \${originalName}\`);
      } else {
        console.log(\`⚠️  No items found for: \${originalName}\`);
      }
    }
    
    console.log('✅ Database update completed!');
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
  } finally {
    await client.close();
  }
}

updateMenuItems();
`;

  const scriptPath = path.join(__dirname, 'update-moroccan-images-db.js');
  fs.writeFileSync(scriptPath, scriptContent);
  console.log(`📝 Database update script created: ${scriptPath}`);
}

// Run the upload
if (require.main === module) {
  uploadAllImages().catch(console.error);
}

module.exports = { uploadAllImages, createGitHubFilename, normalizeForGitHub };











