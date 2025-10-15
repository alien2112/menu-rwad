# Restaurant Management System - Complete Implementation

## Overview

This comprehensive restaurant management system includes storage/inventory management, multi-profiling system for different departments (Kitchen, Barista, Shisha), order management, notifications, and data archiving capabilities.

## 🏗️ System Architecture

### Database Models

1. **Material** - Inventory management
   - Tracks ingredients and supplies
   - Monitors quantities, limits, and costs
   - Supports categories (food, beverage, shisha, cleaning, other)

2. **MaterialUsage** - Consumption tracking
   - Records material usage per order
   - Links to departments and orders
   - Supports different usage types (order, manual, waste, adjustment)

3. **Order** - Enhanced order management
   - Department-specific status tracking
   - Material usage integration
   - Customer information and order details

4. **Department** - Multi-profiling system
   - Kitchen, Barista, Shisha departments
   - Department-specific configurations

5. **Notification** - Alert system
   - Low stock alerts
   - Order notifications
   - System alerts with priority levels

6. **ArchiveLog** - Data maintenance
   - Tracks archived data
   - Google Drive integration
   - Automated cleanup logs

## 🎯 Key Features

### 1. Storage/Inventory Management

**Features:**
- Add, edit, and manage materials
- Set custom alert thresholds
- Track current quantities and limits
- Monitor costs and suppliers
- Category-based organization

**API Endpoints:**
- `GET/POST /api/materials` - List and create materials
- `GET/PUT/DELETE /api/materials/[id]` - Individual material operations
- `GET/POST /api/materials/usage` - Usage tracking

**Admin Dashboard:** `/admin/storage`

### 2. Multi-Profiling System

**Departments:**
- **Kitchen** - Food preparation and cooking
- **Barista** - Beverage preparation
- **Shisha** - Shisha preparation and service

**Features:**
- Department-specific order views
- Real-time status updates
- Department-specific notifications
- Order assignment and tracking

**Dashboards:**
- `/admin/kitchen` - Kitchen operations
- `/admin/barista` - Barista operations  
- `/admin/shisha` - Shisha operations

### 3. Order Management

**Features:**
- Automatic department assignment based on menu categories
- Real-time status tracking per department
- Material usage deduction
- Customer information management
- Order history and analytics

**Order Flow:**
1. Customer places order (website or WhatsApp)
2. System assigns items to appropriate departments
3. Departments update status (pending → in_progress → ready → served)
4. Materials are automatically deducted from inventory
5. Notifications sent for low stock

**API Endpoints:**
- `GET/POST /api/orders` - Order management
- `PUT /api/orders/[id]/department-status` - Update department status

**Dashboards:**
- `/admin/orders` - Complete order overview
- `/order` - Customer order page

### 4. Notification System

**Alert Types:**
- Low stock alerts
- Out of stock alerts
- Expiry warnings
- Order alerts
- System notifications

**Features:**
- Priority-based notifications (low, medium, high, urgent)
- Read/unread status tracking
- Resolution tracking
- Department-specific alerts

**API Endpoints:**
- `GET/POST/PUT/DELETE /api/notifications` - Notification management

**Dashboard:** `/admin/notifications`

### 5. Data Maintenance & Archiving

**Features:**
- Automatic data cleanup (configurable intervals)
- Google Drive integration for archiving
- CSV export functionality
- Archive log tracking
- Manual archive creation

**Cleanup Schedule:**
- Orders: Archived after 2 weeks
- Material Usage: Archived after 1 month
- Resolved Notifications: Archived after 1 week

**API Endpoints:**
- `GET/POST /api/archive` - Archive management
- `POST /api/cleanup` - Automated cleanup

**Dashboard:** `/admin/archiving`

