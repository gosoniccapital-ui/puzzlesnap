"use client";

import React, { useState, useRef } from "react";
import { Upload, Sparkles, Image as ImageIcon, ArrowRight, Check } from "lucide-react";
import PuzzleGameBoard from "@/components/puzzle/PuzzleGameBoard";

export default function MakePuzzlePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [puzzleTitle, setPuzzleTitle] = useState<string>("My Custom Puzzle");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPuzzleTitle(file.name.replace(/\.[^/.]+$/, ""));
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isPlaying && selectedImage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsPlaying(false)}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition"
          >
            ← Back to Customizer
          </button>
          <button
            onClick={handleCopyLink}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            {copied ? "Link Copied!" : "Share Puzzle"}
          </button>
        </div>

        <PuzzleGameBoard
          imageSrc={selectedImage}
          title={puzzleTitle}
          initialDifficulty={difficulty}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Custom Puzzle Maker
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-100 tracking-tight">
          Turn Any Photo Into a <span className="text-amber-400">Playable Jigsaw</span>
        </h1>
        <p className="text-stone-400 text-sm max-w-lg mx-auto">
          Upload any personal photo or illustration. We slice it in real-time in your browser with no signup required.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-8 backdrop-blur shadow-2xl space-y-8">
        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-700 hover:border-amber-500/80 rounded-2xl p-12 text-center cursor-pointer transition bg-stone-950/40 hover:bg-stone-900/40 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Upload className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-base font-bold text-stone-200">
                Click to browse or drag and drop your photo here
              </p>
              <p className="text-xs text-stone-500 mt-1">Supports PNG, JPG, WEBP, GIF up to 50MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden max-h-[380px] bg-stone-950 flex items-center justify-center border border-stone-800">
              <img
                src={selectedImage}
                alt="Uploaded preview"
                className="max-h-[360px] w-auto object-contain rounded-lg p-2"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black text-stone-200 text-xs font-semibold backdrop-blur transition"
              >
                Change Photo
              </button>
            </div>

            {/* Config Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-2">Puzzle Title</label>
                <input
                  type="text"
                  value={puzzleTitle}
                  onChange={(e) => setPuzzleTitle(e.target.value)}
                  className="w-full bg-stone-950 text-stone-200 text-sm px-4 py-2.5 rounded-xl border border-stone-800 outline-none focus:border-amber-500 transition"
                  placeholder="Enter a title for your puzzle"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-2">Difficulty & Pieces</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition border ${
                        difficulty === diff
                          ? "bg-amber-500 text-stone-950 border-amber-500 shadow-md shadow-amber-500/20"
                          : "bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      {diff === "easy" ? "9 pcs" : diff === "medium" ? "16 pcs" : "30 pcs"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => setIsPlaying(true)}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
            >
              <span>Play Puzzle Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
