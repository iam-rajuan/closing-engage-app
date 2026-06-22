import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/auth.store';
import { getNotifications } from '@/services/notifications.service';
import { useNotificationStore } from '@/features/shared/notifications.store';
import { showOrderSystemNotification, shouldShowSystemNotification } from '@/utils/appNotifications';
import { registerNotificationResponseListener } from '@/utils/fileDownload';

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const knownNotificationIdsRef = useRef<Set<string>>(new Set());
  const baselineLoadedRef = useRef(false);

  useEffect(() => {
    void hydrate();
    
    // Register listener for opening files on notification clicks
    const subscription = registerNotificationResponseListener();
    return () => {
      subscription.remove();
    };
  }, [hydrate]);

  useEffect(() => {
    knownNotificationIdsRef.current = new Set();
    baselineLoadedRef.current = false;

    if (!isHydrated || !user?.role) {
      setUnreadCount(0);
      return;
    }

    let active = true;

    const syncNotifications = async (notifyForNewItems: boolean) => {
      try {
        const items = await getNotifications();
        if (!active) {
          return;
        }

        setUnreadCount(items.filter((item) => !item.read).length);

        const knownIds = knownNotificationIdsRef.current;
        for (const item of items) {
          const isNew = !knownIds.has(item.id);
          knownIds.add(item.id);

          if (
            notifyForNewItems &&
            isNew &&
            !item.read &&
            shouldShowSystemNotification(item)
          ) {
            await showOrderSystemNotification(item, user.role);
          }
        }

        baselineLoadedRef.current = true;
      } catch {
        // Keep the app usable if notification polling fails.
      }
    };

    void syncNotifications(false);

    const interval = setInterval(() => {
      void syncNotifications(baselineLoadedRef.current);
    }, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isHydrated, setUnreadCount, user?.id, user?.role]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

