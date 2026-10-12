import { removeKey, readJson, writeJson } from '@/src/lib/storage';

const BOOKMARKS_KEY = 'rabbit-hole/bookmarks/v1';

export type BookmarkRecord = {
  discoveryId: string;
  savedAt: string;
};

export async function loadBookmarks(): Promise<BookmarkRecord[]> {
  const records = await readJson<BookmarkRecord[]>(BOOKMARKS_KEY);
  if (!Array.isArray(records)) return [];
  return records.filter(
    (r) => typeof r?.discoveryId === 'string' && typeof r?.savedAt === 'string',
  );
}

export async function saveBookmarks(records: BookmarkRecord[]): Promise<void> {
  const unique = new Map<string, BookmarkRecord>();
  for (const record of records) {
    unique.set(record.discoveryId, record);
  }
  await writeJson(BOOKMARKS_KEY, [...unique.values()]);
}

export function isBookmarked(records: readonly BookmarkRecord[], discoveryId: string): boolean {
  return records.some((r) => r.discoveryId === discoveryId);
}

export function toggleBookmark(
  records: readonly BookmarkRecord[],
  discoveryId: string,
  nowIso = new Date().toISOString(),
): BookmarkRecord[] {
  if (isBookmarked(records, discoveryId)) {
    return records.filter((r) => r.discoveryId !== discoveryId);
  }
  return [...records, { discoveryId, savedAt: nowIso }];
}

export async function clearBookmarks(): Promise<void> {
  await removeKey(BOOKMARKS_KEY);
}
