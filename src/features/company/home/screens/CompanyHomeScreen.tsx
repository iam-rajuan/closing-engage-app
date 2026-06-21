import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Activity,
  CheckCircle2,
  FileText,
  Hourglass,
  TrendingUp,
} from 'lucide-react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SectionHeader } from '@/components/common/SectionHeader';
import { OrderCard } from '@/components/orders/OrderCard';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getCompanyOrders } from '@/services/orders.service';
import { colors, shadows } from '@/theme';

const statusValue = (count: number, total: number) =>
  total === 0 ? 0 : Math.round((count / total) * 100);

/* ─── Stat Card Component ────────────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  iconBg,
  iconColor,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  accent?: string;
}) {
  return (
    <View style={statStyles.card}>
      <View style={statStyles.cardInner}>
        <View style={[statStyles.iconWrap, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View style={statStyles.meta}>
          <AppText style={statStyles.label}>{label}</AppText>
          <AppText style={[statStyles.value, accent ? { color: accent } : undefined]}>
            {value}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8edf4',
    ...shadows.sm,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
});

/* ─── Pipeline Bar Component ─────────────────────────────── */
function PipelineBar({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  return (
    <View style={pipeStyles.card}>
      <View style={pipeStyles.header}>
        <TrendingUp size={15} color={colors.primary} />
        <AppText style={pipeStyles.title}>Order Pipeline</AppText>
      </View>
      {items.map((item) => (
        <View key={item.label} style={pipeStyles.item}>
          <View style={pipeStyles.labelRow}>
            <View style={pipeStyles.dotAndLabel}>
              <View style={[pipeStyles.dot, { backgroundColor: item.color }]} />
              <AppText style={pipeStyles.label}>{item.label}</AppText>
            </View>
            <AppText style={pipeStyles.pct}>{item.value}%</AppText>
          </View>
          <View style={pipeStyles.track}>
            <View
              style={[
                pipeStyles.fill,
                { width: `${Math.max(item.value, 2)}%`, backgroundColor: item.color },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const pipeStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8edf4',
    padding: 14,
    gap: 8,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  item: {
    gap: 5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotAndLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  pct: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    minWidth: 32,
    textAlign: 'right',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    marginLeft: 16,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});



/* ─── Main Screen ────────────────────────────────────────── */
export function CompanyHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: orders, loading, error, reload } = useAsyncResource(() => getCompanyOrders(), []);

  const metrics = useMemo(() => {
    const items = orders ?? [];
    const total = items.length;
    const active = items.filter(
      (order) => !['Completed', 'Approved'].includes(order.status),
    ).length;
    const pendingReview = items.filter((order) => order.status === 'Under Review').length;
    const completed = items.filter((order) => order.status === 'Completed').length;
    return { total, active, pendingReview, completed };
  }, [orders]);

  const pipeline = useMemo(() => {
    const items = orders ?? [];
    const total = items.length;
    return [
      {
        label: 'Received',
        value: statusValue(items.filter((o) => o.status === 'Received').length, total),
        color: '#3b82f6',
      },
      {
        label: 'Assigned',
        value: statusValue(items.filter((o) => o.status === 'Assigned').length, total),
        color: '#8b5cf6',
      },
      {
        label: 'Under Review',
        value: statusValue(items.filter((o) => o.status === 'Under Review').length, total),
        color: '#f59e0b',
      },
      {
        label: 'Approved',
        value: statusValue(items.filter((o) => o.status === 'Approved').length, total),
        color: '#06b6d4',
      },
      {
        label: 'Completed',
        value: statusValue(items.filter((o) => o.status === 'Completed').length, total),
        color: '#10b981',
      },
    ];
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <ScreenContainer
      scroll
      contentStyle={styles.homeContainer}
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
    >
      <AppHeader onProfilePress={() => router.push('/company/settings')} name={user?.name} />

      {/* ── Hero Greeting Banner ── */}
      <LinearGradient
        colors={['#1e56a0', '#2167d8', '#4a90e8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.heroContent}>
          <AppText style={styles.heroGreeting}>
            {greeting}, {user?.name?.split(' ')[0] ?? 'there'}
          </AppText>
          <AppText style={styles.heroSubtext}>
            Here's your order overview for today
          </AppText>
        </View>
        {/* Decorative elements */}
        <View style={styles.heroDecor1} />
        <View style={styles.heroDecor2} />
      </LinearGradient>

      {/* ── Stats Grid ── */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            icon={<FileText color="#3b82f6" size={18} />}
            label="Total Orders"
            value={metrics.total}
            iconBg="#eff6ff"
            iconColor="#3b82f6"
          />
          <StatCard
            icon={<Activity color="#8b5cf6" size={18} />}
            label="Active"
            value={metrics.active}
            iconBg="#f5f3ff"
            iconColor="#8b5cf6"
            accent="#8b5cf6"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon={<Hourglass color="#f59e0b" size={18} />}
            label="Pending"
            value={metrics.pendingReview}
            iconBg="#fffbeb"
            iconColor="#f59e0b"
            accent="#d97706"
          />
          <StatCard
            icon={<CheckCircle2 color="#10b981" size={18} />}
            label="Completed"
            value={metrics.completed}
            iconBg="#ecfdf5"
            iconColor="#10b981"
            accent="#059669"
          />
        </View>
      </View>

      {/* ── Loading / Error ── */}
      {loading && !orders ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {/* ── Pipeline ── */}
      {orders ? <View style={styles.pipelineWrap}><PipelineBar items={pipeline} /></View> : null}

      {/* ── Recent Orders ── */}
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
              href={
                {
                  pathname: '/company/orders/[id]',
                  params: { id: order.id.replace(/^#/, '') },
                } as Href
              }
            />
          ))
        ) : (
          !loading && <EmptyState title="No company orders yet" />
        )}
      </View>

      {/* Bottom breathing room */}
      <View style={{ height: 24 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    paddingBottom: 16,
  },
  /* ── Hero Banner ── */
  heroBanner: {
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 18,
    paddingHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    zIndex: 2,
    gap: 4,
  },
  heroGreeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  heroSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 18,
  },
  heroDecor1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -30,
    right: -20,
  },
  heroDecor2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -20,
    right: 40,
  },
  /* ── Stats Grid ── */
  statsGrid: {
    gap: 8,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pipelineWrap: {
    marginTop: 12,
  },
  /* ── Section Header ── */
  sectionHeader: {
    marginTop: 16,
    marginBottom: 10,
  },
  /* ── Order List ── */
  orderList: {
    gap: 8,
  },
});
