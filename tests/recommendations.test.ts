import { DEMO_DISCOVERIES } from '../src/data/demo/discoveries';
import { DEMO_CONNECTIONS } from '../src/data/demo/connections';
import {
  buildColdStartFeed,
  rankDiscoveries,
  scoreDiscovery,
} from '../src/recommendations';
import type { RankingContext, UserPreferences } from '../src/domain/types';

const neutral: UserPreferences = { topicWeights: {} };

function baseContext(overrides: Partial<RankingContext> = {}): RankingContext {
  return {
    preferences: neutral,
    seenDiscoveryIds: new Set(),
    recentTopicIds: [],
    ...overrides,
  };
}

describe('deterministic recommendation scoring', () => {
  it('is deterministic for the same inputs', () => {
    const discovery = DEMO_DISCOVERIES[0]!;
    const ctx = baseContext({
      preferences: { topicWeights: { biology: 0.9, mathematics: 0.8 } },
    });
    const a = scoreDiscovery(discovery, ctx);
    const b = scoreDiscovery(discovery, ctx);
    expect(a.score).toBe(b.score);
    expect(a.factors).toEqual(b.factors);
  });

  it('suppresses already-seen discoveries from ranked results', () => {
    const seenId = DEMO_DISCOVERIES[0]!.id;
    const ranked = rankDiscoveries(DEMO_DISCOVERIES, baseContext({
      seenDiscoveryIds: new Set([seenId]),
    }));
    expect(ranked.every((r) => r.discovery.id !== seenId)).toBe(true);
  });

  it('boosts preferred topics over disliked topics', () => {
    const biologyHeavy = DEMO_DISCOVERIES.find((d) =>
      d.topics.some((t) => t.topicId === 'biology' && t.weight >= 0.9),
    )!;
    const astronomyHeavy = DEMO_DISCOVERIES.find((d) =>
      d.topics.some((t) => t.topicId === 'astronomy' && t.weight >= 0.9),
    )!;

    const preferBio = baseContext({
      preferences: { topicWeights: { biology: 1, astronomy: 0.1 } },
    });
    const bioScore = scoreDiscovery(biologyHeavy, preferBio).score;
    const astroScore = scoreDiscovery(astronomyHeavy, preferBio).score;
    expect(bioScore).toBeGreaterThan(astroScore);
  });

  it('builds a cold-start feed without duplicates', () => {
    const feed = buildColdStartFeed(DEMO_DISCOVERIES, baseContext(), 12);
    const ids = feed.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(feed.length).toBe(12);
  });

  it('ranks the same candidate list stably across calls', () => {
    const ctx = baseContext({
      preferences: { topicWeights: { design: 0.9, psychology: 0.8 } },
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
});
