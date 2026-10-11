export type ExplorationStep = {
  discoveryId: string;
  viaConnectionId?: string;
};

export type ExplorationHistory = {
  steps: ExplorationStep[];
};

export function createHistory(startDiscoveryId: string): ExplorationHistory {
  return { steps: [{ discoveryId: startDiscoveryId }] };
}

export function currentDiscoveryId(history: ExplorationHistory): string | undefined {
  return history.steps[history.steps.length - 1]?.discoveryId;
}

export function pushStep(
  history: ExplorationHistory,
  discoveryId: string,
  viaConnectionId?: string,
): ExplorationHistory {
  return {
    steps: [...history.steps, { discoveryId, viaConnectionId }],
  };
}

export function popStep(history: ExplorationHistory): ExplorationHistory {
  if (history.steps.length <= 1) return history;
  return { steps: history.steps.slice(0, -1) };
}

export function canGoBack(history: ExplorationHistory): boolean {
  return history.steps.length > 1;
}

export function historyIds(history: ExplorationHistory): string[] {
  return history.steps.map((s) => s.discoveryId);
}
