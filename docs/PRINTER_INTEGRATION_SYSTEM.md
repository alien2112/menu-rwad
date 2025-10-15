# Printer Integration System

## Overview

The Printer Integration System provides automatic order ticket printing to department-specific thermal printers. The system seamlessly integrates with the existing order management flow and supports multiple connection types with comprehensive monitoring and error handling.

## Features

### 🖨️ **Printer Management**
- **Multi-Connection Support**: LAN, WiFi, USB, and Bluetooth connections
- **Department Assignment**: Assign printers to specific departments (kitchen, barista, shisha)
- **Connection Testing**: Test printer connectivity from admin dashboard
- **Status Monitoring**: Real-time printer status (online/offline)
- **Print Statistics**: Track print count, errors, and performance

### 🔄 **Automatic Order Routing**
- **Smart Detection**: Automatically detect items by department
- **Multi-Department Orders**: Handle orders spanning multiple departments
- **Separate Tickets**: Print individual tickets for each department
- **Instant Printing**: Print immediately when order status changes to "confirmed"

### 📄 **Ticket Formatting**
- **ESC/POS Protocol**: Full thermal printer compatibility
- **Arabic Support**: UTF-8 encoding for Arabic text
- **Clean Layout**: Receipt-style formatting optimized for 58mm/80mm paper
- **QR Codes**: Optional QR code inclusion for order tracking
- **Customizable**: Font size, copies, paper cut, buzzer settings

### 📊 **Monitoring & Logging**
- **Print Job Tracking**: Complete audit trail of all print jobs
- **Error Handling**: Automatic retry logic with exponential backoff
- **Performance Metrics**: Success rates, print times, uptime monitoring
- **Admin Controls**: Reprint, cancel, and retry failed jobs

## Technical Implementation

### Database Models

#### Printer Collection
```javascript
{
  _id: ObjectId,
  name: String, // "Kitchen Printer"
  department: String, // 'kitchen' | 'barista' | 'shisha' | 'general'
  connectionType: String, // 'USB' | 'LAN' | 'WiFi' | 'Bluetooth'
  connectionDetails: {
    ipAddress: String, // For LAN/WiFi
    port: Number, // Default 9100
    deviceId: String,
    usbPath: String, // For USB
    bluetoothAddress: String // For Bluetooth
  },
  paperWidth: Number, // 58 or 80 (mm)
  isActive: Boolean,
  isOnline: Boolean,
  lastTestAt: Date,
  lastPrintAt: Date,
  lastOrderPrinted: String,
  printCount: Number,
  errorCount: Number,
  lastError: String,
  settings: {
    copies: Number,
    printCustomerCopy: Boolean,
    printInternalCopy: Boolean,
    includeLogo: Boolean,
    includeQRCode: Boolean,
    fontSize: String, // 'small' | 'medium' | 'large'
    paperCut: Boolean,
    buzzer: Boolean
  }
}
```

#### PrintJob Collection
```javascript
{
  _id: ObjectId,
  jobId: String, // Unique job identifier
  printerId: String,
  printerName: String,
  department: String,
  orderId: String,
  orderNumber: String,
  jobType: String, // 'order' | 'test' | 'reprint'
  status: String, // 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled'
  priority: String, // 'low' | 'normal' | 'high' | 'urgent'
  ticketData: {
    items: [/* order items */],
    customerInfo: {/* customer details */},
    orderInfo: {/* order details */},
    departmentInfo: {/* department details */}
  },
  printSettings: {/* printer settings */},
  attempts: Number,
  maxAttempts: Number,
  errorMessage: String,
  startedAt: Date,
  completedAt: Date,
  createdBy: String
}
```

### API Endpoints

#### Printer Management
- `GET /api/printers` - Get all printers with filtering
- `POST /api/printers` - Create new printer
- `PUT /api/printers` - Update printer settings
- `DELETE /api/printers` - Delete printer

#### Printer Testing
- `POST /api/printers/test?printerId=X&type=connection` - Test connection
- `POST /api/printers/test?printerId=X&type=print` - Test print

