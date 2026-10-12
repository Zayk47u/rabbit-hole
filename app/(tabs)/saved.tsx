import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DemoBanner } from '@/src/components/DemoBanner';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingState } from '@/src/components/LoadingState';
import { useAppState } from '@/src/features/AppState';
import { palette, spacing } from '@/src/lib/theme';

export default function SavedScreen() {
  const router = useRouter();
  const { ready, savedDiscoveries, toggleSave, clearAllBookmarks } = useAppState();

  if (!ready) return <LoadingState label="Loading saved discoveries…" />;

  if (savedDiscoveries.length === 0) {
    return (
      <View style={styles.container}>
        <DemoBanner />
        <EmptyState
          title="Nothing saved yet"
          message="Tap Save on a discovery card to bookmark it locally on this device."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DemoBanner />
      <ScrollView contentContainerStyle={styles.list}>
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
        {savedDiscoveries.map((discovery) => (
          <View key={discovery.id} style={styles.card}>
            <Text style={styles.title}>{discovery.title}</Text>
            <Text style={styles.hook}>{discovery.hook}</Text>
            <View style={styles.row}>
              <Pressable
                onPress={() => router.push(`/explore/${discovery.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Explore ${discovery.title}`}
                style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              >
                <Text style={styles.primaryText}>Open</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  void toggleSave(discovery.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${discovery.title} from saved`}
                style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>Unsave</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.paper },
  list: { padding: spacing.md, gap: spacing.md },
  clearBtn: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  clearText: { color: palette.danger, fontWeight: '700' },
  card: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.paperDeep,
  },
  title: { fontSize: 18, fontWeight: '800', color: palette.ink },
  hook: { color: palette.inkMuted, lineHeight: 20 },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  primary: {
    flex: 1,
    minHeight: 44,
    backgroundColor: palette.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: palette.white, fontWeight: '800' },
  secondary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { color: palette.ink, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
