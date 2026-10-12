import { DEMO_DISCOVERIES } from '../src/data/demo/discoveries';
import { applyInteractionSignal, toggleSelectedInterest } from '../src/recommendations';
import { NEUTRAL_PREFERENCES } from '../src/features/discover/preferenceStore';

describe('interaction signals', () => {
  it('seeds selected interests and can toggle them off', () => {
    const seeded = toggleSelectedInterest(NEUTRAL_PREFERENCES, 'internet_mysteries');
    expect(seeded.selectedInterestIds).toContain('internet_mysteries');
    expect(seeded.interestWeights.internet_mysteries).toBeGreaterThan(0.7);

    const cleared = toggleSelectedInterest(seeded, 'internet_mysteries');
    expect(cleared.selectedInterestIds).not.toContain('internet_mysteries');
  });

  it('branch signal strengthens destination interests', () => {
    const discovery = DEMO_DISCOVERIES.find((d) => d.id === 'd03')!;
    const after = applyInteractionSignal(NEUTRAL_PREFERENCES, discovery, 'branch');
    const top = discovery.interests[0]!.interestId;
    expect(after.interestWeights[top]!).toBeGreaterThan(0.5);
  });
});
