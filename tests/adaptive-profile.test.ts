import { DEMO_DISCOVERIES } from '../src/data/demo/discoveries';
import { DEMO_CONNECTIONS } from '../src/data/demo/connections';
import type { UserPreferences } from '../src/domain/types';
import { NEUTRAL_PREFERENCES } from '../src/features/discover/preferenceStore';
import {
  INTERACTION_WEIGHTS,
  applyInteractionSignal,
  bucketForPickIndex,
  buildAdaptiveFeed,
  pickNextDiscovery,
  rankDiscoveries,
  scoreDiscovery,
  summarizeBuckets,
  toggleSelectedInterest,
} from '../src/recommendations';

const neutral: UserPreferences = { ...NEUTRAL_PREFERENCES };

function discoveryWithInterest(interestId: string) {
  return DEMO_DISCOVERIES.find((d) =>
    d.interests.some((i) => i.interestId === interestId && i.weight >= 0.9),
  )!;
}

describe('adaptive preference profile', () => {
  it('updates after skip, save, dive, and branch', () => {
    const discovery = discoveryWithInterest('internet_mysteries');
    const top = discovery.interests[0]!.interestId;

    const afterSkip = applyInteractionSignal(neutral, discovery, 'skip');
    expect(afterSkip.interestWeights[top]!).toBeLessThan(0.5);
    expect(afterSkip.skipCountsByInterest[top]).toBe(1);
    expect(afterSkip.seenDiscoveryIds).toContain(discovery.id);

    const afterSave = applyInteractionSignal(neutral, discovery, 'save');
    expect(afterSave.interestWeights[top]!).toBeGreaterThan(0.5);
    expect(afterSave.engageCountsByInterest[top]).toBe(1);

    const afterDive = applyInteractionSignal(neutral, discovery, 'dive');
    expect(afterDive.interestWeights[top]!).toBeGreaterThan(
      afterSave.interestWeights[top]!,
    );

    const connection = DEMO_CONNECTIONS.find((c) => c.toDiscoveryId === discovery.id);
    const source = connection
      ? DEMO_DISCOVERIES.find((d) => d.id === connection.fromDiscoveryId)
      : DEMO_DISCOVERIES[0];
    const afterBranch = applyInteractionSignal(neutral, discovery, 'branch', {
      branchType: 'unexpected_parallel',
      sourceDiscovery: source,
    });
    expect(afterBranch.branchTypeWeights.unexpected_parallel!).toBeGreaterThan(0.5);
    expect(afterBranch.interestWeights[top]!).toBeGreaterThan(0.5);
  });

  it('escalates negative weight after repeated skips on the same cluster', () => {
    const discovery = discoveryWithInterest('fashion_lore');
    const top = discovery.interests[0]!.interestId;

    let prefs = neutral;
    for (let i = 0; i < 4; i += 1) {
      prefs = applyInteractionSignal(prefs, discovery, 'skip');
    }

    const single = applyInteractionSignal(neutral, discovery, 'skip');
    expect(prefs.interestWeights[top]!).toBeLessThan(single.interestWeights[top]!);
    expect((prefs.skipCountsByInterest[top] ?? 0)).toBeGreaterThanOrEqual(4);
  });

  it('treats save as stronger positive than skip and dive stronger than save', () => {
    const discovery = DEMO_DISCOVERIES[2]!;
    const interest = discovery.interests[0]!.interestId;
    const afterSkip = applyInteractionSignal(neutral, discovery, 'skip');
    const afterSave = applyInteractionSignal(neutral, discovery, 'save');
    const afterDive = applyInteractionSignal(neutral, discovery, 'dive');
    expect(afterSave.interestWeights[interest]!).toBeGreaterThan(
      afterSkip.interestWeights[interest]!,
    );
    expect(afterDive.interestWeights[interest]!).toBeGreaterThan(
      afterSave.interestWeights[interest]!,
    );
    expect(INTERACTION_WEIGHTS.dive.interestDelta).toBeGreaterThan(
      INTERACTION_WEIGHTS.save.interestDelta,
    );
  });

  it('branch selection strengthens connection-style preference', () => {
    const target = DEMO_DISCOVERIES[0]!;
    const source = DEMO_DISCOVERIES[1]!;
    const once = applyInteractionSignal(neutral, target, 'branch', {
      branchType: 'side_quest',
      sourceDiscovery: source,
    });
    const twice = applyInteractionSignal(once, target, 'branch', {
      branchType: 'side_quest',
      sourceDiscovery: source,
    });
    expect(twice.branchTypeWeights.side_quest!).toBeGreaterThan(
      once.branchTypeWeights.side_quest!,
    );
  });

  it('applies quick-abandon as a stronger negative than a slow skip', () => {
    const discovery = discoveryWithInterest('music_subcultures');
    const top = discovery.interests[0]!.interestId;
    const slow = applyInteractionSignal(neutral, discovery, 'skip', { dwellMs: 5000 });
    const quick = applyInteractionSignal(neutral, discovery, 'skip', { dwellMs: 400 });
    expect(quick.interestWeights[top]!).toBeLessThan(slow.interestWeights[top]!);
    expect(quick.quickAbandonByDiscovery[discovery.id]).toBe(1);
  });

  it('keeps explicit interest chips as cold-start seeds only', () => {
    const seeded = toggleSelectedInterest(neutral, 'cults_belief');
    expect(seeded.selectedInterestIds).toContain('cults_belief');
    expect(seeded.interestWeights.cults_belief!).toBeGreaterThan(0.7);

    const learned = applyInteractionSignal(seeded, discoveryWithInterest('cults_belief'), 'dive');
    expect(learned.selectedInterestIds).toContain('cults_belief');
    expect(learned.interestWeights.cults_belief!).toBeGreaterThan(
      seeded.interestWeights.cults_belief!,
    );
  });
});

