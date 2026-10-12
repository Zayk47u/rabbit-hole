import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DemoBanner } from '@/src/components/DemoBanner';
import { EmptyState } from '@/src/components/EmptyState';
import { InterestChips } from '@/src/components/InterestChips';
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
import { palette, radii, spacing } from '@/src/lib/theme';

export default function ExploreScreen() {
  const { id, focus } = useLocalSearchParams<{ id: string; focus?: string }>();
  const router = useRouter();
  const { preferences, session, isSaved, toggleSave, reactToCard } = useAppState();

  const startId = typeof id === 'string' ? id : id?.[0];
  const scrollRef = useRef<ScrollView>(null);
  const routeSeed = startId ?? '';
  const [history, setHistory] = useState<ExplorationHistory>(() => createHistory(routeSeed));
  const [historySeed, setHistorySeed] = useState(routeSeed);

  if (historySeed !== routeSeed) {
    setHistorySeed(routeSeed);
    setHistory(createHistory(routeSeed));
  }

  const discoveryId = currentDiscoveryId(history) ?? startId;
  const discovery = discoveryId ? getDiscoveryById(discoveryId) : undefined;

  useEffect(() => {
    if (focus === 'branches') {
      const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 160);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [focus, discoveryId]);

  const options: BranchOption[] = useMemo(() => {
    if (!discovery) return [];
    const connections = getConnectionsFrom(discovery.id);
    const targets = connections
      .map((connection) => {
        const target = getDiscoveryById(connection.toDiscoveryId);
        return target ? { connection, discovery: target } : null;
      })
      .filter(
        (
          x,
        ): x is {
          connection: (typeof connections)[number];
          discovery: NonNullable<ReturnType<typeof getDiscoveryById>>;
        } => Boolean(x),
      );

    const ranked = rankBranchTargets(
      targets.map((t) => t.discovery),
      {
        preferences,
        seenDiscoveryIds: new Set(session.seenDiscoveryIds),
        recentInterestIds: session.recentInterestIds,
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
  }, [discovery, history, preferences, session.recentInterestIds, session.seenDiscoveryIds]);

  if (!startId || !discovery) {
    return (
      <EmptyState
        title="This hole collapsed"
        message="That demo id is missing from the sample catalog."
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <DemoBanner />
        <Text style={styles.path}>
          Depth {history.steps.length}
          {history.steps.length > 1 ? ' · still falling' : ' · entry point'}
        </Text>
        <PlaceholderMedia
          color={discovery.accentColor}
          title={discovery.title}
          motif={discovery.visualMotif}
        />
        <InterestChips interestIds={discovery.interests.map((i) => i.interestId)} />
        <Text style={styles.title}>{discovery.title}</Text>
        <Text style={styles.hook}>{discovery.hook}</Text>
        <Text style={styles.body}>{discovery.deepDive}</Text>
        <Text style={styles.whyLabel}>Why it matters</Text>
        <Text style={styles.why}>{discovery.whyItMatters}</Text>

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

        <Text style={styles.section}>Where could this go?</Text>
        <Text style={styles.sectionSub}>Pick the temptation you can’t ignore.</Text>
        <BranchList
          options={options}
          onSelect={(option) => {
            void reactToCard(option.discovery.id, 'branch', {
              branchType: option.connection.branchType,
              fromDiscoveryId: discovery.id,
            });
            setHistory((h) => pushStep(h, option.discovery.id, option.connection.id));
          }}
        />

        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close explore screen"
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Text style={styles.closeText}>Return to Discover</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  path: { color: palette.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: palette.text,
    marginTop: spacing.xs,
    letterSpacing: -0.4,
  },
  hook: { fontSize: 16, fontWeight: '700', color: palette.text, lineHeight: 23 },
  body: { fontSize: 15, color: palette.textMuted, lineHeight: 22 },
  whyLabel: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  why: { color: palette.textMuted, lineHeight: 20 },
  row: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.sm },
  secondary: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  secondaryText: { fontWeight: '800', color: palette.text },
  disabled: { opacity: 0.35 },
  section: {
    marginTop: spacing.md,
    fontSize: 20,
    fontWeight: '900',
    color: palette.text,
  },
  sectionSub: { color: palette.textMuted, marginBottom: spacing.xs },
  close: {
    marginTop: spacing.lg,
    minHeight: 48,
    borderRadius: radii.sm,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: palette.white, fontWeight: '900' },
  pressed: { opacity: 0.88 },
});
