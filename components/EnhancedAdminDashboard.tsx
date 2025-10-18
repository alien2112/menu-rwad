'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Bell,
  Settings,
  BarChart3,
  FileText,
  Download
} from 'lucide-react';
import SSENotificationCenter from '@/components/WebSocketNotificationCenter';
import { Skeleton } from '@/components/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '@/components/ui/alerts';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalMenuItems: number;
  activeMenuItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStaff: number;
  activeStaff: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export default function EnhancedAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'place' | 'password' | 'user'>('place');
  const [placeName, setPlaceName] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'kitchen' | 'barista' | 'shisha'>('kitchen');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const { showSuccess, showError } = useAlert();

  // Fetch dashboard data
  useEffect(() => {
  const fetchDashboardData = async () => {
      try {
    setLoading(true);
        
      // Fetch stats
        const statsResponse = await fetch('/api/admin/bulk-operations?operation=menu-stats');
      const statsData = await statsResponse.json();
      
        const inventoryResponse = await fetch('/api/admin/bulk-operations?operation=inventory-alerts');
        const inventoryData = await inventoryResponse.json();
        
        const ordersResponse = await fetch('/api/admin/bulk-operations?operation=order-summary');
        const ordersData = await ordersResponse.json();

        // Fetch recent activity
        const activityResponse = await fetch('/api/admin/recent-activity');
        const activityData = await activityResponse.json();
        if (activityData?.success) {
          setRecentActivities(activityData.data || []);
        }
        
        // Combine stats
        const combinedStats: DashboardStats = {
          totalOrders: ordersData.data?.totalOrders || 0,
          totalRevenue: ordersData.data?.totalRevenue || 0,
          pendingOrders: ordersData.data?.pendingOrders || 0,
          completedOrders: ordersData.data?.completedOrders || 0,
          totalMenuItems: statsData.data?.totalItems || 0,
          activeMenuItems: statsData.data?.activeItems || 0,
          lowStockItems: inventoryData.data?.lowStockCount || 0,
          outOfStockItems: inventoryData.data?.outOfStockCount || 0,
          totalStaff: 0, // Will be fetched from staff API
          activeStaff: 0
        };
        
        setStats(combinedStats);
        
        // Fetch sales data for chart
        const salesResponse = await fetch('/api/admin/reports/sales?type=daily&from=2024-01-01');
        const salesResult = await salesResponse.json();
        setSalesData(salesResult.data || []);
        
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load existing place name and user id
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('admin_place_name');
      if (savedName) setPlaceName(savedName);
    } catch {}
    try {
      const auth = localStorage.getItem('user_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed?.id) setCurrentUserId(parsed.id);
      }
    } catch {}
  }, []);


  const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    trend?: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="admin-card rounded-lg p-6"
      style={{ perspective: 800 }}
    >
      <motion.div style={{ transformStyle: "preserve-3d" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs mt-1" style={{ color: '#10b981' }}>{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const QuickActionButton = ({ title, icon: Icon, onClick, color }: {
    title: string;
    icon: React.ComponentType<any>;
    onClick: () => void;
    color: string;
  }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className={`admin-button flex items-center space-x-3 p-4 rounded-lg transition-shadow ${color}`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{title}</span>
    </motion.button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        {/* Header Skeleton */}
        <div className="admin-card border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton height="h-6" width="w-48" />
                <Skeleton height="h-4" width="w-64" />
              </div>
              <Skeleton height="h-10" width="w-28" className="rounded-lg" />
            </div>
          </div>
        </div>

        <div className="px-6 py-8 space-y-8">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="admin-card rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <Skeleton height="h-4" width="w-24" className="mb-2" />
                    <Skeleton height="h-6" width="w-20" />
                    <Skeleton height="h-3" width="w-16" className="mt-2" />
                  </div>
                  <Skeleton height="h-10" width="w-10" className="rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Secondary Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="admin-card rounded-lg p-6">
                <Skeleton height="h-4" width="w-24" className="mb-2" />
                <Skeleton height="h-6" width="w-28" />
              </div>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="admin-card rounded-lg p-6">
            <Skeleton height="h-5" width="w-32" className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-lg admin-card">
                  <Skeleton height="h-5" width="w-5" className="rounded-full" />
                  <Skeleton height="h-4" width="w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="admin-card rounded-lg p-6">
            <Skeleton height="h-5" width="w-40" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 admin-card rounded-lg">
                  <Skeleton height="h-5" width="w-5" className="rounded-full" />
                  <div className="flex-1">
                    <Skeleton height="h-4" width="w-1/2" className="mb-1" />
                    <Skeleton height="h-3" width="w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
        {/* Header */}
      <div className="admin-card border-b">
        <div className="px-6 py-4">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">لوحة التحكم الإدارية</h1>
              <p>نظرة شاملة على أداء المطعم</p>
            </div>
            <div className="flex items-center space-x-4">
              <SSENotificationCenter 
                userId="admin" 
                role="admin" 
                className="relative"
              />
              <button onClick={() => setShowSettings(true)} className="admin-button">
                <Settings className="h-4 w-4 inline mr-2" />
                الإعدادات
            </button>
            </div>
          </div>
          </div>
        </div>

      <div className="px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي الطلبات"
            value={stats?.totalOrders || 0}
            icon={ShoppingCart}
            color="bg-blue-500"
          />
          <StatCard
            title="إجمالي الإيرادات"
            value={`${stats?.totalRevenue || 0} ر.س`}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatCard
            title="الطلبات المعلقة"
            value={stats?.pendingOrders || 0}
            icon={AlertTriangle}
            color="bg-yellow-500"
          />
          <StatCard
            title="الطلبات المكتملة"
            value={stats?.completedOrders || 0}
            icon={Package}
            color="bg-purple-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="عناصر القائمة"
            value={`${stats?.activeMenuItems || 0}/${stats?.totalMenuItems || 0}`}
            icon={FileText}
            color="bg-indigo-500"
          />
          <StatCard
            title="مخزون منخفض"
            value={stats?.lowStockItems || 0}
            icon={AlertTriangle}
            color="bg-orange-500"
          />
          <StatCard
            title="نفد المخزون"
            value={stats?.outOfStockItems || 0}
            icon={AlertTriangle}
            color="bg-red-500"
          />
          <StatCard
            title="الموظفين النشطين"
            value={`${stats?.activeStaff || 0}/${stats?.totalStaff || 0}`}
            icon={Users}
            color="bg-teal-500"
          />
                  </div>

              {/* Quick Actions */}
        <div className="admin-card rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">الإجراءات السريعة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              title="عرض التقارير"
              icon={BarChart3}
              onClick={() => window.location.href = '/admin/reports/summary'}
              color="hover:bg-blue-50"
            />
            <QuickActionButton
              title="إدارة المخزون"
              icon={Package}
              onClick={() => window.location.href = '/admin/storage'}
              color="hover:bg-green-50"
            />
            <QuickActionButton
              title="إدارة الطلبات"
              icon={ShoppingCart}
              onClick={() => window.location.href = '/admin/orders'}
              color="hover:bg-yellow-50"
            />
            <QuickActionButton
              title="تصدير البيانات"
              icon={Download}
              onClick={() => window.location.href = '/api/admin/reports/sales?type=summary&format=excel'}
              color="hover:bg-purple-50"
            />
                </div>
              </div>

              {/* Recent Activity */}
        <div className="admin-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">النشاط الأخير</h2>
          <div className="space-y-3">
            {recentActivities.length === 0 && (
              <p className="text-sm">لا توجد أنشطة حديثة</p>
            )}
            {recentActivities.map((act, index) => {
              const type = act.type as string;
              const iconColor = type === 'inventory' ? { color: '#ea580c' } : type === 'order' ? { color: '#3b82f6' } : type === 'staff' ? { color: '#10b981' } : { color: '#8b5cf6' };
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 admin-card rounded-lg"
                >
                  {type === 'inventory' ? (
                    <AlertTriangle className="h-5 w-5" style={iconColor} />
                  ) : type === 'order' ? (
                    <ShoppingCart className="h-5 w-5" style={iconColor} />
                  ) : type === 'staff' ? (
                    <Users className="h-5 w-5" style={iconColor} />
                  ) : (
                    <Bell className="h-5 w-5" style={iconColor} />
                  )}
                  <div>
                    <p className="text-sm font-medium">{act.message}</p>
                    <p className="text-xs">{new Date(act.timestamp).toLocaleString()}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettings(false)}></div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative admin-card rounded-2xl w-full max-w-2xl mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">إعدادات الإدارة</h3>
                <button className="hover:text-white" onClick={() => setShowSettings(false)}>✕</button>
              </div>
              <div className="flex gap-2 mb-6">
                <button onClick={() => setSettingsTab('place')} className={`admin-button ${settingsTab==='place' ? 'active' : ''}`}>اسم المكان</button>
                <button onClick={() => setSettingsTab('password')} className={`admin-button ${settingsTab==='password' ? 'active' : ''}`}>تغيير كلمة المرور</button>
                <button onClick={() => setSettingsTab('user')} className={`admin-button ${settingsTab==='user' ? 'active' : ''}`}>إضافة مستخدم</button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={settingsTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {settingsTab === 'place' && (
                    <div className="space-y-4">
                      <label className="block">اسم المكان</label>
                      <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} className="admin-input w-full" placeholder="اكتب اسم المكان" />
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            try {
                              localStorage.setItem('admin_place_name', placeName);
                              window.dispatchEvent(new StorageEvent('storage', { key: 'admin_place_name', newValue: placeName } as any));
                              showSuccess('تم حفظ اسم المكان بنجاح');
                            } catch {
                              showError('تعذر الحفظ محليًا');
                            }
                          }}
                          className="admin-button"
                        >حفظ</button>
                      </div>
                    </div>
                  )}

                  {settingsTab === 'password' && (
                    <div className="space-y-4">
                      <label className="block">كلمة مرور جديدة</label>
                      <input type="password" value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} className="admin-input w-full" placeholder="*****" />
                      <div className="flex justify-end">
                        <button
                          onClick={async () => {
                            if (!currentUserId) {
                              showError('غير مسجل الدخول');
                              return;
                            }
                            if (!passwordValue || passwordValue.length < 6) {
                              showError('الحد الأدنى 6 أحرف');
                              return;
                            }
                            try {
                              const res = await fetch(`/api/staff/${currentUserId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ password: passwordValue })
                              });
                              const data = await res.json();
                              if (res.ok && data?.success !== false) {
                                showSuccess('تم تحديث كلمة المرور');
                                setPasswordValue('');
                              } else {
                                showError(data?.error || 'فشل التحديث');
                              }
                            } catch (e) {
                              showError('حدث خطأ أثناء التحديث');
                            }
                          }}
                          className="admin-button"
                        >تحديث</button>
                      </div>
                    </div>
                  )}

                  {settingsTab === 'user' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1">الدور</label>
                          <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)} className="admin-input w-full">
                            <option value="kitchen">المطبخ</option>
                            <option value="barista">البارستا</option>
                            <option value="shisha">الشيشة</option>
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1">اسم المستخدم</label>
                          <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="admin-input w-full" placeholder="username" />
                        </div>
                        <div>
                          <label className="block mb-1">الاسم</label>
                          <input value={newName} onChange={(e) => setNewName(e.target.value)} className="admin-input w-full" placeholder="الاسم" />
                        </div>
                        <div>
                          <label className="block mb-1">كلمة المرور</label>
                          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="admin-input w-full" placeholder="*****" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={async () => {
                            if (!newUsername || !newName || !newPassword) {
                              showError('يرجى تعبئة جميع الحقول');
                              return;
                            }
                            try {
                              const res = await fetch('/api/staff', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ username: newUsername, name: newName, password: newPassword, role: newUserRole, isActive: true })
                              });
                              const data = await res.json();
                              if (res.ok && data?.success !== false) {
                                showSuccess('تم إنشاء المستخدم بنجاح');
                                setNewUsername('');
                                setNewName('');
                                setNewPassword('');
                              } else {
                                showError(data?.error || 'فشل إنشاء المستخدم');
                              }
                            } catch (e) {
                              showError('حدث خطأ أثناء الإنشاء');
                            }
                          }}
                          className="admin-button"
                        >إضافة</button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}