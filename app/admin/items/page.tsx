'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, X } from 'lucide-react';
import ColorPicker from '@/components/admin/ColorPicker';
import ImageUpload from '@/components/admin/ImageUpload';
import { IMenuItem, IMenuItemIngredient } from '@/lib/models/MenuItem';
import { ICategory } from '@/lib/models/Category';
import { IIngredient } from '@/lib/models/Ingredient';
import Image from 'next/image';

export default function ItemsPage() {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'colors' | 'ingredients' | 'more' | 'settings'>('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState<Partial<IMenuItem>>({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    categoryId: '',
    price: 0,
    discountPrice: 0,
    image: '',
    images: [],
    color: '#4F3500',
    ingredients: [],
    preparationTime: 0,
    calories: 0,
    servingSize: '',
    tags: [],
    allergens: [],
    status: 'active',
    featured: false,
    order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes, ingredientsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/categories'),
        fetch('/api/ingredients'),
      ]);

      const [itemsData, categoriesData, ingredientsData] = await Promise.all([
        itemsRes.json(),
        categoriesRes.json(),
        ingredientsRes.json(),
      ]);

      if (itemsData.success) setItems(itemsData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
      if (ingredientsData.success) setIngredients(ingredientsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/items/${editingItem._id}` : '/api/items';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (item: IMenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      categoryId: '',
      price: 0,
      discountPrice: 0,
      image: '',
      images: [],
      color: '#4F3500',
      ingredients: [],
      preparationTime: 0,
      calories: 0,
      servingSize: '',
      tags: [],
      allergens: [],
      status: 'active',
      featured: false,
      order: 0,
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...(formData.ingredients || []),
        { ingredientId: '', portion: 1, required: true },
      ],
    });
  };

  const updateIngredient = (index: number, field: keyof IMenuItemIngredient, value: any) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients?.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">إدارة المنتجات</h1>
            <p className="text-white/70">إضافة وتعديل وحذف منتجات القائمة</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            إضافة منتج جديد
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-2xl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
          <input
            type="text"
            placeholder="البحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-coffee-green focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-coffee-green text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id!)}
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat._id
                  ? 'bg-coffee-green text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const category = categories.find((c) => c._id === item.categoryId);
          return (
            <div
              key={item._id}
              className="glass-effect rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-200"
            >
              {item.image && (
                <div className="relative h-48 bg-black/20">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {item.featured && (
                    <div className="absolute top-2 right-2 px-3 py-1 bg-coffee-green rounded-lg text-white text-xs font-semibold">
                      مميز
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                    {item.nameEn && (
                      <p className="text-white/60 text-sm">{item.nameEn}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id!)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    <span className="text-2xl font-bold text-coffee-green">
                      {item.discountPrice || item.price} ريال سعودي
                    </span>
                    {item.discountPrice && (
                      <span className="text-lg text-white/50 line-through">
                        {item.price} ريال سعودي
                      </span>
                    )}
                  </div>
                  {item.calories && item.calories > 0 && (
                    <div className="text-sm text-white/60">
                      <span className="text-coffee-gold font-medium">{item.calories}</span> سعرة حرارية
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">{category?.name}</span>
                  <span
                    className={`px-3 py-1 rounded-full ${
                      item.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : item.status === 'out_of_stock'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {item.status === 'active'
                      ? 'نشط'
                      : item.status === 'out_of_stock'
                      ? 'نفذ'
                      : 'غير نشط'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="glass-effect rounded-2xl p-12 text-center">
          <p className="text-white/50">لا توجد منتجات</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="glass-sidebar rounded-2xl p-6 w-full max-w-4xl my-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingItem ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'basic', label: 'الأساسي' },
                  { key: 'images', label: 'الصور' },
                  { key: 'colors', label: 'الألوان' },
                  { key: 'ingredients', label: 'المكونات' },
                  { key: 'more', label: 'معلومات إضافية' },
                  { key: 'settings', label: 'الإعدادات' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold ${activeTab === tab.key ? 'bg-coffee-green text-white' : 'glass-effect text-white/80 hover:bg-white/10'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Basic Info */}
              {activeTab === 'basic' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">المعلومات الأساسية</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      اسم المنتج (عربي) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      اسم المنتج (English)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الوصف (عربي)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none min-h-24"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الوصف (English)
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none min-h-24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الفئة *
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      السعر *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      سعر الخصم
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Images */}
              {activeTab === 'images' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">الصور</h3>
                <ImageUpload
                  label="الصورة الرئيسية"
                  value={formData.image}
                  onChange={(image) => setFormData({ ...formData, image })}
                />
              </div>
              )}

              {/* Color */}
              {activeTab === 'colors' && (
                <ColorPicker
                  label="لون بطاقة المنتج في صفحة القائمة"
                  value={formData.color || '#4F3500'}
                  onChange={(color) => setFormData({ ...formData, color })}
                />
              )}

              {/* Ingredients */}
              {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">المكونات</h3>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="px-4 py-2 glass-green-button rounded-lg text-white text-sm font-semibold hover:bg-coffee-green transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    إضافة مكون
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.ingredients?.map((ing, index) => (
                    <div key={index} className="glass-effect rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <select
                            value={ing.ingredientId}
                            onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm border border-white/20 focus:border-coffee-green focus:outline-none"
                          >
                            <option value="">اختر المكون</option>
                            {ingredients.map((ingredient) => (
                              <option key={ingredient._id} value={ingredient._id}>
                                {ingredient.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <input
                            type="number"
                            step="0.1"
                            value={ing.portion}
                            onChange={(e) => updateIngredient(index, 'portion', parseFloat(e.target.value))}
                            placeholder="الكمية"
                            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm border border-white/20 focus:border-coffee-green focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-white text-sm">
                            <input
                              type="checkbox"
                              checked={ing.required}
                              onChange={(e) => updateIngredient(index, 'required', e.target.checked)}
                              className="rounded"
                            />
                            إجباري
                          </label>
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="mr-auto p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Additional Info */}
              {activeTab === 'more' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">معلومات إضافية</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      وقت التحضير (دقيقة)
                    </label>
                    <input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      السعرات الحرارية
                    </label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      حجم الحصة
                    </label>
                    <input
                      type="text"
                      value={formData.servingSize}
                      onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Settings */}
              {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">الإعدادات</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الحالة
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                      <option value="out_of_stock">نفذ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-3 text-white">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <span className="font-semibold">منتج مميز</span>
                    </label>
                  </div>
                </div>
              </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="flex-1 glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors"
                >
                  {editingItem ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 glass-effect px-6 py-3 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
