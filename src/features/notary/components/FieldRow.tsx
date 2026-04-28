import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { styles } from '@/features/shared/styles/screenStyles';

export function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <AppText variant="caption" muted style={styles.fieldLabel}>{label}</AppText>
      <AppText style={styles.fieldValue}>{value}</AppText>
    </View>
  );
}
