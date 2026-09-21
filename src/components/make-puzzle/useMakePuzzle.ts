"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { RealtimeRoomEngine, RoomPuzzleMeta } from "@/lib/puzzle-engine/realtime-room";

export function useMakePuzzle(roomNotFoundFallbackText: string = "Puzzle image not found from room.") {
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
      fetch("/api/custom-puzzles?id=" + encodeURIComponent(idParam))
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setSelectedImage(json.data.image);
            setPuzzleTitle(json.data.title || "Shared Puzzle");
            if (json.data.difficulty) setDifficulty(json.data.difficulty as any);
            setIsPlaying(true);
          } else if (roomParam) {
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

      engine.requestRoomMeta();
      const retryTimer = setTimeout(() => {
        if (!resolved) engine.requestRoomMeta();
      }, 1500);

      const timeoutTimer = setTimeout(() => {
        if (!resolved) {
          setIsConnectingRoom(false);
          setRoomSyncError(roomNotFoundFallbackText);
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
  }, [searchParams, roomNotFoundFallbackText]);

  // Auto-persist custom puzzle
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
      .catch((err) => console.warn("Auto-persist custom puzzle failed:", err));
  }, [isPlaying, selectedImage, customPuzzleId, puzzleTitle, difficulty]);

  const handleFileSelect = (file: File) => {
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    setPuzzleTitle(cleanName);
    setIsCloudStored(false);
    setCustomPuzzleId(null);
    autoSavedRef.current = false;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateShareLink = async () => {
    if (!selectedImage) return;
    try {
      setIsSharing(true);
      const currentRoom = searchParams.get("room");
      const url = new URL(window.location.href);
      if (currentRoom) url.searchParams.set("room", currentRoom);

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

  return {
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
    roomId: searchParams.get("room") || "",
  };
}
