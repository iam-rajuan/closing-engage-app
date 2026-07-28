import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { authStore } from '@/features/auth/auth.state';
import { useAuthStore } from '@/features/auth/auth.store';
import { useNotificationBootstrap } from '@/features/shared/hooks/useNotificationBootstrap';
import { registerUnauthorizedHandler } from '@/services/api';

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  useNotificationBootstrap();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      await authStore.getState().logout();
      router.replace('/auth/login');
    });

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, []);

  if (!isHydrated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <ScreenContainer>
            <LoadingState />
          </ScreenContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

