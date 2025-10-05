'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import ColorPicker from '@/components/admin/ColorPicker';
import ImageUpload from '@/components/admin/ImageUpload';
import { IIngredient } from '@/lib/models/Ingredient';
import Image from 'next/image';

const UNITS = ['g', 'ml', 'piece', 'cup', 'tbsp', 'tsp', 'kg', 'L'];

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<IIngredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<IIngredient>>({
    name: '',
    nameEn: '',
    description: '',
    image: '',
    unit: 'g',
    defaultPortion: 1,
    minPortion: 0,
    maxPortion: 10,
    pricePerUnit: 0,
    color: '#00BF89',
    allergens: [],
    status: 'active',
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const res = await fetch('/api/ingredients');
      const data = await res.json();
      if (data.success) {
        setIngredients(data.data);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingIngredient
        ? `/api/ingredients/${editingIngredient._id}`
        : '/api/ingredients';
      const method = editingIngredient ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        fetchIngredients();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving ingredient:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المكون؟')) return;

    try {
      const res = await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchIngredients();
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  };

  const handleEdit = (ingredient: IIngredient) => {
    setEditingIngredient(ingredient);
    setFormData(ingredient);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIngredient(null);
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      image: '',
      unit: 'g',
      defaultPortion: 1,
      minPortion: 0,
      maxPortion: 10,
      pricePerUnit: 0,
      color: '#00BF89',
      allergens: [],
      status: 'active',
    });
  };

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-white mb-2">إدارة المكونات</h1>
            <p className="text-white/70">إضافة وتعديل وحذف مكونات المنتجات</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            إضافة مكون جديد
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-effect rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
          <input
            type="text"
            placeholder="البحث عن مكون..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-coffee-green focus:outline-none"
          />
        </div>
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIngredients.map((ingredient) => (
          <div
            key={ingredient._id}
            className="glass-effect rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: ingredient.color }}
              >
                {ingredient.image ? (
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image src={ingredient.image} alt={ingredient.name} fill className="object-cover" />
                  </div>
                ) : (
                  '🥗'
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(ingredient)}
                  className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ingredient._id!)}
                  className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{ingredient.name}</h3>
            {ingredient.nameEn && (
              <p className="text-white/60 text-sm mb-3">{ingredient.nameEn}</p>
            )}

            {ingredient.description && (
              <p className="text-white/70 text-sm mb-4 line-clamp-2">
                {ingredient.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>الوحدة:</span>
                <span className="font-semibold text-white">{ingredient.unit}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>الكمية الافتراضية:</span>
                <span className="font-semibold text-white">{ingredient.defaultPortion}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>السعر لكل وحدة:</span>
                <span className="font-semibold text-coffee-green">
                  {ingredient.pricePerUnit} ريال سعودي
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs ${
                  ingredient.status === 'active'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}
              >
                {ingredient.status === 'active' ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="glass-effect rounded-2xl p-12 text-center">
          <p className="text-white/50">لا توجد مكونات</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="glass-sidebar rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingIngredient ? 'تعديل المكون' : 'إضافة مكون جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">المعلومات الأساسية</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      اسم المكون (عربي) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      placeholder="مثال: حليب"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      اسم المكون (English)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      placeholder="e.g., Milk"
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
                    placeholder="وصف مختصر للمكون..."
                  />
                </div>
              </div>

              {/* Measurement */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">القياسات</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الوحدة *
                    </label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    >
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      السعر لكل وحدة *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الكمية الافتراضية *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={formData.defaultPortion}
                      onChange={(e) => setFormData({ ...formData, defaultPortion: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الحد الأدنى
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.minPortion}
                      onChange={(e) => setFormData({ ...formData, minPortion: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الحد الأقصى
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.maxPortion}
                      onChange={(e) => setFormData({ ...formData, maxPortion: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Visual */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">المظهر</h3>

                <ColorPicker
                  label="اللون"
                  value={formData.color || '#00BF89'}
                  onChange={(color) => setFormData({ ...formData, color })}
                />

                <ImageUpload
                  label="صورة المكون"
                  value={formData.image}
                  onChange={(image) => setFormData({ ...formData, image })}
                />
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">الإعدادات</h3>

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

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="flex-1 glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors"
                >
                  {editingIngredient ? 'تحديث' : 'إضافة'}
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
