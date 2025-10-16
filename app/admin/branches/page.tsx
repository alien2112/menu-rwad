"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Map as MapIcon,
  Grid3X3,
  Star,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/SkeletonLoader";

interface Branch {
  _id: string;
  name: string;
  nameEn?: string;
  slug: string;
  address: string;
  phone: string;
  email?: string;
  location?: {
    lat: number;
    lng: number;
  };
  isMainBranch: boolean;
  isActive: boolean;
  isOpenNow?: boolean;
  status: 'active' | 'inactive' | 'coming_soon';
  createdAt: string;
}

export default function BranchesPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (viewMode === 'map' && branches.length > 0) {
      initializeMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
  }, [viewMode, branches]);

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/branches");
      const data = await response.json();

      if (data.success) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      showMessage("error", "فشل تحميل الفروع");
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || mapRef.current || !window.L) return;

    const branchesWithLocation = branches.filter(b => b.location?.lat && b.location?.lng);

    if (branchesWithLocation.length === 0) {
      return;
    }

    // Calculate center
    const avgLat = branchesWithLocation.reduce((sum, b) => sum + (b.location?.lat || 0), 0) / branchesWithLocation.length;
    const avgLng = branchesWithLocation.reduce((sum, b) => sum + (b.location?.lng || 0), 0) / branchesWithLocation.length;

    // Initialize map
    const map = window.L.map(mapContainer.current).setView([avgLat, avgLng], 12);

    // Add tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add markers
    branchesWithLocation.forEach(branch => {
      if (!branch.location) return;

      const iconHtml = `
        <div style="
          background: ${branch.isMainBranch ? '#FFD700' : '#00BF89'};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-center;
        ">
          <div style="transform: rotate(45deg); color: white; font-weight: bold;">
            ${branch.isMainBranch ? '⭐' : '📍'}
          </div>
        </div>
      `;

      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = window.L.marker([branch.location.lat, branch.location.lng], {
        icon: customIcon,
      }).addTo(map);

      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #333;">${branch.name}</h3>
          ${branch.isMainBranch ? '<span style="background: #FFD700; color: #000; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">الفرع الرئيسي</span>' : ''}
          <p style="margin: 8px 0 4px 0; font-size: 13px; color: #666;">📍 ${branch.address}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #666;">📞 ${branch.phone}</p>
          ${branch.isOpenNow ? '<p style="margin: 4px 0; color: green; font-size: 12px;">🟢 مفتوح الآن</p>' : '<p style="margin: 4px 0; color: red; font-size: 12px;">🔴 مغلق الآن</p>'}
          <button onclick="window.location.href='/admin/branches/${branch._id}'" style="
            margin-top: 8px;
            width: 100%;
            padding: 6px 12px;
            background: #00BF89;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
          ">تعديل الفرع</button>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = window.L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    mapRef.current = map;
  };

  const handleDelete = async (id: string, isMainBranch: boolean) => {
    if (isMainBranch) {
      showMessage("error", "لا يمكن حذف الفرع الرئيسي");
      return;
    }

    if (!confirm("هل أنت متأكد من حذف هذا الفرع؟")) return;

    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "تم حذف الفرع بنجاح");
        fetchBranches();
      } else {
        showMessage("error", data.error || "فشل حذف الفرع");
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      showMessage("error", "حدث خطأ أثناء الحذف");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    // Load Leaflet CSS and JS for map view
    if (viewMode === 'map') {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, [viewMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-12 w-36 rounded-lg" />
          </div>
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الفروع</h1>
            <p className="text-muted-foreground">
              قم بإدارة فروع المطعم المختلفة ومواقعها
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/branches/new")}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            <Plus className="w-5 h-5" />
            إضافة فرع جديد
          </button>
        </div>

        {/* Success/Error Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-6 bg-card rounded-lg p-1 w-fit border border-border">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            عرض الشبكة
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              viewMode === 'map'
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            عرض الخريطة
          </button>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">لا توجد فروع بعد</p>
                <p className="text-muted-foreground/70 text-sm mt-2">ابدأ بإضافة فرع جديد</p>
              </div>
            ) : (
              branches.map((branch) => (
                <motion.div
                  key={branch._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-xl p-6 border border-card-foreground/10 hover:border-primary/30 transition-all relative overflow-hidden"
                >
                  {/* Main Branch Badge */}
                  {branch.isMainBranch && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      رئيسي
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      branch.status === 'active'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : branch.status === 'coming_soon'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {branch.status === 'active'
                        ? branch.isOpenNow ? '🟢 مفتوح الآن' : '🔴 مغلق الآن'
                        : branch.status === 'coming_soon'
                        ? 'قريباً'
                        : 'غير نشط'}
                    </span>
                  </div>

                  {/* Branch Name */}
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {branch.name}
                  </h3>
                  {branch.nameEn && (
                    <p className="text-sm text-muted-foreground mb-4">{branch.nameEn}</p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                    {branch.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{branch.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-card-foreground/10">
                    <button
                      onClick={() => router.push(`/admin/branches/${branch._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-2 px-4 rounded-lg text-sm font-medium transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(branch._id, branch.isMainBranch)}
                      disabled={branch.isMainBranch}
                      className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {branches.filter(b => b.location?.lat && b.location?.lng).length === 0 ? (
              <div className="p-12 text-center">
                <MapIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">لا توجد فروع بمواقع محددة</p>
                <p className="text-muted-foreground/70 text-sm mt-2">
                  قم بإضافة موقع للفروع لعرضها على الخريطة
                </p>
              </div>
            ) : (
              <div ref={mapContainer} style={{ height: '600px', width: '100%' }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
