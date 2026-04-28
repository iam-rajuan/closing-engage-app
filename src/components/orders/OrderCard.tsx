import { Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { CalendarDays, MapPin, UserRound } from 'lucide-react-native';
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
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <AppText variant="caption" muted style={styles.orderNumber}>
          ORDER {order.orderNumber.toUpperCase()}
        </AppText>
        <Badge label={order.status.toUpperCase()} tone={tone(order.status)} />
      </View>
      
      <AppText style={styles.clientName}>{order.clientName}</AppText>
      
      <View style={styles.metaRow}>
        <View style={styles.notaryInfo}>
          <UserRound size={13} color={colors.textMuted} />
          <AppText variant="caption" muted style={styles.notaryText}>
            Notary: {order.notaryName || 'Pending'}
          </AppText>
        </View>
        <AppText variant="caption" muted style={styles.dateText}>{order.signingDate}</AppText>
      </View>

      <Pressable 
        style={styles.detailsButton} 
        onPress={() => router.push(href)}
      >
        <AppText variant="caption" weight="bold" style={styles.buttonText}>
          VIEW DETAILS
        </AppText>
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  clientName: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: -2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  notaryInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  notaryText: { fontSize: 12.5 },
  dateText: { fontSize: 12.5 },
  detailsButton: {
    backgroundColor: '#f1f5f9',
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  buttonText: { color: colors.primary, fontWeight: '700', letterSpacing: 0.5 },
});
