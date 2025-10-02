"use client";

import { cn } from "@/lib/utils";

interface CategoryTileProps {
  title: string;
  icon: string;
  color: string;
  href: string;
}

export const CategoryTile = ({ title, icon, color, href }: CategoryTileProps) => {
  return (
    <a
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-2xl p-5 backdrop-blur-md transition-all duration-300",
        "bg-card border border-card-border hover:border-border/30",
        "hover:-translate-y-1 hover:shadow-xl"
      )}
      style={{
        borderColor: `${color}40`,
        boxShadow: `0 8px 24px ${color}20`,
      }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}29` }}
      >
        <img src={icon} alt={title} className="h-8 w-8 object-contain" />
      </div>
      <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
    </a>
  );
};





