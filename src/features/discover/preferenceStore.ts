import type { InterestId, UserPreferences } from '@/src/domain/types';
import { removeKey, readJson, writeJson } from '@/src/lib/storage';

const PREFS_KEY = 'rabbit-hole/preferences/v2';

export const NEUTRAL_PREFERENCES: UserPreferences = {
  interestWeights: {},
  selectedInterestIds: [],
};

export async function loadPreferences(): Promise<UserPreferences> {
  const prefs = await readJson<UserPreferences>(PREFS_KEY);
  if (!prefs || typeof prefs !== 'object') {
    return NEUTRAL_PREFERENCES;
  }
  return {
    interestWeights: { ...(prefs.interestWeights ?? {}) },
    selectedInterestIds: Array.isArray(prefs.selectedInterestIds)
      ? (prefs.selectedInterestIds.filter(Boolean) as InterestId[])
      : [],
  };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await writeJson(PREFS_KEY, prefs);
}

export async function resetPreferences(): Promise<void> {
  await removeKey(PREFS_KEY);
}
