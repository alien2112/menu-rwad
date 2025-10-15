# Automated Cleanup Setup Guide with Excel Export

This guide explains how to set up automated data cleanup for the restaurant management system with **Excel export functionality**.

## Overview

The system automatically archives and cleans old data to maintain optimal performance:
- **Orders**: Archived after 2 weeks
- **Material Usage**: Archived after 1 month  
- **Notifications**: Cleaned after 1 week (resolved only)

**🔄 Excel Export First**: All data is exported to Excel files **before** deletion to ensure no data loss.

## Environment Variables

Add these to your `.env.local` file:

```env
# Required for cron job security
CRON_SECRET=your-secret-key-here

# Optional: Google Drive credentials (for future use)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

## Cron Job Setup

### Option 1: Using Vercel Cron (Recommended)

1. **Add to `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cleanup-with-export",
      "schedule": "0 2 * * *"
    }
  ]
}
```

2. **Schedule**: Runs daily at 2 AM UTC
3. **Authentication**: Uses `CRON_SECRET` for security
4. **Excel Export**: Automatically generates Excel files before cleanup

### Option 2: External Cron Service

Use services like:
- **cron-job.org**
- **EasyCron**
- **SetCronJob**

**Endpoint**: `https://your-domain.com/api/cleanup-with-export`  
**Method**: POST  
**Headers**: `Authorization: Bearer your-cron-secret`  
**Schedule**: Daily at 2 AM

### Option 3: Server Cron (Self-hosted)

```bash
# Add to crontab
0 2 * * * curl -X POST -H "Authorization: Bearer your-cron-secret" https://your-domain.com/api/cleanup-with-export
```

## Manual Cleanup with Excel Export

You can trigger cleanup manually from the admin panel:

1. Go to `/admin/archiving`
2. Click "Trigger Cleanup"
3. Confirm the action
4. **Excel files download automatically** before data deletion

## Excel Export Features

### **Automatic Downloads**
- **Orders**: `orders_cleanup_YYYY-MM-DD.xlsx`
- **Usage**: `usage_cleanup_YYYY-MM-DD.xlsx`
- **Notifications**: `notifications_cleanup_YYYY-MM-DD.xlsx`

### **File Contents**
- **Orders**: Complete order data with customer info, items, departments
- **Usage**: Material consumption records with quantities and dates
- **Notifications**: All notification history with status and timestamps

### **Safety Features**
- ✅ **Export First**: Excel files created before any deletion
- ✅ **Error Handling**: No deletion if export fails
- ✅ **Archive Logs**: Track all cleanup operations
- ✅ **Base64 Download**: Secure file transfer

## Monitoring

### Archive Logs
- View all cleanup operations in `/admin/archiving`
- Check archive status and file names
- Monitor success/failure rates
- Download Excel files from archive history

### Excel Files
- Files are generated in memory for immediate download
- Each cleanup creates separate files by data type
- Files are named with timestamps for easy identification

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check `CRON_SECRET` matches
   - Verify environment variables

2. **Excel Export Failed**
   - Check database connection
   - Verify data exists for cleanup period
   - Review error messages in admin panel

3. **Download Issues**
   - Check browser download settings
   - Ensure pop-ups are allowed
   - Try different browser

### Logs
- Check Vercel function logs
- Monitor archive log entries
- Review error messages in admin panel
- Check Excel file generation status

## Security Notes

- **CRON_SECRET**: Use a strong, random string
- **HTTPS**: Always use HTTPS for cron endpoints
- **Rate Limiting**: Consider implementing rate limiting
- **File Security**: Excel files are generated securely in memory

## Customization

### Modify Cleanup Periods
Edit `/api/cleanup-with-export/route.ts`:
```typescript
// Change from 2 weeks to 1 week
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
```

### Add New Data Types
1. Create new archive log entry
2. Add data fetching logic
3. Implement Excel export
4. Add deletion logic (only after successful export)

## Excel Export Benefits

✅ **Data Safety**: Export before deletion ensures no data loss  
✅ **Immediate Access**: Files download automatically  
✅ **Universal Format**: Works with Excel, Google Sheets, etc.  
✅ **Offline Storage**: Files stored locally for backup  
✅ **Easy Sharing**: Send files via email or cloud storage  
✅ **Data Analysis**: Use Excel's built-in tools  

## Support

For issues or questions:
1. Check the archive logs in admin panel
2. Review Vercel function logs
3. Verify environment variables
4. Test manual cleanup first
5. Check Excel file downloads
