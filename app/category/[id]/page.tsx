"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuDetailTemplate } from "@/components/MenuDetailTemplate";

interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  image?: string;
  icon?: string;
  color: string;
  order: number;
  status: 'active' | 'inactive';
}

interface MenuItem {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  categoryId: string;
  status: 'active' | 'inactive';
  ingredients?: { ingredientId: string; portion: number; required: boolean }[];
}

interface Ingredient {
  _id: string;
  name: string;
  color?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredientsMap, setIngredientsMap] = useState<Record<string, Ingredient>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // Fetch category details
        const categoryResponse = await fetch('/api/categories');
        const categoryData = await categoryResponse.json();
        
        if (categoryData.success && categoryData.data) {
          const foundCategory = categoryData.data.find((cat: Category) => 
            cat._id === categoryId || 
            cat.nameEn?.toLowerCase().replace(/\s+/g, '-') === categoryId
          );
          
          if (foundCategory) {
            setCategory(foundCategory);
          }
        }

        // Fetch menu items for this category
        const itemsResponse = await fetch('/api/items');
        const itemsData = await itemsResponse.json();
        
        if (itemsData.success && itemsData.data) {
          const categoryItems = itemsData.data.filter((item: MenuItem) => 
            item.categoryId === categoryId && item.status === 'active'
          );
          console.log('Category items with ingredients:', categoryItems);
          setMenuItems(categoryItems);
        }

        // Fetch ingredients list and index by id for colors
        const ingResponse = await fetch('/api/ingredients');
        const ingData = await ingResponse.json();
        if (ingData.success && ingData.data) {
          const map: Record<string, Ingredient> = {};
          for (const ing of ingData.data as Ingredient[]) {
            map[ing._id] = ing;
          }
          setIngredientsMap(map);
        }
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  // Create mapping from category names to page routes (same as static pages)
  const getPageRoute = (category: Category | null): string => {
    if (!category) return '';
    
    // For dynamic categories, use the actual dynamic route
    return `/category/${category._id}`;
  };

  // Transform menu items to the format expected by MenuDetailTemplate
  const transformedItems = menuItems.map((item, index) => {
    // Build tags from item ingredients
    const tags: { label: string; color?: string }[] = [];
    console.log('Processing item:', item.name, 'ingredients:', item.ingredients);
    console.log('Ingredients map:', ingredientsMap);
    
    if (item.ingredients && Object.keys(ingredientsMap).length > 0) {
      for (const ing of item.ingredients.slice(0, 3)) {
        console.log('Looking for ingredient:', ing.ingredientId);
        const meta = ingredientsMap[ing.ingredientId];
        if (meta) {
          console.log('Found ingredient meta:', meta);
          tags.push({ label: meta.name, color: meta.color });
        }
      }
    }

    console.log('Final tags for', item.name, ':', tags);

    return {
      id: index + 1, // MenuDetailTemplate expects numeric IDs
      title: item.name,
      price: `${item.price} ر.س`,
      image: item.image,
      tags: tags
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-800 to-red-900">
        <div className="text-white text-xl">Category not found</div>
      </div>
    );
  }

  return (
    <MenuDetailTemplate
      title={category.name}
      items={transformedItems}
      pageRoute={getPageRoute(category)}
    />
  );
}