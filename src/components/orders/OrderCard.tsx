import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Calendar, ChevronRight, MapPin, UserRound } from 'lucide-react-native';
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
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.cardPressable,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.card}>
        {/* Row 1: Order # + Status badge */}
        <View style={styles.topRow}>
          <View style={styles.orderIdWrap}>
            <AppText style={styles.orderNum} numberOfLines={1}>#{order.orderNumber.replace('#', '')}</AppText>
          </View>
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
            <View style={styles.scheduleLabelRow}>
              <Calendar size={10} color="#94a3b8" />
              <AppText style={styles.scheduleLabel}>SCHEDULED</AppText>
            </View>
            <AppText style={styles.scheduleDate}>{order.signingDate}</AppText>
          </View>
        </View>

        {/* View Details Button */}
        <View style={styles.detailsBtn}>
          <AppText style={styles.detailsBtnText}>View Details</AppText>
          <ChevronRight size={15} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardPressable: {
    borderRadius: 14,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8edf4',
    padding: 12,
    gap: 6,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdWrap: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
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
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    gap: 8,
    flex: 1,
  },
  notaryAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
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
  scheduleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
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
  // Refined CTA button
  detailsBtn: {
    backgroundColor: '#f0f5ff',
    height: 34,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#dce6f4',
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
