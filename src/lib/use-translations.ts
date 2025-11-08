'use client';

/**
 * Translation Hook
 * 
 * Provides easy access to translations in client components.
 * Returns a function to get translated strings by key path.
 */

import { useMemo } from 'react';
import { translations, type Locale } from './i18n';

export function useTranslations(locale: Locale) {
  const t = useMemo(() => {
    const translation = translations[locale] || translations.ko;
    
    return (key: string): string => {
      const keys = key.split('.');
      let value: any = translation;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k as keyof typeof value];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key; // Return key if not found
        }
      }
      
      return typeof value === 'string' ? value : key;
    };
  }, [locale]);

  return t;
}

