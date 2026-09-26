import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AppProvider } from '../context/AppContext';
import { theme } from '../theme';

export default function RootLayout() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/service-worker.js').catch(() => undefined);
    }
  }, []);

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProvider>
  );
}
