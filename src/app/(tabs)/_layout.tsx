import { Tabs } from 'expo-router';

import { DashboardIcon, HomeIcon, ScheduleIcon, SettingsIcon } from '@/components/icons/TabBarIcons';
import { Colors, Sizes, Typography } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: Typography.tabLabel,
        tabBarStyle: { height: Sizes.tabBar.height, paddingTop: 8, paddingBottom: 24 },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => <HomeIcon active={focused} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: '스케줄',
          tabBarIcon: ({ focused }) => <ScheduleIcon active={focused} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '대시보드',
          tabBarIcon: ({ focused }) => <DashboardIcon active={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ focused }) => <SettingsIcon active={focused} />,
        }}
      />
    </Tabs>
  );
}
