/* SnapCraft — Screenshot Editor Application */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { EditorTool, EditorShape } from '../../lib/types';
import {
  createEditorState,
  generateShapeId,
  renderShapes,
  exportCanvas,
  type EditorState,
} from '../../lib/editor/engine';
import { downloadBlob, generateFilename, copyImageToClipboard } from '../../utils/download';
import { blobToDataUrl } from '../../utils/image';
import './EditorApp.css';

// Predefined color palette
const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#6c63ff', '#a855f7', '#ec4899',
  '#ffffff', '#000000',
];

const TOOLS: Array<{ id: EditorTool; label: string; icon: string }> = [
  { id: 'select', label: 'Select', icon: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z' },
  { id: 'pen', label: 'Pen', icon: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' },
  { id: 'highlighter', label: 'Highlighter', icon: 'M9 11l-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4' },
  { id: 'arrow', label: 'Arrow', icon: 'M5 12h14M12 5l7 7-7 7' },
  { id: 'line', label: 'Line', icon: 'M4 20L20 4' },
  { id: 'rect', label: 'Rectangle', icon: 'M3 3h18v18H3z' },
  { id: 'ellipse', label: 'Ellipse', icon: 'M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z' },
  { id: 'text', label: 'Text', icon: 'M4 7V4h16v3M9 20h6M12 4v16' },
  { id: 'step', label: 'Step Number', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM10 8v8M14 8v4l-4 4' },
  { id: 'blur', label: 'Blur/Mosaic', icon: 'M4 4h4v4H4zM12 4h4v4h-4zM4 12h4v4H4zM12 12h4v4h-4zM20 4h0M20 12h0M4 20h0M12 20h0M20 20h0' },
];

export default function EditorApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<EditorState>(createEditorState);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  // CSS display size of the canvas
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  // The fit-to-screen base ratio (never changes after load)
  const [baseDisplaySize, setBaseDisplaySize] = useState({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<EditorShape | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0, y: 0, visible: false,
  });
  const [textValue, setTextValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Display zoom level (1.0 = fit to screen)
  const [displayZoom, setDisplayZoom] = useState(1);

  // ── Load image from storage ──
  useEffect(() => {
    loadPendingImage();
  }, []);

  async function loadPendingImage() {
    const result = await browser.storage.local.get('_pendingEdit');
    const pending = result._pendingEdit;
    if (!pending?.dataUrl) return;

    const img = new Image();
    img.onload = () => {
      setBackgroundImage(img);

      // Fit-to-screen: compare image natural size vs available viewport
      // On HiDPI, naturalWidth is physical pixels (e.g. 2880 on a 1440 viewport)
      // We just fit the image into the viewport — the canvas buffer stays at
      // naturalWidth×naturalHeight, CSS display size handles the scaling.
      const maxW = window.innerWidth - 40;
      const maxH = window.innerHeight - 100;
      const fitRatio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const displayW = img.naturalWidth * fitRatio;
      const displayH = img.naturalHeight * fitRatio;
      setCanvasSize({ width: displayW, height: displayH });
      setBaseDisplaySize({ width: displayW, height: displayH });
      setDisplayZoom(1);
    };
    img.src = pending.dataUrl;

    // Clean up
    browser.storage.local.remove('_pendingEdit');
  }

  // ── Render ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const shapes = currentShape ? [...state.shapes, currentShape] : state.shapes;
    // Render at 1:1 in the canvas buffer — no zoom transform needed.
    // The browser scales the canvas to CSS display size automatically.
    renderShapes(ctx, shapes, backgroundImage, canvas.width, canvas.height);
  }, [state.shapes, currentShape, backgroundImage, canvasSize]);

  // ── Mouse Handlers ──
  // Map mouse CSS coordinates to canvas buffer coordinates.
  // This is DPR-agnostic: it uses the actual ratio of canvas buffer to CSS rect.
  const getCanvasPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      // Scale factor from CSS display to canvas buffer
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [canvasSize] // re-compute when CSS size changes
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (state.currentTool === 'select') return;
      const point = getCanvasPoint(e);

      if (state.currentTool === 'text') {
        setTextInput({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, visible: true });
        setTextValue('');
        setTimeout(() => textareaRef.current?.focus(), 0);
        return;
      }

      if (state.currentTool === 'step') {
        const shape: EditorShape = {
          id: generateShapeId(),
          type: 'step',
          x: point.x,
          y: point.y,
          color: state.currentColor,
          strokeWidth: state.currentStrokeWidth,
          stepNumber: state.stepCounter,
        };
        pushShape(shape);
        setState((s) => ({ ...s, stepCounter: s.stepCounter + 1 }));
        return;
      }

      setIsDrawing(true);

      const shape: EditorShape = {
        id: generateShapeId(),
        type: state.currentTool,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color: state.currentColor,
        strokeWidth: state.currentStrokeWidth,
        fontSize: state.currentFontSize,
        points:
          state.currentTool === 'pen' || state.currentTool === 'highlighter'
            ? [{ x: point.x, y: point.y }]
            : undefined,
      };
      setCurrentShape(shape);
    },
    [state.currentTool, state.currentColor, state.currentStrokeWidth, state.currentFontSize, state.stepCounter, getCanvasPoint]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentShape) return;
      const point = getCanvasPoint(e);

      if (currentShape.type === 'pen' || currentShape.type === 'highlighter') {
        setCurrentShape({
          ...currentShape,
          points: [...(currentShape.points || []), point],
        });
      } else {
        setCurrentShape({
          ...currentShape,
          width: point.x - currentShape.x,
          height: point.y - currentShape.y,
        });
      }
    },
    [isDrawing, currentShape, getCanvasPoint]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentShape) return;
    setIsDrawing(false);
    pushShape(currentShape);
    setCurrentShape(null);
  }, [isDrawing, currentShape]);

  // ── Shape Management ──
  function pushShape(shape: EditorShape) {
    setState((s) => ({
      ...s,
      shapes: [...s.shapes, shape],
      undoStack: [...s.undoStack, s.shapes],
      redoStack: [],
    }));
  }

  function undo() {
    setState((s) => {
      if (s.undoStack.length === 0) return s;
      const prev = s.undoStack[s.undoStack.length - 1];
      return {
        ...s,
        shapes: prev,
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [...s.redoStack, s.shapes],
      };
    });
  }

  function redo() {
    setState((s) => {
      if (s.redoStack.length === 0) return s;
      const next = s.redoStack[s.redoStack.length - 1];
      return {
        ...s,
        shapes: next,
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack, s.shapes],
      };
    });
  }

  function clearAll() {
    setState((s) => ({
      ...s,
      shapes: [],
      undoStack: [...s.undoStack, s.shapes],
      redoStack: [],
      stepCounter: 1,
    }));
  }

  // ── Text Confirm ──
  function confirmText() {
    if (!textValue.trim()) {
      setTextInput({ ...textInput, visible: false });
      return;
    }
    const point = {
      x: textInput.x / state.zoom,
      y: textInput.y / state.zoom,
    };
    const shape: EditorShape = {
      id: generateShapeId(),
      type: 'text',
      x: point.x,
      y: point.y,
      color: state.currentColor,
      strokeWidth: state.currentStrokeWidth,
      fontSize: state.currentFontSize,
      text: textValue,
    };
    pushShape(shape);
    setTextInput({ ...textInput, visible: false });
    setTextValue('');
  }

  // ── Export ──
  async function handleSave() {
    if (!backgroundImage || !canvasRef.current) return;
    const blob = await exportCanvas(canvasRef.current, backgroundImage, state.shapes, 'png');
    const filename = generateFilename('SnapCraft_{date}_{time}', 'png');
    await downloadBlob(blob, filename);
    await saveToHistory(blob);
    showToast('Saved successfully!');
  }

  async function handleCopy() {
    if (!backgroundImage || !canvasRef.current) return;
    const blob = await exportCanvas(canvasRef.current, backgroundImage, state.shapes, 'png');
    const dataUrl = await blobToDataUrl(blob);
    await copyImageToClipboard(dataUrl);
    await saveToHistory(blob);
    showToast('Copied to clipboard!');
  }

  async function saveToHistory(blob: Blob) {
    try {
      const { saveCapture } = await import('../../lib/storage');
      // Create thumbnail
      const thumbBlob = await createThumbnail(blob);
      await saveCapture({
        type: 'screenshot',
        mode: 'visible',
        thumbnail: thumbBlob,
        data: blob,
        fileSize: blob.size,
        mimeType: blob.type || 'image/png',
        createdAt: Date.now(),
      });
    } catch (e) {
      console.error('[SnapCraft Editor] Save to history error:', e);
    }
  }

  function createThumbnail(blob: Blob): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 240;
        const ratio = maxW / img.naturalWidth;
        canvas.width = maxW;
        canvas.height = Math.round(img.naturalHeight * ratio);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (thumbBlob) => {
            URL.revokeObjectURL(img.src);
            resolve(thumbBlob || new Blob());
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = () => resolve(new Blob());
      img.src = URL.createObjectURL(blob);
    });
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.ctrlKey && e.key === 'c' && !window.getSelection()?.toString()) {
        e.preventDefault();
        handleCopy();
      }
      if (e.key === 'Escape') {
        if (textInput.visible) {
          setTextInput({ ...textInput, visible: false });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, textInput, backgroundImage]);

  // Zoom — only changes CSS display size, canvas buffer stays the same
  function zoomIn() {
    setDisplayZoom((z) => {
      const newZ = Math.min(z + 0.1, 5);
      setCanvasSize({
        width: baseDisplaySize.width * newZ,
        height: baseDisplaySize.height * newZ,
      });
      return newZ;
    });
  }
  function zoomOut() {
    setDisplayZoom((z) => {
      const newZ = Math.max(z - 0.1, 0.1);
      setCanvasSize({
        width: baseDisplaySize.width * newZ,
        height: baseDisplaySize.height * newZ,
      });
      return newZ;
    });
  }
  function zoomReset() {
    setCanvasSize({ ...baseDisplaySize });
    setDisplayZoom(1);
  }

  const cursorClass =
    state.currentTool === 'select'
      ? 'tool-select'
      : state.currentTool === 'text'
      ? 'tool-text'
      : state.currentTool === 'step'
      ? 'tool-step'
      : '';

  return (
    <div className="editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        {/* Tools */}
        <div className="editor-toolbar-group">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              className={`tool-btn ${state.currentTool === tool.id ? 'active' : ''}`}
              onClick={() => setState((s) => ({ ...s, currentTool: tool.id }))}
              title={tool.label}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tool.icon} />
              </svg>
            </button>
          ))}
        </div>

        <div className="editor-toolbar-divider" />

        {/* Colors */}
        <div className="color-picker-group">
          {COLORS.map((color) => (
            <div
              key={color}
              className={`color-swatch ${state.currentColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setState((s) => ({ ...s, currentColor: color }))}
            />
          ))}
        </div>

        <div className="editor-toolbar-divider" />

        {/* Stroke Width */}
        <input
          type="range"
          className="stroke-slider"
          min="1"
          max="10"
          value={state.currentStrokeWidth}
          onChange={(e) =>
            setState((s) => ({ ...s, currentStrokeWidth: Number(e.target.value) }))
          }
          title={`Stroke: ${state.currentStrokeWidth}px`}
        />

        <div className="editor-toolbar-divider" />

        {/* Undo/Redo */}
        <button className="tool-btn" onClick={undo} title="Undo (Ctrl+Z)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button className="tool-btn" onClick={redo} title="Redo (Ctrl+Shift+Z)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>
        <button className="tool-btn" onClick={clearAll} title="Clear All">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>

        {/* Right actions */}
        <div className="editor-toolbar-right">
          <button className="editor-action-btn secondary" onClick={handleCopy}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copy
          </button>
          <button className="editor-action-btn primary" onClick={handleSave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Save
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="editor-canvas-area">
        <canvas
          ref={canvasRef}
          className={`editor-canvas ${cursorClass}`}
          width={backgroundImage ? backgroundImage.naturalWidth : 0}
          height={backgroundImage ? backgroundImage.naturalHeight : 0}
          style={{
            width: canvasSize.width || undefined,
            height: canvasSize.height || undefined,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Text Input Overlay */}
        {textInput.visible && (
          <textarea
            ref={textareaRef}
            className="text-input-overlay"
            style={{
              left: textInput.x,
              top: textInput.y,
              fontSize: state.currentFontSize,
              color: state.currentColor,
            }}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={confirmText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                confirmText();
              }
            }}
          />
        )}

        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={zoomOut} title="Zoom Out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
          <span className="zoom-label" onClick={zoomReset} style={{ cursor: 'pointer' }}>
            {Math.round(displayZoom * 100)}%
          </span>
          <button className="zoom-btn" onClick={zoomIn} title="Zoom In">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="editor-toast success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
