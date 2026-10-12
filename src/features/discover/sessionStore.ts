import type { InterestId } from '@/src/domain/types';

export type SessionState = {
  seenDiscoveryIds: string[];
  recentInterestIds: InterestId[];
  skipStreakByInterest: Partial<Record<InterestId, number>>;
};

export const EMPTY_SESSION: SessionState = {
  seenDiscoveryIds: [],
  recentInterestIds: [],
  skipStreakByInterest: {},
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

export function resetSession(): SessionState {
  return {
    seenDiscoveryIds: [],
    recentInterestIds: [],
    skipStreakByInterest: {},
  };
}
