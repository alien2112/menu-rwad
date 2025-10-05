"use client";

import { useRouter } from "next/navigation";

export const RestaurantMenuHeader = () => {
  const router = useRouter();
  
  return (
    <header className="relative w-full mb-6">
      {/* Main header with brand logo */}
      <div className="relative px-4 py-4">
        <div className="flex items-center justify-center">
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
    </header>
  );
};
