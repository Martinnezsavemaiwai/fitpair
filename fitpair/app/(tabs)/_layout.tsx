import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Palette, Radius, Font, FontSize, Shadow } from '@/constants/DS';
import { useApp } from '@/context/AppContext';
import { userColor } from '@/constants/DS';
import { House, Dumbbell, Salad, Calendar, ChartBar } from 'lucide-react-native';

function TabIcon({ label, Icon, focused }: { label: string; Icon: any; focused: boolean }) {
  const { activeUser } = useApp();
  const accent = userColor(activeUser);

  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: accent + '18' }]}>
      <Icon size={22} color={focused ? accent : Palette.inkFaint} strokeWidth={focused ? 2.5 : 2} />
      <Text style={[styles.label, { color: focused ? accent : Palette.inkFaint, fontFamily: focused ? Font.displayBold : Font.displayMedium }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index"    options={{ tabBarIcon: ({ focused }) => <TabIcon label="หลัก"   Icon={House}     focused={focused} /> }} />
      <Tabs.Screen name="workout"  options={{ tabBarIcon: ({ focused }) => <TabIcon label="ฝึก"    Icon={Dumbbell}  focused={focused} /> }} />
      <Tabs.Screen name="meal"     options={{ tabBarIcon: ({ focused }) => <TabIcon label="อาหาร"  Icon={Salad}     focused={focused} /> }} />
      <Tabs.Screen name="schedule" options={{ tabBarIcon: ({ focused }) => <TabIcon label="ตาราง"  Icon={Calendar}  focused={focused} /> }} />
      <Tabs.Screen name="progress" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Stats"  Icon={ChartBar}  focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Palette.surface,
    borderTopWidth: 1,
    borderTopColor: Palette.divider,
    height: 82,
    paddingBottom: 16,
    paddingTop: 8,
    ...Shadow.sm,
  },
  iconWrap: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.r2,
  },
  label: {
    fontSize: FontSize.xs,
    letterSpacing: 0.1,
  },
});
