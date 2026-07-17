import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNotificationBootstrap } from '@/features/shared/hooks/useNotificationBootstrap';

export default function RootLayout() {
  useNotificationBootstrap();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

