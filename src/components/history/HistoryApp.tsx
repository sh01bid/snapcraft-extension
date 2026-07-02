/* SnapCraft — History Page */

import { useState, useEffect } from 'react';
import { getCaptures, deleteCapture, getSettings } from '../../lib/storage';
import type { CaptureRecord } from '../../lib/types';
import { downloadBlob, generateFilename } from '../../utils/download';
import { blobToDataUrl } from '../../utils/image';
import { t } from '../../lib/i18n';
import './HistoryApp.css';

type FilterType = 'all' | 'screenshot' | 'recording';

export default function HistoryApp() {
  const [captures, setCaptures] = useState<CaptureRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<number, string>>({});
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCaptures();
  }, [filter]);

  async function loadCaptures() {
    const type = filter === 'all' ? undefined : filter;
    const items = await getCaptures({ type, limit: 100 });
    setCaptures(items);

    const urls: Record<number, string> = {};
    for (const item of items) {
      if (item.id && item.thumbnail && item.thumbnail.size > 0) {
        urls[item.id] = URL.createObjectURL(item.thumbnail);
      }
    }
    setThumbnailUrls(urls);
  }

  useEffect(() => {
    return () => {
      Object.values(thumbnailUrls).forEach(URL.revokeObjectURL);
    };
  }, [thumbnailUrls]);

  async function handleDownload(item: CaptureRecord) {
    const settings = await getSettings();
    const pattern = settings.filenamePattern || 'SnapCraft_{date}_{time}';
    const ext = item.type === 'recording' ? 'webm' : (settings.imageFormat || 'png');
    const filename = generateFilename(pattern, ext);
    await downloadBlob(item.data, filename);
  }

  async function handleDelete(id: number) {
    await deleteCapture(id);
    setCaptures((prev) => prev.filter((c) => c.id !== id));
    if (thumbnailUrls[id]) {
      URL.revokeObjectURL(thumbnailUrls[id]);
    }
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function handleOpen(item: CaptureRecord) {
    if (selectMode) return; // Don't open in select mode
    if (item.type === 'screenshot') {
      const dataUrl = await blobToDataUrl(item.data);
      await browser.storage.local.set({
        _pendingEdit: { dataUrl, timestamp: Date.now() },
      });
      window.open(browser.runtime.getURL('/editor.html'));
    } else {
      const url = URL.createObjectURL(item.data);
      window.open(url);
    }
  }

  // ── Batch Operations ──

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === captures.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(captures.map((c) => c.id!).filter(Boolean)));
    }
  }

  async function handleBatchDelete() {
    const ids = Array.from(selected);
    for (const id of ids) {
      await deleteCapture(id);
      if (thumbnailUrls[id]) {
        URL.revokeObjectURL(thumbnailUrls[id]);
      }
    }
    setCaptures((prev) => prev.filter((c) => !selected.has(c.id!)));
    setSelected(new Set());
    setSelectMode(false);
  }

  async function handleBatchDownload() {
    const settings = await getSettings();
    const pattern = settings.filenamePattern || 'SnapCraft_{date}_{time}';
    for (const item of captures) {
      if (item.id && selected.has(item.id)) {
        const ext = item.type === 'recording' ? 'webm' : (settings.imageFormat || 'png');
        const filename = generateFilename(pattern, ext);
        await downloadBlob(item.data, filename);
        // Small delay between downloads to avoid Chrome throttling
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="history-page">
      {/* Header */}
      <header className="history-header">
        <div className="history-header-left">
          <div className="history-logo">
            <div className="history-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <h1 className="history-title">{t('historyTitle')}</h1>
          </div>
          <span className="history-subtitle">{captures.length} {t('historyItems', String(captures.length)).replace(`${captures.length} `, '')}</span>
        </div>

        <div className="history-header-right">
          {/* Filters */}
          <div className="history-filters">
            {(['all', 'screenshot', 'recording'] as FilterType[]).map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? t('historyAll') : f === 'screenshot' ? t('historyScreenshots') : t('historyRecordings')}
              </button>
            ))}
          </div>

          {/* Select Mode Toggle */}
          {captures.length > 0 && (
            <button
              className={`select-mode-btn ${selectMode ? 'active' : ''}`}
              onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              {selectMode ? t('historyCancel') : t('historySelect')}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="history-content">
        {captures.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <h3 className="history-empty-title">{t('historyEmpty')}</h3>
            <p className="history-empty-text">
              {t('historyEmptyDesc')}
            </p>
          </div>
        ) : (
          <div className="history-grid">
            {captures.map((item, i) => (
              <div
                key={item.id}
                className={`history-card ${selectMode && selected.has(item.id!) ? 'selected' : ''}`}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => selectMode ? toggleSelect(item.id!) : handleOpen(item)}
              >
                {/* Checkbox overlay in select mode */}
                {selectMode && (
                  <div className="history-card-checkbox">
                    <div className={`checkbox-indicator ${selected.has(item.id!) ? 'checked' : ''}`}>
                      {selected.has(item.id!) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}

                <div className="history-card-thumb">
                  {thumbnailUrls[item.id!] ? (
                    <img src={thumbnailUrls[item.id!]} alt="" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  )}
                  <span className={`history-card-badge ${item.type}`}>
                    {item.type === 'screenshot' ? '📷' : '🎥'} {item.type}
                  </span>
                  {item.type === 'recording' && item.duration && (
                    <span className="history-card-duration">
                      {formatDuration(item.duration)}
                    </span>
                  )}
                </div>
                <div className="history-card-info">
                  <div className="history-card-date">
                    {formatDate(item.createdAt)}
                  </div>
                  <div className="history-card-actions">
                    <span className="history-card-size">
                      {formatSize(item.fileSize)}
                    </span>
                    {!selectMode && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="history-card-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                          title="Download"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                          </svg>
                        </button>
                        <button
                          className="history-card-action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.id) handleDelete(item.id);
                          }}
                          title="Delete"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Batch Actions Bar */}
      {selectMode && selected.size > 0 && (
        <div className="batch-action-bar">
          <div className="batch-info">
            <span className="batch-count">{selected.size}</span> {t('historySelected', String(selected.size)).replace(`${selected.size} `, '')}
          </div>
          <div className="batch-buttons">
            <button className="batch-btn select-all" onClick={toggleSelectAll}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              {selected.size === captures.length ? t('historyDeselectAll') : t('historySelectAll')}
            </button>
            <button className="batch-btn download" onClick={handleBatchDownload}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              {t('historyDownload')}
            </button>
            <button className="batch-btn delete" onClick={handleBatchDelete}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              {t('historyDelete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
