'use client';

import { useState, useEffect } from 'react';
import { Palette, RotateCcw, Save, Eye, Sparkles } from 'lucide-react';
import { useAlert } from '@/components/ui/alerts';

interface ThemeColors {
  background?: string;
  foreground?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  card?: string;
  'card-foreground'?: string;
  muted?: string;
  'muted-foreground'?: string;
  ring?: string;
}

const DEFAULT_THEME: ThemeColors = {
  background: '240 10% 3.9%',
  foreground: '0 0% 98%',
  primary: '0 0% 98%',
  secondary: '240 3.7% 15.9%',
  accent: '240 3.7% 15.9%',
  card: '240 10% 3.9%',
  'card-foreground': '0 0% 98%',
  muted: '240 3.7% 15.9%',
  'muted-foreground': '240 5% 64.9%',
  ring: '240 4.9% 83.9%',
};

const THEME_PRESETS = [
  {
    name: 'Dark (Default)',
    nameAr: 'داكن (افتراضي)',
    colors: DEFAULT_THEME
  },
  {
    name: 'Golden Night',
    nameAr: 'ليلة ذهبية',
    colors: {
      background: '30 10% 8%',
      foreground: '40 90% 95%',
      primary: '38 90% 55%',
      secondary: '30 15% 15%',
      accent: '38 70% 45%',
      card: '30 10% 12%',
      'card-foreground': '40 90% 95%',
      muted: '30 15% 20%',
      'muted-foreground': '40 20% 60%',
      ring: '38 90% 55%',
    }
  },
  {
    name: 'Coffee Brown',
    nameAr: 'بني القهوة',
    colors: {
      background: '25 25% 10%',
      foreground: '30 10% 95%',
      primary: '30 45% 50%',
      secondary: '25 20% 18%',
      accent: '30 55% 45%',
      card: '25 25% 14%',
      'card-foreground': '30 10% 95%',
      muted: '25 20% 22%',
      'muted-foreground': '30 8% 55%',
      ring: '30 45% 50%',
    }
  },
  {
    name: 'Emerald Luxury',
    nameAr: 'الزمرد الفاخر',
    colors: {
      background: '160 20% 8%',
      foreground: '160 10% 95%',
      primary: '160 80% 40%',
      secondary: '160 15% 15%',
      accent: '160 70% 35%',
      card: '160 20% 12%',
      'card-foreground': '160 10% 95%',
      muted: '160 15% 20%',
      'muted-foreground': '160 8% 55%',
      ring: '160 80% 40%',
    }
  },
  {
    name: 'Royal Purple',
    nameAr: 'البنفسجي الملكي',
    colors: {
      background: '270 25% 10%',
      foreground: '270 10% 95%',
      primary: '270 70% 55%',
      secondary: '270 20% 18%',
      accent: '270 60% 45%',
      card: '270 25% 14%',
      'card-foreground': '270 10% 95%',
      muted: '270 20% 22%',
      'muted-foreground': '270 8% 55%',
      ring: '270 70% 55%',
    }
  },
  {
    name: 'Sunset Orange',
    nameAr: 'برتقالي الغروب',
    colors: {
      background: '15 30% 10%',
      foreground: '20 10% 95%',
      primary: '20 80% 55%',
      secondary: '15 25% 18%',
      accent: '20 70% 50%',
      card: '15 30% 14%',
      'card-foreground': '20 10% 95%',
      muted: '15 25% 22%',
      'muted-foreground': '20 8% 55%',
      ring: '20 80% 55%',
    }
  }
];

