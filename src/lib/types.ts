/* SnapCraft — Shared Types */

// ── Message Types ──
export type MessageType =
  | 'CAPTURE_VISIBLE'
  | 'CAPTURE_FULLPAGE'
  | 'CAPTURE_REGION'
  | 'CAPTURE_REGION_RESULT'
  | 'START_RECORDING_TAB'
  | 'START_RECORDING_SCREEN'
  | 'STOP_RECORDING'
  | 'PAUSE_RECORDING'
  | 'RESUME_RECORDING'
  | 'RECORDING_STATUS'
  | 'RECORDING_COMPLETE'
  | 'OPEN_EDITOR'
  | 'SAVE_CAPTURE'
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS'
  | 'FULLPAGE_SCROLL_NEXT'
  | 'FULLPAGE_SCROLL_DONE'
  | 'FULLPAGE_SCROLL_PROGRESS'
  | 'SHOW_RECORDING_CONTROLS'
  | 'HIDE_RECORDING_CONTROLS';

export interface Message<T = any> {
  type: MessageType;
  payload?: T;
}

// ── Capture Types ──
export type CaptureMode = 'visible' | 'fullpage' | 'region';
export type RecordingMode = 'tab' | 'screen';

export interface CaptureResult {
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
  mode: CaptureMode;
}

export interface RegionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  devicePixelRatio: number;
}

// ── Recording Types ──
export type RecordingStatus = 'idle' | 'countdown' | 'recording' | 'paused' | 'processing' | 'done';

export interface RecordingOptions {
  mode: RecordingMode;
  audio: boolean;
  microphone: boolean;
  webcam: boolean;
  countdown: number; // seconds, 0 = no countdown
  quality: 'low' | 'medium' | 'high';
  fps: number;
}

export interface RecordingResult {
  blob: Blob;
  duration: number;
  timestamp: number;
  mode: RecordingMode;
  mimeType: string;
}

// ── Editor Types ──
export type EditorTool =
  | 'select'
  | 'pen'
  | 'arrow'
  | 'line'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'step'
  | 'blur'
  | 'crop'
  | 'highlighter';

export interface EditorShape {
  id: string;
  type: EditorTool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Array<{ x: number; y: number }>;
  text?: string;
  color: string;
  strokeWidth: number;
  fontSize?: number;
  stepNumber?: number;
  opacity?: number;
}

// ── Storage Types ──
export interface CaptureRecord {
  id?: number;
  type: 'screenshot' | 'recording';
  mode: CaptureMode | RecordingMode;
  thumbnail: Blob;
  data: Blob;
  width?: number;
  height?: number;
  duration?: number;
  fileSize: number;
  mimeType: string;
  createdAt: number;
}

// ── Settings Types ──
export interface AppSettings {
  // Screenshot
  imageFormat: 'png' | 'jpeg' | 'webp';
  imageQuality: number; // 0-100, for jpeg/webp
  filenamePattern: string;

  // Recording
  recordingQuality: 'low' | 'medium' | 'high';
  recordingFps: number;
  recordingAudio: boolean;
  recordingMicrophone: boolean;
  recordingCountdown: number;
  videoFormat: 'webm' | 'mp4';

  // General
  theme: 'dark' | 'light' | 'system';
  showNotifications: boolean;
  autoCopyToClipboard: boolean;
  maxHistoryItems: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  imageFormat: 'png',
  imageQuality: 92,
  filenamePattern: 'SnapCraft_{date}_{time}',

  recordingQuality: 'high',
  recordingFps: 30,
  recordingAudio: true,
  recordingMicrophone: false,
  recordingCountdown: 3,
  videoFormat: 'webm',

  theme: 'dark',
  showNotifications: true,
  autoCopyToClipboard: false,
  maxHistoryItems: 100,
};
