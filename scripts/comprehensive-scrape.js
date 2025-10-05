const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Website URL
const WEBSITE_URL = 'https://leafy-clafoutis-164d09.netlify.app/';

async function comprehensiveScrape() {
  let browser;
  
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    console.log('Navigating to website...');
    await page.goto(WEBSITE_URL, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('Waiting for content to load...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    
    // Get all text content
    const allText = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    console.log('\n=== ALL TEXT CONTENT ===');
    console.log(allText.substring(0, 2000));
    
    // Look for any nutritional information
    const nutritionalKeywords = [
      'سعرة', 'سعرات', 'حرارية', 'كالوري', 'cal', 'kcal',
      'بروتين', 'كربوهيدرات', 'دهون', 'ألياف', 'سكر',
      'صوديوم', 'فيتامين', 'معادن'
    ];
    
    console.log('\n=== SEARCHING FOR NUTRITIONAL KEYWORDS ===');
    nutritionalKeywords.forEach(keyword => {
      if (allText.includes(keyword)) {
        console.log(`Found keyword: ${keyword}`);
        // Find context around the keyword
        const index = allText.indexOf(keyword);
        const context = allText.substring(Math.max(0, index - 100), index + 100);
        console.log(`Context: ${context}`);
      }
    });
    
    // Look for menu items specifically
    const menuItems = await page.$$eval('*', elements => {
      return elements
        .filter(el => el.textContent && el.textContent.length > 10 && el.textContent.length < 200)
        .map(el => el.textContent.trim())
        .filter(text => 
          text.includes('شكشوكة') || 
          text.includes('بيض') || 
          text.includes('كبده') || 
          text.includes('فول') ||
          text.includes('حريره') ||
          text.includes('بيصاره') ||
          text.includes('مسمن') ||
          text.includes('حرشه') ||
          text.includes('طاقوس') ||
          text.includes('بوكاديوس') ||
          text.includes('بطبوط') ||
          text.includes('سلطة') ||
          text.includes('جراتان')
        );
    });
    
    console.log('\n=== FOUND MENU ITEMS ===');
    menuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
    
    // Save all text content for manual inspection
    const outputPath = path.join(__dirname, '..', 'website-content.txt');
    fs.writeFileSync(outputPath, allText);
    console.log(`\nAll content saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

comprehensiveScrape();
