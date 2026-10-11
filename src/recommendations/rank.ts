import type { Discovery, RankingContext, ScoredDiscovery } from '@/src/domain/types';

import { scoreDiscovery } from './score';

/** Stable string compare for deterministic tie-breaking. */
function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Rank candidates with deterministic scoring.
 * Already-seen items are excluded (repeat suppression) unless includeSeen is true.
 */
export function rankDiscoveries(
  candidates: readonly Discovery[],
  context: RankingContext,
  options: { includeSeen?: boolean; limit?: number } = {},
): ScoredDiscovery[] {
  const includeSeen = options.includeSeen ?? false;
  const filtered = includeSeen
    ? [...candidates]
    : candidates.filter((d) => !context.seenDiscoveryIds.has(d.id));

  const scored = filtered.map((d) => scoreDiscovery(d, context));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return compareId(a.discovery.id, b.discovery.id);
  });

  if (options.limit !== undefined) {
    return scored.slice(0, options.limit);
  }
  return scored;
}

/**
 * Cold-start feed: diversify by preferring underrepresented topics early,
 * while still using the deterministic scorer.
 */
export function buildColdStartFeed(
  candidates: readonly Discovery[],
  context: RankingContext,
  limit = 12,
): Discovery[] {
  const remaining = new Map(candidates.map((d) => [d.id, d]));
  const selected: Discovery[] = [];
  const localRecent: (typeof candidates)[number]['topics'][number]['topicId'][] = [
    ...context.recentTopicIds,
  ];
  const seen = new Set(context.seenDiscoveryIds);

  while (selected.length < limit && remaining.size > 0) {
    const ranked = rankDiscoveries([...remaining.values()], {
      ...context,
      seenDiscoveryIds: seen,
      recentTopicIds: localRecent,
    });

    const next = ranked[0];
    if (!next) break;

    selected.push(next.discovery);
    seen.add(next.discovery.id);
    remaining.delete(next.discovery.id);
    for (const topic of next.discovery.topics) {
      localRecent.push(topic.topicId);
    }
  }

  return selected;
}

export function rankBranchTargets(
  targets: readonly Discovery[],
  context: RankingContext,
  limit = 4,
): ScoredDiscovery[] {
  return rankDiscoveries(targets, context, { includeSeen: true, limit });
}
