import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';

import { EmptyState } from '@/src/components/EmptyState';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import type { Discovery } from '@/src/domain/types';
import { getPrefersReducedMotion } from '@/src/lib/reducedMotion';
import { palette, spacing } from '@/src/lib/theme';

import { DiscoveryCard } from './DiscoveryCard';

type Props = {
  ready: boolean;
  error: string | null;
  feed: Discovery[];
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  onView: (id: string) => void;
  onRetry: () => void;
};

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 70 };

export function DiscoveryFeed({
  ready,
  error,
  feed,
  isSaved,
  onToggleSave,
  onView,
  onRetry,
}: Props) {
  const { height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const listRef = useRef<FlatList<Discovery>>(null);

  useEffect(() => {
    getPrefersReducedMotion().then(setReducedMotion);
  }, []);

  useEffect(() => {
    const current = feed[index];
    if (current) onView(current.id);
  }, [feed, index, onView]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) {
        setIndex(first.index);
      }
    },
    [],
  );

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= feed.length) return;
      listRef.current?.scrollToIndex({
        index: nextIndex,
        animated: !reducedMotion,
      });
      setIndex(nextIndex);
    },
    [feed.length, reducedMotion],
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.y / Math.max(height, 1));
    if (next !== index && next >= 0 && next < feed.length) {
      setIndex(next);
    }
  };

  if (!ready) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (feed.length === 0) {
    return (
      <EmptyState
        title="No discoveries left"
        message="Reset your session from Preferences to reshuffle the demo feed."
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={feed}
        keyExtractor={(item) => item.id}
        pagingEnabled={!reducedMotion}
        disableIntervalMomentum
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
        renderItem={({ item }) => (
          <View style={{ height }}>
            <DiscoveryCard
              discovery={item}
              saved={isSaved(item.id)}
              onSave={() => onToggleSave(item.id)}
              onSkip={() => goTo(Math.min(index + 1, feed.length - 1))}
              reducedMotion={reducedMotion}
            />
          </View>
        )}
      />
      <View style={styles.progress} accessibilityLiveRegion="polite">
        <Text style={styles.progressText}>
          {index + 1} / {feed.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: palette.paper },
  progress: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    backgroundColor: 'rgba(20,33,43,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
