"use client";

import { useEffect, useState } from "react";
import { RoleBasedAuth } from "@/components/RoleBasedAuth";

export default function BrandingPage() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoPosition, setLogoPosition] = useState<'left' | 'center' | 'right'>('center');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data) {
          setLogoUrl(json.data.logoUrl || "");
          setLogoPosition(json.data.logoPosition || 'center');
        }
      } catch (e) {
        setMessage('فشل تحميل إعدادات الموقع');
      }
    };
    load();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload-simple', { method: 'POST', body: form });
      const json = await res.json();
      if (json.success && json.data?.id) {
        setLogoUrl(`/api/images/${json.data.id}`);
      } else {
        setMessage(json.error || 'فشل رفع الشعار');
      }
    } catch (e) {
      setMessage('فشل رفع الشعار');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl, logoPosition })
      });
      const json = await res.json();
      if (json.success) {
        setMessage('تم حفظ الإعدادات بنجاح');
      } else {
        setMessage(json.error || 'فشل حفظ الإعدادات');
      }
    } catch (e) {
      setMessage('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleBasedAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">إعدادات العلامة التجارية</h1>
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-white/10 border border-white/20 text-white">{message}</div>
        )}

        <div className="glass-effect rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-white/80 text-sm">رابط الشعار</label>
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="أدخل رابط الصورة أو ارفع صورة"
              />
              <div>
                <label className="block text-white/80 text-sm mb-2">رفع الشعار</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                  disabled={uploading}
                  className="text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-white/80 text-sm">موضع الشعار</label>
              <select
                value={logoPosition}
                onChange={(e) => setLogoPosition(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="left">يسار</option>
                <option value="center">وسط</option>
                <option value="right">يمين</option>
              </select>

              <div className="pt-4">
                <label className="block text-white/80 text-sm mb-2">معاينة</label>
                <div className="h-40 bg-white/5 rounded-xl border border-white/10 flex items-center px-6">
                  <div className={`${logoPosition === 'left' ? 'justify-start' : logoPosition === 'right' ? 'justify-end' : 'justify-center'} w-full flex`}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-20 object-contain" />
                    ) : (
                      <div className="text-white/50">لا يوجد شعار</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>
      </div>
    </RoleBasedAuth>
  );
}


