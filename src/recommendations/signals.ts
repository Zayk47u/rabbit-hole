import {
  SIGNAL_DELTAS,
  type Discovery,
  type InterestId,
  type InteractionKind,
  type UserPreferences,
} from '@/src/domain/types';

function clampWeight(value: number): number {
  return Math.min(0.95, Math.max(0.05, value));
}

/**
 * Apply an interaction signal onto interest weights.
 * Explicit selected seeds stay listed; weights drift with behavior.
 */
export function applyInteractionSignal(
  preferences: UserPreferences,
  discovery: Discovery,
  kind: InteractionKind,
): UserPreferences {
  const delta = SIGNAL_DELTAS[kind];
  const nextWeights: Partial<Record<InterestId, number>> = {
    ...preferences.interestWeights,
  };

  for (const link of discovery.interests) {
    const current = nextWeights[link.interestId] ?? 0.5;
    nextWeights[link.interestId] = clampWeight(current + delta * link.weight);
  }

  // Repeated skips in a cluster: extra penalty on the dominant interest.
  if (kind === 'skip' && discovery.interests[0]) {
    const top = discovery.interests[0];
    const current = nextWeights[top.interestId] ?? 0.5;
    nextWeights[top.interestId] = clampWeight(current - 0.03);
  }

  return {
    ...preferences,
    interestWeights: nextWeights,
  };
}

export function seedFromSelectedInterests(selected: InterestId[]): UserPreferences {
  const interestWeights: Partial<Record<InterestId, number>> = {};
  for (const id of selected) {
    interestWeights[id] = 0.82;
  }
  return {
    selectedInterestIds: [...selected],
    interestWeights,
  };
}

export function toggleSelectedInterest(
  preferences: UserPreferences,
  interestId: InterestId,
): UserPreferences {
  const selected = new Set(preferences.selectedInterestIds);
  const interestWeights = { ...preferences.interestWeights };

  if (selected.has(interestId)) {
    selected.delete(interestId);
    interestWeights[interestId] = 0.5;
  } else {
    selected.add(interestId);
    interestWeights[interestId] = Math.max(interestWeights[interestId] ?? 0.5, 0.82);
  }

  return {
    selectedInterestIds: [...selected],
    interestWeights,
  };
}
