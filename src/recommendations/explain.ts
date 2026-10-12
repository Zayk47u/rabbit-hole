import type { ExplorationBucket, ScoredDiscovery, UserPreferences } from '@/src/domain/types';
import { BRANCH_LABELS } from '@/src/domain/types';

import {
  EXPLORATION_MIX,
  INTERACTION_WEIGHTS,
  NEUTRAL_WEIGHT,
  SCORE_WEIGHTS,
} from './config';

export type RankingDebugSnapshot = {
  discoveryId: string;
  title: string;
  score: number;
  bucket: ExplorationBucket;
  factors: ScoredDiscovery['factors'];
  reasons: string[];
  interestWeights: { id: string; weight: number }[];
  branchTypeWeights: { id: string; label: string; weight: number }[];
  mix: typeof EXPLORATION_MIX;
  scoreWeights: typeof SCORE_WEIGHTS;
  interactionWeights: typeof INTERACTION_WEIGHTS;
};

export function explainScoredDiscovery(
  scored: ScoredDiscovery,
  preferences: UserPreferences,
): RankingDebugSnapshot {
  const interestWeights = Object.entries(preferences.interestWeights)
    .map(([id, weight]) => ({ id, weight: weight ?? NEUTRAL_WEIGHT }))
    .sort((a, b) => b.weight - a.weight);

  const branchTypeWeights = Object.entries(preferences.branchTypeWeights)
    .map(([id, weight]) => ({
      id,
      label: BRANCH_LABELS[id as keyof typeof BRANCH_LABELS] ?? id,
      weight: weight ?? NEUTRAL_WEIGHT,
    }))
    .sort((a, b) => b.weight - a.weight);

  return {
    discoveryId: scored.discovery.id,
    title: scored.discovery.title,
    score: scored.score,
    bucket: scored.bucket,
    factors: scored.factors,
    reasons: scored.reasons,
    interestWeights,
    branchTypeWeights,
    mix: EXPLORATION_MIX,
    scoreWeights: SCORE_WEIGHTS,
    interactionWeights: INTERACTION_WEIGHTS,
  };
}
