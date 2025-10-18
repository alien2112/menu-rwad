"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Eye, X, Palette, RotateCcw } from "lucide-react";
import { MENU_TEMPLATES, TemplateId } from "@/lib/types/MenuTemplate";
import { clearCachePattern } from "@/lib/cacheInvalidation";
import { ClassicLayout } from "@/components/templates/ClassicLayout";
import { ModernLayout } from "@/components/templates/ModernLayout";
import { MinimalLayout } from "@/components/templates/MinimalLayout";
import { ElegantLayout } from "@/components/templates/ElegantLayout";
import { LuxeLayout } from "@/components/templates/LuxeLayout";
import { VintageLayout } from "@/components/templates/VintageLayout";
import { ArtisticLayout } from "@/components/templates/ArtisticLayout";
import { CompactLayout } from "@/components/templates/CompactLayout";
import { FuturisticLayout } from "@/components/templates/FuturisticLayout";
import { NaturalLayout } from "@/components/templates/NaturalLayout";
import { Skeleton } from "@/components/SkeletonLoader";
import ColorPicker from "@/components/admin/ColorPicker";
import { useTheme } from "@/contexts/ThemeContext";
import { useAlert } from "@/components/ui/alerts";

// Sample menu item for preview
const SAMPLE_ITEM = {
  _id: "sample-1",
  name: "طاجن الدجاج المغربي",
  nameEn: "Moroccan Chicken Tagine",
  description: "طاجن دجاج مغربي أصيل مع الخضروات الطازجة والتوابل المميزة",
  price: 65.00,
  discountPrice: 52.00,
  image: "/موال مراكش طواجن  1 (1).png",
  calories: 450,
  preparationTime: 25,
  categoryId: "sample-cat",
  averageRating: 4.8,
  reviewCount: 127
};

