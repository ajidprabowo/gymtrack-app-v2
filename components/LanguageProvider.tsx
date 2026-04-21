'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { dictionaries, Language } from '@/lib/dictionaries';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
    setMounted(true);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string, variables?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = dictionaries[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to id if key not found in currently selected language
        let fallbackValue: any = dictionaries['id'];
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // return key if not found at all
          }
        }
        value = fallbackValue;
        break;
      }
    }

    if (typeof value === 'string') {
      if (variables) {
        let replaced = value;
        for (const [k, v] of Object.entries(variables)) {
          replaced = replaced.replace(new RegExp(`{${k}}`, 'g'), v);
        }
        return replaced;
      }
      return value;
    }

    return key;
  };

  // Provide initial layout without client mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'id', setLanguage: changeLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
