import { Image, Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ArrowRight, Calendar, Info, MapPin } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { useAuthStore } from '@/features/auth/auth.store';
import { notaryStyles } from '@/features/notary/styles';
import { Order } from '@/types/order';
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

const initialsFrom = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || value.trim().slice(0, 2).toUpperCase();

export function NotaryOrderCard({ order }: { order: Order }) {
  const user = useAuthStore((state) => state.user);
  const companyAvatar = order.companyAvatarUrl;
  const notaryAvatar = order.notaryAvatarUrl || user?.avatarUrl;
  const companyInitials = initialsFrom(order.companyName || order.clientName || 'Company');
  const notaryInitials = initialsFrom(order.notaryName || user?.name || user?.fullName || 'Notary');
  
  return (
    <AppCard style={notaryStyles.orderCard}>
      <View style={notaryStyles.orderTop}>
        {companyAvatar ? (
          <Image source={{ uri: companyAvatar }} style={notaryStyles.profileAvatar} />
        ) : (
          <View style={notaryStyles.profileAvatarFallback}>
            <AppText weight="bold" style={{ color: '#fff', fontSize: 12 }}>
              {companyInitials}
            </AppText>
          </View>
        )}
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
          ) : (
            <View style={notaryStyles.avatarGroup}>
              {companyAvatar ? (
                <Image source={{ uri: companyAvatar }} style={notaryStyles.miniAvatar} />
              ) : (
                <View style={[notaryStyles.miniAvatar, notaryStyles.miniAvatarFallback]}>
                  <AppText weight="bold" style={notaryStyles.miniAvatarText}>{companyInitials}</AppText>
                </View>
              )}
              {notaryAvatar ? (
                <Image source={{ uri: notaryAvatar }} style={[notaryStyles.miniAvatar, { marginLeft: -10 }]} />
              ) : (
                <View style={[notaryStyles.miniAvatar, notaryStyles.miniAvatarFallback, { marginLeft: -10 }]}>
                  <AppText weight="bold" style={notaryStyles.miniAvatarText}>{notaryInitials}</AppText>
                </View>
              )}
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
