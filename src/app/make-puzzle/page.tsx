"use client";

import React, { Suspense } from "react";
import { Sparkles, Users, Loader2, Check, Share2 } from "lucide-react";
import PuzzleGameBoard from "@/components/puzzle/PuzzleGameBoard";
import { useTranslation } from "@/lib/i18n";

import { MakePuzzleDropzone } from "@/components/make-puzzle/MakePuzzleDropzone";
import { MakePuzzlePreview } from "@/components/make-puzzle/MakePuzzlePreview";
import { MakePuzzleShareModal } from "@/components/make-puzzle/MakePuzzleShareModal";
import { MakePuzzleConnecting } from "@/components/make-puzzle/MakePuzzleConnecting";
import { useMakePuzzle } from "@/components/make-puzzle/useMakePuzzle";

function MakePuzzleContent() {
  const { t } = useTranslation();
  const {
    selectedImage,
    setSelectedImage,
    puzzleTitle,
    setPuzzleTitle,
    difficulty,
    setDifficulty,
    isPlaying,
    setIsPlaying,
    copied,
    setCopied,
    isUploading,
    isCloudStored,
    shareUrl,
    isSharing,
    showShareModal,
    setShowShareModal,
    customPuzzleId,
    isConnectingRoom,
    roomSyncError,
    setRoomSyncError,
    handleFileSelect,
    handleCreateShareLink,
    roomId,
  } = useMakePuzzle(t.makePuzzle?.roomNotFound || "Puzzle image not found from room. The host may have left or the link is invalid.");

  if (isPlaying && selectedImage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            className="touch-target text-xs font-semibold px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 transition cursor-pointer shadow-2xs"
          >
            ← Back to Customizer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateShareLink}
              disabled={isSharing}
              className="touch-target text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSharing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{isSharing ? "Creating Link..." : copied ? "Link Copied!" : "Share Puzzle"}</span>
            </button>
          </div>
        </div>

        <PuzzleGameBoard
          imageSrc={selectedImage}
          title={puzzleTitle}
          initialDifficulty={difficulty}
          initialRoomId={roomId || undefined}
          customPuzzleId={customPuzzleId || undefined}
        />

        <MakePuzzleShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareUrl={shareUrl}
          copied={copied}
          onCopy={() => {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          shareTitle={t.makePuzzle?.shareTitle}
          shareSubtitle={t.makePuzzle?.shareSubtitle}
          sharableLinkText={t.makePuzzle?.sharableLink}
          linkCopiedNotice={t.makePuzzle?.linkCopiedNotice}
        />
      </div>
    );
  }

  if (isConnectingRoom) {
    return (
      <MakePuzzleConnecting
        roomId={roomId}
        joiningRoomText={t.makePuzzle?.joiningRoom}
        syncingWithHostText={t.makePuzzle?.syncingWithHost}
        syncingRealtimeText={t.makePuzzle?.syncingRealtime}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 transition-colors duration-300">
      {roomSyncError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#dfba73] shrink-0" />
            <span>{roomSyncError}</span>
          </div>
          <button
            type="button"
            onClick={() => setRoomSyncError(null)}
            className="touch-target px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#dfba73] hover:brightness-105 text-stone-950 font-bold text-[11px] cursor-pointer shrink-0"
          >
            {t.makePuzzle?.createNewRoom || "Create New Room"}
          </button>
        </div>
      )}

      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#dfba73]" />
          Custom Puzzle Maker
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight font-cinzel">
          Turn Any Photo Into a <span className="gold-gradient-text">Playable Jigsaw</span>
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm max-w-lg mx-auto">
          Upload any personal photo or illustration. We slice it in real-time in your browser with no signup required.
        </p>
      </div>

      {/* Upload & Config Box */}
      <div className="bg-white/90 dark:bg-stone-900/60 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-8 backdrop-blur shadow-xl space-y-8">
        {!selectedImage ? (
          <MakePuzzleDropzone onFileSelect={handleFileSelect} />
        ) : (
          <MakePuzzlePreview
            selectedImage={selectedImage}
            puzzleTitle={puzzleTitle}
            onTitleChange={setPuzzleTitle}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            isUploading={isUploading}
            isCloudStored={isCloudStored}
            onChangePhoto={() => setSelectedImage(null)}
            onPlay={() => setIsPlaying(true)}
          />
        )}
      </div>
    </div>
  );
}

export default function MakePuzzlePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-400">Loading Puzzle Maker...</div>}>
      <MakePuzzleContent />
    </Suspense>
  );
}
