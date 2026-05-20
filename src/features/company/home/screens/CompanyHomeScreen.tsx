import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Activity, CheckCircle2, FileText, Hourglass } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SectionHeader } from '@/components/common/SectionHeader';
import { OrderCard } from '@/components/orders/OrderCard';
import { ProgressPipeline } from '@/components/orders/ProgressPipeline';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getCompanyOrders } from '@/services/orders.service';

const statusValue = (count: number, total: number) => (total === 0 ? 0 : Math.round((count / total) * 100));

export function CompanyHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: orders, loading, error, reload } = useAsyncResource(() => getCompanyOrders(), []);

  const metrics = useMemo(() => {
    const items = orders ?? [];
    const total = items.length;
    const active = items.filter((order) => !['Completed', 'Approved'].includes(order.status)).length;
    const pendingReview = items.filter((order) => order.status === 'Under Review').length;
    const completed = items.filter((order) => order.status === 'Completed').length;
    return { total, active, pendingReview, completed };
  }, [orders]);

  const pipeline = useMemo(() => {
    const items = orders ?? [];
    const total = items.length;
    return [
      { label: 'Received', value: statusValue(items.filter((order) => order.status === 'Received').length, total) },
      { label: 'Assigned', value: statusValue(items.filter((order) => order.status === 'Assigned').length, total) },
      { label: 'Under Review', value: statusValue(items.filter((order) => order.status === 'Under Review').length, total) },
      { label: 'Approved', value: statusValue(items.filter((order) => order.status === 'Approved').length, total) },
      { label: 'Completed', value: statusValue(items.filter((order) => order.status === 'Completed').length, total) },
    ];
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <ScreenContainer
      scroll
      contentStyle={styles.homeContainer}
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
    >
      <AppHeader onProfilePress={() => router.push('/company/settings')} name={user?.name} />

      <View style={styles.homeGreeting}>
        <AppText style={styles.overviewLabel}>Overview</AppText>
        <AppText style={styles.greetingText}>Good day, {user?.name ?? 'there'}.</AppText>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <AppCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
              <FileText color="#1d63d2" size={16} />
            </View>
            <AppText style={styles.statLabel}>TOTAL ORDERS</AppText>
            <AppText style={styles.statValue}>{metrics.total}</AppText>
          </AppCard>
          <AppCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
              <Activity color="#1d63d2" size={16} />
            </View>
            <AppText style={styles.statLabel}>ACTIVE ORDERS</AppText>
            <AppText style={styles.statValue}>{metrics.active}</AppText>
          </AppCard>
        </View>
        <View style={styles.statsRow}>
          <AppCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fffbeb' }]}>
              <Hourglass color="#f59e0b" size={16} />
            </View>
            <AppText style={styles.statLabel}>PENDING REVIEW</AppText>
            <AppText style={styles.statValue}>{metrics.pendingReview}</AppText>
          </AppCard>
          <AppCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ecfdf5' }]}>
              <CheckCircle2 color="#10b981" size={16} />
            </View>
            <AppText style={styles.statLabel}>COMPLETED</AppText>
            <AppText style={styles.statValue}>{metrics.completed}</AppText>
          </AppCard>
        </View>
      </View>

      {loading && !orders ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {orders ? <ProgressPipeline items={pipeline} style={styles.pipeline} /> : null}

      <SectionHeader
        title="Recent Orders"
        action="View All"
        style={styles.sectionHeader}
        onActionPress={() => router.push('/company/orders')}
      />
      <View style={styles.orderList}>
        {orders?.length ? (
          orders.slice(0, 3).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              href={{ pathname: '/company/orders/[id]', params: { id: order.id.replace(/^#/, '') } } as Href}
            />
          ))
        ) : (
          !loading && <EmptyState title="No company orders yet" />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    paddingBottom: 16,
  },
  homeGreeting: {
    marginTop: 12,
    gap: 2,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 26,
  },
  statsContainer: {
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    gap: 3,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  pipeline: {
    marginBottom: 4,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 10,
  },
  orderList: {
    gap: 10,
  },
});
