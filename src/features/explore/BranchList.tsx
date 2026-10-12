import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Discovery, DiscoveryConnection } from '@/src/domain/types';
import { BRANCH_LABELS } from '@/src/domain/types';
import { palette, radii, spacing } from '@/src/lib/theme';

export type BranchOption = {
  connection: DiscoveryConnection;
  discovery: Discovery;
  score: number;
  isLoop: boolean;
};

type Props = {
  options: BranchOption[];
  onSelect: (option: BranchOption) => void;
};

export function BranchList({ options, onSelect }: Props) {
  if (options.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Dead end — for now</Text>
        <Text style={styles.emptyBody}>
          No further demo branches from here. Backtrack and pick another temptation.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {options.map((option) => (
        <Pressable
          key={option.connection.id}
          onPress={() => onSelect(option)}
          accessibilityRole="button"
          accessibilityLabel={`${BRANCH_LABELS[option.connection.branchType]}: ${option.connection.teaser}`}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
        >
          <Text style={styles.relation}>{BRANCH_LABELS[option.connection.branchType]}</Text>
          <Text style={styles.teaser}>{option.connection.teaser}</Text>
          <Text style={styles.title}>{option.discovery.title}</Text>
          {option.isLoop ? (
            <Text style={styles.loop}>Already on your path — opens as a loop</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  item: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 6,
  },
  pressed: { opacity: 0.9, borderColor: palette.accentAlt },
  relation: {
    color: palette.accent,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  teaser: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  title: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  loop: {
    marginTop: 2,
    color: palette.demo,
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    padding: spacing.md,
    backgroundColor: palette.surfaceSoft,
    borderRadius: radii.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  emptyTitle: {
    fontWeight: '900',
    color: palette.text,
    fontSize: 16,
  },
  emptyBody: {
    color: palette.textMuted,
    lineHeight: 20,
  },
});
