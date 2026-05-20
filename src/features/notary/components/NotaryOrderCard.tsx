import { Image, Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ArrowRight, Calendar, Info, MapPin } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { notaryStyles } from '@/features/notary/styles';
import { colors } from '@/theme';

const getStatusTone = (status: string) => {
  switch (status) {
    case 'In Progress':
      return 'blue';
    case 'Completed':
      return 'green';
    case 'Under Review':
      return 'orange';
    case 'Pending Upload':
    case 'Action Required':
      return 'red';
    case 'Assigned':
    default:
      return 'gray';
  }
};

export function NotaryOrderCard({ order }: { order: any }) {
  const initials = order.clientName.split(' ').map((n: string) => n[0]).join('');
  
  return (
    <AppCard style={notaryStyles.orderCard}>
      <View style={notaryStyles.orderTop}>
        <View style={[notaryStyles.initialsAvatar, { backgroundColor: colors.blueSoft }]}>
          <AppText weight="bold" style={{ color: colors.primary, fontSize: 14 }}>{initials}</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="bold" style={notaryStyles.orderClientName}>{order.clientName}</AppText>
          <AppText variant="caption" muted weight="semibold" style={{ fontSize: 11, marginTop: 1 }}>#{order.orderNumber.replace('#', '')}</AppText>
        </View>
        <Badge label={order.status} tone={getStatusTone(order.status)} />
      </View>

      <View style={notaryStyles.orderInfoSection}>
        <View style={notaryStyles.infoItem}>
          <View style={notaryStyles.infoIconBox}>
            <MapPin size={14} color="#64748b" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption" muted weight="bold" style={notaryStyles.infoLabel}>LOCATION</AppText>
            <AppText weight="medium" style={notaryStyles.infoValue}>{order.location || order.address}</AppText>
          </View>
        </View>
        
        <View style={notaryStyles.infoItem}>
          <View style={notaryStyles.infoIconBox}>
            <Calendar size={14} color="#64748b" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption" muted weight="bold" style={notaryStyles.infoLabel}>DATE & TIME</AppText>
            <AppText weight="medium" style={notaryStyles.infoValue}>{order.signingDate}{order.signingTime ? ` • ${order.signingTime}` : ''}</AppText>
          </View>
        </View>
      </View>

      <View style={notaryStyles.orderFooter}>
        <View style={{ flex: 1 }}>
          {order.status === 'Pending Upload' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Info size={14} color={colors.danger} />
              <AppText variant="caption" weight="bold" style={{ color: colors.danger }}>Action Required</AppText>
            </View>
          ) : order.status === 'Assigned' ? (
            <AppText weight="semibold" style={{ color: colors.textMuted, fontSize: 12 }}>Pending initial signature</AppText>
          ) : (
            <View style={notaryStyles.avatarGroup}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=64&auto=format&fit=crop' }} style={notaryStyles.miniAvatar} />
              <Image source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=64&auto=format&fit=crop' }} style={[notaryStyles.miniAvatar, { marginLeft: -10 }]} />
            </View>
          )}
        </View>
        <Pressable
          style={notaryStyles.viewDetailsBtn}
          onPress={() =>
            router.push({
              pathname: '/notary/assigned/[id]',
              params: { id: String(order.id).replace(/^#/, '') },
            } as Href)
          }
        >
          <AppText weight="bold" style={[notaryStyles.viewDetailsText, { color: colors.primary }]}>VIEW DETAILS</AppText>
          <ArrowRight size={14} color={colors.primary} />
        </Pressable>
      </View>
    </AppCard>
  );
}
