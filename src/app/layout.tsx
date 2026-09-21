import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PwaRegister from "@/components/pwa/PwaRegister";
import TrackingPixels from "@/components/analytics/TrackingPixels";

import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  metadataBase: new URL("https://cunfashion.com"),
  title: {
    default: "CunFashion — Free Online Jigsaw Puzzles & Haute Couture Lookbook",
    template: "%s | CunFashion",
  },
  description: "Play thousands of free online jigsaw puzzles on CunFashion. Discover Haute Couture fashion styles, AI Style Advisor, daily challenges, and custom jigsaw puzzles.",
  keywords: ["jigsaw puzzle", "online puzzle", "haute couture", "style advisor", "fashion puzzle", "cunfashion"],
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://cunfashion.com",
  },
  openGraph: {
    title: "CunFashion — Free Online Jigsaw Puzzles & Haute Couture",
    description: "Play free online jigsaw puzzles, explore AI outfit recommendations, and discover luxury capsule collections on CunFashion.",
    url: "https://cunfashion.com",
    siteName: "CunFashion",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/brand/logo-animated.webp",
        width: 1200,
        height: 630,
        alt: "CunFashion Haute Couture & Interactive Puzzles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CunFashion — Free Online Jigsaw Puzzles & Haute Couture",
    description: "Play free online jigsaw puzzles and discover AI outfit recommendations on CunFashion.",
    images: ["/images/brand/logo-animated.webp"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CunFashion",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/brand/logo-mini.png", sizes: "300x300", type: "image/png" },
      { url: "/images/puzzle-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/images/puzzle-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

import ConditionalFooter from "@/components/layout/ConditionalFooter";
import PwaInstallBanner from "@/components/pwa/PwaInstallBanner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebSiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-Flicker Theme Initialization: Light Theme is Strict Default */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cunfashion_theme_v2');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors duration-250 selection:bg-amber-500/25 selection:text-amber-900 dark:selection:text-amber-200">
        <ThemeProvider>
          <TrackingPixels />
          <PwaRegister />
          <PwaInstallBanner />
          <Navbar />
          <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
          <ConditionalFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
