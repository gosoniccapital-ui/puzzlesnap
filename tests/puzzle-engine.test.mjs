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
