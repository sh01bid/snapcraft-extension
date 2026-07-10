/* ScreenKing — Theme Manager */

import { getSettings } from './storage';

export type Theme = 'dark' | 'light' | 'system';

/**
 * Apply theme to the document based on settings
 */
export async function applyTheme() {
  const settings = await getSettings();
  setTheme(settings.theme);
}

/**
 * Set theme on the current document
 */
export function setTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

    // Listen for system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
  } else {
    root.setAttribute('data-theme', theme);
  }
}
