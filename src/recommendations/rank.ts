import type { Discovery, RankingContext, ScoredDiscovery } from '@/src/domain/types';

import { scoreDiscovery } from './score';

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

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
 * Build a one-at-a-time queue with cold-start diversity and exploration.
 * Intentionally mixes preferred clusters with adjacent surprises.
 */
export function buildColdStartFeed(
  candidates: readonly Discovery[],
  context: RankingContext,
  limit = 20,
): Discovery[] {
  const remaining = new Map(candidates.map((d) => [d.id, d]));
  const selected: Discovery[] = [];
  const localRecent = [...context.recentInterestIds];
  const seen = new Set(context.seenDiscoveryIds);

  while (selected.length < limit && remaining.size > 0) {
    // Every 4th pick, nudge exploration so the queue isn't an echo chamber.
    const explorationBoost = selected.length > 0 && selected.length % 4 === 3 ? 0.14 : 0.06;
    const ranked = rankDiscoveries([...remaining.values()], {
      ...context,
      seenDiscoveryIds: seen,
      recentInterestIds: localRecent,
      explorationBoost,
    });

    const next = ranked[0];
    if (!next) break;

    selected.push(next.discovery);
    seen.add(next.discovery.id);
    remaining.delete(next.discovery.id);
    for (const interest of next.discovery.interests) {
      localRecent.push(interest.interestId);
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

/** Pick the next unseen card given current preferences/session. */
export function pickNextDiscovery(
  candidates: readonly Discovery[],
  context: RankingContext,
): Discovery | undefined {
  return rankDiscoveries(candidates, context, { limit: 1 })[0]?.discovery;
}
