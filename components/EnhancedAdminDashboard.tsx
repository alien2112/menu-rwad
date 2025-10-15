'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
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
import ColorPicker from '@/components/admin/ColorPicker';
import { Skeleton } from '@/components/SkeletonLoader';

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
  const [settingsTab, setSettingsTab] = useState<'place' | 'password' | 'user' | 'theme'>('place');
  const [placeName, setPlaceName] = useState<string>('');
  const [placeSaveMessage, setPlaceSaveMessage] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'kitchen' | 'barista' | 'shisha'>('kitchen');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [createUserMessage, setCreateUserMessage] = useState<string>('');
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [passwordMessage, setPasswordMessage] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Theme settings from context
  const { theme: contextTheme, loading: themeLoading, updateTheme, resetTheme: resetThemeContext, refetchTheme } = useTheme();
  const [themeMessage, setThemeMessage] = useState<string>('');
  const [localTheme, setLocalTheme] = useState<Record<string, string>>({
    background: '',
    foreground: '',
    primary: '',
    secondary: '',
    accent: '',
    card: '',
    'card-foreground': '',
    muted: '',
    'muted-foreground': '',
    ring: '',
    'scroll-thumb-start': '',
    'scroll-thumb-end': '',
    'scroll-track': '',
  });

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

  // Load theme from context when opening settings modal or theme tab
  useEffect(() => {
    if (showSettings && settingsTab === 'theme') {
      if (contextTheme) {
        setLocalTheme((prev) => ({ ...prev, ...contextTheme }));
      } else {
        // Refetch if no theme in context
        refetchTheme();
      }
    }
  }, [showSettings, settingsTab, contextTheme, refetchTheme]);

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
    <div className="glass-effect rounded-lg border border-white/10 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <p className="text-xs text-green-300 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionButton = ({ title, icon: Icon, onClick, color }: {
    title: string;
    icon: React.ComponentType<any>;
    onClick: () => void;
    color: string;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-shadow text-white ${color}`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{title}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        {/* Header Skeleton */}
        <div className="glass-effect border-b border-white/10">
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
              <div key={i} className="glass-effect rounded-lg border border-white/10 p-6">
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
              <div key={i} className="glass-effect rounded-lg border border-white/10 p-6">
                <Skeleton height="h-4" width="w-24" className="mb-2" />
                <Skeleton height="h-6" width="w-28" />
              </div>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="glass-effect rounded-lg border border-white/10 p-6">
            <Skeleton height="h-5" width="w-32" className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
                  <Skeleton height="h-5" width="w-5" className="rounded-full" />
                  <Skeleton height="h-4" width="w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="glass-effect rounded-lg border border-white/10 p-6">
            <Skeleton height="h-5" width="w-40" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
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
      <div className="glass-effect border-b border-white/10">
        <div className="px-6 py-4">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">لوحة التحكم الإدارية</h1>
              <p className="text-white/80">نظرة شاملة على أداء المطعم</p>
            </div>
            <div className="flex items-center space-x-4">
              <SSENotificationCenter 
                userId="admin" 
                role="admin" 
                className="relative"
              />
              <button onClick={() => setShowSettings(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
            trend="+12% من الأسبوع الماضي"
          />
          <StatCard
            title="إجمالي الإيرادات"
            value={`${stats?.totalRevenue || 0} ر.س`}
            icon={TrendingUp}
            color="bg-green-500"
            trend="+8% من الأسبوع الماضي"
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
        <div className="glass-effect rounded-lg border border-white/10 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">الإجراءات السريعة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              title="عرض التقارير"
              icon={BarChart3}
              onClick={() => window.open('/api/admin/reports/sales?type=summary', '_blank')}
              color="hover:bg-blue-50"
            />
            <QuickActionButton
              title="إدارة المخزون"
              icon={Package}
              onClick={() => window.location.href = '/admin/inventory'}
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
              onClick={() => window.open('/api/admin/reports/sales?type=summary&format=excel', '_blank')}
              color="hover:bg-purple-50"
            />
                </div>
              </div>

              {/* Recent Activity */}
        <div className="glass-effect rounded-lg border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">النشاط الأخير</h2>
          <div className="space-y-3">
            {recentActivities.length === 0 && (
              <p className="text-white/70 text-sm">لا توجد أنشطة حديثة</p>
            )}
            {recentActivities.map((act) => {
              const type = act.type as string;
              const iconColor = type === 'inventory' ? 'text-orange-500' : type === 'order' ? 'text-blue-500' : type === 'staff' ? 'text-emerald-500' : 'text-purple-500';
              return (
                <div key={act.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  {type === 'inventory' ? (
                    <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
                  ) : type === 'order' ? (
                    <ShoppingCart className={`h-5 w-5 ${iconColor}`} />
                  ) : type === 'staff' ? (
                    <Users className={`h-5 w-5 ${iconColor}`} />
                  ) : (
                    <Bell className={`h-5 w-5 ${iconColor}`} />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{act.message}</p>
                    <p className="text-xs text-white/70">{new Date(act.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettings(false)}></div>
          <div className="relative glass-effect border border-white/10 rounded-2xl w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">إعدادات الإدارة</h3>
              <button className="text-white/80 hover:text-white" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="flex gap-2 mb-6">
              <button onClick={() => setSettingsTab('place')} className={`px-4 py-2 rounded-lg transition-colors ${settingsTab==='place' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>اسم المكان</button>
              <button onClick={() => setSettingsTab('password')} className={`px-4 py-2 rounded-lg transition-colors ${settingsTab==='password' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>تغيير كلمة المرور</button>
              <button onClick={() => setSettingsTab('user')} className={`px-4 py-2 rounded-lg transition-colors ${settingsTab==='user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>إضافة مستخدم</button>
              <button onClick={() => setSettingsTab('theme')} className={`px-4 py-2 rounded-lg transition-colors ${settingsTab==='theme' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>ألوان القائمة</button>
            </div>

            {settingsTab === 'place' && (
              <div className="space-y-4">
                <label className="block text-white/90">اسم المكان</label>
                <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/60" placeholder="اكتب اسم المكان" />
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem('admin_place_name', placeName);
                        window.dispatchEvent(new StorageEvent('storage', { key: 'admin_place_name', newValue: placeName } as any));
                        setPlaceSaveMessage('تم حفظ اسم المكان بنجاح');
                      } catch {
                        setPlaceSaveMessage('تعذر الحفظ محليًا');
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >حفظ</button>
                </div>
                {placeSaveMessage && <p className="text-green-300 text-sm">{placeSaveMessage}</p>}
              </div>
            )}

            {settingsTab === 'password' && (
              <div className="space-y-4">
                <label className="block text-white/90">كلمة مرور جديدة</label>
                <input type="password" value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/60" placeholder="*****" />
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      setPasswordMessage('');
                      if (!currentUserId) {
                        setPasswordMessage('غير مسجل الدخول');
                        return;
                      }
                      if (!passwordValue || passwordValue.length < 6) {
                        setPasswordMessage('الحد الأدنى 6 أحرف');
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
                          setPasswordMessage('تم تحديث كلمة المرور');
                          setPasswordValue('');
                        } else {
                          setPasswordMessage(data?.error || 'فشل التحديث');
                        }
                      } catch (e) {
                        setPasswordMessage('حدث خطأ أثناء التحديث');
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >تحديث</button>
                </div>
                {passwordMessage && <p className="text-green-300 text-sm">{passwordMessage}</p>}
              </div>
            )}

            {settingsTab === 'user' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/90 mb-1">الدور</label>
                    <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                      <option value="kitchen">المطبخ</option>
                      <option value="barista">البارستا</option>
                      <option value="shisha">الشيشة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">اسم المستخدم</label>
                    <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="username" />
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">الاسم</label>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="الاسم" />
                  </div>
                  <div>
                    <label className="block text-white/90 mb-1">كلمة المرور</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" placeholder="*****" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      setCreateUserMessage('');
                      if (!newUsername || !newName || !newPassword) {
                        setCreateUserMessage('يرجى تعبئة جميع الحقول');
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
                          setCreateUserMessage('تم إنشاء المستخدم بنجاح');
                          setNewUsername('');
                          setNewName('');
                          setNewPassword('');
                        } else {
                          setCreateUserMessage(data?.error || 'فشل إنشاء المستخدم');
                        }
                      } catch (e) {
                        setCreateUserMessage('حدث خطأ أثناء الإنشاء');
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >إضافة</button>
                </div>
                {createUserMessage && <p className="text-green-300 text-sm">{createUserMessage}</p>}
              </div>
            )}

            {settingsTab === 'theme' && (
              <div className="space-y-6">
                <p className="text-white/80 text-sm">تحكم كامل بألوان صفحة القائمة. القيم الحالية تتبع الوضع الافتراضي إذا تركت الحقل فارغًا.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="الخلفية (background)"
                    value={localTheme.background || contextTheme?.background || '#F6EEDF'}
                    onChange={(val) => setLocalTheme({ ...localTheme, background: val })}
                  />
                  <ColorPicker
                    label="النص (foreground)"
                    value={localTheme.foreground || contextTheme?.foreground || '#4F3500'}
                    onChange={(val) => setLocalTheme({ ...localTheme, foreground: val })}
                  />
                  <ColorPicker
                    label="أساسي (primary)"
                    value={localTheme.primary || contextTheme?.primary || '#9C6B1E'}
                    onChange={(val) => setLocalTheme({ ...localTheme, primary: val })}
                  />
                  <ColorPicker
                    label="ثانوي (secondary)"
                    value={localTheme.secondary || contextTheme?.secondary || '#D3A34C'}
                    onChange={(val) => setLocalTheme({ ...localTheme, secondary: val })}
                  />
                  <ColorPicker
                    label="لهجة (accent)"
                    value={localTheme.accent || contextTheme?.accent || '#1EA55E'}
                    onChange={(val) => setLocalTheme({ ...localTheme, accent: val })}
                  />
                  <ColorPicker
                    label="البطاقة (card)"
                    value={localTheme.card || contextTheme?.card || '#4F3500'}
                    onChange={(val) => setLocalTheme({ ...localTheme, card: val })}
                  />
                  <ColorPicker
                    label="نص البطاقة (card-foreground)"
                    value={localTheme['card-foreground'] || contextTheme?.['card-foreground'] || '#FFFFFF'}
                    onChange={(val) => setLocalTheme({ ...localTheme, 'card-foreground': val })}
                  />
                  <ColorPicker
                    label="هادئ (muted)"
                    value={localTheme.muted || contextTheme?.muted || 'rgba(0,0,0,0.12)'}
                    onChange={(val) => setLocalTheme({ ...localTheme, muted: val })}
                  />
                  <ColorPicker
                    label="نص هادئ (muted-foreground)"
                    value={localTheme['muted-foreground'] || contextTheme?.['muted-foreground'] || 'rgba(18,15,6,0.7)'}
                    onChange={(val) => setLocalTheme({ ...localTheme, 'muted-foreground': val })}
                  />
                  <ColorPicker
                    label="الحلقة (ring)"
                    value={localTheme.ring || contextTheme?.ring || '#D3A34C'}
                    onChange={(val) => setLocalTheme({ ...localTheme, ring: val })}
                  />
                  <ColorPicker
                    label="بداية التمرير (scroll-thumb-start)"
                    value={localTheme['scroll-thumb-start'] || contextTheme?.['scroll-thumb-start'] || '#1EA55E'}
                    onChange={(val) => setLocalTheme({ ...localTheme, 'scroll-thumb-start': val })}
                  />
                  <ColorPicker
                    label="نهاية التمرير (scroll-thumb-end)"
                    value={localTheme['scroll-thumb-end'] || contextTheme?.['scroll-thumb-end'] || '#D3A34C'}
                    onChange={(val) => setLocalTheme({ ...localTheme, 'scroll-thumb-end': val })}
                  />
                  <ColorPicker
                    label="مسار التمرير (scroll-track)"
                    value={localTheme['scroll-track'] || contextTheme?.['scroll-track'] || 'rgba(0,0,0,0.25)'}
                    onChange={(val) => setLocalTheme({ ...localTheme, 'scroll-track': val })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={async () => {
                      setThemeMessage('');
                      // Filter out empty values from localTheme
                      const filteredTheme: Record<string, string> = {};
                      Object.entries(localTheme).forEach(([key, value]) => {
                        if (value && value.trim()) {
                          filteredTheme[key] = value.trim();
                        }
                      });

                      const success = await updateTheme(filteredTheme);
                      if (success) {
                        setThemeMessage('تم حفظ الألوان بنجاح ✓');
                        // Update local theme with saved values
                        setLocalTheme((prev) => ({ ...prev, ...filteredTheme }));
                      } else {
                        setThemeMessage('فشل حفظ الإعدادات');
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    disabled={themeLoading}
                  >
                    {themeLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>

                  <button
                    onClick={async () => {
                      setThemeMessage('');
                      const success = await resetThemeContext();
                      if (success) {
                        setLocalTheme({
                          background: '',
                          foreground: '',
                          primary: '',
                          secondary: '',
                          accent: '',
                          card: '',
                          'card-foreground': '',
                          muted: '',
                          'muted-foreground': '',
                          ring: '',
                          'scroll-thumb-start': '',
                          'scroll-thumb-end': '',
                          'scroll-track': '',
                        });
                        setThemeMessage('تمت استعادة الإعدادات الافتراضية ✓');
                      } else {
                        setThemeMessage('فشل الاستعادة');
                      }
                    }}
                    className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20"
                    disabled={themeLoading}
                  >
                    {themeLoading ? 'جاري الاستعادة...' : 'استعادة الافتراضي'}
                  </button>
                </div>

                {themeMessage && <p className="text-green-300 text-sm">{themeMessage}</p>}

                {/* Live preview */}
                <div className="mt-4">
                  <p className="text-white/80 text-sm mb-2">معاينة مباشرة:</p>
                  <div className="rounded-xl p-4 border border-white/10" style={{
                    background: localTheme.background || contextTheme?.background || undefined,
                    color: localTheme.foreground || contextTheme?.foreground || undefined,
                  }}>
                    <div className="rounded-lg p-4" style={{
                      background: localTheme.card || contextTheme?.card || undefined,
                      color: localTheme['card-foreground'] || contextTheme?.['card-foreground'] || undefined,
                    }}>
                      <p className="font-semibold">معاينة البطاقة</p>
                      <button className="mt-3 px-3 py-2 rounded-md text-white" style={{ background: localTheme.primary || contextTheme?.primary || undefined }}>زر أساسي</button>
                      <button className="mt-3 ml-2 px-3 py-2 rounded-md text-white" style={{ background: localTheme.secondary || contextTheme?.secondary || undefined }}>زر ثانوي</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}