describe('seen suppression and exploration mix', () => {
  it('suppresses already-seen discoveries', () => {
    const seenId = DEMO_DISCOVERIES[0]!.id;
    const ranked = rankDiscoveries(DEMO_DISCOVERIES, {
      preferences: neutral,
      seenDiscoveryIds: new Set([seenId]),
      recentInterestIds: [],
    });
    expect(ranked.every((r) => r.discovery.id !== seenId)).toBe(true);
  });

  it('still surfaces exploration buckets in an adaptive feed', () => {
    const feed = buildAdaptiveFeed(
      DEMO_DISCOVERIES,
      {
        preferences: {
          ...neutral,
          selectedInterestIds: ['internet_mysteries'],
          interestWeights: { internet_mysteries: 0.92, fashion_lore: 0.2 },
        },
        seenDiscoveryIds: new Set(),
        recentInterestIds: [],
      },
      20,
    );
    const buckets = summarizeBuckets(feed);
    expect(buckets.exploit).toBeGreaterThan(0);
    expect(buckets.adjacent + buckets.wildcard).toBeGreaterThan(0);
    expect(feed.length).toBe(20);
    expect(new Set(feed.map((s) => s.discovery.id)).size).toBe(20);
  });

  it('assigns buckets deterministically by pick index', () => {
    expect(bucketForPickIndex(0)).toBe('exploit');
    expect(bucketForPickIndex(3)).toBe('adjacent');
    expect(bucketForPickIndex(6)).toBe('wildcard');
    expect(bucketForPickIndex(10)).toBe(bucketForPickIndex(0));
  });

  it('reacts within a session: saves shift the next pick toward that cluster', () => {
    const music = discoveryWithInterest('music_subcultures');
    let prefs = applyInteractionSignal(neutral, music, 'save');
    prefs = applyInteractionSignal(prefs, music, 'dive');

    const fashion = discoveryWithInterest('fashion_lore');
    // Also engage fashion via branch style so connection learning is exercised.
    prefs = applyInteractionSignal(prefs, fashion, 'branch', {
      branchType: 'unexpected_parallel',
      sourceDiscovery: music,
    });

    const next = pickNextDiscovery(
      DEMO_DISCOVERIES.filter((d) => d.id !== music.id && d.id !== fashion.id),
      {
        preferences: prefs,
        seenDiscoveryIds: new Set([music.id, fashion.id]),
        recentInterestIds: music.interests.map((i) => i.interestId),
      },
      0,
    );
    expect(next).toBeDefined();
    const affinityMusic = next!.discovery.interests.some(
      (i) =>
        i.interestId === 'music_subcultures' ||
        i.interestId === 'fashion_lore' ||
        i.interestId === 'subcultures' ||
        i.interestId === 'design_aesthetics',
    );
    // After strong music/fashion engagement, exploit picks should lean related.
    if (next!.bucket === 'exploit') {
      expect(affinityMusic).toBe(true);
    }
  });

  it('is deterministic when seeded identically', () => {
    const ctx = {
      preferences: {
        ...neutral,
        selectedInterestIds: ['hidden_history' as const],
        interestWeights: { hidden_history: 0.9, strange_science: 0.8 },
      },
      seenDiscoveryIds: new Set<string>(),
      recentInterestIds: [] as const,
    };
    const a = buildAdaptiveFeed(DEMO_DISCOVERIES, ctx, 12).map((s) => s.discovery.id);
    const b = buildAdaptiveFeed(DEMO_DISCOVERIES, ctx, 12).map((s) => s.discovery.id);
    expect(a).toEqual(b);

    const d = DEMO_DISCOVERIES[0]!;
    expect(scoreDiscovery(d, ctx).score).toBe(scoreDiscovery(d, ctx).score);
  });
});

describe('demo corpus size', () => {
  it('includes at least 60 discoveries with overlapping interests and branches', () => {
    expect(DEMO_DISCOVERIES.length).toBeGreaterThanOrEqual(60);
    expect(DEMO_CONNECTIONS.length).toBeGreaterThanOrEqual(120);
    for (const d of DEMO_DISCOVERIES) {
      expect(d.isDemo).toBe(true);
      expect(d.interests.length).toBeGreaterThanOrEqual(2);
      expect(d.sources.every((s) => s.note.includes('DEMO'))).toBe(true);
    }
  });
});
