import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Calendar, FileText, Search, SlidersHorizontal } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { NotaryOrderCard } from '@/features/notary/components/NotaryOrderCard';
import { StatusReference } from '@/features/notary/components/StatusReference';
import { notaryStyles } from '@/features/notary/styles';
import { useNotaryUIStore } from '@/features/notary/notary-ui.store';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getNotaryOrders } from '@/services/orders.service';
import { colors } from '@/theme';

export function NotaryAssignedScreen() {
  const activeTab = useNotaryUIStore((s) => s.assignedTab);
  const setActiveTab = useNotaryUIStore((s) => s.setAssignedTab);
  const search = useNotaryUIStore((s) => s.assignedSearch);
  const setSearch = useNotaryUIStore((s) => s.setAssignedSearch);

  const { data: orders, loading, error, reload } = useAsyncResource(() => getNotaryOrders(), [], {
    cacheKey: 'notary-orders',
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const items = orders ?? [];
    return {
      total: items.length,
      assigned: items.filter((o) => o.status === 'Assigned' && !(o.openForAll && !o.assignedNotaryId)).length,
      inProgress: items.filter((o) => o.status === 'In Progress').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const items = orders ?? [];
    return items.filter((order) => {
      const isOpenOrder = Boolean(order.openForAll && !order.assignedNotaryId);
      const matchesTab =
        activeTab === 'ALL ORDERS'
          ? true
          : activeTab === 'ASSIGNED'
            ? order.status === 'Assigned' && !isOpenOrder
            : order.status === 'In Progress';
      const matchesSearch =
        !search.trim() || `${order.orderNumber} ${order.clientName}`.toLowerCase().includes(search.trim().toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, search]);

  return (
    <ScreenContainer scroll refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader onProfilePress={() => router.push('/notary/settings')} />

      <View style={notaryStyles.pageHeader}>
        <AppText style={notaryStyles.pageTitle}>Assigned Orders</AppText>
        <AppText style={notaryStyles.pageSubtitle}>Manage your active signing appointments</AppText>
      </View>

      {/* ── Stats Summary ── */}
      <View style={notaryStyles.statsContainer}>
        <AppCard style={notaryStyles.statCardLarge}>
          <View style={notaryStyles.statCardHeader}>
            <AppText style={notaryStyles.statLabelLarge}>Total Orders</AppText>
            <View style={notaryStyles.statIconBox}>
              <FileText color={colors.primary} size={16} />
            </View>
          </View>
          <AppText style={notaryStyles.statValueLargeAssigned}>{stats.total}</AppText>
        </AppCard>

        <View style={notaryStyles.statRowSmall}>
          <AppCard style={notaryStyles.statCardSmall}>
            <AppText style={notaryStyles.statLabelSmall}>ASSIGNED</AppText>
            <AppText style={notaryStyles.statValueSmall}>{stats.assigned}</AppText>
          </AppCard>
          <AppCard style={notaryStyles.statCardSmall}>
            <AppText style={notaryStyles.statLabelSmall}>IN PROGRESS</AppText>
            <AppText style={notaryStyles.statValueSmall}>{stats.inProgress}</AppText>
          </AppCard>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={notaryStyles.searchContainer}>
        <Search color="#94a3b8" size={16} style={notaryStyles.searchIcon} />
        <AppInput
          placeholder="Search orders..."
          style={notaryStyles.searchInput}
          containerStyle={notaryStyles.searchBox}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── Tab Filters ── */}
      <View style={notaryStyles.filterRow}>
        {(['ALL ORDERS', 'ASSIGNED', 'IN PROGRESS'] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[notaryStyles.filterBtn, active && notaryStyles.filterBtnActive]}
            >
              <SlidersHorizontal color={active ? '#ffffff' : '#64748b'} size={13} />
              <AppText style={[notaryStyles.filterBtnText, active && notaryStyles.filterBtnTextActive]}>
                {tab === 'ALL ORDERS' ? 'All' : tab === 'ASSIGNED' ? 'Assigned' : 'In Progress'}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* ── Order List ── */}
      {loading && !orders ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      <View style={notaryStyles.orderList}>
        {filteredOrders.length ? (
          filteredOrders.map((order) => (
            <NotaryOrderCard key={order.id} order={order} origin="assigned" />
          ))
        ) : (
          !loading && <EmptyState title="No orders matched your filters" />
        )}
      </View>

      <StatusReference />
    </ScreenContainer>
  );
}
