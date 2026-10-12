import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DemoBanner } from '@/src/components/DemoBanner';
import { SelectableInterestChip } from '@/src/components/InterestChips';
import { LoadingState } from '@/src/components/LoadingState';
import { DEMO_INTERESTS } from '@/src/data/demo';
import { useAppState } from '@/src/features/AppState';
import { palette, radii, spacing } from '@/src/lib/theme';

const Featured = DEMO_INTERESTS.filter((i) =>
  [
    'internet_mysteries',
    'criminal_psychology',
    'fashion_lore',
    'cults_belief',
    'hidden_history',
    'music_subcultures',
    'future_technology',
    'strange_science',
    'strange_human_behavior',
    'power_manipulation',
    'propaganda',
    'forgotten_places',
    'beautiful_weirdness',
    'unexpected_connections',
    'systems_incentives',
    'catastrophes',
  ].includes(i.id),
);

export default function PreferencesScreen() {
  const router = useRouter();
  const {
    ready,
    preferences,
    toggleInterestSeed,
    resetAllPreferences,
    resetSessionState,
    session,
  } = useAppState();

  if (!ready) return <LoadingState label="Loading interests…" />;

  const selected = new Set(preferences.selectedInterestIds);
  const learnedCount = Object.keys(preferences.interestWeights).length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <DemoBanner />
        <Text style={styles.heading}>Pick anything that sounds interesting</Text>
        <Text style={styles.sub}>
          Tap fast. This is only your cold start — Skip, Save, Dive, and Branch teach the rest.
          The feed adapts in-session from your behavior.
        </Text>
        <Text style={styles.count}>
          {selected.size === 0 ? 'Nothing selected yet' : `${selected.size} selected`}
          {' · '}
          {learnedCount} learned weights · {preferences.seenDiscoveryIds.length} seen
        </Text>

        <View style={styles.grid}>
          {Featured.map((interest) => (
            <SelectableInterestChip
              key={interest.id}
              interestId={interest.id}
              selected={selected.has(interest.id)}
              onPress={() => {
                void toggleInterestSeed(interest.id);
              }}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={resetSessionState}
            accessibilityRole="button"
            accessibilityLabel="Reshuffle deck for this session"
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>
              Reshuffle deck ({session.seenDiscoveryIds.length} seen this session)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void resetAllPreferences();
            }}
            accessibilityRole="button"
            accessibilityLabel="Reset all personalization"
            style={({ pressed }) => [styles.danger, pressed && styles.pressed]}
          >
            <Text style={styles.dangerText}>Reset personalization</Text>
          </Pressable>
          <Text style={styles.hint}>
            Reset clears learned interest weights, connection-style preferences, skip history, and
            seen cards. Saved bookmarks stay.
          </Text>
          <Pressable
            onPress={() => router.push('/debug/ranking')}
            accessibilityRole="button"
            accessibilityLabel="Open developer ranking debug"
            style={({ pressed }) => [styles.dev, pressed && styles.pressed]}
          >
            <Text style={styles.devText}>DEV · Ranking debug</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: palette.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  sub: { color: palette.textMuted, lineHeight: 21 },
  count: { color: palette.accent, fontWeight: '800', fontSize: 13, letterSpacing: 0.4 },
  grid: { gap: spacing.sm },
  actions: { gap: spacing.sm, marginTop: spacing.md },
  primary: {
    minHeight: 48,
    borderRadius: radii.sm,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryText: { fontWeight: '900', color: palette.white, textAlign: 'center' },
  danger: {
    minHeight: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  dangerText: { fontWeight: '800', color: palette.warning },
  hint: { color: palette.textDim, fontSize: 12, lineHeight: 18 },
  dev: {
    minHeight: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  devText: { fontWeight: '800', color: palette.textDim, fontSize: 12, letterSpacing: 0.6 },
  pressed: { opacity: 0.88 },
});
