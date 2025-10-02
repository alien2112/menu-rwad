"use client";

import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import React from "react";

interface IngredientTag {
  label: string;
  color?: string;
}

interface MenuItemCardProps {
  image: string;
  nameAr: string;
  nameEn: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: string;
  status: "active" | "out" | "inactive";
  isFeatured?: boolean;
  ingredientTags?: IngredientTag[];
}

export const MenuItemCard = ({
  image,
  nameAr,
  nameEn,
  description,
  price,
  oldPrice,
  category,
  status,
  isFeatured,
  ingredientTags,
}: MenuItemCardProps) => {
  const { dispatch } = useCart();
  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: `${nameAr}-${nameEn}`,
        name: nameAr,
        nameEn,
        price,
        image,
        category,
      }
    });
  };

  const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.borderRadius = '9999px';
    ripple.style.background = 'rgba(255,255,255,0.35)';
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0.8';
    ripple.style.transition = 'transform 500ms ease-out, opacity 600ms ease-out';
    ripple.className = 'ripple-effect';

    button.appendChild(ripple);
    // Force reflow to start transition
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ripple.offsetHeight;
    ripple.style.transform = 'scale(3)';
    ripple.style.opacity = '0';

    window.setTimeout(() => {
      ripple.remove();
    }, 650);

    handleAddToCart();
  };
  const statusConfig = {
    active: {
      label: "نشط",
      className: "bg-[hsl(var(--status-active-bg))] text-[hsl(var(--status-active))]",
    },
    out: {
      label: "نفذ",
      className: "bg-[hsl(var(--status-inactive-bg))] text-[hsl(var(--status-inactive))]",
    },
    inactive: {
      label: "غير نشط",
      className: "bg-muted text-muted-foreground",
    },
  } as const;

  return (
    <article className="group overflow-hidden rounded-2xl bg-card border border-card-border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-card/80 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden bg-muted/30">
        <img
          src={image}
          alt={nameAr}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {isFeatured && (
          <div className="absolute top-3 left-3 rounded-xl bg-accent px-3 py-1.5 text-sm font-bold text-accent-foreground shadow-lg">
            مميز
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-1 text-xl font-bold text-foreground leading-tight">{nameAr}</h3>
            <p className="text-sm text-muted-foreground">{nameEn}</p>
          </div>
          {oldPrice && (
            <span className="rounded-xl bg-accent/20 text-accent px-3 py-1 text-xs font-bold">خصم</span>
          )}
        </div>

        <p className="mb-4 text-sm leading-relaxed text-foreground/85 line-clamp-2">{description}</p>

        {/* Ingredient Tags */}
        {ingredientTags && ingredientTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {ingredientTags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30"
                style={{
                  color: tag.color || 'hsl(var(--accent))',
                  borderColor: tag.color || 'hsl(var(--accent))',
                  backgroundColor: tag.color ? `${tag.color}20` : 'hsl(var(--accent) / 0.2)',
                }}
                title={tag.label}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        <div className="mb-3 flex items-center gap-3">
          <span className="text-2xl font-extrabold text-accent">{price} ريال سعودي</span>
          {oldPrice && <span className="text-base text-muted-foreground line-through">{oldPrice} ريال سعودي</span>}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{category}</span>
            <span className={cn("rounded-full px-3 py-1 font-semibold", statusConfig[status].className)}>
              {statusConfig[status].label}
            </span>
          </div>
          {status !== 'inactive' && (
            <button
              type="button"
              onClick={handleButtonClick}
              aria-label="أضف للسلة"
              className="group relative overflow-hidden px-3 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.35)] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(16,185,129,0.55)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <span className="relative z-10">أضف للسلة</span>
              {/* Shine effect */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute -left-8 top-0 h-full w-8 bg-white/30 transform rotate-12 translate-x-0 group-hover:translate-x-[160%] transition-transform duration-700" />
              </div>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};


