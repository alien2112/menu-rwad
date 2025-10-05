"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

type HeroMedia = {
  mediaType: 'image' | 'video';
  mediaId?: string;
  mediaUrl?: string;
  title?: string;
};

export const RestaurantMenuHeader = ({ hero }: { hero?: HeroMedia }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <header className="relative w-full mb-6">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Main header with brand logo and optional hero background */}
      <div className="relative px-4 py-4">
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-6 left-6 z-20"
          aria-label="فتح القائمة"
        >
          <div className="w-5 h-5 flex flex-col justify-between">
            <div className="w-full h-0 border-t border-white"></div>
            <div className="w-full h-0 border-t border-white"></div>
            <div className="w-full h-0 border-t border-white"></div>
          </div>
        </button>

        <div className="relative w-full">
          <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-2xl overflow-hidden">
            {hero && (
              <>
                {hero.mediaType === 'video' ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={hero.mediaId ? `/api/images/${hero.mediaId}` : hero.mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src={hero.mediaId ? `/api/images/${hero.mediaId}` : hero.mediaUrl}
                    alt={hero.title || 'hero'}
                  />
                )}
                <div className="absolute inset-0 bg-black/20" />
              </>
            )}

            <div className="relative z-10 h-full flex items-center justify-center">
              {/* Brand Logo - Same as home page */}
              <div className="text-center">
                <img
                  src="/موال مراكش طواجن  1 (1).png"
                  alt="موال مراكش طواجن"
                  loading="eager"
                  fetchPriority="high"
                  className="mx-auto mb-2 w-48 h-32 md:w-56 md:h-36 object-contain drop-shadow-lg"
                />
                <h1 className="text-white text-lg font-bold tracking-wide">موال مراكش</h1>
                <p className="text-white/80 text-sm">FOOD & DRINKS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
