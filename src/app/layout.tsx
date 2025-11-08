import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { defaultLocale } from "@/lib/i18n";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HanMate - 따뜻한 AI 동반자",
  description: "한국 독거노인을 위한 음성 기반 AI 동반자. 말씀만 하세요, 제가 들어드릴게요.",
  keywords: ["AI", "elderly care", "voice assistant", "Korea", "loneliness", "companion"],
};

/**
 * Root Layout
 * 
 * This is the root layout that provides the HTML structure.
 * The locale-specific layout at app/[locale]/layout.tsx handles
 * the actual content and theme provider.
 * 
 * Note: The lang attribute will be set dynamically by the locale layout
 * via a client component, but we set a default here for SSR.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

