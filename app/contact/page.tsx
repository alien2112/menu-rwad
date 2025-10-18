"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ReviewModal } from "@/components/ReviewModal";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Skeleton } from "@/components/SkeletonLoader";

interface ContactSettings {
  phone: string;
  email: string;
  address: string;
  addressEn?: string;
  workingHours: {
    open: string;
    days: string;
    openEn?: string;
    daysEn?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    whatsapp?: string;
    youtube?: string;
    linkedin?: string;
  };
  mapSettings: {
    latitude: number;
    longitude: number;
    zoom: number;
    mapUrl?: string;
    embedUrl?: string;
    addressQuery?: string;
  };
  additionalInfo?: {
    description?: string;
    descriptionEn?: string;
    specialInstructions?: string;
    specialInstructionsEn?: string;
  };
}

export default function Contact() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    try {
      const response = await fetch('/api/contact-settings');
      const data = await response.json();
      if (data.success) {
        setContactSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching contact settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply theme colors as CSS variables
  const themeStyles = theme ? {
    '--background': theme.background || '#F6EEDF',
    '--foreground': theme.foreground || '#4F3500',
    '--primary': theme.primary || '#9C6B1E',
    '--secondary': theme.secondary || '#D3A34C',
    '--accent': theme.accent || '#1EA55E',
    '--card': theme.card || '#4F3500',
    '--card-foreground': theme['card-foreground'] || '#FFFFFF',
    '--muted': theme.muted || 'rgba(0,0,0,0.12)',
    '--muted-foreground': theme['muted-foreground'] || 'rgba(18,15,6,0.7)',
  } as React.CSSProperties : {};

  if (loading) {
    return (
      <div className="min-h-screen" style={themeStyles}>
        <div className="px-6 py-8">
          <div className="flex justify-center mb-8">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl p-6" style={{ backgroundColor: 'var(--card)' }}>
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      style={{ ...themeStyles, backgroundColor: 'var(--primary)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10 mobile-container min-h-screen" style={{ backgroundColor: 'var(--primary)' }}>
        <div className="px-6 py-8">
          {/* Hamburger Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-8 left-6 z-20"
          >
            <div className="w-4 h-4 flex flex-col justify-between">
              <div className="w-full h-0 border-t" style={{ borderColor: 'var(--card-foreground)' }}></div>
              <div className="w-full h-0 border-t" style={{ borderColor: 'var(--card-foreground)' }}></div>
              <div className="w-full h-0 border-t" style={{ borderColor: 'var(--card-foreground)' }}></div>
            </div>
          </button>

          <motion.h1
            className="text-center text-3xl mb-8 section-title"
            style={{ color: 'var(--card-foreground)' }}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {t('contact.title')}
          </motion.h1>

          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >

            <motion.div
              className="rounded-3xl p-6 backdrop-blur-sm border border-white/20"
              style={{ backgroundColor: 'var(--card)' }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--card-foreground)' }}>
                {t('contact.workingHours')}
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--card-foreground)' }}>
                {contactSettings?.workingHours.open || t('contact.workingHours.open')}
              </p>
              <p className="text-sm" style={{ color: 'var(--card-foreground)' }}>
                {contactSettings?.workingHours.days || t('contact.workingHours.days')}
              </p>
            </motion.div>

            <motion.div
              className="rounded-3xl p-6 backdrop-blur-sm border border-white/20"
              style={{ backgroundColor: 'var(--card)' }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--card-foreground)' }}>
                {t('contact.location')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--card-foreground)' }}>
                {contactSettings?.address || t('contact.location.address')}
              </p>
            </motion.div>

            <motion.div
              className="rounded-3xl p-6 backdrop-blur-sm border border-white/20"
              style={{ backgroundColor: 'var(--card)' }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--card-foreground)' }}>
                {t('contact.contactUs')}
              </h3>
              <p className="text-sm" style={{ color: 'var(--card-foreground)' }}>
                {contactSettings?.phone || t('contact.phone')}
              </p>
            </motion.div>

            <motion.div
              className="flex justify-center gap-6 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
            >
              {/* Facebook */}
              {contactSettings?.socialMedia.facebook && (
                <a 
                  href={contactSettings.socialMedia.facebook} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="transition-colors duration-200"
                  style={{ color: 'var(--card-foreground)', opacity: 0.8 }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  title="Facebook"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              
              {/* Instagram */}
              {contactSettings?.socialMedia.instagram && (
                <a 
                  href={contactSettings.socialMedia.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="transition-colors duration-200"
                  style={{ color: 'var(--card-foreground)', opacity: 0.8 }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  title="Instagram"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              
              {/* TikTok */}
              {contactSettings?.socialMedia.tiktok && (
                <a 
                  href={contactSettings.socialMedia.tiktok} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="transition-colors duration-200"
                  style={{ color: 'var(--card-foreground)', opacity: 0.8 }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  title="TikTok"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              
              {/* X (Twitter) */}
              {contactSettings?.socialMedia.twitter && (
                <a 
                  href={contactSettings.socialMedia.twitter} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="transition-colors duration-200"
                  style={{ color: 'var(--card-foreground)', opacity: 0.8 }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  title="X"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              
              {/* WhatsApp */}
              {contactSettings?.socialMedia.whatsapp && (
                <a 
                  href={contactSettings.socialMedia.whatsapp} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="transition-colors duration-200"
                  style={{ color: 'var(--card-foreground)', opacity: 0.8 }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  title="WhatsApp"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-1.012-2.03-1.123-.273-.112-.472-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
              )}
            </motion.div>

            {/* Reviews Modal */}
            <ReviewModal>
              <motion.div
                className="rounded-3xl p-6 cursor-pointer backdrop-blur-sm border border-white/20 transition-colors"
                style={{ backgroundColor: 'var(--card)' }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--card)'}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--card-foreground)' }}>
                  {t('contact.reviews.title')}
                </h3>
                <p className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
                  {t('contact.reviews.description')}
                </p>
              </motion.div>
            </ReviewModal>

            {/* Google Map at the bottom */}
            <motion.div
              className="rounded-3xl overflow-hidden backdrop-blur-sm border border-white/20"
              style={{ backgroundColor: 'var(--card)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
            >
              {contactSettings?.mapSettings.mapUrl ? (
                <iframe
                  title="Google Map"
                  src={contactSettings.mapSettings.mapUrl}
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps?q=%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9%20%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9%20-%20%D8%AD%D9%8A%20%D8%A7%D9%84%D9%86%D8%A8%D9%84%D8%A7%D8%A1&output=embed"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
