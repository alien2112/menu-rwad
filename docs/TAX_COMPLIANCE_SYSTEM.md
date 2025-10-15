# Tax & Compliance Management System

## Overview

The Tax & Compliance Management System is a comprehensive solution for handling VAT calculations, tax reporting, and compliance with Saudi Arabia's ZATCA regulations. The system provides both administrative controls and automatic tax calculations throughout the application.

## Features

### 🏛️ Admin Dashboard
- **Tax Settings Management**: Configure VAT rates, tax handling modes, and compliance settings
- **Real-time Reports**: Generate tax reports for different time periods
- **Saudi ZATCA Compliance**: Built-in support for Saudi tax regulations
- **Export Functionality**: Download tax reports in JSON format

### 💰 Automatic Tax Calculations
- **Dynamic Pricing**: All prices automatically reflect tax settings
- **Flexible Tax Modes**: Support for both inclusive and exclusive tax pricing
- **Real-time Updates**: Tax calculations update immediately when settings change

### 📊 Tax Reporting
- **Compliance Reports**: Detailed breakdowns for tax authorities
- **Daily/Weekly/Monthly/Yearly Reports**: Flexible reporting periods
- **Tax Breakdown**: Subtotal, tax amount, and total calculations
- **Order Analytics**: Tax collection statistics and trends

## Default Configuration (Saudi Arabia)

```javascript
{
  enableTaxHandling: true,
  taxType: "VAT",
  vatRate: 15,
  includeTaxInPrice: true,
  displayTaxBreakdown: true,
  generateTaxReports: true,
  taxNumber: null,
  complianceMode: "Saudi ZATCA"
}
```

## API Endpoints

### Tax Settings
- `GET /api/tax-settings` - Retrieve current tax settings
- `PUT /api/tax-settings` - Update tax settings
- `POST /api/tax-settings` - Create initial tax settings

### Tax Reports
- `GET /api/tax-reports?period=month` - Generate tax reports
  - Parameters: `period` (day/week/month/year), `startDate`, `endDate`

## Database Schema

### TaxSettings Collection
```javascript
{
  _id: ObjectId,
  enableTaxHandling: Boolean,
  taxType: String, // 'VAT' | 'GST' | 'SALES_TAX' | 'CUSTOM'
  vatRate: Number, // 0-100
  includeTaxInPrice: Boolean,
  displayTaxBreakdown: Boolean,
  generateTaxReports: Boolean,
  taxNumber: String | null,
  complianceMode: String, // 'Saudi ZATCA' | 'UAE FTA' | 'GCC' | 'CUSTOM'
  createdAt: Date,
  updatedAt: Date
}
```

### Order Tax Information
```javascript
{
  // ... existing order fields
  taxInfo: {
    subtotal: Number,
    taxRate: Number,
    taxAmount: Number,
    includeTaxInPrice: Boolean
  }
}
```

## Tax Calculation Logic

### Tax Included in Price (Saudi Default)
```javascript
const subtotal = totalPrice / (1 + vatRate / 100);
const taxAmount = totalPrice - subtotal;
```

### Tax Added to Price
```javascript
const taxAmount = subtotal * (vatRate / 100);
const totalPrice = subtotal + taxAmount;
```

## Saudi ZATCA Compliance

### Tax Number Validation
- Format: 15 digits starting with '3'
- Regex: `/^3\d{14}$/`
- Example: `312345678901234`

### Required Information
- Business tax registration number
- VAT rate (15% standard)
- Tax-inclusive pricing
- Detailed tax breakdowns on receipts

## Frontend Integration

### useTaxSettings Hook
```javascript
const { 
  settings, 
  calculateTax, 
  formatPriceWithTax, 
  getTaxBreakdown 
} = useTaxSettings();
```

### Price Display
```javascript
// Automatic tax-aware pricing
const displayPrice = formatPriceWithTax(originalPrice);
// Result: "86.96 ر.س + 13.04 ر.س ضريبة" or "100.00 ر.س"
```

### Cart Integration
- Automatic tax calculations in cart
- Tax breakdown display when enabled
- Tax information included in orders

## Admin Interface

### Tax Settings Tab
- Toggle tax handling on/off
- Configure VAT rate (0-100%)
- Switch between inclusive/exclusive pricing
- Enable/disable tax breakdown display
- Set compliance mode
- Enter tax registration number

### Reports Tab
- Select reporting period
- Generate compliance reports
- View tax collection statistics
- Download reports in JSON format
- Daily breakdown analysis

## Receipt/Invoice Features

### Tax Breakdown Display
```
المجموع الفرعي: 86.96 ر.س
الضريبة (15%): 13.04 ر.س
المجموع الكلي: 100.00 ر.س
```

### Compliance Information
- Tax registration number
- VAT rate applied
- Tax calculation method
- Compliance mode indicator

## Testing

Run the test suite to verify all functionality:
```bash
node scripts/test-tax-system.js
```

### Test Coverage
- ✅ Tax calculations (inclusive/exclusive)
- ✅ Saudi tax number validation
- ✅ Compliance modes configuration
- ✅ Tax report calculations
- ✅ API endpoint functionality

## Security Considerations

### Data Protection
- Tax settings stored securely in database
- Tax numbers encrypted in transit
- Admin-only access to tax configuration
- Audit trail for tax setting changes

### Validation
- Input validation for all tax settings
- Rate limits (0-100% for VAT)
- Format validation for tax numbers
- Sanitization of all user inputs

## Deployment Notes

### Initial Setup
1. Tax settings are created automatically with Saudi defaults
2. Admin can modify settings through the dashboard
3. Changes take effect immediately across the application

### Database Migration
- New `tax_settings` collection created automatically
- Existing orders remain unchanged
- New orders include tax information

### Environment Variables
No additional environment variables required. The system uses existing database connections and configurations.

## Support

### Common Issues
1. **Tax not calculating**: Check if `enableTaxHandling` is true
2. **Wrong tax rate**: Verify VAT rate in admin settings
3. **Reports not generating**: Ensure `generateTaxReports` is enabled
4. **Tax number validation**: Confirm format matches compliance mode

### Troubleshooting
- Check browser console for JavaScript errors
- Verify API endpoints are accessible
- Confirm database connection is working
- Review admin permissions for tax settings

## Future Enhancements

### Planned Features
- Multi-currency tax support
- Advanced reporting with charts
- Integration with accounting systems
- Automated tax filing preparation
- Multi-location tax management

### Extensibility
The system is designed to be easily extended for:
- Additional compliance modes
- Custom tax calculation methods
- Integration with external tax services
- Advanced reporting requirements

---

## Quick Start Guide

1. **Access Admin Dashboard**: Navigate to `/admin/tax-compliance`
2. **Configure Settings**: Set your VAT rate and compliance mode
3. **Enter Tax Number**: Add your ZATCA registration number
4. **Test Calculations**: Verify prices display correctly
5. **Generate Reports**: Create your first tax report

The system is now ready to handle all your tax and compliance needs! 🎉





