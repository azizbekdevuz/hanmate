import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
 * Simple root layout for single-page HanMate app.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

