"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  QrCode as QrIcon,
  BarChart3,
  Download,
  Eye,
  MapPin,
  Grid3X3,
  Tag as TagIcon,
  Filter,
  Search,
  Calendar,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "@/components/SkeletonLoader";

interface QRCode {
  _id: string;
  name: string;
  nameEn?: string;
  type: 'branch' | 'table' | 'category' | 'custom';
  branchId?: any;
  tableNumber?: string;
  categoryId?: any;
  url: string;
  token: string;
  customization: {
    foregroundColor: string;
    backgroundColor: string;
    size: number;
    logoUrl?: string;
  };
  totalScans: number;
  lastScannedAt?: string;
  isActive: boolean;
  createdAt: string;
}

export default function QRCodesPage() {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'branch' | 'table' | 'category' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch("/api/qrcodes");
      const data = await response.json();

      if (data.success) {
        setQrCodes(data.data);
      }
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      showMessage("error", "فشل تحميل رموز QR");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف رمز QR هذا؟")) return;

    try {
      const response = await fetch(`/api/qrcodes/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "تم حذف رمز QR بنجاح");
        fetchQRCodes();
      } else {
        showMessage("error", data.error || "فشل حذف رمز QR");
      }
    } catch (error) {
      console.error("Error deleting QR code:", error);
      showMessage("error", "حدث خطأ أثناء الحذف");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'branch':
        return <MapPin className="w-4 h-4" />;
      case 'table':
        return <Grid3X3 className="w-4 h-4" />;
      case 'category':
        return <TagIcon className="w-4 h-4" />;
      default:
        return <QrIcon className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'branch':
        return 'فرع';
      case 'table':
        return 'طاولة';
      case 'category':
        return 'فئة';
      case 'custom':
        return 'مخصص';
      default:
        return type;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'لم يتم المسح بعد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredQRCodes = qrCodes.filter(qr => {
    // Filter by type
    if (filterType !== 'all' && qr.type !== filterType) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        qr.name.toLowerCase().includes(query) ||
        qr.nameEn?.toLowerCase().includes(query) ||
        qr.token.toLowerCase().includes(query) ||
        qr.tableNumber?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const stats = {
    total: qrCodes.length,
    active: qrCodes.filter(q => q.isActive).length,
    totalScans: qrCodes.reduce((sum, q) => sum + q.totalScans, 0),
    branches: qrCodes.filter(q => q.type === 'branch').length,
    tables: qrCodes.filter(q => q.type === 'table').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-3 md:p-4 border border-border">
                <div className="flex items-center gap-2 md:gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-6 w-16 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 w-64 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <Skeleton className="h-40" />
                <div className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">إدارة رموز QR</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              قم بإنشاء وإدارة رموز QR للفروع والطاولات والفئات
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/qrcodes/new")}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 md:px-6 py-3 rounded-lg font-bold transition-all w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            إنشاء رمز QR جديد
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          <div className="bg-card rounded-lg p-3 md:p-4 border border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <QrIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">إجمالي الرموز</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-3 md:p-4 border border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{stats.totalScans}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">إجمالي المسح</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-3 md:p-4 border border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{stats.branches}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">فروع</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-3 md:p-4 border border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Grid3X3 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{stats.tables}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">طاولات</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-3 md:p-4 border border-border">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">نشط</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن رموز QR..."
              className="w-full pr-10 pl-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 bg-card rounded-lg p-1 border border-border overflow-x-auto">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'branch', label: 'فرع' },
              { value: 'table', label: 'طاولة' },
              { value: 'category', label: 'فئة' },
              { value: 'custom', label: 'مخصص' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value as any)}
                className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                  filterType === filter.value
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* QR Codes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredQRCodes.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <QrIcon className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-base md:text-lg">لا توجد رموز QR</p>
              <p className="text-muted-foreground/70 text-xs md:text-sm mt-2">ابدأ بإنشاء رمز QR جديد</p>
            </div>
          ) : (
            filteredQRCodes.map((qr) => (
              <motion.div
                key={qr._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-xl border border-card-foreground/10 hover:border-primary/30 transition-all overflow-hidden group"
              >
                {/* QR Preview */}
                <div
                  className="aspect-square p-4 md:p-6 flex items-center justify-center relative"
                  style={{ backgroundColor: qr.customization.backgroundColor }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <QrIcon
                      className="w-16 h-16 md:w-20 md:h-20"
                      style={{ color: qr.customization.foregroundColor }}
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                      qr.isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {qr.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Type Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                      {getTypeIcon(qr.type)}
                      {getTypeLabel(qr.type)}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-foreground mb-1 text-sm md:text-base truncate">
                    {qr.name}
                  </h3>
                  {qr.nameEn && (
                    <p className="text-xs text-muted-foreground mb-3 truncate">{qr.nameEn}</p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-xs">
                    {qr.branchId && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{qr.branchId.name}</span>
                      </div>
                    )}
                    {qr.tableNumber && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Grid3X3 className="w-3 h-3" />
                        <span>طاولة رقم {qr.tableNumber}</span>
                      </div>
                    )}
                    {qr.categoryId && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TagIcon className="w-3 h-3" />
                        <span className="truncate">{qr.categoryId.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="w-3 h-3" />
                      <span>{qr.totalScans} مسح</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate">{formatDate(qr.lastScannedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => router.push(`/admin/qrcodes/${qr._id}/analytics`)}
                      className="flex items-center justify-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 rounded-lg text-xs font-medium transition-all"
                      title="الإحصائيات"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">إحصائيات</span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/qrcodes/${qr._id}`)}
                      className="flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary py-2 rounded-lg text-xs font-medium transition-all"
                      title="تعديل"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">تعديل</span>
                    </button>
                    <button
                      onClick={() => handleDelete(qr._id)}
                      className="flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-xs font-medium transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">حذف</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
