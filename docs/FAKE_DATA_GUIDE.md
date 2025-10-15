# Fake Data Generation Guide

## Overview

This guide provides instructions for generating and using fake data to test all features of the restaurant management system.

## 🚀 Quick Start

### 1. Generate Essential Data
```bash
cd marakshv3
node scripts/essential-fake-data.js
```

### 2. Add Sample Orders
```bash
node scripts/add-sample-orders.js
```

### 3. Verify Data
```bash
node scripts/verify-fake-data.js
```

### 4. Start Application
```bash
npm run dev
```

## 📊 Generated Test Data

The system now contains comprehensive test data:

### **Categories (14)**
- المشروبات الساخنة (Hot Beverages)
- المشروبات الباردة (Cold Beverages)
- القهوة العربية (Arabic Coffee)
- الشاي (Tea)
- العصائر الطبيعية (Natural Juices)
- الكوكتيلات (Cocktails)
- الأطباق الرئيسية (Main Dishes)
- المقبلات (Appetizers)
- البرجر (Burgers)
- البيتزا (Pizza)
- الساندويتشات (Sandwiches)
- الحلويات (Desserts)
- الشيشة (Shisha)
- التبغ (Tobacco)

### **Menu Items (64)**
- **Hot Beverages**: قهوة عربية, قهوة تركية, إسبريسو, لاتيه, كابتشينو, موكا, أمريكانو, ماكياتو
- **Tea**: شاي أحمر, شاي أخضر, شاي بالحليب, شاي بالنعناع, شاي بالزعفران
- **Cold Beverages**: قهوة باردة, فرابتشينو, آيس لاتيه, آيس كابتشينو
- **Natural Juices**: عصير برتقال, عصير تفاح, عصير مانجو, عصير فراولة, عصير أناناس, عصير جزر
- **Cocktails**: كوكتيل فواكه, كوكتيل تروبيكال, كوكتيل منعش
- **Main Dishes**: كباب لحم, كباب دجاج, كباب مشكل, مشاوي لحم, مشاوي دجاج
- **Appetizers**: حمص, متبل, فتوش, تبولة, سلطة خضراء, سلطة قيصر
- **Burgers**: برجر لحم, برجر دجاج, برجر نباتي, برجر دبل, برجر بالجبن
- **Pizza**: بيتزا مارغريتا, بيتزا بيبروني, بيتزا خضار, بيتزا دجاج, بيتزا مشكل
- **Sandwiches**: ساندويتش لحم, ساندويتش دجاج, ساندويتش تونة, ساندويتش جبن, ساندويتش خضار
- **Desserts**: كنافة, بقلاوة, أم علي, مهلبية, رز بالحليب, لقيمات
- **Shisha**: شيشة تفاح, شيشة عنب, شيشة فراولة, شيشة نعناع, شيشة ورد, شيشة مشكل

### **Materials (18)**
- **Food Items**: قهوة عربية, حليب طازج, سكر أبيض, لحم بقري طازج, دجاج طازج, خبز عربي, جبن موزاريلا, طماطم طازجة, بصل أبيض, خيار طازج, زيت زيتون, ليمون طازج, نعناع طازج
- **Shisha Items**: تبغ الشيشة عالي الجودة, فحم الشيشة, أكياس الشيشة, أنابيب الشيشة
- **Beverages**: مياه معدنية

### **Users (13)**
- **Admin**: admin / admin2024
- **Department Heads**: kitchen / kitchen2024, barista / barista2024, shisha / shisha2024
- **Kitchen Staff**: chef1 / chef2024, chef2 / chef2024, chef3 / chef2024
- **Barista Staff**: barista1 / barista2024, barista2 / barista2024, barista3 / barista2024
- **Shisha Staff**: shisha1 / shisha2024, shisha2 / shisha2024, shisha3 / shisha2024

### **Printers (3)**
- **Kitchen Printer**: طابعة المطبخ الرئيسية (LAN, 192.168.1.100:9100)
- **Barista Printer**: طابعة البارستا الرئيسية (WiFi, 192.168.1.101:9100)
- **Shisha Printer**: طابعة الشيشة الرئيسية (LAN, 192.168.1.102:9100)

