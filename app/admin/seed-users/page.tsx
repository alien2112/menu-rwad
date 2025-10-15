"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageWrapper } from "@/components/AdminPageWrapper";
import { Shield, ChefHat, Coffee, Wind } from "lucide-react";

export default function SeedUsersPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

