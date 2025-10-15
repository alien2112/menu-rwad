"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, MessageCircle } from "lucide-react";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url?: string;
  relative_time_description?: string;
}

interface ReviewsSliderProps {
  placeId?: string;
}

export function ReviewsSlider({ placeId }: ReviewsSliderProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Load reviews from API
    const loadReviews = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/reviews');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Convert API data to component format
          const apiReviews = data.data.map((review: any) => ({
            id: review._id,
            author_name: review.author_name,
            rating: review.rating,
            text: review.text,
            time: new Date(review.createdAt).getTime(),
            profile_photo_url: undefined
          }));
          
          setReviews(apiReviews);
        } else {
          setReviews([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('فشل تحميل المراجعات');
        setLoading(false);
      }
    };

    loadReviews();
  }, [placeId]);

  // Auto-play functionality
  useEffect(() => {
    if (reviews.length > 1 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 5000); // Change review every 5 seconds

      return () => clearInterval(interval);
    }
  }, [reviews.length, isHovered]);

  // Reset auto-play when manually navigating
  const handleManualNavigation = (newIndex: number) => {
    setCurrentIndex(newIndex);
    setIsHovered(true); // Pause auto-play temporarily
    setTimeout(() => setIsHovered(false), 2000); // Resume after 2 seconds
  };

  const nextReview = () => {
    if (reviews.length > 1) {
      handleManualNavigation((currentIndex + 1) % reviews.length);
    }
  };

  const prevReview = () => {
    if (reviews.length > 1) {
      handleManualNavigation((currentIndex - 1 + reviews.length) % reviews.length);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "اليوم";
    if (days === 1) return "أمس";
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
    return `منذ ${Math.floor(days / 30)} أشهر`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="glass-notification rounded-3xl p-6 h-64 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm">جاري تحميل المراجعات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-notification rounded-3xl p-6 h-64 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="glass-notification rounded-3xl p-6 h-64 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-sm">لا توجد مراجعات متاحة</p>
        </div>
      </div>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <div 
      className="glass-notification rounded-3xl p-6 h-64 md:h-72 lg:h-80 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4">
          <MessageCircle className="w-16 h-16 text-white" />
        </div>
      </div>

      {/* Navigation Arrows */}
      {reviews.length > 1 && (
        <>
          <button
            onClick={prevReview}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="المراجعة السابقة"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={nextReview}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="المراجعة التالية"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Review Content */}
      <div className="relative z-10 h-full flex flex-col justify-center text-center px-12">
        {/* Profile Photo */}
        <div className="mb-4">
          <div className="w-16 h-16 rounded-full mx-auto border-2 border-white/30 overflow-hidden bg-gradient-to-br from-coffee-gold to-coffee-primary flex items-center justify-center">
            {currentReview.profile_photo_url ? (
              <img
                src={currentReview.profile_photo_url}
                alt={currentReview.author_name}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-white font-bold text-lg">${currentReview.author_name.charAt(0)}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {currentReview.author_name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Author Name */}
        <h3 className="text-white font-bold text-lg mb-2">{currentReview.author_name}</h3>

        {/* Rating */}
        <div className="flex justify-center mb-3">
          {renderStars(currentReview.rating)}
        </div>

        {/* Review Text */}
        <p className="text-white/90 text-sm md:text-base leading-relaxed mb-4 px-4">
          "{currentReview.text}"
        </p>

        {/* Time */}
        <p className="text-white/70 text-xs">
          {currentReview.relative_time_description || formatTime(currentReview.time)}
        </p>
      </div>

      {/* Dots Indicator */}
      {reviews.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => handleManualNavigation(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentIndex 
                  ? "bg-white shadow-lg" 
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`الانتقال إلى المراجعة ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Reviews Badge */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1">
          <MessageCircle className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-medium">مراجعات العملاء</span>
        </div>
      </div>
    </div>
  );
}
