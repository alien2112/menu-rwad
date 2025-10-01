"use client";

import { cn } from "@/lib/utils";

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

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{category}</span>
          <span className={cn("rounded-full px-3 py-1 font-semibold", statusConfig[status].className)}>
            {statusConfig[status].label}
          </span>
        </div>
      </div>
    </article>
  );
};


