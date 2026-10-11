import type { TopicId } from '@/src/domain/types';

export type SessionState = {
  seenDiscoveryIds: string[];
  recentTopicIds: TopicId[];
};

export const EMPTY_SESSION: SessionState = {
  seenDiscoveryIds: [],
  recentTopicIds: [],
};

export function markSeen(session: SessionState, discoveryId: string, topicIds: TopicId[]): SessionState {
  if (session.seenDiscoveryIds.includes(discoveryId)) {
    return session;
  }
  return {
    seenDiscoveryIds: [...session.seenDiscoveryIds, discoveryId],
    recentTopicIds: [...session.recentTopicIds, ...topicIds].slice(-24),
  };
}

export function resetSession(): SessionState {
  return { ...EMPTY_SESSION, seenDiscoveryIds: [], recentTopicIds: [] };
}
