import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { useAppState } from '@/src/features/AppState';
import { getPrefersReducedMotion } from '@/src/lib/reducedMotion';
import { palette, spacing } from '@/src/lib/theme';

import { DiscoveryCard } from './DiscoveryCard';

async function buzz(style: Haptics.ImpactFeedbackStyle) {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(style);
  } catch {
    // ignore
  }
}

export function DiscoveryDeck() {
  const router = useRouter();
  const {
    ready,
    error,
    currentDiscovery,
    feed,
    deckIndex,
    isSaved,
    reactToCard,
    rebuildFeed,
  } = useAppState();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    getPrefersReducedMotion().then(setReducedMotion);
  }, []);

  if (!ready) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={rebuildFeed} />;

  if (!currentDiscovery || deckIndex >= feed.length) {
    return (
      <EmptyState
        title="You’ve reached the edge"
        message="Reset your session from Interests to reshuffle the demo rabbit holes."
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {deckIndex + 1} / {feed.length}
        </Text>
      </View>
      <DiscoveryCard
        key={currentDiscovery.id}
        discovery={currentDiscovery}
        saved={isSaved(currentDiscovery.id)}
        reducedMotion={reducedMotion}
        onSkip={() => {
          void buzz(Haptics.ImpactFeedbackStyle.Light);
          void reactToCard(currentDiscovery.id, 'skip');
        }}
        onSave={() => {
          void buzz(Haptics.ImpactFeedbackStyle.Medium);
          void reactToCard(currentDiscovery.id, 'save');
        }}
        onDive={() => {
          void reactToCard(currentDiscovery.id, 'dive');
          router.push(`/explore/${currentDiscovery.id}`);
        }}
        onBranch={() => {
          void reactToCard(currentDiscovery.id, 'branch');
          router.push(`/explore/${currentDiscovery.id}?focus=branches`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: palette.bg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  progress: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
    backgroundColor: palette.surfaceSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
});
