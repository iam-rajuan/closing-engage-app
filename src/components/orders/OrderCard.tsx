import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { MapPin, UserRound } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { colors, radius, spacing } from '@/theme';
import { Order, OrderStatus } from '@/types/order';

function tone(status: OrderStatus) {
  if (status === 'Completed' || status === 'Approved' || status === 'Submitted') return 'green';
  if (status === 'Under Review' || status === 'In Progress' || status === 'Pending Upload') return 'orange';
  return 'blue';
}

export function OrderCard({ order, href }: { order: Order; href: Href }) {
  // Mock notary avatar for better visuals as per Figma
  const notaryAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop';

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.orderIdBadge}>
          <AppText style={styles.orderIdText}>#{order.orderNumber.toUpperCase()}</AppText>
        </View>
        <Badge label={order.status.toUpperCase()} tone={tone(order.status)} />
      </View>
      
      <AppText style={styles.clientName}>{order.clientName}</AppText>
      
      <View style={styles.locationRow}>
        <MapPin size={14} color={colors.textMuted} />
        <AppText variant="caption" muted style={styles.locationText}>
          742 Evergreen Terrace, Springfield
        </AppText>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.notaryCol}>
          <View style={styles.notaryProfile}>
            <View style={styles.avatarPlaceholder}>
              <Image source={{ uri: notaryAvatar }} style={styles.avatar} />
            </View>
            <View>
              <AppText variant="caption" muted style={styles.roleLabel}>NOTARY</AppText>
              <AppText weight="bold" style={styles.notaryName}>{order.notaryName || 'Elena Rodriguez'}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.scheduleCol}>
          <AppText variant="caption" muted style={styles.roleLabel}>SCHEDULED</AppText>
          <AppText weight="bold" style={styles.scheduleDate}>{order.signingDate}</AppText>
        </View>
      </View>

      <Pressable 
        style={styles.detailsButton} 
        onPress={() => router.push(href)}
      >
        <AppText variant="caption" weight="bold" style={styles.buttonText}>
          View Details  ›
        </AppText>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { 
    padding: spacing.md, 
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 4,
  },
  orderIdBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderIdText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  clientName: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#1e293b',
    marginBottom: 2,
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
  },
  locationText: { 
    fontSize: 13,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  notaryCol: {
    flex: 1,
  },
  notaryProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  roleLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  notaryName: {
    fontSize: 13,
    color: '#334155',
  },
  scheduleCol: {
    alignItems: 'flex-end',
  },
  scheduleDate: {
    fontSize: 13,
    color: '#334155',
  },
  detailsButton: {
    backgroundColor: '#0a49a8', // Deep blue from Figma
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  buttonText: { 
    color: colors.white, 
    fontWeight: '700', 
    fontSize: 14,
  },
});
