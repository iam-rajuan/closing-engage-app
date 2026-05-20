import { api, unwrap } from '@/services/api';
import { NotificationItem } from '@/types/notification';

export async function getNotifications() {
  return unwrap<NotificationItem[]>(api.get('/api/v1/notifications'));
}

export async function markNotificationRead(id: string) {
  const encodedId = encodeURIComponent(id);
  return unwrap<NotificationItem>(api.patch(`/api/v1/notifications/${encodedId}/read`));
}

export async function markAllNotificationsRead() {
  await unwrap<Record<string, never>>(api.patch('/api/v1/notifications/read-all'));
}
