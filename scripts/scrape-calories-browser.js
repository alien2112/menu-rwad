const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Website URL
const WEBSITE_URL = 'https://leafy-clafoutis-164d09.netlify.app/';

async function scrapeCalorieDataWithBrowser() {
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
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds for dynamic content
    
    // Get the full HTML content after JavaScript execution
    const html = await page.content();
    console.log(`Received ${html.length} characters of HTML`);
    
    // Look for calorie patterns
    const calorieData = [];
    
    // Search for calorie patterns in the rendered HTML
    const caloriePatterns = [
      /(\d+)\s*سعرة\s*حرارية/gi,
      /(\d+)\s*كيلو\s*سعرة\s*حرارية/gi,
      /(\d+)\s*كالوري/gi,
      /(\d+)\s*kcal/gi,
      /(\d+)\s*cal/gi,
      /سعرات\s*حرارية[:\s]*(\d+)/gi,
      /السعرات\s*الحرارية[:\s]*(\d+)/gi
    ];
    
    console.log('Searching for calorie patterns...');
    for (const pattern of caloriePatterns) {
      const matches = html.match(pattern);
      if (matches) {
        console.log(`Pattern ${pattern} found ${matches.length} matches:`, matches);
      }
    }
    
    // Look for menu items
    const menuItems = await page.$$eval('div', divs => {
      return divs.map(div => ({
        text: div.textContent,
        html: div.innerHTML
      })).filter(item => 
        item.text.includes('سعرة') || 
        item.text.includes('كالوري') || 
        item.text.includes('cal') ||
        item.text.includes('kcal')
      );
    });
    
    console.log(`Found ${menuItems.length} divs with calorie content`);
    
    menuItems.forEach((item, index) => {
      console.log(`\n--- Item ${index + 1} ---`);
      console.log(item.text.substring(0, 200));
      
      // Extract calories
      const calorieMatch = item.text.match(/(\d+)\s*(?:سعرة\s*حرارية|كالوري|kcal|cal)/i);
      if (calorieMatch) {
        console.log(`Found calories: ${calorieMatch[1]}`);
        calorieData.push({
          text: item.text.substring(0, 100),
          calories: parseInt(calorieMatch[1])
        });
      }
    });
    
    // Also try to find specific food items
    const foodItems = [
      'شكشوكة', 'بيض اومليت', 'كبده', 'فول', 'صينية مشكله',
      'حريره مفربية', 'بيصاره مغربية', 'مسمن مغربي', 'حرشه مغربية',
      'طاقوس مغربي', 'بوكاديوس', 'بطبوط جبن', 'بطبوط لحم', 'بطبوط خضار',
      'سلطة مغربية', 'جراتان'
    ];
    
    console.log('\nSearching for specific food items...');
    for (const foodItem of foodItems) {
      const elements = await page.$$eval('*', (elements, searchText) => {
        return elements.filter(el => 
          el.textContent.includes(searchText)
        ).map(el => el.textContent);
      }, foodItem);
      
      if (elements.length > 0) {
        console.log(`Found ${foodItem}:`, elements[0].substring(0, 200));
      }
    }
    
    console.log('\n=== CALORIE DATA EXTRACTED ===');
    console.log(`Found ${calorieData.length} items with calorie data:`);
    
    calorieData.forEach((item, index) => {
      console.log(`${index + 1}. ${item.text}: ${item.calories} calories`);
    });
    
    // Save the data to a JSON file
    const outputPath = path.join(__dirname, '..', 'scraped-calories.json');
    fs.writeFileSync(outputPath, JSON.stringify(calorieData, null, 2));
    console.log(`\nCalorie data saved to: ${outputPath}`);
    
    return calorieData;
    
  } catch (error) {
    console.error('Error scraping calorie data:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

scrapeCalorieDataWithBrowser();
