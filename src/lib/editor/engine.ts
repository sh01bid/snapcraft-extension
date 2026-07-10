/* ScreenKing — Canvas Editor Engine */

import type { EditorShape, EditorTool } from '../types';

export interface EditorState {
  shapes: EditorShape[];
  undoStack: EditorShape[][];
  redoStack: EditorShape[][];
  currentTool: EditorTool;
  currentColor: string;
  currentStrokeWidth: number;
  currentFontSize: number;
  stepCounter: number;
  zoom: number;
  panX: number;
  panY: number;
}

export function createEditorState(): EditorState {
  return {
    shapes: [],
    undoStack: [],
    redoStack: [],
    currentTool: 'select',
    currentColor: '#ef4444',
    currentStrokeWidth: 3,
    currentFontSize: 16,
    stepCounter: 1,
    zoom: 1,
    panX: 0,
    panY: 0,
  };
}

let nextId = 1;

export function generateShapeId(): string {
  return `shape_${nextId++}_${Date.now()}`;
}

/**
 * Render all shapes onto a canvas context
 */
export function renderShapes(
  ctx: CanvasRenderingContext2D,
  shapes: EditorShape[],
  backgroundImage: HTMLImageElement | null,
  canvasWidth: number,
  canvasHeight: number
) {
  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw background at 1:1 (canvas buffer matches image resolution)
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0);
  }

  // Draw shapes (all coordinates are in canvas/image pixel space)
  for (const shape of shapes) {
    drawShape(ctx, shape);
  }

  ctx.restore();
}

/**
 * Draw a single shape
 */
export function drawShape(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  ctx.save();
  ctx.strokeStyle = shape.color;
  ctx.fillStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = shape.opacity ?? 1;

  switch (shape.type) {
    case 'pen':
      drawPen(ctx, shape);
      break;
    case 'highlighter':
      drawHighlighter(ctx, shape);
      break;
    case 'arrow':
      drawArrow(ctx, shape);
      break;
    case 'line':
      drawLine(ctx, shape);
      break;
    case 'rect':
      drawRect(ctx, shape);
      break;
    case 'ellipse':
      drawEllipse(ctx, shape);
      break;
    case 'text':
      drawText(ctx, shape);
      break;
    case 'step':
      drawStep(ctx, shape);
      break;
    case 'blur':
      drawBlur(ctx, shape);
      break;
  }

  ctx.restore();
}

function drawPen(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  if (!shape.points || shape.points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(shape.points[0].x, shape.points[0].y);
  for (let i = 1; i < shape.points.length; i++) {
    const prev = shape.points[i - 1];
    const curr = shape.points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }
  ctx.stroke();
}

function drawHighlighter(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  if (!shape.points || shape.points.length < 2) return;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = shape.strokeWidth * 4;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(shape.points[0].x, shape.points[0].y);
  for (let i = 1; i < shape.points.length; i++) {
    ctx.lineTo(shape.points[i].x, shape.points[i].y);
  }
  ctx.stroke();
}

function drawArrow(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  const w = shape.width || 0;
  const h = shape.height || 0;
  const endX = shape.x + w;
  const endY = shape.y + h;

  // Line
  ctx.beginPath();
  ctx.moveTo(shape.x, shape.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(h, w);
  const headLen = Math.max(15, shape.strokeWidth * 5);
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(angle - Math.PI / 6),
    endY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(angle + Math.PI / 6),
    endY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

function drawLine(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  ctx.beginPath();
  ctx.moveTo(shape.x, shape.y);
  ctx.lineTo(shape.x + (shape.width || 0), shape.y + (shape.height || 0));
  ctx.stroke();
}

function drawRect(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  const w = shape.width || 0;
  const h = shape.height || 0;
  ctx.strokeRect(shape.x, shape.y, w, h);
}

function drawEllipse(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  const w = shape.width || 0;
  const h = shape.height || 0;
  const cx = shape.x + w / 2;
  const cy = shape.y + h / 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawText(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  if (!shape.text) return;
  ctx.font = `${shape.fontSize || 16}px Inter, sans-serif`;
  ctx.fillText(shape.text, shape.x, shape.y + (shape.fontSize || 16));
}

function drawStep(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  const radius = 14;
  // Circle
  ctx.beginPath();
  ctx.arc(shape.x, shape.y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Number
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(shape.stepNumber || 1), shape.x, shape.y);
}

function drawBlur(ctx: CanvasRenderingContext2D, shape: EditorShape) {
  const w = shape.width || 0;
  const h = shape.height || 0;
  if (Math.abs(w) < 4 || Math.abs(h) < 4) return;

  const x = Math.min(shape.x, shape.x + w);
  const y = Math.min(shape.y, shape.y + h);
  const absW = Math.abs(w);
  const absH = Math.abs(h);

  // Pixelate effect (works without filter API)
  const pixelSize = 8;
  const imageData = ctx.getImageData(x, y, absW, absH);
  const data = imageData.data;

  for (let py = 0; py < absH; py += pixelSize) {
    for (let px = 0; px < absW; px += pixelSize) {
      // Average colors in block
      let r = 0, g = 0, b = 0, count = 0;
      for (let dy = 0; dy < pixelSize && py + dy < absH; dy++) {
        for (let dx = 0; dx < pixelSize && px + dx < absW; dx++) {
          const idx = ((py + dy) * absW + (px + dx)) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      // Set all pixels in block to average
      for (let dy = 0; dy < pixelSize && py + dy < absH; dy++) {
        for (let dx = 0; dx < pixelSize && px + dx < absW; dx++) {
          const idx = ((py + dy) * absW + (px + dx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
    }
  }

  ctx.putImageData(imageData, x, y);
}

/**
 * Export canvas to blob
 */
export function exportCanvas(
  canvas: HTMLCanvasElement,
  backgroundImage: HTMLImageElement,
  shapes: EditorShape[],
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.92
): Promise<Blob> {
  // Render at full resolution (no zoom/pan)
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = backgroundImage.naturalWidth;
  exportCanvas.height = backgroundImage.naturalHeight;
  const ctx = exportCanvas.getContext('2d')!;

  ctx.drawImage(backgroundImage, 0, 0);
  for (const shape of shapes) {
    drawShape(ctx, shape);
  }

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Export failed'));
      },
      `image/${format}`,
      quality
    );
  });
}
