"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  BarChart3,
  TrendingUp,
  Calendar,
  Smartphone,
  Tablet,
  Monitor,
  Clock,
  Eye,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/SkeletonLoader";

interface QRCodeAnalytics {
  qrCode: {
    id: string;
    name: string;
    type: string;
    totalScans: number;
    lastScannedAt?: string;
  };
  statistics: {
    totalScans: number;
    mobileScans: number;
    tabletScans: number;
    desktopScans: number;
  };
  scansByDay: Array<{ _id: string; count: number }>;
  scansByHour: Array<{ _id: number; count: number }>;
  recentScans: Array<{
    scannedAt: string;
    deviceType: string;
  }>;
}

export default function QRCodeAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const qrCodeId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<QRCodeAnalytics | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (qrCodeId) {
      fetchAnalytics();
    }
  }, [qrCodeId, days]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/qrcodes/${qrCodeId}/analytics?days=${days}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getDeviceLabel = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return 'موبايل';
      case 'tablet':
        return 'تابلت';
      case 'desktop':
        return 'كمبيوتر';
      default:
        return 'غير معروف';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-48 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 md:p-6 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-8 w-20 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card rounded-xl p-4 md:p-6 border border-border">
              <Skeleton className="h-6 w-40 mb-6" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
              <Skeleton className="h-6 w-32 mb-6" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="text-left">
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-3 w-12 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
        </div>
      </div>
    );
  }

  const totalScans = analytics.statistics.totalScans;
  const avgPerDay = totalScans > 0 ? (totalScans / days).toFixed(1) : 0;
  const mobilePercentage = totalScans > 0 ? ((analytics.statistics.mobileScans / totalScans) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/qrcodes")}
              className="p-2 hover:bg-card rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">إحصائيات رمز QR</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">{analytics.qrCode.name}</p>
            </div>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-2 bg-card rounded-lg p-1 border border-border">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
                  days === d
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {d} يوم
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{totalScans}</p>
                <p className="text-xs text-muted-foreground">إجمالي المسح</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{avgPerDay}</p>
                <p className="text-xs text-muted-foreground">متوسط يومي</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{mobilePercentage}%</p>
                <p className="text-xs text-muted-foreground">موبايل</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-foreground font-medium truncate">
                  {analytics.qrCode.lastScannedAt
                    ? formatDate(analytics.qrCode.lastScannedAt)
                    : 'لا يوجد'}
                </p>
                <p className="text-xs text-muted-foreground">آخر مسح</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scans by Day Chart */}
          <div className="lg:col-span-2 bg-card rounded-xl p-4 md:p-6 border border-border">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              المسح حسب اليوم
            </h2>

            <div className="space-y-2">
              {analytics.scansByDay.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
              ) : (
                analytics.scansByDay.slice(0, 30).map((day) => {
                  const maxCount = Math.max(...analytics.scansByDay.map(d => d.count));
                  const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;

                  return (
                    <div key={day._id} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground min-w-[60px]">
                        {formatDate(day._id)}
                      </span>
                      <div className="flex-1 bg-background rounded-full h-8 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-end pr-3"
                        >
                          {day.count > 0 && (
                            <span className="text-xs font-bold text-white">{day.count}</span>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              حسب الجهاز
            </h2>

            <div className="space-y-4">
              {[
                { type: 'mobile', count: analytics.statistics.mobileScans, icon: Smartphone, color: 'text-green-400', bg: 'bg-green-500/10' },
                { type: 'tablet', count: analytics.statistics.tabletScans, icon: Tablet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { type: 'desktop', count: analytics.statistics.desktopScans, icon: Monitor, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map((device) => {
                const percentage = totalScans > 0 ? ((device.count / totalScans) * 100).toFixed(1) : 0;

                return (
                  <div key={device.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 ${device.bg} rounded-lg`}>
                          <device.icon className={`w-4 h-4 ${device.color}`} />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {getDeviceLabel(device.type)}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-foreground">{device.count}</p>
                        <p className="text-xs text-muted-foreground">{percentage}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`h-full ${device.bg.replace('/10', '')}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              أوقات الذروة
            </h2>

            <div className="space-y-2">
              {analytics.scansByHour.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
              ) : (
                analytics.scansByHour.slice(0, 10).map((hour) => {
                  const maxCount = Math.max(...analytics.scansByHour.map(h => h.count));
                  const percentage = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;

                  return (
                    <div key={hour._id} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground min-w-[50px]">
                        {hour._id}:00
                      </span>
                      <div className="flex-1 bg-background rounded-full h-6 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.15 }}
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 flex items-center justify-end pr-2"
                        >
                          {hour.count > 0 && (
                            <span className="text-xs font-bold text-white">{hour.count}</span>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Scans */}
          <div className="lg:col-span-2 bg-card rounded-xl p-4 md:p-6 border border-border">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              آخر عمليات المسح
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">الوقت</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">الجهاز</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentScans.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-8 text-muted-foreground">
                        لا توجد عمليات مسح
                      </td>
                    </tr>
                  ) : (
                    analytics.recentScans.map((scan, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border hover:bg-background/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-foreground">
                          {formatDateTime(scan.scannedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(scan.deviceType)}
                            <span className="text-sm text-foreground">
                              {getDeviceLabel(scan.deviceType)}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
