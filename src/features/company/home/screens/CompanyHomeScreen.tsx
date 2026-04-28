import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Activity, CheckCircle2, FileText, Hourglass } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SectionHeader } from '@/components/common/SectionHeader';
import { OrderCard } from '@/components/orders/OrderCard';
import { ProgressPipeline } from '@/components/orders/ProgressPipeline';
import { companyOrders, pipeline } from '@/constants/mockData';

export function CompanyHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <ScreenContainer
      scroll
      contentStyle={styles.homeContainer}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <AppHeader onProfilePress={() => router.push('/company/settings')} />

      {/* Greeting */}
      <View style={styles.homeGreeting}>
        <AppText style={styles.overviewLabel}>Overview</AppText>
        <AppText style={styles.greetingText}>Good morning, Alex.</AppText>
      </View>

      {/* 2×2 Stats — two rows of two cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <AppCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
              <FileText color="#1d63d2" size={16} />
            </View>
            <AppText style={styles.statLabel}>TOTAL ORDERS</AppText>
            <AppText style={styles.statValue}>1,248</AppText>
          </AppCard>
          <AppCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
              <Activity color="#1d63d2" size={16} />
            </View>
            <AppText style={styles.statLabel}>ACTIVE ORDERS</AppText>
            <AppText style={styles.statValue}>342</AppText>
          </AppCard>
        </View>
        <View style={styles.statsRow}>
          <AppCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fffbeb' }]}>
              <Hourglass color="#f59e0b" size={16} />
            </View>
            <AppText style={styles.statLabel}>PENDING REVIEW</AppText>
            <AppText style={styles.statValue}>56</AppText>
          </AppCard>
          <AppCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ecfdf5' }]}>
              <CheckCircle2 color="#10b981" size={16} />
            </View>
            <AppText style={styles.statLabel}>COMPLETED</AppText>
            <AppText style={styles.statValue}>850</AppText>
          </AppCard>
        </View>
      </View>

      {/* Pipeline */}
      <ProgressPipeline items={pipeline} style={styles.pipeline} />

      {/* Recent Orders */}
      <SectionHeader
        title="Recent Orders"
        action="View All"
        style={styles.sectionHeader}
        onActionPress={() => router.push('/company/orders')}
      />
      <View style={styles.orderList}>
        {companyOrders.slice(0, 3).map((order) => (
          <OrderCard key={order.id} order={order} href={`/company/orders/${order.id}` as Href} />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    paddingBottom: 40,
  },
  homeGreeting: {
    marginTop: 16,
    gap: 2,
  },
  overviewLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 28,
  },
  statsContainer: {
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
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
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  pipeline: {
    marginBottom: 4,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
  },
  orderList: {
    gap: 12,
  },
});
