import { StyleSheet, View } from 'react-native';

import { DiscoveryFeed } from '@/src/features/discover/DiscoveryFeed';
import { useAppState } from '@/src/features/AppState';
import { palette } from '@/src/lib/theme';

export default function DiscoverScreen() {
  const {
    ready,
    error,
    feed,
    isSaved,
    toggleSave,
    recordView,
    rebuildFeed,
  } = useAppState();

  return (
    <View style={styles.container}>
      <DiscoveryFeed
        ready={ready}
        error={error}
        feed={feed}
        isSaved={isSaved}
        onToggleSave={(id) => {
          void toggleSave(id);
        }}
        onView={recordView}
        onRetry={rebuildFeed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.paper,
  },
});
