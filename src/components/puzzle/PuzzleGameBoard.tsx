"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { PuzzleCanvasEngine } from "@/lib/puzzle-engine/puzzle-canvas";
import { soundFx } from "@/lib/puzzle-engine/sound";
import confetti from "canvas-confetti";
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Trophy,
  CheckCircle2,
  Grid,
} from "lucide-react";

interface PuzzleGameBoardProps {
  imageSrc: string;
  title?: string;
  initialDifficulty?: "easy" | "medium" | "hard";
}

const DIFFICULTY_MAP = {
  easy: { rows: 3, cols: 3, label: "Easy (9 pcs)" },
  medium: { rows: 4, cols: 4, label: "Medium (16 pcs)" },
  hard: { rows: 5, cols: 6, label: "Hard (30 pcs)" },
};

export default function PuzzleGameBoard({
  imageSrc,
  title = "Daily Puzzle",
  initialDifficulty = "medium",
}: PuzzleGameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<PuzzleCanvasEngine | null>(null);

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(initialDifficulty);
  const [placedCount, setPlacedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(16);
  const [moveCount, setMoveCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showGhost, setShowGhost] = useState(false);
  const [showEdgesOnly, setShowEdgesOnly] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Timer interval
  useEffect(() => {
    if (isPaused || isVictory) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isVictory]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVictory = useCallback(() => {
    setIsVictory(true);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  // Initialize Engine
  const initEngine = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      if (!canvasRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;
      canvas.width = rect.width;
      canvas.height = rect.height;

      const { rows, cols } = DIFFICULTY_MAP[difficulty];
      setTotalCount(rows * cols);
      setPlacedCount(0);
      setMoveCount(0);
      setSeconds(0);
      setIsVictory(false);

      if (engineRef.current) {
        engineRef.current.destroy();
      }

      const engine = new PuzzleCanvasEngine(
        canvas,
        img,
        rows,
        cols,
        {
          onProgress: (placed, total) => {
            setPlacedCount(placed);
            setTotalCount(total);
          },
          onVictory: handleVictory,
          onMove: () => setMoveCount((m) => m + 1),
        },
        16
      );

      engine.showGhostImage = showGhost;
      engine.showEdgesOnly = showEdgesOnly;
      engineRef.current = engine;
    };
  }, [imageSrc, difficulty, handleVictory, showGhost, showEdgesOnly]);

  useEffect(() => {
    initEngine();

    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      engineRef.current?.destroy();
    };
  }, [initEngine]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.isMuted = nextMuted;
  };

  const toggleGhost = () => {
    const nextVal = !showGhost;
    setShowGhost(nextVal);
    if (engineRef.current) {
      engineRef.current.showGhostImage = nextVal;
      engineRef.current.render();
    }
  };

  const toggleEdges = () => {
    const nextVal = !showEdgesOnly;
    setShowEdgesOnly(nextVal);
    if (engineRef.current) {
      engineRef.current.showEdgesOnly = nextVal;
      engineRef.current.render();
    }
  };

  const handleArrange = () => {
    engineRef.current?.arrangePieces();
  };

  const handleShuffle = () => {
    engineRef.current?.shuffle();
  };

  const handleSolve = () => {
    engineRef.current?.solve();
  };

  return (
    <div className="flex flex-col w-full h-full min-h-[680px] bg-stone-900 text-stone-100 rounded-2xl overflow-hidden shadow-2xl border border-stone-800">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-stone-950/80 backdrop-blur border-b border-stone-800/80 gap-4">
        {/* Title & Stats */}
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-amber-400 tracking-wide flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {title}
            </h2>
            <div className="text-xs text-stone-400 flex items-center gap-3 mt-0.5">
              <span>
                Progress:{" "}
                <strong className="text-stone-200">
                  {placedCount}/{totalCount}
                </strong>
              </span>
              <span>•</span>
              <span>
                Moves: <strong className="text-stone-200">{moveCount}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Timer & Status */}
        <div className="flex items-center gap-3 bg-stone-900/90 px-4 py-1.5 rounded-full border border-stone-800">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="text-stone-400 hover:text-amber-400 transition"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
          <span className="font-mono text-sm font-semibold tracking-wider text-amber-300">
            {formatTime(seconds)}
          </span>
        </div>

        {/* Right: Difficulty & Action Helpers */}
        <div className="flex items-center gap-2">
          {/* Difficulty Dropdown */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
            className="bg-stone-900 text-stone-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-700 outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="easy">Easy (9 pcs)</option>
            <option value="medium">Medium (16 pcs)</option>
            <option value="hard">Hard (30 pcs)</option>
          </select>

          {/* Helper Buttons */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
            title="Preview Photo"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={toggleGhost}
            className={`p-2 rounded-lg transition ${
              showGhost ? "bg-amber-500 text-stone-950 font-bold" : "bg-stone-800 hover:bg-stone-700 text-stone-300"
            }`}
            title="Overlay Shadow Hint"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={toggleEdges}
            className={`p-2 rounded-lg transition ${
              showEdgesOnly ? "bg-amber-500 text-stone-950 font-bold" : "bg-stone-800 hover:bg-stone-700 text-stone-300"
            }`}
            title="Filter Edges"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={handleArrange}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
            title="Arrange Pieces to Margins"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleShuffle}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
            title="Restart / Shuffle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleSolve}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition flex items-center gap-1.5 ml-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Solve
          </button>
        </div>
      </div>

      {/* 2. Main Interactive Canvas Workspace */}
      <div ref={containerRef} className="relative flex-1 w-full h-[600px] bg-stone-950 overflow-hidden select-none">
        <canvas ref={canvasRef} className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full" />

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
            <h3 className="text-2xl font-bold text-amber-400">Game Paused</h3>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Resume Puzzle
            </button>
          </div>
        )}

        {/* Victory Celebration Modal */}
        {isVictory && (
          <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-30 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-amber-400" />
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-extrabold text-amber-400 tracking-tight">Puzzle Completed!</h3>
              <p className="text-stone-300 text-sm mt-2">
                You solved it in <strong className="text-amber-300">{formatTime(seconds)}</strong> with{" "}
                <strong className="text-amber-300">{moveCount}</strong> moves!
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleShuffle}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Photo Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative bg-stone-900 p-4 rounded-2xl max-w-2xl max-h-[85vh] border border-stone-800 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-base font-bold text-amber-400 mb-3">{title}</h4>
            <img
              src={imageSrc}
              alt={title}
              className="max-h-[65vh] w-auto object-contain rounded-lg border border-stone-800 shadow-xl"
            />
            <button
              onClick={() => setShowPreviewModal(false)}
              className="mt-4 px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
