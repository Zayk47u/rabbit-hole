/** Core domain types for the offline curiosity-engine demo. */

export type BranchType =
  | 'same_pattern'
  | 'side_quest'
  | 'darker_version'
  | 'go_deeper'
  | 'zoom_out'
  | 'unexpected_parallel'
  | 'opposite_example'
  | 'where_this_leads'
  | 'backstory'
  | 'modern_version';

/** Curiosity-driven interest clusters (not school departments). */
export type InterestId =
  | 'hidden_history'
  | 'criminal_psychology'
  | 'internet_mysteries'
  | 'strange_human_behavior'
  | 'subcultures'
  | 'power_manipulation'
  | 'cults_belief'
  | 'strange_science'
  | 'future_technology'
  | 'lost_technology'
  | 'design_aesthetics'
  | 'fashion_lore'
  | 'music_subcultures'
  | 'occult_symbolism'
  | 'media_analysis'
  | 'propaganda'
  | 'systems_incentives'
  | 'engineering_marvels'
  | 'catastrophes'
  | 'unexplained_events'
  | 'cultural_oddities'
  | 'forgotten_places'
  | 'beautiful_weirdness'
  | 'unexpected_connections';

export interface Interest {
  id: InterestId;
  slug: string;
  label: string;
  /** Accent used for chips / visual motifs. */
  accent: string;
  blurb: string;
}

export interface DemoSource {
  id: string;
  title: string;
  note: string;
}

export interface DiscoveryInterestLink {
  interestId: InterestId;
  weight: number;
}

export interface Discovery {
  id: string;
  slug: string;
  title: string;
  /** One-line curiosity hook. */
  hook: string;
  /** Ultra-short explanation shown on the card. */
  brief: string;
  /** Why this is interesting / why it matters. */
  whyItMatters: string;
  /** Longer optional copy for Dive. */
  deepDive: string;
  qualityScore: number;
  interests: DiscoveryInterestLink[];
  sources: DemoSource[];
  accentColor: string;
  /** Short visual motif label for placeholder art. */
  visualMotif: string;
  isDemo: true;
}

export interface DiscoveryConnection {
  id: string;
  fromDiscoveryId: string;
  toDiscoveryId: string;
  branchType: BranchType;
  /** Tempting teaser shown on the branch chip. */
  teaser: string;
}

export type InteractionKind = 'skip' | 'save' | 'dive' | 'branch';

export interface UserPreferences {
  /**
   * Learned + explicit interest weights in [0, 1].
   * Missing interests default to 0.5 (neutral cold start).
   */
  interestWeights: Partial<Record<InterestId, number>>;
  /** Explicitly tapped cold-start seeds. */
  selectedInterestIds: InterestId[];
}

export interface RankingContext {
  preferences: UserPreferences;
  seenDiscoveryIds: ReadonlySet<string>;
  recentInterestIds: readonly InterestId[];
  focusDiscoveryId?: string;
  outgoingConnections?: readonly DiscoveryConnection[];
  /** Mild exploration bias: occasionally surface adjacent/unexpected interests. */
  explorationBoost?: number;
}

export interface ScoredDiscovery {
  discovery: Discovery;
  score: number;
  factors: {
    topicRelevance: number;
    connectionRelevance: number;
    novelty: number;
    editorialQuality: number;
    diversity: number;
  };
}

export const DEFAULT_WEIGHTS = {
  topicRelevance: 0.3,
  connectionRelevance: 0.2,
  novelty: 0.2,
  editorialQuality: 0.15,
  diversity: 0.15,
} as const;

/** Preference deltas applied after each interaction (clamped later). */
export const SIGNAL_DELTAS: Record<InteractionKind, number> = {
  skip: -0.08,
  save: 0.18,
  dive: 0.22,
  branch: 0.2,
};

export const BRANCH_LABELS: Record<BranchType, string> = {
  same_pattern: 'Same pattern',
  side_quest: 'Side quest',
  darker_version: 'Darker version',
  go_deeper: 'Go deeper',
  zoom_out: 'Zoom out',
  unexpected_parallel: 'Unexpected parallel',
  opposite_example: 'Opposite example',
  where_this_leads: 'Where this leads',
  backstory: 'Backstory',
  modern_version: 'Modern version',
};

/** @deprecated Use Interest / InterestId — kept only for migration clarity in comments. */
export type TopicId = InterestId;
export type Topic = Interest;
