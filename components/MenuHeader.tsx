"use client";

import { ArrowRight } from "lucide-react";

export const MenuHeader = () => {
  return (
    <header className="relative mx-auto w-full max-w-md mb-8">
      <div className="relative rounded-[34px] px-16 py-5 text-center backdrop-blur-xl bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary))]/90 to-[hsl(var(--primary))]/80 border border-border shadow-2xl">
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-2xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all px-3 py-2"
        >
          <span className="text-lg">🏠</span>
        </button>
        
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-2xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-all p-2"
        >
          <ArrowRight className="w-6 h-6 text-foreground opacity-90" />
        </button>
        
        <h1 className="text-xl font-bold text-foreground tracking-wide">القائمة</h1>
      </div>
    </header>
  );
};





