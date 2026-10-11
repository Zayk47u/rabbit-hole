import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DemoBanner } from '@/src/components/DemoBanner';
import { PlaceholderMedia } from '@/src/components/PlaceholderMedia';
import { DEMO_TOPICS } from '@/src/data/demo';
import type { Discovery } from '@/src/domain/types';
import { palette, spacing } from '@/src/lib/theme';

type Props = {
  discovery: Discovery;
  saved: boolean;
  onSave: () => void;
  onSkip: () => void;
  reducedMotion: boolean;
};

function minutesLabel(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} min`;
}

export function DiscoveryCard({ discovery, saved, onSave, onSkip, reducedMotion }: Props) {
  const topicLabels = discovery.topics
    .map((t) => DEMO_TOPICS.find((topic) => topic.id === t.topicId)?.label)
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.card} accessibilityLabel={`Discovery: ${discovery.title}`}>
      <DemoBanner />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        accessible={false}
      >
        <PlaceholderMedia color={discovery.accentColor} title={discovery.title} />
        <Text style={styles.kicker}>
          {topicLabels} · {minutesLabel(discovery.readingSeconds)}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {discovery.title}
        </Text>
        <Text style={styles.hook}>{discovery.hook}</Text>
        <Text style={styles.body}>{discovery.body}</Text>
        <View style={styles.sources}>
          <Text style={styles.sourcesTitle}>Sources (demo placeholders)</Text>
          {discovery.sources.map((source) => (
            <Text key={source.id} style={styles.sourceItem}>
              • {source.title} — {source.note}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip to next discovery"
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>{reducedMotion ? 'Next' : 'Skip'}</Text>
        </Pressable>
        <Pressable
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove bookmark' : 'Save discovery'}
          accessibilityState={{ selected: saved }}
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>{saved ? 'Saved' : 'Save'}</Text>
        </Pressable>
        <Link href={`/explore/${discovery.id}`} asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Explore related discoveries"
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Explore</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  kicker: {
    marginTop: spacing.sm,
    color: palette.inkMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: palette.ink,
  },
  hook: {
    fontSize: 17,
    lineHeight: 24,
    color: palette.ink,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.inkMuted,
  },
  sources: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: palette.paperDeep,
    borderRadius: 10,
    gap: spacing.xs,
  },
  sourcesTitle: {
    fontWeight: '700',
    color: palette.ink,
    marginBottom: spacing.xs,
  },
  sourceItem: {
    color: palette.inkMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.paperDeep,
    backgroundColor: palette.white,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: palette.ink,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1.2,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: palette.white,
    fontWeight: '800',
  },
  pressed: { opacity: 0.85 },
});
