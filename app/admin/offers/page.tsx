'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Calendar, Percent, Gift } from 'lucide-react';
import ColorPicker from '@/components/admin/ColorPicker';
import ImageUpload from '@/components/admin/ImageUpload';
import { IOffer } from '@/lib/models/Offer';
import { ICategory } from '@/lib/models/Category';
import { IMenuItem } from '@/lib/models/MenuItem';
import Image from 'next/image';

const OFFER_TYPES = [
  { value: 'percentage', label: 'نسبة مئوية' },
  { value: 'fixed', label: 'مبلغ ثابت' },
  { value: 'buy_x_get_y', label: 'اشتري X واحصل على Y' },
  { value: 'free_item', label: 'منتج مجاني' },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<IOffer[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<IOffer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<IOffer>>({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    type: 'percentage',
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: 0,
    image: '',
    color: '#FF6B6B',
    applicableCategories: [],
    applicableItems: [],
    buyQuantity: 1,
    getQuantity: 1,
    freeItemId: '',
    code: '',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    usageLimit: 0,
    usedCount: 0,
    order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [offersRes, categoriesRes, itemsRes] = await Promise.all([
        fetch('/api/offers'),
        fetch('/api/categories'),
        fetch('/api/items'),
      ]);

      const [offersData, categoriesData, itemsData] = await Promise.all([
        offersRes.json(),
        categoriesRes.json(),
        itemsRes.json(),
      ]);

      if (offersData.success) setOffers(offersData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
      if (itemsData.success) setItems(itemsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingOffer ? `/api/offers/${editingOffer._id}` : '/api/offers';
      const method = editingOffer ? 'PUT' : 'POST';

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
      console.error('Error saving offer:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const handleEdit = (offer: IOffer) => {
    setEditingOffer(offer);
    setFormData(offer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOffer(null);
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      type: 'percentage',
      discountValue: 0,
      minPurchase: 0,
      maxDiscount: 0,
      image: '',
      color: '#FF6B6B',
      applicableCategories: [],
      applicableItems: [],
      buyQuantity: 1,
      getQuantity: 1,
      freeItemId: '',
      code: '',
      startDate: new Date(),
      endDate: new Date(),
      status: 'active',
      usageLimit: 0,
      usedCount: 0,
      order: 0,
    });
  };

  const filteredOffers = offers.filter((offer) =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent size={24} />;
      case 'fixed':
        return <Percent size={24} />;
      case 'buy_x_get_y':
        return <Gift size={24} />;
      case 'free_item':
        return <Gift size={24} />;
      default:
        return <Percent size={24} />;
    }
  };

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
            <h1 className="text-3xl font-bold text-white mb-2">إدارة العروض والخصومات</h1>
            <p className="text-white/70">إضافة وتعديل وحذف العروض الترويجية</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            إضافة عرض جديد
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-effect rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
          <input
            type="text"
            placeholder="البحث عن عرض..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-coffee-green focus:outline-none"
          />
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => {
          const isExpired = new Date(offer.endDate) < new Date();
          const isActive = new Date(offer.startDate) <= new Date() && new Date(offer.endDate) >= new Date();

          return (
            <div
              key={offer._id}
              className="glass-effect rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-200"
            >
              {offer.image && (
                <div className="relative h-40 bg-black/20">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: offer.color }}
                  >
                    {getOfferIcon(offer.type)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id!)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{offer.title}</h3>
                {offer.titleEn && (
                  <p className="text-white/60 text-sm mb-3">{offer.titleEn}</p>
                )}

                {offer.description && (
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {offer.description}
                  </p>
                )}

                {offer.code && (
                  <div className="mb-4 p-3 bg-white/10 rounded-lg border border-dashed border-white/20">
                    <p className="text-xs text-white/60 mb-1">كود الخصم</p>
                    <p className="text-lg font-bold text-coffee-green">{offer.code}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar size={16} />
                    <span>
                      {new Date(offer.startDate).toLocaleDateString('ar-EG')} -{' '}
                      {new Date(offer.endDate).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  {offer.type === 'percentage' && (
                    <div className="text-white/70">
                      خصم <span className="font-bold text-coffee-green">{offer.discountValue}%</span>
                    </div>
                  )}
                  {offer.type === 'fixed' && (
                    <div className="text-white/70">
                      خصم <span className="font-bold text-coffee-green">{offer.discountValue} ج.م</span>
                    </div>
                  )}
                  {offer.type === 'buy_x_get_y' && (
                    <div className="text-white/70">
                      اشتري {offer.buyQuantity} واحصل على {offer.getQuantity}
                    </div>
                  )}

                  {offer.usageLimit && (
                    <div className="text-white/70">
                      الاستخدام: {offer.usedCount} / {offer.usageLimit}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      isExpired
                        ? 'bg-red-500/20 text-red-300'
                        : isActive && offer.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {isExpired ? 'منتهي' : isActive && offer.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                  <span className="text-xs text-white/50">
                    {OFFER_TYPES.find((t) => t.value === offer.type)?.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOffers.length === 0 && (
        <div className="glass-effect rounded-2xl p-12 text-center">
          <p className="text-white/50">لا توجد عروض</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="glass-sidebar rounded-2xl p-6 w-full max-w-4xl my-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">المعلومات الأساسية</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      عنوان العرض (عربي) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      عنوان العرض (English)
                    </label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
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
              </div>

              {/* Offer Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">نوع العرض</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      نوع العرض *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      {OFFER_TYPES.map((type) => (
                        <option key={type.value} value={type.value} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(formData.type === 'percentage' || formData.type === 'fixed') && (
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block">
                        قيمة الخصم *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {formData.type === 'buy_x_get_y' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block">
                        اشتري (العدد)
                      </label>
                      <input
                        type="number"
                        value={formData.buyQuantity}
                        onChange={(e) => setFormData({ ...formData, buyQuantity: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block">
                        احصل على (العدد)
                      </label>
                      <input
                        type="number"
                        value={formData.getQuantity}
                        onChange={(e) => setFormData({ ...formData, getQuantity: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'free_item' && (
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      المنتج المجاني
                    </label>
                    <select
                      value={formData.freeItemId}
                      onChange={(e) => setFormData({ ...formData, freeItemId: e.target.value })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    >
                      <option value="">اختر المنتج</option>
                      {items.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الحد الأدنى للشراء
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الحد الأقصى للخصم
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      كود الخصم
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Applicable Items/Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">المنتجات والفئات المشمولة بالعرض</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الفئات المشمولة (اختر فئة أو أكثر)
                    </label>
                    <div className="glass-effect rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                      {categories.map((category) => (
                        <label key={category._id} className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.applicableCategories?.includes(category._id!) || false}
                            onChange={(e) => {
                              const current = formData.applicableCategories || [];
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  applicableCategories: [...current, category._id!]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  applicableCategories: current.filter(id => id !== category._id)
                                });
                              }
                            }}
                            className="w-5 h-5 rounded"
                          />
                          <span>{category.name} {category.nameEn && `(${category.nameEn})`}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      المنتجات المحددة المشمولة (اختر منتج أو أكثر)
                    </label>
                    <div className="glass-effect rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
                      {items.map((item) => {
                        const category = categories.find(c => c._id === item.categoryId);
                        return (
                          <label key={item._id} className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.applicableItems?.includes(item._id!) || false}
                              onChange={(e) => {
                                const current = formData.applicableItems || [];
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    applicableItems: [...current, item._id!]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    applicableItems: current.filter(id => id !== item._id)
                                  });
                                }
                              }}
                              className="w-5 h-5 rounded"
                            />
                            <div className="flex-1">
                              <span className="block">{item.name}</span>
                              <span className="text-xs text-white/50">
                                {category?.name} - {item.price} ريال
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-white/50 mt-2">
                      ملاحظة: إذا اخترت فئات، سيتم تطبيق العرض على جميع منتجات الفئة.
                      المنتجات المحددة هنا تُضاف بالإضافة إلى منتجات الفئات المختارة.
                    </p>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">المدة</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      تاريخ البدء *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate instanceof Date ? formData.startDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      تاريخ الانتهاء *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate instanceof Date ? formData.endDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
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
                  value={formData.color || '#FF6B6B'}
                  onChange={(color) => setFormData({ ...formData, color })}
                />

                <ImageUpload
                  label="صورة العرض"
                  value={formData.image}
                  onChange={(image) => setFormData({ ...formData, image })}
                />
              </div>

              {/* Settings */}
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
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="active" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>نشط</option>
                      <option value="inactive" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>غير نشط</option>
                      <option value="expired" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>منتهي</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      حد الاستخدام
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
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
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="flex-1 glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors"
                >
                  {editingOffer ? 'تحديث' : 'إضافة'}
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
