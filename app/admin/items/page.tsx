'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { IMenuItem, IMenuItemIngredient } from '@/lib/models/MenuItem';
import { ICategory } from '@/lib/models/Category';
import { IIngredient } from '@/lib/models/Ingredient';
import Image from 'next/image';
import { clearMenuDataCache } from '@/lib/cacheInvalidation';
import { useAlert, useConfirmation } from '@/components/ui/alerts';

interface Modifier {
  _id: string;
  name: string;
  nameEn?: string;
  type: 'single' | 'multiple';
  required: boolean;
  status: 'active' | 'inactive';
}

export default function ItemsPage() {
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'ingredients' | 'modifiers' | 'more' | 'settings'>('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
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

  const { showSuccess, showError } = useAlert();
  const { confirm, ConfirmationComponent } = useConfirmation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes, ingredientsRes, modifiersRes] = await Promise.all([
        fetch('/api/items?admin=true', { headers: { 'Cache-Control': 'no-store' } }),
        fetch('/api/categories'),
        fetch('/api/ingredients'),
        fetch('/api/modifiers'),
      ]);

      const [itemsData, categoriesData, ingredientsData, modifiersData] = await Promise.all([
        itemsRes.json(),
        categoriesRes.json(),
        ingredientsRes.json(),
        modifiersRes.json(),
      ]);

      if (itemsData.success) setItems(itemsData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
      if (ingredientsData.success) setIngredients(ingredientsData.data);
      if (modifiersData.success) setModifiers(modifiersData.data);
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
      // sanitize payload: remove empty ingredients and coerce numbers
      const sanitized: Partial<IMenuItem> = {
        ...formData,
        price: Number(formData.price) || 0,
        discountPrice: formData.discountPrice !== undefined && formData.discountPrice !== null
          ? Number(formData.discountPrice)
          : undefined,
        calories: formData.calories !== undefined && formData.calories !== null
          ? Number(formData.calories)
          : undefined,
        preparationTime: formData.preparationTime !== undefined && formData.preparationTime !== null
          ? Number(formData.preparationTime)
          : undefined,
        order: formData.order !== undefined && formData.order !== null
          ? Number(formData.order)
          : undefined,
        ingredients: (formData.ingredients || [])
          .filter((ing) => ing && ing.ingredientId)
          .map((ing) => ({
            ingredientId: ing.ingredientId,
            portion: Number(ing.portion) || 1,
            required: Boolean(ing.required),
          })),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized),
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
        handleCloseModal();
        setErrorMessage('');
        // Clear public menu cache so changes appear immediately
        clearMenuDataCache();
      } else {
        const msg = data.error || 'حدث خطأ غير متوقع، حاول مرة أخرى';
        setErrorMessage(msg);
        console.error('API error:', msg);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      setErrorMessage('تعذر حفظ المنتج. تحقق من البيانات وأعد المحاولة');
    }
  };

  const handleDelete = async (id: string) => {
    confirm(
      {
        title: 'حذف المنتج',
        message: 'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.',
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        type: 'danger',
      },
      async () => {
        try {
          const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            fetchData();
            // Clear public menu cache so deletion appears immediately
            clearMenuDataCache();
            showSuccess('تم حذف المنتج بنجاح');
          } else {
            showError(data.error || 'فشل حذف المنتج');
          }
        } catch (error) {
          console.error('Error deleting item:', error);
          showError('حدث خطأ أثناء حذف المنتج');
        }
      }
    );
  };

  const handleEdit = (item: IMenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setErrorMessage('');
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

  // Create category lookup map for O(1) access instead of O(n) find operations
  const categoryMap = useMemo(() => {
    return categories.reduce((map, cat) => {
      map[cat._id!] = cat;
      return map;
    }, {} as Record<string, ICategory>);
  }, [categories]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="admin-card rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="h-7 w-48 rounded animate-pulse" />
              <div className="h-4 w-64 rounded mt-2 animate-pulse" />
            </div>
            <div className="h-11 w-44 rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="admin-card rounded-2xl p-4 space-y-4">
          <div className="h-11 rounded-xl animate-pulse" />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-24 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="admin-card rounded-2xl overflow-hidden">
              <div className="h-48 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-2/3 rounded animate-pulse" />
                <div className="h-4 w-1/2 rounded animate-pulse" />
                <div className="h-4 w-full rounded animate-pulse" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-32 rounded animate-pulse" />
                  <div className="h-5 w-16 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة المنتجات</h1>
            <p>إضافة وتعديل وحذف منتجات القائمة</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="admin-button"
          >
            <Plus size={20} />
            إضافة منتج جديد
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card rounded-2xl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2" size={20} />
          <input
            type="text"
            placeholder="البحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input w-full pr-12 pl-4 py-3"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`admin-button ${!selectedCategory ? 'active' : ''}`}>
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id!)}
              className={`admin-button ${selectedCategory === cat._id ? 'active' : ''}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const category = categoryMap[item.categoryId];
          return (
            <div
              key={item._id}
              className="admin-card rounded-2xl overflow-hidden"
            >
              {item.image && (
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {/* Featured badge removed as per admin request */}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                    {item.nameEn && (
                      <p className="text-sm">{item.nameEn}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="admin-button"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id!)}
                      className="admin-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    <span className="text-2xl font-bold">
                      {item.discountPrice || item.price} ريال سعودي
                    </span>
                    {item.discountPrice && (
                      <span className="text-lg line-through">
                        {item.price} ريال سعودي
                      </span>
                    )}
                  </div>
                  {item.calories && item.calories > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">{item.calories}</span> سعرة حرارية
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>{category?.name}</span>
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
        <div className="admin-card rounded-2xl p-12 text-center">
          <p>لا توجد منتجات</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="admin-card rounded-2xl p-6 w-full max-w-4xl my-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 left-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6 pr-10">
              {editingItem ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-500/20 text-red-200 border border-red-400/30">
                  {errorMessage}
                </div>
              )}
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'basic', label: 'الأساسي' },
                  { key: 'images', label: 'الصور' },
                  { key: 'ingredients', label: 'المكونات' },
                  { key: 'modifiers', label: 'المعدلات' },
                  { key: 'more', label: 'معلومات إضافية' },
                  { key: 'settings', label: 'الإعدادات' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`admin-button ${activeTab === tab.key ? 'active' : ''}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Basic Info */}
              {activeTab === 'basic' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      اسم المنتج (عربي) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      اسم المنتج (English)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="admin-input w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      الوصف (عربي)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="admin-input w-full min-h-24"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      الوصف (English)
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      className="admin-input w-full min-h-24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      الفئة *
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="admin-input w-full"
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
                    <label className="text-sm font-semibold mb-2 block">
                      السعر *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      سعر الخصم
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: parseFloat(e.target.value) })}
                      className="admin-input w-full"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Images */}
              {activeTab === 'images' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الصور</h3>
                <ImageUpload
                  label="الصورة الرئيسية"
                  value={formData.image}
                  onChange={(image) => setFormData({ ...formData, image })}
                />
              </div>
              )}

              {/* Color customization removed to restore previous styling */}

              {/* Ingredients */}
              {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">المكونات</h3>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="admin-button"
                  >
                    <Plus size={16} />
                    إضافة مكون
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.ingredients?.map((ing, index) => (
                    <div key={index} className="admin-card rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <select
                            value={ing.ingredientId}
                            onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                            className="admin-input w-full"
                          >
                            <option value="">اختر المكون</option>
                            {ingredients.map((ingredient) => (
                              <option key={ingredient._id} value={ingredient._id}>
                                {ingredient.name} ({ingredient.unit})
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
                            placeholder={`الكمية${ing.ingredientId ? ` (${ingredients.find(i => i._id === ing.ingredientId)?.unit || ''})` : ''}`}
                            className="admin-input w-full"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
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
                            className="admin-button mr-auto"
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

              {/* Modifiers */}
              {activeTab === 'modifiers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">المعدلات والإضافات</h3>
                  <a
                    href="/admin/modifiers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-button"
                  >
                    <Plus size={16} />
                    إدارة المعدلات
                  </a>
                </div>

                <p className="text-sm">
                  اختر المعدلات التي ترغب في إضافتها لهذا المنتج (مثل الحجم، الإضافات، الخيارات)
                </p>

                {modifiers.length === 0 ? (
                  <div className="admin-card rounded-xl p-8 text-center">
                    <p>لا توجد معدلات متاحة</p>
                    <p className="text-sm mt-2">
                      قم بإنشاء معدلات أولاً من صفحة إدارة المعدلات
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modifiers.map((modifier) => {
                      const isSelected = formData.modifiers?.includes(modifier._id) || false;

                      return (
                        <button
                          key={modifier._id}
                          type="button"
                          onClick={() => {
                            const current = formData.modifiers || [];
                            const updated = isSelected
                              ? current.filter(id => id !== modifier._id)
                              : [...current, modifier._id];
                            setFormData({ ...formData, modifiers: updated });
                          }}
                          className={`admin-card rounded-xl p-4 text-right transition-all ${
                            isSelected
                              ? 'border-2 border-highlight'
                              : 'border'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">
                                {modifier.name}
                                {modifier.required && (
                                  <span className="text-red-400 mr-1">*</span>
                                )}
                              </h4>
                              {modifier.nameEn && (
                                <p className="text-xs mb-2">{modifier.nameEn}</p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  modifier.type === 'single'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-purple-500/20 text-purple-300'
                                }`}>
                                  {modifier.type === 'single' ? 'اختيار واحد' : 'اختيار متعدد'}
                                </span>
                                {modifier.status === 'active' && (
                                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300">
                                    نشط
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-highlight bg-highlight'
                                : 'border'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {formData.modifiers && formData.modifiers.length > 0 && (
                  <div className="admin-card rounded-xl p-4">
                    <p className="text-sm">
                      تم اختيار {formData.modifiers.length} معدل/معدلات
                    </p>
                  </div>
                )}
              </div>
              )}

              {/* Additional Info */}
              {activeTab === 'more' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">معلومات إضافية</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      وقت التحضير (دقيقة)
                    </label>
                    <input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      السعرات الحرارية
                    </label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      حجم الحصة
                    </label>
                    <input
                      type="text"
                      value={formData.servingSize}
                      onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                      className="admin-input w-full"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Settings */}
              {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الإعدادات</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      الحالة
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="admin-input w-full"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                      <option value="out_of_stock">نفذ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="admin-input w-full"
                    />
                  </div>

                  {/* Featured toggle removed as per admin request */}
                </div>
              </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="admin-button flex-1"
                >
                  {editingItem ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="admin-button flex-1"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {ConfirmationComponent}
    </div>
  );
}
