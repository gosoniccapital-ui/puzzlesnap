import { supabase, isSupabaseConfigured } from "../supabase/client";

export interface RemotePlayer {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  activePieceId?: number | null;
  lastActive: number;
}

export interface PieceSyncEvent {
  pieceId: number;
  currentPos: { x: number; y: number };
  rotation: number;
  isPlaced: boolean;
  senderId: string;
}

export interface RoomPuzzleMeta {
  puzzleId?: string;
  puzzleSlug?: string;
  title: string;
  image: string;
  difficulty?: string;
}

export interface VictorySyncEvent {
  winnerId: string;
  winnerName: string;
  timeFormatted: string;
  seconds: number;
  moves: number;
  timestamp: number;
}

export interface PlacedPieceSnapshot {
  pieceId: number;
  currentPos: { x: number; y: number };
  rotation: number;
}

const PLAYER_COLORS = [
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#84cc16", // Lime
];

export class RealtimeRoomEngine {
  public channel: any = null;
  private supabaseChannel: any = null;
  private bc: BroadcastChannel | null = null;
  private isSubscribed: boolean = false;
  public roomId: string;
  public localPlayerId: string;
  public localPlayerName: string;
  public localColor: string;
  public roomMeta?: RoomPuzzleMeta;
  public players: Map<string, RemotePlayer> = new Map();
  private onPlayerUpdateCallback?: (players: RemotePlayer[]) => void;
  private onPieceSyncCallback?: (event: PieceSyncEvent) => void;
  private onSnapCallback?: (event: PieceSyncEvent) => void;
  private onRoomMetaCallback?: (meta: RoomPuzzleMeta) => void;
  private onVictoryCallback?: (event: VictorySyncEvent) => void;
  private onBoardSyncCallback?: (pieces: PlacedPieceSnapshot[]) => void;
  private onRequestBoardSyncCallback?: () => void;

  constructor(roomId: string, playerName: string, roomMeta?: RoomPuzzleMeta) {
    this.roomId = roomId;
    this.localPlayerId = "pl-" + Math.random().toString(36).substring(2, 9);
    this.localPlayerName = playerName || "Player " + Math.floor(Math.random() * 100);
    this.roomMeta = roomMeta;
    const savedColor = typeof window !== "undefined" ? localStorage.getItem("cunfashion_player_color") : null;
    this.localColor = savedColor || PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
  }

  public updateLocalProfile(name: string, color: string) {
    this.localPlayerName = name;
    this.localColor = color;
    if (this.supabaseChannel?.track) {
      this.supabaseChannel.track({
        id: this.localPlayerId,
        name: this.localPlayerName,
        color: this.localColor,
        roomMeta: this.roomMeta,
        lastActive: Date.now(),
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "presence",
        payload: {
          id: this.localPlayerId,
          name: this.localPlayerName,
          color: this.localColor,
          roomMeta: this.roomMeta,
          lastActive: Date.now(),
        },
      });
    }
  }

  public setRoomMeta(meta: RoomPuzzleMeta) {
    this.roomMeta = meta;
    this.broadcastRoomMeta(meta);
  }