#### Print Jobs
- `GET /api/print-jobs` - Get print jobs with filtering
- `POST /api/print-jobs` - Create print job
- `PUT /api/print-jobs?action=reprint` - Reprint job
- `PUT /api/print-jobs?action=cancel` - Cancel job
- `PUT /api/print-jobs?action=retry` - Retry failed job

## Order Routing Logic

### Automatic Detection
1. **Order Creation**: When new order is placed
2. **Item Analysis**: System analyzes each item's department
3. **Department Grouping**: Groups items by department
4. **Printer Assignment**: Finds active printers for each department
5. **Job Creation**: Creates separate print jobs for each department
6. **Immediate Printing**: Sends jobs to printers instantly

### Department Mapping
```javascript
const categoryToDepartment = {
  // Kitchen items
  'food': 'kitchen',
  'main-dishes': 'kitchen',
  'appetizers': 'kitchen',
  'desserts': 'kitchen',
  
  // Barista items
  'coffee': 'barista',
  'tea': 'barista',
  'cold-coffee': 'barista',
  'hot-coffee': 'barista',
  'natural-juices': 'barista',
  'cocktails': 'barista',
  
  // Shisha items
  'shisha': 'shisha',
  'tobacco': 'shisha'
};
```

## ESC/POS Ticket Format

### Ticket Structure
```
==================================================
مقهى مراكش
تذكرة المطبخ
==================================================
رقم الطلب: #123456
التاريخ: 12/10/2025, 7:50:14 ص
العميل: أحمد محمد
الهاتف: 0501234567
الطاولة: 5
المسؤول: محمد الشيف
الوقت المتوقع: 20 دقيقة
==================================================
المنتجات المطلوبة:
==================================================
1. برجر لحم
   Beef Burger
   الكمية: 2 × 45.00 ر.س
   المجموع: 90.00 ر.س
   التخصيصات:
   - بدون بصل
   - جبن إضافي
   ملاحظات: مشوي جيداً
==================================================
المجموع الفرعي: 78.26 ر.س
الضريبة (15%): 11.74 ر.س
المجموع الكلي: 90.00 ر.س
==================================================
شكراً لكم
نتمنى لكم وجبة شهية
[QR Code]
==================================================
```

### ESC/POS Commands
- **Initialize**: `ESC @` - Reset printer
- **Encoding**: `ESC t 0` - Set UTF-8 encoding
- **Alignment**: `ESC a 0/1/2` - Left/Center/Right
- **Font**: `ESC ! 0/8` - Normal/Bold
- **Cut**: `GS V 0` - Full paper cut
- **Buzzer**: `ESC B 5 5` - Sound notification

## Connection Types

### LAN/WiFi (Network)
- **Protocol**: TCP Socket
- **Port**: 9100 (default)
- **Test Method**: Socket connection to IP:port
- **Use Case**: Most common for restaurant environments

### USB
- **Protocol**: Direct device access
- **Path**: `/dev/usb/lp0` (Linux) or `COM1` (Windows)
- **Test Method**: File system device check
- **Use Case**: Direct connection to POS system

### Bluetooth
- **Protocol**: Bluetooth Serial Port Profile (SPP)
- **Address**: MAC address format `00:11:22:33:44:55`
- **Test Method**: Bluetooth pairing and connection
- **Use Case**: Mobile or wireless setups

## Arabic Text Support

### Encoding
- **Character Set**: UTF-8
- **ESC/POS Command**: `ESC t 0`
- **Right-to-Left**: Supported by thermal printers
- **Fonts**: Built-in Arabic fonts in thermal printers

### Sample Arabic Text
```
مقهى مراكش - Restaurant name
تذكرة المطبخ - Kitchen ticket
برجر لحم - Beef burger
قهوة عربية - Arabic coffee
شكراً لكم - Thank you
```

## Admin Dashboard Features

### Printer Settings Page
- **Add/Edit Printers**: Configure new printers
- **Connection Testing**: Test printer connectivity
- **Status Monitoring**: View online/offline status
- **Print Statistics**: View print counts and errors
- **Settings Management**: Configure print options

