import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Discovery, DiscoveryConnection } from '@/src/domain/types';
import { RELATION_LABELS } from '@/src/domain/types';
import { palette, spacing } from '@/src/lib/theme';

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
        <Text style={styles.emptyTitle}>Dead end</Text>
        <Text style={styles.emptyBody}>
          No further demo branches from here. Use Back to return along your path.
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
          accessibilityLabel={`${RELATION_LABELS[option.connection.relationType]}: ${option.discovery.title}${option.isLoop ? ', already visited' : ''}`}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
        >
          <Text style={styles.relation}>{RELATION_LABELS[option.connection.relationType]}</Text>
          <Text style={styles.title}>{option.discovery.title}</Text>
          <Text style={styles.explanation}>{option.connection.explanation}</Text>
          {option.isLoop ? <Text style={styles.loop}>Already on your path — opens as a loop</Text> : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  item: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.paperDeep,
    gap: 4,
  },
  pressed: { opacity: 0.9 },
  relation: {
    color: palette.accent,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  explanation: {
    color: palette.inkMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  loop: {
    marginTop: 4,
    color: palette.demo,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    padding: spacing.md,
    backgroundColor: palette.paperDeep,
    borderRadius: 12,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontWeight: '800',
    color: palette.ink,
    fontSize: 16,
  },
  emptyBody: {
    color: palette.inkMuted,
    lineHeight: 20,
  },
});
