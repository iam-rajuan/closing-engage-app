import { StyleSheet, View } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { colors, spacing } from '@/theme';
import { TimelineStep } from '@/types/order';

export function OrderStatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <AppCard style={styles.card}>
      <AppText weight="bold">Order Status</AppText>
      {steps.map((step) => (
        <View key={step.label} style={styles.row}>
          {step.done ? <CheckCircle2 color={colors.primary} size={18} /> : <Circle color={colors.textMuted} size={18} />}
          <View>
            <AppText weight="semibold">{step.label}</AppText>
            <AppText variant="caption" muted>{step.time}</AppText>
          </View>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
});
