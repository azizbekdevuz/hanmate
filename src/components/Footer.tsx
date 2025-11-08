/**
 * Footer Component
 * 
 * Simple footer with tagline and copyright
 */

import { type Locale } from '@/lib/i18n';
import { getTranslations } from '@/lib/get-translations';

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const t = getTranslations(locale);

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-tagline">{t('footer.tagline')}</p>
        <p className="footer-copyright">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}

