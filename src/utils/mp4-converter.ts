/* SnapCraft — WebM to MP4 Converter using WebCodecs + mp4-muxer */

import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

export interface ConversionProgress {
  phase: 'decoding' | 'encoding' | 'muxing' | 'done';
  progress: number; // 0-1
}

/**
 * Convert a WebM blob to MP4 using WebCodecs API + mp4-muxer.
 * 
 * Limitations:
 * - Best for recordings under 5 minutes
 * - Longer recordings may be slow or cause memory issues
 * - Requires Chrome 94+ (WebCodecs support)
 */
export async function convertWebMToMP4(
  webmBlob: Blob,
  onProgress?: (p: ConversionProgress) => void
): Promise<Blob> {
  // Check WebCodecs support
  if (typeof VideoDecoder === 'undefined' || typeof VideoEncoder === 'undefined') {
    throw new Error('WebCodecs API not supported in this browser');
  }

  onProgress?.({ phase: 'decoding', progress: 0 });

  // Step 1: Extract video frames from WebM using a <video> element + canvas
  const videoUrl = URL.createObjectURL(webmBlob);
  const video = document.createElement('video');
  video.muted = true;
  video.src = videoUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Failed to load video'));
  });

  const width = video.videoWidth;
  const height = video.videoHeight;
  const duration = video.duration;
  const fps = 30;
  const totalFrames = Math.ceil(duration * fps);

  // Step 2: Setup MP4 muxer
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width,
      height,
    },
    fastStart: 'in-memory',
  });

  // Step 3: Setup H.264 encoder
  const encodedChunks: { chunk: EncodedVideoChunk; meta?: EncodedVideoChunkMetadata }[] = [];

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (e) => {
      console.error('[SnapCraft] Encoder error:', e);
    },
  });

  encoder.configure({
    codec: 'avc1.640028', // H.264 High Profile Level 4.0
    width,
    height,
    bitrate: 5_000_000,
    framerate: fps,
  });

  // Step 4: Extract frames and encode
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < totalFrames; i++) {
    const targetTime = i / fps;

    // Seek to target time
    video.currentTime = targetTime;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    // Draw frame to canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Create VideoFrame from canvas
    const frame = new VideoFrame(canvas, {
      timestamp: targetTime * 1_000_000, // microseconds
    });

    // Encode frame (keyframe every 2 seconds)
    const isKeyframe = i % (fps * 2) === 0;
    encoder.encode(frame, { keyFrame: isKeyframe });
    frame.close();

    // Report progress
    onProgress?.({
      phase: 'encoding',
      progress: (i + 1) / totalFrames,
    });

    // Yield to prevent UI freeze
    if (i % 5 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  // Step 5: Flush and finalize
  onProgress?.({ phase: 'muxing', progress: 0.95 });
  await encoder.flush();
  encoder.close();
  muxer.finalize();

  // Cleanup
  URL.revokeObjectURL(videoUrl);

  // Get result
  const target = muxer.target as ArrayBufferTarget;
  const mp4Blob = new Blob([target.buffer], { type: 'video/mp4' });

  onProgress?.({ phase: 'done', progress: 1 });
  return mp4Blob;
}

/**
 * Check if a recording is suitable for MP4 conversion.
 * Returns a warning message if the video is too long, or null if ok.
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
