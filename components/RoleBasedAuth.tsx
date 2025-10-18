"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ChefHat, Coffee, Wind, Shield, LayoutDashboard, FolderOpen, Package, Leaf, Menu, X, ChevronLeft, ChevronRight, Monitor, Warehouse, Bell, BarChart3, Archive, Calculator, Printer, TrendingDown } from "lucide-react";

interface RoleBasedAuthProps {
  children: React.ReactNode;
  embedded?: boolean; // when true, render children without internal sidebar/header layout
}

interface User {
  id: string;
  username: string;
  role: 'admin' | 'kitchen' | 'barista' | 'shisha';
  name: string;
}

const roleConfig = {
  admin: {
    name: 'مدير النظام',
    icon: Shield,
    color: 'bg-red-500',
    description: 'الوصول الكامل لجميع الميزات'
  },
  kitchen: {
    name: 'المطبخ',
    icon: ChefHat,
    color: 'bg-orange-500',
    description: 'إدارة طلبات المطبخ'
  },
  barista: {
    name: 'البارستا',
    icon: Coffee,
    color: 'bg-amber-500',
    description: 'إدارة طلبات المشروبات'
  },
  shisha: {
    name: 'الشيشة',
    icon: Wind,
    color: 'bg-green-500',
    description: 'إدارة طلبات الشيشة'
  }
};

