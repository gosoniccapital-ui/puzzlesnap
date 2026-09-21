import React from "react";
import { ArrowRight, Loader2, CloudUpload } from "lucide-react";

interface MakePuzzlePreviewProps {
  selectedImage: string;
  puzzleTitle: string;
  onTitleChange: (title: string) => void;
  difficulty: "easy" | "medium" | "hard";
  onDifficultyChange: (diff: "easy" | "medium" | "hard") => void;
  isUploading: boolean;
  isCloudStored: boolean;
  onChangePhoto: () => void;
  onPlay: () => void;
}

export function MakePuzzlePreview({
  selectedImage,
  puzzleTitle,
  onTitleChange,
  difficulty,
  onDifficultyChange,
  isUploading,
  isCloudStored,
  onChangePhoto,
  onPlay,
}: MakePuzzlePreviewProps) {
  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden max-h-[380px] bg-stone-100 dark:bg-stone-950 flex items-center justify-center border border-stone-200 dark:border-stone-800">
        <img
          src={selectedImage}
          alt="Uploaded preview"
          className="max-h-[360px] w-auto object-contain rounded-lg p-2"
        />

        {isUploading ? (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold backdrop-blur flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing to Cloud...</span>
          </div>
        ) : isCloudStored ? (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold backdrop-blur flex items-center gap-1.5">
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Cloud Ready</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onChangePhoto}
          className="touch-target absolute top-4 right-4 px-3.5 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-semibold backdrop-blur transition cursor-pointer shadow-xs"
        >
          Change Photo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">
            Puzzle Title
          </label>
          <input
            type="text"
            value={puzzleTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-200 text-sm px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-800 outline-none focus:border-[#dfba73] transition"
            placeholder="Enter a title for your puzzle"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">
            Difficulty & Pieces
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => onDifficultyChange(diff)}
                className={`touch-target py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition border cursor-pointer ${
                  difficulty === diff
                    ? "bg-gradient-to-r from-amber-400 to-[#dfba73] text-stone-950 border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-[#dfba73]/50"
                }`}
              >
                {diff === "easy" ? "9 pcs" : diff === "medium" ? "16 pcs" : "30 pcs"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onPlay}
        className="touch-target w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Play Puzzle Now</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
