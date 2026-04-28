import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ChevronRight, MapPin, UserRound } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { colors, shadows } from '@/theme';
import { Order, OrderStatus } from '@/types/order';

function tone(status: OrderStatus) {
  if (status === 'Completed' || status === 'Approved' || status === 'Submitted') return 'green';
  if (status === 'Under Review' || status === 'In Progress' || status === 'Pending Upload') return 'orange';
  return 'blue';
}

// Figma notary avatars
const NOTARY_AVATARS: Record<string, string> = {
  'Elena Rodriguez': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop',
  'Sarah Jenkins': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=128&auto=format&fit=crop',
};

export function OrderCard({ order, href }: { order: Order; href: Href }) {
  const notaryAvatar = order.notaryName ? NOTARY_AVATARS[order.notaryName] : undefined;
  const displayAddress = order.address || '742 Evergreen Terrace, Springfield';

  return (
    <AppCard style={styles.card}>
      {/* Row 1: Order # + Status badge */}
      <View style={styles.topRow}>
        <AppText style={styles.orderNum}>#{order.orderNumber.replace('#', '')}</AppText>
        <Badge label={order.status} tone={tone(order.status)} />
      </View>

      {/* Row 2: Client Name */}
      <AppText style={styles.clientName}>{order.clientName}</AppText>

      {/* Row 3: Location */}
      <View style={styles.locationRow}>
        <MapPin size={13} color="#94a3b8" />
        <AppText style={styles.locationText} numberOfLines={1}>{displayAddress}</AppText>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Row 4: Notary + Schedule */}
      <View style={styles.infoRow}>
        <View style={styles.notaryCol}>
          {notaryAvatar ? (
            <View style={styles.notaryAvatar}>
              <Image source={{ uri: notaryAvatar }} style={styles.avatarImg} />
            </View>
          ) : (
            <View style={[styles.notaryAvatar, styles.notaryAvatarPlaceholder]}>
              <UserRound size={14} color="#94a3b8" />
            </View>
          )}
          <View style={styles.notaryInfo}>
            <AppText style={styles.notaryLabel}>NOTARY</AppText>
            <AppText style={styles.notaryName}>
              {order.notaryName || 'Not Assigned'}
            </AppText>
          </View>
        </View>
        <View style={styles.scheduleCol}>
          <AppText style={styles.scheduleLabel}>SCHEDULED</AppText>
          <AppText style={styles.scheduleDate}>{order.signingDate}</AppText>
        </View>
      </View>

      {/* View Details Button */}
      <Pressable style={styles.detailsBtn} onPress={() => router.push(href)}>
        <AppText style={styles.detailsBtnText}>View Details</AppText>
        <ChevronRight size={15} color="#334155" />
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNum: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
    marginTop: -2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -2,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notaryCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  notaryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
  },
  notaryAvatarPlaceholder: {
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  notaryInfo: {
    gap: 2,
  },
  notaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  notaryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 17,
  },
  scheduleCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  scheduleLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  scheduleDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 17,
  },
  // Ghost button — matches Figma exactly
  detailsBtn: {
    backgroundColor: '#f1f5f9',
    height: 36,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 2,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
