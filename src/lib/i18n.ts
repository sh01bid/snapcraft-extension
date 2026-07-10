/* ScreenKing — i18n Utility */

/**
 * Get localized message with fallback
 */
export function t(key: string, ...substitutions: string[]): string {
  try {
    const msg = chrome.i18n.getMessage(key, substitutions);
    return msg || key;
  } catch {
    return key;
  }
}
