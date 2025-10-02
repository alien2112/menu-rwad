"use client";

import { cn } from "@/lib/utils";

interface CategoryTileProps {
  title: string;
  icon: string; // primary image src (category photo)
  fallbackSrc?: string; // optional fallback image if primary fails
  color: string;
  href: string;
}

export const CategoryTile = ({ title, icon, fallbackSrc, color, href }: CategoryTileProps) => {
  return (
    <a
      href={href}
      className={cn(
        "group rounded-2xl overflow-hidden transition-all duration-300",
        "bg-card border border-card-border hover:border-border/30",
        "hover:-translate-y-1 hover:shadow-xl"
      )}
      style={{
        borderColor: `${color}40`,
        boxShadow: `0 8px 24px ${color}20`,
      }}
    >
      <div className="relative h-32 md:h-36 lg:h-40 w-full">
        <img
          src={icon}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            const attempted = img.getAttribute('data-fallback-attempted') === 'true';
            if (!attempted && fallbackSrc) {
              img.setAttribute('data-fallback-attempted', 'true');
              img.src = fallbackSrc;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white text-base md:text-lg font-bold leading-tight drop-shadow-md">{title}</h3>
        </div>
      </div>
    </a>
  );
};





