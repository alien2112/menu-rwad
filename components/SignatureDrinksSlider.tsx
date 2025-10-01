'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Drink {
  _id: string;
  imageId: string;
  title: string;
  titleEn?: string;
}

export default function SignatureDrinksSlider() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      const res = await fetch('/api/homepage?section=signature-drinks');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setDrinks(data.data);
      } else {
        // Fallback to default images if no data
        setDrinks([
          {
            _id: '1',
            imageId: '',
            title: 'Special Coffee',
            titleEn: 'Special Coffee',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching drinks:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? drinks.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === drinks.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72 glass-effect rounded-3xl">
        <p className="text-white">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Slider Container */}
      <div className="relative overflow-hidden rounded-3xl" style={{ height: '280px' }}>
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(${currentIndex * -100}%)` }}
        >
          {drinks.map((drink) => (
            <div
              key={drink._id}
              className="min-w-full h-full relative"
            >
              <img
                src={drink.imageId ? `/api/images/${drink.imageId}` : '/second-section-first-image.jpeg'}
                alt={drink.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
          aria-label="Previous drink"
        >
          <ChevronLeft className="text-coffee-primary" size={24} />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
          aria-label="Next drink"
        >
          <ChevronRight className="text-coffee-primary" size={24} />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {drinks.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
