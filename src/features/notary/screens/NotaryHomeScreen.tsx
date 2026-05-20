import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, CheckCircle2, FileText, Upload, Zap } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { BrandLogo } from '@/components/common/BrandLogo';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';
import { NotaryOrderCard } from '@/features/notary/components/NotaryOrderCard';
import { StatCard } from '@/features/notary/components/StatCard';
import { notaryStyles } from '@/features/notary/styles';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getNotaryOrders } from '@/services/orders.service';

export function NotaryHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: orders, loading, error, reload } = useAsyncResource(() => getNotaryOrders(), []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const totalAssigned = orders?.length ?? 0;
  const inProgress = orders?.filter((order) => order.status === 'In Progress').length ?? 0;
  const completed = orders?.filter((order) => order.status === 'Completed').length ?? 0;

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => void handleRefresh()} contentStyle={{ paddingBottom: 16 }}>
      <View style={notaryStyles.header}>
        <BrandLogo width={140} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable>
            <Bell color="#334155" size={24} />
          </Pressable>
          <Pressable onPress={() => router.push('/notary/settings')}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop' }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: 12, marginBottom: 12 }}>
        <AppText weight="bold" style={{ fontSize: 20, color: '#0a49a8' }}>
          Assigned Workload{user?.name ? `, ${user.name}` : ''}
        </AppText>
        <AppText muted style={{ fontSize: 12, marginTop: 3, lineHeight: 17 }}>
          Manage your active signing appointments and document verifications.
        </AppText>
      </View>

      <AppButton
        title="Upload Documents"
        icon={<Upload color="#fff" size={16} />}
        onPress={() => router.push('/notary/documents/upload')}
        style={{ marginBottom: 20, backgroundColor: '#0a49a8', height: 44 }}
        textStyle={{ fontSize: 14 }}
      />

      <StatCard
        label="Total Assigned"
        sublabel="GLOBAL"
        value={String(totalAssigned)}
        color="#3b82f6"
        icon={<FileText color="#3b82f6" size={18} />}
      />
      <StatCard
        label="In Progress"
        sublabel="ACTIVE"
        value={String(inProgress)}
        color="#f97316"
        icon={<Zap color="#f97316" size={18} />}
      />
      <StatCard
        label="Completed"
        sublabel="HISTORY"
        value={String(completed)}
        color="#22c55e"
        icon={<CheckCircle2 color="#22c55e" size={18} />}
      />

      <View style={notaryStyles.sectionTitleRow}>
        <AppText weight="bold" style={{ fontSize: 15, color: '#0a49a8' }}>Assigned Orders</AppText>
      </View>

      {loading && !orders ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {orders?.length ? orders.map((order) => <NotaryOrderCard key={order.id} order={order} />) : !loading ? <EmptyState title="No assigned orders yet" /> : null}
    </ScreenContainer>
  );
}
