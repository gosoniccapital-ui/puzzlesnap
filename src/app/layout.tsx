import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import PwaRegister from "@/components/pwa/PwaRegister";

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
    icon: "/images/puzzle-icon-192.png",
    apple: "/images/puzzle-icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffb703",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fbfaf7] text-stone-900 antialiased selection:bg-[#ffb703] selection:text-stone-950">
        <PwaRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 bg-white py-12 text-center text-xs text-stone-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-bold text-stone-700">CunFashion — Free Online Jigsaw Puzzles</p>
            <p>© 2026 CunFashion. All rights reserved.</p>
            <div className="pt-2">
              <a href="/admin/login" className="text-stone-300 hover:text-stone-500 text-[11px] transition">
                Admin Access
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
