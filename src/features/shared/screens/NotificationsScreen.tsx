import { ReactNode, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Bell, CheckCheck, CircleDot, FileText, ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/notifications.service';
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
};

const normalizeLinkId = (linkId?: string) => (linkId || '').replace(/^#/, '');

export function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: notifications, loading, error, reload } = useAsyncResource(() => getNotifications(), [], {
    cacheKey: `notifications:${user?.role ?? 'guest'}`,
  });

  const unreadCount = useMemo(() => (notifications ?? []).filter((item) => !item.read).length, [notifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const openNotification = async (notification: NotificationItem) => {
    try {
      if (!notification.read) {
        await markNotificationRead(notification.id);
        await reload();
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
    if (!unreadCount || markingAll) {
      return;
    }

    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      await reload();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader back centerTitle title="Notifications" onProfilePress={() => router.push(user?.role === 'notary' ? '/notary/settings' : '/company/settings')} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Bell color={colors.primary} size={20} />
        </View>
        <View style={styles.summaryContent}>
          <AppText weight="bold" style={styles.summaryTitle}>Your inbox</AppText>
          <AppText muted style={styles.summarySubtitle}>
            {unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All notifications are read'}
          </AppText>
        </View>
        <AppButton
          title={markingAll ? 'Updating...' : 'Mark all read'}
          variant="secondary"
          onPress={() => void handleMarkAll()}
          disabled={!unreadCount || markingAll}
          icon={<CheckCheck color={colors.primary} size={16} />}
          style={styles.markAllButton}
          textStyle={styles.markAllButtonText}
        />
      </View>

      {loading && !notifications ? <LoadingState /> : null}
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
  },
  summaryTitle: {
    fontSize: 15,
    color: '#0f172a',
  },
  summarySubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
  },
  markAllButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  markAllButtonText: {
    fontSize: 12,
    fontWeight: '700',
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
