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
  private channel: any = null;
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
    if (this.channel?.track) {
      this.channel.track({
        id: this.localPlayerId,
        name: this.localPlayerName,
        color: this.localColor,
        lastActive: Date.now(),
      });
    } else if (this.channel?.postMessage) {
      this.channel.postMessage({
        type: "presence",
        payload: {
          id: this.localPlayerId,
          name: this.localPlayerName,
          color: this.localColor,
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

    // Fallback broadcast channel using local BroadcastChannel API when Supabase is not online/configured
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
          if (payload && this.onVictoryCallback) {
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

      this.channel = bc;
    }

    // Connect to Supabase Realtime if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const channelName = "puzzle-room:" + this.roomId;
        const roomChannel = supabase.channel(channelName, {
          config: {
            presence: { key: this.localPlayerId },
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
            if (payload && this.onVictoryCallback) {
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
              await roomChannel.track({
                name: this.localPlayerName,
                color: this.localColor,
                roomMeta: this.roomMeta,
                joinedAt: Date.now(),
              });
            }
          });

        this.channel = roomChannel;
      } catch (err) {
        console.warn("Supabase Realtime fallback to BroadcastChannel:", err);
      }
    }

    this.notifyPlayers();
  }

  public broadcastCursor(cursor: { x: number; y: number }, activePieceId?: number | null) {
    if (!this.channel) return;

    if (this.channel.send) {
      this.channel.send({
        type: "broadcast",
        event: "cursor_move",
        payload: {
          senderId: this.localPlayerId,
          cursor,
          activePieceId,
        },
      });
    } else if (this.channel.postMessage) {
      this.channel.postMessage({
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

    if (this.channel?.send) {
      this.channel.send({
        type: "broadcast",
        event: "piece_move",
        payload,
      });
    } else if (this.channel?.postMessage) {
      this.channel.postMessage({
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

    if (this.channel?.send) {
      this.channel.send({
        type: "broadcast",
        event: "piece_snap",
        payload,
      });
    } else if (this.channel?.postMessage) {
      this.channel.postMessage({
        type: "piece_snap",
        payload,
      });
    }
  }

  public broadcastRoomMeta(meta?: RoomPuzzleMeta) {
    const payload = meta || this.roomMeta;
    if (!payload || !this.channel) return;

    if (this.channel.send) {
      this.channel.send({
        type: "broadcast",
        event: "room_meta",
        payload,
      });
    } else if (this.channel.postMessage) {
      this.channel.postMessage({
        type: "room_meta",
        payload,
      });
    }
  }

  public requestRoomMeta() {
    if (!this.channel) return;

    if (this.channel.send) {
      this.channel.send({
        type: "broadcast",
        event: "request_room_meta",
        payload: { senderId: this.localPlayerId },
      });
    } else if (this.channel.postMessage) {
      this.channel.postMessage({
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

    if (this.channel?.send) {
      this.channel.send({
        type: "broadcast",
        event: "room_victory",
        payload,
      });
    } else if (this.channel?.postMessage) {
      this.channel.postMessage({
        type: "room_victory",
        payload,
      });
    }
  }

  public broadcastBoardSync(placedPieces: PlacedPieceSnapshot[]) {
    if (!this.channel) return;

    if (this.channel.send) {
      this.channel.send({
        type: "broadcast",
        event: "board_sync",
        payload: placedPieces,
      });
    } else if (this.channel.postMessage) {
      this.channel.postMessage({
        type: "board_sync",
        payload: placedPieces,
      });
    }
  }

  public requestBoardSync() {
    if (!this.channel) return;

    if (this.channel.send) {
      this.channel.send({
        type: "broadcast",
        event: "request_board_sync",
        payload: { senderId: this.localPlayerId },
      });
    } else if (this.channel.postMessage) {
      this.channel.postMessage({
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
    if (this.channel?.unsubscribe) {
      this.channel.unsubscribe();
    } else if (this.channel?.close) {
      this.channel.close();
    }
    this.players.clear();
  }
}
