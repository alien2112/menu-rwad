"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Save,
  QrCode as QrIcon,
  MapPin,
  Grid3X3,
  Tag as TagIcon,
  Download,
  Palette,
  ImageIcon,
} from "lucide-react";
import QRCodeCanvas from "qrcode.react";
import { Skeleton } from "@/components/SkeletonLoader";

interface Branch {
  _id: string;
  name: string;
  nameEn?: string;
}

interface Category {
  _id: string;
  name: string;
  nameEn?: string;
}

export default function NewQRCodePage() {
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    type: "branch" as "branch" | "table" | "category" | "custom",
    branchId: "",
    tableNumber: "",
    categoryId: "",
    customUrl: "",
    isActive: true,
  });

  const [customization, setCustomization] = useState({
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    borderStyle: "square" as "none" | "square" | "rounded" | "dots",
    size: 300,
    errorCorrectionLevel: "M" as "L" | "M" | "Q" | "H",
    logoUrl: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [branchesRes, categoriesRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/categories"),
      ]);

      const [branchesData, categoriesData] = await Promise.all([
        branchesRes.json(),
        categoriesRes.json(),
      ]);

      if (branchesData.success) {
        setBranches(branchesData.data || []);
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

  const getPreviewUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    let url = `${baseUrl}/menu?qr=PREVIEW`;

    if (formData.type === 'branch' && formData.branchId) {
      url += `&branch=${formData.branchId}`;
    }
    if (formData.type === 'table' && formData.branchId && formData.tableNumber) {
      url += `&branch=${formData.branchId}&table=${formData.tableNumber}`;
    }
    if (formData.type === 'category' && formData.categoryId) {
      url += `&category=${formData.categoryId}`;
    }
    if (formData.type === 'custom' && formData.customUrl) {
      url = formData.customUrl;
    }

    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      setMessage({ type: "error", text: "يرجى إدخال اسم رمز QR" });
      return;
    }

    if (formData.type === 'branch' && !formData.branchId) {
      setMessage({ type: "error", text: "يرجى اختيار الفرع" });
      return;
    }

    if (formData.type === 'table' && (!formData.branchId || !formData.tableNumber)) {
      setMessage({ type: "error", text: "يرجى اختيار الفرع ورقم الطاولة" });
      return;
    }

    if (formData.type === 'category' && !formData.categoryId) {
      setMessage({ type: "error", text: "يرجى اختيار الفئة" });
      return;
    }

    if (formData.type === 'custom' && !formData.customUrl) {
      setMessage({ type: "error", text: "يرجى إدخال الرابط المخصص" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/qrcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          customization,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "تم إنشاء رمز QR بنجاح" });
        setTimeout(() => {
          router.push("/admin/qrcodes");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "فشل إنشاء رمز QR" });
      }
    } catch (error) {
      console.error("Error creating QR code:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء إنشاء رمز QR" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPNG = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-${formData.name || 'code'}.png`;
    link.href = url;
    link.click();
  };

  const handleDownloadSVG = async () => {
    try {
      const QRCode = (await import('qrcode')).default;
      const svg = await QRCode.toString(getPreviewUrl(), {
        type: 'svg',
        width: customization.size,
        color: {
          dark: customization.foregroundColor,
          light: customization.backgroundColor,
        },
        errorCorrectionLevel: customization.errorCorrectionLevel,
      });

      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qr-${formData.name || 'code'}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating SVG:', error);
      setMessage({ type: 'error', text: 'فشل في إنشاء ملف SVG' });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) return;

      const { jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/png');

      // A4 size in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Center the QR code on the page
      const qrSize = 100; // 100mm square
      const pageWidth = 210;
      const pageHeight = 297;
      const x = (pageWidth - qrSize) / 2;
      const y = (pageHeight - qrSize) / 2 - 20; // Offset for title

      // Add title
      pdf.setFontSize(16);
      pdf.text(formData.name || 'QR Code', pageWidth / 2, y - 10, { align: 'center' });

      // Add QR code image
      pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);

      // Add URL below QR code
      pdf.setFontSize(10);
      const url = getPreviewUrl();
      const maxWidth = 180;
      const urlLines = pdf.splitTextToSize(url, maxWidth);
      pdf.text(urlLines, pageWidth / 2, y + qrSize + 15, { align: 'center' });

      pdf.save(`qr-${formData.name || 'code'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage({ type: 'error', text: 'فشل في إنشاء ملف PDF' });
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </div>
            </div>
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-80 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <button
            onClick={() => router.push("/admin/qrcodes")}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">إنشاء رمز QR جديد</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">قم بإنشاء رمز QR مخصص مع معاينة مباشرة</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">نوع رمز QR</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'branch', icon: MapPin, label: 'فرع' },
                  { value: 'table', icon: Grid3X3, label: 'طاولة' },
                  { value: 'category', icon: TagIcon, label: 'فئة' },
                  { value: 'custom', icon: QrIcon, label: 'مخصص' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <type.icon className={`w-5 h-5 md:w-6 md:h-6 ${
                      formData.type === type.value ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <span className={`text-xs md:text-sm font-medium ${
                      formData.type === type.value ? 'text-primary' : 'text-foreground'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">المعلومات الأساسية</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    اسم رمز QR (عربي) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="مثال: رمز فرع الرياض"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    الاسم (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Riyadh Branch QR"
                  />
                </div>

                {/* Type-specific fields */}
                {(formData.type === 'branch' || formData.type === 'table') && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      الفرع <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required={formData.type === 'branch' || formData.type === 'table'}
                    >
                      <option value="">اختر الفرع</option>
                      {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>{branch.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.type === 'table' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      رقم الطاولة <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="مثال: 5"
                      required={formData.type === 'table'}
                    />
                  </div>
                )}

                {formData.type === 'category' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      الفئة <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required={formData.type === 'category'}
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.type === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      الرابط المخصص <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.customUrl}
                      onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="https://example.com"
                      required={formData.type === 'custom'}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Customization */}
            <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                التخصيص
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      اللون الأمامي
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customization.foregroundColor}
                        onChange={(e) => setCustomization({ ...customization, foregroundColor: e.target.value })}
                        className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customization.foregroundColor}
                        onChange={(e) => setCustomization({ ...customization, foregroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      اللون الخلفي
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customization.backgroundColor}
                        onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
                        className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customization.backgroundColor}
                        onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    الحجم: {customization.size}px
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="800"
                    step="50"
                    value={customization.size}
                    onChange={(e) => setCustomization({ ...customization, size: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    مستوى تصحيح الخطأ
                  </label>
                  <select
                    value={customization.errorCorrectionLevel}
                    onChange={(e) => setCustomization({ ...customization, errorCorrectionLevel: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="L">منخفض (7%)</option>
                    <option value="M">متوسط (15%)</option>
                    <option value="Q">عالي (25%)</option>
                    <option value="H">عالي جداً (30%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">تفعيل رمز QR</label>
                  <p className="text-xs text-muted-foreground">جعل رمز QR نشطاً ومتاحاً للمسح</p>
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
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3 rounded-lg font-bold transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ رمز QR
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/qrcodes")}
                className="w-full sm:w-auto px-6 py-3 bg-card hover:bg-card/80 border border-border text-foreground rounded-lg font-medium transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>

          {/* Live Preview */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">المعاينة المباشرة</h2>

              <div
                ref={qrRef}
                className="aspect-square rounded-lg flex items-center justify-center p-6 md:p-8 mb-4"
                style={{ backgroundColor: customization.backgroundColor }}
              >
                <QRCodeCanvas
                  value={getPreviewUrl()}
                  size={Math.min(customization.size, 400)}
                  level={customization.errorCorrectionLevel}
                  fgColor={customization.foregroundColor}
                  bgColor={customization.backgroundColor}
                  includeMargin
                />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPNG}
                    className="flex flex-col items-center justify-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-lg font-medium transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs">PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSVG}
                    className="flex flex-col items-center justify-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-3 rounded-lg font-medium transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs">SVG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="flex flex-col items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-lg font-medium transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs">PDF</span>
                  </button>
                </div>

                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">الرابط:</p>
                  <p className="text-xs text-foreground break-all font-mono">{getPreviewUrl()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
