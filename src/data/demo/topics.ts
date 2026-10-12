import type { Interest } from '@/src/domain/types';

/** Curiosity clusters — overlapping, not academic departments. */
export const DEMO_INTERESTS: Interest[] = [
  { id: 'hidden_history', slug: 'hidden-history', label: 'Hidden History', accent: '#E8A838', blurb: 'Stories that never made the textbook.' },
  { id: 'criminal_psychology', slug: 'criminal-psychology', label: 'Criminal Psychology', accent: '#FF5C5C', blurb: 'How minds justify the unthinkable.' },
  { id: 'internet_mysteries', slug: 'internet-mysteries', label: 'Internet Mysteries', accent: '#5B8CFF', blurb: 'Unfinished digital rabbit holes.' },
  { id: 'strange_human_behavior', slug: 'strange-human-behavior', label: 'Strange Human Behavior', accent: '#FF7A59', blurb: 'People doing inexplicable things.' },
  { id: 'subcultures', slug: 'subcultures', label: 'Subcultures', accent: '#C77DFF', blurb: 'Worlds built inside other worlds.' },
  { id: 'power_manipulation', slug: 'power-manipulation', label: 'Power & Manipulation', accent: '#FF4D6D', blurb: 'How influence actually works.' },
  { id: 'cults_belief', slug: 'cults-belief', label: 'Cults & Belief', accent: '#B84FFF', blurb: 'Meaning systems that capture people.' },
  { id: 'strange_science', slug: 'strange-science', label: 'Strange Science', accent: '#3DDC97', blurb: 'Experiments that feel like fiction.' },
  { id: 'future_technology', slug: 'future-technology', label: 'Future Technology', accent: '#4DE1C1', blurb: 'Edges of what comes next.' },
  { id: 'lost_technology', slug: 'lost-technology', label: 'Lost Technology', accent: '#8B9BB4', blurb: 'Capabilities we forgot how to make.' },
  { id: 'design_aesthetics', slug: 'design-aesthetics', label: 'Design & Aesthetics', accent: '#FF8FAB', blurb: 'Why certain forms feel inevitable.' },
  { id: 'fashion_lore', slug: 'fashion-lore', label: 'Fashion Lore', accent: '#FF6BCB', blurb: 'Clothes as coded identity.' },
  { id: 'music_subcultures', slug: 'music-subcultures', label: 'Music Subcultures', accent: '#A78BFA', blurb: 'Scenes that rewired belonging.' },
  { id: 'occult_symbolism', slug: 'occult-symbolism', label: 'Occult & Symbolism', accent: '#9B8CFF', blurb: 'Signs, rituals, hidden meaning.' },
  { id: 'media_analysis', slug: 'media-analysis', label: 'Media Analysis', accent: '#62B6FF', blurb: 'What stories are doing to us.' },
  { id: 'propaganda', slug: 'propaganda', label: 'Propaganda', accent: '#FF6B6B', blurb: 'Persuasion engineered at scale.' },
  { id: 'systems_incentives', slug: 'systems-incentives', label: 'Systems & Incentives', accent: '#FFC857', blurb: 'Follow the reward structure.' },
  { id: 'engineering_marvels', slug: 'engineering-marvels', label: 'Engineering Marvels', accent: '#5EEAD4', blurb: 'Impossible objects that somehow work.' },
  { id: 'catastrophes', slug: 'catastrophes', label: 'Catastrophes', accent: '#FF7043', blurb: 'When systems fail spectacularly.' },
  { id: 'unexplained_events', slug: 'unexplained-events', label: 'Unexplained Events', accent: '#818CF8', blurb: 'Cases that refuse to close.' },
  { id: 'cultural_oddities', slug: 'cultural-oddities', label: 'Cultural Oddities', accent: '#F472B6', blurb: 'Rituals that look alien from outside.' },
  { id: 'forgotten_places', slug: 'forgotten-places', label: 'Forgotten Places', accent: '#94A3B8', blurb: 'Locations left behind on purpose.' },
  { id: 'beautiful_weirdness', slug: 'beautiful-weirdness', label: 'Beautiful Weirdness', accent: '#F0ABFC', blurb: 'Strange things that feel gorgeous.' },
  { id: 'unexpected_connections', slug: 'unexpected-connections', label: 'Unexpected Connections', accent: '#34D399', blurb: 'Links nobody asked for — but they fit.' },
];

/** @deprecated Prefer DEMO_INTERESTS */
export const DEMO_TOPICS = DEMO_INTERESTS;
