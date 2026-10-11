import type { TopicId, UserPreferences } from '@/src/domain/types';
import { removeKey, readJson, writeJson } from '@/src/lib/storage';

const PREFS_KEY = 'rabbit-hole/preferences/v1';

export const NEUTRAL_PREFERENCES: UserPreferences = {
  topicWeights: {},
};

export async function loadPreferences(): Promise<UserPreferences> {
  const prefs = await readJson<UserPreferences>(PREFS_KEY);
  if (!prefs || typeof prefs !== 'object' || !prefs.topicWeights) {
    return NEUTRAL_PREFERENCES;
  }
  return { topicWeights: { ...prefs.topicWeights } };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await writeJson(PREFS_KEY, prefs);
}

export async function resetPreferences(): Promise<void> {
  await removeKey(PREFS_KEY);
}

export function setTopicWeight(
  prefs: UserPreferences,
  topicId: TopicId,
  weight: number,
): UserPreferences {
  const clamped = Math.min(1, Math.max(0, weight));
  return {
    topicWeights: {
      ...prefs.topicWeights,
      [topicId]: clamped,
    },
  };
}
