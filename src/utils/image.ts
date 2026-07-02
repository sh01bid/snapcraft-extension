/* SnapCraft — Utility: Image Processing */

/**
 * Convert a data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

/**
 * Convert a Blob to a data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Create a thumbnail from a data URL
 */
export async function createThumbnail(
  dataUrl: string,
  maxSize: number = 200
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create thumbnail'));
        },
        'image/jpeg',
        0.7
      );
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Stitch multiple screenshots vertically
 */
export async function stitchImages(
  dataUrls: string[],
  lastImageCropHeight?: number
): Promise<string> {
  if (dataUrls.length === 0) throw new Error('No images to stitch');
  if (dataUrls.length === 1) return dataUrls[0];

  // Load all images
  const images = await Promise.all(
    dataUrls.map(
      (url) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        })
    )
  );

  // Calculate total dimensions
  const width = images[0].width;
  let totalHeight = 0;
  for (let i = 0; i < images.length; i++) {
    if (i === images.length - 1 && lastImageCropHeight !== undefined) {
      totalHeight += lastImageCropHeight;
    } else {
      totalHeight += images[i].height;
    }
  }

  // Draw onto canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d')!;

  let y = 0;
  for (let i = 0; i < images.length; i++) {
    const h =
      i === images.length - 1 && lastImageCropHeight !== undefined
        ? lastImageCropHeight
        : images[i].height;
    
    if (i === images.length - 1 && lastImageCropHeight !== undefined) {
      // Crop from the bottom of the last image
      const sy = images[i].height - lastImageCropHeight;
      ctx.drawImage(
        images[i],
        0, sy, width, lastImageCropHeight,
        0, y, width, lastImageCropHeight
      );
    } else {
      ctx.drawImage(images[i], 0, y);
    }
    y += h;
  }

  return canvas.toDataURL('image/png');
}

/**
 * Crop an image from a data URL
 */
export async function cropImage(
  dataUrl: string,
  bounds: { x: number; y: number; width: number; height: number },
  dpr: number = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = bounds.width * dpr;
      canvas.height = bounds.height * dpr;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        img,
        bounds.x * dpr,
        bounds.y * dpr,
        bounds.width * dpr,
        bounds.height * dpr,
        0,
        0,
        canvas.width,
        canvas.height
      );
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Convert image format
 */
export async function convertImageFormat(
  dataUrl: string,
  format: 'png' | 'jpeg' | 'webp',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Conversion failed'));
        },
        `image/${format}`,
        quality
      );
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
