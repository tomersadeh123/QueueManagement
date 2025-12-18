'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, t, isRTL } from '@/lib/i18n';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('he'); // Default to Hebrew
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved language from localStorage
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'he' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update HTML dir attribute
      document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const translate = (key: string) => {
    const result = t(key, language);
    // Debug: log if translation is missing
    if (result === key) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`);
    }
    return result;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translate,
        isRTL: isRTL(language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
