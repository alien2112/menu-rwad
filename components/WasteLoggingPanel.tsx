"use client";

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Save, 
  Edit, 
  X,
  Calendar,
  Package,
  DollarSign,
  Filter
} from 'lucide-react';

interface WasteLog {
  _id?: string;
  itemName: string;
  itemId?: string;
  category: 'food' | 'beverage' | 'material' | 'equipment' | 'other';
  quantity: number;
  unit: string;
  cost: number;
  reason: 'spoiled' | 'broken' | 'expired' | 'damaged' | 'overcooked' | 'spilled' | 'other';
  description?: string;
  department: 'kitchen' | 'barista' | 'shisha' | 'general';
  loggedBy: string;
  wasteDate: Date;
  isRecoverable: boolean;
  recoveryAction?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WasteLoggingPanelProps {
  currentUser: string;
}

export default function WasteLoggingPanel({ currentUser }: WasteLoggingPanelProps) {
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<WasteLog>>({
    itemName: '',
    category: 'food',
    quantity: 1,
    unit: 'piece',
    cost: 0,
    reason: 'spoiled',
    department: 'kitchen',
    isRecoverable: false,
    wasteDate: new Date()
  });
  const [filters, setFilters] = useState({
    department: '',
    category: '',
    reason: '',
    startDate: '',
    endDate: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchWasteLogs();
  }, [filters]);

  const fetchWasteLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.department) params.set('department', filters.department);
      if (filters.category) params.set('category', filters.category);
      if (filters.reason) params.set('reason', filters.reason);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      
      const response = await fetch(`/api/waste-log?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setWasteLogs(data.data.wasteLogs || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في تحميل سجلات الهدر' });
      }
    } catch (error) {
      console.error('Error fetching waste logs:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/waste-log?id=${editingId}` : '/api/waste-log';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          loggedBy: currentUser,
          wasteDate: formData.wasteDate || new Date()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: editingId ? 'تم تحديث السجل بنجاح' : 'تم إنشاء السجل بنجاح' });
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchWasteLogs();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في حفظ السجل' });
      }
    } catch (error) {
      console.error('Error saving waste log:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (log: WasteLog) => {
    setFormData({
      ...log,
      wasteDate: new Date(log.wasteDate)
    });
    setEditingId(log._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;

    try {
      const response = await fetch(`/api/waste-log?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'تم حذف السجل بنجاح' });
        fetchWasteLogs();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في حذف السجل' });
      }
    } catch (error) {
      console.error('Error deleting waste log:', error);
      setMessage({ type: 'error', text: 'خطأ في الاتصال بالخادم' });
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      category: 'food',
      quantity: 1,
      unit: 'piece',
      cost: 0,
      reason: 'spoiled',
      department: 'kitchen',
      isRecoverable: false,
      wasteDate: new Date()
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ر.س`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ar-SA');
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      food: 'طعام',
      beverage: 'مشروبات',
      material: 'مواد',
      equipment: 'معدات',
      other: 'أخرى'
    };
    return labels[category] || category;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spoiled: 'تلف',
      broken: 'كسر',
      expired: 'انتهاء صلاحية',
      damaged: 'تلف',
      overcooked: 'احتراق',
      spilled: 'انسكاب',
      other: 'أخرى'
    };
    return labels[reason] || reason;
  };

  const getDepartmentLabel = (department: string) => {
    const labels: Record<string, string> = {
      kitchen: 'مطبخ',
      barista: 'بارستا',
      shisha: 'شيشة',
      general: 'عام'
    };
    return labels[department] || department;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">تسجيل الهدر</h1>
            <p className="text-white/70">تسجيل وإدارة هدر المواد والمنتجات</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          تسجيل هدر جديد
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-300'
            : 'bg-red-500/20 border border-red-500/30 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-white/70" />
          <h3 className="text-lg font-bold text-white">الفلاتر</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">القسم</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">جميع الأقسام</option>
              <option value="kitchen">مطبخ</option>
              <option value="barista">بارستا</option>
              <option value="shisha">شيشة</option>
              <option value="general">عام</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-2">الفئة</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">جميع الفئات</option>
              <option value="food">طعام</option>
              <option value="beverage">مشروبات</option>
              <option value="material">مواد</option>
              <option value="equipment">معدات</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-2">السبب</label>
            <select
              value={filters.reason}
              onChange={(e) => setFilters(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="">جميع الأسباب</option>
              <option value="spoiled">تلف</option>
              <option value="broken">كسر</option>
              <option value="expired">انتهاء صلاحية</option>
              <option value="damaged">تلف</option>
              <option value="overcooked">احتراق</option>
              <option value="spilled">انسكاب</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-2">من تاريخ</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-2">إلى تاريخ</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Waste Logs Table */}
      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">سجلات الهدر</h3>
        
        {wasteLogs.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">لا توجد سجلات هدر</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-right py-3 text-white/70">العنصر</th>
                  <th className="text-right py-3 text-white/70">الفئة</th>
                  <th className="text-right py-3 text-white/70">الكمية</th>
                  <th className="text-right py-3 text-white/70">التكلفة</th>
                  <th className="text-right py-3 text-white/70">السبب</th>
                  <th className="text-right py-3 text-white/70">القسم</th>
                  <th className="text-right py-3 text-white/70">التاريخ</th>
                  <th className="text-right py-3 text-white/70">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {wasteLogs.map((log) => (
                  <tr key={log._id} className="border-b border-white/10">
                    <td className="py-3 text-white font-medium">{log.itemName}</td>
                    <td className="py-3 text-white/70">{getCategoryLabel(log.category)}</td>
                    <td className="py-3 text-white">{log.quantity} {log.unit}</td>
                    <td className="py-3 text-white">{formatCurrency(log.cost)}</td>
                    <td className="py-3 text-white/70">{getReasonLabel(log.reason)}</td>
                    <td className="py-3 text-white/70">{getDepartmentLabel(log.department)}</td>
                    <td className="py-3 text-white/70">{formatDate(log.wasteDate)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(log._id!)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'تعديل سجل الهدر' : 'تسجيل هدر جديد'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">اسم العنصر *</label>
                  <input
                    type="text"
                    value={formData.itemName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">الفئة *</label>
                  <select
                    value={formData.category || 'food'}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    required
                  >
                    <option value="food">طعام</option>
                    <option value="beverage">مشروبات</option>
                    <option value="material">مواد</option>
                    <option value="equipment">معدات</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">الكمية *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.quantity || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">الوحدة *</label>
                  <input
                    type="text"
                    value={formData.unit || 'piece'}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">التكلفة *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">السبب *</label>
                  <select
                    value={formData.reason || 'spoiled'}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value as any }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    required
                  >
                    <option value="spoiled">تلف</option>
                    <option value="broken">كسر</option>
                    <option value="expired">انتهاء صلاحية</option>
                    <option value="damaged">تلف</option>
                    <option value="overcooked">احتراق</option>
                    <option value="spilled">انسكاب</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">القسم *</label>
                  <select
                    value={formData.department || 'kitchen'}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value as any }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    required
                  >
                    <option value="kitchen">مطبخ</option>
                    <option value="barista">بارستا</option>
                    <option value="shisha">شيشة</option>
                    <option value="general">عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">تاريخ الهدر</label>
                  <input
                    type="datetime-local"
                    value={formData.wasteDate ? new Date(formData.wasteDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, wasteDate: new Date(e.target.value) }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">الوصف</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={formData.isRecoverable || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecoverable: e.target.checked }))}
                    className="rounded"
                  />
                  قابل للاسترداد
                </label>
              </div>

              {formData.isRecoverable && (
                <div>
                  <label className="block text-white/70 text-sm mb-2">إجراء الاسترداد</label>
                  <input
                    type="text"
                    value={formData.recoveryAction || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, recoveryAction: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    placeholder="وصف إجراء الاسترداد"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
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





