"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  Settings,
  ListChecks,
} from "lucide-react";
import { Skeleton } from "@/components/SkeletonLoader";
import { useAlert, useConfirmation } from "@/components/ui/alerts";

interface ModifierOption {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  isDefault?: boolean;
}

interface Modifier {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  type: 'single' | 'multiple';
  options: ModifierOption[];
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  order: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function ModifiersPage() {
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);
  const [previewModifier, setPreviewModifier] = useState<Modifier | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    description: "",
    type: "single" as 'single' | 'multiple',
    options: [{ id: `opt-${Date.now()}`, name: "", nameEn: "", price: 0, isDefault: false }],
    required: false,
    minSelections: 0,
    maxSelections: 1,
    order: 0,
    status: "active" as 'active' | 'inactive',
  });

  const { showSuccess, showError } = useAlert();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    fetchModifiers();
  }, []);

  const fetchModifiers = async () => {
    try {
      const response = await fetch("/api/modifiers");
      const data = await response.json();

      if (data.success) {
        setModifiers(data.data);
      }
    } catch (error) {
      console.error("Error fetching modifiers:", error);
      showMessage("error", "فشل تحميل المعدلات");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: `opt-${Date.now()}`, name: "", nameEn: "", price: 0, isDefault: false }],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || formData.options.length === 0) {
      showMessage("error", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const hasEmptyOptions = formData.options.some(opt => !opt.name);
    if (hasEmptyOptions) {
      showMessage("error", "يرجى إدخال أسماء جميع الخيارات");
      return;
    }

    try {
      const url = editingModifier
        ? `/api/modifiers/${editingModifier._id}`
        : "/api/modifiers";
      const method = editingModifier ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", editingModifier ? "تم تحديث المعدل بنجاح" : "تم إنشاء المعدل بنجاح");
        setShowForm(false);
        setEditingModifier(null);
        resetForm();
        fetchModifiers();
      } else {
        showMessage("error", data.error || "فشل حفظ المعدل");
      }
    } catch (error) {
      console.error("Error saving modifier:", error);
      showMessage("error", "حدث خطأ أثناء الحفظ");
    }
  };

  const handleEdit = (modifier: Modifier) => {
    setEditingModifier(modifier);
    setFormData({
      name: modifier.name,
      nameEn: modifier.nameEn || "",
      description: modifier.description || "",
      type: modifier.type,
      options: modifier.options,
      required: modifier.required,
      minSelections: modifier.minSelections || 0,
      maxSelections: modifier.maxSelections || 1,
      order: modifier.order,
      status: modifier.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    confirm(
      {
        title: 'حذف المعدل',
        message: 'هل أنت متأكد من حذف هذا المعدل؟ لا يمكن التراجع عن هذا الإجراء.',
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        type: 'danger',
      },
      async () => {
        try {
          const response = await fetch(`/api/modifiers/${id}`, {
            method: "DELETE",
          });

          const data = await response.json();

          if (data.success) {
            showSuccess("تم حذف المعدل بنجاح");
            fetchModifiers();
          } else {
            showError(data.error || "فشل حذف المعدل");
          }
        } catch (error) {
          console.error("Error deleting modifier:", error);
          showError("حدث خطأ أثناء الحذف");
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameEn: "",
      description: "",
      type: "single",
      options: [{ id: `opt-${Date.now()}`, name: "", nameEn: "", price: 0, isDefault: false }],
      required: false,
      minSelections: 0,
      maxSelections: 1,
      order: 0,
      status: "active",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-12 w-36 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="admin-card rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة المعدلات والإضافات</h1>
            <p>
              قم بإنشاء خيارات قابلة للتخصيص لعناصر القائمة الخاصة بك
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingModifier(null);
              resetForm();
            }}
            className="admin-button"
          >
            <Plus className="w-5 h-5" />
            إضافة معدل جديد
          </button>
        </div>

        {/* Success/Error Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modifiers List */}
        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modifiers.length === 0 ? (
              <div className="col-span-full text-center py-12 admin-card">
                <ListChecks className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">لا توجد معدلات بعد</p>
                <p className="mt-2">ابدأ بإنشاء معدل جديد</p>
              </div>
            ) : (
              modifiers.map((modifier) => (
                <motion.div
                  key={modifier._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="admin-card rounded-xl p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">
                        {modifier.name}
                      </h3>
                      {modifier.nameEn && (
                        <p className="text-sm">{modifier.nameEn}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      modifier.status === 'active'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {modifier.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>

                  {/* Description */}
                  {modifier.description && (
                    <p className="text-sm mb-4 line-clamp-2">
                      {modifier.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>النوع:</span>
                      <span className="font-medium">
                        {modifier.type === 'single' ? 'اختيار واحد' : 'اختيارات متعددة'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>عدد الخيارات:</span>
                      <span className="font-medium">
                        {modifier.options.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>إلزامي:</span>
                      <span className="font-medium">
                        {modifier.required ? 'نعم' : 'لا'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <button
                      onClick={() => setPreviewModifier(modifier)}
                      className="admin-button flex-1"
                    >
                      <Eye className="w-4 h-4" />
                      معاينة
                    </button>
                    <button
                      onClick={() => handleEdit(modifier)}
                      className="admin-button"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(modifier._id)}
                      className="admin-button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="admin-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-6">
                  {editingModifier ? "تعديل المعدل" : "إضافة معدل جديد"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">اسم المعدل</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">اسم المعدل (En)</label>
                      <input
                        type="text"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">الوصف</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="admin-input w-full"
                      rows={3}
                    />
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3">الخيارات</h4>
                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-3 p-3 admin-card rounded-lg">
                          <input
                            type="text"
                            placeholder="اسم الخيار"
                            value={option.name}
                            onChange={(e) => handleOptionChange(index, "name", e.target.value)}
                            className="admin-input flex-grow"
                          />
                          <input
                            type="number"
                            placeholder="السعر"
                            value={option.price}
                            onChange={(e) => handleOptionChange(index, "price", parseFloat(e.target.value) || 0)}
                            className="admin-input w-24"
                          />
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={option.isDefault}
                              onChange={(e) => handleOptionChange(index, "isDefault", e.target.checked)}
                              className="rounded"
                            />
                            افتراضي
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="admin-button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="admin-button mt-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة خيار
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">النوع</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="admin-input w-full"
                      >
                        <option value="single">اختيار واحد</option>
                        <option value="multiple">اختيارات متعددة</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={formData.required}
                          onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                          className="rounded"
                        />
                        إلزامي
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingModifier(null);
                        resetForm();
                      }}
                      className="admin-button"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="admin-button"
                    >
                      {editingModifier ? "تحديث" : "إنشاء"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {previewModifier && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setPreviewModifier(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="admin-card rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">معاينة: {previewModifier.name}</h3>
                <div className="space-y-3">
                  {previewModifier.options.map(opt => (
                    <div key={opt.id} className="flex justify-between items-center">
                      <span>{opt.name}</span>
                      <span className="font-medium">{opt.price > 0 ? `${opt.price} ر.س` : 'مجاني'}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPreviewModifier(null)}
                  className="admin-button w-full mt-6"
                >
                  إغلاق
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {ConfirmationComponent}
    </div>
  );
}
