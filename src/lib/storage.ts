/* ScreenKing — Storage Layer (IndexedDB via Dexie + Chrome Storage) */

import Dexie, { type EntityTable } from 'dexie';
import type { AppSettings, CaptureRecord } from './types';
import { DEFAULT_SETTINGS } from './types';

// ── IndexedDB for large binary data (screenshots, recordings) ──

class ScreenKingDB extends Dexie {
  captures!: EntityTable<CaptureRecord, 'id'>;

  constructor() {
    super('ScreenKingDB');
    this.version(1).stores({
      captures: '++id, type, mode, createdAt',
    });
  }
}

export const db = new ScreenKingDB();

/**
 * Save a capture record (screenshot or recording)
 */
export async function saveCapture(record: Omit<CaptureRecord, 'id'>): Promise<number> {
  return db.captures.add(record as CaptureRecord);
}

/**
 * Get all captures, optionally filtered and paginated
 */
export async function getCaptures(options?: {
  type?: 'screenshot' | 'recording';
  limit?: number;
  offset?: number;
}): Promise<CaptureRecord[]> {
  let query = db.captures.orderBy('createdAt').reverse();

  if (options?.type) {
    query = db.captures
      .where('type')
      .equals(options.type)
      .reverse();
  }

  if (options?.offset) {
    query = query.offset(options.offset);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query.toArray();
}

/**
 * Get a single capture by ID
 */
export async function getCapture(id: number): Promise<CaptureRecord | undefined> {
  return db.captures.get(id);
}

/**
 * Delete a capture by ID
 */
export async function deleteCapture(id: number): Promise<void> {
  await db.captures.delete(id);
}

/**
 * Delete multiple captures
 */
export async function deleteCaptures(ids: number[]): Promise<void> {
  await db.captures.bulkDelete(ids);
}

/**
 * Get total count
 */
export async function getCaptureCount(type?: 'screenshot' | 'recording'): Promise<number> {
  if (type) {
    return db.captures.where('type').equals(type).count();
  }
  return db.captures.count();
}

/**
 * Clean up old captures beyond maxItems
 */
export async function cleanupCaptures(maxItems: number): Promise<void> {
  const count = await db.captures.count();
  if (count > maxItems) {
    const toDelete = await db.captures
      .orderBy('createdAt')
      .limit(count - maxItems)
      .primaryKeys();
    await db.captures.bulkDelete(toDelete);
  }
}

// ── Chrome Storage for settings (synced, small data) ──

const SETTINGS_KEY = 'screenking_settings';

/**
 * Get app settings
 */
export async function getSettings(): Promise<AppSettings> {
  const result = await browser.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(result[SETTINGS_KEY] || {}) };
}

/**
 * Update app settings (partial)
 */
export async function updateSettings(
  partial: Partial<AppSettings>
): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await browser.storage.local.set({ [SETTINGS_KEY]: updated });
  return updated;
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<AppSettings> {
  await browser.storage.local.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
  return DEFAULT_SETTINGS;
}
