"use client";

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/SkeletonLoader';
import { 
  Settings, 
  Calculator, 
  FileText, 
  Shield, 
  Save, 
  AlertCircle,
  CheckCircle,
  Download,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface TaxSettings {
  _id?: string;
  enableTaxHandling: boolean;
  taxType: 'VAT' | 'GST' | 'SALES_TAX' | 'CUSTOM';
  vatRate: number;
  includeTaxInPrice: boolean;
  displayTaxBreakdown: boolean;
  generateTaxReports: boolean;
  taxNumber: string | null;
  complianceMode: 'Saudi ZATCA' | 'UAE FTA' | 'GCC' | 'CUSTOM';
  createdAt?: string;
  updatedAt?: string;
}

interface TaxReport {
  complianceReport: {
    period: {
      start: string;
      end: string;
      type: string;
    };
    taxSettings: {
      taxType: string;
      vatRate: number;
      complianceMode: string;
      taxNumber: string | null;
    };
    summary: {
      totalOrders: number;
      totalSales: number;
      taxableSales: number;
      totalTaxCollected: number;
      averageOrderValue: number;
    };
    breakdown: {
      taxRate: string;
      taxAmount: number;
      netAmount: number;
      grossAmount: number;
    };
  };
  dailyBreakdown: Array<{
    date: string;
    orders: number;
    sales: number;
    tax: number;
  }>;
  generatedAt: string;
}

export default function TaxComplianceSettings() {
  const [settings, setSettings] = useState<TaxSettings>({
    enableTaxHandling: true,
    taxType: 'VAT',
    vatRate: 15,
    includeTaxInPrice: true,
    displayTaxBreakdown: true,
    generateTaxReports: true,
    taxNumber: null,
    complianceMode: 'Saudi ZATCA'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'reports'>('settings');
  const [reports, setReports] = useState<TaxReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/tax-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching tax settings:', error);
      setMessage({ type: 'error', text: 'فشل في تحميل إعدادات الضرائب' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/tax-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في حفظ الإعدادات' });
      }
    } catch (error) {
      console.error('Error saving tax settings:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setSaving(false);
    }
  };

  const generateReport = async () => {
    setReportLoading(true);
    
    try {
      const response = await fetch(`/api/tax-reports?period=${reportPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.data);
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في إنشاء التقرير' });
      }
    } catch (error) {
      console.error('Error generating tax report:', error);
      setMessage({ type: 'error', text: 'خطأ في إنشاء التقرير' });
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reports) return;
    
    const reportData = {
      ...reports,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-report-${reportPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <Skeleton height="h-6" width="w-56" className="mb-2" />
              <Skeleton height="h-4" width="w-44" />
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Skeleton height="h-9" width="w-24" className="rounded-lg" />
            <Skeleton height="h-9" width="w-24" className="rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton height="h-5" width="w-5" className="rounded" />
              <Skeleton height="h-6" width="w-40" />
            </div>
            <div className="space-y-4">
              <Skeleton height="h-10" />
              <Skeleton height="h-10" />
              <Skeleton height="h-10" />
            </div>
          </div>
          <div className="admin-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton height="h-5" width="w-5" className="rounded" />
              <Skeleton height="h-6" width="w-40" />
            </div>
            <div className="space-y-4">
              <Skeleton height="h-10" />
              <Skeleton height="h-10" />
              <Skeleton height="h-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 admin-card rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إدارة الضرائب والامتثال</h1>
            <p>إعدادات الضرائب والتقارير المالية</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('settings')}
            className={`admin-button ${activeTab === 'settings' ? 'active' : ''}`}>
            الإعدادات
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`admin-button ${activeTab === 'reports' ? 'active' : ''}`}>
            التقارير
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-300'
            : 'bg-red-500/20 border border-red-500/30 text-red-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tax Configuration */}
          <div className="admin-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-5 h-5" />
              <h2 className="text-xl font-bold">إعدادات الضرائب</h2>
            </div>
            
            <div className="space-y-4">
              {/* Enable Tax Handling */}
              <div className="flex items-center justify-between">
                <label className="font-medium">تفعيل معالجة الضرائب</label>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, enableTaxHandling: !prev.enableTaxHandling }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.enableTaxHandling ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.enableTaxHandling ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Tax Type */}
              <div>
                <label className="block font-medium mb-2">نوع الضريبة</label>
                <select
                  value={settings.taxType}
                  onChange={(e) => setSettings(prev => ({ ...prev, taxType: e.target.value as any }))}
                  className="admin-input w-full"
                >
                  <option value="VAT">ضريبة القيمة المضافة (VAT)</option>
                  <option value="GST">ضريبة السلع والخدمات (GST)</option>
                  <option value="SALES_TAX">ضريبة المبيعات</option>
                  <option value="CUSTOM">مخصص</option>
                </select>
              </div>

              {/* VAT Rate */}
              <div>
                <label className="block font-medium mb-2">معدل الضريبة (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.vatRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, vatRate: Number(e.target.value) }))}
                  className="admin-input w-full"
                />
              </div>

              {/* Include Tax in Price */}
              <div className="flex items-center justify-between">
                <label className="font-medium">إدراج الضريبة في السعر</label>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, includeTaxInPrice: !prev.includeTaxInPrice }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.includeTaxInPrice ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.includeTaxInPrice ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Display Tax Breakdown */}
              <div className="flex items-center justify-between">
                <label className="font-medium">عرض تفصيل الضريبة</label>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, displayTaxBreakdown: !prev.displayTaxBreakdown }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.displayTaxBreakdown ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.displayTaxBreakdown ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Compliance Settings */}
          <div className="admin-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5" />
              <h2 className="text-xl font-bold">إعدادات الامتثال</h2>
            </div>
            
            <div className="space-y-4">
              {/* Compliance Mode */}
              <div>
                <label className="block font-medium mb-2">وضع الامتثال</label>
                <select
                  value={settings.complianceMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, complianceMode: e.target.value as any }))}
                  className="admin-input w-full"
                >
                  <option value="Saudi ZATCA">هيئة الزكاة والضريبة السعودية (ZATCA)</option>
                  <option value="UAE FTA">هيئة الإمارات للضرائب (FTA)</option>
                  <option value="GCC">مجلس التعاون الخليجي</option>
                  <option value="CUSTOM">مخصص</option>
                </select>
              </div>

              {/* Tax Number */}
              <div>
                <label className="block font-medium mb-2">رقم التسجيل الضريبي</label>
                <input
                  type="text"
                  value={settings.taxNumber || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, taxNumber: e.target.value || null }))}
                  placeholder={settings.complianceMode === 'Saudi ZATCA' ? '3XXXXXXXXXXXXXXX' : 'أدخل رقم التسجيل الضريبي'}
                  className="admin-input w-full"
                />
                {settings.complianceMode === 'Saudi ZATCA' && (
                  <p className="text-sm mt-1">يجب أن يكون 15 رقم يبدأ بـ 3</p>
                )}
              </div>

              {/* Generate Tax Reports */}
              <div className="flex items-center justify-between">
                <label className="font-medium">إنشاء تقارير ضريبية تلقائية</label>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, generateTaxReports: !prev.generateTaxReports }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.generateTaxReports ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.generateTaxReports ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Controls */}
          <div className="admin-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5" />
              <h2 className="text-xl font-bold">تقارير الضرائب</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <label className="block font-medium mb-2">الفترة الزمنية</label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value as any)}
                  className="admin-input"
                >
                  <option value="day">اليوم</option>
                  <option value="week">الأسبوع</option>
                  <option value="month">الشهر</option>
                  <option value="year">السنة</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={generateReport}
                  disabled={reportLoading}
                  className="admin-button"
                >
                  <TrendingUp className="w-4 h-4" />
                  {reportLoading ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
                </button>
                
                {reports && (
                  <button
                    onClick={downloadReport}
                    className="admin-button"
                  >
                    <Download className="w-4 h-4" />
                    تحميل
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Report Results */}
          {reports && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary */}
              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">ملخص التقرير</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>إجمالي الطلبات:</span>
                    <span className="font-bold">{reports.complianceReport.summary.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي المبيعات:</span>
                    <span className="font-bold">{reports.complianceReport.summary.totalSales} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المبيعات الخاضعة للضريبة:</span>
                    <span className="font-bold">{reports.complianceReport.summary.taxableSales} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي الضريبة المحصلة:</span>
                    <span className="font-bold text-green-400">{reports.complianceReport.summary.totalTaxCollected} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط قيمة الطلب:</span>
                    <span className="font-bold">{reports.complianceReport.summary.averageOrderValue} ر.س</span>
                  </div>
                </div>
              </div>

              {/* Tax Breakdown */}
              <div className="admin-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">تفصيل الضريبة</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>معدل الضريبة:</span>
                    <span className="font-bold">{reports.complianceReport.breakdown.taxRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مبلغ الضريبة:</span>
                    <span className="font-bold">{reports.complianceReport.breakdown.taxAmount} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المبلغ الصافي:</span>
                    <span className="font-bold">{reports.complianceReport.breakdown.netAmount} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المبلغ الإجمالي:</span>
                    <span className="font-bold">{reports.complianceReport.breakdown.grossAmount} ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      {activeTab === 'settings' && (
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="admin-button"
          >
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      )}
    </div>
  );
}





