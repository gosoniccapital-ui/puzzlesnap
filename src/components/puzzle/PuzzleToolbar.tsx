"use client";

import React from "react";
import { CutStyle } from "@/lib/puzzle-engine/bezier-cutter";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Eye,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Grid,
  MoreHorizontal,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Users,
} from "lucide-react";

export interface PuzzleToolbarProps {
  // Timer & Stats
  seconds: number;
  formatTime: (secs: number) => string;
  isTimerHidden: boolean;
  onToggleTimerHidden: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  moveCount: number;
  placedCount: number;
  totalCount: number;

  // Selectors
  cutStyle: CutStyle;
  onCutStyleChange: (style: CutStyle) => void;
  difficulty: "easy" | "medium" | "hard" | "very-hard" | "supreme";
  onDifficultyChange: (diff: "easy" | "medium" | "hard" | "very-hard" | "supreme") => void;

  // Actions
  onPreview: () => void;
  onArrange: () => void;
  showEdgesOnly: boolean;
  onToggleEdges: () => void;
  isRotationEnabled: boolean;
  onToggleRotation: () => void;
  onRotatePiece?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;

  // Zoom
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;

  // More Menu
  showMoreMenu: boolean;
  onToggleMoreMenu: () => void;
  onCloseMoreMenu: () => void;
  showGhost: boolean;
  onToggleGhost: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onShuffle: () => void;
  onSolve: () => void;
  // Co-Op Multiplayer
  isCoopConnected?: boolean;
  coopPlayerCount?: number;
  onOpenCoopModal?: () => void;
}

