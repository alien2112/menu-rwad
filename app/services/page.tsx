"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function Services() {
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

          <h1 className="text-white text-center text-3xl mb-8 section-title">Our Services</h1>

          <div className="space-y-4">
            {[
              { title: "قهوة متخصصة", desc: "نقدم أفضل أنواع القهوة من جميع أنحاء العالم" },
              { title: "مأكولات شهية", desc: "قائمة متنوعة من المأكولات الطازجة" },
              { title: "أجواء مريحة", desc: "مكان مثالي للاسترخاء والعمل" },
              { title: "خدمة سريعة", desc: "نهتم براحتك ووقتك" }
            ].map((service, index) => (
              <div key={index} className="glass-notification rounded-3xl p-6">
                <h3 className="text-white text-lg font-bold mb-2">{service.title}</h3>
                <p className="text-white/80 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
