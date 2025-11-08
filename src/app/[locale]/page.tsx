/**
 * HanMate - Main Page
 * 
 * Hackathon: AngelHack x Coupang "AI for Real-World Impact & Future Ventures"
 * Problem: Korean elders living alone need emotional support; digital tools are too complex.
 * Solution: Voice-first, Korean, emotionally aware AI companion with social bridge potential.
 * 
 * This is the main interface where elders interact with HanMate via voice.
 */

import { type Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/get-translations";
import { VoiceInterface } from "@/components/VoiceInterface";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const t = getTranslations(locale);

  return (
    <main className="app-main">
      <div className="app-content">
        <h1 className="app-title">HanMate</h1>
        <p className="app-subtitle">
          {t('common.subtitle')}
        </p>
        
        {/* Voice Interface */}
        <VoiceInterface locale={locale} />
      </div>
    </main>
  );
}

