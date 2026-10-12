import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DemoBanner } from '@/src/components/DemoBanner';
import { InterestChips } from '@/src/components/InterestChips';
import { PlaceholderMedia } from '@/src/components/PlaceholderMedia';
import type { Discovery } from '@/src/domain/types';
import { palette, radii, spacing } from '@/src/lib/theme';

type Props = {
  discovery: Discovery;
  saved: boolean;
  reducedMotion: boolean;
  onSkip: () => void;
  onSave: () => void;
  onDive: () => void;
  onBranch: () => void;
};

const SWIPE_THRESHOLD = 110;

export function DiscoveryCard({
  discovery,
  saved,
  reducedMotion,
  onSkip,
  onSave,
  onDive,
  onBranch,
}: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const finish = (kind: 'skip' | 'save') => {
    if (kind === 'skip') onSkip();
    else onSave();
  };

  const pan = Gesture.Pan()
    .enabled(!reducedMotion)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.15;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(420, { duration: 180 }, () => {
          runOnJS(finish)('save');
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-420, { duration: 180 }, () => {
          runOnJS(finish)('skip');
        });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-220, 0, 220], [-10, 0, 10]);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity: interpolate(Math.abs(translateX.value), [0, 280], [1, 0.55]),
    };
  });

  const saveStamp = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [40, 140], [0, 1], 'clamp'),
  }));
  const skipStamp = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-140, -40], [1, 0], 'clamp'),
  }));

  const interestIds = discovery.interests.map((i) => i.interestId);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]} accessibilityLabel={`Discovery: ${discovery.title}`}>
        <Animated.View style={[styles.stamp, styles.saveStamp, saveStamp]} pointerEvents="none">
          <Text style={styles.stampSave}>SAVE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.skipStamp, skipStamp]} pointerEvents="none">
          <Text style={styles.stampSkip}>SKIP</Text>
        </Animated.View>

        <View style={styles.topRow}>
          <DemoBanner />
          <Text style={styles.hint}>{reducedMotion ? 'Use buttons' : '← skip · save →'}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <PlaceholderMedia
            color={discovery.accentColor}
            title={discovery.title}
            motif={discovery.visualMotif}
          />

          <InterestChips interestIds={interestIds} />

          <Text style={styles.title} accessibilityRole="header">
            {discovery.title}
          </Text>
          <Text style={styles.hook}>{discovery.hook}</Text>
          <Text style={styles.brief} numberOfLines={3}>
            {discovery.brief}
          </Text>
          <Text style={styles.whyLabel}>Why this hits</Text>
          <Text style={styles.why} numberOfLines={3}>
            {discovery.whyItMatters}
          </Text>
        </ScrollView>

        <View style={styles.actions}>
          <View style={styles.row}>
            <Pressable
              onPress={onSkip}
              accessibilityRole="button"
              accessibilityLabel="Skip discovery"
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryText}>Skip</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Already saved' : 'Save discovery'}
              accessibilityState={{ selected: saved }}
              style={({ pressed }) => [
                styles.secondaryBtn,
                styles.saveBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.secondaryText, styles.saveText]}>
                {saved ? 'Saved' : 'Save'}
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={onDive}
            accessibilityRole="button"
            accessibilityLabel="Dive deeper into this discovery"
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Dive deeper</Text>
          </Pressable>
          <Pressable
            onPress={onBranch}
            accessibilityRole="button"
            accessibilityLabel="Branch out to related discoveries"
            style={({ pressed }) => [styles.branchBtn, pressed && styles.pressed]}
          >
            <Text style={styles.branchText}>Branch out</Text>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    color: palette.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  scroll: { flex: 1 },
  scrollContent: { gap: spacing.sm, paddingBottom: spacing.sm },
  title: {
    color: palette.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  hook: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  brief: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  whyLabel: {
    marginTop: 2,
    color: palette.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  why: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  secondaryBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bgElevated,
  },
  saveBtn: {
    borderColor: 'rgba(61,220,151,0.45)',
    backgroundColor: 'rgba(61,220,151,0.1)',
  },
  secondaryText: { color: palette.text, fontWeight: '800' },
  saveText: { color: palette.save },
  primaryBtn: {
    minHeight: 48,
    borderRadius: radii.sm,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: palette.white, fontWeight: '900', fontSize: 15 },
  branchBtn: {
    minHeight: 46,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.accentAlt,
    backgroundColor: palette.accentAltSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchText: { color: palette.text, fontWeight: '800' },
  pressed: { opacity: 0.88 },
  stamp: {
    position: 'absolute',
    top: 56,
    zIndex: 5,
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  saveStamp: {
    left: 18,
    borderColor: palette.save,
    transform: [{ rotate: '-12deg' }],
  },
  skipStamp: {
    right: 18,
    borderColor: palette.skip,
    transform: [{ rotate: '12deg' }],
  },
  stampSave: { color: palette.save, fontWeight: '900', letterSpacing: 2 },
  stampSkip: { color: palette.textMuted, fontWeight: '900', letterSpacing: 2 },
});
