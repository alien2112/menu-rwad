"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Label } from "@/components/admin/Label";
import { Textarea } from "@/components/admin/Textarea";
import { Badge } from "@/components/admin/Badge";
import { Alert, AlertDescription } from "@/components/admin/Alert";
import { Save, MapPin, Phone, Mail, Clock, Globe, RefreshCw } from "lucide-react";
import { useAlert } from "@/components/ui/alerts";
import { Skeleton } from "@/components/SkeletonLoader";

interface ContactSettings {
  phone: string;
  email: string;
  address: string;
  addressEn?: string;
  workingHours: {
    open: string;
    days: string;
    openEn?: string;
    daysEn?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    whatsapp?: string;
    youtube?: string;
    linkedin?: string;
  };
  mapSettings: {
    latitude: number;
    longitude: number;
    zoom: number;
    mapUrl?: string;
    embedUrl?: string;
    addressQuery?: string;
  };
  additionalInfo?: {
    description?: string;
    descriptionEn?: string;
    specialInstructions?: string;
    specialInstructionsEn?: string;
  };
  isActive: boolean;
}

export default function ContactSettingsPanel() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchSettings();
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/contact-settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        showError('فشل في تحميل إعدادات الاتصال');
      }
    } catch (error) {
      showError('حدث خطأ أثناء تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/contact-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      if (data.success) {
        showSuccess('تم حفظ إعدادات الاتصال بنجاح');
        setSettings(data.data);
      } else {
        showError(data.error || 'فشل في حفظ الإعدادات');
      }
    } catch (error) {
      showError('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (field: string, value: any) => {
    if (!settings) return;
    
    const keys = field.split('.');
    const newSettings = { ...settings };
    
    if (keys.length === 1) {
      newSettings[keys[0] as keyof ContactSettings] = value;
    } else if (keys.length === 2) {
      (newSettings as any)[keys[0]][keys[1]] = value;
    } else if (keys.length === 3) {
      (newSettings as any)[keys[0]][keys[1]][keys[2]] = value;
    }
    
    setSettings(newSettings);
  };

  const generateMapUrl = () => {
    if (!settings?.mapSettings?.addressQuery) return;
    const query = encodeURIComponent(settings.mapSettings.addressQuery);
    updateSettings('mapSettings.mapUrl', `https://www.google.com/maps?q=${query}`);
    updateSettings('mapSettings.embedUrl', `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${query}`);
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 rounded animate-pulse" />
          <div className="h-10 w-32 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-card rounded-xl p-6">
              <div className="h-6 w-48 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-10 w-full rounded-lg animate-pulse" />
                <div className="h-10 w-full rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="admin-card rounded-xl p-6">
          <div className="h-6 w-40 rounded animate-pulse mb-4" />
          <div className="h-40 w-full rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert>
        <AlertDescription>
          فشل في تحميل إعدادات الاتصال. يرجى المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">إعدادات صفحة الاتصال</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            معلومات الاتصال الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => updateSettings('phone', e.target.value)}
                placeholder="مثال: 966567833138"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => updateSettings('email', e.target.value)}
                placeholder="مثال: info@maraksh.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">العنوان (عربي)</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => updateSettings('address', e.target.value)}
              placeholder="مثال: المدينة المنورة - حي النبلاء"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressEn">العنوان (إنجليزي)</Label>
            <Input
              id="addressEn"
              value={settings.addressEn || ''}
              onChange={(e) => updateSettings('addressEn', e.target.value)}
              placeholder="Example: Al Madinah Al Munawwarah - Al Nubala District"
            />
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            ساعات العمل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workingHours.open">ساعات العمل (عربي)</Label>
              <Input
                id="workingHours.open"
                value={settings.workingHours.open}
                onChange={(e) => updateSettings('workingHours.open', e.target.value)}
                placeholder="مثال: من 8:00 صباحاً إلى 12:00 منتصف الليل"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHours.openEn">ساعات العمل (إنجليزي)</Label>
              <Input
                id="workingHours.openEn"
                value={settings.workingHours.openEn || ''}
                onChange={(e) => updateSettings('workingHours.openEn', e.target.value)}
                placeholder="Example: From 8:00 AM to 12:00 AM"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workingHours.days">أيام العمل (عربي)</Label>
              <Input
                id="workingHours.days"
                value={settings.workingHours.days}
                onChange={(e) => updateSettings('workingHours.days', e.target.value)}
                placeholder="مثال: يومياً"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingHours.daysEn">أيام العمل (إنجليزي)</Label>
              <Input
                id="workingHours.daysEn"
                value={settings.workingHours.daysEn || ''}
                onChange={(e) => updateSettings('workingHours.daysEn', e.target.value)}
                placeholder="Example: Daily"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            روابط وسائل التواصل الاجتماعي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={settings.socialMedia.facebook || ''}
                onChange={(e) => updateSettings('socialMedia.facebook', e.target.value)}
                placeholder="https://www.facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={settings.socialMedia.instagram || ''}
                onChange={(e) => updateSettings('socialMedia.instagram', e.target.value)}
                placeholder="https://www.instagram.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                value={settings.socialMedia.twitter || ''}
                onChange={(e) => updateSettings('socialMedia.twitter', e.target.value)}
                placeholder="https://x.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={settings.socialMedia.tiktok || ''}
                onChange={(e) => updateSettings('socialMedia.tiktok', e.target.value)}
                placeholder="https://www.tiktok.com/@yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={settings.socialMedia.whatsapp || ''}
                onChange={(e) => updateSettings('socialMedia.whatsapp', e.target.value)}
                placeholder="https://wa.me/966567833138"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={settings.socialMedia.youtube || ''}
                onChange={(e) => updateSettings('socialMedia.youtube', e.target.value)}
                placeholder="https://www.youtube.com/channel/yourchannel"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            إعدادات الخريطة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">خط العرض</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={settings.mapSettings.latitude}
                onChange={(e) => updateSettings('mapSettings.latitude', parseFloat(e.target.value))}
                placeholder="24.4672"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">خط الطول</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={settings.mapSettings.longitude}
                onChange={(e) => updateSettings('mapSettings.longitude', parseFloat(e.target.value))}
                placeholder="39.6142"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoom">مستوى التكبير</Label>
              <Input
                id="zoom"
                type="number"
                min="1"
                max="20"
                value={settings.mapSettings.zoom}
                onChange={(e) => updateSettings('mapSettings.zoom', parseInt(e.target.value))}
                placeholder="15"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressQuery">استعلام العنوان للخريطة</Label>
            <div className="flex gap-2">
              <Input
                id="addressQuery"
                value={settings.mapSettings.addressQuery || ''}
                onChange={(e) => updateSettings('mapSettings.addressQuery', e.target.value)}
                placeholder="المدينة المنورة - حي النبلاء"
                className="flex-1"
              />
              <Button
                onClick={generateMapUrl}
                variant="outline"
                size="sm"
              >
                توليد رابط الخريطة
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mapUrl">رابط الخريطة</Label>
            <Input
              id="mapUrl"
              value={settings.mapSettings.mapUrl || ''}
              onChange={(e) => updateSettings('mapSettings.mapUrl', e.target.value)}
              placeholder="https://www.google.com/maps?q=..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات إضافية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">الوصف (عربي)</Label>
            <Textarea
              id="description"
              value={settings.additionalInfo?.description || ''}
              onChange={(e) => updateSettings('additionalInfo.description', e.target.value)}
              placeholder="وصف قصير عن المطعم..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descriptionEn">الوصف (إنجليزي)</Label>
            <Textarea
              id="descriptionEn"
              value={settings.additionalInfo?.descriptionEn || ''}
              onChange={(e) => updateSettings('additionalInfo.descriptionEn', e.target.value)}
              placeholder="Short description about the restaurant..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
