"use client";

import { useState, useEffect } from 'react';
import { Skeleton, SkeletonCard } from '@/components/SkeletonLoader';
import { 
  Printer, 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  Wifi, 
  WifiOff, 
  Settings,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

interface PrinterData {
  _id?: string;
  name: string;
  department: 'kitchen' | 'barista' | 'shisha' | 'general';
  connectionType: 'USB' | 'LAN' | 'WiFi' | 'Bluetooth';
  connectionDetails: {
    ipAddress?: string;
    port?: number;
    deviceId?: string;
    usbPath?: string;
    bluetoothAddress?: string;
  };
  paperWidth: 58 | 80;
  isActive: boolean;
  isOnline: boolean;
  lastTestAt?: string;
  lastPrintAt?: string;
  lastOrderPrinted?: string;
  printCount: number;
  errorCount: number;
  lastError?: string;
  settings: {
    copies: number;
    printCustomerCopy: boolean;
    printInternalCopy: boolean;
    includeLogo: boolean;
    includeQRCode: boolean;
    fontSize: 'small' | 'medium' | 'large';
    paperCut: boolean;
    buzzer: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface PrintJob {
  jobId: string;
  printerId: string;
  printerName: string;
  department: string;
  orderId: string;
  orderNumber: string;
  jobType: 'order' | 'test' | 'reprint';
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attempts: number;
  maxAttempts: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
}

export default function PrinterManagementPanel() {
  const [printers, setPrinters] = useState<PrinterData[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'printers' | 'jobs'>('printers');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<Partial<PrinterData>>({
    name: '',
    department: 'kitchen',
    connectionType: 'LAN',
    connectionDetails: {
      ipAddress: '',
      port: 9100,
      deviceId: '',
      usbPath: '',
      bluetoothAddress: ''
    },
    paperWidth: 58,
    isActive: true,
    settings: {
      copies: 1,
      printCustomerCopy: true,
      printInternalCopy: true,
      includeLogo: false,
      includeQRCode: true,
      fontSize: 'medium',
      paperCut: true,
      buzzer: true
    }
  });

  useEffect(() => {
    fetchPrinters();
    fetchPrintJobs();
  }, []);

  const fetchPrinters = async () => {
    try {
      const response = await fetch('/api/printers');
      const data = await response.json();
      
      if (data.success) {
        setPrinters(data.data);
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في تحميل الطابعات' });
      }
    } catch (error) {
      console.error('Error fetching printers:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrintJobs = async () => {
    try {
      const response = await fetch('/api/print-jobs?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setPrintJobs(data.data.printJobs);
      }
    } catch (error) {
      console.error('Error fetching print jobs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/printers?id=${editingId}` : '/api/printers';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: editingId ? 'تم تحديث الطابعة بنجاح' : 'تم إنشاء الطابعة بنجاح' });
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchPrinters();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في حفظ الطابعة' });
      }
    } catch (error) {
      console.error('Error saving printer:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (printer: PrinterData) => {
    setFormData({
      ...printer,
      connectionDetails: {
        ipAddress: printer.connectionDetails?.ipAddress || '',
        port: printer.connectionDetails?.port || 9100,
        deviceId: printer.connectionDetails?.deviceId || '',
        usbPath: printer.connectionDetails?.usbPath || '',
        bluetoothAddress: printer.connectionDetails?.bluetoothAddress || ''
      }
    });
    setEditingId(printer._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الطابعة؟')) return;

    try {
      const response = await fetch(`/api/printers?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'تم حذف الطابعة بنجاح' });
        fetchPrinters();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في حذف الطابعة' });
      }
    } catch (error) {
      console.error('Error deleting printer:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    }
  };

  const handleTestConnection = async (printerId: string) => {
    setTesting(printerId);
    
    try {
      const response = await fetch(`/api/printers/test?printerId=${printerId}&type=connection`);
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم اختبار الاتصال بنجاح' });
        fetchPrinters(); // Refresh to update status
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في اختبار الاتصال' });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setMessage({ type: 'error', text: 'خطأ في اختبار الاتصال' });
    } finally {
      setTesting(null);
    }
  };

  const handleTestPrint = async (printerId: string) => {
    setTesting(printerId);
    
    try {
      const response = await fetch(`/api/printers/test?printerId=${printerId}&type=print`);
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'تم إرسال تذكرة الاختبار بنجاح' });
        fetchPrintJobs(); // Refresh print jobs
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في طباعة تذكرة الاختبار' });
      }
    } catch (error) {
      console.error('Error testing print:', error);
      setMessage({ type: 'error', text: 'خطأ في طباعة الاختبار' });
    } finally {
      setTesting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      department: 'kitchen',
      connectionType: 'LAN',
      connectionDetails: {
        ipAddress: '',
        port: 9100,
        deviceId: '',
        usbPath: '',
        bluetoothAddress: ''
      },
      paperWidth: 58,
      isActive: true,
      settings: {
        copies: 1,
        printCustomerCopy: true,
        printInternalCopy: true,
        includeLogo: false,
        includeQRCode: true,
        fontSize: 'medium',
        paperCut: true,
        buzzer: true
      }
    });
  };

  const getDepartmentLabel = (department: string) => {
    const labels: { [key: string]: string } = {
      kitchen: 'مطبخ',
      barista: 'بارستا',
      shisha: 'شيشة',
      general: 'عام'
    };
    return labels[department] || department;
  };

  const getConnectionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      USB: 'USB',
      LAN: 'شبكة محلية',
      WiFi: 'واي فاي',
      Bluetooth: 'بلوتوث'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'في الانتظار',
      printing: 'جاري الطباعة',
      completed: 'مكتمل',
      failed: 'فشل',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'text-yellow-400',
      printing: 'text-blue-400',
      completed: 'text-green-400',
      failed: 'text-red-400',
      cancelled: 'text-gray-400'
    };
    return colors[status] || 'text-gray-400';
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
              <Skeleton height="h-6" width="w-48" className="mb-2" />
              <Skeleton height="h-4" width="w-40" />
            </div>
          </div>
          <Skeleton height="h-10" width="w-32" className="rounded-lg" />
        </div>

        <div className="flex gap-2 justify-center">
          <Skeleton height="h-9" width="w-28" className="rounded-lg" />
          <Skeleton height="h-9" width="w-28" className="rounded-lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 admin-card rounded-xl">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إدارة الطابعات</h1>
            <p>إعداد وإدارة طابعات الأقسام</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="admin-button"
        >
          <Plus className="w-4 h-4" />
          إضافة طابعة
        </button>
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

      {/* Tab Navigation */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setActiveTab('printers')}
          className={`admin-button ${activeTab === 'printers' ? 'active' : ''}`}>
          الطابعات
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`admin-button ${activeTab === 'jobs' ? 'active' : ''}`}>
          مهام الطباعة
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'printers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {printers.map((printer) => (
            <div key={printer._id} className="admin-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    printer.isOnline ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {printer.isOnline ? (
                      <Wifi className="w-5 h-5 text-green-400" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{printer.name}</h3>
                    <p className="text-sm">{getDepartmentLabel(printer.department)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(printer)}
                    className="admin-button"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(printer._id!)}
                    className="admin-button"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>نوع الاتصال:</span>
                  <span>{getConnectionTypeLabel(printer.connectionType)}</span>
                </div>
                
                {printer.connectionDetails?.ipAddress && (
                  <div className="flex justify-between">
                    <span>عنوان IP:</span>
                    <span>{printer.connectionDetails.ipAddress}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>عرض الورق:</span>
                  <span>{printer.paperWidth}mm</span>
                </div>
                
                <div className="flex justify-between">
                  <span>عدد المطبوعات:</span>
                  <span>{printer.printCount}</span>
                </div>
                
                {printer.lastPrintAt && (
                  <div className="flex justify-between">
                    <span>آخر طباعة:</span>
                    <span className="text-sm">
                      {new Date(printer.lastPrintAt).toLocaleString('ar-SA')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleTestConnection(printer._id!)}
                  disabled={testing === printer._id}
                  className="admin-button flex-1"
                >
                  {testing === printer._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2"></div>
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  اختبار الاتصال
                </button>
                
                <button
                  onClick={() => handleTestPrint(printer._id!)}
                  disabled={testing === printer._id}
                  className="admin-button flex-1"
                >
                  {testing === printer._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2"></div>
                  ) : (
                    <Printer className="w-4 h-4" />
                  )}
                  طباعة اختبار
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="admin-card rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">مهام الطباعة الأخيرة</h3>
          
          {printJobs.length === 0 ? (
            <div className="text-center py-8">
              <Printer className="w-16 h-16 mx-auto mb-4" />
              <p>لا توجد مهام طباعة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3">رقم المهمة</th>
                    <th className="text-right py-3">الطابعة</th>
                    <th className="text-right py-3">رقم الطلب</th>
                    <th className="text-right py-3">النوع</th>
                    <th className="text-right py-3">الحالة</th>
                    <th className="text-right py-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {printJobs.map((job) => (
                    <tr key={job.jobId} className="border-b">
                      <td className="py-3 font-medium">{job.jobId}</td>
                      <td>{job.printerName}</td>
                      <td>{job.orderNumber}</td>
                      <td>
                        {job.jobType === 'order' ? 'طلب' : 
                         job.jobType === 'test' ? 'اختبار' : 'إعادة طباعة'}
                      </td>
                      <td className={`${getStatusColor(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </td>
                      <td className="text-sm">
                        {new Date(job.createdAt).toLocaleString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="admin-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? 'تعديل الطابعة' : 'إضافة طابعة جديدة'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">اسم الطابعة *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="admin-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">القسم *</label>
                  <select
                    value={formData.department || 'kitchen'}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value as any }))}
                    className="admin-input w-full"
                    required
                  >
                    <option value="kitchen">مطبخ</option>
                    <option value="barista">بارستا</option>
                    <option value="shisha">شيشة</option>
                    <option value="general">عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">نوع الاتصال *</label>
                  <select
                    value={formData.connectionType || 'LAN'}
                    onChange={(e) => setFormData(prev => ({ ...prev, connectionType: e.target.value as any }))}
                    className="admin-input w-full"
                    required
                  >
                    <option value="LAN">شبكة محلية (LAN)</option>
                    <option value="WiFi">واي فاي (WiFi)</option>
                    <option value="USB">USB</option>
                    <option value="Bluetooth">بلوتوث</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">عرض الورق *</label>
                  <select
                    value={formData.paperWidth || 58}
                    onChange={(e) => setFormData(prev => ({ ...prev, paperWidth: Number(e.target.value) as any }))}
                    className="admin-input w-full"
                    required
                  >
                    <option value={58}>58mm</option>
                    <option value={80}>80mm</option>
                  </select>
                </div>
              </div>

              {/* Connection Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">تفاصيل الاتصال</h3>
                
                {(formData.connectionType === 'LAN' || formData.connectionType === 'WiFi') && (
                  <>
                    <div>
                      <label className="block text-sm mb-2">عنوان IP *</label>
                      <input
                        type="text"
                        value={formData.connectionDetails?.ipAddress || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          connectionDetails: { ...prev.connectionDetails, ipAddress: e.target.value }
                        }))}
                        className="admin-input w-full"
                        placeholder="192.168.1.100"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-2">المنفذ</label>
                      <input
                        type="number"
                        value={formData.connectionDetails?.port || 9100}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          connectionDetails: { ...prev.connectionDetails, port: Number(e.target.value) }
                        }))}
                        className="admin-input w-full"
                        min="1"
                        max="65535"
                      />
                    </div>
                  </>
                )}

                {formData.connectionType === 'USB' && (
                  <div>
                    <label className="block text-sm mb-2">مسار USB *</label>
                    <input
                      type="text"
                      value={formData.connectionDetails?.usbPath || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        connectionDetails: { ...prev.connectionDetails, usbPath: e.target.value }
                      }))}
                      className="admin-input w-full"
                      placeholder="/dev/usb/lp0"
                      required
                    />
                  </div>
                )}

                {formData.connectionType === 'Bluetooth' && (
                  <div>
                    <label className="block text-sm mb-2">عنوان البلوتوث *</label>
                    <input
                      type="text"
                      value={formData.connectionDetails?.bluetoothAddress || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        connectionDetails: { ...prev.connectionDetails, bluetoothAddress: e.target.value }
                      }))}
                      className="admin-input w-full"
                      placeholder="00:11:22:33:44:55"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Print Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">إعدادات الطباعة</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">عدد النسخ</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.settings?.copies || 1}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, copies: Number(e.target.value) }
                      }))}
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">حجم الخط</label>
                    <select
                      value={formData.settings?.fontSize || 'medium'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, fontSize: e.target.value as any }
                      }))}
                      className="admin-input w-full"
                    >
                      <option value="small">صغير</option>
                      <option value="medium">متوسط</option>
                      <option value="large">كبير</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings?.printCustomerCopy !== false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, printCustomerCopy: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    طباعة نسخة للعميل
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings?.printInternalCopy !== false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, printInternalCopy: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    طباعة نسخة داخلية
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings?.includeQRCode !== false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, includeQRCode: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    تضمين رمز QR
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings?.paperCut !== false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, paperCut: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    قطع الورق تلقائياً
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings?.buzzer !== false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, buzzer: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    صوت التنبيه
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="admin-button"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-button"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'جاري الحفظ...' : (editingId ? 'تحديث' : 'حفظ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





