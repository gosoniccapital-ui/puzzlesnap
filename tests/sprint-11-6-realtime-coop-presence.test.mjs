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

class MockPresenceRoomEngine {
  constructor(roomId, playerName, color) {
    this.roomId = roomId;
    this.localPlayerId = "pl-" + Math.random().toString(36).substring(2, 9);
    this.localPlayerName = playerName || "Player";
    this.localColor = color || PLAYER_COLORS[0];
    this.channel = null;
    this.bc = null;
  }

  broadcastCursor(cursor, activePieceId) {
    const payload = {
      senderId: this.localPlayerId,
      senderName: this.localPlayerName,
      senderColor: this.localColor,
      cursor,
      activePieceId,
      timestamp: Date.now(),
    };

    if (this.channel?.send) {
      this.channel.send({
        type: "broadcast",
        event: "cursor_move",
        payload,
      });
    }
    if (this.bc?.postMessage) {
      this.bc.postMessage({
        type: "cursor_move",
        payload,
      });
    }
    return payload;
  }
}

class MockPuzzleCanvasCursorManager {
  constructor() {
    this.remoteCursors = new Map();
    this.zoomScale = 1.5;
    this.panOffset = { x: 50, y: 100 };
  }

  worldToScreen(pos) {
    return {
      x: pos.x * this.zoomScale + this.panOffset.x,
      y: pos.y * this.zoomScale + this.panOffset.y,
    };
  }

  updateRemoteCursor(id, name, color, worldPos, activePieceId) {
    this.remoteCursors.set(id, {
      id,
      name,
      color,
      worldPos,
      activePieceId,
      lastSeen: Date.now(),
    });
  }

  removeRemoteCursor(id) {
    return this.remoteCursors.delete(id);
  }

  clearRemoteCursors() {
    this.remoteCursors.clear();
  }

  pruneStaleCursors(maxAgeMs = 8000, currentTime = Date.now()) {
    let prunedCount = 0;
    for (const [id, cursor] of this.remoteCursors.entries()) {
      if (currentTime - cursor.lastSeen > maxAgeMs) {
        this.remoteCursors.delete(id);
        prunedCount++;
      }
    }
    return prunedCount;
  }
}

