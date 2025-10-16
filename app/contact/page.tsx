"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ReviewModal } from "@/components/ReviewModal";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <motion.div
      className="min-h-screen bg-coffee-primary relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
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

          <motion.h1
            className="text-white text-center text-3xl mb-8 section-title"
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
              className="glass-notification rounded-3xl p-6"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <h3 className="text-white text-lg font-bold mb-4">{t('contact.workingHours')}</h3>
              <p className="text-white text-sm mb-2">{t('contact.workingHours.open')}</p>
              <p className="text-white text-sm">{t('contact.workingHours.days')}</p>
            </motion.div>

            <motion.div
              className="glass-notification rounded-3xl p-6"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
            >
              <h3 className="text-white text-lg font-bold mb-4">{t('contact.location')}</h3>
              <p className="text-white text-sm">{t('contact.location.address')}</p>
            </motion.div>

            <motion.div
              className="glass-notification rounded-3xl p-6"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            >
              <h3 className="text-white text-lg font-bold mb-4">{t('contact.contactUs')}</h3>
              <p className="text-white text-sm">{t('contact.phone')}</p>
            </motion.div>

            <motion.div
              className="flex justify-center gap-6 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
            >
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/cafemwalmarakish" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white/80 hover:text-white transition-colors duration-200"
                title="Facebook"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@mwal_marakish/video/7508959966254927122" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white/80 hover:text-white transition-colors duration-200"
                title="TikTok"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              
              {/* X (Twitter) */}
              <a 
                href="https://x.com/mwal_marakish" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white/80 hover:text-white transition-colors duration-200"
                title="X"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* WhatsApp */}
              <a 
                href="https://wa.me/966567833138" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white/80 hover:text-white transition-colors duration-200"
                title="WhatsApp"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-1.012-2.03-1.123-.273-.112-.472-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
            </motion.div>

            {/* Reviews Modal */}
            <ReviewModal>
              <motion.div
                className="glass-notification rounded-3xl p-6 cursor-pointer hover:bg-white/5 transition-colors"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
              >
                <h3 className="text-white text-lg font-bold mb-4">{t('contact.reviews.title')}</h3>
                <p className="text-white/80 text-sm text-center">
                  {t('contact.reviews.description')}
                </p>
              </motion.div>
            </ReviewModal>

            {/* Google Map at the bottom */}
            <motion.div
              className="glass-notification rounded-3xl overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
            >
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
