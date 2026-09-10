export type EdgeShape = 0 | 1 | -1; // 0: flat border, 1: tab (outward), -1: blank (inward)

export interface Point {
  x: number;
  y: number;
}

export interface PieceEdges {
  top: EdgeShape;
  right: EdgeShape;
  bottom: EdgeShape;
  left: EdgeShape;
}

export interface Piece {
  id: number;
  row: number;
  col: number;
  edges: PieceEdges;
  originalPos: Point; // Destination coordinate in puzzle board space
  currentPos: Point;  // Current coordinate on the canvas
  width: number;      // Grid cell width
  height: number;     // Grid cell height
  isPlaced: boolean;  // Placed in exact final spot
  groupId: number;    // DSU group ID
  zIndex: number;
  path?: Path2D;      // Cached Path2D relative to (0, 0)
}

export interface PuzzleConfig {
  rows: number;
  cols: number;
  imageSrc: string;
  cutStyle?: "classic" | "hearts";
  snapTolerance?: number; // default: 14px
}

export interface BoardBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
