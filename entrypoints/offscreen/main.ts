/* SnapCraft — Offscreen Document: Recording Engine */

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let mediaStream: MediaStream | null = null;
let startTimestamp = 0;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Only handle messages targeted at offscreen
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Strictly only process messages routed through background
  if (message.target !== 'offscreen') return;

  switch (message.type) {
    case 'START_RECORDING_TAB':
      startTabRecording(message.payload).then(sendResponse);
      return true;

    case 'START_RECORDING_SCREEN':
      startScreenRecording().then(sendResponse);
      return true;

    case 'STOP_RECORDING':
      stopRecording().then(sendResponse);
      return true;

    case 'PAUSE_RECORDING':
      pauseRecording();
      break;

    case 'RESUME_RECORDING':
      resumeRecording();
      break;
  }
});

async function startTabRecording(payload: { streamId: string; tabId: number }) {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: payload.streamId,
        },
      } as any,
      video: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: payload.streamId,
        },
      } as any,
    });

    startRecording(mediaStream);
    return { success: true };
  } catch (error: any) {
    console.error('[SnapCraft Offscreen] Tab recording error:', error);
    return { success: false, error: error.message };
  }
}

async function startScreenRecording() {
  try {
    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
      } as any,
      audio: true,
    });

    // Listen for user stopping via browser's native stop button
    mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
      stopRecording();
    });

    startRecording(mediaStream);
    return { success: true };
  } catch (error: any) {
    console.error('[SnapCraft Offscreen] Screen recording error:', error);
    return { success: false, error: error.message };
  }
}

let stopResolve: ((result: any) => void) | null = null;

function startRecording(stream: MediaStream) {
  recordedChunks = [];
  startTimestamp = Date.now();

  // Determine best available codec
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];

  let mimeType = 'video/webm';
  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      mimeType = type;
      break;
    }
  }

  mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    console.log('[SnapCraft Offscreen] MediaRecorder stopped, chunks:', recordedChunks.length);
    const duration = Date.now() - startTimestamp;
    const recMimeType = mediaRecorder?.mimeType || mimeType;
    const blob = new Blob(recordedChunks, { type: recMimeType });
    recordedChunks = [];

    // IMPORTANT: Do NOT stop media tracks until after storage is complete!
    // Chrome may destroy the offscreen document when tracks stop,
    // killing any pending async operations (IndexedDB, etc.)

    try {
      // Convert blob to base64 data URL for chrome.storage.local
      const dataUrl = await blobToDataUrl(blob);
      console.log('[SnapCraft Offscreen] Blob converted to data URL, length:', dataUrl.length);

      // Store directly in chrome.storage.local (we have unlimitedStorage)
      await chrome.storage.local.set({
        _pendingRecording: {
          dataUrl,
          duration,
          mimeType: recMimeType,
          size: blob.size,
          createdAt: Date.now(),
        },
      });
      console.log('[SnapCraft Offscreen] Recording stored in chrome.storage.local');

      const result = { success: true, duration, mimeType: recMimeType, size: blob.size };

      // Send RECORDING_COMPLETE to background
      chrome.runtime.sendMessage({
        type: 'RECORDING_COMPLETE',
        payload: result,
      });

      // Also resolve the pending promise if it exists
      if (stopResolve) {
        stopResolve(result);
        stopResolve = null;
      }
    } catch (e) {
      console.error('[SnapCraft Offscreen] Failed to store recording:', e);
      if (stopResolve) {
        stopResolve({ success: false });
        stopResolve = null;
      }
    } finally {
      // NOW it's safe to stop tracks
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        mediaStream = null;
      }
    }
  };

  mediaRecorder.onerror = (event: any) => {
    console.error('[SnapCraft Offscreen] MediaRecorder error:', event.error);
  };

  mediaRecorder.start(1000);
  console.log('[SnapCraft Offscreen] Recording started, state:', mediaRecorder.state);
}

function pauseRecording() {
  if (mediaRecorder?.state === 'recording') {
    mediaRecorder.pause();
    chrome.runtime.sendMessage({
      type: 'RECORDING_STATUS',
      payload: { status: 'paused' },
    });
  }
}

function resumeRecording() {
  if (mediaRecorder?.state === 'paused') {
    mediaRecorder.resume();
    chrome.runtime.sendMessage({
      type: 'RECORDING_STATUS',
      payload: { status: 'recording' },
    });
  }
}

