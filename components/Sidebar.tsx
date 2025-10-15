"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "فروعنا", href: "/contact#branches" },
  { label: "تواصل معنا", href: "/contact" },
  { label: "اكتب رأيك", href: "whatsapp" as const },
] as const;

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [logoUrl, setLogoUrl] = useState<string>("/موال مراكش طواجن  1 (1).png");
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data) setLogoUrl(json.data.logoUrl || logoUrl);
      } catch {}
    };
    if (isOpen) loadSettings();
  }, [isOpen]);
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-[402px] max-w-[95vw] sm:max-w-[402px] z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="relative h-full">
          {/* Background Image */}
          <img
            src="/side-menu-image.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Glass overlay */}
          <div className="absolute inset-0 m-4">
            <div className="glass-sidebar rounded-2xl h-full p-4 flex flex-col">

              {/* Menu Title */}
              <div className="text-center py-8">
                <h1 className="arabic-title text-4xl text-white text-shadow">
                  MENU
                </h1>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 flex flex-col justify-center space-y-8">
                {menuItems.map((item, index) => (
                  <div key={item.label}>
                    {item.href === 'whatsapp' ? (
                      <a
                        href={`https://wa.me/966567833138?text=${encodeURIComponent('مرحباً، أود إرسال رأيي حول التجربة.')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center text-white text-sm py-4 hover:text-accent transition-colors"
                        onClick={onClose}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="block text-center text-white text-sm py-4 hover:text-accent transition-colors"
                        onClick={onClose}
                      >
                        {item.label}
                      </Link>
                    )}
                    {index < menuItems.length - 1 && (
                      <div className="mx-auto w-32 h-px bg-coffee-secondary mt-4" />
                    )}
                  </div>
                ))}
              </nav>
              {/* Bottom Logo */}
              <div className="pt-6 pb-2 flex items-end justify-center">
                <img
                  src={logoUrl}
                  alt="موال مراكش طواجن"
                  className="w-32 h-24 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
