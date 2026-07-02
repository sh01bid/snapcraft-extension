/* SnapCraft — Offscreen Document: Recording Engine */

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let mediaStream: MediaStream | null = null;
let startTimestamp = 0;

// Only handle messages targeted at offscreen
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Only process messages meant for offscreen
  if (message.target && message.target !== 'offscreen') return;

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
    const duration = Date.now() - startTimestamp;
    const blob = new Blob(recordedChunks, { type: mimeType });
    recordedChunks = [];

    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }

    // Store first, then notify (so preview can find it)
    const captureId = await storeRecordingBlob(blob, duration, mimeType);

    chrome.runtime.sendMessage({
      type: 'RECORDING_COMPLETE',
      payload: { duration, mimeType, size: blob.size, captureId },
    });
  };

  mediaRecorder.onerror = (event: any) => {
    console.error('[SnapCraft Offscreen] MediaRecorder error:', event.error);
  };

  mediaRecorder.start(1000);

  chrome.runtime.sendMessage({
    type: 'RECORDING_STATUS',
    payload: { status: 'recording' },
  });
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

async function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  return { success: true };
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

async function createVideoThumbnail(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.src = URL.createObjectURL(blob);

    video.onloadeddata = () => {
      video.currentTime = 0.5;
    };

    video.onseeked = () => {
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
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(new Blob());
    };
  });
}
