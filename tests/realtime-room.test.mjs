import { describe, it } from "node:test";
import assert from "node:assert/strict";

const PLAYER_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#ec4899",
  "#8b5cf6",
  "#f97316",
  "#06b6d4",
  "#84cc16",
];

class MockRealtimeRoomEngine {
  constructor(roomId, playerName) {
    this.roomId = roomId;
    this.localPlayerId = "pl-" + Math.random().toString(36).substring(2, 9);
    this.localPlayerName = playerName || "Player";
    this.localColor = PLAYER_COLORS[0];
    this.channel = null;
  }

  broadcastPieceMove(pieceId, currentPos, rotation) {
    const payload = {
      pieceId,
      currentPos,
      rotation,
      isPlaced: false,
      senderId: this.localPlayerId,
    };
    if (this.channel?.send) {
      this.channel.send({ type: "broadcast", event: "piece_move", payload });
    }
  }

  broadcastPieceSnap(pieceId, currentPos) {
    const payload = {
      pieceId,
      currentPos,
      rotation: 0,
      isPlaced: true,
      senderId: this.localPlayerId,
    };
    if (this.channel?.send) {
      this.channel.send({ type: "broadcast", event: "piece_snap", payload });
    }
  }
}

describe("Realtime Multiplayer Room Engine Invariants", () => {
  it("Initializes player with unique id and valid color", () => {
    const engine = new MockRealtimeRoomEngine("TEST-ROOM-1", "Alice");
    assert.equal(engine.roomId, "TEST-ROOM-1");
    assert.equal(engine.localPlayerName, "Alice");
    assert.ok(engine.localPlayerId.startsWith("pl-"));
    assert.ok(engine.localColor.startsWith("#"));
  });

  it("Piece sync payload structures correctly", () => {
    const engine = new MockRealtimeRoomEngine("TEST-ROOM-2", "Bob");
    let broadcastPayload = null;

    engine.channel = {
      send: ({ payload }) => {
        broadcastPayload = payload;
      },
    };

    engine.broadcastPieceMove(5, { x: 120, y: 340 }, 90);

    assert.ok(broadcastPayload);
    assert.equal(broadcastPayload.pieceId, 5);
    assert.equal(broadcastPayload.currentPos.x, 120);
    assert.equal(broadcastPayload.currentPos.y, 340);
    assert.equal(broadcastPayload.rotation, 90);
    assert.equal(broadcastPayload.isPlaced, false);
    assert.equal(broadcastPayload.senderId, engine.localPlayerId);
  });

  it("Piece snap event correctly broadcasts placed state", () => {
    const engine = new MockRealtimeRoomEngine("TEST-ROOM-3", "Charlie");
    let broadcastPayload = null;

    engine.channel = {
      send: ({ payload }) => {
        broadcastPayload = payload;
      },
    };

    engine.broadcastPieceSnap(12, { x: 200, y: 150 });

    assert.ok(broadcastPayload);
    assert.equal(broadcastPayload.pieceId, 12);
    assert.equal(broadcastPayload.rotation, 0);
    assert.equal(broadcastPayload.isPlaced, true);
  });

  it("Victory broadcast invariant: correctly structures payload and excludes self on receive", () => {
    const engine = new MockRealtimeRoomEngine("TEST-ROOM-VICTORY", "WinnerPlayer");
    let sentPayload = null;

    engine.broadcastVictory = function(timeFormatted, seconds, moves) {
      sentPayload = {
        winnerId: this.localPlayerId,
        winnerName: this.localPlayerName,
        timeFormatted,
        seconds,
        moves,
        timestamp: Date.now(),
      };
    };

    engine.broadcastVictory("01:45", 105, 24);

    assert.ok(sentPayload);
    assert.equal(sentPayload.winnerId, engine.localPlayerId);
    assert.equal(sentPayload.winnerName, "WinnerPlayer");
    assert.equal(sentPayload.timeFormatted, "01:45");
    assert.equal(sentPayload.seconds, 105);
    assert.equal(sentPayload.moves, 24);

    // Filter verification: onVictory should only execute if payload.winnerId !== localPlayerId
    let victoryCalledWith = null;
    const onVictory = (p) => { victoryCalledWith = p; };

    const handleReceive = (p) => {
      if (p && p.winnerId !== engine.localPlayerId) {
        onVictory(p);
      }
    };

    // Own victory received -> ignored
    handleReceive(sentPayload);
    assert.equal(victoryCalledWith, null, "Should not trigger remote victory modal on oneself");

    // Remote friend victory received -> triggered
    const friendPayload = { ...sentPayload, winnerId: "pl-remote-friend-999", winnerName: "Friend" };
    handleReceive(friendPayload);
    assert.ok(victoryCalledWith);
    assert.equal(victoryCalledWith.winnerName, "Friend");
  });

  it("Supabase channel cleanup invariant: removing existing channel prevents callback collision", () => {
    const channelRegistry = new Map();
    const mockSupabase = {
      getChannels: () => Array.from(channelRegistry.values()),
      channel: (name) => {
        if (!channelRegistry.has(name)) {
          channelRegistry.set(name, { topic: "realtime:" + name, subscribed: false });
        }
        return channelRegistry.get(name);
      },
      removeChannel: (ch) => {
        for (const [key, val] of channelRegistry.entries()) {
          if (val === ch) channelRegistry.delete(key);
        }
      },
    };

    // 1. First subscription
    const channelName = "puzzle-room:ROOM-TEST";
    const ch1 = mockSupabase.channel(channelName);
    ch1.subscribed = true;

    // 2. Safe cleanup logic before reconnect
    const existing = mockSupabase.getChannels().find(c => c.topic === "realtime:" + channelName);
    assert.ok(existing);
    mockSupabase.removeChannel(existing);

    // 3. New channel should be fresh and unsubscribed
    const ch2 = mockSupabase.channel(channelName);
    assert.equal(ch2.subscribed, false, "Re-created channel must be fresh to accept new callbacks safely");
  });
});

