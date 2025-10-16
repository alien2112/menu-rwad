"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => changeLanguage(language === "en" ? "ar" : "en")}
        className="bg-gray-800 text-white px-4 py-2 rounded-full"
      >
        {language === "en" ? "عربي" : "English"}
      </button>
    </div>
  );
};
