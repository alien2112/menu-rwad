'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { OffersSkeleton } from './SkeletonLoader';
import { OptimizedImage } from './OptimizedImage';

interface Offer {
  _id: string;
  imageId: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
}

export default function OffersSlider() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canGoUp, setCanGoUp] = useState(false);
  const [canGoDown, setCanGoDown] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/homepage?section=offers');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setOffers(data.data);
      } else {
        // Fallback to default
        setOffers([
          {
            _id: '1',
            imageId: '',
            title: 'Spanish Latte Special',
            description: 'خصم 25% على جميع أنواع اللاتيه الإسبانية',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCanGoUp(currentIndex > 0);
    setCanGoDown(currentIndex < offers.length - 1);
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : offers.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < offers.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return <OffersSkeleton />;
  }

  return (
    <div className="space-y-4 relative">
      {/* Up Navigation Button - Always visible and clickable */}
      <div className="flex justify-center mb-4 animate-bounce">
        <button
          onClick={goToPrevious}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
          aria-label="Previous offer"
        >
          <ChevronUp className="text-white" size={24} />
        </button>
      </div>

      {/* Vertical Slider Container */}
      <div className="relative overflow-hidden" style={{ height: '280px' }}>
        <div
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${currentIndex * 280}px)` }}
        >
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="mb-4"
              style={{ height: '276px' }}
            >
              <div className="glass-notification rounded-3xl p-4 h-full flex items-center gap-4">
                {/* Image on the left */}
                <div className="w-32 md:w-40 lg:w-48 h-full rounded-2xl overflow-hidden flex-shrink-0">
                  <OptimizedImage
                    src={offer.imageId ? `/api/images/${offer.imageId}` : '/download (2).jpeg'}
                    alt={offer.title}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    placeholderColor="rgba(255,255,255,0.1)"
                  />
                </div>

                {/* Content on the right */}
                <div className="flex-1 flex flex-col justify-center text-white pr-4">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 arabic-title">
                    {offer.title}
                  </h3>
                  {offer.description && (
                    <p className="text-sm md:text-base lg:text-lg opacity-90 leading-relaxed">
                      {offer.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 my-4">
        {offers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-200 rounded-full ${
              index === currentIndex
                ? 'bg-coffee-green w-6 h-2'
                : 'bg-white/50 hover:bg-white/75 w-2 h-2'
            }`}
            aria-label={`Go to offer ${index + 1}`}
          />
        ))}
      </div>

      {/* Second Offer Card - Static */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="rounded-2xl overflow-hidden h-48 md:h-56 lg:h-64">
          <img
            src="/download.jpeg"
            alt="Coffee Offer"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="col-span-2 glass-notification rounded-3xl h-48 md:h-56 lg:h-64 flex flex-col items-center justify-center text-white">
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 arabic-title">
            عروض خاصة
          </h3>
          <p className="text-sm md:text-base text-center px-4 opacity-90">
            اكتشف عروضنا الحصرية اليومية
          </p>
          <Link href="/offers" className="mt-4">
            <span className="inline-block px-6 py-2 glass-green-button rounded-full text-sm md:text-base font-semibold hover:bg-coffee-green transition-colors">
              عرض المزيد
            </span>
          </Link>
        </div>
      </div>

      {/* Down Navigation Button - Always visible and clickable */}
      <div className="flex justify-center mt-4 animate-bounce">
        <button
          onClick={goToNext}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
          aria-label="Next offer"
        >
          <ChevronDown className="text-white" size={24} />
        </button>
      </div>
    </div>
  );
}
