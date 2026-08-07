import { create } from 'zustand';
import { getNotifications, normalizeNotificationTitle } from '@/services/notifications.service';
import { NotificationItem } from '@/types/notification';

interface NotificationState {
  /** Current notification inbox for the signed-in user */
  notifications: NotificationItem[];
  /** Number of unread notifications for the signed-in user */
  unreadCount: number;
  /** Replace inbox with a freshly fetched server snapshot */
  setNotifications: (notifications: NotificationItem[]) => void;
  /** Insert or update a notification received over Socket.IO */
  upsertNotification: (notification: NotificationItem) => void;
  /** Mark one notification read from a local action or Socket.IO event */
  markNotificationReadLocally: (id: string) => void;
  /** Mark every notification read from a local action or Socket.IO event */
  markAllNotificationsReadLocally: () => void;
  /** Remove one notification from a local action or Socket.IO event */
  deleteNotificationLocally: (id: string) => void;
  /** Clear the local inbox from a local action or Socket.IO event */
  clearNotificationsLocally: () => void;
  /** Directly set the unread count (used by the notifications screen) */
  setUnreadCount: (count: number) => void;
  /** Fetch notifications and recompute the unread count */
  refreshUnread: () => Promise<void>;
}

const unreadCountFor = (notifications: NotificationItem[]) => notifications.filter((item) => !item.read).length;

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => {
    const normalized = notifications.map(normalizeNotificationTitle);
    set({ notifications: normalized, unreadCount: unreadCountFor(normalized) });
  },
  upsertNotification: (notification) =>
    set((state) => {
      const normalizedNotification = normalizeNotificationTitle(notification);
      const existingIndex = state.notifications.findIndex((item) => item.id === normalizedNotification.id);
      const notifications =
        existingIndex >= 0
          ? state.notifications.map((item) => (item.id === normalizedNotification.id ? normalizedNotification : item))
          : [normalizedNotification, ...state.notifications];

      return { notifications, unreadCount: unreadCountFor(notifications) };
    }),
  markNotificationReadLocally: (id) =>
    set((state) => {
      const notifications = state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item));
      return { notifications, unreadCount: unreadCountFor(notifications) };
    }),
  markAllNotificationsReadLocally: () =>
    set((state) => {
      const notifications = state.notifications.map((item) => ({ ...item, read: true }));
      return { notifications, unreadCount: 0 };
    }),
  deleteNotificationLocally: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((item) => item.id !== id);
      return { notifications, unreadCount: unreadCountFor(notifications) };
    }),
  clearNotificationsLocally: () => set({ notifications: [], unreadCount: 0 }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  refreshUnread: async () => {
    try {
      const items = await getNotifications();
      set({ notifications: items, unreadCount: unreadCountFor(items) });
    } catch {
      // Leave the previous count in place if the fetch fails.
    }
  },
}));
