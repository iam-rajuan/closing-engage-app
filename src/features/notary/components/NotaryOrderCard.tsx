import { Image, Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ArrowRight, Calendar, ChevronRight, Info, MapPin } from 'lucide-react-native';
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

export function NotaryOrderCard({
  order,
  origin = 'assigned',
}: {
  order: Order;
  origin?: 'home' | 'assigned' | 'notifications';
}) {
  const user = useAuthStore((state) => state.user);
  const companyAvatar = order.companyAvatarUrl;
  const notaryAvatar = order.notaryAvatarUrl || user?.avatarUrl;
  const companyInitials = initialsFrom(order.companyName || order.clientName || 'Company');
  const notaryInitials = initialsFrom(order.notaryName || user?.name || user?.fullName || 'Notary');

  const isOpenOrder = Boolean(order.openForAll && !order.assignedNotaryId);

  const handlePress = () => {
    router.push({
      pathname: '/notary/assigned/[id]',
      params: { id: String(order.id).replace(/^#/, ''), from: origin },
    } as Href);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        { borderRadius: 14 },
        pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
      ]}
    >
      <AppCard style={notaryStyles.orderCard}>
        {/* Row 1: Order # + Status badge */}
        <View style={notaryStyles.orderTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={notaryStyles.orderIdWrap}>
              <AppText numberOfLines={1} style={notaryStyles.orderNum}>#{order.orderNumber.replace('#', '')}</AppText>
            </View>
            {typeof order.price === 'number' && order.price > 0 ? (
              <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#a7f3d0' }}>
                <AppText weight="bold" style={{ color: '#047857', fontSize: 11 }}>
                  ${order.price.toFixed(2)}
                </AppText>
              </View>
            ) : null}
          </View>
          <Badge
            label={isOpenOrder ? 'Signing Available' : order.status}
            tone={isOpenOrder ? 'blue' : getStatusTone(order.status)}
          />
        </View>

        {/* Row 2: Client Name */}
        <AppText style={notaryStyles.orderClientName}>{order.clientName}</AppText>

        {/* Row 3: Location */}
        <View style={notaryStyles.locationRow}>
          <MapPin size={13} color="#94a3b8" />
          <AppText style={notaryStyles.locationText} numberOfLines={1}>
            {order.location || order.address}
          </AppText>
        </View>

        {/* Divider */}
        <View style={notaryStyles.divider} />

        {/* Row 4: Info + Schedule */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            {companyAvatar ? (
              <Image source={{ uri: companyAvatar }} style={{ width: 32, height: 32, borderRadius: 8 }} />
            ) : (
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <AppText weight="bold" style={{ color: colors.primary, fontSize: 10 }}>{companyInitials}</AppText>
              </View>
            )}
            <View style={{ gap: 2 }}>
              <AppText style={{ fontSize: 9, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.6 }}>COMPANY</AppText>
              <AppText style={{ fontSize: 13, fontWeight: '600', color: '#334155', lineHeight: 17 }}>
                {order.companyName || 'Title Company'}
              </AppText>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Calendar size={10} color="#94a3b8" />
              <AppText style={{ fontSize: 9, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.6 }}>SCHEDULED</AppText>
            </View>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: '#334155', lineHeight: 17 }}>
              {order.signingDate}
            </AppText>
          </View>
        </View>

        {/* CTA Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <View style={{ flex: 1 }}>
            {order.status === 'Pending Upload' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Info size={14} color={colors.danger} />
                <AppText variant="caption" weight="bold" style={{ color: colors.danger }}>Action Required</AppText>
              </View>
            ) : isOpenOrder ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Info size={14} color={colors.primary} />
                <AppText variant="caption" weight="bold" style={{ color: colors.primary }}>First notary to accept wins</AppText>
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
          <View style={notaryStyles.viewDetailsBtn}>
            <AppText weight="bold" style={notaryStyles.viewDetailsText}>
              {isOpenOrder ? 'REVIEW & ACCEPT' : 'VIEW DETAILS'}
            </AppText>
            <ChevronRight size={15} color={colors.primary} />
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}
