import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@/src/lib/theme';

export function DemoBanner() {
  return (
    <View style={styles.banner} accessibilityRole="text" accessibilityLabel="Demonstration content">
      <Text style={styles.text}>DEMO CONTENT — not published production material</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: palette.demoSoft,
    borderBottomWidth: 1,
    borderBottomColor: palette.demo,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    color: palette.demo,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});