### Print Job Monitoring
- **Job Queue**: View pending and active jobs
- **Job History**: Complete audit trail
- **Error Tracking**: Failed jobs with error messages
- **Reprint Options**: Manual reprint functionality

### Orders Page Integration
- **Print Buttons**: Manual print triggers per order
- **Department Printing**: Print specific departments
- **Status Feedback**: Real-time print status updates

## Error Handling

### Automatic Retry Logic
- **Maximum Attempts**: 3 retries per job
- **Retry Delay**: 30 seconds with exponential backoff
- **Failure Handling**: Mark job as failed after max attempts
- **Manual Intervention**: Admin can retry failed jobs

### Common Error Scenarios
1. **Printer Offline**: Queue job for retry when online
2. **Network Error**: Retry connection, fallback to manual print
3. **Paper Out**: Alert staff, pause printing
4. **Queue Full**: Prioritize urgent orders
5. **Invalid Data**: Log error, continue with valid items

## Performance Monitoring

### Key Metrics
- **Success Rate**: Percentage of successful prints
- **Print Time**: Average time to complete print job
- **Uptime**: Printer availability percentage
- **Queue Length**: Number of pending jobs
- **Error Rate**: Percentage of failed jobs

### Benchmarks
- **Target Success Rate**: >95%
- **Target Print Time**: <5 seconds
- **Target Uptime**: >99%
- **Maximum Queue Length**: <10 jobs

## Security & Permissions

### Access Control
- **Admin Only**: Printer management restricted to admins
- **Staff Permissions**: Staff can trigger prints for their department
- **Audit Trail**: Complete logging of all print activities
- **User Tracking**: Track who initiated each print job

### Data Protection
- **Secure Connections**: Encrypted communication for network printers
- **Input Validation**: Validate all printer configuration data
- **Error Logging**: Secure error message handling
- **Session Management**: Proper authentication for print operations

## Testing

### Test Coverage
- ✅ Printer models and configuration
- ✅ Order routing and department assignment
- ✅ ESC/POS ticket formatting
- ✅ Multiple connection types support
- ✅ Arabic text printing support
- ✅ Print job lifecycle management
- ✅ Error handling and retry logic
- ✅ Performance metrics and monitoring

### Test Script
Run the comprehensive test suite:
```bash
node scripts/test-printer-system.js
```

## Usage Guide

### Initial Setup
1. **Access Admin Dashboard**: Navigate to `/admin/printers`
2. **Add Printers**: Configure printers for each department
3. **Test Connections**: Verify printer connectivity
4. **Configure Settings**: Set print options and preferences
5. **Test Printing**: Send test tickets to verify formatting

### Daily Operations
1. **Monitor Status**: Check printer online status
2. **View Print Jobs**: Monitor job queue and history
3. **Handle Errors**: Retry failed jobs as needed
4. **Maintenance**: Regular printer maintenance and paper loading

### Troubleshooting
1. **Printer Offline**: Check network connection and power
2. **Print Failures**: Review error messages and retry
3. **Format Issues**: Verify ESC/POS compatibility
4. **Arabic Text**: Ensure UTF-8 encoding is set

## Future Enhancements

### Planned Features
- **Cloud Printing**: Integration with cloud print services
- **Mobile Printing**: Print from mobile devices
- **Advanced Analytics**: Detailed print analytics and reporting
- **Printer Maintenance**: Automated maintenance scheduling
- **Multi-Location**: Support for multiple restaurant locations

### Scalability Improvements
- **Load Balancing**: Distribute print jobs across multiple printers
- **Queue Management**: Advanced job prioritization
- **Performance Optimization**: Faster print processing
- **Integration APIs**: Third-party system integration

---

## Quick Start

1. **Configure Printers**: Add printers in admin dashboard
2. **Test Connections**: Verify all printers are online
3. **Place Test Order**: Create order to test automatic printing
4. **Monitor Jobs**: Check print job status and history
5. **Troubleshoot**: Handle any connection or format issues

The Printer Integration System is now ready to automatically handle all order printing needs! 🖨️✨





