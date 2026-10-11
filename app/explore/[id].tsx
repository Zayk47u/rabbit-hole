import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DemoBanner } from '@/src/components/DemoBanner';
import { EmptyState } from '@/src/components/EmptyState';
import { PlaceholderMedia } from '@/src/components/PlaceholderMedia';
import {
  getConnectionsFrom,
  getDiscoveryById,
  wouldCreateImmediateLoop,
} from '@/src/data/demo';
import { useAppState } from '@/src/features/AppState';
import { BranchList, type BranchOption } from '@/src/features/explore/BranchList';
import {
  canGoBack,
  createHistory,
  currentDiscoveryId,
  historyIds,
  popStep,
  pushStep,
  type ExplorationHistory,
} from '@/src/features/explore/navigationHistory';
import { rankBranchTargets } from '@/src/recommendations';
import { palette, spacing } from '@/src/lib/theme';

export default function ExploreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { preferences, session, isSaved, toggleSave, recordView } = useAppState();

  const startId = typeof id === 'string' ? id : id?.[0];
  const [history, setHistory] = useState<ExplorationHistory>(() =>
    createHistory(startId ?? ''),
  );

  const discoveryId = currentDiscoveryId(history) ?? startId;
  const discovery = discoveryId ? getDiscoveryById(discoveryId) : undefined;

  const options: BranchOption[] = useMemo(() => {
    if (!discovery) return [];
    const connections = getConnectionsFrom(discovery.id);
    const targets = connections
      .map((connection) => {
        const target = getDiscoveryById(connection.toDiscoveryId);
        return target ? { connection, discovery: target } : null;
      })
      .filter((x): x is { connection: (typeof connections)[number]; discovery: NonNullable<ReturnType<typeof getDiscoveryById>> } =>
        Boolean(x),
      );

    const ranked = rankBranchTargets(
      targets.map((t) => t.discovery),
      {
        preferences,
        seenDiscoveryIds: new Set(session.seenDiscoveryIds),
        recentTopicIds: session.recentTopicIds,
        focusDiscoveryId: discovery.id,
        outgoingConnections: connections,
      },
      4,
    );

    return ranked.map((scored) => {
      const match = targets.find((t) => t.discovery.id === scored.discovery.id);
      return {
        connection: match!.connection,
        discovery: scored.discovery,
        score: scored.score,
        isLoop: wouldCreateImmediateLoop(historyIds(history), scored.discovery.id),
      };
    });
  }, [discovery, history, preferences, session.recentTopicIds, session.seenDiscoveryIds]);

  if (!startId || !discovery) {
    return (
      <EmptyState
        title="Discovery not found"
        message="This demo id is missing from the sample catalog."
      />
    );
  }

  return (
    <View style={styles.container}>
      <DemoBanner />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.path}>
          Path depth {history.steps.length}
          {history.steps.length > 1 ? ` · from ${history.steps[0]?.discoveryId}` : ''}
        </Text>
        <PlaceholderMedia color={discovery.accentColor} title={discovery.title} />
        <Text style={styles.title}>{discovery.title}</Text>
        <Text style={styles.hook}>{discovery.hook}</Text>
        <Text style={styles.body}>{discovery.body}</Text>

        <View style={styles.row}>
          <Pressable
            onPress={() => {
              void toggleSave(discovery.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={isSaved(discovery.id) ? 'Unsave' : 'Save'}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryText}>{isSaved(discovery.id) ? 'Saved' : 'Save'}</Text>
          </Pressable>
          <Pressable
            disabled={!canGoBack(history)}
            onPress={() => setHistory((h) => popStep(h))}
            accessibilityRole="button"
            accessibilityLabel="Go back in exploration history"
            accessibilityState={{ disabled: !canGoBack(history) }}
            style={({ pressed }) => [
              styles.secondary,
              !canGoBack(history) && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryText}>Back in path</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Branches</Text>
        <BranchList
          options={options}
          onSelect={(option) => {
            recordView(option.discovery.id);
            setHistory((h) => pushStep(h, option.discovery.id, option.connection.id));
          }}
        />

        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close explore screen"
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Text style={styles.closeText}>Close explore</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.paper },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  path: { color: palette.inkMuted, fontSize: 12, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: palette.ink, marginTop: spacing.sm },
  hook: { fontSize: 16, fontWeight: '600', color: palette.ink, lineHeight: 23 },
  body: { fontSize: 15, color: palette.inkMuted, lineHeight: 22 },
  row: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.sm },
  secondary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontWeight: '700', color: palette.ink },
  disabled: { opacity: 0.4 },
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontSize: 18,
    fontWeight: '800',
    color: palette.ink,
  },
  close: {
    marginTop: spacing.lg,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: palette.white, fontWeight: '800' },
  pressed: { opacity: 0.85 },
});
