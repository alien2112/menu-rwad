"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp, Star, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SearchFilters {
  query: string;
  priceRange: [number, number];
  dietaryRestrictions: string[];
  preparationTime: string[];
  minRating: number;
  sortBy: 'name' | 'price' | 'preparationTime' | 'rating' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

export interface MenuItem {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  preparationTime?: number;
  calories?: number;
  tags?: string[];
  allergens?: string[];
  rating?: number;
  reviewCount?: number;
  categoryId: string;
  status: 'active' | 'inactive' | 'out_of_stock';
}

interface AdvancedSearchFilterProps {
  items: MenuItem[];
  onFilteredItems: (filteredItems: MenuItem[]) => void;
  categories: Array<{ _id: string; name: string }>;
}

const DIETARY_OPTIONS = [
  { id: 'vegan', label: 'نباتي', icon: '🌱' },
  { id: 'vegetarian', label: 'نباتي (يشمل الألبان)', icon: '🥬' },
  { id: 'gluten-free', label: 'خالي من الجلوتين', icon: '🌾' },
  { id: 'halal', label: 'حلال', icon: '☪️' },
  { id: 'dairy-free', label: 'خالي من الألبان', icon: '🥛' },
  { id: 'nut-free', label: 'خالي من المكسرات', icon: '🥜' },
  { id: 'low-calorie', label: 'قليل السعرات', icon: '🔥' },
  { id: 'keto', label: 'كيتو', icon: '🥑' },
];

const PREPARATION_TIME_OPTIONS = [
  { id: 'under-5', label: 'أقل من 5 دقائق', value: 5 },
  { id: 'under-10', label: 'أقل من 10 دقائق', value: 10 },
  { id: 'under-15', label: 'أقل من 15 دقيقة', value: 15 },
  { id: 'under-30', label: 'أقل من 30 دقيقة', value: 30 },
];

const SORT_OPTIONS = [
  { id: 'name', label: 'الاسم' },
  { id: 'price', label: 'السعر' },
  { id: 'preparationTime', label: 'وقت التحضير' },
  { id: 'rating', label: 'التقييم' },
  { id: 'popularity', label: 'الشعبية' },
];

