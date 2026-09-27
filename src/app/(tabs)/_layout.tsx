import { Stack } from 'expo-router';
import { theme } from '../../theme';

export default function SectionLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.background },
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="oracle" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="planets" />
      <Stack.Screen name="natal" />
    </Stack>
  );
}
