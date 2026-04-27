import { StyleSheet, View } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

type Item = { label: string; value: number };

export function ProgressPipeline({ items }: { items: Item[] }) {
  return (
    <AppCard style={styles.card}>
      <AppText weight="bold">Order Status Pipeline</AppText>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={styles.row}>
            <AppText variant="caption" muted>{item.label}</AppText>
            <AppText variant="caption" weight="bold">{item.value}%</AppText>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${item.value}%` }]} />
          </View>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  item: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 6, borderRadius: radius.full, backgroundColor: colors.graySoft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.primary },
});
