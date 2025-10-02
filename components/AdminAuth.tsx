"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

interface AdminAuthProps {
  children: React.ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Admin password - in production, this should be stored securely
  const ADMIN_PASSWORD = "mwal2024admin";

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");
    } else {
      alert("كلمة المرور غير صحيحة");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
    router.push("/");
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
      <div className="min-h-screen bg-coffee-primary flex items-center justify-center p-6">
        <div className="glass-notification rounded-3xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-white text-2xl font-bold mb-2">لوحة الإدارة</h1>
            <p className="text-white/70 text-sm">أدخل كلمة المرور للوصول إلى لوحة الإدارة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/60 focus:outline-none focus:border-coffee-gold transition-colors"
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

            <button
              type="submit"
              className="w-full bg-coffee-gold hover:bg-coffee-gold/90 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              دخول
            </button>
          </form>

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

  return (
    <div className="min-h-screen bg-coffee-primary">
      {/* Admin Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">لوحة إدارة مقهى موال مراكش</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Admin Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}