const allNavigation = [
  { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard, roles: ['admin', 'kitchen', 'barista', 'shisha'] },
  { name: 'الطلبات', href: '/admin/orders', icon: Package, roles: ['admin'] },
  { name: 'المطبخ', href: '/admin/kitchen', icon: ChefHat, roles: ['admin', 'kitchen'] },
  { name: 'البارستا', href: '/admin/barista', icon: Coffee, roles: ['admin', 'barista'] },
  { name: 'الشيشة', href: '/admin/shisha', icon: Wind, roles: ['admin', 'shisha'] },
  { name: 'إدارة المخزون', href: '/admin/storage', icon: Warehouse, roles: ['admin'] },
  { name: 'استهلاك المخزون', href: '/admin/inventory-consumption', icon: TrendingDown, roles: ['admin'] },
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

export function RoleBasedAuth({ children, embedded = false }: RoleBasedAuthProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Define role-based route access
  const getRouteAccess = (path: string) => {
    if (path.includes('/admin/kitchen')) return ['admin', 'kitchen'];
    if (path.includes('/admin/barista')) return ['admin', 'barista'];
    if (path.includes('/admin/shisha')) return ['admin', 'shisha'];
    if (path.includes('/admin/orders')) return ['admin'];
    if (path.includes('/admin/analytics')) return ['admin'];
    if (path.includes('/admin/items')) return ['admin'];
    if (path.includes('/admin/categories')) return ['admin'];
    if (path.includes('/admin/ingredients')) return ['admin'];
    if (path.includes('/admin/storage')) return ['admin'];
    if (path.includes('/admin/inventory-consumption')) return ['admin'];
    if (path.includes('/admin/archiving')) return ['admin'];
    if (path.includes('/admin/tax-compliance')) return ['admin'];
    if (path.includes('/admin/printers')) return ['admin'];
    if (path.includes('/admin/page-hero')) return ['admin'];
    // Default admin routes
    if (path.includes('/admin')) return ['admin', 'kitchen', 'barista', 'shisha'];
    return ['admin', 'kitchen', 'barista', 'shisha']; // Default access
  };

  useEffect(() => {
    // Check if user is already authenticated
    const authData = localStorage.getItem("user_auth");
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Check route access
        const allowedRoles = getRouteAccess(pathname);
        if (!allowedRoles.includes(userData.role)) {
          // Redirect to appropriate dashboard based on role
          const roleRoutes = {
            admin: '/admin',
            kitchen: '/admin/kitchen',
            barista: '/admin/barista',
            shisha: '/admin/shisha'
          };
          router.push(roleRoutes[userData.role] || '/admin');
        }
      } catch (error) {
        localStorage.removeItem("user_auth");
      }
    }
    setIsLoading(false);
  }, [pathname, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = data.data.user;
        setUser(userData);
        setIsAuthenticated(true);

        // Store token in localStorage as backup (cookies are primary)
        if (data.data.accessToken) {
          localStorage.setItem("auth_token", data.data.accessToken);
        }
        localStorage.setItem("user_auth", JSON.stringify(userData));

        setUsername("");
        setPassword("");

        // Redirect to appropriate dashboard based on role
        const roleRoutes = {
          admin: '/admin',
          kitchen: '/admin/kitchen',
          barista: '/admin/barista',
          shisha: '/admin/shisha'
        };
        router.push(roleRoutes[userData.role] || '/admin');
      } else {
        setError(data.error || "فشل في تسجيل الدخول");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("خطأ في الاتصال بالخادم");
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local state and storage regardless of API result
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("user_auth");
      localStorage.removeItem("auth_token");
      router.push("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-coffee-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4F3500] via-[#3E2901] to-[#2A1B00] flex items-center justify-center p-6">
        <div className="glass-notification rounded-3xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-white text-2xl font-bold mb-2">تسجيل الدخول</h1>
            <p className="text-white/70 text-sm">اختر دورك وأدخل بيانات الدخول</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-secondary transition-colors"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/60 focus:outline-none focus:border-secondary transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/60 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="text-red-300 text-sm text-center bg-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-3 px-6 rounded-xl transition-colors"
            >
              دخول
            </button>
          </form>

          {/* Role Information */}
          <div className="mt-8 space-y-3">
            <h3 className="text-white text-sm font-semibold text-center">بيانات الدخول الافتراضية:</h3>
            {Object.entries(roleConfig).map(([role, config]) => {
              const IconComponent = config.icon;
              const passwords = {
                admin: 'Admin@2024',
                kitchen: 'Kitchen@2024',
                barista: 'Barista@2024',
                shisha: 'Shisha@2024'
              };
              return (
                <div key={role} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{config.name}</p>
                    <p className="text-white/60 text-xs">{config.description}</p>
                    <p className="text-white/40 text-xs">المستخدم: {role} | كلمة المرور: {passwords[role as keyof typeof passwords]}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/")}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  // In embedded mode, simply gate access and render children without internal chrome
  if (embedded) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  // Filter navigation based on user role
  const navigation = user 
    ? allNavigation.filter(item => item.roles.includes(user.role))
    : [];

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
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>
            
            {/* User Info */}
            {user && !collapsed && (
              <div className="mt-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${roleConfig[user.role].color}`}>
                  {(() => {
                    const IconComponent = roleConfig[user.role].icon;
                    return <IconComponent className="w-5 h-5 text-white" />;
                  })()}
                </div>
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-white/70 text-sm">{roleConfig[user.role].name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <IconComponent size={20} />
                      {!collapsed && <span className="font-arabic">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <Lock size={20} />
              {!collapsed && <span className="font-arabic">تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        collapsed ? 'mr-20' : 'mr-72'
      }`}>
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <div className={`p-2 rounded-lg ${roleConfig[user.role].color}`}>
                    {(() => {
                      const IconComponent = roleConfig[user.role].icon;
                      return <IconComponent className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h1 className="text-white text-xl font-bold">{roleConfig[user.role].name}</h1>
                    <p className="text-white/70 text-sm">{user.name}</p>
                    {/* Show current page context */}
                    <p className="text-white/50 text-xs">
                      {pathname.includes('/kitchen') && 'لوحة المطبخ'}
                      {pathname.includes('/barista') && 'لوحة البارستا'}
                      {pathname.includes('/shisha') && 'لوحة الشيشة'}
                      {pathname === '/admin' && 'لوحة التحكم الرئيسية'}
                      {pathname.includes('/orders') && 'إدارة الطلبات'}
                      {pathname.includes('/analytics') && 'التحليلات'}
                      {pathname.includes('/categories') && 'إدارة الفئات'}
                      {pathname.includes('/items') && 'إدارة المنتجات'}
                      {pathname.includes('/ingredients') && 'إدارة المكونات'}
                      {pathname.includes('/storage') && 'إدارة المخزون'}
                      {pathname.includes('/inventory-consumption') && 'استهلاك المخزون'}
                      {pathname.includes('/archiving') && 'الأرشيف'}
                      {pathname.includes('/tax-compliance') && 'الضرائب والامتثال'}
                      {pathname.includes('/printers') && 'إدارة الطابعات'}
                      {pathname.includes('/page-hero') && 'وسائط الصفحة'}
                      {pathname.includes('/notifications') && 'الإشعارات'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Role indicator badge */}
              {user && (
                <div className="bg-white/10 px-3 py-1 rounded-full text-white/80 text-sm">
                  {roleConfig[user.role].name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

