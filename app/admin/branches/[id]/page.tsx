"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { OpeningHoursEditor, OpeningHours } from "@/components/OpeningHoursEditor";
import { Skeleton } from "@/components/SkeletonLoader";

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    address: "",
    phone: "",
    email: "",
    location: { lat: 24.7136, lng: 46.6753 },
    isMainBranch: false,
    isActive: true,
    status: "active" as "active" | "inactive" | "coming_soon",
  });

  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([
    { day: "monday", open: "09:00", close: "23:00", isClosed: false },
    { day: "tuesday", open: "09:00", close: "23:00", isClosed: false },
    { day: "wednesday", open: "09:00", close: "23:00", isClosed: false },
    { day: "thursday", open: "09:00", close: "23:00", isClosed: false },
    { day: "friday", open: "09:00", close: "23:00", isClosed: false },
    { day: "saturday", open: "09:00", close: "23:00", isClosed: false },
    { day: "sunday", open: "09:00", close: "23:00", isClosed: false },
  ]);

  useEffect(() => {
    fetchBranch();
  }, [branchId]);

  const fetchBranch = async () => {
    try {
      const response = await fetch(`/api/branches/${branchId}`);
      const data = await response.json();

      if (data.success) {
        const branch = data.data;
        setFormData({
          name: branch.name || "",
          nameEn: branch.nameEn || "",
          address: branch.address || "",
          phone: branch.phone || "",
          email: branch.email || "",
          location: branch.location || { lat: 24.7136, lng: 46.6753 },
          isMainBranch: branch.isMainBranch || false,
          isActive: branch.isActive !== undefined ? branch.isActive : true,
          status: branch.status || "active",
        });

        if (branch.openingHours && branch.openingHours.length > 0) {
          setOpeningHours(branch.openingHours);
        }
      } else {
        setMessage({ type: "error", text: "فشل تحميل بيانات الفرع" });
      }
    } catch (error) {
      console.error("Error fetching branch:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء تحميل البيانات" });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (location: { lat: number; lng: number; address?: string }) => {
    setFormData(prev => ({
      ...prev,
      location: { lat: location.lat, lng: location.lng },
      address: location.address || prev.address,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.phone) {
      setMessage({ type: "error", text: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          openingHours,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "تم تحديث الفرع بنجاح" });
        setTimeout(() => {
          router.push("/admin/branches");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "فشل تحديث الفرع" });
      }
    } catch (error) {
      console.error("Error updating branch:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء التحديث" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (formData.isMainBranch) {
      setMessage({ type: "error", text: "لا يمكن حذف الفرع الرئيسي" });
      return;
    }

    if (!confirm("هل أنت متأكد من حذف هذا الفرع؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "تم حذف الفرع بنجاح" });
        setTimeout(() => {
          router.push("/admin/branches");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "فشل حذف الفرع" });
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء الحذف" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-24" />
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-96" />
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-64" />
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/branches")}
              className="p-2 hover:bg-card rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">تعديل الفرع</h1>
              <p className="text-muted-foreground mt-1">قم بتعديل معلومات الفرع</p>
            </div>
          </div>

          {!formData.isMainBranch && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-all"
            >
              <Trash2 className="w-4 h-4" />
              حذف الفرع
            </button>
          )}
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
          {/* Basic Info Card */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">المعلومات الأساسية</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسم الفرع (عربي) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="فرع الرياض"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسم الفرع (إنجليزي)
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Riyadh Branch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  رقم الهاتف <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+966 50 123 4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="riyadh@restaurant.com"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                العنوان <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="شارع الملك فهد، الرياض، المملكة العربية السعودية"
                required
              />
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">الموقع على الخريطة</h2>
            <LocationPicker
              initialLocation={formData.location}
              onLocationChange={handleLocationChange}
              height="400px"
            />
            <div className="mt-3 text-sm text-muted-foreground">
              <p>
                <strong>الإحداثيات:</strong> {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Opening Hours Card */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <OpeningHoursEditor hours={openingHours} onChange={setOpeningHours} />
          </div>

          {/* Settings Card */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">الإعدادات</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">الفرع الرئيسي</label>
                  <p className="text-xs text-muted-foreground">تحديد هذا الفرع كفرع رئيسي</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMainBranch}
                    onChange={(e) => setFormData({ ...formData, isMainBranch: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">تفعيل الفرع</label>
                  <p className="text-xs text-muted-foreground">جعل الفرع مرئياً للعملاء</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">حالة الفرع</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="coming_soon">قريباً</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3 rounded-lg font-bold transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/branches")}
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
