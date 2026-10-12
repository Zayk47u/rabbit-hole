import { LinearGradientish } from '@/src/components/LinearGradientish';
import { palette, radii, spacing } from '@/src/lib/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  color: string;
  title: string;
  motif: string;
  compact?: boolean;
};

export function PlaceholderMedia({ color, title, motif, compact }: Props) {
  return (
    <View
      style={[styles.wrap, compact && styles.compact, { borderColor: color + '55' }]}
      accessibilityRole="image"
      accessibilityLabel={`Visual for ${title}`}
    >
      <LinearGradientish
        colors={['#0B0C0F', color + 'CC', color]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.veil} />
      <Text style={styles.motif}>{motif}</Text>
      <Text style={styles.caption}>Atmospheric placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 16 / 11,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  compact: {
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
  },
  veil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  motif: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  caption: {
    marginTop: 4,
    color: 'rgba(243,240,232,0.72)',
    fontSize: 11,
    fontWeight: '600',
  },
});
