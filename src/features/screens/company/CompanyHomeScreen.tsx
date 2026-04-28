import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SectionHeader } from '@/components/common/SectionHeader';
import { OrderCard } from '@/components/orders/OrderCard';
import { ProgressPipeline } from '@/components/orders/ProgressPipeline';
import { companyOrders, pipeline } from '@/constants/mockData';
import { colors, spacing } from '@/theme';

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
      <View style={styles.homeGreeting}>
        <AppText variant="caption" muted style={styles.overviewLabel}>Overview</AppText>
        <AppText variant="subtitle" style={styles.greetingText}>Good morning, Alex.</AppText>
      </View>
      
      <View style={styles.ordersStatsGrid}>
        <AppCard style={styles.statCardLarge}>
          <View style={styles.statHeader}>
            <AppText variant="caption" muted style={styles.statTitle}>Total Orders</AppText>
            <View style={styles.statIconBadge}>
              <FileText color={colors.primary} size={18} />
            </View>
          </View>
          <AppText style={styles.statValueLarge}>1,248</AppText>
        </AppCard>
        <View style={styles.statRowSmall}>
          <AppCard style={styles.statCardSmall}>
            <AppText variant="caption" muted style={styles.statTitle}>PENDING REVIEW</AppText>
            <AppText style={styles.statValueSmall}>56</AppText>
          </AppCard>
          <AppCard style={styles.statCardSmall}>
            <AppText variant="caption" muted style={styles.statTitle}>COMPLETED TODAY</AppText>
            <AppText style={styles.statValueSmall}>850</AppText>
          </AppCard>
        </View>
      </View>

      <ProgressPipeline items={pipeline} />
      <SectionHeader title="Recent Orders" action="View All" style={styles.homeSection} onActionPress={() => router.push('/company/orders')} />
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
    paddingTop: spacing.xs,
    paddingBottom: 40,
  },
  homeGreeting: {
    marginTop: spacing.sm,
    gap: 0,
  },
  overviewLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  ordersStatsGrid: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  statCardLarge: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'none',
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValueLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  statRowSmall: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCardSmall: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statValueSmall: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  homeSection: {
    marginTop: spacing.md,
  },
  orderList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
