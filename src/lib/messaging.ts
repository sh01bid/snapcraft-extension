/* ScreenKing — Message Communication Layer */

import type { Message, MessageType } from './types';

/**
 * Send a message to the background service worker
 */
export function sendMessage<T = any>(
  type: MessageType,
  payload?: any
): Promise<T> {
  return browser.runtime.sendMessage({ type, payload } as Message);
}

/**
 * Listen for messages in any context (background, popup, content script, offscreen)
 */
export function onMessage(
  handler: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => boolean | void | Promise<any>
) {
  browser.runtime.onMessage.addListener(
    (message: any, sender: any, sendResponse: any) => {
      const result = handler(message as Message, sender, sendResponse);
      // Return true if handler returns true (async response) or a Promise
      if (result instanceof Promise) {
        result.then(sendResponse).catch((err) => {
          console.error('[ScreenKing] Message handler error:', err);
          sendResponse({ error: err.message });
        });
        return true;
      }
      return result;
    }
  );
}

/**
 * Send a message to a specific tab's content script
 */
export function sendTabMessage<T = any>(
  tabId: number,
  type: MessageType,
  payload?: any
): Promise<T> {
  return browser.tabs.sendMessage(tabId, { type, payload } as Message);
}

/**
 * Create a typed message
 */
export function createMessage(type: MessageType, payload?: any): Message {
  return { type, payload };
}
