/* SnapCraft — Background Service Worker */

import { onMessage } from '../src/lib/messaging';
import type { Message, RegionBounds } from '../src/lib/types';

export default defineBackground(() => {
  console.log('[SnapCraft] Background service worker started');

  // ── Message Router ──
  onMessage((message: Message, sender, sendResponse) => {
    switch (message.type) {
      case 'CAPTURE_VISIBLE':
        handleCaptureVisible(sender).then(sendResponse);
        return true;

      case 'CAPTURE_FULLPAGE':
        handleCaptureFullPage(sender).then(sendResponse);
        return true;

      case 'CAPTURE_REGION':
        handleCaptureRegion(sender).then(sendResponse);
        return true;

      case 'CAPTURE_REGION_RESULT':
        handleCaptureRegionResult(message.payload, sender).then(sendResponse);
        return true;

      case 'START_RECORDING_TAB':
        handleStartRecordingTab(sender).then(sendResponse);
        return true;

      case 'START_RECORDING_SCREEN':
        handleStartRecordingScreen(sender).then(sendResponse);
        return true;

      case 'STOP_RECORDING':
        handleStopRecording().then(sendResponse);
        return true;

      case 'PAUSE_RECORDING':
        sendMessageToOffscreen({ type: 'PAUSE_RECORDING' });
        return false;

      case 'RESUME_RECORDING':
        sendMessageToOffscreen({ type: 'RESUME_RECORDING' });
        return false;

      case 'OPEN_EDITOR':
        openEditor(message.payload);
        return false;

      case 'RECORDING_COMPLETE':
        handleRecordingComplete(message.payload);
        return false;

      case 'FULLPAGE_SCROLL_NEXT':
        handleFullPageScrollStep(sender, message.payload);
        return false;

      case 'FULLPAGE_SCROLL_DONE':
        handleFullPageScrollDone(message.payload);
        return false;

      default:
        return false;
    }
  });

  // ── Command Shortcuts ──
  browser.commands.onCommand.addListener(async (command) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    switch (command) {
      case 'capture-visible':
        handleCaptureVisible({ tab } as any);
        break;
      case 'capture-fullpage':
        handleCaptureFullPage({ tab } as any);
        break;
      case 'capture-region':
        injectRegionSelector(tab.id);
        break;
      case 'record-tab':
        handleStartRecordingTab({ tab } as any);
        break;
    }
  });

  // ── Capture Handlers ──

  async function handleCaptureVisible(
    sender: chrome.runtime.MessageSender
  ): Promise<{ dataUrl: string }> {
    const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
      format: 'png',
    });
    // Open editor with the captured image
    openEditor(dataUrl);
    return { dataUrl };
  }

  async function handleCaptureFullPage(
    sender: chrome.runtime.MessageSender
  ): Promise<{ success: boolean }> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return { success: false };

    // Store tab ID for the scroll capture flow
    fullPageTabId = tab.id;
    fullPageCaptures = [];

    // Inject and execute full-page capture content script
    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: fullPageCaptureScript,
      });

      // The injected script will send FULLPAGE_SCROLL_NEXT messages
      return { success: true };
    } catch (e) {
      console.error('[SnapCraft] Full page capture error:', e);
      fullPageTabId = null;
      return { success: false };
    }
  }

  // Full-page scroll state
  let fullPageCaptures: string[] = [];
  let fullPageTabId: number | null = null;

  async function handleFullPageScrollStep(
    sender: chrome.runtime.MessageSender,
    payload: any
  ) {
    // Use stored tabId (more reliable than sender.tab for injected scripts)
    const tabId = sender.tab?.id ?? fullPageTabId;
    if (!tabId) {
      console.error('[SnapCraft] Full page scroll: no tab ID');
      return;
    }

    try {
      // Wait a bit for scroll to settle
      await new Promise((r) => setTimeout(r, 200));

      const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
        format: 'png',
      });
      fullPageCaptures.push(dataUrl);
      console.log(`[SnapCraft] Full page: captured segment ${fullPageCaptures.length}`);

      // Tell content script to continue scrolling
      await browser.tabs.sendMessage(tabId, {
        type: 'FULLPAGE_SCROLL_PROGRESS',
        payload: { captured: fullPageCaptures.length },
      });
    } catch (e) {
      console.error('[SnapCraft] Full page scroll step error:', e);
    }
  }

  async function handleFullPageScrollDone(payload: { lastCropHeight?: number }) {
    console.log(`[SnapCraft] Full page done: ${fullPageCaptures.length} segments`);
    if (fullPageCaptures.length === 0) return;

    // Store captures FIRST, before opening editor
    await browser.storage.local.set({
      _pendingStitch: {
        captures: fullPageCaptures,
        lastCropHeight: payload.lastCropHeight,
      },
    });

    fullPageCaptures = [];
    fullPageTabId = null;

    // Then open editor
    const editorUrl = browser.runtime.getURL('/editor.html');
    await browser.tabs.create({ url: editorUrl });
  }

  async function handleCaptureRegion(
    sender: chrome.runtime.MessageSender
  ): Promise<{ success: boolean }> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return { success: false };

    await injectRegionSelector(tab.id);
    return { success: true };
  }

  async function injectRegionSelector(tabId: number) {
    // The region selector is a WXT content script
    // We trigger it by sending a message
    try {
      await browser.tabs.sendMessage(tabId, { type: 'CAPTURE_REGION' });
    } catch {
      // Content script not injected yet, inject it first
      await browser.scripting.executeScript({
        target: { tabId },
        files: ['/content-scripts/region-selector.js'],
      });
      // Wait briefly for the script to initialize, then send the message
      await new Promise((r) => setTimeout(r, 100));
      await browser.tabs.sendMessage(tabId, { type: 'CAPTURE_REGION' });
    }
  }

  async function handleCaptureRegionResult(
    bounds: RegionBounds,
    sender: chrome.runtime.MessageSender
  ) {
    if (!sender.tab?.id) return;

    // Capture visible area and crop
    const dataUrl = await browser.tabs.captureVisibleTab(undefined, {
      format: 'png',
    });
    openEditor(dataUrl, bounds);
  }

  // ── Recording Handlers ──

  async function handleStartRecordingTab(
    sender: chrome.runtime.MessageSender
  ): Promise<{ success: boolean }> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return { success: false };

    try {
      await ensureOffscreenDocument();

      // Get the media stream ID for tab capture
      const streamId = await (chrome.tabCapture as any).getMediaStreamId({
        targetTabId: tab.id,
      });

      // Send to offscreen document to start recording
      await browser.runtime.sendMessage({
        type: 'START_RECORDING_TAB',
        target: 'offscreen',
        payload: { streamId, tabId: tab.id },
      });

      // Inject recording control overlay
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/content-scripts/recording-controls.js'],
      });

      // Tell the content script to show the controls
      await new Promise((r) => setTimeout(r, 100));
      await browser.tabs.sendMessage(tab.id, { type: 'SHOW_RECORDING_CONTROLS' });

      return { success: true };
    } catch (e) {
      console.error('[SnapCraft] Tab recording error:', e);
      return { success: false };
    }
  }

  async function handleStartRecordingScreen(
    sender: chrome.runtime.MessageSender
  ): Promise<{ success: boolean }> {
    try {
      await ensureOffscreenDocument();

      // Send to offscreen document — it will call getDisplayMedia
      await browser.runtime.sendMessage({
        type: 'START_RECORDING_SCREEN',
        target: 'offscreen',
      });

      // Show recording controls on the active tab
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['/content-scripts/recording-controls.js'],
        });
        await new Promise((r) => setTimeout(r, 100));
        await browser.tabs.sendMessage(tab.id, { type: 'SHOW_RECORDING_CONTROLS' });
      }

      return { success: true };
    } catch (e) {
      console.error('[SnapCraft] Screen recording error:', e);
      return { success: false };
    }
  }

  async function handleStopRecording(): Promise<{ success: boolean }> {
    try {
      await sendMessageToOffscreen({ type: 'STOP_RECORDING' });
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  }

  async function handleRecordingComplete(payload: {
    duration: number;
    mimeType: string;
    size: number;
    captureId?: number;
  }) {
    // Store the capture ID so the preview page can find it
    if (payload.captureId) {
      await browser.storage.local.set({
        _pendingPreview: { captureId: payload.captureId },
      });
    }

    // Open the preview page
    const previewUrl = browser.runtime.getURL('/preview.html');
    await browser.tabs.create({ url: previewUrl });

    // Hide recording controls on the recorded tab
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      browser.tabs.sendMessage(tab.id, { type: 'HIDE_RECORDING_CONTROLS' }).catch(() => {});
    }
  }

  // ── Offscreen Document Management ──

  async function ensureOffscreenDocument() {
    const existingContexts = await (chrome.runtime as any).getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
    });

    if (existingContexts.length > 0) return;

    await (chrome.offscreen as any).createDocument({
      url: browser.runtime.getURL('/offscreen.html'),
      reasons: ['USER_MEDIA', 'DISPLAY_MEDIA'],
      justification: 'Recording tab or screen',
    });
  }

  async function sendMessageToOffscreen(message: Message) {
    await browser.runtime.sendMessage({ ...message, target: 'offscreen' });
  }

  // ── Editor ──

  async function openEditor(dataUrl: string, cropBounds?: RegionBounds) {
    const editorUrl = browser.runtime.getURL('/editor.html');

    // Get the DPR from the active tab (background SW doesn't have window)
    let dpr = 1;
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const results = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.devicePixelRatio,
        });
        if (results?.[0]?.result) {
          dpr = results[0].result as number;
        }
      }
    } catch {
      // Fallback to 1
    }

    // Store the image data temporarily
    await browser.storage.local.set({
      _pendingEdit: {
        dataUrl,
        cropBounds,
        dpr,
        timestamp: Date.now(),
      },
    });
    browser.tabs.create({ url: editorUrl });
  }

  // ── Full-page capture content script (injected into tab) ──
  function fullPageCaptureScript() {
    // This runs in the page context
    const originalScrollTop = document.documentElement.scrollTop;
    const totalHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const viewportHeight = window.innerHeight;
    let currentY = 0;

    // Hide fixed elements during capture
    const fixedElements: Array<{ el: HTMLElement; originalPosition: string }> = [];
    document.querySelectorAll('*').forEach((el) => {
      const style = getComputedStyle(el);
      if (
        style.position === 'fixed' ||
        style.position === 'sticky'
      ) {
        const htmlEl = el as HTMLElement;
        fixedElements.push({
          el: htmlEl,
          originalPosition: htmlEl.style.position,
        });
      }
    });

    // Hide fixed elements except on first scroll position
    function hideFixedElements() {
      fixedElements.forEach(({ el }) => {
        el.style.position = 'absolute';
      });
    }

    function restoreFixedElements() {
      fixedElements.forEach(({ el, originalPosition }) => {
        el.style.position = originalPosition;
      });
    }

    function scrollAndCapture() {
      window.scrollTo(0, currentY);

      if (currentY > 0) {
        hideFixedElements();
      }

      // Notify background to capture
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'FULLPAGE_SCROLL_NEXT',
          payload: { currentY, totalHeight, viewportHeight },
        });
      }, 100);
    }

    // Listen for progress messages
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'FULLPAGE_SCROLL_PROGRESS') {
        currentY += viewportHeight;

        if (currentY >= totalHeight) {
          // Calculate last image crop height
          const lastCropHeight = totalHeight % viewportHeight || viewportHeight;
          
          restoreFixedElements();
          window.scrollTo(0, originalScrollTop);

          chrome.runtime.sendMessage({
            type: 'FULLPAGE_SCROLL_DONE',
            payload: {
              lastCropHeight: lastCropHeight * window.devicePixelRatio,
            },
          });
        } else {
          scrollAndCapture();
        }
      }
    });

    // Start capture
    scrollAndCapture();
  }
});
