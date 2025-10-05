#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupGitHubUpload() {
  console.log('🔧 GitHub Images Upload Setup\n');
  
  console.log('This script will help you configure the Moroccan images upload to GitHub.\n');
  
  // Get GitHub token
  console.log('1. Get your GitHub Personal Access Token:');
  console.log('   - Go to GitHub → Settings → Developer settings → Personal access tokens');
  console.log('   - Click "Generate new token"');
  console.log('   - Select "repo" scope');
  console.log('   - Copy the generated token\n');
  
  const token = await question('Enter your GitHub token: ');
  
  // Get repository owner
  const owner = await question('Enter your GitHub username: ');
  
  // Get repository name
  const repo = await question('Enter your repository name (default: marakshv2): ') || 'marakshv2';
  
  // Update the script
  const scriptPath = path.join(__dirname, 'upload-moroccan-images-simple.js');
  let scriptContent = fs.readFileSync(scriptPath, 'utf8');
  
  scriptContent = scriptContent.replace(
    "const CONFIG = {\n  GITHUB_TOKEN: 'your_github_token_here', // Replace with your GitHub token\n  REPO_OWNER: 'your_username', // Replace with your GitHub username\n  REPO_NAME: 'marakshv2', // Replace with your repository name\n  BRANCH: 'master'\n};",
    `const CONFIG = {\n  GITHUB_TOKEN: '${token}',\n  REPO_OWNER: '${owner}',\n  REPO_NAME: '${repo}',\n  BRANCH: 'master'\n};`
  );
  
  fs.writeFileSync(scriptPath, scriptContent);
  
  console.log('\n✅ Configuration updated!');
  console.log(`📁 Script location: ${scriptPath}`);
  console.log('\n🚀 Ready to upload! Run:');
  console.log(`   node ${scriptPath}`);
  
  rl.close();
}

setupGitHubUpload().catch(console.error);










