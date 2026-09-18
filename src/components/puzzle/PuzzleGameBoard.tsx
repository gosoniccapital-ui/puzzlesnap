"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { PuzzleCanvasEngine } from "@/lib/puzzle-engine/puzzle-canvas";
import { CutStyle } from "@/lib/puzzle-engine/bezier-cutter";
import { soundFx } from "@/lib/puzzle-engine/sound";
import confetti from "canvas-confetti";
import { Play } from "lucide-react";

import PuzzleToolbar from "./PuzzleToolbar";
import PuzzleLeaderboard, { LeaderboardItem } from "./PuzzleLeaderboard";
import PuzzleVictoryModal from "./PuzzleVictoryModal";
import PuzzlePreviewModal from "./PuzzlePreviewModal";
import PuzzleZoomWidget from "./PuzzleZoomWidget";
import PuzzleCoopModal from "./PuzzleCoopModal";
import { RealtimeRoomEngine, RemotePlayer } from "@/lib/puzzle-engine/realtime-room";

export type { LeaderboardItem };

interface PuzzleGameBoardProps {
  imageSrc: string;
  title?: string;
  puzzleSlug?: string;
  initialDifficulty?: "easy" | "medium" | "hard" | "very-hard" | "supreme";
  voucherCode?: string;
  discountPercent?: number;
  productUrl?: string;
  productPriceOriginal?: string;
  productPriceSale?: string;
}

const DIFFICULTY_MAP = {
  easy: { rows: 3, cols: 3, label: "Easy (9 pcs)" },
  medium: { rows: 4, cols: 4, label: "Medium (16 pcs)" },
  hard: { rows: 5, cols: 6, label: "Hard (30 pcs)" },
  "very-hard": { rows: 5, cols: 8, label: "Very Hard (40 pcs)" },
  supreme: { rows: 5, cols: 10, label: "Supreme (50 pcs)" },
};

