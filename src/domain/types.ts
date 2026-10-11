/** Core domain types for the offline demo vertical slice. */

export type RelationType =
  | 'inspired_by'
  | 'contrasts_with'
  | 'shares_mechanism'
  | 'historical_link'
  | 'scales_to'
  | 'applies_in';

export type TopicId =
  | 'biology'
  | 'physics'
  | 'history'
  | 'design'
  | 'mathematics'
  | 'linguistics'
  | 'ecology'
  | 'astronomy'
  | 'psychology'
  | 'materials';

export interface Topic {
  id: TopicId;
  slug: string;
  label: string;
}

export interface DemoSource {
  id: string;
  /** Demo-only label; not a verified citation for production. */
  title: string;
  note: string;
}

export interface DiscoveryTopicLink {
  topicId: TopicId;
  weight: number;
}

export interface Discovery {
  id: string;
  slug: string;
  title: string;
  hook: string;
  body: string;
  readingSeconds: number;
  /** 0–1 editorial quality for demo ranking only. */
  qualityScore: number;
  topics: DiscoveryTopicLink[];
  sources: DemoSource[];
  /** Deterministic placeholder accent for safe demo media. */
  accentColor: string;
  /** Always true in this milestone — sample content, not production. */
  isDemo: true;
}

export interface DiscoveryConnection {
  id: string;
  fromDiscoveryId: string;
  toDiscoveryId: string;
  relationType: RelationType;
  explanation: string;
}

export interface UserPreferences {
  /** Topic preference weights in [0, 1]. Missing topics default to 0.5 (neutral). */
  topicWeights: Partial<Record<TopicId, number>>;
}

export interface RankingContext {
  preferences: UserPreferences;
  seenDiscoveryIds: ReadonlySet<string>;
  /** Recent topic ids from the session, oldest → newest. */
  recentTopicIds: readonly TopicId[];
  /** Optional focus discovery when ranking branch targets. */
  focusDiscoveryId?: string;
  /** Connections from the focus discovery, if ranking branches. */
  outgoingConnections?: readonly DiscoveryConnection[];
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
  connectionRelevance: 0.25,
  novelty: 0.2,
  editorialQuality: 0.15,
  diversity: 0.1,
} as const;

export const RELATION_LABELS: Record<RelationType, string> = {
  inspired_by: 'Inspired by',
  contrasts_with: 'Contrasts with',
  shares_mechanism: 'Shares a mechanism',
  historical_link: 'Historical link',
  scales_to: 'Scales to',
  applies_in: 'Applies in',
};
