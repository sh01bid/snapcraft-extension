/* ScreenKing — Screenshot Editor Application */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { EditorTool, EditorShape } from '../../lib/types';
import {
  createEditorState,
  generateShapeId,
  renderShapes,
  exportCanvas,
  drawShape,
  type EditorState,
} from '../../lib/editor/engine';
import { downloadBlob, generateFilename, copyImageToClipboard } from '../../utils/download';
import { blobToDataUrl } from '../../utils/image';
import { getSettings } from '../../lib/storage';
import { t } from '../../lib/i18n';
import { RateUsModal } from '../RateUsModal';
import './EditorApp.css';

// Predefined color palette
const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#f8b500', '#a855f7', '#ec4899',
  '#ffffff', '#000000',
];

const TOOLS: Array<{ id: EditorTool; label: string; icon: string }> = [
  { id: 'select', label: t('toolSelect', 'Select'), icon: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z' },
  { id: 'pen', label: t('toolPen', 'Pen'), icon: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' },
  { id: 'highlighter', label: t('toolHighlighter', 'Highlighter'), icon: 'M9 11l-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4' },
  { id: 'arrow', label: t('toolArrow', 'Arrow'), icon: 'M5 12h14M12 5l7 7-7 7' },
  { id: 'line', label: t('toolLine', 'Line'), icon: 'M4 20L20 4' },
  { id: 'rect', label: t('toolRect', 'Rectangle'), icon: 'M3 3h18v18H3z' },
  { id: 'ellipse', label: t('toolEllipse', 'Ellipse'), icon: 'M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z' },
  { id: 'text', label: t('toolText', 'Text'), icon: 'M4 7V4h16v3M9 20h6M12 4v16' },
  { id: 'step', label: t('toolStep', 'Step Number'), icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM10 8v8M14 8v4l-4 4' },
  { id: 'blur', label: t('toolBlur', 'Blur/Mosaic'), icon: 'M4 4h4v4H4zM12 4h4v4h-4zM4 12h4v4H4zM12 12h4v4h-4zM20 4h0M20 12h0M4 20h0M12 20h0M20 20h0' },
  { id: 'crop', label: t('toolCrop', 'Crop'), icon: 'M6 2v14a2 2 0 0 0 2 2h14M6 18H2M18 2v4M18 14v4M2 6h4M14 6h4' },
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
  // Crop tool selection (in canvas buffer coordinates)
  const [cropSelection, setCropSelection] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);
  
  // Rate Us prompt
  const [showRateUs, setShowRateUs] = useState(false);

  function triggerRateUsIfNeeded() {
    if (localStorage.getItem('sc_has_rated')) return;
    
    const usageCount = parseInt(localStorage.getItem('sc_usage_count') || '0') + 1;
    localStorage.setItem('sc_usage_count', usageCount.toString());
    
    if (usageCount < 3) return;

    const lastPrompt = localStorage.getItem('sc_rate_prompt_time');
    const now = Date.now();
    // Show if never prompted, or prompted more than 7 days ago
    if (!lastPrompt || (now - parseInt(lastPrompt)) > 7 * 24 * 60 * 60 * 1000) {
      setShowRateUs(true);
      localStorage.setItem('sc_rate_prompt_time', now.toString());
    }
  }

  // ── Load image from storage ──
  useEffect(() => {
    loadPendingImage();
  }, []);

  async function loadPendingImage() {
    // Check for full-page stitch data first
    const stitchResult = await browser.storage.local.get('_pendingStitch');
    if (stitchResult._pendingStitch) {
      const stitchData = stitchResult._pendingStitch;
      browser.storage.local.remove('_pendingStitch');

      if (stitchData.captures && stitchData.captures.length > 0) {
        const { stitchImages } = await import('../../utils/image');
        const imageUrl = await stitchImages(stitchData.captures, stitchData.lastCropHeight);
        loadImageUrl(imageUrl);
        return;
      }
    }

    // Check for single screenshot / region capture
    const result = await browser.storage.local.get('_pendingEdit');
    const pending = result._pendingEdit;
    if (!pending?.dataUrl) return;

    // Clean up storage immediately
    browser.storage.local.remove('_pendingEdit');

    let imageUrl = pending.dataUrl;

    // If crop bounds are provided (region capture), crop the image first
    if (pending.cropBounds) {
      const { cropImage } = await import('../../utils/image');
      const dpr = pending.dpr || window.devicePixelRatio || 1;
      imageUrl = await cropImage(pending.dataUrl, pending.cropBounds, dpr);
    }

    loadImageUrl(imageUrl);
  }

  function loadImageUrl(imageUrl: string) {
    const img = new Image();
    img.onload = () => {
      setBackgroundImage(img);

      // Fit-to-screen — cap at 1/dpr to avoid upscaling on HiDPI
      const dpr = window.devicePixelRatio || 1;
      const maxW = window.innerWidth - 40;
      const maxH = window.innerHeight - 100;
      const fitRatio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1 / dpr);
      const displayW = img.naturalWidth * fitRatio;
      const displayH = img.naturalHeight * fitRatio;
      setCanvasSize({ width: displayW, height: displayH });
      setBaseDisplaySize({ width: displayW, height: displayH });
      setDisplayZoom(1);
    };
    img.src = imageUrl;
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

    // Draw crop selection overlay on canvas
    if (cropSelection) {
      const nx = cropSelection.width < 0 ? cropSelection.x + cropSelection.width : cropSelection.x;
      const ny = cropSelection.height < 0 ? cropSelection.y + cropSelection.height : cropSelection.y;
      const nw = Math.abs(cropSelection.width);
      const nh = Math.abs(cropSelection.height);

      // Dark overlay outside selection
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      // Top
      ctx.fillRect(0, 0, canvas.width, ny);
      // Bottom
      ctx.fillRect(0, ny + nh, canvas.width, canvas.height - ny - nh);
      // Left
      ctx.fillRect(0, ny, nx, nh);
      // Right
      ctx.fillRect(nx + nw, ny, canvas.width - nx - nw, nh);

      // Selection border
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(nx, ny, nw, nh);
      ctx.setLineDash([]);

      // Size label
      if (nw > 50 && nh > 30) {
        const label = `${Math.round(nw)} × ${Math.round(nh)}`;
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        const labelW = ctx.measureText(label).width + 16;
        const labelX = nx + nw / 2;
        const labelY = ny + nh / 2;
        ctx.fillStyle = 'rgba(248, 181, 0, 0.85)';
        ctx.beginPath();
        ctx.roundRect(labelX - labelW / 2, labelY - 12, labelW, 24, 4);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText(label, labelX, labelY + 5);
      }
      ctx.restore();
    }
  }, [state.shapes, currentShape, backgroundImage, canvasSize, cropSelection]);

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

      // Crop tool — start selection
      if (state.currentTool === 'crop') {
        setIsDrawing(true);
        setCropSelection({ x: point.x, y: point.y, width: 0, height: 0 });
        return;
      }

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
      if (!isDrawing) return;
      const point = getCanvasPoint(e);

      // Crop tool — update selection
      if (cropSelection && state.currentTool === 'crop') {
        setCropSelection({
          ...cropSelection,
          width: point.x - cropSelection.x,
          height: point.y - cropSelection.y,
        });
        return;
      }

      if (!currentShape) return;

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
    [isDrawing, currentShape, cropSelection, state.currentTool, getCanvasPoint]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Crop tool — keep selection visible for confirmation
    if (state.currentTool === 'crop') return;

    if (currentShape) {
      pushShape(currentShape);
      setCurrentShape(null);
    }
  }, [isDrawing, currentShape, state.currentTool]);

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
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const scaleX = canvas && rect ? canvas.width / rect.width : 1;
    const scaleY = canvas && rect ? canvas.height / rect.height : 1;
    const point = {
      x: textInput.x * scaleX,
      y: textInput.y * scaleY,
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

  // ── Crop Confirm ──
  function confirmCrop() {
    if (!cropSelection || !backgroundImage) return;

    // Normalize selection (handle negative width/height from right-to-left drag)
    const x = cropSelection.width < 0 ? cropSelection.x + cropSelection.width : cropSelection.x;
    const y = cropSelection.height < 0 ? cropSelection.y + cropSelection.height : cropSelection.y;
    const w = Math.abs(cropSelection.width);
    const h = Math.abs(cropSelection.height);

    if (w < 5 || h < 5) {
      setCropSelection(null);
      showToast('Selection too small');
      return;
    }

    // Clamp to canvas bounds
    const cx = Math.max(0, Math.round(x));
    const cy = Math.max(0, Math.round(y));
    const cw = Math.min(Math.round(w), backgroundImage.naturalWidth - cx);
    const ch = Math.min(Math.round(h), backgroundImage.naturalHeight - cy);

    // Create cropped image
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = cw;
    tmpCanvas.height = ch;
    const ctx = tmpCanvas.getContext('2d')!;

    // Draw existing shapes onto the background first (bake them in)
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = backgroundImage.naturalWidth;
    srcCanvas.height = backgroundImage.naturalHeight;
    const srcCtx = srcCanvas.getContext('2d')!;
    srcCtx.drawImage(backgroundImage, 0, 0);
    for (const shape of state.shapes) {
      drawShape(srcCtx, shape);
    }

    // Crop
    ctx.drawImage(srcCanvas, cx, cy, cw, ch, 0, 0, cw, ch);

    // Replace background using Blob URL (lossless, no base64 overhead)
    tmpCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const croppedImg = new Image();
      croppedImg.onload = () => {
        setBackgroundImage(croppedImg);

        // Reset shapes & state
        setState((s) => ({
          ...s,
          shapes: [],
          undoStack: [],
          redoStack: [],
        }));

        // Recalculate display size — avoid upscaling beyond native resolution
        const dpr = window.devicePixelRatio || 1;
        const maxW = window.innerWidth - 40;
        const maxH = window.innerHeight - 100;
        // Cap at 1/dpr so the image is never upscaled on HiDPI screens
        const fitRatio = Math.min(maxW / croppedImg.naturalWidth, maxH / croppedImg.naturalHeight, 1 / dpr);
        const displayW = croppedImg.naturalWidth * fitRatio;
        const displayH = croppedImg.naturalHeight * fitRatio;
        setCanvasSize({ width: displayW, height: displayH });
        setBaseDisplaySize({ width: displayW, height: displayH });
        setDisplayZoom(1);
        setCropSelection(null);
        showToast('Image cropped!');
      };
      croppedImg.src = url;
    }, 'image/png');
  }

  function cancelCrop() {
    setCropSelection(null);
  }

  // ── Export ──
  async function handleSave() {
    if (!backgroundImage || !canvasRef.current) return;
    const settings = await getSettings();
    const format = settings.imageFormat || 'png';
    const blob = await exportCanvas(canvasRef.current, backgroundImage, state.shapes, format);
    const filename = generateFilename(settings.filenamePattern, format);
    await downloadBlob(blob, filename);
    await saveToHistory(blob);
    showToast(t('editorSaved', 'Saved successfully!'));
    triggerRateUsIfNeeded();
  }

  async function handleCopy() {
    if (!backgroundImage || !canvasRef.current) return;
    const blob = await exportCanvas(canvasRef.current, backgroundImage, state.shapes, 'png');
    const dataUrl = await blobToDataUrl(blob);
    await copyImageToClipboard(dataUrl);
    await saveToHistory(blob);
    showToast(t('editorCopied', 'Copied to clipboard!'));
    triggerRateUsIfNeeded();
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
      console.error('[ScreenKing Editor] Save to history error:', e);
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
      : state.currentTool === 'crop'
      ? 'tool-crop'
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
        <button className="tool-btn" onClick={undo} title={t('editorUndo', 'Undo (Ctrl+Z)')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button className="tool-btn" onClick={redo} title={t('editorRedo', 'Redo (Ctrl+Shift+Z)')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>
        <button className="tool-btn" onClick={clearAll} title={t('editorClearAll', 'Clear All')}>
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
            {t('editorCopy', 'Copy')}
          </button>
          <button className="editor-action-btn primary" onClick={handleSave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            {t('editorSave', 'Save')}
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
          <button className="zoom-btn" onClick={zoomOut} title={t('editorZoomOut', 'Zoom Out')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
          <span className="zoom-label" onClick={zoomReset} style={{ cursor: 'pointer' }}>
            {Math.round(displayZoom * 100)}%
          </span>
          <button className="zoom-btn" onClick={zoomIn} title={t('editorZoomIn', 'Zoom In')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </div>
      </div>

      {/* Crop Action Bar — fixed at bottom center, OUTSIDE canvas-area */}
      {cropSelection && !isDrawing && Math.abs(cropSelection.width) > 5 && Math.abs(cropSelection.height) > 5 && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 24px',
          background: '#1a1a2e',
          border: '1px solid #6366f1',
          borderRadius: '14px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(248, 181, 0,0.2)',
          zIndex: 9999,
        }}>
          <span style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: '14px',
            color: '#a5b4fc',
            letterSpacing: '0.5px',
          }}>
            {Math.round(Math.abs(cropSelection.width))} × {Math.round(Math.abs(cropSelection.height))} px
          </span>

          <div style={{ width: '1px', height: '24px', background: 'rgba(248, 181, 0,0.3)' }} />

          <button
            onClick={confirmCrop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Apply Crop
          </button>

          <button
            onClick={cancelCrop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Cancel
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="editor-toast success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}

      {/* Rate Us Modal */}
      <RateUsModal 
        open={showRateUs} 
        onClose={() => setShowRateUs(false)} 
        onRated={() => localStorage.setItem('sc_has_rated', 'true')} 
      />
    </div>
  );
}