export default function MenuTemplatePage() {
  const [currentTemplate, setCurrentTemplate] = useState<TemplateId>("classic");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("classic");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'colors'>('templates');
  
  // Theme management
  const { theme, updateTheme, resetTheme, loading: themeLoading } = useTheme();
  const [localTheme, setLocalTheme] = useState<any>({});
  const { showSuccess, showError } = useAlert();

  // Fetch current template
  useEffect(() => {
    fetchCurrentTemplate();
  }, []);

  // Initialize local theme when theme loads
  useEffect(() => {
    if (theme) {
      setLocalTheme(theme);
    }
  }, [theme]);

  // Theme management functions
  const handleThemeChange = (key: string, value: string) => {
    setLocalTheme((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveTheme = async () => {
    try {
      const success = await updateTheme(localTheme);
      if (success) {
        showSuccess('تم حفظ الألوان بنجاح');
      } else {
        showError('فشل في حفظ الألوان');
      }
    } catch (error) {
      showError('حدث خطأ أثناء الحفظ');
    }
  };

  const handleResetTheme = async () => {
    try {
      const success = await resetTheme();
      if (success) {
        setLocalTheme({});
        showSuccess('تم إعادة تعيين الألوان');
      } else {
        showError('فشل في إعادة التعيين');
      }
    } catch (error) {
      showError('حدث خطأ أثناء إعادة التعيين');
    }
  };


  const fetchCurrentTemplate = async () => {
    try {
      const response = await fetch("/api/menu-template");
      const data = await response.json();

      if (data.success) {
        setCurrentTemplate(data.currentTemplate);
        setSelectedTemplate(data.currentTemplate);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      showMessage("error", "فشل تحميل القالب الحالي");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/menu-template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutTemplate: selectedTemplate }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentTemplate(selectedTemplate);
        showMessage("success", "تم حفظ القالب بنجاح");
      } else {
        showMessage("error", data.error || "فشل حفظ القالب");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      showMessage("error", "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const renderPreview = (templateId: TemplateId) => {
    const TemplateComponent = {
      classic: ClassicLayout,
      modern: ModernLayout,
      minimal: MinimalLayout,
      elegant: ElegantLayout,
      luxe: LuxeLayout,
      vintage: VintageLayout,
      artistic: ArtisticLayout,
      compact: CompactLayout,
      futuristic: FuturisticLayout,
      natural: NaturalLayout,
    }[templateId];

    // All templates now have components, render them
    if (TemplateComponent) {
      return <TemplateComponent item={SAMPLE_ITEM} onAddToCart={() => {}} />;
    }

    // Fallback (should not reach here)
    return <div className="p-8">Template not found</div>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="admin-card rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">قوالب القائمة</h1>
          <p>
            اختر التصميم المثالي لعرض عناصر القائمة الخاصة بك
          </p>
        </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setActiveTab('templates')}
                className={`admin-button ${activeTab === 'templates' ? 'active' : ''}`}
              >
                قوالب القائمة
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`admin-button ${activeTab === 'colors' ? 'active' : ''}`}
              >
                <Palette className="w-4 h-4 mr-2" />
                ألوان القائمة
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

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'templates' && (
              <>
                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {MENU_TEMPLATES.map((template) => (
                    <motion.div
                      key={template.id}
                      className={`admin-card rounded-xl p-6 border-2 transition-all cursor-pointer ${
                        selectedTemplate === template.id
                          ? "border-highlight shadow-lg shadow-highlight/20"
                          : "border-border-color"
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Template Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">
                              {template.nameAr}
                            </h3>
                            <span className="text-sm">
                              {template.name}
                            </span>
                            {currentTemplate === template.id && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                                الحالي
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">
                            {template.descriptionAr}
                          </p>
                        </div>

                        {selectedTemplate === template.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0 w-8 h-8 bg-highlight rounded-full flex items-center justify-center"
                          >
                            <Check className="w-5 h-5" />
                          </motion.div>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-4">
                        {template.featuresAr.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-highlight mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Preview Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template.id);
                        }}
                        className="admin-button w-full mt-4"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">معاينة</span>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving || selectedTemplate === currentTemplate}
                    className="admin-button"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>حفظ القالب</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold mb-2">تخصيص ألوان القائمة</h4>
                  <p className="text-sm text-gray-600">قم بتخصيص الألوان لعرض القائمة</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="الخلفية الرئيسية"
                    value={localTheme.background || '#F6EEDF'}
                    onChange={(color) => handleThemeChange('background', color)}
                  />
                  <ColorPicker
                    label="لون النص الرئيسي"
                    value={localTheme.foreground || '#4F3500'}
                    onChange={(color) => handleThemeChange('foreground', color)}
                  />
                  <ColorPicker
                    label="اللون الأساسي"
                    value={localTheme.primary || '#9C6B1E'}
                    onChange={(color) => handleThemeChange('primary', color)}
                  />
                  <ColorPicker
                    label="اللون الثانوي"
                    value={localTheme.secondary || '#D3A34C'}
                    onChange={(color) => handleThemeChange('secondary', color)}
                  />
                  <ColorPicker
                    label="لون التمييز"
                    value={localTheme.accent || '#1EA55E'}
                    onChange={(color) => handleThemeChange('accent', color)}
                  />
                  <ColorPicker
                    label="خلفية البطاقات"
                    value={localTheme.card || '#4F3500'}
                    onChange={(color) => handleThemeChange('card', color)}
                  />
                  <ColorPicker
                    label="نص البطاقات"
                    value={localTheme['card-foreground'] || '#FFFFFF'}
                    onChange={(color) => handleThemeChange('card-foreground', color)}
                  />
                  <ColorPicker
                    label="الخلفية المطفأة"
                    value={localTheme.muted || 'rgba(0,0,0,0.12)'}
                    onChange={(color) => handleThemeChange('muted', color)}
                  />
                  <ColorPicker
                    label="النص المطفأ"
                    value={localTheme['muted-foreground'] || 'rgba(18,15,6,0.7)'}
                    onChange={(color) => handleThemeChange('muted-foreground', color)}
                  />
                  <ColorPicker
                    label="لون الحلقة"
                    value={localTheme.ring || '#D3A34C'}
                    onChange={(color) => handleThemeChange('ring', color)}
                  />
                  <ColorPicker
                    label="بداية شريط التمرير"
                    value={localTheme['scroll-thumb-start'] || '#1EA55E'}
                    onChange={(color) => handleThemeChange('scroll-thumb-start', color)}
                  />
                  <ColorPicker
                    label="نهاية شريط التمرير"
                    value={localTheme['scroll-thumb-end'] || '#D3A34C'}
                    onChange={(color) => handleThemeChange('scroll-thumb-end', color)}
                  />
                  <ColorPicker
                    label="مسار شريط التمرير"
                    value={localTheme['scroll-track'] || 'rgba(0,0,0,0.25)'}
                    onChange={(color) => handleThemeChange('scroll-track', color)}
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    onClick={handleResetTheme}
                    disabled={themeLoading}
                    className="admin-button flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    إعادة تعيين
                  </button>
                  <button
                    onClick={handleSaveTheme}
                    disabled={themeLoading}
                    className="admin-button flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    حفظ الألوان
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {previewTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setPreviewTemplate(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="admin-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 admin-card border-b p-6 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-2xl font-bold">
                      معاينة: {MENU_TEMPLATES.find(t => t.id === previewTemplate)?.nameAr}
                    </h2>
                    <p className="text-sm mt-1">
                      هذا مثال توضيحي لكيفية ظهور عناصر القائمة
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="admin-button flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview Content */}
                <div className="p-6">
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6">
                    {renderPreview(previewTemplate)}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 admin-card border-t p-6 flex justify-end gap-3">
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="admin-button"
                  >
                    إغلاق
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                    className="admin-button"
                  >
                    اختيار هذا القالب
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
