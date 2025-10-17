# 🧪 MongoDB Test Data Seeding Guide

This guide explains how to use the comprehensive MongoDB test data seeding script for your menu website.

## 🚀 Quick Start

### Prerequisites
- MongoDB running locally or accessible via connection string
- Node.js and npm installed
- Environment variables configured (`.env` file)

### Basic Usage

```bash
# Seed your main database
npm run seed:db

# Seed test database
npm run seed:test

# Or run directly
node scripts/seedDatabase.js
```

## 📊 What Gets Created

The seeding script populates your database with realistic, interconnected test data:

### 🍅 Ingredients (25 items)
- **Vegetables**: طماطم, بصل, خس, جزر, فلفل أخضر
- **Dairy & Proteins**: جبن موزاريلا, جبن شيدر, لحم بقري, دجاج, بيض
- **Grains & Bread**: دقيق, خبز عربي, معكرونة
- **Beverages**: قهوة, شاي, حليب, عصير برتقال
- **Condiments**: ملح, فلفل أسود, زيت زيتون, ثوم
- **Special**: تبغ شيشة, فحم شيشة, عسل

### 📦 Inventory Records (25 items)
- **Linked to ingredients** with realistic stock levels
- **Low-stock simulation** for testing alerts
- **Proper thresholds** and status tracking

### 🍽️ Menu Items (8 items)
- **بيتزا مارغريتا** - Classic Italian pizza
- **برجر كلاسيك** - Beef burger with vegetables
- **سلطة سيزر** - Caesar salad
- **قهوة أمريكية** - American coffee
- **شاي بالنعناع** - Mint tea
- **كيك الشوكولاتة** - Chocolate cake
- **ساندويتش دجاج** - Chicken sandwich
- **شيشة تفاح** - Apple shisha

### 📂 Categories (7 categories)
- البيتزا, الساندويتش, السلطات, المشروبات الساخنة, الشاي, الحلويات, الشيشة

### 📋 Sample Orders (15 orders)
- **Realistic order data** with proper calculations
- **Multi-department workflow** (kitchen, barista, shisha)
- **Customer information** and delivery details
- **Tax calculations** and discount handling

### 🚮 Waste Logs (8 logs)
- **Ingredient waste tracking** with cost analysis
- **Multiple waste reasons** (spoiled, overcooked, expired, damaged)
- **Department-specific** waste logging

### 👥 Users (4 users)
- **admin** / admin2024 - System administrator
- **kitchen** / kitchen2024 - Kitchen staff
- **barista** / barista2024 - Barista staff
- **shisha** / shisha2024 - Shisha operator

### 📍 Locations (1 location)
- **Main branch** with complete address and opening hours

### 🎁 Offers (4 offers)
- **Percentage and fixed discounts**
- **Applicable to specific items/categories**
- **Usage limits and tracking**

### ⭐ Reviews (25 reviews)
- **Customer reviews** for menu items
- **Rating system** (1-5 stars)
- **Verified reviews** and helpful counts

## 🔗 Data Relationships

The script creates proper relationships between collections:

```
Ingredients ←→ Inventory Items
     ↓
Menu Items ←→ Orders
     ↓
Reviews ←→ Menu Items
     ↓
Offers ←→ Menu Items & Categories
```

## 🧪 Test Scenarios Ready

After seeding, you can test:

### 📊 Inventory Management
- **Low stock alerts** (some ingredients below threshold)
- **Stock level monitoring** and updates
- **Cost tracking** and analysis

### 🍽️ Menu Operations
- **Order processing** with inventory deduction
- **Multi-language support** (Arabic/English)
- **Department-specific workflows**

### 📈 Analytics & Reporting
- **Waste tracking** and cost analysis
- **Sales reporting** with tax calculations
- **Customer review** management

### 🔄 Workflow Testing
- **Order lifecycle** (pending → confirmed → preparing → ready → delivered)
- **Department coordination** (kitchen, barista, shisha)
- **Multi-branch support**

## ⚙️ Configuration

### Environment Variables
```bash
# .env file
MONGODB_URI=mongodb://localhost:27017/maraksh
# or for production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/maraksh
```

