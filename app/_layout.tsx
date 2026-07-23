import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { authStore } from '@/features/auth/auth.state';
import { useNotificationBootstrap } from '@/features/shared/hooks/useNotificationBootstrap';
import { registerUnauthorizedHandler } from '@/services/api';

export default function RootLayout() {
  useNotificationBootstrap();

  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      await authStore.getState().logout();
      router.replace('/auth/login');
    });

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

