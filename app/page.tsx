"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { NotificationCard } from "@/components/NotificationCard";
import { Sidebar } from "@/components/Sidebar";
import SignatureDrinksSlider from "@/components/SignatureDrinksSlider";
import OffersSlider from "@/components/OffersSlider";
import { CartIcon, CartModal } from "@/components/CartComponents";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register the ScrollTo plugin
gsap.registerPlugin(ScrollToPlugin);

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  
  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const brandLogoRef = useRef<HTMLImageElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const contentCardsRef = useRef<HTMLDivElement>(null);
  const signatureSectionRef = useRef<HTMLDivElement>(null);
  const offersSectionRef = useRef<HTMLDivElement>(null);
  const journeySectionRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  // Refs for individual journey sections
  const journeyPart1Ref = useRef<HTMLDivElement>(null);
  const journeyPart2Ref = useRef<HTMLDivElement>(null);
  const journeyPart3Ref = useRef<HTMLDivElement>(null);
  
  // Refs for inner cards in the second section
  const imageCard1Ref = useRef<HTMLDivElement>(null);
  const imageCard2Ref = useRef<HTMLDivElement>(null);
  const imageCard3Ref = useRef<HTMLDivElement>(null);
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
    // Set initial states
    gsap.set([headerRef.current, brandLogoRef.current, brandTextRef.current, menuButtonRef.current, contentCardsRef.current, signatureSectionRef.current, offersSectionRef.current, journeySectionRef.current, footerRef.current], {
      opacity: 0,
      y: 50
    });

    // Set initial states for journey sections with specific directions
    gsap.set(journeyPart1Ref.current, {
      opacity: 0,
      x: 100 // Start from right
    });
    gsap.set(journeyPart2Ref.current, {
      opacity: 0,
      x: -100 // Start from left
    });
    gsap.set(journeyPart3Ref.current, {
      opacity: 0,
      x: 100 // Start from right
    });

    // Fetch locations
    fetchLocations();

    // Set initial states for inner cards with staggered entrance
    gsap.set([imageCard1Ref.current, imageCard2Ref.current, imageCard3Ref.current], {
      opacity: 0,
      scale: 0.8,
      y: 20
    });
    gsap.set([textCard1Ref.current, textCard2Ref.current, textCard3Ref.current], {
      opacity: 0,
      scale: 0.8,
      y: 20
    });

    // Create timeline
    const tl = gsap.timeline();

    // Animate elements in sequence
    tl.to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    })
    .to(brandLogoRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.4")
    .to(brandTextRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")
    .to(menuButtonRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.2")
    .to(contentCardsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.1")
    // Animate inner cards with staggered entrance
    .to([imageCard1Ref.current, textCard1Ref.current], {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.2")
    .to([imageCard2Ref.current, textCard2Ref.current], {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.1")
    .to([imageCard3Ref.current, textCard3Ref.current], {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.1")
    .to(signatureSectionRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.1")
    .to(offersSectionRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.1")
    .to(journeySectionRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.1");

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
      imageCard1Ref.current, imageCard2Ref.current, imageCard3Ref.current,
      textCard1Ref.current, textCard2Ref.current, textCard3Ref.current
    ];

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

    // Special observer for journey sections with directional animations
    const journeyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === journeyPart1Ref.current) {
            gsap.to(journeyPart1Ref.current, {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: "power2.out"
            });
          } else if (entry.target === journeyPart2Ref.current) {
            gsap.to(journeyPart2Ref.current, {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: "power2.out"
            });
          } else if (entry.target === journeyPart3Ref.current) {
            gsap.to(journeyPart3Ref.current, {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: "power2.out"
            });
          }
        }
      });
    }, { threshold: 0.1 });

    // Observe sections for scroll animations
    [signatureSectionRef.current, offersSectionRef.current, journeySectionRef.current].forEach(ref => {
      if (ref) observer.observe(ref);
    });

    // Observe individual journey sections
    [journeyPart1Ref.current, journeyPart2Ref.current, journeyPart3Ref.current].forEach(ref => {
      if (ref) journeyObserver.observe(ref);
    });

    return () => {
      observer.disconnect();
      journeyObserver.disconnect();
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
    <div className="min-h-screen bg-coffee-primary relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="relative z-10 responsive-container bg-coffee-primary coffee-shadow min-h-screen">

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

          {/* Brand Logo */}
          <img
            ref={brandLogoRef}
            src="/موال مراكش طواجن .png"
            alt="موال مراكش طواجن"
            className="w-28 h-20 md:w-32 md:h-24 lg:w-36 lg:h-28 object-contain absolute top-8 right-6 md:right-8 lg:right-12"
          />

          {/* Brand Text */}
          <div ref={brandTextRef} className="text-center mt-4">
            <p className="text-white arabic-body text-xs md:text-sm lg:text-base text-shadow">
              تجربة قهوة استثنائية في قلب المدينة المنورة
            </p>
          </div>
        </div>

        {/* Browse Menu Button */}
        <div ref={menuButtonRef} className="px-6 mb-6 md:px-8 lg:px-12">
          <Link href="/menu">
            <button className="glass-green-button rounded-3xl px-6 py-4 md:px-8 md:py-5 lg:px-10 lg:py-6 mx-auto block">
              <span className="text-white arabic-body text-base md:text-lg lg:text-xl">تصفح المنيو</span>
            </button>
          </Link>
        </div>

        {/* Main Content Area with Notifications */}
        <div ref={contentCardsRef} className="px-6 space-y-4 mb-6 md:px-8 lg:px-12">

          {/* Large Content Card */}
          <div className="glass-notification rounded-3xl p-6 h-64 md:h-80 lg:h-96 relative inset-shadow" style={{ backgroundImage: 'url(/second-section-background-image.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-3xl"></div>
            <div className="relative z-10 flex h-full">
              {/* Left Side - 3 Small Cards */}
              <div className="flex flex-col justify-center space-y-3 md:space-y-4 lg:space-y-5 w-20 md:w-24 lg:w-28">
                <div ref={imageCard1Ref}>
                  <NotificationCard 
                    className="h-16 md:h-20 lg:h-24 cursor-pointer" 
                    customStyle={{ 
                      width: '66px', 
                      height: '76px', 
                      borderRadius: '18px',
                      backgroundImage: 'url(/second-section-first-image.jpeg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                </div>
                <div ref={imageCard2Ref}>
                  <NotificationCard 
                    className="h-16 md:h-20 lg:h-24 cursor-pointer" 
                    customStyle={{ 
                      width: '66px', 
                      height: '76px', 
                      borderRadius: '18px',
                      backgroundImage: 'url(/second-section-second-image.jpeg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                </div>
                <div ref={imageCard3Ref}>
                  <NotificationCard 
                    className="h-16 md:h-20 lg:h-24 cursor-pointer" 
                    customStyle={{ 
                      width: '66px', 
                      height: '76px', 
                      borderRadius: '18px',
                      backgroundImage: 'url(/second-section-third-image-correct.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                </div>
              </div>
              
              {/* Right Side - Arabic Text Cards */}
              <div className="flex-1 flex flex-col justify-center space-y-3 md:space-y-4 lg:space-y-5 pr-4 md:pr-6 lg:pr-8">
                <div ref={textCard1Ref}>
                  <NotificationCard className="h-16 md:h-20 lg:h-24 cursor-pointer">
                    <p className="text-white arabic-body text-xs md:text-sm lg:text-base opacity-90 text-center">
                      تحضير القهوة في أجواء مراكش ليلة من العاقة العودة
                    </p>
                  </NotificationCard>
                </div>
                <div ref={textCard2Ref}>
                  <NotificationCard className="h-16 md:h-20 lg:h-24 cursor-pointer">
                    <p className="text-white arabic-body text-xs md:text-sm lg:text-base opacity-90 text-center">
                      أجود أنواع القهوة المحضرة بعناية
                    </p>
                  </NotificationCard>
                </div>
                <div ref={textCard3Ref}>
                  <NotificationCard className="h-16 md:h-20 lg:h-24 cursor-pointer">
                    <p className="text-white arabic-body text-xs md:text-sm lg:text-base opacity-90 text-center">
                      أجواء مراكش في كل كوب
                    </p>
                  </NotificationCard>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Section with Colored Buttons */}
        <div className="px-6 mb-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Three Circular Icons - Now on the left */}
            <div className="flex space-x-3 md:space-x-4 lg:space-x-6">
              <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden shadow-lg bg-purple-800">
                <img src="/location.png" alt="Location" className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <img src="/clock.png" alt="Clock" className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden shadow-lg bg-green-500">
                <img src="/whats.png" alt="WhatsApp" className="w-full h-full object-cover" />
              </div>
            </div>
            
            {/* White Detail Button - Now on the right */}
            <div className="bg-white rounded-full flex items-center gap-2.5 shadow-lg" style={{ width: '402px', height: '52px', paddingRight: '16px' }}>
              <span className="text-gray-700 text-base font-medium ml-4">Detail</span>
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* New Big Card Section */}
        <div className="px-6 mb-6 md:px-8 lg:px-12 flex justify-center">
          <div 
            className="relative overflow-hidden shadow-lg w-full max-w-[395px] md:max-w-[450px] lg:max-w-[500px]"
            style={{ 
              height: '310px', 
              borderRadius: '21px',
              background: 'linear-gradient(to bottom, #FFFFFF, #754F37)'
            }}
          >
            {/* Loose Padding Guide */}
            <div 
              className="absolute border border-dashed border-black opacity-30 flex flex-col items-center justify-center py-8 space-y-8"
              style={{
                top: '18px',
                left: '18px',
                width: 'calc(100% - 36px)',
                height: 'calc(100% - 36px)',
                borderRadius: '11px'
              }}
            >
              {/* Arabic Text */}
              <h3 
                className="text-center text-black"
                style={{
                  fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '700',
                  fontSize: '17px',
                  lineHeight: '22px',
                  letterSpacing: '0px',
                  textAlign: 'center'
                }}
              >
                إكتشف قائمة مشروباتنا
              </h3>
              
              {/* Drink Categories Grid */}
              <div className="grid grid-cols-4 gap-2 w-full px-4">
                {/* Hot Coffee */}
                <Link href="/hot-coffee" className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src="/Fire.png" alt="Hot Coffee" className="w-8 h-8 object-contain" style={{ filter: 'none !important', opacity: '1 !important', mixBlendMode: 'normal !important' }} />
                  <span className="text-xs text-black text-center mt-1 leading-tight">قهوة ساخنة</span>
                </Link>
                
                {/* Cold Coffee */}
                <Link href="/cold-coffee" className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src="/Ice.png" alt="Cold Coffee" className="w-8 h-8 object-contain" style={{ filter: 'none !important', opacity: '1 !important', mixBlendMode: 'normal !important' }} />
                  <span className="text-xs text-black text-center mt-1 leading-tight">قهوة باردة</span>
                </Link>
                
                {/* Tea */}
                <Link href="/tea" className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src="/Leaf Fluttering In Wind.png" alt="Tea" className="w-8 h-8 object-contain" style={{ filter: 'none !important', opacity: '1 !important', mixBlendMode: 'normal !important' }} />
                  <span className="text-xs text-black text-center mt-1 leading-tight">الشاي</span>
                </Link>
                
                {/* Natural Juices */}
                <Link href="/natural-juices" className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src="/Tropical Drink.png" alt="Natural Juices" className="w-8 h-8 object-contain" style={{ filter: 'none !important', opacity: '1 !important', mixBlendMode: 'normal !important' }} />
                  <span className="text-xs text-black text-center mt-1 leading-tight">عصائر طبيعية</span>
                </Link>
                
                {/* Cocktails */}
                <Link href="/cocktails" className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src="/Cup With Straw.png" alt="Cocktails" className="w-8 h-8 object-contain" style={{ filter: 'none !important', opacity: '1 !important', mixBlendMode: 'normal !important' }} />
                  <span className="text-xs text-black text-center mt-1 leading-tight">كوكتيل</span>
                </Link>
                
                {/* Energy Drinks */}
                <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src="/High Voltage.png" alt="Energy Drinks" className="w-8 h-8 object-contain" style={{ filter: 'none !important', opacity: '1 !important', mixBlendMode: 'normal !important' }} />
                  <span className="text-xs text-black text-center mt-1 leading-tight">مشروبات الطاقة</span>
                </div>
                
                {/* Special Drinks */}
                <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src="/Glowing Star.png" alt="Special Drinks" className="w-8 h-8 object-contain" style={{ filter: 'none !important', opacity: '1 !important', mixBlendMode: 'normal !important' }} />
                  <span className="text-xs text-black text-center mt-1 leading-tight">مشروبات خاصة</span>
                </div>
                
                {/* Water */}
                <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <img src="/Droplet.png" alt="Water" className="w-8 h-8 object-contain" style={{ filter: 'none !important', opacity: '1 !important', mixBlendMode: 'normal !important' }} />
                  <span className="text-xs text-black text-center mt-1 leading-tight">ماء</span>
                </div>
              </div>
              
              {/* Custom Menu Button */}
              <Link href="/menu" className="inline-block">
                <div 
                  className="px-8 py-3 rounded-full text-center cursor-pointer transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #D4C4A8 0%, #C4B49A 50%, #B8A68A 100%)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)',
                    border: 'none',
                    minWidth: '120px'
                  }}
                >
                  <span 
                    className="text-lg font-semibold"
                    style={{
                      color: '#8B4513',
                      fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    القائمة
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Content - Removed */}
          </div>
        </div>

        {/* Our Location Section */}
        <div className="px-6 py-8 md:px-8 lg:px-12">
          {/* Section Title */}
          <h2 className="text-white text-center text-2xl md:text-3xl lg:text-4xl mb-6" style={{ fontFamily: 'Seymour One, serif' }}>
            موقعنا
          </h2>
          
          <div 
            className="relative mx-auto rounded-3xl p-4 md:p-6 lg:p-8"
            style={{
              width: '100%',
              maxWidth: '395px',
              height: 'auto',
              minHeight: '400px',
              backgroundImage: 'url(/location-travel-road.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Search Bar */}
            <div 
              className="absolute mx-auto"
              style={{
                width: 'calc(100% - 32px)',
                maxWidth: '268px',
                height: '44px',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '100px',
                backgroundColor: '#CCCCCC'
              }}
            >
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
          <SignatureDrinksSlider />
        </div>

        {/* Special Offers Section */}
        <div ref={offersSectionRef} className="px-6 mb-8 md:px-8 lg:px-12">
          <h2 className="text-white text-center text-2xl md:text-3xl lg:text-4xl mb-6" style={{ fontFamily: 'Seymour One, serif' }}>
            special OFFERS
          </h2>
          <OffersSlider />
        </div>

        {/* Scroll Edge Effect */}
        <div className="relative h-16 mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent opacity-90 backdrop-blur-lg"></div>
        </div>

        {/* Coffee Journey Content */}
        <div ref={journeySectionRef} className="px-6 space-y-8 md:px-8 lg:px-12">

          {/* Coffee Journey Section */}
          <div ref={journeyPart1Ref} className="glass-notification rounded-3xl p-6 h-48 md:h-56 lg:h-64">
            <div className="grid grid-cols-3 gap-4 h-full">
              <img
                src="/Cafea boabe.jpeg"
                alt="Coffee Beans"
                className="w-full h-36 md:h-44 lg:h-52 object-cover rounded-3xl shadow-lg"
              />
              <div className="col-span-2 flex flex-col justify-center text-white text-xs md:text-sm lg:text-base leading-5">
                <h3 className="font-bold mb-2 text-sm md:text-base lg:text-lg">رحلتنا مع القهوة</h3>
                <p className="text-right">
                  من الحبة إلى الكوب، نصنع كل قهوة بشغف ودقة، لنقدم لك أرقى النكهات من جميع أنحاء العالم. بدأت رحلتنا بحلم بسيط: مشاركة الطعم الأصيل لثقافة القهوة المغربية.
                </p>
              </div>
            </div>
          </div>

          {/* Authentic Atmosphere Section */}
          <div ref={journeyPart2Ref} className="glass-notification rounded-3xl p-6 h-48 md:h-56 lg:h-64">
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="col-span-2 flex flex-col justify-center text-white text-xs md:text-sm lg:text-base leading-5">
                <h3 className="font-bold mb-2 text-sm md:text-base lg:text-lg text-right">أجواء أصيلة</h3>
                <p className="text-right">
                  ادخل إلى عالمنا حيث تلتقي الضيافة المغربية التقليدية بالراحة العصرية، لخلق تجربة لا تُنسى. كل زاوية تحكي قصة من التراث والدفء.
                </p>
              </div>
              <img
                src="/download (4).jpeg"
                alt="Coffee Shop Atmosphere"
                className="w-full h-36 md:h-44 lg:h-52 object-cover rounded-3xl shadow-lg"
              />
            </div>
          </div>

          {/* Premium Ingredients Section */}
          <div ref={journeyPart3Ref} className="glass-notification rounded-3xl p-6 h-48 md:h-56 lg:h-64 mb-16">
            <div className="grid grid-cols-3 gap-4 h-full">
              <img
                src="/Close up of coffee beans roast _ Premium Photo.jpeg"
                alt="Premium Coffee Beans"
                className="w-full h-36 md:h-44 lg:h-52 object-cover rounded-3xl"
              />
              <div className="col-span-2 flex flex-col justify-center text-white text-xs md:text-sm lg:text-base leading-5">
                <h3 className="font-bold mb-2 text-sm md:text-base lg:text-lg">مكونات فاخرة</h3>
                <p className="text-right">
                  نختار فقط أرقى المكونات، من حبوب القهوة الفاخرة إلى الأعشاب الطازجة، لضمان أن كل رشفة استثنائية. الجودة هي وعدنا لك
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing between last section and footer */}
        <div className="h-16 md:h-20 lg:h-24"></div>

        {/* Footer Section */}
        <div ref={footerRef} className="px-6 py-6 md:px-8 lg:px-12" style={{ backgroundColor: '#B39250' }}>
          {/* Logo */}
          <div className="flex justify-end mb-4">
            <img
              src="/موال مراكش طواجن .png"
              alt="موال مراكش طواجن"
              className="w-24 h-16 md:w-28 md:h-20 lg:w-32 lg:h-24 object-contain"
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
          <div className="flex justify-center space-x-2 md:space-x-4 lg:space-x-6 mt-6">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/9847c593bb964595b310f34f1252e74193f86dea?width=42" alt="Social" className="w-5 h-4 md:w-6 md:h-5 lg:w-7 lg:h-6" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/35eaab4fef42eda826b4de533ea775b9ad0b81a9?width=42" alt="Social" className="w-5 h-4 md:w-6 md:h-5 lg:w-7 lg:h-6" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/43925dc1b52691edf4fa6ca8dd91ee42ede94a59?width=42" alt="Social" className="w-5 h-4 md:w-6 md:h-5 lg:w-7 lg:h-6" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/d077d93db1664d870170713a6cc1ab80f1c71ac6?width=40" alt="Social" className="w-5 h-4 md:w-6 md:h-5 lg:w-7 lg:h-6" />
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/631a75b08fec0a65d55bb799e45eab6d7995350d?width=42" alt="Social" className="w-5 h-4 md:w-6 md:h-5 lg:w-7 lg:h-6" />
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
