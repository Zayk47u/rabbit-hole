import type { BranchType, InterestId, UserPreferences } from '@/src/domain/types';
import { removeKey, readJson, writeJson } from '@/src/lib/storage';

const PREFS_KEY_V2 = 'rabbit-hole/preferences/v2';
const PREFS_KEY = 'rabbit-hole/preferences/v3';

export const NEUTRAL_PREFERENCES: UserPreferences = {
  interestWeights: {},
  selectedInterestIds: [],
  branchTypeWeights: {},
  skipCountsByInterest: {},
  engageCountsByInterest: {},
  seenDiscoveryIds: [],
  quickAbandonByDiscovery: {},
  profileVersion: 3,
};

function normalize(raw: Partial<UserPreferences> | null): UserPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...NEUTRAL_PREFERENCES };
  }
  return {
    interestWeights: { ...(raw.interestWeights ?? {}) },
    selectedInterestIds: Array.isArray(raw.selectedInterestIds)
      ? (raw.selectedInterestIds.filter(Boolean) as InterestId[])
      : [],
    branchTypeWeights: { ...(raw.branchTypeWeights ?? {}) } as Partial<
      Record<BranchType, number>
    >,
    skipCountsByInterest: { ...(raw.skipCountsByInterest ?? {}) },
    engageCountsByInterest: { ...(raw.engageCountsByInterest ?? {}) },
    seenDiscoveryIds: Array.isArray(raw.seenDiscoveryIds)
      ? raw.seenDiscoveryIds.filter((id): id is string => typeof id === 'string')
      : [],
    quickAbandonByDiscovery: { ...(raw.quickAbandonByDiscovery ?? {}) },
    profileVersion: 3,
  };
}

export async function loadPreferences(): Promise<UserPreferences> {
  const v3 = await readJson<Partial<UserPreferences>>(PREFS_KEY);
  if (v3 && typeof v3 === 'object') {
    return normalize(v3);
  }

  // Migrate v2 cold-start prefs if present.
  const v2 = await readJson<{
    interestWeights?: Partial<Record<InterestId, number>>;
    selectedInterestIds?: InterestId[];
  }>(PREFS_KEY_V2);
  if (v2 && typeof v2 === 'object') {
    const migrated = normalize({
      interestWeights: v2.interestWeights,
      selectedInterestIds: v2.selectedInterestIds,
    });
    await savePreferences(migrated);
    return migrated;
  }

  return { ...NEUTRAL_PREFERENCES };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await writeJson(PREFS_KEY, { ...prefs, profileVersion: 3 });
}

/** Clears learned profile + seen history (bookmarks stay untouched). */
export async function resetPreferences(): Promise<void> {
  await removeKey(PREFS_KEY);
  await removeKey(PREFS_KEY_V2);
}
