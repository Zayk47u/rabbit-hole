import type { ExplorationBucket, InterestId, ScoredDiscovery } from '@/src/domain/types';

export type SessionState = {
  seenDiscoveryIds: string[];
  recentInterestIds: InterestId[];
  skipStreakByInterest: Partial<Record<InterestId, number>>;
  /** How many Discover picks have been served this session (drives exploration mix). */
  pickCount: number;
  lastBucket: ExplorationBucket | null;
  lastExplanation: ScoredDiscovery | null;
  /** Timestamp when the current card was shown (for quick-abandon). */
  cardShownAtMs: number | null;
};

export const EMPTY_SESSION: SessionState = {
  seenDiscoveryIds: [],
  recentInterestIds: [],
  skipStreakByInterest: {},
  pickCount: 0,
  lastBucket: null,
  lastExplanation: null,
  cardShownAtMs: null,
};

export function markSeen(
  session: SessionState,
  discoveryId: string,
  interestIds: InterestId[],
): SessionState {
  if (session.seenDiscoveryIds.includes(discoveryId)) {
    return session;
  }
  return {
    ...session,
    seenDiscoveryIds: [...session.seenDiscoveryIds, discoveryId],
    recentInterestIds: [...session.recentInterestIds, ...interestIds].slice(-32),
  };
}

export function recordSkipStreak(
  session: SessionState,
  interestIds: InterestId[],
  didSkip: boolean,
): SessionState {
  const next = { ...session.skipStreakByInterest };
  for (const id of interestIds) {
    next[id] = didSkip ? (next[id] ?? 0) + 1 : 0;
  }
  return { ...session, skipStreakByInterest: next };
}

export function noteCardShown(session: SessionState, scored: ScoredDiscovery, nowMs: number): SessionState {
  return {
    ...session,
    lastBucket: scored.bucket,
    lastExplanation: scored,
    cardShownAtMs: nowMs,
    pickCount: session.pickCount + 1,
  };
}

export function resetSession(): SessionState {
  return {
    seenDiscoveryIds: [],
    recentInterestIds: [],
    skipStreakByInterest: {},
    pickCount: 0,
    lastBucket: null,
    lastExplanation: null,
    cardShownAtMs: null,
  };
}
