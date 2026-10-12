import type {
  BranchType,
  Discovery,
  InterestId,
  InteractionEvent,
  InteractionKind,
  UserPreferences,
} from '@/src/domain/types';

import {
  COLD_START_SEED_WEIGHT,
  INTERACTION_WEIGHTS,
  NEUTRAL_WEIGHT,
  WEIGHT_CLAMP,
} from './config';

function clampWeight(value: number): number {
  return Math.min(WEIGHT_CLAMP.max, Math.max(WEIGHT_CLAMP.min, value));
}

function bumpInterests(
  weights: Partial<Record<InterestId, number>>,
  discovery: Discovery,
  delta: number,
): Partial<Record<InterestId, number>> {
  const next = { ...weights };
  for (const link of discovery.interests) {
    const current = next[link.interestId] ?? NEUTRAL_WEIGHT;
    next[link.interestId] = clampWeight(current + delta * link.weight);
  }
  return next;
}

function bumpCounts(
  counts: Partial<Record<InterestId, number>>,
  discovery: Discovery,
  amount: number,
): Partial<Record<InterestId, number>> {
  const next = { ...counts };
  for (const link of discovery.interests) {
    next[link.interestId] = (next[link.interestId] ?? 0) + amount;
  }
  return next;
}

function applySkipEscalation(
  preferences: UserPreferences,
  discovery: Discovery,
  weights: Partial<Record<InterestId, number>>,
): Partial<Record<InterestId, number>> {
  const next = { ...weights };
  const { streakExtra, streakCap } = INTERACTION_WEIGHTS.skip;
  for (const link of discovery.interests) {
    const skips = preferences.skipCountsByInterest[link.interestId] ?? 0;
    const streak = Math.min(skips, streakCap);
    if (streak <= 0) continue;
    const current = next[link.interestId] ?? NEUTRAL_WEIGHT;
    next[link.interestId] = clampWeight(current + streakExtra * streak * link.weight);
  }
  return next;
}

/**
 * Apply a behavioral signal onto the evolving local profile.
 * Explicit selected seeds stay listed; weights drift with behavior.
 */
export function applyInteractionSignal(
  preferences: UserPreferences,
  discovery: Discovery,
  kind: InteractionKind,
  options: {
    branchType?: BranchType;
    sourceDiscovery?: Discovery;
    dwellMs?: number;
  } = {},
): UserPreferences {
  const event: InteractionEvent = {
    kind,
    discoveryId: discovery.id,
    branchType: options.branchType,
    fromDiscoveryId: options.sourceDiscovery?.id,
    dwellMs: options.dwellMs,
  };
  return applyInteractionEvent(preferences, discovery, event, options.sourceDiscovery);
}

