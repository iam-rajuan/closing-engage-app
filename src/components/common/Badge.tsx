import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, tone = 'blue', style }: Props) {
  return (
    <View style={[styles.badge, styles[tone], style]}>
      <AppText variant="caption" weight="bold" style={styles[`${tone}Text`]}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  blue: { backgroundColor: colors.blueSoft },
  green: { backgroundColor: '#dcfce7' },
  orange: { backgroundColor: '#ffedd5' },
  red: { backgroundColor: '#fee2e2' },
  gray: { backgroundColor: colors.graySoft },
  blueText: { color: colors.primary },
  greenText: { color: colors.success },
  orangeText: { color: colors.warning },
  redText: { color: colors.danger },
  grayText: { color: colors.textMuted },
});
