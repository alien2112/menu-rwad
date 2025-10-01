import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "HOME", href: "/" },
  { label: "ABOUT US", href: "/about" },
  { label: "OUR SERVICES", href: "/services" },
  { label: "OFFERS", href: "/offers" },
  { label: "CONNECT US", href: "/contact" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
            src="https://api.builder.io/api/v1/image/assets/TEMP/18efebf2654bf78de1c8e799668a2dec5d118a94?width=804"
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
                    <a 
                      href={item.href}
                      className="block text-center text-white text-xs uppercase tracking-wider py-4 hover:text-coffee-green transition-colors"
                      onClick={onClose}
                    >
                      {item.label}
                    </a>
                    {index < menuItems.length - 1 && (
                      <div className="mx-auto w-32 h-px bg-coffee-secondary mt-4" />
                    )}
                  </div>
                ))}
              </nav>
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
