import React from "react";
import { Users, Loader2 } from "lucide-react";

interface MakePuzzleConnectingProps {
  roomId: string;
  joiningRoomText?: string;
  syncingWithHostText?: string;
  syncingRealtimeText?: string;
}

export function MakePuzzleConnecting({
  roomId,
  joiningRoomText,
  syncingWithHostText,
  syncingRealtimeText,
}: MakePuzzleConnectingProps) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6 transition-colors duration-300">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-[#dfba73] flex items-center justify-center mx-auto animate-pulse shadow-xl shadow-amber-500/10">
        <Users className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 font-cinzel">
          {joiningRoomText || "Joining Room"} {roomId}...
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
          {syncingWithHostText || "Connecting to Host to synchronize puzzle image. Please wait a moment..."}
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#dfba73]">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{syncingRealtimeText || "Syncing Realtime..."}</span>
      </div>
    </div>
  );
}