  public connect(
    onPlayersChange: (players: RemotePlayer[]) => void,
    onPieceSync: (event: PieceSyncEvent) => void,
    onSnap: (event: PieceSyncEvent) => void,
    onRoomMeta?: (meta: RoomPuzzleMeta) => void,
    onVictory?: (event: VictorySyncEvent) => void,
    onBoardSync?: (pieces: PlacedPieceSnapshot[]) => void,
    onRequestBoardSync?: () => void
  ) {
    this.onPlayerUpdateCallback = onPlayersChange;
    this.onPieceSyncCallback = onPieceSync;
    this.onSnapCallback = onSnap;
    this.onRoomMetaCallback = onRoomMeta;
    this.onVictoryCallback = onVictory;
    this.onBoardSyncCallback = onBoardSync;
    this.onRequestBoardSyncCallback = onRequestBoardSync;

    // 1. Local BroadcastChannel for zero-latency local tab communication
    if (typeof window !== "undefined" && window.BroadcastChannel) {
      const bc = new BroadcastChannel("cunfashion-puzzle-room-" + this.roomId);
      bc.onmessage = (ev) => {
        const { type, payload } = ev.data;
        if (type === "presence") {
          if (payload.id !== this.localPlayerId) {
            this.players.set(payload.id, payload);
            if (payload.roomMeta && this.onRoomMetaCallback) {
              this.onRoomMetaCallback(payload.roomMeta);
            }
            this.notifyPlayers();
          }
        } else if (type === "piece_move") {
          if (payload.senderId !== this.localPlayerId) {
            this.onPieceSyncCallback?.(payload);
          }
        } else if (type === "piece_snap") {
          if (payload.senderId !== this.localPlayerId) {
            this.onSnapCallback?.(payload);
          }
        } else if (type === "request_room_meta") {
          if (this.roomMeta) {
            this.broadcastRoomMeta(this.roomMeta);
          }
        } else if (type === "room_meta") {
          if (payload && this.onRoomMetaCallback) {
            this.onRoomMetaCallback(payload);
          }
        } else if (type === "room_victory") {
          if (payload && payload.winnerId !== this.localPlayerId && this.onVictoryCallback) {
            this.onVictoryCallback(payload);
          }
        } else if (type === "board_sync") {
          if (payload && this.onBoardSyncCallback) {
            this.onBoardSyncCallback(payload);
          }
        } else if (type === "request_board_sync") {
          this.onRequestBoardSyncCallback?.();
        }
      };

      // Announce self presence with room metadata if host
      bc.postMessage({
        type: "presence",
        payload: {
          id: this.localPlayerId,
          name: this.localPlayerName,
          color: this.localColor,
          roomMeta: this.roomMeta,
          lastActive: Date.now(),
        },
      });

      this.bc = bc;
      this.channel = bc;
    }

    // 2. Connect to Supabase Realtime for cross-browser, cross-device multiplayer
    if (isSupabaseConfigured && supabase) {
      try {
        const channelName = "puzzle-room:" + this.roomId;

        // Clean up any existing channel with the same topic in Supabase client cache to prevent "already subscribed" errors
        const existing = supabase.getChannels().find(
          (c: any) => c.topic === "realtime:" + channelName || c.topic === channelName
        );
        if (existing) {
          supabase.removeChannel(existing);
        }

        const roomChannel = supabase.channel(channelName, {
          config: {
            presence: { key: this.localPlayerId },
            broadcast: { self: false, ack: false },
          },
        });

        roomChannel
          .on("presence", { event: "sync" }, () => {
            const state = roomChannel.presenceState();
            const remotePlayers: RemotePlayer[] = [];
            for (const [key, presences] of Object.entries(state)) {
              if (key === this.localPlayerId) continue;
              const presence = (presences as any[])[0];
              if (presence) {
                remotePlayers.push({
                  id: key,
                  name: presence.name || "Player",
                  color: presence.color || "#3b82f6",
                  cursor: presence.cursor,
                  activePieceId: presence.activePieceId,
                  lastActive: Date.now(),
                });
                this.players.set(key, remotePlayers[remotePlayers.length - 1]);
                if (presence.roomMeta && this.onRoomMetaCallback) {
                  this.onRoomMetaCallback(presence.roomMeta);
                }
              }
            }
            this.notifyPlayers();
          })
          .on("broadcast", { event: "piece_move" }, ({ payload }) => {
            if (payload.senderId !== this.localPlayerId) {
              this.onPieceSyncCallback?.(payload);
            }
          })
          .on("broadcast", { event: "piece_snap" }, ({ payload }) => {
            if (payload.senderId !== this.localPlayerId) {
              this.onSnapCallback?.(payload);
            }
          })
          .on("broadcast", { event: "request_room_meta" }, () => {
            if (this.roomMeta) {
              this.broadcastRoomMeta(this.roomMeta);
            }
          })
          .on("broadcast", { event: "room_meta" }, ({ payload }) => {
            if (payload && this.onRoomMetaCallback) {
              this.onRoomMetaCallback(payload);
            }
          })
          .on("broadcast", { event: "room_victory" }, ({ payload }) => {
            if (payload && payload.winnerId !== this.localPlayerId && this.onVictoryCallback) {
              this.onVictoryCallback(payload);
            }
          })
          .on("broadcast", { event: "board_sync" }, ({ payload }) => {
            if (payload && this.onBoardSyncCallback) {
              this.onBoardSyncCallback(payload);
            }
          })
          .on("broadcast", { event: "request_board_sync" }, () => {
            this.onRequestBoardSyncCallback?.();
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              this.isSubscribed = true;
              await roomChannel.track({
                name: this.localPlayerName,
                color: this.localColor,
                roomMeta: this.roomMeta,
                joinedAt: Date.now(),
              });
              if (!this.roomMeta) {
                this.requestRoomMeta();
              }
            }
          });

        this.supabaseChannel = roomChannel;
        this.channel = roomChannel;
      } catch (err) {
        console.warn("Supabase Realtime fallback to BroadcastChannel:", err);
      }
    }

