"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Clock,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { Skeleton, SkeletonCard } from '@/components/SkeletonLoader';

interface AnalyticsData {
  reportType: string;
  period: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy: string;
  salesData: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    salesByDay: Array<{
      date: string;
      sales: number;
      orders: number;
    }>;
    salesByHour: Array<{
      hour: number;
      sales: number;
      orders: number;
    }>;
  };
  revenueData: {
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
  profitData: {
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
  bestSellingData: {
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
  peakHoursData: {
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
  staffPerformanceData: Array<{
    staffId: string;
    staffName: string;
    role: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    efficiency: number;
  }>;
  inventoryData: {
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
  wasteData: {
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
  kpis: {
    totalSales: number;
    totalProfit: number;
    ordersToday: number;
    topItem: string;
    averageOrderValue: number;
    profitMargin: number;
    inventoryTurnover: number;
    staffEfficiency: number;
  };
}

export default function ComprehensiveAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [viewMode, setViewMode] = useState<'numeric' | 'graphical'>('graphical');
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'profit' | 'inventory' | 'staff' | 'waste'>('overview');

  const chartColors = [
    '#C2914A', '#B8853F', '#8B6B2D', '#6A5122', '#D9A65A', '#E0B777',
    '#A67939', '#8B6914', '#CD853F', '#DAA520', '#B8860B', '#D2691E'
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/comprehensive?period=${period}&generatedBy=admin`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!data) return;
    
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      exportedBy: 'admin'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ر.س`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 admin-card rounded-xl">
              <Skeleton height="h-6" width="w-6" className="rounded" />
            </div>
            <div>
              <Skeleton height="h-6" width="w-64" className="mb-2" />
              <Skeleton height="h-4" width="w-56" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton height="h-10" width="w-28" className="rounded-lg" />
            <div className="flex admin-card rounded-lg p-1">
              <Skeleton height="h-8" width="w-16" className="rounded-md" />
              <Skeleton height="h-8" width="w-16" className="rounded-md" />
            </div>
            <Skeleton height="h-10" width="w-10" className="rounded-lg" />
            <Skeleton height="h-10" width="w-24" className="rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto md:justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="h-9" width="w-28" className="rounded-lg flex-shrink-0" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card rounded-2xl p-6">
            <Skeleton height="h-6" width="w-40" className="mb-4" />
            <Skeleton height="h-72" className="rounded-xl" />
          </div>
          <div className="admin-card rounded-2xl p-6">
            <Skeleton height="h-6" width="w-48" className="mb-4" />
            <Skeleton height="h-72" className="rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 admin-card">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">خطأ في تحميل البيانات</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="admin-button"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 admin-card">
        <p>لا توجد بيانات متاحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 admin-card rounded-xl">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">لوحة التحليلات الشاملة</h1>
            <p>تحليل شامل للأداء والمبيعات والعمليات</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="admin-input"
          >
            <option value="day">اليوم</option>
            <option value="week">الأسبوع</option>
            <option value="month">الشهر</option>
            <option value="year">السنة</option>
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex admin-card rounded-lg p-1">
            <button
              onClick={() => setViewMode('numeric')}
              className={`admin-button ${viewMode === 'numeric' ? 'active' : ''}`}>
              رقمي
            </button>
            <button
              onClick={() => setViewMode('graphical')}
              className={`admin-button ${viewMode === 'graphical' ? 'active' : ''}`}>
              بياني
            </button>
          </div>
          
          {/* Actions */}
          <button
            onClick={fetchAnalyticsData}
            className="admin-button"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button
            onClick={exportData}
            className="admin-button"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">إجمالي المبيعات</p>
              <p className="text-2xl font-bold">{formatCurrency(data.kpis.totalSales)}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="admin-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">إجمالي الأرباح</p>
              <p className="text-2xl font-bold">{formatCurrency(data.kpis.totalProfit)}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="admin-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">الطلبات اليوم</p>
              <p className="text-2xl font-bold">{data.kpis.ordersToday}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="admin-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">أكثر منتج مبيعاً</p>
              <p className="text-lg font-bold truncate">{data.kpis.topItem}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Award className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto md:justify-center">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
          { id: 'sales', label: 'المبيعات', icon: TrendingUp },
          { id: 'profit', label: 'الأرباح', icon: DollarSign },
          { id: 'inventory', label: 'المخزون', icon: Package },
          { id: 'staff', label: 'الموظفين', icon: Users },
          { id: 'waste', label: 'الهدر', icon: AlertTriangle }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`admin-button ${activeTab === tab.id ? 'active' : ''}`}>
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <div className="admin-card rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">اتجاه المبيعات</h3>
              {viewMode === 'graphical' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.salesData.salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--primary)" />
                    <YAxis stroke="var(--primary)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--neutral)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--primary)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="var(--highlight)" 
                      fill="var(--highlight)" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-2">
                  {data.salesData.salesByDay.slice(0, 7).map((day, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{day.date}</span>
                      <span className="font-bold">{formatCurrency(day.sales)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue by Department */}
            <div className="admin-card rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">الإيرادات حسب القسم</h3>
              {viewMode === 'graphical' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.revenueData.revenueByDepartment}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      label={({ department, percentage }) => `${department}: ${formatPercentage(percentage)}`}
                    >
                      {data.revenueData.revenueByDepartment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--neutral)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--primary)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-3">
                  {data.revenueData.revenueByDepartment.map((dept, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{dept.department}</span>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(dept.revenue)}</p>
                        <p className="text-sm">{formatPercentage(dept.percentage)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Sales Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">أداء المبيعات</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي المبيعات:</span>
                    <span className="font-bold">{formatCurrency(data.salesData.totalSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي الطلبات:</span>
                    <span className="font-bold">{data.salesData.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط قيمة الطلب:</span>
                    <span className="font-bold">{formatCurrency(data.salesData.averageOrderValue)}</span>
                  </div>
                </div>
              </div>

              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">أكثر المنتجات مبيعاً</h3>
                <div className="space-y-3">
                  {data.bestSellingData.topItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm">{item.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.quantitySold}</p>
                        <p className="text-sm">{formatCurrency(item.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">ساعات الذروة</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>أكثر الأيام ازدحاماً:</span>
                    <span className="font-bold">{data.peakHoursData.busiestDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>أقل الأيام ازدحاماً:</span>
                    <span className="font-bold">{data.peakHoursData.quietestDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط الطلبات/ساعة:</span>
                    <span className="font-bold">{data.peakHoursData.averageOrdersPerHour.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="admin-card rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">تحليل ساعات الذروة</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.peakHoursData.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="hour" stroke="var(--primary)" />
                  <YAxis stroke="var(--primary)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--neutral)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--primary)'
                    }} 
                  />
                  <Bar dataKey="orders" fill="var(--highlight)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'profit' && (
          <div className="space-y-6">
            {/* Profit Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">نظرة عامة على الأرباح</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي الأرباح:</span>
                    <span className="font-bold">{formatCurrency(data.profitData.totalProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي التكاليف:</span>
                    <span className="font-bold">{formatCurrency(data.profitData.totalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>هامش الربح:</span>
                    <span className="font-bold">{formatPercentage(data.profitData.profitMargin)}</span>
                  </div>
                </div>
              </div>

              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">أكثر المنتجات ربحية</h3>
                <div className="space-y-3">
                  {data.profitData.topProfitableItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm">كمية: {item.quantitySold}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.profit)}</p>
                        <p className="text-sm">{formatPercentage(item.margin)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">أكثر الفئات ربحية</h3>
                <div className="space-y-3">
                  {data.profitData.topProfitableCategories.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{category.categoryName}</span>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.profit)}</p>
                        <p className="text-sm">{formatPercentage(category.margin)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Inventory Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">نظرة عامة على المخزون</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>معدل الدوران:</span>
                    <span className="font-bold">{data.inventoryData.turnoverRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>قيمة المخزون الإجمالية:</span>
                    <span className="font-bold">{formatCurrency(data.inventoryData.totalInventoryValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تكلفة البضائع المباعة:</span>
                    <span className="font-bold">{formatCurrency(data.inventoryData.costOfGoodsSold)}</span>
                  </div>
                </div>
              </div>

              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">المواد سريعة الحركة</h3>
                <div className="space-y-3">
                  {data.inventoryData.fastMovingItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.materialName}</p>
                        <p className="text-sm">معدل الدوران: {item.turnoverRate.toFixed(2)}</p>
                      </div>
                      <span className="font-bold">{item.quantityUsed}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">المواد بطيئة الحركة</h3>
                <div className="space-y-3">
                  {data.inventoryData.slowMovingItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.materialName}</p>
                        <p className="text-sm">معدل الدوران: {item.turnoverRate.toFixed(2)}</p>
                      </div>
                      <span className="font-bold">{item.quantityUsed}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6">
            {/* Staff Performance */}
            <div className="admin-card rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">أداء الموظفين</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3">الاسم</th>
                      <th className="text-right py-3">الدور</th>
                      <th className="text-right py-3">الطلبات</th>
                      <th className="text-right py-3">الإيرادات</th>
                      <th className="text-right py-3">متوسط قيمة الطلب</th>
                      <th className="text-right py-3">الكفاءة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.staffPerformanceData.map((staff, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 font-medium">{staff.staffName}</td>
                        <td>{staff.role}</td>
                        <td>{staff.totalOrders}</td>
                        <td>{formatCurrency(staff.totalRevenue)}</td>
                        <td>{formatCurrency(staff.averageOrderValue)}</td>
                        <td>{staff.efficiency.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'waste' && (
          <div className="space-y-6">
            {/* Waste Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">نظرة عامة على الهدر</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي تكلفة الهدر:</span>
                    <span className="font-bold">{formatCurrency(data.wasteData.totalWasteCost)}</span>
                  </div>
                </div>
              </div>

              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">الهدر حسب الفئة</h3>
                <div className="space-y-3">
                  {data.wasteData.wasteByCategory.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.cost)}</p>
                        <p className="text-sm">{formatPercentage(category.percentage)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">أكثر العناصر هدراً</h3>
                <div className="space-y-3">
                  {data.wasteData.topWasteItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm">التكرار: {item.frequency}</p>
                      </div>
                      <span className="font-bold">{formatCurrency(item.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





