/* SnapCraft — Utility: Download */

/**
 * Generate a filename based on pattern
 */
export function generateFilename(
  pattern: string,
  extension: string
): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS

  return (
    pattern
      .replace('{date}', date)
      .replace('{time}', time)
      .replace('{timestamp}', Date.now().toString()) +
    '.' +
    extension
  );
}

/**
 * Download a Blob as a file
 */
export async function downloadBlob(
  blob: Blob,
  filename: string
): Promise<void> {
  const url = URL.createObjectURL(blob);
  try {
    await browser.downloads.download({
      url,
      filename,
      saveAs: false,
    });
  } finally {
    // Delay revoke to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}

/**
 * Download a data URL as a file
 */
export async function downloadDataUrl(
  dataUrl: string,
  filename: string
): Promise<void> {
  await browser.downloads.download({
    url: dataUrl,
    filename,
    saveAs: false,
  });
}

/**
 * Copy image data URL to clipboard
 */
export async function copyImageToClipboard(dataUrl: string): Promise<void> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  // Convert to PNG for clipboard compatibility
  const pngBlob = blob.type === 'image/png' 
    ? blob 
    : await convertToPng(blob);
  
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': pngBlob }),
  ]);
}

async function convertToPng(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  return canvas.convertToBlob({ type: 'image/png' });
}