export default function PuzzleGameBoard({
  imageSrc,
  title = "Daily Puzzle",
  puzzleSlug = "colorful-fireworks-jigsaw-puzzle",
  initialDifficulty = "medium",
  voucherCode,
  discountPercent,
  productUrl,
  productPriceOriginal,
  productPriceSale,
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
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);

  // Leaderboard & Player Score state
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Multiplayer Co-Op state
  const [showCoopModal, setShowCoopModal] = useState(false);
  const [coopRoomId, setCoopRoomId] = useState("");
  const [coopPlayers, setCoopPlayers] = useState<RemotePlayer[]>([]);
  const [isCoopConnected, setIsCoopConnected] = useState(false);
  const coopEngineRef = useRef<RealtimeRoomEngine | null>(null);

  // Load player name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cunfashion_player_name") || localStorage.getItem("puzzlesnap_player_name");
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

  // Initialize Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isSubscribed = true;
    const { rows, cols } = DIFFICULTY_MAP[difficulty];
    setTotalCount(rows * cols);
    setPlacedCount(0);
    setMoveCount(0);
    setIsVictory(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      if (!isSubscribed || !canvasRef.current) return;

      const engine = new PuzzleCanvasEngine(
        canvasRef.current,
        img,
        rows,
        cols,
        {
          onProgress: (placed, total) => {
            setPlacedCount(placed);
            setTotalCount(total);
          },
          onVictory: handleVictory,
          onMove: () => {
            setMoveCount((prev) => prev + 1);
          },
          onZoomChange: (scale) => {
            setZoomPercent(Math.round(scale * 100));
          },
          onPieceMove: (pieceId, currentPos, rotation) => {
            if (coopEngineRef.current) {
              coopEngineRef.current.broadcastPieceMove(pieceId, currentPos, rotation);
            }
          },
          onPieceSnap: (pieceId, currentPos) => {
            if (coopEngineRef.current) {
              coopEngineRef.current.broadcastPieceSnap(pieceId, currentPos);
            }
          },
        },
        16,
        cutStyle,
        isRotationEnabled
      );

      engineRef.current = engine;
      engine.resize();
    };

    return () => {
      isSubscribed = false;
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [imageSrc, difficulty, handleVictory, cutStyle, isRotationEnabled]);

  // Window & Orientation resize observer
  useEffect(() => {
    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Co-Op Room Handlers
  const handleConnectCoopRoom = useCallback((targetRoomId?: string) => {
    const roomId = targetRoomId || "ROOM-" + Math.floor(1000 + Math.random() * 9000);
    setCoopRoomId(roomId);

    if (coopEngineRef.current) {
      coopEngineRef.current.disconnect();
    }

    const coopEngine = new RealtimeRoomEngine(roomId, playerName);
    coopEngine.connect(
      (updatedPlayers) => {
        setCoopPlayers([...updatedPlayers]);
      },
      (pieceEvent) => {
        if (engineRef.current) {
          engineRef.current.updateRemotePiece(
            pieceEvent.pieceId,
            pieceEvent.currentPos,
            pieceEvent.rotation,
            false
          );
        }
      },
      (snapEvent) => {
        if (engineRef.current) {
          engineRef.current.updateRemotePiece(
            snapEvent.pieceId,
            snapEvent.currentPos,
            0,
            true
          );
        }
      }
    );

    coopEngineRef.current = coopEngine;
    setIsCoopConnected(true);
  }, [playerName]);

  const handleLeaveCoopRoom = useCallback(() => {
    if (coopEngineRef.current) {
      coopEngineRef.current.disconnect();
      coopEngineRef.current = null;
    }
    setIsCoopConnected(false);
    setCoopRoomId("");
    setCoopPlayers([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (coopEngineRef.current) {
        coopEngineRef.current.disconnect();
        coopEngineRef.current = null;
      }
    };
  }, []);

  // Action handlers
  const handleShuffle = () => {
    if (engineRef.current) {
      engineRef.current.shuffle();
      setMoveCount(0);
      setPlacedCount(0);
      setIsVictory(false);
      setScoreSubmitted(false);
      soundFx.playClick();
    }
  };

  const handleArrange = () => {
    if (engineRef.current) {
      engineRef.current.arrangePieces();
      soundFx.playClick();
    }
  };

  const handleSolve = () => {
    if (engineRef.current) {
      engineRef.current.solve();
    }
  };

  const toggleEdges = () => {
    if (engineRef.current) {
      const next = !showEdgesOnly;
      setShowEdgesOnly(next);
      engineRef.current.showEdgesOnly = next;
      engineRef.current.render();
      soundFx.playClick();
    }
  };

  const toggleRotation = () => {
    const next = !isRotationEnabled;
    setIsRotationEnabled(next);
    if (engineRef.current) {
      engineRef.current.toggleRotationMode(next);
      soundFx.playClick();
    }
  };

  const handleRotatePiece = () => {
    if (engineRef.current) {
      engineRef.current.rotateSelectedPiece(true);
    }
  };

  const toggleGhost = () => {
    if (engineRef.current) {
      const next = !showGhost;
      setShowGhost(next);
      engineRef.current.showGhostImage = next;
      engineRef.current.render();
      soundFx.playClick();
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.muted = next;
  };

  const handleCutStyleChange = (style: CutStyle) => {
    setCutStyleState(style);
    if (engineRef.current) {
      engineRef.current.setCutStyle(style);
      soundFx.playClick();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleZoomIn = () => {
    if (engineRef.current) {
      engineRef.current.zoomIn();
      soundFx.playClick();
    }
  };

  const handleZoomOut = () => {
    if (engineRef.current) {
      engineRef.current.zoomOut();
      soundFx.playClick();
    }
  };

  const handleResetZoom = () => {
    if (engineRef.current) {
      engineRef.current.resetZoom();
      soundFx.playClick();
    }
  };

  // Submit score to Leaderboard API
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmittingScore) return;

    try {
      setIsSubmittingScore(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("cunfashion_player_name", playerName.trim());
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

      const data = await res.json();
      if (data.success) {
        setScoreSubmitted(true);
        fetchLeaderboard();
      }
    } catch (err) {
      console.error("Failed to submit score", err);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
      {/* 1. Header Control Toolbar */}
      <PuzzleToolbar
        seconds={seconds}
        formatTime={formatTime}
        isTimerHidden={isTimerHidden}
        onToggleTimerHidden={() => setIsTimerHidden((prev) => !prev)}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        moveCount={moveCount}
        placedCount={placedCount}
        totalCount={totalCount}
        cutStyle={cutStyle}
        onCutStyleChange={handleCutStyleChange}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onPreview={() => setShowPreviewModal(true)}
        onArrange={handleArrange}
        showEdgesOnly={showEdgesOnly}
        onToggleEdges={toggleEdges}
        isRotationEnabled={isRotationEnabled}
        onToggleRotation={toggleRotation}
        onRotatePiece={handleRotatePiece}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        zoomPercent={zoomPercent}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        showMoreMenu={showMoreMenu}
        onToggleMoreMenu={() => setShowMoreMenu((prev) => !prev)}
        onCloseMoreMenu={() => setShowMoreMenu(false)}
        showGhost={showGhost}
        onToggleGhost={toggleGhost}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onShuffle={handleShuffle}
        onSolve={handleSolve}
        isCoopConnected={isCoopConnected}
        coopPlayerCount={coopPlayers.length + 1}
        onOpenCoopModal={() => setShowCoopModal(true)}
      />

      {/* 2. Main Canvas Interactive Workspace */}
      <div
        ref={containerRef}
        className="relative w-full h-[620px] bg-[#f2ede4] overflow-hidden select-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full" />

        {/* Floating Mini Reference Image (Ảnh Mẫu Gốc Góc Bàn Cờ) */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-lg p-2 max-w-[150px] transition-all hover:scale-105 group">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-600">Ảnh Mẫu</span>
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="text-[10px] font-extrabold text-amber-600 hover:text-amber-700 transition cursor-pointer"
              title="Phóng to ảnh mẫu"
            >
              Phóng to ↗
            </button>
          </div>
          <div
            onClick={() => setShowPreviewModal(true)}
            className="w-full aspect-4/3 rounded-xl overflow-hidden cursor-pointer border border-stone-200/80 bg-stone-100 relative shadow-2xs"
            title="Nhấp để xem ảnh mẫu kích thước lớn"
          >
            <img src={imageSrc} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          </div>
        </div>

        {/* Rotation Mode Active Hint Badge */}
        {isRotationEnabled && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-amber-500/90 text-stone-950 text-xs font-black shadow-md backdrop-blur-xs flex items-center gap-1.5 animate-in fade-in duration-200 select-none pointer-events-none">
            <span className="inline-block w-2 h-2 rounded-full bg-stone-950 animate-pulse" />
            <span>Xoay mảnh: Spacebar / Chuột phải / Chạm đúp</span>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in duration-200">
            <h3 className="text-2xl font-black text-white tracking-tight">Puzzle Paused</h3>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 rounded-full bg-[#ffb703] hover:bg-[#e0a102] text-stone-950 font-extrabold text-sm shadow-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              Resume Solving
            </button>
          </div>
        )}

        {/* Victory Celebration Modal */}
        <PuzzleVictoryModal
          isOpen={isVictory}
          title={title}
          seconds={seconds}
          moveCount={moveCount}
          formatTime={formatTime}
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          onSubmitScore={handleSubmitScore}
          isSubmittingScore={isSubmittingScore}
          scoreSubmitted={scoreSubmitted}
          onPlayAgain={handleShuffle}
          voucherCode={voucherCode}
          discountPercent={discountPercent}
          productUrl={productUrl}
          productPriceOriginal={productPriceOriginal}
          productPriceSale={productPriceSale}
          imageSrc={imageSrc}
        />

        {/* Floating Zoom & Quick Rotate Controls */}
        <PuzzleZoomWidget
          zoomPercent={zoomPercent}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          isRotationEnabled={isRotationEnabled}
          onRotatePiece={handleRotatePiece}
        />
      </div>

      {/* 3. Leaderboard Under Board */}
      <PuzzleLeaderboard
        leaderboard={leaderboard}
        isLoading={isLoadingScores}
        totalCount={totalCount}
        formatTime={formatTime}
      />

      {/* 4. Photo Preview Modal */}
      <PuzzlePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={title}
        imageSrc={imageSrc}
      />

      {/* 5. Multiplayer Co-Op Modal */}
      <PuzzleCoopModal
        isOpen={showCoopModal}
        onClose={() => setShowCoopModal(false)}
        roomId={coopRoomId}
        roomUrl={typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?room=${coopRoomId}` : ""}
        players={coopPlayers}
        localPlayerName={playerName || "You"}
        isConnected={isCoopConnected}
        onConnectRoom={handleConnectCoopRoom}
        onLeaveRoom={handleLeaveCoopRoom}
      />
    </div>
  );
}
