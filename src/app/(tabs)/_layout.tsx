import { Tabs } from 'expo-router';
import { Compass, MoonStar, NotebookPen } from 'lucide-react-native';
import { theme } from '../../theme';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.accent,
      tabBarInactiveTintColor: theme.muted,
      tabBarStyle: {
        backgroundColor: theme.surface,
        borderTopColor: theme.border,
        height: 78,
        paddingTop: 10,
        paddingBottom: 16,
      },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Ciclo', tabBarIcon: ({ color }) => <MoonStar size={19} color={color} /> }} />
      <Tabs.Screen name="oracle" options={{ title: 'Decisiones', tabBarIcon: ({ color }) => <Compass size={19} color={color} /> }} />
      <Tabs.Screen name="journal" options={{ title: 'Diario', tabBarIcon: ({ color }) => <NotebookPen size={19} color={color} /> }} />
    </Tabs>
  );
}
