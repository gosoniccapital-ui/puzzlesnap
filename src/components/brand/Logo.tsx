import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export default function Logo({ className = "h-9", showTagline = true }: LogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
      {/* Icon: PuzzleSnap Smiley Puzzle Face */}
      <svg
        viewBox="0 0 58 58"
        className={`${className} w-auto flex-shrink-0 transition transform group-hover:scale-105 duration-200`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="28.773" cy="28.773" r="27.2758" fill="#FFB703" stroke="#1c1917" strokeWidth="2.8" />
        {/* Left puzzle cut */}
        <path
          d="M11.4 25.7C13.7 25.7 14.9 26.8 14.9 27.8C14.9 28.5 14.8 29.6 14.0 30.8H28.8V37.4C28.2 37.0 27.6 36.8 26.8 36.8C25.1 36.8 23.6 38.2 23.6 40.0C23.6 41.7 25.1 43.2 26.8 43.2C27.6 43.2 28.2 42.9 28.8 42.5V57.3C7.8 56.7 1.7 39.5 1.3 30.8H9.4C8.8 30.2 8.2 28.8 8.2 27.8C8.2 26.5 9.1 25.7 11.4 25.7Z"
          fill="white"
        />
        {/* Right puzzle cut */}
        <path
          d="M47.5 29.5C47.9 29.2 48.4 27.3 48.6 26.5C48.2 26.2 47.1 24.2 45.3 24.2C43.5 24.2 42.4 26.2 42.1 26.5C42.3 27.1 42.8 28.9 43.2 29.5H29.0V14.7C29.6 15.1 30.2 15.4 31.0 15.4C32.7 15.4 34.2 13.9 34.2 12.0C34.2 10.2 32.7 8.7 31.0 8.7C30.2 8.7 29.6 8.9 29.0 9.4V2.0C50.0 2.6 56.1 20.5 56.5 29.5H47.5Z"
          fill="white"
        />
        {/* Center lines */}
        <path
          d="M1.3 30.1H9.4C8.8 29.5 8.2 28.0 8.2 27.0C8.2 25.8 9.1 24.9 11.4 24.9C13.7 24.9 14.9 26.1 14.9 27.0C14.9 27.8 14.8 28.8 14.0 30.1H36.2H43.9C43.4 29.5 42.4 28.1 42.4 27.0C42.4 25.7 43.5 24.9 45.7 24.9C47.9 24.9 48.7 26.2 48.7 27.0C48.7 27.7 47.6 29.3 47.3 30.1H56.4"
          stroke="#1c1917"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Eyes */}
        <ellipse cx="20.6" cy="19.8" rx="3.6" ry="5.9" fill="#1c1917" />
        <ellipse cx="38.8" cy="19.8" rx="3.6" ry="5.9" fill="#1c1917" />
        {/* Smile */}
        <path
          d="M46.8 35.6C44.5 43.4 37.3 49.1 28.8 49.1C20.2 49.1 13.0 43.4 10.8 35.6"
          stroke="#1c1917"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Cheeks */}
        <path d="M8.8 37.2C8.8 37.2 9.3 35.6 10.5 35.1C11.8 34.6 12.8 34.8 12.8 34.8" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M48.7 37.2C48.7 37.2 48.2 35.6 47.0 35.1C45.7 34.6 44.7 34.8 44.7 34.8" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      {/* Typography: Wordmark + Tagline */}
      <div className="flex flex-col">
        <span className="text-2xl font-black tracking-tight text-stone-900 leading-none">
          Cun<span className="text-[#e29800]">Fashion</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-semibold text-stone-400 tracking-tight leading-tight mt-0.5">
            Free Online Jigsaw Puzzles
          </span>
        )}
      </div>
    </Link>
  );
}
