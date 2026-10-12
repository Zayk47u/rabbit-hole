import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radii, spacing } from '@/src/lib/theme';

type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.title}>Something glitched</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: palette.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.accent,
  },
  message: {
    fontSize: 15,
    color: palette.textMuted,
    textAlign: 'center',
  },
  button: {
    backgroundColor: palette.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
  },
  pressed: { opacity: 0.85 },
  buttonText: {
    color: palette.white,
    fontWeight: '800',
  },
});
