"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Eye, X } from "lucide-react";
import { MENU_TEMPLATES, TemplateId } from "@/lib/types/MenuTemplate";
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

  // Fetch current template
  useEffect(() => {
    fetchCurrentTemplate();
  }, []);

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
    return <div className="text-white p-8">Template not found</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border-2 border-border">
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">قوالب القائمة</h1>
          <p className="text-muted-foreground">
            اختر التصميم المثالي لعرض عناصر القائمة الخاصة بك
          </p>
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

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {MENU_TEMPLATES.map((template) => (
            <motion.div
              key={template.id}
              className={`bg-card rounded-xl p-6 border-2 transition-all cursor-pointer ${
                selectedTemplate === template.id
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-card-foreground/10 hover:border-card-foreground/30"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {template.nameAr}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {template.name}
                    </span>
                    {currentTemplate === template.id && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                        الحالي
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {template.descriptionAr}
                  </p>
                </div>

                {selectedTemplate === template.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {template.featuresAr.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
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
                className="w-full mt-4 flex items-center justify-center gap-2 bg-card-foreground/5 hover:bg-card-foreground/10 text-foreground py-2 px-4 rounded-lg transition-colors border border-card-foreground/10"
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
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white px-8 py-3 rounded-lg font-bold transition-all disabled:cursor-not-allowed"
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
                className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      معاينة: {MENU_TEMPLATES.find(t => t.id === previewTemplate)?.nameAr}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      هذا مثال توضيحي لكيفية ظهور عناصر القائمة
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="flex-shrink-0 w-10 h-10 bg-card hover:bg-card/80 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Preview Content */}
                <div className="p-6">
                  <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl p-6">
                    {renderPreview(previewTemplate)}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-background border-t border-border p-6 flex justify-end gap-3">
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="px-6 py-2 bg-card hover:bg-card/80 text-foreground rounded-lg transition-colors"
                  >
                    إغلاق
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
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