## 🔧 Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Google Drive Integration (for archiving)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cron Job Security
CRON_SECRET=your-secret-key-for-cron-jobs
```

### 2. Google Drive Setup

1. Create a Google Cloud Project
2. Enable Google Drive API
3. Create a Service Account
4. Download the JSON key file
5. Extract email and private key for environment variables
6. Share the target Google Drive folder with the service account email

### 3. Cron Job Setup

For automatic cleanup, set up a cron job:

```bash
# Daily cleanup at 2 AM
0 2 * * * curl -X POST "https://your-domain.com/api/cleanup" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  > /dev/null 2>&1
```

Or use Vercel Cron Jobs by adding to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 4. Department Configuration

The system automatically assigns orders to departments based on category mapping:

```typescript
const categoryToDepartment = {
  // Food categories → Kitchen
  'pizza': 'kitchen',
  'sandwiches': 'kitchen',
  'manakish': 'kitchen',
  'desserts': 'kitchen',
  
  // Beverage categories → Barista
  'hot-coffee': 'barista',
  'cold-coffee': 'barista',
  'tea': 'barista',
  'cocktails': 'barista',
  'natural-juices': 'barista',
  
  // Shisha category → Shisha
  'shisha': 'shisha'
};
```

## 📱 Usage Guide

### For Admins

1. **Storage Management** (`/admin/storage`)
   - Add new materials with quantities and limits
   - Monitor stock levels and receive alerts
   - Update quantities as materials are used

2. **Order Management** (`/admin/orders`)
   - View all orders across departments
   - Monitor order status and progress
   - Track customer information

3. **Department Dashboards**
   - Kitchen: Manage food orders
   - Barista: Manage beverage orders
   - Shisha: Manage shisha orders

4. **Notifications** (`/admin/notifications`)
   - View and manage alerts
   - Mark notifications as read/resolved
   - Monitor system health

5. **Archiving** (`/admin/archiving`)
   - Create manual archives
   - Monitor automated cleanup
   - Access archived data via Google Drive

### For Customers

1. **Order Page** (`/order`)
   - Browse menu items
   - Add items to cart
   - Provide customer information
   - Submit orders directly

### For Staff

1. **Department Dashboards**
   - View assigned orders
   - Update order status
   - Track preparation progress

## 🔄 Order Flow

1. **Order Creation**
   - Customer places order via website or WhatsApp
   - System creates order with department assignments
   - Materials are reserved (usage recorded)

2. **Department Processing**
   - Orders appear in relevant department dashboards
   - Staff update status: pending → in_progress → ready → served
   - Real-time updates across all dashboards

3. **Completion**
   - All departments mark items as served
   - Order marked as ready for delivery
   - Materials deducted from inventory

4. **Cleanup**
   - Orders archived after 2 weeks
   - Usage data archived after 1 month
   - Notifications cleaned up after resolution

## 🚨 Alert System

### Low Stock Alerts
- Triggered when material quantity ≤ alert limit
- Priority: High
- Sent to admin dashboard and notifications

### Out of Stock Alerts
- Triggered when material quantity = 0
- Priority: Urgent
- Immediate notification to admin

### Order Alerts
- New order notifications
- Department-specific alerts
- Status change notifications

## 📊 Analytics & Reporting

### Available Metrics
- Total orders by department
- Material consumption trends
- Order completion times
- Revenue tracking
- Inventory turnover rates

### Export Capabilities
- CSV exports for all data types
- Google Drive integration
- Automated archiving
- Custom date range exports

## 🔒 Security Features

- Admin authentication required
- API endpoint protection
- Cron job authentication
- Data validation and sanitization
- Secure Google Drive integration

## 🛠️ Maintenance

### Regular Tasks
1. Monitor notification dashboard
2. Check low stock alerts
3. Review archived data
4. Update material quantities
5. Verify cron job execution

### Troubleshooting
- Check Google Drive permissions
- Verify cron job configuration
- Monitor API endpoint responses
- Review error logs
- Test notification delivery

## 📈 Future Enhancements

1. **Advanced Analytics**
   - Predictive inventory management
   - Sales forecasting
   - Cost analysis tools

2. **Mobile App**
   - Staff mobile interface
   - Push notifications
   - Offline capability

3. **Integration Features**
   - POS system integration
   - Accounting software sync
   - Supplier management

4. **AI Features**
   - Demand prediction
   - Optimal inventory levels
   - Automated reordering

## 📞 Support

For technical support or questions about the system:
- Check the admin dashboards for system status
- Review notification logs for issues
- Monitor archive logs for data integrity
- Contact system administrator for critical issues

---

This system provides a complete solution for restaurant management with modern features, real-time updates, and comprehensive data management capabilities.


