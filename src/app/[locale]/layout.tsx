import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LocaleSetter } from "@/components/LocaleSetter";
import { type Locale } from "@/lib/i18n";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}

/**
 * Locale-specific Layout
 * 
 * This layout wraps content with theme provider, header, and footer.
 * The root layout at app/layout.tsx provides the HTML structure.
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  return (
    <ThemeProvider>
      <LocaleSetter />
      <div className="app-container">
        <Header />
        {children}
        <Footer locale={locale} />
      </div>
    </ThemeProvider>
  );
}

