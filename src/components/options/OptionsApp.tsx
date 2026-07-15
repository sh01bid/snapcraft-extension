/* ScreenKing — Options / Settings Page */

import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings } from '../../lib/storage';
import type { AppSettings } from '../../lib/types';
import { DEFAULT_SETTINGS } from '../../lib/types';
import { t } from '../../lib/i18n';
import { setTheme } from '../../lib/theme';
import './OptionsApp.css';

export default function OptionsApp() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const save = useCallback(
    async (partial: Partial<AppSettings>) => {
      const updated = { ...settings, ...partial };
      setSettings(updated);
      await updateSettings(partial);
      if (partial.theme) {
        setTheme(partial.theme);
      }
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    },
    [settings]
  );

  return (
    <div className="options-page">
      {/* Header */}
      <header className="options-header">
        <div className="options-header-inner">
          <div className="options-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
            <h1 className="options-title">{t('settingsTitle')}</h1>
          <span className="options-version">v{chrome.runtime.getManifest().version}</span>
        </div>
      </header>

      {/* Content */}
      <main className="options-content">
        {/* Screenshot Settings */}
        <section className="options-section">
          <div className="options-section-header">
            <div className="options-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <h2 className="options-section-title">{t('settingsScreenshot')}</h2>
          </div>
          <div className="options-section-body">
            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsImageFormat')}</div>
                <div className="setting-description">{t('settingsImageFormatDesc')}</div>
              </div>
              <select
                className="setting-select"
                value={settings.imageFormat}
                onChange={(e) => save({ imageFormat: e.target.value as any })}
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsImageQuality')}</div>
                <div className="setting-description">{t('settingsImageQualityDesc')}</div>
              </div>
              <div className="setting-range">
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={settings.imageQuality}
                  onChange={(e) => save({ imageQuality: Number(e.target.value) })}
                />
                <span className="setting-range-value">{settings.imageQuality}%</span>
              </div>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsAutoCopy')}</div>
                <div className="setting-description">{t('settingsAutoCopyDesc')}</div>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={settings.autoCopyToClipboard}
                  onChange={(e) => save({ autoCopyToClipboard: e.target.checked })}
                />
                <span className="setting-toggle-track" />
              </label>
            </div>
          </div>
        </section>

        {/* Recording Settings */}
        <section className="options-section">
          <div className="options-section-header">
            <div className="options-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>
                <rect width="14" height="12" x="2" y="6" rx="2"/>
              </svg>
            </div>
            <h2 className="options-section-title">{t('settingsRecording')}</h2>
          </div>
          <div className="options-section-body">
            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsVideoFormat')}</div>
                <div className="setting-description">{t('settingsVideoFormatDesc')}</div>
              </div>
              <select
                className="setting-select"
                value={settings.videoFormat}
                onChange={(e) => save({ videoFormat: e.target.value as any })}
              >
                <option value="webm">{t('settingsVideoFormatWebm')}</option>
                <option value="mp4">{t('settingsVideoFormatMp4')}</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsVideoQuality')}</div>
                <div className="setting-description">{t('settingsVideoQualityDesc', 'Affects file size and clarity')}</div>
              </div>
              <select
                className="setting-select"
                value={settings.recordingQuality}
                onChange={(e) => save({ recordingQuality: e.target.value as any })}
              >
                <option value="low">{t('settingsQualityLow')}</option>
                <option value="medium">{t('settingsQualityMedium')}</option>
                <option value="high">{t('settingsQualityHigh')}</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsVideoFps')}</div>
                <div className="setting-description">{t('settingsVideoFpsDesc', 'Frames per second')}</div>
              </div>
              <select
                className="setting-select"
                value={settings.recordingFps}
                onChange={(e) => save({ recordingFps: Number(e.target.value) })}
              >
                <option value="15">{t('settingsFpsValue', '15')}</option>
                <option value="24">{t('settingsFpsValue', '24')}</option>
                <option value="30">{t('settingsFpsValue', '30')}</option>
                <option value="60">{t('settingsFpsValue', '60')}</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsCountdown')}</div>
                <div className="setting-description">{t('settingsCountdownDesc')}</div>
              </div>
              <select
                className="setting-select"
                value={settings.recordingCountdown}
                onChange={(e) => save({ recordingCountdown: Number(e.target.value) })}
              >
                <option value="0">{t('settingsCountdownNone')}</option>
                <option value="3">{t('settingsCountdownSecs', '3')}</option>
                <option value="5">{t('settingsCountdownSecs', '5')}</option>
                <option value="10">{t('settingsCountdownSecs', '10')}</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsSystemAudio')}</div>
                <div className="setting-description">{t('settingsSystemAudioDesc')}</div>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={settings.recordingAudio}
                  onChange={(e) => save({ recordingAudio: e.target.checked })}
                />
                <span className="setting-toggle-track" />
              </label>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsMicrophone')}</div>
                <div className="setting-description">{t('settingsMicrophoneDesc')}</div>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={settings.recordingMicrophone}
                  onChange={(e) => save({ recordingMicrophone: e.target.checked })}
                />
                <span className="setting-toggle-track" />
              </label>
            </div>
          </div>
        </section>

        {/* General Settings */}
        <section className="options-section">
          <div className="options-section-header">
            <div className="options-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h2 className="options-section-title">{t('settingsGeneral')}</h2>
          </div>
          <div className="options-section-body">
            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsTheme')}</div>
                <div className="setting-description">{t('settingsThemeDesc', 'Visual appearance')}</div>
              </div>
              <select
                className="setting-select"
                value={settings.theme}
                onChange={(e) => save({ theme: e.target.value as any })}
              >
                <option value="dark">{t('settingsThemeDark')}</option>
                <option value="light">{t('settingsThemeLight')}</option>
                <option value="system">{t('settingsThemeSystem')}</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsNotifications')}</div>
                <div className="setting-description">{t('settingsNotificationsDesc')}</div>
              </div>
              <label className="setting-toggle">
                <input
                  type="checkbox"
                  checked={settings.showNotifications}
                  onChange={(e) => save({ showNotifications: e.target.checked })}
                />
                <span className="setting-toggle-track" />
              </label>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsMaxHistory')}</div>
                <div className="setting-description">{t('settingsMaxHistoryDesc')}</div>
              </div>
              <select
                className="setting-select"
                value={settings.maxHistoryItems}
                onChange={(e) => save({ maxHistoryItems: Number(e.target.value) })}
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">{t('settingsFilenamePattern')}</div>
                <div className="setting-description">{t('settingsFilenamePatternDesc')}</div>
              </div>
              <input
                type="text"
                className="setting-input"
                value={settings.filenamePattern}
                onChange={(e) => save({ filenamePattern: e.target.value })}
                style={{ width: 200 }}
              />
            </div>
          </div>
        </section>

        {/* Shortcuts Section */}
        <section className="options-section">
          <div className="options-section-header">
            <div className="options-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="M6 8h.01"/>
                <path d="M10 8h.01"/>
                <path d="M14 8h.01"/>
                <path d="M18 8h.01"/>
                <path d="M8 12h.01"/>
                <path d="M12 12h.01"/>
                <path d="M16 12h.01"/>
                <path d="M7 16h10"/>
              </svg>
            </div>
            <h2 className="options-section-title">{t('settingsKeyboardShortcuts')}</h2>
          </div>
          <div className="options-section-body">
            <div className="setting-row">
              <div className="setting-label">{t('settingsShortcutVisible')}</div>
              <kbd style={{
                padding: '2px 8px',
                background: 'var(--sc-bg-elevated)',
                border: '1px solid var(--sc-border)',
                borderRadius: '4px',
                fontFamily: 'var(--sc-font-mono)',
                fontSize: 'var(--sc-text-sm)',
                color: 'var(--sc-text-secondary)',
              }}>Alt+Shift+V</kbd>
            </div>
            <div className="setting-row">
              <div className="setting-label">{t('settingsShortcutFull')}</div>
              <kbd style={{
                padding: '2px 8px',
                background: 'var(--sc-bg-elevated)',
                border: '1px solid var(--sc-border)',
                borderRadius: '4px',
                fontFamily: 'var(--sc-font-mono)',
                fontSize: 'var(--sc-text-sm)',
                color: 'var(--sc-text-secondary)',
              }}>Alt+Shift+F</kbd>
            </div>
            <div className="setting-row">
              <div className="setting-label">{t('settingsShortcutSelect')}</div>
              <kbd style={{
                padding: '2px 8px',
                background: 'var(--sc-bg-elevated)',
                border: '1px solid var(--sc-border)',
                borderRadius: '4px',
                fontFamily: 'var(--sc-font-mono)',
                fontSize: 'var(--sc-text-sm)',
                color: 'var(--sc-text-secondary)',
              }}>Alt+Shift+S</kbd>
            </div>
            <div className="setting-row">
              <div className="setting-label">{t('settingsShortcutRecord')}</div>
              <kbd style={{
                padding: '2px 8px',
                background: 'var(--sc-bg-elevated)',
                border: '1px solid var(--sc-border)',
                borderRadius: '4px',
                fontFamily: 'var(--sc-font-mono)',
                fontSize: 'var(--sc-text-sm)',
                color: 'var(--sc-text-secondary)',
              }}>Alt+Shift+R</kbd>
            </div>
            <div className="setting-row" style={{ justifyContent: 'flex-start' }}>
              <div className="setting-description" style={{ marginTop: 0 }}>
                {t('settingsShortcutChange')} <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
                  }}
                  style={{ color: 'var(--sc-primary-400)', textDecoration: 'underline' }}
                >chrome://extensions/shortcuts</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <div className="options-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Settings saved
        </div>
      )}
    </div>
  );
}
