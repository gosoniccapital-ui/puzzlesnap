"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, Sparkles, Image as ImageIcon, ArrowRight, Check, Loader2, CloudUpload, Share2, Copy, Users } from "lucide-react";
import PuzzleGameBoard from "@/components/puzzle/PuzzleGameBoard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { RealtimeRoomEngine, RoomPuzzleMeta } from "@/lib/puzzle-engine/realtime-room";
import { useTranslation } from "@/lib/i18n";
import SocialLinks from "@/components/layout/SocialLinks";

function MakePuzzleContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [puzzleTitle, setPuzzleTitle] = useState<string>("My Custom Puzzle");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCloudStored, setIsCloudStored] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [customPuzzleId, setCustomPuzzleId] = useState<string | null>(null);
  const [isConnectingRoom, setIsConnectingRoom] = useState(false);
  const [roomSyncError, setRoomSyncError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSavedRef = useRef(false);

  // Load puzzle from URL query params (?id=..., ?img=..., or ?room=...)
  useEffect(() => {
    const idParam = searchParams.get("id");
    const imgParam = searchParams.get("img");
    const titleParam = searchParams.get("title");
    const diffParam = searchParams.get("diff");
    const roomParam = searchParams.get("room");

    let cleanupFn: (() => void) | undefined;

    if (idParam) {
      setCustomPuzzleId(idParam);
      // Fetch custom puzzle by shared ID
      fetch("/api/custom-puzzles?id=" + encodeURIComponent(idParam))
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setSelectedImage(json.data.image);
            setPuzzleTitle(json.data.title || "Shared Puzzle");
            if (json.data.difficulty) setDifficulty(json.data.difficulty as any);
            setIsPlaying(true);
          } else if (roomParam) {
            // Fallback: If in-memory record expired on serverless but room exists, sync from Host!
            cleanupFn = connectAndSyncFromHost(roomParam);
          }
        })
        .catch((err) => {
          console.error("Failed to load shared puzzle:", err);
          if (roomParam) cleanupFn = connectAndSyncFromHost(roomParam);
        });
    } else if (imgParam) {
      setSelectedImage(decodeURIComponent(imgParam));
      if (titleParam) setPuzzleTitle(decodeURIComponent(titleParam));
      if (diffParam && ["easy", "medium", "hard"].includes(diffParam)) {
        setDifficulty(diffParam as any);
      }
      setIsPlaying(true);
    } else if (roomParam) {
      // Direct Co-Op room link without id (e.g. ?room=ROOM-6939) -> Sync from Host!
      cleanupFn = connectAndSyncFromHost(roomParam);
    }

    function connectAndSyncFromHost(targetRoom: string) {
      setIsConnectingRoom(true);
      setRoomSyncError(null);

      const savedName = typeof window !== "undefined" ? localStorage.getItem("cunfashion_player_name") : "";
      const engine = new RealtimeRoomEngine(targetRoom, savedName || "Guest");

      let resolved = false;

      engine.connect(
        () => {},
        () => {},
        () => {},
        (meta: RoomPuzzleMeta) => {
          if (meta && meta.image && !resolved) {
            resolved = true;
            setSelectedImage(meta.image);
            setPuzzleTitle(meta.title || "Co-Op Puzzle");
            if (meta.difficulty && ["easy", "medium", "hard"].includes(meta.difficulty)) {
              setDifficulty(meta.difficulty as any);
            }
            if (meta.puzzleId) {
              setCustomPuzzleId(meta.puzzleId);
            }
            setIsPlaying(true);
            setIsConnectingRoom(false);
            engine.disconnect();
          }
        }
      );

      // Request puzzle metadata from room host
      engine.requestRoomMeta();

      // Retry request after 1.5s in case host was connecting
      const retryTimer = setTimeout(() => {
        if (!resolved) engine.requestRoomMeta();
      }, 1500);

      // Timeout after 8s if no host answers
      const timeoutTimer = setTimeout(() => {
        if (!resolved) {
          setIsConnectingRoom(false);
          setRoomSyncError(
            t.makePuzzle?.roomNotFound || "Puzzle image not found from room. The host may have left or the link is invalid."
          );
          engine.disconnect();
        }
      }, 8000);

      return () => {
        clearTimeout(retryTimer);
        clearTimeout(timeoutTimer);
        engine.disconnect();
      };
    }

    return () => {
      cleanupFn?.();
    };
  }, [searchParams]);

  // Auto-persist custom puzzle and update URL with ?id=... as soon as game begins
  useEffect(() => {
    if (!isPlaying || !selectedImage || customPuzzleId || autoSavedRef.current) return;
    autoSavedRef.current = true;

    fetch("/api/custom-puzzles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: puzzleTitle,
        image: selectedImage,
        difficulty,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.id) {
          setCustomPuzzleId(data.data.id);
          if (data.data.image && data.data.image.startsWith("http")) {
            setSelectedImage(data.data.image);
            setIsCloudStored(true);
          }
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("id", data.data.id);
            window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
          }
        }
      })
      .catch((err) => {
        console.warn("Auto-persist custom puzzle failed:", err);
      });
  }, [isPlaying, selectedImage, customPuzzleId, puzzleTitle, difficulty]);

  // Handle image upload from user device
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      setPuzzleTitle(cleanName);
      setIsCloudStored(false);
      setCustomPuzzleId(null);
      autoSavedRef.current = false;

      // Immediate local preview via FileReader for zero-delay UX
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateShareLink = async () => {
    if (!selectedImage) return;
    try {
      setIsSharing(true);
      const currentRoom = searchParams.get("room");
      const url = new URL(window.location.href);
      if (currentRoom) {
        url.searchParams.set("room", currentRoom);
      }

      // 1. If we already have a persisted customPuzzleId, reuse it immediately
      if (customPuzzleId) {
        url.searchParams.set("id", customPuzzleId);
        const urlWithId = `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
        setShareUrl(urlWithId);
        await navigator.clipboard.writeText(urlWithId);
        setCopied(true);
        setShowShareModal(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }

      // 2. If it is already a web URL, encode directly into query param or save id
      if (selectedImage.startsWith("http://") || selectedImage.startsWith("https://")) {
        url.searchParams.set("img", selectedImage);
        url.searchParams.set("title", puzzleTitle);
        url.searchParams.set("diff", difficulty);
        const directUrl = `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
        setShareUrl(directUrl);
        await navigator.clipboard.writeText(directUrl);
        setCopied(true);
        setShowShareModal(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }

      // 3. If it's a data URL / local file, persist via custom-puzzles API (with Supabase Storage CDN upload)
      const res = await fetch("/api/custom-puzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: puzzleTitle,
          image: selectedImage,
          difficulty,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        setCustomPuzzleId(data.data.id);
        if (data.data.image && data.data.image.startsWith("http")) {
          setSelectedImage(data.data.image);
          setIsCloudStored(true);
        }
        url.searchParams.set("id", data.data.id);
        const urlWithId = `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
        setShareUrl(urlWithId);
        await navigator.clipboard.writeText(urlWithId);
        setCopied(true);
        setShowShareModal(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Failed to generate share link:", err);
    } finally {
      setIsSharing(false);
    }
  };

  if (isPlaying && selectedImage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setIsPlaying(false)}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 transition cursor-pointer shadow-2xs"
          >
            ← Back to Customizer
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateShareLink}
              disabled={isSharing}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
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
          initialRoomId={searchParams.get("room") || undefined}
          customPuzzleId={customPuzzleId || searchParams.get("id") || undefined}
        />

        {/* Share Modal Dialog */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-[#dfba73] flex items-center justify-center font-black">
                    <Share2 className="w-5 h-5 text-[#dfba73]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white font-cinzel">
                      {t.makePuzzle?.shareTitle || "Share Your Puzzle"}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {t.makePuzzle?.shareSubtitle || "Anyone with this link can play this puzzle immediately"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-stone-400 hover:text-stone-900 dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {t.makePuzzle?.sharableLink || "Sharable Puzzle Link"}
                </label>
                <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="bg-transparent text-xs text-amber-600 dark:text-amber-300 font-mono w-full outline-none select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-[#dfba73] hover:brightness-105 text-stone-950 text-xs font-black transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (t.common?.copied || "Copied!") : (t.common?.copy || "Copy")}</span>
                  </button>
                </div>
              </div>

              {/* 1-Click Viral Social Share Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Share Instantly:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition text-[11px] font-semibold"
                  >
                    <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    <span>Facebook</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Play my custom puzzle on CunFashion!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-500/10 hover:bg-stone-500/20 text-stone-800 dark:text-stone-200 border border-stone-500/20 transition text-[11px] font-semibold"
                  >
                    <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    <span>X</span>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Play my custom puzzle on CunFashion! " + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition text-[11px] font-semibold"
                  >
                    <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Play my custom puzzle on CunFashion!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition text-[11px] font-semibold"
                  >
                    <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg>
                    <span>Telegram</span>
                  </a>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
                <Sparkles className="w-4 h-4 text-[#dfba73] shrink-0" />
                <span>
                  {t.makePuzzle?.linkCopiedNotice || "Link copied to clipboard! Share it with your friends via WhatsApp, Messenger, Telegram..."}
                </span>
              </div>

              {/* CunFashion Official Channels */}
              <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                  Follow CunFashion:
                </span>
                <SocialLinks size="sm" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isConnectingRoom) {
    const roomParam = searchParams.get("room");
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6 transition-colors duration-300">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-[#dfba73] flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-amber-500/10">
          <Users className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-cinzel">
            {(t.makePuzzle?.joiningRoom || "Joining Room")} {roomParam}...
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            {t.makePuzzle?.syncingWithHost || "Connecting to Host to synchronize puzzle image. Please wait a moment..."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#dfba73]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t.makePuzzle?.syncingRealtime || "Syncing Realtime..."}</span>
        </div>
      </div>
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
            onClick={() => setRoomSyncError(null)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#dfba73] hover:brightness-105 text-stone-950 font-bold text-[11px] cursor-pointer shrink-0"
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

      {/* Upload Box */}
      <div className="bg-white/90 dark:bg-stone-900/60 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-8 backdrop-blur shadow-xl space-y-8">
        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#dfba73] rounded-2xl p-12 text-center cursor-pointer transition bg-stone-50/70 dark:bg-stone-950/40 hover:bg-stone-100/70 dark:hover:bg-stone-900/40 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#dfba73] flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#dfba73]" />
            </div>
            <div>
              <p className="text-base font-bold text-stone-800 dark:text-stone-200">
                Click to browse or drag and drop your photo here
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Supports PNG, JPG, WEBP, GIF up to 50MB</p>
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
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-semibold backdrop-blur transition cursor-pointer shadow-xs"
              >
                Change Photo
              </button>
            </div>

            {/* Config Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">Puzzle Title</label>
                <input
                  type="text"
                  value={puzzleTitle}
                  onChange={(e) => setPuzzleTitle(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-200 text-sm px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-800 outline-none focus:border-[#dfba73] transition"
                  placeholder="Enter a title for your puzzle"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">Difficulty & Pieces</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition border ${
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

            {/* Launch Button */}
            <button
              onClick={() => setIsPlaying(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#dfba73] to-amber-500 hover:brightness-110 text-stone-950 font-black text-base shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
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

export default function MakePuzzlePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-400">Loading Puzzle Maker...</div>}>
      <MakePuzzleContent />
    </Suspense>
  );
}
