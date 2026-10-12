import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@/src/lib/theme';

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: palette.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: palette.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
