import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { notaryOrders } from '@/constants/mockData';
import { NotaryOrderCard } from '@/features/notary/components/NotaryOrderCard';
import { StatusReference } from '@/features/notary/components/StatusReference';
import { notaryStyles } from '@/features/notary/styles';

export function NotaryAssignedScreen() {
  const [activeTab, setActiveTab] = useState('ALL ORDERS');
  
  return (
    <ScreenContainer scroll contentStyle={{ paddingBottom: 16 }}>
      <View style={notaryStyles.header}>
        <BrandLogo width={140} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable><Bell color="#334155" size={24} /></Pressable>
          <Pressable onPress={() => router.push('/notary/settings')}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop' }} 
              style={{ width: 36, height: 36, borderRadius: 18 }} 
            />
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <AppInput 
          placeholder="Filter by Order" 
          leftIcon={<Search size={18} color="#94a3b8" />}
          containerStyle={{ backgroundColor: '#f1f5f9', borderWidth: 0 }}
        />
      </View>

      <View style={notaryStyles.tabContainer}>
        {['ALL ORDERS', 'ASSIGNED', 'IN PROGRESS'].map((tab) => (
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

      <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginTop: 24, marginBottom: 16 }}>CURRENT ASSIGNMENTS</AppText>
      
      {notaryOrders.map((order) => (
        <NotaryOrderCard key={order.id} order={order} />
      ))}

      <StatusReference />
    </ScreenContainer>
  );
}
