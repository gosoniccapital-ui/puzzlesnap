"use client";

import React, { useState } from "react";
import { Users, Copy, Check, Sparkles, X, Share2 } from "lucide-react";
import { RemotePlayer } from "@/lib/puzzle-engine/realtime-room";
import { useTranslation } from "@/lib/i18n";

interface PuzzleCoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomUrl: string;
  players: RemotePlayer[];
  localPlayerName: string;
  isConnected: boolean;
  onConnectRoom: (roomId?: string) => void;
  onLeaveRoom: () => void;
}

export default function PuzzleCoopModal({
  isOpen,
  onClose,
  roomId,
  roomUrl,
  players,
  localPlayerName,
  isConnected,
  onConnectRoom,
  onLeaveRoom,
}: PuzzleCoopModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState("");

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.coop.title}</h3>
              <p className="text-xs text-stone-400">{t.coop.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Status */}
        {isConnected ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-300">{t.coop.roomCode}: <strong>{roomId}</strong></span>
              </div>
              <button
                onClick={onLeaveRoom}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 transition cursor-pointer"
              >
                {t.coop.leaveRoom}
              </button>
            </div>

            {/* Invite Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">{t.coop.copyInviteLink}:</label>
              <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={roomUrl}
                  className="bg-transparent text-xs text-amber-300 font-mono w-full outline-none select-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t.coop.inviteCopied : t.coop.copyInviteLink}</span>
                </button>
              </div>
            </div>

            {/* Connected Players List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="font-semibold">{t.coop.connectedPlayers} ({players.length + 1}):</span>
                <span className="text-[10px] text-amber-400">Live Sync</span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {/* Self */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-stone-200">{localPlayerName} ({t.coop.you})</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">{t.coop.host}</span>
                </div>
                {/* Remote Players */}
                {players.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="font-medium text-stone-300">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Online
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Share this link with friends. Anyone with the link will instantly join and solve pieces together!</span>
            </div>
          </div>
        ) : (
          /* Not connected yet: Create or Join */
          <div className="space-y-4">
            <div className="text-xs text-stone-400 leading-relaxed">
              Create a new room and share the link with friends, or enter an existing Room Code to join.
            </div>

            <button
              onClick={() => onConnectRoom()}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Create New Co-Op Room</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-stone-800"></div>
              <span className="shrink mx-3 text-stone-600 text-[11px] font-bold">OR ENTER ROOM CODE</span>
              <div className="grow border-t border-stone-800"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. ROOM-9821"
                value={customRoomInput}
                onChange={(e) => setCustomRoomInput(e.target.value.toUpperCase())}
                className="bg-stone-950 text-stone-200 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-stone-800 outline-none focus:border-amber-500 transition w-full"
              />
              <button
                disabled={!customRoomInput.trim()}
                onClick={() => onConnectRoom(customRoomInput.trim())}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
