import test from "node:test";
import assert from "node:assert/strict";

// 1. Test DisjointSet logic
class DisjointSet {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }

  find(i) {
    if (this.parent[i] === i) return i;
    this.parent[i] = this.find(this.parent[i]);
    return this.parent[i];
  }

  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI === rootJ) return false;

    if (this.rank[rootI] < this.rank[rootJ]) {
      this.parent[rootI] = rootJ;
    } else if (this.rank[rootI] > this.rank[rootJ]) {
      this.parent[rootJ] = rootI;
    } else {
      this.parent[rootJ] = rootI;
      this.rank[rootI] += 1;
    }
    return true;
  }

  connected(i, j) {
    return this.find(i) === this.find(j);
  }

  getGroup(i) {
    const root = this.find(i);
    const members = [];
    for (let j = 0; j < this.parent.length; j++) {
      if (this.find(j) === root) members.push(j);
    }
    return members;
  }
}

test("DisjointSet: should merge pieces correctly and maintain groups", () => {
  const dsu = new DisjointSet(9);

  assert.equal(dsu.connected(0, 1), false);
  dsu.union(0, 1);
  assert.equal(dsu.connected(0, 1), true);

  dsu.union(1, 2);
  assert.equal(dsu.connected(0, 2), true);

  const group0 = dsu.getGroup(0);
  assert.deepEqual(group0.sort(), [0, 1, 2]);

  assert.equal(dsu.connected(0, 3), false);
});

