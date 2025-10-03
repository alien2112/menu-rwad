"use client";

import { cn } from "@/lib/utils";
import { OptimizedImage } from "./OptimizedImage";

interface CategoryTileProps {
  title: string;
  icon: string; // primary image src (category photo)
  fallbackSrc?: string; // optional fallback image if primary fails
  color: string;
  href: string;
}

export const CategoryTile = ({ title, icon, fallbackSrc, color, href }: CategoryTileProps) => {
  // Handle empty or invalid icon
  const imageSrc = icon && icon.trim() !== '' ? icon : (fallbackSrc || null);
  const hasValidImage = imageSrc !== null;

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
        {hasValidImage ? (
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105">
            <OptimizedImage
              src={imageSrc}
              alt={title}
              width="100%"
              height="100%"
              objectFit="cover"
              placeholderColor={`${color}20`}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${color}40` }}
            >
              <span className="text-2xl text-white font-bold">
                {title.charAt(0)}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-white text-base md:text-lg font-bold leading-tight drop-shadow-md">{title}</h3>
        </div>
      </div>
    </a>
  );
};