    this.notifyPlayers();
  }

  public broadcastCursor(cursor: { x: number; y: number }, activePieceId?: number | null) {
    if (this.supabaseChannel?.send) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "cursor_move",
        payload: {
          senderId: this.localPlayerId,
          cursor,
          activePieceId,
        },
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "presence",
        payload: {
          id: this.localPlayerId,
          name: this.localPlayerName,
          color: this.localColor,
          cursor,
          activePieceId,
          lastActive: Date.now(),
        },
      });
    }
  }

  public broadcastPieceMove(pieceId: number, currentPos: { x: number; y: number }, rotation: number) {
    const payload: PieceSyncEvent = {
      pieceId,
      currentPos,
      rotation,
      isPlaced: false,
      senderId: this.localPlayerId,
    };

    if (this.supabaseChannel?.send) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "piece_move",
        payload,
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "piece_move",
        payload,
      });
    }
  }

  public broadcastPieceSnap(pieceId: number, currentPos: { x: number; y: number }) {
    const payload: PieceSyncEvent = {
      pieceId,
      currentPos,
      rotation: 0,
      isPlaced: true,
      senderId: this.localPlayerId,
    };

    if (this.supabaseChannel?.send) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "piece_snap",
        payload,
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "piece_snap",
        payload,
      });
    }
  }

  public broadcastRoomMeta(meta?: RoomPuzzleMeta) {
    const payload = meta || this.roomMeta;
    if (!payload) return;

    if (this.supabaseChannel?.send) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "room_meta",
        payload,
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "room_meta",
        payload,
      });
    }
  }

  public requestRoomMeta() {
    if (this.supabaseChannel?.send) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "request_room_meta",
        payload: { senderId: this.localPlayerId },
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "request_room_meta",
        payload: { senderId: this.localPlayerId },
      });
    }
  }

  public broadcastVictory(timeFormatted: string, seconds: number, moves: number) {
    const payload: VictorySyncEvent = {
      winnerId: this.localPlayerId,
      winnerName: this.localPlayerName,
      timeFormatted,
      seconds,
      moves,
      timestamp: Date.now(),
    };

    if (this.supabaseChannel?.send) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "room_victory",
        payload,
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "room_victory",
        payload,
      });
    }
  }

  public broadcastBoardSync(placedPieces: PlacedPieceSnapshot[]) {
    if (this.supabaseChannel?.send) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "board_sync",
        payload: placedPieces,
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "board_sync",
        payload: placedPieces,
      });
    }
  }

  public requestBoardSync() {
    if (this.supabaseChannel?.send) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "request_board_sync",
        payload: { senderId: this.localPlayerId },
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "request_board_sync",
        payload: { senderId: this.localPlayerId },
      });
    }
  }

  private notifyPlayers() {
    const list = Array.from(this.players.values());
    this.onPlayerUpdateCallback?.(list);
  }

  public disconnect() {
    this.isSubscribed = false;
    if (isSupabaseConfigured && supabase && this.supabaseChannel) {
      try {
        supabase.removeChannel(this.supabaseChannel);
      } catch {
        // Non-blocking cleanup
      }
      this.supabaseChannel = null;
    }
    if (this.bc) {
      try {
        this.bc.close();
      } catch {
        // Non-blocking cleanup
      }
      this.bc = null;
    }
    this.channel = null;
    this.players.clear();
  }
}
