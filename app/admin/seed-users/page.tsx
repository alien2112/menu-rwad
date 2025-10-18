"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageWrapper } from "@/components/AdminPageWrapper";
import { Shield, ChefHat, Coffee, Wind } from "lucide-react";

export default function SeedUsersPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <AdminPageWrapper>
        <div className="p-6 space-y-6">
          <div>
            <div className="h-8 w-80 rounded animate-pulse" />
            <div className="h-4 w-96 rounded mt-2 animate-pulse" />
          </div>

          <div className="admin-card rounded-2xl p-6">
            <div className="h-6 w-48 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 rounded animate-pulse" />
                    <div className="h-4 w-24 rounded animate-pulse" />
                    <div className="h-4 w-28 rounded animate-pulse" />
                    <div className="h-4 w-36 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card rounded-2xl p-6">
            <div className="h-6 w-40 rounded animate-pulse mb-4" />
            <div className="h-12 w-full rounded-lg animate-pulse" />
          </div>

          <div className="admin-card rounded-2xl p-6">
            <div className="h-6 w-48 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-full rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </AdminPageWrapper>
    );
  }

  const seedUsers = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/auth/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Default users created successfully!");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to create users");
    } finally {
      setLoading(false);
    }
  };

  const users = [
    { username: 'admin', password: 'admin2024', role: 'admin', name: 'مدير النظام', icon: Shield, color: 'bg-red-500' },
    { username: 'kitchen', password: 'kitchen2024', role: 'kitchen', name: 'طاهي المطبخ', icon: ChefHat, color: 'bg-orange-500' },
    { username: 'barista', password: 'barista2024', role: 'barista', name: 'بارستا', icon: Coffee, color: 'bg-amber-500' },
    { username: 'shisha', password: 'shisha2024', role: 'shisha', name: 'مشغل الشيشة', icon: Wind, color: 'bg-green-500' }
  ];

  return (
    <AdminPageWrapper>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">إعداد المستخدمين الافتراضيين</h1>
          <p className="text-white/70">إنشاء حسابات المستخدمين الافتراضية للنظام</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>المستخدمون الافتراضيون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.map((user) => {
              const IconComponent = user.icon;
              return (
                <div key={user.username} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className={`p-3 rounded-lg ${user.color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">الدور: {user.role}</p>
                    <p className="text-sm text-gray-600">المستخدم: {user.username}</p>
                    <p className="text-sm text-gray-600">كلمة المرور: {user.password}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إنشاء المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={seedUsers} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "جاري الإنشاء..." : "إنشاء المستخدمين الافتراضيين"}
            </Button>
            
            {message && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تعليمات الاستخدام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">1. اضغط على "إنشاء المستخدمين الافتراضيين" لإنشاء الحسابات</p>
            <p className="text-sm">2. استخدم بيانات الدخول المعروضة أعلاه لتسجيل الدخول</p>
            <p className="text-sm">3. كل دور سيرى فقط الصفحات المخصصة له</p>
            <p className="text-sm">4. المدير (admin) يرى جميع الصفحات</p>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
}

