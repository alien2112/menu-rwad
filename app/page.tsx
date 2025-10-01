"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { NotificationCard } from "@/components/NotificationCard";
import { Sidebar } from "@/components/Sidebar";
import SignatureDrinksSlider from "@/components/SignatureDrinksSlider";
import OffersSlider from "@/components/OffersSlider";
import JourneySection from "@/components/JourneySection";
import { CartIcon, CartModal } from "@/components/CartComponents";
import ErrorBoundary, { SignatureDrinksErrorFallback, OffersErrorFallback, JourneyErrorFallback } from "@/components/ErrorBoundary";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register the ScrollTo plugin only on client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin);
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Preload critical images
  useEffect(() => {
    const criticalImages = [
      '/second-section-first-image.jpeg',
      '/Cafea boabe.jpeg',
      // Add other critical images here
    ];
    
    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [categoryIds, setCategoryIds] = useState<Record<string, string>>({});
  const [featuredCategories, setFeaturedCategories] = useState<Array<{ _id: string; name: string; nameEn?: string; image?: string; icon?: string; color?: string }>>([]);
  const FEATURED_CACHE_KEY = 'home_featured_categories_cache_v1';
  const FEATURED_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  
  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const brandLogoRef = useRef<HTMLImageElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const contentCardsRef = useRef<HTMLDivElement>(null);
  const signatureSectionRef = useRef<HTMLDivElement>(null);
  const offersSectionRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  // Refs for inner cards in the second section
  const textCard1Ref = useRef<HTMLDivElement>(null);
  const textCard2Ref = useRef<HTMLDivElement>(null);
  const textCard3Ref = useRef<HTMLDivElement>(null);

  // Fetch locations data
  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLocationsLoading(false);
    }
  };

  // Fetch categories for dynamic links
  const fetchCategoryIds = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const categories = data.data as Array<{ _id: string; name?: string; nameEn?: string }>;

        const normalize = (v?: string) => (v || '').toLowerCase().trim();
        const toSlug = (v?: string) => normalize(v).replace(/\s+/g, '-');
        const matchesAny = (cat: { name?: string; nameEn?: string }, names: string[], partial: boolean = false) => {
          const n = normalize(cat.name);
          const e = normalize(cat.nameEn);
          const ns = toSlug(cat.name);
          const es = toSlug(cat.nameEn);
          if (partial) {
            return names.some(x => n.includes(x) || e.includes(x) || ns.includes(x) || es.includes(x));
          }
          return names.some(x => n === x || e === x || ns === x || es === x);
        };

        const map: Record<string, string> = {};

        // Cold Coffee
        const cold = categories.find(c => matchesAny(c, [
          'cold coffee',
          'iced coffee',
          'قهوة باردة'
        ], true));
        if (cold) map['coldCoffee'] = cold._id;

        // Hot Coffee
        const hot = categories.find(c => matchesAny(c, [
          'hot coffee',
          'قهوة ساخنة',
          'hot drinks',
          'مشروبات ساخنة'
        ], true));
        if (hot) map['hotCoffee'] = hot._id;

        // Tea
        const tea = categories.find(c => matchesAny(c, [
          'tea',
          'الشاي',
          'شاي'
        ], true));
        if (tea) map['tea'] = tea._id;

        // Natural Juices
        const juices = categories.find(c => matchesAny(c, [
          'natural juices',
          'juices',
          'عصائر طبيعية',
          'عصائر'
        ], true));
        if (juices) map['naturalJuices'] = juices._id;

        // Drinks (generic)
        const drinks = categories.find(c => matchesAny(c, [
          'drinks',
          'beverages',
          'مشروبات'
        ], true));
        if (drinks) map['drinks'] = drinks._id;

        // Water
        const water = categories.find(c => matchesAny(c, [
          'water',
          'waters',
          'ماء',
          'مياه'
        ], true));
        if (water) map['water'] = water._id;

        // Special Drinks / Signature
        const special = categories.find(c => matchesAny(c, [
          'special drinks',
          'special beverages',
          'signature drinks',
          'signature',
          'special',
          'مشروبات خاصة'
        ], true));
        if (special) map['special'] = special._id;

        setCategoryIds(map);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch featured categories for homepage grid
  const fetchFeaturedCategories = async () => {
    try {
      const now = Date.now();
      const cachedRaw = typeof window !== 'undefined' ? localStorage.getItem(FEATURED_CACHE_KEY) : null;
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw) as { ts: number; items: any[] };
          if (cached && Array.isArray(cached.items) && now - cached.ts < FEATURED_CACHE_TTL_MS) {
            setFeaturedCategories(cached.items);
            return;
          }
        } catch {}
      }

      const response = await fetch('/api/categories?featured=true&limit=8', { cache: 'no-store' });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setFeaturedCategories(data.data);
        try {
          localStorage.setItem(FEATURED_CACHE_KEY, JSON.stringify({ ts: now, items: data.data }));
        } catch {}
      }
    } catch (error) {
      console.error('Error fetching featured categories:', error);
    }
  };

  // Handle location modal interactions
  const handleLocationClick = (location: any) => {
    setSelectedLocation(location);
    setShowLocationModal(true);
  };

  const handleLocationTouchStart = (location: any) => {
    setSelectedLocation(location);
    setShowLocationModal(true);
  };

  const handleLocationTouchEnd = () => {
    // Delay hiding to allow user to see the modal
    setTimeout(() => {
      setShowLocationModal(false);
      setSelectedLocation(null);
    }, 2000);
  };

  // Render location images based on count
  const renderLocationImages = () => {
    if (locationsLoading || locations.length === 0) {
      return (
        <div className="absolute" style={{ top: '80px', left: '16px', right: '16px' }}>
          {/* Default single big box when loading or no data */}
          <div 
            className="bg-white rounded-2xl md:rounded-3xl shadow-lg"
            style={{
              width: '100%',
              height: '280px',
              borderRadius: '24px',
              opacity: '0.93',
              boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.15)'
            }}
          />
        </div>
      );
    }

    // Get all images from all locations
    const allImages = locations.flatMap(location => 
      location.images.map(imageId => ({ imageId, location }))
    );
    const imageCount = Math.min(allImages.length, 4);
    
    // 1 image - One big box (default)
    if (imageCount === 1) {
      return (
        <div className="absolute" style={{ top: '80px', left: '16px', right: '16px' }}>
          <div 
            className="bg-white rounded-2xl md:rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105"
            style={{
              width: '100%',
              height: '280px',
              borderRadius: '24px',
              opacity: '0.93',
              boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.15)',
              backgroundImage: `url(/api/images/${allImages[0].imageId})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onClick={() => handleLocationClick(allImages[0].location)}
            onTouchStart={() => handleLocationTouchStart(allImages[0].location)}
            onTouchEnd={handleLocationTouchEnd}
          />
        </div>
      );
    }

    // 2 images - Two images in one horizontal row
    if (imageCount === 2) {
      return (
        <div className="absolute flex gap-2 md:gap-4" style={{ top: '80px', left: '16px', right: '16px' }}>
          {allImages.slice(0, 2).map((imageData, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl md:rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 flex-1"
              style={{
                height: '280px',
                borderRadius: '24px',
                opacity: '0.93',
                boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.15)',
                backgroundImage: `url(/api/images/${imageData.imageId})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => handleLocationClick(imageData.location)}
              onTouchStart={() => handleLocationTouchStart(imageData.location)}
              onTouchEnd={handleLocationTouchEnd}
            />
          ))}
        </div>
      );
    }

    // 3 images - One big image on top, two small images below
    if (imageCount === 3) {
      return (
        <div className="absolute flex flex-col gap-2 md:gap-4" style={{ top: '80px', left: '16px', right: '16px' }}>
          {/* First image - big */}
          <div 
            className="bg-white rounded-2xl md:rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105"
            style={{
              width: '100%',
              height: '180px',
              borderRadius: '24px',
              opacity: '0.93',
              boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.15)',
              backgroundImage: `url(/api/images/${allImages[0].imageId})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onClick={() => handleLocationClick(allImages[0].location)}
            onTouchStart={() => handleLocationTouchStart(allImages[0].location)}
            onTouchEnd={handleLocationTouchEnd}
          />
          
          {/* Second and third images - small side by side */}
          <div className="flex gap-2 md:gap-4">
            {allImages.slice(1, 3).map((imageData, index) => (
              <div 
                key={index + 1}
                className="bg-white rounded-2xl md:rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105 flex-1"
                style={{
                  height: '100px',
                  borderRadius: '24px',
                  opacity: '0.93',
                  boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.15)',
                  backgroundImage: `url(/api/images/${imageData.imageId})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onClick={() => handleLocationClick(imageData.location)}
                onTouchStart={() => handleLocationTouchStart(imageData.location)}
                onTouchEnd={handleLocationTouchEnd}
              />
            ))}
          </div>
        </div>
      );
    }

    // 4 images - 2x2 grid (all small)
    return (
      <div className="absolute grid grid-cols-2 gap-2 md:gap-4" style={{ top: '80px', left: '16px', right: '16px' }}>
        {allImages.slice(0, 4).map((imageData, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl md:rounded-3xl shadow-lg cursor-pointer transition-transform hover:scale-105"
            style={{
              width: '100%',
              height: '100px',
              borderRadius: '24px',
              opacity: '0.93',
              boxShadow: '0px 10px 40px 0px rgba(0, 0, 0, 0.15)',
              backgroundImage: `url(/api/images/${imageData.imageId})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onClick={() => handleLocationClick(imageData.location)}
            onTouchStart={() => handleLocationTouchStart(imageData.location)}
            onTouchEnd={handleLocationTouchEnd}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    // Only run GSAP animations on client side
    if (typeof window === 'undefined') return;
    
    // Set initial states
    gsap.set([headerRef.current, brandLogoRef.current, brandTextRef.current, menuButtonRef.current, contentCardsRef.current, signatureSectionRef.current, offersSectionRef.current, footerRef.current].filter(Boolean), {
      opacity: 0,
      y: 50
    });

    // Fetch locations
    fetchLocations();
    // Fetch categories for dynamic links
    fetchCategoryIds();
    // Fetch featured categories for homepage grid
    fetchFeaturedCategories();

    // Set initial states for inner cards with staggered entrance
    gsap.set([textCard1Ref.current, textCard2Ref.current, textCard3Ref.current].filter(Boolean), {
      opacity: 0,
      scale: 0.8,
      y: 20
    });

    // Create timeline
    const tl = gsap.timeline();

    // Animate elements in sequence
    if (headerRef.current) {
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      });
    }
    
    if (brandLogoRef.current) {
      tl.to(brandLogoRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.4");
    }
    
    if (brandTextRef.current) {
      tl.to(brandTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.3");
    }
    
    if (menuButtonRef.current) {
      tl.to(menuButtonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.2");
    }
    
    if (contentCardsRef.current) {
      tl.to(contentCardsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.1");
    }
    // Animate inner cards with staggered entrance
    if (textCard1Ref.current) {
      tl.to(textCard1Ref.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.2");
    }
    
    if (textCard2Ref.current) {
      tl.to(textCard2Ref.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.1");
    }
    
    if (textCard3Ref.current) {
      tl.to(textCard3Ref.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.1");
    }
    
    if (signatureSectionRef.current) {
      tl.to(signatureSectionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.1");
    }
    
    if (offersSectionRef.current) {
      tl.to(offersSectionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.1");
    }

    // Footer scroll-triggered animation
    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animate footer when it becomes visible
          gsap.to(footerRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          });
          // Stop observing after animation
          footerObserver.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger when footer is 50px from viewport
    });

    // Start observing footer
    if (footerRef.current) {
      footerObserver.observe(footerRef.current);
    }

    // Add hover animations for interactive elements
    const menuButton = menuButtonRef.current?.querySelector('button');
    if (menuButton) {
      menuButton.addEventListener('mouseenter', () => {
        gsap.to(menuButton, { scale: 1.05, duration: 0.3, ease: "power2.out" });
      });
      menuButton.addEventListener('mouseleave', () => {
        gsap.to(menuButton, { scale: 1, duration: 0.3, ease: "power2.out" });
      });
    }

    // Add hover effects for inner cards
    const innerCards = [
      textCard1Ref.current, textCard2Ref.current, textCard3Ref.current
    ].filter(Boolean);

    innerCards.forEach(card => {
      if (card) {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { 
            scale: 1.05, 
            duration: 0.3, 
            ease: "power2.out",
            boxShadow: "0 8px 32px rgba(255, 255, 255, 0.2)"
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { 
            scale: 1, 
            duration: 0.3, 
            ease: "power2.out",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)"
          });
        });
      }
    });

    // Add scroll-triggered animations for sections
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
          });
        }
      });
    }, { threshold: 0.1 });

    // Observe sections for scroll animations
    [signatureSectionRef.current, offersSectionRef.current].forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    gsap.to(window, {
      duration: 1,
      scrollTo: { y: 0 },
      ease: "power2.inOut"
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#4F3500' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="relative z-10 responsive-container coffee-shadow min-h-screen" style={{ backgroundColor: '#4F3500' }}>

        {/* Header with Brand */}
        <div ref={headerRef} className="relative px-6 pt-8 pb-4 md:px-8 lg:px-12">
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

          {/* Header Image */}
          <img
            src="/first-section.jpeg"
            alt="موال مراكش"
            className="w-full h-96 md:h-[400px] lg:h-[500px] object-cover rounded-2xl mx-auto"
          />

          {/* Overlay Logo and Title/Text on Header Image */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-4">
              <img
                src="/موال مراكش طواجن  1 (1).png"
                alt="موال مراكش طواجن"
                className="mx-auto mb-3 md:mb-4 w-60 h-40 md:w-64 md:h-44 lg:w-72 lg:h-52 object-contain drop-shadow-lg"
              />
              <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
                تجربة قهوة استثنائية
              </h1>
              <p className="text-white/90 mt-2 md:mt-3 text-sm md:text-base lg:text-lg drop-shadow">
                في قلب المدينة المنورة
              </p>
            </div>
          </div>

          {/* Removed separate top-right logo to keep center logo only */}

          {/* Brand Text */}
          <div ref={brandTextRef} className="text-center mt-4">
            <p className="text-white arabic-body text-xs md:text-sm lg:text-base text-shadow">
              تجربة قهوة استثنائية في قلب المدينة المنورة
            </p>
          </div>
        </div>

        {/* Primary CTA Buttons (below first section) */}
        <div ref={menuButtonRef} className="px-6 mb-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-center gap-3 md:gap-5">
            {/* Order Now */}
            <a
              href="https://wa.me/966567833138"
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 shadow-lg transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/40"
              style={{
                background: 'linear-gradient(180deg, #3FA25B 0%, #2C8747 100%)',
                boxShadow: '0 6px 18px rgba(27, 99, 55, 0.35)'
              }}
              aria-label="اطلب الآن"
            >
              <span className="text-white arabic-body text-base md:text-lg lg:text-xl">اطلب الآن</span>
            </a>

            {/* Browse Menu */}
            <Link href="/menu" className="inline-block">
              <button
                className="rounded-3xl px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 shadow-lg transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/40"
                style={{
                  background: 'linear-gradient(180deg, #CC6B2C 0%, #B9541A 100%)',
                  boxShadow: '0 6px 18px rgba(180, 73, 18, 0.35)'
                }}
                aria-label="تصفح المنيو"
              >
                <span className="text-white arabic-body text-base md:text-lg lg:text-xl">تصفح المنيو</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Main Content Area with Notifications */}
        <div ref={contentCardsRef} className="px-6 space-y-4 mb-6 md:px-8 lg:px-12 flex justify-center">

          {/* Large Content Card (Glass container with header + 3 glass notification cards) */}
          <div
            className="glass-notification relative inset-shadow w-full max-w-[395px]"
            style={{
              backgroundImage: 'url(/second-section-background-image.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '24px',
              height: '400px',
              padding: '16px'
            }}
          >
            <div className="relative z-10 flex flex-col h-full" style={{ gap: '12px' }}>
              {/* Header text directly inside big container */}
              <div
                className="flex items-center justify-center"
                style={{
                  borderRadius: '18px',
                  background: 'rgba(255,255,255,0.36)',
                  height: '96px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="text-center px-3">
                  <p className="text-[#3C2902] font-semibold" style={{ fontFamily: 'SF Pro, -apple-system, sans-serif', fontSize: '18px', marginBottom: '4px' }}>تجربة القهوة المثالية</p>
                  <p className="text-[#3C2902]" style={{ fontFamily: 'SF Pro, -apple-system, sans-serif', fontSize: '12px', lineHeight: '16px' }}>كتشف فن تحضير القهوة في أجواء مراكشية أصيلة.</p>
                  <p className="text-[#3C2902]" style={{ fontFamily: 'SF Pro, -apple-system, sans-serif', fontSize: '12px', lineHeight: '16px' }}>كل كوب يحكي قصة من العاطفة والجودة</p>
                </div>
              </div>
              {/* Card 1 */}
              <div ref={textCard1Ref}>
                <NotificationCard
                  className="cursor-pointer"
                  customStyle={{
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.28)',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl overflow-hidden" style={{ width: '64px', height: '64px' }}>
                      <img src="/second-section-first-image.jpeg" alt="coffee" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[#3C2902] text-sm font-medium text-right" style={{ fontFamily: 'SF Pro, -apple-system, sans-serif' }}>
                      تجربة القهوة المثالية
                    </p>
                  </div>
                </NotificationCard>
              </div>
              {/* Card 2 */}
              <div ref={textCard2Ref}>
                <NotificationCard
                  className="cursor-pointer"
                  customStyle={{
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.28)',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl overflow-hidden" style={{ width: '64px', height: '64px' }}>
                      <img src="/second-section-second-image.jpeg" alt="beans" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[#3C2902] text-sm font-medium text-right" style={{ fontFamily: 'SF Pro, -apple-system, sans-serif' }}>
                      أجود أنواع القهوة المحضرة بعناية
                    </p>
                  </div>
                </NotificationCard>
              </div>
              {/* Card 3 */}
              <div ref={textCard3Ref}>
                <NotificationCard
                  className="cursor-pointer"
                  customStyle={{
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.28)',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl overflow-hidden" style={{ width: '64px', height: '64px' }}>
                      <img src="/second-section-third-image-correct.png" alt="cup" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[#3C2902] text-sm font-medium text-right" style={{ fontFamily: 'SF Pro, -apple-system, sans-serif' }}>
                      أجواء مراكش في كل كوب
                    </p>
                  </div>
                </NotificationCard>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Section with Colored Buttons */}
        <div className="px-6 mb-6 md:px-8 lg:px-12 flex justify-center">
          <div className="flex items-center justify-between w-full max-w-[395px] sm:max-w-[480px] md:max-w-[700px] lg:max-w-[1000px] xl:max-w-[1200px]" style={{ gap: '16px' }}>
            {/* White Detail Button */}
            <div
              className="bg-white rounded-full flex items-center shadow-lg flex-1"
              style={{
                height: '52px',
                paddingLeft: '20px',
                paddingRight: '20px',
                justifyContent: 'space-between',
                maxWidth: '220px'
              }}
            >
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 text-base font-medium">Detail</span>
            </div>

            {/* Three Circular Icons */}
            <div className="flex gap-3 md:gap-4 lg:gap-5">
              <a href="https://www.google.com/maps/place/%D9%85%D9%82%D9%87%D9%89+%D9%85%D9%88%D8%A7%D9%84+%D9%85%D8%B1%D8%A7%D9%83%D8%B4+2%E2%80%AD/@24.4901875,39.5808125,17z/data=!3m1!4b1!4m6!3m5!1s0x15bdbf5153b09cbd:0x7b7ff6dd63554a76!8m2!3d24.4901875!4d39.5808125!16s%2Fg%2F11zj89ysxh?entry=ttu&g_ep=EgoyMDI1MDkyOC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" title="الموقع على الخرائط">
                <div className="rounded-full overflow-hidden shadow-lg bg-purple-600" style={{ width: '48px', height: '48px' }}>
                  <img src="/location.png" alt="Location" className="w-full h-full object-cover" />
                </div>
              </a>
              <div className="rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-blue-500 to-purple-600" style={{ width: '48px', height: '48px' }}>
                <img src="/clock.png" alt="Clock" className="w-full h-full object-cover" />
              </div>
              <a href="https://wa.me/966567833138" target="_blank" rel="noreferrer" title="WhatsApp" aria-label="WhatsApp">
                <div className="rounded-full shadow-lg bg-[#25D366] hover:brightness-110 transition flex items-center justify-center" style={{ width: '48px', height: '48px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="text-white" fill="currentColor" aria-hidden style={{ width: '28px', height: '28px' }}>
                    <path d="M19.11 17.34c-.27-.14-1.62-.93-1.87-1.03-.25-.09-.43-.14-.6.14-.18.27-.69.93-.84 1.12-.15.18-.3.2-.56.07-.27-.14-1.12-.41-2.14-1.32-.79-.71-1.33-1.58-1.49-1.85-.16-.27-.02-.41.12-.55.13-.13.28-.3.4-.45.14-.15.18-.26.27-.43.09-.17.05-.32-.02-.45-.07-.13-.6-1.45-.82-1.99-.22-.52-.44-.45-.6-.46-.16-.01-.33-.01-.5-.01-.17 0-.45.07-.68.34-.23.27-.89.92-.89 2.24 0 1.32.91 2.6 1.04 2.78.13.18 1.8 2.9 4.36 4.06.61.28 1.08.44 1.45.56.61.2 1.17.18 1.61.11.49-.08 1.51-.65 1.73-1.28.21-.63.21-1.17.15-1.28-.06-.11-.23-.18-.48-.31z"/>
                    <path d="M16 3C8.82 3 3 8.82 3 16c0 2.3.63 4.45 1.74 6.29L3 29l6.89-1.81C11.77 28.27 13.82 29 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.4c-1.94 0-3.75-.6-5.24-1.62l-.38-.25-4.06 1.07 1.09-3.96-.26-.41A9.4 9.4 0 016.6 16c0-5.2 4.21-9.4 9.4-9.4s9.4 4.21 9.4 9.4-4.21 9.4-9.4 9.4z"/>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* New Big Card Section */}
        <div className="px-6 mb-6 md:px-8 lg:px-12 flex justify-center">
          <div
            className="relative overflow-hidden shadow-lg w-full max-w-[395px] sm:max-w-[480px] md:max-w-[700px] lg:max-w-[1000px] xl:max-w-[1200px]"
            style={{
              height: 'auto',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #754F37 100%)'
            }}
          >
            <div className="flex flex-col items-center justify-center h-full md:h-auto" style={{ padding: '20px' }}>
              {/* Arabic Text */}
              <h3
                className="text-center text-black"
                style={{
                  fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '700',
                  fontSize: '20px',
                  lineHeight: '24px',
                  marginBottom: '20px'
                }}
              >
                إكتشف قائمة مشروباتنا
              </h3>

              {/* Drink Categories Grid (dynamic by featured categories) */}
              <div className="grid grid-cols-4 gap-3 md:gap-4 lg:gap-6 w-full mb-5 px-2 md:px-4 lg:px-6" style={{ maxWidth: '1200px' }}>
                {featuredCategories.map((cat) => (
                  <Link key={cat._id} href={`/category/${cat._id}`} className="flex flex-col items-center">
                    <div className="bg-white rounded-xl shadow-md flex items-center justify-center md:w-20 md:h-20 lg:w-24 lg:h-24" style={{ width: '64px', height: '64px' }}>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="object-contain" style={{ width: '40px', height: '40px' }} />
                      ) : cat.icon ? (
                        <img src={cat.icon} alt={cat.name} className="object-contain" style={{ width: '40px', height: '40px' }} />
                      ) : (
                        <div className="w-10 h-10 rounded" style={{ backgroundColor: cat.color || '#fff' }} />
                      )}
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-[10px] md:text-xs lg:text-sm text-black block leading-tight">{cat.name}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Custom Menu Button */}
              <Link href="/menu" className="inline-block">
                <div
                  className="rounded-full text-center cursor-pointer transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #D4C4A8 0%, #C4B49A 50%, #B8A68A 100%)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    minWidth: '140px'
                  }}
                >
                  <span
                    className="text-lg md:text-xl lg:text-2xl font-semibold"
                    style={{
                      color: '#8B4513',
                      fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif'
                    }}
                  >
                    القائمة
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Our Location Section */}
        <div className="px-6 py-8 md:px-8 lg:px-12 flex justify-center">
          
          <div 
            className="relative mx-auto rounded-3xl p-4 md:p-6 lg:p-8 w-full max-w-[395px] sm:max-w-[480px] md:max-w-[700px] lg:max-w-[1000px] xl:max-w-[1200px]"
            style={{
              height: 'auto',
              minHeight: '400px',
              backgroundImage: 'url(/location-travel-road.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Search Bar with title inside */}
            <div 
              className="absolute mx-auto flex items-center justify-center"
              style={{
                width: '184px',
                height: '54px',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '100px',
                backgroundColor: '#CCCCCC',
                opacity: 1
              }}
            >
              <span
                style={{
                  color: '#FFFFFF',
                  fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 700,
                  fontSize: '24px',
                  lineHeight: '100%',
                  letterSpacing: '0px',
                  textAlign: 'center',
                  verticalAlign: 'middle'
                }}
              >
                مواقعنا
              </span>
            </div>
            
            {/* Dynamic Location Images */}
            {renderLocationImages()}
          </div>
        </div>

        {/* Our Signature Drinks Section */}
        <div ref={signatureSectionRef} className="px-6 py-8 md:px-8 lg:px-12">
          <h2 className="text-white text-center text-2xl md:text-3xl lg:text-4xl mb-6" style={{ fontFamily: 'Seymour One, serif' }}>
            Our Signature Drinks
          </h2>
          <ErrorBoundary fallback={SignatureDrinksErrorFallback}>
            <SignatureDrinksSlider />
          </ErrorBoundary>
        </div>

        {/* Special Offers Section */}
        <div ref={offersSectionRef} className="px-6 mb-8 md:px-8 lg:px-12">
          <h2 className="text-white text-center text-2xl md:text-3xl lg:text-4xl mb-6" style={{ fontFamily: 'Seymour One, serif' }}>
            special OFFERS
          </h2>
          <ErrorBoundary fallback={OffersErrorFallback}>
            <OffersSlider />
          </ErrorBoundary>
        </div>

        {/* Story Banner with overlaid title before journey animations */}
        <div className="px-6 md:px-8 lg:px-12 flex justify-center mb-6">
          <div className="relative w-full max-w-[395px] md:max-w-[700px] lg:max-w-[900px]">
            <img
              src="/Notification - Collapsed (1).png"
              alt="قصتنا"
              className="w-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                style={{
                  fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 590,
                  fontSize: '32px',
                  lineHeight: '22px',
                  letterSpacing: '0px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  color: '#3C2902'
                }}
              >
                قصتنا
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Edge Effect */}
        <div className="relative h-16 mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent opacity-90 backdrop-blur-lg"></div>
        </div>

        {/* Coffee Journey Content */}
        <ErrorBoundary fallback={JourneyErrorFallback}>
          <JourneySection />
        </ErrorBoundary>

        {/* Spacing between last section and footer */}
        <div className="h-16 md:h-20 lg:h-24"></div>

        {/* Footer Section */}
        <div ref={footerRef} className="px-6 py-6 md:px-8 lg:px-12" style={{ backgroundColor: '#B39250' }}>
          {/* Logo */}
          <div className="flex justify-end mb-4">
            <img
              src="/موال مراكش طواجن  1 (1).png"
              alt="موال مراكش طواجن"
              className="w-28 h-20 md:w-32 md:h-24 lg:w-40 lg:h-28 object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* Working Hours */}
            <div className="text-center">
              <h4 className="text-white text-sm md:text-base lg:text-lg font-semibold mb-2">أوقات العمل</h4>
              <div className="w-24 h-px bg-coffee-primary mx-auto mb-2"></div>
              <p className="text-white text-sm md:text-base mb-1">مفتوح 24 ساعة</p>
              <p className="text-white text-sm md:text-base">جميع ايام الاسبوع</p>
            </div>

            {/* Contact Info */}
            <div className="text-center">
              <h4 className="text-white text-sm md:text-base lg:text-lg font-semibold mb-2">تواصل معنا</h4>
              <div className="w-24 h-px bg-coffee-primary mx-auto mb-2"></div>
              <p className="text-white text-xs md:text-sm lg:text-base mb-1">المدينة المنورة _حي النبلاء</p>
              <p className="text-white text-sm md:text-base lg:text-lg">966567833138+</p>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-6 mt-6 text-white/80">
            {/* Facebook */}
            <a 
              href="https://www.facebook.com/cafemwalmarakish" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition-colors duration-200"
              title="Facebook"
            >
              <svg className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            
            {/* TikTok */}
            <a 
              href="https://www.tiktok.com/@mwal_marakish/video/7508959966254927122" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition-colors duration-200"
              title="TikTok"
            >
              <svg className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            
            {/* X (Twitter) */}
            <a 
              href="https://x.com/mwal_marakish" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition-colors duration-200"
              title="X"
            >
              <svg className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            
            {/* WhatsApp */}
            <a 
              href="https://wa.me/966567833138" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition-colors duration-200"
              title="WhatsApp"
            >
              <svg className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-1.012-2.03-1.123-.273-.112-.472-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* Cart Components */}
      <div className="fixed top-6 right-6 z-40">
        <CartIcon />
      </div>
      <CartModal />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-coffee-gold hover:bg-coffee-gold/90 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      {/* Location Details Modal */}
      {showLocationModal && selectedLocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedLocation.title}</h3>
              {selectedLocation.titleEn && (
                <p className="text-white/70 text-lg">{selectedLocation.titleEn}</p>
              )}
            </div>

            {selectedLocation.description && (
              <div className="mb-4">
                <p className="text-white/90 text-center">{selectedLocation.description}</p>
                {selectedLocation.descriptionEn && (
                  <p className="text-white/70 text-center text-sm mt-1">{selectedLocation.descriptionEn}</p>
                )}
              </div>
            )}

            <div className="space-y-3">
              {selectedLocation.address && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-coffee-green/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-coffee-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedLocation.address}</p>
                    {selectedLocation.addressEn && (
                      <p className="text-white/70 text-sm">{selectedLocation.addressEn}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedLocation.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-coffee-green/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-coffee-green" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <a 
                    href={`tel:${selectedLocation.phone}`}
                    className="text-white hover:text-coffee-green transition-colors"
                  >
                    {selectedLocation.phone}
                  </a>
                </div>
              )}

              {selectedLocation.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-coffee-green/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-coffee-green" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <a 
                    href={`mailto:${selectedLocation.email}`}
                    className="text-white hover:text-coffee-green transition-colors"
                  >
                    {selectedLocation.email}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-full glass-effect px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
