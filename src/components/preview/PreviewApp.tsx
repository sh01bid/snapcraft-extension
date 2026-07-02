/* SnapCraft — Recording Preview Page */

import { useState, useEffect, useRef } from 'react';
import { getCapture, deleteCapture, getSettings } from '../../lib/storage';
import { downloadBlob, generateFilename } from '../../utils/download';
import './PreviewApp.css';

export default function PreviewApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    duration: number;
    size: number;
    mimeType: string;
  } | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'webm' | 'mp4'>('webm');

  useEffect(() => {
    loadRecording();
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, []);

  async function loadRecording() {
    try {
      // Get the captureId from chrome.storage.local
      const result = await browser.storage.local.get('_pendingPreview');
      const pending = result._pendingPreview;

      if (pending?.captureId) {
        const capture = await getCapture(pending.captureId);
        if (capture && capture.data) {
          const url = URL.createObjectURL(capture.data);
          setVideoUrl(url);
          setVideoBlob(capture.data);
          setMeta({
            duration: capture.duration || 0,
            size: capture.fileSize || capture.data.size,
            mimeType: capture.mimeType || 'video/webm',
          });
        }
        // Clean up storage (don't await, let it happen in background)
        browser.storage.local.remove('_pendingPreview');
      }
    } catch (err) {
      console.error('[SnapCraft Preview] Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDuration(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  async function handleDownload() {
    if (!videoBlob) return;
    const settings = await getSettings();
    const pattern = settings.filenamePattern || 'SnapCraft_{date}_{time}';

    if (downloadFormat === 'webm') {
      const filename = generateFilename(pattern, 'webm');
      await downloadBlob(videoBlob, filename);
      showToast('Downloaded as WebM!');
    } else {
      showToast('MP4 conversion coming soon — downloading as WebM');
      const filename = generateFilename(pattern, 'webm');
      await downloadBlob(videoBlob, filename);
    }
  }

  async function handleDelete() {
    if (!videoBlob) return;
    try {
      // Try to delete from IndexedDB
      const result = await browser.storage.local.get('_pendingPreview');
      if (result._pendingPreview?.captureId) {
        await deleteCapture(result._pendingPreview.captureId);
      }
      browser.storage.local.remove('_pendingPreview');

      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
      setVideoBlob(null);
      showToast('Recording deleted');
      setTimeout(() => window.close(), 1000);
    } catch {
      showToast('Could not delete recording');
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="preview-page">
      {/* Header */}
      <header className="preview-header">
        <div className="preview-header-left">
          <div className="preview-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>
              <rect width="14" height="12" x="2" y="6" rx="2"/>
            </svg>
          </div>
          <h1 className="preview-title">Recording Preview</h1>

          {meta && (
            <div className="preview-meta">
              <span className="preview-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {formatDuration(meta.duration)}
              </span>
              <span className="preview-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {formatSize(meta.size)}
              </span>
            </div>
          )}
        </div>

        <div className="preview-header-actions">
          <select
            className="format-select"
            value={downloadFormat}
            onChange={(e) => setDownloadFormat(e.target.value as any)}
          >
            <option value="webm">WebM</option>
            <option value="mp4">MP4 (coming soon)</option>
          </select>

          <button className="preview-btn primary" onClick={handleDownload}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>

          <button className="preview-btn danger" onClick={handleDelete}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="preview-content">
        {loading ? (
          <div className="preview-loading">
            <div className="preview-loading-spinner" />
            <span className="preview-loading-text">Loading recording...</span>
          </div>
        ) : videoUrl ? (
          <div className="preview-video-container">
            <video
              ref={videoRef}
              className="preview-video"
              src={videoUrl}
              controls
              autoPlay
              loop
            />
          </div>
        ) : (
          <div className="preview-loading">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>
              <rect width="14" height="12" x="2" y="6" rx="2"/>
            </svg>
            <span className="preview-loading-text">No recording found</span>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="preview-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
