import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Calendar, FileText, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { OrderCard } from '@/components/orders/OrderCard';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getCompanyOrders } from '@/services/orders.service';
import { colors } from '@/theme';

export function CompanyOrdersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Under Review' | 'Completed'>('all');
  const { data: orders, loading, error, reload } = useAsyncResource(() => getCompanyOrders(), []);

  const filteredOrders = useMemo(() => {
    const items = orders ?? [];
    return items.filter((order) => {
      const matchesSearch =
        !search.trim() ||
        `${order.orderNumber} ${order.clientName} ${order.address}`.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const items = orders ?? [];
    return {
      total: items.length,
      pendingReview: items.filter((order) => order.status === 'Under Review').length,
      completed: items.filter((order) => order.status === 'Completed').length,
    };
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />

      <View style={styles.pageHeader}>
        <AppText style={styles.pageTitle}>Orders</AppText>
        <AppText style={styles.pageSubtitle}>Manage and track all your closing orders</AppText>
      </View>

      <AppButton
        title="Create New Order"
        icon={<Plus color={colors.white} size={18} />}
        onPress={() => router.push('/company/orders/create')}
        style={styles.createBtn}
      />

      <View style={styles.statsContainer}>
        <AppCard style={styles.statCardLarge}>
          <View style={styles.statCardHeader}>
            <AppText style={styles.statLabelLarge}>Total Orders</AppText>
            <View style={styles.statIconBox}>
              <FileText color={colors.primary} size={16} />
            </View>
          </View>
          <AppText style={styles.statValueLarge}>{stats.total}</AppText>
        </AppCard>

        <View style={styles.statRowSmall}>
          <AppCard style={styles.statCardSmall}>
            <AppText style={styles.statLabelSmall}>PENDING REVIEW</AppText>
            <AppText style={styles.statValueSmall}>{stats.pendingReview}</AppText>
          </AppCard>
          <AppCard style={styles.statCardSmall}>
            <AppText style={styles.statLabelSmall}>COMPLETED</AppText>
            <AppText style={styles.statValueSmall}>{stats.completed}</AppText>
          </AppCard>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={16} style={styles.searchIcon} />
        <AppInput
          placeholder="Search orders..."
          style={styles.searchInput}
          containerStyle={styles.searchBox}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable style={styles.filterBtn} onPress={() => setStatusFilter('all')}>
          <SlidersHorizontal color="#64748b" size={13} />
          <AppText style={styles.filterBtnText}>All</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn} onPress={() => setStatusFilter('Under Review')}>
          <Calendar color="#64748b" size={13} />
          <AppText style={styles.filterBtnText}>Under Review</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn} onPress={() => setStatusFilter('Completed')}>
          <SlidersHorizontal color="#64748b" size={13} />
          <AppText style={styles.filterBtnText}>Completed</AppText>
        </Pressable>
      </View>

      {loading && !orders ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      <View style={styles.orderList}>
        {filteredOrders.length ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              href={{
                pathname: '/company/orders/[id]',
                params: { id: order.id.replace(/^#/, ''), from: 'orders' },
              } as Href}
            />
          ))
        ) : (
          !loading && <EmptyState title="No orders matched your filters" />
        )}
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
  orderList: {
    gap: 12,
    marginTop: 16,
    paddingBottom: 40,
  },
});
