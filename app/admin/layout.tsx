'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  Leaf,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Monitor,
  ChefHat,
  Coffee,
  Wind,
  Warehouse,
  Bell,
  BarChart3,
  Archive,
  Calculator,
  Printer,
  Users,
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'kitchen' | 'barista' | 'shisha';
  name: string;
}

const allNavigation = [
  { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard, roles: ['admin', 'kitchen', 'barista', 'shisha'] },
  { name: 'الطلبات', href: '/admin/orders', icon: Package, roles: ['admin'] },
  { name: 'المطبخ', href: '/admin/kitchen', icon: ChefHat, roles: ['admin', 'kitchen'] },
  { name: 'البارستا', href: '/admin/barista', icon: Coffee, roles: ['admin', 'barista'] },
  { name: 'الشيشة', href: '/admin/shisha', icon: Wind, roles: ['admin', 'shisha'] },
  { name: 'إدارة الموظفين', href: '/admin/staff-management', icon: Users, roles: ['admin'] },
  { name: 'إدارة المخزون', href: '/admin/storage', icon: Warehouse, roles: ['admin'] },
  { name: 'الإشعارات', href: '/admin/notifications', icon: Bell, roles: ['admin', 'kitchen', 'barista', 'shisha'] },
  { name: 'الأرشيف', href: '/admin/archiving', icon: Archive, roles: ['admin'] },
  { name: 'الفئات', href: '/admin/categories', icon: FolderOpen, roles: ['admin'] },
  { name: 'المنتجات', href: '/admin/items', icon: Package, roles: ['admin'] },
  { name: 'المكونات', href: '/admin/ingredients', icon: Leaf, roles: ['admin'] },
  { name: 'التحليلات', href: '/admin/analytics', icon: BarChart3, roles: ['admin'] },
  { name: 'الضرائب والامتثال', href: '/admin/tax-compliance', icon: Calculator, roles: ['admin'] },
  { name: 'إدارة الطابعات', href: '/admin/printers', icon: Printer, roles: ['admin'] },
  { name: 'وسائط الصفحة', href: '/admin/page-hero', icon: Monitor, roles: ['admin'] },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [placeName, setPlaceName] = useState<string>('مركش');
  const [placeTagline, setPlaceTagline] = useState<string>('نظام إدارة المطاعم');
  const pathname = usePathname();

  useEffect(() => {
    // Get user from localStorage
    const authData = localStorage.getItem("user_auth");
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    // Load place settings
    try {
      const savedName = localStorage.getItem('admin_place_name');
      const savedTag = localStorage.getItem('admin_place_tagline');
      if (savedName) setPlaceName(savedName);
      if (savedTag) setPlaceTagline(savedTag);
    } catch {}
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'admin_place_name' && e.newValue !== null) setPlaceName(e.newValue);
      if (e.key === 'admin_place_tagline' && e.newValue !== null) setPlaceTagline(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Close sidebar on route change (mobile) and lock body scroll when open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [sidebarOpen]);

  useEffect(() => {
    // Close mobile sidebar when navigating
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Close on Escape
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Filter navigation based on user role; if no user yet, show all to avoid empty sidebar
  const navigation = user 
    ? allNavigation.filter(item => item.roles.includes(user.role))
    : allNavigation;

  return (
    <div className="admin-theme min-h-screen bg-gradient-to-br from-[#4F3500] via-[#3E2901] to-[#2A1B00]">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 glass-effect rounded-xl text-white"
        aria-label={sidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-40 h-screen transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 max-w-[90vw] sm:max-w-none`}
      >
        <div className="h-full glass-sidebar border-l border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <h1 className="text-2xl font-bold text-white font-arabic">
                  لوحة التحكم
                </h1>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                aria-label={collapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
              >
                {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
            {!collapsed && (
              <p className="text-sm text-white/90 mt-2">إدارة قائمة المطعم</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-coffee-green text-white shadow-lg'
                      : 'text-white/80 hover:bg-white/10'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <item.icon size={20} />
                  {!collapsed && (
                    <span className="font-semibold">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            {!collapsed && (
              <div className="glass-effect rounded-xl p-4">
                <p className="text-sm text-white/90 font-semibold">{placeName || 'مركش'}</p>
                <p className="text-xs text-white/60 mt-1">{placeTagline || 'نظام إدارة المطاعم'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`transition-all duration-300 ${
          collapsed ? 'lg:mr-20' : 'lg:mr-72'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
