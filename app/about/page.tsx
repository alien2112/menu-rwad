"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { gsap } from "gsap";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Refs for GSAP animations
  const journeySectionRef = useRef<HTMLDivElement>(null);
  const journeyPart1Ref = useRef<HTMLDivElement>(null);
  const journeyPart2Ref = useRef<HTMLDivElement>(null);
  const journeyPart3Ref = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run GSAP animations on client side
    if (typeof window === 'undefined') return;
    
    // Set initial states for journey sections
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
    gsap.set(reviewsSectionRef.current, {
      opacity: 0,
      y: 50
    });

    // Create timeline for animations
    const tl = gsap.timeline();

    // Animate journey sections with directional animations
    tl.to(journeyPart1Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power2.out"
    })
    .to(journeyPart2Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.4")
    .to(journeyPart3Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.4")
    .to(reviewsSectionRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.2");

    // Add scroll-triggered animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === journeySectionRef.current) {
            tl.play();
          }
        }
      });
    }, { threshold: 0.1 });

    if (journeySectionRef.current) {
      observer.observe(journeySectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

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

          <h1 className="text-white text-center text-3xl mb-8 section-title">{t('about.title')}</h1>

          <div className="space-y-6 text-white">
            <div className="glass-notification rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4">{t('about.whoWeAre')}</h2>
              <p className="text-sm leading-relaxed">
                {t('about.whoWeAre.description')}
              </p>
            </div>

            <div className="glass-notification rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-4">{t('about.ourVision')}</h2>
              <p className="text-sm leading-relaxed">
                {t('about.ourVision.description')}
              </p>
            </div>
          </div>

          {/* رحلتنا Section */}
          <div ref={journeySectionRef} className="mt-12">
            <h2 className="text-white text-center text-2xl md:text-3xl lg:text-4xl mb-8 section-title">{t('about.ourJourney')}</h2>
            
            <div className="space-y-8">
              {/* Coffee Journey Section */}
              <div ref={journeyPart1Ref} className="glass-notification rounded-3xl p-6 h-48 md:h-56 lg:h-64">
                <div className="grid grid-cols-3 gap-4 h-full">
                  <img
                    src="/Cafea boabe.jpeg"
                    alt="Coffee Beans"
                    className="w-full h-36 md:h-44 lg:h-52 object-cover rounded-3xl shadow-lg"
                  />
                  <div className="col-span-2 flex flex-col justify-center text-white text-xs md:text-sm lg:text-base leading-5">
                    <h3 className="font-bold mb-2 text-sm md:text-base lg:text-lg">{t('about.journey.coffee.title')}</h3>
                    <p className="text-right">
                      {t('about.journey.coffee.description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Authentic Atmosphere Section */}
              <div ref={journeyPart2Ref} className="glass-notification rounded-3xl p-6 h-48 md:h-56 lg:h-64">
                <div className="grid grid-cols-3 gap-4 h-full">
                  <div className="col-span-2 flex flex-col justify-center text-white text-xs md:text-sm lg:text-base leading-5">
                    <h3 className="font-bold mb-2 text-sm md:text-base lg:text-lg text-right">{t('about.journey.atmosphere.title')}</h3>
                    <p className="text-right">
                      {t('about.journey.atmosphere.description')}
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
              <div ref={journeyPart3Ref} className="glass-notification rounded-3xl p-6 h-48 md:h-56 lg:h-64">
                <div className="grid grid-cols-3 gap-4 h-full">
                  <img
                    src="/Close up of coffee beans roast _ Premium Photo.jpeg"
                    alt="Premium Coffee Beans"
                    className="w-full h-36 md:h-44 lg:h-52 object-cover rounded-3xl"
                  />
                  <div className="col-span-2 flex flex-col justify-center text-white text-xs md:text-sm lg:text-base leading-5">
                    <h3 className="font-bold mb-2 text-sm md:text-base lg:text-lg">{t('about.journey.ingredients.title')}</h3>
                    <p className="text-right">
                      {t('about.journey.ingredients.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
