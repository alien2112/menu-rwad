'use client';

import { useState, useEffect } from 'react';
import { AdminAuth } from '@/components/AdminAuth';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, MapPin } from 'lucide-react';
import { ILocation } from '@/lib/models/Location';

export default function LocationsPage() {
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ILocation | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    images: [] as string[],
    address: '',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 },
    status: 'active' as 'active' | 'inactive',
    order: 0,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingLocation 
        ? `/api/locations/${editingLocation._id}`
        : '/api/locations';
      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchLocations();
        setShowModal(false);
        setEditingLocation(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const handleEdit = (location: ILocation) => {
    setEditingLocation(location);
    setFormData({
      title: location.title,
      titleEn: location.titleEn || '',
      description: location.description || '',
      descriptionEn: location.descriptionEn || '',
      images: location.images || [],
      address: location.address || '',
      phone: location.phone || '',
      email: location.email || '',
      coordinates: location.coordinates || { lat: 0, lng: 0 },
      status: location.status,
      order: location.order,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموقع؟')) return;
    
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await fetchLocations();
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the 4 image limit
    const totalImages = formData.images.length + files.length;
    if (totalImages > 4) {
      alert(`يمكنك رفع ${4 - formData.images.length} صورة فقط. لديك حالياً ${formData.images.length} صورة.`);
      return;
    }

    setUploading(true);
    try {
      const uploadedImages: string[] = [];
      
      // Only process files that won't exceed the limit
      const filesToProcess = files.slice(0, 4 - formData.images.length);
      
      for (const file of filesToProcess) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-simple', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          uploadedImages.push(data.data.id);
        }
      }

      if (uploadedImages.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...uploadedImages] 
        }));
        alert(`تم رفع ${uploadedImages.length} صورة بنجاح!`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('حدث خطأ أثناء رفع الصور');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(id => id !== imageId)
    }));
  };

  const getImageUrl = (imageId: string) => {
    return `/api/images/${imageId}`;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      images: [],
      address: '',
      phone: '',
      email: '',
      coordinates: { lat: 0, lng: 0 },
      status: 'active',
      order: 0,
    });
  };

  if (loading) {
    return (
      <AdminAuth>
        <div className="flex items-center justify-center h-64">
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">إدارة المواقع</h1>
              <p className="text-white/70">إدارة صور وأماكن المواقع</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors flex items-center gap-2 justify-center"
            >
              <Plus size={20} />
              إضافة موقع جديد
            </button>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div key={location._id} className="glass-effect rounded-2xl p-6">
              <div className="space-y-4">
                {/* Images Preview */}
                <div className="grid grid-cols-2 gap-2">
                  {location.images.slice(0, 4).map((imageId, index) => (
                    <div key={imageId} className="aspect-square rounded-xl overflow-hidden bg-white/10">
                      <img
                        src={getImageUrl(imageId)}
                        alt={`${location.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-lg">{location.title}</h3>
                  {location.titleEn && (
                    <p className="text-white/70 text-sm">{location.titleEn}</p>
                  )}
                  {location.address && (
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <MapPin size={16} />
                      <span>{location.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {location.status === 'active' ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <Eye size={16} />
                        نشط
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 text-sm">
                        <EyeOff size={16} />
                        غير نشط
                      </span>
                    )}
                    <span className="text-white/50 text-sm">ترتيب: {location.order}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="flex-1 glass-effect px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(location._id!)}
                    className="flex-1 glass-effect px-4 py-2 rounded-xl text-red-400 hover:bg-red-400/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingLocation ? 'تعديل الموقع' : 'إضافة موقع جديد'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">العنوان (عربي)</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">العنوان (إنجليزي)</label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">الوصف (عربي)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">الوصف (إنجليزي)</label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                         <label className="block text-white/70 text-sm mb-2">صور الموقع (حد أقصى 4 صور)</label>
                         <input
                           type="file"
                           accept="image/*"
                           multiple
                           onChange={handleFileUpload}
                           disabled={uploading || formData.images.length >= 4}
                           className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none disabled:opacity-50"
                         />
                         {formData.images.length >= 4 && (
                           <p className="text-yellow-400 text-sm mt-2">تم الوصول للحد الأقصى من الصور (4 صور)</p>
                         )}
                  {uploading && (
                    <p className="text-white/70 text-sm mt-2">جاري رفع الصور...</p>
                  )}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-white/70 text-sm mb-2">الصور المرفوعة ({formData.images.length}/4):</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {formData.images.map((imageId, index) => (
                          <div key={imageId} className="relative">
                            <img
                              src={getImageUrl(imageId)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(imageId)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">العنوان الفعلي</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">الهاتف</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="active" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>نشط</option>
                      <option value="inactive" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>غير نشط</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">الترتيب (0-3)</label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: Math.min(3, Math.max(0, parseInt(e.target.value) || 0)) }))}
                      className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingLocation(null);
                      resetForm();
                    }}
                    className="flex-1 glass-effect px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 glass-green-button px-4 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors"
                  >
                    {editingLocation ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminAuth>
  );
}
