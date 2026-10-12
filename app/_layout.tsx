import { useFonts } from 'expo-font';
import {
  DarkTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppStateProvider } from '@/src/features/AppState';
import { palette } from '@/src/lib/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.bg,
    card: palette.bgElevated,
    primary: palette.accent,
    text: palette.text,
    border: palette.border,
    notification: palette.accent,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
      <AppStateProvider>
        <ThemeProvider value={AppTheme}>
          <StatusBar style="light" />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="explore/[id]"
              options={{
                title: 'Rabbit hole',
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor: palette.bgElevated },
                headerTintColor: palette.text,
              }}
            />
          </Stack>
        </ThemeProvider>
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}
