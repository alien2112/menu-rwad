"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import Image from "next/image";

interface Offer {
  _id: string;
  imageId: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  order: number;
  status: 'active' | 'inactive';
}

export default function Offers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/homepage?section=offers');
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setOffers(data.data);
      } else {
        // Fallback to default offers if none found
        setOffers([
          {
            _id: '1',
            imageId: '',
            title: 'Spanish Latte Special',
            titleEn: 'Spanish Latte Special',
            description: 'خصم 25% على جميع أنواع اللاتيه الإسبانية',
            descriptionEn: '25% off on all Spanish Latte varieties',
            order: 1,
            status: 'active'
          },
          {
            _id: '2',
            imageId: '',
            title: 'عرض القهوة المختصة',
            titleEn: 'Specialty Coffee Offer',
            description: 'تذوق أفضل أنواع القهوة المختصة بأسعار مميزة',
            descriptionEn: 'Taste the finest specialty coffee at special prices',
            order: 2,
            status: 'active'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 relative overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 container mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-white text-lg">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 relative overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-8">
        {/* Hamburger Menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-8 left-6 z-20"
        >
          <div className="w-4 h-4 flex flex-col justify-between">
            <div className="w-full h-0 border-t border-white"></div>
            <div className="w-full h-0 border-t border-white"></div>
            <div className="w-full h-0 border-t border-white"></div>
          </div>
        </button>

        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">العروض الخاصة</h1>
          <p className="text-white/80">اكتشف أفضل العروض المتاحة حالياً</p>
        </header>

        {offers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-white text-2xl mb-2">لا توجد عروض متاحة حالياً</p>
              <p className="text-white/70">تحقق مرة أخرى قريباً للحصول على أفضل العروض!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer, idx) => (
              <div 
                key={offer._id} 
                className="stagger-fade glass-notification rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Offer Image */}
                <div className="relative h-48 md:h-56 lg:h-64">
                  <Image
                    src={offer.imageId ? `/api/images/${offer.imageId}` : '/download (2).jpeg'}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>

                {/* Offer Content */}
                <div className="p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 arabic-title">
                    {offer.title}
                  </h3>
                  {offer.titleEn && (
                    <p className="text-white/70 text-sm mb-3">{offer.titleEn}</p>
                  )}
                  {offer.description && (
                    <p className="text-white/90 text-sm md:text-base leading-relaxed mb-4">
                      {offer.description}
                    </p>
                  )}
                  {offer.descriptionEn && (
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                      {offer.descriptionEn}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
