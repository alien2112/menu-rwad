'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RoleBasedAuth } from '@/components/RoleBasedAuth';
import { AlertProvider } from '@/components/ui/alerts';
import { motion, AnimatePresence } from 'framer-motion';
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
  Building2,
} from 'lucide-react';
import './admin.css';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'kitchen' | 'barista' | 'shisha';
  name: string;
}

const allNavigation = [
  { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard, roles: ['admin', 'kitchen', 'barista', 'shisha'] },
  { name: 'الطلبات', href: '/admin/orders', icon: Package, roles: ['admin'] },
  { name: 'إدارة الفروع', href: '/admin/branches', icon: Building2, roles: ['admin'] },
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
  { name: 'قالب القائمة', href: '/admin/menu-template', icon: Monitor, roles: ['admin'] },
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
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, []);

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
    } else {
      // Redirect unauthenticated users to login
      router.push('/login');
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
    <AlertProvider position="top-right" maxAlerts={5}>
      <RoleBasedAuth embedded>
        <div className="admin-theme min-h-screen">
      {/* Mobile menu button with animation */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-xl text-white admin-button"
        aria-label={sidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
        aria-expanded={sidebarOpen}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={sidebarOpen ? 'close' : 'menu'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Sidebar */}
      <aside
        className={`admin-sidebar fixed top-0 right-0 z-40 h-screen transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 max-w-[90vw] sm:max-w-none`}
      >
        <div className="h-full flex flex-col">
          {/* Header with smooth animations */}
          <div className="p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="text-2xl font-bold text-white font-arabic"
                  >
                    لوحة التحكم
                  </motion.h1>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                aria-label={collapsed ? 'توسيع الشريط الجانبي' : 'طي الشريط الجانبي'}
              >
                <motion.div
                  animate={{ rotate: collapsed ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </motion.div>
              </motion.button>
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                  className="text-sm text-white/90 mt-2"
                >
                  إدارة قائمة المطعم
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation with staggered animations */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.03,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'active'
                        : ''
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <item.icon size={20} />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="font-semibold whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            {!collapsed && (
              <div className="admin-card rounded-xl p-4">
                <p className="text-sm font-semibold">{placeName || 'مركش'}</p>
                <p className="text-xs mt-1">{placeTagline || 'نظام إدارة المطاعم'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content with smooth page transitions */}
      <main
        className={`admin-main-content transition-all duration-300 ${
          collapsed ? 'lg:mr-20' : 'lg:mr-72'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="p-4 sm:p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Overlay for mobile with fade animation */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
        </div>
      </RoleBasedAuth>
    </AlertProvider>
  );
}
