/* SnapCraft — Offscreen Document: Recording Engine */

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let mediaStream: MediaStream | null = null;
let startTimestamp = 0;

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

    case 'FINALIZE_RECORDING':
      finalizeRecording().then(sendResponse);
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

    // When user clicks Chrome's native "Stop sharing" button,
    // notify background instead of processing locally.
    // Background will send FINALIZE_RECORDING back, keeping the
    // message port open so the offscreen stays alive during storage.
    mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      chrome.runtime.sendMessage({ type: 'TRACK_ENDED' });
    });

    startRecording(mediaStream);
    return { success: true };
  } catch (error: any) {
    console.error('[SnapCraft Offscreen] Screen recording error:', error);
    return { success: false, error: error.message };
  }
}

let stopResolve: ((result: any) => void) | null = null;
let pendingBlob: Blob | null = null;
let pendingMeta: { duration: number; mimeType: string; size: number } | null = null;

// Called when stopResolve exists (our stop button) — runs inside stopRecording's Promise
async function doFinalizeAndResolve() {
  if (!pendingBlob || !pendingMeta) {
    if (stopResolve) {
      stopResolve({ success: false });
      stopResolve = null;
    }
    return;
  }

  try {
    const captureId = await storeRecordingBlob(pendingBlob, pendingMeta.duration, pendingMeta.mimeType);
    const result = { success: true, captureId, ...pendingMeta };
    chrome.runtime.sendMessage({ type: 'RECORDING_COMPLETE', payload: result });
    if (stopResolve) {
      stopResolve(result);
      stopResolve = null;
    }
  } catch (e) {
    console.error('[SnapCraft Offscreen] Storage failed:', e);
    if (stopResolve) {
      stopResolve({ success: false });
      stopResolve = null;
    }
  } finally {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    pendingBlob = null;
    pendingMeta = null;
  }
}

// Called by background via FINALIZE_RECORDING message (keeps offscreen alive via port)
async function finalizeRecording(): Promise<{ success: boolean; captureId?: number }> {
  if (!pendingBlob || !pendingMeta) {
    return { success: false };
  }

  try {
    const captureId = await storeRecordingBlob(pendingBlob, pendingMeta.duration, pendingMeta.mimeType);
    return { success: true, captureId };
  } catch (e) {
    console.error('[SnapCraft Offscreen] Finalize storage failed:', e);
    return { success: false };
  } finally {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    pendingBlob = null;
    pendingMeta = null;
  }
}

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

  mediaRecorder.onstop = () => {
    // Build blob from recorded chunks immediately (synchronous)
    const duration = Date.now() - startTimestamp;
    const recMimeType = mediaRecorder?.mimeType || mimeType;
    pendingBlob = new Blob(recordedChunks, { type: recMimeType });
    pendingMeta = { duration, mimeType: recMimeType, size: pendingBlob.size };
    recordedChunks = [];

    // If stopResolve exists (user clicked our stop button via background),
    // finalize storage inline and resolve
    if (stopResolve) {
      doFinalizeAndResolve();
    }
    // Otherwise (track ended / native stop), background will send
    // FINALIZE_RECORDING to trigger storage with message port alive
  };

  mediaRecorder.onerror = (event: any) => {
    console.error('[SnapCraft Offscreen] MediaRecorder error:', event.error);
  };

  mediaRecorder.start(1000);
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
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    return { success: false };
  }

  return new Promise((resolve) => {
    stopResolve = resolve;
    mediaRecorder!.stop();
  });
}

async function storeRecordingBlob(blob: Blob, duration: number, mimeType: string): Promise<number> {
  const thumbnail = await createVideoThumbnail(blob);

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
      addRequest.onsuccess = () => resolve(addRequest.result as number);
      addRequest.onerror = () => reject(addRequest.error);
    };

    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

function createVideoThumbnail(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(new Blob()), 3000);

    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.src = URL.createObjectURL(blob);

    video.onloadeddata = () => {
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
      } catch {
        URL.revokeObjectURL(video.src);
        resolve(new Blob());
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(video.src);
      resolve(new Blob());
    };
  });
}
