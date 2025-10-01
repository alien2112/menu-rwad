'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface JourneyImage {
  _id: string;
  imageId: string;
  imageUrl?: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  journeyPosition?: 'left' | 'right';
  order: number;
  status?: 'active' | 'inactive';
}

export default function JourneySection() {
  const [journeyImages, setJourneyImages] = useState<JourneyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const journeyRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetchJourneyImages();
    
    // Refresh every 30 seconds to pick up new images
    const interval = setInterval(fetchJourneyImages, 30000);
    
    return () => {
      clearInterval(interval);
      // Cleanup ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Set up GSAP animations when journeyImages change
  useEffect(() => {
    if (journeyImages.length > 0) {
      setTimeout(() => {
        // Clean up existing ScrollTrigger instances
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        setupGSAPAnimations(journeyImages);
      }, 300);
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [journeyImages]);

  const fetchJourneyImages = async () => {
    try {
      const res = await fetch(`/api/homepage?section=journey&t=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();

      if (data.success && data.data.length > 0) {
        const list = data.data as JourneyImage[];
        const active = list.filter((d) => d.status !== 'inactive');
        const resolved = active.length > 0 ? active : list;

        // Sort by order
        resolved.sort((a, b) => a.order - b.order);
        setJourneyImages(resolved);
      } else {
        setJourneyImages([]);
      }
    } catch (error) {
      console.error('[Journey] Error fetching images:', error);
      setJourneyImages([]);
    } finally {
      setLoading(false);
    }
  };

  const setupGSAPAnimations = (images: JourneyImage[]) => {
    if (typeof window === 'undefined') {
      return;
    }

    // Set initial states for journey sections with specific directions
    images.forEach((image, index) => {
      const ref = journeyRefs.current[index];
      if (ref) {
        const isLeft = image.journeyPosition === 'left';
        
        // Set initial state
        gsap.set(ref, {
          opacity: 0,
          x: isLeft ? 100 : -100, // Start from right for left position, left for right position
        });
        
        // Create ScrollTrigger animation
        gsap.to(ref, {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref,
            start: "top 80%", // Start animation when element is 80% down the viewport
            end: "bottom 20%", // End when element is 20% up the viewport
            toggleActions: "play none none reverse", // Play on enter, reverse on leave
            once: false, // Allow animation to replay if scrolling back up
          }
        });
      }
    });
  };

  const getImageUrl = (image: JourneyImage) => {
    // All images are now GridFS images
    if (image.imageId) {
      return `/api/images/${image.imageId}`;
    }
    // Fallback to imageUrl if no imageId
    return image.imageUrl || '/Cafea boabe.jpeg';
  };

  if (loading) {
    return (
      <div className="px-6 space-y-8 md:px-8 lg:px-12">
        <div className="glass-notification rounded-3xl p-6 h-48 md:h-56 lg:h-64">
          <div className="flex items-center justify-center h-full">
            <p className="text-white">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (journeyImages.length === 0) {
    return (
      <div className="px-6 space-y-8 md:px-8 lg:px-12">
        <div className="glass-notification rounded-3xl p-6 h-48 md:h-56 lg:h-64">
          <div className="flex items-center justify-center h-full">
            <p className="text-white text-center">
              لا توجد صور للرحلة حالياً<br />
              <span className="text-white/60 text-sm">يرجى إضافة صور من لوحة الإدارة</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-8 md:px-8 lg:px-12">
      {journeyImages.map((image, index) => {
        const imgUrl = getImageUrl(image);
        const isLeft = image.journeyPosition === 'left';
        
        return (
          <div 
            key={image._id} 
            ref={(el) => {
              journeyRefs.current[index] = el;
            }}
            className="glass-notification rounded-3xl p-6 h-48 md:h-56 lg:h-64"
          >
            <div className="grid grid-cols-3 gap-4 h-full">
              {isLeft ? (
                <>
                  {/* Image on left */}
                  <img
                    src={imgUrl}
                    alt={image.title}
                    className="w-full h-36 md:h-44 lg:h-52 object-cover rounded-3xl shadow-lg"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      // Only log error if we haven't already tried the fallback
                      if (!target.dataset.fallbackAttempted) {
                        console.warn(`[Journey] Image failed to load: ${imgUrl}, trying fallback...`);
                        const fallback = image.imageUrl || '/Cafea boabe.jpeg';
                        if (fallback !== imgUrl) {
                          target.dataset.fallbackAttempted = 'true';
                          target.src = fallback;
                        }
                      } else {
                        console.error(`[Journey] Both image and fallback failed to load for: ${image.title}`);
                      }
                    }}
                    onLoad={(e) => {
                      // Clear any fallback attempt flag on successful load
                      const target = e.currentTarget as HTMLImageElement;
                      delete target.dataset.fallbackAttempted;
                    }}
                  />
                  {/* Text on right */}
                  <div className="col-span-2 flex flex-col justify-center text-white text-xs md:text-sm lg:text-base leading-5">
                    <h3 className="font-bold mb-2 text-sm md:text-base lg:text-lg">{image.title}</h3>
                    <p className="text-right">
                      {image.description || 'وصف القصة...'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Text on left */}
                  <div className="col-span-2 flex flex-col justify-center text-white text-xs md:text-sm lg:text-base leading-5">
                    <h3 className="font-bold mb-2 text-sm md:text-base lg:text-lg text-right">{image.title}</h3>
                    <p className="text-right">
                      {image.description || 'وصف القصة...'}
                    </p>
                  </div>
                  {/* Image on right */}
                  <img
                    src={imgUrl}
                    alt={image.title}
                    className="w-full h-36 md:h-44 lg:h-52 object-cover rounded-3xl shadow-lg"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      // Only log error if we haven't already tried the fallback
                      if (!target.dataset.fallbackAttempted) {
                        console.warn(`[Journey] Image failed to load: ${imgUrl}, trying fallback...`);
                        const fallback = image.imageUrl || '/download (4).jpeg';
                        if (fallback !== imgUrl) {
                          target.dataset.fallbackAttempted = 'true';
                          target.src = fallback;
                        }
                      } else {
                        console.error(`[Journey] Both image and fallback failed to load for: ${image.title}`);
                      }
                    }}
                    onLoad={(e) => {
                      // Clear any fallback attempt flag on successful load
                      const target = e.currentTarget as HTMLImageElement;
                      delete target.dataset.fallbackAttempted;
                    }}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
