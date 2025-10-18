'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { AlertDialog } from '@/components/admin/AlertDialog';
import { useAlert, useConfirmation } from '@/components/ui/alerts';

type Hero = {
  _id: string;
  pageRoute: string;
  mediaType: 'image' | 'video';
  mediaId?: string;
  mediaUrl?: string;
  title?: string;
  status: 'active' | 'inactive';
};

export default function PageHeroAdmin() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Hero>>({
    pageRoute: '/menu',
    mediaType: 'image',
    status: 'active',
  });
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const { showSuccess, showError } = useAlert();
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Branding (Logo) controls
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoPosition, setLogoPosition] = useState<'left' | 'center' | 'right'>('center');
  const [savingLogo, setSavingLogo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [brandingMessage, setBrandingMessage] = useState<string | null>(null);

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/page-hero?admin=true');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setHeroes(json.data || []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
    // Load current site settings for logo
    (async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data) {
          setLogoUrl(json.data.logoUrl || "");
          setLogoPosition(json.data.logoPosition || 'center');
        }
      } catch {}
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let mediaId = form.mediaId;
      // If a file is selected, upload to GridFS first
      if (file) {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        const up = await fetch('/api/upload-simple', { method: 'POST', body: fd });
        const upJson = await up.json();
        if (!upJson.success) throw new Error(upJson.error || 'Upload failed');
        mediaId = upJson.data.id;
      }

      const res = await fetch('/api/page-hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, mediaId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to create');
      await fetchHeroes();
      setForm({ pageRoute: '/menu', mediaType: 'image', status: 'active' });
      setFile(null);
    } catch (e: any) {
      showAlert('Error', e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (f: File) => {
    setUploadingLogo(true);
    setBrandingMessage(null);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/upload-simple', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'فشل رفع الشعار');
      setLogoUrl(`/api/images/${json.data.id}`);
    } catch (e: any) {
      setBrandingMessage(e.message || 'فشل رفع الشعار');
    } finally {
      setUploadingLogo(false);
    }
  };

  const saveBranding = async () => {
    setSavingLogo(true);
    setBrandingMessage(null);
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl, logoPosition }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'فشل حفظ الإعدادات');
      setBrandingMessage('تم حفظ إعدادات الشعار');
    } catch (e: any) {
      setBrandingMessage(e.message || 'فشل حفظ الإعدادات');
    } finally {
      setSavingLogo(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirm(
      {
        title: 'حذف السجل',
        message: 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        type: 'danger',
      },
      async () => {
        try {
          const res = await fetch(`/api/page-hero/${id}`, { method: 'DELETE' });
          const json = await res.json();
          if (!json.success) throw new Error(json.error || 'Failed to delete');
          await fetchHeroes();
          showSuccess('تم حذف السجل بنجاح');
        } catch (e: any) {
          showError(e.message || 'حدث خطأ أثناء حذف السجل');
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">وسائط الصفحة (أعلى التصنيفات)</h1>

      <form onSubmit={handleSubmit} className="admin-card rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm">المسار</label>
            <input
              className="admin-input mt-1 w-full"
              value={form.pageRoute || ''}
              onChange={(e) => setForm((f) => ({ ...f, pageRoute: e.target.value }))}
              placeholder="/menu"
              required
            />
          </div>
          <div>
            <label className="text-sm">نوع الوسائط</label>
            <select
              className="admin-input mt-1 w-full"
              value={form.mediaType || 'image'}
              onChange={(e) => setForm((f) => ({ ...f, mediaType: e.target.value as any }))}
            >
              <option value="image">صورة</option>
              <option value="video">فيديو</option>
            </select>
          </div>
          <div>
            <label className="text-sm">الحالة</label>
            <select
              className="admin-input mt-1 w-full"
              value={form.status || 'active'}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
            >
              <option value="active">مفعل</option>
              <option value="inactive">غير مفعل</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="text-sm">رابط الوسائط (اختياري)</label>
            <input
              className="admin-input mt-1 w-full"
              value={form.mediaUrl || ''}
              onChange={(e) => setForm((f) => ({ ...f, mediaUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-sm">العنوان (اختياري)</label>
            <input
              className="admin-input mt-1 w-full"
              value={form.title || ''}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="نص يظهر فوق التصنيفات"
            />
          </div>
          <details className="md:col-span-3">
            <summary className="cursor-pointer list-none select-none text-sm admin-button">
              خيارات الرفع إلى GridFS (اختياري)
            </summary>
            <div className="mt-3">
              <input
                type="file"
                accept={form.mediaType === 'image' ? 'image/*' : 'video/*'}
                className="admin-input w-full"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs mt-1">سيتم استخدام mediaId إذا تم الرفع، وإلا سيتم استخدام الرابط الخارجي إن وُجد.</p>
            </div>
          </details>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="admin-button" disabled={uploading}>
            {uploading ? 'جار الرفع...' : 'حفظ'}
          </button>
        </div>
      </form>

      {/* Branding (Logo) settings integrated into this page */}
      <div className="admin-card rounded-2xl p-4 space-y-4">
        <h2 className="font-semibold">إعدادات الشعار</h2>
        {brandingMessage && (
          <div className="p-3 rounded-lg admin-card">{brandingMessage}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm">رابط الشعار</label>
            <input
              className="admin-input w-full"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://... أو سيتم ملؤه عند الرفع"
            />
            <div>
              <label className="text-sm mb-1 block">رفع الشعار</label>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingLogo}
                className=""
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleLogoUpload(f);
                }}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm">موضع الشعار</label>
            <select
              className="admin-input w-full"
              value={logoPosition}
              onChange={(e) => setLogoPosition(e.target.value as any)}
            >
              <option value="left">يسار</option>
              <option value="center">وسط</option>
              <option value="right">يمين</option>
            </select>
            <div>
              <label className="text-sm mb-1 block">معاينة</label>
              <div className="h-32 admin-card rounded-xl flex items-center px-4">
                <div className={`${logoPosition === 'left' ? 'justify-start' : logoPosition === 'right' ? 'justify-end' : 'justify-center'} w-full flex`}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
                  ) : (
                    <div>لا يوجد شعار</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveBranding}
            disabled={savingLogo}
            className="admin-button"
          >
            {savingLogo ? 'جار الحفظ...' : 'حفظ إعدادات الشعار'}
          </button>
        </div>
      </div>

      <div className="admin-card rounded-2xl p-4 max-h-96 overflow-auto">
        <h2 className="font-semibold mb-3">السجلات</h2>
        {loading ? (
          <p>جار التحميل...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-3">
            {heroes.map((h) => (
              <div key={h._id} className="flex items-center justify-between admin-card rounded-xl p-3">
                <div className="space-y-1">
                  <p className="font-semibold">{h.pageRoute} - {h.mediaType}</p>
                  <p className="text-sm truncate">{h.mediaUrl || h.mediaId || '—'}</p>
                  <p className="text-sm">{h.status}</p>
                </div>
                <button onClick={() => handleDelete(h._id)} className="text-red-500 hover:text-red-400">
                  حذف
                </button>
              </div>
            ))}
            {heroes.length === 0 && (
              <p>لا توجد سجلات</p>
            )}
          </div>
        )}
      </div>
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
      />
      {ConfirmationComponent}
    </div>
  );
}


