import {
  isBookmarked,
  toggleBookmark,
  type BookmarkRecord,
} from '../src/features/saved/bookmarkStore';

describe('bookmark state', () => {
  it('toggles save and unsave without duplicates', () => {
    let records: BookmarkRecord[] = [];
    records = toggleBookmark(records, 'd01', '2026-10-11T00:00:00.000Z');
    expect(isBookmarked(records, 'd01')).toBe(true);
    expect(records).toHaveLength(1);

    records = toggleBookmark(records, 'd01', '2026-10-11T00:01:00.000Z');
    expect(isBookmarked(records, 'd01')).toBe(false);
    expect(records).toHaveLength(0);
  });

  it('can track multiple discoveries', () => {
    let records: BookmarkRecord[] = [];
    records = toggleBookmark(records, 'd01', '2026-10-11T00:00:00.000Z');
    records = toggleBookmark(records, 'd02', '2026-10-11T00:00:01.000Z');
    expect(records.map((r) => r.discoveryId).sort()).toEqual(['d01', 'd02']);
  });
});
