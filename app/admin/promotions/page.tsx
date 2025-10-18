"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Tag,
  Gift,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Percent,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/SkeletonLoader";
import { useAlert, useConfirmation } from "@/components/ui/alerts";

interface Promotion {
  _id: string;
  name: string;
  nameEn?: string;
  type: 'discount-code' | 'buy-x-get-y';
  description?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  usageCount: number;
  code?: string;
  discountType?: 'percent' | 'fixed';
  value?: number;
  usageLimit?: number;
  minPurchaseAmount?: number;
  buyQty?: number;
  getQty?: number;
  applicableItems?: any[];
  applicableCategories?: any[];
  isValid?: boolean;
  isExpired?: boolean;
  canBeUsed?: boolean;
  createdAt: string;
}

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'discount-code' | 'buy-x-get-y'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

  const { showSuccess, showError } = useAlert();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await fetch("/api/promotions");
      const data = await response.json();

      if (data.success) {
        setPromotions(data.data);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      showMessage("error", "فشل تحميل العروض");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirm(
      {
        title: 'حذف العرض',
        message: 'هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.',
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        type: 'danger',
      },
      async () => {
        try {
          const response = await fetch(`/api/promotions/${id}`, {
            method: "DELETE",
          });

          const data = await response.json();

          if (data.success) {
            showSuccess("تم حذف العرض بنجاح");
            fetchPromotions();
          } else {
            showError(data.error || "فشل حذف العرض");
          }
        } catch (error) {
          console.error("Error deleting promotion:", error);
          showError("حدث خطأ أثناء الحذف");
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (promo: Promotion) => {
    if (!promo.active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 admin-badge rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" />
          غير نشط
        </span>
      );
    }

    if (promo.isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 admin-badge rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          منتهي
        </span>
      );
    }

    if (!promo.isValid) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 admin-badge rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          قريباً
        </span>
      );
    }

    if (promo.canBeUsed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 admin-badge rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          نشط
        </span>
      );
    }

    return null;
  };

  const filteredPromotions = promotions.filter(promo => {
    // Filter by type
    if (filterType !== 'all' && promo.type !== filterType) return false;

    // Filter by status
    if (filterStatus === 'active' && (!promo.active || !promo.canBeUsed)) return false;
    if (filterStatus === 'expired' && !promo.isExpired) return false;

    return true;
  });

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.active && p.canBeUsed).length,
    expired: promotions.filter(p => p.isExpired).length,
    totalUsage: promotions.reduce((sum, p) => sum + p.usageCount, 0),
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="admin-card rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-6 w-20 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="admin-card rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-3 mb-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
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
            <h1 className="text-3xl font-bold mb-2">إدارة العروض</h1>
            <p>
              قم بإنشاء وإدارة أكواد الخصم وعروض اشتري X واحصل على Y
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/promotions/new")}
            className="admin-button"
          >
            <Plus className="w-5 h-5" />
            إضافة عرض جديد
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="admin-card rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs">إجمالي العروض</p>
              </div>
            </div>
          </div>

          <div className="admin-card rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs">عروض نشطة</p>
              </div>
            </div>
          </div>

          <div className="admin-card rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expired}</p>
                <p className="text-xs">عروض منتهية</p>
              </div>
            </div>
          </div>

          <div className="admin-card rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsage}</p>
                <p className="text-xs">إجمالي الاستخدامات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 admin-card rounded-lg p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`admin-button ${filterType === 'all' ? 'active' : ''}`}>
              الكل
            </button>
            <button
              onClick={() => setFilterType('discount-code')}
              className={`admin-button ${filterType === 'discount-code' ? 'active' : ''}`}>
              أكواد خصم
            </button>
            <button
              onClick={() => setFilterType('buy-x-get-y')}
              className={`admin-button ${filterType === 'buy-x-get-y' ? 'active' : ''}`}>
              اشتري X واحصل على Y
            </button>
          </div>

          <div className="flex items-center gap-2 admin-card rounded-lg p-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`admin-button ${filterStatus === 'all' ? 'active' : ''}`}>
              جميع الحالات
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`admin-button ${filterStatus === 'active' ? 'active' : ''}`}>
              نشطة
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`admin-button ${filterStatus === 'expired' ? 'active' : ''}`}>
              منتهية
            </button>
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.length === 0 ? (
            <div className="col-span-full text-center py-12 admin-card">
              <Gift className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">لا توجد عروض</p>
              <p className="mt-2">ابدأ بإضافة عرض جديد</p>
            </div>
          ) : (
            filteredPromotions.map((promo) => (
              <motion.div
                key={promo._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="admin-card rounded-xl p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      promo.type === 'discount-code'
                        ? 'bg-purple-500/10'
                        : 'bg-blue-500/10'
                    }`}>
                      {promo.type === 'discount-code' ? (
                        <Tag className={`w-5 h-5 ${
                          promo.type === 'discount-code' ? 'text-purple-400' : 'text-blue-400'
                        }`} />
                      ) : (
                        <Gift className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{promo.name}</h3>
                      <p className="text-xs">
                        {promo.type === 'discount-code' ? 'كود خصم' : 'اشتري واحصل'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(promo)}
                </div>

                {/* Promotion Details */}
                <div className="space-y-3 mb-4">
                  {promo.type === 'discount-code' && (
                    <>
                      <div className="flex items-center justify-between admin-card rounded-lg p-3">
                        <span className="text-sm">الكود</span>
                        <span className="font-mono font-bold text-lg">
                          {promo.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {promo.discountType === 'percent' ? (
                          <Percent className="w-4 h-4" />
                        ) : (
                          <DollarSign className="w-4 h-4" />
                        )}
                        <span className="text-sm">
                          خصم {promo.value} {promo.discountType === 'percent' ? '%' : 'ريال'}
                        </span>
                      </div>
                      {promo.minPurchaseAmount && promo.minPurchaseAmount > 0 && (
                        <div className="text-sm">
                          الحد الأدنى: {promo.minPurchaseAmount} ريال
                        </div>
                      )}
                    </>
                  )}

                  {promo.type === 'buy-x-get-y' && (
                    <>
                      <div className="admin-card rounded-lg p-3">
                        <p className="text-sm font-medium">
                          اشتري {promo.buyQty} واحصل على {promo.getQty} مجاناً
                        </p>
                      </div>
                      <div className="text-sm">
                        {promo.applicableItems?.length || 0} منتج مؤهل
                      </div>
                    </>
                  )}

                  {/* Date Range */}
                  <div className="flex items-start gap-2 text-xs">
                    <Calendar className="w-4 h-4 mt-0.5" />
                    <div>
                      <div>من: {formatDate(promo.startDate)}</div>
                      <div>إلى: {formatDate(promo.endDate)}</div>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {promo.usageCount} استخدام
                      {promo.usageLimit && ` / ${promo.usageLimit}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={() => router.push(`/admin/promotions/${promo._id}`)}
                    className="admin-button flex-1"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(promo._id)}
                    className="admin-button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      {ConfirmationComponent}
    </div>
  );
}
