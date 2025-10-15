# Excel Export Setup Guide

## Quick Setup for Excel Export

The restaurant management system now uses **Excel export** instead of Google Drive for immediate functionality. Google Drive integration is kept in the backend for future use.

## 📦 Installation

### 1. Install Excel Package

Run this command in your project directory:

```bash
npm install xlsx
```

Or if using yarn:

```bash
yarn add xlsx
```

### 2. Environment Variables (Optional for Excel)

For Excel export, you only need:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Optional: Cron job security (for automated cleanup)
CRON_SECRET=your-secret-key-for-cron-jobs
```

**Note:** Google Drive environment variables are not required for Excel export functionality.

## 🚀 How It Works

### **Excel Export Features:**

1. **Manual Archive Creation**
   - Go to `/admin/archiving`
   - Click "Create Archive"
   - Select data type (Orders, Usage, Notifications)
   - Choose date range
   - Excel file downloads automatically

2. **Automatic Cleanup**
   - System automatically archives old data
   - Creates Excel files for:
     - Orders older than 2 weeks
     - Material usage older than 1 month
     - Resolved notifications older than 1 week

3. **File Format**
   - All exports are in `.xlsx` format
   - Files are named with date ranges
   - Example: `orders_2024-01-01_to_2024-01-15.xlsx`

## 📊 What Gets Exported

### **Orders Export Includes:**
- Order number and date
- Customer information
- Order items and quantities
- Department assignments
- Status information
- Total amounts

### **Material Usage Export Includes:**
- Material details
- Quantities used
- Department information
- Order references
- Usage dates and types

### **Notifications Export Includes:**
- Notification types and priorities
- Messages and metadata
- Creation and resolution dates
- Related order/material information

## 🔧 Usage Examples

### **Create Manual Archive:**

1. **Access Archiving Dashboard:**
   ```
   https://your-domain.com/admin/archiving
   ```

2. **Create Archive:**
   - Select "Orders" from dropdown
   - Set start date: 2024-01-01
   - Set end date: 2024-01-31
   - Click "Create Archive"
   - Excel file downloads automatically

### **View Archive History:**
- All created archives appear in the dashboard
- Shows record counts and creation dates
- Displays file names and status

## 🔄 Future Google Drive Integration

The Google Drive functionality is preserved in the codebase and can be enabled later by:

1. **Adding Google credentials:**
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="your-private-key"
   ```

2. **Modifying the archive API** to upload to Google Drive instead of direct download

3. **Updating the UI** to show Google Drive links

## 🛠️ Troubleshooting

### **Excel Download Not Working:**
- Check browser download settings
- Ensure pop-ups are allowed
- Try a different browser

### **Archive Creation Fails:**
- Check database connection
- Verify date range is valid
- Check console for error messages

### **Large Files:**
- Excel files are generated in memory
- Very large datasets might cause memory issues
- Consider splitting large date ranges

## 📈 Benefits of Excel Export

✅ **Immediate functionality** - No setup required  
✅ **Universal compatibility** - Works with any spreadsheet software  
✅ **Offline access** - Files stored locally  
✅ **Easy sharing** - Send files via email or cloud storage  
✅ **Data analysis** - Use Excel's built-in tools  
✅ **Backup friendly** - Store files anywhere  

## 🎯 Next Steps

1. **Install the xlsx package**
2. **Test manual archive creation**
3. **Set up automated cleanup** (optional)
4. **Configure cron jobs** for automatic archiving

The system is now ready to use with Excel export functionality! 🎉

