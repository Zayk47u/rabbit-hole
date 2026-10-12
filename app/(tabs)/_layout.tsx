import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { palette } from '@/src/lib/theme';

function TabIcon(props: {
  name: ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={20} style={{ marginBottom: -1 }} name={props.name} color={props.color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.textDim,
        headerShown: useClientOnlyValue(false, true),
        headerStyle: { backgroundColor: palette.bgElevated },
        headerTintColor: palette.text,
        tabBarStyle: {
          backgroundColor: palette.bgElevated,
          borderTopColor: palette.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabIcon name="compass" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <TabIcon name="bookmark" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          title: 'Interests',
          tabBarIcon: ({ color }) => <TabIcon name="bolt" color={String(color)} />,
        }}
      />
    </Tabs>
  );
}
