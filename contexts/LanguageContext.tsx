"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

interface LanguageContextType {
  language: 'en' | 'ar';
  changeLanguage: (language: 'en' | 'ar') => void;
  t: (key: string) => string;
}

const translations = {
  en,
  ar,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');

  const changeLanguage = (lang: 'en' | 'ar') => {
    setLanguage(lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
