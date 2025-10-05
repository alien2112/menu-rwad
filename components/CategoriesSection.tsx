"use client";

import { OptimizedImage } from "./OptimizedImage";

interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  image?: string;
  icon?: string;
  color: string;
}

interface CategoriesSectionProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
  selectedCategory?: string | null;
  offersCount?: number;
}

export const CategoriesSection = ({ categories, onCategoryClick, selectedCategory, offersCount = 0 }: CategoriesSectionProps) => {
  return (
    <div className="px-4 mb-6">
      <h2 className="text-white text-lg font-bold mb-4 text-center">التصنيفات</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* All Categories Option */}
        <div
          onClick={() => onCategoryClick('all')}
          className="flex-shrink-0 cursor-pointer group"
        >
          <div className={`w-20 h-20 rounded-full overflow-hidden backdrop-blur-sm border transition-all duration-300 category-circle ${
            selectedCategory === null || selectedCategory === 'all'
              ? 'bg-white/20 border-white/60' 
              : 'bg-white/10 border-white/20 group-hover:border-white/40'
          }`}>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500/40 to-blue-500/40">
              <span className="text-white text-lg font-bold">الكل</span>
            </div>
          </div>
          <p className="text-white text-xs text-center mt-2 font-medium">
            الكل
          </p>
        </div>

        {/* Offers Category - Special Category */}
        {offersCount > 0 && (
          <div
            onClick={() => onCategoryClick('offers')}
            className="flex-shrink-0 cursor-pointer group"
          >
            <div className={`w-20 h-20 rounded-full overflow-hidden backdrop-blur-sm border transition-all duration-300 category-circle ${
              selectedCategory === 'offers'
                ? 'bg-white/20 border-white/60' 
                : 'bg-white/10 border-white/20 group-hover:border-white/40'
            }`}>
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/40 to-orange-500/40 relative">
                <span className="text-white text-lg font-bold">🎁</span>
                {/* Badge showing count */}
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {offersCount}
                </div>
              </div>
            </div>
            <p className="text-white text-xs text-center mt-2 font-medium">
              العروض
            </p>
          </div>
        )}

        {/* Category Items */}
        {categories.map((category) => (
          <div
            key={category._id}
            onClick={() => onCategoryClick(category._id)}
            className="flex-shrink-0 cursor-pointer group"
          >
            <div className={`w-20 h-20 rounded-full overflow-hidden backdrop-blur-sm border transition-all duration-300 category-circle ${
              selectedCategory === category._id 
                ? 'bg-white/20 border-white/60' 
                : 'bg-white/10 border-white/20 group-hover:border-white/40'
            }`}>
              {category.image || category.icon ? (
                <OptimizedImage
                  src={category.image || category.icon || ''}
                  alt={category.name}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  placeholderColor={`${category.color}20`}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}40` }}
                >
                  <span className="text-white text-lg font-bold">
                    {category.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-white text-xs text-center mt-2 font-medium">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
