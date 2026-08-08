import { ReactNode, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Bell, CheckCheck, CircleDot, FileText, ShieldCheck, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';
import { useNotificationStore } from '@/features/shared/notifications.store';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import {
  clearAllNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notifications.service';
import { colors, spacing } from '@/theme';
import { NotificationItem } from '@/types/notification';

const notificationMeta: Record<NotificationItem['type'], { icon: ReactNode; bg: string; color: string }> = {
  order: {
    icon: <CircleDot color="#2563eb" size={18} />,
    bg: '#eff6ff',
    color: '#2563eb',
  },
  document: {
    icon: <FileText color="#d97706" size={18} />,
    bg: '#fff7ed',
    color: '#d97706',
  },
  user: {
    icon: <ShieldCheck color="#16a34a" size={18} />,
    bg: '#f0fdf4',
    color: '#16a34a',
  },
  system: {
    icon: <Bell color="#475569" size={18} />,
    bg: '#f8fafc',
    color: '#475569',
  },
};

const normalizeLinkId = (linkId?: string) => (linkId || '').replace(/^#/, '');

export function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: fetchedNotifications, loading, error, reload } = useAsyncResource(() => getNotifications(), [], {
    cacheKey: `notifications:${user?.role ?? 'guest'}`,
  });
  const notifications = useNotificationStore((state) => state.notifications);

  const unreadCount = useMemo(() => (notifications ?? []).filter((item) => !item.read).length, [notifications]);
  const hasNotifications = (notifications?.length ?? 0) > 0;
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const markNotificationReadLocally = useNotificationStore((state) => state.markNotificationReadLocally);
  const markAllNotificationsReadLocally = useNotificationStore((state) => state.markAllNotificationsReadLocally);
  const clearNotificationsLocally = useNotificationStore((state) => state.clearNotificationsLocally);

  useEffect(() => {
    if (fetchedNotifications) setNotifications(fetchedNotifications);
  }, [fetchedNotifications, setNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const openNotification = async (notification: NotificationItem) => {
    try {
      if (!notification.read) {
        await markNotificationRead(notification.id);
        markNotificationReadLocally(notification.id);
      }
    } catch {
      // Keep navigation usable even if mark-read fails.
    }

    const role = user?.role ?? 'company';

    if (notification.type === 'order' && notification.linkId) {
      const orderId = normalizeLinkId(notification.linkId);
      if (role === 'notary') {
        router.push({ pathname: '/notary/assigned/[id]', params: { id: orderId, from: 'notifications' } });
        return;
      }

      router.push({ pathname: '/company/orders/[id]', params: { id: orderId, from: 'notifications' } });
      return;
    }

    if (notification.type === 'document') {
      if (role === 'notary') {
        router.push('/notary/documents');
        return;
      }

      router.push('/company/documents');
      return;
    }
  };

  const handleMarkAll = async () => {
    if (!unreadCount || markingAll || clearingAll) {
      return;
    }

    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      markAllNotificationsReadLocally();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClearAll = async () => {
    if (!notifications?.length || clearingAll || markingAll) {
      return;
    }

    setClearingAll(true);
    try {
      await clearAllNotifications();
      clearNotificationsLocally();
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader back centerTitle title="Notifications" onProfilePress={() => router.push(user?.role === 'notary' ? '/notary/settings' : '/company/settings')} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Bell color={colors.primary} size={20} />
          </View>
          <View style={styles.summaryContent}>
            <AppText weight="bold" style={styles.summaryTitle}>Your inbox</AppText>
            <AppText muted style={styles.summarySubtitle}>
              {unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All notifications are read'}
            </AppText>
          </View>
        </View>
        <View style={styles.summaryActions}>
          <Pressable
            style={({ pressed }) => [
              styles.summaryActionButton,
              styles.markAllButton,
              (!unreadCount || markingAll || clearingAll) && styles.summaryActionDisabled,
              pressed && unreadCount > 0 && !markingAll && !clearingAll ? styles.summaryActionPressed : null,
            ]}
            onPress={() => void handleMarkAll()}
            disabled={!unreadCount || markingAll || clearingAll}
          >
            {markingAll ? (
              <AppText weight="bold" style={styles.summaryActionText} numberOfLines={1} maxFontSizeMultiplier={1.1}>Updating...</AppText>
            ) : (
              <>
                <CheckCheck color={colors.primary} size={15} />
                <AppText weight="bold" style={styles.summaryActionText} numberOfLines={1} maxFontSizeMultiplier={1.1}>Mark all read</AppText>
              </>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.summaryActionButton,
              styles.clearAllButton,
              (!hasNotifications || clearingAll || markingAll) && styles.summaryActionDisabled,
              pressed && hasNotifications && !clearingAll && !markingAll ? styles.summaryActionPressed : null,
            ]}
            onPress={() => void handleClearAll()}
            disabled={!hasNotifications || clearingAll || markingAll}
          >
            {clearingAll ? (
              <AppText weight="bold" style={styles.clearAllButtonText} numberOfLines={1} maxFontSizeMultiplier={1.1}>Clearing...</AppText>
            ) : (
              <>
                <Trash2 color="#b91c1c" size={15} />
                <AppText weight="bold" style={styles.clearAllButtonText} numberOfLines={1} maxFontSizeMultiplier={1.1}>Clear all</AppText>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {loading && !notifications.length ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      <View style={styles.list}>
        {!loading && !error ? (
          notifications?.length ? (
            notifications.map((notification) => {
              const meta = notificationMeta[notification.type] ?? notificationMeta.order;
              return (
                <Pressable key={notification.id} style={[styles.itemCard, !notification.read && styles.itemCardUnread]} onPress={() => void openNotification(notification)}>
                  <View style={[styles.itemIcon, { backgroundColor: meta.bg }]}>
                    {meta.icon}
                  </View>
                  <View style={styles.itemBody}>
                    <View style={styles.itemHeader}>
                      <AppText weight="bold" style={styles.itemTitle}>{notification.title}</AppText>
                      {!notification.read ? <View style={[styles.unreadDot, { backgroundColor: meta.color }]} /> : null}
                    </View>
                    <AppText muted style={styles.itemMessage}>{notification.message}</AppText>
                    <AppText variant="caption" muted style={styles.itemTime}>{notification.time}</AppText>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <EmptyState title="No notifications yet" />
          )
        ) : null}
      </View>
      <View style={{ height: 24 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginTop: 14,
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContent: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    fontSize: 15,
    color: '#0f172a',
    flexShrink: 1,
  },
  summarySubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
  },
  summaryActions: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    alignItems: 'center',
    width: '100%',
  },
  summaryActionButton: {
    flex: 1,
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  markAllButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  clearAllButton: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  summaryActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0a49a8',
  },
  clearAllButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
  },
  summaryActionDisabled: {
    opacity: 0.45,
  },
  summaryActionPressed: {
    transform: [{ scale: 0.98 }],
  },
  list: {
    gap: spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemCardUnread: {
    borderColor: '#bfdbfe',
    backgroundColor: '#f8fbff',
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemMessage: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  itemTime: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
