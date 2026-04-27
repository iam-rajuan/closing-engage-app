import { Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { CalendarDays, MapPin, UserRound } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { colors, spacing } from '@/theme';
import { Order, OrderStatus } from '@/types/order';

function tone(status: OrderStatus) {
  if (status === 'Completed' || status === 'Approved' || status === 'Submitted') return 'green';
  if (status === 'Under Review' || status === 'In Progress' || status === 'Pending Upload') return 'orange';
  return 'blue';
}

export function OrderCard({ order, href }: { order: Order; href: Href }) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.top}>
        <View>
          <AppText weight="bold">{order.orderNumber}</AppText>
          <AppText variant="subtitle">{order.clientName}</AppText>
        </View>
        <Badge label={order.status.toUpperCase()} tone={tone(order.status)} />
      </View>
      <View style={styles.meta}>
        <MapPin size={15} color={colors.textMuted} />
        <AppText variant="caption" muted>{order.address}</AppText>
      </View>
      {order.notaryName ? (
        <View style={styles.meta}>
          <UserRound size={15} color={colors.textMuted} />
          <AppText variant="caption" muted>Notary: {order.notaryName}</AppText>
        </View>
      ) : null}
      <View style={styles.bottom}>
        <View style={styles.meta}>
          <CalendarDays size={15} color={colors.textMuted} />
          <AppText variant="caption" muted>{order.signingDate}</AppText>
        </View>
        <Pressable onPress={() => router.push(href)}>
          <AppText variant="caption" weight="bold" style={styles.link}>VIEW DETAILS</AppText>
        </Pressable>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  top: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  meta: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, flexShrink: 1 },
  bottom: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  link: { color: colors.primary },
});
