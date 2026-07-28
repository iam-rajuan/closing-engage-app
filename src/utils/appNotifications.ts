import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { NotificationItem } from '@/types/notification';
import { UserRole } from '@/types/user';

const DEFAULT_CHANNEL_ID = 'default';
let notificationHandlerConfigured = false;

const normalizeOrderId = (linkId?: string) => (linkId || '').replace(/^#/, '');

export function getNotificationsModule() {
  if (!notificationHandlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerConfigured = true;
  }

  return Notifications;
}

export async function ensureAppNotificationPermission() {
  const Notifications = getNotificationsModule();

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

export function registerAppNotificationResponseListener() {
  let removed = false;
  let subscription: { remove(): void } | null = null;

  Promise.resolve().then(() => {
    if (removed) {
      return;
    }
    const Notifications = getNotificationsModule();
    subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        localUri?: string;
        mimeType?: string;
        fileName?: string;
        notificationType?: string;
        role?: UserRole | 'admin';
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

        if (data.role === 'company') {
          router.push({ pathname: '/company/orders/[id]', params: { id: orderId, from: 'notifications' } });
        }
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

export async function scheduleServerNotification(item: NotificationItem) {
  const Notifications = getNotificationsModule();
  const granted = await ensureAppNotificationPermission();
  if (!granted) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: item.title,
      body: item.message,
      sound: true,
      data: {
        notificationType: item.type,
        role: item.recipientRole,
        linkId: item.linkId,
      },
    },
    trigger: null,
  });

  return true;
}
