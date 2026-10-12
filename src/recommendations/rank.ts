import type {
  Discovery,
  DiscoveryConnection,
  ExplorationBucket,
  RankingContext,
  ScoredDiscovery,
} from '@/src/domain/types';

import { EXPLORATION_MIX } from './config';
import { scoreDiscovery } from './score';

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Deterministic 70/20/10-ish bucket assignment by pick index. */
export function bucketForPickIndex(index: number): ExplorationBucket {
  const slot = ((index % EXPLORATION_MIX.windowSize) + EXPLORATION_MIX.windowSize) %
    EXPLORATION_MIX.windowSize;
  if ((EXPLORATION_MIX.wildcardSlots as readonly number[]).includes(slot)) {
    return 'wildcard';
  }
  if ((EXPLORATION_MIX.adjacentSlots as readonly number[]).includes(slot)) {
    return 'adjacent';
  }
  return 'exploit';
}

export function rankDiscoveries(
  candidates: readonly Discovery[],
  context: RankingContext,
  options: {
    includeSeen?: boolean;
    limit?: number;
    bucket?: ExplorationBucket;
    incomingByDiscoveryId?: ReadonlyMap<string, readonly DiscoveryConnection[]>;
  } = {},
): ScoredDiscovery[] {
  const includeSeen = options.includeSeen ?? false;
  const bucket = options.bucket ?? context.bucket ?? 'exploit';
  const filtered = includeSeen
    ? [...candidates]
    : candidates.filter((d) => !context.seenDiscoveryIds.has(d.id));

  const scored = filtered.map((d) =>
    scoreDiscovery(
      d,
      { ...context, bucket },
      {
        bucket,
        incomingConnections: options.incomingByDiscoveryId?.get(d.id),
      },
    ),
  );
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
 * Build an adaptive Discover queue with exploration/exploitation mix.
 * Re-scores after each pick so session signals can reshape the remainder.
 */
export function buildAdaptiveFeed(
  candidates: readonly Discovery[],
  context: RankingContext,
  limit = 40,
  incomingByDiscoveryId?: ReadonlyMap<string, readonly DiscoveryConnection[]>,
): ScoredDiscovery[] {
  const remaining = new Map(candidates.map((d) => [d.id, d]));
  const selected: ScoredDiscovery[] = [];
  const localRecent = [...context.recentInterestIds];
  const seen = new Set(context.seenDiscoveryIds);

  while (selected.length < limit && remaining.size > 0) {
    const bucket = bucketForPickIndex(selected.length);
    const ranked = rankDiscoveries(
      [...remaining.values()],
      {
        ...context,
        seenDiscoveryIds: seen,
        recentInterestIds: localRecent,
        bucket,
      },
      { bucket, incomingByDiscoveryId },
    );

    const next = ranked[0];
    if (!next) break;

    selected.push(next);
    seen.add(next.discovery.id);
    remaining.delete(next.discovery.id);
    for (const interest of next.discovery.interests) {
      localRecent.push(interest.interestId);
    }
  }

  return selected;
}

/** @deprecated Prefer buildAdaptiveFeed — kept for older call sites/tests. */
export function buildColdStartFeed(
  candidates: readonly Discovery[],
  context: RankingContext,
  limit = 20,
): Discovery[] {
  return buildAdaptiveFeed(candidates, context, limit).map((s) => s.discovery);
}

export function rankBranchTargets(
  targets: readonly Discovery[],
  context: RankingContext,
  limit = 4,
): ScoredDiscovery[] {
  return rankDiscoveries(targets, context, { includeSeen: true, limit, bucket: 'exploit' });
}

/** Pick the next unseen card for the live adaptive deck. */
export function pickNextDiscovery(
  candidates: readonly Discovery[],
  context: RankingContext,
  pickIndex = 0,
  incomingByDiscoveryId?: ReadonlyMap<string, readonly DiscoveryConnection[]>,
): ScoredDiscovery | undefined {
  const bucket = bucketForPickIndex(pickIndex);
  return rankDiscoveries(candidates, { ...context, bucket }, {
    limit: 1,
    bucket,
    incomingByDiscoveryId,
  })[0];
}

/** Fraction of picks in a built feed that landed in each bucket (for tests/debug). */
export function summarizeBuckets(scored: readonly ScoredDiscovery[]): Record<ExplorationBucket, number> {
  const counts: Record<ExplorationBucket, number> = {
    exploit: 0,
    adjacent: 0,
    wildcard: 0,
  };
  for (const s of scored) {
    counts[s.bucket] += 1;
  }
  return counts;
}