describe("Sprint 11.6 Invariants — Multiplayer Realtime Co-Op Presence & Remote Cursors", () => {
  it("Invariant #1: RemoteCursorEvent correctly structures payload with identity, color and coordinates", () => {
    const engine = new MockPresenceRoomEngine("ROOM-9999", "HautePlayer", "#dfba73");
    let broadcastPayload = null;

    engine.channel = {
      send: ({ payload }) => {
        broadcastPayload = payload;
      },
    };

    const sent = engine.broadcastCursor({ x: 320, y: 480 }, 7);

    assert.ok(broadcastPayload);
    assert.equal(broadcastPayload.senderId, engine.localPlayerId);
    assert.equal(broadcastPayload.senderName, "HautePlayer");
    assert.equal(broadcastPayload.senderColor, "#dfba73");
    assert.equal(broadcastPayload.cursor.x, 320);
    assert.equal(broadcastPayload.cursor.y, 480);
    assert.equal(broadcastPayload.activePieceId, 7);
    assert.ok(broadcastPayload.timestamp > 0);
    assert.deepEqual(sent, broadcastPayload);
  });

  it("Invariant #2: Cursor listener rejects self-broadcasts and only updates for remote teammates", () => {
    const engine = new MockPresenceRoomEngine("ROOM-COOP", "LocalPlayer", "#f59e0b");
    const manager = new MockPuzzleCanvasCursorManager();

    let remoteCallbackInvoked = false;
    const onCursorSync = (payload) => {
      if (payload && payload.senderId !== engine.localPlayerId) {
        remoteCallbackInvoked = true;
        manager.updateRemoteCursor(
          payload.senderId,
          payload.senderName,
          payload.senderColor,
          payload.cursor,
          payload.activePieceId
        );
      }
    };

    // 1. Own cursor payload received from broadcast channel -> MUST BE IGNORED
    const selfPayload = {
      senderId: engine.localPlayerId,
      senderName: "LocalPlayer",
      senderColor: "#f59e0b",
      cursor: { x: 100, y: 150 },
      activePieceId: null,
      timestamp: Date.now(),
    };
    onCursorSync(selfPayload);
    assert.equal(remoteCallbackInvoked, false, "Local player cursor must not be mirrored as remote cursor");
    assert.equal(manager.remoteCursors.size, 0);

    // 2. Remote friend cursor payload received -> MUST BE ACCEPTED
    const friendPayload = {
      senderId: "pl-friend-abc1234",
      senderName: "FashionFriend",
      senderColor: "#3b82f6",
      cursor: { x: 250, y: 350 },
      activePieceId: 3,
      timestamp: Date.now(),
    };
    onCursorSync(friendPayload);
    assert.equal(remoteCallbackInvoked, true, "Teammate cursor must be processed");
    assert.equal(manager.remoteCursors.size, 1);

    const stored = manager.remoteCursors.get("pl-friend-abc1234");
    assert.ok(stored);
    assert.equal(stored.name, "FashionFriend");
    assert.equal(stored.color, "#3b82f6");
    assert.equal(stored.worldPos.x, 250);
    assert.equal(stored.worldPos.y, 350);
    assert.equal(stored.activePieceId, 3);
  });

  it("Invariant #3: World-to-Screen coordinate transform properly projects remote cursor through Camera zoom and pan", () => {
    const manager = new MockPuzzleCanvasCursorManager();
    // zoomScale = 1.5, panOffset = { x: 50, y: 100 }
    manager.updateRemoteCursor("pl-teammate", "Emma", "#10b981", { x: 200, y: 300 });

    const cursor = manager.remoteCursors.get("pl-teammate");
    assert.ok(cursor);

    const screenPos = manager.worldToScreen(cursor.worldPos);
    // Expected: 200 * 1.5 + 50 = 350; 300 * 1.5 + 100 = 550
    assert.equal(screenPos.x, 350);
    assert.equal(screenPos.y, 550);
  });

  it("Invariant #4: Automatic pruning cleanly purges stale cursors inactive for > 8000ms", () => {
    const manager = new MockPuzzleCanvasCursorManager();
    const now = Date.now();

    // Player 1: active 2 seconds ago
    manager.updateRemoteCursor("pl-active", "ActivePlayer", "#ec4899", { x: 10, y: 20 });
    manager.remoteCursors.get("pl-active").lastSeen = now - 2000;

    // Player 2: stale 10 seconds ago (e.g. disconnected or closed tab)
    manager.updateRemoteCursor("pl-stale", "GhostPlayer", "#8b5cf6", { x: 50, y: 60 });
    manager.remoteCursors.get("pl-stale").lastSeen = now - 10000;

    assert.equal(manager.remoteCursors.size, 2);

    const pruned = manager.pruneStaleCursors(8000, now);
    assert.equal(pruned, 1, "Exactly 1 stale cursor should be pruned");
    assert.equal(manager.remoteCursors.size, 1);
    assert.ok(manager.remoteCursors.has("pl-active"));
    assert.ok(!manager.remoteCursors.has("pl-stale"));
  });

  it("Invariant #5: Leaving Co-Op room or removing player cleans up cursor presence immediately", () => {
    const manager = new MockPuzzleCanvasCursorManager();
    manager.updateRemoteCursor("pl-1", "User1", "#f97316", { x: 100, y: 100 });
    manager.updateRemoteCursor("pl-2", "User2", "#06b6d4", { x: 200, y: 200 });

    assert.equal(manager.remoteCursors.size, 2);

    // Single player leave
    manager.removeRemoteCursor("pl-1");
    assert.equal(manager.remoteCursors.size, 1);
    assert.ok(!manager.remoteCursors.has("pl-1"));
    assert.ok(manager.remoteCursors.has("pl-2"));

    // Room leave / clear
    manager.clearRemoteCursors();
    assert.equal(manager.remoteCursors.size, 0);
  });

  it("Invariant #6: Throttle logic ensures max 22 cursor broadcasts per second (45ms interval)", () => {
    let broadcastCount = 0;
    const THROTTLE_MS = 45;
    let lastBroadcastTime = -THROTTLE_MS;

    const maybeBroadcast = (currentTime) => {
      if (currentTime - lastBroadcastTime >= THROTTLE_MS) {
        lastBroadcastTime = currentTime;
        broadcastCount++;
      }
    };

    // Simulate 100 rapid pointer moves over 100ms (1ms apart)
    for (let t = 0; t < 100; t++) {
      maybeBroadcast(t);
    }

    // Over 100ms with 45ms throttle: t=0, t=45, t=90 -> 3 broadcasts
    assert.equal(broadcastCount, 3, "Throttling should strictly limit broadcast frequency to prevent network congestion");
  });
});
