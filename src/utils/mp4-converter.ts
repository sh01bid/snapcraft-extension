/* SnapCraft — WebM to MP4 Converter using WebCodecs + mp4-muxer */

import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

export interface ConversionProgress {
  phase: 'preparing' | 'encoding' | 'finalizing' | 'done';
  progress: number; // 0-1
}

/**
 * Select the right H.264 codec string based on resolution.
 * AVC levels have maximum macroblocks-per-second and coded area limits.
 */
function getAVCCodec(width: number, height: number): string {
  const area = width * height;
  // Level 5.2 - up to 36864 macroblocks (e.g. 4096x2304)
  if (area > 2097152) return 'avc1.640034';
  // Level 5.1 - up to 36864 macroblocks (e.g. 4096x2160)
  if (area > 983040) return 'avc1.640033';
  // Level 4.1 - up to 8192 macroblocks (e.g. 2048x1024)
  if (area > 522240) return 'avc1.640029';
  // Level 4.0 - (e.g. 1920x1080)
  if (area > 245760) return 'avc1.640028';
  // Level 3.1 - (e.g. 1280x720)
  return 'avc1.64001f';
}

/**
 * Calculate output dimensions. Scale down if too large for reliable encoding.
 * Max 1920 wide to keep conversion fast and reliable.
 */
function getOutputDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth = 1920
): { width: number; height: number; scaled: boolean } {
  if (srcWidth <= maxWidth) {
    // Ensure even dimensions (required by H.264)
    return {
      width: srcWidth & ~1,
      height: srcHeight & ~1,
      scaled: false,
    };
  }
  const scale = maxWidth / srcWidth;
  return {
    width: maxWidth & ~1,
    height: (Math.round(srcHeight * scale)) & ~1,
    scaled: true,
  };
}

/**
 * Convert a WebM blob to MP4 using WebCodecs API + mp4-muxer.
 */
export async function convertWebMToMP4(
  webmBlob: Blob,
  onProgress?: (p: ConversionProgress) => void,
  knownDurationMs?: number
): Promise<Blob> {
  if (typeof VideoEncoder === 'undefined') {
    throw new Error('WebCodecs API is not supported');
  }

  onProgress?.({ phase: 'preparing', progress: 0 });

  // Create video element to read the WebM
  const videoUrl = URL.createObjectURL(webmBlob);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.src = videoUrl;

  // Wait for metadata
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Failed to load WebM video'));
    setTimeout(() => reject(new Error('Video load timeout')), 10000);
  });

  const srcWidth = video.videoWidth;
  const srcHeight = video.videoHeight;
  let duration = video.duration;

  // WebM from MediaRecorder often has Infinity duration
  // Use the known duration from IndexedDB, or probe it
  if (!isFinite(duration) && knownDurationMs && knownDurationMs > 0) {
    duration = knownDurationMs / 1000;
    console.log(`[SnapCraft] Using known duration: ${duration}s`);
  }

  if (!isFinite(duration)) {
    // Probe duration by seeking to a very large time
    // The browser will clamp to the actual end
    video.currentTime = 1e10;
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
      setTimeout(() => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      }, 3000);
    });
    duration = video.currentTime;
    console.log(`[SnapCraft] Probed duration: ${duration}s`);
    // Reset to beginning
    video.currentTime = 0;
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
      setTimeout(() => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      }, 1000);
    });
  }

  if (!srcWidth || !srcHeight || !isFinite(duration) || duration <= 0) {
    URL.revokeObjectURL(videoUrl);
    throw new Error(`Invalid video: ${srcWidth}x${srcHeight}, duration: ${duration}`);
  }

  // Calculate output dimensions (scale down 4K to 1080p)
  const out = getOutputDimensions(srcWidth, srcHeight);
  const codec = getAVCCodec(out.width, out.height);

  console.log(`[SnapCraft] MP4 conversion: ${srcWidth}x${srcHeight} → ${out.width}x${out.height}, codec=${codec}${out.scaled ? ' (scaled)' : ''}`);

  // Check if this codec/resolution is supported
  const support = await VideoEncoder.isConfigSupported({
    codec,
    width: out.width,
    height: out.height,
    bitrate: 5_000_000,
  });

  if (!support.supported) {
    URL.revokeObjectURL(videoUrl);
    throw new Error(`H.264 encoding not supported for ${out.width}x${out.height}`);
  }

  // Setup MP4 muxer
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width: out.width,
      height: out.height,
    },
    fastStart: 'in-memory',
  });

  // Setup H.264 encoder
  let encodeError: Error | null = null;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (e) => {
      console.error('[SnapCraft] Encoder error:', e);
      encodeError = new Error(e.message);
    },
  });

  encoder.configure({
    codec,
    width: out.width,
    height: out.height,
    bitrate: 5_000_000,
    framerate: 30,
  });

  onProgress?.({ phase: 'encoding', progress: 0 });

  // Canvas for frame extraction (at output dimensions)
  const canvas = document.createElement('canvas');
  canvas.width = out.width;
  canvas.height = out.height;
  const ctx = canvas.getContext('2d')!;

  const fps = 30;
  const totalFrames = Math.ceil(duration * fps);

  // Process frames sequentially
  for (let i = 0; i < totalFrames; i++) {
    if (encodeError) {
      encoder.close();
      URL.revokeObjectURL(videoUrl);
      throw encodeError;
    }

    const targetTime = i / fps;
    if (targetTime > duration) break;

    // Seek to target time
    video.currentTime = targetTime;
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
      setTimeout(() => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      }, 500);
    });

    // Draw frame to canvas (this also handles scaling)
    ctx.drawImage(video, 0, 0, out.width, out.height);

    // Create VideoFrame
    const frame = new VideoFrame(canvas, {
      timestamp: Math.round(targetTime * 1_000_000),
    });

    // Encode (keyframe every 2 seconds)
    const isKeyframe = i % (fps * 2) === 0;
    encoder.encode(frame, { keyFrame: isKeyframe });
    frame.close();

    // Report progress
    onProgress?.({
      phase: 'encoding',
      progress: (i + 1) / totalFrames,
    });

    // Yield to UI thread every 3 frames
    if (i % 3 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // Finalize
  onProgress?.({ phase: 'finalizing', progress: 0.95 });

  await encoder.flush();
  encoder.close();
  muxer.finalize();

  URL.revokeObjectURL(videoUrl);

  const target = muxer.target as ArrayBufferTarget;
  const mp4Blob = new Blob([target.buffer], { type: 'video/mp4' });

  if (mp4Blob.size < 100) {
    throw new Error('MP4 output is too small — conversion may have failed');
  }

  onProgress?.({ phase: 'done', progress: 1 });
  console.log(`[SnapCraft] MP4 conversion done: ${(mp4Blob.size / 1048576).toFixed(1)} MB`);
  return mp4Blob;
}

/**
 * Check if a recording is suitable for MP4 conversion.
 */
export function getConversionWarning(durationMs: number): string | null {
  const minutes = durationMs / 60_000;
  if (minutes > 15) {
    return 'This recording is over 15 minutes. MP4 conversion may fail due to memory limits. Consider downloading as WebM instead.';
  }
  if (minutes > 5) {
    return 'This recording is over 5 minutes. MP4 conversion may take a while.';
  }
  return null;
}
