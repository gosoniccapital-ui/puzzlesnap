import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PwaRegister from "@/components/pwa/PwaRegister";
import TrackingPixels from "@/components/analytics/TrackingPixels";

export const metadata: Metadata = {
  title: "CunFashion — Free Online Jigsaw Puzzles",
  description: "Play thousands of free online jigsaw puzzles on CunFashion. Browse by category, try the daily puzzle, or create your own custom jigsaw puzzles from any photo.",
  manifest: "/site.webmanifest",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#09090b] text-stone-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <TrackingPixels />
        <PwaRegister />
        <PwaInstallBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
