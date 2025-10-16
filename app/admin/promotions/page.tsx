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
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;

    try {
      const response = await fetch(`/api/promotions/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "تم حذف العرض بنجاح");
        fetchPromotions();
      } else {
        showMessage("error", data.error || "فشل حذف العرض");
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      showMessage("error", "حدث خطأ أثناء الحذف");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
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
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" />
          غير نشط
        </span>
      );
    }

    if (promo.isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          منتهي
        </span>
      );
    }

    if (!promo.isValid) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          قريباً
        </span>
      );
    }

    if (promo.canBeUsed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
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
      <div className="min-h-screen bg-background p-6">
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
              <div key={i} className="bg-card rounded-lg p-4 border border-border">
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
              <div key={i} className="bg-card rounded-xl p-6 border border-border">
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
                <div className="flex items-center gap-2 pt-4 border-t border-border">
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إدارة العروض</h1>
            <p className="text-muted-foreground">
              قم بإنشاء وإدارة أكواد الخصم وعروض اشتري X واحصل على Y
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/promotions/new")}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold transition-all"
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
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">إجمالي العروض</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-xs text-muted-foreground">عروض نشطة</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.expired}</p>
                <p className="text-xs text-muted-foreground">عروض منتهية</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalUsage}</p>
                <p className="text-xs text-muted-foreground">إجمالي الاستخدامات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-card rounded-lg p-1 border border-border">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('discount-code')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterType === 'discount-code'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              أكواد خصم
            </button>
            <button
              onClick={() => setFilterType('buy-x-get-y')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterType === 'buy-x-get-y'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              اشتري X واحصل على Y
            </button>
          </div>

          <div className="flex items-center gap-2 bg-card rounded-lg p-1 border border-border">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              جميع الحالات
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterStatus === 'active'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              نشطة
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterStatus === 'expired'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              منتهية
            </button>
          </div>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">لا توجد عروض</p>
              <p className="text-muted-foreground/70 text-sm mt-2">ابدأ بإضافة عرض جديد</p>
            </div>
          ) : (
            filteredPromotions.map((promo) => (
              <motion.div
                key={promo._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-xl p-6 border border-card-foreground/10 hover:border-primary/30 transition-all"
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
                      <h3 className="font-bold text-foreground">{promo.name}</h3>
                      <p className="text-xs text-muted-foreground">
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
                      <div className="flex items-center justify-between bg-background/50 rounded-lg p-3">
                        <span className="text-sm text-muted-foreground">الكود</span>
                        <span className="font-mono font-bold text-primary text-lg">
                          {promo.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {promo.discountType === 'percent' ? (
                          <Percent className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-foreground">
                          خصم {promo.value} {promo.discountType === 'percent' ? '%' : 'ريال'}
                        </span>
                      </div>
                      {promo.minPurchaseAmount && promo.minPurchaseAmount > 0 && (
                        <div className="text-sm text-muted-foreground">
                          الحد الأدنى: {promo.minPurchaseAmount} ريال
                        </div>
                      )}
                    </>
                  )}

                  {promo.type === 'buy-x-get-y' && (
                    <>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-foreground">
                          اشتري {promo.buyQty} واحصل على {promo.getQty} مجاناً
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {promo.applicableItems?.length || 0} منتج مؤهل
                      </div>
                    </>
                  )}

                  {/* Date Range */}
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4 mt-0.5" />
                    <div>
                      <div>من: {formatDate(promo.startDate)}</div>
                      <div>إلى: {formatDate(promo.endDate)}</div>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {promo.usageCount} استخدام
                      {promo.usageLimit && ` / ${promo.usageLimit}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-card-foreground/10">
                  <button
                    onClick={() => router.push(`/admin/promotions/${promo._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-2 px-4 rounded-lg text-sm font-medium transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(promo._id)}
                    className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
