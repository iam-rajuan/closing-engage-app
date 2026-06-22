import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Activity,
  CheckCircle2,
  FileText,
  TrendingUp,
  Upload,
  Zap,
} from 'lucide-react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useAuthStore } from '@/features/auth/auth.store';
import { NotaryOrderCard } from '@/features/notary/components/NotaryOrderCard';
import { StatCard } from '@/features/notary/components/StatCard';
import { notaryStyles } from '@/features/notary/styles';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getNotaryOrders } from '@/services/orders.service';
import { colors } from '@/theme';

const statusValue = (count: number, total: number) =>
  total === 0 ? 0 : Math.round((count / total) * 100);

/* ─── Pipeline Bar Component ─────────────────────────────── */
function PipelineBar({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  return (
    <View style={notaryStyles.pipelineCard}>
      <View style={notaryStyles.pipelineHeader}>
        <TrendingUp size={15} color={colors.primary} />
        <AppText style={notaryStyles.pipelineTitle}>Order Pipeline</AppText>
      </View>
      {items.map((item) => (
        <View key={item.label} style={notaryStyles.pipelineItem}>
          <View style={notaryStyles.pipelineLabelRow}>
            <View style={notaryStyles.pipelineDotAndLabel}>
              <View style={[notaryStyles.pipelineDot, { backgroundColor: item.color }]} />
              <AppText style={notaryStyles.pipelineLabel}>{item.label}</AppText>
            </View>
            <AppText style={notaryStyles.pipelinePct}>{item.value}%</AppText>
          </View>
          <View style={notaryStyles.pipelineTrack}>
            <View
              style={[
                notaryStyles.pipelineFill,
                { width: `${Math.max(item.value, 2)}%`, backgroundColor: item.color },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────────── */
export function NotaryHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: orders, loading, error, reload } = useAsyncResource(() => getNotaryOrders(), [], {
    cacheKey: 'notary-orders',
  });

  const metrics = useMemo(() => {
    const items = orders ?? [];
    const totalAssigned = items.filter((order) => !order.openForAll || Boolean(order.assignedNotaryId)).length;
    const openClaims = items.filter((order) => order.openForAll && !order.assignedNotaryId).length;
    const inProgress = items.filter((order) => order.status === 'In Progress').length;
    const completed = items.filter((order) => order.status === 'Completed').length;
    return { totalAssigned, openClaims, inProgress, completed };
  }, [orders]);

  const pipeline = useMemo(() => {
    const items = orders ?? [];
    const total = items.length;
    return [
      {
        label: 'Assigned',
        value: statusValue(items.filter((o) => o.status === 'Assigned').length, total),
        color: '#3b82f6',
      },
      {
        label: 'In Progress',
        value: statusValue(items.filter((o) => o.status === 'In Progress').length, total),
        color: '#8b5cf6',
      },
      {
        label: 'Under Review',
        value: statusValue(items.filter((o) => o.status === 'Under Review').length, total),
        color: '#f59e0b',
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
      <AppHeader onProfilePress={() => router.push('/notary/settings')} name={user?.name} />

      {/* ── Hero Greeting Banner ── */}
      <LinearGradient
        colors={['#1e56a0', '#2167d8', '#4a90e8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={notaryStyles.heroBanner}
      >
        <View style={notaryStyles.heroContent}>
          <AppText style={notaryStyles.heroGreeting}>
            {greeting}, {user?.name?.split(' ')[0] ?? 'there'}
          </AppText>
          <AppText style={notaryStyles.heroSubtext}>
            Here's your signing workload overview
          </AppText>
        </View>
        {/* Decorative elements */}
        <View style={notaryStyles.heroDecor1} />
        <View style={notaryStyles.heroDecor2} />
      </LinearGradient>

      {/* ── Stats Grid (2×2) ── */}
      <View style={notaryStyles.statsGrid}>
        <View style={notaryStyles.statsRow}>
          <StatCard
            icon={<FileText color="#3b82f6" size={18} />}
            label="Total Assigned"
            value={metrics.totalAssigned}
            iconBg="#eff6ff"
          />
          <StatCard
            icon={<Zap color="#f97316" size={18} />}
            label="Open Claims"
            value={metrics.openClaims}
            iconBg="#fff7ed"
            accent="#f97316"
          />
        </View>
        <View style={notaryStyles.statsRow}>
          <StatCard
            icon={<Activity color="#8b5cf6" size={18} />}
            label="In Progress"
            value={metrics.inProgress}
            iconBg="#f5f3ff"
            accent="#8b5cf6"
          />
          <StatCard
            icon={<CheckCircle2 color="#10b981" size={18} />}
            label="Completed"
            value={metrics.completed}
            iconBg="#ecfdf5"
            accent="#059669"
          />
        </View>
      </View>

      {/* ── Loading / Error ── */}
      {loading && !orders ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {/* ── Pipeline ── */}
      {orders ? <View style={notaryStyles.pipelineWrap}><PipelineBar items={pipeline} /></View> : null}

      {/* ── Upload Documents Button ── */}
      <AppButton
        title="Upload Documents"
        icon={<Upload color="#fff" size={16} />}
        onPress={() => router.push('/notary/documents/upload')}
        style={styles.uploadBtn}
      />

      {/* ── Order Opportunities ── */}
      <SectionHeader
        title="Order Opportunities"
        action="View All"
        style={styles.sectionHeader}
        onActionPress={() => router.push('/notary/assigned')}
      />

      <View style={styles.orderList}>
        {orders?.length ? (
          orders.slice(0, 3).map((order) => (
            <NotaryOrderCard key={order.id} order={order} origin="home" />
          ))
        ) : (
          !loading && <EmptyState title="No assigned or open orders yet" />
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
  uploadBtn: {
    marginTop: 16,
    backgroundColor: '#1d63d2',
    height: 50,
    borderRadius: 12,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 10,
  },
  orderList: {
    gap: 8,
  },
});
