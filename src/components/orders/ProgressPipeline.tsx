import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { colors, radius } from '@/theme';

type Item = { label: string; value: number };
type Props = { items: Item[]; style?: ViewStyle };

export function ProgressPipeline({ items, style }: Props) {
  return (
    <AppCard style={[styles.card, style]}>
      <AppText style={styles.title}>Order Status Pipeline</AppText>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={styles.row}>
            {/* UPPERCASE labels as in Figma */}
            <AppText style={styles.label}>{item.label.toUpperCase()}</AppText>
            <AppText style={styles.pct}>{item.value}%</AppText>
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
  card: {
    gap: 14,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  item: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.4,
  },
  pct: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
