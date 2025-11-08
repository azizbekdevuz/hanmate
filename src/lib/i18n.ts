/**
 * i18n Configuration
 * 
 * Supported languages: Korean (ko) and English (en)
 * Default language: Korean
 */

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
 * Translation keys for UI elements
 * In a real app, this would be loaded from translation files
 */
export const translations = {
  ko: {
    nav: {
      home: '홈',
      about: '소개',
    },
    footer: {
      tagline: '따뜻한 AI 동반자',
      copyright: '© 2025 HanMate. All rights reserved.',
    },
    theme: {
      light: '라이트',
      dark: '다크',
      system: '시스템',
    },
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
    },
    footer: {
      tagline: 'A Warm AI Companion',
      copyright: '© 2025 HanMate. All rights reserved.',
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.ko;

