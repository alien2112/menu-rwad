'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import ColorPicker from '@/components/admin/ColorPicker';
import ImageUpload from '@/components/admin/ImageUpload';
import { ICategory } from '@/lib/models/Category';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'colors'>('basic');
  const [formData, setFormData] = useState<Partial<ICategory>>({
    name: '',
    nameEn: '',
    description: '',
    image: '',
    color: '#4F3500',
    order: 0,
    featured: false,
    featuredOrder: 0,
    status: 'active',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      // Prepare data with proper types
      const submitData = {
        ...formData,
        featured: !!formData.featured,
        featuredOrder: formData.featured ? (formData.featuredOrder || 1) : 0,
      };

      console.log('FormData before submit:', formData);
      console.log('Submitting category data:', submitData);
      console.log('Featured:', submitData.featured, 'FeaturedOrder:', submitData.featuredOrder);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      console.log('API Response:', data);

      if (data.success) {
        fetchCategories();
        handleCloseModal();
      } else {
        console.error('API Error:', data.error);
        alert(`خطأ: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setFormData({
      ...category,
      featured: category.featured ?? false,
      featuredOrder: category.featuredOrder ?? 0,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      image: '',
      color: '#4F3500',
      order: 0,
      featured: false,
      featuredOrder: 0,
      status: 'active',
    });
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-white mb-2">إدارة الفئات</h1>
            <p className="text-white/70">إضافة وتعديل وحذف فئات القائمة</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            إضافة فئة جديدة
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-effect rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
          <input
            type="text"
            placeholder="البحث عن فئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-coffee-green focus:outline-none"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category._id}
            className="glass-effect rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                {category.status === 'active' ? (
                  <Eye className="text-white" size={24} />
                ) : (
                  <EyeOff className="text-white/50" size={24} />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category._id!)}
                  className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
            {category.nameEn && (
              <p className="text-white/60 text-sm mb-2">{category.nameEn}</p>
            )}
            {category.description && (
              <p className="text-white/70 text-sm mb-4 line-clamp-2">
                {category.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">الترتيب: {category.order}</span>
              <span
                className={`px-3 py-1 rounded-full ${
                  category.status === 'active'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}
              >
                {category.status === 'active' ? 'نشط' : 'غير نشط'}
              </span>
            </div>

            {category.featured && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 text-sm font-medium flex items-center gap-1">
                    ⭐ مميزة في الرئيسية
                  </span>
                  <span className="text-white/50 text-xs">
                    ترتيب: {category.featuredOrder || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="glass-effect rounded-2xl p-12 text-center">
          <p className="text-white/50">لا توجد فئات</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="glass-sidebar rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 mb-2">
                {['basic','colors'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key as 'basic' | 'colors')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold ${activeTab === key ? 'bg-coffee-green text-white' : 'glass-effect text-white/80 hover:bg-white/10'}`}
                  >
                    {key === 'basic' ? 'الأساسي' : 'الألوان'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    اسم الفئة (عربي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    placeholder="مثال: مشروبات ساخنة"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    اسم الفئة (English)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    placeholder="e.g., Hot Drinks"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-white mb-2 block">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none min-h-24"
                  placeholder="وصف مختصر للفئة..."
                />
              </div>

              <ColorPicker
                label="اللون"
                value={formData.color || '#4F3500'}
                onChange={(color) => setFormData({ ...formData, color })}
              />

              <ImageUpload
                label="صورة الفئة"
                value={formData.image}
                onChange={(image) => setFormData({ ...formData, image })}
              />

              {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>
              )}

              {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">عرض في الرئيسية (مميزة)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!formData.featured}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData({
                          ...formData,
                          featured: isChecked,
                          featuredOrder: isChecked ? (formData.featuredOrder || 1) : 0
                        });
                      }}
                      className="w-5 h-5 accent-coffee-green"
                    />
                    <span className="text-white/80 text-sm">إظهار ضمن "إكتشف قائمة مشروباتنا"</span>
                  </div>
                </div>

                {formData.featured && (
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">ترتيب الظهور في الرئيسية</label>
                    <select
                      value={formData.featuredOrder || 1}
                      onChange={(e) => setFormData({ ...formData, featuredOrder: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    >
                      {Array.from({ length: 8 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              )}

              {activeTab === 'colors' && (
                <div>
                  <ColorPicker
                    label="لون الفئة في صفحة القائمة"
                    value={formData.color || '#4F3500'}
                    onChange={(color) => setFormData({ ...formData, color })}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors"
                >
                  {editingCategory ? 'تحديث' : 'إضافة'}
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
