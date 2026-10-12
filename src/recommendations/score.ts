import type {
  Discovery,
  DiscoveryConnection,
  ExplorationBucket,
  InterestId,
  RankingContext,
  ScoreFactors,
  ScoredDiscovery,
  UserPreferences,
} from '@/src/domain/types';

import { NEUTRAL_WEIGHT, SCORE_WEIGHTS, WILDCARD_TOPIC_FLOOR } from './config';
import { interestAffinity } from './signals';

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function topicRelevance(
  discovery: Discovery,
  context: RankingContext,
  bucket: ExplorationBucket = context.bucket ?? 'exploit',
): number {
  const base = interestAffinity(discovery, context.preferences);

  if (bucket === 'wildcard') {
    // Prefer lower-affinity cards so the feed can probe unfamiliar clusters.
    return clamp01(Math.max(WILDCARD_TOPIC_FLOOR, 1 - base + 0.15));
  }

  if (bucket === 'adjacent') {
    const selected = new Set(context.preferences.selectedInterestIds);
    const high = Object.entries(context.preferences.interestWeights)
      .filter(([, w]) => (w ?? 0) >= 0.62)
      .map(([id]) => id as InterestId);
    const preferred = new Set([...selected, ...high]);

    const hasPreferred = discovery.interests.some((l) => preferred.has(l.interestId));
    const hasOther = discovery.interests.some((l) => !preferred.has(l.interestId));
    const adjacentBonus = hasPreferred && hasOther ? 0.18 : hasPreferred ? 0.05 : -0.08;
    return clamp01(base * 0.75 + 0.2 + adjacentBonus);
  }

  // exploit
  const exploration = context.explorationBoost ?? 0;
  return clamp01(base + exploration);
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

/**
 * Preference for the *kind* of rabbit-hole transition linking to this card.
 * Uses outgoing connections from the focus card when available; otherwise
 * averages branch-type weights across all known link types on the candidate
 * via optional `candidateConnections` on context — or returns neutral.
 */
export function connectionStyleScore(
  discovery: Discovery,
  context: RankingContext,
  candidateIncoming?: readonly DiscoveryConnection[],
): number {
  const prefs = context.preferences.branchTypeWeights;
  const outgoing = context.outgoingConnections;
  if (context.focusDiscoveryId && outgoing && outgoing.length > 0) {
    const match = outgoing.find((c) => c.toDiscoveryId === discovery.id);
    if (!match) return 0.35;
    return clamp01(prefs[match.branchType] ?? NEUTRAL_WEIGHT);
  }

  if (candidateIncoming && candidateIncoming.length > 0) {
    let sum = 0;
    for (const c of candidateIncoming) {
      sum += prefs[c.branchType] ?? NEUTRAL_WEIGHT;
    }
    return clamp01(sum / candidateIncoming.length);
  }

  return NEUTRAL_WEIGHT;
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

/**
 * Higher is better. Penalizes interests the user has been skipping a lot.
 * Returned as (1 - rawPenalty) so it fits the positive scoring blend.
 */
export function repetitionPenaltyScore(discovery: Discovery, context: RankingContext): number {
  const prefs = context.preferences;
  const sessionStreaks = context.skipStreakByInterest ?? {};
  let penalty = 0;
  for (const link of discovery.interests) {
    const lifetime = prefs.skipCountsByInterest[link.interestId] ?? 0;
    const streak = sessionStreaks[link.interestId] ?? 0;
    const engages = prefs.engageCountsByInterest[link.interestId] ?? 0;
    const netSkips = Math.max(0, lifetime - engages * 0.5);
    penalty += Math.min(0.45, netSkips * 0.04 + streak * 0.06) * link.weight;
  }
  const abandons = prefs.quickAbandonByDiscovery[discovery.id] ?? 0;
  penalty += Math.min(0.3, abandons * 0.15);
  return clamp01(1 - penalty);
}

function buildReasons(
  discovery: Discovery,
  factors: ScoreFactors,
  bucket: ExplorationBucket,
  preferences: UserPreferences,
): string[] {
  const reasons: string[] = [`Bucket: ${bucket}`];

  const topInterests = [...discovery.interests]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 2)
    .map((l) => {
      const w = preferences.interestWeights[l.interestId] ?? NEUTRAL_WEIGHT;
      return `${l.interestId}=${w.toFixed(2)}`;
    });
  reasons.push(`Interest affinity: ${factors.topicRelevance.toFixed(2)} (${topInterests.join(', ')})`);
  reasons.push(`Novelty: ${factors.novelty.toFixed(2)}`);
  reasons.push(`Repetition: ${factors.repetitionPenalty.toFixed(2)}`);
  reasons.push(`Connection style: ${factors.connectionStyle.toFixed(2)}`);
  if (factors.connectionRelevance !== 0.5) {
    reasons.push(`Branch link: ${factors.connectionRelevance.toFixed(2)}`);
  }
  return reasons;
}

export function scoreDiscovery(
  discovery: Discovery,
  context: RankingContext,
  options: {
    bucket?: ExplorationBucket;
    incomingConnections?: readonly DiscoveryConnection[];
  } = {},
): ScoredDiscovery {
  const bucket = options.bucket ?? context.bucket ?? 'exploit';
  const factors: ScoreFactors = {
    topicRelevance: topicRelevance(discovery, context, bucket),
    connectionRelevance: connectionRelevance(discovery, context),
    connectionStyle: connectionStyleScore(discovery, context, options.incomingConnections),
    novelty: noveltyScore(discovery, context),
    editorialQuality: editorialQuality(discovery),
    diversity: diversityScore(discovery, context),
    repetitionPenalty: repetitionPenaltyScore(discovery, context),
  };

  let score =
    factors.topicRelevance * SCORE_WEIGHTS.topicRelevance +
    factors.connectionRelevance * SCORE_WEIGHTS.connectionRelevance +
    factors.connectionStyle * SCORE_WEIGHTS.connectionStyle +
    factors.novelty * SCORE_WEIGHTS.novelty +
    factors.editorialQuality * SCORE_WEIGHTS.editorialQuality +
    factors.diversity * SCORE_WEIGHTS.diversity +
    factors.repetitionPenalty * SCORE_WEIGHTS.repetitionPenalty;

  // Bucket-specific reshaping so mix isn't just cosmetic labels.
  if (bucket === 'wildcard') {
    score = score * 0.55 + factors.novelty * 0.35 + (1 - factors.topicRelevance) * 0.1;
  } else if (bucket === 'adjacent') {
    score = score * 0.85 + factors.diversity * 0.15;
  }

  return {
    discovery,
    score,
    factors,
    bucket,
    reasons: buildReasons(discovery, factors, bucket, context.preferences),
  };
}
