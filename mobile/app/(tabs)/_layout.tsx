import { Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, FontSize } from '@/constants/theme'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TABS: { name: string; label: string; icon: IoniconsName; activeIcon: IoniconsName }[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'workouts', label: 'Workouts', icon: 'barbell-outline', activeIcon: 'barbell' },
  { name: 'progress', label: 'Progress', icon: 'bar-chart-outline', activeIcon: 'bar-chart' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
]

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  tabItem: { paddingTop: 4 },
})
