import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Puzzle, Sparkles, Upload, Image as ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "PuzzleSnap - Free Online Jigsaw Puzzles & Custom Puzzle Maker",
  description: "Play thousands of free online jigsaw puzzles or turn any photo into your own custom jigsaw puzzle in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-stone-950 text-stone-100 antialiased selection:bg-amber-500 selection:text-stone-950">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Puzzle className="w-5 h-5 text-stone-950 fill-stone-950" />
              </div>
              <span className="text-xl font-black tracking-tight text-stone-100">
                Puzzle<span className="text-amber-400">Snap</span>
              </span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
              <Link href="/" className="hover:text-amber-400 transition flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Daily Puzzle
              </Link>
              <Link href="#categories" className="hover:text-amber-400 transition flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-stone-400" />
                Categories
              </Link>
              <Link href="#maker" className="hover:text-amber-400 transition flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-stone-400" />
                Make Puzzle
              </Link>
            </nav>

            {/* Action button */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 transition">
                Sign In
              </button>
              <Link
                href="#maker"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Make Your Own
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-stone-800/80 bg-stone-950 py-10 text-center text-xs text-stone-500">
          <p>© 2026 PuzzleSnap Full Stack. Built with Next.js 15, Canvas Engine & Anti-slop Design.</p>
        </footer>
      </body>
    </html>
  );
}
