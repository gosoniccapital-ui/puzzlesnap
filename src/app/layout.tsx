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
  themeColor: "#ffb703",
  width: "device-width",
  initialScale: 1,
};

import ConditionalFooter from "@/components/layout/ConditionalFooter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fbfaf7] text-stone-900 antialiased selection:bg-[#ffb703] selection:text-stone-950">
        <TrackingPixels />
        <PwaRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
