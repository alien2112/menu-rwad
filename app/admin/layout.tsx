'use client';

import { useState } from 'react';
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
  Image,
  Monitor,
  MapPin,
} from 'lucide-react';

const navigation = [
  { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
  { name: 'الصفحة الرئيسية', href: '/admin/homepage', icon: Image },
  { name: 'خلفيات الصفحات', href: '/admin/page-backgrounds', icon: Monitor },
  { name: 'المواقع', href: '/admin/locations', icon: MapPin },
  { name: 'الفئات', href: '/admin/categories', icon: FolderOpen },
  { name: 'المنتجات', href: '/admin/items', icon: Package },
  { name: 'المكونات', href: '/admin/ingredients', icon: Leaf },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4F3500] via-[#3E2901] to-[#2A1B00]">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 glass-effect rounded-xl text-white"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-40 h-screen transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full glass-sidebar border-l border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <h1 className="text-2xl font-bold text-white font-arabic">
                  لوحة التحكم
                </h1>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
            {!collapsed && (
              <p className="text-sm text-white/70 mt-2">إدارة قائمة المطعم</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
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
          <div className="p-4 border-t border-white/10">
            {!collapsed && (
              <div className="glass-effect rounded-xl p-4">
                <p className="text-sm text-white/90 font-semibold">مركش</p>
                <p className="text-xs text-white/60 mt-1">
                  نظام إدارة المطاعم
                </p>
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
        <div className="p-4 lg:p-8">{children}</div>
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
