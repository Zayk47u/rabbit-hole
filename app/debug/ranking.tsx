import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

import { DemoBanner } from '@/src/components/DemoBanner';
import { LoadingState } from '@/src/components/LoadingState';
import { useAppState } from '@/src/features/AppState';
import { BRANCH_LABELS } from '@/src/domain/types';
import { EXPLORATION_MIX, INTERACTION_WEIGHTS, SCORE_WEIGHTS, explainScoredDiscovery } from '@/src/recommendations';
import { NEUTRAL_WEIGHT } from '@/src/recommendations/config';
import { palette, radii, spacing } from '@/src/lib/theme';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/** Development-only ranking inspector. Not linked from consumer tabs. */
export default function RankingDebugScreen() {
  const { ready, preferences, currentScored, session } = useAppState();

  if (!ready) return <LoadingState label="Loading profile…" />;

  const snapshot = currentScored
    ? explainScoredDiscovery(currentScored, preferences)
    : null;

  const interestEntries = Object.entries(preferences.interestWeights)
    .map(([id, w]) => ({ id, w: w ?? NEUTRAL_WEIGHT }))
    .sort((a, b) => b.w - a.w);

  const branchEntries = Object.entries(preferences.branchTypeWeights)
    .map(([id, w]) => ({
      id,
      label: BRANCH_LABELS[id as keyof typeof BRANCH_LABELS] ?? id,
      w: w ?? NEUTRAL_WEIGHT,
    }))
    .sort((a, b) => b.w - a.w);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'DEV · Ranking', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.content}>
        <DemoBanner />
        <Text style={styles.badge}>DEVELOPER ONLY</Text>
        <Text style={styles.heading}>Adaptive ranking debug</Text>
        <Text style={styles.sub}>
          Inspect learned weights and why the current Discover card scored the way it did.
          Not part of the consumer product UI.
        </Text>

        <Text style={styles.section}>Current card</Text>
        {snapshot ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{snapshot.title}</Text>
            <Row label="Score" value={snapshot.score.toFixed(4)} />
            <Row label="Bucket" value={snapshot.bucket} />
            <Row label="Topic relevance" value={snapshot.factors.topicRelevance.toFixed(3)} />
            <Row label="Connection style" value={snapshot.factors.connectionStyle.toFixed(3)} />
            <Row label="Novelty" value={snapshot.factors.novelty.toFixed(3)} />
            <Row label="Repetition (higher=less penalty)" value={snapshot.factors.repetitionPenalty.toFixed(3)} />
            <Row label="Diversity" value={snapshot.factors.diversity.toFixed(3)} />
            <Row label="Editorial quality" value={snapshot.factors.editorialQuality.toFixed(3)} />
            <Text style={styles.reasonsTitle}>Reasons</Text>
            {snapshot.reasons.map((r) => (
              <Text key={r} style={styles.reason}>
                · {r}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>No current card — reshuffle Discover first.</Text>
        )}

        <Text style={styles.section}>Session</Text>
        <View style={styles.card}>
          <Row label="Pick count" value={String(session.pickCount)} />
          <Row label="Last bucket" value={session.lastBucket ?? '—'} />
          <Row label="Seen (session)" value={String(session.seenDiscoveryIds.length)} />
          <Row label="Seen (profile)" value={String(preferences.seenDiscoveryIds.length)} />
        </View>

        <Text style={styles.section}>Interest weights (learned)</Text>
        <View style={styles.card}>
          {interestEntries.length === 0 ? (
            <Text style={styles.muted}>Neutral — no learned weights yet.</Text>
          ) : (
            interestEntries.map((e) => (
              <Row key={e.id} label={e.id} value={e.w.toFixed(3)} />
            ))
          )}
        </View>

        <Text style={styles.section}>Connection-style weights</Text>
        <View style={styles.card}>
          {branchEntries.length === 0 ? (
            <Text style={styles.muted}>Neutral — no branch preferences yet.</Text>
          ) : (
            branchEntries.map((e) => (
              <Row key={e.id} label={e.label} value={e.w.toFixed(3)} />
            ))
          )}
        </View>

        <Text style={styles.section}>Configured mix</Text>
        <View style={styles.card}>
          <Row label="Exploit" value={`${EXPLORATION_MIX.exploit * 100}%`} />
          <Row label="Adjacent" value={`${EXPLORATION_MIX.adjacent * 100}%`} />
          <Row label="Wildcard" value={`${EXPLORATION_MIX.wildcard * 100}%`} />
          <Row label="Skip Δ" value={String(INTERACTION_WEIGHTS.skip.interestDelta)} />
          <Row label="Save Δ" value={String(INTERACTION_WEIGHTS.save.interestDelta)} />
          <Row label="Dive Δ" value={String(INTERACTION_WEIGHTS.dive.interestDelta)} />
          <Row label="Branch Δ" value={String(INTERACTION_WEIGHTS.branch.interestDelta)} />
          <Row label="Branch-type Δ" value={String(INTERACTION_WEIGHTS.branch.branchTypeDelta)} />
          <Row label="Topic weight" value={String(SCORE_WEIGHTS.topicRelevance)} />
          <Row label="Style weight" value={String(SCORE_WEIGHTS.connectionStyle)} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  badge: {
    alignSelf: 'flex-start',
    color: palette.warning,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    color: palette.text,
    letterSpacing: -0.4,
  },
  sub: { color: palette.textMuted, lineHeight: 20, marginBottom: spacing.sm },
  section: {
    marginTop: spacing.md,
    color: palette.accent,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: 6,
  },
  cardTitle: { color: palette.text, fontWeight: '800', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  rowLabel: { color: palette.textMuted, flex: 1, fontSize: 13 },
  rowValue: { color: palette.text, fontWeight: '700', fontSize: 13 },
  reasonsTitle: { color: palette.text, fontWeight: '800', marginTop: spacing.sm },
  reason: { color: palette.textMuted, fontSize: 12, lineHeight: 18 },
  muted: { color: palette.textDim, fontStyle: 'italic' },
});
