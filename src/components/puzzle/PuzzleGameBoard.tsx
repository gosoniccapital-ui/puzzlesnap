"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { PuzzleCanvasEngine } from "@/lib/puzzle-engine/puzzle-canvas";
import { CutStyle } from "@/lib/puzzle-engine/bezier-cutter";
import { soundFx } from "@/lib/puzzle-engine/sound";
import confetti from "canvas-confetti";
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Trophy,
  CheckCircle2,
  Grid,
  MoreHorizontal,
  ChevronDown,
  Send,
  Loader2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface PuzzleGameBoardProps {
  imageSrc: string;
  title?: string;
  puzzleSlug?: string;
  initialDifficulty?: "easy" | "medium" | "hard" | "very-hard" | "supreme";
}

const DIFFICULTY_MAP = {
  easy: { rows: 3, cols: 3, label: "Easy (9 pcs)" },
  medium: { rows: 4, cols: 4, label: "Medium (16 pcs)" },
  hard: { rows: 5, cols: 6, label: "Hard (30 pcs)" },
  "very-hard": { rows: 5, cols: 8, label: "Very Hard (40 pcs)" },
  supreme: { rows: 5, cols: 10, label: "Supreme (50 pcs)" },
};

export interface LeaderboardItem {
  id: string;
  puzzleSlug: string;
  playerName: string;
  pieceCount: number;
  elapsedSeconds: number;
  moves: number;
  createdAt: string;
}