### **Orders (20)**
- Realistic order history with customer data
- Multi-department orders (kitchen, barista, shisha)
- Tax calculations with 15% VAT
- Staff assignments and status tracking
- Various order statuses (pending, confirmed, preparing, ready, delivered)

### **Tax Settings (1)**
- Saudi VAT configuration (15% rate)
- ZATCA compliance mode
- Tax handling enabled
- Tax breakdown display enabled

## 🔐 Test Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin2024`
- **Role**: Full system access

### Department Accounts
- **Kitchen**: `kitchen` / `kitchen2024`
- **Barista**: `barista` / `barista2024`
- **Shisha**: `shisha` / `shisha2024`

### Staff Accounts
- **Chef 1**: `chef1` / `chef2024`
- **Chef 2**: `chef2` / `chef2024`
- **Chef 3**: `chef3` / `chef2024`
- **Barista 1**: `barista1` / `barista2024`
- **Barista 2**: `barista2` / `barista2024`
- **Barista 3**: `barista3` / `barista2024`
- **Shisha 1**: `shisha1` / `shisha2024`
- **Shisha 2**: `shisha2` / `shisha2024`
- **Shisha 3**: `shisha3` / `shisha2024`

## 🧪 Testing Scenarios

### 1. Frontend Testing

#### Menu Display
1. Navigate to http://localhost:3000
2. Verify all 14 categories are displayed
3. Check menu items show Arabic names and prices
4. Test category filtering
5. Verify item details and descriptions

#### Cart Functionality
1. Add items to cart from different categories
2. Verify cart shows correct quantities and totals
3. Test tax calculation (15% VAT included)
4. Check cart modal displays properly
5. Test item removal and quantity changes

#### Order Placement
1. Fill cart with items from multiple departments
2. Enter customer information
3. Place order via WhatsApp
4. Verify order confirmation modal
5. Check tax breakdown display

### 2. Admin Dashboard Testing

#### Login and Navigation
1. Login with admin credentials
2. Verify all navigation items are visible
3. Test role-based access (try different user roles)
4. Check responsive design on different screen sizes

#### Orders Management
1. Navigate to `/admin/orders`
2. View order list with 20 generated orders
3. Test order filtering by status and department
4. Check order details and item breakdown
5. Test print buttons for each order
6. Verify department status indicators

#### Menu Management
1. Navigate to `/admin/items`
2. View all 64 menu items with categories
3. Test item editing and creation
4. Verify cost and price calculations
5. Check category assignments

#### Category Management
1. Navigate to `/admin/categories`
2. View all 14 categories with Arabic names
3. Test category creation and editing
4. Verify department assignments
5. Check featured category settings

### 3. Tax & Compliance Testing

#### Tax Settings
1. Navigate to `/admin/tax-compliance`
2. Verify Saudi VAT settings (15% rate)
3. Test tax handling toggle
4. Check ZATCA tax number format
5. Test compliance mode settings

#### Tax Calculations
1. Create test orders with different amounts
2. Verify tax calculations in cart
3. Check tax breakdown on receipts
4. Test inclusive vs exclusive tax display
5. Verify tax reports generation

### 4. Analytics & Reporting Testing

#### Comprehensive Analytics
1. Navigate to `/admin/analytics`
2. View dashboard with KPIs
3. Test different time period filters
4. Check department performance charts
5. Verify profit margin calculations

#### Sales Reports
1. Generate daily, weekly, monthly reports
2. Check sales trends and patterns
3. Verify average order value calculations
4. Test best-selling items identification
5. Check peak hours analysis

### 5. Printer Integration Testing

#### Printer Management
1. Navigate to `/admin/printers`
2. View configured printers for each department
3. Test printer connection status
4. Check printer settings and configurations
5. Test printer addition and editing

#### Connection Testing
1. Test connection for each printer
2. Verify online/offline status indicators
3. Check connection error handling
4. Test different connection types (LAN, WiFi, USB, Bluetooth)

