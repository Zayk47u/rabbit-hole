import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getInterestById } from '@/src/data/demo';
import type { InterestId } from '@/src/domain/types';
import { palette, radii, spacing } from '@/src/lib/theme';

export function InterestChips({
  interestIds,
  limit = 3,
}: {
  interestIds: InterestId[];
  limit?: number;
}) {
  return (
    <View style={styles.row}>
      {interestIds.slice(0, limit).map((id) => {
        const interest = getInterestById(id);
        if (!interest) return null;
        return (
          <View
            key={id}
            style={[styles.chip, { borderColor: interest.accent + '88', backgroundColor: interest.accent + '22' }]}
          >
            <Text style={[styles.chipText, { color: interest.accent }]}>{interest.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function SelectableInterestChip({
  interestId,
  selected,
  onPress,
}: {
  interestId: InterestId;
  selected: boolean;
  onPress: () => void;
}) {
  const interest = getInterestById(interestId);
  if (!interest) return null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${interest.label}${selected ? ', selected' : ''}`}
      style={({ pressed }) => [
        styles.selectChip,
        {
          borderColor: selected ? interest.accent : palette.border,
          backgroundColor: selected ? interest.accent + '33' : palette.surface,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.selectLabel, { color: selected ? palette.text : palette.textMuted }]}>
        {interest.label}
      </Text>
      <Text style={styles.selectBlurb}>{interest.blurb}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipText: { fontSize: 11, fontWeight: '800' },
  selectChip: {
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: 4,
  },
  selectLabel: { fontSize: 16, fontWeight: '800' },
  selectBlurb: { fontSize: 13, color: palette.textDim, lineHeight: 18 },
  pressed: { opacity: 0.88 },
});