export function applyInteractionEvent(
  preferences: UserPreferences,
  discovery: Discovery,
  event: InteractionEvent,
  sourceDiscovery?: Discovery,
): UserPreferences {
  let interestWeights = { ...preferences.interestWeights };
  let branchTypeWeights = { ...preferences.branchTypeWeights };
  let skipCountsByInterest = { ...preferences.skipCountsByInterest };
  let engageCountsByInterest = { ...preferences.engageCountsByInterest };
  let quickAbandonByDiscovery = { ...preferences.quickAbandonByDiscovery };
  const seenDiscoveryIds = preferences.seenDiscoveryIds.includes(discovery.id)
    ? [...preferences.seenDiscoveryIds]
    : [...preferences.seenDiscoveryIds, discovery.id];

  const isQuickAbandon =
    event.kind === 'skip' &&
    typeof event.dwellMs === 'number' &&
    event.dwellMs < INTERACTION_WEIGHTS.quickAbandon.dwellMsThreshold;

  switch (event.kind) {
    case 'skip': {
      const delta = isQuickAbandon
        ? INTERACTION_WEIGHTS.quickAbandon.interestDelta
        : INTERACTION_WEIGHTS.skip.interestDelta;
      interestWeights = bumpInterests(interestWeights, discovery, delta);
      skipCountsByInterest = bumpCounts(skipCountsByInterest, discovery, 1);
      interestWeights = applySkipEscalation(
        { ...preferences, skipCountsByInterest },
        discovery,
        interestWeights,
      );
      if (isQuickAbandon) {
        quickAbandonByDiscovery[discovery.id] =
          (quickAbandonByDiscovery[discovery.id] ?? 0) + 1;
      }
      break;
    }
    case 'save': {
      interestWeights = bumpInterests(
        interestWeights,
        discovery,
        INTERACTION_WEIGHTS.save.interestDelta,
      );
      engageCountsByInterest = bumpCounts(engageCountsByInterest, discovery, 1);
      skipCountsByInterest = resetStreaks(skipCountsByInterest, discovery);
      break;
    }
    case 'dive': {
      interestWeights = bumpInterests(
        interestWeights,
        discovery,
        INTERACTION_WEIGHTS.dive.interestDelta,
      );
      engageCountsByInterest = bumpCounts(engageCountsByInterest, discovery, 1);
      skipCountsByInterest = resetStreaks(skipCountsByInterest, discovery);
      break;
    }
    case 'branch': {
      interestWeights = bumpInterests(
        interestWeights,
        discovery,
        INTERACTION_WEIGHTS.branch.interestDelta,
      );
      if (sourceDiscovery) {
        interestWeights = bumpInterests(
          interestWeights,
          sourceDiscovery,
          INTERACTION_WEIGHTS.branch.sourceInterestDelta,
        );
        if (!seenDiscoveryIds.includes(sourceDiscovery.id)) {
          seenDiscoveryIds.push(sourceDiscovery.id);
        }
      }
      if (event.branchType) {
        const current = branchTypeWeights[event.branchType] ?? NEUTRAL_WEIGHT;
        branchTypeWeights[event.branchType] = clampWeight(
          current + INTERACTION_WEIGHTS.branch.branchTypeDelta,
        );
      }
      engageCountsByInterest = bumpCounts(engageCountsByInterest, discovery, 1);
      skipCountsByInterest = resetStreaks(skipCountsByInterest, discovery);
      break;
    }
    default: {
      const _exhaustive: never = event.kind;
      void _exhaustive;
      break;
    }
  }

  return {
    ...preferences,
    interestWeights,
    branchTypeWeights,
    skipCountsByInterest,
    engageCountsByInterest,
    quickAbandonByDiscovery,
    seenDiscoveryIds,
    profileVersion: 3,
  };
}

function resetStreaks(
  counts: Partial<Record<InterestId, number>>,
  discovery: Discovery,
): Partial<Record<InterestId, number>> {
  const next = { ...counts };
  for (const link of discovery.interests) {
    next[link.interestId] = 0;
  }
  return next;
}

export function seedFromSelectedInterests(selected: InterestId[]): UserPreferences {
  const interestWeights: Partial<Record<InterestId, number>> = {};
  for (const id of selected) {
    interestWeights[id] = COLD_START_SEED_WEIGHT;
  }
  return {
    selectedInterestIds: [...selected],
    interestWeights,
    branchTypeWeights: {},
    skipCountsByInterest: {},
    engageCountsByInterest: {},
    seenDiscoveryIds: [],
    quickAbandonByDiscovery: {},
    profileVersion: 3,
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
    // Cold-start seed removed — leave learned weight if behavior already moved it.
    if ((preferences.engageCountsByInterest[interestId] ?? 0) === 0) {
      interestWeights[interestId] = NEUTRAL_WEIGHT;
    }
  } else {
    selected.add(interestId);
    interestWeights[interestId] = Math.max(
      interestWeights[interestId] ?? NEUTRAL_WEIGHT,
      COLD_START_SEED_WEIGHT,
    );
  }

  return {
    ...preferences,
    selectedInterestIds: [...selected],
    interestWeights,
  };
}

/** Average affinity of a discovery against the current profile. */
export function interestAffinity(discovery: Discovery, preferences: UserPreferences): number {
  const links = discovery.interests;
  if (links.length === 0) return NEUTRAL_WEIGHT;
  let weighted = 0;
  let total = 0;
  for (const link of links) {
    weighted += (preferences.interestWeights[link.interestId] ?? NEUTRAL_WEIGHT) * link.weight;
    total += link.weight;
  }
  return total === 0 ? NEUTRAL_WEIGHT : weighted / total;
}