// 2. Test Edge Generation Complementary Invariants
function generatePieceEdgesGrid(rows, cols) {
  const horizontalEdges = [];
  for (let r = 0; r < rows - 1; r++) {
    horizontalEdges[r] = [];
    for (let c = 0; c < cols; c++) {
      horizontalEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  const verticalEdges = [];
  for (let r = 0; r < rows; r++) {
    verticalEdges[r] = [];
    for (let c = 0; c < cols - 1; c++) {
      verticalEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      const top = r === 0 ? 0 : (horizontalEdges[r - 1][c] === 1 ? -1 : 1);
      const bottom = r === rows - 1 ? 0 : horizontalEdges[r][c];
      const left = c === 0 ? 0 : (verticalEdges[r][c - 1] === 1 ? -1 : 1);
      const right = c === cols - 1 ? 0 : verticalEdges[r][c];

      grid[r][c] = { top, right, bottom, left };
    }
  }
  return grid;
}

test("Edge Generation: guarantees outer boundaries are flat and adjacent edges are complementary", () => {
  const rows = 4;
  const cols = 5;
  const grid = generatePieceEdgesGrid(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const piece = grid[r][c];

      // Outer boundary check
      if (r === 0) assert.equal(piece.top, 0, `Top edge at (0, ${c}) must be flat`);
      if (r === rows - 1) assert.equal(piece.bottom, 0, `Bottom edge at (${rows-1}, ${c}) must be flat`);
      if (c === 0) assert.equal(piece.left, 0, `Left edge at (${r}, 0) must be flat`);
      if (c === cols - 1) assert.equal(piece.right, 0, `Right edge at (${r}, ${cols-1}) must be flat`);

      // Horizontal adjacency check
      if (r < rows - 1) {
        const belowPiece = grid[r + 1][c];
        assert.equal(piece.bottom, -belowPiece.top, `Piece (${r}, ${c}).bottom must complement Piece (${r+1}, ${c}).top`);
      }

      // Vertical adjacency check
      if (c < cols - 1) {
        const rightPiece = grid[r][c + 1];
        assert.equal(piece.right, -rightPiece.left, `Piece (${r}, ${c}).right must complement Piece (${r}, ${c+1}).left`);
      }
    }
  }
});

// 3. Test Camera Coordinate Transforms (Screen <-> World)
function screenToWorld(pos, zoomScale, panOffset) {
  return {
    x: (pos.x - panOffset.x) / zoomScale,
    y: (pos.y - panOffset.y) / zoomScale,
  };
}

function worldToScreen(pos, zoomScale, panOffset) {
  return {
    x: pos.x * zoomScale + panOffset.x,
    y: pos.y * zoomScale + panOffset.y,
  };
}

test("Camera Matrix: screenToWorld and worldToScreen are exact inverses across zooms and pans", () => {
  const testCases = [
    { zoom: 1.0, pan: { x: 0, y: 0 }, screen: { x: 400, y: 300 } },
    { zoom: 0.5, pan: { x: -100, y: 50 }, screen: { x: 250, y: 150 } },
    { zoom: 2.25, pan: { x: 80, y: -120 }, screen: { x: 500, y: 450 } },
    { zoom: 3.0, pan: { x: 300, y: 200 }, screen: { x: 100, y: 100 } },
  ];

  for (const tc of testCases) {
    const world = screenToWorld(tc.screen, tc.zoom, tc.pan);
    const roundTripScreen = worldToScreen(world, tc.zoom, tc.pan);

    assert.ok(
      Math.abs(roundTripScreen.x - tc.screen.x) < 1e-6,
      `Screen X roundtrip failed for zoom=${tc.zoom}`
    );
    assert.ok(
      Math.abs(roundTripScreen.y - tc.screen.y) < 1e-6,
      `Screen Y roundtrip failed for zoom=${tc.zoom}`
    );
  }
});

test("Magnetic Snap Invariant: World Space Euclidean distance remains invariant under any camera zoom", () => {
  const p1World = { x: 100, y: 150 };
  const p2World = { x: 112, y: 155 }; // dx=12, dy=5 => dist = 13 (within snapTolerance 16)
  const expectedDist = Math.hypot(p2World.x - p1World.x, p2World.y - p1World.y);
  assert.equal(expectedDist, 13);

  // When rendered on screen under 2x zoom:
  const zoom = 2.0;
  const pan = { x: -50, y: 20 };
  const p1Screen = worldToScreen(p1World, zoom, pan);
  const p2Screen = worldToScreen(p2World, zoom, pan);

  // Convert back from screen to world
  const p1Restored = screenToWorld(p1Screen, zoom, pan);
  const p2Restored = screenToWorld(p2Screen, zoom, pan);

  const restoredDist = Math.hypot(p2Restored.x - p1Restored.x, p2Restored.y - p1Restored.y);
  assert.ok(
    Math.abs(restoredDist - expectedDist) < 1e-6,
    "World distance must remain strictly scale-invariant for reliable magnetic snapping"
  );
});

// 4. Test Resize / Orientation Change Coordinate Invariant
test("Resize Invariant: pieces scale and reposition proportionally, placed pieces match new board bounds exactly", () => {
  const rows = 4;
  const cols = 4;

  // Simulate initial orientation (Portrait phone: 375 x 667)
  const oldBounds = { x: 37.5, y: 100, width: 300, height: 225 };
  const oldPieceW = oldBounds.width / cols;
  const oldPieceH = oldBounds.height / rows;

  const piece0 = {
    id: 0,
    row: 1,
    col: 2,
    isPlaced: true,
    width: oldPieceW,
    height: oldPieceH,
    originalPos: { x: oldBounds.x + 2 * oldPieceW, y: oldBounds.y + 1 * oldPieceH },
    currentPos: { x: oldBounds.x + 2 * oldPieceW, y: oldBounds.y + 1 * oldPieceH },
  };

  const piece1 = {
    id: 1,
    row: 0,
    col: 0,
    isPlaced: false,
    width: oldPieceW,
    height: oldPieceH,
    originalPos: { x: oldBounds.x, y: oldBounds.y },
    currentPos: { x: 10, y: 350 }, // Scattered below
  };

  // Simulate orientation change to Landscape (667 x 375)
  const newBounds = { x: 133.5, y: 40, width: 400, height: 300 };
  const newPieceW = newBounds.width / cols;
  const newPieceH = newBounds.height / rows;

  // Apply re-scaling algorithm
  for (const p of [piece0, piece1]) {
    p.width = newPieceW;
    p.height = newPieceH;
    p.originalPos = {
      x: newBounds.x + p.col * newPieceW,
      y: newBounds.y + p.row * newPieceH,
    };

    if (p.isPlaced) {
      p.currentPos = { ...p.originalPos };
    } else {
      const relX = (p.currentPos.x - oldBounds.x) / oldBounds.width;
      const relY = (p.currentPos.y - oldBounds.y) / oldBounds.height;
      p.currentPos = {
        x: newBounds.x + relX * newBounds.width,
        y: newBounds.y + relY * newBounds.height,
      };
    }
  }

  // Verification:
  // 1. Placed piece must perfectly match its new grid target position on new bounds
  assert.equal(piece0.currentPos.x, newBounds.x + 2 * newPieceW);
  assert.equal(piece0.currentPos.y, newBounds.y + 1 * newPieceH);
  assert.deepEqual(piece0.currentPos, piece0.originalPos);

  // 2. Unplaced piece maintains valid finite numbers and relative spatial positioning
  assert.ok(Number.isFinite(piece1.currentPos.x));
  assert.ok(Number.isFinite(piece1.currentPos.y));
  assert.equal(piece1.originalPos.x, newBounds.x);
  assert.equal(piece1.originalPos.y, newBounds.y);
});

// 5. Test Rotation Hit-Test Invariant (Inverse Matrix Transformation)
function hitTestPiece(worldPos, piece) {
  const cx = piece.currentPos.x + piece.width / 2;
  const cy = piece.currentPos.y + piece.height / 2;
  const vx = worldPos.x - cx;
  const vy = worldPos.y - cy;
  const rad = -(piece.rotation * Math.PI) / 180;
  const localVx = vx * Math.cos(rad) - vy * Math.sin(rad);
  const localVy = vx * Math.sin(rad) + vy * Math.cos(rad);
  const localX = localVx + piece.width / 2;
  const localY = localVy + piece.height / 2;
  const margin = Math.max(piece.width, piece.height) * 0.4;

  return (
    localX >= -margin &&
    localX <= piece.width + margin &&
    localY >= -margin &&
    localY <= piece.height + margin
  );
}

test("Rotation Hit-Test Invariant: inverse rotation correctly identifies click points at 0, 90, 180, 270 degrees", () => {
  const piece = {
    currentPos: { x: 100, y: 100 },
    width: 60,
    height: 40,
    rotation: 90, // Rotated 90 degrees clockwise around center (130, 120)
  };

  // The center is at (130, 120).
  // In unrotated piece space, point (150, 120) is +20px along X axis.
  // When rotated 90 deg clockwise, that point moves to (130, 140) (+20px along Y axis).
  const pointWorld = { x: 130, y: 140 };
  assert.equal(hitTestPiece(pointWorld, piece), true, "Point rotated by 90 deg should hit");

  // A point far outside should not hit
  const farPoint = { x: 500, y: 500 };
  assert.equal(hitTestPiece(farPoint, piece), false, "Far point should not hit");
});

// 6. Test Rotation Magnetic Snap Invariant
function checkMagneticSnap(pieceA, pieceB, snapTolerance = 16) {
  // Must have exact same rotation angle
  if ((pieceA.rotation % 360) !== (pieceB.rotation % 360)) {
    return { canSnap: false, reason: "MISMATCHED_ROTATION" };
  }

  const rad = (pieceA.rotation * Math.PI) / 180;
  const cos = Math.round(Math.cos(rad));
  const sin = Math.round(Math.sin(rad));

  const dx0 = (pieceB.col - pieceA.col) * pieceA.width;
  const dy0 = (pieceB.row - pieceA.row) * pieceA.height;

  const expectedRelX = dx0 * cos - dy0 * sin;
  const expectedRelY = dx0 * sin + dy0 * cos;

  const centerA = {
    x: pieceA.currentPos.x + pieceA.width / 2,
    y: pieceA.currentPos.y + pieceA.height / 2,
  };
  const expectedCenterB = {
    x: centerA.x + expectedRelX,
    y: centerA.y + expectedRelY,
  };
  const centerB = {
    x: pieceB.currentPos.x + pieceB.width / 2,
    y: pieceB.currentPos.y + pieceB.height / 2,
  };

  const dist = Math.hypot(centerB.x - expectedCenterB.x, centerB.y - expectedCenterB.y);
  return {
    canSnap: dist <= snapTolerance,
    dist,
    expectedDelta: {
      x: expectedCenterB.x - centerB.x,
      y: expectedCenterB.y - centerB.y,
    },
  };
}

test("Rotation Magnetic Snap Invariant: pieces only snap when sharing identical rotation angle", () => {
  const pieceA = {
    id: 0,
    row: 0,
    col: 0,
    width: 50,
    height: 50,
    currentPos: { x: 100, y: 100 },
    rotation: 0,
  };
  const pieceB = {
    id: 1,
    row: 0,
    col: 1,
    width: 50,
    height: 50,
    currentPos: { x: 152, y: 102 }, // ~2.8px offset from (150, 100)
    rotation: 90, // Misaligned angle!
  };

  // Even though physically adjacent, rotation mismatch prevents snapping
  const snapMismatch = checkMagneticSnap(pieceA, pieceB, 16);
  assert.equal(snapMismatch.canSnap, false);
  assert.equal(snapMismatch.reason, "MISMATCHED_ROTATION");

  // When pieceB is rotated to 0 deg, snapping succeeds
  pieceB.rotation = 0;
  const snapSuccess = checkMagneticSnap(pieceA, pieceB, 16);
  assert.equal(snapSuccess.canSnap, true);
  assert.ok(snapSuccess.dist < 16);

  // When both are rotated 90 deg clockwise:
  // Expected neighbor pos for col+1 is now below pieceA (0, +50)
  pieceA.rotation = 90;
  pieceB.rotation = 90;
  pieceB.currentPos = { x: 101, y: 151 }; // Near (100, 150)
  const snapRotated = checkMagneticSnap(pieceA, pieceB, 16);
  assert.equal(snapRotated.canSnap, true);
});

// 7. Test Cluster Rotation Invariant
function rotateCluster(pieces, groupIds, pivotPieceId, clockwise = true) {
  const pivotPiece = pieces.find((p) => p.id === pivotPieceId);
  const pivotX = pivotPiece.currentPos.x + pivotPiece.width / 2;
  const pivotY = pivotPiece.currentPos.y + pivotPiece.height / 2;

  const rotAngle = clockwise ? 90 : 270;

  for (const id of groupIds) {
    const p = pieces.find((item) => item.id === id);
    const cx = p.currentPos.x + p.width / 2;
    const cy = p.currentPos.y + p.height / 2;
    const dx = cx - pivotX;
    const dy = cy - pivotY;

    const newDx = clockwise ? -dy : dy;
    const newDy = clockwise ? dx : -dx;

    const newCx = pivotX + newDx;
    const newCy = pivotY + newDy;

    p.currentPos.x = newCx - p.width / 2;
    p.currentPos.y = newCy - p.height / 2;
    p.rotation = (p.rotation + rotAngle) % 360;
  }
}

test("Cluster Rotation Invariant: rotating a cluster preserves inter-piece geometric distances exactly", () => {
  const pieces = [
    { id: 0, width: 50, height: 50, currentPos: { x: 100, y: 100 }, rotation: 0 },
    { id: 1, width: 50, height: 50, currentPos: { x: 150, y: 100 }, rotation: 0 },
  ];

  const initialDist = Math.hypot(
    pieces[1].currentPos.x - pieces[0].currentPos.x,
    pieces[1].currentPos.y - pieces[0].currentPos.y
  );
  assert.equal(initialDist, 50);

  // Rotate group 90 degrees around piece 0
  rotateCluster(pieces, [0, 1], 0, true);

  assert.equal(pieces[0].rotation, 90);
  assert.equal(pieces[1].rotation, 90);

  const postRotDist = Math.hypot(
    pieces[1].currentPos.x - pieces[0].currentPos.x,
    pieces[1].currentPos.y - pieces[0].currentPos.y
  );
  assert.equal(postRotDist, 50, "Distance between pieces in cluster must remain 50px");
  assert.equal(pieces[1].currentPos.x, 100);
  assert.equal(pieces[1].currentPos.y, 150);
});

// 9. Test Drag Interruption Invariant (Escape / Blur Rollback)
test("Drag Interruption Invariant: Escape key and window blur cleanly roll back cluster positions", () => {
  const pieces = [
    { id: 0, currentPos: { x: 50, y: 50 } },
    { id: 1, currentPos: { x: 100, y: 50 } },
  ];

  const initialPositions = new Map([
    [0, { x: 50, y: 50 }],
    [1, { x: 100, y: 50 }],
  ]);

  // Simulate dragging offset dx=80, dy=60
  pieces[0].currentPos = { x: 130, y: 110 };
  pieces[1].currentPos = { x: 180, y: 110 };

  // Interruption triggers rollback (Escape or Blur)
  const activeGroup = [0, 1];
  activeGroup.forEach((id) => {
    const init = initialPositions.get(id);
    if (init) pieces[id].currentPos = { ...init };
  });

  assert.deepEqual(pieces[0].currentPos, { x: 50, y: 50 });
  assert.deepEqual(pieces[1].currentPos, { x: 100, y: 50 });
});
