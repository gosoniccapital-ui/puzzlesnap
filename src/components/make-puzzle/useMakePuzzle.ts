import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { RealtimeRoomEngine, RoomPuzzleMeta } from "@/lib/puzzle-engine/realtime-room";
import {
  SavedCustomPuzzle,
  saveMyCustomPuzzle,
} from "@/lib/puzzle-engine/local-puzzle-history";

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
  const [isResolvingPuzzle, setIsResolvingPuzzle] = useState<boolean>(() => Boolean(searchParams.get("id")));
  const [sharedPuzzleError, setSharedPuzzleError] = useState<string | null>(null);
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
      setIsResolvingPuzzle(true);
      setSharedPuzzleError(null);
      setCustomPuzzleId(idParam);
      fetch("/api/custom-puzzles?id=" + encodeURIComponent(idParam))
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setSelectedImage(json.data.image);
            setPuzzleTitle(json.data.title || "Shared Puzzle");
            if (json.data.difficulty) setDifficulty(json.data.difficulty as any);
            setIsPlaying(true);
            setIsResolvingPuzzle(false);
            // Save to local creations history
            saveMyCustomPuzzle({
              id: json.data.id || idParam,
              title: json.data.title || "Shared Puzzle",
              image: json.data.image,
              difficulty: json.data.difficulty || "medium",
              createdAt: json.data.createdAt || Date.now(),
            });
          } else {
            setIsResolvingPuzzle(false);
            setSharedPuzzleError(json.error || "Shared puzzle not found or link has expired.");
            if (roomParam) cleanupFn = connectAndSyncFromHost(roomParam);
          }
        })
        .catch((err) => {
          console.error("Failed to load shared puzzle:", err);
          setIsResolvingPuzzle(false);
          setSharedPuzzleError("Failed to connect or load shared puzzle.");
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
    } else {
      // When navigating to clean /make-puzzle without query params, reset to customizer
      setIsResolvingPuzzle(false);
      setIsConnectingRoom(false);
      setIsPlaying(false);
      setSelectedImage(null);
      setCustomPuzzleId(null);
      setPuzzleTitle("My Custom Puzzle");
      setSharedPuzzleError(null);
      setRoomSyncError(null);
      autoSavedRef.current = false;
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
    setIsUploading(true);

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
        setIsUploading(false);
        if (data.success && data.data?.id) {
          setCustomPuzzleId(data.data.id);
          const finalImg = data.data.image || selectedImage;
          if (finalImg && finalImg.startsWith("http")) {
            setSelectedImage(finalImg);
            setIsCloudStored(true);
          }
          saveMyCustomPuzzle({
            id: data.data.id,
            title: puzzleTitle,
            image: finalImg,
            difficulty,
            createdAt: Date.now(),
          });
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("id", data.data.id);
            window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
          }
        }
      })
      .catch((err) => {
        setIsUploading(false);
        console.warn("Auto-persist custom puzzle failed:", err);
      });
  }, [isPlaying, selectedImage, customPuzzleId, puzzleTitle, difficulty]);

  const handleFileSelect = (file: File) => {
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    setPuzzleTitle(cleanName);
    setIsCloudStored(false);
    setCustomPuzzleId(null);
    setSharedPuzzleError(null);
    autoSavedRef.current = false;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePlayExisting = (puzzle: SavedCustomPuzzle) => {
    setSelectedImage(puzzle.image);
    setPuzzleTitle(puzzle.title);
    if (["easy", "medium", "hard"].includes(puzzle.difficulty)) {
      setDifficulty(puzzle.difficulty as any);
    }
    setCustomPuzzleId(puzzle.id);
    setIsCloudStored(puzzle.image.startsWith("http"));
    setSharedPuzzleError(null);
    autoSavedRef.current = true;
    setIsPlaying(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("id", puzzle.id);
      window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
    }
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
        const finalImg = data.data.image || selectedImage;
        if (finalImg && finalImg.startsWith("http")) {
          setSelectedImage(finalImg);
          setIsCloudStored(true);
        }
        saveMyCustomPuzzle({
          id: data.data.id,
          title: puzzleTitle,
          image: finalImg,
          difficulty,
          createdAt: Date.now(),
        });
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
    isResolvingPuzzle,
    sharedPuzzleError,
    setSharedPuzzleError,
    roomSyncError,
    setRoomSyncError,
    handleFileSelect,
    handlePlayExisting,
    handleCreateShareLink,
    roomId: searchParams.get("room") || "",
  };
}
