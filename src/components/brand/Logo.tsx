import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  variant?: "animated" | "transparent" | "static" | "video";
}

export default function Logo({
  className = "h-11",
  showTagline = true,
  variant = "animated",
}: LogoProps) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 group select-none transition-transform active:scale-[0.98]"
      aria-label="CunFashion Home"
    >
      {/* Brand Icon / Emblem Container */}
      <div
        className={`relative ${className} aspect-square flex-shrink-0 rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-pink-500/25 ${
          variant === "transparent"
            ? "bg-transparent"
            : "bg-stone-950 ring-1 ring-stone-800/80 group-hover:ring-pink-500/50"
        }`}
      >
        {variant === "video" ? (
          <video
            src="/videos/logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/images/brand/cunfashion-mark.webp"
          />
        ) : variant === "transparent" ? (
          <Image
            src="/images/brand/cunfashion-transparent.webp"
            alt="CunFashion Mark"
            width={48}
            height={48}
            className="w-full h-full object-contain p-0.5"
            priority
          />
        ) : variant === "static" ? (
          <Image
            src="/images/brand/cunfashion-mark.webp"
            alt="CunFashion Mark"
            width={48}
            height={48}
            className="w-full h-full object-cover"
            priority
          />
        ) : (
          /* Default: Animated WebP (Full 24-bit TrueColor + smooth loop without video autoplay block) */
          <Image
            src="/images/brand/logo-animated.webp"
            alt="CunFashion Animated Logo"
            width={48}
            height={48}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            unoptimized
            priority
          />
        )}

        {/* Ambient Neon Glow Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Typography: Wordmark + Tagline */}
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tight text-stone-900 leading-none group-hover:text-stone-950 transition">
          Cun<span className="text-pink-600 group-hover:text-pink-500 transition">Fashion</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-bold text-stone-500 tracking-wider uppercase leading-tight mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            Haute Couture Puzzles
          </span>
        )}
      </div>
    </Link>
  );
}
