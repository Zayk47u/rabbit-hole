import type { BranchType, InteractionKind } from '@/src/domain/types';

/** Centralized knobs for the local adaptive recommender. */

export const NEUTRAL_WEIGHT = 0.5;

export const WEIGHT_CLAMP = {
  min: 0.05,
  max: 0.95,
} as const;

/** Cold-start seed strength when the user taps an Interest chip. */
export const COLD_START_SEED_WEIGHT = 0.78;

/**
 * Per-interaction interest deltas (multiplied by each discovery's interest link weight).
 * Escalation for repeated skips is applied separately.
 */
export const INTERACTION_WEIGHTS = {
  skip: {
    interestDelta: -0.07,
    /** Extra penalty per consecutive skip streak on that interest (capped). */
    streakExtra: -0.035,
    streakCap: 4,
  },
  save: {
    interestDelta: 0.17,
  },
  dive: {
    interestDelta: 0.24,
  },
  branch: {
    /** Boost for destination discovery interests. */
    interestDelta: 0.16,
    /** Boost for source discovery interests (both sides of the rabbit hole). */
    sourceInterestDelta: 0.12,
    /** How strongly the chosen branch type preference moves. */
    branchTypeDelta: 0.15,
  },
  /** Skip with very short dwell — stronger than a thoughtful skip. */
  quickAbandon: {
    interestDelta: -0.11,
    dwellMsThreshold: 1800,
  },
} as const;

/** Scoring blend for a single candidate (before exploration bucket reshaping). */
export const SCORE_WEIGHTS = {
  topicRelevance: 0.32,
  connectionStyle: 0.14,
  connectionRelevance: 0.1,
  novelty: 0.16,
  editorialQuality: 0.1,
  diversity: 0.1,
  repetitionPenalty: 0.08,
} as const;

/**
 * Conceptual mix for Discover picks (rolling window of 10):
 * 7 exploit · 2 adjacent · 1 wildcard ≈ 70/20/10
 */
export const EXPLORATION_MIX = {
  exploit: 0.7,
  adjacent: 0.2,
  wildcard: 0.1,
  windowSize: 10,
  adjacentSlots: [3, 8] as const,
  wildcardSlots: [6] as const,
} as const;

/** Soft floor so disliked topics can still appear in wildcard slots. */
export const WILDCARD_TOPIC_FLOOR = 0.35;

export const ALL_BRANCH_TYPES: BranchType[] = [
  'same_pattern',
  'side_quest',
  'darker_version',
  'go_deeper',
  'zoom_out',
  'unexpected_parallel',
  'opposite_example',
  'where_this_leads',
  'backstory',
  'modern_version',
];

export function defaultBranchTypeWeights(): Record<BranchType, number> {
  return Object.fromEntries(ALL_BRANCH_TYPES.map((t) => [t, NEUTRAL_WEIGHT])) as Record<
    BranchType,
    number
  >;
}

/** @deprecated Prefer INTERACTION_WEIGHTS — kept for older test imports. */
export const SIGNAL_DELTAS: Record<InteractionKind, number> = {
  skip: INTERACTION_WEIGHTS.skip.interestDelta,
  save: INTERACTION_WEIGHTS.save.interestDelta,
  dive: INTERACTION_WEIGHTS.dive.interestDelta,
  branch: INTERACTION_WEIGHTS.branch.interestDelta,
};
