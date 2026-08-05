import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useNotificationStore } from '@/features/shared/notifications.store';
import { getNotifications } from '@/services/notifications.service';
import { createNotificationSocket } from '@/services/notification-socket.service';
import { getStoredPushToken, registerCurrentDevicePushToken } from '@/services/push-devices.service';
import { scheduleServerNotification } from '@/utils/appNotifications';
import { registerNotificationResponseListener } from '@/utils/fileDownload';

export function useNotificationBootstrap() {
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const upsertNotification = useNotificationStore((state) => state.upsertNotification);
  const markNotificationReadLocally = useNotificationStore((state) => state.markNotificationReadLocally);
  const markAllNotificationsReadLocally = useNotificationStore((state) => state.markAllNotificationsReadLocally);
  const deleteNotificationLocally = useNotificationStore((state) => state.deleteNotificationLocally);
  const clearNotificationsLocally = useNotificationStore((state) => state.clearNotificationsLocally);
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
      clearNotificationsLocally();
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

        setNotifications(items);
      } catch {
        // Keep the app usable if notification sync fails.
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

    let socketCleanup: (() => void) | null = null;
    void (async () => {
      const socket = await createNotificationSocket();
      if (!active || !socket) {
        socket?.disconnect();
        return;
      }

      socket.on('connect', () => {
        void syncNotifications();
      });
      socket.on('notifications:new', (notification) => {
        seededNotificationIdsRef.current.add(notification.id);
        upsertNotification(notification);
      });
      socket.on('notifications:read', ({ id }) => markNotificationReadLocally(id));
      socket.on('notifications:read-all', markAllNotificationsReadLocally);
      socket.on('notifications:deleted', ({ id }) => deleteNotificationLocally(id));
      socket.on('notifications:cleared', clearNotificationsLocally);
      socket.connect();

      socketCleanup = () => {
        socket.disconnect();
      };
    })();

    return () => {
      active = false;
      socketCleanup?.();
    };
  }, [
    clearNotificationsLocally,
    deleteNotificationLocally,
    isHydrated,
    markAllNotificationsReadLocally,
    markNotificationReadLocally,
    setNotifications,
    upsertNotification,
    user?.id,
    user?.role,
  ]);
}
