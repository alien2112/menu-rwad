"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { AlertDialog } from "@/components/AlertDialog";
import { Skeleton } from "@/components/SkeletonLoader";

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onLocationChange: (location: { lat: number; lng: number; address?: string }) => void;
  height?: string;
}

export const LocationPicker = ({
  initialLocation,
  onLocationChange,
  height = "400px",
}: LocationPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Dynamically load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Dynamically load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;

    script.onload = () => {
      initializeMap();
    };

    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !window.L) return;

    const defaultLocation = initialLocation || { lat: 24.7136, lng: 46.6753 }; // Riyadh, Saudi Arabia

    // Initialize map
    const map = window.L.map(mapContainer.current).setView(
      [defaultLocation.lat, defaultLocation.lng],
      13
    );

    // Add OpenStreetMap tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create custom icon
    const customIcon = window.L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Add marker
    const marker = window.L.marker([defaultLocation.lat, defaultLocation.lng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);

    marker.bindPopup("اسحب العلامة لتحديد الموقع").openPopup();

    // Handle marker drag
    marker.on("dragend", async function () {
      const position = marker.getLatLng();
      await reverseGeocode(position.lat, position.lng);
    });

    // Handle map click
    map.on("click", async function (e: any) {
      marker.setLatLng(e.latlng);
      await reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    setIsLoading(false);

    // If we have an initial location, get its address
    if (initialLocation) {
      reverseGeocode(initialLocation.lat, initialLocation.lng);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      onLocationChange({
        lat,
        lng,
        address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      onLocationChange({
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    setSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);

        // Update map and marker
        mapRef.current.setView([latNum, lngNum], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([latNum, lngNum]);
        }

        onLocationChange({
          lat: latNum,
          lng: lngNum,
          address: display_name,
        });
      } else {
        showAlert("خطأ", "الموقع غير موجود. حاول مرة أخرى");
      }
    } catch (error) {
      console.error("Search error:", error);
      showAlert("خطأ", "فشل البحث. حاول مرة أخرى");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن موقع (مثل: الرياض، شارع الملك فهد)"
            className="w-full pr-10 pl-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={searching || !searchQuery.trim()}
          className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
        >
          {searching ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>بحث</span>
            </>
          )}
        </button>
      </form>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-border">
        {isLoading && (
          <div
            className="absolute inset-0 bg-card flex items-center justify-center z-10"
            style={{ height }}
          >
            <div className="text-center">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        )}
        <div ref={mapContainer} style={{ height, width: "100%" }} />
      </div>

      {/* Instructions */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-card/50 p-3 rounded-lg border border-border">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          اسحب العلامة أو انقر على الخريطة لتحديد الموقع. يمكنك أيضاً البحث عن عنوان محدد.
        </p>
      </div>
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
      />
    </div>
  );
};

// Type declaration for Leaflet
declare global {
  interface Window {
    L: any;
  }
}