export const AdvancedSearchFilter = ({ items, onFilteredItems, categories }: AdvancedSearchFilterProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    priceRange: [0, 1000],
    dietaryRestrictions: [],
    preparationTime: [],
    minRating: 0,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Calculate price range from items
  const priceBounds = useMemo(() => {
    if (items.length === 0) return [0, 1000];
    const prices = items.map(item => item.discountPrice || item.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [items]);

  // Update price range when items change
  useEffect(() => {
    setPriceRange(priceBounds);
    setFilters(prev => ({
      ...prev,
      priceRange: priceBounds,
    }));
  }, [priceBounds]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query) ||
                           (item.nameEn && item.nameEn.toLowerCase().includes(query));
        const matchesDescription = item.description && item.description.toLowerCase().includes(query);
        const matchesTags = item.tags && item.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      // Price range
      const itemPrice = item.discountPrice || item.price;
      if (itemPrice < filters.priceRange[0] || itemPrice > filters.priceRange[1]) {
        return false;
      }

      // Dietary restrictions
      if (filters.dietaryRestrictions.length > 0) {
        const itemTags = item.tags || [];
        const itemAllergens = item.allergens || [];
        const hasMatchingDietary = filters.dietaryRestrictions.some(restriction => 
          itemTags.includes(restriction) || 
          (restriction === 'halal' && !itemAllergens.includes('pork')) ||
          (restriction === 'vegan' && !itemAllergens.some(allergen => 
            ['meat', 'dairy', 'eggs', 'fish'].includes(allergen))) ||
          (restriction === 'vegetarian' && !itemAllergens.some(allergen => 
            ['meat', 'fish'].includes(allergen))) ||
          (restriction === 'gluten-free' && !itemAllergens.includes('gluten')) ||
          (restriction === 'dairy-free' && !itemAllergens.includes('dairy')) ||
          (restriction === 'nut-free' && !itemAllergens.includes('nuts')) ||
          (restriction === 'low-calorie' && (item.calories || 0) < 300) ||
          (restriction === 'keto' && itemTags.includes('keto'))
        );
        
        if (!hasMatchingDietary) {
          return false;
        }
      }

      // Preparation time
      if (filters.preparationTime.length > 0) {
        const itemPrepTime = item.preparationTime || 0;
        const hasMatchingTime = filters.preparationTime.some(timeFilter => {
          const timeValue = PREPARATION_TIME_OPTIONS.find(opt => opt.id === timeFilter)?.value || 0;
          return itemPrepTime <= timeValue;
        });
        
        if (!hasMatchingTime) {
          return false;
        }
      }

      // Rating
      if (filters.minRating > 0) {
        const itemRating = item.rating || 0;
        if (itemRating < filters.minRating) {
          return false;
        }
      }

      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.discountPrice || a.price;
          bValue = b.discountPrice || b.price;
          break;
        case 'preparationTime':
          aValue = a.preparationTime || 0;
          bValue = b.preparationTime || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'popularity':
          aValue = a.reviewCount || 0;
          bValue = b.reviewCount || 0;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [items, filters]);

  // Update filtered items when filters change
  useEffect(() => {
    onFilteredItems(filteredItems);
  }, [filteredItems, onFilteredItems]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      priceRange: priceBounds,
      dietaryRestrictions: [],
      preparationTime: [],
      minRating: 0,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters = filters.query || 
    filters.dietaryRestrictions.length > 0 || 
    filters.preparationTime.length > 0 || 
    filters.minRating > 0 ||
    filters.priceRange[0] !== priceBounds[0] || 
    filters.priceRange[1] !== priceBounds[1];

  return (
    <div className="px-4 mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/60 w-5 h-5" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            placeholder="ابحث في القائمة..."
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-12 py-3 text-foreground placeholder-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#C2914A] focus:border-transparent transition-all duration-300"
            dir="rtl"
          />
          {filters.query && (
            <button
              onClick={() => updateFilter('query', '')}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-foreground hover:bg-white/20 transition-all duration-300"
        >
          <Filter className="w-4 h-4" />
          <span>تصفية متقدم</span>
          {isFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-[#C2914A] rounded-full"></div>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-6"
          >
            {/* Price Range */}
            <div>
              <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                <DollarSign className="w-4 h-4" />
                نطاق السعر
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                    className="w-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-foreground text-sm"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                  />
                  <span className="text-foreground/70">إلى</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                    className="w-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-foreground text-sm"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                  />
                  <span className="text-foreground/70 text-sm">ريال</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={filters.priceRange[0]}
                    onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                    className="absolute top-0 w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                <span>🥗</span>
                القيود الغذائية
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      filters.dietaryRestrictions.includes(option.id)
                        ? 'bg-[#C2914A]/20 border border-[#C2914A]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.dietaryRestrictions.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('dietaryRestrictions', [...filters.dietaryRestrictions, option.id]);
                        } else {
                          updateFilter('dietaryRestrictions', filters.dietaryRestrictions.filter(r => r !== option.id));
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preparation Time */}
            <div>
              <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                <Clock className="w-4 h-4" />
                وقت التحضير
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PREPARATION_TIME_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      filters.preparationTime.includes(option.id)
                        ? 'bg-[#C2914A]/20 border border-[#C2914A]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.preparationTime.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('preparationTime', [...filters.preparationTime, option.id]);
                        } else {
                          updateFilter('preparationTime', filters.preparationTime.filter(t => t !== option.id));
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                <Star className="w-4 h-4" />
                الحد الأدنى للتقييم
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => updateFilter('minRating', rating)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      filters.minRating >= rating
                        ? 'bg-[#C2914A]/20 border border-[#C2914A]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${filters.minRating >= rating ? 'text-[#C2914A] fill-current' : 'text-foreground/40'}`} />
                  </button>
                ))}
                {filters.minRating > 0 && (
                  <button
                    onClick={() => updateFilter('minRating', 0)}
                    className="text-sm text-foreground/70 hover:text-foreground"
                  >
                    إزالة
                  </button>
                )}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="flex items-center gap-2 text-foreground font-medium mb-3">
                ترتيب حسب
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-foreground text-sm"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex justify-center">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all duration-200"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="text-center text-foreground/70 text-sm">
        عرض {filteredItems.length} من {items.length} عنصر
      </div>
    </div>
  );
};







