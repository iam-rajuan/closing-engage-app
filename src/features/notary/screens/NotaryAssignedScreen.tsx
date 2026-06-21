import { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { BrandLogo } from '@/components/common/BrandLogo';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { NotaryOrderCard } from '@/features/notary/components/NotaryOrderCard';
import { StatusReference } from '@/features/notary/components/StatusReference';
import { notaryStyles } from '@/features/notary/styles';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useAuthStore } from '@/features/auth/auth.store';
import { getNotaryOrders } from '@/services/orders.service';

export function NotaryAssignedScreen() {
  const [activeTab, setActiveTab] = useState<'ALL ORDERS' | 'ASSIGNED' | 'IN PROGRESS'>('ALL ORDERS');
  const [search, setSearch] = useState('');
  const user = useAuthStore((state) => state.user);
  const { data: orders, loading, error, reload } = useAsyncResource(() => getNotaryOrders(), []);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

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
    <ScreenContainer scroll refreshing={refreshing} onRefresh={() => void handleRefresh()} contentStyle={{ paddingBottom: 16 }}>
      <View style={notaryStyles.header}>
        <BrandLogo width={140} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.push('/notary/notifications')}><Bell color="#334155" size={24} /></Pressable>
          <Pressable onPress={() => router.push('/notary/settings')}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#0a49a8', alignItems: 'center', justifyContent: 'center' }}>
                <AppText weight="bold" style={{ color: '#fff', fontSize: 12 }}>
                  {user?.avatarInitials || 'NU'}
                </AppText>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <AppInput
          placeholder="Filter by Order"
          leftIcon={<Search size={18} color="#94a3b8" />}
          containerStyle={{ backgroundColor: '#f1f5f9', borderWidth: 0 }}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={notaryStyles.tabContainer}>
        {(['ALL ORDERS', 'ASSIGNED', 'IN PROGRESS'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[notaryStyles.tabItem, activeTab === tab && notaryStyles.tabItemActive]}
          >
            <AppText
              weight="bold"
              style={[notaryStyles.tabText, activeTab === tab && notaryStyles.tabTextActive]}
            >
              {tab}
            </AppText>
          </Pressable>
        ))}
      </View>

      <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginTop: 24, marginBottom: 16 }}>
        LIVE ORDER BOARD
      </AppText>

      {loading && !orders ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {filteredOrders.length ? filteredOrders.map((order) => <NotaryOrderCard key={order.id} order={order} origin="assigned" />) : !loading ? <EmptyState title="No orders matched your filters" /> : null}

      <StatusReference />
    </ScreenContainer>
  );
}
