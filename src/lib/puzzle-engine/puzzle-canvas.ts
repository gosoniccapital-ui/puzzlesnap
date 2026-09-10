import { DisjointSet } from "./disjoint-set";
import { generatePieceEdgesGrid, createPiecePath, CutStyle } from "./bezier-cutter";
import { Piece, Point, BoardBounds } from "./types";
import { soundFx } from "./sound";

export interface EngineEvents {
  onProgress?: (placedCount: number, totalCount: number) => void;
  onVictory?: () => void;
  onMove?: () => void;
  onZoomChange?: (zoomScale: number) => void;
}

export class PuzzleCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement;
  private rows: number;
  private cols: number;
  private snapTolerance: number;
  public cutStyle: CutStyle;

  public pieces: Piece[] = [];
  public dsu: DisjointSet;
  public boardBounds: BoardBounds = { x: 0, y: 0, width: 0, height: 0 };
  
  // Camera & Viewport Zoom / Pan State
  public zoomScale: number = 1.0;
  public panOffset: Point = { x: 0, y: 0 };
  public readonly minZoom: number = 0.5;
  public readonly maxZoom: number = 3.0;

  // Interaction & Gesture State
  private activeGroup: number[] | null = null;
  private dragStartPos: Point = { x: 0, y: 0 };
  private initialPiecePositions: Map<number, Point> = new Map();
  private maxZIndex: number = 100;
  private consecutiveSnaps: number = 0;

  // Multi-touch tracking
  private activePointers: Map<number, Point> = new Map();
  private isPanningCanvas: boolean = false;
  private panStartScreenPos: Point = { x: 0, y: 0 };
  private initialPanOffset: Point = { x: 0, y: 0 };
  private pinchStartDist: number = 0;
  private pinchStartCenter: Point = { x: 0, y: 0 };
  private pinchStartZoom: number = 1.0;
  private pinchStartPan: Point = { x: 0, y: 0 };

  // Visual helper toggles
  public showGhostImage: boolean = false;
  public showEdgesOnly: boolean = false;

  private events: EngineEvents;
  private animationFrameId: number | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    rows: number = 4,
    cols: number = 5,
    events: EngineEvents = {},
    snapTolerance: number = 16,
    cutStyle: CutStyle = "classic"
  ) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get CanvasRenderingContext2D");
    this.ctx = context;
    this.image = image;
    this.rows = rows;
    this.cols = cols;
    this.snapTolerance = snapTolerance;
    this.events = events;
    this.cutStyle = cutStyle;

    const totalPieces = rows * cols;
    this.dsu = new DisjointSet(totalPieces);

    this.initBoard();
    this.initPieces();
    this.arrangePieces();
    this.attachEvents();
    this.render();
  }

  public resize() {
    // Resize canvas to parent container width/height
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    const oldBounds = { ...this.boardBounds };
    this.initBoard();

    // If board already had pieces initialized, proportionally re-scale them to the new bounds
    if (oldBounds.width > 0 && oldBounds.height > 0 && this.pieces.length > 0) {
      const newPieceW = this.boardBounds.width / this.cols;
      const newPieceH = this.boardBounds.height / this.rows;

      this.pieces.forEach((piece) => {
        piece.width = newPieceW;
        piece.height = newPieceH;
        piece.path = createPiecePath(newPieceW, newPieceH, piece.edges, this.cutStyle);

        // Update target snapped position in new board coordinate space
        piece.originalPos = {
          x: this.boardBounds.x + piece.col * newPieceW,
          y: this.boardBounds.y + piece.row * newPieceH,
        };

        if (piece.isPlaced) {
          // Keep solved pieces locked seamlessly to their new board target
          piece.currentPos = { ...piece.originalPos };
        } else {
          // Proportionally interpolate unsolved pieces based on their relative position to old board
          const relX = (piece.currentPos.x - oldBounds.x) / oldBounds.width;
          const relY = (piece.currentPos.y - oldBounds.y) / oldBounds.height;
          let targetX = this.boardBounds.x + relX * this.boardBounds.width;
          let targetY = this.boardBounds.y + relY * this.boardBounds.height;

          // Clamp within visible canvas container bounds
          targetX = Math.max(10, Math.min(rect.width - newPieceW - 10, targetX));
          targetY = Math.max(10, Math.min(rect.height - newPieceH - 10, targetY));
          piece.currentPos = { x: targetX, y: targetY };
        }
      });
    }

    this.render();
  }

  private initBoard() {
    const rect = this.canvas.getBoundingClientRect();
    const cWidth = rect.width;
    const cHeight = rect.height;

    // Board occupies around 60% of the canvas center, leaving margins for scattered pieces
    const imgAspect = this.image.naturalWidth / this.image.naturalHeight;
    const maxBoardW = Math.min(cWidth * 0.65, 800);
    const maxBoardH = Math.min(cHeight * 0.75, 600);

    let boardW = maxBoardW;
    let boardH = boardW / imgAspect;

    if (boardH > maxBoardH) {
      boardH = maxBoardH;
      boardW = boardH * imgAspect;
    }

    const boardX = (cWidth - boardW) / 2;
    const boardY = (cHeight - boardH) / 2;

    this.boardBounds = {
      x: boardX,
      y: boardY,
      width: boardW,
      height: boardH,
    };
  }

  private initPieces() {
    const totalPieces = this.rows * this.cols;
    const edgesGrid = generatePieceEdgesGrid(this.rows, this.cols);
    const pieceW = this.boardBounds.width / this.cols;
    const pieceH = this.boardBounds.height / this.rows;

    this.pieces = [];
    let id = 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const edges = edgesGrid[r][c];
        const path = createPiecePath(pieceW, pieceH, edges, this.cutStyle);
        const originalPos: Point = {
          x: this.boardBounds.x + c * pieceW,
          y: this.boardBounds.y + r * pieceH,
        };

        this.pieces.push({
          id,
          row: r,
          col: c,
          edges,
          originalPos,
          currentPos: { ...originalPos },
          width: pieceW,
          height: pieceH,
          isPlaced: false,
          groupId: id,
          zIndex: 1,
          path,
        });

        id++;
      }
    }
  }

  /**
   * Scatters pieces cleanly outside the board area (along left/right margins)
   */
  public arrangePieces() {
    const rect = this.canvas.getBoundingClientRect();
    const cWidth = rect.width;
    const cHeight = rect.height;
    const leftSpace = this.boardBounds.x;
    const rightSpaceStart = this.boardBounds.x + this.boardBounds.width;
    const pieceW = this.boardBounds.width / this.cols;
    const pieceH = this.boardBounds.height / this.rows;

    this.pieces.forEach((piece, index) => {
      if (piece.isPlaced) return;

      const isLeft = index % 2 === 0;
      const xRange = isLeft
        ? Math.max(10, leftSpace - pieceW - 10)
        : Math.max(rightSpaceStart + 10, cWidth - pieceW - 20);

      const targetX = isLeft
        ? 15 + Math.random() * Math.max(10, leftSpace - pieceW - 30)
        : rightSpaceStart + 15 + Math.random() * Math.max(10, cWidth - rightSpaceStart - pieceW - 30);

      const targetY = 40 + Math.random() * Math.max(20, cHeight - pieceH - 80);

      piece.currentPos = { x: targetX, y: targetY };
    });

    this.render();
  }

  public shuffle() {
    const rect = this.canvas.getBoundingClientRect();
    const cWidth = rect.width;
    const cHeight = rect.height;
    const pieceW = this.boardBounds.width / this.cols;
    const pieceH = this.boardBounds.height / this.rows;

    this.pieces.forEach((piece) => {
      piece.isPlaced = false;
      piece.currentPos = {
        x: Math.random() * (cWidth - pieceW - 20) + 10,
        y: Math.random() * (cHeight - pieceH - 20) + 10,
      };
    });

    // Reset Union-Find
    this.dsu = new DisjointSet(this.pieces.length);
    this.render();
  }

  public solve() {
    this.pieces.forEach((piece) => {
      piece.currentPos = { ...piece.originalPos };
      piece.isPlaced = true;
    });

    for (let i = 0; i < this.pieces.length; i++) {
      this.dsu.union(0, i);
    }

    soundFx.playVictory();
    this.events.onVictory?.();
    this.render();
  }

  public setCutStyle(style: CutStyle) {
    this.cutStyle = style;
    const pieceW = this.boardBounds.width / this.cols;
    const pieceH = this.boardBounds.height / this.rows;
    this.pieces.forEach((piece) => {
      piece.path = createPiecePath(pieceW, pieceH, piece.edges, style);
    });
    this.render();
  }

  // ==========================================
  // CAMERA COORDINATE TRANSFORMS (World <-> Screen)
  // ==========================================
  public screenToWorld(pos: Point): Point {
    return {
      x: (pos.x - this.panOffset.x) / this.zoomScale,
      y: (pos.y - this.panOffset.y) / this.zoomScale,
    };
  }

  public worldToScreen(pos: Point): Point {
    return {
      x: pos.x * this.zoomScale + this.panOffset.x,
      y: pos.y * this.zoomScale + this.panOffset.y,
    };
  }

  public setZoom(targetZoom: number, focalScreenPoint?: Point) {
    const rect = this.canvas.getBoundingClientRect();
    const focalScreen = focalScreenPoint || { x: rect.width / 2, y: rect.height / 2 };
    const clampedZoom = Math.min(Math.max(targetZoom, this.minZoom), this.maxZoom);
    if (Math.abs(clampedZoom - this.zoomScale) < 0.001) return;

    const focalWorld = this.screenToWorld(focalScreen);
    this.zoomScale = clampedZoom;
    this.panOffset = {
      x: focalScreen.x - focalWorld.x * this.zoomScale,
      y: focalScreen.y - focalWorld.y * this.zoomScale,
    };

    this.render();
    this.events.onZoomChange?.(this.zoomScale);
  }

  public zoomIn() {
    this.setZoom(this.zoomScale * 1.2);
  }

  public zoomOut() {
    this.setZoom(this.zoomScale / 1.2);
  }

  public resetZoom() {
    this.zoomScale = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.render();
    this.events.onZoomChange?.(this.zoomScale);
  }

  // ==========================================
  // EVENT HANDLING (Touch & Mouse via PointerEvents)
  // ==========================================
  private attachEvents() {
    this.canvas.style.touchAction = "none";

    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("pointercancel", this.handlePointerCancel);
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  public destroy() {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.handlePointerCancel);
    this.canvas.removeEventListener("wheel", this.handleWheel);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private getPointerPos(e: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const focalScreen = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    this.setZoom(this.zoomScale * zoomFactor, focalScreen);
  };

  private handlePointerDown = (e: PointerEvent) => {
    const screenPos = this.getPointerPos(e);
    this.activePointers.set(e.pointerId, screenPos);

    // Multi-touch: 2 or more fingers -> Switch to Pinch / Pan mode
    if (this.activePointers.size >= 2) {
      // If we were dragging a piece, revert to original position to avoid jitter
      if (this.activeGroup) {
        this.activeGroup.forEach((id) => {
          const init = this.initialPiecePositions.get(id);
          if (init) this.pieces[id].currentPos = { ...init };
        });
        this.activeGroup = null;
      }
      this.isPanningCanvas = false;

      const pts = Array.from(this.activePointers.values());
      this.pinchStartDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      this.pinchStartCenter = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
      this.pinchStartZoom = this.zoomScale;
      this.pinchStartPan = { ...this.panOffset };
      this.render();
      return;
    }

    // Single touch or mouse click: check if hitting a puzzle piece (in World Space)
    const worldPos = this.screenToWorld(screenPos);
    const sorted = [...this.pieces].sort((a, b) => b.zIndex - a.zIndex);

    let hitPiece: Piece | null = null;
    for (const piece of sorted) {
      if (piece.isPlaced) continue;

      const margin = Math.max(piece.width, piece.height) * 0.4;
      if (
        worldPos.x >= piece.currentPos.x - margin &&
        worldPos.x <= piece.currentPos.x + piece.width + margin &&
        worldPos.y >= piece.currentPos.y - margin &&
        worldPos.y <= piece.currentPos.y + piece.height + margin
      ) {
        hitPiece = piece;
        break;
      }
    }

    if (hitPiece) {
      // Hit a piece: initiate dragging of the DSU cluster
      this.maxZIndex += 1;
      const group = this.dsu.getGroup(hitPiece.id);
      this.activeGroup = group;
      this.dragStartPos = worldPos;

      this.initialPiecePositions.clear();
      group.forEach((memberId) => {
        const p = this.pieces[memberId];
        p.zIndex = this.maxZIndex;
        this.initialPiecePositions.set(memberId, { ...p.currentPos });
      });

      this.isPanningCanvas = false;
      this.render();
    } else {
      // Hit empty canvas space: start single-finger canvas pan
      this.activeGroup = null;
      this.isPanningCanvas = true;
      this.panStartScreenPos = screenPos;
      this.initialPanOffset = { ...this.panOffset };
    }
  };

  private handlePointerMove = (e: PointerEvent) => {
    const screenPos = this.getPointerPos(e);
    if (!this.activePointers.has(e.pointerId)) return;
    this.activePointers.set(e.pointerId, screenPos);

    // Multi-touch pinch & pan
    if (this.activePointers.size >= 2) {
      const pts = Array.from(this.activePointers.values());
      const currDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
      const currCenter = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };

      const scaleFactor = currDist / this.pinchStartDist;
      const targetZoom = Math.min(
        Math.max(this.pinchStartZoom * scaleFactor, this.minZoom),
        this.maxZoom
      );

      // World point corresponding to initial pinch center
      const worldCenter = {
        x: (this.pinchStartCenter.x - this.pinchStartPan.x) / this.pinchStartZoom,
        y: (this.pinchStartCenter.y - this.pinchStartPan.y) / this.pinchStartZoom,
      };

      this.zoomScale = targetZoom;
      this.panOffset = {
        x: currCenter.x - worldCenter.x * this.zoomScale,
        y: currCenter.y - worldCenter.y * this.zoomScale,
      };

      this.render();
      this.events.onZoomChange?.(this.zoomScale);
      return;
    }

    // Single touch / mouse dragging piece
    if (this.activeGroup) {
      const worldPos = this.screenToWorld(screenPos);
      const dx = worldPos.x - this.dragStartPos.x;
      const dy = worldPos.y - this.dragStartPos.y;

      this.activeGroup.forEach((id) => {
        const initial = this.initialPiecePositions.get(id);
        if (initial) {
          this.pieces[id].currentPos = {
            x: initial.x + dx,
            y: initial.y + dy,
          };
        }
      });

      this.render();
      return;
    }

    // Single touch / mouse panning canvas background
    if (this.isPanningCanvas) {
      const dx = screenPos.x - this.panStartScreenPos.x;
      const dy = screenPos.y - this.panStartScreenPos.y;

      this.panOffset = {
        x: this.initialPanOffset.x + dx,
        y: this.initialPanOffset.y + dy,
      };

      this.render();
      return;
    }
  };

  private handlePointerCancel = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);
    if (this.activePointers.size === 0) {
      this.isPanningCanvas = false;
      this.activeGroup = null;
      this.render();
    }
  };

  private handlePointerUp = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);

    // If there are still active pointers (e.g. 1 finger left after 2-finger pinch),
    // update pinch/pan anchor to avoid sudden jump
    if (this.activePointers.size === 1) {
      const remainingPos = Array.from(this.activePointers.values())[0];
      this.isPanningCanvas = true;
      this.panStartScreenPos = remainingPos;
      this.initialPanOffset = { ...this.panOffset };
      return;
    }

    this.isPanningCanvas = false;

    if (!this.activeGroup) return;

    this.events.onMove?.();
    let snappedAny = false;

    // 1. Check Magnetic Snap to Board Target
    for (const id of this.activeGroup) {
      const piece = this.pieces[id];
      const distToOriginal = Math.hypot(
        piece.currentPos.x - piece.originalPos.x,
        piece.currentPos.y - piece.originalPos.y
      );

      if (distToOriginal <= this.snapTolerance) {
        // Snap entire group into final board position!
        const shiftX = piece.originalPos.x - piece.currentPos.x;
        const shiftY = piece.originalPos.y - piece.currentPos.y;

        this.activeGroup.forEach((groupId) => {
          const gp = this.pieces[groupId];
          gp.currentPos.x += shiftX;
          gp.currentPos.y += shiftY;
          gp.isPlaced = true;
          gp.zIndex = 0; // lock to board layer
        });

        snappedAny = true;
        this.consecutiveSnaps++;
        soundFx.playSnap(this.consecutiveSnaps);
        break;
      }
    }

    // 2. Check Snapping to Adjacent Pieces (if not placed on board yet)
    if (!snappedAny) {
      for (const id of this.activeGroup) {
        const piece = this.pieces[id];
        if (piece.isPlaced) continue;

        // Check 4 orthogonal neighbors
        const neighbors = [
          { r: piece.row - 1, c: piece.col, dx: 0, dy: -piece.height },
          { r: piece.row + 1, c: piece.col, dx: 0, dy: piece.height },
          { r: piece.row, c: piece.col - 1, dx: -piece.width, dy: 0 },
          { r: piece.row, c: piece.col + 1, dx: piece.width, dy: 0 },
        ];

        for (const n of neighbors) {
          if (n.r < 0 || n.r >= this.rows || n.c < 0 || n.c >= this.cols) continue;
          const neighborPiece = this.pieces.find((p) => p.row === n.r && p.col === n.c);
          if (!neighborPiece || this.dsu.connected(piece.id, neighborPiece.id)) continue;

          // Expected relative position
          const expectedX = piece.currentPos.x + n.dx;
          const expectedY = piece.currentPos.y + n.dy;

          const dist = Math.hypot(
            neighborPiece.currentPos.x - expectedX,
            neighborPiece.currentPos.y - expectedY
          );

          if (dist <= this.snapTolerance) {
            // Align neighbor piece & its group to this piece
            const deltaX = expectedX - neighborPiece.currentPos.x;
            const deltaY = expectedY - neighborPiece.currentPos.y;

            const neighborGroup = this.dsu.getGroup(neighborPiece.id);
            neighborGroup.forEach((nid) => {
              this.pieces[nid].currentPos.x += deltaX;
              this.pieces[nid].currentPos.y += deltaY;
            });

            this.dsu.union(piece.id, neighborPiece.id);
            snappedAny = true;
            this.consecutiveSnaps++;
            soundFx.playSnap(this.consecutiveSnaps);
            break;
          }
        }
        if (snappedAny) break;
      }
    }

    if (!snappedAny) {
      this.consecutiveSnaps = 0;
    }

    this.activeGroup = null;

    // Check progress & victory condition
    const placedCount = this.pieces.filter((p) => p.isPlaced).length;
    this.events.onProgress?.(placedCount, this.pieces.length);

    if (placedCount === this.pieces.length) {
      soundFx.playVictory();
      this.events.onVictory?.();
    }

    this.render();
  };

  // ==========================================
  // RENDERING PIPELINE (Canvas 2D 60fps)
  // ==========================================
  public render() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    this.ctx.save();
    // Apply camera transform: Pan and Zoom
    this.ctx.translate(this.panOffset.x, this.panOffset.y);
    this.ctx.scale(this.zoomScale, this.zoomScale);

    // 1. Draw Assembly Board Outline & Background
    this.drawBoardBackground();

    // 2. Draw Ghost / Shadow Image hint (if enabled)
    if (this.showGhostImage) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.22;
      this.ctx.drawImage(
        this.image,
        this.boardBounds.x,
        this.boardBounds.y,
        this.boardBounds.width,
        this.boardBounds.height
      );
      this.ctx.restore();
    }

    // 3. Sort pieces: placed first (bottom), unplaced sorted by zIndex
    const sortedPieces = [...this.pieces].sort((a, b) => {
      if (a.isPlaced && !b.isPlaced) return -1;
      if (!a.isPlaced && b.isPlaced) return 1;
      return a.zIndex - b.zIndex;
    });

    // 4. Render Pieces
    for (const piece of sortedPieces) {
      this.drawPiece(piece);
    }

    this.ctx.restore();
  }

  private drawBoardBackground() {
    const b = this.boardBounds;
    this.ctx.save();

    // Subtle dark board boundary with dashed guide
    this.ctx.fillStyle = "rgba(15, 23, 42, 0.04)";
    this.ctx.fillRect(b.x, b.y, b.width, b.height);

    this.ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([6, 6]);
    this.ctx.strokeRect(b.x, b.y, b.width, b.height);

    this.ctx.restore();
  }

  private drawPiece(piece: Piece) {
    if (!piece.path) return;

    // If edges-only helper is active, dim interior pieces unless they belong to placed cluster
    const isEdgePiece =
      piece.row === 0 ||
      piece.row === this.rows - 1 ||
      piece.col === 0 ||
      piece.col === this.cols - 1;

    const shouldDim = this.showEdgesOnly && !isEdgePiece && !piece.isPlaced;

    this.ctx.save();
    this.ctx.translate(piece.currentPos.x, piece.currentPos.y);

    if (shouldDim) {
      this.ctx.globalAlpha = 0.15;
    }

    // A. Drop Shadow for unplaced pieces (realistic physical cardboard depth)
    if (!piece.isPlaced) {
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 3;
      this.ctx.shadowOffsetY = 4;
    }

    // B. Clip to Piece Path
    this.ctx.save();
    this.ctx.clip(piece.path);

    // Calculate source rect from original image
    const srcScaleX = this.image.naturalWidth / this.boardBounds.width;
    const srcScaleY = this.image.naturalHeight / this.boardBounds.height;

    // Piece offset relative to board
    const cellBoardOffsetX = piece.col * piece.width;
    const cellBoardOffsetY = piece.row * piece.height;

    // Expand drawing boundary by 45% for tabs
    const tabMargin = Math.max(piece.width, piece.height) * 0.45;

    const srcX = Math.max(0, (cellBoardOffsetX - tabMargin) * srcScaleX);
    const srcY = Math.max(0, (cellBoardOffsetY - tabMargin) * srcScaleY);
    const srcW = (piece.width + tabMargin * 2) * srcScaleX;
    const srcH = (piece.height + tabMargin * 2) * srcScaleY;

    const destX = -tabMargin;
    const destY = -tabMargin;
    const destW = piece.width + tabMargin * 2;
    const destH = piece.height + tabMargin * 2;

    this.ctx.drawImage(this.image, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
    this.ctx.restore(); // end clip

    // C. Embossed Stroke / Bevel border
    this.ctx.shadowColor = "transparent";
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeStyle = piece.isPlaced
      ? "rgba(255, 255, 255, 0.25)"
      : "rgba(0, 0, 0, 0.45)";
    this.ctx.stroke(piece.path);

    this.ctx.restore();
  }
}
