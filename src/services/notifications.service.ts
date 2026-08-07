import { api, unwrap } from '@/services/api';
import { NotificationItem } from '@/types/notification';

export const normalizeNotificationTitle = (item: NotificationItem): NotificationItem => {
  if (item.type === 'order' && item.title === 'Open Order Available') {
    return { ...item, title: 'Signing Available' };
  }

  return item;
};

export async function getNotifications() {
  const notifications = await unwrap<NotificationItem[]>(api.get('/api/v1/notifications'));
  return notifications.map(normalizeNotificationTitle);
}

export async function markNotificationRead(id: string) {
  const encodedId = encodeURIComponent(id);
  const notification = await unwrap<NotificationItem>(api.patch(`/api/v1/notifications/${encodedId}/read`));
  return normalizeNotificationTitle(notification);
}

export async function markAllNotificationsRead() {
  await unwrap<Record<string, never>>(api.patch('/api/v1/notifications/read-all'));
}

export async function clearAllNotifications() {
  await unwrap<Record<string, never>>(api.delete('/api/v1/notifications/clear-all'));
}
