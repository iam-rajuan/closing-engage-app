import { StyleSheet, Switch, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors, spacing } from '@/theme';

export function ToggleRow({ label, value = true }: { label: string; value?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText>{label}</AppText>
      <Switch value={value} trackColor={{ true: colors.primary, false: colors.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
});
