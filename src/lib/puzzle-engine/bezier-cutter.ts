import { EdgeShape, PieceEdges } from "./types";

export type CutStyle = "classic" | "hearts" | "star";

/**
 * Generates an edge definition grid for R rows and C cols.
 * Strictly guarantees that adjacent pieces have complementary edges (Tab vs Blank).
 */
export function generatePieceEdgesGrid(rows: number, cols: number): PieceEdges[][] {
  const horizontalEdges: EdgeShape[][] = [];
  for (let r = 0; r < rows - 1; r++) {
    horizontalEdges[r] = [];
    for (let c = 0; c < cols; c++) {
      horizontalEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
    }
  }

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
 * Creates a Path2D for a piece with dimensions (w, h) and specified edges and cutStyle.
 */
export function createPiecePath(
  w: number,
  h: number,
  edges: PieceEdges,
  style: CutStyle = "classic"
): Path2D {
  const path = new Path2D();

  path.moveTo(0, 0);

  // 1. TOP EDGE (from (0, 0) to (w, 0))
  drawEdge(path, 0, 0, w, 0, edges.top, style);

  // 2. RIGHT EDGE (from (w, 0) to (w, h))
  drawEdge(path, w, 0, w, h, edges.right, style);

  // 3. BOTTOM EDGE (from (w, h) to (0, h))
  drawEdge(path, w, h, 0, h, edges.bottom, style);

  // 4. LEFT EDGE (from (0, h) to (0, 0))
  drawEdge(path, 0, h, 0, 0, edges.left, style);

  path.closePath();
  return path;
}

function drawEdge(
  path: Path2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  shape: EdgeShape,
  style: CutStyle
) {
  if (shape === 0) {
    path.lineTo(x2, y2);
    return;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);

  const ux = dx / length;
  const uy = dy / length;

  const sign = shape;
  const nx = -uy * sign;
  const ny = ux * sign;

  const pt = (u: number, v: number): [number, number] => {
    return [
      x1 + u * length * ux + v * length * nx,
      y1 + u * length * uy + v * length * ny,
    ];
  };

  if (style === "hearts") {
    // Heart Shape Tab
    const p1 = pt(0.35, 0);
    const c1a = pt(0.35, 0.15);
    const c1b = pt(0.20, 0.38);
    const p2 = pt(0.35, 0.40); // left lobe peak

    const c2a = pt(0.44, 0.40);
    const c2b = pt(0.48, 0.28);
    const pCenter = pt(0.50, 0.25); // center cusp

    const c3a = pt(0.52, 0.28);
    const c3b = pt(0.56, 0.40);
    const p3 = pt(0.65, 0.40); // right lobe peak

    const c4a = pt(0.80, 0.38);
    const c4b = pt(0.65, 0.15);
    const p4 = pt(0.65, 0);

    path.lineTo(...p1);
    path.bezierCurveTo(c1a[0], c1a[1], c1b[0], c1b[1], p2[0], p2[1]);
    path.bezierCurveTo(c2a[0], c2a[1], c2b[0], c2b[1], pCenter[0], pCenter[1]);
    path.bezierCurveTo(c3a[0], c3a[1], c3b[0], c3b[1], p3[0], p3[1]);
    path.bezierCurveTo(c4a[0], c4a[1], c4b[0], c4b[1], p4[0], p4[1]);
    path.lineTo(x2, y2);
    return;
  }

  if (style === "star") {
    // Star Triangular Peak Tab
    const p1 = pt(0.36, 0);
    const pPeak = pt(0.50, 0.42);
    const p2 = pt(0.64, 0);

    path.lineTo(...p1);
    path.lineTo(...pPeak);
    path.lineTo(...p2);
    path.lineTo(x2, y2);
    return;
  }

  // Classic Jigsaw Tab:
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

  path.lineTo(...p1);
  path.bezierCurveTo(c1a[0], c1a[1], c1b[0], c1b[1], p2[0], p2[1]);
  path.bezierCurveTo(c2a[0], c2a[1], c2b[0], c2b[1], p3[0], p3[1]);
  path.bezierCurveTo(c3a[0], c3a[1], c3b[0], c3b[1], p4[0], p4[1]);
  path.bezierCurveTo(c4a[0], c4a[1], c4b[0], c4b[1], p5[0], p5[1]);
  path.lineTo(x2, y2);
}
