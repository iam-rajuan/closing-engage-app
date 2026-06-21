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
import { colors } from '@/theme';

export function NotaryHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { data: orders, loading, error, reload } = useAsyncResource(() => getNotaryOrders(), []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const claimedOrders = orders?.filter((order) => !order.openForAll || Boolean(order.assignedNotaryId)) ?? [];
  const totalAssigned = claimedOrders.length;
  const completed = orders?.filter((order) => order.status === 'Completed').length ?? 0;
  const openClaims = orders?.filter((order) => order.openForAll && !order.assignedNotaryId).length ?? 0;

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => void handleRefresh()} contentStyle={{ paddingBottom: 16 }}>
      <View style={notaryStyles.header}>
        <BrandLogo width={140} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable 
            onPress={() => router.push('/notary/notifications')}
            style={notaryStyles.headerIconButton}
          >
            <Bell color="#475569" size={20} />
          </Pressable>
          <Pressable onPress={() => router.push('/notary/settings')}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={notaryStyles.profileAvatar}
              />
            ) : (
              <View style={notaryStyles.profileAvatarFallback}>
                <AppText weight="bold" style={{ color: '#fff', fontSize: 12 }}>
                  {user?.avatarInitials || 'NU'}
                </AppText>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={notaryStyles.welcomeContainer}>
        <AppText weight="bold" style={notaryStyles.welcomeTitle}>
          Assigned Workload{user?.name ? `, ${user.name}` : ''}
        </AppText>
        <AppText muted style={notaryStyles.welcomeSubtitle}>
          Manage your active signing appointments and document verifications.
        </AppText>
      </View>

      <AppButton
        title="Upload Documents"
        icon={<Upload color="#fff" size={16} />}
        onPress={() => router.push('/notary/documents/upload')}
        style={{ marginBottom: 20, borderRadius: 12 }}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <StatCard
          label="Total Assigned"
          sublabel="GLOBAL"
          value={String(totalAssigned)}
          color="#3b82f6"
          icon={<FileText color="#3b82f6" size={15} />}
        />
        <StatCard
          label="Open Claims"
          sublabel="LIVE"
          value={String(openClaims)}
          color="#f97316"
          icon={<Zap color="#f97316" size={15} />}
        />
        <StatCard
          label="Completed"
          sublabel="HISTORY"
          value={String(completed)}
          color="#22c55e"
          icon={<CheckCircle2 color="#22c55e" size={15} />}
        />
      </View>

      <View style={notaryStyles.sectionTitleRow}>
        <AppText weight="bold" style={notaryStyles.sectionTitle}>Order Opportunities</AppText>
      </View>

      {loading && !orders ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {orders?.length ? orders.map((order) => <NotaryOrderCard key={order.id} order={order} origin="home" />) : !loading ? <EmptyState title="No assigned or open orders yet" /> : null}
    </ScreenContainer>
  );
}
