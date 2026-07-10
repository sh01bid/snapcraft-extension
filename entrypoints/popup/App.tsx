/* ScreenKing — Popup Main UI */

import { useState, useEffect, useCallback } from 'react';
import { sendMessage } from '../../src/lib/messaging';
import { t } from '../../src/lib/i18n';
import './style.css';

// Inline SVG icons to avoid lucide-react bundle in popup
const icons = {
  camera: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  ),
  scrollText: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 12h-5"/>
      <path d="M15 8h-5"/>
      <path d="M19 17V5a2 2 0 0 0-2-2H4"/>
      <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2"/>
    </svg>
  ),
  crop: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2v14a2 2 0 0 0 2 2h14"/>
      <path d="M18 22V8a2 2 0 0 0-2-2H2"/>
    </svg>
  ),
  monitor: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2"/>
      <line x1="8" x2="16" y1="21" y2="21"/>
      <line x1="12" x2="12" y1="17" y2="21"/>
    </svg>
  ),
  video: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>
      <rect width="14" height="12" x="2" y="6" rx="2"/>
    </svg>
  ),
  history: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  keyboard: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 8h.01"/>
      <path d="M12 12h.01"/>
      <path d="M14 8h.01"/>
      <path d="M16 12h.01"/>
      <path d="M18 8h.01"/>
      <path d="M6 8h.01"/>
      <path d="M7 16h10"/>
      <path d="M8 12h.01"/>
      <rect width="20" height="16" x="2" y="4" rx="2"/>
    </svg>
  ),
  scissors: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <path d="M8.12 8.12 12 12"/>
      <path d="M20 4 8.12 15.88"/>
      <circle cx="6" cy="18" r="3"/>
      <path d="M14.8 14.8 20 20"/>
    </svg>
  ),
  logo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="15" r="4.5" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
      <path d="M 6.5 11.5 L 4.5 4.5 L 9.5 8.5 L 12 3 L 14.5 8.5 L 19.5 4.5 L 17.5 11.5" />
      <path d="M 7 20 L 4 20 L 4 17" />
      <path d="M 17 20 L 20 20 L 20 17" />
    </svg>
  ),
  squareStop: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect width="14" height="14" x="5" y="5" rx="2"/>
    </svg>
  ),
};

type RecordingState = {
  isRecording: boolean;
  duration: number;
  mode: 'tab' | 'screen' | null;
};

function App() {
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    mode: null,
  });

  // ── Actions ──

  const captureVisible = useCallback(async () => {
    await sendMessage('CAPTURE_VISIBLE');
    window.close();
  }, []);

  const captureFullPage = useCallback(async () => {
    await sendMessage('CAPTURE_FULLPAGE');
    window.close();
  }, []);

  const captureRegion = useCallback(async () => {
    await sendMessage('CAPTURE_REGION');
    window.close();
  }, []);

  const recordTab = useCallback(async () => {
    await sendMessage('START_RECORDING_TAB');
    setRecording({ isRecording: true, duration: 0, mode: 'tab' });
    window.close();
  }, []);

  const recordScreen = useCallback(async () => {
    await sendMessage('START_RECORDING_SCREEN');
    setRecording({ isRecording: true, duration: 0, mode: 'screen' });
    window.close();
  }, []);

  const stopRecording = useCallback(async () => {
    await sendMessage('STOP_RECORDING');
    setRecording({ isRecording: false, duration: 0, mode: null });
  }, []);

  const openHistory = useCallback(() => {
    browser.tabs.create({
      url: browser.runtime.getURL('/captures.html'),
    });
    window.close();
  }, []);

  const openSettings = useCallback(() => {
    browser.runtime.openOptionsPage();
    window.close();
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (!recording.isRecording) return;
    const interval = setInterval(() => {
      setRecording((prev) => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [recording.isRecording]);

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="popup">
      {/* Header */}
      <header className="popup-header">
        <div className="popup-logo">
          <div className="popup-logo-icon">{icons.logo}</div>
          <span className="popup-logo-text">ScreenKing</span>
        </div>
        <div className="popup-header-actions">
          <button
            className="popup-icon-btn"
            onClick={openHistory}
            title="History"
          >
            {icons.history}
          </button>
          <button
            className="popup-icon-btn"
            onClick={openSettings}
            title="Settings"
          >
            {icons.settings}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="popup-content">
        {/* Recording Banner */}
        {recording.isRecording && (
          <div className="recording-banner">
            <div className="recording-dot" />
            <span className="recording-timer">
              {formatDuration(recording.duration)}
            </span>
            <button className="recording-stop-btn" onClick={stopRecording}>
              {icons.squareStop} Stop
            </button>
          </div>
        )}

        {/* Screenshot Section */}
        <section className="section">
          <h2 className="section-title">{t('popupScreenshot')}</h2>
          <div className="action-grid">
            <button className="action-card" onClick={captureVisible} id="btn-capture-visible">
              <div className="action-card-icon screenshot">
                {icons.camera}
              </div>
              <span className="action-card-label">{t('popupVisibleArea')}</span>
            </button>

            <button className="action-card" onClick={captureFullPage} id="btn-capture-fullpage">
              <div className="action-card-icon screenshot">
                {icons.scrollText}
              </div>
              <span className="action-card-label">{t('popupFullPage')}</span>
            </button>

            <button className="action-card" onClick={captureRegion} id="btn-capture-region">
              <div className="action-card-icon screenshot">
                {icons.crop}
              </div>
              <span className="action-card-label">{t('popupSelectArea')}</span>
            </button>
          </div>
        </section>

        {/* Recording Section */}
        <section className="section">
          <h2 className="section-title">{t('popupRecording')}</h2>
          <div className="action-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <button
              className="action-card"
              onClick={recordTab}
              disabled={recording.isRecording}
              id="btn-record-tab"
            >
              <div className="action-card-icon recording">
                {icons.video}
              </div>
              <span className="action-card-label">{t('popupCurrentTab')}</span>
            </button>

            <button
              className="action-card"
              onClick={recordScreen}
              disabled={recording.isRecording}
              id="btn-record-screen"
            >
              <div className="action-card-icon recording">
                {icons.monitor}
              </div>
              <span className="action-card-label">{t('popupDesktop')}</span>
            </button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="section">
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={openHistory}>
              {icons.history}
              <span>{t('popupHistory')}</span>
            </button>
            <button className="quick-action-btn" onClick={openSettings}>
              {icons.settings}
              <span>{t('popupSettings')}</span>
            </button>
          </div>
        </section>

        {/* Shortcut Hint */}
        <section className="section">
          <div className="shortcut-hint">
            <span className="shortcut-hint-icon">{icons.keyboard}</span>
            <span className="shortcut-hint-text">
              {t('popupQuickCapture')} <kbd className="shortcut-kbd">Alt+Shift+S</kbd>
            </span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="popup-footer">
        <span className="popup-footer-text">ScreenKing</span>
        <span className="popup-footer-version">v{chrome.runtime.getManifest().version}</span>
      </footer>
    </div>
  );
}

export default App;
