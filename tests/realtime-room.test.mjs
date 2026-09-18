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
});
