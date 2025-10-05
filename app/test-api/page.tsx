"use client";

import { useEffect, useState } from "react";

export default function TestAPI() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Test categories API
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        console.log('Categories API Response:', categoriesData);
        setCategories(categoriesData.data || []);

        // Test items API
        const itemsResponse = await fetch('/api/items');
        const itemsData = await itemsResponse.json();
        console.log('Items API Response:', itemsData);
        setItems(itemsData.data || []);

      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Results</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Categories ({categories.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {categories.map((category) => (
              <div key={category._id} className="p-3 border rounded">
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-gray-600">ID: {category._id}</p>
                <p className="text-sm text-gray-600">Status: {category.status}</p>
                <p className="text-sm text-gray-600">Order: {category.order}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Menu Items ({items.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.slice(0, 10).map((item) => (
              <div key={item._id} className="p-3 border rounded">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Price: {item.price} ريال</p>
                <p className="text-sm text-gray-600">Category ID: {item.categoryId}</p>
                <p className="text-sm text-gray-600">Status: {item.status}</p>
              </div>
            ))}
            {items.length > 10 && (
              <p className="text-sm text-gray-500">... and {items.length - 10} more items</p>
            )}
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <p>Categories with status 'active': {categories.filter(c => c.status === 'active').length}</p>
        <p>Items with status 'active': {items.filter(i => i.status === 'active').length}</p>
        <p>Unique category IDs in items: {[...new Set(items.map(i => i.categoryId))].length}</p>
      </div>
    </div>
  );
}