export default function ThemeManagementPage() {
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await fetch('/api/theme', { cache: 'no-store' });
      const data = await response.json();

      if (data.success && data.theme) {
        setTheme({ ...DEFAULT_THEME, ...data.theme });
      }
    } catch (error) {
      console.error('Error fetching theme:', error);
      showError('فشل تحميل الثيم');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('تم حفظ الثيم بنجاح');
        applyTheme(theme);
      } else {
        showError(data.error || 'فشل حفظ الثيم');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      showError('حدث خطأ أثناء حفظ الثيم');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين الثيم إلى الإعدادات الافتراضية؟')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetTheme: true }),
      });

      const data = await response.json();

      if (data.success) {
        setTheme(DEFAULT_THEME);
        applyTheme(DEFAULT_THEME);
        showSuccess('تم إعادة تعيين الثيم بنجاح');
      } else {
        showError(data.error || 'فشل إعادة تعيين الثيم');
      }
    } catch (error) {
      console.error('Error resetting theme:', error);
      showError('حدث خطأ أثناء إعادة تعيين الثيم');
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (themeColors: ThemeColors) => {
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--${key}`, value);
      }
    });
  };

  const handlePreview = () => {
    if (previewMode) {
      // Revert to saved theme
      fetchTheme();
    } else {
      // Apply current theme
      applyTheme(theme);
    }
    setPreviewMode(!previewMode);
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setTheme(preset.colors);
    if (previewMode) {
      applyTheme(preset.colors);
    }
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    if (previewMode) {
      applyTheme(newTheme);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="admin-card rounded-2xl p-6">
          <div className="h-8 w-64 rounded animate-pulse bg-white/10 mb-2" />
          <div className="h-4 w-96 rounded animate-pulse bg-white/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-card rounded-2xl p-6 animate-pulse">
              <div className="h-32 rounded-xl bg-white/10 mb-4" />
              <div className="h-6 w-32 rounded bg-white/10" />
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
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Palette size={32} />
              إدارة الثيم
            </h1>
            <p className="text-white/70">قم بتخصيص ألوان وسمات موقعك بالكامل</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              className={`admin-button flex items-center gap-2 ${previewMode ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              <Eye size={20} />
              {previewMode ? 'معاينة مفعلة' : 'معاينة'}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="admin-button flex items-center gap-2"
            >
              <RotateCcw size={20} />
              إعادة تعيين
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-button flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save size={20} />
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </div>
      </div>

      {/* Theme Presets */}
      <div className="admin-card rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles size={24} />
          قوالب جاهزة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {THEME_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset)}
              className="admin-card rounded-xl p-4 hover:scale-105 transition-transform"
            >
              <div className="space-y-2 mb-3">
                <div className="h-12 rounded-lg" style={{ background: `hsl(${preset.colors.background})` }} />
                <div className="grid grid-cols-3 gap-1">
                  <div className="h-6 rounded" style={{ background: `hsl(${preset.colors.primary})` }} />
                  <div className="h-6 rounded" style={{ background: `hsl(${preset.colors.secondary})` }} />
                  <div className="h-6 rounded" style={{ background: `hsl(${preset.colors.accent})` }} />
                </div>
              </div>
              <p className="text-white text-sm font-semibold">{preset.nameAr}</p>
              <p className="text-white/60 text-xs">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Background */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            الخلفية (Background)
          </label>
          <input
            type="text"
            value={theme.background || ''}
            onChange={(e) => updateColor('background', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="240 10% 3.9%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme.background})` }} />
        </div>

        {/* Foreground */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            النص الأساسي (Foreground)
          </label>
          <input
            type="text"
            value={theme.foreground || ''}
            onChange={(e) => updateColor('foreground', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="0 0% 98%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme.foreground})` }} />
        </div>

        {/* Primary */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            اللون الأساسي (Primary)
          </label>
          <input
            type="text"
            value={theme.primary || ''}
            onChange={(e) => updateColor('primary', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="0 0% 98%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme.primary})` }} />
        </div>

        {/* Secondary */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            اللون الثانوي (Secondary)
          </label>
          <input
            type="text"
            value={theme.secondary || ''}
            onChange={(e) => updateColor('secondary', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="240 3.7% 15.9%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme.secondary})` }} />
        </div>

        {/* Accent */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            اللون المميز (Accent)
          </label>
          <input
            type="text"
            value={theme.accent || ''}
            onChange={(e) => updateColor('accent', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="240 3.7% 15.9%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme.accent})` }} />
        </div>

        {/* Card */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            البطاقات (Card)
          </label>
          <input
            type="text"
            value={theme.card || ''}
            onChange={(e) => updateColor('card', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="240 10% 3.9%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme.card})` }} />
        </div>

        {/* Card Foreground */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            نص البطاقات (Card Foreground)
          </label>
          <input
            type="text"
            value={theme['card-foreground'] || ''}
            onChange={(e) => updateColor('card-foreground', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="0 0% 98%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme['card-foreground']})` }} />
        </div>

        {/* Muted */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            خلفية مكتومة (Muted)
          </label>
          <input
            type="text"
            value={theme.muted || ''}
            onChange={(e) => updateColor('muted', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="240 3.7% 15.9%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme.muted})` }} />
        </div>

        {/* Muted Foreground */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            نص مكتوم (Muted Foreground)
          </label>
          <input
            type="text"
            value={theme['muted-foreground'] || ''}
            onChange={(e) => updateColor('muted-foreground', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="240 5% 64.9%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme['muted-foreground']})` }} />
        </div>

        {/* Ring */}
        <div className="admin-card rounded-2xl p-6">
          <label className="block text-white font-semibold mb-3">
            حلقة التركيز (Ring)
          </label>
          <input
            type="text"
            value={theme.ring || ''}
            onChange={(e) => updateColor('ring', e.target.value)}
            className="admin-input w-full mb-2"
            placeholder="240 4.9% 83.9%"
          />
          <div className="h-12 rounded-xl" style={{ background: `hsl(${theme.ring})` }} />
        </div>
      </div>

      {/* Instructions */}
      <div className="admin-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">ملاحظات مهمة:</h3>
        <ul className="text-white/70 space-y-2 list-disc list-inside">
          <li>الألوان يجب أن تكون بصيغة HSL (مثال: 240 10% 3.9%)</li>
          <li>استخدم زر "معاينة" لرؤية التغييرات قبل الحفظ</li>
          <li>زر "حفظ" يطبق التغييرات على الموقع بالكامل</li>
          <li>يمكنك استخدام القوالب الجاهزة كنقطة انطلاق</li>
          <li>التغييرات تؤثر على القوالب: Classic, Modern, Minimal, Elegant, Compact, Original</li>
        </ul>
      </div>
    </div>
  );
}
