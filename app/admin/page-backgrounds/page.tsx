'use client';

import { useState, useEffect } from 'react';
import { AdminAuth } from '@/components/AdminAuth';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, X } from 'lucide-react';
import { AlertDialog } from '@/components/AlertDialog';
import { IPageBackground } from '@/lib/models/PageBackground';

const MENU_PAGE_OPTION = { route: '/menu', name: 'قائمة الطعام (المنيو)' };

export default function PageBackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<IPageBackground[]>([]);
  const [dynamicPages, setDynamicPages] = useState<{ route: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBackground, setEditingBackground] = useState<IPageBackground | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    pageRoute: '',
    pageName: '',
    backgroundImageId: '',
    status: 'active' as 'active' | 'inactive',
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
    fetchBackgrounds();
    fetchDynamicPages();
  }, []);

  const fetchBackgrounds = async () => {
    try {
      const response = await fetch('/api/page-backgrounds');
      const data = await response.json();
      if (data.success) {
        setBackgrounds(data.data);
      }
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
    }
  };

  const fetchDynamicPages = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        const dynamicRoutes = data.data
          .filter((category: any) => category.status === 'active')
          .map((category: any) => ({
            route: `/category/${category._id}`,
            name: category.name
          }));
        setDynamicPages(dynamicRoutes);
      }
    } catch (error) {
      console.error('Error fetching dynamic pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBackground 
        ? `/api/page-backgrounds/${editingBackground._id}`
        : '/api/page-backgrounds';
      const method = editingBackground ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchBackgrounds();
        setShowModal(false);
        setEditingBackground(null);
        setFormData({
          pageRoute: '',
          pageName: '',
          backgroundImageId: '',
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Error saving background:', error);
    }
  };

  const handleEdit = (background: IPageBackground) => {
    setEditingBackground(background);
    setFormData({
      pageRoute: background.pageRoute,
      pageName: background.pageName,
      backgroundImageId: background.backgroundImageId || '',
      status: background.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخلفية؟')) return;
    
    try {
      const response = await fetch(`/api/page-backgrounds/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await fetchBackgrounds();
      }
    } catch (error) {
      console.error('Error deleting background:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name, 'Size:', file.size);

      const response = await fetch('/api/upload-simple', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.success) {
        setFormData(prev => ({ ...prev, backgroundImageId: data.data.id }));
        showAlert('نجاح', 'تم رفع الصورة بنجاح!');
      } else {
        showAlert('خطأ', 'فشل في رفع الصورة: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showAlert('خطأ', 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (imageId?: string) => {
    if (!imageId) return null;
    return `/api/images/${imageId}`;
  };

  if (loading) {
    return (
      <AdminAuth>
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="h-8 w-64 rounded animate-pulse" />
                <div className="h-4 w-80 rounded mt-2 animate-pulse" />
              </div>
              <div className="h-12 w-48 rounded-xl animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-effect rounded-2xl p-6">
                <div className="aspect-video rounded-xl animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-6 w-3/4 rounded animate-pulse" />
                  <div className="h-4 w-1/2 rounded animate-pulse" />
                  <div className="h-4 w-20 rounded animate-pulse" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-10 flex-1 rounded-xl animate-pulse" />
                  <div className="h-10 flex-1 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
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
              <h1 className="text-3xl font-bold text-white mb-2">إدارة خلفيات الصفحات</h1>
              <p className="text-white/70">إدارة الخلفيات لصفحات قوائم الطعام</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="glass-green-button px-6 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors flex items-center gap-2 justify-center"
            >
              <Plus size={20} />
              إضافة خلفية جديدة
            </button>
          </div>
        </div>

        {/* Backgrounds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {backgrounds.map((background) => (
            <div key={background._id} className="glass-effect rounded-2xl p-6">
              <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-white/10">
                {background.backgroundImageId ? (
                  <img
                    src={getImageUrl(background.backgroundImageId) || ''}
                    alt={background.pageName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    لا توجد صورة
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-lg">{background.pageName}</h3>
                <p className="text-white/70 text-sm">{background.pageRoute}</p>
                <div className="flex items-center gap-2">
                  {background.status === 'active' ? (
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
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(background)}
                  className="flex-1 glass-effect px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(background._id!)}
                  className="flex-1 glass-effect px-4 py-2 rounded-xl text-red-400 hover:bg-red-400/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowModal(false);
              setEditingBackground(null);
              setFormData({
                pageRoute: '',
                pageName: '',
                backgroundImageId: '',
                status: 'active',
              });
            }}
          >
            <div
              className="glass-effect rounded-2xl p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingBackground(null);
                  setFormData({
                    pageRoute: '',
                    pageName: '',
                    backgroundImageId: '',
                    status: 'active',
                  });
                }}
                className="absolute top-4 left-4 p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
                aria-label="إغلاق"
              >
                <X size={20} className="text-white" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6 pr-10">
                {editingBackground ? 'تعديل الخلفية' : 'إضافة خلفية جديدة'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">الصفحة</label>
                  <select
                    value={formData.pageRoute}
                    onChange={(e) => {
                      const selectedRoute = e.target.value;
                      const allPages = [MENU_PAGE_OPTION, ...dynamicPages];
                      const selectedPage = allPages.find(p => p.route === selectedRoute);

                      console.log('Selected route:', selectedRoute);
                      console.log('Selected page:', selectedPage);

                      setFormData(prev => ({
                        ...prev,
                        pageRoute: selectedRoute,
                        pageName: selectedPage?.name || selectedRoute,
                      }));
                    }}
                    className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    style={{ colorScheme: 'dark' }}
                    required
                    disabled={!!editingBackground}
                  >
                    <option value="" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>اختر الصفحة</option>
                    {/* Menu page */}
                    <option value={MENU_PAGE_OPTION.route} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                      {MENU_PAGE_OPTION.name}
                    </option>

                    {/* Dynamic Pages */}
                    {dynamicPages.length > 0 && (
                      <optgroup label="الصفحات الديناميكية" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                        {dynamicPages.map((page) => (
                          <option key={page.route} value={page.route} style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                            {page.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {editingBackground && (
                    <p className="text-white/50 text-xs mt-1">لا يمكن تعديل الصفحة للخلفية الموجودة</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">اسم الصفحة</label>
                  <input
                    type="text"
                    value={formData.pageName}
                    onChange={(e) => setFormData(prev => ({ ...prev, pageName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none"
                    required
                    readOnly
                  />
                  <p className="text-white/50 text-xs mt-1">يتم تحديد الاسم تلقائياً من القائمة</p>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">صورة الخلفية</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-white/10 rounded-xl text-white border border-white/20 focus:border-coffee-green focus:outline-none disabled:opacity-50"
                  />
                  {uploading && (
                    <p className="text-white/70 text-sm mt-2">جاري رفع الصورة...</p>
                  )}
                  {formData.backgroundImageId && (
                    <div className="mt-2">
                      <img
                        src={getImageUrl(formData.backgroundImageId) || ''}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    </div>
                  )}
                </div>

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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBackground(null);
                      setFormData({
                        pageRoute: '',
                        pageName: '',
                        backgroundImageId: '',
                        status: 'active',
                      });
                    }}
                    className="flex-1 glass-effect px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 glass-green-button px-4 py-3 rounded-xl text-white font-semibold hover:bg-coffee-green transition-colors"
                  >
                    {editingBackground ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
      />
    </AdminAuth>
  );
}
