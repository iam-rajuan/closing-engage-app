import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { OrderCard } from '@/components/orders/OrderCard';
import { companyOrders } from '@/constants/mockData';
import { colors } from '@/theme';

export function CompanyOrdersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <AppText style={styles.pageTitle}>Orders</AppText>
        <AppText style={styles.pageSubtitle}>Manage and track all your closing orders</AppText>
      </View>

      {/* Create Button */}
      <AppButton
        title="Create New Order"
        icon={<Plus color={colors.white} size={18} />}
        onPress={() => router.push('/company/orders/create')}
        style={styles.createBtn}
      />

      {/* Stats: 1 large + 2 small — matches Figma exactly */}
      <View style={styles.statsContainer}>
        {/* Large card — Total Orders */}
        <AppCard style={styles.statCardLarge}>
          <View style={styles.statCardHeader}>
            <AppText style={styles.statLabelLarge}>Total Orders</AppText>
            <View style={styles.statIconBox}>
              <FileText color={colors.primary} size={16} />
            </View>
          </View>
          <AppText style={styles.statValueLarge}>1,248</AppText>
        </AppCard>

        {/* Two small cards */}
        <View style={styles.statRowSmall}>
          <AppCard style={styles.statCardSmall}>
            <AppText style={styles.statLabelSmall}>PENDING REVIEW</AppText>
            <AppText style={styles.statValueSmall}>56</AppText>
          </AppCard>
          <AppCard style={styles.statCardSmall}>
            <AppText style={styles.statLabelSmall}>COMPLETED TODAY</AppText>
            <AppText style={styles.statValueSmall}>850</AppText>
          </AppCard>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={16} style={styles.searchIcon} />
        <AppInput
          placeholder="Search orders..."
          style={styles.searchInput}
          containerStyle={styles.searchBox}
        />
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <Pressable style={styles.filterBtn}>
          <SlidersHorizontal color="#64748b" size={13} />
          <AppText style={styles.filterBtnText}>Status</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <Calendar color="#64748b" size={13} />
          <AppText style={styles.filterBtnText}>Date Range</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <SlidersHorizontal color="#64748b" size={13} />
          <AppText style={styles.filterBtnText}>Newest</AppText>
        </Pressable>
      </View>

      {/* Order Cards */}
      <View style={styles.orderList}>
        {companyOrders.map((order) => (
          <OrderCard key={order.id} order={order} href={`/company/orders/${order.id}` as Href} />
        ))}
      </View>

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <Pressable style={styles.pageArrow}><ChevronLeft color="#64748b" size={16} /></Pressable>
        <View style={styles.pageNumbers}>
          <View style={[styles.pageNumber, styles.pageActive]}><AppText style={styles.pageTextActive}>1</AppText></View>
          <View style={styles.pageNumber}><AppText style={styles.pageText}>2</AppText></View>
          <View style={styles.pageNumber}><AppText style={styles.pageText}>3</AppText></View>
        </View>
        <Pressable style={styles.pageArrow}><ArrowRight color="#64748b" size={16} /></Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    marginTop: 20,
    gap: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0a49a8',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  createBtn: {
    marginTop: 16,
    backgroundColor: '#1d63d2',
    height: 50,
    borderRadius: 12,
  },

  // Stats layout — 1 large + 2 small (Figma)
  statsContainer: {
    gap: 14,
    marginTop: 20,
    marginBottom: 4,
  },
  statCardLarge: {
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabelLarge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValueLarge: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 10,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  statRowSmall: {
    flexDirection: 'row',
    gap: 14,
  },
  statCardSmall: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  statLabelSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  statValueSmall: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    letterSpacing: -0.3,
  },

  // Search
  searchContainer: {
    marginTop: 20,
    position: 'relative',
  },
  searchBox: {
    backgroundColor: '#f8fafc',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 0,
  },
  searchInput: {
    paddingLeft: 38,
    fontSize: 14,
    color: '#334155',
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
    top: 14,
    zIndex: 1,
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  // Orders
  orderList: {
    gap: 12,
    marginTop: 16,
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 28,
    marginBottom: 40,
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
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageActive: {
    backgroundColor: '#0a49a8',
  },
  pageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  pageTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
});
