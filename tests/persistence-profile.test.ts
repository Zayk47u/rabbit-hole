import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEMO_DISCOVERIES } from '../src/data/demo/discoveries';
import type { UserPreferences } from '../src/domain/types';
import {
  NEUTRAL_PREFERENCES,
  loadPreferences,
  resetPreferences,
  savePreferences,
} from '../src/features/discover/preferenceStore';
import { applyInteractionSignal } from '../src/recommendations';

describe('profile persistence and reset', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('persists learned weights, branch prefs, and seen history', async () => {
    const discovery = DEMO_DISCOVERIES[2]!;
    const learned = applyInteractionSignal(
      { ...NEUTRAL_PREFERENCES },
      discovery,
      'save',
    );
    const withBranch = applyInteractionSignal(learned, discovery, 'branch', {
      branchType: 'zoom_out',
    });

    await savePreferences(withBranch);
    const loaded = await loadPreferences();

    expect(loaded.profileVersion).toBe(3);
    expect(loaded.interestWeights).toEqual(withBranch.interestWeights);
    expect(loaded.branchTypeWeights.zoom_out).toBe(withBranch.branchTypeWeights.zoom_out);
    expect(loaded.seenDiscoveryIds).toContain(discovery.id);
  });

  it('reset clears personalization back to neutral', async () => {
    const dirty: UserPreferences = {
      ...NEUTRAL_PREFERENCES,
      interestWeights: { internet_mysteries: 0.9 },
      branchTypeWeights: { unexpected_parallel: 0.8 },
      seenDiscoveryIds: ['d01', 'd02'],
      skipCountsByInterest: { internet_mysteries: 3 },
    };
    await savePreferences(dirty);
    await resetPreferences();
    const loaded = await loadPreferences();
    expect(loaded).toEqual(NEUTRAL_PREFERENCES);
  });
});
