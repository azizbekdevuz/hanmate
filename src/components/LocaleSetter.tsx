'use client';

/**
 * Locale Setter
 * 
 * Client component that sets the HTML lang attribute
 * based on the current locale from the pathname.
 */

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { locales, type Locale } from '@/lib/i18n';

export function LocaleSetter() {
  const pathname = usePathname();

  useEffect(() => {
    // Extract locale from pathname
    const pathLocale = pathname.split('/')[1] as Locale;
    const locale = locales.includes(pathLocale) ? pathLocale : 'ko';
    
    // Set lang attribute on html element
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

