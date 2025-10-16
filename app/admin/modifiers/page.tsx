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

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
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
    if (!confirm("هل أنت متأكد من حذف هذا المعدل؟")) return;

    try {
      const response = await fetch(`/api/modifiers/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "تم حذف المعدل بنجاح");
        fetchModifiers();
      } else {
        showMessage("error", data.error || "فشل حذف المعدل");
      }
    } catch (error) {
      console.error("Error deleting modifier:", error);
      showMessage("error", "حدث خطأ أثناء الحذف");
    }
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
      <div className="min-h-screen bg-background p-6">
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
              <div key={i} className="bg-card rounded-xl p-6 border border-border">
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
                <div className="flex items-center gap-2 pt-4 border-t border-border">
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إدارة المعدلات والإضافات</h1>
            <p className="text-muted-foreground">
              قم بإنشاء خيارات قابلة للتخصيص لعناصر القائمة الخاصة بك
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingModifier(null);
              resetForm();
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold transition-all"
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
              <div className="col-span-full text-center py-12">
                <ListChecks className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">لا توجد معدلات بعد</p>
                <p className="text-muted-foreground/70 text-sm mt-2">ابدأ بإنشاء معدل جديد</p>
              </div>
            ) : (
              modifiers.map((modifier) => (
                <motion.div
                  key={modifier._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-xl p-6 border border-card-foreground/10 hover:border-card-foreground/30 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {modifier.name}
                      </h3>
                      {modifier.nameEn && (
                        <p className="text-sm text-muted-foreground">{modifier.nameEn}</p>
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
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {modifier.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">النوع:</span>
                      <span className="text-foreground font-medium">
                        {modifier.type === 'single' ? 'اختيار واحد' : 'اختيارات متعددة'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">عدد الخيارات:</span>
                      <span className="text-foreground font-medium">
                        {modifier.options.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">إلزامي:</span>
                      <span className="text-foreground font-medium">
                        {modifier.required ? 'نعم' : 'لا'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-card-foreground/10">
                    <button
                      onClick={() => setPreviewModifier(modifier)}
                      className="flex-1 flex items-center justify-center gap-2 bg-card-foreground/5 hover:bg-card-foreground/10 text-foreground py-2 px-4 rounded-lg text-sm font-medium transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      معاينة
                    </button>
                    <button
                      onClick={() => handleEdit(modifier)}
                      className="flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-2 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(modifier._id)}
                      className="flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Form Modal - Continued in next message due to length */}
      </div>
    </div>
  );
}
