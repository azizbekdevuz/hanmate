'use client';

/**
 * Header Component
 * 
 * Navigation header with:
 * - Logo/Brand
 * - Theme toggle
 * - Language switcher
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { locales, localeNames, localeFlags, type Locale } from '@/lib/i18n';

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Extract current locale from pathname
  const currentLocale = (pathname.split('/')[1] || 'ko') as Locale;
  const isValidLocale = locales.includes(currentLocale);

  // Get path without locale
  const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

  // Toggle theme
  const handleThemeToggle = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // Switch language
  const handleLanguageSwitch = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    window.location.href = newPath;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo/Brand */}
        <Link href={`/${currentLocale}`} className="header-logo">
          <span className="header-logo-text">HanMate</span>
        </Link>

        {/* Right side controls */}
        <div className="header-controls">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={handleThemeToggle}
            className="header-button header-theme-button"
            aria-label={`Current theme: ${theme}. Click to change theme.`}
            title={`Theme: ${theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}`}
          >
            {resolvedTheme === 'dark' ? (
              <svg className="header-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="header-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* Language Switcher */}
          <div className="header-language-switcher">
            {locales.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLanguageSwitch(locale)}
                className={`header-button header-language-button ${
                  currentLocale === locale ? 'header-language-button-active' : ''
                }`}
                aria-label={`Switch to ${localeNames[locale]}`}
                aria-pressed={currentLocale === locale}
              >
                <span className="header-language-flag">{localeFlags[locale]}</span>
                <span className="header-language-text">{localeNames[locale]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

