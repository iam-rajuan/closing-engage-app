import { create } from 'zustand';
import { getNotifications } from '@/services/notifications.service';

interface NotificationState {
  /** Number of unread notifications for the signed-in user */
  unreadCount: number;
  /** Directly set the unread count (used by the notifications screen) */
  setUnreadCount: (count: number) => void;
  /** Fetch notifications and recompute the unread count */
  refreshUnread: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  refreshUnread: async () => {
    try {
      const items = await getNotifications();
      set({ unreadCount: items.filter((item) => !item.read).length });
    } catch {
      // Leave the previous count in place if the fetch fails.
    }
  },
}));
