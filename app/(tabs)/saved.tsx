import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DemoBanner } from '@/src/components/DemoBanner';
import { EmptyState } from '@/src/components/EmptyState';
import { InterestChips } from '@/src/components/InterestChips';
import { LoadingState } from '@/src/components/LoadingState';
import { PlaceholderMedia } from '@/src/components/PlaceholderMedia';
import { useAppState } from '@/src/features/AppState';
import { palette, radii, spacing } from '@/src/lib/theme';

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ready, savedDiscoveries, toggleSave, clearAllBookmarks } = useAppState();

  if (!ready) return <LoadingState label="Opening your library…" />;

  if (savedDiscoveries.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerPad}>
          <DemoBanner />
        </View>
        <EmptyState
          title="Your obsession shelf is empty"
          message="Swipe right or tap Save when something hooks you. It lands here."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.list, { paddingBottom: spacing.xl + insets.bottom }]}
      >
        <View style={styles.top}>
          <DemoBanner />
          <Text style={styles.heading}>Saved rabbit holes</Text>
          <Text style={styles.sub}>A private shelf of things you refused to forget.</Text>
          <Pressable
            onPress={() => {
              void clearAllBookmarks();
            }}
            accessibilityRole="button"
            accessibilityLabel="Clear all bookmarks"
            style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
          >
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        </View>

        {savedDiscoveries.map((discovery) => (
          <View key={discovery.id} style={styles.card}>
            <PlaceholderMedia
              color={discovery.accentColor}
              title={discovery.title}
              motif={discovery.visualMotif}
              compact
            />
            <InterestChips interestIds={discovery.interests.map((i) => i.interestId)} />
            <Text style={styles.title}>{discovery.title}</Text>
            <Text style={styles.hook}>{discovery.hook}</Text>
            <View style={styles.row}>
              <Pressable
                onPress={() => router.push(`/explore/${discovery.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${discovery.title}`}
                style={({ pressed }) => [styles.openPill, pressed && styles.pressed]}
              >
                <Text style={styles.openText}>Reopen</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  void toggleSave(discovery.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${discovery.title} from saved`}
                style={({ pressed }) => [styles.unsave, pressed && styles.pressed]}
              >
                <Text style={styles.unsaveText}>Unsave</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  headerPad: { padding: spacing.md },
  scroll: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.md },
  top: { gap: spacing.sm, marginBottom: spacing.sm },
  heading: { color: palette.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  sub: { color: palette.textMuted, lineHeight: 20 },
  clearBtn: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  clearText: { color: palette.accent, fontWeight: '800' },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  title: { fontSize: 18, fontWeight: '900', color: palette.text },
  hook: { color: palette.textMuted, lineHeight: 20 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, alignItems: 'center' },
  openPill: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.sm,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openText: { color: palette.white, fontWeight: '900' },
  unsave: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsaveText: { color: palette.textMuted, fontWeight: '700' },
  pressed: { opacity: 0.88 },
});
