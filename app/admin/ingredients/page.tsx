'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { IIngredient } from '@/lib/models/Ingredient';
import Image from 'next/image';
import { UnitType, UNIT_LABELS } from '@/lib/unitConversion';
import { useAlert, useConfirmation } from '@/components/ui/alerts';

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

  const { showSuccess, showError } = useAlert();
  const { confirm, ConfirmationComponent } = useConfirmation();

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
    confirm(
      {
        title: 'حذف المكون',
        message: 'هل أنت متأكد من حذف هذا المكون؟ لا يمكن التراجع عن هذا الإجراء.',
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        type: 'danger',
      },
      async () => {
        try {
          const res = await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            fetchIngredients();
            showSuccess('تم حذف المكون بنجاح');
          } else {
            showError(data.error || 'فشل حذف المكون');
          }
        } catch (error) {
          console.error('Error deleting ingredient:', error);
          showError('حدث خطأ أثناء حذف المكون');
        }
      }
    );
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

        <div className="admin-card rounded-2xl p-4">
          <div className="h-11 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="admin-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-9 w-9 rounded-lg animate-pulse" />
                  <div className="h-9 w-9 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-2/3 rounded animate-pulse mb-2" />
              <div className="h-4 w-1/2 rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded animate-pulse" />
                <div className="h-4 w-5/6 rounded animate-pulse" />
                <div className="h-4 w-2/3 rounded animate-pulse" />
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="h-6 w-20 rounded-full animate-pulse" />
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
            <h1 className="text-3xl font-bold mb-2">إدارة المكونات</h1>
            <p>إضافة وتعديل وحذف مكونات المنتجات</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="admin-button"
          >
            <Plus size={20} />
            إضافة مكون جديد
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="admin-card rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2" size={20} />
          <input
            type="text"
            placeholder="البحث عن مكون..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input w-full pr-12 pl-4 py-3"
          />
        </div>
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIngredients.map((ingredient) => (
          <div
            key={ingredient._id}
            className="admin-card rounded-2xl p-6"
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
                  className="admin-button"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ingredient._id!)}
                  className="admin-button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-1">{ingredient.name}</h3>
            {ingredient.nameEn && (
              <p className="text-sm mb-3">{ingredient.nameEn}</p>
            )}

            {ingredient.description && (
              <p className="text-sm mb-4 line-clamp-2">
                {ingredient.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>الوحدة:</span>
                <span className="font-semibold">{ingredient.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>الكمية الافتراضية:</span>
                <span className="font-semibold">{ingredient.defaultPortion}</span>
              </div>
              <div className="flex justify-between">
                <span>السعر لكل وحدة:</span>
                <span className="font-semibold">
                  {ingredient.pricePerUnit} ريال سعودي
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
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
        <div className="admin-card rounded-2xl p-12 text-center">
          <p>لا توجد مكونات</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="admin-card rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingIngredient ? 'تعديل المكون' : 'إضافة مكون جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      اسم المكون (عربي) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="admin-input w-full"
                      placeholder="مثال: حليب"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      اسم المكون (English)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="admin-input w-full"
                      placeholder="e.g., Milk"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="admin-input w-full min-h-24"
                    placeholder="وصف مختصر للمكون..."
                  />
                </div>
              </div>

              {/* Measurement */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">القياسات</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      الوحدة *
                    </label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="admin-input w-full"
                    >
                      <optgroup label="وزن (Weight)">
                        <option value={UnitType.GRAM}>{UNIT_LABELS[UnitType.GRAM].ar} (g)</option>
                        <option value={UnitType.KILOGRAM}>{UNIT_LABELS[UnitType.KILOGRAM].ar} (kg)</option>
                        <option value={UnitType.MILLIGRAM}>{UNIT_LABELS[UnitType.MILLIGRAM].ar} (mg)</option>
                      </optgroup>
                      <optgroup label="حجم (Volume)">
                        <option value={UnitType.MILLILITER}>{UNIT_LABELS[UnitType.MILLILITER].ar} (ml)</option>
                        <option value={UnitType.LITER}>{UNIT_LABELS[UnitType.LITER].ar} (l)</option>
                        <option value={UnitType.CUP}>{UNIT_LABELS[UnitType.CUP].ar} (cup)</option>
                        <option value={UnitType.TABLESPOON}>{UNIT_LABELS[UnitType.TABLESPOON].ar} (tbsp)</option>
                        <option value={UnitType.TEASPOON}>{UNIT_LABELS[UnitType.TEASPOON].ar} (tsp)</option>
                      </optgroup>
                      <optgroup label="عدد (Count)">
                        <option value={UnitType.PIECE}>{UNIT_LABELS[UnitType.PIECE].ar} (piece)</option>
                        <option value={UnitType.UNIT}>{UNIT_LABELS[UnitType.UNIT].ar} (unit)</option>
                        <option value={UnitType.DOZEN}>{UNIT_LABELS[UnitType.DOZEN].ar} (dozen)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      السعر لكل وحدة *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) })}
                      className="admin-input w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      الكمية الافتراضية *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={formData.defaultPortion}
                      onChange={(e) => setFormData({ ...formData, defaultPortion: parseFloat(e.target.value) })}
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      الحد الأدنى
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.minPortion}
                      onChange={(e) => setFormData({ ...formData, minPortion: parseFloat(e.target.value) })}
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      الحد الأقصى
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.maxPortion}
                      onChange={(e) => setFormData({ ...formData, maxPortion: parseFloat(e.target.value) })}
                      className="admin-input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Visual */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">المظهر</h3>

                <ImageUpload
                  label="صورة المكون"
                  value={formData.image}
                  onChange={(image) => setFormData({ ...formData, image })}
                />
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الإعدادات</h3>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="admin-input w-full"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="admin-button flex-1"
                >
                  {editingIngredient ? 'تحديث' : 'إضافة'}
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