export default function PuzzleToolbar({
  seconds,
  formatTime,
  isTimerHidden,
  onToggleTimerHidden,
  isPaused,
  onTogglePause,
  moveCount,
  placedCount,
  totalCount,
  cutStyle,
  onCutStyleChange,
  difficulty,
  onDifficultyChange,
  onPreview,
  onArrange,
  showEdgesOnly,
  onToggleEdges,
  isRotationEnabled,
  onToggleRotation,
  onRotatePiece,
  isFullscreen,
  onToggleFullscreen,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  showMoreMenu,
  onToggleMoreMenu,
  onCloseMoreMenu,
  showGhost,
  onToggleGhost,
  isMuted,
  onToggleMute,
  onShuffle,
  onSolve,
  isCoopConnected,
  coopPlayerCount,
  onOpenCoopModal,
}: PuzzleToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-50 border-b border-stone-200">
      {/* Left: Timer & Move Counters */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePause}
          className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition shadow-2xs cursor-pointer"
          title={isPaused ? "Resume Timer" : "Pause Timer"}
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-600 fill-current" /> : <Pause className="w-4 h-4 text-amber-600" />}
        </button>

        <div
          onClick={onToggleTimerHidden}
          className="font-mono text-sm font-black text-stone-800 bg-white px-3 py-1.5 rounded-xl border border-stone-200 tracking-wider shadow-2xs cursor-pointer select-none"
          title="Click to hide/show timer"
        >
          {isTimerHidden ? "••:••" : formatTime(seconds)}
        </div>

        <div className="text-xs font-bold text-stone-500 hidden sm:block">
          <span>Moves: <strong className="text-stone-800">{moveCount}</strong></span>
          <span className="mx-2">•</span>
          <span>Pieces: <strong className="text-stone-800">{placedCount}/{totalCount}</strong></span>
        </div>
      </div>

      {/* Center: Style & Difficulty Selects */}
      <div className="flex items-center gap-2">
        <select
          value={cutStyle}
          onChange={(e) => onCutStyleChange(e.target.value as CutStyle)}
          className="bg-white text-stone-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-200 outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
        >
          <option value="classic">Classic Style</option>
          <option value="hearts">Hearts Style</option>
          <option value="star">Star Style</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value as any)}
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
          onClick={onPreview}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
          title="Preview Photo"
        >
          <Eye className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden md:inline">Preview</span>
        </button>

        {/* Guide Image on Board */}
        <button
          onClick={onToggleGhost}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 shadow-2xs cursor-pointer ${
            showGhost
              ? "bg-amber-500 text-stone-950 border-amber-500 font-extrabold"
              : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
          }`}
          title="Toggle background guide image on board"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ghost</span>
          <span className={`text-[9px] px-1 py-0.2 rounded font-black ${showGhost ? "bg-stone-950 text-amber-400" : "bg-stone-200 text-stone-600"}`}>
            {showGhost ? "ON" : "OFF"}
          </span>
        </button>

        <button
          onClick={onArrange}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
          title="Arrange pieces to edges"
        >
          <Grid className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden md:inline">Arrange</span>
        </button>

        <button
          onClick={onToggleEdges}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 shadow-2xs cursor-pointer ${
            showEdgesOnly
              ? "bg-amber-500 text-stone-950 border-amber-500 font-extrabold"
              : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
          }`}
          title="Filter border pieces"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Edges</span>
        </button>

        {/* Rotation Mode Toggle Button */}
        <button
          onClick={onToggleRotation}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 shadow-2xs cursor-pointer ${
            isRotationEnabled
              ? "bg-amber-500 text-stone-950 border-amber-500 font-extrabold"
              : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
          }`}
          title={isRotationEnabled ? "Piece Rotation Mode: ON (Click or press Space to rotate)" : "Enable Piece Rotation Mode"}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Rotate</span>
          <span className={`text-[9px] px-1 py-0.2 rounded font-black ${isRotationEnabled ? "bg-stone-950 text-amber-400" : "bg-stone-200 text-stone-600"}`}>
            {isRotationEnabled ? "ON" : "OFF"}
          </span>
        </button>

        {/* Quick Rotate 90deg button when rotation is active */}
        {isRotationEnabled && (
          <button
            onClick={onRotatePiece}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black transition flex items-center gap-1 shadow-2xs cursor-pointer animate-in fade-in"
            title="Rotate selected piece 90° (Shortcut: Space or Right-click)"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-700" />
            <span>90°</span>
          </button>
        )}

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-stone-500" /> : <Maximize className="w-3.5 h-3.5 text-stone-500" />}
          <span className="hidden md:inline">Fullscreen</span>
        </button>

        {/* Multiplayer Co-Op Button */}
        {onOpenCoopModal && (
          <button
            onClick={onOpenCoopModal}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              isCoopConnected
                ? "bg-emerald-500 text-stone-950 border-emerald-400 font-black shadow-emerald-500/20"
                : "bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-400 font-extrabold shadow-amber-500/20"
            }`}
            title="Play together with friends (Multiplayer Co-Op Room)"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isCoopConnected ? `Co-Op (${coopPlayerCount || 1})` : "Co-Op Play"}
            </span>
            {isCoopConnected && (
              <span className="inline-block w-2 h-2 rounded-full bg-stone-950 animate-pulse" />
            )}
          </button>
        )}

        {/* Zoom Control Group on Toolbar */}
        <div className="hidden sm:flex items-center bg-white rounded-lg border border-stone-200 shadow-2xs p-0.5">
          <button
            onClick={onZoomOut}
            className="p-1 rounded text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            className="px-1.5 py-0.5 text-[11px] font-black text-stone-700 hover:text-stone-900 transition cursor-pointer"
            title="Click to Reset Zoom (100%)"
          >
            {zoomPercent}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1 rounded text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* More Dropdown Menu */}
        <div className="relative">
          <button
            onClick={onToggleMoreMenu}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4 text-stone-500" />
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-stone-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-100">
              <button
                onClick={() => {
                  onToggleGhost();
                  onCloseMoreMenu();
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition flex items-center justify-between cursor-pointer"
              >
                <span>Overlay Shadow</span>
                <span className="text-[10px] text-stone-400 font-bold">{showGhost ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={() => {
                  onToggleRotation();
                  onCloseMoreMenu();
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition flex items-center justify-between cursor-pointer"
              >
                <span>Piece Rotation Mode</span>
                <span className={`text-[10px] font-bold ${isRotationEnabled ? "text-amber-600" : "text-stone-400"}`}>
                  {isRotationEnabled ? "ON" : "OFF"}
                </span>
              </button>

              <button
                onClick={() => {
                  onToggleMute();
                  onCloseMoreMenu();
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition flex items-center justify-between cursor-pointer"
              >
                <span>Sound Effects</span>
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              <button
                onClick={() => {
                  onShuffle();
                  onCloseMoreMenu();
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition flex items-center gap-2 border-t border-stone-100 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span>Restart / Shuffle</span>
              </button>

              <button
                onClick={() => {
                  onSolve();
                  onCloseMoreMenu();
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Solve Puzzle</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
