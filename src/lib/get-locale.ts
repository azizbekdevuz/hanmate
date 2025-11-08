import { defaultLocale, type Locale } from './i18n';

/**
 * Get locale from request headers (set by middleware)
 * Falls back to default locale if not found
 * 
 * Note: In App Router with [locale] params, prefer using params.locale directly
 */
export async function getLocale(): Promise<Locale> {
  // This is a fallback - prefer using params.locale in page components
  return defaultLocale;
}

