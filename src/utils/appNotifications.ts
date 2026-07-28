import { router } from 'expo-router';
import { Platform } from 'react-native';
import { NotificationItem } from '@/types/notification';
import { UserRole } from '@/types/user';

const DEFAULT_CHANNEL_ID = 'default';
let notificationsUnavailableLogged = false;

type NotificationsModule = typeof import('expo-notifications');

const normalizeOrderId = (linkId?: string) => (linkId || '').replace(/^#/, '');

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  try {
    return await import('expo-notifications');
  } catch (error) {
    if (__DEV__ && !notificationsUnavailableLogged) {
      notificationsUnavailableLogged = true;
      console.warn('expo-notifications is unavailable in the current runtime; notification features are disabled.', error);
    }
    return null;
  }
}

export async function ensureAppNotificationPermission() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: 'Closing Engage Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 150, 250],
      lightColor: '#2167d8',
    });
  }

  return true;
}

export function shouldShowSystemNotification(notification: NotificationItem) {
  return notification.type === 'order' && notification.title.trim().toLowerCase() === 'open order available';
}

export async function showOrderSystemNotification(notification: NotificationItem, role: UserRole) {
  const granted = await ensureAppNotificationPermission();
  if (!granted) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.message,
      sound: true,
      data: {
        notificationType: notification.type,
        role,
        linkId: notification.linkId,
      },
    },
    trigger: null,
  });
}

export function registerAppNotificationResponseListener() {
  let removed = false;
  let subscription: { remove(): void } | null = null;

  void getNotificationsModule().then((Notifications) => {
    if (!Notifications || removed) {
      return;
    }

    subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        localUri?: string;
        mimeType?: string;
        fileName?: string;
        notificationType?: string;
        role?: UserRole;
        linkId?: string;
      };

      if (data && typeof data.localUri === 'string') {
        return;
      }

      if (data.notificationType === 'order' && typeof data.linkId === 'string') {
        const orderId = normalizeOrderId(data.linkId);
        if (data.role === 'notary') {
          router.push({ pathname: '/notary/assigned/[id]', params: { id: orderId, from: 'notifications' } });
          return;
        }

        router.push({ pathname: '/company/orders/[id]', params: { id: orderId, from: 'notifications' } });
      }
    });
  });

  return {
    remove() {
      removed = true;
      subscription?.remove();
    },
  };
}
