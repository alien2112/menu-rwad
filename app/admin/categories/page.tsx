'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { AlertDialog } from '@/components/AlertDialog';
import { ICategory } from '@/lib/models/Category';
import { clearMenuDataCache } from '@/lib/cacheInvalidation';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<ICategory>>({
    name: '',
    nameEn: '',
    description: '',
    image: '',
    order: 0,
    status: 'active',
    department: 'kitchen',
  });
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/categories?admin=true&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
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
      };

      console.log('FormData before submit:', formData);
      console.log('Submitting category data:', submitData);

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
        // Clear public menu cache so changes appear immediately
        clearMenuDataCache();
      } else {
        console.error('API Error:', data.error);
        showAlert('خطأ', data.error);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showAlert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
        // Clear public menu cache so deletion appears immediately
        clearMenuDataCache();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setFormData({
      ...category,
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
      order: 0,
      status: 'active',
      department: 'kitchen',
    });
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="h-7 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-64 bg-white/10 rounded mt-2 animate-pulse" />
            </div>
            <div className="h-11 w-44 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-4">
          <div className="h-11 bg-white/10 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-effect rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-9 w-9 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-9 w-9 bg-white/10 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-2/3 bg-white/10 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse mb-4" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10">
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

            {/* Department Badge */}
            <div className="mt-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  category.department === 'kitchen'
                    ? 'bg-orange-500/20 text-orange-300'
                    : category.department === 'barista'
                    ? 'bg-blue-500/20 text-blue-300'
                    : category.department === 'shisha'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}
              >
                {category.department === 'kitchen' && '🍳 مطبخ'}
                {category.department === 'barista' && '☕ مشروبات'}
                {category.department === 'shisha' && '💨 شيشة'}
                {!category.department && '❓ غير محدد'}
              </span>
            </div>
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

              <ImageUpload
                label="صورة الفئة"
                value={formData.image}
                onChange={(image) => setFormData({ ...formData, image })}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    القسم *
                  </label>
                  <select
                    value={formData.department || 'kitchen'}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as 'kitchen' | 'barista' | 'shisha' })}
                    className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                  >
                    <option value="kitchen">🍳 مطبخ (Kitchen)</option>
                    <option value="barista">☕ مشروبات (Barista)</option>
                    <option value="shisha">💨 شيشة (Shisha)</option>
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
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
      />
    </div>
  );
}
