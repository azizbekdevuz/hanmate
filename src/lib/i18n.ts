/**
 * i18n Configuration
 * 
 * Supported languages: Korean (ko) and English (en)
 * Default language: Korean
 * 
 * Translations are loaded from JSON files in src/locales/
 */

import koTranslations from '@/locales/ko.json';
import enTranslations from '@/locales/en.json';

export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ko';

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
};

/**
 * Translation data loaded from JSON files
 */
export const translations = {
  ko: koTranslations,
  en: enTranslations,
} as const;

/**
 * Type for translation keys - helps with type safety
 */
export type TranslationKey = keyof typeof translations.ko;

/**
 * Helper function to get nested translation value
 * Usage: getTranslation(translations.ko, 'nav.home') => '홈'
 */
export function getTranslation(
  translations: typeof translations.ko,
  key: string
): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return key; // Return key if not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}
