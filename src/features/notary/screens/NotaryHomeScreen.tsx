import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, CheckCircle2, FileText, Upload, Zap } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { notaryOrders } from '@/constants/mockData';
import { NotaryOrderCard } from '@/features/notary/components/NotaryOrderCard';
import { StatCard } from '@/features/notary/components/StatCard';
import { notaryStyles } from '@/features/notary/styles';

export function NotaryHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };
  
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh} contentStyle={{ paddingBottom: 16 }}>
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
        <AppText weight="bold" style={{ fontSize: 20, color: '#0a49a8' }}>Assigned Workload</AppText>
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
        value="24" 
        color="#3b82f6" 
        icon={<FileText color="#3b82f6" size={18} />} 
      />
      <StatCard 
        label="In Progress" 
        sublabel="ACTIVE" 
        value="08" 
        color="#f97316" 
        icon={<Zap color="#f97316" size={18} />} 
      />
      <StatCard 
        label="Completed" 
        sublabel="HISTORY" 
        value="13" 
        color="#22c55e" 
        icon={<CheckCircle2 color="#22c55e" size={18} />} 
      />

      <View style={notaryStyles.sectionTitleRow}>
        <AppText weight="bold" style={{ fontSize: 15, color: '#0a49a8' }}>Assigned Orders</AppText>
        <View style={notaryStyles.liveBadge}>
          <View style={notaryStyles.dot} />
          <AppText variant="caption" weight="bold" style={{ color: '#64748b' }}>LIVE UPDATES</AppText>
        </View>
      </View>

      {notaryOrders.map((order) => (
        <NotaryOrderCard key={order.id} order={order} />
      ))}
    </ScreenContainer>
  );
}