#### Print Job Testing
1. View print job history
2. Test manual print triggers from orders
3. Check department-specific printing
4. Verify print job status tracking
5. Test reprint and cancel functionality

### 6. Department-Specific Testing

#### Kitchen Operations
1. Login as kitchen staff
2. View kitchen-specific orders
3. Test order status updates
4. Check preparation time tracking
5. Verify kitchen printer integration

#### Barista Operations
1. Login as barista staff
2. View beverage orders
3. Test coffee preparation tracking
4. Check barista printer integration
5. Verify cold/hot beverage categorization

#### Shisha Operations
1. Login as shisha staff
2. View shisha orders
3. Test tobacco preparation tracking
4. Check shisha printer integration
5. Verify flavor and preparation options

### 7. Inventory Management Testing

#### Material Tracking
1. Navigate to inventory section
2. View material quantities and costs
3. Test low stock alerts
4. Check material usage tracking
5. Verify supplier information

#### Usage Monitoring
1. View material usage reports
2. Check consumption patterns
3. Test usage by menu item
4. Verify cost calculations
5. Check department usage breakdown

## 🔍 Data Verification

### Check Data in Database
```bash
node scripts/verify-fake-data.js
```

### Expected Output
```
📂 Categories: 14 found
🍽️ Menu Items: 64 found
📦 Materials: 18 found
👥 Users: 13 found
📋 Orders: 20 found
🖨️ Printers: 3 found
💰 Tax Settings: 1 found
```

## 🐛 Troubleshooting

### Data Not Visible
1. **Check Database Connection**: Ensure MongoDB is running
2. **Verify Data Generation**: Run verification script
3. **Check API Endpoints**: Test API responses
4. **Clear Browser Cache**: Refresh application
5. **Check Console Errors**: Look for JavaScript errors

### Common Issues
- **Empty Menu**: Check if categories and menu items were generated
- **No Orders**: Verify orders were added successfully
- **Login Issues**: Use correct test credentials
- **Print Errors**: Check printer configurations
- **Tax Calculations**: Verify tax settings are enabled

## 📈 Performance Testing

### Load Testing
1. Generate large amounts of test data
2. Test system performance with high order volumes
3. Check database query performance
4. Verify printer queue handling
5. Test concurrent user access

### Stress Testing
1. Test system limits with maximum data
2. Check memory usage and optimization
3. Verify error handling under stress
4. Test recovery mechanisms
5. Check system stability

## 🔧 Maintenance

### Data Refresh
```bash
# Clear and regenerate all data
node scripts/essential-fake-data.js
node scripts/add-sample-orders.js
```

### Data Backup
```bash
# Export data for backup
mongodump --db menurwad --out backup/
```

### Data Restore
```bash
# Restore data from backup
mongorestore --db menurwad backup/menurwad/
```

## 📝 Test Results

### Expected Test Results
- ✅ All categories and menu items display correctly
- ✅ Cart functionality works with tax calculations
- ✅ Orders can be placed and tracked
- ✅ Admin dashboard shows all data
- ✅ Tax settings work correctly
- ✅ Analytics display meaningful data
- ✅ Printer integration functions properly
- ✅ Department operations work smoothly
- ✅ Inventory management tracks materials
- ✅ Staff performance metrics are accurate

## 🎯 Success Criteria

### Functional Testing
- All features work as expected
- No critical bugs found
- Performance meets requirements
- User experience is smooth
- Data integrity maintained

### Integration Testing
- All systems work together
- Data flows correctly
- APIs function properly
- External integrations work
- Error handling is robust

### User Acceptance Testing
- Users can complete all tasks
- Interface is intuitive
- Performance is acceptable
- Features meet business needs
- System is ready for production

---

## 🚀 Ready for Production!

After completing all tests successfully, the system is ready for production deployment with:

- ✅ Complete restaurant management functionality
- ✅ Tax compliance and reporting
- ✅ Comprehensive analytics and insights
- ✅ Automatic printer integration
- ✅ Multi-department operations
- ✅ Inventory and waste management
- ✅ Staff performance tracking
- ✅ Arabic localization support

The system now provides a complete solution for restaurant operations with all requested features implemented and tested! 🎉





