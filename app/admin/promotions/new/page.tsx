"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, Tag, Gift } from "lucide-react";
import { Skeleton } from "@/components/SkeletonLoader";

interface MenuItem {
  _id: string;
  name: string;
  nameEn?: string;
}

interface Category {
  _id: string;
  name: string;
  nameEn?: string;
}

export default function NewPromotionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    type: "discount-code" as "discount-code" | "buy-x-get-y",
    description: "",
    descriptionEn: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true,

    // Discount code fields
    code: "",
    discountType: "percent" as "percent" | "fixed",
    value: 0,
    usageLimit: 0,
    minPurchaseAmount: 0,

    // Buy X Get Y fields
    buyQty: 2,
    getQty: 1,
    applicableItems: [] as string[],
    applicableCategories: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/categories"),
      ]);

      const [itemsData, categoriesData] = await Promise.all([
        itemsRes.json(),
        categoriesRes.json(),
      ]);

      if (itemsData.success) {
        setMenuItems(itemsData.data || []);
      }

      if (categoriesData.success) {
        setCategories(categoriesData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.startDate || !formData.endDate) {
      setMessage({ type: "error", text: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    if (formData.type === "discount-code" && !formData.code) {
      setMessage({ type: "error", text: "يرجى إدخال كود الخصم" });
      return;
    }

    if (formData.type === "buy-x-get-y" && formData.applicableItems.length === 0) {
      setMessage({ type: "error", text: "يرجى اختيار المنتجات المؤهلة" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "تم إنشاء العرض بنجاح" });
        setTimeout(() => {
          router.push("/admin/promotions");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "فشل إنشاء العرض" });
      }
    } catch (error) {
      console.error("Error creating promotion:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء إنشاء العرض" });
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelection = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableItems: prev.applicableItems.includes(itemId)
        ? prev.applicableItems.filter(id => id !== itemId)
        : [...prev.applicableItems, itemId],
    }));
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-24 md:col-span-2" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-48" />
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin/promotions")}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">إضافة عرض جديد</h1>
            <p className="text-muted-foreground mt-1">قم بإنشاء عرض ترويجي جديد</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Promotion Type Selection */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">نوع العرض</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "discount-code" })}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  formData.type === "discount-code"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`p-3 rounded-lg ${
                  formData.type === "discount-code" ? "bg-primary/20" : "bg-card"
                }`}>
                  <Tag className={`w-6 h-6 ${
                    formData.type === "discount-code" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-foreground">كود خصم</h3>
                  <p className="text-sm text-muted-foreground">خصم بنسبة أو قيمة ثابتة</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "buy-x-get-y" })}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  formData.type === "buy-x-get-y"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`p-3 rounded-lg ${
                  formData.type === "buy-x-get-y" ? "bg-primary/20" : "bg-card"
                }`}>
                  <Gift className={`w-6 h-6 ${
                    formData.type === "buy-x-get-y" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-foreground">اشتري واحصل</h3>
                  <p className="text-sm text-muted-foreground">اشتري X واحصل على Y</p>
                </div>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">المعلومات الأساسية</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسم العرض (عربي) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="خصم 20%"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسم العرض (إنجليزي)
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="20% OFF"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="وصف العرض..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  تاريخ البداية <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  تاريخ النهاية <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Discount Code Specific Fields */}
          {formData.type === "discount-code" && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">تفاصيل كود الخصم</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    الكود <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    placeholder="SUMMER2024"
                    required={formData.type === "discount-code"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    نوع الخصم <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="percent">نسبة مئوية (%)</option>
                    <option value="fixed">قيمة ثابتة (ريال)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    قيمة الخصم <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="20"
                    min="0"
                    step="0.01"
                    required={formData.type === "discount-code"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    الحد الأدنى للطلب (ريال)
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    حد الاستخدام (0 = غير محدود)
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buy X Get Y Specific Fields */}
          {formData.type === "buy-x-get-y" && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">تفاصيل العرض</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    اشتري (الكمية) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.buyQty}
                    onChange={(e) => setFormData({ ...formData, buyQty: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="2"
                    min="1"
                    required={formData.type === "buy-x-get-y"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    احصل على (الكمية) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.getQty}
                    onChange={(e) => setFormData({ ...formData, getQty: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1"
                    min="1"
                    required={formData.type === "buy-x-get-y"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  المنتجات المؤهلة <span className="text-red-400">*</span>
                </label>
                <div className="max-h-60 overflow-y-auto bg-background border border-border rounded-lg p-4">
                  {menuItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">لا توجد منتجات</p>
                  ) : (
                    <div className="space-y-2">
                      {menuItems.map(item => (
                        <label
                          key={item._id}
                          className="flex items-center gap-2 p-2 hover:bg-card rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.applicableItems.includes(item._id)}
                            onChange={() => handleItemSelection(item._id)}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-foreground">{item.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.applicableItems.length} منتج محدد
                </p>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">الإعدادات</h2>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-foreground">تفعيل العرض</label>
                <p className="text-xs text-muted-foreground">جعل العرض نشطاً ومتاحاً للعملاء</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3 rounded-lg font-bold transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ العرض
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/promotions")}
              className="px-6 py-3 bg-card hover:bg-card/80 border border-border text-foreground rounded-lg font-medium transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
