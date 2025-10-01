"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function Contact() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-coffee-primary relative overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10 mobile-container bg-coffee-primary coffee-shadow min-h-screen">
        <div className="px-6 py-8">
          {/* Hamburger Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-8 left-6 z-20"
          >
            <div className="w-4 h-4 flex flex-col justify-between">
              <div className="w-full h-0 border-t border-white"></div>
              <div className="w-full h-0 border-t border-white"></div>
              <div className="w-full h-0 border-t border-white"></div>
            </div>
          </button>

          <h1 className="text-white text-center text-3xl mb-8 section-title">Connect With Us</h1>

          <div className="space-y-6">
            <div className="glass-notification rounded-3xl p-6">
              <h3 className="text-white text-lg font-bold mb-4">أوقات العمل</h3>
              <p className="text-white text-sm mb-2">مفتوح 24 ساعة</p>
              <p className="text-white text-sm">جميع ايام الاسبوع</p>
            </div>

            <div className="glass-notification rounded-3xl p-6">
              <h3 className="text-white text-lg font-bold mb-4">الموقع</h3>
              <p className="text-white text-sm">المدينة المنورة - حي النبلاء</p>
            </div>

            <div className="glass-notification rounded-3xl p-6">
              <h3 className="text-white text-lg font-bold mb-4">تواصل معنا</h3>
              <p className="text-white text-sm">966567833138+</p>
            </div>

            <div className="flex justify-center space-x-4 mt-8">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/9847c593bb964595b310f34f1252e74193f86dea?width=42" alt="Social" className="w-8 h-8" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/35eaab4fef42eda826b4de533ea775b9ad0b81a9?width=42" alt="Social" className="w-8 h-8" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/43925dc1b52691edf4fa6ca8dd91ee42ede94a59?width=42" alt="Social" className="w-8 h-8" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/d077d93db1664d870170713a6cc1ab80f1c71ac6?width=40" alt="Social" className="w-8 h-8" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/631a75b08fec0a65d55bb799e45eab6d7995350d?width=42" alt="Social" className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
