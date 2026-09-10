import { EdgeShape, PieceEdges } from "./types";

/**
 * Generates an edge definition grid for R rows and C cols.
 * Strictly guarantees that adjacent pieces have complementary edges (Tab vs Blank).
 */
export function generatePieceEdgesGrid(rows: number, cols: number): PieceEdges[][] {
  // horizontalEdges[r][c] is the edge between cell (r, c) and (r+1, c) (for r from 0 to rows - 2)
  const horizontalEdges: EdgeShape[][] = [];
  for (let r = 0; r < rows - 1; r++) {
    horizontalEdges[r] = [];
    for (let c = 0; c < cols; c++) {
      horizontalEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  // verticalEdges[r][c] is the edge between cell (r, c) and (r, c+1) (for c from 0 to cols - 2)
  const verticalEdges: EdgeShape[][] = [];
  for (let r = 0; r < rows; r++) {
    verticalEdges[r] = [];
    for (let c = 0; c < cols - 1; c++) {
      verticalEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
    }
  }

  const grid: PieceEdges[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      const top: EdgeShape = r === 0 ? 0 : (horizontalEdges[r - 1][c] === 1 ? -1 : 1);
      const bottom: EdgeShape = r === rows - 1 ? 0 : horizontalEdges[r][c];
      const left: EdgeShape = c === 0 ? 0 : (verticalEdges[r][c - 1] === 1 ? -1 : 1);
      const right: EdgeShape = c === cols - 1 ? 0 : verticalEdges[r][c];

      grid[r][c] = { top, right, bottom, left };
    }
  }

  return grid;
}

/**
 * Creates a Path2D for a piece with dimensions (w, h) and specified edges.
 * (0, 0) is the top-left corner of the rectangular cell.
 */
export function createPiecePath(w: number, h: number, edges: PieceEdges): Path2D {
  const path = new Path2D();

  path.moveTo(0, 0);

  // 1. TOP EDGE (from (0, 0) to (w, 0))
  drawEdge(path, 0, 0, w, 0, edges.top, false);

  // 2. RIGHT EDGE (from (w, 0) to (w, h))
  drawEdge(path, w, 0, w, h, edges.right, false);

  // 3. BOTTOM EDGE (from (w, h) to (0, h))
  drawEdge(path, w, h, 0, h, edges.bottom, false);

  // 4. LEFT EDGE (from (0, h) to (0, 0))
  drawEdge(path, 0, h, 0, 0, edges.left, false);

  path.closePath();
  return path;
}

/**
 * Draws a single jigsaw edge from (x1, y1) to (x2, y2).
 * shape: 0 = straight line, 1 = tab (outward), -1 = blank (inward)
 */
function drawEdge(
  path: Path2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  shape: EdgeShape,
  _isHeart: boolean = false
) {
  if (shape === 0) {
    path.lineTo(x2, y2);
    return;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);

  // Unit vector along the edge
  const ux = dx / length;
  const uy = dy / length;

  // Normal vector pointing "outward" (to the right of the direction vector)
  // shape = 1 (outward tab): sign = 1; shape = -1 (inward blank): sign = -1
  const sign = shape;
  const nx = -uy * sign;
  const ny = ux * sign;

  // Helper function to map normalized (u, v) along edge to world (x, y)
  // u in [0, 1] along edge, v is outward offset
  const pt = (u: number, v: number): [number, number] => {
    return [
      x1 + u * length * ux + v * length * nx,
      y1 + u * length * uy + v * length * ny,
    ];
  };

  // Classic Jigsaw Tab geometry:
  // Baseline -> neck shoulder -> bulbous head -> neck shoulder -> baseline
  const p1 = pt(0.38, 0);
  const c1a = pt(0.36, 0.05);
  const c1b = pt(0.32, 0.08);
  const p2 = pt(0.35, 0.18);

  const c2a = pt(0.20, 0.30);
  const c2b = pt(0.35, 0.38);
  const p3 = pt(0.50, 0.38);

  const c3a = pt(0.65, 0.38);
  const c3b = pt(0.80, 0.30);
  const p4 = pt(0.65, 0.18);

  const c4a = pt(0.68, 0.08);
  const c4b = pt(0.64, 0.05);
  const p5 = pt(0.62, 0);

  // Draw segment
  path.lineTo(...p1);
  path.bezierCurveTo(c1a[0], c1a[1], c1b[0], c1b[1], p2[0], p2[1]);
  path.bezierCurveTo(c2a[0], c2a[1], c2b[0], c2b[1], p3[0], p3[1]);
  path.bezierCurveTo(c3a[0], c3a[1], c3b[0], c3b[1], p4[0], p4[1]);
  path.bezierCurveTo(c4a[0], c4a[1], c4b[0], c4b[1], p5[0], p5[1]);
  path.lineTo(x2, y2);
}
