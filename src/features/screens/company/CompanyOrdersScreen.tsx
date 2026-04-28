import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import {
  Calendar,
  ChevronLeft,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { OrderCard } from '@/components/orders/OrderCard';
import { companyOrders } from '@/constants/mockData';
import { colors, spacing } from '@/theme';

export function CompanyOrdersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />
      <View style={styles.pageHeader}>
        <AppText style={styles.pageTitle}>Orders</AppText>
        <AppText muted style={styles.pageSubtitle}>Manage and track all your closing orders</AppText>
      </View>

      <AppButton 
        title="Create New Order" 
        icon={<Plus color={colors.white} size={18} />} 
        onPress={() => router.push('/company/orders/create')} 
        style={styles.createBtn}
      />

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

      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={18} style={styles.searchIcon} />
        <AppInput 
          placeholder="Search orders..." 
          style={styles.searchInput} 
          containerStyle={styles.searchBox} 
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable style={styles.filterBtn}>
          <SlidersHorizontal color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Status</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <Calendar color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Date Range</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <SlidersHorizontal color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Newest</AppText>
        </Pressable>
      </View>

      <View style={styles.orderList}>
        {companyOrders.map((order) => (
          <OrderCard key={order.id} order={order} href={`/company/orders/${order.id}` as Href} />
        ))}
      </View>

      <View style={styles.paginationContainer}>
        <Pressable style={styles.pageArrow}><ChevronLeft color="#64748b" size={18} /></Pressable>
        <View style={styles.pageNumbers}>
          <View style={[styles.pageNumber, styles.pageActive]}><AppText style={styles.pageTextActive}>1</AppText></View>
          <View style={styles.pageNumber}><AppText style={styles.pageText}>2</AppText></View>
          <View style={styles.pageNumber}><AppText style={styles.pageText}>3</AppText></View>
        </View>
        <Pressable style={styles.pageArrow}><ArrowRight color="#64748b" size={18} /></Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    marginTop: spacing.md,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0a49a8',
  },
  pageSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  createBtn: {
    marginTop: spacing.lg,
    backgroundColor: '#1d63d2',
    height: 48,
    borderRadius: 8,
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
  searchContainer: {
    marginTop: spacing.lg,
    position: 'relative',
  },
  searchBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    height: 44,
  },
  searchInput: {
    paddingLeft: 38,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 13,
    zIndex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  orderList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  pageArrow: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  pageNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageActive: {
    backgroundColor: '#0a49a8',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  pageTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});