### Demo Constants
The script uses these demo constants for consistency:
- `DEMO_TENANT_ID`: 'demo-tenant-1'
- `DEMO_BRANCH_ID`: 'demo-branch-1'
- `DEMO_RESTAURANT_ID`: 'demo-restaurant-1'

## 🛠️ Customization

### Adding More Ingredients
Edit the `INGREDIENT_DATA` array in `scripts/seedDatabase.js`:

```javascript
const INGREDIENT_DATA = [
  { name: 'طماطم', nameEn: 'Tomato', unit: 'kg', pricePerUnit: 8.5, allergens: [] },
  // Add more ingredients here
];
```

### Adding More Menu Items
Edit the `MENU_ITEMS_DATA` array:

```javascript
const MENU_ITEMS_DATA = [
  {
    name: 'بيتزا مارغريتا',
    nameEn: 'Margherita Pizza',
    // ... other properties
  },
  // Add more menu items here
];
```

### Modifying Quantities
Change the loop counts in the seeding functions:

```javascript
// For more orders
for (let i = 0; i < 30; i++) { // Change from 15 to 30

// For more reviews
for (let i = 0; i < 50; i++) { // Change from 25 to 50
```

## 🔍 Verification

After running the script, verify the data:

### MongoDB Compass
1. Connect to your database
2. Check each collection has the expected number of documents
3. Verify relationships between collections

### Admin Dashboard
1. Open your admin dashboard
2. Check inventory levels and alerts
3. Verify menu items display correctly
4. Test order processing workflow

## 🚨 Troubleshooting

### Common Issues

**Connection Error**
```
❌ MongoDB connection failed
```
- Check if MongoDB is running
- Verify connection string in `.env`
- Ensure network access if using cloud MongoDB

**Model Import Error**
```
Cannot find module '../lib/models/...'
```
- Ensure all model files exist in `lib/models/`
- Check file paths are correct
- Verify model exports

**Duplicate Key Error**
```
E11000 duplicate key error
```
- Clear existing data first
- Check for unique constraints
- Ensure proper cleanup between runs

### Reset Database
To start fresh:

```bash
# Clear all collections
mongo maraksh --eval "db.dropDatabase()"

# Or clear specific collections
mongo maraksh --eval "
  db.ingredients.deleteMany({});
  db.inventoryitems.deleteMany({});
  db.menuitems.deleteMany({});
  db.orders.deleteMany({});
  // ... other collections
"
```

## 📝 Script Output

The script provides detailed logging:

```
🌱 Starting MongoDB test data seeding...
==================================================
✅ Connected to MongoDB
🧹 Clearing existing data...
   ✅ Cleared ingredients
   ✅ Cleared inventoryitems
   ...
🍅 Creating ingredients...
✅ Created 25 ingredients
📦 Creating inventory records...
✅ Created 25 inventory records
...
==================================================
🎉 Database seeding completed successfully!
📊 Summary:
   - Ingredients: 25
   - Inventory Items: 25
   - Categories: 7
   - Menu Items: 8
   - Orders: 15
   - Waste Logs: 8
   - Users: 4
   - Locations: 1
   - Offers: 4
   - Reviews: 25

🔗 Data Relationships:
   ✅ Menu items reference ingredients
   ✅ Inventory tracks ingredient stock levels
   ✅ Orders reference menu items
   ✅ Waste logs track ingredient losses
   ✅ Reviews linked to menu items
   ✅ Offers applicable to menu items and categories

🧪 Test Scenarios Ready:
   ✅ Low stock alerts (some ingredients below threshold)
   ✅ Order processing with inventory deduction
   ✅ Waste tracking and cost analysis
   ✅ Multi-language support (Arabic/English)
   ✅ Department-specific workflows

🔌 Database connection closed
✅ Seeding completed successfully!
🚀 Your database is now ready for testing!
```

## 🎯 Next Steps

After seeding your database:

1. **Test the admin dashboard** - Verify all data displays correctly
2. **Test order processing** - Create orders and check inventory deduction
3. **Test low stock alerts** - Verify alerts trigger for low-stock items
4. **Test multi-language** - Switch between Arabic and English
5. **Test department workflows** - Process orders through different departments

Your MongoDB database is now fully populated with realistic, interconnected test data ready for comprehensive testing! 🎉
