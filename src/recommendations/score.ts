import { DEFAULT_WEIGHTS, type Discovery, type RankingContext, type ScoredDiscovery, type TopicId } from '@/src/domain/types';

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function topicRelevance(discovery: Discovery, context: RankingContext): number {
  const links = discovery.topics;
  if (links.length === 0) return 0.5;

  let weighted = 0;
  let total = 0;
  for (const link of links) {
    const preference = context.preferences.topicWeights[link.topicId] ?? 0.5;
    weighted += preference * link.weight;
    total += link.weight;
  }
  return clamp01(total === 0 ? 0.5 : weighted / total);
}

export function connectionRelevance(discovery: Discovery, context: RankingContext): number {
  const outgoing = context.outgoingConnections;
  if (!context.focusDiscoveryId || !outgoing || outgoing.length === 0) {
    return 0.5;
  }

  const match = outgoing.find((c) => c.toDiscoveryId === discovery.id);
  if (!match) return 0.15;

  // Prefer branches that share topics with the focus card's recent path.
  const sharedBoost = discovery.topics.some((t) =>
    context.recentTopicIds.slice(-3).includes(t.topicId),
  )
    ? 0.15
    : 0;
  return clamp01(0.75 + sharedBoost);
}

export function noveltyScore(discovery: Discovery, context: RankingContext): number {
  if (context.seenDiscoveryIds.has(discovery.id)) {
    return 0;
  }
  // Mild penalty if many of the discovery's topics dominate the recent path.
  const recent = context.recentTopicIds.slice(-6);
  if (recent.length === 0) return 1;

  const overlap = discovery.topics.filter((t) => recent.includes(t.topicId)).length;
  const ratio = overlap / Math.max(discovery.topics.length, 1);
  return clamp01(1 - ratio * 0.35);
}

export function editorialQuality(discovery: Discovery): number {
  return clamp01(discovery.qualityScore);
}

export function diversityScore(discovery: Discovery, context: RankingContext): number {
  const recent = context.recentTopicIds.slice(-4);
  if (recent.length === 0) return 1;

  const counts = new Map<TopicId, number>();
  for (const id of recent) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  let penalty = 0;
  for (const link of discovery.topics) {
    const count = counts.get(link.topicId) ?? 0;
    if (count >= 2) {
      penalty += 0.25 * link.weight;
    } else if (count === 1) {
      penalty += 0.1 * link.weight;
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
