"use client";

import React, { useState } from "react";
import PuzzleGameBoard from "@/components/puzzle/PuzzleGameBoard";
import { Sparkles, Upload, Flame, Heart, Compass, Trophy } from "lucide-react";

const CATEGORIES = [
  { name: "Daily Challenge", icon: Flame, active: true },
  { name: "Nature & Landscapes", icon: Compass, active: false },
  { name: "Animals & Wildlife", icon: Heart, active: false },
  { name: "Art & Architecture", icon: Trophy, active: false },
];

export default function Home() {
  const [customImage, setCustomImage] = useState<string>("/images/sample-puzzle.jpg");
  const [puzzleTitle, setPuzzleTitle] = useState<string>("Enchanted Aurora & Mountains");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImage(event.target.result as string);
          setPuzzleTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Hero Section */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-stone-800/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Free Online Jigsaw Game
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-100 tracking-tight">
            Play & Create <span className="text-amber-400">Jigsaw Puzzles</span>
          </h1>
          <p className="text-stone-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Experience our 60fps smooth Canvas Jigsaw Engine with magnetic snapping,
            custom photo cutting, and instant link sharing.
          </p>
        </div>

        {/* Quick Upload Action */}
        <div id="maker" className="flex items-center gap-3">
          <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-sm font-semibold border border-stone-700/80 shadow-md hover:border-amber-500 transition flex items-center gap-2">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Upload Your Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </section>

      {/* 2. Interactive Game Board */}
      <section className="w-full">
        <PuzzleGameBoard
          key={customImage}
          imageSrc={customImage}
          title={puzzleTitle}
          initialDifficulty="medium"
        />
      </section>

      {/* 3. Category Filter Chips */}
      <section id="categories" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-200">Explore Puzzle Categories</h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                  cat.active
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-stone-900/80 border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
