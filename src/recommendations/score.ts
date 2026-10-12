import {
  DEFAULT_WEIGHTS,
  type Discovery,
  type InterestId,
  type RankingContext,
  type ScoredDiscovery,
} from '@/src/domain/types';

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function topicRelevance(discovery: Discovery, context: RankingContext): number {
  const links = discovery.interests;
  if (links.length === 0) return 0.5;

  let weighted = 0;
  let total = 0;
  for (const link of links) {
    const preference = context.preferences.interestWeights[link.interestId] ?? 0.5;
    weighted += preference * link.weight;
    total += link.weight;
  }

  // Mild exploration: boost discoveries that touch adjacent but non-selected interests.
  const selected = new Set(context.preferences.selectedInterestIds);
  const hasSelected = links.some((l) => selected.has(l.interestId));
  const hasAdjacent = links.some((l) => !selected.has(l.interestId));
  const exploration = context.explorationBoost ?? 0.08;
  const exploreNudge =
    selected.size > 0 && !hasSelected && hasAdjacent ? exploration : 0;

  return clamp01((total === 0 ? 0.5 : weighted / total) + exploreNudge);
}

export function connectionRelevance(discovery: Discovery, context: RankingContext): number {
  const outgoing = context.outgoingConnections;
  if (!context.focusDiscoveryId || !outgoing || outgoing.length === 0) {
    return 0.5;
  }

  const match = outgoing.find((c) => c.toDiscoveryId === discovery.id);
  if (!match) return 0.15;

  const sharedBoost = discovery.interests.some((t) =>
    context.recentInterestIds.slice(-3).includes(t.interestId),
  )
    ? 0.12
    : 0;
  return clamp01(0.78 + sharedBoost);
}

export function noveltyScore(discovery: Discovery, context: RankingContext): number {
  if (context.seenDiscoveryIds.has(discovery.id)) {
    return 0;
  }
  const recent = context.recentInterestIds.slice(-6);
  if (recent.length === 0) return 1;

  const overlap = discovery.interests.filter((t) => recent.includes(t.interestId)).length;
  const ratio = overlap / Math.max(discovery.interests.length, 1);
  return clamp01(1 - ratio * 0.35);
}

export function editorialQuality(discovery: Discovery): number {
  return clamp01(discovery.qualityScore);
}

export function diversityScore(discovery: Discovery, context: RankingContext): number {
  const recent = context.recentInterestIds.slice(-4);
  if (recent.length === 0) return 1;

  const counts = new Map<InterestId, number>();
  for (const id of recent) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  let penalty = 0;
  for (const link of discovery.interests) {
    const count = counts.get(link.interestId) ?? 0;
    if (count >= 2) {
      penalty += 0.28 * link.weight;
    } else if (count === 1) {
      penalty += 0.12 * link.weight;
    }
  }
  return clamp01(1 - penalty);
}

export function scoreDiscovery(discovery: Discovery, context: RankingContext): ScoredDiscovery {
  const factors = {
    topicRelevance: topicRelevance(discovery, context),
    connectionRelevance: connectionRelevance(discovery, context),
    novelty: noveltyScore(discovery, context),
    editorialQuality: editorialQuality(discovery),
    diversity: diversityScore(discovery, context),
  };

  const score =
    factors.topicRelevance * DEFAULT_WEIGHTS.topicRelevance +
    factors.connectionRelevance * DEFAULT_WEIGHTS.connectionRelevance +
    factors.novelty * DEFAULT_WEIGHTS.novelty +
    factors.editorialQuality * DEFAULT_WEIGHTS.editorialQuality +
    factors.diversity * DEFAULT_WEIGHTS.diversity;

  return { discovery, score, factors };
}
