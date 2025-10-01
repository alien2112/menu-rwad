"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";

interface Offer {
  _id: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_item';
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  image?: string;
  color?: string;
  buyQuantity?: number;
  getQuantity?: number;
  freeItemId?: string;
  code?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  usageLimit?: number;
  usedCount: number;
  order: number;
}

export default function Offers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers');
      const data = await response.json();
      
      if (data.success) {
        // Filter only active offers
        const activeOffers = data.data.filter((offer: Offer) => 
          offer.status === 'active' && 
          new Date(offer.endDate) > new Date()
        );
        setOffers(activeOffers);
      } else {
        setError('Failed to fetch offers');
      }
    } catch (err) {
      setError('Error loading offers');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatOfferText = (offer: Offer) => {
    switch (offer.type) {
      case 'percentage':
        return `خصم ${offer.discountValue}%`;
      case 'fixed':
        return `خصم ${offer.discountValue} ريال`;
      case 'buy_x_get_y':
        return `اشترِ ${offer.buyQuantity} واحصل على ${offer.getQuantity} مجاناً`;
      case 'free_item':
        return 'عنصر مجاني';
      default:
        return offer.title;
    }
  };

  const getImageUrl = (imageId?: string) => {
    if (!imageId) return null;
    return `/api/images/${imageId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-primary relative overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="relative z-10 mobile-container bg-coffee-primary coffee-shadow min-h-screen">
          <div className="px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-white text-lg">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-coffee-primary relative overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="relative z-10 mobile-container bg-coffee-primary coffee-shadow min-h-screen">
          <div className="px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-white text-lg">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-primary relative overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10 mobile-container bg-coffee-primary coffee-shadow min-h-screen">
        <div className="px-6 py-8">
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

          <h1 className="text-white text-center text-3xl mb-8 section-title">العروض الخاصة</h1>

          {offers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-white text-lg">لا توجد عروض متاحة حالياً</p>
            </div>
          ) : (
            <div className="space-y-6">
              {offers.map((offer) => (
                <div key={offer._id} className="glass-notification rounded-3xl p-6">
                  {offer.image && (
                    <img
                      src={getImageUrl(offer.image) || ''}
                      alt={offer.title}
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white text-xl font-bold">{offer.title}</h3>
                    {offer.code && (
                      <span className="text-coffee-gold text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">
                        {offer.code}
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 text-sm mb-3">
                    {formatOfferText(offer)}
                  </p>
                  {offer.description && (
                    <p className="text-white/70 text-xs mb-2">{offer.description}</p>
                  )}
                  {offer.minPurchase && offer.minPurchase > 0 && (
                    <p className="text-white/60 text-xs">
                      الحد الأدنى للشراء: {offer.minPurchase} ريال
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-4 text-xs text-white/60">
                    <span>
                      ينتهي في: {new Date(offer.endDate).toLocaleDateString('ar-SA')}
                    </span>
                    {offer.usageLimit && (
                      <span>
                        متبقي: {offer.usageLimit - offer.usedCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