async function stopRecording(): Promise<{ success: boolean; captureId?: number; duration?: number; mimeType?: string; size?: number }> {
  console.log('[SnapCraft Offscreen] stopRecording called, state:', mediaRecorder?.state);

  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    // Recorder already stopped — try to find latest recording from IndexedDB
    console.log('[SnapCraft Offscreen] Recorder inactive, checking IndexedDB for latest...');
    try {
      const captureId = await getLatestRecordingId();
      if (captureId) {
        return { success: true, captureId };
      }
    } catch (e) {
      console.error('[SnapCraft Offscreen] Failed to get latest recording:', e);
    }
    return { success: false };
  }

  return new Promise((resolve) => {
    stopResolve = resolve;
    mediaRecorder!.stop();
  });
}

// Helper to find the most recent recording if recorder already stopped
function getLatestRecordingId(): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('SnapCraftDB', 1);
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const tx = db.transaction('captures', 'readonly');
      const store = tx.objectStore('captures');
      const index = store.index('createdAt');
      const cursorReq = index.openCursor(null, 'prev');
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor && cursor.value.type === 'recording') {
          resolve(cursor.value.id);
        } else {
          resolve(null);
        }
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    };
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

async function storeRecordingBlob(blob: Blob, duration: number, mimeType: string): Promise<number> {
  console.log('[SnapCraft Offscreen] storeRecordingBlob called, blob size:', blob.size);
  const thumbnail = await createVideoThumbnail(blob);
  console.log('[SnapCraft Offscreen] Thumbnail created, size:', thumbnail.size);

  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('SnapCraftDB', 1);
    dbRequest.onupgradeneeded = () => {
      const db = dbRequest.result;
      if (!db.objectStoreNames.contains('captures')) {
        const store = db.createObjectStore('captures', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('type', 'type');
        store.createIndex('mode', 'mode');
        store.createIndex('createdAt', 'createdAt');
      }
    };

    dbRequest.onsuccess = () => {
      console.log('[SnapCraft Offscreen] IndexedDB opened successfully');
      const db = dbRequest.result;
      const tx = db.transaction('captures', 'readwrite');
      const store = tx.objectStore('captures');
      const addRequest = store.add({
        type: 'recording',
        mode: 'tab',
        thumbnail,
        data: blob,
        duration,
        fileSize: blob.size,
        mimeType,
        createdAt: Date.now(),
      });
      addRequest.onsuccess = () => {
        console.log('[SnapCraft Offscreen] IndexedDB add success, id:', addRequest.result);
        resolve(addRequest.result as number);
      };
      addRequest.onerror = () => {
        console.error('[SnapCraft Offscreen] IndexedDB add error:', addRequest.error);
        reject(addRequest.error);
      };
      tx.onerror = () => {
        console.error('[SnapCraft Offscreen] Transaction error:', tx.error);
      };
      tx.onabort = () => {
        console.error('[SnapCraft Offscreen] Transaction aborted:', tx.error);
        reject(tx.error || new Error('Transaction aborted'));
      };
    };

    dbRequest.onerror = () => {
      console.error('[SnapCraft Offscreen] IndexedDB open error:', dbRequest.error);
      reject(dbRequest.error);
    };

    (dbRequest as any).onblocked = () => {
      console.error('[SnapCraft Offscreen] IndexedDB BLOCKED — another connection is open');
      reject(new Error('IndexedDB blocked'));
    };
  });
}

async function createVideoThumbnail(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    // Timeout: if thumbnail can't be generated in 3s, return empty blob
    const timeout = setTimeout(() => {
      console.warn('[SnapCraft Offscreen] Thumbnail generation timed out');
      resolve(new Blob());
    }, 3000);

    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.src = URL.createObjectURL(blob);

    video.onloadeddata = () => {
      console.log('[SnapCraft Offscreen] Video loaded for thumbnail');
      video.currentTime = 0.5;
    };

    video.onseeked = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = Math.round((200 / video.videoWidth) * video.videoHeight) || 150;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (thumbBlob) => {
            URL.revokeObjectURL(video.src);
            resolve(thumbBlob || new Blob());
          },
          'image/jpeg',
          0.7
        );
      } catch (e) {
        console.error('[SnapCraft Offscreen] Thumbnail draw error:', e);
        URL.revokeObjectURL(video.src);
        resolve(new Blob());
      }
    };

    video.onerror = (e) => {
      clearTimeout(timeout);
      console.error('[SnapCraft Offscreen] Video load error for thumbnail:', e);
      URL.revokeObjectURL(video.src);
      resolve(new Blob());
    };
  });
}
