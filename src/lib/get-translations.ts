/**
 * Server-side translation helper
 * 
 * For use in server components (pages, layouts, etc.)
 */

import { translations, type Locale } from './i18n';

export function getTranslations(locale: Locale) {
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
}

