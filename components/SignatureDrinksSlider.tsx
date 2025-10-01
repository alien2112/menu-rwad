'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SignatureDrinksSkeleton } from './SkeletonLoader';

interface Drink {
  _id: string;
  imageId: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  order: number;
  status: 'active' | 'inactive';
}

export default function SignatureDrinksSlider() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      const res = await fetch('/api/signature-drinks', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();

      if (data.success && data.data.length > 0) {
        const drinksList = data.data as Drink[];
        const activeDrinks = drinksList
          .filter((drink) => drink.status !== 'inactive')
          .slice(0, 4); // Limit to 4 drinks

        setDrinks(activeDrinks);
      } else {
        // Fallback to default
        setDrinks([
          {
            _id: '1',
            imageId: '',
            title: 'قهوة خاصة',
            titleEn: 'Special Coffee',
            description: 'مزيجنا المميز من حبوب البن الفاخرة',
            descriptionEn: 'Our signature blend with premium beans',
            order: 0,
            status: 'active'
          },
          {
            _id: '2',
            imageId: '',
            title: 'لاتيه حرفي',
            titleEn: 'Artisan Latte',
            description: 'كريمي ومتوازن بشكل مثالي',
            descriptionEn: 'Creamy and perfectly balanced',
            order: 1,
            status: 'active'
          },
        ]);
      }
    } catch (error) {
      console.error('[SignatureDrinks] Error fetching drinks:', error);
      setDrinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrinkClick = (drink: Drink) => {
    setSelectedDrink(drink);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDrink(null);
  };

  if (loading) {
    return <SignatureDrinksSkeleton />;
  }

  if (drinks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 glass-effect rounded-3xl">
        <div className="text-center">
          <p className="text-white text-lg mb-2">لا توجد مشروبات مميزة</p>
          <p className="text-white/60 text-sm">يرجى إضافة مشروبات من لوحة الإدارة</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Grid Container - Always one slide with vertical split */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {drinks.map((drink) => (
            <div
              key={drink._id}
              onClick={() => handleDrinkClick(drink)}
              className="glass-effect rounded-3xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 group"
            >
              <div className="relative h-64">
                 <img
                   src={drink.imageId ? `/api/images/${drink.imageId}` : '/second-section-first-image.jpeg'}
                   alt={drink.title}
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                   loading="eager"
                   fetchPriority="high"
                   decoding="async"
                   onError={(e) => {
                     const target = e.currentTarget as HTMLImageElement;
                     if (!target.dataset.fallbackAttempted) {
                       target.dataset.fallbackAttempted = 'true';
                       target.src = '/second-section-first-image.jpeg';
                     }
                   }}
                 />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <span className="text-white font-semibold text-sm">انقر للمزيد</span>
                </div>
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2 arabic-title">
                  {drink.title}
                </h3>
                {drink.titleEn && (
                  <p className="text-white/70 text-sm">
                    {drink.titleEn}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDrink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="glass-effect rounded-3xl p-8 w-full max-w-3xl border border-white/20 max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="text-white" size={20} />
            </button>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="w-full md:w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
                   <img
                     src={selectedDrink.imageId ? `/api/images/${selectedDrink.imageId}` : '/second-section-first-image.jpeg'}
                     alt={selectedDrink.title}
                     className="w-full h-full object-cover"
                     loading="eager"
                     fetchPriority="high"
                     decoding="async"
                     onError={(e) => {
                       const target = e.currentTarget as HTMLImageElement;
                       if (!target.dataset.fallbackAttempted) {
                         target.dataset.fallbackAttempted = 'true';
                         target.src = '/second-section-first-image.jpeg';
                       }
                     }}
                   />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-3 arabic-title">
                    {selectedDrink.title}
                  </h2>
                  {selectedDrink.titleEn && (
                    <p className="text-2xl text-white/80 font-medium">
                      {selectedDrink.titleEn}
                    </p>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-coffee-green to-transparent"></div>

                {/* Arabic Description */}
                {selectedDrink.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-coffee-green mb-3">
                      الوصف (عربي)
                    </h3>
                    <p className="text-white/90 leading-relaxed text-lg">
                      {selectedDrink.description}
                    </p>
                  </div>
                )}

                {/* English Description */}
                {selectedDrink.descriptionEn && (
                  <div>
                    <h3 className="text-lg font-semibold text-coffee-green mb-3">
                      Description (English)
                    </h3>
                    <p className="text-white/90 leading-relaxed text-lg">
                      {selectedDrink.descriptionEn}
                    </p>
                  </div>
                )}

                {!selectedDrink.description && !selectedDrink.descriptionEn && (
                  <div className="text-white/50 text-center py-8">
                    لا يوجد وصف متاح
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
