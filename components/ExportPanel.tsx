"use client";

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  Calendar,
  Filter,
  Settings,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Skeleton } from '@/components/SkeletonLoader';

interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    status?: string[];
    department?: string[];
    category?: string[];
  };
  fields: string[];
  includeCharts: boolean;
  includeImages: boolean;
}

interface ExportData {
  type: 'orders' | 'items' | 'users' | 'analytics' | 'inventory';
  data: any[];
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    totalRecords: number;
    filters: any;
  };
}

interface ExportPanelProps {
  dataType: 'orders' | 'items' | 'users' | 'analytics' | 'inventory';
  onExport: (options: ExportOptions) => Promise<void>;
  onPreview?: (options: ExportOptions) => Promise<ExportData>;
  loading?: boolean;
}

const exportFormats = [
  { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'ملف جدولي للتحليل' },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'ملف Excel متقدم' },
  { value: 'pdf', label: 'PDF', icon: FileText, description: 'تقرير PDF مع الرسوم البيانية' },
  { value: 'json', label: 'JSON', icon: FileText, description: 'بيانات خام للبرمجة' }
];

const statusOptions = [
  { value: 'pending', label: 'في الانتظار' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'preparing', label: 'قيد التحضير' },
  { value: 'ready', label: 'جاهز' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغي' }
];

const departmentOptions = [
  { value: 'kitchen', label: 'المطبخ' },
  { value: 'barista', label: 'البارستا' },
  { value: 'shisha', label: 'الشيشة' },
  { value: 'admin', label: 'الإدارة' }
];

const fieldOptions = {
  orders: [
    { value: 'orderNumber', label: 'رقم الطلب' },
    { value: 'customerInfo.name', label: 'اسم العميل' },
    { value: 'customerInfo.phone', label: 'رقم الهاتف' },
    { value: 'totalAmount', label: 'المبلغ الإجمالي' },
    { value: 'status', label: 'الحالة' },
    { value: 'orderDate', label: 'تاريخ الطلب' },
    { value: 'items', label: 'العناصر' },
    { value: 'notes', label: 'ملاحظات' }
  ],
  items: [
    { value: 'name', label: 'الاسم' },
    { value: 'nameEn', label: 'الاسم بالإنجليزية' },
    { value: 'price', label: 'السعر' },
    { value: 'category', label: 'الفئة' },
    { value: 'department', label: 'القسم' },
    { value: 'description', label: 'الوصف' },
    { value: 'isAvailable', label: 'متاح' },
    { value: 'createdAt', label: 'تاريخ الإنشاء' }
  ],
  users: [
    { value: 'username', label: 'اسم المستخدم' },
    { value: 'name', label: 'الاسم الكامل' },
    { value: 'role', label: 'الدور' },
    { value: 'isActive', label: 'نشط' },
    { value: 'lastLogin', label: 'آخر دخول' },
    { value: 'createdAt', label: 'تاريخ الإنشاء' }
  ],
  analytics: [
    { value: 'date', label: 'التاريخ' },
    { value: 'totalSales', label: 'إجمالي المبيعات' },
    { value: 'totalOrders', label: 'إجمالي الطلبات' },
    { value: 'averageOrderValue', label: 'متوسط قيمة الطلب' },
    { value: 'topItems', label: 'أكثر المنتجات مبيعاً' },
    { value: 'revenueByDepartment', label: 'الإيرادات حسب القسم' }
  ],
  inventory: [
    { value: 'materialName', label: 'اسم المادة' },
    { value: 'quantity', label: 'الكمية' },
    { value: 'unit', label: 'الوحدة' },
    { value: 'cost', label: 'التكلفة' },
    { value: 'supplier', label: 'المورد' },
    { value: 'lastUpdated', label: 'آخر تحديث' }
  ]
};

export default function ExportPanel({ dataType, onExport, onPreview, loading = false }: ExportPanelProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0]
    },
    filters: {},
    fields: fieldOptions[dataType]?.map(field => field.value) || [],
    includeCharts: true,
    includeImages: false
  });
  const [previewData, setPreviewData] = useState<ExportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportOptions);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = async () => {
    if (!onPreview) return;
    
    try {
      const data = await onPreview(exportOptions);
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  const handleFieldToggle = (fieldValue: string) => {
    setExportOptions(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldValue)
        ? prev.fields.filter(f => f !== fieldValue)
        : [...prev.fields, fieldValue]
    }));
  };

  const handleStatusToggle = (statusValue: string) => {
    setExportOptions(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        status: prev.filters.status?.includes(statusValue)
          ? prev.filters.status.filter(s => s !== statusValue)
          : [...(prev.filters.status || []), statusValue]
      }
    }));
  };

  const handleDepartmentToggle = (deptValue: string) => {
    setExportOptions(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        department: prev.filters.department?.includes(deptValue)
          ? prev.filters.department.filter(d => d !== deptValue)
          : [...(prev.filters.department || []), deptValue]
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        تصدير البيانات
      </button>

      {/* Export Panel */}
      {showPanel && (
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">خيارات التصدير</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm text-white/70 mb-3">نوع الملف</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {exportFormats.map((format) => {
                  const IconComponent = format.icon;
                  return (
                    <button
                      key={format.value}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                      className={`p-3 rounded-lg border transition-colors ${
                        exportOptions.format === format.value
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <IconComponent className="w-4 h-4 text-white" />
                        <span className="text-white font-medium">{format.label}</span>
                      </div>
                      <p className="text-white/60 text-xs">{format.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm text-white/70 mb-3">نطاق التاريخ</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1">من</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.start}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">إلى</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.end}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            {(dataType === 'orders' || dataType === 'analytics') && (
              <div>
                <label className="block text-sm text-white/70 mb-3">تصفية الحالة</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusToggle(status.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        exportOptions.filters.status?.includes(status.value)
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-white/70 mb-3">تصفية القسم</label>
              <div className="flex flex-wrap gap-2">
                {departmentOptions.map((dept) => (
                  <button
                    key={dept.value}
                    onClick={() => handleDepartmentToggle(dept.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      exportOptions.filters.department?.includes(dept.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Selection */}
            <div>
              <label className="block text-sm text-white/70 mb-3">الحقول المطلوبة</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {fieldOptions[dataType]?.map((field) => (
                  <label key={field.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.fields.includes(field.value)}
                      onChange={() => handleFieldToggle(field.value)}
                      className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500"
                    />
                    <span className="text-white/70 text-sm">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <label className="block text-sm text-white/70 mb-3">خيارات إضافية</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCharts}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500"
                  />
                  <span className="text-white/70 text-sm">تضمين الرسوم البيانية</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeImages}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                    className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500"
                  />
                  <span className="text-white/70 text-sm">تضمين الصور</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {onPreview && (
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  معاينة
                </button>
              )}
              
              <button
                onClick={handleExport}
                disabled={isExporting || loading}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isExporting ? 'جاري التصدير...' : 'تصدير'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-effect rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">معاينة البيانات</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">معلومات التصدير</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">عدد السجلات:</span>
                    <span className="text-white font-bold ml-2">{previewData.metadata.totalRecords}</span>
                  </div>
                  <div>
                    <span className="text-white/70">تاريخ التصدير:</span>
                    <span className="text-white font-bold ml-2">
                      {new Date(previewData.metadata.exportedAt).toLocaleString('ar-SA')}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/70">المصدر:</span>
                    <span className="text-white font-bold ml-2">{previewData.metadata.exportedBy}</span>
                  </div>
                  <div>
                    <span className="text-white/70">النوع:</span>
                    <span className="text-white font-bold ml-2">{previewData.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">عينة من البيانات</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        {Object.keys(previewData.data[0] || {}).map((key) => (
                          <th key={key} className="text-right py-2 text-white/70">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-b border-white/10">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="py-2 text-white/80">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.data.length > 5 && (
                  <p className="text-white/60 text-sm mt-2">
                    عرض 5 من أصل {previewData.data.length} سجل
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






