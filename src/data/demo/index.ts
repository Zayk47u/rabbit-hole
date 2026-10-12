import type { Discovery, DiscoveryConnection, InterestId } from '@/src/domain/types';

import { DEMO_CONNECTIONS } from './connections';
import { DEMO_DISCOVERIES } from './discoveries';
import { DEMO_INTERESTS, DEMO_TOPICS } from './topics';

export { DEMO_CONNECTIONS, DEMO_DISCOVERIES, DEMO_INTERESTS, DEMO_TOPICS };

export function getDiscoveryById(id: string): Discovery | undefined {
  return DEMO_DISCOVERIES.find((d) => d.id === id);
}

export function getInterestById(id: InterestId) {
  return DEMO_INTERESTS.find((i) => i.id === id);
}

export function getConnectionsFrom(discoveryId: string): DiscoveryConnection[] {
  return DEMO_CONNECTIONS.filter((c) => c.fromDiscoveryId === discoveryId);
}

export function getConnectionsTo(discoveryId: string): DiscoveryConnection[] {
  return DEMO_CONNECTIONS.filter((c) => c.toDiscoveryId === discoveryId);
}

export function listInterestIdsForDiscovery(discovery: Discovery): InterestId[] {
  return discovery.interests.map((t) => t.interestId);
}

/** @deprecated Use listInterestIdsForDiscovery */
export function listTopicIdsForDiscovery(discovery: Discovery): InterestId[] {
  return listInterestIdsForDiscovery(discovery);
}

export function wouldCreateImmediateLoop(
  historyIds: readonly string[],
  nextDiscoveryId: string,
): boolean {
  return historyIds.includes(nextDiscoveryId);
}
