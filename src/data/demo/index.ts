import type { Discovery, DiscoveryConnection, TopicId } from '@/src/domain/types';

import { DEMO_CONNECTIONS } from './connections';
import { DEMO_DISCOVERIES } from './discoveries';
import { DEMO_TOPICS } from './topics';

export { DEMO_CONNECTIONS, DEMO_DISCOVERIES, DEMO_TOPICS };

export function getDiscoveryById(id: string): Discovery | undefined {
  return DEMO_DISCOVERIES.find((d) => d.id === id);
}

export function getConnectionsFrom(discoveryId: string): DiscoveryConnection[] {
  return DEMO_CONNECTIONS.filter((c) => c.fromDiscoveryId === discoveryId);
}

export function getConnectionsTo(discoveryId: string): DiscoveryConnection[] {
  return DEMO_CONNECTIONS.filter((c) => c.toDiscoveryId === discoveryId);
}

export function listTopicIdsForDiscovery(discovery: Discovery): TopicId[] {
  return discovery.topics.map((t) => t.topicId);
}

/** Detects whether following connections can return to a prior node (loop). */
export function wouldCreateImmediateLoop(
  historyIds: readonly string[],
  nextDiscoveryId: string,
): boolean {
  return historyIds.includes(nextDiscoveryId);
}
