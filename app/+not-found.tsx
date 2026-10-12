import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@/src/lib/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Lost' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This corridor does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to Discover</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: palette.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: 14,
    color: palette.accent,
    fontWeight: '800',
  },
});
