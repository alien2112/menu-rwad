import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IAnalyticsReport extends Document {
  reportType: 'sales' | 'revenue' | 'profit' | 'inventory' | 'staff' | 'waste' | 'comprehensive';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  generatedBy: string;
  
  // Sales Data
  salesData?: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    salesByDay?: Array<{
      date: string;
      sales: number;
      orders: number;
    }>;
    salesByHour?: Array<{
      hour: number;
      sales: number;
      orders: number;
    }>;
  };
  
  // Revenue Data
  revenueData?: {
    totalRevenue: number;
    revenueByDepartment: Array<{
      department: string;
      revenue: number;
      percentage: number;
    }>;
    revenueByCategory: Array<{
      categoryId: string;
      categoryName: string;
      revenue: number;
      percentage: number;
    }>;
  };
  
  // Profit Data
  profitData?: {
    totalProfit: number;
    totalCost: number;
    profitMargin: number;
    topProfitableItems: Array<{
      itemId: string;
      itemName: string;
      profit: number;
      margin: number;
      quantitySold: number;
    }>;
    topProfitableCategories: Array<{
      categoryId: string;
      categoryName: string;
      profit: number;
      margin: number;
    }>;
  };
  
  // Best Selling Items
  bestSellingData?: {
    topItems: Array<{
      itemId: string;
      itemName: string;
      quantitySold: number;
      revenue: number;
      department: string;
    }>;
    topCategories: Array<{
      categoryId: string;
      categoryName: string;
      quantitySold: number;
      revenue: number;
    }>;
  };
  
  // Peak Hours Analysis
  peakHoursData?: {
    peakHours: Array<{
      hour: number;
      orders: number;
      revenue: number;
      intensity: 'low' | 'medium' | 'high' | 'peak';
    }>;
    busiestDay: string;
    quietestDay: string;
    averageOrdersPerHour: number;
  };
  
  // Staff Performance
  staffPerformanceData?: Array<{
    staffId: string;
    staffName: string;
    role: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    efficiency: number; // orders per hour
  }>;
  
  // Inventory Analytics
  inventoryData?: {
    turnoverRate: number;
    fastMovingItems: Array<{
      materialId: string;
      materialName: string;
      turnoverRate: number;
      quantityUsed: number;
    }>;
    slowMovingItems: Array<{
      materialId: string;
      materialName: string;
      turnoverRate: number;
      quantityUsed: number;
    }>;
    totalInventoryValue: number;
    costOfGoodsSold: number;
  };
  
  // Waste Tracking
  wasteData?: {
    totalWasteCost: number;
    wasteByCategory: Array<{
      category: string;
      cost: number;
      percentage: number;
    }>;
    wasteTrends: Array<{
      date: string;
      cost: number;
      items: number;
    }>;
    topWasteItems: Array<{
      itemName: string;
      cost: number;
      frequency: number;
    }>;
  };
  
  // KPIs Summary
  kpis?: {
    totalSales: number;
    totalProfit: number;
    ordersToday: number;
    topItem: string;
    averageOrderValue: number;
    profitMargin: number;
    inventoryTurnover: number;
    staffEfficiency: number;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

const AnalyticsReportSchema = new Schema<IAnalyticsReport>(
  {
    reportType: {
      type: String,
      enum: ['sales', 'revenue', 'profit', 'inventory', 'staff', 'waste', 'comprehensive'],
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    generatedBy: {
      type: String,
      required: true,
    },
    
    // Nested schemas for different data types
    salesData: {
      totalSales: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
      salesByDay: [{
        date: String,
        sales: Number,
        orders: Number,
      }],
      salesByHour: [{
        hour: Number,
        sales: Number,
        orders: Number,
      }],
    },
    
    revenueData: {
      totalRevenue: { type: Number, default: 0 },
      revenueByDepartment: [{
        department: String,
        revenue: Number,
        percentage: Number,
      }],
      revenueByCategory: [{
        categoryId: String,
        categoryName: String,
        revenue: Number,
        percentage: Number,
      }],
    },
    
    profitData: {
      totalProfit: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 },
      profitMargin: { type: Number, default: 0 },
      topProfitableItems: [{
        itemId: String,
        itemName: String,
        profit: Number,
        margin: Number,
        quantitySold: Number,
      }],
      topProfitableCategories: [{
        categoryId: String,
        categoryName: String,
        profit: Number,
        margin: Number,
      }],
    },
    
    bestSellingData: {
      topItems: [{
        itemId: String,
        itemName: String,
        quantitySold: Number,
        revenue: Number,
        department: String,
      }],
      topCategories: [{
        categoryId: String,
        categoryName: String,
        quantitySold: Number,
        revenue: Number,
      }],
    },
    
    peakHoursData: {
      peakHours: [{
        hour: Number,
        orders: Number,
        revenue: Number,
        intensity: { type: String, enum: ['low', 'medium', 'high', 'peak'] },
      }],
      busiestDay: String,
      quietestDay: String,
      averageOrdersPerHour: Number,
    },
    
    staffPerformanceData: [{
      staffId: String,
      staffName: String,
      role: String,
      totalOrders: Number,
      totalRevenue: Number,
      averageOrderValue: Number,
      efficiency: Number,
    }],
    
    inventoryData: {
      turnoverRate: Number,
      fastMovingItems: [{
        materialId: String,
        materialName: String,
        turnoverRate: Number,
        quantityUsed: Number,
      }],
      slowMovingItems: [{
        materialId: String,
        materialName: String,
        turnoverRate: Number,
        quantityUsed: Number,
      }],
      totalInventoryValue: Number,
      costOfGoodsSold: Number,
    },
    
    wasteData: {
      totalWasteCost: Number,
      wasteByCategory: [{
        category: String,
        cost: Number,
        percentage: Number,
      }],
      wasteTrends: [{
        date: String,
        cost: Number,
        items: Number,
      }],
      topWasteItems: [{
        itemName: String,
        cost: Number,
        frequency: Number,
      }],
    },
    
    kpis: {
      totalSales: Number,
      totalProfit: Number,
      ordersToday: Number,
      topItem: String,
      averageOrderValue: Number,
      profitMargin: Number,
      inventoryTurnover: Number,
      staffEfficiency: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
AnalyticsReportSchema.index({ reportType: 1, period: 1, startDate: -1 });
AnalyticsReportSchema.index({ generatedAt: -1 });
AnalyticsReportSchema.index({ startDate: 1, endDate: 1 });

// Static methods for report generation
AnalyticsReportSchema.statics.generateComprehensiveReport = async function(
  startDate: Date,
  endDate: Date,
  generatedBy: string
) {
  // This will be implemented in the service layer
  return this.create({
    reportType: 'comprehensive',
    period: 'custom',
    startDate,
    endDate,
    generatedBy,
  });
};

AnalyticsReportSchema.statics.getLatestReport = async function(reportType: string) {
  return this.findOne({ reportType })
    .sort({ generatedAt: -1 })
    .limit(1);
};

const AnalyticsReport: Model<IAnalyticsReport> = mongoose.models.AnalyticsReport || 
  mongoose.model<IAnalyticsReport>('AnalyticsReport', AnalyticsReportSchema);

export default AnalyticsReport;





