import { StyleSheet, View } from 'react-native';

import { DiscoveryDeck } from '@/src/features/discover/DiscoveryDeck';
import { palette } from '@/src/lib/theme';

export default function DiscoverScreen() {
  return (
    <View style={styles.container}>
      <DiscoveryDeck />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
});
