'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { IHomepageImage } from '@/lib/models/HomepageImage';
import Image from 'next/image';

const SECTIONS = [
  { value: 'signature-drinks', label: 'مشروباتنا المميزة' },
  { value: 'offers', label: 'العروض الخاصة' },
  { value: 'journey', label: 'رحلتنا' },
];

export default function HomepagePage() {
  const [images, setImages] = useState<IHomepageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<IHomepageImage | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    section: 'signature-drinks' as 'signature-drinks' | 'offers' | 'journey',
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    order: 0,
    journeyPosition: 'left' as 'left' | 'right',
  });

  useEffect(() => {
    fetchImages();
  }, [selectedSection]);

  const fetchImages = async () => {
    try {
      const url = selectedSection
        ? `/api/homepage?section=${selectedSection}`
        : '/api/homepage';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingImage) {
      // Update existing image (metadata only)
      try {
        const res = await fetch(`/api/homepage/${editingImage._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (data.success) {
          fetchImages();
          handleCloseModal();
        }
      } catch (error) {
        console.error('Error updating image:', error);
      }
    } else {
      // Upload new image
      if (!selectedFile) {
        alert('الرجاء اختيار صورة');
        return;
      }

      setUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('section', formData.section);
        uploadFormData.append('title', formData.title);
        uploadFormData.append('titleEn', formData.titleEn);
        uploadFormData.append('description', formData.description);
        uploadFormData.append('descriptionEn', formData.descriptionEn);
        uploadFormData.append('order', formData.order.toString());
        if (formData.section === 'journey') {
          uploadFormData.append('journeyPosition', formData.journeyPosition);
        }

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const data = await res.json();
        if (data.success) {
          fetchImages();
          handleCloseModal();
        } else {
          alert('خطأ في رفع الصورة: ' + data.error);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('خطأ في رفع الصورة');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      const res = await fetch(`/api/homepage/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleEdit = (image: IHomepageImage) => {
    setEditingImage(image);
    setFormData({
      section: image.section,
      title: image.title,
      titleEn: image.titleEn || '',
      description: image.description || '',
      descriptionEn: image.descriptionEn || '',
      order: image.order,
      journeyPosition: image.journeyPosition || 'left',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingImage(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      section: 'signature-drinks',
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      order: 0,
      journeyPosition: 'left',
    });
  };

  const getSectionLabel = (section: string) => {
    return SECTIONS.find((s) => s.value === section)?.label || section;
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
            <h1 className="text-3xl font-bold text-white mb-2">إدارة صور الصفحة الرئيسية</h1>
            <p className="text-white/70">إدارة الصور للمشروبات المميزة والعروض والرحلة</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            إضافة صورة جديدة
          </button>
        </div>
      </div>

      {/* Filter by Section */}
      <div className="glass-effect rounded-2xl p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSection('')}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              !selectedSection
                ? 'bg-coffee-green text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            الكل
          </button>
          {SECTIONS.map((section) => (
            <button
              key={section.value}
              onClick={() => setSelectedSection(section.value)}
              className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedSection === section.value
                  ? 'bg-coffee-green text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image._id}
            className="glass-effect rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-200"
          >
            <div className="relative h-48 bg-black/20">
              <Image
                src={`/api/images/${image.imageId}`}
                alt={image.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{image.title}</h3>
                  {image.titleEn && (
                    <p className="text-white/60 text-sm">{image.titleEn}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(image._id!)}
                    className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {image.description && (
                <p className="text-white/70 text-sm mb-4 line-clamp-2">
                  {image.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">{getSectionLabel(image.section)}</span>
                <span className="text-white/50">الترتيب: {image.order}</span>
              </div>

              {image.section === 'journey' && image.journeyPosition && (
                <div className="mt-2">
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300">
                    {image.journeyPosition === 'left' ? 'يسار' : 'يمين'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="glass-effect rounded-2xl p-12 text-center">
          <p className="text-white/50">لا توجد صور</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="glass-sidebar rounded-2xl p-6 w-full max-w-2xl my-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingImage ? 'تعديل الصورة' : 'إضافة صورة جديدة'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              {!editingImage && (
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    الصورة *
                  </label>
                  <div className="glass-effect rounded-xl border-2 border-dashed border-white/20 p-8 text-center cursor-pointer hover:border-coffee-green transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      required={!editingImage}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {previewUrl ? (
                        <div className="relative w-full h-64 mb-4">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div>
                          <ImageIcon className="mx-auto text-white/50 mb-4" size={48} />
                          <p className="text-white font-semibold mb-1">
                            اسحب الصورة هنا أو انقر للاختيار
                          </p>
                          <p className="text-white/60 text-sm">PNG, JPG, GIF</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Section */}
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">
                  القسم *
                </label>
                <select
                  required
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      section: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                  style={{ colorScheme: 'dark' }}
                >
                  {SECTIONS.map((section) => (
                    <option key={section.value} value={section.value} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    العنوان (عربي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    العنوان (English)
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) =>
                      setFormData({ ...formData, titleEn: e.target.value })
                    }
                    className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    الوصف (عربي)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none min-h-24"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    الوصف (English)
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionEn: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none min-h-24"
                  />
                </div>
              </div>

              {/* Order and Journey Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                  />
                </div>

                {formData.section === 'journey' && (
                  <div>
                    <label className="text-sm font-semibold text-white mb-2 block">
                      الموضع
                    </label>
                    <select
                      value={formData.journeyPosition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          journeyPosition: e.target.value as 'left' | 'right',
                        })
                      }
                      className="w-full px-4 py-3 glass-effect rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    >
                      <option value="left">يسار</option>
                      <option value="right">يمين</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors disabled:opacity-50"
                >
                  {uploading ? 'جاري الرفع...' : editingImage ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={uploading}
                  className="flex-1 glass-effect px-6 py-3 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
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