export default function PuzzleGameBoard({
  imageSrc,
  title = "Daily Puzzle",
  puzzleSlug = "colorful-fireworks-jigsaw-puzzle",
  initialDifficulty = "medium",
}: PuzzleGameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<PuzzleCanvasEngine | null>(null);

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "very-hard" | "supreme">(
    initialDifficulty
  );
  const [cutStyle, setCutStyleState] = useState<CutStyle>("classic");
  const [placedCount, setPlacedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(16);
  const [moveCount, setMoveCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimerHidden, setIsTimerHidden] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showGhost, setShowGhost] = useState(false);
  const [showEdgesOnly, setShowEdgesOnly] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  // Leaderboard & Player Score state
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Load player name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("puzzlesnap_player_name");
      if (saved) setPlayerName(saved);
    }
  }, []);

  // Fetch leaderboard scores from API
  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoadingScores(true);
      const { rows, cols } = DIFFICULTY_MAP[difficulty];
      const pieceCount = rows * cols;
      const res = await fetch(`/api/scores?slug=${encodeURIComponent(puzzleSlug)}&pieceCount=${pieceCount}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLeaderboard(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    } finally {
      setIsLoadingScores(false);
    }
  }, [puzzleSlug, difficulty]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Timer interval
  useEffect(() => {
    if (isPaused || isVictory) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isVictory]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVictory = useCallback(() => {
    setIsVictory(true);
    setScoreSubmitted(false);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmittingScore) return;
    setIsSubmittingScore(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("puzzlesnap_player_name", playerName.trim());
      }
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puzzleSlug,
          playerName: playerName.trim(),
          pieceCount: totalCount,
          elapsedSeconds: seconds,
          moves: moveCount,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setScoreSubmitted(true);
        fetchLeaderboard();
      }
    } catch (err) {
      console.error("Failed to submit score", err);
    } finally {
      setIsSubmittingScore(false);
    }
  };


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
      setZoomPercent(100);

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
          onZoomChange: (scale) => setZoomPercent(Math.round(scale * 100)),
        },
        16,
        cutStyle
      );

      engine.showGhostImage = showGhost;
      engine.showEdgesOnly = showEdgesOnly;
      engineRef.current = engine;
    };
  }, [imageSrc, difficulty, cutStyle, handleVictory, showGhost, showEdgesOnly]);

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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleCutStyleChange = (newStyle: CutStyle) => {
    setCutStyleState(newStyle);
    if (engineRef.current) {
      engineRef.current.setCutStyle(newStyle);
    }
  };

  const handleArrange = () => {
    engineRef.current?.arrangePieces();
  };

  const handleShuffle = () => {
    engineRef.current?.shuffle();
    setSeconds(0);
    setMoveCount(0);
    setIsVictory(false);
  };

  const handleSolve = () => {
    engineRef.current?.solve();
  };

  const handleZoomIn = () => {
    engineRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    engineRef.current?.zoomOut();
  };

  const handleResetZoom = () => {
    engineRef.current?.resetZoom();
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
      {/* 1. Puzzle Toolbar (Identical layout to PuzzleSnap) */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2.5 bg-stone-50 border-b border-stone-200 gap-3">
        {/* Left: Timer Group */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white px-3 py-1 rounded-full border border-stone-200 shadow-xs">
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="text-stone-500 hover:text-stone-900 transition mr-2"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-600 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsTimerHidden((h) => !h)}
              className="text-stone-400 hover:text-stone-700 transition mr-2"
              title={isTimerHidden ? "Show timer" : "Hide timer"}
            >
              {isTimerHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            {!isTimerHidden ? (
              <span className="font-mono text-xs font-extrabold text-stone-800">
                {formatTime(seconds)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-stone-400 italic">Hidden</span>
            )}
          </div>

          <div className="text-xs font-bold text-stone-500 hidden sm:block">
            <span>Moves: <strong className="text-stone-800">{moveCount}</strong></span>
            <span className="mx-2">•</span>
            <span>Pieces: <strong className="text-stone-800">{placedCount}/{totalCount}</strong></span>
          </div>
        </div>

        {/* Center: Style & Difficulty Selects */}
        <div className="flex items-center gap-2">
          {/* Cut Style Select */}
          <select
            value={cutStyle}
            onChange={(e) => handleCutStyleChange(e.target.value as CutStyle)}
            className="bg-white text-stone-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-200 outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
          >
            <option value="classic">Classic Style</option>
            <option value="hearts">Hearts Style</option>
            <option value="star">Star Style</option>
          </select>

          {/* Difficulty Select */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="bg-white text-stone-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-200 outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
          >
            <option value="easy">Easy (9 pcs)</option>
            <option value="medium">Medium (16 pcs)</option>
            <option value="hard">Hard (30 pcs)</option>
            <option value="very-hard">Very Hard (40 pcs)</option>
            <option value="supreme">Supreme (50 pcs)</option>
          </select>
        </div>

        {/* Right: Helper Action Tools */}
        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 transition flex items-center gap-1 shadow-2xs"
            title="Preview Photo"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline">Preview</span>
          </button>

          <button
            onClick={handleArrange}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 transition flex items-center gap-1 shadow-2xs"
            title="Arrange pieces to edges"
          >
            <Grid className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline">Arrange</span>
          </button>

          <button
            onClick={toggleEdges}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 shadow-2xs ${
              showEdgesOnly
                ? "bg-amber-500 text-stone-950 border-amber-500 font-extrabold"
                : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
            }`}
            title="Filter border pieces"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Edges</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 transition flex items-center gap-1 shadow-2xs"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-stone-500" /> : <Maximize className="w-3.5 h-3.5 text-stone-500" />}
            <span className="hidden md:inline">Fullscreen</span>
          </button>

          {/* Zoom Control Group on Toolbar */}
          <div className="hidden sm:flex items-center bg-white rounded-lg border border-stone-200 shadow-2xs p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 text-[11px] font-black text-stone-700 hover:text-stone-900 transition cursor-pointer"
              title="Click to Reset Zoom (100%)"
            >
              {zoomPercent}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* More Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu((prev) => !prev)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 transition flex items-center gap-1 shadow-2xs"
            >
              <MoreHorizontal className="w-4 h-4 text-stone-500" />
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-stone-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    toggleGhost();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition flex items-center justify-between"
                >
                  <span>Overlay Shadow</span>
                  <span className="text-[10px] text-stone-400 font-bold">{showGhost ? "ON" : "OFF"}</span>
                </button>

                <button
                  onClick={() => {
                    toggleMute();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition flex items-center justify-between"
                >
                  <span>Sound Effects</span>
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>

                <button
                  onClick={() => {
                    handleShuffle();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition flex items-center gap-2 border-t border-stone-100"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                  <span>Restart / Shuffle</span>
                </button>

                <button
                  onClick={() => {
                    handleSolve();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Solve Puzzle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Canvas Interactive Workspace */}
      <div
        ref={containerRef}
        className="relative w-full h-[620px] bg-[#f2ede4] overflow-hidden select-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full" />

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in duration-200">
            <h3 className="text-2xl font-black text-white tracking-tight">Puzzle Paused</h3>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 rounded-full bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 font-extrabold text-sm shadow-xl transition flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Resume Solving
            </button>
          </div>
        )}

        {/* Victory Celebration Modal */}
        {isVictory && (
          <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-5 z-30 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#ffb703] text-stone-950 flex items-center justify-center shadow-xl">
              <CheckCircle2 className="w-10 h-10 text-stone-950" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-3xl font-black text-white tracking-tight">Congratulations!</h3>
              <p className="text-stone-300 text-xs sm:text-sm">
                You completed <strong className="text-amber-400">{title}</strong> in{" "}
                <strong className="text-amber-400 font-mono">{formatTime(seconds)}</strong> with{" "}
                <strong className="text-amber-400">{moveCount} moves</strong>!
              </p>
            </div>

            {/* Score Submission Form */}
            {!scoreSubmitted ? (
              <form
                onSubmit={handleSubmitScore}
                className="flex flex-col sm:flex-row items-center gap-2 bg-stone-900/90 p-2.5 rounded-2xl border border-stone-800 shadow-xl"
              >
                <input
                  type="text"
                  placeholder="Enter your nickname..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={25}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-100 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-400 border border-stone-700 w-48 sm:w-56"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmittingScore || !playerName.trim()}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 font-black text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmittingScore ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Save to Leaderboard
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/60 px-4 py-2 rounded-full border border-emerald-700/60 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Your score was recorded on the Leaderboard!
              </div>
            )}

            <button
              onClick={handleShuffle}
              className="px-6 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer border border-stone-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Play Again
            </button>
          </div>
        )}

        {/* Floating Zoom Controls (Convenient for mobile pinch/touch and quick resetting) */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-md p-1 gap-1 select-none">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-0.5 text-[11px] font-black text-stone-700 hover:text-stone-900 rounded-md hover:bg-stone-100 transition min-w-[42px] text-center cursor-pointer"
            title="Reset Zoom to 100%"
          >
            {zoomPercent}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Leaderboard Under Board (Matching PuzzleSnap layout) */}
      <div className="p-5 sm:p-6 bg-white border-t border-stone-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-stone-900">Leaderboard & High Scores</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
              {totalCount} Pieces
            </span>
          </div>
          <span className="text-xs text-stone-400 font-semibold">Lower score is better (Time + Moves)</span>
        </div>

        <div className="overflow-x-auto">
          {isLoadingScores ? (
            <div className="py-8 flex items-center justify-center gap-2 text-stone-400 text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              Loading leaderboard rankings...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs font-medium">
              No high scores recorded yet for {totalCount} pieces. Be the first to solve it and claim rank #1!
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase font-bold text-stone-400 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Player</th>
                  <th className="py-2.5 px-3 text-right">Time</th>
                  <th className="py-2.5 px-3 text-right">Moves</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
                {leaderboard.map((score, index) => (
                  <tr key={score.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-2.5 px-3 font-extrabold text-stone-900">
                      {index === 0 ? "🥇 #1" : index === 1 ? "🥈 #2" : index === 2 ? "🥉 #3" : `#${index + 1}`}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-stone-800">{score.playerName}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-600">{formatTime(score.elapsedSeconds)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-500">{score.moves}</td>
                    <td className="py-2.5 px-3 text-right font-black text-amber-600">
                      {score.elapsedSeconds + score.moves}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. Photo Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative bg-white p-4 rounded-3xl max-w-2xl max-h-[85vh] border border-stone-200 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-base font-extrabold text-stone-900 mb-3">{title}</h4>
            <img
              src={imageSrc}
              alt={title}
              className="max-h-[65vh] w-auto object-contain rounded-xl border border-stone-100 shadow-md"
            />
            <button
              onClick={() => setShowPreviewModal(false)}
              className="mt-4 px-6 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
