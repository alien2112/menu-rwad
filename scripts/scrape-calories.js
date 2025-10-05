const fs = require('fs');
const path = require('path');
const https = require('https');

// Website URL
const WEBSITE_URL = 'https://leafy-clafoutis-164d09.netlify.app/';

function getPageContent(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      console.log(`Website response status: ${response.statusCode}`);
      
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        console.log(`Received ${data.length} characters of HTML`);
        resolve(data);
      });
    }).on('error', (err) => {
      console.error('Error fetching website:', err.message);
      reject(err);
    });
  });
}

function extractCalorieData(html) {
  console.log('Extracting calorie data from HTML...');
  
  const calorieData = [];
  
  // Look for calorie patterns in Arabic
  const caloriePatterns = [
    /(\d+)\s*سعرة\s*حرارية/gi,
    /(\d+)\s*كيلو\s*سعرة\s*حرارية/gi,
    /(\d+)\s*كالوري/gi,
    /(\d+)\s*kcal/gi,
    /(\d+)\s*cal/gi,
    /سعرات\s*حرارية[:\s]*(\d+)/gi,
    /السعرات\s*الحرارية[:\s]*(\d+)/gi
  ];
  
  // Look for menu items with calories
  const menuItemPattern = /<div[^>]*class="[^"]*menu-item[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
  const menuItems = html.match(menuItemPattern) || [];
  
  console.log(`Found ${menuItems.length} potential menu items`);
  
  menuItems.forEach((item, index) => {
    console.log(`\n--- Menu Item ${index + 1} ---`);
    console.log(item.substring(0, 200) + '...');
    
    // Extract item name
    const nameMatch = item.match(/<h3[^>]*>([^<]+)<\/h3>/i) || 
                     item.match(/<h2[^>]*>([^<]+)<\/h2>/i) ||
                     item.match(/<div[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/div>/i);
    
    if (nameMatch) {
      const itemName = nameMatch[1].trim();
      console.log(`Item name: ${itemName}`);
      
      // Look for calories in this item
      let calories = null;
      for (const pattern of caloriePatterns) {
        const match = item.match(pattern);
        if (match) {
          calories = parseInt(match[1]);
          console.log(`Found calories: ${calories}`);
          break;
        }
      }
      
      if (calories) {
        calorieData.push({
          name: itemName,
          calories: calories,
          source: 'scraped'
        });
      }
    }
  });
  
  // Also search the entire HTML for calorie patterns
  console.log('\nSearching entire HTML for calorie patterns...');
  for (const pattern of caloriePatterns) {
    const matches = html.match(pattern);
    if (matches) {
      console.log(`Pattern ${pattern} found ${matches.length} matches:`, matches);
    }
  }
  
  // Look for specific food items with their calories
  const foodItems = [
    'شكشوكة', 'بيض اومليت', 'كبده', 'فول', 'صينية مشكله',
    'حريره مفربية', 'بيصاره مغربية', 'مسمن مغربي', 'حرشه مغربية',
    'طاقوس مغربي', 'بوكاديوس', 'بطبوط جبن', 'بطبوط لحم', 'بطبوط خضار',
    'سلطة مغربية', 'جراتان'
  ];
  
  console.log('\nSearching for specific food items...');
  foodItems.forEach(foodItem => {
    const itemRegex = new RegExp(`${foodItem}[\\s\\S]{0,200}(\\d+)\\s*(?:سعرة\\s*حرارية|كالوري|kcal|cal)`, 'gi');
    const match = html.match(itemRegex);
    if (match) {
      console.log(`Found ${foodItem}: ${match[0]}`);
    }
  });
  
  return calorieData;
}

async function scrapeCalorieData() {
  try {
    console.log('Fetching website content...');
    console.log(`URL: ${WEBSITE_URL}`);
    
    const html = await getPageContent(WEBSITE_URL);
    
    console.log('\nFirst 1000 characters of HTML:');
    console.log(html.substring(0, 1000));
    
    const calorieData = extractCalorieData(html);
    
    console.log('\n=== CALORIE DATA EXTRACTED ===');
    console.log(`Found ${calorieData.length} items with calorie data:`);
    
    calorieData.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}: ${item.calories} calories`);
    });
    
    // Save the data to a JSON file
    const outputPath = path.join(__dirname, '..', 'scraped-calories.json');
    fs.writeFileSync(outputPath, JSON.stringify(calorieData, null, 2));
    console.log(`\nCalorie data saved to: ${outputPath}`);
    
    return calorieData;
    
  } catch (error) {
    console.error('Error scraping calorie data:', error.message);
  }
}

scrapeCalorieData();
