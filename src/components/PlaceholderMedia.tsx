import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@/src/lib/theme';

type Props = {
  color: string;
  title: string;
};

/** Safe local placeholder — no external image rights required. */
export function PlaceholderMedia({ color, title }: Props) {
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[styles.media, { backgroundColor: color }]}
      accessibilityRole="image"
      accessibilityLabel={`Placeholder illustration for ${title}`}
    >
      <Text style={styles.initials}>{initials}</Text>
      <Text style={styles.caption}>Placeholder media</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  media: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: palette.white,
    fontSize: 42,
    fontWeight: '800',
    opacity: 0.9,
  },
  caption: {
    marginTop: spacing.sm,
    color: palette.white,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.85,
  },
});
