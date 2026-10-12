import { StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@/src/lib/theme';

export function DemoBanner() {
  return (
    <View style={styles.banner} accessibilityRole="text" accessibilityLabel="Demonstration content">
      <Text style={styles.text}>DEMO · UNVERIFIED SAMPLE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: 'flex-start',
    backgroundColor: palette.demoSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.35)',
  },
  text: {
    color: palette.demo,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
