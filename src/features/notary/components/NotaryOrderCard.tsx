import { Image, Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ArrowRight, Calendar, Info, MapPin } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { notaryStyles } from '@/features/notary/styles';

export function NotaryOrderCard({ order }: { order: any }) {
  const initials = order.clientName.split(' ').map((n: string) => n[0]).join('');
  
  return (
    <AppCard style={notaryStyles.orderCard}>
      <View style={notaryStyles.orderTop}>
        <View style={[notaryStyles.initialsAvatar, { backgroundColor: '#dbeafe' }]}>
          <AppText weight="bold" style={{ color: '#1d4ed8', fontSize: 15 }}>{initials}</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="bold" style={notaryStyles.orderClientName}>{order.clientName}</AppText>
          <AppText variant="caption" muted style={{ fontWeight: '600', fontSize: 12 }}>#{order.orderNumber.replace('#', '')}</AppText>
        </View>
        <Badge label={order.status} tone={order.status === 'In Progress' ? 'blue' : 'gray'} />
      </View>

      <View style={notaryStyles.orderInfoRow}>
        <View style={notaryStyles.infoItem}>
          <MapPin size={16} color="#0a49a8" />
          <View>
            <AppText variant="caption" muted weight="bold" style={{ fontSize: 10 }}>LOCATION</AppText>
            <AppText weight="bold" style={{ color: '#0f172a', fontSize: 14 }}>Denver, CO</AppText>
          </View>
        </View>
        <View style={notaryStyles.infoItem}>
          <Calendar size={16} color="#0a49a8" />
          <View>
            <AppText variant="caption" muted weight="bold" style={{ fontSize: 10 }}>DATE & TIME</AppText>
            <AppText weight="bold" style={{ color: '#0f172a', fontSize: 14 }}>{order.signingDate}</AppText>
          </View>
        </View>
      </View>

      <View style={notaryStyles.orderFooter}>
        <View style={{ flex: 1 }}>
          {order.status === 'Pending Upload' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Info size={14} color="#ef4444" />
              <AppText variant="caption" weight="bold" style={{ color: '#ef4444' }}>Action Required</AppText>
            </View>
          ) : order.status === 'Assigned' ? (
            <AppText weight="bold" style={{ color: '#64748b', fontSize: 12 }}>Pending initial signature</AppText>
          ) : (
            <View style={notaryStyles.avatarGroup}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=64&auto=format&fit=crop' }} style={notaryStyles.miniAvatar} />
              <Image source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=64&auto=format&fit=crop' }} style={[notaryStyles.miniAvatar, { marginLeft: -10 }]} />
            </View>
          )}
        </View>
        <Pressable style={notaryStyles.viewDetailsBtn} onPress={() => router.push(`/notary/assigned/${order.id}` as Href)}>
          <AppText weight="bold" style={notaryStyles.viewDetailsText}>VIEW DETAILS</AppText>
          <ArrowRight size={16} color="#0a49a8" />
        </Pressable>
      </View>
    </AppCard>
  );
}
