import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Lightweight gradient stand-in without an extra native dependency.
 * Stacks translucent color washes for atmosphere.
 */
export function LinearGradientish({
  colors,
  style,
}: {
  colors: string[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.base, style, { backgroundColor: colors[0] ?? '#000' }]}>
      {colors.slice(1).map((color, index) => (
        <View
          key={`${color}-${index}`}
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: color,
              opacity: 0.35 + index * 0.2,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
