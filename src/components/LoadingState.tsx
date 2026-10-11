import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@/src/lib/theme';

export function LoadingState({ label = 'Loading discoveries…' }: { label?: string }) {
  return (
    <View style={styles.wrap} accessibilityLabel={label}>
      <ActivityIndicator size="large" color={palette.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: palette.paper,
  },
  label: {
    color: palette.inkMuted,
    fontSize: 15,
  },
});
