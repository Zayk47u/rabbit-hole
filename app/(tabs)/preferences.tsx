import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DemoBanner } from '@/src/components/DemoBanner';
import { LoadingState } from '@/src/components/LoadingState';
import { DEMO_TOPICS } from '@/src/data/demo';
import { useAppState } from '@/src/features/AppState';
import { palette, spacing } from '@/src/lib/theme';

const LEVELS: { label: string; weight: number }[] = [
  { label: 'Less', weight: 0.2 },
  { label: 'Neutral', weight: 0.5 },
  { label: 'More', weight: 0.85 },
];

export default function PreferencesScreen() {
  const {
    ready,
    preferences,
    setTopicPreference,
    resetAllPreferences,
    resetSessionState,
    session,
  } = useAppState();

  if (!ready) return <LoadingState label="Loading preferences…" />;

  return (
    <View style={styles.container}>
      <DemoBanner />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Topic preferences</Text>
        <Text style={styles.sub}>
          Optional controls that reshape the deterministic demo ranking. Nothing is sent to a
          server in this milestone.
        </Text>

        {DEMO_TOPICS.map((topic) => {
          const current = preferences.topicWeights[topic.id] ?? 0.5;
          return (
            <View key={topic.id} style={styles.topicRow}>
              <Text style={styles.topicLabel}>{topic.label}</Text>
              <View style={styles.levels}>
                {LEVELS.map((level) => {
                  const selected = Math.abs(current - level.weight) < 0.05;
                  return (
                    <Pressable
                      key={level.label}
                      onPress={() => {
                        void setTopicPreference(topic.id, level.weight);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${topic.label} ${level.label}`}
                      style={({ pressed }) => [
                        styles.levelBtn,
                        selected && styles.levelSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.levelText, selected && styles.levelTextSelected]}>
                        {level.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              void resetAllPreferences();
            }}
            accessibilityRole="button"
            accessibilityLabel="Reset topic preferences"
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryText}>Reset preferences</Text>
          </Pressable>
          <Pressable
            onPress={resetSessionState}
            accessibilityRole="button"
            accessibilityLabel="Reset session history and reshuffle feed"
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Reset session ({session.seenDiscoveryIds.length} seen)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.paper },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  heading: { fontSize: 22, fontWeight: '800', color: palette.ink },
  sub: { color: palette.inkMuted, lineHeight: 21 },
  topicRow: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.paperDeep,
  },
  topicLabel: { fontWeight: '700', color: palette.ink, fontSize: 16 },
  levels: { flexDirection: 'row', gap: spacing.sm },
  levelBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.paperDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelSelected: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  levelText: { color: palette.inkMuted, fontWeight: '600', fontSize: 13 },
  levelTextSelected: { color: palette.accent },
  actions: { gap: spacing.sm, marginTop: spacing.md },
  secondary: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontWeight: '700', color: palette.ink },
  primary: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryText: { fontWeight: '800', color: palette.white, textAlign: 'center' },
  pressed: { opacity: 0.85 },
});
