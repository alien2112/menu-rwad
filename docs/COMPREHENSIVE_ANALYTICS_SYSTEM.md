# Comprehensive Analytics & Reporting System

## Overview

The Comprehensive Analytics & Reporting System is a full-featured business intelligence solution that provides detailed insights into sales, performance, and operations. It offers real-time analytics, interactive visualizations, and comprehensive reporting capabilities.

## Features

### 📊 **Sales Reports**
- **Multi-timeframe Analysis**: Daily, weekly, monthly, and yearly reports
- **Sales Metrics**: Total sales, order count, average order value
- **Visual Charts**: Line charts, bar charts, and area charts for trends
- **Hourly Analysis**: Peak hours detection and operational insights

### 💰 **Revenue Tracking**
- **Department Performance**: Revenue breakdown by kitchen, barista, shisha
- **Category Analysis**: Revenue by product categories
- **Comparison Charts**: Performance comparison across departments
- **Percentage Analysis**: Revenue distribution and trends

### 💵 **Profit Margin Calculation**
- **Cost Integration**: Uses existing cost field in MenuItem model
- **Profit Formula**: `profit = (sellingPrice - cost) * quantitySold`
- **Top Profitable Items**: Identifies most profitable products
- **Category Profitability**: Profit analysis by categories
- **Margin Calculations**: Percentage-based profit margins

### 🏆 **Best-Selling Items**
- **Top 10 Analysis**: Most popular items by quantity and revenue
- **Category Filters**: Filter by product categories
- **Department Filters**: Filter by preparation department
- **Time-based Analysis**: Best sellers for specific date ranges

### ⏰ **Peak Hours Analysis**
- **Hourly Breakdown**: Orders and revenue by hour
- **Intensity Levels**: Low, medium, high, and peak classifications
- **Busiest Days**: Identification of peak operational days
- **Visual Heatmaps**: Interactive time-based visualizations

### 👥 **Staff Performance Metrics**
- **Order Tracking**: Total orders handled per staff member
- **Revenue Generation**: Total revenue per staff member
- **Average Order Value**: Performance efficiency metrics
- **Role-based Analysis**: Performance by staff roles
- **Comparison Tables**: Staff performance comparisons

### 📦 **Inventory Turnover Reports**
- **Turnover Rate**: `turnover = costOfGoodsSold / averageInventoryValue`
- **Fast-moving Items**: High-turnover materials identification
- **Slow-moving Items**: Low-turnover materials identification
- **Cost Analysis**: Inventory value and usage cost tracking
- **Department Integration**: Material usage by department

### 🗑️ **Waste Tracking & Reports**
- **Manual Logging**: Admin waste entry system
- **Categorization**: Food, beverage, material, equipment, other
- **Reason Tracking**: Spoiled, broken, expired, damaged, etc.
- **Cost Summaries**: Total waste cost calculations
- **Trend Analysis**: Waste patterns over time
- **Recovery Tracking**: Recoverable waste management

## Technical Implementation

### Database Models

#### AnalyticsReport Collection
```javascript
{
  reportType: 'sales' | 'revenue' | 'profit' | 'inventory' | 'staff' | 'waste' | 'comprehensive',
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
  startDate: Date,
  endDate: Date,
  generatedAt: Date,
  generatedBy: string,
  salesData: { /* sales metrics and trends */ },
  revenueData: { /* revenue breakdowns */ },
  profitData: { /* profit calculations */ },
  bestSellingData: { /* top items analysis */ },
  peakHoursData: { /* time-based analysis */ },
  staffPerformanceData: [ /* staff metrics */ ],
  inventoryData: { /* inventory turnover */ },
  wasteData: { /* waste tracking */ },
  kpis: { /* key performance indicators */ }
}
```

#### WasteLog Collection
```javascript
{
  itemName: string,
  itemId?: string,
  category: 'food' | 'beverage' | 'material' | 'equipment' | 'other',
  quantity: number,
  unit: string,
  cost: number,
  reason: 'spoiled' | 'broken' | 'expired' | 'damaged' | 'overcooked' | 'spilled' | 'other',
  description?: string,
  department: 'kitchen' | 'barista' | 'shisha' | 'general',
  loggedBy: string,
  wasteDate: Date,
  isRecoverable: boolean,
  recoveryAction?: string
}
```

### API Endpoints

#### Comprehensive Analytics
- `GET /api/analytics/comprehensive` - Generate comprehensive analytics report
- Parameters: `period`, `startDate`, `endDate`, `generatedBy`

#### Waste Management
- `GET /api/waste-log` - Retrieve waste logs with filtering
- `POST /api/waste-log` - Create new waste log entry
- `PUT /api/waste-log` - Update existing waste log
- `DELETE /api/waste-log` - Delete waste log entry

#### Waste Analytics
- `GET /api/analytics/waste` - Generate waste analytics report
- Parameters: `startDate`, `endDate`, `department`, `groupBy`

#### Data Export
- `GET /api/analytics/export` - Export analytics data
- Parameters: `format` (csv/json), `type`, `period`, `startDate`, `endDate`

