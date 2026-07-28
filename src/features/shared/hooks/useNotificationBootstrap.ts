import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useNotificationStore } from '@/features/shared/notifications.store';
import { getNotifications } from '@/services/notifications.service';
import { getStoredPushToken, registerCurrentDevicePushToken } from '@/services/push-devices.service';
import { scheduleServerNotification } from '@/utils/appNotifications';
import { registerNotificationResponseListener } from '@/utils/fileDownload';

export function useNotificationBootstrap() {
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const pushRegistrationAttemptedRef = useRef<string | null>(null);
  const seededNotificationIdsRef = useRef<Set<string>>(new Set());
  const shouldMirrorServerNotificationsRef = useRef(false);

  useEffect(() => {
    const subscription = registerNotificationResponseListener();
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    pushRegistrationAttemptedRef.current = null;
    seededNotificationIdsRef.current = new Set();
    shouldMirrorServerNotificationsRef.current = false;
  }, [user?.id]);

  useEffect(() => {
    if (!isHydrated || !user?.role) {
      setUnreadCount(0);
      return;
    }

    let active = true;

    const syncNotifications = async () => {
      try {
        const items = await getNotifications();
        if (!active) {
          return;
        }

        const knownIds = seededNotificationIdsRef.current;
        const unreadItems = items.filter((item) => !item.read);
        if (knownIds.size === 0) {
          unreadItems.forEach((item) => knownIds.add(item.id));
        } else {
          const newUnreadItems = unreadItems.filter((item) => !knownIds.has(item.id));
          newUnreadItems.forEach((item) => knownIds.add(item.id));
          if (shouldMirrorServerNotificationsRef.current) {
            for (const item of newUnreadItems) {
              await scheduleServerNotification(item).catch(() => {
                // Keep polling resilient even if local scheduling fails.
              });
            }
          }
        }

        setUnreadCount(items.filter((item) => !item.read).length);
      } catch {
        // Keep the app usable if notification polling fails.
      }
    };

    if (pushRegistrationAttemptedRef.current !== user.id) {
      pushRegistrationAttemptedRef.current = user.id;
      void (async () => {
        const registeredToken = await registerCurrentDevicePushToken().catch(() => null);
        const storedToken = await getStoredPushToken().catch(() => null);
        shouldMirrorServerNotificationsRef.current = !registeredToken && !storedToken;
      })();
    }

    void syncNotifications();

    const interval = setInterval(() => {
      void syncNotifications();
    }, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isHydrated, setUnreadCount, user?.id, user?.role]);
}
