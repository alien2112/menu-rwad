import { useState, useEffect } from 'react';
import { Category, MenuItem, ApiResponse } from '@shared/types';

// Fallback static categories in case API fails
const fallbackMenuItems: MenuItem[] = [
  {
    id: "offers",
    title: "العروض",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/24894209132cff55cd4cfb4dabe8b570960c19bc?width=68",
    iconAlt: "هدية",
    route: "/offers"
  },
  {
    id: "tea",
    title: "الشاي",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/f342ec3b49d01d7e9eb71093eec45dae50e1c06b?width=72",
    iconAlt: "فنجان شاي",
    route: "/tea"
  },
  {
    id: "cold-coffee",
    title: "قهوة بارده",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/32aef080205f82b8f4b103c0cd979308b95d2d19?width=68",
    iconAlt: "ثلج",
    route: "/cold-coffee"
  },
  {
    id: "hot-coffee",
    title: "قهوه ساخنة",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/6e4972442f216b34607ffaa20412dd755012a4d2?width=60",
    iconAlt: "نار",
    route: "/hot-coffee"
  },
  {
    id: "natural-juices",
    title: "العصائر الطبيعية",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/0061650c9228a74090b6905e5a3c5f396dea26b6?width=54",
    iconAlt: "عصير استوائي",
    route: "/natural-juices"
  },
  {
    id: "cocktails",
    title: "الكوكتيل و الموهيتو",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/c5fe8d5173faa0d9b636382c2f32a34375dae1d1?width=66",
    iconAlt: "مشروب كوكتيل",
    route: "/cocktails"
  },
  {
    id: "manakish",
    title: "المناقيش و الفطائر",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/621674a75978c3bcd6e88400c0dc63fefc51776d?width=52",
    iconAlt: "فطائر",
    route: "/manakish"
  },
  {
    id: "pizza",
    title: "البيتزا",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/b68ed657334a268ff8c023e2831ae25d0988520a?width=54",
    iconAlt: "شريحة بيتزا",
    route: "/pizza"
  },
  {
    id: "sandwiches",
    title: "السندوتش و البرجر",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/25389b4fee72a8c437f2dfee9b468b47da34a3cc?width=64",
    iconAlt: "ساندوتش",
    route: "/sandwiches"
  },
  {
    id: "desserts",
    title: "الحلا",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/f400aa2409f2a47ba2ba36ea8fe85c63e55cfd1c?width=52",
    iconAlt: "حلوى",
    route: "/desserts"
  },
  {
    id: "shisha",
    title: "الشيشة",
    iconSrc: "https://api.builder.io/api/v1/image/assets/TEMP/9b45510037581f790556bf8fdd013550346c228b?width=72",
    iconAlt: "دخان",
    route: "/shisha"
  }
];

export function useCategories() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(fallbackMenuItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null);
        const response = await fetch('/api/categories');
        const data: ApiResponse<Category[]> = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Transform categories to menu items format
          const transformedItems: MenuItem[] = data.data
            .filter((category: Category) => category.status === 'active')
            .sort((a: Category, b: Category) => a.order - b.order)
            .map((category: Category) => ({
              id: category._id,
              title: category.name,
              iconSrc: category.icon || '',
              iconAlt: category.nameEn || category.name,
              route: `/${category.nameEn?.toLowerCase().replace(/\s+/g, '-') || category._id}`,
              color: category.color
            }));
          
          setMenuItems(transformedItems);
        } else {
          console.warn('No categories found, using fallback data');
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError('Failed to load menu categories');
        // Keep fallback items
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { menuItems, loading, error };
}