## User Interface

### Dashboard Layout
- **Card-based Design**: Clean, modern interface
- **KPI Cards**: Key metrics at the top
- **Tab Navigation**: Organized by analytics type
- **Interactive Charts**: Recharts integration for visualizations
- **Responsive Design**: Works on all device sizes

### View Modes
- **Numeric View**: Tabular data display
- **Graphical View**: Chart and visualization display
- **Toggle Switch**: Easy switching between modes

### Filtering Options
- **Date Range**: Custom date selection
- **Period Selection**: Predefined time periods
- **Department Filter**: Filter by operational departments
- **Category Filter**: Filter by product categories
- **Real-time Updates**: Dynamic data refresh

## Key Performance Indicators (KPIs)

### Sales KPIs
- Total Sales Revenue
- Total Number of Orders
- Average Order Value
- Sales Growth Rate

### Profit KPIs
- Total Profit Amount
- Profit Margin Percentage
- Cost of Goods Sold
- Gross Profit Ratio

### Operational KPIs
- Orders Today
- Peak Hour Performance
- Staff Efficiency Score
- Inventory Turnover Rate

### Waste KPIs
- Total Waste Cost
- Waste Reduction Rate
- Recovery Rate
- Waste by Category

## Charts and Visualizations

### Chart Types
- **Area Charts**: Sales trends over time
- **Bar Charts**: Department and category comparisons
- **Pie Charts**: Revenue distribution
- **Line Charts**: Performance trends
- **Heatmaps**: Peak hours visualization

### Interactive Features
- **Hover Tooltips**: Detailed information on hover
- **Click Interactions**: Drill-down capabilities
- **Zoom and Pan**: Detailed view controls
- **Legend Toggle**: Show/hide data series

## Export Functionality

### Export Formats
- **JSON**: Structured data export
- **CSV**: Spreadsheet-compatible format
- **PDF**: Formatted reports (planned)

### Export Types
- **Sales Data**: Order and revenue information
- **Profit Analysis**: Cost and margin data
- **Inventory Reports**: Usage and turnover data
- **Staff Performance**: Individual and team metrics
- **Waste Reports**: Waste tracking and analysis
- **Comprehensive**: All data combined

## Performance Optimization

### Database Indexing
- Composite indexes for common queries
- Date-based indexes for time-series data
- Department and category indexes
- Staff and user indexes

### Caching Strategy
- Report result caching
- Aggregated data caching
- Real-time data updates
- Cache invalidation on data changes

### Query Optimization
- Aggregation pipelines for complex calculations
- Lean queries for better performance
- Pagination for large datasets
- Selective field projection

## Security Considerations

### Access Control
- Admin-only access to analytics
- Role-based permissions
- User authentication required
- Session management

### Data Protection
- Sensitive data encryption
- Audit trail for changes
- Secure API endpoints
- Input validation and sanitization

## Testing

### Test Coverage
- ✅ Sales calculations and trends
- ✅ Profit margin calculations
- ✅ Inventory turnover analysis
- ✅ Waste tracking and categorization
- ✅ Staff performance metrics
- ✅ Peak hours analysis
- ✅ KPI calculations and scoring

### Test Script
Run the comprehensive test suite:
```bash
node scripts/test-analytics-system.js
```

## Usage Guide

### Accessing Analytics
1. Navigate to `/admin/analytics`
2. Select desired analytics tab
3. Choose time period and filters
4. View results in numeric or graphical mode
5. Export data as needed

### Waste Logging
1. Go to "تسجيل الهدر" tab
2. Click "تسجيل هدر جديد"
3. Fill in waste details
4. Save the entry
5. View waste analytics

### Generating Reports
1. Select comprehensive analytics
2. Choose report period
3. Click "إنشاء التقرير"
4. View detailed analysis
5. Export if needed

## Future Enhancements

### Planned Features
- **Real-time Notifications**: Alert system for KPIs
- **Predictive Analytics**: Forecasting and trends
- **Mobile App**: Dedicated mobile analytics
- **Advanced Filtering**: More granular filters
- **Custom Dashboards**: User-configurable layouts
- **API Integration**: Third-party system connections

### Scalability Improvements
- **Data Archiving**: Historical data management
- **Performance Monitoring**: System health tracking
- **Load Balancing**: Multi-server support
- **Microservices**: Service decomposition

## Support and Troubleshooting

### Common Issues
1. **Slow Loading**: Check database indexes
2. **Missing Data**: Verify data integrity
3. **Export Errors**: Check file permissions
4. **Chart Display**: Verify browser compatibility

### Performance Tips
- Use appropriate date ranges
- Enable caching for better performance
- Regular database maintenance
- Monitor system resources

---

## Quick Start

1. **Access Dashboard**: Navigate to admin analytics
2. **Select Period**: Choose your analysis timeframe
3. **View KPIs**: Check key performance indicators
4. **Explore Tabs**: Navigate through different analytics
5. **Export Data**: Download reports as needed

The Comprehensive Analytics & Reporting System is now ready to provide deep insights into your business operations! 🚀





