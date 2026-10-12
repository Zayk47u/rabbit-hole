import { DEMO_DISCOVERIES } from '../src/data/demo/discoveries';
import { DEMO_CONNECTIONS } from '../src/data/demo/connections';
import {
  applyInteractionSignal,
  buildColdStartFeed,
  rankDiscoveries,
  scoreDiscovery,
} from '../src/recommendations';
import type { RankingContext, UserPreferences } from '../src/domain/types';

const neutral: UserPreferences = { interestWeights: {}, selectedInterestIds: [] };

function baseContext(overrides: Partial<RankingContext> = {}): RankingContext {
  return {
    preferences: neutral,
    seenDiscoveryIds: new Set(),
    recentInterestIds: [],
    ...overrides,
  };
}

describe('deterministic recommendation scoring', () => {
  it('is deterministic for the same inputs', () => {
    const discovery = DEMO_DISCOVERIES[0]!;
    const ctx = baseContext({
      preferences: {
        selectedInterestIds: ['hidden_history'],
        interestWeights: { hidden_history: 0.9, strange_science: 0.8 },
      },
    });
    const a = scoreDiscovery(discovery, ctx);
    const b = scoreDiscovery(discovery, ctx);
    expect(a.score).toBe(b.score);
    expect(a.factors).toEqual(b.factors);
  });

  it('suppresses already-seen discoveries from ranked results', () => {
    const seenId = DEMO_DISCOVERIES[0]!.id;
    const ranked = rankDiscoveries(
      DEMO_DISCOVERIES,
      baseContext({ seenDiscoveryIds: new Set([seenId]) }),
    );
    expect(ranked.every((r) => r.discovery.id !== seenId)).toBe(true);
  });

  it('boosts preferred curiosity clusters over disliked ones', () => {
    const internetHeavy = DEMO_DISCOVERIES.find((d) =>
      d.interests.some((t) => t.interestId === 'internet_mysteries' && t.weight >= 0.9),
    )!;
    const fashionHeavy = DEMO_DISCOVERIES.find((d) =>
      d.interests.some((t) => t.interestId === 'fashion_lore' && t.weight >= 0.9),
    )!;

    const preferNet = baseContext({
      preferences: {
        selectedInterestIds: ['internet_mysteries'],
        interestWeights: { internet_mysteries: 1, fashion_lore: 0.1 },
      },
    });
    expect(scoreDiscovery(internetHeavy, preferNet).score).toBeGreaterThan(
      scoreDiscovery(fashionHeavy, preferNet).score,
    );
  });

  it('builds a cold-start feed without duplicates', () => {
    const feed = buildColdStartFeed(DEMO_DISCOVERIES, baseContext(), 12);
    const ids = feed.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(feed.length).toBe(12);
  });

  it('ranks the same candidate list stably across calls', () => {
    const ctx = baseContext({
      preferences: {
        selectedInterestIds: ['cults_belief'],
        interestWeights: { cults_belief: 0.9, power_manipulation: 0.8 },
      },
    });
    const first = rankDiscoveries(DEMO_DISCOVERIES, ctx).map((r) => r.discovery.id);
    const second = rankDiscoveries(DEMO_DISCOVERIES, ctx).map((r) => r.discovery.id);
    expect(first).toEqual(second);
  });

  it('uses connection relevance when ranking branch targets', () => {
    const focus = 'd01';
    const outgoing = DEMO_CONNECTIONS.filter((c) => c.fromDiscoveryId === focus);
    const target = DEMO_DISCOVERIES.find((d) => d.id === outgoing[0]!.toDiscoveryId)!;
    const unrelated = DEMO_DISCOVERIES.find(
      (d) => !outgoing.some((c) => c.toDiscoveryId === d.id) && d.id !== focus,
    )!;

    const ctx = baseContext({
      focusDiscoveryId: focus,
      outgoingConnections: outgoing,
    });
    expect(scoreDiscovery(target, ctx).factors.connectionRelevance).toBeGreaterThan(
      scoreDiscovery(unrelated, ctx).factors.connectionRelevance,
    );
  });

  it('applies skip as a mild negative signal and save as a strong positive', () => {
    const discovery = DEMO_DISCOVERIES.find((d) =>
      d.interests.some((i) => i.interestId === 'internet_mysteries'),
    )!;
    const afterSkip = applyInteractionSignal(neutral, discovery, 'skip');
    const afterSave = applyInteractionSignal(neutral, discovery, 'save');
    const interest = discovery.interests[0]!.interestId;
    expect(afterSave.interestWeights[interest]!).toBeGreaterThan(
      afterSkip.interestWeights[interest]!,
    );
  });

  it('treats dive as a stronger positive than save', () => {
    const discovery = DEMO_DISCOVERIES[2]!;
    const interest = discovery.interests[0]!.interestId;
    const afterSave = applyInteractionSignal(neutral, discovery, 'save');
    const afterDive = applyInteractionSignal(neutral, discovery, 'dive');
    expect(afterDive.interestWeights[interest]!).toBeGreaterThan(
      afterSave.interestWeights[interest]!,
    );
  });
});
