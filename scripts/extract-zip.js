const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Path to the zip file
const zipPath = path.join(__dirname, '..', 'images from figma', 'موال مراكش طواجن .zip');
const extractPath = path.join(__dirname, '..', 'images from figma', 'extracted_images');

console.log('Extracting zip file...');
console.log('Zip path:', zipPath);
console.log('Extract path:', extractPath);

try {
  // Check if zip file exists
  if (!fs.existsSync(zipPath)) {
    console.error('Zip file not found:', zipPath);
    process.exit(1);
  }

  // Create extraction directory
  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }

  // Extract zip file
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);

  console.log('Extraction completed!');
  
  // List extracted files
  const extractedFiles = fs.readdirSync(extractPath);
  console.log('\nExtracted files:');
  extractedFiles.forEach(file => {
    console.log(`- ${file}`);
  });

} catch (error) {
  console.error('Error extracting zip file:', error.message);
}
