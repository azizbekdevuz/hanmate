/**
 * Footer Component
 * 
 * Simple footer with tagline and copyright
 */

import { getLocale } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = translations[locale as keyof typeof translations] || translations.ko;

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-tagline">{t.footer.tagline}</p>
        <p className="footer-copyright">{t.footer.copyright}</p>
      </div>
    </footer>
  );
}

